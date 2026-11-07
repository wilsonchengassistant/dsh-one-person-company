// `opc doctor` — health check for the company OS. Run it in CI and at the
// start of every working session. If this reports problems, the agents are
// operating on sand: missing specs, unowned work, tasks with no way to verify.
//
// The rule this file exists to enforce: a rule that lives only in prose is
// not a rule. Every rule in company/AGENTS.md that CAN be checked by a
// machine is checked here.

import { join } from 'node:path'
import { readdirSync } from 'node:fs'
import { read, exists, parseFrontmatter } from './util.mjs'
import { loadTasks, readyTasks, decorate, findCycles, STATUSES } from './board.mjs'
import { designScopeOf, mockupState } from './design.mjs'

const CORE_FILES = [
  ['AGENTS.md', 'workspace operating manual'],
  ['company/AGENTS.md', 'company operating rules'],
  ['company/charter.md', 'company charter'],
  ['company/roadmap.md', 'roadmap'],
  ['company/metrics.md', 'metrics the company watches'],
  ['company/budget.md', 'spend ceilings'],
  ['company/tasks/BOARD.md', 'the board rules'],
  ['company/playbooks/README.md', 'runbook index'],
  ['company/research/README.md', 'research index'],
  ['company/decisions/README.md', 'decision index'],
  ['.agent/checklists/definition-of-done.md', 'definition of done'],
  ['.agent/checklists/review.md', 'review checklist'],
  ['.agent/checklists/pre-ship.md', 'pre-ship checklist'],
]

/**
 * The four architecture diagrams. A solo company's most expensive failure mode
 * is architectural drift nobody noticed, and a diagram is the only artefact a
 * human can review in 30 seconds to see that the shape changed.
 */
const ARCHITECTURE_DOC = 'docs/architecture/README.md'

/** The four questions the document has to answer, as `## <heading>`. */
const ARCHITECTURE_SECTIONS = ['System', 'Backend', 'Frontend', 'Data']

/**
 * The design artefacts. A UI task without a mockup is an engineer guessing what
 * the customer will see, so the gate is a file that has to be there rather than
 * a promise in a prompt.
 */
const DESIGN_FILES = ['design/README.md', 'design/tokens.css']

const CORE_ROLES = [
  'researcher',
  'pm',
  'architect',
  'designer',
  'engineer',
  'qa',
  'devops',
  'support',
  'growth',
  'reviewer',
]

const ACTIVE_STATUSES = ['ready', 'in_progress', 'review']

/** The template ships a commented-out example; that is not a command. */
function hasRealCommand(block) {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
  return lines.length > 0
}

function globOverlap(a, b) {
  const norm = (p) => String(p).replace(/^\.\//, '').replace(/\/+$/, '')
  const x = norm(a)
  const y = norm(b)
  if (!x || !y) return false
  if (x === y) return true
  if (x.endsWith('/**') && y.startsWith(x.slice(0, -3))) return true
  if (y.endsWith('/**') && x.startsWith(y.slice(0, -3))) return true
  return false
}

export function doctor(root) {
  const errors = []
  const warnings = []
  const notes = []

  for (const [path, why] of CORE_FILES) {
    if (!exists(join(root, path))) errors.push(`missing ${path} (${why})`)
  }

  for (const path of DESIGN_FILES) {
    if (!exists(join(root, path))) {
      errors.push(`missing ${path} (design artefact — run node tooling/src/cli.mjs init)`)
    }
  }
  const uiGlobs = designScopeOf(root)
  if (uiGlobs === null) {
    errors.push('missing or unreadable company/design-scope.json — it lists the paths that need a mockup')
  }

  const architecturePath = join(root, ARCHITECTURE_DOC)
  if (!exists(architecturePath)) {
    errors.push(`missing ${ARCHITECTURE_DOC} (architecture diagrams — run node tooling/src/cli.mjs init)`)
  } else {
    const architecture = read(architecturePath)
    const diagrams = (architecture.match(/```mermaid/g) ?? []).length
    if (diagrams < ARCHITECTURE_SECTIONS.length) {
      errors.push(
        `${ARCHITECTURE_DOC}: has ${diagrams} mermaid diagram(s), expected at least ${ARCHITECTURE_SECTIONS.length} (System, Backend, Frontend, Data)`
      )
    }
    for (const section of ARCHITECTURE_SECTIONS) {
      if (!new RegExp(`^##\\s+${section}\\b`, 'm').test(architecture)) {
        errors.push(`${ARCHITECTURE_DOC}: missing the "## ${section}" section`)
      }
    }
  }

  const roleDir = join(root, '.agent', 'roles')
  const roleFiles = exists(roleDir)
    ? readdirSync(roleDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
    : []
  for (const role of CORE_ROLES) {
    if (!roleFiles.includes(role)) errors.push(`missing role charter .agent/roles/${role}.md`)
  }

  const specsDir = join(root, 'company', 'specs')
  const specs = new Map()
  if (exists(specsDir)) {
    for (const f of readdirSync(specsDir).filter((x) => x.endsWith('.md') && !/^README/i.test(x))) {
      const { data, body } = parseFrontmatter(read(join(specsDir, f)))
      specs.set(`company/specs/${f}`, { data, body })
    }
  }

  const tasks = decorate(loadTasks(root), root)

  // --- cycles, before anything that depends on the dependency graph --------
  for (const cycle of findCycles(tasks)) {
    errors.push(`dependency cycle: ${cycle.join(' -> ')}`)
  }

  // --- per-task checks ----------------------------------------------------
  for (const t of tasks) {
    const { body } = parseFrontmatter(read(t.path))

    if (t.unknownStatus) {
      errors.push(
        `${t.id}: status "${t.status}" is not one of ${STATUSES.join(', ')} — the task is invisible to the board`
      )
    }

    // The mockup gate: a task that writes a UI path must name a mockup that
    // exists. An engineer building a screen from prose is building a guess.
    if (t.status !== 'dropped') {
      const mockup = mockupState(t, uiGlobs, root)
      if (mockup === 'missing-field') {
        errors.push(`${t.id}: writes a UI path but declares no design: — a mockup in design/screens/ must exist first`)
      } else if (mockup === 'missing-file') {
        errors.push(`${t.id}: design ${t.design} does not exist`)
      }
    }

    if (!t.owner) {
      if (ACTIVE_STATUSES.includes(t.status)) {
        errors.push(`${t.id}: status ${t.status} with no owner`)
      } else {
        warnings.push(`${t.id}: no owner declared`)
      }
    } else if (/^agent:/.test(t.owner)) {
      const role = t.owner.slice('agent:'.length)
      if (!roleFiles.includes(role)) {
        errors.push(`${t.id}: owner role "${role}" has no charter at .agent/roles/${role}.md`)
      }
    } else if (!/^human:/.test(t.owner)) {
      warnings.push(`${t.id}: owner "${t.owner}" is neither agent:<role> nor human:<name>`)
    }

    if (!t.spec) {
      errors.push(`${t.id}: no spec linked — a task without a contract is a guess`)
    } else if (!t.specExists) {
      errors.push(`${t.id}: spec ${t.spec} does not exist`)
    } else {
      const spec = specs.get(t.spec) || { data: {}, body: '' }
      if (!/##\s*6\.\s*Acceptance criteria/.test(spec.body) || !/AC-\d/.test(spec.body)) {
        errors.push(
          `${t.id}: spec ${t.spec} has no testable acceptance criteria (need "## 6. Acceptance criteria" with AC-n lines)`
        )
      }
      if (t.specStatus !== 'approved' && ACTIVE_STATUSES.includes(t.status)) {
        errors.push(`${t.id}: status ${t.status} but spec ${t.spec} is "${t.specStatus}" — approve it or move the task back`)
      }
    }

    if (!/```sh/.test(body) || !/Verification/i.test(body)) {
      errors.push(`${t.id}: no Verification section with a runnable command`)
    } else {
      const block = /```sh\n([\s\S]*?)```/.exec(body)
      if (!block || !hasRealCommand(block[1])) {
        errors.push(`${t.id}: the Verification command block is empty or only comments`)
      } else if (!exists(join(root, 'package.json')) && /\b(pnpm|npm|yarn)\b/.test(block[1])) {
        warnings.push(
          `${t.id}: the verification command uses a package manager but there is no root package.json — it cannot run in this repo`
        )
      }
    }

    if (!/##\s*Acceptance criteria/i.test(body)) {
      errors.push(`${t.id}: no "## Acceptance criteria" section`)
    }
    if (!/##\s*Notes \/ handoff/i.test(body)) {
      warnings.push(`${t.id}: no "## Notes / handoff" section — the next role has nothing to read`)
    }

    if (t.status === 'blocked' && !/blocked on|blocked by|waiting on/i.test(body)) {
      warnings.push(`${t.id}: blocked but does not say what it is blocked on`)
    }
    // The board rule is "a task in _in_progress_ names its write scope" — not
    // "every task does". A ready or backlog task has not been started, and a
    // read-only role (the reviewer) never has one, so warning there is noise
    // that trains the founder to ignore the doctor.
    if ((t.status === 'in_progress' || t.status === 'review') && (!t.writes || !t.writes.length)) {
      errors.push(`${t.id}: status ${t.status} with no declared write scope`)
    }
    for (const d of t.deps) {
      if (!tasks.find((x) => x.id === d)) errors.push(`${t.id}: dependency ${d} does not exist`)
    }
  }

  // --- write-scope overlap -------------------------------------------------
  // "Overlapping writes from two agents at once are a bug, not a race."
  // Only tasks that can actually run at the same time matter: if one task
  // transitively depends on the other, they run in sequence and the overlap
  // is harmless.
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const reaches = (fromId, targetId) => {
    const seen = new Set()
    const stack = [...(byId.get(fromId)?.deps || [])]
    while (stack.length) {
      const id = stack.pop()
      if (id === targetId) return true
      if (seen.has(id)) continue
      seen.add(id)
      stack.push(...(byId.get(id)?.deps || []))
    }
    return false
  }
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const a = tasks[i]
      const b = tasks[j]
      if (a.status === 'done' || a.status === 'dropped' || b.status === 'done' || b.status === 'dropped') continue
      if (reaches(a.id, b.id) || reaches(b.id, a.id)) continue
      const aw = Array.isArray(a.writes) ? a.writes : a.writes ? [a.writes] : []
      const bw = Array.isArray(b.writes) ? b.writes : b.writes ? [b.writes] : []
      for (const p of aw) {
        for (const q of bw) {
          if (globOverlap(p, q)) {
            warnings.push(
              `${a.id} and ${b.id} can run at the same time and both write ${p} / ${q} — two agents on one path is a bug, not a race`
            )
          }
        }
      }
    }
  }
  for (const t of tasks) {
    const w = Array.isArray(t.writes) ? t.writes : t.writes ? [t.writes] : []
    for (const p of w) {
      if (p === '**' || p === '*' || p === './**') {
        warnings.push(`${t.id}: write scope "${p}" is the whole repository — that is not a scope`)
      }
    }
  }

  // --- acceptance-criteria coverage ---------------------------------------
  // Every AC-n in a spec must be owned by at least one task, or the spec is
  // quietly half-built.
  for (const [path, spec] of specs) {
    const acs = [...spec.body.matchAll(/AC-(\d+)/g)].map((m) => `AC-${m[1]}`)
    const unique = [...new Set(acs)]
    if (!unique.length) continue
    const allTasksText = tasks.map((t) => read(t.path)).join('\n')
    const owned = unique.filter((ac) => allTasksText.includes(ac))
    const orphans = unique.filter((ac) => !owned.includes(ac))
    if (orphans.length) {
      errors.push(
        `${path}: ${orphans.join(', ')} ${orphans.length === 1 ? 'is' : 'are'} not owned by any task`
      )
    }
  }

  // --- role coverage -------------------------------------------------------
  const ownedRoles = new Set(
    tasks.map((t) => (String(t.owner || '').startsWith('agent:') ? t.owner.slice(6) : '')).filter(Boolean)
  )
  const idleRoles = CORE_ROLES.filter((r) => !ownedRoles.has(r))
  if (idleRoles.length) {
    warnings.push(
      `no task on the board is owned by: ${idleRoles.join(', ')} — a role that owns nothing is a role nobody is running`
    )
  }

  // --- the roadmap is the only steering input ------------------------------
  const roadmapPath = join(root, 'company', 'roadmap.md')
  if (exists(roadmapPath)) {
    const roadmap = read(roadmapPath)
    const section = /##\s*Direction/i.test(roadmap) ? roadmap.split(/##\s*Direction/i)[1] : ''
    const placeholder = /not yet written/i.test(section)
    if (!section || placeholder || section.trim().length < 40) {
      warnings.push(
        'company/roadmap.md has no direction sentence — the agent team has no steering input this week'
      )
    }
  }

  // --- specs must point at the architecture -------------------------------
  for (const [path, spec] of specs) {
    if (!/docs\/architecture\//.test(spec.body)) {
      warnings.push(
        `${path}: technical notes do not reference docs/architecture/ — the reviewer cannot see which diagram this feature changes`
      )
    }
  }

  const ready = readyTasks(tasks)
  if (!tasks.length) notes.push('Board is empty — decompose the top spec into tasks.')
  if (tasks.length && !ready.length) {
    warnings.push('No task is ready: every task is blocked, missing a spec, or waiting on an unapproved spec.')
  }

  return {
    errors,
    warnings,
    notes,
    ready: ready.map((t) => t.id),
    total: tasks.length,
    rolesWithoutTasks: idleRoles,
  }
}

export function renderDoctor(result) {
  const out = []
  const icon = (n) => (n === 0 ? '✓' : '✗')
  out.push(`${icon(result.errors.length)} errors: ${result.errors.length}`)
  for (const e of result.errors) out.push(`   ✗ ${e}`)
  out.push(`${icon(result.warnings.length)} warnings: ${result.warnings.length}`)
  for (const w of result.warnings) out.push(`   ! ${w}`)
  if (result.notes.length) {
    out.push('notes:')
    for (const n of result.notes) out.push(`   · ${n}`)
  }
  out.push('')
  out.push(`tasks: ${result.total}   ready now: ${result.ready.length ? result.ready.join(', ') : 'none'}`)
  return out.join('\n')
}
