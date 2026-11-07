# 09 — Risks: the honest failure list

The research behind this file is deliberately sceptical. Where a number is
contested or unverifiable, it says so. A guide that only lists upside is
marketing.

## The five that will burn you first

### 1. Verification, not generation, is the bottleneck

The most reliable finding in the entire research base, from three independent
directions:

- **DORA 2025**: a qualitative deep dive of **1,110 Google engineers** found
  increased velocity across all ten AI use cases, and flagged **"verification
  overhead" as a negative theme in all ten**. Higher AI adoption correlates
  with an increase in **both** delivery throughput **and** delivery
  instability. AI is an **amplifier**.
- **Stack Overflow 2026** (30,903 developers): 83% use AI at work, 66% use
  agents — but only **48% trust AI output "when they can verify it"**, 7%
  trust it for many tasks, and **fewer than 10% would delegate important
  decisions**. The **#1 cause of company AI disruption is
  plausible-but-wrong code**.
- **Stack Overflow 2025**: **46% do not trust AI output accuracy** (up from
  31%), **45% cite debugging AI-generated code** as a top frustration, and
  only **31% currently use AI agents**.
- **Elektor's 2026 vibe-coding retrospective** names the characteristic
  failure: **"testing theatre"** — generated tests that assert *current*
  behaviour rather than *intended* behaviour.

And the hard number that makes this urgent: **false success — the agent
reporting completion without doing the work — is 45–48% of all failures** in
single-control domains, and **75.8%** among self-assessing coding-agent
trajectories. The obvious detector does not work: an LLM judge asked "did the
agent finish?" never exceeded **AUROC 0.65** (0.54 on AppWorld traces) across
5 judges × 5 prompt strategies, because judges key on confident closing
language rather than verified state. Cheap deterministic detectors hit
**0.83 / 0.95 AUROC at 3,300× lower latency**.

**What this means for you:** the machine's throughput is not your problem. Its
**verification cost** is. If the agents produce code faster than you can check
it, you have not saved time — you have moved it from writing code to reading
code, and reading code is harder.

The countermeasures are in `playbook/05-quality.md`: numbered acceptance
criteria, a verification command in every task, mutation-style tests ("break
the feature, the test must fail"), deterministic state checks instead of
LLM-on-LLM review, and one adversarial reviewer whose only job is to doubt.


### 2. Distribution, not capability

> *"How do I find users" is the single most unresolved problem for over half
> of surveyed OPC founders* — Honghub's 2026 OPC Insight Report (1,500
> questionnaires).

The same report: **half of OPC founders earn under ~$970/month**, only 17.6%
keep AI costs at zero, and **>20% spend over $200/month** on AI. The dominant
emotions are **anxiety (11%), self-doubt (8%), loneliness (7%)**.

This is not a software problem and no amount of agent capability fixes it. It
is why `playbook/07-business.md` spends more space on distribution than on
architecture.

### 3. The productivity number is much weaker than it sounds

The famous claim is the METR randomised controlled trial: **16 experienced
open-source developers, 246 real issues, repositories averaging 22k+ stars and
1M+ LOC → 19% SLOWDOWN** (95% CI +2% to +39%). They *expected* a 24%
speed-up and still believed afterwards they had been sped up by 20%.

But METR has since **superseded its own result** (Feb 2026): a late-2025 rerun
(57 devs, 143 repos, 800+ tasks) produced point estimates of −18% and −4% —
i.e. speed-ups — and then METR **disowned the estimate**, because devs refused
to work without AI, withheld 30–50% of tasks they did not want done by AI, and
their pay was cut from $150 to $50/hr. The effect size is currently
**unmeasured**.

Their May 2026 survey (349 technical workers) reports median self-reported
**1.4–2× change in the value of work** and **~3× change in speed** — but
METR's own scepticism notes staff gave the lowest estimates of any subgroup,
~2% response rate, heavy convenience-sample bias, and that high-value claims
looked overstated where public outputs could be inspected.

**The synthesis to plan with:** *perceived* uplift ≈1.4–2× on value and ~3× on
speed; *experimentally measured* uplift was −19% in early 2025 and is
**unmeasured** now.

**Never plan a runway on a self-reported multiplier.** Measure it yourself,
on your own codebase, with your own merged-change count. That is what the
metrics table is for.

### 4. Failure is the base rate

| Case | Result |
|---|---|
| Pieter Levels | **115 projects, 20 self-tagged failures, 9 successes (8%)** — at most 9 revenue pillars out of ~113 |
| FacelessForge | **0 paid subscribers in 7 days**, $0 revenue, $0 marketing spend — with a public kill line honoured |
| NESTLY | 6 users, $0 revenue, dead |
| Honghub aggregate | half of OPC founders earn under ~$970/month |

Two structural lessons from FacelessForge, worth more than the anecdote:
**check your funnel before you read a zero** (their landing page was broken for
≥3 of the 7 validation days, so the data was partly contaminated), and
**single-channel distribution was a structural mistake**.

And Levels' standing rule after burning a year on Tubelytics: *"I'm not going
to build anything until there are customers."*

### 5. You are the bottleneck, and you will burn out

A company of one has no redundancy. When you are ill, the company stops. When
the machine is confidently wrong, there is nobody to contradict it except you,
and you have to be looking.

The mitigation is structural, not motivational: **the machine must run without
you for a week.** If it cannot, the automation has not finished. The Honghub
emotion data (anxiety, self-doubt, loneliness) is the warning sign.

---

## The risk register

| # | Risk | Likelihood | Impact | Early warning | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R1 | Verification cost exceeds the time saved | **High** | High | Review minutes per merged change rise | Verification ladder; deterministic state checks; error budget freezes releases | human + qa |
| R2 | Nobody wants the product | **High** | Fatal | No paying users by the kill-line date | Kill line with a date; week-3 user test in month 1 | human |
| R3 | Agent reports success without doing the work (**75.8%** of self-assessed coding failures) | **High** | Critical | A PR passes with no observable state change | Deterministic state checks, **never an LLM judge**; CI is the authority | qa + reviewer |
| R4 | Unbounded spend / infinite loop | Medium | **Critical** | Session wall-clock over budget; token counter jumps between polls | Token + wall-clock caps; kill switch; fast alerting (dashboards lag by days) | devops + human |
| R5 | Context rot — agents contradict each other | **High** | Medium | Two answers to the same question | `node tooling/src/cli.mjs doctor` weekly; one source of truth per fact; context packs | pm + architect |
| R6 | **Testing theatre** — tests assert current behaviour | **High** | High | Tests pass even when the feature is removed | Mutation testing: break it, the test must fail; QA writes tests from the spec | qa |
| R7 | **Package hallucination / slopsquatting** (4.62–6.10% of prompts; 53 names still registrable) | Medium | **Critical** | An import that resolves to an unexpected package | `--frozen-lockfile`; `osv-scanner`; dependency allow-list; "never invent a dependency" | engineer + devops |
| R8 | A table created without RLS → cross-tenant leak | Medium | **Critical** | A new table in a public schema | pgTAP suite per table in CI; a CI check for RLS on every new table | engineer + devops |
| R9 | Secret in the repo, a client bundle, a transcript or a CI summary | Medium | **Critical** | `service_role` in `apps/mobile`; a secret in a workflow-run panel | gitleaks + secret scanning; lint rule; **treat CI output as public** | devops |
| R10 | Destructive migration against production | Medium | **Critical** | A `db:rollback` in a CI log | No production credential in the agent environment; expand/contract only; forward-fix | devops + human |
| R11 | **Prompt injection** via repo, issue, CI, web or MCP (CVSS 7.8 in a real action; npm token theft) | **High** | **Critical** | An agent obeying instructions found in fetched content | Least privilege; no network for agent tasks; no prod creds; no untrusted content near write access | human designs, agent enforces |
| R12 | Coordination collision (two agents, one file) | Medium | Medium | The same path in two task write scopes | Write scopes; worktree isolation; one owner per file set | pm |
| R13 | Code-quality decay; the repo becomes unmaintainable | **High** | High | Duplicated blocks ↑, move refactors ↓, error-masking catches ↑ | Monthly churn/duplication/move-share metrics; **reserve a slice of agent time for consolidation** | engineer + human |
| R14 | Legal exposure from autonomous decisions | Medium | High | The agent touching employment, credit, health or legal outcomes | The six founder gates; EU AI Act Arts 4/50; CO 30 Jun 26; CA SB 942; CA ADMT 1 Jan 27 | **human only** |
| R15 | GDPR Art. 22 — a rubber-stamp reviewer is not human oversight | Low-Med | High | An agent scoring a person behind an agent reviewer | A human with authority and competence; documented exceptions and a contest route | human |
| R16 | Founder burnout | **High** | **Critical** | You skip the weekly review; the board rots | Cap review at a fixed weekly budget; the machine runs a week without you; delete one thing weekly | human |
| R17 | Over-engineering — twelve microservices in a month | Medium | High | A new datastore or service per feature | The role's "never"; the boring-stack rule; two-way vs one-way doors | architect |
| R18 | The framework you standardised on changes | **High** | Medium | A deprecation notice | Everything is files; `node tooling/src/cli.mjs pack` is the only harness-specific piece | human |
| R19 | Vendor lock-in / price change | Medium | Medium | A pricing change you did not see | Six-vendor ceiling; one owned channel; gateway for models | human |
| R20 | Data loss (no restore tested) | Low | **Critical** | "We have backups" | Restore drill quarterly; PITR on; RPO/RTO written down | devops |
| R21 | Customer data leaking into logs, transcripts or third-party AI | Medium | High | A field name from the spec appearing in a log line | Redacting logger; a CI grep gate; zero-retention with every vendor | engineer |
| R22 | You cannot copyright what you sell | Medium | Med-High | No record of human authorship of a shipped artefact | Keep prompts, edit diffs and review logs | human |
| R23 | The product becomes unmaintainable *by anyone but you* | Medium | High | Nobody else can understand the code | The reviewer role; written ADRs; the system in files, not in your head | engineer + architect |
| R24 | Support load exceeds one person | **High** (>200 customers) | High | Ticket backlog; business customers asking for an SLA | Published best-effort SLA; status page; support hours priced in; docs as answers | human + support |


---

## Agent-specific failure modes, in detail

### The characteristic one: confident, plausible, unverified claims

Not wrong code — **confident claims about untested things**. "I implemented
the CSV export and the tests pass." "The migration is reversible." "I checked
accessibility." Each is a sentence an agent produces fluently and cheaply.

The structural countermeasure is the evidence tier system in
`playbook/05-quality.md`: claimed → demonstrated → proven. Only tier 3 counts.

### Testing theatre

The most seductive failure, because the numbers look right. Generated tests
that assert what the code *currently does* rather than what the spec *says it
should do*. They pass, they raise coverage, and they protect nothing.

**The countermeasure is mutation testing, and it is cheap:** break the feature
deliberately and check that the test fails. If it still passes, the test is
theatre. The QA role's charter says this; the review checklist asks for it.

### Package hallucination (slopsquatting)

An agent invents a package name — `requests-python`, `lodash-es` — and if that
name exists on the registry, someone else's malicious package is now in your
lockfile. This is a documented supply-chain vector (USENIX), and it is
*specifically* enabled by agents, because agents will confidently `import`
something they have never seen.

Measured: across **199,845 Python/JS prompts and 5 frontier models**, package
hallucination rates were **4.62%–6.10%**. **127 package names were invented
identically by all five models**, and of those **53 remain
attacker-registrable** after registry defences (41 on PyPI, 12 on npm). It is
a **model-agnostic** surface — switching models does not fix it.

**Countermeasures:** frozen lockfile, `osv-scanner`, no unpinned deps, an
allow-list for anything the agent wants to add, and the engineer role's
explicit "never invent a dependency" rule.

### Infinite loops

A scan of **6,549 agent repositories** confirmed **68 loop failures across 47
projects** (91.9% precision). A loop amplifies one request into unbounded
execution: cost exhaustion, context growth, and **repeated external side
effects** — the last being the dangerous one, because a loop that retries a
write can do it many times.

**Countermeasures:** a wall-clock cap on every agent run (not just a token
cap), an iteration ceiling in the task's verification loop, and a kill switch
you have tested.

### Prompt injection — and the configuration that caused it

This is the risk with the sharpest recent teeth:

- **June 2026, CVSS v4 7.8**: a flaw in the Claude Code GitHub Action let any
  actor whose name ends `[bot]` trigger agent mode; indirect injection reached
  `/proc/self/environ` → the GitHub OIDC token → **write access to code,
  issues and workflows**. The default Action permissions were **read+write on
  code, issues, PRs, discussions *and workflow files***.
- **Anthropic's own example issue-triage workflow shipped
  `allowed_non_write_users: "*"`** and posted summaries to the **publicly
  visible** workflow-run panel — a ready-made exfiltration channel.
- **Cline, Feb 2026**: an npm publish token was stolen through a
  prompt-injected issue title (`cline@2.3.0`), pulled after ~8 hours.
- A researcher reported **~50 permission-bypass paths** in Claude Code.

**Countermeasures:** least privilege; no untrusted content anywhere near write
access; agents run with **no network** and **no production credentials**;
scoped, short-lived tokens; **treat CI summaries and workflow logs as public**;
and redact before logging, because a secret in a transcript is a secret in a
model's context and in your provider's logs.


### The amplifier problem

DORA's word, and it is the right one: **AI is an amplifier**. A company with
no platform, no tests and no CI generates technical debt *faster*, not slower.
The agent team does not fix a broken foundation — it builds on it faster.

That is why `playbook/01-day-one.md` puts the CI gates **before** the first
line of product code.

---

## The legal exposure, stated plainly

The agent is a tool, not an employee — but the exposure is real and the
frameworks are already live.

### Where you sit under the EU AI Act

| Obligation | Who | When |
|---|---|---|
| Art. 5 prohibited practices; **Art. 4 AI-literacy duty** | you | in force since 2 Feb 2025 |
| GPAI provider duties (Arts 51–56) | **the labs, not you** | since 2 Aug 2025 |
| **Art. 50 transparency** — label deepfakes and AI-published text on matters of public interest without human review | you (deployer) | **2 Aug 2026**, with a marking grace period to Dec 2026 for systems already on the market |
| High-risk, Annex III | you, if your product decides things about people in hiring, credit, education, biometrics, critical infrastructure or justice | **2 Dec 2027** |
| High-risk, Annex I (products) | you | 2 Aug 2028 |

Penalties: **up to €15M or 3% of worldwide turnover, with SME
proportionality** — which matters, because you are an SME.

**You are a *deployer*, not a provider**, when you use third-party models to
build your own product. Market an AI system under your own name and you may
become a provider. Note the Omnibus added agentic-AI provisions but **created
no new risk class for agents**.

**US states, all live or imminent:** Texas TRAIGA HB 149 (from 1 Jan 2026;
NIST AI RMF as an affirmative defence; penalties from $10K–12K curable to
$80K–200K uncurable, plus per-day) · Illinois HB 3773 (employment AI notice
and discrimination, private right of action) · **Colorado AI Act, 30 Jun 2026**
(impact assessments, disclosures, appeal rights, up to $20,000 per violation) ·
**California SB 942, 2 Aug 2026** (watermarking/detection, $5,000 per
violation per day) · **California CCPA automated-decision-making regulations,
1 Jan 2027** (risk assessments, pre-use notices, consumer opt-outs, up to
$7,500 per violation) — *this last one is the one that hits a SaaS that
scores, approves or rejects people*. A Dec 2025 executive order created a
federal AI Litigation Task Force to preempt state laws, but **state laws stay
enforceable until courts rule**, and the FTC is targeting "AI washing".

### The GDPR trap that changes your reviewer design

Under **Art. 22**, a second agent reviewing the first agent's recommendation is
**still automated processing**, and a rubber-stamp human is not human
decision-making (WP251rev.01, endorsed by the EDPB; cf. SCHUFA C-634/21).
Under Art. 15(1)(h) and CJEU *Dun & Bradstreet Austria* (C-203/22), an
explanation must describe **the procedure actually used** — a post-hoc,
AI-written explanation does not satisfy it.

**If a decision affects a person, a human with authority and competence must
make it, and the record of *how* must be accurate.**

### Copyright: you must be able to evidence your own authorship

The US Copyright Office's Part 2 report (Jan 2025) holds that **prompts alone
are insufficient** — they "function as instructions that convey unprotectable
ideas". *Thaler v. Perlmutter* (D.C. Cir. 2025) affirmed human authorship, and
the Supreme Court **denied certiorari on 2 March 2026**.

**The operational rule for a one-person company:** you must be able to evidence
human authorship of the product you sell. Keep the prompts, the edit diffs and
the review logs. If you cannot, you may not be able to copyright what you
sell.

On upstream litigation: *Bartz v. Anthropic* held training use "exceedingly
transformative" (fair use) but **retaining pirated copies to build the library
was not**; the court approved a **$1.5bn class settlement on 20 July 2026**,
the largest copyright class settlement in history. It covers **inputs only,
not outputs and no future conduct**. Do not assume "the vendor trained legally,
so my output is fine" — read the indemnities, and expect vendor output
constraints to change.

### Data processing duties you cannot delegate

You are the controller; the model vendor is the processor. That means an
**Art. 28 contract** (documented instructions, subprocessor authorisation,
deletion), **Chapter V transfer** mechanics for US vendors (SCCs + a transfer
impact assessment), purpose and retention limits, **zero-retention /
no-training-on-your-data** enabled, an **Art. 35 DPIA** when the risk changes,
and **Art. 33 breach notification within 72 hours** — stopping the agent does
**not** discharge that duty.

### The operational takeaway

The liability follows the *deployer*, which is you. So the six founder gates
are not bureaucracy — they are the legal boundary. If a decision can affect a
person's employment, credit, health, money or liberty, a human makes it.

And one framing note: **never describe your agents as employees**, in
contracts, in marketing, or on a slide. Employee-vs-contractor tests turn on
control, integration and economic dependence; the label becomes evidence of
intent against EU AI Act Art. 5, Illinois HB 3773 and the FTC's "AI washing"
enforcement. Say **"AI-assisted"** and name the human accountable owner.


---

## Personal and organisational risks

| Risk | Signal | Countermeasure |
|---|---|---|
| **Over-engineering** ("vibe everything") | a new service, datastore or queue appears per feature | the architect's "never"; the boring-stack rule; the ADR must name a real alternative |
| **Decision fatigue** | you approve ten small things a day | the founder-gate line is drawn too wide; widen it |
| **The always-on trap** | you answer agent messages at midnight | the machine runs on a schedule, not on your attention |
| **No succession** | only you can operate it | the system is in files; another human could pick it up |
| **Over-fitting to one product** | the roles encode this product's assumptions | roles are generic; only `company/` is product-specific — and `company/` is rewritten per product |
| **Review debt** | your review queue is longer than the agent's work queue | **cap your human review at a fixed weekly budget (say 6 hours). Exceeding it is a design defect, not a backlog** |

### The burnout data is not decorative

Stack Overflow 2026: nearly half of developers are **"neither satisfied nor
dissatisfied"** with their job, a third are dissatisfied, and only 22% are
satisfied — and **21% of the ambivalent group named burnout and tech
fatigue**. **31% of daily AI users use it 4+ hours a day.**

The strategic risk underneath: **software development cost is falling fast, so
competition intensifies.** And METR's own selection effect is the warning —
developers who refuse to work without AI have crossed from *tool* to
*dependency*.

### The guardrails that work

| Guardrail | Why |
|---|---|
| **Cap human review at a fixed weekly budget** | exceeding it is a design defect, not a backlog. This is the number that tells you when to stop adding agents |
| **Split work into two-way doors and one-way doors** | landing page, pricing, docs → ship without ceremony. Data model, auth, schema, storage vendor → written spec + rollback + human signature |
| **Give every feature a kill criterion** | "no paid customer in 90 days → delete" |
| **Keep WIP small** | many half-finished features are worse than few finished ones, for you and for the agents |
| **Run the code-health metrics yourself** | two-week churn, duplicated-block density, move share, error-masking count, legacy-touch rate — because the *trend*, not the level, is the evidence |

And one framing that reframes the whole project: **do not let AI become a
dependency.** Keep the skills that let you read and debug your own product at
the metal. The research calls the failure mode "skills debt" — fewer people
who can debug what the machine produced. For a one-person company, you are
that person.


---

## The pre-mortem

Write this before month 1 ends. One paragraph, in the future tense:

> "It is [date]. The one-person company failed because [...]. The sign we saw
> it coming was [...]. We did not act because [...]."

If you cannot fill in the last two blanks, you are not paying attention. The
most common answer, from every source in this research, is: **we found out
too late that nobody wanted it**, or **we spent everything on the machine and
never got a customer**.

---

## What to re-check every quarter

1. Are the **kill line** and its date still current?
2. Is your **review minutes per merged change** falling or rising? (Rising
   means the machine is not paying for itself.)
3. Is **R1** — verification cost — still the biggest tax? If yes, the spec
   quality is the lever, not the model.
4. Does the machine still run a **week without you**?
5. Have the legal regimes moved? (Colorado CAIA, EU PLD, EU AI Act.)
6. Has your **vendor** changed pricing or been acquired? (Two of the biggest
   names in this space changed hands in 2026.)
7. Have you **deleted** anything this quarter?
