# Changelog

## 2026-05-13

- Initial workspace created


## 2026-05-13

Step 1: Created HAIR-034, wrote the routing/session and protobuf-centered hard cutover guide, related key backend/frontend/proto files, validated frontmatter, and uploaded the guide bundle to reMarkable.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/design-doc/01-routing-sessions-and-protobuf-centered-dsl-transport-hard-cutover-guide.md — Initial design and implementation guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/reference/01-diary.md — Diary and upload record
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/tasks.md — Initial phased task list


## 2026-05-13

Step 2: Hard-cut DSL success transport (commit c6c2be0) to protobuf JSON FlowState, added schema envelopes, Go conversion helpers, server protobuf encoding/decoding, frontend generated-message client decoding/encoding, and Go/TS contract tests.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/proto_convert.go — Runtime/protobuf conversion boundary
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/protobuf_contract_test.go — Go protobuf conversion/JSON contract tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/handlers_dsl.go — Server success responses and event decoding now use protobuf JSON
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/proto/fringe/dsl/v1/dsl.proto — Central transport schema now includes FlowState and request envelopes
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/ProtobufContract.test.ts — TypeScript FlowState and event protobuf contract tests
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/backendClient.ts — Frontend client uses generated protobuf schemas at the HTTP boundary


## 2026-05-13

Step 3: Restarted devctl backend/web and smoke-tested direct protobuf JSON FlowState responses from start/event endpoints plus the live Vite route.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/reference/01-diary.md — Live smoke record
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/tasks.md — Marked devctl restart complete


## 2026-05-13

Step 4: Fixed value-less edit events (commit dc9f01e) under protobuf JSON by omitting undefined optional value/meta fields before fromJson(InteractionEventSchema); added TS contract coverage and validated Go/web tests.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/13/HAIR-034--routing-and-protobuf-centered-dsl-transport-hard-cutover/reference/01-diary.md — Diary Step 4
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/ProtobufContract.test.ts — Covers value-less interaction events
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/backendClient.ts — Omits undefined optional protobuf JSON fields for edit/next/back/skip events

