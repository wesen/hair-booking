---
Title: Backend Driven DSL Callback Architecture Guide
Ticket: HAIR-033
Status: active
Topics:
    - frontend
    - backend
    - react
    - dsl
    - state-management
    - api-design
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/intake/service.go
      Note: Existing backend intake domain service that future DSL handlers may call
    - Path: pkg/server/http.go
      Note: Current Go standard-library route registration pattern
    - Path: pkg/server/http.go:Current Go HTTP routing style using standard library ServeMux
    - Path: web/src/page-dsl/InteractiveDsl.stories.tsx
      Note: Current browser-local interactive DSL proof-of-concept
    - Path: web/src/page-dsl/InteractiveDsl.stories.tsx:Current local-state proof of interactive DSL pages
    - Path: web/src/page-dsl/builder.ts
      Note: Current frontend builder API as reference for backend builder ergonomics
    - Path: web/src/page-dsl/builder.ts:Current TypeScript builder API that emits JSON
    - Path: web/src/page-dsl/render.tsx
      Note: Current React interpreter and local action routing to extend with backend dispatch
    - Path: web/src/page-dsl/render.tsx:Current React interpreter that turns JSON nodes into widgets and local action callbacks
    - Path: web/src/page-dsl/schema.ts
      Note: Current frontend DSL schema and local action payload model to evolve
    - Path: web/src/page-dsl/schema.ts:Current frontend JSON DSL schema and runtime action payload shape
ExternalSources: []
Summary: 'Architecture guide for making the Fringe page DSL backend-driven: backend builds pages, registers callbacks, sends JSON with opaque action references, frontend posts interaction events back, backend dispatches handlers and returns the next page/effects.'
LastUpdated: 2026-05-13T10:55:00-04:00
WhatFor: Use this guide when implementing server-driven DSL pages and callback dispatch for Fringe intake flows.
WhenToUse: Use before adding pkg/dsl, backend DSL HTTP endpoints, frontend DSL client transport, or replacing local Storybook actions with backend event dispatch.
---


# Backend Driven DSL Callback Architecture Guide

## Executive Summary

The current Fringe DSL runs in the browser: TypeScript builder code creates JSON, React renders the JSON, and Storybook passes local `context.actions` callbacks into `DslPageRenderer`. That is useful for prototyping, but it does not match the desired production model.

The target model is **backend-driven UI with backend-registered callbacks**:

1. Backend code builds a page using a DSL builder.
2. While building the page, backend code registers callbacks for interactions such as:
   - selecting a tab,
   - changing a select list,
   - toggling chips,
   - uploading/removing a photo,
   - pressing the bottom navigation button.
3. The backend sends JSON to the browser. The JSON contains opaque action references, not executable functions.
4. The browser renders the page with React.
5. When the user interacts, the browser sends an event to the backend containing exactly what happened:
   - page instance,
   - node id,
   - action reference,
   - event type,
   - selected value,
   - metadata,
   - client sequence/event id.
6. The backend looks up the registered handler for that page/action, invokes it, updates server-side state, and returns the next page JSON and/or effects.
7. The browser replaces or patches the rendered page.

The important idea is:

> Callbacks are never serialized to the browser. The browser receives opaque action ids. It reports action ids back. The backend owns the callback registry and dispatches the correct handler.

This guide explains the architecture, data model, API, security model, implementation plan, and how the current frontend DSL should evolve.

## Current System Snapshot

### Current frontend DSL files

| File | Current responsibility |
|---|---|
| `web/src/page-dsl/schema.ts` | Defines `DslPage`, `DslNode`, `DslNodeKind`, `DslActionPayload`, and render context types. |
| `web/src/page-dsl/builder.ts` | TypeScript builder helpers such as `page(...)`, `n.segmented(...)`, `n.chipGroup(...)`. |
| `web/src/page-dsl/render.tsx` | React interpreter that maps JSON nodes to widgets and invokes local `context.actions`. |
| `web/src/page-dsl/InteractiveDsl.stories.tsx` | Storybook proof that local React state can drive interactive DSL pages. |
| `web/src/fringe-ui/interactions.ts` | Shared interaction metadata types for app-ready widgets. |

### Current backend style

The Go backend uses standard library `net/http` with `http.ServeMux`. The central route registration lives in:

```text
pkg/server/http.go
```

The current backend has service packages for appointments, clients, intake submissions, services/catalog, storage, and stylist workflows. The DSL backend runtime should follow the same pattern:

```text
pkg/dsl/              # DSL schema, builder, session/callback registry, runtime
pkg/server/handlers_dsl.go  # HTTP endpoints for page fetch and interaction events
```

### Current limitation

The current DSL action model is local to the browser:

```tsx
<DslPageRenderer
  page={dsl}
  context={{
    actions: {
      tonesChanged: (payload) => setState(...),
    },
  }}
/>
```

This is good for Storybook, but production needs:

```text
Browser interaction -> POST /api/dsl/pages/{pageInstanceId}/events -> backend handler -> next page JSON
```

## Problem Statement

The user wants backend-authored pages with backend-registered callbacks. In plain terms:

- Backend code should be able to say: "render this select list; when it changes, call this handler".
- Browser should not contain the business logic for that handler.
- Browser should tell the backend exactly which UI action occurred.
- Backend should find the registered handler for that page instance and invoke it.
- Backend should return the next UI state.

This is a server-driven UI problem. It is similar to how web forms submit to a server, but more granular: every widget interaction can become an event.

## Target Mental Model

Think of each rendered DSL page as a **page instance**.

A page instance has:

- an id,
- a JSON page tree,
- server-side page state,
- a map of registered actions,
- ownership/session information,
- expiry information,
- optional persisted flow state.

The browser receives:

- the page id,
- the JSON page tree,
- opaque action ids embedded in node props.

The browser does not receive:

- Go closures,
- handler functions,
- private business logic,
- full server state,
- secrets.

When the user clicks a button or changes a selection, the browser posts an event back to the page instance.

## High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│ Backend                                                          │
│                                                                  │
│  Flow code builds page:                                          │
│                                                                  │
│    page := dsl.NewPage("intake-service")                        │
│    page.Segmented(...).OnChange(ctx.Register("categoryChanged"))│
│    page.Footer().OnNext(ctx.Register("next"))                   │
│                                                                  │
│  Register() creates opaque action refs and stores handlers.       │
└──────────────────────────────┬───────────────────────────────────┘
                               │ GET/POST returns JSON page
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│ Browser                                                          │
│                                                                  │
│  React renders JSON.                                             │
│  Widgets call dispatchDslEvent(...) on interaction.              │
│                                                                  │
│  Event includes: pageInstanceId, nodeId, actionRef, value, meta.  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ POST interaction event
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend                                                          │
│                                                                  │
│  Validate session/page/action.                                   │
│  Lookup handler by actionRef.                                    │
│  Execute handler.                                                │
│  Update server flow state.                                       │
│  Return next page JSON/effects.                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Core Design Principle: Opaque Action References

A backend callback cannot be sent to the browser. A function pointer or Go closure is not JSON. Even if it were serializable, it would be unsafe.

Instead, backend registration returns an **action reference**:

```json
{
  "actionId": "act_01HX...",
  "event": "change"
}
```

The action reference is safe to send to the browser because it is just an opaque token. The backend stores the real handler mapping:

```text
actionId act_01HX... -> pageInstance int_123 -> handler categoryChanged
```

When the browser sends `actionId` back, the backend checks:

- Does this page instance exist?
- Does this action id belong to this page instance?
- Is the current user/session allowed to use this page instance?
- Is the event not expired?
- Has this event id already been processed?

Only then does it invoke the handler.

## Proposed Backend Package Layout

```text
pkg/dsl/
  schema.go          # Go structs equivalent to frontend DslPage/DslNode
  builder.go         # Go builder API for authoring pages
  actions.go         # ActionRef, HandlerFunc, Registry interfaces
  runtime.go         # PageRuntime: build pages, register actions, dispatch events
  sessions.go        # PageInstance storage and expiry
  events.go          # InteractionEvent and InteractionResult DTOs
  validation.go      # schema/action/value validation

pkg/server/
  handlers_dsl.go    # HTTP endpoints for page fetch and event dispatch

web/src/page-dsl/
  schema.ts          # TS mirror of JSON contract
  backendClient.ts   # fetch page and post events
  render.tsx         # renderer dispatches backend events instead of local callbacks
  BackendDslPage.tsx # page container with loading/error/update behavior
```

## Data Model

### Page Instance

A page instance represents one backend-created UI page for one user/session/flow.

```go
type PageInstance struct {
    ID          string
    FlowID      string
    UserID      string
    Page        DslPage
    State       map[string]any
    Actions     map[string]RegisteredAction
    Version     int64
    CreatedAt   time.Time
    ExpiresAt   time.Time
}
```

Important fields:

- `ID`: stable id used in API URLs.
- `FlowID`: intake flow, booking flow, stylist workflow, etc.
- `UserID`: owner for authorization.
- `Page`: current JSON page.
- `State`: server-side working state.
- `Actions`: allowed actions for this exact page.
- `Version`: used to reject stale client events or resolve races.
- `ExpiresAt`: prevents old pages from invoking handlers forever.

### Registered Action

```go
type RegisteredAction struct {
    ID         string
    NodeID     string
    Event      string
    HandlerKey string
    Args       map[string]any
}
```

Where:

- `ID` is the opaque action id sent to the browser.
- `NodeID` identifies the node the action belongs to.
- `Event` is `change`, `click`, `next`, `upload`, etc.
- `HandlerKey` is a symbolic backend handler name.
- `Args` are serializable bound arguments.

### Handler Function

```go
type HandlerFunc func(ctx context.Context, req HandlerRequest) (*HandlerResult, error)

type HandlerRequest struct {
    PageInstance *PageInstance
    Event        InteractionEvent
    Action       RegisteredAction
    UserID       string
}

type HandlerResult struct {
    StatePatch map[string]any
    NextPage   *DslPage
    Effects    []Effect
}
```

Handlers receive the page instance, event payload, registered action, and user identity. They return updated state, a next page, and optional effects.

### Interaction Event

The browser sends this to the backend:

```json
{
  "eventId": "evt_01HX...",
  "pageInstanceId": "pg_01HX...",
  "pageVersion": 7,
  "nodeId": "category-tabs",
  "nodeKind": "segmented",
  "actionId": "act_01HX...",
  "event": "change",
  "value": "color",
  "meta": {
    "previousValue": "cut",
    "source": "pointer"
  },
  "clientTime": "2026-05-13T10:55:00Z"
}
```

Required fields:

- `eventId`: idempotency key from browser.
- `pageInstanceId`: which page instance this event belongs to.
- `pageVersion`: client version of the page.
- `nodeId`: exactly which node interacted.
- `actionId`: opaque backend action reference.
- `event`: type of event.
- `value`: selected/entered value.

Optional fields:

- `nodeKind`: useful for diagnostics.
- `meta`: widget-provided metadata.
- `clientTime`: debugging only; server time is authoritative.

### Interaction Result

The backend returns:

```json
{
  "data": {
    "pageInstanceId": "pg_01HX...",
    "pageVersion": 8,
    "page": { "schemaVersion": 1, "id": "...", "nodes": [] },
    "effects": [
      { "kind": "toast", "message": "Saved" }
    ]
  }
}
```

The simplest implementation returns the full next page every time. Later, the API can support patches.

## JSON Schema Changes Needed

The current frontend schema has local action names:

```ts
props: {
  action: "categoryChanged"
}
```

Backend-driven pages need opaque action refs. Recommended node prop shape:

```json
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
      "change": {
        "id": "act_01HX...",
        "event": "change"
      }
    }
  }
}
```

For a footer navigation button in `IntakeShell`:

```json
{
  "shell": {
    "kind": "intake",
    "props": {
      "step": 2,
      "total": 9,
      "title": "Build the visit",
      "actions": {
        "next": { "id": "act_next_...", "event": "next" },
        "back": { "id": "act_back_...", "event": "back" },
        "skip": { "id": "act_skip_...", "event": "skip" }
      }
    }
  }
}
```

Important distinction:

- `action: "categoryChanged"` is fine for local Storybook.
- `actions.change.id = "act_..."` is the production backend-driven representation.

A migration path can support both for a while.

## Backend Builder API Design

The backend builder should be ergonomic like the TypeScript builder, but it must register action ids while building.

### Example: segmented tabs

Desired authoring experience:

```go
func BuildServicePage(ctx *dsl.BuildContext, state IntakeState) dsl.Page {
    return dsl.Page("service", "Service").
        Intake(dsl.IntakeShellProps{
            Step:  2,
            Total: 9,
            Title: "Build the visit",
            OnNext: ctx.Action("next", HandleNext),
            OnBack: ctx.Action("back", HandleBack),
        }).
        Add(
            dsl.Segmented("category-tabs").
                Value(state.Category).
                Options(
                    dsl.Option("cut", "Cut"),
                    dsl.Option("color", "Color"),
                    dsl.Option("extensions", "Extensions"),
                ).
                OnChange(ctx.Action("categoryChanged", HandleCategoryChanged)),
        ).
        JSON()
}
```

What `ctx.Action(...)` does:

1. Generate `act_...` id.
2. Store handler in page instance registry.
3. Return a JSON-safe action reference.

Pseudocode:

```go
func (ctx *BuildContext) Action(handlerKey string, fn HandlerFunc, args ...Option) ActionRef {
    actionID := newActionID()
    ctx.registry[actionID] = RegisteredAction{
        ID:         actionID,
        HandlerKey: handlerKey,
        Handler:    fn,          // in-memory dev mode
        Args:       serializeArgs(args),
    }
    return ActionRef{ID: actionID, Event: inferEvent(handlerKey)}
}
```

## Handler Registration Models

There are two possible implementation levels.

### Level 1: In-memory closures, simplest development implementation

```go
ctx.Action("categoryChanged", func(ctx context.Context, req HandlerRequest) (*HandlerResult, error) {
    category := req.Event.Value.String()
    req.PageInstance.State["category"] = category
    nextPage := BuildServicePage(req.PageInstance.State)
    return &HandlerResult{NextPage: &nextPage}, nil
})
```

Pros:

- Fast to implement.
- Very ergonomic.
- Great for local development and single-process deployments.

Cons:

- Not durable across server restarts.
- Does not work if event goes to a different backend instance.
- Cannot persist closures in the database.

### Level 2: Symbolic handler keys plus serializable bound arguments

Production should prefer symbolic handlers:

```go
runtime.RegisterHandler("intake.categoryChanged", HandleCategoryChanged)
```

When building the page:

```go
OnChange: ctx.Action("intake.categoryChanged", map[string]any{
    "field": "category",
})
```

The page instance stores:

```json
{
  "id": "act_123",
  "handlerKey": "intake.categoryChanged",
  "args": { "field": "category" }
}
```

On event dispatch:

```go
registered := page.Actions[event.ActionID]
handler := runtime.Handlers[registered.HandlerKey]
return handler(ctx, HandlerRequest{Action: registered, Event: event})
```

Pros:

- Can persist page instances.
- Survives restarts.
- Works across multiple backend instances.
- Easier to audit/security review.

Cons:

- Slightly more boilerplate.
- Handlers must load state from storage instead of closing over local variables.

### Recommendation

Implement Level 1 first only if speed matters. Design the data structures for Level 2 from the beginning. Do not let the browser depend on handler names directly; the browser should only see opaque action ids.

## Request/Response API Design

### Create or fetch a page

```http
POST /api/dsl/flows/intake/start
Content-Type: application/json
```

Request:

```json
{
  "flow": "intake",
  "initialState": {
    "category": "color"
  }
}
```

Response:

```json
{
  "data": {
    "pageInstanceId": "pg_01HX...",
    "pageVersion": 1,
    "page": { "schemaVersion": 1, "id": "intake-service", "nodes": [] }
  }
}
```

Alternative for existing page:

```http
GET /api/dsl/pages/{pageInstanceId}
```

### Dispatch an event

```http
POST /api/dsl/pages/{pageInstanceId}/events
Content-Type: application/json
```

Request:

```json
{
  "eventId": "evt_01HX...",
  "pageVersion": 1,
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

Response:

```json
{
  "data": {
    "pageInstanceId": "pg_01HX...",
    "pageVersion": 2,
    "page": { "schemaVersion": 1, "id": "intake-service", "nodes": [] },
    "effects": []
  }
}
```

### Error response

Follow the existing API envelope pattern in `pkg/server/http.go`:

```json
{
  "error": {
    "code": "invalid_dsl_action",
    "message": "Action does not belong to this page instance"
  }
}
```

Recommended error codes:

| Code | Meaning |
|---|---|
| `dsl_page_not_found` | Page instance does not exist or expired. |
| `dsl_action_not_found` | Action id is unknown for the page. |
| `dsl_stale_page` | Client posted an event for an older page version. |
| `dsl_invalid_event` | Event shape/value is invalid. |
| `dsl_forbidden` | User/session does not own this page. |
| `dsl_handler_failed` | Backend handler returned an error. |

## Frontend Runtime Design

The frontend needs a backend-aware page container in addition to the pure renderer.

### Components

```text
BackendDslPage
  ├─ fetches initial page
  ├─ stores page JSON and pageVersion
  ├─ creates dispatchBackendEvent(actionRef, node, value, meta)
  └─ renders DslPageRenderer with backend action context
```

### Proposed file

```text
web/src/page-dsl/BackendDslPage.tsx
```

### Pseudocode

```tsx
function BackendDslPage({ pageInstanceId }) {
  const [pageState, setPageState] = useState(null);

  useEffect(() => {
    getDslPage(pageInstanceId).then(setPageState);
  }, [pageInstanceId]);

  async function dispatch(event) {
    const result = await postDslEvent(pageState.pageInstanceId, {
      ...event,
      eventId: crypto.randomUUID(),
      pageVersion: pageState.pageVersion,
    });
    setPageState(result);
    runEffects(result.effects);
  }

  return (
    <DslPageRenderer
      page={pageState.page}
      context={{ backendDispatch: dispatch }}
    />
  );
}
```

The renderer needs to detect backend action refs:

```ts
function resolveAction(node, eventName) {
  const actionRef = node.props?.actions?.[eventName];
  if (actionRef) {
    return (value, meta) => backendDispatch({ node, actionRef, value, meta });
  }

  // fallback for Storybook/local mode
  const localName = node.props?.action;
  return localActions[localName];
}
```

## Browser Event Payload Construction

When a user changes a segmented control:

```tsx
<Segmented
  value={props.value}
  options={props.options}
  onChange={(value, meta) => {
    dispatchBackendEvent({
      nodeId: node.meta.id,
      nodeKind: node.kind,
      actionId: props.actions.change.id,
      event: "change",
      value,
      meta,
    });
  }}
/>
```

When the bottom button is pressed:

```tsx
<IntakeShell
  onNext={() => dispatchBackendEvent({
    nodeId: "shell",
    nodeKind: "intakeShell",
    actionId: page.shell.props.actions.next.id,
    event: "next",
    value: null,
  })}
/>
```

This is how the browser tells the backend exactly what button got pressed.

## Backend Dispatch Flow

```text
POST /api/dsl/pages/{pageInstanceId}/events
        │
        ▼
Decode InteractionEvent
        │
        ▼
Load PageInstance by pageInstanceId
        │
        ▼
Authorize current user/session owns PageInstance
        │
        ▼
Validate pageVersion and eventId idempotency
        │
        ▼
Lookup RegisteredAction by actionId
        │
        ▼
Check action.NodeID == event.NodeID (or allow shell actions)
        │
        ▼
Lookup HandlerFunc by HandlerKey
        │
        ▼
Execute handler
        │
        ▼
Persist state/page/action registry
        │
        ▼
Return next page/effects
```

Pseudocode:

```go
func (rt *Runtime) Dispatch(ctx context.Context, pageID string, event InteractionEvent) (*InteractionResult, error) {
    page, err := rt.store.GetPageInstance(ctx, pageID)
    if err != nil { return nil, ErrPageNotFound }

    if !rt.auth.CanUse(ctx, page) { return nil, ErrForbidden }

    if rt.store.HasProcessedEvent(ctx, page.ID, event.EventID) {
        return rt.store.GetCachedResult(ctx, page.ID, event.EventID)
    }

    action, ok := page.Actions[event.ActionID]
    if !ok { return nil, ErrActionNotFound }

    if action.NodeID != event.NodeID {
        return nil, ErrInvalidActionForNode
    }

    handler, ok := rt.handlers[action.HandlerKey]
    if !ok { return nil, ErrHandlerNotFound }

    result, err := handler(ctx, HandlerRequest{
        PageInstance: page,
        Event:        event,
        Action:       action,
    })
    if err != nil { return nil, err }

    nextPage := result.NextPage
    if nextPage == nil {
        rebuilt := rt.rebuildCurrentFlowPage(ctx, page)
        nextPage = &rebuilt
    }

    page.Version++
    page.Page = *nextPage
    rt.store.SavePageInstance(ctx, page)
    rt.store.SaveEventResult(ctx, event.EventID, result)

    return &InteractionResult{
        PageInstanceID: page.ID,
        PageVersion:    page.Version,
        Page:           *nextPage,
        Effects:        result.Effects,
    }, nil
}
```

## Example End-to-End Flow

### Backend authoring code

```go
func BuildIntakeCategoryPage(ctx *dsl.BuildContext, state IntakeState) dsl.Page {
    return dsl.Page("intake-category", "Choose service").
        Intake(dsl.IntakeShellProps{
            Step:  1,
            Total: 9,
            Title: "What brings you in?",
            OnNext: ctx.Action("intake.next", map[string]any{"step": "category"}),
        }).
        Add(
            dsl.Segmented("category-tabs").
                Value(state.Category).
                Options(
                    dsl.Option("cut", "Cut"),
                    dsl.Option("color", "Color"),
                    dsl.Option("extensions", "Extensions"),
                ).
                OnChange(ctx.Action("intake.setField", map[string]any{"field": "category"})),
        )
}
```

### JSON sent to browser

```json
{
  "pageInstanceId": "pg_123",
  "pageVersion": 1,
  "page": {
    "schemaVersion": 1,
    "id": "intake-category",
    "shell": {
      "kind": "intake",
      "props": {
        "step": 1,
        "total": 9,
        "title": "What brings you in?",
        "actions": {
          "next": { "id": "act_next", "event": "next" }
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
            "change": { "id": "act_category", "event": "change" }
          }
        }
      }
    ]
  }
}
```

### Browser event

User clicks `Extensions`:

```json
{
  "eventId": "evt_abc",
  "pageVersion": 1,
  "nodeId": "category-tabs",
  "nodeKind": "segmented",
  "actionId": "act_category",
  "event": "change",
  "value": "extensions",
  "meta": {
    "previousValue": "color",
    "source": "pointer"
  }
}
```

### Backend handler

```go
func HandleSetField(ctx context.Context, req dsl.HandlerRequest) (*dsl.HandlerResult, error) {
    field := req.Action.Args["field"].(string)
    value := req.Event.Value.String()

    req.PageInstance.State[field] = value

    next := BuildIntakeCategoryPage(req.BuildContext(), DecodeIntakeState(req.PageInstance.State))
    return &dsl.HandlerResult{NextPage: &next}, nil
}
```

### Browser update

Backend returns a new page with:

```json
"value": "extensions"
```

The frontend replaces the current page JSON and the `Extensions` tab becomes selected.

## State Ownership

There are three possible state ownership models.

### Model A: Backend authoritative, full page replacement

Every interaction posts to backend. Backend returns a new full page.

Pros:

- Simple mental model.
- Business logic stays on backend.
- Browser cannot get out of sync for long.
- Good fit for the user's request.

Cons:

- More network traffic.
- Interactions feel slower if backend latency is high.

Recommended for first implementation.

### Model B: Backend authoritative, frontend optimistic update

Browser applies a local optimistic selection immediately, posts event, then reconciles with backend response.

Pros:

- Faster perceived UI.

Cons:

- More complex.
- Needs rollback on backend rejection.

Defer until Model A works.

### Model C: Frontend owns form state, backend only receives final submit

This is the current normal SPA style. It is not what the user asked for.

Rejected for backend-driven DSL callbacks.

## Security and Correctness Requirements

### Never trust browser action names

The browser should not send `handlerKey = "deleteEverything"`. It should only send opaque `actionId` values that were issued for this page instance.

### Validate ownership

A page instance belongs to a user/session. A user must not be able to post events to another user's page instance.

### Validate action belongs to page

An action id must be present in `PageInstance.Actions`.

### Validate action belongs to node

The `nodeId` from the browser should match the registered action's `NodeID`.

### Use idempotency keys

Browsers retry requests. Users double-click. Networks duplicate requests. Every event should include `eventId`, and the backend should cache results for processed event ids.

### Expire page instances

Do not allow old action ids to live forever. Page instances should expire or be tied to a durable flow record.

### Validate values

If the `category` segmented control only has `cut`, `color`, `extensions`, reject `"admin"` or arbitrary JSON.

### CSRF/session protection

Use existing auth/session patterns. If cookie-authenticated, mutation endpoints need CSRF protection or same-site cookie discipline.

## Persistence Strategy

### Development/simple mode

Store page instances in memory:

```go
type MemoryPageStore struct {
    mu sync.RWMutex
    pages map[string]*PageInstance
}
```

Good for Storybook-like backend demos and local development.

### Production mode

Persist page instances or flow state in Postgres.

Recommended table sketch:

```sql
CREATE TABLE dsl_page_instances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  flow_id TEXT NOT NULL,
  version BIGINT NOT NULL,
  page_json JSONB NOT NULL,
  state_json JSONB NOT NULL,
  actions_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE dsl_processed_events (
  page_instance_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  result_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (page_instance_id, event_id)
);
```

Important: If using symbolic handler keys, `actions_json` can be persisted. If using closure handlers, it cannot.

## Effects Model

Not every backend response is a page replacement. Some handlers should also trigger effects:

```json
{
  "kind": "toast",
  "message": "Saved"
}
```

Potential effects:

| Effect | Purpose |
|---|---|
| `toast` | Show message. |
| `navigate` | Change route/page. |
| `openFilePicker` | Prompt upload flow. |
| `download` | Start download. |
| `focus` | Focus a node. |
| `analytics` | Optional client event. |

Keep effects explicit and allow-listed.

## File Uploads

`PhotoTile` is special because browser file upload cannot be represented only as a small JSON value.

Recommended two-step flow:

1. User clicks photo tile.
2. Browser opens file picker.
3. Browser uploads file to existing upload endpoint or new DSL upload endpoint.
4. Backend returns a storage/upload id.
5. Browser posts DSL event:

```json
{
  "event": "uploadComplete",
  "actionId": "act_photo_front",
  "value": {
    "slot": "front",
    "uploadId": "upl_123"
  }
}
```

This keeps the DSL event small and lets the backend handler attach the upload to the current intake flow.

Current related backend code:

```text
pkg/server/photo_upload.go
pkg/intake/service.go
pkg/storage/storage.go
```

## How This Fits the Current App

The current app already has intake services and backend routing. The backend-driven DSL layer can be introduced without replacing everything at once.

Recommended first integration:

1. Add `pkg/dsl` with in-memory runtime.
2. Add `GET /api/dsl/demo/intake` to create/fetch a demo page.
3. Add `POST /api/dsl/pages/{id}/events` for event dispatch.
4. Add frontend `BackendDslPage` demo route or Storybook story that points at the backend.
5. Once stable, connect handlers to `pkg/intake.Service` and real intake submissions.

## Implementation Plan

### Phase 1: Mirror schema in Go

Create:

```text
pkg/dsl/schema.go
```

Define:

```go
type Page struct {
    SchemaVersion int      `json:"schemaVersion"`
    ID            string   `json:"id"`
    Title         string   `json:"title"`
    Shell         Shell    `json:"shell"`
    Nodes         []Node   `json:"nodes"`
}

type Node struct {
    Kind     string         `json:"kind"`
    Props    map[string]any `json:"props,omitempty"`
    Children []Node         `json:"children,omitempty"`
    Meta     NodeMeta       `json:"meta,omitempty"`
}
```

Keep the JSON field names aligned with `web/src/page-dsl/schema.ts`.

### Phase 2: Add backend builder

Create:

```text
pkg/dsl/builder.go
```

Add helpers:

```go
func NewPage(id, title string) *PageBuilder
func Segmented(id string) *NodeBuilder
func ChipGroup(id string) *NodeBuilder
func ServiceOptionGroup(id string) *NodeBuilder
```

Builder methods should set stable node ids by default.

### Phase 3: Add action registry/runtime

Create:

```text
pkg/dsl/actions.go
pkg/dsl/runtime.go
pkg/dsl/sessions.go
```

Core interfaces:

```go
type HandlerFunc func(context.Context, HandlerRequest) (*HandlerResult, error)

type Store interface {
    SavePageInstance(context.Context, *PageInstance) error
    GetPageInstance(context.Context, string) (*PageInstance, error)
    SaveEventResult(context.Context, string, string, *InteractionResult) error
    GetEventResult(context.Context, string, string) (*InteractionResult, bool, error)
}
```

### Phase 4: Add HTTP endpoints

Create:

```text
pkg/server/handlers_dsl.go
```

Add to `pkg/server/http.go`:

```go
mux.HandleFunc("POST /api/dsl/flows/intake/start", h.handleStartDSLIntake)
mux.HandleFunc("GET /api/dsl/pages/{id}", h.handleGetDSLPage)
mux.HandleFunc("POST /api/dsl/pages/{id}/events", h.handlePostDSLEvent)
```

### Phase 5: Add frontend backend client

Create:

```text
web/src/page-dsl/backendClient.ts
web/src/page-dsl/BackendDslPage.tsx
```

Client functions:

```ts
export async function startDslFlow(flow: string, initialState?: unknown): Promise<DslPageState>
export async function getDslPage(pageInstanceId: string): Promise<DslPageState>
export async function postDslEvent(pageInstanceId: string, event: DslInteractionEvent): Promise<DslInteractionResult>
```

### Phase 6: Adapt renderer action resolution

Current renderer resolves local action names. Add backend action refs:

```ts
function getActionRef(props, eventName) {
  return props.actions?.[eventName];
}
```

Then dispatch:

```ts
onChange={(value, meta) => {
  const ref = getActionRef(props, "change");
  if (ref) backendDispatch({ node, actionRef: ref, value, meta });
  else localAction(...);
}}
```

### Phase 7: Add tests

Backend tests:

- building a page registers actions,
- event dispatch invokes the right handler,
- invalid action id is rejected,
- action for wrong page is rejected,
- duplicate event id returns cached result,
- stale page version is handled.

Frontend tests:

- renderer posts event when segmented changes,
- shell next button posts `next`,
- backend response replaces page,
- error response is shown.

## API Reference Draft

### `ActionRef`

```ts
type ActionRef = {
  id: string;
  event: string;
};
```

### Node actions prop

```ts
type NodeActions = Record<string, ActionRef>;
```

Example:

```json
"actions": {
  "change": { "id": "act_123", "event": "change" }
}
```

### `DslInteractionEvent`

```ts
type DslInteractionEvent = {
  eventId: string;
  pageVersion: number;
  nodeId: string;
  nodeKind: string;
  actionId: string;
  event: string;
  value?: unknown;
  meta?: unknown;
};
```

### `DslPageState`

```ts
type DslPageState = {
  pageInstanceId: string;
  pageVersion: number;
  page: DslPage;
  effects?: Effect[];
};
```

## Diagrams

### Callback registration

```text
Backend builder code
        │
        │ ctx.Action("intake.setField", args)
        ▼
Action registry creates action id
        │
        ├─ stores: act_123 -> handlerKey + args + node id
        │
        └─ returns: { id: "act_123", event: "change" }
        ▼
Action ref embedded in JSON node props
```

### Interaction dispatch

```text
User clicks Extensions
        │
        ▼
Segmented onChange("extensions", meta)
        │
        ▼
Renderer reads props.actions.change.id
        │
        ▼
POST /api/dsl/pages/pg_123/events
        │
        ▼
Backend loads pg_123, finds act_123
        │
        ▼
Invoke intake.setField handler
        │
        ▼
Return pageVersion=2 and updated page JSON
        │
        ▼
Browser renders updated JSON
```

## Open Questions

- Should the first runtime be in-memory only, or start with Postgres persistence?
- Should page version mismatches be rejected or automatically rebased?
- Should backend return full page JSON every time, or support JSON patches early?
- Should action refs be signed tokens or random ids stored server-side?
- Should `node.meta.id` be required for all interactive nodes?
- How should long-running handlers report progress?
- Should the DSL support WebSocket/SSE for push updates later?

## Recommended First Slice

The smallest useful implementation should include:

1. `pkg/dsl/schema.go` with Go structs.
2. `pkg/dsl/runtime.go` with in-memory page/action store.
3. `pkg/server/handlers_dsl.go` with:
   - start demo page,
   - post event.
4. Frontend `BackendDslPage` that fetches and renders backend JSON.
5. One page with:
   - segmented category tabs,
   - chip group,
   - bottom next button.
6. Tests proving:
   - click segmented tab -> POST event -> backend handler -> returned page has new selected value.
   - click next -> POST event -> backend handler receives `next` action.

This slice proves the user's core requirement end-to-end.

## Intern Checklist

Before coding:

- Read `web/src/page-dsl/schema.ts`.
- Read `web/src/page-dsl/render.tsx`.
- Read `web/src/page-dsl/InteractiveDsl.stories.tsx`.
- Read `pkg/server/http.go` route registration style.

When coding:

- Keep JSON schema names aligned between Go and TypeScript.
- Never send handler names/functions to browser as executable authority.
- Always use opaque action ids in browser JSON.
- Always validate page id, action id, node id, user/session, and event id.
- Start with full page replacement; avoid premature patch complexity.

When reviewing:

- Can the browser trigger a handler that was not registered for this page?
- Can one user trigger another user's page actions?
- Does every interactive node have a stable `node.meta.id`?
- Are duplicate events idempotent?
- Does the frontend visibly update from backend response?
- Are errors user-visible and logged?

## Final Recommendation

Build this as a backend-owned page runtime, not as browser-owned state with backend callbacks bolted on. The frontend should be a renderer and event transport. The backend should be the source of truth for current page state, registered callbacks, and navigation decisions.

The production-grade shape is:

```text
Backend builder + registry -> JSON page with opaque action refs -> Browser renderer -> Event POST -> Backend dispatch -> Next JSON page
```

That architecture directly supports the user's desired workflow: backend DSL pages with callbacks registered during page construction and invoked later when the browser reports the exact interaction that happened.
