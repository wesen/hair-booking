---
title: Diary
docType: reference
ticket: HAIR-034
status: active
intent: short-term
topics:
  - protobuf
  - routing
  - dsl
created: 2026-05-13
updated: 2026-05-13
---

# Diary

## Goal

Track the routing/session cleanup and protobuf-centered hard cutover for the backend-driven Fringe DSL transport.

## Step 1: Create ticket and write cutover guide

Created HAIR-034 to collect the routing/session and protobuf transport hard-cutover work in one place. The initial design guide documents the current split-contract state, the target protobuf-centered architecture, and a phased implementation plan that does not preserve backwards compatibility.

The guide intentionally keeps protobuf central at the transport boundary while leaving the Goja runtime and React renderer free to use ergonomic plain structs/objects internally. That keeps the hard cutover focused on API correctness rather than forcing generated message objects deep into UI components.

### Prompt Context

**User prompt (verbatim):** "add a new ticket to tackle all the routine related stuff, and store an analysis / design guide document in it and upload to remarkable. 

Then address the steps to properly make protobuf the central piece. We can do a hard cutover across the board, no need for backwards compatibility."

**Assistant interpretation:** Create a new docmgr ticket for routing/session/protobuf hard-cutover work, write and upload a design guide, then begin implementing protobuf as the central transport contract without preserving the old JSON DTO layer.

**Inferred user intent:** Move from exploratory protobuf/routing work into a concrete project plan and implementation path where protobuf becomes the authoritative cross-language contract.

**Commit (code):** N/A at diary-write time.

### What I did

- Created ticket `HAIR-034`.
- Added design doc `design-doc/01-routing-sessions-and-protobuf-centered-dsl-transport-hard-cutover-guide.md`.
- Wrote the guide with current-state analysis, target protobuf envelopes, routing policy, implementation plan, design decisions, alternatives, and testing strategy.
- Created this diary.

### Why

The existing DSL system has useful pieces, but the API contract is split across hand-written Go DTOs, hand-written TypeScript interfaces, runtime structs, and generated protobuf types. HAIR-034 makes protobuf the central transport schema and gives the remaining routing/session work a focused home.

### What worked

- The existing protobuf spike already provides `Page`, `Node`, `InteractionEvent`, `Effect`, and `InteractionResult`, so the guide can build on concrete files rather than start from scratch.

### What didn't work

- N/A.

### What I learned

- The lowest-risk hard cutover is to make protobuf central at the HTTP boundary first, while adapting generated messages to the existing renderer's plain `DslPage` object shape.

### What was tricky to build

- The phrase “routine related stuff” likely referred to routing-related work in context. I scoped the ticket around routing/session semantics plus protobuf transport because those topics have been tightly coupled in the previous HAIR-033 docs.

### What warrants a second pair of eyes

- Whether `InteractionResult` should be replaced by `FlowState` or kept as an alias-like concept in the proto.
- Whether API errors should move to protobuf in this hard cutover or remain the existing envelope shape temporarily.

### What should be done in the future

- Upload the guide to reMarkable.
- Implement the protobuf schema expansion.
- Add Go conversion helpers and server handler hard cutover.
- Update the TypeScript backend client to use generated protobuf messages.

### Code review instructions

Start with:

- `ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/design-doc/01-routing-sessions-and-protobuf-centered-dsl-transport-hard-cutover-guide.md`

Validate frontmatter:

```bash
docmgr validate frontmatter --doc ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/design-doc/01-routing-sessions-and-protobuf-centered-dsl-transport-hard-cutover-guide.md
```

### Technical details

The initial hard-cutover phases are:

1. Expand `dsl.proto` with flow envelopes.
2. Add Go runtime/protobuf conversion helpers.
3. Replace server DTOs with protobuf JSON.
4. Update frontend client to use generated protobuf messages.
5. Smoke-test live routing, edit links, and footer flash behavior.


### Upload record

Uploaded the initial HAIR-034 guide bundle to reMarkable:

```text
/ai/2026/05/13/HAIR-034/HAIR_034_Routing_Protobuf_Hard_Cutover_Guide.pdf
```


---

## Step 2: Make protobuf the central DSL transport contract

Cut the live DSL API over to protobuf-defined transport envelopes. The HTTP endpoints still use JSON for debuggability, but successful request and response payloads now use protobuf JSON generated from `proto/fringe/dsl/v1/dsl.proto` instead of the previous hand-written `apiEnvelope{data: ...}` DTO shape.

The Goja runtime still uses plain Go structs internally, and the React renderer still receives plain DSL page objects. Protobuf now owns the cross-language API boundary: Go server handlers marshal `dslv1.FlowState`, frontend client code decodes `FlowStateSchema`, and event posts are encoded through `InteractionEventSchema`.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Implement the hard cutover so protobuf becomes the authoritative transport contract across backend handlers and frontend client code.

**Inferred user intent:** Replace duplicate JSON DTOs with generated protobuf message contracts without spending effort on backwards compatibility.

**Commit (code):** 911e679 — "HAIR-034 Step 2: Cut DSL transport to protobuf FlowState"

### What I did

- Extended `proto/fringe/dsl/v1/dsl.proto` with:
  - `StartFlowRequest`,
  - `GetFlowRequest`,
  - `DispatchEventRequest`,
  - `FlowState`.
- Regenerated Go and TypeScript protobuf code with `buf generate`.
- Added `pkg/dslgoja/proto_convert.go` as the explicit runtime/protobuf conversion boundary.
- Replaced the server's duplicate `dslFlowResponse` success DTO with direct protobuf JSON `FlowState` responses.
- Updated event decoding to use protobuf JSON into `dslv1.InteractionEvent`.
- Updated `web/src/page-dsl/backendClient.ts` to decode `FlowStateSchema` and encode `InteractionEventSchema`.
- Kept renderer-facing objects plain by adapting generated protobuf messages at the client boundary.
- Updated Go and TypeScript protobuf contract tests and server handler tests.

### Why

The previous protobuf spike was useful but not central. The live API still used hand-written Go and TypeScript DTOs, creating drift risk. This step makes the generated protobuf schema the contract for successful DSL transport payloads.

### What worked

Validation passed:

```bash
go test ./pkg/dslgoja ./pkg/server -count=1
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
cd ..
go test ./... -count=1
```

### What didn't work

- TypeScript initially rejected `fromJson(...)` inputs because the parsed `response.json()` result is `unknown` and because the app-level `JsonValue` type is distinct from `@bufbuild/protobuf`'s `JsonValue`. The fix was to import `type JsonValue as ProtoJsonValue` from `@bufbuild/protobuf` and cast at the boundary.

### What I learned

- With `@bufbuild/protobuf`, `google.protobuf.Struct` maps naturally to `JsonObject`, so the existing dynamic widget props can stay ergonomic.
- The hard cutover can be achieved without pushing generated protobuf message objects into React rendering.

### What was tricky to build

- The conversion boundary has to recursively convert page nodes and children while preserving dynamic `props`, `meta`, and `effects` payloads.
- The server handler tests had to be updated because successful responses are no longer wrapped in `{ data: ... }`.

### What warrants a second pair of eyes

- Whether `InteractionResult` should remain in the proto as a semantic alias or be removed now that `FlowState` is the canonical success envelope.
- Whether API errors should also move to protobuf envelopes in a follow-up.
- Whether `StartFlowRequest` and `GetFlowRequest` should be used in HTTP bodies or are primarily future RPC-compatible schema entries.

### What should be done in the future

- Run live devctl smoke after restarting backend and web.
- Verify seven-step routing projection, estimate/confirm edit links, and no footer toast overlap.
- Consider protobuf error envelopes if the API layer should become fully protobuf-defined, including failures.

### Code review instructions

Start with:

- `proto/fringe/dsl/v1/dsl.proto`
- `pkg/dslgoja/proto_convert.go`
- `pkg/server/handlers_dsl.go`
- `web/src/page-dsl/backendClient.ts`

Validate with:

```bash
go test ./... -count=1
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
```
