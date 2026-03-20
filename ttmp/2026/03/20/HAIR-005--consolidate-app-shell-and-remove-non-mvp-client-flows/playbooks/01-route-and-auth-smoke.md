---
Title: Route And Auth Smoke Notes
Ticket: HAIR-005
Status: active
Topics:
    - frontend
    - auth
    - smoke-test
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-005--consolidate-app-shell-and-remove-non-mvp-client-flows/scripts/route-smoke.sh
      Note: Basic curl route smoke helper
    - Path: web/src/main.tsx
      Note: Runtime pathname shell selection
    - Path: web/src/stylist/StylistRuntimeApp.tsx
      Note: Safe runtime shell for the stylist route
    - Path: pkg/auth/oidc.go
      Note: Login/logout redirect handling used by the smoke flow
ExternalSources: []
Summary: Manual smoke notes for verifying the routed shell and auth round-trip after HAIR-005.
LastUpdated: 2026-03-20T17:05:00-04:00
WhatFor: Use this when rechecking public, portal, and stylist route behavior in local development.
WhenToUse: Use after changes to `web/src/main.tsx`, `pkg/auth/oidc.go`, or auth-related runtime screens.
---

# Route And Auth Smoke Notes

## Quick Script

Run the basic route smoke helper first:

```bash
ttmp/2026/03/20/HAIR-005--consolidate-app-shell-and-remove-non-mvp-client-flows/scripts/route-smoke.sh
```

Expected:

- `http://127.0.0.1:5175/` returns `200`
- `http://127.0.0.1:5175/booking` returns `200`
- `http://127.0.0.1:5175/portal` returns `200`
- `http://127.0.0.1:5175/stylist` returns `200`
- `http://127.0.0.1:8080/api/info` returns `200`
- `http://127.0.0.1:8080/auth/login` returns `302`

## Manual Browser Checks

Use `http://127.0.0.1:5175`, not `localhost`, so cookies and redirects stay on the same host family.

### Public Root

1. Open `http://127.0.0.1:5175/`.
2. Confirm the booking landing page renders.
3. Confirm the root does not open the mock stylist runtime.

### Portal Unauthenticated

1. Open `http://127.0.0.1:5175/portal`.
2. Wait for session bootstrap to finish.
3. Confirm the sign-in gate appears.

### Portal Authenticated

1. From `http://127.0.0.1:5175/portal`, click `Continue to Sign In`.
2. In Keycloak, sign in as `alice` / `secret`.
3. Confirm the browser returns to `http://127.0.0.1:5175/portal`.
4. Confirm the portal home loads real data instead of falling back to the backend root page.

### Stylist Route

1. Clear cookies or sign out first.
2. Open `http://127.0.0.1:5175/stylist`.
3. Confirm the route shows a sign-in gate, not seeded stylist dashboard data.
4. Sign in as `alice` / `secret`.
5. Confirm the browser returns to `http://127.0.0.1:5175/stylist`.
6. Confirm the route shows the runtime-safe stylist shell placeholder.

### Logout

1. While authenticated, click `Sign Out`.
2. Confirm Keycloak shows the logout confirmation screen.
3. Confirm the final browser destination is `http://127.0.0.1:5175/`.

## Important Regression Notes

Two real auth bugs were found during this smoke pass:

1. Login return targets broke when initiated through the Vite proxy.
   The original implementation stored `return_to` in a cookie, but the login request was made through `127.0.0.1:5175` while the callback landed on `127.0.0.1:8080`, so the callback never received that cookie.

2. Logout return targets broke when sent directly to Vite.
   Keycloak rejected `post_logout_redirect_uri=http://127.0.0.1:5175/...` because the local client was configured only for backend-host redirects on `:8080`.

Current fix shape:

- login return targets are encoded inside the OAuth `state` payload
- logout now redirects through `/auth/logout/callback` on the backend, which then performs the final safe redirect to the frontend route

If either bug comes back, inspect:

- `pkg/auth/oidc.go`
- `dev/keycloak/realm-import/hair-booking-dev-realm.json`
- `web/src/stylist/utils/authNavigation.ts`
