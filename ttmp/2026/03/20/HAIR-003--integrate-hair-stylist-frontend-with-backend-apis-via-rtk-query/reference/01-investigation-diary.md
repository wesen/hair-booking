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
    - Path: web/src/stylist/data/portal-data.ts
      Note: Mock portal fixtures that currently block realistic backend testing
    - Path: web/src/stylist/store/api/base.ts
      Note: Recorded shared fetchBaseQuery envelope normalization and tag setup for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/api/bookingApi.ts
      Note: Recorded booking endpoint definitions for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/api/mappers.ts
      Note: Recorded backend-to-widget mapping helpers for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/api/portalApi.ts
      Note: Recorded portal endpoint definitions for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/api/types.ts
      Note: Recorded backend DTO definitions for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/authSlice.ts
      Note: Current OTP-shaped auth state that must be retired or reduced
    - Path: web/src/stylist/store/consultationSlice.ts
      Note: Booking draft state that should remain client-owned
    - Path: web/src/stylist/store/index.ts
      Note: |-
        Current Redux store wiring that will host RTK Query reducer and middleware
        Recorded RTK Query reducer and middleware wiring for Phase 1 (commit bb46c1b)
    - Path: web/src/stylist/store/portalSlice.ts
      Note: Portal mock state that should shrink once server state moves to RTK Query
    - Path: web/src/stylist/store/test-utils.ts
      Note: Recorded test-store wiring through createAppStore for Phase 1 (commit bb46c1b)
ExternalSources: []
Summary: Chronological diary for the frontend integration planning and Phase 1 implementation work that moves the hair-booking app from mocks to RTK Query-backed backend calls.
LastUpdated: 2026-03-20T01:15:00-04:00
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
