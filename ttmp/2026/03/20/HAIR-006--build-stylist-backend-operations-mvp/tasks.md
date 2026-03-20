# Tasks

## Analysis And Decisions

- [x] Confirm MVP is single-stylist only and does not need assignment yet
- [x] Confirm there is one stylist operator role for MVP
- [x] Confirm intake review state should live in a dedicated table

## Schema And Migrations

- [x] Add `intake_reviews`
- [ ] Keep `appointments` unassigned for MVP and document why `stylist_id` is intentionally omitted
- [ ] Add supporting indexes for stylist queue and search use cases
- [ ] Add local/dev seed data for intake review workflows without introducing stylist rows

## Stylist Auth And Authorization

- [x] Add single-stylist authorization bootstrap from OIDC session or claims
- [x] Add stylist authorization middleware
- [x] Add `GET /api/stylist/me`
- [x] Ensure client users cannot access stylist endpoints

## Intake Review APIs

- [x] Add stylist intake list repository query
- [x] Add stylist intake detail aggregate query
- [x] Add stylist intake review upsert/update path
- [x] Add `GET /api/stylist/intakes`
- [x] Add `GET /api/stylist/intakes/:id`
- [x] Add `PATCH /api/stylist/intakes/:id/review`

## Dashboard APIs

- [x] Add dashboard summary queries and service methods
- [x] Add `GET /api/stylist/dashboard`

## Appointment APIs

- [x] Add stylist appointment list query
- [x] Add stylist appointment detail aggregate query
- [x] Add stylist appointment update service for status, prep notes, and stylist notes
- [x] Add `GET /api/stylist/appointments`
- [x] Add `GET /api/stylist/appointments/:id`
- [x] Add `PATCH /api/stylist/appointments/:id`

## Client APIs

- [x] Add stylist client list/search query
- [x] Add stylist client detail aggregate query
- [x] Add `GET /api/stylist/clients`
- [x] Add `GET /api/stylist/clients/:id`

## Testing And Validation

- [x] Add service tests for stylist bootstrap/authz
- [x] Add service tests for intake review transitions
- [x] Add service tests for stylist appointment updates
- [x] Add HTTP tests for authorization and handler validation
- [x] Run `go test ./...`
