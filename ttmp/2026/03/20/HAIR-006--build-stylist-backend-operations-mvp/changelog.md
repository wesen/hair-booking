# Changelog

## 2026-03-20

- Initial workspace created
- Added detailed implementation guide for the stylist backend operations MVP
- Added granular task list for schema, staff authz, stylist routes, and tests
- Updated the plan to the confirmed single-stylist MVP model and removed multi-staff assumptions
- Added single-stylist authorization bootstrap from OIDC email or subject allowlists
- Added `/api/stylist/me` and shared stylist-session authorization checks
- Added automated tests plus a manual local-Keycloak smoke playbook for stylist auth
- Added `0004_add_intake_reviews.sql` for persisted stylist review state with checked status and priority values
- Validated the new migration by applying the full embedded migration set to a disposable local Postgres database
- Added stylist intake queue, detail, and review update services in `pkg/stylist`
- Added `GET /api/stylist/intakes`, `GET /api/stylist/intakes/:id`, and `PATCH /api/stylist/intakes/:id/review`
- Added service and HTTP tests for intake review flows
- Added a live smoke playbook for stylist intake review, including the nullable left-join bug that surfaced only in browser-backed validation
