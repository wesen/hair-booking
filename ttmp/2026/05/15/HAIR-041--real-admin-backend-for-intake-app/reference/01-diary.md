# Diary

## Goal

Capture the implementation of a real persisted Admin backend foundation for the intake app, including planning, schema/storage, customer submission persistence, and Admin DSL runtime host plumbing.

## Step 1: Create HAIR-041 planning package

This step created the ticket and wrote the first intern-facing implementation guide for a real admin backend around the existing intake DSL app. The guide maps the current customer intake flow, existing config/state schemas, target admin screens, persistent data requirements, missing Admin DSL components, and implementation phases.

The design intentionally treats this work as a stress test: it should build useful admin features while revealing gaps in the Admin DSL renderer/runtime and the app persistence layer.

### Prompt Context

**User prompt (verbatim):** "ok, we want to build out a real fully functional admin backend for our intake app @hair-booking/pkg/dslgoja/flows/intake.flow.js .

What screens need to be built, what data needs to be written to disk, etc...

Create a new docmgr ticket to create a real admin backend, with all the desired functionality and real features. This is a stress test for our setup (it could very well surface real issues that need to be addressed).

Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable.


Add asdcii screenshots of all the screens, and also cover things that wouldn't immediatley be obvious, error states, modals, etc..."

**Assistant interpretation:** Create a new docmgr ticket and a long-form technical guide for building a real admin backend for the intake flow, including screens, persistence, error states, and implementation guidance.

**Inferred user intent:** The user wants to move beyond demos toward production-shaped admin functionality and use the effort to validate the Admin DSL architecture.

**User prompt (verbatim):** "does the dsl allow for these layouts in the first place, do we have enough design components for it?"

**Assistant interpretation:** Assess whether the current Admin DSL and component set can actually implement the proposed screens, and identify missing primitives.

**Inferred user intent:** The user wants architectural realism before implementation begins.

**Commit (code):** Pending in this step.

### What I did
- Created docmgr ticket `HAIR-041`.
- Added design guide `design-doc/01-real-admin-backend-implementation-guide.md`.
- Added diary `reference/01-diary.md`.
- Rewrote `tasks.md` with phases 1-9.
- Added ASCII screenshots for dashboard, request queue, request detail, photo modal, config versions, service editor, tone editor, pricing editor, availability editor, preview, audit, health, and error states.
- Added an explicit Admin DSL/design-component readiness assessment.
- Related the core current-system files to the design guide.

### Why
- The implementation needs a shared target before schema/runtime changes begin.
- The component readiness section prevents assuming the DSL can already express dense real admin workflows.

### What worked
- The existing ticket/docmgr flow was sufficient to create the planning package.
- Current source files provided enough context to map the customer intake flow and Admin DSL route.

### What didn't work
- N/A for this planning step.

### What I learned
- The current Admin DSL can start the work but needs semantic primitives such as resource tables, image galleries, preview frames, diff views, and actionable filters.

### What was tricky to build
- The guide needed to separate generic Admin DSL responsibility from app-owned storage/mutation semantics. The design preserves that boundary.

### What warrants a second pair of eyes
- Review whether the proposed schema belongs in a new `pkg/intakeadmin` package or should be grouped under an existing domain package.
- Review the list of missing Admin DSL primitives to avoid overbuilding before the pressure is real.

### What should be done in the future
- Upload the guide to reMarkable after Phase 1 docs settle.

### Code review instructions
- Start with `design-doc/01-real-admin-backend-implementation-guide.md`.
- Check that tasks in `tasks.md` align with the implementation plan.

### Technical details
- Ticket path: `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/`.

## Step 2: Add intake admin persistence schema and store

This step created the first app-owned persistence package for the real intake admin backend. The package defines durable request, request-event, admin-audit, and admin-flow-session tables, plus a Go store that can create/list/update intake requests and manage config draft/publish basics.

The intent is to keep domain write semantics outside the generic Admin DSL runtime. Admin flows will eventually call this store through narrow host modules rather than issuing arbitrary SQL from JavaScript.

### Prompt Context

**User prompt (verbatim):** "work on phase 1-4. commit at appropriate intervals, keep a diary as you work."

**Assistant interpretation:** Begin implementing the planned HAIR-041 foundation, commit coherent increments, and keep the ticket diary current.

**Inferred user intent:** The user wants actual backend foundations, not just planning docs, while preserving a reviewable implementation narrative.

**Commit (code):** Pending in this step.

### What I did
- Added `pkg/intakeadmin/schema.sql`.
- Added `pkg/intakeadmin/store.go`.
- Added `pkg/intakeadmin/store_test.go`.
- Implemented `ProvisionSchema` for admin-domain state tables.
- Implemented `CreateRequest`, `ListRequests`, `GetRequest`, `UpdateRequestStatus`, and `DashboardStats`.
- Implemented config draft creation by copying active config rows to a new draft config version.
- Implemented basic config publish with validation and active/archive transition.
- Validated with `go test ./pkg/intakeadmin -count=1`.

### Why
- The admin backend needs app-owned durable rows before Admin DSL flows can become real.
- The package establishes the boundary between generic UI DSL and salon/intake business semantics.

### What worked
- Existing `dslhost` in-memory DB helpers made it easy to test state and config DB behavior together.
- Draft config copying works against the existing seeded config schema.

### What didn't work
- The first request creation test used a fake `flow_session_id`, which violated the `dsl_flow_sessions` foreign key. The test now omits the session id unless a real session row exists.

### What I learned
- Request rows should allow nullable `flow_session_id` for admin-imported/test-created requests, while real customer submissions can still set the session id.

### What was tricky to build
- Config draft copying needs to preserve app-facing values while generating new primary ids. The current implementation appends the draft id to copied row ids.

### What warrants a second pair of eyes
- The draft row id strategy is simple and deterministic enough for now, but should be reviewed before production use.
- The publish validation is intentionally minimal and should be expanded before real publish flows are exposed.

### What should be done in the future
- Add numbered migrations or additive migration helpers for the new admin schema before relying on long-lived SQLite files.

### Code review instructions
- Start with `pkg/intakeadmin/schema.sql`.
- Then review `pkg/intakeadmin/store.go` request and config methods.
- Validate with `go test ./pkg/intakeadmin -count=1`.

### Technical details
- The new schema is app-owned and intentionally not part of the generic Admin DSL package.

## Step 3: Persist customer intake submissions from the confirm step

This step wired the customer intake flow to create a real `intake_requests` row when the customer submits the confirm screen. The flow now has a `Submit request` action that calls a narrow app-owned `host/intake` module instead of only looping back to the beginning.

The server installs the host module into the customer DSL runtime and provisions the new intake admin schema when DSL SQLite migration is enabled. This is the first end-to-end bridge from customer-facing DSL state into admin-visible persistent state.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Continue HAIR-041 phases by making customer intake submission durable.

**Inferred user intent:** The user wants real admin data to exist on disk before building admin review screens.

**Commit (code):** Pending in this step.

### What I did
- Extended `dslgoja.RuntimeHost` with app-owned native module factories.
- Registered `host/intake` in `pkg/server/handlers_dsl.go`.
- Added `pkg/server/host_intake_module.go` with `createRequest(...)` and `dashboardStats()` exports.
- Updated `pkg/server/http.go` to create an `intakeadmin.Store` and provision its schema when migration is enabled.
- Updated `pkg/dslgoja/flows/intake.flow.js` confirm step:
  - title is now `Review and submit` until submission.
  - added `Submit request` button.
  - `Submit request` calls `host/intake.createRequest(...)` with config version, service, tones, damage, photos, budget, day, time, estimate, and summary labels.
  - after save, confirm page shows the persisted request id.
- Added server regression test `TestDSLConfirmCreatesPersistedIntakeRequest`.
- Validated with `go test ./pkg/dslgoja ./pkg/server ./pkg/intakeadmin -count=1`.

### Why
- Admin review screens need durable customer requests.
- The customer DSL runtime should not directly know SQL table shapes; it calls a host module with a domain payload.

### What worked
- The end-to-end HTTP test starts the DSL flow, advances through the steps, submits the confirm page, and verifies an `intake_requests` row exists.

### What didn't work
- The first host module implementation used `goja.ExportTo` directly into a Go struct. The camelCase JS payload did not reliably populate the Go struct fields, so `configVersionId` appeared missing. I changed the module to marshal the exported JS object to JSON and unmarshal into the tagged Go struct.

### What I learned
- For JS ↔ Go data contracts with JSON tags, JSON round-tripping is more predictable than relying on goja struct export behavior.

### What was tricky to build
- The host module needs access to the current flow session to fill `flow_session_id` and `user_id`. The generic runtime now accepts module factories keyed by module name so app modules can be installed per session.

### What warrants a second pair of eyes
- `host/intake.createRequest` currently trusts photo references from flow state. A follow-up must verify uploads belong to the same session/user before marking Phase 3 fully complete.
- `NewHandler` currently provisions the intake admin schema during handler construction when migration is enabled; review whether this belongs closer to `dslhost.OpenDB` or server startup.

### What should be done in the future
- Add stricter upload/session ownership checks.
- Add idempotency for repeated submit events if a browser retries after a network failure.

### Code review instructions
- Review `pkg/dslgoja/host.go` and `pkg/dslgoja/modules_dsl.go` for the native module factory hook.
- Review `pkg/server/host_intake_module.go` for the customer submission boundary.
- Review `pkg/dslgoja/flows/intake.flow.js` confirm behavior.
- Validate with `go test ./pkg/dslgoja ./pkg/server ./pkg/intakeadmin -count=1`.

### Technical details
- The immediate persistent row is in `intake_requests`.
- `flow_session_id` is filled by the host module from the current DSL session.

## Step 4: Add real intake admin flow registry and host modules

This step moved the Admin DSL runtime from a one-flow hard-coded services demo toward a registry capable of serving a real intake admin flow. It also added app-owned admin host modules that expose dashboard/request/config data from `pkg/intakeadmin` to Goja-authored Admin DSL pages.

The new `/admin/intake` frontend route starts `fringe.admin.intake.v1`, which renders a first real dashboard backed by persisted intake request rows and config version data. This is still the beginning of Phase 4: role enforcement and fully audited mutation wrappers remain open.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Continue phases 1-4 by adding Admin DSL runtime host modules and a real intake admin flow route.

**Inferred user intent:** The user wants the admin side to stop being only an in-memory services demo and begin reading real backend data.

**Commit (code):** Pending in this step.

### What I did
- Extended `pkg/admindsl.ScriptRuntime` with `WithNativeModule(...)`.
- Added Admin DSL Goja module exports for dashboard/layout primitives needed by the intake admin flow:
  - `pageDashboard`
  - `toolbar`
  - `cardGrid`
  - `metricCard`
  - `summaryCard`
  - `emptyState`
  - `markdown`
- Added `pkg/admindsl/flows/intake_admin.flow.js`.
- Embedded it as `admindsl.IntakeAdminFlowSource`.
- Added `pkg/server/host_intake_admin_module.go`:
  - `host/intake-admin.dashboardStats()`
  - `host/intake-admin.listRequests(filters)`
  - `host/intake-admin.listConfigVersions()`
  - `host/intake-admin.createDraftFromActive(label)`
  - `host/intake-preview.validateConfig(configVersionId)`
- Replaced the hard-coded Admin DSL flow start branch with a registry containing:
  - `fringe.admin.services.v1`
  - `fringe.admin.intake.v1`
- Added `/admin/intake` route in `web/src/App.tsx`.
- Made `BackendAdminDslPage` accept a `flowId` prop and use per-flow sessionStorage keys.
- Added HTTP regression coverage for starting the real intake admin flow against SQLite-backed state/config DBs.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server ./pkg/intakeadmin ./pkg/dslgoja -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 43 tests passed.

### Why
- A real admin backend needs host modules and a flow registry before individual screens can grow.
- `/admin/intake` gives the project a concrete route for the real backend while `/admin/services` can remain a smaller demo/smoke route.

### What worked
- The intake admin dashboard can start through the existing Admin DSL protobuf HTTP transport.
- The flow can read persisted request counts and config version data through `host/intake-admin`.
- Existing services flow tests continue to pass through the registry.

### What didn't work
- The first version of `intake_admin.flow.js` used `admin.pageDashboard(...)`, but the Goja module only exposed `pageResource` and `pageAdmin`. I added the missing exports and the small builder helpers needed by the new flow.

### What I learned
- The Admin DSL Go package already had more builder functions than the Goja module exposed. Real backend flows will continue to reveal export gaps.

### What was tricky to build
- The runtime-level module registration is global to the `ScriptRuntime`, while actor identity should eventually be request/session-specific. This step uses a dev-local actor for the initial host module. A production-ready role/actor model is still needed.

### What warrants a second pair of eyes
- Review whether host modules should be registered globally, per flow definition, or per session with actor context.
- Review whether the first intake admin flow should remain one flow with internal screens or split into multiple flow ids.

### What should be done in the future
- Implement real admin auth/role guard.
- Add audited mutation wrappers for every `host/intake-admin` write.
- Persist Admin DSL sessions if multi-step admin edits become long-lived.

### Code review instructions
- Start with `pkg/server/handlers_admin_dsl.go` for the registry change.
- Review `pkg/server/host_intake_admin_module.go` for host module boundaries.
- Review `pkg/admindsl/flows/intake_admin.flow.js` for first-screen behavior.
- Review `web/src/admin-dsl/BackendAdminDslPage.tsx` and `web/src/App.tsx` for frontend routing.

### Technical details
- New route: `/admin/intake`.
- New flow id: `fringe.admin.intake.v1`.
- Existing route preserved: `/admin/services` -> `fringe.admin.services.v1`.

## Step 5: Final Phase 1-4 validation and reMarkable upload

This step validated the accumulated HAIR-041 Phase 1-4 work and uploaded the planning/design bundle to reMarkable. The implementation now has a documented target, persistent admin-domain storage, customer intake submission persistence, and a first real `/admin/intake` Admin DSL flow backed by host modules.

The remaining Phase 3/4 gaps are intentionally tracked rather than hidden: upload ownership checks, audited mutation wrappers, and admin auth/role guards still need implementation before this should be considered production-safe.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Validate, document, and publish the Phase 1-4 foundation after committing implementation increments.

**Inferred user intent:** The user wants a clean review point with docs, tests, and reMarkable delivery.

**Commit (code):** Pending in this step.

### What I did
- Ran full backend validation:
  - `go test ./... -count=1`
- Ran frontend validation:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
- Uploaded the HAIR-041 design/tasks bundle to reMarkable:
  - `/ai/2026/05/15/HAIR-041/HAIR 041 Real Intake Admin Backend Guide.pdf`
- Marked Phase 1 upload/file-relation tasks complete.

### Why
- Phase 1-4 changed runtime, server, frontend route, and persistence code, so a full validation pass was warranted.
- The guide was requested for reMarkable review.

### What worked
- Full Go test suite passed.
- Frontend typecheck passed.
- Vitest passed: 10 files, 43 tests.
- reMarkable upload succeeded.

### What didn't work
- N/A in this validation step.

### What I learned
- The Phase 1-4 slice is now coherent enough to hand to another developer for review: the docs describe the target and the code has the first persistent request/admin-flow bridge.

### What was tricky to build
- Keeping the ticket tasks honest was important: not all Phase 3/4 items are complete, so the unchecked items remain visible.

### What warrants a second pair of eyes
- Review the remaining unchecked Phase 3/4 tasks before starting Phase 5+.

### What should be done in the future
- Start Phase 5 by adding the missing Admin DSL components under real pressure from the request queue/config editor screens.

### Code review instructions
- Review commits `43bf4a3`, `741a155`, and `03af3fc` after the planning commit.
- Validate with the commands listed above.

### Technical details
- reMarkable destination: `/ai/2026/05/15/HAIR-041`.

## Step 6: Add resource tables, image gallery, and request review flow

This step started Phase 5 and Phase 6 by adding the first two missing Admin DSL primitives that the real intake backend immediately needed: a dense `resourceTable` for request/config queues and an `imageGallery` for uploaded intake photos. The intake admin flow now uses those primitives for a dashboard, request queue, request detail screen, config table, and photo review section.

The request review flow is now backed by persisted `intake_requests`: admins can open a request from the dashboard/queue, inspect summary/photo/raw snapshot data, and apply status transitions such as reviewing, needs-info, and archive through `host/intake-admin`.

### Prompt Context

**User prompt (verbatim):** "do phases 5-6"

**Assistant interpretation:** Continue HAIR-041 by adding the missing Admin DSL components needed for real admin layouts and building out the dashboard/request review screens.

**Inferred user intent:** The user wants the admin backend to move from plumbing to usable screens, while still surfacing remaining component gaps honestly.

**Commit (code):** Pending in this step.

### What I did
- Added Admin DSL node kinds:
  - `resourceTable`
  - `imageGallery`
- Added Go builders and Goja exports:
  - `admin.resourceTable(...)`
  - `admin.imageGallery(...)`
- Added React renderer support for:
  - table columns/rows with row action dispatch and row values,
  - gallery tiles with stored and missing-photo states.
- Added frontend regression coverage for `resourceTable` row-value dispatch.
- Extended `host/intake-admin` with:
  - `getRequest(id)`
  - `updateRequestStatus(id, status, note)`
- Made host module return JSON-shaped values so JavaScript sees camelCase fields from Go structs reliably.
- Reworked `pkg/admindsl/flows/intake_admin.flow.js`:
  - dashboard uses request table for recent requests,
  - request queue uses `resourceTable` and simple New/All filters,
  - request detail shows summary cards, internal notes, image gallery, and raw request snapshot,
  - status toolbar actions update persisted request status,
  - config versions screen uses `resourceTable`.
- Extended server HTTP test to open a request from the real intake admin flow and verify the request-detail page renders.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server ./pkg/intakeadmin -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Why
- The existing card-row list was not enough for a realistic request queue.
- The admin backend needs a photo-specific primitive because intake photos are operationally important and have missing-blob/error states.

### What worked
- `resourceTable` is enough to make the request queue and config versions feel closer to a real admin tool.
- Row actions can dispatch the selected row object back to Goja, which keeps browser actions opaque while still passing row context.
- `imageGallery` can show uploaded image metadata or explicit missing-photo tiles.

### What didn't work
- This step did not implement a full photo modal; the gallery is inline for now. The task remains partially open because the requested modal/lightbox behavior still needs a surface flow.
- Tabs/filter/search are still not generalized. The request queue uses toolbar actions for New/All filters rather than a reusable actionable filter primitive.

### What I learned
- Real screens quickly reveal which DSL gaps matter first. `resourceTable` and `imageGallery` were more immediately valuable than speculative navigation/diff components.
- Goja host modules should return JSON-shaped maps/slices when exposing Go structs with JSON tags.

### What was tricky to build
- `resourceTable` needed to preserve backend-owned action ids while still sending row context. The renderer dispatches the row object as the event value, and the backend callback uses `event.value.id` to load the request.

### What warrants a second pair of eyes
- Review the `resourceTable` prop contract before more screens depend on it. It currently supports columns, rows, empty title, and one row action.
- Review accessibility of row action buttons and table responsiveness.
- Review whether request status transitions should use confirmation surfaces for archive/decline.

### What should be done in the future
- Add pagination, sorting, and bulk action support to `resourceTable`.
- Add a real photo modal/lightbox surface from gallery tiles.
- Add actionable `filterBar`, `tabs`, and `searchBox` primitives.

### Code review instructions
- Start with `web/src/admin-dsl/render.tsx` for `resourceTable` and `imageGallery` rendering.
- Review `pkg/admindsl/types.go`, `builder.go`, `goja_module.go`, and `validate.go` for schema/builder additions.
- Review `pkg/admindsl/flows/intake_admin.flow.js` for request review behavior.
- Validate with the commands listed above.

### Technical details
- `resourceTable` row action dispatch shape:
  - node kind: `resourceTable`
  - action: opaque backend `request.open`
  - value: row object, including `id`

## Step 7: Add photo gallery modal behavior

This step completed the request-review photo surface by making `imageGallery` actionable and adding a modal viewer in the intake admin flow. Gallery tiles now dispatch the selected image object, and the request detail screen opens a `photoViewer` modal that shows stored-photo metadata or a clear missing-photo message.

This is still not a full lightbox with image zoom/download/redaction, but it covers the Phase 6 requirement that photo review include an explicit modal surface and missing-photo error state.

### Prompt Context

**User prompt (verbatim):** (same as Step 6)

**Assistant interpretation:** Close the remaining Phase 6 photo-modal gap after adding the initial inline image gallery.

**Inferred user intent:** The admin request review screen should cover non-obvious photo error states, not just show a happy-path grid.

**Commit (code):** Pending in this step.

### What I did
- Updated `web/src/admin-dsl/render.tsx` so `imageGallery` can dispatch selected image values when an action is attached.
- Updated `pkg/admindsl/flows/intake_admin.flow.js` to attach `photo.open` to request photos.
- Added a `photoViewer` modal with stored-photo and missing-photo body text.
- Added frontend regression coverage for gallery click dispatch.
- Marked the Phase 6 photo modal/missing-photo task complete.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server ./pkg/intakeadmin -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 45 tests passed.

### Why
- Real intake review depends heavily on uploaded photos, and missing blob/object states must be explicit.

### What worked
- The existing Admin DSL modal/surface model was enough to add this without a new specialized modal primitive.

### What didn't work
- Full lightbox interactions remain future work: previous/next, open original, redact, and download-all are not implemented yet.

### What I learned
- `imageGallery` should probably grow first-class action slots such as `open`, `download`, and `redact` if media review becomes central.

### What was tricky to build
- The renderer had to preserve the card-like visual while swapping from passive `article` to actionable `button` when a backend action exists.

### What warrants a second pair of eyes
- Review the accessibility label `Open <title>` and keyboard behavior for gallery tiles.

### What should be done in the future
- Add open-original/download/redact actions and maybe a richer `mediaViewer` primitive.

### Code review instructions
- Review `web/src/admin-dsl/render.tsx:imageGallery`.
- Review `pkg/admindsl/flows/intake_admin.flow.js:requestDetailScreen`.
- Validate with the commands listed above.

### Technical details
- Missing-photo modal text is derived from empty `url`/`publicUrl` in the persisted photo object.

## Step 8: Add Storybook coverage for new Admin DSL data components

The new `resourceTable` and `imageGallery` primitives had backend/frontend tests, but they did not yet have the requested broad Storybook visual coverage. This step adds a dedicated Storybook catalog for the new data components so future design/component work can be reviewed visually before wiring more live admin behavior.

The stories cover happy paths, empty states, dense desktop tables, mobile table scrolling, mixed stored/missing photo galleries, modal missing-photo copy, and a composed request-review screen that combines the new primitives with existing cards and surfaces.

### Prompt Context

**User prompt (verbatim):** "actually, don't forget to add a opious amounts of storybook stories for each new widget and dsl component. Did you do so for the new modules already?"

**Assistant interpretation:** The user is asking whether the newly added Admin DSL primitives already have extensive Storybook coverage, and wants that coverage added if missing.

**Inferred user intent:** The user wants visual/design review coverage to stay in lockstep with new DSL/component primitives, not arrive later as an afterthought.

**Commit (code):** Pending in this step.

### What I did
- Confirmed that the previous `resourceTable`/`imageGallery` work had tests but no dedicated Storybook catalog yet.
- Added frontend builder helpers:
  - `resource.table(...)`
  - `admin.imageGallery(...)`
- Added `web/src/admin-dsl/AdminDslDataComponents.stories.tsx`.
- Added stories:
  - `RequestTableWithRowActions`
  - `RequestTableDenseDesktop`
  - `RequestTableMobileScroll`
  - `RequestTableEmptyState`
  - `ConfigVersionsTable`
  - `ImageGalleryStored`
  - `ImageGalleryMixedMissingBlob`
  - `ImageGalleryEmptyState`
  - `ImageGalleryModalMissingPhoto`
  - `ComposedRequestReview`
  - `ComposedRequestReviewMobile`
- Updated HAIR-041 tasks to explicitly track Storybook coverage for new primitives.
- Validated:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 45 tests passed.

### Why
- `resourceTable` and `imageGallery` are reusable Admin DSL primitives and need visual fixtures for desktop/mobile and edge states.
- Storybook is the fastest review surface for new DSL components before live backend state exists for every case.

### What worked
- Existing `AdminPageRenderer` made it straightforward to build screenshot-friendly static pages for the new primitives.
- The builder helpers kept stories readable and aligned with other Admin DSL stories.

### What didn't work
- N/A.

### What I learned
- The project needs a rule: every new Admin DSL node kind should land with tests and a Storybook catalog entry in the same commit or adjacent commit.

### What was tricky to build
- The stories needed to include edge cases, not just happy-path screenshots, so missing-blob and empty table/gallery states were included explicitly.

### What warrants a second pair of eyes
- Review whether `Admin DSL/Data Components` is the right sidebar location or whether these should be split into `Tables` and `Media` subsections later.

### What should be done in the future
- Add visual stories in the same style for upcoming `editableList`, `monthAvailabilityGrid`, `previewFrame`, and `diffView` primitives.

### Code review instructions
- Open Storybook section `Admin DSL/Data Components`.
- Review desktop and mobile variants.
- Validate with `cd web && npx tsc --noEmit` and `cd web && pnpm test -- --runInBand`.

### Technical details
- The stories are static fixtures; live backend behavior remains covered by `/admin/intake` and HTTP tests.

## Step 9: Complete Phase 5 Admin DSL component gap pass

This step completed the remaining HAIR-041 Phase 5 component-gap pass and tightened Phase 6 request-review controls. The Admin DSL now has first-pass primitives for actionable controls, editable/reorderable lists, month availability editing, preview frames, diff/change summaries, and table pagination/bulk actions, all with Storybook fixtures.

The implementations are intentionally pragmatic first versions. They make the real intake admin backend possible without pretending every primitive is final: pagination is metadata/action based, editable list reorder handles are visual for now, preview frame can embed a route or show a placeholder, and diff view is a readable before/after summary rather than a full merge tool.

### Prompt Context

**User prompt (verbatim):** "phase 5 + 6"

**Assistant interpretation:** Continue and finish the Phase 5 component gaps while keeping Phase 6 request review usable.

**Inferred user intent:** The user wants the Admin DSL surface to be broad enough to support the real intake admin backend, not just the first request-review path.

### What I did
- Added Admin DSL node kinds and Go/Goja builders for:
  - `editableList`
  - `monthAvailabilityGrid`
  - `previewFrame`
  - `diffView`
- Made `tabs`, `filterBar`, and `searchBox` actionable in the React renderer.
- Added `resourceTable` pagination/footer rendering, visible-row bulk action bar, and selectable checkboxes.
- Removed duplicate desktop/mobile side-surface rendering; side surfaces now render once and stack responsively, reducing duplicate accessible controls.
- Updated `/admin/intake` request queue to use actionable `filterBar` and `searchBox` instead of purely toolbar-based filters.
- Added frontend builder helpers for advanced components.
- Added `web/src/admin-dsl/AdminDslAdvancedComponents.stories.tsx` with extensive stories for:
  - actionable controls,
  - editable list normal/dense/empty,
  - month availability normal/readonly/dense,
  - preview frame placeholder/iframe/mobile,
  - diff view publish/conflict/empty,
  - resource table pagination/bulk,
  - advanced matrix desktop/mobile.
- Added frontend regression coverage for actionable filter/search controls.
- Marked Phase 5 tasks complete.
- Validated:
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 46 tests passed.

### Why
- The planned real admin backend needs more than request rows and image tiles. Config editing, availability, preview, publish, and conflict/error workflows need reusable DSL primitives.
- Storybook coverage was explicitly required for every new widget/DSL component.

### What worked
- The Admin DSL's explicit interpreter model made it straightforward to add new semantic node kinds without dynamic component lookup.
- Storybook fixtures provide good visual review coverage before each primitive is used deeply in live flows.

### What didn't work
- These are first-pass primitives, not production-complete widgets. For example, `editableList` does not implement drag-and-drop yet, and `diffView` does not support field-level merge actions.

### What I learned
- The current renderer can absorb a fairly broad set of admin primitives while keeping the JSON DSL explicit and understandable.
- The strongest pattern is still semantic primitive first, app-specific meaning in props/data.

### What was tricky to build
- `resourceTable` needed to support row actions, bulk actions, selectable UI, and pagination without taking over table state locally. The first version keeps backend ownership by dispatching action payloads such as visible rows or selected row data.
- Removing duplicate side surfaces required simplifying the responsive layout so the same surface DOM stacks on mobile instead of rendering a second copy.

### What warrants a second pair of eyes
- Review the prop contracts for all first-pass Phase 5 primitives before Phase 7 depends on them heavily.
- Review accessibility for actionable tabs, filters, search, table selection, and availability day buttons.
- Review whether `previewFrame` should allow arbitrary iframe URLs or only internal preview routes.

### What should be done in the future
- Add drag-and-drop/reorder event semantics for `editableList`.
- Add real page/selection state for `resourceTable` once pagination/bulk workflows become live.
- Expand `diffView` with grouped entity diffs and publish/rollback actions.

### Code review instructions
- Start with `web/src/admin-dsl/render.tsx` for renderer semantics.
- Review `pkg/admindsl/types.go`, `builder.go`, `goja_module.go`, and `validate.go` for schema/builder changes.
- Review `web/src/admin-dsl/AdminDslAdvancedComponents.stories.tsx` in Storybook under `Admin DSL/Advanced Components`.
- Validate with the commands listed above.

### Technical details
- New Storybook section: `Admin DSL/Advanced Components`.
- New/expanded request queue controls are in `pkg/admindsl/flows/intake_admin.flow.js`.

## Step 10: Write Obsidian deep-dive report for the Admin DSL technique

This step captured the Admin DSL design and implementation work as a standalone Obsidian project report. The report focuses on the technique behind the backend-driven Admin DSL: pages as data, explicit React interpretation, Goja-hosted backend callbacks, protobuf transport, app-owned persistence, and the way HAIR-041 pressure-tested the design with a real intake admin backend.

The report is intentionally written as a technical article rather than a ticket status note. It explains the reusable principles behind the implementation so the pattern can be understood outside the immediate HAIR-041 code changes.

### Prompt Context

**User prompt (verbatim):** "Create a deep-dive technical project report about the design and implementation work on the ADMIN DSL, store it in the Obsidian vault, and write it in a textbook style without analogies. The article should showcase the technique and principles behind the DSL approach."

**Assistant interpretation:** Write a long-form Obsidian project report that explains the Admin DSL architecture and implementation principles in a clear textbook style.

**Inferred user intent:** The user wants durable knowledge capture for the Admin DSL approach, not only code commits and ticket notes.

**User prompt (verbatim):** "continue, what's next? Don't forget to commit at appropriate intervals and to keep a detailed diary."

**Assistant interpretation:** Continue the report workflow by committing the Obsidian article and recording the work in the ticket diary.

**Inferred user intent:** The user wants the documentation artifact to be safely committed and the project history kept auditable.

**Commit (docs):** cd75f55 — "Add Fringe Admin DSL backend-driven interfaces report" in `/home/manuel/code/wesen/go-go-golems/go-go-parc`.

### What I did
- Created `/home/manuel/code/wesen/go-go-golems/go-go-parc/Projects/2026/05/16/PROJECT REPORT - Fringe Admin DSL Backend Driven Admin Interfaces Deep Dive.md`.
- Used the prior Admin DSL report as a formatting/style reference.
- Wrote a new report covering:
  - why the Admin DSL exists,
  - page/node/action/surface model,
  - React renderer as an explicit interpreter,
  - Goja backend execution and page-version-scoped action dispatch,
  - real `/admin/intake` backend flow,
  - app-owned persistence through `pkg/intakeadmin`,
  - Storybook as a DSL contract surface,
  - protobuf transport boundaries,
  - implementation invariants,
  - current status and unfinished production hardening.
- Committed only the new Obsidian report file in the PARC vault.
- Left `.obsidian/workspace.json` unstaged because it only contained local Obsidian UI state changes.

### Why
- The Admin DSL work now spans multiple tickets and several architectural layers. A single textbook-style article makes the technique easier to review, reuse, and explain.
- The report complements the HAIR-041 diary by emphasizing reusable design principles rather than only chronological implementation steps.

### What worked
- The previous Obsidian project report provided a useful frontmatter and article structure.
- The existing HAIR-039/040/041 implementation details were enough to write a concrete report with file paths, flow diagrams, and code-bound examples.
- The vault commit was cleanly scoped to the new report file.

### What didn't work
- The Obsidian vault had unrelated `.obsidian/workspace.json` changes from local UI state. Those were intentionally not committed.

### What I learned
- The most important Admin DSL story is the boundary discipline: fluent authoring is allowed, but transport remains data; the renderer interprets known nodes; app-owned stores perform domain writes.
- HAIR-041 gives the report practical weight because it shows the DSL under real persistence and request-review pressure, not only fixture/demo pressure.

### What was tricky to build
- The report needed to be broad enough to explain HAIR-039 through HAIR-041 while staying focused on the Admin DSL technique. The solution was to organize it around invariants and runtime boundaries rather than a pure chronological changelog.
- The report also needed to avoid treating first-pass primitives as finished production widgets. The status section explicitly distinguishes implemented foundation from remaining hardening.

### What warrants a second pair of eyes
- Review whether the report should also be uploaded to reMarkable, since the original prompt only required Obsidian storage.
- Review whether the report should be cross-linked from HAIR-039 or HAIR-041 reference docs.
- Review the unfinished-production list to ensure no critical Admin DSL hardening item is missing.

### What should be done in the future
- Optionally upload the report to reMarkable as a PDF bundle.
- Optionally add an Obsidian link from the previous Admin DSL report to this newer backend-driven report.
- Continue HAIR-041 Phase 7 with config editing and publishing.

### Code review instructions
- Start with the report in the PARC vault:
  - `/home/manuel/code/wesen/go-go-golems/go-go-parc/Projects/2026/05/16/PROJECT REPORT - Fringe Admin DSL Backend Driven Admin Interfaces Deep Dive.md`
- Compare against the implementation files it references:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/script_runtime.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_admin.flow.js`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/intakeadmin/store.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/render.tsx`

### Technical details
- Obsidian vault commit:
  - `cd75f55 Add Fringe Admin DSL backend-driven interfaces report`
- The report was stored under the append-only project report path for the current date.
- No application code changed in this step.

## Step 11: Upload and link the report, then add the first Phase 7 config publishing flow

This step completed the three requested follow-ups: the new Admin DSL report was uploaded to reMarkable, the prior Admin DSL renderer report was cross-linked to the newer backend-driven report, and HAIR-041 Phase 7 received its first real implementation slice.

The Phase 7 slice makes `/admin/intake` useful for config operations beyond a flat versions table. The admin can create a draft from the active config, inspect services, tones, budgets, pricing, availability, and validation through generic Admin DSL primitives, open a publish confirmation modal, and publish the draft through the app-owned store with an audit event.

### Prompt Context

**User prompt (verbatim):** "1 2 3"

**Assistant interpretation:** Execute the three proposed next steps: upload the report to reMarkable, cross-link it from the previous report, and continue HAIR-041 Phase 7.

**Inferred user intent:** The user wants the documentation artifact delivered, connected to the existing knowledge base, and then wants implementation work to continue with proper commits and diary tracking.

**Commit (docs):** 4114f22 — "Link Admin DSL backend interfaces report" in `/home/manuel/code/wesen/go-go-golems/go-go-parc`.

**Commit (code):** b6eab66 — "HAIR-041 Step 11: Add config editor publishing flow".

### What I did
- Uploaded the new report to reMarkable:
  - remote path: `/ai/2026/05/16/HAIR-041/HAIR 041 Admin DSL Backend Driven Interfaces Deep Dive.pdf`
  - command: `remarquee upload bundle ... --non-interactive`
- Cross-linked the newer backend-driven report from the previous Obsidian Admin DSL renderer report:
  - `/home/manuel/code/wesen/go-go-golems/go-go-parc/Projects/2026/05/15/PROJECT REPORT - Fringe Admin DSL and React Renderer Technique Deep Dive.md`
- Added `pkg/intakeadmin.Store.GetConfigEditorData(...)` and related config DTOs for:
  - service options,
  - tone options,
  - budget options,
  - price ranges,
  - availability days,
  - time slots,
  - validation report.
- Added app-owned audit events for config draft creation and publish actions.
- Exposed new Admin Goja host functions:
  - `host/intake-admin.getConfigEditor(configVersionId)`
  - `host/intake-admin.publishConfigVersion(id)`
- Added `admin.tabs(...)` to the Go-host Admin DSL builder and Goja module export.
- Expanded `pkg/admindsl/flows/intake_admin.flow.js` config screen with:
  - config version row-open action,
  - create-draft action,
  - selected config metrics,
  - tabbed config sections,
  - first-pass services/tones/budgets editable-list views,
  - first-pass price range table,
  - first-pass availability grid and time-slot list,
  - validation diff view,
  - publish modal and publish callback.
- Added regression coverage for config editor data, config audit events, and HTTP flow draft creation.
- Updated Phase 7 task status to mark completed first-pass items honestly while leaving full edit mutations open.
- Validated:
  - `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- Phase 7 needs to validate whether the Phase 5 primitives can support real config workflows.
- The app-owned store should supply config editor data rather than letting the generic Admin DSL know about the intake config schema.
- Publish is a domain mutation and therefore belongs behind `host/intake-admin`, not in the React renderer.

### What worked
- The existing draft-copy and publish store methods were a good base for a richer admin flow.
- The new Phase 5 primitives were sufficient for a first-pass config editor without adding more frontend components.
- Server-side flow tests proved the config screen can be opened and a draft can be created through the real Admin DSL HTTP path.

### What didn't work
- The existing `surface.confirm` renderer path does not dispatch bound footer actions; it renders a default unbound confirm action from props. I avoided that path for now and used `surface.modal(...)` containing an actionable summary card for publish confirmation.
- The editors are not full mutation editors yet. They expose read-only/disabled edit affordances so the screen structure is reviewable before create/update/delete/reorder semantics are added.
- Attempting to relate files directly to the diary failed because this historical diary file has no YAML frontmatter: `docmgr doc relate --doc ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md ...` returned `frontmatter delimiters '---' not found`. I then related the files at the ticket index level with `docmgr doc relate --ticket HAIR-041 ...`.

### What I learned
- The Admin DSL needs a decision about whether `confirmDialog` should support bound action arrays like modal/drawer children, or whether confirm flows should always be modeled as modal content with explicit action nodes.
- Returning full config editor data as a single JSON-shaped host result keeps the Goja flow simple and keeps schema ownership inside `pkg/intakeadmin`.

### What was tricky to build
- The config editor had to remain honest about backend ownership. It would have been easy to make the frontend renderer own tab state, table selection, or publish behavior. Instead, `ctx.state.configSection`, `ctx.state.configVersionId`, and `ctx.state.publishModal` remain backend state in the Goja session.
- Publish confirmation needed a surface whose actions could dispatch opaque backend ids. The existing `confirmDialog` implementation was too static for this live backend flow, so a modal plus summary card was used as a safe implementation path.
- Config audit events span the config DB and state DB. The current implementation records audit after the config transaction commits; this is acceptable for the first slice but should be reviewed if strict cross-database atomicity becomes required.

### What warrants a second pair of eyes
- Review the new `ConfigEditorData` DTOs and make sure the JSON shape is stable enough for subsequent edit mutations.
- Review whether `GetConfigEditorData` should be split into smaller query methods before the editors become fully interactive.
- Review the audit-event transaction boundary for config publish and draft creation.
- Review whether `admin.tabs(...)` should also be added to TypeScript builder parity tests or Go builder tests.

### What should be done in the future
- Add real create/update/delete/reorder mutations for services, tones, budgets, price ranges, availability days, and time slots.
- Decide whether to improve `surface.confirm` so it can dispatch bound backend actions.
- Add Playwright smoke coverage for create draft -> inspect sections -> publish modal.
- Add Storybook scenario coverage for the new config editor state if the live backend route is not enough for visual review.

### Code review instructions
- Start with the flow:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/intake_admin.flow.js`
- Then review app-owned data retrieval and publishing:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/intakeadmin/store.go`
- Then review host module exports and HTTP coverage:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/host_intake_admin_module.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl_test.go`
- Validate with:
  - `go test ./... -count=1`

### Technical details
- reMarkable upload output:
  - `OK: uploaded HAIR 041 Admin DSL Backend Driven Interfaces Deep Dive.pdf -> /ai/2026/05/16/HAIR-041`
- The selected config version defaults to the newest draft, falling back to active config when no draft exists.
- Publish action is enabled only for draft configs with a passing validation report.

## Step 12: Add the first live service config editor mutation

This step turned the Phase 7 service editor from a read-only draft inspector into a real mutation path. Draft service options can now be opened from the `/admin/intake` config screen, edited in a drawer form, validated by the Goja flow, saved through the app-owned `pkg/intakeadmin` store, and audited in the admin audit table.

The implementation deliberately starts with update-only semantics. Create, delete, and reorder still remain open so the editor does not pretend to be complete before the mutation model and interaction details are reviewed.

### Prompt Context

**User prompt (verbatim):** "continue, commit at appropriate intervals, and keep a detailed diary as you work"

**Assistant interpretation:** Continue HAIR-041 Phase 7 implementation in focused commits, validating along the way and recording a detailed diary step.

**Inferred user intent:** The user wants steady forward progress on real config editing while preserving reviewable commit boundaries and implementation history.

**Commit (code):** 126b3be — "HAIR-041 Step 12: Add service config editor mutation".

### What I did
- Added `ConfigServiceOptionInput` and `Store.UpdateServiceOption(...)` in `pkg/intakeadmin/store.go`.
- Enforced draft-only service editing in the store; active/archived config versions cannot be edited through this method.
- Added admin audit event recording for service option updates.
- Exposed `host/intake-admin.updateServiceOption(input)` to Admin Goja flows.
- Updated `pkg/admindsl/flows/intake_admin.flow.js` so draft service rows can open an edit drawer.
- Added service drawer form fields for:
  - id,
  - category,
  - value,
  - title,
  - subtitle,
  - badge,
  - sort order,
  - enabled.
- Added flow-level validation for required service fields before calling the host mutation.
- Closed the drawer and refreshed editor data after save.
- Added store-level test coverage for service update.
- Extended the Admin DSL HTTP config test to create a draft, open a service drawer, save a service edit, and verify the SQLite row changed.
- Updated HAIR-041 Phase 7 task status to mark service update mutation complete while leaving create/delete/reorder open.
- Validated:
  - `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- The Phase 7 config screen needed at least one real edit mutation to test whether the Admin DSL form/drawer/action path works for live backend config changes.
- Services are the safest first target because they already drive customer intake choices and have a compact schema.

### What worked
- Existing Admin DSL form behavior already sends `FormData` for form action clicks, so the backend flow could receive edited values without frontend changes.
- The Goja host module pattern made the mutation boundary narrow and explicit.
- The HTTP test exercises the real protobuf/Admin DSL event path rather than only calling store methods directly.

### What didn't work
- `switchField` is currently rendered as a display-only preview, not an actual form input, so the first editor uses a text field for `enabled` with `true/false` parsing.
- The editor does not yet support create/delete/reorder, and it does not provide select controls for categories or booleans.

### What I learned
- The renderer's existing form action value collection is enough for simple backend-owned mutation forms.
- The next meaningful Admin DSL field improvement is to make `switchField` and `selectField` submit robust values instead of using text-field fallbacks for boolean/enumerated data.

### What was tricky to build
- The service editor needed to keep all interaction state in the Goja session: selected service id, drawer state, unsaved form values, and validation errors. Keeping this state backend-owned avoids local React state drift, but it means every form save/cancel path must explicitly clear or preserve the right `ctx.state` fields.
- The store mutation needed to validate the owning config version status before updating the row. This prevents accidental edits to active published config rows.

### What warrants a second pair of eyes
- Review whether draft-only enforcement should live in every individual mutation method or in a shared helper that resolves editable config rows.
- Review the audit event payload shape for service updates before additional config entities copy the same pattern.
- Review the form field contract for booleans and numbers before extending this to tones, budgets, pricing, and availability.

### What should be done in the future
- Add create/delete/reorder mutations for service options.
- Add equivalent update drawers for tone, budget, price range, availability day, and time slot editors.
- Improve Admin DSL `switchField` and `selectField` so config editors can use semantic controls instead of text input fallbacks.

### Code review instructions
- Start with `pkg/admindsl/flows/intake_admin.flow.js` and review `serviceOptionDrawer`, `serviceFormErrors`, and the `config.service.save` callback.
- Review `pkg/intakeadmin/store.go` for `UpdateServiceOption` draft-only enforcement and audit recording.
- Review `pkg/server/host_intake_admin_module.go` for the `updateServiceOption` host export.
- Validate with `go test ./... -count=1`.

### Technical details
- Form values arrive as strings from browser `FormData`.
- The Goja flow parses `sortOrder` with `parseIntOrZero(...)` and parses `enabled` with `parseBool(...)`.
- The store records service updates as `admin_audit_events.entity_type = 'config_service_option'` and `action = 'update'`.

## Step 13: Add tone config editor mutation

This step extended the Phase 7 config editing pattern from service options to tone options. Draft tone rows can now open an edit drawer, validate required fields in the Goja flow, save through the app-owned host module, persist to SQLite, and record an admin audit event.

The goal was to prove that the service editor pattern can be repeated across another config entity without adding app-specific React components or weakening the Admin DSL boundary.

### Prompt Context

**User prompt (verbatim):** (same as Step 12)

**Assistant interpretation:** Continue HAIR-041 Phase 7 implementation in focused commits, validating along the way and recording a detailed diary step.

**Inferred user intent:** The user wants additional real config editing progress while keeping each mutation slice reviewable.

**Commit (code):** 4ca5045 — "HAIR-041 Step 13: Add tone config editor mutation".

### What I did
- Added `ConfigToneOptionInput` and `Store.UpdateToneOption(...)` in `pkg/intakeadmin/store.go`.
- Added a shared draft-row helper for config mutation methods:
  - `ensureConfigRowIsDraft(...)`.
- Exposed `host/intake-admin.updateToneOption(input)` to the Admin Goja flow.
- Updated `pkg/admindsl/flows/intake_admin.flow.js` with:
  - tone row open action,
  - tone drawer form,
  - tone required-field validation,
  - save/cancel callbacks,
  - form state cleanup after save/cancel.
- Extended store tests to update a draft tone option and verify the persisted label/sort order.
- Updated HAIR-041 task status for tone update mutation.
- Validated:
  - `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- Tone options are another customer-facing config entity used by the intake flow, so they are a good second mutation target after services.
- Repeating the pattern tests whether the store/host/flow structure can scale before moving to more complex entities such as pricing and availability.

### What worked
- The service editor pattern transferred cleanly to tone options.
- The app-owned store can enforce draft-only editing for tone rows before the Admin DSL runtime sees a successful mutation result.
- No frontend renderer changes were required.

### What didn't work
- The UI still uses text input for `enabled` instead of a semantic switch input, for the same reason recorded in Step 12.
- Tone editor still lacks create/delete/reorder mutations.

### What I learned
- Shared draft-row resolution is worth extracting before implementing more config entity updates.
- The most useful next refactor is likely a small helper around config row mutation/audit payloads to reduce duplication in budget, price, availability, and time-slot updates.

### What was tricky to build
- The Goja flow now has multiple drawer states (`service`, `tone`) that use similar but separate form state fields. This is explicit and understandable for two entities, but it will become repetitive as more editors are added.
- A future cleanup should consider a generic config drawer state shape while keeping each app-owned mutation explicit.

### What warrants a second pair of eyes
- Review whether the shared `ensureConfigRowIsDraft(...)` helper should be hardened against non-constant table names or replaced with typed helper methods per table.
- Review whether tone update audit events need before/after payload parity with service updates.

### What should be done in the future
- Add create/delete/reorder tone mutations.
- Add budget update mutation next, since it is structurally similar to service/tone and still uses simple text fields.
- Consider improving field widgets before price/availability editors become more complex.

### Code review instructions
- Start with `pkg/intakeadmin/store.go` and review `UpdateToneOption` plus `ensureConfigRowIsDraft`.
- Review `pkg/admindsl/flows/intake_admin.flow.js` for `toneOptionDrawer` and `config.tone.save`.
- Validate with `go test ./... -count=1`.

### Technical details
- Tone updates are audited as `admin_audit_events.entity_type = 'config_tone_option'` and `action = 'update'`.
- Tone form values are string-based at the browser boundary; sort order and enabled are parsed by the Goja flow before calling the host module.

## Step 14: Add remaining config update mutations

This step completed update support for the remaining Phase 7 config entities: budgets, price ranges, availability days, and time slots. Each editor now has a drawer form, Goja validation, a host module call, app-owned SQLite mutation logic, and audit-event recording.

The update model continues the same backend-owned interaction pattern used by services and tones. React renders forms and dispatches opaque actions; the Goja flow validates form values and calls `host/intake-admin`; the `pkg/intakeadmin` store owns schema-specific writes and draft-only enforcement.

### Prompt Context

**User prompt (verbatim):** "all of phase 7"

**Assistant interpretation:** Complete the remaining HAIR-041 Phase 7 config editing and publishing items, not only the first update slices.

**Inferred user intent:** The user wants the config editor to cover all planned intake config resources and to move Phase 7 to completion with commits and diary entries.

**Commit (code):** 735c64e — "HAIR-041 Step 14: Add remaining config update mutations".

### What I did
- Added update DTOs and store methods for:
  - `ConfigBudgetOptionInput` / `UpdateBudgetOption`,
  - `ConfigPriceRangeInput` / `UpdatePriceRange`,
  - `ConfigAvailabilityDayInput` / `UpdateAvailabilityDay`,
  - `ConfigTimeSlotInput` / `UpdateTimeSlot`.
- Added host module exports:
  - `updateBudgetOption`,
  - `updatePriceRange`,
  - `updateAvailabilityDay`,
  - `updateTimeSlot`.
- Added Admin DSL drawer forms and save/cancel callbacks for budgets, price ranges, availability days, and time slots.
- Added price validation for required label and min/max cents ordering.
- Added store test coverage for each new update method.
- Validated:
  - `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- Phase 7 requires all config resources used by the customer intake flow to be editable, not only service and tone rows.
- Price range and availability updates are especially important because they affect customer estimates and booking slot selection.

### What worked
- The same store/host/Goja drawer architecture scaled across the remaining config row types.
- No generic Admin DSL renderer changes were needed.

### What didn't work
- These forms still use text fields for booleans and cents. The renderer needs stronger semantic field support before this becomes production-grade.

### What I learned
- Repetition in the Goja flow is now high enough that the user's suggestion to split the file into modules is directionally correct.
- The current Admin runtime supports registered native modules, but file-relative JavaScript `require(...)` is not yet wired for embedded flow helper files. That should be a follow-up runtime/refactor slice.

### What was tricky to build
- Price-range validation has to handle optional values while still catching invalid min/max ordering. The flow validates string form values before sending parsed optional integers to Go.
- Availability combines visual calendar state with persisted row state; selecting a day now opens a backend-owned drawer only for draft configs.

### What warrants a second pair of eyes
- Review whether price-range min/max cents should use a dedicated money field before relying on raw cents entry.
- Review whether availability day date/value/day should be separately editable or derived from one canonical date.

### What should be done in the future
- Refactor the large intake admin flow into required helper modules once Admin ScriptRuntime supports embedded JS module loading.
- Improve field widgets for booleans, money, dates, and times.

### Code review instructions
- Review `pkg/intakeadmin/store.go` update methods for draft-only checks and validation.
- Review `pkg/admindsl/flows/intake_admin.flow.js` drawer forms and save callbacks.
- Validate with `go test ./... -count=1`.

### Technical details
- Price range form values use cents to match the existing config schema columns `min_cents` and `max_cents`.
- Availability and time-slot ordering is currently controlled through `sortOrder` fields.

## Step 15: Complete config create/delete mutations and close Phase 7 functionality

This step added create and delete support across the Phase 7 config editor. Each config section now has add buttons for draft configs, drawer forms can create new rows by saving `__new__` selections, and existing rows can be deleted through backend-owned actions. Reordering is represented by editable `sortOrder` fields for this phase.

This completes the functional Phase 7 scope: config versions, draft creation, per-resource editors, validation report, publish confirmation, publish transaction, and audit events are all present. Some interaction quality remains intentionally visible for later hardening, especially semantic field controls and drag/drop reorder UX.

### Prompt Context

**User prompt (verbatim):** (same as Step 14)

**Assistant interpretation:** Finish the remaining Phase 7 resource editor capabilities and mark the phase honestly complete.

**Inferred user intent:** The user wants the ticket to move past first-pass read-only config inspection into a complete backend-backed config editing workflow.

**Commit (code):** 5d484e6 — "HAIR-041 Step 15: Complete config create delete mutations".

### What I did
- Added `ConfigEntityInput`, `CreateConfigEntity(...)`, and `DeleteConfigEntity(...)` in `pkg/intakeadmin/store.go`.
- Added host module exports:
  - `createConfigEntity(input)`,
  - `deleteConfigEntity(kind, id)`.
- Added add buttons to draft config sections for:
  - services,
  - tones,
  - budgets,
  - price ranges,
  - availability days,
  - time slots.
- Updated drawer save callbacks so `id === "__new__"` creates rows and existing ids update rows.
- Added delete actions for existing config rows.
- Added store tests for create/delete through the generic config entity API.
- Updated Phase 7 tasks to complete resource editor items, with reorder explicitly represented as reorder-by-sort-order for this slice.
- Ran final validation for this slice:
  - `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 46 tests passed.

### Why
- Without create/delete, the editor could modify seeded draft rows but could not manage real evolving salon configuration.
- The generic create/delete API keeps the Goja flow small enough to finish Phase 7 while preserving app-owned schema switches in `pkg/intakeadmin` rather than in the renderer.

### What worked
- Add buttons can be represented with existing Admin DSL `toolbar` nodes inside sections.
- Drawer forms could reuse the same save callbacks by treating `__new__` as a create sentinel.
- Existing update methods plus `sortOrder` fields provide a first-pass reorder mechanism without implementing drag/drop.

### What didn't work
- File structure is now strained: `pkg/admindsl/flows/intake_admin.flow.js` is too large. The user's note about splitting files is correct; the current runtime should gain embedded JavaScript module loading so flow helpers can be moved behind `require(...)`.
- Delete actions are immediate backend actions. A future UX hardening pass should add confirm surfaces for destructive row deletion.

### What I learned
- Completing Phase 7 confirms that the Admin DSL can express a real config editor with backend-owned state, but authoring ergonomics now need attention.
- Generic entity create/delete is acceptable inside the app-owned store because it switches over known intake config entity kinds; it would not belong in the generic Admin DSL package.

### What was tricky to build
- The `__new__` sentinel keeps the drawer forms simple but must be handled carefully in each save callback. Existing rows update by id; new rows create through `createConfigEntity` and then close the drawer.
- Generic delete needs a table allowlist to avoid letting arbitrary table names reach SQL. The store maps known entity kinds to known config tables.

### What warrants a second pair of eyes
- Review whether generic `CreateConfigEntity` should be split into typed methods before further production hardening.
- Review delete behavior and decide whether every destructive config row action should require a confirm modal.
- Review whether sort-order editing is acceptable as Phase 7 reorder support or whether drag/drop should be promoted from follow-up to required scope.

### What should be done in the future
- Add embedded JS module support to `pkg/admindsl.ScriptRuntime` and split `intake_admin.flow.js` into focused required modules.
- Replace text booleans and raw cents with semantic Admin DSL fields.
- Add visual/Playwright smoke coverage for create/edit/delete/publish config workflows.

### Code review instructions
- Review generic create/delete in `pkg/intakeadmin/store.go` first.
- Review add/save/delete flow wiring in `pkg/admindsl/flows/intake_admin.flow.js`.
- Validate with the four commands listed above.

### Technical details
- New row creation uses id prefixes such as `svc_`, `tone_`, `budget_`, `range_`, `day_`, and `time_` with UUID suffixes.
- Delete uses a hard-coded kind-to-table allowlist and draft-row enforcement before deleting.

## Step 16: Add embedded Admin DSL script modules and split the config flow

This step addressed the file-structure issue raised after Phase 7. The Admin DSL runtime can now register embedded JavaScript helper modules and expose them through `require(...)`, and the large intake admin config editor has been split out of `intake_admin.flow.js` into its own required module.

The runtime still keeps module registration explicit from Go. This preserves the existing deployment model: embedded sources are registered by the host, then JavaScript flows require stable module names. It avoids arbitrary filesystem access while making large flows maintainable.

### Prompt Context

**User prompt (verbatim):** "btw, you can split the files into multiple and use require, i think, to make things easier to structure and work with."

**Assistant interpretation:** Confirm and act on the suggestion by adding module support and splitting the large Admin DSL flow into required helper files.

**Inferred user intent:** The user wants the flow authoring structure to stay maintainable as Phase 7 and Phase 8 add more backend-owned screens.

**User prompt (verbatim):** "also make tasks for the other issues we have so we can tackle them in the future, then continue"

**Assistant interpretation:** Add explicit backlog tasks for known hardening issues, then continue implementation with the flow split.

**Inferred user intent:** The user wants known weaknesses tracked instead of being lost, while still moving forward.

**Commit (code):** dbc6204 — "HAIR-041 Step 16: Split intake admin config flow module".

### What I did
- Added `ScriptRuntime` support for embedded JavaScript script modules:
  - `WithScriptModule(name, source)`.
  - `loadScriptModuleSource(...)` wraps source in a CommonJS-style `(module, exports)` function.
- Added runtime test coverage for requiring an embedded script module from an Admin DSL flow.
- Embedded a new module source:
  - `pkg/admindsl/flows/intake_config.flow.js`.
- Registered it in the server runtime as:
  - `fringe/admin-flows/intake-config`.
- Reduced `pkg/admindsl/flows/intake_admin.flow.js` from roughly 934 lines to roughly 212 lines by moving config editor helpers/screens into the new module.
- Updated Phase 10 backlog tasks to mark the flow split complete.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- The Phase 7 config editor made `intake_admin.flow.js` too large to maintain safely.
- Required helper modules let each Admin DSL screen cluster stay focused without changing the browser/runtime contract.

### What worked
- The existing goja-nodejs registry already supports native module registration, so embedded script modules could be implemented as controlled native module loaders.
- The split did not require any React or protobuf changes.

### What didn't work
- This is not full filesystem-relative Node resolution. Modules are explicit embedded sources registered by Go. That is intentional for now, but authors need to know module names are host-registered.

### What I learned
- Script module support is the right authoring abstraction for larger backend-owned Admin DSL flows.
- Keeping module registration explicit preserves runtime control while still allowing JavaScript flow code to use `require(...)`.

### What was tricky to build
- The config module callbacks needed access to `render(ctx)` and `go(ctx, screen)` from the root flow. The module now receives dependencies as `{ render, go }` when `configScreen(...)` is called.
- Embedded module source is executed in a CommonJS wrapper, so errors need to be surfaced as Goja panics that the existing runtime error handling can report.

### What warrants a second pair of eyes
- Review whether script modules should eventually support relative names or remain explicitly registered by Go.
- Review whether `WithScriptModule` should cache compiled programs rather than wrapping and running strings for each session.

### What should be done in the future
- Split request-review screens into another module if Phase 8 makes the root flow grow again.
- Consider a small package-level registry for all embedded Admin DSL flow modules.

### Code review instructions
- Start with `pkg/admindsl/script_runtime.go` and `TestScriptRuntimeLoadsScriptModules`.
- Review `pkg/admindsl/flows/intake_admin.flow.js` and `pkg/admindsl/flows/intake_config.flow.js` together.
- Validate with `go test ./... -count=1`.

### Technical details
- Registered module name: `fringe/admin-flows/intake-config`.
- The module exports `{ configScreen }`.

## Step 17: Add audit and health screens

This step started Phase 8 by adding real audit-log and health-diagnostics screens to `/admin/intake`. The screens are backed by app-owned store queries exposed through `host/intake-admin`, then rendered with existing Admin DSL primitives.

The work keeps the same boundary as the Phase 7 config editor: the Admin DSL renderer knows how to render tables, metrics, and diff views; the app-owned store knows how to query audit rows and runtime health details.

### Prompt Context

**User prompt (verbatim):** "go ahead."

**Assistant interpretation:** Continue after Phase 7 by addressing the known flow-structure issue and beginning Phase 8 follow-up work.

**Inferred user intent:** The user wants forward progress on the next hardening and Phase 8 items while maintaining commits and diary entries.

**Commit (code):** 8876ddf — "HAIR-041 Step 17: Add admin audit and health screens".

### What I did
- Added `AuditEvent` listing support through `Store.ListAuditEvents(...)`.
- Added `HealthDiagnostics` and `Store.HealthDiagnostics(...)`.
- Exposed host module functions:
  - `host/intake-admin.listAuditEvents(limit)`
  - `host/intake-admin.healthDiagnostics()`
- Added dashboard navigation actions for Audit log and Health.
- Added `/admin/intake` internal screens:
  - `admin-intake-audit`
  - `admin-intake-health`
- Added store test coverage for audit listing and health diagnostics.
- Marked Phase 8 audit-log and health-diagnostics tasks complete.
- Validated:
  - `go test ./pkg/intakeadmin ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- Phase 8 calls for audit and health views so the admin backend can inspect operational state, not only mutate config and review requests.
- The existing `admin_audit_events` table should be visible from the admin interface to make mutation behavior reviewable.

### What worked
- Existing `resourceTable`, `metricCard`, and `diffView` primitives were enough for first-pass audit and health screens.
- The new screens required no renderer changes.

### What didn't work
- Health diagnostics are intentionally basic. They report DB configuration, counts, active config, drafts, and last audit timestamp, but do not yet include deep runtime/session/upload checks.

### What I learned
- The Admin DSL vocabulary is now sufficient for several operational admin screens without adding new widgets.
- Phase 8 can continue with preview and Playwright/visual smoke rather than more schema work first.

### What was tricky to build
- Audit events have JSON before/after payloads, but the first audit screen stays tabular and compact. A future detail surface can show expanded JSON payloads per row.

### What warrants a second pair of eyes
- Review whether health diagnostics should live in `pkg/intakeadmin` or a separate app operations package once checks become broader.
- Review what additional checks should be included before calling the health screen production-ready.

### What should be done in the future
- Add audit-event detail drawer for before/after payload inspection.
- Add deeper health checks for upload storage, admin sessions, customer DSL sessions, and preview route availability.

### Code review instructions
- Review `pkg/intakeadmin/store.go` for `ListAuditEvents` and `HealthDiagnostics`.
- Review `pkg/admindsl/flows/intake_admin.flow.js` for `auditScreen` and `healthScreen`.
- Validate with `go test ./... -count=1`.

### Technical details
- Audit table screen reads from `admin_audit_events`.
- Health screen currently checks state DB, config DB, active config, request count, audit count, draft count, and last audit timestamp.

## Step 18: Support relative `require("./...")` in Admin DSL flow files

This step upgraded the Admin DSL script module support from explicit host-registered module names to relative embedded module loading. Flow files can now require helper files with paths such as `require("./intake_config.flow.js")`, which is the authoring style needed to keep larger backend-owned flows split into small files.

The implementation still uses embedded sources controlled by Go. It does not open arbitrary filesystem access; the runtime resolves paths against the current script/module name and loads only sources registered through `WithScriptModule(...)`.

### Prompt Context

**User prompt (verbatim):** "can you require(..) in the flow.js files?"

**Assistant interpretation:** Clarify current require support and then implement proper relative helper-file require support for Admin DSL flows.

**Inferred user intent:** The user wants flow authors to structure Admin DSL JavaScript like normal modular code instead of growing one giant file.

**User prompt (verbatim):** "go ahead, add require support and that way we can start building helper js files and do more structuring of the flows js to avoid having huge files like these"

**Assistant interpretation:** Implement relative embedded `require(...)` support, wire the existing intake config module through it, validate, and commit.

**Inferred user intent:** The user wants a reusable runtime capability, not just a one-off named-module workaround.

**Commit (code):** 8c7e698 — "HAIR-041 Step 18: Support relative admin flow requires".

### What I did
- Added `ScriptRuntime.StartFlowNamed(...)` so flow source has a stable virtual filename such as `/flows/intake_admin.flow.js`.
- Updated the Goja require registry to use:
  - a runtime script-module source loader,
  - a virtual path resolver for embedded module paths.
- Kept `WithScriptModule(name, source)` but normalized names as virtual module paths.
- Registered the intake config helper as `/flows/intake_config.flow.js`.
- Changed the root flow to use relative require:
  - `const configFlow = require("./intake_config.flow.js");`
- Added test coverage proving a root flow loaded as `/flows/root.flow.js` can require `./admin-helper.js` from embedded module sources.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- Explicit module names solved the first split, but relative requires are the better authoring model for future helper files.
- Virtual embedded paths preserve deployment safety while making JavaScript source organization familiar.

### What worked
- goja-nodejs `require.Registry` already supports source loaders and path resolvers, so the runtime could layer virtual embedded module paths on top.
- The root flow now has a source filename, so `require("./...")` resolves relative to that virtual filename.

### What didn't work
- This still is not arbitrary filesystem module loading. That is intentional, but it means every helper file must be embedded by Go and registered with `WithScriptModule(...)`.

### What I learned
- Source names matter for relative require resolution because the require package derives the current module directory from the call stack source name.
- The correct runtime boundary is virtual embedded files, not direct filesystem lookup.

### What was tricky to build
- The previous implementation registered script modules as native modules. Native modules work for explicit names, but they cannot model relative `./helper.js` resolution. The runtime now also provides a `SourceLoader` and `PathResolver` for virtual paths.
- The server needed to call `StartFlowNamed(...)` with `/flows/intake_admin.flow.js` so the root flow has a useful base path.

### What warrants a second pair of eyes
- Review whether virtual module paths should always live under `/flows/` or whether each flow should get its own subdirectory.
- Review whether module compilation should be cached more aggressively if many Admin DSL sessions start concurrently.

### What should be done in the future
- Split additional request, audit, health, and preview helpers if the root flow grows again.
- Consider an embedded module registry helper so adding new flow helper files only requires one line in `flows.go`.

### Code review instructions
- Start with `pkg/admindsl/script_runtime.go` and `TestScriptRuntimeLoadsScriptModules`.
- Review server wiring in `pkg/server/handlers_admin_dsl.go`.
- Review the root flow require in `pkg/admindsl/flows/intake_admin.flow.js`.
- Validate with `go test ./... -count=1`.

### Technical details
- Root flow virtual filename: `/flows/intake_admin.flow.js`.
- Config helper virtual filename: `/flows/intake_config.flow.js`.
- Relative require used by root flow: `require("./intake_config.flow.js")`.

## Step 19: Split request-review and ops screens into helper flow modules

This step continued the Admin DSL flow restructuring now that relative embedded `require("./...")` is available. The root intake admin flow is now only the session state, navigation switch, dashboard, and module wiring. Request queue/detail behavior lives in a request module, and audit/health/preview behavior lives in an ops module.

The result is a much smaller root flow and a clearer place to add future Phase 8 features. New backend-owned screens no longer have to grow the same monolithic JavaScript file.

### Prompt Context

**User prompt (verbatim):** "go ahead, commit at appropriate intervals, remember to keep a detailed diary"

**Assistant interpretation:** Continue restructuring and Phase 8 work in focused commits, validating and recording the implementation narrative.

**Inferred user intent:** The user wants sustained implementation progress without losing auditability or letting the JavaScript flow files become unmaintainable.

**Commit (code):** 987ff70 — "HAIR-041 Step 19: Split intake admin request and ops flows".

### What I did
- Created `pkg/admindsl/flows/intake_requests.flow.js` for:
  - request table row mapping,
  - request queue screen,
  - request detail screen,
  - photo gallery/modal behavior.
- Created `pkg/admindsl/flows/intake_ops.flow.js` for:
  - audit log screen,
  - health diagnostics screen,
  - preview screen.
- Updated `pkg/admindsl/flows/intake_admin.flow.js` to require:
  - `./intake_requests.flow.js`,
  - `./intake_config.flow.js`,
  - `./intake_ops.flow.js`.
- Embedded and registered the new modules in:
  - `pkg/admindsl/flows.go`,
  - `pkg/server/handlers_admin_dsl.go`.
- Reduced the root intake admin flow from roughly 287 lines to roughly 71 lines.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- The request/detail and ops screens are separate authoring concerns from dashboard navigation and config editing.
- Splitting modules now prevents Phase 8 preview/smoke work from recreating a giant root flow.

### What worked
- Relative embedded `require("./...")` support made the split straightforward.
- Existing runtime validation and HTTP tests exercised the split modules through the real Admin DSL start/dispatch path.

### What didn't work
- A mechanical replacement briefly changed the dashboard `Review requests` callback to call `deps.go(...)` even though dashboard remains in the root module. This was fixed before validation.

### What I learned
- The root flow should remain an orchestrator, not a container for all screen implementation details.
- Helper modules need small dependency objects (`{ render, go }`) only when they need to re-render or navigate through root state.

### What was tricky to build
- The dashboard still uses `requestFlow.requestTable(...)` for recent requests. That means the request module must export both full screens and small reusable rendering helpers.
- Keeping module boundaries clean requires care: request screens need `render/go`, ops screens only need `go`, and the config module needs both.

### What warrants a second pair of eyes
- Review whether `dashboardScreen` should move into its own module as the root flow shrinks further.
- Review whether the dependency object pattern should be standardized for all flow helper modules.

### What should be done in the future
- Continue adding Phase 8 preview/smoke code in the focused ops module rather than the root flow.
- Consider splitting config editor forms into submodules if `intake_config.flow.js` continues to grow.

### Code review instructions
- Start with `pkg/admindsl/flows/intake_admin.flow.js` to understand the orchestration layer.
- Then review `pkg/admindsl/flows/intake_requests.flow.js` and `pkg/admindsl/flows/intake_ops.flow.js`.
- Validate with `go test ./... -count=1`.

### Technical details
- New virtual module paths:
  - `/flows/intake_requests.flow.js`
  - `/flows/intake_ops.flow.js`
- Root requires:
  - `require("./intake_requests.flow.js")`
  - `require("./intake_config.flow.js")`
  - `require("./intake_ops.flow.js")`

## Step 20: Split config helpers and forms into separate flow modules

This step continued the modularization work by splitting the large config editor module into smaller helper and form modules. The config screen now owns the high-level tab/section orchestration and save/delete callbacks, while reusable row mapping, parsing, validation, and drawer construction live in focused required modules.

The practical goal was to keep new Phase 8 and hardening work from happening in files that are already too large to review safely. The config editor remains backend-driven JavaScript, but the structure now matches the screen responsibilities more closely.

### Prompt Context

**User prompt (verbatim):** (same as Step 19)

**Assistant interpretation:** Continue using the new relative `require("./...")` support to split helper JavaScript files and keep the flow code maintainable.

**Inferred user intent:** The user wants flow authors to be able to add more admin screens and helpers without creating monolithic JavaScript files.

**Commit (code):** 81a2698 — "HAIR-041 Step 20: Split intake config helper modules".

### What I did
- Created `pkg/admindsl/flows/intake_config_helpers.flow.js` for:
  - config version row mapping,
  - service/tone/budget/price/time row mapping,
  - `findById`,
  - integer/bool parsers,
  - validation diff-row mapping.
- Created `pkg/admindsl/flows/intake_config_forms.flow.js` for:
  - service/tone/budget/price/availability/time-slot form values,
  - field validation helpers,
  - drawer form builders.
- Updated `pkg/admindsl/flows/intake_config.flow.js` to require helper/form modules and focus on screen orchestration and mutation callbacks.
- Embedded and registered the new helper modules in:
  - `pkg/admindsl/flows.go`,
  - `pkg/server/handlers_admin_dsl.go`.
- Reduced `intake_config.flow.js` from roughly 728 lines to roughly 402 lines.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- The config editor was still large after the first split. Helpers and forms are separate concepts and should not obscure the screen-level behavior.
- Relative `require("./...")` support exists specifically to allow this kind of structure.

### What worked
- The new virtual module resolver loaded nested config helper modules through ordinary relative requires.
- The root config screen remained behaviorally equivalent after extraction.

### What didn't work
- The first validation attempt failed with `admin_dsl_flow_start_failed: GoError: Invalid module` because the new helper modules were created but not registered in Go. I fixed this by embedding and registering both `/flows/intake_config_helpers.flow.js` and `/flows/intake_config_forms.flow.js` before re-running validation.

### What I learned
- With the current embedded-module design, every new helper file needs both a `go:embed` entry and a `WithScriptModule(...)` registration.
- This is safe and explicit, but a small module registry helper would reduce missed-registration errors.

### What was tricky to build
- A mechanical extraction initially left service form helpers behind in `intake_config.flow.js`, producing an invalid function name during replacement. I moved service form helpers into the form module and revalidated.
- The form module needs both Admin DSL builders and helper lookup functions, so it requires `fringe/admin-dsl` and `./intake_config_helpers.flow.js`.

### What warrants a second pair of eyes
- Review whether `intake_config.flow.js` should be split further by entity type if config editing continues to grow.
- Review whether embedded flow module registration should be centralized to prevent future `Invalid module` startup errors.

### What should be done in the future
- Add a helper in Go that registers all embedded Admin flow modules from one table.
- Consider moving config save/delete callbacks into entity-specific modules if they become more complex.

### Code review instructions
- Review `pkg/admindsl/flows/intake_config.flow.js` for screen orchestration.
- Review `pkg/admindsl/flows/intake_config_helpers.flow.js` for mappers/parsers.
- Review `pkg/admindsl/flows/intake_config_forms.flow.js` for drawer/form construction.
- Validate with `go test ./... -count=1`.

### Technical details
- New virtual module paths:
  - `/flows/intake_config_helpers.flow.js`
  - `/flows/intake_config_forms.flow.js`
- Config module requires:
  - `require("./intake_config_helpers.flow.js")`
  - `require("./intake_config_forms.flow.js")`

## Step 21: Centralize embedded Admin flow module registration

This step removed the most obvious source of mistakes in the new modular flow setup. Instead of registering every embedded helper module by hand in the server, `pkg/admindsl` now exposes a small module registry for the intake admin flow and converts that registry into `ScriptRuntimeOption` values.

This directly addresses the failure from the previous split where a helper file existed but had not been registered, causing an `Invalid module` startup error.

### Prompt Context

**User prompt (verbatim):** "continue"

**Assistant interpretation:** Continue hardening the modular Admin DSL flow setup and then continue into Phase 8 functionality.

**Inferred user intent:** The user wants the implementation to keep moving while reducing known friction introduced by the new module structure.

**Commit (code):** 99b0505 — "HAIR-041 Step 21: Centralize admin flow module registry".

### What I did
- Added `EmbeddedScriptModule` in `pkg/admindsl/flows.go`.
- Added `IntakeAdminScriptModules()` returning all embedded helper module paths and sources.
- Added `IntakeAdminScriptModuleOptions()` to build `WithScriptModule(...)` options from that registry.
- Simplified `pkg/server/handlers_admin_dsl.go` so it appends `admindsl.IntakeAdminScriptModuleOptions()` instead of registering each helper inline.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- New helper files should be registered in one obvious place.
- The server should not need to know every implementation detail of the intake admin flow's helper module graph.

### What worked
- The existing `ScriptRuntimeOption` shape made this a small refactor.
- Runtime behavior did not change; only registration ownership moved.

### What didn't work
- This still requires adding a `go:embed` variable and a registry entry in `flows.go` for each new helper file. It is centralized, but not automatic.

### What I learned
- Centralizing module registration is enough for the current repo, but an embedded FS loader could eventually discover modules under `/flows/` automatically.

### What was tricky to build
- Keeping registration explicit while removing server coupling required the registry to live in `pkg/admindsl`, not in `pkg/server`.

### What warrants a second pair of eyes
- Review whether the registry type should be reused for other Admin DSL flows beyond intake.

### What should be done in the future
- Consider an embedded FS based loader if the number of helper modules grows substantially.

### Code review instructions
- Review `pkg/admindsl/flows.go` and `pkg/server/handlers_admin_dsl.go`.
- Validate with `go test ./... -count=1`.

### Technical details
- The runtime still receives ordinary `WithScriptModule(path, source)` options.
- The server now appends the options returned by `IntakeAdminScriptModuleOptions()`.

## Step 22: Add draft intake preview bridge

This step implemented the first real draft customer intake preview bridge for `/admin/intake`. The admin preview screen now selects the current draft-or-active config, validates it, and renders a `previewFrame` pointing at the real customer DSL route with `previewConfigVersionId` in the URL. The customer frontend passes that config version into the DSL start endpoint, and the backend seeds the new customer DSL session state with that config version.

This is still an iframe preview rather than a deeply embedded Admin DSL/customer DSL composition, but it exercises the real customer route, real customer DSL runtime, and real config DB rows.

### Prompt Context

**User prompt (verbatim):** (same as Step 21)

**Assistant interpretation:** Continue from modularization into the next Phase 8 feature: draft customer intake preview.

**Inferred user intent:** The user wants the admin backend to become operationally useful and test the customer/admin bridge.

**Commit (code):** e43d337 — "HAIR-041 Step 22: Add draft intake preview bridge".

### What I did
- Added `dslgoja.WithInitialState(...)` to seed new customer DSL sessions with selected state values.
- Updated `handleDSLStartFlow` to accept `?configVersionId=...` and pass it into `WithInitialState`.
- Updated frontend `startDslFlow(...)` to accept `DslStartOptions` and serialize `configVersionId` into the start URL.
- Updated `BackendDslPage` to accept `startOptions` and use them for fresh and recovered sessions.
- Updated `LiveDslDemoApp` to read `previewConfigVersionId` from the URL and avoid reusing/storing the normal session id for preview sessions.
- Updated `intake_ops.flow.js` preview screen to:
  - load the selected draft-or-active config editor data,
  - validate that config through `host/intake-preview`,
  - render a `previewFrame` iframe at `/dsl-goja-demo/service?previewConfigVersionId=<configVersionId>`.
- Marked the Phase 8 draft preview task complete.
- Validated:
  - `go test ./pkg/dslgoja ./pkg/server ./pkg/admindsl -count=1`
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 46 tests passed.

### Why
- Admin config editing needs a way to preview draft changes in the real customer intake flow before publishing.
- Passing a config version into the customer DSL start path keeps preview behavior explicit and session-scoped.

### What worked
- The existing customer DSL state already respects `ctx.state.configVersionId`, so seeding initial state was sufficient.
- The existing Admin DSL `previewFrame` primitive was enough for the first preview bridge.

### What didn't work
- This is not yet a fully isolated preview environment. It starts a customer DSL session with a selected config version, but it still uses the normal customer route shell.
- The preview iframe can navigate internally like the normal customer route; future smoke tests should verify the query parameter is applied on first start.

### What I learned
- `WithInitialState` is a useful generic customer DSL runtime primitive beyond preview, but it should be used carefully because it overrides flow-provided initial defaults.
- Preview sessions should not reuse the user's ordinary sessionStorage key, otherwise previewing a draft could contaminate the normal customer flow session.

### What was tricky to build
- The frontend had to avoid reusing stored customer sessions when `previewConfigVersionId` is present, otherwise the preview would show an old session's config instead of starting with the requested draft.
- Backend and frontend changes had to line up: URL query -> frontend start options -> DSL start endpoint query -> runtime initial state.

### What warrants a second pair of eyes
- Review whether `configVersionId` should be validated earlier in `handleDSLStartFlow` instead of letting the flow fail during config queries.
- Review whether preview sessions need a dedicated route or visual chrome distinct from normal customer intake.

### What should be done in the future
- Add Playwright coverage that creates a draft, changes a visible service label, opens preview, and verifies the iframe/customer route uses the draft label.
- Consider adding a preview-only banner inside the customer DSL shell when `previewConfigVersionId` is present.

### Code review instructions
- Start with `pkg/dslgoja/runtime.go` and `pkg/server/handlers_dsl.go` for the backend preview seed path.
- Then review `web/src/page-dsl/backendClient.ts`, `web/src/page-dsl/BackendDslPage.tsx`, and `web/src/LiveDslDemoApp.tsx`.
- Review `pkg/admindsl/flows/intake_ops.flow.js` for the admin preview screen.
- Validate with the four commands listed above.

### Technical details
- Admin preview iframe URL shape:
  - `/dsl-goja-demo/service?previewConfigVersionId=<configVersionId>`
- Customer DSL start endpoint shape:
  - `POST /api/dsl/flows/fringe.intake.v1/start?configVersionId=<configVersionId>`

## Step 23: Add and run Phase 8 submit-to-admin Playwright smoke

This step added a ticket-local smoke script that exercises the customer-to-admin path. It starts a real customer DSL flow through the backend API, advances through the intake pages, submits the request, then opens `/admin/intake` in Chromium and verifies that the Admin DSL request queue renders a submitted request.

The script also captures dashboard and request-queue screenshots into the ticket workspace so the smoke result is reviewable without rerunning the browser.

### Prompt Context

**User prompt (verbatim):** (same as Step 21)

**Assistant interpretation:** Continue closing Phase 8 gaps after the draft preview bridge by adding concrete smoke coverage.

**Inferred user intent:** The user wants evidence that the real customer intake submission appears in the real admin review UI.

**Commit (code):** 8744955 — "HAIR-041 Step 23: Add admin intake smoke script".

### What I did
- Added `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs`.
- The script:
  - starts `fringe.intake.v1` through `POST /api/dsl/flows/fringe.intake.v1/start`,
  - advances with real backend action ids to the confirm page,
  - dispatches the real `submit` action,
  - launches Chromium through Playwright,
  - opens `/admin/intake`,
  - clicks `Review requests`,
  - waits for the request queue and a `highlights` request row,
  - saves screenshots.
- Captured screenshots:
  - `various/playwright/phase8-admin-dashboard.png`
  - `various/playwright/phase8-admin-requests.png`
- Marked the Phase 8 submit-to-admin smoke task complete.

### Why
- The customer/admin integration crosses several layers: customer DSL runtime, intake persistence, Admin DSL runtime, admin host modules, React Admin DSL rendering, and browser routing.
- A smoke script gives a quick regression check without needing a full Playwright test harness dependency in `web/package.json`.

### What worked
- The customer DSL API action ids made it possible to submit a realistic request without brittle DOM clicking through every customer step.
- Playwright with system Chrome (`channel: 'chrome'`) worked once the Vite proxy targeted the live backend.

### What didn't work
- The first run failed because Playwright's bundled Chromium executable was not installed:
  - `browserType.launch: Executable doesn't exist at /home/manuel/.cache/ms-playwright/chromium_headless_shell-1222/chrome-headless-shell-linux64/chrome-headless-shell`
  - Fix: launch with `{ channel: 'chrome' }`.
- The second run failed because Vite had been started without `HAIR_BOOKING_BACKEND_URL=http://127.0.0.1:19080`, so `/api` proxied to the default `127.0.0.1:8080` and the admin page never loaded:
  - `locator.waitFor: Timeout 15000ms exceeded ... waiting for getByText('Intake Admin') to be visible`
  - Fix: restart Vite on port `5175` with the correct backend proxy env and `--strictPort`.

### What I learned
- The smoke script should document backend and web URL environment variables clearly because Vite proxy configuration is part of the test setup.
- Keeping the script in the ticket workspace is useful while the repo does not yet have a dedicated E2E test package.

### What was tricky to build
- The workstation Playwright MCP install had a usable Node package but not a downloaded bundled browser. The script now tries to load Playwright from normal resolution first, then the MCP install path, and launches system Chrome.
- The existing browser tool was locked by another MCP process, so the smoke used an isolated Playwright launch from the Node script instead of the interactive browser tool.

### What warrants a second pair of eyes
- The script currently verifies that a `highlights` row appears, not a specific request id. That is acceptable as a smoke but weaker than a future deterministic E2E assertion.
- The script mixes API-level customer submission with browser-level admin review; a later full E2E test should drive the customer UI too.

### What should be done in the future
- Promote this into a formal E2E test once Playwright is added as a project dev dependency.
- Add deterministic request identification in the admin table, or expose the created request id in the customer confirmation state.

### Code review instructions
- Review `scripts/03-smoke-admin-intake-phase8.mjs` in the HAIR-041 ticket workspace.
- Run with backend on `127.0.0.1:19080` and Vite on `127.0.0.1:5175` with `HAIR_BOOKING_BACKEND_URL=http://127.0.0.1:19080`.
- Command:
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs`

### Technical details
- Required default URLs:
  - backend: `http://127.0.0.1:19080`
  - web: `http://127.0.0.1:5175`
- Override env vars:
  - `HAIR_BACKEND_URL`
  - `HAIR_WEB_URL`
  - `HAIR_SMOKE_OUT`
  - `PLAYWRIGHT_PACKAGE`

## Step 24: Capture dense admin layout reference and DSL gap analysis

This step captured the two user-provided layout screenshots into the HAIR-041 ticket and turned them into a design analysis document. The target screenshot shows a denser operational admin workbench than the current Admin DSL page: persistent sidebar navigation, compact KPI cards, table-first resources, a true month calendar, comparison-table draft changes, recent activity, and a compact preview panel.

The analysis focuses on what the DSL needs to describe those pages semantically instead of forcing backend flows to compose admin screens from frontend-inspired, spacious widgets.

### Prompt Context

**User prompt (verbatim):** "Copy this image into the ticket, along with the original layout (as it is right now): /tmp/pi-clipboard-fc066c42-9b6f-4153-9c1d-1c50781ff59e.png \n\nNow examine the first one in detail, and study what the components are and the differences and the layout changes, and what DSL constructs would be necessary to make it possible to render / describe admin pages like that, beecause currently the fac tthat we are using mostly frontend / frontend inspired widgets makes our admit layouts a bit inefficient, since the needs are different."

**Assistant interpretation:** Copy both screenshots into the HAIR-041 ticket, compare the target dense admin reference against the current layout, and document the Admin DSL constructs needed to support this more efficient admin style.

**Inferred user intent:** The user wants the Admin DSL to evolve toward operational back-office layout semantics rather than continuing to build admin pages from oversized frontend/customer-flow widgets.

**Commit (code):** N/A — documentation and reference assets only.

### What I did
- Copied the target screenshot into:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/01-target-efficient-admin-layout.png`
- Copied the current/original screenshot into:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/02-current-original-admin-layout.png`
- Created:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/02-admin-layout-density-reference-analysis.md`
- Related the new design document to the copied screenshots and current Admin DSL schema files.

### Why
- The visual difference is substantial enough to deserve a durable design note before implementation.
- The target image highlights missing semantic constructs: workbench shell, page header, dashboard grid, compact panels, richer resource tables, comparison tables, month calendar, and density policies.

### What worked
- The copied images are now tracked in the ticket workspace and embedded in the design document.
- The existing Admin DSL schema already has several useful lower-level primitives, so the recommendation can focus on adding semantic composition and density policies instead of replacing everything.

### What didn't work
- N/A. This was documentation/reference capture only.

### What I learned
- The current layout is not inefficient because the renderer is incapable; it is inefficient because the DSL lacks admin-native composition grammar.
- The target page is mostly a different layout semantics problem, not a need for many bespoke widgets.

### What was tricky to build
- The main judgement call was separating what should become new DSL node kinds from what can be expressed as richer props on existing nodes such as `panel`, `cardGrid`, `resourceTable`, `activityFeed`, and `monthAvailabilityGrid`.

### What warrants a second pair of eyes
- Review whether `dashboardGrid`, `pageHeader`, `monthCalendar`, and `comparisonTable` should be new node kinds or evolutions of existing primitives.
- Review whether shell/sidebar should be sent on every page response or managed as a reusable app-shell descriptor.

### What should be done in the future
- Implement a target-style Storybook fixture before changing `/admin/intake` production flow screens.
- Add visual regression captures against the new workbench-style fixture.
- Decide which constructs become schema additions versus prop extensions.

### Code review instructions
- Start with `design-doc/02-admin-layout-density-reference-analysis.md`.
- Compare the two embedded screenshots in `various/design-reference/`.
- Cross-check proposed constructs against `web/src/admin-dsl/schema.ts` and `pkg/admindsl/types.go`.

### Technical details
- Target screenshot dimensions: 1297×1212.
- Current screenshot dimensions: 1113×1042.
- The design note proposes an Admin Workbench layer with shell/sidebar, page header, dashboard grid, structured panel, table column grammar, comparison table, month calendar, activity feed, action placement, and density tokens.

## Step 25: Write intern implementation guide and upload to reMarkable

This step turned the dense admin layout analysis into a long-form intern guide. The guide explains the Admin DSL system from first principles, maps the backend/runtime/frontend layers, studies the target and current screenshots, and gives a concrete phased implementation plan for adding an Admin Workbench DSL layer.

The document is intended to be handed to a new engineer before they implement workbench shell/sidebar, page header, dashboard grid, compact panels, richer tables, comparison tables, month calendars, and density policies.

### Prompt Context

**User prompt (verbatim):** "Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Create a thorough technical onboarding/design/implementation document in the HAIR-041 ticket and upload it as a PDF to reMarkable.

**Inferred user intent:** The user wants the next Admin Workbench DSL implementation to be approachable for a new contributor, with enough context to understand the architecture and enough specificity to execute the work safely.

**Commit (code):** N/A — documentation and reference assets only.

### What I did
- Created `design-doc/03-admin-workbench-dsl-intern-implementation-guide.md`.
- The guide includes:
  - system overview diagrams,
  - visual comparison of target vs current screenshots,
  - file-by-file references,
  - Admin DSL runtime/HTTP/action architecture,
  - proposed workbench constructs,
  - JSON/Go/TS/JS pseudocode,
  - implementation phases,
  - testing and Storybook strategy,
  - validation commands and API references.
- Related the guide to the copied screenshots and core Admin DSL files using `docmgr doc relate`.
- Uploaded the guide to reMarkable:
  - `/ai/2026/05/16/HAIR-041/HAIR 041 Admin Workbench DSL Intern Guide.pdf`

### Why
- The Admin Workbench direction touches Go schema, Go builders, Goja modules, backend flow modules, frontend schema, React renderer, Storybook, visual review, and live `/admin/intake` behavior.
- A new contributor needs a single coherent guide before changing any of these layers.

### What worked
- `remarquee upload bundle ... --non-interactive` succeeded directly.
- The guide could reuse the copied screenshot references already stored in the ticket workspace.

### What didn't work
- My first frontmatter validation command used a `ttmp/...` path, and `docmgr` prepended the docs root again:
  - `docmgr validate frontmatter --doc ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/02-admin-layout-density-reference-analysis.md --suggest-fixes`
  - Error: `open /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/02-admin-layout-density-reference-analysis.md: no such file or directory`
- The corrected validation path omitted the leading `ttmp/`, and both new design docs validated successfully.
- The reMarkable upload succeeded without requiring status/list/account checks.

### What I learned
- The clearest way to explain the work is not by starting with individual widgets, but by explaining the JSON page contract and then showing how workbench semantics sit above existing primitives.

### What was tricky to build
- The guide needed to be implementation-oriented without prematurely deciding every schema detail. It therefore distinguishes recommended constructs from open questions such as whether `dashboardGrid` should be a new node or an extension of `cardGrid`.

### What warrants a second pair of eyes
- Review whether the proposed phased plan should start frontend-only in Storybook or add Go schema constants first.
- Review whether `pageHeader`, `dashboardGrid`, `comparisonTable`, and `monthCalendar` should be new node kinds or prop extensions of existing primitives.

### What should be done in the future
- Use the guide as the checklist for the next implementation slice.
- Add the target workbench Storybook fixture before modifying live `/admin/intake` flows.

### Code review instructions
- Start with `design-doc/03-admin-workbench-dsl-intern-implementation-guide.md`.
- Compare it with `design-doc/02-admin-layout-density-reference-analysis.md` and the screenshots in `various/design-reference/`.
- Confirm the file references still match the current codebase before assigning implementation work.

### Technical details
- reMarkable command used:
  - `remarquee upload bundle ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/03-admin-workbench-dsl-intern-implementation-guide.md --name "HAIR 041 Admin Workbench DSL Intern Guide" --remote-dir "/ai/2026/05/16/HAIR-041" --toc-depth 2 --non-interactive`

## Step 26: Write Admin DSL v2 cleanup intern guide and upload to reMarkable

This step produced a separate intern-oriented guide for the Admin DSL v2 cleanup. The new document is intentionally different from the previous workbench layout guide: it focuses on what to tighten, remove, rename, split, and validate now that the project does not need backwards compatibility for the Admin DSL cutover.

The guide frames v2 as a semantic admin-workbench DSL rather than a general visual component DSL. It explains why the current v1 node vocabulary mixes abstraction levels, which primitives should be kept or strengthened, which should be removed or replaced, and how to implement the cutover through TypeScript schema, React renderer, Go schema/builders, Goja exports, validation, flow migration, Storybook, and live smoke tests.

### Prompt Context

**User prompt (verbatim):** "ok, Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable.

It's a separate document, upload to remarkable as well. Keep a diary as you work"

**Assistant interpretation:** Create a separate detailed intern guide for the Admin DSL v2 cleanup/redesign direction, store it in the HAIR-041 ticket, upload it to reMarkable, and record the work in the diary.

**Inferred user intent:** The user wants the concise Admin DSL critique turned into a durable implementation document that a new contributor can follow before making breaking v2 schema and renderer changes.

**Commit (code):** N/A — documentation only.

### What I did
- Created `design-doc/04-admin-dsl-v2-cleanup-and-workbench-semantics-intern-guide.md`.
- The guide covers:
  - current Admin DSL architecture,
  - core files and responsibilities,
  - what is wrong with v1,
  - v2 design goals,
  - keep/add/remove/rename recommendations,
  - v2 page shape with `schemaVersion: 2`,
  - workbench shell, page header, dashboard grid, panel, resource table, comparison table, calendar, forms, actions, surfaces, and validation design,
  - cutover plan with no backwards-compatibility shims,
  - API references,
  - testing matrix,
  - migration examples,
  - code review checklist.
- Related the guide to core Admin DSL schema/runtime/renderer files and the previous workbench intern guide.
- Validated frontmatter successfully.
- Uploaded to reMarkable:
  - `/ai/2026/05/16/HAIR-041/HAIR 041 Admin DSL v2 Cleanup Intern Guide.pdf`

### Why
- The project now has permission to break compatibility, which changes the right implementation strategy.
- A separate v2 cleanup guide gives future implementation work a concrete target: semantic workbench DSL, stricter validation, and a clean schema cutover.

### What worked
- `remarquee upload bundle ... --non-interactive` succeeded directly.
- Frontmatter validation passed after using the correct docmgr path form.

### What didn't work
- My first `docmgr doc relate --doc` attempt used the path without the leading `ttmp/`:
  - `docmgr doc relate --doc 2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/04-admin-dsl-v2-cleanup-and-workbench-semantics-intern-guide.md ...`
  - Error: `expected exactly 1 doc for --doc "2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/04-admin-dsl-v2-cleanup-and-workbench-semantics-intern-guide.md", got 0`
- The corrected `docmgr doc relate --doc ttmp/...` command worked.

### What I learned
- For this docmgr workflow, `doc relate --doc` resolved the `ttmp/...` path successfully, while `validate frontmatter --doc` wanted the ticket-relative path without `ttmp/`. This is worth remembering because the two commands have different path expectations in practice.

### What was tricky to build
- The hard part was keeping the document concise enough to be actionable while still technical enough for a new intern. The v2 cleanup touches schema, renderer, runtime, builders, flow JS, validation, Storybook, and live smoke tests, so the guide had to separate conceptual design from implementation phases.

### What warrants a second pair of eyes
- Review the proposed removal list before implementation, especially `resourceList`, `resourceRow`, `splitPane`, `imageGrid`, and `markdownBlock`/`richText`.
- Review whether `schemaVersion: 2` should be enforced in one cut or phased behind a feature branch.

### What should be done in the future
- Use the guide to create a concrete v2 implementation ticket or task checklist.
- Start with a frontend-only Storybook v2 fixture before migrating live backend flows.

### Code review instructions
- Start with `design-doc/04-admin-dsl-v2-cleanup-and-workbench-semantics-intern-guide.md`.
- Compare it against `design-doc/03-admin-workbench-dsl-intern-implementation-guide.md`; the new guide is the breaking cleanup/cutover plan, while the previous guide is the workbench feature implementation guide.
- Check the keep/add/remove recommendations against `web/src/admin-dsl/schema.ts` and `pkg/admindsl/types.go`.

### Technical details
- reMarkable command used:
  - `remarquee upload bundle ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/04-admin-dsl-v2-cleanup-and-workbench-semantics-intern-guide.md --name "HAIR 041 Admin DSL v2 Cleanup Intern Guide" --remote-dir "/ai/2026/05/16/HAIR-041" --toc-depth 2 --non-interactive`

## Step 27: Add Admin DSL v2 implementation phases to the ticket

This step converted the Admin DSL v2 cleanup guide into an executable ticket task plan. The new phases separate decision-making, frontend renderer/Storybook work, Go schema/builders/validation, flow migration, and final live validation so the v2 cutover can happen in reviewable slices.

The plan intentionally assumes no backwards-compatibility shims. The tasks are written around a clean semantic workbench cutover: freeze the v2 vocabulary, build the frontend fixture, update Go builders and validation, migrate flows, then remove obsolete v1 branches once the migrated pages pass smoke and visual review.

### Prompt Context

**User prompt (verbatim):** "alright, add phases with deailed tasks to the ticket, then implement one by one, keep a diary as you work, commit at appropriate intervals."

**Assistant interpretation:** Add detailed phased Admin DSL v2 tasks to HAIR-041, then begin implementing them incrementally with diary updates and commits.

**Inferred user intent:** The user wants the v2 cleanup guide turned into actionable ticket work and implemented step-by-step instead of remaining only as design prose.

**Commit (code):** pending — task/doc update only.

### What I did
- Added Phase 11 through Phase 15 to `tasks.md`:
  - Phase 11: vocabulary and cutover planning.
  - Phase 12: frontend v2 renderer and Storybook fixture.
  - Phase 13: Go schema/builders/validation/Goja exports.
  - Phase 14: Admin flow migration.
  - Phase 15: live validation, visual review, and cleanup.

### Why
- The v2 work spans multiple layers and should not be implemented as one giant change.
- Detailed task phases make it possible to commit at natural boundaries and keep status honest.

### What worked
- The existing `tasks.md` already had phase structure, so adding v2 phases was straightforward.

### What didn't work
- N/A.

### What I learned
- The most important sequencing decision is to start with a frontend Storybook fixture before changing live backend flow outputs.

### What was tricky to build
- The task list needed to be detailed enough for implementation but not over-prescribe every schema decision before Phase 11 is complete.

### What warrants a second pair of eyes
- Review the Phase 11 decisions before starting destructive removals of v1 node kinds.

### What should be done in the future
- Start Phase 12 with frontend-only v2 Storybook fixtures and renderer support.

### Code review instructions
- Review the newly added Phase 11–15 tasks in `tasks.md`.
- Confirm the task order matches the desired cutover strategy.

### Technical details
- Phase 12 starts with TypeScript/schema/renderer/Storybook only to reduce risk.

## Step 28: Implement Phase 12 frontend Admin DSL v2 workbench fixture

This step started implementation with the safest slice: frontend schema, renderer, and Storybook support for the v2 workbench vocabulary. It does not yet migrate live backend Goja flows or remove v1 nodes, but it creates the target rendering surface that the backend can migrate toward.

The new fixture gives us a concrete visual and semantic target: a `schemaVersion: 2` admin page with workbench shell/sidebar, page header, dashboard grid, panels, KPI cards, v2-style resource table cells, comparison table, month calendar, activity feed, and preview panel.

### Prompt Context

**User prompt (verbatim):** (same as Step 27)

**Assistant interpretation:** After adding phased tasks, begin implementing the phases one at a time, starting with the frontend v2 workbench fixture.

**Inferred user intent:** The user wants visible incremental progress toward the Admin DSL v2 cutover, with commits and diary entries at natural boundaries.

**Commit (code):** pending — frontend v2 Storybook fixture and renderer support.

### What I did
- Updated `web/src/admin-dsl/schema.ts`:
  - added `pageHeader`, `dashboardGrid`, `comparisonTable`, and `monthCalendar` node kinds,
  - allowed `schemaVersion: 1 | 2` for the transition fixture,
  - added v2 action placements such as `pageHeader`, `panelFooter`, `rowOverflow`, `calendarCell`, and `sidebarNav`.
- Updated `web/src/admin-dsl/builder.ts`:
  - added `schemaVersion(...)` on `AdminPageBuilder`,
  - added frontend fixture builders for `pageHeader`, `dashboardGrid`, `comparisonTable`, and `monthCalendar`.
- Updated `web/src/admin-dsl/render.tsx`:
  - added workbench shell/sidebar rendering for `shell.props.variant = "workbench"`,
  - added `pageHeader`, `dashboardGrid`, `comparisonTable`, and `monthCalendar` render cases,
  - strengthened `panel` with header/body/footer action structure, density, padding, and layout-friendly chrome,
  - added v2-style resource table cell rendering for text, badge, drag handle, boolean, actions, and overflow actions.
- Added `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`:
  - `TargetDesktop`,
  - `TargetMobile`.
- Updated Phase 12 task statuses for completed frontend fixture work.
- Related modified files to the v2 guide.
- Validated:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 46 tests passed.

### Why
- Starting in Storybook lets us validate the Admin DSL v2 semantic shape without first breaking live backend flows.
- The target layout needs concrete renderer semantics before Go builders and Goja flows can migrate safely.

### What worked
- The existing renderer structure made it straightforward to add explicit node-kind cases.
- Existing generic JSON props were flexible enough to prototype layout spans, density, sidebar items, table columns, calendar markers, and footer actions.
- TypeScript and frontend tests passed after the first implementation pass.

### What didn't work
- I did not add the dedicated renderer tests yet; the Phase 12 test task remains open. Current validation relies on existing tests plus TypeScript compilation.
- This is not a full cutover: v1 nodes still exist so current stories and live backend pages continue to compile while later phases migrate them.

### What I learned
- `panel` is the right place to centralize admin chrome. Once panels have header/body/footer/density semantics, the child widgets become simpler and more table/calendar/feed-like.
- `resourceTable` can absorb many list/card cases if column rendering becomes semantic rather than raw string lookup.

### What was tricky to build
- Workbench shell rendering needed to live at page-frame level, not as an ordinary node, because the sidebar changes the entire page layout.
- Action placement and presentation are still loosely enforced in the frontend; v2 validation in Go should later make malformed combinations fail earlier.

### What warrants a second pair of eyes
- Review whether allowing `schemaVersion: 1 | 2` in TypeScript is acceptable during implementation, or whether the clean cutover should happen sooner in a branch.
- Review visual fidelity of `Admin DSL/Workbench v2/TargetDesktop` against the target screenshot before migrating backend flows.

### What should be done in the future
- Add renderer tests for page header, sidebar nav dispatch, comparison table review actions, and calendar cell actions.
- Start Phase 13 Go schema/builders only after the frontend fixture shape is approved.

### Code review instructions
- Start with `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` to understand the target fixture.
- Then review `web/src/admin-dsl/render.tsx` for the new explicit render cases and workbench shell.
- Check `web/src/admin-dsl/schema.ts` and `web/src/admin-dsl/builder.ts` for the frontend schema/builder changes.
- Validate with `cd web && npx tsc --noEmit` and `cd web && pnpm test -- --runInBand`.

### Technical details
- New Storybook section: `Admin DSL/Workbench v2`.
- New stories: `TargetDesktop`, `TargetMobile`.

## Step 29: Add frontend renderer tests for Admin DSL v2 primitives

This step closed the remaining frontend test task for Phase 12. The new tests exercise the v2 workbench shell, page header action dispatch, typed resource-table cell rendering, row-overflow actions, comparison-table review actions, and month-calendar date selection.

These tests are intentionally renderer-level tests rather than visual tests. Their job is to prove that the new v2 nodes are not just Storybook decoration: they render useful DOM and dispatch the correct semantic action metadata through the existing Admin DSL action channel.

### Prompt Context

**User prompt (verbatim):** (same as Step 27)

**Assistant interpretation:** Continue implementing the newly added phases one task at a time, committing after the next coherent test slice.

**Inferred user intent:** The user wants the v2 implementation to advance with validation coverage instead of only adding visual fixtures.

**Commit (code):** pending — frontend renderer tests for v2 primitives.

### What I did
- Added tests in `web/src/admin-dsl/AdminDsl.test.tsx` for:
  - v2 workbench shell rendering and sidebar nav dispatch,
  - `pageHeader` action dispatch,
  - v2 `resourceTable` typed cell rendering and row-overflow dispatch,
  - `comparisonTable` review action dispatch,
  - `monthCalendar` marker/legend rendering and date-selection dispatch.
- Marked the Phase 12 renderer-test task complete.
- Validated:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 10 files, 50 tests passed.

### Why
- New DSL primitives should have behavior tests before backend flows start depending on them.
- The tests guard the core v2 contract: JSON nodes render explicitly and dispatch opaque backend action descriptors.

### What worked
- The existing testing setup made it easy to assert dispatch events from the renderer.
- The new builder helpers kept v2 test fixtures concise.

### What didn't work
- N/A.

### What I learned
- The v2 nodes are already testable through the same action path as v1 nodes, which means the runtime/event model does not need to change for this frontend slice.

### What was tricky to build
- The calendar date buttons are generated from derived month cells, so the test asserts the accessible button name for day `23` rather than depending on internal cell structure.

### What warrants a second pair of eyes
- Review whether the row-overflow action should dispatch only the first row action or open a real menu when multiple actions are present. The current first-pass renderer dispatches the first action.

### What should be done in the future
- Add visual screenshot review for `Admin DSL/Workbench v2/TargetDesktop` and `TargetMobile`.
- Start Phase 13 Go schema/builders after visual approval of the frontend fixture.

### Code review instructions
- Review the new tests at the end of `web/src/admin-dsl/AdminDsl.test.tsx`.
- Re-run `cd web && pnpm test -- --runInBand`.

### Technical details
- Test count increased from 46 to 50.

## Step 30: Add Go Admin DSL v2 builders and Goja exports

This step moved the v2 workbench vocabulary from frontend-only fixtures into the Go Admin DSL package. The Go schema now knows the v2 node kinds and action placements, the host-side builders can construct v2 workbench nodes, and the Goja admin module exposes the new helpers to embedded flow JavaScript.

This is still not the destructive v2 cutover. Builders can opt into `schemaVersion: 2`, and validation accepts v1 and v2 while flows are migrated. The no-backwards-compatibility cleanup will happen after the live flows have v2 replacements.

### Prompt Context

**User prompt (verbatim):** (same as Step 27)

**Assistant interpretation:** Continue implementing the next phase after frontend fixture/tests by adding matching Go-side v2 schema/builders/exports.

**Inferred user intent:** The user wants the v2 DSL to become usable from real backend Goja flows, not just frontend Storybook fixtures.

**Commit (code):** pending — Go Admin DSL v2 builders and tests.

### What I did
- Updated `pkg/admindsl/types.go`:
  - added `NodePageHeader`, `NodeDashboardGrid`, `NodeComparisonTable`, and `NodeMonthCalendar`,
  - added v2 action placements such as `PlacementPageHeader`, `PlacementPanelFooter`, `PlacementRowOverflow`, `PlacementCalendarCell`, and `PlacementSidebarNav`.
- Updated `pkg/admindsl/validate.go`:
  - allowed the new node kinds and action placements,
  - allowed `schemaVersion` 1 or 2 during the migration window.
- Updated `pkg/admindsl/builder.go`:
  - added `SchemaVersion(...)` on `PageBuilder`,
  - added `PageHeader`, `DashboardGrid`, `ComparisonTable`, and `MonthCalendar`,
  - added `Layout`, `Density`, `FooterActions`, and `ToolbarActions` helpers on `NodeBuilder`.
- Updated `pkg/admindsl/goja_module.go`:
  - exported `pageHeader`, `dashboardGrid`, `panel`, `comparisonTable`, and `monthCalendar` to Goja.
- Added tests:
  - `TestGoHostBuilderSupportsV2WorkbenchNodes`,
  - `TestGojaModuleExposesV2WorkbenchBuilders`.
- Marked the corresponding Phase 13 tasks complete.
- Validated:
  - `go test ./pkg/admindsl -count=1`,
  - `go test ./pkg/admindsl ./pkg/server -count=1`.

### Why
- Backend flows need host-owned builders for the v2 vocabulary so runtime validity stays in Go instead of drifting into JavaScript helper code.
- Exposing the same vocabulary to Goja prepares Phase 14 flow migration.

### What worked
- The existing builder and Goja module architecture made this a small additive slice.
- Existing validation could be extended to recognize the new node kinds and placements without changing the runtime action model.

### What didn't work
- The first Goja test run failed because `panel` was not exported from `GojaModule` even though JS fixtures need it:
  - `TypeError: Object has no member 'panel' at <eval>:9:23(68)`
- Fix: export `panel: Panel` alongside the new v2 helpers.

### What I learned
- Some builders existed in Go but were not exposed to Goja. Phase 14 flow migration will need careful checks for every helper used by embedded flow JS.

### What was tricky to build
- This slice intentionally avoids flipping the default builder schema version to 2. Doing that before flow migration would break existing live flows. The clean cutover should happen after v2 flow replacements exist, not in the helper-introduction commit.

### What warrants a second pair of eyes
- Review whether accepting both schema versions in `ValidatePage` is acceptable during the migration window, given the no-compatibility goal for the final cutover.
- Review the new action placement names for consistency before flows begin using them heavily.

### What should be done in the future
- Add stricter v2-specific validation for required props, table columns, row IDs, field value types, and deprecated v1 node rejection after flow migration.
- Start Phase 14 by migrating a small flow or fixture to the new Goja v2 builders.

### Code review instructions
- Start with `pkg/admindsl/types.go`, then `pkg/admindsl/builder.go`, then `pkg/admindsl/goja_module.go`.
- Review `pkg/admindsl/builder_test.go` and `pkg/admindsl/goja_module_test.go` for intended builder usage.
- Validate with `go test ./pkg/admindsl ./pkg/server -count=1`.

### Technical details
- `PageBuilder.SchemaVersion(2)` is the opt-in migration path for now.

## Step 31: Expand v2 Storybook coverage, capture mobile screenshots, and tighten validation

This step responded to the request to look at Storybook widgets without Storybook chrome and verify mobile behavior. I expanded the Admin DSL v2 workbench catalog from two target stories into a broader set of operational examples, captured iframe screenshots directly, reviewed mobile screenshots, and made immediate mobile usability fixes.

The goal was to keep the DSL simple and effective: the mobile renderer now collapses the workbench sidebar into a compact top bar, resource/comparison tables collapse into labeled card rows, badges have stronger contrast, checkboxes and overflow controls have larger touch targets, and headings are slightly less dominant on narrow screens.

### Prompt Context

**User prompt (verbatim):** "make plenty of stories in storybook to cover all the new functionality and make a whole set of intreesting examples"

**Assistant interpretation:** Add a richer Storybook catalog for the new Admin DSL v2 functionality, not just the single target screenshot fixture.

**Inferred user intent:** The user wants broad visual coverage of the new primitives so we can review how they behave across realistic admin use cases.

**Commit (code):** pending — v2 Storybook catalog, screenshots, mobile fixes, and validation hardening.

### What I did
- Expanded `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` with stories for:
  - target desktop/mobile dashboard,
  - service operations,
  - request triage,
  - draft review queue,
  - calendar publishing,
  - typed form workbench,
  - empty/loading/error states,
  - audit workbench,
  - dense mobile operations.
- Added ticket script:
  - `scripts/04-capture-admin-dsl-v2-storybook.mjs`
- Captured Storybook iframe screenshots without Storybook chrome into:
  - `various/storybook-v2/`
- Reviewed screenshots directly and with image analysis.
- Updated `web/src/admin-dsl/render.tsx` mobile behavior:
  - workbench sidebar collapses into a compact top bar on mobile,
  - resource/comparison tables collapse to labeled card rows,
  - drag-handle cells are hidden on mobile,
  - actions labels are hidden above large mobile action buttons,
  - row-overflow buttons use 44px touch targets,
  - checkboxes are larger,
  - badge colors are higher contrast,
  - mobile H1 sizing is slightly reduced.
- Continued Phase 13 validation hardening in `pkg/admindsl/validate.go`:
  - v2 `pageHeader` requires `title`,
  - v2 `panel` requires `title` or `ariaLabel`,
  - v2 `resourceTable` requires columns and row IDs,
  - v2 `comparisonTable` requires rows with `id`, `field`, `current`, and `draft`,
  - v2 `monthCalendar` requires `month`,
  - v2 typed fields require `name`/`label` and enforce boolean/select/money/duration value shapes.
- Added validation tests for invalid v2 shapes.
- Marked completed Phase 13 validation and Phase 15 Storybook screenshot tasks.
- Validated:
  - `go test ./pkg/admindsl -count=1`
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 50 tests passed.

### Why
- Storybook iframe screenshots show the actual rendered components without Storybook chrome, which is the right artifact for mobile layout review.
- More stories exercise the DSL as an admin-workbench language rather than only a single page mockup.
- Tight v2 validation catches malformed pages before backend flows start depending on the new vocabulary.

### What worked
- The screenshot script can capture all v2 workbench stories using `/iframe.html?id=...`, so screenshots contain only the rendered app.
- The table-to-card mobile CSS immediately improved request/service readability and removed the cramped multi-column mobile table issue.
- Restarting Storybook cleared the stale Vite module error and allowed the captures to proceed.

### What didn't work
- The first `go test ./pkg/admindsl -count=1` failed after adding validation helpers:
  - `pkg/admindsl/validate.go:333:7: duplicate case []any in type switch`
  - Cause: `JSONValue` is an alias for `any`, so `[]JSONValue` and `[]any` are the same type in a type switch.
  - Fix: removed the duplicate `[]any` case and kept `[]JSONValue`.
- The first screenshot capture after renderer changes timed out because the running Storybook/Vite process served a stale module state:
  - `SyntaxError: The requested module '/src/admin-dsl/render.tsx?...' does not provide an export named 'AdminPageRenderer'`
  - Fix: restarted Storybook on port 6006 and reran the capture script successfully.

### What I learned
- Mobile admin tables should not remain tables visually. The same `resourceTable` DSL can render as desktop table and mobile labeled cards, which supports the v2 goal of keeping backend semantics stable while the renderer adapts.
- The workbench sidebar must be page-frame behavior, not a body node. On mobile it should collapse aggressively; otherwise it consumes the first screen before the actual admin work appears.

### What was tricky to build
- The CSS had to override inline table styles on mobile, so the responsive rules use targeted `!important` overrides for table/card conversion.
- The v2 validation helpers had to account for Go's `type JSONValue = any` alias, which affects type switches.

### What warrants a second pair of eyes
- Review whether the mobile top bar should open a real nav drawer now or remain a non-functional placeholder until flow navigation is wired.
- Review whether row-overflow should open a menu for multiple row actions instead of dispatching the first action.
- Review whether accepting both schema versions in validation should end immediately after Phase 14 flow migration, since the user explicitly prefers no backwards compatibility.

### What should be done in the future
- Begin Phase 14 flow migration and then remove v1 renderer/helper branches.
- Add visual-diff baselines for the captured Storybook v2 screenshots.
- Add a real mobile nav drawer if sidebar navigation needs to be interactive on mobile.

### Code review instructions
- Start with `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` to review the expanded story catalog.
- Inspect `various/storybook-v2/*.png` to compare mobile/desktop output without Storybook chrome.
- Review `web/src/admin-dsl/render.tsx` for mobile table-card conversion and workbench topbar behavior.
- Review `pkg/admindsl/validate.go` and `pkg/admindsl/builder_test.go` for v2 validation hardening.
- Validate with the commands listed above.

### Technical details
- Storybook capture command:
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/04-capture-admin-dsl-v2-storybook.mjs`
- Screenshots are stored under:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/storybook-v2/`

## Step 32: Apply aesthetic polish and migrate services flow to v2 workbench primitives

This step used the user-provided clean table/surface screenshots as aesthetic references. The main visual direction was to reduce heavy black pills for secondary row/footer actions, make tables feel lighter on desktop, preserve large touch targets on mobile, and keep the v2 workbench examples visually calm and operational.

It also migrated the small `/admin/services` Goja flow to `schemaVersion: 2` and v2 workbench primitives, which gives Phase 14 its first real live-flow migration slice.

### Prompt Context

**User prompt (verbatim):** "Improve things purely aesthetically /tmp/pi-clipboard-82340feb-e163-4c80-934e-a440cbae0126.png  /tmp/pi-clipboard-77193024-d70c-44ab-86da-8339b3cf5254.png /tmp/pi-clipboard-b510dde0-9c50-45ef-84f8-16a16511df53.png /tmp/pi-clipboard-56b0506f-85b0-4523-8aee-915e248d1829.png"

**Assistant interpretation:** Use the supplied screenshots as aesthetic references and make the Admin DSL v2 widgets cleaner without changing the core architecture.

**Inferred user intent:** The user wants the new workbench widgets to feel visually refined, not merely functional, before broader flow migration continues.

**Commit (code):** pending — aesthetic renderer polish and services-flow v2 migration.

### What I did
- Copied the four user-provided aesthetic reference images into:
  - `various/aesthetic-reference/01-surface-catalog-clean-layout.png`
  - `various/aesthetic-reference/02-clean-services-table.png`
  - `various/aesthetic-reference/03-clean-draft-changes-table.png`
  - `various/aesthetic-reference/04-clean-context-rows.png`
- Updated `web/src/admin-dsl/actions.ts` so `open` and `mutation` actions are not automatically treated as primary; primary styling now comes from `priority: "primary"` or `intent: "primary"`.
- Updated `web/src/admin-dsl/render.tsx` aesthetics:
  - secondary row/footer actions render as subtle text links with arrows,
  - true primary actions keep black pill treatment,
  - row overflow controls keep 44px touch targets,
  - badge contrast is stronger,
  - mobile table/card action labels are less redundant.
- Migrated `pkg/admindsl/flows/services.flow.js` to v2:
  - `SchemaVersion(2)`,
  - workbench shell props,
  - `pageHeader`,
  - `dashboardGrid`,
  - `panel`,
  - `resourceTable`,
  - no `section`, `resourceList`, or `resourceRow` usage.
- Updated `pkg/admindsl/flows_test.go` to assert the updated service title through the v2 resource table row shape.
- Re-captured Storybook v2 screenshots without Storybook chrome.
- Marked the services-flow Phase 14 migration task complete and recorded successful Go validation tasks.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 50 tests passed.

### Why
- The reference screenshots showed that the cleaner aesthetic depends less on heavy button chrome and more on quiet tables, subtle action links, and consistent cards.
- Migrating `/admin/services` first is lower risk than migrating the larger intake flow and proves that real Goja flows can emit v2 workbench pages.

### What worked
- Changing `actionIsPrimary` immediately reduced excessive black pill styling for ordinary row/open actions.
- `resourceTable` v2 rows were enough to replace the old `resourceList`/`resourceRow` services flow.
- The captured desktop workbench screenshot now looks closer to the clean references: subtle row actions, lighter footer actions, and clear panel hierarchy.

### What didn't work
- `go test ./pkg/admindsl ./pkg/server -count=1` initially failed after migrating `services.flow.js` because `pageHeader.props.actions` and row `actions` contained `*admindsl.ActionBuilder` values, which are not JSON:
  - `props.actions[0] contains non-json value of type *admindsl.ActionBuilder`
  - Fix: attach bound actions through builder `.Actions(...)` / `.FooterActions(...)` where Go builders convert `ActionBuilder` to `ActionRef`, and use table-level row actions instead of embedding action builders in row JSON.
- The existing service flow test assumed the old `section -> resourceList -> resourceRow` tree and panicked with an index error after the v2 migration.
  - Fix: update the test to inspect `dashboardGrid -> panel -> resourceTable.props.rows[0].name`.
- A TypeScript compile failed because I initially used `color.clay`, which is not a design token.
  - Fix: use `color.plum` for subtle link actions.

### What I learned
- Bound Go action builders must not be placed directly inside raw JSON props from JS. They need to pass through Go builder methods that call `.Build()`.
- The no-backwards-compatibility direction is viable, but the safe path is to migrate one flow at a time and then remove old helpers/branches once all live flows are off v1 primitives.

### What was tricky to build
- Aesthetic changes had to preserve mobile usability. Subtle desktop row links should not become tiny mobile tap targets, so the CSS keeps mobile action controls at usable heights.
- The service flow migration had to keep backend action binding semantics intact while changing the page tree shape.

### What warrants a second pair of eyes
- Review whether secondary panel-footer actions should always be text links, or whether some contexts should still use bordered secondary buttons.
- Review whether status badges should become plain colored text on desktop to match the clean table reference even more closely.

### What should be done in the future
- Continue Phase 14 by migrating `/admin/intake` dashboard next.
- Once all flows migrate, make `schemaVersion: 2` mandatory and remove v1 node helpers/renderer branches.

### Code review instructions
- Review `web/src/admin-dsl/actions.ts` first for the action-priority behavior change.
- Then review `web/src/admin-dsl/render.tsx` for subtle action/link and badge styling.
- Review `pkg/admindsl/flows/services.flow.js` for the first live v2 flow migration.
- Check screenshots in `various/storybook-v2/` and aesthetic references in `various/aesthetic-reference/`.
- Validate with the commands above.

### Technical details
- `/admin/services` now emits `schemaVersion: 2` through `PageBuilder.SchemaVersion(2)`.

## Step 33: Refine service-list and button aesthetics from references

This step applied a focused visual refinement pass to the Admin DSL v2 service table and button treatment. The user provided a current service-list screenshot, a cleaner target service-list screenshot, and a sheet button-shape reference. The main change was to reduce pill-heavy chrome: statuses now read as calmer inline text, row overflow actions are plain ellipsis controls, secondary footer/row actions behave like text links, and form primary actions use a softer rectangular button shape instead of the large black pill style.

The result keeps strong black buttons only for explicit high-priority page actions, while routine row/table/footer controls match the cleaner admin table references more closely.

### Prompt Context

**User prompt (verbatim):** "/tmp/pi-clipboard-771a7810-7545-4d91-8122-c9f7aa02e0f8.png /tmp/pi-clipboard-cd4a1dff-ea9c-4c61-9818-a749abc1aee7.png

improve the current (first image) service list (see second image)"

**Assistant interpretation:** Compare the current service list against the cleaner target and reduce visual heaviness in the table/status/action treatment.

**Inferred user intent:** The user wants the Admin DSL v2 tables to look like clean admin tables rather than a collection of pill badges and pill action buttons.

**Commit (code):** pending — focused aesthetic refinement.

### What I did
- Copied new aesthetic references into `various/aesthetic-reference/`:
  - `05-current-service-list-before-button-shape.png`
  - `06-target-service-list-cleaner.png`
  - `07-target-button-shapes-sheet.png`
- Updated `web/src/admin-dsl/render.tsx`:
  - `badge` table cells now render as inline status text instead of filled pill chips.
  - overflow row actions render as plain ellipsis controls rather than circular icon buttons.
  - general button radius changed toward rectangular rounded controls (`radius.md`) instead of full pills.
  - `formFooter` primary actions use a softer cream rectangular button, matching the sheet reference better.
  - secondary row/panel/form actions render as subtle text controls.
  - mobile CSS preserves minimum tap targets while avoiding oversized pill styling for panel-footer actions.
- Re-captured Storybook v2 screenshots without Storybook chrome.
- Validated:
  - `go test ./pkg/admindsl ./pkg/server -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 50 tests passed.

### Why
- The clean references use table text, subtle row actions, and rectangular sheet buttons. The previous v2 pass was functional but still had too much pill chrome.
- These changes make dense admin tables feel lighter and more operational.

### What worked
- The desktop target screenshot now shows service statuses as plain colored text and row actions as compact ellipses, much closer to the reference.
- The action-priority change from the previous step made it straightforward to style only true primary actions strongly.

### What didn't work
- The first recapture attempt hit stale Storybook/Vite module state again and timed out waiting for `[data-admin-dsl-page]`.
- Fix: restarted Storybook on port 6006 and reran the capture script successfully.

### What I learned
- A small distinction between `primary`, `formPrimary`, and `subtle` actions gives much better visual control than treating all `open`/`mutation` actions as primary.
- Admin table status often reads better as text than as a badge; badges should be reserved for cases where the label needs high prominence.

### What was tricky to build
- The button shape change needed to avoid breaking mobile usability. The visual controls became calmer, but mobile CSS still enforces adequate action heights.

### What warrants a second pair of eyes
- Review whether status text should remain plain globally or be configurable per column (`display: text | badge`).
- Review whether form primary buttons should use cream fill everywhere or only in sheets/drawers.

### What should be done in the future
- If this visual direction is accepted, encode it as the default v2 table/action style and keep badges as an explicit column option.

### Code review instructions
- Compare `various/aesthetic-reference/05-current-service-list-before-button-shape.png` and `06-target-service-list-cleaner.png` with `various/storybook-v2/admin-dsl-workbench-v2--target-desktop-desktop.png`.
- Review `web/src/admin-dsl/render.tsx`, especially `renderActions` and `renderTableCell`.

### Technical details
- Storybook capture command reused:
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/04-capture-admin-dsl-v2-storybook.mjs`

## Step 34: Migrate live intake admin flows to Admin DSL v2

This step completed the main Phase 14 cutover for the real `/admin/intake` flow family. The dashboard, request queue/detail screens, config editor, audit log, health diagnostics, preview screen, and config drawers now emit schema v2 workbench pages using `pageHeader`, `dashboardGrid`, `panel`, `resourceTable`, `comparisonTable`, and `monthCalendar` instead of the older visual/container primitives.

The migration keeps the app-specific mutation semantics in the flow and host modules, but moves the emitted UI shape onto the semantic workbench vocabulary. This leaves the remaining cleanup focused on removing deprecated v1 primitives from generic builders/renderer/tests/stories once all non-flow fixtures are updated or intentionally retained as legacy examples.

### Prompt Context

**User prompt (verbatim):** "go ahead, keep a diary as you work"

**Assistant interpretation:** Continue the HAIR-041 Admin DSL v2 migration work and update the diary/changelog/tasks while making progress.

**Inferred user intent:** The user wants autonomous forward progress on Phase 14, with enough written context to review or resume the work later.

**Commit (code):** pending — intake flow v2 migration.

### What I did
- Migrated `pkg/admindsl/flows/intake_admin.flow.js`:
  - switched dashboard page to `pageAdmin(...).SchemaVersion(2)`
  - added `pageHeader`
  - replaced dashboard `cardGrid`/`section` with `dashboardGrid`, metric cards with layout spans, and panels
- Migrated `pkg/admindsl/flows/intake_requests.flow.js`:
  - switched request queue/detail pages to schema v2
  - replaced toolbar/section/card-grid summary surfaces with `pageHeader`, `dashboardGrid`, and `panel`
  - kept request rows as semantic `resourceTable`
  - replaced photo modal `summaryCard` with a v2 panel plus markdown body
- Migrated `pkg/admindsl/flows/intake_config.flow.js`:
  - switched config page to schema v2
  - replaced `cardGrid` with `dashboardGrid`
  - replaced version/config sections with `panel`
  - replaced `editableList` editors with `resourceTable` rows
  - replaced `monthAvailabilityGrid` with `monthCalendar`
  - replaced validation `diffView` with `comparisonTable`
  - added small JS helpers for simple table rows, validation rows, and calendar markers/month selection
- Migrated `pkg/admindsl/flows/intake_ops.flow.js`:
  - switched audit, health, and preview pages to schema v2
  - replaced sections/card grids/diff view with page headers, dashboard grids, panels, metrics, resource tables, and comparison tables
- Migrated `pkg/admindsl/flows/intake_config_forms.flow.js` missing-entity drawer fallbacks:
  - replaced `summaryCard` with `panel` + `markdown` + `FooterActions`
- Updated `pkg/server/handlers_admin_dsl_test.go`:
  - action lookup now recursively scans all node prop values, not only `props.actions`, so tests find v2 `footerActions`, `toolbarActions`, and similar placement props.
- Updated HAIR-041 tasks:
  - marked Phase 14 intake dashboard/request/config/ops migrations complete
  - marked live `/admin/intake` screenshot capture complete
- Re-ran live smoke:
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs`
  - refreshed `phase8-admin-dashboard.png` and `phase8-admin-requests.png`

### Why
- The Admin DSL v2 direction is to use semantic workbench primitives and remove vague visual primitives from real flows.
- Moving all live intake flow modules to v2 unblocks the later strict cutover: requiring schema v2 and deleting deprecated v1 nodes/builders/renderer branches.

### What worked
- `go test ./pkg/admindsl ./pkg/server -count=1` passed after updating the server test helper for v2 action placements.
- Full validation passed:
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand` — 50 tests passed
- The live customer-submit-to-admin smoke passed after the migration.

### What didn't work
- Initial server test failure:
  - `TestAdminDSLHTTPIntakeConfigCreatesDraft`: `nav.config action not found`
- Cause:
  - the test helper only searched `props.actions`; v2 pages put valid actions in `footerActions`/`toolbarActions`/page-header action props too.
- Fix:
  - changed `findAdminProtoActionID` to scan all prop values recursively via the existing `findActionIDInValue` helper.

### What I learned
- v2 action placement is not just visual metadata; tests and tooling must treat all action-bearing props as action surfaces, not only `actions`.
- The real config editor maps cleanly to v2: `editableList` becomes `resourceTable`, validation `diffView` becomes `comparisonTable`, and availability becomes `monthCalendar` with markers.

### What was tricky to build
- `configEditorSection` had the most cross-cutting migration because it multiplexes tabs, add/edit actions, list rows, calendar rows, and validation state. The safe approach was to keep host mutation callbacks unchanged and only translate emitted nodes.
- Calendar migration needed a small adapter from app-owned availability rows into generic `monthCalendar` props (`month`, `markers`, `legend`, selected date).

### What warrants a second pair of eyes
- Review whether the config editor resource-table columns are the right permanent IA for services/tones/budgets/time slots, or whether some columns should become typed/boolean displays.
- Review the `monthCalendar` marker mapping for disabled vs available days before relying on it for publish review.
- Review whether drawer form actions should move from generic `.Actions(...)` to explicit `.FooterActions(...)`/form submit semantics in the next cleanup slice.

### What should be done in the future
- Remove deprecated v1 Admin DSL builders/Goja exports/renderer branches after updating non-live stories/tests.
- Make `ValidatePage` require `schemaVersion == 2` when the last migration-window fixtures are gone.
- Add visual diff baselines for the live v2 `/admin/intake` screenshots.

### Code review instructions
- Start with the flow files:
  - `pkg/admindsl/flows/intake_admin.flow.js`
  - `pkg/admindsl/flows/intake_requests.flow.js`
  - `pkg/admindsl/flows/intake_config.flow.js`
  - `pkg/admindsl/flows/intake_ops.flow.js`
  - `pkg/admindsl/flows/intake_config_forms.flow.js`
- Then inspect `pkg/server/handlers_admin_dsl_test.go` to confirm the test helper is intentionally placement-agnostic.
- Validate with:
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs`

### Technical details
- Deprecated flow primitives removed from live `pkg/admindsl/flows/*.flow.js` calls:
  - `admin.section`
  - `admin.cardGrid`
  - `admin.summaryCard`
  - `admin.editableList`
  - `admin.monthAvailabilityGrid`
  - `admin.diffView`
  - `admin.resourceList`
  - `admin.resourceRow`

## Step 35: Cut Go Admin DSL to schema v2 only

This step made the backend/Admin DSL builder layer v2-only after the real service and intake admin flows had migrated. The default Go page builder now emits `schemaVersion: 2`, `ValidatePage` rejects any other schema version, and deprecated v1 node constants/builders/Goja exports were removed from `pkg/admindsl`.

The frontend still has legacy Storybook/test fixtures and renderer branches to clean up next, but the authoritative backend/Goja construction path is now strict: scripts can no longer call `admin.section`, `admin.cardGrid`, `admin.summaryCard`, `admin.resourceList`, `admin.resourceRow`, `admin.editableList`, `admin.monthAvailabilityGrid`, or `admin.diffView` through the Goja module.

### Prompt Context

**User prompt (verbatim):** "go ahead, and keep a detailed diary and commit at appropriate intervals"

**Assistant interpretation:** Continue Phase 15 cleanup autonomously, keep detailed diary entries, and commit coherent slices rather than waiting for a large risky batch.

**Inferred user intent:** The user wants a safe, reviewable cutover from migration mode to v2-only behavior while preserving a clear audit trail.

**Commit (code):** pending — Go/Admin DSL v2-only cutover.

### What I did
- Updated `pkg/admindsl/builder.go`:
  - `NewPage` now defaults to `SchemaVersion: 2`.
  - removed deprecated builders: `Section`, `CardGrid`, `EditableList`, `MonthAvailabilityGrid`, `DiffView`, `SummaryCard`, `ResourceList`, `ResourceRow`.
- Updated `pkg/admindsl/types.go`:
  - removed deprecated node constants for v1-style visual/list/diff primitives.
- Updated `pkg/admindsl/goja_module.go`:
  - removed deprecated Goja exports so embedded admin scripts cannot construct those nodes anymore.
- Updated `pkg/admindsl/validate.go`:
  - `ValidatePage` now requires `schemaVersion == 2`.
  - `ValidateNode` validates in schema v2 mode by default.
  - removed deprecated node kinds from the allowed-node set.
- Updated Go tests:
  - rewrote builder and Goja tests to use `pageHeader`, `dashboardGrid`, `panel`, and `resourceTable`.
  - rewrote script-runtime fixture modules to emit v2 workbench nodes.
- Updated HAIR-041 tasks to mark the builder schema-version cutover and deprecated Go node constant removal complete.

### Why
- Keeping the Go/Goja construction API permissive after live-flow migration would make it too easy to reintroduce deprecated primitives.
- The Go package is the authoritative DSL boundary for backend-generated pages, so making it strict first gives the frontend cleanup a firmer target.

### What worked
- The backend package and server tests passed after rewriting tests away from deprecated primitives.
- Full Go validation passed:
  - `go test ./... -count=1`

### What didn't work
- No runtime blocker in this slice.
- The main risk was test churn: old tests intentionally exercised v1 primitives, so they had to be rewritten rather than shimmed.

### What I learned
- Most backend tests were testing “stable JSON plus callbacks” rather than v1 nodes specifically, so the same coverage maps cleanly to v2 primitives.
- Removing Goja exports is a sharper and safer cutover than keeping deprecated wrappers that panic later.

### What was tricky to build
- The change had to happen after the real flow migration; otherwise embedded flow scripts would fail at require-time or render-time.
- `ValidateNode` defaulting to schema v2 matters for direct node validation paths that do not come through a full page.

### What warrants a second pair of eyes
- Review whether `toolbar` should remain as an allowed legacy-ish node during the v2-only window. It is still used as a utility node in tests/stories and is not one of the targeted deprecated primitives.
- Review whether deprecated TypeScript fixtures should be deleted outright or rewritten into v2 examples in the next slice.

### What should be done in the future
- Remove/rewrite frontend legacy renderer branches, TS builders, and Storybook stories.
- Update any docs that still teach the removed Goja helpers.

### Code review instructions
- Start with `pkg/admindsl/types.go`, `pkg/admindsl/builder.go`, `pkg/admindsl/goja_module.go`, and `pkg/admindsl/validate.go`.
- Then review rewritten tests in `pkg/admindsl/builder_test.go`, `pkg/admindsl/goja_module_test.go`, and `pkg/admindsl/script_runtime_test.go`.
- Validate with `go test ./... -count=1`.

### Technical details
- Removed Go/Goja construction APIs:
  - `section`
  - `cardGrid`
  - `summaryCard`
  - `resourceList`
  - `resourceRow`
  - `editableList`
  - `monthAvailabilityGrid`
  - `diffView`

## Step 36: Remove frontend v1 fixtures and renderer branches

This step finished the frontend side of the Admin DSL v2 cutover. The TypeScript schema and builders now model only schema v2 pages, the renderer no longer has branches for deprecated v1 nodes, and obsolete v1 Storybook catalogs were removed instead of kept as compatibility examples.

The remaining frontend examples and scenario fixtures were rewritten around v2 workbench primitives so tests still cover builder serialization, resource tables, forms, scenarios, surfaces, and calendar behavior without relying on `section`, `cardGrid`, `summaryCard`, `resourceList`, `resourceRow`, `editableList`, `monthAvailabilityGrid`, or `diffView`.

### Prompt Context

**User prompt (verbatim):** (same as Step 35)

**Assistant interpretation:** Continue the v2-only cleanup after the Go/API cutover, recording details and committing at a natural frontend boundary.

**Inferred user intent:** The user wants the migration completed cleanly rather than leaving a split backend-v2/frontend-v1 implementation.

**Commit (code):** pending — frontend v2-only cleanup.

### What I did
- Updated `web/src/admin-dsl/schema.ts`:
  - `AdminPage.schemaVersion` is now `2` only.
  - removed deprecated node kinds from `AdminNodeKind`.
- Updated `web/src/admin-dsl/builder.ts`:
  - default page builder schema is now v2.
  - removed deprecated TS builder helpers for old visual/list/diff primitives.
  - removed `resource.list` and `resource.row`; `resource.table` is now the resource-list path.
- Updated `web/src/admin-dsl/render.tsx`:
  - removed renderer branches for deprecated v1 nodes.
  - kept the v2 workbench/table/panel/form/surface renderers.
- Rewrote `web/src/admin-dsl/examples.ts` to use `pageHeader`, `dashboardGrid`, `panel`, `resourceTable`, and `monthCalendar`.
- Rewrote `web/src/admin-dsl/scenarioFixtures.ts` to use v2 resource tables and panels.
- Removed obsolete v1 Storybook/example files:
  - `AdminDslAdvancedComponents.stories.tsx`
  - `AdminDslDataComponents.stories.tsx`
  - `AdminDslAdaptivePolicies.stories.tsx`
  - `AdminDslBehavior.stories.tsx`
  - `AdminDslResourceLifecycle.stories.tsx`
  - `AdminDslSurfaces.stories.tsx`
  - `AdminDslLayouts.stories.tsx`
  - `layoutExamples.ts`
- Updated frontend tests to expect v2 schema and `resourceTable` dispatch events.
- Removed the `layoutExamples` export from `web/src/admin-dsl/index.ts`.
- Updated HAIR-041 tasks to mark obsolete v1 stories and renderer branches removed.

### Why
- Keeping frontend v1 builders/renderer branches after the backend cutover would leave two DSL dialects alive and undermine the “simple/effective/clear” cutover preference.
- Deleting obsolete Storybook catalogs is cleaner than preserving examples that teach primitives we no longer want users or interns to copy.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - 10 files, 49 tests passed
- Full Go validation still passed:
  - `go test ./... -count=1`
- A repository search under `web/src/admin-dsl` no longer finds the deprecated node strings or builder calls.

### What didn't work
- First frontend test run failed after the rewrite:
  - expected `placement: "footer"` but v2 uses `panelFooter`
  - duplicate visible headings caused `getByText("Services & pricing")` and `getByText("June 2026")` ambiguity because both the shell title and page/panel title are rendered
  - the service example initially had row action data without an action column, so the test could not drive those row actions
- Fixes:
  - updated expected placement to `panelFooter`
  - used `getAllByText(...).length` for duplicate intentional headings
  - added an explicit `actions` column to the v2 service table example
  - updated archive expectations because `action.danger` is a danger mutation with confirmation metadata, not a raw `confirm` action type

### What I learned
- The v2 renderer makes page-level and page-header titles both visible for non-workbench shells, so tests should prefer role/query precision or tolerate intentional duplicates.
- Row action data in v2 resource tables must be paired with an `actions` or `overflowActions` column unless the table-level action path is used.

### What was tricky to build
- Removing TS builder helpers exposed hidden dependencies in old stories and examples. The fastest safe path was to delete obsolete v1 story catalogs and rewrite the shared fixtures that tests/MSW still import.
- Keeping the scenario harness intact required preserving its state machine while changing only the emitted page shape.

### What warrants a second pair of eyes
- Review whether deleting old Storybook catalogs is acceptable, or whether some deleted scenarios should be recreated as v2-only workbench stories later.
- Review whether shell/page-title duplication should remain in the renderer for v2 pages or be collapsed for admin workbench pages.

### What should be done in the future
- Re-capture Storybook v2 screenshots after this cleanup to confirm deleted catalogs did not affect the v2 workbench captures.
- Update docs/intern guides to remove references to deleted frontend story files.

### Code review instructions
- Start with `web/src/admin-dsl/schema.ts`, `builder.ts`, and `render.tsx` for the actual v2-only frontend boundary.
- Then review `examples.ts`, `scenarioFixtures.ts`, and `AdminDsl.test.tsx` to confirm the replacement fixtures still exercise meaningful behavior.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
  - `go test ./... -count=1`

### Technical details
- Frontend deprecated primitives removed:
  - `section`
  - `cardGrid`
  - `summaryCard`
  - `resourceList`
  - `resourceRow`
  - `editableList`
  - `monthAvailabilityGrid`
  - `diffView`

## Step 37: Refresh post-cutover visual and live smoke artifacts

This step re-ran the visual/smoke artifact capture after the frontend v2-only cleanup. The goal was to verify that removing the obsolete Storybook catalogs and renderer branches did not break the retained v2 workbench Storybook stories or the live customer-submit-to-admin path.

The Storybook v2 iframe capture completed for all retained workbench stories. The live Phase 8 smoke also passed and refreshed the admin dashboard/request screenshots under the ticket assets.

### Prompt Context

**User prompt (verbatim):** (same as Step 35)

**Assistant interpretation:** Continue after the frontend cleanup by validating and refreshing review artifacts before stopping.

**Inferred user intent:** The user wants the v2 cutover to remain visually reviewable and smoke-tested, not just type/test clean.

**Commit (code):** pending — post-cutover screenshot refresh.

### What I did
- Re-ran Storybook v2 screenshot capture:
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/04-capture-admin-dsl-v2-storybook.mjs`
- Re-ran live admin/customer smoke:
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs`
- Refreshed live Playwright screenshots:
  - `various/playwright/phase8-admin-dashboard.png`
  - `various/playwright/phase8-admin-requests.png`

### Why
- The v2-only frontend cleanup deleted Storybook files and renderer branches, so retained v2 stories and live routes needed a fresh artifact check.

### What worked
- Storybook capture completed for all retained Admin DSL Workbench v2 stories.
- Phase 8 smoke passed:
  - `Submitted customer flow; final page=intake-confirm`
  - `OK: customer submit -> admin review smoke passed`

### What didn't work
- N/A.

### What I learned
- The retained Storybook v2 capture script is independent of deleted legacy story catalogs and continued to run successfully.

### What was tricky to build
- N/A for this validation slice; it was intentionally an artifact refresh after code cleanup.

### What warrants a second pair of eyes
- Compare refreshed live screenshots against the target dense admin references to decide whether another aesthetic pass is warranted after the v2-only cleanup.

### What should be done in the future
- Optionally upload the final v2 screenshots/docs bundle to reMarkable if requested.

### Code review instructions
- Review the refreshed screenshots in `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/playwright/`.
- Re-run the two node scripts above if artifact freshness is in doubt.

### Technical details
- No source code changed in this step; only screenshot artifacts changed.

## Step 38: Document resource-table baseline alignment and bulk action styling

This step answered a focused frontend implementation question about the Request Triage Storybook example. The user wanted to know where the status/customer/service/action baseline alignment is controlled, where the `Assign` secondary action styling lives, and what sequence turns the Storybook data into rendered table UI.

I wrote a ticket reference in a textbook style, grounded in the current Admin DSL v2 files and functions. The guide explains the JSON story definition, the builder boundary, the renderer path, the table-cell renderer, and the bulk action bar, then gives minimal code-change recipes for baseline alignment and secondary bulk action styling.

### Prompt Context

**User prompt (verbatim):** "/tmp/pi-clipboard-11817d11-5687-447a-9052-ffe2ef725711.png In this request triage example, how would I go about aligning the text in the status / customer / service  and the actions so that the baseline matches? Also where I can modifiyy the look of the \"Assign\" secondary action.

which files and functions are involved, and what is the sequence of events? Write a textbook writing style guide (no analogies0 and store it in the ticket"

**Assistant interpretation:** Produce an educational implementation guide that explains exactly how the Request Triage table is assembled and rendered, with practical instructions for baseline alignment and `Assign` button styling.

**Inferred user intent:** The user wants a reusable reference for making precise visual changes in the Admin DSL v2 table renderer without guessing which layer owns the behavior.

**Commit (code):** pending — ticket documentation only.

### What I did
- Copied the screenshot into the ticket:
  - `various/alignment-reference/01-request-triage-baseline-question.png`
- Added a new reference document:
  - `reference/02-admin-dsl-resource-table-alignment-guide.md`
- Related the guide to the relevant frontend files using `docmgr doc relate`.
- Validated the new guide frontmatter with `docmgr validate frontmatter`.

### Why
- The alignment question crosses several layers: Storybook data, builder JSON, renderer table layout, cell rendering, and action button styling.
- A guide is more useful than a one-line answer because future table polish will likely need the same path.

### What worked
- The guide identifies the exact implementation points:
  - `requestColumns`, `requestRows`, and `requestTriagePage()` in `AdminDslWorkbench.stories.tsx`
  - `resource.table(...)` and `action.secondary(...)` in `builder.ts`
  - `renderAdminNode(...)`, `renderTableCell(...)`, and `renderActions(...)` in `render.tsx`
  - `actionIsPrimary(...)` and `actionIsDanger(...)` in `actions.ts`
- Frontmatter validation passed.

### What didn't work
- The first `docmgr validate frontmatter` invocation used a path that duplicated `ttmp/` and failed with:
  - `open .../ttmp/ttmp/... no such file or directory`
- Fix:
  - reran validation with the absolute document path.

### What I learned
- The current `Assign` button is styled by a custom bulk action button map inside the `resourceTable` renderer, not by `renderActions(...)`.
- The baseline issue is primarily controlled by the `resourceTable` body `<td>` styles and then secondarily by `renderTableCell(...)` and `renderActions(...)` line boxes.

### What was tricky to build
- The documentation had to distinguish table-level bulk actions from row-level actions. Both are Admin DSL actions, but they are rendered by different code paths and dispatch different payloads.

### What warrants a second pair of eyes
- Review whether the guide's recommended `verticalAlign: "middle"` should become the default renderer change.
- Review whether bulk actions should keep custom payload-aware rendering or be refactored through a generalized `renderActions` value-factory path.

### What should be done in the future
- If the visual adjustment is accepted, implement it in `render.tsx`, recapture the Request Triage screenshot, and update this guide with the final committed code.

### Code review instructions
- Read `reference/02-admin-dsl-resource-table-alignment-guide.md` first.
- Compare its file/function map against `web/src/admin-dsl/render.tsx` and `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`.

### Technical details
- Frontmatter validation command:
  - `docmgr validate frontmatter --doc /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/02-admin-dsl-resource-table-alignment-guide.md --suggest-fixes`

## Step 39: Write and upload the Admin DSL grammar exploration guide

This step produced an exploratory research/design document about whether Admin DSL should have a formal grammar and compiler pipeline. The document is not an implementation plan for immediate production work. It is a technical study guide for an intern or postdoc researcher who needs to understand the current Admin DSL architecture, the possible grammar layers, and the compiler/code-generation targets that could be studied safely.

The guide explains the existing Go/Goja/protobuf/frontend renderer system, then separates the research problem into a page authoring grammar and a language-definition grammar. It proposes a canonical AST model, EBNF sketches, generated artifacts, validation hooks, renderer registry scaffolding, implementation phases, risks, alternatives, and acceptance criteria.

### Prompt Context

**User prompt (verbatim):** "can we create a formal grammar for the admin dsl language, and then compile to the builder JS API and also to some of the render.ts parts and AST definitions and such?

Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable.


This is exploratory work, not something we want to build, but rather explore. Write it in a textbook writing style (No analogies, see skill) as we will be handing it off to a postdoc researcher to do some studying on their owon on how such systems could work."

**Assistant interpretation:** Create a clear, technical, textbook-style exploratory design guide for formalizing Admin DSL with grammars, ASTs, and code-generation targets, then store it in HAIR-041 and upload it to reMarkable.

**Inferred user intent:** The user wants a research-quality handoff document that helps a technically strong reader study grammar/compiler approaches without confusing the exploration with an approved implementation task.

**Commit (code):** pending — documentation and ticket metadata only.

### What I did
- Created a new design document with `docmgr doc add`:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/05-admin-dsl-formal-grammar-and-compiler-exploration-guide.md`
- Wrote a detailed guide covering:
  - current Admin DSL runtime architecture
  - backend Goja flow sequence
  - frontend Storybook/rendering sequence
  - current file/function reference map
  - page authoring grammar vs language-definition grammar
  - canonical transport AST and internal compiler AST
  - EBNF sketches
  - compiler pipeline phases
  - code-generation targets for TypeScript schema/builders, Go builders, Goja exports, validation, renderer registry/scaffolding, docs, and tests
  - risks, alternatives, implementation plan, and research questions
- Related the guide to key backend/frontend/protobuf files using `docmgr doc relate`.
- Validated the document frontmatter successfully.
- Uploaded the guide to reMarkable:
  - `HAIR 041 Admin DSL Grammar Exploration Guide.pdf`
  - destination: `/ai/2026/05/17/HAIR-041`

### Why
- The Admin DSL v2 cutover made the vocabulary stable enough to study as a formal language.
- A grammar/codegen approach could reduce drift between Go constants, builders, Goja exports, validation, TypeScript schema, frontend builders, renderer cases, and documentation.
- The research needs to distinguish low-risk generated artifacts from high-risk attempts to generate all rendering behavior.

### What worked
- `docmgr validate frontmatter` passed.
- `remarquee upload bundle ... --non-interactive` succeeded with:
  - `OK: uploaded HAIR 041 Admin DSL Grammar Exploration Guide.pdf -> /ai/2026/05/17/HAIR-041`

### What didn't work
- N/A.

### What I learned
- The most plausible first research target is a language-definition spec that generates documentation and drift tests, not a page authoring grammar that replaces current Goja flow JavaScript.
- The renderer should likely remain hand-written and explicit, with generated registry/exhaustiveness scaffolding rather than generated JSX.

### What was tricky to build
- The guide had to keep two grammar concepts separate: one grammar for concrete pages and one grammar for the Admin DSL vocabulary itself. Mixing those would make the research plan confusing.
- The document also had to preserve the trust boundary: a compiler can generate action declarations and builders, but backend callbacks must remain opaque action IDs registered through `ctx.bind`.

### What warrants a second pair of eyes
- Review whether the recommended research order is correct: inventory, spec, generated docs/drift tests, then generated builders/validators.
- Review whether the grammar examples are specific enough for a postdoc to begin prototyping without over-constraining the syntax.

### What should be done in the future
- If the research proceeds, start with a read-only inventory and generated documentation/drift-test prototype under an experiment directory.
- Do not replace production builder or renderer files until generated artifacts prove useful and reviewable.

### Code review instructions
- Read the new guide first.
- Check the related file map in the frontmatter against the actual source files.
- Confirm the document presents the work as exploratory rather than approved production scope.

### Technical details
- Upload command:
  - `remarquee upload bundle ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/05-admin-dsl-formal-grammar-and-compiler-exploration-guide.md --name "HAIR 041 Admin DSL Grammar Exploration Guide" --remote-dir "/ai/2026/05/17/HAIR-041" --toc-depth 2 --non-interactive 2>&1`

## Step 40: Write and upload the real compiler architecture research report

This step produced a second, more compiler-focused research report for Admin DSL. The prior grammar guide explored formal grammar and generation targets. This report reframes the topic around a real compiler architecture: concrete syntax, surface AST, typed AST, contextual action types, Core Admin IR, target lowering, React component props, JSON transport as one backend target, and a research prototype plan.

The report explicitly incorporates the user's correction that the intermediate representation does not need to be target-aware JSON. Instead, it proposes a target-independent Core Admin IR and treats current JSON as one lowering target. It also emphasizes stronger typing of nodes and contextual actions so that table bulk actions, row actions, panel footer actions, page header actions, calendar cell actions, and form submit actions can all lower into generic runtime actions while remaining distinct in the source and typed AST.

### Prompt Context

**User prompt (verbatim):** "forget about 5., you can chose any intermediate representation you like.

we want to apply a real compiler architecture to what we are trying to do.

Create a new research report document in the ticket. And upload to remarkable.

Create  a detailed analysis / design / research report that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Create a new research report, separate from the previous grammar guide, that explains how to apply real compiler architecture to Admin DSL and then upload it to reMarkable.

**Inferred user intent:** The user wants a clearer research handoff centered on compiler phases, type checking, IR design, contextual action typing, and target lowering rather than only grammar/code generation.

**Commit (code):** pending — documentation only.

### What I did
- Created a new design document with `docmgr doc add`:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/06-admin-dsl-compiler-architecture-research-report.md`
- Wrote a textbook-style research report covering:
  - current backend/frontend Admin DSL implementation
  - current builder and renderer paths
  - Admin DSL as a compiled language
  - compiler layers: CST, surface AST, typed AST, Core Admin IR, target IRs
  - strong node typing
  - contextual action typing
  - target lowerings to JSON, React component props, TS builder source, Go builder source, docs, and tests
  - replacement strategy for the large renderer switch using ReactPlan/widget props
  - pseudocode for parse/type-check/lower/emit phases
  - implementation plan and research questions
- Related the report to relevant backend, frontend, protobuf, runtime, builder, validation, renderer, and Storybook files.
- Validated frontmatter successfully.
- Uploaded the report to reMarkable:
  - `HAIR 041 Admin DSL Compiler Architecture Research Report.pdf`
  - destination: `/ai/2026/05/17/HAIR-041`

### Why
- The user clarified that the important direction is compiler architecture, not necessarily JSON as the central intermediate representation.
- The report needed to explain how stronger node/action typing and target-independent IR can simplify validation and rendering while preserving the existing backend security model.

### What worked
- `docmgr validate frontmatter` passed.
- reMarkable upload succeeded with:
  - `OK: uploaded HAIR 041 Admin DSL Compiler Architecture Research Report.pdf -> /ai/2026/05/17/HAIR-041`

### What didn't work
- N/A.

### What I learned
- The more precise architecture is: source grammar to typed AST, typed AST to Core Admin IR, Core Admin IR to target backends. JSON is one target, not the center of the compiler.
- Contextual action typing is the key mechanism for restricting action validity areas while preserving generic runtime `ActionRef` dispatch.

### What was tricky to build
- The report needed to be exploratory but still concrete enough for an intern to begin a prototype. I framed the first experiment as a small subset compiler for `pageHeader`, `dashboardGrid`, `panel`, and `resourceTable`, including contextual actions and a JSON lowering target.

### What warrants a second pair of eyes
- Review whether the proposed Core Admin IR is small enough and not too React-shaped.
- Review whether the first experiment should start in TypeScript or Go.
- Review whether contextual action typing should preserve extra context in JSON metadata or erase it after lowering to runtime placement strings.

### What should be done in the future
- If research proceeds, create a read-only experiment directory and start with a typed AST/Core IR subset plus JSON lowering and generated documentation.

### Code review instructions
- Read `design-doc/06-admin-dsl-compiler-architecture-research-report.md`.
- Compare its architecture against the previous `design-doc/05-admin-dsl-formal-grammar-and-compiler-exploration-guide.md`; the new document should be treated as the more current framing.
- Confirm it remains exploratory and does not imply immediate production replacement.

### Technical details
- Upload command:
  - `remarquee upload bundle ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/06-admin-dsl-compiler-architecture-research-report.md --name "HAIR 041 Admin DSL Compiler Architecture Research Report" --remote-dir "/ai/2026/05/17/HAIR-041" --toc-depth 2 --non-interactive 2>&1`

## Step 41: Reframe the research around a UI DSL meta-spec compiler

This step corrected the direction of the compiler research. The previous document framed the work as compiling Admin DSL programs. The user's clarified goal is one level higher: define a meta-language for specifying UI DSL vocabularies themselves, including shell types, node types, prop schemas, child rules, action types, action slots, action contexts, renderer contracts, and target generators.

The new guide treats Admin DSL as the first case study rather than the center of the architecture. It explains how the same meta-spec compiler could define an information-dense Admin Workbench UI DSL and also a simpler customer-facing UI DSL, while generating Go, TypeScript, protobuf, docs, tests, builders, validators, Goja exports, and renderer scaffolding from one source of truth.

### Prompt Context

**User prompt (verbatim):** "perfect, now write a new full document. 

Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Write a new, full intern-facing design and implementation guide that reflects the corrected meta-level UI DSL specification compiler framing, store it in the HAIR-041 ticket, and upload it to reMarkable.

**Inferred user intent:** The user wants a durable handoff document that explains the reusable language-workbench layer above Admin DSL, especially how node/action/shell/context specifications generate backend/frontend/transport/rendering artifacts.

**Commit (code):** pending — documentation only.

### What I did
- Created a new `design-doc` via `docmgr`:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/07-ui-dsl-meta-spec-compiler-implementation-guide.md`
- Wrote a full implementation guide covering:
  - the corrected goal: a meta-spec compiler for UI DSLs
  - the distinction between meta-spec language, generated UI DSL, and target implementation languages
  - shell types, node types, prop schemas, child rules, action types, action slots, action contexts, and renderer contracts
  - Admin Workbench and Customer Flow examples
  - backend-owned action execution hidden behind frontend-renderable action metadata
  - compiler architecture and pseudocode
  - Go, TypeScript, protobuf, renderer, docs, and test targets
  - intern implementation plan and first assignment
  - API/file references to the current Admin DSL implementation
- Related the guide to relevant current backend, frontend, protobuf, runtime, builder, validation, renderer, action, and Storybook files.
- Validated frontmatter successfully.
- Uploaded the guide to reMarkable:
  - `HAIR 041 UI DSL Meta Spec Compiler Guide.pdf`
  - destination: `/ai/2026/05/17/HAIR-041`

### Why
- The user clarified that the desired system is not only an Admin DSL compiler. It is a reusable meta-spec/compiler for creating UI DSLs where nodes, shells, actions, slots, contexts, renderers, and backend action behavior are specified once and generated across targets.

### What worked
- `docmgr doc add` created the new design document with ticket metadata.
- `docmgr doc relate` added focused related-file links.
- `docmgr validate frontmatter` passed.
- reMarkable upload succeeded with:
  - `OK: uploaded HAIR 041 UI DSL Meta Spec Compiler Guide.pdf -> /ai/2026/05/17/HAIR-041`

### What didn't work
- N/A.

### What I learned
- The correct architecture is a language-workbench layer for UI DSLs. Admin DSL is an instance generated or aligned by that layer, not the layer itself.
- The key semantic primitive is the node action slot: action legality is defined by a node slot that allows specific action types under a specific context.

### What was tricky to build
- The document needed to be concrete without prematurely designing a full textual grammar. I resolved this by recommending a structured YAML/JSON first prototype, then a later textual syntax once the semantic model is proven.
- It also needed to explain backend actions without exposing backend callbacks to the frontend. The guide describes semantic actions lowering to frontend metadata plus backend-owned opaque action IDs.

### What warrants a second pair of eyes
- Review whether the proposed first intern assignment is small enough.
- Review whether the target strategy should start with TypeScript docs/contracts or Go validators/builders.
- Review whether protobuf should stay as a stable envelope target or move toward fully typed node messages for this family of DSLs.

### What should be done in the future
- If this research proceeds, create an experiment directory and implement the structured `AdminWorkbench` meta-spec subset with docs and TypeScript generation first.

### Code review instructions
- Start with `design-doc/07-ui-dsl-meta-spec-compiler-implementation-guide.md`.
- Compare it to `design-doc/06-admin-dsl-compiler-architecture-research-report.md`; the new guide supersedes the earlier framing for the meta-level direction.
- Confirm the guide keeps production Admin DSL untouched and proposes an experiment-first path.

### Technical details
- Upload command:
  - `remarquee upload bundle ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/07-ui-dsl-meta-spec-compiler-implementation-guide.md --name "HAIR 041 UI DSL Meta Spec Compiler Guide" --remote-dir "/ai/2026/05/17/HAIR-041" --toc-depth 2 --non-interactive 2>&1`

## Step 42: Define the Admin DSL React widget IR catalog

This step turns the user's meta-DSL comments into a concrete artifact for the next rebuild phase. The document does not implement React widgets yet. It defines the intermediate representation that should exist before implementation: a catalog of explicit React widgets extracted from the current monolithic `render.tsx` branches, including atom/molecule/organism classification, props, contextual action slots, file paths, and Storybook scenarios.

The key architectural shift is that passes are artifact-driven rather than one fixed consecutive pipeline. A pass is defined by the artifacts it requires and produces. In this case, the current renderer, schema, builder, action helpers, calendar renderer, and Storybook fixtures are the inputs; the widget IR catalog is the output. Later passes can consume this output to scaffold files, generate Storybook stories, create renderer adapters, define action-slot signatures, or produce LLM implementation prompts.

### Prompt Context

**User prompt (verbatim):** "yes, the next document is us refining what the artifacts could be for that part of the system. Not that passes don't need to be consecutive per se, rather they are defined by the type of artifacts they require and the ones they produce.

Let's work on creating the following document:

- for each current admin DSL construct, extract from the big render.ts and its mass of div and css a set of clear react widgets and classify it within our component system structure of atom/molecule/organisms. This includes: props, action \"slots\" (callbacks in the props i guess), usage scenarios / examples of usage, storybook stories, file layout (one directory per widget, widget.tsx, widget.stories.tsx)"

**Assistant interpretation:** Create a single ticket document that inventories current Admin DSL renderer constructs and maps them to explicit React widget IR entries with classifications, props, action slots, scenarios, stories, and file layout.

**Inferred user intent:** The user wants a concrete artifact that can drive a bottom-up rewrite of the Admin DSL renderer from monolithic JSX/CSS branches into a component catalog and adapter-based renderer.

**Commit (code):** pending — documentation only.

### What I did
- Read the user comments in:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/meta-dsl-comments.md`
- Studied current Admin DSL frontend implementation files:
  - `web/src/admin-dsl/render.tsx`
  - `web/src/admin-dsl/calendar.tsx`
  - `web/src/admin-dsl/schema.ts`
  - `web/src/admin-dsl/builder.ts`
  - `web/src/admin-dsl/actions.ts`
  - `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`
- Created a new design document:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/08-admin-dsl-react-widget-ir-catalog.md`
- The document defines:
  - artifact-pass model for widget extraction
  - shared action callback signatures by context
  - common widget props
  - proposed widget file layout
  - widget catalog summary for all current Admin DSL constructs
  - shell, action, layout, resource, display, media, calendar, form, and surface widgets
  - unsupported/ambiguous constructs that currently fall through or are only partially implemented
  - renderer adapter plan
  - Storybook scenario matrix
  - implementation plan
- Related the document to the relevant current files.
- Validated frontmatter successfully.

### Why
- The current `render.tsx` is a large mixed renderer/interpreter/styling file. Before rebuilding implementation, the team needs an explicit target component catalog and artifact contract.
- The user wants deterministic passes and LLM-assisted passes to operate on clear artifacts rather than free-form intentions.

### What worked
- The current schema and renderer branches were small enough to inventory directly.
- The document now identifies both supported render branches and unsupported/ambiguous constructs such as `statusBadge`, `resourceDetail`, and `actionMenu`.
- `docmgr validate frontmatter` passed.

### What didn't work
- My first attempt to commit only the new document/diary/changelog used the wrong `git commit` flag ordering and failed:
  - `git commit --only -- ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/08-admin-dsl-react-widget-ir-catalog.md ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/01-diary.md ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/changelog.md -m 'HAIR-041 Step 42: Add Admin DSL widget IR catalog'`
  - `error: pathspec '-m' did not match any file(s) known to git`
  - `error: pathspec 'HAIR-041 Step 42: Add Admin DSL widget IR catalog' did not match any file(s) known to git`
- I reran the commit with `-m` before the pathspec and `--only -- ...`, which committed only the intended documentation files and left pre-existing staged/uncommitted files untouched.

### What I learned
- The immediate useful IR is not a grammar yet. It is a widget catalog that names the React target surface the grammar/compiler should eventually generate around.
- Contextual action callback signatures are the bridge between semantic action slots and the current `dispatchAdminAction` runtime.

### What was tricky to build
- Some current Admin DSL constructs are not one-to-one widgets. For example, `resourceTable` contains several internal widget candidates: table shell, cell renderer, row renderer, bulk action bar, and pagination bar. The document keeps `ResourceTable` as the public organism and lists the internal parts under that directory.
- Shells do not fit atom/molecule/organism perfectly. The document classifies them as organisms with `role: shell` to keep the classification system simple.

### What warrants a second pair of eyes
- Review the proposed widget split, especially whether `ResourceTableCell`, `BulkActionBar`, and `PaginationBar` should be public widgets or internal parts.
- Review whether `OverlaySurface` should stay one organism for modal/drawer/sheet/detail/inline variants or split earlier.
- Review whether field widgets should be separate molecule directories or a single configurable field-control family.

### What should be done in the future
- If accepted, create a scaffold-generation pass or manually scaffold the first widgets: `ActionButton`, `ActionGroup`, `Panel`, `PageHeader`, and `ResourceTable`.
- Do not replace production rendering until widget-level Storybook coverage exists for the moved constructs.

### Code review instructions
- Start with `design-doc/08-admin-dsl-react-widget-ir-catalog.md`.
- Compare the widget catalog against the current branch list in `web/src/admin-dsl/render.tsx` and `web/src/admin-dsl/calendar.tsx`.
- Confirm every current Admin DSL construct is either mapped to a widget or explicitly listed as unsupported/ambiguous.

### Technical details
- Frontmatter validation command:
  - `docmgr validate frontmatter --doc /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/08-admin-dsl-react-widget-ir-catalog.md --suggest-fixes`

## Step 43: Convert the React widget IR catalog into YAML artifacts

This step turns the markdown widget IR catalog into a script-friendly YAML artifact set. The content stays aligned with the markdown structure, but it is now split into category files that downstream scripts can load directly: shell widgets, action widgets, layout widgets, resource widgets, data-display widgets, media widgets, calendar widgets, form widgets, surface widgets, renderer adapter plan, Storybook scenario matrix, pass model, shared types, and unsupported constructs.

The main purpose is to make the next transformation passes easier to write. Instead of scraping Markdown headings and code fences, a script can load the YAML index, pick a category file, iterate over `widgets`, and generate scaffold directories, Storybook skeletons, renderer adapters, implementation prompts, or validation reports.

### Prompt Context

**User prompt (verbatim):** "output the content of the layout widgets / resource widgets / action widgets / shell widgets / ... in yaml files (basically just turning the markdown structure into a yaml file, but the content stays the same. that way we can then write scripts to transform them further."

**Assistant interpretation:** Convert the existing React widget IR markdown sections into structured YAML files by category, preserving the same content but making it machine-readable for later transformation scripts.

**Inferred user intent:** The user wants the widget catalog to become a reusable artifact input for deterministic or LLM-assisted passes rather than only prose documentation.

**Commit (code):** N/A — YAML artifact generation only.

### What I did
- Created YAML artifacts under:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/`
- Added category files:
  - `00-index.yaml`
  - `01-pass-model.yaml`
  - `02-shared-types.yaml`
  - `03-shell-widgets.yaml`
  - `04-action-widgets.yaml`
  - `05-layout-widgets.yaml`
  - `06-resource-widgets.yaml`
  - `07-data-display-widgets.yaml`
  - `08-media-widgets.yaml`
  - `09-calendar-widgets.yaml`
  - `10-form-widgets.yaml`
  - `11-surface-widgets.yaml`
  - `12-renderer-adapter-plan.yaml`
  - `13-storybook-scenario-matrix.yaml`
  - `14-unsupported-constructs.yaml`
- Validated all YAML files with Python/PyYAML.

### Why
- The markdown catalog is good for human review, but scripts need structured inputs.
- Category-specific YAML makes it possible to write focused generators: file scaffolds from widget file layouts, Storybook skeletons from story lists, adapters from action slots and props, and prompt generation from widget descriptions.

### What worked
- PyYAML was available in the environment.
- All generated YAML files parsed successfully with `yaml.safe_load`.
- Block scalar formatting preserved TypeScript prop/signature snippets and file layout snippets in readable form.

### What didn't work
- N/A.

### What I learned
- The widget IR naturally splits into stable machine-readable categories. The index file gives scripts a single discovery entry point, while the category files remain readable enough for manual review.

### What was tricky to build
- The Markdown contains TypeScript snippets and file tree snippets that should remain readable. I represented those as YAML block scalars instead of trying to over-normalize every prop into individual fields.
- Some widgets are public top-level widgets and some are internal parts. The YAML keeps both by using regular widget entries with notes/file-layout fields.

### What warrants a second pair of eyes
- Review whether scripts should consume these Markdown-like block scalars or whether we should normalize props/action slots further into fully structured schemas.
- Review whether the YAML directory belongs under `sources/` or should move to a dedicated `artifacts/` directory if more generated IR appears.

### What should be done in the future
- Write a small scaffold script that reads `00-index.yaml` plus category files and emits the initial widget directory tree and Storybook skeletons.

### Code review instructions
- Start with `sources/admin-dsl-widget-ir/00-index.yaml`.
- Spot-check `05-layout-widgets.yaml`, `06-resource-widgets.yaml`, `04-action-widgets.yaml`, and `03-shell-widgets.yaml` against the markdown source document.
- Validate with:
  - `python3 - <<'PY' ... yaml.safe_load(...) ... PY`

### Technical details
- YAML generation target directory:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/`
- YAML validation used Python `yaml.safe_load` for every `*.yaml` file in that directory.

## Step 44: Add a widget-IR scaffold generator and run it on shell/action/layout/resource widgets

This step makes the YAML widget IR actionable. The new script reads category YAML files such as `03-shell-widgets.yaml` and creates a first-pass React scaffold for each widget: one widget directory, a `.types.ts` file containing the TypeScript prop snippet from the IR, a placeholder `.tsx` component, a Storybook file with the planned story exports, and an `index.ts` barrel.

The generated code is intentionally scaffold code, not final visual implementation. It establishes deterministic file paths and compile-safe contracts so follow-up implementation passes can replace the placeholder bodies with real widgets while keeping the adapter boundary clean.

### Prompt Context

**User prompt (verbatim):** "can you write a tool that takes a widgte yaml like @hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml and creates a scaffold of the final code? You might need to modify the yaml format. Save in the scripts directory, run it on a few files. Adjust as needed"

**Assistant interpretation:** Build a script that consumes widget IR YAML files and emits final-code scaffold directories/files for the corresponding React widgets, then test it by running it on several YAML categories and adjust issues discovered during generation/TypeScript validation.

**Inferred user intent:** The user wants the widget IR to become an executable artifact source that can generate concrete code scaffolds for the Admin DSL renderer rebuild.

**Commit (code):** pending.

### What I did
- Added scaffold generator:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py`
- The script reads widget category YAML files and generates:
  - shared widget/action/context types in `web/src/admin-dsl/widgets/shared/`
  - one directory per widget
  - `<Widget>.types.ts`
  - `<Widget>.tsx`
  - `<Widget>.stories.tsx`
  - `index.ts`
- Ran a dry-run on:
  - `03-shell-widgets.yaml`
  - `04-action-widgets.yaml`
  - `06-resource-widgets.yaml`
- Ran real generation on:
  - `03-shell-widgets.yaml`
  - `04-action-widgets.yaml`
  - `06-resource-widgets.yaml`
  - `05-layout-widgets.yaml`
- Generated scaffold files under:
  - `web/src/admin-dsl/widgets/`
- Ran TypeScript validation:
  - `cd web && npx tsc --noEmit`

### Why
- The YAML widget IR is meant to feed follow-up deterministic passes. A scaffold generator is the smallest useful pass: it proves that the YAML can drive code layout and story creation.
- The generated placeholder widgets give the team concrete files to replace incrementally rather than continuing to grow `render.tsx`.

### What worked
- The tool generated 70 widget scaffold files for shell, action, layout, and resource widget categories.
- The generated code compiled with:
  - `cd web && npx tsc --noEmit`
- The script did not require changing the YAML format yet; it can infer output directories from existing `file_layout` snippets and classification metadata.

### What didn't work
- The first dry-run failed because the script guessed the repository root incorrectly from the ticket script path:
  - `missing input: /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml`
- Fix: changed `REPO_ROOT_DEFAULT` from `Path(__file__).resolve().parents[5]` to `parents[6]`.
- The first generated `ResourceTableCell` import stripped `.types` from `ResourceTable.types.ts`, producing `../../ResourceTable` instead of `../../ResourceTable.types`.
- Fix: changed the import helper to strip only code extensions such as `.ts` and `.tsx`, not semantic suffixes like `.types`.
- The first generated component template referenced `React.CSSProperties` without importing the React namespace.
- Fix: generated components now include `import type * as React from "react";`.

### What I learned
- The current YAML structure is good enough for initial scaffolding. A later pass may still normalize `props` into structured schemas, but block-scalar TypeScript prop snippets are sufficient for code skeletons.
- One-directory-per-widget works for public widgets and internal ResourceTable parts when the generator normalizes internal parts under `ResourceTable/parts/<Widget>/`.

### What was tricky to build
- The Markdown-derived `file_layout` fields are semi-structured. The script handles clear `web/src/admin-dsl/widgets/.../` blocks first, then special-cases `ResourceTable/parts`, then falls back to classification-based paths.
- TypeScript prop snippets reference shared symbols such as `ActionViewModel`, `CommonWidgetProps`, and contextual handler types. The script generates shared types up front and imports them into every widget `.types.ts` file.

### What warrants a second pair of eyes
- Review whether `ResourceTable` internal parts should remain nested under `ResourceTable/parts/<Widget>/` or move to public molecule directories.
- Review whether generated stories should be minimal placeholders or richer scenario scaffolds derived from `storybook_stories` and sample fixtures.
- Review whether the next version should add explicit `scaffold.output_dir` fields to YAML instead of inferring paths from `file_layout` text.

### What should be done in the future
- Extend the script to scaffold the remaining category files once the initial generated layout is approved.
- Add a follow-up pass that generates renderer adapter stubs from the same YAML artifacts.

### Code review instructions
- Start with the generator script:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py`
- Review generated examples:
  - `web/src/admin-dsl/widgets/organisms/WorkbenchShell/WorkbenchShell.types.ts`
  - `web/src/admin-dsl/widgets/atoms/ActionButton/ActionButton.tsx`
  - `web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.stories.tsx`
- Validate with:
  - `cd web && npx tsc --noEmit`

### Technical details
- Dry-run command:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py --dry-run ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/04-action-widgets.yaml ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/06-resource-widgets.yaml`
- Generation commands:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/04-action-widgets.yaml ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/06-resource-widgets.yaml`
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/05-layout-widgets.yaml`

## Step 45: Enrich widget IR scaffolds with human intent, XXX markers, and provenance headers

This step improves the scaffold generator and the YAML artifacts so the generated files carry both formal structure and human-readable design intent. The previous scaffold pass proved that YAML could create directories, props, placeholder components, and stories. This refinement makes those generated files useful as handoff artifacts: they now include purpose, classification, action-slot intent, human notes, explicit `XXX` implementation warnings, generation time, source YAML path, and git provenance.

The YAML is intentionally not reduced to only machine fields. Natural language is now part of the IR because later humans and LLM passes need to understand why a slot exists, where adapter boundaries should be, and what kind of Storybook coverage the widget is supposed to prove.

### Prompt Context

**User prompt (verbatim):** "also render freeform information like the purpose, the classification, etc... into the resulting scaffold, and add // XXX where something definitely needs to be changed. Also update the YAML to be richer in human written fields giving the intent behind the different slots / etc... Natural language is just as important here as the formal structure."

**User prompt (verbatim):** "also add a header that says this is was generated by the script from which file at what time, and what the last commit on the file was.

that way we can have the start of a changelog of how files got modified."

**Assistant interpretation:** Update the scaffold generator and YAML artifacts so generated files contain visible design intent, explicit implementation warnings, and provenance headers that can serve as the beginning of a generated-file changelog.

**Inferred user intent:** The user wants generated scaffolds to be useful for humans and future LLM passes, not merely compile-safe shells. The files should explain why they exist and where they came from.

**Commit (code):** pending.

### What I did
- Updated `scripts/05-scaffold-admin-dsl-widgets.py` to generate provenance headers in `.tsx`, `.types.ts`, `.stories.tsx`, `index.ts`, and shared scaffold files.
- Headers now include:
  - generator script path
  - generation timestamp
  - source YAML path
  - source YAML last git commit
  - target file previous git commit
- Updated generated component scaffolds to render widget IR metadata visibly in the placeholder UI:
  - classification
  - purpose
  - human notes
  - action slots
  - implementation warnings
- Added `XXX` markers to generated types, stories, component placeholders, and shared scaffold headers.
- Enriched these YAML files with `human_notes`, slot intent, callback prop hints, implementation notes, and `xxx` warnings:
  - `03-shell-widgets.yaml`
  - `04-action-widgets.yaml`
  - `05-layout-widgets.yaml`
  - `06-resource-widgets.yaml`
- Re-ran the scaffold generator with `--force` for shell/action/layout/resource widgets.
- Re-validated generated TypeScript:
  - `cd web && npx tsc --noEmit`

### Why
- The generated scaffold is meant to guide implementation, not hide context. Purpose, slot intent, adapter boundaries, and warnings are part of the artifact.
- Provenance headers make regenerated files auditable and begin a lightweight changelog for scaffold evolution.

### What worked
- The enriched generated files still compile with `npx tsc --noEmit`.
- Source YAML last-commit lookup works for committed YAML artifacts; generated headers show the last commit for the source YAML file.
- Target file previous-commit lookup currently reports `none (untracked or no history)` for newly generated files, which is expected before the first commit of the scaffold files.

### What didn't work
- My first attempt to rewrite `render_component(...)` with nested triple-quoted Python strings failed locally with:
  - `SyntaxError: invalid character '—' (U+2014)`
- Cause: the outer Python string closed earlier than intended because the replacement text embedded another `'''` block.
- Fix: rewrote the replacement using triple-double-quoted Python text so the generated inner triple-single-quoted f-string remained intact.

### What I learned
- The YAML artifact needs two layers: machine-consumable fields and human-readable intent fields. Both are useful downstream.
- Provenance headers should include both source-file history and target-file previous history, because future regeneration can then show whether a file has been manually changed since its last generated state.

### What was tricky to build
- Rendering JSON-like classification and notes inside TSX required care. Inserting raw `{ "level": "organism" }` text into JSX would be parsed as an invalid JSX expression. The generator now emits string constants and renders those constants.
- Header generation calls `git log` for both source YAML and target file. For new files, the target correctly has no previous history.

### What warrants a second pair of eyes
- Confirm whether provenance headers should remain in every generated file or move to a separate generated manifest later.
- Review the YAML natural-language fields for tone and usefulness before generating more categories.
- Decide whether future YAML should add explicit `output_dir` fields instead of inferring from `file_layout`.

### What should be done in the future
- Add a generated manifest that records all scaffold files, source YAML files, generation timestamp, and source/target commits in one place.
- Normalize human notes into a consistent shape across the remaining widget categories before scaffolding them.

### Code review instructions
- Review the generator:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py`
- Review enriched YAML examples:
  - `sources/admin-dsl-widget-ir/06-resource-widgets.yaml`
  - `sources/admin-dsl-widget-ir/05-layout-widgets.yaml`
- Review generated output example:
  - `web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.tsx`
- Validate with:
  - `cd web && npx tsc --noEmit`

### Technical details
- Regeneration command:
  - `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py --force ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/04-action-widgets.yaml ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/05-layout-widgets.yaml ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/06-resource-widgets.yaml`

## Step 46: Define widget definition IR YAML schema v2 and migrate shell widgets

This step refines the widget IR YAML from a Markdown-shaped conversion into a cleaner schema. The new shape separates source mapping, human intent, formal-ish contracts, examples, Storybook scenarios, outputs, and implementation todos. `03-shell-widgets.yaml` now acts as the reference `schema_version: 2` example.

The key design decision is to keep prose first-class while making the machine contract more regular. Props are now structured under `contract.props`, action slots are structured under `contract.action_slots`, stories are maps with their own docs/assertions/fixtures, and output paths are explicit rather than inferred from file-layout text.

### Prompt Context

**User prompt (verbatim):** "yes, good. update the yaml, and then write a detailed spec for the YAML format for the widget definition IR."

**Assistant interpretation:** Apply the proposed cleaner YAML schema to the shell widget YAML file and write a detailed specification document for the widget definition IR format.

**Inferred user intent:** The user wants a stable artifact format that can be consumed by scripts and LLM passes while preserving rich human design intent.

**Commit (code):** pending — documentation/YAML only.

### What I did
- Rewrote `sources/admin-dsl-widget-ir/03-shell-widgets.yaml` to `schema_version: 2`.
- The shell YAML now uses:
  - `id`
  - `status`
  - `classification`
  - `source_mapping`
  - `intent`
  - `contract.props`
  - `contract.action_slots`
  - `examples`
  - `stories`
  - `outputs`
  - `implementation_todos`
- Added a new design document:
  - `design-doc/09-widget-definition-ir-yaml-format-spec.md`
- The spec describes:
  - top-level document schema
  - widget object schema
  - classification
  - source mapping
  - intent
  - structured prop contracts
  - structured action slots
  - examples
  - Storybook story objects
  - explicit outputs
  - implementation todos
  - design decisions and migration plan
- Validated the updated YAML with PyYAML.
- Validated the new doc frontmatter with `docmgr validate frontmatter`.
- Related the spec to the shell YAML, widget catalog, scaffold generator, and current Admin DSL renderer/schema files.

### Why
- The previous YAML shape was useful but too close to the Markdown document structure. Scripts would have to infer too much from `file_layout` and parallel lists/maps.
- The new schema is clearer for code generation while preserving natural-language intent for humans and LLM-assisted implementation.

### What worked
- `03-shell-widgets.yaml` now parses successfully as schema v2.
- The new spec frontmatter validates successfully.
- The shell YAML provides concrete examples for props, action slots, examples, stories, outputs, and todos.

### What didn't work
- N/A.

### What I learned
- The widget definition IR should treat TypeScript as an output target, not the source of truth. Structured prop fields can generate TypeScript later.
- Storybook stories should be maps keyed by story name so docstrings, viewports, fixtures, interactions, and assertions cannot drift from the story list.

### What was tricky to build
- The schema needs to be formal enough for generators but not so formal that it loses design rationale. I kept sections such as `intent`, `examples.*.doc`, and `stories.*.doc` required/recommended rather than treating them as comments.

### What warrants a second pair of eyes
- Review whether `contract.props.*.fields.*.type` should use TypeScript syntax, a target-neutral type grammar, or both.
- Review whether every story should require assertions.
- Review whether generated provenance should live in every file, in a manifest, or both.

### What should be done in the future
- Update `scripts/05-scaffold-admin-dsl-widgets.py` to support schema v2 directly and optionally keep schema v1 compatibility during migration.
- Convert action, layout, resource, data-display, media, calendar, form, and surface YAML files to schema v2.

### Code review instructions
- Start with `design-doc/09-widget-definition-ir-yaml-format-spec.md`.
- Then review `sources/admin-dsl-widget-ir/03-shell-widgets.yaml` as the concrete reference implementation.
- Validate with:
  - `python3 - <<'PY' ... yaml.safe_load(...) ... PY`
  - `docmgr validate frontmatter --doc .../design-doc/09-widget-definition-ir-yaml-format-spec.md --suggest-fixes`

### Technical details
- The scaffold generator has not yet been updated to consume schema v2 directly. The current task only updates the YAML reference example and spec.

## Step 47: Migrate all widget IR YAML artifacts to schema v2

This step applies the cleaner widget definition IR shape beyond the shell widgets. All YAML files in `sources/admin-dsl-widget-ir/` now carry `schema_version: 2` and a schema document reference. Widget category files use `artifact_type: admin_dsl_widget_definition_ir`; support files use index/support artifact types so tooling can distinguish files that contain widget definitions from files that contain pass plans or matrices.

The migration keeps the prior content but normalizes widget entries into the schema v2 sections: `source_mapping`, `intent`, `contract`, `examples`, `stories`, `outputs`, and `implementation_todos`. Some migrated fields intentionally contain TODO docstrings where the previous v1 YAML did not have enough human-written detail yet.

### Prompt Context

**User prompt (verbatim):** "Now update alkl yaml files to match this format."

**Assistant interpretation:** Convert the remaining widget IR YAML files to the schema v2 format and make sure all YAML files in the widget IR directory are consistently marked as schema v2.

**Inferred user intent:** The user wants the YAML artifact set to be consistently scriptable under the new schema, not only the shell-widget example.

**Commit (code):** pending — YAML/docs only.

### What I did
- Migrated these widget definition files to `schema_version: 2` and `artifact_type: admin_dsl_widget_definition_ir`:
  - `04-action-widgets.yaml`
  - `05-layout-widgets.yaml`
  - `06-resource-widgets.yaml`
  - `07-data-display-widgets.yaml`
  - `08-media-widgets.yaml`
  - `09-calendar-widgets.yaml`
  - `10-form-widgets.yaml`
  - `11-surface-widgets.yaml`
- Confirmed `03-shell-widgets.yaml` remains the richer hand-authored schema v2 reference.
- Updated support files to `schema_version: 2` with support artifact types:
  - `00-index.yaml` uses `artifact_type: admin_dsl_widget_ir_index`
  - `01-pass-model.yaml`, `02-shared-types.yaml`, `12-renderer-adapter-plan.yaml`, `13-storybook-scenario-matrix.yaml`, and `14-unsupported-constructs.yaml` use `artifact_type: admin_dsl_widget_support_ir`
- Updated `00-index.yaml` to record artifact type and schema version for each listed file.
- Updated `design-doc/09-widget-definition-ir-yaml-format-spec.md` to document support artifact files in the same directory.
- Validated every YAML file in `sources/admin-dsl-widget-ir/` with PyYAML and asserted all have `schema_version: 2`.

### Why
- Scripts need a consistent marker and schema reference across the artifact directory.
- Widget definition files should be distinguishable from support artifacts so generators do not try to read `contract` fields from pass-model or index files.

### What worked
- All YAML files parse successfully.
- All widget definition files now contain schema v2 widget objects with `contract`, `outputs`, and `stories` sections.
- The richer shell YAML remains the canonical hand-authored example, while the other migrated files provide a complete first-pass schema v2 conversion.

### What didn't work
- N/A.

### What I learned
- The directory needs both widget definition files and support artifacts. Treating every file as a widget definition would make index/pass-model/support data awkward, so `artifact_type` is the correct discriminator.

### What was tricky to build
- Some v1 YAML entries, especially aggregate field-widget entries, were not one direct widget contract. The migration keeps direct widget entries and leaves aggregate planning to future refinement.
- Many v1 prop contracts were TypeScript snippets. The migration performs a basic interface/field extraction and marks generated docstrings as TODO where human intent still needs to be filled in.

### What warrants a second pair of eyes
- Review migrated non-shell YAML files for generated TODO docstrings and replace them with precise human-written intent over time.
- Decide whether aggregate field widgets should become separate explicit widget entries in schema v2.

### What should be done in the future
- Update `scripts/05-scaffold-admin-dsl-widgets.py` to consume schema v2 directly.
- Add a validator script for required schema v2 fields, story objects, outputs, and todos.

### Code review instructions
- Start with `00-index.yaml` to see artifact types.
- Use `03-shell-widgets.yaml` as the hand-authored reference.
- Spot-check migrated files such as `04-action-widgets.yaml`, `06-resource-widgets.yaml`, and `10-form-widgets.yaml` for TODO docstrings that need human refinement.

### Technical details
- Validation asserted every YAML file in `sources/admin-dsl-widget-ir/` has `schema_version: 2`.
- Widget definition files were additionally checked for `artifact_type: admin_dsl_widget_definition_ir` and `widgets[*].contract`, `widgets[*].outputs`, and `widgets[*].stories`.
