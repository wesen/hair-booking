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
- [x] Run relevant frontend tests if feasible.
- [x] Update HAIR-039 diary with commands, failures, and review instructions.
- [x] Update HAIR-039 changelog and doc relations for implementation files.
- [x] Commit each completed phase separately.

## Phase 5 — Follow-up implementation backlog

- [x] Add unit tests for admin DSL builders and JSON stability.
- [x] Add interaction tests for row actions, modal open actions, and confirm actions.
- [ ] Add real admin components under `web/src/admin/` if inline renderer components become too large.
- [ ] Add backend-driven admin flow spike for services/pricing.
- [ ] Decide whether admin config edits need draft/publish tables before live mutation.

## Phase 6 — Component extraction and maintainability

- [x] Extract calendar rendering from `render.tsx` into a focused admin DSL calendar module.
- [x] Keep the desktop week grid and mobile agenda behavior unchanged after extraction.
- [x] Keep renderer imports explicit and avoid dynamic component lookup.

## Phase 7 — Mobile calendar regression coverage

- [x] Add focused tests for the calendar mobile agenda structure and day grouping.
- [x] Add focused tests that calendar action dispatch still works after extraction.
- [x] Run TypeScript and frontend tests.

## Phase 8 — Review workflow documentation and scripts

- [x] Add a tracked script for refreshing cropped mobile Admin DSL css-visual-diff screenshots.
- [x] Document the devctl Storybook profile and Admin DSL story URLs in `plugins/devctl/README.md`.
- [x] Update HAIR-039 diary, changelog, and file relations.
- [x] Add broad Admin DSL layout demo pages beyond salon intake: commerce, education, CMS/content, support, media, analytics, and team/settings
- [x] Add missing renderer coverage for layout exploration nodes such as split panes, tabs, search boxes, activity feeds, loading states, and image grids
- [x] Create Storybook stories with desktop and mobile framed variants for rapid layout browsing and future screenshot tooling
- [x] Validate TypeScript/tests and update HAIR-039 diary/changelog/file relations for expanded layout stories

## Phase 9 — Backend-owned fluent Admin DSL API design

- [x] Design the Go host fluent API surface for Admin DSL page construction, treating TypeScript builders as fixtures/prototyping helpers rather than the long-term source of truth.
- [x] Define Go-side builder packages/modules for page, resource, action, surface, form, layout, and adaptive-view concepts.
- [x] Ensure Go builders own schema validation, required-field checks, action-placement rules, and JSON serialization.
- [x] Decide how Go host builders are exposed to Goja scripts so backend JavaScript authors can still use a fluent API while the host controls validity.
- [x] Add golden JSON tests for Go-built Admin DSL pages and compare representative output to frontend fixture expectations.
- [x] Document the boundary: Go host owns Admin DSL validity and schema; app code owns domain schema, permissions, mutations, and publish semantics.

## Phase 10 — Renderer utility and action subsystem extraction

- [x] Create `web/src/admin-dsl/renderUtils.ts` for shared JSON extraction, style, data attribute, tone, and node-key helpers.
- [x] Create `web/src/admin-dsl/actions.ts` for action normalization, dispatch helpers, action placement defaults, and presentation metadata.
- [x] Move duplicated helper logic out of `render.tsx` and `calendar.tsx` without changing rendered output.
- [x] Add tests for array-style actions, keyed action maps, missing/invalid actions, confirmation metadata, and row-action placement semantics.
- [x] Keep renderer node-kind handling explicit; do not introduce dynamic component lookup by string.

## Phase 11 — Rich semantic action model

- [x] Extend `AdminActionRef` additively with `intent`, `priority`, `presentation`, `placement`, `requiresConfirmation`, `disabled`, `loading`, and `accessibilityLabel` metadata.
- [x] Add fluent frontend fixture helpers for `action.primary`, `action.secondary`, `action.danger`, `action.ghost`, `.placement(...)`, `.presentation(...)`, `.confirm(...)`, `.disabled(...)`, and `.loading(...)`.
- [x] Mirror the same fluent concepts in the Go host builder API and make Go validation authoritative.
- [x] Update renderer action buttons/menus to honor placement and priority for toolbar, row, footer, drawer, modal, and mobile contexts.
- [x] Add unit tests for semantic action serialization and renderer dispatch payloads.
- [x] Add Storybook behavior stories that demonstrate normal, disabled, loading, destructive, confirm-required, overflow, and stale-action scenarios.

## Phase 12 — Surface subsystem for drawers, modals, sheets, confirms, and details

- [x] Add a `surface.*` builder namespace for `drawer`, `modal`, `sheet`, `confirm`, `detailPanel`, and `inlinePanel` fixtures.
- [x] Add equivalent Go host fluent builders and validation for surface id uniqueness, close behavior, presentation mode, and mobile fallback.
- [x] Define surface state inputs: selected resource id, open/closed state, pending action, validation errors, and optimistic mutation state.
- [x] Cut over current static `modal`, `drawer`, and `confirmDialog` authoring to `surface.*` semantics without retaining legacy builder wrappers.
- [x] Add renderer support for desktop right drawers, centered modals, mobile bottom sheets, inline detail panels, and screenshot-friendly static-open states.
- [x] Add Storybook folders per screen with scenarios for closed, opened, editing, confirming, saving, error, and success states.

## Phase 13 — Resource and form lifecycle semantics

- [x] Define `resource.page(...)` semantics for query, list/table/card views, selected item, detail surface, bulk actions, empty state, loading state, and error state.
- [x] Define lifecycle-aware form semantics for values, dirty state, validation errors, submit state, cancel/reset, sticky save bars, and optimistic save feedback.
- [x] Implement TypeScript fixture helpers and Go host builders for resource and form lifecycle descriptors.
- [x] Add renderer handling for resource loading/empty/error states and form dirty/pending/error/success states.
- [x] Add tests covering form serialization, dirty-state rendering, validation error rendering, submit action dispatch, and cancel/reset action dispatch.
- [x] Keep app-owned data schema and write semantics out of the generic Admin DSL.

## Phase 14 — Backend-driven Admin DSL flow spike

- [x] Add a Go-backed Admin DSL flow spike for a services/pricing admin page using the Go host fluent API as the page construction authority.
- [x] Expose the Go builders to Goja only as controlled host objects/functions, not as open-ended browser-side builders.
- [x] Reuse existing runtime concepts where appropriate: page versions, opaque action ids, action dispatch, and protobuf/JSON transport boundaries.
- [x] Add backend action handlers for open drawer, edit field, validate, save success, save error, cancel, and confirm-delete flows.
- [x] Add tests proving stale page-version actions are rejected and malformed Admin DSL pages fail before transport.
- [x] Document how the backend-driven Admin DSL differs from the frontend-only Storybook fixture path.

## Phase 15 — Storybook behavior and action scenario catalog

- [x] Reorganize Admin DSL Storybook into folders per screen, for example `Admin DSL/Services`, `Admin DSL/Calendar`, `Admin DSL/Orders`, and `Admin DSL/Behavior`.
- [x] For each representative screen, add multiple scenario stories: default, selected row, drawer open, confirm open, validation error, save pending, save success, save failed, empty, loading, and permission-restricted.
- [x] Add interactive `play` functions for key click-through paths so screenshots can capture meaningful post-interaction states.
- [x] Use MSW where needed to mock backend action dispatch, resource queries, validation failures, and mutation results.
- [x] Evaluate or build a small Admin DSL MSW fixture framework for declaring action handlers, state transitions, latency, errors, and page re-render responses.
- [x] Add screenshot-capture script support for scenario stories, not only static page stories.

## Phase 14B — Admin DSL protobuf/HTTP transport integration

- [x] Add HTTP start/get/dispatch endpoints for the backend Admin DSL services flow spike.
- [x] Emit and accept dedicated `fringe.admin_dsl.v1` protobuf JSON envelopes.
- [x] Add a frontend Admin DSL backend client using generated TypeScript protobuf bindings.
- [x] Add server tests for start/get/dispatch and surface-preserving protobuf JSON responses.
- [x] Document that this is a transport prerequisite for live backend stories and complements, but does not replace, the Phase 16 MSW harness.

## Phase 16 — MSW-backed Admin DSL interaction test harness

- [x] Add MSW dependencies/configuration if not already present in the web app.
- [x] Create a small test/story harness for Admin DSL action handling that can map action targets to mocked state transitions.
- [x] Support declarative fixtures for latency, success, validation error, authorization error, server error, and stale-action responses.
- [x] Wire the harness into Storybook stories and selected Vitest integration tests.
- [x] Ensure the harness models the real runtime shape closely enough that backend-driven stories do not become misleading.
- [x] Document when to use pure static fixtures, local story state, MSW-backed stories, and live backend stories.

## Phase 17 — Adaptive layout policies and visual regression expansion

- [x] Add explicit layout policy props for split panes, resource lists, calendars, drawers, toolbars, side panels, and sticky action regions.
- [x] Extend calendar adaptive behavior into a reusable adaptive-view pattern for table/card, grid/list, detail/summary, and drawer/sheet variants.
- [x] Add desktop/mobile behavior stories for each adaptive policy.
- [x] Expand screenshot automation to capture behavior scenarios and layout catalog desktop/mobile stories.
- [x] Add VLM/image-review checkpoints for scenario groups where visual correctness is hard to assert with DOM tests alone.
- [x] Decide which screenshots should become CI-grade regression artifacts and which remain manual review artifacts.

## Phase 18 — Documentation and release readiness

- [x] Update the Admin DSL evolution guide after each implemented subsystem with final API shapes and examples.
- [x] Add a backend-author guide for building Admin DSL pages through Go host fluent APIs and Goja-controlled scripts.
- [x] Add a frontend-renderer guide for adding new node kinds without breaking the JSON contract.
- [x] Add a Storybook scenario authoring guide for static, local-state, MSW-backed, and live-backend stories.
- [x] Run final validation: `go test ./... -count=1`, `cd web && npx tsc --noEmit`, and `cd web && pnpm test -- --runInBand`.
