# Tasks

## Phase 0 — Planning and task breakdown

- [ ] Expand HAIR-039 into detailed phased implementation tasks.
- [ ] Record the phase plan in the diary and changelog.

## Phase 1 — Admin DSL foundation

- [ ] Create `web/src/admin-dsl/schema.ts` with JSON-safe admin page/node/action/query/form types.
- [ ] Create `web/src/admin-dsl/builder.ts` with fluent `admin`, `resource`, `field`, `view`, `action`, and `query` helpers.
- [ ] Create `web/src/admin-dsl/index.ts` exports.
- [ ] Add stable JSON examples for at least services/pricing, dashboard, and calendar pages.
- [ ] Validate that builders emit plain JSON without functions.

## Phase 2 — Renderer and design-system starter components

- [ ] Create `web/src/admin-dsl/render.tsx` with explicit node-kind mappings.
- [ ] Implement starter admin shell/layout rendering.
- [ ] Implement metric cards, sections, resource lists/rows, empty states, modals, drawers, and confirm panels.
- [ ] Implement calendar-week and appointment-block starter rendering.
- [ ] Wire action dispatch logging through a shared render context.

## Phase 3 — Storybook demo pages

- [ ] Create `web/src/admin-dsl/AdminDsl.stories.tsx`.
- [ ] Add Services & Pricing page story.
- [ ] Add Dashboard page story.
- [ ] Add Calendar page story.
- [ ] Add JSON contract story.
- [ ] Add at least one modal/confirm/demo state story.

## Phase 4 — Validation and documentation

- [ ] Run TypeScript validation for the web app.
- [ ] Run relevant frontend tests if feasible.
- [ ] Update HAIR-039 diary with commands, failures, and review instructions.
- [ ] Update HAIR-039 changelog and doc relations for implementation files.
- [ ] Commit each completed phase separately.

## Phase 5 — Follow-up implementation backlog

- [ ] Add unit tests for admin DSL builders and JSON stability.
- [ ] Add interaction tests for row actions, modal open actions, and confirm actions.
- [ ] Add real admin components under `web/src/admin/` if inline renderer components become too large.
- [ ] Add backend-driven admin flow spike for services/pricing.
- [ ] Decide whether admin config edits need draft/publish tables before live mutation.
