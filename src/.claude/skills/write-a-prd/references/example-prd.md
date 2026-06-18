# Example: a product-altitude PRD

A worked PRD for "real-time presence indicators showing which teammates are currently viewing a record." Read it for the altitude: it says what the user needs and why, and contains **zero implementation** — no transport choice, no store, no schema, no polling-vs-push. Those belong to `/prd-feedback` and `/write-a-trd`. If your draft names a technology or a data structure, you have dropped altitude.

The `Engineering Context` section is left empty here on purpose — product does not write it; `/prd-feedback` fills it once a version is accepted.

---

# PRD v1 — Draft

## Problem Statement

When several teammates work the same customer record, they collide: two people edit the same field, or one reaches out to a customer a colleague is already handling. Today nothing signals that someone else is looking at the same record, so the team finds out about the collision after it has already happened — duplicate work, mixed messages to customers, and eroded trust in the data.

## Solution

While viewing a record, a user can see at a glance which teammates are also viewing it right now. The moment someone else opens the record, their presence appears; when they leave, it clears. The user can tell, without asking in chat, whether they are about to step on someone's work.

## User Stories

1. As a support agent, I want to see which teammates are viewing a record I open, so that I can avoid duplicating outreach already in progress.
2. As a team lead, I want to see when multiple agents converge on the same record, so that I can rebalance workload.
3. As an agent, I want my own presence to clear when I navigate away, so that I do not appear to be holding a record I have left.
4. As an agent, I want to recognize who is present by name and face, so that I can reach the right colleague directly.
5. As an agent working a sensitive record, I want presence to respect existing record access rules, so that no one sees a record they could not already open.

## Success Metrics

- A measurable drop in duplicate-outreach incidents on shared records.
- Agents self-report fewer "I didn't know you had it" collisions.
- Feature is used, not ignored: a meaningful share of multi-viewer records show presence being acted on (a viewer backing off or coordinating).

## Priority & Scope

First priority is presence on the open record (stories 1, 3, 4, 5) — that is where collisions happen and is the core value. The lead's aggregate view (story 2) is valuable but secondary and can follow.

## Out of Scope

- Editing locks or any enforcement — this surfaces presence, it does not prevent concurrent edits.
- Presence anywhere other than an open record (no list-level or dashboard presence in this PRD).
- History of who viewed a record in the past; this is about _now_, not an audit trail.

## Open Questions

- How fresh does "now" need to feel to be useful — is a short lag acceptable, or does collision-avoidance require it to feel instantaneous? (Flagged for `/prd-feedback`; has engineering cost implications.)
- Should presence ever be visible at the record-list level later, or is the open record the permanent boundary?

## Engineering Context

_Left empty by product. `/prd-feedback` fills this with the digest of the accepted feasibility review — agreed constraints, tradeoffs, and the chosen implementation path — and links any binding decisions recorded as ADRs in `docs/adr/`._
