# Tasks

Every task is a file here. The board is derived from these files.

Template: `node tooling/src/cli.mjs new task "Title" --spec company/specs/<file>.md`

Fields that matter:

- `status` — backlog | ready | in_progress | review | done | blocked | dropped
- `owner` — `agent:<role>` or `human:<name>`
- `spec` — the contract; required before "ready"
- `writes` — the paths this task may touch
- `depends_on` — task ids
- `qa_signoff` — who signed off the acceptance criteria

Task files must be named `T-NNNN-<slug>.md`. The board only loads files
that start with `T-`, so `README.md` and `BOARD.md` can live here too.
