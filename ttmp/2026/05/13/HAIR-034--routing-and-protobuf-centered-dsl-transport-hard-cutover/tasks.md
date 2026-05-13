# Tasks

## Phase 1 — Ticket and Design

- [x] Create HAIR-034 ticket for routing/session/protobuf hard cutover.
- [x] Write analysis and design guide.
- [x] Upload design guide to reMarkable.

## Phase 2 — Protobuf Schema as Transport Contract

- [x] Add explicit protobuf flow envelopes (`StartFlowRequest`, `GetFlowRequest`, `FlowState`, `DispatchEventRequest`).
- [x] Regenerate Go and TypeScript protobuf code.
- [x] Update protobuf contract tests.

## Phase 3 — Go Runtime/Proto Conversion Boundary

- [x] Add Go conversion helpers between `pkg/dslgoja` runtime structs and `dslv1` generated messages.
- [x] Add conversion tests for page trees, effects, and interaction events.

## Phase 4 — Server Hard Cutover

- [x] Remove duplicate DSL response DTOs from server handlers.
- [x] Encode/decode DSL API payloads via protobuf JSON.
- [x] Update server handler tests.

## Phase 5 — Frontend Hard Cutover

- [x] Update `backendClient.ts` to use generated protobuf messages at the HTTP boundary.
- [x] Keep renderer-facing objects plain unless deeper generated-message rendering is explicitly chosen.
- [x] Update frontend protobuf/client tests.

## Phase 6 — Live Routing and Smoke

- [x] Restart devctl backend/web.
- [x] Verify seven-step routing URL projection.
- [x] Verify estimate/confirm edit links.
- [x] Verify dispatch toast no longer overlaps footer.


## Phase 7 — Protobuf Cleanup and Error Envelopes

- [x] Add protobuf-defined DSL error envelope.
- [x] Return protobuf JSON errors from DSL endpoints.
- [x] Decode protobuf errors in the frontend client.
- [x] Remove duplicate generated `InteractionResult` proto message in favor of `FlowState`.
- [x] Validate Go/web tests, typecheck, and Vite build.
