---
Title: Desktop Component System Analysis Design and Implementation Guide
Ticket: HAIR-035
Status: active
Topics:
    - dsl
    - frontend
    - design-system
    - desktop
    - intake
    - storybook
DocType: design
Intent: long-term
Owners: []
RelatedFiles:
    - Path: web/src/page-dsl/schema.ts
      Note: Core DSL JSON schema — DslPage, DslNode, DslNodeKind
    - Path: web/src/page-dsl/render.tsx
      Note: DSL renderer — maps JSON nodes to React components
    - Path: web/src/page-dsl/builder.ts
      Note: Fluent builder API for page/node construction
    - Path: pkg/dslgoja/runtime.go
      Note: Goja runtime engine — sessions, dispatch, render transactions
    - Path: pkg/dslgoja/schema.go
      Note: Go-side DSL schema aligned with TypeScript
    - Path: pkg/dslgoja/modules_dsl.go
      Note: JS DSL module installed into Goja VM
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Full 7-step mobile intake flow running in Goja
    - Path: web/src/page-dsl/backendClient.ts
      Note: Protobuf-backed client for DSL flow API
    - Path: proto/fringe/dsl/v1/dsl.proto
      Note: Protobuf transport contract
    - Path: design-galley/intake-desktop.jsx
      Note: Desktop prototype JSX
ExternalSources: []
Summary: 'Exhaustive intern-facing guide for the Fringe desktop component system: how the existing mobile DSL works end-to-end, what desktop needs, what widgets/layouts are missing, and a concrete implementation plan.'
LastUpdated: 2026-05-13
WhatFor: "Understand the full Fringe DSL architecture (mobile + desktop), implement desktop shell components, extend the DSL for desktop layouts, and write desktop intake flows."
WhenToUse: "Use when adding desktop shell support, desktop-specific DSL node kinds, writing desktop Goja flows, or creating desktop Storybook stories."
---

# Desktop Component System — Analysis, Design, and Implementation Guide

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What Is the Fringe DSL?](#what-is-the-fringe-dsl)
3. [System Architecture — End to End](#system-architecture-end-to-end)
4. [The JSON Contract](#the-json-contract)
5. [The Fluent Builder API](#the-fluent-builder-api)
6. [The React Renderer](#the-react-renderer)
7. [The Goja Backend Runtime](#the-goja-backend-runtime)
8. [The Protobuf Transport Layer](#the-protobuf-transport-layer)
9. [The Design Token System](#the-design-token-system)
10. [Mobile Intake: How It Works Today](#mobile-intake-how-it-works-today)
11. [Desktop Design Prototypes — What We Have](#desktop-design-prototypes)
12. [css-visual-diff — How We Validate Visuals](#css-visual-diff)
13. [Gap Analysis: Mobile vs Desktop](#gap-analysis-mobile-vs-desktop)
14. [Missing Widgets and Layouts for Desktop](#missing-widgets-and-layouts-for-desktop)
15. [Design: Extending the DSL for Desktop](#design-extending-the-dsl-for-desktop)
16. [Implementation Plan](#implementation-plan)
17. [File Reference Map](#file-reference-map)
18. [Prior Ticket Context](#prior-ticket-context)

---

## Executive Summary

The Fringe hair salon booking application has a working **declarative page DSL** that currently powers a mobile intake flow. The DSL lets a developer (or a Go backend) author pages as JSON, and a React renderer turns that JSON into a fully interactive application screen using the Fringe design system's atoms, molecules, and organisms.

**The problem:** The current system is mobile-only. The design gallery contains three desktop prototypes (Estimate, Booking, Confirm) that demonstrate a rich desktop layout with a top navigation bar, a left step rail, and a two-column content area with accent-colored panels. None of this desktop chrome exists as a React component or as a DSL shell kind.

**The goal:** Extend the DSL to support desktop layouts so that a single Goja flow script can drive both mobile and desktop intake experiences. Build the missing desktop shell components, desktop-specific layout nodes, and desktop Storybook stories.

**The approach:** Rather than creating separate mobile and desktop flows, we extend the DSL's shell system and node kind registry. The Goja flow script emits pages with a `desktop` shell kind and desktop-specific layout nodes (accent panels, hero posters, receipt columns). The frontend renderer maps those to new desktop organisms. This keeps the state machine, action dispatch, and protobuf transport completely shared between mobile and desktop.

---

## What Is the Fringe DSL?

The Fringe DSL is a **declarative page description language** for building intake screens in a hair salon booking app. Instead of handwriting React JSX for every screen, a developer writes JavaScript builder code like this:

```ts
page("intake-service", "Service")
  .intake({ step: 1, title: "What brings you in?" })
  .add(
    n.serviceOption("Cut", "Trim · restyle · bangs", { rate: "$80+" }),
    n.serviceOption("Color", "Single process · gloss", { rate: "$120+" }),
  )
  .toJSON()
```

That builder code produces a **plain JSON object**:

```json
{
  "schemaVersion": 1,
  "id": "intake-service",
  "title": "Service",
  "shell": { "kind": "intake", "props": { "step": 1, "title": "What brings you in?" } },
  "nodes": [
    { "kind": "serviceOption", "props": { "name": "Cut", "description": "Trim · restyle · bangs", "rate": "$80+" } },
    { "kind": "serviceOption", "props": { "name": "Color", "description": "Single process · gloss", "rate": "$120+" } }
  ]
}
```

A React component called `DslPageRenderer` reads that JSON and renders the screen using real Fringe design-system widgets.

**Why this matters:** The DSL gives us three capabilities:
- **Script pages quickly** without creating one-off React components.
- **Serialize page structure** as JSON for storage, transport, or server-driven rendering.
- **Reuse the design system** instead of inventing a parallel rendering stack.

The DSL is the bridge between the Go backend (which author pages using a JavaScript runtime called Goja) and the React frontend (which renders them). It is the central abstraction that makes server-driven UI possible.

---

## System Architecture — End to End

The Fringe DSL system has five layers. Data flows from top to bottom and back up again:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 1: Goja Flow Script (JavaScript in Go)                            │
│                                                                         │
│  Author writes JS using page() and n.* helpers.                        │
│  ctx.action() registers server-side callbacks.                         │
│  Flow script runs inside a Goja VM sandbox in the Go backend.          │
│                                                                         │
│  Files: pkg/dslgoja/flows/intake.flow.js                               │
│         pkg/dslgoja/modules_dsl.go (installs fringe/dsl module)        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ emits plain JSON Page
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 2: Go Runtime                                                     │
│                                                                         │
│  FlowSession holds: VM, state, currentPage, actionRegistrations.       │
│  Render() calls the flow's render(ctx) function.                       │
│  Dispatch(event) finds the registered callback, calls it, commits new  │
│  page via renderTransaction.                                            │
│                                                                         │
│  Files: pkg/dslgoja/runtime.go                                         │
│         pkg/dslgoja/schema.go (Go structs mirror TS types)             │
│         pkg/dslgoja/proto_convert.go (Go structs ↔ protobuf)           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ protobuf JSON over HTTP
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 3: Protobuf Transport                                             │
│                                                                         │
│  Protobuf messages: Page, Node, Shell, InteractionEvent, FlowState,    │
│  Effect, DslError. Transport is JSON-encoded protobuf over HTTP.       │
│                                                                         │
│  Endpoints:                                                             │
│    POST /api/dsl/flows/{flowId}/start    → FlowState                    │
│    GET  /api/dsl/flows/{sessionId}       → FlowState                    │
│    POST /api/dsl/flows/{sessionId}/events → FlowState                   │
│                                                                         │
│  Files: proto/fringe/dsl/v1/dsl.proto                                   │
│         web/src/page-dsl/backendClient.ts (fetch + protobuf decode)     │
│         web/src/pb/proto/fringe/dsl/v1/dsl_pb (generated TS)           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ DslPage JSON object
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 4: React DSL Renderer                                             │
│                                                                         │
│  DslPageRenderer reads DslPage JSON, inspects shell.kind, wraps in the │
│  appropriate shell (IntakeShell, bare div), then renders each node via │
│  renderNode() which switches on node.kind and maps to real React       │
│  components.                                                            │
│                                                                         │
│  Files: web/src/page-dsl/render.tsx                                     │
│         web/src/page-dsl/schema.ts (TypeScript types)                   │
│         web/src/page-dsl/debug.ts (dev logging)                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ renders React elements
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 5: Fringe Design System Components                                │
│                                                                         │
│  Atoms:     Button, Chip, Note, Card, Rule, Progress, RatingBar,       │
│             Segmented, Eyebrow, TextField, Wordmark, IndexChip, etc.   │
│  Molecules: ServiceOption, BudgetOption, TimeSlot, DayCell,            │
│             PhotoTile, SummaryRow, StylistCard, Masthead, etc.         │
│  Organisms: IntakeShell, ClientShell, StylistShell, StepRail,          │
│             ServicePage, ColorPage, BookingPage, etc.                   │
│                                                                         │
│  Tokens:    color, font, type, space, radius, shadow (shared between   │
│             components and DSL renderer inline styles)                  │
│                                                                         │
│  Files: web/src/atoms/*/, web/src/molecules/*/, web/src/organisms/*/    │
│         web/src/fringe-ui/tokens/                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Interaction flow (user clicks a button):**

```
User clicks chip
  → React Chip.onSelectedChange fires
    → dispatchAction() in render.tsx reads props.actions.change
      → backendDispatch() sends InteractionEvent via POST /events
        → Go server finds FlowSession, calls Dispatch()
          → Goja VM runs registered callback
            → Callback mutates ctx.state, calls render(ctx)
              → New Page JSON emitted
                → Go server converts to protobuf FlowState
                  → HTTP response back to browser
                    → backendClient.postDslEvent() decodes protobuf
                      → React state update with new DslPage
                        → DslPageRenderer re-renders with new page
```

This is a **server-driven UI loop**: every user interaction round-trips through the Go backend, which re-runs the Goja flow script to produce an updated page. The frontend is a thin renderer.

---

## The JSON Contract

The core of the DSL is a plain JSON schema defined in `web/src/page-dsl/schema.ts`. Every page that flows through the system — whether authored by a TypeScript builder, a Goja flow script, or a future visual editor — must conform to these types.

### DslPage

A `DslPage` is the top-level envelope:

```ts
interface DslPage {
  schemaVersion: 1;        // Always 1 for now
  id: string;              // Unique page identifier, e.g. "intake-service"
  title: string;           // Human-readable title
  description?: string;    // Optional longer description
  shell: {                 // Page wrapper configuration
    kind: "intake" | "bare";  // Which shell to use
    props?: JsonObject;      // Shell-specific props
  };
  nodes: DslNode[];        // Ordered list of content nodes
  meta?: {                 // Optional metadata
    storyTitle?: string;
    tags?: string[];
    source?: string;
    notes?: string[];
  };
}
```

**Key design decisions:**
- `shell.kind` determines the outer chrome. `"intake"` renders the mobile intake shell with status bar, progress, CTA footer. `"bare"` renders a plain div. Desktop will add `"desktop"`.
- `nodes` is an ordered array — the renderer processes them top-to-bottom.
- `meta` is for tooling (Storybook titles, review notes), not for rendering.

### DslNode

A `DslNode` describes one rendered piece of UI:

```ts
interface DslNode {
  kind: DslNodeKind;     // What widget/layout to render
  props?: JsonObject;    // Widget-specific props (rate, selected, style, etc.)
  children?: DslNode[];  // Nested nodes (for stack, grid, card)
  meta?: {               // Optional metadata
    id?: string;           // Stable ID for action routing
    name?: string;
    dataComponent?: string;
    dataSection?: string;
    dataPart?: string;
    note?: string;
  };
}
```

### DslNodeKind — The Widget Registry

`DslNodeKind` is a string union listing every kind the renderer knows. Current kinds:

| Category | Kinds | Description |
|---|---|---|
| **Layout** | `text`, `spacer`, `stack`, `grid` | Generic containers |
| **Atoms** | `eyebrow`, `button`, `chip`, `chipGroup`, `note`, `card`, `rule`, `progress`, `ratingBar`, `segmented`, `textField` | Leaf UI primitives |
| **Molecules** | `serviceOption`, `serviceOptionGroup`, `budgetOption`, `budgetOptionGroup`, `timeSlot`, `timeSlotGroup`, `colorLevelBar`, `lengthSilhouette`, `photoTile`, `summaryRow`, `stylistCard`, `masthead`, `dayCell`, `dayPickerGrid` | Domain-specific composite widgets |

**Important:** There are no desktop-specific kinds yet. This is the gap we need to fill.

### Actions — How Interactivity Works

JSON cannot store functions. The DSL solves this with **string-named action references**:

```json
{
  "kind": "button",
  "props": {
    "children": "Keep going",
    "actions": {
      "click": { "id": "act_abc123", "event": "click" }
    }
  }
}
```

The `id` is an opaque string generated by `ctx.action()` in the Goja runtime. When the user clicks the button, the frontend sends that `id` back to the server as an `InteractionEvent`. The Go backend looks up the registered callback in the `FlowSession` and executes it.

This pattern keeps JSON serializable while enabling full server-driven interactivity.

### DslRenderContext

The renderer receives an optional context object:

```ts
interface DslRenderContext {
  actions?: DslActionMap;            // Named callbacks for local actions
  backendDispatch?: DslBackendDispatch; // Sends events to Go backend
  overrides?: Record<string, ReactNode>; // Slot overrides
}
```

When `backendDispatch` is provided, interactive widgets send events to the Go backend. When only `actions` is provided, callbacks are resolved locally (useful for Storybook).

---

## The Fluent Builder API

The builder API in `web/src/page-dsl/builder.ts` provides ergonomic TypeScript/JavaScript functions for constructing page JSON without handwriting it.

### Page Builder

```ts
const p = page("dsl-service", "Service DSL")  // Creates DslPageBuilder
  .describe("Service selection screen")        // Optional description
  .intake({ step: 1, title: "What brings you in?" })  // Sets shell
  .meta({ storyTitle: "Service DSL", tags: ["dsl"] }) // Storybook metadata
  .add(                                        // Add content nodes
    n.text("Pick one to start.", { variant: "editorial" }),
    n.serviceOption("Cut", "Trim · restyle · bangs", { rate: "$80+" }),
  )
  .toJSON();                                   // Emits plain DslPage JSON
```

### Node Builders

The `n` namespace provides shortcuts for every `DslNodeKind`:

```ts
n.text("Hello", { variant: "editorial" })
  .id("intro-text")                            // Set stable meta.id
  .section("page-heading")                     // Set data-section
  .style({ marginBottom: 16 })                 // Inline styles

n.grid(3, { gap: 10 },
  n.photoTile("Front"),
  n.photoTile("Side"),
  n.photoTile("Back")
)

n.stack({ gap: 12 },
  n.eyebrow("Chapter I · The Ask"),
  n.text("What brings you in?", { variant: "h3" }),
)
```

The Goja runtime has its own copy of the builder API defined in `modules_dsl.go` as a JavaScript string. It provides the same `page()` and `n.*` interface but runs inside the Goja VM. **Both builders produce identical JSON.**

---

## The React Renderer

`web/src/page-dsl/render.tsx` is the runtime interpreter. It is deliberately straightforward — a switch statement over `node.kind`.

### DslPageRenderer

```tsx
function DslPageRenderer({ page, context }) {
  // Render all nodes into a fragment
  const content = <>{page.nodes.map((node, i) => renderNode(node, context))}</>;

  // Wrap in the appropriate shell
  if (page.shell.kind === "intake") {
    return <IntakeShell step={...} total={...} eyebrow={...} title={...}
                        onNext={...} onBack={...} onSkip={...}>
      {content}
    </IntakeShell>;
  }

  // Bare shell
  return <div data-component="DslBarePage">{content}</div>;
}
```

### renderNode

The `renderNode` function is a large switch statement. Each case:
1. Extracts typed props from the generic `JsonObject` using helper functions (`str`, `num`, `bool`, `jsonArray`, `style`).
2. Creates data attributes for testing/debugging (`data-dsl-kind`, `data-dsl-id`, `data-section`).
3. Wires up interactivity via `dispatchAction()` which sends events to the backend.
4. Returns the React element.

Pseudocode for a typical case:

```tsx
case "serviceOption":
  return <ServiceOption
    key={key}
    name={str(props, "name")}
    description={str(props, "description")}
    rate={str(props, "rate")}
    selected={bool(props, "selected")}
    onSelect={(value, meta) => dispatchAction(ctx, node, props, "change", "action", value, meta)}
  />;
```

### Action Dispatch

The dispatch system handles both local and backend actions:

```ts
function dispatchAction(ctx, node, props, eventName, localKey, value?, meta?) {
  // 1. Check for backend action ref (props.actions.eventName)
  const ref = actionRef(props, eventName);
  if (ref && ctx?.backendDispatch) {
    // Send to Go backend via HTTP
    void ctx.backendDispatch({
      nodeId: node.meta?.id,
      nodeKind: node.kind,
      actionId: ref.id,
      event: ref.event,
      value,
      meta,
    });
    return;
  }
  // 2. Fall back to local named action
  action(ctx, props, localKey, node)?.(value, meta);
}
```

This dual-path dispatch means the same widget works in Storybook (local actions) and in production (backend dispatch).

---

## The Goja Backend Runtime

The Go backend runs JavaScript inside a **Goja VM** — a pure-Go ECMAScript 5.1+ runtime. Each intake session gets its own VM, its own state, and its own set of registered action callbacks.

### FlowSession Lifecycle

```
1. StartFlow(flowID, source)
   - Create new Goja VM
   - Install fringe/dsl module (page(), n.* helpers)
   - Load and wrap the flow source script
   - Call initialState() to get initial state object
   - Call render(ctx) to produce first page
   - Return (FlowSession, InteractionResult)

2. Dispatch(event)
   - Lock mutex
   - Validate pageVersion matches current
   - Look up action callback by event.actionId
   - Call callback(event) inside Goja VM
   - Callback returns a new Page JSON
   - Commit render transaction: retire old actions, register new ones, bump version
   - Return InteractionResult with new Page + Effects
```

### ctx.action() — How Callbacks Work

The magic is in `ctx.action()`. When a flow script calls it during render, Goja registers a real Go function pointer:

```js
// Inside Goja flow script:
n.segmented(options, currentValue, {
  actions: {
    change: ctx.action("setCategory", function (event) {
      ctx.state.category = event.value;   // Mutate state
      return render(ctx);                  // Re-render with new state
    }, "change"),
  },
})
```

`ctx.action()` returns an `ActionRef` like `{ id: "act_abc123", event: "change" }`. This goes into the node's JSON props. The frontend never sees the callback function — it only sees the opaque `id`.

When the user interacts, the frontend sends back `{ actionId: "act_abc123", event: "change", value: "color" }`. The Go runtime looks up `act_abc123` in the session's action registry and calls the registered Goja callback.

### renderTransaction — Why Actions Refresh Every Render

Every render creates a fresh set of action registrations. Old actions are "retired" to prevent stale callbacks from firing. This is important because each render may produce different page structure — buttons appear and disappear, options change, steps advance.

```
Render 1: actions = { act_001: backCallback, act_002: nextCallback }
  → User clicks next → Dispatch(act_002) → nextCallback runs → new render
Render 2: actions = { act_003: backCallback, act_004: skipCallback, act_005: nextCallback }
  → act_001 and act_002 are now retired
```

### Go Structs Mirror TypeScript Types

`pkg/dslgoja/schema.go` defines Go structs that exactly mirror the TypeScript interfaces:

```go
type Page struct {
    SchemaVersion int            `json:"schemaVersion"`
    ID            string         `json:"id"`
    Title         string         `json:"title"`
    Shell         Shell          `json:"shell"`
    Nodes         []Node         `json:"nodes"`
}

type Node struct {
    Kind     string         `json:"kind"`
    Props    map[string]any `json:"props,omitempty"`
    Children []Node         `json:"children,omitempty"`
    Meta     *NodeMeta      `json:"meta,omitempty"`
}
```

These are converted to/from protobuf in `proto_convert.go`.

---

## The Protobuf Transport Layer

The protobuf contract in `proto/fringe/dsl/v1/dsl.proto` defines the wire format between Go backend and React frontend.

### Key Messages

```protobuf
message Page {
  uint32 schema_version = 1;
  string id = 2;
  string title = 3;
  Shell shell = 5;
  repeated Node nodes = 6;
}

message InteractionEvent {
  string event_id = 1;
  string session_id = 2;
  uint32 page_version = 3;
  string node_id = 4;
  string action_id = 6;
  string event = 7;
  google.protobuf.Value value = 8;
}

message FlowState {
  string session_id = 1;
  uint32 page_version = 2;
  Page page = 3;
  repeated Effect effects = 4;
}
```

The transport uses **JSON-encoded protobuf** — protobuf schemas validate structure and field names, but the actual HTTP bodies are JSON. This keeps debugging easy while getting schema evolution benefits.

### Frontend Client

`web/src/page-dsl/backendClient.ts` wraps the HTTP calls:

```ts
// Start a new intake flow
const state = await startDslFlow("fringe.intake.v1");
// state.page is the DslPage JSON, state.sessionId identifies the session

// Send a user interaction
const newState = await postDslEvent(sessionId, {
  eventId: uuid(),
  pageVersion: state.pageVersion,
  nodeId: "service-options",
  actionId: "act_abc123",
  event: "change",
  value: "highlights",
});
// newState.page is the updated DslPage after Goja re-renders
```

### API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/dsl/flows/{flowId}/start` | POST | Create session, run initial render |
| `/api/dsl/flows/{sessionId}` | GET | Get current session state |
| `/api/dsl/flows/{sessionId}/events` | POST | Dispatch interaction event |

---

## The Design Token System

All visual consistency comes from shared design tokens in `web/src/fringe-ui/tokens/`. Both the React components and the DSL renderer's inline styles reference these constants.

### Color Tokens

```ts
export const color = {
  ink:       '#111111',   // Primary text, buttons
  paper:     '#ffffff',   // Main background
  cream:     '#f6efe4',   // Warm off-white panels
  rule:      '#ebe7df',   // Dividers, borders
  soft:      '#9a958e',   // Muted text
  softInk:   '#5b5852',   // Secondary text
  plum:      '#6b3a4a',   // Primary accent
  plumDeep:  '#4a2431',   // Dark accent
  butter:    '#f4c752',   // Warm yellow accent
  sage:      '#7a8f6b',   // Green accent
  peach:     '#f2b89a',   // Soft coral
  coral:     '#e8573c',   // Alert/danger
  success:   '#7a8f6b',   // Confirmation
  warn:      '#c48a34',   // Warning
  danger:    '#e8573c',   // Error
};
```

The desktop prototypes use **accent colors as full-panel backgrounds** — butter for the Estimate hero, sage for the Booking stylist panel. This is a desktop-specific pattern not yet in the token system.

### Typography Tokens

```ts
export const font = {
  block: '"Anton", Impact, sans-serif',    // Display headlines
  serif: '"Instrument Serif", Georgia',   // Editorial body
  sans:  '"Inter", system-ui, sans-serif', // UI text
  mono:  '"JetBrains Mono", monospace',   // Labels, metadata
};

export const type = {
  display1:   { fontFamily: font.block, fontSize: 120, ... },  // Hero numbers
  display2:   { fontFamily: font.block, fontSize: 72, ... },   // Page headlines
  display3:   { fontFamily: font.block, fontSize: 54, ... },   // Section heads
  h1:         { fontFamily: font.block, fontSize: 36, ... },
  h2:         { fontFamily: font.block, fontSize: 26, ... },
  h3:         { fontFamily: font.block, fontSize: 20, ... },
  editorialLg:{ fontFamily: font.serif, fontSize: 28, fontStyle: 'italic' },
  editorial:  { fontFamily: font.serif, fontSize: 19, fontStyle: 'italic' },
  body:       { fontFamily: font.sans, fontSize: 14, ... },
  eyebrow:    { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, ... },
  meta:       { fontFamily: font.mono, fontSize: 11, ... },
};
```

Desktop uses the same tokens but at **larger scales** — `display1` at 120px for hero prices, `display2` at 72px for page headlines. The mobile intake shell uses smaller variants.

### Spacing, Radius, Shadow

```ts
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 56, 10: 72 };
export const radius = { none: 0, sm: 2, md: 6, lg: 12, pill: 999 };
export const shadow = {
  sm: '0 2px 6px rgba(17,17,17,0.06)',
  md: '0 8px 24px rgba(17,17,17,0.08)',
  lg: '0 24px 60px rgba(17,17,17,0.14)',
};
```

---

## Mobile Intake: How It Works Today

The current mobile intake flow is a 7-step wizard authored in `pkg/dslgoja/flows/intake.flow.js`. It runs entirely inside the Goja VM in the Go backend. Here is how each piece works:

### State Machine

```js
function initialState() {
  return {
    step: "service",        // Current step name
    category: "color",      // Service category tab
    service: "highlights",  // Selected service
    tones: ["dimensional"], // Selected tone chips
    damage: 2,              // Damage rating
    photos: { front: false, side: false, back: false },
    budget: "flexible",     // Selected budget
    day: "2026-05-19",      // Selected day
    time: "12:00",          // Selected time slot
  };
}
```

The `step` field drives a switch statement in `render(ctx)`:

```js
function render(ctx) {
  switch (ctx.state.step) {
    case "service":  return serviceStep(ctx);
    case "color":   return colorStep(ctx);
    case "photos":  return photosStep(ctx);
    case "budget":  return budgetStep(ctx);
    case "estimate": return estimateStep(ctx);
    case "booking": return bookingStep(ctx);
    case "confirm": return confirmStep(ctx);
  }
}
```

### Navigation via ctx.action()

Each step registers `back`, `next`, and `skip` actions on the shell:

```js
function shell(ctx, config) {
  const actions = {};
  if (config.back)
    actions.back = ctx.action("back", function() { return goto(ctx, config.back); }, "back");
  if (config.next)
    actions.next = ctx.action("next", function() { return goto(ctx, config.next); }, "next");
  return {
    step: config.step, total: 7, eyebrow: config.eyebrow, title: config.title,
    nextLabel: "Keep going →", actions,
  };
}
```

### Widget-Level Actions

Individual widgets also register callbacks:

```js
n.serviceOptionGroup(serviceOptions, ctx.state.service, {
  actions: {
    change: ctx.action("setService", function(event) {
      ctx.state.service = event.value;  // Update state
      return render(ctx);               // Re-render
    }, "change"),
  },
})
```

### The 7 Steps

| Step | Page ID | Title | Key Widgets |
|---|---|---|---|
| 1. Service | `intake-service` | What brings you in? | Segmented tabs, ServiceOptionGroup |
| 2. Color | `intake-color` | Tune the plan | ChipGroup (tones), RatingBar (damage) |
| 3. Photos | `intake-photos` | Add a few photos | Grid of PhotoTile (front/side/back) |
| 4. Budget | `intake-budget` | Choose a comfort zone | BudgetOptionGroup |
| 5. Estimate | `intake-estimate` | Your working estimate | Card with SummaryRow list, Note |
| 6. Booking | `intake-booking` | Choose a time | DayPickerGrid, TimeSlotGroup |
| 7. Confirm | `intake-confirm` | Request received | Note (success), Card with SummaryRow |

### What Mobile Shell Provides

The `IntakeShell` organism wraps all mobile pages with:
- Status bar (time, signal)
- Header with back button and wordmark
- Progress bar showing `step / total`
- Eyebrow text and page title
- Scrollable content area (the DSL nodes)
- Sticky CTA footer with Next/Back/Skip buttons

---

## Desktop Design Prototypes {#desktop-design-prototypes}

The design gallery at `design-galley/` contains three desktop screen prototypes authored as JSX in `design-galley/intake-desktop.jsx`. These are **design explorations**, not production code — they run in a gallery server and were captured as screenshots in `design-galley/screenshots/desktop/`.

### Desktop Shell (DesktopShell)

All three screens share a common chrome structure:

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOP NAV BAR (height: 64px)                                          │
│  [Wordmark] [Services] [Book*] [Stylists] [Journal]    [Hi, Mia] [M]│
│  *active item has accent-colored underline                          │
├────────┬─────────────────────────────────────────────────────────────┤
│ STEP   │ CONTENT AREA                                               │
│ RAIL   │                                                             │
│(220px) │  ┌─────────────────────┬──────────────────┐                 │
│        │  │ LEFT COLUMN         │ RIGHT COLUMN     │                 │
│ 01 Svc │  │ (main content)      │ (accent panel)   │                 │
│ 02 Col │  │                     │                   │                 │
│ 03 Len │  │  Eyebrow            │  Background color │                 │
│ 04 Pht │  │  DISPLAY HEADLINE   │  = accent token   │                 │
│ 05 His │  │  Editorial subtext  │                   │                 │
│ 06 Bgt │  │                     │  Key info / CTA   │                 │
│ 07 Est │  │  Content widgets    │  Sticky actions   │                 │
│ 08 Bkg │  │  (varies by step)   │                   │                 │
│ 09 Cnf*│  │                     │                   │                 │
│        │  └─────────────────────┴──────────────────┘                 │
└────────┴─────────────────────────────────────────────────────────────┘
```

### StepRail Component

A vertical sidebar showing intake progress:

```jsx
function StepRail({ current, accent }) {
  const steps = [
    '01 Service', '02 Color', '03 Length', '04 Photos',
    '05 History', '06 Budget', '07 Estimate', '08 Booking', '09 Confirm',
  ];
  // Each step: done (bullet), active (filled dot + accent color), future (light)
  // Background: cream, border-right: rule
  // Width: 220px, padding: 32px 28px
}
```

**Design tokens used:**
- Background: `color.cream`
- Border: `color.rule`
- Active dot: accent color (butter/sage)
- Done dot: `color.plum`
- Inactive text: `color.soft`
- Labels: `type.h3` at 12px

### Screen 1: Estimate (Butter variant)

**Layout:** Two-column grid (1.15fr | 1fr) inside the content area.

**Left column:**
- Eyebrow: "Chapter VII · The Quote"
- Display headline: "YOUR ESTIMATE." at 84px
- Editorial subtext in serif italic
- SummaryRow list (Service, Color Level, Length, Add-ons, Condition) with edit links
- Note/warning card

**Right column (Butter accent panel):**
- Full-height butter background
- Hero price: "$245" at 220px font size
- Duration: "3 hours, 15 minutes" in serif italic
- Tiered estimate rows (Low/Likely/High) with dividers
- Action buttons: "Adjust" (secondary) + "Continue to booking →" (primary, full-width)

### Screen 2: Booking (Sage variant)

**Layout:** Two-column grid (1fr | 340px).

**Left column:**
- Eyebrow + display headline "WHEN SUITS YOU?"
- Full month calendar grid (7 columns, day cells with availability badges)
- Month navigation (chevrons)
- Time slot picker (5-column grid)

**Right column (Sage accent panel):**
- Stylist card with avatar initial, name, role, stats
- Key-value pairs (Starting price, Rating, Languages) with dividers
- Alternative stylist list with "View →" links
- Primary CTA: "Hold this slot →"

### Screen 3: Confirm (Butter hero)

**Layout:** 50/50 split (1fr | 1fr).

**Left column (Butter hero poster):**
- Confirmation number: "#4281"
- Mixed display + serif: "SEE YOU *Tuesday.*" at 150px
- Footer editorial text

**Right column:**
- Receipt-style summary (When, With, Service, Estimate, Deposit, Location)
- Success Note: "Deposit received..."
- Action buttons: "Add to calendar", "Message Nadia", "Cancel" (ghost)
- Prep checklist (numbered list)

### Desktop vs Mobile: Structural Differences

| Aspect | Mobile | Desktop |
|---|---|---|
| Shell | IntakeShell (status bar + header + CTA footer) | DesktopShell (top nav + step rail + content area) |
| Layout | Single column, vertical scroll | Two-column grid with accent panel |
| Typography | Body scale (14-20px) | Display scale (72-220px) |
| Navigation | Back/Next/Skip buttons in sticky footer | Step rail for jump-ahead, inline CTAs |
| Information density | One thing at a time | Context panel visible throughout |
| Accent color | Small highlights | Full-panel background |
| Calendar | DayPickerGrid (mobile compact) | Full month grid with availability badges |
| Confirmation | Simple card | Hero poster + receipt + prep checklist |

---

## css-visual-diff — How We Validate Visuals

The project uses `css-visual-diff` to compare design prototypes against React implementations. The configuration lives in `.css-visual-diff.yml`:

```yaml
verbs:
  repositories:
    - name: fringe
      path: ./design-galley/visual-diff/userland/verbs
```

### Visual Diff Specification

`design-galley/visual-diff/userland/specs/fringe-intake.yaml` defines comparison pages:

```yaml
name: fringe-intake
variant: mobile
viewport: { width: 500, height: 920 }
defaults: { waitMs: 3000, threshold: 30 }

pages:
  service:
    leftUrl: http://localhost:7071/standalone/mobile/01-service.html
    rightUrl: http://localhost:6006/iframe.html?id=pages-servicepage--default
    sections:
      screen:    { leftSelector: '[data-page="service"]', rightSelector: '[data-component="StoryPhoneFrame"]' }
      heading:   { leftSelector: '...', rightSelector: '[data-section="page-heading"]' }
      content:   { leftSelector: '...', rightSelector: '[data-part="content"]' }
```

**How it works:**
1. **Left side** = standalone HTML prototype served by a gallery server on port 7071
2. **Right side** = Storybook iframe on port 6006
3. css-visual-diff opens both URLs in a headless browser, screenshots them, compares computed CSS properties per section, and produces overlay images showing matches/mismatches
4. Results are served via `css-visual-diff serve` on port 18098

### Current Coverage

The existing spec covers **9 mobile screens** (service through confirm) but has **no desktop screens**. Desktop prototype HTML files exist at `design-galley/standalone/desktop/` (3 files: estimate, booking, confirm) but there is no visual diff spec for them.

### What Needs to Happen for Desktop

1. Create `desktop-intake.visual.yml` (or extend `fringe-intake.yaml`) with `variant: desktop` and a wider viewport (e.g. 1440×900).
2. Add page entries pointing left to `design-galley/standalone/desktop/*.html` and right to Storybook desktop stories.
3. Define section selectors for desktop-specific regions (step-rail, left-column, right-panel, top-nav).
4. Run `css-visual-diff verbs` with the new spec to establish baseline screenshots.

---

## Gap Analysis: Mobile vs Desktop

The current component library and DSL were built mobile-first. Here is a systematic comparison of what exists vs what desktop needs.

### Shells

| Component | Mobile | Desktop | Status |
|---|---|---|---|
| IntakeShell (status bar + header + progress + CTA footer) | ✅ Built + DSL | N/A | Mobile only |
| DesktopShell (top nav + step rail + content area) | N/A | ❌ Missing | Must build |
| TopNav (wordmark + nav links + user avatar) | N/A | ❌ Missing | Must build |
| StepRail (vertical step list) | ❌ Not used | ❌ Missing | Must build |

### Layout Primitives

| Component | Mobile | Desktop | Status |
|---|---|---|---|
| stack (flex column) | ✅ DSL node | ✅ Reusable | Already works |
| grid (CSS grid) | ✅ DSL node | ✅ Reusable | Already works |
| spacer | ✅ DSL node | ✅ Reusable | Already works |
| Two-column split (main + accent panel) | N/A | ❌ Missing | Must build as DSL node or shell feature |
| AccentPanel (full-height colored side panel) | N/A | ❌ Missing | Must build |
| HeroPoster (full-bleed colored hero with display type) | N/A | ❌ Missing | Must build |
| ReceiptColumn (structured key-value receipt layout) | N/A | ❌ Missing | Must build |

### Interactive Widgets

| Component | Mobile | Desktop | Status |
|---|---|---|---|
| Segmented (tab switcher) | ✅ DSL | ✅ Reusable | Works, needs wider variant |
| ServiceOptionGroup | ✅ DSL | ✅ Reusable | Works, may want horizontal layout |
| ChipGroup | ✅ DSL | ✅ Reusable | Works |
| RatingBar | ✅ DSL | ✅ Reusable | Works |
| BudgetOptionGroup | ✅ DSL | ✅ Reusable | Works |
| PhotoTile / grid | ✅ DSL | ⚠️ Needs desktop variant | Drag-and-drop, larger previews |
| DayPickerGrid | ✅ DSL (compact) | ⚠️ Needs full-month variant | Desktop has full calendar with badges |
| TimeSlotGroup | ✅ DSL | ✅ Reusable | Works, wider grid |
| SummaryRow (with edit link) | ✅ DSL | ✅ Reusable | Works, desktop adds tier layout |
| StylistCard | ✅ DSL | ⚠️ Needs expanded variant | Desktop panel has stats, alternatives |
| Card | ✅ DSL | ✅ Reusable | Works |
| Note | ✅ DSL | ✅ Reusable | Works |
| Button | ✅ DSL | ✅ Reusable | Works, desktop uses wider variants |

### Desktop-Only Widgets

| Component | Description | Status |
|---|---|---|
| MonthCalendar | Full 7-column month grid with day cells, availability badges, month nav chevrons | ❌ Missing |
| AvailabilityBadge | Small overlay on calendar day cells showing open slot count | ❌ Missing |
| StylistDetailPanel | Expanded stylist card with avatar, stats, languages, alternative list | ❌ Missing |
| TierList | Low/Likely/High estimate tiers with dividers and right-aligned values | ❌ Missing |
| HeroNumber | Massive display-scale number (e.g. $245 at 220px) | ❌ Missing |
| PrepChecklist | Numbered list of pre-visit instructions | ❌ Missing |
| CalendarExportButton | "Add to Calendar" action button | ❌ Missing |
| ContactButton | "Message Stylist" action button | ❌ Missing |

---

## Missing Widgets and Layouts for Desktop

This is the complete inventory of new components needed for the desktop intake experience.

### Priority 1: Shell and Layout (block everything else)

1. **DesktopShell** — The outermost wrapper organism
   - Props: `{ accent: string, accentInk: string, children: ReactNode }`
   - Renders: TopNav + flex row containing StepRail slot + content area
   - File: `web/src/organisms/DesktopShell/DesktopShell.tsx`

2. **TopNav** — Global navigation bar
   - Props: `{ accent: string, activeItem: string, user: { name: string, initial: string } }`
   - Renders: 64px bar with Wordmark, nav links (Services/Book/Stylists/Journal), user greeting + avatar
   - File: `web/src/molecules/TopNav/TopNav.tsx`

3. **StepRail** — Vertical intake progress sidebar
   - Props: `{ steps: string[], current: number, accent: string }`
   - Renders: 220px cream sidebar with step labels, done/active/future states
   - File: `web/src/molecules/StepRail/StepRail.tsx` (note: a mobile StepRail organism already exists at `web/src/organisms/StepRail/` — desktop version is different)

4. **TwoColumnLayout** — CSS grid split for main + accent panel
   - Props: `{ leftWidth?: string, rightWidth?: string, gap?: number, left: ReactNode, right: ReactNode }`
   - DSL node kind: `twoColumn`
   - File: `web/src/organisms/DesktopShell/TwoColumnLayout.tsx`

### Priority 2: Desktop-Specific Content Widgets

5. **AccentPanel** — Full-height colored side panel
   - Props: `{ accent: string, accentInk: string, children: ReactNode }`
   - Used as right column for Estimate (butter) and Booking (sage) screens
   - DSL node kind: `accentPanel`

6. **HeroPoster** — Full-bleed colored hero for confirmation
   - Props: `{ accent: string, eyebrow?: string, headline: ReactNode, subtext?: string }`
   - Used as left column for Confirm screen
   - DSL node kind: `heroPoster`

7. **HeroNumber** — Massive display number (price, time)
   - Props: `{ value: string, fontSize?: number, letterSpacing?: number }`
   - Renders: block-font number at 150-220px scale
   - DSL node kind: `heroNumber`

8. **TierList** — Low/Likely/High estimate breakdown
   - Props: `{ tiers: Array<{label: string, value: string}> }`
   - Renders: vertical list with hairline dividers and right-aligned values
   - DSL node kind: `tierList`

9. **MonthCalendar** — Full month grid with day cells
   - Props: `{ year: number, month: number, days: DayInfo[], value?: string, onNavigateMonth?, onChange? }`
   - DayInfo: `{ day: number, hasSlots?: boolean, slotCount?: number, selected?: boolean, disabled?: boolean, isPast?: boolean }`
   - Renders: 7-column grid with day-of-week headers, month nav, availability badges
   - DSL node kind: `monthCalendar`

10. **StylistDetailPanel** — Expanded stylist info card
    - Props: `{ name: string, initial: string, role: string, accent: string, stats: Array<{label: string, value: string}>, alternatives: Array<{name: string, role: string, price: string}> }`
    - Renders: accent-colored card with avatar, name, stats list, alternative list
    - DSL node kind: `stylistDetailPanel`

11. **PrepChecklist** — Numbered pre-visit instruction list
    - Props: `{ title?: string, items: string[] }`
    - Renders: eyebrow header + ordered list in bodyLg text
    - DSL node kind: `prepChecklist`

### Priority 3: Enhancements to Existing Widgets

12. **SummaryRow** — Add `overline` variant for receipt-style layout
    - Desktop confirm uses overline label + bold value pattern
    - Current SummaryRow already supports `onEdit` for inline editing

13. **DayCell** — Add `badge` prop for availability count display
    - Desktop calendar shows "N OPEN" or "SELECTED" badges under day numbers

14. **Button** — Add `ghost` variant (already partially in prototypes)
    - Confirm screen uses ghost-styled Cancel button

---

## Design: Extending the DSL for Desktop

There are two approaches to supporting desktop in the DSL. The recommended approach is **Option A**.

### Option A: Desktop Shell Kind (Recommended)

Add `"desktop"` as a new shell kind. The Goja flow script emits pages with `shell.kind = "desktop"` and desktop-specific layout nodes. The mobile flow continues to emit `shell.kind = "intake"`.

**Why this is better:**
- The same state machine and business logic are shared between mobile and desktop.
- Only the render function differs — mobile steps produce mobile JSON, desktop steps produce desktop JSON.
- The DSL renderer naturally handles both by switching on `shell.kind`.
- No conditional logic needed in individual widget renderers.

**Implementation:**

1. Extend `DslNodeKind` in `schema.ts`:
```ts
export type DslNodeKind =
  // ... existing kinds ...
  | "twoColumn"          // Two-column split layout
  | "accentPanel"        // Colored side panel
  | "heroPoster"         // Full-bleed hero
  | "heroNumber"         // Massive display number
  | "tierList"           // Low/Likely/High tiers
  | "monthCalendar"      // Full month calendar grid
  | "stylistDetailPanel" // Expanded stylist card
  | "prepChecklist"      // Numbered prep instructions
  | "receiptColumn";     // Receipt-style key-value column
```

2. Extend shell kind:
```ts
shell: {
  kind: "intake" | "bare" | "desktop";
  props?: JsonObject;
};
```

3. Add desktop shell props:
```ts
// Desktop shell props
{
  step: number,        // Current step for StepRail highlighting
  total: number,       // Total steps
  accent: string,      // Accent color token name ("butter", "sage", etc.)
  activeNav: string,   // Active top nav item ("book", "services", etc.)
  user: { name: string, initial: string },
  actions: {           // Navigation actions
    back?: ActionRef,
    next?: ActionRef,
  }
}
```

4. Add `n.*` helpers in `builder.ts` and Goja `modules_dsl.go`:
```ts
n.twoColumn = (leftChildren, rightChildren, props) => node("twoColumn", { ...props }, [...leftChildren, ...rightChildren]);
n.accentPanel = (props, ...children) => node("accentPanel", props, children);
n.heroPoster = (props, ...children) => node("heroPoster", props, children);
n.heroNumber = (value, props) => node("heroNumber", { value, ...props });
n.tierList = (tiers, props) => node("tierList", { tiers, ...props });
// ... etc
```

5. Add render cases in `render.tsx`:
```tsx
case "twoColumn": {
  const [leftNodes, rightNodes] = splitChildren(node.children);
  return <TwoColumnLayout
    leftWidth={str(props, "leftWidth", "1fr")}
    rightWidth={str(props, "rightWidth", "1fr")}
    gap={num(props, "gap", 48)}
    left={renderChildren(leftNodes, ctx)}
    right={renderChildren(rightNodes, ctx)}
  />;
}

case "accentPanel": {
  return <AccentPanel accent={str(props, "accent", "butter")} accentInk={str(props, "accentInk", color.ink)}>
    {renderChildren(node.children, ctx)}
  </AccentPanel>;
}

case "heroNumber": {
  return <div style={{ ...type.display1, fontSize: num(props, "fontSize", 220), letterSpacing: num(props, "letterSpacing", -6), lineHeight: 0.82 }}>
    {str(props, "value")}
  </div>;
}
```

6. Add DesktopShell rendering in `DslPageRenderer`:
```tsx
if (page.shell.kind === "desktop") {
  const props = page.shell.props || {};
  return (
    <DesktopShell accent={str(props, "accent", "butter")} accentInk={color.ink}>
      <StepRail steps={steps} current={num(props, "step", 1)} accent={accent} />
      <div className="desktop-content">{content}</div>
    </DesktopShell>
  );
}
```

7. Write a desktop Goja flow (or extend the existing one):
```js
// The desktop flow reuses the same state machine but has different render functions
function serviceStepDesktop(ctx) {
  return page("intake-service-d", "Service")
    .desktop(shellDesktop(ctx, { step: 1, accent: "butter", ... }))
    .add(
      n.twoColumn(
        // Left: main content
        [
          n.eyebrow("Chapter I · The Ask"),
          n.text("What brings you in?", { variant: "display2" }),
          n.serviceOptionGroup(serviceOptions, ctx.state.service, { ... }),
        ],
        // Right: accent panel
        [
          n.accentPanel({ accent: "butter" },
            n.eyebrow("QUICK BOOK"),
            n.text("Pick a service to get an instant estimate."),
          ),
        ],
      ),
    )
    .toJSON();
}
```

### Option B: Frontend Layout Adaptation (Not Recommended)

The frontend renderer inspects the viewport width and adapts mobile JSON into a desktop layout. This means the Goja flow always emits mobile JSON.

**Why this is worse:**
- The frontend must make layout decisions that properly belong to the page author.
- Desktop-specific content (accent panels, hero posters) cannot be authored by the flow.
- The renderer becomes complex with viewport-dependent behavior.
- We lose the ability to have genuinely different desktop page structures.

---

## Implementation Plan

### Phase 1: Desktop Shell Components (Week 1)

**Goal:** Get the desktop chrome rendering in Storybook with static content.

1. **Create `DesktopShell` organism** (`web/src/organisms/DesktopShell/`)
   - `DesktopShell.tsx` — TopNav + flex row (StepRail + content)
   - `DesktopShell.stories.tsx` — Stories for each accent variant
   - `TopNav.tsx` — Extract as molecule if reused elsewhere

2. **Create `StepRail` molecule** (desktop version)
   - `web/src/molecules/DesktopStepRail/`
   - Props: steps array, current index, accent color
   - Each step row: dot + label, hairline dividers, done/active/future states

3. **Create `TwoColumnLayout` component**
   - `web/src/organisms/DesktopShell/TwoColumnLayout.tsx`
   - CSS grid with configurable column widths

4. **Create `AccentPanel` molecule**
   - `web/src/molecules/AccentPanel/AccentPanel.tsx`
   - Full-height background with accent color, padding, flex column

5. **Wire into DSL renderer**
   - Add `"desktop"` to shell kind union in `schema.ts`
   - Add `DslPageRenderer` case for `shell.kind === "desktop"`
   - Add `DesktopShell` import in `render.tsx`

6. **Add Storybook stories**
   - Static desktop shell stories
   - One "hello world" desktop DSL page

### Phase 2: Desktop Content Widgets (Week 2)

**Goal:** Build all desktop-specific DSL node kinds.

7. **HeroPoster** — Full-bleed colored hero
8. **HeroNumber** — Massive display number
9. **TierList** — Low/Likely/High estimate rows
10. **MonthCalendar** — Full month grid with availability badges
11. **StylistDetailPanel** — Expanded stylist card
12. **PrepChecklist** — Numbered instruction list
13. **ReceiptColumn** — Key-value receipt layout

For each widget:
- Create component file with TypeScript props
- Create Storybook story with multiple variants
- Add `DslNodeKind` entry in `schema.ts`
- Add `n.*` helper in `builder.ts`
- Add render case in `render.tsx`
- Add `n.*` helper in Goja `modules_dsl.go`

### Phase 3: Desktop Goja Flow (Week 3)

**Goal:** A Goja flow script that produces desktop pages.

14. **Write `intake-desktop.flow.js`** in `pkg/dslgoja/flows/`
    - Reuse the same `initialState()` and data arrays
    - New `render(ctx)` that detects desktop mode (via ctx flag or separate flow ID)
    - New step functions: `serviceStepDesktop()`, `estimateStepDesktop()`, etc.
    - Use `shell.kind = "desktop"` and desktop node kinds

15. **Wire desktop flow into the Go server**
    - Register `fringe.intake-desktop.v1` flow ID
    - Or: add viewport/mode parameter to existing flow start endpoint

16. **Write `BackendDslPage.stories.tsx` desktop variant**
    - Storybook story that starts a desktop flow and renders it

### Phase 4: Visual Diff and Polish (Week 4)

**Goal:** Validate desktop renders match design prototypes.

17. **Create desktop css-visual-diff spec**
    - `design-galley/visual-diff/userland/specs/desktop-intake.yaml`
    - Viewport: 1440×900
    - Pages: estimate, booking, confirm
    - Sections: top-nav, step-rail, left-column, right-panel

18. **Run visual diff and fix discrepancies**

19. **Create additional desktop prototype HTML for missing steps**
    - Service, Color, Photos, Budget, History desktop layouts

20. **Upload final guide to reMarkable**

---

## File Reference Map

### Source Files You Will Modify

| File | What to change |
|---|---|
| `web/src/page-dsl/schema.ts` | Add desktop shell kind, new DslNodeKind entries |
| `web/src/page-dsl/builder.ts` | Add `n.*` helpers for desktop node kinds |
| `web/src/page-dsl/render.tsx` | Add DesktopShell case, add render cases for new node kinds |
| `pkg/dslgoja/modules_dsl.go` | Add `n.*` helpers in the JS module string |
| `pkg/dslgoja/flows/intake.flow.js` | Either extend or create desktop variant |
| `proto/fringe/dsl/v1/dsl.proto` | No changes needed — uses `google.protobuf.Struct` for props |

### New Files You Will Create

| File | Component |
|---|---|
| `web/src/organisms/DesktopShell/DesktopShell.tsx` | Desktop shell organism |
| `web/src/organisms/DesktopShell/DesktopShell.stories.tsx` | Desktop shell stories |
| `web/src/molecules/TopNav/TopNav.tsx` | Global navigation bar |
| `web/src/molecules/TopNav/TopNav.stories.tsx` | TopNav stories |
| `web/src/molecules/DesktopStepRail/DesktopStepRail.tsx` | Vertical step sidebar |
| `web/src/molecules/DesktopStepRail/DesktopStepRail.stories.tsx` | StepRail stories |
| `web/src/organisms/DesktopShell/TwoColumnLayout.tsx` | Two-column grid |
| `web/src/molecules/AccentPanel/AccentPanel.tsx` | Colored side panel |
| `web/src/molecules/HeroPoster/HeroPoster.tsx` | Full-bleed hero |
| `web/src/molecules/HeroNumber/HeroNumber.tsx` | Massive display number |
| `web/src/molecules/TierList/TierList.tsx` | Estimate tier rows |
| `web/src/molecules/MonthCalendar/MonthCalendar.tsx` | Full month calendar |
| `web/src/molecules/StylistDetailPanel/StylistDetailPanel.tsx` | Expanded stylist card |
| `web/src/molecules/PrepChecklist/PrepChecklist.tsx` | Numbered instruction list |
| `design-galley/visual-diff/userland/specs/desktop-intake.yaml` | Desktop visual diff spec |
| `pkg/dslgoja/flows/intake-desktop.flow.js` | Desktop Goja flow (maybe) |

### Key Reference Files (Read-Only)

| File | Why it matters |
|---|---|
| `design-galley/intake-desktop.jsx` | Desktop design specification — the visual target |
| `design-galley/screenshots/desktop/*.png` | Desktop screenshot references |
| `web/src/fringe-ui/tokens/index.ts` | Design tokens for consistent styling |
| `pkg/dslgoja/runtime.go` | Understanding session lifecycle |
| `web/src/page-dsl/backendClient.ts` | Understanding API transport |

---

## Prior Ticket Context

This ticket builds on a chain of prior work:

| Ticket | What it established |
|---|---|
| **HAIR-016** | Initial Fringe UI component architecture analysis. Imported Claude design gallery JSX. Established atom/molecule/organism taxonomy. |
| **HAIR-031** | Full restyle from old design to Fringe design system. Extracted standalone HTML pages from prototypes. Captured mobile screenshots. Set up css-visual-diff verbs for visual comparison. |
| **HAIR-032** | Declarative page-builder DSL. JSON schema, fluent builder API, React renderer, example pages, Storybook integration. The foundation this ticket builds on. |
| **HAIR-033** | Interactive widget productionization. Controlled props, callbacks, accessibility, Storybook interaction demos. Made widgets genuinely usable in an app. |
| **HAIR-034** | Protobuf transport hard cutover. Made protobuf the central wire format. Routing and session cleanup. Established the Go↔React transport contract. |

**HAIR-035** (this ticket) is the **desktop extension** of the DSL system. It takes the mobile-first foundation and adds the desktop shell, layout primitives, and content widgets needed to render the same intake flow on a desktop screen.

---

*End of document.*
