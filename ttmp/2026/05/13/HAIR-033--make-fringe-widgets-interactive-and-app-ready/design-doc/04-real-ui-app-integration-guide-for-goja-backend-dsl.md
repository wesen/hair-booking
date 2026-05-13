---
Title: Real UI App Integration Guide for Goja Backend DSL
Ticket: HAIR-033
Status: active
Topics:
    - frontend
    - backend
    - react
    - goja
    - dsl
    - api-design
    - state-management
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Current two-step service/color Goja flow and future expansion target
    - Path: pkg/dslgoja/modules_dsl.go
      Note: Goja require('fringe/dsl') builder module referenced by the flow authoring sections
    - Path: pkg/dslgoja/runtime.go
      Note: Flow session
    - Path: pkg/dslgoja/schema.go
      Note: Go JSON page
    - Path: pkg/server/handlers_dsl.go
      Note: HTTP start/get/event endpoint implementation referenced by the API section
    - Path: web/.gitignore
      Note: Ignores generated Vite/TypeScript build artifacts
    - Path: web/index.html
      Note: Vite HTML entrypoint for the live Goja DSL viewing page
    - Path: web/src/App.tsx
      Note: Minimal app shell for the live Goja DSL route
    - Path: web/src/LiveDslDemoApp.tsx
      Note: Phone-frame live backend DSL demo with session/page debug panel
    - Path: web/src/main.tsx
      Note: React bootstrap for the live Goja DSL app; avoids StrictMode duplicate flow starts
    - Path: web/src/page-dsl/BackendDslPage.tsx
      Note: Frontend container that starts/fetches backend sessions and posts interaction events
    - Path: web/src/page-dsl/backendClient.ts
      Note: Fetch client for DSL backend endpoints
    - Path: web/src/page-dsl/render.tsx
      Note: Frontend JSON interpreter and backend action-ref dispatch implementation
    - Path: web/vite.config.ts
      Note: |-
        Existing Vite dev proxy needed for the real viewing page
        Configurable backend proxy via HAIR_BOOKING_BACKEND_URL for live DSL testing
ExternalSources: []
Summary: Intern-facing guide for turning the Goja-backed DSL runtime into a real browser-visible app route, including current architecture, APIs, file map, phases, and production-hardening scope.
LastUpdated: 2026-05-13T10:35:00-04:00
WhatFor: 'Use this guide to understand the Goja backend DSL system and implement the next phase: a real Vite page that renders BackendDslPage against the live Go server.'
WhenToUse: Read this before changing pkg/dslgoja, pkg/server/handlers_dsl.go, web/src/page-dsl, or before adding the live DSL demo/intake route.
---



# Real UI App Integration Guide for Goja Backend DSL

## Executive Summary

The Fringe booking project now has the core pieces of a backend-driven UI runtime. A JavaScript flow runs inside Go using Goja, builds a JSON page with a small DSL, registers opaque backend action ids, and returns that page to the browser. React renders the JSON page. When a user clicks a widget, the browser posts the opaque action id back to Go. Go looks up the registered Goja callback, invokes it, mutates flow state, renders the next page, and returns updated JSON to React.

What is missing is not the backend mechanism. The runtime and HTTP endpoints already exist. The missing piece is a real browser route outside Storybook: a small Vite application entrypoint that mounts `BackendDslPage` and points it at the live Go backend through `/api/dsl/...`. Once that route exists, the team can test the action-based approach by clicking real UI controls in a browser and watching the Goja session update the page.

This guide is written for a new intern. It explains the moving parts, the files to read, the API contract, the control flow, the known prototype limitations, and the implementation phases needed to get a real viewing page working. It also scopes the next larger parts of the system: full flow expansion, domain-service integration, session lifecycle, and auth/session ownership.

## Problem Statement

The project currently has three related but separate surfaces:

- A React component library and Storybook pages that prove the Fringe design system.
- A frontend JSON page DSL renderer that can render a page object into real React widgets.
- A Goja backend DSL runtime that can author pages and register callbacks in backend-hosted JavaScript.

The architecture is close to an end-to-end product path, but a developer still cannot open a normal app URL and click through a backend-driven intake flow. Storybook has a mocked backend-shaped flow, and curl can test the live backend endpoints, but there is no Vite route that mounts the real `BackendDslPage` against the Go server.

That matters because the main design claim is interactive, not only structural. The system claims that browser clicks can be represented as action events, sent to the backend, dispatched into Goja callbacks, and reflected back in the UI. We need a real browser page to validate that claim under normal frontend conditions: fetch calls, Vite proxying, React rendering, event handlers, browser crypto, page state updates, error overlays, and visual layout.

## The Mental Model

The system is easiest to understand if you treat the browser as a renderer and the backend as the owner of flow state. The browser does not know what "next" means. It does not know how to choose the next step. It does not know what a selected color service should do to the intake state. It only knows that a widget was changed and that the page JSON included an opaque action id for that change.

The backend owns these responsibilities:

- Create a flow session.
- Host one Goja VM per active flow session.
- Store JSON-serializable flow state in `ctx.state`.
- Render a page from the current state.
- Register callbacks while rendering.
- Replace the current action registry when a render succeeds.
- Dispatch browser events to the current callback for the action id.
- Return a fresh page snapshot after every meaningful interaction.

The frontend owns these responsibilities:

- Fetch the initial page.
- Render the page JSON using existing React components.
- Call `backendDispatch` when a widget with a backend action ref changes.
- Attach `eventId` and `pageVersion` to events.
- Replace the current page with the backend response.
- Display loading, dispatching, and error/effect feedback.

The boundary is JSON. That boundary is the point of the system. Flow authors can write JavaScript in Goja; designers can keep React widgets in Storybook; the two meet at a stable page/event contract.

## Architecture Diagram

```text
+-----------------------------+
| Browser / Vite React App    |
|                             |
|  BackendDslPage             |
|    - start or fetch session |
|    - stores pageVersion     |
|    - provides dispatch      |
|             |               |
|             v               |
|  DslPageRenderer            |
|    - renders JSON nodes     |
|    - maps nodes to widgets  |
|    - reads props.actions    |
+-------------|---------------+
              |
              | POST /api/dsl/flows/{sessionId}/events
              v
+-------------|---------------+
| Go HTTP Server              |
|                             |
|  handlers_dsl.go            |
|    - start flow             |
|    - get snapshot           |
|    - post event             |
|             |               |
|             v               |
|  dslFlowStore               |
|    - in-memory sessions     |
+-------------|---------------+
              |
              v
+-------------|---------------+
| pkg/dslgoja                 |
|                             |
|  FlowSession                |
|    - Goja VM                |
|    - ctx.state              |
|    - CurrentActions         |
|    - RetiredActions         |
|    - ProcessedEvents        |
|             |               |
|             v               |
|  intake.flow.js             |
|    - initialState()         |
|    - render(ctx)            |
|    - ctx.action callbacks   |
+-----------------------------+
```

A page is not a React route. A page is JSON returned by the backend. A button is not a hard-coded React transition. A button is a widget whose props contain an action reference. The backend decides what happens when that action reference is posted back.

## Current File Map

Read these files in this order when onboarding.

### Backend runtime files

| File | Why it matters |
|---|---|
| `pkg/dslgoja/schema.go` | Defines the Go JSON contract for pages, nodes, actions, events, effects, and results. Keep this aligned with `web/src/page-dsl/schema.ts`. |
| `pkg/dslgoja/runtime.go` | Implements `Runtime`, `FlowSession`, render transactions, callback dispatch, stale-page handling, duplicate event handling, and page export. |
| `pkg/dslgoja/modules_dsl.go` | Installs `require("fringe/dsl")` into Goja and exposes builder helpers such as `page`, `n.segmented`, `n.chipGroup`, and `n.serviceOptionGroup`. |
| `pkg/dslgoja/flows/intake.flow.js` | The current two-step JavaScript flow. This is where a flow author writes state transitions and page construction code. |
| `pkg/dslgoja/flows.go` | Embeds `intake.flow.js` so the Go server can start `fringe.intake.v1` without reading from disk at runtime. |

### Backend API files

| File | Why it matters |
|---|---|
| `pkg/server/handlers_dsl.go` | Exposes start/get/event endpoints and stores active flow sessions in an in-memory store. |
| `pkg/server/http.go` | Registers the DSL routes on the main HTTP mux. |
| `pkg/server/handlers_dsl_test.go` | Tests the real HTTP flow: start, extract action id, post event, verify updated page JSON. |

### Frontend DSL files

| File | Why it matters |
|---|---|
| `web/src/page-dsl/schema.ts` | TypeScript version of the page/event/action contract. This file defines `DslActionRef`, `DslBackendEvent`, and `DslRenderContext`. |
| `web/src/page-dsl/render.tsx` | The interpreter that maps JSON nodes to React components. This is where backend action refs are converted into `backendDispatch` calls. |
| `web/src/page-dsl/backendClient.ts` | Fetch client for `/api/dsl/flows/...` endpoints. |
| `web/src/page-dsl/BackendDslPage.tsx` | React container that starts/fetches a backend flow, renders the current page, and posts widget events back to Go. |
| `web/src/page-dsl/BackendDslPage.test.tsx` | Tests backend action refs and `BackendDslPage` client behavior. |
| `web/src/page-dsl/BackendDslPage.stories.tsx` | Storybook demo using a mocked backend-shaped client. Useful for UI review, but not a live backend test. |

### App shell files that still need to exist

The fresh `web/` package currently has Vite and Storybook configuration, but no normal app entrypoint. The real viewing page requires these files:

| File | Purpose |
|---|---|
| `web/index.html` | Vite HTML entrypoint containing the root DOM element. |
| `web/src/main.tsx` | React bootstrap that calls `createRoot(...).render(...)`. |
| `web/src/App.tsx` | Minimal app shell that renders a route or direct view containing `BackendDslPage`. |
| Optional: `web/src/LiveDslDemoApp.tsx` | A focused development page that wraps `BackendDslPage` in the 390×844 phone frame and optional debug panel. |

## The Page JSON Contract

The backend emits a page shaped like this:

```json
{
  "schemaVersion": 1,
  "id": "intake-service",
  "title": "Service",
  "shell": {
    "kind": "intake",
    "props": {
      "step": 1,
      "total": 2,
      "eyebrow": "Chapter I · The Ask",
      "title": "What brings you in?",
      "actions": {
        "next": { "id": "act_...", "event": "next" },
        "skip": { "id": "act_...", "event": "skip" }
      }
    }
  },
  "nodes": [
    {
      "kind": "segmented",
      "meta": { "id": "category-tabs" },
      "props": {
        "value": "color",
        "options": [
          { "value": "cut", "label": "Cut" },
          { "value": "color", "label": "Color" },
          { "value": "extensions", "label": "Extensions" }
        ],
        "actions": {
          "change": { "id": "act_...", "event": "change" }
        }
      }
    }
  ]
}
```

Important rules:

- `schemaVersion` is currently `1`.
- `id` identifies the logical page, such as `intake-service` or `intake-color`.
- `shell` describes page chrome and footer navigation.
- `nodes` describe content widgets.
- `meta.id` is the stable node id used for tests, debugging, and dispatch validation.
- `props.actions` contains backend action refs.
- The browser must treat action ids as opaque. It sends them back; it does not interpret them.

## The Event API Contract

When a user interacts with a backend-action widget, the frontend posts an event like this:

```json
{
  "eventId": "evt_123",
  "pageVersion": 1,
  "nodeId": "category-tabs",
  "nodeKind": "segmented",
  "actionId": "act_456",
  "event": "change",
  "value": "extensions",
  "meta": {
    "item": { "value": "extensions", "label": "Extensions" }
  }
}
```

The server fills `sessionId` from the URL path. The browser does not need to include it in the body.

Field meanings:

| Field | Meaning |
|---|---|
| `eventId` | Browser-generated idempotency key. Reposting the same event id returns the cached result. |
| `pageVersion` | The page version the browser believes it is interacting with. Prevents old pages from mutating current state. |
| `nodeId` | Stable node id, normally from `node.meta.id`. |
| `nodeKind` | Renderer node kind, such as `segmented`, `chipGroup`, or `intakeShell`. |
| `actionId` | Opaque backend callback id from `props.actions[eventName].id`. |
| `event` | Event name such as `change`, `next`, `back`, `skip`, `upload`, `remove`, or `edit`. |
| `value` | The selected value or control payload. |
| `meta` | Optional widget metadata. Useful for richer callbacks and debugging. |

## API Reference

### Start a flow

```http
POST /api/dsl/flows/{flowId}/start
```

Currently supported flow id:

```text
fringe.intake.v1
```

Response:

```json
{
  "data": {
    "sessionId": "flow_...",
    "pageVersion": 1,
    "page": { "schemaVersion": 1, "id": "intake-service", "nodes": [] }
  }
}
```

Errors:

| Status | Code | Meaning |
|---|---|---|
| `404` | `dsl_flow_not_found` | Unknown flow id. |
| `500` | `dsl_flow_start_failed` | Goja runtime failed to load or render the flow. |

### Get current flow snapshot

```http
GET /api/dsl/flows/{sessionId}
```

Response:

```json
{
  "data": {
    "sessionId": "flow_...",
    "pageVersion": 2,
    "page": { "id": "intake-color" }
  }
}
```

Errors:

| Status | Code | Meaning |
|---|---|---|
| `404` | `dsl_session_not_found` | The in-memory session id is unknown. |

### Dispatch an event

```http
POST /api/dsl/flows/{sessionId}/events
Content-Type: application/json
```

Body:

```json
{
  "eventId": "evt_manual_1",
  "pageVersion": 1,
  "nodeId": "category-tabs",
  "nodeKind": "segmented",
  "actionId": "act_...",
  "event": "change",
  "value": "extensions"
}
```

Response:

```json
{
  "data": {
    "sessionId": "flow_...",
    "pageVersion": 2,
    "page": { "id": "intake-service" },
    "effects": []
  }
}
```

Errors:

| Status | Code | Meaning |
|---|---|---|
| `400` | `invalid_dsl_event` | Request body is not valid JSON for an interaction event. |
| `400` | `dsl_dispatch_failed` | Unknown action id, wrong node id, or another dispatch validation failure. |
| `404` | `dsl_session_not_found` | The session id is unknown. |

Stale page events are not currently returned as HTTP errors. They return the current page with an informational effect. This lets the UI recover when an old tab, double click, or slow network response leaves the browser with outdated page state.

## Backend Runtime Control Flow

The core backend path is in `pkg/dslgoja/runtime.go`.

### Starting a flow

```text
Runtime.StartFlow(ctx, flowID, source)
  create new goja.Runtime
  install require("fringe/dsl")
  run wrapped flow source
  create FlowSession
  call initialState() if present
  call session.Render(ctx)
  return session and first InteractionResult
```

Pseudocode:

```go
func StartFlow(ctx, flowID, source) {
    vm := goja.New()
    installDSLModule(vm)

    flow := vm.RunString(wrapFlowSource(source)).ToObject(vm)

    session := &FlowSession{
        ID: "flow_" + uuid.NewString(),
        FlowID: flowID,
        VM: vm,
        CurrentActions: map[string]ActionRegistration{},
        RetiredActions: map[string]RetiredActionInfo{},
        ProcessedEvents: map[string]InteractionResult{},
    }

    session.state = call initialState() or {}
    result := session.Render(ctx)
    return session, result
}
```

### Rendering a page

A render is transactional. Actions created during render are not installed immediately into `CurrentActions`. They are collected in `NextActions`. Only after page export succeeds does the session retire old actions, increment the page version, install new actions, and store the current page.

```text
renderLocked(ctx)
  tx := new render transaction
  activeTx = tx
  call JS render(ctxObject)
  export return value as Page
  commit transaction
```

The invariant is simple: a broken render must not leave the session with half-installed callbacks.

### Dispatching an event

Dispatch validates the event before invoking JavaScript:

```text
Dispatch(ctx, event)
  lock session
  if eventId was processed: return cached result
  if pageVersion is stale: return current page + info effect
  find current action by event.actionId
  reject unknown action ids
  reject mismatched node ids
  set active render transaction
  convert Go event to lowerCamelCase JS object
  call Goja callback(event)
  export returned page
  commit transaction
  cache result by eventId
  return result
```

Pseudocode:

```go
func (s *FlowSession) Dispatch(ctx context.Context, event InteractionEvent) (*InteractionResult, error) {
    s.mu.Lock()
    defer s.mu.Unlock()

    if cached, ok := s.ProcessedEvents[event.EventID]; ok {
        return &cached, nil
    }

    if event.PageVersion != s.Version {
        return s.stalePageResult("This page was already updated."), nil
    }

    action, ok := s.CurrentActions[event.ActionID]
    if !ok {
        if retired(event.ActionID) {
            return s.stalePageResult("This action is no longer active."), nil
        }
        return nil, fmt.Errorf("unknown action")
    }

    if action.NodeID != "" && event.NodeID != "" && action.NodeID != event.NodeID {
        return nil, fmt.Errorf("action belongs to another node")
    }

    tx := newRenderTransaction()
    s.activeTx = tx
    value := call action.Callback(jsEvent)
    page := exportPageValue(value)
    result := s.commitRenderTransaction(tx, page, nil)
    s.ProcessedEvents[event.EventID] = *result
    return result, nil
}
```

## JavaScript Flow Authoring Model

The current flow source lives in:

```text
pkg/dslgoja/flows/intake.flow.js
```

It exports two important functions:

```js
function initialState() {
  return {
    step: "service",
    category: "color",
    service: "highlights",
    tones: ["dimensional"],
    damage: 2,
  };
}

function render(ctx) {
  switch (ctx.state.step) {
    case "color":
      return colorStep(ctx);
    case "service":
    default:
      return serviceStep(ctx);
  }
}
```

A flow step builds a page with `require("fringe/dsl")`:

```js
const { page, n } = require("fringe/dsl");

function serviceStep(ctx) {
  return page("intake-service", "Service")
    .intake({
      step: 1,
      total: 2,
      eyebrow: "Chapter I · The Ask",
      title: "What brings you in?",
      actions: {
        next: ctx.action("next", function () {
          return goto(ctx, "color");
        }, "next"),
      },
    })
    .add(
      n.segmented([...], ctx.state.category, {
        actions: {
          change: ctx.action("setCategory", function (event) {
            ctx.state.category = event.value;
            return render(ctx);
          }, "change"),
        },
      }).id("category-tabs")
    )
    .toJSON();
}
```

The key pattern is:

1. Read current state from `ctx.state`.
2. Build nodes that reflect that state.
3. Register callbacks with `ctx.action(name, fn, eventName)`.
4. In callbacks, mutate `ctx.state` and return `render(ctx)`.

Do not store callbacks in `ctx.state`. Do not store Go objects in `ctx.state`. Keep state JSON-serializable.

## Frontend Renderer Control Flow

The renderer lives in:

```text
web/src/page-dsl/render.tsx
```

It maps `node.kind` to React components. For backend-backed interactions, it reads `props.actions[eventName]` and calls `context.backendDispatch`.

Pseudocode:

```ts
function dispatchAction(context, node, props, eventName, localKey, value, meta) {
  const ref = props.actions?.[eventName];

  if (ref && context.backendDispatch) {
    return context.backendDispatch({
      nodeId: node.meta?.id ?? "",
      nodeKind: node.kind,
      actionId: ref.id,
      event: ref.event,
      value,
      meta,
    });
  }

  const localActionName = props[localKey];
  if (localActionName) {
    return context.actions?.[localActionName]?.({ node, action: localActionName, value, meta });
  }
}
```

This dual behavior is important. Storybook and local examples can keep using local action names. Backend pages can use opaque refs. The renderer chooses backend refs first so production behavior is authoritative when both are present.

## BackendDslPage Control Flow

`BackendDslPage` is the frontend session container. It should stay small. Its job is transport, not business logic.

File:

```text
web/src/page-dsl/BackendDslPage.tsx
```

Current behavior:

```text
mount
  if sessionId prop exists:
    GET /api/dsl/flows/{sessionId}
  else:
    POST /api/dsl/flows/{flowId}/start

render
  show loading/error state if needed
  render DslPageRenderer(page, { backendDispatch })

dispatch
  receive DslBackendEvent from renderer
  attach eventId = crypto.randomUUID()
  attach pageVersion = current state.pageVersion
  POST /api/dsl/flows/{sessionId}/events
  replace state with response
```

Pseudocode:

```tsx
function BackendDslPage({ flowId = "fringe.intake.v1", sessionId }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const promise = sessionId
      ? getDslFlow(sessionId)
      : startDslFlow(flowId);
    promise.then(setState).catch(setError);
  }, [flowId, sessionId]);

  const context = {
    backendDispatch: async (event) => {
      const next = await postDslEvent(state.sessionId, {
        ...event,
        eventId: crypto.randomUUID(),
        pageVersion: state.pageVersion,
      });
      setState(next);
    },
  };

  return <DslPageRenderer page={state.page} context={context} />;
}
```

`BackendDslPage` should not decide what step comes next. It should not know that `next` from service goes to color. That belongs in Goja.

## What We Need for a Real Viewing Page

A real viewing page means a normal browser URL that runs the live React app and talks to the live Go backend. It does not mean production-ready auth or full booking flow. The first goal is narrower: prove that real browser interactions are dispatched to Goja and reflected back in the UI.

The minimum implementation needs four things:

1. A Vite HTML entrypoint.
2. A React bootstrap file.
3. An app component that renders `BackendDslPage`.
4. A documented run mode that starts Go on `8080` and Vite on `5173` with `/api` proxied to Go.

### Proposed first route

Use a dev/demo page first:

```text
/dsl-goja-demo
```

The route can be implemented without a router by checking `window.location.pathname`, or with a tiny internal route switch. Since the current `web/` package does not use `react-router`, do not add a router dependency just for this demo unless we decide the app shell needs it.

Recommended first version:

```tsx
export function App() {
  const path = window.location.pathname;

  if (path === "/" || path === "/dsl-goja-demo") {
    return <LiveDslDemoApp />;
  }

  return <LiveDslDemoApp />;
}
```

This keeps the first integration small. A later app shell can add routing properly.

### Phone-frame wrapper

Storybook already has a phone-frame decorator. A real app page can use the same visual idea, but it should live in app code rather than depending on Storybook.

```tsx
function LiveDslDemoApp() {
  return (
    <div style={pageBackground}>
      <div style={phoneFrame}>
        <BackendDslPage flowId="fringe.intake.v1" />
      </div>
    </div>
  );
}
```

The phone frame is not part of the DSL. It is a development viewing frame. The backend returns content; the app shell decides how to display that content.

## Implementation Phase 1: Create the Real Viewing Page

### Goal

Create a browser-visible Vite app that renders the live backend DSL flow.

### Files to add

```text
web/index.html
web/src/main.tsx
web/src/App.tsx
web/src/LiveDslDemoApp.tsx
```

### `web/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fringe Goja DSL Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `web/src/main.tsx`

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./fringe-ui/tokens/index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### `web/src/App.tsx`

```tsx
import { LiveDslDemoApp } from "./LiveDslDemoApp";

export function App() {
  return <LiveDslDemoApp />;
}
```

### `web/src/LiveDslDemoApp.tsx`

```tsx
import { useState } from "react";
import { BackendDslPage } from "./page-dsl";
import type { DslFlowState } from "./page-dsl";
import { color, font } from "./fringe-ui/tokens";

export function LiveDslDemoApp() {
  const [state, setState] = useState<DslFlowState | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: color.cream, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: color.softInk }}>
          Live Goja DSL · {state?.page.id ?? "loading"} · v{state?.pageVersion ?? "?"}
        </div>
        <div style={{ width: 390, height: 844, borderRadius: 48, overflow: "hidden", border: "8px solid #111", background: "#fff" }}>
          <BackendDslPage flowId="fringe.intake.v1" onStateChange={setState} />
        </div>
      </div>
    </div>
  );
}
```

### Run commands

Terminal 1:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking

go run ./cmd/hair-booking serve \
  --auth-mode dev \
  --listen-host 127.0.0.1 \
  --listen-port 8080
```

Terminal 2:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web
VITE_ENABLE_MSW=false pnpm dev:backend
```

Open:

```text
http://127.0.0.1:5173/dsl-goja-demo
```

Expected behavior:

- The page initially shows the service step.
- Clicking Cut / Color / Extensions posts a backend event and updates the selected tab.
- Selecting a service option posts a backend event and updates the selected service.
- Clicking Next posts the shell action and moves to the color step.
- Selecting tone chips posts a backend event and updates the chips.
- Changing the damage rating posts a backend event and updates the rating.
- Clicking Back returns to the service step.

## Implementation Phase 2: Expand the Flow Script

This is the first of the larger future parts. The current flow proves the action mechanism, but it is only two steps. A convincing intake prototype needs more pages.

### Current flow

```text
service -> color -> service
```

### Target prototype flow

```text
service -> color -> photos -> budget -> estimate -> booking -> confirm
```

### State shape

The state should remain JSON-serializable and explicit:

```js
function initialState() {
  return {
    step: "service",
    category: "color",
    service: "highlights",
    tones: ["dimensional"],
    damage: 2,
    photoIds: [],
    budget: "flexible",
    estimate: null,
    booking: {
      day: null,
      time: null,
    },
    confirmation: null,
  };
}
```

### Step dispatcher

```js
function render(ctx) {
  switch (ctx.state.step) {
    case "service": return serviceStep(ctx);
    case "color": return colorStep(ctx);
    case "photos": return photosStep(ctx);
    case "budget": return budgetStep(ctx);
    case "estimate": return estimateStep(ctx);
    case "booking": return bookingStep(ctx);
    case "confirm": return confirmStep(ctx);
    default: return serviceStep(ctx);
  }
}
```

### Navigation helper

```js
function goto(ctx, step) {
  ctx.state.step = step;
  return render(ctx);
}
```

### Implementation notes

- Each step should be a pure page-construction function plus callbacks.
- Navigation callbacks should call `goto(ctx, nextStep)`.
- Selection callbacks should mutate a single part of `ctx.state`, then call `render(ctx)`.
- Keep page ids stable: `intake-service`, `intake-color`, `intake-photos`, and so on.
- Keep node ids stable because tests and event validation depend on them.

## Implementation Phase 3: Integrate Real Domain Services

The flow should eventually call Go domain services. That should not happen by giving JavaScript raw database access or raw Go services. Instead, expose a small, safe host module to Goja.

The pattern should look like this from JavaScript:

```js
const intake = require("fringe/intake");

function estimateStep(ctx) {
  const estimate = intake.estimate(ctx.state);
  ctx.state.estimate = estimate;
  return page("intake-estimate", "Estimate")
    .intake({ ... })
    .add(
      n.summaryRow("Estimated range", estimate.range),
      n.summaryRow("Duration", estimate.duration)
    )
    .toJSON();
}
```

The Go side should expose only allow-listed functions:

```go
func installIntakeModule(vm *goja.Runtime, services IntakeHostServices) error {
    module := vm.NewObject()
    _ = module.Set("estimate", func(call goja.FunctionCall) goja.Value {
        var state IntakeState
        exportArgument(call.Argument(0), &state)
        result := services.Estimator.Estimate(state)
        return vm.ToValue(result)
    })
    return registerModule(vm, "fringe/intake", module)
}
```

Recommended modules:

| Module | Purpose |
|---|---|
| `fringe/intake` | Estimate, validate, create/update intake draft. |
| `fringe/services` | Read service catalog options. |
| `fringe/availability` | Read available days and time slots. |
| `fringe/appointments` | Create appointment from confirmed intake state. |
| `fringe/uploads` | Bind uploaded photo ids to the flow session or intake draft. |

Rules for host modules:

- Keep functions synchronous in the first version unless async support is deliberately designed.
- Convert inputs and outputs through JSON-shaped structs.
- Return plain objects, not Go pointers or service objects.
- Validate all state crossing from JS to Go.
- Keep module APIs small and versioned.

## Implementation Phase 4: Add Session Lifecycle Management

The current `dslFlowStore` is intentionally simple:

```go
type dslFlowStore struct {
    mu       sync.RWMutex
    runtime  *dslgoja.Runtime
    sessions map[string]*dslgoja.FlowSession
}
```

This proves the event model but is not a production session manager. A production or long-running demo environment needs lifecycle rules.

### Required lifecycle fields

Add metadata around each session:

```go
type storedDSLSession struct {
    Session    *dslgoja.FlowSession
    UserID     string
    CreatedAt  time.Time
    LastSeenAt time.Time
    ExpiresAt  time.Time
}
```

### Expiry policy

Recommended first policy:

| Policy | Value |
|---|---|
| Idle timeout | 30 minutes |
| Absolute timeout | 24 hours |
| Processed event retention | 30 minutes or last 200 events |
| Retired action retention | 30 minutes or last 500 actions |

### Cleanup loop pseudocode

```go
func (s *dslFlowStore) StartCleanup(ctx context.Context) {
    ticker := time.NewTicker(time.Minute)
    go func() {
        for {
            select {
            case <-ctx.Done():
                return
            case now := <-ticker.C:
                s.prune(now)
            }
        }
    }()
}

func (s *dslFlowStore) prune(now time.Time) {
    s.mu.Lock()
    defer s.mu.Unlock()

    for id, stored := range s.sessions {
        if now.After(stored.ExpiresAt) || now.Sub(stored.LastSeenAt) > 30*time.Minute {
            delete(s.sessions, id)
        }
    }
}
```

### FlowSession internal pruning

`FlowSession` also needs pruning helpers for:

- `ProcessedEvents`
- `RetiredActions`

The first implementation can use simple bounded maps with insertion timestamps. Do not optimize this before the real route exists; correctness and visibility come first.

## Implementation Phase 5: Add Auth and Ownership Checks

The current prototype is not user-isolated. Before using it for real customers, every DSL session must belong to a user or another authenticated principal.

### Ownership invariant

```text
Only the user who started a flow session may fetch it or post events to it.
```

### Handler pattern

```go
func (h *appHandler) handleDSLEvent(w http.ResponseWriter, r *http.Request) {
    user := h.currentUser(r)
    sessionID := r.PathValue("sessionId")

    stored, ok := h.dslFlows.get(sessionID)
    if !ok {
        writeAPIError(...)
        return
    }

    if stored.UserID != user.ID {
        writeAPIError(w, http.StatusForbidden, "dsl_session_forbidden", "DSL session does not belong to current user")
        return
    }

    // decode event and dispatch
}
```

### Auth-aware start

When starting a flow, store the user id:

```go
func (h *appHandler) handleDSLStartFlow(w http.ResponseWriter, r *http.Request) {
    user := h.currentUser(r)
    session, result, err := h.dslFlows.runtime.StartFlow(...)
    h.dslFlows.put(storedDSLSession{
        Session: session,
        UserID: user.ID,
        CreatedAt: time.Now(),
        LastSeenAt: time.Now(),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    })
    writeJSON(...)
}
```

### Development mode

In dev auth mode, user id can be the configured dev user, currently `local-user`. That is enough to test ownership behavior without Keycloak.

### Production mode

In OIDC mode, ownership should use the authenticated session identity. The DSL endpoints should follow the same user extraction pattern as the existing portal endpoints.

## Implementation Phase 6: Add a Browser Smoke Test

Manual testing is useful but not enough. Once the live page exists, add a browser smoke test that exercises the real action path.

Minimum test sequence:

```text
open /dsl-goja-demo
wait for Service page
click Extensions segmented tab
expect Extensions is selected
click Next
expect Color page title
click Warm tone chip
expect Warm is selected
click Back
expect Service page title
```

Pseudocode:

```ts
test("live Goja DSL page dispatches backend actions", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173/dsl-goja-demo");
  await expect(page.getByText("What brings you in?")).toBeVisible();

  await page.getByRole("button", { name: "Extensions" }).click();
  await expect(page.getByRole("button", { name: "Extensions" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /next/i }).click();
  await expect(page.getByText("Tune the plan")).toBeVisible();

  await page.getByRole("button", { name: "Warm" }).click();
  await expect(page.getByRole("button", { name: "Warm" })).toHaveAttribute("aria-pressed", "true");
});
```

This can start as a manual Playwright script or a documented smoke command. Do not block the first route on a full CI browser stack unless the repo already has one.

## Phased Task Plan

### Phase A: Live Viewing Page

Goal: make the real backend-driven UI visible at a browser URL.

Tasks:

- Add `web/index.html`.
- Add `web/src/main.tsx`.
- Add `web/src/App.tsx`.
- Add `web/src/LiveDslDemoApp.tsx`.
- Reuse `BackendDslPage` with `flowId="fringe.intake.v1"`.
- Run Go server on `127.0.0.1:8080`.
- Run Vite with `VITE_ENABLE_MSW=false pnpm dev:backend`.
- Open `http://127.0.0.1:5173/dsl-goja-demo`.
- Verify clicking controls changes the page through backend event dispatch.

Definition of done:

- A normal browser URL renders the service step.
- Segment changes hit the live backend and update selected state.
- Shell next navigates to color step through the backend.
- Tone/rating controls update through the backend.
- `pnpm test -- --runInBand`, `npx tsc --noEmit`, and `npx storybook build --test` still pass.

### Phase B: Debuggability and Review Surface

Goal: make the backend-driven page easy to inspect while debugging.

Tasks:

- Add optional debug panel showing `sessionId`, `pageVersion`, `page.id`, and last event.
- Add a copyable JSON view for the current page.
- Add visible effect rendering for stale-page and callback-error effects.
- Add console logging only behind a dev flag, not by default.

Definition of done:

- A developer can see which page version is active.
- A developer can see the last backend event sent.
- Stale-page effects are visible without opening devtools.

### Phase C: Expand Flow Steps

Goal: turn the two-step flow into a credible intake prototype.

Tasks:

- Add `photosStep(ctx)`.
- Add `budgetStep(ctx)`.
- Add `estimateStep(ctx)`.
- Add `bookingStep(ctx)`.
- Add `confirmStep(ctx)`.
- Add tests for navigation through each step.
- Keep all node ids stable and documented.

Definition of done:

- The live route can click from service through confirm.
- Every step has at least one interactive backend-backed control.
- Runtime tests cover step transitions and representative field updates.

### Phase D: Host Modules and Domain Services

Goal: connect the flow to real backend capabilities without giving JS unsafe access.

Tasks:

- Design `fringe/intake` host module.
- Design `fringe/availability` host module.
- Design `fringe/appointments` host module.
- Add Go tests for each host function.
- Replace hard-coded options in `intake.flow.js` where appropriate.

Definition of done:

- Estimate/availability/booking data comes from Go services through allow-listed modules.
- JavaScript still receives plain JSON-shaped objects only.

### Phase E: Session Lifecycle and Auth Hardening

Goal: make the runtime safe for longer-lived local demos and future production usage.

Tasks:

- Add stored session metadata.
- Add idle and absolute expiry.
- Add cleanup loop.
- Add processed-event pruning.
- Add retired-action pruning.
- Add dev-mode user ownership.
- Add OIDC-mode ownership checks.
- Add HTTP tests for forbidden cross-user session access.

Definition of done:

- Old sessions are removed.
- Old events/actions do not grow unbounded.
- One user cannot fetch or dispatch another user's DSL session.

## Manual Test Recipe After Phase A

Use this recipe to prove that the action-based approach works in practice.

Terminal 1:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking

go run ./cmd/hair-booking serve \
  --auth-mode dev \
  --listen-host 127.0.0.1 \
  --listen-port 8080
```

Terminal 2:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web
VITE_ENABLE_MSW=false pnpm dev:backend
```

Browser:

```text
http://127.0.0.1:5173/dsl-goja-demo
```

Actions:

1. Wait for the service step.
2. Click `Extensions`.
3. Confirm the segmented tab stays selected after the backend response.
4. Click `Next`.
5. Confirm the color step appears.
6. Click `Warm` and `Dimensional` tone chips.
7. Confirm selected chips remain selected after the backend response.
8. Change the damage rating.
9. Confirm the rating remains selected after the backend response.
10. Click `Back`.
11. Confirm the service step appears again with previously selected state.

If this works, the real browser path is exercising:

```text
React widget -> DslPageRenderer -> BackendDslPage -> fetch -> Go handler -> FlowSession.Dispatch -> Goja callback -> render(ctx) -> JSON response -> React rerender
```

## Validation Commands

Run these before committing Phase A:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking

go test ./... -count=1

cd web
pnpm test -- --runInBand
npx tsc --noEmit
npx storybook build --test
```

Optional manual API validation:

```bash
BASE=http://127.0.0.1:8080
curl -s -X POST "$BASE/api/dsl/flows/fringe.intake.v1/start" | jq .
```

## Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| The live page accidentally uses MSW instead of the Go backend. | It would look real while not testing Goja. | Run `VITE_ENABLE_MSW=false pnpm dev:backend`; keep MSW setup out of normal `main.tsx`. |
| The renderer falls back to local actions instead of backend refs. | Interactions would not hit Go. | In backend pages, ensure `props.actions[eventName]` exists and `BackendDslPage` passes `backendDispatch`. |
| Page versions go stale during fast clicks. | Double clicks can post events for old actions. | Existing stale-page effect returns current page; UI should display effects. |
| The in-memory store loses sessions on restart. | Browser refresh after backend restart yields `dsl_session_not_found`. | Accept for Phase A; add lifecycle/recovery policy in Phase E. |
| Flow state grows unbounded. | Long-lived sessions can consume memory. | Add pruning and expiry in Phase E. |
| JS flow calls unsafe capabilities. | Production security risk. | Only expose allow-listed host modules with JSON-shaped inputs/outputs. |

## Design Decisions

### Start with a dev route, not a full router

The first real UI page should prove the backend action path, not introduce a routing migration. A tiny `App` that renders `LiveDslDemoApp` is enough. Add a router later when the app has multiple runtime routes that need URL-level behavior.

### Keep Storybook mock and live route separate

Storybook should remain deterministic and should not require the Go server. The live Vite route should hit the real Go server. These surfaces answer different questions.

### Keep `BackendDslPage` generic

`BackendDslPage` should not become `IntakePage`. It should accept a `flowId`, fetch a session, render the page, and dispatch backend events. That makes it reusable for future backend-authored flows.

### Keep the phone frame outside the DSL

The phone frame is a development visualization. It should not be emitted by Goja and should not become part of the page schema. The backend emits content and shell metadata; the app decides the viewport chrome.

### Do not add production hardening before the first live page

Session expiry, ownership checks, and host modules are important, but they should follow the first live route. The immediate unknown is whether the action-driven loop feels correct in a real browser. Test that first, then harden.

## Alternatives Considered

### Only use Storybook

Storybook is excellent for component review, but it is not enough to prove live fetch behavior against the Go backend. The current backend Storybook story uses a mocked client by design.

### Serve the built Vite app from Go immediately

Serving a production build through Go is useful later. For Phase A, Vite dev server plus proxy gives faster iteration and fewer build/deploy steps.

### Add React Router immediately

A router is useful when routes become meaningful product concepts. The first live page only needs one demo route, so a router would add surface area without solving the current problem.

### Let JavaScript call arbitrary Go services

That would be flexible but unsafe. Host modules should be explicit and small. Flow scripts should see stable JSON APIs, not the internal service graph.

## Open Questions

- Should the live demo route be `/dsl-goja-demo`, `/intake-goja`, or `/intake?runtime=goja`?
- Should session id be stored in the URL, local storage, or only in memory for Phase A?
- Should stale-page effects be rendered as toast UI, inline footer status, or debug-panel messages?
- Should the first host module be `fringe/intake` or should each domain area get a separate module from the start?
- Should the flow script remain embedded at compile time, or should dev mode load it from disk for faster iteration?

## References

Related HAIR-033 documents:

- `design-doc/01-interactive-widget-props-callbacks-and-app-integration-guide.md`
- `design-doc/02-backend-driven-dsl-callback-architecture-guide.md`
- `design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md`
- `reference/01-diary.md`

Core code references:

- `pkg/dslgoja/schema.go`
- `pkg/dslgoja/runtime.go`
- `pkg/dslgoja/modules_dsl.go`
- `pkg/dslgoja/flows/intake.flow.js`
- `pkg/server/handlers_dsl.go`
- `pkg/server/http.go`
- `web/src/page-dsl/schema.ts`
- `web/src/page-dsl/render.tsx`
- `web/src/page-dsl/backendClient.ts`
- `web/src/page-dsl/BackendDslPage.tsx`
- `web/src/page-dsl/BackendDslPage.stories.tsx`
- `web/src/page-dsl/BackendDslPage.test.tsx`

---

## Implementation Update: Phase A Live Viewing Page Completed

Phase A has now been implemented. The `web/` package has a real Vite entrypoint and a live app shell that renders `BackendDslPage` against the Go backend.

New app files:

| File | Role |
|---|---|
| `web/index.html` | Vite HTML entrypoint for the real app surface. |
| `web/src/main.tsx` | React bootstrap. It intentionally avoids React StrictMode for now because StrictMode re-runs effects in development and would create duplicate backend Goja sessions. |
| `web/src/App.tsx` | Minimal app shell. |
| `web/src/LiveDslDemoApp.tsx` | Phone-frame live DSL demo with session/page debug information and current-page JSON details. |

Updated infrastructure:

| File | Change |
|---|---|
| `web/vite.config.ts` | The dev proxy now uses `HAIR_BOOKING_BACKEND_URL` when set, falling back to `http://127.0.0.1:8080`. |
| `web/.gitignore` | Ignores `*.tsbuildinfo` generated by `tsc -b`. |

The normal default run mode is still:

```bash
# Terminal 1
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking
go run ./cmd/hair-booking serve --auth-mode dev --listen-host 127.0.0.1 --listen-port 8080

# Terminal 2
cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web
VITE_ENABLE_MSW=false pnpm dev:backend
```

If port `8080` is already in use, run the Go backend on another port and point Vite at it:

```bash
# Terminal 1
go run ./cmd/hair-booking serve --auth-mode dev --listen-host 127.0.0.1 --listen-port 19080

# Terminal 2
HAIR_BOOKING_BACKEND_URL=http://127.0.0.1:19080 VITE_ENABLE_MSW=false pnpm dev:backend
```

The Phase A manual validation was performed with the backend on `19080` because `8080` and `18080` were already occupied on the development machine. Vite selected `5175` because `5173` and `5174` were already in use.

The browser validation exercised the real action path:

```text
open http://127.0.0.1:5175/dsl-goja-demo
  -> POST /api/dsl/flows/fringe.intake.v1/start returns intake-service
click Extensions
  -> POST /api/dsl/flows/{sessionId}/events returns pageVersion 2 and category value extensions
click Keep going
  -> shell next action returns intake-color at pageVersion 3
click Warm
  -> chip group action returns pageVersion 4 with Warm selected
```

Network requests for the real backend path returned HTTP 200:

```text
POST /api/dsl/flows/fringe.intake.v1/start => 200
POST /api/dsl/flows/{sessionId}/events => 200
POST /api/dsl/flows/{sessionId}/events => 200
POST /api/dsl/flows/{sessionId}/events => 200
```

Validation commands run after the implementation:

```bash
go test ./... -count=1
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
npx storybook build --test
```

Phase A proves that the action-based approach works in a real browser route. The next phase should improve debug ergonomics: show the last event, make current page JSON easier to copy, and make effects/toasts more visible during stale-page or callback-error testing.
