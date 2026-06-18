---
name: implement-prd
description: Implement a PRD's sub-issues in dependency order using TDD. Topologically sorts sub-issues, implements each with /tdd, then hands off to /ship-pr for the draft PR, SOC2 review loop, and CI watch.
argument-hint: '[github-issue-number]'
---

# Implement PRD

Orchestrate implementation of a PRD's sub-issues in topological (dependency)
order using TDD, then hand the committed branch to `/ship-pr` to take it
through the org's PR process.

## Step 1: Locate PRD + Sub-Issues

Check in order:

1. **Already in context** - PRD and sub-issues from `/write-a-prd` →
   `/prd-to-issues` pipeline. Use directly, skip API calls.
2. **`$ARGUMENTS` provided** - user passed parent issue number (e.g.
   `/implement-prd 42`). Fetch via GraphQL.
3. **Neither** - ask user for parent PRD issue number, then fetch.

**Fetching** (only when sub-issues NOT already in context):

Invoke `/gh-cli` to fetch the PRD and its sub-issues. Request fields: `id`,
`number`, `title`, `body`, `state`, `issueType`, `blockedBy` (first 20),
`blocking` (first 20), `subIssues` (first 50). Closed sub-issues = already
completed.

### No-sub-issues fallback

If the fetched PRD has **zero open sub-issues**, fall through to
single-work-unit mode:

- Skip Step 2 (Topological Sort) entirely.
- In Step 5, treat the parent PRD body (Problem Statement, Solution, User
  Stories, Implementation Decisions, Testing Decisions) as the single work
  unit's acceptance criteria.
- Still run Step 3 (Guard Branch), Step 4 (informational order - just show
  the PRD as the single item), the Step 5 sub-issue loop (one iteration),
  Step 6 (Ship the PR), and Step 7 (Report).
- The single commit in Step 5e closes the parent PRD directly:
  `Closes #<prd-number>`.

## Step 2: Topological Sort

Build dependency graph from `blockedBy` relationships. Kahn's algorithm:

1. Build adjacency list from `blockedBy`
2. Compute in-degree per issue
3. Start with in-degree 0 issues
4. Dequeue → add to ordered list → decrement in-degree of issues it blocks
5. Repeat until queue empty

Cycle detected if issues remain after queue empties - report and **stop**.

Same topological level: prefer AFK issues before HITL issues.

## Step 3: Guard Branch

Verify not on `main`:

```bash
git branch --show-current
```

If on `main` - ask user to create/checkout a feature branch first. **Do not
proceed on main.**

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

For each sub-issue in topological order, run the loop body 5a–5g:

Each sub-issue ends in one of three states. Continue automatically on the
first two; only the third stops you:

- **DONE** - validated and committed; proceed to the next sub-issue.
- **DONE_WITH_CONCERNS** - committed, but you have a doubt (e.g. an ambiguous
  requirement you resolved one way). Note it in your running summary and
  proceed; do not stop.
- **BLOCKED** - you cannot complete it: missing context, contradictory
  requirements, or a failure you cannot root-cause. Stop, surface the blocker
  to the user, and wait. This is the only reason to break isolation mid-PRD.
  For a failure you cannot diagnose, run `/diagnose` first; if 3+ hypotheses
  fail, that is itself the BLOCKED signal.

### 5a. Skip Check

If issue is closed/completed on GitHub, skip it.

### 5b. Deep Plan

**Complete all exploration before presenting a plan. Do NOT skip to design.**
Scale exploration depth to issue complexity.

**Explore** - read the issue body and acceptance criteria, then explore the
codebase silently (do not narrate each file read):

1. **Reference implementation** - find 1-2 similar features already
   implemented. Read the full vertical slice (schema → validation → service →
   controller → UI route/component).
2. **Touch points** - identify every file needing changes. Read current
   contents, note existing interfaces/types/signatures.
3. **Shared code** - search `@oneview/validation`, `@oneview/types`,
   `@oneview/utils` for reusable schemas/types/helpers.
4. **Schema impact** - if DB changes involved, read current schema files,
   understand relationships/indexes/constraints/migration patterns.
5. **Test infrastructure** - find existing test files for the area.
   Understand test helpers, fixtures, mocking patterns.
6. **Reference checks** - use LSP `findReferences` on shared types, Zod
   schemas, utility functions being modified to identify all consumers.

**Analyze** - ultrathink: synthesize exploration findings. Consider the
closest existing feature to use as a template, the full dependency chain of
changes, cross-cutting concerns (permissions, multi-tenancy, error handling),
risks/ambiguities in requirements, and the change order that keeps the
codebase compiling at each step.

**Present plan** - show the user a summary: reference implementation being
followed, files to modify/create (table), implementation sequence, test
strategy, risks/open questions. State **"Proceeding unless you
interrupt."** - not an approval gate, but a window to course-correct.

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

**On the final sub-issue** of the topological order, append the parent PRD
closer so the merge closes the whole PRD in one event:

```bash
git commit -m "<concise message>

Closes #<final-sub-issue-number>
Closes #<parent-prd-number>"
```

`/ship-pr` later scrapes every `Closes #N` from the commit log into the PR
body - nothing about the PRD is passed between skills, it all lives in git.

### 5f. Completeness Audit

After multi-file changes: check all Zod schemas, constant maps/enums, import
references updated consistently.

### 5g. Next

Return to 5a with the next sub-issue.

## Step 6: Ship the PR

All sub-issue work is committed on the branch. Invoke `/ship-pr`.

`/ship-pr` is self-contained - it creates the draft PR (deriving the body
from the commit log, including every `Closes #N`), pauses for your functional
QA first (run it via `pnpm dev`, have it drive Playwright flows you direct, or
skip), then runs the AI code-review loop with the per-finding
Address/Dismiss/Defer gate on what you accepted, marks the PR ready, and
watches CI to green. The QA and review conversations happen inside `/ship-pr`;
wait for it to return.

## Step 7: Report

Print a thin PRD-level summary:

- PRD #N: `<title>` - N sub-issues implemented
- PR URL (from `/ship-pr`)
- Final reviewer verdict and finding counts (addressed / dismissed / deferred)
- CI state

The PR closes all sub-issues and the parent PRD via the commit-message
closers when it merges.

## Important Rules

- NEVER commit to `main`. Verify the branch before every commit.
- NEVER force push.
- Run `pnpm typecheck && pnpm lint` after every sub-issue.
- Follow CLAUDE.md, BRAND_DESIGN.md, and UI_UX.md for all code standards.
- Completeness audit after multi-file changes.
- The final sub-issue commit must carry `Closes #<parent-prd-number>` in
  addition to its own sub-issue closer.
- PR creation, the SOC2 review loop, and CI watching all live in `/ship-pr` -
  do not duplicate that logic here.

$ARGUMENTS
