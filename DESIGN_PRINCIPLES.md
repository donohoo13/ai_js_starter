# Design Principles

This file provides an oppinionated UI/UX reference to Claude Code (claude.ai/code) when working with code on the frontend in this repository.

## Core Principles

- No decorative borders/shadows/gradients unless they communicate hierarchy, state, or grouping.
- WCAG 2.1 AA standards at a minimum must be followed but striving for 2.2.
- Prioritize native CSS (Flexbox, Grid, Custom Properties) over third-party packages or CSS-in-JS libraries.

## CSS Standards

- Use **rem** for font-sizes, padding, and margins to support browser zooming.
- Use **em** for component-level scaling (e.g., button internals).
- Use **%** or viewport units (vw/vh) for layout dimensions.
- **Do not use px** for layout or typography; use only for thin borders (1px) or where absolute precision is required.
- Use `clamp()` for fluid typography (e.g., `font-size: clamp(1rem, 2vw + 1rem, 2.5rem)`) instead of fixed `em` or `rem` values for headings and body text to ensure responsiveness.
- Assume a base font size of 16px (1rem = 16px).

## UI and Design Rules

- **Mobile-First Structure:** Always design for small screens (min-width approach) first, then scale up.
- **Breakpoints:** Define mobile (`< 768px`), tablet (`md:`), and desktop (`lg:`) in that order.
- **Touch Targets:** Minimum 44x44pt or 48x48dp for all interactive elements.
- **Spacing:** Use 8px grid rhythm for spacing.
- **Performance:** Ensure fast load times; optimize images and minimize heavy frameworks.
- **Accessibility:** Ensure high contrast and visible focus states for navigation.
