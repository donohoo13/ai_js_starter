---
type: feature
status: in-progress
created: 2026-07-16
---

# Add worktree checkpoint to implement-task for parallel-session safety

## Context

Parallel Claude Code sessions in one checkout clobber each other: branch switches are checkout-global, so one session's `git switch` yanks the tree out from under another mid-edit. Grilled 2026-07-16; the pain is real in both layers (destination projects and this meta-repo). Detection-before-action was rejected as a TOCTOU race; isolation by default won.

## Problem

`implement-task` step 2 today asks the user to create or pick a feature branch in the shared checkout — the only branch-switching skill in the chain, and therefore the source of the cross-session branch clobbering. Desired: step 2 moves the session into a dedicated git worktree (via `scripts/gwt-add.sh` + the native `EnterWorktree` tool) so the main checkout stays permanently pinned to `main`, and `project-init` knows how to tailor the worktree tooling to destination projects.

## Scope

- In scope (must-have): `--no-open` flag on `gwt-add.sh`; root-layer copies of both gwt scripts; `implement-task` step 2 rewrite in both layers; CLAUDE.md Git Control worktree rule in both layers; `ship-pr` post-merge cleanup pointer in both layers; skills README updates in both layers; `fork-points.md` worktree section + drift grep extension; one-line `project-init` Phase 4 scripts-bullet addition.
- Nice to have: `gwt-remove.sh` prunes empty parent dirs left by slash-named branches (`feature/foo` nests).
- Out of scope (non-goals, named so the task does not expand silently): isolating grill-engineer's build-now path (accepted residual: same-file edits on main, covered by `stage-for-commit`'s collision flagging; extend later if it bites); any detect-other-session heuristics or branch-guard hooks; auto-running `gwt-remove.sh` from any skill; changes to `stage-for-commit`.

## Requirements

- Isolation policy: only `implement-task` isolates — it is the chain's sole branch-switcher, so worktree-izing it pins the main checkout to `main` and kills the branch-clobbering class entirely.
- Checkpoint is worktree-by-default with exactly one HITL confirm; declining falls back to the current ask-for-a-branch behavior (escape hatch, not a soft default).
- Branch name derives from the task filename: `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` → `<type>/<slug>`.
- Resume: a worktree already existing for the branch is re-entered (`EnterWorktree path:`), never recreated.
- Script and native tool compose, never compete: `gwt-add.sh` owns machine setup (worktree creation, env copy, install), `EnterWorktree path:` owns session relocation (cwd, memory/plans re-anchoring, unmerged-work protection at exit).
- `EnterWorktree`'s usage gate ("only when user or CLAUDE.md/memory instructions direct it") is satisfied by an explicit CLAUDE.md Git Control rule in both layers.
- Teardown stays human-owned: cleanup is post-merge and therefore out-of-session; no skill ever invokes `gwt-remove.sh`; `ship-pr` names the command once at close.
- Layer parity: scripts and skill text are byte-identical between root and `src/` (project+template sync).
- Any coupling this change adds (worktree root path, Zed, pnpm, env-file list) is manifested in `fork-points.md` in the same change, per that file's maintenance contract.

## Acceptance criteria

- [x] `gwt-add.sh --no-open <branch>` creates the worktree, copies `.env.local`, runs `pnpm install`, and never launches Zed; without the flag, current behavior is unchanged (verified against a throwaway git repo).
- [x] Root `scripts/gwt-add.sh` and `scripts/gwt-remove.sh` exist and are byte-identical to the `src/scripts/` pair.
- [ ] `implement-task` (both layers) at step 2 proposes branch `<type>/<slug>` and the worktree target, asks one confirm, then runs the script and relocates via `EnterWorktree path:`; the session's working directory afterward is the worktree.
- [ ] Declining the confirm falls back to the old flow: user names a plain branch in the checkout, build proceeds there.
- [ ] Re-invoking `implement-task` for a task whose worktree already exists re-enters it instead of failing or duplicating.
- [ ] `ship-pr` (both layers), when the session is in a worktree, closes its URL report with the one-line post-merge pointer to `scripts/gwt-remove.sh <branch>` run from the main checkout.
- [ ] CLAUDE.md Git Control (both layers) states the worktree rule in strict present tense.
- [ ] `fork-points.md` gains a worktree-isolation section (path convention, Zed, pnpm, env-file list, implement-task dependency, revert lever) and the infra drift grep matches `worktree|gwt|zed`.
- [ ] `pnpm format:check` passes.

## Dependencies

None external; composes the existing gwt scripts with Claude Code's native `EnterWorktree`/`ExitWorktree` tools.

## Risks / open questions

- [ ] `EnterWorktree` is a harness tool, not a shell command — sessions outside Claude Code (or agents with pinned cwd restricted to `.claude/worktrees/`) cannot use the `path:` entry into `~/Code/.worktrees`; the decline-path escape hatch is the fallback, and the skill text must not assume the tool exists unconditionally.
- [ ] `gwt-add.sh` branches from the invoking checkout's HEAD; the policy pins that checkout to `main`, but a checkout left on a stale branch by pre-adoption habits would seed the worktree wrong — the skill's step 2 verifies the checkout is on `main` before running the script.
- [ ] Slash-named branches nest directories under the worktree root; `gwt-remove.sh` removes the leaf and may strand empty parents (nice-to-have cleanup).

## Design decisions

- Checkpoint contract (implement-task step 2, "guard the workspace"): derive `<type>/<slug>` from the task filename; one confirm naming the exact worktree path; on yes run `scripts/gwt-add.sh --no-open <branch>` then `EnterWorktree` with `path` set to the created worktree; on no, the current ask-for-a-branch flow verbatim; if `git worktree list` already shows the branch's worktree, skip creation and enter it directly. Slice loop, commit flow, and land phase are untouched — they run identically inside the worktree.
- Script/native split: the script is the machine-setup seam (env, install, human `zed` launch), the native tool is the session seam (true cwd relocation instead of fragile per-Bash `cd`, exit-time unmerged-work protection). Neither absorbs the other's job.
- `--no-open` is a flag, not an env var: visible in `Usage`, greppable, and the human default (Zed opens) stays untouched.
- Teardown asymmetry is deliberate: `EnterWorktree path:`-entered worktrees are not removable by `ExitWorktree`, which matches the ownership model — the script created it, the human removes it post-merge with `gwt-remove.sh`.
- project-init integration is config-first per its own operating principles: the `fork-points.md` section is the mechanism (Phase 1 reads it, Phase 4 applies it); tailoring levers are the editor (`zed`), install command (`pnpm install`), env-file list (`.env.local`), worktree root (`~/Code/.worktrees/<project>`), and reverting step 2 to the branch dance where a destination drops the scripts. One line joins `gwt-add.sh`/`gwt-remove.sh` to the Phase 4 scripts bullet beside `doctor.sh`.
- CLAUDE.md rule (both layers, Git Control): `implement-task` builds run in a git worktree created by `scripts/gwt-add.sh`; this line doubles as the instruction that legitimizes the native `EnterWorktree` tool under its usage gate.

## Test strategy

This repo ships no test suite (no application code), so validation is behavioral + format: exercise `gwt-add.sh`/`gwt-remove.sh` (with and without `--no-open`) against a throwaway git repo in the scratchpad and assert worktree existence, env copy, install, and no-editor-launch; verify skill-file edits by full re-read for present-tense voice and coherence; `pnpm format:check` across the repo. The checkpoint's interactive flow (confirm, decline, resume) is human-QA'd by invoking `/implement-task` on this very task file's successor work.

## Slices

- [x] Scripts: `--no-open` flag in `src/scripts/gwt-add.sh`, byte-identical copies of both scripts at root `scripts/`, smoke-tested against a throwaway repo — criteria 1, 2, and the slash-branch nice-to-have if trivial.
- [ ] Checkpoint: `implement-task` step 2 rewrite + CLAUDE.md Git Control rule + skills README rows, both layers — criteria 3, 4, 5, 7.
- [ ] Cleanup pointer: `ship-pr` close gains the conditional `gwt-remove.sh` line, both layers — criterion 6.
- [ ] Manifest: `fork-points.md` worktree section, drift grep extension, `project-init` Phase 4 scripts-bullet line — criterion 8.
