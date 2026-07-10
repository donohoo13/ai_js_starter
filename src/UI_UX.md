# UI/UX Design Principles

_Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision._

## Standards

- **Fitts's Law**: Touch targets minimum 44×44px (iOS/Android standard). Mouse targets minimum 28×28px. Larger targets = fewer errors.
- **Hick's Law**: Limit choices to 3–5 options. Each extra choice adds ~10ms decision time. More options = more confusion.
- **Reading**: Assume 200–250 wpm reading speed. 80% of users read <50% of a page—use headers, bullets, and short paragraphs.
- **Contrast**: Meet WCAG 2.1: 4.5:1 for normal text, 3:1 for large text (18px+). Use contrast checker tools.
- **Mobile-first**: 58% of web traffic is mobile. Place primary actions in bottom 60% (thumb zone).
- **Performance**: Optimize for <3s load time (53% mobile abandon >3s). 1s faster = 7% conversion increase.
- **Whitespace**: Use generous whitespace. 20% more whitespace = 20% better comprehension.
- **Navigation**: Maximum 3 clicks to reach any content. 21% drop-off per click—keep navigation shallow.
- **Accessibility**: WCAG 2.1 AA minimum: keyboard-navigable, visible focus states, `aria-label` on icon-only buttons, 44x44 minimum touch targets, AA contrast (body text 4.5:1, large headings 3:1).
- **CSS-First**: Modern CSS and browser support implementations over custom CSS frameworks or JS libraries.

### CSS

- Use **rem** for font-sizes, padding, and margins to support browser zooming.
- Use **em** for component-level scaling (e.g., button internals).
- Use **%** or viewport units (vw/vh) for layout dimensions.
- **Do not use px** for layout or typography; use only for thin borders (1px) or where absolute precision is required.
- Use `clamp()` for fluid typography (e.g., `font-size: clamp(1rem, 2vw + 1rem, 2.5rem)`) instead of fixed `em` or `rem` values for headings and body text to ensure responsiveness.
- Assume a base font size of 16px (1rem = 16px).

### Tailwind

- If a class isn't mapped to a `--color-*` var in theme.css, Tailwind v4 silently drops it — always verify against the file.
- Semantic tokens only in `.tsx`; never raw palette values (`text-neutral-600`, `bg-primary-500`) and never `dark:` overrides. If a class isn't mapped to a `--color-*` var, Tailwind v4 silently drops it, so verify against the app's CSS file.
- Use Tailwind utility classes as the primary styling method while utilizing `@utility` & `@layer` components for multi-property patterns repeated across 3+ files.

### Data Tables

These rules govern any table rendering more than a handful of rows; they extend, not replace, the brand density and border-led structure rules in `BRAND_DESIGN.md`.

- **Alignment**: Left-align text and labels; right-align all numerics so columns share a decimal axis and scan vertically. Render numeric columns in Geist Mono with consistent decimal places and thousands separators per column.
- **Sticky headers**: Column headers stay pinned during vertical scroll so context never leaves view on long tables.
- **Frozen identity column**: Pin the row-identity column during horizontal scroll so the user never loses which row they are reading across wide sets.
- **Column controls**: Support resize, show/hide toggles, and multi-level sort. Persist the user's column and sort choices across sessions; their board layout is authored prep, not transient state.
- **Row actions on demand**: Reveal per-row controls on hover and keyboard focus rather than rendering them always-on; persistent action clutter fights scanability. Hover and selected states carry emphasis through borders and primary colored selection, not heavy fills.
- **Bulk selection**: Provide row checkboxes and surface a contextual action bar only once a selection exists.
- **Virtualize, do not paginate by default**: Lazy-load and virtualize large sets with server-side sort/filter rather than rendering thousands of DOM rows. Where pagination is used instead, expose a page-size control and direct page navigation.
- **Detail without losing place**: Open row detail and side-by-side comparison in a drawer or modal over the table, never a full navigation away, so the user keeps their place in the board.
- **Responsive by relocation, not removal**: On narrow screens, keep the frozen identity column, horizontally scroll the rest by priority, and collapse secondary columns into an expandable row detail. Never drop data to fit; move it.
- **Explicit empty and loading states**: Every table states its empty and loading condition plainly in the analytical voice; never render a bare blank grid.
