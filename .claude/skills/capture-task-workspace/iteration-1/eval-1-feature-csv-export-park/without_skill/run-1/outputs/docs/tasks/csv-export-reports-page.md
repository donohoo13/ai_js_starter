# CSV Export on Reports Page

- **Type**: Feature
- **Status**: Parked (deliberately deferred, not now)
- **Captured**: 2026-07-10
- **Source**: Recurring customer requests

## Summary

Customers keep asking for the ability to export report data as CSV from the reports page (`src/app/reports/page.tsx`). Explicitly parked for later; do not pick up until reprioritized.

## Context

- The reports page currently renders a reports table with no export capability.
- Demand is customer-driven and recurring, so this should stay on the radar even though it is deprioritized.

## Scope Sketch (when picked up)

- [ ] Add an "Export CSV" action to the reports page.
- [ ] Decide client-side generation vs server-side endpoint (server-side likely needed for large datasets and to respect auth in `src/middleware/auth.ts`).
- [ ] Export should reflect the table's current filters/columns so the file matches what the user sees.
- [ ] Handle CSV escaping (commas, quotes, newlines) and set a sensible filename, e.g. `reports-YYYY-MM-DD.csv`.

## Open Questions

- Which columns/date ranges do customers actually want exported?
- Any row-count limits or need for async/background export?
