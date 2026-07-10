# Example: engineering feasibility verdict

A worked verdict for a PRD that asked for "real-time presence indicators showing which teammates are currently viewing a record." Shows the altitude: grounded in specific code, framed as decisions _for product_, no solution design. This is what gets posted to the PRD's source as a threaded entry.

---

## Engineering review of PRD v2 — Real-time record presence

**Feasibility:** Feasible with tradeoffs.

### Engineering constraints

- We have no real-time transport today. Every client-facing surface in `apps/web` is request/response over the REST layer in `packages/api`; there is no WebSocket or SSE infrastructure, and the edge deployment terminates connections in a way that does not hold them open. Real-time presence needs a transport that does not exist yet.
- Record reads are not currently attributable to a live session. `recordService.get()` authorizes by user but does not register an active viewer anywhere, and there is no ephemeral store for "who is here now" — our only state stores are the primary Postgres (durable, not built for high-churn presence writes) and the per-request cache.
- Identity-to-display mapping is already solved: `packages/api/src/identity` resolves a user to name + avatar, so the "show which teammate" half is cheap. The hard part is purely the live channel.

### Required tradeoffs (product decides)

1. **Transport investment vs. polling.** True push presence requires standing up real-time infrastructure (a managed pub/sub or a stateful presence service) — a meaningful new dependency and operational surface. The cheaper path is short-interval polling (client asks "who's viewing?" every few seconds). Polling ships in a fraction of the time and reuses the existing REST layer, at the cost of a few-seconds lag and added read load. _Decision for product: is sub-second presence a real user need, or is "within a few seconds" acceptable for v1?_
2. **Presence durability.** Presence is inherently ephemeral; storing it in Postgres would add high-churn writes the primary DB is not sized for. Recommended to treat presence as best-effort and lossy (a viewer who crashes simply ages out). _Decision for product: is it acceptable that presence is approximate and occasionally shows a stale viewer for a few seconds?_

### Recommended path

Ship v1 on **polling against an in-memory presence store** keyed by record id with a short TTL, reusing the existing identity resolver for display. This avoids new standing infrastructure entirely and delivers the user-visible outcome (see who else is here) with a few-seconds lag. If usage proves the feature and product later needs true sub-second push, the presence store interface is the seam to swap a real-time transport behind — but that is a v2 investment, not a v1 prerequisite.

Relative effort: v1 polling path ≈ small. True-push path ≈ large (new infra + ops).

### Open questions for product

- Is a few-seconds lag acceptable for v1, or is sub-second presence a hard requirement? (This single answer determines small vs. large.)
- Should presence be visible on the record list, or only on the open record? The PRD implies the latter; confirming narrows scope.

### Recommendation

**Proceed with these changes:** accept the polling-based, best-effort v1 and mark sub-second push explicitly out of scope for this PRD. With those two tradeoffs accepted, this is ready for a TRD.
