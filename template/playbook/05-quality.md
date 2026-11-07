# 05 — Quality: making the machine trustworthy

## The one thing that matters

A one-person company has no second pair of eyes. There is no senior engineer
to say "that looks wrong". So the entire quality system of the company rests on
one property:

> **Every claim an agent makes is backed by something a machine checked.**

An agent that says "the tests pass" without running them is not a useful
employee — it is a liability with good manners. Everything in this file is
about converting claims into evidence.

## Three tiers of evidence

| Tier | What it is | Example | Trust |
|---|---|---|---|
| **Claimed** | the agent asserts it | "I implemented the CSV export and the tests pass" | None |
| **Demonstrated** | the agent shows output | "I ran `pnpm test --filter apps/api -- export`; 14 passed, 0 failed" | Good |
| **Proven** | a gate checks it | "CI ran the same command on the merged commit and it passed; the reviewer confirmed the diff matches the spec" | High |

The machine's output should live at tier 3. Every mechanism below moves work
up a tier.

### The number that makes this urgent

Measured on agent trajectories: **false success — the agent reporting success
without having done the work — is 45–48% of all failures** in single-control
domains, and **75.8%** among *self-assessing coding-agent trajectories*
(9,876 tau2-bench + 1,879 AppWorld trajectories).

And the obvious detector does not work. **An LLM judge asked "did the agent
finish?" never exceeded AUROC 0.65** across 5 judges × 5 prompt strategies
(0.54 on AppWorld traces) — because judges key on *confident closing
language*, not on verified state. Cheap deterministic detectors (TF-IDF on the
trajectory) hit **0.83 / 0.95 AUROC at 3,300× lower latency**.

**The rule: never ask an LLM whether the agent did the work.** Check the
environment state directly — did the file change, did the row get written, does
the endpoint return the right thing, does the test fail when the feature is
removed. A second AI reviewing the first AI is exactly the mechanism that
fails.

This is why the `reviewer` role in this system is a **read-only agent that
reads the diff and the state**, not a model asked "is this good?" — and why
its verdict is one of three mechanical words rather than a feeling.

### And a legal footnote that changes the reviewer design

Under **GDPR Article 22**, a second agent reviewing the first agent's
recommendation is **still automated processing** — a rubber-stamp human is not
human decision-making (WP251rev.01, endorsed by the EDPB; cf. SCHUFA
C-634/21). And under Art. 15(1)(h) and CJEU *Dun & Bradstreet Austria*
(C-203/22), an explanation must describe **the procedure actually used** — a
post-hoc, AI-written explanation does not satisfy it.

So: if a decision affects a person, a **human with authority and competence**
must make it, and the record of *how* must be accurate. That is a stronger
requirement than "the human approved it", and it is a reason the founder gates
in `company/AGENTS.md` §7 are written around *decisions*, not around *files*.


## The verification ladder

Use the cheapest rung that can actually catch the failure.

| Rung | Catches | Cost | When |
|---|---|---|---|
| 1. Typecheck + lint | syntax, types, obvious smells | seconds | every save |
| 2. Unit tests | logic in isolation | seconds | every save |
| 3. Integration tests | the parts touching each other | ~1 min | every push |
| 4. End-to-end test | the user's actual path | ~5 min | every push |
| 5. Browser-driven check | "does it work as a human would use it" | ~10 min | before merge |
| 6. Preview environment click-through | the real thing, real data shape | 10 min human | before ship |
| 7. Canary / staged rollout | production behaviour | ongoing | every ship |

The finding from Anthropic's long-running-agent research is the important one:
**without an explicit instruction to test end-to-end, agents mark features
complete without really testing them.** Giving the agent browser automation
and telling it to test "as a human user would" was the single biggest quality
lever in that study. A unit test proves the function; only a browser proves the
product.

## The `passes: false` pattern

This is the most replicable finding in Anthropic's long-running-agent work, and
it is worth copying verbatim.

**The problem with "finish the feature" as an instruction:** an agent asked to
"implement the export feature" will decide what "implemented" means, do a
reasonable subset, and declare victory. There is no checklist, so there is no
gap to notice.

**The pattern.** An *initializer* agent expands the request into an explicit
feature list, each item carrying `passes: false`:

```json
{
  "id": 14,
  "description": "CSV export returns one row per expense with the exact column order from the spec",
  "passes": false
}
```

Then each *coding* agent works **one feature at a time** and may only flip
`passes` to `true`. It is told, in the same breath: *"It is unacceptable to
remove or edit tests."*

Two details do the work:

- **The list is JSON, not Markdown.** Anthropic found the model is less likely
  to inappropriately change or overwrite JSON files than Markdown files. The
  format is part of the mechanism.
- **One feature per agent.** Small units, verifiable individually, resumable.

This is the same idea as the spec's numbered `AC-n` criteria, at a finer
granularity. The `AC-n` list is the *contract*; the `passes: false` list is the
*work ledger*.

In this repository the two live in different places, on purpose:
`company/specs/*.md` holds `AC-n`; `company/tasks/*.md` holds the decomposed
work with a `status` field. Same idea, different owner.

## The clean-state hand-off

Long sessions accumulate context that makes agents slower, more confident, and
more brittle. Anthropic's fix is a startup ritual that re-orients every new
session:

1. `pwd` — where am I
2. read the progress file — what has been done
3. read the feature list — what remains
4. `git log --oneline -20` — what actually changed
5. run `init.sh` — the app starts
6. **verify the app still works before implementing anything**

Step 6 is the one people skip. An agent that starts implementing on top of a
broken baseline will "fix" the broken baseline and the real bug at the same
time, and you will never find out which change mattered.

In this repo, the equivalent ritual is:

```sh
node tooling/src/cli.mjs doctor        # the company OS is consistent
node tooling/src/cli.mjs board         # where we actually are
node tooling/src/cli.mjs pack T-0007   # everything the next agent needs
```

`node tooling/src/cli.mjs doctor` is the "does the app still start" check for the company itself.

## Self-review before the human sees it

GitHub's Copilot coding agent now reviews its own changes with code review
**before opening the pull request**, iterates on the feedback, and only then
asks a human. Claude Code ships `/code-review` and `/verify` skills; Cursor has
Bugbot and Approval Agents.

This is worth adopting because it is nearly free and it moves the review
earlier, where it is cheaper. The order becomes:

```
implement → self-review → fix → test → (reviewer agent) → human
```

The reviewer agent (`reviewer` role) is then reviewing a change that has
already survived one adversarial pass — so it spends its attention on the
issues a self-review misses.

## Adversarial verification

The pattern that beats "many agents agreeing": give the agents *opposing*
mandates.

| Pair | Mandate |
|---|---|
| `engineer` vs `qa` | one builds it, the other writes the test that must fail |
| `engineer` vs `reviewer` | one claims done, the other assumes wrong |
| `researcher` vs `pm` | one finds, the other decides |
| 5 agents on a bug | each tests a different root cause, and they try to disprove each other |

Anthropic's research on long-running agents found that the single biggest
quality lever was making the agent verify end-to-end "as a human user would".
For root-cause work, the equivalent is competing hypotheses: five agents, five
different explanations, each required to argue against the others.

## The QA role's job is enumeration, not inspection

A QA agent that reads the code finds what the code does. A QA agent that reads
the **spec** finds what the code *should* do. The difference is the whole
value of the role.

Procedure:

1. Read the spec's acceptance criteria.
2. Enumerate every behaviour the spec implies — including the ones no
   implementation mentions (the error path, the empty state, the concurrent
   edit, the second user).
3. For each, write the test that would fail without the feature.
4. Any endpoint or behaviour in the code that the spec does not describe is a
   finding: undocumented surface.

In the worked example, `T-0007` exists precisely for this: one test suite that
proves no user can see another user's data. It is the cheapest insurance in
the company and the most expensive mistake to skip.

## Evals: measure tasks, not benchmarks

SWE-bench numbers do not transfer to your codebase. What transfers:

| Metric | Why it matters |
|---|---|
| Merged changes per week | throughput that actually landed |
| Cost per merged change | the real unit cost of the machine |
| Review minutes per merged change | your time, the scarcest resource |
| Change failure rate | did it break something after merging |
| Verification pass rate | did the gates actually catch anything |
| Escapes to production | the number that matters most |

Run these from the artefacts you already keep: git history, CI runs, the
release notes, the incident files. No special telemetry needed — which is
part of why this stack works for one person.

## The definition of done is executable

`.agent/checklists/definition-of-done.md` is not a document to read; it is a
list of booleans a reviewer can check. Every line is written so that a machine
can answer it:

- [ ] The task links to an approved spec. → check the frontmatter
- [ ] The verification command passes, and the output is quoted. → run it
- [ ] No file outside the task's write scope was modified. → diff the paths
- [ ] No secret, key, token, or customer data is committed. → scan
- [ ] Every acceptance criterion the task owns is implemented. → per AC

If a line of the checklist cannot be checked mechanically, rewrite the line.
"Code is well written" is not a line of a definition of done.

## Where to put the gate

**In the harness, not in the prompt.** A rule that lives only in an
instruction file is context, not a control. Claude Code, for example, treats
`CLAUDE.md` as context, while hooks and `permissions.deny` are enforced
configuration.

The company's rules should map onto enforced controls wherever the tool
allows it:

| Rule | Enforced as |
|---|---|
| "May not edit outside the write scope" | `permissions.deny` on those paths, or a worktree |
| "May not spend money" | no billing API credential in the agent's environment |
| "May not talk to a customer" | no outbound email/SMTP credential |
| "May not touch production data" | the agent's environment has no production database URL |
| "Must run the verification command" | a CI job that fails if the task's command is not in the commit log |

That last row is worth stating plainly: **the strongest quality gate for an
agent team is a CI pipeline that the agent cannot skip.** Design the CI to be
the authority, not the agent.

## The anti-patterns

| Anti-pattern | What it looks like | The fix |
|---|---|---|
| Trusting the claim | "Done — tests pass" | verification command, output quoted |
| **Asking an LLM to judge the LLM** | a second agent asked "is this correct?" | deterministic state checks; AUROC 0.65 is not a gate |
| Weakening the test | the suite is green because a test was skipped | "it is unacceptable to remove or edit tests" |
| The agent writes its own test, then declares it passes | a test that asserts nothing | QA role writes the tests from the spec |
| Verifying on the wrong branch | the agent ran the command before its last edit | CI runs it on the merged commit |
| Reviewing a 4,000-line diff | the reviewer skims | one task, one diff, bounded scope |
| The silent regression | a change passes its own tests but breaks an old one | integration suite runs on every push, not only new code |
| Shipping on Friday with no human awake | the deploy succeeded, nobody watched | ship behind a flag; alerts that wake a human |

## The one you will not see coming: the repo gets worse quietly

Long-horizon measurements of AI-authored codebases (GitClear, 623M changes)
found between 2024 and 2026:

| Signal | Change |
|---|---|
| Duplicated blocks (5+ lines) | **+81%** |
| Error-masking `catch` blocks | **+47%** |
| Copy/pasted code | **+41%** |
| Cross-file function calls | −35% |
| Move refactors | **−70%** |
| Legacy maintenance | −74% |

Counter-evidence exists — a GitHub RCT (202 devs) found Copilot users 53.2%
more likely to pass all 10 unit tests, and one study of 151 repos found no
general churn rise. But those measure single tasks over short windows, while
GitClear measures whole codebases over years. The reconciling finding is
alarming: **agents building on agent-generated code lose up to 13.1% resolve
rate**, via changes to input validation and error handling — the exact code a
reviewer is most likely to skim.

**The operational consequence:** reserve a fixed slice of agent time for
consolidation, not just features, and watch the *trend* in duplicated-block
density, move share and error-masking count. A codebase that gets 5% worse a
month looks fine every single day and is unmaintainable in a year.

And the reviewer's eye must be trained on the specific failure: **an
error-masking `catch` makes code look like it ran.** A +47% trend there is a
silent correctness regression, not a style issue.

