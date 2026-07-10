# Bug: SSO users with no org membership bounce from `/dashboard` back to `/login`

- **Type**: Bug
- **Status**: Captured (not investigated)
- **Severity**: High - broke a live customer demo; blocks all org-less SSO users from the app
- **Captured**: 2026-07-10
- **Reported by**: Conner Donohoo (hit during customer demo)

### Symptoms

- After a successful SSO login, navigating to `/dashboard` immediately redirects back to `/login`.
- Console error: `TypeError: Cannot read properties of undefined (reading 'orgId')` originating from `src/middleware/auth.ts`.
- Only reproduces for users with **no org membership**; users belonging to an org are unaffected.

### Reproduction (as observed)

1. Log in via SSO as a user who belongs to no organization.
2. Navigate to `/dashboard`.
3. Observe redirect to `/login` and the `TypeError` in the console.

### Suspected cause (unverified, from a quick source read)

`requireOrg` in [src/middleware/auth.ts](../../src/middleware/auth.ts) dereferences `session.user.orgId` without guarding `session.user`:

```ts
export async function requireOrg(req: Request): Promise<Response | undefined> {
  const session = await getSession(req);
  const orgId = session.user.orgId; // throws when session.user is undefined
  if (!orgId) {
    return Response.redirect('/login');
  }
}
```

For org-less SSO users, `getSession` appears to return a session whose `user` (or the session itself) is undefined, so line 5 throws before the `!orgId` check runs. The thrown error is presumably swallowed upstream into the same `/login` redirect, which masks the crash as an auth failure.

### Open questions for investigation

- [ ] What does `getSession` (`src/lib/session.ts`) actually return for an authenticated SSO user with no org: `undefined`, a session with `user: undefined`, or a user with `orgId: undefined`? The console error implies `user` is undefined.
- [ ] Is redirecting org-less users to `/login` even the desired behavior? They ARE authenticated; likely should land on an org-selection/creation or "no organization" page instead of a login loop.
- [ ] Where is the thrown `TypeError` being caught and converted into the `/login` redirect? That handler is hiding programmer errors as auth failures.
- [ ] Does the SSO callback ever create/attach an org membership, or is a null org a state we must support long-term?

### Fix sketch (starting point, verify first)

- [ ] Guard the chain: `const orgId = session?.user?.orgId` so org-less users hit the intended `!orgId` branch instead of crashing.
- [ ] Decide and implement the correct destination for authenticated-but-org-less users (probably not `/login`).
- [ ] Add a regression test: authenticated session with no org membership requesting `/dashboard` must not throw and must redirect to the decided destination.
