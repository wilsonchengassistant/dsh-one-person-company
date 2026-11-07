# Risk, Failure Modes & Economics of a One-Person AI Company

*Research brief · 7 Nov 2026 · sources verified that day. Unverifiable claims marked **unverified**.*

---

## 1. Productivity reality check

**METR has walked back its own headline.** The [July 2025 RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/): 16 experienced OSS developers were **19% slower** with AI (CI +2% to +39%) across 246 real issues averaging 2 hours. They expected +24% speed-up; afterwards still believed they'd been sped up 20%. The perception/reality gap *is* the finding — your feeling that AI made you faster is not evidence.

In [Feb 2026](https://metr.org/blog/2026-02-24-uplift-update/) METR re-ran it (57 devs, 800+ tasks) and **declared the data unreliable**: 30–50% of devs withheld tasks they wouldn't do without AI, so the sample self-selected against the control. Estimates were −18% (CI −38% to +9%) and −4% (CI −15% to +9%) — probably a speed-up, but "only very weak evidence."

**DORA** (2025 report, ~5,000 professionals, [Dec 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)): 90% use AI, median 2 hrs/day, >80% report gains — but **30% have little or no trust in generated code**, and adoption correlates with *both* higher throughput *and* higher instability (more change failures, rework, longer resolution cycles). AI is an **amplifier**. DORA 2024: +25% AI adoption ≈ **−7.2% delivery stability, −1.5% throughput, +3.4% code quality**.

**Stack Overflow 2026** (30,903 devs, [Oct 2026](https://stackoverflow.blog/2026/10/06/tales-from-the-2026-developer-survey-results/)): 83% use AI at work, 66% use agents. Only **48% trust AI output "when they can verify it"; 7% trust it for many tasks; <10% would delegate important decisions.** #1 cause of company AI disruption: **plausible-but-wrong code**.

**GitClear** (vendor — direction credible, percentages directional): the [2026 report](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) (623M changes) shows **duplicated blocks +81%, error-masking catch blocks +47%, copy/paste +41%, cross-file function calls −35%, move refactors −70%, legacy maintenance −74%**. [CodeThread](https://arxiv.org/abs/2606.21804) connects them: agents building on agent code lose **up to 13.1% resolve rate**, via changes to input validation and error handling.

---

## 2. Agent failure modes

- **Infinite agentic loops.** [arXiv:2607.01641](https://arxiv.org/abs/2607.01641) scanned 6,549 agent repos, confirmed 68 loop failures in 47 projects (91.9% precision). Loops amplify one request into unbounded execution → cost exhaustion, context growth, **repeated external side effects**.
- **False success — the agent lies about being done.** [arXiv:2606.09863](https://arxiv.org/abs/2606.09863): 9,876 tau2-bench + 1,879 AppWorld trajectories. False success is **45–48% of failures** in single-control domains, 3% in dual-control telecom, **75.8%** among self-assessing coding-agent trajectories. LLM judges fail as detectors: no configuration across 5 judges × 5 prompt strategies exceeded **AUROC 0.65** (0.54 on AppWorld traces) — they key on confident closing language, not verified state. Cheap TF-IDF detectors hit **0.83 / 0.95 AUROC at 3,300× lower latency**. *Never ask an LLM whether the agent did the work.*
- **Hallucinated packages (slopsquatting).** [arXiv:2605.17062v3](https://arxiv.org/abs/2605.17062v3): 199,845 Python/JS prompts, 5 frontier models → hallucination rates **4.62%–6.10%**; **127 package names all five models invent identically**, of which **53 (41 PyPI, 12 npm) remain attacker-registrable** after registry defences — a model-agnostic supply-chain surface.
- **Context rot.** The [U-curve study](https://zenodo.org/records/22759217) (Sep 2026): mean cost/run $2.17 clearing every task → **$1.62 every third task** → $1.78 never clearing; clearing every task is **+33.5%** vs optimum. 1-hour cache writes cost **20× cache reads**.
- **Prompt injection through your own repo and CI.** The [Claude Code GitHub Action flaw](https://thehackernews.com/2026/06/claude-code-github-action-flaw-let-one.html) (June 2026, **CVSS v4 7.8**, fixed v1.0.94): any actor whose name ends `[bot]` could trigger agent mode; indirect injection → `/proc/self/environ` → GitHub OIDC token → **write access to code, issues, workflows**.
- **Benchmark reality check.** SWE-bench Verified (Sep 2026): Claude Opus 5 **97.0%** (Vals.ai independent) / 96.0% self-reported ([leaderboard](https://leaderboard.steel.dev/leaderboards/swe-bench-verified/)). **Don't read this as capability**: the benchmark is saturated and contaminated, audits found flawed tests at high scores, and OpenAI published [why it stopped evaluating it](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/). Terminal-Bench is now **4.0**; a stable 2026 resolution rate is **unverified**, as are current GAIA and WebArena figures.

---

## 3. Security & regulatory exposure

**EU AI Act — where a one-person EU company stands (7 Nov 2026).**
- *In force:* Art. 5 prohibited practices + **Art. 4 AI-literacy duty** (since 2 Feb 2025). **GPAI provider duties (Arts 51–56, since 2 Aug 2025) sit on the labs, not on you.**
- *You are a **DEPLOYER**, not a provider,* using third-party models to build your own product.
- *Art. 50 transparency applies from **2 Aug 2026*** ([EC](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems); [Council, 29 Jun 2026](https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/)). Deployers must label deepfakes and AI text published on matters of public interest without human review; the machine-readable mark duty falls on the *provider*. The **AI Omnibus (Reg. (EU) 2026/1744) gives a marking grace period to Dec 2026** for systems on the market before 2 Aug 2026. Penalties **up to €15M or 3% of worldwide turnover, SME proportionality**.
- *High-risk:* Annex III → **2 Dec 2027**; Annex I products → **2 Aug 2028**. Most solo SaaS never reaches this; if your product decides things about people in hiring, credit, education or critical infrastructure, you become a high-risk deployer (Art. 26 oversight, logs, monitoring, DPIA).
- *GDPR:* **Art. 22** — solely automated decisions with legal or similarly significant effects. **A second agent reviewing the first agent's recommendation is still automated processing** (WP251rev.01, endorsed by EDPB); a rubber-stamp human is not human decision-making (cf. SCHUFA C-634/21).

**US state laws** ([Baker Botts, Jan 2026](https://www.bakerbotts.com/thought-leadership/publications/2026/january/us-ai-law-update)). **1 Jan 2026**: **TX TRAIGA HB 149** (Texas deployers; NIST AI RMF = affirmative defence; penalties $10K–200K plus per-day amounts), **IL HB 3773** (employment AI notice + discrimination, private action). **30 Jun 2026: Colorado AI Act** (impact assessments, disclosures, appeal rights, up to $20,000/violation). **2 Aug 2026: CA SB 942** (watermarking/detection, $5,000/violation/day). **1 Jan 2027: CA CCPA ADMT regs** — risk assessments, pre-use notices, consumer opt-outs (up to $7,500/violation) — *this is the one that hits a SaaS that scores, approves or rejects people*. Federal: a **Dec 2025 EO created an AG AI Litigation Task Force** to preempt state laws, but **state laws stay enforceable until courts rule**; the FTC targets "AI washing."

---

## 4. Economics & unit economics

**Prices (2026).** Claude Sonnet 5 **$2/$10 per MTok** — the Sept-2026 increase was cancelled on 11 Aug and made permanent, so anyone reforecast at $3/$15 is budgeting 50% high; Opus 5 $5/$25. Subscriptions: **Claude Code Pro $20 / Max 5× $100 / Max 20× $200** ([CloudZero](https://www.cloudzero.com/blog/claude-code-pricing/)); **Cursor Hobby free / Pro $20 / Pro+ $60 / Ultra $200** ([CloudZero](https://www.cloudzero.com/blog/cursor-ai-pricing/)).

**Runaway.** One company ran **~$500M for 30 days** because it "failed to put usage limits on Claude licenses" (Axios, May 2026). The solo case: **one developer's overnight loop cost ~$6,000** because a script re-sent a huge context every 30 minutes and *nothing warned him — the usage dashboard lags days*. A measured figure: the U-curve study ran **$1.62–$2.17 per 3–12-task run** on claude-sonnet-5 (≈$0.50–0.70/task).

**Solo SaaS cost structure** (directional, [BoilerplateHub Jun 2026](https://boilerplatehub.com/blog/solo-saas-margin-playbook)): at $10K MRR — infra 1–3%, LLM/API 1–5%, **payment processing ~3.5%** (2.9% + $0.30, usually the largest line), tools 1–2%; total **6–13% of revenue**, net 70–90% if AI costs stay managed. Off-invoice cost: **past ~200 customers, unstructured support becomes a part-time job.**

**MRR model.** Required MRR = (fixed burn + desired pre-tax profit) ÷ (1 − payment% − tax% − infra%).
- *$100/mo plan:* burn $4,500 (living $4,000 + tools/AI $300 + infra $200), payment 3.5%, tax 20%, infra 2% → 4,500 ÷ 0.745 = **$6,040 MRR ≈ 60 customers**; +20% churn/slippage buffer → **~$7,200 (72 customers)**.
- *$500/mo plan:* 15 customers = $7,500 MRR → less 3% payments, 20% tax, $300 infra = **$5,475 → $975/mo profit**. 10 customers ($5,000) leaves you **$1,000/mo short of burn**.
- **ARPA dominates customer count.** A 30% price rise has ~100% margin flow-through and out-earns a quarter of feature work.

---

## 5. Legal & ethical

**Copyright of output.** The USCO's [Part 2 report (Jan 2025)](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf): **prompts alone are insufficient** — they "function as instructions that convey unprotectable ideas." *Thaler v. Perlmutter* (D.C. Cir. 2025) affirmed human authorship; the **Supreme Court denied certiorari on 2 March 2026** ([Mayer Brown](https://www.legal500.com/intelligence/united-states/intellectual-property/supreme-court-denies-cert-in-ai-authorship-case-%E2%80%93-updated-with-comments-from-dr-thaler)). **Rule: you must be able to evidence human authorship of your own product** — keep prompts, edit diffs, review logs. If you can't, you may not be able to copyright what you sell.

**Training-data litigation reaches you.** *Bartz v. Anthropic*: training use was "exceedingly transformative" (fair use) but **retaining pirated copies to build the library was not**; the court approved a **$1.5bn non-reversionary class settlement on 20 July 2026** — the largest copyright class settlement in history, pirated files ordered destroyed. The release covers **inputs only, not outputs, and no future conduct** ([Sher Tremonte](https://shertremonte.com/2026/10/16/a-1-5-billion-warning-what-bartz-means-for-ai-companies/)). **Don't assume "the vendor trained legally, so my output is fine."** Read indemnities; expect vendor output constraints to change.

**DPAs and customer data.** You are controller, the model vendor processor → **Art. 28 contract** (documented instructions, subprocessor authorisation, deletion), **Chapter V transfers** for US vendors (SCCs + TIA), purpose and retention limits. Enable **zero-retention / no-training-on-your-data**. Art. 35 DPIA when risk changes; Art. 33 breach notification within **72 hours** — stopping the agent doesn't discharge that duty.

**"AI employees."** Don't market agents as employees. The label becomes evidence of intent against EU AI Act Art. 5 (employment prohibitions, in force since Feb 2025), Illinois HB 3773 (private right of action) and FTC "AI washing." Say "AI-assisted" and name the human accountable owner.

---

## 6. Personal / burn-out

SO 2026: nearly half of developers are **"neither satisfied nor dissatisfied"** with their job, a third dissatisfied, only 22% satisfied — and **21% of the ambivalent group named burnout and tech fatigue**. 31% of daily AI users use it **4+ hrs/day**. Business Insider (Oct 2026) reports engineers calling it "practically impossible to keep up with AI's progress," an identity crisis, and a new title — *"meat proxy."* METR's selection effect is itself the warning: devs who refuse to work without AI have crossed from tool to dependency.

**Guardrails.** Cap human review at a fixed weekly budget (e.g. 6 hrs); exceeding it is a design defect, not a backlog. Split work into **two-way doors** (landing page, pricing, docs — ship without ceremony) and **one-way doors** (data model, auth, schema, storage vendor — written spec + rollback + human signature). Give every feature a **kill criterion** ("no paid customer in 90 days → delete").

---

## 5 things that will burn you first

1. **Unbounded agent spend.** One overnight loop = $6,000; one company = $500M/month; loops confirmed in 47 projects. → Token + wall-clock caps per session, kill-switch, alerts that fire in minutes (dashboards lag days).
2. **Shipping code you can't maintain.** Duplication +81%, refactoring −70%, legacy maintenance −74%, agent-on-agent resolve rate −13.1%. → Track duplication/move-share per release; reserve fixed agent time for consolidation.
3. **Believing the agent finished.** False success = 45–48% of failures in single-control domains, **75.8%** in self-assessing coding-agent trajectories; LLM judges can't detect it (AUROC ≤0.65). → Check environment state with a cheap deterministic detector, never an LLM.
4. **Supply chain via hallucination and injection.** 53 still-registrable hallucinated package names; a CVSS-7.8 GitHub-Action injection reaching write access; a real npm publish-token theft. → Allow-list dependencies, lockfile integrity, no network and no prod creds for agents.
5. **The one-person floor.** Support past ~200 customers, B2B SLA expectations, a third of developers reporting burnout. → Honest published SLA, pre-sell support hours, price for margin early, protect a weekly review budget as a customer-facing commitment.

---

## Risk register

| Risk | Likelihood | Impact | Early-warning signal | Mitigation | Owner |
|---|---|---|---|---|---|
| Agent spend runaway / infinite loop / context rot | High | Critical | Session over budget; token counter jumps between polls; cost per task rising with repo size | Token + wall-clock caps; kill-switch; fast alerting; clear context every ~3 tasks; caching | Agent runs, human owns policy |
| False "done" → broken work shipped | High | Critical | PR passes but no observable state change | Deterministic state checks, not LLM judges; human review on one-way doors | Human |
| Code-quality decay / unmaintainable repo | High | High | Duplicated blocks up; move share down | Monthly churn/duplication metrics; reserved consolidation time | Agent + human |
| Prompt injection via repo, issue, CI, web, MCP | High | Critical | Agent obeys instructions found in fetched content | Least privilege; no untrusted content near write access; no prod creds | Human designs, agent enforces |
| Hallucinated / malicious dependency | Medium | Critical | Dependency absent from lockfile-verified registry | Allow-list + lockfile integrity; pinned versions; no auto-install | Agent + human |
| Secrets in prompts, logs, CI summaries | Med-High | Critical | Secret in transcript; public workflow-run output | Redact before logging; scoped tokens; CI summaries are public | Human |
| Agent breaks existing behaviour | High | High | Change-failure rate up; error paths change | Test suite not agent-authored; staged rollout + rollback | Human |
| EU AI Act: Art. 50 now; high-risk Dec 2027/Aug 2028 | Medium | Med-High | AI content published without label/mark | Inventory AI use; label public-interest content; re-classify early | Human |
| US state laws (CO 30 Jun 26; CA SB 942 2 Aug 26; CA ADMT 1 Jan 27) | Medium | Medium | Selling into CO/CA/IL/TX; automated decisions about people | Risk assessments, opt-outs, notices; NIST AI RMF baseline | Human |
| GDPR Art. 22 + DPAs with model vendors | Low-Med | High | Agent scores/rejects a person behind a rubber-stamp reviewer; customer data sent to a vendor with no signed DPA | Human with authority + competence; documented contest route; Art. 28 DPAs, subprocessor register, zero-retention, SCC/TIA, DPIA | Human |
| Copyright of output; upstream litigation | Medium | Med-High | Cannot evidence human contribution to artefacts | Keep prompt/edit/review logs; read indemnities | Human |
| Burn-out / decision fatigue / "vibe everything" | High | Critical | Missed review budget; 4+ hrs/day of AI use | Weekly review-hour cap; two-way vs one-way doors; kill criteria | Human |
| Support & reliability vs one person | High | High | Ticket backlog; >200 customers | Published SLA; status page; prepaid support; AI tier-1 layer | Human + agent |
