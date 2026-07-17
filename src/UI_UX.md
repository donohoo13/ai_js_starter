# UI/UX Design Principles

Brand-agnostic usability and implementation standards. Brand identity (palette, typography, density, emphasis, voice) lives in `BRAND_DESIGN.md`, which takes precedence wherever the two overlap.

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
- **CSS-First**: Use modern native CSS capabilities over JS libraries for visual behavior (layout, animation, scroll effects); reach for JS only when CSS cannot express it.

### CSS

- Use **rem** for font-sizes, padding, and margins to support browser zooming.
- Use **em** for component-level scaling (e.g., button internals).
- Use **%** or viewport units (vw/vh) for layout dimensions.
- **Do not use px** for layout or typography; use only for thin borders (1px) or where absolute precision is required.
- Use `clamp()` for fluid typography (e.g., `font-size: clamp(1rem, 2vw + 1rem, 2.5rem)`) instead of fixed `em` or `rem` values for headings and body text to ensure responsiveness.
- Assume a base font size of 16px (1rem = 16px).

### Tailwind

These rules apply when the project uses Tailwind (v4); they are inert otherwise.

- Use Tailwind utility classes as the primary styling method while utilizing `@utility` & `@layer` components for multi-property patterns repeated across 3+ files.
- Semantic tokens only in `.tsx`; never raw palette values (`text-neutral-600`, `bg-primary-500`) and never `dark:` overrides.
- If a class isn't mapped to a `--color-*` var in the app's CSS file, Tailwind v4 silently drops it — always verify against the file.

### Data Tables

These rules govern any table rendering more than a handful of rows. They are brand-agnostic usability floors; density, emphasis treatment, and voice come from `BRAND_DESIGN.md` and take precedence where they overlap.

- **Alignment**: Left-align text and labels; right-align all numerics so columns share a decimal axis and scan vertically. Render numeric columns in the code/data (monospaced) family from `BRAND_DESIGN.md` Typography with consistent decimal places and thousands separators per column.
- **Sticky headers**: Column headers stay pinned during vertical scroll so context never leaves view on long tables.
- **Frozen identity column**: Pin the row-identity column during horizontal scroll so the user never loses which row they are reading across wide sets.
- **Column controls**: Support resize, show/hide toggles, and multi-level sort. Persist the user's column and sort choices across sessions; a configured table layout is authored work, not transient state.
- **Row actions on demand**: Reveal per-row controls on hover and keyboard focus rather than rendering them always-on; persistent action clutter fights scanability. Hover and selected states are visibly distinct without obscuring content legibility; the emphasis treatment (border, fill, or tint) follows `BRAND_DESIGN.md`.
- **Bulk selection**: Provide row checkboxes and surface a contextual action bar only once a selection exists.
- **Virtualize, do not paginate by default**: Lazy-load and virtualize large sets with server-side sort/filter rather than rendering thousands of DOM rows. Where pagination is used instead, expose a page-size control and direct page navigation.
- **Detail without losing place**: Open row detail and side-by-side comparison in a drawer or modal over the table, never a full navigation away, so the user keeps their place in the table.
- **Responsive by relocation, not removal**: On narrow screens, keep the frozen identity column, horizontally scroll the rest by priority, and collapse secondary columns into an expandable row detail. Never drop data to fit; move it.
- **Explicit empty and loading states**: Every table states its empty and loading condition plainly in the product's voice (`BRAND_DESIGN.md` Voice and Copy); never render a bare blank grid.

### Transactional Emails

Transactional emails (verification, password reset, email-change confirmation) are customer-facing brand
surfaces rendered in the most hostile client environments products touch: Outlook desktop renders HTML through
Word's engine, Gmail strips and clips markup, and dark-mode clients recolor without permission. These rules govern
every email template. BRAND_DESIGN.md voice rules and the no-em-dash rule apply to all email copy.

- Tables carry layout, inline CSS carries style: layout is nested tables with role="presentation", never flex/grid (partial support in Gmail and Outlook at best), and every load-bearing style is inline. A <style> block is progressive enhancement only (media queries, dark mode): Gmail drops the entire block past 8,192 characters or on a single CSS parse error.
- One column, 600px: content is a single column at 600px max width, readable at mobile widths without media queries (Gmail and Outlook support them only partially).
- Padding, never margin: spacing lives in table-cell padding; margin is unreliable across clients and negative margins silently break in both Gmail and Outlook.
- Bulletproof CTA: the action button is a live-text link styled inline with a 44×44px minimum touch target, wrapped in the MSO conditional/VML fallback so Outlook renders the fill and rounding; never an image button. border-radius or a background image without a VML + solid-color fallback renders as nothing in Outlook.
- Dark mode is declared, then defended: color-scheme and supported-color-schemes meta tags in the head, prefers-color-scheme overrides in the style block, a midtone palette instead of pure black/white, and logos and transparent images carry a subtle outline so they survive clients that force-invert (Gmail iOS, Outlook Windows).
- System-stack fallbacks always: Gmail and Yahoo drop web fonts entirely; every font declaration ends in a system stack, and the brand fonts are an enhancement for the clients that keep them, never assumed.
- Text-first, never image-only: the message survives with all images blocked (Outlook's default); images are HTTPS-hosted with explicit dimensions, 2x exports for retina, and styled alt text.
- Plain-text part always: every email ships a multipart/alternative plain-text version, where auth links appear as literal URLs — phishing resistance for exactly the emails we send.
- Authored preheader: the preview line after the subject is deliberate copy, never whatever text happens to render first.
- Stay under the clip: total HTML stays well below Gmail's ~102KB clipping threshold, which truncates mid-markup and can break the layout it cuts.
- Accessible like the app: semantic headings, lang on the root element, 16px body-copy floor, WCAG AA contrast per the Standards above.
- Banned in email: JavaScript, forms, video, CSS positioning, negative margins, and checkbox/hover interactivity hacks; every one is stripped or silently breaks somewhere in the client set.
