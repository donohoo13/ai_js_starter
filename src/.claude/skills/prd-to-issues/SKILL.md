---
name: prd-to-issues
description: Break a PRD into sub-issues using tracer-bullet vertical slices, where each sub-issue becomes one or more commits on a single PRD branch shipped as ONE pull request. Use when user wants to convert a PRD to issues, create implementation tickets, or break down a PRD into work items.
argument-hint: '[github-issue-number]'
---

# PRD to Issues

Break a PRD into sub-issues using vertical slices (tracer bullets).

**The delivery model — one PRD, one PR.** Sub-issues are units of WORK and
TRACKING, not units of delivery. `/implement-prd` implements all of a PRD's
sub-issues on a single feature branch in dependency order, each sub-issue
landing as one or more commits carrying `Closes #<sub-issue>`, and the whole
branch ships as ONE pull request via `/ship-pr` (whose merge closes every
sub-issue plus the parent PRD). Blocked-by relationships between slices encode
COMMIT ORDER within that branch, not separate-PR sequencing. Never frame
slices as independently-mergeable PRs.

## Process

### 1. Locate the PRD

If the PRD is already in this conversation (from running `/write-a-prd`), use
it directly.

Otherwise, if `$ARGUMENTS` contains an issue number, fetch it. If neither, ask
the user for the PRD GitHub issue number.

```bash
gh issue view <number> --comments
```

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current
state of the code.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** issues. Each issue is a thin vertical
slice that cuts through ALL integration layers end-to-end, NOT a horizontal
slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as
an architectural decision, a design review, or an action only the user can
perform (prod infra changes, manually-run migrations). AFK slices can be
implemented without human interaction. Prefer AFK over HITL where possible.
HITL/AFK describes interaction needs during implementation on the shared PRD
branch; it does not imply separate delivery.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema,
  API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 3b. Single-slice check

If the drafted breakdown produces exactly one slice, the PRD doesn't warrant decomposition. Ask the user:

- **Create one sub-issue anyway** — useful if you still want separate issue tracking for the implementation vs. the PRD.
- **Skip decomposition** — no sub-issues created; `/implement-prd` will treat the parent PRD body as the single work unit.

If the user picks skip, exit the skill without creating any issues.

### 4. Sanity check

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories from the PRD this addresses

Include brief reasoning for non-obvious decisions (e.g., why a slice is HITL vs AFK, why a particular dependency order). The PRD should already provide sufficient context — only ask clarifying questions when there's a genuinely ambiguous distinction.

**Coverage check.** Before presenting, confirm every user story in the PRD maps to at least one slice. List any uncovered stories and add slices to cover them, or note explicitly why they are deferred. A user story with no slice is a dropped requirement.

Prompt: "Flag anything that looks wrong — otherwise I'll proceed to create these issues."

### 5. Create the GitHub issues

For each approved slice, create a GitHub issue using `gh issue create`. Use the
issue body template below.

Create issues in dependency order (blockers first) so you can reference real
issue numbers in the "Blocked by" field.

### 6. Set issue metadata via `/gh-cli`

The `gh` CLI does not support `--type` or relationship fields. After creating all issues, invoke `/gh-cli` to handle all GraphQL operations in this order:

1. Look up repo issue type IDs (once).
2. Batch-fetch node IDs for all created sub-issues + parent PRD in a single query.
3. Set types: sub-issues → **Task**, parent PRD → **Feature** (or **Bug** for bug-fix PRDs).
4. Add parent/child relationships via `addSubIssue` — each sub-issue as a child of the PRD.
5. Add blocking relationships via `addBlockedBy` — for any slice that blocks another, `issueId` = blocked, `blockingIssueId` = blocker.

Batch mutations in single calls where possible.

<issue-template>
## Parent PRD

#<prd-issue-number>

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior,
not layer-by-layer implementation. Reference specific sections of the parent PRD
rather than duplicating content.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by #<issue-number> (if any)

Or "None - can start immediately" if no blockers.

## User stories addressed

Reference by number from the parent PRD:

- User story 3
- User story 7

</issue-template>

**Acceptance criteria must be concretely verifiable.** Each criterion is something a reviewer can objectively check off. No vague criteria: not "works correctly," "handles edge cases," or "proper error handling." Reference the parent PRD for context rather than restating it, but make each checkbox a specific, testable outcome.

Do NOT close or modify the parent PRD issue.

$ARGUMENTS
