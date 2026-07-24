# UI/UX Design Principles

Brand-agnostic usability and implementation standards. Brand identity (palette, typography, density, emphasis, voice) lives in `BRAND_DESIGN.md`, which takes precedence wherever the two overlap. Surface-level composition (the hierarchy, layout, controls, and disclosure of a specific screen) is authored per surface by the `grill-design` skill against this file; this file holds the floors every surface meets, with each rule carrying the source that grounds it.

## Standards

- **Touch targets**: interactive targets are at least 44×44px — this clears Apple HIG (44pt), WCAG 2.5.5 AAA (44px), and WCAG 2.2's AA minimum of 24×24px (2.5.8); Material asks 48dp, adopt it where the project is Material-based.
- **Choice architecture**: decision time grows logarithmically with visible options (Hick's Law). Chunk and group large option sets and disclose progressively instead of capping counts; a well-grouped long list outperforms a cramped short one (NN/g).
- **Reading**: users read roughly 20% of the words on an average page at a 200–250 wpm baseline (NN/g "How Little Do Users Read"). Write for scanning: front-loaded headings, bullets, short paragraphs.
- **Contrast**: WCAG 2.1 AA — 4.5:1 for body text, 3:1 for large text (18px+). Verify with a contrast checker, in both themes when the project ships two.
- **Mobile-first**: design the narrow viewport first and let wide viewports reveal more. Primary actions sit in the bottom-center reach zone on mobile (Hoober's grip research: roughly three quarters of mobile interactions are thumb-driven).
- **Performance**: hold Core Web Vitals "good" at the 75th percentile of real visits — LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (web.dev).
- **Navigation**: information scent beats depth limits — clear labels, breadcrumbs, and wayfinding; click count does not predict task success or satisfaction, so never flatten a hierarchy to satisfy a click ceiling (NN/g's three-click-rule debunk).
- **Accessibility**: WCAG 2.1 AA minimum — keyboard-navigable with focus order matching visual order, visible focus states, `aria-label` on icon-only controls, plus the contrast and target floors above.
- **Interaction states**: every interactive element has visible hover, focus, pressed, and disabled treatments; pressed states never shift layout; no critical action lives behind hover alone — a tap path always exists.
- **Icons**: one SVG family with a consistent stroke width per app; emoji never serve as UI icons.
- **CSS-First**: use modern native CSS capabilities over JS libraries for visual behavior (layout, animation, scroll effects); reach for JS only when CSS cannot express it.

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

### Surface Composition

Every surface is composed from its user task, never from its data payload — an uncomposed surface is the API response rendered top to bottom. The `grill-design` skill authors the composition per surface; these are the rules any composition satisfies.

- **Name the job**: every surface states the one decision or task it serves; a surface that cannot name its job does not ship a dense grid of its data.
- **Two tiers**: information ranks into a verdict tier (the few elements that answer the surface's job) and a reference tier (everything else), visually distinct in scale or weight, so something on every surface ranks first.
- **Progressive disclosure**: secondary information sits behind hover, expansion, or a drawer, never stacked at equal weight beside the primary; disclosure runs at most two levels deep (NN/g).
- **Every figure is interpretable in place**: a value carries its unit and meaning on the surface — adjacent label, control adornment, or tooltip — never only in a distant header or an external explanation.

### Spacing & Whitespace

- **Constrained scale**: every spacing value comes from the project's spacing scale on an 8px base with 4px half-steps; arbitrary one-off values never appear (Material, Carbon, and Atlassian all constrain spacing to base-unit multiples).
- **Proximity is grouping**: space within a group is smaller than space between groups; two unrelated elements sitting closer than two related ones means the spacing is wrong (Gestalt proximity, NN/g). Uniform spacing everywhere destroys grouping as surely as crowding does.
- **Tiered separation**: 0–8px inside components and groups, 12–24px between distinct elements, 32px and up between sections (Atlassian's documented tiering as the directional shape).
- **Line length**: reading text caps near `70ch` (the 45–75 characters-per-line consensus; WCAG 1.4.8 sets ≤80 as the accessibility bound).
- **Data surfaces never stretch to fill a wide viewport**: cap the container or tighten columns so row association survives — excess space between a row's cells makes related data read as unrelated (the proximity rule applied to tables); predictable columns (status, date, actions) take fixed widths and text columns flex.
- **Density is modal where it exists**: comfortable is the default; a compact mode exists only for data-dense views (tables, resource lists) and never applies to focused-input components like date pickers and alerts (Cloudscape, Material).

### Motion

- **Purpose**: motion explains what changed — entry, exit, state, hierarchy; decoration-only animation does not ship.
- **Durations**: state-change transitions run 100–300ms and large or full-surface transitions may reach ~400ms; a 0ms snap on a surface-level state change reads as broken, and 500ms+ reads as lag (NN/g's measured perception bands). Sub-100ms is fine for hover tints.
- **Asymmetry**: surface-scale elements enter at ~300ms and exit faster at ~200–250ms (NN/g); hover micro-interactions invert — snappy enter, relaxed exit.
- **Easing**: entrances decelerate (`ease-out`); `ease-in` never opens an entrance.
- **Compositor-safe properties only**: animate `transform` and `opacity`; width, height, position offsets, and layout-forcing properties are re-expressed as transforms before animating (web.dev).
- **Reduced motion**: `prefers-reduced-motion` is honored on every animation (WCAG 2.3.3 / 2.2.2).
- **Frequency budget**: high-frequency actions — context menus, repeated hovers, list item add/remove — do not animate; motion on a hundred-times-a-day interaction is fatigue, not polish (Freiberg, Kowalski).
- **Proportional scale**: dialogs animate from ~0.8 scale, never from zero; button presses compress to ~0.95, never dramatic.

### Forms

- **Labels**: persistent and above the field; a placeholder is never the label — placeholder-only fields strain memory, fail contrast, are skipped by screen readers, and lose attention (NN/g).
- **Layout**: single column; tightly-coupled pairs (city/zip, first/last name) are the sanctioned side-by-side exception (Baymard).
- **Validation timing**: on blur or on submit, never per keystroke — flagging half-typed input as wrong erodes trust (NN/g).
- **Errors**: adjacent to their field, in plain language stating what happened and how to fix it, never "invalid"/"illegal" vocabulary; multi-field forms pair inline errors with a focus-managed top summary, programmatically associated via `aria-describedby` (WCAG 3.3.1).
- **Affordances**: personal-data fields carry correct `autocomplete` tokens (WCAG 1.3.5 AA — a compliance requirement, not a convenience); `inputmode` matches the expected mobile keyboard while `type` governs semantics.
- **Required and optional are both marked explicitly** — the unmarked side causes errors and abandonment (Baymard).
- **Destructive actions confirm** before executing.

### Numeric Entry & Controls

Pick the control by what the user knows, and label the unit on the control.

- **Known exact value → direct text entry** with `inputmode="numeric"` (or `decimal`); native `<input type="number">` spinners never render on authored data-entry surfaces — GOV.UK's design system documented the replacement after assistive-tech failures, scroll-wheel value corruption, and silent exponential-notation conversion.
- **Small adjustment around a common default → stepper**; steppers fit few-tap changes of small numbers and never multi-digit precision (NN/g, Apple HIG).
- **Approximate value within a range → slider**; a slider never carries a value the user needs exact (NN/g).
- **Units live on the control** as a prefix or suffix adornment (`%`, `$`), never only in a distant column header (Material's text-field pattern).
- **Sum-constrained groups show the remainder**: a set of inputs that must total a fixed amount renders the live computed remainder (or equivalent rebalancing feedback) beside the group, and validates the sum on commit, not per keystroke.

### Feedback & Status

- **Acknowledge within ~100ms**: every action gets pressed-state, optimistic, or indicator feedback inside Nielsen's instantaneous threshold; silence after a click is where users double-submit.
- **The response ladder**: under 0.1s needs no indicator; 0.1–1s tolerates none but nothing exceeds 1s silently; over 1s shows an indicator; over 10s shows determinate progress plus a cancel path (NN/g response-time limits).
- **Indicator by wait type**: sub-second waits show nothing (no spinner flash); in-place refreshes use inline spinners; initial surface loads use skeletons held to 1–3s (Carbon); measurable operations use progress bars (Material).
- **Layout stability**: images declare dimensions or `aspect-ratio` and async content reserves its space so nothing jumps on load — CLS made concrete; lazy-load below-the-fold media.
- **Interruption hierarchy**: modals only for decisions that must block — overuse trains reflexive dismissal (NN/g); anything requiring action renders inline or as a persistent banner; toasts carry only short transient confirmations (roughly three words, Polaris), never errors, and announce via `aria-live="polite"` because self-dismissing toasts fail screen-reader users.
- **Optimistic updates** apply to low-consequence, high-success mutations with visible rollback on failure, and never to destructive or payment actions (practitioner consensus; no NN/g or Baymard treatment exists — this rule carries engineering judgment, not research).
- **Empty states teach**: name the state, say what the surface is for, and carry the action that populates it (NN/g); a bare blank region never ships.

### Data Tables

These rules govern any table rendering more than a handful of rows. They are brand-agnostic usability floors; density, emphasis treatment, and voice come from `BRAND_DESIGN.md` and take precedence where they overlap.

- **Alignment**: Left-align text and labels; right-align all numerics so columns share a decimal axis and scan vertically. Render numeric columns in the code/data (monospaced) family from `BRAND_DESIGN.md` Typography with consistent decimal places and thousands separators per column.
- **Sticky headers**: Column headers stay pinned during vertical scroll so context never leaves view on long tables.
- **Frozen identity column**: Pin the row-identity column during horizontal scroll so the user never loses which row they are reading across wide sets.
- **Column controls**: Support resize, show/hide toggles, and multi-level sort. Persist the user's column and sort choices across sessions; a configured table layout is authored work, not transient state.
- **Row actions on demand**: Reveal per-row controls on hover and keyboard focus rather than rendering them always-on; persistent action clutter fights scanability. Hover and selected states are visibly distinct without obscuring content legibility; the emphasis treatment (border, fill, or tint) follows `BRAND_DESIGN.md`.
- **Bulk selection**: Provide row checkboxes and surface a contextual action bar only once a selection exists.
- **Virtualize**: Lazy-load and virtualize large sets with server-side sort/filter rather than rendering thousands of DOM rows. Paginate only when the backend cannot serve windowed queries; a paginated table exposes a page-size control and direct page navigation.
- **Detail without losing place**: Open row detail and side-by-side comparison in a drawer or modal over the table, never a full navigation away, so the user keeps their place in the table.
- **The mobile transformation is a named choice**: tables whose rows are compared against each other keep the tabular form on narrow screens — frozen identity column, horizontal scroll by column priority, secondary columns collapsing into an expandable row detail; tables whose rows stand alone transform into stacked card rows with header labels inside each group (NN/g, GitLab Pajamas). Never drop data to fit; move it.
- **Overflow is always signaled**: horizontally scrollable content shows a visibly cut-off column or an explicit scroll affordance; clipped headers with no signal read as missing data (NN/g names unsignaled horizontal scroll a failure mode).
- **Explicit empty and loading states**: Every table states its empty and loading condition plainly in the product's voice (`BRAND_DESIGN.md` Voice and Copy) per the Feedback & Status rules above; never render a bare blank grid.

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
