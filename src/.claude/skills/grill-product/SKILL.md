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
- **Altitude:** what and why, never how. If the session crystallises into "let's build it", say so plainly and route the build questions to `/grill-engineer` — that is a different session with different grounding — rather than sliding into implementation here.
- **Opening line:** "Grilling on <subject> as product-design partner, until <objective>." Default objective: a sharp, coherent design position — who it serves, why it wins, how it fits the existing design language.

## Exits — offer only what actually crystallised

No forced landing; a pure design discussion can simply end. When something durable emerged, offer the fitting subset in one confirm:

- **Design docs** — decisions that are now true belong in `UI_UX.md` or `BRAND_DESIGN.md`, written in strict present tense per their conventions.
- **Product brief** — the session landed a durable product position bigger than a doc tweak and not yet a buildable task: write `docs/briefs/YYYY-MM-DD-<slug>.md`, following `references/example-product-brief.md` (sibling of this SKILL.md) for shape and altitude — the sections are a spine the session shapes, evidence-grounded and implementation-free. The brief later seeds a `grill-engineer` session, which owns feasibility and design against the code.
- **ADR** — via `/domain-modeling`, only when the decision is hard to reverse, surprising without context, and the result of a real trade-off.
- **Capture** — an actionable feature idea goes to `/capture-task`, ready to seed a later engineering session.
- **Nothing** — the understanding was the point.
