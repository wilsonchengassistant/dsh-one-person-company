# 01 — Day one: setting the machine up

## Before you set up anything

The most common failure in this whole enterprise is setting up the machine
before choosing what it makes. You will end up with a beautiful operating
system for a product nobody wants.

So: **write the problem statement first**, in one paragraph, before you create
a single account.

```
For [specific person], who [does what job today], [this problem] costs them
[time/money/stress] [how often]. Today they solve it with [current workaround].
We will [what changes for them]. They will pay [how much] because [why this
is worth more than the workaround].
```

If you cannot fill in "specific person" without a generic word like "users" or
"businesses", you do not have a product yet. Keep researching; the machine can
wait an afternoon.

## The order of setup

Do these in order. Each one depends on the previous.

### Step 1 — The company OS (a day, free)

```sh
mkdir my-company && cd my-company
git init
node tooling/src/cli.mjs init     # from this repo, or copy tooling/ across
$EDITOR company/charter.md         # fill it in properly, this is load-bearing
```

Write the charter before anything else. Every agent reads it first. If it is
vague, every downstream artefact will be vague.

**The charter test:** could a stranger read it and decide, without asking,
whether a proposed feature belongs in this company? If not, rewrite it.

### Step 2 — The harness and the model (a day)

Pick one primary coding harness and one secondary. The primary does the work;
the secondary provides an independent opinion (a different model family
notices different bugs).

| Role | Recommended | Why |
|---|---|---|
| Primary harness | Claude Code CLI, or this DSH session | deepest memory/permission/hook/skill/subagent/worktree integration |
| Secondary | Codex CLI, or Cursor Cloud Agents | different model vendor; Cursor runs agents in a real VM |
| Non-coding roles | whichever harness is cheapest for the model tier | see `08-economics.md` on routing |
| Observability | OpenTelemetry GenAI export → Langfuse (self-hosted, free tier) | vendor-neutral wire format, so you can switch later |

**Do not buy five tools.** One good harness, one subscription, one API key.

### Step 3 — The repository (a day)

```
apps/
  api/          # the backend
  web/          # the web app
  mobile/       # the mobile app
  worker/       # background jobs
packages/
  db/           # schema, migrations, RLS, tests
  api-client/   # shared typed client + schemas
  ui/           # design tokens + components
  obs/          # logging, error tracking, redaction
  config/       # shared tsconfig/eslint
infra/          # infrastructure as code
company/        # ← the company OS lives here
.agent/         # ← roles and checklists live here
.github/workflows/
```

Monorepo with pnpm workspaces and Turborepo. TypeScript strict, one shared
`tsconfig` base, and **shared Zod schemas in `packages/api-client`** so the
web app, the mobile app and the worker cannot drift apart.

Why this shape: **it gives each role a natural write scope.** The agent team's
whole coordination model depends on being able to say "this task owns
`apps/api/**` and that one owns `apps/mobile/**`", and it works best when the
directory layout mirrors the org chart.

### Step 4 — The stack (two days)

The recommended default for a solo founder with agents:

| Layer | Choice | Why this one |
|---|---|---|
| DB + Auth + Storage + Realtime | **Supabase** (Postgres + RLS + Auth + Storage + Realtime) | the authorisation enforcement lives in the database, where the agents cannot rewrite it |
| ORM | **Drizzle** | SQL-shaped migrations an agent can read; no codegen step to break |
| Web | **Next.js (App Router)** on Vercel | free preview environment per pull request; instant rollback |
| Mobile | **Expo SDK 58 + React Native + Expo Router** | ships an MCP server, skills and an agent CLI — agents can build the app *and see it*; OTA updates ship JS-only changes without store review |
| Jobs | **pg-boss** on the same Postgres | zero new vendors, transactional with the data. Escalate only when a job exceeds 60s or needs multi-week waits |
| Billing | **Stripe Billing + Stripe Tax**, or a merchant of record (Lemon Squeezy / Paddle) if you sell globally and do not want to be the tax filer | Stripe keeps the customer relationship with you |
| CI | **GitHub Actions** | the thing the agent team cannot skip |
| Flags | **env var + a `features` table** | LaunchDarkly's free tier only covers 5 server SDK connections and 1K client MAU; you will not need per-user targeting on day one |
| Errors / monitoring | **Sentry** + **Better Stack** | Sentry is what tells you what broke at 3am; Better Stack gives monitors, a status page and one on-call seat |
| Secrets | **GitHub Environments** (+ Infisical if you need rotation) | never in the repo, never in `eas.json`, never in a mobile bundle |
| Analytics | **PostHog** (self-hostable) | keep customer data out of third-party analytics |

**Vendor ceiling: six.** Supabase + Vercel + Expo + Stripe + GitHub +
Sentry/Better Stack. Every additional vendor is another integration for an
agent to get wrong, another bill, another failure mode at 3am, and another
thing to know when the provider changes their pricing.

Alternatives, with the trade-off stated:

- **Cloudflare-first** (cheapest at scale): Workers + D1 + R2 + Queues, auth
  via Clerk. Workers Paid is $5/mo with 10M requests and no egress. You give
  up Postgres/RLS and work with single-writer SQLite.
- **Convex-first** (most AI-native): reactive DB with a single typed API that
  agents love. You pay per developer and accept a non-Postgres model.
- **Postgres-purity / self-hostable**: Neon or Supabase Postgres + Drizzle +
  pg-boss + R2 + Fly/Render. Neon Scale is $0.222/CU-hr with 30-day history.

**One warning:** the Supabase free tier **pauses free projects after one week
of inactivity**. Do not build a demo on it and forget — go to the $25 Pro plan
before you have a real user.

### Step 5 — Accounts, money, and the ceilings (half a day)

Create the accounts, then write the ceilings down *before* the agents start.

```sh
node tooling/src/cli.mjs init   # already created company/budget.md
$EDITOR company/budget.md       # set real numbers for your ceiling
```

A realistic starting budget, from the researched price points:

| Bucket | Ceiling/mo | Notes |
|---|---|---|
| Model / agent API | €400 | inference for the agent team |
| Coding-agent subscription | €200 | one seat, one harness |
| Infrastructure | €150 | starts near €0; grows with revenue |
| Third-party SaaS | €150 | auth, billing, monitoring, analytics |
| Marketing | €200 | content and distribution before ads |
| Legal & accounting | €200 | incorporation, tax, bookkeeping |
| **Total** | **€1,300** | |

**The number that matters:** AI tooling costs roughly 2–4× your infrastructure.
At €50 MRR your agent subscription can exceed your entire infra bill. Budget
for it as a cost of labour, not as infra.

Also set the hard caps in the tools themselves — a per-session spend cap
(`--max-budget-usd` in Claude Code), provider spend limits, and a monthly
ceiling on the API key. **An agent with an uncapped key is an outage.**

### Step 6 — The gates, before the first line of product code

Install the checks that the agents cannot skip:

```sh
# CI: lint, typecheck, unit, db tests, build, preview deploy
# plus:
pnpm install --frozen-lockfile     # no lockfile drift
osv-scanner scan ./                 # known vulnerabilities
gitleaks detect                    # secrets
```

And in the harness, deny the dangerous capabilities rather than asking nicely:

- The agent environment has **no production database URL**.
- The agent environment has **no billing API credential**.
- The agent environment has **no outbound email credential**.
- The agent may only edit the paths its task declares.

**A rule that lives in a prompt is not a rule.** Put it in Postgres (RLS), in
CI, in branch protection, or in the harness's permissions. An agent that can
edit the file containing the rule will eventually edit the rule.

### Step 7 — The first spec (a day)

Not a feature — a *slice* that a stranger could pay for. Write it in the spec
template, with numbered acceptance criteria that a QA agent can turn into
tests without asking a question.

Then decompose it into tasks:

```sh
node tooling/src/cli.mjs new task "..." --spec company/specs/<file>.md \
  --owner agent:engineer --priority P1 --writes "apps/api/**"
```

Aim for tasks that are **independently verifiable** — each one has a
verification command that passes on its own. If a task cannot be verified on
its own, it is too big; split it.

### Step 8 — Run the loop once, by hand

Before you automate anything, run the whole pipeline once yourself:
research → spec → design → implement → test → review → ship (to a preview
environment, not to production).

You are looking for one thing: **does the machine produce something you would
have shipped?** If the first pass is not good enough, the problem is in the
spec or the role charters, not in the harness. Fix those and run it again.

## The first week, day by day

| Day | Do this | Done when |
|---|---|---|
| 1 | Write the problem statement and the charter | a stranger could judge a feature against the charter |
| 2 | `node tooling/src/cli.mjs init`, set up the repo, install CI gates | CI runs green on an empty repo |
| 3 | Pick the stack, create the accounts, set the ceilings | `company/budget.md` has your numbers, tools have hard caps |
| 4 | Write the first spec with numbered ACs | a QA agent can write failing tests without asking |
| 5 | Decompose into tasks, set write scopes | `node tooling/src/cli.mjs board --ready` shows work you can start |
| 6 | Run one task end to end with an agent | you clicked the working feature in a browser |
| 7 | Fix whatever broke in the process; write down what broke | `company/decisions/` has the first ADR |

## The first month

- Ship one narrow slice to **one real user** — a friend, a colleague, someone
  who will tell you the truth.
- Set up the daily and weekly schedule (`playbook/11-running-it-in-dsh.md`).
- Turn the first support questions into tasks within a day of receiving them.
- Do the first full `node tooling/src/cli.mjs doctor` review of your own artefacts.
- Decide whether the agent's output is good enough to keep going. If it is not,
  the answer is a better spec, not a better model.

## What to deliberately not set up yet

| Do not | Until |
|---|---|
| Vector database / RAG over your own code | you have >10k documents — the code is on disk and `grep` beats it |
| A second queue / workflow platform | a job exceeds 60s or must survive deploys |
| A microservice | a component demonstrably cannot scale or be deployed with the rest |
| LaunchDarkly | you need per-user targeting |
| SOC 2 | a customer asks for it (Vanta/Drata are commonly quoted $10k–30k/yr) |
| Five agent frameworks | ever |
| A mobile app | the web version has a user who asked for it twice |
| A CRM | you have more than ~50 customers |
