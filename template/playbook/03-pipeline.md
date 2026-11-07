# 03 — The pipeline: how work actually moves

## The shape

Ten stages, each with exactly one input artefact and one output artefact. No
stage invents context; it consumes what the previous stage wrote.

```
   research ──▶ brief ──▶ spec ──▶ design ──▶ implementation ──▶ tests
                 │          │         │             │                │
              (source)   (AC-n)   (tokens)      (code)          (failing first)
                            │         │             │                │
                            └─────────┴──────▶ review ◀──────────────┘
                                            │
                              ┌─────────────┼─────────────┐
                              ▼             ▼             ▼
                           ship         operate       support
                         (release)   (dashboards)    (answers)
                              │             │             │
                              └─────────────┴──────▶ learn
                                                  │
                                          (direction sentence — human)
```

The last arrow is the important one. `learn` feeds a **human-written direction
sentence** into the roadmap. That sentence is the only steering the agent team
receives, and it is what keeps a company of one from building whatever the
agents find interesting.

## Stage by stage

### 1. Research → brief

**Role:** `researcher`
**Produces:** `company/research/YYYY-MM-DD-topic.md`
**Consumes:** the web, the charter, prior briefs.

The brief must separate *found* from *inferred*, carry a source URL and a date
on every claim, and end with one recommendation. If a brief cannot produce a
recommendation, it was a search, not research.

**Gate to the next stage:** the recommendation names a decision the PM can act
on. If it names five, it is a survey — pick one and throw the rest away.

### 2. Brief → spec

**Role:** `pm`
**Produces:** `company/specs/YYYY-MM-DD-slug.md`
**Consumes:** the brief, the charter, the roadmap.

The spec is the single most important artefact in the company, because it is the
only thing that constrains every downstream agent. A weak spec produces
plausible work that does not solve a problem.

**The acceptance-criteria rule:** every AC must be objectively checkable by
someone who was not in the room. "The user can correct a field easily" is not an
AC. "The user can correct any extracted field and the corrected value is what
appears in the ledger and in the CSV export" is.

**Gate:** `status: approved` in the spec frontmatter, and the ACs must be
numbered (`AC-1`, `AC-2`, …) so a QA agent can turn each one into a test.

### 2b. Architecture (kept current, not drawn once)

**Role:** `architect`
**Produces:** `docs/architecture/README.md` — four diagrams, one file: *System*,
*Backend*, *Frontend*, *Data*.

They are [Mermaid](https://mermaid.js.org) blocks, so they are text: they diff
in git, GitHub renders them, and an agent reads the whole file in about 90
lines instead of reading the repository.

The single most useful rule in this whole playbook, for a solo founder:

> **A diagram that does not match the code is worse than no diagram.**

So the diagram is not a one-off deliverable — it is part of every task that
changes the system's shape. Add a worker, add a table, add a route, add a third
party: the same task updates the diagram. `opc doctor` requires the file and its
four sections to exist; the `reviewer` role is the one that checks a change
against it.

Why it is not auto-generated: anything derived from code goes stale the moment
the code changes and nobody notices. An owned artefact with a reviewer gate
stays true; a generated picture lies quietly.

**The 30-second review:** open *System*. Did this change add a box, remove a
box, or add an arrow? If yes, the diagram changed in the same commit. If it did
not change and the shape did, the change is not done.

### 3. Spec → design

**Role:** `designer`
**Produces:** design tokens, components, flows, and the design section of the spec.

The designer's job is not screenshots — it is **reusability**. Every screen is
assembled from shared components; new colours, type sizes and spacing values
come from the token set, not from taste in the moment. An agent team without a
token set produces a UI that looks like six different people made it, and you
will spend weeks cleaning it up.

**Gate:** every screen exists in empty, loading, error and success states, and
passes the accessibility basics.

### 4. Spec → implementation

**Role:** `engineer`
**Produces:** code, migrations, and its own unit tests.

The engineer's non-negotiables, from `.agent/roles/engineer.md`:

- Work only inside the declared write scope.
- If the task's spec is not approved, stop and say so.
- Add the test in the same change as the code.
- Run the verification command and quote the real output.
- Never invent a dependency. (Package hallucination is a real and documented
  failure mode — an agent will confidently `import` a package that does not
  exist, or worse, one that exists but is a typosquat of something else.)

**Gate:** the verification command passes, and the output is quoted verbatim in
the handoff note.

### 5. Implementation → tests

**Role:** `qa`
**Produces:** the test suite, and the failing test for every defect found.

QA is the role that makes the rest of the machine trustworthy, and it is the
role most likely to be skipped when you are busy. Do not skip it. Its power
comes from working *from the spec*, not from the code: enumerate the endpoints
and behaviours named in the ACs, and assert each one. If a route exists that
the spec does not describe, that is a finding.

**The rule that keeps the suite honest:** a test may not be weakened to make it
pass. A deleted or skipped test is a bug report against the agent that wrote
it, not a cleanup.

**Gate:** every AC has at least one automated check that would fail if the
feature were removed.

### 6. Tests → review

**Role:** `reviewer`
**Produces:** one of *approve* / *request changes* / *escalate*.

The reviewer reads the diff, the spec, and the verification output, and asks
the questions in `.agent/checklists/review.md`. It does not fix anything. That
separation is deliberate: a reviewer that fixes its own findings is not a
reviewer.

**Gate:** an explicit verdict. "Looks good" is not a verdict.

### 7. Review → ship

**Role:** `devops`
**Produces:** a release, a rollback command, a release note.

Deploys are behind a flag by default and the rollback command is **executed at
least once** before the first real customer sees the change. A rollback you have
only written down is not a rollback.

**Gate:** migrations are expand/contract, the new surface has a dashboard and
an alert, and the release note names what changed and how to undo it.

### 8. Ship → operate

**Role:** `devops`
**Produces:** dashboards, alerts, runbooks, incident reports.

Two rules for a one-person on-call:

- **Every alert has a runbook.** An alert with no runbook gets deleted, not
  tuned. Alert fatigue is how solo founders sleepwalk into being on call
  forever.
- **Alert on symptoms, not causes.** "Checkout error rate above 2% for 5
  minutes" is worth waking up for. "CPU above 70%" is not.

### 9. Operate → support

**Role:** `support`
**Produces:** answers, knowledge-base articles, and bug reports filed as tasks.

Support is not just a cost centre — it is the **cheapest research instrument you
own**. Every ticket that asks the same question twice is a product defect or a
missing piece of copy, and the support role should file it as a task the same
day rather than answering it again.

The support role never promises a date, a price, or a refund. Those go to the
human.

### 10. Support → learn

**Role:** `researcher` + `growth` + **human**
**Produces:** a research brief, an updated marketing surface, and one direction
sentence in the roadmap.

This is where the loop closes. If the loop does not close, the company becomes a
feature factory that ships steadily into a market nobody is in.

## The daily operating rhythm

A realistic day for the founder. It is about 20 minutes of human time; the rest
is the machine running.

**Morning (10 min)**
```sh
node tooling/src/cli.mjs doctor          # is the machine healthy?
node tooling/src/cli.mjs board           # what is moving, what is stuck, what is ready
node tooling/src/cli.mjs board --ready   # what can start right now
```

**Midday (5 min)** — handle escalations. Each escalation should be answered
with a one-line decision, not a meeting.

**Afternoon (5 min)** — read what shipped. Click the preview URL. That is the
entire review loop, and it is what keeps quality from silently decaying.

**Weekly (30 min)** — the only substantial human commitment:
1. Read `company/metrics.md`. Twelve numbers.
2. Read the shipped-work list. What surprised you?
3. Write one direction sentence into `company/roadmap.md`.
4. Delete one thing. This is not optional — see `09-risks.md`.

## Running one task end to end

This is the concrete loop, against whatever is on the board.

```sh
# 1. PM agent picks the next approved spec, writes the tasks
node tooling/src/cli.mjs new task "..." --spec company/specs/<file>.md --owner agent:engineer --writes "apps/**"

# 2. The board shows what can start now
node tooling/src/cli.mjs board --ready

# 3. Assemble the context for the agent that will do the work
node tooling/src/cli.mjs pack T-0003 > /tmp/pack.md

# 4. The agent works the task: read the pack, edit only the write scope,
#    run the verification command, quote the output in the handoff

# 5. QA agent writes the tests the spec demands
# 6. Reviewer agent returns approve / request changes / escalate
# 7. DevOps agent deploys behind a flag, writes the release note
```

The `pack` command is the load-bearing step. It is what makes the difference
between "an AI that knows a lot" and "an AI that knows exactly what it needs
for the next two hours".

## Parallelism: when to fan out, and when not to

Fan out when the work is **independent and bounded**:

- Five research questions → five parallel researchers → one synthesis.
- One feature across backend, web, and mobile → three engineers with disjoint
  write scopes → one reviewer.

Do not fan out when:

- The work depends on a decision that has not been made yet (two agents will
  make it twice, differently).
- The output needs to be coherent across agents (one voice, not four).
- The task is still ambiguous. Parallelism on an ambiguous task multiplies the
  ambiguity.

The heuristic: **if two agents would produce different answers because they
lack the same context, the context is missing — not the parallelism.**
