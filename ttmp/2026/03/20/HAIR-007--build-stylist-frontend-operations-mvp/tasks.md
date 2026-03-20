# Tasks

## Analysis And Design Decisions

- [ ] Confirm final stylist navigation structure
- [ ] Confirm which presentational widgets are worth reusing versus retiring
- [ ] Confirm stylist route placement under the consolidated app shell
- [x] Confirm stylist workflow assumes one operator and no staff-switching UI

## Data Layer

- [ ] Add stylist endpoint definitions to RTK Query
- [ ] Add view-model mappers for stylist dashboard, intake detail, appointment detail, and client detail
- [ ] Add invalidation rules for intake review and appointment update flows

## Stylist Dashboard

- [ ] Build real dashboard page from `/api/stylist/dashboard`
- [ ] Replace hard-coded dates and counts from the current home page
- [ ] Add loading, empty, and error states

## Intake Queue And Detail

- [ ] Build stylist intake list page
- [ ] Add filter controls for status and priority
- [ ] Build stylist intake detail page
- [ ] Show intake answers, uploaded photos, linked client info, and current review state
- [ ] Wire review mutation

## Appointment Views

- [ ] Build stylist appointment list page
- [ ] Add filter controls for date, status, and client
- [ ] Build stylist appointment detail page
- [ ] Show service, client, intake summary, and notes/prep fields
- [ ] Wire appointment update mutation

## Client Views

- [ ] Build stylist client list page with search
- [ ] Build stylist client detail page with appointments, maintenance, and recent intake context

## Runtime Cleanup

- [ ] Remove seeded stylist domain data from runtime pages
- [ ] Keep Storybook fixtures isolated from runtime hydration
- [ ] Retire or shrink slices that only existed for demo data
- [ ] Avoid introducing staff-switching, assignment, or multi-operator controls

## Testing And Validation

- [ ] Add route/component tests for dashboard and detail pages
- [ ] Run frontend typecheck
- [ ] Run manual stylist smoke flow
