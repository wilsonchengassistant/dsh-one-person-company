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
- Architecture: \`docs/architecture/README.md#system\` — which boxes and arrows this feature changes
- Data: \`docs/architecture/README.md#data\` — which tables this feature adds or alters
- ADRs: 

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
design:                   # UI tasks only: design/screens/<name>.html
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

// ---------------------------------------------------------------------------
// Architecture artefacts.
//
// Four Mermaid files, not images: they diff in git, render on GitHub, and an
// agent can read one in about 60 lines instead of reading the repository. The
// point is that a human can review "did the system change shape?" in 30
// seconds — the one thing prose and ADRs cannot give you.
// ---------------------------------------------------------------------------

export const architectureReadme = `# Architecture

Four diagrams, in one file. They are **text**, on purpose: they diff in git,
GitHub renders them, and an agent can read the whole thing in about 90 lines
instead of reading the repository.

The point is that a human can answer *"did the system change shape?"* in 30
seconds. Prose and ADRs cannot give you that.

| Section | Answers |
|---|---|
| [System](#system) | What are the moving parts, and what talks to what? |
| [Backend](#backend) | What is the request path, and which module owns each step? |
| [Frontend](#frontend) | What screens exist, and which endpoint does each call? |
| [Data](#data) | What are the tables, and how are they joined? |

## The rules

1. **A diagram that does not match the code is worse than no diagram.** When a
   task adds or removes a component, a table, a route or a third party, the same
   task updates this file. It is part of the definition of done.
2. **These are not auto-generated.** Anything derived from code goes stale the
   moment the code changes and nobody notices. They are owned artefacts: the
   \`architect\` role writes them, the \`reviewer\` role checks them against the
   diff.
3. **One diagram per question.** If \`## System\` needs a legend to be read, it is
   two diagrams.
4. **Name the real things.** The names here are the names in the code and in the
   ADRs. \`api\`, not "The Application Layer".

## Reviewing a change

Open \`## System\`. Ask: did this change add a box, remove a box, or add an
arrow? If yes, this file had to change in the same commit. If it did not change
and the system's shape did, the change is not done.

## System

\`\`\`mermaid
%% What the moving parts are and what talks to what. Keep this to the containers
%% a person would draw on a whiteboard; anything smaller belongs under Backend.
flowchart LR
  user([User])

  subgraph client["Clients"]
    web["<b>web</b><br/>Next.js on Vercel"]
    mobile["<b>mobile</b><br/>Expo / React Native"]
  end

  subgraph server["Our server"]
    api["<b>api</b><br/>the only public entry point"]
    worker["<b>worker</b><br/>background jobs"]
    db[("<b>postgres</b><br/>data + queue")]
    storage[("<b>object store</b><br/>private files")]
  end

  subgraph third["Third parties"]
    billing["Stripe"]
    mail["Email"]
  end

  user --> web
  user --> mobile
  web --> api
  mobile --> api
  api --> db
  api --> storage
  api --> worker
  worker --> db
  worker --> storage
  api --> billing
  worker --> mail

  classDef ours fill:#eef6ff,stroke:#3b82f6,color:#0b3b6f
  classDef data fill:#f4f4f5,stroke:#71717a,color:#27272a
  class api,worker,web,mobile ours
  class db,storage data
\`\`\`

## Backend

\`\`\`mermaid
%% The request path and which module owns each step. Every box here is a
%% directory or a named module in the repository.
flowchart TD
  req([HTTP request])
  auth{authenticated, scoped to owner?}
  validate["input validation<br/>(schema at the boundary)"]
  handler["<b>module handler</b><br/>one module per resource"]
  usecase["use case<br/>the business rule, no I/O"]
  repo["repository<br/>the only place with SQL"]
  queue["enqueue a job<br/>(if the work is slow or external)"]
  resp([response])

  req --> auth
  auth -- rejected --> reject([401 / 404])
  auth --> validate
  validate -- invalid --> badreq([400])
  validate --> handler
  handler --> usecase
  usecase --> repo
  usecase --> queue
  repo --> resp
  queue --> resp
\`\`\`

What this shape enforces: authorisation is checked once at the boundary, not
sprinkled through handlers; a repository is the only thing that writes SQL;
anything slow or third-party becomes a job rather than an inline await.

## Frontend

\`\`\`mermaid
%% The screens and which endpoint each one calls. One box per route; if a screen
%% calls more than two endpoints it is two screens.
flowchart LR
  subgraph routes["Routes"]
    home["/ (landing)"]
    app["/app (the product)"]
    settings["/app/settings"]
  end

  subgraph components["Shared components"]
    shell["app shell"]
    table["data table"]
    form["form primitives"]
  end

  subgraph endpoints["API"]
    e_list["GET /api/…"]
    e_write["POST /api/…"]
    e_export["GET /api/export/…"]
  end

  home --> e_list
  app --> shell
  shell --> table
  table --> e_list
  app --> form
  form --> e_write
  settings --> e_export
\`\`\`

What this shape enforces: every screen is assembled from shared components;
naming the endpoints per screen gives a backend change a visible blast radius.

## Data

\`\`\`mermaid
%% The tables and how they are joined. Name the columns that matter: the owner
%% column, the money column, the time column.
erDiagram
  USER ||--o{ PROJECT : owns
  PROJECT ||--o{ ITEM : contains
  ITEM ||--o{ EVENT : "audited by"

  USER {
    uuid id PK
    text email
    timestamptz created_at
  }
  PROJECT {
    uuid id PK
    uuid user_id FK
    text name
    timestamptz created_at
  }
  ITEM {
    uuid id PK
    uuid project_id FK
    int amount_cents
    text currency
    timestamptz occurred_at
  }
  EVENT {
    uuid id PK
    uuid item_id FK
    text kind
    timestamptz at
  }
\`\`\`

What this shape enforces: every table has an owner column and row-level
security filters on it; money is integer minor units plus a currency, never a
float; anything a customer can lose has an audit table.
`

// ---------------------------------------------------------------------------
// The design artefacts.
//
// The mockup is a required step, not a nicety: an engineer building a screen
// from a paragraph of prose guesses, and the guess is what the customer sees.
// `design/screens/<name>.html` is a static, dependency-free mockup — text, so it
// diffs, and it opens in a browser, so the founder can actually look at it
// before a line of product code exists.
// ---------------------------------------------------------------------------

export const designScope = `{
  "//": "Any task whose writes match one of these globs needs a mockup before an engineer starts.",
  "ui": [
    "apps/web/**",
    "apps/mobile/**",
    "packages/ui/**"
  ]
}
`

export const designReadme = `# Design

Mockups live here, one file per screen. They are **static HTML** with no build
step and no framework: open one in a browser and you are looking at the product
as it is meant to be, before any application code exists.

| Path | What it is |
|---|---|
| \`design/tokens.css\` | the token set — colour, type scale, spacing, radius, motion |
| \`design/screens/_template.html\` | the mockup skeleton to copy |
| \`design/screens/<name>.html\` | one screen, static and self-contained |

## The rule

**No engineer starts a UI task until its mockup exists and has been approved.**

A task that touches a UI path declares which mockup it builds:

\`\`\`yaml
design: design/screens/ledger.html
\`\`\`

\`opc doctor\` fails a UI task with no \`design:\`, or one pointing at a file that
does not exist. That is the whole enforcement: the gate is a file that has to be
there, not a promise in a prompt.

## What a mockup has to contain

1. **The real content**, not Lorem ipsum — use the words the spec uses.
2. **All four states**: empty, loading, error, success. A screen that only shows
   the happy path is a screen that will ship without the other three.
3. **The tokens**, not ad-hoc values: no raw hex, no magic pixel numbers. If a
   value is missing, add it to \`tokens.css\` first.
4. **The primary action** visible, and what happens after it.

## From mockup to implementation

The engineer builds the mockup, not a reinterpretation of it. If the mockup turns
out to be wrong once the real data arrives, the **mockup** is updated first, then
the code — otherwise the next task builds on a picture nobody has agreed to.

## Reviewing a mockup

Open it in a browser. Ask: would I understand this screen with no explanation?
Is every state here? Is the primary action obvious? If the answer needs a
sentence of apology, the mockup is not done.
`

export const designTokens = `/* The single source of truth for visual values.
 *
 * The designer adds to this file; the engineer consumes it. No raw hex, no magic
 * pixel numbers anywhere else in design/ or in the product — a value that is not
 * here does not exist yet.
 */

:root {
  /* colour — name by role, never by hue */
  --color-bg: #ffffff;
  --color-surface: #f7f7f8;
  --color-border: #e3e3e6;
  --color-text: #18181b;
  --color-text-muted: #6b6b74;
  --color-primary: #2563eb;
  --color-primary-contrast: #ffffff;
  --color-success: #16a34a;
  --color-warning: #b45309;
  --color-danger: #dc2626;

  /* type — a scale, not a pile of sizes */
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  --text-xs: 11px;
  --text-sm: 12.5px;
  --text-base: 14px;
  --text-lg: 17px;
  --text-xl: 22px;
  --leading-tight: 1.25;
  --leading-normal: 1.55;

  /* space — a 4px rhythm */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* shape and motion */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-md: 0 6px 18px rgba(0, 0, 0, 0.08);
  --duration-fast: 120ms;
}

/* Accessibility floor, applied everywhere rather than remembered per screen. */
* { box-sizing: border-box; }
:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
`

export const screenTemplate = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Screen — <name></title>
<!-- One screen, one file, no build step. Copy this to design/screens/<name>.html
     and replace the content. Open it in a browser to review. -->
<link rel="stylesheet" href="../tokens.css">
<style>
  body { margin: 0; background: var(--color-bg); color: var(--color-text);
         font-family: var(--font-sans); font-size: var(--text-base);
         line-height: var(--leading-normal); }
  .frame { max-width: 960px; margin: 0 auto; padding: var(--space-8) var(--space-6); }
  .screen-name { font-family: var(--font-mono); font-size: var(--text-xs);
                 color: var(--color-text-muted); text-transform: uppercase;
                 letter-spacing: 0.06em; }
  h1 { font-size: var(--text-xl); line-height: var(--leading-tight);
       margin: var(--space-2) 0 var(--space-6); }
  .card { background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: var(--space-6); }
  .row { display: flex; gap: var(--space-3); align-items: center; }
  .btn { padding: 7px 14px; border-radius: var(--radius-sm); border: 1px solid transparent;
         background: var(--color-primary); color: var(--color-primary-contrast);
         font-size: var(--text-sm); cursor: pointer; }
  .btn.secondary { background: transparent; color: var(--color-text);
                   border-color: var(--color-border); }
  .muted { color: var(--color-text-muted); font-size: var(--text-sm); }
  .state { margin-top: var(--space-6); padding-top: var(--space-4);
           border-top: 1px dashed var(--color-border); }
  .state h2 { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.06em;
              color: var(--color-text-muted); margin: 0 0 var(--space-2); }
  .skeleton { height: 12px; border-radius: var(--radius-sm); background: var(--color-border);
              margin-bottom: var(--space-2); }
  .alert { border-left: 3px solid var(--color-danger); padding-left: var(--space-3);
           color: var(--color-danger); font-size: var(--text-sm); }
</style>
</head>
<body>
<div class="frame">
  <div class="screen-name">Screen · <name></div>
  <h1><what this screen is for, in the words the spec uses></h1>

  <!-- SUCCESS — the real content with real copy, not lorem ipsum -->
  <section class="card">
    <div class="row">
      <strong><the primary thing on this screen></strong>
    </div>
    <p class="muted"><supporting line: what happens here, and what it costs></p>
    <div class="row">
      <button class="btn"><primary action></button>
      <button class="btn secondary"><secondary action></button>
    </div>
  </section>

  <!-- The other three states are not optional. A screen with only a happy path
       ships without the three states customers actually hit. -->
  <section class="state">
    <h2>Empty — the first visit</h2>
    <div class="card">
      <p class="muted"><what the user sees before they have done anything></p>
      <button class="btn"><the action that ends the empty state></button>
    </div>
  </section>

  <section class="state">
    <h2>Loading</h2>
    <div class="card">
      <div class="skeleton" style="width: 60%"></div>
      <div class="skeleton" style="width: 40%"></div>
      <div class="skeleton" style="width: 80%"></div>
    </div>
  </section>

  <section class="state">
    <h2>Error</h2>
    <div class="card">
      <div class="alert"><what went wrong, and what the user can do about it></div>
      <button class="btn secondary">Try again</button>
    </div>
  </section>
</div>
</body>
</html>
`
