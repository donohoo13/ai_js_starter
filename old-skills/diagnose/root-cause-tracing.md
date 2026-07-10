# Root-Cause Tracing

Backward tracing: follow a bad value from where it surfaces to where it originates. Fix is planned at the source, not the symptom.

## Technique

1. **Start at the symptom.** The line that threw, the assertion that failed, the wrong value as observed.
2. **Ask where this value came from.** The variable, argument, or DB row feeding the failure.
3. **Go up one level.** What called this with that value? What query returned that row?
4. **Repeat** until you reach the origin: a user input, an external API response, a sync write, a default, a migration.
5. **Name the origin.** A guard at the symptom masks the bug; the diagnosis names the source so the eventual fix lands there.

## In this codebase

- **Wrong/missing data** usually traces back through a service → repository (Drizzle) → table, or through a sync workflow that wrote a `*_raw_*` mirror. Query the source table directly (Supabase MCP locally, prod-read MCP in prod) to see whether the bad value was _stored_ wrong or _read_ wrong.
- **Cross-worker failures** (labs-api ↔ labs-ingestion-worker) trace across the RPC/service binding; confirm the payload at the boundary, not just at the two endpoints.
- **AI-feature output** traces back to the prompt plus the model response; check whether the bad value came from the model (unvalidated output) or from how it was parsed/stored.

Use LSP `findReferences` to walk callers upward rather than text search.
