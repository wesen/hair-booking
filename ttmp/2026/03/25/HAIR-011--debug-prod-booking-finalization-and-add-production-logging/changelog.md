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
