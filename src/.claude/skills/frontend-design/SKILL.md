---
name: frontend-design
description: Distinctive, intentional frontend design that builds on the project's own design system instead of generic defaults. Reads the project's `BRAND_DESIGN.md` and `UI_UX.md` before proposing anything, then guides aesthetic direction, typography, layout, motion, and interaction quality to a professional floor. Use whenever creating or reshaping anything user-facing (a page, view, component, dashboard, email, or landing page), when styling, restyling, or polishing existing UI, and for UI-surface slices during task implementation, even if the user never says the word "design".
---

# Frontend Design

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.

## Project ground truth first

This skill augments the project it lives in; it never competes with it. Before proposing anything, read the project's design docs: `BRAND_DESIGN.md` and `UI_UX.md` at the repo root, any app-level overrides (e.g. `apps/<app>/BRAND_DESIGN.md`), and the app's theme/CSS file, which is the source of truth for actual token values. Precedence is strict: project docs and tokens beat every default in this skill, including its aesthetic advice, because a bold choice that fights the established brand reads as a bug, not a point of view.

- Docs filled in: treat palette, type roles, spacing, voice, and anti-goals as fixed constraints; the signature element and the aesthetic risk live inside them, on the axes the docs leave free.
- Docs skeletal or missing (greenfield): run the full process below and treat the resulting palette, type roles, and layout concept as the project's first durable design decisions. Offer once to write them into `BRAND_DESIGN.md` / `UI_UX.md` (via `/codify` where available) so future sessions inherit them instead of re-deriving from scratch.
- Either way, the Quality floor below applies in full; it is brand-agnostic and stack-agnostic.

## Ground it in the subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there is information in your memory about the human's preferences, context about what they're building, or designs you've made before, use it as a hint. The subject's own world, its materials, instruments, artifacts, and vernacular, is where distinctive choices come from. Build with the brief's real content and subject matter throughout.

## Design principles

For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer, only use it if that's truly the best option.

Typography carries the personality of the page. Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content. Where the brand docs fix the families, personality comes from scale, weight, and spacing instead.

Structure is information. Structural devices, numbering, eyebrows, dividers, labels, should encode something true about the content, not decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence, like a real process or a typed timeline where order carries information the reader needs. Question whether choices like numbered markers actually make sense before incorporating them.

Leverage motion deliberately. Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects; choose what the direction calls for. Sometimes less is more, and extra animation contributes to the feeling that the design is AI-generated.

Match complexity to the vision. Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Elegance is executing the chosen vision well.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy. Copy can make a design feel as templated as the design itself. See the writing section below for guidance.

## Process: brainstorm, explore, plan, critique, build, critique again

For calibration: AI-generated design right now clusters around three looks: (1) a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta accent; (2) a near-black background with a single bright acid-green or vermilion accent; (3) a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns. All three are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief or the project's brand docs pin down a visual direction, follow it exactly; their words always win, including when they ask for one of these looks. Where they leave an axis free, don't spend that freedom on one of these defaults. Just like a hired human designer, there's a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

Work in two passes. First, brainstorm a short design plan based on the human's design brief: create a compact token system with color, type, layout, and signature. Color: the palette as 4–6 named hex values, taken from the brand docs and theme CSS where they pin them, invented only for the axes left free. Type: the typefaces for 2+ roles (a characterful display face used with restraint, a complementary body face, and a utility face for captions or data if needed), honoring any families the brand docs fix. Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Signature: the single unique element this page will be remembered by that embodies the brief in an appropriate way.

Then review that plan against the brief and the brand docs before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief, revise that part, and say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan exactly and deriving every color and type decision from it.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and an element-based selector like .cta). This happens often with paddings/margins between sections.

Do a lot of this planning and iteration in your thinking, and only show ideas to the user when you have higher confidence it'll delight them.

## Quality floor

Ship to this floor on every pass without announcing it. These are the objective mechanics that separate "built" from "generated", and they hold regardless of aesthetic direction. Where a project doc states a different number, the doc wins.

- **States**: every interactive element has visible hover, focus, pressed, and disabled treatments. Pressed states never shift layout. Enabled controls render at full opacity; disabled ones are visually distinct and non-interactive. No critical action lives behind hover alone; always provide a tap path.
- **Motion**: transitions run 150–300ms with intentional easing; a 0ms state snap reads as broken. Motion conveys meaning (entry, exit, hierarchy) rather than decorating, and `prefers-reduced-motion` is respected.
- **Feedback**: interactions acknowledge within ~100ms (pressed state, spinner, optimistic update). Silence after a click is where users double-submit.
- **Forms**: persistent visible labels, never placeholder-as-label. Errors sit adjacent to their field and say how to fix the problem. Validate on blur, not per keystroke. Destructive actions get confirmation.
- **Stability**: images declare dimensions or `aspect-ratio`; reserve space for async content so nothing jumps on load; lazy-load below-the-fold media.
- **Icons**: one SVG family with a consistent stroke width throughout. Never emoji as UI icons; it is the loudest single tell of templated AI output.
- **Both themes**: if the project ships light and dark modes, verify contrast and state distinguishability in both, not just the mode you built in.
- **Access**: keyboard focus order matches visual order, with visible focus rings; icon-only controls carry `aria-label`. Contrast and touch-target minimums come from the project's `UI_UX.md`; absent docs, hold WCAG 2.1 AA (4.5:1 body text, 3:1 large text) and 44×44px touch targets.

## Restraint and self-critique

Spend your boldness in one place. Let the signature element be the one memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Not taking a risk can be a risk itself! Build to the Quality floor without announcing it. Critique your own work as you build, taking screenshots if your environment supports it (the project's `CLAUDE.md` may name a UI verification tool, e.g. Playwright); a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creators have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

## More on writing in design

Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration. Bring the same intentionality to copy that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's side of the screen. Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config. Describe what something does in plain terms rather than selling it. Being specific is always better than being clever.

Use active voice as default. A control should say exactly what happens when it's used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the register conversational and tuned: plain verbs, sentence case, no filler, with tone matched to the brand and the audience (the voice and copy section of `BRAND_DESIGN.md`, where present, is the authority). Let each element do exactly one job. A label labels, an example demonstrates, and nothing quietly does double duty.
