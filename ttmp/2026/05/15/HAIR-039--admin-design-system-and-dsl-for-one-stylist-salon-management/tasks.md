# Tasks

## Phase 0 — Planning and task breakdown

- [x] Expand HAIR-039 into detailed phased implementation tasks.
- [x] Record the phase plan in the diary and changelog.

## Phase 1 — Admin DSL foundation

- [x] Create `web/src/admin-dsl/schema.ts` with JSON-safe admin page/node/action/query/form types.
- [x] Create `web/src/admin-dsl/builder.ts` with fluent `admin`, `resource`, `field`, `view`, `action`, and `query` helpers.
- [x] Create `web/src/admin-dsl/index.ts` exports.
- [x] Add stable JSON examples for at least services/pricing, dashboard, and calendar pages.
- [x] Validate that builders emit plain JSON without functions.

## Phase 2 — Renderer and design-system starter components

- [x] Create `web/src/admin-dsl/render.tsx` with explicit node-kind mappings.
- [x] Implement starter admin shell/layout rendering.
- [x] Implement metric cards, sections, resource lists/rows, empty states, modals, drawers, and confirm panels.
- [x] Implement calendar-week and appointment-block starter rendering.
- [x] Wire action dispatch logging through a shared render context.

## Phase 3 — Storybook demo pages

- [x] Create `web/src/admin-dsl/AdminDsl.stories.tsx`.
- [x] Add Services & Pricing page story.
- [x] Add Dashboard page story.
- [x] Add Calendar page story.
- [x] Add JSON contract story.
- [x] Add at least one modal/confirm/demo state story.

## Phase 4 — Validation and documentation

- [x] Run TypeScript validation for the web app.
- [ ] Run relevant frontend tests if feasible.
- [x] Update HAIR-039 diary with commands, failures, and review instructions.
- [x] Update HAIR-039 changelog and doc relations for implementation files.
- [ ] Commit each completed phase separately.

## Phase 5 — Follow-up implementation backlog

- [ ] Add unit tests for admin DSL builders and JSON stability.
- [ ] Add interaction tests for row actions, modal open actions, and confirm actions.
- [ ] Add real admin components under `web/src/admin/` if inline renderer components become too large.
- [ ] Add backend-driven admin flow spike for services/pricing.
- [ ] Decide whether admin config edits need draft/publish tables before live mutation.
