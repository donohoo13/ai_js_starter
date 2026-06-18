---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch a code-reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**

- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**

- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**

```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code-reviewer subagent:**

Use the Agent tool with the general-purpose subagent type, fill template at `code-reviewer.md`

**Placeholders:**

- `{DESCRIPTION}` - What you just built (1-2 sentences)
- `{PLAN_REFERENCE}` - What it should do (link or inline)
- `{BASE_SHA}` / `{HEAD_SHA}` - Full 40-char SHAs
- `{BASE_SHA_SHORT}` / `{HEAD_SHA_SHORT}` - 7-char short SHAs
- `{PRIOR_REVIEW_BODY}` - Full body of the prior review comment if this is a re-review; empty string on first review

**3. Output:**

The reviewer emits a structured markdown document starting with the marker `<!-- oneview:code-review:sha=<HEAD_SHA> -->` on line 1. Findings have stable IDs (F1, F2, ...) and a status field. On re-review, the reviewer re-classifies prior findings before adding new ones; never renumber.

**4. Act on feedback:**

- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

When the reviewer's output is being posted as a PR comment for SOC2 audit evidence (per `ship-pr`), edit the existing comment in place rather than posting a new one. Locate it by greppping `gh api /repos/{owner}/{repo}/issues/{pr}/comments` for the marker prefix `<!-- oneview:code-review:sha=`.

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code-reviewer subagent]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**

- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**

- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**

- Review before merge
- Review when stuck

## Red Flags

**Never:**

- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**

- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: requesting-code-review/code-reviewer.md
