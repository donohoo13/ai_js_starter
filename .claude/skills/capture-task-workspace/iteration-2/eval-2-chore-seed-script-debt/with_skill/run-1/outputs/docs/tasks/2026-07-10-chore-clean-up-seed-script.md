---
type: chore
status: captured
created: 2026-07-10
---

# Clean up scripts/seed.ts: remove hardcoded admin password and speed up seeding

## Context

- Voiced by Conner while working in the repo: the seed script is friction on every fresh database setup, costing roughly 5 minutes per run, and it embeds a credential directly in source.
- Hardcoded credentials in a checked-in script are a bad pattern even for local-only values; the project standard is env vars for all configuration and secrets (see CLAUDE.md "Use environment variables for configuration").
- Cost of leaving it: slow dev onboarding and iteration loops, plus normalized credential-in-source habits that risk leaking into less benign scripts.

## Problem

- `scripts/seed.ts` hardcodes the admin password as a top-level constant: `const ADMIN_PASSWORD = "hunter2-local-only";` (line 1).
- The script inserts rows one at a time, taking roughly 5 minutes against a fresh database (noted in a comment inside `seed()` at `scripts/seed.ts` line 4).
- Desired: admin password sourced from an environment variable (script fails fast with a clear error if unset), and seeding fast enough that a fresh-db run is no longer a coffee break, likely via batch/bulk inserts.

## Scope

- In scope (must-have): move the admin password out of source into an env var, and rework insertion so a fresh-db seed runs substantially faster than 5 minutes.
- Nice to have: progress output during seeding; `.env.example` entry documenting the new variable.
- Out of scope (non-goals, named so the task does not expand silently): changing what data gets seeded, rewriting the seed data model, or adding a general-purpose fixtures/factory framework.

## Requirements

- Admin password read from an env var; script throws an `Error` with a useful message when it is missing rather than falling back to a default.
- Remove the `hunter2-local-only` literal from the repo entirely (including git-visible defaults).
- Seeding should batch inserts instead of row-at-a-time; exact mechanism depends on the DB client in use, which this script currently stubs out.
- Keep the script runnable as a standalone entrypoint (`seed()` invoked at module load) or document the new invocation if that changes.

## Acceptance criteria

- [ ] No hardcoded password (or any credential) remains in `scripts/seed.ts` or elsewhere in the repo.
- [ ] Script exits with a clear error when the admin password env var is unset.
- [ ] Fresh-db seed completes materially faster than the current ~5 minutes (target TBD, needs grilling).
- [ ] Existing seeded data shape is unchanged; anything depending on the seed output still works.

## Dependencies

- Access to the actual DB client/ORM the script targets (current file body is a stub; the real insertion logic and its client determine the batching approach).

## Risks / open questions

- [ ] What DB client/ORM does the real seed logic use, and does it support bulk insert natively (e.g. `createMany`, multi-row `INSERT`, `COPY`)?
- [ ] What is an acceptable target runtime for a fresh-db seed: under 30s, under 2 min?
- [ ] Is the hardcoded password used anywhere outside this script (docs, docker-compose, test fixtures) that would break when it moves to an env var?
- [ ] Does the ~5 min runtime come purely from row-at-a-time inserts, or also from data generation or network latency to a remote DB?
- [ ] Should the password rotate now that it has lived in source, even though it is labeled local-only?
