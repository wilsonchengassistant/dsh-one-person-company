#!/usr/bin/env bash
# Install this working copy into a local DSH profile so it can be tested.
#
#   bash scripts/install-local.sh [profile]   # default: web
#
# Why this exists: `dsh plugin` installs by *hardlink* (pnpm `file:` dependency),
# so editing the source in place does NOT update an already-installed copy. Any
# change has to be re-installed before it can be tested — and any change to
# `lib/client.js` also needs a host restart, because the browser module graph is
# built at boot.
#
# The usual sequence is:
#
#   bash scripts/preflight.sh      # commit + push checks
#   git push
#   bash scripts/install-local.sh  # what this script does
#   ~/.dsh/restart-dsh-web.sh      # then refresh the page
#
# Open a NEW workspace after the restart: the sidebar panel and the embedded
# skill both appear there, which is the honest test of "someone else installs it".

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

PROFILE="${1:-web}"
PKG="$(node -e "process.stdout.write(require('./package.json').name)")"
VERSION="$(node -e "process.stdout.write(require('./package.json').version)")"

if ! command -v dsh >/dev/null 2>&1; then
  printf 'dsh is not on PATH\n' >&2
  exit 1
fi

printf '\nInstalling %s@%s into profile "%s"\n' "$PKG" "$VERSION" "$PROFILE"
if ! dsh plugin --profile "$PROFILE" add "file:$PWD" 2>&1 | sed 's/^/  /'; then
  printf 'install failed\n' >&2
  exit 1
fi

INSTALLED_PATH="$HOME/.dsh/profiles/$PROFILE/node_modules/$PKG/package.json"
if [ -f "$INSTALLED_PATH" ]; then
  installed="$(node -e "process.stdout.write(require('$INSTALLED_PATH').version)" 2>/dev/null)"
  if [ "$installed" = "$VERSION" ]; then
    printf '  %s  profile copy is %s\n' '✓' "$installed"
  else
    printf '  %s  profile copy is %s, source is %s — the hardlink did not refresh\n' '✗' "${installed:-unknown}" "$VERSION" >&2
    exit 1
  fi
else
  printf '  !  could not read the installed package.json\n'
fi

# The client bundle graph is built at boot, so a client change needs a restart.
if command -v git >/dev/null 2>&1; then
  last_client_change="$(git log -1 --format=%ct -- lib/client.js 2>/dev/null || echo 0)"
  last_host_start="$(ps -o lstart= -p "$(pgrep -f "dsh web --port 3080" | head -1)" 2>/dev/null || true)"
  if [ -n "$last_host_start" ]; then
    started="$(date -j -f '%a %b %d %T %Y' "$last_host_start" +%s 2>/dev/null || echo 0)"
    if [ "$started" != "0" ] && [ "$last_client_change" -gt "$started" ]; then
      printf '\n  !  lib/client.js changed after the host started — restart before testing:\n'
      printf '     ~/.dsh/restart-dsh-web.sh   then refresh the page\n'
    fi
  fi
fi

printf '\nTest it in a NEW workspace, not this one:\n'
printf '  1. add an empty folder as a workspace in DSH\n'
printf '  2. open "Company board" in the sidebar (the row under Automation tasks)\n'
printf '  3. press "Bootstrap this workspace"\n'
printf '  4. ask an agent: "use the one-person-company skill to start a project here"\n\n'
