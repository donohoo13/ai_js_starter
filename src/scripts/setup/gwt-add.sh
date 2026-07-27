#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/setup/gwt-add.sh [--no-open] <branch-name> [git worktree add flags]
# Creates a git worktree at $HOME/Code/.worktrees/<project>/<branch> (slashes
# in <branch> flattened to dashes, so feature/foo lands at feature-foo), copies
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

# The main checkout is always the first entry in `git worktree list`;
# rev-parse --show-toplevel would return the linked worktree's own path when
# invoked from inside one, mis-deriving <project> below.
main_root=$(git worktree list --porcelain 2>/dev/null | head -1 | sed 's/^worktree //')
if [[ -z "$main_root" ]]; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

project=$(basename "$main_root")
# Flatten branch slashes to dashes so any branch convention (feature/foo,
# user/eng-123) yields one predictable directory level under the base.
target="$HOME/Code/.worktrees/$project/${branch//\//-}"

echo "Creating worktree at $target for branch $branch"
if git rev-parse --verify --quiet "refs/heads/$branch" >/dev/null; then
  echo "Branch $branch already exists — attaching worktree to it."
  git worktree add "$target" "$branch" "$@"
else
  git worktree add "$target" -b "$branch" "$@"
fi

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
if ! (cd "$target" && pnpm install); then
  echo "Warning: pnpm install failed — worktree is ready but dependencies are missing." >&2
  echo "  Retry with: (cd $target && pnpm install)" >&2
fi

echo ""
echo "── Worktree ready ────────────────────────────"
echo "  $target"
echo "──────────────────────────────────────────────"
