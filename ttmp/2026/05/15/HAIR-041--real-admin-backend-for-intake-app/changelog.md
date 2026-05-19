# Changelog

## 2026-05-15

- Initial workspace created


## 2026-05-16

Step 1: Created HAIR-041 planning package with intern-facing real Admin backend guide, ASCII screen inventory, persistence plan, component-readiness assessment, and phased tasks.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/01-real-admin-backend-implementation-guide.md — Main planning/design guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Implementation diary
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md — Phased task plan


## 2026-05-16

Step 2: Added pkg/intakeadmin persistent schema and store for intake requests, request events, admin audit events, admin flow sessions, dashboard stats, config draft creation, and publish validation. Validation: go test ./pkg/intakeadmin -count=1.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/intakeadmin/schema.sql — Persistent admin domain schema
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/intakeadmin/store.go — App-owned intake admin store and config draft/publish methods
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/intakeadmin/store_test.go — Store regression tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records persistence step


## 2026-05-16

Step 3: Wired customer intake confirm to persist real intake_requests via host/intake, added per-session dslgoja native module factories, provisioned admin schema on server startup, and covered the HTTP confirm-to-row path. Validation: go test ./pkg/dslgoja ./pkg/server ./pkg/intakeadmin -count=1.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/flows/intake.flow.js — Confirm step submits real request
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/host.go — Runtime host module factory support
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/modules_dsl.go — Registers app-owned native modules per flow session
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl.go — Installs host/intake into customer DSL runtime
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl_test.go — HTTP regression for confirm creating intake request
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/host_intake_module.go — host/intake bridge for durable customer submissions
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/http.go — Creates intake admin store and provisions schema
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records customer submission persistence


## 2026-05-16

Step 4: Added Admin DSL host module support, intake admin host modules, intake-preview stub, admin flow registry, /admin/intake frontend route, and first real intake admin dashboard flow. Validation: go test ./pkg/admindsl ./pkg/server ./pkg/intakeadmin ./pkg/dslgoja -count=1; cd web && npx tsc --noEmit; cd web && pnpm test -- --runInBand (10 files, 43 tests passed).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/builder.go — Builder helpers for dashboard/admin flow primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows.go — Embeds intake admin flow source
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_admin.flow.js — First real intake admin dashboard/config/preview flow
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/goja_module.go — Exports additional Admin DSL builders to Goja
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/script_runtime.go — Admin runtime native module registration
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl.go — Admin flow registry
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl_test.go — HTTP regression for real intake admin flow
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/host_intake_admin_module.go — host/intake-admin and host/intake-preview modules
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records Admin runtime host module step
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/App.tsx — /admin/intake route
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/BackendAdminDslPage.tsx — Flow-id configurable backend Admin DSL page


## 2026-05-16

Step 5: Completed Phase 1-4 validation and uploaded HAIR-041 design/tasks bundle to reMarkable at /ai/2026/05/15/HAIR-041/HAIR 041 Real Intake Admin Backend Guide.pdf. Validation: go test ./... -count=1; cd web && npx tsc --noEmit; cd web && pnpm test -- --runInBand (10 files, 43 tests passed).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/01-real-admin-backend-implementation-guide.md — Uploaded design guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records validation and reMarkable upload
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md — Updated Phase 1-4 task status


## 2026-05-16

Step 6: Started Phases 5-6 by adding Admin DSL resourceTable and imageGallery primitives, rendering request/config tables, adding request detail/status actions, exposing host/intake-admin get/update APIs, and testing table row dispatch plus real request detail routing. Validation: go test ./pkg/admindsl ./pkg/server ./pkg/intakeadmin -count=1; cd web && npx tsc --noEmit; cd web && pnpm test -- --runInBand (10 files, 44 tests passed).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/builder.go — Go builders for resourceTable and imageGallery
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_admin.flow.js — Dashboard
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/goja_module.go — Goja exports for new Admin DSL primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/types.go — resourceTable and imageGallery node kinds
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/validate.go — Validation whitelist for new node kinds
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl_test.go — Request-detail dispatch regression
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/host_intake_admin_module.go — Request get/update host APIs and JSON-shaped exports
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/host_intake_module.go — JSON-shaped customer request export
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records Phase 5-6 screen/component work
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDsl.test.tsx — resourceTable row dispatch coverage
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — resourceTable and imageGallery renderer
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/schema.ts — Frontend schema node kinds


## 2026-05-16

Step 7: Completed the Phase 6 photo modal path by making imageGallery actionable, dispatching selected image values, adding a photoViewer modal with missing-photo state, and adding frontend coverage. Validation: go test ./pkg/admindsl ./pkg/server ./pkg/intakeadmin -count=1; cd web && npx tsc --noEmit; cd web && pnpm test -- --runInBand (10 files, 45 tests passed).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_admin.flow.js — Photo viewer modal and missing-photo state
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records photo modal work
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md — Phase 6 photo modal task completed
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDsl.test.tsx — Gallery dispatch regression coverage
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Actionable imageGallery renderer


## 2026-05-16

Step 8: Added dedicated Storybook catalog for new Admin DSL data primitives resourceTable and imageGallery, including dense/mobile/empty/modal/missing-photo/composed request-review states. Validation: cd web && npx tsc --noEmit; cd web && pnpm test -- --runInBand (10 files, 45 tests passed).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records Storybook coverage step
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md — Tracks Storybook coverage for new primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDslDataComponents.stories.tsx — Storybook catalog for resourceTable and imageGallery
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/builder.ts — Frontend builder helpers for new data components


## 2026-05-16

Step 9: Completed Phase 5 component-gap pass with actionable tabs/filter/search, editableList, monthAvailabilityGrid, previewFrame, diffView, resourceTable pagination/bulk UI, duplicate side-surface cleanup, request queue filter/search wiring, and extensive Storybook coverage. Validation: go test ./... -count=1; cd web && npx tsc --noEmit; cd web && pnpm test -- --runInBand (10 files, 46 tests passed).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/builder.go — Go builders for Phase 5 primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_admin.flow.js — Request queue filter/search wiring
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/goja_module.go — Goja exports for Phase 5 primitives and controls
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/types.go — Phase 5 node kind additions
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/validate.go — Validation for Phase 5 node kinds
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md — Diary records Phase 5 completion
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md — Phase 5 tasks marked complete
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDsl.test.tsx — Actionable filter/search regression coverage
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDslAdvancedComponents.stories.tsx — Storybook coverage for Phase 5 primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/builder.ts — Frontend builder helpers for advanced primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Renderer support for actionable controls
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/schema.ts — Frontend schema for advanced primitives


## 2026-05-16 — Admin DSL deep-dive report

- Added and committed an Obsidian project report explaining the backend-driven Admin DSL technique and HAIR-041 intake admin implementation pressure test.
- Report path: `/home/manuel/code/wesen/go-go-golems/go-go-parc/Projects/2026/05/16/PROJECT REPORT - Fringe Admin DSL Backend Driven Admin Interfaces Deep Dive.md`.
- Vault commit: `cd75f55 Add Fringe Admin DSL backend-driven interfaces report`.

## 2026-05-16 — Report delivery and Phase 7 config publishing slice

- Uploaded the Admin DSL backend-driven interfaces report to reMarkable at `/ai/2026/05/16/HAIR-041/HAIR 041 Admin DSL Backend Driven Interfaces Deep Dive.pdf`.
- Cross-linked the newer backend-driven report from the prior Admin DSL renderer report in the PARC vault (commit `4114f22`).
- Added first-pass Phase 7 config editor and publishing flow for `/admin/intake` (commit `b6eab66`): config editor data, tabbed config sections, validation report, draft creation, publish modal, publish transaction, and config audit events.

## 2026-05-16 — Service config editor mutation

- Added the first live Phase 7 config edit mutation (commit `126b3be`): draft service options now open in an Admin DSL drawer form, validate required fields, save through `host/intake-admin.updateServiceOption`, update SQLite config rows, and write admin audit events.
- Validation passed with `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1` and `go test ./... -count=1`.

## 2026-05-16 — Tone config editor mutation

- Added draft tone option editing for the `/admin/intake` config screen (commit `4ca5045`): tone rows open a drawer form, validate required fields, save through `host/intake-admin.updateToneOption`, persist to SQLite, and record admin audit events.
- Validation passed with `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1` and `go test ./... -count=1`.

## 2026-05-16 — Complete Phase 7 config editors

- Added update mutations for budgets, price ranges, availability days, and time slots (commit `735c64e`).
- Added create/delete support across services, tones, budgets, price ranges, availability days, and time slots (commit `5d484e6`).
- Marked Phase 7 resource editor tasks complete with reorder represented as editable sort order for this slice.
- Validation passed with `go test ./... -count=1`, `cd web && npx tsc --noEmit`, and `cd web && pnpm test -- --runInBand`.

## 2026-05-16 — Add follow-up hardening backlog

- Added HAIR-041 Phase 10 follow-up tasks for known hardening issues: flow module splitting, delete confirmations, semantic form controls, drag/reorder, Playwright/visual coverage, admin auth, upload ownership, audit atomicity, session persistence, audit payloads, and accessibility review.

## 2026-05-16 — Split intake admin config flow module

- Added embedded Admin DSL script-module support and split the Phase 7 config editor into `pkg/admindsl/flows/intake_config.flow.js` (commit `dbc6204`).
- Registered the config module as `fringe/admin-flows/intake-config` and kept the root intake admin flow focused on navigation/request/preview screens.

## 2026-05-16 — Audit and health screens

- Added `/admin/intake` audit-log and health-diagnostics screens backed by `host/intake-admin` store queries (commit `8876ddf`).
- Marked Phase 8 audit-log and health-diagnostics tasks complete.

## 2026-05-16 — Relative Admin DSL flow requires

- Added virtual embedded module resolution for relative Admin DSL flow helper imports such as `require("./intake_config.flow.js")` (commit `8c7e698`).
- Root flow sources now load with stable virtual filenames via `StartFlowNamed(...)`, and helper modules are loaded from `WithScriptModule(...)` sources through the Goja require source loader.

## 2026-05-16 — Split request and ops flow helpers

- Split request queue/detail code into `pkg/admindsl/flows/intake_requests.flow.js` and audit/health/preview code into `pkg/admindsl/flows/intake_ops.flow.js` (commit `987ff70`).
- Root `intake_admin.flow.js` now acts as the screen router/dashboard and requires focused helper modules.

## 2026-05-16 — Split config helper and form modules

- Split config editor helpers into `pkg/admindsl/flows/intake_config_helpers.flow.js` and drawer/form builders into `pkg/admindsl/flows/intake_config_forms.flow.js` (commit `81a2698`).
- Registered the new embedded modules and revalidated the Admin DSL runtime/server packages plus `go test ./... -count=1`.

## 2026-05-16 — Module registry and draft preview bridge

- Centralized embedded Admin DSL flow module registration in `pkg/admindsl/flows.go` (commit `99b0505`).
- Added draft customer intake preview bridge from `/admin/intake` to the real customer DSL route using `previewConfigVersionId` (commit `e43d337`).
- Validation passed with `go test ./... -count=1`, `cd web && npx tsc --noEmit`, and `cd web && pnpm test -- --runInBand`.

## 2026-05-16 — Phase 8 admin intake smoke

- Added and ran a ticket-local Playwright smoke script for customer-submit -> admin-review.
- Captured dashboard and request-queue screenshots in `various/playwright/`.
- Marked the Phase 8 submit-to-admin smoke task complete.

## 2026-05-16 — Dense admin layout reference analysis

- Copied user-provided target and current/original admin layout screenshots into `various/design-reference/`.
- Added `design-doc/02-admin-layout-density-reference-analysis.md` comparing the layouts and proposing Admin Workbench DSL constructs: sidebar shell, page header, dashboard grid, structured panels, richer resource tables, comparison table, month calendar, activity feed, action placement, and density policies.

## 2026-05-16 — Admin Workbench DSL intern guide

- Added `design-doc/03-admin-workbench-dsl-intern-implementation-guide.md`, a detailed intern-oriented analysis/design/implementation guide for evolving Admin DSL toward dense workbench-style pages.
- Related the guide to the target/current screenshots and core Admin DSL schema/runtime/renderer files.
- Uploaded the guide to reMarkable: `/ai/2026/05/16/HAIR-041/HAIR 041 Admin Workbench DSL Intern Guide.pdf`.

## 2026-05-16 — Admin DSL v2 cleanup intern guide

- Added `design-doc/04-admin-dsl-v2-cleanup-and-workbench-semantics-intern-guide.md`, a separate intern-oriented guide for the breaking Admin DSL v2 cleanup and semantic workbench cutover.
- Related the guide to core Admin DSL schema/runtime/renderer/flow files and the previous workbench implementation guide.
- Uploaded the guide to reMarkable: `/ai/2026/05/16/HAIR-041/HAIR 041 Admin DSL v2 Cleanup Intern Guide.pdf`.

## 2026-05-16 — Admin DSL v2 phased task plan

- Added detailed HAIR-041 Phase 11–15 tasks for Admin DSL v2 vocabulary planning, frontend renderer/Storybook work, Go schema/builders/validation, flow migration, and live validation/cleanup.

## 2026-05-16 — Admin DSL v2 frontend workbench fixture

- Added frontend Admin DSL v2 fixture support: `pageHeader`, `dashboardGrid`, `comparisonTable`, `monthCalendar`, workbench shell/sidebar, strengthened panels, and v2 table cell rendering.
- Added `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` with target desktop and mobile workbench stories.
- Validation passed with `cd web && npx tsc --noEmit` and `cd web && pnpm test -- --runInBand`.

## 2026-05-16 — Admin DSL v2 renderer tests

- Added frontend tests for v2 workbench shell/sidebar dispatch, page header actions, typed resource-table cells, comparison-table review actions, and month-calendar date selection.
- Validation passed with `cd web && npx tsc --noEmit` and `cd web && pnpm test -- --runInBand` (50 tests).

## 2026-05-16 — Go Admin DSL v2 builders and exports

- Added Go Admin DSL v2 node constants/action placements, builder helpers, layout/density helpers, and Goja exports for page header, dashboard grid, comparison table, and month calendar.
- Added Go builder and Goja module tests for v2 workbench nodes.
- Validation passed with `go test ./pkg/admindsl -count=1` and `go test ./pkg/admindsl ./pkg/server -count=1`.

## 2026-05-16 — Admin DSL v2 Storybook catalog and mobile review

- Expanded `AdminDslWorkbench.stories.tsx` with a broader v2 workbench catalog: service operations, request triage, draft review, calendar publishing, typed forms, empty/error states, audit workbench, and dense mobile operations.
- Added `scripts/04-capture-admin-dsl-v2-storybook.mjs` and captured Storybook iframe screenshots without Storybook chrome into `various/storybook-v2/`.
- Improved mobile workbench rendering: topbar replaces sidebar, resource/comparison tables collapse into labeled card rows, touch targets and badge contrast improved, and mobile heading scale tightened.
- Tightened v2 validation for required props, table columns/row IDs, comparison rows, month calendar month, and typed field values.

## 2026-05-17 — Admin DSL v2 aesthetic polish and services flow migration

- Copied user-provided clean aesthetic references into `various/aesthetic-reference/`.
- Refined action styling so only explicit primary actions get black pill treatment; row/footer actions render as lighter link-style controls.
- Improved badge contrast and mobile touch targets.
- Migrated `pkg/admindsl/flows/services.flow.js` to `schemaVersion: 2` workbench primitives (`pageHeader`, `dashboardGrid`, `panel`, `resourceTable`).
- Updated service flow tests for the v2 resource table shape and re-captured Storybook v2 screenshots.

## 2026-05-17 — Service-list and button aesthetic refinement

- Added current/target service-list and button-shape references to `various/aesthetic-reference/`.
- Refined v2 table rendering so status cells read as inline colored text and row overflow actions are plain ellipsis controls.
- Adjusted action button shapes away from full pills toward rounded rectangles, with softer form primary buttons and subtle row/footer actions.
- Re-captured Storybook v2 screenshots after the aesthetic pass.

## 2026-05-17 — Live intake admin flow migration to Admin DSL v2

- Migrated live `/admin/intake` dashboard, requests, config, audit, health, preview, and drawer fallback surfaces to schema v2 workbench primitives.
- Replaced real-flow uses of `section`, `cardGrid`, `summaryCard`, `editableList`, `monthAvailabilityGrid`, and `diffView` with `pageHeader`, `dashboardGrid`, `panel`, `resourceTable`, `comparisonTable`, and `monthCalendar`.
- Updated admin DSL HTTP test action lookup to find v2 action placements such as `footerActions` and `toolbarActions`.
- Re-ran full Go/frontend validation and the Phase 8 customer-submit-to-admin smoke; refreshed live admin screenshots.

## 2026-05-17

Step 34: Migrated live /admin/intake flow family to Admin DSL v2 workbench primitives and refreshed live smoke screenshots

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_admin.flow.js — v2 dashboard migration
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_config.flow.js — v2 config editor migration
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_requests.flow.js — v2 request flow migration


## 2026-05-17 — Go Admin DSL v2-only cutover

- Made Go Admin DSL pages default to `schemaVersion: 2` and made validation reject non-v2 pages.
- Removed deprecated v1-style node constants/builders and Goja exports from `pkg/admindsl`.
- Rewrote backend builder, Goja, and script-runtime tests to use v2 workbench primitives.
- Verified with `go test ./... -count=1`.

## 2026-05-17

Step 35: Cut Go Admin DSL builder/validation/Goja module to schema v2 only

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/builder.go — Default page schemaVersion is now 2 and deprecated builders were removed
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/goja_module.go — Removed deprecated v1 helper exports from embedded admin scripts
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/validate.go — ValidatePage now requires schemaVersion 2 and rejects deprecated node kinds


## 2026-05-17 — Frontend Admin DSL v2-only cleanup

- Made the TypeScript Admin DSL schema and builders v2-only.
- Removed frontend renderer branches for deprecated v1 primitives.
- Rewrote shared admin examples and scenario fixtures to v2 workbench/resource-table primitives.
- Deleted obsolete v1 Storybook catalogs and the legacy layout examples file.
- Updated frontend tests for v2 dispatch shapes; verified TypeScript, frontend tests, and full Go tests.

## 2026-05-17

Step 36: Removed frontend v1 Admin DSL builders/renderer branches/stories and rewrote shared fixtures to v2

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/builder.ts — Removed deprecated frontend builders
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/examples.ts — Shared examples rewritten to v2
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Removed deprecated renderer branches
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/schema.ts — TypeScript schema is now v2-only


## 2026-05-17 — Post-cutover visual and smoke refresh

- Re-ran Admin DSL Workbench v2 Storybook iframe screenshot capture successfully.
- Re-ran the Phase 8 customer-submit-to-admin smoke successfully.
- Refreshed live admin dashboard and request screenshots under `various/playwright/`.

## 2026-05-17 — Resource-table alignment guide

- Added `reference/02-admin-dsl-resource-table-alignment-guide.md`, a textbook-style guide for Request Triage table baseline alignment and `Assign` bulk action styling.
- Stored the motivating Request Triage screenshot under `various/alignment-reference/`.
- Related the guide to the relevant Admin DSL Storybook, builder, schema, renderer, and action helper files.

## 2026-05-17 — Admin DSL formal grammar exploration guide

- Added `design-doc/05-admin-dsl-formal-grammar-and-compiler-exploration-guide.md`, a textbook-style exploratory research guide for formal Admin DSL grammar, AST, and compiler/code-generation approaches.
- Related the guide to the current Admin DSL Go types/builders/validation/runtime, protobuf transport, server handlers, frontend schema/builders/client/renderer, and Storybook workbench files.
- Uploaded `HAIR 041 Admin DSL Grammar Exploration Guide.pdf` to reMarkable at `/ai/2026/05/17/HAIR-041`.

## 2026-05-17 — Admin DSL compiler architecture research report

- Added `design-doc/06-admin-dsl-compiler-architecture-research-report.md`, a textbook-style research report that reframes Admin DSL grammar work as a real compiler architecture with typed ASTs, contextual action types, Core Admin IR, and target backends.
- Related the report to the current Admin DSL Go runtime, builder, validation, Goja, protobuf, frontend schema, builder, renderer, action, backend bridge, and Storybook files.
- Uploaded `HAIR 041 Admin DSL Compiler Architecture Research Report.pdf` to reMarkable at `/ai/2026/05/17/HAIR-041`.

## 2026-05-17 — UI DSL meta-spec compiler implementation guide

- Added `design-doc/07-ui-dsl-meta-spec-compiler-implementation-guide.md`, a corrected intern-facing design/implementation guide for a meta-level compiler that defines UI DSL vocabularies rather than only compiling Admin DSL pages.
- The guide covers shell types, node types, prop schemas, child rules, action types, action slots, action contexts, renderer contracts, backend-owned action execution, and Go/TypeScript/protobuf/docs/test generation targets.
- Related the guide to current Admin DSL backend, frontend, protobuf, renderer, action bridge, and Storybook files.
- Uploaded `HAIR 041 UI DSL Meta Spec Compiler Guide.pdf` to reMarkable at `/ai/2026/05/17/HAIR-041`.

## 2026-05-18 — Admin DSL React widget IR catalog

- Added `design-doc/08-admin-dsl-react-widget-ir-catalog.md`, a widget-level IR catalog for rebuilding the Admin DSL renderer from the current monolithic `render.tsx` into explicit React widgets.
- The catalog maps current Admin DSL constructs to atom/molecule/organism widgets, props, contextual action slots, usage scenarios, Storybook story plans, and one-directory-per-widget file layouts.
- The document also captures the artifact-pass model from `meta-dsl-comments.md`: passes are defined by required and produced artifacts rather than one fixed consecutive pipeline.

## 2026-05-18 — React widget IR YAML artifacts

- Added `sources/admin-dsl-widget-ir/*.yaml`, a machine-readable YAML version of the Admin DSL React widget IR catalog.
- Split the catalog into index, pass model, shared types, shell widgets, action widgets, layout widgets, resource widgets, data-display widgets, media widgets, calendar widgets, form widgets, surface widgets, renderer adapter plan, Storybook scenario matrix, and unsupported constructs.
- Validated all YAML files with Python/PyYAML so follow-up scripts can load them directly.

## 2026-05-18 — Widget IR scaffold generator

- Added `scripts/05-scaffold-admin-dsl-widgets.py`, a Python scaffold generator that reads Admin DSL widget IR YAML files and emits React widget scaffolds.
- Generated compile-safe initial scaffolds under `web/src/admin-dsl/widgets/` for shell, action, layout, and resource widget categories.
- Generated shared widget/action/context types plus one directory per widget with `.types.ts`, `.tsx`, `.stories.tsx`, and `index.ts` files.
- Validated the generated code with `cd web && npx tsc --noEmit`.

## 2026-05-18 — Enriched widget scaffold provenance and intent

- Updated `scripts/05-scaffold-admin-dsl-widgets.py` so generated files include provenance headers with generator path, generation time, source YAML path, source YAML last commit, and target file previous commit.
- Updated generated component scaffolds to visibly render widget classification, purpose, human notes, action slots, and implementation warnings.
- Added `XXX` markers to generated scaffold files where placeholder implementation or generated contracts require human replacement/review.
- Enriched shell/action/layout/resource widget YAML artifacts with natural-language `human_notes`, action-slot intent, callback prop hints, implementation notes, and `xxx` warnings.
- Re-ran scaffold generation for shell/action/layout/resource widgets and validated with `cd web && npx tsc --noEmit`.

## 2026-05-18 — Widget Definition IR YAML schema v2

- Migrated `sources/admin-dsl-widget-ir/03-shell-widgets.yaml` to `schema_version: 2` with sectioned widget definitions: `source_mapping`, `intent`, `contract`, `examples`, `stories`, `outputs`, and `implementation_todos`.
- Added `design-doc/09-widget-definition-ir-yaml-format-spec.md`, a detailed specification for the widget definition IR YAML format.
- Validated the updated shell YAML with PyYAML and validated the spec frontmatter with docmgr.

## 2026-05-18 — Migrate all widget IR YAML files to schema v2

- Migrated action, layout, resource, data-display, media, calendar, form, and surface widget YAML files to `schema_version: 2` and `artifact_type: admin_dsl_widget_definition_ir`.
- Updated index/pass-model/shared-types/renderer-plan/storybook-matrix/unsupported-constructs YAML files to schema v2 support artifact types.
- Updated `00-index.yaml` with artifact type and schema version metadata for each file.
- Updated `design-doc/09-widget-definition-ir-yaml-format-spec.md` to document support artifact files alongside widget definition files.
- Validated all YAML files in `sources/admin-dsl-widget-ir/` with PyYAML.

## 2026-05-18 — Fill non-shell widget YAML intent

- Replaced generated placeholder TODO text in non-shell widget definition YAML files with concrete first-pass intent, prop docs, action-slot docs, story docs, assertions, examples, implementation notes, and accessibility notes.
- Validated all widget IR YAML files with PyYAML and confirmed widget definition entries no longer contain `TODO` placeholder text.

## 2026-05-18 — Update schema-v2 widget scaffold generator

- Reworked `scripts/05-scaffold-admin-dsl-widgets.py` to consume schema-v2 Widget Definition IR directly.
- Generated TypeScript prop contracts from `contract.props` instead of old raw prop snippets.
- Generated component scaffolds and Storybook stories from `intent`, `contract.action_slots`, `examples`, `stories`, and `outputs`.
- Regenerated widget scaffold files under `web/src/admin-dsl/widgets/` and validated them with `cd web && npx tsc --noEmit`.

## 2026-05-18 — Extract WorkbenchShell widget from renderer

- Replaced the generated WorkbenchShell scaffold body with the real shell frame markup/styles extracted from `web/src/admin-dsl/render.tsx`.
- Updated `render.tsx` so workbench rendering adapts Admin DSL page/sidebar JSON into typed `WorkbenchShell` props and lowers sidebar callbacks back to `dispatchAdminAction`.
- Validated the extraction with `cd web && npx tsc --noEmit`.

## 2026-05-18 — Preserve widget metadata beside implementations

- Added a WorkbenchShell metadata sidecar so the real widget implementation keeps its schema-v2 intent, adapter boundary, action-slot contract, examples, todos, and source mapping nearby.
- Updated the widget scaffold generator to emit `<Widget>.metadata.ts` sidecars and re-export metadata from generated barrels.
- Validated the generator with `python3 -m py_compile`, a dry run for `ActionButton`, and `cd web && npx tsc --noEmit`.

## 2026-05-18 — Add widget implementation playbook and Obsidian report

- Added `reference/03-widget-ir-to-finished-widget-playbook.md`, a ticket playbook for taking schema-v2 Widget IR YAML to finished React widgets while preserving metadata, adapter boundaries, action contexts, Storybook coverage, validation, and commit hygiene.
- Added Obsidian article/report `Projects/2026/05/18/ARTICLE - Report - Bottom-Up Admin DSL Widget IR.md` in `/home/manuel/code/wesen/obsidian-vault` and committed it there as `38c4285`.
- Incorporated the report framing: `compiler`, `ui-dsl`, and “First IR extracted from render.ts to YAML to then codegen to TSX”.

## 2026-05-18 — Harden WorkbenchShell Storybook variants

- Replaced generated same-args WorkbenchShell stories with distinct desktop, mobile, long-navigation, no-user, and action-dispatch fixtures.
- Moved WorkbenchShell mobile topbar/sidebar responsive rules into the widget so standalone stories do not depend on renderer-level CSS injection.
- Validated with `cd web && npx tsc --noEmit` and `cd web && npx storybook build --quiet`.

## 2026-05-18 — Update widget playbook with Storybook and diary workflow

- Expanded `reference/03-widget-ir-to-finished-widget-playbook.md` to cover generated-story limitations, meaningful Storybook fixtures, callback probes, widget-local responsive CSS, Storybook build validation, explicit commit boundaries, and diary/changelog expectations.

## 2026-05-18 — Extract DefaultAdminShell widget

- Promoted `DefaultAdminShell` from generated scaffold to real fallback shell implementation.
- Added `DefaultAdminShell.metadata.ts` and exported it from the widget barrel.
- Updated `render.tsx` so the non-workbench fallback path adapts `AdminPage` into typed `DefaultAdminShell` props.
- Replaced generated DefaultAdminShell same-args stories with distinct main-only, side-surface, calendar, and mobile-side-column fixtures.
- Validated with `cd web && npx tsc --noEmit`, `cd web && npx storybook build --quiet`, and `cd web && pnpm test -- --runInBand`.

## 2026-05-18 — Clarify targeted widget regeneration workflow

- Updated the widget implementation playbook to distinguish schema-v2 YAML migration from stale generated scaffold files.
- Added guidance for targeted regeneration of scaffold-only widgets before hand implementation, using ActionButton and ActionGroup as examples.

## 2026-05-18 — Regenerate and implement action widgets

- Target-regenerated `ActionButton` and `ActionGroup` from schema-v2 `04-action-widgets.yaml`, including metadata sidecars.
- Promoted `ActionButton` and `ActionGroup` from scaffold diagnostics to real action-rendering widgets.
- Updated `render.tsx` so `renderActions(...)` delegates visual rendering to `ActionGroup` while keeping backend dispatch in the renderer adapter.
- Hardened ActionButton and ActionGroup stories with distinct action states, mobile/wrapping scenarios, and callback probes.
- Validated with `cd web && npx tsc --noEmit`, `cd web && pnpm test -- --runInBand`, and `cd web && npx storybook build --quiet`.

## 2026-05-18

Step 66-67: Added Admin DSL design-language IR/generator and refactored promoted shell/action widgets to consume generated helpers (commits 9a1f847, 4bf24e9).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/06-generate-admin-dsl-design-language.py — Design-language generator
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/15-design-language.yaml — Design-language IR source
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/atoms/ActionButton/ActionButton.tsx — Action button design helper consumer
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/molecules/ActionGroup/ActionGroup.tsx — Action group design helper consumer
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/shared/actionStyles.ts — Generated action style helpers


## 2026-05-18

Step 69-70: Corrected PageHeader workflow by reverting accidental hand edits, force-regenerating schema-v2 scaffold, committing generated refresh, then reapplying PageHeader implementation with manual-edit changelog and renderer adapter (commits e86bd14, bf3305e).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/03-widget-ir-to-finished-widget-playbook.md — Updated generated-version validation and manual-edit changelog workflow
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — PageHeader renderer adapter
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/PageHeader/PageHeader.metadata.ts — Generated metadata sidecar
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/PageHeader/PageHeader.tsx — Promoted PageHeader implementation


## 2026-05-18

Step 72: Split generator ownership so widget scaffolding skips shared design-language files by default and only writes legacy shared fallback with --write-shared (commit 5d509d8).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/03-widget-ir-to-finished-widget-playbook.md — Playbook now documents shared generator ownership
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py — Widget generator now skips shared files unless --write-shared is explicit
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md — Task list records ownership boundary decision


## 2026-05-18

Step 74-76: Removed widget-generator shared fallback, refreshed DashboardGrid scaffold, and promoted DashboardGrid into a typed responsive widget with renderer adapter (commits 19efb3b, 37ab6a1, ed8ec9a).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py — Widget generator now never writes shared design-language files
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — dashboardGrid branch now adapts raw Admin DSL JSON to typed DashboardGrid props
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/DashboardGrid/DashboardGrid.metadata.ts — Generated DashboardGrid metadata sidecar
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/DashboardGrid/DashboardGrid.tsx — Promoted responsive DashboardGrid implementation


## 2026-05-18

Step 78-81: Refreshed and promoted all 05 layout widgets plus 06 resource widgets, moved renderer branches to typed adapters, and validated tsc/vitest/storybook (commits 7cf391a, a9fb46d, 755dd72, 7139dc6).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md — Task completion for 05/06 widgets
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Renderer adapters for promoted layout/resource widgets
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/Panel/Panel.tsx — Promoted panel widget
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.tsx — Promoted resource table widget
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/ResourceTable/parts/ResourceTableCell/ResourceTableCell.tsx — Promoted resource table cell widget


## 2026-05-18

Step 83: Added Admin DSL widget design-system review playbook with strict token/helper/style review checklist and FilterBar/Tabs remediation guidance.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/04-admin-dsl-widget-design-system-review-playbook.md — New design-system review playbook
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx — Current duplicated pill styling example
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx — Current duplicated pill styling example


## 2026-05-18

Step 84: Comprehensive review of widget IR playbooks, generator workflow, promoted widgets, and adapter boundary. Report at reference/05-admin-dsl-widget-ir-review.md. Diary at reference/06-widget-ir-review-diary.md.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Dead renderTableCell and pagination wiring issue found
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx — Pill duplication identified
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx — Pill duplication identified


## 2026-05-18

Step 84: Folded intern review feedback into widget implementation/review playbooks: added STOP regeneration warning, dead renderer cleanup, adapter semantic checks, type escape-hatch review, and helper export verification.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/03-widget-ir-to-finished-widget-playbook.md — Implementation playbook hardened from intern feedback
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/04-admin-dsl-widget-design-system-review-playbook.md — Design-system review playbook hardened from intern feedback
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/05-admin-dsl-widget-ir-review.md — Intern review input
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/06-widget-ir-review-diary.md — Intern review diary input


- Step 85: Added Phase 20 design-system remediation tasks for intern-review findings (commit d68e84b).
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/tasks.md` — tracked remediation work before implementation.
- Step 86: Added Admin DSL design-language IR/generator support for shared selection pill and badge tone helpers, then regenerated shared helper files (commit 9c24194).
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/15-design-language.yaml` — records helper semantics.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/06-generate-admin-dsl-design-language.py` — emits the helpers.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/shared/actionStyles.ts` — generated helper output.
- Step 87: Refactored promoted widgets and the resource-table adapter onto shared helpers; split pagination actions from bulk callbacks; removed dead table-cell renderer; replaced resource-table column cast with normalization (commit 9f1a463).
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx` — adapter cleanup and pagination dispatch.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx` — shared selection pill helper.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx` — shared selection pill helper.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.tsx` — shared token helpers and pagination callback split.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/widgets/organisms/ResourceTable/parts/ResourceTableCell/ResourceTableCell.tsx` — shared badge tone helper.
- Step 88: Validated the remediation with Python compile, TypeScript, Vitest, and Storybook build; marked the validation task complete (commit 9646410).
- Step 89: Recorded the detailed design remediation diary (commit eabf888).

- Step 93: Added a separate Widget Playbook Compliance Audit Guide and moved widget playbooks into `playbooks/` with `DocType=playbook`.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/01-widget-ir-to-finished-widget-playbook.md` — moved implementation playbook and changed DocType.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/02-admin-dsl-widget-design-system-review-playbook.md` — moved design-system review playbook and changed DocType.
  - Related: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/03-widget-playbook-compliance-audit-guide.md` — new intern audit guide for verifying end-to-end playbook compliance.
