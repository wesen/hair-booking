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
