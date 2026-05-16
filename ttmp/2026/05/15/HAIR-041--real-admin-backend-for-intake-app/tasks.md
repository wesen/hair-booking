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
