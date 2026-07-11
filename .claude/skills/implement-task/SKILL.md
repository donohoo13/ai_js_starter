---
name: implement-task
description: Build a scoped task file from docs/tasks/ slice by slice — guard a non-main branch, deep-plan each slice, implement it with /tdd, validate, commit per slice, and keep the task file's checkboxes and status current (scoped → in-progress → done), ending with a review-board offer and stopping before any push or PR. Use when the user points at a task file to build, says "implement this task", "pick up the task we scoped", "build the scoped task", or resumes scoped work in a fresh session.
argument-hint: '[path to a docs/tasks/*.md file, or blank to pick from scoped tasks]'
---

# Implement Task

Build what a scoped task file specifies — the design is settled; this skill builds it, it does not re-decide architecture. **Ceremony scales with size; engineering discipline never does:** a single-unit task runs the same plan → tdd → validate → commit loop as a ten-slice feature, exactly once.

## 1. Locate and gate the task

- Path in `$ARGUMENTS` → read it. No path → list `docs/tasks/` files with `status: scoped` (plus any `in-progress` — those are resumable) and confirm which one.
- Gate on readiness, not ceremony: `status: scoped` with concrete acceptance criteria means go. A file still `captured`, or with `TBD (needs grilling)` in load-bearing sections (Requirements, Acceptance criteria, Design decisions), is not buildable — recommend a `/grill-me engineer:` session on the file first and stop. Building on an under-specified file is how requirements get invented silently.

## 2. Guard the branch

`git branch --show-current` — never build on `main`; ask the user to create or pick a feature branch and wait. Trust whatever non-main branch they choose.

## 3. The slice loop

Slices come from the file's Slices section; list order is build order (dependency-ordered at scoping time). No Slices section → the whole task is one work unit; run the loop once with the file's Design decisions and Acceptance criteria as the spec. Flip frontmatter to `status: in-progress` before starting (it rides along in the first slice's commit).

Each slice ends in one of three states. The first two continue automatically; only the third stops you:

- **DONE** — validated and committed; next slice.
- **DONE_WITH_CONCERNS** — committed, but with a doubt worth surfacing (e.g. an ambiguous requirement you resolved one way); note it in your running summary and continue.
- **BLOCKED** — missing context, contradictory requirements, or a failure you cannot root-cause; stop, surface it, wait. If the task file itself is wrong or insufficient, that is also BLOCKED — surface it, do not silently redesign.

For each slice:

1. **Deep plan** — a focused read-in, not a fresh design: re-read the slice against the file's Design decisions and Test strategy, read the touch points' current code, confirm shared types/schemas and their consumers (LSP findReferences). Present a short plan — files, sequence, test seams, risks — and state "Proceeding unless you interrupt." A window to course-correct, not an approval gate. A slice with a user-facing surface also loads the `frontend-design` skill here; it grounds the plan in `BRAND_DESIGN.md` / `UI_UX.md` and its quality floor carries through the build.
2. **Build with `/tdd`** — red before green, one seam at a time.
3. **Validate** — the project's own typecheck (where the stack has one), lint, and format checks, plus the slice's test files. Every language has its way to lint, format, and test; discover the actual commands from the root `CLAUDE.md` and the project's manifest or config rather than assuming a toolchain — the flow here is the same regardless of stack. Run the cheap checks and single test files regularly while building, not just at the slice boundary — feedback is most useful when it is one edit old, not one slice old. Do not run the full test suite here; it is slow and its job comes once, at the end of the task. Fix iteratively until clean.
4. **Commit** — verify the branch again, stage by explicit path (the slice's files plus the updated task file with its checkboxes ticked), commit with a message naming the slice's behavior.
5. **Completeness audit** — after multi-file changes: schemas, constant maps/enums, and import references updated consistently.

## 4. Land

All slices DONE and every acceptance criterion checked: run the full test suite once — its first and only run, there to catch cross-slice regressions that single-file runs cannot see. A failure here is a real regression: fix it (and amend or commit the fix) before proceeding. Suite green → flip `status: done` (include it in the final commit). Then one question: run `/review-board` before shipping? Recommend yes for anything non-trivial — author overconfidence is exactly what the board exists to catch. After the user's call, stop. Pushing and `gh pr create` are the user's moves, when they choose.

Never push, never open a PR, never create GitHub issues. The task file is the tracker; git history — one commit per slice — is the audit trail.
