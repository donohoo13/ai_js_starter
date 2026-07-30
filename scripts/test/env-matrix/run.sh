#!/usr/bin/env bash
# Environment matrix: proves pnpm provisions and uses the pinned Node across a
# mismatched-ambient-Node container, a container with NO Node, and a musl
# container (expected failure — nodejs.org publishes no musl build). Needs
# Docker. Reads the pins from the repo so the test tracks them, and pipes
# assert.sh into each container via `sh -s` so it runs on ash and bash alike.
#
# CI runs the same three cells through .github/workflows/checks.yml.
set -u

script_dir="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$script_dir/../../.." && pwd)"
assert="$script_dir/assert.sh"

PIN_NODE="$(tr -d ' \t\r\n' < "$root/.nvmrc")"
PIN_PNPM="$(grep '"packageManager"' "$root/package.json" | sed -E 's/.*"pnpm@([^"]+)".*/\1/')"

if [ -z "$PIN_NODE" ] || [ -z "$PIN_PNPM" ]; then
  echo "Could not read pins (.nvmrc / packageManager in package.json)"; exit 1
fi
echo "Pins: node $PIN_NODE, pnpm $PIN_PNPM"

# Each cell is "<image>|<mode>"; mode is pass or musl-fail.
cells="node:22|pass ghcr.io/pnpm/pnpm|pass node:22-alpine|musl-fail"

overall=0
for cell in $cells; do
  image="${cell%%|*}"
  mode="${cell##*|}"
  echo ""
  echo "=== $image ($mode) ==="
  if docker run --rm -i \
      -e PIN_NODE="$PIN_NODE" -e PIN_PNPM="$PIN_PNPM" -e MODE="$mode" \
      --entrypoint sh "$image" -s < "$assert"; then
    echo "  PASS"
  else
    echo "  CELL FAILED"
    overall=1
  fi
done

echo ""
if [ "$overall" = 0 ]; then
  echo "env-matrix: all cells ok"
else
  echo "env-matrix: FAILURES above"
fi
exit "$overall"
