#!/usr/bin/env bash
# End-to-end smoke test of the bundled machine.
#
#   bash scripts/smoke-test.sh
#
# Builds a throwaway project from template/, then drives the CLI the way a real
# user's first ten minutes do. Every step here has broken at least once:
#
#   - `new task --spec` twice in a row crashed with
#     `The "path" argument must be of type string. Received undefined`
#     because one call site passed `decorate()` without the project root.
#   - `.gitignore` was copied from the package, which npm and pnpm drop.
#   - `cycle` and `doctor` are imported by the panel, so a syntax error here is a
#     broken sidebar, not just a broken command.
#
# Exit 0 means the machine works from a cold start. Keep it in preflight.

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

TMP="$(mktemp -d "${TMPDIR:-/tmp}/opc-smoke.XXXXXX")"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

fails=0
ok()  { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad() { printf '  \033[31m✗\033[0m %s\n' "$1"; fails=$((fails+1)); }

run() {
  local label="$1"; shift
  if "$@" >"$TMP/out" 2>&1; then ok "$label"; else bad "$label"; sed 's/^/      /' "$TMP/out" | head -6; fi
}

printf '\nSmoke test — a cold start in %s\n' "$TMP"

# The real cold start: exactly what a user gets from the Bootstrap button.
( bash bootstrap.sh "$TMP" ) >"$TMP/out" 2>&1 \
  && ok "bootstrap.sh in an empty folder" \
  || { bad "bootstrap.sh in an empty folder"; sed 's/^/      /' "$TMP/out" | head -12; }

run "opc doctor on a fresh project"  bash -c "cd '$TMP' && node tooling/src/cli.mjs doctor >/dev/null"

run "opc new spec"  bash -c "cd '$TMP' && node tooling/src/cli.mjs new spec 'Smoke feature' >/dev/null"
SPEC="$(cd "$TMP" && ls company/specs/2*.md | head -1)"
ok "spec created: $SPEC"

( cd "$TMP" && sed -i.bak 's/^status: draft.*/status: approved/' "$SPEC" ) >/dev/null 2>&1

run "opc new task (no spec)"          bash -c "cd '$TMP' && node tooling/src/cli.mjs new task 'First' >/dev/null"
run "opc new task --spec"             bash -c "cd '$TMP' && node tooling/src/cli.mjs new task 'Second' --spec '$SPEC' >/dev/null"
# The regression: a second --spec task decorates a board that already holds one.
run "opc new task --spec (again)"     bash -c "cd '$TMP' && node tooling/src/cli.mjs new task 'Third' --spec '$SPEC' --writes 'apps/web/src/**' >/dev/null"

count="$(cd "$TMP" && ls company/tasks/T-*.md 2>/dev/null | wc -l | tr -d ' ')"
[ "$count" = "3" ] && ok "three tasks on the board" || bad "expected 3 tasks, found $count"

run "opc board --ready"   bash -c "cd '$TMP' && node tooling/src/cli.mjs board --ready >/dev/null"
run "opc cycle"           bash -c "cd '$TMP' && node tooling/src/cli.mjs cycle >/dev/null"

( cd "$TMP" && node tooling/src/cli.mjs pack T-0001 >/dev/null 2>&1 ) \
  && ok "opc pack T-0001" || bad "opc pack T-0001"

# The mockup gate: T-0003 writes a UI path, so doctor must now name it.
( cd "$TMP" && node tooling/src/cli.mjs doctor ) >"$TMP/out" 2>&1
if grep -q "declares no design" "$TMP/out"; then ok "doctor catches a UI task with no mockup"; else bad "doctor did not catch the missing mockup"; fi

# .gitignore is written by bootstrap/init, not copied from the package.
[ -f "$TMP/.gitignore" ] && ok ".gitignore was written" || bad ".gitignore is missing"

printf '\n'
if [ "$fails" -eq 0 ]; then printf '  \033[32msmoke test passed\033[0m\n\n'; exit 0; fi
printf '  \033[31m%s smoke check(s) failed\033[0m\n\n' "$fails"; exit 1
