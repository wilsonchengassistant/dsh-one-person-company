// Every artefact the company OS produces comes from one of these templates.
// A template is the *contract* between roles: the engineer's acceptance
// criteria are written by the PM role, the QA role's checklist is derived from
// the same spec, and the reviewer role refuses anything missing a section.

export const specTemplate = (slug, title) => `---
id: SPEC-${slug.toUpperCase()}
title: ${title}
status: draft            # draft | approved | building | shipped | abandoned
owner: agent:pm
created: ${new Date().toISOString().slice(0, 10)}
spec_version: 1
---

# ${title}

## 1. Problem
<!-- Who hurts, how often, and what it costs them. No solution language here. -->

## 2. Why now
<!-- What changed: a platform, a regulation, a cost drop, a trend. -->

## 3. Users & jobs to be done
| User | Job | Success looks like |
|---|---|---|
| | | |

## 4. Scope
### In scope
- 
### Out of scope (explicitly)
- 

## 5. User stories
- As a \<role\>, I want \<capability\>, so that \<outcome\>.

## 6. Acceptance criteria
<!-- Each line must be objectively checkable. These become the test cases. -->
- [ ] AC-1: 
- [ ] AC-2: 

## 7. Non-functional requirements
- Performance: 
- Security & authz: 
- Data & privacy: 
- Accessibility: 
- Observability: 

## 8. Design
<!-- Filled by the designer role. Reference files under design/ rather than pasting. -->

## 9. Technical notes
<!-- Filled by the architect role. Link ADRs under company/decisions. -->

## 10. Open questions
- [ ] 

## 11. Definition of done
- [ ] Implementation merged behind a flag
- [ ] Unit + integration tests cover every AC
- [ ] QA sign-off recorded on the task
- [ ] Docs updated (README / help centre)
- [ ] Metrics + alerts for the new surface exist
- [ ] Rollback plan written
`

export const taskTemplate = (id, title, slug) => `---
id: ${id}
title: ${title}
status: ready            # backlog | ready | in_progress | review | done | blocked | dropped
owner:                    # agent:<role> or human:<name>
priority: P2              # P0 | P1 | P2 | P3
spec:                     # link to company/specs/<slug>.md
depends_on: []
writes: []                # advisory write scopes for this task
qa_signoff:               # who signed off the acceptance criteria
created: ${new Date().toISOString().slice(0, 10)}
updated: ${new Date().toISOString().slice(0, 10)}
---

# ${id} — ${title}

## Context
<!-- Why this task exists, and what "done" means. Link the spec. -->

## Deliverable
<!-- What artefact exists when this is finished: a file, an endpoint, a doc. -->

## Acceptance criteria
<!-- Copy the ACs this task implements. Use the exact string AC-n. Be specific. -->
- [ ] 

## Verification
<!-- The exact command that proves it works. This field is not optional. -->
\`\`\`sh
# e.g. node tooling/src/cli.mjs doctor
\`\`\`

## Notes / handoff
<!-- Anything the next role needs that the spec does not say. -->
`

export const adrTemplate = (id, title) => `# ${id} — ${title}

- **Status:** proposed | accepted | superseded by ADR-XXXX
- **Date:** ${new Date().toISOString().slice(0, 10)}
- **Deciders:** agent:architect, human:founder
- **Write scopes:** company/decisions/**, company/specs/**

## Context
<!-- The forces at play. What made this a real decision rather than an obvious default. -->

## Decision
<!-- The single sentence that says what we are doing. -->

## Alternatives considered
| Option | Why not |
|---|---|
| | |

## Consequences
- 
- 

## Revisit when
<!-- The signal that should make us reopen this. -->
`

export const researchTemplate = (title) => `# Research — ${title}

- **Question:** the decision this research is meant to inform
- **Owner:** agent:researcher
- **Date:** ${new Date().toISOString().slice(0, 10)}
- **Confidence:** low | medium | high

## Findings
<!-- Facts with sources. Separate "what we found" from "what we think". -->

## Evidence
| Claim | Source | Date | Confidence |
|---|---|---|---|

## Implications for the roadmap
- 

## What we could not verify
- 

## Recommendation
<!-- One paragraph. The human may overrule this. -->
`

export const incidentTemplate = (title) => `# Incident — ${title}

- **Severity:** SEV1 | SEV2 | SEV3
- **Started:** 
- **Resolved:** 
- **Owner:** agent:devops
- **Human paged:** yes | no

## Impact
<!-- Who was affected, how, for how long. Numbers, not adjectives. -->

## Timeline
| Time | Event |
|---|---|

## Root cause
<!-- Not "a config was wrong". Explain the system condition that allowed it. -->

## What hid it
<!-- Which signal should have caught this earlier? -->

## Action items
- [ ] 
`

export const releaseTemplate = (version) => `# Release ${version}

- **Date:** ${new Date().toISOString().slice(0, 10)}
- **Owner:** agent:devops
- **Approved by:** human:founder

## Contents
- 

## Verification
- [ ] Migrations applied (expand/contract)
- [ ] Smoke test on preview environment
- [ ] Rollback command tested
- [ ] Monitoring + alerts cover the new surface

## Rollback
\`\`\`sh
# exact command
\`\`\`

## Customer-facing notes
<!-- Only if something user-visible changed. -->
`

export const boardTemplate = `# Task board

The board is the single source of truth for *what is happening right now*.
It is regenerated from the markdown files in \`company/tasks/\` — never edited
by hand in a tracker that can drift away from the repo.

\`\`\`sh
node tooling/src/cli.mjs board            # table view
node tooling/src/cli.mjs board --ready    # only the tasks whose dependencies are met
node tooling/src/cli.mjs board --json     # machine readable
node tooling/src/cli.mjs doctor           # health check for everything below
\`\`\`

## Columns
| Column | Meaning | Who moves it |
|---|---|---|
| backlog | Specified but not yet decomposed | agent:pm |
| ready | Decomposed, dependencies met, safe to start | agent:pm |
| in_progress | An agent is working on it | the working agent |
| review | Waiting for the reviewer agent | agent:reviewer |
| done | Merged, verified, shipped | agent:devops |
| blocked | Waiting on a human or another team | agent:pm |
| dropped | Deliberately not doing (yet) | human:founder |

## Rules
These four rules are enforced by \`node tooling/src/cli.mjs doctor\`, not by
good intentions. If doctor reports an error, the board is lying.

1. **A task may not move to \`ready\` without a link to an approved spec.**
   Doctor errors when a task is active and its spec is missing or still a
   draft. \`board --ready\` only lists tasks whose spec is \`approved\`.

2. **A task may not move to \`done\` without a passing verification command.**
   Every task carries a \`Verification\` block with a runnable command, and the
   reviewer quotes the real output in the handoff note.

3. **A task in \`in_progress\` names its owner and its write scope.**
   A task with an unknown owner role, or with a write scope that overlaps
   another runnable task's scope, is reported.

4. **Only the human may move a task to \`dropped\`.**

## The loop
\`\`\`
research → spec → design → implement → test → review → ship → operate → support → learn
\`\`\`
Each arrow is a role in \`.agent/roles/\`. Each artefact lands in \`company/\`.
`

export const charterTemplate = (name) => `# ${name} — Company Charter

## What we do
<!-- One sentence. If it needs two, the company is two companies. -->

## For whom
<!-- The specific person who has this problem badly enough to pay. -->

## Why we win
<!-- The unfair advantage: distribution, speed, domain knowledge, cost. -->

## What we will never do
<!-- The lines that keep the agents honest when they try to optimise a metric. -->
- 

## Constraints the agents must respect
- No customer data leaves our infrastructure without an explicit rule.
- Every number in a report traces to a source.
- The agent may not spend money, sign anything, or talk to a customer without a human.
- Every change to production needs a rollback.

## Definition of a good week
- 

## Numbers we watch
| Metric | Target | Where |
|---|---|---|
| | | |
`
