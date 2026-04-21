---
name: design-review
description: Frontend design and aesthetic review that interviews the user about a page or feature, then produces a prioritized cleanup task list to modernize look, feel, and interaction quality. Use when user wants to improve UI/UX aesthetics, modernize a page, or mentions "design review".
---

Review the target page or feature for design and aesthetic quality. Interview me about intent and constraints, then produce a prioritized task list to modernize the design.

## Phase 1 — Reconnaissance

Before asking anything, gather context silently:

1. **Read the target page/component** and all components it imports.
2. **Read the project's design tokens** (CSS custom properties, Tailwind theme, font imports).
3. **Read DESIGN_PRINCIPLES.md** for existing constraints.
4. **Screenshot the page** via Chrome DevTools MCP if available — visual inspection beats code-reading for aesthetic judgment.
5. **Catalog what exists:** fonts in use, color distribution, spacing rhythm, motion/transitions, empty states, responsive behavior, background treatment.

## Phase 2 — Grill the User

Interview me relentlessly about design intent, walking each branch to resolution before moving on by using the /grill-me skill. Cover these branches:

- **Identity & mood:** What personality should this page convey? (e.g., professional-but-warm, minimal-and-sharp, playful-and-bold) What existing products or aesthetics inspire you?
- **Typography:** Are current fonts pulling their weight or just "there"? Would a distinctive typeface pairing elevate things?
- **Color & contrast:** Is the palette actively contributing to hierarchy or just filling space? Are accents sharp enough? Is there enough contrast between content tiers?
- **Layout & rhythm:** Does the grid/spacing feel intentional or default? Are there opportunities for asymmetry, visual anchors, or breathing room?
- **Motion & micro-interactions:** Where would animation add delight vs. distraction? Page load orchestration? Hover/focus states? Transitions between states?
- **Backgrounds & depth:** Is the background doing work or just `bg-white`? Could gradients, patterns, or layering add atmosphere?
- **Empty & edge states:** Do zero-data and error states feel designed or afterthought?
- **Responsive quality:** Does the mobile experience feel native or like a squeezed desktop?

Resolve each branch before opening the next.

## Phase 3 — Aesthetic Audit

After the interview, evaluate the page against these anti-patterns:

**Generic AI slop indicators:**

- Overused font families (Inter, Roboto, Arial, system fonts, Space Grotesk)
- Timid, evenly-distributed palettes with no dominant color
- Purple gradients on white backgrounds or other cliche color combos
- Predictable, symmetric layouts with no visual surprise
- Cookie-cutter component patterns indistinguishable from a template
- Solid flat backgrounds with no atmosphere or depth
- Motion limited to basic opacity fades

**What good looks like:**

- Typography choices that are beautiful, unique, and contextually appropriate
- Dominant colors with sharp accents that create hierarchy
- Backgrounds that create atmosphere — layered gradients, geometric patterns, contextual effects
- High-impact motion: orchestrated page loads with staggered reveals, meaningful state transitions
- Layouts that feel intentionally designed, not default-generated
- An overall aesthetic that surprises — drawing from IDE themes, cultural aesthetics, or unexpected references

## Phase 4 — Task List

Produce a prioritized cleanup task list. Format:

```
### Design Modernization — [Page/Feature Name]

#### High Impact
1. [Task] — [1-line rationale]
2. ...

#### Medium Impact
1. ...

#### Polish
1. ...
```

Rules for the task list:

- **Rank by visual impact per effort**, not by category.
- **Be specific:** name the file, the element, the exact change. "Improve typography" is not a task; "Swap body font from Inter to [X] in main.css, update heading weight to 600" is.
- **Respect existing design tokens and DESIGN_PRINCIPLES.md** — extend the system, don't fight it.
- **Prefer CSS-only motion.** Reference Motion libraries only for framework-specific needs.
- **Flag any change that affects shared components** so the user can assess blast radius.
- **Include before/after descriptions** for major visual changes so the user can evaluate without implementation.

After presenting the list, ask which tasks to execute and in what order.
