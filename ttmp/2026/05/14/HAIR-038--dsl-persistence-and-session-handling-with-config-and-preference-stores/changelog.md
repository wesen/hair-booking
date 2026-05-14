# Changelog

## 2026-05-14

- Initial workspace created


## 2026-05-14

Created HAIR-038 persistence/session design guide covering two-store Goja database architecture, durable ctx.state snapshots, session hydration, config versioning, host module APIs, and implementation phases.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/14/HAIR-038--dsl-persistence-and-session-handling-with-config-and-preference-stores/design-doc/01-dsl-persistence-and-session-handling-guide.md — Intern-facing design and implementation guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/14/HAIR-038--dsl-persistence-and-session-handling-with-config-and-preference-stores/reference/01-diary.md — Diary of ticket creation


## 2026-05-14

Updated HAIR-038 design to replace app-specific host/config and host/preferences modules with generic pre-provisioned configDb and stateDb Goja database objects for multi-app reuse.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/14/HAIR-038--dsl-persistence-and-session-handling-with-config-and-preference-stores/design-doc/01-dsl-persistence-and-session-handling-guide.md — Corrected design guide centered on configDb/stateDb
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/14/HAIR-038--dsl-persistence-and-session-handling-with-config-and-preference-stores/reference/01-diary.md — Diary Step 3 records user correction and rationale


## 2026-05-14

Phase 1: Added configDb/stateDb RuntimeHost plumbing, registered pre-provisioned Goja database modules, preserved db as a stateDb alias, and tested configDb read-only behavior.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/db_modules.go — configDb read-only QueryExecer wrapper
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/host.go — RuntimeHost config/state DB split
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/modules_dsl.go — configDb/stateDb module registration
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl.go — dslFlowStore config/state DB wiring


## 2026-05-14

Phase 2: Persist real Goja ctx.state snapshots into dsl_flow_sessions.state_json after start and event dispatch, with server test coverage.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — StateJSON helper for durable state snapshots
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl.go — Persists session snapshot after dispatch
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl_test.go — State persistence regression test
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl_uploads.go — recordDSLFlowSession writes state_json


## 2026-05-14

Phase 3: Added Runtime.ResumeFlow and stateDb-backed session hydration for missing in-memory DSL sessions, with restart-style tests for persisted state and fresh action ids.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — ResumeFlow implementation
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl.go — Hydration-aware get/event handlers
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl_test.go — Restart-style hydration coverage


## 2026-05-14

Phase 4 slice: Added seeded configDb schema/opening path and moved intake content lookups behind configDb-backed JavaScript helpers with fallback constants.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/cmd/hair-booking/cmds/serve.go — configDb CLI flags and startup opening
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/flows/intake.flow.js — configDb-backed content helper functions
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslhost/config_schema.sql — Versioned configDb schema and seed data


## 2026-05-14

Phase 4: Added config_version_id to DSL session rows and persist it from ctx.state.configVersionId, with server assertions after start and dispatch.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslhost/schema.sql — config_version_id column
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl_test.go — config version persistence assertions
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl_uploads.go — config version extraction during session persistence

