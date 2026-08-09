---
type: chore
status: captured
created: 2026-08-09
---

# Give the three-surface component extraction an owner

## Context

Surfaced by the `quality` review board on `chore/retire-ui-ux-doc` as finding ADV-8, and confirmed by the chair. The UI_UX retirement replaced the surface-grammar flywheel with "a composition proven three times becomes a component", stated in `grill-design/SKILL.md` Exits and `curate-context/SKILL.md` Step 3. The board checked whether anything produces that judgment and found nothing does.

## Problem

Current behavior: three surfaces of the same family each run `grill-design`. Every session's component survey globs `docs/designs/` and sees the prior artifacts, but the survey's three outcomes are Governed, Supplied, and Ungoverned — none of them is "this is the third artifact of this shape, extract the component first". A strained fit resolves to Ungoverned, whose instruction is to run the full interview and write artifact number three. `grill-engineer` and `implement-task` are never told to count design artifacts.

The task file for the retirement claimed `implement-task`'s completeness audit covers this; the board read that step and it does not — it audits schemas, constant maps, and import references. That claim was wrong and is corrected here rather than left standing.

Desired behavior: the count has an owner at the moment the evidence is in hand, so the pattern reaches code instead of accumulating as three prose files in `docs/designs/` that describe the same composition and can drift from each other and from the build.

## Scope

- In scope (must-have): decide who counts and when, and wire it into whichever skill that turns out to be.
- Out of scope (non-goals, named so the task does not expand silently): reinstating a grammar document or any prose registry of patterns. That is the thing the retirement removed and it is not coming back.

## Requirements

- The survey already lists same-family artifacts, so the evidence needed for the count is in hand at that moment — the leading candidate is a fourth survey outcome recommending the extraction as the task's first slice before surface three is composed.
- Whatever owns it states what happens when the user declines the extraction, since the fourth artifact then lands anyway and the count must not fire again identically on surface four.

## Acceptance criteria

- [ ] Some named step produces the "three surfaces, extract it" judgment; a reader can point at the file and line.
- [ ] The decline path is defined.

## Dependencies

None.

## Risks / open questions

- [ ] Does "same family" need a definition sharper than the survey's current wording, or does the session's judgment suffice? An n=3 counter that fires on a wrong family grouping is worse than no counter.
- [ ] Should the extraction be a recommendation or a gate? A gate on composition work has the reflexive-yes failure mode this suite warns about elsewhere.
