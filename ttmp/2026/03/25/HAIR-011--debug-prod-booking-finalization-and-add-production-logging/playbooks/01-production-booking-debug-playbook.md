---
Title: Production Booking Debug Playbook
Ticket: HAIR-011
Status: active
Topics:
    - production
    - booking
    - logging
    - observability
    - debug
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/server/http.go
      Note: Request logging middleware and request ID propagation
    - Path: pkg/server/handlers_public.go
      Note: Public booking handler logging
    - Path: pkg/appointments/service.go
      Note: Booking service boundary logs
    - Path: pkg/appointments/postgres.go
      Note: Repository and persistence boundary logs
    - Path: docs/deployments/hair-booking-coolify-playbook.md
      Note: Long-lived hosted deployment runbook
ExternalSources: []
Summary: Hosted debugging steps for replaying booking failures and correlating them with request and repository logs.
LastUpdated: 2026-03-25T18:03:00-04:00
WhatFor: Use this when a production booking request fails and you need the fastest reliable path to diagnosis.
WhenToUse: Use after any report involving `POST /api/appointments`, hosted booking failures, or missing production diagnostics.
---

# Production Booking Debug Playbook

Use this playbook when `POST /api/appointments` fails on the hosted app and you
need to determine whether the problem is:

- a frontend request shape problem
- an availability or policy conflict
- a booking client resolution problem
- a persistence/database problem

This playbook assumes the hosted environment at:

- `https://hair-booking.app.scapegoat.dev`
- Coolify host `89.167.52.236`
- application UUID `uion8lttbypsijf8ww9b4c3e`

## 1. Reproduce The Request Exactly

Capture the exact payload first. The booking endpoint is:

- `POST /api/appointments`

Replay it from a shell:

```bash
curl -sS -D - -o /tmp/hair-booking-appointment.json \
  -X POST https://hair-booking.app.scapegoat.dev/api/appointments \
  -H 'content-type: application/json' \
  --data '{"intake_id":"7428cb8d-0b7b-49ca-b590-84e363aa11a9","service_id":"fb964f96-5ac4-4e54-8561-59c6b0f5dd77","date":"2026-03-10","start_time":"11:00 AM","client_name":"man","client_email":"wesen@ruinwesen.com"}'

cat /tmp/hair-booking-appointment.json
```

Record:

- HTTP status
- response body
- `X-Request-Id` response header

That request ID is now the main correlation key for logs.

## 2. Read Hosted Logs

SSH to the Coolify host:

```bash
ssh manuel@89.167.52.236
```

Read logs from the running container:

```bash
sudo -n docker logs --tail 200 uion8lttbypsijf8ww9b4c3e-185456125584 2>&1
```

If you have a request ID, narrow to that request:

```bash
sudo -n docker logs --tail 400 uion8lttbypsijf8ww9b4c3e-185456125584 2>&1 | grep '70d94aa6-868d-483e-842c-7d6db8424ec6'
```

Expected log families:

- request completion log
- public booking failure log
- service/repository failure log

## 3. Interpret The New Logs

Request completion log fields:

- `request_id`
- `method`
- `path`
- `status`
- `duration`
- optional auth context

Handler/service/repository logs should explain which layer failed.

Typical interpretation:

- only request log, `status=201`
  - booking succeeded
- request log plus `slot-unavailable`
  - stale or conflicting slot
- request log plus `public appointment client resolution failed`
  - client resolution path is the issue
- request log plus `failed to create appointment`
  - insert/persistence path is the issue

## 4. Inspect The Database Directly

The main tables involved are:

- `intake_submissions`
- `clients`
- `services`
- `appointments`
- `schedule_blocks`
- `schedule_overrides`

Open `psql` in the hosted Postgres container:

```bash
ssh manuel@89.167.52.236
sudo -n docker exec -it go1o5tbegalwy3kesshq3hcp psql -U postgres -d postgres
```

Useful checks:

```sql
select id, service_type, created_at
from intake_submissions
where id = '7428cb8d-0b7b-49ca-b590-84e363aa11a9';

select id, name, category, duration_min, is_active
from services
where id = 'fb964f96-5ac4-4e54-8561-59c6b0f5dd77';

select id, name, email, phone, created_at, updated_at
from clients
where email = 'wesen@ruinwesen.com';

select id, client_id, service_id, intake_id, date, start_time, status
from appointments
where intake_id = '7428cb8d-0b7b-49ca-b590-84e363aa11a9';

select day_of_week, start_time, end_time, is_available
from schedule_blocks
order by day_of_week, start_time;
```

## 5. Failure Classes To Check First

Check these in order:

1. missing or inactive service
2. slot not actually available under schedule blocks or overrides
3. bad start time formatting
4. nullable client data edge cases
5. DB insert failure

## 6. Architecture Reminder

The booking path is:

```text
ClientBookingApp
  -> POST /api/appointments
    -> pkg/server/handlers_public.go
      -> pkg/appointments/service.go
        -> pkg/appointments/postgres.go
          -> PostgreSQL
```

The key implementation files are:

- [handlers_public.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go)
- [service.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go)
- [postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go)
- [http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go)

## 7. Operator Rule

Do not start by guessing from the frontend.

Always:

1. capture the exact payload
2. capture the response `X-Request-Id`
3. check container logs
4. only then inspect database state
