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

- [ ] Add `pkg/admindsl/modules.go` with `require("fringe/admin-dsl")` backed by Go host builders.
- [ ] Add `pkg/admindsl/flows/services.flow.js` as the real services/pricing admin page flow.
- [ ] Add `pkg/admindsl/flows.go` to embed/export the service admin flow source.
- [ ] Ensure the JS flow uses clean `surface.*` semantics and no legacy surface helpers.
- [ ] Add tests proving Goja flow source can render and dispatch through host builders.

## Phase 3 — HTTP integration cut-over

- [ ] Replace the hardcoded `ServicesFlowSession` store in `pkg/server/handlers_admin_dsl.go` with runtime-backed Admin Goja sessions.
- [ ] Keep existing Admin DSL protobuf endpoints and response shapes.
- [ ] Update server tests for start/get/dispatch through the JS flow.
- [ ] Add a test for unknown flow id and stale action behavior through HTTP.

## Phase 4 — Frontend real website route

- [ ] Add `web/src/admin-dsl/BackendAdminDslPage.tsx`.
- [ ] Wire `AdminPageRenderer` dispatch to `postAdminDslEvent` using opaque `action.id` and `action.event`.
- [ ] Add loading/error/effect display for backend Admin DSL states.
- [ ] Mount `/admin/services` in the web app.
- [ ] Add frontend tests for event conversion and missing backend action id handling.

## Phase 5 — Storybook/live smoke support

- [ ] Add a live-backend Storybook story or documented dev-only story for `/api/admin-dsl` transport.
- [ ] Keep static/MSW stories as deterministic screenshot sources.
- [ ] Update screenshot guidance if live story should be excluded from CI-grade captures.

## Phase 6 — Final validation and documentation

- [ ] Update HAIR-040 diary after each implementation step.
- [ ] Update HAIR-040 changelog and doc relations.
- [ ] Run `go test ./... -count=1`.
- [ ] Run `cd web && npx tsc --noEmit`.
- [ ] Run `cd web && pnpm test -- --runInBand`.
- [ ] Commit each completed phase separately.
