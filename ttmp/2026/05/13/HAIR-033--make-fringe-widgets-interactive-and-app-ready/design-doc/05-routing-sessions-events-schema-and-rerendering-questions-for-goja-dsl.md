---
Title: Routing Sessions Events Schema and Rerendering Questions for Goja DSL
Ticket: HAIR-033
Status: active
Topics:
    - frontend
    - backend
    - react
    - goja
    - dsl
    - api-design
    - protobuf
    - state-management
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Current source of stable node ids and backend action refs
    - Path: pkg/dslgoja/runtime.go
      Note: FlowSession eventId/pageVersion/action lifecycle semantics
    - Path: pkg/dslgoja/schema.go
      Note: Go page/event/action/effect contract discussed in protobuf section
    - Path: pkg/server/handlers_dsl.go
      Note: Current HTTP endpoint and in-memory DSL flow store behavior
    - Path: web/src/LiveDslDemoApp.tsx
      Note: Current live route shell and recommended place for URL/page sync and sessionStorage coordination
    - Path: web/src/page-dsl/BackendDslPage.tsx
      Note: Current frontend owner of in-memory DSL session state
    - Path: web/src/page-dsl/backendClient.ts
      Note: Fetch contract for start/get/event endpoints
    - Path: web/src/page-dsl/render.tsx
      Note: Renderer action dispatch and current index-key behavior discussed in rerendering section
    - Path: web/src/page-dsl/schema.ts
      Note: TypeScript page/event/action schema mirror discussed in protobuf section
ExternalSources: []
Summary: Detailed answers to design questions about routing, flow/session identity, multiple tabs, protobuf schema sharing, DOM flashing, stable IDs, and event/pageVersion semantics for the Goja-backed DSL runtime.
LastUpdated: 2026-05-13T11:20:00-04:00
WhatFor: Use this document to understand the next design decisions around making the Goja DSL runtime feel like a real app instead of only a JSON-rendered demo.
WhenToUse: Read before changing routing, session storage, BackendDslPage, DslPageRenderer keys, protobuf/schema strategy, or event dispatch semantics.
---


# Routing, Sessions, Events, Schema, and Rerendering Questions for the Goja DSL

## Executive Summary

The live Goja DSL demo proves the most important technical loop: React renders a backend-authored JSON page, a user clicks a widget, the browser sends an opaque action id back to Go, Go dispatches that action into a Goja callback, and React rerenders the page returned by the backend. That loop works. The next questions are product-integration questions: how the URL should behave, where the flow/session identity should live, what multiple tabs mean, whether the JSON contract should be generated from protobuf, why some DOM pieces flash during rerender, and what the words "event", `eventId`, and `pageVersion` mean.

The short recommendations are:

- **Routes should be owned by the app shell, not by widgets and not by the low-level renderer.** The backend can return a page id or route metadata; the app shell can update the URL after successful backend responses.
- **`flowId` and `sessionId` are different things.** `flowId` names the script or flow definition, such as `fringe.intake.v1`. `sessionId` names one running instance of that flow for one user/session.
- **Right now the browser keeps the DSL session only in React memory.** The server keeps sessions in an in-memory Go map. There is no cookie, local storage, or durable persistence for DSL sessions yet.
- **For the next version, use tab-scoped `sessionStorage` for browser refresh recovery and server-side ownership checks for safety.** Avoid `localStorage` as the default because it causes different tabs to accidentally share the same flow session.
- **Multiple tabs can either be independent sessions or competing views of the same session.** Independent sessions are simplest. If two tabs share one `sessionId`, `pageVersion` prevents old-page actions from mutating current state.
- **Protobuf is a good next step for the stable transport contract, but not necessarily for every widget prop immediately.** Start by generating Go and TypeScript types for envelopes, pages, nodes, actions, events, and effects while keeping `props` as a JSON/Struct field.
- **Flashing DOM is mostly a frontend reconciliation and UX problem, but the backend must emit stable ids to let the frontend solve it.** The frontend should use `node.meta.id` as React keys instead of array indices. The backend/DSL author must make those ids stable across renders.
- **An event is the browser's description of one user interaction.** `eventId` is an idempotency key for retry/double-submit safety. `pageVersion` is an optimistic-concurrency check that prevents stale pages and old action ids from mutating current state.

This document explains those answers in detail for someone who has not been living in the codebase.

## Current System in One Diagram

```text
Browser route: /dsl-goja-demo

    LiveDslDemoApp
          |
          v
    BackendDslPage
      - starts a flow
      - stores sessionId/pageVersion/page in React state
      - sends backend events
          |
          v
    DslPageRenderer
      - renders page.nodes
      - maps node.kind to React components
      - reads props.actions[eventName]
          |
          v
POST /api/dsl/flows/{sessionId}/events
          |
          v
    Go HTTP handler
          |
          v
    FlowSession.Dispatch
      - checks eventId
      - checks pageVersion
      - checks actionId
      - invokes Goja callback
          |
          v
    intake.flow.js callback
      - mutates ctx.state
      - returns render(ctx)
          |
          v
    JSON page response
          |
          v
    React rerenders
```

The important thing is that the frontend is not choosing the next step. The frontend reports what the user did. The backend flow decides what the next page is.

## 1. How Should Routes and URL Updates Work?

### Current behavior

The new live demo has a Vite route-like URL:

```text
/dsl-goja-demo
```

But the app does not yet use a router. `web/src/App.tsx` simply renders `LiveDslDemoApp`, and `LiveDslDemoApp` renders `BackendDslPage`. When the user moves from the service step to the color step, the URL does not change. The app state changes because `BackendDslPage` receives a new JSON page from the backend.

Current URL behavior:

```text
Browser URL: /dsl-goja-demo
Backend page: intake-service
click next
Browser URL: /dsl-goja-demo
Backend page: intake-color
```

This is acceptable for the first proof because the goal was to test backend action dispatch. It is not enough for a real app because users expect the URL, refresh behavior, and browser back button to make sense.

### The key design decision

Routes should be owned by the app shell. They should not be owned by individual widgets, and they should not be owned by the low-level `DslPageRenderer`.

The reason is separation of responsibilities:

- `DslPageRenderer` should interpret JSON and render components.
- `BackendDslPage` should manage one backend flow session and send events.
- `LiveDslDemoApp` or a future app router should decide how backend page state maps to the browser URL.

If route updates are placed inside the renderer, every component-level render becomes tangled with app navigation. If route updates are placed in Goja directly as full URLs, the backend becomes too aware of the frontend deployment shape. A better boundary is for the backend to return stable page identity, and for the app shell to decide how to display that identity in the URL.

### Recommended route model for the next phase

Use three route concepts:

| Concept | Example | Owner | Meaning |
|---|---|---|---|
| Product route | `/intake` or `/dsl-goja-demo` | frontend app shell | The user is in the intake app. |
| Flow id | `fringe.intake.v1` | app configuration / backend | Which backend flow script to run. |
| Page slug | `service`, `color`, `photos` | backend page id mapped by frontend | Which step is currently visible. |

A practical next version could use:

```text
/dsl-goja-demo/service
/dsl-goja-demo/color
```

or later:

```text
/intake/service
/intake/color
/intake/photos
```

The backend already returns page ids such as:

```text
intake-service
intake-color
```

The frontend can map those page ids to slugs:

```ts
const pageSlugById: Record<string, string> = {
  "intake-service": "service",
  "intake-color": "color",
  "intake-photos": "photos",
  "intake-budget": "budget",
  "intake-estimate": "estimate",
  "intake-booking": "booking",
  "intake-confirm": "confirm",
};
```

Then, after every successful backend response, the app shell can update the URL:

```ts
function syncUrlToPage(state: DslFlowState) {
  const slug = pageSlugById[state.page.id] ?? state.page.id;
  const nextUrl = `/dsl-goja-demo/${slug}`;

  if (window.location.pathname !== nextUrl) {
    window.history.replaceState({ sessionId: state.sessionId, pageVersion: state.pageVersion }, "", nextUrl);
  }
}
```

For the demo, use `replaceState`, not `pushState`, at first. That avoids creating a browser history entry for every selection click. Later we can choose to `pushState` only for true step navigation, such as Next and Back.

### Why not let every click push a new URL?

A color chip click and a service option click are not route transitions. They are field updates within a step. If every field update pushes history, the browser Back button becomes noisy:

```text
Back -> undo damage rating
Back -> undo tone chip
Back -> undo service option
Back -> previous step
```

That is usually not what users expect. Users expect Back to mean a major navigation step, not every micro-interaction.

A better rule is:

- Same page id after response: use `replaceState`.
- Different page id after response: consider `pushState`, or use `replaceState` until browser-back semantics are designed.

Pseudocode:

```ts
function onBackendState(next: DslFlowState, previous: DslFlowState | null) {
  const nextSlug = slugForPage(next.page.id);
  const nextUrl = `/dsl-goja-demo/${nextSlug}`;

  if (!previous) {
    history.replaceState(snapshot(next), "", nextUrl);
    return;
  }

  if (next.page.id !== previous.page.id) {
    history.pushState(snapshot(next), "", nextUrl);
  } else {
    history.replaceState(snapshot(next), "", nextUrl);
  }
}
```

### Browser Back is not trivial

Browser Back is hard in server-driven flows because the backend state is authoritative. Suppose the user is on the color step at page version 5 and presses browser Back to `/dsl-goja-demo/service`. Should the backend state go back to service? Should it only change the URL? Should it call the same Goja callback as the shell Back button?

There are three possible policies:

| Policy | Behavior | Pros | Cons |
|---|---|---|---|
| URL mirrors current backend page only | Browser Back leaves the app or returns to previous product route. Shell Back handles flow navigation. | Simple and safe. | URL history is less rich. |
| Browser Back dispatches backend back action | `popstate` sends an event to Goja. | Browser Back behaves like app Back. | Requires a current backend action id for back, and can fail if stale. |
| Browser Back restores old snapshots | Browser stores prior page snapshots and displays them. | Looks fast. | Dangerous: old snapshots contain stale action ids and should not mutate backend state. |

Recommended first policy: **URL mirrors current backend page, but shell Back remains the authoritative flow-back action.** Do not implement snapshot restoration. Do not resurrect old actions from browser history.

### Proposed near-term route plan

Phase B route plan:

1. Add a small route/page sync helper in `LiveDslDemoApp` or a new `DslRouteController`.
2. Map backend `page.id` to a readable slug.
3. On first page load, replace URL with `/dsl-goja-demo/{slug}`.
4. On same-page updates, call `replaceState`.
5. On page-id changes, either `pushState` or `replaceState`; choose explicitly.
6. Do not implement browser Back restoring old snapshots yet.

A later production route can be:

```text
/intake/{stepSlug}
```

and it can map internally to:

```text
flowId = fringe.intake.v1
```

The user should not have to see `fringe.intake.v1` in the URL.

## 2. How Are `flowId` and `sessionId` Handled Right Now?

### The difference between `flowId` and `sessionId`

These two ids are easy to confuse, but they mean different things.

`flowId` identifies the flow definition. It is like the name of the program:

```text
fringe.intake.v1
```

`sessionId` identifies one running instance of that program. It is like a specific execution of the flow:

```text
flow_75ff68fc-e682-4a0a-85c3-2d5e3ba53de4
```

One `flowId` can have many sessions:

```text
fringe.intake.v1
  -> flow_A for Alice's current intake
  -> flow_B for Alice's second tab
  -> flow_C for Bob's intake
  -> flow_D for a test script
```

### Current frontend handling

Current live app behavior:

- `LiveDslDemoApp` renders `BackendDslPage`.
- `BackendDslPage` has default `flowId = "fringe.intake.v1"`.
- If no `sessionId` prop is provided, it calls `startDslFlow(flowId)`.
- The response includes `sessionId`, `pageVersion`, and `page`.
- `BackendDslPage` stores that response in React component state.

That means the browser currently stores the active DSL session only in memory:

```tsx
const [state, setState] = useState<DslFlowState | null>(null);
```

There is no DSL session cookie. There is no `localStorage`. There is no `sessionStorage`. If the user refreshes the page, the React state is lost and the app starts a new backend flow session.

### Current backend handling

The server stores sessions in an in-memory map:

```go
type dslFlowStore struct {
    mu       sync.RWMutex
    runtime  *dslgoja.Runtime
    sessions map[string]*dslgoja.FlowSession
}
```

When the browser calls:

```http
POST /api/dsl/flows/fringe.intake.v1/start
```

the server creates a new `FlowSession`, stores it in that map, and returns the session id.

Current limitations:

- Restarting the Go process loses all DSL sessions.
- There is no expiry cleanup.
- There is no per-user ownership check yet.
- Refreshing the browser starts a new session because the browser does not remember the previous one.

### Is it cookie, memory, or local storage today?

Today:

| Location | Used for DSL session today? | Details |
|---|---:|---|
| React memory | Yes | `BackendDslPage` stores the current `DslFlowState`. |
| Go memory | Yes | `dslFlowStore.sessions` stores active `FlowSession` objects. |
| Cookie | No | Auth may use cookies elsewhere, but DSL session id is not stored in a DSL cookie. |
| `localStorage` | No | The app does not persist DSL session id across tabs/browser restarts. |
| `sessionStorage` | No | The app does not yet persist per-tab DSL session id across refresh. |
| URL | No | The current URL does not include session id. |

### What would be best?

There is no single best answer for all stages. The right answer changes as we move from demo to production.

#### Best for the next demo phase

Use `sessionStorage`, not `localStorage`, to remember the session id for one browser tab.

Why `sessionStorage`:

- It survives page refresh in the same tab.
- It is scoped to a tab/window, so separate tabs are less likely to accidentally share a flow session.
- It is simple to implement.
- It avoids putting session ids in the URL during the early demo.

Pseudocode:

```ts
const STORAGE_KEY = "fringe.dsl.fringe.intake.v1.sessionId";

function loadSessionId() {
  return window.sessionStorage.getItem(STORAGE_KEY);
}

function saveSessionId(sessionId: string) {
  window.sessionStorage.setItem(STORAGE_KEY, sessionId);
}

function clearSessionId() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
```

Then `BackendDslPage` or its parent can do:

```ts
const existingSessionId = sessionStorage.getItem(STORAGE_KEY);

<BackendDslPage
  flowId="fringe.intake.v1"
  sessionId={existingSessionId ?? undefined}
  onStateChange={(state) => sessionStorage.setItem(STORAGE_KEY, state.sessionId)}
/>
```

If `GET /api/dsl/flows/{sessionId}` returns `dsl_session_not_found`, clear storage and start a new session.

#### Best for production

Use server-side ownership plus a browser resume mechanism.

Recommended production shape:

- The auth/session cookie identifies the user. It should be HttpOnly and managed by the normal auth layer.
- The backend stores DSL sessions with `userId`, `createdAt`, `lastSeenAt`, and `expiresAt`.
- The frontend can store a per-tab active DSL `sessionId` in `sessionStorage` for refresh recovery.
- The backend must reject access if the current user does not own the DSL session.
- A helper endpoint can resume the latest active flow for the current user if no tab-scoped session exists.

Example endpoint options:

```http
GET /api/dsl/flows/{sessionId}
GET /api/dsl/flows/current?flowId=fringe.intake.v1
POST /api/dsl/flows/{flowId}/start
POST /api/dsl/flows/{sessionId}/events
```

The key security rule:

```text
A session id alone must not be enough authority in production.
The current authenticated user must own the session.
```

### Should session id be in the URL?

For development, a URL like this is convenient:

```text
/dsl-goja-demo/service?session=flow_abc
```

For production intake flows, putting raw session ids in the URL has downsides:

- URLs appear in browser history.
- URLs can be copied into support tickets or screenshots.
- URLs can be sent as referrers to third-party resources unless referrer policy is strict.
- A copied URL can accidentally open the same backend session in another tab or device.

If we do put session identity in the URL, it should be treated as a lookup handle, not as authorization. The backend must still check ownership.

Recommended policy:

- **Demo:** either memory-only or `sessionStorage`; optional query param for debugging.
- **Production:** `sessionStorage` for per-tab resume plus server-side ownership; avoid making the raw session id a normal visible URL parameter unless there is a strong reason.

## 3. What Happens with Multiple Tabs Open to the Same Page?

There are two different cases.

### Case A: each tab starts its own session

This is the simplest and safest behavior.

```text
Tab 1 opens /intake -> starts flow_A
Tab 2 opens /intake -> starts flow_B
```

The two tabs are independent. Selecting `Extensions` in Tab 1 does not affect Tab 2. This is usually what happens today because the session id is only stored in React memory. Opening a new tab starts a new flow.

Pros:

- No stale-action collisions between tabs.
- Easy mental model for developers.
- Easy to reason about in the prototype.

Cons:

- A user could accidentally create multiple intake drafts.
- If one session becomes the real submitted intake, the other sessions may be abandoned.

### Case B: two tabs share the same session

This happens if we put `sessionId` in a URL, use `localStorage`, or implement a "resume latest session" endpoint that both tabs call.

```text
Tab 1 opens session flow_A at pageVersion 1
Tab 2 opens same session flow_A at pageVersion 1
Tab 1 clicks Extensions -> backend advances to pageVersion 2
Tab 2 clicks Color using pageVersion 1 -> backend sees stale event
```

The current backend is designed to prevent stale pages from mutating state. `FlowSession.Dispatch` checks:

```go
if event.PageVersion != s.Version {
    return s.stalePageResult("This page was already updated."), nil
}
```

So Tab 2's old action does not run. The backend returns the current page with an informational effect. That is good for correctness, but the UI still needs to handle the effect nicely.

### Why shared sessions are hard

A page contains action ids, and action ids are version-scoped. When Tab 1 updates the page, the old action ids in Tab 2 are no longer current. Invoking an old action would be dangerous because it might apply an outdated user intent to a newer state.

This is why the backend has:

- `CurrentActions`: valid for the current page version.
- `RetiredActions`: known old actions that should produce stale-page recovery.
- `ProcessedEvents`: already-seen event ids for retry/idempotency.
- `pageVersion`: the current version of the backend page state.

### Recommended multiple-tab policy

For the near-term demo:

```text
One tab = one flow session.
Use sessionStorage if refresh recovery is needed.
Do not use localStorage by default.
```

For production:

- If a user opens a new tab from scratch, start or ask whether to resume an active intake.
- If a user explicitly resumes the same intake in two tabs, allow it but expect stale-page effects.
- Use `BroadcastChannel` later if we want same-session tabs to stay visually synchronized.

A future synchronization design could look like this:

```ts
const channel = new BroadcastChannel("fringe-dsl-flow");

function publishState(state: DslFlowState) {
  channel.postMessage({ type: "dsl-state", sessionId: state.sessionId, pageVersion: state.pageVersion });
}

channel.onmessage = (message) => {
  if (message.data.sessionId === currentSessionId && message.data.pageVersion > currentPageVersion) {
    refetchCurrentSession();
  }
};
```

But do not add this before we need it. The first important rule is that stale events must not mutate state. The backend already enforces that.

## 4. Should We Use Protobuf to Share Definitions Between Backend and Frontend?

### Current situation

The contract is currently duplicated manually:

- Go types live in `pkg/dslgoja/schema.go`.
- TypeScript types live in `web/src/page-dsl/schema.ts`.

That duplication works for a prototype, but it will become risky as the contract grows. A field name can change on one side but not the other. An event shape can drift. A new effect type can be added in Go without TypeScript knowing about it.

### Short answer

Yes, protobuf is a good fit for the stable transport contract. It should probably be introduced in stages.

The best first step is to define the common page/event/envelope types in protobuf and generate Go and TypeScript types from the same schema. Keep the highly dynamic `node.props` field as a JSON/Struct field at first. Later, if the widget set stabilizes, we can replace generic props with typed `oneof` payloads for each node kind.

### Why protobuf helps

Protobuf gives us:

- One schema file as the source of truth.
- Generated Go types.
- Generated TypeScript types.
- Stable field numbers for backward-compatible evolution.
- JSON encoding through `protojson` with consistent lowerCamelCase names.
- A place to document which fields are required, optional, deprecated, or versioned.

### Why protobuf is not completely straightforward here

The DSL page format is intentionally flexible. A node has:

```json
{
  "kind": "chipGroup",
  "props": {
    "label": "Tone family",
    "value": ["warm"],
    "options": [...],
    "actions": { "change": { "id": "...", "event": "change" } }
  }
}
```

`props` varies by node kind. A `chipGroup` has different props than a `ratingBar`, and a `summaryRow` has different props than a `photoTile`. Protobuf likes known structures. Our renderer currently benefits from `props` being JSON-like.

There are two good approaches.

### Option A: hybrid protobuf with `Struct` props

Define the stable envelope and node structure in protobuf, but keep `props` as `google.protobuf.Struct`.

Sketch:

```proto
syntax = "proto3";

package fringe.dsl.v1;

import "google/protobuf/struct.proto";

message Page {
  uint32 schema_version = 1;
  string id = 2;
  string title = 3;
  string description = 4;
  Shell shell = 5;
  repeated Node nodes = 6;
  google.protobuf.Struct meta = 7;
}

message Shell {
  string kind = 1;
  google.protobuf.Struct props = 2;
}

message Node {
  string kind = 1;
  google.protobuf.Struct props = 2;
  repeated Node children = 3;
  NodeMeta meta = 4;
}

message NodeMeta {
  string id = 1;
  string name = 2;
  string data_component = 3;
  string data_section = 4;
  string data_part = 5;
  string note = 6;
}

message ActionRef {
  string id = 1;
  string event = 2;
}

message Effect {
  string kind = 1;
  string tone = 2;
  string message = 3;
  google.protobuf.Struct payload = 4;
}

message InteractionEvent {
  string event_id = 1;
  string session_id = 2;
  int64 page_version = 3;
  string node_id = 4;
  string node_kind = 5;
  string action_id = 6;
  string event = 7;
  google.protobuf.Value value = 8;
  google.protobuf.Struct meta = 9;
}

message InteractionResult {
  string session_id = 1;
  int64 page_version = 2;
  Page page = 3;
  repeated Effect effects = 4;
}
```

Pros:

- Quick to adopt.
- Keeps renderer flexibility.
- Eliminates drift for the stable top-level contract.
- Works well with Go `protojson` and TypeScript `@bufbuild/protobuf`.

Cons:

- Widget-specific props are still not strongly typed.
- The renderer still needs runtime checks for props.

This is the recommended first protobuf step.

### Option B: full typed node props with `oneof`

Define every node's props as a typed message:

```proto
message Node {
  NodeMeta meta = 1;
  repeated Node children = 2;

  oneof body {
    TextNode text = 10;
    SegmentedNode segmented = 11;
    ChipGroupNode chip_group = 12;
    RatingBarNode rating_bar = 13;
    ServiceOptionGroupNode service_option_group = 14;
  }
}
```

Pros:

- Strong typing for every widget.
- Better code completion.
- Better validation.
- Easier to generate documentation.

Cons:

- More schema work.
- More migration work.
- Less flexible while the widget DSL is still evolving.
- More friction for experimental composition stories.

This is probably a later step, not the first step.

### Handling `int64` in TypeScript

The protobuf skill warning matters here: protobuf `int64` values in JSON are often represented as strings, and TS generated libraries may expose them as `bigint`.

Our current `pageVersion` is a TypeScript `number`:

```ts
pageVersion: number;
```

For this app, page versions are small enough that `number` is safe in practice. But if protobuf uses `int64`, the generated TS type may be `bigint`. We need to choose deliberately.

Options:

| Choice | Pros | Cons |
|---|---|---|
| `uint32 page_version` | Easy TS number handling. Plenty for page versions. | Theoretical upper bound. |
| `int64 page_version` | Conventional server counter. | TS BigInt/string handling complexity. |
| `string page_version` | Simple JSON. | Less semantically typed. |

Recommendation: use `uint32` or `uint64` only if the chosen TS generator's behavior is understood. For a page render counter, `uint32` is likely enough.

### Recommended protobuf adoption plan

Phase 1:

- Add `proto/fringe/dsl/v1/dsl.proto`.
- Generate Go and TypeScript with Buf.
- Keep `props`, `meta`, event `value`, and effect `payload` as Struct/Value.
- Keep HTTP JSON transport.
- Use `protojson` on the Go side.
- Use `fromJson` on the TypeScript side.

Phase 2:

- Replace hand-written transport interfaces where practical.
- Keep widget prop helper types if they are view-specific.
- Add contract tests: Go emits JSON, TS decodes it.

Phase 3:

- Consider typed node props for stable widgets.
- Keep an escape hatch for experimental nodes.

The goal is not to make the DSL less flexible. The goal is to stop the backend and frontend from silently drifting on the stable transport fields.

## 5. How Do We Deal with Flashing DOM During Rerender?

### What you observed

You saw bottom buttons flash during page rerender. That kind of flash can come from several causes:

- React unmounts and remounts DOM elements because keys are unstable.
- The whole shell rerenders with different props and styles.
- The button focus/active state changes during async dispatch.
- A status overlay appears/disappears near the bottom of the phone frame.
- The backend returns a page that changes enough structure for React to recreate elements.
- The app is in development mode, where React and Vite can make visual changes more noticeable.

The important distinction is that rerendering is normal. Remounting is what often causes visible flashing, lost focus, lost local component state, and CSS transition restarts.

### Current frontend key behavior

In `web/src/page-dsl/render.tsx`, the renderer currently maps page nodes like this:

```tsx
const content = <>{page.nodes.map((node, i) => renderNode(node, context, i))}</>;
```

That means React keys are array indices, not stable node ids. Array index keys are okay only when the list never changes order and never inserts/removes items. DSL pages will change. As the flow grows, index keys will become a problem.

The backend already supports stable node ids through:

```json
{
  "meta": { "id": "category-tabs" }
}
```

The current JavaScript flow uses `.id("category-tabs")`, `.id("service-options")`, `.id("tone-chips")`, and `.id("damage-rating")`. That is the right backend/DSL-authoring pattern.

### The fix is both backend and frontend

The backend must emit stable ids. The frontend must use them as keys.

Backend/DSL author responsibility:

```js
n.segmented(...).id("category-tabs")
n.serviceOptionGroup(...).id("service-options")
n.chipGroup(...).id("tone-chips")
n.ratingBar(...).id("damage-rating")
```

Frontend renderer responsibility:

```tsx
function nodeKey(node: DslNode, index: number): Key {
  return node.meta?.id || `${node.kind}:${index}`;
}

function renderChildren(children: DslNode[] | undefined, ctx: DslRenderContext | undefined) {
  return (children || []).map((child, i) => renderNode(child, ctx, nodeKey(child, i)));
}

export function DslPageRenderer({ page, context }: { page: DslPage; context?: DslRenderContext }) {
  const content = <>{page.nodes.map((node, i) => renderNode(node, context, nodeKey(node, i)))}</>;
  ...
}
```

This change should be made soon. It is low risk and gives React the information it needs to reconcile nodes across backend responses.

### Stable ids for repeated lists

Repeated list items need stable ids too. For example, a list of service options should use the service value as the item key internally:

```tsx
options.map(option => <ServiceOption key={option.value} ... />)
```

The group components should already prefer option values. If they do not, they should be updated. Stable node ids solve the outer DSL node. Stable option values solve the list inside the widget.

### Why bottom buttons may still flash after stable node keys

The bottom buttons are part of `IntakeShell`, not top-level DSL nodes. `IntakeShell` is rendered by `DslPageRenderer` whenever `page.shell.kind === "intake"`:

```tsx
return (
  <IntakeShell
    step={...}
    total={...}
    title={...}
    onNext={...}
    onBack={...}
    onSkip={...}
  >
    {content}
  </IntakeShell>
);
```

React should normally reconcile this because the component type stays `IntakeShell`. But the shell's children and props change, and the buttons may show visual feedback while dispatching. If a status overlay appears at the bottom, it can look like button flash.

Possible shell-specific improvements:

- Keep shell button labels stable where possible.
- Disable buttons while `BackendDslPage` is dispatching, instead of allowing repeated clicks.
- Show dispatch state in the debug panel rather than as an overlay on top of the bottom area.
- Avoid CSS transitions that restart on every prop change.
- Memoize pieces of `IntakeShell` only if profiling shows real remounts.

### Should the backend generate React keys?

The backend should not know about React keys directly. It should emit stable semantic ids. The frontend can use those ids as React keys.

Good backend field:

```json
"meta": { "id": "tone-chips" }
```

Bad backend field:

```json
"reactKey": "tone-chips"
```

The same id can serve many purposes:

- React reconciliation key.
- Browser test selector.
- Action validation node id.
- Debugging in JSON panel.
- Visual diff selector.

That is why `meta.id` is the right place for it.

### Recommended anti-flash plan

1. Update `DslPageRenderer` to use `node.meta.id` as the React key.
2. Audit group widgets to ensure repeated options use stable option values as keys.
3. Add stable ids to every node in `intake.flow.js`, especially as new steps are added.
4. Move transient dispatch UI out of the bottom button area if it visually competes with shell buttons.
5. Add a Playwright or React test that verifies selected/focused controls persist across backend rerenders where appropriate.

## 6. What Is an "Event"? What Are `eventId` and `pageVersion` For?

### An event is not a DOM event

In this system, an event is not the raw browser `MouseEvent` or `ChangeEvent`. The browser DOM event is too low-level and contains many details the backend should not care about.

A DSL interaction event is a small, JSON-safe message that describes what the user intended at the widget level.

Example: the user clicks the `Extensions` segmented option. The backend does not need mouse coordinates, target DOM element, modifier keys, or pointer id. It needs this:

```json
{
  "eventId": "evt_123",
  "pageVersion": 1,
  "nodeId": "category-tabs",
  "nodeKind": "segmented",
  "actionId": "act_456",
  "event": "change",
  "value": "extensions"
}
```

That is the event.

### Event fields

| Field | Purpose |
|---|---|
| `eventId` | Unique id for this browser interaction attempt. Used for idempotency and retry safety. |
| `pageVersion` | The backend page version the browser was looking at when the user interacted. Used to detect stale pages. |
| `nodeId` | Stable id of the node that produced the event, such as `category-tabs`. |
| `nodeKind` | Kind of widget, such as `segmented`, `chipGroup`, or `intakeShell`. |
| `actionId` | Opaque backend callback id that was embedded in the page JSON. |
| `event` | Semantic event name, such as `change`, `next`, `back`, `skip`, `upload`, or `remove`. |
| `value` | The selected value or new widget value. |
| `meta` | Optional extra widget context, such as selected item metadata. |

### Why `eventId` exists

Networks retry. Users double-click. Browsers can resend requests. A frontend may post the same event twice if the connection is slow or if a user rapidly interacts.

Without `eventId`, the backend cannot tell whether two identical-looking events are:

- one user action retried twice, or
- two intentional user actions.

`eventId` is an idempotency key. The browser creates it once for a dispatch attempt:

```ts
const event = {
  ...backendEvent,
  eventId: crypto.randomUUID(),
  pageVersion: state.pageVersion,
};
```

The backend stores processed event results:

```go
ProcessedEvents map[string]InteractionResult
```

On dispatch:

```go
if cached, ok := s.ProcessedEvents[event.EventID]; ok {
    return &cached, nil
}
```

That means if the same `eventId` arrives again, the backend returns the same result instead of invoking the callback again.

Example:

```text
Browser sends evt_1: select Extensions
Backend mutates ctx.state.category = "extensions"
Backend stores result for evt_1
Network retry sends evt_1 again
Backend returns cached result
Callback is not invoked again
```

This is especially important for actions that create things, such as appointments or uploads. Without idempotency, a retry could create duplicates.

### Why `pageVersion` exists

`pageVersion` is a lightweight concurrency control mechanism. It answers this question:

```text
Was the user interacting with the current page, or with an old page?
```

Every successful render increments the backend session version:

```go
s.Version++
s.CurrentPage = page
s.CurrentActions = tx.NextActions
```

The browser includes the version it saw:

```json
{
  "pageVersion": 3,
  "actionId": "act_abc"
}
```

The backend checks it:

```go
if event.PageVersion != s.Version {
    return s.stalePageResult("This page was already updated."), nil
}
```

This prevents old actions from mutating new state.

### Example: stale page protection

```text
Initial state:
  Backend version = 1
  Tab A has page version 1
  Tab B has page version 1

Tab A clicks Next:
  sends pageVersion 1
  backend accepts
  backend renders color page
  backend version becomes 2

Tab B clicks Extensions on old service page:
  sends pageVersion 1
  backend current version is 2
  backend rejects as stale
  backend returns current page + info effect
```

The stale event does not run the old callback. That protects the user from applying outdated intents.

### Why action ids are opaque

The browser receives this:

```json
"actions": {
  "change": { "id": "act_abc", "event": "change" }
}
```

The browser does not know what `act_abc` means. It cannot choose arbitrary backend functions. It can only send back action ids that the backend previously placed on the page.

The backend has the real mapping:

```go
type ActionRegistration struct {
    ID       string
    Name     string
    Event    string
    NodeID   string
    Version  int64
    Callback goja.Callable
}
```

This gives us a safe callback architecture:

```text
Browser sees opaque id -> browser sends opaque id -> backend looks up callback -> Goja callback runs
```

The browser never receives a function and never receives a trusted handler name.

### Relationship between `event`, `eventId`, and `actionId`

These three names sound similar but do different jobs.

| Field | Example | Job |
|---|---|---|
| `event` | `change` | What kind of interaction happened. |
| `eventId` | `evt_123` | Which browser dispatch attempt this is. |
| `actionId` | `act_456` | Which backend callback should handle it. |

A useful way to read the payload is:

```text
"For dispatch attempt evt_123, on page version 1, node category-tabs produced a change event with value extensions. The backend callback to invoke is act_456."
```

### Event lifecycle diagram

```text
Backend render
  ctx.action("setCategory", callback, "change")
      |
      v
  page JSON includes:
    category-tabs.props.actions.change.id = act_456
      |
      v
Browser render
  user clicks Extensions
      |
      v
Browser event payload:
  eventId = evt_123
  pageVersion = 1
  nodeId = category-tabs
  actionId = act_456
  event = change
  value = extensions
      |
      v
Backend dispatch
  if evt_123 already processed: return cached result
  if pageVersion stale: return current page + info effect
  if act_456 unknown: error
  invoke callback
      |
      v
Goja callback
  ctx.state.category = event.value
  return render(ctx)
      |
      v
Backend commit
  retire old actions
  install new actions
  increment pageVersion
  return new page
```

## Proposed Next Tasks

The questions above imply several concrete tasks. They should be done in this order.

### Task Group 1: Route and session persistence

- Add a `DslRouteController` or equivalent logic in `LiveDslDemoApp`.
- Map `page.id` to a route slug.
- Update the URL after successful backend responses.
- Store active session id in `sessionStorage` for tab refresh recovery.
- If `GET /api/dsl/flows/{sessionId}` fails with `dsl_session_not_found`, clear `sessionStorage` and start a new session.

### Task Group 2: Stable render identity

- Change `DslPageRenderer` to use `node.meta.id` as React keys.
- Add fallback key only when `meta.id` is missing.
- Audit repeated lists inside group widgets for stable option-value keys.
- Add stable ids to all future Goja flow nodes.

### Task Group 3: Better stale/multiple-tab behavior

- Make stale-page effects more visible in the live demo.
- Disable interactive widgets or footer buttons while dispatching.
- Consider a `BroadcastChannel` only after we decide to support shared-session tabs.

### Task Group 4: Protobuf contract spike

- Create a small `proto/fringe/dsl/v1/dsl.proto` with `Page`, `Node`, `Shell`, `ActionRef`, `InteractionEvent`, `InteractionResult`, and `Effect`.
- Keep node `props` as `google.protobuf.Struct` for the first spike.
- Generate Go and TypeScript types with Buf.
- Add one Go-to-TS JSON decode validation test.
- Decide whether to migrate the HTTP handlers immediately or keep the spike separate.

## Final Recommendations

For the next implementation pass, do not start with protobuf and do not start with production auth. Start with the user-visible problems that affect the live route:

1. Use stable `meta.id` keys in the renderer.
2. Add per-tab `sessionStorage` resume.
3. Update the URL to reflect backend `page.id`.
4. Improve visible stale/error effects.
5. Then do a protobuf spike for the transport contract.

This order is deliberate. The live route is now the fastest way to learn whether the architecture feels right. Stable keys, URL sync, and session resume improve that feedback loop. Protobuf then helps lock the contract down once the runtime shape is better understood.

## References

Core files:

- `web/src/LiveDslDemoApp.tsx`
- `web/src/page-dsl/BackendDslPage.tsx`
- `web/src/page-dsl/backendClient.ts`
- `web/src/page-dsl/render.tsx`
- `web/src/page-dsl/schema.ts`
- `pkg/server/handlers_dsl.go`
- `pkg/dslgoja/schema.go`
- `pkg/dslgoja/runtime.go`
- `pkg/dslgoja/flows/intake.flow.js`

Related docs:

- `design-doc/02-backend-driven-dsl-callback-architecture-guide.md`
- `design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md`
- `design-doc/04-real-ui-app-integration-guide-for-goja-backend-dsl.md`
