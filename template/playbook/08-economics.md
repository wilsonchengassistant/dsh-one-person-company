# 08 — Economics: what this actually costs

## The headline

The AI spend is **not** the interesting cost. The interesting cost is **your
attention on merged work**, and the second cost is **customers who need you**.

Anthropic publishes the number to plan against: roughly **$13 per developer per
active day**, i.e. **$150–250 per developer per month**, with 90% of users under
$30 per active day. For a one-person company, plan for **€200–400/month of
model spend** and treat it as a fixed cost of production, like a salary.

The trap is that model spend is *visible* and *variable*, so it attracts all
the attention, while the real cost — your hours, and the operational burden of
being the only human — is invisible until you are exhausted.

## Where the money goes

| Bucket | Typical | Notes |
|---|---|---|
| Coding agent subscription | €30–200/mo | Claude Code Pro/Max, Cursor, Copilot Pro+ |
| Model API for the other roles | €50–250/mo | research, QA fan-out, workflows, support |
| Infrastructure | €0–150/mo | starts free; grows with revenue |
| Third-party SaaS | €50–200/mo | auth, billing, monitoring, email, analytics |
| Observability (optional) | €0–30/mo | Langfuse self-hosted free tier is enough to start |
| Marketing | €0–200/mo | content and distribution before ads |
| Legal / accounting | €100–300/mo | incorporation, tax, bookkeeping |
| **Total, realistic** | **€300–1,300/mo** | see `company/budget.md` for the ceilings |

### The prices, as of 2026-11

Verify before you rely on them — these move.

| Tool | Pricing | Source |
|---|---|---|
| Claude Code | Pro $20/mo · Max 5× $100/mo · Max 20× $200/mo · Team $20–25 per seat | claude.com/pricing |
| Cursor | Hobby free · Pro $20 · Pro+ $60 · Ultra $200 · Teams $40 per seat — **metered even in Auto mode since Aug 2026**; third-party models billed separately at API list price | cursor.com/pricing |
| Model API | Claude Sonnet 5 **$2/$10 per MTok** (the Sept-2026 rise was cancelled on 11 Aug; anything forecast at $3/$15 is budgeting 50% high) · Opus 5 $5/$25 | Anthropic pricing |
| Codex | included in ChatGPT plans, or API credits: Sol 50 in / 2.5 cached / 250 out per 1M tokens | learn.chatgpt.com/codex/pricing |
| Devin | $0 · $20 · $80min · $200 + metered ACUs (ACU rate, allowance and concurrency **not published**) | devin.ai/pricing |
| Langfuse (observability) | Hobby free (50k units/mo) · Core $29/mo · Pro $199/mo | langfuse docs |
| Braintrust (evals) | Starter $0 · Pro $249/mo | braintrust.dev |
| LangSmith | paid, tiered | langchain docs |

Third-party estimate (treat as a floor, not a forecast): **~$9–10.50 per
*merged* task** for Devin-class autonomous agents, assuming a 43% merge rate and
2 ACU/task. The assumption is the message: **meter merged work, not attempts.**

### The runaways you must design against

These are real, and they are the reason hard caps are non-negotiable:

| Incident | Cost |
|---|---|
| One company ran **~$500M for 30 days** because it "failed to put usage limits on Claude licenses" (Axios, May 2026) | $500M |
| Uber gave ~5,000 engineers Claude Code, hit 84% adoption by March, and **burned its full 2026 AI budget by April** at $500–2,000 per engineer per month | — |
| One solo developer's overnight loop | **~$6,000** — a script re-sent a huge context every 30 minutes, and *nothing warned him*: the usage dashboard lags by days |

**Three controls, in order:**

1. **A per-session spend cap** in the tool (`--max-budget-usd`), a **provider**
   spend limit, and a **monthly hard ceiling** on the key.
2. **A wall-clock cap** on agent runs, not just a token cap. An infinite loop
   is bounded by tokens, but a slow loop that re-reads context every 30
   minutes is bounded by neither.
3. **Fast alerting.** The usage dashboard lags by days, which means a daily
   review is not a control. You need an alert that fires within minutes.

**Measured baseline:** a U-curve study measured **$1.62–$2.17 per 3–12-task
run** on Sonnet-class models (≈$0.50–$0.70 per task) when the context is
managed well. Treat these as orders of magnitude, not unit prices.


## The four cost multipliers

### 1. Caching — a 10× factor, and you get it for free or not at all

Cached input costs roughly **$0.30 per million tokens vs $3 uncached** on
Sonnet — a 10× difference. Codex's credit rates show the same shape (Sol 50
uncached → 2.5 cached).

**What kills the cache:** anything that mutates the prompt prefix. A timestamp
in the system prompt. A different tool ordering. A re-serialised JSON object
with unstable key order. An agent that "helpfully" re-reads a file into the
context differently each turn.

**What preserves it:** a stable prefix, append-only context, deterministic
serialisation.

Practical rule for your repo: **never put a timestamp or a random ID in the
first part of a prompt.** Put it at the end.

### 2. The fan-out multiplier

Anthropic's cost docs note **agent teams use roughly 7× more tokens** than
standard sessions when teammates run in plan mode. Five agents is not five times
the cost — it is closer to seven times, because each one re-reads the shared
prefix.

That means the fan-out decision is a budget decision:

| Fan-out | Use it for | Cost |
|---|---|---|
| 1 agent | the default | baseline |
| 3–5 agents | parallel research; a feature split across disjoint files | ~7× |
| 10+ agents | rare, only via a workflow script with a budget cap | ~7×+ per wave |

**Set the agent-count budget before the run, not after.** Claude Code's own
guidance targets under 10 agents for a "medium" workflow and under 50 for a
"large" one, and warns above 25 agents or a projected 1.5M tokens.

### 3. Context growth

A session open for hours re-sends the whole conversation every turn. The
dominant waste in a long-running agent session is **long context, not long
thinking**.

The cheapest, highest-return action in the whole playbook: **`/clear` between
unrelated tasks.** Second best: the context pack, so each task starts with a
bounded context instead of an inherited one.

### 4. Model routing

Run the cheap model on the boring work.

| Work | Model tier |
|---|---|
| research assembly, support triage, log summarising, ticket classification | fast/cheap model |
| routine implementation, test writing, refactors | mid tier |
| architecture, ambiguous specs, hard debugging, final review | expensive/reasoning tier |

Anthropic documents routing easy questions to Haiku-class and hard ones to
Sonnet-class as a production workflow. Note that **thinking tokens bill as
output tokens** — so the `/effort` slider and the thinking budget are the two
biggest levers after caching.

## Unit economics of a one-person SaaS

The model, simply:

```
MRR          = customers × ARPA
Gross profit = MRR − (infra + model + SaaS + payment fees + support time × your rate)
Your salary  = MRR − gross profit − (tax + legal + marketing)
```

The numbers that decide whether this works:

| Lever | Rule of thumb |
|---|---|
| Infrastructure | stays under **15% of MRR** |
| Model + agent spend | under **10% of MRR** once you have revenue; treat it as fixed cost before that |
| Payment fees | 2.9% + €0.25 (plus VAT handling — use a merchant of record if you do not want to be the VAT point) |
| Support | budget **1–2 hours/week per 100 customers** with AI triage doing the first pass; past that, the model is not scaling your company |
| Your time | the real constraint. If you need more than ~20 h/week to keep it running, the automation is not working yet |

### What MRR do you need?

The model:

```
required MRR = (fixed burn + desired pre-tax profit) ÷ (1 − payment% − tax% − infra%)
```

Two worked examples:

| Plan | Burn | MRR needed | Customers |
|---|---|---|---|
| **$100/mo** | $4,500 (living $4,000 + tools/AI $300 + infra $200) | $4,500 ÷ 0.745 = **$6,040** | **~60** (→ **~72** with a 20% churn/slippage buffer) |
| **$500/mo** | $4,500 + tax | 15 customers = $7,500 MRR → $5,475 after payments, tax, infra | **15** → $975/mo profit. 10 customers leaves you **$1,000/mo short of burn** |

**ARPA dominates customer count.** A 30% price rise has ~100% margin
flow-through and typically out-earns a quarter of feature work. The cheapest
lever in the whole business is the price.

**The honest number:** with a €1,300/month ceiling and a modest salary, you
need roughly **€4,000–6,000 MRR** at a €29–49 ARPA — about **100–200
customers**.

That number is where the "one person replaces twenty staff" framing needs a
reality check: at €29/mo you need 100 customers to replace one engineer's
salary, and 100 customers is a *distribution* problem, not an engineering
problem. The agents make the engineering cheap. They do not make the customers
appear.

**This is the most important sentence in this file:** AI compresses the cost of
*building and operating*. It does not compress the cost of *being found*. Plan
for that. It is why `07-business.md` spends so much on distribution.

### The cost structure of a solo SaaS

Directional, at $10K MRR: infrastructure 1–3%, LLM/API 1–5%, **payment
processing ~3.5%** (2.9% + $0.30 — usually the largest single line), tools
1–2%. Total **6–13% of revenue**, net 70–90% if AI costs stay managed.

**The line that grows without warning:** past roughly **200 customers**,
unstructured support becomes a part-time job. Plan for it — either by pricing
it, or by turning the support load into documented answers.

### Business customers change the SLA, not the code

Business buyers need a response SLA and an escalation path that one person
cannot staff 24/7. Do not fake it. Publish an **honest best-effort SLA**, a
status page, and optionally prepaid support hours. After that, **reliability
becomes your churn driver** — which is exactly what DORA's change-failure
rate measures.


## Cost control mechanisms, ranked by effect

1. **Cache-aware prompts.** Free 10×. Do this first.
2. **Bounded context packs.** Cuts both cost and quality problems.
3. **`/clear` between unrelated tasks.** Free, immediate.
4. **Model routing.** Cheap models for triage and drafting.
5. **Hard budget caps per session** (`--max-budget-usd` in Claude Code; spend
   limits in Codex; a Gateway with spending limits in Pydantic AI).
6. **Track spend per task.** Claude Code exports per-user token and cost
   metrics over OpenTelemetry — this is the only option that streams
   near-real-time per-user spend into your own stack. Worth the setup.
7. **Weekly `/usage` review.** It attributes spend per skill, subagent, plugin
   and MCP server, and suggests trims. Most people find one expensive thing
   they did not know about.

## The rule to remember

> **Divide your AI spend by merged work, and count your own review time in the
> same ledger.**

The second half is what makes the metric honest. An agent that produces 50
pull requests that you spend 8 hours reviewing has not saved you anything — it
has moved work from writing code to reading code, and reading code is harder.

The good target is: **a merged change costs you less review time than it would
have cost to write.** Everything else is theatre.
