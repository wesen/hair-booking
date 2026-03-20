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
    - Path: web/src/stylist/ClientPortalApp.tsx
      Note: Recorded authenticated portal gate for Phase 2 (commit dd3bcda)
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
    - Path: web/src/stylist/pages/PortalProfilePage.tsx
      Note: Recorded logout wiring against the browser auth session for Phase 2 (commit dd3bcda)
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
    - Path: web/src/stylist/store/api/portalApi.ts
      Note: Recorded portal endpoint definitions for Phase 1 (commit bb46c1b)
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
      Note: Portal mock state that should shrink once server state moves to RTK Query
    - Path: web/src/stylist/store/test-utils.ts
      Note: Recorded test-store wiring through createAppStore for Phase 1 (commit bb46c1b)
ExternalSources: []
Summary: Chronological diary for the frontend integration planning and early implementation work that moves the hair-booking app from mocks to RTK Query-backed backend calls.
LastUpdated: 2026-03-20T03:05:00-04:00
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
