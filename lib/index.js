/**
 * dsh-one-person-company — Host half.
 *
 * Does two things:
 *
 * 1. **Registers one embedded skill**, `one-person-company`, with a resource
 *    base of this package's own directory. Installing the plugin therefore
 *    puts the skill in the catalog of every workspace on the machine, with
 *    `bootstrap.sh` and `template/` resolvable as relative paths. No copy into
 *    `~/.dsh/skills/` is needed.
 *
 * 2. **Registers one Typert Remote service**, `opcBoard`, whose `list()` reads
 *    `company/tasks/*.md` out of every registered workspace and returns the
 *    parsed board to the browser half. The Gateway auto-claims every endpoint
 *    a live `TypertRemoteService` declares on its prototype, so no route,
 *    registry entry or permission is needed.
 *
 * The task parser is **imported from the bundled template** rather than
 * reimplemented: `template/tooling/src/board.mjs` is the same module the `opc`
 * CLI runs, so the panel and the CLI can never disagree about what is ready.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";

/** The package root: one level above `lib/`. */
const PLUGIN_ROOT = fileURLToPath(new URL("..", import.meta.url));

const SKILL_DESCRIPTION =
	"Bootstrap and operate a one-person software company run by a team of AI agents — a repo-native operating system with ten role charters, a spec-as-contract workflow, a task board with dependency and write-scope checks, and an `opc` CLI. Use when the user wants to start a new project/workspace with this tooling, or asks how to organise research, architecture, design, coding, testing, deployment, support and marketing with agents instead of staff.";

const SKILL_WHEN_TO_USE =
	'The user says "start a new project with the one-person-company setup", "set up the OPC tooling here", "bootstrap a company workspace", or asks how the agent team / role charters / spec-and-task workflow is supposed to be used in a fresh workspace.';

const SKILL_FALLBACK =
	"The skill body could not be read. Read `SKILL.md` beside this plugin: it explains `bash bootstrap.sh <dir>`, the five `opc` commands, and the spec-as-contract loop.";

/**
 * Read the embedded skill body, minus its YAML front matter.
 *
 * Synchronous on purpose: the registry copies the definition, so a body swapped
 * in later would never be seen. The file is a few kilobytes and this runs once
 * at boot.
 *
 * @returns {string} the body to hand the skill registry.
 */
function skillBody() {
	try {
		const raw = readFileSync(join(PLUGIN_ROOT, "skill", "SKILL.md"), "utf8");
		return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
	} catch {
		return SKILL_FALLBACK;
	}
}

/**
 * Import the template's own board module, lazily so a missing template degrades
 * the panel rather than the skill.
 *
 * @returns {Promise<object | null>}
 */
async function boardModule() {
	try {
		return await import(new URL("../template/tooling/src/board.mjs", import.meta.url).href);
	} catch {
		return null;
	}
}

/**
 * Read one workspace's board.
 *
 * @param {string} path - Absolute workspace path.
 * @param {object | null} mod - The board module, or null when unavailable.
 * @returns {object} the wire shape the panel renders.
 */
function boardFor(path, mod) {
	const tasksDir = join(path, "company", "tasks");
	if (!existsSync(tasksDir)) {
		return { hasCompany: false, tasks: [], summary: null, error: null };
	}
	if (mod === null) {
		return {
			hasCompany: true,
			tasks: [],
			summary: null,
			error: "the bundled template is missing; reinstall the plugin"
		};
	}
	try {
		const tasks = mod.decorate(mod.loadTasks(path), path);
		const summary = mod.boardSummary(tasks);
		const ready = new Set(mod.readyTasks(tasks).map((task) => task.id));
		return {
			hasCompany: true,
			error: null,
			summary: { ...summary, readyIds: [...ready] },
			// Only the fields the panel renders. A task body never crosses the wire.
			tasks: tasks.map((task) => ({
				id: task.id,
				title: task.title ?? "",
				status: task.status,
				priority: task.priority,
				owner: task.owner ?? "",
				spec: task.spec ?? "",
				deps: task.deps ?? [],
				unmetDeps: task.unmetDeps ?? [],
				missingDeps: task.missingDeps ?? [],
				writes: Array.isArray(task.writes) ? task.writes : task.writes ? [task.writes] : [],
				specApproved: Boolean(task.specApproved),
				specStatus: task.specStatus ?? null,
				ready: ready.has(task.id),
				unknownStatus: Boolean(task.unknownStatus)
			}))
		};
	} catch (error) {
		return { hasCompany: true, tasks: [], summary: null, error: String(error) };
	}
}

/**
 * The workspace list is read defensively: the registry has no published accessor
 * for it and its shape is not this plugin's contract.
 *
 * @param {object | undefined} registry - The Host workspace registry.
 * @returns {Array<{id: string, title: string, path: string}>}
 */
function workspaceList(registry) {
	if (registry === undefined) return [];
	try {
		return registry.list().map((workspace) => ({
			id: workspace.id,
			title: workspace.title ?? "",
			path: workspace.path
		}));
	} catch {
		return [];
	}
}

/**
 * Declare one direct Remote method without decorator syntax: this runtime has
 * V8 decorators switched off, so `@Remote(…)` is a hard SyntaxError here.
 * `Remote(exportName)` returns the same decorator function the shipped
 * packages' compiler emits, and the only thing it needs from a decorator
 * context is `addInitializer`. The initializer derives the prototype from its
 * receiver, so it has to run against an instance.
 *
 * @param {object} Proto - Class carrying the method.
 * @param {string} method - Method name, which is also the wire export name.
 * @returns {void}
 */
function declareRemote(Proto, method) {
	const initializers = [];
	Remote(method)(void 0, {
		name: method,
		static: false,
		private: false,
		addInitializer(initializer) {
			initializers.push(initializer);
		}
	});
	if (initializers.length !== 1) {
		throw new Error(`one-person-company: cannot declare Remote method '${method}'`);
	}
	initializers[0].call(Object.create(Proto.prototype));
}

class OpcBoardService extends TypertRemoteService {
	/** The registry owns the workspace records; nothing below may run before it exists. */
	static inject = ["workspaceRegistry"];

	/**
	 * @param {object} ctx - Host context carrying the injected services.
	 */
	constructor(ctx) {
		super(ctx, "opcBoard");
	}

	/**
	 * Every registered workspace, annotated with whether it carries a company OS
	 * and, if so, its board.
	 *
	 * Declared with no parameters on purpose: the Gateway builds its argument
	 * descriptor from the signature, so a browser that sends
	 * `{args:{request:{}}}` is rejected with `gateway/arguments-invalid`.
	 *
	 * @returns {Promise<{workspaces: object[]}>}
	 */
	async list() {
		const rows = workspaceList(this.ctx.workspaceRegistry);
		if (rows.length === 0) {
			throw new RemoteError(
				"one-person-company/no-workspace",
				"this deployment has no registered workspace to read a board from; add a workspace folder in Settings first"
			);
		}
		const mod = await boardModule();
		return { workspaces: rows.map((row) => ({ ...row, ...boardFor(row.path, mod) })) };
	}

	/**
	 * Re-read one workspace so the panel can refresh after a task file changes.
	 *
	 * @param {{id: string}} request - Workspace id.
	 * @returns {Promise<object>} that workspace's board.
	 */
	async workspace(request) {
		const id = typeof request?.id === "string" ? request.id : "";
		const row = workspaceList(this.ctx.workspaceRegistry).find((workspace) => workspace.id === id);
		if (row === undefined) {
			throw new RemoteError("one-person-company/unknown-workspace", `no workspace with id "${id}"`, { id });
		}
		const mod = await boardModule();
		return { ...row, ...boardFor(row.path, mod) };
	}
}

declareRemote(OpcBoardService, "list");
declareRemote(OpcBoardService, "workspace");

/* ------------------------------------------------------------------ *
 * Plugin surface
 * ------------------------------------------------------------------ */

/** The Host half needs the skill registry, and the board service needs the workspace registry. */
const inject = ["skills"];

/**
 * @param {object} ctx - Host context.
 * @returns {void}
 */
function apply(ctx) {
	ctx.effect(
		() =>
			ctx.skills.register({
				name: "one-person-company",
				description: SKILL_DESCRIPTION,
				whenToUse: SKILL_WHEN_TO_USE,
				content: skillBody(),
				resourceBase: { kind: "directory", path: PLUGIN_ROOT }
			}),
		"one-person-company: embedded skill"
	);

	ctx.plugin(OpcBoardService);
}

export { apply, inject, OpcBoardService };
