# Tasks

## Analysis And Decisions

- [ ] Confirm whether MVP is single-stylist only or must support assignment now
- [ ] Confirm what staff roles exist in MVP
- [ ] Confirm whether intake review state should live in a dedicated table

## Schema And Migrations

- [ ] Add `staff_users`
- [ ] Add `intake_reviews`
- [ ] Decide whether to add `appointments.stylist_id`
- [ ] Add supporting indexes for stylist queue and search use cases
- [ ] Add local/dev seed data for at least one staff user

## Staff Auth And Authorization

- [ ] Add staff identity bootstrap from OIDC session
- [ ] Add stylist/staff authorization middleware
- [ ] Add `GET /api/stylist/me`
- [ ] Ensure non-staff users cannot access stylist endpoints

## Intake Review APIs

- [ ] Add stylist intake list repository query
- [ ] Add stylist intake detail aggregate query
- [ ] Add stylist intake review upsert/update path
- [ ] Add `GET /api/stylist/intakes`
- [ ] Add `GET /api/stylist/intakes/:id`
- [ ] Add `PATCH /api/stylist/intakes/:id/review`

## Dashboard APIs

- [ ] Add dashboard summary queries and service methods
- [ ] Add `GET /api/stylist/dashboard`

## Appointment APIs

- [ ] Add stylist appointment list query
- [ ] Add stylist appointment detail aggregate query
- [ ] Add stylist appointment update service for status, prep notes, and stylist notes
- [ ] Add `GET /api/stylist/appointments`
- [ ] Add `GET /api/stylist/appointments/:id`
- [ ] Add `PATCH /api/stylist/appointments/:id`

## Client APIs

- [ ] Add stylist client list/search query
- [ ] Add stylist client detail aggregate query
- [ ] Add `GET /api/stylist/clients`
- [ ] Add `GET /api/stylist/clients/:id`

## Testing And Validation

- [ ] Add service tests for staff bootstrap/authz
- [ ] Add service tests for intake review transitions
- [ ] Add service tests for stylist appointment updates
- [ ] Add HTTP tests for authorization and handler validation
- [ ] Run `go test ./...`
