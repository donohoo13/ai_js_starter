---
paths:
  - '**/*.{tsx,jsx,vue,svelte,astro,mdx,html,htm,css,scss,sass,less}'
---

# Frontend styling conventions

How this project writes styles. The usability floors these styles must clear live in [`ux-standards.md`](./ux-standards.md); the palette, type scale, spacing rhythm, and motion character they express live in [`BRANDING.md`](../../BRANDING.md).

Loads when a session reads a file matching the globs above, which covers every `Edit` because that tool requires a prior read of the file. Two routes reach a matching path without triggering the load: a `Write` creating a new file, which carries no read precondition, and any Bash write (`sed -i`, a `cat >` heredoc, a formatter run in place), which the load mechanism does not observe. `CLAUDE.md` names this file directly so both routes have somewhere to read it from.

**[`transactional-email.md`](./transactional-email.md) overrides this file on every path it matches.** Its globs sit inside these, so both load on an email template, and the rules genuinely conflict there: an email client needs nested tables, inline styles, and a `600px` column, all of which these rules forbid. On an email path, follow that file and treat this one as inert.

This is the file that tracks the project's stack: `project-init` prunes or swaps the styling-system section below to whatever the destination actually uses, and deletes the file outright when the destination ships no UI.

## Units and scaling

- **CSS-First**: use modern native CSS capabilities over JS libraries for visual behavior (layout, animation, scroll effects); reach for JS only when CSS cannot express it.
- Use **rem** for font-sizes, padding, and margins to support browser zooming.
- Use **em** for component-level scaling (e.g., button internals).
- Use **%** or viewport units (vw/vh) for layout dimensions.
- **Do not use px** for layout or typography; use only for thin borders (1px) or where absolute precision is required.
- Use `clamp()` for fluid typography (e.g., `font-size: clamp(1rem, 2vw + 1rem, 2.5rem)`) instead of fixed `em` or `rem` values for headings and body text to ensure responsiveness.
- Assume a base font size of 16px (1rem = 16px). A project that steps the root away from that default documents the value where it sets it, since every rem-authored size in the app scales with it.

## Tailwind

These rules apply when the project uses Tailwind (v4); they are inert otherwise.

- Use Tailwind utility classes as the primary styling method while utilizing `@utility` & `@layer` components for multi-property patterns repeated across 3+ files.
- Semantic tokens only in component files; never raw palette values (`text-neutral-600`, `bg-primary-500`) and never `dark:` overrides.
- If a class isn't mapped to a `--color-*` var in the app's CSS file, Tailwind v4 silently drops it — always verify against the file.
