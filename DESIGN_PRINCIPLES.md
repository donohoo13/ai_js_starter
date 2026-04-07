# Design Principles

UI/UX reference for `apps/web`. These are guardrails, not handcuffs — use judgment and creativity to build beautiful, polished interfaces within this system.

## Core Principles

Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

- **Source of truth**: Prioritize root level fixes to core stylistic issues by making updates to our root theme. `@apps/talon-ui/styles/theme.css`
- **Functional clarity**: No decorative borders/shadows/gradients unless they communicate hierarchy, state, or grouping.
- **Consistency across pages**: Same loading states, card shapes, button hierarchy, spacing rhythm everywhere.
- **Semantic tokens over raw palette**: Avoid raw palette values or `dark:` overrides.
- **WCAG 2.1 AA minimum**: Keyboard-navigable, visible focus, `aria-label` on icon-only buttons.
- **Tailwind first**: Use Tailwind utility classes as the primary styling method while utilizing `@utility` & `@layer` components for multi-property patterns repeated across 3+ files.

## CSS Standards

- Use **rem** for font-sizes, padding, and margins to support browser zooming.
- Use **em** for component-level scaling (e.g., button internals).
- Use **%** or viewport units (vw/vh) for layout dimensions.
- **Do not use px** for layout or typography; use only for thin borders (1px) or where absolute precision is required.
- Use `clamp()` for fluid typography (e.g., `font-size: clamp(1rem, 2vw + 1rem, 2.5rem)`) instead of fixed `em` or `rem` values for headings and body text to ensure responsiveness.
- Assume a base font size of 16px (1rem = 16px).
- If a class isn't mapped to a `--color-*` var in theme.css, Tailwind v4 silently drops it — always verify against the file.

## UI and Design Rules

- **Mobile-First Structure:** Always design for small screens (min-width approach) first, then scale up.
- **Breakpoints:** Define mobile (`< 768px`), tablet (`md:`), and desktop (`lg:`) in that order.
- **Touch Targets:** Minimum 44x44pt or 48x48dp for all interactive elements.
- **Spacing:** Use 8px grid rhythm for spacing.
- **Performance:** Ensure fast load times; optimize images and minimize heavy frameworks.
- **Accessibility:** Ensure high contrast and visible focus states for navigation.
