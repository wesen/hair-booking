# Changelog

## 2026-05-13

- Initial workspace created


## 2026-05-13

Step 1: Created ticket, diary, and comprehensive desktop component system analysis/design/implementation guide. Related 14 key files.


## 2026-05-13

Step 2: Committed Phase 1 desktop components (DesktopShell, TopNav, StepRail, AccentPanel, TwoColumnLayout). Wrote UI-primitive DSL redesign guide (850 lines). Uploaded to reMarkable. Diary updated with architectural analysis.


## 2026-05-13

Step 3: Clean cutover to UI-primitive node kinds (commits e416b33, c37518a)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/flows/intake.flow.js — Complete rewrite using new primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/modules_dsl.go — New n.* helpers
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/builder.ts — Removed all legacy aliases
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/examples.ts — Rewritten with new primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/experimental.ts — 5 new example pages
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — New primitive render cases with inline styles
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts — 24 UI-primitive kinds


## 2026-05-13

Step 4: Wire primitives to molecules, add desktop partition, region(), Storybook stories (commits b52d89a, 36f24c2, d5fab66, 45b6687)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/UiPrimitives.stories.tsx — 12 stories for all new primitives
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/builder.ts — Added region() + shell() methods
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — Molecule wiring + partitionForDesktop
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts — Added meta.region

