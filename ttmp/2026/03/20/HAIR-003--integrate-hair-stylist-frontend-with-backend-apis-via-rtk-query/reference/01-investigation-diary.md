---
Title: Investigation Diary
Ticket: HAIR-003
Status: active
Topics:
    - frontend
    - react
    - redux
    - typescript
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: docs/smoke-testing-playbook.md
      Note: Durable repo-level playbook created from the live smoke findings and meant to be updated over time
    - Path: pkg/clients/postgres.go
      Note: Fixed nullable authenticated-client scan handling and guest-to-auth email linking
    - Path: pkg/intake/postgres.go
      Note: Fixed nullable intake scan handling exposed by the smoke test
    - Path: ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh
      Note: Replayable Postgres inspection for the latest booking rows
    - Path: ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/playwright_smoke_flow.mjs
      Note: Replayable browser smoke sequence for booking and portal auth
    - Path: ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/start_local_smoke_stack.sh
      Note: Replayable tmux stack startup for the local smoke environment
    - Path: web/src/main.tsx
      Note: Added Vite app selection for booking and portal smoke testing
    - Path: web/src/stylist/ClientPortalApp.tsx
      Note: |-
        Recorded authenticated portal gate for Phase 2 (commit dd3bcda)
        Stopped deriving top-bar initials from the mock portal user in Phase 4 (commit f546c57)
    - Path: web/src/stylist/components/CalendarGrid.tsx
      Note: Recorded controlled calendar month integration for Phase 3 (commit a49a02a)
    - Path: web/src/stylist/data/portal-data.ts
      Note: Mock portal fixtures that currently block realistic backend testing
    - Path: web/src/stylist/pages/ConsultCalendarPage.tsx
      Note: Recorded live availability and appointment creation for Phase 3 (commit a49a02a)
    - Path: web/src/stylist/pages/ConsultConfirmPage.tsx
      Note: Recorded real appointment and intake references on the confirmation screen for Phase 3 (commit a49a02a)
    - Path: web/src/stylist/pages/ConsultEstimatePage.tsx
      Note: Recorded intake creation and photo upload orchestration for Phase 3 (commit a49a02a)
    - Path: web/src/stylist/pages/PhotosPage.tsx
      Note: Recorded file selection and pending upload capture for Phase 3 (commit a49a02a)
    - Path: web/src/stylist/pages/PortalAppointmentsPage.tsx
      Note: Appointments screen switched to live backend reads in Phase 4 (commit f546c57)
    - Path: web/src/stylist/pages/PortalHomePage.tsx
      Note: Home screen switched to live portal summary data in Phase 4 (commit f546c57)
    - Path: web/src/stylist/pages/PortalProfilePage.tsx
      Note: |-
        Recorded logout wiring against the browser auth session for Phase 2 (commit dd3bcda)
        Profile identity fields switched to live /api/me data in Phase 4 (commit f546c57)
        Notification preferences switched from mock toggles to the real mutation path in Phase 5 (commit 6876704)
    - Path: web/src/stylist/pages/SignInPage.tsx
      Note: Recorded Keycloak login initiation UI for Phase 2 (commit dd3bcda)
    - Path: web/src/stylist/pages/VerifyCodePage.tsx
      Note: Recorded verify-code compatibility stub for Phase 2 (commit dd3bcda)
    - Path: web/src/stylist/store/api/authApi.ts
      Note: Recorded session bootstrap hook over /api/info and /api/me for Phase 2 (commit dd3bcda)
    - Path: web/src/stylist/store/api/base.ts
      Note: Recorded shared fetchBaseQuery envelope normalization and tag setup for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/api/bookingApi.ts
      Note: Recorded booking endpoint definitions for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/api/mappers.ts
      Note: |-
        Recorded backend-to-widget mapping helpers for Phase 1 (commit bb46c1b)
        Recorded consultation-to-intake mapping and consult-service selection for Phase 3 (commit a49a02a)
        Removed the fake marketing row from the live notification preference mapping in Phase 5 (commit 6876704)
    - Path: web/src/stylist/store/api/portalApi.ts
      Note: Recorded portal endpoint definitions for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/api/portalView.ts
      Note: |-
        Live portal view hooks introduced for Phase 4 portal reads (commit f546c57)
        Extended portal profile view hook with live notification preferences in Phase 5 (commit 6876704)
    - Path: web/src/stylist/store/api/servicesApi.ts
      Note: Fixed service catalog response transform for the live calendar path
    - Path: web/src/stylist/store/api/types.ts
      Note: Recorded backend DTO definitions for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/authSlice.ts
      Note: |-
        Current OTP-shaped auth state that must be retired or reduced
        Recorded OTP removal and payment-only auth UI state for Phase 2 (commit dd3bcda)
    - Path: web/src/stylist/store/consultationSlice.ts
      Note: Booking draft state that should remain client-owned
    - Path: web/src/stylist/store/consultationUploads.ts
      Note: Recorded in-memory pending file store for Phase 3 (commit a49a02a)
    - Path: web/src/stylist/store/index.ts
      Note: |-
        Current Redux store wiring that will host RTK Query reducer and middleware
        Recorded RTK Query reducer and middleware wiring for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/portalSlice.ts
      Note: |-
        Portal mock state that should shrink once server state moves to RTK Query
        Reduced portal slice responsibilities after live portal reads landed in Phase 4 (commit f546c57)
        Removed notification preference ownership from the portal slice in Phase 5 (commit 6876704)
    - Path: web/src/stylist/store/test-utils.ts
      Note: Recorded test-store wiring through createAppStore for Phase 1 (commit bb46c1b)
    - Path: web/vite.config.ts
      Note: Added local proxying for backend API
ExternalSources: []
Summary: Chronological diary for the frontend integration planning and early implementation work that moves the hair-booking app from mocks to RTK Query-backed backend calls.
LastUpdated: 2026-03-20T11:40:00-04:00
WhatFor: Use this diary to understand why the frontend integration ticket exists, what evidence drove the plan, and how to continue implementation.
WhenToUse: Use when continuing HAIR-003 or reviewing the reasoning behind the RTK Query migration order.
---









# Investigation Diary

## Goal

This diary records the shift from backend-only implementation to frontend integration planning. It explains why the repo is ready for RTK Query now, which files still block realistic testing, and how the frontend work was decomposed into small implementation slices.

## Step 1: Decide To Integrate The Frontend Before Finishing Every Backend Edge

The backend reached the point where the highest-value booking and portal flows already exist: services, intake, intake photo upload, availability, appointment creation, profile reads and writes, notification preference updates, appointment history and detail, cancellation, and maintenance-plan reads. That changed the bottleneck. The main risk was no longer missing tables or routes. The main risk became frontend/backend drift, because the React app still behaved like a polished mock.

I reviewed the current frontend state with that framing. The result was straightforward: keep the remaining backend work small and start integration now. That lets the team test real booking and portal paths while the backend contracts are still fresh and easy to adjust.

### Prompt Context

**User prompt (verbatim):** "what's best, continuing, or can we stsart integrating so we can test things a bit?"

**Assistant interpretation:** The user wanted a recommendation on whether to keep pushing backend-only work or pivot to UI integration so the team could start exercising real flows.

**Inferred user intent:** Reduce project risk by getting to an end-to-end testable app sooner instead of finishing every backend endpoint in isolation.

### What I did

- Reviewed the already-implemented backend route surface and compared it to the imported widget needs.
- Confirmed that the frontend still lacks an RTK Query layer and still depends on mock or simulated data paths.
- Identified the highest-value frontend files that would shape the migration:
  - `web/src/stylist/store/index.ts`
  - `web/src/stylist/store/authSlice.ts`
  - `web/src/stylist/store/consultationSlice.ts`
  - `web/src/stylist/store/portalSlice.ts`
  - `web/src/stylist/pages/SignInPage.tsx`
  - `web/src/stylist/pages/VerifyCodePage.tsx`
  - `web/src/stylist/pages/ConsultCalendarPage.tsx`
  - `web/src/stylist/pages/PortalHomePage.tsx`
- Checked that the frontend dependency set already includes `@reduxjs/toolkit`, so RTK Query can be added without introducing a new state library.

### Why

- The backend is already broad enough to support meaningful browser testing.
- The imported app still encodes OTP assumptions even though the auth direction has already shifted to Keycloak/OIDC.
- Replacing mocks now will surface contract mismatches while the backend code is still easy to change.

### What worked

- The backend route inventory mapped cleanly to the existing booking and portal screens.
- The current Redux architecture is compatible with RTK Query because it already uses Redux Toolkit and centralized store wiring.
- The split between local draft state and server state is clear enough to plan without rewriting the app from scratch.

### What didn't work

- The previous OTP-shaped frontend assumptions no longer fit the current product direction. In practical terms, `SignInPage.tsx`, `VerifyCodePage.tsx`, and parts of `authSlice.ts` now describe a dead-end flow rather than the intended Keycloak/OIDC login path.

### What I learned

- The right migration is additive first, destructive second. Add an API layer and hook up live reads and writes before deleting the old slices and mock datasets.
- `consultationSlice` is still useful. It should keep multi-step draft state even after the API integration lands.
- `portalSlice` is carrying too much canonical business data and should shrink once RTK Query owns the portal reads and writes.

### What was tricky to build

- The main planning challenge was distinguishing state that is truly local UI state from data that should now come from the backend. The symptoms were mixed responsibilities inside slices like `portalSlice.ts` and `authSlice.ts`, where view state and fake business records live together. I approached that by classifying each screen’s data into either draft state, view state, or canonical server state before proposing any file layout.

### What warrants a second pair of eyes

- The auth UX cutover deserves review before implementation starts. Replacing the OTP-style sign-in screens with Keycloak initiation may alter the app’s entry flow more than the rest of the RTK Query migration.
- The deposit/payment UI should also be reviewed so it does not accidentally imply a real payment backend when deposits are still out of MVP scope.

### What should be done in the future

- Build the RTK Query foundation first.
- Replace public booking reads and writes next.
- Replace portal reads and writes after that.
- Leave portal photos behind a backend-readiness checkpoint instead of inventing a fake frontend contract.

### Code review instructions

- Start with the store and mock ownership files:
  - `web/src/stylist/store/index.ts`
  - `web/src/stylist/store/authSlice.ts`
  - `web/src/stylist/store/consultationSlice.ts`
  - `web/src/stylist/store/portalSlice.ts`
- Then review the screens that still encode fake backend behavior:
  - `web/src/stylist/pages/SignInPage.tsx`
  - `web/src/stylist/pages/VerifyCodePage.tsx`
  - `web/src/stylist/pages/ConsultCalendarPage.tsx`
  - `web/src/stylist/data/portal-data.ts`
- Validate the reasoning by comparing those files to the current backend routes already available under `/api/*`.

### Technical details

- Existing backend routes ready for integration:
  - `GET /api/services`
  - `POST /api/intake`
  - `POST /api/intake/:id/photos`
  - `GET /api/availability`
  - `POST /api/appointments`
  - `GET /api/me`
  - `PATCH /api/me`
  - `PATCH /api/me/notification-prefs`
  - `GET /api/me/appointments`
  - `GET /api/me/appointments/:id`
  - `PATCH /api/me/appointments/:id`
  - `POST /api/me/appointments/:id/cancel`
  - `GET /api/me/maintenance-plan`

## Step 2: Create HAIR-003 And Capture The Frontend Integration Plan

Once the decision was made, I created a dedicated frontend ticket instead of overloading the backend one. That keeps the implementation history clean: HAIR-002 remains the backend design-and-build thread, while HAIR-003 becomes the frontend integration thread. I also wrote the new guide as if it were onboarding material for an intern, because the main value here is not only the endpoint list but the explanation of what should stay in slices, what should move to RTK Query, and what order prevents churn.

I also turned the placeholder task list into a granular migration plan. That matters because the frontend still has several kinds of work mixed together: auth flow replacement, public booking mutations, portal reads, portal writes, photo work, and mock cleanup. A flat to-do list would not be enough.

### Prompt Context

**User prompt (verbatim):** "alright, writ eup your diary, then let's make a ticket and write up the implementation guide for the integration and frontend. Add granular detailed tasks to do it."

**Assistant interpretation:** The user wanted a new docmgr ticket focused on the frontend integration phase, plus a detailed guide and granular implementation checklist.

**Inferred user intent:** Capture the frontend migration as a first-class workstream so implementation can proceed methodically rather than ad hoc.

### What I did

- Created a new frontend ticket:

```bash
docmgr ticket create-ticket \
  --ticket HAIR-003 \
  --title "Integrate Hair Stylist Frontend With Backend APIs Via RTK Query" \
  --topics frontend,react,redux,typescript
```

- Added the main design guide document.
- Added this diary document.
- Replaced the placeholder ticket overview with a real summary, scope, and deliverables.
- Replaced the default task template with phased, granular tasks covering:
  - RTK Query foundation
  - auth/session integration
  - public consultation flow
  - portal reads
  - portal writes
  - portal photos
  - mock cleanup
  - validation
- Wrote the design guide around a proposed API package layout:

```text
web/src/stylist/store/api/
  base.ts
  types.ts
  mappers.ts
  servicesApi.ts
  bookingApi.ts
  portalApi.ts
  authApi.ts
```

### Why

- The frontend plan needs its own durable artifact set so implementation can be reviewed and resumed cleanly.
- The migration touches several files across store setup, page-level data loading, and auth entry points. A dedicated ticket prevents those decisions from getting buried inside the backend history.
- Granular tasks make it easier to commit the work in slices that align with real user flows.

### What worked

- The ticket structure cleanly separated planning from later code implementation.
- The guide could be grounded in existing repo structure instead of abstract architecture advice.
- The tasks decomposed naturally into slices that match both the backend contract boundaries and the visible UI flows.

### What didn't work

- My initial attempt to patch the generated diary and design-doc templates in place was too coarse. `apply_patch` rejected the larger hunks because the expected template context did not match cleanly. I recovered by re-reading the generated files and replacing them with smaller, deterministic edits.

### What I learned

- For large docmgr templates, replacing a placeholder file wholesale is more reliable than trying to patch many small template comment blocks at once.
- The frontend task list is easiest to reason about when grouped by user flow rather than by file. The file list belongs inside the guide and diary, not as the primary work breakdown.

### What was tricky to build

- The tricky part was turning a vague “integrate the frontend” request into an execution plan that an intern could follow without guessing. The underlying cause was that the repo contains multiple competing sources of truth: mock data modules, Redux slices with fake records, and real backend APIs. The solution was to define the migration in phases and explicitly state which layer owns what data after each phase.

### What warrants a second pair of eyes

- The proposed API package structure should be reviewed before code lands so naming and ownership stay stable across the whole integration effort.
- The guide currently assumes the frontend will use credentialed browser requests against the Go backend while Keycloak handles login initiation. That assumption should be revalidated once the first auth bootstrap slice is implemented.

### What should be done in the future

- Relate the final implementation commits back to this ticket as each slice lands.
- Keep the diary updated with exact commands, tests, failures, and commit hashes.
- Convert any remaining production mock data into Storybook-only fixtures once the live routes are wired.

### Code review instructions

- Start with the ticket deliverables:
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/index.md`
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/design-doc/01-hair-booking-frontend-integration-guide.md`
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/tasks.md`
- Then compare the plan against the current frontend code in:
  - `web/src/stylist/store/`
  - `web/src/stylist/pages/`
  - `web/src/stylist/data/`
- Validate the ticket workspace with:

```bash
docmgr doctor --ticket HAIR-003 --stale-after 30
```

### Technical details

- Files that directly informed the plan:
  - `web/package.json`
  - `web/src/stylist/store/index.ts`
  - `web/src/stylist/store/authSlice.ts`
  - `web/src/stylist/store/consultationSlice.ts`
  - `web/src/stylist/store/portalSlice.ts`
  - `web/src/stylist/pages/SignInPage.tsx`
  - `web/src/stylist/pages/VerifyCodePage.tsx`
  - `web/src/stylist/pages/ConsultCalendarPage.tsx`
  - `web/src/stylist/pages/PortalHomePage.tsx`
  - `web/src/stylist/data/portal-data.ts`
- Commands used for ticket creation and review:

```bash
git status --short
docmgr ticket create-ticket --ticket HAIR-003 --title "Integrate Hair Stylist Frontend With Backend APIs Via RTK Query" --topics frontend,react,redux,typescript
docmgr doc add --ticket HAIR-003 --doc-type design-doc --title "Hair Booking Frontend Integration Guide"
docmgr doc add --ticket HAIR-003 --doc-type reference --title "Investigation Diary"
sed -n '1,220p' web/src/stylist/store/index.ts
sed -n '1,220p' web/src/stylist/store/authSlice.ts
sed -n '1,260p' web/src/stylist/store/portalSlice.ts
sed -n '1,220p' web/src/stylist/pages/SignInPage.tsx
sed -n '1,220p' web/src/stylist/pages/VerifyCodePage.tsx
sed -n '1,220p' web/src/stylist/pages/ConsultCalendarPage.tsx
sed -n '1,220p' web/src/stylist/pages/PortalHomePage.tsx
```

## Step 3: Build The RTK Query Foundation Without Changing Screen Behavior

I implemented the first code slice as infrastructure only and kept the UI behavior unchanged on purpose. The goal of this step was to create the shared server-state layer that later slices can use, without mixing that work with auth redesign or booking-page rewrites. That meant adding the API package, registering RTK Query in the store, and capturing backend DTOs and mapper functions up front.

I also treated validation as part of the feature instead of as an afterthought. The first typecheck failed because the frontend dependencies had not been installed in this workspace, which is exactly the kind of continuation hazard the diary should record. After installing the dependencies, the typecheck passed and the slice was committed cleanly.

### Prompt Context

**User prompt (verbatim):** "continue"

**Assistant interpretation:** Start executing the new frontend integration ticket, beginning with the lowest-risk RTK Query foundation work.

**Inferred user intent:** Move from planning into implementation in small, testable slices instead of keeping the ticket purely documentary.

**Commit (code):** bb46c1b — "feat: add RTK Query frontend foundation"

### What I did

- Added `web/src/stylist/store/api/` with:
  - `base.ts`
  - `types.ts`
  - `mappers.ts`
  - `servicesApi.ts`
  - `bookingApi.ts`
  - `portalApi.ts`
  - `authApi.ts`
  - `index.ts`
- Added a shared `fetchBaseQuery` wrapper that:
  - sends browser credentials
  - unwraps backend `{ data: ... }` envelopes
  - normalizes backend `{ error: ... }` responses into a single frontend error shape
- Registered the RTK Query reducer and middleware in `web/src/stylist/store/index.ts`.
- Refactored the store module to export `rootReducer`, `createAppStore`, `store`, and typed store aliases so both the app and tests can build the same store shape.
- Updated `web/src/stylist/store/test-utils.ts` to delegate to `createAppStore` instead of duplicating reducer wiring.
- Exported the new API package through `web/src/stylist/index.ts`.
- Added DTOs for the current backend endpoints and mapping helpers for current widget-facing portal and booking shapes.
- Defined endpoint modules and tags for:
  - app info
  - services
  - intake creation
  - intake photo upload
  - availability
  - appointment creation
  - `/api/me`
  - profile and notification preference updates
  - portal appointments
  - maintenance-plan reads

### Why

- Later frontend slices need a stable API layer before pages can be migrated one by one.
- The store had to be refactored first so RTK Query could be shared between the real app store and any future test harness.
- Defining DTOs and mappers now reduces the chance that each page will invent its own network assumptions later.

### What worked

- The backend envelope format mapped cleanly to a shared RTK Query base query.
- The current store structure accepted the RTK Query reducer and middleware without forcing any page-level changes.
- `createAppStore` gave the project a better seam for tests and future provider setup than the previous singleton-only store export.
- The compiler only found two issues after the initial pass, and both were narrow fixes rather than structural rewrites.

### What didn't work

- The first validation attempt failed because TypeScript was not installed locally yet:

```bash
npm --prefix web run typecheck
```

```text
> hair-booking-web@0.1.0 typecheck
> tsc --noEmit

sh: 1: tsc: not found
```

- I fixed that with:

```bash
npm --prefix web ci
```

- After dependencies were installed, the next compiler run exposed two code issues:

```text
src/stylist/store/api/base.ts(82,41): error TS2345: Argument of type 'FetchBaseQueryError | undefined' is not assignable to parameter of type 'FetchBaseQueryError'.
src/stylist/store/api/mappers.ts(122,21): error TS2339: Property 'sort_order' does not exist on type 'PortalAppointmentDto'.
```

- I fixed both and reran:

```bash
npm --prefix web run typecheck
```

which then passed.

### What I learned

- The frontend workspace cannot be assumed to have dependencies installed, even when the backend side of the repo is already active.
- A dedicated API package with injected endpoints keeps the code easier to review than one oversized `api.ts`.
- The current widget types still reflect mock-era assumptions, especially numeric IDs in portal view models, so mapper functions are the right buffer for now.

### What was tricky to build

- The sharp edge here was the mismatch between backend identity shapes and the existing widget-friendly types. For example, backend IDs are UUID strings, while some current portal widgets still expect numeric IDs. The symptom was immediate in the mapper layer. I handled it by introducing explicit mapping helpers instead of mutating the existing widget types in the same slice. That keeps the infrastructure commit focused and postpones UI-facing type cleanup to the later page-migration work where it can be reviewed in context.

### What warrants a second pair of eyes

- The mapper layer deserves review, especially the temporary conversions that smooth over mock-era widget types.
- The endpoint return types for reschedule/cancel flows should be revisited when those mutations are actually consumed by portal pages, because the current slice defines the contract but does not yet prove the UI assumptions.
- The exported API surface in `web/src/stylist/index.ts` should be reviewed if the widget package is intended to be consumed externally, since it now exposes the RTK Query package in addition to the previous store exports.

### What should be done in the future

- Phase 2 should replace the OTP-only auth assumptions with Keycloak/OIDC-aware entry behavior.
- The booking and portal screens should adopt these hooks gradually rather than switching all pages in one commit.
- A real frontend test runner should be added before claiming deeper behavioral test coverage.

### Code review instructions

- Start with the store setup:
  - `web/src/stylist/store/index.ts`
  - `web/src/stylist/store/test-utils.ts`
- Then review the API package in order:
  - `web/src/stylist/store/api/base.ts`
  - `web/src/stylist/store/api/types.ts`
  - `web/src/stylist/store/api/mappers.ts`
  - `web/src/stylist/store/api/authApi.ts`
  - `web/src/stylist/store/api/servicesApi.ts`
  - `web/src/stylist/store/api/bookingApi.ts`
  - `web/src/stylist/store/api/portalApi.ts`
- Finally check the top-level export change in:
  - `web/src/stylist/index.ts`
- Validate with:

```bash
npm --prefix web run typecheck
```

### Technical details

- Commands run during this slice:

```bash
mkdir -p web/src/stylist/store/api
npm --prefix web run typecheck
npm --prefix web ci
npm --prefix web run typecheck
git add web/src/stylist/index.ts web/src/stylist/store/index.ts web/src/stylist/store/test-utils.ts web/src/stylist/store/api
git commit -m "feat: add RTK Query frontend foundation"
```

- Files changed in the code slice:
  - `web/src/stylist/index.ts`
  - `web/src/stylist/store/index.ts`
  - `web/src/stylist/store/test-utils.ts`
  - `web/src/stylist/store/api/base.ts`
  - `web/src/stylist/store/api/types.ts`
  - `web/src/stylist/store/api/mappers.ts`
  - `web/src/stylist/store/api/authApi.ts`
  - `web/src/stylist/store/api/servicesApi.ts`
  - `web/src/stylist/store/api/bookingApi.ts`
  - `web/src/stylist/store/api/portalApi.ts`
  - `web/src/stylist/store/api/index.ts`

## Step 4: Replace The Fake OTP Flow With Browser Session Bootstrap

The second code slice focused on auth only. I did not try to wire real portal profile data or booking data in the same commit, because that would have mixed three changes at once: auth cutover, portal-data cutover, and booking cutover. Instead, I treated auth as a shell concern. The app now asks the backend whether a session exists, starts browser login through Keycloak, and gates the portal accordingly.

That changed the frontend in two important ways. First, the fake login-code state machine is gone from `authSlice`, which now holds only local deposit/payment UI state. Second, the portal no longer assumes that a user is authenticated just because the widget rendered. It now shows loading, unauthenticated, and authenticated states based on `/api/info` plus `/api/me`.

### Prompt Context

**User prompt (verbatim):** (same as Step 3)

**Assistant interpretation:** Continue from the RTK Query foundation into the next smallest production-facing slice, which is auth/session integration.

**Inferred user intent:** Start making the frontend behave like the real app without yet rewriting every booking and portal page to consume live backend data.

**Commit (code):** dd3bcda — "feat: add OIDC session bootstrap to frontend"

### What I did

- Reduced `web/src/stylist/store/authSlice.ts` to payment and deposit UI state only.
- Removed the OTP-only auth fields from the consultation draft model in:
  - `web/src/stylist/types.ts`
  - `web/src/stylist/data/consultation-constants.ts`
- Added a `useSessionBootstrap()` helper in `web/src/stylist/store/api/authApi.ts` that combines:
  - `GET /api/info`
  - `GET /api/me`
- Implemented status interpretation in that helper for:
  - loading
  - authenticated
  - unauthenticated (`401` from `/api/me`)
  - non-auth backend failures
- Replaced the old `SignInPage` code-entry UI with a Keycloak/OIDC initiation screen that:
  - checks whether the browser is already signed in
  - starts login through `loginPath`
  - starts logout through `logoutPath`
  - exposes loading and retry states
- Repurposed `VerifyCodePage` into a compatibility wrapper that points back to the new sign-in flow instead of simulating code entry.
- Added portal auth gating in `web/src/stylist/ClientPortalApp.tsx` so the portal now shows:
  - loading while session state is being checked
  - sign-in UI when unauthenticated
  - the existing portal shell when authenticated
- Wired the portal profile sign-out button to the browser logout path.
- Updated the sign-in and verify-code stories so Storybook no longer advertises the deleted OTP flow.

### Why

- The app had already committed to Keycloak/OIDC on the backend side, so leaving a fake OTP flow in the frontend would have created direct product drift.
- Session bootstrap belongs in a thin frontend shell layer before deeper data migration work, because the portal should not render as authenticated if the backend does not agree.
- Removing the dead OTP fields now makes the later booking and portal slices easier to reason about.

### What worked

- `/api/info` and `/api/me` were enough to derive a useful frontend session model without adding any new backend routes.
- The portal auth gate fit cleanly into `ClientPortalApp.tsx` without forcing the portal pages themselves to change yet.
- Reducing `authSlice` made the state model clearer immediately: server session state comes from RTK Query, local payment sheet state stays in Redux.
- The phase still compiled cleanly after the story alignment work:

```bash
npm --prefix web run typecheck
```

### What didn't work

- There was no new compile failure in this slice, but one subtle issue emerged during implementation: the unauthenticated portal state originally returned the sign-in page without the widget root wrapper, which would have broken the themed shell layout. I fixed that before final validation by wrapping the unauthenticated sign-in state in the same `data-widget="stylist"` root container used by the authenticated portal.

- A second design limitation remains intentionally unresolved: in `dev` auth mode, the backend still reports login/logout paths even though the browser auth handlers are not wired. That does not break the current session bootstrap because `/api/me` succeeds in dev mode, but it means the UI should continue to be tested primarily in OIDC mode for real auth flows.

### What I learned

- The frontend can get a lot of real behavior from a very small auth contract if it cleanly separates session state from local UI state.
- It is worth aligning Storybook stories as part of the same auth slice when a user-facing flow is being removed, otherwise the widget package keeps documenting the wrong product.
- The real migration path is: auth shell first, then page data reads, then page writes.

### What was tricky to build

- The tricky part was avoiding a half-real, half-fake auth model. If I had only changed the sign-in page copy but kept `authSlice` pretending to own authentication, the app would still have had two incompatible sources of truth. The symptoms were already present in the old state shape: Redux tracked `isAuthenticated`, while the backend tracked sessions independently. I resolved that by deleting the OTP state machine entirely and making authentication a derived RTK Query concern.

### What warrants a second pair of eyes

- Review the session bootstrap contract in `web/src/stylist/store/api/authApi.ts`, especially the interpretation of `401` from `/api/me` as unauthenticated rather than as a general app error.
- Review the sign-in page behavior in `web/src/stylist/pages/SignInPage.tsx` for UX clarity, because it now doubles as both a booking-side sign-in screen and a portal entry screen.
- Review whether the portal should show any authenticated client details before Phase 4 replaces the mock profile data with `/api/me`.

### What should be done in the future

- Phase 3 should start moving public booking pages onto live backend reads and writes.
- Phase 4 should replace the mock portal user and appointment data so the authenticated portal shell no longer renders fake records after login.
- A real frontend test runner is still needed before the auth states can be covered by component or integration tests.

### Code review instructions

- Start with:
  - `web/src/stylist/store/authSlice.ts`
  - `web/src/stylist/store/api/authApi.ts`
- Then review the UI entrypoints:
  - `web/src/stylist/pages/SignInPage.tsx`
  - `web/src/stylist/pages/VerifyCodePage.tsx`
  - `web/src/stylist/ClientPortalApp.tsx`
  - `web/src/stylist/pages/PortalProfilePage.tsx`
- Then confirm the deleted auth-draft fields in:
  - `web/src/stylist/types.ts`
  - `web/src/stylist/data/consultation-constants.ts`
- Validate with:

```bash
npm --prefix web run typecheck
```

### Technical details

- Commands run during this slice:

```bash
rg -n "setLoginIdentifier|sendCode|setCodeDigit|clearCode|verifySuccess|verifyFail|decrementCooldown|resendCode|loginIdentifier|codeSentTo|codeDigits|isVerifying|isAuthenticated|resendCooldown" web/src/stylist
rg -n "sign-in|verify-code" web/src/stylist
npm --prefix web run typecheck
git add web/src/stylist/ClientPortalApp.tsx web/src/stylist/data/consultation-constants.ts web/src/stylist/pages/PortalProfilePage.tsx web/src/stylist/pages/SignInPage.stories.tsx web/src/stylist/pages/SignInPage.tsx web/src/stylist/pages/VerifyCodePage.stories.tsx web/src/stylist/pages/VerifyCodePage.tsx web/src/stylist/store/api/authApi.ts web/src/stylist/store/api/index.ts web/src/stylist/store/authSlice.ts web/src/stylist/types.ts
git commit -m "feat: add OIDC session bootstrap to frontend"
```

- Files changed in the code slice:
  - `web/src/stylist/store/authSlice.ts`
  - `web/src/stylist/store/api/authApi.ts`
  - `web/src/stylist/pages/SignInPage.tsx`
  - `web/src/stylist/pages/VerifyCodePage.tsx`
  - `web/src/stylist/ClientPortalApp.tsx`
  - `web/src/stylist/pages/PortalProfilePage.tsx`
  - `web/src/stylist/types.ts`
  - `web/src/stylist/data/consultation-constants.ts`
  - `web/src/stylist/pages/SignInPage.stories.tsx`
  - `web/src/stylist/pages/VerifyCodePage.stories.tsx`

## Step 5: Wire The Public Consultation Funnel To Real Backend Writes

This slice made the booking flow materially real for the first time. The frontend still uses the multi-step consultation draft in Redux, but the critical points in the flow now hit the backend: the estimate step creates an intake, the selected photos are uploaded to that intake, the calendar step loads live availability, and the final booking action creates a real appointment. The confirmation screen now shows backend-derived reference IDs instead of pretending the flow is complete with draft-only state.

The design decision that unlocked this cleanly was not to put `File` objects in Redux. The frontend needed to carry selected images from the photo step to the later estimate step, because the backend intake cannot exist until after the goals pages are complete. I solved that by keeping draft metadata in Redux and storing the actual `File` objects in a small in-memory module. That keeps the store serializable while still allowing real uploads later in the funnel.

### Prompt Context

**User prompt (verbatim):** (same as Step 3)

**Assistant interpretation:** Continue into the next major integration slice, which is the public consultation booking flow.

**Inferred user intent:** Replace the remaining mocked booking behavior with live backend calls so the frontend can begin behaving like a real booking funnel.

**Commit (code):** a49a02a — "feat: wire booking flow to backend APIs"

### What I did

- Added booking artifact fields to the consultation draft model:
  - `intakeId`
  - `estimateLow`
  - `estimateHigh`
  - `appointmentId`
  - `appointmentServiceId`
- Added `web/src/stylist/store/consultationUploads.ts` to hold selected `File` objects outside Redux.
- Updated `ConsultWelcomePage.tsx` to clear any pending consultation uploads when a new booking flow starts.
- Reworked `PhotoBox.tsx` so the photo step can select real image files instead of only simulating them.
- Reworked `PhotosPage.tsx` so:
  - required photos store labels/URLs in Redux draft state
  - selected `File` objects are captured in the in-memory upload store
  - inspiration images accumulate the same way
- Added consultation-to-intake mapping and consult-service selection helpers in `web/src/stylist/store/api/mappers.ts`.
- Reworked `ConsultEstimatePage.tsx` so the booking actions now:
  - create an intake through `POST /api/intake`
  - upload any selected photos through `POST /api/intake/:id/photos`
  - persist the returned intake ID and estimate range back into the Redux draft
- Reworked `CalendarGrid.tsx` into a controlled month component so the parent page can query the correct backend month.
- Reworked `ConsultCalendarPage.tsx` so it now:
  - resolves the consult service via `GET /api/services`
  - loads live availability via `GET /api/availability`
  - creates an appointment via `POST /api/appointments`
  - persists the created appointment ID for the confirmation screen
- Reworked `ConsultConfirmPage.tsx` so it shows the real intake and appointment references.

### Why

- The booking funnel was the biggest remaining gap between the imported widgets and a testable MVP.
- The backend intake contract requires later-form fields from the goals pages, so the frontend could not simply create the intake on the photo step without losing data.
- A small in-memory upload store was the simplest way to preserve selected files across pages without poisoning Redux serializability.

### What worked

- The existing consultation draft shape was flexible enough to keep form-progress state while allowing the actual writes to move into RTK Query mutations.
- The backend estimate values fit naturally into the existing estimate UI once stored alongside the draft.
- The consult service lookup through `GET /api/services` was sufficient to remove the last hard dependency on deterministic consult-service assumptions in the calendar step.
- The whole slice still compiles cleanly:

```bash
npm --prefix web run typecheck
```

### What didn't work

- There was no compiler failure after the implementation pass, but the tricky failure mode here was architectural: the original photo step had no real file input at all, only `simulatePhoto()` placeholders. Without changing that component contract, the booking flow could never have reached a real multipart upload. The fix was to change `PhotoBox.tsx` itself rather than trying to fake upload behavior higher up in the page.

- A second limitation remains: I validated the code with TypeScript, but I did not run a full browser-backed end-to-end smoke loop in this slice. That means the implementation is code-complete and typechecked, but not yet manually exercised against a running app + backend session in this turn.

### What I learned

- Moving only the write boundary to RTK Query is enough to make the funnel materially real, even before every display component is refactored.
- The right place to resolve consult service IDs is near the booking action, not in static constants.
- Backend IDs and estimates are worth storing in the draft model as soon as they exist, because later screens can use them without inventing parallel local state.

### What was tricky to build

- The hardest part was the ordering constraint between photos and intake creation. The photo step appears before the goals step, but the backend intake payload needs the goals fields too. The symptom was a mismatch between the UX order and the API contract. I solved it by splitting “user picked a file” from “frontend uploads a file”: the photo step now only captures files, and the estimate step does the actual intake creation plus upload sequence once the payload is complete.

### What warrants a second pair of eyes

- Review the `consultationUploads.ts` in-memory file store. It is pragmatic and appropriate for this MVP slice, but it is intentionally ephemeral and should not be mistaken for durable state.
- Review `ConsultEstimatePage.tsx` for idempotency expectations, because revisiting the step can create a new intake and re-upload the currently held files.
- Review the consult-service selection helper in `mappers.ts`; for `both`, it currently resolves to the extensions consultation path because the seeded backend catalog has no dedicated combined consult row.

### What should be done in the future

- Run a real browser-backed smoke test against the local backend stack.
- Phase 4 should replace the portal read paths so the authenticated shell no longer falls back to mock user and appointment records.
- If the booking flow becomes more stateful, the temporary in-memory file store may need to evolve into a more explicit upload session model.

### Code review instructions

- Start with:
  - `web/src/stylist/store/consultationUploads.ts`
  - `web/src/stylist/store/api/mappers.ts`
- Then review the booking pages in order:
  - `web/src/stylist/pages/PhotosPage.tsx`
  - `web/src/stylist/pages/ConsultEstimatePage.tsx`
  - `web/src/stylist/pages/ConsultCalendarPage.tsx`
  - `web/src/stylist/pages/ConsultConfirmPage.tsx`
- Then review the supporting component changes:
  - `web/src/stylist/components/PhotoBox.tsx`
  - `web/src/stylist/components/CalendarGrid.tsx`
- Validate with:

```bash
npm --prefix web run typecheck
```

### Technical details

- Commands run during this slice:

```bash
rg -n "CalendarGrid" web/src/stylist
rg -n "PhotoBox" web/src/stylist
rg -n "simulatePhoto|addInspoPhoto|intakeId|estimateLow|estimateHigh|appointmentId|appointmentServiceId|consultationUploads|useGetAvailabilityQuery\\(|useCreateIntakeMutation\\(|useCreateAppointmentMutation\\(" web/src/stylist
npm --prefix web run typecheck
git add web/src/stylist/store/api/base.ts web/src/stylist/store/api/index.ts web/src/stylist/store/api/mappers.ts web/src/stylist/types.ts web/src/stylist/data/consultation-constants.ts web/src/stylist/store/consultationUploads.ts web/src/stylist/store/consultationSlice.ts web/src/stylist/pages/ConsultWelcomePage.tsx web/src/stylist/components/PhotoBox.tsx web/src/stylist/components/CalendarGrid.tsx web/src/stylist/components/CalendarGrid.stories.tsx web/src/stylist/pages/PhotosPage.tsx web/src/stylist/pages/ConsultEstimatePage.tsx web/src/stylist/pages/ConsultCalendarPage.tsx web/src/stylist/pages/ConsultConfirmPage.tsx
git commit -m "feat: wire booking flow to backend APIs"
```

- Files changed in the code slice:
  - `web/src/stylist/store/api/base.ts`
  - `web/src/stylist/store/api/index.ts`
  - `web/src/stylist/store/api/mappers.ts`
  - `web/src/stylist/types.ts`
  - `web/src/stylist/data/consultation-constants.ts`
  - `web/src/stylist/store/consultationUploads.ts`
  - `web/src/stylist/store/consultationSlice.ts`
  - `web/src/stylist/pages/ConsultWelcomePage.tsx`
  - `web/src/stylist/components/PhotoBox.tsx`
  - `web/src/stylist/components/CalendarGrid.tsx`
  - `web/src/stylist/pages/PhotosPage.tsx`
  - `web/src/stylist/pages/ConsultEstimatePage.tsx`
  - `web/src/stylist/pages/ConsultCalendarPage.tsx`
  - `web/src/stylist/pages/ConsultConfirmPage.tsx`

## Step 6: Build A Real Local Smoke Harness Around The React App

The next bottleneck was not backend readiness. It was the fact that the Go app still serves the older embedded frontend from `pkg/web/public`, while the work I needed to validate lives in `web/src`. A smoke test against `http://127.0.0.1:8080/` alone would have exercised the wrong UI, so I treated this as a harness problem first.

I added the smallest possible dev-only bridge to expose the actual React booking and portal apps under Vite without disturbing the Go-served asset bundle. Then I started the database, backend, and Vite server in tmux shells so the processes would survive browser interruptions exactly the way the user asked.

### Prompt Context

**User prompt (verbatim):** "ok, do the real smoke test. Run things in tmux in shells so that killing them doesn't close the tmux. Use playwright."

**Assistant interpretation:** The user wanted a browser-backed end-to-end validation against the local stack and explicitly wanted the runtime processes launched inside tmux shells.

**Inferred user intent:** Validate the real frontend/backend integration instead of relying on typechecking or backend-only tests, while making the setup reproducible and debuggable.

### What I did

- Confirmed the frontend split:
  - embedded assets served by Go from `pkg/web/public/*`
  - active React integration work in `web/src`
- Patched `web/vite.config.ts` to proxy:
  - `/api`
  - `/auth`
  - `/uploads`
- Patched `web/src/main.tsx` so Vite can render:
  - `?app=booking` → `ClientBookingApp`
  - `?app=portal` → `ClientPortalApp`
  - default → `StylistApp`
- Re-ran:

```bash
npm --prefix web run typecheck
```

- Started the local app database:

```bash
docker compose -f docker-compose.local.yml up -d app-postgres
```

- Created tmux shells and launched the backend and Vite there:

```bash
tmux new-session -d -s hb-backend 'cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking && exec zsh -i'
tmux new-session -d -s hb-web 'cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking && exec zsh -i'
tmux send-keys -t hb-backend 'HAIR_BOOKING_DATABASE_URL=postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable make run-local-oidc APP_PORT=8080 KEYCLOAK_PORT=18090 SESSION_SECRET=local-session-secret' C-m
tmux send-keys -t hb-web 'npm --prefix web run dev -- --host 127.0.0.1 --port 5173' C-m
```

- Added ticket-local reproducibility scripts:
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/start_local_smoke_stack.sh`
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh`

### Why

- The real React integration could not be validated through the old embedded frontend.
- The API layer uses relative `/api` paths, so Vite needed to proxy the backend in dev for realistic browser behavior.
- The smoke pass needed retraceable local scripts instead of one-off terminal history.

### What worked

- `npm --prefix web run typecheck` passed after the harness patch.
- The backend started cleanly with OIDC enabled and the database configured.
- `curl -i http://127.0.0.1:8080/api/info` returned `200 OK` and reported `authMode: "oidc"` plus `databaseConfigured: true`.
- Both requested tmux shells were created successfully.

### What didn't work

- The preferred Vite port was unavailable. The `hb-web` pane reported:

```text
Port 5173 is in use, trying another one...
Port 5174 is in use, trying another one...
  VITE v6.4.1  ready in 166 ms
  ➜  Local:   http://127.0.0.1:5175/
```

- My first `curl` against the Vite app failed because the unquoted `?app=booking` URL was interpreted by `zsh`:

```text
zsh:1: no matches found: http://127.0.0.1:5173/?app=booking
```

### What I learned

- This repo currently has two frontend realities, and only the Vite one exercises the RTK Query work.
- A query-param app switch in `main.tsx` is enough to smoke-test the booking and portal apps without forcing a larger routing refactor first.
- Ticket-local scripts are useful even for smoke work because they preserve the local port and tmux assumptions that are otherwise easy to lose.

### What was tricky to build

- The main trap was architectural: the backend could look healthy while the actual integrated frontend remained completely untested. The symptom was a false sense of readiness from `make run-local-oidc` alone. I handled that by tracing the entrypoints (`pkg/web/assets.go`, `pkg/web/public/index.html`, `web/index.html`, and `web/src/main.tsx`) before deciding how to launch the browser.

### What warrants a second pair of eyes

- The Vite proxy and `main.tsx` app-switch are smoke-test harness changes. They are useful, but they should be reviewed as intentional dev ergonomics rather than accidental product behavior.
- The occupied `5173` and `5174` ports mean local workstation state can influence the test environment.

### What should be done in the future

- Complete the Playwright booking flow against the Vite app on the actual chosen port.
- Inspect Postgres afterward to verify intake, intake photo, and appointment persistence.
- Run a separate portal-auth smoke pass through Keycloak and record what remains mock-backed after login.

### Code review instructions

- Start with:
  - `web/vite.config.ts`
  - `web/src/main.tsx`
- Then review the reproducibility helpers:
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/start_local_smoke_stack.sh`
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh`
- Validate with:

```bash
npm --prefix web run typecheck
tmux capture-pane -pt hb-backend
tmux capture-pane -pt hb-web
curl -i http://127.0.0.1:8080/api/info
curl -I 'http://127.0.0.1:5175/?app=booking'
```

### Technical details

- Local runtime assumptions during this step:
  - database URL: `postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable`
  - Keycloak issuer: `http://127.0.0.1:18090/realms/hair-booking-dev`
  - realm user: `alice` / `secret`
- tmux sessions used:
  - `hb-backend`
  - `hb-web`

## Step 7: Run The Real Browser Smoke Test And Fix The Defects It Exposed

Once the harness was live, I ran the actual browser path with Playwright instead of stopping at service health checks. That immediately paid off. The first end-to-end attempt did not fail in the frontend. It failed in the backend intake repository on a null-scan bug. After fixing that, the booking flow advanced and exposed a second issue in the frontend services query contract. After fixing that, the booking flow completed and persisted exactly the rows the confirmation screen claimed. Then I ran the OIDC portal login path and found a third issue in authenticated client bootstrap, fixed it, and confirmed that the browser session worked end to end.

The smoke pass therefore did what it was supposed to do: it converted “typechecks and backend tests pass” into “the real browser path works,” and it found bugs in exactly the seams that unit-style validation had missed.

### Prompt Context

**User prompt (verbatim):** (same as Step 6)

**Assistant interpretation:** Continue the live smoke pass until the real browser path either succeeds or exposes concrete defects, then fix those defects and re-verify.

**Inferred user intent:** Use the live app as the truth source, not assumptions from tests or local reasoning.

### What I did

- Drove the booking flow through Playwright on `http://127.0.0.1:5175/?app=booking`.
- Used real image uploads from local files:
  - `web/node_modules/@storybook/icons/dist/public/cover.jpg`
  - `web/node_modules/@storybook/icons/dist/public/logo.png`
  - `web/node_modules/polished/docs/assets/meta.png`
  - `web/node_modules/@storybook/core/assets/docs/message-reference.png`
- Hit the first booking defect:

```text
failed to create intake submission: can't scan into dest[7] (col: color_service): cannot scan NULL into *string
```

- Patched `pkg/intake/postgres.go` to scan nullable text and int columns through `sql.NullString` / `sql.NullInt64`.
- Re-ran:

```bash
go test ./...
```

- Replayed the booking flow and hit the second defect on the calendar step. The browser console showed:

```text
TypeError: result.map is not a function
```

- Traced that to `web/src/stylist/store/api/servicesApi.ts`, where the query treated the backend payload as a bare array instead of `{ services: [...] }`.
- Added `transformResponse: (response) => response.services`.
- Re-ran:

```bash
npm --prefix web run typecheck
```

- Replayed the booking flow again and completed it successfully:
  - intake ref: `c8d50291`
  - appointment ref: `56741fda`
  - booked slot: `2026-03-19` at `9:00 AM`
- Verified the DB state with:

```bash
ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh
```

- Switched to portal auth smoke on `http://127.0.0.1:5175/?app=portal`.
- Logged in through Keycloak as `alice` / `secret`.
- Hit the third defect after the callback: `/api/me` returned `client-bootstrap-failed`.
- Patched `pkg/clients/postgres.go` to:
  - scan nullable client columns safely
  - upsert on email conflict so a guest-booking client can be linked to an authenticated identity
- Re-ran:

```bash
go test ./...
npm --prefix web run typecheck
```

- Restarted the backend tmux shell and reloaded the portal app.
- Verified from inside the browser that `/api/me` returned `200` with the authenticated `Alice Example` client and linked auth identity.
- Confirmed sign-out clears the session and returns the Vite portal app to the unauthenticated sign-in gate.
- Added a replayable browser script:
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/playwright_smoke_flow.mjs`

### Why

- Browser smoke work only matters if failures are fixed and replayed immediately.
- The booking path spans Redux draft state, RTK Query writes, multipart upload handling, backend persistence, and confirmation-screen rendering. It is exactly the sort of flow that exposes nullability and contract mismatches.
- The portal auth path is the highest-value authenticated check available before the portal read integration is complete.

### What worked

- The booking flow now works end to end in the browser against local Postgres and the live Go server.
- The DB inspection matched the UI confirmation exactly:
  - client email: `alice@example.com`
  - intake ID: `c8d50291-1700-4ba6-8d42-1ef58082d2b4`
  - appointment ID: `56741fda-8bfa-4d6d-8b2d-2c98978df6a9`
- `GET /api/availability` returned the same day/time inventory the calendar screen rendered.
- Keycloak login and logout both work in the browser.
- After the client bootstrap fix, `/api/me` returned:
  - `name: "Alice Example"`
  - `email: "alice@example.com"`
  - `auth_subject: "0a51850b-070b-471e-83c7-229ba830f1ac"`

### What didn't work

- First booking attempt failed on intake null scanning:

```text
failed to create intake submission: can't scan into dest[7] (col: color_service): cannot scan NULL into *string
```

- Second booking attempt failed on the services-query shape mismatch:

```text
TypeError: result.map is not a function
```

- First portal login attempt established the OIDC session but failed on the authenticated client bootstrap path, surfacing `client-bootstrap-failed` from `/api/me`.

- Even after auth was fixed, the main portal content still showed mock records like `Mia Kovacs` and `K-Tip Move-Up`. That is not a new bug from this step; it confirms that Phase 4 portal reads are still pending and the authenticated shell is ahead of the data integration.

### What I learned

- The booking flow had three different contract boundaries that tests had not exercised together:
  - nullable SQL return values
  - RTK Query response shape assumptions
  - guest-to-authenticated client identity linking
- The portal session bootstrap is working as designed, but the UI makes the mock/data split visible because the avatar can show authenticated initials while the body still renders seeded portal data.
- Ticket-local scripts are worth keeping even for exploratory smoke work because the verification story becomes much easier to repeat.

### What was tricky to build

- The hard part was not the Playwright interactions themselves. It was preserving the debugging context across multiple failures without losing the exact browser state that produced them. The symptoms came from three layers: backend repository scans, frontend RTK Query transforms, and auth bootstrap. I handled that by fixing one defect at a time, restarting only the backend when required, and replaying the same booking and portal paths from the browser until each seam held.

### What warrants a second pair of eyes

- Review the `CreateAuthenticatedClient` upsert in `pkg/clients/postgres.go`. It intentionally links a guest-booking row to an authenticated identity on matching email when no auth subject is already attached. That is pragmatic for the MVP, but it is identity-sensitive logic.
- Review the Vite dev-harness changes as long-term developer ergonomics, not just smoke-test scaffolding.
- Review the portal shell behavior now that the authenticated session and the mock portal body can visibly disagree.

### What should be done in the future

- Phase 4 should replace the remaining portal mock reads so the authenticated shell and the visible portal body reflect the same source of truth.
- Add focused tests around nullable database scans in `pkg/intake/postgres.go` and `pkg/clients/postgres.go`.
- Decide whether the post-login redirect should eventually return directly to the Vite/React app in local development instead of the backend placeholder page.

### Code review instructions

- Start with the backend fixes:
  - `pkg/intake/postgres.go`
  - `pkg/clients/postgres.go`
- Then review the frontend contract fix and smoke harness:
  - `web/src/stylist/store/api/servicesApi.ts`
  - `web/vite.config.ts`
  - `web/src/main.tsx`
- Then review the replay helpers:
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh`
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/playwright_smoke_flow.mjs`
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/start_local_smoke_stack.sh`
- Validate with:

```bash
go test ./...
npm --prefix web run typecheck
tmux capture-pane -pt hb-backend
tmux capture-pane -pt hb-web
ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh
```

### Technical details

- Browser-confirmed booking references:
  - intake ref shown in UI: `c8d50291`
  - appointment ref shown in UI: `56741fda`
- DB rows confirmed by `inspect_latest_booking.sh`:
  - client: `0e6934a4-b0a9-4f3e-ae05-6b9ea259214a`
  - intake: `c8d50291-1700-4ba6-8d42-1ef58082d2b4`
  - appointment: `56741fda-8bfa-4d6d-8b2d-2c98978df6a9`
- Successful browser-side `/api/me` payload after auth bootstrap fix:

```json
{
  "client": {
    "id": "0e6934a4-b0a9-4f3e-ae05-6b9ea259214a",
    "auth_subject": "0a51850b-070b-471e-83c7-229ba830f1ac",
    "auth_issuer": "http://127.0.0.1:18090/realms/hair-booking-dev",
    "name": "Alice Example",
    "email": "alice@example.com",
    "phone": "401-555-0123"
  }
}
```

## Step 8: Promote The Smoke Knowledge Into A Repo-Level Playbook

The smoke test had crossed the line from “ticket-specific implementation detail” into “core operating knowledge for the repo.” At that point, keeping the procedure only inside the ticket diary would have been too fragile. The next person running local validation should not need to reverse-engineer the Vite entrypoint split, the tmux shell pattern, the Keycloak callback behavior, or the Postgres verification commands from ticket history alone.

I therefore promoted the smoke procedure into a durable repo-level playbook under `docs/`, written for an intern who may not know the architecture yet. I also wrote it as a document that is supposed to change over time, not a frozen artifact from one successful run.

### Prompt Context

**User prompt (verbatim):** "add a full playbook for smoke testing, very detailed for our intern, upload to remarkable. Save in docs/"

**Assistant interpretation:** The user wanted the smoke-test knowledge turned into a permanent repo document, detailed enough for a new contributor, and also uploaded to reMarkable.

**Inferred user intent:** Preserve operational knowledge beyond this ticket so future smoke runs are faster, more consistent, and less dependent on individual memory.

### What I did

- Added:
  - `docs/smoke-testing-playbook.md`
- Structured it as a long-lived runbook with:
  - architecture context
  - startup commands
  - Vite-versus-embedded-frontend explanation
  - booking smoke steps
  - portal auth smoke steps
  - DB verification
  - known failure signatures
  - evidence capture requirements
  - explicit update guidance for future runs
- Updated the ticket tasks so this playbook is treated as an ongoing maintenance target, not a one-time checkbox.

### Why

- A durable playbook belongs in the repo, not only inside a ticket.
- The smoke procedure now contains enough non-obvious details that a new intern would otherwise lose time rediscovering them.
- The repo needs a place where new smoke knowledge can accumulate over time.

### What worked

- The existing smoke findings translated cleanly into a structured runbook.
- The repo already had a `docs/` area, so the playbook fits naturally with other operational documentation.
- The playbook can point to the ticket-local helper scripts without forcing an immediate script migration.

### What didn't work

- N/A

### What I learned

- The most valuable smoke documentation is not just “what command do I run,” but “why this repo has to be tested this way.”
- Capturing the frontend entrypoint split explicitly is just as important as capturing the happy-path browser steps.

### What was tricky to build

- The tricky part was choosing what belonged in a durable repo playbook versus what should remain ticket-local. The rule I used was simple: if a future intern will need it even after HAIR-003 is closed, it belongs in `docs/smoke-testing-playbook.md`. If it is mostly about this ticket’s chronology, it belongs in the diary.

### What warrants a second pair of eyes

- Review whether the ticket-local scripts should eventually be promoted to the top-level `scripts/` directory once the smoke workflow stabilizes further.
- Review the playbook after Phase 4 and Phase 5 so it reflects the point where portal content stops being mock-backed.

### What should be done in the future

- Keep `docs/smoke-testing-playbook.md` updated every time the smoke procedure gains a new invariant, a new route, or a new expected result.
- Expand the portal section once the live portal reads and writes are fully integrated.

### Code review instructions

- Start with:
  - `docs/smoke-testing-playbook.md`
- Then confirm the task bookkeeping reflects the new durable-doc expectation:
  - `ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/tasks.md`

### Technical details

- The playbook is intended to become the canonical local smoke runbook for this repo.
- Ticket diaries should continue to record chronological findings, but the stable procedure should now live in `docs/smoke-testing-playbook.md`.

## Step 9: Replace Portal Read Paths With Live Backend Data

After the smoke-test fixes, the portal had an obvious truth gap: the auth shell was real, but the body still showed `Mia Kovacs` and mock appointments. That was no longer acceptable because it made the app look authenticated while still presenting fake client data. I treated this as the next normal integration slice and moved the portal home, appointments, and profile reads over to RTK Query-backed view hooks.

I deliberately kept the scope tight. Rewards and photos still do not have matching backend support, so I left those sections on their mock path for now. The goal in this slice was to stop lying about the signed-in client and stop reading canonical appointment and maintenance data from `portalSlice`.

### Prompt Context

**User prompt (verbatim):** "continue with the normal integration, making sure to commit at appropriate intervals, checking off tasks in the task list (or adding them if they are not yet present), and keeping a detailed diary"

**Assistant interpretation:** Continue the planned frontend integration work in the next logical slice, keep commits focused, update the ticket tasks as the work becomes concrete, and record the reasoning and outcomes in detail.

**Inferred user intent:** Make steady, disciplined progress on HAIR-003 without losing operational traceability or letting the ticket drift from the actual implementation state.

**Commit (code):** `f546c57` — `feat: load portal reads from backend APIs`

### What I did

- Read the current portal surfaces and confirmed the problem:
  - `PortalHomePage.tsx`
  - `PortalAppointmentsPage.tsx`
  - `PortalProfilePage.tsx`
  - `portalSlice.ts`
  - `portal-data.ts`
- Added `web/src/stylist/store/api/portalView.ts` with dedicated live view hooks:
  - `usePortalProfileView()`
  - `usePortalHomeView()`
  - `usePortalAppointmentsView()`
- Updated `PortalHomePage.tsx` to use live profile, upcoming-appointment, and maintenance-plan reads.
- Updated `PortalAppointmentsPage.tsx` to use live `/api/me/appointments` data keyed by the existing upcoming/past filter.
- Updated `PortalProfilePage.tsx` to use live `/api/me` identity data.
- Updated `ClientPortalApp.tsx` so the top-bar initials no longer depend on the mock slice user.
- Reduced `portalSlice.ts` by removing mock canonical appointment and maintenance state plus the fake cancel reducer.
- Re-ran:

```bash
npm --prefix web run typecheck
```

- Re-ran a focused portal browser smoke:
  - logged in through Keycloak as `alice`
  - returned to `http://127.0.0.1:5175/?app=portal`
  - verified `Hi, Alice`
  - verified the past appointments view showed the real March 19 consult
  - verified the profile page showed `Alice Example`, `alice@example.com`, and `401-555-0123`

### Why

- Once `/api/me` and appointment reads were already available, keeping home/profile/appointments on mock data made the portal actively misleading.
- `portalSlice` needed to shrink so it stopped acting like a second fake backend for screens that now have real queries.
- The widget set still has no standalone appointment-detail screen, so the detail endpoint should remain available but does not need forced UI usage yet.

### What worked

- The portal home greeting now reflects the authenticated client instead of the mock profile.
- The appointments tab now switches between live upcoming and live past appointments from the backend.
- The profile page now shows the real client name, email, phone, and derived “client since” date from `/api/me`.
- The slice reduction did not break typechecking:

```bash
npm --prefix web run typecheck
```

- The browser smoke confirmed the change with visible evidence:
  - home: `Hi, Alice`
  - appointments/past: `Extensions Consultation` on `Mar 19`
  - profile: `Alice Example`

### What didn't work

- There was no new implementation failure in this slice, but the live smoke clarified one important product limitation: Alice’s only appointment is now in the past relative to the current local date (`March 20, 2026`), so the home screen has no “next appointment” card. That is expected data behavior, not a regression.

- The portal still shows mock-backed rewards and photos. That is also expected for this slice and is now more visible because the profile and appointments are no longer mock-backed.

### What I learned

- A small view-hook layer is enough to preserve the existing widget props while moving read ownership out of `portalSlice`.
- The app does not currently have a true standalone appointment-detail page, so the `GET /api/me/appointments/:id` endpoint is ready for later use but not yet consumable in the current UI.
- The portal can be partially real in a controlled way if the boundaries are explicit: profile/home/appointments live, rewards/photos still mock.

### What was tricky to build

- The tricky part was deciding how much of `portalSlice` to remove without destabilizing later slices. The symptoms were mixed responsibilities: UI tab state, filter state, rewards mock data, photo mock data, and canonical appointment/profile data all lived together. I approached that by removing only the clearly backend-owned appointment and maintenance records now, while leaving rewards/photos and remaining local UI state intact until their backend slices land.

### What warrants a second pair of eyes

- Review the UX of the appointments “Past” tab showing a `PENDING` status for a past consult. That reflects the backend status plus date-based filtering, but it may not be the final product wording the team wants.
- Review whether the empty maintenance-plan rendering on the portal home should get a dedicated empty-state treatment once more real client data exists.
- Review whether the current portal top bar should eventually derive more than initials from the authenticated session now that the rest of the portal is becoming live.

### What should be done in the future

- Phase 5 should wire the existing profile/preferences/appointment write endpoints so the now-live portal reads are paired with real mutations.
- Phase 6 should replace the photo timeline mocks.
- Add a dedicated appointment-detail surface only when the widget set actually includes one; do not force the endpoint into fake usage earlier than that.

### Code review instructions

- Start with the new live-read hook layer:
  - `web/src/stylist/store/api/portalView.ts`
- Then review the portal screens:
  - `web/src/stylist/pages/PortalHomePage.tsx`
  - `web/src/stylist/pages/PortalAppointmentsPage.tsx`
  - `web/src/stylist/pages/PortalProfilePage.tsx`
- Then review the slice reduction:
  - `web/src/stylist/store/portalSlice.ts`
  - `web/src/stylist/ClientPortalApp.tsx`
- Validate with:

```bash
npm --prefix web run typecheck
```

- Then run the focused browser smoke:
  1. log in through Keycloak
  2. open `http://127.0.0.1:5175/?app=portal`
  3. confirm `Hi, Alice`
  4. open `Past` appointments and confirm the March 19 consult
  5. open profile and confirm live contact details

### Technical details

- New file added in this slice:
  - `web/src/stylist/store/api/portalView.ts`
- Query sources used:
  - `GET /api/me`
  - `GET /api/me/appointments`
  - `GET /api/me/maintenance-plan`
- The appointment-detail endpoint remains available in RTK Query but intentionally unused because the current widget set has no standalone detail screen.

## Step 10: Make Portal Notification Preferences A Real Mutation

Once the profile page was showing live identity data, the remaining fake toggle behavior stood out immediately. The notification switches still depended on `portalSlice`, which meant the profile was half-real: Alice’s name and email came from `/api/me`, but the switches were still just local mock state. I treated that as the first portal write slice because the backend already supports `PATCH /api/me/notification-prefs` and the UI already has the controls.

This was a good next step because it let me prove one real authenticated mutation path without inventing a profile-edit form or an appointment-reschedule UX first. It also pushed `portalSlice` further toward UI-only concerns.

### Prompt Context

**User prompt (verbatim):** (see Step 9)

**Assistant interpretation:** Continue the normal integration work rather than stopping after the portal read slice, and keep landing focused commits with up-to-date ticket bookkeeping.

**Inferred user intent:** Keep reducing the amount of fake portal behavior while preserving a disciplined implementation trail.

**Commit (code):** `6876704` — `feat: sync portal notification preferences`

### What I did

- Updated `mapNotificationPrefsToViewModel()` so live backend notification preferences no longer force a fake marketing toggle into the mapped result.
- Extended `usePortalProfileView()` to expose live notification preference view data from `/api/me`.
- Reworked `PortalProfilePage.tsx` so the preference switches now call `useUpdateNotificationPrefsMutation()`.
- Added mutation error handling on the profile page using `getApiErrorMessage()`.
- Removed notification preference ownership from `portalSlice.ts`.
- Re-ran:

```bash
npm --prefix web run typecheck
```

- Verified in the browser:
  - logged in as `alice`
  - opened the profile page
  - toggled `Text reminders (2hr)`
  - queried `/api/me` in-browser afterward
  - confirmed `remind_2hr: false`
  - reloaded the portal and confirmed the switch stayed off

### Why

- The notification switches already existed in the UI, so they were the cheapest truthful portal write to integrate.
- This mutation path uses the same authenticated session contract as the portal reads, which makes it a good proof that cache invalidation and session-backed writes work end to end.
- Removing the fake toggle reducer shrinks the surface area where `portalSlice` can diverge from backend truth.

### What worked

- The mutation succeeded against the real backend.
- `/api/me` reflected the updated preference value immediately after the toggle:

```json
{
  "notification_prefs": {
    "remind_48hr": true,
    "remind_2hr": false,
    "maint_alerts": true
  }
}
```

- Reloading the portal profile page preserved the backend value, which proved this was not only an in-memory UI flip.
- `portalSlice` no longer owns notification preferences.

### What didn't work

- The profile page still has no real edit-profile form, so only the preference switches are live in this write slice. That is a scope boundary, not a defect.

### What I learned

- Wiring a single small authenticated mutation is a good way to confirm that the portal’s live read layer and invalidation strategy are behaving correctly.
- It is worth separating “live product toggles” from “marketing placeholders.” The fake marketing row did not belong in the real backend-mapped preference view.

### What was tricky to build

- The tricky part was avoiding a mixed state where the page would show both real backend toggles and leftover mock-only ones. The symptom would have been a profile section where some rows truly persisted and others silently did nothing. I handled that by removing the forced marketing row from the live mapping instead of trying to keep a hybrid list for this slice.

### What warrants a second pair of eyes

- Review whether the notification toggles need a visible saving state or optimistic visual treatment; right now the mutation is truthful but deliberately simple.
- Review whether the marketing preference should come back later as a separate local/business feature once there is an actual backend contract for it.

### What should be done in the future

- Wire the remaining Phase 5 mutations:
  - `PATCH /api/me`
  - `POST /api/me/appointments/:id/cancel`
  - `PATCH /api/me/appointments/:id`
- Add explicit tests around preference mutation invalidation and reload persistence once the frontend test harness exists.

### Code review instructions

- Start with:
  - `web/src/stylist/pages/PortalProfilePage.tsx`
  - `web/src/stylist/store/api/portalView.ts`
  - `web/src/stylist/store/api/mappers.ts`
  - `web/src/stylist/store/portalSlice.ts`
- Validate with:

```bash
npm --prefix web run typecheck
```

- Then in the browser:
  1. sign in to the portal
  2. open profile
  3. toggle `Text reminders (2hr)`
  4. run `fetch('/api/me', { credentials: 'include' })`
  5. confirm `remind_2hr` changed
  6. reload and confirm the toggle persisted

### Technical details

- The live profile preference rows now correspond directly to backend fields:
  - `remind48hr` → `remind_48hr`
  - `remind2hr` → `remind_2hr`
  - `maintAlerts` → `maint_alerts`
- The fake marketing preference row has been removed from the live mapping because there is no backend field for it.

## Step 11: Make Portal Appointment Cancellation Real

After the notification preference mutation landed, the next obvious fake path was appointment cancellation. The portal already showed live appointments, but the cancel affordance was still a dead-end for backend truth. I used that gap to wire the first appointment mutation path rather than jumping straight to rescheduling, because the existing widget set already exposes cancel actions on the home card and the appointments list.

This slice also tightened the smoke testing playbook. The browser run surfaced a real product rule: the backend blocks changes within 24 hours of the appointment start time. That policy needed to become part of the long-lived smoke instructions instead of staying buried in browser console history.

### Prompt Context

**User prompt (verbatim):** "continue with the normal integration, making sure to commit at appropriate intervals, checking off tasks in the task list (or adding them if they are not yet present), and keeping a detailed diary"

**Assistant interpretation:** Keep progressing through HAIR-003 in disciplined feature slices, commit each slice separately, and make sure the ticket documents stay in sync.

**Inferred user intent:** Continue replacing mock-backed portal behavior with real backend integration while preserving a reviewable paper trail.

**Commit (code):** `5a4fbf3` — `feat: allow portal appointment cancellation`

### What I did

- Added `remoteId?: string` to `AppointmentDetail` so the portal view model can carry the backend UUID required for mutation routes.
- Updated the portal appointment mapper to preserve the backend appointment identifier alongside the display-friendly local shape.
- Wired the cancel mutation into `PortalHomePage.tsx` so the home-screen next-appointment card can cancel the live appointment when one exists and policy allows it.
- Wired the cancel mutation into `PortalAppointmentsPage.tsx` so upcoming appointments can also be cancelled from the list view.
- Tightened `NextAppointmentCard.tsx` so it only renders action buttons when a real handler exists, which avoids lying about a reschedule action that is not wired yet.
- Updated `docs/smoke-testing-playbook.md` with:
  - the 24-hour appointment policy failure signature
  - the exact portal cancellation validation sequence
  - the new minimum pass criteria for a successful portal mutation smoke
- Re-ran:

```bash
npm --prefix web run typecheck
```

- Seeded future appointments for Alice so the portal had real upcoming records to act on:

```bash
curl -sS -X POST 'http://127.0.0.1:8080/api/appointments' -H 'content-type: application/json' --data '{"service_id":"4a3d3653-fd03-4f0e-9be8-9d7a4bce33a1","date":"2026-03-21","start_time":"9:30 AM","client_name":"Alice Example","client_email":"alice@example.com","client_phone":"401-555-0123"}'
curl -sS -X POST 'http://127.0.0.1:8080/api/appointments' -H 'content-type: application/json' --data '{"service_id":"4a3d3653-fd03-4f0e-9be8-9d7a4bce33a1","date":"2026-03-23","start_time":"10:00 AM","client_name":"Alice Example","client_email":"alice@example.com","client_phone":"401-555-0123"}'
```

- Ran the focused portal smoke in the browser:
  - opened `http://127.0.0.1:5175/?app=portal`
  - confirmed the March 21 appointment produced the policy error
  - confirmed the March 23 appointment cancelled successfully
  - queried the portal appointment APIs afterward to confirm the backend state

### Why

- Cancellation is already represented in the current widgets, so this was a cheaper truthful mutation than inventing a new edit or detail surface.
- Wiring cancellation proves the portal’s appointment list and home summary are not only live reads; they now also refetch correctly after a write.
- The 24-hour rule is operationally important and needed to be captured in the shared smoke runbook immediately.

### What worked

- The home card and appointments list both reached the real `POST /api/me/appointments/:id/cancel` route.
- The March 23 appointment (`d22eeb33-e9ed-4731-a28f-9cff4cd7557f`) cancelled successfully and the portal home refetched to show the March 21 appointment as the next one.
- A browser-side check of the backend confirmed the new state:

```json
{
  "upcoming": {
    "data": {
      "appointments": [
        {
          "id": "e0e5eb9e-f883-4192-bdcc-0914664a5ca7",
          "date": "2026-03-21",
          "status": "pending"
        }
      ]
    }
  },
  "past": {
    "data": {
      "appointments": [
        {
          "id": "d22eeb33-e9ed-4731-a28f-9cff4cd7557f",
          "date": "2026-03-23",
          "status": "cancelled",
          "cancel_reason": "Cancelled from client portal"
        }
      ]
    }
  }
}
```

- Typechecking stayed clean:

```bash
npm --prefix web run typecheck
```

### What didn't work

- The first seeded upcoming appointment (`e0e5eb9e-f883-4192-bdcc-0914664a5ca7`) could not be changed because it was within the backend’s 24-hour policy window. The UI surfaced the backend error text:

```text
appointments cannot be changed within 24 hours: appointment policy violation
```

- That failure was expected once the rule was understood, but it initially blocked the “successful cancel” smoke until I seeded a later appointment outside the policy window.

### What I learned

- The portal needs the backend UUID preserved in the view model even when most of the widgets still prefer display-first local shapes.
- Real smoke testing of portal mutations needs seeded data that is outside the backend policy window, otherwise the browser exercise can fail for correct business reasons.
- The playbook should document not only happy paths, but also the expected policy failure messages that prove the backend is enforcing rules correctly.

### What was tricky to build

- The tricky part was keeping the widget surface honest while only one of the two appointment actions is currently real. The symptom was a card that visually invited both cancel and reschedule even though only cancel had an implementation behind it. I addressed that by making `NextAppointmentCard` render action buttons only when handlers are actually passed in, rather than showing a dead reschedule affordance.

### What warrants a second pair of eyes

- Review whether cancelled future appointments should remain in the `past` filter or move to a dedicated cancelled grouping in the product UX. The backend response is correct, but the display policy is still a product decision.
- Review whether the home screen should show a more specific success or toast treatment after cancellation instead of relying only on the refetched card state.

### What should be done in the future

- Wire the remaining Phase 5 mutations:
  - `PATCH /api/me`
  - `PATCH /api/me/appointments/:id`
- Add explicit frontend tests for cancellation success and policy-failure rendering once the test harness exists.
- Keep expanding the smoke playbook as new mutation paths land.

### Code review instructions

- Start with:
  - `web/src/stylist/types.ts`
  - `web/src/stylist/store/api/mappers.ts`
  - `web/src/stylist/pages/PortalHomePage.tsx`
  - `web/src/stylist/pages/PortalAppointmentsPage.tsx`
  - `web/src/stylist/components/NextAppointmentCard.tsx`
- Then review the long-lived runbook update:
  - `docs/smoke-testing-playbook.md`
- Validate with:

```bash
npm --prefix web run typecheck
```

- Then repeat the portal cancel smoke with:
  1. one appointment inside the 24-hour policy window
  2. one appointment outside the policy window
  3. confirmation that the first fails with the expected error
  4. confirmation that the second succeeds and refetches the portal state

### Technical details

- Backend mutation route exercised:
  - `POST /api/me/appointments/:id/cancel`
- Backend IDs used during validation:
  - policy-blocked appointment: `e0e5eb9e-f883-4192-bdcc-0914664a5ca7`
  - successfully cancelled appointment: `d22eeb33-e9ed-4731-a28f-9cff4cd7557f`
- The portal now depends on preserved backend appointment identifiers even for display-oriented widgets.
