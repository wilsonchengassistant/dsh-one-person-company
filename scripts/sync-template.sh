#!/usr/bin/env bash
# Sync the bundled machine in template/ from its source workspace.
#
#   bash scripts/sync-template.sh [source-dir] [--check]
#
# The source workspace is where the machine is actually developed: the `opc` CLI,
# the twelve playbook documents, the company operating rules and the research
# briefs. This script copies the files `template/` ships from there, so the
# plugin never sells a stale machine.
#
# Default source: $OPC_SOURCE, then ~/Documents/deepseek-harness/One Person Company
#
# --check reports drift and changes nothing; exit 1 if anything differs.

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

CHECK=0
SOURCE=""
for arg in "$@"; do
  case "$arg" in
    --check) CHECK=1 ;;
    -h|--help) sed -n '2,14p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) SOURCE="$arg" ;;
  esac
done
[ -z "$SOURCE" ] && SOURCE="${OPC_SOURCE:-$HOME/Documents/deepseek-harness/One Person Company}"

if [ ! -d "$SOURCE" ]; then
  printf 'source workspace not found: %s\n' "$SOURCE" >&2
  printf 'pass one explicitly: bash scripts/sync-template.sh /path/to/workspace\n' >&2
  exit 1
fi
SOURCE="$(cd "$SOURCE" && pwd)"

# What ships. Anything not listed here stays out of the plugin on purpose:
# a user's charter, spec, tasks, ADRs, metrics, budget, roadmap and runbooks are
# that user's, never the plugin's.
FILES=(
  tooling/src/board.mjs
  tooling/src/cli.mjs
  tooling/src/context.mjs
  tooling/src/cycle.mjs
  tooling/src/doctor.mjs
  tooling/src/roles.mjs
  tooling/src/templates.mjs
  tooling/src/util.mjs
  package.json
  .gitignore
  company/AGENTS.md
)

DIRS=(
  playbook
  company/research
)

changed=0
missing=0
copy() {
  local rel="$1"
  if [ ! -e "$SOURCE/$rel" ]; then
    printf '  missing in source: %s\n' "$rel"
    missing=$((missing+1))
    return
  fi
  if diff -q "$SOURCE/$rel" "template/$rel" >/dev/null 2>&1; then
    return
  fi
  changed=$((changed+1))
  if [ "$CHECK" -eq 1 ]; then
    printf '  differs: %s\n' "$rel"
  else
    printf '  updated: %s\n' "$rel"
    mkdir -p "$(dirname "template/$rel")"
    cp "$SOURCE/$rel" "template/$rel"
  fi
}

for f in "${FILES[@]}"; do copy "$f"; done
for d in "${DIRS[@]}"; do
  if [ -d "$SOURCE/$d" ]; then
    for f in "$SOURCE/$d"/*; do
      [ -f "$f" ] || continue
      copy "$d/$(basename "$f")"
    done
  else
    printf '  missing in source: %s/\n' "$d"
    missing=$((missing+1))
  fi
done

# Files that were removed from the source should not linger in the template.
if [ "$CHECK" -eq 0 ] && [ -d "$SOURCE/playbook" ]; then
  for f in template/playbook/*.md; do
    [ -e "$f" ] || continue
    b=$(basename "$f")
    if [ ! -f "$SOURCE/playbook/$b" ]; then
      printf '  removed (gone from source): playbook/%s\n' "$b"
      rm -f "$f"
      changed=$((changed+1))
    fi
  done
fi

printf '\n'
if [ "$missing" -gt 0 ]; then
  printf '%s file(s) missing in the source workspace\n' "$missing"
  exit 1
fi
if [ "$changed" -eq 0 ]; then
  printf 'template/ already matches %s\n' "$SOURCE"
  exit 0
fi
if [ "$CHECK" -eq 1 ]; then
  printf '%s file(s) differ from %s — run without --check to sync\n' "$changed" "$SOURCE"
  exit 1
fi
printf '%s file(s) synced from %s\n' "$changed" "$SOURCE"
printf 'Now run: bash scripts/preflight.sh && git commit -am ... && git push\n'
