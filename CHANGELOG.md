# Changelog

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
