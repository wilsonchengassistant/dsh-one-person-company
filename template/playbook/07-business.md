# 07 — Business: money, law, customers

## The number that decides everything

Ai compresses the cost of **building and operating**. It does not compress the
cost of **being found**.

The clearest evidence in the research: Honghub's 2026 One-Person Company
Insight Report (1,500 questionnaires) found **"how do I find users" is the single
most unresolved problem for over half of surveyed OPC founders**. The same
report found **half of OPC founders earn under ~$970/month**, and the dominant
emotions are **anxiety (11%), self-doubt (8%), loneliness (7%)** — the hidden
cost of being CTO, CMO, CFO and support at the same time.

That is the shape of the problem. Your agent team can build and operate a
product superbly. It cannot manufacture distribution.

## Validate before you build

The failure data is unusually good, which means it is unusually actionable.

| Case | Outcome | Lesson |
|---|---|---|
| **Pieter Levels** — 115 projects, 20 self-tagged failures, **9 successes (8%)** | ~$200–250k/mo revenue at a 94.5% margin, but a 17% failure rate and a lifetime of projects nobody paid for | *"I'm not going to build anything until there are customers."* |
| **FacelessForge** — public kill line: ship 8 Oct, if no first paid subscription by 15 Oct, shut down and publish | **0 paid subscribers, $0 revenue** in 7 days | The landing page was broken for ≥3 of the 7 validation days — **check your funnel before you read a zero**. Single-channel distribution was a structural mistake. *"Competitor revenue is not demand validation for your SKU."* |
| **NESTLY** — AI pregnancy/newborn platform | 6 users, $0 revenue | *"We had no money and no idea what we was doing."* Likely a wrapper around an LLM API — cost without differentiated value for users who did not exist |
| **Base44** — 1 founder + 8 employees, profitable by month 6, $189k net profit, acquired by Wix for $80M | Word of mouth: 10,000 users month 1 → 250,000 month 6 | Sold because it "hit its limit" — **not** a one-person company |

### The kill-line discipline

FacelessForge did the smartest thing in this whole research: it set a **public
kill line with a date before it started**. Ship by 8 Oct; if no first paid
subscription by 15 Oct, shut down and publish the post-mortem. That converts an
open-ended burn into a bounded experiment.

Do the same, and write it into `company/roadmap.md`:

> **Kill line:** if by `<date>` we have not signed `<N>` paying customers who
> used the product without me prompting them, we stop and publish what we
> learned.

Two conditions make it work:
1. **A real payment**, not a "interested" email. Someone's card.
2. **A date**, not a feeling. "When it's ready" is not a kill line.

## Finding users

### The honest ranking of channels for a solo founder

| Channel | Cost | Speed | Notes |
|---|---|---|---|
| **Existing network** | free | immediate | The single most under-rated channel. Levels' 300k-follower audience *is* his unfair advantage — and the research on his case explicitly lists it as one of seven things that do **not** transfer to you |
| **A community you already participate in** | free | slow | You must be a member before you post. Spam gets you removed and remembered |
| **Content that solves a problem** (not content about your product) | low | slow | Compounds. The only channel that keeps working after you stop paying |
| **SEO / programmatic SEO** | low | very slow | Now complicated by AI Overviews and AI referral traffic — see below |
| **Cold email / outbound** | low | fast | Subject to deliverability law. See below |
| **Paid ads** | high | fast | Only after you know your activation rate. Otherwise it buys you expensive learning |
| **Paid acquisition at scale** | high | fast | A trap for a solo founder: fixed costs, no leverage |

**The strategic point:** you cannot buy distribution, and you cannot rely on an
audience you have not built. So build one **owned** channel — a list, a
newsletter, a community, a YouTube channel — where the audience is yours and
cannot be repriced.

### SEO in 2026: the referral problem

Two things changed and both matter:

1. **AI Overviews and assistants answer the query.** "Best receipt scanner"
   now often returns an AI summary, not ten blue links. Classic SEO tactics
   lose traffic to the summary.
2. **AI assistants send referral traffic you cannot attribute.** ChatGPT,
   Perplexity and Claude list a source; your analytics sees it as a referrer
   or as nothing at all. **Your traffic will look smaller than it is**, and you
   will make wrong decisions about what to keep.

The response is not "stop doing SEO". It is:
- **Answer the question directly and completely**, so an assistant quoting you
  is quoting something accurate (and so you get the citation).
- **Measure AI referral separately** from organic — otherwise you will kill
  the channel that is working.
- **Own the destination**: an email list, an app install, a community. Anything
  that survives an algorithm change.

GEO/AEO tools exist (Peec €89, Profound $99, Rankscale €20, SE Ranking $103+)
but the ones that matter are cheap and manual: check what assistants actually
say about your category, and fix the gaps.

### Cold email: the rules are the product

Deliverability is now enforced, not best-effort.

- **Google and Yahoo bulk-sender requirements** (enforced since 2024): SPF,
  DKIM and DMARC alignment, a one-click unsubscribe, honouring unsubscribes
  within 2 days, and a spam rate below 0.3% (Google's threshold).
- **Never send from a lookalike domain.** Warm the sending domain for weeks.
- **Send from a real person's mailbox**, low volume, with a genuine personal
  hook. Volume is how you get blocked.
- **FTC CAN-SPAM**: accurate headers, a real physical address, a working
  unsubscribe honoured promptly, and no deceptive subject lines. GDPR adds a
  legitimate-interest basis for B2B outreach in the EU, with opt-out rights.
- **Cold email is only viable if the personalisation is real.** "Saw you raised
  a Series A, congrats" is spam. "Your job posting mentions manual expense
  entry — here's what that costs a 10-person team" is a message.

### The metric that matters

Not traffic. **Activation**: the percentage of signups who reach first value.
Levels' blog and Base44's word-of-mouth growth both point the same way — the
product has to be good enough to be *told about*. Build for the referral
before you build for the acquisition.

## Customer research: what AI can and cannot do

This is the most useful finding in the non-engineering research, because it
kills a popular idea.

**AI can** do the mining and synthesis: pull app-store, G2, Reddit and forum
feedback via scrapers, cluster the themes, cite every quote, build a
competitive teardown, draft a survey.

**AI cannot be the customer.** Two independent 2026 studies:

- A Columbia-led study trained digital twins on 500+ answers each and tested
  them across 19 studies and 164 outcomes. The twins predicted their humans
  **barely better than a generic model** (average human-to-twin correlation
  **r = 0.20**), and exhibited systematic distortions including
  **hyper-rationality** — being logical exactly where people are not.
- A psychometric audit of 37 LLMs as survey respondents found the best model
  scored **PSS 0.81** vs a Gaussian copula 0.82, and **real answers from the
  same 100 people scored 0.89**. A classifier separated LLM from human
  responses at **median AUC 0.99**. The samples compressed the response scale
  and **lost** predictive validity on held-out humans (mean R² **−0.14** vs
  0.28).

**The rule:** synthetic users are fine for desk research, stress-testing a
guide, and generating edge cases. **They are not the voice of the customer.**

### The cheap verification trick

Run the research brief **twice**, with two different agents or two different
models, and **diff the claims**. Only the intersection ships. Then spot-check
five claims by opening the URLs. Cost: near zero. Value: it removes the
plausible-sounding invention, which is the main failure mode.

## Legal and practical constraints

*Orientation only. Get a professional for your specific situation — this is
the section where a confident wrong answer is expensive.*

### The agent is a tool, not an employee

As of 2026, an AI agent has no tax identity, no payroll, and income is
attributed to the controlling entity. But the *framing* creates risk: calling
it an "AI employee" engages employee-vs-contractor tests turning on **control,
integration and economic dependence**, and a plaintiff will argue you are
carrying employee-level liability. **No court has classified an AI agent as an
employee.** Existing agency and vicarious-liability doctrines run into a dead
end when no human acts at the moment of harm.

**Practical rule: never describe your agents as employees** — in contracts, in
marketing, or in a job title. They are tools you operate.

### Three live regimes you should know about

1. **Colorado's AI Act (US), effective 30 June 2026** — a *deployer* is
   responsible for AI used in consequential decisions, **may not shift
   liability to the vendor**, must run annual impact assessments, and must
   report discriminatory outcomes to the Attorney General within 90 days.
2. **EU Product Liability Directive, transposition due 9 December 2026** — AI
   systems, including SaaS-delivered models and cloud agents, are **products
   under strict liability**, with a defect presumed when mandatory
   cybersecurity or AI Act requirements are breached.
3. **EU AI Act high-risk obligations from August 2026** — human oversight
   requirements in employment contexts.

**The responsibility gap is the current default.** That is the argument for
keeping a human in the loop on consequential decisions, and for the charter
rule "the agent may not decide anything that affects a person's employment,
credit, health or liberty."

### Entity, tax and invoicing

| Choice | What it means |
|---|---|
| Sole proprietorship | 1040 + Schedule C, Schedule SE, quarterly 1040-ES. Simple. No liability shield. |
| LLC (single-member) | liability separation, state filings, slightly more admin. You can elect corporate treatment and then S-corp status |
| S-corp | by election, subject to eligibility; corporate tax on distributions |

The LLC-vs-sole-prop choice turns on one question: **can your product hurt
someone?** If yes (payments, health data, employment, anything with physical
consequences), the liability separation is worth the paperwork.

You are the contracting party, so you need a processor or merchant of record
(Stripe, Lemon Squeezy, Paddle) and you issue the required 1099s. No payroll,
no benefits, no workers' comp — and no shield for your own errors.

**Flag for professional advice:** entity and tax election; sales tax and EU
VAT/OSS; IP assignment for AI-assisted code; data-processing agreements with
every vendor that touches customer data; and the first real hire (headcount
triggers payroll, workers' comp and contractor-reclassification risk).

### Compliance you can actually maintain

| Area | The solo-founder version |
|---|---|
| PCI | use Stripe Checkout/Elements so raw card data never touches your servers — stay in **SAQ A** scope. Never proxy card data through your API |
| GDPR / CCPA | DPAs with vendors, self-serve export and delete with a hard SLA, an audit log for deletions, and **minimisation** — no customer data in logs, analytics or third-party AI |
| Backups | define **RPO 15 min / RTO 4 h**, then actually restore into a scratch project once a quarter and record the result |
| Multi-tenancy | one shared schema, `user_id`/`org_id` on every table, RLS as the single enforcement point, `service_role` keys server-side only |
| SOC 2 | **do not start until a customer asks.** Vanta/Drata are commonly quoted $10k–30k/yr — far too heavy below ~$500 MRR. Cheaper path: rely on your vendors' reports, publish a Trust Center, answer questionnaires with a lightweight tool |

### The multi-tenancy traps agents walk into

From the Supabase RLS guidance — these are the specific ways an agent creates a
data leak:

- A table in an exposed schema **without RLS is readable and writable by anyone
  with a grant**, and **new tables in `public` automatically get every privilege
  granted to `anon` and `authenticated`**. Adding policies does not remove
  them. → *an agent creates a table, adds no policies, and ships a leak.*
- **Views bypass RLS by default** (they run `security definer`) → use
  `security_invoker = true`.
- `security definer` functions must set `search_path = ''` and be
  schema-qualified, or a caller can hijack them.
- **Recursive policies** → `42P17 infinite recursion detected`.
- `auth.uid()` returns NULL when unauthenticated, so
  `USING (auth.uid() = user_id)` silently matches zero rows — check
  `IS NOT NULL` explicitly.
- **Index every column a policy filters on.** A composite primary key does not
  index `user_id`.

None of these are "be careful" problems. They are **CI problems** — a pgTAP
suite per table, run on every push.

## Pricing and payments

- **Stripe Billing** for subscriptions and metered usage; **Stripe Connect**
  for marketplaces; **Stripe Tax** for VAT. Keep the customer relationship.
- **Merchant of record** (Lemon Squeezy, Paddle) if you sell to consumers
  globally and do not want to be the tax filer — roughly 5% + $0.50, but they
  own the customer record and can cut you off.
- **Price on value, not on cost.** The research is unambiguous: AI lowers your
  costs, and every competitor has the same cost curve. If you price on cost,
  the market reprices you to nothing.
- **Put product inference in COGS.** If each expense costs €0.01–0.05 to
  process, price it into the plan. An unpriced inference cost is the classic
  solo-founder margin killer.

## Marketing that a solo founder can run

| Activity | AI does | You do |
|---|---|---|
| Positioning | draft 20 versions of the one-sentence promise | choose one and refuse to change it for a year |
| Landing page | build it, write the copy, A/B the headlines | verify the promise is true |
| Content | research, outline, draft, edit | the point of view, the examples, the honesty |
| SEO / GEO | audits, keyword clustering, citation tracking | decide what you know that the model does not |
| Community | draft posts, summarise discussions | show up, answer, be a person |
| Launch | the assets, the sequence, the changelog | the list, the personal note, the ask |

**The founder-led content advantage is real and it is the thing AI cannot
copy.** A post from someone who built the thing, with the numbers, including
the failures, is worth more than a hundred generated posts — and it is exactly
what the model cannot write, because it does not have your failures.

## The business checklist before your first customer

- [ ] Entity decided (sole prop vs LLC vs S-corp) and filed
- [ ] Payment processor set up, merchant-of-record decided
- [ ] Terms of service and privacy policy that describe what the product
      actually does — and a data-processing agreement with every vendor
- [ ] Refund and cancellation policy, written
- [ ] A support address that a human reads
- [ ] Kill line with a date, written into `company/roadmap.md`
- [ ] One owned channel (a list, a community) with the first 10 subscribers
- [ ] The founder can say, in one sentence, who this is for and why they pay
- [ ] The metric you will watch daily, and the number that would make you stop
