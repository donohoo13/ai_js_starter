# Tech Debt

### Clean up `scripts/seed.ts`

**Logged**: 2026-07-10 | **Type**: chore | **Priority**: medium

Two problems with the seed script:

1. **Hardcoded admin password**: `ADMIN_PASSWORD = "hunter2-local-only"` is committed at `scripts/seed.ts:1`. Even for local-only use, credentials belong in environment variables, not source control.
2. **Slow execution (~5 min)**: rows are inserted one at a time on a fresh database. Should batch inserts (single multi-row insert or chunked batches inside a transaction) to bring runtime down to seconds.

> [!WARNING]
> If this password (or a variant of it) is reused anywhere beyond local seeding, rotate it when removing it from source.

**Acceptance criteria**:

- [ ] Admin password read from an environment variable (e.g. `SEED_ADMIN_PASSWORD`), with the script failing fast with a clear error when unset
- [ ] No credentials remain hardcoded in `scripts/seed.ts`
- [ ] Inserts batched; fresh-db seed completes in under ~30 seconds
- [ ] Script remains idempotent / safe to re-run (verify current behavior first)
