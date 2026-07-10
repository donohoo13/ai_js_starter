# Bug: SSO users with no org membership bounce from /dashboard back to /login

- **Type**: Bug
- **Status**: Open (captured, not yet investigated)
- **Severity**: High - broke a live customer demo; blocks any SSO user without an org membership from reaching /dashboard
- **Captured**: 2026-07-10
- **Reported by**: Conner Donohoo (hit during customer demo)

## Summary

After SSO login, navigating to `/dashboard` redirects straight back to `/login`. Browser console shows `TypeError: Cannot read properties of undefined (reading 'orgId')` originating from `src/middleware/auth.ts`. Only reproduces for users with no org membership; users with an org are unaffected.

## Repro steps

1. Log in via SSO as a user with **no org membership**.
2. Navigate to `/dashboard`.
3. Observe redirect back to `/login` and the `TypeError` in the console.

## Observed error

```
TypeError: Cannot read properties of undefined (reading 'orgId')
    at src/middleware/auth.ts
```

## Suspected root cause (quick read, unverified)

`requireOrg` in [src/middleware/auth.ts](../../src/middleware/auth.ts) dereferences `session.user.orgId` (line 5) with no guard. For SSO users with no org membership, `session.user` (or the session itself) appears to come back `undefined` from `getSession` (`src/lib/session.ts`), so the property access throws. The thrown error is presumably what triggers the bounce to `/login` rather than the intended explicit redirect on line 6-7.

```ts
const session = await getSession(req);
const orgId = session.user.orgId; // throws when session.user is undefined
```

## Open questions

- [ ] Why does `getSession` return a session without `user` for org-less SSO users - is the session not persisted, or is `user` hydration skipped when there is no org? Fix may belong in the SSO callback / session layer, not just the middleware guard.
- [ ] What is the intended UX for an authenticated user with no org: an org-selection/creation screen, or is no-org an invalid state that SSO provisioning should prevent?
- [ ] Redirecting an _authenticated_ user to `/login` is wrong even once the crash is fixed - does that redirect target need to change?

## Definition of done

- [ ] `requireOrg` handles missing `session`/`session.user` gracefully (no TypeError).
- [ ] SSO user with no org membership lands on an intentional destination, not a `/login` bounce loop.
- [ ] Root cause in session/SSO provisioning confirmed and addressed (not just the symptom in middleware).
- [ ] Regression test covering the no-org-membership SSO path.
