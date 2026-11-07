#!/usr/bin/env bash
# Preflight for dsh-one-person-company.
#
# Run this before reporting a change as done, and before any release. It is the
# difference between "I pushed" and "the published package is what I think it
# is". Every check here has caught a real bug at least once.
#
#   bash scripts/preflight.sh            # commit/push + consistency
#   bash scripts/preflight.sh --release  # also check the release artefacts
#
# Exit code 0 means every check passed; 1 means at least one failed.

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

RELEASE=0
[ "${1:-}" = "--release" ] && RELEASE=1

fails=0
warns=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fails=$((fails+1)); }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; warns=$((warns+1)); }

section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# --------------------------------------------------------------------------
section "1. Nothing uncommitted"
if [ -z "$(git status --porcelain)" ]; then
  ok "working tree clean"
else
  bad "uncommitted changes:"
  git status --short | sed 's/^/      /'
fi

# --------------------------------------------------------------------------
section "2. Everything pushed"
if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  bad "no upstream branch — run: git push -u origin main"
else
  counts=$(git rev-list --left-right --count @{u}...HEAD 2>/dev/null || echo "? ?")
  behind=$(echo "$counts" | awk '{print $1}')
  ahead=$(echo "$counts" | awk '{print $2}')
  if [ "$ahead" = "0" ] && [ "$behind" = "0" ]; then
    ok "in sync with upstream"
  else
    [ "$ahead" != "0" ] && bad "$ahead commit(s) not pushed"
    [ "$behind" != "0" ] && warn "$behind commit(s) behind upstream — pull first"
  fi
  # A clean push can still leave the remote on an older tree from a detached HEAD.
  remote=$(git ls-remote origin refs/heads/main 2>/dev/null | cut -f1)
  local_head=$(git rev-parse HEAD 2>/dev/null)
  if [ -n "$remote" ] && [ "$remote" = "$local_head" ]; then
    ok "origin/main == local HEAD ($(echo "$local_head" | cut -c1-7))"
  elif [ -n "$remote" ]; then
    bad "origin/main ($(echo "$remote" | cut -c1-7)) != local HEAD ($(echo "$local_head" | cut -c1-7))"
  fi
fi

# --------------------------------------------------------------------------
section "3. Files the runtime needs"
for f in package.json cordis.patch.yml bootstrap.sh bin/opc.js \
         lib/index.js lib/client.js skill/SKILL.md \
         template/tooling/src/cli.mjs template/tooling/src/board.mjs \
         template/playbook/00-the-model.md README.md LICENSE CHANGELOG.md; do
  if [ -f "$f" ]; then ok "$f"; else bad "missing $f"; fi
done

# --------------------------------------------------------------------------
section "4. Syntax"
for f in lib/index.js lib/client.js bin/opc.js template/tooling/src/*.mjs; do
  if node --check "$f" >/dev/null 2>&1; then ok "node --check $f"; else bad "syntax error in $f"; fi
done
if bash -n bootstrap.sh >/dev/null 2>&1; then ok "bash -n bootstrap.sh"; else bad "syntax error in bootstrap.sh"; fi
if bash -n scripts/preflight.sh >/dev/null 2>&1; then ok "bash -n scripts/preflight.sh"; else bad "syntax error in scripts/preflight.sh"; fi

# --------------------------------------------------------------------------
section "5. Version agrees with the changelog"
version=$(node -e "process.stdout.write(require('./package.json').version)" 2>/dev/null)
top=$(grep -m1 -oE '^## [0-9]+\.[0-9]+\.[0-9]+' CHANGELOG.md | sed 's/^## //')
if [ -n "$version" ] && [ "$version" = "$top" ]; then
  ok "package.json $version == CHANGELOG top"
else
  bad "package.json is $version but the newest CHANGELOG entry is ${top:-none}"
fi

# --------------------------------------------------------------------------
section "6. Every README image exists"
missing_images=0
while IFS= read -r img; do
  [ -z "$img" ] && continue
  if [ -f "$img" ]; then ok "$img"; else bad "README references a missing image: $img"; missing_images=$((missing_images+1)); fi
done < <(grep -oE '\]\(screenshots/[^)]+\.png\)' README.md | sed -E 's/^\]\(//; s/\)$//' | sort -u)
[ "$missing_images" -eq 0 ] || true

# --------------------------------------------------------------------------
section "7. screenshots.json points at real files"
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if [ -f "$f" ]; then ok "$f"; else bad "screenshots.json references a missing file: $f"; fi
done < <(node -e "for (const s of require('./screenshots.json').screenshots) console.log(s.file)" 2>/dev/null)

# --------------------------------------------------------------------------
section "8. The bundled machine still matches its source workspace"
SOURCE="${OPC_SOURCE:-$HOME/Documents/deepseek-harness/One Person Company}"
if [ -d "$SOURCE" ]; then
  drift=0
  for f in tooling/src/board.mjs tooling/src/cli.mjs tooling/src/context.mjs \
           tooling/src/doctor.mjs tooling/src/roles.mjs tooling/src/templates.mjs \
           tooling/src/util.mjs package.json .gitignore; do
    if [ -f "$SOURCE/$f" ] && ! diff -q "$SOURCE/$f" "template/$f" >/dev/null 2>&1; then
      bad "template/$f differs from the source workspace — sync it"
      drift=$((drift+1))
    fi
  done
  for f in "$SOURCE"/playbook/*.md; do
    [ -e "$f" ] || continue
    b=$(basename "$f")
    if ! diff -q "$f" "template/playbook/$b" >/dev/null 2>&1; then
      bad "template/playbook/$b differs from the source workspace — sync it"
      drift=$((drift+1))
    fi
  done
  [ "$drift" -eq 0 ] && ok "template matches $SOURCE"
else
  warn "source workspace not found at $SOURCE — set OPC_SOURCE to check drift"
fi

# --------------------------------------------------------------------------
section "9. The architecture template still has its four diagrams"
arch="template/tooling/src/templates.mjs"
count=$(grep -c 'mermaid' "$arch" 2>/dev/null || echo 0)
if [ "$count" -ge 4 ]; then ok "$count mermaid references in the template"; else bad "only $count mermaid references — expected at least 4"; fi
for section_name in System Backend Frontend Data; do
  if grep -q "^## $section_name" "$arch" 2>/dev/null; then ok "## $section_name"; else bad "the architecture template lost its '## $section_name' section"; fi
done

# --------------------------------------------------------------------------
if [ "$RELEASE" -eq 1 ]; then
  section "10. Release artefacts"
  if npm pack --dry-run 2>&1 | grep -q 'template/tooling/src/cli.mjs'; then
    ok "the npm tarball includes the bundled machine"
  else
    bad "the npm tarball does NOT include template/ — check the files field"
  fi
  if npm pack --dry-run 2>&1 | grep -q 'skill/SKILL.md'; then ok "the tarball includes the skill"; else bad "the tarball is missing the skill"; fi
  # npm drops .gitignore from a package; bootstrap.sh must write it instead.
  if grep -q "cat > \"\$TARGET/.gitignore\"" bootstrap.sh; then
    ok "bootstrap.sh writes .gitignore itself (npm drops the file)"
  else
    bad "bootstrap.sh still copies .gitignore, which npm and pnpm drop"
  fi
fi

# --------------------------------------------------------------------------
printf '\n\033[1m%s\033[0m\n' "Result"
if [ "$fails" -eq 0 ]; then
  printf '  \033[32mall checks passed\033[0m (%s warning(s))\n\n' "$warns"
  exit 0
else
  printf '  \033[31m%s check(s) failed\033[0m (%s warning(s))\n\n' "$fails" "$warns"
  exit 1
fi
