# Task board

The board is the single source of truth for *what is happening right now*.
It is regenerated from the markdown files in `company/tasks/` — never edited
by hand in a tracker that can drift away from the repo.

```sh
node tooling/src/cli.mjs board            # table view
node tooling/src/cli.mjs board --ready    # only the tasks whose dependencies are met
node tooling/src/cli.mjs board --json     # machine readable
node tooling/src/cli.mjs doctor           # health check for everything below
```

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
These four rules are enforced by `node tooling/src/cli.mjs doctor`, not by
good intentions. If doctor reports an error, the board is lying.

1. **A task may not move to `ready` without a link to an approved spec.**
   Doctor errors when a task is active and its spec is missing or still a
   draft. `board --ready` only lists tasks whose spec is `approved`.

2. **A task may not move to `done` without a passing verification command.**
   Every task carries a `Verification` block with a runnable command, and the
   reviewer quotes the real output in the handoff note.

3. **A task in `in_progress` names its owner and its write scope.**
   A task with an unknown owner role, or with a write scope that overlaps
   another runnable task's scope, is reported.

4. **Only the human may move a task to `dropped`.**

## The loop
```
research → spec → design → implement → test → review → ship → operate → support → learn
```
Each arrow is a role in `.agent/roles/`. Each artefact lands in `company/`.
