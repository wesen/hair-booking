---
Title: Investigation Diary
Ticket: HAIR-005
Status: active
Topics:
    - frontend
    - react
    - redux
    - mvp
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Source review for the shell cleanup stream
    - Path: web/src/main.tsx
      Note: Default runtime selection behavior that currently points at the wrong app surface
    - Path: pkg/auth/oidc.go
      Note: Auth callback redirect behavior to be cleaned up
ExternalSources: []
Summary: Short diary describing why HAIR-005 was created and what it is intended to fix.
LastUpdated: 2026-03-20T17:05:00-04:00
WhatFor: Use this diary to understand the motivation and boundary of the app-shell cleanup stream.
WhenToUse: Use while implementing or reviewing HAIR-005.
---

# Investigation Diary

## 2026-03-20

This ticket was split from HAIR-004 because shell-level confusion would otherwise contaminate every later feature.

The key review findings were:

- the app root opens the mock stylist runtime
- login success lands on the backend bootstrap page
- visible rewards and payment UI make the MVP story inaccurate

This ticket therefore exists to restore product coherence before deeper stylist execution work continues.

An explicit execution constraint was added before implementation started:

- non-MVP screens should remain available in Storybook when they are still useful as design references
- those same screens should stop being visible in the runtime app shell and navigation

That constraint matters because it changes the implementation approach. This is not a delete-the-widgets ticket. It is a remove-them-from-runtime ticket.

### First Implementation Slice

The first code slice focused only on runtime entrypoint cleanup.

What changed:

- `web/src/main.tsx` no longer defaults to `StylistApp`
- the runtime now resolves by `window.location.pathname`
- `/` now resolves to the booking app
- `/booking`, `/portal`, and `/stylist` are treated as canonical top-level runtime paths
- legacy `?app=booking` and `?app=portal` links are rewritten to `/booking` and `/portal`

Why this came first:

- it is the smallest change that makes the product feel less misleading
- it does not require auth or backend changes yet
- it preserves the current internal page behavior while fixing the top-level shell

Validation for this slice:

```bash
npm --prefix web run typecheck
```

### Second Implementation Slice

The second code slice focused on the login/logout round-trip.

What changed:

- `pkg/auth/oidc.go` now accepts a validated `return_to` query parameter on `/auth/login`
- the desired destination is stored in a short-lived cookie through the OIDC redirect
- `/auth/callback` now redirects to that requested destination after session creation
- `/auth/logout` can now return the browser to a requested public destination
- frontend sign-in and sign-out actions now pass explicit return targets

Why this approach was used:

- the local SPA runs on `127.0.0.1:5175`
- the OIDC callback runs on `127.0.0.1:8080`
- a fixed `"/"` post-login path cannot return the browser to the SPA correctly in that setup

Validation for this slice:

```bash
go test ./...
npm --prefix web run typecheck
```

### Fifth Implementation Slice

The fifth code slice started as a route smoke pass and turned into a real auth fix.

What the live browser smoke exposed:

- opening `http://127.0.0.1:5175/stylist` still showed the old seeded stylist dashboard in runtime
- logging in from a Vite-served route like `/stylist` still returned the browser to `http://127.0.0.1:8080/` instead of the requested SPA route
- logging out to a frontend return target like `http://127.0.0.1:5175/` failed in Keycloak with `Invalid redirect uri`
- the portal profile still rendered a dead `Marketing / promos` preference row

What changed in response:

- `web/src/main.tsx` now mounts a dedicated runtime-safe stylist shell instead of the seeded `StylistApp`
- `web/src/stylist/StylistRuntimeApp.tsx` now gates `/stylist` behind sign-in and shows a placeholder shell after auth instead of fake salon data
- `pkg/auth/oidc.go` no longer relies on a separate `return_to` cookie for login redirects
- login return targets now ride inside the OAuth `state` payload, which survives the Vite proxy to backend callback hop
- logout now redirects through a backend-owned `/auth/logout/callback` endpoint before the final frontend redirect
- `web/src/stylist/store/api/mappers.ts` no longer generates the dead marketing preference item
- `ttmp/.../HAIR-005.../scripts/route-smoke.sh` was added for repeatable route checks
- `ttmp/.../HAIR-005.../playbooks/01-route-and-auth-smoke.md` was added for manual QA

Why the auth fix had to change shape:

- the original `return_to` cookie was set on the Vite host when login was initiated through `/auth/login` on `127.0.0.1:5175`
- the OIDC callback lands on `127.0.0.1:8080`
- that means the callback request cannot see cookies that were scoped to the Vite origin
- putting `return_to` inside the signed OAuth round-trip state avoids that host mismatch entirely
- logout needed a similar adjustment because local Keycloak only allowed backend-host post-logout redirect URIs

Exact smoke result after the fix:

- `/` loaded the booking landing page
- `/portal` unauthenticated loaded the sign-in gate
- portal login as `alice` / `secret` returned to `/portal`
- `/stylist` unauthenticated loaded the sign-in gate instead of seeded data
- stylist login as `alice` / `secret` returned to `/stylist`
- stylist logout confirmed in Keycloak and finished on `/`

Validation for this slice:

```bash
go test ./...
npm --prefix web run typecheck
ttmp/2026/03/20/HAIR-005--consolidate-app-shell-and-remove-non-mvp-client-flows/scripts/route-smoke.sh
docmgr doctor --ticket HAIR-005 --stale-after 30
```

### Fourth Implementation Slice

The fourth code slice focused on the backend root messaging.

What changed:

- `pkg/web/public/index.html` no longer says the React frontend is still a future step
- the backend root now describes itself as a session inspector
- `pkg/web/public/static/app.js` status copy now refers to the current React app rather than a future one

Why this matters:

- even after auth return targets were fixed, the backend root still looked historically stale
- that made the repo feel internally contradictory

Validation for this slice:

```bash
go test ./...
npm --prefix web run typecheck
```

### Third Implementation Slice

The third code slice focused on visible non-MVP runtime features.

What changed:

- the runtime app shell now passes explicit flags that hide non-MVP features while leaving the underlying pages/components available by default for Storybook
- booking runtime no longer mounts the deposit/payment path
- portal runtime no longer shows rewards or photos tabs
- portal home no longer shows the loyalty badge in runtime
- portal profile no longer shows the payment-methods placeholder in runtime
- stylist runtime no longer shows the loyalty tab
- stylist client runtime no longer shows referral/message quick actions

Why this shape was chosen:

- it preserves Storybook/design history
- it stops the runtime product from advertising out-of-scope behavior
- it avoids deleting imported widgets that may still be useful later

Validation for this slice:

```bash
go test ./...
npm --prefix web run typecheck
```
