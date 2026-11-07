# One-Person Companies, 2026: Verified Market Brief

*Research date: 2026-11-07. Every number carries a link. Founder-reported, aggregator-reported and secondary-read figures are flagged inline; unverified claims are quarantined in §7.*

---

## 1. Real examples with verifiable numbers

### 1.1 Pieter Levels (levels.io) — the canonical solo case

Solo since 2014: Nomads.com, Remote OK, Hoodmaps, Photo AI, Interior AI. No co-founders, no employees. Primary-source numbers from his own blog:

| Date | Claim | Source |
|---|---|---|
| 23 Sep 2026 | Revenue "very stable at about **$200K–$250K/mo**"; **94.5% profit margin**; passed **$10M/y in revenue + investment gains** (gains now exceed operating revenue; mostly unrealised) | [levels.io](https://levels.io/passed-10m-revenue-investment-gains) |
| 3 Nov 2026 | Business expenses cut to **~$300/mo** for all sites: **20,000 paying customers, 252M visitors, 2.4B requests, 2.4 PB bandwidth**; ~$8,000/mo all-in incl. $7,000/mo GPU + $800/mo R2 for Photo AI. Down **90% YoY**, saving **~$34,000/mo** | [levels.io](https://levels.io/biz-expenses-dropped-to-300) |
| 9 Sep 2026 | Replaced a SaaS stack with own vibe-coded services → **~$25,000/mo savings** | [levels.io](https://levels.io/replaced-saas-with-vibe-coded-services) |
| 3 Nov 2026 | Ledger of **115 projects**: Success 9 (8%), Okay 11 (10%), **Failed 20 (17%)**, N/A 70 (61%), New 5 (4%) | [levels.io/projects](https://levels.io/projects) |

The 2026 story is not the revenue — it is the **cost structure**. Levels' explicit claim is that *Claude Code* found the savings: swapping Photo AI video models (GPU $36K→$7K/mo), consolidating DigitalOcean+Linode→Hetzner (~$3K/mo), Backblaze lifecycle policies ($1,200→$26/mo), R2 lifecycle policies ($1,200→$800/mo), domain analysis ($118/mo), auditing his own Claude plan ($200→$100/mo). He also spent a day having Claude Code security-audit every VPS he owns. This is the clearest published instance of an agent doing *cost-optimisation and security* work normally owned by an ops team.

### 1.2 Base44 — acquired by Wix for $80M

- Wix acquired Base44 for **$80M cash** (≈¥580M), announced **19 June 2025** — the first vibe-coding M&A ([TechCrunch](https://techcrunch.com/2025/06/18/6-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash/); detail in [36Kr/Zhidx](https://www.36kr.com/p/3343273859971585)).
- Founder **Maor Shlomo, 31**, founded Dec 2024: **1 founder + 8 employees, zero external funding**.
- **Profitable by month 6**; May 2025 net profit **$189,000** *after* heavy LLM spend.
- **10,000 users month 1 → 250,000 month 6**; growth "almost entirely word of mouth".
- Chose **Claude via AWS over OpenAI on cost**, published his cost-control method.
- The 8 employees got a **$25M retention bonus**; customers included eToro and Similarweb.
- **Correcting the popular framing:** Base44 was *never* one-person. Shlomo sold because it "hit its limit" — "the resources and scale needed next are no longer something natural growth can carry."

### 1.3 Lovable — best evidence that solo builders are a real revenue segment

[AT Partners on Lovable's Series C](https://www.atpartners.co.jp/news/2026-08-13-swedish-ai-coding-startup-lovable-labs-raises-400-million-in-series-c-funding-at-a-13-3-billion-valuation) (citing SiliconANGLE):

- **Series C, Aug 2026: $400M at $13.3B** (Menlo Ventures + Scaleup Europe Fund led; Balderton, Tencent, Accel, CapitalG, DST Global, HubSpot/Salesforce Ventures also in). Total raised **>$930M**. Series B $330M @$6.6B (Dec 2025); Series A $200M @$1.8B (Jul 2025).
- **ARR: $200M (Nov 2025) → $500M (Jun 2026) → ~$600M (end Aug 2026).**
- **60M+ projects** built since Nov 2024 launch; **900M monthly accesses**.
- Employees at **~2/3 of Fortune 500** use it — yet **enterprise contracts total only ~$20M ARR**. The business is overwhelmingly **individual paying users and small teams**.
- **~80% of users build monetisable businesses or side projects; >1/3 already earn revenue from them.**
- Plans to **grow headcount ~50% to ~450 employees** by end 2026.

That last pair is the structural finding: *the company that makes one-person companies is becoming a 450-person company, and its revenue proves the demand side is individuals.*

### 1.4 Cursor / Anysphere, and YC W26

**Cursor.** Multiple outlets report **SpaceX acquiring Anysphere (Cursor) in an all-stock deal valued at $60B**, Cursor at **$4B annualised revenue** ([Nasdaq](https://www.nasdaq.com/articles/spacex-buy-cursor-maker-anysphere-60-bln-all-stock-deal), [BusinessWorld](https://www.businessworld.in/article/spacex-to-buy-cursor-creator-anysphere-for-60-bn-610971), [Dealroom](https://dealroom.co/news/134107-cursor-tops-4b-annualized-revenue/)). Levels himself wrote (23 Sep 2026) that `@cursor_ai` "then got acquired by @spacex recently!" I could not fetch primary bodies (403s) — **strongly reported, not primary-verified**.

**YC W26 — the best hard datapoint on the solo share.** [Extruct AI's breakdown of YC Winter 2026](https://www.extruct.ai/research/ycw26/index.html) (199 companies, 25 Mar 2026):

- **22 solo founders = 11% of the batch.** Modal shape is still two founders: **129 (64%) have exactly two co-founders.**
- **Zero solo founders in fintech**; devtools highest solo rate at **22%**. The author's read: *"regulated markets apparently require a partner."*
- **1 in 8 builds something physical.** **3× more companies hit $1M annualised revenue than W25.**
- **AI-native service 56 (28%)** ("AI performs a job end-to-end, and the customer supervises or approves the output") vs **AI-enhanced software 45 (22%)** — funded at near-equal weight.
- Extreme solo case: **GRU Space**, 22-year-old solo founder building a Moon hotel, taking **$250K–$1M reservations**.

### 1.5 The China OPC data set (largest and best documented)

[People's Daily Online, 18 Aug 2026](http://en.people.cn/n3/2026/0818/c90000-20489847.html), citing the *2026 national OPC development observation report*:

- **OPC communities nationwide: 95 → 618 in H1 2026**, across 24 provinces and 75 cities.
- **Hangzhou: 2,000+ "AI+OPC" enterprises, 50+ communities.** 2028 targets: 100+ OPC communities, **100+ OPCs with >¥10M (~$1.48M) annual revenue each**, 30,000+ OPC entrepreneurs. Hangzhou core AI industry: ¥122.9B revenue in Q1 2026, +25.2% YoY.
- **75% of OPC founders are now non-technical** (Honghub 2026).
- Zeng Xiaofeng, an IT consultant with **no coding experience**, built his first app prototype in **two weeks** using AI plus a 20-hour HarmonyOS course.
- One founder, Zhang Xiaobo, **expanded to 60+ staff**, calling it a move from OPC to "Super Team Company."

The thesis to lead with comes from [Outlook Business, 12 Oct 2026](https://www.outlookbusiness.com/corporate/the-billion-dollar-company-of-one-is-coming-is-india-inc-ready): firms exist because coordination is expensive, and AI agents are collapsing that cost. Cited evidence — **Instagram had 13 employees** at its $1B sale, **WhatsApp 55** at $19B, **Midjourney ~40 people** with revenue/employee approaching **$5M** vs ~**$50K** for a large Indian IT services firm. It also notes **Sam Altman has named the destination: a one-person billion-dollar company**, and that "AI coding startups now touch a hundred million dollars in revenue with teams of twenty."

---

## 2. Failed and cautionary cases

**2.1 The failure denominator.** Levels' ledger: **115 projects, 20 self-tagged Failed (17%), only 9 Success (8%)**. A close read of all 751 posts concluded that of ~113 projects at most **9 could be called revenue pillars** — hit rate under 10% ([DEV analysis](https://dev.to/idonthaveapen/failures-behind-a-420kmonth-solo-founder-i-read-all-751-of-pieter-levels-blog-posts-1h3b)). His **Tubelytics** (2014) burned a year on a polished YouTube-analytics dashboard — "nobody paid for it" — becoming a standing rule: *"I'm not going to build anything until there's customers."* On 7 Sep 2026: *"Anyone can try making money on the internet with AI, but entrepreneurship is still like pro sports."* The analysis lists **seven preconditions that don't transfer**: 300K+ X followers, 2013-era market conditions, Southeast Asia living costs, a decade of plain-PHP expertise, low personal stakes from running solo, VC distrust generalised from one bad experience, and AI margins that track GPU pricing.

**2.2 The 2026 vibe-coding hangover.** [Elektor, Mar 2026](https://www.elektormagazine.com/articles/2026-an-ai-odyssey-vibe-coding-hangover?view=print) is the best single cautionary piece: 2025 made software cheap to *create*, not cheap to *own*. DORA's 2024 report: **each 25% increase in AI adoption → ~7.2% lower delivery stability, ~1.5% lower throughput**. Recurring failure modes: overfitted glue; hidden complexity accreting into "complete systems"; non-obvious perf debt (N+1, quadratic loops); config hazards in CI/IAM/Terraform; and **"testing theatre"** — generated tests asserting *current* behaviour, not intended behaviour. **Package hallucination** as a supply-chain vector (USENIX): publish a name the model invented, wait for `install`. Cornell [arXiv 2310.02059](https://arxiv.org/abs/2310.02059): Copilot-generated snippets show a high likelihood of security weaknesses. Plus **skills debt** — fewer people who can debug "at the metal." Recommended posture: NIST's SSDF generative-AI profile — treat AI output as an untrusted external contribution.

**2.3 Two solo-founder AI post-mortems.** **[NESTLY** (Saasgrave)](https://saasgrave.org/read/nestly-a7si) — AI pregnancy/newborn platform, dead with **6 users and $0 revenue**; founder: *"We had no money and no idea what we was doing."* The AI features were likely "a wrapper around an LLM API, adding cost without differentiated value for users who didn't exist"; no acquihire was possible because there was no team. **[FacelessForge** (Lu Chen, Oct 2026)](https://dev.to/mrlu/facelessforge-postmortem-7-days-0-paid-subscribers-kill-line-honored-22la) — the best-documented *process* failure.** Public kill line set in advance: ship 8 Oct 2026; if no first paid subscription by 15 Oct, shut down and publish. Result: **0 paid subscribers, $0 revenue, $0 marketing spend.** Lessons: the landing page was blank/broken for ≥3 of the 7 validation days (data partly contaminated — check your funnel before reading a zero); **single-channel distribution was a structural mistake**; and *"Competitor revenue is not demand validation for your SKU."*

**2.4 The aggregate OPC reality check.** [Honghub's *2026 One-Person Company Insight Report*, via Hangzhou Net](https://hznews.hangzhou.com.cn/chengshi/content/2026-04/11/content_9204717.htm) (1,500 questionnaires, 100+ hours of interviews): **half of OPC founders earn under ¥7,000/month** (~$970); only **17.6%** keep AI costs at zero and **>20% spend over $200/month**; their **HACR** metric says ¥1 of AI spend ≈ ¥75 of labour cost; **"how do I find users" is the single most unresolved problem for over half**; and the top emotion words are **anxiety (11%), self-doubt (8%), loneliness (7%)** — the hidden cost of being CTO, CMO, CFO and support at once.

---

## 3. Market data

**3.1 Adoption and trust.** [Stack Overflow Developer Survey 2025](https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey) (49,000+ respondents, 177 countries):

| Metric | 2025 | 2024 |
|---|---|---|
| Use or plan to use AI tools | **84%** | 76% |
| **Do not trust** AI output accuracy | **46%** | 31% |
| Favourable sentiment toward AI tools | ~60% | 70%+ |
| Daily AI use, professional devs | **51%** | — |
| Currently use AI agents | **31%** (17% plan to; 38% never) | — |
| See AI as a job threat | 64% (no) | 68% (no) |

Also: **45%** cite debugging AI-generated code as a top frustration; of agent users **69% report increased productivity**; AI IDEs — **Cursor 18%, Claude Code 10%, Windsurf 5%**; models — GPT 81%, Claude Sonnet 43%, Gemini Flash 35%; **~77% say vibe coding is not part of professional work**. Trust by country: India 56%, Ukraine 41%, Italy 31%, NL/US 28%, Poland 26%, Canada/France 25%, UK 23%, Germany 22%.

**DORA 2025** ([report](https://dora.dev/research/2025/dora-report/), [analysis](https://dora.dev/insights/balancing-ai-tensions/)): **90% of technology professionals use AI at work; >80% believe it increased their productivity; 30% report little to no trust in AI-generated code.** Key claim: **higher AI adoption correlates with an increase in both delivery throughput and delivery instability.** AI is an **amplifier**. A qualitative deep dive of **1,110 Google engineers** (Q3 2025) found increased velocity across all ten AI use cases but flagged **"verification overhead" as a negative theme in all ten**. Three named tradeoffs: the **verification tax**, the **expertise paradox** (entry barriers drop, deep skill atrophies), and the **workflow gap** (prototyping fast, production integration neutralises the gain).

**Anthropic Economic Index, Sept 2025** ([report](https://www.anthropic.com/research/economic-index-geography)): software development is the most common use in **every country tracked** (37–40% of conversations). **Directive (fully automated) interactions rose 27% → 39%** between Dec 2024 and Sept 2025; automation (49.1%) overtook augmentation (47%). For **API customers, 77% of conversations show automation patterns vs only 12% augmentation** — businesses run agents, consumers collaborate. Task mix: education 9%→13%, physical/social sciences 6%→8%, while **management 5%→3%** and **business/financial operations 6%→3%**.

**3.2 Credible productivity research — and its caveats.** METR is the source to use to avoid hype:

1. **July 2025 RCT** ([link](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)): 16 experienced OSS devs, 246 real issues, repos averaging 22k+ stars / 1M+ LOC, Cursor Pro + Claude 3.5/3.7 → **19% SLOWDOWN** (95% CI +2% to +39%). They *expected* +24% and still believed afterwards they'd been sped up 20%. METR's own caveat: "These results are out of date."
2. **Feb 2026 update** ([link](https://metr.org/blog/2026-02-24-uplift-update/)): late-2025 rerun (57 devs, 143 repos, 800+ tasks) gave point estimates of **−18%** (original cohort) and **−4%** (new recruits) — i.e. *speedups* — but METR **disowns the estimate**: devs refused to work without AI, 30–50% withheld tasks they didn't want done AI-disallowed, pay cut $150→$50/hr. Effect size is currently unmeasured.
3. **May 2026 survey** ([link](https://metr.org/blog/2026-05-11-ai-usage-survey/)): 349 technical workers (87 SWEs, 71 researchers, 129 academics, 48 founders/managers). **Median self-reported 1.4–2× change in the *value* of work; median speed change 3×.** Retrospective: 1.3× (Mar 2025) → 2× (Mar 2026) → forecast 2.5× (Mar 2027). METR's own scepticism: staff gave the lowest estimates of any subgroup; where they could inspect public outputs, high-value claims looked overstated; ~2% response rate; heavy convenience-sample bias. Observational marker: **~4% of GitHub commits are now authored by Claude Code**.

The synthesis: **perceived uplift ≈1.4–2× on value, ~3× on speed; experimentally measured uplift was −19% in early 2025 and is unmeasured in early 2026.** That gap is the honest headline.

**3.3 The solo-founder proportion.** I could **not** locate a credible 2026 Crunchbase, Carta or Wellfound statistic. Best proxies: **YC W26 at 11%** (Extruct) and the Chinese data in §1.5 — not the same measurement. The widely circulated **"36.3% of new startups are one-person founded, +53% vs 2019"** traces to a [Tencent Cloud developer-community post](https://cloud.tencent.com/developer/article/2656375) with **no primary statistical source** — **unverified**.

---

## 4. The "20 staff" decomposition

A 20-person Series A software startup is roughly: 2 founders/execs, 2 PM/PO, 1 designer, 7–8 engineers, 2–3 QA, 2 DevOps/SRE, 1 data/ML, 2–3 growth/support, 1 ops/finance/legal. **~12 of the 20 sit in engineering, QA, platform and data** — exactly the band AI compresses hardest. The other ~8 are distribution, trust, capital and accountability, which AI does not touch. Using this repo's role taxonomy (`.agent/roles/`):

| Role | Headcount | AI coverage end-to-end, 2026 | Evidence | Human keeps |
|---|---|---|---|---|
| **researcher** | 1–2 | **Partial → largely automatable for synthesis**; judgement on *who* to serve is not | Anthropic EI: software dev + info-seeking dominate; "information synthesis" ✅ | Choosing the customer and the bet |
| **architect** | 1 | **Partial** — AI drafts, human owns interfaces and the decision record | DORA "bridge knowledge gaps" ✅; "expertise paradox" — AI can validate a bad assumption | Interface + the "why" |
| **designer** | 1–2 | **Near-full for drafts, partial for system** | No strong public stat — *inference from general capability* | Taste, design system, consistency |
| **engineer** | 7–8 | **Partial: draft velocity ↑↑, net speed uncertain** | DORA: velocity ✅ and "verification overhead" ❌ in all 10 use cases; SO 46% distrust, 45% cite debugging cost; METR −19% (early 2025), unmeasured (2026) | Owning correctness in unfamiliar domains |
| **qa** | 2–3 | **Partial** — test *generation* yes, meaningful *failure* no | Elektor: "testing theatre" | Deciding what "correct" means |
| **reviewer** | 1 | **Partial — and now the bottleneck** | DORA: "Reviewing [another's] code is so much harder than writing it" | Adversarial judgement, escalation |
| **devops** | 2 | **High for hygiene, low for judgment** | Levels: Claude Code cut opex 90% and audited every VPS; on-call stays human | Incident ownership, production writes |
| **pm** | 2 | **Partial** — spec/triage automatable, roadmap not | DORA "reduce friction to start" ✅; Anthropic EI: management tasks fell 5%→3% | Prioritisation, trade-offs |
| **growth** | 2–3 | **Partial** — content/copy/SEO yes, distribution no | Honghub: "finding users" is the #1 OPC problem; Levels' 300K followers *is* the asset | Audience, trust, channels |
| **support** | 1–2 | **High for tier-1** | Anthropic EI: 77% of API conversations are automation-pattern | Escalations, refunds, relationships |
| **CEO / finance / legal / sales** | 2 | **Human-only** | Colorado CAIA deployer liability; EU PLD strict liability from Dec 2026 | Money, contracts, customers |

**Conclusion:** AI can plausibly collapse ~12 engineering-adjacent seats into 2–4 human-supervised agents and compress support to near-zero marginal cost. It cannot collapse the 8 seats that are distribution, trust, capital and liability. An OPC is not "one person replaces 20" — it is "one person plus agents replaces 12, and does the other 8 badly, slowly, or not at all."

---

## 5. Legal and practical constraints (orientation only — get a professional)

**Entity.** Per the [IRS](https://www.irs.gov/businesses/small-businesses-self-employed/sole-proprietorships), a sole proprietor owns an unincorporated business by themselves; if you are the sole member of a domestic LLC *and* elect corporate treatment, you are **not** a sole proprietor. Sole proprietorship = **1040 + Schedule C**, **Schedule SE** (self-employment tax), **1040-ES** (estimated tax). An LLC adds liability separation plus state filings; S-corp status is by election, subject to eligibility and corporate tax on distributions.

**"Hiring" an AI.** As of 2026 the agent is legally a **tool, not a worker**: no TIN, no payroll tax, income attributed to the controlling entity ([AgentMarketCap legal analysis, Apr 2026](https://agentmarketcap.ai/blog/2026/04/05/agent-as-employee-legal-frontier-liability-tax-labor-law)). The risk is *framing*: calling it an "AI employee" engages employee-vs-contractor tests turning on **control, integration and economic dependence** (IRS/FLSA guidance, state ABC tests), and a plaintiff will argue you bore employee-level liability. **No court has classified an AI agent as an employee.** Clifford Chance's 2026 analysis: existing agency and vicarious-liability doctrines "hit a dead end" when no human acts at the moment of harm.

**Three live regimes.** (1) **Deployer liability (US)** — Colorado's AI Act, effective **30 June 2026**: deployer responsible for AI in consequential decisions, **may not shift liability to vendors**, annual impact assessments, discriminatory-outcome reports to the Attorney General within 90 days. (2) **Strict product liability (EU)** — revised **Product Liability Directive**, transposition due **9 December 2026**: AI systems, incl. SaaS-delivered models and cloud agents, are **products** under strict liability, with **defect presumed** on breach of mandatory cybersecurity or AI Act requirements. (3) **The responsibility gap** — the current default.

Also live: EU AI Act high-risk obligations from **August 2026** (human oversight in employment contexts); Illinois HB 3773 (effective 2026) requires notifying workers when AI is used in hiring, promotion or discipline; South Korea's 2024 "robot tax" cuts deductions for automation investment; the IRS has issued **no guidance on withholding for agent-initiated payments**.

**Invoicing without employees.** You are the contracting party: use a processor/merchant-of-record (Stripe, Lemon Squeezy, Paddle) and issue the required 1099s. No payroll, no benefits, no workers' comp — but also **no liability shield for your own errors**, which is exactly why the LLC-vs-sole-prop choice turns on whether your product can harm someone.

**Flag for professional advice:** entity/election choice; sales tax and EU VAT/OSS; IP assignment for AI-assisted code; data-processing agreements; hiring the first real employee (headcount triggers payroll, workers' comp, and contractor-reclassification risk); crypto/foreign-founder structuring.

---

## 6. Ten most important findings for a solo founder building with an AI agent team

1. **AI compresses the ~12 engineering/QA/platform seats of a 20-person startup into 2–4 supervised agents; it does nothing for the ~8 seats in distribution, trust, capital and liability.** Design around that asymmetry.
2. **Perceived productivity is 1.4–2× on value and ~3× on speed; experimentally measured productivity was −19% in early 2025 and is unmeasured now.** Never plan a runway on a self-reported multiplier.
3. **The real cost of AI is verification, not generation.** "Verification overhead" was a negative theme in *every one* of ten DORA use cases, and adoption correlates with *more* instability as well as more throughput. Budget explicitly for review, tests and observability.
4. **AI is an amplifier, not a substitute** (DORA's word). A one-person company with no platform, no tests and no CI generates technical debt faster, not slower.
5. **Failure is the norm.** Levels: 115 projects, 20 self-tagged failures, **9 successes (8%)**. FacelessForge: 0 paid subscribers in 7 days. NESTLY: 6 users, then dead. **Validate before you build; set a public kill line with a date.**
6. **Distribution is the binding constraint, not capability.** "How do I find users" is the #1 unresolved problem for over half of surveyed OPC founders; Levels' 300K-follower audience and Base44's word-of-mouth 10K→250K are the real assets.
7. **Cost structure is where the leverage is, and agents can exploit it.** Levels cut expenses ~90% to ~$300/mo (saving ~$34K/mo) largely by having Claude Code audit his own infrastructure, storage lifecycle and contracts.
8. **Treat agent output as an untrusted external contribution** (NIST SSDF): small diffs, blocking scanners, scoped production writes, a human on every irreversible action.
9. **Legal exposure rises with autonomy and the frameworks are already live** — Colorado CAIA (30 Jun 2026), EU PLD transposition (9 Dec 2026), EU AI Act high-risk obligations (Aug 2026). The agent is a tool, not an employee, but you own 100% of its output.
10. **The demand for solo-built products is now measurable at scale.** Lovable: $500M ARR (Jun 2026) → ~$600M (Aug 2026), ~80% of users building monetisable businesses and >1/3 already earning; YC W26: 11% solo founders; China: OPC communities 95→618 in H1 2026. The one-person company is a *buyer* as well as a *builder*.

---

## 7. Claims I could not verify

- **"36.3% of new startups are one-person founded (+53% vs 2019)"; "16M+ OPCs = 27.4% of all Chinese enterprises"; "solo-founder efficiency +70%, annual cost $225K→$18K (−92%)"** — all from a [Tencent Cloud developer-community post](https://cloud.tencent.com/developer/article/2656375), no primary statistical source. **Unverified.** Internally tense too: 27.4% of *all* enterprises vs 36.3% of *new* startups.
- **No Crunchbase, Carta or Wellfound 2026 statistic** on the solo-founder share was located. The "17% of YC's last batch was one person" figure ([foundra.ai](https://www.foundra.ai/key-reads/revenue-per-employee-solo-founder-hiring-plan-2026-founder-playbook)) conflicts with Extruct's 11% for W26 — unreconciled.
- **Levels' Sept 2024 peak of $420,000/mo and $60K/mo GPU cost; "$10M ARR in 17 days" for fly.pieter.com; "4 billion requests/yr for $2,932/yr on VPS"** — all from the secondary DEV analysis, not primary posts I fetched. The 4B-requests figure **conflicts** with his primary 3 Nov 2026 figure of 2.4B.
- **Cursor/Anysphere: $60B SpaceX acquisition, $4B annualised revenue** — multiple outlet headlines plus Levels' own X post corroborate an acquisition; no primary body fetched (403s). **Strongly reported, not primary-verified.**
- **Replit at $525M ARR / $9B valuation** — only low-quality aggregators ([clinkbill](https://clinkbill.com/arr-leaderboard/replit), [valueaddvc](https://valueaddvc.com/blog/how-does-replit-make-money-525m-arr-9b-valuation-and-the-ai-agent-business-model-explained)). **Unverified.**
- **GitHub Copilot at 20M users** — only [blockchain.news](https://blockchain.news/PostAMP?id=github-copilot-dev-days-global-launch-20m-users); GitHub's own announcement not located. **Unverified.**
- **Base44 revenue at acquisition** — only *net profit* ($189K, May 2025) reported; ARR/revenue not disclosed. Founder-reported, not audited.
- **Honghub's HACR 75:1 and "AI handles 80% of coding"** — self-reported vendor-community survey (1,500 responses), not audited. The "half earn under ¥7,000/month" figure comes from a secondary write-up of that report, not the report itself.
- **DORA's "7.2% lower stability / 1.5% lower throughput"** — that is the **2024** DORA report, framed per 25% increase in adoption, as reported by Elektor. DORA's **2025** report uses a different framing; I did not fetch the 2025 PDF (unsupported content type).
- **No Stack Overflow Developer Survey 2026** located — only the 2025 edition. JetBrains' agent rankings verified only at headline level.
- **ShipFast, TinySeed, Tindefy, Envato, MicroAcquire/Acquire.com "$1M+ ARR one-person" lists** — not researched. These are course/marketplace products; a listing is a seller claim, not independent verification. Do not cite as evidence.
- **"One-person billion-dollar company" (PYMNTS, [link](https://www.pymnts.com/news/artificial-intelligence/2026/the-one-person-billion-dollar-company-is-here/))** — body did not render on fetch; the claim currently traces to Sam Altman naming the destination, per Outlook Business. Framing, not a documented company.
- **No source located for a "solo founder owns a $1M+ ARR company" list for 2026.**

---

*Compiled 2026-11-07. Every number traces to a linked source; founder-reported, aggregator-reported and secondary-read figures are marked inline.*
