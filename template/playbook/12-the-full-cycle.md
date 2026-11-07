# 12 — The full cycle, start to deploy

The practical walkthrough. `03-pipeline.md` explains *why* the stages exist;
this file is *what you actually type*, in order, from an empty folder to a
deployed product.

You do four things. Everything else is an agent's job.

| # | You decide | How often |
|---|---|---|
| 1 | the **charter** — who hurts, what it costs them, why you win | once, at the start |
| 2 | approve the **spec** — can a test prove each acceptance criterion? | per feature |
| 3 | the **review verdict** — you looked at the thing and believe it | before it ships |
| 4 | the **six founder gates** — see `company/AGENTS.md` §7 | whenever one appears |

You never write the code. You approve artefacts and check results.

---

## Stage 0 — bootstrap (once)

Open **Company board** in the sidebar and press **Bootstrap this workspace**, or:

```sh
bash bootstrap.sh .
```

You get the machine and an empty company. `node tooling/src/cli.mjs doctor`
should now report `0 errors`.

## Stage 1 — idea → charter

Ask an agent:

> Use the one-person-company skill. Ask me five questions — who is this for,
> what do they do today, what does the problem cost them, why now, and why would
> they pick me — then write `company/charter.md`. Do not write it before you
> have my answers.

Answer honestly. This file is the first thing every later agent reads; if it is
vague, everything downstream is vague.

**Check:** `node tooling/src/cli.mjs cycle` should move you on, and
`company/charter.md` should no longer say "Untitled Company".

## Stage 2 — charter → spec (the one that decides everything)

> Read `company/charter.md` and `playbook/05-quality.md`. Write a spec in
> `company/specs/` with: the problem, scope (in and out), 5–8 numbered `AC-n`
> acceptance criteria that a test could objectively check, and the
> non-functional requirements. Set `status: draft`. Do not write any
> implementation.

Then **you** do the only review that matters: read each `AC-n` and ask *could a
QA agent write a failing test from this, without asking me a question?* If not,
rewrite it. When they all pass that test:

> I have read the spec and the acceptance criteria are fine. Set `status:
> approved`.

## Stage 3 — spec → tasks

> Read the approved spec. Decompose it into tasks with
> `node tooling/src/cli.mjs new task`, each with an owner, a `writes` scope, any
> `depends_on`, and a verification command that actually runs. Then run
> `node tooling/src/cli.mjs doctor` — it must report 0 errors.

**Check:**

```sh
node tooling/src/cli.mjs board --ready   # only what can start now
```

A task appears only when its dependencies are done *and* its spec is approved.

## Stage 4 — spec → mockup (UI work only)

An engineer building a screen from a paragraph of prose is building a guess, and
the guess is what the customer sees. So the mockup is a required artefact, and it
is a **file**, not a description.

Ask an agent:

> Take the designer role. For T-0004, read the spec and `design/tokens.css`, copy
> `design/screens/_template.html` to `design/screens/capture.html`, and build the
> screen: the real copy from the spec, the primary action, and all four states —
> empty, loading, error, success. Use only tokens: no raw hex, no magic pixel
> numbers. Do not write application code. Then set `design:
> design/screens/capture.html` on the task.

**The gate is mechanical.** `opc doctor` fails any task whose write scope touches
a UI path (`company/design-scope.json`) and which declares no `design:`, or whose
mockup file does not exist. `opc cycle` then reports *Stage 4 — mock up the
screens first* instead of handing you a build task.

**Your check:** open the mockup in a browser. Would you understand this screen
with no explanation? Are all four states there? Is the primary action obvious?

## Stage 5 — task → implementation

```sh
node tooling/src/cli.mjs pack T-0001 > /tmp/ctx.md
```

Then hand the pack to an agent — a subagent in this session, a teammate, or a
fresh coding session:

> Read `/tmp/ctx.md`. Do that task. Change only paths inside the declared write
> scope; if you need another path, stop and say so. Run the verification command
> from the task and paste its real output. If the spec is not approved or the
> write scope is wrong, stop.

**Do not paste the whole conversation into the agent.** The pack is the context;
that is the point of it.

## Stage 6 — implementation → passed

Two different agents, never the same one that wrote it.

**QA** (the `tester` specialist, or another subagent):

> Against `company/specs/<file>.md`, write the smallest test for each of AC-1 to
> AC-5 that would fail if the feature were removed. Run it. Paste the failing
> command and its evidence for anything that fails.

**Reviewer** (read-only, and told to distrust):

> You are the reviewer. Read the diff and the spec. Check every acceptance
> criterion. Did anything get added that the spec did not ask for? Is anything
> claimed that the diff does not support? Check `docs/architecture/README.md`
> against the change — did the shape change without the diagram changing? Cite
> `file:line`. Answer with one word: approve, request changes, or escalate.

Passed → set the task's `status: done`. **Editing the file is how you move the
card.** There is no other tracker.

## Stage 7 — deploy and operate

> Take the devops role. Build the CI job, the preview environment and the
> rollback. Actually execute the rollback once and paste the output.

**Your gate:** open the preview URL and use the thing yourself. If you did not
click it, it is not deployed.

### Operate → learn

Three schedules cover the loop (`playbook/11` has the exact `schedule_create`
calls): a daily `doctor` + `board` report, a daily support-inbox triage that
**drafts and never sends**, and a weekly metrics read where you write one
sentence into `company/roadmap.md`.

That sentence is the only steering the agent team gets. Write it.

---

## The daily ten minutes

```sh
node tooling/src/cli.mjs doctor        # is the machine healthy
node tooling/src/cli.mjs cycle         # what stage am I at, what is next
node tooling/src/cli.mjs board --ready # what can start now
```

Pick one, `pack` it, hand it to an agent, review it, move the card.

## The weekly forty-five

1. Read `company/metrics.md`. Ten numbers.
2. Read what shipped. What surprised you?
3. Write one direction sentence into `company/roadmap.md`.
4. **Delete one thing.**

Step 4 is the one people skip and the one that stops the company turning into an
archaeological dig.

---

## Two things this is not

**It is not one button from idea to deploy.** Nothing is. Your value is the four
decisions above.

**It is not a replacement for talking to customers.** The agents compress the
cost of building and operating. They do not compress the cost of being found —
that is still you, and it is still the binding constraint.
