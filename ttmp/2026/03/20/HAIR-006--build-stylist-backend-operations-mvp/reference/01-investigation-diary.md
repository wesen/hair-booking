---
Title: Investigation Diary
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - mvp
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Source review identifying the missing stylist backend
    - Path: pkg/server/http.go
      Note: Current route table showing absence of stylist APIs
    - Path: pkg/db/migrations/0001_init.sql
      Note: Current schema showing absence of stylist review state
ExternalSources: []
Summary: Short diary describing why HAIR-006 was created, and how the plan was simplified after confirming a single-stylist MVP.
LastUpdated: 2026-03-20T10:55:00-04:00
WhatFor: Use this diary to understand the purpose and scope of the stylist backend ticket.
WhenToUse: Use while implementing or reviewing HAIR-006.
---

# Investigation Diary

## 2026-03-20

This ticket was split from HAIR-004 because the backend currently stops at the client boundary. The stylist cannot yet perform operational work through the system.

The critical missing concepts are:

- stylist identity
- stylist authorization
- intake review state
- stylist-facing dashboard and detail endpoints

This ticket adds that missing backend layer without changing the core client booking flow.

Later the product direction was clarified: this is a single-stylist app for MVP. That removes the need for a `staff_users` table, reviewer assignment, and appointment-to-stylist assignment in the first backend slice.

The simplified backend target is:

- one protected stylist capability
- one review record per intake
- no per-appointment stylist ownership field
- no multi-staff routing or queue logic

The first implementation slice focused on auth because every later stylist route depends on a stable answer to "is this browser session allowed to act as the stylist?"

The chosen MVP mechanism is intentionally simple:

- keep Keycloak as the identity provider
- treat stylist access as a backend allowlist
- allow by OIDC email or subject
- skip Keycloak group and role mapping for now

This is a better MVP fit than inventing a `staff_users` table or Keycloak-admin workflow before there is even one stylist-facing screen.

Code added in the first slice:

- auth config support for `HAIR_BOOKING_STYLIST_ALLOWED_EMAILS`
- auth config support for `HAIR_BOOKING_STYLIST_ALLOWED_SUBJECTS`
- `pkg/stylist/authorizer.go` for the single-stylist access rule
- `/api/stylist/me` as the first protected stylist endpoint
- HTTP tests and unit tests for allow/deny behavior

Validation for the slice covered both automated and real-session paths:

- `go test ./...` passed
- unauthenticated `curl /api/stylist/me` returned `401 not-authenticated`
- a real browser login as `alice` through local Keycloak returned `200` from `/api/stylist/me`

This closes the first gating concern for HAIR-006: later stylist routes can now use one shared `currentStylist` guard instead of repeating ad hoc auth checks in each handler.

The next slice added the core schema primitive for stylist workflow state: `intake_reviews`.

The table was added in `0004_add_intake_reviews.sql` with:

- one row per intake through `unique intake_id`
- default `status = 'new'`
- default `priority = 'normal'`
- explicit `check` constraints for both workflow status and priority values

This matters because the intake-review API should not need to invent review state on the fly. A persisted review row gives the stylist queue and detail screens somewhere stable to store triage status, quote ranges, and internal notes.

Validation for the migration used two layers:

- `go test ./...` to keep the embedded migration list in sync
- a disposable Postgres database to apply all embedded migrations in order, including `0004_add_intake_reviews.sql`

The first attempt at the disposable migration check prompted for a password because the shell did not have `PGPASSWORD` set. The rerun succeeded once the local dev password was exported explicitly. That is worth keeping in the diary because the same issue can make future migration validation look like a SQL problem when it is really just shell configuration.

The next major slice made intake review real end-to-end.

Backend additions:

- `pkg/stylist/service.go` for queue/detail/review validation rules
- `pkg/stylist/postgres.go` for intake list, intake detail, and review upsert queries
- `GET /api/stylist/intakes`
- `GET /api/stylist/intakes/:id`
- `PATCH /api/stylist/intakes/:id/review`

This was the first slice in HAIR-006 where a real stylist workflow became visible instead of just a capability check.

The most important debugging note from the slice is that the first browser-backed smoke returned `500` even though `go test ./...` was green. The cause was nullable left-joined `clients` and `intake_reviews` columns in the repository scan path.

That bug mattered because stylist queue data is built from public intake submissions, and those rows do not always have:

- an authenticated client row
- an intake review row yet

The repository code had to normalize null IDs, auth fields, and timestamps before building Go aggregates. This is exactly the kind of issue that the live smoke was supposed to catch.

Final validation for the slice included:

- `go test ./...`
- real OIDC browser session as `alice`
- `GET /api/stylist/intakes` returning `200`
- `GET /api/stylist/intakes/:id` returning `200`
- `PATCH /api/stylist/intakes/:id/review` returning `200`
- `GET /api/stylist/intakes?status=in_review` returning the updated review row

After the intake-review slice, the next useful layer was the stylist dashboard endpoint.

The dashboard design stayed intentionally simple:

- intake counts by review status
- today appointment count
- today appointment list
- upcoming appointment list

This is enough to replace the current mock stylist home dashboard without forcing the backend into a widget-specific shape.

Implementation notes:

- intake counts use the same `coalesce(ir.status, 'new')` rule as the queue
- appointment rows are read from `appointments + clients + services`
- cancelled appointments are excluded
- the service partitions appointment rows into `today_schedule` and `upcoming_appointments`

Live validation for the dashboard used the same local browser session:

- `GET /api/stylist/dashboard` returned `200`
- intake counts reflected the earlier smoke-created `in_review` intake
- the endpoint returned upcoming appointment rows for Alice

The next slice added stylist appointment operations:

- `GET /api/stylist/appointments`
- `GET /api/stylist/appointments/:id`
- `PATCH /api/stylist/appointments/:id`

The detail endpoint aggregates:

- appointment scheduling and status fields
- client profile context
- linked intake submission when one exists

This makes the stylist-side appointment view meaningfully different from the client portal view. The portal only needs "my appointment"; the stylist needs the operational context around that appointment.

The live smoke again paid for itself. The first patch test returned `200` but dropped `client_name` and `service_name` in the response body. The repository update path had returned the raw `appointments` row instead of the enriched join used by the list path.

That got fixed by making the update query return the same joined client/service shape the frontend will expect.

Final validation for the appointment slice:

- `go test ./...`
- real browser session through local OIDC
- `GET /api/stylist/appointments` returned `200`
- `GET /api/stylist/appointments/:id` returned `200`
- `PATCH /api/stylist/appointments/:id` returned `200` with client and service names preserved

The next backend slice filled in the remaining major read model for the stylist-side MVP: clients.

This slice added:

- `GET /api/stylist/clients`
- `GET /api/stylist/clients/:id`
- stylist service DTOs for client list rows, client appointment summaries, and client intake summaries
- repository queries that aggregate client profile, appointment history, intake history, and maintenance plan data

The main design choice here was to return one aggregated client detail payload instead of forcing the future stylist frontend to fan out requests across unrelated packages. The stylist workflow is "search client, open client, review context, act," so the backend should serve that workflow directly.

The list query is intentionally light but operationally useful:

- identity and contact fields
- counts for appointments and intakes
- last appointment date
- next upcoming appointment when one exists
- latest intake review status

The detail query goes deeper and combines:

- the canonical `clients` row
- total appointment and intake counts
- the next upcoming appointment
- recent appointment history
- recent intakes with review state and photo counts
- maintenance plan header and maintenance items

Implementation-wise, the repository uses multiple focused aggregate queries for detail instead of one giant join. That is deliberate. The earlier intake slice already showed that large nullable join graphs are easy to break in ways the test suite can miss until a live smoke reaches the exact row shape. Keeping the client detail loader split into base-profile, upcoming-appointment, recent-appointments, recent-intakes, and maintenance-plan queries makes the scan logic easier to reason about and safer to extend.

Validation for the client slice was automated only in this pass:

- `go test ./...`

I did not rerun the browser-backed OIDC smoke for the client routes in this pass because the local runtime shells had already been torn down. To keep the ticket useful for the next pass, I added a dedicated manual smoke playbook for stylist clients so the route can be replayed quickly once the local stack is back up.

At this point, the remaining HAIR-006 work is narrower infrastructure work rather than feature-surface work:

- supporting indexes for stylist queue and search use cases
- local/dev seed data for stylist workflows
- explicit documentation that `appointments` remains unassigned for the single-stylist MVP

The final HAIR-006 slice handled those remaining support tasks.

The database-side part was intentionally small and explicit:

- `0005_add_stylist_support.sql`
- one table comment on `appointments`
- supporting indexes for stylist queue/detail queries

The schema comment matters because this ticket already made a product decision that `appointments.stylist_id` does not belong in the single-stylist MVP. Recording that in prose alone is too easy to lose. The comment keeps the rationale near the schema:

- all appointments are implicitly owned by the one stylist operator
- assignment would be dead weight until multi-stylist scheduling exists
- future multi-stylist work can add `stylist_id` in a forward migration instead of carrying a mostly-null column now

The index additions were kept conservative and portable:

- `clients(name)`
- `intake_submissions(client_id, created_at desc)`
- `intake_reviews(status, priority, reviewed_at desc)`
- `appointments(client_id, date desc, start_time desc)`
- `maintenance_plans(client_id)`

I considered heavier search-specific indexing, but for the MVP-sized dataset in this repo, the better tradeoff was to add the obvious queue/history support without pulling in extra extension requirements. If client search gets large enough later, trigram indexing can be a focused follow-up.

The more important operational improvement was the new local-only stylist workflow seed path.

I deliberately did not add fake clients, fake intakes, and fake appointments to always-on migrations. That would have made an empty production database look pre-populated with demo salon data on first boot, which is the wrong boundary. Instead, the repo now has:

- `dev/sql/seed_stylist_workflows.sql`
- `scripts/seed_stylist_workflows.sh`
- `make local-seed-stylist-workflows`

The ticket also has a replay copy of the runner script plus a dedicated seed playbook so the intern can reproduce the same setup without searching through shell history.

The seed data itself is deterministic and idempotent:

- three clients
- three intake submissions
- three intake reviews in different statuses
- three future appointments outside the policy window
- one maintenance plan with two items

I validated this slice in three layers:

- `go test ./...`
- `docmgr doctor --ticket HAIR-006 --stale-after 30`
- direct execution of `./scripts/seed_stylist_workflows.sh` against the local Postgres database, which inserted the expected rows cleanly

With that support slice in place, HAIR-006 is effectively complete for the single-stylist backend MVP. The next meaningful implementation ticket is HAIR-007, where the stylist frontend should start consuming the now-real backend routes instead of seeded runtime slices.
