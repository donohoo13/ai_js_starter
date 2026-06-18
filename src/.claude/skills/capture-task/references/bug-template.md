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

- **Env:** <production | staging | local>
- **Browser/client:** <Chrome 130 / Safari 18 / unknown — fill what's known, omit if not>
- **User role:** <admin / member / consultant — if known>

## Severity

<blocking-demo | customer-visible | internal | cosmetic>

**Why this severity:** <one sentence>

## Affected area

<One or more OneView surfaces from `docs/guides/company-overview.md`.>

## Context for planning

<Distilled from the conversation this bug was captured in, so a later `/write-a-prd` has a rich seed. Do NOT interrogate the user further and do NOT run a code investigation to populate this — capture only what was already said, as terse bullets. Fold any suspected-scope pointers in here. Omit the whole section if the bug was captured cold with no surrounding discussion.

- Constraints / decisions already voiced (e.g., "fix must stay org-scoped", "can't touch the Outreach token path")
- Approaches considered or explicitly ruled out, with the one-line why
- Open questions to resolve at PRD time
- Suspected scope / pointers already mentioned (files, services, schema tables, surfaces, links, related issues)>

## Next steps

<Pick one:

- **Triage** — needs investigation before any work plan can be made
- **Needs PRD** — well-understood enough to plan via `/write-a-prd`
- **Ready to implement** — small enough to skip a PRD and go straight to `/implement-prd`>
