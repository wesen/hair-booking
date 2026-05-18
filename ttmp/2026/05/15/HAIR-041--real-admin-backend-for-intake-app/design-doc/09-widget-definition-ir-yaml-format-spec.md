---
Title: Widget Definition IR YAML Format Spec
Ticket: HAIR-041
Status: active
Topics:
    - backend
    - frontend
    - admin-dsl
    - dsl
    - compiler
    - ui-dsl
    - react
    - storybook
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/08-admin-dsl-react-widget-ir-catalog.md
      Note: Original prose widget catalog that the YAML IR formalizes
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py
      Note: Scaffold generator that consumes the widget definition IR
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/03-shell-widgets.yaml
      Note: Reference schema_version 2 widget definition IR example
    - Path: web/src/admin-dsl/render.tsx
      Note: Current monolithic renderer whose shell constructs are being modeled in YAML
    - Path: web/src/admin-dsl/schema.ts
      Note: Current AdminPage shell vocabulary referenced by the widget IR schema
ExternalSources: []
Summary: 'Specification for the Admin DSL widget definition IR YAML format: a prose-rich and script-readable artifact for defining React widgets, contracts, action slots, examples, Storybook stories, outputs, and implementation todos.'
LastUpdated: 2026-05-18T17:15:00-04:00
WhatFor: Use when authoring, validating, transforming, or generating code from Admin DSL widget definition YAML files under sources/admin-dsl-widget-ir/.
WhenToUse: Use before editing widget IR YAML, writing scaffold generators, generating Storybook stories, or migrating markdown widget catalog content into structured artifacts.
---


# Widget Definition IR YAML Format Spec

## Executive Summary

The Widget Definition IR YAML format is the machine-readable version of the Admin DSL React widget catalog. It defines each target React widget as a structured artifact that is useful to scripts, humans, and LLM-assisted implementation passes. The format is deliberately not just a type schema. It preserves human intent: why a widget exists, where the adapter boundary is, what each prop means, what each action slot represents, what every Storybook story should prove, and which implementation items must be changed before production use.

This specification describes `schema_version: 2`, which replaces the earlier Markdown-shaped YAML where fields such as `props`, `prop_docs`, `usage_example`, and `storybook_story_docs` lived beside each other at the same level. Version 2 organizes each widget into stable sections: `source_mapping`, `intent`, `contract`, `examples`, `stories`, `outputs`, and `implementation_todos`.

The format is an intermediate representation, not the final React implementation. A scaffold generator can consume it to create `.types.ts`, `.tsx`, `.stories.tsx`, tests, adapter stubs, or implementation prompts. A human can read it to understand the design. An LLM pass can use it as grounded context for filling in code. The same artifact must serve all three uses.

## Problem Statement

The initial widget IR YAML files were direct conversions from the Markdown catalog. They were useful, but they had three weaknesses.

First, they mixed formal and informal fields. For example, a widget had `props` as a TypeScript block scalar, `prop_docs` as a separate structure, `human_notes` as another prose block, and `xxx` as a list. Scripts could read them, but the structure did not clearly separate machine contracts from design rationale.

Second, some information was duplicated or parallel. `storybook_stories` listed story names, while `storybook_story_docs` held story explanations keyed by those names. That creates drift: a story can appear in one place but not the other.

Third, output paths were inferred from a freeform `file_layout` block. That was fine for a first scaffold pass, but generation tools should eventually consume explicit target paths rather than parsing prose.

The refined format solves these issues while preserving the core principle: natural language is as important as formal structure. Widget IR is not just for compilers. It is also the design handoff for implementers.

## Proposed Solution

Use a sectioned YAML format. Each file describes a category of widgets, and each widget uses this shape:

```yaml
schema_version: 2
artifact_type: admin_dsl_widget_definition_ir
category: shell_widgets
summary: Shell widget definitions extracted from AdminPageRenderer and WorkbenchShell.
source_document: ttmp/.../design-doc/08-admin-dsl-react-widget-ir-catalog.md
schema_document: ttmp/.../design-doc/09-widget-definition-ir-yaml-format-spec.md

widgets:
  - id: admin.shell.workbench
    name: WorkbenchShell
    status: scaffolded
    classification: ...
    source_mapping: ...
    intent: ...
    contract: ...
    examples: ...
    stories: ...
    outputs: ...
    implementation_todos: ...
```

This structure gives scripts stable locations for formal data and gives humans stable locations for rationale.

## Top-Level Document Schema

A widget IR YAML file contains metadata and a `widgets` list.

### Required top-level fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `schema_version` | integer | yes | Format version. Current version is `2`. |
| `artifact_type` | string | yes | Must be `admin_dsl_widget_definition_ir`. |
| `category` | string | yes | Category slug such as `shell_widgets`, `layout_widgets`, or `resource_widgets`. |
| `summary` | string | yes | Human-readable summary of what the file contains. |
| `widgets` | list | yes | List of widget definitions. |

### Recommended top-level fields

| Field | Type | Meaning |
| --- | --- | --- |
| `source_document` | path string | Human prose source that this YAML refines or replaces. |
| `schema_document` | path string | Path to this format specification. |

Example:

```yaml
schema_version: 2
artifact_type: admin_dsl_widget_definition_ir
category: shell_widgets
summary: Shell widget definitions extracted from AdminPageRenderer and WorkbenchShell.
source_document: ttmp/.../design-doc/08-admin-dsl-react-widget-ir-catalog.md
schema_document: ttmp/.../design-doc/09-widget-definition-ir-yaml-format-spec.md
widgets: []
```

## Widget Object Schema

Each widget object describes one React target widget.

### Required widget fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string | yes | Stable semantic id. Prefer dotted ids, e.g. `admin.shell.workbench`. |
| `name` | string | yes | React component name, e.g. `WorkbenchShell`. |
| `status` | enum | yes | Lifecycle status: `proposed`, `scaffolded`, `implemented`, `deprecated`, or `removed`. |
| `classification` | object | yes | Atomic design classification and optional role. |
| `intent` | object | yes | Human rationale and implementation guidance. |
| `contract` | object | yes | Formal-ish props and action slot contract. |
| `outputs` | object | yes | Target generated file paths. |

### Recommended widget fields

| Field | Type | Meaning |
| --- | --- | --- |
| `source_mapping` | object | Current source files and constructs this widget replaces or extracts. |
| `examples` | map | Named usage examples with docstrings and code. |
| `stories` | map | Named Storybook scenarios with docs, fixtures, interactions, and assertions. |
| `implementation_todos` | list | Explicit TODO/XXX items for generated code and human implementation. |

## `classification`

`classification` places the widget in the component system.

```yaml
classification:
  level: organism
  role: shell
  description: Full page-frame organism for information-dense admin workbench screens.
```

### Fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `level` | enum | yes | `atom`, `molecule`, or `organism`. |
| `role` | string | no | Optional semantic role such as `shell`, `surface`, `data-display`, or `form`. |
| `description` | string | recommended | Human description of why this classification was chosen. |

The classification is used by file scaffold passes, Storybook title generation, and implementation planning. It is also displayed in generated scaffold placeholders.

## `source_mapping`

`source_mapping` records what current implementation this widget replaces or extracts. This is important for migration and review.

```yaml
source_mapping:
  current_constructs:
    - shell.kind=admin
    - shell.props.variant=workbench
  current_files:
    - path: web/src/admin-dsl/render.tsx
      symbol: WorkbenchShell
      notes: Current inline workbench shell implementation.
```

### Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `current_constructs` | list of strings | Current Admin DSL constructs, node kinds, shell variants, or prop patterns. |
| `current_files` | list | Source files and symbols used to derive the widget definition. |

Each `current_files` entry should contain:

```yaml
path: web/src/admin-dsl/render.tsx
symbol: WorkbenchShell
notes: Current inline implementation.
```

This section lets a migration script or reviewer trace the widget back to the old renderer.

## `intent`

`intent` is the human-readable design section. It is required because natural language is part of this IR.

```yaml
intent:
  purpose: >-
    Render the information-dense admin workbench frame.
  design_rationale: >-
    The shell makes frame-level admin UI explicit instead of hiding it in the renderer switch.
  adapter_boundary: >-
    The adapter translates raw Admin DSL shell props into normalized widget props.
  implementation_notes:
    - Desktop layout should show a persistent left sidebar.
  accessibility_notes:
    - Sidebar nav must use a named nav region.
```

### Fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `purpose` | string | yes | One or two paragraphs describing what the widget is for. |
| `design_rationale` | string | recommended | Why the widget should exist as a distinct component. |
| `adapter_boundary` | string | recommended | What the adapter must do before data reaches this widget. |
| `implementation_notes` | list of strings | recommended | Notes for implementers. |
| `accessibility_notes` | list of strings | recommended | Accessibility expectations and risks. |

Generators should render this section into scaffold comments or placeholder UI. LLM passes should treat it as high-priority context.

## `contract`

`contract` contains the formal-ish widget API. It is split into `props` and `action_slots`.

```yaml
contract:
  props: ...
  action_slots: ...
```

The contract should be specific enough to generate TypeScript prop interfaces, Storybook arg types, and adapter signatures.

## `contract.props`

`props` is a map of interface/type names to structured field definitions.

```yaml
contract:
  props:
    WorkbenchShellProps:
      doc: Props for the workbench shell organism.
      fields:
        pageId:
          type: string
          required: true
          doc: Stable page identifier used for data attributes and traceability.
        children:
          type: React.ReactNode
          required: true
          doc: Already-rendered page body content.
```

### Prop interface fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `doc` | string | yes | Docstring for the interface/type. |
| `fields` | map | yes | Field definitions. |

### Prop field definition

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `type` | string | yes | Type expression in target-neutral or TypeScript-like notation. |
| `required` | boolean | yes | Whether the field is required. |
| `doc` | string | yes | Field docstring. |
| `default` | any | no | Default value if omitted. |
| `examples` | list | no | Example values. |

This replaces the older `props: | export interface ...` plus separate `prop_docs`. A TypeScript generator can produce the interface from this structure.

### Generated TypeScript example

Input:

```yaml
pageId:
  type: string
  required: true
  doc: Stable page identifier.
user:
  type: WorkbenchUser
  required: false
  doc: Optional admin identity.
```

Output:

```ts
export interface WorkbenchShellProps extends CommonWidgetProps {
  /** Stable page identifier. */
  pageId: string;
  /** Optional admin identity. */
  user?: WorkbenchUser;
}
```

## `contract.action_slots`

`action_slots` is a map of slot names to action slot definitions.

```yaml
contract:
  action_slots:
    sidebarNav:
      doc: Navigation action slot for sidebar items.
      callback: onSidebarAction
      action_type: ActionViewModel
      cardinality: many
      context_type: WorkbenchSidebarNavContext
      context:
        item:
          type: SidebarNavItem
          required: true
          doc: The clicked navigation item.
      lowering:
        adapter: dispatchAdminAction
        note: Adapter converts typed callback into Admin DSL dispatch.
```

### Slot fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `doc` | string | yes | What the slot is for and where it appears. |
| `callback` | string | yes | React prop callback name generated for the widget. |
| `action_type` | string | recommended | Type of action metadata passed to the callback. Usually `ActionViewModel`. |
| `cardinality` | enum | recommended | `zero_or_one`, `one`, `many`, or `fixed`. |
| `context_type` | string | recommended | Name of generated context type. |
| `context` | map | recommended | Fields passed as contextual payload to the callback. |
| `lowering` | object | recommended | How adapters lower this slot to runtime dispatch. |

### Context field definition

The shape is the same as prop fields:

```yaml
context:
  activeItemId:
    type: string
    required: false
    doc: The sidebar item id that was active before the click.
```

Action slots are the bridge between the UI widget and backend/frontend action execution. They should be richly documented.

## `examples`

`examples` is a map of named usage examples.

```yaml
examples:
  BasicWorkbench:
    doc: Demonstrates the intended adapter boundary.
    demonstrates:
      - Normalized sidebar props.
      - Optional user footer.
    code: |-
      <WorkbenchShell ... />
```

### Fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `doc` | string | yes | What the example demonstrates and why it matters. |
| `demonstrates` | list of strings | recommended | Specific concepts shown by the example. |
| `code` | string | yes | Example code block. |

Generators can use examples in docs, Storybook descriptions, tests, or implementation prompts.

## `stories`

`stories` is a map of Storybook story names to scenario definitions. This replaces the older parallel `storybook_stories` and `storybook_story_docs` fields.

```yaml
stories:
  DefaultDesktop:
    doc: Tests the normal desktop workbench frame.
    viewport: desktop
    fixtures:
      sidebar: normal
      user: present
    interactions:
      - click nav item Services
    asserts:
      - Sidebar is visible.
      - Active navigation item is highlighted.
```

### Fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `doc` | string | yes | What the story is testing. |
| `viewport` | string | recommended | `desktop`, `tablet`, `mobile`, or a named Storybook viewport. |
| `fixtures` | map | recommended | Fixture knobs or fixture scenario names. |
| `interactions` | list | optional | User actions to simulate or document. |
| `asserts` | list of strings | recommended | What should be true visually or behaviorally. |

A Storybook generator should create one story export for every key in this map and include the `doc` in story parameters or comments.

## `outputs`

`outputs` declares generated or target files explicitly.

```yaml
outputs:
  component:
    path: web/src/admin-dsl/widgets/organisms/WorkbenchShell/WorkbenchShell.tsx
  types:
    path: web/src/admin-dsl/widgets/organisms/WorkbenchShell/WorkbenchShell.types.ts
  stories:
    path: web/src/admin-dsl/widgets/organisms/WorkbenchShell/WorkbenchShell.stories.tsx
  tests:
    path: web/src/admin-dsl/widgets/organisms/WorkbenchShell/WorkbenchShell.test.tsx
  barrel:
    path: web/src/admin-dsl/widgets/organisms/WorkbenchShell/index.ts
```

### Standard output keys

| Key | Meaning |
| --- | --- |
| `component` | React component file. |
| `types` | TypeScript prop/action/context types. |
| `stories` | Storybook file. |
| `tests` | Test file. Optional but recommended for organisms. |
| `barrel` | `index.ts` export file. |
| `fixtures` | Optional fixtures file. |
| `parts` | Optional map/list of internal part outputs. |

Generators should prefer `outputs` over path inference.

## `implementation_todos`

`implementation_todos` replaces `xxx`. The generator may still render these as `// XXX:` comments, but YAML should keep them structured.

```yaml
implementation_todos:
  - id: replace-placeholder
    severity: required
    doc: Replace generated scaffold placeholder with final visual implementation.
```

### Fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string | yes | Stable todo id. |
| `severity` | enum | yes | `required`, `recommended`, `optional`, or `research`. |
| `doc` | string | yes | Human-readable todo. |

Generators should render `required` todos prominently.

## Full Minimal Example

```yaml
schema_version: 2
artifact_type: admin_dsl_widget_definition_ir
category: shell_widgets
summary: Shell widget definitions.
widgets:
  - id: admin.shell.example
    name: ExampleShell
    status: proposed
    classification:
      level: organism
      role: shell
      description: Example shell widget.
    intent:
      purpose: Render an example shell.
      adapter_boundary: Adapter passes normalized props.
    contract:
      props:
        ExampleShellProps:
          doc: Props for ExampleShell.
          fields:
            pageId:
              type: string
              required: true
              doc: Stable page id.
      action_slots: {}
    outputs:
      component:
        path: web/src/admin-dsl/widgets/organisms/ExampleShell/ExampleShell.tsx
      types:
        path: web/src/admin-dsl/widgets/organisms/ExampleShell/ExampleShell.types.ts
      stories:
        path: web/src/admin-dsl/widgets/organisms/ExampleShell/ExampleShell.stories.tsx
      barrel:
        path: web/src/admin-dsl/widgets/organisms/ExampleShell/index.ts
```

## Design Decisions

### Decision 1: Prose is first-class

The IR keeps fields like `intent.purpose`, `intent.design_rationale`, `examples.*.doc`, and `stories.*.doc` because scripts are not the only consumers. Humans and LLM passes need natural-language intent to implement widgets correctly.

### Decision 2: Contracts are structured, not TypeScript blobs

TypeScript snippets are useful as generated output, but they should not be the source of truth. The schema uses `contract.props.*.fields` and `contract.action_slots.*.context` so generators can target TypeScript, docs, tests, or other outputs.

### Decision 3: Stories are maps, not parallel arrays

A story name, docstring, viewport, fixtures, interactions, and assertions belong together. This avoids drift between `storybook_stories` and `storybook_story_docs`.

### Decision 4: Output paths are explicit

Scaffold generators should not parse freeform file trees. `outputs` gives scripts stable paths.

### Decision 5: TODOs are structured but render as XXX

`implementation_todos` is better YAML. Generated code can still render required todos as `// XXX:` or prominent block comments.

## Alternatives Considered

### Alternative 1: Keep Markdown-like YAML

This is easy to write and preserves the original document shape, but it makes scripts infer too much and encourages parallel fields that can drift.

### Alternative 2: Use JSON Schema directly

JSON Schema can validate the YAML structure, but it does not capture the intent of the format. This document should exist even if a JSON Schema validator is added later.

### Alternative 3: Use TypeScript interfaces as the source of truth

TypeScript is a good target, but it is not a good multi-target IR by itself. It cannot naturally represent Storybook intent, adapter boundaries, source mapping, or implementation todos.

## Implementation Plan

1. Convert `03-shell-widgets.yaml` to `schema_version: 2` as the reference example.
2. Update the scaffold generator to support schema v2 while optionally accepting schema v1 during transition.
3. Convert action, layout, resource, data-display, media, calendar, form, and surface YAML files to schema v2.
4. Add a lightweight validator script that checks required fields and story/output consistency.
5. Update scaffold generation to prefer `outputs` and structured props over inferred `file_layout` and TypeScript snippets.
6. Generate docs and Storybook skeletons from the structured examples and stories.

## Open Questions

- Should `contract.props.*.fields.*.type` use TypeScript syntax, a target-neutral type grammar, or both?
- Should `outputs.parts` be standardized for widgets such as `ResourceTable` that own internal parts?
- Should every story require `asserts`, or can purely visual stories omit them?
- Should `source_mapping.current_constructs` use a formal selector grammar later?
- Should generated file provenance live in every output file, a generated manifest, or both?

## References

- `sources/admin-dsl-widget-ir/03-shell-widgets.yaml`
- `design-doc/08-admin-dsl-react-widget-ir-catalog.md`
- `scripts/05-scaffold-admin-dsl-widgets.py`
- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/schema.ts`
