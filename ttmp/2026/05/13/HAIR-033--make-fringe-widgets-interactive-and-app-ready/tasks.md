# Tasks

## Phase A — Real Viewing Page for Live Goja Backend DSL

- [x] Add `web/index.html` as the Vite app entrypoint for the live DSL demo.
- [x] Add `web/src/main.tsx` to mount React and import Fringe design tokens.
- [x] Add `web/src/App.tsx` with a minimal app shell for the DSL demo route.
- [x] Add `web/src/LiveDslDemoApp.tsx` that renders `BackendDslPage flowId="fringe.intake.v1"` inside a phone-frame development shell.
- [x] Verify `VITE_ENABLE_MSW=false pnpm dev:backend` proxies `/api/dsl/*` to the live Go backend on `127.0.0.1:8080`.
- [x] Manually test the live browser path: service step loads, segmented changes dispatch to Goja, shell next opens color step, chip/rating changes persist after backend responses.
- [x] Add or document a smoke test recipe for `/dsl-goja-demo` that proves browser clicks traverse React → Go HTTP → Goja callback → JSON response → React rerender.

## Phase B — Debuggability, Routing, and Review Surface

- [x] Add optional debug UI for `sessionId`, `pageVersion`, `page.id`, effects, and the last backend event.
- [x] Add a copyable current-page JSON panel or developer-only details section.
- [x] Render stale-page and callback-error effects clearly in the live demo.
- [x] Update `DslPageRenderer` to use `node.meta.id` as React keys, with index fallback only when ids are missing.
- [x] Add tab-scoped `sessionStorage` resume for the live DSL demo and clear it if the backend returns `dsl_session_not_found`.
- [x] Add URL/page sync that maps backend `page.id` to route slugs such as `/dsl-goja-demo/service` and `/dsl-goja-demo/color`.
- [x] Decide whether page-id transitions should use `history.pushState` or `history.replaceState` during the demo phase.
- [x] Add a small protobuf transport-contract spike using `google.protobuf.Struct` for dynamic node props.

## Phase C — Expand the Goja Intake Flow

- [x] Extend `pkg/dslgoja/flows/intake.flow.js` from two steps to service → color → photos → budget → estimate → booking → confirm.
- [x] Add stable page ids and node ids for every new step.
- [x] Add Go runtime tests for each new navigation transition and representative field update.
- [x] Keep `ctx.state` JSON-serializable and document the state shape in the guide.

## Phase D — Safe Host Modules and Domain Integration

- [ ] Design and implement a minimal `fringe/intake` Goja host module for estimate/validation operations.
- [ ] Design follow-up `fringe/availability` and `fringe/appointments` host modules.
- [ ] Add tests proving host modules accept and return JSON-shaped data only.
- [ ] Replace hard-coded prototype data in the flow where safe host modules are available.

## Phase E — Session Lifecycle and Auth Hardening

- [ ] Add metadata around in-memory DSL sessions: user id, created at, last seen at, and expiry.
- [ ] Add idle/absolute expiry and cleanup for the DSL flow store.
- [ ] Add pruning for `ProcessedEvents` and `RetiredActions`.
- [ ] Enforce dev-mode and OIDC-mode ownership checks on get/event endpoints.
- [ ] Add HTTP tests for forbidden cross-user DSL session access.

## Documentation / Handoff

- [ ] Keep `design-doc/04-real-ui-app-integration-guide-for-goja-backend-dsl.md` updated as the live page is implemented.
- [x] Upload the latest live UI app integration guide to reMarkable after major updates.

## Completed so far

- [x] Inventory atoms, molecules, organisms, current props, and missing interaction contracts
- [x] Design app-ready controlled/uncontrolled props and callback conventions for selectable widgets
- [x] Implement interactive chips and multi-select patterns, including toggled chip sets
- [x] Upgrade service, budget, time slot, day cell, photo tile, rating, segmented, and summary widgets with workable callbacks
- [x] Add Storybook interaction examples and realistic app-state demos
- [x] Add or update tests for selection callbacks and state transitions
- [x] Update intern-facing implementation notes and reMarkable handoff if requested
- [x] Design backend-driven DSL callback architecture and upload intern guide to reMarkable
- [x] Define Go JSON DSL schema types in pkg/dslgoja and keep field names aligned with web/src/page-dsl/schema.ts
- [x] Implement a minimal Goja flow runtime that can start a flow, load a JS script, create JSON state, render the first page, and expose ctx.action
- [x] Implement page-version-scoped action registry with CurrentActions, RetiredActions, ProcessedEvents, and render transactions
- [x] Expose a fringe/dsl-style JavaScript builder module inside Goja for page(), intake(), and core node helpers
- [x] Create a two-step intake.flow.js prototype with service and color steps using segmented, serviceOptionGroup, chipGroup, ratingBar, and footer navigation
- [x] Implement event dispatch into registered Goja callbacks with per-session locking, timeout/interrupt, idempotency, stale-page recovery, and node/action validation
- [x] Add Go tests covering start flow, action registration, segmented change, next navigation, stale action rejection/recovery, and duplicate event idempotency
- [x] Add HTTP endpoints for starting a DSL flow, fetching the current page, and posting interaction events
- [x] Add frontend backendClient and BackendDslPage container that renders backend-produced JSON and posts action refs back to Go
- [x] Update DslPageRenderer to support backend action refs in props.actions while preserving local Storybook action names
- [x] Add Storybook or dev-route demo for the Goja-backed multi-step intake flow
- [x] Run go test ./... -count=1, web pnpm test, typecheck, and Storybook build; fix regressions
- [x] Update HAIR-033 docs/diary/changelog and upload final implementation guide bundle to reMarkable
