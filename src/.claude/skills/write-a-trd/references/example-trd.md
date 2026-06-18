# Example: a TRD

The engineering half of the running "real-time record presence" example, built on the accepted PRD and the feasibility verdict that chose the polling, best-effort v1. Read it for the altitude: it is all _how_ — modules, schema, contracts, tests, slices — and it references the PRD's problem/users rather than restating them. If you find yourself re-explaining why presence matters, you have drifted up into the PRD's territory.

---

# TRD: Real-time record presence (v1, polling)

## Source PRD

Accepted PRD v3 — Real-time record presence (`<link to product source>`). This TRD builds on that version's accepted Engineering Context.

## Engineering Context

Carried from the accepted PRD: v1 is **best-effort presence over short-interval polling**, no new real-time infrastructure. Presence is ephemeral and lossy by agreed tradeoff. Sub-second push is explicitly out of scope for this PRD. The presence store interface is the designated seam for a future real-time transport. No binding ADR was required — the polling-vs-push call is documented in the PRD review thread, not `docs/adr/`.

## Architecture & Modules

- **`PresenceStore` (deep module).** New module behind a small interface: `markViewing(recordId, viewer, ttl)`, `listViewers(recordId)`, and implicit expiry. v1 backs it with the existing in-process cache layer keyed `presence:<recordId>`, values as a small set of viewer ids with per-entry TTL. The interface hides the backing store entirely — swapping a real-time transport later touches nothing above it. This is the seam named in Engineering Context.
- **`presenceService`** — orchestrates: on a heartbeat it calls `markViewing` and returns `listViewers` resolved through the existing `identity` resolver (name + avatar). Authorization reuses `recordService`'s existing access check so presence never reveals a record a viewer could not already open (PRD story 5).
- **API surface** — one heartbeat endpoint (below). No change to `recordService.get()`; presence is a separate concern layered beside it, not woven into record reads.
- **Web** — a `useRecordPresence(recordId)` hook polls the heartbeat on a short interval while the record is open and clears on unmount (PRD story 3); a small presence avatar cluster renders the result on the open record only.

Reference implementation followed: the existing `useRecordLock` hook + its service pairing, which already models "open-record-scoped client polling against a per-record server state."

## Schema Changes

None. Presence is intentionally non-durable (accepted tradeoff) and lives only in the cache layer; adding it to Postgres was rejected in the feasibility review as high-churn writes the primary DB is not sized for.

## API Contracts

- `POST /records/:id/presence/heartbeat`
  - **Auth:** same record-access check as `recordService.get()`; 403 if the caller could not open the record.
  - **Request:** empty body; viewer derived from session.
  - **Effect:** `markViewing(id, sessionViewer, ttl)`.
  - **Response:** `{ viewers: Array<{ id, name, avatarUrl }> }` — current viewers excluding the caller, resolved through `identity`.
  - **Errors:** 403 unauthorized; 404 unknown record. Presence-store unavailability degrades to `{ viewers: [] }` rather than erroring — best-effort by design.

## Test Strategy

Test external behavior only. Integration tests on the heartbeat endpoint: a viewer appears to a second viewer; a viewer ages out after TTL; an unauthorized caller is rejected; store-unavailable returns empty rather than 500. Unit tests on `PresenceStore` TTL/expiry semantics via its interface (not the cache internals). Mirror the existing `recordLock` integration test file for harness and fixtures. No UI snapshot tests; the hook's clear-on-unmount is covered by a behavioral test asserting no heartbeat after teardown.

## Vertical Slices

1. **PresenceStore + TTL semantics** — AFK — blocked by: none — covers the infrastructure under stories 1, 3.
2. **Heartbeat endpoint with auth + identity resolution** — AFK — blocked by #1 — covers stories 1, 4, 5.
3. **`useRecordPresence` hook + clear-on-unmount** — AFK — blocked by #2 — covers story 3.
4. **Presence avatar cluster on open record** — HITL (brief design review of the cluster UI) — blocked by #3 — covers stories 1, 4.

Story 2 (team-lead aggregate view) is **deferred** — the PRD marks it secondary and post-v1; no slice here, by design.

## Risks & Open Engineering Questions

- Poll interval is a tradeoff between freshness and read load; start conservative and tune against real load. Not a blocker.
- The in-process cache is per-instance; across multiple app instances a viewer may not be seen by users on another instance. Acceptable for v1 best-effort; flagged as the first thing the future transport swap resolves.
