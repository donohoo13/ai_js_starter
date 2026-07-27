# Brand Design Principles

Brand identity for this project. Filled sections are fixed constraints: `grill-design` and `grill-product` read this file at runtime and design inside them. Bracketed placeholders mark axes not yet decided; the first `grill-design` session fills them in via its greenfield mode (offer `/curate-context` after). Balance grants against restraints when filling sections: every restraint names its sanctioned alternative ("never X; reach for Y"), because an agent given only prohibitions ships the null design, and the null design of a data app is a spreadsheet. The app's CSS is the source of truth for actual token values; read it before quoting any value in code. In monorepos, a per-app `BRAND_DESIGN.md` (e.g. `apps/<app>/BRAND_DESIGN.md`) overrides or extends this file.

## Aesthetic

[the one-paragraph visual thesis: what this product looks and feels like, and what it refuses to look like]

## Brand Personality

[3-5 adjectives, each with one sentence on how it shows up in the interface]

## Themes

[light / dark / both; which is canonical; how a theme is selected]

## Color System

- **Primary**: []
- **Secondary**: []
- **Neutrals**: []
- **Semantic** (system states only, never brand): destructive/error, success, warning, info.

## Typography

[] (display/headings), [] (body), [] (code/data). Self-hosted with `font-display: swap`. Don't add a fourth family.

## Hierarchy & Emphasis

[the ranked instrument list for making something rank first on a surface — e.g. type scale → weight → surface tone step → spacing → color, in a stated order, with borders grouping rather than ranking; this section is the grants column the restraints elsewhere point to, and a filled brand doc without it has exactly one failure mode: the uniform bordered grid. When defining the neutral scale, most steps belong to backgrounds and text, with borders drawing from a narrow low-contrast band (the Radix Colors allocation)]

## Layout

[grid system, max content widths, spacing rhythm]

## Density

[compact vs airy; how tables and dense surfaces breathe]

## Data Visualization

[chart palette derivation, mark style, axis and label rules]

## Surfaces, Borders, Shadows, and Gradients

[line-led vs fill-led vs shadow-led emphasis and why; elevation policy — dark themes elevate by lightening surface tone, since shadows don't read on dark (Material); gradient policy]

## Shape

[border-radius scale; sharp vs rounded]

## Motion

[duration range, easing, signature transitions; what never animates]

## Voice and Copy

[register for UI copy, empty states, and errors; tone boundaries]

## Anti-Goals

[what this brand must never look or sound like]
