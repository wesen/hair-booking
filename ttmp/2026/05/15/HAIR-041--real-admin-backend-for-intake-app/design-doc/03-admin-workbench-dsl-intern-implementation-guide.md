---
Title: Admin Workbench DSL Intern Implementation Guide
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
    - Path: pkg/admindsl/script_runtime.go
      Note: Admin DSL Goja runtime and action-binding architecture referenced by the guide
    - Path: pkg/admindsl/types.go
      Note: Go Admin DSL schema and node/action vocabulary referenced by the guide
    - Path: pkg/server/handlers_admin_dsl.go
      Note: Admin DSL HTTP transport and flow registry referenced by the guide
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/01-target-efficient-admin-layout.png
      Note: Target dense admin workbench screenshot analyzed in the intern guide
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/02-current-original-admin-layout.png
      Note: Current/original admin layout screenshot compared in the intern guide
    - Path: web/src/admin-dsl/render.tsx
      Note: React Admin DSL interpreter referenced for implementation work
    - Path: web/src/admin-dsl/schema.ts
      Note: TypeScript Admin DSL schema referenced by the guide
ExternalSources: []
Summary: A detailed intern-oriented analysis, design, and implementation guide for evolving the Fringe Admin DSL from spacious frontend-style widgets into dense workbench-style admin pages.
LastUpdated: 2026-05-16T17:55:00-04:00
WhatFor: Use this as the onboarding and implementation guide for building the next Admin Workbench DSL primitives, renderer support, Storybook fixtures, and backend flow adoption.
WhenToUse: Read before changing Admin DSL schema, Go builders, Goja modules, frontend renderer layout primitives, /admin/intake flow screens, or visual regression coverage.
---


# Admin Workbench DSL Intern Implementation Guide

## 0. Purpose of This Guide

This guide explains how the Fringe Admin DSL system works today, why the current layouts are inefficient for real admin work, and how to implement the next layer: an **Admin Workbench DSL** for dense, operational back-office pages. It is written for a new intern who is capable of reading Go, TypeScript, React, and JavaScript, but who has not yet built mental models for this project.

By the end, you should understand five things:

1. How backend JavaScript flows produce Admin DSL JSON pages.
2. How Go hosts those flows, validates pages, binds actions, and serves them over HTTP.
3. How React receives Admin DSL JSON and renders it explicitly through typed components.
4. What is visually different between the current Admin DSL layout and the target workbench layout.
5. What schema, renderer, builder, Storybook, and flow changes are needed to describe target-style pages declaratively.

The important architectural principle is this: **the backend owns admin intent; the frontend interprets that intent through a stable declarative DSL.** We do not want backend flows to emit React components, HTML strings, or arbitrary frontend component names. We want them to emit plain JSON that says, in effect, “this is a workbench page with a sidebar, a header, three KPI cards, a service table, a calendar, a draft-change comparison table, an activity feed, and a preview panel.”

## 1. Visual References in This Ticket

Two images were copied into the HAIR-041 ticket. They are the visual anchors for this guide.

### 1.1 Target Efficient Admin Layout

![Target efficient admin layout](../various/design-reference/01-target-efficient-admin-layout.png)

Path:

- `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/01-target-efficient-admin-layout.png`

This is the target direction. It is dense, structured, and clearly an admin workbench rather than a customer-facing or marketing-style screen.

### 1.2 Current Original Admin Layout

![Current original admin layout](../various/design-reference/02-current-original-admin-layout.png)

Path:

- `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/02-current-original-admin-layout.png`

This is the current layout as of the screenshot. It is visually coherent, but it spends too much space on large cards and single-column stacking. That style is acceptable for guided frontend flows; it is inefficient for daily admin operations.

## 2. The System in One Page

Before we discuss layout primitives, you need the system map. The Admin DSL has four main layers.

```text
+-------------------------------+
| Goja Admin Flow JavaScript    |
| pkg/admindsl/flows/*.flow.js  |
|                               |
| Calls:                        |
|   const admin = require(...)  |
|   const intakeAdmin = require |
+---------------+---------------+
                |
                | plain page object + bound actions
                v
+-------------------------------+
| Go Admin DSL Runtime          |
| pkg/admindsl/script_runtime.go|
| pkg/server/handlers_admin...  |
|                               |
| Responsibilities:             |
|   - load embedded JS flows     |
|   - resolve relative require   |
|   - expose Go host modules     |
|   - bind callbacks to actions  |
|   - validate page JSON         |
|   - serve protobuf JSON HTTP   |
+---------------+---------------+
                |
                | /api/admin-dsl/flows/... JSON
                v
+-------------------------------+
| React Admin DSL Client        |
| web/src/admin-dsl/...         |
|                               |
| Responsibilities:             |
|   - start/resume sessions      |
|   - dispatch action IDs        |
|   - render JSON explicitly     |
|   - collect form values        |
+---------------+---------------+
                |
                | DOM/CSS
                v
+-------------------------------+
| Browser Admin App             |
| Routes:                       |
|   /admin/services             |
|   /admin/intake               |
+-------------------------------+
```

The key boundary is the JSON page object. The backend does not send React code. The frontend does not invent behavior for backend mutations. The page is a contract.

## 3. Current Files You Need to Know

Start with these files. Do not try to understand the whole repository at once.

### 3.1 Admin DSL Schema and Builders

| File | Why it matters |
| --- | --- |
| `pkg/admindsl/types.go` | Go representation of Admin DSL JSON: page, shell, node kinds, actions, metadata. |
| `pkg/admindsl/builder.go` | Go fluent builder helpers for constructing Admin DSL pages and nodes. |
| `pkg/admindsl/goja_module.go` | Exposes Admin DSL builders into Goja so JS flows can call `admin.*`. |
| `pkg/admindsl/validate.go` | Validates Admin DSL pages before returning them to clients. |
| `web/src/admin-dsl/schema.ts` | TypeScript mirror of Admin DSL schema used by React renderer and tests. |
| `web/src/admin-dsl/builder.ts` | Frontend builder helpers used mainly for fixtures and Storybook. |

The Go and TypeScript schemas should evolve together. If you add a new node kind in Go but not in TypeScript, the frontend cannot type or render it. If you add it only in TypeScript, backend flows cannot emit it safely.

### 3.2 Admin DSL Runtime and Server

| File | Why it matters |
| --- | --- |
| `pkg/admindsl/script_runtime.go` | The Goja runtime for admin flows. Handles flow sessions, action binding, page versions, relative embedded `require("./...")`, and dispatch. |
| `pkg/admindsl/flows.go` | Embeds JS flow files and now centralizes intake admin helper module registration. |
| `pkg/server/handlers_admin_dsl.go` | HTTP handlers for Admin DSL flow start/get/event endpoints and server-side flow registry. |
| `proto/fringe/admin_dsl/v1/admin_dsl.proto` | Protobuf transport contract for Admin DSL flow responses/errors. |
| `gen/proto/fringe/admin_dsl/v1/admin_dsl.pb.go` | Generated Go protobuf types. |
| `web/src/pb/proto/fringe/admin_dsl/v1/admin_dsl_pb.ts` | Generated TypeScript protobuf types. |

### 3.3 Current Admin Intake Flow Modules

| File | Role |
| --- | --- |
| `pkg/admindsl/flows/intake_admin.flow.js` | Root `/admin/intake` flow router/dashboard orchestration. |
| `pkg/admindsl/flows/intake_requests.flow.js` | Request queue, request detail, and photo review modal. |
| `pkg/admindsl/flows/intake_config.flow.js` | Config editor screen orchestration and mutation callbacks. |
| `pkg/admindsl/flows/intake_config_helpers.flow.js` | Config row mapping/parsing helpers. |
| `pkg/admindsl/flows/intake_config_forms.flow.js` | Config drawer/form builders and validation helpers. |
| `pkg/admindsl/flows/intake_ops.flow.js` | Audit screen, health screen, and preview screen. |

These files are embedded in Go. Relative `require("./...")` works only for registered embedded virtual files. There is no arbitrary filesystem access from flows.

### 3.4 React Admin DSL Renderer

| File | Role |
| --- | --- |
| `web/src/admin-dsl/render.tsx` | Main explicit interpreter from Admin DSL nodes to React DOM. This is where new node kinds are rendered. |
| `web/src/admin-dsl/calendar.tsx` | Calendar-specific rendering helpers. |
| `web/src/admin-dsl/actions.ts` | Action event utilities. |
| `web/src/admin-dsl/renderUtils.ts` | Rendering helper functions. |
| `web/src/admin-dsl/BackendAdminDslPage.tsx` | Live backend Admin DSL page client. Starts flow sessions, sends events, renders pages. |
| `web/src/admin-dsl/backendClient.ts` | HTTP client for Admin DSL endpoints. |
| `web/src/admin-dsl/*.stories.tsx` | Storybook coverage for rendered pages, surfaces, data components, advanced components, layouts, and live backend. |
| `web/src/admin-dsl/*.test.tsx` | Unit/integration tests for renderer and backend page client. |

The renderer is intentionally explicit. Avoid dynamic component lookup by arbitrary string. A new DSL node kind should have a clear branch in the renderer, a type/schema entry, tests, and Storybook examples.

### 3.5 Intake Admin Persistence and Host Modules

| File | Role |
| --- | --- |
| `pkg/intakeadmin/schema.sql` | App-owned SQLite schema for requests, request events, admin audit, and admin flow sessions. |
| `pkg/intakeadmin/store.go` | Store methods for requests, config versions, mutations, audit events, and health diagnostics. |
| `pkg/intakeadmin/store_test.go` | Persistence tests. |
| `pkg/server/host_intake_admin_module.go` | Goja host module exposed as `require("host/intake-admin")`. |
| `pkg/server/host_intake_module.go` | Customer intake host module exposed as `require("host/intake")`. |

The generic Admin DSL does not own the application database schema. App-specific storage and mutation semantics live in `pkg/intakeadmin` and server host modules.

## 4. What the Current DSL Already Supports

The current Admin DSL schema already has useful primitives. In `web/src/admin-dsl/schema.ts` and `pkg/admindsl/types.go`, the node vocabulary includes:

- Layout:
  - `section`
  - `toolbar`
  - `cardGrid`
  - `panel`
  - `splitPane`
  - `tabs`
- Advanced admin-ish components:
  - `editableList`
  - `monthAvailabilityGrid`
  - `previewFrame`
  - `diffView`
- Display:
  - `metricCard`
  - `summaryCard`
  - `statusBadge`
  - `activityFeed`
  - `kvList`
  - `imageGrid`
  - `imageGallery`
  - `markdownBlock`
  - `emptyState`
  - `loadingState`
  - `inlineError`
- Resource/list:
  - `resourcePage`
  - `resourceList`
  - `resourceTable`
  - `resourceRow`
  - `resourceDetail`
  - `filterBar`
  - `searchBox`
  - `actionMenu`
- Forms:
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
- Calendar:
  - `calendarWeek`
  - `appointmentBlock`
  - `availabilityBlock`
  - `timeOffBlock`
- Surfaces:
  - `modal`
  - `drawer`
  - `sheet`
  - `detailPanel`
  - `inlinePanel`
  - `confirmDialog`

The problem is not that the DSL has no components. The problem is that many components are still too close to frontend page widgets, not admin workbench semantics. A customer-facing frontend can afford large cards, large whitespace, and step-by-step storytelling. An admin page must compress and structure information so the operator can scan and act.

## 5. Detailed Visual Analysis: Target Layout

This section reads the first screenshot directly. The target is titled `ADVANCED COMPONENT MATRIX`. It uses a beige/off-white background, a left sidebar, and a content grid.

### 5.1 Persistent Left Sidebar

The left sidebar has a logo mark at top, then a vertical navigation menu. Items have icons and labels. The active item, `Overview`, has a filled/raised background. At the bottom, there is a user account card with initials, name, role, and a small control indicator.

This sidebar is not a component inside the page body. It is an app shell primitive. Every admin page in this family should share it so users can move between overview, services, calendar, drafts, media, settings, and activity without losing context.

Needed DSL concept:

```json
{
  "shell": {
    "kind": "admin",
    "props": {
      "variant": "workbench",
      "density": "compact",
      "sidebar": {
        "active": "overview",
        "items": [
          { "id": "overview", "label": "Overview", "icon": "home", "target": "nav.overview" },
          { "id": "services", "label": "Services", "icon": "grid", "target": "nav.services" }
        ],
        "user": { "name": "Admin User", "role": "Administrator", "initials": "AD" }
      }
    }
  }
}
```

### 5.2 Page Header

The header has three parts:

- Breadcrumb: `ADMIN DSL / ADVANCED COMPONENTS`.
- Large title: `ADVANCED COMPONENT MATRIX`.
- Description: `All Phase 5 primitives on one page for screenshot and responsive review.`
- Right-aligned primary action: `+ New Service`.

The current page has a title and some pills, but the target is more formal. A page header should be a standard node or page-level prop. It should not be rebuilt with ad-hoc sections every time.

Needed DSL concept:

```json
{
  "kind": "pageHeader",
  "props": {
    "breadcrumbs": ["Admin DSL", "Advanced Components"],
    "title": "Advanced Component Matrix",
    "description": "All Phase 5 primitives on one page for screenshot and responsive review.",
    "actions": [
      { "type": "open", "target": "service.new", "label": "New Service", "intent": "primary", "presentation": "button" }
    ]
  }
}
```

### 5.3 KPI Cards

Below the header, there are three compact cards:

- `Total Services` with value `24` and caption `3 draft changes`.
- `Upcoming Changes` with value `2` and caption `Next: Jun 23`.
- `Last Published` with value `Jun 19` and caption `Highlights updated`.

These are not large feature cards. They are summary indicators. The existing `metricCard` can probably support this with better density, grid placement, icon slot, and tone tokens.

Needed DSL concept:

```json
{
  "kind": "metricStrip",
  "props": {
    "density": "compact",
    "items": [
      { "label": "Total Services", "value": 24, "caption": "3 draft changes" },
      { "label": "Upcoming Changes", "value": 2, "caption": "Next: Jun 23", "icon": "calendar", "tone": "warning" },
      { "label": "Last Published", "value": "Jun 19", "caption": "Highlights updated", "icon": "check", "tone": "success" }
    ]
  }
}
```

Alternative: avoid `metricStrip` and use a `dashboardGrid` row of `metricCard` nodes. That is simpler, but slightly more verbose for flows.

### 5.4 Services Table Panel

The target `Phase 5 Services` panel uses a table. Each row is compact and has:

- Drag/reorder handle.
- Service title.
- Description.
- Status chip.
- Overflow action button.

There is also an inline footer button: `+ Add new service`.

This is a major shift from the current layout, where services are large cards with title, description, and an `Edit` button. The table form is better for admins because it allows comparison across rows and uses less vertical space.

Needed DSL concept:

```json
{
  "kind": "resourceTable",
  "props": {
    "density": "compact",
    "columns": [
      { "id": "handle", "kind": "dragHandle", "width": 32 },
      { "id": "title", "label": "Service", "kind": "text", "primary": true },
      { "id": "description", "label": "Description", "kind": "text", "tone": "muted" },
      { "id": "status", "label": "Status", "kind": "badge", "map": { "published": "success", "draftChanges": "warning" } },
      { "id": "actions", "label": "Actions", "kind": "overflowActions" }
    ],
    "rows": [
      { "id": "cut", "title": "Cut", "description": "Trim · restyle · bangs · sort 10", "status": "published" }
    ],
    "footerActions": [
      { "type": "open", "target": "service.new", "label": "Add new service", "presentation": "button" }
    ]
  }
}
```

### 5.5 Month Calendar Panel

The target calendar is a true month view. It has month navigation, weekday headers, out-of-month days, selected day, scheduled day highlighting, published markers, and a legend.

The current layout has date tiles from the availability component. That can show important dates, but it does not give enough month context. Admin scheduling usually needs context: what week is this, what dates are already published, what changes are scheduled, and what date am I reviewing?

Needed DSL concept:

```json
{
  "kind": "monthCalendar",
  "props": {
    "month": "2024-06",
    "selectedDate": "2024-06-19",
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

### 5.6 Draft Changes Comparison Table

The target `Draft Changes` section is a full-width table with columns:

- Field
- Current
- Draft
- Scheduled
- Actions

Each row has a `Review` button. This is different from a decorative diff. It is a review queue. Each row is an item the admin can inspect and approve, edit, or discard.

Needed DSL concept:

```json
{
  "kind": "comparisonTable",
  "props": {
    "density": "compact",
    "columns": ["field", "current", "draft", "scheduled", "actions"],
    "rows": [
      {
        "id": "highlights-price",
        "field": "Highlights – Price",
        "current": "$200–$350",
        "draft": "$220–$380",
        "scheduled": "Jun 23",
        "actions": [
          { "type": "open", "target": "draft.review", "label": "Review", "payload": { "id": "highlights-price" } }
        ]
      }
    ]
  }
}
```

### 5.7 Recent Activity Feed

The target includes recent activity at the bottom. Each item has an icon, title, detail, time, and actor. This is a summary view of the audit log. Since HAIR-041 already added audit events and an audit screen, the dashboard should probably show recent audit events here.

Needed DSL concept:

```json
{
  "kind": "activityFeed",
  "props": {
    "density": "compact",
    "items": [
      {
        "id": "evt-1",
        "icon": "price",
        "tone": "warning",
        "title": "Highlights updated",
        "detail": "Price changed from $200–$350 to $220–$380",
        "time": "2m ago",
        "actor": "Admin User"
      }
    ],
    "footerAction": { "type": "navigate", "target": "audit", "label": "View all activity" }
  }
}
```

### 5.8 Compact Preview Panel

The target preview is a compact dashboard panel with a dashed preview area and footer action. The current preview is large and full width. The compact panel is better for a dashboard because preview is available, but not the only thing on the page.

Needed DSL concept:

```json
{
  "kind": "previewFrame",
  "props": {
    "title": "Customer intake preview",
    "url": "/dsl-goja-demo/service?previewConfigVersionId=cfg_draft_123",
    "height": 220,
    "placeholder": "Route-level preview bridge"
  }
}
```

The existing `previewFrame` is close. The missing piece is mostly panel layout and sizing.

## 6. Current Layout vs Target Layout

The target screenshot is not just prettier. It encodes different assumptions about how admins work.

| Area | Current layout | Target layout | Why target is better for admins |
| --- | --- | --- | --- |
| Navigation | No persistent navigation; page-local controls only. | Persistent sidebar with icon labels and user card. | Admins switch between operational areas frequently. Navigation must stay available. |
| Header | Large title and local pills. | Breadcrumb/title/description plus primary action. | Page identity and page-level action are clear and consistent. |
| Summary | No KPI ribbon. | Three compact KPI cards. | Admin can scan state before diving into details. |
| Services | Large service cards. | Dense table rows with status and overflow actions. | Tables compare many records efficiently. |
| Calendar | Date tiles. | Full month calendar with markers and legend. | Scheduling requires month context. |
| Drafts | Large diff block. | Compact comparison/review table. | Draft changes become a queue of reviewable items. |
| Activity | Not shown in the screenshot. | Recent activity feed. | Admins need audit context near decisions. |
| Preview | Large full-width block. | Compact panel with open-preview action. | Preview is available without consuming the whole page. |
| Density | Spacious, frontend-like. | Compact, operational. | More information fits above the fold. |

The target is not only a CSS change. It requires richer layout semantics in the DSL.

## 7. The Admin Workbench Layer

The proposed solution is to add an Admin Workbench layer to the existing DSL. This layer is not a separate product. It is a set of schema primitives, renderer behavior, and builder helpers that make admin pages easier to describe.

Think of the current DSL as a box of useful parts. The Admin Workbench layer adds the missing grammar for assembling those parts into dense operational pages.

```text
Current Admin DSL components
  metricCard, resourceTable, previewFrame, diffView, activityFeed, panel
                  |
                  v
Admin Workbench composition layer
  shell/sidebar, pageHeader, dashboardGrid, compactPanel,
  table column grammar, monthCalendar, comparisonTable, density policies
                  |
                  v
Target-style admin pages
  /admin/intake dashboard, config editor, audit overview, service management
```

## 8. Proposed DSL Constructs

This section lists the constructs to implement. For each construct, it explains what it means, where it lives, and what files change.

### 8.1 Workbench Shell

A workbench shell describes persistent admin navigation. It can be implemented as richer props on the existing `shell.kind = "admin"` instead of a new node kind.

#### Proposed JSON

```json
{
  "kind": "admin",
  "props": {
    "variant": "workbench",
    "density": "compact",
    "sidebar": {
      "active": "overview",
      "logo": { "kind": "mark", "label": "Fringe" },
      "items": [
        { "id": "overview", "label": "Overview", "icon": "home", "action": { "type": "mutation", "target": "nav.overview" } },
        { "id": "services", "label": "Services", "icon": "grid", "action": { "type": "mutation", "target": "nav.services" } },
        { "id": "calendar", "label": "Calendar", "icon": "calendar", "action": { "type": "mutation", "target": "nav.calendar" } }
      ],
      "user": { "name": "Admin User", "role": "Administrator", "initials": "AD" }
    }
  }
}
```

#### Renderer behavior

- Desktop: render a fixed-width left sidebar.
- Mobile: collapse to a top bar or drawer.
- Active item: compare `sidebar.active` to each item id.
- Item action: dispatch through the normal Admin DSL action path.

#### Files to change

- `web/src/admin-dsl/schema.ts`
  - Add TypeScript helper interfaces for shell props if desired.
- `web/src/admin-dsl/render.tsx`
  - Update the page-level wrapper to recognize `shell.props.variant === "workbench"`.
  - Render sidebar before page content.
- `pkg/admindsl/types.go`
  - No structural change required if shell props remain generic JSON.
- `pkg/admindsl/builder.go`
  - Add builder helper for workbench shell props.
- `pkg/admindsl/goja_module.go`
  - Expose ergonomic builder if flows should call `admin.workbenchShell(...)` or `page.WorkbenchShell(...)`.

### 8.2 Page Header Node

A page header is a standard admin heading block. It should not be hand-composed from section text and toolbars.

#### Proposed node kind

- `pageHeader`

#### Proposed JSON

```json
{
  "kind": "pageHeader",
  "props": {
    "breadcrumbs": ["Admin DSL", "Advanced Components"],
    "title": "Advanced Component Matrix",
    "description": "All Phase 5 primitives on one page for screenshot and responsive review.",
    "actions": [
      { "type": "open", "target": "service.new", "label": "New Service", "intent": "primary", "priority": "primary", "presentation": "button" }
    ]
  }
}
```

#### Go constants

Add in `pkg/admindsl/types.go`:

```go
const (
    NodePageHeader NodeKind = "pageHeader"
)
```

#### TypeScript schema

Add in `web/src/admin-dsl/schema.ts`:

```ts
export type AdminNodeKind =
  | "pageHeader"
  // existing kinds...
```

#### Renderer pseudocode

```tsx
function renderNode(node: AdminNode, ctx: AdminRenderContext) {
  switch (node.kind) {
    case "pageHeader":
      return <AdminPageHeader {...node.props} dispatch={ctx.dispatch} />;
  }
}

function AdminPageHeader(props) {
  return (
    <header className="adminDslPageHeader">
      <Breadcrumbs items={props.breadcrumbs} />
      <div className="adminDslPageHeaderMain">
        <div>
          <h1>{props.title}</h1>
          {props.description && <p>{props.description}</p>}
        </div>
        <ActionGroup actions={props.actions} placement="pageHeader" />
      </div>
    </header>
  );
}
```

### 8.3 Dashboard Grid

A dashboard grid is an area-aware layout container. The existing `cardGrid` can be extended, but a new `dashboardGrid` node may be clearer because the semantics differ from a simple card grid.

#### Proposed node kind

- `dashboardGrid`

#### Proposed JSON

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
        "title": "Phase 5 Services",
        "layout": { "span": { "desktop": 8, "tablet": 8, "mobile": 1 }, "order": 20 }
      }
    }
  ]
}
```

#### Renderer pseudocode

```tsx
function DashboardGrid({ props, children }) {
  const style = {
    "--admin-grid-columns-desktop": props.columns?.desktop ?? 12,
    "--admin-grid-gap": resolveGap(props.gap),
  };
  return <div className="adminDslDashboardGrid" style={style}>{children}</div>;
}

function gridItemStyle(node) {
  const layout = node.props?.layout;
  return {
    gridColumn: `span ${layout?.span?.desktop ?? 12}`,
    order: layout?.order ?? 0,
  };
}
```

#### CSS idea

```css
.adminDslDashboardGrid {
  display: grid;
  grid-template-columns: repeat(var(--admin-grid-columns-desktop), minmax(0, 1fr));
  gap: var(--admin-grid-gap);
}

@media (max-width: 760px) {
  .adminDslDashboardGrid {
    grid-template-columns: 1fr;
  }
  .adminDslDashboardGrid > * {
    grid-column: span 1 !important;
  }
}
```

### 8.4 Structured Panel

The existing `panel` should become the universal chrome for admin cards. A panel is not just a div with a border. It has a header, body, optional toolbar, optional footer actions, density, and layout placement.

#### Proposed props

```json
{
  "title": "Phase 5 Services",
  "subtitle": "Services in the current draft",
  "density": "compact",
  "padding": "none",
  "chrome": "card",
  "layout": { "span": { "desktop": 8, "mobile": 1 }, "order": 20 },
  "toolbarActions": [],
  "footerActions": []
}
```

#### Why panel matters

Without a structured panel, each widget becomes responsible for its own title, padding, footer, and action placement. That creates inconsistent pages. With a structured panel, `resourceTable`, `monthCalendar`, `comparisonTable`, `activityFeed`, and `previewFrame` can share the same admin chrome.

### 8.5 Rich Resource Table

`resourceTable` should become the default admin resource list primitive.

#### Column grammar

Suggested column kinds:

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

Suggested column props:

```json
{
  "id": "status",
  "label": "Status",
  "kind": "badge",
  "accessor": "status",
  "width": 140,
  "align": "left",
  "hideBelow": "mobile",
  "map": {
    "published": { "label": "Published", "tone": "success" },
    "draftChanges": { "label": "Draft Changes", "tone": "warning" }
  }
}
```

#### Table props

```json
{
  "density": "compact",
  "rowId": "id",
  "columns": [],
  "rows": [],
  "rowActions": [],
  "footerActions": [],
  "emptyState": { "title": "No services", "description": "Add a service to get started." },
  "pagination": { "kind": "none" },
  "selection": { "enabled": false }
}
```

#### Renderer pseudocode

```tsx
function ResourceTable({ props, ctx }) {
  return (
    <table className={classNames("adminDslResourceTable", densityClass(props.density))}>
      <thead>
        <tr>{props.columns.map(col => <th style={columnStyle(col)}>{col.label}</th>)}</tr>
      </thead>
      <tbody>
        {props.rows.map(row => (
          <tr key={row[props.rowId ?? "id"]}>
            {props.columns.map(col => <td>{renderCell(col, row, ctx)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderCell(col, row, ctx) {
  switch (col.kind) {
    case "dragHandle": return <DragHandle />;
    case "text": return <TextCell value={row[col.accessor ?? col.id]} primary={col.primary} />;
    case "badge": return <StatusBadge value={row[col.accessor ?? col.id]} map={col.map} />;
    case "overflowActions": return <ActionMenu actions={row.actions ?? []} dispatch={ctx.dispatch} />;
  }
}
```

### 8.6 Comparison Table

The current `diffView` is useful for visual diffs, but the target `Draft Changes` section is a table of reviewable changes. We should add `comparisonTable` or extend `diffView` with a table mode. A new node kind is clearer.

#### Proposed node kind

- `comparisonTable`

#### Proposed JSON

```json
{
  "kind": "comparisonTable",
  "props": {
    "density": "compact",
    "rows": [
      {
        "id": "highlights-price",
        "field": "Highlights – Price",
        "current": "$200–$350",
        "draft": "$220–$380",
        "scheduled": "Jun 23",
        "tone": "warning",
        "actions": [
          { "type": "open", "target": "draft.review", "label": "Review", "payload": { "changeId": "highlights-price" } }
        ]
      }
    ]
  }
}
```

#### Renderer behavior

- Render a compact table.
- Highlight draft values that differ.
- Render action buttons in the final column.
- On mobile, collapse each row into a comparison card:
  - Field as title.
  - Current and Draft as labeled values.
  - Scheduled and Review action at bottom.

### 8.7 Month Calendar

The target needs a month calendar, not only an availability grid.

#### Proposed node kind

- `monthCalendar`

#### Data model

```json
{
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
  ]
}
```

#### Calendar day derivation pseudocode

```ts
function buildMonthCells(month: string): CalendarCell[] {
  const first = startOfMonth(month);
  const start = startOfWeek(first);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(start, i);
    cells.push({
      date: toISODate(date),
      label: date.getDate(),
      inMonth: sameMonth(date, first),
    });
  }
  return cells;
}
```

Do not require the backend to send all 42 cells unless it wants to. It is enough for the backend to send month, selected date, and markers; the frontend can derive calendar cells deterministically.

### 8.8 Activity Feed

The existing `activityFeed` can likely be extended rather than replaced.

Needed compact item shape:

```json
{
  "id": "audit_123",
  "icon": "calendar",
  "tone": "success",
  "title": "Draft scheduled",
  "detail": "2 changes scheduled for Jun 23",
  "time": "1h ago",
  "actor": "Admin User",
  "action": { "type": "open", "target": "audit.detail", "payload": { "id": "audit_123" } }
}
```

The feed should have a footer action:

```json
{
  "footerAction": { "type": "mutation", "target": "nav.audit", "label": "View all activity" }
}
```

### 8.9 Density Tokens

Density is a semantic prop, not merely a CSS class. It changes row heights, padding, header sizes, and how much supporting text is shown.

Recommended tokens:

- `compact`: admin dashboard/table mode.
- `normal`: default admin detail mode.
- `spacious`: guided/editorial mode.

Example:

```json
{
  "density": "compact"
}
```

Renderer mapping:

```ts
function densityClass(density?: string) {
  switch (density) {
    case "compact": return "adminDslDensityCompact";
    case "spacious": return "adminDslDensitySpacious";
    default: return "adminDslDensityNormal";
  }
}
```

### 8.10 Action Placement

The current `ActionRef` already has useful fields:

- `type`
- `target`
- `label`
- `intent`
- `priority`
- `presentation`
- `placement`

The Workbench layer should use these more consistently.

| Placement | Example in target | Renderer behavior |
| --- | --- | --- |
| `pageHeader` or `toolbar` | `+ New Service` | Primary button in page header. |
| `row` | `Review` in draft changes table | Small row button. |
| `overflow` | Kebab menu in services table | Icon button opening menu. |
| `footer` | `Open preview`, `View all activity` | Footer CTA link/button. |
| `calendar` | Previous/next/select date | Icon/date controls. |

The existing enum does not include `pageHeader` or `calendar`. You can either add enum values or keep `toolbar` and use local component context. Adding enum values is clearer but requires Go/TS/proto awareness if action placements are tightly typed.

## 9. Proposed Target Page Shape

This is a representative backend flow sketch. It is not exact code, but it shows the intended authoring style.

```js
const admin = require("admin");
const intakeAdmin = require("host/intake-admin");

function renderDashboard(ctx) {
  const stats = intakeAdmin.dashboardStats();
  const services = intakeAdmin.getConfigEditor(ctx.state.configVersionId || "").services;
  const audit = intakeAdmin.listAuditEvents(5);

  const newService = ctx.bind(
    admin.primary("service.new", "New Service").Placement("pageHeader"),
    function () {
      ctx.state.drawer = "service.new";
      return renderDashboard(ctx);
    }
  );

  return admin.pageResource("admin-intake-workbench", "Intake Admin")
    .Shell("admin", admin.workbenchShell({
      active: "overview",
      density: "compact",
      items: navItems(ctx),
      user: currentAdminUser(ctx)
    }))
    .Content(
      admin.pageHeader({
        breadcrumbs: ["Fringe", "Intake Admin"],
        title: "Intake Admin",
        description: "Review requests, draft config changes, and preview the customer intake flow.",
        actions: [newService]
      }),

      admin.dashboardGrid({ columns: 12, gap: "compact", density: "compact" },
        admin.metricCard("Total Requests", stats.totalRequests, { caption: stats.pendingRequests + " pending" })
          .Layout({ span: { desktop: 4, mobile: 1 }, order: 10 }),
        admin.metricCard("Draft Changes", stats.draftChanges, { caption: "Across active draft" })
          .Layout({ span: { desktop: 4, mobile: 1 }, order: 11 }),
        admin.metricCard("Last Published", stats.lastPublishedLabel, { tone: "success" })
          .Layout({ span: { desktop: 4, mobile: 1 }, order: 12 }),

        admin.panel("Services", { density: "compact", layout: { span: { desktop: 8, mobile: 1 }, order: 20 } },
          admin.resourceTable({ columns: serviceColumns(ctx), rows: serviceRows(ctx, services) })
        ),

        admin.panel("Calendar", { density: "compact", layout: { span: { desktop: 4, mobile: 1 }, order: 30 } },
          admin.monthCalendar(calendarProps(ctx))
        ),

        admin.panel("Draft Changes", { density: "compact", layout: { span: { desktop: 12, mobile: 1 }, order: 40 } },
          admin.comparisonTable({ rows: draftChangeRows(ctx) })
        ),

        admin.panel("Recent Activity", { density: "compact", layout: { span: { desktop: 6, mobile: 1 }, order: 50 } },
          admin.activityFeed({ items: auditRows(ctx, audit), footerAction: viewAllActivity(ctx) })
        ),

        admin.panel("Preview", { density: "compact", layout: { span: { desktop: 6, mobile: 1 }, order: 60 } },
          admin.previewFrame("customerPreview", previewFrameProps(ctx))
        )
      )
    )
    .MustBuild();
}
```

Notice the difference from a frontend component tree. The flow describes **admin intent**: shell, header, dashboard grid, panels, tables, and actions. The renderer decides the exact DOM.

## 10. Backend Flow Runtime: How Actions Work

Actions are one of the most important parts of the Admin DSL. The backend creates action descriptors and binds callbacks to them. The browser only receives opaque action IDs. When the user clicks a button, the browser sends the action ID back to the backend.

```text
1. JS flow calls ctx.bind(actionDescriptor, callback)
2. Runtime assigns action.id = act_...
3. Runtime stores callback under that ID for current page version
4. Page JSON is sent to browser
5. Browser click dispatches { actionId, pageVersion, value }
6. Runtime rejects stale page versions
7. Runtime invokes callback
8. Callback mutates ctx.state or app storage and returns next page
```

This protects the system from trusting browser-provided function names. The browser cannot say “run updateServiceOption.” It can only say “the user clicked action ID act_123 on page version 7.”

Relevant files:

- `pkg/admindsl/script_runtime.go`
- `web/src/admin-dsl/BackendAdminDslPage.tsx`
- `web/src/admin-dsl/actions.ts`

Pseudocode:

```go
func (s *ScriptSession) Bind(action ActionRef, callback goja.Callable) ActionRef {
    action.ID = newActionID()
    s.boundActions[action.ID] = callback
    return action
}

func (s *ScriptSession) Dispatch(event FlowEvent) (FlowResult, error) {
    if event.PageVersion != s.pageVersion {
        return error("stale page")
    }
    callback := s.boundActions[event.ActionID]
    if callback == nil {
        return error("unknown action")
    }
    nextPage := callback(event.Value)
    s.pageVersion++
    return s.commit(nextPage)
}
```

## 11. HTTP API Reference

The Admin DSL website uses dedicated Admin DSL endpoints.

### 11.1 Start a flow

```http
POST /api/admin-dsl/flows/{flowId}/start
```

Known flow IDs:

- `fringe.admin.services.v1`
- `fringe.admin.intake.v1`

Expected behavior:

- Creates a new Admin DSL session.
- Executes the root flow render/start code.
- Returns a `FlowState`-like response containing session ID, page version, page JSON, and effects.

### 11.2 Get a session

```http
GET /api/admin-dsl/flows/{sessionId}
```

Expected behavior:

- Returns the latest page for an existing session.
- Used by the frontend to resume or refresh.

### 11.3 Dispatch an event

```http
POST /api/admin-dsl/flows/{sessionId}/events
Content-Type: application/json

{
  "eventId": "uuid",
  "pageVersion": 4,
  "actionId": "act_...",
  "value": {}
}
```

Expected behavior:

- Validates session and page version.
- Looks up the bound backend callback.
- Invokes callback with event value.
- Returns next page JSON.

Relevant file:

- `pkg/server/handlers_admin_dsl.go`

## 12. Frontend Renderer Contract

The renderer receives an `AdminPage`:

```ts
export interface AdminPage {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  shell: {
    kind: AdminShellKind;
    props?: AdminJsonObject;
  };
  nodes: AdminNode[];
  modals?: AdminNode[];
  drawers?: AdminNode[];
  meta?: PageMeta;
}
```

Each node has:

```ts
export interface AdminNode<P extends AdminJsonObject = AdminJsonObject> {
  kind: AdminNodeKind;
  props?: P;
  children?: AdminNode[];
  meta?: {
    id?: string;
    region?: "main" | "side" | "toolbar" | "modal" | "drawer";
  };
}
```

The renderer should remain an interpreter. That means:

- Add a new node kind to the schema.
- Add a renderer case for that node kind.
- Add tests that render it and dispatch actions.
- Add Storybook examples.
- Do not add arbitrary dynamic component names such as `{ kind: "component", component: "SomeReactComponent" }`.

## 13. Implementation Plan for an Intern

The work should happen in small commits. Every new Admin DSL node/widget should have tests and Storybook coverage in the same or adjacent commit.

### Phase 1: Add target-style Storybook fixture without backend flow changes

Start in Storybook because it gives fast visual feedback.

Files:

- `web/src/admin-dsl/schema.ts`
- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/AdminDslAdvancedComponents.stories.tsx` or a new `AdminDslWorkbench.stories.tsx`
- `web/src/admin-dsl/AdminDsl.test.tsx`

Tasks:

1. Add `pageHeader` node kind in TypeScript.
2. Add `dashboardGrid` node kind in TypeScript.
3. Add provisional renderer support.
4. Create a fixture that recreates the target screenshot with static data.
5. Add a mobile story.
6. Add a renderer smoke test.

Do not start by changing Go. First prove the rendering model.

Acceptance criteria:

- Storybook shows a target-style page with sidebar/header/KPIs/tables/calendar/activity/preview.
- Mobile story collapses to a sensible single-column order.
- TypeScript passes:
  - `cd web && npx tsc --noEmit`
- Frontend tests pass:
  - `cd web && pnpm test -- --runInBand`

### Phase 2: Add Go schema constants and builders

Files:

- `pkg/admindsl/types.go`
- `pkg/admindsl/builder.go`
- `pkg/admindsl/goja_module.go`
- `pkg/admindsl/builder_test.go`
- `pkg/admindsl/goja_module_test.go`

Tasks:

1. Add new node constants:
   - `NodePageHeader`
   - `NodeDashboardGrid`
   - `NodeComparisonTable`
   - `NodeMonthCalendar`
2. Add builder helpers:
   - `PageHeader(...)`
   - `DashboardGrid(...)`
   - `ComparisonTable(...)`
   - `MonthCalendar(...)`
3. Expose helpers in Goja as `admin.pageHeader`, `admin.dashboardGrid`, etc.
4. Add tests that build pages and verify JSON node kinds/props.

Acceptance criteria:

- `go test ./pkg/admindsl -count=1` passes.
- Existing flows still start.

### Phase 3: Upgrade shell rendering

Files:

- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/schema.ts`
- CSS modules or stylesheet used by Admin DSL renderer.
- `pkg/admindsl/builder.go` if adding shell builder helpers.

Tasks:

1. Add `shell.props.variant === "workbench"` support.
2. Render desktop sidebar.
3. Render mobile collapsed behavior.
4. Support item actions through dispatch.
5. Add user card rendering.

Acceptance criteria:

- Sidebar appears in target Storybook fixture.
- Clicking nav items dispatches actions in a test or Storybook action logger.
- Existing non-workbench pages still render correctly.

### Phase 4: Upgrade data widgets

Files:

- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/calendar.tsx`
- `web/src/admin-dsl/AdminDslDataComponents.stories.tsx`
- `web/src/admin-dsl/AdminDslAdvancedComponents.stories.tsx`
- Tests near existing Admin DSL tests.

Tasks:

1. Add compact `resourceTable` column grammar.
2. Add row overflow action rendering.
3. Add `comparisonTable` rendering.
4. Add `monthCalendar` rendering.
5. Extend `activityFeed` for compact panel mode.

Acceptance criteria:

- Target fixture uses real DSL nodes, not fake HTML.
- Tests cover table cell rendering, row action dispatch, comparison row actions, and calendar date selection.

### Phase 5: Adopt in backend `/admin/intake`

Files:

- `pkg/admindsl/flows/intake_admin.flow.js`
- `pkg/admindsl/flows/intake_config.flow.js`
- `pkg/admindsl/flows/intake_ops.flow.js`
- `pkg/server/host_intake_admin_module.go` if new data is needed.
- `pkg/intakeadmin/store.go` if new query methods are needed.

Tasks:

1. Add shared `navItems(ctx)` helper.
2. Add workbench shell to `/admin/intake` pages.
3. Replace dashboard sections with page header + dashboard grid.
4. Render service config as compact table.
5. Render draft changes as comparison table.
6. Render recent activity from `listAuditEvents(limit)`.
7. Render preview as compact panel.

Acceptance criteria:

- `/admin/intake` loads with target-style workbench shell.
- Existing admin actions still work.
- Phase 8 smoke still passes:
  - `node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs`

### Phase 6: Visual capture and regression

Files:

- Existing screenshot scripts under ticket workspace or new script.
- Possibly `css-visual-diff` configuration if available in the repo/tooling.

Tasks:

1. Capture target Storybook fixture desktop and mobile.
2. Capture live `/admin/intake` dashboard desktop and mobile.
3. Compare against desired visual direction.
4. Store screenshots in the ticket.

Acceptance criteria:

- Screenshots exist in ticket workspace.
- Known visual deviations are documented.

## 14. Proposed File-by-File Change Checklist

### `web/src/admin-dsl/schema.ts`

Add node kinds:

```ts
export type AdminNodeKind =
  | "pageHeader"
  | "dashboardGrid"
  | "comparisonTable"
  | "monthCalendar"
  // existing kinds...
```

Optionally add typed prop interfaces. The current schema uses generic JSON props, but typed interfaces are useful for renderer internals.

### `pkg/admindsl/types.go`

Add constants:

```go
const (
    NodePageHeader      NodeKind = "pageHeader"
    NodeDashboardGrid   NodeKind = "dashboardGrid"
    NodeComparisonTable NodeKind = "comparisonTable"
    NodeMonthCalendar   NodeKind = "monthCalendar"
)
```

If action placement is extended:

```go
const (
    PlacementPageHeader ActionPlacement = "pageHeader"
    PlacementCalendar   ActionPlacement = "calendar"
)
```

### `web/src/admin-dsl/render.tsx`

Add renderer cases:

```tsx
case "pageHeader":
  return <AdminPageHeader node={node} ctx={ctx} />;
case "dashboardGrid":
  return <AdminDashboardGrid node={node} ctx={ctx} />;
case "comparisonTable":
  return <AdminComparisonTable node={node} ctx={ctx} />;
case "monthCalendar":
  return <AdminMonthCalendar node={node} ctx={ctx} />;
```

Add shell variant:

```tsx
function AdminPageFrame({ page, ctx }) {
  if (page.shell.kind === "admin" && page.shell.props?.variant === "workbench") {
    return <WorkbenchShell page={page} ctx={ctx} />;
  }
  return <DefaultAdminShell page={page} ctx={ctx} />;
}
```

### `pkg/admindsl/builder.go`

Add helpers. Keep them thin: they should create JSON nodes, not encode application behavior.

```go
func PageHeader(props JSONObject) Node {
    return Node{Kind: NodePageHeader, Props: props}
}

func DashboardGrid(props JSONObject, children ...Node) Node {
    return Node{Kind: NodeDashboardGrid, Props: props, Children: children}
}
```

### `pkg/admindsl/goja_module.go`

Expose helpers to JS:

```go
_ = obj.Set("pageHeader", func(call goja.FunctionCall) goja.Value {
    props := exportJSONObject(call.Argument(0))
    return runtime.ToValue(PageHeader(props))
})
```

Use existing patterns in this file. Do not invent a new conversion scheme unless necessary.

### `pkg/admindsl/flows/intake_admin.flow.js`

Move dashboard from generic sections into workbench constructs.

Pseudocode:

```js
function dashboard(ctx) {
  const stats = intakeAdmin.dashboardStats();
  return admin.pageResource("admin-intake-dashboard", "Intake Admin")
    .Shell("admin", workbenchShell(ctx, "overview"))
    .Content(
      admin.pageHeader(headerProps(ctx)),
      admin.dashboardGrid(gridProps(),
        metricCards(stats),
        servicesPanel(ctx),
        calendarPanel(ctx),
        draftChangesPanel(ctx),
        activityPanel(ctx),
        previewPanel(ctx)
      )
    )
    .MustBuild();
}
```

## 15. Testing Strategy

Testing should match the architecture layers.

### 15.1 Go builder tests

Goal: prove builders emit correct JSON node kinds and props.

Example:

```go
func TestDashboardGridBuilder(t *testing.T) {
    page := NewPage("id", "Title").Content(
        DashboardGrid(JSONObject{"columns": 12},
            Panel("Services").Build(),
        ),
    ).MustBuild()

    require.Equal(t, NodeDashboardGrid, page.Nodes[0].Kind)
}
```

Run:

```bash
go test ./pkg/admindsl -count=1
```

### 15.2 Goja module tests

Goal: prove JS flows can call new builders.

Sketch:

```js
const admin = require("admin");
exports.render = function(ctx) {
  return admin.page("test", "Test")
    .Content(admin.pageHeader({ title: "Hello" }))
    .MustBuild();
}
```

Test should start runtime and assert returned page contains `pageHeader`.

### 15.3 React renderer tests

Goal: prove nodes render and dispatch actions.

Example test assertions:

- Page header title appears.
- Sidebar nav item appears and active item has active class/attribute.
- Resource table renders rows and status badges.
- Row action dispatches expected action ID.
- Comparison table review button dispatches expected action.
- Month calendar date click dispatches date value.

Run:

```bash
cd web && pnpm test -- --runInBand
```

### 15.4 TypeScript validation

Run:

```bash
cd web && npx tsc --noEmit
```

### 15.5 Full Go validation

Run:

```bash
go test ./... -count=1
```

### 15.6 Smoke test

After adopting in `/admin/intake`, rerun:

```bash
node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs
```

This requires:

- Backend running on `127.0.0.1:19080`.
- Vite running on `127.0.0.1:5175` with:
  - `HAIR_BOOKING_BACKEND_URL=http://127.0.0.1:19080`

## 16. Storybook Strategy

Storybook should be used as the design lab. Before touching live backend flows, create deterministic stories.

Recommended new file:

- `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`

Stories:

1. `TargetDesktop`
   - Recreate the target screenshot at desktop size.
2. `TargetMobile`
   - Same DSL page, mobile viewport, single-column collapse.
3. `TableInteractions`
   - Row overflow menus and review buttons.
4. `CalendarMarkers`
   - Month calendar with published/scheduled markers.
5. `ShellNavigation`
   - Sidebar nav action dispatch.

Important Storybook rule from project context: desktop stories should explicitly set/reset viewport to desktop so the iPhone viewport does not remain sticky. Mobile stories should be screenshot-friendly.

## 17. Data Mapping for `/admin/intake`

The target-style dashboard can be backed by existing HAIR-041 data.

### 17.1 KPI Cards

Existing sources:

- `host/intake-admin.dashboardStats()`
- `host/intake-admin.listConfigVersions()`
- `host/intake-admin.getConfigEditor(configVersionId)`

Possible metrics:

- Total requests.
- Pending requests.
- Draft config changes.
- Last published version.
- Upcoming scheduled change.

### 17.2 Services Table

Existing source:

- `host/intake-admin.getConfigEditor(configVersionId)`

Rows from:

- `ConfigEditorData.services`

Map to table:

```js
function serviceRows(editor) {
  return editor.services.map((service) => ({
    id: service.id,
    title: service.label,
    description: service.description + " · sort " + service.sortOrder,
    status: editor.version.status === "draft" ? "draftChanges" : "published",
    actions: [editServiceAction(service.id), deleteServiceAction(service.id)]
  }));
}
```

### 17.3 Draft Changes Table

Current store has validation/diff-ish data in config editor data. If it is not enough, add a store method that produces a review queue.

Possible method:

```go
func (s *Store) ConfigChangeSummary(ctx context.Context, configVersionID string) ([]ConfigChangeSummaryRow, error)
```

DTO:

```go
type ConfigChangeSummaryRow struct {
    ID        string `json:"id"`
    Entity    string `json:"entity"`
    Field     string `json:"field"`
    Current   string `json:"current"`
    Draft     string `json:"draft"`
    Scheduled string `json:"scheduled"`
    Severity  string `json:"severity"`
}
```

### 17.4 Activity Feed

Existing source:

- `host/intake-admin.listAuditEvents(limit)`

Map audit rows to feed items:

```js
function auditRows(events) {
  return events.map((event) => ({
    id: event.id,
    icon: iconForAudit(event.kind),
    tone: toneForAudit(event.kind),
    title: titleForAudit(event),
    detail: detailForAudit(event),
    time: relativeTime(event.createdAt),
    actor: event.actor || "Admin User"
  }));
}
```

### 17.5 Preview Panel

Existing Phase 8 bridge:

- `pkg/admindsl/flows/intake_ops.flow.js`
- `web/src/LiveDslDemoApp.tsx`
- `pkg/dslgoja/runtime.go`
- `pkg/server/handlers_dsl.go`

The preview URL shape is:

```text
/dsl-goja-demo/service?previewConfigVersionId=<configVersionId>
```

The admin dashboard can use the same shape inside a compact `previewFrame`.

## 18. Validation and Safety Rules

### 18.1 Do not add arbitrary custom frontend component lookup

Bad:

```json
{ "kind": "custom", "component": "SomeReactComponent", "props": {} }
```

Good:

```json
{ "kind": "comparisonTable", "props": { "rows": [] } }
```

The renderer should know every node kind explicitly.

### 18.2 Do not let Admin DSL own app database policy

Generic Admin DSL can know how to render a table. It should not know what “publish config version” means. That belongs to `pkg/intakeadmin` and host modules.

Good separation:

```text
Admin DSL generic layer:
  comparisonTable, action button, confirmDialog

Intake app layer:
  publishConfigVersion(id), audit event, draft-only enforcement
```

### 18.3 Keep builder output as plain JSON

Builder APIs can be fluent and ergonomic, but final page output must remain plain JSON. This is what keeps protobuf transport, tests, Storybook fixtures, and renderer interpretation stable.

### 18.4 Add tests with each node

Do not add a node kind without:

- TypeScript schema update.
- Go schema update if backend emits it.
- React renderer support.
- At least one renderer test.
- At least one Storybook story.
- Go builder/Goja tests if backend builders expose it.

## 19. Common Mistakes

### Mistake 1: Solving density only with CSS

CSS can reduce padding, but it cannot invent table semantics, sidebar navigation, row actions, or calendar markers. Add the right DSL constructs first; then style them.

### Mistake 2: Making `resourceTable` too generic too quickly

A table grammar should cover known admin cases first. Avoid inventing a full spreadsheet engine. Start with text, badge, date, money, action, and overflow columns.

### Mistake 3: Duplicating desktop and mobile pages

Prefer one semantic page with responsive layout policies. Only create separate mobile views when the interaction truly changes.

### Mistake 4: Letting backend flows hand-author CSS-like layout everywhere

Do not make every flow specify pixel widths and CSS classes. Use semantic span/order/density tokens.

### Mistake 5: Forgetting embedded module registration

Admin flow helper files must be embedded and registered through `pkg/admindsl/flows.go`. A centralized intake module registry now exists, but new helper files still need explicit registration.

## 20. Suggested First Intern Task

A good first implementation task is:

> Build a Storybook-only target workbench fixture using new frontend node kinds `pageHeader` and `dashboardGrid`, plus enhanced panel/table props, without changing backend flows.

Why this task is good:

- It is visible and concrete.
- It does not risk breaking live admin backend behavior.
- It forces you to understand the renderer.
- It produces immediate design feedback.

Concrete steps:

1. Create `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`.
2. Add `pageHeader` and `dashboardGrid` to `web/src/admin-dsl/schema.ts`.
3. Add rendering cases in `web/src/admin-dsl/render.tsx`.
4. Create a fixture that matches the target screenshot structure.
5. Add a simple renderer test.
6. Run:
   - `cd web && npx tsc --noEmit`
   - `cd web && pnpm test -- --runInBand`

## 21. Final Mental Model

The current Admin DSL can render pages. The next step is teaching it to render **workbenches**.

A page is a stack of widgets. A workbench is an environment for operating a business process. It has persistent navigation, summary signals, tables, review queues, calendars, audit context, previews, and actions placed where operators expect them.

The target screenshot is valuable because it shows the missing grammar. It is not asking for a pixel-perfect clone; it is asking for the DSL to understand a different kind of page. Once the DSL can say “workbench shell, page header, dashboard grid, compact service table, month calendar, comparison table, activity feed, preview panel,” many admin pages become easier to build, easier to review, and more useful for real operators.

## 22. Appendix: Quick API Reference

### Admin DSL Page

```ts
interface AdminPage {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  shell: { kind: AdminShellKind; props?: AdminJsonObject };
  nodes: AdminNode[];
  modals?: AdminNode[];
  drawers?: AdminNode[];
}
```

### Admin DSL Node

```ts
interface AdminNode<P = AdminJsonObject> {
  kind: AdminNodeKind;
  props?: P;
  children?: AdminNode[];
  meta?: { id?: string; region?: string };
}
```

### Admin Action

```ts
type AdminActionRef = {
  type: "open" | "close" | "navigate" | "mutation" | "confirm" | "refresh" | "upload";
  target: string;
  label?: string;
  payload?: AdminJsonValue;
  intent?: "neutral" | "primary" | "danger";
  priority?: "primary" | "secondary" | "tertiary";
  presentation?: "button" | "icon" | "menuItem" | "overflow" | "link";
  placement?: "toolbar" | "row" | "footer" | "detail" | "overflow";
};
```

### Admin DSL HTTP Endpoints

```http
POST /api/admin-dsl/flows/{flowId}/start
GET  /api/admin-dsl/flows/{sessionId}
POST /api/admin-dsl/flows/{sessionId}/events
```

### Customer DSL Preview Endpoint Shape

```http
POST /api/dsl/flows/fringe.intake.v1/start?configVersionId={configVersionId}
```

Preview route:

```text
/dsl-goja-demo/service?previewConfigVersionId={configVersionId}
```

## 23. Appendix: Validation Commands

Run these before committing backend/frontend changes:

```bash
go test ./pkg/admindsl ./pkg/server -count=1
go test ./... -count=1
cd web && npx tsc --noEmit
cd web && pnpm test -- --runInBand
```

Run this after live `/admin/intake` behavior changes:

```bash
node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/03-smoke-admin-intake-phase8.mjs
```

## 24. Appendix: Reference Files

Ticket docs and images:

- `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/02-admin-layout-density-reference-analysis.md`
- `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/design-doc/03-admin-workbench-dsl-intern-implementation-guide.md`
- `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/01-target-efficient-admin-layout.png`
- `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/design-reference/02-current-original-admin-layout.png`

Core Admin DSL:

- `pkg/admindsl/types.go`
- `pkg/admindsl/builder.go`
- `pkg/admindsl/goja_module.go`
- `pkg/admindsl/validate.go`
- `pkg/admindsl/script_runtime.go`
- `pkg/admindsl/flows.go`

Admin flow modules:

- `pkg/admindsl/flows/intake_admin.flow.js`
- `pkg/admindsl/flows/intake_requests.flow.js`
- `pkg/admindsl/flows/intake_config.flow.js`
- `pkg/admindsl/flows/intake_config_helpers.flow.js`
- `pkg/admindsl/flows/intake_config_forms.flow.js`
- `pkg/admindsl/flows/intake_ops.flow.js`

Server and storage:

- `pkg/server/handlers_admin_dsl.go`
- `pkg/server/host_intake_admin_module.go`
- `pkg/intakeadmin/store.go`
- `pkg/intakeadmin/schema.sql`

Frontend renderer:

- `web/src/admin-dsl/schema.ts`
- `web/src/admin-dsl/render.tsx`
- `web/src/admin-dsl/calendar.tsx`
- `web/src/admin-dsl/BackendAdminDslPage.tsx`
- `web/src/admin-dsl/backendClient.ts`
- `web/src/admin-dsl/AdminDslAdvancedComponents.stories.tsx`
- `web/src/admin-dsl/AdminDslDataComponents.stories.tsx`

