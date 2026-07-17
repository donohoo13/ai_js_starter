#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/doctor.sh [--fix [--dry-run]]
#
# Two modes over one list of machine prerequisites, so the list cannot drift:
#
#   (no flags)  Diagnose. Warn-only, always exits 0, safe to auto-run from
#               package.json "prepare" on every install. Informs, never blocks.
#   --fix       Remediate. User-invoked ONLY: it installs global binaries and
#               writes to your shell rc file, so it must never run unattended.
#               Exits non-zero if anything failed or was refused.
#   --dry-run   With --fix: print every intended change, write nothing.
#
# Claude Code's LSP plugins (typescript-lsp, pyright-lsp) ship only server
# configuration; each language server binary is a separate per-machine install,
# and when it is missing LSP code intelligence silently degrades to text search.
#
# --fix also installs the `wtree` shell function (worktree.sh shim), which is
# the only way to cd into a worktree: a script cannot change its parent shell's
# directory, so navigation has to live in a function the shell sources.

usage() {
  cat <<'USAGE'
Usage: doctor.sh [--fix [--dry-run]]

  (no flags)   check machine prerequisites, warn only, always exit 0
  --fix        install what is missing: LSP server binaries + the `wtree` shim
  --dry-run    with --fix: show every intended change, write nothing
USAGE
}

mode=check
dry_run=0
for arg in "$@"; do
  case "$arg" in
    --fix) mode=fix ;;
    --dry-run) dry_run=1 ;;
    -h | --help | help)
      usage
      exit 0
      ;;
    *)
      printf 'Error: unknown flag %s\n' "$arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ "$dry_run" -eq 1 ] && [ "$mode" != fix ]; then
  printf 'Error: --dry-run only means something alongside --fix\n' >&2
  exit 1
fi

failures=0
shim_rc=""

have() { command -v "$1" >/dev/null 2>&1; }
warn() {
  printf '! %s\n  fix: %s\n' "$1" "$2" >&2
}

# One prerequisite, both modes. The remedy is written once, here, so a warning
# can never describe a fix that --fix does not actually perform.
require() {
  local binary="$1" description="$2" fix_command="$3"

  if have "$binary"; then
    [ "$mode" = fix ] && printf '  ok   %s\n' "$binary"
    return 0
  fi

  if [ "$mode" = check ]; then
    warn "$description" "$fix_command"
    return 0
  fi

  printf '! %s\n' "$description"
  if [ "$dry_run" -eq 1 ]; then
    printf '  would run: %s\n' "$fix_command"
    return 0
  fi

  printf '  running: %s\n' "$fix_command"
  if eval "$fix_command"; then
    printf '  ok   %s installed\n' "$binary"
  else
    printf '  FAILED: %s\n' "$fix_command" >&2
    failures=$((failures + 1))
  fi
}

# Manifest probes resolve against the SCRIPT's directory, never the caller's cwd.
# `prepare` always runs from the package root so cwd used to be guaranteed, but
# --fix is hand-invoked: `~/Code/proj/scripts/doctor.sh --fix` from $HOME found
# no package.json, silently skipped every LSP check, installed the shim, and
# exited 0 — reporting a provisioned machine that was not.
project_root="$(cd "$(dirname "$0")/.." && pwd)"

# TypeScript / JavaScript
if [[ -f "$project_root/package.json" || -f "$project_root/tsconfig.json" ]]; then
  require typescript-language-server \
    "typescript-language-server not found: LSP code intelligence for TS/JS is inactive" \
    "npm i -g typescript-language-server typescript"
fi

# Python
if [[ -f "$project_root/pyproject.toml" || -f "$project_root/requirements.txt" || -f "$project_root/uv.lock" ]]; then
  require pyright-langserver \
    "pyright-langserver not found: LSP code intelligence for Python is inactive" \
    "npm i -g pyright"
fi

# Adopting another language? Three steps: enable its plugin in
# .claude/settings.json enabledPlugins, install its binary, add a block above
# gated on its manifest. Official plugins -> binary (detect via manifest):
#   gopls-lsp -> gopls (go.mod)                    go install golang.org/x/tools/gopls@latest
#   rust-analyzer-lsp -> rust-analyzer (Cargo.toml)  rustup component add rust-analyzer
#   ruby-lsp -> ruby-lsp (Gemfile)                 gem install ruby-lsp
#   jdtls-lsp -> jdtls (pom.xml, build.gradle)
#   csharp-lsp -> csharp-ls (*.csproj)
#   clangd-lsp, kotlin-lsp, lua-lsp, php-lsp, swift-lsp also exist in the
#   claude-plugins-official marketplace.

MARK_START='# >>> wtree shim >>>'
MARK_END='# <<< wtree shim <<<'

# macOS bash login shells read .bash_profile and never .bashrc. Get this wrong
# and the shim lands in a file nothing sources.
rc_for_shell() {
  case "$1" in
    zsh) printf '%s/.zshrc\n' "$HOME" ;;
    bash) printf '%s/.bash_profile\n' "$HOME" ;;
    *) return 1 ;;
  esac
}

# Back up to a name that is free, and set rc_backup to the name actually used.
# A fixed `<rc>.bak` is a name users already own — hand-made before some earlier
# risky edit, sometimes the only copy of a config they cannot reconstruct — and
# `cp` would eat it without a word while the success message advertised it as
# the recovery path. It also held exactly one generation: a second --fix
# overwrote the pristine original with the already-modified file.
rc_backup=""
backup_rc() {
  local target="$1" candidate n
  candidate="$target.bak"
  n=0
  while [ -e "$candidate" ]; do
    n=$((n + 1))
    candidate="$target.bak.$n"
    if [ "$n" -gt 100 ]; then
      printf '! shim: cannot find a free backup name beside %s (tried .bak through .bak.100)\n' "$target" >&2
      failures=$((failures + 1))
      return 1
    fi
  done
  if ! cp "$target" "$candidate"; then
    printf '! shim: could not back up %s — refusing to modify it\n' "$target" >&2
    failures=$((failures + 1))
    return 1
  fi
  rc_backup="$candidate"
}

install_shim() {
  local login_shell rcfile script shim current tmp tmp_shim existing

  # $SHELL (the login shell) is the only usable signal: this script runs under
  # `#!/usr/bin/env bash`, so $0 always reports bash no matter what the user
  # actually uses.
  login_shell=$(basename "${SHELL:-unknown}")
  # Not a failure: an unsupported shell is a known-good no-op with a working
  # fallback, so it does not touch `failures` and --fix still exits 0.
  if ! rcfile=$(rc_for_shell "$login_shell"); then
    printf '! shim: %s is not supported (zsh and bash only)\n' "$login_shell"
    printf '  use instead: cd "$(scripts/worktree.sh path)"\n'
    return 0
  fi

  # This one IS a failure: the shim was asked for and cannot be produced.
  # Returning 0 here made --fix exit 0 while silently installing nothing, so a
  # caller reading only the exit code saw "provisioned".
  script="$(cd "$(dirname "$0")" && pwd)/worktree.sh"
  if [ ! -x "$script" ]; then
    printf '! shim: worktree.sh not found beside doctor.sh — cannot install the shim\n' >&2
    failures=$((failures + 1))
    return 0
  fi
  shim=$("$script" shim "$login_shell") || return 0

  # Already ours? Then this is an update, not a collision. This check runs
  # BEFORE the name probe below, or a second --fix refuses against its own shim
  # and the command stops being idempotent.
  if [ -f "$rcfile" ] && grep -qF "$MARK_START" "$rcfile"; then
    current=$(awk -v s="$MARK_START" -v e="$MARK_END" '$0==s{f=1} f{print} $0==e{f=0}' "$rcfile")
    if [ "$current" = "$shim" ]; then
      printf '  ok   wtree shim already current in %s\n' "$rcfile"
      return 0
    fi
    # A start marker with no end marker means someone hand-edited the block.
    # The awk below would treat every remaining line as part of it and drop the
    # rest of the file, so refuse rather than guess.
    if ! grep -qF "$MARK_END" "$rcfile"; then
      printf '! shim: %s has a `%s` line but no `%s` line.\n' "$rcfile" "$MARK_START" "$MARK_END" >&2
      printf '  Refusing to touch it: restoring the block would delete everything below the marker.\n' >&2
      printf '  Repair or delete the partial block by hand, then re-run.\n' >&2
      failures=$((failures + 1))
      return 0
    fi
    if [ "$dry_run" -eq 1 ]; then
      printf '  would update the wtree shim block in %s\n' "$rcfile"
      return 0
    fi
    backup_rc "$rcfile" || return 0
    tmp=$(mktemp -t wtshim)
    tmp_shim=$(mktemp -t wtshimbody)
    trap 'rm -f "$tmp" "$tmp_shim"' EXIT
    printf '%s\n' "$shim" >"$tmp_shim"
    # Replace between the markers rather than appending a second block. Not a
    # blind in-place sed: the new block carries its own markers and everything
    # outside them is copied through untouched. `getline` returns -1 (not 0) on
    # an unreadable body, which would insert nothing, still eat the old block,
    # and exit 0 — a silent deletion reported as success. Fail loudly instead.
    awk -v s="$MARK_START" -v e="$MARK_END" -v f="$tmp_shim" '
      $0 == s {
        r = (getline l < f)
        if (r < 0) { print "doctor.sh: cannot read shim body" > "/dev/stderr"; exit 1 }
        while (r > 0) { print l; r = (getline l < f) }
        close(f); skip = 1; next
      }
      skip && $0 == e { skip = 0; next }
      !skip { print }
    ' "$rcfile" >"$tmp"
    # Write THROUGH the existing file rather than mv over it. `mv` replaces the
    # inode: it turns an rc symlinked into a dotfiles repo (the common case for
    # exactly this tool's users) into a regular file, silently detaching it from
    # the repo that tracks it, and carries mktemp's 0600 across.
    cat "$tmp" >"$rcfile"
    if ! grep -qF "$MARK_START" "$rcfile"; then
      printf '! shim: %s no longer contains the shim block after the update.\n' "$rcfile" >&2
      printf '  Your previous file is at %s\n' "$rc_backup" >&2
      failures=$((failures + 1))
      return 0
    fi
    printf '  ok   wtree shim updated in %s (backup: %s)\n' "$rcfile" "$rc_backup"
    shim_rc="$rcfile"
    return 0
  fi

  # Foreign name clash. A shell function shadows a PATH binary silently, so
  # installing over one eats the user's tool with no error. Probe through their
  # login shell: a non-interactive bash script cannot see zsh functions or
  # aliases at all.
  #
  # Branch on the probe's EXIT STATUS, never its output. `-i` sources the whole
  # rc, so its own stdout lands in the capture: any banner, motd, neofetch, or
  # nvm deprecation notice read as a collision and locked the user out of ever
  # installing the shim, with no override. `</dev/null` because -i also inherits
  # this script's stdin — an rc that prompts (ssh-add, a read -q guard) hung
  # --fix forever with the prompt swallowed by the redirect.
  if "$SHELL" -ic 'command -v wtree >/dev/null' </dev/null >/dev/null 2>&1; then
    existing=$("$SHELL" -ic 'command -v wtree 2>/dev/null | tail -1' </dev/null 2>/dev/null || true)
    printf '! shim: `wtree` already resolves to:\n    %s\n' "${existing:-(unknown)}" >&2
    printf '  Refusing to install: a shell function shadows a binary silently.\n' >&2
    printf '  Rename the function and add it yourself:\n' >&2
    printf '    scripts/worktree.sh shim %s\n' "$login_shell" >&2
    failures=$((failures + 1))
    return 0
  fi

  if [ "$dry_run" -eq 1 ]; then
    printf '  would append the wtree shim to %s:\n' "$rcfile"
    printf '%s\n' "$shim" | sed 's/^/    | /'
    return 0
  fi

  local created=0
  if [ -f "$rcfile" ]; then
    backup_rc "$rcfile" || return 0
    printf '\n' >>"$rcfile"
  else
    created=1
  fi
  # Append-only, so the block lands at end of file — which is after
  # `source $ZSH/oh-my-zsh.sh`, the load order the shim needs to win.
  printf '%s\n' "$shim" >>"$rcfile"
  # Report AFTER the write that can fail, not before it. Announcing success
  # ahead of the operation is the same "evidence before completion claims" rule
  # this repo applies one layer up.
  if [ "$created" -eq 1 ]; then
    printf '  ok   wtree shim written to %s (created — it did not exist)\n' "$rcfile"
  else
    printf '  ok   wtree shim appended to %s (backup: %s)\n' "$rcfile" "$rc_backup"
  fi
  shim_rc="$rcfile"
}

if [ "$mode" = fix ]; then
  install_shim
  if [ -n "$shim_rc" ]; then
    printf '\n`wtree` is not in this shell yet — open a new tab, or: source %s\n' "$shim_rc"
  fi
  if [ "$failures" -gt 0 ]; then
    printf '\n%s item(s) need your attention above.\n' "$failures" >&2
    exit 1
  fi
fi

exit 0
