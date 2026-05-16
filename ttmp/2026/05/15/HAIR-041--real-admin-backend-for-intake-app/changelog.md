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
