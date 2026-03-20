# Changelog

## 2026-03-20

Implemented Phase 1 of the frontend integration plan and committed it as `bb46c1b`. Added the shared RTK Query package under `web/src/stylist/store/api/`, registered the API reducer and middleware in the main store, exported a reusable `createAppStore`, and wired test-store scaffolding through the same store factory. Also encoded the backend DTOs and cache tags up front so later booking and portal slices can consume stable hooks instead of inventing endpoint shapes ad hoc.

Validation for this slice required one environment fix: `npm --prefix web run typecheck` initially failed with `sh: 1: tsc: not found` because the workspace did not have `web/node_modules` installed yet. Running `npm --prefix web ci` fixed that, and the follow-up typecheck passed cleanly.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/index.ts — Store factory plus RTK Query reducer and middleware wiring
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/test-utils.ts — Test-store helper now delegates to the real app store factory
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/base.ts — Shared base query, envelope unwrapping, and cache-tag setup
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/types.ts — Backend DTO definitions for current and upcoming frontend slices
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/mappers.ts — Backend-to-widget mapping helpers
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/bookingApi.ts — Booking endpoint definitions
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/portalApi.ts — Portal endpoint definitions

## 2026-03-20

Created HAIR-003 to track the frontend integration work now that the backend API surface is broad enough to support real testing. Added the RTK Query integration guide, captured the initial diary, and replaced the placeholder ticket checklist with a granular implementation plan.

### Related Files

- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/index.md — New frontend integration ticket landing page
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/design-doc/01-hair-booking-frontend-integration-guide.md — Primary RTK Query integration guide
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/reference/01-investigation-diary.md — Frontend integration diary
- /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/tasks.md — Granular frontend integration tasks

## 2026-03-20

- Initial workspace created
