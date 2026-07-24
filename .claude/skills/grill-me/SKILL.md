---
name: grill-me
description: Lens-aware front door for grilling sessions. Routes to grill-engineer, grill-product, grill-design, or grill-research based on an explicit lens argument or by inferring the lens from the ask.
argument-hint: '[engineer|product|design|research][: ask] — or just describe what you want to grill'
disable-model-invocation: true
---

# Grill Me (router)

The one front door for interview sessions of any size and subject. Every session runs the same relentless `grilling` mechanics underneath; what a lens changes is the peer persona, where facts get looked up, and which exits are on the table. This skill's only job is to pick the lens and hand off — one routing decision, not a conversation.

## The lenses

| Lens       | Skill            | Route here when                                                                                                                                                                          |
| ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engineer` | `grill-engineer` | The ask changes this codebase — a feature, bug, chore, refactor, or architecture question — and the _what_ is settled. The default among settled asks.                                   |
| `product`  | `grill-product`  | The ask is about product direction, branding, or UX strategy — what to build and why, at design altitude.                                                                                |
| `design`   | `grill-design`   | The ask composes a specific user-facing surface — a screen, page, or component whose what is settled — including every settled build ask that creates or reshapes something user-facing. |
| `research` | `grill-research` | The ask is understanding a concept, technology, or idea — learning and evaluating, with no intent to build anything right now.                                                           |

## Parse and route

- `/grill-me <lens>: <ask>` — lens and subject given; invoke the lens skill with the subject immediately.
- `/grill-me <lens>` — lens given, no subject; ask in one line what we are grilling, then invoke.
- `/grill-me <freeform ask>` — infer the lens from the subject using the table above and invoke; the lens skill declares itself in its opening line, so a wrong inference costs the user one corrective sentence, not a restart.
- `/grill-me` — ask in one line what we are grilling, then infer and invoke as above.

Accept obvious lens synonyms rather than being pedantic: eng, engineering, code → engineer; brand, product, ux strategy → product; ui, screen, layout, compose → design; learn, explore, investigate → research. A bare "design" resolves by settledness — a settled surface routes to the design lens, an unsettled what routes to product.

**Settledness of the _what_ is the first routing check — it comes before subject matter.** An ask whose what is still fuzzy — a half-baked idea, a user-facing outcome named but not pinned down ("clean up how we display X", "build feature Y, what's a good design for it"), or an idea that keeps fanning out into more outcomes as it is described — routes to `grill-product` first even when phrased in engineering vocabulary, because the mis-routing costs are asymmetric: product-first by mistake costs almost nothing (the product lens's hand-off carries the session into `grill-engineer` the moment the what proves settled), while engineer-first by mistake designs the how of an undecided what against possibly irrelevant code and drives toward a singular exit the idea does not fit. When the _what_ is already specified, the second check is surface-shaped: a settled ask that creates or reshapes something user-facing — "add pagination to the users table", "build the settings page" — routes through `grill-design` first, whose grammar check fast-exits into `grill-engineer` in minutes when the design docs already govern the surface; a settled ask with no user-facing surface goes straight to `grill-engineer`. Doubt about the _lens_ still defaults to engineer; doubt about the _what_ is itself the routing answer, and it resolves product-first. This stays one routing decision: you pick the entry lens, the lens chain does the rest, the router never orchestrates or re-enters. A wrong call costs one corrective sentence, like any lens inference.

Route once and get out of the way. If the subject drifts mid-session (a research chat crystallises into a build), the lens skill handles the pivot; the router never re-enters.
