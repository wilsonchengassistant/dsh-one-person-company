# Changelog

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
