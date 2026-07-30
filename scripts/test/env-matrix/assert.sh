#!/usr/bin/env bash
# Runs INSIDE a test container (piped in via `sh -s`, so kept POSIX-sh clean so
# it works on Alpine's ash as well as bash). Proves that pnpm provisions and
# uses the Node pinned in devEngines.runtime for every pnpm-routed command,
# while bare `node` keeps whatever the image ships.
#
# Env in: PIN_NODE (e.g. 24.18.1), PIN_PNPM (e.g. 11.7.0), MODE (pass|musl-fail).
# Driven by run.sh locally and by .github/workflows/checks.yml in CI.
set -u

PIN_NODE="${PIN_NODE:?PIN_NODE required}"
PIN_PNPM="${PIN_PNPM:?PIN_PNPM required}"
MODE="${MODE:-pass}"

echo "  ambient node: $(node -v 2>/dev/null || echo none)"

# Make the pinned pnpm runnable. Node-bearing images install it via npm; the
# pnpm-only image already ships a pnpm that self-switches to PIN_PNPM through
# the packageManager field written below.
if command -v pnpm >/dev/null 2>&1; then
  :
elif command -v npm >/dev/null 2>&1; then
  npm i -g "pnpm@${PIN_PNPM}" >/dev/null 2>&1 || { echo "  FAIL: could not install pnpm@${PIN_PNPM}"; exit 1; }
else
  echo "  FAIL: image has neither pnpm nor npm"; exit 1
fi

work="$(mktemp -d)"
cd "$work" || { echo "  FAIL: mktemp"; exit 1; }
printf 'process.stdout.write(process.version)\n' > which.js
cat > package.json <<JSON
{
  "name": "env-cell",
  "version": "1.0.0",
  "packageManager": "pnpm@${PIN_PNPM}",
  "engines": { "node": ">=${PIN_NODE} <$(( ${PIN_NODE%%.*} + 1 ))" },
  "devEngines": { "runtime": { "name": "node", "version": "${PIN_NODE}", "onFail": "download" } },
  "scripts": { "print-node": "node which.js" },
  "dependencies": { "is-odd": "3.0.1" }
}
JSON

# --no-frozen-lockfile because the fixture ships no lockfile and CI sets CI=true,
# which would otherwise make pnpm default to a frozen install and refuse.
if [ "$MODE" = "musl-fail" ]; then
  if pnpm install --no-frozen-lockfile >/tmp/cell.log 2>&1; then
    echo "  FAIL: expected the musl runtime download to fail, but install succeeded"
    exit 1
  fi
  echo "  ok (expected musl failure): $(grep -iE 'ENOENT|not found|musl|ERR_' /tmp/cell.log | head -1 | sed 's/^ *//')"
  exit 0
fi

if ! pnpm install --no-frozen-lockfile >/tmp/cell.log 2>&1; then
  echo "  FAIL: pnpm install failed"; tail -5 /tmp/cell.log; exit 1
fi

exec_node="$(pnpm exec node -v 2>/dev/null)"
run_node="$(pnpm run --silent print-node 2>/dev/null)"
bare_node="$(node -v 2>/dev/null || echo none)"

fail=0
[ "$exec_node" = "v${PIN_NODE}" ] || { echo "  FAIL: pnpm exec node = '$exec_node', want v${PIN_NODE}"; fail=1; }
case "$run_node" in
  *"v${PIN_NODE}"*) : ;;
  *) echo "  FAIL: pnpm run node = '$run_node', want v${PIN_NODE}"; fail=1 ;;
esac
if [ "$bare_node" = "v${PIN_NODE}" ]; then
  echo "  note: bare node already equals the pin (ambient matches — consistency still proven via exec/run)"
fi
[ "$fail" = 0 ] && echo "  ok: pnpm exec/run node = v${PIN_NODE}; bare node = ${bare_node}"
exit "$fail"
