# Changelog

## 2026-05-15

- Initial workspace created


## 2026-05-15

Step 1: Created HAIR-040 ticket, implementation guide, phased tasks, and diary for the real Goja-backed Admin DSL website.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/design-doc/01-real-goja-backed-admin-dsl-website-implementation-guide.md — Real Admin DSL website implementation guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/reference/01-diary.md — Implementation diary
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/tasks.md — Phased implementation tasks


## 2026-05-15

Step 2: Added Admin Goja runtime skeleton with Go-host builder module, ctx.bind action registration, render/dispatch lifecycle, stale rejection, validation, and runtime tests. Validation: go test ./pkg/admindsl -run 'TestScriptRuntime|TestGoja' -count=1.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/script_runtime.go — Admin Goja runtime skeleton
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/script_runtime_test.go — Admin Goja runtime tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/reference/01-diary.md — Diary records runtime skeleton
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/tasks.md — Phase 1 completion


## 2026-05-15

Step 3: Added the real Goja services Admin DSL flow source, embedded it, exposed surface namespace to Goja, and tested render/dispatch/validation. Validation: go test ./pkg/admindsl -run 'TestServicesFlowSource|TestGojaModule' -count=1.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows.go — Embedded services Admin DSL flow source
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/services.flow.js — Real services Admin DSL flow source
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows_test.go — Services Admin DSL flow tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/goja_module.go — Goja module exposes surface namespace
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/reference/01-diary.md — Diary records flow source
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/tasks.md — Phase 2 completion


## 2026-05-15

Step 4: Cut Admin DSL HTTP start/get/dispatch over from the Go spike to the Goja-backed ScriptRuntime and embedded services.flow.js. Validation: go test ./pkg/server -run TestAdminDSLHTTPStartGetDispatch -count=1.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl.go — Admin DSL HTTP now uses ScriptRuntime sessions
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl_test.go — HTTP test updated for real JS flow action target
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/reference/01-diary.md — Diary records HTTP cut-over
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/tasks.md — Phase 3 cut-over tasks updated


## 2026-05-15

Step 5: Removed the Go-only Admin DSL flow spike, moved shared flow transport types, updated proto/runtime tests to use the JS flow, and added HTTP unknown-flow/stale-action tests. Validation: go test ./pkg/admindsl ./pkg/server -count=1.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/proto_convert_test.go — Proto conversion now uses ScriptRuntime and ServicesFlowSource
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/test_helpers_test.go — Action id test helper after spike removal
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/types.go — Shared Admin DSL flow transport types
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl_test.go — HTTP unknown-flow and stale-action tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/reference/01-diary.md — Diary records spike removal and HTTP tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/tasks.md — Phase 3 complete


## 2026-05-15

Step 6: Added BackendAdminDslPage, mounted /admin/services, wired renderer dispatch to Admin DSL protobuf backend client, and added event conversion tests. Validation: cd web && npx tsc --noEmit; cd web && pnpm test -- --runInBand (10 files, 41 tests passed).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/reference/01-diary.md — Diary records frontend route bridge
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/tasks.md — Phase 4 complete
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/App.tsx — Mounts /admin/services
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/BackendAdminDslPage.test.ts — Backend Admin DSL event conversion tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/BackendAdminDslPage.tsx — Real Admin DSL frontend route bridge


## 2026-05-15

Step 7: Added dev-only live backend Storybook story for BackendAdminDslPage and marked Phase 5 complete.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/reference/01-diary.md — Diary records live backend story
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/tasks.md — Phase 5 complete
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/BackendAdminDslPage.stories.tsx — Live backend Storybook smoke story

