# Changelog

## 2026-03-25

- Created ticket `HAIR-011` for the hosted booking-finalization failure and the missing production logging baseline
- Captured the user-reported `POST /api/appointments` `500 appointment-create-failed` symptom in the ticket
- Recorded that hosted container logs currently show only startup output, which is not enough to debug request-level failures
- Added the main intern-facing analysis, bug report, and implementation guide
- Added a granular task list for bug reproduction, observability, error classification, validation, and operational documentation
- Reproduced the same hosted `500` deterministically with the reported request body
- Narrowed the root cause to nullable `clients.email` and `clients.phone` scans inside `FindOrCreateBookingClient`
- Added a booking-client scan helper that safely handles null email/phone values
- Added regression tests for nullable booking-client scan behavior
- Added HTTP request logging middleware with request IDs, status, duration, and authenticated context
- Added structured booking failure logs in the public handler plus appointment service and repository boundaries
- Added request ID middleware tests and stabilized stale date-based portal tests so the server package remains time-safe
- Deployed commits `d333549` and `9fcd9f4` to the hosted Coolify app by building the new image on the host and updating the app compose tag
- Re-ran the exact previously failing hosted booking request and confirmed it now returns `201` with an `X-Request-Id`
- Added a ticket-local production booking debug playbook and updated the long-lived Coolify deployment playbook with log-reading guidance
