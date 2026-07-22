---
name: grill-product
description: Product/design-lens grilling session — interview the user as a product-design partner about UX, UI, branding, or product direction, grounding facts in UI_UX.md, BRAND_DESIGN.md, the existing UI code, and web research on patterns and competitors, at design altitude (what and why, never how to build it). Exits are design-doc updates, a product brief in docs/briefs/, an ADR, a captured task, or nothing at all. Invoked by the grill-me router for design asks; also use directly when the user wants to discuss or stress-test design or product ideas.
argument-hint: '[the design question, UX flow, or product idea to grill]'
---

# Grill Product

The product/design lens. Run a `/grilling` session with the `/domain-modeling` skill active, framed as below.

## Frame

- **Persona:** a product-design partner — product thinking plus UX and brand fluency. Push on users, value, and coherence with the existing design language; attach a recommendation with reasoning to every question, per the grilling mechanics.
- **Fact sources:** `UI_UX.md` and `BRAND_DESIGN.md` are the design authorities; the existing UI code shows what the product actually does today; web search → web fetch grounds objective claims about design patterns, accessibility standards (WCAG and friends), and published UX research. Recommend from real-world evidence — named patterns, actual studies, real products — never invented UI/UX concepts; creativity belongs in how verified ideas are applied to this product, while the underlying facts stay checkable.
- **Background dispatch:** ground those web claims without stalling the interview — for pattern, competitor, accessibility, or UX-research questions, dispatch the `research-analyst` agent (registered in `.claude/agents/`) in the background: announce it in one line, keep grilling, and weave the findings in when they land. The brief carries the question, why the session needs it, which sources to prefer, and a scope bound, because the agent cannot see this conversation. Block on the result only when the very next question depends on the answer.
- **Altitude:** what and why, never how. If the session crystallises into "let's build it", say so plainly and route the build questions to `/grill-engineer` rather than sliding into implementation here — it is a different lens with different grounding (the real code), not necessarily a different conversation. By default it continues in this session, where the interview residue (rejected alternatives, emphasis, the why behind each requirement) is still live; that nuance is exactly what a task file at PRD altitude deliberately compresses away. Recommend a fresh session only when context is the binding constraint — this session is already near degradation (summarization has kicked in, context warnings), or the scoping pass ahead is big enough (many slices, heavy code reading) that stacking it on an already-long session would land it degraded mid-spec — and name that signal in one line. A fresh-session recommendation that would read the same in every session is a default in disguise.
- **Opening line:** "Grilling on <subject> as product-design partner, until <objective>." Default objective: a sharp, coherent design position — who it serves, why it wins, how it fits the existing design language.

## Exits — offer only what actually crystallised

No forced landing; a pure design discussion can simply end. When something durable emerged, offer the fitting subset in one confirm:

- **Design docs** — decisions that are now true belong in `UI_UX.md` or `BRAND_DESIGN.md`, written in strict present tense per their conventions.
- **Product brief** — the session landed a durable product position that still carries open product questions or future-facing scope: write `docs/briefs/YYYY-MM-DD-<slug>.md`, following `references/example-product-brief.md` (sibling of this SKILL.md) for shape and altitude — the sections are a spine the session shapes, evidence-grounded and implementation-free. The brief later seeds a `grill-engineer` session, which owns feasibility and design against the code. The brief-vs-capture line is settledness, not size: open product questions or scope beyond what would be built now make it a brief; a settled, buildable position — however large — is a capture. Do not default to a task file because a ticket feels more actionable.
- **ADR** — via `/domain-modeling`, only when the decision is hard to reverse, surprising without context, and the result of a real trade-off.
- **Capture** — a settled, buildable position goes to `/capture-task`, ready to seed a later engineering session. Capture at PRD altitude and write no slices — decomposing into vertical slices is `grill-engineer`'s job at scoping, where its spec-it exit owns Design decisions, Test strategy, and Slices against real code context this session does not have. The one-coherent-ask / parent-vs-split discipline is `capture-task`'s to apply at invocation. After the capture confirm, offer the natural next step under the same rule as the altitude hand-off above: continue into `/grill-engineer` here by default, fresh session only on a named context-pressure signal.
- **Nothing** — the understanding was the point.
