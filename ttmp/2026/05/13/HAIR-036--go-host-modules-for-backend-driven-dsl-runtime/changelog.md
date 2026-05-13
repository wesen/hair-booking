# Changelog

## 2026-05-13

- Initial workspace created


## 2026-05-13

Step 1: Created HAIR-036, inspected goja-hosting-site DB module patterns, wrote and related the intern-facing Go host modules guide, validated frontmatter, and uploaded the bundle to reMarkable.

### Related Files

- /home/manuel/code/wesen/2026-05-03--goja-hosting-site/pkg/app/server.go — Reference for preconfigured go-go-goja database module registration
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-036--go-host-modules-for-backend-driven-dsl-runtime/design-doc/01-go-host-modules-for-the-fringe-goja-dsl-runtime-db-images-and-user-context.md — Detailed host modules design and implementation guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-036--go-host-modules-for-backend-driven-dsl-runtime/reference/01-diary.md — Diary and upload record
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-036--go-host-modules-for-backend-driven-dsl-runtime/tasks.md — Phased implementation tasks


## 2026-05-13

Step 2: Expanded HAIR-036 into detailed server-side implementation phases for CLI SQLite flags, DB provisioning, runtime host modules, user context, image upload intents, server upload endpoint, validation, and handoff while avoiding parallel web/desktop work.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-036--go-host-modules-for-backend-driven-dsl-runtime/reference/01-diary.md — Diary Step 2
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-036--go-host-modules-for-backend-driven-dsl-runtime/tasks.md — Detailed server-side implementation phases


## 2026-05-13

Step 3: Implemented server-side host module foundation (commit 8f5d0d2): DSL SQLite flags, schema provisioning package, runtime host wiring, Go-owned module registry, and preconfigured go-go-goja db module registration with integration tests. Validated targeted and full Go tests.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/cmd/hair-booking/cmds/serve.go — DSL SQLite Glazed flags and server option plumbing
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/host.go — Runtime host dependency boundary
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/host_modules_test.go — Goja db module integration tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/modules_dsl.go — Go-owned require registry with fringe/dsl and db module registration
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — Runtime host option and explicit page toJSON export
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslhost/db.go — SQLite open/provision helper
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslhost/db_test.go — Schema provisioning tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslhost/schema.sql — Starting host-module schema
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl.go — Runtime host construction for DSL flow store
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/http.go — Server/handler option propagation

