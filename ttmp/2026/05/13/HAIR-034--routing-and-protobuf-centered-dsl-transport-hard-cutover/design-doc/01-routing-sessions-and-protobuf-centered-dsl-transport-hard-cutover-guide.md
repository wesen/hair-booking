---
Title: Routing Sessions and Protobuf-Centered DSL Transport Hard Cutover Guide
Ticket: HAIR-034
Status: active
Topics: []
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/dslgoja/schema.go
      Note: Runtime DSL structs that need explicit protobuf conversion boundaries
    - Path: pkg/server/handlers_dsl.go
      Note: Current hand-written JSON DSL API DTOs to replace with protobuf JSON
    - Path: proto/fringe/dsl/v1/dsl.proto
      Note: Current protobuf schema to expand into the central transport contract
    - Path: web/src/LiveDslDemoApp.tsx
      Note: Current route/session projection behavior to preserve while protobuf transport changes
    - Path: web/src/page-dsl/backendClient.ts
      Note: Current hand-written frontend DSL transport client to cut over to generated protobuf messages
    - Path: web/src/page-dsl/schema.ts
      Note: Renderer-facing DSL shape that should remain ergonomic after transport cutover
ExternalSources: []
Summary: Analysis and implementation guide for consolidating routing/session work and making protobuf the central DSL transport contract with a hard cutover.
LastUpdated: 2026-05-13T13:56:48.764902762-04:00
WhatFor: ""
WhenToUse: ""
---








# Routing Sessions and Protobuf-Centered DSL Transport Hard Cutover Guide

## Executive Summary

HAIR-034 consolidates the remaining routing/session work and the protobuf hard cutover for the backend-driven Fringe DSL runtime. The current implementation has three useful but separate pieces: a JSON HTTP API, a tested protobuf schema spike, and a live route that maps backend page ids into browser URLs. The next architecture should make protobuf the central contract across Go runtime, HTTP handlers, TypeScript client code, and tests.

The cutover can be direct. There is no need to preserve the old JSON DTO names or maintain dual endpoints. The browser may still exchange protobuf JSON over HTTP at first, but the authoritative request/response shapes should be generated from `proto/fringe/dsl/v1/dsl.proto`. The hand-written TypeScript transport interfaces should either disappear or become thin aliases/adapters around generated protobuf message types.

## Current State

### Runtime and backend API

Current endpoints:

```text
POST /api/dsl/flows/{flowId}/start
GET  /api/dsl/flows/{sessionId}
POST /api/dsl/flows/{sessionId}/events
```

Current Go handler file:

```text
pkg/server/handlers_dsl.go
```

Current backend handler response shape:

```go
type dslFlowResponse struct {
    SessionID   string           `json:"sessionId"`
    PageVersion int64            `json:"pageVersion"`
    Page        dslgoja.Page     `json:"page"`
    Effects     []dslgoja.Effect `json:"effects,omitempty"`
}
```

This is hand-written JSON. It mirrors the runtime model but does not use the generated protobuf contract.

### Frontend transport

Current frontend client:

```text
web/src/page-dsl/backendClient.ts
```

It defines hand-written transport interfaces:

```ts
export interface DslFlowState {
  sessionId: string;
  pageVersion: number;
  page: DslPage;
  effects?: DslEffect[];
}

export interface DslInteractionEvent extends DslBackendEvent {
  eventId: string;
  pageVersion: number;
}
```

These types are close to the protobuf schema, but they are not generated from it.

### Protobuf spike

Current proto:

```text
proto/fringe/dsl/v1/dsl.proto
```

Current generated files:

```text
gen/proto/fringe/dsl/v1/dsl.pb.go
web/src/pb/proto/fringe/dsl/v1/dsl_pb.ts
```

Current schema messages:

```protobuf
message Page
message Shell
message Node
message NodeMeta
message ActionRef
message Effect
message InteractionEvent
message InteractionResult
```

The spike is useful, but it is incomplete for a true central transport contract because it lacks a start-flow request/result envelope and a get-flow request/result envelope. It also currently uses protobuf mainly in contract tests, not in the live handlers.

### Routing/session behavior

Current live route:

```text
/dsl-goja-demo
```

The live frontend syncs backend page ids into URLs such as:

```text
/dsl-goja-demo/service
/dsl-goja-demo/color
```

The session id is stored in tab-scoped `sessionStorage`, which matches the current one-tab-one-flow semantics. Missing remembered sessions are recovered by starting a new flow.

## Problem Statement

The current system works, but the contracts are split across too many hand-written shapes:

1. Go runtime types in `pkg/dslgoja/schema.go`.
2. Go server DTOs in `pkg/server/handlers_dsl.go`.
3. TypeScript DSL JSON interfaces in `web/src/page-dsl/schema.ts`.
4. TypeScript HTTP DTOs in `web/src/page-dsl/backendClient.ts`.
5. Protobuf messages in `proto/fringe/dsl/v1/dsl.proto`.

This split makes drift likely. It also makes it unclear which layer owns schema evolution. Since the DSL is explicitly backend-driven, protobuf should become the stable source of truth for the transport boundary.

Routing has a related issue: URLs currently reflect page ids, but the route/session contract is not yet described by protobuf or backed by a product-level session lifecycle. The next phase should keep the route behavior simple while making session recovery and page transitions observable and testable through the protobuf transport envelopes.

## Proposed Solution

Use protobuf as the central transport contract for the DSL flow API.

### Hard cutover policy

No backwards compatibility is required. We can:

- replace hand-written HTTP DTOs with protobuf-generated message conversions,
- rename JSON fields to protobuf JSON names where needed,
- update frontend client parsing in one sweep,
- update tests to assert protobuf message round trips,
- remove obsolete hand-written transport types after migration.

The initial hard cutover can still use HTTP plus protobuf JSON encoding. Binary protobuf over HTTP can be a later switch if needed. The key change is not binary encoding; the key change is that generated protobuf messages become the canonical request and response shapes.

## Target Contract

Extend `dsl.proto` with explicit flow API envelopes.

```protobuf
message StartFlowRequest {
  string flow_id = 1;
  google.protobuf.Struct input = 2;
}

message GetFlowRequest {
  string session_id = 1;
}

message FlowState {
  string session_id = 1;
  uint32 page_version = 2;
  Page page = 3;
  repeated Effect effects = 4;
}

message DispatchEventRequest {
  string session_id = 1;
  InteractionEvent event = 2;
}
```

Then decide whether `InteractionResult` should remain or be folded into `FlowState`. The cleanest hard cutover is:

```protobuf
message FlowState { ... }
```

and all three endpoints return `FlowState`.

### HTTP mapping

Keep the URLs for now:

```text
POST /api/dsl/flows/{flowId}/start
GET  /api/dsl/flows/{sessionId}
POST /api/dsl/flows/{sessionId}/events
```

But use protobuf JSON encoding for bodies/responses.

Recommended response body:

```json
{
  "sessionId": "...",
  "pageVersion": 3,
  "page": { ... },
  "effects": []
}
```

Recommended request body for events:

```json
{
  "eventId": "...",
  "sessionId": "...",
  "pageVersion": 3,
  "nodeId": "shell.next",
  "nodeKind": "intakeShell",
  "actionId": "act_...",
  "event": "next",
  "value": null,
  "meta": {}
}
```

The route path still carries `sessionId` or `flowId`; the protobuf message carries the same identifiers for idempotence, logs, and future RPC-style compatibility.

## Conversion Boundary

There should be one explicit conversion boundary on the backend:

```text
dslgoja runtime model <-> dslv1 protobuf transport model
```

Add a package or file such as:

```text
pkg/dslgoja/proto_convert.go
```

Responsibilities:

- `PageToProto(page dslgoja.Page) (*dslv1.Page, error)`
- `PageFromProto(page *dslv1.Page) (dslgoja.Page, error)` if needed
- `EffectToProto(effect dslgoja.Effect) (*dslv1.Effect, error)`
- `InteractionEventFromProto(event *dslv1.InteractionEvent) (dslgoja.InteractionEvent, error)`
- `FlowStateFromResult(result *dslgoja.InteractionResult) (*dslv1.FlowState, error)`
- `FlowStateFromSnapshot(sessionID string, version int64, page dslgoja.Page) (*dslv1.FlowState, error)`

Use `structpb.NewStruct` and `structpb.NewValue` at this boundary. Keep Goja/runtime types plain Go structs so the runtime stays testable and not generated-code-dependent internally.

## Frontend Strategy

The generated TypeScript messages should become the transport source of truth.

Current generated file:

```text
web/src/pb/proto/fringe/dsl/v1/dsl_pb.ts
```

Update `backendClient.ts` to parse protobuf JSON into generated messages and then adapt to the renderer only where necessary.

There are two acceptable frontend designs.

### Option A: Generated messages at the HTTP boundary, existing renderer types inside

This is the lowest-risk hard cutover.

```text
HTTP JSON -> generated protobuf messages -> small adapter -> DslPageRenderer
```

`BackendDslPage` can continue receiving a `DslFlowState`, but that state is produced from generated protobuf messages instead of hand-written DTO parsing.

Pros:

- Minimal renderer disruption.
- Keeps React components on ergonomic plain objects.
- Lets protobuf own transport without forcing protobuf message objects deep into UI rendering.

Cons:

- Still has adapter code.
- Must keep adapter tests strong.

### Option B: Generated messages flow deeper into renderer

```text
HTTP JSON -> generated protobuf messages -> renderer reads generated message shape
```

Pros:

- Stronger single-source contract.

Cons:

- More UI churn.
- Dynamic props in `Struct` are less ergonomic in React.
- Generated message objects can make stories and local DSL examples noisier.

Recommendation: choose Option A now. The hard cutover is about the transport boundary, not about making every component accept protobuf objects.

## Routing Design

Keep the current simple routing policy during the protobuf cutover.

### Route ownership

The backend owns the current page id. The frontend owns browser URL projection.

```text
backend page id -> frontend route segment
```

Example mapping:

```text
intake-service  -> /dsl-goja-demo/service
intake-color    -> /dsl-goja-demo/color
intake-photos   -> /dsl-goja-demo/photos
intake-budget   -> /dsl-goja-demo/budget
intake-estimate -> /dsl-goja-demo/estimate
intake-booking  -> /dsl-goja-demo/booking
intake-confirm  -> /dsl-goja-demo/confirm
```

### Session ownership

Use tab-scoped storage for now:

```text
sessionStorage["fringe.dsl.fringe.intake.v1.sessionId"]
```

Do not move to shared `localStorage` yet. Shared sessions across tabs require live synchronization or explicit conflict semantics.

### Back/forward

Keep browser back/forward as a follow-up. The current flow mutates a Goja session through callbacks. A URL alone is not enough to reconstruct arbitrary state unless we add explicit route-to-state commands or snapshots.

The safe immediate contract is:

- current route displays the backend-owned current page,
- page transitions push or replace URLs,
- stale/missing sessions recover by starting a new flow.

## Implementation Plan

### Phase 1: Expand protobuf schema

- Add `FlowState`.
- Add `StartFlowRequest`.
- Add `GetFlowRequest`.
- Add `DispatchEventRequest`.
- Decide whether to deprecate or remove `InteractionResult` in the hard cutover.
- Regenerate Go and TypeScript code with Buf.

Validation:

```bash
buf generate
go test ./pkg/dslgoja -count=1
cd web && pnpm test -- --runInBand
```

### Phase 2: Backend conversion helpers

- Add `pkg/dslgoja/proto_convert.go`.
- Convert runtime `Page`, `Node`, `Shell`, `Effect`, and `InteractionEvent` to/from protobuf.
- Add unit tests for representative DSL pages and events.

Validation:

```bash
go test ./pkg/dslgoja -count=1
```

### Phase 3: Server hard cutover

- Replace `dslFlowResponse` with `dslv1.FlowState`.
- Decode event requests with protobuf JSON (`protojson.Unmarshal`).
- Encode responses with protobuf JSON (`protojson.MarshalOptions`).
- Keep the existing URLs.
- Remove hand-written DTOs that duplicate protobuf envelopes.

Validation:

```bash
go test ./pkg/server -count=1
go test ./... -count=1
```

### Phase 4: Frontend hard cutover

- Update `backendClient.ts` to use generated protobuf messages and `fromJson` / `toJson` helpers from `@bufbuild/protobuf`.
- Convert generated `FlowState` to the renderer's plain `DslFlowState` at the boundary.
- Update `ProtobufContract.test.ts` to cover live client conversion helpers.
- Remove or shrink hand-written transport interfaces.

Validation:

```bash
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
```

### Phase 5: Live smoke

- Restart devctl services.
- Start a new DSL session.
- Click through all seven steps.
- Verify edit links on estimate/confirm.
- Verify URL projection.
- Verify no dispatch toast overlaps the footer.

Commands:

```bash
devctl restart hair-booking-backend
devctl restart hair-booking-web
curl -sS -X POST http://127.0.0.1:19080/api/dsl/flows/fringe.intake.v1/start
```

## Design Decisions

### Decision 1: protobuf owns transport, not necessarily internal runtime

The Goja runtime can keep using plain structs. Generated protobuf types should own the API boundary. This preserves runtime ergonomics while making the cross-language contract explicit.

### Decision 2: protobuf JSON before binary protobuf

Use protobuf JSON first. It keeps browser/network debugging simple and avoids introducing content negotiation while the DSL is still evolving.

### Decision 3: no backwards compatibility shim

The user explicitly allowed a hard cutover. Remove duplicate JSON DTOs rather than supporting both old and new shapes.

### Decision 4: keep dynamic widget props as `Struct`

Widget props are still changing quickly. Encoding every widget prop as a generated protobuf message would slow down iteration. The stable part is the envelope, page tree, node metadata, actions, events, effects, and session/page-version semantics.

### Decision 5: routing remains page-id projection

The backend remains the source of truth for current page. The browser URL is a projection of backend state, not an independent command authority yet.

## Alternatives Considered

### Keep hand-written JSON DTOs

Rejected. This preserves the current drift risk and makes the protobuf spike decorative rather than architectural.

### Switch immediately to binary protobuf only

Deferred. Binary protobuf can come later. The core architectural win comes from generated protobuf messages owning the contract.

### Encode every widget prop as typed protobuf

Deferred. The UI DSL is still evolving. `Struct` is a pragmatic compromise.

### Make the browser route drive backend state directly

Deferred. The current Goja session model is callback/stateful. Direct route entry needs a separate route-to-state protocol.

## Testing Strategy

Backend:

- conversion tests for page trees,
- event conversion tests for `google.protobuf.Value`,
- handler tests against protobuf JSON bodies/responses,
- existing seven-step flow tests.

Frontend:

- generated protobuf JSON decode/encode tests,
- backend client conversion tests,
- `BackendDslPage` behavior tests,
- TypeScript compile.

Live:

- devctl-managed backend/web smoke,
- click-through of seven-step flow,
- edit links on estimate/confirm,
- route projection inspection,
- footer flashing retest.

## Open Questions

1. Should `InteractionResult` be renamed to `FlowState` or kept as a compatibility concept inside proto?
2. Should errors also get protobuf envelopes, or remain the existing API error shape for now?
3. Should backend effects stay footer-visible or move entirely to the side debug panel/top banner?
4. When productizing routing, should route entry mutate the existing session or start a new session at the requested step?

## Review Checklist

- `proto/fringe/dsl/v1/dsl.proto` is the only transport schema source of truth.
- Go and TypeScript generated files are updated together.
- Server handlers no longer define duplicate DSL response DTOs.
- Frontend client uses generated protobuf messages at the HTTP boundary.
- Tests cover Go conversion, server handlers, TS conversion, and live app behavior.
- Existing page renderer still receives stable plain DSL page objects unless explicitly changed.
