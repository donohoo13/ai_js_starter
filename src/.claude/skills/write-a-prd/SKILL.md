---
name: write-a-prd
description: Create a PRD through user interview, codebase exploration, and module design, then submit as a GitHub issue. Use when the user wants to write a PRD, plan a new feature, or expand an existing GitHub issue (e.g., a bug/feature/chore captured via /capture-task, or any issue referenced by number) into a full PRD.
argument-hint: '[optional: feature description OR GitHub issue number]'
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary or already complete.

1. **Seed the PRD.** Two paths — and the path chosen here decides whether step 5 **promotes an existing issue in place** or **creates a new one**:
   - **From an existing GitHub issue (promote in place).** If `$ARGUMENTS` contains a GitHub issue number, or the user references one (e.g., "write a PRD for #234", "build on the bug I captured", "expand issue 567 into a PRD"), fetch it with `gh issue view <number> --comments` and treat the issue body — especially its `Context for planning` section — as the seed. This is the common path when extending a capture filed via `/capture-task` or any other issue that already describes a problem in detail. **Record this issue number; in step 5 you will rewrite this same issue into the PRD rather than minting a new one** (this is what prevents the original capture from lingering open after the work ships). Confirm the seed with the user, then ask any follow-ups needed to reach the level of detail the rest of this skill assumes (problem framing, user impact, possible solutions).
     - If the seed issue carries a capture label (`outline` or `field-report`), promote it automatically. If it carries **neither** capture label, it may be a long-standing tracking issue the user wants kept distinct — ask once: "#N isn't a capture artifact. Promote it into the PRD in place, or create a separate PRD issue and leave #N open?" Default to promote.
   - **From scratch (create new).** Otherwise, ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions if any. There is no seed issue, so step 5 creates a new PRD issue.

   **Scope gate (before going deeper).** Check whether this is one feature or several independent ones. If the pieces have independent value and would ship separately (e.g. a new onboarding wizard + a HubSpot integration + an analytics dashboard), this is multiple PRDs, not one. Default to a single PRD; only split when the independence is clear. When you do split: pick one to PRD now, and file the deferred siblings via `/capture-task` so they are not lost. Do NOT pre-split a single coherent feature into multiple PRDs, intra-feature slicing is `/prd-to-issues`'s job downstream.

2. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding by using the `/grill-me` skill. **Skip this if the grill-me skill has already been invoked in this conversation for the topic at hand.** Invoke `/grill-me` here only if no such interview has occurred.

3. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

4. Once you have a complete understanding of the problem and solution, use the template below to write the PRD (Product Requirement Document). First ensure the `prd` label exists (both paths below apply it); create it if missing:

   ```bash
   gh label list --json name --jq '.[] | select(.name == "prd")' | grep -q prd || \
     gh label create prd --description "Parent PRD issue — full spec, decomposed into Task sub-issues" --color 5319E7
   ```

   How the PRD lands as a GitHub issue depends on the step-1 path:
   - **Promote in place (seeded from an existing issue).** Rewrite **that same issue** into the PRD rather than creating a new one: `gh issue edit <seed-number> --body "<filled PRD template>"`, preserve the raw original capture text under the PRD's **Further Notes** (a collapsed `<details>` block) so nothing is lost, then swap the capture label for `prd`: `gh issue edit <seed-number> --add-label prd --remove-label outline --remove-label field-report` (the `--remove-label` for whichever capture label is absent is a harmless no-op). This is what guarantees the original capture closes when the work ships — there is no second issue to orphan, and `/implement-prd`'s `Closes #<seed-number>` retires it on merge.
   - **Create new (seeded from scratch).** No seed issue exists, so create one: `gh issue create --title "<title>" --body "<filled PRD template>" --label prd`.

5. After the PRD issue exists (promoted or created), invoke `/gh-cli` to set its issue type to **Feature** (or **Bug** if the PRD describes a bug fix). The `gh` CLI does not support `--type`, so `/gh-cli` handles the GraphQL: repo `issueTypes` lookup → issue node ID → `updateIssueIssueType` mutation. On the promote path this retypes the seed issue from its capture type (Task/Feature/Bug) to the PRD type.

6. After the PRD issue is ready and typed, ask the user how to proceed:

- **Continue to slicing** — invoke the `/prd-to-issues` skill. Default for normal-sized features.
- **Skip slicing, implement directly** — invoke the `/implement-prd` skill. Use when the PRD is essentially a single vertical slice (small bug fix, one-module enhancement, trivial feature).
- **Stop** — user wants to pause before continuing.

The PRD is already in conversation context, so downstream skills pick it up without re-fetching.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are specifically noted as out of scope for this PRD.

## Further Notes

Any additional notes about the feature or helpful context clues that don't fit neatly into this PRD but are worth including to preserve as much conversation context as possible in the final output.

</prd-template>

$ARGUMENTS
