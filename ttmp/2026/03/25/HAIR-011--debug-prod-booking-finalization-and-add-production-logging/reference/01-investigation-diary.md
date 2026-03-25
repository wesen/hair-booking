---
Title: Investigation Diary
Ticket: HAIR-011
Status: active
Topics:
    - booking
    - production
    - logging
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go
      Note: Public booking handler that returns `appointment-create-failed`
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go
      Note: Public appointment creation orchestration
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go
      Note: Repository insert path for appointments
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go
      Note: Current startup/shutdown logging only
ExternalSources: []
Summary: Diary for the production booking failure and the follow-on observability work.
LastUpdated: 2026-03-25T17:30:00-04:00
WhatFor: Use this to understand how the hosted bug was reported and why logging became part of the same ticket.
WhenToUse: Use while implementing or reviewing HAIR-011.
---

# Investigation Diary

## 2026-03-25

The user reported a real production symptom from
`https://hair-booking.app.scapegoat.dev`. The relevant sequence was:

1. photo upload initially failed with a retry message
2. retrying the remaining intake photo worked
3. finalizing the booking then failed on `POST /api/appointments`

The user provided the failing request shape directly. The important fields were:

- `intake_id = 7428cb8d-0b7b-49ca-b590-84e363aa11a9`
- `service_id = fb964f96-5ac4-4e54-8561-59c6b0f5dd77`
- `date = 2026-03-10`
- `start_time = 11:00 AM`
- `client_name = man`
- `client_email = wesen@ruinwesen.com`

The response symptom was:

```json
{
  "error": {
    "code": "appointment-create-failed",
    "message": "Failed to create appointment."
  }
}
```

That immediately narrowed the backend surface to the default internal-error
branch in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go`

I then checked hosted logs on the Coolify host with:

```bash
ssh manuel@89.167.52.236 \
  'sudo -n docker logs --tail 200 uion8lttbypsijf8ww9b4c3e-185456125584 2>&1 | tail -200'
```

The result was the more serious operational problem:

- the container only emitted the startup log line
- there were no request logs
- there were no error logs for the failing booking request

That means the bug and the logging problem are coupled. The booking bug might be
small, but production debugging is currently much harder than it should be
because request-level observability is too thin.

I then re-read the booking path in code to establish what an intern needs to
know before debugging it:

- HTTP entrypoint:
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go`
- service orchestration:
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go`
- insert/query persistence:
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go`

The public handler currently maps only three kinds of domain errors explicitly:

- invalid input -> `400`
- not found -> `404`
- slot unavailable -> `409`

Everything else collapses to:

- `500 appointment-create-failed`

and there is no structured error log emitted at that point.

I also confirmed that the server wiring currently has almost no HTTP-layer
observability. The startup command in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go`

does emit process startup/shutdown logs, but the request path in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go`

does not yet add request middleware or request/error instrumentation.

That is enough to justify a dedicated ticket rather than burying the issue in a
single bugfix commit. The system now needs:

- one bug investigation for the appointment create failure
- one production logging baseline so the next production bug is diagnosable
