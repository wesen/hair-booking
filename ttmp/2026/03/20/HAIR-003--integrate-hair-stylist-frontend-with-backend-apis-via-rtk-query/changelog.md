# Changelog

## 2026-03-20

Implemented the Phase 3 public consultation slice and committed it as `a49a02a`. The booking flow now creates a real intake, uploads selected photos to that intake, queries live availability, creates a real consult appointment, and surfaces the resulting intake and appointment references on the confirmation screen. The draft form still lives in `consultationSlice`, but server writes now happen through RTK Query mutations.

The deposit behavior remains intentionally local-only for MVP. The frontend still shows the deposit sheet and deposit-paid state, but it does not create a payment backend object. That preserves the UI affordance without inventing a nonexistent payments contract.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PhotosPage.tsx — Added real file selection and pending upload capture
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultEstimatePage.tsx — Added intake creation and photo upload orchestration
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx — Added live availability and appointment creation
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultConfirmPage.tsx — Added real intake and appointment references
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/consultationUploads.ts — Added in-memory pending file storage for selected photos
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/mappers.ts — Added consultation-to-intake mapping and consult-service selection

## 2026-03-20

Implemented the Phase 2 auth and session integration slice and committed it as `dd3bcda`. Replaced the fake login-code flow with a real browser-session bootstrap over `/api/info` and `/api/me`, reduced `authSlice` to payment and deposit UI concerns, and added portal gating so the portal no longer assumes an authenticated user exists. The sign-in and sign-out actions now point at the Keycloak-backed browser flow instead of mutating fake OTP state in Redux.

This slice intentionally stopped short of replacing portal profile data or booking data with live records. The visible auth shell now reflects the real session state, but the deeper portal records are still mock-backed until Phase 4.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/authSlice.ts — Removed OTP-only state and kept only local payment/deposit UI concerns
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/authApi.ts — Added `/api/info` plus `/api/me` session bootstrap helper
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/SignInPage.tsx — Replaced code-entry UI with Keycloak/OIDC login initiation and session-state messaging
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/VerifyCodePage.tsx — Repurposed the legacy verify page as a compatibility stub
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/ClientPortalApp.tsx — Added portal auth gating for loading, unauthenticated, and authenticated states
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalProfilePage.tsx — Wired sign-out to the browser auth logout path

## 2026-03-20

Implemented Phase 1 of the frontend integration plan and committed it as `bb46c1b`. Added the shared RTK Query package under `web/src/stylist/store/api/`, registered the API reducer and middleware in the main store, exported a reusable `createAppStore`, and wired test-store scaffolding through the same store factory. Also encoded the backend DTOs and cache tags up front so later booking and portal slices can consume stable hooks instead of inventing endpoint shapes ad hoc.

Validation for this slice required one environment fix: `npm --prefix web run typecheck` initially failed with `sh: 1: tsc: not found` because the workspace did not have `web/node_modules` installed yet. Running `npm --prefix web ci` fixed that, and the follow-up typecheck passed cleanly.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/index.ts — Store factory plus RTK Query reducer and middleware wiring
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/test-utils.ts — Test-store helper now delegates to the real app store factory
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/base.ts — Shared base query, envelope unwrapping, and cache-tag setup
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/types.ts — Backend DTO definitions for current and upcoming frontend slices
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/mappers.ts — Backend-to-widget mapping helpers
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/bookingApi.ts — Booking endpoint definitions
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/portalApi.ts — Portal endpoint definitions

## 2026-03-20

Created HAIR-003 to track the frontend integration work now that the backend API surface is broad enough to support real testing. Added the RTK Query integration guide, captured the initial diary, and replaced the placeholder ticket checklist with a granular implementation plan.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/index.md — New frontend integration ticket landing page
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/design-doc/01-hair-booking-frontend-integration-guide.md — Primary RTK Query integration guide
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/reference/01-investigation-diary.md — Frontend integration diary
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/tasks.md — Granular frontend integration tasks

## 2026-03-20

- Initial workspace created
