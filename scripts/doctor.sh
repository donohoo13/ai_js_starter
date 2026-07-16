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

# TypeScript / JavaScript
if [[ -f package.json || -f tsconfig.json ]]; then
  require typescript-language-server \
    "typescript-language-server not found: LSP code intelligence for TS/JS is inactive" \
    "npm i -g typescript-language-server typescript"
fi

# Python
if [[ -f pyproject.toml || -f requirements.txt || -f uv.lock ]]; then
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

install_shim() {
  local login_shell rcfile script shim current tmp tmp_shim existing

  # $SHELL (the login shell) is the only usable signal: this script runs under
  # `#!/usr/bin/env bash`, so $0 always reports bash no matter what the user
  # actually uses.
  login_shell=$(basename "${SHELL:-unknown}")
  if ! rcfile=$(rc_for_shell "$login_shell"); then
    printf '! shim: %s is not supported (zsh and bash only)\n' "$login_shell"
    printf '  use instead: cd "$(scripts/worktree.sh path)"\n'
    return 0
  fi

  script="$(cd "$(dirname "$0")" && pwd)/worktree.sh"
  if [ ! -x "$script" ]; then
    printf '! shim: worktree.sh not found beside doctor.sh — skipping shim install\n'
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
    if [ "$dry_run" -eq 1 ]; then
      printf '  would update the wtree shim block in %s\n' "$rcfile"
      return 0
    fi
    cp "$rcfile" "$rcfile.bak"
    tmp=$(mktemp -t wtshim)
    tmp_shim=$(mktemp -t wtshimbody)
    printf '%s\n' "$shim" >"$tmp_shim"
    # Replace between the markers rather than appending a second block. Not a
    # blind in-place sed: the new block carries its own markers and everything
    # outside them is copied through untouched.
    awk -v s="$MARK_START" -v e="$MARK_END" -v f="$tmp_shim" '
      $0 == s { while ((getline l < f) > 0) print l; close(f); skip = 1; next }
      skip && $0 == e { skip = 0; next }
      !skip { print }
    ' "$rcfile" >"$tmp"
    mv "$tmp" "$rcfile"
    rm -f "$tmp_shim"
    printf '  ok   wtree shim updated in %s (backup: %s.bak)\n' "$rcfile" "$rcfile"
    shim_rc="$rcfile"
    return 0
  fi

  # Foreign name clash. A shell function shadows a PATH binary silently, so
  # installing over one eats the user's tool with no error. Probe through their
  # login shell: a non-interactive bash script cannot see zsh functions or
  # aliases at all.
  existing=$("$SHELL" -ic 'command -v wtree' 2>/dev/null || true)
  if [ -n "$existing" ]; then
    printf '! shim: `wtree` already resolves to:\n    %s\n' "$existing" >&2
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

  if [ -f "$rcfile" ]; then
    cp "$rcfile" "$rcfile.bak"
    printf '\n' >>"$rcfile"
    printf '  ok   wtree shim appended to %s (backup: %s.bak)\n' "$rcfile" "$rcfile"
  else
    printf '  ok   wtree shim written to %s (created — it did not exist)\n' "$rcfile"
  fi
  # Append-only, so the block lands at end of file — which is after
  # `source $ZSH/oh-my-zsh.sh`, the load order the shim needs to win.
  printf '%s\n' "$shim" >>"$rcfile"
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
