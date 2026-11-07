# 04 — Context: how the company remembers

## Why context is the whole game

A coding agent is a stateless worker with excellent reading comprehension. It
knows nothing about your company when it starts. Everything it knows, it knows
because you put it in front of it.

In a normal company, that knowledge lives in people's heads and in meetings.
In a one-person company, **all of it must live in files** — otherwise it is
lost the moment the session ends, and the company becomes a series of
unrelated tasks.

So context engineering is not a nice technique here. It *is* the company.

## The seven layers of context

Not everything belongs in the prompt. These layers have different lifetimes and
different owners.

| Layer | Content | Lifetime | Owner | Loaded when |
|---|---|---|---|---|
| 1. Identity | the charter: what we do, for whom, what we will never do | months | human | every task |
| 2. Contract | the spec: problem, scope, AC-n criteria, non-functional requirements | weeks | pm | every task in that spec |
| 3. Task | the task file: deliverable, ACs, write scope, dependencies, verification command | days | pm | that task only |
| 4. Role | the role charter: reads, writes, never, done | months | human | every task for that role |
| 5. Rules | the operating rules (`company/AGENTS.md`) and checklists | months | human | every task |
| 6. Reference | ADRs, prior briefs, the codebase itself, external docs | varies | architect / researcher | on demand |
| 7. Evidence | test output, logs, screenshots, measurements | minutes | the producing agent | at the gate |

**The rule that keeps this affordable:** layers 1–5 are assembled into every
context pack (about 300 lines for a typical task). Layers 6 and 7 are *looked
up*, never loaded wholesale. The difference is the difference between a fixed
context tax and an unbounded one.

This is the same principle as the durable-context work described in
Anthropic's context-engineering guidance and Manus's agent notes: the agent's
context is an **attention budget**, and the job is to spend it on the task, not
on the company.

## Files as memory, and how to structure them

### The AGENTS.md convention

`AGENTS.md` is now read natively by Claude Code, Codex, Cursor and Copilot, and
it is the closest thing to a shared convention for "project instructions that
every agent reads". The conventions that work:

- **One root `AGENTS.md`** with the short, always-true rules: how to build, how
  to test, what the conventions are, what the agent must never do.
- **Nested `AGENTS.md`** in a directory when that subtree has different rules
  (a `packages/db/AGENTS.md` with the migration rules, a `apps/web/AGENTS.md`
  with the component conventions). Most tools scope nested instructions to
  that directory.
- **Keep it short.** A 400-line `AGENTS.md` is a 400-line tax on every single
  call, and long instruction files get followed less reliably, not more.
  Rules that are not followed are worse than rules that are absent, because
  they create the illusion of a constraint.

In this repository:
- `AGENTS.md` (root) — the workspace operating manual for any agent.
- `company/AGENTS.md` — the company operating rules.

### The context pack (layer 1–5 assembled)

`node tooling/src/cli.mjs pack T-0001` assembles layers 1–5 plus the task's dependencies and the
definition of done. It is the concrete answer to "what does my agent see when
it starts?".

```sh
node tooling/src/cli.mjs pack T-0003 --roles owner,reviewer > /tmp/ctx.md
```

Two details that matter more than they look:

- It **includes the spec's status** and instructs the agent to stop if it is
  not approved. Context that carries its own precondition.
- It **includes the write scope** and says what to do if the task needs more.
  Scope as context, not as a hope.

### Retrieval over recall

Teach the agents to look things up rather than remember them. Concretely:

- Search before reading (`rg` before `cat`).
- Read the ADR index before opening an ADR.
- Check the board before starting work.
- When a fact is needed twice, it becomes a file.

The measurable symptom of a company with bad retrieval: agents re-derive
decisions, make them differently, and the reviewer cannot tell which version is
current.

### Scratch space as memory

Give each agent a place to think that survives its own session: a `notes/`
directory inside the task's scope, or the task file's "Notes / handoff"
section. Manus's agent notes made the same point from the other direction —
the filesystem is the memory, and a `todo` file is attention management. An
agent that can write down its plan does not need to hold it all in context,
and it does not silently drop step three.

## Keeping context healthy over time

Context rots. Three kinds of rot, and their cures.

### 1. Staleness — the file no longer matches the code

**Symptom:** agents follow an instruction that contradicts the repo.
**Cure:** the instructions live next to what they describe, and a CI check
fails when they drift. A `doctor` command that verifies the operating manual
still matches reality is worth more than a better-written manual.

### 2. Accumulation — the file keeps everything

**Symptom:** the root `AGENTS.md` is 300 lines and half of it no longer applies.
**Cure:** an explicit expiry rule. Rules carry a review date; anything not
re-confirmed at review is deleted. The rule "if you did not need it this
quarter, delete it" is brutal and correct.

### 3. Contradiction — two files disagree

**Symptom:** two agents produce different answers to the same question.
**Cure:** one source of truth per fact, enforced by the file layout:

| Question | Exactly one place it lives |
|---|---|
| What are we building? | the spec |
| Why did we choose this? | the ADR |
| What is happening now? | the task board |
| What must never happen? | `company/AGENTS.md` + role `never` lists |
| What does "done" mean? | the definition-of-done checklist |
| Are we winning? | `company/metrics.md` |

When two of these disagree, the disagreement is a bug with an owner: it is
usually the PM role's, or the architect's.

## Practical context budgets

Numbers that keep a solo operation sane, roughly:

| Context | Budget | What happens if you exceed it |
|---|---|---|
| A single agent turn | ~50–150k tokens of material | Degradation, then silent drift |
| A role charter | < 1 page | It stops being read carefully |
| The root `AGENTS.md` | < 100 lines | Compliance drops |
| A context pack | < ~400 lines | Cost and attention both suffer |
| A spec | < ~200 lines | Split it into two specs |

The per-task context pack is the number to watch. If your pack is 2,000 lines,
you are loading the company instead of the task.

## Symptoms that your context is the problem

| Symptom | Likely cause |
|---|---|
| The agent ignores a rule that is written down | Too many rules; the rule is not near the action |
| Two agents disagree on a fact | Two sources of truth for that fact |
| The agent "forgets" an earlier decision | The decision was never written down |
| The agent re-implements something that exists | No index; retrieval is not happening |
| Output gets worse as the project grows | Whole-repo context; needs scoped packs |
| The agent keeps asking the same question | A missing layer (usually the spec) |
| Costs creep up every week | Context grows monotonically; nothing is pruned |

If the machine is drifting, resist the urge to write a longer prompt. Almost
always the fix is a **missing file**, not a missing instruction.
