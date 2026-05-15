# Diary

## Goal

This diary records the implementation of HAIR-040: a real Goja-backed Admin DSL website route that replaces the Admin DSL Go spike with a backend-authored flow source, protobuf HTTP transport, and a React route.

## Step 1: Create the HAIR-040 ticket and implementation plan

I created a new ticket for the real Admin DSL website work and wrote the implementation guide before changing runtime code. The guide defines the target architecture: a Goja-authored services admin flow using `require("fringe/admin-dsl")`, Go-host fluent builders, Admin DSL protobuf HTTP transport, and a React route mounted at `/admin/services`.

The plan intentionally keeps the Admin runtime separate from the intake runtime because Admin pages have first-class surfaces, semantic actions, lifecycle state, and a dedicated protobuf contract. It also follows the clean-cutover decision from HAIR-039: no legacy surface helper wrappers should be reintroduced.

### Prompt Context

**User prompt (verbatim):** "alright, create a new ticket for this real website, and add a detailed design + implementation guide, then add tasks split in phases, and work on them one by one, committing at appropriat eintervals, and keeping a detailed diary"

**Assistant interpretation:** Create a new docmgr ticket for the real Goja-backed Admin DSL website, write a design/implementation guide and phased tasks, then start implementation incrementally with diary and commits.

**Inferred user intent:** The user wants the real website integration treated as a new ticket with a durable plan and disciplined implementation history.

**Commit (code):** Pending in this step.

### What I did
- Created ticket `HAIR-040 — Real Goja-backed Admin DSL website`.
- Added design guide:
  - `design-doc/01-real-goja-backed-admin-dsl-website-implementation-guide.md`
- Rewrote `tasks.md` with phases 0 through 6.
- Initialized this diary.

### Why
- The real Admin DSL website is a larger follow-up to HAIR-039 and deserves its own ticket, phases, and validation loop.

### What worked
- `docmgr ticket create-ticket` and `docmgr doc add` created the workspace and initial docs.

### What didn't work
- N/A.

### What I learned
- The natural ticket boundary is the cut from Admin DSL infrastructure to a real route/runtime-backed website.

### What was tricky to build
- The implementation plan had to keep the transport, runtime, flow source, and frontend route separate so each phase remains reviewable.

### What warrants a second pair of eyes
- Review the chosen route `/admin/services` before frontend routing is finalized.
- Review whether `pkg/admindsl` is the right home for the Admin Goja runtime or whether a subpackage should be used.

### What should be done in the future
- Start Phase 1 by implementing the Admin Goja runtime skeleton.

### Code review instructions
- Review the design guide and tasks before runtime code changes.

### Technical details
- Ticket path:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website`

## Step 2: Add the Admin Goja runtime skeleton

I implemented the first real Admin DSL runtime layer. The new runtime is separate from the intake `pkg/dslgoja` runtime, but it borrows the same proven lifecycle ideas: load a Goja source file, call `initialState`, call `render(ctx)`, register opaque backend actions during render, commit a page version, reject stale dispatches, and validate every rendered Admin page before returning it.

The Admin runtime exposes `require("fringe/admin-dsl")` through the Go host builder module created in HAIR-039. JavaScript flow code can stay fluent, but it uses Go-owned builder objects and validation. For callbacks, the runtime provides `ctx.bind(actionBuilder, callback, event?)`, which attaches an opaque `admin_act_*` id and event name to an action builder while registering the Goja callback on the backend.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Continue implementing HAIR-040 phase by phase after ticket setup.

**Inferred user intent:** The user wants the real Admin DSL runtime built incrementally with reviewable commits.

**Commit (code):** Pending in this step.

### What I did
- Added `pkg/admindsl/script_runtime.go` with:
  - `ScriptRuntime`,
  - `ScriptSession`,
  - Goja source loading,
  - native module installation for `require("fringe/admin-dsl")`,
  - `initialState` support,
  - render lifecycle,
  - page validation,
  - page-version commits,
  - stale page rejection,
  - opaque action registration through `ctx.bind(...)`,
  - dispatch lifecycle.
- Added `pkg/admindsl/script_runtime_test.go` covering:
  - initial render,
  - dispatch to open a drawer,
  - stale page-version rejection,
  - invalid rendered page rejection.
- Marked Phase 1 complete in `tasks.md`.

### Why
- HAIR-040 needs a real Goja-backed Admin runtime before a `.flow.js` file can replace the Go-only services flow spike.
- Keeping the runtime in `pkg/admindsl` preserves Admin-specific page/protobuf semantics.

### What worked
- Focused tests passed:
  - `go test ./pkg/admindsl -run 'TestScriptRuntime|TestGoja' -count=1`

### What didn't work
- N/A.

### What I learned
- Binding callbacks to Go-host action builders is cleaner than returning plain action objects from `ctx.action(...)`, because the action builder keeps all semantic action metadata before the runtime injects the opaque id/event.

### What was tricky to build
- The runtime must preserve Go-host builder authority while still feeling natural in JavaScript. `ctx.bind(actionBuilder, callback, event?)` is the key bridge: JavaScript authors compose actions fluently, and the runtime turns them into trusted backend callback references.

### What warrants a second pair of eyes
- Review the `ctx.bind(...)` naming and signature before writing many flow sources.
- Review whether callback errors should remain toast-style results or become typed Admin DSL error effects.

### What should be done in the future
- Phase 2 should add the real `pkg/admindsl/flows/services.flow.js` source and embed it.

### Code review instructions
- Start with `pkg/admindsl/script_runtime.go`.
- Then review `pkg/admindsl/script_runtime_test.go`.
- Validate with:
  - `go test ./pkg/admindsl -run 'TestScriptRuntime|TestGoja' -count=1`

### Technical details
- Files added:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/script_runtime.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/script_runtime_test.go`

## Step 3: Add the real services Admin DSL flow source

I added the first real Admin DSL `.flow.js` source file and embedded it into the Go binary. The flow is the Admin DSL counterpart to the intake flow: JavaScript owns the page/state authoring logic, while the fluent API it calls is backed by Go host builders and Go validation.

The flow renders a services/pricing admin page, opens an editor drawer, supports save/cancel, and has an explicit validation path. It uses `admin.surface.drawer(...)` for surface authoring, preserving the clean `surface.*` cut-over from HAIR-039.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Continue implementing the real Goja-backed Admin DSL website phases.

**Inferred user intent:** The user wants the Admin page to become a real backend-authored flow source rather than a Go-only spike.

**Commit (code):** Pending in this step.

### What I did
- Updated `pkg/admindsl/goja_module.go` to expose a nested `surface` namespace to Goja scripts.
- Added `pkg/admindsl/flows/services.flow.js`.
- Added `pkg/admindsl/flows.go` with `ServicesFlowSource` embedded from the JS file.
- Added `pkg/admindsl/flows_test.go` proving the embedded flow renders, opens a drawer, and returns validation errors after dispatch.
- Marked Phase 2 complete in `tasks.md`.

### Why
- HAIR-040 requires a real flow file comparable to `pkg/dslgoja/flows/intake.flow.js`.
- Embedding the JS source gives server code a stable in-binary flow source while preserving the authoring model.

### What worked
- Focused validation passed:
  - `go test ./pkg/admindsl -run 'TestServicesFlowSource|TestGojaModule' -count=1`

### What didn't work
- N/A.

### What I learned
- The Goja module can expose both flat builder functions and a semantic `surface` namespace without moving schema ownership out of Go.

### What was tricky to build
- The JS flow needed to be fluent but still compatible with Go method names as exposed by Goja. The current flow uses Go method names such as `.Shell`, `.Content`, `.Actions`, `.Submit`, and `.Cancel`.

### What warrants a second pair of eyes
- Review whether we want lower-camel JS aliases later, or whether Go method names are acceptable for host-backed builders.

### What should be done in the future
- Phase 3 should replace the server's hardcoded Go spike session store with `ScriptRuntime` and `ServicesFlowSource`.

### Code review instructions
- Start with `pkg/admindsl/flows/services.flow.js`.
- Then review `pkg/admindsl/flows.go`, `goja_module.go`, and `flows_test.go`.
- Validate with:
  - `go test ./pkg/admindsl -run 'TestServicesFlowSource|TestGojaModule' -count=1`

### Technical details
- Files added:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows/services.flow.js`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flows_test.go`

## Step 4: Cut Admin DSL HTTP over to the Goja runtime

I replaced the Admin DSL HTTP handler's hardcoded Go spike session store with the new Goja-backed `ScriptRuntime`. The existing Admin DSL protobuf endpoints remain the same, but starting `fringe.admin.services.v1` now loads and executes the embedded `pkg/admindsl/flows/services.flow.js` source.

This is the first point where the real flow source is served through the HTTP/protobuf transport. The frontend client can keep using the same Admin DSL endpoints while the backend implementation changes from Go spike to Goja-authored page logic.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Continue implementing the real Admin DSL website, moving from runtime and flow source into HTTP integration.

**Inferred user intent:** The user wants the new `.flow.js` source to become the actual server-backed Admin DSL flow.

**Commit (code):** Pending in this step.

### What I did
- Updated `pkg/server/handlers_admin_dsl.go` so `adminDSLFlowStore` owns an `admindsl.ScriptRuntime` and `*admindsl.ScriptSession` values.
- Changed Admin DSL start to call:
  - `StartFlow(r.Context(), flowID, admindsl.ServicesFlowSource)`.
- Changed GET to use `ScriptSession.Snapshot()`.
- Changed dispatch to pass request context into `ScriptSession.Dispatch(...)`.
- Updated the existing Admin DSL HTTP test to look for the real flow target `service.open`.
- Marked the main Phase 3 cut-over tasks complete, leaving additional stale/unknown-flow HTTP tests as follow-up in the same phase.

### Why
- The HTTP transport should now serve the real Goja-backed Admin flow instead of the temporary Go-only `ServicesFlowSession` spike.

### What worked
- Focused server validation passed:
  - `go test ./pkg/server -run TestAdminDSLHTTPStartGetDispatch -count=1`

### What didn't work
- The first server test run failed because the old test looked for target `service.select`, while the real JS flow uses target `service.open`. I updated the test to match the real flow source.

### What I learned
- Keeping the endpoint contract stable made the cut-over small: the handler store/session implementation changed, but the protobuf HTTP shape did not.

### What was tricky to build
- The test helper searches dynamic `Struct` action payloads. Because action refs are still embedded under `props.actions`, tests need to inspect protobuf `Struct.AsMap()` rather than typed action fields.

### What warrants a second pair of eyes
- Review whether we should delete the old Go-only `ServicesFlowSession` spike now or keep it briefly as a lower-level test fixture. The user's clean-cutover preference suggests deleting it once remaining HTTP/runtime tests are in place.

### What should be done in the future
- Add HTTP stale-action and unknown-flow tests.
- Remove `ServicesFlowSession` if no tests still need it.

### Code review instructions
- Review `pkg/server/handlers_admin_dsl.go` and `pkg/server/handlers_admin_dsl_test.go`.
- Validate with:
  - `go test ./pkg/server -run TestAdminDSLHTTPStartGetDispatch -count=1`

### Technical details
- Files changed:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl_test.go`

## Step 5: Remove the Go spike and complete HTTP cut-over tests

I completed the HTTP integration cut-over by removing the old Go-only `ServicesFlowSession` spike and moving shared flow transport types into the common Admin DSL type file. The server and proto conversion tests now exercise the real Goja-backed flow source instead of the temporary Go spike.

I also added HTTP coverage for unknown flow ids and stale action dispatch. This closes Phase 3: the public Admin DSL protobuf endpoints now start, get, and dispatch against the embedded JavaScript flow source.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Continue the phased implementation and apply the clean cut-over principle by removing obsolete spike code.

**Inferred user intent:** The user wants the real flow to replace temporary infrastructure rather than coexist as a compatibility path.

**Commit (code):** Pending in this step.

### What I did
- Removed the old Go-only spike files:
  - `pkg/admindsl/flow.go`
  - `pkg/admindsl/flow_test.go`
- Moved shared `FlowEvent`, `FlowResult`, and `FlowEffect` types into `pkg/admindsl/types.go`.
- Added `pkg/admindsl/test_helpers_test.go` to preserve action-id test helpers after deleting the spike test file.
- Updated `pkg/admindsl/proto_convert_test.go` to use `ScriptRuntime` and `ServicesFlowSource`.
- Updated `pkg/admindsl/script_runtime_test.go` to use `admin.surface.drawer(...)` in the test flow.
- Added HTTP tests for:
  - unknown Admin DSL flow id,
  - stale action dispatch effect.
- Marked Phase 3 complete in `tasks.md`.

### Why
- Keeping `ServicesFlowSession` would violate the clean cut-over preference and leave two competing backend flow implementations.
- The real `.flow.js` path should be the only services Admin DSL backend path.

### What worked
- Focused validation passed:
  - `go test ./pkg/admindsl ./pkg/server -count=1`

### What didn't work
- After deleting `flow.go`, shared flow types were missing. I moved them to `types.go`.
- After deleting `flow_test.go`, several tests lost `firstActionID`. I extracted it into `test_helpers_test.go`.
- Go's `JSONValue` alias made `[]any` and `[]JSONValue` duplicate type-switch cases, so I removed the duplicate test helper case.

### What I learned
- The cleanup made it clear which code is product path and which code was temporary spike scaffolding.

### What was tricky to build
- Removing the spike required touching tests that were originally written around it, especially proto conversion tests. The updated tests now protect the real runtime path instead.

### What warrants a second pair of eyes
- Review whether `FlowEvent`, `FlowResult`, and `FlowEffect` belong in `types.go` long term or should move into a dedicated transport/runtime file.

### What should be done in the future
- Phase 4 should add the frontend route bridge and mount `/admin/services`.

### Code review instructions
- Review the deleted spike files and the updated tests.
- Validate with:
  - `go test ./pkg/admindsl ./pkg/server -count=1`

### Technical details
- Files removed:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flow.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/flow_test.go`
- Files changed/added:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/types.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/test_helpers_test.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/admindsl/proto_convert_test.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_admin_dsl_test.go`
