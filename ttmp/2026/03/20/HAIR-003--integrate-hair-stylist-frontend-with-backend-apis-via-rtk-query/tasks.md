# Tasks

## Ticket And Planning

- [x] Create HAIR-003 for frontend/backend integration
- [x] Write the RTK Query integration guide for the frontend
- [x] Record the investigation diary and migration rationale
- [x] Write a repo-level smoke testing playbook in `docs/`
- [ ] Keep `docs/smoke-testing-playbook.md` updated as smoke knowledge changes
- [ ] Keep the ticket changelog and diary updated for each completed implementation slice

## Phase 1: RTK Query Foundation

- [x] Create a shared API module under `web/src/stylist/store/api/`
- [x] Add a `fetchBaseQuery` wrapper that sends credentials and normalizes JSON envelopes
- [x] Register the API reducer and middleware in `web/src/stylist/store/index.ts`
- [x] Add shared frontend DTO types for backend payloads
- [x] Add shared mapping helpers from backend DTOs to current widget-friendly shapes
- [x] Add tag strategy for `Me`, `Services`, `Availability`, `Appointments`, `Maintenance`, and `Photos`
- [x] Add test scaffolding for store + RTK Query provider wiring

## Phase 2: Auth And Session Integration

- [x] Remove OTP-only sign-in assumptions from `authSlice`
- [x] Replace `SignInPage` with Keycloak login initiation UI
- [x] Remove or repurpose `VerifyCodePage`
- [x] Add a lightweight session bootstrap query for `/api/me`
- [x] Add authenticated/unauthenticated gating helpers for booking and portal flows
- [x] Decide what temporary local UI state remains in `authSlice` after OTP removal
- [ ] Add tests for unauthenticated, loading, and authenticated app states

## Phase 3: Public Consultation Flow

- [x] Replace hard-coded services with `GET /api/services`
- [x] Keep form-progress state in `consultationSlice`, but move server writes to mutations
- [x] Implement `POST /api/intake`
- [x] Implement intake photo uploads with `POST /api/intake/:id/photos`
- [x] Replace deterministic calendar data with `GET /api/availability`
- [x] Implement `POST /api/appointments`
- [x] Update the booking confirmation screen to use real appointment/intake IDs
- [x] Decide how deposit UI behaves while payments remain out of MVP scope
- [ ] Add tests for successful consult creation and backend-error display

## Phase 4: Portal Reads

- [x] Replace mocked portal user hydration with `/api/me`
- [x] Replace mocked appointment list with `GET /api/me/appointments`
- [x] Replace mocked maintenance plan with `GET /api/me/maintenance-plan`
- [ ] Replace portal appointment detail usage with `GET /api/me/appointments/:id`
- [x] Build selectors/adapters that preserve current widget prop shapes
- [x] Remove `portal-data.ts` dependencies from portal read paths
- [x] Record that the current widget set has no standalone appointment detail screen yet, so `GET /api/me/appointments/:id` remains available but unused
- [ ] Add tests for loading, empty, populated, and error states in portal pages

## Phase 5: Portal Writes

- [ ] Wire `PATCH /api/me`
- [x] Wire `PATCH /api/me/notification-prefs`
- [ ] Wire `PATCH /api/me/appointments/:id` for rescheduling
- [x] Wire `POST /api/me/appointments/:id/cancel`
- [x] Invalidate/refetch RTK Query caches after portal mutations
- [x] Replace slice-local cancel/toggle reducers with mutation-driven updates
- [x] Replace the slice-local notification toggle path with a mutation-driven profile preference update
- [ ] Add tests for optimistic or refetch-based portal write flows

## Phase 6: Portal Photos

- [ ] Design frontend DTOs for appointment photo timeline entries
- [ ] Wire `GET /api/me/photos` when the backend photo timeline route lands
- [ ] Wire `POST /api/me/photos` when the backend upload route lands
- [ ] Replace `MOCK_PHOTOS` usage in the portal
- [ ] Add empty-state and upload-state handling for portal photos
- [ ] Add tests for photo timeline rendering and upload flows

## Phase 7: Mock And Slice Cleanup

- [ ] Remove deterministic `CALENDAR_DATA` usage from production paths
- [ ] Remove `portal-data.ts` usage from production portal paths
- [ ] Remove OTP-specific `authSlice` fields/actions that are no longer used
- [ ] Reduce `portalSlice` to UI-only concerns that RTK Query should not own
- [ ] Reduce `consultationSlice` to local draft/progress state only
- [ ] Document what mock data remains for Storybook-only use
- [ ] Normalize appointment status strings between backend and frontend display components

## Phase 8: Validation

- [x] Run `npm --prefix web run typecheck`
- [ ] Run frontend tests once the integration test harness is in place
- [x] Smoke test against local Go server + Keycloak + Postgres
- [x] Verify booking flow end-to-end with real intake, availability, and appointment creation
- [x] Verify portal flow end-to-end for profile, prefs, appointments, and maintenance
- [x] Update HAIR-003 diary with exact commands and outcomes
- [x] Re-run `docmgr doctor --ticket HAIR-003 --stale-after 30`
