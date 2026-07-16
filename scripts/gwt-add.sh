#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/gwt-add.sh [--no-open] <branch-name> [git worktree add flags]
# Creates a git worktree at $HOME/Code/.worktrees/<project>/<branch>, copies
# env files, runs pnpm install, and opens the worktree in Zed.
# --no-open skips the editor launch (scripted/AI invocations, e.g. implement-task).

no_open=0
if [[ "${1:-}" == "--no-open" ]]; then
  no_open=1
  shift
fi

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "Usage: $(basename "$0") [--no-open] <branch-name> [git worktree add flags]" >&2
  exit 1
fi

branch="$1"
shift

main_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ -z "$main_root" ]]; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

project=$(basename "$main_root")
target="$HOME/Code/.worktrees/$project/$branch"

echo "Creating worktree at $target for branch $branch"
git worktree add "$target" -b "$branch" "$@"

echo "Copying env files..."
if [[ -f "$main_root/.env.local" ]]; then
  cp "$main_root/.env.local" "$target/.env.local"
else
  echo "  Skipped .env.local (not present at repo root)"
fi

if [[ "$no_open" -eq 1 ]]; then
  echo "Skipping editor launch (--no-open)."
elif command -v zed >/dev/null 2>&1; then
  echo "Opening $target in Zed..."
  zed "$target"
else
  echo "Warning: 'zed' not found on PATH — skipping editor launch."
fi

echo "Installing dependencies..."
(cd "$target" && pnpm install)

echo ""
echo "── Worktree ready ────────────────────────────"
echo "  $target"
echo "──────────────────────────────────────────────"
