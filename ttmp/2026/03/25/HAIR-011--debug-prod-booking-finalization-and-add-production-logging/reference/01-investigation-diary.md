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
LastUpdated: 2026-03-25T18:00:00-04:00
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

Before changing code, I also rechecked the schema and the booking path to narrow
the likely failure classes.

Important findings from the current schema in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0001_init.sql`

are:

- `appointments` has no uniqueness constraint on `(date, start_time)` or
  `(client_id, date, start_time)`
- `appointments.intake_id` is nullable and only a plain foreign key
- `appointments.duration_min_snapshot` is required, but it is populated from the
  chosen service record

That matters because it lowers the probability of some obvious DB failures. The
insert path is still a candidate, but not because of a duplicate-slot
constraint; that constraint does not exist.

I also re-read the appointment-create logic and confirmed:

- the handler maps only invalid input, not-found, and slot-unavailable as
  explicit non-500 cases
- every other error class collapses to `appointment-create-failed`
- there is still no structured error log at the handler, service, or repository
  boundary

The concrete working hypotheses are now:

1. a repository/database error during insert or client creation
2. a stale frontend time slot that should be returning `409`, but is currently
   leaking into an internal error path
3. a date-edge bug, because the reported request used `2026-03-10`, which is in
   the past relative to the current date of this investigation
4. an intake-linking edge after photo retry, where the intake state is valid
   enough to keep the funnel moving but invalid enough to fail later

Those hypotheses are specific enough that the next step should be:

- reproduce the failure with instrumentation
- then patch logging and classification together

I then moved from hypothesis to direct reproduction. Using the exact request
body from the production report, I re-ran the hosted booking request:

```bash
curl -sS -X POST https://hair-booking.app.scapegoat.dev/api/appointments \
  -H 'content-type: application/json' \
  --data '{"intake_id":"7428cb8d-0b7b-49ca-b590-84e363aa11a9","service_id":"fb964f96-5ac4-4e54-8561-59c6b0f5dd77","date":"2026-03-10","start_time":"11:00 AM","client_name":"man","client_email":"wesen@ruinwesen.com"}'
```

That reproduced the same `500 appointment-create-failed` immediately. This
confirms the bug is deterministic for that payload and not merely a one-off UI
state glitch.

I then checked the hosted database directly:

- the intake row exists
- the consult service row exists and is active
- there are zero appointments in the table
- there was no `clients` row yet for `wesen@ruinwesen.com`

That narrowed the failure dramatically. The request is not failing because the
intake or service is missing, and it is not failing after a successful
appointment insert.

I also checked the scheduling angle. The reported booking date `2026-03-10` is
in the past relative to this investigation date, but the current backend does
not reject past public-booking dates explicitly. The seeded hosted schedule has
Tuesday availability from `09:00` to `17:00`, and `2026-03-10` is a Tuesday, so
`11:00 AM` is still a plausible slot under the current logic. That rules out
the simple "past date was correctly rejected" explanation.

The next important boundary is:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go`
- `FindOrCreateBookingClient`

That function was scanning nullable `email` and `phone` columns directly into Go
`string` fields. This is the critical bug. There are two ways it breaks:

1. if no matching client exists, the insert uses `nullif($4, '')` for phone and
   then returns `phone`; scanning `NULL phone` into `string` fails
2. if a matching client exists with `phone IS NULL`, the initial select scan
   also fails before the update path can run

To validate that second branch, I manually inserted a hosted client row for
`wesen@ruinwesen.com` with no phone number. The public booking request still
failed, and the existing client row did not update. That behavior is exactly
what we would expect from a nullable scan failure in the query branch.

The first code fix slice therefore focused on null-safe client scanning. I added
`scanBookingClient(...)` in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go`

The helper uses `sql.NullString` for `email` and `phone`, then converts them
safely into the app `Client` struct. I switched all three booking-client scan
sites to use that helper:

- matching-client query scan
- new-client insert `returning`
- existing-client update `returning`

I also added focused regression coverage in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres_test.go`

The tests prove:

- null email/phone scans do not fail
- concrete email/phone values still round-trip correctly

This first slice does not finish the ticket, but it does establish the first
real root cause and gives the booking flow a concrete bugfix candidate. The
remaining major slice is still the observability slice:

- request middleware
- request IDs
- explicit handler/service/repository error logs

I then implemented that observability slice.

At the HTTP layer, I added a wrapper in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go`

The wrapper now:

- generates a request ID when the caller did not provide one
- preserves an incoming `X-Request-Id` when present
- stores the request ID in request context
- echoes the request ID back in the response header
- records request method, path, status, and duration
- includes authenticated subject, issuer, and only the email domain when auth
  context exists

That last point matters. This ticket is production-facing, so I explicitly kept
the logs useful without dumping raw personally identifiable fields. The request
log includes `example.com`, not `alice@example.com`.

At the handler boundary, I added an explicit error log in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go`

That log captures the exact booking context that operators need:

- request ID
- service ID
- date
- start time
- intake ID when present
- email domain when present

At the service and repository boundaries, I added structured logs in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/postgres.go`

Those logs cover:

- booking client resolution failures
- transaction start failures
- matching-client query failures
- nullable scan failures
- insert/update `returning` scan failures
- appointment time-parse failures
- appointment insert failures
- commit failures

This is the main production observability improvement for HAIR-011. Before this
slice, a production `500` could be real but almost silent. After this slice,
operators should be able to correlate:

1. the request-level access log
2. the handler failure log
3. the repository or service failure log

using the same request ID.

While validating the logging slice, I hit a smaller but important secondary
issue: the new logging made stale portal test dates visible because those tests
were written against fixed March 2026 calendar dates. They had simply aged out.

I fixed those tests in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http_test.go`

The adjustments were:

- compute upcoming and past dates relative to `time.Now().UTC()` for the portal
  listing filter test
- compute the reschedule target as the next Monday because the fake repository
  only exposes Monday availability from `09:00` to `11:00`
- add request ID middleware tests proving both generated and preserved
  `X-Request-Id` behavior

After those changes:

- `go test ./pkg/appointments ./pkg/server` passed
- `go test ./...` passed

This matters for the intern because it demonstrates a recurring maintenance
pattern:

- production instrumentation work often exposes unrelated test fragility
- the right fix is usually to make the test time-stable, not to weaken the new
  instrumentation

After the local code and test checkpoints were green, I deployed the fix to the
hosted Coolify app so the ticket could be validated against the real failing
payload instead of a local substitute.

The repo remote for this project is `wesen`, not `origin`, so the correct push
was:

```bash
git -C /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking push wesen task/hair-signup
```

The Coolify app did not auto-roll forward immediately, so I used the host-side
operator path:

1. archive the committed repo tree locally
2. copy it to `/tmp/hair-booking-deploy` on `89.167.52.236`
3. build a new image on the host tagged with the exact commit SHA
4. update the Coolify app compose file image tag
5. recreate the container with `docker compose up -d`

The exact deployed app image became:

- `uion8lttbypsijf8ww9b4c3e:9fcd9f4f127058586e0949aac3ed86684e3dbd9d`

That matters because it proves the hosted validation was not against a stale
image.

I then re-ran the exact production request that originally failed:

```bash
curl -sS -D - -o /tmp/hair011_appointment_response.txt \
  -X POST https://hair-booking.app.scapegoat.dev/api/appointments \
  -H 'content-type: application/json' \
  --data '{"intake_id":"7428cb8d-0b7b-49ca-b590-84e363aa11a9","service_id":"fb964f96-5ac4-4e54-8561-59c6b0f5dd77","date":"2026-03-10","start_time":"11:00 AM","client_name":"man","client_email":"wesen@ruinwesen.com"}'
```

The result changed from the original `500` to:

- `201 Created`
- request header `X-Request-Id: 70d94aa6-868d-483e-842c-7d6db8424ec6`

The response body now included a real appointment:

- `id = a722f588-44d1-4c5a-9908-f3d94923de9f`
- `client_id = e31c0518-4c3a-4a89-a7a8-6c073860a392`
- `service_id = fb964f96-5ac4-4e54-8561-59c6b0f5dd77`
- `intake_id = 7428cb8d-0b7b-49ca-b590-84e363aa11a9`
- `status = pending`

I then checked hosted logs again:

```bash
ssh manuel@89.167.52.236 \
  'sudo -n docker logs --tail 120 uion8lttbypsijf8ww9b4c3e-185456125584 2>&1'
```

This time the container emitted the expected request-level lines, including:

- startup log
- `/healthz` request log
- `POST /api/appointments` request log with `status=201`

That closes the original operational gap. Earlier in the ticket, the same log
command returned only the startup line. After HAIR-011 logging landed, the same
container now provides enough information to debug request-level failures.

At this point the core ticket conclusion is:

- the booking failure was fixed by the null-safe booking-client scan patch
- the production observability gap was fixed by the request/error logging slice

The remaining value in HAIR-011 is mostly durable operator documentation, so I
added:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/25/HAIR-011--debug-prod-booking-finalization-and-add-production-logging/playbooks/01-production-booking-debug-playbook.md`

and updated the long-lived deployment runbook in:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify-playbook.md`

so the next operator has a concrete path for:

1. replaying a booking request
2. extracting the request ID
3. reading hosted logs
4. checking database state
