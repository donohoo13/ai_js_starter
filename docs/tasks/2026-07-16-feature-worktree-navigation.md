---
type: feature
status: in-progress
created: 2026-07-16
---

# Make worktrees reachable and machine setup self-serve

## Context

The worktree checkpoint landed in `2026-07-16-feature-worktree-checkpoint.md`: `implement-task` now builds in a dedicated worktree at `$HOME/Code/.worktrees/<project>/<branch>`, created by `scripts/gwt-add.sh --no-open` and entered via the native `EnterWorktree` tool. It works, and it exposed the gap it doesn't cover: during a long build the user has no quick way to get an interactive shell into that worktree to run `pnpm dev`. Verified against Claude Code's own docs — there is no built-in affordance for this (no slash command, no CLI flag, no status-line hook); the vendor's guidance is to open a terminal and `cd` there yourself. The native `EnterWorktree` default location is `.claude/worktrees/` (in-repo, not configurable by any setting, and not auto-gitignored), which is why this repo overrides the location with its own script in the first place.

## Problem

Today the only path to a shell in a worktree is retyping `~/Code/.worktrees/<project>/<branch>` from memory, and the scripts can only be invoked as `scripts/gwt-add.sh` from the repo root (they break one directory down). A script cannot `cd` its parent shell — only a shell function can — so no amount of relocating the worktree directory fixes this; in-project `.worktrees/` merely shortens a path the user still has to remember, while nesting a full checkout plus `node_modules` inside the repo where `.gitignore` stops git and nothing else (file watchers, tsserver include globs, workspace globs). Desired: from any directory inside any worktree of the repo, one short command lists the repo's worktrees and drops the user into the one they pick, with no path memorized; and a new machine gets its prerequisites (LSP binaries, the shell function) installed by one command instead of tribal knowledge.

Secondary defect surfaced while grilling: `$HOME/Code/.worktrees` is the author's personal directory layout hardcoded into a template. `fork-points.md:34` already flags it as "a machine-layout assumption" requiring manual retarget per destination project. Nine of ten Mac developers have no `~/Code`, and the script creates it silently as a side effect.

## Scope

- In scope (must-have): consolidate `gwt-add.sh`/`gwt-remove.sh` into one `scripts/worktree.sh` with `add`/`remove`/`path`/`list`/`shim` subcommands, both layers; `WORKTREE_ROOT` env var defaulting to `$HOME/.git-worktrees`; a `wtree` shell function emitted by `worktree.sh shim` for zsh and bash; `doctor.sh --fix` that installs LSP binaries and the shim; root-layer `doctor.sh` twin wired into `prepare`; rewire every caller (implement-task, ship-pr, skills README, CLAUDE.md, project-init, fork-points) in both layers.
- Nice to have: `--fix --dry-run`; `worktree.sh list` output usable standalone, not only as picker input.
- Out of scope (non-goals, named so the task does not expand silently): a `WorktreeCreate` hook to redirect native `claude --worktree` (rejected during grilling — it forces the worktree decision at session launch, destroying implement-task's ability to recommend one mid-session after grilling); fish shim (no fish user exists; the `cd "$(scripts/worktree.sh path)"` fallback already works and a fish picker is a second implementation, not a translation); `worktree.symlinkDirectories`-style node_modules symlinking in place of `pnpm install`; migrating the other repos on this machine (`fantasy_draft_lab`, `oneview-monorepo`) to the new script; changing where worktrees live relative to the repo (settled: outside it, unchanged).

## Requirements

- `scripts/worktree.sh` resolves its root as `${WORKTREE_ROOT:-$HOME/.git-worktrees}` and never creates `~/Code` unless the user set `WORKTREE_ROOT` to it.
- The script stays the guaranteed floor: `add`, `remove`, and `list` work in any POSIX shell with zero install; only `cd` requires the shim, because only `cd` mutates parent-shell state.
- `worktree.sh path [branch]` prints exactly one absolute path to stdout and nothing else; the interactive picker's menu and prompt go to stderr so `cd "$(scripts/worktree.sh path)"` works unshimmed.
- The picker is `select`, a bash 3.2 and zsh builtin — no `fzf`, `zoxide`, or any dependency absent from a stock macOS install.
- Bare `wtree` is the picker (`cd` implied); `wtree --help` prints usage. The frequent action loses the verb.
- The shim is emitted by `worktree.sh shim [zsh|bash]` and lives in exactly one place in the repo; `doctor.sh --fix` consumes that output rather than carrying its own copy.
- `doctor.sh` with no flags keeps its current contract verbatim: warn-only, always exits 0, safe to auto-run from `prepare`. `--fix` is user-invoked only and never runs unattended.
- `--fix` writes to the shell rc append-only, inside `# >>> wtree shim >>>` / `# <<< wtree shim <<<` markers, after backing up to `<rcfile>.bak`; updates replace between markers, never blind-`sed`. Append-only is also correct load-order, landing the block after `source $ZSH/oh-my-zsh.sh`.
- `--fix` creates the rc file when absent — a fresh macOS has zsh as login shell and no `~/.zshrc` on disk.
- `--fix` resolves the target rc from `$SHELL` (the login shell), not `$0`, since the script runs under `#!/usr/bin/env bash` and `$0` always reports bash. macOS bash login shells read `~/.bash_profile`, not `~/.bashrc`.
- `--fix` refuses to install rather than shadow: if `command -v wtree` or `alias wtree` resolves, it errors out and says so. A shell function silently shadows a PATH binary, and `wt` was rejected as the command name precisely because several git-worktree CLIs (`raisedadead/wt`, `bwishan/wt`, `bkildow/wt-cli`, Worktrunk) ship a `wt` binary to exactly our user population.
- `--fix` is its own consent: it does not prompt per item, but prints every path it touched and tells the user the shim is absent from the current shell until `source` or a new tab.
- The installed shim block carries a comment inviting a rename, and is where a user sets `export WORKTREE_ROOT=...`.
- Scripts stay bash-3.2 compatible per CLAUDE.md: no associative arrays, no `mapfile`, no `${var,,}`.
- Root and `src/` copies of `worktree.sh` and `doctor.sh` stay byte-identical twins, matching the convention `CLAUDE.md:79` states for the current gwt pair.

## Acceptance criteria

- [x] With `WORKTREE_ROOT` unset, `scripts/worktree.sh add feature/x` creates the worktree under `$HOME/.git-worktrees/<project>/feature/x` and `~/Code` is not created (verified against a throwaway repo with `HOME` pointed at a scratch dir).
- [x] With `WORKTREE_ROOT=$HOME/Code/.worktrees` exported, the existing `ai_js_starter/feature/worktree-checkpoint` worktree still resolves and `worktree.sh list` shows it.
- [ ] `scripts/worktree.sh add --no-open feature/x` copies `.env.local`, runs `pnpm install`, and launches no editor; without the flag, Zed launches when on PATH. Current `gwt-add.sh` behavior is otherwise unchanged. (Env copy, install, `--no-open` suppression, and the zed-absent warning branch are all proven; the live `zed "$target"` launch is deferred to the human QA gate rather than claimed.)
- [x] `cd "$(scripts/worktree.sh path feature/x)"` lands in the worktree from a shell with no shim installed, in both bash 3.2 and zsh.
- [x] `scripts/worktree.sh path` with no argument renders the picker on stderr and emits only the chosen path on stdout, such that the `cd "$( … )"` form above works interactively.
- [x] Bare `wtree` in a fresh terminal lists the current repo's worktrees (including `main`), accepts a number, and leaves the shell in that directory; it works from a subdirectory and from inside another worktree.
- [ ] `scripts/doctor.sh` with no flags still exits 0 on a machine with missing binaries and prints only warnings.
- [ ] `scripts/doctor.sh --fix` on a scratch `HOME` with no `.zshrc` creates the file, writes the marker block, and backs up nothing (no prior file); run twice, it does not duplicate the block.
- [ ] `scripts/doctor.sh --fix` with a `wtree` function or binary already resolving exits non-zero without writing.
- [ ] `scripts/doctor.sh --fix --dry-run` prints the intended diff and writes nothing.
- [ ] No file in either layer references `gwt-add.sh`, `gwt-remove.sh`, or a hardcoded `~/Code/.worktrees` (verified by grep across the repo).
- [ ] `pnpm format:check` passes.

## Dependencies

None external. Two actions on the author's machine, outside the repo, gated on human QA: delete `~/.oh-my-zsh/custom/plugins/worktree/` and drop `worktree` from the `plugins=(...)` list in `~/.zshrc` (it defines `gwtadd`/`gwtremove`, a stale fork of these scripts carrying the `rev-parse --show-toplevel` bug the current scripts document at `gwt-add.sh:23-25`); then run `scripts/doctor.sh --fix` and add `export WORKTREE_ROOT="$HOME/Code/.worktrees"` to preserve the four existing projects' worktrees. Deleting the plugin strands `launchpad-master`, which has worktrees under `~/Code/.worktrees` and no `scripts/gwt-*.sh` of its own — accepted by explicit agreement.

## Risks / open questions

- [x] RESOLVED before slice 1: `select` inside command substitution proven under `/bin/bash` 3.2.57 — the menu and `PS3` go to stderr natively, stdout carries only the chosen path, and no explicit `>&2` redirect is needed. Verified in bash and zsh.
- [ ] Root layer currently has no `doctor.sh` (src-only) and root `package.json` `prepare` is `husky` alone. Adding the twin plus `husky && scripts/doctor.sh` is a small deliberate expansion of the root layer, taken so the author can install the shim from the repo he works in most. Revisit if it makes root/src drift harder to police.
- [ ] `worktree.sh path` parses `git worktree list --porcelain`; branch names containing spaces or unusual refs are untested. Slash-named branches are known-good (already handled by the existing prune loop).
- [ ] The `wtree` name is clear today by search and on this machine, but the namespace is contested generally. The refuse-rather-than-shadow check is the durable guard, not the name choice.
- [ ] `.git-worktrees` as default silently changes nothing for existing template users because none exist yet; the moment one does, this becomes a breaking default and needs a migration note.

## Design decisions

- **Two front doors, one script.** `scripts/worktree.sh` is the single implementation and the contract; the `wtree` shell function is a ~10-line shim that locates the script via `git rev-parse --show-toplevel` and delegates. The AI keeps the script path it already uses (it spawns subshells and never needs `cd`); the human gets a verb. Nothing in Claude Code changes — no hook is registered, and `EnterWorktree path:` remains an explicit AI tool call against a path the script already produced.
- **The shim is sugar, never a requirement.** `add`/`remove`/`list` are shell-agnostic and shimless. The entire tax on an unshimmed user is `cd "$(scripts/worktree.sh path)"` — uglier, not degraded, and it still opens the same picker.
- **Consolidation is forced by the Rule of Three.** `path` needs the same main-checkout resolution `gwt-add.sh:26` and `gwt-remove.sh:19` already duplicate; that is the third copy. One file, one `main_root` block, one root convention.
- **Naming follows audience, not symmetry.** `scripts/worktree.sh` is read once by someone orienting in the repo (clarity); `wtree` is typed daily (keystrokes); `WORKTREE_ROOT` is set once in an rc file (clarity, and deliberately outside git's reserved `GIT_*` namespace, where `GIT_WORK_TREE` already exists and means something else entirely).
- **`doctor.sh --fix`, not a second script.** `doctor.sh` already owns the prerequisite list and its five-language extension map. A separate setup script would fork that list and drift. Same knowledge, two modes: bare = diagnose (auto, warn-only, exit 0); `--fix` = remediate (manual, installs, can fail loudly). The `eslint` / `eslint --fix` split.
- **Root cause named:** the interview opened on worktree location and established it is not the lever. Location stays outside the repo, unchanged in shape; what changes is that the root becomes configurable and reachable.
- **Reference implementation:** `2026-07-16-feature-worktree-checkpoint.md` is the prior art for two-layer script + skill-chain changes, including its throwaway-repo validation approach and its fork-points discipline.

## Test strategy

This repo ships no test suite (no application code), so validation is behavioral plus format, mirroring the predecessor task's approach at its Test strategy section. Exercise `worktree.sh` (`add` with and without `--no-open`, `remove`, `path` with and without an argument, `list`, `shim zsh`, `shim bash`) against a throwaway git repo in the scratchpad with `HOME` and `WORKTREE_ROOT` pointed at scratch dirs, asserting worktree location, env copy, install, editor suppression, and stdout/stderr separation on `path`. Exercise `doctor.sh --fix` against a scratch `HOME` for the four rc cases: absent file, present file, second run (idempotent), and `wtree` already resolving (refusal). Run both scripts under `/bin/bash` explicitly, not just zsh, to hold the bash-3.2 floor. Verify skill and context file edits by full re-read for present-tense voice and coherence, plus the grep in the acceptance criteria. `pnpm format:check` across the repo. The interactive picker and the real rc-file install are human-QA'd on the author's machine after the scratch runs pass.

## Slices

- [x] `scripts/worktree.sh` in both layers: `add`/`remove`/`list`/`path` subcommands, `WORKTREE_ROOT` with the `$HOME/.git-worktrees` default, old `gwt-*.sh` deleted, smoke-tested against a throwaway repo — criteria 1 through 5.
- [x] `worktree.sh shim [zsh|bash]` emitting the `wtree` function, both layers — the shim text exists in one place and prints installable output. (The zsh and bash bodies turned out identical, so the shell argument guards — refusing fish — rather than varying the output. The shim resolves `worktree.sh` from the main checkout, not `rev-parse --show-toplevel`, so it survives being run from a worktree whose branch predates the script.)
- [ ] `doctor.sh --fix` (LSP install, shim install with marker/backup/create/idempotency/refusal, `--dry-run`), root-layer `doctor.sh` twin, root `prepare` wiring — criteria 7 through 10.
- [ ] Rewire the chain in both layers: `implement-task` step 2, skills README, `ship-pr` close, `CLAUDE.md` Git Control and Commands and Architecture, `project-init` Phase 4 scripts bullet, `fork-points.md` worktree section (the base-path fork point becomes "set `WORKTREE_ROOT`" rather than "edit the script") — criterion 11.
