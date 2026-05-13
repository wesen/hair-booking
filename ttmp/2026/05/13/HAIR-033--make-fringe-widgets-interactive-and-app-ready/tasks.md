# Tasks

## TODO

- [ ] Add tasks here

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
- [ ] Add HTTP endpoints for starting a DSL flow, fetching the current page, and posting interaction events
- [ ] Add frontend backendClient and BackendDslPage container that renders backend-produced JSON and posts action refs back to Go
- [ ] Update DslPageRenderer to support backend action refs in props.actions while preserving local Storybook action names
- [ ] Add Storybook or dev-route demo for the Goja-backed multi-step intake flow
- [ ] Run go test ./... -count=1, web pnpm test, typecheck, and Storybook build; fix regressions
- [ ] Update HAIR-033 docs/diary/changelog and upload final implementation guide bundle to reMarkable
