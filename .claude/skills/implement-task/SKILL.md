---
name: implement-task
description: Build a scoped task file from docs/tasks/ slice by slice in a dedicated git worktree (or a non-main branch) — plan, TDD, validate, and commit each slice, keep the task file's status current, and gate done on human QA — never pushing or opening a PR itself. Use when the user points at a task file to build, says "implement this task", "pick up the task we scoped", "build the scoped task", or resumes scoped work in a fresh session.
argument-hint: '[path to a docs/tasks/*.md file, or blank to pick from scoped tasks]'
---

# Implement Task

Build what a scoped task file specifies — the design is settled; this skill builds it, it does not re-decide architecture. **Ceremony scales with size; engineering discipline never does:** a single-unit task runs the same plan → tdd → validate → commit loop as a ten-slice feature, exactly once.

## State at invocation

- Current branch: !`git branch --show-current`
- Scoped tasks: !`grep -l 'status: scoped' docs/tasks/*.md 2>/dev/null || echo "(none)"`
- In-progress tasks (resumable): !`grep -l 'status: in-progress' docs/tasks/*.md 2>/dev/null || echo "(none)"`

Snapshots are from invocation time; re-check live state after any pause or user action.

## 1. Locate and gate the task

- Path in `$ARGUMENTS` → read it. No path → confirm which of the scoped tasks in the snapshot above to build (in-progress ones are resumable).
- Gate on readiness, not ceremony: `status: scoped` with concrete acceptance criteria means go. A file still `captured`, or with `TBD (needs grilling)` in load-bearing sections (Requirements, Acceptance criteria, Design decisions), is not buildable — recommend a `/grill-me engineer:` session on the file first and stop. Building on an under-specified file is how requirements get invented silently.

## 2. Guard the workspace

Never build on `main`, and never switch branches in a shared checkout — branch state is checkout-global, so a switch here yanks the tree out from under every other session working in it. The default workspace is a dedicated worktree:

1. Derive the branch from the task filename: `docs/tasks/YYYY-MM-DD-<type>-<slug>.md` → `<type>/<slug>`.
2. Resume case: `git worktree list` already shows that branch's worktree → enter it with `EnterWorktree` (`path:` pointing at it) and continue; never recreate.
3. Otherwise, one confirm naming the branch and the worktree target (`$HOME/Code/.worktrees/<project>/<branch>` with branch slashes flattened to dashes: `feature/foo` → `feature-foo`). On yes: verify the checkout is on `main` (a checkout parked on another branch seeds the worktree from the wrong tree — surface it and wait), run `scripts/gwt-add.sh --no-open <branch>`, then enter via `EnterWorktree` (`path:` the created worktree). This step is the project instruction that authorizes the `EnterWorktree` tool.
4. Carry the tracker in: the task file (and often its whole `docs/tasks/` directory) is untracked in the main checkout, so it does not exist on the fresh branch — `mkdir -p docs/tasks` in the worktree and move the file over before the slice loop.

Declining the confirm is the escape hatch: the user creates or picks a feature branch in the checkout and the build proceeds there — trust whatever non-main branch they choose. The same fallback applies where `scripts/gwt-add.sh` or the `EnterWorktree` tool is unavailable. Teardown is never this skill's job: post-merge cleanup is `scripts/gwt-remove.sh <branch>`, run by the user from the main checkout.

## 3. The slice loop

Slices come from the file's Slices section; list order is build order (dependency-ordered at scoping time). No Slices section → the whole task is one work unit; run the loop once with the file's Design decisions and Acceptance criteria as the spec. Flip frontmatter to `status: in-progress` before starting (it rides along in the first slice's commit).

Each slice ends in one of three states. The first two continue automatically; only the third stops you:

- **DONE** — validated and committed; next slice.
- **DONE_WITH_CONCERNS** — committed, but with a doubt worth surfacing (e.g. an ambiguous requirement you resolved one way); note it in your running summary and continue.
- **BLOCKED** — missing context, contradictory requirements, or a failure you cannot root-cause; stop, surface it, wait. If the task file itself is wrong or insufficient, that is also BLOCKED — surface it, do not silently redesign.

For each slice:

1. **Deep plan** — a focused read-in, not a fresh design: re-read the slice against the file's Design decisions and Test strategy, read the touch points' current code, confirm shared types/schemas and their consumers (LSP findReferences). Present a short plan — files, sequence, test seams, risks — and state "Proceeding unless you interrupt." A window to course-correct, not an approval gate. Any slice that renders or restyles something a user sees — a page, view, component, email, state, or copy — loads the `frontend-design` skill here before planning the build; it grounds the plan in `BRAND_DESIGN.md` / `UI_UX.md` and carries its quality floor through the build. Skipping it is how UI ships to a generic default instead of this project's design language. A slice that changes skill files (anything under `.claude/skills/`) loads the `skill-creator` skill here the same way — its authoring discipline, gut-check handoff, and landing checklist govern the edit.
2. **Build with `/tdd`** — red before green, one seam at a time.
3. **Validate** — the project's own typecheck (where the stack has one), lint, and format checks, plus the slice's test files. Every language has its way to lint, format, and test; discover the actual commands from the root `CLAUDE.md` and the project's manifest or config rather than assuming a toolchain — the flow here is the same regardless of stack. Run the cheap checks and single test files regularly while building, not just at the slice boundary — feedback is most useful when it is one edit old, not one slice old. Do not run the full test suite here; it is slow and its job comes once, at the end of the task. Fix iteratively until clean.
4. **Commit** — verify the branch again, stage by explicit path (the slice's files plus the updated task file with its checkboxes ticked), commit with a message naming the slice's behavior.
5. **Completeness audit** — after multi-file changes: schemas, constant maps/enums, and import references updated consistently.

## 4. Land

All slices DONE and every acceptance criterion checked: run the full test suite once — its first and only run, there to catch cross-slice regressions that single-file runs cannot see. A failure here is a real regression: fix it (and amend or commit the fix) before proceeding.

Suite green → one **shape check**: if the task added a module, moved a boundary, changed a data flow, or rewired a dependency between contexts, update the owning `ARCHITECTURE.md` (and the root doc if cross-context topology moved) per the domain-modeling skill's `ARCHITECTURE-FORMAT.md` and commit it — a shape change that ships without its doc update is how the map starts lying. No `ARCHITECTURE.md` yet means create it with that one shape-fact, per the format doc's growth rule: a one-fact doc is valid, a stub is not. No shape change, no edit.

Shape current → **human QA gate**. Hand the user a QA script — the exact commands to run, URLs to visit, and actions to take to see the change in action, with what they should observe mapped to the acceptance criteria — then stop and wait for their verdict. Instructions only: do not start servers or drive the app for them. A green suite proves the code does what the tests say; only the user can confirm it does what they meant, and this gate is where that feedback belongs — the task is not complete, and nothing downstream gets recommended, until they have seen it work. Issues they surface run back through the slice loop (fix, validate, commit), then hand back an updated QA script.

QA confirmed → flip `status: done` and commit the flip. Then one question: run `/review-board` before shipping? Recommend yes for anything non-trivial — author overconfidence is exactly what the board exists to catch. Alongside that question, name any capture candidates the build surfaced (`/codify` conventions, `/capture-task` asides) so they land or get declined before anything ships — post-ship suggestions force follow-up commits on a branch the user wants merged and done (ship-pr's pre-flight is the backstop, but earlier is better since the review board may add more). After the review-board call resolves (run, or declined), close with a one-line `/ship-pr` offer when the repo has a remote — offer only, never invoked on your own — and stop.

Never push or open a PR from this skill — `/ship-pr`, on the user's word, is the only door to the remote. Never create GitHub issues. The task file is the tracker; git history — one commit per slice — is the audit trail.
