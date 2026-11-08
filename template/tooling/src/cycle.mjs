// Where the project is, and what the next action is.
//
// The pipeline has seven stages and the board only knows about tasks, so the
// question a founder asks every morning is "what do I do next?". This answers it
// from the artefacts on disk rather than from memory.
//
// The same computation feeds two surfaces: the `opc cycle` CLI command and the
// sidebar panel, so they can never disagree about what stage you are at.

import { join } from 'node:path'
import { exists, read, listFiles, parseFrontmatter, hashBody } from './util.mjs'
import { doctor } from './doctor.mjs'
import { loadTasks, decorate, readyTasks } from './board.mjs'
import { designScopeOf, awaitingDesign, mockupState, approvalOf } from './design.mjs'

/**
 * @param {string} root - Project root (the directory containing `company/`).
 * @returns {{
 *   facts: object,
 *   stage: { n: number, title: string, detail: string, prompt: string, actor: 'human'|'agent' },
 * }}
 */
export function computeCycle(root) {
  const readIf = (rel) => {
    const path = join(root, rel)
    return exists(path) ? read(path) : ''
  }

  const charter = readIf('company/charter.md')
  // "Written" means the template has actually been filled in: the placeholder
  // title is gone and no `<!-- how to fill this -->` comments are left.
  const charterFilled =
    charter !== '' && !/^#\s*Untitled Company/m.test(charter) && !/<!--[^>]*-->/.test(charter)

  const specsDir = join(root, 'company', 'specs')
  const specs = (exists(specsDir) ? listFiles(specsDir, '.md').filter((f) => !/^README/i.test(f)) : []).map(
    (f) => {
      const { data } = parseFrontmatter(read(join(specsDir, f)))
      return { file: `company/specs/${f}`, status: data.status || 'unknown', title: data.title || f }
    }
  )
  const approved = specs.filter((s) => s.status === 'approved')
  const unapproved = specs.filter((s) => s.status !== 'approved')
  // An approved spec whose body no longer matches its approved hash: the
  // requirement moved, so the approval did not survive the move.
  const revised = approved.filter((spec) => {
    const { data, body } = parseFrontmatter(read(join(root, spec.file)))
    return data.approved_hash && data.approved_hash !== hashBody(body)
  })

  const tasks = decorate(loadTasks(root), root)
  const ready = readyTasks(tasks)
  const byStatus = (status) => tasks.filter((t) => t.status === status)
  const nextTask =
    ready.find((t) => t.priority === 'P0') || ready.find((t) => t.priority === 'P1') || ready[0] || null

  const uiGlobs = designScopeOf(root)
  const needsDesign = awaitingDesign(tasks, uiGlobs, root)
  const awaitingApproval = needsDesign.filter((t) => mockupState(t, uiGlobs, root) === 'unapproved')
  const unbuilt = needsDesign.filter((t) => mockupState(t, uiGlobs, root) !== 'unapproved')
  // A mockup the human explicitly rejected, with the note they left.
  const rejected = awaitingApproval
    .map((t) => ({ task: t, approval: approvalOf(root, t.design) }))
    .filter((entry) => entry.approval !== null && entry.approval.approved === false)

  // The checks come first. Offering "build the next task" while the company is
  // inconsistent is how a shortcut becomes the default.
  const report = doctor(root)

  const facts = {
    checks: { errors: report.errors.length, warnings: report.warnings.length },
    charterFilled,
    specs: { total: specs.length, approved: approved.length, unapproved: unapproved.length },
    tasks: {
      total: tasks.length,
      ready: ready.length,
      inProgress: byStatus('in_progress').length,
      review: byStatus('review').length,
      done: byStatus('done').length,
      blocked: byStatus('blocked').length
    },
    needsDesign: needsDesign.map((t) => t.id),
    nextTask: nextTask
      ? { id: nextTask.id, title: nextTask.title, owner: nextTask.owner || '', priority: nextTask.priority }
      : null
  }

  const walkthrough = 'playbook/12-the-full-cycle.md'

  // The first thing that is not done, in pipeline order.
  let stage
  if (report.errors.length > 0) {
    stage = {
      n: 0,
      title: 'Fix the checks first',
      detail: `${report.errors.length} thing(s) are inconsistent. Nothing else matters until they are fixed — ${report.errors[0]}`,
      actor: 'agent',
      prompt: `Run the one-person-company checks and fix everything they report, in order. The errors are: ${report.errors.slice(0, 8).join(' | ')}. Do not build anything, do not write application code: fix the company's artefacts — ownership, mockups, spec approvals, write scopes — and re-run the checks until there are no errors.`
    }
  } else if (!charterFilled) {
    stage = {
      n: 1,
      title: 'Write the charter',
      detail: 'Who hurts, what it costs them, why you win. Every later agent reads this first.',
      actor: 'agent',
      prompt:
        'Use the one-person-company skill. Ask me five questions — who this is for, what they do today, what the problem costs them, why now, and why they would pick me — then write company/charter.md. Do not write it before you have my answers.'
    }
  } else if (specs.length === 0) {
    stage = {
      n: 2,
      title: 'Write the first spec',
      detail: 'The contract. Numbered acceptance criteria a test could check.',
      actor: 'agent',
      prompt:
        'Read company/charter.md and playbook/05-quality.md. Write a spec in company/specs/ with the problem, scope in and out, 5-8 numbered AC-n acceptance criteria that a test could objectively check, and the non-functional requirements. Set status: draft. Do not write any implementation.'
    }
  } else if (revised.length > 0) {
    const first = revised[0]
    stage = {
      n: 2,
      title: 'Re-approve the spec — it changed after approval',
      detail: `${first.file} was edited after you approved it. A mockup review that changes the requirement is a change like any other: bump spec_version, say what changed and why, then approve it again.`,
      actor: 'agent',
      prompt: `The spec ${first.file} changed after it was approved. Do this in order: bump spec_version, add a row to its change log saying what changed and what caused it (a mockup review, a customer, a bug), recompute approved_hash over the body, set status back to approved, then re-check every task that references it — any task claiming an AC that no longer exists must be re-scoped before work continues. Do not change the implementation in this step.`
    }
  } else if (unapproved.length > 0 && revised.length === 0 && approved.length === 0) {
    stage = {
      n: 2,
      title: 'Approve a spec',
      detail: `Read ${unapproved[0]?.file ?? 'the spec'}. Every AC-n must be checkable without asking a question. Then approve it.`,
      actor: 'human',
      prompt:
        'I have read the spec and the acceptance criteria are fine. Set its status to approved.'
    }
  } else if (tasks.length === 0) {
    stage = {
      n: 3,
      title: 'Decompose the spec into tasks',
      detail: `Each task needs an owner, a write scope and a verification command that runs. Spec: ${approved[approved.length - 1].file}`,
      actor: 'agent',
      prompt:
        'Read the approved spec. Decompose it into tasks with `node tooling/src/cli.mjs new task`, each with an owner, a writes scope, any depends_on, and a verification command that actually runs. Then run `node tooling/src/cli.mjs doctor` — it must report 0 errors.'
    }
  } else if (unbuilt.length > 0) {
    const first = unbuilt[0]
    stage = {
      n: 4,
      title: 'Mock up the screens first',
      detail: `${first.id}: ${first.title} — a UI task with no mockup. The engineer builds the mockup, not a guess.`,
      actor: 'agent',
      prompt: `Take the designer role. For ${first.id} (${first.title}), read the spec and design/tokens.css, then copy design/screens/_template.html to design/screens/<name>.html and build the screen: the real copy, the primary action, and all four states (empty, loading, error, success). Use only tokens — no raw hex, no magic pixel numbers. Do not write application code. Then set design: design/screens/<name>.html on the task.`
    }
  } else if (rejected.length > 0) {
    const first = rejected[0]
    const note = first.approval?.note ? ` The note you left: "${first.approval.note}".` : ' No note was left.'
    stage = {
      n: 4,
      title: 'The mockup was rejected — decide what changed',
      detail: `${first.task.id}: ${first.task.design}.${note} Two outcomes, and they are different: a copy or layout fix is a new mockup; a requirement change starts at the spec.`,
      actor: 'agent',
      mockup: { file: String(first.task.design), taskId: first.task.id },
      prompt: `The human rejected the mockup ${first.task.design} for ${first.task.id}.${note} Ask me which kind of change it is, then act: (a) copy, layout or state fix — rebuild the mockup only; (b) the requirement itself changed — amend ${first.task.spec ?? 'the spec'}: bump spec_version, add a change-log row saying what changed and that a mockup review caused it, re-approve it, and re-scope any task whose acceptance criteria no longer match. Do not write application code.`
    }
  } else if (awaitingApproval.length > 0) {
    const first = awaitingApproval[0]
    stage = {
      n: 4,
      title: 'Approve the mockup',
      detail: `${first.id}: ${first.title} — ${first.design} exists but no human has approved it. Open it, play with the states, then approve it in this panel.`,
      actor: 'human',
      mockup: { file: String(first.design), taskId: first.id },
      prompt: `Open ${first.design} and review it: the real copy, the four states, the primary action, and whether it uses the tokens. Approve it in the Company board panel, or say what has to change before the engineer starts ${first.id}.`
    }
  } else if (byStatus('review').length > 0) {
    const first = byStatus('review')[0]
    stage = {
      n: 6,
      title: 'Review what is finished',
      detail: `${first.id}: ${first.title}`,
      actor: 'agent',
      prompt: `You are the reviewer. Read the diff for ${first.id} and its spec. Check every acceptance criterion. Did anything get added that the spec did not ask for? Is anything claimed that the diff does not support? Check docs/architecture against the change. Cite file:line. Answer with one word: approve, request changes, or escalate.`
    }
  } else if (ready.length > 0) {
    stage = {
      n: 5,
      title: 'Build the next task',
      detail: `${nextTask.id}: ${nextTask.title}`,
      actor: 'agent',
      prompt: `Read the context pack for ${nextTask.id} and do that task. Change only paths inside the declared write scope; if you need another path, stop and say so. Run the verification command from the task and paste its real output. If the spec is not approved or the write scope is wrong, stop.`
    }
  } else if (byStatus('in_progress').length > 0) {
    const first = byStatus('in_progress')[0]
    stage = {
      n: 5,
      title: 'Nothing is startable, and something is in progress',
      detail: `${first.id}: ${first.title}. Finish it, or clear the dependency that blocks the board.`,
      actor: 'agent',
      prompt: `Continue ${first.id}: ${first.title}. If it is blocked, say exactly what it is blocked on and file that as a task. Otherwise finish it, run the verification command, and paste the real output.`
    }
  } else if (byStatus('blocked').length > 0) {
    const first = byStatus('blocked')[0]
    stage = {
      n: 5,
      title: 'Something is blocked',
      detail: `${first.id}: ${first.title}. Unblock it, or drop it.`,
      actor: 'human',
      prompt: `Look at ${first.id} and decide: unblock it, re-scope it, or drop it.`
    }
  } else {
    stage = {
      n: 7,
      title: 'Ship, then operate',
      detail: 'Nothing is left to build. Deploy what is done, then read the metrics, write ONE direction sentence into company/roadmap.md, and delete one thing.',
      actor: 'human',
      prompt:
        'Read company/metrics.md and summarise what changed this week. Then ask me for one direction sentence to write into company/roadmap.md.'
    }
  }

  return { facts, stage: { ...stage, walkthrough } }
}
