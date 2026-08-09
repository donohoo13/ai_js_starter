# UI_UX.md disposition table

Every line of the shipped `UI_UX.md` (129 lines) mapped to a destination before slice 1 of `docs/tasks/2026-08-09-chore-retire-ui-ux-doc.md` writes anything. Reviewed by the user; this file is the spec the split is written from and the artifact the acceptance criterion checks against.

Destinations: **UX** = `.claude/rules/ux-standards.md`, **STY** = `.claude/rules/frontend-styling.md`, **EML** = `.claude/rules/transactional-email.md`, **BRD** = `BRANDING.md`, **DROP** = deleted with a stated reason, **SPLIT** = one line divides between two destinations.

## Line accounting

129 lines total: 83 rule bullets, 6 section preambles, 11 headings, 29 blank lines. Blank lines and headings carry no content and are reproduced by the new files' own structure; the 89 content items are enumerated below.

## Preambles (6)

| Line | Content                         | Dest | Note                                                                                                                                                   |
| ---- | ------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3    | File preamble, grammar registry | DROP | Its whole subject is the grammar system and the brand-doc precedence pointer. Replaced by UX's closed-to-growth preamble plus the load-mechanism note. |
| 31   | Tailwind applicability          | STY  | Verbatim.                                                                                                                                              |
| 39   | Surface composed from user task | UX   | Keeps the `grill-design` pointer; that skill still authors per-surface composition.                                                                    |
| 79   | Pick control by what user knows | UX   | Verbatim.                                                                                                                                              |
| 99   | Data-table floors, brand wins   | UX   | Repath `BRAND_DESIGN.md` → `BRANDING.md`.                                                                                                              |
| 116  | Email clients are hostile       | EML  | Repath the brand-doc reference.                                                                                                                        |

## Standards (12 bullets, lines 7-18)

| Line | Rule                | Dest | Note                                                                                                                          |
| ---- | ------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| 7    | Touch targets 44px  | UX   | Sourced (HIG, WCAG 2.5.5/2.5.8, Material). The Material-based conditional is a sourced variant, not a project choice.         |
| 8    | Choice architecture | UX   | Hick's Law, NN/g.                                                                                                             |
| 9    | Reading ~20%        | UX   | NN/g.                                                                                                                         |
| 10   | Contrast AA         | UX   | WCAG 2.1.                                                                                                                     |
| 11   | Mobile-first        | BRD  | **Project choice.** Layout section. The reference instance replaced it with desktop-first citing its own brand doc.           |
| 12   | Performance CWV     | UX   | web.dev.                                                                                                                      |
| 13   | Navigation scent    | UX   | NN/g three-click debunk.                                                                                                      |
| 14   | Accessibility AA    | UX   | WCAG 2.1.                                                                                                                     |
| 15   | Interaction states  | UX   | Unsourced but a genuine floor; every project needs hover/focus/pressed/disabled.                                              |
| 16   | Icons one family    | UX   | One-family + no-emoji is the floor; character already lives in the brand doc at `BRAND_DESIGN.md:86`. No split needed.        |
| 17   | Dark elevation      | DROP | **Already stated** at `BRAND_DESIGN.md:74` (Surfaces section, same Material source). Duplicate resolved toward the brand doc. |
| 18   | CSS-First           | STY  | An implementation convention, not a usability floor.                                                                          |

## CSS (6 bullets, lines 22-27)

| Line | Rule                    | Dest | Note                                      |
| ---- | ----------------------- | ---- | ----------------------------------------- |
| 22   | rem for type/spacing    | STY  | Verbatim.                                 |
| 23   | em for component scale  | STY  | Verbatim.                                 |
| 24   | % / viewport for layout | STY  | Verbatim.                                 |
| 25   | No px for layout/type   | STY  | Verbatim.                                 |
| 26   | `clamp()` fluid type    | STY  | Verbatim.                                 |
| 27   | 16px root assumption    | STY  | A browser-default fact, not a brand pick. |

## Tailwind (3 bullets, lines 33-35)

| Line | Rule                     | Dest | Note                                                   |
| ---- | ------------------------ | ---- | ------------------------------------------------------ |
| 33   | Utilities + `@utility`   | STY  | The Rule-of-Three threshold stays as written.          |
| 34   | Semantic tokens only     | STY  | `.tsx` reference stays generic to the project's files. |
| 35   | Unmapped classes dropped | STY  | Verbatim.                                              |

## Surface Composition (4 bullets, lines 41-44)

All four → **UX**, verbatim: name the job (41), two tiers (42), progressive disclosure (43), every figure interpretable in place (44).

## Spacing & Whitespace (7 bullets, lines 48-54)

| Line | Rule                     | Dest  | Note                                                                                                                                                                                  |
| ---- | ------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 48   | Constrained scale        | SPLIT | Floor to UX: every spacing value comes from a constrained scale, arbitrary one-offs never appear (Material, Carbon, Atlassian). Pick to BRD Layout: the 8px base with 4px half-steps. |
| 49   | Proximity is grouping    | UX    | Gestalt, NN/g.                                                                                                                                                                        |
| 50   | Borders last             | UX    | Refactoring UI. Repath the brand-doc escape clause.                                                                                                                                   |
| 51   | Tiered separation        | BRD   | Approved per judgment call 1: follows the base unit it derives from into Layout.                                                                                                      |
| 52   | Line length 70ch         | UX    | WCAG 1.4.8.                                                                                                                                                                           |
| 53   | Data surfaces don't fill | UX    | Proximity applied to tables.                                                                                                                                                          |
| 54   | Density is modal         | BRD   | **Project choice.** Density section already exists and is empty.                                                                                                                      |

## Motion (8 bullets, lines 58-65)

| Line | Rule                | Dest | Note                                                                                            |
| ---- | ------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| 58   | Purpose             | UX   | Decoration-only animation does not ship; a floor, not a style pick.                             |
| 59   | Durations 100-300ms | UX   | NN/g measured perception bands. The band is the floor; the project picks inside it.             |
| 60   | Asymmetry           | UX   | NN/g.                                                                                           |
| 61   | Easing              | BRD  | **Unsourced pick.** `BRAND_DESIGN.md:78` Motion already claims easing.                          |
| 62   | Compositor-safe     | UX   | web.dev.                                                                                        |
| 63   | Reduced motion      | UX   | WCAG 2.3.3 / 2.2.2.                                                                             |
| 64   | Frequency budget    | UX   | Freiberg, Kowalski.                                                                             |
| 65   | Proportional scale  | BRD  | **Unsourced pick.** The 0.8 and 0.95 values are choices; Motion's "signature transitions" slot. |

## Forms (7 bullets, lines 69-75)

All seven → **UX**, verbatim: labels (69), single column (70), validation timing (71), errors (72), autocomplete/inputmode (73), required and optional both marked (74), destructive actions confirm (75). All sourced except 75, which is a floor.

## Numeric Entry & Controls (5 bullets, lines 81-85)

All five → **UX**, verbatim: text entry (81), stepper (82), slider (83), units on control (84), sum-constrained remainder (85).

## Feedback & Status (7 bullets, lines 89-95)

All seven → **UX**, verbatim: 100ms acknowledgement (89), response ladder (90), indicator by wait type (91), layout stability (92), interruption hierarchy (93), optimistic updates (94, keeps its "engineering judgment, not research" caveat), empty states teach (95).

## Data Tables (12 bullets, lines 101-112)

All twelve → **UX**. Verbatim except three brand-doc repaths: alignment (101, Typography reference), row actions on demand (106, emphasis treatment), explicit empty and loading states (112, Voice and Copy).

## Transactional Emails (12 bullets, lines 118-129)

All twelve → **EML**, verbatim. The 44px CTA rule at 121 keeps its cross-reference, repointed at UX's touch-target floor.

## Judgment calls — all five approved by the user before slice 1 landed

1. **Line 51, tiered separation (0-8px inside groups, 12-24px between elements, 32px+ between sections).** Sourced to Atlassian but explicitly "as the directional shape", and the numbers are downstream of the 8px base that is moving to `BRANDING.md`. Recommendation: **BRD Layout**, alongside the base it derives from — leaving it in UX would state a floor in units the floors file no longer defines.
2. **Line 17, dark elevation — dropped rather than moved,** because `BRAND_DESIGN.md:74` already carries it from the same Material source. This is a deletion, so it is stated here rather than applied silently.
3. **Line 3 preamble dropped whole.** Its subject is the grammar registry and the surface-family sections that no longer exist. Nothing in it survives the change.
4. **Lines 61 and 65 (easing, proportional scale) are the two Motion rules with no source,** which is also why they read as picks rather than floors. Moving them to `BRANDING.md` Motion resolves the overlap with a section that already claims easing and signature transitions.
5. **Line 27 (16px root) stays in STY** rather than moving to BRD. It states a browser default a session reasons from, not a value the project chooses; a project that steps the root away from it documents that where it sets it.

## Totals

- **UX**: 4 preambles' worth of framing + 55 rules
- **STY**: 1 preamble + 10 rules
- **EML**: 1 preamble + 12 rules
- **BRD**: 5 rules moved whole (11, 54, 61, 65, and 51 pending call 1) + 1 split fragment (48)
- **DROP**: 2 (line 3 preamble, line 17)
- **SPLIT**: 1 (line 48)
