---
name: write-a-prd
description: Create a PRD through user interview, codebase exploration, and module design, then submit as a GitHub issue. Use when user wants to write a PRD or plan a new feature.
argument-hint: '[optional: brief description of feature/problem]'
disable-model-invocation: true
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary or already complete.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions if any.

2. Explore the repo to verify their assertions and understand the current state of the codebase. Share what you find with the user. Correct any misunderstandings about how the code currently works. Be specific — reference files and patterns you discovered to determine a common understanding.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding by using the /grill-me skill.

4. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

5. Once you have a complete understanding of the problem and solution, use the template below to write the PRD (Product Requirement Document). The PRD should be submitted as a GitHub issue.

6. After creating the PRD issue, invoke `/gh-cli` to set its issue type to **Feature** (or **Bug** if the PRD describes a bug fix). The `gh` CLI does not support `--type`, so `/gh-cli` handles the GraphQL: repo `issueTypes` lookup → issue node ID → `updateIssueIssueType` mutation.

7. After the PRD issue is created and typed, ask the user how to proceed:

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
