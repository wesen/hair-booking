# Changelog

## 2026-03-20

- Initial workspace created
- Added implementation guide for MVP photo workflows
- Added granular task list for backend, frontend, and validation work
- Recorded the roadmap decision that photos remain in MVP but follow HAIR-006 and HAIR-007
- Chose the MVP portal photo surface as appointment history/detail rather than restoring a top-level Photos tab, and kept appointment photo upload stylist-side for MVP
- Added real intake image previews to the stylist intake detail view
- Added real appointment photo rendering to the portal appointments surface using live appointment-detail photo data
- Added a shared backend photo-upload validator for mime type and size enforcement
- Added stylist appointment photo upload support at `POST /api/stylist/appointments/:id/photos`
- Added service and HTTP coverage for intake-photo validation and stylist appointment-photo uploads
- Added a ticket-level photo smoke playbook for manual verification
- Added appointment-photo metadata to the stylist appointment detail payload
- Wired the live stylist runtime to render and upload appointment photos through RTK Query
- Added backend and frontend tests covering stylist appointment photo detail rendering
