---
Title: Booking Flow Inventory and Gap Analysis
Ticket: HAIR-013
Status: active
Topics:
    - frontend
    - backend
    - booking
    - postgres
    - design-doc
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/ClientBookingApp.tsx
      Note: Top-level booking flow screen switcher.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx
      Note: Current calendar UI and booking confirmation logic.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/components/CalendarGrid.tsx
      Note: Calendar rendering and month selection behavior.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultEstimatePage.tsx
      Note: Intake persistence and intake-photo upload orchestration.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go
      Note: Public intake, availability, and appointment API handlers.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go
      Note: Availability calculation and public appointment creation rules.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/postgres.go
      Note: Intake submission and intake-photo persistence.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0001_init.sql
      Note: Base schema for clients, intake, appointments, photos, and schedule.
ExternalSources: []
Summary: Detailed inventory of the public booking funnel, where the intake flow is codified, how it persists to Postgres, what functionality is complete, and what is still missing or fragile.
LastUpdated: 2026-03-26T10:35:00-04:00
WhatFor: Use this as the primary implementation guide for debugging the booking funnel and planning the next stabilization work.
WhenToUse: Use before changing the calendar, intake, appointment, or booking confirmation code paths.
---

# Booking Flow Inventory and Gap Analysis

## Executive Summary

The current `hair-booking` app is no longer just a Storybook shell. It has a
real public booking funnel, a real client portal, a real stylist workspace, a
Go backend, Postgres persistence, hosted Keycloak auth, and production deploy
plumbing. But the booking funnel still has brittle spots, and the calendar is
the clearest one right now.

The most important immediate finding is this:

- the public consult calendar in
  [ConsultCalendarPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx)
  is hard-coded to `year = 2026`, starts at `month = March`, and only allows
  navigation between March and June
- the rendered calendar grid in
  [CalendarGrid.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/components/CalendarGrid.tsx)
  only treats a day as clickable if the backend availability map contains an
  exact `YYYY-MM-DD` key for that hard-coded month/year

That means the current booking UI is not truly date-driven. It is still partly a
prototype runtime dressed around a real backend. If the current month is not in
that narrow window, date selection looks broken even though the backend
availability system itself is real.

The second important finding is architectural:

- the intake flow is codified in the frontend Redux consultation state and in
  the public backend intake service
- the frontend uses a two-step persistence model:
  1. create `intake_submissions`
  2. upload `intake_photos`
- appointment creation is a third step and writes into `appointments`, usually
  linked back to the intake via `appointments.intake_id`

So the current data model is:

```text
user answers intake questions
  -> consultationSlice in browser
  -> POST /api/intake
  -> intake_submissions row
  -> POST /api/intake/:id/photos
  -> intake_photos rows
  -> GET /api/availability
  -> POST /api/appointments
  -> appointments row linked to intake/client/service
```

This is a workable MVP design. The app is not missing the basic booking
architecture. What it is missing is the final hardening pass that turns
prototype-era assumptions into production-safe behavior.

## System Map

### Runtime surfaces

The app currently has three real runtime surfaces:

- `/booking`
  - public intake and consult booking funnel
- `/portal`
  - authenticated client portal
- `/stylist`
  - authenticated stylist workspace

The booking flow is mounted by:

- [ClientBookingApp.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/ClientBookingApp.tsx)

The backend public HTTP routes are mounted in:

- [http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go)

The relevant public routes are:

- `POST /api/intake`
- `POST /api/intake/:id/photos`
- `GET /api/availability`
- `POST /api/appointments`
- `GET /api/services`

### Domain split

The backend is split by domain package:

- [pkg/intake](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake)
  - intake submission creation
  - intake photo attachment
  - estimate calculation
- [pkg/appointments](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments)
  - availability calculation
  - public appointment booking
  - portal reschedule/cancel logic
  - appointment photo uploads
- [pkg/services](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/services)
  - service catalog
- [pkg/clients](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/clients)
  - client records
- [pkg/stylist](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/stylist)
  - stylist dashboard, intake review, appointment/client detail

## Where The Intake Flow Is Codified

The intake flow is spread across three layers:

### 1. Frontend screen/state flow

The canonical booking wizard lives in:

- [consultationSlice.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/consultationSlice.ts)
- [ClientBookingApp.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/ClientBookingApp.tsx)

`consultationSlice` defines the step graph:

```text
extensions:
  intake-ext -> photos -> goals-ext -> estimate -> calendar -> confirm

color:
  intake-color -> photos -> goals-color -> estimate -> calendar -> confirm

both:
  intake-ext -> intake-color -> photos -> goals-ext -> estimate -> calendar -> confirm
```

The user’s answers live in the `ConsultationData` type in:

- [types.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/types.ts)

Important fields:

- service selection:
  - `serviceType`
  - `extType`
  - `colorService`
- hair characteristics:
  - `hairLength`
  - `hairDensity`
  - `hairTexture`
  - `prevExtensions`
  - `naturalLevel`
  - `currentColor`
  - `chemicalHistory`
  - `lastChemical`
- goals:
  - `desiredLength`
  - `budget`
  - `maintenance`
  - `deadline`
  - `dreamResult`
- photos:
  - `photoFront`
  - `photoBack`
  - `photoHairline`
  - `inspoPhotos`
- booking details:
  - `name`
  - `email`
  - `phone`
  - `selectedDate`
  - `selectedTime`
  - `intakeId`
  - `appointmentId`

### 2. Frontend request mapping

The frontend maps consultation state to the intake API payload in:

- [mappers.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/mappers.ts)

Function:

- `mapConsultationDataToIntakeRequest(data)`

That function is the contract bridge between UI field names and API field names.
It turns camelCase browser state into snake_case API JSON.

Pseudocode:

```text
consultationData
  -> mapConsultationDataToIntakeRequest
  -> POST /api/intake payload
```

### 3. Backend intake service

The backend intake rules live in:

- [service.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/service.go)

Core responsibilities:

- validate `service_type`
- compute estimate range
- persist intake submission
- validate photo slot
- write uploaded photo to blob storage
- persist intake photo row

Important methods:

- `CreateSubmission`
- `AddPhoto`
- `CalculateEstimate`

## How The Intake Results Are Stored In The Database

### Base tables

The base schema lives in:

- [0001_init.sql](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0001_init.sql)

The relevant tables are:

- `clients`
- `intake_submissions`
- `intake_photos`
- `appointments`
- `services`
- `schedule_blocks`
- `schedule_overrides`

Stylist-side review metadata was added later in:

- [0004_add_intake_reviews.sql](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0004_add_intake_reviews.sql)

### Intake submission persistence

Rows are inserted in:

- [intake/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/postgres.go)

Method:

- `CreateSubmission`

Table:

- `intake_submissions`

Fields written:

- `service_type`
- `hair_length`
- `hair_density`
- `hair_texture`
- `prev_extensions`
- `color_service`
- `natural_level`
- `current_color`
- `chemical_history`
- `last_chemical`
- `desired_length`
- `ext_type`
- `budget`
- `maintenance`
- `deadline`
- `dream_result`
- `estimate_low`
- `estimate_high`

Important architectural point:

- `client_id` is nullable here
- public intake creation does not require auth
- the intake can exist before the client is fully materialized as a signed-in
  portal user

### Intake photo persistence

Rows are inserted in:

- [intake/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/postgres.go)

Method:

- `AddPhoto`

Table:

- `intake_photos`

Blob storage path is constructed in:

- [intake/service.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/service.go)

Storage key pattern:

```text
intake/<intake-id>/<uuid>-<filename>
```

So the DB stores:

- `storage_key`
- `url`

and the actual file goes through the configured blob store implementation.

Current storage implementation:

- [storage/local.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/storage/local.go)

### Appointment persistence

Appointments are created in:

- [appointments/service.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go)

Method:

- `CreatePublicAppointment`

The repository insert happens in:

- [appointments/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go)

Table:

- `appointments`

Important fields:

- `client_id`
- `service_id`
- `intake_id`
- `date`
- `start_time`
- `duration_min_snapshot`
- `status`

The key linkage is:

```text
appointment.client_id -> clients.id
appointment.service_id -> services.id
appointment.intake_id -> intake_submissions.id
```

This is why the intake survives independently from the booked appointment, but
the stylist can still see them together later.

## Public Booking Flow End To End

### Frontend sequence

The booking flow is not one API call. It is three independent persistence steps.

#### Step 1: collect photos in browser-only state

The photo UI lives in:

- [PhotosPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PhotosPage.tsx)

This page does **not** upload immediately.

It:

- stores filenames in Redux consultation data
- stores actual `File` objects in
  [consultationUploads.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/consultationUploads.ts)

That split exists so Redux stays serializable.

#### Step 2: persist intake and intake photos

The orchestration lives in:

- [ConsultEstimatePage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultEstimatePage.tsx)

The function `persistIntake()` does:

```text
if no intakeId:
  POST /api/intake
  save returned intakeId and estimate

for each pending required photo:
  POST /api/intake/:id/photos

for each inspiration photo:
  POST /api/intake/:id/photos

if any upload fails:
  keep intakeId
  keep unfinished files
  surface retry message
```

This is a good MVP pattern because it avoids duplicate intakes on retry.

#### Step 3: load availability and create appointment

The calendar booking screen lives in:

- [ConsultCalendarPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx)

It does:

```text
GET /api/services?category=consult
  -> choose consult service by serviceType

GET /api/availability?month=YYYY-MM&service_id=...
  -> render clickable calendar days

user chooses date
user chooses time
user enters contact info

POST /api/appointments
  -> create/find client
  -> validate slot
  -> create appointment
```

### Backend sequence

#### Public intake creation

Handler:

- [handlers_public.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go)

Method:

- `handleIntake`

Flow:

```text
decode JSON
-> intakeService.CreateSubmission
-> estimate computed
-> intake_submissions row inserted
-> return { id, estimate_low, estimate_high }
```

#### Availability lookup

Handler:

- [handlers_public.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go)

Method:

- `handleAvailability`

Flow:

```text
parse month/service_id
-> appointmentService.Availability
-> fetch schedule blocks
-> fetch overrides
-> fetch booked appointments
-> subtract booked/blocked windows
-> return { date: [times...] }
```

#### Appointment creation

Handler:

- [handlers_public.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go)

Method:

- `handleCreateAppointment`

Flow:

```text
decode JSON
-> normalizeCreateInput
-> repo.GetService
-> reject if slot in past
-> calculate availability for that month/date
-> reject if selected time not in availability
-> FindOrCreateBookingClient
-> CreateAppointment
```

## Likely Current Calendar Defect

### Primary defect candidate

The strongest code-level defect right now is the hard-coded calendar window in:

- [ConsultCalendarPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx)
- [CalendarGrid.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/components/CalendarGrid.tsx)

Current behavior:

- `const [calendarMonth, setCalendarMonth] = useState(2)`
- `const year = 2026`
- previous arrow only works if `month > 2`
- next arrow only works if `month < 5`

That means:

- initial month is always March 2026
- allowed navigation window is March 2026 through June 2026 only
- if today is outside that expected window, the calendar is logically stale

This is not a backend bug. It is a frontend date-state bug.

### Why “selecting something” may appear broken

The grid only allows click-through when:

```text
availability[dateStr] exists
```

where `dateStr` is built from the hard-coded `year` and `month`.

If the backend has no availability for that hard-coded window, then:

- days render
- but they are not “available”
- clicks do nothing

From a user perspective, that looks like the calendar selection is broken.

### Secondary defect candidates

There are a few other plausible issues, but they are weaker than the hard-coded
date range:

- consult service lookup mismatch
  - `findConsultService` depends on seeded consult service names/categories
- month refetch mismatch
  - availability query key changes only by `monthKey` and consult service
- stale selection reset logic
  - changing month clears `selectedDate` and `selectedTime`
- no explicit UI affordance for “unavailable day”
  - a day can look present but not actionable

## Backend Inventory

### What is implemented

- public service catalog read
- public intake create
- public intake photo upload
- public availability lookup
- public appointment booking
- authenticated `/api/me`
- portal profile/preferences read/write
- portal appointments read/reschedule/cancel
- maintenance plan read
- stylist dashboard/intakes/appointments/clients
- appointment before/after photo uploads

### What is missing or deferred

- real payment/deposit processing
- reminders and outbound scheduling notifications
- production object storage instead of local blob storage
- richer appointment conflict/index constraints in DB
- proper role model for stylist/admin instead of env allowlists
- broader booking smoke coverage and browser-level tests
- automated provider sync for Google/Facebook auth config

## Frontend Inventory

### What is implemented

- real RTK Query API layer
- booking funnel wired to backend
- hosted OIDC auth integration
- portal reads/writes mostly live
- stylist runtime mostly live
- auth-aware shell routing

### What is still prototype-shaped

- booking calendar date logic still uses a hard-coded month/year window
- consultation flow still mixes legacy storybook/runtime assumptions with live data
- some old non-MVP fields still exist in shared UI types
  - payment card fields in [types.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/types.ts)
- some confirmation/copy paths still assume deposit variants even though no real
  payment backend exists

## Missing Functionality Inventory

### Public booking

- dynamic calendar range based on real current date
- explicit unavailable-day affordances
- robust end-to-end test for “create intake -> upload photos -> book time”
- clearer retry path when a time becomes unavailable between selection and submit

### Client portal

- deeper smoke coverage against hosted auth/session transitions
- stronger “signed in / signed out / role mismatch” shell consistency
- production-grade photo access/privacy policy

### Stylist side

- Keycloak-native role/group model instead of env allowlist
- richer operational search/filtering
- clearer appointment-intake linking UI
- more complete client timeline/history synthesis

### Operations

- object storage implementation for production uploads
- stronger request logging around booking flows
- higher-level deploy automation instead of host-side manual retagging
- local Google broker setup for auth regression testing

## Recommended Implementation Plan

### Phase 1: fix the booking calendar defect

- replace hard-coded `year = 2026` and March-June bounds with runtime month logic
- derive initial month from `new Date()`
- constrain booking to a rolling window explicitly, not implicitly
- add tests around calendar date selection and month transitions

Pseudocode:

```text
today = now()
initialMonth = today.month
initialYear = today.year
bookingWindow = next N months

if date not within bookingWindow:
  disable with explicit reason
else if availability[date]:
  allow selection
```

### Phase 2: add an explicit booking smoke matrix

- new intake without photos
- new intake with required photos
- retry after one failed upload
- slot becomes unavailable between selection and submit
- past date rejected cleanly

### Phase 3: clean the booking runtime model

- remove dead payment-only fields from consultation types or isolate them
- clarify which fields are browser-only versus persisted
- reduce storybook-era coupling in the booking runtime

## Architecture Diagram

```text
Client Booking UI
  ClientBookingApp
    -> consultationSlice
    -> PhotosPage
    -> ConsultEstimatePage
    -> ConsultCalendarPage

RTK Query
  -> POST /api/intake
  -> POST /api/intake/:id/photos
  -> GET /api/services
  -> GET /api/availability
  -> POST /api/appointments

Go Server
  handlers_public.go
    -> intake.Service
    -> appointments.Service
    -> services.Service

Postgres
  intake_submissions
  intake_photos
  clients
  appointments
  services
  schedule_blocks
  schedule_overrides
```

## Recommended Tasks For The Next Engineer

- Reproduce the calendar non-selection behavior in the hosted booking app.
- Fix the hard-coded calendar month/year window in the booking frontend.
- Add a focused UI test for date selection and available/unavailable day clicks.
- Run a full booking smoke from `/booking` through `POST /api/appointments`.
- Document any remaining mismatch between frontend booking assumptions and backend availability rules.
