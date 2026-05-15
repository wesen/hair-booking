# Changelog

## 2026-05-15

- Initial workspace created


## 2026-05-15

Created HAIR-039 and wrote the intern-facing admin design system and DSL implementation guide centered on a one-stylist salon MVP.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/01-admin-design-system-and-dsl-implementation-guide.md — Primary design guide for admin DSL and MVP implementation phases
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary recording ticket creation and design rationale


## 2026-05-15

Uploaded the HAIR-039 admin design system and DSL implementation guide to reMarkable at /ai/2026/05/15/HAIR-039/HAIR_039_Admin_Design_System_DSL_Guide.pdf.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/01-admin-design-system-and-dsl-implementation-guide.md — Uploaded source document


## 2026-05-15

Expanded HAIR-039 into phased implementation tasks for admin DSL schema, builders, renderer, Storybook demos, validation, and follow-up backend/testing work.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records phase planning step
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/tasks.md — Detailed phased implementation checklist


## 2026-05-15

Implemented the first admin DSL slice with schema, builders, examples, renderer, Storybook demos, and TypeScript validation. Full frontend tests were attempted but existing page-dsl interaction tests failed.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records validation and test failure details
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDsl.stories.tsx — Storybook demos
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/builder.ts — Admin DSL builder API
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/examples.ts — Demo page JSON examples
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Renderer implementation
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/schema.ts — Admin DSL schema


## 2026-05-15

Added focused admin DSL tests for plain JSON builder output and rendered row action dispatch; TypeScript and targeted Vitest validation pass.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records focused validation commands
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDsl.test.tsx — Admin DSL builder and renderer tests


## 2026-05-15

Extended admin DSL interaction coverage to assert confirm actions dispatch with target archiveService. (commit 7184a3a)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Updated commit references
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDsl.test.tsx — Confirm action interaction coverage


## 2026-05-15

Fixed existing page-dsl interaction test failures by aligning selectableGroup selector expectations with BudgetOption rendering and restoring direct local uploadTile action dispatch when no backend upload intent is configured.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records full frontend test fix and validation
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/InteractiveDsl.test.tsx — Updated selectableGroup test selector to current renderer behavior
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — Restored direct uploadTile local action fallback without backend upload intent


## 2026-05-15

Added a devctl Storybook profile/service and started Storybook under devctl supervision for Admin DSL review at http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--services-pricing.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/.devctl.yaml — Added storybook profile for design review
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/plugins/devctl/hair_booking.py — Added storybook service selection and launch plan
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records devctl Storybook startup and verification

