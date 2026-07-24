---
type: bug | feature | chore
status: captured
created: YYYY-MM-DD
brief: docs/briefs/<file>.md
---

<!-- Status lifecycle: captured (filed, unknowns explicit) → scoped (grilled: TBDs resolved, design and slices written by grill-engineer's spec-it exit) → in-progress (implement-task is building) → done (every acceptance criterion checked). Capture always starts at `captured`; grill-engineer flips to `scoped`; implement-task owns the last two transitions. `brief:` appears only when this task is a workstream of a product brief — it back-links the brief whose Engineering grounding section holds the contracts this task copies into Design decisions; omit the key otherwise. -->

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

## Test strategy

<!-- Which seams get tested (external behavior only, never internals) and the prior-art tests in the codebase being mirrored. -->

## Slices

<!-- Ordered vertical tracer-bullet slices; list order is build order. Each slice is a thin, complete, demoable cut through every layer it touches — never a horizontal layer pass. Omit this section when the task is a single unit of work. -->

- [ ] <!-- Slice: the end-to-end behavior it delivers -->
