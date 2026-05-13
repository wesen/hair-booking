# Changelog

## 2026-05-13

- Initial workspace created


## 2026-05-13

Created HAIR-033 ticket for making Fringe widgets interactive and app-ready, with tasks, initial design outline, and target file relationships.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/01-interactive-widget-props-callbacks-and-app-integration-guide.md — Initial interaction guide outline
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/reference/01-diary.md — Initial ticket diary


## 2026-05-13

Step 2: Implemented interactive Chip and ChipGroup controls with controlled/uncontrolled selection, callback metadata, interactive Storybook examples, and tests. Verified pnpm test, typecheck, and Storybook build. (commit 277df67)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/atoms/Chip/Chip.stories.tsx — Interactive chip Storybook examples
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/atoms/Chip/Chip.tsx — Accessible interactive chip with selection callback
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/atoms/Chip/ChipGroup.test.tsx — Chip and ChipGroup interaction tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/atoms/Chip/ChipGroup.tsx — Controlled/uncontrolled chip group


## 2026-05-13

Step 3: Standardized app-ready callback props across selectable widgets, added shared interaction metadata, app-state Storybook demos, and tests. Verified pnpm test, typecheck, and Storybook build. (commit 85f548b)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/InteractiveWidgets.stories.tsx — Interactive app-state Storybook demos
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/InteractiveWidgets.test.tsx — Callback behavior tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/atoms/RatingBar/RatingBar.tsx — Interactive rating callback upgrade
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/atoms/Segmented/Segmented.tsx — Segmented controlled callback upgrade
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe-ui/interactions.ts — Shared interaction metadata types
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/molecules/PhotoTile/PhotoTile.tsx — Upload/remove callback upgrade


## 2026-05-13

Step 4: Added reusable selection group components (ServiceOptionGroup, BudgetOptionGroup, TimeSlotGroup, DayPickerGrid), a shared controllable-value hook, updated Storybook demos, and tests. Verified pnpm test, typecheck, and Storybook build. (commit 96ba17e)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/SelectionGroups.test.tsx — Selection group behavior tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe-ui/selection.ts — Controlled/uncontrolled value helper
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/molecules/BudgetOption/BudgetOptionGroup.tsx — Budget option group
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/molecules/DayCell/DayPickerGrid.tsx — Day picker grid
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/molecules/ServiceOption/ServiceOptionGroup.tsx — Service option group
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/molecules/TimeSlot/TimeSlotGroup.tsx — Time slot group


## 2026-05-13

Step 5: Wired interactive widgets into the DSL with group node kinds, named action payloads, interactive DSL Storybook pages, and tests. Verified pnpm test, typecheck, and Storybook build. (commit 603b6cc)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/InteractiveDsl.stories.tsx — Interactive DSL Storybook pages
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/InteractiveDsl.test.tsx — Interactive DSL action routing tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/builder.ts — DSL builder helpers for interactive group nodes
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — Renderer action routing for interactive widgets
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts — DSL action payload and group node schema


## 2026-05-13

Step 6: Made Cut/Color/Extensions segmented controls visibly stateful in app-ready and DSL Storybook demos. Verified tests, typecheck, and Storybook build. (commit d30db28)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/InteractiveWidgets.stories.tsx — Segmented control state wiring
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/InteractiveDsl.stories.tsx — DSL segmented action-to-state wiring


## 2026-05-13

Step 7: Wrote backend-driven DSL callback architecture guide explaining page instances, opaque action refs, backend handler registry, browser event dispatch, API contracts, persistence/security strategy, and implementation plan; uploaded guide+diary bundle to reMarkable at /ai/2026/05/13/HAIR-033. (upload: HAIR_033_Backend_Driven_DSL_Callback_Guide.pdf)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/http.go — Existing backend route style referenced by guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/02-backend-driven-dsl-callback-architecture-guide.md — Backend-driven DSL callback architecture guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — Current renderer action-routing model referenced by guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts — Current frontend DSL schema referenced by guide


## 2026-05-13

Step 8: Added third design document explaining Goja-hosted JavaScript DSL flow scripts, callback registration, and a multi-step intake state machine model.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/intake/service.go — Domain service referenced for future Goja host module
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md — Goja sandbox multi-step intake DSL guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts — Frontend JSON contract referenced by guide


## 2026-05-13

Step 9: Updated Goja multi-step intake design with long-running per-flow VM recommendation, page-version-scoped current actions, stale action recovery, render transactions, idempotency, and callback cleanup rules.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md — Updated Goja VM/action lifecycle design


## 2026-05-13

Uploaded third Goja sandbox multi-step intake DSL guide to reMarkable at /ai/2026/05/13/HAIR-033. (upload: HAIR_033_Goja_Sandbox_Multi_Step_Intake_DSL_Guide.pdf)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md — Uploaded third Goja guide


## 2026-05-13

Step 10: Added Go-side DSL JSON schema types and DTOs in pkg/dslgoja, with JSON contract tests. Verified go test ./pkg/dslgoja -count=1. (commit 6d4e7e9)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/schema.go — Go structs for frontend-compatible DSL page/event JSON
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/schema_test.go — JSON contract tests for DSL schema DTOs


## 2026-05-13

Step 11: Added minimal Goja flow runtime that loads JS flow source, calls initialState/render, exposes ctx.action, exports page JSON, and tests initial action refs. Verified go test ./pkg/dslgoja -count=1. (commit 7dac9ed)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/go.mod — Added Goja dependency
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — Minimal Goja flow runtime and ctx.action support
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime_test.go — Runtime start/render/action registration tests


## 2026-05-13

Step 12: Added page-version-scoped action lifecycle and render transactions to the Goja flow runtime; old actions retire only after successful render and failed render preserves current actions. Verified go test ./pkg/dslgoja -count=1. (commit 343626e)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/action_lifecycle_test.go — Action retirement and failed-render rollback tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — Render transaction and action lifecycle implementation


## 2026-05-13

Step 13: Exposed a minimal require('fringe/dsl') builder module inside Goja, wired runtime installation, and added tests for builder-produced pages and unknown module failures. Verified go test ./pkg/dslgoja -count=1. (commit 8bffef1)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/modules_dsl.go — Goja fringe/dsl module implementation
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/modules_dsl_test.go — Goja DSL module tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — Runtime installs DSL module before loading flow source


## 2026-05-13

Step 14: Added embedded two-step Goja intake.flow.js prototype using require('fringe/dsl'), with service/color steps and tests. Verified go test ./pkg/dslgoja -count=1. (commit 553d115)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/flows.go — Embedded demo flow source
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/flows/intake.flow.js — Two-step Goja intake flow prototype
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/intake_flow_test.go — Demo flow rendering tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — Active render transaction lookup for ctx.action


## 2026-05-13

Step 15: Implemented FlowSession.Dispatch to route browser interaction events into registered Goja callbacks with locking, idempotency, version checks, stale recovery, and callback-returned page commits. Verified go test ./pkg/dslgoja -count=1. (commit d6298c4)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/dispatch_test.go — Dispatch behavior tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/runtime.go — Goja interaction dispatch implementation


## 2026-05-13

Step 16: Expanded Goja runtime dispatch test coverage for unknown actions and callback exceptions; current tests cover flow start, action registration, segmented change, next navigation, stale action recovery, and duplicate idempotency. Verified go test ./pkg/dslgoja -count=1. (commit d81d233)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/dispatch_errors_test.go — Dispatch error-path tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/dispatch_test.go — Core dispatch behavior tests


## 2026-05-13

Step 17: Added HTTP endpoints for Goja DSL flows (start, get current page, dispatch event) plus endpoint tests. Verified go test ./pkg/dslgoja ./pkg/server -count=1. (commit 2396d07)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl.go — DSL flow HTTP handlers and in-memory store
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl_test.go — Endpoint start/get/dispatch tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/http.go — DSL route registration


## 2026-05-13

Step 18: Connected frontend DSL renderer to backend action refs with backendClient, BackendDslPage, renderer backendDispatch support, tests, and a Storybook demo. Verified go test ./... -count=1, web tests, typecheck, and Storybook build. (commit 3942190)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/BackendDslPage.stories.tsx — Storybook demo for backend-shaped Goja flow
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/BackendDslPage.test.tsx — Backend action and BackendDslPage tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/BackendDslPage.tsx — Frontend container for backend-produced DSL pages
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/backendClient.ts — Client for Goja DSL flow endpoints
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — Renderer backend action-ref dispatch support


## 2026-05-13

Step 19: Added an intern-facing real UI app integration guide for the Goja backend DSL, scoped phases for live viewing page work, flow expansion, host modules, session lifecycle, and auth hardening, updated tasks, and uploaded the guide to reMarkable.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/04-real-ui-app-integration-guide-for-goja-backend-dsl.md — New intern-facing guide and implementation plan
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/reference/01-diary.md — Diary step recording guide creation and reMarkable upload
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/tasks.md — Phased task plan for getting a live DSL viewing page working


## 2026-05-13

Step 20: Implemented the live Vite viewing page for the Goja backend DSL (commit 54e3e1a). Added web/index.html, main.tsx, App.tsx, LiveDslDemoApp.tsx, configurable Vite backend proxy, and ignored tsbuildinfo. Verified Go tests, web tests, typecheck, Vite build, Storybook build, and a live browser path against backend port 19080.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/04-real-ui-app-integration-guide-for-goja-backend-dsl.md — Updated with Phase A implementation notes
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/tasks.md — Phase A marked complete
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/.gitignore — Ignores generated tsbuildinfo
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/index.html — Vite app entrypoint for the live DSL demo
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/App.tsx — Minimal app shell for the live DSL viewing page
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/LiveDslDemoApp.tsx — Phone-frame live backend DSL demo and debug panel
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/main.tsx — React bootstrap for the live app without StrictMode duplicate backend flow starts
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/vite.config.ts — Configurable backend proxy with HAIR_BOOKING_BACKEND_URL

