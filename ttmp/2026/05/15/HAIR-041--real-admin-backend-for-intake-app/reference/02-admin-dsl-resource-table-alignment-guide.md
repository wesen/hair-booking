---
Title: Admin DSL Resource Table Alignment Guide
Ticket: HAIR-041
Status: active
Topics:
    - frontend
    - admin-dsl
    - storybook
    - renderer
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/alignment-reference/01-request-triage-baseline-question.png
      Note: Screenshot that motivated the alignment guide
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/alignment-reference/01-request-triage-baseline-question.png:Screenshot that motivated this guide.
    - Path: web/src/admin-dsl/AdminDslWorkbench.stories.tsx
      Note: Defines Request Triage columns
    - Path: web/src/admin-dsl/AdminDslWorkbench.stories.tsx:Defines the Request Triage story data, columns, rows, and bulk Assign action.
    - Path: web/src/admin-dsl/actions.ts
      Note: Defines action normalization and primary/danger helpers used by button styling
    - Path: web/src/admin-dsl/actions.ts:Normalizes action props and defines action intent helpers used by renderer button styling.
    - Path: web/src/admin-dsl/builder.ts
      Note: Builds plain JSON resourceTable and action objects used by Storybook
    - Path: web/src/admin-dsl/builder.ts:Creates the Storybook resource.table and action.secondary JSON used by the renderer.
    - Path: web/src/admin-dsl/render.tsx
      Note: Owns resourceTable rendering
    - Path: web/src/admin-dsl/render.tsx:Interprets resourceTable nodes and owns table row, cell, bulk action bar, and button rendering.
    - Path: web/src/admin-dsl/schema.ts
      Note: Declares Admin DSL JSON node/action shapes and placements
    - Path: web/src/admin-dsl/schema.ts:Declares the JSON shapes for resourceTable nodes and AdminActionRef placement values.
ExternalSources: []
Summary: Explains how Request Triage resource-table cells and bulk actions render, where to align cell baselines, and where to style the Assign secondary action.
LastUpdated: 2026-05-17T10:32:54.244662004-04:00
WhatFor: Use when adjusting Admin DSL v2 resource-table row alignment, cell typography, row actions, or the Request Triage bulk Assign button.
WhenToUse: When a table row looks vertically misaligned, when a badge/text/action baseline does not match, or when changing secondary bulk action styling.
---


# Admin DSL Resource Table Alignment Guide

## Goal

This guide explains how the Request Triage table in the Admin DSL v2 Storybook workbench is assembled, rendered, and styled. It answers two practical questions: where to align the Status, Customer, Service, and Actions content so their visual baselines match, and where to modify the look of the secondary `Assign` action in the bulk action bar.

The guide is written for a developer who is about to edit the implementation. It starts from the JSON story definition, follows the renderer path, then identifies the exact functions and style objects that control the visible result.

## Context

The screenshot stored at `various/alignment-reference/01-request-triage-baseline-question.png` shows the `Request Triage` Storybook example. The table is generated from a semantic `resourceTable` node. The story declares columns and rows as JSON; the renderer interprets that JSON into a `<table>`, cells, row actions, checkboxes, and the bulk action bar.

The important design constraint is that this is not a custom React table for one story. The Storybook example uses the same generic Admin DSL renderer path that live backend pages use. A change in the renderer affects every `resourceTable` unless it is gated by a column kind, class name, prop, or placement.

## Quick Reference

### The files involved

| File | Role |
| --- | --- |
| `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` | Defines the Request Triage story: `requestColumns`, `requestRows`, `requestTriagePage()`, and the `Assign` bulk action. |
| `web/src/admin-dsl/builder.ts` | Converts `resource.table(...)` and `action.secondary(...)` builder calls into plain JSON nodes/actions. |
| `web/src/admin-dsl/schema.ts` | Defines the TypeScript JSON boundary: `AdminNode`, `AdminPage`, `AdminActionRef`, and action placements such as `bulkToolbar`, `row`, and `rowOverflow`. |
| `web/src/admin-dsl/render.tsx` | Renders the JSON page. This is where table cell baseline alignment and bulk button style are currently controlled. |
| `web/src/admin-dsl/actions.ts` | Provides `actionList`, `dispatchAdminAction`, `actionIsPrimary`, and `actionIsDanger`. The bulk button style asks these helpers whether an action should look primary or danger. |

### The functions and constants involved

| Symbol | File | What it controls |
| --- | --- | --- |
| `requestColumns` | `AdminDslWorkbench.stories.tsx` | Which table columns exist and which `kind` each column uses. `status` uses `kind: "badge"`; `actions` uses `kind: "actions"`. |
| `requestRows` | `AdminDslWorkbench.stories.tsx` | Row data consumed by each column. Row-level review actions live in `row.actions`. |
| `requestTriagePage()` | `AdminDslWorkbench.stories.tsx` | Builds the page, panel, `resource.table(...)`, `bulkLabel`, and `bulkActions`. |
| `resource.table(...)` | `builder.ts` | Builds a `resourceTable` node with `{ id, columns, rows, ...props }`. |
| `action.secondary(...)` | `builder.ts` | Builds the `Assign` action as a neutral secondary mutation. |
| `renderAdminNode(...)` | `render.tsx` | Dispatches on `node.kind`. The `case "resourceTable"` block creates the bulk bar and `<table>`. |
| `renderTableCell(...)` | `render.tsx` | Dispatches on `column.kind`. It renders badges, normal text, and row action cells. |
| `renderActions(...)` | `render.tsx` | Renders generic action buttons, including row `Review →` controls when `renderTableCell` sees `kind: "actions"`. |
| `actionIsPrimary(...)` | `actions.ts` | Determines whether the renderer gives a button primary styling. |
| `actionIsDanger(...)` | `actions.ts` | Determines whether the renderer gives a button danger styling. |

## Sequence of Events

### 1. The story declares semantic table data

The Request Triage story starts in `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`. The columns define what each table cell means.

```ts
const requestColumns: AdminJsonObject[] = [
  { id: "status", kind: "badge", label: "Status", map: { ... } },
  { id: "customer", kind: "text", label: "Customer", primary: true },
  { id: "service", kind: "text", label: "Service" },
  { id: "budget", kind: "money", label: "Budget" },
  { id: "submitted", kind: "relativeTime", label: "Submitted" },
  { id: "actions", kind: "actions", label: "Actions" },
];
```

The row values are plain JSON. The `actions` column does not contain visible text. It points at `row.actions`, and `renderTableCell` turns those action objects into buttons.

```ts
const requestRows: AdminJsonObject[] = [
  {
    id: "req_1001",
    status: "new",
    customer: "Maya Chen",
    service: "Highlights",
    budget: "$220–$380",
    submitted: "4m ago",
    actions: [
      action.open("request.review", "Review", { id: "req_1001" })
        .placement("row")
        .toJSON(),
    ],
  },
];
```

The `Assign` button is defined in the table props, not in a row. It is a bulk action with `placement: "bulkToolbar"`.

```ts
resource.table("requests", requestColumns, requestRows, {
  bulkLabel: "3 visible requests",
  bulkActions: [
    action.secondary("requests.bulkAssign", "Assign")
      .placement("bulkToolbar")
      .toJSON(),
  ],
});
```

### 2. The builder emits plain JSON

`resource.table(...)` in `web/src/admin-dsl/builder.ts` returns an `AdminNodeBuilder` for a `resourceTable` node.

```ts
table: (id, columns, rows, props = {}) =>
  node("resourceTable", { id, columns, rows, ...props }).id(id)
```

`action.secondary(...)` returns an action object with neutral intent and secondary priority.

```ts
secondary: (target, label, payload) =>
  new AdminActionBuilder(makeAction("mutation", target, label, payload))
    .intent("neutral")
    .priority("secondary")
```

By the time the renderer sees the page, there are no builders left. There is only JSON. That distinction matters because visual changes must either alter the JSON shape in the story or alter the renderer that interprets the JSON.

### 3. The renderer enters the `resourceTable` branch

`AdminPageRenderer` eventually calls `renderAdminNode(...)` for each node. For the Request Triage table, `node.kind` is `"resourceTable"`, so the renderer enters this block in `web/src/admin-dsl/render.tsx`:

```tsx
case "resourceTable": {
  const columns = jsonArray<AdminJsonObject>(props, "columns");
  const rows = jsonArray<AdminJsonObject>(props, "rows");
  const tableActions = actionList(props);
  const rowAction = tableActions.find((a) => a.placement === "row") || tableActions[0];
  const bulkActions = jsonArray<AdminActionRef>(props, "bulkActions").filter(isActionRef);
  const selectable = bool(props, "selectable") || bulkActions.length > 0;
  ...
}
```

Because `bulkActions.length > 0`, `selectable` becomes true. That is why the screenshot shows checkboxes at the start of each row.

### 4. The bulk action bar renders `Assign`

Still inside the `resourceTable` branch, this expression renders the top bar that contains `3 visible requests` and `Assign`:

```tsx
{bulkActions.length > 0 &&
  <div className="adminDslBulkActionBar" style={{ ... }}>
    <span style={{ ...type.meta, color: color.softInk }}>
      {str(props, "bulkLabel", "Bulk actions")}
    </span>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {bulkActions.map((bulkAction, i) =>
        <button
          key={actionKey(bulkAction, i)}
          type="button"
          className="adminDslActionButton"
          onClick={() => dispatchAdminAction(ctx, node, bulkAction, { scope: "visible", rows })}
          style={{ ... }}
        >
          {bulkAction.label || bulkAction.target}
        </button>
      )}
    </div>
  </div>}
```

This is the first place to modify the look of the `Assign` button. The button style is inline today, and it uses `actionIsPrimary` and `actionIsDanger` to choose colors.

### 5. The table renders one `<td>` per column

For each row, the renderer loops over `columns`:

```tsx
{columns.map((column) =>
  <td
    key={String(column.id)}
    data-label={String(column.label || column.id || "")}
    data-column-kind={String(column.kind || "text")}
    style={{ ...type.bodySm, padding: "12px 14px", verticalAlign: "top" }}
  >
    {renderTableCell(column, row, node, ctx)}
  </td>
)}
```

This is the primary baseline alignment point. The current `verticalAlign: "top"` tells the browser to align table-cell content against the top of the cell. If Status, Customer, Service, and Actions should share a visual baseline, this is the first style to change.

### 6. `renderTableCell` chooses the content renderer

`renderTableCell(...)` receives the column definition and row object. It computes the column kind.

```tsx
function renderTableCell(column, row, node, ctx) {
  const id = String(column.id || column.accessor || "");
  const accessor = String(column.accessor || id);
  const value = row[accessor];
  const kind = String(column.kind || "text");
  ...
}
```

For the Request Triage columns:

| Column | `kind` | Renderer path |
| --- | --- | --- |
| Status | `badge` | `if (kind === "badge")` returns `<span className="adminDslStatusText">...` |
| Customer | `text` | final fallback returns `<span style={{ fontWeight: ... }}>...` |
| Service | `text` | final fallback returns `<span style={{ fontWeight: ... }}>...` |
| Actions | `actions` | `if (kind === "overflowActions" || kind === "actions")` returns `renderActions(...)` |

The baseline mismatch comes from mixing these content types inside cells:

- status is an inline-flex span with `minHeight: 24` and `alignItems: "center"`
- text cells are normal inline spans
- actions are buttons inside a flex action container
- the parent `<td>` uses top vertical alignment

## How to Align the Status, Customer, Service, and Actions Baselines

### Preferred first change: center the table cell content vertically

Start with the `<td>` style in the `resourceTable` case of `renderAdminNode(...)`.

Current code:

```tsx
<td
  key={String(column.id)}
  data-label={String(column.label || column.id || "")}
  data-column-kind={String(column.kind || "text")}
  style={{ ...type.bodySm, padding: "12px 14px", verticalAlign: "top" }}
>
  {renderTableCell(column, row, node, ctx)}
</td>
```

Change `verticalAlign` to `middle`:

```tsx
style={{
  ...type.bodySm,
  padding: "12px 14px",
  verticalAlign: "middle",
}}
```

This makes the table-cell boxes line up vertically when one cell contains a 24px status span and another contains a button or plain text. This is the least invasive change because it preserves the semantic table and does not alter individual cell renderers.

### Preferred second change: normalize cell content line boxes

If `verticalAlign: "middle"` is not enough, normalize the direct content returned by `renderTableCell(...)`.

For the badge/status path, the current code is:

```tsx
return (
  <span
    className="adminDslStatusText"
    style={{
      display: "inline-flex",
      alignItems: "center",
      minHeight: 24,
      color: badgeColors.color,
      fontWeight: 700,
      ...type.bodySm,
    }}
  >
    {label}
  </span>
);
```

For baseline alignment, make text and badge cells share the same minimum line box. A small helper keeps the change consistent:

```tsx
const tableCellText: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 32,
  lineHeight: 1.4,
};
```

Then use it for both badge and text cells:

```tsx
return (
  <span
    className="adminDslStatusText"
    style={{
      ...tableCellText,
      color: badgeColors.color,
      fontWeight: 700,
      ...type.bodySm,
    }}
  >
    {label}
  </span>
);
```

and in the text fallback:

```tsx
return (
  <span
    style={{
      ...tableCellText,
      fontWeight: column.primary ? 800 : 400,
      color: column.tone === "muted" ? color.softInk : color.ink,
      ...type.bodySm,
    }}
  >
    {String(value ?? "")}
  </span>
);
```

This change makes Status, Customer, and Service occupy comparable inline-flex boxes. It is useful when visual alignment must remain stable across different fonts, badge labels, or row action buttons.

### Preferred third change: make action buttons use the same row line box

The `actions` column calls `renderActions(...)`. The subtle row actions are produced in `renderActions`, which currently sets `minHeight` based on whether the action is primary, danger, or subtle.

The row action in the screenshot is `Review →`. It is subtle because it is a row action and not primary or danger:

```tsx
const subtle = !primary && !danger &&
  (actionRef.presentation === "link" ||
   actionRef.placement === "row" ||
   actionRef.placement === "panelFooter" ||
   actionRef.placement === "rowOverflow" ||
   actionRef.placement === "formFooter");
```

If the action baseline still sits too high or too low, adjust the subtle button style in `renderActions(...)`:

```tsx
style={{
  minHeight: subtle ? 32 : 38,
  padding: subtle ? "6px 8px" : formPrimary ? "9px 16px" : "8px 12px",
  display: "inline-flex",
  alignItems: "center",
  lineHeight: 1.4,
  ...
}}
```

`display: "inline-flex"`, `alignItems: "center"`, and a shared `lineHeight` are the important pieces. They make the button text participate in the same vertical rhythm as table text.

## Where to Modify the Look of `Assign`

The `Assign` button is not a row action. It is a bulk toolbar action. It is created in `requestTriagePage()`:

```ts
bulkActions: [
  action.secondary("requests.bulkAssign", "Assign")
    .placement("bulkToolbar")
    .toJSON(),
]
```

There are two places to change its appearance.

### Option A: Change only this story's action semantics

Edit `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` if the story should present `Assign` differently without changing global renderer behavior.

Examples:

```ts
action.primary("requests.bulkAssign", "Assign")
  .placement("bulkToolbar")
  .toJSON()
```

This makes `Assign` a primary action, so `actionIsPrimary(...)` returns true and the existing renderer gives it primary styling.

```ts
action.secondary("requests.bulkAssign", "Assign")
  .placement("bulkToolbar")
  .presentation("link")
  .toJSON()
```

This preserves secondary semantics but gives the renderer more information if you add placement/presentation-specific styling.

Use this option when Request Triage is the only place that should change.

### Option B: Change all bulk secondary actions in the renderer

Edit the bulk action button style in `web/src/admin-dsl/render.tsx`, inside the `resourceTable` case. This is the global place for buttons rendered from `props.bulkActions`.

Current code path:

```tsx
{bulkActions.map((bulkAction, i) =>
  <button
    key={actionKey(bulkAction, i)}
    type="button"
    className="adminDslActionButton"
    onClick={() => dispatchAdminAction(ctx, node, bulkAction, { scope: "visible", rows })}
    style={{
      minHeight: 34,
      border: `1px solid ${actionIsDanger(bulkAction) ? color.danger : color.ink}`,
      background: actionIsPrimary(bulkAction) ? color.ink : color.paper,
      color: actionIsPrimary(bulkAction) ? color.paper : actionIsDanger(bulkAction) ? color.danger : color.ink,
      borderRadius: radius.pill,
      padding: "7px 11px",
      fontFamily: font.mono,
      fontSize: 10,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      cursor: "pointer",
    }}
  >
    {bulkAction.label || bulkAction.target}
  </button>
)}
```

To make secondary bulk actions look less like pills and more like the newer rectangular action style, change this style object. A v2-consistent starting point is:

```tsx
const bulkPrimary = actionIsPrimary(bulkAction);
const bulkDanger = actionIsDanger(bulkAction);

style={{
  minHeight: 34,
  border: `1px solid ${bulkDanger ? color.danger : bulkPrimary ? color.ink : color.rule}`,
  background: bulkPrimary ? color.ink : color.paper,
  color: bulkPrimary ? color.paper : bulkDanger ? color.danger : color.ink,
  borderRadius: radius.md,
  padding: "7px 12px",
  fontFamily: font.mono,
  fontSize: 10,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  cursor: "pointer",
}}
```

Use this option when every `bulkToolbar` secondary action should inherit the same visual language.

### Option C: Route bulk actions through `renderActions(...)`

The current bulk action code hand-renders a button instead of delegating to `renderActions(...)`. If you want bulk actions to share all generic action styling, replace the inner `bulkActions.map(...)` with:

```tsx
{renderActions(node, ctx, bulkActions)}
```

Before making this change, check the dispatch payload. The current bulk button dispatches `{ scope: "visible", rows }` as the value:

```tsx
dispatchAdminAction(ctx, node, bulkAction, { scope: "visible", rows })
```

`renderActions(...)` does not know about this table-specific bulk payload. If bulk actions need that payload, either keep the custom map or extend `renderActions` to accept a value factory. Do not silently remove the payload unless the backend action handler does not need selected/visible-row context.

## Minimal Code Change for Baseline Alignment

Start here if the desired change is only baseline alignment.

In `web/src/admin-dsl/render.tsx`, inside the `resourceTable` case, change every table body cell from top alignment to middle alignment:

```diff
- style={{ ...type.bodySm, padding: "12px 14px", verticalAlign: "top" }}
+ style={{ ...type.bodySm, padding: "12px 14px", verticalAlign: "middle" }}
```

Then, if row action text still does not sit correctly, update `renderActions(...)` so action buttons are inline-flex centered:

```diff
  style={{
    minHeight: subtle ? 32 : 38,
+   display: "inline-flex",
+   alignItems: "center",
+   justifyContent: "center",
+   lineHeight: 1.4,
    ...
  }}
```

Then, if badge/text cells still differ, add a shared table-cell text style and use it from `renderTableCell(...)` for both badge and text returns.

## Minimal Code Change for `Assign` Styling

Start here if the desired change is only the `Assign` button shape.

In `web/src/admin-dsl/render.tsx`, inside the `resourceTable` bulk action bar, change the button radius:

```diff
- borderRadius: radius.pill,
+ borderRadius: radius.md,
```

If the button should look lighter, also change the neutral border from ink to rule:

```diff
- border: `1px solid ${actionIsDanger(bulkAction) ? color.danger : color.ink}`,
+ border: `1px solid ${actionIsDanger(bulkAction) ? color.danger : actionIsPrimary(bulkAction) ? color.ink : color.rule}`,
```

This keeps primary and danger actions visually distinct while making neutral secondary bulk actions calmer.

## Usage Examples

### Example 1: Make all resource table rows vertically calmer

1. Open `web/src/admin-dsl/render.tsx`.
2. Find the `case "resourceTable"` block in `renderAdminNode(...)`.
3. Find the `<td>` generated by `columns.map(...)`.
4. Change `verticalAlign: "top"` to `verticalAlign: "middle"`.
5. Run:

```bash
cd web && npx tsc --noEmit
cd web && pnpm test -- --runInBand
```

6. Re-capture the Request Triage Storybook iframe screenshot:

```bash
node ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/04-capture-admin-dsl-v2-storybook.mjs
```

### Example 2: Change only the Request Triage `Assign` action to primary

1. Open `web/src/admin-dsl/AdminDslWorkbench.stories.tsx`.
2. Find `requestTriagePage()`.
3. Find the `bulkActions` prop passed to `resource.table("requests", ...)`.
4. Change `action.secondary(...)` to `action.primary(...)`.
5. Re-run Storybook capture and review the screenshot.

This changes the story data, not the renderer. Use this when the story should communicate that assigning requests is the main operation.

### Example 3: Change all secondary bulk-toolbar buttons globally

1. Open `web/src/admin-dsl/render.tsx`.
2. Find `className="adminDslBulkActionBar"`.
3. Find the nested `<button className="adminDslActionButton">` style.
4. Change neutral secondary styling there.
5. Run TypeScript and tests.
6. Review every Storybook story that uses `bulkActions`, not only Request Triage.

## Related

- `web/src/admin-dsl/AdminDslWorkbench.stories.tsx` — Request Triage story source.
- `web/src/admin-dsl/render.tsx` — Resource table and action rendering.
- `web/src/admin-dsl/actions.ts` — Action normalization and primary/danger classification.
- `ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/alignment-reference/01-request-triage-baseline-question.png` — Screenshot reference for this guide.
