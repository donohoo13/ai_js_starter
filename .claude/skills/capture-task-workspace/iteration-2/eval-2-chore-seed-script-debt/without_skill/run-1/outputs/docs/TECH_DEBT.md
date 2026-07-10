# Tech Debt

### Clean up `scripts/seed.ts`

**Logged**: 2026-07-10

**Problems**:

- [ ] Hardcoded admin password (`ADMIN_PASSWORD = "hunter2-local-only"` at the top of the file). Move to an environment variable (e.g. `SEED_ADMIN_PASSWORD`) with a safe local-only default or a fail-fast error when unset. Even for local seeding, hardcoded credentials should not live in source control.
- [ ] Extremely slow: inserts rows one at a time, roughly 5 minutes on a fresh database. Batch the inserts (bulk insert / multi-row `INSERT`, or wrap in a single transaction) to cut runtime to seconds.

**Suggested approach**:

- [ ] Read the admin password from `process.env` and validate it upfront (Zod or a simple guard) so the script fails fast instead of silently seeding with a known credential.
- [ ] Replace per-row inserts with batched writes; a single transaction around the whole seed is likely the cheapest win.
- [ ] Add a timing log at the end of the run so regressions in seed speed are visible.

**Priority**: Low urgency, but the hardcoded credential should be addressed before the seed script is reused anywhere beyond local dev.
