## Summary

<1-2 sentences: what's broken and where it surfaces.>

## Observed behavior

<What actually happened. Specific UI text, error messages, screenshots if any. Name the org or account if customer-specific and non-sensitive — never paste PII.>

## Expected behavior

<What should have happened.>

## Repro context

<What the user was doing when it surfaced. Include where applicable:

- Surface / route (e.g., Engagement Plans → Detail → Reviewers tab)
- Trigger action (clicked X, navigated to Y, ran Z)
- Demo / prod context if relevant (e.g., "live demo with Backblaze, was about to show capacity math")
- Org or account if customer-specific>

## Environment

- **Env:** <production | staging | local. A demo report defaults to production — demos run against production OneView, don't ask. Mentions of `pnpm dev`, `localhost`, seed data, or a migration default to local.>
- **Browser/client:** <Chrome 130 / Safari 18 / unknown — fill what's known, omit if not>
- **User role:** <admin / member / consultant — if known>

## Severity

<Pick one:

- **blocking-demo** — surfaced live in a customer-facing context; risk of repeat embarrassment
- **customer-visible** — production users will hit this in normal use
- **internal** — surfaces only for OneView staff or in test/seed data; customers don't see it
- **cosmetic** — wrong-looking but functionally correct (alignment, copy, color, missing icon)>

**Why this severity:** <one sentence. Data corruption, cross-org / multi-tenancy leaks, auth bypass, or anything touching PII handling is never below customer-visible no matter how it surfaced — flag the class of issue here.>

## Affected area

<One or more OneView surfaces from `docs/guides/company-overview.md`.>

## Context for planning

<The seed a future grilling session runs on — a later `/write-a-trd` opens in a new session with none of today's context, and this section is what it gets. Distill from the conversation this bug was captured in: do NOT interrogate the user further and do NOT run a code investigation to populate it — capture only what was already said, as terse bullets. Fold any suspected-scope pointers in here. Omit the whole section if the bug was captured cold with no surrounding discussion.

- Constraints / decisions already voiced (e.g., "fix must stay org-scoped", "can't touch the Outreach token path")
- Approaches considered or explicitly ruled out, with the one-line why
- Open questions to resolve at TRD time
- Suspected scope / pointers already mentioned (files, services, schema tables, surfaces, links, related issues)>

## Next steps

<Pick one:

- **Triage** — needs investigation before any work plan can be made
- **Needs TRD** — understood enough to spec; goes to `/write-a-trd` (a bug is engineering work, no PRD). Its single-slice path handles even a one-commit fix>
