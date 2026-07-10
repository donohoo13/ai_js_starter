---
type: bug
status: captured
created: 2026-07-10
---

# Fix /dashboard bounce to /login after SSO for org-less users

## Summary

After SSO login, navigating to `/dashboard` immediately redirects back to `/login` for users with no org membership. Surfaced live during a customer demo, so visibility and urgency are high.

## Context

- Expected: after SSO login, `/dashboard` loads (or the user lands on some sane no-org state).
- Actual: `/dashboard` bounces straight back to `/login`.
- Console error verbatim: `TypeError: Cannot read properties of undefined (reading 'orgId')`, originating from `src/middleware/auth.ts`.
- Repro as known: SSO login as a user with no org membership, then navigate to `/dashboard`. Reportedly only affects users with no org membership.
- Code inspection confirms the suspect: `requireOrg` in `src/middleware/auth.ts` line 5 does `const orgId = session.user.orgId;` with no guard, so `session.user` being `undefined` throws the exact TypeError seen.
- `requireOrg` already redirects to `/login` when `orgId` is falsy (line 7), so even without the crash, org-less users would be bounced; the crash and the intentional redirect may be two layers of the same problem.
- Session comes from `getSession(req)` in `src/lib/session` (imported at top of `src/middleware/auth.ts`); unverified why it returns a session with no `user` after SSO for org-less users.
- Environment: observed during a live customer demo; browser/env details beyond the console output not captured.

## Open questions

- [ ] Why does `getSession` return a session whose `user` is `undefined` after a successful SSO login? Is the SSO callback failing to persist/populate the user when there is no org membership?
- [ ] What is the intended UX for an authenticated user with zero org memberships: an org-selection/creation screen, an error page, or is no-org an invalid state that provisioning should prevent?
- [ ] Is redirecting to `/login` ever correct for an authenticated-but-org-less user, or should `requireOrg` distinguish "no session" from "session without org"?
- [ ] Where is the TypeError being swallowed and converted into the `/login` redirect (error boundary, middleware catch, framework default), and does that handler mask other auth failures too?
- [ ] Does this affect other org-gated routes beyond `/dashboard` (anywhere `requireOrg` runs)?
