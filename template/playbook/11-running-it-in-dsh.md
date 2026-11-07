# 11 — Running this org in DeepSeek Harness

You are reading this inside the harness itself. Good: the org in `playbook/` is
portable, but the harness already ships most of the runtime, so this file is
the short path.

## What the harness already gives you

| You need | DSH primitive | Notes |
|---|---|---|
| A durable team with a shared task board | **Agent Teams** — `spawn_teammate`, `list_agents`, `send_message`, `interrupt_agent`, `wait_agent` | already enabled in your `web` profile (`dsh-experimental-agent-team-profile`) |
| A shared board with dependencies and write scopes | **Team task board** — `team_task_create`, `team_task_get`, `team_task_list`, `team_task_update` | compare-and-set on `expected_revision`; `write_scopes` are advisory but visible |
| One-shot fan-out with an isolated context | **Subagents** — `subagent`, `subagent_fork` | the child returns a result, not its steps |
| Many-agent orchestration as a committable script | **Workflow** — `agent()`, `pipeline()`, `parallel()`, `phase()` | the script *is* the artefact you can diff and re-run |
| Reusable role instructions loaded on demand | **Skills** — `skill` tool, `SKILL.md` | description always in context, body loads on invocation |
| A durable objective across turns and restarts | **Goals** — `create_goal`, `update_goal`, `get_goal` | one objective per session, compare-and-set updates |
| A clock that keeps the company honest | **Schedules** — `schedule_create`, `schedule_list`, `schedule_update`, `schedule_delete` | daily/weekly/cron reminders delivered into the session |
| Work that runs while you do other things | **Jobs** — background, with completion notices in-session | bounded concurrency and output retention |
| An external tool the agents need | **MCP client** | keep it to a handful; each server costs context |
| A read-only adversary | **`spawn_specialist` → `reviewer`** | cannot write, cannot run commands; cites file:line |
| A test runner that reports evidence | **`spawn_specialist` → `tester`** | writes throwaway tests, runs commands, reports the failing command |
| A documentation editor | **`spawn_specialist` → `writer`** | docs only, no commands |
| A CI-shaped agent run | **`dsh headless "run the tests"`** | one task, stdout answer, exits |

That last one is worth pausing on: `dsh headless` is how you run the agent org
**inside your CI**, not just next to it.

## Mapping the ten roles onto the harness

| Role | How to run it here |
|---|---|
| `researcher` | `subagent` with a research prompt (one-shot, isolated context) or `workflow` with `parallel()` over 5 questions |
| `pm` | the Lead session itself, or a `subagent_fork` that inherits the charter |
| `architect` | `subagent` that writes ADRs into `company/decisions/` |
| `designer` | `subagent` writing into `design/`; use `spawn_specialist` → `writer` for the copy |
| `engineer` | `subagent` with a context pack and a declared write scope |
| `qa` | `spawn_specialist` → `tester` (it runs commands and reports the failing command with evidence) |
| `reviewer` | `spawn_specialist` → `reviewer` (read-only, cites file:line) |
| `devops` | `subagent` for config, `dsh headless` for the CI run itself |
| `support` | `subagent` for triage; `schedule_create` for the daily sweep |
| `growth` | `spawn_specialist` → `writer` for content; Lead for anything that reaches a person |

The three built-in specialist profiles are worth using as-is. They already
encode the right instinct — a reviewer that *cannot* write cannot "helpfully"
fix your code; a tester that reports the *exact failing command* cannot claim a
green suite it never ran.

## Recipe A — run one task through the whole pipeline

This is the daily loop. The Lead (you, or the session you are in) does the
bookkeeping; the specialists do the work.

**1. Pick the task.**
```sh
node tooling/src/cli.mjs board --ready
```

**2. Build the context pack.** This is the step that makes the difference.
```sh
node tooling/src/cli.mjs pack T-0003 > /tmp/ctx.md
```

**3. Hand it to an engineer agent.** A `subagent` prompt must be
self-contained — the child does not see this conversation:
```
You are the engineer role of a one-person company. Working directory:
/path/to/company.

Read /tmp/ctx.md first — it contains the charter, the spec, your task, your
write scope and the definition of done.

Do the work. Stay inside the declared write scope. Run the verification
command from the task. Put the real output in your final answer. If the spec is
not approved or the write scope is wrong, say so and stop.
```

**4. Send it to QA.** Use the built-in tester specialist:
```
Task: <task id and title>. Repo: <path>.
Write throwaway tests that would fail if the acceptance criteria in
company/specs/<file>.md were not met. Run them. Report the exact failing
command with evidence for anything that fails.
```

**5. Send the diff to the reviewer.** The built-in reviewer is read-only:
```
Task: <task id>. Repo: <path>.
Review the working-tree diff against the spec and the definition of done.
Check correctness, security, error handling, and whether the acceptance
criteria are actually satisfied. Cite file:line for every claim.
```

**6. Move the card.** Update the task file's `status:` to `review`, then to
`done` once the review passes. The board is derived from those files, so this
is the only place you edit.

## Recipe B — run the roles as a durable team

Use a team when the work is long-running and the roles genuinely need to talk
to each other (a feature that spans architecture, backend and web, where the
engineer needs to ask the architect a question mid-flight).

```js
// 1. create the members
spawn_teammate({ name: 'architect', description: 'Owns ADRs and interfaces',
  prompt: 'Read .agent/roles/architect.md and company/AGENTS.md. You own ...' })
spawn_teammate({ name: 'engineer', description: 'Implements approved specs',
  prompt: 'Read .agent/roles/engineer.md and company/AGENTS.md. You own ...' })
spawn_teammate({ name: 'qa', description: 'Proves the acceptance criteria',
  prompt: 'Read .agent/roles/qa.md and company/AGENTS.md. You own ...' })
```

```js
// 2. put the work on the shared board, with write scopes
team_task_create({
  subject: 'T-0003 OCR extraction job behind a provider interface',
  description: 'Full text of company/tasks/T-0003-*.md',
  write_scopes: ['apps/api/src/extraction/**', 'apps/worker/**', 'packages/db/**']
})
```

The `write_scopes` field is advisory — the harness does not lock files — but
it is visible to every member and to you, which is what makes a conflict
*noticeable*. Combine it with disjoint paths and it becomes effective.

```js
// 3. claim, work, complete
team_task_get({ task_id: '...' })       // read the current revision first
team_task_update({ task_id: '...', expected_revision: N, action: 'claim' })
```

The compare-and-set on `expected_revision` is a real safety property: two
agents cannot both claim the same task, because the second update fails
against a stale revision.

## Recipe C — make the rhythm automatic

The harness's scheduler is how the company keeps running when you are not
looking at it. Four reminders cover the whole loop:

```js
// Daily: the machine reports its own state
schedule_create({
  title: 'Daily company standup',
  prompt: 'Run `node tooling/src/cli.mjs doctor` and `node tooling/src/cli.mjs board`. Report: tasks ready, tasks in progress, anything blocked, and anything that needs a human decision. Be brief.',
  daily: { time: '09:00:00', time_zone: 'Asia/Hong_Kong' }
})

// Daily: nothing ships without a green build
schedule_create({
  title: 'Daily build and test check',
  prompt: 'Run the project verification command. If it fails, diagnose the cause and file a task for it. Report only failures and their cause.',
  daily: { time: '10:00:00', time_zone: 'Asia/Hong_Kong' }
})

// Weekly: the human writes one direction sentence
schedule_create({
  title: 'Weekly metrics review',
  prompt: 'Summarise the metrics in company/metrics.md and list what shipped this week. End with the single question I should answer to set next week\'s direction.',
  weekly: { time: '09:30:00', time_zone: 'Asia/Hong_Kong', weekdays: [1] }
})

// Daily: customer inbox sweep
schedule_create({
  title: 'Support inbox triage',
  prompt: 'Triage new support messages: answer the ones with a known answer from company/playbooks/support-answers.md, and file the rest as tasks on the board. Never send anything to a customer — draft it for my approval.',
  daily: { time: '17:00:00', time_zone: 'Asia/Hong_Kong' }
})
```

Note what the support reminder does: it **drafts for approval and never
sends**. That is the "customer-facing is a human gate" rule, encoded in the
schedule itself.

## Recipe D — a goal for a long objective

When an objective spans many turns (a migration, a launch, a research
question), use a goal so it survives a context reset:

```js
create_goal({
  objective: 'Ship the receipt capture flow end to end: backend capture, extraction job, mobile sheet, ledger, export — with every acceptance criterion in company/specs/2026-11-07-receipt-capture-and-expense-ledger.md verified by a passing test.'
})
```

The goal's `max_goal_rounds` caps the automatic continuation, which is the
guard against an agent that keeps going long past the point of usefulness.
Set it deliberately: a round cap that is too high is how a night's budget
disappears.

## Recipe E — the agent org inside CI

`dsh headless` runs one task and exits. That makes it a CI step:

```yaml
# .github/workflows/agent-review.yml
- name: Agent review of the diff
  run: |
    dsh headless --json \
      "Review the working-tree diff against company/specs/. \
       Report correctness, security and error-handling problems. \
       Exit non-zero if any problem is found."
```

Two designs worth having in CI:

- **An agent that reviews the diff** — a second opinion on every pull request,
  in the same style as the `reviewer` specialist.
- **An agent that writes the missing test** — given the spec's ACs and the
  current suite, write the test that is missing. Missing test coverage becomes
  a failing CI job.

Both are cheap relative to a human reviewer and both catch the class of
problem a solo founder is worst at catching: the obvious-looking mistake you
made an hour ago and have already stopped seeing.

## The caveats that matter here

**The shared checkout is the big one.** Every teammate observes the same
working directory, and the harness adds no worktree isolation or filesystem
locking. That means:

- Do not run two engineers on overlapping paths at the same time.
- Prefer one engineer at a time plus a read-only reviewer, which is safe
  because the reviewer cannot write.
- When you do need parallel writes, use disjoint write scopes and check them
  on the board before starting.

**One team per session** in the Claude Code lineage, with a fixed lead and no
nested teams. Keep the team flat: ten roles, one lead.

**The harness can start a goal, but it cannot schedule work** — goals persist
state; the scheduler delivers reminders. You need both: a goal for the
objective, schedules for the rhythm.

**Skills are context-efficient.** A role charter as a `SKILL.md` means the
summary is always visible and the body loads only when invoked. That is
strictly better than putting ten role charters in the root `AGENTS.md`, which
would tax every single turn.

## The portable version

The same org, in other harnesses, with the same file layout:

| This repo | Claude Code | Codex | Cursor | OpenAI Agents SDK |
|---|---|---|---|---|
| `company/specs/*.md` | the spec | the plan | `.cursor/rules` | instructions |
| `company/tasks/*.md` | `.claude/` task list, `passes: false` JSON | task list | tasks | handoffs |
| `.agent/roles/*.md` | `.claude/agents/*.md` (one subagent each) | roles | rules | agent instructions |
| `node tooling/src/cli.mjs pack` | `claude -p` with a packed prompt | `codex exec` | headless mode | programmatic |
| write scopes | `permissions.deny` + `--worktree` | worktrees | isolated VMs | sandbox policy |
| `node tooling/src/cli.mjs doctor` | CI step | CI step | CI step | CI step |
| review | `/code-review` | review pass | Bugbot | a grader |
| the daily rhythm | `schedule_create` (this harness) | scheduled tasks | background agents | cron + webhooks |

**The important point:** the harness is replaceable; the artefacts are not.
That is why everything in `company/` is markdown with a stable shape. If you
switch harnesses, you change `node tooling/src/cli.mjs pack` and nothing else.

## Recommended first run

If you want to see the whole machine work end to end, do this:

1. `node tooling/src/cli.mjs doctor` — the machine's health check.
2. `node tooling/src/cli.mjs board --ready` — see what is ready.
3. `node tooling/src/cli.mjs pack T-0001` — the context an agent would get.
4. Spawn the `reviewer` specialist on the scaffold itself: *"Read company/ and
   .agent/roles/ and report the inconsistencies between the roles, the
   checklists and the charter."*

Step 4 is the demo, because it is the org critiquing itself. A company whose
agents can find its own contradictions is a company that can be left running.
