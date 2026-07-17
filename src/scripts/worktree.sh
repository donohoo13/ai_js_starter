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
  local root="${WORKTREE_ROOT:-$HOME/.git-worktrees}"
  # Strip trailing slashes. `dirname` normalizes them away while walking up, so
  # an unnormalized root can never string-match in cmd_remove's prune loop --
  # WORKTREE_ROOT="$HOME/dev/wt/" made it climb past the root and rmdir
  # $HOME/dev/wt and then $HOME/dev, directories this tool does not own.
  while [ "$root" != "/" ] && [ "${root%/}" != "$root" ]; do
    root="${root%/}"
  done
  printf '%s\n' "$root"
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
  # `|| true` because `set -o pipefail` otherwise propagates git's failure
  # outside a repo, aborting the caller before its own error message runs.
  git worktree list --porcelain 2>/dev/null | awk '
    /^worktree /  { p = substr($0, 10) }
    /^branch /    { b = $0; sub(/^branch refs\/heads\//, "", b) }
    /^detached$/  { b = "(detached)" }
    /^$/          { if (p != "") { print (b == "" ? "(detached)" : b) "\t" p; p = ""; b = "" } }
    END           { if (p != "") print (b == "" ? "(detached)" : b) "\t" p }
  ' || true
}

# Where git says this branch's worktree actually is, exact match only, empty if
# none. Destructive callers use this rather than target_for(): the two disagree
# for every worktree created under a previous WORKTREE_ROOT, and prefix matching
# has no place in a command that deletes things.
resolve_exact() {
  enumerate | awk -F"\t" -v w="$1" '$1 == w { print $2; exit }'
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

  local main target existing
  main=$(main_root)
  target=$(target_for "$branch")

  # Resume instead of wedging. Every step after `git worktree add` is
  # best-effort, so a failure there used to leave the worktree on disk and make
  # every retry die on `fatal: ... already exists` until the user hand-ran
  # `git worktree remove`.
  existing=$(resolve_exact "$branch")
  if [ -n "$existing" ]; then
    target="$existing"
    echo "Worktree for $branch already exists at $target — resuming setup."
  else
    echo "Creating worktree at $target for branch $branch"
    if git rev-parse --verify --quiet "refs/heads/$branch" >/dev/null; then
      echo "Branch $branch already exists — attaching worktree to it."
      git worktree add "$target" "$branch" "$@"
    else
      git worktree add "$target" -b "$branch" "$@"
    fi
  fi

  echo "Copying env files..."
  if [ ! -f "$main/.env.local" ]; then
    echo "  Skipped .env.local (not present at repo root)"
  elif ! cp "$main/.env.local" "$target/.env.local"; then
    echo "Warning: could not copy .env.local — worktree exists without it." >&2
    echo "  Retry with: cp $main/.env.local $target/.env.local" >&2
  fi

  if [ "$no_open" -eq 1 ]; then
    echo "Skipping editor launch (--no-open)."
  elif command -v zed >/dev/null 2>&1; then
    echo "Opening $target in Zed..."
    # `command -v` proves zed is on PATH, not that it runs: a stale shim left
    # behind by a deleted app exits non-zero, and under `set -e` that aborted
    # cmd_add before pnpm install. The else branch below already declares the
    # launch best-effort; this makes the elif agree with it.
    zed "$target" || echo "Warning: 'zed' failed to launch — worktree is ready." >&2
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

  local root target parent err
  root=$(wt_root)

  # Ask git where the worktree IS, not where the current WORKTREE_ROOT says it
  # would go. The two diverge for every worktree created under a previous root,
  # which includes every one that predates this script's configurable root. When
  # they diverged, remove computed a path the user never typed, failed, and
  # aborted before deleting the branch -- orphaning a worktree that `list` still
  # happily showed. target_for is the fallback, so the error still names an
  # expected path when git knows nothing about the branch.
  target=$(resolve_exact "$branch")
  [ -n "$target" ] || target=$(target_for "$branch")

  echo "Removing worktree at $target"
  git worktree remove "$target" "$@"

  echo "Deleting branch $branch"
  # Capture git's reason instead of discarding it and asserting one cause:
  # `branch -d` also fails when the branch is checked out in another worktree,
  # where the printed `branch -D` advice would fail the same way.
  if ! err=$(git branch -d "$branch" 2>&1); then
    printf 'Warning: could not delete branch %s:\n  %s\n' "$branch" "$err"
    printf '  git branch -D %s  # force delete if it is genuinely unmerged\n' "$branch"
  fi

  git worktree prune

  # Slash-named branches (feature/foo) nest directories under the worktree
  # root; prune any now-empty parents up to (and including) the project dir.
  # Bounded by prefix, not string equality: equality alone let an unnormalized
  # root walk straight past the boundary (wt_root now normalizes too -- belt and
  # braces, because this loop deletes directories).
  parent=$(dirname "$target")
  while [ "$parent" != "/" ] && [ "$parent" != "$root" ]; do
    case "$parent" in
      "$root"/*) ;;
      *) break ;;
    esac
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
# it exists to refuse fish, which shares no syntax and has no `select`. Arrays
# are deliberately absent from the emitted function -- zsh indexes from 1 and
# bash from 0, so any array here would be silently wrong in one of them. That is
# why navigation delegates to this script (always bash) instead of inlining a
# picker.
#
# The navigation path is PINNED to this script's absolute path at emit time. It
# must never resolve the script from the user's cwd: `wtree` gets typed
# reflexively, including inside repos that were merely cloned, and a
# cwd-derived `scripts/worktree.sh` turns `cd` + `wtree` into arbitrary code
# execution (git preserves the exec bit through clone). Pinning costs nothing in
# reach -- `path`/`list` are pure `git worktree list` against the caller's cwd
# and carry no project config -- so a pinned script navigates ANY git repo,
# including ones with no worktree.sh of their own.
cmd_shim() {
  local shell="${1:-$(basename "${SHELL:-unknown}")}"
  case "$shell" in
    zsh | bash) ;;
    fish) die "fish needs its own shim (different function syntax, no \`select\` builtin). Until one exists: cd \"\$(scripts/worktree.sh path)\"" ;;
    *) die "unsupported shell '$shell' — pass zsh or bash, or use: cd \"\$(scripts/worktree.sh path)\"" ;;
  esac

  local self
  self="$(cd "$(dirname "$0")" && pwd)/worktree.sh"
  case "$self" in
    *'|'*) die "cannot emit shim: this script's path contains '|' ($self)" ;;
  esac

  cat <<'SHIM' | sed "s|__NAV_SCRIPT__|$self|"
# >>> wtree shim >>>
# Jump into any worktree of the repo you are standing in, from any depth.
# It is `wtree` and not `wt` because several git-worktree CLIs ship a `wt`
# binary, and a shell function shadows a binary silently.
#
# MANAGED BLOCK: everything between these markers is regenerated by
# `scripts/doctor.sh --fix` (your old copy lands in <rcfile>.bak). Put your own
# edits ABOVE this block, outside the markers, where nothing will overwrite
# them — including your worktree root and any rename:
#
#   export WORKTREE_ROOT="$HOME/dev/.worktrees"   # default: $HOME/.git-worktrees
#   alias wt=wtree                                # if `wt` is free on your machine
wtree() {
  # Read-only verbs are navigation: pinned at install time, NEVER taken from the
  # repo you are standing in. Cloning a hostile repo and typing `wtree` runs
  # nothing of that repo's. They work in any git repo -- they are pure
  # `git worktree list` against your cwd and carry no project config.
  local nav="__NAV_SCRIPT__"
  case "${1-}" in
    "" | cd | list | path)
      if [ ! -x "$nav" ]; then
        echo "wtree: $nav is gone — re-run scripts/doctor.sh --fix to repoint the shim" >&2
        return 1
      fi
      case "${1-}" in
        list)
          "$nav" list
          return
          ;;
        path)
          "$nav" path "${2-}"
          return
          ;;
      esac
      local dest
      dest=$("$nav" path "${2-}") || return $?
      cd "$dest"
      return
      ;;
  esac

  # Project verbs (add, remove, ...) DO run the current repo's script: they are
  # tuned per project (install command, env files, editor launch), and typing
  # one is an explicit "act on this project" decision -- the same trust you
  # already extend to `npm install` or `make` in a repo you chose to build.
  local main script
  main="$(git worktree list --porcelain 2>/dev/null | head -1 | sed 's/^worktree //')"
  script="$main/scripts/worktree.sh"
  if [ -z "$main" ] || [ ! -x "$script" ]; then
    echo "wtree: no scripts/worktree.sh in this repo (navigation still works)" >&2
    return 1
  fi
  "$script" "$@"
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
