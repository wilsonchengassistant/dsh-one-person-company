# Changelog

## 0.9.1

- **Fix: `opc new task --spec` crashed on the second use.** Reported from a real
  project (`opc-bpms`): `The "path" argument must be of type string. Received
  undefined`. The task-id allocator called `decorate()` without the project root,
  so the first task that already carried a `spec:` made the next `new task`
  throw. `decorate()` now tolerates a missing root instead of building a path
  from `undefined`.
- **`scripts/smoke-test.sh`, and preflight runs it as section 10.** It builds a
  throwaway project from `template/` with the real `bootstrap.sh`, then drives the
  CLI the way a user's first ten minutes do: init, spec, three tasks (the third
  reproduces the crash above), board, cycle, pack, and the mockup gate. A release
  cannot pass preflight if a cold start is broken — which unit-level checks all
  did.

## 0.9.0

- **A mockup is a single-file interactive prototype.** `design/screens/<name>.html`
  now embeds its own CSS (the tokens) and its own JavaScript, with a state
  switcher for empty / loading / error / success and a working primary action.
  One file, double-click, no build step — so the mockup can be *played with*, not
  only looked at.
- **A human approves it.** `design/approvals.json` records the decision, the
  reason, and the spec version it was made against. The panel renders the mockup
  in an iframe and offers **Approve this mockup** / **Request changes**; a UI task
  an engineer owns cannot start until its mockup is approved. The designer's own
  tasks are exempt.
- **The change loop.** Playing with a mockup often changes the requirement, so:
  an approved spec edited afterwards is an error (`approved_hash`), a task claiming
  an acceptance criterion the spec no longer has is an error, and a mockup approved
  against an older `spec_version` is stale. The cycle reports *Stage 2 — re-approve
  the spec* and a Stage 4 variant for a missing, unapproved or rejected mockup,
  including the reason the human left.
- Two Remote methods, `design` and `approveDesign`, both resolved by workspace id;
  a mockup path is refused unless it resolves inside `design/`.

## 0.8.0

- **A mockup is now a required step before an engineer builds a screen.** The
  designer role existed and the playbook described a design stage, but nothing
  enforced it: there was no artefact, no directory and no check, so an engineer
  could build a screen from a paragraph of prose — and the guess is what the
  customer sees.
- `design/screens/<name>.html`: one static, dependency-free mockup per screen,
  with empty / loading / error / success. `design/tokens.css` is the single
  source of visual values. `company/design-scope.json` lists the UI globs.
- The task frontmatter gains `design:`, and a UI task without it is an error.
  `opc doctor` fails a task whose write scope touches a UI path and which names
  no mockup file that exists. The designer's own tasks are exempt.
- `opc cycle` gains **Stage 4 — Mock up the screens first**, with the prompt that
  asks for the mockup; the later stages renumber.
- The cycle stage computation moved into `tooling/src/cycle.mjs` and the design
  rules into `tooling/src/design.mjs`, so the CLI, the panel and the doctor share
  one implementation.

## 0.7.0

- **The panel is the operator's console.** The board page now opens with the
  next step: the stage you are at, computed from the artefacts on disk, and a
  button that copies the exact prompt to hand to an agent. **Run the checks**
  runs the same consistency checks as `opc doctor` on the host and lists what it
  found. Together with Bootstrap this means the whole cycle is operated from the
  GUI — no terminal, no commands to type.
- `tooling/src/cycle.mjs`: the stage computation moved out of the CLI so the
  panel and `opc cycle` render the same object and cannot disagree.
- Two new Remote methods, `cycle` and `doctor`, both resolved by workspace id.
- README and the skill are now written for someone who never opens a terminal;
  the CLI is documented as the headless/agent path.
- The skill tells an agent explicitly not to hand the user shell commands.

## 0.6.1

- `scripts/install-local.sh`: install this working copy into a DSH profile and
  report whether the installed copy actually matches the source. `dsh plugin`
  installs by hardlink, so editing in place does not update an installed copy —
  and a change to `lib/client.js` also needs a host restart, because the browser
  module graph is built at boot. The script checks both and says which one is
  outstanding.

## 0.6.0

- **`playbook/12-the-full-cycle.md`, and `opc cycle`.** The plugin shipped the
  machine but not the walkthrough: the practical, stage-by-stage sequence from an
  empty folder to a deployed product, with the exact prompt to paste at each
  step. `opc cycle` now answers "where am I, what do I do next?" from the
  artefacts on disk — charter written, specs approved, tasks ready / in
  progress / in review — and prints the next command.
- The skill gained a "Start here, in order" section, so an agent asked to use it
  starts at the beginning instead of improvising.
- `scripts/sync-template.sh`: pull `template/` from its source workspace, with
  `--check` to report drift only. The template is a copy, and a copy drifts.
- README: a "How it works end to end" section with the seven stages and a sample
  `opc cycle` report.

## 0.5.0

- **The shipped machine is generic.** `template/examples/` is gone: it carried a
  worked product's task seeds, and a plugin for everyone should not ship one
  product's state. `bootstrap.sh` no longer copies it, and the README, skill and
  playbook no longer point at it.
- `scripts/preflight.sh` now fails if anything instance-specific creeps back into
  `template/`: a real home path, a user name, the maintainer's workspace name, or
  any instance state under `template/company/` (a charter, a spec, a task, an
  ADR, metrics, a budget, a roadmap).
- `playbook/05` and `playbook/03` no longer refer to "the worked example", so a
  bootstrapped workspace does not read a reference to a demo it does not have.

## 0.4.1

- `scripts/preflight.sh`: the checks that stop "I pushed" from meaning nothing —
  clean tree, `origin/main` equal to local `HEAD` (a push can exit 0 while the
  remote is behind), version agreeing with the changelog, every README image and
  `screenshots.json` entry present, the bundled `template/` still matching its
  source workspace, and the architecture template still holding its four
  diagrams. `--release` adds the npm tarball checks.
- `AGENTS.md`: the working notes for this package — the release sequence, and the
  eight traps that each produced a real bug here (npm dropping `.gitignore`,
  `slots.inject` around `register`, the list-slot `id`, no `createPortal`, the
  boot-time client graph, pnpm hardlinks, the Mermaid rhombus label, and never
  trusting a path from the browser).

## 0.4.0

- **Architecture diagrams are now a required artefact.**
  `docs/architecture/README.md` carries four Mermaid diagrams in one file —
  *System*, *Backend*, *Frontend*, *Data* — so a human can answer "did the
  system change shape?" in 30 seconds. Text, not images: they diff in git,
  GitHub renders them, and an agent reads the whole file in about 90 lines.
- `opc init` scaffolds the file; `opc doctor` requires it to exist, to hold at
  least four mermaid diagrams, and to have the four sections.
- The `architect` role owns `docs/architecture/**` and its definition of done now
  requires the diagrams to match the system as built.
- A spec's technical notes must reference `docs/architecture/README.md`, so the
  reviewer can see which diagram a feature changes; doctor warns when one does
  not.
- `playbook/03` gains the architecture stage and `playbook/05` makes an
  unchanged diagram against a changed component a blocking review finding.

## 0.3.0

- **The board is now a sidebar panel row**, not a button in the footer. It sits
  in the same list as Plugins and Automation tasks (`order: 20`, so after them),
  selects like any other panel, and remembers its selection across a reload. The
  dialog overlay, the z-index and the portal are gone: the board is a full page
  in the main area, which is what the other panels do.
- Registered through `sidebar.panellist` (the row) plus `main` keyed by the same
  panel id (the page) — the same pair Plugins and Automation tasks use.

## 0.2.0

- **Bootstrap from the GUI.** A workspace with no company OS now offers a
  *Bootstrap this workspace* button instead of telling you to open a terminal.
  It runs the bundled `bootstrap.sh` on the Host against the workspace path held
  by the registry — the browser never sends a path, so it cannot write anywhere
  you have not already added as a workspace. Idempotent: a workspace that
  already has `company/tasks` reports `already` and nothing runs.
- `bootstrap.sh` writes `.gitignore` itself instead of copying it. npm and pnpm
  both drop a `.gitignore` from an installed package, so the copy worked from a
  checkout and failed from `node_modules` — the only path a user takes.

## 0.1.0

- First release.
- Embedded `one-person-company` skill: installs the skill into every workspace's
  catalog, with `bootstrap.sh` and `template/` as its resource base.
- `template/` carries the reusable machine: the `opc` CLI, the 12-document
  playbook, the eight operating rules, and four source-linked research briefs.
- `bootstrap.sh` copies the machine into any directory and runs `opc init` to
  generate the per-project company skeleton. Idempotent; `--check` and
  `--force` supported.
- `opc` bin: `opc bootstrap [dir]`, or delegate to the workspace's own
  `tooling/src/cli.mjs`.
- Sidebar footer button and dialog showing the current workspace's task board,
  with summary counts, per-task status, owner, dependencies and readiness, and
  a workspace switcher. Backed by a Typert Remote service (`opcBoard`) that
  reads `company/tasks/*.md` with the same parser the CLI uses.

- The dialog shows workspace paths with the home directory collapsed to `~`, so
  it can be screenshotted or screen-shared without carrying a user name.
- `doctor` requires a write scope only once a task is `in_progress` or `review`.
  Requiring one on a `ready` task warned about read-only work (the reviewer's)
  and about a founder task that writes nothing, which trained the reader to
  ignore the doctor.
