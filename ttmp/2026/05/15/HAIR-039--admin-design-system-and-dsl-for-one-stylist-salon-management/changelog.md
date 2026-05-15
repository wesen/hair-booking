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


## 2026-05-15

Improved Admin DSL mobile responsiveness using cropped css-visual-diff screenshots and VLM review; tightened typography, stacked side panels, enlarged tap targets, improved status contrast, removed duplicate modal title, and made calendar horizontally scrollable on mobile.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records screenshot/VLM workflow and validation
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/examples.ts — Removed duplicate modal form title and normalized calendar drawer time
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Responsive layout


## 2026-05-15

Fixed the Admin DSL calendar renderer so appointment blocks are constrained to their configured day column and hour-row span instead of stretching across the whole workweek.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records calendar constraint fix and validation
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Calendar week now renders appointment children into day/hour CSS grid cells


## 2026-05-15

Added a mobile-specific Admin DSL calendar agenda view that replaces the horizontally scrollable week grid below the mobile breakpoint while preserving the desktop day/hour grid.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records mobile agenda decision
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — calendarWeek now renders a mobile agenda grouped by day


## 2026-05-15

Added Phase 6-8 hardening tasks for calendar extraction, mobile agenda tests, and reproducible css-visual-diff review scripts/documentation.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records next-phase planning
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/tasks.md — Added follow-up hardening phases


## 2026-05-15

Extracted Admin DSL calendar rendering into a focused module and added regression tests for mobile agenda grouping plus calendar action dispatch; TypeScript and full frontend tests pass.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records extraction
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDsl.test.tsx — Added mobile agenda and calendar action dispatch tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/calendar.tsx — Extracted calendar renderer
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Delegates calendarWeek nodes to AdminCalendarWeek and supports keyed action maps


## 2026-05-15

Added a tracked HAIR-039 script for refreshing cropped mobile Admin DSL css-visual-diff screenshots and documented Storybook/Admin DSL review URLs in the devctl README.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/plugins/devctl/README.md — Documented storybook profile and Admin DSL story URLs
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records script creation and successful run
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/scripts/01-capture-mobile-admin-dsl.sh — Repeatable cropped mobile screenshot workflow


## 2026-05-15

Added tasks for broad Admin DSL backend-admin layout coverage with desktop/mobile Storybook variants, correcting that application builders own config DB schemas and write semantics.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records layout story planning
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/tasks.md — Added broad layout story tasks


## 2026-05-15

Added broad Admin DSL layout catalog Storybook coverage with desktop/mobile/matrix variants across commerce, course, CMS, support, media, analytics, and team settings use cases; added renderer support for split panes, tabs, search boxes, activity feeds, image grids, and loading states.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records implementation and validation
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDslLayouts.stories.tsx — New desktop/mobile/matrix layout catalog stories
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/layoutExamples.ts — New broad layout examples
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Renderer coverage for layout catalog nodes


## 2026-05-15

Set explicit desktop/mobile viewport parameters on Admin DSL layout catalog stories, reviewed desktop/mobile screenshot pairs with image analysis, and fixed mobile density/search/side-panel issues plus Analytics metric ambiguity.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records pair review and fixes
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/AdminDslLayouts.stories.tsx — Explicit desktop/mobile Storybook viewport parameters
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/layoutExamples.ts — Analytics Ops metric text adjusted after desktop visual review
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx — Mobile layout density


## 2026-05-15

Added an intern-facing Admin DSL evolution brainstorm/design guide proposing richer action, surface, resource, form, layout, and adaptive-view semantics while keeping app-owned config schemas flexible.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/02-admin-dsl-evolution-brainstorm-and-design-guide.md — New Admin DSL evolution guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records guide creation


## 2026-05-15

Uploaded the Admin DSL evolution guide to reMarkable at /ai/2026/05/15/HAIR-039/HAIR_039_Admin_DSL_Evolution_Guide.pdf.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/02-admin-dsl-evolution-brainstorm-and-design-guide.md — Uploaded guide source
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/reference/01-diary.md — Diary records upload

