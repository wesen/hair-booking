# Tasks

## Analysis And Decisions

- [x] Confirm final MVP UX for appointment photos in the client portal
- [x] Confirm whether appointment photo upload is stylist-only or also client-visible
- [x] Confirm whether photo URLs need stronger protection in MVP

## Backend

- [ ] Audit current intake photo handlers, DTOs, and tests
- [ ] Add or complete appointment photo create/read endpoints
- [ ] Ensure stylist detail APIs return intake and appointment photo metadata where needed
- [ ] Add validation for mime type, size, and slot values
- [ ] Add backend tests for photo upload and read flows

## Frontend

- [ ] Improve the booking photo step UX for retries and clearer failure states
- [x] Show intake photos in the real stylist intake detail view
- [x] Show appointment photos in the chosen portal MVP surface
- [ ] Ensure all photo views use real API data rather than seeded data

## Validation

- [ ] Add manual smoke steps for intake photos and appointment photos
- [ ] Run `go test ./...`
- [ ] Run `npm --prefix web run typecheck`
