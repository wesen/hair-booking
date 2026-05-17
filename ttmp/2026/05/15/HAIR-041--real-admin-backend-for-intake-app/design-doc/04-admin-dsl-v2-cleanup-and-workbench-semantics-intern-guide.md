---
Title: Admin DSL v2 Cleanup and Workbench Semantics Intern Guide
Ticket: HAIR-041
Status: active
Topics:
    - backend
    - frontend
    - admin-dsl
    - goja
    - dsl
    - persistence
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/admindsl/builder.go
      Note: Phase 13 Go builders for v2 nodes and layout/density helpers
    - Path: pkg/admindsl/builder_test.go
      Note: Phase 13 Go builder coverage for v2 workbench nodes
    - Path: pkg/admindsl/flows/intake_admin.flow.js
      Note: Primary admin flow to migrate from v1 collage patterns to v2 workbench semantics
    - Path: pkg/admindsl/goja_module.go
      Note: |-
        Goja admin builder exports that need v2 vocabulary updates
        Phase 13 Goja exports for v2 Admin DSL helpers
    - Path: pkg/admindsl/goja_module_test.go
      Note: Phase 13 Goja module coverage for v2 workbench helpers
    - Path: pkg/admindsl/script_runtime.go
      Note: Action binding/page-version runtime that remains central in v2
    - Path: pkg/admindsl/types.go
      Note: |-
        Current Go Admin DSL v1 node/action vocabulary evaluated for v2 cleanup
        Phase 13 v2 node constants and action placements
    - Path: pkg/admindsl/validate.go
      Note: Validation layer that should become stricter for Admin DSL v2
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/03-admin-workbench-dsl-intern-implementation-guide.md
      Note: Companion workbench layout guide that this v2 cleanup guide builds on
    - Path: web/src/admin-dsl/AdminDslWorkbench.stories.tsx
      Note: Phase 12 target desktop/mobile Admin DSL v2 Storybook fixture
    - Path: web/src/admin-dsl/builder.ts
      Note: Frontend fixture builders for pageHeader dashboardGrid comparisonTable and monthCalendar
    - Path: web/src/admin-dsl/render.tsx
      Note: |-
        React interpreter that must remove v1 cases and add v2 workbench rendering
        Workbench shell pageHeader dashboardGrid panel comparisonTable monthCalendar and v2 table rendering
    - Path: web/src/admin-dsl/schema.ts
      Note: |-
        TypeScript Admin DSL schema requiring v2 node cleanup
        Phase 12 v2 node/action/schemaVersion frontend schema support
ExternalSources: []
Summary: A detailed intern-oriented design and implementation guide for cutting over Admin DSL to a stricter v2 semantic workbench DSL without backwards-compatibility constraints.
LastUpdated: 2026-05-16T18:20:00-04:00
WhatFor: 'Use when planning or implementing the Admin DSL v2 cleanup: removing vague frontend-style primitives, tightening validation, and replacing component-collage pages with semantic admin workbench constructs.'
WhenToUse: Read before changing Admin DSL schemaVersion, node vocabulary, renderer semantics, Go builders, Goja module exports, or /admin/intake flow authoring patterns.
---




# Admin DSL v2 Cleanup and Workbench Semantics Intern Guide

## 0. Why This Document Exists

The current Admin DSL works. It can render pages, dispatch backend-bound actions, open drawers and modals, show data components, edit config, and run real admin flows from Goja. That is a major milestone. But the system has reached the point where the next problem is not “can we render an admin page?” The next problem is “can we render the right kind of admin page, repeatedly, without each flow becoming a hand-built collage of frontend widgets?”

This document is a cleanup and redesign guide for **Admin DSL v2**. It assumes we do **not** need backwards compatibility. That freedom matters. It means we can remove vague primitives, rename misleading ones, tighten validation, bump `schemaVersion`, and update the flows/renderers in one clean cut rather than preserving legacy shims.

The target direction is a **semantic admin-workbench DSL**. The backend should describe admin work: resources, review queues, forms, status, activity, calendars, shells, page headers, actions, panels, and responsive layout policy. The frontend should interpret those semantics into good React UI. The backend should not describe random visual component arrangements, and the frontend should not have to guess application behavior.

## 1. What You Should Understand by the End

A new intern reading this guide should be able to answer these questions:

- What is the Admin DSL, and where does it sit between Go, Goja JavaScript, HTTP, and React?
- Why are the current v1 primitives not quite right for operational admin screens?
- Which node kinds should be kept, strengthened, renamed, split, or removed?
- What should `schemaVersion: 2` mean?
- How should actions, layout, surfaces, tables, forms, and calendar primitives become stricter?
- Which files need to change in the Go schema, Go builders, Goja exports, frontend schema, renderer, Storybook, and flows?
- How should the cutover be implemented safely if we do not need backwards compatibility?

The short version: **Admin DSL v2 should stop being a general visual widget DSL and become a precise language for backend-driven admin workbenches.**

## 2. Current System Map

The current Admin DSL has four layers. Keep this mental model close while reading the rest of the document.

```text
+---------------------------------------------------------+
| Embedded Admin Flow JavaScript                          |
| pkg/admindsl/flows/*.flow.js                            |
|                                                         |
| Example:                                                |
|   const admin = require("admin")                        |
|   const intakeAdmin = require("host/intake-admin")      |
|   return admin.pageResource(...).Content(...).MustBuild()|
+----------------------------+----------------------------+
                             |
                             | returns plain Admin DSL JSON page
                             v
+---------------------------------------------------------+
| Go Admin DSL Runtime                                    |
| pkg/admindsl/script_runtime.go                          |
| pkg/admindsl/goja_module.go                             |
| pkg/admindsl/types.go                                   |
|                                                         |
| Responsibilities:                                       |
|   - Load embedded JS flows                              |
|   - Resolve embedded relative require("./...")         |
|   - Expose native host modules                          |
|   - Bind callbacks to opaque action IDs                 |
|   - Validate pages                                      |
|   - Commit page versions                                |
+----------------------------+----------------------------+
                             |
                             | protobuf JSON over HTTP
                             v
+---------------------------------------------------------+
| Server HTTP Transport                                   |
| pkg/server/handlers_admin_dsl.go                        |
|                                                         |
| Routes:                                                 |
|   POST /api/admin-dsl/flows/{flowId}/start              |
|   GET  /api/admin-dsl/flows/{sessionId}                 |
|   POST /api/admin-dsl/flows/{sessionId}/events          |
+----------------------------+----------------------------+
                             |
                             | AdminPage JSON
                             v
+---------------------------------------------------------+
| React Admin DSL Renderer                                |
| web/src/admin-dsl/schema.ts                             |
| web/src/admin-dsl/render.tsx                            |
| web/src/admin-dsl/BackendAdminDslPage.tsx               |
|                                                         |
| Responsibilities:                                       |
|   - Fetch/start flow sessions                           |
|   - Render JSON nodes explicitly                        |
|   - Collect form/event values                           |
|   - Dispatch action IDs back to backend                 |
+---------------------------------------------------------+
```

The central contract is the Admin DSL page JSON. Backend flows produce it. The Go runtime validates and transports it. React interprets it. When we clean up the DSL, every layer in this diagram must be updated together.

## 3. Important Files

Do not start by searching the whole repository. Start with the files below.

### 3.1 Go Admin DSL Core

| File | What it does |
| --- | --- |
| `pkg/admindsl/types.go` | Defines Go types/constants for `Page`, `Node`, `ActionRef`, `Shell`, node kinds, action types, action placement, and regions. |
| `pkg/admindsl/builder.go` | Fluent Go builders that create Admin DSL JSON. This should stay thin: builders produce JSON; they should not encode app-specific policy. |
| `pkg/admindsl/goja_module.go` | Exposes the builder vocabulary into Goja so embedded JS can call `admin.*`. |
| `pkg/admindsl/validate.go` | Validates generated pages. In v2 this should become much stricter. |
| `pkg/admindsl/script_runtime.go` | Runs Goja flows, stores sessions, binds action callbacks, rejects stale actions, and commits page versions. |
| `pkg/admindsl/flows.go` | Embeds flow JS files and registers helper script modules. |

### 3.2 Admin Flow JavaScript

| File | What it does |
| --- | --- |
| `pkg/admindsl/flows/intake_admin.flow.js` | Root `/admin/intake` router/dashboard orchestration. |
| `pkg/admindsl/flows/intake_requests.flow.js` | Request queue/detail/photo review. |
| `pkg/admindsl/flows/intake_config.flow.js` | Config editor screen orchestration and mutation callbacks. |
| `pkg/admindsl/flows/intake_config_helpers.flow.js` | Config row mappers/parsers. |
| `pkg/admindsl/flows/intake_config_forms.flow.js` | Config edit drawer/form builders. |
| `pkg/admindsl/flows/intake_ops.flow.js` | Audit, health, and preview screens. |
| `pkg/admindsl/flows/services.flow.js` | Earlier real Goja-backed `/admin/services` flow. |

### 3.3 Server and App Host Modules

| File | What it does |
| --- | --- |
| `pkg/server/handlers_admin_dsl.go` | Admin DSL HTTP routes and flow registry. |
| `pkg/server/host_intake_admin_module.go` | Exposes app-owned intake admin operations to JS as `require("host/intake-admin")`. |
| `pkg/server/host_intake_module.go` | Exposes customer intake persistence to customer DSL flows. |
| `pkg/intakeadmin/store.go` | App-owned persistence for requests, config versions, admin audit, health diagnostics, and config mutations. |
| `pkg/intakeadmin/schema.sql` | SQLite schema for app-owned admin persistence. |

### 3.4 Frontend Admin DSL

| File | What it does |
| --- | --- |
| `web/src/admin-dsl/schema.ts` | TypeScript schema mirror of Admin DSL JSON. Add/remove node kinds here. |
| `web/src/admin-dsl/render.tsx` | Main explicit React interpreter. Add/remove render cases here. |
| `web/src/admin-dsl/calendar.tsx` | Calendar-related rendering helpers. |
| `web/src/admin-dsl/actions.ts` | Action dispatch helpers. |
| `web/src/admin-dsl/renderUtils.ts` | Renderer utilities. |
| `web/src/admin-dsl/BackendAdminDslPage.tsx` | Live backend page wrapper for `/admin/services` and `/admin/intake`. |
| `web/src/admin-dsl/backendClient.ts` | HTTP client for Admin DSL flow API. |
| `web/src/admin-dsl/*.stories.tsx` | Storybook examples; every new v2 primitive should appear here. |
| `web/src/admin-dsl/*.test.tsx` | Renderer and behavior tests. |

### 3.5 Reference Design Docs and Images

| File | Why it matters |
| --- | --- |
| `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/02-admin-layout-density-reference-analysis.md` | Visual analysis of target dense admin layout vs current layout. |
| `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/03-admin-workbench-dsl-intern-implementation-guide.md` | First workbench implementation guide focused on layout primitives. |
| `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/01-target-efficient-admin-layout.png` | Target dense admin workbench screenshot. |
| `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/02-current-original-admin-layout.png` | Current/original admin layout screenshot. |

This v2 guide is separate from the previous workbench guide. The previous guide asks “what do we need to add?” This guide asks “what should we tighten, remove, rename, or redesign now that backwards compatibility is not required?”

## 4. What Is Wrong With v1?

The v1 Admin DSL is valuable because it proved the architecture. The problem is not failure; the problem is accumulated ambiguity.

### 4.1 v1 mixes abstraction levels

The current node list includes semantic admin concepts, layout concepts, and visual component concepts in the same flat namespace.

Examples:

- Semantic/admin concepts:
  - `resourceTable`
  - `resourceDetail`
  - `form`
  - `saveBar`
  - `activityFeed`
- Layout/container concepts:
  - `section`
  - `toolbar`
  - `cardGrid`
  - `panel`
  - `splitPane`
  - `tabs`
- Frontend-ish visual concepts:
  - `summaryCard`
  - `metricCard`
  - `imageGrid`
  - `markdownBlock`
  - `editableList`
  - `monthAvailabilityGrid`

A flat list like this makes it easy to emit pages, but hard to know what a page means. A flow author asks, “Should this be a section with cards? A cardGrid? A resourceList? A panel?” Too many answers are possible.

### 4.2 v1 lets pages become component collages

A component collage is a page assembled from visual pieces without a strong semantic hierarchy. It might look fine for one screen, but it becomes hard to evolve because each page invents its own layout grammar.

A semantic admin page should say:

```text
This is a workbench page.
It has a sidebar.
It has a page header.
It has a dashboard grid.
The grid contains KPI metrics, a services table, a calendar, a draft-review queue, an activity feed, and a preview panel.
```

A component collage says:

```text
Here are some cards, sections, markdown blocks, date tiles, and buttons.
Good luck figuring out which ones are page structure and which ones are content.
```

Admin DSL v2 should prefer the first style.

### 4.3 v1 layout primitives are too vague

Nodes such as `section`, `cardGrid`, and `splitPane` do not say enough about admin intent. They describe visual arrangement but not work structure. In v2, a backend flow should be encouraged to describe page regions and data operations, not just visual boxes.

### 4.4 v1 forms are not strict enough

Some fields currently behave like text-field fallbacks. That is convenient during prototyping, but wrong for a durable DSL.

In v2:

- `switchField` should submit a boolean.
- `selectField` should submit one of the allowed option values.
- `moneyField` should parse and format money intentionally.
- `durationField` should parse and format durations intentionally.
- form arrays/reorder controls should have explicit event semantics.

### 4.5 v1 validation is too permissive

Loose validation hides mistakes until runtime or visual review. Since we can break compatibility, v2 validation should reject ambiguous and malformed pages early.

Examples of errors v2 should catch:

- `resourceTable` with no columns.
- `comparisonTable` rows without IDs.
- field nodes without `name` or `label`.
- actions without `type` or `target`.
- `panel.layout.span.desktop` outside the grid range.
- deprecated v1 node kinds.
- unknown node kinds.

## 5. Design Goal for v2

The design goal is simple:

> Admin DSL v2 is a semantic, backend-driven, workbench-oriented DSL for operational admin interfaces.

This sentence has several consequences.

- **Semantic** means nodes represent admin concepts, not arbitrary React component choices.
- **Backend-driven** means Goja flows and host modules produce the page and own callbacks.
- **Workbench-oriented** means the DSL supports dense operational layouts: tables, review queues, navigation, activity, calendars, forms, and dashboards.
- **Operational** means admins can scan, compare, filter, review, mutate, and audit data efficiently.

## 6. Proposed v2 Vocabulary

This section is the first concrete proposal. Names can still change, but the shape is the important part.

### 6.1 Page and shell primitives

Keep or add:

- `pageHeader`
- `dashboardGrid`
- `panel`
- `tabs` or `pageTabs` after clarifying scope
- richer `shell.kind = "admin"` with `variant: "workbench"`

Remove or replace:

- `section` → replace with `panel`, `pageHeader`, or `formSection`.
- `cardGrid` → replace with `dashboardGrid`.
- `splitPane` → replace with `dashboardGrid` spans or explicit master/detail constructs if needed.

### 6.2 Data/resource primitives

Keep or strengthen:

- `resourceTable`
- `resourceDetail`
- `filterBar`
- `searchBox`
- `actionMenu`
- `statusBadge`

Remove or fold:

- `resourceList`
- `resourceRow`

The recommended direction is for `resourceTable` to become the canonical collection primitive. On mobile, the renderer can collapse a table into stacked row cards. The backend should not have to choose “table vs list” unless the use case truly differs.

### 6.3 Review/diff primitives

Add:

- `comparisonTable`
- optionally `diffBlock`

Remove or split:

- `diffView`

Reason: the target layout needs an operational review queue, not only a visual diff block. A comparison table has rows, actions, scheduled dates, status, and stable IDs. A diff block is for text/blob before-after views. These are different jobs.

### 6.4 Calendar/schedule primitives

Add or rename:

- `monthCalendar`
- `weekSchedule`
- `calendarEvent`

Remove or replace:

- `monthAvailabilityGrid` → `monthCalendar`
- possibly keep `calendarWeek` only if renamed/reshaped as `weekSchedule`
- `appointmentBlock`, `availabilityBlock`, `timeOffBlock` may become event types instead of node kinds

A calendar should be a calendar component with event data, not many tiny node kinds for each event category.

### 6.5 Forms

Keep and tighten:

- `form`
- `fieldGroup`
- `textField`
- `textareaField`
- `moneyField`
- `durationField`
- `dateField`
- `timeField`
- `selectField`
- `switchField`
- `imageField`
- `saveBar`

Add or clarify:

- `formSection`
- `formArray`
- `reorderableTable` if list editing is table-like

Remove or split:

- `editableList` → replace with `formArray`, `reorderableTable`, or `resourceTable` with reorder actions.

### 6.6 Display primitives

Keep:

- `metricCard`
- `activityFeed`
- `kvList`
- `imageGallery`
- `emptyState`
- `loadingState`
- `inlineError`
- `previewFrame`

Remove, rename, or demote:

- `summaryCard` → replace with `panel` plus content or `metricCard`.
- `markdownBlock` → rename to `helpText` or `richText`, and avoid using it for core admin layout.
- `imageGrid` → probably merge into `imageGallery` with layout modes.

### 6.7 Surfaces

Keep:

- `modal`
- `drawer`
- `sheet`
- `detailPanel`
- `inlinePanel`
- `confirmDialog`

But improve the authoring model. Flow authors should not always have to choose raw modal/drawer/sheet. They should be able to request semantic surfaces such as:

- edit entity
- review change
- confirm delete
- inspect audit event

The renderer can choose drawer vs modal vs sheet based on viewport and policy.

## 7. Keep / Add / Remove Summary

### 7.1 Keep and strengthen

- `panel`
- `resourceTable`
- `resourceDetail`
- `form`
- `fieldGroup`
- typed fields
- `saveBar`
- `activityFeed`
- `previewFrame`
- `statusBadge`
- `metricCard`
- surfaces

### 7.2 Add

- `pageHeader`
- `dashboardGrid`
- `comparisonTable`
- `monthCalendar`
- `formSection`
- maybe `weekSchedule`
- maybe `diffBlock`
- richer shell/sidebar props
- explicit layout/density props
- stricter action placements

### 7.3 Remove or replace

- `section`
- `cardGrid`
- `summaryCard`
- `resourceList`
- `resourceRow`
- `editableList`
- `monthAvailabilityGrid`
- broad `diffView`
- maybe `splitPane`
- maybe `imageGrid`

### 7.4 Rename candidates

| v1 name | v2 direction | Reason |
| --- | --- | --- |
| `cardGrid` | `dashboardGrid` | The target use is dashboard/workbench layout, not generic cards. |
| `monthAvailabilityGrid` | `monthCalendar` | Availability is app-specific; calendar is generic. |
| `diffView` | `comparisonTable` + `diffBlock` | Operational review table and visual diff are different concepts. |
| `editableList` | `formArray` / `reorderableTable` | Editing arrays and reordering table rows are different operations. |
| `markdownBlock` | `helpText` / `richText` | Clarifies that it is support content, not structural page layout. |

## 8. Proposed v2 Page Shape

A v2 page should read like this:

```json
{
  "schemaVersion": 2,
  "id": "admin-intake-dashboard",
  "title": "Intake Admin",
  "shell": {
    "kind": "admin",
    "props": {
      "variant": "workbench",
      "density": "compact",
      "sidebar": {
        "active": "overview",
        "items": [],
        "user": { "name": "Admin User", "role": "Administrator" }
      }
    }
  },
  "nodes": [
    { "kind": "pageHeader", "props": {} },
    { "kind": "dashboardGrid", "props": {}, "children": [] }
  ],
  "surfaces": []
}
```

Note the intentional change: `schemaVersion: 2`. If no backwards compatibility is required, the renderer and server can reject v1 after cutover. That makes errors visible.

## 9. Workbench Shell Design

The shell should hold persistent admin navigation and account context. The shell is not a content widget.

### 9.1 JSON shape

```json
{
  "kind": "admin",
  "props": {
    "variant": "workbench",
    "density": "compact",
    "sidebar": {
      "active": "services",
      "logo": { "kind": "mark", "label": "Fringe" },
      "items": [
        {
          "id": "overview",
          "label": "Overview",
          "icon": "home",
          "action": { "type": "mutation", "target": "nav.overview", "label": "Overview" }
        },
        {
          "id": "services",
          "label": "Services",
          "icon": "grid",
          "action": { "type": "mutation", "target": "nav.services", "label": "Services" }
        }
      ],
      "user": {
        "name": "Admin User",
        "role": "Administrator",
        "initials": "AD"
      }
    }
  }
}
```

### 9.2 Renderer behavior

```tsx
function AdminPageFrame({ page, ctx }) {
  const shell = page.shell;
  if (shell.kind === "admin" && shell.props?.variant === "workbench") {
    return <WorkbenchShell page={page} ctx={ctx} />;
  }
  return <DefaultAdminPageFrame page={page} ctx={ctx} />;
}
```

The workbench shell should:

- render a persistent left sidebar on desktop;
- collapse to a drawer/top bar on mobile;
- dispatch sidebar item actions through the normal action system;
- highlight the active item;
- reserve page content width correctly;
- not require each page to manually render navigation.

## 10. Page Header Design

A page header should standardize title, breadcrumbs, description, and page-level actions.

### 10.1 JSON shape

```json
{
  "kind": "pageHeader",
  "props": {
    "breadcrumbs": ["Fringe", "Intake Admin"],
    "title": "Intake Admin",
    "description": "Review requests, draft config changes, and preview customer intake.",
    "actions": [
      {
        "type": "open",
        "target": "service.new",
        "label": "New Service",
        "intent": "primary",
        "priority": "primary",
        "presentation": "button",
        "placement": "pageHeader"
      }
    ]
  }
}
```

### 10.2 Renderer pseudocode

```tsx
function PageHeader({ node, ctx }) {
  const props = node.props ?? {};
  return (
    <header className="adminPageHeader">
      <Breadcrumbs items={props.breadcrumbs ?? []} />
      <div className="adminPageHeaderRow">
        <div>
          <h1>{props.title}</h1>
          {props.description && <p>{props.description}</p>}
        </div>
        <ActionGroup actions={props.actions ?? []} placement="pageHeader" dispatch={ctx.dispatch} />
      </div>
    </header>
  );
}
```

## 11. Dashboard Grid and Layout Policy

`dashboardGrid` replaces vague `cardGrid`. It should provide responsive, admin-oriented layout semantics.

### 11.1 JSON shape

```json
{
  "kind": "dashboardGrid",
  "props": {
    "columns": { "desktop": 12, "tablet": 8, "mobile": 1 },
    "gap": "compact",
    "density": "compact"
  },
  "children": [
    {
      "kind": "panel",
      "props": {
        "title": "Services",
        "layout": { "span": { "desktop": 8, "tablet": 8, "mobile": 1 }, "order": 20 }
      },
      "children": []
    }
  ]
}
```

### 11.2 Layout props

Every major child of `dashboardGrid` should support:

```json
{
  "layout": {
    "span": { "desktop": 4, "tablet": 4, "mobile": 1 },
    "order": 10,
    "minHeight": 180,
    "maxHeight": 520
  }
}
```

Use semantic spans, not arbitrary CSS classes. The backend says “this panel spans 8 of 12 columns on desktop.” The renderer decides CSS.

## 12. Panel Design

`panel` should become the core admin container.

### 12.1 Props

```json
{
  "title": "Phase 5 Services",
  "subtitle": "Manage service options in the current draft.",
  "eyebrow": "Config",
  "density": "compact",
  "padding": "none",
  "chrome": "card",
  "layout": { "span": { "desktop": 8, "mobile": 1 }, "order": 20 },
  "toolbarActions": [],
  "footerActions": []
}
```

### 12.2 Why panel is central

The target layout is made of panels. Each panel has consistent header/body/footer chrome, but different contents. One panel contains a table. Another contains a calendar. Another contains an activity feed. Another contains a preview frame.

This is better than making every component own its own card wrapper. Components should focus on their data and behavior; `panel` should own admin chrome.

## 13. Resource Table v2

`resourceTable` should become the canonical resource collection primitive.

### 13.1 Table shape

```json
{
  "kind": "resourceTable",
  "props": {
    "density": "compact",
    "rowId": "id",
    "columns": [
      { "id": "handle", "kind": "dragHandle", "width": 32 },
      { "id": "name", "label": "Service", "kind": "text", "primary": true, "accessor": "name" },
      { "id": "description", "label": "Description", "kind": "text", "tone": "muted", "accessor": "description" },
      { "id": "status", "label": "Status", "kind": "badge", "accessor": "status", "map": {
        "published": { "label": "Published", "tone": "success" },
        "draftChanges": { "label": "Draft Changes", "tone": "warning" }
      }},
      { "id": "actions", "label": "Actions", "kind": "overflowActions" }
    ],
    "rows": [
      {
        "id": "svc_highlights",
        "name": "Highlights",
        "description": "Partial · full · balayage · sort 20",
        "status": "published",
        "actions": [
          { "type": "open", "target": "service.edit", "label": "Edit", "payload": { "id": "svc_highlights" } }
        ]
      }
    ],
    "footerActions": [
      { "type": "open", "target": "service.new", "label": "Add new service", "presentation": "button" }
    ]
  }
}
```

### 13.2 Column kinds

Start with these column kinds:

- `dragHandle`
- `text`
- `number`
- `money`
- `date`
- `relativeTime`
- `badge`
- `boolean`
- `actions`
- `overflowActions`

Do not add a generic `customComponent` column. If a real use case appears, add a semantic column kind.

### 13.3 Mobile behavior

The backend should still emit `resourceTable`. The renderer can collapse it on mobile.

```text
Desktop:
  table columns: Service | Description | Status | Actions

Mobile:
  stacked row cards:
    Highlights
    Partial · full · balayage · sort 20
    [Published]        [...]
```

This is why `resourceList` and `resourceRow` can likely be removed.

## 14. Comparison Table v2

A `comparisonTable` is a review queue, not a decorative diff.

### 14.1 JSON shape

```json
{
  "kind": "comparisonTable",
  "props": {
    "density": "compact",
    "rowId": "id",
    "rows": [
      {
        "id": "change_highlights_price",
        "field": "Highlights – Price",
        "current": "$200–$350",
        "draft": "$220–$380",
        "scheduled": "Jun 23",
        "tone": "warning",
        "actions": [
          { "type": "open", "target": "draft.review", "label": "Review", "payload": { "id": "change_highlights_price" } }
        ]
      }
    ]
  }
}
```

### 14.2 Why not `diffView`?

A visual diff asks: “What text changed?”

A comparison table asks: “What operational changes must an admin review?”

Those are different concepts. In v2, use:

- `comparisonTable` for row-based admin review.
- `diffBlock` for long text/blob before-after display, if needed.

## 15. Calendar v2

The v1 `monthAvailabilityGrid` is too app-specific. The target layout needs `monthCalendar`.

### 15.1 JSON shape

```json
{
  "kind": "monthCalendar",
  "props": {
    "month": "2024-06",
    "selectedDate": "2024-06-19",
    "today": "2024-06-16",
    "markers": [
      { "date": "2024-06-17", "kind": "published" },
      { "date": "2024-06-23", "kind": "scheduled" }
    ],
    "legend": [
      { "kind": "published", "label": "Published", "tone": "success" },
      { "kind": "scheduled", "label": "Scheduled", "tone": "warning" }
    ],
    "actions": {
      "previousMonth": { "type": "mutation", "target": "calendar.previous" },
      "nextMonth": { "type": "mutation", "target": "calendar.next" },
      "selectDate": { "type": "mutation", "target": "calendar.selectDate" }
    }
  }
}
```

### 15.2 Calendar cell derivation

The backend does not need to send all visible calendar cells. It can send month and markers; the frontend can derive the 6-week grid.

```ts
function buildMonthCells(month: string): CalendarCell[] {
  const first = startOfMonth(parseMonth(month));
  const start = startOfWeek(first);
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const date = addDays(start, i);
    cells.push({
      date: toISODate(date),
      day: date.getDate(),
      inMonth: sameMonth(date, first),
    });
  }

  return cells;
}
```

## 16. Forms v2

Forms should be stricter. A backend flow should be able to trust the value shape it receives.

### 16.1 Field requirements

Every field should have:

- `name`
- `label`
- `value` of the correct type
- optional `required`
- optional `helpText`
- optional `errors`

### 16.2 Field value shapes

| Field | v2 value shape |
| --- | --- |
| `textField` | string |
| `textareaField` | string |
| `moneyField` | structured money or integer cents; choose one and enforce it |
| `durationField` | integer minutes or ISO duration; choose one and enforce it |
| `dateField` | `YYYY-MM-DD` string |
| `timeField` | `HH:mm` string |
| `selectField` | one option value, or array for explicit multi-select |
| `switchField` | boolean |
| `imageField` | image/upload reference object |

### 16.3 Form submit pseudocode

```tsx
function collectFormValue(form: HTMLFormElement, schema: FieldSchema[]): Record<string, unknown> {
  const value = {};

  for (const field of schema) {
    switch (field.kind) {
      case "switchField":
        value[field.name] = readCheckboxBoolean(form, field.name);
        break;
      case "moneyField":
        value[field.name] = parseMoney(form.elements[field.name].value);
        break;
      case "selectField":
        value[field.name] = readSelectValue(form, field.name, field.multiple);
        break;
      default:
        value[field.name] = readString(form, field.name);
    }
  }

  return value;
}
```

Do not keep text fallbacks for typed controls in v2.

## 17. Actions v2

The action model is one of the strongest parts of the current DSL. Keep it, but tighten placement and presentation.

### 17.1 Existing idea

An action is a declarative descriptor that the backend binds to an opaque callback ID.

```json
{
  "id": "act_123",
  "type": "mutation",
  "target": "service.update",
  "label": "Save",
  "intent": "primary",
  "presentation": "button",
  "placement": "formFooter"
}
```

The browser dispatches the action ID. It does not choose which backend function to run.

### 17.2 Proposed placements

Add or clarify:

- `pageHeader`
- `panelToolbar`
- `panelFooter`
- `row`
- `rowOverflow`
- `bulkToolbar`
- `formFooter`
- `calendarCell`
- `sidebarNav`

### 17.3 Placement vs presentation

In v2:

- `placement` answers: **where does this action live?**
- `presentation` answers: **what visual control should represent it?**

Example:

```json
{
  "placement": "rowOverflow",
  "presentation": "menuItem"
}
```

Do not let these overlap ambiguously. A row overflow action should not render as a giant primary button just because `presentation` says `button`. The renderer should have placement-aware constraints.

## 18. Surfaces v2

Surfaces are good and should remain explicit, but authoring should become more semantic.

### 18.1 Raw surface nodes

Keep raw nodes for renderer primitives:

- `modal`
- `drawer`
- `sheet`
- `detailPanel`
- `inlinePanel`
- `confirmDialog`

### 18.2 Semantic surface helpers

Expose helpers to flows:

```js
surface.editEntity({
  title: "Edit service",
  entity: "service",
  preferred: "drawer",
  mobile: "sheet",
  content: serviceForm(...)
});

surface.reviewChange({
  title: "Review price change",
  preferred: "modal",
  content: comparisonDetail(...)
});

surface.confirmDelete({
  title: "Delete service?",
  body: "This cannot be undone.",
  confirmAction: deleteAction
});
```

The output is still plain JSON. The helper simply chooses the correct surface node shape.

## 19. Validation v2

Validation should become strict enough that malformed pages fail at backend render time, not during manual UI review.

### 19.1 Page validation

Rules:

- `schemaVersion` must equal `2`.
- `id` must be non-empty.
- `title` must be non-empty.
- `shell.kind` must be known.
- every node kind must be known.
- deprecated v1 node kinds must fail.

### 19.2 Node validation examples

`pageHeader`:

- `title` required.
- `breadcrumbs` must be string array if present.
- `actions` must be valid actions if present.

`dashboardGrid`:

- `columns.desktop` must be positive.
- child layout spans must be within column range.

`panel`:

- `title` should be required unless panel has `ariaLabel` or a deliberate `chromeless` mode.
- `density` must be one of known tokens.

`resourceTable`:

- `columns` required and non-empty.
- `rows` required, even if empty.
- each row must have stable ID based on `rowId`.
- action columns must point to valid actions.

`comparisonTable`:

- rows required.
- each row requires `id`, `field`, `current`, `draft`.
- actions must be valid actions if present.

`form`:

- fields require `name` and `label`.
- field values must match field type.

### 19.3 Validator pseudocode

```go
func ValidatePageV2(page Page) error {
    if page.SchemaVersion != 2 {
        return fmt.Errorf("admin DSL v2 requires schemaVersion=2")
    }
    if page.ID == "" || page.Title == "" {
        return fmt.Errorf("page id and title are required")
    }
    for _, node := range page.Nodes {
        if err := validateNodeV2(node); err != nil {
            return err
        }
    }
    return nil
}

func validateNodeV2(node Node) error {
    switch node.Kind {
    case NodePageHeader:
        return validatePageHeader(node)
    case NodeDashboardGrid:
        return validateDashboardGrid(node)
    case NodePanel:
        return validatePanel(node)
    case NodeResourceTable:
        return validateResourceTable(node)
    default:
        return fmt.Errorf("unsupported admin DSL v2 node kind %q", node.Kind)
    }
}
```

## 20. Schema Version Cutover

Because backwards compatibility is not required, use a clean cutover.

### 20.1 Proposed rule

- Admin DSL v2 pages use `schemaVersion: 2`.
- The v2 renderer rejects v1 pages.
- The v2 backend validator rejects v1 pages.
- Existing flows must be migrated before cutover is considered complete.

### 20.2 Cutover pseudocode

```tsx
function renderAdminPage(page: AdminPage) {
  if (page.schemaVersion !== 2) {
    throw new Error(`Unsupported Admin DSL schemaVersion ${page.schemaVersion}`);
  }
  return <AdminPageFrame page={page} />;
}
```

```go
func ValidatePage(page Page) error {
    if page.SchemaVersion != 2 {
        return fmt.Errorf("unsupported Admin DSL schema version %d", page.SchemaVersion)
    }
    return ValidatePageV2(page)
}
```

## 21. Implementation Plan

This plan assumes a clean cutover with focused commits.

### Phase 1: Freeze the v2 vocabulary

Deliverable: one short schema decision note or checklist.

Tasks:

- Confirm final names for:
  - `pageHeader`
  - `dashboardGrid`
  - `comparisonTable`
  - `monthCalendar`
  - `formSection`
  - `diffBlock` if needed
- Confirm removal list.
- Confirm action placement enum.
- Confirm whether `surfaces` replaces `modals`/`drawers` arrays or whether those stay for now.

### Phase 2: Update TypeScript schema and renderer first

Files:

- `web/src/admin-dsl/schema.ts`
- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/renderUtils.ts`
- `web/src/admin-dsl/calendar.tsx`

Tasks:

- Bump schema type expectation to `2`.
- Remove deprecated node kinds from TypeScript union.
- Add new node kinds.
- Add renderer cases.
- Add strict rendering error for unknown kinds.
- Implement workbench shell rendering.
- Implement target workbench Storybook fixture.

Validation:

```bash
cd web && npx tsc --noEmit
cd web && pnpm test -- --runInBand
```

### Phase 3: Update Go schema, builders, and Goja exports

Files:

- `pkg/admindsl/types.go`
- `pkg/admindsl/builder.go`
- `pkg/admindsl/goja_module.go`
- `pkg/admindsl/validate.go`
- `pkg/admindsl/*_test.go`

Tasks:

- Set new pages to `schemaVersion: 2`.
- Remove constants for deprecated node kinds.
- Add constants for new node kinds.
- Add builder helpers.
- Add Goja exports.
- Add strict validation.
- Update tests.

Validation:

```bash
go test ./pkg/admindsl -count=1
```

### Phase 4: Migrate Admin flow JS

Files:

- `pkg/admindsl/flows/services.flow.js`
- `pkg/admindsl/flows/intake_admin.flow.js`
- `pkg/admindsl/flows/intake_requests.flow.js`
- `pkg/admindsl/flows/intake_config.flow.js`
- `pkg/admindsl/flows/intake_ops.flow.js`

Tasks:

- Replace `section` with `panel`, `pageHeader`, or `formSection`.
- Replace `cardGrid` with `dashboardGrid`.
- Replace `summaryCard` with `metricCard` or `panel`.
- Replace `resourceList`/`resourceRow` with `resourceTable`.
- Replace `editableList` with typed table/form primitives.
- Replace `monthAvailabilityGrid` with `monthCalendar`.
- Replace `diffView` with `comparisonTable` or `diffBlock`.
- Update shell props to workbench shell.
- Update action placements.

Validation:

```bash
go test ./pkg/admindsl ./pkg/server -count=1
go test ./... -count=1
```

### Phase 5: Update Storybook and visual review

Files:

- `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`
- Existing Admin DSL stories as needed.

Tasks:

- Add v2 target desktop story.
- Add v2 target mobile story.
- Update existing stories to v2 or remove obsolete v1 stories.
- Capture visual screenshots.

Validation:

```bash
cd web && npx tsc --noEmit
cd web && pnpm test -- --runInBand
```

### Phase 6: Live smoke

Run the live admin smoke after `/admin/intake` migrates:

```bash
node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs
```

## 22. API Reference

### 22.1 Admin DSL HTTP API

Start flow:

```http
POST /api/admin-dsl/flows/{flowId}/start
```

Known flow IDs:

- `fringe.admin.services.v1`
- `fringe.admin.intake.v1`

Get current session page:

```http
GET /api/admin-dsl/flows/{sessionId}
```

Dispatch action event:

```http
POST /api/admin-dsl/flows/{sessionId}/events
Content-Type: application/json

{
  "eventId": "uuid",
  "pageVersion": 7,
  "actionId": "act_...",
  "value": {}
}
```

### 22.2 Runtime action lifecycle

```text
JS flow creates action descriptor
        |
        v
ctx.bind(action, callback)
        |
        v
Runtime assigns opaque action ID and stores callback
        |
        v
Page JSON sent to browser
        |
        v
User clicks button/menu/calendar cell/form submit
        |
        v
Browser posts sessionId + pageVersion + actionId + value
        |
        v
Runtime checks page version and invokes callback
        |
        v
Callback returns next AdminPage
```

### 22.3 Host module boundary

Generic Admin DSL should not know how to publish config versions or update intake requests. Those operations belong to app-owned host modules.

Example app host functions:

```js
const intakeAdmin = require("host/intake-admin");

intakeAdmin.dashboardStats();
intakeAdmin.listRequests(filters);
intakeAdmin.getRequest(id);
intakeAdmin.updateRequestStatus(id, status, note);
intakeAdmin.getConfigEditor(configVersionId);
intakeAdmin.updateServiceOption(input);
intakeAdmin.publishConfigVersion(id);
intakeAdmin.listAuditEvents(limit);
```

Generic Admin DSL should provide controls that can trigger these actions, not implement their business logic.

## 23. Testing Matrix

| Layer | What to test | Command |
| --- | --- | --- |
| Go builders | New node builders emit correct JSON. | `go test ./pkg/admindsl -count=1` |
| Go validator | Invalid v2 pages fail early. | `go test ./pkg/admindsl -count=1` |
| Goja module | JS can call new `admin.*` helpers. | `go test ./pkg/admindsl -count=1` |
| Server | Admin flows start and dispatch. | `go test ./pkg/server -count=1` |
| Frontend schema | TS accepts v2 pages and rejects stale assumptions. | `cd web && npx tsc --noEmit` |
| Renderer | New nodes render and dispatch actions. | `cd web && pnpm test -- --runInBand` |
| Storybook | Target workbench fixture is visually reviewable. | `cd web && pnpm storybook` |
| Live smoke | Customer submit appears in admin review. | `node ttmp/.../scripts/03-smoke-admin-intake-phase8.mjs` |

## 24. Migration Examples

### 24.1 Section to panel

Before:

```js
admin.section("Draft Changes", {}, admin.diffView(...))
```

After:

```js
admin.panel("Draft Changes", { density: "compact", layout: { span: { desktop: 12, mobile: 1 } } },
  admin.comparisonTable({ rows: draftChangeRows })
)
```

### 24.2 Card grid to dashboard grid

Before:

```js
admin.cardGrid({ columns: 3 },
  admin.metricCard("Requests", stats.total),
  admin.metricCard("Pending", stats.pending)
)
```

After:

```js
admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
  admin.metricCard("Requests", stats.total, { layout: { span: { desktop: 4, mobile: 1 } } }),
  admin.metricCard("Pending", stats.pending, { layout: { span: { desktop: 4, mobile: 1 } } })
)
```

### 24.3 Resource list to resource table

Before:

```js
admin.resourceList({
  items: services.map(service => admin.resourceRow(...))
})
```

After:

```js
admin.resourceTable({
  rowId: "id",
  density: "compact",
  columns: serviceColumns,
  rows: serviceRows,
  footerActions: [addServiceAction]
})
```

### 24.4 Diff view to comparison table

Before:

```js
admin.diffView({ current: currentConfig, draft: draftConfig })
```

After:

```js
admin.comparisonTable({
  rows: [
    { id: "price", field: "Highlights – Price", current: "$200–$350", draft: "$220–$380", scheduled: "Jun 23", actions: [reviewAction] }
  ]
})
```

## 25. Common Pitfalls

### Pitfall 1: Recreating v1 under new names

Do not simply rename `cardGrid` to `dashboardGrid` without adding layout semantics. The goal is not cosmetic renaming. The goal is stricter admin intent.

### Pitfall 2: Keeping vague escape hatches

Avoid generic custom component nodes. If a page needs a new component, ask what admin concept it represents and add that concept explicitly.

### Pitfall 3: Letting app-specific concepts leak into generic Admin DSL

`monthCalendar` is generic. `salonAvailabilityDraftCalendar` is not. Keep app-specific mapping in flow JS and host modules.

### Pitfall 4: Making flows specify CSS

Flows should specify density, span, order, tone, and semantic layout policy. They should not specify arbitrary class names and pixel-perfect CSS.

### Pitfall 5: Forgetting Storybook

Every new primitive should have a story. Storybook is the cheapest place to review layout semantics before touching live backend flows.

## 26. Suggested First Implementation Slice

A good first intern slice is:

> Implement Admin DSL v2 page shell basics in Storybook: `schemaVersion: 2`, `pageHeader`, `dashboardGrid`, structured `panel` layout props, and workbench shell sidebar rendering.

Scope:

- TypeScript schema only.
- React renderer only.
- Storybook fixture only.
- No backend flow migration yet.

Why this slice is good:

- It proves the visual and semantic direction quickly.
- It avoids breaking live `/admin/intake` while the renderer model is still being shaped.
- It creates a concrete target for Go builders and flow migration.

Acceptance criteria:

- `AdminDslWorkbench.stories.tsx` has desktop and mobile target stories.
- Page uses `schemaVersion: 2`.
- Page renders workbench shell/sidebar.
- Page renders page header and dashboard grid.
- Existing frontend tests pass.

## 27. Final Recommendation

Admin DSL v2 should be a clean cut. Do not keep deprecated node aliases. Do not keep legacy frontend-inspired primitives just because they are already implemented. The current code has taught us what the real abstractions should be.

The strongest v2 core is:

```text
Page
  Shell(workbench)
  PageHeader
  DashboardGrid
    Panel
      MetricCard | ResourceTable | ComparisonTable | MonthCalendar | ActivityFeed | PreviewFrame | Form
  Surfaces
    EditEntity | ReviewChange | ConfirmDelete | InspectAudit
```

That vocabulary is small enough to validate, clear enough for backend flows, and expressive enough for the dense admin layout direction. It lets the renderer produce beautiful UI without forcing backend code to think in React component details.

## 28. Appendix: Validation Commands

Run these after frontend-only v2 changes:

```bash
cd web && npx tsc --noEmit
cd web && pnpm test -- --runInBand
```

Run these after Go schema/runtime changes:

```bash
go test ./pkg/admindsl -count=1
go test ./pkg/admindsl ./pkg/server -count=1
go test ./... -count=1
```

Run this after live `/admin/intake` migration:

```bash
node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs
```

## 29. Appendix: Checklist for Code Review

When reviewing an Admin DSL v2 change, ask:

- Does this node represent an admin concept, or only a visual component?
- Is the JSON shape stable and transport-safe?
- Is the same shape present in Go and TypeScript?
- Does validation catch missing required props?
- Does the renderer handle mobile collapse?
- Does every action dispatch through opaque backend action IDs?
- Does the change keep app-specific behavior outside generic Admin DSL?
- Is there Storybook coverage?
- Is there at least one test for rendering or builder behavior?
- Did we remove obsolete v1 usage instead of adding compatibility shims?

