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
