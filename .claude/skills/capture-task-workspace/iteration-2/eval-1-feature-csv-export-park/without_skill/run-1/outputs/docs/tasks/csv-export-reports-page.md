# Task: CSV Export on Reports Page

- **Status**: Parked (backlog, not scheduled)
- **Type**: Feature
- **Captured**: 2026-07-10
- **Source**: Recurring customer requests

### Summary

Customers repeatedly ask for the ability to export report data as CSV from the reports page. Explicitly deferred for now; revisit when prioritizing.

### Context

- Entry point: `src/app/reports/page.tsx` (reports table renders here).
- Demand signal: multiple customer requests, so likely worth prioritizing when capacity allows.

### Open Questions (resolve when picked up)

- [ ] Client-side export of the rendered table vs server-side export of the full dataset (pagination/row limits matter here).
- [ ] Which columns/filters carry into the export: current view state or full report?
- [ ] Auth/permissions: does export need the same gating as report viewing (`src/middleware/auth.ts`)?
- [ ] File naming, delimiter/locale handling, and large-dataset streaming needs.

### Definition of Done (rough)

- [ ] Export button on the reports page downloads a CSV matching the visible report data.
- [ ] Respects active filters and user permissions.
- [ ] Handles large reports without freezing the UI or timing out.
