---
status: active
topics:
  - backend
  - frontend
  - admin-dsl
  - goja
  - persistence
updated: 2026-05-15
---

# Tasks — HAIR-041 Real admin backend for intake app

## Phase 1 — Design and planning

- [x] Create HAIR-041 ticket workspace.
- [x] Create intern-facing implementation guide.
- [x] Add screen inventory, data inventory, API references, ASCII screenshots, and non-obvious error states.
- [x] Add Admin DSL/design-component readiness assessment.
- [x] Upload design guide to reMarkable.
- [x] Relate key implementation files to the ticket.

## Phase 2 — Persistent admin domain schema

- [x] Design app-owned `pkg/intakeadmin` storage package.
- [x] Add schema/migrations for `intake_requests`.
- [x] Add schema/migrations for `intake_request_events`.
- [x] Add schema/migrations for `admin_audit_events`.
- [x] Decide whether `admin_flow_sessions` is required immediately.
- [x] Add store tests for request creation/listing/detail/status transitions.
- [x] Add store tests for config draft creation and publish transaction.

## Phase 3 — Customer intake submission persistence

- [x] Add customer submit host module for `intake.flow.js`.
- [x] Replace prototype confirm loop with real request creation.
- [x] Persist selected config version, service, tones, damage, photos, budget, day, time, estimate.
- [ ] Ensure upload references belong to the same session/user.
- [x] Add tests for customer confirm creating an admin-visible request.

## Phase 4 — Admin runtime host modules and registry

- [x] Extend `pkg/admindsl.ScriptRuntime` to register app host modules.
- [x] Implement `host/intake-admin` module.
- [x] Implement `host/intake-preview` module.
- [ ] Implement audited mutation wrappers.
- [x] Replace hard-coded admin flow handling with an admin flow registry.
- [ ] Add auth/role guard for admin flows.

## Phase 5 — Admin DSL component gaps

- [x] Add actionable tabs/filter/search controls.
- [x] Add `resourceTable` or `dataTable` primitive.
- [x] Add pagination/bulk action support.
- [x] Add `editableList` or `reorderableList` primitive.
- [x] Add `monthAvailabilityGrid` primitive.
- [x] Add `imageGallery` or `mediaViewer` primitive.
- [x] Add Storybook coverage for new `resourceTable` and `imageGallery` primitives.
- [x] Add Storybook coverage for advanced Phase 5 primitives.
- [x] Add `previewFrame` or route-level preview bridge.
- [x] Add `diffView` or `changeSummary` primitive.
- [x] Fix duplicate desktop/mobile surface accessibility behavior.

## Phase 6 — Dashboard and request review

- [x] Build `/admin/intake` frontend route.
- [x] Add `fringe.admin.intake.v1` flow source.
- [x] Implement dashboard screen.
- [x] Implement request queue with filters.
- [x] Implement request empty/loading/error states.
- [x] Implement request detail screen.
- [x] Implement photo gallery modal and missing-photo error state.
- [x] Implement status transitions and internal notes.

## Phase 7 — Config editing and publishing

- [x] Implement config versions screen.
- [x] Implement create-draft-from-active action.
- [x] Implement services/categories editor.
  - [x] First-pass read-only editor view using `editableList`.
  - [x] Add update mutation and drawer form.
  - [x] Add create/delete/reorder-by-sort-order mutations.
- [x] Implement tone options editor.
  - [x] First-pass read-only editor view using `editableList`.
  - [x] Add update mutation and drawer form.
  - [x] Add create/delete/reorder-by-sort-order mutations.
- [x] Implement budget options editor.
  - [x] First-pass read-only editor view using `editableList`.
  - [x] Add create/update/delete/reorder-by-sort-order mutations.
- [x] Implement price range editor.
  - [x] First-pass read-only table view using `resourceTable`.
  - [x] Add create/update/delete mutations and money-field validation.
- [x] Implement availability and time slot editors.
  - [x] First-pass availability grid and time-slot list view.
  - [x] Add day/time-slot mutation semantics.
- [x] Implement config validation report.
- [x] Implement publish confirm modal.
- [x] Implement publish transaction and audit event.

## Phase 8 — Preview, audit, health, and stress testing

- [x] Implement draft customer intake preview.
- [x] Implement audit log screen.
- [x] Implement health/diagnostics screen.
- [x] Add Playwright smoke for submit-customer-request -> admin-review.
- [ ] Add Playwright/css-visual-diff screenshots for all major screens.
- [ ] Record stress-test findings and split follow-up tickets as needed.

## Phase 9 — Final validation and docs

- [ ] Run `go test ./... -count=1`.
- [ ] Run `cd web && npx tsc --noEmit`.
- [ ] Run `cd web && pnpm test -- --runInBand`.
- [ ] Update implementation diary.
- [ ] Update changelog.
- [ ] Upload final docs/screenshots bundle to reMarkable.

## Phase 10 — Follow-up hardening backlog

- [x] Split `pkg/admindsl/flows/intake_admin.flow.js` into focused required modules once Admin ScriptRuntime supports embedded JS modules.
- [x] Add relative embedded JS `require("./...")` support for Admin DSL flow helper files.
- [x] Centralize embedded Admin DSL flow module registration to avoid missed helper-file registration.
- [ ] Add delete confirmation surfaces for destructive config row actions.
- [ ] Replace boolean text fields with semantic `switchField` submit semantics.
- [ ] Replace service/category/value text fallbacks with semantic `selectField` submit semantics where options are known.
- [ ] Replace raw cents text fields with semantic money fields and formatter/parser coverage.
- [ ] Add drag/drop or explicit move-up/move-down reorder events for `editableList`; keep sort-order editing as the Phase 7 fallback.
- [ ] Add Playwright smoke for `/admin/intake`: create draft, add/edit/delete config rows, publish, and verify customer intake sees the published config.
- [ ] Add visual screenshot/css-visual-diff coverage for Phase 7 config sections.
- [ ] Add real admin auth/role guard for Admin DSL flows.
- [ ] Verify uploaded photo references belong to the same customer session/user before request creation.
- [ ] Review cross-database audit atomicity for config DB mutations that write audit rows to the state DB after commit.
- [ ] Decide whether Admin DSL sessions must be persisted rather than in-memory.
- [ ] Add stricter before/after audit payloads for all config mutation methods.
- [ ] Add accessibility review for resource tables, editable lists, drawer forms, and modal/confirm surfaces.

## Phase 11 — Admin DSL v2 vocabulary and cutover planning

- [ ] Freeze Admin DSL v2 node vocabulary: keep/add/remove/rename list.
- [x] Decide final `schemaVersion: 2` cutover boundary and confirm no v1 compatibility shims.
- [ ] Decide whether `pageHeader`, `dashboardGrid`, `comparisonTable`, and `monthCalendar` are new node kinds rather than prop extensions.
- [ ] Decide whether `resourceList`/`resourceRow` are removed in favor of responsive `resourceTable`.
- [ ] Decide whether `diffView` splits into `comparisonTable` and optional `diffBlock`.
- [ ] Decide whether `monthAvailabilityGrid` is replaced by generic `monthCalendar`.
- [ ] Decide whether `section`, `cardGrid`, `summaryCard`, `editableList`, and `imageGrid` are removed or renamed.
- [ ] Define v2 action placement vocabulary: `pageHeader`, `panelToolbar`, `panelFooter`, `row`, `rowOverflow`, `bulkToolbar`, `formFooter`, `calendarCell`, `sidebarNav`.
- [ ] Define v2 density/layout policy shape for panels and dashboard grid children.
- [ ] Add a short migration checklist mapping each v1 node used by current flows to its v2 replacement.

## Phase 12 — Frontend Admin DSL v2 renderer and Storybook fixture

- [x] Update `web/src/admin-dsl/schema.ts` with v2 node kinds and action placements.
- [x] Add `schemaVersion: 2` support for new Storybook fixtures.
- [x] Implement workbench shell/sidebar rendering for `shell.kind = "admin"` and `shell.props.variant = "workbench"`.
- [x] Implement `pageHeader` renderer with breadcrumbs, title, description, and page-level actions.
- [x] Implement `dashboardGrid` renderer with responsive spans/order and compact gap policy.
- [x] Strengthen `panel` renderer with header/body/footer actions, density, padding, chrome, and layout props.
- [x] Implement v2-style `resourceTable` column kinds: `text`, `badge`, `date`, `money`, `relativeTime`, `boolean`, `actions`, `overflowActions`, `dragHandle`.
- [x] Implement `comparisonTable` renderer for field/current/draft/scheduled/action rows.
- [x] Implement `monthCalendar` renderer with month navigation, selected day, markers, and legend.
- [x] Add `AdminDslWorkbench.stories.tsx` with target desktop and mobile stories matching the copied reference layout.
- [x] Add frontend renderer tests for `pageHeader`, sidebar nav dispatch, table row action dispatch, `comparisonTable` review action, and calendar date action.
- [x] Run `cd web && npx tsc --noEmit`.
- [x] Run `cd web && pnpm test -- --runInBand`.

## Phase 13 — Go Admin DSL v2 schema, builders, validation, and Goja exports

- [x] Update `pkg/admindsl/types.go` with v2 node constants and action placements.
- [x] Set Admin DSL builders to emit `schemaVersion: 2` for migrated pages.
- [x] Remove deprecated v1 node constants after flow migration plan is ready.
- [x] Add Go builders for `PageHeader`, `DashboardGrid`, `ComparisonTable`, and `MonthCalendar`.
- [x] Add panel layout/density helper methods to Go builders.
- [x] Expose v2 helpers through `pkg/admindsl/goja_module.go`.
- [x] Tighten `pkg/admindsl/validate.go` for v2 pages, unknown node kinds, required props, table columns, row IDs, and typed form fields.
- [x] Add Go builder and Goja module tests for all new v2 helpers.
- [x] Run `go test ./pkg/admindsl -count=1`.

## Phase 14 — Admin flow migration to semantic workbench pages

- [x] Migrate `pkg/admindsl/flows/services.flow.js` to v2 shell/header/grid/panel primitives.
- [x] Migrate `pkg/admindsl/flows/intake_admin.flow.js` dashboard to workbench shell, page header, dashboard grid, panels, metrics, services table, activity feed, and preview panel.
- [x] Migrate `pkg/admindsl/flows/intake_requests.flow.js` from resource list/card patterns to v2 resource table/detail patterns.
- [x] Migrate `pkg/admindsl/flows/intake_config.flow.js` from editable lists and diff views to v2 resource tables, typed forms, and comparison tables.
- [x] Migrate `pkg/admindsl/flows/intake_ops.flow.js` audit/health/preview screens to v2 page/header/panel conventions.
- [ ] Remove v1 flow helper usages: `section`, `cardGrid`, `summaryCard`, `resourceList`, `resourceRow`, `editableList`, `monthAvailabilityGrid`, and broad `diffView`.
- [x] Run `go test ./pkg/admindsl ./pkg/server -count=1`.
- [x] Run `go test ./... -count=1`.

## Phase 15 — Admin DSL v2 live validation, visual review, and cleanup

- [ ] Run `cd web && npx tsc --noEmit` after flow/renderer cutover.
- [ ] Run `cd web && pnpm test -- --runInBand` after flow/renderer cutover.
- [ ] Run submit-customer-request -> admin-review smoke script after `/admin/intake` migration.
- [x] Capture desktop/mobile screenshots for the v2 Storybook workbench fixture.
- [x] Capture desktop/mobile screenshots for live `/admin/intake` v2 dashboard.
- [ ] Add css-visual-diff coverage for target workbench fixture and major `/admin/intake` screens.
- [x] Remove obsolete v1 stories or rewrite them as v2 stories.
- [x] Remove deprecated renderer branches once all fixtures and flows are migrated.
- [ ] Update Admin DSL v2 docs/changelog/diary with final cutover results.
- [ ] Upload final Admin DSL v2 screenshots/docs bundle to reMarkable.

## Phase 16 — Widget IR and design-language workflow reset

- [x] Create Widget Definition IR YAML schema v2 and migrate widget/support YAML artifacts.
- [x] Add schema-v2 widget scaffold generator with metadata sidecars and provenance headers.
- [x] Add Widget IR to Finished Widget playbook.
- [x] Add Admin DSL design-language IR YAML for shared token/action/layout/typography/data-attribute helpers.
- [x] Add design-language generator and generated shared helper outputs.
- [x] Refactor promoted shell/action widgets to consume generated design-language helpers.
- [ ] Add a design-system lint script that flags raw token imports, hardcoded colors, duplicated action styling helpers, and manual Admin DSL data attributes.
- [x] Decide/enforce ownership boundary: design-language generator owns `widgets/shared/*`; widget scaffold generator never writes shared files.
- [ ] Add generated-output freshness checks or manifest for widget/design-language generators.
- [x] Update the widget playbook to require generated-version validation before hand implementation.
- [x] Update the widget playbook to require top-of-file manual-edit changelogs for generated files that are promoted by hand.

## Phase 17 — Promote foundational widget families from IR

- [x] Promote `WorkbenchShell` from `03-shell-widgets.yaml` with metadata, renderer adapter, and hardened Storybook stories.
- [x] Promote `DefaultAdminShell` from `03-shell-widgets.yaml` with metadata, renderer adapter, and hardened Storybook stories.
- [x] Promote `ActionButton` from `04-action-widgets.yaml` with generated design helper usage and hardened Storybook stories.
- [x] Promote `ActionGroup` from `04-action-widgets.yaml` with generated design helper usage and hardened Storybook stories.
- [x] Promote `PageHeader` from `05-layout-widgets.yaml` with metadata, renderer adapter, and hardened Storybook stories.
- [x] Promote `DashboardGrid` from `05-layout-widgets.yaml` with metadata, renderer adapter, and hardened Storybook stories.
- [x] Promote `Panel` from `05-layout-widgets.yaml` with metadata, renderer adapter, and Storybook coverage.
- [x] Promote `Toolbar`, `SplitPane`, `Tabs`, `FilterBar`, and `SearchBox` from `05-layout-widgets.yaml` with metadata, renderer adapters, and Storybook coverage.
- [x] Promote `ResourceTable` and related resource widgets from `06-resource-widgets.yaml`.
- [ ] Promote data-display widgets from `07-data-display-widgets.yaml` after layout/resource boundaries stabilize.

## Phase 18 — Renderer adapter shrink-down

- [x] Move workbench/default shell rendering out of `render.tsx` into typed widgets.
- [x] Move action button/group rendering out of `render.tsx` into typed widgets.
- [x] Move `pageHeader` rendering out of the main renderer switch into `PageHeader` plus adapter mapping.
- [x] Move `dashboardGrid` rendering out of the main renderer switch into `DashboardGrid` plus adapter mapping.
- [x] Move `panel` rendering out of the main renderer switch into `Panel` plus adapter mapping.
- [x] Move `toolbar`, `splitPane`, `tabs`, `filterBar`, and `searchBox` rendering out of the main renderer switch into typed widgets plus adapter mappings.
- [x] Move `resourceTable` rendering out of the main renderer switch into `ResourceTable` plus part widgets and adapter mapping.
- [x] Keep raw Admin DSL JSON parsing, action dispatch, and child rendering in adapter code for promoted 05/06 widgets.
- [ ] Remove remaining duplicated inline action/layout styling from `render.tsx` as later widget families are promoted.

## Phase 19 — Widget validation, screenshots, and documentation cadence

- [ ] For every promoted widget, add or harden desktop/mobile Storybook scenarios with visibly distinct fixtures and callback probes.
- [x] For 05/06 promoted widgets, run `cd web && npx tsc --noEmit`.
- [x] For 05/06 promoted widget families, run `cd web && pnpm test -- --runInBand` and `cd web && npx storybook build --quiet`.
- [ ] Capture Storybook iframe screenshots for promoted widget families when visual behavior changes materially.
- [ ] Update the diary, changelog, related files, and tasks after each reviewable widget family boundary.
- [ ] Upload or locally render final widget extraction docs once reMarkable sync works again.

## Phase 20 — Design-system remediation from intern review

- [x] Add generated shared selection pill styling to the design-language IR/generator.
- [x] Refactor `Tabs` and `FilterBar` to use the shared selection pill helper instead of local pill CSS.
- [x] Replace raw token imports in `SearchBox` with `adminTokens`/`adminTextStyle` where possible.
- [x] Replace raw token imports in `ResourceTable`, `BulkActionBar`, and `PaginationBar` with shared design helpers where possible.
- [x] Move resource badge/status tone styling into a shared generated helper and refactor `ResourceTableCell`.
- [x] Fix `ResourceTable` pagination action semantics so pagination actions are not routed through bulk action callbacks.
- [x] Remove dead `renderTableCell(...)` from `render.tsx`.
- [x] Document or replace transitional `as unknown as` casts in the `resourceTable` adapter.
- [x] Run `cd web && npx tsc --noEmit`, `cd web && pnpm test -- --runInBand`, and `cd web && npx storybook build --quiet` after remediation.

## Phase 21 — Widget playbook compliance audit remediation

- [x] Record and review the layout-widget compliance audit diary/report (`reference/07...`, `reference/08...`) and keep the verification addendum with current-source corrections.
- [x] Harden `Panel.stories.tsx` with distinct default/compact/no-padding/toolbar/footer/body-only/nested/mobile fixtures, visible callback probe output, manual edit changelog, and Storybook validation.
- [x] Harden `Toolbar.stories.tsx` with distinct default/many-actions/mobile-touch/callback-probe fixtures, manual edit changelog, and Storybook validation.
- [x] Harden `SplitPane.stories.tsx` with distinct master-detail/two-panel/mobile-stacked fixtures, manual edit changelog, and Storybook validation.
- [x] Harden `Tabs.stories.tsx` with distinct active/read-only/wrapping-mobile/callback-probe fixtures, manual edit changelog, and Storybook validation.
- [x] Harden `FilterBar.stories.tsx` with distinct active/many-filters/read-only/callback-probe fixtures, manual edit changelog, and Storybook validation.
- [x] Harden `SearchBox.stories.tsx` with initial-value/no-action/submit-callback-probe fixtures, manual edit changelog, and Storybook validation.
- [x] Add explicit `density` contract documentation to the Panel YAML and `Panel.types.ts` without force-regenerating the hand-promoted widget implementation.
- [x] Move Panel density padding into generated shared design-language helpers and refactor both `Panel.tsx` and the `render.tsx` panel adapter to use it or remove duplicated adapter logic.
- [x] Replace `Panel`'s manual `data-admin-dsl-density` with a generated/shared data-attribute helper or a documented `dataAttrsFromRecord` pattern.
- [x] Classify and clean remaining `render.tsx` `as unknown as` casts: replace trivial ID-default casts with a helper and normalize/document action/context casts.
- [x] Update `scripts/05-scaffold-admin-dsl-widgets.py` to import only shared types actually used by each generated `.types.ts` file.
- [x] Re-run the widget playbook compliance audit for `06-resource-widgets.yaml`, `07-data-display-widgets.yaml`, `08-media-widgets.yaml`, and `09-calendar-widgets.yaml` after layout Storybook backfill.
- [x] Add a CI/local validation target that runs the Storybook scaffold triage, design-system lint, `cd web && npx tsc --noEmit`, `cd web && pnpm test -- --runInBand`, and `cd web && npx storybook build --quiet` for widget-promotion batches.
- [x] Bring `06-resource-widgets.yaml` part-widget stories to full playbook compliance: manual story changelogs, visible callback probes for `BulkActionBar`, `PaginationBar`, and `ResourceTableCell`, and ResourceTable row/bulk/pagination context evidence.
- [x] Promote `07-data-display-widgets.yaml` in playbook-complete batches with implementation, renderer adapters, story hardening, callback probes where applicable, validation, diary, and changelog.
- [x] Promote `08-media-widgets.yaml` in playbook-complete batches with populated/empty/missing-media/mobile stories and image callback probes.
- [x] Promote `09-calendar-widgets.yaml` in playbook-complete batches with marker/selection/navigation/mobile stories and calendar/event callback probes.
- [x] Promote `10-form-widgets.yaml` in playbook-complete batches with form lifecycle/error/action stories and form/save callback probes.

## Phase 22 — Form field widget extraction

- [x] Add a dedicated form-field Widget IR source for concrete field widgets that are still rendered by `FieldPreview` in `render.tsx`.
- [x] Define and scaffold shared field chrome (`FieldShell`) so label/help/error/disabled/read-only styling is not duplicated across field widgets.
- [x] Promote `TextField` with typed props, Storybook variants, and renderer adapter coverage.
- [ ] Promote `TextareaField` with typed props, Storybook variants, and renderer adapter coverage.
- [ ] Promote `SelectField` with typed props, option fixtures, Storybook variants, and renderer adapter coverage.
- [ ] Promote `SwitchField` with typed props, checked/unchecked/disabled Storybook variants, and renderer adapter coverage.
- [ ] Promote date/time/numeric field leaves (`DateField`, `TimeField`, `MoneyField`, `DurationField`) with typed props, mobile/error variants, and renderer adapter coverage.
- [ ] Promote `ImageField` with empty/filled/error/disabled Storybook variants and renderer adapter coverage.
- [ ] Replace the remaining `FieldPreview` branch in `render.tsx` with typed widget adapters and remove obsolete inline field styling.
- [ ] Add or update tests that assert existing field rendering/accessibility contracts survive extraction.
- [ ] Run scoped form-field validation (`tsc`, widget promotion validator, Vitest, Storybook build) and record findings in the diary/changelog.
