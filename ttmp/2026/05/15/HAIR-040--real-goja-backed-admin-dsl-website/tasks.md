# Tasks

## Phase 0 — Ticket setup and design

- [x] Create HAIR-040 ticket workspace.
- [x] Add detailed implementation guide.
- [x] Add detailed phased task list.
- [x] Record ticket setup in the diary and changelog.
- [ ] Commit ticket setup docs.

## Phase 1 — Admin Goja runtime skeleton

- [x] Add `pkg/admindsl/script_runtime.go` with Admin runtime/session types.
- [x] Add render lifecycle with page validation and page-version commit.
- [x] Add dispatch lifecycle with stale page-version rejection and opaque action lookup.
- [x] Add `ctx.bind(actionBuilder, callback, event?)` support for backend callback registration.
- [x] Add runtime tests for initial render, dispatch, stale page, and invalid page rejection.
- [x] Keep runtime separate from `pkg/dslgoja` but borrow proven lifecycle patterns.

## Phase 2 — Goja host module and flow source

- [x] Add `pkg/admindsl/goja_module.go`/runtime module installation with `require("fringe/admin-dsl")` backed by Go host builders.
- [x] Add `pkg/admindsl/flows/services.flow.js` as the real services/pricing admin page flow.
- [x] Add `pkg/admindsl/flows.go` to embed/export the service admin flow source.
- [x] Ensure the JS flow uses clean `surface.*` semantics and no legacy surface helpers.
- [x] Add tests proving Goja flow source can render and dispatch through host builders.

## Phase 3 — HTTP integration cut-over

- [x] Replace the hardcoded `ServicesFlowSession` store in `pkg/server/handlers_admin_dsl.go` with runtime-backed Admin Goja sessions.
- [x] Keep existing Admin DSL protobuf endpoints and response shapes.
- [x] Update server tests for start/get/dispatch through the JS flow.
- [x] Add a test for unknown flow id and stale action behavior through HTTP.

## Phase 4 — Frontend real website route

- [x] Add `web/src/admin-dsl/BackendAdminDslPage.tsx`.
- [x] Wire `AdminPageRenderer` dispatch to `postAdminDslEvent` using opaque `action.id` and `action.event`.
- [x] Add loading/error/effect display for backend Admin DSL states.
- [x] Mount `/admin/services` in the web app.
- [x] Add frontend tests for event conversion and missing backend action id handling.

## Phase 5 — Storybook/live smoke support

- [x] Add a live-backend Storybook story or documented dev-only story for `/api/admin-dsl` transport.
- [x] Keep static/MSW stories as deterministic screenshot sources.
- [x] Update screenshot guidance if live story should be excluded from CI-grade captures.

## Phase 6 — Final validation and documentation

- [x] Update HAIR-040 diary after each implementation step.
- [x] Update HAIR-040 changelog and doc relations.
- [x] Run `go test ./... -count=1`.
- [x] Run `cd web && npx tsc --noEmit`.
- [x] Run `cd web && pnpm test -- --runInBand`.
- [x] Commit each completed phase separately.
