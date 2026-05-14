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

