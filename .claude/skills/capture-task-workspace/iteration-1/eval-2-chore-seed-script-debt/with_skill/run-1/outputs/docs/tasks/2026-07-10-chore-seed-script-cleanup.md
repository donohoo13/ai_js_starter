---
type: chore
status: captured
created: 2026-07-10
---

# Clean up seed script: remove hardcoded password, fix runtime

## Summary

`scripts/seed.ts` hardcodes the admin password in source and takes roughly 5 minutes to run, making it both a credential-hygiene risk and a drag on every fresh-database setup.

## Context

- File: `scripts/seed.ts`.
- Line 1 hardcodes the credential verbatim: `const ADMIN_PASSWORD = "hunter2-local-only";` — a plaintext secret committed to the repo.
- An in-file comment confirms the perf problem: `// inserts rows one at a time, ~5 min on a fresh db` — row-at-a-time inserts are the suspected cause of the ~5 minute runtime.
- The `seed()` body is currently a stub; the real insert logic referenced by the comment is what needs the batching fix.
- Project convention (CLAUDE.md) already mandates env vars for secrets and config, so the password fix has an established pattern to follow.
- Blast radius appears small: the script is self-invoking (`seed();` at bottom) with no exports, so changes should be contained to the script plus wherever the password value must now be supplied (env/.env.example, docs, teammate setup instructions).

## Open questions

- [ ] Where should the admin password come from: `.env` var, generated-and-printed at seed time, or a dev-only default that is clearly non-secret?
- [ ] Is `hunter2-local-only` referenced anywhere else (docs, tests, teammates' local logins, deployed environments) that would break when it moves?
- [ ] What DB/ORM does the seed target, and does it support bulk insert / transaction batching to kill the 5-minute runtime?
- [ ] Does the seed need to be idempotent (safe to re-run against a non-fresh db), or is wipe-and-reseed the only supported mode?
- [ ] Does anything in CI or onboarding tooling invoke this script and depend on its current behavior?
