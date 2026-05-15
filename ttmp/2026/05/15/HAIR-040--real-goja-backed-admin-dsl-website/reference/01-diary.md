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

## Step 6: Add the real `/admin/services` frontend bridge

I added the frontend bridge that turns the Admin DSL protobuf HTTP flow into an actual website route. The new component starts or resumes the backend Admin DSL services flow, renders the returned Admin page with `AdminPageRenderer`, and dispatches renderer events back to the backend using the opaque action id and event name embedded by the Goja runtime.

The route mount is intentionally simple for now: `App` checks `window.location.pathname === "/admin/services"` and renders the Admin DSL page. The existing server SPA fallback already serves this path in dev/prod, so no special HTML route is required.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Continue implementing the real Admin DSL website through the frontend route phase.

**Inferred user intent:** The user wants a real browser route that serves the backend-authored Admin DSL page.

**Commit (code):** Pending in this step.

### What I did
- Added `web/src/admin-dsl/BackendAdminDslPage.tsx`.
- Added `adminInteractionEventFromRenderEvent(...)` to convert renderer dispatch events into `AdminDslInteractionEvent` values.
- Wired backend calls through:
  - `startAdminDslFlow`,
  - `getAdminDslFlow`,
  - `postAdminDslEvent`.
- Added loading, error, pending, and effect display.
- Added sessionStorage persistence for the active Admin DSL session id.
- Mounted `/admin/services` in `web/src/App.tsx`.
- Added `web/src/admin-dsl/BackendAdminDslPage.test.ts` for event conversion and missing action id rejection.
- Marked Phase 4 complete in `tasks.md`.

### Why
- The real Admin DSL flow needs a real frontend route, not only Storybook and HTTP tests.
- The renderer must reject frontend-only actions for backend flow dispatch because backend trust depends on opaque action ids.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - `10 passed`, `41 passed`

### What didn't work
- N/A.

### What I learned
- The Admin DSL route can be a thin bridge because the renderer and protobuf client already exist.

### What was tricky to build
- The critical correctness point is event conversion. The browser must post `action.id` rather than trusting semantic `action.target`; the test now enforces that missing opaque ids throw.

### What warrants a second pair of eyes
- Review whether sessionStorage resume is desired for admin pages or whether admin routes should always start fresh.
- Review whether `App` should move from pathname branching to a proper router before more real pages are added.

### What should be done in the future
- Add live-backend Storybook smoke support or dev notes.
- Run a manual browser smoke against `/admin/services` with the Go server.

### Code review instructions
- Review `web/src/admin-dsl/BackendAdminDslPage.tsx` and `web/src/App.tsx`.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- Files added:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/BackendAdminDslPage.tsx`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/BackendAdminDslPage.test.ts`
- Files changed:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/App.tsx`

## Step 7: Add live-backend Storybook smoke support

I added a dev-only Storybook story for the real backend Admin DSL page. This story renders `BackendAdminDslPage` directly, so it requires the Go server and `/api/admin-dsl` protobuf endpoints to be available. It is intentionally documented as a live smoke surface, not a deterministic screenshot source.

The static and MSW stories remain the correct screenshot candidates. The live story is for integration confidence: it proves the Storybook environment can exercise the same component used by `/admin/services` when a backend is running.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Continue implementation into Storybook/live smoke support.

**Inferred user intent:** The user wants a complete real website workflow with review surfaces, while preserving deterministic screenshot discipline.

**Commit (code):** Pending in this step.

### What I did
- Added `web/src/admin-dsl/BackendAdminDslPage.stories.tsx`.
- Storybook section:
  - `Admin DSL/Services/Live Backend`
- Story:
  - `ServicesAdminFlow`
- Marked Phase 5 complete in `tasks.md`.

### Why
- A real Admin DSL website route benefits from a dev-only live Storybook smoke story, separate from static/MSW screenshot stories.

### What worked
- The story is type-safe and uses the same `BackendAdminDslPage` component as `/admin/services`.

### What didn't work
- N/A.

### What I learned
- Live backend stories should be documented as smoke surfaces because they depend on server availability and mutable session state.

### What was tricky to build
- The key was avoiding accidental promotion of the live story into deterministic screenshot workflows.

### What warrants a second pair of eyes
- Review if the live story should be hidden behind a Storybook tag or environment note later.

### What should be done in the future
- Optionally run a manual Storybook smoke with the Go backend running.

### Code review instructions
- Review `web/src/admin-dsl/BackendAdminDslPage.stories.tsx`.

### Technical details
- File added:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/admin-dsl/BackendAdminDslPage.stories.tsx`

## Step 8: Run final validation and close the HAIR-040 implementation loop

I ran the full repository validation suite after the Admin DSL runtime, flow source, HTTP cut-over, frontend route, and live Storybook story were in place. All Go and frontend checks passed, so I marked the final validation/documentation phase complete.

This leaves HAIR-040 with a real `/admin/services` website route backed by a Goja-authored Admin DSL flow source and served through the dedicated Admin DSL protobuf HTTP transport.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Complete the phased implementation with final validation and documentation updates.

**Inferred user intent:** The user wants a validated, committed implementation rather than only a design sketch.

**Commit (code):** Pending in this step.

### What I did
- Ran full Go tests:
  - `go test ./... -count=1`
- Ran TypeScript validation:
  - `cd web && npx tsc --noEmit`
- Ran frontend tests:
  - `cd web && pnpm test -- --runInBand`
- Marked Phase 6 complete in `tasks.md`.

### Why
- The implementation touched backend runtime, server handlers, protobuf conversion, frontend routing, Storybook, and docs, so full validation was required.

### What worked
- Go tests passed across the repo.
- TypeScript passed.
- Frontend tests passed:
  - `10 passed`, `41 passed`.

### What didn't work
- N/A.

### What I learned
- The real Admin DSL website now follows the same high-level loop as the intake DSL while preserving Admin-specific schema, surfaces, and protobuf transport.

### What was tricky to build
- The final state required several clean cut-overs: old Go spike removed, surface authoring kept on `surface.*`, and frontend dispatch requires opaque backend action ids.

### What warrants a second pair of eyes
- Manual browser smoke for `/admin/services` with the Go server running.
- Review auth/authorization before exposing the route beyond development.

### What should be done in the future
- Persist Admin DSL sessions if admin workflows need reload durability.
- Add real service persistence/mutation against app-owned backend storage.

### Code review instructions
- Review commits Step 1 through Step 8 in order.
- Validate with the three commands above.

### Technical details
- Final validation:
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

## Step 9: Playwright smoke test the real Admin DSL page and fix empty error chrome

I smoke-tested `/admin/services` in Playwright against the dev backend and Vite frontend. The page loaded, the services list rendered from the Goja-backed Admin DSL flow, opening the Cut row showed the editor drawer, and triggering validation showed a real validation message from the backend flow.

During visual review I noticed an empty red validation box above the form fields before validation was triggered. That was caused by the renderer displaying the form error container whenever `props.errors` existed, even when it was an empty object. I fixed the renderer so it only renders the validation box when there is at least one error entry, added regression coverage, and retook the drawer screenshot.

### Prompt Context

**User prompt (verbatim):** "test in playwright, take screenshots."

**Assistant interpretation:** Run the real Admin DSL website in a browser, interact with it, capture screenshots, and report any visual/runtime issues.

**Inferred user intent:** The user wants browser-level confidence that `/admin/services` actually works beyond unit tests.

**User prompt (verbatim):** "you see that little red box?"

**Assistant interpretation:** Confirm and fix the unexpected empty red validation/error box visible in the drawer screenshot.

**Inferred user intent:** The user wants visual polish and not just functional correctness.

**Commit (code):** Pending in this step.

### What I did
- Started the dev stack with:
  - `devctl up --profile live-dsl --force`
- Confirmed backend was alive on `127.0.0.1:19080`.
- Reused an already-running Vite dev server on `127.0.0.1:5175` because the devctl web service could not bind that port.
- Opened:
  - `http://127.0.0.1:5175/admin/services`
- Captured screenshots:
  - `various/playwright/01-admin-services-initial.png`
  - `various/playwright/02-admin-services-drawer-open-fixed.png`
  - `various/playwright/03-admin-services-validation.png`
- Clicked the Cut row Open button and verified the drawer appeared.
- Clicked Trigger validation and verified `name: Name is required` appeared.
- Checked browser console warnings/errors; no warning/error messages were reported.
- Fixed the empty red error box in `web/src/admin-dsl/render.tsx` by only rendering `.adminDslFormErrors` when `Object.entries(errors).length > 0`.
- Added a regression test in `web/src/admin-dsl/AdminDsl.test.tsx`.
- Validated the frontend:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
  - `10 passed`, `42 passed`

### Why
- Playwright caught a visual defect that unit tests did not catch: empty form errors were displayed as an empty red box.
- The screenshot set documents the real backend/Admin DSL page states for review.

### What worked
- `/admin/services` rendered the real Goja-backed Admin DSL page.
- Backend dispatch worked for opening the drawer and triggering validation.
- The empty red validation box is gone in the fixed drawer screenshot.

### What didn't work
- `devctl up --profile live-dsl --force` started the backend, but the web service failed because port `5175` was already occupied by an older Vite process:
  - `Error: Port 5175 is already in use`
- The existing Vite process on `5175` was still usable and correctly proxied `/api/admin-dsl` to the backend.

### What I learned
- The page is functionally wired end-to-end, and the remaining issues are normal UI polish items.
- Form error rendering should treat an empty error object as no errors.

### What was tricky to build
- Playwright strict locators found duplicate buttons because mobile and desktop side columns can both exist in the DOM for responsive rendering. I used a desktop-side-column scoped selector for the validation button.

### What warrants a second pair of eyes
- Review whether hidden mobile side-column elements should be `aria-hidden` or removed from the accessibility tree on desktop to avoid duplicate accessible buttons.
- Review whether the old Vite process on port `5175` should be cleaned up so devctl owns the web service.

### What should be done in the future
- Add a tracked Playwright or css-visual-diff smoke script for `/admin/services` if this route will be reviewed frequently.

### Code review instructions
- Review the screenshots in `various/playwright/`.
- Review the `render.tsx` form error rendering fix and the added test.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- Screenshot files:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/various/playwright/01-admin-services-initial.png`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/various/playwright/02-admin-services-drawer-open-fixed.png`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website/various/playwright/03-admin-services-validation.png`

## Step 10: Add additive migration for existing DSL session databases

While testing locally, an older SQLite state database failed with `table dsl_flow_sessions has no column named config_version_id`. The checked-in `CREATE TABLE IF NOT EXISTS` schema had the column for fresh databases, but SQLite does not modify an existing table when the `CREATE TABLE IF NOT EXISTS` statement changes.

I added a small additive migration pass after schema provisioning so existing dev databases gain the missing `config_version_id` and `expires_at` columns without needing to delete/recreate the database. Recreating remains acceptable for disposable local state, but the code now handles the common upgrade path automatically.

### Prompt Context

**User prompt (verbatim):** "I get table dsl_flow_sessions has no column named config_version_id"

**Assistant interpretation:** The user hit an old local SQLite schema while trying to run the app.

**Inferred user intent:** They need a concrete fix that lets the dev app start and continue testing.

**User prompt (verbatim):** "maybe we need to migrate / recreate the db / reseed it?"

**Assistant interpretation:** Decide whether this should be solved by deleting local DBs or by adding a migration/reseed path.

**Inferred user intent:** The user wants guidance and likely a robust local-development fix.

**Commit (code):** Pending in this step.

### What I did
- Updated `pkg/dslhost/db.go` so `ProvisionSchema` runs additive column checks after the embedded schema.
- Added `ensureColumn(...)` using `PRAGMA table_info(...)` and `ALTER TABLE ... ADD COLUMN ...`.
- Added migration coverage in `pkg/dslhost/db_test.go` for an old `dsl_flow_sessions` table without `config_version_id` or `expires_at`.
- Validated with:
  - `go test ./pkg/dslhost ./pkg/server -count=1`
  - `go test ./... -count=1`

### Why
- Fresh databases already work, but existing SQLite files created before HAIR-038 do not get new columns from `CREATE TABLE IF NOT EXISTS`.
- An additive migration preserves local sessions/drafts better than forcing deletion.

### What worked
- The migration test starts from an old table and verifies both missing columns are added.
- Full Go test suite passed.

### What didn't work
- Relying on `CREATE TABLE IF NOT EXISTS` alone was insufficient for existing SQLite schemas.

### What I learned
- The DSL host needs explicit additive migrations for schema evolution, even in local/dev SQLite mode.

### What was tricky to build
- The migration must be idempotent because `ProvisionSchema` can run repeatedly. `PRAGMA table_info` makes the `ALTER TABLE` conditional.

### What warrants a second pair of eyes
- If more DSL state columns are added, consider replacing this ad-hoc additive list with a numbered migration table.

### What should be done in the future
- Add a proper schema migration/versioning mechanism before this state DB carries important production data.

### Code review instructions
- Start with `pkg/dslhost/db.go:ProvisionSchema` and `ensureColumn`.
- Review `pkg/dslhost/db_test.go:TestProvisionSchemaMigratesExistingSessionColumns`.
- Validate with `go test ./... -count=1`.

### Technical details
- The immediate local workaround is still safe for disposable dev state:
  - stop devctl
  - remove `var/fringe-dsl.sqlite*`
  - restart devctl
- Removing `var/fringe-dsl-config.sqlite*` forces config DB reseeding, but is not required for the `dsl_flow_sessions.config_version_id` error.

## Step 11: Make the service drawer form actually editable

Manual testing showed that the service editor looked like a form but behaved like a read-only preview. The fields were rendered with `readOnly`, the form actions did not submit current field values, and the validation demo always replaced the name with an empty value.

I changed the renderer to make fields editable and to collect `FormData` when a form action is clicked. The Goja services flow now receives the submitted values, validates the current name, saves valid edits into the in-memory service list, and only shows `Name is required` when the user actually submits/validates an empty name.

### Prompt Context

**User prompt (verbatim):** "1. I can't type in the edit Cut Service Form
2. Trigger Validation seems to cleawr the name?
3. Is those 3 things all there is to the admin service for nwo?"

**Assistant interpretation:** The user found that the real Admin DSL route is too static: fields cannot be typed into, validation clears values unexpectedly, and the current services surface appears very small.

**Inferred user intent:** They want the admin service demo to behave like a real editable page and want clarity about current MVP scope.

**Commit (code):** Pending in this step.

### What I did
- Updated `web/src/admin-dsl/render.tsx`:
  - form action clicks now collect `FormData` from the enclosing form and dispatch it as the action value.
  - text and textarea fields now render editable controls with `name` and `defaultValue` instead of read-only controlled values.
- Updated `pkg/admindsl/flows/services.flow.js`:
  - added draft value handling.
  - save now validates submitted values and writes valid edits into the mock in-memory service list.
  - trigger validation now validates the current form values instead of unconditionally clearing the name.
  - service rows now render from `state.services` rather than hard-coded row labels.
  - changed the validation action from `.Actions(...)` to `.Action("validate", ...)` so it no longer overwrites submit/cancel actions.
- Updated tests:
  - `web/src/admin-dsl/AdminDsl.test.tsx` covers editing a field and dispatching submitted form values.
  - `pkg/admindsl/flows_test.go` covers validation and saving updated service values.
  - `pkg/admindsl/test_helpers_test.go` can now find typed `ActionRef` values in test fixtures.
- Re-smoked in Playwright:
  - opened `/admin/services`
  - opened Cut
  - typed `Curly Cut` and `75 min · $95+`
  - clicked Save
  - verified the row and drawer updated.
- Captured:
  - `various/playwright/04-admin-services-edit-save.png`
- Validated:
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
  - frontend: 10 files, 43 tests passed.

### Why
- A realistic admin form needs at least local edit/save behavior, even before application-owned persistence is added.
- Trigger validation should validate the form state, not mutate it into an artificial failure state.

### What worked
- The drawer form is now editable in the browser.
- Save updates the in-memory services flow state and re-renders the service row.
- Clearing the name and triggering validation shows the expected error without unexpected hidden behavior.

### What didn't work
- Before this step, `.Actions(forceValidation)` overwrote `.Submit(save)` and `.Cancel(cancel)` because `Actions` replaces the action collection. The fix was to attach the extra action with a keyed `.Action("validate", forceValidation)` call.

### What I learned
- The Admin DSL renderer had been sufficient for display scenarios, but the real backend route needed value collection semantics to cross the browser/backend boundary.

### What was tricky to build
- The page renders both desktop and mobile drawer columns in the DOM for responsive layout, so Playwright selectors need to scope to `.adminDslDesktopSideColumn` on desktop.
- Empty string draft values must be preserved; simple `draft.name || service.title` would accidentally replace an intentionally blank name during validation.

### What warrants a second pair of eyes
- The current fields are uncontrolled inputs. That is acceptable for the present submit-on-action model, but richer field-level events would need a more explicit form state policy.
- The duplicate desktop/mobile accessible controls should still be reviewed for accessibility.

### What should be done in the future
- Persist service edits to application-owned storage instead of the current in-memory JS flow state.
- Add real create/archive/publish flows if the Admin Services page becomes a production surface.

### Code review instructions
- Start with `web/src/admin-dsl/render.tsx:renderActions` and `FieldPreview`.
- Then review `pkg/admindsl/flows/services.flow.js` save/validation behavior.
- Validate with:
  - `go test ./... -count=1`
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- Current Admin Services scope is intentionally small:
  - three seeded mock services: Cut, Color, Extensions.
  - Cut and Color can open the editor.
  - Extensions is displayed as Draft and currently has no editor action.
  - edits are in-memory per Admin DSL session, not persisted to the app database.
