---
name: write-a-prd
description: Create a PRD through user interview, codebase exploration, and module design, then submit as a GitHub issue. Use when the user wants to write a PRD, plan a new feature, or expand an existing GitHub issue (e.g., a bug/feature/chore captured via /capture-task, or any issue referenced by number) into a full PRD.
argument-hint: '[optional: feature description OR GitHub issue number]'
---

This skill turns a rough ask into a PRD issue. The spine is: get the seed, reach shared understanding by exploring the code together, _then_ decide scope, design modules, and write it up. Skip any step you can see is already done.

1. **Seed the PRD.** Where the seed comes from decides whether step 6 **promotes an existing issue in place** or **creates a new one** — so settle it now and remember the choice.
   - **From an existing issue** (a number in `$ARGUMENTS`, or the user pointing at one — "write a PRD for #234", "expand the bug I captured"): fetch it with `gh issue view <number> --comments` and treat its body, especially any `Context for planning` section, as the seed. **Record the number** — step 6 rewrites _this same issue_ into the PRD instead of minting a new one, which is what stops the original capture from lingering open after the work ships. If it carries a capture label (`outline` or `field-report`), promote it without asking. If it carries neither, it may be a tracking issue the user wants kept separate, so ask once: "#N isn't a capture artifact — promote it into the PRD in place, or leave it open and create a separate PRD?" Default to promote.
   - **From scratch:** ask the user for a detailed description of the problem and any solution ideas they have. No seed issue exists, so step 6 creates one.

2. **Reach shared understanding.** Invoke `/grill-me` to interview the user and explore the codebase until the plan is unambiguous. This is the codebase-exploration step — grill-me reads the actual code to verify assumptions, so by the end you know the real surface area, not just the pitch. **Skip if grill-me already ran for this topic in the conversation.**

3. **Scope check.** Now that exploration has shown you the true surface area, ask: is this genuinely one feature, or several independent ones? Default hard to a single PRD — exploration usually reveals the "separate" pieces share schema, modules, or sequencing, which makes them one feature delivered in slices (and slicing is `/prd-to-issues`'s job downstream, not yours). Split only when two pieces share almost no code and could ship in either order with independent value (e.g. an onboarding wizard vs. a HubSpot integration). When you do split: PRD one now, and file the deferred siblings via `/capture-task` so nothing is lost. Never pre-slice a single coherent feature.

4. **Design the modules.** Sketch the major modules to build or modify. Actively look for deep modules — ones that hide a lot of functionality behind a simple, testable interface that rarely changes — since those are what make the implementation testable in isolation. Check the module list against the user's expectations, and ask which modules they want tests written for.

5. **Write the PRD.** Fill in the template below. First ensure the `prd` label exists (both paths use it):

   ```bash
   gh label list --json name --jq '.[] | select(.name == "prd")' | grep -q prd || \
     gh label create prd --description "Parent PRD issue — full spec, decomposed into Task sub-issues" --color 5319E7
   ```

6. **Land it as an issue** — which command depends on the step-1 path:
   - **Promote (seeded from an issue):** rewrite that same issue — `gh issue edit <seed-number> --body "<filled PRD template>"` — preserving the raw original capture text under **Further Notes** in a collapsed `<details>` block so nothing is lost, then swap labels: `gh issue edit <seed-number> --add-label prd --remove-label outline --remove-label field-report` (removing whichever capture label is absent is a harmless no-op). No second issue means nothing to orphan; `/implement-prd`'s `Closes #<seed-number>` retires it on merge.
   - **Create (seeded from scratch):** `gh issue create --title "<title>" --body "<filled PRD template>" --label prd`.

7. **Set the issue type.** Invoke `/gh-cli` to set the issue type to **Feature** (or **Bug** if the PRD describes a bug fix). The `gh` CLI has no `--type`, so `/gh-cli` handles the GraphQL: repo `issueTypes` lookup → issue node ID → `updateIssueIssueType` mutation. On the promote path this retypes the seed from its capture type.

8. **Hand off.** The PRD is in conversation context, so downstream skills pick it up without re-fetching. Ask the user how to proceed:
   - **Continue to slicing** — invoke `/prd-to-issues`. Default for normal-sized features.
   - **Skip slicing, implement directly** — invoke `/implement-prd`. Use when the PRD is essentially one vertical slice (small bug fix, one-module enhancement, trivial feature).
   - **Stop** — pause before continuing.

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
