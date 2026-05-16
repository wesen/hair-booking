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

