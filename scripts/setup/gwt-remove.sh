#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/setup/gwt-remove.sh <branch-name> [git worktree remove flags]
# Removes the worktree at <main-checkout>/.claude/worktrees/<branch> (slashes
# in <branch> flattened to dashes, matching gwt-add.sh), deletes the branch
# (soft — warns on unmerged), and prunes worktree metadata. Worktrees created
# before the in-repo move (under ~/Code/.worktrees) are still found and removed.

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "Usage: $(basename "$0") <branch-name> [git worktree remove flags]" >&2
  exit 1
fi

branch="$1"
shift

# The main checkout is always the first entry in `git worktree list`;
# rev-parse --show-toplevel would return the linked worktree's own path when
# invoked from inside one, mis-deriving the in-repo base below.
# `|| true` is load-bearing: outside a repo, git fails and `pipefail` propagates
# that through the whole pipeline, so `set -e` would kill the script with a bare
# exit 128 and the friendly branch below would never run. Do not remove it.
main_root=$(git worktree list --porcelain 2>/dev/null | head -1 | sed 's/^worktree //') || true
if [[ -z "$main_root" ]]; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

project=$(basename "$main_root")
flat="${branch//\//-}"
target="$main_root/.claude/worktrees/$flat"
base="$main_root/.claude/worktrees"

# Worktrees created before the in-repo move live under ~/Code/.worktrees —
# flattened, or raw-nested if they predate path flattening too.
if [[ ! -d "$target" && -d "$HOME/Code/.worktrees/$project/$flat" ]]; then
  target="$HOME/Code/.worktrees/$project/$flat"
  base="$HOME/Code/.worktrees"
elif [[ ! -d "$target" && -d "$HOME/Code/.worktrees/$project/$branch" ]]; then
  target="$HOME/Code/.worktrees/$project/$branch"
  base="$HOME/Code/.worktrees"
fi

echo "Removing worktree at $target"
git worktree remove "$target" "$@"

echo "Deleting branch $branch"
if ! git branch -d "$branch" 2>/dev/null; then
  echo "Warning: branch $branch has unmerged changes."
  echo "  git branch -D $branch  # force delete if intentional"
fi

git worktree prune

# Prune now-empty parents up to (but not including) the base; legacy
# pre-flattening worktrees may have nested several levels under theirs.
parent=$(dirname "$target")
while [[ "$parent" != "$base" && "$parent" != "/" ]]; do
  rmdir "$parent" 2>/dev/null || break
  parent=$(dirname "$parent")
done
