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

