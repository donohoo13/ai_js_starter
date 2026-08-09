---
type: bug | feature | chore
status: captured
created: YYYY-MM-DD
incumbent: none | replace | extend
brief: docs/briefs/<file>.md
initiative: docs/initiatives/<file>.md
design: docs/designs/<file>.md
---

<!-- Status lifecycle: captured (filed, unknowns explicit) → scoped (grilled: TBDs resolved, design and slices written by grill-engineer's spec-it exit) → in-progress (implement-task is building) → done (every acceptance criterion checked). Capture always starts at `captured`; grill-engineer flips to `scoped`; implement-task owns the last two transitions. `brief:` appears only when this task is a workstream of a product brief — it back-links the brief whose Engineering grounding section holds the contracts this task copies into Design decisions; omit the key otherwise. `initiative:` appears only when this task was picked directly off an initiative's portfolio with no brief between — it back-links the initiative whose Direction section governs the work; omit it when `brief:` is present (the brief carries the up-link) and on standalone tasks. `design:` appears only when the task renders or reshapes a user-facing surface — it links the grill-design artifact the build is held to (a governed-verdict recorded in Design decisions satisfies the same gate); omit the key otherwise. `incumbent:` appears on every task from `scoped` onward and states what happens to the existing implementation: `none` (nothing exists to demolish), `replace` (the existing implementation dies, and `implement-task` runs a demolition pass before the first slice), or `extend` (built on in place, no demolition). It names the mechanism rather than the genre of the work, so a refactor that rewrites a module behind an unchanged interface is `replace` while a rename-only refactor is `extend`, and it is orthogonal to `type:` — a `chore` can be `replace` and a `feature` can be `extend`. `none` and `extend` each carry a one-line why in Design decisions and `replace` carries none, so the two verdicts that leave the build with no demolition to run cost the same to write and demolition is the cheapest of the three to declare; `implement-task` refuses a `none` or `extend` task missing that line, checking only that it exists. A `replace` verdict also fills the Demolition section below, which is where its zone and carve-outs live. Omit the key at capture alongside the scoped sections. -->

# Imperative title under 70 chars

## Context

<!-- Why this work exists: what triggered it, who is affected and how they experience it, why it matters now. Link relevant screens, docs, code paths, or prior discussion. -->

## Problem

<!-- What is broken, missing, or being improved. Current behavior (how the system works today: pages, flows, components, code paths affected) and desired behavior (what should happen instead: happy path plus important edge cases and error cases). -->

## Scope

- In scope (must-have):
- Nice to have:
- Out of scope (non-goals, named so the task does not expand silently):

## Requirements

<!-- Functional, technical, and UX requirements plus edge cases, one single-line bullet each. Include constraints and assumptions: technical limits, design constraints, dependencies on other decisions, anything being assumed. -->

## Acceptance criteria

- [ ] <!-- Measurable checks that define done. If done is not yet definable, a single TBD (needs grilling) item is honest and fine. -->

## Dependencies

<!-- Teams, systems, data, or approvals needed before or during the work. -->

## Risks / open questions

- [ ] <!-- Open questions, technical risks, and items needing discovery before implementation. These seed the future grilling session. -->

<!-- The sections below exist only from `scoped` onward — grill-engineer's spec-it exit adds them after a grilling session resolves the unknowns. Omit them entirely at capture. -->

## Design decisions

<!-- Engineering decisions from the grilling: modules and their interfaces/contracts, schema changes, API shapes, chosen trade-offs and why. Describe interfaces and contracts, not file paths or code snippets — those go stale. "Follows <reference implementation>" plus the deltas is a perfectly good answer for small work. -->

## Demolition

<!-- Present only when `incumbent: replace`; omit the section entirely otherwise. This is the one section that carries file paths, because the demolition pass consumes them mechanically and they die with the task rather than going stale in it. Zone: the file-level paths whose contents die, decided here with a human in the room — `implement-task` refuses a `replace` task with no zone and never draws one itself, since deriving a boundary means reading the code the pass exists to keep out of the build's context. Everything the task keeps is left out of the zone, and on surface-bearing work the keeps the replaced surface still renders are named in Survivors, because survival that nobody writes down is survival nobody can review. Carve-outs: surfaces the task preserves that live *inside* a file the zone kills, each becoming a screenshot stored under `docs/assets/<task-slug>/` and a forward requirement on the replacement; a carve-out never spares a file, because the zone is the only survival test. Survivors names files the zone never claimed, so it spares nothing either — it is the record of what the rebuild inherits. A survivor kept at named-sections grain also carries its trim into Requirements, since no pass deletes inside a file the zone never claimed. `.claude/skills/`, `.claude/agents/`, and `.claude/hooks/` paths never enter a zone without the user saying so in writing here — the AI process suite is not application code, and deleting it wholesale is the user's call alone. Connection map and the `demolition: done` marker are written into this section by `implement-task` after the pass runs. -->

**Zone**:

- <!-- file-level path whose contents die -->

**Carve-outs**: <!-- "none declared", or one line per preserved surface naming where it lives inside the zone -->

**Survivors**: <!-- "none declared", or one line per component the replaced surface still renders after the zone dies: path, grain (the whole component, or named sections of it), and the design statement it serves. Populated for surface-bearing work; a chore, dependency swap, or refactor writes "none declared". Rebuild cost is never a line's only content — a component defended solely by "extraction is cheaper than rebuilding" belongs in the zone. -->

## Test strategy

<!-- Which seams get tested (external behavior only, never internals) and the prior-art tests in the codebase being mirrored. -->

## Slices

<!-- Ordered vertical tracer-bullet slices; list order is build order. Each slice is a thin, complete, demoable cut through every layer it touches — never a horizontal layer pass. Omit this section when the task is a single unit of work. -->

- [ ] <!-- Slice: the end-to-end behavior it delivers -->
