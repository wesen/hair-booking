# Changelog

## 2026-03-20

- Initial workspace created
- Added detailed implementation guide for the stylist frontend operations MVP
- Added granular task list for dashboard, intake review, appointments, client detail, and validation
- Updated the ticket to assume a single-stylist MVP and avoid staff-switching UI
- Added RTK Query endpoint definitions and invalidation rules for stylist dashboard, intake, appointment, and client routes
- Replaced the `/stylist` safe shell with a route-aware runtime workspace backed by real backend reads
- Added real dashboard, intake list/detail, appointment list/detail, and client list/detail skeleton pages with loading and error states
- Removed seeded stylist runtime data from the live `/stylist` route while keeping the imported Storybook app intact
- Validated the slice with `npm --prefix web run typecheck`
- Added intake status/priority filters plus a real inline review form backed by `PATCH /api/stylist/intakes/:id/review`
- Added appointment status/date/client filters plus a real inline operational update form backed by `PATCH /api/stylist/appointments/:id`
- Kept the live stylist runtime on direct RTK Query data instead of reintroducing the old seeded Redux demo slices
- Validated the mutation/filter slice with `npm --prefix web run typecheck`
- Ran the first full browser-backed stylist runtime smoke through `/stylist`, including live intake review and appointment update flows
- Fixed a backend nullable-detail bug exposed by that smoke and revalidated appointment and client detail loading
