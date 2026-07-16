#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/worktree.sh <command> [args]
#
#   add [--no-open] <branch> [git worktree add flags]
#   remove <branch> [git worktree remove flags]
#   path [branch]      print one absolute path to stdout (picker renders on stderr)
#   list               print this repo's worktrees
#   shim [zsh|bash]    print the `wtree` shell function for a shell rc file
#
# Worktrees live at ${WORKTREE_ROOT:-$HOME/.git-worktrees}/<project>/<branch>.
# WORKTREE_ROOT is a per-user machine preference, exported from a shell rc file;
# the default assumes nothing about the user's directory layout.
#
# A script cannot change its parent shell's directory — only a shell function
# can — so `path` is the navigation seam: `cd "$(scripts/worktree.sh path)"`
# works in any shell, and the `wtree` shim wraps exactly that. Everything else
# here needs no shim.
#
# bash-3.2 compatible: macOS pins /bin/bash there permanently.

usage() {
  cat <<'USAGE'
Usage: worktree.sh <command> [args]

  add [--no-open] <branch> [git flags]   create worktree, copy env, install deps, open editor
  remove <branch> [git flags]            remove worktree, delete branch, prune empty parents
  path [branch]                          print one worktree path (no branch: interactive picker)
  list                                   list this repo's worktrees
  shim [zsh|bash]                        print the `wtree` shell function for your rc file

Worktrees live at ${WORKTREE_ROOT:-$HOME/.git-worktrees}/<project>/<branch>.

  cd "$(scripts/worktree.sh path)"       jump to a worktree without the shim
  scripts/doctor.sh --fix                install the shim (and LSP binaries) for you
USAGE
}

die() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

# The main checkout is always the first entry in `git worktree list`;
# rev-parse --show-toplevel would return the linked worktree's own path when
# invoked from inside one, mis-deriving <project>.
main_root() {
  local root
  root=$(git worktree list --porcelain 2>/dev/null | head -1 | sed 's/^worktree //' || true)
  [ -n "$root" ] || die "not inside a git repository"
  printf '%s\n' "$root"
}

wt_root() {
  printf '%s\n' "${WORKTREE_ROOT:-$HOME/.git-worktrees}"
}

target_for() {
  printf '%s/%s/%s\n' "$(wt_root)" "$(basename "$(main_root)")" "$1"
}

# Emit "<branch>\t<path>" per worktree of this repo, main first. Reads
# `git worktree list` rather than scanning WORKTREE_ROOT, so `main` is included
# and worktrees created under a previous root stay reachable. awk (not a bash
# read loop) because its END block flushes the last record whether or not
# porcelain emits a trailing blank line.
enumerate() {
  git worktree list --porcelain 2>/dev/null | awk '
    /^worktree /  { p = substr($0, 10) }
    /^branch /    { b = $0; sub(/^branch refs\/heads\//, "", b) }
    /^detached$/  { b = "(detached)" }
    /^$/          { if (p != "") { print (b == "" ? "(detached)" : b) "\t" p; p = ""; b = "" } }
    END           { if (p != "") print (b == "" ? "(detached)" : b) "\t" p }
  '
}

cmd_list() {
  local rows
  rows=$(enumerate)
  [ -n "$rows" ] || die "no worktrees found"
  printf '%s\n' "$rows" | while IFS="$(printf '\t')" read -r branch path; do
    printf '%-38s %s\n' "$branch" "$path"
  done
}

cmd_path() {
  local want="${1:-}"
  local rows
  rows=$(enumerate)
  [ -n "$rows" ] || die "no worktrees found"

  if [ -n "$want" ]; then
    local hit
    hit=$(printf '%s\n' "$rows" | awk -F"\t" -v w="$want" '$1 == w { print $2; exit }')
    [ -n "$hit" ] || hit=$(printf '%s\n' "$rows" | awk -F"\t" -v w="$want" 'index($1, w) == 1 { print $2; exit }')
    [ -n "$hit" ] || die "no worktree for branch '$want' (try: worktree.sh list)"
    printf '%s\n' "$hit"
    return 0
  fi

  local labels paths branch path
  labels=()
  paths=()
  while IFS="$(printf '\t')" read -r branch path; do
    labels[${#labels[@]}]=$(printf '%-38s %s' "$branch" "$path")
    paths[${#paths[@]}]="$path"
  done <<EOF
$rows
EOF

  if [ "${#paths[@]}" -eq 1 ]; then
    printf '%s\n' "${paths[0]}"
    return 0
  fi

  # `select` renders its menu and PS3 on stderr in both bash and zsh, and reads
  # stdin from the terminal even under command substitution — so stdout carries
  # only the chosen path and `cd "$(worktree.sh path)"` works unshimmed.
  local choice
  PS3="select worktree> "
  printf '%s worktrees:\n' "$(basename "$(main_root)")" >&2
  select choice in "${labels[@]}"; do
    if [ -n "$choice" ]; then
      printf '%s\n' "${paths[$((REPLY - 1))]}"
      return 0
    fi
  done
  die "no selection made"
}

cmd_add() {
  local no_open=0
  if [ "${1:-}" = "--no-open" ]; then
    no_open=1
    shift
  fi

  local branch="${1:-}"
  [ -n "$branch" ] || die "usage: worktree.sh add [--no-open] <branch> [git worktree add flags]"
  shift

  local main target
  main=$(main_root)
  target=$(target_for "$branch")

  echo "Creating worktree at $target for branch $branch"
  if git rev-parse --verify --quiet "refs/heads/$branch" >/dev/null; then
    echo "Branch $branch already exists — attaching worktree to it."
    git worktree add "$target" "$branch" "$@"
  else
    git worktree add "$target" -b "$branch" "$@"
  fi

  echo "Copying env files..."
  if [ -f "$main/.env.local" ]; then
    cp "$main/.env.local" "$target/.env.local"
  else
    echo "  Skipped .env.local (not present at repo root)"
  fi

  if [ "$no_open" -eq 1 ]; then
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
  echo "  cd \"\$(scripts/worktree.sh path $branch)\""
  echo "──────────────────────────────────────────────"
}

cmd_remove() {
  local branch="${1:-}"
  [ -n "$branch" ] || die "usage: worktree.sh remove <branch> [git worktree remove flags]"
  shift

  local root target parent
  root=$(wt_root)
  target=$(target_for "$branch")

  echo "Removing worktree at $target"
  git worktree remove "$target" "$@"

  echo "Deleting branch $branch"
  if ! git branch -d "$branch" 2>/dev/null; then
    echo "Warning: branch $branch has unmerged changes."
    echo "  git branch -D $branch  # force delete if intentional"
  fi

  git worktree prune

  # Slash-named branches (feature/foo) nest directories under the worktree
  # root; prune any now-empty parents up to (and including) the project dir.
  parent=$(dirname "$target")
  while [ "$parent" != "$root" ] && [ "$parent" != "/" ]; do
    rmdir "$parent" 2>/dev/null || break
    parent=$(dirname "$parent")
  done
}

# Print the `wtree` shell function, markers included, for appending to a shell
# rc file. This is the one place the shim text exists; doctor.sh --fix appends
# whatever this emits rather than carrying its own copy, so the two cannot drift.
#
# The zsh and bash bodies are identical (`local`, `[ ]`, `$#`, `return $?` are
# common to both), so the shell argument guards rather than varies the output:
# it exists to refuse fish, which shares no syntax and has no `select`.
cmd_shim() {
  local shell="${1:-$(basename "${SHELL:-unknown}")}"
  case "$shell" in
    zsh | bash) ;;
    fish) die "fish needs its own shim (different function syntax, no \`select\` builtin). Until one exists: cd \"\$(scripts/worktree.sh path)\"" ;;
    *) die "unsupported shell '$shell' — pass zsh or bash, or use: cd \"\$(scripts/worktree.sh path)\"" ;;
  esac

  cat <<'SHIM'
# >>> wtree shim >>>
# Jump into any worktree of the repo you are standing in, from any depth.
# Rename this function to taste — it is yours. It is `wtree` and not `wt`
# because several git-worktree CLIs ship a `wt` binary and a shell function
# shadows a binary silently.
#
# Worktrees default to $HOME/.git-worktrees. Uncomment and set this to put them
# wherever your machine keeps code; it is read by worktree.sh at runtime.
# export WORKTREE_ROOT="$HOME/dev/.worktrees"
wtree() {
  local main script
  # Resolve from the MAIN checkout (always the first `git worktree list` entry),
  # never from `rev-parse --show-toplevel`: inside a worktree the latter returns
  # that worktree's root, so the shim would depend on whatever the branch you
  # happen to be standing on contains, and would die on any branch older than
  # this script.
  main="$(git worktree list --porcelain 2>/dev/null | head -1 | sed 's/^worktree //')"
  script="$main/scripts/worktree.sh"
  if [ -z "$main" ] || [ ! -x "$script" ]; then
    echo "wtree: no scripts/worktree.sh in this repo" >&2
    return 1
  fi
  if [ "$#" -eq 0 ] || [ "$1" = "cd" ]; then
    local dest
    dest=$("$script" path "${2-}") || return $?
    cd "$dest"
  else
    "$script" "$@"
  fi
}
# <<< wtree shim <<<
SHIM
}

command_name="${1:-}"
[ -n "$command_name" ] || {
  usage >&2
  exit 1
}
shift

case "$command_name" in
  add) cmd_add "$@" ;;
  remove) cmd_remove "$@" ;;
  path) cmd_path "$@" ;;
  list) cmd_list "$@" ;;
  shim) cmd_shim "$@" ;;
  -h | --help | help) usage ;;
  *) die "unknown command '$command_name' (try: worktree.sh --help)" ;;
esac
