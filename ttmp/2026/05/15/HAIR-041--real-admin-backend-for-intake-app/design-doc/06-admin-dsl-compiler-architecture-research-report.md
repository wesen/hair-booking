---
Title: Admin DSL Compiler Architecture Research Report
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
      Note: Current backend builder API that a compiler could target or replace with generated constructors
    - Path: pkg/admindsl/goja_module.go
      Note: Current server-side JavaScript builder export layer
    - Path: pkg/admindsl/script_runtime.go
      Note: Current Goja runtime and ctx.bind callback boundary that compiler architecture must preserve
    - Path: pkg/admindsl/types.go
      Note: Current Go runtime AST and action vocabulary used as a baseline for typed AST/Core IR research
    - Path: pkg/admindsl/validate.go
      Note: Current validation layer that motivates declarative type checking plus semantic hooks
    - Path: proto/fringe/admin_dsl/v1/admin_dsl.proto
      Note: Current protobuf transport envelope and runtime action event shape
    - Path: web/src/admin-dsl/AdminDslWorkbench.stories.tsx
      Note: Current v2 workbench examples useful as compiler fixture candidates
    - Path: web/src/admin-dsl/BackendAdminDslPage.tsx
      Note: Current frontend event bridge from renderer events to backend AdminInteractionEvent
    - Path: web/src/admin-dsl/actions.ts
      Note: Current generic action runtime helpers that contextual action typing would lower into
    - Path: web/src/admin-dsl/builder.ts
      Note: Current frontend builder API that a compiler could target
    - Path: web/src/admin-dsl/render.tsx
      Note: Current renderer switch that motivates ReactPlan/widget-prop target lowering
    - Path: web/src/admin-dsl/schema.ts
      Note: Current frontend AdminPage/AdminNode/AdminActionRef JSON type boundary
ExternalSources: []
Summary: 'Research report for applying real compiler architecture to Admin DSL: typed source grammar, contextual action types, semantic analysis, Core Admin IR, target lowerings, and migration strategy from the current builder/renderer implementation.'
LastUpdated: 2026-05-17T11:45:00-04:00
WhatFor: Use when studying how Admin DSL could evolve from loose JSON builders and a large React switch into a typed compiler pipeline with explicit ASTs, IRs, semantic validation, and target backends.
WhenToUse: Use for research onboarding, prototype planning, or evaluating whether to create an Admin DSL compiler/spec architecture. This is exploratory and not an approved implementation task.
---


# Admin DSL Compiler Architecture Research Report

## Executive Summary

The current Admin DSL v2 system is a backend-driven UI language implemented through two builder surfaces. The backend side exposes Go builders to Goja flow scripts and validates the resulting page JSON before sending it to the frontend. The frontend side exposes TypeScript builders for Storybook and tests. Both builders produce a similar JSON page structure, and `web/src/admin-dsl/render.tsx` interprets that JSON through a large `node.kind` dispatch.

This report explores a different architecture: treat Admin DSL as a real compiled language. In this model, the authored Admin DSL is parsed into an AST, checked by a type system, lowered into one or more intermediate representations, and compiled to targets. The targets can include the current JSON transport, TypeScript builders, Go builders, renderer component bindings, documentation, tests, or text output. The intermediate representation does not have to be JSON. JSON becomes one possible serialization format, not the central semantic model.

The main research direction is to separate the language into compiler stages:

```text
Source syntax or structured source
        |
        v
Concrete syntax tree
        |
        v
Surface AST
        |
        v
Name resolution and type checking
        |
        v
Typed Admin AST
        |
        v
Core Admin IR
        |
        v
Target lowering
        |
        +--> JSON transport
        +--> React component props
        +--> Go/TS builder source
        +--> validation docs/tests
        +--> textual or non-UI render targets
```

The important shift is that node types and action contexts become explicit language constructs. A `table.bulkAction` is not just a generic action with `placement: "bulkToolbar"`. It is a contextual action capability that lowers into a generic runtime action only after type checking. A `panel.footerAction`, a `pageHeader.action`, and a `resourceTable.rowAction` can share a runtime representation while remaining distinct in the source language and typed AST.

This report is exploratory. It does not recommend replacing the current Admin DSL implementation immediately. It provides a research plan for an intern or postdoc to study how such a compiler could work, where it would connect to the existing codebase, what risks it introduces, and which first experiments would produce evidence without disrupting production.

## Problem Statement

The current Admin DSL implementation has a simple and useful boundary: pages are plain JSON, and the renderer interprets them. This has worked well for rapid development, but it also creates pressure in three places.

First, node props are loosely typed. The renderer receives an `AdminNode` with a `kind` string and an untyped `props` object. Each renderer branch then extracts fields using helpers such as `str`, `jsonArray`, and `jsonObject`. The renderer is doing part of the language interpretation, part of the validation, part of the prop transformation, and part of the visual rendering.

Second, action placement is too generic at the language level. Today an action has a `placement` string such as `row`, `bulkToolbar`, `panelFooter`, or `pageHeader`. Those placements are meaningful only inside specific parent contexts. A bulk toolbar action belongs to a table. A row action belongs to a table row or row-like resource. A panel footer action belongs to a panel. They all lower to an `ActionRef`, but they are not equally valid everywhere.

Third, the renderer is becoming a central dispatch file that mixes several responsibilities:

- interpreting node kinds;
- transforming untyped props into UI-specific props;
- applying default layout and typography;
- implementing table, calendar, form, and surface behavior;
- wiring action dispatch.

A compiler architecture can separate these concerns. The source language can express intent. The type checker can enforce valid contexts. The lowering phase can normalize and elaborate the program into a target-neutral Core Admin IR. Target backends can then convert that IR into JSON transport, React component props, documentation, tests, or other outputs.

The research question is:

> How would Admin DSL look if it were designed as a compiled language with typed ASTs, contextual action capabilities, explicit IRs, and target backends, while preserving the backend action security model and the ability to produce plain JSON for transport?

## Current Implementation: What Exists Today

A researcher should understand the current implementation before designing a compiler. The current system has two authoring paths and one renderer path.

### Backend authoring path

The backend path is the production path for live admin flows.

```text
Embedded flow file
  pkg/admindsl/flows/*.flow.js
        |
        v
Goja runtime
  pkg/admindsl/script_runtime.go
        |
        v
Go host builders exposed as require("fringe/admin-dsl")
  pkg/admindsl/goja_module.go
  pkg/admindsl/builder.go
        |
        v
Go Page / Node / ActionRef structs
  pkg/admindsl/types.go
        |
        v
Validation
  pkg/admindsl/validate.go
        |
        v
Protobuf JSON envelope
  proto/fringe/admin_dsl/v1/admin_dsl.proto
  pkg/admindsl/proto_convert.go
        |
        v
HTTP handlers
  pkg/server/handlers_admin_dsl.go
        |
        v
Frontend client and renderer
  web/src/admin-dsl/backendClient.ts
  web/src/admin-dsl/BackendAdminDslPage.tsx
  web/src/admin-dsl/render.tsx
```

Backend flow scripts create pages using Go host builders. For example, a flow can call `admin.pageAdmin(...)`, `admin.pageHeader(...)`, `admin.dashboardGrid(...)`, `admin.panel(...)`, and `admin.resourceTable(...)`. These calls are JavaScript calls, but the builder objects are Go values exposed into the Goja runtime.

The backend binds actions through `ctx.bind`. This is a critical part of the system. A flow script does not send a backend callback to the browser. Instead, `ctx.bind` assigns an opaque action ID and stores the callback in the server-side session.

```text
Flow render transaction starts
        |
        v
ctx.bind(actionBuilder, callback)
        |
        v
ScriptRuntime assigns action id: admin_act_...
        |
        v
ActionRef with id/event is embedded in the page
        |
        v
Browser receives only the action metadata and opaque id
```

When the user clicks, the browser posts the action ID back to the backend. The backend verifies the page version, looks up the registered callback, and executes it in the Goja runtime. This security model must survive any compiler architecture.

### Frontend authoring path

The frontend authoring path is mainly for Storybook, examples, and tests.

```text
Storybook/test source
  web/src/admin-dsl/*.stories.tsx
  web/src/admin-dsl/*.test.tsx
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

The TypeScript builder is not the authoritative production runtime, but it is important. It makes visual fixtures easy to write, and it provides a frontend-side mirror of the backend JSON shape. The fact that two builders exist is one reason a compiler architecture is attractive: one language specification could generate both builder surfaces or at least generate drift tests for them.

### Current renderer path

The renderer receives an `AdminPage` and recursively renders nodes. The important file is:

- `web/src/admin-dsl/render.tsx`

The renderer shape is roughly:

```tsx
export function renderAdminNode(node: AdminNode, ctx?: AdminRenderContext, key?: Key): ReactNode {
  const props = node.props || {};

  switch (node.kind) {
    case "pageHeader":
      return ...;
    case "dashboardGrid":
      return ...;
    case "resourceTable":
      return ...;
    case "panel":
      return ...;
    case "form":
      return ...;
  }
}
```

This is explicit and easy to inspect, but it centralizes too much. In a compiler architecture, `render.tsx` should become a smaller runtime that delegates to node renderers or target widgets. Those widgets should receive typed props that have already been normalized by a lowering phase.

## Core Idea: Admin DSL as a Compiled Language

A compiler architecture gives names to responsibilities that are currently spread across builders, validation, renderer prop extraction, and tests.

The proposed compiler has these stages:

1. **Parsing** reads a source language or structured source and produces syntax trees.
2. **Binding** resolves names, imports, action targets, data references, and node definitions.
3. **Type checking** verifies node props, child rules, action contexts, and target constraints.
4. **Lowering** rewrites high-level language constructs into a smaller core representation.
5. **Optimization or normalization** applies defaults, canonical ordering, stable IDs, and target-independent simplifications.
6. **Target lowering** turns the core representation into target-specific forms such as JSON, React props, Go builder calls, TypeScript builder calls, docs, or tests.

The compiler does not have to use a textual syntax at first. The source could be YAML, JSON, TypeScript object literals, or a purpose-built `.admindsl` language. The architecture matters more than the first syntax.

## Language Layers

A real compiler should not treat every representation as the same object. Each layer has a different purpose.

### Layer 1: Concrete syntax tree

The concrete syntax tree represents exactly what the author wrote. It preserves tokens, punctuation, comments, and source spans.

A CST is useful for:

- precise error messages;
- formatting tools;
- editor diagnostics;
- code actions;
- source maps.

The CST should not be the representation used by validators or target backends.

### Layer 2: Surface AST

The surface AST removes punctuation and syntax trivia. It still reflects author-level concepts.

Example surface AST:

```ts
type SurfacePage = {
  kind: "SurfacePage";
  id: string;
  title: string;
  shell: SurfaceShell;
  body: SurfaceNode[];
  sourceSpan: SourceSpan;
};

type SurfaceNode =
  | SurfacePageHeader
  | SurfaceDashboardGrid
  | SurfacePanel
  | SurfaceResourceTable
  | SurfaceForm
  | SurfaceSurface;
```

The surface AST can still contain shorthand. For example, a panel may have a direct `span` property at surface level:

```admindsl
panel "Today’s queue" span { desktop: 8, mobile: 1 } { ... }
```

That shorthand does not need to exist in the lower-level IR.

### Layer 3: Typed AST

The typed AST has resolved node kinds, typed props, typed child relationships, and typed action contexts. This is the first representation where the language is known to be valid.

Example typed nodes:

```ts
type TPageHeader = {
  tag: "PageHeader";
  props: PageHeaderProps;
  actions: PageHeaderAction[];
};

type TResourceTable<Row> = {
  tag: "ResourceTable";
  id: TableId;
  columns: TableColumn<Row>[];
  rows: RowSource<Row>;
  bulkActions: TableBulkAction<Row>[];
  rowActions: TableRowAction<Row>[];
};

type TPanel = {
  tag: "Panel";
  title?: string;
  ariaLabel?: string;
  density: Density;
  layout: LayoutSpec;
  toolbarActions: PanelToolbarAction[];
  footerActions: PanelFooterAction[];
  children: TNode[];
};
```

The typed AST is where action placement becomes contextual. A `TableBulkAction<Row>` can lower to an `ActionRef`, but it is not typed as the same thing as a `PageHeaderAction`.

### Layer 4: Core Admin IR

The Core Admin IR is the compiler’s target-independent representation. It should be smaller and more uniform than the surface language.

A possible Core Admin IR could look like this:

```ts
type CorePage = {
  id: string;
  title: string;
  shell: CoreShell;
  regions: {
    main: CoreNode[];
    modals: CoreSurface[];
    drawers: CoreSurface[];
  };
  actions: CoreActionTable;
};

type CoreNode =
  | CoreContainer
  | CoreResourceTable
  | CoreForm
  | CoreTextBlock
  | CoreMetric
  | CoreCalendar
  | CoreMedia
  | CoreState;

type CoreResourceTable = {
  tag: "ResourceTable";
  id: string;
  layout: CoreLayout;
  columns: CoreTableColumn[];
  rows: CoreRowSet;
  selection: CoreSelectionPolicy;
  actionSlots: {
    bulk: CoreActionRef[];
    row: CoreRowActionRef[];
    overflow: CoreRowActionRef[];
  };
};
```

Core IR does not have to be JSON. It can be an in-memory object graph with typed constructors. JSON can be emitted from it later.

### Layer 5: Target IRs

Each target can define its own lower-level representation.

For React rendering, a target IR might be a tree of component invocations:

```ts
type ReactPlan = {
  component: ComponentId;
  props: Record<string, unknown>;
  children: ReactPlan[];
  key?: string;
};
```

For JSON transport, the target IR might be the current `AdminPage` JSON shape.

For documentation, the target IR might be tables of node specs, prop specs, and action slots.

For tests, the target IR might be generated fixtures and assertions.

This separation is important. It means Admin DSL is not forced to make the intermediate form look like React props or JSON props. Each target chooses its own lowering.

## Strong Node Typing

Strong node typing is the first major improvement over the current `kind + props` model.

### Current loose model

The current frontend node type is:

```ts
export interface AdminNode<P extends AdminJsonObject = AdminJsonObject> {
  kind: AdminNodeKind;
  props?: P;
  children?: AdminNode[];
  meta?: AdminNodeMeta;
}
```

This is flexible but weak. The compiler or renderer must know that `resourceTable` requires `columns`, that `panel` requires `title` or `ariaLabel`, and that `monthCalendar` requires `month`.

### Proposed typed node model

A typed source model could define node variants directly.

```ts
type AdminNodeTyped =
  | PageHeaderNode
  | DashboardGridNode
  | PanelNode
  | ResourceTableNode
  | ComparisonTableNode
  | MonthCalendarNode
  | FormNode
  | FieldNode
  | SurfaceNode;

interface PageHeaderNode {
  tag: "PageHeader";
  title: string;
  description?: string;
  breadcrumbs?: string[];
  actions: PageHeaderAction[];
}

interface PanelNode {
  tag: "Panel";
  title?: string;
  ariaLabel?: string;
  density?: "compact" | "normal" | "spacious";
  padding?: "none" | "normal";
  layout?: LayoutSpec;
  toolbarActions: PanelToolbarAction[];
  footerActions: PanelFooterAction[];
  children: AdminNodeTyped[];
}
```

This model makes invalid props difficult to express. A `PageHeaderNode` does not have `bulkActions`. A `ResourceTableNode` does not have `footerActions` unless the language explicitly allows that slot.

### Node typing rules

A language specification should define, for each node:

- required props;
- optional props;
- default values;
- valid child kinds;
- valid action slots;
- layout participation rules;
- semantic hooks.

Example spec fragment:

```yaml
nodes:
  panel:
    props:
      title: { type: string, required: false }
      ariaLabel: { type: string, required: false }
      density: { type: enum, values: [compact, normal, spacious], default: normal }
      padding: { type: enum, values: [none, normal], default: normal }
      layout: { type: LayoutSpec, required: false }
    constraints:
      - oneOf: [title, ariaLabel]
    children:
      allowed: [any]
    actions:
      toolbar: { type: PanelToolbarAction, prop: toolbarActions }
      footer: { type: PanelFooterAction, prop: footerActions }
```

The compiler can then generate type declarations, validation rules, builder signatures, and documentation from the same specification.

## Contextual Action Typing

Actions are currently generic values with a placement string. A compiler architecture should make action context explicit before lowering.

### Current action shape

Current runtime action shape:

```ts
type AdminActionRef = {
  id?: string;
  event?: string;
  type: "open" | "close" | "navigate" | "mutation" | "confirm" | "refresh" | "upload";
  target: string;
  label?: string;
  payload?: AdminJsonValue;
  intent?: "neutral" | "primary" | "danger";
  priority?: "primary" | "secondary" | "tertiary";
  placement?: "pageHeader" | "panelFooter" | "row" | "bulkToolbar" | ...;
};
```

This shape is appropriate for runtime transport. It is not ideal as the source language type.

### Proposed contextual action types

The typed AST can define contextual action variants.

```ts
type PageHeaderAction = ActionBase & {
  context: "PageHeader";
  allowedKinds: "open" | "navigate" | "mutation" | "refresh";
};

type PanelFooterAction = ActionBase & {
  context: "PanelFooter";
  visualRole: "primary" | "secondary" | "danger" | "link";
};

type TableBulkAction<Row> = ActionBase & {
  context: "TableBulk";
  selection: "visible" | "selected" | "allMatching";
  rowType: RowType<Row>;
};

type TableRowAction<Row> = ActionBase & {
  context: "TableRow";
  rowType: RowType<Row>;
};

type CalendarCellAction = ActionBase & {
  context: "CalendarCell";
  valueType: { date: string };
};
```

The compiler then lowers contextual actions into runtime `ActionRef` values.

```ts
function lowerAction(action: TypedAction): AdminActionRef {
  switch (action.context) {
    case "PageHeader":
      return { ...base(action), placement: "pageHeader" };
    case "PanelFooter":
      return { ...base(action), placement: "panelFooter" };
    case "TableBulk":
      return { ...base(action), placement: "bulkToolbar", options: { selection: action.selection } };
    case "TableRow":
      return { ...base(action), placement: "row" };
    case "CalendarCell":
      return { ...base(action), placement: "calendarCell" };
  }
}
```

This preserves the current runtime representation while making the source language more precise.

### Why contextual action typing matters

Contextual action typing allows the compiler to reject invalid combinations before rendering:

- A `TableBulkAction` cannot be placed in a `pageHeader`.
- A `CalendarCellAction` must receive a date payload.
- A `PanelFooterAction` can be required to have a visual role.
- A `TableRowAction<Row>` can be checked against the row type.
- A `FormSubmitAction<FormValues>` can be checked against form field names and value types.

The runtime can still receive generic `ActionRef`. The source language and typed AST are where the restrictions live.

## Proposed Grammar Direction

The grammar should describe author intent and valid composition. It should not attempt to be JavaScript. Backend flows can continue using JavaScript for host module calls, state changes, and callback implementations. The grammar can be used first for language specification, fixture pages, generated examples, and static analysis.

### Source grammar sketch

This grammar is a research sketch. It is not final syntax.

```ebnf
Program          ::= ImportDecl* PageDecl* ;

PageDecl         ::= "page" PageId StringLiteral ShellDecl PageBody ;
ShellDecl        ::= "shell" ShellKind PropBlock? ;
PageBody         ::= "{" PageItem* "}" ;
PageItem         ::= HeaderDecl | GridDecl | PanelDecl | SurfaceDecl | NodeDecl ;

HeaderDecl       ::= "header" StringLiteral HeaderBlock? ;
HeaderBlock      ::= "{" HeaderItem* "}" ;
HeaderItem       ::= "description" StringLiteral
                   | "breadcrumbs" StringArray
                   | "action" PageHeaderActionDecl ;

GridDecl         ::= "grid" GridOptions? "{" GridChild* "}" ;
GridChild        ::= PanelDecl | MetricDecl | NodeDecl ;

PanelDecl        ::= "panel" StringLiteral PanelOptions? "{" PanelItem* "}" ;
PanelItem        ::= NodeDecl | "footerAction" PanelFooterActionDecl | "toolbarAction" PanelToolbarActionDecl ;

TableDecl        ::= "table" Identifier TableOptions? "{" TableItem* "}" ;
TableItem        ::= ColumnDecl | RowSourceDecl | BulkActionDecl | RowActionDecl ;
ColumnDecl       ::= "column" ColumnKind Identifier StringLiteral ColumnOptions? ;
RowSourceDecl    ::= "rows" Identifier ;
BulkActionDecl   ::= "bulkAction" ActionProfile ActionTarget StringLiteral BulkActionOptions? ;
RowActionDecl    ::= "rowAction" ActionProfile ActionTarget StringLiteral RowActionOptions? ;

FormDecl         ::= "form" Identifier FormOptions? "{" FormItem* "}" ;
FormItem         ::= FieldDecl | "submit" FormSubmitActionDecl | "cancel" FormCancelActionDecl ;
FieldDecl        ::= "field" FieldKind Identifier StringLiteral FieldOptions? ;

SurfaceDecl      ::= ("modal" | "drawer" | "sheet") Identifier SurfaceOptions? "{" NodeDecl* "}" ;

NodeDecl         ::= TableDecl | FormDecl | MetricDecl | MarkdownDecl | CalendarDecl | StateDecl ;
```

The syntax should be designed after the typed model is clear. A YAML or TypeScript-object source format may be better for the first prototype. The compiler architecture should not depend on the final syntax.

## Core Admin IR Design

The Core Admin IR should represent the semantic UI program after type checking and before target lowering.

### Design goals

Core Admin IR should:

- preserve semantic node intent;
- remove surface syntax shorthand;
- encode contextual action slots explicitly;
- preserve source spans for diagnostics where useful;
- support multiple target backends;
- avoid React-specific or JSON-specific assumptions;
- make target transformations predictable.

### Possible Core IR shape

```ts
type CoreProgram = {
  pages: CorePage[];
  symbols: SymbolTable;
  diagnostics: Diagnostic[];
};

type CorePage = {
  id: PageId;
  title: string;
  shell: CoreShell;
  regions: CoreRegions;
  actionTable: CoreActionTable;
  source?: SourceSpan;
};

type CoreRegions = {
  main: CoreNode[];
  modals: CoreSurface[];
  drawers: CoreSurface[];
};

type CoreNode =
  | CorePageHeader
  | CoreGrid
  | CorePanel
  | CoreResourceTable
  | CoreForm
  | CoreCalendar
  | CoreDisplay
  | CoreStateNode;

interface CorePanel {
  tag: "Panel";
  id?: string;
  title?: string;
  ariaLabel?: string;
  density: "compact" | "normal" | "spacious";
  padding: "none" | "normal";
  layout: CoreLayout;
  actions: {
    toolbar: CoreActionRef[];
    footer: CoreActionRef[];
  };
  children: CoreNode[];
}

interface CoreResourceTable {
  tag: "ResourceTable";
  id: string;
  columns: CoreTableColumn[];
  rows: CoreRowSet;
  selection: CoreSelectionPolicy;
  actions: {
    bulk: CoreTableBulkAction[];
    row: CoreTableRowAction[];
    overflow: CoreTableRowAction[];
  };
  state: CoreResourceState;
}
```

### Core action representation

Core actions should preserve their context until target lowering.

```ts
type CoreActionRef = {
  id?: RuntimeActionId;
  target: ActionTarget;
  label: string;
  runtimeType: "open" | "close" | "navigate" | "mutation" | "confirm" | "refresh" | "upload";
  intent: "neutral" | "primary" | "danger";
  priority: "primary" | "secondary" | "tertiary";
  context: ActionContext;
  payloadType?: TypeRef;
  payload?: CoreValue;
  disabled?: CoreExpr<boolean>;
  loading?: CoreExpr<boolean>;
  source?: SourceSpan;
};

type ActionContext =
  | { tag: "PageHeader" }
  | { tag: "PanelToolbar"; panelId?: string }
  | { tag: "PanelFooter"; panelId?: string }
  | { tag: "TableBulk"; tableId: string; selection: "visible" | "selected" | "allMatching" }
  | { tag: "TableRow"; tableId: string; rowType: TypeRef }
  | { tag: "CalendarCell"; calendarId: string }
  | { tag: "FormSubmit"; formId: string; valuesType: TypeRef };
```

This model makes action validity explicit. The JSON target can still lower these contexts to the existing `placement` strings.

## Target Lowering

A compiler backend should receive Core Admin IR and produce a target-specific output. The target does not need to know surface syntax.

### Target 1: Existing JSON transport

The JSON target lowers Core IR into the current `AdminPage` shape.

```pseudo
function lowerPageToJson(page: CorePage): AdminPageJson
  return {
    schemaVersion: 2,
    id: page.id,
    title: page.title,
    shell: lowerShell(page.shell),
    nodes: page.regions.main.map(lowerNodeToJson),
    modals: page.regions.modals.map(lowerSurfaceToJson),
    drawers: page.regions.drawers.map(lowerSurfaceToJson)
  }
```

Action lowering maps contextual action slots into runtime placement strings.

```pseudo
function lowerActionToJson(action: CoreActionRef): AdminActionRef
  ref = {
    type: action.runtimeType,
    target: action.target,
    label: action.label,
    intent: action.intent,
    priority: action.priority,
    payload: lowerValue(action.payload)
  }
  ref.placement = placementForContext(action.context)
  return ref
```

This target preserves compatibility with current server transport and frontend renderer.

### Target 2: React component props

A React target should not receive arbitrary `props` and dispatch on node kind. It should receive component plans or direct typed props.

```ts
type ReactPlan = {
  component: "AdminPageHeader" | "DashboardGrid" | "Panel" | "ResourceTable" | "Form";
  key: string;
  props: Record<string, unknown>;
  children: ReactPlan[];
};
```

Lowering example:

```pseudo
function lowerResourceTableToReact(node: CoreResourceTable): ReactPlan
  return ReactPlan(
    component = "ResourceTable",
    key = node.id,
    props = {
      id: node.id,
      columns: node.columns.map(lowerColumnToReact),
      rows: lowerRows(node.rows),
      selection: node.selection,
      bulkActions: node.actions.bulk.map(lowerActionToReact),
      rowActions: node.actions.row.map(lowerActionToReact),
      state: node.state
    },
    children = []
  )
```

The React component then owns layout and typography:

```tsx
function ResourceTableWidget(props: ResourceTableWidgetProps) {
  return <table>...</table>;
}
```

This is how the architecture avoids a single giant renderer file. The compiler lowers semantics into typed widget props, and the widget owns its rendering.

### Target 3: TypeScript builder source

The compiler can generate builder calls for compatibility with current Storybook patterns.

```pseudo
function lowerPanelToTsBuilder(panel: CorePanel): TsExpr
  return call("admin.panel", [
    string(panel.title),
    object({ density: panel.density, padding: panel.padding, layout: lowerLayout(panel.layout) }),
    ...panel.children.map(lowerNodeToTsBuilder)
  ]).chain("toJSON") if needed
```

This target is useful for generated examples, tests, and migration tooling. It should not be the only target.

### Target 4: Go builder source

The compiler can generate Go builder calls for backend fixtures or migration.

```go
PageAdmin("admin-intake", "Intake Admin").
    Content(
        PageHeader(JSONObject{"title": "Intake Admin"}),
        DashboardGrid(JSONObject{"columns": JSONObject{"desktop": 12}},
            Panel("Recent requests", JSONObject{"padding": "none"},
                ResourceTable("requests", JSONObject{"columns": columns, "rows": rows}),
            ),
        ),
    )
```

This target requires care because real backend flows often compute rows dynamically and bind callbacks. It is better suited for generated static examples than for replacing current Goja flows.

### Target 5: Documentation and test output

Documentation and tests are low-risk targets. They can be generated early.

Generated documentation can include:

- node grammar reference;
- prop tables;
- action context tables;
- lowering examples;
- target support matrix.

Generated tests can include:

- every node kind has a type definition;
- every node kind has a JSON lowering;
- every node kind has a React target mapping or an explicit unsupported marker;
- every action context lowers to a runtime placement;
- invalid action contexts produce type errors.

## Replacing the Huge Renderer Switch

The goal is not to remove all central dispatch. Some dispatch is normal in interpreters and compilers. The goal is to move rendering details into target widgets and make dispatch a small routing layer.

### Current shape

```tsx
switch (node.kind) {
  case "resourceTable":
    // prop extraction
    // table layout
    // bulk bar
    // row loop
    // cell rendering
    // action buttons
    // pagination
}
```

### Proposed shape

```tsx
function renderReactPlan(plan: ReactPlan, ctx: RenderContext): ReactNode {
  const Component = registry[plan.component];
  return (
    <Component {...plan.props} context={ctx}>
      {plan.children.map((child) => renderReactPlan(child, ctx))}
    </Component>
  );
}
```

The registry is controlled and generated from the target definition:

```ts
const registry = {
  AdminPageHeader: AdminPageHeaderWidget,
  DashboardGrid: DashboardGridWidget,
  Panel: PanelWidget,
  ResourceTable: ResourceTableWidget,
  Form: FormWidget,
};
```

The compiler ensures that `ResourceTableWidget` receives `ResourceTableWidgetProps`, not arbitrary node props. This is the main structural improvement.

### Widget prop contracts

Each widget should have a typed prop contract.

```ts
interface ResourceTableWidgetProps<Row = Record<string, unknown>> {
  id: string;
  columns: TableColumn<Row>[];
  rows: Row[];
  selection: SelectionPolicy;
  bulkActions: RenderAction<TableBulkPayload<Row>>[];
  rowActions: RenderAction<Row>[];
  state: ResourceState;
}
```

The compiler backend maps Core IR into these props. The widget does not need to know the source grammar. It only knows its props.

## Compiler Pseudocode

This section shows the core algorithms in simplified form.

### Parse and compile entry point

```pseudo
function compileAdminDsl(source, options): CompileResult
  tokens = lex(source)
  cst = parse(tokens)
  surfaceAst = buildSurfaceAst(cst)
  boundAst = bindNames(surfaceAst, options.environment)
  typedAst = typeCheck(boundAst, options.languageSpec)
  coreIr = lowerToCore(typedAst)
  normalizedIr = normalizeCore(coreIr)
  outputs = {}
  for target in options.targets:
    outputs[target.name] = target.emit(normalizedIr)
  return { ast: typedAst, ir: normalizedIr, outputs, diagnostics }
```

### Type check node props

```pseudo
function typeCheckNode(node, expectedContext): TypedNode
  nodeSpec = languageSpec.node(node.kind)
  if nodeSpec is missing:
    error("unknown node kind", node.span)

  typedProps = {}
  for propSpec in nodeSpec.props:
    value = node.props[propSpec.name]
    if value missing and propSpec.required:
      error("missing required prop", node.span)
    if value present:
      typedProps[propSpec.name] = typeCheckValue(value, propSpec.type)

  for prop in node.props:
    if prop.name not in nodeSpec.props:
      error("unknown prop for node", prop.span)

  typedChildren = typeCheckChildren(node.children, nodeSpec.children)
  typedActions = typeCheckActionSlots(node.actions, nodeSpec.actionSlots)

  runNodeConstraints(nodeSpec.constraints, typedProps, typedChildren, typedActions)

  return TypedNode(nodeSpec.tag, typedProps, typedChildren, typedActions)
```

### Type check action context

```pseudo
function typeCheckAction(action, actionSlot): TypedAction
  if action.profile not allowed in actionSlot.allowedProfiles:
    error("action profile not allowed in this slot", action.span)

  if actionSlot.payloadType exists:
    payload = typeCheckPayload(action.payload, actionSlot.payloadType)
  else:
    payload = typeCheckJson(action.payload)

  return TypedAction(
    target = action.target,
    label = action.label,
    runtimeType = resolveRuntimeType(action.profile),
    context = actionSlot.context,
    payload = payload,
    intent = resolveIntent(action.profile),
    priority = resolvePriority(action.profile)
  )
```

### Lower typed table to Core IR

```pseudo
function lowerResourceTable(node: TResourceTable): CoreResourceTable
  return {
    tag: "ResourceTable",
    id: node.id,
    columns: node.columns.map(lowerColumn),
    rows: lowerRowSource(node.rows),
    selection: lowerSelection(node.selection),
    actions: {
      bulk: node.bulkActions.map(lowerAction),
      row: node.rowActions.map(lowerAction),
      overflow: node.overflowActions.map(lowerAction)
    },
    state: lowerResourceState(node.state)
  }
```

### Lower Core IR to current JSON transport

```pseudo
function lowerCoreNodeToJson(node): AdminNodeJson
  switch node.tag:
    case "ResourceTable":
      return {
        kind: "resourceTable",
        props: {
          id: node.id,
          columns: node.columns.map(lowerColumnToJson),
          rows: lowerRowsToJson(node.rows),
          selectable: node.selection.enabled,
          bulkActions: node.actions.bulk.map(lowerActionToJson),
          actions: node.actions.row.map(lowerActionToJson)
        }
      }
```

## How This Relates to Existing Files

The compiler architecture should be studied against the current implementation. This table identifies the current file and the possible compiler role.

| Current file | Current role | Possible compiler-era role |
| --- | --- | --- |
| `pkg/admindsl/types.go` | Go transport AST and vocabulary constants. | Generated or checked against language spec. |
| `pkg/admindsl/builder.go` | Backend builder API. | Generated compatibility target or hand-written facade over generated constructors. |
| `pkg/admindsl/validate.go` | Runtime validation. | Mix of generated validation tables and hand-written semantic hooks. |
| `pkg/admindsl/goja_module.go` | Goja export table. | Generated from exported builder/action definitions. |
| `pkg/admindsl/script_runtime.go` | Goja session runtime and callback dispatch. | Mostly hand-written; compiler must preserve `ctx.bind` semantics. |
| `pkg/admindsl/proto_convert.go` | Converts Go AST to protobuf transport. | Hand-written or generated if transport AST changes. |
| `proto/fringe/admin_dsl/v1/admin_dsl.proto` | Transport envelope. | Probably remains stable; may receive generated documentation. |
| `web/src/admin-dsl/schema.ts` | TypeScript JSON AST. | Generated or checked against spec. |
| `web/src/admin-dsl/builder.ts` | Frontend fixture builder API. | Generated compatibility target. |
| `web/src/admin-dsl/render.tsx` | Large explicit interpreter. | Reduced to target runtime plus widget registry; widgets hand-written. |
| `web/src/admin-dsl/actions.ts` | Generic action helpers. | Runtime action utilities remain; contextual action typing happens earlier. |
| `web/src/admin-dsl/BackendAdminDslPage.tsx` | Browser bridge from renderer event to backend event. | Mostly hand-written; consumes compiled render action output. |
| `web/src/admin-dsl/backendClient.ts` | Protobuf JSON client. | Mostly unchanged if transport stays stable. |
| `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` | v2 examples and visual catalog. | Source examples for compiler fixtures or generated builder output comparisons. |

## Research Implementation Plan

This plan is designed to produce evidence without replacing production code.

### Phase 1: Inventory and formalize the current language

Read the current files and build a machine-readable inventory.

Deliverables:

- `admin-dsl-language-inventory.md`
- `node-kinds.json`
- `action-contexts.json`
- drift notes between Go and TypeScript definitions

Questions to answer:

- Which node kinds exist in both Go and TypeScript?
- Which action placements are used by which node contexts?
- Which renderer branches consume which props?
- Which validation rules are declarative and which require semantic hooks?

### Phase 2: Define a minimal typed language model

Choose a small subset:

- `pageHeader`
- `dashboardGrid`
- `panel`
- `resourceTable`
- `form`
- `fieldGroup`
- `textField`
- `drawer`
- `modal`

Define typed nodes and contextual actions for this subset.

Deliverables:

- `typed-language-model.ts` or `typed-language-model.go`
- examples of valid and invalid ASTs
- diagnostics for invalid action contexts

### Phase 3: Define Core Admin IR

Create a target-independent IR and a lowering pass from typed AST to Core IR.

Deliverables:

- `core-ir.ts` or `core-ir.go`
- lowering pseudocode implemented for the subset
- tests showing equivalent Core IR for different surface syntaxes

### Phase 4: Compile Core IR to current JSON transport

Write a JSON backend that emits current `AdminPage` JSON.

Deliverables:

- JSON backend prototype
- generated JSON for Request Triage subset
- comparison with current Storybook JSON

Questions:

- Can current `AdminPageRenderer` render the generated JSON?
- What information is lost during JSON lowering?
- Which contextual action information should be preserved in `options` or metadata?

### Phase 5: Compile Core IR to React component props

Create a small React target that bypasses the huge `render.tsx` switch for the subset.

Deliverables:

- `ReactPlan` definition
- `ResourceTableWidgetProps`
- `PanelWidgetProps`
- lowering from Core IR to ReactPlan
- test renderer for the subset

Questions:

- Does typed prop lowering simplify widget implementation?
- Does the target still support backend action dispatch?
- Can the target coexist with current `AdminPageRenderer`?

### Phase 6: Generate docs and drift tests

Generate documentation and tests from the typed language model.

Deliverables:

- node reference markdown
- action context reference markdown
- drift tests comparing current source to spec

This phase can be valuable even if the compiler never becomes production.

### Phase 7: Evaluate production adoption paths

Write a research conclusion.

Possible conclusions:

- Use the spec only for docs and drift tests.
- Generate TypeScript and Go builder APIs.
- Generate validation tables but keep renderers hand-written.
- Build a new React target using typed component props.
- Do not adopt the compiler because complexity outweighs drift reduction.

## Design Decisions for the Research Prototype

### Decision 1: Keep runtime actions generic, but source actions contextual

The backend event system already works. The compiler should not replace it. The source language should type actions by context, then lower them to generic runtime `ActionRef` values with placement and opaque IDs.

### Decision 2: Keep JSON transport as a target, not the semantic center

The current JSON shape is useful and should remain a target. It should not force the compiler’s internal representation to be loose or target-specific.

### Decision 3: Do not generate full JSX in the first prototype

Rendering contains visual design. The first prototype should generate React plans or typed props and then delegate to hand-written widgets. This keeps visual decisions visible.

### Decision 4: Start with docs and drift tests before production generation

Generated documentation and drift tests provide value without changing runtime behavior. They are the safest first output.

### Decision 5: Preserve Goja and host module boundaries

Backend flow scripts currently call host modules and bind callbacks. A compiler can generate or analyze page structure, but callback implementation remains server-side.

## Alternatives Considered

### Alternative 1: Continue with hand-written builders and renderer switch

This is the simplest path. It avoids compiler complexity and keeps the runtime easy to debug. It is acceptable if Admin DSL remains small.

The drawback is that node props, action placements, validation, and renderer behavior remain distributed across files. Drift must be managed manually.

### Alternative 2: Generate only schema/types from a spec

This reduces type drift without changing runtime architecture. It is low risk.

The drawback is that it does not address renderer complexity or contextual action typing unless the generated types are used throughout the system.

### Alternative 3: Use JSON Schema as the specification

JSON Schema can validate the transport shape and generate some TypeScript types.

The drawback is that JSON Schema does not naturally express compiler phases, contextual action capabilities, lowering rules, renderer targets, or Goja builder generation.

### Alternative 4: Use protobuf as the full AST

A fully typed protobuf AST would provide strong generated types across Go and TypeScript.

The drawback is that Admin DSL props would become less flexible, and every UI evolution would require proto schema changes. The current stable envelope plus dynamic node props is more adaptable.

### Alternative 5: Build a complete page authoring language first

This is attractive for language research, but it delays practical evidence. The current system’s biggest pain is not syntax. It is distributed semantics and weak contextual typing.

A language-definition spec and typed Core IR should come first.

## Risks

### Compiler complexity can exceed DSL complexity

A compiler is only justified if it reduces drift, improves correctness, or enables new targets. If the compiler becomes harder to maintain than the current hand-written files, it should not be adopted.

### The typed model can become too rigid

Admin DSL evolved quickly because JSON props were flexible. A strict type system must include controlled escape hatches for experimental props and target-specific metadata.

### Renderer delegation can fragment visual consistency

Moving rendering into many widgets can improve modularity, but it can also fragment typography and spacing if shared design tokens and layout primitives are not enforced.

### Source and generated code can drift

If generated files are checked in, developers may edit them manually. The project needs clear generated-file headers, tests, and regeneration commands.

### Action context typing can conflict with dynamic flows

Backend flows sometimes compute actions conditionally. The type system must support conditional action construction without losing context safety.

## Open Research Questions

- What source format should the prototype use: textual grammar, YAML, JSON, or TypeScript object definitions?
- What is the minimum Core IR that can represent current v2 workbench pages?
- Should contextual action information survive into JSON metadata, or disappear after lowering to placement strings?
- Can form values be typed strongly enough to validate submit actions?
- Can table row types be expressed without making the DSL depend on application-specific schemas?
- Should generated React targets produce component plans, direct JSX, or typed props passed to hand-written widgets?
- Which current renderer branches become standalone widgets first?
- How should source spans be preserved through JSON and React target lowering for diagnostics?
- Can a compiler coexist with Goja flow scripts, or would it require a new backend authoring model?
- What metrics determine success: fewer lines, fewer drift bugs, better tests, clearer docs, or new target support?

## Suggested First Experiment

The first experiment should not attempt a full compiler. It should implement the smallest version that proves or disproves the architecture.

Scope:

- Define typed AST types for `pageHeader`, `dashboardGrid`, `panel`, and `resourceTable`.
- Define contextual actions for `PageHeaderAction`, `PanelFooterAction`, `TableBulkAction`, and `TableRowAction`.
- Lower typed AST to Core IR.
- Lower Core IR to current `AdminPage` JSON.
- Render that JSON with the existing renderer.
- Generate one documentation table from the typed node definitions.

Success criteria:

- Invalid action contexts are rejected before JSON generation.
- Generated JSON renders in current Storybook.
- The Core IR is not React-specific.
- The implementation is small enough to review.
- The generated documentation is accurate enough to be useful.

Pseudocode for the first experiment:

```pseudo
source = typedPage({
  id: "request-triage-experiment",
  title: "Request Triage",
  body: [
    pageHeader({ title: "Request Triage" }),
    grid({ columns: { desktop: 12 } }, [
      panel({ title: "Today’s queue" }, [
        table({
          id: "requests",
          columns: [...],
          rows: requestRows,
          bulkActions: [tableBulkAction("requests.assign", "Assign")],
          rowActions: [tableRowAction("request.review", "Review")]
        })
      ])
    ])
  ]
})

typed = typeCheck(source)
core = lowerToCore(typed)
json = lowerToAdminPageJson(core)
assertCurrentRendererCanRender(json)
```

## Appendix A: Current File API References

### Backend builders

File:

- `pkg/admindsl/builder.go`

Representative API:

```go
PageAdmin(id, title string) *PageBuilder
PageBuilder.Content(nodes ...*NodeBuilder) *PageBuilder
PageBuilder.Modals(nodes ...*NodeBuilder) *PageBuilder
PageBuilder.Drawers(nodes ...*NodeBuilder) *PageBuilder
PageBuilder.MustBuild() Page

PageHeader(props JSONObject) *NodeBuilder
DashboardGrid(props JSONObject, children ...*NodeBuilder) *NodeBuilder
Panel(title string, props JSONObject, children ...*NodeBuilder) *NodeBuilder
ResourceTable(id string, props JSONObject) *NodeBuilder
Form(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder

Primary(target, label string) *ActionBuilder
Secondary(target, label string) *ActionBuilder
Danger(target, label string) *ActionBuilder
ActionBuilder.Placement(placement ActionPlacement) *ActionBuilder
```

### Frontend builders

File:

- `web/src/admin-dsl/builder.ts`

Representative API:

```ts
admin.page(id, title)
admin.pageHeader(props)
admin.dashboardGrid(props, ...children)
admin.panel(title, props, ...children)
resource.table(id, columns, rows, props)
field.text(name, props)
action.primary(target, label, payload)
action.secondary(target, label, payload)
```

### Runtime page transport

Files:

- `pkg/admindsl/types.go`
- `web/src/admin-dsl/schema.ts`
- `proto/fringe/admin_dsl/v1/admin_dsl.proto`

Transport concepts:

```text
AdminPage
  schemaVersion
  id
  title
  shell
  nodes
  modals
  drawers

AdminNode
  kind
  props
  children
  meta

AdminActionRef
  id
  event
  type
  target
  label
  placement
  intent
  priority
```

### Frontend render bridge

Files:

- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/actions.ts`
- `web/src/admin-dsl/BackendAdminDslPage.tsx`

Representative flow:

```text
AdminPageRenderer renders node
        |
        v
button calls dispatchAdminAction(ctx, node, action, value)
        |
        v
BackendAdminDslPage converts AdminRenderEvent to AdminInteractionEvent
        |
        v
postAdminDslEvent sends protobuf JSON to backend
```

## Appendix B: Compiler Artifact Matrix

| Artifact | Generated? | Notes |
| --- | --- | --- |
| Node vocabulary | Good candidate | Generate constants/unions and drift tests. |
| Action context vocabulary | Good candidate | Generate typed contexts and runtime placement lowering. |
| Go builders | Candidate | Generate simple constructors or compatibility facade. |
| TypeScript builders | Candidate | Generate fixture builders from node spec. |
| Runtime JSON transport | Target | Keep stable as one backend target. |
| Go validation tables | Strong candidate | Generate simple checks; use hooks for semantic rules. |
| React widgets | Hand-written | Generate typed prop contracts and registry, not full visual code. |
| Renderer registry | Strong candidate | Ensures every node kind has an explicit widget. |
| Documentation | Strong candidate | Low risk and immediately useful. |
| Drift tests | Strong candidate | Low risk and useful even without production generation. |
| Goja runtime | Hand-written | Security and callback semantics should remain explicit. |
| Server handlers | Hand-written | Transport/session lifecycle should remain explicit. |

## Appendix C: Research Deliverable Checklist

A complete research handoff should include:

- a language inventory;
- a typed node model;
- a contextual action model;
- a Core Admin IR definition;
- one lowering to current JSON;
- one lowering to React props or ReactPlan;
- generated docs for the subset;
- drift tests for the subset;
- a comparison against current builder/render code;
- a recommendation on whether to continue, narrow, or stop the compiler effort.
