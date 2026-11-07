# Changelog

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
