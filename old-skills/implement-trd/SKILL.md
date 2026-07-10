---
name: implement-trd
description: Implement a TRD's slices in dependency order using TDD. Topologically sorts the TRD's sub-issues, implements each with /tdd on one branch, then hands off to /ship-pr for the draft PR, SOC2 review loop, and CI watch. Use when an accepted TRD is ready to build.
argument-hint: '[github-issue-number]'
---

# Implement TRD

Orchestrate implementation of a TRD's slices in topological (dependency) order
using TDD, then hand the committed branch to `/ship-pr` to take it through the
org's PR process. The design is already settled in the TRD — this skill builds
it; it does not re-decide architecture.

## Step 1: Locate TRD + Sub-Issues

Check in order:

1. **Already in context** - TRD and slices from the `/write-a-trd` pipeline.
   Use directly, skip API calls.
2. **`$ARGUMENTS` provided** - user passed the parent TRD issue number (e.g.
   `/implement-trd 42`). Fetch via GraphQL.
3. **Neither** - ask user for the parent TRD issue number, then fetch.

**Fetching** (only when slices NOT already in context):

Invoke `/gh-cli` to fetch the TRD and its sub-issues. Request fields: `id`,
`number`, `title`, `body`, `state`, `issueType`, `blockedBy` (first 20),
`blocking` (first 20), `subIssues` (first 50). Closed sub-issues = already
completed.

### No-sub-issues fallback

If the fetched TRD has **zero open sub-issues** (the single-slice case), fall
through to single-work-unit mode:

- Skip Step 2 (Topological Sort) entirely.
- In Step 5, treat the parent TRD body (Architecture, Schema, API Contracts,
  Test Strategy) as the single work unit's acceptance criteria.
- Still run Step 3 (Guard Branch), Step 4 (informational order - just show the
  TRD as the single item), the Step 5 loop (one iteration), Step 6 (Ship the
  PR), and Step 7 (Report).
- The single commit in Step 5e closes the parent TRD directly:
  `Closes #<trd-number>`.

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
proceed on main.** Trust whatever non-main branch the user is on unless
otherwise specified.

## Step 4: Show Implementation Order

Display ordered list (informational, not an approval gate):

```
Implementation order for TRD #N: <title>

1. #101 - PresenceStore + TTL (AFK) [no blockers]
2. #102 - Heartbeat endpoint (AFK) [blocked by #101]
3. #103 - Presence hook (AFK) [blocked by #102]
...
```

Proceed immediately.

## Step 5: Implement Each Slice

For each slice in topological order, run the loop body 5a–5g. Each slice ends
in one of three states. Continue automatically on the first two; only the
third stops you:

- **DONE** - validated and committed; proceed to the next slice.
- **DONE_WITH_CONCERNS** - committed, but you have a doubt (e.g. an ambiguous
  requirement you resolved one way). Note it in your running summary and
  proceed; do not stop.
- **BLOCKED** - you cannot complete it: missing context, contradictory
  requirements, or a failure you cannot root-cause. Stop, surface the blocker
  to the user, and wait. This is the only reason to break isolation mid-TRD.
  For a failure you cannot diagnose, run `/diagnose` first; if 3+ hypotheses
  fail, that is itself the BLOCKED signal.

### 5a. Skip Check

If issue is closed/completed on GitHub, skip it.

### 5b. Deep Plan

The TRD already did the architectural exploration, so this is a focused
read-in, not a fresh design. Confirm the slice against the TRD and the current
code before writing:

1. **Re-read the TRD section** the slice implements - its modules, contracts,
   and test strategy are the design; follow them.
2. **Touch points** - identify every file needing changes; read current
   contents, note existing interfaces/types/signatures.
3. **Reference implementation** - the TRD names one; read its full vertical
   slice if you have not already.
4. **Shared code & schema** - confirm reusable schemas/types/helpers and any
   migration patterns the slice depends on.
5. **Reference checks** - LSP `findReferences` on shared types/schemas/utilities
   being modified to find all consumers.

**Present plan** - show a short summary: files to modify/create, sequence, test
strategy, any risk. State **"Proceeding unless you interrupt."** - a window to
course-correct, not an approval gate.

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

**On the final slice** of the topological order, append the parent TRD closer
so the merge closes the whole TRD in one event:

```bash
git commit -m "<concise message>

Closes #<final-sub-issue-number>
Closes #<parent-trd-number>"
```

`/ship-pr` later scrapes every `Closes #N` from the commit log into the PR
body - nothing about the TRD is passed between skills, it all lives in git.

### 5f. Completeness Audit

After multi-file changes: check all Zod schemas, constant maps/enums, import
references updated consistently.

### 5g. Next

Return to 5a with the next slice.

## Step 6: Ship the PR

All slice work is committed on the branch. Invoke `/ship-pr`.

`/ship-pr` is self-contained - it creates the draft PR (deriving the body from
the commit log, including every `Closes #N`), pauses for your functional QA
first, then runs the AI code-review loop with the per-finding
Address/Dismiss/Defer gate, marks the PR ready, and watches CI to green. Wait
for it to return.

## Step 7: Report

Print a thin TRD-level summary:

- TRD #N: `<title>` - N slices implemented
- PR URL (from `/ship-pr`)
- Final reviewer verdict and finding counts (addressed / dismissed / deferred)
- CI state

The PR closes all sub-issues and the parent TRD via the commit-message closers
when it merges.

## Important Rules

- NEVER commit to `main`. Verify the branch before every commit.
- NEVER force push.
- Run `pnpm typecheck && pnpm lint` after every slice.
- Follow CLAUDE.md, BRAND_DESIGN.md, and UI_UX.md for all code standards.
- The TRD is the design; implement it. If the TRD is wrong or insufficient,
  that is a BLOCKED signal - surface it, do not silently redesign.
- The final slice commit must carry `Closes #<parent-trd-number>` in addition
  to its own sub-issue closer.
- PR creation, the SOC2 review loop, and CI watching all live in `/ship-pr` -
  do not duplicate that logic here.

$ARGUMENTS
