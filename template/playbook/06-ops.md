# 06 — Operations: running it alone, at 3am

## The shape of solo operations

A team has a rota. You have a habit. The difference is that your habit must
cover four things that a team splits:

1. **Deploy** — getting code into production safely
2. **Observe** — knowing what is happening
3. **Respond** — being on call for one person
4. **Maintain** — keeping the thing alive over months and years

The single biggest design decision: **make the machine tell you when it needs
you**, and make it impossible for you to not know.

## Deploy

### The path

```
push → CI (lint, typecheck, unit, db tests, build) → preview env + seeded DB
     → agent writes evidence to the PR → reviewer agent → human approves merge
     → migrate (expand/contract) → release → health check → watch
```

Every pull request gets a **preview environment with a seeded database** — a
database branch (Supabase branches, or Neon branches at ~$1.50/branch-month)
means the preview has real migrations applied, so the agent can click through
the real flow. This is the highest-value €25/month you will spend.

### Migrations: expand/contract, always

1. **Expand** — add the nullable column or new table. Backfill.
2. **Dual-write** and read the new one.
3. **Contract** — drop the old one, in a *later* release.

Never rename in one deploy. Every migration needs a tested `down`.

**And a rule that surprises people:** in production, a database rollback is a
**forward fix, not a down-migration**. Agents will instinctively run
`db:rollback` against production because the script exists. Forbid it at the
CI/policy layer: the agent environment has no production database URL, and the
rollback runbook says "restore from PITR or ship a forward fix".

### Rollback

| Layer | Rollback |
|---|---|
| Web | instant — Vercel rollback to the previous deployment |
| Mobile | instant for JS-only changes — republish the previous Expo Update channel. **Native changes need a full store cycle.** |
| Database | forward fix, or PITR restore. Never a down-migration in prod |
| Flags | flip the flag off — instant and safest |

**Test the rollback once, for real, before the first customer.** A rollback you
have only written down is not a rollback. Paste the output into the release
note, which is what proves it happened.

### Mobile releases

Expo OTA updates are the single biggest solo-dev lever: JS-only changes ship in
minutes without a store review. Limits worth knowing: free tier 1K MAU,
Starter 3K, Production 50K, then $0.005/MAU; free tier gives 15 iOS + 15
Android builds/month; Starter $19/mo; Production $199/mo.

Store distribution, when you do need it: TestFlight internal → external →
App Store **phased release** (7 days) → Play Console **staged rollout**
(1/2/5/10/20/50/100%). A staged rollout that stalls at 2% for an hour is your
best friend at 3am.

### Feature flags

An env var for infrastructure switches; a `features` table for product flags.
LaunchDarkly's free tier only covers 5 server SDK connections and 1K client
MAU — you will not need per-user targeting on day one, and a table row is
enough.

Flags are also the release strategy: **ship dark, watch, then widen.** For a
one-person company this is the difference between "a bug" and "a bug that
reached 5% of users".

## Observe

### The instrumentation set

| Tool | What it does | Cost |
|---|---|---|
| **Sentry** | errors, mobile crash reports, logs, tracing, cron monitors, uptime; plus an MCP server so agents can query and triage directly | free tier to start |
| **Better Stack** | 10 monitors + 1 status page free; one on-call responder seat $29–34/mo; AI SRE for internal incidents (consumption) | free → $29 |
| **PostHog** | product analytics, self-hostable | free |
| **Your own metrics** | the 12 numbers in `company/metrics.md` | free |

**Sentry on every deployable from day one.** It is the thing that tells you
what broke at 3am, and its MCP server lets the devops agent query it without
you having to copy an error message into a chat window.

### What to log, and what never to log

Structured JSON logs with redaction. The hard rule: **never log customer
data** — no receipt images, no extracted fields, no personal data, no
credentials.

Enforce it with a CI grep gate, not a code-review promise:

```yaml
# .github/workflows/ci.yml
- name: No customer data in logs
  run: |
    ! grep -rniE '(receipt_image|customer_email|full_?card|api[_-]?key)\s*[:=]' apps/ packages/ \
      --include='*.ts' --include='*.tsx' || (echo "customer data in logs" && exit 1)
```

### The dashboard that matters

One screen, five numbers, checked daily by the agent:

1. Request error rate (last 24h)
2. p95 latency on the primary path
3. The activation metric (signup → first value)
4. Daily signups
5. Open support tickets

Everything else is a distraction until you have 100 customers.

## Respond — on call for one human

### Severity tiers

| Tier | Definition | Response |
|---|---|---|
| **SEV1** | money lost, data exposed, the product is down | phone call, fix now, tell customers within 1h |
| **SEV2** | a core flow broken for some users | same working day |
| **SEV3** | a non-core flow broken | this week |
| **SEV4** | a rough edge | the backlog |

Write this down in `company/playbooks/` and let the agent use it to triage. The
agent classifies; **you decide**.

### The error budget

Define it, write it into `company/playbooks/on-call.md`, and let the agent
honour it:

> If the error rate exceeds 2% of sessions for 15 minutes, **freeze releases
> and fix first**.

This is the mechanism that stops the "one more feature" reflex from turning
into a bad week.

### Alerting rules

- **Alert on symptoms, not causes.** "Checkout error rate above 2% for 5
  minutes" wakes you up. "CPU above 70%" does not.
- **Every alert has a runbook.** An alert with no runbook gets deleted, not
  tuned. This is the single most effective way to avoid alert fatigue.
- **One responder seat.** You are the responder. Better Stack's $29–34/mo
  responder seat gives you a rota of one and a phone call when it matters.
- **Dead-man's switch.** If the heartbeat stops, you get pinged — this catches
  the failure mode where everything is down but nothing reports.

### The incident runbook

`node tooling/src/cli.mjs new incident "..."` creates the template. The shape that works:

```
SEV1/SEV2/SEV3 | Started | Resolved | Owner | Human paged
Impact         — who was affected, how, for how long. Numbers, not adjectives.
Timeline       — what happened, when
Root cause     — not "a config was wrong". What system condition allowed it?
What hid it    — which signal should have caught this earlier?
Action items   — each with an owner and a date
```

The **"what hid it"** field is the most valuable one: it converts an incident
into a detection improvement. If a bug reached production because no alert
fired, the action item is a new alert, not a new test.

## Support

### The AI-first support model

AI can genuinely resolve a large share of a clean tier-1 queue — the research
puts it at 40–70% on well-behaved queues, with the caveat that most vendor
"deflection rate" numbers measure *answered*, not *resolved*. Measure
**confirmed resolution**: did the customer say it was fixed?

Tools worth looking at: Fin (ex-Intercom), Zendesk AI, Decagon, Crisp. Costs
range from ~$0.99 per outcome to $19–55/mo plus per-resolution fees. For a
solo founder, the honest starting point is **an LLM with your documentation
retrieved**, not a dedicated product.

### The rule that keeps it safe

The support agent **drafts; the human sends.** Anything involving money,
refunds, dates, contracts, data deletion, or an emotional customer goes to
you. This is the same charter rule as everything else — and it is cheap to
enforce, because the agent simply does not have an outbound email credential.

### Support is your best research instrument

Every ticket that asks the same question twice is a product defect or missing
copy. The support role should file it as a task **the same day**. If you only
do this one thing, the product gets better faster than any feature roadmap.

### The in-app feedback loop

A "Send feedback" button that attaches the session id, app version, last N
errors and a screenshot turns a vague complaint into a reproducible bug. This
is the highest-leverage twenty lines of code in a solo company's support
stack.

## Maintain

### The weekly maintenance hour

| Task | Who | Cadence |
|---|---|---|
| Dependency updates (Dependabot PRs) | engineer agent | weekly |
| Review the dashboard, act on anomalies | devops agent + human | daily |
| Read the support inbox, file tasks | support agent + human | daily |
| Read one research brief | researcher agent | weekly |
| Update the roadmap with one direction sentence | human | weekly |
| **Delete one feature, flag or dependency** | human | weekly |

That last line is not a joke. It is the highest-leverage maintenance activity
there is, and it is the one a machine will never do for you, because the
machine did not pay for it.

### The security routine

| Check | Tool | Cadence |
|---|---|---|
| Known vulnerabilities | `osv-scanner` in CI + Dependabot | every push |
| Secrets in the repo | gitleaks + GitHub secret scanning | every push |
| Lockfile integrity | `pnpm install --frozen-lockfile` | every push |
| Exposed RLS | pgTAP suite per table | every push |
| Dependency review | GitHub's dependency review | every PR |
| Restore drill | restore a backup into a scratch project | **quarterly** |

Note the last one: **agents will claim backups exist without ever testing a
restore.** Do it once a quarter and record the result.

### The five-year plan

Things that will catch you out, in order of likelihood:

1. **The framework you standardised on changes.** Plan for it: everything is
   files, so the migration is `node tooling/src/cli.mjs pack` and a new prompt.
2. **Your model provider changes pricing or availability.** Route through a
   gateway (OpenRouter) or keep a second vendor warm.
3. **The agent's output quality plateaus.** This is the most likely one, and
   the fix is *not* a better model — it is a better spec and a stricter gate.
4. **You become the bottleneck.** The answer is delegation to the agents, not
   more hours.
5. **The business changes shape.** The roles are stable; the products are not.
   That is the whole point of the 80%.

## The whole thing in one page

```
MORNING   agent runs doctor + board → you read 10 lines
          agent runs the verification command → you read 1 line
MIDDAY    agent drafts escalations → you decide
AFTERNOON agent deploys behind a flag → you click the preview
EVENING   agent triages support → you read the drafts
WEEKLY    agent writes a research brief → you write one direction sentence
          you delete one thing
```
