# 00 — The model: what a one-person company actually is

## The short version

You are not building a product with AI helpers. You are building **a machine that
produces products**, and you are its only operator. The product is the output of
the machine. The machine is the thing you actually own.

Everything in this playbook follows from that reframe. When people ask "can one
person really do what twenty people did?", the honest answer is: *no — not the
same twenty things*. What one person can do is own a machine that does the
twenty things' **drafting, execution and bookkeeping**, while they keep
**judgement, taste, and accountability**.

## The 80% that never changes

Your instinct was right: the mechanics barely depend on what you build. Between a
notes app and a payroll system, the following are identical:

| Layer | What it is | Changes per product? |
|---|---|---|
| **Decision rights** | Who is allowed to decide what, and which decisions need a human | No |
| **Context** | Where the truth lives — charter, spec, decisions, metrics, code | No (only its content) |
| **Process** | The pipeline from idea → shipped → supported → learned | No |
| **Artefacts** | The files each stage produces and consumes | No |
| **Gates** | The checks that stop bad work reaching a customer | No |
| **Cost & capacity** | Token budget, seat budget, infra budget, human hours | No |
| **Distribution** | How strangers find you | Partly — this *does* change per product |
| **The problem itself** | Who hurts and why they pay | **Yes — 100% different** |

That last row is the one that decides whether the company works. The other rows
are the 80% you correctly identified, and they are now a solved, copyable
artefact. The row that is *not* solved by AI is the one where your judgement is
the product.

## The three decisions that define the machine

### 1. Decision rights

Draw a line between what an agent may decide and what it must escalate. This
line is the single most important artefact in the company, and it must be
written down before anything is built.

The rule that works:

> **Reversible and local → agent decides. Irreversible, global, or
> externally visible → human decides.**

Concretely, the human holds these keys:

- spending money
- anything legally binding
- anything irreversible in production (deleting data, changing prices)
- anything customer-facing (a reply that promises, a refund, a public post)
- changing the charter, the scope, or the definition of done
- the first launch in front of a real customer

Everything else is the agents' job — including architecture, copy, pricing
*proposals*, and code. See `company/AGENTS.md` §7 and the founder gates in
`.agent/roles/*.md`.

If you find yourself approving ten small decisions a day, the line is drawn in
the wrong place. If you find yourself approving one large decision a month, it
is drawn correctly.

### 2. Context

The company is the sum of what its agents know. An agent with the right
context and no memory is a contractor; an agent with persistent, curated
context is staff. The context lives in **files in a repository**, not in a
person's head, and that is the only reason a company of one can be handed to
another tool, another model, or another human later.

Three rules make context work:

- **One source of truth per fact.** The spec is the contract. The ADR is the
  reason. The task file is the status. Do not let two files disagree.
- **Context is assembled, not loaded.** An agent should receive exactly the
  material for its task, not the whole repository. `node tooling/src/cli.mjs pack T-0001` does
  this: charter, spec, task, role charter, write scope, definition of done,
  operating rules. 333 lines, not 3,000.
- **Written decisions beat remembered decisions.** If an agent would have to
  "remember" something, that something must be a file.

### 3. Process

The pipeline is the machine's cam:

```
research → spec → design → implement → test → review → ship → operate → support → learn
   │         │       │         │          │       │       │        │         │        │
   └─────────┴───────┴─────────┴──────────┴───────┴───────┴────────┴─────────┘
                        each arrow = one role, one artefact, one handoff
```

The point of the pipeline is not ceremony. It is that **each stage's output is
the next stage's input**, written down. When the pipeline is in files, you can:
swap a role, run stages in parallel, resume after a week, hand the company to
another person, or measure where work actually slows down.

## What the AI genuinely replaces, and what it does not

Be precise here, because most "one-person company" content is marketing.

**Genuinely replaced (the drafting and execution layer):**
- First drafts of code, tests, docs, copy, designs
- Boilerplate and integration work
- Log triage, error summarisation, issue triage
- Research assembly, competitive scanning, first-pass synthesis
- The 10% of support that is "where is this button"
- Drafting campaigns, release notes, changelogs, onboarding email

**Genuinely replaced (the bookkeeping layer):**
- Status tracking (a board derived from files)
- Keeping the spec, the code, and the docs in sync
- Remembering what was decided and why
- Watching metrics and noticing the drift

**Not replaced (the judgement layer):**
- Knowing which problem is worth solving, and for whom
- Knowing when the thing you built is actually good
- Knowing which customer to say no to
- Owning the consequences of a bad call
- Taste, relationships, and being trusted

**Not replaced (the accountability layer):**
- A human is legally and morally responsible for what the company does
- Customers pay a person, not a workflow
- The founder is the one who cannot take a holiday

This is why the guide keeps the human in the loop at six gates rather than
either "let the AI run everything" (fiction) or "the AI helps me code"
(cope).

## The three ways the machine breaks

Design against these from day one. Each has a specific countermeasure that
appears later in this playbook.

### 1. Context bloat
Every agent that reads more than it needs gets worse at the part it needs.
**Countermeasure:** the context pack. Assembled per task, bounded, and
deliberately excluding the rest of the repository.

### 2. Unverified claims
The characteristic failure of an AI-run team is not wrong code — it is
**confident, plausible, unverified claims**: "tests pass", "the migration is
reversible", "I checked the accessibility". The machine's credibility depends
on evidence, so evidence must be a *gate*, not a courtesy.
**Countermeasure:** the verification command in every task, the
definition-of-done checklist, and the reviewer role whose job is to doubt.

### 3. Coordination collision
Two agents editing the same file is the classic way an agent team destroys
work. In a normal company, the merge conflict is caught by a human in review.
With no human in the loop, it gets committed.
**Countermeasure:** **write scopes**. Every task declares the paths it may
touch; the board shows conflicts; agents work in isolated worktrees where the
tool supports it.

## The shape of a normal week

This is what the machine looks like when it works. It is deliberately boring.

| When | What happens | Who |
|---|---|---|
| Monday | Read the metrics; write one sentence of direction into the roadmap | **Human** |
| Monday | Turn that sentence into specs and tasks | PM agent |
| Daily | Pull the top ready task, generate its context pack, work it | Engineer agent |
| Daily | Run the QA suite, write the failing tests for anything not covered | QA agent |
| Per change | Adversarial review of the diff | Reviewer agent |
| Daily | Deploy to production behind a flag, watch the dashboards | DevOps agent |
| Daily | Triage the support inbox, file bugs as tasks | Support agent |
| Weekly | A research brief on the next question | Research agent |
| Weekly | Update the marketing surface with what was learned | Growth agent |
| Ad hoc | Money, contracts, customer promises, launches | **Human** |

A human who can run this loop for three months is running a company. A human
who cannot is running a demo. The difference is not talent — it is whether the
machine's outputs are trustworthy enough to act on without supervision.

## How to read this playbook

| File | Read it when |
|---|---|
| `01-day-one.md` | You are setting up: accounts, tools, budgets |
| `02-org.md` | You are defining the roles and who does what |
| `03-pipeline.md` | You are moving work through the stages |
| `04-context.md` | Your agents keep getting confused or slow |
| `05-quality.md` | Your agents claim success and you cannot trust it |
| `06-ops.md` | You are deploying, monitoring, and on call alone |
| `07-business.md` | You need money, customers, and legal cover |
| `08-economics.md` | You need to know if this is profitable |
| `09-risks.md` | You want the honest failure list |
| `10-plan-30-60-90.md` | You want the first three months, day by day |
| `11-running-it-in-dsh.md` | You want this exact org running in this harness |
