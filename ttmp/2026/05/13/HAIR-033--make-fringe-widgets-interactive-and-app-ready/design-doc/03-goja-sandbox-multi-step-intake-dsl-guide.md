---
Title: Goja Sandbox Multi Step Intake DSL Guide
Ticket: HAIR-033
Status: active
Topics:
    - frontend
    - backend
    - goja
    - javascript
    - dsl
    - state-management
    - api-design
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/intake/service.go
      Note: Existing intake domain service to expose safely through Goja host modules
    - Path: pkg/intake/service.go:Existing Go intake domain service that Goja handlers can call through host modules
    - Path: pkg/server/http.go
      Note: Go backend route registration style for future DSL endpoints
    - Path: pkg/server/http.go:Current Go HTTP routing style where DSL endpoints would be mounted
    - Path: web/src/page-dsl/InteractiveDsl.stories.tsx
      Note: Current browser-local interactive DSL reference for future Goja-backed flow
    - Path: web/src/page-dsl/InteractiveDsl.stories.tsx:Current local-state interactive DSL example to evolve into backend event dispatch
    - Path: web/src/page-dsl/builder.ts
      Note: Current TypeScript builder shape to mirror in Goja JavaScript
    - Path: web/src/page-dsl/builder.ts:Current TypeScript DSL builder shape to mirror in Goja-hosted JavaScript
    - Path: web/src/page-dsl/render.tsx
      Note: Frontend interpreter that will render Goja-produced JSON pages and dispatch events
    - Path: web/src/page-dsl/render.tsx:Current frontend interpreter that will render Goja-produced JSON pages
    - Path: web/src/page-dsl/schema.ts
      Note: Current JSON page contract that Goja-hosted JS should emit
    - Path: web/src/page-dsl/schema.ts:Current JSON page contract that Goja scripts should emit
ExternalSources: []
Summary: Design guide for a multi-step Fringe intake flow where the DSL runs as JavaScript inside a long-running per-flow Goja sandbox, registers page-version-scoped callbacks with the Go host, and emits JSON pages rendered by the browser.
LastUpdated: 2026-05-13T11:45:00-04:00
WhatFor: Use when implementing Goja-hosted JavaScript flow scripts for backend-driven DSL pages and multi-step intake interactions.
WhenToUse: Use before building the Goja runtime, JS DSL modules, flow session lifecycle, callback registry, or multi-step intake scripts.
---


# Goja Sandbox Multi Step Intake DSL Guide

## Executive Summary

The backend API is not a conventional REST-only API and not a browser-owned DSL runtime. The intended model is more powerful:

> JavaScript DSL code runs inside a Goja sandbox inside the Go backend. That JavaScript builds pages, registers callbacks with the Go host, and emits JSON. The browser renders the JSON. When the user interacts, the browser posts an event back to Go, Go dispatches it into the registered JavaScript callback, and the callback returns the next page JSON.

This document explains what a **multi-step intake flow** looks like under that model.

At a high level:

```text
Go backend starts flow session
        │
        ▼
Goja VM loads intake.flow.js
        │
        ▼
JS render(ctx) builds page JSON and registers callbacks
        │
        ▼
Browser renders JSON page
        │
        ▼
User clicks/selects/types
        │
        ▼
Browser POSTs event to Go backend
        │
        ▼
Go finds action id, calls registered Goja callback
        │
        ▼
JS mutates flow state and returns next page JSON
        │
        ▼
Browser renders next step
```

The key idea is that the DSL can feel like normal JavaScript:

```js
page.intake({
  title: "What brings you in?",
  onNext: ctx.action("next", () => ctx.goto("color")),
})
```

But the browser never receives that callback function. The browser only receives an opaque action id:

```json
"actions": {
  "next": { "id": "act_123", "event": "next" }
}
```

The Go host keeps the mapping:

```text
act_123 -> Goja function () => ctx.goto("color")
```

## How This Differs From the Previous Document

The previous document described backend-driven callbacks generally. It assumed handlers might be Go functions or symbolic handler keys.

This document specializes that architecture for the corrected backend model:

- The DSL author writes JavaScript.
- JavaScript runs in Goja inside Go.
- JavaScript can register callbacks during page construction.
- Go owns the sandbox, action registry, HTTP endpoints, persistence, and domain services.
- The browser remains a renderer and event transport.

The Goja model makes authoring very ergonomic, but adds runtime concerns:

- Goja runtimes are not goroutine-safe.
- JavaScript closures are not durable across process restarts.
- The host must sandbox modules and APIs.
- Long-running callbacks need timeouts/cancellation.
- Page/session state must be carefully owned by Go, JS, or a structured bridge.

## Current System Context

The current frontend DSL lives in:

```text
web/src/page-dsl/schema.ts
web/src/page-dsl/builder.ts
web/src/page-dsl/render.tsx
web/src/page-dsl/InteractiveDsl.stories.tsx
```

It already proves that JSON pages can render interactive widgets. However, the callbacks currently live in browser React state.

The target Goja runtime will produce the same kind of JSON, but from backend JavaScript.

Current backend route registration style lives in:

```text
pkg/server/http.go
```

Existing domain logic for intake submissions lives in:

```text
pkg/intake/service.go
```

Goja-hosted JS should not directly import Go packages. Instead, Go exposes safe JavaScript modules such as:

```js
const { page, n } = require("fringe/dsl");
const intake = require("fringe/intake");
```

## Target Architecture

```text
┌───────────────────────────────────────────────────────────────────┐
│ Go process                                                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Goja runtime / flow session                                 │  │
│  │                                                             │  │
│  │  intake.flow.js                                             │  │
│  │    - render(ctx)                                            │  │
│  │    - callbacks registered via ctx.action(...)               │  │
│  │    - state accessed via ctx.state                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Go host:                                                         │
│    - creates flow sessions                                        │
│    - exposes JS modules                                           │
│    - stores action registry                                       │
│    - validates browser events                                     │
│    - invokes Goja callbacks safely                                │
│    - exposes safe domain services                                 │
└───────────────────────────────┬───────────────────────────────────┘
                                │ JSON page + action ids
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│ Browser                                                           │
│                                                                   │
│  React DslPageRenderer                                            │
│    - renders widgets                                              │
│    - sends event POSTs                                            │
│    - replaces page with backend response                          │
└───────────────────────────────────────────────────────────────────┘
```

## Core Concepts

### 1. Flow Script

A flow script is a JavaScript file loaded into Goja. It defines how to render a multi-step flow and how to handle events.

Example file:

```text
internal/dsl/flows/intake.flow.js
```

Possible contract:

```js
module.exports = {
  id: "fringe.intake.v1",
  initialState,
  render,
};
```

### 2. Flow Session

A flow session is one running instance of a flow for one user/client.

It contains:

- `sessionId`
- `flowId`
- `userId`
- `state`
- `pageVersion`
- `currentPage`
- `actionRegistry`
- `goja.Runtime` or a way to recreate one
- expiry/deadline metadata

Sketch:

```go
type FlowSession struct {
    ID        string
    FlowID    string
    UserID    string
    Version   int64
    State     map[string]any
    Page      dsl.Page
    Actions   map[string]ActionRegistration
    Runtime   *goja.Runtime // in-memory mode only
    ExpiresAt time.Time
}
```

### 3. Action Registration

From JavaScript:

```js
ctx.action("categoryChanged", (event) => {
  ctx.state.category = event.value;
  return render(ctx);
})
```

What Go stores:

```go
type ActionRegistration struct {
    ID       string
    Name     string
    NodeID   string
    Event    string
    Callback goja.Callable // in-memory mode
}
```

What browser sees:

```json
{
  "id": "act_01HX...",
  "event": "change"
}
```

### 4. Page JSON

The page JSON is still the contract between backend and frontend. It should align with `web/src/page-dsl/schema.ts`.

Important: the page JSON must contain no functions.

### 5. Browser Event

When the browser detects an interaction, it sends:

```json
{
  "eventId": "evt_01HX...",
  "sessionId": "flow_01HX...",
  "pageVersion": 3,
  "nodeId": "category-tabs",
  "nodeKind": "segmented",
  "actionId": "act_01HX...",
  "event": "change",
  "value": "extensions",
  "meta": {
    "previousValue": "color",
    "source": "pointer"
  }
}
```

The backend uses `actionId` to look up the Goja callback.

## What a Multi-Step Intake Looks Like

A multi-step intake is a state machine rendered by JavaScript.

Example steps:

1. `service` — choose Cut / Color / Extensions.
2. `color` — choose color service and target level.
3. `photos` — upload current/inspiration photos.
4. `budget` — choose budget and timing.
5. `booking` — choose day/time.
6. `confirm` — review and submit.

The flow state might look like:

```js
{
  step: "service",
  category: "color",
  service: "highlights",
  tones: ["dimensional"],
  colorLevel: 6,
  targetLevel: 8,
  photos: {
    front: null,
    side: null,
    back: null
  },
  budget: "250-400",
  day: null,
  time: null,
  estimate: null
}
```

The renderer function switches on `state.step`:

```js
function render(ctx) {
  switch (ctx.state.step) {
    case "service": return renderServiceStep(ctx);
    case "color": return renderColorStep(ctx);
    case "photos": return renderPhotosStep(ctx);
    case "budget": return renderBudgetStep(ctx);
    case "booking": return renderBookingStep(ctx);
    case "confirm": return renderConfirmStep(ctx);
    default: return renderServiceStep(ctx);
  }
}
```

Each step returns a page JSON object and registers fresh callbacks.

## Example JavaScript Flow Script

This is what the developer experience should feel like.

```js
const { page, n } = require("fringe/dsl");
const intake = require("fringe/intake");

function initialState() {
  return {
    step: "service",
    category: "color",
    service: "highlights",
    tones: ["dimensional"],
    colorLevel: 6,
    targetLevel: 8,
    photos: {},
    budget: "250-400",
    day: null,
    time: null,
  };
}

function render(ctx) {
  switch (ctx.state.step) {
    case "service": return serviceStep(ctx);
    case "color": return colorStep(ctx);
    case "photos": return photosStep(ctx);
    case "budget": return budgetStep(ctx);
    case "booking": return bookingStep(ctx);
    case "confirm": return confirmStep(ctx);
    default: return serviceStep(ctx);
  }
}

function serviceStep(ctx) {
  return page("intake-service", "Service")
    .intake({
      step: 1,
      total: 6,
      eyebrow: "Chapter I · The Ask",
      title: "What brings you in?",
      onNext: ctx.action("next", () => ctx.goto("color")),
      onBack: ctx.action("back", () => ctx.goto("service")),
      onSkip: ctx.action("skip", () => ctx.goto("photos")),
    })
    .add(
      n.segmented([
        { value: "cut", label: "Cut" },
        { value: "color", label: "Color" },
        { value: "extensions", label: "Extensions" },
      ], ctx.state.category, {
        id: "category-tabs",
        onChange: ctx.action("setCategory", (event) => {
          ctx.state.category = event.value;
          if (event.value === "cut") ctx.state.service = "cut";
          if (event.value === "extensions") ctx.state.service = "extensions";
          return render(ctx);
        }),
      }),
      n.serviceOptionGroup([
        { value: "cut", name: "Cut", description: "Trim · restyle · bangs", rate: "$80+" },
        { value: "highlights", name: "Highlights", description: "Partial · full · balayage", rate: "$180+" },
        { value: "gloss", name: "Gloss", description: "Tone · shine · refresh", rate: "$120+" },
      ], ctx.state.service, {
        onChange: ctx.action("setService", (event) => {
          ctx.state.service = event.value;
          return render(ctx);
        }),
      }),
    )
    .toJSON();
}

function colorStep(ctx) {
  return page("intake-color", "Color")
    .intake({
      step: 2,
      total: 6,
      eyebrow: "Chapter II · The Color",
      title: "Where are we going?",
      onNext: ctx.action("next", () => ctx.goto("photos")),
      onBack: ctx.action("back", () => ctx.goto("service")),
    })
    .add(
      n.chipGroup([
        { value: "neutral", label: "Neutral" },
        { value: "warm", label: "Warm" },
        { value: "cool", label: "Cool" },
        { value: "dimensional", label: "Dimensional" },
      ], ctx.state.tones, {
        label: "Tone family",
        onChange: ctx.action("setTones", (event) => {
          ctx.state.tones = event.value;
          return render(ctx);
        }),
      }),
      n.ratingBar(ctx.state.colorLevel, {
        label: "Current level",
        interactive: true,
        onChange: ctx.action("setColorLevel", (event) => {
          ctx.state.colorLevel = Number(event.value);
          return render(ctx);
        }),
      }),
    )
    .toJSON();
}

module.exports = { id: "fringe.intake.v1", initialState, render };
```

The exact property name may be `action`, `onChange`, or `actions.change`; the important concept is that `ctx.action(...)` returns a JSON-safe action reference.

## What `ctx.action(...)` Does

From JavaScript, it looks like this:

```js
ctx.action("setService", (event) => {
  ctx.state.service = event.value;
  return render(ctx);
})
```

Inside Go, it does this:

1. Converts the JavaScript callback into a `goja.Callable`.
2. Generates an opaque action id.
3. Stores the callable in the current flow session's action registry.
4. Returns an action reference object to JavaScript.
5. The builder embeds that action reference into the page JSON.

Go-ish pseudocode:

```go
func (ctx *BuildContext) Action(name string, fn goja.Callable) ActionRef {
    id := newActionID()
    ctx.session.Actions[id] = ActionRegistration{
        ID:       id,
        Name:     name,
        Callback: fn,
    }
    return ActionRef{ID: id, Event: inferEvent(name)}
}
```

The browser receives only:

```json
{ "id": "act_123", "event": "change" }
```

It never receives the function.

## Recommended JavaScript API Shape

Expose host modules through `require(...)`.

### `require("fringe/dsl")`

Exports:

```js
{
  page,
  n,
  option,
}
```

Usage:

```js
const { page, n } = require("fringe/dsl");
```

This mirrors the current TypeScript builder in `web/src/page-dsl/builder.ts`.

### `ctx`

The flow context is not imported. It is passed by Go when calling `initialState`, `render`, or callbacks.

Recommended shape:

```js
ctx = {
  sessionId: "flow_123",
  user: { id: "..." },
  state: {},
  action(name, fn),
  goto(step),
  set(path, value),
  get(path),
  effect(kind, payload),
  log: { info(), warn(), error() },
}
```

### `require("fringe/intake")`

Safe domain module wrapping Go intake services.

Potential exports:

```js
{
  estimate(state),
  createSubmission(state),
  attachPhoto({ intakeId, slot, uploadId }),
}
```

Important: keep business operations in Go services; expose small adapters to JS.

## Host/Go Runtime Design

### Package layout

```text
pkg/dslgoja/
  runtime.go          # Goja runtime/session lifecycle
  context.go          # JS ctx object and ctx.action implementation
  modules_dsl.go      # require("fringe/dsl")
  modules_intake.go   # require("fringe/intake")
  dispatch.go         # action event dispatch into Goja callbacks
  store.go            # flow session store
  tests/

pkg/server/
  handlers_dsl.go     # HTTP endpoints
```

### Flow runtime

```go
type Runtime struct {
    flows  map[string]*CompiledFlow
    store  FlowSessionStore
    domain DomainServices
}
```

### Flow session

```go
type FlowSession struct {
    ID       string
    FlowID   string
    UserID   string
    Version  int64
    State    map[string]any
    Page     dsl.Page
    Actions  map[string]ActionRegistration
    VM       *goja.Runtime // if using sticky in-memory sessions
    Mu       sync.Mutex    // goja is not goroutine-safe
}
```

### Action registration

```go
type ActionRegistration struct {
    ID       string
    Name     string
    Event    string
    NodeID   string
    Callback goja.Callable
}
```

### Dispatch

Dispatch is page-version scoped. The backend should only invoke callbacks that are registered for the **current rendered page version**. Old actions become stale after a successful re-render.

```go
func (rt *Runtime) Dispatch(ctx context.Context, sessionID string, event InteractionEvent) (*InteractionResult, error) {
    session, err := rt.store.Get(ctx, sessionID)
    if err != nil { return nil, err }

    session.Mu.Lock()
    defer session.Mu.Unlock()

    // Idempotency first: browser retries and double-clicks should not run a
    // callback twice.
    if cached, ok := session.ProcessedEvents[event.EventID]; ok {
        return &cached, nil
    }

    // The browser is holding an old page. Do not run old callbacks against new
    // state. Return the current page so the browser can recover.
    if event.PageVersion != session.Version {
        return session.StalePageResult("This page was already updated."), nil
    }

    action, ok := session.CurrentActions[event.ActionID]
    if !ok {
        if _, wasRetired := session.RetiredActions[event.ActionID]; wasRetired {
            return session.StalePageResult("This action is no longer active."), nil
        }
        return nil, ErrUnknownAction
    }

    if action.NodeID != event.NodeID {
        return nil, ErrActionNodeMismatch
    }

    jsEvent := session.VM.ToValue(event)
    result, err := rt.callWithTimeout(session, action.Callback, jsEvent)
    if err != nil {
        return session.ErrorResult(err), nil
    }

    page, effects, err := session.ExportHandlerResult(result)
    if err != nil {
        return session.ErrorResult(err), nil
    }

    // A successful callback normally returns a newly rendered page. Commit that
    // page transactionally: old actions are retired, new actions become current,
    // and the page version increments.
    committed := session.CommitRenderedPage(page, effects)
    session.ProcessedEvents[event.EventID] = *committed

    if err := rt.store.Save(ctx, session); err != nil { return nil, err }
    return committed, nil
}
```

## Critical Goja Runtime Constraint: Not Goroutine-Safe

Goja runtimes must not be used concurrently from multiple goroutines. This matters because HTTP requests can arrive concurrently.

Use one of these approaches:

### Option A: Mutex per flow session

Simplest:

```go
session.Mu.Lock()
defer session.Mu.Unlock()
// call Goja
```

Pros:

- Easy to implement.
- Fine for intake flows.

Cons:

- Long-running callbacks block other interactions for the same session.

### Option B: Actor/event loop per flow session

Each session owns a goroutine and events are sent through a channel.

Pros:

- Clean concurrency model.
- Prevents accidental concurrent VM access.

Cons:

- More implementation complexity.
- Need lifecycle cleanup.

Recommendation: start with a mutex and strict callback timeout. Move to actor model if needed.

## Page Rendering Cycle and Old Action Lifecycle

Every render should rebuild the action registry for the current page, but it should do so **transactionally**. Do not clear current actions before the new page is successfully produced. If render fails, the browser should still be able to use the previous page/actions or receive a clear error response.

### Recommended lifetime boundaries

```text
Goja VM lifetime:             whole active flow session
Flow state lifetime:          whole active flow session
Current action lifetime:      current page version only
Processed event cache:        short retry/idempotency window
Retired action metadata:      short stale-action diagnostics window
Old Goja callback closures:   released after page advances
```

This is the key point: a long-running VM does **not** mean every callback ever registered remains callable forever. The VM and `ctx.state` can stay alive for the whole intake, while the active interaction surface changes on every successful page render.

### Why old actions should become stale

Imagine this sequence:

```text
pageVersion 1
  act_a -> categoryChanged
  act_b -> next

user clicks category
  act_a runs
  JS updates state
  JS renders pageVersion 2

pageVersion 2
  act_c -> categoryChanged
  act_d -> next
```

After page version 2 is committed, `act_a` and `act_b` should not mutate the flow anymore. If an old tab or delayed request posts `act_a`, the backend should return the current page with a stale-page effect instead of running the old callback.

### Render transaction

Render should collect actions into a temporary `NextActions` map. Only after the render succeeds should those actions replace the current action map.

```text
start render transaction
  nextActions = {}
  JS builds page
  every ctx.action registers into nextActions
  builder embeds action ids in JSON
if render succeeds:
  retire currentActions metadata
  currentActions = nextActions
  currentPage = page
  version++
if render fails:
  keep old currentPage/currentActions/version
```

Pseudocode:

```go
type RenderTransaction struct {
    Session     *FlowSession
    NextActions map[string]ActionRegistration
}

func (s *FlowSession) RenderCurrentPage() (*InteractionResult, error) {
    tx := &RenderTransaction{
        Session:     s,
        NextActions: map[string]ActionRegistration{},
    }

    // ctx.action(...) writes into tx.NextActions, not s.CurrentActions.
    ctxObj := s.NewContextObject(tx)
    result, err := s.RenderFunc(goja.Undefined(), ctxObj)
    if err != nil {
        return nil, err // previous page/actions remain valid
    }

    page, effects, err := s.ExportHandlerResult(result)
    if err != nil {
        return nil, err // previous page/actions remain valid
    }

    return s.CommitRenderTransaction(tx, page, effects), nil
}

func (s *FlowSession) CommitRenderTransaction(tx *RenderTransaction, page dsl.Page, effects []Effect) *InteractionResult {
    now := time.Now()
    for id, action := range s.CurrentActions {
        s.RetiredActions[id] = RetiredActionInfo{
            ID:        id,
            Name:      action.Name,
            Event:     action.Event,
            NodeID:    action.NodeID,
            Version:   action.Version,
            RetiredAt: now,
        }
    }

    s.Version++
    s.CurrentPage = page
    s.CurrentActions = tx.NextActions
    s.pruneRetiredActions(now)
    s.pruneProcessedEvents(now)

    return &InteractionResult{
        SessionID:   s.ID,
        PageVersion: s.Version,
        Page:        page,
        Effects:     effects,
    }
}
```

### Action registration with a render transaction

From JavaScript:

```js
ctx.action("next", () => ctx.goto("color"))
```

Inside Go:

```go
func (ctx *BuildContext) Action(name string, callback goja.Callable) ActionRef {
    id := newActionID()
    ctx.RenderTx.NextActions[id] = ActionRegistration{
        ID:       id,
        Name:     name,
        Event:    ctx.CurrentEventName,
        NodeID:   ctx.CurrentNodeID,
        Version:  ctx.Session.Version + 1,
        Callback: callback,
    }
    return ActionRef{ID: id, Event: ctx.CurrentEventName}
}
```

### Handling stale actions

Stale action response should be recoverable, not catastrophic:

```json
{
  "data": {
    "sessionId": "flow_123",
    "pageVersion": 4,
    "page": { "...": "current page" },
    "effects": [
      {
        "kind": "toast",
        "tone": "info",
        "message": "This page was already updated."
      }
    ]
  }
}
```

The frontend replaces its page JSON with the current page and continues.

### Retention policy

Do not keep old `goja.Callable` values forever. They may retain closures and VM objects. Keep only:

- current live callbacks in `CurrentActions`,
- processed event results for idempotency,
- lightweight retired action metadata for stale-action diagnostics.

Example retention:

```text
ProcessedEvents: keep 5-15 minutes or last N events
RetiredActions:  keep 5-15 minutes or last N page versions
CurrentActions:  replace on every successful render
```

## Multi-Step Navigation Pattern

Navigation is just state mutation plus re-render.

JavaScript helper:

```js
ctx.goto = function(step) {
  ctx.state.step = step;
  return render(ctx);
};
```

Footer buttons:

```js
.intake({
  onNext: ctx.action("next", () => ctx.goto("photos")),
  onBack: ctx.action("back", () => ctx.goto("color")),
})
```

Browser click:

```json
{
  "event": "next",
  "actionId": "act_next_123",
  "value": null
}
```

Backend dispatch:

```text
act_next_123 -> JS callback () => ctx.goto("photos") -> returns photos page
```

## Multi-Step Intake Walkthrough

### Start flow

Browser calls:

```http
POST /api/dsl/flows/fringe.intake.v1/start
```

Go does:

1. Create `FlowSession`.
2. Create Goja runtime.
3. Install safe modules.
4. Load `intake.flow.js`.
5. Call `initialState(ctx)`.
6. Call `render(ctx)`.
7. Save session.
8. Return first page.

Response:

```json
{
  "data": {
    "sessionId": "flow_123",
    "pageVersion": 1,
    "page": {
      "id": "intake-service",
      "nodes": []
    }
  }
}
```

### User changes segmented tab

Browser posts:

```http
POST /api/dsl/flows/flow_123/events
```

Body:

```json
{
  "eventId": "evt_1",
  "pageVersion": 1,
  "nodeId": "category-tabs",
  "actionId": "act_category",
  "event": "change",
  "value": "extensions"
}
```

Go does:

1. Load session `flow_123`.
2. Validate event/version/action.
3. Lookup `act_category`.
4. Call JS callback registered by `ctx.action("setCategory", fn)`.
5. JS sets `ctx.state.category = "extensions"`.
6. JS returns `render(ctx)`.
7. Go exports returned page JSON.
8. Go saves session and returns page version 2.

### User presses bottom Next

Browser posts:

```json
{
  "eventId": "evt_2",
  "pageVersion": 2,
  "nodeId": "shell.next",
  "actionId": "act_next",
  "event": "next"
}
```

Go dispatches:

```js
() => ctx.goto("color")
```

Response page is the color step.

## Browser Rendering Changes Needed

The frontend renderer must support backend action refs.

Current local action style:

```json
{ "action": "categoryChanged" }
```

Goja backend style:

```json
{
  "actions": {
    "change": { "id": "act_123", "event": "change" }
  }
}
```

Renderer pseudocode:

```ts
function dispatchAction(node, props, eventName, value, meta) {
  const backendRef = props.actions?.[eventName];
  if (backendRef) {
    return context.backendDispatch({
      nodeId: node.meta?.id,
      nodeKind: node.kind,
      actionId: backendRef.id,
      event: backendRef.event,
      value,
      meta,
    });
  }

  const localName = props.action;
  if (localName) {
    return context.actions?.[localName]?.({ node, action: localName, value, meta });
  }
}
```

This lets Storybook keep local action names while production uses backend action refs.

## API Endpoints

### Start flow

```http
POST /api/dsl/flows/{flowId}/start
```

Request:

```json
{
  "initialState": {
    "category": "color"
  }
}
```

Response:

```json
{
  "data": {
    "sessionId": "flow_123",
    "pageVersion": 1,
    "page": {}
  }
}
```

### Dispatch event

```http
POST /api/dsl/flows/{sessionId}/events
```

Request:

```json
{
  "eventId": "evt_123",
  "pageVersion": 1,
  "nodeId": "category-tabs",
  "nodeKind": "segmented",
  "actionId": "act_123",
  "event": "change",
  "value": "extensions",
  "meta": {}
}
```

Response:

```json
{
  "data": {
    "sessionId": "flow_123",
    "pageVersion": 2,
    "page": {},
    "effects": []
  }
}
```

### Get current flow page

```http
GET /api/dsl/flows/{sessionId}
```

Response:

```json
{
  "data": {
    "sessionId": "flow_123",
    "pageVersion": 2,
    "page": {}
  }
}
```

## Goja Module Design

Following Goja module authoring rules, define JS contracts first and keep Go domain services separate from JS glue.

### `fringe/dsl`

Purpose: build JSON pages.

```js
const { page, n } = require("fringe/dsl");
```

Exports:

```js
page(id, title)
n.text(...)
n.segmented(...)
n.chipGroup(...)
n.serviceOptionGroup(...)
n.photoTile(...)
```

### `fringe/intake`

Purpose: safe wrapper around Go intake services.

```js
const intake = require("fringe/intake");
```

Exports:

```js
intake.estimate(state)
intake.createSubmission(state)
intake.attachPhoto({ intakeId, slot, uploadId })
```

Do not put business logic inside the Goja module loader. The loader should decode JS options and call pure Go service methods.

### `fringe/log`

Purpose: safe structured logging.

```js
const log = require("fringe/log");
log.info("step", ctx.state.step);
```

### Restricted modules

The sandbox should not expose arbitrary:

- filesystem access,
- network access,
- process/environment access,
- unsafe reflection.

Only explicit host modules should exist.

## Persistence and VM Lifetime Choices

### Recommended first implementation: long-running VM per active flow session

Use one Goja VM per active DSL flow session, not one global VM and not necessarily one VM for the entire logged-in user.

```text
User session
  ├─ intake flow session      -> Goja VM A
  ├─ booking reschedule flow  -> Goja VM B
  └─ stylist wizard flow      -> Goja VM C
```

Why per-flow rather than per-user?

- A user can have multiple flows open in different tabs.
- Each flow has its own state machine and action registry.
- Cleanup is simpler: completing/canceling/expiring a flow kills one VM.
- It avoids accidental cross-flow state leakage.
- It keeps action ids scoped to one flow instance.

Flow session sketch:

```go
type FlowSession struct {
    ID       string
    UserID   string
    FlowID   string
    Version  int64
    VM       *goja.Runtime
    State    map[string]any

    CurrentPage    dsl.Page
    CurrentActions map[string]ActionRegistration

    ProcessedEvents map[string]InteractionResult
    RetiredActions  map[string]RetiredActionInfo

    Mu       sync.Mutex
    ExpiresAt time.Time
}
```

Pros:

- JS callbacks can be real closures.
- The authoring model is ergonomic: `ctx.action("next", () => ctx.goto("color"))`.
- The script and modules are already loaded when events arrive.
- Multi-step intake state naturally lives in `ctx.state`.

Cons:

- Sessions die on process restart unless state is persisted and replayable.
- Horizontal scaling needs sticky sessions or shared/persisted runtime strategy.
- Memory cleanup is mandatory.
- Goja runtime access must be serialized.

### Required long-running VM guardrails

1. **Per-session mutex or actor loop**

   ```go
   session.Mu.Lock()
   defer session.Mu.Unlock()
   ```

   Start with a mutex. Move to an actor/event-loop if callbacks become complex.

2. **Callback timeout / interrupt**

   ```go
   timer := time.AfterFunc(2*time.Second, func() {
       session.VM.Interrupt("callback timeout")
   })
   defer timer.Stop()
   ```

3. **Idle and absolute expiry**

   Suggested defaults:

   ```text
   idle timeout:      30 minutes
   absolute timeout:   4 hours
   completion expiry:  immediate or short grace period
   ```

4. **Bounded current/old action storage**

   Keep current callbacks only for the current page version. Keep retired metadata and event results briefly for stale-action recovery/idempotency.

5. **JSON-serializable flow state**

   Even if the VM is long-running, `ctx.state` should remain JSON-compatible so the system can be debugged, inspected, snapshotted, and later migrated to a persisted/recreated runtime.

### Alternative: persist state and recreate VM on every event

In this model, callbacks are not stored as closures. Each event recreates a VM, loads the script, restores JSON state, and dispatches through symbolic handler references.

Pros:

- Durable.
- Horizontally scalable.
- Easier to recover after restart.

Cons:

- More complex JS API.
- Less callback-closure magic.
- Slower per event.

### Hybrid recommendation

Start with long-running in-memory Goja sessions to prove the UX and API. Design the state/action model so a later persisted implementation is possible.

Specifically:

- Action ids remain opaque.
- Browser never sees handler names.
- Flow state stays JSON-serializable.
- Page JSON stays JSON-serializable.
- Old callbacks are released after page advances.
- Do not rely on closure-captured non-serializable state for core business data.

## State Rules for Multi-Step Intake

### Keep flow state JSON-serializable

Good:

```js
ctx.state.service = "highlights";
ctx.state.tones = ["dimensional", "cool"];
ctx.state.photos.front = "upload_123";
```

Bad:

```js
ctx.state.file = someFileHandle;
ctx.state.callback = () => {};
ctx.state.vmObject = new NativeThing();
```

### Treat render as a pure-ish function of state

Good:

```js
function render(ctx) {
  return steps[ctx.state.step](ctx);
}
```

Avoid render-time side effects like creating submissions. Use callbacks for mutations.

### Re-register actions on each render

Actions are page-version-specific. Old actions should expire after navigation.

### Keep navigation explicit

Use step ids:

```js
ctx.goto("budget")
```

Avoid implicit navigation hidden inside widget components.

## Error Handling

JavaScript callbacks can throw:

```js
ctx.action("next", () => {
  if (!ctx.state.service) throw new Error("Choose a service first");
  return ctx.goto("color");
})
```

Go should catch and convert to API errors or page effects:

```json
{
  "data": {
    "page": { ...samePage },
    "effects": [
      { "kind": "toast", "tone": "danger", "message": "Choose a service first" }
    ]
  }
}
```

Recommended callback result shape:

```js
return {
  page: render(ctx),
  effects: [{ kind: "toast", message: "Saved" }]
};
```

But allow plain page returns for ergonomics:

```js
return render(ctx);
```

## Validation Strategy

### Browser side

The browser should provide good metadata, but the backend validates everything.

### Go host side

Validate:

- session exists,
- user owns session,
- page version is current,
- action id exists,
- action id belongs to current page,
- node id matches,
- event type matches,
- value is allowed for that node.

### JS callback side

Callbacks can also validate flow-specific business rules:

```js
ctx.action("next", () => {
  if (ctx.state.step === "service" && !ctx.state.service) {
    return ctx.stay({ toast: "Choose a service" });
  }
  return ctx.goto("color");
})
```

## Testing Plan

### Go runtime tests

Test that:

- starting a flow loads JS and returns first page,
- render registers actions,
- segmented change invokes the right JS callback,
- next button invokes the right JS callback,
- state persists between events,
- old action ids are rejected after re-render,
- concurrent events do not race the Goja runtime,
- callback exceptions become safe API errors/effects.

### Frontend tests

Test that:

- renderer sees backend action refs,
- segmented change posts event with correct action id,
- footer next posts event with shell action id,
- response page replaces current page.

### Integration test

End-to-end test:

```text
POST /api/dsl/flows/fringe.intake.v1/start
assert page id == intake-service
POST event category-tabs -> extensions
assert returned page has segmented value extensions
POST event shell.next
assert returned page id == intake-color
```

## Implementation Plan

### Phase 1: Local Goja flow prototype

Create:

```text
pkg/dslgoja/runtime.go
pkg/dslgoja/context.go
pkg/dslgoja/modules_dsl.go
pkg/dslgoja/flows/intake.flow.js
```

Goal:

- Load JS.
- Call `initialState`.
- Call `render`.
- Register actions.
- Dispatch one event.

### Phase 2: HTTP endpoints

Create:

```text
pkg/server/handlers_dsl.go
```

Add routes in `pkg/server/http.go`:

```go
mux.HandleFunc("POST /api/dsl/flows/{flowId}/start", h.handleDSLStartFlow)
mux.HandleFunc("GET /api/dsl/flows/{sessionId}", h.handleDSLGetFlow)
mux.HandleFunc("POST /api/dsl/flows/{sessionId}/events", h.handleDSLEvent)
```

### Phase 3: Frontend backend transport

Create:

```text
web/src/page-dsl/backendClient.ts
web/src/page-dsl/BackendDslPage.tsx
```

Add backend dispatch support to `DslPageRenderer` context.

### Phase 4: Multi-step intake script

Implement steps:

- service,
- color,
- photos,
- budget,
- booking,
- confirm.

Start with service and color only, then add the rest.

### Phase 5: Domain service integration

Expose safe modules:

```js
require("fringe/intake").estimate(state)
require("fringe/intake").createSubmission(state)
```

Connect confirm step to real Go service.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Goja VM used concurrently | Per-session mutex or actor loop. |
| Sessions leak memory | Expiry, cleanup goroutine, max sessions per user. |
| JS infinite loops | Runtime interrupt/timeouts. |
| Browser replays stale action | Page version + event id + action registry validation. |
| Process restart loses closures | Start in-memory, but keep state JSON-serializable and plan symbolic handlers. |
| Unsafe JS module access | Only expose allow-listed host modules. |
| Debugging callback failures is hard | Structured logs with sessionId/actionId/nodeId and JS stack traces. |

## What the First Multi-Step Demo Should Look Like

### Step 1: Service

- Segmented category tabs.
- Service option group.
- Next button.

Callbacks:

```js
setCategory -> update state.category and re-render same step
setService -> update state.service and re-render same step
next -> goto("color")
```

### Step 2: Color

- Chip group for tone family.
- Rating bar/color level.
- Back and next buttons.

Callbacks:

```js
setTones -> update state.tones and re-render same step
setColorLevel -> update state.colorLevel and re-render same step
back -> goto("service")
next -> goto("photos")
```

### Step 3: Photos

- Photo tiles.
- Upload/remove events.

Callbacks:

```js
photoUploaded -> attach upload id to state.photos[slot]
photoRemoved -> clear state.photos[slot]
next -> goto("budget")
```

### Step 4: Budget

- Budget option group.

Callbacks:

```js
setBudget -> update state.budget
next -> compute estimate and goto("booking")
```

### Step 5: Booking

- Day picker.
- Time slot group.

Callbacks:

```js
setDay -> update state.day
setTime -> update state.time
next -> goto("confirm")
```

### Step 6: Confirm

- Summary rows.
- Submit button.

Callbacks:

```js
submit -> intake.createSubmission(ctx.state) -> confirmation page
editService -> goto("service")
editBudget -> goto("budget")
```

## Final Recommendation

Use Goja as the backend DSL authoring environment, with **one long-running Goja VM per active flow session** for the first implementation.

Keep the runtime architecture disciplined:

- JS authors write ergonomic flow scripts.
- Go owns sessions, modules, security, event dispatch, and persistence.
- Browser receives only JSON and opaque action ids.
- Browser posts exact interaction events back to Go.
- Go invokes registered Goja callbacks under a per-session lock/timeout.
- JS callbacks mutate JSON-serializable flow state and return next page JSON.
- Current callbacks are valid only for the current page version.
- Old callbacks become stale after a successful re-render and should not be invoked.
- Retain processed events and retired action metadata only briefly for idempotency and stale-page recovery.

The resulting model gives the user what they want: a backend-hosted JavaScript DSL where callbacks are registered during page construction and invoked later when frontend interactions happen, while preserving a safe and inspectable JSON boundary between backend and browser.

The most important lifecycle rule is:

```text
VM lifetime: whole flow session
State lifetime: whole flow session
Action callback lifetime: current page version
Old action behavior: stale/recover current page, never silently run
```

---

## Implementation Update: Backend Runtime and Frontend Bridge Completed Through First End-to-End Slice

The first implementation slice described in this guide now exists in the repository. The implementation does not yet include production session persistence, user ownership checks, action pruning, or a full six-step intake flow, but it does implement the central architecture end to end.

The current implemented path is:

```text
Goja intake.flow.js
  -> pkg/dslgoja Runtime.StartFlow
  -> JSON DslPage with opaque action refs
  -> /api/dsl/flows/{flowId}/start
  -> BackendDslPage fetches page
  -> DslPageRenderer renders widgets
  -> widget interaction calls backendDispatch
  -> /api/dsl/flows/{sessionId}/events
  -> FlowSession.Dispatch invokes registered Goja callback
  -> callback mutates ctx.state and returns render(ctx)
  -> backend returns next page JSON
  -> BackendDslPage replaces current page
```

### Backend files added

| File | Role |
|---|---|
| `pkg/dslgoja/schema.go` | Go structs for the JSON page/event contract. |
| `pkg/dslgoja/runtime.go` | Goja runtime, flow session, render transaction, action registration, dispatch. |
| `pkg/dslgoja/modules_dsl.go` | `require("fringe/dsl")` builder module installed into Goja. |
| `pkg/dslgoja/flows/intake.flow.js` | Embedded two-step service/color intake prototype. |
| `pkg/dslgoja/flows.go` | `go:embed` wrapper for the demo flow source. |
| `pkg/server/handlers_dsl.go` | HTTP endpoints and in-memory flow store. |
| `pkg/server/http.go` | Route registration for DSL endpoints. |

### Frontend files added or changed

| File | Role |
|---|---|
| `web/src/page-dsl/backendClient.ts` | Client functions for start/get/event endpoints. |
| `web/src/page-dsl/BackendDslPage.tsx` | React container that owns backend page state and posts interactions. |
| `web/src/page-dsl/render.tsx` | Renderer support for backend `props.actions` refs plus local fallback actions. |
| `web/src/page-dsl/schema.ts` | Backend action-ref and dispatch types. |
| `web/src/page-dsl/BackendDslPage.stories.tsx` | Storybook demo using a mocked backend-shaped client. |
| `web/src/page-dsl/BackendDslPage.test.tsx` | Tests for renderer backend dispatch and BackendDslPage client integration. |

### Current validation commands

The implementation has been validated with:

```bash
go test ./... -count=1
cd web && pnpm test -- --runInBand
cd web && npx tsc --noEmit
cd web && npx storybook build --test
```

At the time of this update, the focused web test run reports 5 test files and 19 passing tests. The Go test run covers all packages, including `pkg/dslgoja` and `pkg/server`.

### What this slice proves

This slice proves the core claim of the architecture: backend-hosted JavaScript can author a page, register callbacks, return JSON to the browser, and later receive browser interaction events that dispatch into the registered callbacks. The browser does not execute flow logic. It renders JSON and reports events.

### What remains prototype-only

The current implementation is still a first slice. These parts remain intentionally incomplete:

- The flow store is in-memory and has no session expiry.
- There are no user ownership checks around DSL sessions.
- Retired actions and processed events are not pruned yet.
- The embedded intake flow has two steps, not the full service/color/photos/budget/booking/confirm sequence.
- The Storybook backend demo uses a mocked backend client; the real backend endpoints are tested by Go HTTP handler tests.
- The frontend does not yet expose a production route for `BackendDslPage` because the current web package is primarily component/story focused.

The next productionization pass should address those points in that order: session lifecycle, auth/ownership, cleanup/pruning, full flow steps, and route integration.
