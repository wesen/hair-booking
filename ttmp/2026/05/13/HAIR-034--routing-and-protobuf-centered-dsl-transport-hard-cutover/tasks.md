# Tasks

## Phase 1 — Ticket and Design

- [x] Create HAIR-034 ticket for routing/session/protobuf hard cutover.
- [x] Write analysis and design guide.
- [x] Upload design guide to reMarkable.

## Phase 2 — Protobuf Schema as Transport Contract

- [ ] Add explicit protobuf flow envelopes (`StartFlowRequest`, `GetFlowRequest`, `FlowState`, `DispatchEventRequest`).
- [ ] Regenerate Go and TypeScript protobuf code.
- [ ] Update protobuf contract tests.

## Phase 3 — Go Runtime/Proto Conversion Boundary

- [ ] Add Go conversion helpers between `pkg/dslgoja` runtime structs and `dslv1` generated messages.
- [ ] Add conversion tests for page trees, effects, and interaction events.

## Phase 4 — Server Hard Cutover

- [ ] Remove duplicate DSL response DTOs from server handlers.
- [ ] Encode/decode DSL API payloads via protobuf JSON.
- [ ] Update server handler tests.

## Phase 5 — Frontend Hard Cutover

- [ ] Update `backendClient.ts` to use generated protobuf messages at the HTTP boundary.
- [ ] Keep renderer-facing objects plain unless deeper generated-message rendering is explicitly chosen.
- [ ] Update frontend protobuf/client tests.

## Phase 6 — Live Routing and Smoke

- [ ] Restart devctl backend/web.
- [ ] Verify seven-step routing URL projection.
- [ ] Verify estimate/confirm edit links.
- [ ] Verify dispatch toast no longer overlaps footer.
