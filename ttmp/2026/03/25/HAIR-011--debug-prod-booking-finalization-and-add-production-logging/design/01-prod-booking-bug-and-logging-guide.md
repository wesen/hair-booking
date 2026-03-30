---
Title: Production Booking Bug And Logging Guide
Ticket: HAIR-011
Status: active
Topics:
    - booking
    - backend
    - production
    - logging
    - observability
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go
      Note: Public booking route that currently masks internal create failures
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go
      Note: Main booking orchestration and input normalization logic
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go
      Note: Repository path that inserts appointments and can surface database errors
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go
      Note: HTTP wiring, best place to add request logging middleware
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go
      Note: Current process logging entrypoint
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx
      Note: Frontend booking finalization path that calls `POST /api/appointments`
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/bookingApi.ts
      Note: RTK Query API layer for booking mutations
ExternalSources: []
Summary: Detailed intern-facing bug report and implementation guide for the hosted appointment-finalization failure and the missing production logging baseline.
LastUpdated: 2026-03-25T17:30:00-04:00
WhatFor: Use this to debug the production booking failure and implement enough structured logging to make future production failures understandable.
WhenToUse: Use before changing booking handlers, appointment services, repository error handling, or server logging middleware.
---

# Production Booking Bug And Logging Guide

## Executive Summary

`hair-booking` now has a real hosted production-shaped deployment at:

- `https://hair-booking.app.scapegoat.dev`

That changes the engineering bar. A production error cannot be treated like a
storybook bug or a local-only inconvenience, because:

- a user can reach it through the real booking flow
- the system already stores partial state such as intake submissions and photo uploads
- the current logs are too thin to explain what actually failed

The immediate bug is:

- `POST /api/appointments` can return `500 appointment-create-failed`

The deeper platform issue is:

- the server currently logs startup, but not enough request-level or
  error-level detail to debug production traffic safely

This ticket therefore has two goals:

1. find and fix the booking-finalization bug
2. establish the minimum viable production logging baseline

## The User-Reported Failure

The user reported this production sequence:

1. the booking flow saved the intake
2. a photo upload failed and the UI showed the retry prompt
3. retrying the remaining upload worked
4. finalizing the booking failed

The final failing request shape was:

```http
POST /api/appointments
Content-Type: application/json

{
  "intake_id": "7428cb8d-0b7b-49ca-b590-84e363aa11a9",
  "service_id": "fb964f96-5ac4-4e54-8561-59c6b0f5dd77",
  "date": "2026-03-10",
  "start_time": "11:00 AM",
  "client_name": "man",
  "client_email": "wesen@ruinwesen.com"
}
```

The response shape was:

```json
{
  "error": {
    "code": "appointment-create-failed",
    "message": "Failed to create appointment."
  }
}
```

## Why This Ticket Exists

A new intern should understand that the reported symptom and the logging problem
are not separate tickets by accident. They are linked causally.

Right now:

- the app can produce an internal booking error
- the user only gets a generic `500`
- the operator only sees the startup log

That means production debugging currently depends on:

- reading the source
- guessing likely error paths
- potentially reproducing locally

That is too fragile once the app is publicly reachable.

## System Overview

### Booking Funnel Architecture

The public booking funnel works like this:

```text
Booking UI
  -> POST /api/intake
     -> create intake row
  -> POST /api/intake/:id/photos
     -> upload photos and store intake_photos rows
  -> GET /api/availability
     -> calculate times from service + schedule + bookings
  -> POST /api/appointments
     -> create or find client
     -> validate service/date/time
     -> insert appointment
```

### Main Backend Files

The key files for this bug are:

- HTTP entrypoint:
  - [handlers_public.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go)
- appointment orchestration:
  - [service.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go)
- appointment persistence:
  - [postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go)
- server wiring:
  - [http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go)
- process-level logging:
  - [serve.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go)

### Frontend Surface

The frontend booking finalization path is also relevant because it shapes the
request body and retry behavior:

- [ConsultCalendarPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx)
- [bookingApi.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/bookingApi.ts)

## What The Backend Currently Does

### HTTP Handler

`handleCreateAppointment` decodes JSON, validates `service_id` and optional
`intake_id`, then calls `CreatePublicAppointment`.

Error mapping today is:

- invalid input -> `400 invalid-appointment`
- not found -> `404 appointment-resource-not-found`
- slot unavailable -> `409 slot-unavailable`
- everything else -> `500 appointment-create-failed`

This is the critical limitation:

- the handler emits no structured log on the default `500` path

### Service Layer

`CreatePublicAppointment` does:

1. normalize request data
2. load the service record
3. calculate availability for the requested date
4. check whether the requested slot is still in the allowed set
5. find or create the booking client
6. insert the appointment

Pseudocode:

```text
normalize input
load service
load schedule blocks
load overrides
load booked appointments
compute available starts for that date
if requested start not available:
  return ErrSlotUnavailable
client = findOrCreateBookingClient(...)
insert appointment row
```

### Repository Layer

`CreateAppointment` converts `11:00 AM` into a database clock string, then runs
the `insert into appointments(...) returning ...` query.

That means a `500` is very likely coming from one of these classes:

- unclassified service-layer error
- unclassified repository/database error
- unexpected parse/normalization issue that is not wrapped as `ErrInvalidInput`

## Most Likely Failure Classes

Without request logs yet, the ticket should treat these as ordered hypotheses.

### Hypothesis A: Database Insert Error

This is currently one of the strongest candidates because repository insert
errors are wrapped and returned, then collapsed by the handler into the generic
`500`.

Examples:

- foreign-key problem on `service_id` or `intake_id`
- unexpected null or constraint violation
- data shape mismatch between service calculation and stored appointment values

### Hypothesis B: Stale Frontend State After Photo Retry

The user saw:

- intake already saved
- photo retry
- then booking finalization

That means we should check whether the frontend can end up with:

- a saved intake ID from one attempt
- a stale date/time from another attempt
- a request body that no longer matches the currently available slot set

If the slot is invalid, the expected response should be:

- `409 slot-unavailable`

So if this path is currently reaching `500`, that suggests missing classification
or a deeper repository error after availability passes.

### Hypothesis C: Date Edge Case

The provided request shows:

- `date = 2026-03-10`

Depending on when the user was testing, that may be a past date. The service
does not currently appear to reject past dates explicitly before availability
work. An intern should verify whether:

- past-date bookings should be impossible
- the frontend can produce stale past dates
- a past date is currently reaching an unexpected repository path

### Hypothesis D: Intake-Linking Edge

The intake upload retry logic was recently changed to reuse the same saved
intake. That was the right design, but it also means the final booking path now
depends more heavily on a partially-completed intake state. An intern should
check whether:

- the intake row exists
- the intake photos state is partial but valid
- the appointment insert assumes a stronger intake invariant than the API
  actually enforces

## Observability Problem Statement

### Current Logging State

Hosted logs currently show startup output, but not enough request-level detail
to explain production failures.

In practice that means:

- no request start/finish logs
- no request path status/duration logs
- no structured error log when `appointment-create-failed` happens
- no request ID linking browser error to server log line

### Why That Is Not Enough

In production, a bug report often arrives as:

- one response code
- one error envelope
- maybe one request payload

Without request logging, we cannot quickly answer:

- which handler path ran
- which internal error class occurred
- whether the error happened before or after DB insert
- whether the failure was validation, conflict, DB, or storage

## Recommended Logging Architecture

The right baseline is not "log everything." The right baseline is:

- structured request logging
- structured error logging at boundaries
- stable request IDs
- safe field selection

### Layer 1: Request Middleware

Add middleware in [http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go) that logs:

- request ID
- method
- path
- status
- duration
- remote IP or forwarded IP if safe
- authenticated client/stylist identity when available

Pseudocode:

```text
requestID = get or create request id
start = now
call next handler through response recorder
log {
  request_id,
  method,
  path,
  status,
  duration_ms
}
```

### Layer 2: Handler Error Logs

When `handleCreateAppointment` reaches the default internal-error branch, it
should log:

- request ID
- intake ID
- service ID
- date
- start time
- redacted client identity fields
- internal error

but still return the user-safe envelope.

Pseudocode:

```text
appointment, err := service.CreatePublicAppointment(...)
if err != nil:
  if knownDomainError(err):
    respond mapped status
  else:
    logger.error("public appointment create failed", ...)
    respond 500 generic error
```

### Layer 3: Service and Repository Boundary Logs

At minimum, log once when:

- service validation fails in an unexpected way
- repository insert fails
- find-or-create client fails

This should be sparse, not noisy.

### Layer 4: Safe Redaction Rules

Do not dump raw request bodies into production logs by default.

Safe logging fields:

- intake ID
- service ID
- date
- normalized start time
- request ID
- client email only if operator policy allows it, otherwise hash or partial mask

Avoid logging:

- full multipart file payloads
- raw cookies
- auth tokens
- full phone numbers if not needed

## Recommended Error Surface Improvements

This ticket should not only add logs. It should also improve classification.

### Today

Many unexpected failures collapse into:

- `500 appointment-create-failed`

### Better Target

Map more explicitly:

- malformed date/time -> `400`
- slot no longer available -> `409`
- missing service/intake -> `404`
- DB uniqueness/conflict -> `409` if it is a real conflict
- everything truly unexpected -> `500`

The user should still see safe messages, but operators need a richer internal
error story.

## Recommended Implementation Sequence

### Phase 1: Reproduce First

Before touching logs, reproduce the failing path as closely as possible.

Steps:

1. create a known intake
2. upload at least one photo
3. simulate the retry shape if needed
4. call `POST /api/appointments`
5. capture whether the same payload fails locally

### Phase 2: Add Request Logging Middleware

This is the lowest-risk observability improvement and benefits every route.

### Phase 3: Add Explicit Booking Error Logs

Patch the public booking handler and appointment service/repo boundaries.

### Phase 4: Reproduce Again

At this point, either:

- the bug becomes obvious from logs
- or the bug is already fixed if it was a classification issue

### Phase 5: Write Tests

At minimum:

- one test for the failing appointment-create class
- one test for request middleware status/duration logging behavior if practical

## Deployment and Operator Guidance

Once logging exists, operators need a clear runbook.

Minimal hosted debug steps:

```bash
ssh manuel@89.167.52.236
sudo -n docker logs --tail 200 uion8lttbypsijf8ww9b4c3e-185456125584
```

After the logging patch, the expected operator experience should be:

- see the request log line
- see the matching error log line
- correlate both via request ID

## What This Ticket Should Deliver

A good HAIR-011 completion should produce:

- the real root cause of the booking-finalization `500`
- one code fix for that bug
- request-level structured logging in production
- error-level structured logging on booking failures
- clearer operational docs for production debugging

## Final Recommendation

Treat this as an observability milestone, not just a single bugfix.

If the team only fixes the one appointment-create bug, the next production error
will be just as opaque. If the team adds the request/error logging baseline now,
future production work becomes much cheaper and safer.
