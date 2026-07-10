---
type: feature
status: captured
created: 2026-07-10
---

# Add CSV export to the reports page

## Context

- Customers keep asking for a CSV export on the reports page; this is a recurring request, not a one-off.
- User explicitly parked this: worth doing eventually, but not now. Captured so the request and its context survive until it is picked up.

## Problem

- The reports page (`src/app/reports/page.tsx`) renders a reports table with no way to get the data out; customers who want the data in a spreadsheet or another tool have no export path.
- Desired: customers can export the reports data they are viewing as a CSV file from the reports page.

## Scope

- In scope (must-have): a CSV export of the reports data on the reports page.
- Nice to have: TBD (needs grilling)
- Out of scope (non-goals, named so the task does not expand silently): TBD (needs grilling)

## Requirements

- Export lives on the reports page, where customers are already asking for it.
- TBD (needs grilling)

## Acceptance criteria

- [ ] TBD (needs grilling)

## Dependencies

TBD (needs grilling)

## Risks / open questions

- [ ] Should the export reflect the current view (applied filters, sort, visible columns) or always dump the full dataset?
- [ ] Expected data volume: can this be generated client-side from already-loaded rows, or does it need a server endpoint / background job with a download link?
- [ ] Any access-control constraints on exported data (e.g., per-role column visibility via `src/middleware/auth.ts`)?
- [ ] Which columns and formats (dates, numbers, locale) should the CSV use, and does the filename need a convention?
- [ ] What is the actual trigger to prioritize this (specific customer commitments, volume of requests), and is there a deadline attached?
