# Changelog

## 2026-05-13

- Initial workspace created


## 2026-05-13

Step 1: Implemented initial declarative page builder DSL (schema, fluent builder, JSON renderer, examples, Storybook stories). Verified typecheck and Storybook build. (commit 1c26d31)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/PageDsl.stories.tsx — Storybook examples for DSL pages
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/builder.ts — Fluent JS builder API that emits JSON
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/examples.ts — Scripted page examples
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — JSON interpreter that renders existing widgets
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts — JSON contract for pages and nodes


## 2026-05-13

Step 2: Added experimental DSL composition examples and Storybook stories (consultation dashboard, appointment planner, color lab, photo moodboard, aftercare plan). Verified typecheck and Storybook build. (commit 53d8e08)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/ExperimentalPageDsl.stories.tsx — Storybook stories for experimental DSL compositions
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/experimental.ts — Experimental DSL page definitions


## 2026-05-13

Completed intern-facing DSL guide, related implementation files, and uploaded guide+diary bundle to reMarkable at /ai/2026/05/13/HAIR-032. (upload: HAIR_032_Fringe_Page_Builder_DSL_Guide.pdf)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-032--declarative-page-builder-dsl-for-fringe-intake-pages/design-doc/01-fringe-page-builder-dsl-analysis-design-and-implementation-guide.md — Intern-facing guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-032--declarative-page-builder-dsl-for-fringe-intake-pages/reference/01-diary.md — Implementation diary

