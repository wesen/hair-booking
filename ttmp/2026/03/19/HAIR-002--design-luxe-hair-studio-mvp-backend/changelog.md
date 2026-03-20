# Changelog

## 2026-03-19

- Initial workspace created


## 2026-03-19

Created HAIR-002 backend MVP design bundle, wrote the intern-facing guide and diary, validated the ticket with docmgr doctor, and uploaded the bundle to reMarkable.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/design-doc/01-luxe-hair-studio-mvp-backend-design-guide.md — Primary backend MVP design deliverable
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/index.md — Ticket landing page updated for reviewers
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/reference/01-investigation-diary.md — Chronological investigation and delivery diary

## 2026-03-20

Retargeted HAIR-002 to use the existing Keycloak/OIDC browser flow instead of app-managed OTP, removed `auth_codes` from the backend plan, rewrote the implementation guide, and replaced the ticket checklist with detailed feature slices.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/design-doc/01-luxe-hair-studio-mvp-backend-design-guide.md — Updated backend design to Keycloak-backed auth
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/reference/01-investigation-diary.md — Recorded the auth-direction change and implementation plan reset
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/tasks.md — Replaced generic ticket work with detailed implementation tasks

Implemented the Phase 1 backend foundation slice in commit `105829b`, adding application Postgres wiring, backend runtime config, embedded SQL migrations, startup migration support, and local test coverage.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go — Startup now loads backend settings, opens the application DB, and applies migrations
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/config/backend.go — New backend configuration section and normalization logic
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/postgres.go — Application Postgres connection entrypoint
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations.go — Embedded migration runner
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0001_init.sql — Initial schema without OTP tables
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0002_seed_services.sql — Seeded service catalog for later slices
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docker-compose.local.yml — Added application Postgres service for local development

Implemented the Phase 2 client bootstrap and service catalog slice in commit `8edaa85`, adding OIDC-to-client bootstrap logic, notification preference initialization, a DB-backed `/api/me` response, a DB-backed `/api/services` route, and focused handler/service tests.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/clients/service.go — OIDC client bootstrap service
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/clients/postgres.go — Postgres-backed client bootstrap and preference persistence
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/services/service.go — Public service catalog listing service
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/services/postgres.go — Postgres-backed service catalog queries
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go — DB-backed `/api/me`
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go — DB-backed `/api/services`
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http_test.go — Handler coverage for the new routes

Implemented the Phase 3 public intake slice in commit `f537be4`, adding intake estimate logic, a blob-storage abstraction, local-disk upload support for development, `POST /api/intake`, `POST /api/intake/:id/photos`, and focused service/handler/storage tests.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go — Startup now initializes the configured blob-store backend
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/service.go — Intake validation, estimate calculation, and photo upload orchestration
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/postgres.go — Postgres-backed intake submission and intake photo persistence
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/storage/storage.go — Blob-store interface used by intake and future photo flows
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/storage/local.go — Local-disk upload backend for local development
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go — Public intake and intake-photo handlers
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go — Server wiring for intake service and `/uploads/*` static serving

Implemented the Phase 4 availability and booking slice in commit `a11523d`, adding a reusable appointments domain service, seeded local-development schedule blocks, `GET /api/availability`, `POST /api/appointments`, and tests for availability filtering and booking conflicts.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go — Availability calculation and public booking orchestration
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go — Postgres-backed schedule, service, client, and appointment persistence
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service_test.go — Focused tests for booking conflicts and date-level availability
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0003_seed_schedule.sql — Seeded a default salon schedule for local development
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go — Public availability and booking handlers
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go — Server wiring for the appointments service and new routes
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http_test.go — Handler coverage for availability and appointment creation
