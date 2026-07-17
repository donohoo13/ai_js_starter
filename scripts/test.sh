#!/usr/bin/env bash
set -uo pipefail

# Usage: ./scripts/test.sh
#
# Behavioral tests for scripts/worktree.sh and scripts/doctor.sh. These scripts
# mutate a user's home directory and delete directories, so they get tests even
# though this repo ships no application code and no test framework.
#
# Everything runs against a scratch HOME and a throwaway git repo. The guard
# below refuses to run if HOME did not get redirected -- that guard is the only
# thing between a bug in this file and a real ~/.zshrc.
#
# Run it with `pnpm test`. It is deliberately NOT wired into `prepare`: it
# creates repos and runs `pnpm install`, which has no business firing on install.
#
# bash-3.2 compatible: macOS pins /bin/bash there permanently.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREE_SH="$REPO/scripts/worktree.sh"
DOCTOR_SH="$REPO/scripts/doctor.sh"

# The twins under src/ are byte-identical, so testing one pair covers both; the
# identity itself is asserted in the last suite.
if [ ! -x "$WORKTREE_SH" ]; then
  WORKTREE_SH="$REPO/src/scripts/worktree.sh"
  DOCTOR_SH="$REPO/src/scripts/doctor.sh"
fi
# Fail loudly rather than run every suite against a path that does not exist:
# each test would report a plausible-looking failure of the code under test
# instead of the truth, which is that the suite never found it.
for required in "$WORKTREE_SH" "$DOCTOR_SH"; do
  if [ ! -x "$required" ]; then
    printf 'ABORT: %s not found or not executable (resolved REPO=%s)\n' "$required" "$REPO" >&2
    exit 98
  fi
done

# -P resolves the physical path. macOS symlinks /var -> /private/var and mktemp
# hands back the unresolved form, while git always reports the resolved one, so
# every path comparison below would fail on a difference that is not real.
SANDBOX=$(cd "$(mktemp -d -t wtsuite)" && pwd -P)
REAL_HOME="$HOME"
pass=0
fail=0

cleanup() { rm -rf "$SANDBOX"; }
trap cleanup EXIT

ok() {
  printf '  ok   %s\n' "$1"
  pass=$((pass + 1))
}
bad() {
  printf '  FAIL %s\n' "$1"
  fail=$((fail + 1))
}
check() { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (want [$3] got [$2])"; fi; }
suite() { printf '\n%s\n' "$1"; }

# Refuse to touch a real home directory. Every test below runs commands that
# write to $HOME; if the redirect ever fails to propagate, this stops the suite
# instead of the suite stopping someone's dotfiles.
guard_home() {
  case "$1" in
    "$SANDBOX"/*) ;;
    *)
      printf 'ABORT: HOME=[%s] is not under the sandbox — refusing to run\n' "$1" >&2
      exit 99
      ;;
  esac
  if [ "$1" = "$REAL_HOME" ]; then
    printf 'ABORT: HOME was not redirected — refusing to run\n' >&2
    exit 99
  fi
}

# A throwaway repo shaped like a real one: .gitignore covering the env file and
# node_modules, lockfile committed. Without the .gitignore, `git worktree
# remove` refuses on untracked files and every removal test fails for the wrong
# reason.
make_repo() {
  local root="$1"
  mkdir -p "$root"
  (
    cd "$root" || exit 1
    git init -q -b main .
    git config user.email t@t.t
    git config user.name t
    printf 'SECRET=1\n' >.env.local
    printf '.env.local\nnode_modules/\n' >.gitignore
    printf '{"name":"proj"}\n' >package.json
    mkdir -p scripts
    cp "$WORKTREE_SH" scripts/worktree.sh
    chmod +x scripts/worktree.sh
    # Commit the lockfile, as a real repo does. `worktree.sh add` runs pnpm
    # install in each worktree; with no lockfile at HEAD the generated one is
    # untracked, and `git worktree remove` then refuses on a dirty tree -- a
    # removal failure that says nothing about the code under test.
    pnpm install --silent >/dev/null 2>&1 || true
    git add package.json .gitignore scripts/worktree.sh
    [ -f pnpm-lock.yaml ] && git add pnpm-lock.yaml
    git commit -qm init
  )
}

# ---------------------------------------------------------------------------
suite "worktree.sh: roots and navigation"
# ---------------------------------------------------------------------------
H="$SANDBOX/h1"
guard_home "$H"
mkdir -p "$H"
make_repo "$H/proj"

(
  cd "$H/proj" || exit 1
  unset WORKTREE_ROOT
  HOME="$H" "$WORKTREE_SH" add --no-open feature/x >/dev/null 2>&1
)
[ -d "$H/.git-worktrees/proj/feature/x" ] && ok "default root is \$HOME/.git-worktrees" || bad "default root missing"
[ -d "$H/Code" ] && bad "invented ~/Code" || ok "no ~/Code invented"
[ -f "$H/.git-worktrees/proj/feature/x/.env.local" ] && ok ".env.local copied" || bad ".env.local not copied"

p=$(cd "$H/proj" && HOME="$H" "$WORKTREE_SH" path feature/x 2>/dev/null)
check "path <branch> resolves" "$p" "$H/.git-worktrees/proj/feature/x"

p2=$(cd "$H/proj" && printf '2\n' | HOME="$H" "$WORKTREE_SH" path 2>/dev/null)
case "$p2" in
  "$H"/*) ok "picker keeps stdout pure (one path, menu on stderr)" ;;
  *) bad "picker polluted stdout: [$p2]" ;;
esac

# Captured, never piped into `grep -q`: grep exits on first match, SIGPIPEs the
# producer, and `pipefail` then reports the whole pipeline as failed -- turning a
# successful match into a FAIL (and, when the sense is inverted, a match into a
# silent pass).
listing=$(cd "$H/proj" && HOME="$H" "$WORKTREE_SH" list 2>/dev/null)
case "$listing" in
  main*) ok "list includes main" ;;
  *) bad "list missing main: [$listing]" ;;
esac

# COR-5: outside a repo, pipefail used to kill enumerate before die could speak.
out=$(cd "$SANDBOX" && HOME="$H" "$WORKTREE_SH" list 2>&1)
rc=$?
[ "$rc" -ne 0 ] && [ -n "$out" ] && ok "list outside a repo explains itself" || bad "list outside a repo: rc=$rc out=[$out]"

# ---------------------------------------------------------------------------
suite "worktree.sh: SEC-1 — read-only verbs never execute the cwd repo's script"
# ---------------------------------------------------------------------------
EVIL="$SANDBOX/evil"
mkdir -p "$EVIL/scripts"
(
  cd "$EVIL" || exit 1
  git init -q -b main .
  git config user.email t@t.t
  git config user.name t
  printf '#!/bin/bash\necho PWNED\n' >scripts/worktree.sh
  chmod +x scripts/worktree.sh
  git add -A
  git commit -qm evil
)
for verb in "" "cd main" "list" "path main"; do
  out=$(/bin/bash -c 'eval "$('"$WORKTREE_SH"' shim bash)"; cd '"$EVIL"'; wtree '"$verb"' 2>&1' | head -1)
  case "$out" in
    *PWNED*) bad "wtree ${verb:-<bare>} executed the hostile repo's script" ;;
    *) ok "wtree ${verb:-<bare>} did not execute the hostile repo's script" ;;
  esac
done
out=$(/bin/bash -c 'eval "$('"$WORKTREE_SH"' shim bash)"; cd '"$EVIL"'; wtree cd main 2>&1; pwd')
case "$out" in
  *"$EVIL"*) ok "navigation works in a repo that has no worktree.sh of its own" ;;
  *) bad "navigation broke in a foreign repo: [$out]" ;;
esac
shim_zsh=$("$WORKTREE_SH" shim zsh)
case "$shim_zsh" in
  *'paths['* | *'labels['* | *REPLY*) bad "emitted shim uses arrays (zsh indexes from 1, bash from 0)" ;;
  *) ok "emitted shim is array-free" ;;
esac
shim_bash=$("$WORKTREE_SH" shim bash)
case "$shim_bash" in
  *__NAV_SCRIPT__*) bad "shim placeholder left uninterpolated" ;;
  *) ok "shim nav path is pinned" ;;
esac

# ---------------------------------------------------------------------------
suite "worktree.sh: REL-6/COR-1/PRF-3 — a trailing slash must not climb past the root"
# ---------------------------------------------------------------------------
H="$SANDBOX/h2"
guard_home "$H"
mkdir -p "$H/dev/wt"
make_repo "$H/proj"
(
  cd "$H/proj" || exit 1
  HOME="$H" WORKTREE_ROOT="$H/dev/wt/" "$WORKTREE_SH" add --no-open feature/alpha >/dev/null 2>&1
  HOME="$H" WORKTREE_ROOT="$H/dev/wt/" "$WORKTREE_SH" remove feature/alpha >/dev/null 2>&1
)
[ -d "$H/dev/wt" ] && ok "root survives removal (trailing slash normalized)" || bad "root itself was deleted"
[ -d "$H/dev" ] && ok "root's parent survives removal" || bad "climbed above the root and deleted its parent"

# ---------------------------------------------------------------------------
suite "worktree.sh: REL-5/COR-2 — remove resolves via git, not env arithmetic"
# ---------------------------------------------------------------------------
H="$SANDBOX/h3"
guard_home "$H"
mkdir -p "$H/old" "$H/new"
make_repo "$H/proj"
(cd "$H/proj" && HOME="$H" WORKTREE_ROOT="$H/old" "$WORKTREE_SH" add --no-open feature/moved >/dev/null 2>&1)
[ -d "$H/old/proj/feature/moved" ] && ok "worktree created under the old root" || bad "setup failed"
# Root changes underneath it, as it does for every worktree made before this change.
(cd "$H/proj" && HOME="$H" WORKTREE_ROOT="$H/new" "$WORKTREE_SH" remove feature/moved >/dev/null 2>&1)
[ -d "$H/old/proj/feature/moved" ] && bad "remove orphaned a worktree created under a previous root" || ok "remove finds a worktree created under a previous root"

# ---------------------------------------------------------------------------
suite "worktree.sh: REL-3/REL-4 — add survives a failed step"
# ---------------------------------------------------------------------------
H="$SANDBOX/h4"
guard_home "$H"
mkdir -p "$H/fakebin"
make_repo "$H/proj"
printf '#!/bin/sh\nexit 1\n' >"$H/fakebin/zed"
chmod +x "$H/fakebin/zed"
out=$(cd "$H/proj" && HOME="$H" PATH="$H/fakebin:$PATH" "$WORKTREE_SH" add feature/zedfail 2>&1)
case "$out" in
  *"Installing dependencies"*) ok "a failing zed does not abort before pnpm install" ;;
  *) bad "failing zed aborted cmd_add" ;;
esac
# REL-3: the worktree exists now; a re-run must resume rather than die.
out=$(cd "$H/proj" && HOME="$H" "$WORKTREE_SH" add --no-open feature/zedfail 2>&1)
case "$out" in
  *"resuming setup"*) ok "add resumes on an existing worktree instead of wedging" ;;
  *"already exists"*) bad "add wedged on the existing worktree" ;;
  *) bad "add re-run: unexpected output" ;;
esac

# ---------------------------------------------------------------------------
suite "doctor.sh: modes"
# ---------------------------------------------------------------------------
H="$SANDBOX/d1"
guard_home "$H"
mkdir -p "$H"
out=$(cd "$REPO" && HOME="$H" PATH=/usr/bin:/bin "$DOCTOR_SH" 2>&1)
rc=$?
check "bare exits 0 with binaries missing" "$rc" "0"
case "$out" in *typescript-language-server*) ok "bare warns about a missing LSP binary" ;; *) bad "bare printed no warning" ;; esac
[ -f "$H/.zshrc" ] && bad "bare mode wrote an rc file" || ok "bare mode writes nothing"

(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix --dry-run >/dev/null 2>&1)
[ -f "$H/.zshrc" ] && bad "--dry-run wrote an rc file" || ok "--dry-run writes nothing"

(cd "$REPO" && HOME="$H" "$DOCTOR_SH" --bogus >/dev/null 2>&1)
check "unknown flag exits 1" "$?" "1"
(cd "$REPO" && HOME="$H" "$DOCTOR_SH" --dry-run >/dev/null 2>&1)
check "--dry-run without --fix exits 1" "$?" "1"

# PRF-2: --fix is hand-invoked, so cwd is not the package root.
out=$(cd "$SANDBOX" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix --dry-run 2>&1)
case "$out" in
  *typescript-language-server*) ok "--fix checks LSP binaries from any cwd" ;;
  *) bad "--fix from another cwd silently skipped the LSP checks" ;;
esac

# ---------------------------------------------------------------------------
suite "doctor.sh: rc file handling"
# ---------------------------------------------------------------------------
H="$SANDBOX/d2"
guard_home "$H"
mkdir -p "$H"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
[ -f "$H/.zshrc" ] && ok "--fix creates an absent rc file" || bad "rc file not created"
[ -e "$H/.zshrc.bak" ] && bad "backed up a file that never existed" || ok "no spurious backup"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
n=$(grep -cF '>>> wtree shim >>>' "$H/.zshrc")
check "second --fix does not duplicate the block" "$n" "1"

H="$SANDBOX/d3"
guard_home "$H"
mkdir -p "$H"
printf '# hand-tuned\nexport FOO=1\n' >"$H/.zshrc"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
grep -q 'hand-tuned' "$H/.zshrc" && ok "existing rc content preserved" || bad "clobbered the existing rc"
tail -1 "$H/.zshrc" | grep -qF '<<< wtree shim <<<' && ok "block appended at EOF (load order)" || bad "block not at EOF"

# SEC-3/REL-2: a user's own .bak is not ours to destroy.
H="$SANDBOX/d4"
guard_home "$H"
mkdir -p "$H"
printf 'export REAL=1\n' >"$H/.zshrc"
printf 'PRECIOUS\n' >"$H/.zshrc.bak"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
grep -q PRECIOUS "$H/.zshrc.bak" && ok "pre-existing .bak preserved" || bad "destroyed the user's own .bak"
[ -e "$H/.zshrc.bak.1" ] && ok "backup written to the next free name" || bad "no fallback backup name used"

# SEC-2: an rc symlinked into a dotfiles repo must stay a symlink.
H="$SANDBOX/d5"
guard_home "$H"
mkdir -p "$H/dotfiles"
printf 'export REAL=1\n' >"$H/dotfiles/zshrc"
ln -s "$H/dotfiles/zshrc" "$H/.zshrc"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
# Force the update path, which is where mv used to break the link.
printf '# drift\n' >>"$H/.zshrc"
sed -i '' 's/# Jump into any worktree/# Jump into any worktree (drifted)/' "$H/.zshrc" 2>/dev/null || true
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
[ -L "$H/.zshrc" ] && ok "symlinked rc is still a symlink after an update" || bad "update replaced the symlink with a regular file"
grep -q 'wtree shim' "$H/dotfiles/zshrc" && ok "writes land in the dotfiles repo the rc points at" || bad "dotfiles source detached from the live rc"

# COR-4: a lone start marker must not eat the rest of the file.
H="$SANDBOX/d6"
guard_home "$H"
mkdir -p "$H"
printf '# >>> wtree shim >>>\nwtree(){ :; }\nexport CRITICAL=1\n' >"$H/.zshrc"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
grep -q 'CRITICAL' "$H/.zshrc" && ok "a partial block refuses rather than truncating the file" || bad "truncated the rc from the start marker to EOF"

# REL-1/PRF-1: the probe must read exit status, not the rc's chatter.
H="$SANDBOX/d7"
guard_home "$H"
mkdir -p "$H"
printf 'echo "Welcome back!"\n' >"$H/.zshrc"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
grep -q 'wtree shim' "$H/.zshrc" && ok "a chatty rc does not read as a name collision" || bad "banner output locked the user out of installing"

H="$SANDBOX/d8"
guard_home "$H"
mkdir -p "$H"
printf 'wtree(){ echo mine; }\n' >"$H/.zshrc"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh "$DOCTOR_SH" --fix >/dev/null 2>&1)
check "a real wtree function is still refused" "$?" "1"
grep -qF '>>> wtree shim >>>' "$H/.zshrc" && bad "installed over a foreign wtree" || ok "refuses to shadow a foreign wtree"

H="$SANDBOX/d9"
guard_home "$H"
mkdir -p "$H/bin"
printf '#!/bin/sh\necho bin\n' >"$H/bin/wtree"
chmod +x "$H/bin/wtree"
: >"$H/.zshrc"
(cd "$REPO" && HOME="$H" SHELL=/bin/zsh PATH="$H/bin:$PATH" "$DOCTOR_SH" --fix >/dev/null 2>&1)
check "a wtree PATH binary is still refused" "$?" "1"

# macOS login shells read .bash_profile; .bashrc would never be sourced.
H="$SANDBOX/d10"
guard_home "$H"
mkdir -p "$H"
(cd "$REPO" && HOME="$H" SHELL=/bin/bash "$DOCTOR_SH" --fix >/dev/null 2>&1)
[ -f "$H/.bash_profile" ] && ok "bash targets .bash_profile" || bad ".bash_profile not written"
[ -f "$H/.bashrc" ] && bad "wrote .bashrc (never sourced by a macOS login shell)" || ok ".bashrc untouched"

# ---------------------------------------------------------------------------
suite "portability and twins"
# ---------------------------------------------------------------------------
for f in "$REPO/scripts/worktree.sh" "$REPO/scripts/doctor.sh" "$REPO/scripts/test.sh" \
  "$REPO/src/scripts/worktree.sh" "$REPO/src/scripts/doctor.sh" "$REPO/src/scripts/test.sh"; do
  [ -f "$f" ] || continue
  if /bin/bash -n "$f" 2>/dev/null; then ok "parses under bash 3.2: ${f#"$REPO"/}"; else bad "syntax error under bash 3.2: ${f#"$REPO"/}"; fi
done
# This file is excluded: it carries the construct names as a search pattern, so
# scanning it would always match itself.
bash4=$(grep -lE 'declare -A|mapfile|readarray|\$\{[a-zA-Z_]+,,\}|\$\{[a-zA-Z_]+\^\^\}' \
  "$REPO"/scripts/worktree.sh "$REPO"/scripts/doctor.sh \
  "$REPO"/src/scripts/worktree.sh "$REPO"/src/scripts/doctor.sh 2>/dev/null || true)
if [ -n "$bash4" ]; then
  bad "bash-4-only construct in: $bash4"
else
  ok "no bash-4-only constructs (macOS /bin/bash is 3.2 forever)"
fi
for pair in worktree doctor test; do
  if [ -f "$REPO/scripts/$pair.sh" ] && [ -f "$REPO/src/scripts/$pair.sh" ]; then
    if cmp -s "$REPO/scripts/$pair.sh" "$REPO/src/scripts/$pair.sh"; then
      ok "$pair.sh is byte-identical across layers"
    else
      bad "$pair.sh has drifted between scripts/ and src/scripts/"
    fi
  fi
done

printf '\n%s passed, %s failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
