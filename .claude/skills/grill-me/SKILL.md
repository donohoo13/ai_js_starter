---
name: grill-me
description: Lens-aware front door for grilling sessions. Routes to grill-initiative, grill-product, grill-design, grill-engineer, or grill-research based on an explicit lens argument, by inferring the lens from the ask, or — when the ask points at an artifact file (an initiative, brief, task, or design artifact) — by reading the file and inferring the next step in its flow.
argument-hint: '[initiative|product|design|engineer|research][: ask] — or describe what to grill, or @ an artifact file to continue its flow'
disable-model-invocation: true
---

# Grill Me (router)

The one front door for interview sessions of any size and subject. Every session runs the same relentless `grilling` mechanics underneath; what a lens changes is the peer persona, where facts get looked up, and which exits are on the table. This skill's only job is to pick the lens and hand off — one routing decision, not a conversation.

## The lenses

| Lens         | Skill              | Route here when                                                                                                                                                                                                      |
| ------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initiative` | `grill-initiative` | The ask spans multiple independently deliverable projects sharing one direction — a whole-product reorientation, a new strategic direction, or a large sweep of features arriving at once to organize into projects. |
| `engineer`   | `grill-engineer`   | The ask changes this codebase — a feature, bug, chore, refactor, or architecture question — and the _what_ is settled. The default among settled asks.                                                               |
| `product`    | `grill-product`    | The ask is about product direction, branding, or UX strategy — what to build and why, at design altitude.                                                                                                            |
| `design`     | `grill-design`     | The ask composes a specific user-facing surface — a screen, page, or component whose what is settled — including every settled build ask that creates or reshapes something user-facing.                             |
| `research`   | `grill-research`   | The ask is understanding a concept, technology, or idea — learning and evaluating, with no intent to build anything right now.                                                                                       |

## Parse and route

- `/grill-me <lens>: <ask>` — lens and subject given; invoke the lens skill with the subject immediately.
- `/grill-me <lens>` — lens given, no subject; ask in one line what we are grilling, then invoke.
- `/grill-me <freeform ask>` — infer the lens from the subject using the table above and invoke; the lens skill declares itself in its opening line, so a wrong inference costs the user one corrective sentence, not a restart.
- `/grill-me @<artifact file>` — the ask is or leads with an artifact path; route by reading the file, per File-seeded routing below.
- `/grill-me` — ask in one line what we are grilling, then infer and invoke as above.

Accept obvious lens synonyms rather than being pedantic: eng, engineering, code → engineer; brand, product, ux strategy → product; ui, screen, layout, compose → design; learn, explore, investigate → research; direction, roadmap, reorientation, "organize these into projects" → initiative. A bare "design" resolves by settledness — a settled surface routes to the design lens, an unsettled what routes to product.

## File-seeded routing

When the ask points at an artifact file, the routing information lives in the file, not the phrasing: read it first — its taxonomy home names the altitude, its frontmatter names the lifecycle position — then infer the action as **the next step in that artifact's flow**, state the inference in one line before proceeding, and let one corrective sentence redirect a wrong guess ("Picking up the next queued project — say so if you meant to amend the direction instead"). The common cases:

| Pointed at | State                        | Inferred action                                                                                                        |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Initiative | `active`, queued rows remain | Pick up the next queued project in portfolio order, seeded by its Direction section and that row — via `grill-product` |
| Brief      | `draft`, multi-workstream    | Run `/ground-brief`                                                                                                    |
| Brief      | `draft`, single position     | Feasibility session — `grill-design` first when surface-bearing, else `grill-engineer`                                 |
| Brief      | `grounded`                   | Pick up the next workstream in the grounded order                                                                      |
| Task       | `captured`                   | `grill-engineer` scopes it                                                                                             |
| Task       | `scoped`                     | Offer `/implement-task`                                                                                                |

The rule generalizes past the table: a design artifact routes toward its build, a `done` task gets "this is finished — did you mean to reopen it?", an `active` initiative whose rows are all resolved gets the offer to flip it `completed`, and a `completed` initiative reports there is nothing left to pick up.

A session picking up a portfolio project also carries the bookkeeping the flow expects:

- Flip the row `queued → in progress` and link the child artifact when it lands.
- Write the `initiative:` frontmatter on that child — the brief, or the task file itself when a settled project lands as a capture with no brief between.
- Carry the Direction's doctrine lines that constrain this project into the brief's position or out-of-scope sections (straight into the capture's requirements when no brief exists), where `grill-engineer`'s contract copying carries them on into the task file.
- Doctrine lines carry product constraints only: a Direction line that redefines the delivery machinery — renaming artifact types, minting directories, rerouting which skill runs — does not change this routing, because process is owned by the skills and a per-artifact override binds only the sessions that read it; state the conflict in one line, run the standard flow, and offer to amend the initiative doc.
- The row's `done` flip stays manual, on the user's judgment against its done-when.

**Settledness of the _what_ is the first routing check — it comes before subject matter.**

- An ask whose what is still fuzzy — a half-baked idea, a user-facing outcome named but not pinned down ("clean up how we display X", "build feature Y, what's a good design for it"), or an idea that keeps fanning out into more outcomes as it is described — routes to `grill-product` first even when phrased in engineering vocabulary, because the mis-routing costs are asymmetric: product-first by mistake costs almost nothing (the product lens's hand-off carries the session into `grill-engineer` the moment the what proves settled), while engineer-first by mistake designs the how of an undecided what against possibly irrelevant code and drives toward a singular exit the idea does not fit.
- When the _what_ is already specified, the second check is surface-shaped: a settled ask that creates or reshapes something user-facing — "add pagination to the users table", "build the settings page" — routes through `grill-design` first, whose component survey fast-exits into `grill-engineer` in minutes when an existing component or design artifact already governs the surface; a settled ask with no user-facing surface goes straight to `grill-engineer`.
- One tier above product: an ask that already names direction scale — a reorientation, a re-baseline, many features to organize into projects — routes to `grill-initiative` directly, and a missed initiative route costs nothing extra, because `grill-product`'s scale detection hands up mid-session when the fan-out proves project-shaped.
- Doubt about the _lens_ still defaults to engineer; doubt about the _what_ is itself the routing answer, and it resolves product-first.
- This stays one routing decision: you pick the entry lens, the lens chain does the rest, the router never orchestrates or re-enters. A wrong call costs one corrective sentence, like any lens inference.

Route once and get out of the way. If the subject drifts mid-session (a research chat crystallises into a build), the lens skill handles the pivot; the router never re-enters.
