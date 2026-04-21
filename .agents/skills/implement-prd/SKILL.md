---
name: implement-prd
description: Implement a PRD's sub-issues in dependency order using TDD. Topologically sorts sub-issues, implements each with /tdd, runs /requesting-code-review, creates PR via /gh-cli.
argument-hint: '[github-issue-number]'
disable-model-invocation: true
---

# Implement PRD

Orchestrate implementation of a PRD's sub-issues in topological (dependency) order using TDD.

## Step 1: Locate PRD + Sub-Issues

Check in order:

1. **Already in context** — PRD and sub-issues from `/write-a-prd` → `/prd-to-issues` pipeline. Use directly, skip API calls.
2. **`$ARGUMENTS` provided** — user passed parent issue number (e.g. `/implement-prd 42`). Fetch via GraphQL.
3. **Neither** — ask user for parent PRD issue number, then fetch.

**Fetching** (only when sub-issues NOT already in context):

Invoke `/gh-cli` to fetch the PRD and its sub-issues. Request fields: `id`, `number`, `title`, `body`, `state`, `issueType`, `blockedBy` (first 20), `blocking` (first 20), `subIssues` (first 50). Closed sub-issues = already completed.

### No-sub-issues fallback

If the fetched PRD has **zero open sub-issues**, fall through to single-work-unit mode:

- Skip Step 2 (Topological Sort) entirely.
- In Step 5, treat the parent PRD body (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions) as the single work unit's acceptance criteria.
- Still run Step 3 (Guard Branch), Step 4 (informational order — just show the PRD as the single item), Step 5b (Deep Plan), 5c (TDD), 5d (Validate), 5e (Commit), Step 6 (Review), Step 7 (Create PR).
- Step 5e commit message closes the parent PRD directly: `Closes #<prd-number>`.
- Step 7 PR `Related Issues` references the PRD as the closer, not a parent.

## Step 2: Topological Sort

Build dependency graph from `blockedBy` relationships. Kahn's algorithm:

1. Build adjacency list from `blockedBy`
2. Compute in-degree per issue
3. Start with in-degree 0 issues
4. Dequeue → add to ordered list → decrement in-degree of issues it blocks
5. Repeat until queue empty

Cycle detected if issues remain after queue empties — report and **stop**.

Same topological level: prefer AFK issues before HITL issues.

## Step 3: Guard Branch

Verify not on `main`:

```bash
git branch --show-current
```

If on `main` — ask user to create/checkout a feature branch first. **Do not proceed on main.**

Trust whatever non-main branch the user is on unless otherwise specified.

## Step 4: Show Implementation Order

Display ordered list (informational, not an approval gate):

```
Implementation order for PRD #N: <title>

1. #101 - Schema migration (AFK) [no blockers]
2. #102 - API endpoints (AFK) [blocked by #101]
3. #103 - UI components (HITL) [blocked by #102]
...
```

Proceed immediately.

## Step 5: Implement Each Sub-Issue

For each sub-issue in topological order:

### 5a. Skip Check

If issue is closed/completed on GitHub, skip it.

### 5b. Deep Plan

**Complete all exploration before presenting plan. Do NOT skip to design.** Scale exploration depth to issue complexity.

#### 5b-i. Explore

Read issue body and acceptance criteria. Explore codebase silently (do not narrate each file read):

1. **Reference implementation** — find 1-2 similar features already implemented. Read full vertical slice (schema → validation → service → controller → UI route/component).
2. **Touch points** — identify every file needing changes. Read current contents, note existing interfaces/types/signatures.
3. **Shared code** — search `@talon/validation`, `@talon/types`, `@talon/utils` for reusable schemas/types/helpers.
4. **Schema impact** — if DB changes involved, read current schema files, understand relationships/indexes/constraints/migration patterns.
5. **Test infrastructure** — find existing test files for the area. Understand test helpers, fixtures, mocking patterns.
6. **Reference checks** — use LSP `findReferences` on shared types, Zod schemas, utility functions being modified to identify all consumers.

#### 5b-ii. Analyze

ultrathink: Synthesize exploration findings. Consider:

- Closest existing feature to use as template
- Full dependency chain of changes
- Cross-cutting concerns (permissions, multi-tenancy, error handling)
- Risks/ambiguities in requirements
- Change order to keep codebase compiling at each step

#### 5b-iii. Present Plan

Show the user a summary:

- Reference implementation being followed
- Files to modify/create (table)
- Implementation sequence
- Test strategy
- Risks/open questions

State: **"Proceeding unless you interrupt."** — not an approval gate, but gives user a window to course-correct.

### 5c. Implement with TDD

Invoke `/tdd` for implementation.

### 5d. Validate

```bash
pnpm typecheck && pnpm lint
```

If either fails, fix iteratively until clean.

### 5e. Commit

Verify branch, stage specific files, commit:

```bash
git branch --show-current  # must NOT be main
git add <specific files>
git commit -m "<concise message>

Closes #<sub-issue-number>"
```

### 5f. Completeness Audit

After multi-file changes: check all Zod schemas, constant maps/enums, import references updated consistently.

### 5g. Next

Return to 5a with next sub-issue.

## Step 6: Review

After all sub-issues implemented, invoke `/requesting-code-review`. Assemble context for the reviewer subagent:

- Parent PRD issue body
- Each completed sub-issue's title + acceptance criteria
- Instructions to read `CLAUDE.md` and `DESIGN_PRINCIPLES.md`
- Base/head SHAs from `git rev-parse` (per `/requesting-code-review` pattern)
- `WHAT_WAS_IMPLEMENTED`: summary of all sub-issues delivered
- `PLAN_OR_REQUIREMENTS`: the PRD itself

Relay findings. Fix any **Critical** or **Important** items before Step 7. Re-run `pnpm typecheck && pnpm lint` after fixes.

## Step 7: Create PR

Push branch, then invoke `/gh-cli` to create the PR:

```bash
git push -u origin $(git branch --show-current)
```

`/gh-cli` args: `--title "<PRD title>"`, `--assignee @me`, `--body` using the template below.

```
## Description

<2-3 sentences on what changed and why, referencing the PRD>

## Type of Change

- [ ] Bug fix
- [x] New feature
- [ ] Refactoring
- [ ] Other

## Related Issues

Closes #<sub-1>, closes #<sub-2>, closes #<sub-3>
Parent PRD: #<prd-number>

## Changes Made

<bullet points grouped by area: Schema, Validation, API, UI, Tests>

## Deployment Notes

<migrations, new env vars, breaking changes — or "None">
```

## Step 8: Summary

Report: N sub-issues implemented, PR URL.

Do NOT close parent PRD issue — PR closes sub-issues via commit messages when merged.

## Important Rules

- NEVER commit to main. Verify branch before every commit.
- NEVER force push.
- Run `pnpm typecheck && pnpm lint` after every sub-issue.
- Follow CLAUDE.md and DESIGN_PRINCIPLES.md for all code standards.
- Completeness audit after multi-file changes.
- `/requesting-code-review` must run before creating PR.

$ARGUMENTS
