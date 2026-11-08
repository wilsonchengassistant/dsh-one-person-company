# Definition of done

A task is done when **all** of these are true. The reviewer role checks them
mechanically; a task that fails any line goes back with the failing line quoted.

A line that cannot be checked mechanically is a line that should be rewritten
until it can be.

## Contract
- [ ] The task links to an **approved** spec (the doctor enforces this).
- [ ] Every acceptance criterion the task owns is implemented.
- [ ] No acceptance criterion in scope was quietly dropped or redefined.
- [ ] The `qa_signoff` field on the task names who checked the criteria.

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
