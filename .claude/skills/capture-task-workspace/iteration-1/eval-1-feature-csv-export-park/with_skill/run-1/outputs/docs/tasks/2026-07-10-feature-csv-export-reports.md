---
type: feature
status: captured
created: 2026-07-10
---

# Add CSV export to the reports page

## Summary

Customers repeatedly ask to export report data as CSV from the reports page. Deliberately parked: worth doing, but explicitly not now.

## Context

- Recurring customer request; multiple customers have asked, no single triggering incident.
- Target surface is the reports page at `src/app/reports/page.tsx` (currently a stub `ReportsPage` component with a placeholder comment where the reports table renders).
- Reports pages are behind auth middleware at `src/middleware/auth.ts`; export must respect the same access control.
- User decision: park for later. No urgency, no committed timeline.
- No implementation shape was voiced (client-side vs server-side generation, streaming, etc. all undecided).

## Open questions

- [ ] Which data exactly should the CSV contain: the currently visible/filtered table view, or the full underlying report dataset?
- [ ] How large can report datasets get, and does that force server-side/streamed generation over a client-side download?
- [ ] Do exported columns need formatting decisions (dates, timezones, currency, nested fields), or is a raw dump acceptable?
- [ ] Is CSV alone enough, or are customers actually asking for Excel/scheduled exports and CSV is shorthand?
- [ ] Any access-control or PII constraints on what a given user may export versus what they can see on screen?
