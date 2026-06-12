---
Title: Admin DSL Backend Author Guide
Ticket: HAIR-039
Status: active
Topics: [admin, dsl, backend, goja, protobuf]
DocType: reference
Intent: implementation-guide
---

# Admin DSL Backend Author Guide

Use the Go host package `pkg/admindsl` as the authoritative Admin DSL construction layer.

## Rules

- Build pages with Go host fluent builders.
- Expose builders to Goja through controlled host objects such as `admindsl.GojaModule()`.
- Do not reimplement schema validity in JavaScript helper code.
- Validate with `admindsl.ValidatePage` before transport.
- Use opaque action ids for dispatch trust. Semantic action targets are for policy/logging, not authorization.
- Keep application database schema, permissions, mutation semantics, and publish behavior outside the generic Admin DSL.

## Minimal backend flow

1. Create a session object with state and page version.
2. Render a page using `PageResource`, `Section`, `ResourceList`, `ResourceRow`, `Drawer`, `Form`, and action builders.
3. Register actions by assigning opaque ids.
4. Convert `FlowResult` to protobuf with `admindsl.FlowStateFromResult`.
5. Emit protobuf JSON via `protojson`.
6. On dispatch, reject stale page versions before applying the action.
7. Apply state transition and re-render.

Reference implementation:

- `pkg/admindsl/flow.go`
- `pkg/server/handlers_admin_dsl.go`
