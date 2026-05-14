# Tasks

## TODO

- [x] Add tasks here

- [x] Map current DSL session, state, host database, and transport architecture
- [x] Design two-store Goja persistence model for read-only site config and read-write user preferences
- [x] Define session lifecycle, identity, durability, and recovery semantics
- [x] Specify implementation phases, APIs, migrations, tests, and rollout plan
- [x] Phase 1: Split RuntimeHost and server options into explicit configDb/stateDb dependencies while preserving existing db alias behavior
- [x] Phase 1: Register pre-provisioned Goja database modules configDb and stateDb with configure disabled
- [x] Phase 1: Add QueryOnlyDB wrapper so configDb rejects exec and non-read SQL
- [x] Phase 1: Add runtime tests proving configDb is read-only and stateDb is read-write
- [x] Phase 2: Add FlowSession StateJSON/StateMap helpers for durable JSON-safe ctx.state snapshots
- [x] Phase 2: Persist state_json/current page/version after DSL start and every event dispatch
- [x] Phase 2: Add server tests proving state_json changes after user choices
- [x] Phase 3: Add Runtime.ResumeFlow to rebuild a Goja VM from persisted state JSON and regenerate actions
- [x] Phase 3: Hydrate missing in-memory DSL sessions from stateDb in GET/event/upload handlers
- [x] Phase 3: Add restart-style server tests for session recovery and fresh action ids
- [x] Phase 4: Add configDb schema/seed path for app content and migrate intake.flow.js constants behind configDb helpers
- [ ] Phase 4: Add config version pinning on DSL sessions and tests for deterministic rerendering
- [ ] Phase 5: Add ownership/expiry hardening for persisted sessions and uploads
- [ ] Phase 5: Add cleanup/audit tests and operational notes for expired sessions
