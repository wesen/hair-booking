# Tasks

## Ticket And Plan

- [x] Rewrite HAIR-002 to use Keycloak/OIDC instead of app-managed OTP
- [x] Replace the ticket with detailed implementation slices
- [ ] Update the ticket changelog and diary for each completed implementation slice

## Phase 1: Foundation

- [x] Add an application Postgres service to `docker-compose.local.yml`
- [x] Add backend config for database URL, storage mode, local upload dir, and public base URL
- [x] Add a Postgres connection package
- [x] Add embedded SQL migrations without `auth_codes`
- [x] Add a migration runner or startup migration path
- [x] Wire the server startup to initialize the database layer
- [x] Add tests for backend config loading and DB bootstrap helpers

## Phase 2: Services Catalog And Client Bootstrap

- [x] Add schema tables and seed data for `services`
- [x] Add schema support for `clients` linked to OIDC subject/issuer
- [x] Implement client bootstrap from OIDC claims on authenticated requests
- [x] Replace the current `/api/me` placeholder with DB-backed client + notification prefs payload
- [x] Add `GET /api/services`
- [x] Add tests for service catalog queries and OIDC client bootstrap

## Phase 3: Public Intake

- [x] Add schema tables for `intake_submissions` and `intake_photos`
- [x] Implement estimate calculation service
- [x] Implement `POST /api/intake`
- [x] Implement upload storage abstraction
- [x] Implement local-disk upload backend for development
- [x] Implement `POST /api/intake/:id/photos`
- [x] Add tests for intake validation, estimate rules, and upload metadata writes

## Phase 4: Availability And Booking

- [x] Add schema tables for `appointments`, `schedule_blocks`, and `schedule_overrides`
- [x] Implement availability calculation from schedule, overrides, and bookings
- [x] Implement `GET /api/availability`
- [x] Implement `POST /api/appointments`
- [x] Snapshot service duration into appointments
- [x] Add booking conflict tests and month-availability tests

## Phase 5: Portal Profile And Preferences

- [x] Add schema support for `notification_prefs`
- [x] Implement `PATCH /api/me`
- [x] Implement `PATCH /api/me/notification-prefs`
- [x] Normalize frontend/backend notification key naming
- [x] Add tests for profile edits and notification preference updates

## Phase 6: Portal Appointments And Maintenance

- [ ] Add schema tables for `maintenance_plans` and `maintenance_items`
- [ ] Implement `GET /api/me/appointments`
- [ ] Implement `GET /api/me/appointments/:id`
- [ ] Implement `PATCH /api/me/appointments/:id`
- [ ] Implement `POST /api/me/appointments/:id/cancel`
- [ ] Implement `GET /api/me/maintenance-plan`
- [ ] Add tests for portal appointment filtering, reschedule policy, cancel policy, and maintenance plan reads

## Phase 7: Portal Photos

- [ ] Add schema table for `appointment_photos`
- [ ] Implement `GET /api/me/photos`
- [ ] Implement `POST /api/me/photos`
- [ ] Add tests for photo timeline queries and appointment photo uploads

## Phase 8: Frontend Integration Cleanup

- [ ] Replace OTP sign-in pages with Keycloak login initiation
- [ ] Remove Redux-only login-code state
- [ ] Replace deterministic calendar data with backend availability calls
- [ ] Replace portal mock hydration with real API calls
- [ ] Hide or remove rewards and deposit UI from the MVP shell
- [ ] Normalize appointment status strings between frontend and backend

## Phase 9: Final Validation

- [ ] Run `go test ./...`
- [ ] Perform local smoke testing against Keycloak + Postgres
- [ ] Update HAIR-002 diary with exact commands and results
- [ ] Update HAIR-002 changelog with completed slices
- [ ] Re-run `docmgr doctor --ticket HAIR-002 --stale-after 30`
