# Tasks

## Analysis And Design Decisions

- [x] Confirm final stylist navigation structure
- [x] Confirm which presentational widgets are worth reusing versus retiring
- [x] Confirm stylist route placement under the consolidated app shell
- [x] Confirm stylist workflow assumes one operator and no staff-switching UI

## Data Layer

- [x] Add stylist endpoint definitions to RTK Query
- [ ] Add view-model mappers for stylist dashboard, intake detail, appointment detail, and client detail
- [x] Add invalidation rules for intake review and appointment update flows
- [x] Add a route-aware stylist runtime shell that reads real backend data

## Stylist Dashboard

- [x] Build real dashboard page from `/api/stylist/dashboard`
- [x] Replace hard-coded dates and counts from the current home page
- [x] Add loading, empty, and error states

## Intake Queue And Detail

- [x] Build stylist intake list page
- [ ] Add filter controls for status and priority
- [x] Build stylist intake detail page
- [x] Show intake answers, uploaded photos, linked client info, and current review state
- [ ] Wire review mutation

## Appointment Views

- [x] Build stylist appointment list page
- [ ] Add filter controls for date, status, and client
- [x] Build stylist appointment detail page
- [x] Show service, client, intake summary, and notes/prep fields
- [ ] Wire appointment update mutation

## Client Views

- [x] Build stylist client list page with search
- [x] Build stylist client detail page with appointments, maintenance, and recent intake context

## Runtime Cleanup

- [x] Remove seeded stylist domain data from runtime pages
- [ ] Keep Storybook fixtures isolated from runtime hydration
- [ ] Retire or shrink slices that only existed for demo data
- [x] Avoid introducing staff-switching, assignment, or multi-operator controls

## Testing And Validation

- [ ] Add route/component tests for dashboard and detail pages
- [x] Run frontend typecheck
- [ ] Run manual stylist smoke flow
