# Non-engineering roles for a one-person company — what AI can actually own in 2026

> Research brief, 2026-11-07. Covers `.agent/roles/` minus `engineer` / `architect` / `reviewer`.
> Every claim carries a URL and a date. Vendor-published numbers are labelled as such — a vendor
> metric is not a measurement. Anything unverified is flagged.

## Summary table

| Role | AI does today | Human must do | Best 2026 tools | Verification trick | Cost/mo |
|---|---|---|---|---|---|
| **researcher** | Mine reviews/forums/Reddit, synthesise transcripts, draft competitive teardowns, survey + persona drafts, track AI-mentions | Pick the question, validate against real users, separate found from inferred | Dovetail (Digital Twins, Agents, Channels 2.0), Qualtrics synthetic panels, Apify scrapers + MCP, Loop11 AI browser agents | Two independent agents write the same brief; ship only claims two sources agree | €0–60 |
| **pm** | Spec + AC drafting, task decomposition, competitor matrices | Choose the tradeoff, approve the spec, own the roadmap | Claude Code subagents, Cursor, Linear/Notion AI | Reject any AC that cannot be falsified by a test | €0–30 |
| **designer** | Token extraction, component scaffolds, layout drafts, in-product copy, screenshot→code, FigJam synthesis | Art direction, taste, a11y judgement | Figma AI (Make, Dev Mode MCP), v0, Lovable, Bolt, Stitch, Uizard | Screenshot + axe check + token-conformance lint (no raw hex outside tokens) | €16–60 |
| **qa** | Unit + e2e test generation, browser-driving over MCP, visual regression, bug triage, synthetic monitoring | Pick the oracle, decide "real bug", own flake policy | Playwright MCP + Playwright Cloud Workspaces, mabl→KaneAI, Percy, Sentry Seer Autofix, Checkly | **Mutation testing**: break the feature, the test must fail | €0–50 |
| **devops** | Incident triage, ranked root-cause hypotheses, runbook drafts, IaC, cost-anomaly detection, security scanning, SOC2 evidence | Approve production changes, own rollback, incident comms | Sentry (Seer/Agent/Autofix + MCP), Grafana Assistant (Watchers/Investigations/Sandboxes), Datadog Incident Response AI, Terraform agentic era, Vanta/Drata | Dead-man's switch + a real rollback drill per release | €25–80 |
| **support** | Answer 40–70% of a clean tier-1 queue, draft replies, triage, write KB articles | Anything about money/refunds/dates/contracts; ambiguous or emotional tickets | Fin (ex-Intercom, now Salesforce) $0.99/outcome, Zendesk AI $19–55 + $1.50–2.00/resolution, Decagon, Crisp/Hugo | Replay a month of *historical* tickets; track **confirmed** resolution, not deflection | $19–60 + $0.99/outcome |
| **growth** | SEO/GEO audits, content drafts, GEO citation tracking, ad variants, social scheduling, cold-email sequences | Brand voice, founder story, anything sent to a real person, spend | GEO: Peec €89, Profound $99, Rankscale €20, HeyAmos $99, SE Ranking $103+add-on. Ads: Meta Advantage+/PMax. SDR agents | One owned channel + one baseline metric; split AI-referral from organic; A/B subject line only | €0–200 |
| **legal/admin** *(side note)* | ToS/privacy drafts, trademark clearance search, invoice AP, bookkeeping drafts | **Everything binding.** No contract, filing or customer comms | USPTO AI trademark tools, Termly/Iubenda, QuickBooks accounting agent, Tipalti AP Agent + MCP | Dry-run AP agent against last quarter's closed books; require 100% match before posting | ≤€200 |

---

## 1. Market / customer research (`researcher`)

**Tools 2026:** [Dovetail](https://dovetail.com/resources/dovetail-review/) (Digital Twins, Agents, Channels 2.0, AI Docs, AI Chat, AI Projects) · [Apify 6-platform review scraper + VoC MCP server](https://apify.com/sunny_spade/review-intelligence-engine/api/mcp) · [moatbreak competitive-teardown skill](https://github.com/bogaja/moatbreak) (recon, voice of customer from public reviews, rebuild parity, brand-distance check) · [Loop11 AI browser agents](https://www.loop11.com/introducing-ai-browser-agents-a-new-way-to-run-usability-tests-in-loop11/) for usability tests · Qualtrics synthetic panels (below). Mining and synthesis are solved: the agent pulls review/forum/Reddit evidence, clusters themes, cites every quote.
**Human must:** choose the question, judge whether a signal justifies building, sign off on found vs inferred.

**NOT reliable — synthetic users are not a substitute for real people, and 2026 settled it.**
Columbia-led study: twins trained on 500+ answers each, tested across 19 studies / 164 outcomes, predicted their humans **barely better than a generic model** (human-to-twin correlation **r = 0.20**); five distortions incl. **hyper-rationality** — twins logical exactly where people aren't. ([Indeemo](https://indeemo.com/resources/blog/synthetic-users-and-digital-twins)) Psychometric audit of 37 LLMs as survey respondents (n=263 real employees): best LLM **PSS 0.81** vs Gaussian copula 0.82 and **real answers of the same 100 people 0.89**; a classifier separates LLM from human at **median AUC 0.99**; samples compress the response scale (SD 0.79 vs 1.19), **lose** predictive validity on held-out humans (mean R² **−0.14** vs 0.28), and produce significant indirect effects on **4 of 7** mediation paths null in humans. ([arXiv:2608.14606](https://arxiv.org/abs/2608.14606), v2 2026-10-10) Qualtrics claims **12x** better than general-purpose AI, shipping UK/IE, Canada, AU/NZ panels in H1 2026 ([X4, 2026-03-18](https://www.qualtrics.com/news/new-market-research-capabilities-x4-2026/)) — **vendor claim, no replication located.** ACM's [Synthetic Persona Fallacy](https://interactions.acm.org/blog/view/the-synthetic-persona-fallacy-how-ai-generated-research-undermines-ux-research) agrees (abstract only — **unverified** in detail). **Verdict:** synthetic personas suit desk research, stress-testing a guide, edge cases. They are **not** the voice of the customer.

**Prompt/spec:** an *evidence ledger*, not a memo — `source URL + date + verbatim quote + confidence`, columns for "found" vs "inferred", a mandatory "what we could not verify" section, and a rule that a claim without two independent sources is filed as hypothesis. Ban invented numbers; ban "users report".

**Trust but verify:** run the brief twice with two agents (or two models) and diff the claims; only the intersection ships; spot-check five claims by opening the URLs. Near-zero cost.

---

## 2. Product / requirements + UI/UX (`pm`, `designer`)

**AI can:** PM — spec and AC drafting, task decomposition, competitor matrices. Designer — token extraction, component scaffolds, layout drafts, in-product copy, prototype-to-app.

**Tools 2026.** Figma AI is **metered, not free**: Starter 500 credits/mo; Professional Full seat **$16/mo = 3,000 credits**; Organization $55 = 3,500; Enterprise $90 = 4,250; **Dev/Collab seats get only 500 credits/mo**. Limits enforced from **2026-03-18**; **Figma Make burns 30–100+ credits per task** (pricing checked 2026-10-11 — [review](https://aiagentsquare.com/agents/figma-ai)). The important 2026 move is the **Dev Mode MCP server**, not Make: it feeds real components, variables and layout into Cursor / VS Code / Claude Code / Windsurf so generated code lands on *your* tokens instead of guessing from a screenshot. Make's model was Claude 3.7 Sonnet at launch — **unverified** now. v0 / Lovable / Bolt / Stitch / Uizard for fast front-end.

**NOT reliable.** "AI design slop" — AI UI converges on a generic look; mechanism documented, quantitative evidence thin. Solid instead: Stack Overflow's 2026 survey (30,000+ responses) puts AI usefulness at **74% for implementation** but only **45% for team communication** and **50% for design** — human-facing design work is where AI is weakest. Same survey: only **6.6%** trust AI for important decisions, but nearly half trust it *when they can verify it*.

**Prompt/spec:** give the designer agent the token file, component inventory and AC list as hard inputs; require a **token diff**; forbid any colour, type step or spacing value outside the token set; require empty/loading/error/success states per screen (your `designer.md` says this). PM: every AC must be falsifiable by a test, or refuse to write it.

**Trust but verify:** (1) render and screenshot the screen, (2) run an axe/contrast check (your spec wants ≥4.5:1 and real labels), (3) lint that no raw hex or ad-hoc spacing exists outside the token file. Design-system enforcement in 2026 is a **CI lint**, not a prompt.

---

## 3. Quality assurance (`qa`)

**AI can:** generate unit/e2e tests from specs and diffs; drive a real browser through Playwright over MCP — Microsoft ships [Playwright Cloud Workspaces remote MCP](https://learn.microsoft.com/en-us/azure/app-testing/playwright-cloud-browsers/how-to-playwright-workspaces-remote-mcp) and [Foundry browser automation](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/browser-automation); produce visual-regression baselines; triage and de-dupe bug reports; [Sentry Seer Autofix](https://sentry.io/product/seer/autofix/) opens fixes. **Human must:** pick the *oracle*, decide "real bug", own flake policy.

**NOT reliable — flakiness.** LLM-generated tests are flaky in industrial settings: [flakiness of LLM-generated tests for DBMS (arXiv 2601.08998)](https://ar5iv.labs.arxiv.org/html/2601.08998), [Chatting About Flaky Tests with Standard LLMs (EMSE 2026)](https://dl.acm.org/doi/10.1007/978-3-032-12092-2_28). Coverage is a weak proxy for quality — an LLM writes assertions that execute but cannot fail ([IEEE study](https://ieeexplore.ieee.org/abstract/document/11206953)). Commercial path: [mabl → KaneAI migration](https://www.lambdatest.com/support/docs/mabl-to-kaneai-migration-guide/).

**Prompt/spec:** "For each AC, write the smallest test that **fails without the feature**. If you cannot make it fail without the feature, say so — do not emit a test." Require the mutation it would break, to prove the test bites.

**Trust but verify — the cheapest real check in this brief.** **Mutation testing:** flip one line of product code; the AC's test must go red. If it stays green the test is decoration. Nightly, zero marginal tokens, and it is the single thing separating "AI wrote tests" from "the feature is covered". Back it with a golden set of 20 real tickets scored by rubric (LLM-as-judge) for non-deterministic outputs. Quarantine flaky tests with an expiry date; never silently delete (your `qa.md` forbids this).

---

## 4. DevOps / infra / observability (`devops`)

**AI can, end-to-end in 2026.** [Sentry Seer (GA)](https://sentry.io/changelog/seer-sentrys-ai-debugger-is-generally-available/) proposes candidate root causes *ordered by confidence* from assembled evidence; a full AI-debugging line now ships (Seer, Seer Agent, Autofix, AI Code Review) plus an [Sentry MCP server](https://mcp.sentry.dev/). [Grafana Assistant](https://grafana.com/blog/grafana-ai-autonomous-operations/) is the fullest 2026 loop: *Watchers* (always-on agents that baseline telemetry and calibrate checks) → *Investigations* (evidence-gathering, GA) → *Managed Sandboxes* (public preview — the agent opens a PR with the change, why it addresses the cause, which checks ran, and **what still needs verification**); Grafana reports root cause **3.5x faster** — vendor-reported, one case. Datadog shipped [AI inside Incident Response](https://www.datadoghq.com/blog/datadog-incident-response-ai-features/); HashiCorp is positioning [Terraform for the agentic era](https://www.hashicorp.com/en/blog/terraform-advances-infrastructure-lifecycle-management-for-the-agentic-era). AI agent observability is mainstream: Stack Overflow 2026 (n=2,277) — **Sentry 26%, LangSmith 17%, MLflow 15%, Langfuse 15%, Datadog LLM 12%, W&B 11%** ([data](https://survey.stackoverflow.co/2026/ai/data/ai-obs)).

**Human must:** approve anything touching production, own the rollback, run incident comms. Your `devops.md` already forbids deploying without a *tested* rollback path — keep it; these agents will hand you a green PR that regresses prod. **NOT reliable:** fully autonomous remediation. Grafana's framing is right — delegate *observation, evidence gathering and change preparation*; humans decide what reaches production. Treat "self-healing" claims (**unverified**) as "proposes a fix".

**Prompt/spec:** "Read the alert, gather evidence, list candidate causes with a confidence score and the telemetry supporting each, propose the smallest reversible change, and state what would falsify your diagnosis. Do not apply anything to production."

**Trust but verify:** (1) **dead-man's switch** — cron pings a health endpoint only while healthy, silence pages you; (2) **run the rollback drill** per release, don't write it; (3) every new surface gets a dashboard + an alert with a numeric threshold (your `devops.md` "Done means"); (4) cap LLM spend against the budget file (Infrastructure €150, model/agent €400/mo).

---

## 5. Customer service (`support`)

**AI can:** [Fin](https://theaiagentindex.com/agents/intercom-fin) (the company formerly Intercom, acquired by Salesforce **2026-09-10**) resolves across chat, email, voice, WhatsApp, SMS, Slack and social, hands off on a configured rule, and ships an official **MCP server (14 tools)** so Claude Code or Cursor can drive it. Fin 4 (2026-10-07) added **Human in the Loop** — the agent asks a teammate for review, information or approval mid-conversation, the right primitive for a one-person company. [Zendesk AI](https://theaiagentindex.com/compare/intercom-fin-vs-zendesk-ai): agents on every Support/Suite plan with an included resolution allowance, then **$1.50 committed / $2.00 pay-as-you-go** per extra resolution; Copilot $50/agent/mo; acquired Forethought March 2026. **Human must:** anything about money, refunds, dates, contracts; ambiguous or emotional tickets.

**The numbers — and the trap.** Vendor claims are *not* comparable: Fin's 76% "resolution" counts **assumed** resolutions (customer left without asking — including gave up); Sierra's 80% is "up to", one flagship customer; Decagon's 80% is **deflection** (never reached a human), not resolution; Ada's 75% is a CSAT score. Drag's August 2026 audit: vendors advertise **65–86%**; production clusters at **40–70%**; and **Fin's own detailed case studies sit at 42–50%** against its 76% headline. One queue measured four ways spans ~30 points (confirmed 46% / assumed 68% / deflection 80% / satisfaction 74%). At $0.99 per outcome and 2,000 conversations/mo: claimed 76% → **$1.30** per genuine resolution; realistic 45% → **$2.20**. ([Drag](https://www.dragapp.com/blog/ai-support-agent-resolution-rates/)) And **Klarna** claimed its AI did the work of 700 agents, then rehired humans after quality dropped. **NOT reliable:** any headline resolution rate on any vendor page. Also **data training** — Fin trains on de-identified interaction data by default (BAA/EU/AU workspaces excluded); Zendesk describes no opt-out. For a receipt/expense product, receipt images and merchant data are customer data — your charter forbids them leaving your infrastructure.

**Prompt/spec:** give it an escalation matrix, not a persona — `TIER 0 self-serve (docs) → TIER 1 agent (KB-grounded, cite the doc) → TIER 2 human`. Hard rules in the prompt: never state a refund, date, price or SLA; never answer beyond the KB — say "escalating" and hand off with a summary. On Fin, map this to Procedures + Human in the Loop.

**Trust but verify:** run the agent against **a month of your own historical tickets** before signing — most vendors will do it, and one who refuses to be measured by *your* definition on *your* tickets is telling you its number. Then track **confirmed** resolution separately from deflection. Every recurring question becomes a KB article or a task the same day (your `support.md` "Done means") — that loop is what actually shrinks the queue.

---

## 6. Marketing / content / sales (`growth`)

**SEO in 2026 changed fundamentally.** Ahrefs' updated study: **AI Overviews cut clicks by 58%** ([Ahrefs](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)). Google zero-click searches reportedly hit **68% in early 2026** ([Search Engine Land — headline only, source blocked, **unverified** in detail](https://searchengineland.com/google-zero-click-searches-2026-study-479717)). **ChatGPT now takes ~95.1% of AI referral traffic, more than double in 2026** (BrightEdge), ~92% of AI referral sessions ([Search Engine Land](https://searchengineland.com/chatgpt-ai-referral-traffic-sessions-data-481630)). So the traffic audit **must split AI referral from organic** or every channel reads wrong. Google's 2026 Search Central moves that matter: **May** [optimizing for generative AI in Search](https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing); **June** [Search Generative AI performance reports in Search Console](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports); **Oct** [a shared AI training control for websites](https://developers.google.com/search/blog/2026/10/ai-training-control) — an opt-out signal for AI training, now backed by OpenAI/Microsoft per [Shift Delete](https://en.shiftdelete.net/ai-training-opt-out/). Also **Apr** new "back button hijacking" spam policy, **Aug** Site Reputation Policy update.

**GEO tools (SitePoint, 2026-05-04):** Rankscale from €20 · Peec AI €89 · Profound $99 · HeyAmos $99 · SE Ranking $103.20 (+ AI add-on from $71.20) · Writesonic $249 · GetCito $299 · AthenaHQ $295 · Alli AI $299 · Frase $49 ([table](https://www.sitepoint.com/best-generative-engine-optimization-tools-to-improve-ai-search-visibility-2026/)).

**AI SDRs — real numbers.** 100,000 paired cold emails (Oct 2025–Apr 2026): AI reply rate **4.1% vs 5.2%** human; meeting-booked **0.7% vs 1.1%**; **spam-flagged 8% vs 3%**. Cost per meeting **$39–$403 (AI) vs $425–$1,083 (human)**; fully loaded AI SDR $18.6k–$72.6k vs human $103k–$158k. But **88% of AI SDR pilots stall before production**, and teams that persist settle at a **70/30 AI:human split** by month 6 ([each number sourced](https://www.expertise.ai/stats/ai-sdr-statistics)). **SaaStr replaced its SDR team with 20+ agents, 60,000+ emails, 130+ meetings — but every message was human-read for the first 30 days and each agent took two weeks to deploy.** Buyer behaviour (Gartner 2026, 646 B2B buyers): 67% prefer a rep-free experience, 45% already used AI during a purchase, yet **69% still want a rep to validate AI-generated insights**; buyers credit human sellers by **32 points on purchase confidence**. Design for: AI for speed and volume, humans for the last 30%.

**DELIVERABILITY RULES — 2026, enforced mechanically (not by reputation).** Google / Yahoo / Microsoft require: **SPF + DKIM** aligned and valid for every sending domain; **DMARC** published with a policy; **one-click unsubscribe** (RFC 8058) honoured; and a spam complaint rate **below 0.3%** — a **compliance cliff, not a warning**: since the compliance-based rules took effect in late 2025, crossing it means deferral/rejection. Target **under 0.1%**. Complaint rate is per sending domain via Google Postmaster Tools, and a breach suppresses *every subsequent send from that domain*, not just the offending campaign. Cap sequences at **5–8 touches**. Volume alone rarely causes complaints — **relevance** does. Apple Mail Privacy Protection makes open rate unreliable; track reply and complaint rate. **AI copy is fingerprintable** (8% spam-flag vs 3% human) — warm up new domains and send from a subdomain, not the root, so reputation damage is contained. ([Prospect AI benchmark, 2026-09-23](https://prospectai.co/resources/insights/cold-email-spam-complaint-rate-benchmark-2026))

**Legal notes.** FTC CAN-SPAM (US): accurate headers, no deceptive subject, ads clearly identified, valid physical postal address, **opt-out honoured within 10 business days** — no opt-in required for B2B email, but a working opt-out is. AI-generated outreach changes none of these. EU/UK: GDPR + ePrivacy; B2B cold email typically relies on **legitimate interest** plus opt-out, and national implementations differ (Germany's UWG is stricter — **verify per market with counsel**). US SMS is a separate regime (TCPA: prior express written consent). EU AI Act transparency duties may apply to AI-generated content and profiling. *Orientation, not legal advice — the charter requires a human for anything binding.*

**Prompt/spec:** "One asset per week. Every asset states audience, promise, CTA and the source it cites. Never claim a metric without a URL and a date. Draft the email variant, do not send. Produce the GEO prompt set, run it, report mention rate and cite share." Programmatic SEO is fine but never publish pages you would not sign — Google's 2026 spam policies make thin scaled pages a liability a one-person company cannot absorb. **Human must:** brand voice, founder story, anything sent to a real person, spend.

**Trust but verify:** one owned channel, not five rented ones (your `growth.md` "Done means"); a baseline metric per asset, UTM-tagged; a 4-week A/B on **subject line only**; AI-referral sessions as a separate line; every cold-email domain monitored weekly for complaint rate and paused at 0.1%. Founder-led content still wins in 2026 — but the founder is the source of truth the AI drafts from, and generic AI-written content is the fastest route to being filtered.

---

## 7. Legal / compliance / admin (side note)

**AI can draft:** ToS/privacy policies from generators (Termly, Iubenda — current rates **unverified**; [see](https://www.njbusiness-attorney.com/ai-terms-of-service-privacy-policy-cost/)). The **USPTO ships an AI trademark tool** in 2026 ([USPTO](https://www.uspto.gov/subscription-center/2026/head-class-trademarks-full-power-usptos-ai-tool)) with AI enhancements to trademark search and examination ([IP Update, 2026-04](https://www.ipupdate.com/2026/04/picture-this-ai-enhancements-to-trademark-search-and-examination/)) — clearance *search* is automatable, registrability is a legal judgement. Contract review/redlining drafts (Harvey, Legora). Bookkeeping: Intuit ships an [AI accounting agent](https://quickbooks.intuit.com/ph/resources/product-update/quickbooks-accounting-agent/); [Tipalti launched an AP Agent + MCP](https://tipalti.com/press/tipalti-ap-agent-agentic-ai/). **Human must do everything binding:** every contract, filing, incorporation, tax return, trademark application, customer communication — the hardest role to hand over, and your rules already say so.

**Trust but verify:** dry-run the bookkeeping/AP agent against **last quarter's closed books** and require a 100% match before it posts anything; any variance → human. For legal, the agent produces a *comparison table* vs the template and the founder signs; the agent never files.

---

## Cross-cutting patterns for the playbook

1. **Give every role an MCP server, not a bespoke integration.** The strongest 2026 pattern: Fin (14 tools), Sentry, Figma Dev Mode, Apify, Tipalti, HeyAmos all expose MCP.
2. **Verification is cheap and mechanical — pick a *failing* check.** Mutation testing (qa), token lint + axe (designer), dead-man's switch + rollback drill (devops), historical-ticket replay (support), two-agent claim intersection (researcher), complaint-rate monitoring (growth). Each costs ~€0 and catches the failure mode that matters.
3. **Separate the agent's metric from the outcome.** Vendor resolution rate vs confirmed resolution; AI Overview impressions vs clicks; AI mention rate vs pipeline; test count vs mutation score. Most AI role failures are metric-laundering, not capability failure.
4. **The founder is the scarce input, not the founder's time.** Founder holds spending, contracts, production changes, customer communication, brand judgement. The 2026 trust data backs this: 6.6% trust AI on important decisions, but ~half trust it *when they can verify it*. The job is not to avoid AI, it is to **build the verification step into every role**.

### What I could not verify
- 68% Google zero-click figure (headline only; source blocked).
- The 58% AI-Overview click-loss figure at method level (Ahrefs headline + secondary coverage only).
- "93% of AI Mode searches end without a click" — LinkedIn only, **unverified**, no primary study located.
- Qualtrics' "12x better than general-purpose AI" synthetic-panel claim (vendor-stated, no replication).
- Current Figma Make model (was Claude 3.7 Sonnet at launch).
- Whether Google/Yahoo thresholds moved after late 2025 — check Google Postmaster Tools on your own domains.
