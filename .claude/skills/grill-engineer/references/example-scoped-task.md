# Example: a scoped task file

A worked example of a task file at `status: scoped` — the artifact grill-engineer's spec-it exit produces — for the running "real-time record presence" feature. Read it for the altitude and shape before writing one: it is all _how against this codebase_ — decisions, contracts, tests, slices — with the why compressed into Context/Problem rather than re-argued.

The template (`capture-task/assets/task-template.md`) is the spine, not a form to fill: the grilling session shapes each section, sections grow or shrink to fit the work, and a small chore's scoped file might be twenty lines where this one is a full feature. What never flexes: unknowns stay explicit as `TBD (needs grilling)`, acceptance criteria are objectively checkable, and slices are vertical cuts in build order.

The `incumbent: none` in the frontmatter below is the greenfield case — nothing implements presence today, so there is nothing to demolish — and Design decisions carries its one-line why, as `extend` does too: both leave the build with no demolition to run, so both cost the same sentence. A task reshaping something that already ships records `replace`, owes no explanation at all, and adds a **Demolition** section carrying the zone, the carve-outs, and the survivors the grilling drew; there is none below because this task has nothing to tear down, so all three are described in the template's own comments rather than demonstrated here.

---

```
---
type: feature
status: scoped
created: 2026-07-11
incumbent: none
---
```

# Show who is viewing a record in real time

## Context

Support teams collide on shared customer records: two agents edit the same field, or one contacts a customer a colleague is already handling. Surfaced repeatedly in support-team retros; collisions are discovered after the fact, causing duplicate work, mixed messages to customers, and eroded trust in the data.

## Problem

Nothing today signals that a teammate has the same record open. Desired: while viewing a record, a user sees which teammates are viewing it right now — presence appears when someone opens the record, clears when they leave, and is recognizable by name and avatar.

## Scope

- In scope (must-have): presence on the open record — see current viewers by name/avatar, own presence clears on navigate-away, presence respects existing record access rules.
- Nice to have: team-lead aggregate view of multi-viewer records (deferred post-v1 by explicit agreement, not oversight).
- Out of scope (non-goals, named so the task does not expand silently): edit locks or any enforcement; presence anywhere other than an open record; history of past viewers.

## Requirements

- Best-effort presence over short-interval polling; no new real-time infrastructure (grilling decision: v1 is intentionally lossy and ephemeral; sub-second freshness explicitly not required).
- Presence never reveals a record the viewer could not already open — reuse the existing record access check, not a parallel one.
- Presence data is non-durable and lives in the cache layer, not Postgres (high-churn writes on the primary DB rejected during grilling).

## Acceptance criteria

- [ ] A second viewer opening a record appears to the first within one poll interval.
- [ ] A viewer who navigates away stops appearing within the TTL, with no explicit sign-off action.
- [ ] A caller without access to the record receives 403 from the heartbeat and never sees its viewers.
- [ ] Presence-store unavailability degrades to an empty viewer list, never an error surfaced to the user.

## Dependencies

None external; reuses the existing cache layer, identity resolver, and record access check.

## Risks / open questions

- [ ] Poll interval trades freshness against read load; start conservative and tune against real load. Not a blocker.
- [ ] The in-process cache is per-instance, so viewers on different app instances may not see each other. Accepted for v1 best-effort; first thing a future transport swap resolves.

## Design decisions

- `PresenceStore` is a deep module behind a small interface — `markViewing(recordId, viewer, ttl)`, `listViewers(recordId)`, implicit expiry — backed by the existing in-process cache keyed `presence:<recordId>`. The interface hides the backing store entirely, so swapping in a real-time transport later touches nothing above it.
- `presenceService` orchestrates: a heartbeat calls `markViewing` and returns `listViewers` resolved through the existing identity resolver (name + avatar); authorization reuses the record service's access check.
- API: `POST /records/:id/presence/heartbeat` — empty body, viewer derived from session; responds `{ viewers: [{ id, name, avatarUrl }] }` excluding the caller; 403 unauthorized, 404 unknown record; store-unavailable degrades to an empty list by design.
- No schema changes — presence is intentionally non-durable.
- Reference implementation: the existing record-lock hook + service pairing, which already models "open-record-scoped client polling against per-record server state"; the web side is a `useRecordPresence(recordId)` hook that polls while the record is open, clears on unmount, and feeds a small presence avatar cluster.
- Surface governed-verdict: the presence avatar cluster is an instance of the existing `AvatarStack` component (props `users`, `max`, `size`), sitting in the record header's existing composition; layout already determined, no design artifact. Intent assertions, which every governed-verdict carries because a component supplies structure and never at-rest feel: presence registers at a glance without competing with the record's own content, and zero viewers renders as absence rather than as an empty frame.
- `incumbent: none`: nothing tracks or displays who is viewing a record today, so there is no existing implementation to demolish or build on.

## Test strategy

Integration tests at the heartbeat endpoint seam: a second viewer appears; a viewer ages out after TTL; an unauthorized caller is rejected; store-down returns an empty list rather than 500. Unit tests on `PresenceStore` TTL/expiry semantics through its interface, never the cache internals. Mirror the record-lock integration test file for harness and fixtures. The hook's clear-on-unmount is covered behaviorally (no heartbeat after teardown), not by snapshots.

## Slices

- [ ] `PresenceStore` with TTL semantics — the infrastructure under criteria 1–2.
- [ ] Heartbeat endpoint with auth + identity resolution — criteria 1, 3, 4.
- [ ] `useRecordPresence` hook with clear-on-unmount — criterion 2.
- [ ] Presence avatar cluster on the open record — the user-visible payoff, built to the governed-verdict recorded in Design decisions.
