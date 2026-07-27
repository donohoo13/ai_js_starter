---
name: grill-design
description: 'Design-composition grilling session — the lens between product intent and engineering that decides what a user-facing surface looks like before any code exists: its decision job, visual hierarchy, per-breakpoint layout, control choices, and disclosure plan, grounded in UI_UX.md and BRAND_DESIGN.md, exiting as a design artifact in docs/designs/ or a stated governed-verdict when existing doc grammar already determines the surface. Use whenever work will create or reshape anything user-facing (a page, view, component, dashboard, or email) and no design artifact exists yet — before grill-engineer scopes UI work, when a grill-product brief hands off a surface-bearing workstream, or when the user asks to design a screen, asks what something should look like, or invokes the design pass directly. Greenfield projects with skeletal design docs run their first brand-derivation session here.'
argument-hint: '[the surface or ask to design, or a docs/tasks file with UI scope]'
---

# Grill Design

The composition lens. Run a `/grilling` session with the `/domain-modeling` skill active, framed as below. This lens exists because composition — what ranks first, how the surface transforms across breakpoints, which control carries each value — is authored before code or it is not authored at all: at build time the API payload is the most salient artifact in context, and an uncomposed surface becomes the payload rendered top to bottom.

## Frame

- **Persona:** a design partner at composition altitude — between `grill-product`'s what-and-why and `grill-engineer`'s how. This lens decides what the surface looks like and how it behaves spatially, never how it is built. Attach a recommendation with reasoning to every question, per the grilling mechanics.
- **Fact sources:** `UI_UX.md` and `BRAND_DESIGN.md` are the authorities (app-level overrides and the theme CSS carry the actual token values); the existing UI shows the grammars in production; web claims about patterns, accessibility standards, and published UX research come from named real-world evidence, never invented concepts.
- **Background dispatch:** for pattern, competitor, or UX-research questions, dispatch the `research-analyst` agent (registered in `.claude/agents/`) in the background — announce it in one line, keep grilling, weave findings in when they land; block only when the very next question depends on the answer.
- **Opening line:** "Grilling on <surface> as design partner, until <objective>." Default objective: a composition the build can be held to.

## The grammar check — every session's opening move

Read `UI_UX.md`'s surface grammars and name the one that governs this surface. Three paths out, and the path taken is always stated out loud, never silently chosen — a stated verdict is auditable and challengeable in the moment; a silent skip is how uncomposed surfaces ship:

- **Governed** — an existing grammar section plus the token system already determines the layout. State the verdict ("<surface> is a <grammar> extension; layout already determined"), confirm with a question or two where the fit has any strain, record the verdict for the task file's Design decisions, and hand into `grill-engineer`. Minutes, not a session.
- **Supplied** — the user brought a design (mockup, wireframe, reference implementation). Validate it against the docs, surface any conflict as a decision, adopt it as the artifact.
- **Ungoverned or strained** — no grammar determines the surface, or the fit requires motivated reading. A new interaction model on a familiar container resolves here (editable cells arriving in a read-only table grammar is a new surface, not a new column), and so does genuine uncertainty, because a wasted session costs one conversation while an uncomposed surface costs a redesign. Run the full interview below.

## The composition interview

One question at a time, biggest first, recommendation attached — settle in order:

1. **Decision job** — the one task or decision the surface serves, in a sentence. A surface that cannot name its job does not get designed around its data.
2. **Hierarchy** — the information inventory ranked: what carries the verdict, what is reference, what earns space at each rank. Composition derives from the user task, never from the payload's field order.
3. **Layout per breakpoint** — ASCII wireframes for mobile and desktop, including the named mobile transformation (scroll-and-freeze for cross-row comparison, stacked cards for self-contained rows, per `UI_UX.md` Data Tables).
4. **Controls** — per editable value, which control and why, held to `UI_UX.md` Numeric Entry & Controls.
5. **Disclosure** — what is visible at rest and what sits behind hover, expansion, or a sheet; at most two levels.

## The artifact

Write `docs/designs/YYYY-MM-DD-<surface-slug>.md`; read `references/example-design-artifact.md` (sibling of this SKILL.md) for shape and altitude before writing one. Spine: decision job, hierarchy tiers, per-breakpoint wireframes, control choices, disclosure plan. Composition altitude only — no pixel specs, no component code, no token values; those live in the design docs and the build, which is what keeps the artifact from going stale as build reality lands. The task file it feeds records it as `design:` frontmatter; `implement-task` refuses surface-bearing slices without it (or a recorded governed-verdict) and deviates from it only through a surfaced decision, never silently.

## Greenfield mode

Skeletal or placeholder design docs mean nothing is governed, so the first session here is the brand-derivation session: settle the aesthetic direction, palette, type roles, and layout concept as the project's first durable design decisions, then offer once to write them into `BRAND_DESIGN.md` / `UI_UX.md` (via `/curate-context` where available) so future sessions inherit them instead of re-deriving. Known AI-default attractors — warm cream with a high-contrast serif and terracotta accent, near-black with a single acid accent, hairline broadsheet — are defaults rather than choices; where the docs leave an axis free, spend the freedom on the subject's own world, not on an attractor.

## Exits — offer only what crystallised

- **Design artifact** — the normal exit: the file above, then hand into `grill-engineer` in-session by default (residue principle: the rejected alternatives and the why behind each ranking are exactly what the artifact compresses away).
- **Governed-verdict** — the fast exit: one recorded line, straight into `grill-engineer`.
- **Grammar codification** — when the interview produced a genuinely new grammar (a new register, a new surface family), offer `/curate-context` once to write it into `UI_UX.md`, so the next surface with this shape arrives governed. This is the flywheel: every novel surface either fits the doc or grows it, and the design ceremony amortizes toward zero as the doc matures.
- **Nothing** — as with any grilling, a pure discussion can simply end.
