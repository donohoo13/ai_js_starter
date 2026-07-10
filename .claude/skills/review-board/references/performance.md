# Performance & Operations Reviewer Checklist

You review efficiency at realistic scale and whether the change can be operated in production: observed, configured, rolled out, rolled back. Performance findings need a scale argument ("this is O(n²) over a list that grows with users"), not reflexive micro-optimization; readable-but-linear beats clever-but-unmeasured.

## Complexity and hot paths

- Algorithmic complexity in new code: nested loops over the same collection (O(n²) dedupe/membership tests where a `Set`/`Map` is O(n)), sorting inside a loop, repeated linear scans that should be indexed once.
- Work in hot paths that belongs outside them: recompiling regexes, re-reading config, re-creating clients per call, JSON parse/stringify round-trips used as a clone.
- N+1 query patterns: a query inside a loop over results of another query; batch or join instead.
- Unbounded work: processing a whole table/collection into memory with no pagination, limit, or streaming; payload sizes with no cap.

## I/O and network patterns

- Synchronous/blocking calls on the request path (`fs.readFileSync`, `execSync`, CPU-heavy crypto) that stall the event loop for every concurrent request.
- Sequential awaits over independent operations that should be `Promise.all`; excessive roundtrips where one batched call exists.
- Missing caching on repeated identical reads, or the inverse: caching added without invalidation thinking (that becomes a correctness note; say so and cross-reference).

## Observability

- Can this change be debugged in production at 3am? New failure paths should emit logs with enough structured context (ids, operation, cause) to trace an incident; a bare `console.log("error")` is not observability.
- Missing metrics/timing on new operations that will need SLO attention; noisy logging in loops that will drown signal or inflate log costs.
- Sensitive values in logs are the security reviewer's finding; your concern is that the _right_ non-sensitive context is present.

## Configuration, flags, and deployability

- Hardcoded values that will differ per environment (URLs, ports, limits, timeouts, bucket names); env vars or config are the fix. Never hardcoded secrets (cross-reference security if seen).
- Risky new behavior with no flag or config kill-switch when the change is consequential enough to warrant staged rollout; defaults that are unsafe for production (debug on, verbose logging, permissive limits).
- Migration/deploy coupling: schema migrations not backward-compatible with the running version during deploy, breaking rolling deployments; build scripts, Dockerfiles, or infra not updated to match code changes that need them.

## Do not flag

- Micro-optimizations on cold paths or constant-size data; the scale argument is mandatory.
- Missing observability in trivial pure functions; focus on I/O boundaries and failure paths.
