---
Title: Investigation Diary
Ticket: HAIR-002
Status: active
Topics:
    - backend
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: cmd/hair-booking/cmds/serve.go
      Note: |-
        Recorded startup DB initialization in the implementation diary
        Recorded local blob-store initialization for Phase 3 (commit f537be4)
    - Path: docker-compose.local.yml
      Note: Recorded the new local application Postgres service
    - Path: pkg/appointments/postgres.go
      Note: |-
        Recorded availability and booking persistence in the diary
        Recorded appointment persistence and client lookup for Phase 4 (commit a11523d)
    - Path: pkg/appointments/service.go
      Note: |-
        Recorded availability calculation and public booking orchestration in the diary
        Recorded availability calculation and public booking orchestration for Phase 4 (commit a11523d)
    - Path: pkg/auth/oidc.go
      Note: Existing Keycloak/OIDC flow that now anchors the backend auth direction
    - Path: pkg/clients/service.go
      Note: Recorded the OIDC client bootstrap slice in the diary
    - Path: pkg/config/backend.go
      Note: Recorded the new backend configuration surface in the implementation diary
    - Path: pkg/db/migrations.go
      Note: Recorded the migration bootstrap slice in the implementation diary
    - Path: pkg/db/migrations/0003_seed_schedule.sql
      Note: |-
        Recorded seeded schedule blocks for local development in the diary
        Recorded seeded weekly schedule for Phase 4 (commit a11523d)
    - Path: pkg/intake/postgres.go
      Note: |-
        Recorded intake submission and intake photo persistence in the diary
        Recorded intake persistence for Phase 3 (commit f537be4)
    - Path: pkg/intake/service.go
      Note: |-
        Recorded intake estimate and upload orchestration in the diary
        Recorded intake validation and estimate logic for Phase 3 (commit f537be4)
    - Path: pkg/server/handlers_me.go
      Note: Recorded the DB-backed /api/me handler in the diary
    - Path: pkg/server/handlers_public.go
      Note: |-
        Recorded the DB-backed public service and intake handlers in the diary
        Recorded intake route handlers for Phase 3 (commit f537be4)
        Recorded availability and appointment handlers for Phase 4 (commit a11523d)
    - Path: pkg/server/http.go
      Note: |-
        Recorded backend route and upload static-serving wiring in the diary
        Recorded intake route and uploads static wiring for Phase 3 (commit f537be4)
        Recorded appointments service wiring for Phase 4 (commit a11523d)
    - Path: pkg/services/service.go
      Note: Recorded the public service catalog slice in the diary
    - Path: pkg/storage/local.go
      Note: |-
        Recorded the local upload storage backend in the diary
        Recorded local upload backend for Phase 3 (commit f537be4)
    - Path: pkg/storage/storage.go
      Note: |-
        Recorded the blob-storage abstraction in the diary
        Recorded blob-store seam for Phase 3 (commit f537be4)
    - Path: ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/design-doc/01-luxe-hair-studio-mvp-backend-design-guide.md
      Note: Primary design deliverable tracked by this diary
    - Path: web/src/stylist/data/consultation-constants.ts
      Note: Booking and intake field definitions
    - Path: web/src/stylist/data/portal-data.ts
      Note: Mock portal records that the backend must replace
    - Path: web/src/stylist/pages/SignInPage.tsx
      Note: OTP-oriented UI that now needs to be replaced
    - Path: web/src/stylist/pages/VerifyCodePage.tsx
      Note: OTP-oriented UI that now needs to be removed
ExternalSources: []
Summary: Chronological diary for the HAIR-002 backend MVP design and implementation work.
LastUpdated: 2026-03-19T23:17:11-04:00
WhatFor: Use this diary to understand why the backend plan changed and what implementation slices were executed.
WhenToUse: Use when reviewing or continuing HAIR-002.
---





# Investigation Diary

## Goal

This diary records how the Luxe Hair Studio MVP backend plan was derived, how the authentication direction changed from app-managed OTP to Keycloak/OIDC, and how the implementation work is being executed in small committed slices.

## Step 1: Create The Ticket And Capture The Original MVP Design

I started by creating a dedicated backend ticket because the repo already had separate frontend-port and Keycloak-bootstrap tickets. The original design pass focused on translating the user’s schema-and-route sketch into an intern-facing implementation guide backed by repository evidence.

At that point, the imported frontend widgets strongly suggested a passwordless login flow because the UI still contained sign-in and verify-code pages. I recorded that state accurately, but it was still a plan, not code.

### Prompt Context

**User prompt (verbatim):** "Create a new docmgr to create the proper backend for the hair stylist app.

We just imported a huge react storybook for widgets for our hair styling app, and we want to design the backend for an MVP. Keep a diary as you workd.

Here's a sketch for the routes for the features we want: # Luxe Hair Studio — MVP Schema & API (trimmed)

---

## Database Schema

```yaml
# ─────────────────────────────────────────
# PostgreSQL · timestamps UTC · UUIDs for PKs
# ─────────────────────────────────────────

clients:
  id:                 uuid PK
  name:               text NOT NULL
  email:              text UNIQUE
  phone:              text UNIQUE
  scalp_notes:        text
  service_summary:    text
  created_at:         timestamptz
  updated_at:         timestamptz
  # CHECK (email IS NOT NULL OR phone IS NOT NULL)

auth_codes:
  id:                 uuid PK
  client_id:          uuid FK → clients
  identifier:         text NOT NULL        # email or phone
  code:               text NOT NULL        # hashed
  expires_at:         timestamptz NOT NULL
  used_at:            timestamptz

sessions:
  id:                 uuid PK
  client_id:          uuid FK → clients NOT NULL
  token:              text UNIQUE NOT NULL
  expires_at:         timestamptz NOT NULL

services:
  id:                 uuid PK
  name:               text NOT NULL
  category:           text NOT NULL        # extensions | color | treatment | consult
  duration_min:       int NOT NULL
  price_low:          int
  price_high:         int
  is_active:          bool default true
  sort_order:         int

intake_submissions:
  id:                 uuid PK
  client_id:          uuid FK → clients
  service_type:       text NOT NULL        # extensions | color | both
  hair_length:        text
  hair_density:       text
  hair_texture:       text
  prev_extensions:    text
  color_service:      text
  natural_level:      text
  current_color:      text
  chemical_history:   text[]
  last_chemical:      text
  desired_length:     int
  ext_type:           text
  budget:             text
  maintenance:        text
  deadline:           text
  dream_result:       text
  estimate_low:       int
  estimate_high:      int
  created_at:         timestamptz

intake_photos:
  id:                 uuid PK
  intake_id:          uuid FK → intake_submissions NOT NULL
  slot:               text NOT NULL        # front | back | hairline | inspo
  storage_key:        text NOT NULL
  url:                text NOT NULL

appointments:
  id:                 uuid PK
  client_id:          uuid FK → clients NOT NULL
  service_id:         uuid FK → services NOT NULL
  intake_id:          uuid FK → intake_submissions
  date:               date NOT NULL
  start_time:         time NOT NULL
  status:             text NOT NULL default 'pending'
                      # pending | confirmed | completed | cancelled | no_show
  stylist_notes:      text
  prep_notes:         text
  cancelled_at:       timestamptz
  cancel_reason:      text
  created_at:         timestamptz
  updated_at:         timestamptz

appointment_photos:
  id:                 uuid PK
  appointment_id:     uuid FK → appointments NOT NULL
  slot:               text NOT NULL        # before | after
  storage_key:        text NOT NULL
  url:                text NOT NULL
  caption:            text

maintenance_plans:
  id:                 uuid PK
  client_id:          uuid FK → clients NOT NULL

maintenance_items:
  id:                 uuid PK
  plan_id:            uuid FK → maintenance_plans NOT NULL
  service_id:         uuid FK → services NOT NULL
  due_date:           date NOT NULL
  status:             text NOT NULL default 'upcoming'
                      # done | next | upcoming | overdue
  appointment_id:     uuid FK → appointments
  sort_order:         int

notification_prefs:
  client_id:          uuid PK FK → clients
  remind_48hr:        bool default true
  remind_2hr:         bool default true
  maint_alerts:       bool default true

schedule_blocks:
  id:                 uuid PK
  day_of_week:        int NOT NULL         # 0-6
  start_time:         time NOT NULL
  end_time:           time NOT NULL
  is_available:       bool default true

schedule_overrides:
  id:                 uuid PK
  date:               date NOT NULL UNIQUE
  is_blocked:         bool default true
  start_time:         time
  end_time:           time
```

...

We want to design out which routes and schema and use postgres and do local development."

**Assistant interpretation:** Create a backend design ticket, write a detailed implementation guide, keep a diary, and deliver the bundle through docmgr and reMarkable.

**Inferred user intent:** Get an implementation-ready backend plan instead of a vague architecture discussion.

**Commit (code):** N/A

### What I did
- Created the `HAIR-002` ticket.
- Wrote the initial design guide and diary.
- Related the shaping repo files.
- Validated the ticket and uploaded it to reMarkable.

### Why
- The codebase needed a documented backend direction before implementation work could start safely.

### What worked
- The current server and frontend state were easy to map.
- The ticket pipeline and reMarkable upload flow worked cleanly.

### What didn't work
- The first design assumed app-managed OTP because the imported frontend still used that flow. That assumption became obsolete once the user clarified they wanted Keycloak username/password login instead.

### What I learned
- The frontend auth widgets are not a reliable source of truth for product direction. The user’s clarification and the already-existing Keycloak bootstrap are more authoritative.

### What was tricky to build
- The initial difficulty was separating visible mock UI from actual MVP scope. That issue surfaced again when the auth direction changed.

### What warrants a second pair of eyes
- Whether the app should keep any app-managed session table once Keycloak is the sole auth flow.

### What should be done in the future
- Realign the ticket to Keycloak/OIDC and then begin implementation from the DB foundation upward.

### Code review instructions
- Review the original HAIR-002 doc only as historical context; it should no longer be treated as the final auth plan.

### Technical details
- Initial ticket creation and upload were performed successfully in the previous turn.

## Step 2: Retarget The Backend Plan To Keycloak/OIDC

The user then clarified the authentication direction: drop login codes and use standard login/password/OIDC through Keycloak. That changed the schema and the execution plan materially. The backend no longer needs `auth_codes`, and it should not grow a parallel app-managed auth subsystem when `pkg/auth/oidc.go` already provides the browser login flow.

I responded by rewriting the HAIR-002 design guide so it now treats Keycloak-backed browser auth as the only authentication mechanism for MVP. I also replaced the ticket task list with concrete implementation slices that can be worked and committed one by one.

### Prompt Context

**User prompt (verbatim):** "nah, let's drop the login code and just do standard login/pw/oidc through keycloak. remove auth_codes table.

Update the plan, then create detailed tasks for the all the different features. and then work the tasks one by one, committing at appropriate intervals, keeping a diary as you go"

**Assistant interpretation:** Rewrite the backend plan around the existing Keycloak/OIDC flow, create a detailed executable checklist, and begin implementing it in committed slices while updating the diary.

**Inferred user intent:** Stop designing around speculative OTP work and instead converge the backend on the auth system already present in the repo.

**Commit (code):** Pending

### What I did
- Updated the implementation plan to make Keycloak/OIDC the sole auth direction.
- Removed OTP assumptions from the design guide.
- Replaced the HAIR-002 task list with detailed phase-by-phase implementation tasks.
- Prepared to start the first code slice: DB plumbing and migration scaffolding.

### Why
- Adding app-managed OTP now would duplicate existing auth capability and distract from the actual missing backend work.

### What worked
- The existing `pkg/auth/oidc.go` code made the new direction straightforward and defensible.
- The existing `/api/me` handler already provides a natural authenticated entrypoint to build on.

### What didn't work
- The earlier design doc needed a full rewrite rather than a small patch because too many later sections depended on OTP assumptions.

### What I learned
- The right source of truth for auth in this repo is the Keycloak bootstrap work, not the imported mock login pages.

### What was tricky to build
- The sharp edge here was consistency. Once the login direction changed, leaving even a few OTP-oriented sections in the guide would have made the implementation plan internally contradictory.

### What warrants a second pair of eyes
- Whether application-side `sessions` should also be dropped from the domain schema entirely. The current implementation plan assumes yes, because the signed OIDC session cookie already covers browser auth.

### What should be done in the future
- Execute the code tasks in order, starting with application Postgres, migrations, and server wiring.

### Code review instructions
- Review the updated design guide before looking at code changes.
- Check that every planned feature slice now assumes Keycloak-authenticated browser sessions instead of login-code routes.

### Technical details
- Primary files touched in this step:
  - `ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/design-doc/01-luxe-hair-studio-mvp-backend-design-guide.md`
  - `ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/reference/01-investigation-diary.md`
  - `ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/tasks.md`

## Step 3: Implement The Backend Foundation Slice

With the ticket reset complete, I started at the bottom of the stack. The first code slice added the application database runtime without trying to mix in booking or portal behavior yet. That kept the change set narrow: local Postgres service, backend settings, DB bootstrap, embedded migrations, startup migration support, and a small amount of server wiring so future handlers have a place to plug into.

This slice intentionally stopped short of adding feature routes. The goal was to create a clean platform for later work, not to rush partial business logic into the server before the persistence layer existed.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Start working through the detailed tasks in order and commit each coherent implementation slice.

**Inferred user intent:** See real backend progress immediately after the plan change, beginning with the infrastructure all later features depend on.

**Commit (code):** `105829b` — `feat: add backend postgres foundation`

### What I did
- Added an application Postgres service to `docker-compose.local.yml`.
- Added `pkg/config/backend.go` with a Glazed config section for database and storage settings.
- Added `pkg/db/postgres.go` to open and manage the application pool.
- Added `pkg/db/migrations.go` plus embedded SQL migrations.
- Added `0001_init.sql` without `auth_codes` or app-side `sessions`.
- Added `0002_seed_services.sql` with an initial service catalog.
- Updated `cmd/hair-booking/cmds/serve.go` to load backend settings, open the DB, and auto-migrate on startup.
- Updated `pkg/server/http.go` so the server now knows whether a DB is configured.
- Added tests for backend config normalization and migration discovery.

### Why
- Every later feature in the ticket depends on Postgres schema and runtime configuration.
- This slice creates a testable, reviewable foundation while preserving the current Keycloak login behavior.

### What worked
- `gofmt` completed cleanly.
- `go mod tidy` completed cleanly.
- `go test ./...` passed after the foundation files were added.
- The startup path can now open the application DB and apply migrations when `HAIR_BOOKING_DATABASE_URL` is configured.

### What didn't work
- No blocking implementation errors occurred in this slice.
- One review caveat remains: because the worktree already contained broader repo changes outside HAIR-002, I staged only the files directly related to the backend foundation slice.

### What I learned
- The current server structure is small enough that startup DB initialization fits naturally into `serve.go` without a separate bootstrap layer.
- Embedded SQL migrations are sufficient for the MVP and avoid adding another migration tool before the schema has stabilized.

### What was tricky to build
- The main sharp edge was deciding how much schema to include in the initial migrations. I chose to add the full core schema without OTP tables so later slices can focus on route logic instead of repeatedly rewriting foundational SQL.

### What warrants a second pair of eyes
- Whether the app should auto-migrate on startup by default in all environments or only in local development.
- Whether the initial service seed rows belong in SQL or should move to a dedicated seeding path once admin workflows exist.

### What should be done in the future
- Build the next slice on top of this foundation: real `clients` bootstrap from OIDC claims, `notification_prefs`, `GET /api/me`, and `GET /api/services`.

### Code review instructions
- Start with `pkg/config/backend.go`, `pkg/db/postgres.go`, and `pkg/db/migrations.go`.
- Then review `0001_init.sql` and `0002_seed_services.sql`.
- Finally inspect `cmd/hair-booking/cmds/serve.go` and `pkg/server/http.go` to confirm runtime wiring.
- Re-run:

```bash
go test ./...
```

### Technical details
- Commands run:

```bash
gofmt -w cmd/hair-booking/cmds/serve.go pkg/config/backend.go pkg/config/backend_test.go pkg/db/postgres.go pkg/db/migrations.go pkg/db/migrations_test.go pkg/server/http.go
go mod tidy
go test ./...
git commit -m "feat: add backend postgres foundation"
```

## Step 4: Implement Client Bootstrap And The First DB-Backed Read Routes

After the foundation was in place, I moved to the smallest domain slice that proves the backend is real: link authenticated Keycloak users to local `clients` rows and expose the first DB-backed read APIs. That slice delivered two routes with actual application meaning: `/api/me` and `/api/services`.

The design choice here was to treat OIDC claims as the source of truth for authentication and the `clients` table as the source of truth for salon profile state. The app now has a dedicated client-bootstrap service that finds or creates a client row from OIDC claims and ensures the corresponding `notification_prefs` row exists.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Continue the feature-by-feature implementation after the DB foundation commit.

**Inferred user intent:** See the first real DB-backed domain routes built on top of Keycloak auth rather than more infrastructure-only work.

**Commit (code):** `8edaa85` — `feat: bootstrap clients from oidc claims`

### What I did
- Added `pkg/clients/service.go` with authenticated client bootstrap logic.
- Added `pkg/clients/postgres.go` for loading, creating, and updating clients plus initializing notification prefs.
- Added `pkg/services/service.go` and `pkg/services/postgres.go` for public service catalog queries.
- Added `pkg/server/handlers_me.go` for DB-backed `/api/me`.
- Added `pkg/server/handlers_public.go` for DB-backed `/api/services`.
- Updated `pkg/server/http.go` to inject and auto-wire client and catalog services from the application database.
- Added unit and handler tests for client bootstrap and service catalog behavior.

### Why
- `/api/me` is the natural bridge between Keycloak-authenticated browser sessions and the salon domain.
- `/api/services` gives the frontend a real catalog source and proves the migration seed data is usable.

### What worked
- The route split into `handlers_me.go` and `handlers_public.go` kept the server package clearer than expanding `http.go` further.
- The repository/service layering stayed small and testable.
- `go test ./...` passed after the test expectations were updated to match the new `/api/me` contract.

### What didn't work
- I hit two quick compile/test issues while wiring the new handlers:
  - missing `time` import in `pkg/server/handlers_me.go`
  - missing `context` import plus stale `/api/me` assertions in `pkg/server/http_test.go`
- Both were resolved in-place before the slice was committed.

### What I learned
- The existing signed session cookie is enough for browser authentication; the app really did not need a second session or OTP subsystem.
- Bootstrapping notification preferences at the same time as client creation keeps portal reads simpler later.

### What was tricky to build
- The main subtlety was deciding what `/api/me` should return now that it is no longer a thin auth debug endpoint. I changed it from raw auth claims to a domain payload containing `client` and `notification_prefs`, while still deriving that data from the authenticated Keycloak session.

### What warrants a second pair of eyes
- Whether `UpdateAuthenticatedClient` should always overwrite `name` from OIDC claims or preserve local stylist/client edits later.
- Whether `/api/services` should remain under `/api/` or also be mirrored under a public non-API path for compatibility with the earlier route sketch.

### What should be done in the future
- Move on to Phase 3: intake submission, estimate rules, upload storage abstraction, and intake photo metadata.

### Code review instructions
- Start with `pkg/clients/service.go` and `pkg/clients/postgres.go`.
- Then read `pkg/server/handlers_me.go` and `pkg/server/handlers_public.go`.
- Confirm the server wiring in `pkg/server/http.go`.
- Re-run:

```bash
go test ./...
```

### Technical details
- Commands run:

```bash
gofmt -w pkg/clients/service.go pkg/clients/postgres.go pkg/clients/service_test.go pkg/services/service.go pkg/services/postgres.go pkg/services/service_test.go pkg/server/handlers_me.go pkg/server/handlers_public.go pkg/server/http.go pkg/server/http_test.go
go test ./...
git commit -m "feat: bootstrap clients from oidc claims"
```

## Step 5: Implement Public Intake Submission And Local Photo Uploads

With authenticated client bootstrap in place, the next missing frontend dependency was the public intake funnel. This slice adds the first write-heavy workflow in the backend: create an intake submission, compute an estimate range, accept intake photos, and persist both metadata and uploaded files using a storage abstraction that stays local in development.

I kept the storage layer deliberately small. The MVP only needs a clear seam between domain logic and where bytes land. That lets the repo use local-disk uploads now while leaving a straightforward path to S3 later without pushing that complexity into the intake service or HTTP handlers.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Continue the implementation slices by adding the public intake workflow and the upload path it depends on.

**Inferred user intent:** Replace more frontend mock behavior with real backend APIs, but keep the implementation practical for local development.

**Commit (code):** `f537be4` — `feat: add intake submissions and photo uploads`

### What I did
- Added `pkg/storage/storage.go` with a minimal blob-store interface.
- Added `pkg/storage/local.go` and `pkg/storage/local_test.go` for local-disk upload persistence and URL generation.
- Added `pkg/intake/service.go` with intake validation, estimate calculation, filename sanitization, and photo upload orchestration.
- Added `pkg/intake/postgres.go` for `intake_submissions` and `intake_photos` persistence.
- Updated `cmd/hair-booking/cmds/serve.go` to initialize the local blob store from backend config.
- Updated `pkg/server/http.go` to auto-wire the intake service, register public intake routes, and expose `/uploads/*` from the local uploads directory in development.
- Updated `pkg/server/handlers_public.go` to implement `POST /api/intake` and `POST /api/intake/{id}/photos`.
- Added focused service and handler tests in `pkg/intake/service_test.go`, `pkg/storage/local_test.go`, and `pkg/server/http_test.go`.

### Why
- The intake funnel is one of the main conversion paths in the imported stylist frontend, so it needed a real backend before availability and booking work could be meaningfully integrated.
- A blob-store interface prevents local-file decisions from leaking through the rest of the codebase.

### What worked
- The separation between storage, intake domain logic, and HTTP handlers stayed small and testable.
- The route contracts match the earlier backend plan closely enough that the frontend can adopt them without schema churn.
- `go test ./...` passed once the half-wired server/storage glue was cleaned up.

### What didn't work
- The slice was left in a half-wired state before this turn finished: `pkg/server/http.go` referenced `options.Storage` before the field existed on `ServerOptions`, `pkg/server/handlers_public.go` had a duplicate `net/http` import, and both `pkg/server/http_test.go` and `pkg/intake/service_test.go` referenced `io.Reader` without importing `io`.
- I resumed by fixing those issues, running `gofmt`, and then rerunning:

```bash
go test ./...
```

### What I learned
- Treating uploads as a storage concern instead of an HTTP concern makes the domain service easier to reuse later for authenticated appointment-photo flows.
- The estimate rules can stay simple and explicit for MVP; they do not need a rule engine yet.

### What was tricky to build
- The subtle part was not the SQL or file writing. It was getting the runtime wiring right so the intake service only auto-initializes when both the Postgres pool and blob store exist. That constraint lives in `pkg/server/http.go`, and missing part of it caused the first compile breakage in this slice.

### What warrants a second pair of eyes
- Whether intake photo URLs should remain directly public under `/uploads/*` for MVP or move behind signed/proxied access later.
- Whether the current estimate heuristics are acceptable as a frontend-facing range or should be presented as softer copy before booking is implemented.

### What should be done in the future
- Move on to Phase 4: availability calculation, booking creation, and schedule/override handling.

### Code review instructions
- Start with `pkg/intake/service.go` and `pkg/intake/postgres.go`.
- Then review `pkg/storage/local.go`.
- Finally read `pkg/server/handlers_public.go` and `pkg/server/http.go` to confirm the route and runtime wiring.
- Re-run:

```bash
go test ./...
```

### Technical details
- Commands run:

```bash
gofmt -w cmd/hair-booking/cmds/serve.go pkg/server/http.go pkg/server/handlers_public.go pkg/server/http_test.go pkg/intake/service.go pkg/intake/postgres.go pkg/intake/service_test.go pkg/storage/storage.go pkg/storage/local.go pkg/storage/local_test.go
go test ./...
git commit -m "feat: add intake submissions and photo uploads"
```

## Step 6: Implement Availability Calculation And Public Appointment Booking

After intake submissions were working, the next missing backbone for the MVP was actual scheduling. This slice adds the first appointment-domain package in the repo and uses it for two public endpoints: a month-level availability calendar and appointment creation that validates the requested slot before persisting anything.

I kept the scheduling rules intentionally MVP-sized but defensible. Weekly `schedule_blocks` define the normal working windows, `schedule_overrides` can replace or block a specific date, booked appointments subtract time from those windows, and candidate starts advance in 30-minute steps. That is enough to replace the deterministic calendar data in the imported frontend without inventing a complex staffing model yet.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Continue the feature slices by turning the booking calendar and appointment confirmation flow into real backend APIs.

**Inferred user intent:** Replace more of the mock salon workflow with working scheduling behavior while keeping local development usable.

**Commit (code):** `a11523d` — `feat: add availability and public booking APIs`

### What I did
- Added `pkg/appointments/service.go` with availability calculation, public booking validation, time parsing, and schedule/window math.
- Added `pkg/appointments/postgres.go` for loading schedule blocks, overrides, booked appointments, services, clients, and creating appointments.
- Added `pkg/appointments/service_test.go` for month-level availability, blocked overrides, and booking-conflict coverage.
- Added `pkg/db/migrations/0003_seed_schedule.sql` to seed a default weekly schedule for local development.
- Updated `pkg/db/migrations_test.go` to expect the new migration.
- Updated `pkg/server/http.go` to auto-wire the appointments service and register `GET /api/availability` plus `POST /api/appointments`.
- Updated `pkg/server/handlers_public.go` to expose the new endpoints and map booking-domain errors to HTTP status codes.
- Updated `pkg/server/http_test.go` with handler coverage for availability and booking creation.

### Why
- Availability and appointment creation are the core dependency for the public consult calendar in the imported frontend.
- Seeding a default weekly schedule means a local developer can run migrations and immediately see non-empty availability without hand-populating schedule tables first.

### What worked
- Keeping availability math inside a domain service instead of the handlers made the code testable without HTTP fixtures.
- The same scheduling logic is now reusable for later portal reschedule/cancel work.
- `go test ./...` passed after the full slice was wired together.

### What didn't work
- There were no meaningful debugging detours in this slice after the design was settled. The main risk was getting the availability math wrong, so I wrote the service tests first and used them to pin down the behavior before committing.

### What I learned
- A small time-window subtraction model covers more of the MVP than I initially expected. It handles normal blocks, blocked dates, custom override windows, and existing appointments without needing a heavier scheduling library.
- Returning times in `h:mm AM/PM` format keeps the backend closer to the current frontend expectations, while the service still accepts both `HH:MM` and `h:mm AM/PM` inputs for booking creation.

### What was tricky to build
- The sharp edge here was deciding how `schedule_blocks.is_available` and `schedule_overrides` should combine. I chose a clear rule: available blocks define the baseline windows for the weekday, unavailable blocks subtract from them, and a date override either blocks the date entirely or replaces the baseline with an explicit override window. That rule is simple enough for an intern to follow and strong enough to extend later.

### What warrants a second pair of eyes
- Whether the seeded local-development schedule should be Monday-Saturday exactly as committed or adjusted to the stylist’s real-world working days before frontend integration.
- Whether public bookings should continue to create/update clients by email/phone matching alone, or whether the later authenticated portal flow should narrow how contact collisions are resolved.

### What should be done in the future
- Move on to Phase 5: authenticated profile editing and notification preference updates.

### Code review instructions
- Start with `pkg/appointments/service.go`.
- Then review `pkg/appointments/postgres.go`.
- Finally read `pkg/server/handlers_public.go` and `pkg/server/http.go` to confirm the route and dependency wiring.
- Re-run:

```bash
go test ./...
```

### Technical details
- Commands run:

```bash
gofmt -w pkg/appointments/service.go pkg/appointments/postgres.go pkg/appointments/service_test.go pkg/server/http.go pkg/server/handlers_public.go pkg/server/http_test.go pkg/db/migrations_test.go
go test ./...
git commit -m "feat: add availability and public booking APIs"
```
