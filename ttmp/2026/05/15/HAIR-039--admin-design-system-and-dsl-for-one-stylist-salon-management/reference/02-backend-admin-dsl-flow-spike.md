---
Title: Backend Admin DSL Flow Spike Notes
Ticket: HAIR-039
Status: active
Topics:
  - admin
  - dsl
  - backend
  - storybook
DocType: reference
Intent: implementation-notes
RelatedFiles:
  - Path: pkg/admindsl/flow.go
    Note: Backend-driven services/pricing Admin DSL flow spike with page versions and opaque action ids.
  - Path: pkg/admindsl/flow_test.go
    Note: Tests for flow transitions, stale page rejection, and validation-before-transport.
  - Path: web/src/admin-dsl/AdminDslServiceScenarios.stories.tsx
    Note: Storybook Services scenario catalog, including MSW-backed click-through stories.
---

# Backend Admin DSL Flow Spike Notes

The Phase 14 spike lives in `pkg/admindsl/flow.go`. It is intentionally small and focused. It proves that Admin DSL pages can be constructed by the Go host builder, validated before transport, assigned opaque action ids, and re-rendered after backend-owned state transitions.

This differs from the frontend-only Storybook fixture path in three ways.

1. **Construction authority**: the backend flow uses `pkg/admindsl` builders. TypeScript builders remain fixtures for Storybook and design exploration.
2. **Action identity**: backend pages receive opaque action ids (`admin_act_*`) in addition to semantic action target metadata. Dispatch uses the opaque id, not a trusted browser callback.
3. **Runtime validation**: malformed pages fail through `ValidatePage(...)` before a response is returned.

The spike models these transitions:

- open drawer,
- edit/select row,
- save success,
- save validation error,
- cancel,
- confirm delete,
- stale page rejection.

The current spike is Go-host-only. The next integration step is to expose these builders to Goja as controlled host objects/functions. That wrapper should call into `pkg/admindsl`; it should not duplicate schema validity rules in JavaScript.

The Phase 15 Storybook scenario catalog lives in `web/src/admin-dsl/AdminDslServiceScenarios.stories.tsx`. It includes static scenario stories plus MSW-backed click-through stories that post action events to `/api/admin-dsl/scenarios/services/events`. The MSW handlers live in `web/src/admin-dsl/mswHandlers.ts` and are registered in the global mock handler list.
