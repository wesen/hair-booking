---
Title: Luxe Hair Studio MVP Backend Design Guide
Ticket: HAIR-002
Status: active
Topics:
    - backend
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: cmd/hair-booking/cmds/serve.go
      Note: Server startup wiring for DB and auto-migrate
    - Path: docker-compose.local.yml
      Note: Local development stack that already provisions Keycloak and needs an application Postgres service
    - Path: pkg/auth/config.go
      Note: Existing Keycloak/OIDC configuration surface
    - Path: pkg/auth/oidc.go
      Note: Existing browser login and callback flow
    - Path: pkg/config/backend.go
      Note: Backend config surface for application database and storage
    - Path: pkg/db/migrations.go
      Note: Embedded SQL migration runner
    - Path: pkg/db/migrations/0001_init.sql
      Note: Initial domain schema without auth_codes
    - Path: pkg/db/migrations/0002_seed_services.sql
      Note: Seed service catalog for later routes
    - Path: pkg/db/postgres.go
      Note: Application Postgres connection bootstrap
    - Path: pkg/server/http.go
      Note: Current router and authenticated /api/me baseline
    - Path: pkg/server/http_test.go
      Note: Current HTTP handler testing style
    - Path: web/src/stylist/data/consultation-constants.ts
      Note: Current intake fields and fake availability data
    - Path: web/src/stylist/store/consultationSlice.ts
      Note: Consultation flow state the backend must support
    - Path: web/src/stylist/store/portalSlice.ts
      Note: Portal mock state the backend must replace
ExternalSources: []
Summary: Detailed implementation guide for a Keycloak-backed Luxe Hair Studio MVP backend using Go, PostgreSQL, local uploads, and the imported booking/portal widgets.
LastUpdated: 2026-03-20T08:30:00-04:00
WhatFor: Use this document to implement the first production-backed version of the Luxe Hair Studio booking flow and client portal with Keycloak-based sign-in.
WhenToUse: Use when replacing the imported Storybook mocks with a real Go + PostgreSQL backend that reuses the existing Keycloak OIDC login flow.
---


# Luxe Hair Studio MVP Backend Design Guide

## Executive Summary

The repo already has the right authentication foundation for the MVP: browser-based Keycloak login, signed session cookies, and an authenticated `/api/me` endpoint. The backend plan should build on that instead of introducing a second authentication system. That means the application schema should not contain `auth_codes`, and the app should not implement passwordless OTP handlers. Client sign-in should use the existing `/auth/login`, `/auth/callback`, and `/auth/logout` browser routes backed by Keycloak username/password authentication.

The actual missing work is domain persistence. The frontend widgets already model intake, booking, portal profile, maintenance, photos, and schedule interactions, but they are all mock-backed. The MVP backend therefore becomes: one Go server, one application Postgres database, one local upload adapter for development, and a set of focused route handlers that hydrate the existing widgets with real data.

## Problem Statement And Scope

Luxe Hair Studio needs a backend that supports:

1. Public consultation intake submission.
2. Intake and appointment photo uploads.
3. Availability calculation from recurring schedule, overrides, and booked appointments.
4. Appointment creation, viewing, rescheduling, and cancellation.
5. Client portal access for authenticated users.
6. Profile and notification preference management.
7. Maintenance plan display.
8. Local development with Postgres and Keycloak.

The MVP does not include:

1. App-managed OTP or login-code flows.
2. An `auth_codes` table.
3. A separate app-managed bearer-token session system.
4. Payments persistence.
5. Loyalty, rewards, referrals, or points persistence.
6. A stylist/admin back office beyond what is needed to support client flows.

## Current-State Analysis

### Backend Runtime Today

The current server is small and already has the authentication wiring we need:

1. `pkg/server/http.go:125-135` registers `GET /healthz`, `GET /api/info`, `GET /api/me`, and the browser auth routes.
2. `pkg/server/http.go:157-190` resolves the current user from either dev auth mode or the OIDC-backed session cookie.
3. `pkg/auth/config.go:20-29` and `pkg/auth/config.go:46-107` already define the Keycloak/OIDC configuration fields.
4. `pkg/auth/oidc.go:60-127` discovers the Keycloak realm configuration and prepares the OAuth client.
5. `pkg/auth/oidc.go:129-219` already handles login, callback, and logout.

Observed consequence: authentication is not the missing backend capability. Domain persistence is.

### Frontend State Today

The frontend widgets define the domain model the backend must serve:

1. `web/src/stylist/store/consultationSlice.ts:15-20` defines the consultation step graph.
2. `web/src/stylist/data/consultation-constants.ts:30-62` defines the intake fields currently captured.
3. `web/src/stylist/data/consultation-constants.ts:64-82` generates fake availability.
4. `web/src/stylist/store/portalSlice.ts:36-46` seeds the portal from mocks.
5. `web/src/stylist/data/portal-data.ts:27-64` contains mock appointments, maintenance entries, photos, and notification preferences.
6. `web/src/stylist/pages/SignInPage.tsx` and `web/src/stylist/pages/VerifyCodePage.tsx` still simulate an OTP flow that now needs to be removed or replaced with a Keycloak login handoff.

I also verified that there are still no real frontend API calls:

```bash
rg -n "fetch\\(|axios|useQuery|createAsyncThunk|/api/|/auth/" web/src -S
```

That command returned exit code `1`.

### Local Development Today

`docker-compose.local.yml:1-49` already provisions Keycloak plus its own Postgres. It does not yet provision an application Postgres instance for salon data, and there is no migration workflow for the application schema.

## Updated MVP Authentication Direction

### Decision

Use Keycloak username/password login through the existing OIDC browser flow. The app should rely on the signed cookie written by the current `SessionManager`; it should not create its own OTP or bearer-token auth subsystem.

### Consequences

1. Drop `auth_codes` from the application schema.
2. Do not add `POST /auth/send-code` or `POST /auth/verify`.
3. Keep the existing `GET /auth/login`, `GET /auth/callback`, and `GET /auth/logout` browser routes.
4. Treat `/api/me` as the authenticated portal identity root.
5. Add a lightweight client-bootstrap step that maps the OIDC user claims to an application `clients` row on first successful login.

### Client Bootstrap Model

We still need a `clients` table because the salon domain needs a stable application-side client record. The Keycloak identity becomes the authentication source, and the app creates or updates a matching `clients` row using OIDC claims.

Recommended addition to `clients`:

1. `auth_subject text unique`
2. `auth_issuer text`

This lets the application reliably link a Keycloak identity to its local client profile.

## Gap Analysis

| Surface | Current repo state | MVP requirement | Decision |
| --- | --- | --- | --- |
| Login | Keycloak/OIDC browser login already exists | Reuse it for the portal | Build on existing |
| Client bootstrap | No DB-backed client record | Persist a `clients` row linked to OIDC subject | Build now |
| Intake persistence | Redux-only | Persist `intake_submissions` and `intake_photos` | Build now |
| Availability | Deterministic constant | Real schedule minus bookings | Build now |
| Appointment booking | Local state only | Transactional appointment creation/reschedule/cancel | Build now |
| Portal profile | Mock portal state | `GET/PATCH /me` with real data | Build now |
| Notification prefs | Mock portal state | Real `notification_prefs` row per client | Build now |
| Maintenance | Mock portal state | Read-only maintenance timeline | Build now |
| Rewards / loyalty / referrals | Present in widgets only | Out of MVP schema | Defer |
| Payments | Deposit UI only | Out of MVP schema | Defer |

Two frontend mismatches still need cleanup:

1. The frontend portal type uses `"complete"` while the backend should use `"completed"`.
2. Frontend notification keys use `remind48hr`, `remind2hr`, and `maintAlerts`, while the backend schema should use snake_case.

## Proposed Architecture

### System Context

```text
Client Booking Widget / Client Portal Widget
                |
                v
        hair-booking net/http server
                |
    +-----------+-----------+
    |                       |
    v                       v
public routes          auth-required routes
(/services,            (/api/me and portal routes)
 /intake,
 /availability,
 /appointments)
                |
                v
        application services
  (clients, services, intake, booking,
   maintenance, uploads, profile)
                |
    +-----------+-----------+
    |                       |
    v                       v
PostgreSQL             Local disk / S3
```

### Recommended Package Layout

```text
cmd/hair-booking/cmds/serve.go
pkg/config/backend.go
pkg/db/postgres.go
pkg/db/migrations/0001_init.sql
pkg/db/migrations/0002_seed_services.sql
pkg/clients/repository.go
pkg/clients/service.go
pkg/services/repository.go
pkg/services/service.go
pkg/intake/repository.go
pkg/intake/service.go
pkg/appointments/repository.go
pkg/appointments/service.go
pkg/maintenance/repository.go
pkg/maintenance/service.go
pkg/profile/service.go
pkg/storage/storage.go
pkg/storage/local.go
pkg/storage/s3.go
pkg/server/http.go
pkg/server/handlers_public.go
pkg/server/handlers_me.go
```

The OIDC implementation should stay in `pkg/auth`. The new domain logic belongs in feature packages and the server package should stay thin.

## Data Model And Schema Design

### Core Tables

Keep the trimmed domain schema, with these adjustments:

1. Remove `auth_codes`.
2. Remove application-side `sessions`.
3. Add OIDC identity columns to `clients`.
4. Add `duration_min_snapshot` to `appointments`.
5. Add `created_at` / `updated_at` defaults on mutable tables.

### Entity Relationship Overview

```text
clients
  |--< intake_submissions --< intake_photos
  |--< appointments ------< appointment_photos
  |--1 maintenance_plans --< maintenance_items
  '--1 notification_prefs

services
  |--< appointments
  '--< maintenance_items

schedule_blocks
schedule_overrides
```

### Table Notes

#### `clients`

Purpose: canonical application-side client identity and profile.

Recommended fields:

1. `id uuid primary key`
2. `auth_subject text unique`
3. `auth_issuer text`
4. `name text not null`
5. `email text unique`
6. `phone text unique`
7. `scalp_notes text`
8. `service_summary text`
9. `created_at timestamptz not null default now()`
10. `updated_at timestamptz not null default now()`

Rules:

1. A client may be created from OIDC claims before the salon has collected a phone number.
2. Email should be normalized to lowercase.
3. Phone can remain nullable and be added later through profile editing.

#### `services`

Purpose: read-only salon service catalog.

Rules:

1. Seed the catalog in SQL.
2. Use `category` for filtering.
3. Snapshot duration into appointments when booking.

#### `intake_submissions`

Purpose: consultation answers and estimate inputs.

Rules:

1. Preserve the current frontend field shape where practical.
2. Allow `client_id` to be null for public submissions before login.
3. Store estimate results so the UI can show the same range later.

#### `intake_photos` and `appointment_photos`

Purpose: metadata for uploaded files.

Rules:

1. Store metadata only, not blobs.
2. Use stable `storage_key` values.
3. Serve local-development uploads from disk behind a predictable URL prefix.

#### `appointments`

Purpose: consultation bookings and future service appointments.

Rules:

1. Add `duration_min_snapshot`.
2. Keep status values `pending`, `confirmed`, `completed`, `cancelled`, `no_show`.
3. Validate availability transactionally.

#### `maintenance_plans` and `maintenance_items`

Purpose: read-only maintenance timeline shown in the portal.

Rules:

1. Stylist-managed only for MVP.
2. `maintenance_items` remain ordered by `sort_order`.

#### `notification_prefs`

Purpose: per-client reminder preferences.

Rules:

1. One row per client.
2. Create automatically when a client row is first created.

#### `schedule_blocks` and `schedule_overrides`

Purpose: recurring weekly schedule plus date-specific exceptions.

Rules:

1. Calculate public availability from both tables plus booked appointments.
2. Keep the model single-calendar for MVP unless the team explicitly adds staff scoping.

### Representative SQL Pseudocode

```sql
create table clients (
  id uuid primary key,
  auth_subject text unique,
  auth_issuer text,
  name text not null,
  email text unique,
  phone text unique,
  scalp_notes text,
  service_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key,
  name text not null,
  category text not null,
  duration_min int not null,
  price_low int,
  price_high int,
  is_active bool not null default true,
  sort_order int
);

create table appointments (
  id uuid primary key,
  client_id uuid not null references clients(id),
  service_id uuid not null references services(id),
  intake_id uuid references intake_submissions(id),
  date date not null,
  start_time time not null,
  duration_min_snapshot int not null,
  status text not null default 'pending',
  stylist_notes text,
  prep_notes text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'))
);
```

Indexes:

```sql
create index idx_clients_auth_subject on clients(auth_subject);
create index idx_appointments_date_start_time on appointments(date, start_time);
create index idx_appointments_active_client on appointments(client_id) where status <> 'cancelled';
create index idx_intake_photos_intake_id on intake_photos(intake_id);
create index idx_maintenance_items_plan_sort on maintenance_items(plan_id, sort_order);
create index idx_appointments_date_status on appointments(date, status);
```

## API Reference

### Authentication Routes

The app should use the existing browser-auth flow:

1. `GET /auth/login`
2. `GET /auth/callback`
3. `GET /auth/logout`

These routes already exist and should remain the only authentication entrypoints for MVP.

### Public Routes

#### `GET /services`

Purpose: return active public services, optionally filtered by category.

#### `POST /intake`

Purpose: persist an intake submission and return estimate values.

#### `POST /intake/:id/photos`

Purpose: upload one intake photo and record its metadata.

#### `GET /availability`

Purpose: return bookable start times for the requested month.

Query:

1. `month=2026-03`
2. `service_id=<uuid>` optional

#### `POST /appointments`

Purpose: create a booking from the public funnel.

Request shape:

```json
{
  "intake_id": "uuid-or-null",
  "service_id": "uuid",
  "date": "2026-03-24",
  "start_time": "10:00",
  "client_name": "Mia Kovacs",
  "client_email": "mia.k@email.com",
  "client_phone": "+14015550188"
}
```

### Authenticated Portal Routes

These routes should use the current Keycloak-backed session cookie:

1. `GET /api/me`
2. `PATCH /api/me`
3. `PATCH /api/me/notification-prefs`
4. `GET /api/me/appointments`
5. `GET /api/me/appointments/:id`
6. `PATCH /api/me/appointments/:id`
7. `POST /api/me/appointments/:id/cancel`
8. `GET /api/me/photos`
9. `POST /api/me/photos`
10. `GET /api/me/maintenance-plan`

Recommended rule: keep all domain APIs under `/api/*`. The existing `/api/me` endpoint already establishes that convention.

## Core Flows And Pseudocode

### OIDC Client Bootstrap

```text
Browser login through Keycloak
  -> OIDC callback writes signed session cookie
  -> authenticated request to /api/me
  -> load OIDC claims from session
  -> find client by auth_subject
  -> create or update client row if missing
  -> ensure notification_prefs row exists
  -> return client + prefs
```

Pseudocode:

```go
func (s *ClientService) EnsureClientForAuthenticatedUser(ctx context.Context, claims auth.SessionClaims) (*Client, error) {
    return s.repo.WithTxResult(ctx, func(tx Tx) (*Client, error) {
        client, err := s.repo.FindBySubject(ctx, tx, claims.Issuer, claims.Subject)
        if err == nil {
            return s.repo.UpdateFromClaims(ctx, tx, client.ID, claims)
        }
        if !errors.Is(err, ErrNotFound) {
            return nil, err
        }

        client, err = s.repo.InsertFromClaims(ctx, tx, claims)
        if err != nil {
            return nil, err
        }
        if err := s.repo.InsertDefaultNotificationPrefs(ctx, tx, client.ID); err != nil {
            return nil, err
        }
        return client, nil
    })
}
```

### Availability Calculation

```text
weekly schedule + date overrides + service duration + existing appointments
                                 |
                                 v
                       bookable start times by day
```

Algorithm:

1. Load schedule blocks for the requested month.
2. Apply any date override for each day.
3. Resolve service duration, defaulting to a 15-minute consult if `service_id` is omitted.
4. Expand available windows into candidate start times on a 15-minute grid.
5. Load non-cancelled appointments overlapping the month.
6. Remove candidate starts that overlap occupied intervals.

### Appointment Creation

```go
func (s *AppointmentService) CreatePublic(ctx context.Context, req CreateAppointmentRequest) (*Appointment, error) {
    return s.repo.WithTxResult(ctx, func(tx Tx) (*Appointment, error) {
        client, err := s.clients.FindOrCreateByContact(ctx, tx, req.ClientName, req.ClientEmail, req.ClientPhone)
        if err != nil { return nil, err }

        svc, err := s.services.LoadActive(ctx, tx, req.ServiceID)
        if err != nil { return nil, err }

        available, err := s.availability.IsSlotAvailable(ctx, tx, req.Date, req.StartTime, svc.DurationMin)
        if err != nil { return nil, err }
        if !available { return nil, ErrSlotUnavailable }

        return s.repo.Insert(ctx, tx, Appointment{
            ClientID:            client.ID,
            ServiceID:           svc.ID,
            IntakeID:            req.IntakeID,
            Date:                req.Date,
            StartTime:           req.StartTime,
            DurationMinSnapshot: svc.DurationMin,
            Status:              "pending",
        })
    })
}
```

## Local Development Plan

### Docker Compose Changes

Add an application Postgres service alongside the existing Keycloak stack:

```yaml
app-postgres:
  image: postgres:16
  container_name: hair-booking-app-postgres
  environment:
    POSTGRES_DB: hair_booking
    POSTGRES_USER: hair_booking
    POSTGRES_PASSWORD: hair_booking
  ports:
    - "127.0.0.1:${HAIR_BOOKING_PG_PORT:-15432}:5432"
  volumes:
    - app-postgres-data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U hair_booking -d hair_booking"]
    interval: 10s
    timeout: 5s
    retries: 10
```

### Configuration To Add

1. `HAIR_BOOKING_DATABASE_URL`
2. `HAIR_BOOKING_STORAGE_MODE`
3. `HAIR_BOOKING_STORAGE_LOCAL_DIR`
4. `HAIR_BOOKING_PUBLIC_BASE_URL`

### Recommended Commands

```bash
docker compose -f docker-compose.local.yml up -d app-postgres keycloak-postgres keycloak
go test ./... -count=1
hair-booking serve --auth-mode oidc --auth-session-secret local-session-secret
```

## Detailed Implementation Plan

### Phase 1: Ticket Realignment And Task Breakdown

Goal: remove OTP assumptions from the design and create an executable task list.

Deliverables:

1. Updated HAIR-002 design guide.
2. Updated diary.
3. Detailed tasks by feature slice.

### Phase 2: Foundation

Goal: make the app ready to persist domain data.

Deliverables:

1. Application Postgres service in Docker Compose.
2. Backend config package for DB and storage.
3. DB connection package.
4. Embedded SQL migration runner or CLI command.
5. Initial schema without `auth_codes` or app `sessions`.

### Phase 3: Services Catalog And Client Bootstrap

Goal: expose the first real DB-backed routes while reusing Keycloak auth.

Deliverables:

1. `GET /api/services`
2. Client bootstrap from OIDC claims on authenticated requests.
3. Real `GET /api/me` returning client profile and notification prefs.

### Phase 4: Public Intake And Uploads

Goal: replace the consultation funnel’s local-only persistence.

Deliverables:

1. `POST /api/intake`
2. `POST /api/intake/:id/photos`
3. Local upload adapter and URL generation.
4. Rule-based estimate calculation.

### Phase 5: Availability And Booking

Goal: support real booking behavior.

Deliverables:

1. `GET /api/availability`
2. `POST /api/appointments`
3. Transactional slot validation.

### Phase 6: Portal CRUD

Goal: replace portal mock state.

Deliverables:

1. `PATCH /api/me`
2. `PATCH /api/me/notification-prefs`
3. `GET /api/me/appointments`
4. `GET /api/me/appointments/:id`
5. `PATCH /api/me/appointments/:id`
6. `POST /api/me/appointments/:id/cancel`
7. `GET /api/me/photos`
8. `POST /api/me/photos`
9. `GET /api/me/maintenance-plan`

### Phase 7: Frontend Integration Cleanup

Goal: remove auth and portal behaviors that no longer fit the backend.

Deliverables:

1. Replace OTP sign-in pages with Keycloak login initiation.
2. Remove Redux-only login-code state.
3. Replace fake availability with backend calls.
4. Hide rewards and deposit UI behind feature flags or remove them from the MVP shell.

## Testing And Validation Strategy

### Unit Tests

Cover:

1. OIDC client bootstrap logic.
2. Estimate calculation.
3. Availability interval math.
4. Appointment policy checks.
5. Input normalization for emails and phone numbers.

### Repository And Integration Tests

Cover:

1. Migration application.
2. Unique constraints on client contact data.
3. Service catalog seeding.
4. Booking conflict detection.
5. Maintenance plan reads.

### Handler Tests

Follow the current `httptest` pattern in `pkg/server/http_test.go`.

### Smoke Scenarios

1. Log in through Keycloak, then load `/api/me`.
2. Submit intake, upload photos, and book a consult.
3. View upcoming appointments in the portal.
4. Reschedule and cancel within the allowed policy.

## Risks And Open Questions

1. The current plan assumes a single shared schedule. If the salon needs multiple stylists, the schedule model must grow before availability is considered complete.
2. Frontend sign-in UX still assumes OTP and must be rewritten or replaced.
3. If photo URLs need tighter protection, local public URLs may not be enough even for staging.

## References

1. `pkg/auth/config.go`
2. `pkg/auth/oidc.go`
3. `pkg/server/http.go`
4. `pkg/server/http_test.go`
5. `web/src/stylist/store/consultationSlice.ts`
6. `web/src/stylist/data/consultation-constants.ts`
7. `web/src/stylist/store/portalSlice.ts`
8. `web/src/stylist/data/portal-data.ts`
9. `docker-compose.local.yml`
