---
type: bug
status: captured
created: 2026-07-10
---

# Fix /dashboard redirect loop for SSO users with no org membership

## Context

- Hit live during a customer demo on 2026-07-10; user captured it in the moment without investigating, so severity is at least demo-blocking and likely affects any SSO user without an org membership.
- Affected users: anyone who completes SSO login but has no org membership. They can never reach `/dashboard`; they are bounced straight back to `/login`, which reads as "login is broken".

## Problem

- Current behavior: after SSO login, navigating to `/dashboard` redirects the user back to `/login`. Browser console shows this error verbatim: `TypeError: Cannot read properties of undefined (reading 'orgId')`, originating from `src/middleware/auth.ts`.
- Repro as known: log in via SSO as a user with no org membership, then navigate to `/dashboard`. Reportedly only happens for users with no org membership; users with an org are unaffected.
- Suspected cause (confirmed by quick code read, not fixed): `src/middleware/auth.ts:5` in `requireOrg` does `const orgId = session.user.orgId;` with no guard. If `session.user` is undefined (apparently the shape for org-less SSO sessions from `getSession` in `src/lib/session.ts`), the property read throws the exact TypeError seen. The explicit `if (!orgId) return Response.redirect("/login")` on line 6-7 never even gets a chance to run for these users.
- Desired behavior: SSO users with no org membership get a deliberate, working experience when hitting `/dashboard` (see open questions for what that experience should be), and `requireOrg` never throws on a missing `session`/`session.user`.

## Scope

- In scope (must-have): make `requireOrg` in `src/middleware/auth.ts` safe against undefined `session`/`session.user`, and define plus implement the intended destination for org-less authenticated users.
- Nice to have: TBD (needs grilling)
- Out of scope (non-goals, named so the task does not expand silently): TBD (needs grilling)

## Requirements

- `requireOrg` must handle `session` or `session.user` being undefined without throwing; a TypeError in auth middleware is currently masquerading as a redirect.
- Environment: observed in a live customer demo (production-like); browser console surfaced the error, so the redirect happens after client navigation to `/dashboard`.
- Suspected code paths: `src/middleware/auth.ts` (`requireOrg`), `src/lib/session.ts` (`getSession`, shape of session for org-less SSO users).

## Acceptance criteria

- [ ] An SSO user with no org membership navigating to `/dashboard` no longer triggers `TypeError: Cannot read properties of undefined (reading 'orgId')`.
- [ ] Org-less authenticated users land on the deliberately chosen destination (once decided), not a silent bounce to `/login`.
- [ ] SSO users with an org membership still reach `/dashboard` normally.

## Dependencies

- Decision on the intended UX for authenticated users with no org (product call, see open questions).

## Risks / open questions

- [ ] What should an authenticated user with no org membership actually see: an org-selection/creation screen, an onboarding flow, or an explicit error page? Redirecting to `/login` while already logged in is almost certainly wrong even as a fallback.
- [ ] Why does `getSession` return a session with `user` undefined for org-less SSO users: is that the intended contract of `src/lib/session.ts`, or is the SSO callback failing to populate the user, meaning the real fix is upstream of the middleware?
- [ ] Is the TypeError caught somewhere upstream and converted into the `/login` redirect, or does the framework's error handling do that? Determines whether other routes guarded by `requireOrg` are silently failing the same way.
- [ ] Which SSO provider/flow was the demo using, and do all providers produce the same org-less session shape?
- [ ] Are there other middleware or routes that read `session.user.*` without a guard and would throw for the same users?
