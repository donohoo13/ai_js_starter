---
name: grill-me
description: Lens-aware front door for grilling sessions. Routes to grill-engineer, grill-product, or grill-research based on an explicit lens argument or by inferring the lens from the ask.
argument-hint: '[engineer|product|research][: ask] — or just describe what you want to grill'
disable-model-invocation: true
---

# Grill Me (router)

The one front door for interview sessions of any size and subject. Every session runs the same relentless `grilling` mechanics underneath; what a lens changes is the peer persona, where facts get looked up, and which exits are on the table. This skill's only job is to pick the lens and hand off — one routing decision, not a conversation.

## The lenses

| Lens       | Skill            | Route here when                                                                                                                |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `engineer` | `grill-engineer` | The ask changes this codebase: a feature, bug, chore, refactor, or architecture question. The default when in doubt.           |
| `product`  | `grill-product`  | The ask is about UX, UI, branding, or product direction — what to build and why, at design altitude.                           |
| `research` | `grill-research` | The ask is understanding a concept, technology, or idea — learning and evaluating, with no intent to build anything right now. |

## Parse and route

- `/grill-me <lens>: <ask>` — lens and subject given; invoke the lens skill with the subject immediately.
- `/grill-me <lens>` — lens given, no subject; ask in one line what we are grilling, then invoke.
- `/grill-me <freeform ask>` — infer the lens from the subject using the table above and invoke; the lens skill declares itself in its opening line, so a wrong inference costs the user one corrective sentence, not a restart.
- `/grill-me` — ask in one line what we are grilling, then infer and invoke as above.

Accept obvious lens synonyms rather than being pedantic: eng, engineering, code → engineer; design, ux, ui, brand → product; learn, explore, investigate → research.

**Lead with product when the _what_ is unsettled.** Some asks name a user-facing outcome without pinning down what it should become — "clean up how we display X", "build feature Y, what's a good design for it". The _how_ cannot be settled before the _what_, so route these to `grill-product` first; its existing hand-off carries the session into `grill-engineer` once the design position is sharp. When the _what_ is already specified — "change the list to a table with these columns", "add pagination to the users table" — go straight to `grill-engineer`; a known pattern needs no product pass, and `frontend-design`'s quality floor covers the polish during the build. This stays one routing decision: you pick the entry lens, the lens chain does the rest, the router never orchestrates or re-enters. A wrong call costs one corrective sentence, like any lens inference.

Route once and get out of the way. If the subject drifts mid-session (a research chat crystallises into a build), the lens skill handles the pivot; the router never re-enters.
