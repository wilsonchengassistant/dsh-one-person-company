# 02 — The org: setting up a team of agents

## From twenty staff to ten roles

A typical twenty-person software startup is roughly: 4 backend, 3 frontend, 2
mobile, 2 QA, 2 DevOps/SRE, 2 PM/product, 1 designer, 1 data/analytics, 1
marketing, 1 support, 1 founder/CEO, plus contractors. Each of those hires
exists because of a *distinct decision* or a *distinct artefact* they own.

Agents do not collapse roles by seniority. They collapse roles by **artefact**.
So the right decomposition is: **one role per artefact that must exist at a
handoff point**.

| Traditional role | Agent role | The artefact it owns |
|---|---|---|
| PM, product owner, analyst | `pm` | the spec, the roadmap, the board |
| Market researcher, sales, part of marketing | `researcher` | the research brief |
| Tech lead, architect | `architect` | the ADR, the interfaces |
| Product designer | `designer` | the design system, the flow, the copy |
| Backend, frontend, mobile engineers | `engineer` | the code and the tests |
| QA, test engineer | `qa` | the failing test that proves a defect |
| DevOps, SRE | `devops` | the pipeline, the deploy, the runbook, the alert |
| Support, CS | `support` | the answer, the knowledge base article |
| Growth, content, marketing | `growth` | the asset, the channel, the metric |
| Staff engineer / tech lead (review) | `reviewer` | the verdict: approve / request changes / escalate |
| CEO, founder, board | **the human** | the six gates |

Ten roles. Two of them (`pm`, `architect`) are mostly *judgement* roles that
work better with a strong model and lots of context. Four (`engineer`, `qa`,
`devops`, `growth`) are execution roles where speed matters more than depth.
One (`reviewer`) exists purely to be the agent that says no.

### Why keep `reviewer` separate

In a company of one human plus agents, the most dangerous thing is that every
agent agrees with every other agent, because they share a model, a prompt
template, and a tendency to agree with the last thing they read. The reviewer
role breaks that: it is a different role with different instructions ("assume
the work is wrong"), and it is the only role that is allowed to say
"request changes" without fixing anything itself.

If you build only one custom role, build this one.

## The anatomy of a role

Every role in this system is four fields. That is what makes it checkable
rather than decorative.

```
role = {
  reads:   what context it needs          → the context pack
  writes:  what it may change             → the write scope
  never:   the lines it may not cross      → the escalation rule
  done:    what "finished" means for it   → the exit condition
}
```

You can see all ten in `tooling/src/roles.mjs` — they are **data**, not prose —
and `node tooling/src/cli.mjs init` renders them into `.agent/roles/*.md`, which is what an agent
actually reads at runtime. Keep them as data because then you can generate the
charters, check them, and version them with the rest of the company.

The `never` and `done` fields are the important ones. `reads` and `writes` are
mechanical; `never` and `done` are where the company's judgement lives:

- **`never` is a tripwire.** "Never claim something works without running the
  verification command." "Never introduce a service before the scale requires
  it." "Never delete a failing test to make the suite green." Each of these
  prevents a *specific* failure mode that a helpful-sounding agent will
  otherwise walk into.
- **`done` is an exit condition, not a vibe.** "Every acceptance criterion the
  task owns is implemented; the verification command passes and its output is
  quoted; tests were added alongside the code." A role without a mechanical
  exit condition will report success whenever it runs out of context.

## Instantiating a role

A role becomes a running agent when you give it five things:

1. **A charter** — the role file, loaded verbatim.
2. **A context pack** — assembled per task, bounded (`node tooling/src/cli.mjs pack T-0001`).
3. **Tools** — scoped by what the role is allowed to touch. A `researcher` gets
   web access and a scratch file; an `engineer` gets the repo, the shell and
   the tests, but not the billing console.
4. **A write scope** — the paths it may change, enforced by the harness where
   possible, and by review where not.
5. **An exit condition** — the checklist it must satisfy before handing off.

The order matters. Most failed agent setups fail because they gave the agent
the whole repository and a vague instruction. Context first, scope second,
instruction last.

### Concrete: the engineer role

```
Charter        .agent/roles/engineer.md
Context        node tooling/src/cli.mjs pack T-0003  → charter + spec + task + write scope + DoD
Tools          read/write repo, run shell, run tests, no network egress by default
Write scope    apps/api/src/extraction/**, apps/worker/**, packages/db/**
Exit           the verification command in the task passes, output quoted in the handoff
```

Note what is *not* in the pack: the other nine task files, the marketing copy,
the incident history. Not because they are unimportant, but because an agent
that reads them starts optimising for the wrong thing.

## Running the org: three execution shapes

The same ten roles can be run in three different ways. Use the cheapest one
that fits.

| Shape | What it is | Use it for | Cost |
|---|---|---|---|
| **Serial pipeline** | One agent at a time, each handing off a file | The daily core loop; a task from `ready` to `done` | Low |
| **Parallel fan-out** | Many agents on independent work at once | Research across five questions; a task split by layer | Medium |
| **Team** | Durable members with a shared task board and direct messaging | Long-running work where roles must talk to each other | High |

Most days are shape 1. Shape 2 is for research and for splitting one feature
across independent files. Shape 3 is for when a feature genuinely needs the
architect and the engineer talking — and it is where the collision risk lives.

### The isolation rule for parallel work

If two agents run at once, they must not write to the same place. Three
mechanisms, in increasing order of safety:

1. **Write scopes declared in the task file** (advisory — the board shows
   conflicts, the reviewer catches violations).
2. **Isolated worktrees** — one checkout per agent, merged afterwards. Both
   Claude Code and Codex now support worktrees as a first-class primitive;
   Claude Code even blocks edits and shell commands that try to escape the
   worktree.
3. **Separate repositories for genuinely separate products** — the honest
   answer when one codebase has become a museum.

Use (1) when the files are disjoint and the work is short. Use (2) when two
agents touch the same feature. Use (3) when you have two products, not one.

### The shared-context trap

Every role in this playbook reads the same charter and the same spec. That
shared context is a strength *and* a failure mode: agents that share context
also share blind spots. Two agents reading the same wrong assumption will agree
with each other and both be wrong.

The countermeasure is not "give them different prompts". It is **structural
adversarial pairing**:

- `qa` is paired against `engineer` (it writes the test that must fail).
- `reviewer` is paired against whoever wrote the code (it assumes they are
  wrong).
- `researcher` is paired against `pm` (findings must have sources; opinions
  must be labelled).

Whenever two roles can check the same artefact from different angles, do it.
That is the cheapest quality control available to a one-person company.

## The human's interface

The founder's job in the machine is small and specific:

| Daily | Weekly | Rarely |
|---|---|---|
| Read the board (`node tooling/src/cli.mjs board`) | Read the metrics, write one direction sentence | Approve a spend |
| Approve 0–2 decisions | Review one shipped feature end to end | Sign anything |
| Answer an escalation | Look at the failure modes | Launch |

The escalation queue is the one thing to keep short. If the agents escalate ten
items a day, the machine is broken — most likely because a role's `never` list
is too broad, or because the spec is missing a decision that should have been
made in advance.

## Handing the org to another tool

The org is portable because it is files. The role charters, the specs, the
tasks, the write scopes, the verification commands — all of it is markdown. A
different harness, a different model, or a different human can pick up the
company by reading `company/` and running `node tooling/src/cli.mjs doctor`.

That portability is not a nice-to-have. It is the difference between "an
experiment with agents" and "a company that happens to be run by agents" —
the second one survives a tool change, a price change, and a model change,
which are all guaranteed to happen.
