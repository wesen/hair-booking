# Changelog

## 2026-03-20

Implemented the next Phase 5 portal write slice and committed it as `5a4fbf3`. Upcoming portal appointments can now be cancelled through the real `POST /api/me/appointments/:id/cancel` mutation, the home screen refetches when a cancellation succeeds, and the appointment view model now carries the backend UUID needed for mutation routes. I also updated the repo-level smoke playbook with the 24-hour policy failure case and the successful cancel-validation procedure.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalHomePage.tsx — Wired the home-screen cancel action to the real appointment cancel mutation
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalAppointmentsPage.tsx — Wired the appointments-screen cancel action to the real appointment cancel mutation
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/mappers.ts — Preserved backend appointment UUIDs in the view model for mutation usage
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/types.ts — Added the backend appointment identifier to the frontend appointment detail type
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/components/NextAppointmentCard.tsx — Stopped rendering dead reschedule UI when no handler is available
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/smoke-testing-playbook.md — Added the real portal cancel validation flow and the 24-hour policy error signature

## 2026-03-20

Implemented the first Phase 5 portal write slice and committed it as `6876704`. The profile page now reads notification preferences from live `/api/me` data and writes changes through `PATCH /api/me/notification-prefs`, with the updated backend state surviving a page reload. This removes the fake notification-toggle path from `portalSlice` and makes the preference switches the first fully live portal mutation in the React app.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalProfilePage.tsx — Wired the profile preference switches to the real notification-preference mutation
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/portalView.ts — Exposed live notification-pref view data from `/api/me`
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/mappers.ts — Stopped forcing a fake marketing row into the live notification-pref mapping
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/portalSlice.ts — Removed notification-pref ownership from the portal slice

## 2026-03-20

Implemented the Phase 4 portal read slice and committed it as `f546c57`. The portal home, appointments, and profile screens now read live backend data through RTK Query-backed view hooks instead of pulling canonical records from `portalSlice`. The authenticated portal now greets the real signed-in client, shows real appointment history, and shows real profile contact data from `/api/me`. Rewards and photos remain on their mock-backed path for now, and the standalone appointment-detail endpoint remains unused because the current widget set does not expose a separate detail screen yet.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/portalView.ts — Added query-backed portal view hooks for profile, home, appointments, and maintenance
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalHomePage.tsx — Switched home summary to live profile, appointment, and maintenance data
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalAppointmentsPage.tsx — Switched appointment lists to live backend reads
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalProfilePage.tsx — Switched profile identity fields to live `/api/me` data
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/ClientPortalApp.tsx — Stopped deriving portal initials from mock slice data
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/portalSlice.ts — Reduced portal slice responsibilities by dropping mock appointment and maintenance state

## 2026-03-20

Ran a real smoke test against local Postgres, Keycloak, the Go backend, and the Vite-hosted React app. Added a dev harness for exposing the booking and portal apps under Vite, added ticket-local scripts for stack startup, DB inspection, and Playwright replay, fixed the defects the smoke pass exposed, and wrote a repo-level playbook in `docs/smoke-testing-playbook.md` so the smoke procedure can keep evolving beyond this ticket. The browser booking flow now completes end to end and persists matching DB rows, while portal auth now succeeds even though the main portal body is still mock-backed pending Phase 4.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/postgres.go — Fixed nullable intake scan handling surfaced by the browser booking flow
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/clients/postgres.go — Fixed nullable authenticated-client scan handling and linked guest bookings to OIDC identities by email
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/servicesApi.ts — Fixed `GET /api/services` response normalization for the calendar step
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/main.tsx — Added query-param app switching for Vite smoke testing
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/vite.config.ts — Added local proxying for `/api`, `/auth`, and `/uploads`
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/smoke-testing-playbook.md — Long-lived intern-facing smoke test runbook to keep updating over time
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/start_local_smoke_stack.sh — Reproducible tmux-based stack startup
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh — Postgres inspection for latest booking artifacts
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/playwright_smoke_flow.mjs — Replayable browser smoke sequence

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
