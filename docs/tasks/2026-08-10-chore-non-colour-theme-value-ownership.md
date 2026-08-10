---
type: chore
status: captured
created: 2026-08-10
---

# Name the owner and the gate for non-colour theme values

## Context

Surfaced as finding FLW-7 by the review board on the v2.8.0 branch (`bug/issue-42-payload-gaps`), which was resolving instance issue #42's third finding. That release gave `.claude/rules/frontend-styling.md` a sanctioned home for a theme-varying value the colour token system does not carry: a custom property declared in the app's CSS file alongside the colour tokens, with a value under each theme selector. The rule tells a build session how to consume such a value. It does not say who authors one, under whose authority, or which document governs its light and dark values. The board dispositioned this as a capture rather than a fix because it is a real design tradeoff reaching into `BRANDING.md`'s section structure and `curate-context`'s gate model, not a clause the release could smuggle in. Full board report at `.ai/review/2026-08-10-issue-42-payload-gaps.md`.

## Problem

Two paths now reach a theme-wide, both-modes value, and only one of them is gated. A colour change goes through `BRANDING.md`'s Color System, which `curate-context` Step 5 classes as an identity section: an edit there reports its blast radius (call sites, surfaces, citing `docs/designs/` artifacts) before it asks. A non-colour theme value — an opacity, a mask, a filter, a transform — now reaches the theme CSS through an ordinary `implement-task` build slice, with no gate, no blast-radius report, and no `BRANDING.md` section that owns it. `BRANDING.md`'s Color System enumerates colour only, its Themes section is a bracketed selection question, and `brand-init` interviews for neither. So a build session picks the light and dark values for a product-wide visual property with no design authority and nothing recording the choice. Desired behaviour is unsettled and is the point of the grilling session: either a `BRANDING.md` section owns these values and the edit inherits whatever gate that section's tier carries, or the theme CSS owns them with the build session as author and something else supplies review.

## Scope

- In scope (must-have): decide which document owns the light and dark values for a non-colour theme property; decide whether authoring one is an identity-tier edit under `curate-context` Step 5; land the answer in whichever of `BRANDING.md`, `.claude/rules/frontend-styling.md`, and `curate-context/SKILL.md` it belongs to.
- Nice to have: a worked example in `BRANDING.md` so a filled brand doc shows the shape rather than describing it.
- Out of scope (non-goals, named so the task does not expand silently): the consumption rule in `frontend-styling.md`, which v2.8.0 settled and this task does not reopen; any change to how colour tokens themselves are governed; `ux-standards.md`, which is closed to growth.

## Requirements

- The answer holds for a template that ships `BRANDING.md` as a bracketed skeleton, so it cannot depend on values a real brand has already chosen.
- `brand-init` is the sole path for filling `BRANDING.md`; any new section there is a section that skill must learn to interview for, so the cost of a new section includes a `brand-init` edit.
- `curate-context` Step 5's blast-radius gate reads its section roster from `BRANDING.md`'s own preamble rather than from a list in the skill, so adding a governed section may need no `curate-context` edit at all if the preamble carries it.
- `grill-design` refuses to write `BRANDING.md`, and that refusal is deliberate, so a surface needing a new theme value cannot mint one mid-composition.
- Whatever lands is subject to `curate-context`'s net-growth discipline: a new `BRANDING.md` section is paid for by every session that reads the doc.

## Acceptance criteria

- [ ] One document is named as the owner of light and dark values for non-colour theme properties, and the naming is discoverable from `.claude/rules/frontend-styling.md`'s consuming bullet.
- [ ] The question of whether authoring such a value is an identity-tier edit is answered explicitly, either way, rather than left to a session's judgment.
- [ ] If a new `BRANDING.md` section lands, `brand-init` interviews for it and `project-init`'s detection is unaffected or updated.
- [ ] No rule added to `.claude/rules/ux-standards.md`, which is closed to growth.

## Dependencies

None blocking. The v2.8.0 consumption rule must land first, and it does so on the branch this was captured from.

## Risks / open questions

- [ ] Does a non-colour theme value genuinely carry identity weight, or is the colour gate's severity specific to palette? An opacity that reads wrong is a visual defect on one surface; a palette token that reads wrong is wrong on every surface, which is the stated ground for the gate.
- [ ] Is a new `BRANDING.md` section the right instrument, or does the existing Surfaces, Borders, Shadows, and Gradients section already own enough of this that the values belong there?
- [ ] How many non-colour theme values does a real product actually accumulate? If the answer is one or two, a governed section is heavier than the problem; if it is a growing tail, the ungoverned path is a drift generator.
- [ ] Does the theme CSS need to distinguish brand-authored theme values from build-authored ones at all, or is the file's own review the whole control?
- [ ] Does anything downstream need to read these values by name — `grill-design`'s artifacts, `implement-task`'s land render pass — or are they invisible outside the CSS?
