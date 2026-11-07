# Agent Tooling Landscape 2026 — Research Brief

> Verified against first-party docs on 2026-11-07. Sceptical where warranted.
> Sources: Anthropic, OpenAI, Cursor, GitHub, Google, Microsoft, Pydantic, Mastra,
> Vercel, LangChain, MCP blog, spec-kit docs. Third-party cost analysis flagged explicitly.

## TL;DR

The 2026 landscape has **converged, not diverged**. Anthropic, OpenAI, Cursor, Google,
Microsoft, Pydantic, Mastra and LangChain all now ship the same four primitives under
different names:

1. a **coding harness** (Claude Code, Codex, Cursor CLI, Mastra Harness, Pydantic AI Harness, MS Agent Harness)
2. a **subagent/worker** primitive
3. a **scripted workflow runtime** for fan-out
4. an **observability plane**

The differentiator for a one-person company is no longer *which framework* — it is
**how you structure the artefacts between the agents** (spec files, AGENTS.md, worktrees)
and **how you bound cost**. The framework choice is mostly a language and billing decision.

---

## 1. The agent tooling landscape

| Tool | What it actually is | Genuinely good at | Licensing / cost | Self-hostable |
|---|---|---|---|---|
| **Claude Code** (CLI/IDE/web) | Anthropic's coding harness: built-in tools, permissions, hooks, skills, subagents, worktrees, dynamic workflows | Being the *harness* — an agent that reads your repo, runs your tests, opens PRs. Deepest integration of file/memory/permission primitives | Subscription (Pro/Max/Ultra) **or** API; ~$13/dev/active-day enterprise average | Harness yes; model no |
| **Claude Agent SDK** | Claude Code as a Python/TS library — same tools, loop, hooks, sessions, subagents, MCP | Embedding a *real* coding agent inside your own product | Anthropic Commercial ToS; API-key auth only (no claude.ai resale) | Yes |
| **Claude Managed Agents** | Hosted long-horizon agent service; session (durable event log) / harness / sandbox are three decoupled interfaces | Running agents for hours-days; p50 TTFT −60%, p95 −90% vs the coupled-container design | Hosted | Sandbox optionally self-hosted |
| **OpenAI Codex** (CLI/IDE/cloud) | Coding harness + cloud environments + scheduled tasks + `@codex` GitHub delegation. Now has **subagents, rules, memories, hooks, skills, git worktrees** | Ticket→PR in the background; GitHub-native; worktree isolation | ChatGPT plans **or** API. Credits/1M: Sol **50** in / **2.5** cached / **250** out; Luna 2.5/0.25/12.5; Terra 25/1.25/125 | CLI/harness yes; cloud no |
| **OpenAI Agents SDK** | Small-primitives SDK: Agents, agents-as-tools/handoffs, guardrails, sessions, tracing — plus new **sandbox agents** with resumable sessions | Small Python-first orchestration; excellent tracing/evals wiring | OSS SDK; pay per token | Yes |
| **OpenAI Agents API** (hosted) | Managed sessions, hosted or self-hosted sandboxes, vaults, multi-agent, webhooks | Product-embedded agents with durable sessions | Pay per token + hosted infra | Sandboxes yes |
| **Cursor** (under SpaceXAI/xAI since Aug 2026) | IDE + **Cloud Agents** (was Background Agents) in isolated VMs; rules, skills, subagents, hooks, plugins, MCP, Origin code hosting, Bugbot, Security Agents, Approval Agents, Agent SDK, CLI (ACP, headless) | Cloud agents that *actually run your app* and produce merge-ready PRs with artifacts + remote desktop takeover | Free $0 / Plus $8 / Premium $30 / Super $100 / Ultra $200 / Teams $30+/user. **Third-party models billed separately at API list price** | Cloud agents no; self-hosted machines yes |
| **GitHub Copilot** (coding agent / agent mode) | Background agent on GitHub infra: issue→PR. **Self-reviews via Copilot code review before opening the PR**, runs code/secret/dependency scanning inline. Custom agents under `.github/agents/` | Review-before-PR + free code scanning; CLI↔cloud context handoff | Per-seat + premium requests; code scanning included | No |
| **Devin** | Autonomous engineer, ACU-metered | Ticket→PR with no human in the loop | $0/$20/$80min/$200 + metered ACUs. ACU rate, allowance, concurrency **not published** | No |
| **LangGraph** | *Low-level* orchestration runtime: graphs of shared state, durable execution, checkpointers, interrupts, time-travel | Explicit state/control flow for long-running stateful agents; deterministic + agentic steps in one graph | OSS (MIT); hosted = LangSmith Deployment | Yes |
| **LangChain** | Agent framework + integrations; **Deep Agents** = the harness layer (planning, subagents, FS tools, context mgmt) | Breadth of model/tool integrations | OSS + LangSmith (paid platform) | Yes |
| **CrewAI** | Role/task/crew + Flows (event-driven) | Quick role-based agent teams with low ceremony | OSS; enterprise platform paid | Yes |
| **AutoGen** | Microsoft's original multi-agent library | Research heritage | **Superseded** — migrate to Microsoft Agent Framework | Yes |
| **Microsoft Agent Framework** | AutoGen + Semantic Kernel merged; **Harness Agent** (planning/todo, compaction, FS, tool approval, observability), functional + graph workflows | .NET/Python/Go enterprise, Foundry-centric | OSS + Azure | Yes |
| **Google ADK** | ADK **2.0** with Graph Workflows; Python/TS/Go/Java/Kotlin | Context *management* as a first-class feature (filters irrelevant events, summarises old turns, lazy-loads artefacts, tracks tokens) | OSS; deploys to Agent Platform/Cloud Run/GKE | Yes |
| **Pydantic AI** | Typed Python SDK + **Pydantic AI Harness** (capabilities: Coder, memory, guardrails, sub-agents, planning, compaction) + Pydantic Evals + Pydantic Graph + Gateway | Type-safety, DI, durable execution on **9 engines** (Temporal, DBOS, Prefect, Restate, Lambda, Airflow, Absurd, pgtask, Azure Durable Task), OpenTelemetry-native | OSS; Logfire paid (free tier) | Yes |
| **Mastra** | TypeScript framework: agents, workflows, **Harness**, memory, Knowledge (alpha), subagents, skills, channels, signals, sandboxes, browser, Studio | TS-native full-stack agent product; Mastra Factory for coding-agent coordination | OSS; Mastra Platform paid | Yes |
| **Vercel AI SDK 7** | TS SDK (16M+ weekly downloads). Adds **HarnessAgent** — run Claude Code / Codex / Deep Agents / OpenCode / Pi behind one interface; MCP Apps; HMAC-signed tool approvals; `WorkflowAgent` durability; OTel telemetry | Embedding third-party harnesses; MCP app UIs | OSS; AI Gateway paid | Yes |
| **n8n** | Visual workflow builder with AI nodes, agents, one-click MCP registry | Non-code automation glue (CRM, email, webhooks) | Sustainable-use licence (not OSI OSS); self-host **source-available** | Yes (licence caveats) |
| **Dify** | Visual LLM app builder (workflow, RAG, agents) | Non-technical teams; fast prototypes | Apache-2.0 core with commercial restrictions | Yes |

Sources: [Claude Code docs](https://code.claude.com/docs/en/sub-agents) · [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) ·
[Managed Agents](https://www.anthropic.com/engineering/managed-agents) · [Codex pricing](https://learn.chatgpt.com/codex/pricing) ·
[Agents SDK](https://openai.github.io/openai-agents-python/) · [Cursor Cloud Agents](https://cursor.com/docs/cloud-agent) ·
[Cursor pricing](https://cursor.com/pricing) · [Copilot coding agent](https://github.blog/ai-and-ml/github-copilot/whats-new-with-github-copilot-coding-agent/) ·
[LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) · [MS Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview) ·
[ADK](https://adk.dev/) · [Pydantic AI](https://pydantic.dev/docs/ai/overview/) · [Mastra](https://mastra.ai/docs) ·
[AI SDK 7](https://vercel.com/blog/ai-sdk-7) · [CrewAI](https://docs.crewai.com/en/introduction)

**Sceptical note.** Every row claiming "multi-agent orchestration" is the same three
patterns (Anthropic's *orchestrator-workers, parallelisation, evaluator-optimizer*).
Frameworks differ in plumbing, not ideas. Anthropic's guidance — start with LLM APIs
directly, add complexity only when it demonstrably improves outcomes — has aged well.

---

## 2. Context and pattern mechanics (the actual techniques)

From Anthropic's
[Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
and [Building effective agents](https://www.anthropic.com/research/building-effective-agents):

### The four long-horizon techniques that matter

1. **Compaction** — summarise the context window near its limit and reinit with the summary.
   In Claude Code the model preserves architectural decisions, unresolved bugs and
   implementation details, discards redundant tool output, and continues with the
   compressed context **plus the 5 most recently accessed files**. Cheapest safe form:
   *clear tool calls and results* (a first-class Claude API feature).
2. **Structured note-taking / agentic memory** — the agent writes notes to files outside the
   context and re-reads them later. Claude Code's to-do list and `NOTES.md` are the same
   pattern. Anthropic shipped a file-based *memory tool* (public beta) with Sonnet 4.5.
3. **Sub-agent architectures** — the lead holds a high-level plan; each subagent explores in
   its own context (tens of thousands of tokens) and returns a **condensed 1,000–2,000-token
   summary**. The single biggest context lever.
4. **Just-in-time retrieval** — don't pre-load. Keep lightweight identifiers (file paths,
   stored queries, URLs) and load at runtime. Claude Code is hybrid: CLAUDE.md is dropped in
   up front; `glob`/`grep` navigate just-in-time.

### Tool design is prompt design

Anthropic spent more time on tools than on the prompt for SWE-bench, and found the model
misused relative paths after leaving the root — so they changed the tool to require
**absolute filepaths** and the model used it flawlessly. Use *poka-yoke* on arguments.

### Routing (cheap vs expensive) is a first-class pattern

Anthropic names routing easy questions to Haiku 4.5 and hard ones to Sonnet 4.5 as a
production workflow.

### Manus's context-engineering primitives

([Context Engineering for AI Agents](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus))
— the most transferable and least known:

- **Design around the KV-cache.** Manus's average input:output token ratio is **~100:1**.
  Keep the prompt prefix stable (a second-precision timestamp in the system prompt kills the
  cache), make context **append-only**, use deterministic JSON serialisation (many languages
  don't guarantee stable key ordering).
- **Mask, don't remove.** MCP's popularity means someone plugs in hundreds of tools; a
  heavily-armed agent gets dumber. Don't dynamically add/remove tool definitions (it
  invalidates the cache and confuses prior references) — **mask token logits** to constrain
  which tools are selectable. Use consistent name prefixes (`browser_`, `shell_`).
- **Use the filesystem as context.** Unlimited, persistent, directly operable. Compression must
  be **restorable** — drop a web page's body but keep the URL; drop a document's contents but
  keep its path.
- **Manipulate attention through recitation.** `todo.md` is deliberate: constantly rewriting
  the list **recites objectives into the recent attention span**, defeating lost-in-the-middle.
- **Keep the wrong stuff in.** Don't erase failed actions or stack traces — erasing failure
  removes the evidence the model needs to update its priors.
- **Don't get few-shotted.** Models imitate the pattern in context; add deliberate small
  structured variation to break ruts.

### OpenAI's practical guide

Adds **layered guardrails** (relevance / safety / PII / moderation classifiers, tool risk
ratings with escalation, rule-based filters, output validation) and one crisp rule:
*maximise a single agent's tools first; introduce more agents only when agents fail to
follow instructions or the tool set overloads*.

---

## 3. Memory and knowledge

### File-based memory is a cross-vendor standard

`AGENTS.md` is read natively by Claude Code (v2.1.277+; configurable as
`claude-md-or-agents-md` / `claude-md-and-agents-md` / `claude-md` / `managed-only`),
Codex, Cursor and Copilot. `SKILL.md` follows the
[Agent Skills open standard](https://agentskills.io/). Anthropic's `/init` even imports
Cursor `.cursor/rules`, `.cursorrules` and Copilot `.github/copilot-instructions.md`.

### Hard limits to design around

- CLAUDE.md: **target < 200 lines**; files over 4 MiB skipped; subdirectory CLAUDE.md/rules
  get **40,000 chars (200K ctx)** or **200,000 chars (1M ctx on Opus 4.6 / Sonnet 4.6;
  150,000 on later models)**.
- Auto memory index (`MEMORY.md`): **first 200 lines or 25 KB**, whichever first.
- Subagent **descriptions** collectively > **15,000 tokens** → startup warning.
- Skills: description always in context, **body loads only on invocation**. Keep
  `SKILL.md` < 500 lines; put detail in sibling files.

### Vector vs graph memory

Use vector/embedding retrieval when the corpus is large and the question is semantic
("what did we decide about X?"). Use graph memory when you need *relationship* queries
("what depends on this module?"). For a one-person company the honest answer: **files beat
both** until you exceed ~10k documents, because files are diff-able, review-able and
version-controlled. Graph memory models a codebase's dependency graph well — but `git grep`
plus the language server already do that better. Anthropic ships *code intelligence plugins*
(LSP-backed "go to definition") precisely to replace grep with symbol navigation.

### Avoiding context rot

The empirical rule: *smallest set of high-signal tokens that maximises the likelihood of the
desired outcome*. Practically — keep CLAUDE.md to facts (build commands, conventions,
architecture), move procedures to skills, use path-scoped rules (`.claude/rules/*.md` with
`paths:` frontmatter) that load only when a matching file is touched, use `@path` imports
(max 4 hops), and use hooks to pre-filter huge outputs (grep the log for `ERROR` and inject
20 lines instead of 10,000).

### MCP status in 2026 — mature, standardised, vendor-neutral

Latest spec is **2026-07-28**: *stateless protocol core*, **Multi Round-Trip Requests**,
header-based routing, **cacheable list results**, authorisation hardening, and a formal
**Extensions framework** (plus a formal deprecation policy). Anthropic donated MCP to the
**Agentic AI Foundation under the Linux Foundation** (Dec 2025). The **MCP Registry** (open
catalogue/API for discovering public servers) launched Sep 2025. **MCP Apps** (SEP-1865,
tools returning interactive UI) is the first official extension, live Jan 2026. `.mcpb`
bundle format gives one-click local server installs. Tier 1 SDKs for
TypeScript/Python/Go/C#/Ruby/Java.

**Which servers are worth having:** fewer than you think. Anthropic's guidance is blunt —
**CLI tools are more context-efficient than MCP servers** (`gh`, `aws`, `gcloud`,
`sentry-cli` add no per-tool listing). MCP tool definitions are deferred by default in
Claude Code, but **every server still adds context**. Codex says the same: *"Limit the
number of MCP servers you use."* Worth it: filesystem/git, browser automation
(Playwright/Puppeteer — Anthropic's own long-running-agent research shows browser automation
via Puppeteer MCP dramatically improves end-to-end verification), read-only Postgres/SQLite,
Sentry, docs/search. Not worth it: anything the agent can do with a shell command.

---

## 4. Spec-driven development with agents

### What is actually proven in 2026

- **Spec-as-source-of-truth with a phase chain.** GitHub's
  [spec-kit](https://github.github.io/spec-kit) (147K+ stars, 320+ contributors, 43 agent
  integrations, 186 community extensions) ships the core SDD loop as
  **Specify → Plan → Tasks → Implement → Converge**, each phase producing a Markdown
  artefact feeding the next. It has grown into a *process harness* (presets, extensions,
  workflows, bundles) rather than a single skill.
- **The feature-list-with-`passes: false` pattern** is Anthropic's most replicable finding
  ([Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)).
  An **initializer agent** expands the user's prompt into a comprehensive feature list
  (~200 features for a claude.ai clone), each marked `passes: false` in **JSON** (chosen
  because "the model is less likely to inappropriately change or overwrite JSON files
  compared to Markdown files"). Each later **coding agent** works on **one feature at a
  time**, may only flip `passes` to true, and is told *"It is unacceptable to remove or
  edit tests."*
- **Clean-state hand-off between sessions.** `init.sh` (how to run the app) +
  `claude-progress.txt` (what agents have done) + git history. Startup ritual: `pwd` →
  read progress file → read feature list → `git log --oneline -20` → run `init.sh` →
  **verify the app still works before implementing anything**.
- **Verification must be explicit.** Absent explicit prompting, Claude marks features
  complete without real end-to-end testing. Browser automation + "test as a human user
  would" was the single biggest quality lever in that study.
- **Spec-kit has since shipped two more processes:** *Agentic Bug Fix* (assessed cause →
  scoped fix → recorded verification) and *Agentic Idea Assessment* (research → evidence-backed
  go/clarify/stop). Both are independent entry points, not mandatory phases.
- **Self-review is now standard in shipped products.** Copilot coding agent **reviews its own
  changes with Copilot code review before opening the PR**, iterates, then asks you to
  review. Claude Code has `/code-review` and `/verify` bundled skills; Cursor has Bugbot
  and Approval Agents.

### Concrete workflow shapes that hold up

```
plan/execute/verify:  spec.md -> plan.md -> tasks.md -> [implement -> test -> fix] per task -> verify.md
fan-out review:       1 agent per file, then 1 agent that ranks + dedupes per-file findings
adversarial verify:   N agents each try to *disprove* the others' conclusions; report consensus
bounded fix loop:     run `npx tsc --noEmit`; fix errors; stop after 2 rounds with no progress
competing hypotheses: 5 agents test different root causes, talk to each other to disprove each other
```

---

## 5. Orchestration at scale

### The parallelism ladder

| Primitive | Who decides what runs next | Where intermediate results live | Scale | Interruption |
|---|---|---|---|---|
| Subagent | Claude, turn by turn | Claude's context | A few per turn | Restarts the turn |
| Skill | Claude, following the prompt | Claude's context | Same as subagents | Restarts the turn |
| Agent team | The lead agent, turn by turn | Shared task list | A handful of long-running peers | Teammates keep running |
| **Dynamic workflow** | **The script** | **Script variables** | **Dozens–hundreds of agents/run** | **Resumable in the same session** |

### The workflow script is the key unlock

Claude Code's dynamic workflows are plain JavaScript with `agent()`, `pipeline()`,
`parallel()`, `phase()`, `log()`. Because intermediate results live in *script variables*,
not Claude's context, the context holds only the final answer — and the orchestration is a
**file you can read, diff, commit and re-run** (`.claude/workflows/`). This is the only
primitive that genuinely scales to hundreds of agents.

Hard limits (documented): **16 concurrent agents** by default
(`CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS`, max 256), **4,096 items** per
`parallel()`/`pipeline()` call, **1,000 agents per run**, no `import()` in the script body,
and `Date.now()`/`Math.random()` **throw** so a relaunched run repeats the same `agent()`
calls. No mid-run user input. A **"Large workflow" advisory** fires above 25 agents or
projected 1.5M tokens — it warns, it does **not** pause or limit.

### Worktrees are the isolation primitive

`claude --worktree feature-auth` creates `.claude/worktrees/<name>/` on branch
`worktree-<name>`. Claude Code enforces **four checks** while isolated: blocks
`Edit`/`Write`/`NotebookEdit` targeting the main checkout; blocks Bash/PowerShell whose cwd
resolves there; blocks git redirects (`git -C`, `--git-dir`, `GIT_DIR`/`GIT_WORK_TREE`,
`cd` then git); and blocks commands whose git usage can't be statically verified.
Subagents can be permanently isolated with `isolation: worktree` in frontmatter.
`.worktreeinclude` (gitignore syntax) copies `.env` etc. into each new worktree. Codex has
**git worktrees** too. Cursor Cloud Agents run in **isolated VMs**.

### Anti-conflict rules that actually work

1. **One owner per file set.** Anthropic is explicit: "Two teammates editing the same file
   leads to overwrites. Break the work so each teammate owns a different set of files."
2. **Task claims use file locking** (Claude Code agent teams) so two teammates can't claim
   the same task simultaneously.
3. **Separate plan from implementation.** Spec files, task lists and progress files are the
   shared substrate; read-mostly during parallel work.
4. **Adversarial verification instead of more writers.** Fan out one agent per file to
   *find* issues, then one agent to rank/dedupe — never N agents writing the same file.
5. **Gate on completion, not on start.** Hooks `TaskCreated` / `TaskCompleted` /
   `TeammateIdle` (exit code 2 → block completion and send feedback) enforce quality gates
   in parallel runs.

### CI-as-agent-harness and eval suites

Codex ships a GitHub Action and `codex exec` non-interactive mode. Claude Code has
`claude -p --output-format json` and the Agent SDK (same permission/sandbox evaluation).
Cursor CLI has a headless/CI mode. Pydantic AI ships **GitHub Agentic Workflows**
(headless, sandboxed, on issues/PRs/on a schedule). Eval suites: **Pydantic Evals** grades
final outputs *and* tool-call trajectories, online (sample of live traffic) or on datasets;
OpenAI Evals (graders, prompt optimiser); `claude plugin eval` runs each prompt with and
without a plugin and scores the difference; spec-kit ships quality checklists and
cross-artifact analysis.

### Observability — use OpenTelemetry GenAI conventions as the wire format

- **OpenTelemetry GenAI semantic conventions** are the de-facto standard (semconv 1.45.0 has
  a dedicated `gen-ai` registry plus an `mcp` registry). Claude Code exports **per-user
  token and cost metrics via OTel** on every setup — the only option that streams
  near-real-time per-user spend into your own stack.
- **Langfuse** — OSS core, self-hostable. Hobby free (50k units/mo, 30-day retention, 2
  users), **Core $29/mo** (100k units included, then **$8/100k**, 90-day retention),
  **Pro $199/mo** (3-year retention, 20k req/min), Enterprise $2499/mo. Open-source projects
  get **$300/mo credit for year one**.
- **LangSmith** — LangChain's platform; tracing + evaluation + deployment (LangGraph
  Platform was folded into **LangSmith Deployment**). Paid; best if already on LangGraph.
- **Braintrust** — **Starter $0 platform fee** (1 GB processed data/mo, 10K scores/mo),
  **Pro $249/mo** (5 GB, 50K scores, $3/GB overage, $1.50/1k scores over). Strongest *eval*
  story plus a built-in "Loop agent" that runs evals and iterates on prompts.
- **Pydantic Logfire** — OTel-native, free tier, whole-app not just LLM calls.
- **Mastra** ships its own traces/metrics/evals. **AI SDK 7** emits OTel GenAI spans and
  integrates with Datadog, Langfuse, Braintrust, LangSmith, Sentry, Laminar, Raindrop.

### Cost-bounding mechanisms (not vibes)

- **Cache-first.** Anthropic documents Sonnet cached input at **$0.30/MTok vs $3/MTok
  uncached — 10×**. Codex credit rates show the same shape (**Sol 50 → 2.5 cached;
  Luna 2.5 → 0.25**). Anything that mutates the prefix destroys 90% of your margin.
- **Cache-aware fan-out.** Claude Code *holds* all but the first agent in a fan-out until the
  first agent's response begins, then releases them together so they read the shared prefix
  instead of each prefilling it uncached (default 5,000 ms stagger,
  `CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS`). **The single most important detail in this
  document for cost.**
- **Cache TTL split.** Subagent/workflow/teammate requests fall outside the main
  conversation's cache bucket → **5-minute default TTL**, not 1 hour.
  `subagentPromptCacheTtl: "1h"` fixes it (1-hour cache writes cost more).
- **Hard caps.** Claude Code `--max-budget-usd`; OpenAI spend limits; Pydantic AI Gateway
  real-time cost monitoring and spending limits; Cursor's third-party models billed
  separately at API list price.
- **Model routing.** Claude Code: Sonnet for teammates, Opus for architecture, **Haiku for
  simple subagents** (`model: haiku` in frontmatter). Codex: Sol/Terra/Luna/Astra credit
  tiers. Claude Code's `/effort` slider and `MAX_THINKING_TOKENS` (thinking tokens bill as
  *output* tokens) are the two biggest levers after caching.

---

## 6. Cost and model selection — the numbers

| Number | Source | Confidence |
|---|---|---|
| **~$13 per developer per active day**; **$150–250 per developer per month**; **< $30/active day for 90% of users** | Anthropic, [Manage costs effectively](https://code.claude.com/docs/en/costs) | First-party |
| **Agent teams use ~7× more tokens** than standard sessions when teammates run in plan mode | Anthropic, same page | First-party |
| Codex credits/1M: **Sol 50 / 2.5 cached / 250 out**; **Terra 25 / 1.25 / 125**; **Luna 2.5 / 0.25 / 12.5**; **Astra 250 / 25 / 1250**. *"A typical GPT-5.6 Sol task may use 2–15 credits."* | OpenAI, [Pricing](https://learn.chatgpt.com/codex/pricing) | First-party |
| Sonnet cached **$0.30/MTok** vs uncached **$3/MTok** (10×); agent input:output ≈ **100:1** | Manus + Anthropic pricing | First-party |
| Cursor: Free $0 / Plus $8 / Premium $30 / Super $100 / Ultra $200 / Teams $30+/user; third-party models billed separately at API list price | [Cursor pricing](https://cursor.com/pricing) | First-party |
| Devin: $0 / $20 / $80 min / $200 + metered ACUs; **ACU allowance, overage rate and concurrency not published** | [Devin pricing](https://devin.ai/pricing) | First-party |
| **~$9–10.50 per *merged* task** (solo $10.50 / 5-person $9.35 / heavy $9.31) at an assumed 43% merge rate, 2 ACU/task, $2.25/ACU | [Activepieces analysis](https://www.activepieces.com/blog/devin-ai-pricing-2026-plans-and-real-cost-per-task) (vendor blog, explicit assumptions) | **Third-party — floor, not forecast** |
| PR merge rates: Devin 43%, Codex 73%, Claude Code 84%, humans 85% | Third-party, single cited source | **Unverified** |
| Cursor plans ≈ $8–$30/mo covers a solo founder; Claude Code subscription covers most solo use | Pricing pages above | First-party |

### The economics are not about the subscription

1. **Meter merges, not attempts.** Devin's own billing punishes loops and idle sessions; the
   fix is identical everywhere — *divide spend by merged work, and count your own review
   time in the same ledger*.
2. **The fan-out multiplier dominates.** A 100-agent workflow at $0.50/agent is $50 and
   probably wrong; at $3/agent it's $300 and definitely wrong. Set the agent-count budget
   *before* the run (Claude Code's "medium" guideline targets <10 agents, "large" <50).
3. **The dominant waste is long context, not long thinking.** A session open for hours
   re-sends the whole conversation every turn (at cached rates). `/clear` between unrelated
   tasks is the highest-ROI cost action, and `/usage` now attributes spend per
   skill/subagent/plugin/MCP server and suggests trims.

---

## 7. Recommended minimal stack for one human

**Don't assemble a framework. Assemble an artefact pipeline.**

```
AGENTS.md                 one shared instruction file (read by Claude Code, Codex, Cursor, Copilot)
.claude/rules/*.md        path-scoped rules — load only when a matching file is touched
.claude/skills/*/SKILL.md  procedures; body loads on invocation (Agent Skills standard)
company/specs/T-0001.md   the spec — source of truth, one file per task
company/tasks/T-0001.json feature list with `passes: false` (JSON, not Markdown)
.claude/workflows/*.js    fan-out orchestration you can read, diff and re-run
```

| Layer | Choice | Why this, and not the alternative |
|---|---|---|
| Primary harness | **Claude Code CLI** | Deepest memory/permission/hook/skill/subagent/worktree integration. Agent SDK if you need to embed it. |
| Second harness | **Codex CLI** *or* **Cursor Cloud Agents** | Independent opinion + different model vendor. Cursor if you want agents that run your app in a real VM. |
| Isolation | **git worktrees** (`claude --worktree`, `isolation: worktree`) | One owner per file set; enforced by the harness, not by discipline. |
| Orchestration | **Claude Code dynamic workflows** for ≥10 agents; **subagents** for ≤5 | The workflow script keeps intermediate results out of context and is a committable artefact. |
| Verification | **`/verify` + browser automation (Playwright MCP)** + **self-review** | Anthropic's research: explicit E2E instruction is the single biggest quality lever. |
| Specs | **spec-kit** (`specify init --integration claude`) | The Specify→Plan→Tasks→Implement→Converge chain, agent-agnostic, extensible. |
| Memory | **files only** — AGENTS.md + rules + skills + `MEMORY.md` | Diff-able, review-able, no vector DB to maintain. |
| MCP | **≤4 servers**, all of which you'd otherwise shell out to | Every server costs context; CLI is cheaper. |
| Observability | **OTel GenAI export → Langfuse self-hosted** | Cheapest credible trace store; vendor-neutral wire format so you can switch. |
| Cost control | `--max-budget-usd` per session, `/usage` weekly, **≤16 concurrent agents**, Haiku for trivial subagents | Caching (10×) and fan-out discipline matter 100× more than which model you pick. |
| Governance | Charter constraints enforced by **hooks**, not by prompt | The rule "the agent may not spend money, sign anything, or talk to a customer" must be a `PreToolUse` hook, not a line in AGENTS.md — Claude Code treats CLAUDE.md as *context*, not *enforced configuration*. |

### Role mapping — this repo already has the right shape

`.agent/roles/*.md` (researcher, pm, architect, designer, engineer, qa, reviewer, devops,
support, growth) already use a **Reads / Writes / Never / Done means** structure. That is
exactly the anatomy of a subagent definition. Two ways to wire it, in order of preference:

1. **Keep `.agent/roles/` as the single source of truth.** Have
   `node tooling/src/cli.mjs pack T-0001` emit the role file as the agent definition
   (Claude Code supports `--agents` with JSON and `claude --agent <name>` for a
   session-wide role). No duplicated `.claude/agents/` copies to drift.
2. **Or** materialise `.claude/agents/<role>.md` with YAML frontmatter (`name`,
   `description`, `tools`, `model`, `disallowedTools`) whose body imports the role file.
   Only worth it if you want Claude's *auto-delegation* to pick the right role by
   description — which needs short, non-overlapping descriptions, because the combined
   descriptions of all custom subagents are capped at **15,000 tokens**.

Whichever you pick, each role needs:

- a scoped tool allowlist (`tools:` frontmatter) and `disallowedTools`
- an explicit `model:` (`haiku` for support/QA triage, `sonnet` for engineer)
- a **declared write scope** — enforceable with `permissions.deny` and a `PreToolUse` hook.
  The repo's own rule 2 ("Write scopes are real") is only enforceable if the harness knows
  the scope; a line in `AGENTS.md` is context, not a boundary.

### The checklists are hooks, not documents

`.agent/checklists/` currently holds `definition-of-done.md`, `pre-ship.md` and `review.md`.
These are the natural lifecycle hooks, and hooking them is what turns "please follow the
checklist" into "the harness stops you":

| Checklist | Hook | Behaviour |
|---|---|---|
| `definition-of-done.md` | `Stop` / `SubagentStop` | exit 2 → agent keeps working until criteria are met |
| `review.md` | `TaskCompleted` | exit 2 → block task completion, send feedback |
| `pre-ship.md` | `TaskCreated` (or a `pre-ship` skill) | exit 2 → block shipping tasks until the checklist passes |

Claude Code's hooks run as shell commands at fixed lifecycle events "regardless of what
Claude decides to do" — which is exactly the property rule 7 and rule 2 need.

### Budget fit against `company/budget.md` (€1,300/mo total)

| Ceiling | Recommended allocation | Note |
|---|---|---|
| **Model / agent API — €400** | **€250–350**, mostly interactive work on subscriptions, **not** API | Anthropic's own figure (~$150–250/dev/month) means one always-on API user consumes most of €400. Reserve API for headless/CI/scheduled work only. |
| **Coding-agent subscriptions — €200** | One Max-class Claude Code seat + one Premium/Super-class Cursor seat | Verify current prices at claude.com/pricing and cursor.com/pricing before committing. |
| **Third-party SaaS — €150** | **€0–29** (Langfuse Hobby self-hosted free, or Core $29) | Add Sentry/PostHog only with a named owner + review date per budget rule 3. |
| **Infrastructure — €150** | Langfuse self-host + Postgres fits | Keep infra under 15% of MRR (budget rule 2). |

**Two traps this budget must avoid:**

1. **Cursor's third-party models are billed separately at API list price** — a €30 Cursor
   seat is *not* €30 of usage. Cap it or disable third-party models in Cursor.
2. **A second harness on API-key auth is a second model bill.** Codex API-key usage is
   entirely separate from a ChatGPT plan. Prefer the ChatGPT/Codex subscription for Codex
   and keep API keys for CI only.

---

## 8. Things people build that are NOT worth it yet

1. **A multi-agent "company org chart" with 15 agents and a CEO agent.** Agent teams cost
   **~7× a normal session**; "beyond a certain point, additional teammates don't speed up
   work proportionally"; start with **3–5**. Claude Code warns above 25 agents.
2. **A vector database / RAG layer over your own codebase.** The code is on disk; the agent
   has `grep`, `glob` and LSP-backed symbol navigation. RAG over source code is a *worse*
   retrieval mechanism than filesystem search, and it's a service to run.
3. **Graph memory for a solo company's knowledge.** No cross-document relationship queries
   justify Neo4j. Files + `git log` + `rg` win.
4. **A framework you have to learn before shipping.** CrewAI/LangGraph/MS Agent Framework are
   excellent *if* you need their runtime (durable execution, HITL interrupts, typed graphs).
   You don't yet. Anthropic: *"the most successful implementations weren't using complex
   frameworks."*
5. **MCP servers for everything.** Codex: *"Every MCP server adds more context to your
   messages."* Prefer `gh`/`aws`/`gcloud` CLIs.
6. **A bespoke multi-agent orchestration framework.** Claude Code dynamic workflows already
   give you a readable, diff-able, re-runnable script with concurrency caps, resumability,
   schema'd outputs and prefix-cache-aware fan-out. Writing your own is strictly worse in 2026.
7. **Swarm / "auto-swarm mode" with no iteration cap.** Several third-party frameworks ship
   this and their own READMEs recommend a fixed iteration ceiling. Unbounded agent loops are
   the fastest way to burn a month's budget in a night.
8. **Meta-learning / self-modifying prompt frameworks.** The 2026 direction is the opposite:
   *stability, explicit interfaces, durable sessions*. Anthropic's Managed Agents article is
   about building interfaces that "outlast any particular implementation."
9. **Trading quality for parallelism on the same files.** Overwrites. Give each agent its own
   worktree and file set, or don't parallelise.
10. **Evaluating agent teams on benchmark vibes.** Use task-level metrics — merged PRs, tests
    passing, cost per merged change, review minutes. SWE-bench-style numbers don't transfer
    to your codebase.

---

## 9. Uncertainty notes

- **Cursor's ownership**: Cursor's own pricing page now leads with Grok models, shows a
  "Grok Bot" product, and links `x.ai/legal/bundled-subscription-terms`; 9to5Mac reports
  (Aug 2026) that **SpaceXAI completed its acquisition of Cursor**. The reported **$60B
  price is unverified** (only the article headline rendered).
- **Devin cost-per-task** ($9–10.50) is a *vendor-blog analysis* with explicit working
  assumptions (43% merge rate, 2 ACU/task, $2.25/ACU). The merge-rate table (Devin 43% /
  Codex 73% / Claude Code 84% / humans 85%) is **unverified** — single secondary source.
- **GitHub Copilot Workspace** (the 2024 next-gen IDE preview) no longer appears in current
  GitHub docs; the live line is Copilot coding agent + `.github/agents/` custom agents +
  agent mode. Whether Workspace was formally retired is **unverified**.
- **AutoGen** is officially superseded by Microsoft Agent Framework (migration guides exist
  for both AutoGen and Semantic Kernel). Treat AutoGen as maintenance-mode.
- **"LangGraph Platform"** now appears to be **LangSmith Deployment**; the old name is
  mostly gone from current docs.
- **Dify's exact licence clauses** (Apache-2.0 core with commercial restrictions) are
  **unverified** — check before shipping it into anything proprietary.
- Anthropic's own note on the 2024 "Building effective agents" post: *"Much of the tooling
  landscape described in this post has changed since December 2024."* Treat its framework
  list as historical, but its **patterns** (prompt chaining, routing, parallelisation,
  orchestrator-workers, evaluator-optimizer) as current and canonical.
