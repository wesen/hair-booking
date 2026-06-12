---
Title: ""
Ticket: ""
Status: ""
Topics: []
DocType: ""
Intent: ""
Owners: []
RelatedFiles:
    - Path: pkg/admindsl/script_runtime.go
      Note: Admin Goja runtime that must gain host module support
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Customer intake flow that the admin backend must configure and receive submissions from
    - Path: pkg/dslhost/config_schema.sql
      Note: Existing config DB schema read by the intake flow
    - Path: pkg/dslhost/schema.sql
      Note: Existing DSL state/session/upload/audit schema
    - Path: pkg/server/handlers_admin_dsl.go
      Note: Admin DSL transport currently hard-coded to one services flow
    - Path: web/src/admin-dsl/render.tsx
      Note: Renderer component surface used to assess Admin DSL layout readiness
ExternalSources: []
Summary: ""
LastUpdated: 0001-01-01T00:00:00Z
WhatFor: ""
WhenToUse: ""
---


# Real Admin Backend for the Intake App — Analysis, Design, and Implementation Guide

## Executive Summary

The current `/admin/services` page proves that a backend-authored Admin DSL page can be rendered by React, dispatched through protobuf HTTP, and executed inside a Goja runtime. It is intentionally small: it edits three in-memory services inside one Admin DSL session. This ticket designs the next step: a real, persistent admin backend for the customer intake app implemented in `pkg/dslgoja/flows/intake.flow.js`.

The goal is to let an authenticated stylist/admin manage the data that drives the intake experience, review submitted intake requests, manage uploaded photos, configure availability and booking rules, publish versioned intake configuration, and inspect operational health. This is deliberately a stress test for the Admin DSL runtime, protobuf transport, SQLite persistence, and frontend renderer. It should surface missing primitives such as durable Admin DSL sessions, role checks, richer form inputs, nested resources, optimistic/pending states, modals, confirm flows, audit logs, version publishing, validation summaries, and app-owned write semantics.

The implementation should preserve the architectural boundary established by HAIR-039 and HAIR-040:

- The generic Admin DSL owns UI semantics: pages, resources, forms, actions, surfaces, adaptive layout, and renderer behavior.
- The application owns domain schemas and mutation semantics: service options, tone options, budget ranges, availability, booking requests, appointments, uploads, publishing, and audit trails.
- Go-host builders can make authoring ergonomic, but the browser still receives plain JSON/protobuf Admin DSL pages.
- Browser actions are opaque backend action ids scoped to page versions.
- Persistent data is written through app-owned Go storage APIs, not directly by the generic renderer.

## Problem Statement

The customer intake app is currently configurable through seeded SQLite tables and a Goja flow:

- Flow source: `pkg/dslgoja/flows/intake.flow.js`
- Config schema: `pkg/dslhost/config_schema.sql`
- State/session schema: `pkg/dslhost/schema.sql`
- Runtime host modules: `require("configDb")`, `require("stateDb")`, `require("host/images")`
- Customer transport routes: `pkg/server/handlers_dsl.go`
- Admin transport routes: `pkg/server/handlers_admin_dsl.go`

This is enough to render a dynamic intake funnel, but not enough for a real salon operator. A stylist currently cannot:

- edit service menu options without changing seed SQL,
- preview and publish intake configuration safely,
- manage tone, budget, price range, copy, availability, and time slot options,
- review customer intake submissions,
- inspect uploaded photos and metadata,
- convert an intake request into an appointment,
- mark a request reviewed, contacted, archived, or rejected,
- audit who changed what,
- recover from validation errors or partially failed writes,
- see operational errors from the DSL/config runtime.

The desired admin backend should make the intake app operable without changing source code while also stress-testing whether the Admin DSL runtime is expressive enough for real back-office work.

## Current System Map

### Customer intake flow

```text
Browser: LiveDslDemoApp / customer page
  |
  | POST /api/dsl/flows/fringe.intake.v1/start
  | GET  /api/dsl/flows/{sessionId}
  | POST /api/dsl/flows/{sessionId}/events
  v
pkg/server/handlers_dsl.go
  |
  v
pkg/dslgoja.Runtime
  |
  | require("fringe/dsl")
  | require("configDb")
  | require("stateDb")
  | require("host/images")
  v
pkg/dslgoja/flows/intake.flow.js
  |
  +--> config DB: dsl_config_versions, dsl_service_options, ...
  +--> state DB: dsl_flow_sessions, dsl_uploads, dsl_audit_events, ...
  +--> blob store: uploaded photos
```

### Current Admin DSL route

```text
Browser: /admin/services
  |
  | POST /api/admin-dsl/flows/fringe.admin.services.v1/start
  | GET  /api/admin-dsl/flows/{sessionId}
  | POST /api/admin-dsl/flows/{sessionId}/events
  v
pkg/server/handlers_admin_dsl.go
  |
  v
pkg/admindsl.ScriptRuntime
  |
  | require("fringe/admin-dsl")
  v
pkg/admindsl/flows/services.flow.js
  |
  +--> in-memory JS state only today
```

### Important file references

- Intake flow to administer:
  - `pkg/dslgoja/flows/intake.flow.js`
- Customer DSL runtime and transport:
  - `pkg/dslgoja/runtime.go`
  - `pkg/dslgoja/modules_dsl.go`
  - `pkg/dslgoja/proto_convert.go`
  - `pkg/server/handlers_dsl.go`
  - `proto/fringe/dsl/v1/dsl.proto`
- Existing persistent data definitions:
  - `pkg/dslhost/config_schema.sql`
  - `pkg/dslhost/schema.sql`
  - `pkg/dslhost/db.go`
- Admin DSL runtime and transport:
  - `pkg/admindsl/script_runtime.go`
  - `pkg/admindsl/goja_module.go`
  - `pkg/admindsl/builder.go`
  - `pkg/admindsl/validate.go`
  - `pkg/server/handlers_admin_dsl.go`
  - `proto/fringe/admin_dsl/v1/admin_dsl.proto`
- Admin DSL frontend:
  - `web/src/admin-dsl/BackendAdminDslPage.tsx`
  - `web/src/admin-dsl/backendClient.ts`
  - `web/src/admin-dsl/render.tsx`
  - `web/src/admin-dsl/actions.ts`
  - `web/src/admin-dsl/schema.ts`

## What the Real Admin Backend Must Do

The real admin backend should provide these capability groups.

### 1. Intake Configuration Management

Manage everything read by `pkg/dslgoja/flows/intake.flow.js`:

- active config version,
- draft config version,
- service categories and service options,
- tone options,
- budget options,
- price ranges,
- availability days,
- time slots,
- copy blocks and helper text,
- stylist profile/context card details,
- estimate formulas and default rules.

The flow currently queries these tables:

```sql
SELECT id FROM dsl_config_versions WHERE status = ? ORDER BY activated_at DESC LIMIT 1;
SELECT value, title, subtitle, badge FROM dsl_service_options WHERE config_version_id = ? AND category = ? AND enabled = 1 ORDER BY sort_order;
SELECT value, label FROM dsl_tone_options WHERE config_version_id = ? AND enabled = 1 ORDER BY sort_order;
SELECT value, title, subtitle FROM dsl_budget_options WHERE config_version_id = ? AND enabled = 1 ORDER BY sort_order;
SELECT value, day, date, dot, disabled FROM dsl_availability_days WHERE config_version_id = ? ORDER BY sort_order;
SELECT value, title FROM dsl_time_slots WHERE config_version_id = ? AND enabled = 1 ORDER BY sort_order;
SELECT label FROM dsl_price_ranges WHERE config_version_id = ? ...;
```

A real admin backend should expose safe CRUD/editing workflows for each of these, but should not mutate the active config directly. It should use draft/publish semantics.

### 2. Intake Request Review

The confirm step currently says:

> This prototype loops back to the first step instead of creating an appointment record.

A real backend needs to create an intake request record when the customer confirms. Admin screens then review those requests.

Request data should include:

- request id,
- user/customer id if authenticated,
- anonymous contact details if not authenticated,
- selected config version id,
- selected service category,
- selected service option,
- selected tone options,
- damage score,
- uploaded photo references,
- selected budget,
- selected date and time,
- computed estimate range,
- freeform notes if added later,
- status lifecycle,
- audit trail,
- timestamps.

Suggested statuses:

```text
new -> reviewing -> contacted -> booked
                    -> needs_info
                    -> declined
                    -> archived
```

### 3. Availability and Booking Management

The admin must be able to control what the booking step shows.

Minimum features:

- list days in the visible booking window,
- enable/disable days,
- edit disabled reason,
- edit visible dot/availability signal,
- list time slots,
- enable/disable slots,
- optionally mark slot capacity or hold state,
- preview resulting customer booking screen.

Future production features:

- real appointment conflict checks,
- stylist working hours,
- time off blocks,
- manual holds,
- timezone policy,
- appointment creation from intake request.

### 4. Media and Upload Review

The customer flow uploads front/side/back photos through upload intents.

Admin needs:

- thumbnail gallery per intake request,
- image metadata,
- upload status,
- missing-photo indicators,
- open full-size preview modal,
- safe download/open link,
- optional remove/redact flow,
- error display for missing blob/object.

### 5. Publishing and Preview

Admin must be able to preview draft config before publishing.

Expected flow:

```text
Create draft from active -> edit draft -> validate draft -> preview intake -> publish -> active config changes
```

Publishing must be atomic from the user perspective:

- only one active config version,
- new intake sessions use the newly active version,
- existing sessions keep their `config_version_id`,
- audit event records the publication,
- old active version becomes archived/superseded.

### 6. Operational Health and Audit

Admin should include non-obvious but critical screens:

- flow/session health,
- failed dispatches,
- stale sessions,
- config validation errors,
- upload errors,
- audit events,
- migration/schema version visibility.

This is part of the stress test: if these are difficult to build, the runtime or schema needs better primitives.

## Admin DSL and Design Component Readiness

Short answer: the current Admin DSL can express the broad structure of the proposed backend, but it does **not** yet have enough interaction and data-management components to implement every screen well. It is ready for dashboards, card lists, drawers, forms, simple resource rows, modals, lifecycle/error states, and responsive stacking. It needs deliberate additions for real admin productivity: data tables, editable/reorderable lists, richer form fields, image galleries, tabs that dispatch actions, pagination, bulk actions, publish diffs, and embedded customer-flow previews.

This is precisely why HAIR-041 is a useful stress test. We should not assume every layout is already solved. Instead, each admin screen should either use an existing DSL primitive or create a small, semantic primitive that belongs in the Admin DSL because it recurs across admin apps.

### Existing Admin DSL primitives that are enough today

From `web/src/admin-dsl/schema.ts`, `web/src/admin-dsl/render.tsx`, `pkg/admindsl/builder.go`, and `pkg/admindsl/goja_module.go`, we already have these useful pieces:

```text
Layout:
  section, toolbar, cardGrid, panel, splitPane, tabs

Resource/list:
  resourceList, resourceRow, filterBar, searchBox

Display:
  metricCard, summaryCard, kvList, activityFeed, markdownBlock,
  emptyState, loadingState, inlineError, imageGrid

Forms:
  form, fieldGroup, textField, textareaField, moneyField,
  durationField, dateField, timeField, selectField, switchField,
  imageField, saveBar

Surfaces:
  drawer, modal, sheet, detailPanel, inlinePanel, confirmDialog

Actions:
  semantic action refs with intent, priority, placement, confirmation,
  disabled/loading/accessibility labels, opaque backend ids

Specialized:
  calendarWeek, appointmentBlock, availabilityBlock, timeOffBlock
```

These are enough for:

- dashboard metric cards,
- request queue as card/row list,
- request detail as split pane,
- service edit drawer,
- publish confirm modal,
- empty/loading/error states,
- activity/audit feed as a simple list,
- basic availability calendar display,
- simple form edit/save flows.

### Gaps to close before the admin backend feels real

| Need | Can current DSL do it? | Gap | Recommended primitive/change |
|---|---:|---|---|
| Dashboard cards | Yes | Mostly done | Reuse `metricCard`, `cardGrid`, `activityFeed` |
| Request queue | Partial | Rows work, but no real table density, pagination, bulk selection | Add `dataTable` or `resourceTable`, `pagination`, `bulkActionBar` |
| Request detail | Yes | Needs better image preview and notes timeline | Reuse `splitPane`, `kvList`; add `imageGallery`, `timeline` if needed |
| Photo modal | Partial | `imageGrid` is decorative; no full gallery semantics | Add `imageGallery` / `mediaViewer` node |
| Config versions | Yes | Rows/cards enough initially | Reuse `resourceList`, `confirmDialog` |
| Service editor | Partial | Editable form works; no reorder/drag/table editing | Add `editableList`, `sortHandle`/`reorderList`, or table row actions |
| Tone editor | Partial | Chips display exists only in customer DSL, not Admin DSL as editable chips | Add `chipEditor` or use `resourceRow` initially |
| Budget/pricing editor | Partial | Split pane works; money fields need validation and min/max pair semantics | Add `moneyRangeField`, stronger field errors |
| Availability editor | Partial | Calendar week exists, but config day grid is different from appointment week | Add `monthAvailabilityGrid` or `availabilityMatrix` |
| Customer preview | No/Partial | Admin DSL cannot embed/render customer DSL preview directly today | Add `previewFrame` node or route-level preview bridge |
| Audit log | Partial | `activityFeed` works for simple logs, but no filters/detail expansion | Add `timeline`, `jsonInspector`, filter actions |
| Health screen | Yes | Mostly cards/list/error states | Reuse `summaryCard`, `inlineError`, `kvList` |
| Publish diff | No | Need before/after compare | Add `diffView` / `changeSummary` |
| Navigation/sidebar | Partial | Shell has props but no explicit nav renderer | Add `adminNav` / `sideNav` or shell-level nav support |
| Tabs/filter interaction | Partial | `tabs` and `filterBar` render pills but are not inherently dispatching actions | Make tabs/filterBar actionable |
| Toasts/effects | Partial | Effects display exists in backend page wrapper, not a full toast system | Add `toastRegion` or frontend effect manager |
| Save conflicts | Partial | Can show modal, but no diff/merge UI | Add conflict modal pattern + optional diff primitive |
| Accessibility for duplicate responsive surfaces | Needs work | Desktop/mobile side columns can duplicate controls in DOM | Add `aria-hidden`/render policy for hidden responsive surfaces |

### Components to add as part of HAIR-041

The following should be treated as HAIR-041 implementation tasks, not optional polish:

1. **`resourceTable` / `dataTable`**
   - For request queues, config rows, audit logs, and price ranges.
   - Should support columns, row actions, empty/loading/error states, pagination, sort, and optional bulk selection.

2. **`editableList` / `reorderableList`**
   - For service options, tone options, budget options, time slots.
   - Should support add/edit/delete/reorder without pretending a dense table is a form.

3. **`monthAvailabilityGrid`**
   - For config-level day availability.
   - Different from appointment `calendarWeek`; it represents publishable availability options, not booked events.

4. **`imageGallery` / `mediaViewer`**
   - For intake photos.
   - Should include thumbnail grid, selected image, metadata panel, missing-blob state, and open-original action.

5. **`previewFrame`**
   - For draft customer intake preview.
   - Should render a customer DSL preview or link to a preview route while preserving config version input.

6. **`diffView` / `changeSummary`**
   - For publish confirmation and save conflict review.
   - Should show changed entities and field-level before/after values.

7. **Actionable `tabs`, `filterBar`, and `searchBox`**
   - Current rendering is mostly visual.
   - Real admin flows need these controls to dispatch filter/search/tab changes to the backend.

8. **Field-level error and help text model**
   - Forms need consistent `errors`, `helperText`, `required`, `disabled`, `readonly`, and pending semantics at the field level.

9. **Admin navigation shell**
   - The route can start as one page, but real admin needs persistent navigation across Dashboard, Requests, Config, Availability, Preview, Audit, Health.

### Rule for adding components

Do not add one-off visual components named after this app unless the semantics are truly app-specific. Prefer reusable admin primitives:

```text
Good:
  resourceTable, imageGallery, diffView, monthAvailabilityGrid, previewFrame

Avoid:
  fringeRequestTable, hairPhotoModal, summerConfigPublisher
```

The app-specific part should live in data and flow code:

```js
admin.resourceTable("requests", {
  columns: [
    { id: "customer", label: "Customer" },
    { id: "service", label: "Service" },
    { id: "status", label: "Status" }
  ],
  rows: intakeAdmin.listRequests(filters),
  actions: { rowOpen: openRequest }
})
```

### Practical conclusion

The DSL is strong enough to start HAIR-041 and build useful screens immediately, but it should be expected to evolve during the work. The first implementation phase should intentionally build with existing primitives until the pain is obvious, then add the smallest semantic primitive that solves a repeated layout/interaction need.

A good implementation strategy is:

1. Build Dashboard and Request Queue with existing `metricCard`, `resourceList`, and `resourceRow`.
2. As soon as queue density/filtering becomes awkward, add `resourceTable`.
3. Build Request Detail with `splitPane`, `kvList`, and `imageGrid`.
4. As soon as photo review becomes awkward, add `imageGallery`.
5. Build Services Editor with `resourceList` + drawer forms.
6. As soon as reorder/table editing becomes awkward, add `editableList` or `resourceTable`.
7. Build Preview as a separate route first.
8. Promote it to `previewFrame` only after the route-level bridge works.

This preserves momentum while letting the Admin DSL grow from real pressure rather than speculative component design.

## Proposed Information Architecture

The Admin backend should use a real route namespace, not only `/admin/services`.

Recommended routes:

```text
/admin/intake
/admin/intake/requests
/admin/intake/requests/:id
/admin/intake/config
/admin/intake/config/services
/admin/intake/config/tones
/admin/intake/config/budgets
/admin/intake/config/pricing
/admin/intake/availability
/admin/intake/preview
/admin/intake/audit
/admin/intake/health
```

The first implementation can still be a single Admin DSL flow with internal modes. If more routes are added, introduce a small frontend router and a backend flow registry.

Recommended backend flow ids:

```text
fringe.admin.intake.v1
fringe.admin.intake.requests.v1
fringe.admin.intake.config.v1
fringe.admin.intake.availability.v1
fringe.admin.intake.preview.v1
fringe.admin.intake.audit.v1
```

For the MVP, one flow id is enough:

```text
fringe.admin.intake.v1
```

It can use state like:

```js
{
  screen: "dashboard" | "requests" | "requestDetail" | "config" | "services" | "availability" | "preview" | "audit" | "health",
  selectedRequestId: null,
  selectedConfigVersionId: "cfg_default",
  draftConfigVersionId: null,
  drawer: null,
  modal: null,
  filters: {},
  errors: {},
  pending: false
}
```

## Screens to Build

### Screen 1: Admin Dashboard

Purpose: orient the stylist and expose urgent work.

Data displayed:

- new request count,
- requests needing info,
- next available day/time,
- active config version,
- draft config warnings,
- recent uploads,
- recent audit events.

Primary actions:

- Review new requests,
- Edit intake config,
- Manage availability,
- Preview customer intake.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ REAL ADMIN · INTAKE                                                         │
│ Intake Admin                                                                │
│ Manage customer requests, booking availability, and the live intake config. │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐ │
│ │ NEW REQUESTS │ │ NEEDS INFO   │ │ NEXT SLOT    │ │ ACTIVE CONFIG       │ │
│ │ 7            │ │ 2            │ │ Jun 19 12p   │ │ cfg_default         │ │
│ │ Review →     │ │ Open →       │ │ Manage →     │ │ Draft has changes   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────────┘ │
│                                                                             │
│ REQUEST QUEUE                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Maya Chen · Highlights · $220–$420 · Jun 19 12:00      [Open] [Book]   │ │
│ │ Lena Ortiz · Gloss refresh · $120–$190 · needs photos  [Open]          │ │
│ │ Jules Park · Cut · $80–$160 · new                       [Open]          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ RECENT ACTIVITY                                                             │
│ 09:14 Mia published cfg_2026_06_summer                                      │
│ 09:10 Upload stored: intake-photo/front                                     │
│ 08:58 Request req_123 moved to reviewing                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 2: Request Queue

Purpose: triage incoming intake submissions.

Features:

- filter by status,
- search by customer name/contact,
- sort by received date or appointment date,
- badge missing photos,
- bulk mark reviewed/archive,
- row actions.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Intake Requests                                                             │
│ [Search customer or service...]  [Status: New ▾] [Date: This week ▾]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ STATUS TABS:  New(7)  Reviewing(3)  Needs info(2)  Booked(12)  Archived     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ New     Maya Chen     Highlights       Jun 19 12p  3 photos  [Open]    │ │
│ │ New     Jules Park    Cut              Jun 20 2p   0 photos  [Open]    │ │
│ │ Info    Lena Ortiz    Gloss refresh    TBD         1 photo   [Open]    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ EMPTY STATE                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ No requests match these filters.                         [Clear filters]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 3: Request Detail

Purpose: inspect a request, review photos, and take action.

Data displayed:

- customer/contact,
- status,
- chosen service/tone/budget/date/time,
- estimate range,
- photos,
- raw JSON snapshot for debugging,
- audit history.

Actions:

- mark reviewing,
- request more info,
- mark contacted,
- create appointment,
- archive,
- add internal note.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Request req_123 · Maya Chen                                      [Archive]  │
│ New · received 09:02 · config cfg_default                                  │
├───────────────────────────────────────┬─────────────────────────────────────┤
│ SUMMARY                               │ PHOTOS                              │
│ Service       Highlights              │ ┌────────┐ ┌────────┐ ┌────────┐   │
│ Tone          Dimensional, Cool        │ │ Front  │ │ Side   │ │ Back   │   │
│ Damage        2 / 5                    │ │ image  │ │ image  │ │ image  │   │
│ Budget        Flexible                 │ └────────┘ └────────┘ └────────┘   │
│ Estimate      $220–$420                │ [Open gallery] [Download all]      │
│ Booking       Jun 19 · 12:00p          │                                     │
├───────────────────────────────────────┴─────────────────────────────────────┤
│ INTERNAL NOTES                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Add note...                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ [Save note] [Request more info] [Mark contacted] [Create appointment]       │
│                                                                             │
│ AUDIT                                                                       │
│ 09:02 Request created                                                       │
│ 09:04 Photo uploaded: front                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 4: Photo Gallery Modal

Purpose: inspect uploaded photos without leaving request detail.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ MODAL: Maya Chen photos                                             [Close] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐  Slot: front                       │
│ │                                     │  File: front.jpg                   │
│ │             LARGE IMAGE             │  Size: 1.8 MB                      │
│ │                                     │  Uploaded: 09:04                  │
│ └─────────────────────────────────────┘                                    │
│ [← Previous] [Next →] [Open original] [Redact photo]                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

Error state:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ MODAL: Photo unavailable                                             [Close]│
├─────────────────────────────────────────────────────────────────────────────┤
│ Could not load the stored blob for upload upl_123.                          │
│ The request is still available, but this photo may have been removed.        │
│ [Retry] [Mark as missing]                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 5: Config Versions

Purpose: show active/draft/archived intake configuration versions.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Intake Configuration                                                        │
│ Active config controls new customer intake sessions. Existing sessions keep │
│ their original config_version_id.                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ACTIVE   cfg_default       Default Fringe intake config   [Preview]     │ │
│ │ DRAFT    cfg_2026_summer   Summer service menu            [Edit]        │ │
│ │ ARCHIVE  cfg_2026_spring   Spring menu                    [Restore]     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ [Create draft from active] [Validate draft] [Publish draft]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

Publish confirm modal:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONFIRM PUBLISH                                                             │
│ Publish cfg_2026_summer?                                                    │
│                                                                             │
│ New intake sessions will use this config immediately. Existing sessions     │
│ keep their current config_version_id. This action is audited.               │
│                                                                             │
│ [Cancel]                                      [Publish config]              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 6: Service Options Editor

Purpose: manage categories and service cards shown in Step 1.

Data maps to `dsl_service_options`.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Services & Categories · Draft cfg_2026_summer                     [Preview] │
├─────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY TABS: [Cut] [Color] [Extensions] [+ Add category]                 │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Sort │ Enabled │ Value        │ Title          │ Subtitle       │ Badge │ │
│ │ 10   │ Yes     │ cut          │ Cut            │ Trim/restyle   │ $80+  │ │
│ │ 20   │ Yes     │ highlights   │ Highlights     │ Partial/full   │ $180+ │ │
│ │ 30   │ No      │ gloss        │ Gloss refresh  │ Tone/shine     │ $120+ │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ [Add service] [Reorder] [Save draft]                                        │
│                                                                             │
│ DRAWER: Edit service                                                        │
│ ┌───────────────────────────────────────┐                                  │
│ │ Title      [Highlights              ] │                                  │
│ │ Value      [highlights              ] │                                  │
│ │ Subtitle   [Partial · full · balayage]│                                  │
│ │ Badge      [$180+                   ] │                                  │
│ │ Enabled    [x]                         │                                  │
│ │ Sort order [20                      ] │                                  │
│ │ [Cancel] [Save] [Delete]              │                                  │
│ └───────────────────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

Validation state:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ DRAWER: Edit service                                                        │
│ ┌───────────────────────────────────────┐                                  │
│ │ Value [highlights]                    │                                  │
│ │ ERROR: Value must be unique in category color for this config version.    │
│ │ Title []                              │                                  │
│ │ ERROR: Title is required.                                                  │
│ │ [Cancel] [Save]                                                            │
│ └───────────────────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 7: Tone Options Editor

Purpose: manage Step 2 chip options.

Data maps to `dsl_tone_options`.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tone Options · Draft cfg_2026_summer                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Neutral] [Warm] [Cool] [Dimensional] [Low upkeep] [+ Add tone]             │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Sort │ Enabled │ Value            │ Label                               │ │
│ │ 10   │ Yes     │ neutral          │ Neutral                             │ │
│ │ 20   │ Yes     │ warm             │ Warm                                │ │
│ │ 30   │ Yes     │ cool             │ Cool                                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ [Save draft]                                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 8: Budget and Price Range Editor

Purpose: manage Step 4 budget options and Step 5/6 estimate labels.

Data maps to:

- `dsl_budget_options`,
- `dsl_price_ranges`.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Budget & Pricing · Draft cfg_2026_summer                                    │
├───────────────────────────────────────┬─────────────────────────────────────┤
│ BUDGET OPTIONS                        │ PRICE RANGE RULES                   │
│ ┌───────────────────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ Under $200     Refresh/trim       │ │ │ budget under-200 -> $120–$190   │ │
│ │ $200–$350      Partial color      │ │ │ service cut     -> $80–$160     │ │
│ │ $350+          Transformations    │ │ │ default         -> $220–$420    │ │
│ │ Flexible       Best plan first    │ │ └─────────────────────────────────┘ │
│ └───────────────────────────────────┘ │ [Add price rule]                   │
│ [Add budget] [Save draft]             │                                     │
└───────────────────────────────────────┴─────────────────────────────────────┘
```

Non-obvious validation:

```text
ERRORS
- Every enabled budget option should have a price range rule or default fallback.
- Price range min_cents must be <= max_cents.
- A service-specific rule and budget-specific rule can overlap; document precedence.
```

### Screen 9: Availability Editor

Purpose: manage Step 6 calendar days and time slots.

Data maps to:

- `dsl_availability_days`,
- `dsl_time_slots`.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Availability · Draft cfg_2026_summer                              [Preview] │
├───────────────────────────────────────┬─────────────────────────────────────┤
│ JUNE 2026                             │ TIME SLOTS                          │
│ ┌────┬────┬────┬────┬────┬────┬────┐ │ ┌─────────────────────────────────┐ │
│ │ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │ 24 │ │ │ [x] 10:30a   sort 10            │ │
│ │ dot│ dot│    │ dot│    │ off│ off│ │ │ [x] 12:00p   sort 20            │ │
│ └────┴────┴────┴────┴────┴────┴────┘ │ │ [x] 2:00p    sort 30            │ │
│ Selected day: Jun 23                  │ │ [x] 4:30p    sort 40            │ │
│ Disabled: [x]                         │ └─────────────────────────────────┘ │
│ Reason: [Stylist unavailable       ]  │ [Add time] [Save draft]             │
└───────────────────────────────────────┴─────────────────────────────────────┘
```

### Screen 10: Customer Intake Preview

Purpose: render the customer intake using a selected draft config before publishing.

This can be implemented two ways:

1. Admin page embeds a preview panel that starts an intake flow with `configVersionId = draft`.
2. Admin page links to `/admin/intake/preview?configVersionId=...` where a customer DSL preview is rendered in an iframe-like shell.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Preview Draft cfg_2026_summer                                               │
│ [Service] [Color] [Photos] [Budget] [Estimate] [Booking] [Confirm]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ DESKTOP PREVIEW                           MOBILE PREVIEW                    │
│ ┌───────────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ What brings you in?                   │ │ What brings you in?           │ │
│ │ [Cut] [Color] [Extensions]            │ │ [Cut] [Color] [Extensions]    │ │
│ │ [Highlights card] [Gloss card]        │ │ [Highlights card]            │ │
│ └───────────────────────────────────────┘ └───────────────────────────────┘ │
│ VALIDATION                                                                  │
│ ✓ services present  ✓ budget fallback present  ✕ Jun 23 has no enabled slot │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 11: Audit Log

Purpose: answer “who changed what, when?”

Data maps to a new app-owned audit table, plus existing `dsl_audit_events` if useful.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Audit Log                                                                   │
│ [Actor: Any ▾] [Entity: Config ▾] [Date range ▾] [Search JSON...]           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 09:14 Mia publish_config cfg_2026_summer                                    │
│      old_active=cfg_default new_active=cfg_2026_summer                      │
│ 09:11 Mia update_service svc_highlights                                     │
│      title: Highlights -> Lived-in highlights                               │
│ 09:04 system upload_stored upl_123 req_456                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Screen 12: Health and Diagnostics

Purpose: make runtime and persistence problems visible.

ASCII screenshot:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Intake Admin Health                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Runtime                                                                     │
│ ✓ Admin DSL runtime loaded                                                  │
│ ✓ Customer DSL runtime loaded                                               │
│ ! 3 expired customer sessions not cleaned                                   │
│                                                                             │
│ Databases                                                                   │
│ Config DB ./var/fringe-dsl-config.sqlite  schema v2  WAL on                 │
│ State DB  ./var/fringe-dsl.sqlite         schema v3  WAL on                 │
│                                                                             │
│ Recent errors                                                               │
│ 08:57 config validation failed: no price range fallback                     │
│ 08:42 upload blob missing for upl_123                                       │
│                                                                             │
│ [Run validation] [Expire stale sessions] [Download diagnostics]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data That Needs to Be Written to Disk

There are two existing SQLite files:

- Config DB: `./var/fringe-dsl-config.sqlite`
- State DB: `./var/fringe-dsl.sqlite`

The real admin backend should continue using this separation but add app-owned admin tables. Do not put app-specific business semantics into generic Admin DSL packages.

### Existing config DB tables to manage

From `pkg/dslhost/config_schema.sql`:

```text
dsl_config_versions
dsl_service_options
dsl_tone_options
dsl_budget_options
dsl_price_ranges
dsl_availability_days
dsl_time_slots
dsl_copy_blocks
```

### Existing state DB tables to use

From `pkg/dslhost/schema.sql`:

```text
dsl_flow_sessions
dsl_intake_drafts
dsl_uploads
dsl_audit_events
```

### New state DB tables needed

Recommended table: `intake_requests`

```sql
CREATE TABLE IF NOT EXISTS intake_requests (
  id TEXT PRIMARY KEY,
  flow_session_id TEXT,
  user_id TEXT,
  config_version_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  service_category TEXT NOT NULL,
  service_value TEXT NOT NULL,
  tones_json TEXT NOT NULL DEFAULT '[]',
  damage INTEGER,
  photos_json TEXT NOT NULL DEFAULT '{}',
  budget_value TEXT,
  day_value TEXT,
  time_value TEXT,
  estimate_label TEXT,
  request_json TEXT NOT NULL DEFAULT '{}',
  internal_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  booked_at TEXT,
  archived_at TEXT,
  FOREIGN KEY(flow_session_id) REFERENCES dsl_flow_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_intake_requests_status_created
  ON intake_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intake_requests_config
  ON intake_requests(config_version_id, created_at DESC);
```

Recommended table: `intake_request_events`

```sql
CREATE TABLE IF NOT EXISTS intake_request_events (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  actor_user_id TEXT,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(request_id) REFERENCES intake_requests(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_intake_request_events_request
  ON intake_request_events(request_id, created_at DESC);
```

Recommended table: `admin_audit_events`

```sql
CREATE TABLE IF NOT EXISTS admin_audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  actor_role TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_entity
  ON admin_audit_events(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_actor
  ON admin_audit_events(actor_user_id, created_at DESC);
```

Recommended table: `admin_flow_sessions`

```sql
CREATE TABLE IF NOT EXISTS admin_flow_sessions (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  page_version INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT
);
```

Why this matters: current Admin DSL sessions live only in memory. A real admin workflow with drafts, modals, and multi-screen editing needs restart tolerance or a deliberate policy for losing in-flight UI state.

### Config version write policy

Never edit the active config directly. Use copy-on-write:

```text
active cfg_default
  |
  | Create draft
  v
draft cfg_2026_summer
  |
  | Edit rows scoped to draft id
  v
Validate draft
  |
  | Publish in transaction
  v
cfg_default -> archived
cfg_2026_summer -> active
```

Pseudocode:

```go
func PublishConfig(ctx context.Context, tx *sql.Tx, draftID string, actor User) error {
    if err := ValidateConfigVersion(ctx, tx, draftID); err != nil {
        return err
    }

    activeID := queryActiveConfigID(ctx, tx)

    exec(`UPDATE dsl_config_versions SET status = 'archived' WHERE id = ?`, activeID)
    exec(`UPDATE dsl_config_versions SET status = 'active', activated_at = datetime('now') WHERE id = ?`, draftID)
    insertAdminAudit(actor, "config_version", draftID, "publish", before, after)

    return nil
}
```

## Required Backend Modules

The current Admin DSL Goja module only exposes UI builders. A real admin flow needs host modules for application data. Do not expose raw SQL directly to arbitrary flow code for production admin flows. Instead expose narrow, audited app services.

Recommended module names:

```js
const admin = require("fringe/admin-dsl");
const intakeAdmin = require("host/intake-admin");
const preview = require("host/intake-preview");
const audit = require("host/admin-audit");
```

### `host/intake-admin`

Responsibilities:

```js
intakeAdmin.dashboardStats()
intakeAdmin.listRequests(filters)
intakeAdmin.getRequest(id)
intakeAdmin.updateRequestStatus(id, status, note)
intakeAdmin.addRequestNote(id, note)
intakeAdmin.createAppointmentFromRequest(id, values)

intakeAdmin.listConfigVersions()
intakeAdmin.createDraftFromActive(label)
intakeAdmin.validateConfigVersion(configVersionId)
intakeAdmin.publishConfigVersion(configVersionId)

intakeAdmin.listServiceOptions(configVersionId, filters)
intakeAdmin.upsertServiceOption(configVersionId, value)
intakeAdmin.deleteServiceOption(configVersionId, id)
intakeAdmin.reorderServiceOptions(configVersionId, orderedIds)

intakeAdmin.listToneOptions(configVersionId)
intakeAdmin.upsertToneOption(configVersionId, value)

intakeAdmin.listBudgetOptions(configVersionId)
intakeAdmin.upsertBudgetOption(configVersionId, value)
intakeAdmin.listPriceRanges(configVersionId)
intakeAdmin.upsertPriceRange(configVersionId, value)

intakeAdmin.listAvailabilityDays(configVersionId)
intakeAdmin.upsertAvailabilityDay(configVersionId, value)
intakeAdmin.listTimeSlots(configVersionId)
intakeAdmin.upsertTimeSlot(configVersionId, value)
```

Return shapes should be plain JSON. Errors should be structured:

```json
{
  "code": "validation_failed",
  "message": "Service option is invalid",
  "fieldErrors": {
    "title": "Title is required",
    "value": "Value must be unique"
  }
}
```

### `host/intake-preview`

Responsibilities:

- start a customer intake preview flow for a draft config version,
- render a specific step,
- run config validation and return warnings.

Pseudocode:

```js
const validation = preview.validateConfig("cfg_2026_summer");
const page = preview.renderStep({ configVersionId: "cfg_2026_summer", step: "service", viewport: "mobile" });
```

### `host/admin-audit`

Responsibilities:

- write audit events,
- list audit events,
- correlate request/config/session events.

For mutation modules, audit should usually happen in Go, not JS, so that bypassing a flow callback cannot skip audit.

## Admin Flow Pseudocode

Create a new flow source:

```text
pkg/admindsl/flows/intake_admin.flow.js
```

Skeleton:

```js
const admin = require("fringe/admin-dsl");
const store = require("host/intake-admin");

function initialState() {
  return {
    screen: "dashboard",
    selectedRequestId: null,
    selectedConfigVersionId: null,
    drawer: null,
    modal: null,
    filters: { status: "new" },
    errors: {},
  };
}

function render(ctx) {
  switch (ctx.state.screen) {
    case "requests": return requestsScreen(ctx);
    case "requestDetail": return requestDetailScreen(ctx);
    case "config": return configScreen(ctx);
    case "services": return servicesScreen(ctx);
    case "tones": return tonesScreen(ctx);
    case "pricing": return pricingScreen(ctx);
    case "availability": return availabilityScreen(ctx);
    case "preview": return previewScreen(ctx);
    case "audit": return auditScreen(ctx);
    case "health": return healthScreen(ctx);
    default: return dashboardScreen(ctx);
  }
}

function go(ctx, screen) {
  ctx.state.screen = screen;
  ctx.state.drawer = null;
  ctx.state.modal = null;
  ctx.state.errors = {};
  return render(ctx);
}

function dashboardScreen(ctx) {
  const stats = store.dashboardStats();
  const openRequests = ctx.bind(admin.open("nav.requests", "Review requests"), function () {
    return go(ctx, "requests");
  });

  return admin.pageResource("admin-intake-dashboard", "Intake Admin")
    .Shell("dashboard", { eyebrow: "Real Admin · Intake", active: "dashboard" })
    .Description("Manage customer requests, booking availability, and the live intake config.")
    .Content(
      admin.cardGrid({ columns: 4 },
        admin.metricCard("New requests", stats.newRequests, { tone: "plum" }).Actions(openRequests),
        admin.metricCard("Needs info", stats.needsInfo, { tone: "warn" }),
        admin.metricCard("Next slot", stats.nextSlot, { tone: "success" }),
        admin.metricCard("Active config", stats.activeConfigLabel, { tone: stats.hasDraft ? "warn" : "success" })
      ),
      requestQueueSection(ctx, stats.recentRequests),
      activitySection(ctx, stats.recentActivity)
    )
    .MustBuild();
}
```

## HTTP API Design

The existing Admin DSL transport can stay:

```http
POST /api/admin-dsl/flows/{flowId}/start
GET  /api/admin-dsl/flows/{sessionId}
POST /api/admin-dsl/flows/{sessionId}/events
```

But `handleAdminDSLStartFlow` must become a registry, not a hard-coded `fringe.admin.services.v1` branch.

Pseudocode:

```go
type AdminFlowDefinition struct {
    ID string
    Source string
    RequiredRole string
    Host AdminRuntimeHost
}

var adminFlows = map[string]AdminFlowDefinition{
    "fringe.admin.services.v1": {...},
    "fringe.admin.intake.v1": {...},
}

func (h *appHandler) handleAdminDSLStartFlow(w http.ResponseWriter, r *http.Request) {
    flowID := r.PathValue("flowId")
    def, ok := h.adminFlowRegistry.Lookup(flowID)
    if !ok { writeAdminDSLProtoError(...); return }
    if !h.authorizeAdminFlow(r, def.RequiredRole) { writeAdminDSLProtoError(...); return }

    session, result, err := h.adminDSLFlows.runtime.StartFlow(r.Context(), flowID, def.Source, admindsl.WithHost(def.Host))
    ...
}
```

This requires extending `pkg/admindsl.ScriptRuntime` so it can register host modules beyond `fringe/admin-dsl`.

## Auth and Authorization

This admin backend must not be publicly accessible.

Minimum policy:

- require authenticated user,
- require role `stylist` or `admin`,
- record actor id on every mutation,
- reject admin routes in anonymous/dev mode unless explicitly configured.

Suggested route behavior:

```text
401 unauthenticated -> AdminDslError{code: "admin_unauthenticated"}
403 missing role    -> AdminDslError{code: "admin_forbidden"}
```

Developer mode can map the existing dev user to an admin role, but the code should make that explicit.

## Validation Rules

### Config validation

Before publishing:

- exactly one draft config is selected,
- config version exists and status is `draft`,
- every enabled service option has non-empty category/value/title,
- service values are unique per category per config version,
- tone values are unique,
- budget values are unique,
- there is at least one budget option,
- there is a default price range fallback,
- `min_cents <= max_cents` when both exist,
- availability day values are ISO dates,
- enabled time slots have valid HH:MM values,
- preview render succeeds for every intake step,
- no required customer-facing copy key is empty.

### Request validation

Before creating an intake request:

- service category and service value are present,
- selected service exists in the session config version,
- selected time is enabled or explicitly accepted as request-only,
- photo upload references belong to the same session/user,
- estimate can be computed.

### Admin mutation validation

Before saving admin edits:

- actor is authorized,
- target belongs to selected draft config version,
- active config is immutable except publish status transition,
- optimistic revision/checksum matches if implemented,
- field-level errors are returned as structured errors.

## Error States to Implement

These screens and surfaces are not optional; they are where real issues will surface.

### Admin flow unavailable

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Admin flow unavailable                                                      │
│ Could not start fringe.admin.intake.v1.                                     │
│ Error: host/intake-admin module failed to initialize config DB.             │
│ [Retry] [Download diagnostics]                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Unauthorized

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Admin access required                                                       │
│ You are signed in, but this account does not have stylist/admin access.     │
│ [Back to booking site]                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stale action

```text
Toast: This admin page was already updated. Please retry your action.
```

### Publish validation failed

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Cannot publish draft                                                        │
│ 3 issues must be fixed first.                                               │
│                                                                             │
│ ✕ No default price range fallback                                           │
│ ✕ Time slot 25:99 is invalid                                                │
│ ✕ Service category color has duplicate value highlights                     │
│                                                                             │
│ [Go to pricing] [Go to availability] [Download report]                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Save conflict

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Save conflict                                                               │
│ This draft was changed in another admin session.                            │
│ [Reload latest] [Review differences]                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Empty requests

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ No new requests                                                             │
│ New customer submissions will appear here.                                  │
│ [Preview intake] [Manage availability]                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Missing upload blob

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Photo missing                                                               │
│ Upload metadata exists, but the blob store object could not be opened.      │
│ [Retry] [Mark missing] [Open request audit]                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Ticket scaffolding and design acceptance

Deliverables:

- this design guide,
- tasks/checklist,
- file relationships,
- reMarkable upload.

Acceptance:

- intern can explain current intake flow, config DB, Admin DSL transport, and target screens.

### Phase 2: Persistent admin domain schema

Deliverables:

- new schema file, likely `pkg/intakeadmin/schema.sql` or `pkg/dslhost/admin_schema.sql`,
- migrations/additive migration helpers,
- Go storage package, likely `pkg/intakeadmin`,
- tests for create request, list requests, config draft creation, publish transaction, audit events.

Suggested files:

```text
pkg/intakeadmin/store.go
pkg/intakeadmin/schema.sql
pkg/intakeadmin/migrations.go
pkg/intakeadmin/store_test.go
```

Acceptance:

- `go test ./pkg/intakeadmin -count=1` passes,
- old local DB can migrate without deletion,
- seed fixtures produce a useful admin dashboard.

### Phase 3: Intake request creation from customer confirm

Deliverables:

- update `pkg/dslgoja/flows/intake.flow.js` confirm action to call a host module instead of looping only,
- add host module, e.g. `require("host/intake")`, with `createRequest(state)` or `submitRequest(state)`,
- persist request and request events,
- relate photos from `dsl_uploads`.

Pseudocode:

```js
const intake = require("host/intake");

function confirmStep(ctx) {
  const submit = ctx.action("submitIntake", function () {
    const result = intake.createRequest({
      sessionId: ctx.sessionId,
      configVersionId: configVersion(ctx),
      state: ctx.state,
      estimate: estimateRange(ctx),
    });
    ctx.state.requestId = result.id;
    ctx.state.step = "submitted";
    return render(ctx);
  }, "submit");
}
```

Acceptance:

- finishing customer intake creates `intake_requests` row,
- admin request queue shows it.

### Phase 4: Admin runtime host modules

Deliverables:

- extend `pkg/admindsl.ScriptRuntime` with host module registration,
- implement `host/intake-admin`,
- implement `host/intake-preview`,
- add authorization context/actor snapshot.

Acceptance:

- Admin Goja flow can list and mutate real SQLite-backed data,
- all mutations audit actor/action.

### Phase 5: Admin flow registry and route

Deliverables:

- replace hard-coded admin flow switch in `pkg/server/handlers_admin_dsl.go`,
- register `fringe.admin.intake.v1`,
- add frontend route `/admin/intake`,
- preserve `/admin/services` as demo or remove it if superseded.

Acceptance:

- `/admin/intake` starts real intake admin flow,
- unauthorized requests fail cleanly.

### Phase 6: Dashboard and request review screens

Deliverables:

- dashboard,
- request queue,
- request detail,
- photo gallery modal,
- request status actions,
- internal notes.

Acceptance:

- a submitted customer intake appears in admin,
- admin can mark reviewing/contacted/needs info/archive,
- photo modal opens and error state is testable.

### Phase 7: Config version and service editor

Deliverables:

- config versions page,
- create draft from active,
- services/categories editor,
- validation drawer/errors,
- publish confirm modal.

Acceptance:

- edits are scoped to draft config,
- active config cannot be edited directly,
- publishing changes the active config used by new customer intake sessions.

### Phase 8: Tone, budget, pricing, availability editors

Deliverables:

- tone editor,
- budget editor,
- price range editor,
- availability editor,
- time slots editor.

Acceptance:

- all data read by `intake.flow.js` is editable through admin,
- preview catches invalid config before publish.

### Phase 9: Preview and validation

Deliverables:

- draft config preview,
- step selector,
- desktop/mobile preview panels,
- validation report.

Acceptance:

- every customer intake step can be rendered using the draft config,
- invalid draft blocks publish with actionable errors.

### Phase 10: Health, audit, and stress-test hardening

Deliverables:

- audit log screen,
- health screen,
- stale session cleanup action,
- diagnostics export,
- targeted test scripts and Playwright/css-visual-diff coverage.

Acceptance:

- expected operational failures have visible admin states,
- stress test findings are recorded as follow-up tasks/tickets.

## Testing Strategy

### Go unit tests

```bash
go test ./pkg/intakeadmin -count=1
go test ./pkg/admindsl ./pkg/dslgoja ./pkg/server -count=1
go test ./... -count=1
```

### Frontend tests

```bash
cd web
npx tsc --noEmit
pnpm test -- --runInBand
```

Add tests for:

- form value dispatch,
- field validation rendering,
- modal/drawer action dispatch,
- stale action toast/effect,
- unauthorized admin state,
- request queue empty/error/loading states.

### Browser smoke tests

Minimum Playwright scenarios:

1. Submit customer intake and verify request appears in admin.
2. Open request detail and photo modal.
3. Create draft config and edit a service.
4. Preview draft config.
5. Publish draft config.
6. Start a new customer intake and verify it uses the new config.
7. Trigger invalid draft and verify publish is blocked.
8. Try stale action and verify graceful toast.

### Visual tests

Use `css-visual-diff` or Playwright screenshots for:

- dashboard desktop/mobile,
- request queue desktop/mobile,
- request detail with photos,
- config editor drawer,
- publish modal,
- validation error summary,
- health screen.

## Stress-Test Questions

This project should deliberately answer these questions:

- Can Admin DSL express nested CRUD screens without becoming stringly/dynamic component soup?
- Do keyed actions, submit/cancel actions, and additional footer actions compose cleanly?
- Are uncontrolled form fields enough, or do we need richer field-level change events?
- Do duplicate desktop/mobile surfaces confuse accessibility and Playwright locators?
- Should Admin DSL sessions persist like customer DSL sessions?
- How should Goja host modules expose transactions and structured validation errors?
- Where should app-owned migrations live?
- Can draft preview reuse the customer DSL runtime safely?
- Does protobuf JSON remain manageable with large nested pages and modal surfaces?
- What happens when two admins edit the same draft?
- What is the minimum auth role model for this app?

## Open Decisions

- Whether `/admin/services` remains as a demo route or becomes `/admin/intake/config/services`.
- Whether all admin pages share one Admin DSL flow or each major section gets a separate flow id.
- Whether admin sessions are persisted immediately or after request/config functionality lands.
- Whether config DB and state DB remain separate files for production.
- Whether active config versions are immutable forever or can receive emergency hotfixes.
- Whether appointment creation belongs in this ticket or a follow-up once request review is complete.

## Recommended Intern Work Order

A new intern should not start by writing React. They should follow this order:

1. Read `pkg/dslgoja/flows/intake.flow.js` completely and write down every config table it reads.
2. Read `pkg/dslhost/config_schema.sql` and map each table to a customer intake step.
3. Read `pkg/server/handlers_dsl.go` to understand customer session persistence.
4. Read `pkg/server/handlers_admin_dsl.go` and `pkg/admindsl/script_runtime.go` to understand current Admin DSL transport/runtime.
5. Build `pkg/intakeadmin` storage and tests first.
6. Add customer request creation on confirm.
7. Add the admin host module.
8. Build one admin screen at a time, starting with Dashboard and Request Queue.
9. Add Storybook/MSW fixtures for each screen before adding all live backend states.
10. Use Playwright/css-visual-diff to catch visual and interaction problems.

## Appendix: Screen Coverage Checklist

- [ ] Dashboard
- [ ] Request queue
- [ ] Request empty state
- [ ] Request loading state
- [ ] Request error state
- [ ] Request detail
- [ ] Photo gallery modal
- [ ] Missing photo error modal
- [ ] Request status confirm modal
- [ ] Config versions
- [ ] Create draft modal
- [ ] Publish confirm modal
- [ ] Publish validation failed state
- [ ] Service options editor
- [ ] Service edit drawer
- [ ] Service validation errors
- [ ] Tone options editor
- [ ] Budget options editor
- [ ] Price range editor
- [ ] Availability day editor
- [ ] Time slot editor
- [ ] Draft customer preview
- [ ] Audit log
- [ ] Health diagnostics
- [ ] Unauthorized state
- [ ] Admin flow unavailable state
- [ ] Stale action toast/effect
- [ ] Save conflict modal

## Appendix: Data Coverage Checklist

- [ ] `dsl_config_versions`
- [ ] `dsl_service_options`
- [ ] `dsl_tone_options`
- [ ] `dsl_budget_options`
- [ ] `dsl_price_ranges`
- [ ] `dsl_availability_days`
- [ ] `dsl_time_slots`
- [ ] `dsl_copy_blocks`
- [ ] `dsl_flow_sessions`
- [ ] `dsl_uploads`
- [ ] `dsl_audit_events`
- [ ] `intake_requests`
- [ ] `intake_request_events`
- [ ] `admin_audit_events`
- [ ] `admin_flow_sessions`

## Final Target State

When HAIR-041 is complete, an admin can run the whole salon intake back office through the Admin DSL system:

1. A customer completes the intake flow.
2. The confirm step writes a real intake request to disk.
3. The admin dashboard shows the request.
4. The admin opens the request, reviews photos, and updates status.
5. The admin edits a draft intake config.
6. The admin previews the draft customer flow.
7. The admin publishes the draft.
8. New customer sessions use the published config.
9. Every mutation is audited.
10. Errors, stale actions, upload issues, and invalid configs have explicit screens.

That target state will validate whether the Admin DSL architecture is ready for real production-style operations, not just Storybook/demo screens.
