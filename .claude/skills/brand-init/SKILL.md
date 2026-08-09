---
name: brand-init
description: 'Brand-derivation grilling session and the sole owner of filling BRANDING.md — interviews the user from bracketed scaffold to governing document: brand foundations (audience, promise, positioning), identity tokens (palette, typography, logo, shape, themes), anchored steering sections, four-part voice, and anti-goals, opening on a mood-board gate that distills images from docs/branding/moodboard/ into written direction. Use when BRANDING.md is skeletal or placeholder-bracketed and brand decisions are needed — a new project deriving its brand for the first time, the user saying "set up the brand", "fill in BRANDING.md", "derive the brand", or "run brand-init", the user accepting grill-design's signpost after it stopped on ungoverned docs, or a brand refresh after a repositioning. User-invoked and re-runnable; never auto-chained by another skill.'
argument-hint: '[optional: the product or brand direction to derive from]'
---

# Brand Init

The brand-derivation ceremony. Run a `/grilling` session with the `/domain-modeling` skill active, framed as below — the same composition as the grill lenses, under its own frame. This skill exists because brand decisions made as side effects of building one surface (a palette picked for a dashboard, a voice invented for one error message) are exactly the drift `BRANDING.md` prevents: `grill-design` refuses to derive brand inline and signposts here, and this session settles the identity once so every later surface inherits it. Re-runs are brand refreshes: diff against the filled doc, and a contradiction with a standing statement halts for the user to pick the survivor, per `curate-context`.

Read `references/brand-research.md` before the first question — it carries the locked evidence base (which text devices actually steer AI output, the mood-board method, evidence grades) and the rationale behind the doc's two-tier structure, so neither gets re-derived or re-litigated in-session.

## The mood-board gate — every session's opening move

Check `docs/branding/moodboard/` for image files. State what was found; the path taken is the user's choice, never silent:

- **Images present** → run the interview with distillation (below) as the aesthetic backbone.
- **Absent or empty** → one confirm offering both paths: **stop and curate** (recommended — hand over the curation guidance below, end the session, and derive in a fresh one once the board exists), or **continue without** — anchor interrogation replaces image distillation: interview the user for shipped products they admire per axis (density, warmth, type character, motion) and what specifically they take from each. Continuing without a board is a differently-curated session, not a degraded one.

Curation guidance to hand the user at the stop: collect a focused handful of images, not dozens; pull mood, tone, and texture references from aspirational sources (Dribbble) and keep the board at that altitude — a board full of product screenshots collapses into a competitive-reference board and pulls toward imitation (NN/g's documented warning); shipped products the user admires (Mobbin finds, real apps they use) enter as names for the Reference Anchors question, never as screenshots on the board; in a public repo add `docs/branding/moodboard/` to `.gitignore` so the board stays local at the path the gate checks while others' copyrighted work stays uncommitted.

## Frame

- **Persona:** a brand partner — strategy, visual identity, and voice fluency in one seat. Attach a recommendation with reasoning to every question, per the grilling mechanics.
- **Fact sources:** `references/brand-research.md` for the evidence base; `docs/company/company-overview.md` for existing company narrative (mine it before asking foundations questions — confirm, don't re-derive); the app's CSS for any token values already real; `.claude/rules/ux-standards.md` for the usability floors identity choices must clear (contrast, targets), read by path at the start of the session because that file's glob covers frontend source and this session opens none. Web claims about competitors, patterns, or market conventions dispatch the `research-analyst` agent in the background — announce in one line, keep grilling, weave findings in when they land.
- **Opening line:** "Grilling on <project>'s brand as brand partner, until `BRANDING.md` governs."

## Distillation — board to text

The board is inspiration; the written doc is the goal. Per image or visual cluster, ask what draws the user to it, then extract attributes — mood, color temperature, density, type character, surface treatment — never a layout or palette wholesale, because the distillation's job is a brand of its own, not a collage of others'. An image the user cannot articulate a pull for gets dropped from consideration. The extracted attributes feed the Aesthetic thesis, Reference Anchors, and identity-token recommendations; the board itself is not referenced by the finished doc.

## The interview

Walk `BRANDING.md` top-down — its preamble carries the fill grammar (two tiers, anchored adjectives, grants balanced against restraints), so the doc governs its own filling and this skill does not restate it. One question at a time, biggest first, recommendation attached:

1. **Foundations** — audience, promise, positioning, messaging pillars. These filter everything below; settle them first.
2. **Aesthetic thesis, personality, and anchors** — from distillation or anchor interrogation: one paragraph of what it looks and feels like and what it refuses, 3-5 personality adjectives each with how it shows up in the interface, and 2-4 shipped-product anchors with take/leave lines.
3. **Identity tokens** — palette, type roles, logo rules, shape, themes. Exact values, verified against `ux-standards.md` contrast floors before landing. Known AI-default attractors — warm cream with a high-contrast serif and terracotta accent, near-black with a single acid accent, hairline broadsheet — are defaults rather than choices; where an axis is free, spend the freedom on the product's own world, not on an attractor.
4. **Steering sections** — hierarchy instruments, layout, density, surfaces, motion, data visualization, imagery and iconography.
5. **Voice** — the four parts: anchored traits, register bounds, use/avoid vocabulary, one exemplar per fixed context.
6. **Anti-Goals last** — harvest them from the interview itself: every direction the user rejected above is a candidate negative constraint, and negative constraints are the doc's highest-leverage steering device.

## Exit

Write the filled `BRANDING.md` through `/curate-context` — this skill is not one of the design docs' carve-out lenses, so load it rather than writing the file directly — in strict present tense with absolutes, per the AI context file rules in `CLAUDE.md`. Offer an ADR via `/domain-modeling` only for a brand decision that clears the three-part bar (hard to reverse, surprising without context, a real trade-off) — rare; most brand choices are revisable and the doc itself is their record. Close by noting that surface work now enters through `/grill-me design` as normal, since the brand can now govern its identity questions and its component survey runs against whatever the library holds.
