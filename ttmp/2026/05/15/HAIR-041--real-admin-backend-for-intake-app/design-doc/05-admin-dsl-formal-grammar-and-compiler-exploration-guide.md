---
Title: Admin DSL Formal Grammar and Compiler Exploration Guide
Ticket: HAIR-041
Status: active
Topics:
    - backend
    - frontend
    - admin-dsl
    - goja
    - dsl
    - compiler
    - research
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/admindsl/builder.go
      Note: Current authoritative backend fluent builders and candidate generator target
    - Path: pkg/admindsl/goja_module.go
      Note: Current controlled JS module export table and candidate generator target
    - Path: pkg/admindsl/proto_convert.go
      Note: Current conversion from Admin DSL page AST to protobuf transport state
    - Path: pkg/admindsl/script_runtime.go
      Note: Current Goja runtime
    - Path: pkg/admindsl/types.go
      Note: Current Go transport AST and node/action vocabulary that a grammar would generate or validate against
    - Path: pkg/admindsl/validate.go
      Note: Current semantic validation rules and candidate generated validation scaffolding target
    - Path: pkg/server/handlers_admin_dsl.go
      Note: Current admin DSL HTTP start/get/dispatch endpoints
    - Path: proto/fringe/admin_dsl/v1/admin_dsl.proto
      Note: Current stable protobuf transport envelope around dynamic node props
    - Path: web/src/admin-dsl/AdminDslWorkbench.stories.tsx
      Note: Current v2 Storybook workbench catalog used as grammar/page examples
    - Path: web/src/admin-dsl/BackendAdminDslPage.tsx
      Note: Current frontend runtime bridge from renderer events to backend interaction events
    - Path: web/src/admin-dsl/backendClient.ts
      Note: Current protobuf JSON client for admin DSL flow state and interaction events
    - Path: web/src/admin-dsl/builder.ts
      Note: Current frontend builder API and candidate generated JS/TS builder target
    - Path: web/src/admin-dsl/render.tsx
      Note: Current explicit React interpreter and candidate renderer registry/scaffolding target
    - Path: web/src/admin-dsl/schema.ts
      Note: Current frontend TypeScript transport AST definitions and candidate generator target
ExternalSources: []
Summary: Exploratory design guide for a formal Admin DSL grammar, canonical AST, and compiler/code-generation pipeline targeting JS builders, Go builders, validation, TypeScript schema, and renderer scaffolding.
LastUpdated: 2026-05-17T11:05:00-04:00
WhatFor: Use when researching whether Admin DSL should be specified by a formal grammar and generated into builders, validators, renderer registration, and AST definitions.
WhenToUse: When onboarding a researcher or intern to the Admin DSL architecture, or when evaluating compiler/spec-driven approaches for the DSL.
---


# Admin DSL Formal Grammar and Compiler Exploration Guide

## Executive Summary

Admin DSL v2 is currently a backend-driven UI language expressed as stable JSON. The current implementation has several coordinated definitions of the same language: Go node constants and builders, Go validation rules, Goja exports, TypeScript schema types, TypeScript builder helpers, a React renderer, Storybook fixtures, and protobuf transport envelopes. These pieces are intentionally simple and explicit, but they are maintained by hand.

This document explores a research direction: define a formal Admin DSL grammar and a canonical AST, then compile from that specification into the existing implementation surfaces. The goal is not to replace the current system immediately. The goal is to give a researcher enough technical context to evaluate whether a grammar-driven approach would reduce drift, improve validation, support tool generation, and make the language easier to reason about.

The key proposal is to separate three layers that are currently mixed across files:

- The **language specification** declares the vocabulary: node kinds, props, child rules, action slots, placements, layout constraints, and validation rules.
- The **page authoring grammar** describes pages and flows in a human-authored syntax or structured source form.
- The **compiler targets** generate builder APIs, AST definitions, validation tables, renderer dispatch scaffolding, documentation tables, and tests.

The central technical question is whether Admin DSL should remain a small hand-written JSON DSL with explicit builders, or whether the project would benefit from a source-of-truth language definition that emits those hand-written pieces. This document treats the grammar system as exploratory research. It identifies implementation paths, risks, invariants, and concrete file touchpoints without recommending immediate production adoption.

## Problem Statement

Admin DSL v2 now has a clear workbench vocabulary. Real backend flows emit schema v2 pages, and the Go and frontend APIs have been cut over to v2-only behavior. That cutover makes the current language easier to describe than it was during migration, but it also makes a maintenance issue more visible: the same language appears in multiple places.

A new node kind or prop shape can require edits in several files:

- `pkg/admindsl/types.go` for node constants and action constants.
- `pkg/admindsl/builder.go` for host-side fluent builders.
- `pkg/admindsl/goja_module.go` for embedded JavaScript exports.
- `pkg/admindsl/validate.go` for shape validation and semantic constraints.
- `web/src/admin-dsl/schema.ts` for TypeScript AST/JSON boundary types.
- `web/src/admin-dsl/builder.ts` for Storybook and frontend fixture builders.
- `web/src/admin-dsl/render.tsx` for React rendering behavior.
- `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` for examples and visual review.
- `proto/fringe/admin_dsl/v1/admin_dsl.proto` for the transport envelope when top-level transport shape changes.

These files do not all contain the same kind of information. Some are language definitions. Some are convenience APIs. Some are runtime interpreters. Some are transport adapters. A grammar-driven approach should not flatten those distinctions. It should identify which information can be generated safely and which information should remain hand-written.

The research question is:

> Can Admin DSL be described by a formal grammar and canonical AST in a way that can generate builders, schema definitions, validation scaffolding, renderer registration, and documentation without reducing the clarity and explicitness of the current system?

## Current Admin DSL Architecture

Before designing a grammar, a researcher must understand the current system. Admin DSL has two main execution modes: Storybook/frontend fixture rendering and backend Goja-backed flow rendering. Both modes end at the same React renderer.

### Current runtime path for backend-authored pages

The backend path starts with JavaScript flow files embedded in Go and ends with React rendering in the browser.

```text
Embedded flow JS
  pkg/admindsl/flows/*.flow.js
        |
        v
Goja ScriptRuntime
  pkg/admindsl/script_runtime.go
        |
        v
Go builders exposed through require("fringe/admin-dsl")
  pkg/admindsl/goja_module.go
  pkg/admindsl/builder.go
        |
        v
Admin DSL Page JSON
  pkg/admindsl/types.go
        |
        v
Validation
  pkg/admindsl/validate.go
        |
        v
Proto JSON transport envelope
  proto/fringe/admin_dsl/v1/admin_dsl.proto
  pkg/admindsl/proto_convert.go
  pkg/server/handlers_admin_dsl.go
        |
        v
Frontend client
  web/src/admin-dsl/backendClient.ts
  web/src/admin-dsl/BackendAdminDslPage.tsx
        |
        v
React renderer
  web/src/admin-dsl/render.tsx
```

Each step has a bounded responsibility:

- The flow script owns app-specific page composition and callback binding.
- The Go builder owns stable JSON construction and validation before transport.
- The protobuf layer owns the envelope, session ID, page version, effects, and interaction event transport.
- The frontend client owns protobuf JSON decoding and event posting.
- The renderer owns interpretation of `node.kind`, `node.props`, children, modals, drawers, and actions.

The browser never receives trusted backend functions. It receives opaque action IDs. When a user clicks an action, the browser posts the action ID and event value back to the backend session. The backend dispatches the registered callback in the Goja runtime.

### Current runtime path for Storybook fixture pages

Storybook pages use TypeScript builders. They do not go through Goja, server handlers, or protobuf transport.

```text
Storybook fixture source
  web/src/admin-dsl/AdminDslWorkbench.stories.tsx
        |
        v
TypeScript builders
  web/src/admin-dsl/builder.ts
        |
        v
AdminPage JSON object
  web/src/admin-dsl/schema.ts
        |
        v
React renderer
  web/src/admin-dsl/render.tsx
```

This path exists for fast visual review. It is allowed to be frontend-local because it is not the trust boundary. It still must obey the same JSON shape as backend-authored pages.

### Current event path

The action path is as important as the render path. The DSL is not just a static page language; it includes action references that connect rendered controls to backend callbacks.

```text
Flow render transaction starts
        |
        v
ctx.bind(actionBuilder, callback, optionalEvent)
        |
        v
ScriptRuntime assigns opaque action id
        |
        v
ActionRef with id/event is embedded in page JSON
        |
        v
Renderer displays button/control
        |
        v
User clicks or submits
        |
        v
dispatchAdminAction(ctx, node, action, value, meta)
        |
        v
BackendAdminDslPage converts render event to AdminInteractionEvent
        |
        v
POST /api/admin-dsl/flows/{sessionId}/events
        |
        v
ScriptSession.Dispatch verifies page version and action id
        |
        v
Registered Goja callback runs and returns next page
```

A grammar must preserve this separation. Actions can be specified and typed, but callbacks cannot become browser-visible functions. A compiler may generate action declarations and placements; it must still lower backend-bound actions to opaque `ActionRef` values during render transactions.

## Existing File Reference

This section lists the current implementation files a researcher should read first.

| File | What to study |
| --- | --- |
| `pkg/admindsl/types.go` | Canonical Go structs for `Page`, `Node`, `ActionRef`, `Shell`, `NodeMeta`, and flow results. |
| `pkg/admindsl/builder.go` | Authoritative backend fluent builder API and JSON construction rules. |
| `pkg/admindsl/validate.go` | Validation rules for schema v2 page shape, node kinds, props, actions, fields, layouts, and surface IDs. |
| `pkg/admindsl/goja_module.go` | Controlled exports available to embedded flow scripts through `require("fringe/admin-dsl")`. |
| `pkg/admindsl/script_runtime.go` | Goja runtime, CommonJS module loading, `ctx.bind`, action registration, page rendering, dispatch, stale action behavior. |
| `pkg/admindsl/proto_convert.go` | Conversion from Go `Page`/`Node`/`FlowResult` to protobuf-generated transport structs. |
| `pkg/server/handlers_admin_dsl.go` | HTTP endpoints for start, get, and dispatch events for admin DSL sessions. |
| `proto/fringe/admin_dsl/v1/admin_dsl.proto` | Stable transport envelope around dynamic page/node props. |
| `web/src/admin-dsl/schema.ts` | Frontend TypeScript definitions of page, node, action, and render event JSON. |
| `web/src/admin-dsl/builder.ts` | Frontend builders used by Storybook and local fixtures. |
| `web/src/admin-dsl/render.tsx` | Explicit React interpreter for Admin DSL nodes. This is not dynamic component lookup. |
| `web/src/admin-dsl/actions.ts` | Action normalization, dispatch, and action styling predicates. |
| `web/src/admin-dsl/renderUtils.ts` | Small JSON extraction helpers used by the renderer. |
| `web/src/admin-dsl/BackendAdminDslPage.tsx` | Browser-side adapter between renderer events and backend interaction events. |
| `web/src/admin-dsl/backendClient.ts` | Protobuf JSON client for start/get/dispatch Admin DSL endpoints. |
| `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` | Current v2 workbench fixture catalog and examples of intended vocabulary. |

## What a Formal Grammar Would Define

A grammar for Admin DSL can mean two different things. The distinction matters.

The first grammar is a **page authoring grammar**. It describes how a human or generator writes a page. It can compile into builder calls or directly into JSON.

The second grammar is a **language-definition grammar**. It describes the DSL itself: node kinds, prop schemas, action placements, validation rules, children constraints, and renderer requirements. It can generate builders, TypeScript types, Go constants, validation scaffolding, and renderer registration scaffolding.

Both grammars are useful, but they solve different problems.

### Page authoring grammar

A page authoring grammar could let a developer write this:

```admindsl
page admin-dsl-v2-request-triage "Request Triage" shell admin {
  header "Request Triage" {
    breadcrumbs ["Admin DSL", "Workbench v2"]
    description "Review customer intake requests with compact status, customer, service, budget, and submitted columns."
  }

  grid columns { desktop: 12, mobile: 1 } gap compact {
    panel "Today’s queue" density compact padding none span { desktop: 8, mobile: 1 } {
      table requests {
        columns [
          badge status "Status" map { new: "New" warning, needsInfo: "Needs info" danger, approved: "Approved" success }
          text customer "Customer" primary
          text service "Service"
          money budget "Budget"
          relativeTime submitted "Submitted"
          actions actions "Actions"
        ]
        rows requestRows
        bulkLabel "3 visible requests"
        bulkAction secondary requests.bulkAssign "Assign" placement bulkToolbar
      }
    }
  }
}
```

That source could compile to the current TypeScript builder API:

```ts
admin.page("admin-dsl-v2-request-triage", "Request Triage")
  .schemaVersion(2)
  .shell("admin", shell("requests"))
  .content(
    admin.pageHeader({
      breadcrumbs: ["Admin DSL", "Workbench v2"],
      title: "Request Triage",
      description: "Review customer intake requests with compact status, customer, service, budget, and submitted columns.",
    }),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("Today’s queue", { density: "compact", padding: "none", layout: { span: { desktop: 8, mobile: 1 } } },
        resource.table("requests", requestColumns, requestRows, {
          bulkLabel: "3 visible requests",
          bulkActions: [
            action.secondary("requests.bulkAssign", "Assign")
              .placement("bulkToolbar")
              .toJSON(),
          ],
        }),
      ),
    ),
  )
  .toJSON();
```

It could also compile directly to JSON. Direct JSON compilation is simpler, but builder-call compilation is useful if researchers want generated source that fits current Storybook patterns.

### Language-definition grammar

A language-definition grammar would describe the language once and generate the repetitive implementation pieces. It would not render the page by itself. It would say what node kinds exist and what each node kind requires.

A language-definition source could look like this:

```admindsl-spec
language AdminDSL version 2

shell admin
shell dashboard
shell resource
shell calendar
shell settings
shell bare

action type open | close | navigate | mutation | confirm | refresh | upload
action intent neutral | primary | danger
action priority primary | secondary | tertiary
action placement toolbar | pageHeader | panelToolbar | panelFooter | row | rowOverflow | bulkToolbar | formFooter | calendarCell | sidebarNav | footer | detail | overflow

node pageHeader category layout {
  props {
    title: string required
    description: string optional
    breadcrumbs: string[] optional
    actions: ActionRef[] optional placement pageHeader
  }
  children none
  render pageHeader
}

node resourceTable category resource {
  props {
    id: string required
    columns: ResourceColumn[] required nonempty
    rows: object[] required
    rowId: string optional default "id"
    bulkLabel: string optional
    bulkActions: ActionRef[] optional placement bulkToolbar
    pagination: object optional
    selectable: boolean optional
  }
  rowValidation {
    stableId rowId
    actions: ActionRef[] optional
  }
  children none
  render resourceTable
}

node panel category layout {
  props {
    title: string optional
    ariaLabel: string optional
    description: string optional
    density: enum(compact, normal, spacious) optional
    padding: enum(none, normal) optional
    layout: Layout optional
    toolbarActions: ActionRef[] optional placement panelToolbar
    footerActions: ActionRef[] optional placement panelFooter
  }
  constraint oneOf(title, ariaLabel)
  children any AdminNode
  render panel
}
```

This source describes the language. From it, a compiler can generate TypeScript union members, Go constants, builder function signatures, validation scaffolding, documentation tables, and renderer dispatch stubs.

## Proposed Canonical AST

The existing JSON shape is already an AST. A formal compiler should treat it as the transport AST, but it may benefit from a richer internal AST during parsing and validation.

### Transport AST

The transport AST must remain stable because it is shared across Go, protobuf JSON, and React.

```ts
interface AdminPage {
  schemaVersion: 2;
  id: string;
  title: string;
  description?: string;
  shell: AdminShell;
  nodes: AdminNode[];
  modals?: AdminNode[];
  drawers?: AdminNode[];
  meta?: AdminJsonObject;
}

interface AdminNode {
  kind: AdminNodeKind;
  props?: AdminJsonObject;
  children?: AdminNode[];
  meta?: AdminNodeMeta;
}

interface AdminActionRef {
  id?: string;
  event?: string;
  type: ActionType;
  target: string;
  label?: string;
  payload?: AdminJsonValue;
  options?: AdminJsonObject;
  intent?: ActionIntent;
  priority?: ActionPriority;
  presentation?: string;
  placement?: ActionPlacement;
  requiresConfirmation?: boolean;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}
```

This shape should not become a large hierarchy of transport-specific subclasses. The project intentionally keeps the page boundary as JSON. A compiler may generate typed helpers, but the renderer and transport still need to accept the stable JSON form.

### Internal compiler AST

An internal compiler AST should contain source locations, resolved symbols, and typed prop structures. These do not need to cross the runtime boundary.

```ts
type SourceSpan = {
  file: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
};

type PageDecl = {
  kind: "PageDecl";
  id: string;
  title: string;
  shell: ShellExpr;
  body: NodeExpr[];
  modals: NodeExpr[];
  drawers: NodeExpr[];
  span: SourceSpan;
};

type NodeExpr = {
  kind: "NodeExpr";
  nodeKind: string;
  id?: string;
  props: PropExpr[];
  children: NodeExpr[];
  actions: ActionExpr[];
  span: SourceSpan;
};

type ActionExpr = {
  kind: "ActionExpr";
  actionType: string;
  target: string;
  label?: string;
  placement?: string;
  intent?: string;
  priority?: string;
  payload?: Expr;
  span: SourceSpan;
};
```

This internal AST enables better diagnostics than raw JSON validation. For example, instead of reporting `nodes[1].children[0].props.columns[2] requires id`, the compiler can report `request_triage.admindsl:14:11: resourceTable column "Status" is missing id`.

## Page Authoring Grammar: Exploratory EBNF

This grammar is intentionally small. It is a research artifact, not a final syntax decision.

```ebnf
Program        ::= ImportDecl* PageDecl* ;

ImportDecl     ::= "import" Identifier "from" StringLiteral ";" ;

PageDecl       ::= "page" Identifier StringLiteral ShellDecl PageBlock ;
ShellDecl      ::= "shell" Identifier PropBlock? ;
PageBlock      ::= "{" PageItem* "}" ;
PageItem       ::= HeaderDecl | GridDecl | NodeDecl | SurfaceDecl | MetaDecl ;

HeaderDecl     ::= "header" StringLiteral PropBlock? Block? ;
GridDecl       ::= "grid" PropBlock? "{" GridItem* "}" ;
GridItem       ::= PanelDecl | NodeDecl ;
PanelDecl      ::= "panel" StringLiteral PropBlock? Block ;

SurfaceDecl    ::= ("modal" | "drawer" | "sheet") Identifier PropBlock? Block ;

NodeDecl       ::= Identifier Identifier? PropBlock? Block? ;
Block          ::= "{" NodeDecl* "}" ;
PropBlock      ::= "{" Prop* "}" ;
Prop           ::= Identifier ":" Expr ;

TableDecl      ::= "table" Identifier PropBlock? "{" TableItem* "}" ;
TableItem      ::= ColumnList | RowSource | BulkActionDecl | Prop ;
ColumnList     ::= "columns" "[" ColumnDecl* "]" ;
ColumnDecl     ::= ColumnKind Identifier StringLiteral ColumnOption* ;
ColumnKind     ::= "text" | "badge" | "money" | "relativeTime" | "boolean" | "actions" | "overflowActions" | "dragHandle" ;
ColumnOption   ::= "primary" | "muted" | "map" MapExpr ;
RowSource      ::= "rows" Identifier ;
BulkActionDecl ::= "bulkAction" ActionDecl ;

ActionDecl     ::= ActionKind Identifier StringLiteral ActionOption* ;
ActionKind     ::= "open" | "close" | "navigate" | "mutation" | "confirm" | "refresh" | "upload" | "primary" | "secondary" | "danger" ;
ActionOption   ::= "placement" Identifier | "payload" Expr | "disabled" | "loading" ;

Expr           ::= StringLiteral | NumberLiteral | BooleanLiteral | NullLiteral | ArrayExpr | ObjectExpr | Identifier ;
ArrayExpr      ::= "[" (Expr ("," Expr)*)? "]" ;
ObjectExpr     ::= "{" (ObjectPair ("," ObjectPair)*)? "}" ;
ObjectPair     ::= Identifier ":" Expr ;
MapExpr        ::= ObjectExpr ;

Identifier     ::= /[A-Za-z_][A-Za-z0-9_.-]*/ ;
StringLiteral  ::= JSON_STRING ;
NumberLiteral  ::= JSON_NUMBER ;
BooleanLiteral ::= "true" | "false" ;
NullLiteral    ::= "null" ;
```

This grammar should be extended only after the compiler model is understood. The syntax should not attempt to express every JavaScript expression used in current flows. Backend flow scripts still need JavaScript because they call host modules, inspect state, bind callbacks, and compute rows. A page authoring grammar is most useful for static fixtures, documentation examples, generated smoke pages, and possibly a subset of backend page construction.

## Language-Definition Grammar: Exploratory EBNF

The language-definition grammar is more important for code generation. It describes Admin DSL itself.

```ebnf
Spec             ::= "language" Identifier "version" Integer SpecItem* ;
SpecItem         ::= ShellSpec | EnumSpec | ActionSpec | NodeSpec | TypeSpec ;

ShellSpec        ::= "shell" Identifier ;
EnumSpec         ::= "enum" Identifier "{" Identifier* "}" ;
ActionSpec       ::= "action" "type" IdentifierList ;

NodeSpec         ::= "node" Identifier "category" Identifier "{" NodeSpecItem* "}" ;
NodeSpecItem     ::= PropsSpec | ChildrenSpec | ConstraintSpec | RowValidationSpec | RenderSpec | BuilderSpec ;

PropsSpec        ::= "props" "{" PropSpec* "}" ;
PropSpec         ::= Identifier ":" TypeRef Requiredness? DefaultSpec? Annotation* ;
Requiredness     ::= "required" | "optional" ;
DefaultSpec      ::= "default" Expr ;
Annotation       ::= "placement" Identifier | "nonempty" | "json" | "style" ;

ChildrenSpec     ::= "children" ("none" | "any" TypeRef | "list" TypeRef | "slots" "{" SlotSpec* "}") ;
SlotSpec         ::= Identifier ":" TypeRef Requiredness? ;

ConstraintSpec   ::= "constraint" ConstraintExpr ;
ConstraintExpr   ::= "oneOf" "(" IdentifierList ")"
                   | "requires" "(" Identifier ")"
                   | "if" Identifier "=" Expr "then" ConstraintExpr ;

RowValidationSpec ::= "rowValidation" "{" RowValidationItem* "}" ;
RowValidationItem ::= "stableId" Identifier | Identifier ":" TypeRef Requiredness? ;

RenderSpec       ::= "render" Identifier RenderOption* ;
RenderOption     ::= "manual" | "generated" | "cellRenderer" Identifier ;

BuilderSpec      ::= "builder" Identifier? "(" BuilderParam* ")" ;
BuilderParam     ::= Identifier ":" TypeRef Requiredness? ;

TypeSpec         ::= "type" Identifier "{" PropSpec* "}" ;
TypeRef          ::= Identifier | Identifier "[]" | "string" | "number" | "boolean" | "object" | "json" | "ActionRef" | "AdminNode" ;
IdentifierList   ::= Identifier ("|" Identifier)* ;
```

A source file written in this grammar becomes the canonical specification. It can generate several targets without requiring a textual page language.

## Code Generation Targets

A grammar-driven system should not try to generate every line of the application. It should generate repeatable declarations and leave hand-written runtime behavior where human judgment is required.

### Target 1: TypeScript schema definitions

Current file:

- `web/src/admin-dsl/schema.ts`

Generated content could include:

- `AdminNodeKind` union.
- `AdminShellKind` union.
- action type/intent/priority/placement unions.
- typed prop interfaces for each node kind.
- generic `AdminNode<P>` and `AdminPage` definitions.

Generated output sketch:

```ts
export type AdminNodeKind =
  | "pageHeader"
  | "dashboardGrid"
  | "panel"
  | "resourceTable"
  | "comparisonTable"
  | "monthCalendar";

export interface PageHeaderProps extends AdminJsonObject {
  title: string;
  description?: string;
  breadcrumbs?: string[];
  actions?: AdminActionRef[];
}

export interface ResourceTableProps extends AdminJsonObject {
  id: string;
  columns: ResourceColumn[];
  rows: AdminJsonObject[];
  rowId?: string;
  bulkActions?: AdminActionRef[];
}
```

The current `AdminJsonObject` escape hatch should remain available. Admin DSL deliberately allows dynamic JSON props for incremental evolution. A generated schema should add typed helper interfaces without blocking transport-compatible JSON.

### Target 2: TypeScript builder API

Current file:

- `web/src/admin-dsl/builder.ts`

Generated content could include builder helper functions and method signatures.

Generated output sketch:

```ts
export const admin = {
  pageHeader: (props: PageHeaderProps) => node("pageHeader", props),
  dashboardGrid: (props: DashboardGridProps = {}, ...children: NodeInput[]) =>
    node("dashboardGrid", props, ...children),
  panel: (title: string, props: PanelProps = {}, ...children: NodeInput[]) =>
    node("panel", { title, ...props }, ...children),
};

export const resource = {
  table: (id: string, columns: ResourceColumn[], rows: AdminJsonObject[], props: Partial<ResourceTableProps> = {}) =>
    node("resourceTable", { id, columns, rows, ...props }).id(id),
};
```

The compiler should preserve the current builder design: builders produce plain JSON and expose `toJSON()`. They should not become runtime components.

### Target 3: Go node constants and builders

Current files:

- `pkg/admindsl/types.go`
- `pkg/admindsl/builder.go`

Generated content could include `NodeKind` constants and simple constructor functions.

Generated output sketch:

```go
const (
    NodePageHeader      NodeKind = "pageHeader"
    NodeDashboardGrid   NodeKind = "dashboardGrid"
    NodePanel           NodeKind = "panel"
    NodeResourceTable   NodeKind = "resourceTable"
)

func PageHeader(props JSONObject) *NodeBuilder {
    return NodeOf(NodePageHeader, props)
}

func ResourceTable(id string, props JSONObject) *NodeBuilder {
    return NodeOf(NodeResourceTable, merge(JSONObject{"id": id}, props)).ID(id)
}
```

The generated Go builder layer should remain compatible with Goja. Goja currently receives Go host functions from `GojaModule()`, so the generated functions must use signatures that Goja can call reliably.

### Target 4: Goja module export table

Current file:

- `pkg/admindsl/goja_module.go`

Generated content could include the export map keys for node builders, page builders, and action builders.

Generated output sketch:

```go
func GojaModule() map[string]any {
    surface := map[string]any{
        "drawer": Drawer,
        "modal": Modal,
        "sheet": Sheet,
    }
    return map[string]any{
        "pageAdmin":      PageAdmin,
        "pageHeader":     PageHeader,
        "dashboardGrid":  DashboardGrid,
        "panel":          Panel,
        "resourceTable":  ResourceTable,
        "surface":        surface,
        "open":           Open,
        "primary":        Primary,
        "secondary":      Secondary,
    }
}
```

This target is low risk because it is mostly mechanical. It is also valuable because stale Goja exports are an easy source of migration drift.

### Target 5: Validation tables and validation skeletons

Current file:

- `pkg/admindsl/validate.go`

Generated content could include:

- allowed shell kinds.
- allowed node kinds.
- allowed action types, intents, priorities, placements.
- required prop checks.
- enum prop checks.
- generic action-slot checks.
- generic child-count/child-kind checks.

Some validation should remain hand-written. For example, `resourceTable` row validation requires row ID selection through `props.rowId`; `monthCalendar` validates nested `actions`; surface ID uniqueness is page-wide. These are semantic validations, not simple grammar productions.

Generated validation skeleton:

```go
var allowedNodeKinds = map[NodeKind]struct{}{
    NodePageHeader: {},
    NodeDashboardGrid: {},
    NodePanel: {},
    NodeResourceTable: {},
}

func validateGeneratedNodeShape(node Node) error {
    switch node.Kind {
    case NodePageHeader:
        return validateProps(node.Props, generatedPageHeaderSpec)
    case NodePanel:
        return validateProps(node.Props, generatedPanelSpec)
    case NodeResourceTable:
        if err := validateProps(node.Props, generatedResourceTableSpec); err != nil {
            return err
        }
        return validateResourceTableRows(node)
    }
    return nil
}
```

The compiler should generate the repetitive portion and call hand-written validators through named hooks.

### Target 6: Renderer dispatch scaffolding

Current file:

- `web/src/admin-dsl/render.tsx`

The renderer should not be fully generated. Rendering is where design decisions live: layout, typography, accessibility, mobile behavior, and interaction details. A compiler can still generate useful scaffolding:

- a `renderRegistry` table with all node kinds.
- typed prop extraction helpers for each node kind.
- exhaustiveness checks that fail when a node kind has no renderer.
- placeholder renderer functions for new nodes.
- documentation comments linking node specs to render functions.

Generated output sketch:

```ts
const generatedRenderers: Record<AdminNodeKind, NodeRenderer> = {
  pageHeader: renderPageHeader,
  dashboardGrid: renderDashboardGrid,
  panel: renderPanel,
  resourceTable: renderResourceTable,
  comparisonTable: renderComparisonTable,
  monthCalendar: renderMonthCalendar,
};

export function renderAdminNode(node: AdminNode, ctx?: AdminRenderContext, key?: Key): ReactNode {
  const renderer = generatedRenderers[node.kind];
  if (!renderer) return renderUnknownNode(node, key);
  return renderer(node, ctx, key);
}
```

This differs from arbitrary dynamic component lookup. The registry is generated from a controlled spec, and each renderer function remains explicit source code.

### Target 7: Documentation and test fixtures

A grammar/compiler can generate documentation tables and test fixtures. This target is often the safest first experiment because it does not affect runtime behavior.

Generated artifacts could include:

- a Markdown node reference.
- a Markdown action placement reference.
- a JSON fixture per node kind.
- a test that every node kind in the spec appears in `schema.ts`, `types.go`, and renderer registration.
- a test that every action placement in the spec is accepted by Go validation and TypeScript types.

## Compiler Pipeline

A compiler for Admin DSL should have small phases. Each phase should produce a concrete artifact that can be tested.

```text
Spec source or page source
        |
        v
Lexer
        |
        v
Parser
        |
        v
Raw AST with source spans
        |
        v
Name binding and reference resolution
        |
        v
Typed AST
        |
        v
Semantic validation
        |
        v
Intermediate representation
        |
        v
Code generation targets
        |
        +--> TypeScript schema
        +--> TypeScript builders
        +--> Go constants/builders
        +--> Goja export map
        +--> Go validation scaffolding
        +--> Renderer registry/skeleton
        +--> Markdown docs and fixtures
```

### Phase 1: Lexing

The lexer turns source text into tokens. It should preserve source spans for diagnostics.

Pseudocode:

```pseudo
function lex(input): Token[]
  tokens = []
  while not end(input):
    skipWhitespaceAndComments()
    if next is identifierStart:
      tokens.append(readIdentifierOrKeyword())
    else if next is quote:
      tokens.append(readStringLiteral())
    else if next is digit or '-':
      tokens.append(readNumberLiteral())
    else if next in punctuation:
      tokens.append(readPunctuation())
    else:
      error("unexpected character", currentSpan)
  tokens.append(EOF)
  return tokens
```

### Phase 2: Parsing

The parser turns tokens into a raw AST. It should not perform deep semantic validation. It should enforce syntax and produce structured nodes.

Pseudocode:

```pseudo
function parseSpec(tokens): Spec
  expect("language")
  name = parseIdentifier()
  expect("version")
  version = parseInteger()
  items = []
  while not EOF:
    items.append(parseSpecItem())
  return Spec(name, version, items)
```

### Phase 3: Binding

Binding resolves references. For the language-definition grammar, it resolves type references and renderer hook names. For the page authoring grammar, it resolves imported row sources, local data identifiers, and action targets if those are declared.

Pseudocode:

```pseudo
function bindSpec(spec): BoundSpec
  symbols = new SymbolTable()
  for item in spec.items:
    symbols.define(item.name, item)
  for node in spec.nodes:
    for prop in node.props:
      prop.type = symbols.resolveType(prop.typeName)
  return BoundSpec(spec, symbols)
```

### Phase 4: Semantic validation

Semantic validation enforces rules that the grammar cannot express cleanly.

Examples:

- `pageHeader` requires `title`.
- `panel` requires `title` or `ariaLabel`.
- `resourceTable` requires non-empty `columns`.
- `resourceTable` rows require a stable row ID.
- `comparisonTable` rows require `id`, `field`, `current`, and `draft`.
- `monthCalendar` requires `month`.
- surfaces require unique IDs across `nodes`, `modals`, and `drawers`.
- action placement values must be in the allowed placement set.

Pseudocode:

```pseudo
function validatePage(page, spec): Diagnostic[]
  diagnostics = []
  if page.schemaVersion != spec.version:
    diagnostics.add(error("schemaVersion must be " + spec.version, page.span))
  for node in walk(page.nodes + page.modals + page.drawers):
    nodeSpec = spec.findNode(node.kind)
    if nodeSpec is missing:
      diagnostics.add(error("unknown node kind", node.span))
      continue
    diagnostics.extend(validateProps(node.props, nodeSpec.props))
    diagnostics.extend(validateChildren(node.children, nodeSpec.children))
    diagnostics.extend(runSemanticHooks(node, nodeSpec.hooks))
  diagnostics.extend(validateSurfaceIds(page))
  return diagnostics
```

### Phase 5: Lowering

Lowering converts a high-level page AST into the transport AST or builder calls. The lowering phase should normalize defaults, action shorthand, layout shorthand, and node-specific shorthand.

Example lowering:

```admindsl
panel "Today’s queue" density compact padding none span { desktop: 8, mobile: 1 } { ... }
```

becomes:

```json
{
  "kind": "panel",
  "props": {
    "title": "Today’s queue",
    "density": "compact",
    "padding": "none",
    "layout": { "span": { "desktop": 8, "mobile": 1 } }
  },
  "children": [ ... ]
}
```

### Phase 6: Code generation

Code generation should be deterministic. Generated files should be formatted by the normal project formatters.

Pseudocode:

```pseudo
function generateAll(boundSpec): GeneratedFiles
  files = []
  files.add(generateTypescriptSchema(boundSpec))
  files.add(generateTypescriptBuilders(boundSpec))
  files.add(generateGoTypes(boundSpec))
  files.add(generateGoBuilders(boundSpec))
  files.add(generateGojaModule(boundSpec))
  files.add(generateValidationTables(boundSpec))
  files.add(generateRendererRegistry(boundSpec))
  files.add(generateMarkdownReference(boundSpec))
  return files
```

## How This Maps to Current Builder JS API

The current TypeScript builder API is already close to a compiler target. It has three important patterns:

1. Constructors create JSON nodes.
2. Fluent methods add common props or metadata.
3. `toJSON()` returns cloned plain JSON.

The generated API should preserve those patterns.

### Builder generation rules

A node spec can define a builder signature. If no explicit builder is provided, the compiler can generate a generic prop-first builder.

```admindsl-spec
node pageHeader category layout {
  props { title: string required; description: string optional }
  children none
  builder pageHeader(props: PageHeaderProps required)
}

node panel category layout {
  props { title: string optional; ariaLabel: string optional; density: Density optional }
  constraint oneOf(title, ariaLabel)
  children any AdminNode
  builder panel(title: string required, props: PanelProps optional, children: AdminNode[] optional)
}
```

Generated TypeScript:

```ts
pageHeader: (props: PageHeaderProps) => node("pageHeader", props),
panel: (title: string, props: PanelProps = {}, ...children: NodeInput[]) =>
  node("panel", { title, ...props }, ...children),
```

Generated Go:

```go
func PageHeader(props JSONObject) *NodeBuilder {
    return NodeOf(NodePageHeader, props)
}

func Panel(title string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
    return NodeOf(NodePanel, merge(JSONObject{"title": title}, props), children...)
}
```

### Action builder generation rules

Action builders are less tied to node kinds. The action vocabulary can be generated from action type and policy definitions.

Current TypeScript action helpers:

```ts
action.open(target, label, payload)
action.secondary(target, label, payload)
action.primary(target, label, payload)
action.danger(target, label, payload)
```

Current Go action helpers:

```go
Open(target, label string)
Secondary(target, label string)
Primary(target, label string)
Danger(target, label string)
```

A spec can generate these helpers from action profiles:

```admindsl-spec
actionProfile primary {
  type mutation
  intent primary
  priority primary
}

actionProfile secondary {
  type mutation
  intent neutral
  priority secondary
}

actionProfile danger {
  type mutation
  intent danger
  priority secondary
  requiresConfirmation true
}
```

## How This Maps to `render.tsx`

The renderer is an interpreter. It should remain explicit. A formal grammar should help the renderer stay complete and consistent, but it should not hide rendering decisions behind arbitrary component lookup.

### Current renderer pattern

`renderAdminNode(...)` switches on `node.kind`.

```tsx
export function renderAdminNode(node: AdminNode, ctx?: AdminRenderContext, key?: Key): ReactNode {
  const props = node.props || {};
  const common = dataAttrs(node);

  switch (node.kind) {
    case "pageHeader":
      ...
    case "dashboardGrid":
      ...
    case "resourceTable":
      ...
    case "panel":
      ...
  }
}
```

This is easy to debug. The cost is that adding a node kind requires editing the switch. A generated registry can preserve explicit renderer functions while making missing renderers visible.

### Proposed renderer registration target

Generated file:

- `web/src/admin-dsl/generated/renderRegistry.ts`

Hand-written file:

- `web/src/admin-dsl/render.tsx`

Generated registry:

```ts
import type { AdminNodeKind } from "../schema";
import {
  renderPageHeader,
  renderDashboardGrid,
  renderPanel,
  renderResourceTable,
  renderComparisonTable,
  renderMonthCalendar,
} from "../renderers";

export const renderRegistry: Record<AdminNodeKind, NodeRenderer> = {
  pageHeader: renderPageHeader,
  dashboardGrid: renderDashboardGrid,
  panel: renderPanel,
  resourceTable: renderResourceTable,
  comparisonTable: renderComparisonTable,
  monthCalendar: renderMonthCalendar,
  ...
};
```

Hand-written renderers remain explicit:

```tsx
export function renderResourceTable(node: AdminNode<ResourceTableProps>, ctx?: AdminRenderContext, key?: Key) {
  const props = node.props || {};
  const columns = jsonArray<ResourceColumn>(props, "columns");
  const rows = jsonArray<AdminJsonObject>(props, "rows");
  ...
}
```

The generated registry provides completeness. The renderer functions retain design authority.

### Generated prop extractors

The compiler could generate prop extractors to reduce repetitive `str`, `jsonArray`, and `jsonObject` calls.

```ts
export function readResourceTableProps(props: AdminJsonObject): ResourceTablePropsRuntime {
  return {
    id: str(props, "id"),
    columns: jsonArray<ResourceColumn>(props, "columns"),
    rows: jsonArray<AdminJsonObject>(props, "rows"),
    bulkActions: jsonArray<AdminActionRef>(props, "bulkActions").filter(isActionRef),
    rowId: str(props, "rowId", "id"),
  };
}
```

This is a safer generation target than full JSX generation. It reduces drift while keeping layout and styling hand-authored.

## How This Maps to Go Validation

Validation is the strongest candidate for generation because many rules are declarative.

### Declarative validation rules

The grammar/spec can generate checks for:

- allowed node kinds.
- required props.
- prop primitive types.
- enum values.
- action arrays and action maps.
- child count rules.
- child kind rules.
- layout positive-number rules.

### Hook-based validation rules

Some validations should be expressed as named hooks in the spec and implemented manually.

Examples:

```admindsl-spec
node resourceTable category resource {
  props { columns: ResourceColumn[] required nonempty; rows: object[] required; rowId: string optional default "id" }
  hook validateResourceTableRows
}

node panel category layout {
  props { title: string optional; ariaLabel: string optional }
  constraint oneOf(title, ariaLabel)
}
```

Generated Go calls:

```go
case NodeResourceTable:
    if err := validateGeneratedProps(node.Props, resourceTableSpec); err != nil {
        return err
    }
    if err := validateResourceTableRows(node); err != nil {
        return err
    }
```

The hook boundary is important. It prevents the grammar from becoming an overloaded programming language.

## API Reference: Current Admin DSL Vocabulary

This table summarizes the v2 node vocabulary currently present in both Go and TypeScript.

| Category | Node kinds |
| --- | --- |
| Layout | `pageHeader`, `dashboardGrid`, `toolbar`, `panel`, `splitPane`, `tabs`, `previewFrame`, `comparisonTable`, `monthCalendar` |
| Display | `metricCard`, `statusBadge`, `activityFeed`, `kvList`, `imageGrid`, `imageGallery`, `markdownBlock`, `emptyState`, `loadingState`, `inlineError` |
| Resource | `resourcePage`, `resourceTable`, `resourceDetail`, `filterBar`, `searchBox`, `actionMenu` |
| Forms | `form`, `fieldGroup`, `textField`, `textareaField`, `moneyField`, `durationField`, `dateField`, `timeField`, `selectField`, `switchField`, `imageField`, `saveBar` |
| Calendar | `calendarWeek`, `appointmentBlock`, `availabilityBlock`, `timeOffBlock` |
| Surfaces | `modal`, `drawer`, `sheet`, `detailPanel`, `inlinePanel`, `confirmDialog` |

The current action vocabulary is:

| Action field | Values |
| --- | --- |
| `type` | `open`, `close`, `navigate`, `mutation`, `confirm`, `refresh`, `upload` |
| `intent` | `neutral`, `primary`, `danger` |
| `priority` | `primary`, `secondary`, `tertiary` |
| `placement` | `toolbar`, `pageHeader`, `panelToolbar`, `panelFooter`, `row`, `rowOverflow`, `bulkToolbar`, `formFooter`, `calendarCell`, `sidebarNav`, `footer`, `detail`, `overflow` |

## Proposed Repository Layout for a Research Prototype

A research prototype should not overwrite current source files at first. It should generate into a temporary or generated directory and compare output against current files.

Proposed layout:

```text
pkg/admindsl/spec/
  admin_dsl_v2.admindsl-spec          # canonical language-definition source
  README.md                           # notes about generated vs hand-written artifacts

cmd/admin-dsl-gen/
  main.go                             # experimental generator CLI

pkg/admindsl/generated/
  node_kinds.go                       # generated constants, if adopted
  validation_tables.go                # generated validation tables, if adopted

web/src/admin-dsl/generated/
  schema.generated.ts                 # generated TS unions/interfaces
  builders.generated.ts               # generated builder helpers
  renderRegistry.generated.ts         # generated renderer registry, if adopted
  nodeReference.generated.md          # generated documentation

ttmp/.../experiments/admin-dsl-grammar/
  fixtures/
  generated-output/
  notes.md
```

During research, generated files should be compared with current hand-written files instead of immediately imported by production code.

## Implementation Plan for an Intern or Researcher

This plan is exploratory. Each step should produce evidence and a small report. Do not start by replacing production files.

### Step 1: Inventory the current language

Create a table from current source files:

- node kinds from `pkg/admindsl/types.go` and `web/src/admin-dsl/schema.ts`.
- builder functions from `pkg/admindsl/builder.go` and `web/src/admin-dsl/builder.ts`.
- validation rules from `pkg/admindsl/validate.go`.
- renderer cases from `web/src/admin-dsl/render.tsx`.
- action placements from both Go and TypeScript.

Deliverable:

- `ttmp/.../experiments/admin-dsl-grammar/01-language-inventory.md`

The inventory should identify drift. For example, if a node kind exists in Go but not TypeScript, record it.

### Step 2: Write the first language-definition spec

Create `admin_dsl_v2.admindsl-spec` with a small subset:

- `pageHeader`
- `dashboardGrid`
- `panel`
- `resourceTable`
- `form`
- `fieldGroup`
- `textField`
- `modal`
- `drawer`

Do not include every node at first. A smaller spec makes the generator easier to test.

Deliverable:

- `pkg/admindsl/spec/admin_dsl_v2.admindsl-spec`

### Step 3: Build a parser or use a structured input format

There are two valid research paths.

Path A uses a textual grammar and parser.

- Pros: better test of the formal grammar idea.
- Cons: more parser work before codegen evidence exists.

Path B uses YAML or JSON as the first spec format.

- Pros: faster evidence for code generation.
- Cons: less evidence about authoring-language ergonomics.

A practical research sequence is to start with YAML for the language-definition spec, then add a textual syntax later if the generated targets prove useful.

Example YAML equivalent:

```yaml
version: 2
nodes:
  pageHeader:
    category: layout
    props:
      title: { type: string, required: true }
      description: { type: string }
      breadcrumbs: { type: string[] }
      actions: { type: ActionRef[], placement: pageHeader }
    children: none
    render: pageHeader
```

Deliverable:

- parser or loader tests that produce a typed `Spec` AST.

### Step 4: Generate documentation first

Generate Markdown documentation from the spec before generating production code. Documentation generation is low risk and reveals whether the spec has enough information.

Generated sections should include:

- node kind table.
- prop table per node.
- action placement table.
- child rules.
- validation hooks.
- builder signature table.

Deliverable:

- `nodeReference.generated.md`
- a test that checks the generated doc includes all node kinds.

### Step 5: Generate drift tests

Generate tests that compare the spec against current source files.

Examples:

```pseudo
test "all spec node kinds exist in Go allowedNodeKinds"
test "all spec node kinds exist in TS AdminNodeKind"
test "all spec action placements exist in Go allowedActionPlacements"
test "all spec nodes have renderer entries"
```

This step gives value even if production code is never generated.

Deliverable:

- tests that fail when hand-written implementation drifts from the spec.

### Step 6: Generate TypeScript schema and builders into generated files

Generate `schema.generated.ts` and `builders.generated.ts`. Do not replace current files yet. Compare generated output against current definitions.

Evaluation questions:

- Does the generated API remain readable?
- Does it preserve the plain JSON boundary?
- Does it support existing Storybook examples without awkward escape hatches?
- Does it make error messages better or worse?

Deliverable:

- generated files plus a written comparison.

### Step 7: Generate Go constants/builders/export maps

Generate Go files into a separate package or generated directory. Do not import them into production until the output has been reviewed.

Evaluation questions:

- Are Goja-callable function signatures preserved?
- Are generated builders idiomatic enough to maintain?
- Do generated builders avoid dynamic reflection?
- Can the generator produce stable diffs?

Deliverable:

- generated Go files and `go test` over the generated package.

### Step 8: Generate validation scaffolding

Generate validation tables and simple prop checks. Keep semantic hooks hand-written.

Evaluation questions:

- How much of `validate.go` becomes declarative?
- Are diagnostics better with generated source metadata?
- Can the generator express v2 constraints without becoming a programming language?

Deliverable:

- a generated validator prototype and comparison with current `validate.go`.

### Step 9: Generate renderer registry only

Do not generate JSX first. Generate a registry or exhaustiveness test that ensures each node kind has a renderer.

Evaluation questions:

- Does this catch missing renderers early?
- Does it preserve explicit rendering?
- Does it improve test failure quality?

Deliverable:

- `renderRegistry.generated.ts` or an exhaustiveness test.

### Step 10: Write the research conclusion

The final research report should answer these questions:

- Which artifacts are worth generating?
- Which artifacts should remain hand-written?
- Is a textual page authoring grammar useful, or is a language-definition spec enough?
- Does the spec reduce drift without hiding important design decisions?
- Does the compiler preserve the JSON boundary and backend action security model?

## Risks and Constraints

### The grammar must not become the trusted runtime

The current system keeps backend callbacks in Goja sessions and sends only opaque action IDs to the browser. A grammar system must preserve this. It can declare actions and placements. It cannot serialize trusted backend functions to the browser.

### The renderer should remain explicit

The renderer is where accessibility, mobile layout, density, typography, and action affordances are implemented. A generated renderer can create missing placeholders or registries, but full JSX generation would hide important decisions and make visual refinement harder.

### Dynamic JSON props still matter

Admin DSL evolved quickly because props are JSON. A strict generated type system could slow down experimentation. The compiler should support typed known props while preserving `AdminJsonObject` escape hatches.

### Semantic validation is not only grammar

Some rules require page-wide knowledge or node-specific logic. Surface ID uniqueness, row ID stability, action validation inside row objects, and form field value-type checks are semantic validation rules. They should be represented as validation hooks, not forced into context-free grammar productions.

### Generated code must be reviewable

If generated output is noisy, developers will stop trusting it. The generator must produce deterministic, formatted, small diffs. It should separate generated files from hand-written files unless the team explicitly chooses full generation.

## Alternatives Considered

### Alternative 1: Keep the current hand-written system

The current system is clear and debuggable. Every file is small enough to inspect, and the v2 cutover removed most legacy drift. This is the lowest-risk path.

The drawback is ongoing manual synchronization. Every new node kind or action placement must be added in multiple places. Tests can catch drift, but they do not remove the maintenance work.

### Alternative 2: Use JSON Schema as the source of truth

JSON Schema could describe the transport AST and generate TypeScript types and validators. This approach would fit the JSON boundary well.

The drawback is that JSON Schema does not naturally generate ergonomic Go builders, Goja exports, renderer registries, or documentation with the exact semantics we need. It can be part of the system, but it is not a complete language-definition format.

### Alternative 3: Use protobuf as the full schema

The project already uses protobuf for the transport envelope. A fully typed protobuf node hierarchy could replace dynamic props.

The drawback is loss of flexibility. Every prop addition would require proto changes and generated code updates. Admin DSL currently benefits from stable top-level transport plus dynamic node props.

### Alternative 4: Generate everything from a grammar, including JSX

This maximizes generation and minimizes hand-written drift.

The drawback is that rendering is design-heavy. Full JSX generation would make visual changes harder and would likely produce a second language for layout/styling decisions. A better research target is generated renderer registration, prop readers, and tests, not full render implementation.

### Alternative 5: Treat TypeScript as the source of truth

The TypeScript schema and builders could generate Go constants and validators.

The drawback is that backend Go builders and Goja runtime are the authoritative production path for live admin flows. A source of truth that lives only in frontend code would be awkward for backend-owned flows.

## Research Recommendation

The strongest research path is not a page authoring language first. The strongest path is a **language-definition spec** that generates documentation, drift tests, TypeScript declarations, Go constants, Goja export lists, and validation scaffolding. This path directly addresses current maintenance drift while preserving the explicit builder and renderer architecture.

A page authoring grammar should be treated as a second experiment. It may be useful for static fixtures, generated examples, and education. It is less likely to replace backend flow JavaScript because backend flows need host module calls, state transitions, and callback binding.

The recommended order is:

1. Build a language inventory.
2. Write a small language-definition spec.
3. Generate documentation and drift tests.
4. Generate TypeScript schema/builders into separate generated files.
5. Generate Go constants/builders/Goja exports into separate generated files.
6. Generate validation scaffolding with hand-written hooks.
7. Generate renderer registry and exhaustiveness checks.
8. Decide whether any generated artifacts should become production inputs.

## Open Questions for the Researcher

- Should the canonical spec be textual, YAML, JSON, or TypeScript data?
- Should generated files be checked into the repository, or generated during tests?
- Which validation rules are declarative enough for the spec, and which should remain hooks?
- Should renderer registration be generated, or should tests simply verify switch coverage?
- Should the page authoring grammar support imports and computed row sources, or should it remain static?
- How should source spans be preserved through generated builder code and validation errors?
- Can generated docs replace part of the intern guides, or should they remain low-level reference material?
- What is the minimum useful generator that provides value without changing production runtime behavior?

## Appendix A: Small End-to-End Example

This example shows a possible source page, AST, builder output, and JSON output.

### Source page

```admindsl
page demo-requests "Requests" shell admin {
  header "Requests" {
    description: "Review customer intake requests."
  }

  grid { columns: { desktop: 12, mobile: 1 } } {
    panel "Queue" { density: "compact", padding: "none" } {
      table requests {
        columns [
          badge status "Status"
          text customer "Customer" primary
          actions actions "Actions"
        ]
        rows requestRows
        bulkAction secondary requests.assign "Assign" placement bulkToolbar
      }
    }
  }
}
```

### Internal AST sketch

```json
{
  "kind": "PageDecl",
  "id": "demo-requests",
  "title": "Requests",
  "shell": { "kind": "admin" },
  "body": [
    { "kind": "NodeExpr", "nodeKind": "pageHeader", "props": { "title": "Requests", "description": "Review customer intake requests." } },
    { "kind": "NodeExpr", "nodeKind": "dashboardGrid", "children": [
      { "kind": "NodeExpr", "nodeKind": "panel", "props": { "title": "Queue", "density": "compact", "padding": "none" }, "children": [
        { "kind": "NodeExpr", "nodeKind": "resourceTable", "props": { "id": "requests", "columns": "...", "rows": "requestRows", "bulkActions": "..." } }
      ] }
    ] }
  ]
}
```

### Generated builder code sketch

```ts
admin.page("demo-requests", "Requests")
  .schemaVersion(2)
  .shell("admin")
  .content(
    admin.pageHeader({ title: "Requests", description: "Review customer intake requests." }),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 } },
      admin.panel("Queue", { density: "compact", padding: "none" },
        resource.table("requests", requestColumns, requestRows, {
          bulkActions: [action.secondary("requests.assign", "Assign").placement("bulkToolbar").toJSON()],
        }),
      ),
    ),
  )
  .toJSON();
```

### Transport JSON sketch

```json
{
  "schemaVersion": 2,
  "id": "demo-requests",
  "title": "Requests",
  "shell": { "kind": "admin" },
  "nodes": [
    { "kind": "pageHeader", "props": { "title": "Requests", "description": "Review customer intake requests." } },
    { "kind": "dashboardGrid", "props": { "columns": { "desktop": 12, "mobile": 1 } }, "children": [
      { "kind": "panel", "props": { "title": "Queue", "density": "compact", "padding": "none" }, "children": [
        { "kind": "resourceTable", "props": { "id": "requests", "columns": [], "rows": [], "bulkActions": [] } }
      ] }
    ] }
  ]
}
```

## Appendix B: Generated Artifact Acceptance Criteria

A generated artifact should meet these criteria before it is considered for production use.

- It preserves the stable JSON Admin DSL boundary.
- It does not introduce arbitrary runtime component lookup.
- It does not expose backend callbacks to the browser.
- It produces deterministic diffs.
- It is formatted by project-standard formatters.
- It includes tests that compare generated vocabulary against runtime vocabulary.
- It improves diagnostics or reduces drift enough to justify the generator.
- It keeps hand-written rendering decisions visible.
- It supports incremental addition of node kinds.
- It can be disabled or regenerated without changing runtime state.

## Appendix C: Glossary

| Term | Meaning |
| --- | --- |
| Admin DSL | Backend-driven admin UI language represented as JSON pages, nodes, props, surfaces, and actions. |
| Transport AST | The stable JSON shape sent from backend to frontend and rendered by React. |
| Internal AST | Compiler-only structure with source spans, resolved symbols, and typed nodes. |
| Language-definition grammar | Grammar or structured spec that defines the DSL vocabulary and constraints. |
| Page authoring grammar | Grammar for writing concrete pages in a textual DSL. |
| Lowering | Compiler phase that converts high-level syntax into transport JSON or builder calls. |
| Goja module | Controlled CommonJS module exposed to embedded admin flow scripts. |
| ActionRef | Browser-visible action descriptor. Backend-bound actions include opaque `id` values assigned by `ctx.bind`. |
| Renderer registry | Controlled map from node kind to explicit renderer function. |
| Semantic hook | Hand-written validator for rules that are not simple prop type checks. |
