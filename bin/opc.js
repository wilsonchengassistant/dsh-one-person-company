#!/usr/bin/env node
/**
 * `opc` — a launcher for the one-person-company machine that ships inside this
 * plugin.
 *
 *   opc bootstrap [dir]    copy the machine into dir and initialise it
 *   opc <command> [...]    run the workspace's own `tooling/src/cli.mjs`
 *   opc --version          print the plugin version
 *
 * The workspace copy is preferred over the bundled one: once a workspace has
 * been bootstrapped it owns its `tooling/`, so a project can pin a version and
 * edit it if it needs to. The bundled copy is the fallback for a workspace that
 * has not been bootstrapped yet (`opc doctor` in a bare folder would otherwise
 * report on the plugin's own template, which is never what the caller wants).
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_ROOT = fileURLToPath(new URL("..", import.meta.url));
const BOOTSTRAP = join(PLUGIN_ROOT, "bootstrap.sh");
const BUNDLED_CLI = join(PLUGIN_ROOT, "template", "tooling", "src", "cli.mjs");

const argv = process.argv.slice(2);

if (argv[0] === "--version" || argv[0] === "-v") {
	const { version } = JSON.parse(readFileSync(join(PLUGIN_ROOT, "package.json"), "utf8"));
	console.log(`dsh-one-person-company ${version}`);
	process.exit(0);
}

if (argv[0] === "--help" || argv[0] === "-h" || argv.length === 0) {
	console.log(`opc — operating system for a one-person company

  opc bootstrap [dir] [--check] [--force]   create a company workspace
  opc <command> [...]                       run the workspace's opc CLI

Commands the workspace CLI understands:
  doctor  board  pack  budget  roles  new <spec|task|adr|research|incident|release>  init`);
	process.exit(0);
}

/**
 * Find the workspace's own CLI by walking up from the current directory.
 *
 * @param {string} from - Directory to start at.
 * @returns {string | null} absolute path to a `tooling/src/cli.mjs`, or null.
 */
function findWorkspaceCli(from) {
	let dir = resolve(from);
	for (let depth = 0; depth < 12; depth += 1) {
		const candidate = join(dir, "tooling", "src", "cli.mjs");
		if (existsSync(candidate)) return candidate;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
}

/**
 * Run a child process with inherited stdio and exit with its code.
 *
 * @param {string} command - Executable.
 * @param {string[]} args - Arguments.
 * @returns {void}
 */
function run(command, args) {
	const child = spawn(command, args, { stdio: "inherit" });
	child.on("exit", (code, signal) => {
		if (signal) process.kill(process.pid, signal);
		else process.exit(code ?? 0);
	});
	child.on("error", (error) => {
		console.error(`opc: ${error.message}`);
		process.exit(1);
	});
}

if (argv[0] === "bootstrap") {
	run("bash", [BOOTSTRAP, ...argv.slice(1)]);
} else {
	const cli = findWorkspaceCli(process.cwd());
	if (cli !== null) {
		run(process.execPath, [cli, ...argv]);
	} else {
		// No workspace copy: run the bundled one so `opc roles` and `opc --help`
		// still work, but say why the report is not about this folder.
		console.error("opc: no company workspace found above this directory — using the bundled template.");
		console.error("     run `opc bootstrap .` to create one here.");
		run(process.execPath, [BUNDLED_CLI, ...argv]);
	}
}
