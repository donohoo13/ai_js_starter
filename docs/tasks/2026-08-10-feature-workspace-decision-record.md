---
type: feature
status: captured
created: 2026-08-10
---

# Give implement-task's workspace decision a durable record

## Context

Surfaced as finding FLW-1 by the review board on the v2.8.0 branch (`bug/issue-42-payload-gaps`). That release restated `implement-task`'s Fallback section so a declined worktree confirm is settled and "stands for the whole task". The board's point is that the sentence has no producer: nothing writes the decision anywhere a later session can read, and the only durable surface a task carries is its own file. The board fixed the narrow symptom in v2.8.0 — a main checkout parked on this task's own branch is now explicitly not an obstruction to clear — and captured the underlying gap, because closing it properly touches the task-file schema, which is three skills' worth of change rather than a clause. Full board report at `.ai/review/2026-08-10-issue-42-payload-gaps.md`.

## Problem

`implement-task` decides where a task gets built — a dedicated worktree, or a plain feature branch after a declined confirm — and that decision survives only in the session that made it. Current behaviour: session 1 asks the Step 4 confirm, the user declines, the build runs in the main checkout on a feature branch, and slices land there. Session 2 resumes the same `status: in-progress` file, re-derives the branch at Step 1, finds no worktree at Step 2, and puts the same confirm again at Step 4, because no key in `capture-task/assets/task-template.md` and no line in `implement-task` records what was decided. The user answers the same question twice, and a user who answers differently the second time splits one task across two workspaces. Desired behaviour is that a resuming session reads the prior workspace decision and does not re-ask, with the user able to change it deliberately rather than by re-answering a question they thought they had settled. The v2.8.0 parked-checkout carve-out keeps the bad case from being actively harmful; it does not make the decision readable.

## Scope

- In scope (must-have): decide where a workspace decision is recorded; decide whether a resuming session re-asks, reports and proceeds, or offers a change; land the answer across `capture-task/assets/task-template.md`, `implement-task/SKILL.md`, and whatever else the schema touches.
- Nice to have: the same record covering an `EnterWorktree` failure that forced the fallback, so a resuming session knows the fallback was involuntary.
- Out of scope (non-goals, named so the task does not expand silently): the settled-versus-detour distinction v2.8.0 landed, which this task inherits rather than revisits; any change to how the worktree itself is created or removed; `gwt-add.sh` and `gwt-remove.sh`.

## Requirements

- The task file is the tracker and the only artifact that survives a session, so any record lands there unless the grilling session finds a better home and says why.
- `grill-engineer`'s spec-it exit is the only writer of task-file frontmatter keys today, and `implement-task` owns only the `status` transitions — a workspace key written by the build session breaks that division and needs an explicit decision rather than an accident.
- `implement-task`'s gates check only that a key exists, never whether its reasoning convinces; a workspace key should not become a fourth gate that refuses a build.
- `capture-task` omits scoped keys at capture, so a workspace key must have a defined absent state that a fresh task legitimately carries.
- Instances that moved task files into an external tracker adapt the record wherever their equivalent lives, so the shape stays prose-adaptable rather than schema-rigid.

## Acceptance criteria

- [ ] A resumed task whose first session declined the worktree confirm does not put that confirm again unprompted.
- [ ] The user can change the workspace decision on a resume, deliberately rather than by re-answering.
- [ ] The absent state is defined and legal for a task that has never been built.
- [ ] Whatever writes the record is named, and it does not silently break the rule that `grill-engineer` writes frontmatter and `implement-task` writes status.
- [ ] `.claude/skills/README.md`'s `implement-task` blurb and `project-init/references/fork-points.md` reflect the change where it touches a coupling.

## Dependencies

None blocking. Builds on the v2.8.0 Fallback restatement, which lands on the branch this was captured from.

## Risks / open questions

- [ ] Is this frontmatter, a line in an existing section, or something `implement-task` writes into the Demolition-style prose region? Frontmatter is machine-readable and invites a gate; prose is adaptable and invites drift.
- [ ] Does the record need to survive at all, or is re-asking the confirm on a resume actually correct — a fresh session in a changed environment may legitimately reach a different answer, and one extra question is cheap.
- [ ] Should an involuntary fallback (an `EnterWorktree` failure) be distinguishable from a declined one? They imply different things about whether a resume should retry the worktree.
- [ ] Does the same problem exist for other decisions a build session makes and never records, and if so is this one key or a general "session decisions" section?
- [ ] What does a resumed task do when the recorded workspace no longer exists — a worktree the user removed, or a branch that was merged and deleted?
