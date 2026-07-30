# Example design artifact

A worked example of a `docs/designs/` file at the right altitude — composition decisions only, no pixel specs, no component code, no token values. The surface: a usage-and-billing breakdown page for a SaaS product, chosen because it is the classic dense-data trap (an API returns per-day per-feature usage rows; the uncomposed version renders them as one flat table).

The artifact is plain markdown; the layout wireframes live in fenced `text` blocks so formatters leave their alignment alone.

---

```text
---
surface: usage-billing-breakdown
created: 2026-07-24
---

# Usage & billing breakdown

## Decision job

Answer "am I going to blow through my plan this month, and what is causing
it?" — a monthly-cadence check-in, not a monitoring dashboard.

## Experience intent

- The verdict reads in one glance: projected spend, days left, and the named
  driver land without scrolling, expanding, or cross-referencing anything.
- Reads as a monthly check-in, not a monitoring wall: one screen, a handful
  of figures, nothing live-updating or exhaustively enumerated.
- Every region earns its space at rest — no region is a lone figure adrift
  in whitespace, and none is a wall of undifferentiated rows.
- Why look: it answers the money question in seconds and names the culprit
  in words, which no raw usage table does.

## Hierarchy

- Verdict tier: projected month-end spend vs plan allowance (the one number),
  days remaining, and the single largest cost driver named in words. These
  answer the decision job alone.
- Reference tier: per-feature usage split (current period), trend vs last
  period.
- Archive tier (behind disclosure): per-day rows, per-key breakdowns,
  historical periods.
- The API's per-day rows are the lowest rank despite being the payload's
  primary shape — the payload does not set the hierarchy.

## Layout

Desktop (content capped, not full-bleed — see UI_UX.md Spacing & Whitespace):

+----------------------------------------------------------+
| Projected spend $412 / $500          12 days left        |
| "Driven by transcription usage, up 40% vs June"          |
+----------------------------------------------------------+
| Per-feature split (bar list, sorted by cost)             |
|   transcription   ███████████████  $210  up 40%          |
|   storage         ██████           $88   flat            |
|   api-calls       ███              $41   down 5%         |
+----------------------------------------------------------+
| [View daily detail]  [Download CSV]                      |
+----------------------------------------------------------+

Mobile: same order, single column; the bar list rows are self-contained (no
cross-row comparison of multiple columns), so rows keep their bar-plus-figures
shape stacked full-width — no horizontal scroll needed. The verdict block
stays above the fold.

## Controls

- Period selector: segmented control (small fixed option set, single-select).
- Plan-limit alert threshold: direct text entry with a "$" prefix adornment —
  a known exact value, so no stepper, no slider (UI_UX.md Numeric Entry &
  Controls).

## Disclosure

- At rest: verdict block + per-feature split.
- One level down: "View daily detail" expands the per-day table for the
  selected feature (in place, not a navigation).
- Never exposed on this surface: per-key breakdowns (they live on the
  API-keys page, which owns that job).

## Rejected

- A calendar heat-map of daily usage: monitoring-shaped, wrong cadence for
  the decision job.
- Rendering all features' daily rows in one table: the payload's shape, not
  the user's question.
```

---

When the session ran the Supplied path (the user brought a mockup, wireframe, or reference), the artifact additionally carries the stored source and its fidelity inventory — frontmatter and one section, alongside everything above. In this variant the source shows six features where the interview-derived wireframe above drew three: on the Supplied path the inventory governs quantities, so the wireframe is redrawn to the inventory's counts during the contract's cumulative re-examination — a disagreement between an artifact's own sections is resolved at design time, never left for the build to arbitrate:

```text
---
surface: usage-billing-breakdown
created: 2026-07-24
source:
  - docs/designs/assets/2026-07-24-usage-billing-breakdown/desktop.png # desktop breakpoint
  - docs/designs/assets/2026-07-24-usage-billing-breakdown/mobile.png # mobile breakpoint
---

## Source fidelity

- Verdict block: three figures plus one sentence in the source — never a
  lone number in space.
- Per-feature split: six rows visible at rest in the source; the surface
  ships six, not a trimmed three.
- Each bar row carries an inline delta (value plus trend) at desktop scale.
- Fill: the split spans the full content width; no region reads emptier
  than its source counterpart.
```

---

Notes on altitude, using the example above:

- Every section answers a question the build would otherwise answer by accident. Nothing in the file constrains implementation choices the build owns (component library, exact spacing values, colors).
- An intent statement earns its place only if a plausible wrong render would violate it — the same admission bar context-file curation applies to rules, transposed to feel. "Feels premium" fails nothing; every assertion in the example above would fail a real, plausible bad render.
- On the Supplied path the two sections divide one contract: Experience intent names the effect the source achieves, Source fidelity names the quantities that achieve it — both transcribed or derived from the source, never filled by reference to an incumbent implementation of the surface.
- The `source:` entries are repo-root paths like `design:`, each labeled with what it covers, so a build session diffs its mobile render against the mobile export instead of reporting phantom drift against the desktop one. Entries resolve only inside `docs/designs/assets/`; an entry escaping that directory is refused, not read.
- The wireframe is a ranking device, not a spec — it fixes what sits above what and what shares a row, and the build styles it with the token system.
- The Rejected section is short but load-bearing: it carries the interview residue the artifact would otherwise compress away, so the build does not re-propose a rejected shape.
