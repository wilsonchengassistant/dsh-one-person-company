# Working on `dsh-one-person-company`

A DSH plugin: one embedded skill plus one sidebar panel. Read this before
changing anything; everything below has cost someone an afternoon at least once.

## The standing rule

**A change to this package is not finished until it is committed and pushed.**

```sh
bash scripts/preflight.sh     # must print "all checks passed"
git push origin main
```

`preflight.sh` asserts the working tree is clean, that `origin/main` equals the
local `HEAD` (a push can exit 0 while `main` is behind), that the version agrees
with the changelog, that every README image and `screenshots.json` entry exists,
that the bundled `template/` still matches its source workspace, and that the
architecture template still has its four diagrams.

## What is where

| Path | What it is |
|---|---|
| `lib/index.js` | Host half: registers the embedded skill, and the `opcBoard` Remote service |
| `lib/client.js` | Browser half: the sidebar row (`sidebar.panellist`) and the page (`main`) |
| `skill/SKILL.md` | The skill body the Host registers |
| `template/` | The reusable machine copied into a workspace — a **copy**, not a symlink |
| `bootstrap.sh` | Copies `template/` into a target and runs `opc init` |
| `bin/opc.js` | The CLI shim |
| `scripts/preflight.sh` | The checks above |
| `scripts/sync-template.sh` | Pull `template/` from its source workspace (`--check` to report drift) |

`template/` is generated from a separate source workspace. After changing
anything the machine owns, sync it and run preflight — check 8 fails on drift.

## Release

1. Bump `version` in `package.json` **and** add a `## x.y.z` heading at the top of
   `CHANGELOG.md`. They must agree; preflight fails otherwise.
2. `bash scripts/preflight.sh --release` (adds the npm tarball checks).
3. Commit, push.
4. `npm publish` — the account uses `auth-and-writes` 2FA, so an unattended
   publish fails with `EOTP` and prints a web URL.
5. Verify the artifact, **not** `dist.shasum` (it never matches). Use
   `npm view dsh-one-person-company dist.integrity`, or `npm pack` into a temp
   dir and diff it against the source.
6. The `awesome-dsh-plugin` registry entry needs the repo to be at least one day
   old.

## Traps, each of which produced a real bug here

- **npm and pnpm drop `.gitignore` from a package.** `bootstrap.sh` writes it
  itself. Copying it worked from a checkout and failed from `node_modules` — the
  only path a user takes.
- **`ctx.slots.register` needs `ctx.slots.inject(name, factory)` around it**, and
  a *list* slot needs an `id`. A throw during `apply()` fails the whole client
  entry and takes the GUI down with it, so both registrations are wrapped.
- **`sidebar.footer.action` is a list slot; the nav list is `sidebar.panellist`
  plus a `main` page keyed by the same panel id.** The row is `order: 20` so it
  lands after Plugins (0) and Automation tasks (10).
- **The `react` shim a client plugin receives has no `createPortal`.**
- **A running `dsh web` keeps the client module graph it built at boot.** After
  `dsh plugin add`, the page still 404s the bundle until the host restarts.
- **pnpm hardlinks.** Editing the source does not update an already-installed
  copy; re-run `dsh plugin --profile web add file:<path>` before testing.
- **Mermaid: a quoted rhombus label with `<br/>` fails to render** (`A{"x<br/>y"}`).
  Unquoted works. Verify by rendering each block before publishing.
- **The Host never trusts a path from the browser.** `bootstrap` resolves the
  target from the workspace registry by id.

## Testing without disturbing the live GUI

Do not `dsh plugin add` into the `web` profile while the user is working in it.
Create an isolated harness home and test there:

```sh
export DSH_HOME=/tmp/opc-test-home
dsh plugin --profile web add "file:$PWD"
cd /tmp/blank-workspace && dsh --profile web --port 3099 --no-open &
```

Screenshot it over CDP (headless Chrome, `Emulation.setDeviceMetricsOverride` +
`Emulation.setEmulatedMedia` for the light theme), and never let a screenshot
carry a `/Users/...` path — the panel collapses the home directory to `~` for
exactly this reason.
