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

- [ ] Add actionable tabs/filter/search controls.
- [x] Add `resourceTable` or `dataTable` primitive.
- [ ] Add pagination/bulk action support.
- [ ] Add `editableList` or `reorderableList` primitive.
- [ ] Add `monthAvailabilityGrid` primitive.
- [x] Add `imageGallery` or `mediaViewer` primitive.
- [ ] Add `previewFrame` or route-level preview bridge.
- [ ] Add `diffView` or `changeSummary` primitive.
- [ ] Fix duplicate desktop/mobile surface accessibility behavior.

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

- [ ] Implement config versions screen.
- [ ] Implement create-draft-from-active action.
- [ ] Implement services/categories editor.
- [ ] Implement tone options editor.
- [ ] Implement budget options editor.
- [ ] Implement price range editor.
- [ ] Implement availability and time slot editors.
- [ ] Implement config validation report.
- [ ] Implement publish confirm modal.
- [ ] Implement publish transaction and audit event.

## Phase 8 — Preview, audit, health, and stress testing

- [ ] Implement draft customer intake preview.
- [ ] Implement audit log screen.
- [ ] Implement health/diagnostics screen.
- [ ] Add Playwright smoke for submit-customer-request -> admin-review.
- [ ] Add Playwright/css-visual-diff screenshots for all major screens.
- [ ] Record stress-test findings and split follow-up tickets as needed.

## Phase 9 — Final validation and docs

- [ ] Run `go test ./... -count=1`.
- [ ] Run `cd web && npx tsc --noEmit`.
- [ ] Run `cd web && pnpm test -- --runInBand`.
- [ ] Update implementation diary.
- [ ] Update changelog.
- [ ] Upload final docs/screenshots bundle to reMarkable.
