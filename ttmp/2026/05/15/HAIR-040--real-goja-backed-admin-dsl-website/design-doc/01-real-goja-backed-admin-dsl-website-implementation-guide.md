---
Title: Real Goja-backed Admin DSL Website Implementation Guide
Ticket: HAIR-040
Status: active
Topics:
  - admin
  - dsl
  - backend
  - frontend
  - goja
  - protobuf
  - storybook
DocType: design-doc
Intent: long-term
RelatedFiles:
  - Path: pkg/admindsl
    Note: Go-host Admin DSL builders, validation, protobuf conversion, and current flow spike.
  - Path: pkg/server/handlers_admin_dsl.go
    Note: Current Admin DSL protobuf/HTTP transport for the Go spike.
  - Path: web/src/admin-dsl
    Note: React renderer, backend client, Storybook catalogs, and MSW harness.
---

# Real Goja-backed Admin DSL Website Implementation Guide

## Executive Summary

HAIR-040 turns the Admin DSL from a Go-only backend spike plus Storybook fixtures into a real website path served by the application. The goal is a backend-authored services/pricing admin page that is implemented as a Goja flow source, built through Go-host Admin DSL builders, transported over the dedicated Admin DSL protobuf HTTP API, and rendered by the React Admin DSL renderer on a real frontend route.

The resulting architecture mirrors the existing intake flow, but it stays Admin-DSL-specific:

```text
pkg/admindsl/flows/services.flow.js
  -> Goja runtime with require("fringe/admin-dsl")
  -> Go-host builder-backed AdminPage
  -> Admin DSL validation
  -> AdminFlowState protobuf JSON
  -> web/src/admin-dsl/BackendAdminDslPage.tsx
  -> /admin/services
```

## Problem Statement

HAIR-039 created the necessary foundations:

- Go-host Admin DSL builders and validation,
- semantic actions,
- surfaces,
- resource/form lifecycle state,
- dedicated Admin DSL protobuf messages,
- HTTP start/get/dispatch endpoints,
- Storybook static/MSW/live-ready scenarios.

But the actual backend Admin DSL page is still represented by a Go spike (`ServicesFlowSession`) rather than a real flow source comparable to `pkg/dslgoja/flows/intake.flow.js`. The frontend also lacks a first-class website route that starts an Admin DSL flow and dispatches renderer events back to the backend.

## Proposed Solution

Add a focused Admin DSL Goja runtime that loads `pkg/admindsl/flows/services.flow.js`. The runtime exposes `require("fringe/admin-dsl")` as controlled Go host builder functions, plus a `ctx.action(...)` function for registering backend callbacks.

The server should keep the existing Admin DSL HTTP namespace:

```text
POST /api/admin-dsl/flows/{flowId}/start
GET  /api/admin-dsl/flows/{sessionId}
POST /api/admin-dsl/flows/{sessionId}/events
```

but replace the hardcoded Go spike for `fringe.admin.services.v1` with the Goja-backed Admin runtime.

The frontend should add a real page bridge:

```text
web/src/admin-dsl/BackendAdminDslPage.tsx
```

and mount it at:

```text
/admin/services
```

The SPA fallback already serves non-API routes, so the backend only needs the API endpoints. Vite/dev and embedded production serving both work through the existing web serving path.

## Design Decisions

### Decision 1: Keep Admin runtime separate from intake runtime

The intake runtime uses the generic page DSL schema. Admin pages have first-class `drawers`, `modals`, semantic action metadata, resource/form lifecycle state, and a dedicated protobuf contract. A focused Admin runtime avoids overloading `pkg/dslgoja` with Admin-specific page shape rules.

### Decision 2: Go host owns fluent builders

JavaScript flow authors should write fluent code, but the fluent objects must be Go host objects/functions. This gives Go control over schema validity, JSON safety, action metadata, and serialization.

### Decision 3: No compatibility wrappers

HAIR-040 follows the clean-cutover rule from HAIR-039. New surface code uses `surface.*` concepts exposed by the host module. Do not reintroduce legacy `admin.modal`, `admin.drawer`, or `admin.confirm` wrapper APIs.

### Decision 4: Website route is `/admin/services`

This is the simplest route for the real Admin DSL page. Authorization can later move or guard it under stylist/admin route policy without changing the flow/runtime design.

### Decision 5: Transport remains protobuf JSON

The frontend client should continue using generated `@bufbuild/protobuf` bindings and `fromJson`/`toJson`, matching the existing intake DSL transport style.

## Implementation Plan

### Phase 0: Ticket setup and planning

Create HAIR-040 docs, tasks, diary, and this implementation guide.

### Phase 1: Admin Goja runtime skeleton

Add `pkg/admindsl/runtime.go`, session state, render/dispatch lifecycle, action registration, stale page handling, and validation.

### Phase 2: Goja host module and flow source

Add `require("fringe/admin-dsl")` backed by Go host builders. Add `pkg/admindsl/flows/services.flow.js` and embed it.

### Phase 3: Replace HTTP spike store with runtime-backed store

Update `pkg/server/handlers_admin_dsl.go` to start/resume/dispatch real Admin Goja sessions instead of `ServicesFlowSession`.

### Phase 4: Frontend real route bridge

Add `BackendAdminDslPage.tsx`, wire renderer dispatch to `postAdminDslEvent`, and mount `/admin/services` in the web app.

### Phase 5: Storybook/live smoke and screenshot support

Add a live-backend story or dev page notes. Keep deterministic screenshots on static/MSW stories.

### Phase 6: Validation and docs

Run full Go/web validation, update diary/changelog, relate files, and commit each phase.

## Flow Source Shape

The Admin flow source should look like this conceptually:

```js
const admin = require("fringe/admin-dsl");

function initialState() {
  return { mode: "list", selectedServiceId: null, errors: {} };
}

function render(ctx) {
  const state = ctx.state;

  const open = ctx.action("service.open", (event) => {
    state.mode = "editing";
    state.selectedServiceId = event.value && event.value.id || "cut";
    return render(ctx);
  });

  const save = ctx.action("service.save", () => {
    state.mode = "saved";
    state.errors = {};
    return render(ctx);
  });

  return admin.pageResource("admin-services", "Services & pricing")
    .Shell("resource", { eyebrow: "Backend Admin DSL" })
    .Content(/* nodes */)
    .MustBuild();
}
```

## Validation Checklist

- `go test ./... -count=1`
- `cd web && npx tsc --noEmit`
- `cd web && pnpm test -- --runInBand`
- Manual smoke:
  - start server,
  - open `/admin/services`,
  - open a row,
  - save/cancel,
  - verify page version changes and stale actions are rejected.
