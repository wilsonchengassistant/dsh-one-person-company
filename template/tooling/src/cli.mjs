#!/usr/bin/env node
// opc — the operating system for a one-person company.
// Everything a solo founder normally does with a PM, an architect, a QA lead
// and a support team, reduced to files, rules and a board that agents can read.
//
//   opc init                     scaffold the company OS
//   opc new spec "title"         create a feature spec
//   opc new task "title"         create a task linked to a spec
//   opc new adr | research | incident | release
//   opc board [--ready|--json]    the task board
//   opc pack T-0001              context pack for one task
//   opc doctor                    health check
//   opc roles                     list roles
//
// No dependencies. Node >= 18.

import { join, dirname } from 'node:path'
import {
  repoRoot, read, write, exists, listFiles, parseFrontmatter,
  stringifyFrontmatter, slugify, today, nextTaskId,
} from './util.mjs'
import {
  specTemplate, taskTemplate, adrTemplate, researchTemplate,
  incidentTemplate, releaseTemplate, boardTemplate, charterTemplate,
} from './templates.mjs'
import { ROLES, FOUNDER_GATES } from './roles.mjs'
import { loadTasks, renderBoard, boardSummary, decorate } from './board.mjs'
import { buildContextPack } from './context.mjs'
import { doctor, renderDoctor } from './doctor.mjs'

const argv = process.argv.slice(2)
const cmd = argv[0]

/**
 * Proper argv parser. The previous ad-hoc version let flag values leak into
 * the title, which produced task names like
 * "CSV export endpoint --spec --owner --priority".
 */
function parseArgs(list) {
  const pos = []
  const flags = {}
  for (let i = 0; i < list.length; i++) {
    const a = list[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = list[i + 1]
      if (next === undefined || next.startsWith('--')) flags[key] = true
      else {
        flags[key] = next
        i++
      }
      continue
    }
    pos.push(a)
  }
  return { pos, flags }
}

function flag(name, fallback = undefined) {
  const { flags } = parseArgs(argv)
  return name in flags ? flags[name] : fallback
}

function renderRole(role) {
  const lines = []
  lines.push(`# ${role.name} — ${role.title}`)
  lines.push('')
  lines.push(`> ${role.mandate}`)
  lines.push('')
  lines.push('## Reads')
  for (const r of role.reads) lines.push(`- ${r}`)
  lines.push('')
  lines.push('## Writes')
  for (const w of role.writes) lines.push(`- ${w}`)
  lines.push('')
  lines.push('## Never')
  for (const n of role.never) lines.push(`- ${n}`)
  lines.push('')
  lines.push('## Done means')
  for (const d of role.done) lines.push(`- [ ] ${d}`)
  lines.push('')
  lines.push('## How you work')
  lines.push('1. Read the context pack for your task before touching anything.')
  lines.push('2. If the contract is missing or ambiguous, stop and ask the role that owns it. Do not guess.')
  lines.push('3. Work only inside your declared write scope. If the task needs another path, say so in the handoff.')
  lines.push('4. Run the verification command. Quote its real output. Never describe a command you did not run.')
  lines.push('5. Leave the handoff note: what changed, what you assumed, what you could not finish.')
  lines.push('')
  lines.push('## Escalate to the founder when')
  for (const g of FOUNDER_GATES) lines.push(`- ${g}`)
  lines.push('')
  return lines.join('\n')
}

const doneChecklist = `# Definition of done

A task is done when **all** of these are true. The reviewer role checks them
mechanically; a task that fails any line goes back with the failing line quoted.

A line that cannot be checked mechanically is a line that should be rewritten
until it can be.

## Contract
- [ ] The task links to an **approved** spec (the doctor enforces this).
- [ ] Every acceptance criterion the task owns is implemented.
- [ ] No acceptance criterion in scope was quietly dropped or redefined.
- [ ] The \`qa_signoff\` field on the task names who checked the criteria.

## Code
- [ ] The verification command in the task passes, and the output is quoted in the handoff.
- [ ] Tests exist for the new behaviour and would fail without it (mutation check: break the feature, the test goes red).
- [ ] No file outside the task's write scope was modified.
- [ ] No dependency was added that the project does not already need, and no dependency name was invented.
- [ ] No secret, key, token, or customer data is committed.

## Quality
- [ ] Error paths exist and are handled (no silent catch, no empty catch).
- [ ] The change is readable by a stranger in six months: no clever code, no commented-out blocks.
- [ ] Accessibility basics hold for anything user-facing.
- [ ] Lint and typecheck pass.

## Operations
- [ ] The change is behind a flag if it is user-visible and reversible.
- [ ] A rollback path exists, is written down, **and has been executed at least once** — with the output pasted into the release note.
- [ ] Logs, metrics, or alerts cover the new behaviour, and every new alert has a runbook.

## Communication
- [ ] The handoff note states what changed, what was assumed, and what was left out.
- [ ] User-visible changes have copy written for them.
`

const reviewChecklist = `# Review checklist

The reviewer role is the one agent whose job is to disagree. It reads the diff,
the spec, and the verification output, and returns exactly one of:
**approve** / **request changes** / **escalate to founder**.

## Correctness
- [ ] Does the change do what the spec says, and only what the spec says?
- [ ] Is every acceptance criterion in scope demonstrably satisfied?
- [ ] What breaks at the edges: empty, one, many, concurrent, huge, negative, unicode?
- [ ] Is there a path where the code silently does nothing?

## Trust
- [ ] Was the verification command actually run? Is the quoted output consistent with the diff?
- [ ] Were any claims made that the diff does not support?
- [ ] Does the handoff note admit what was skipped?

## Security & data
- [ ] No secret or customer data in the diff, logs, or fixtures.
- [ ] Authz checked on every new path, not just authn.
- [ ] Input validated at the boundary; no string-concatenated SQL, no unescaped HTML.

## Blast radius
- [ ] What else does this touch? List it.
- [ ] Is it reversible? How, in one command?
- [ ] Does it need a migration? Is it expand/contract?

## Substance
- [ ] Is this the simplest thing that satisfies the spec?
- [ ] Does it introduce a dependency, a service, or an abstraction that has no second use yet?
`

const preShipChecklist = `# Pre-ship checklist

Run before the first customer sees a change, and before any risky release.

## Product
- [ ] The user can complete the whole job end to end, not just the happy path.
- [ ] Empty, loading, error, and success states exist and read well.
- [ ] The copy is written by a human-sounding person, not a template.

## Technical
- [ ] Migrations applied using expand/contract, and the rollback command tested.
- [ ] Feature flag defaults to off for anything risky.
- [ ] Preview environment build passed and was clicked through.
- [ ] Error tracking, uptime check, and the key metric are live.

## Business
- [ ] Pricing page and invoices match reality.
- [ ] Terms and privacy policy reflect what the product actually does.
- [ ] Support inbox, docs, and status page are ready.

## Founder only
- [ ] You personally clicked through the product on a real device.
- [ ] You know exactly how to turn it off if it misbehaves.
`

const companyAgents = `# Company operating rules

These rules apply to every agent that works in this repository, in every tool.
They are short on purpose: long rules get ignored.

## 1. The spec is the contract
No work starts without an approved spec. If the task is unclear, the answer is
not a better guess — it is a question to the role that owns that decision.

## 2. Write scopes are real
Each task declares the paths it may touch. Stay inside them. If the task needs
more, say so in the handoff and let the PM re-scope it. Overlapping writes from
two agents at once are a bug, not a race.

## 3. Never claim what you did not verify
Run the command. Quote the real output. "Tests pass" without the output is a
false statement, and this company does not ship false statements.

## 4. Small, boring, reversible
Prefer the simplest design that satisfies the spec. New service, new datastore,
new queue: only when the current one demonstrably cannot cope. Every change
must have a rollback that is written down and tested.

## 5. The board is the truth
Status lives in the task files, not in anyone's head. If work happened, the
file says so.

## 6. Evidence over vibes
Research claims carry a source and a date. Metrics carry a query. Opinions are
labelled as opinions.

## 7. The human holds the dangerous keys
Spending, contracts, production data, customer communication and public
launches need a human. Everything else is yours to decide.

## 8. Leave the place better
Update the doc you relied on. Remove the thing you just replaced. A company
run by agents rots faster than one run by people, because nobody gets tired of
their own mess.
`

const workspaceAgents = `# Workspace operating manual

This repository is the operating system of a one-person company. A single human
runs it; a team of AI agents does the work.

## Read this first
1. \`company/charter.md\` — what this company is for and what it will never do.
2. \`company/AGENTS.md\` — the operating rules for every agent.
3. \`playbook/\` — the full guide: how the team is organised and how work flows.

## The loop
\`\`\`
research → spec → design → implement → test → review → ship → operate → support → learn
\`\`\`
Each arrow is a role in \`.agent/roles/\`. Each artefact lands in \`company/\`.

## The tools
\`\`\`sh
node tooling/src/cli.mjs doctor     # health check
node tooling/src/cli.mjs board      # what is happening now
node tooling/src/cli.mjs pack T-0001 # everything one agent needs to start
\`\`\`

## Ground rules for agents
- Stay inside the task's declared write scope.
- Do not start a task whose spec is not approved.
- Run the verification command and quote its output.
- Escalate money, contracts, customer communication and production data to the human.
`

const roadmap = `# Roadmap

## Direction
<!-- The ONE steering input the agent team gets. The founder rewrites this
     sentence every week. Keep it to one sentence and make it specific. -->

_Not yet written. Until this sentence exists, the agent team has no direction
and the doctor will say so._

## Now (this month)
- [ ] 

## Next (this quarter)
- [ ] 

## Later (someday, maybe)
- [ ] 

## Explicitly not doing
- 
`

const metrics = `# Metrics

The company watches a small number of numbers. If a metric is not on this page,
nobody should be building a dashboard for it.

| Metric | Target | Source | Cadence |
|---|---|---|---|
| Weekly active users | | product analytics | weekly |
| Activation (signup → first value) | | product analytics | weekly |
| Paid conversion | | billing | monthly |
| MRR | | billing | monthly |
| Churn | | billing | monthly |
| Gross margin | | billing + infra | monthly |
| Open support tickets | | support inbox | daily |
| Median first response | | support inbox | weekly |
| Deploy frequency | | git history | weekly |
| Change failure rate | | incidents + deploys | weekly |
| AI cost per task | | agent logs | weekly |
| Agent budget used this month | | billing | monthly |

## Review ritual
Every week, the founder spends 30 minutes reading this table and writing one
sentence in \`company/roadmap.md\` about what it means. That sentence is the
only steering input the agent team gets.
`

const budget = `# Budget

Money is the constraint that makes "one person" real. Set ceilings before the
agents start, not after.

## Monthly ceilings (EUR)

| Bucket | Ceiling | What it covers |
|---|---|---|
| Model / agent API | 400 | inference for the agent team |
| Coding-agent subscriptions | 200 | seat licences for coding tools |
| Infrastructure | 150 | hosting, database, storage, email, CDN |
| Third-party SaaS | 150 | auth, billing, monitoring, support, analytics |
| Marketing | 200 | ads, domains, sponsorships |
| Legal & accounting | 200 | incorporation, tax, contracts, bookkeeping |
| **Total** | **1300** | |

## Rules
1. Hard ceilings, not targets. Exceeding a ceiling is an incident, not a surprise.
2. Infrastructure must scale with revenue: the infra bill stays under 15% of MRR.
3. Every new paid service needs a named owner and a review date.
4. Model spend is reviewed weekly against the token estimate in \`opc budget\`.
`

const decisionsReadme = `# Architecture decision records

One file per decision that is expensive to reverse.

Template: \`opc new adr "Title"\`

Index:

| ADR | Title | Status | Date |
|---|---|---|---|
`

const specsReadme = `# Feature specs

The contract between product, design, engineering and QA.

Template: \`opc new spec "Title"\`

A spec is approved when the PM role has written acceptance criteria that a QA
agent can turn into failing tests without asking a question.
`

const tasksReadme = `# Tasks

Every task is a file here. The board is derived from these files.

Template: \`node tooling/src/cli.mjs new task "Title" --spec company/specs/<file>.md\`

Fields that matter:

- \`status\` — backlog | ready | in_progress | review | done | blocked | dropped
- \`owner\` — \`agent:<role>\` or \`human:<name>\`
- \`spec\` — the contract; required before "ready"
- \`writes\` — the paths this task may touch
- \`depends_on\` — task ids
- \`qa_signoff\` — who signed off the acceptance criteria

Task files must be named \`T-NNNN-<slug>.md\`. The board only loads files
that start with \`T-\`, so \`README.md\` and \`BOARD.md\` can live here too.
`

const playbooksReadme = `# Runbooks

Operational procedures. The \`devops\` role owns this directory; the \`support\`
role owns \`support-answers.md\`.

These exist so that the machine can act without you and so that you do not
have to remember. If a procedure is only in your head, it is not a runbook.

## Rules for runbooks

1. **One page.** If it needs more, it is a document, not a runbook.
2. **Every step is a command**, not an instruction.
3. **Every runbook names what "done" looks like.**
4. **Every runbook says who may run it.** The agent, or only the human.
5. If it is not written here, the agent may not do it — and neither should
   you, at 3am.
`

const researchReadme = `# Research briefs

Evidence the company decided things with. Each brief carries a source URL and
a date on every claim, separates "found" from "inferred", and states what
could not be verified.
`

function init(root) {
  const created = []
  const put = (path, content) => {
    const full = join(root, path)
    if (exists(full)) return
    write(full, content)
    created.push(path)
  }

  put('AGENTS.md', workspaceAgents)
  put('company/AGENTS.md', companyAgents)
  put('company/charter.md', charterTemplate('Untitled Company'))
  put('company/roadmap.md', roadmap)
  put('company/metrics.md', metrics)
  put('company/budget.md', budget)
  put('company/decisions/README.md', decisionsReadme)
  put('company/specs/README.md', specsReadme)
  put('company/tasks/README.md', tasksReadme)
  put('company/tasks/BOARD.md', boardTemplate)
  put('company/playbooks/README.md', playbooksReadme)
  put('company/research/README.md', researchReadme)
  put('.agent/checklists/definition-of-done.md', doneChecklist)
  put('.agent/checklists/review.md', reviewChecklist)
  put('.agent/checklists/pre-ship.md', preShipChecklist)

  for (const role of ROLES) {
    put(`.agent/roles/${role.name}.md`, renderRole(role))
  }

  if (!created.length) {
    console.log('Company OS already initialised. Nothing changed.')
    return
  }
  console.log(`Initialised company OS at ${root}`)
  console.log(`Created ${created.length} file(s):`)
  for (const c of created) console.log(`  + ${c}`)
  console.log('\nNext: edit company/charter.md — it is the first thing every agent reads.')
}

function newSpec(root, title) {
  if (!title) throw new Error('Usage: opc new spec "Title"')
  const slug = slugify(title)
  const path = join(root, 'company', 'specs', `${today()}-${slug}.md`)
  write(path, specTemplate(slug, title))
  console.log(`Created ${path.replace(root + '/', '')}`)
  console.log(`Link tasks to it with: opc new task "..." --spec company/specs/${today()}-${slug}.md`)
}

function newTask(root, title, opts = {}) {
  if (!title) throw new Error('Usage: opc new task "Title" [--spec path] [--owner agent:x] [--priority P1]')
  const tasks = decorate(loadTasks(root))
  const id = nextTaskId(tasks)
  const slug = slugify(title)
  const path = join(root, 'company', 'tasks', `${id}-${slug}.md`)
  const body = taskTemplate(id, title, slug)
  write(path, body)
  // patch frontmatter with the provided options
  const { data, body: b } = parseFrontmatter(read(path))
  if (opts.spec) data.spec = opts.spec
  if (opts.owner) data.owner = opts.owner
  if (opts.priority) data.priority = opts.priority
  if (opts.depends) data.depends_on = String(opts.depends).split(',').map((s) => s.trim()).filter(Boolean)
  if (opts.writes) data.writes = String(opts.writes).split(',').map((s) => s.trim()).filter(Boolean)
  write(path, stringifyFrontmatter(data, b))
  console.log(`Created ${path.replace(root + '/', '')}`)
}

function newFile(root, kind, title) {
  const map = {
    adr: ['company/decisions', (t) => adrTemplate(`ADR-${slugify(t).toUpperCase().slice(0, 8)}`, t)],
    research: ['company/research', (t) => researchTemplate(t)],
    incident: ['company/playbooks', (t) => incidentTemplate(t)],
    release: ['company/playbooks', (t) => releaseTemplate(t)],
  }
  const entry = map[kind]
  if (!entry) throw new Error(`Unknown artefact type: ${kind}`)
  const [dir, tpl] = entry
  const path = join(root, dir, `${today()}-${slugify(title)}.md`)
  write(path, tpl(title))
  console.log(`Created ${path.replace(root + '/', '')}`)
}

function showBoard(root, opts) {
  const tasks = decorate(loadTasks(root), root)
  if (opts.json) {
    console.log(JSON.stringify(tasks, null, 2))
    return
  }
  console.log(renderBoard(tasks, { ready: Boolean(opts.ready) }))
  if (!opts.ready) {
    const s = boardSummary(tasks)
    console.log('')
    console.log(`total ${s.total}  ready ${s.ready}  in_progress ${s.counts.in_progress}  blocked ${s.counts.blocked}  done ${s.counts.done}`)
  }
}

/**
 * `opc budget` — show the spend ceilings the founder set, and how much of
 * each is spent. The file is the instrument; this command only reads it.
 */
function showBudget(root) {
  const path = join(root, 'company', 'budget.md')
  if (!exists(path)) {
    console.error('opc: company/budget.md does not exist — run `node tooling/src/cli.mjs init` first.')
    process.exitCode = 1
    return
  }
  const text = read(path)
  const rows = []
  for (const line of text.split('\n')) {
    if (!/^\|/.test(line)) continue
    const cells = line.split('|').slice(1, -1).map((c) => c.trim())
    if (cells.length < 3) continue
    if (/^-+$/.test(cells[0].replace(/\s/g, ''))) continue
    if (/bucket/i.test(cells[0])) continue
    if (/^\*?\*?total/i.test(cells[0])) continue
    rows.push(cells)
  }
  if (!rows.length) {
    console.log('company/budget.md has no ceiling table yet. Fill in the "Monthly ceilings" table.')
    return
  }
  console.log('Monthly ceilings (from company/budget.md)\n')
  console.log('  ' + 'BUCKET'.padEnd(30) + 'CEILING'.padEnd(12) + 'ACTUAL')
  let total = 0
  for (const [bucket, ceiling] of rows) {
    const n = Number(String(ceiling).replace(/[^\d.]/g, ''))
    if (Number.isFinite(n)) total += n
    console.log('  ' + bucket.padEnd(30) + String(ceiling).padEnd(12))
  }
  console.log('')
  console.log(`  total ceiling: ${total}`)
  console.log('')
  console.log('  Fill the "Last updated / actual spend" section of company/budget.md by hand —')
  console.log('  this command reads the ceilings, it does not fetch anything from a provider.')
}

function showPack(root, id, opts) {
  const roles = String(opts.roles || 'owner,reviewer').split(',').map((s) => s.trim()).filter(Boolean)
  console.log(buildContextPack(root, id, { roles }))
}

function showDoctor(root) {
  const result = doctor(root)
  console.log(renderDoctor(result))
  if (result.errors.length) process.exitCode = 1
}

function showRoles(root) {
  console.log('Roles in this company:\n')
  for (const r of ROLES) {
    const p = join(root, '.agent', 'roles', `${r.name}.md`)
    console.log(`  ${r.name.padEnd(12)} ${exists(p) ? '' : '(not initialised) '}${r.title}`)
  }
  console.log('\nFounder gates (a human must approve these):')
  for (const g of FOUNDER_GATES) console.log(`  - ${g}`)
}

function usage() {
  console.log(`opc — operating system for a one-person company

  opc init                        scaffold the company OS
  opc new spec "Title"            create a feature spec
  opc new task "Title"            create a task  (--spec path --owner agent:x --priority P1 --writes "a/**,b/**")
  opc new adr "Title"             architecture decision record
  opc new research "Title"        research brief
  opc new incident "Title"        incident report
  opc new release v1.2.0          release note
  opc board [--ready|--json]       the task board
  opc budget                     the spend ceilings from company/budget.md
  opc pack T-0001 [--roles owner,reviewer]
  opc doctor                      health check
  opc roles                       list roles and founder gates

If "opc" is not on your PATH, use the same command as:
  node tooling/src/cli.mjs <command>
or install the shortcut once with:
  npm link                        # then "opc" works anywhere`)
}

try {
  const root = repoRoot()
  switch (cmd) {
    case 'init': init(root); break
    case 'new': {
      const kind = argv[1]
      const { pos, flags } = parseArgs(argv.slice(2))
      const title = pos.join(' ')
      if (kind === 'spec') newSpec(root, title)
      else if (kind === 'task') newTask(root, title, {
        spec: flags.spec, owner: flags.owner, priority: flags.priority,
        depends: flags.depends, writes: flags.writes,
      })
      else newFile(root, kind, title)
      break
    }
    case 'board': showBoard(root, { ready: flag('ready'), json: flag('json') }); break
    case 'budget': showBudget(root); break
    case 'pack': showPack(root, argv[1], { roles: flag('roles') }); break
    case 'doctor': showDoctor(root); break
    case 'roles': showRoles(root); break
    case undefined:
    case 'help':
    case '--help': usage(); break
    default:
      console.error(`Unknown command: ${cmd}`)
      usage()
      process.exitCode = 1
  }
} catch (err) {
  console.error(`opc: ${err.message}`)
  process.exitCode = 1
}
