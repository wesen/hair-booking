# Tasks

## Ticket And Planning

- [x] Create HAIR-003 for frontend/backend integration
- [x] Write the RTK Query integration guide for the frontend
- [x] Record the investigation diary and migration rationale
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

- [ ] Remove OTP-only sign-in assumptions from `authSlice`
- [ ] Replace `SignInPage` with Keycloak login initiation UI
- [ ] Remove or repurpose `VerifyCodePage`
- [ ] Add a lightweight session bootstrap query for `/api/me`
- [ ] Add authenticated/unauthenticated gating helpers for booking and portal flows
- [ ] Decide what temporary local UI state remains in `authSlice` after OTP removal
- [ ] Add tests for unauthenticated, loading, and authenticated app states

## Phase 3: Public Consultation Flow

- [ ] Replace hard-coded services with `GET /api/services`
- [ ] Keep form-progress state in `consultationSlice`, but move server writes to mutations
- [ ] Implement `POST /api/intake`
- [ ] Implement intake photo uploads with `POST /api/intake/:id/photos`
- [ ] Replace deterministic calendar data with `GET /api/availability`
- [ ] Implement `POST /api/appointments`
- [ ] Update the booking confirmation screen to use real appointment/intake IDs
- [ ] Decide how deposit UI behaves while payments remain out of MVP scope
- [ ] Add tests for successful consult creation and backend-error display

## Phase 4: Portal Reads

- [ ] Replace mocked portal user hydration with `/api/me`
- [ ] Replace mocked appointment list with `GET /api/me/appointments`
- [ ] Replace mocked maintenance plan with `GET /api/me/maintenance-plan`
- [ ] Replace portal appointment detail usage with `GET /api/me/appointments/:id`
- [ ] Build selectors/adapters that preserve current widget prop shapes
- [ ] Remove `portal-data.ts` dependencies from portal read paths
- [ ] Add tests for loading, empty, populated, and error states in portal pages

## Phase 5: Portal Writes

- [ ] Wire `PATCH /api/me`
- [ ] Wire `PATCH /api/me/notification-prefs`
- [ ] Wire `PATCH /api/me/appointments/:id` for rescheduling
- [ ] Wire `POST /api/me/appointments/:id/cancel`
- [ ] Invalidate/refetch RTK Query caches after portal mutations
- [ ] Replace slice-local cancel/toggle reducers with mutation-driven updates
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
- [ ] Smoke test against local Go server + Keycloak + Postgres
- [ ] Verify booking flow end-to-end with real intake, availability, and appointment creation
- [ ] Verify portal flow end-to-end for profile, prefs, appointments, and maintenance
- [x] Update HAIR-003 diary with exact commands and outcomes
- [x] Re-run `docmgr doctor --ticket HAIR-003 --stale-after 30`
