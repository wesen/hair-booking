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
