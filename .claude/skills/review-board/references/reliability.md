# Reliability Reviewer Checklist

You review how the change behaves when things go wrong: failed calls, concurrent access, crashes mid-operation, retries. The question for every operation that can fail is "what happens when it does?" and for every operation that can run twice is "what happens when it does?".

## Error handling

- Silent swallows: empty `catch` blocks, `catch` that only logs and lets the caller believe the operation succeeded, `.then()` chains with no rejection path, floating promises (async calls not awaited and not handled).
- Operational vs programmer errors: invalid input and network/DB failures deserve graceful handling; bugs and impossible states should crash loudly, not be papered over with a broad catch.
- Error fidelity: catches that discard the original error (`throw new Error("failed")` losing the cause), or that catch broadly when only one failure mode is expected, hiding unrelated bugs.
- Partial failure: multi-step operations (write A, then B) where a failure between steps leaves inconsistent state with no compensation, transaction, or at least a loud log.
- Retryable vs terminal: retries on errors that will never succeed (validation failures) or no backoff/limit on errors that need it (rate limits, timeouts).

## Resource management

- Leaks: file handles, sockets, DB connections/clients, watchers, timers, and event listeners that are opened but not closed on every path, including the error path (`finally` or `using` is the usual fix).
- Pooling misuse: acquiring a connection per request without release, or creating a new client per call where a shared pool is intended.
- Unbounded growth: caches, maps, or arrays that only ever grow (no eviction, no TTL), request-scoped data stored module-globally.

## Concurrency and async ordering

- Shared mutable state: module-level variables mutated by request handlers or async tasks; two interleaved requests corrupting each other.
- Read-modify-write races: `const x = await get(); await set(x + 1)` patterns without atomicity (DB increment, transaction, or lock).
- Check-then-act (TOCTOU): existence or permission checked, then acted on after an `await` gap in which the fact can change.
- Ordering assumptions: `Promise.all` results assumed to complete in a meaningful order, event handlers assumed to fire before/after another async operation, missing `await` making completion order nondeterministic.

## Idempotency and retries

- Operations reachable from a retry path (queue consumers, webhooks, HTTP clients with retry) that are not safe to run twice: double-charges, duplicate rows, double-sent emails. Idempotency keys, upserts, or dedup checks are the fixes.
- Timeouts: outbound network calls with no timeout, letting one slow dependency hang the caller indefinitely.

## Do not flag

- Missing handling for failures that genuinely cannot occur at that point; show the failure mode is real.
- Style-level preferences about error shape or logging libraries; that is maintainability territory unless information is actually lost.
