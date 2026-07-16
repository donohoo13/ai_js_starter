#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/gwt-remove.sh <branch-name> [git worktree remove flags]
# Removes the worktree at $HOME/Code/.worktrees/<project>/<branch>, deletes
# the branch (soft — warns on unmerged), and prunes worktree metadata.

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "Usage: $(basename "$0") <branch-name> [git worktree remove flags]" >&2
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
target="$HOME/Code/.worktrees/$project/$branch"

echo "Removing worktree at $target"
git worktree remove "$target" "$@"

echo "Deleting branch $branch"
if ! git branch -d "$branch" 2>/dev/null; then
  echo "Warning: branch $branch has unmerged changes."
  echo "  git branch -D $branch  # force delete if intentional"
fi

git worktree prune

# Slash-named branches (feature/foo) nest directories under the worktree
# base; prune any now-empty parents up to (and including) the project dir.
parent=$(dirname "$target")
while [[ "$parent" != "$HOME/Code/.worktrees" && "$parent" != "/" ]]; do
  rmdir "$parent" 2>/dev/null || break
  parent=$(dirname "$parent")
done
