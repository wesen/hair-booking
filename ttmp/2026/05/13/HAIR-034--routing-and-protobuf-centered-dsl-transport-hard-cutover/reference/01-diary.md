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

**Commit (code):** c6c2be0 — "HAIR-034 Step 2: Cut DSL transport to protobuf FlowState"

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


---

## Step 3: Restart live stack and smoke protobuf JSON responses

Restarted the devctl-managed backend and web services after the protobuf transport cutover. The backend start endpoint now returns a direct protobuf JSON `FlowState` object rather than the previous `{ data: ... }` envelope, and the Vite live route responds successfully.

This was a transport-level smoke, not a full browser click-through. The remaining live checks are to manually verify seven-step routing projection, estimate/confirm edit links, and the removed dispatch toast behavior in the browser.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** After the hard cutover, restart the live services and confirm the new protobuf JSON transport shape is active.

**Inferred user intent:** Ensure the implementation is not only test-passing but also loaded in the devctl-managed live demo.

**Commit (code):** N/A — live smoke/documentation step only.

### What I did

- Ran `devctl restart hair-booking-backend`.
- Ran `devctl restart hair-booking-web`.
- Posted to `/api/dsl/flows/fringe.intake.v1/start`.
- Confirmed the response shape is direct protobuf JSON:
  - `sessionId`,
  - `pageVersion`,
  - `page.id`,
  - no top-level `data` envelope.
- Confirmed `/dsl-goja-demo` returns HTTP 200.
- Posted a protobuf JSON interaction event to the session events endpoint and received a direct `FlowState` response.

### Why

The server and frontend tests prove the contract in-process. The devctl restart and curl smoke prove that the live backend process is serving the new direct protobuf JSON response shape.

### What worked

Observed start smoke output:

```text
flow_289f9937-91bc-484f-a322-f09cf9af5dd3 1 intake-service hasData False
web:200
```

Observed event smoke output:

```text
flow_289f9937-91bc-484f-a322-f09cf9af5dd3 2 intake-service hasData False
```

### What didn't work

- N/A for transport smoke.

### What I learned

- The direct protobuf JSON hard cutover is active in the devctl backend: successful responses are no longer wrapped in `apiEnvelope.data`.

### What was tricky to build

- The event smoke needs a live backend action id from the current page, because action ids are page-version scoped and cannot be invented by the client.

### What warrants a second pair of eyes

- Browser-level behavior still needs manual verification for routing, edit links, and footer flashing.

### What should be done in the future

- Open `/dsl-goja-demo`, click through all seven pages, test estimate/confirm edit links, and observe that the dispatch toast no longer overlaps the CTA.

### Code review instructions

No code changed in this step. Confirm live state with:

```bash
curl -sS -X POST http://127.0.0.1:19080/api/dsl/flows/fringe.intake.v1/start | jq '{sessionId,pageVersion,pageId:.page.id,hasData:has("data")}'
curl -sS -o /tmp/hair034-web.html -w 'web:%{http_code}\n' http://127.0.0.1:5175/dsl-goja-demo
```


---

## Step 4: Omit undefined protobuf Value fields for value-less edit events

Fixed a frontend protobuf JSON encoding bug discovered while clicking `edit` links. Edit events do not carry a `value`, but the frontend client passed `value: undefined` into `fromJson(InteractionEventSchema, ...)`. The protobuf JSON decoder rejects `undefined` for `google.protobuf.Value`; the correct representation is to omit the field entirely.

The event encoder now builds a protobuf JSON object explicitly and only includes optional `value` and `meta` fields when they are actually defined. This preserves value-bearing events such as segmented/chip changes while allowing value-less `edit`, `next`, `back`, and `skip` actions to encode cleanly.

### Prompt Context

**User prompt (verbatim):** "debug.ts:14:11
[dsl] IntakeShell next-button identity 
Object { instance: "opu8s1tzlhp", sameAsPreviousRender: true, label: "Pick a time →", element: button }
debug.ts:14:11
[dsl] BackendDslPage dispatch:error Error: cannot decode message google.protobuf.Value from JSON undefined
    valueFromJson from-json.js:598
    tryWktFromJson from-json.js:444
    readMessage from-json.js:118
    readMessageField from-json.js:228
    readField2 from-json.js:167
    readMessage from-json.js:139
    fromJson from-json.js:55
    postDslEvent backendClient.ts:95
    backendDispatch BackendDslPage.tsx:92
    dispatchAction render.tsx:84
    onEdit render.tsx:214
    React 13
    <anonymous> main.tsx:9
debug.ts:14:11
[dsl] DslPageRenderer render 
Object { pageId: "intake-estimate", shellKind: "intake", nodeKeys: (2) […], shellActions: {…} }

when i click edit"

**Assistant interpretation:** Clicking an edit link triggers a value-less backend event, and the new protobuf client encoding incorrectly serializes the absent value as `undefined`.

**Inferred user intent:** Fix edit-link dispatch under the protobuf hard cutover so value-less actions work.

**Commit (code):** ba7a895 — "HAIR-034 Step 4: Omit undefined protobuf event values"

### What I did

- Updated `web/src/page-dsl/backendClient.ts` with `interactionEventJson(...)`.
- The helper constructs the protobuf JSON event explicitly.
- It only includes `value` if `event.value !== undefined`.
- It only includes `meta` if `event.meta !== undefined`.
- Added a TypeScript protobuf contract test for value-less interaction events.

### Why

`google.protobuf.Value` represents a JSON value, but `undefined` is not valid JSON. Omitted optional fields are valid; `undefined` fields are not.

### What worked

Validation passed:

```bash
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
cd ..
go test ./... -count=1
```

Frontend tests now include 24 passing tests.

### What didn't work

- Before this patch, `fromJson(InteractionEventSchema, { value: undefined })` failed with:

```text
cannot decode message google.protobuf.Value from JSON undefined
```

### What I learned

- The protobuf hard cutover requires a stricter JSON boundary than the previous `JSON.stringify` path. The client must omit absent optional fields instead of carrying JavaScript `undefined` into protobuf decoding.

### What was tricky to build

- The application-level `JsonValue` type and the protobuf library's `JsonValue` type are distinct. The cleanest boundary is to construct a simple record and cast only once to `ProtoJsonValue` at the protobuf call site.

### What warrants a second pair of eyes

- Whether the frontend should also deep-strip `undefined` from `meta` objects if future metadata contains nested optional properties.

### What should be done in the future

- Restart the web service and retest estimate/confirm edit links in the browser.
- If another protobuf JSON error appears, inspect whether it is another JavaScript-only value crossing the protobuf boundary.

### Code review instructions

Review:

- `web/src/page-dsl/backendClient.ts`
- `web/src/page-dsl/ProtobufContract.test.ts`

Validate with:

```bash
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
cd ..
go test ./... -count=1
```

---

## Step 5: Finish protobuf cleanup with DSL error envelopes

Completed the protobuf transport cleanup for the DSL API. Successful responses were already direct protobuf JSON `FlowState` objects; this step makes DSL endpoint failures protobuf JSON too by adding a `DslError` message and returning it from the DSL handlers. The generated `InteractionResult` proto message was removed so `FlowState` is the single canonical transport success envelope.

The Goja runtime still keeps its internal `InteractionResult` struct because that is an in-process runtime concept, not a transport schema. The proto no longer exports a duplicate generated transport message with the same shape.

### Prompt Context

**User prompt (verbatim):** "works, now finish up all the protobuf"

**Assistant interpretation:** The live browser smoke passed; finish the remaining protobuf cleanup work, especially error envelopes and duplicate proto messages.

**Inferred user intent:** Make the DSL API consistently protobuf-defined across success and error transport shapes and remove leftover schema duplication from the hard cutover.

**Commit (code):** b89ef37 — "HAIR-034 Step 5: Finish protobuf DSL envelopes"

### What I did

- Added `DslError` to `proto/fringe/dsl/v1/dsl.proto`.
- Removed generated proto `InteractionResult` from `dsl.proto`; `FlowState` is now the canonical success envelope.
- Regenerated Go and TypeScript protobuf code with `buf generate`.
- Updated `pkg/server/handlers_dsl.go`:
  - added `writeDSLProtoError`,
  - switched DSL endpoint failures from the generic API error envelope to direct protobuf JSON `DslError`,
  - kept successful responses as direct protobuf JSON `FlowState`.
- Updated `web/src/page-dsl/backendClient.ts`:
  - decodes non-2xx DSL responses via `DslErrorSchema`,
  - preserves `DslApiError.code` for recovery logic such as `dsl_session_not_found`.
- Updated Go and TypeScript tests for protobuf error decoding.
- Marked the live smoke tasks complete based on the user's confirmation that the browser flow works.

### Why

After the hard cutover, successes were protobuf-defined but errors were still in the old hand-written envelope shape. That left one remaining split contract. This step makes the DSL API transport consistently protobuf-defined for both success and failure payloads.

### What worked

Validation passed:

```bash
go test ./pkg/server ./pkg/dslgoja -count=1
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
cd ..
go test ./... -count=1
```

Frontend tests now include 25 passing tests.

### What didn't work

- N/A.

### What I learned

- It is cleaner to make only the DSL endpoints return protobuf errors rather than changing the global `writeAPIError` helper, because the rest of the product API still uses the older JSON envelope.

### What was tricky to build

- The server has a shared generic error helper used by many non-DSL endpoints. The protobuf cleanup needed a DSL-specific error writer to avoid unintentionally changing unrelated APIs.
- `writeProtoJSON` cannot call the protobuf DSL error writer on marshal failure without risking recursive failure, so it falls back to `http.Error` only in the unlikely case that protobuf marshaling itself fails.

### What warrants a second pair of eyes

- Whether `StartFlowRequest` and `GetFlowRequest` should be consumed by the current HTTP handlers now, or remain as RPC-compatible schema entries while path params remain canonical.
- Whether the runtime's internal `InteractionResult` should eventually be renamed to avoid confusion with the removed proto message.

### What should be done in the future

- Consider adding a small browser smoke automation that asserts no console protobuf errors during edit-link clicks.
- Begin Phase D host modules once routing/protobuf work is accepted.

### Code review instructions

Review:

- `proto/fringe/dsl/v1/dsl.proto`
- `pkg/server/handlers_dsl.go`
- `web/src/page-dsl/backendClient.ts`
- `pkg/server/handlers_dsl_test.go`
- `web/src/page-dsl/ProtobufContract.test.ts`

Validate with:

```bash
go test ./... -count=1
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
```
