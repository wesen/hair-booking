---
Title: UI DSL Meta-Spec Compiler Implementation Guide
Ticket: HAIR-041
Status: active
Topics:
    - backend
    - frontend
    - admin-dsl
    - goja
    - dsl
    - compiler
    - ui-dsl
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/admindsl/builder.go
      Note: Current Go builder API that a UI DSL meta-spec target could generate or validate against
    - Path: pkg/admindsl/goja_module.go
      Note: Current Goja export surface that a Go target could generate from a UI DSL specification
    - Path: pkg/admindsl/proto_convert.go
      Note: Current Go-to-protobuf conversion path relevant to generated transport targets
    - Path: pkg/admindsl/script_runtime.go
      Note: Backend action binding/runtime boundary that generated UI DSL actions must preserve
    - Path: pkg/admindsl/types.go
      Note: Current Go Admin DSL page/node/action types used as case-study target artifacts for the meta-spec compiler
    - Path: pkg/admindsl/validate.go
      Note: Current hand-written validation layer that motivates generated node/action-slot validators
    - Path: pkg/server/handlers_admin_dsl.go
      Note: Current server start/event handlers showing how generated action metadata reaches backend execution
    - Path: proto/fringe/admin_dsl/v1/admin_dsl.proto
      Note: Current protobuf transport envelope used as reference for generated protobuf targets
    - Path: web/src/admin-dsl/AdminDslWorkbench.stories.tsx
      Note: Current information-dense Admin Workbench examples that can become generated UI DSL fixtures
    - Path: web/src/admin-dsl/BackendAdminDslPage.tsx
      Note: Current frontend/backend action bridge referenced by the meta-spec action runtime model
    - Path: web/src/admin-dsl/actions.ts
      Note: Current frontend action dispatch helpers that generated contextual action types would lower into
    - Path: web/src/admin-dsl/backendClient.ts
      Note: Current client transport used by backend-driven Admin DSL pages
    - Path: web/src/admin-dsl/builder.ts
      Note: Current frontend builder API that a TypeScript target could generate
    - Path: web/src/admin-dsl/render.tsx
      Note: Current renderer implementation motivating generated renderer contracts and explicit registries
    - Path: web/src/admin-dsl/schema.ts
      Note: Current TypeScript page/node/action schema that could be generated from a UI DSL spec
ExternalSources: []
Summary: 'Implementation guide for a meta-level UI DSL specification compiler: define shell types, node types, prop schemas, child rules, action types, action slots, action contexts, and target generators that emit Go, TypeScript, protobuf, docs, tests, and renderer contracts.'
LastUpdated: 2026-05-17T15:55:00-04:00
WhatFor: 'Use when designing the language-workbench layer above Admin DSL: a reusable compiler for defining UI DSL vocabularies and generating implementation artifacts for backend and frontend targets.'
WhenToUse: Use before implementing a UI DSL meta-spec compiler, generating Admin DSL-like systems, or explaining how backend-owned actions can be declared in a UI DSL while remaining invisible to UI authors.
---


# UI DSL Meta-Spec Compiler Implementation Guide

## Executive Summary

This document explains the system we actually want to build: a **meta-level compiler for defining UI DSLs**. The goal is not just to compile one Admin DSL page into React. The goal is to define a higher-level specification language that describes the vocabulary and rules of a UI DSL: shell types, node types, prop schemas, child composition rules, surfaces, action types, action slots, context payloads, validation constraints, and target generators. From one specification, the compiler can emit Go code, TypeScript code, protobuf definitions, documentation, tests, builder APIs, validator scaffolding, Goja exports, and renderer prop contracts.

Admin DSL is the first case study. It focuses on information-dense admin/workbench layouts: resource tables, panels, page headers, comparison tables, calendars, drawers, modals, filters, row actions, bulk actions, and backend mutations. The same meta-spec approach can also define a simpler customer-facing UI DSL: hero sections, step forms, option cards, upload widgets, confirmation screens, and lightweight navigation. The difference is not the compiler architecture; the difference is the vocabulary declared by each UI DSL specification.

Actions are central to this design. A UI DSL author should be able to say that a table row has a `ReviewRequest` action, a form has a `SubmitDraft` action, or a calendar cell has a `PublishAvailability` action. The author should not have to think about how the frontend event maps to a backend callback. The meta-spec declares where an action is legal and what context payload it receives. The generated runtime turns that into frontend-renderable action metadata plus backend-owned opaque action IDs. The frontend renders and dispatches; the backend executes trusted logic. The language makes the split invisible while preserving the security boundary.

## Problem Statement

The current Admin DSL v2 implementation solved the immediate problem: real backend-driven admin pages can be described by Goja flow scripts, validated on the backend, transported to the frontend, rendered by React, and wired to backend callbacks. That architecture is useful, but it is still mostly hand-written. The same language concepts are repeated across Go types, Go builders, Goja exports, validation code, TypeScript schema types, TypeScript builders, renderer branches, Storybook stories, tests, and documentation.

The repetition creates drift pressure. If we add a node kind, we must remember to update multiple files. If we add an action placement, we must update validation, render logic, docs, examples, and tests. If we decide that a table bulk action is only valid when a table is selectable, that rule may live in validation code, in story conventions, or in renderer assumptions instead of in one declarative language definition.

The deeper issue is that the codebase needs a reusable way to define **UI languages**, not just pages in one UI language. Admin DSL is one UI DSL. A customer intake DSL is another. Future systems could need UI DSLs for ecommerce operations, CRM workflows, supply chain scheduling, inventory review, approval queues, task boards, or fulfillment consoles. Each UI DSL has different allowed nodes and actions, but the mechanics are similar:

- The UI DSL describes semantic UI structure.
- A renderer turns that structure into visible UI.
- Some actions are frontend-local, such as navigation or opening a drawer.
- Some actions are backend-owned, such as approving a request or publishing a draft.
- The language should declare which actions are legal in which node contexts.
- Generated code should keep backend, frontend, transport, docs, and tests aligned.

The problem is therefore not merely “how do we compile Admin DSL?” The problem is:

> How do we define UI DSLs declaratively so that one meta-spec can generate the backend, frontend, transport, renderer contracts, validation rules, and documentation for many different UI languages?

## Proposed Solution

Build a **UI DSL meta-spec compiler**. The compiler reads a specification that defines a UI DSL vocabulary and emits implementation artifacts for multiple targets.

The input is not a concrete Admin DSL page. The input is a language specification. For example, it can declare that `AdminWorkbench` has a `WorkbenchShell`, a `ResourceTable` node, a `Panel` node, a `BackendMutation` action type, a `TableRowMutation` action type, and rules saying that `TableRowMutation` is valid only in a table row action slot.

The compiler pipeline is:

```text
UI DSL meta-spec source
        |
        v
Meta-spec parser or structured loader
        |
        v
Meta-spec AST
        |
        v
Meta-spec semantic validation
        |
        v
Normalized UI language specification IR
        |
        +--> Go target
        |     structs, builders, validators, Goja exports
        |
        +--> TypeScript target
        |     discriminated unions, builders, renderer contracts
        |
        +--> Protobuf target
        |     node/action enums, transport messages, payload messages
        |
        +--> Renderer target
        |     widget prop contracts, registry scaffolding, adapter stubs
        |
        +--> Docs target
        |     node reference, action matrix, examples
        |
        +--> Test target
              golden files, drift tests, invalid-spec tests
```

The most important output is not any one generated file. The important output is **alignment**. The same source of truth defines what a node is, what props it accepts, what children it allows, what action slots it exposes, and what action types are legal in those slots.

## Mental Model: Three Languages, Not One

The intern should keep three separate language layers in mind.

### 1. The meta-spec language

The meta-spec language defines UI DSLs. It talks about shells, nodes, props, actions, slots, contexts, and targets.

Example:

```dsl
uiLanguage AdminWorkbench version 2 {
  node ResourceTable {
    props {
      id string required
      columns TableColumn[] required
      rows object[] required
      selectable boolean default false
    }

    actionSlot rowActions {
      context row
      allows Navigate, OpenSurface, TableRowMutation
    }

    actionSlot bulkToolbar {
      context selectedRows
      allows TableBulkMutation
      requires selectable == true
    }

    children none
  }
}
```

This does not describe one table on one page. It defines the `ResourceTable` node type that page authors can use later.

### 2. The generated UI DSL

The generated UI DSL is what an application author uses to describe concrete UI screens or flows.

Example:

```dsl
page IntakeRequests shell WorkbenchShell {
  title "Fringe Intake Admin"

  ResourceTable requests {
    columns [
      { key: "client", label: "Client", type: "text" },
      { key: "status", label: "Status", type: "status" },
      { key: "submittedAt", label: "Submitted", type: "datetime" }
    ]

    rows from "intake.pendingRequests"
    selectable true

    rowActions [
      TableRowMutation {
        label "Review"
        target "intake.openRequest"
        rowId row.id
      }
    ]

    bulkToolbar [
      TableBulkMutation {
        label "Assign"
        target "intake.assignRequests"
        selectedRowIds selection.ids
      }
    ]
  }
}
```

This second language is generated from or checked against the first language.

### 3. The target implementation languages

The target implementation languages are Go, TypeScript, protobuf, documentation, tests, and renderer contracts. These are not authored manually as the source of truth. They are emitted from the meta-spec or checked against it.

Example generated TypeScript shape:

```ts
export type AdminWorkbenchNode =
  | PageHeaderNode
  | PanelNode
  | ResourceTableNode
  | FormNode
  | DrawerNode
  | ModalNode;

export interface ResourceTableNode {
  kind: "resourceTable";
  props: ResourceTableProps;
  actionSlots: {
    rowActions?: Array<NavigateAction | OpenSurfaceAction | TableRowMutationAction>;
    bulkToolbar?: Array<TableBulkMutationAction>;
  };
  children?: never;
}
```

Example generated Go shape:

```go
type ResourceTableNode struct {
    Kind        string                    `json:"kind"`
    Props       ResourceTableProps        `json:"props"`
    ActionSlots ResourceTableActionSlots  `json:"actionSlots,omitempty"`
}

type ResourceTableActionSlots struct {
    RowActions  []ResourceTableRowAction  `json:"rowActions,omitempty"`
    BulkToolbar []TableBulkMutationAction `json:"bulkToolbar,omitempty"`
}
```

The three layers serve different audiences. The meta-spec is for language designers. The generated UI DSL is for application authors. The target implementation code is for runtimes and renderers.

## Current System as the Case Study

The current codebase already contains the pieces that the meta-spec compiler should generate or align in the future. These files are the map an intern should study first.

| File | Current responsibility | Meta-spec compiler relevance |
| --- | --- | --- |
| `pkg/admindsl/types.go` | Defines Go page, node, action, shell, and JSON value types. | Future Go target can generate many of these definitions or drift tests for them. |
| `pkg/admindsl/builder.go` | Defines Go builder APIs for pages, nodes, and actions. | Future Go target can generate builders from node/action specs. |
| `pkg/admindsl/validate.go` | Validates current Admin DSL pages. | Future validator target can generate structural checks and leave semantic hooks hand-written. |
| `pkg/admindsl/goja_module.go` | Exposes Go builders into Goja as `require("fringe/admin-dsl")`. | Future Goja target can generate export tables from the language spec. |
| `pkg/admindsl/script_runtime.go` | Owns flow sessions, Goja execution, `ctx.bind`, and action callbacks. | Runtime remains mostly hand-written; generated action types must preserve this boundary. |
| `pkg/admindsl/proto_convert.go` | Converts Go Admin DSL pages to protobuf transport messages. | Future protobuf target may generate converters or transport shape checks. |
| `proto/fringe/admin_dsl/v1/admin_dsl.proto` | Defines current transport envelope and action event messages. | Future protobuf target can emit enums/messages for each UI DSL. |
| `pkg/server/handlers_admin_dsl.go` | Starts flows and handles frontend interaction events. | Runtime server remains hand-written; generated specs inform validation and payload typing. |
| `web/src/admin-dsl/schema.ts` | Defines TypeScript Admin page/node/action types. | Future TypeScript target can generate discriminated unions and prop types. |
| `web/src/admin-dsl/builder.ts` | Defines frontend fixture builders. | Future TypeScript target can generate fixture builders. |
| `web/src/admin-dsl/render.tsx` | Renders Admin DSL pages into React UI. | Future renderer target can generate typed widget contracts and registry scaffolding. |
| `web/src/admin-dsl/actions.ts` | Normalizes and dispatches frontend action metadata. | Future action target can generate context-aware action adapters. |
| `web/src/admin-dsl/BackendAdminDslPage.tsx` | Bridges frontend UI events to backend flow events. | Runtime bridge remains hand-written but consumes generated action/event types. |
| `web/src/admin-dsl/backendClient.ts` | Posts protobuf JSON flow start/event requests. | Client shape can be generated or checked against protobuf target output. |
| `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` | Demonstrates information-dense layouts and fixtures. | Story fixtures become examples and golden tests for a generated AdminWorkbench UI DSL. |

The first compiler prototype should not replace all these files. It should generate a small parallel artifact set and compare it to the existing implementation.

## Core Concepts

### Shell types

A shell type describes the outer frame of a UI. It is not a normal node. It controls page-level chrome: topbars, sidebars, navigation, density defaults, and global regions.

Example meta-spec:

```dsl
shell WorkbenchShell {
  props {
    title string required
    sidebar SidebarNav optional
    density enum["compact", "comfortable"] default "compact"
  }

  regions {
    main required
    drawers optional many
    modals optional many
  }
}
```

A simpler frontend UI DSL might define a different shell:

```dsl
shell CustomerFlowShell {
  props {
    brand string required
    progress StepProgress optional
    theme enum["light", "warm", "dark"] default "warm"
  }

  regions {
    main required
    overlay optional one
  }
}
```

The compiler can generate shell-specific page constructors and renderer contracts.

### Node types

A node type describes a semantic UI building block. A node is not necessarily a React component. It is a language construct that can be rendered by one or more targets.

Example:

```dsl
node Panel {
  props {
    title string optional
    ariaLabel string optional
    density enum["compact", "normal", "spacious"] default "normal"
    padding enum["none", "normal"] default "normal"
  }

  constraints {
    require oneOf(title, ariaLabel)
  }

  children allow ResourceTable, Form, ComparisonTable, MonthCalendar, TextBlock

  actionSlot toolbar {
    allows Navigate, OpenSurface, BackendMutation
  }

  actionSlot footer {
    allows OpenSurface, BackendMutation
  }
}
```

The node spec gives the compiler enough information to generate:

- prop structs and TypeScript interfaces;
- constructors/builders;
- validation checks;
- renderer prop contracts;
- docs;
- tests for invalid props and invalid children.

### Prop schemas

Props are typed fields on nodes, shells, and actions. A prop schema should define at least:

- name;
- type;
- required or optional;
- default value;
- doc string;
- constraints;
- whether it is serializable;
- whether it is target-specific.

Example:

```dsl
props {
  id string required doc "Stable table id used for action payloads and selection state."
  columns TableColumn[] required
  rows object[] required
  selectable boolean default false
  density enum["compact", "normal"] default "compact"
}
```

The compiler should treat props as language-level fields, not as arbitrary JSON. A target can still emit JSON, but the source of truth is typed.

### Child rules

Child rules describe which nodes may appear inside another node.

Examples:

```dsl
children none
children allow TextBlock, ImageGallery, Form
children allow any except Surface
children slot body allow ResourceTable, Form, Calendar
children slot footer allow ButtonRow
```

Child rules matter because renderers often assume structure. A `ResourceTable` with children may be meaningless. A `Panel` with any child can be useful. A `Tabs` node may require one or more `TabPane` children.

### Action types

An action type describes something the UI can initiate. Actions may be frontend-local or backend-owned.

Example:

```dsl
action Navigate {
  props {
    target string required
    label string required
  }
  runtime frontend
}

action OpenSurface {
  props {
    surfaceId string required
    label string required
  }
  runtime frontend
}

action BackendMutation {
  props {
    target string required
    label string required
    intent enum["neutral", "primary", "danger"] default "neutral"
    payload object optional
  }
  runtime backend
}
```

The `runtime` field does not mean the DSL author manually handles runtime behavior. It tells the compiler what kind of target scaffolding to generate.

### Action slots

An action slot belongs to a node. It declares where actions can appear and which action types are legal there.

Example:

```dsl
node ResourceTable {
  actionSlot rowActions {
    context row
    allows Navigate, OpenSurface, TableRowMutation
  }

  actionSlot bulkToolbar {
    context selectedRows
    allows TableBulkMutation
    requires selectable == true
  }
}
```

This is one of the most important concepts in the system. A `TableBulkMutation` is not globally valid. It is valid only where a node declares a slot that allows it. A form submit action, a drawer footer action, and a page header action can all lower to runtime action metadata, but they remain distinct in the language definition.

### Action contexts

An action context describes the implicit data available to an action inside a slot.

Examples:

```dsl
context row {
  rowId string
  row object
}

context selectedRows {
  selectedRowIds string[]
  selectedRows object[]
}

context formValues {
  formId string
  values object
}

context calendarCell {
  date string
  resourceId string optional
}
```

The compiler uses contexts to validate payload expressions and generate typed action payloads.

### Renderer contracts

A renderer contract describes what a renderer receives after a UI DSL program is validated and lowered. The renderer should not receive arbitrary unknown props when a strong contract is possible.

Example generated TypeScript contract:

```ts
export interface ResourceTableWidgetProps<Row = Record<string, unknown>> {
  id: string;
  columns: TableColumn<Row>[];
  rows: Row[];
  selectable: boolean;
  rowActions: Array<RenderAction<RowActionPayload<Row>>>;
  bulkActions: Array<RenderAction<BulkActionPayload<Row>>>;
  density: "compact" | "normal";
}
```

The renderer contract is not the same thing as the authoring syntax. It is the target shape that a React renderer, a test renderer, or a docs renderer consumes.

## Example Meta-Spec: Admin Workbench UI DSL

This example is intentionally close to our current Admin DSL v2, but written as a language specification rather than a page.

```dsl
uiLanguage AdminWorkbench version 2 {
  shell WorkbenchShell {
    props {
      title string required
      sidebar SidebarNav optional
      density enum["compact", "comfortable"] default "compact"
    }

    regions {
      main required
      drawers optional many
      modals optional many
    }
  }

  context row {
    rowId string
    row object
  }

  context selectedRows {
    selectedRowIds string[]
    selectedRows object[]
  }

  context formValues {
    formId string
    values object
  }

  action Navigate {
    props {
      target string required
      label string required
    }
    runtime frontend
  }

  action OpenSurface {
    props {
      surfaceId string required
      label string required
    }
    runtime frontend
  }

  action BackendMutation {
    props {
      target string required
      label string required
      intent enum["neutral", "primary", "danger"] default "neutral"
      confirmation Confirmation optional
    }
    runtime backend
  }

  action TableRowMutation extends BackendMutation {
    context row
  }

  action TableBulkMutation extends BackendMutation {
    context selectedRows
  }

  action FormSubmitMutation extends BackendMutation {
    context formValues
  }

  node PageHeader {
    props {
      title string required
      description string optional
      breadcrumbs Breadcrumb[] optional
    }

    actionSlot primary {
      allows Navigate, OpenSurface, BackendMutation
      max 3
    }

    children none
  }

  node Panel {
    props {
      title string optional
      ariaLabel string optional
      density enum["compact", "normal", "spacious"] default "normal"
      padding enum["none", "normal"] default "normal"
    }

    constraints {
      require oneOf(title, ariaLabel)
    }

    actionSlot toolbar {
      allows Navigate, OpenSurface, BackendMutation
    }

    actionSlot footer {
      allows OpenSurface, BackendMutation
    }

    children allow ResourceTable, Form, ComparisonTable, MonthCalendar, TextBlock, ImageGallery
  }

  node ResourceTable {
    props {
      id string required
      columns TableColumn[] required
      rows object[] required
      selectable boolean default false
      density enum["compact", "normal"] default "compact"
    }

    actionSlot rowActions {
      context row
      allows Navigate, OpenSurface, TableRowMutation
    }

    actionSlot bulkToolbar {
      context selectedRows
      allows TableBulkMutation
      requires selectable == true
    }

    children none
  }

  node Form {
    props {
      id string required
      fields FormField[] required
    }

    actionSlot submit {
      context formValues
      allows FormSubmitMutation
      exactly 1
    }

    actionSlot cancel {
      allows Navigate, OpenSurface
      max 1
    }

    children none
  }

  target go {
    package "pkg/admindsl/generated/adminworkbench"
    emit structs, builders, validators, gojaExports
  }

  target typescript {
    package "web/src/admin-dsl/generated/adminworkbench"
    emit unions, builders, rendererContracts
  }

  target protobuf {
    package "fringe.admin_workbench.v2"
    emit nodeKinds, actionKinds, transportMessages
  }

  target docs {
    emit nodeReference, actionReference, actionMatrix, examples
  }

  target tests {
    emit driftTests, invalidSpecTests, goldenJsonFixtures
  }
}
```

## Example Meta-Spec: Simple Customer UI DSL

The same compiler can define a lighter UI language for customer-facing flows. The vocabulary changes, but the concepts stay the same.

```dsl
uiLanguage CustomerFlow version 1 {
  shell CustomerFlowShell {
    props {
      brand string required
      progress StepProgress optional
      theme enum["warm", "light", "dark"] default "warm"
    }

    regions {
      main required
      overlay optional one
    }
  }

  context formValues {
    formId string
    values object
  }

  action NextStep {
    props {
      label string default "Continue"
      targetStep string required
    }
    runtime frontend
  }

  action SubmitToBackend {
    props {
      target string required
      label string required
    }
    runtime backend
    context formValues
  }

  node Hero {
    props {
      eyebrow string optional
      title string required
      body string optional
    }
    children none
  }

  node OptionCardGroup {
    props {
      name string required
      options OptionCard[] required
      minSelected int default 1
      maxSelected int default 1
    }
    children none
  }

  node StepForm {
    props {
      id string required
      fields FormField[] required
    }

    actionSlot submit {
      context formValues
      allows NextStep, SubmitToBackend
      exactly 1
    }

    children allow TextBlock, OptionCardGroup, UploadField
  }

  target go {
    emit structs, builders, validators, gojaExports
  }

  target typescript {
    emit unions, builders, rendererContracts
  }

  target docs {
    emit nodeReference, examples
  }
}
```

This example shows why the meta-spec compiler should not be Admin-specific. It can produce multiple UI DSLs from the same concepts.

## Runtime Action Model

The generated UI DSL should hide the frontend/backend split from the author, but the runtime must still enforce it.

### What the DSL author sees

The DSL author writes a semantic action:

```dsl
TableRowMutation {
  label "Review"
  target "intake.openRequest"
  rowId row.id
}
```

The author does not manually allocate an action ID. The author does not expose a function pointer to the browser. The author does not decide how the frontend event is encoded.

### What the compiler/runtime emits

The compiler and runtime lower the action into frontend-visible metadata:

```json
{
  "id": "admin_act_7f3a",
  "type": "mutation",
  "label": "Review",
  "placement": "row",
  "target": "intake.openRequest",
  "payload": {
    "rowId": "req_123"
  }
}
```

The frontend can render this as a row action button. When the user clicks, it dispatches the action ID and payload back to the backend.

### What the backend owns

The backend owns the trusted callback behind the opaque ID.

```text
User clicks Review
        |
        v
Frontend dispatches { actionId: "admin_act_7f3a", payload: { rowId: "req_123" } }
        |
        v
Backend checks session and page version
        |
        v
Backend finds callback bound to admin_act_7f3a
        |
        v
Backend executes trusted Goja/Go handler
        |
        v
Backend returns next UI DSL page/state
```

The current implementation already follows this pattern through `ctx.bind` in `pkg/admindsl/script_runtime.go` and the backend interaction handlers in `pkg/server/handlers_admin_dsl.go`. The meta-spec compiler should preserve that architecture. Generated action types should make it safer, not bypass it.

## Compiler Architecture

The meta-spec compiler compiles **UI language specifications**, not concrete UI pages. A later compiler or runtime may compile concrete pages written in the generated UI DSL, but that is a second layer.

### Pipeline

```text
              +-------------------------+
              | UI DSL meta-spec source |
              +-------------------------+
                           |
                           v
              +-------------------------+
              | parse / load structured |
              +-------------------------+
                           |
                           v
              +-------------------------+
              |      MetaSpec AST       |
              +-------------------------+
                           |
                           v
              +-------------------------+
              | semantic validation     |
              | - names resolve         |
              | - action slots valid    |
              | - contexts valid        |
              | - targets supported     |
              +-------------------------+
                           |
                           v
              +-------------------------+
              | LanguageSpec IR         |
              | normalized source truth |
              +-------------------------+
                  |        |        |
                  v        v        v
             Go target  TS target  Proto target
                  |        |        |
                  v        v        v
             Docs target  Tests target  Renderer target
```

### MetaSpec AST

The AST mirrors what the spec author wrote. It preserves source spans for error messages.

```ts
interface MetaSpecProgram {
  languages: UILanguageDecl[];
}

interface UILanguageDecl {
  name: string;
  version: number;
  shells: ShellDecl[];
  contexts: ContextDecl[];
  actions: ActionDecl[];
  nodes: NodeDecl[];
  targets: TargetDecl[];
  span: SourceSpan;
}
```

### LanguageSpec IR

The IR is normalized and target-independent. It is the source of truth consumed by code generators.

```ts
interface LanguageSpecIR {
  languageName: string;
  version: number;
  shellSpecs: Record<string, ShellSpec>;
  contextSpecs: Record<string, ContextSpec>;
  actionSpecs: Record<string, ActionSpec>;
  nodeSpecs: Record<string, NodeSpec>;
  targetSpecs: TargetSpec[];
}

interface NodeSpec {
  name: string;
  wireKind: string;
  props: PropSpec[];
  constraints: ConstraintSpec[];
  childRule: ChildRule;
  actionSlots: ActionSlotSpec[];
  docs: DocSpec;
}

interface ActionSlotSpec {
  name: string;
  context?: string;
  allowedActions: string[];
  cardinality: Cardinality;
  constraints: ConstraintSpec[];
}

interface ActionSpec {
  name: string;
  extends?: string;
  runtime: "frontend" | "backend";
  props: PropSpec[];
  context?: string;
  docs: DocSpec;
}
```

The IR should not be React-specific. React, Go, protobuf, and docs are targets. The IR defines a UI language.

### Compile pseudocode

```pseudo
function compileMetaSpec(source, options): CompileResult
  ast = parseOrLoadMetaSpec(source)
  diagnostics = []

  for language in ast.languages:
    symbolTable = buildSymbolTable(language)
    diagnostics += validateNames(language, symbolTable)
    diagnostics += validateShells(language, symbolTable)
    diagnostics += validateContexts(language, symbolTable)
    diagnostics += validateActions(language, symbolTable)
    diagnostics += validateNodes(language, symbolTable)
    diagnostics += validateTargets(language, symbolTable)

  if diagnostics contains error:
    return CompileResult(errors = diagnostics)

  ir = lowerAstToLanguageSpecIR(ast)
  outputs = []

  for target in ir.targetSpecs:
    generator = findGenerator(target.kind)
    outputs += generator.emit(ir, target.options)

  return CompileResult(ir = ir, outputs = outputs, diagnostics = diagnostics)
```

### Action slot validation pseudocode

```pseudo
function validateActionSlot(node, slot, symbols): Diagnostic[]
  errors = []

  if slot.context exists and not symbols.contexts.has(slot.context):
    errors.add("unknown action context", slot.context.span)

  for actionName in slot.allowedActions:
    action = symbols.actions.get(actionName)
    if action missing:
      errors.add("unknown action type", actionName.span)
      continue

    if action.context exists and slot.context exists and action.context != slot.context:
      errors.add(
        "action context does not match slot context",
        actionName.span,
        details = "action " + action.name + " requires " + action.context +
                  " but slot " + node.name + "." + slot.name + " has " + slot.context
      )

    if action.runtime == backend and target lacks backend runtime support:
      errors.warn("backend action requires runtime target support", actionName.span)

  if slot.cardinality.exactly == 1 and slot.allowedActions is empty:
    errors.add("slot requires exactly one action but allows no action types", slot.span)

  return errors
```

## Target Generation

Each target should be a generator over `LanguageSpecIR`. The target should not parse the original source and should not contain hidden language rules.

### Go target

The Go target can generate:

- node structs;
- prop structs;
- action structs;
- action slot structs;
- builder functions;
- validation functions;
- Goja export tables;
- JSON/protobuf conversion helpers;
- golden tests.

Example generated Go API:

```go
page := adminworkbench.NewPage("intake-requests", "Request triage").
    Shell(adminworkbench.WorkbenchShell{
        Title: "Fringe Intake Admin",
        Density: adminworkbench.DensityCompact,
    }).
    Content(
        adminworkbench.PageHeader(adminworkbench.PageHeaderProps{
            Title: "Request triage",
            Description: "Review incoming consultation requests.",
        }),
        adminworkbench.Panel(adminworkbench.PanelProps{Title: ptr("Today")}).
            Children(
                adminworkbench.ResourceTable(adminworkbench.ResourceTableProps{
                    ID: "requests",
                    Columns: requestColumns,
                    Rows: requestRows,
                    Selectable: true,
                }).
                RowActions(reviewAction).
                BulkToolbar(assignAction),
            ),
    )
```

Generated validation should include rules from the meta-spec:

```go
func ValidateResourceTable(node ResourceTableNode) error {
    if node.Props.ID == "" {
        return errors.New("resourceTable.id is required")
    }
    if len(node.Props.Columns) == 0 {
        return errors.New("resourceTable.columns must not be empty")
    }
    if len(node.ActionSlots.BulkToolbar) > 0 && !node.Props.Selectable {
        return errors.New("resourceTable.bulkToolbar requires selectable == true")
    }
    return nil
}
```

The Go target should not generate the entire server runtime. Files such as `pkg/admindsl/script_runtime.go` and `pkg/server/handlers_admin_dsl.go` should remain explicit because they own security, session lifecycle, and backend execution.

### TypeScript target

The TypeScript target can generate:

- discriminated unions for nodes;
- prop interfaces;
- action interfaces;
- builder functions;
- renderer prop contracts;
- action dispatch payload types;
- fixture helpers;
- type-level tests.

Example generated TypeScript:

```ts
export type AdminWorkbenchAction =
  | NavigateAction
  | OpenSurfaceAction
  | BackendMutationAction
  | TableRowMutationAction
  | TableBulkMutationAction
  | FormSubmitMutationAction;

export interface ResourceTableNode {
  kind: "resourceTable";
  props: ResourceTableProps;
  actionSlots?: {
    rowActions?: Array<NavigateAction | OpenSurfaceAction | TableRowMutationAction>;
    bulkToolbar?: TableBulkMutationAction[];
  };
  children?: never;
}

export function resourceTable(
  props: ResourceTableProps,
  slots?: ResourceTableActionSlots,
): ResourceTableNode {
  return { kind: "resourceTable", props, actionSlots: slots };
}
```

Renderer contracts can be generated separately from authoring types:

```ts
export interface ResourceTableWidgetProps<Row = Record<string, unknown>> {
  id: string;
  columns: TableColumn<Row>[];
  rows: Row[];
  selectable: boolean;
  rowActions: RenderAction<RowActionPayload<Row>>[];
  bulkActions: RenderAction<BulkActionPayload<Row>>[];
}
```

This separation matters. Authoring types describe valid DSL programs. Renderer contracts describe what a renderer receives after normalization.

### Protobuf target

The protobuf target has two possible strategies.

#### Strategy A: Stable envelope with generated enums and typed payload messages

This keeps a flexible JSON-like node payload but generates enums and action payload messages.

```proto
syntax = "proto3";

package fringe.admin_workbench.v2;

enum NodeKind {
  NODE_KIND_UNSPECIFIED = 0;
  NODE_KIND_PAGE_HEADER = 1;
  NODE_KIND_PANEL = 2;
  NODE_KIND_RESOURCE_TABLE = 3;
  NODE_KIND_FORM = 4;
}

enum ActionKind {
  ACTION_KIND_UNSPECIFIED = 0;
  ACTION_KIND_NAVIGATE = 1;
  ACTION_KIND_OPEN_SURFACE = 2;
  ACTION_KIND_BACKEND_MUTATION = 3;
  ACTION_KIND_TABLE_ROW_MUTATION = 4;
  ACTION_KIND_TABLE_BULK_MUTATION = 5;
}

message AdminNode {
  NodeKind kind = 1;
  string id = 2;
  google.protobuf.Struct props = 3;
  repeated AdminNode children = 4;
}
```

This is close to the current architecture and is easier to evolve.

#### Strategy B: Fully typed protobuf nodes

This generates a `oneof` for every node.

```proto
message AdminNode {
  oneof node {
    PageHeaderNode page_header = 1;
    PanelNode panel = 2;
    ResourceTableNode resource_table = 3;
    FormNode form = 4;
  }
}

message ResourceTableNode {
  ResourceTableProps props = 1;
  repeated TableRowMutationAction row_actions = 2;
  repeated TableBulkMutationAction bulk_toolbar = 3;
}
```

This is strongly typed but heavier. It may be better for stable DSLs and worse for rapidly evolving UI vocabularies.

The intern should prototype Strategy A first unless a specific downstream requirement demands full protobuf typing.

### Renderer target

The renderer target should not generate the entire visual implementation. It should generate contracts and registry scaffolding so the renderer remains explicit but not repetitive.

Generated registry:

```ts
export const adminWorkbenchRendererRegistry = {
  pageHeader: PageHeaderWidget,
  panel: PanelWidget,
  resourceTable: ResourceTableWidget,
  form: FormWidget,
} satisfies RendererRegistry<AdminWorkbenchNode>;
```

Generated adapter signature:

```ts
export interface NodeRendererAdapter<N, P> {
  kind: string;
  normalize(node: N, context: RenderContext): P;
  render(props: P, context: RenderContext): React.ReactNode;
}
```

Hand-written widget:

```tsx
export function ResourceTableWidget(props: ResourceTableWidgetProps) {
  return (
    <section className="admin-table">
      {/* visual implementation stays hand-authored */}
    </section>
  );
}
```

The compiler reduces the giant renderer switch by generating the registry and typed prop boundaries. The visual code remains reviewable.

### Docs target

The docs target should generate reference material that is always aligned with the spec.

Generated docs should include:

- shell reference;
- node reference;
- prop tables;
- child rule tables;
- action type reference;
- action slot matrix;
- context payload reference;
- target support matrix;
- valid and invalid examples.

Example action matrix:

| Node | Slot | Context | Allowed actions | Constraint |
| --- | --- | --- | --- | --- |
| `PageHeader` | `primary` | none | `Navigate`, `OpenSurface`, `BackendMutation` | max 3 |
| `Panel` | `footer` | none | `OpenSurface`, `BackendMutation` | none |
| `ResourceTable` | `rowActions` | `row` | `Navigate`, `OpenSurface`, `TableRowMutation` | none |
| `ResourceTable` | `bulkToolbar` | `selectedRows` | `TableBulkMutation` | `selectable == true` |
| `Form` | `submit` | `formValues` | `FormSubmitMutation` | exactly 1 |

### Test target

Generated tests should catch drift.

Examples:

- Every node in the spec has a TypeScript union member.
- Every node in the spec has a Go builder or an explicit `notGenerated` marker.
- Every action slot has a validator test.
- Every generated protobuf enum value has a corresponding Go/TS constant.
- Invalid slot/action combinations fail.
- Golden generated files are stable.

Pseudocode:

```pseudo
for node in language.nodeSpecs:
  assert tsUnionContains(node.name)
  assert goBuilderExists(node.name)
  assert docsContainNode(node.name)
  assert rendererRegistryContains(node.wireKind)

for slot in allActionSlots(language):
  for action in slot.allowedActions:
    assert validate(slot.with(action)) succeeds

for action in allActions(language):
  for slot in slotsThatDoNotAllow(action):
    assert validate(slot.with(action)) fails
```

## Implementation Guide for an Intern

The first implementation should be an experiment beside the existing system. Do not replace the production Admin DSL runtime first. The goal is to prove that the meta-spec can generate useful artifacts and catch drift.

### Proposed directory layout

Use an experimental package first:

```text
experiments/ui-dsl-meta/
  README.md
  specs/
    admin-workbench.v2.uidsl
    customer-flow.v1.uidsl
  compiler/
    ast.ts
    parser.ts
    validate.ts
    ir.ts
    compile.ts
  targets/
    go.ts
    typescript.ts
    protobuf.ts
    docs.ts
    tests.ts
    renderer.ts
  golden/
    admin-workbench/
      go/
      typescript/
      proto/
      docs/
```

If the project prefers Go for code generation, the analogous layout is:

```text
pkg/uidlspec/
  ast.go
  parser.go
  validate.go
  ir.go
  compiler.go
  targets/
    go/
    typescript/
    protobuf/
    docs/
    tests/
  testdata/
    admin-workbench.v2.uidsl
    customer-flow.v1.uidsl
```

The first prototype can be in TypeScript if the priority is iteration speed and generated frontend types. It can be in Go if the priority is integrating with existing backend builders and Go tests. The architectural concepts are the same.

### Phase 1: Write the spec as structured data before building a parser

Do not start by designing a perfect textual grammar. Start with YAML or JSON so the team can validate the model.

Example YAML representation:

```yaml
language: AdminWorkbench
version: 2
shells:
  WorkbenchShell:
    props:
      title: { type: string, required: true }
      sidebar: { type: SidebarNav, required: false }
      density:
        type: enum
        values: [compact, comfortable]
        default: compact
nodes:
  ResourceTable:
    wireKind: resourceTable
    props:
      id: { type: string, required: true }
      columns: { type: "TableColumn[]", required: true }
      rows: { type: "object[]", required: true }
      selectable: { type: boolean, default: false }
    actionSlots:
      rowActions:
        context: row
        allows: [Navigate, OpenSurface, TableRowMutation]
      bulkToolbar:
        context: selectedRows
        allows: [TableBulkMutation]
        requires: "selectable == true"
    children: none
```

This avoids parser debates and lets the intern focus on the semantic model.

### Phase 2: Build the symbol table and validator

The validator should reject invalid language specs before any code generation runs.

Checks:

- Shell names are unique.
- Node names are unique.
- Action names are unique.
- Context names are unique.
- Every referenced type exists or is marked external.
- Every action slot references known action types.
- Every slot context references a known context.
- Action context and slot context are compatible.
- Child rules reference known nodes.
- Target names are known.
- Required/default combinations are valid.

Pseudocode:

```pseudo
function buildSymbolTable(language): SymbolTable
  table = new SymbolTable()
  addAll(table.shells, language.shells)
  addAll(table.nodes, language.nodes)
  addAll(table.actions, language.actions)
  addAll(table.contexts, language.contexts)
  return table

function validateLanguage(language): Diagnostic[]
  table = buildSymbolTable(language)
  diagnostics = []
  diagnostics += validateProps(language, table)
  diagnostics += validateChildren(language, table)
  diagnostics += validateActionSlots(language, table)
  diagnostics += validateTargets(language, table)
  return diagnostics
```

### Phase 3: Lower to LanguageSpec IR

The IR should normalize names and defaults.

Examples:

- `ResourceTable` gets `wireKind: "resourceTable"` if not specified.
- Action inheritance is flattened.
- Slot cardinality defaults to `many`.
- Prop defaults are resolved.
- Documentation strings are attached to generated symbols.

Pseudocode:

```pseudo
function lowerToIR(language, symbols): LanguageSpecIR
  return {
    languageName: language.name,
    version: language.version,
    shellSpecs: lowerShells(language.shells),
    contextSpecs: lowerContexts(language.contexts),
    actionSpecs: lowerActionsAndFlattenInheritance(language.actions),
    nodeSpecs: lowerNodes(language.nodes),
    targetSpecs: lowerTargets(language.targets)
  }
```

### Phase 4: Generate documentation first

Docs are the safest target. If the docs generator cannot explain the language, the spec model is probably wrong.

Generate:

- `AdminWorkbench Node Reference.md`
- `AdminWorkbench Action Matrix.md`
- `AdminWorkbench Context Reference.md`
- `AdminWorkbench Target Support.md`

This phase provides immediate value and a review artifact for the team.

### Phase 5: Generate TypeScript types and renderer contracts

The TypeScript target is the best way to prove node/action typing.

Generate:

- `generated/schema.ts`
- `generated/actions.ts`
- `generated/builders.ts`
- `generated/rendererContracts.ts`
- `generated/registry.ts`

Then write compile-time tests:

```ts
// Valid: table row mutation in rowActions slot.
resourceTable({ id: "requests", columns, rows }, {
  rowActions: [tableRowMutation({ label: "Review", target: "review" })],
});

// Invalid: table bulk mutation in page header slot.
pageHeader({ title: "Requests" }, {
  primary: [tableBulkMutation({ label: "Assign", target: "assign" })],
});
```

### Phase 6: Generate Go structs/builders/validators

The Go target should initially generate a parallel package, not overwrite `pkg/admindsl`.

Generate:

- node structs;
- prop structs;
- action structs;
- builder functions;
- validators;
- Goja export metadata or export scaffolding.

Then compare with current files:

- `pkg/admindsl/types.go`
- `pkg/admindsl/builder.go`
- `pkg/admindsl/validate.go`
- `pkg/admindsl/goja_module.go`

The goal is not immediate replacement. The goal is to learn which pieces are safely generated and which should remain hand-written.

### Phase 7: Generate protobuf definitions

Start with the stable-envelope strategy. Generate enums and optional typed payloads before generating fully typed node trees.

Questions to answer:

- Does generated protobuf add enough value over JSON/protobuf `Struct`?
- Which messages need long-term compatibility guarantees?
- Can action payloads be typed without slowing UI iteration?

### Phase 8: Bridge to the existing Admin DSL v2 case study

Once docs, TypeScript, and Go generation work for a subset, apply the spec to the current Admin DSL v2 nodes:

- `PageHeader`
- `DashboardGrid`
- `Panel`
- `ResourceTable`
- `ComparisonTable`
- `MonthCalendar`
- `Form`
- `FieldGroup`
- `ImageGallery`
- `PreviewFrame`
- `Drawer`
- `Modal`

The bridge should produce drift reports first. Only after drift reports are useful should the team consider replacing hand-written code.

## Design Decisions

### Decision 1: The meta-spec defines UI DSL vocabularies, not domain databases

This system is not primarily for defining ecommerce products, CRM contacts, or supply chain jobs. Those domain models may be referenced by UI DSLs, but the meta-spec’s main job is to define UI language primitives: shells, nodes, props, children, actions, slots, contexts, and render targets.

### Decision 2: Actions are legal only through node action slots

An action type can exist globally, but it is usable only where a node slot allows it. This is how the language encodes UI semantics. A table bulk mutation is not a page header action. A form submit mutation is not a calendar cell action. The runtime may lower all of them to generic action events, but the source language should not treat them as interchangeable.

### Decision 3: Backend execution remains opaque to the frontend

Generated action metadata can be rendered by the frontend, but backend actions execute through backend-owned callbacks or handlers. The browser receives action IDs, labels, placement, intent, and payload data. It does not receive trusted functions.

### Decision 4: Renderer code should be generated only at the boundary

The compiler should generate renderer contracts, registries, and adapters. It should not generate complex visual JSX as the first approach. Human-authored widgets are easier to review and tune for visual quality.

### Decision 5: Start with structured specs, then add syntax later

A textual DSL is useful, but it is not the first risk. The first risk is whether the semantic model can express nodes, actions, slots, and contexts cleanly. YAML or JSON specs are enough for the first prototype.

### Decision 6: Generated code should be explicit and inspectable

Generated targets must not hide behavior behind magic dynamic lookup. Go and TypeScript outputs should be normal code with clear names and stable generated-file headers.

## Alternatives Considered

### Alternative 1: Keep writing each UI DSL by hand

This is the current path. It is fast for one DSL and avoids generator complexity. It becomes expensive when multiple UI DSLs need similar backend/frontend/transport/docs/test surfaces.

### Alternative 2: Use JSON Schema only

JSON Schema can validate props and generate some types. It is not enough for this problem because action contexts, node slots, child rules, target generation, Goja exports, and renderer contracts need richer semantic information.

### Alternative 3: Use protobuf as the only source of truth

Protobuf is strong for transport, but it is not a complete UI language specification format. It does not naturally express renderer contracts, action slot legality, child rules, builder generation, or documentation structure. It should be a target, not the whole meta-language.

### Alternative 4: Generate full React renderers

Generating full React renderers would maximize automation, but it would make visual design harder to review. For information-dense layouts, spacing, hierarchy, typography, and responsive behavior need deliberate hand-authored components. Generate contracts and registries first.

### Alternative 5: Build the page authoring DSL before the meta-spec compiler

A page authoring DSL is valuable, but it should not come first. The reusable value is in defining UI DSL vocabularies and generating implementation surfaces. Once that exists, page authoring syntaxes can be layered on top.

## Risks and Mitigations

### Risk: The compiler becomes more complex than the problem

Mitigation: Start with documentation and drift tests. Do not replace production runtime until generated artifacts prove their value.

### Risk: The meta-spec becomes too rigid

Mitigation: Support controlled extension points such as external types, target-specific metadata, semantic validation hooks, and experimental nodes behind explicit flags.

### Risk: Generated code becomes unreadable

Mitigation: Keep generated code simple, deterministic, and formatted. Add headers that say how to regenerate. Avoid clever code generation.

### Risk: The renderer registry becomes dynamic magic

Mitigation: Generate an explicit registry that imports known widgets. Do not allow arbitrary component lookup by string at runtime.

### Risk: Backend actions leak trust to the frontend

Mitigation: Preserve the current opaque action ID pattern. Generated code should type payloads and placements but not expose executable callbacks to the browser.

### Risk: Action context typing is too hard for dynamic rows/forms

Mitigation: Start with coarse context types such as `row object`, `selectedRows object[]`, and `formValues object`. Add stronger domain-specific typing only after the compiler model works.

## Open Questions

- Should the first implementation be in Go or TypeScript?
- Should the first spec format be YAML, JSON, or a custom textual DSL?
- How much of `pkg/admindsl/builder.go` can be generated without making flow scripts awkward?
- Should generated Goja exports expose builder functions directly or expose a structured module object generated from the spec?
- Should protobuf output use a stable envelope or fully typed node `oneof` messages?
- How should target-specific renderer metadata be represented without polluting the target-independent language spec?
- Should action contexts be erased after lowering or preserved in transport metadata for debugging?
- What is the smallest Admin Workbench subset that proves the idea?

## Recommended First Intern Assignment

The first intern assignment should be small, concrete, and reviewable.

Build a prototype that:

1. Defines `AdminWorkbench` in YAML or JSON with:
   - `WorkbenchShell`
   - `PageHeader`
   - `Panel`
   - `ResourceTable`
   - `Navigate`
   - `OpenSurface`
   - `BackendMutation`
   - `TableRowMutation`
   - `TableBulkMutation`
   - `row` and `selectedRows` contexts
2. Loads the spec into an AST.
3. Validates names, props, child rules, and action slots.
4. Lowers to `LanguageSpecIR`.
5. Generates Markdown docs with a node reference and action matrix.
6. Generates TypeScript discriminated unions and renderer contracts.
7. Generates at least one invalid-spec test proving that `TableBulkMutation` cannot be used in `PageHeader.primary`.

Do not replace the production Admin DSL. Do not generate full React widgets. Do not design a perfect grammar before the structured spec works.

Success looks like this:

```text
$ uidlspec compile specs/admin-workbench.v2.yaml --target docs --target typescript
OK generated:
  generated/admin-workbench/docs/node-reference.md
  generated/admin-workbench/docs/action-matrix.md
  generated/admin-workbench/typescript/schema.ts
  generated/admin-workbench/typescript/rendererContracts.ts

$ uidlspec test specs/admin-workbench.v2.yaml
OK valid spec
OK invalid examples failed as expected
```

## Appendix A: Glossary

| Term | Meaning |
| --- | --- |
| Meta-spec | A source document that defines a UI DSL vocabulary and rules. |
| UI DSL | A generated language for describing concrete UI screens/flows. |
| Shell | Page-level frame such as workbench chrome or customer flow chrome. |
| Node | Semantic UI building block such as panel, table, form, hero, or card group. |
| Prop schema | Typed field definitions for shells, nodes, and actions. |
| Child rule | Rule describing what nodes can appear inside another node. |
| Action type | A declarative user-triggered operation such as navigate, open surface, or backend mutation. |
| Action slot | A location on a node where actions may appear, with allowed action types. |
| Action context | Implicit data available to actions in a slot, such as row, selected rows, or form values. |
| Renderer contract | Typed props that a renderer widget receives after validation/lowering. |
| Target | A generated output family such as Go, TypeScript, protobuf, docs, tests, or renderer scaffolding. |

## Appendix B: Current API References

### Backend Admin DSL runtime

Files:

- `pkg/admindsl/types.go`
- `pkg/admindsl/builder.go`
- `pkg/admindsl/validate.go`
- `pkg/admindsl/goja_module.go`
- `pkg/admindsl/script_runtime.go`
- `pkg/admindsl/proto_convert.go`

Important concepts:

```go
type Page struct { ... }
type Node struct { ... }
type ActionRef struct { ... }

func PageAdmin(id, title string) *PageBuilder
func PageHeader(props JSONObject) *NodeBuilder
func Panel(title string, props JSONObject, children ...*NodeBuilder) *NodeBuilder
func ResourceTable(id string, props JSONObject) *NodeBuilder
func ValidatePage(page Page) error
```

Runtime concept:

```text
Goja flow script calls builder
        |
        v
ctx.bind associates action metadata with backend callback
        |
        v
frontend receives opaque action id
        |
        v
frontend posts interaction event
        |
        v
backend executes callback and returns next page
```

### Frontend Admin DSL runtime

Files:

- `web/src/admin-dsl/schema.ts`
- `web/src/admin-dsl/builder.ts`
- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/actions.ts`
- `web/src/admin-dsl/BackendAdminDslPage.tsx`
- `web/src/admin-dsl/backendClient.ts`
- `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`

Important concepts:

```ts
export interface AdminPage { ... }
export interface AdminNode { ... }
export interface AdminActionRef { ... }

export function AdminPageRenderer(...)
export function dispatchAdminAction(...)
export function postAdminDslEvent(...)
```

### Protobuf transport

File:

- `proto/fringe/admin_dsl/v1/admin_dsl.proto`

Important concepts:

```proto
message AdminDslStartRequest { ... }
message AdminDslStartResponse { ... }
message AdminDslInteractionRequest { ... }
message AdminDslInteractionResponse { ... }
```

A future protobuf target may generate new message definitions or drift tests against this transport.

## Appendix C: What Not To Do

Do not treat this as “write a better Admin DSL page compiler.” The target is a language-definition compiler for UI DSLs.

Do not make JSON the only internal representation. JSON may be a transport target, but the meta-spec IR should be typed and target-independent.

Do not generate arbitrary dynamic React component lookup. Renderer targets should generate explicit registries and typed contracts.

Do not expose backend callbacks to the browser. Generated action metadata must preserve the opaque action ID boundary.

Do not start by replacing production files. Start with docs, drift tests, and generated artifacts in an experiment directory.
