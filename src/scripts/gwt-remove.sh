
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

main_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
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
