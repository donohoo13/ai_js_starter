---
paths:
  - '**/*.{tsx,jsx,vue,svelte,astro,mdx,html,htm,mjml,hbs,css,scss,sass,less}'
---

# UX standards

The usability and accessibility floors every user-facing surface meets, whatever it is built with. Each rule carries the source that grounds it.

Loads when a session reads a file matching the globs above, which covers every `Edit` because that tool requires a prior read of the file. Two routes reach a matching path without triggering the load: a `Write` creating a new file, which carries no read precondition, and any Bash write (`sed -i`, a `cat >` heredoc, a formatter run in place), which the load mechanism does not observe. `CLAUDE.md` names this file directly so both routes have somewhere to read it from.

This file is closed to growth. A new UI rule belongs somewhere else, and which one is decided by what the rule governs: a choice this project makes and another could reasonably make differently goes to [`BRANDING.md`](../../BRANDING.md); a convention the project's stack imposes goes to [`frontend-styling.md`](./frontend-styling.md); one surface's composition goes to that surface's artifact in `docs/designs/`, authored by `grill-design`; a pattern proven across three surfaces becomes a component, which is where reuse is recorded. A floor genuinely missing here is a finding about the template rather than a line to append, and `/template-feedback` is its channel — except in the `ai_starter` template repo itself, where that skill refuses to run because a gap found here is just work: land the floor through `/curate-context` with its source cited, since sourcing every rule is what makes an addition auditable rather than an exception.

Brand identity — palette, typography, density, emphasis, voice, and the project's own layout and motion choices — lives in `BRANDING.md`, which takes precedence wherever the two overlap.

## Standards

- **Touch targets**: interactive targets are at least 44×44px — this clears Apple HIG (44pt), WCAG 2.5.5 AAA (44px), and WCAG 2.2's AA minimum of 24×24px (2.5.8); Material asks 48dp, adopt it where the project is Material-based.
- **Choice architecture**: decision time grows logarithmically with visible options (Hick's Law). Chunk and group large option sets and disclose progressively instead of capping counts; a well-grouped long list outperforms a cramped short one (NN/g).
- **Reading**: users read roughly 20% of the words on an average page at a 200–250 wpm baseline (NN/g "How Little Do Users Read"). Write for scanning: front-loaded headings, bullets, short paragraphs.
- **Contrast**: WCAG 2.1 AA — 4.5:1 for body text, 3:1 for large text (18px+). Verify with a contrast checker, in both themes when the project ships two.
- **Performance**: hold Core Web Vitals "good" at the 75th percentile of real visits — LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (web.dev).
- **Navigation**: information scent beats depth limits — clear labels, breadcrumbs, and wayfinding; click count does not predict task success or satisfaction, so never flatten a hierarchy to satisfy a click ceiling (NN/g's three-click-rule debunk).
- **Accessibility**: WCAG 2.1 AA minimum — keyboard-navigable with focus order matching visual order, visible focus states, `aria-label` on icon-only controls, plus the contrast and target floors above.
- **Interaction states**: every interactive element has visible hover, focus, pressed, and disabled treatments; pressed states never shift layout; no critical action lives behind hover alone — a tap path always exists.
- **Icons**: one SVG family with a consistent stroke width per app; emoji never serve as UI icons. Icon character above that floor — stroke weight, filled vs outline, corner rounding — is a `BRANDING.md` decision.

## Surface Composition

Every surface is composed from its user task, never from its data payload — an uncomposed surface is the API response rendered top to bottom. The `grill-design` skill authors the composition per surface; these are the rules any composition satisfies.

- **Name the job**: every surface states the one decision or task it serves; a surface that cannot name its job does not ship a dense grid of its data.
- **Two tiers**: information ranks into a verdict tier (the few elements that answer the surface's job) and a reference tier (everything else), visually distinct in scale or weight, so something on every surface ranks first.
- **Progressive disclosure**: secondary information sits behind hover, expansion, or a drawer, never stacked at equal weight beside the primary; disclosure runs at most two levels deep (NN/g).
- **Every figure is interpretable in place**: a value carries its unit and meaning on the surface — adjacent label, control adornment, or tooltip — never only in a distant header or an external explanation.

## Spacing & Whitespace

- **Constrained scale**: every spacing value comes from the project's spacing scale; arbitrary one-off values never appear (Material, Carbon, and Atlassian all constrain spacing to base-unit multiples). The scale's base unit and its tiering are `BRANDING.md` Layout decisions; where that section is still bracketed, read the scale off the app's theme CSS, which is the source of truth for token values either way, and say the brand doc is unfilled rather than inventing a base.
- **Proximity is grouping**: space within a group is smaller than space between groups; two unrelated elements sitting closer than two related ones means the spacing is wrong (Gestalt proximity, NN/g). Uniform spacing everywhere destroys grouping as surely as crowding does.
- **Borders are the last grouping tool**: reach for spacing and a background tone step before a border; excessive borders read as clutter (Refactoring UI). A deliberately line-led brand documents that choice in `BRANDING.md`, which wins.
- **Line length**: reading text caps near `70ch` (the 45–75 characters-per-line consensus; WCAG 1.4.8 sets ≤80 as the accessibility bound).
- **Data surfaces never stretch to fill a wide viewport**: cap the container or tighten columns so row association survives — excess space between a row's cells makes related data read as unrelated (the proximity rule applied to tables); predictable columns (status, date, actions) take fixed widths and text columns flex.

## Motion

- **Purpose**: motion explains what changed — entry, exit, state, hierarchy; decoration-only animation does not ship.
- **Durations**: state-change transitions run 100–300ms and large or full-surface transitions may reach ~400ms; a 0ms snap on a surface-level state change reads as broken, and 500ms+ reads as lag (NN/g's measured perception bands). Sub-100ms is fine for hover tints. The project's chosen durations inside those bands are a `BRANDING.md` Motion decision.
- **Asymmetry**: surface-scale elements enter at ~300ms and exit faster at ~200–250ms (NN/g); hover micro-interactions invert — snappy enter, relaxed exit.
- **Compositor-safe properties only**: animate `transform` and `opacity`; width, height, position offsets, and layout-forcing properties are re-expressed as transforms before animating (web.dev).
- **Reduced motion**: `prefers-reduced-motion` is honored on every animation (WCAG 2.3.3 / 2.2.2).
- **Frequency budget**: high-frequency actions — context menus, repeated hovers, list item add/remove — do not animate; motion on a hundred-times-a-day interaction is fatigue, not polish (Freiberg, Kowalski).

## Forms

- **Labels**: persistent and above the field; a placeholder is never the label — placeholder-only fields strain memory, fail contrast, are skipped by screen readers, and lose attention (NN/g).
- **Layout**: single column; tightly-coupled pairs (city/zip, first/last name) are the sanctioned side-by-side exception (Baymard).
- **Validation timing**: on blur or on submit, never per keystroke — flagging half-typed input as wrong erodes trust (NN/g).
- **Errors**: adjacent to their field, in plain language stating what happened and how to fix it, never "invalid"/"illegal" vocabulary; multi-field forms pair inline errors with a focus-managed top summary, programmatically associated via `aria-describedby` (WCAG 3.3.1).
- **Affordances**: personal-data fields carry correct `autocomplete` tokens (WCAG 1.3.5 AA — a compliance requirement, not a convenience); `inputmode` matches the expected mobile keyboard while `type` governs semantics.
- **Required and optional are both marked explicitly** — the unmarked side causes errors and abandonment (Baymard).
- **Destructive actions confirm** before executing.

## Numeric Entry & Controls

Pick the control by what the user knows, and label the unit on the control.

- **Known exact value → direct text entry** with `inputmode="numeric"` (or `decimal`); native `<input type="number">` spinners never render on authored data-entry surfaces — GOV.UK's design system documented the replacement after assistive-tech failures, scroll-wheel value corruption, and silent exponential-notation conversion.
- **Small adjustment around a common default → stepper**; steppers fit few-tap changes of small numbers and never multi-digit precision (NN/g, Apple HIG).
- **Approximate value within a range → slider**; a slider never carries a value the user needs exact (NN/g).
- **Units live on the control** as a prefix or suffix adornment (`%`, `$`), never only in a distant column header (Material's text-field pattern).
- **Sum-constrained groups show the remainder**: a set of inputs that must total a fixed amount renders the live computed remainder (or equivalent rebalancing feedback) beside the group, and validates the sum on commit, not per keystroke.

## Feedback & Status

- **Acknowledge within ~100ms**: every action gets pressed-state, optimistic, or indicator feedback inside Nielsen's instantaneous threshold; silence after a click is where users double-submit.
- **The response ladder**: under 0.1s needs no indicator; 0.1–1s tolerates none but nothing exceeds 1s silently; over 1s shows an indicator; over 10s shows determinate progress plus a cancel path (NN/g response-time limits).
- **Indicator by wait type**: sub-second waits show nothing (no spinner flash); in-place refreshes use inline spinners; initial surface loads use skeletons held to 1–3s (Carbon); measurable operations use progress bars (Material).
- **Layout stability**: images declare dimensions or `aspect-ratio` and async content reserves its space so nothing jumps on load — CLS made concrete; lazy-load below-the-fold media.
- **Interruption hierarchy**: modals only for decisions that must block — overuse trains reflexive dismissal (NN/g); anything requiring action renders inline or as a persistent banner; toasts carry only short transient confirmations (roughly three words, Polaris), never errors, and announce via `aria-live="polite"` because self-dismissing toasts fail screen-reader users.
- **Optimistic updates** apply to low-consequence, high-success mutations with visible rollback on failure, and never to destructive or payment actions (practitioner consensus; no NN/g or Baymard treatment exists — this rule carries engineering judgment, not research).
- **Empty states teach**: name the state, say what the surface is for, and carry the action that populates it (NN/g); a bare blank region never ships.

## Data Tables

These rules govern any table rendering more than a handful of rows. They are brand-agnostic usability floors; density, emphasis treatment, and voice come from `BRANDING.md` and take precedence where they overlap.

- **Alignment**: Left-align text and labels; right-align all numerics so columns share a decimal axis and scan vertically. Render numeric columns in the code/data (monospaced) family from `BRANDING.md` Typography with consistent decimal places and thousands separators per column.
- **A table is not a net**: rows separate with hairline dividers; columns separate by alignment and spacing on the shared decimal axis, never by enclosing every cell in a box (Tufte).
- **Sticky headers**: Column headers stay pinned during vertical scroll so context never leaves view on long tables.
- **Frozen identity column**: Pin the row-identity column during horizontal scroll so the user never loses which row they are reading across wide sets.
- **Column controls**: Support resize, show/hide toggles, and multi-level sort. Persist the user's column and sort choices across sessions; a configured table layout is authored work, not transient state.
- **Row actions on demand**: Reveal per-row controls on hover and keyboard focus rather than rendering them always-on; persistent action clutter fights scanability. Hover and selected states are visibly distinct without obscuring content legibility; the emphasis treatment (border, fill, or tint) follows `BRANDING.md`.
- **Bulk selection**: Provide row checkboxes and surface a contextual action bar only once a selection exists.
- **Virtualize**: Lazy-load and virtualize large sets with server-side sort/filter rather than rendering thousands of DOM rows. Paginate only when the backend cannot serve windowed queries; a paginated table exposes a page-size control and direct page navigation.
- **Detail without losing place**: Open row detail and side-by-side comparison in a drawer or modal over the table, never a full navigation away, so the user keeps their place in the table.
- **The mobile transformation is a named choice**: tables whose rows are compared against each other keep the tabular form on narrow screens — frozen identity column, horizontal scroll by column priority, secondary columns collapsing into an expandable row detail; tables whose rows stand alone transform into stacked card rows with header labels inside each group (NN/g, GitLab Pajamas). Never drop data to fit; move it.
- **Overflow is always signaled**: horizontally scrollable content shows a visibly cut-off column or an explicit scroll affordance; clipped headers with no signal read as missing data (NN/g names unsignaled horizontal scroll a failure mode).
- **Explicit empty and loading states**: Every table states its empty and loading condition plainly in the product's voice (`BRANDING.md` Voice and Copy) per the Feedback & Status rules above; never render a bare blank grid.
