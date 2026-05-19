---
Title: Admin DSL Widget Design System Review Playbook
Ticket: HAIR-041
Status: active
Topics:
    - frontend
    - admin-dsl
    - design-system
    - react
    - code-review
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/03-widget-ir-to-finished-widget-playbook.md
      Note: Implementation workflow companion for promoting widgets from IR
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/15-design-language.yaml
      Note: |-
        Design-language IR source for shared helper generation
        Design-language IR to extend for missing shared visual primitives
    - Path: web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx
      Note: Example of duplicated pill styling that should move to shared design helpers
    - Path: web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx
      Note: Example of duplicated tab/filter pill styling
    - Path: web/src/admin-dsl/widgets/shared/actionStyles.ts
      Note: |-
        Generated action/button/nav style helpers and placement defaults
        Generated shared action style helper target
    - Path: web/src/admin-dsl/widgets/shared/dataAttributes.ts
      Note: Generated Admin DSL data-attribute helpers
    - Path: web/src/admin-dsl/widgets/shared/designTokens.ts
      Note: Generated token aliases that promoted widgets should prefer over raw visual constants
    - Path: web/src/admin-dsl/widgets/shared/layoutStyles.ts
      Note: |-
        Generated layout/surface/page helpers
        Generated shared layout/surface helper target
    - Path: web/src/admin-dsl/widgets/shared/typography.ts
      Note: Generated typography role helpers
ExternalSources: []
Summary: Review checklist and remediation playbook for keeping Admin DSL widgets aligned with the generated design-language helpers, Fringe tokens, shared action widgets, and consistent visual grammar.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Use when reviewing promoted Admin DSL widgets for hardcoded CSS, duplicated button styles, raw token drift, local one-off controls, and inconsistent use of generated shared design helpers.
WhenToUse: Use before merging a widget promotion, after scaffolding/implementation, during visual cleanup, and whenever a component contains inline styles, raw token imports, button-like controls, pills, surfaces, or typography decisions.
---


# Admin DSL Widget Design System Review Playbook

## Purpose

This playbook is a precise review checklist for Admin DSL widgets. Its job is to prevent the widget extraction from turning into many small islands of local CSS. The Admin DSL widget layer must follow one graphic system: shared tokens, shared typography roles, shared action variants, shared surfaces, and shared layout primitives.

A component is not done merely because it compiles and renders. It is done when its visual decisions are either:

1. expressed through generated shared helpers from `web/src/admin-dsl/widgets/shared/*`, or
2. intentionally local to the component and documented as such.

If two widgets solve the same visual problem differently, the design system has already started to drift.

## Source of Truth

Review in this order:

1. `sources/admin-dsl-widget-ir/15-design-language.yaml`
2. generated files in `web/src/admin-dsl/widgets/shared/`
3. existing promoted widgets that already use shared helpers:
   - `ActionButton`
   - `ActionGroup`
   - `WorkbenchShell`
   - `DefaultAdminShell`
   - `PageHeader`
   - `DashboardGrid`
   - `Panel`
4. the component under review
5. `render.tsx` adapter code

The source YAML defines intent. The generated shared helpers define the current implementation API. Widgets should not invent new visual grammar without first checking these sources.

## Hard Rule

A promoted widget should not duplicate design-system decisions.

Bad patterns:

```tsx
const sharedStyle = {
  minHeight: 38,
  borderRadius: radius.pill,
  padding: "8px 12px",
  border: `1px solid ${active ? color.ink : color.rule}`,
  background: active ? color.ink : color.paper,
  color: active ? color.paper : color.ink,
  ...type.meta,
};
```

This is exactly the kind of local mini-design-system that causes drift. If this appears in `FilterBar`, `Tabs`, `Toolbar`, table filters, or row actions, prefer a shared helper or a shared widget.

Better options:

```tsx
<ActionGroup actions={actions} slot="toolbar" ... />
```

or, if the control is not a backend action button but still part of the Admin DSL visual language:

```tsx
const style = selectionPillStyle({ active, size: "md" });
```

If `selectionPillStyle(...)` does not exist yet and multiple widgets need it, add it to `15-design-language.yaml`, regenerate shared helpers, and refactor consumers.

## Review Checklist

### 1. Imports

Look at imports first.

Allowed and preferred:

```ts
import {
  actionButtonStyle,
  adminActionRowStyle,
  adminSurfaceStyle,
  adminTextStyle,
  adminTokens,
  dataAttrsFromRecord,
  widgetDataAttributes,
} from "../../shared";
```

Raw token imports require scrutiny:

```ts
import { color, radius, type } from "../../../../fringe-ui/tokens";
```

Raw token imports are allowed only when the widget has a genuinely local visual shape that is not already covered by shared helpers. If the raw tokens are used to build a button, pill, badge, panel, page shell, action row, typography role, or table surface, that is probably a design-system violation.

Review questions:

- Is this component importing raw `color`, `radius`, `shadow`, `font`, or `type`?
- Is the import only for a local visual detail, or is it recreating a shared primitive?
- Could the code use `adminTokens`, `adminTextStyle`, `adminSurfaceStyle`, `actionButtonStyle`, or `ActionGroup` instead?
- Does the component import `ActionButton` or `ActionGroup` for action-like controls?

### 2. Buttons and Clickable Controls

Button-like controls must be classified before review.

| Control type | Preferred implementation |
|---|---|
| Backend/Admin DSL action | `ActionButton` or `ActionGroup` |
| Action list in a slot | `ActionGroup` with the correct `slot` |
| Shell navigation | shell/nav helper such as `sidebarNavButtonStyle(...)` |
| Selection pill / tab / filter | shared selection/pill helper; add one if missing |
| Table row overflow | `ActionButton`/`ActionGroup` or shared overflow helper |
| Plain form submit in Admin DSL | `ActionButton` style helper or `ActionGroup` form slot |

Review questions:

- Does the component render a `<button>`?
- Is that button actually an Admin DSL action? If yes, why is it not `ActionButton` or `ActionGroup`?
- If it is a selection control, does it use a shared selection/pill helper?
- Does it manually set `minHeight`, `borderRadius`, `padding`, `fontFamily`, `textTransform`, or active/inactive colors?
- Does it encode action placement locally instead of using `actionPlacementDefaults`?

Current issue example:

```tsx
// FilterBar / Tabs pattern to fix
const sharedStyle = {
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: radius.pill,
  padding: "8px 12px",
  border: `1px solid ${active ? color.ink : color.rule}`,
  background: active ? color.ink : color.paper,
  color: active ? color.paper : color.ink,
  ...type.meta,
};
```

This should become a shared helper, for example:

```ts
selectionPillStyle({ active, disabled, size: "md" })
```

and that helper should be generated from `15-design-language.yaml`.

### 3. Typography

Typography should use named roles, not ad hoc token spreads.

Preferred:

```tsx
<h3 style={{ ...adminTextStyle("panelTitle"), margin: 0 }}>{title}</h3>
<p style={{ ...adminTextStyle("bodyMuted"), color: adminTokens.text.muted }}>{subtitle}</p>
```

Suspicious:

```tsx
<div style={{ ...type.meta, color: color.softInk, fontWeight: 800 }}>
```

Review questions:

- Does the component use `type.*` directly?
- Is there an existing typography role for this text?
- Is the component inventing a new font size, weight, letter spacing, or uppercase treatment?
- If a new role is needed, should it be added to `15-design-language.yaml`?

Required shared roles for common Admin DSL UI:

- page title: `pageTitle`
- panel title: `panelTitle`
- eyebrow/kicker: `eyebrow`
- body text: `body`
- muted body text: `bodyMuted`
- action label: `actionLabel` / `subtleActionLabel`
- nav label: `navLabel`

### 4. Surfaces and Borders

Panels, cards, tables, empty states, search boxes, and overlays should not each define their own surface recipe.

Preferred:

```tsx
style={{ ...adminSurfaceStyle, overflow: "hidden", ...style }}
```

Suspicious:

```tsx
style={{
  background: color.paper,
  border: `1px solid ${color.rule}`,
  borderRadius: radius.lg,
  boxShadow: shadow.sm,
}}
```

Review questions:

- Is the component recreating `adminSurfaceStyle`?
- Are border colors from `adminTokens.borders.*`?
- Are backgrounds from `adminTokens.surfaces.*`?
- Are radius choices from shared aliases?
- Is `boxShadow` local? If yes, why?

### 5. Layout and Spacing

Layout primitives should be shared when they describe common Admin DSL structure.

Preferred:

```tsx
adminActionRowStyle({ gap: 8, justifyContent: "flex-end" })
adminShellGridStyle({ hasSide })
adminPageRootStyle({ shellKind })
```

Suspicious:

```tsx
style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
```

This is acceptable for truly local layout, but repeated action-row, toolbar-row, footer-row, panel-body, table-toolbar, or shell-grid layouts should be helpers.

Review questions:

- Is this layout pattern repeated in another widget?
- Is this an action row? Use `adminActionRowStyle(...)`.
- Is this a page/shell/grid/surface pattern? Use existing layout helpers.
- Are responsive rules local to the widget and named with the widget class?

### 6. Data Attributes

Widgets should use generated helpers for repeated Admin DSL data attributes.

Preferred:

```tsx
{...widgetDataAttributes(metadata.widgetId, metadata.classification.level)}
{...dataAttrsFromRecord(dataAttributes)}
{...actionDataAttributes(action)}
```

Suspicious:

```tsx
data-admin-dsl-widget-id="admin.layout.filter-bar"
data-admin-dsl-action-placement={placement}
```

Review questions:

- Is the widget manually writing repeated `data-admin-dsl-*` attributes?
- Is it using the metadata sidecar for widget id?
- Are caller-supplied data attributes normalized through `dataAttrsFromRecord(...)`?

### 7. Renderer Adapter Boundary

`render.tsx` may parse raw Admin DSL JSON. Widgets should not.

Forbidden in widgets:

- `AdminNode`
- `AdminPage`
- `AdminJsonObject`
- `dispatchAdminAction`
- `jsonArray(...)`
- `jsonObject(...)`
- `str(...)` / `bool(...)` from renderer utilities

Review questions:

- Does the widget import schema or renderer utilities?
- Does it know about raw Admin DSL transport JSON?
- Does it dispatch backend actions directly?
- Does it receive typed props and emit typed callbacks instead?

### 8. Manual Edit Changelog

Every generated file that is hand-promoted must explain its manual changes near the top.

Required pattern:

```ts
/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 * ... provenance ...
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 80: Promoted scaffold to composed ResourceTable implementation.
 * - 2026-05-18 / HAIR-041 Step 80: Replaced generated generic stories with focused fixtures.
 */
```

Review questions:

- Does the generated file have manual edits?
- If yes, does it have a manual edit changelog?
- Does the changelog explain why the edit happened, not just what line changed?

## Component-Specific Checks

### FilterBar and Tabs

These are the current canonical example of what to improve next.

Current risk:

- Both manually construct pill button styles.
- The style is similar to a design-system primitive but is not shared.
- Raw tokens are used directly.

Required remediation:

1. Add selection/filter pill semantics to `15-design-language.yaml`, for example:

```yaml
selection_variants:
  pill:
    inactive:
      borderColor: color.rule
      background: color.paper
      color: color.ink
    active:
      borderColor: color.ink
      background: color.ink
      color: color.paper
    size:
      minHeight: 38
      padding: "8px 12px"
      borderRadius: radius.pill
      typography: type.meta
```

2. Update `06-generate-admin-dsl-design-language.py` to emit a helper such as:

```ts
selectionPillStyle({ active, disabled }): CSSProperties
```

3. Refactor `FilterBar` and `Tabs` to call that helper.

4. Add Storybook variants for active/inactive, long labels, disabled/no-action, and mobile wrapping.

### ResourceTable

Review priorities:

- Table surface should use `adminSurfaceStyle`.
- Bulk toolbar should use shared action row and `ActionGroup`.
- Row actions should use `ActionGroup` or `ActionButton`.
- Badge/status colors should move to shared tone helpers if reused by `StatusText` or data-display widgets.
- Cell vertical alignment must be consistent and intentional.

### Panel

Review priorities:

- Surface must use `adminSurfaceStyle`.
- Titles should use `adminTextStyle(...)`.
- Toolbar/footer actions should use `ActionGroup`.
- Density padding should become shared if repeated elsewhere.

### SearchBox

Review priorities:

- Surface should use `adminSurfaceStyle`.
- Submit button should use `actionButtonStyle(...)` or `ActionButton` if callback semantics allow.
- Input typography should use a typography role if the pattern repeats in form widgets.

## Review Workflow

For each component:

1. Read the component `.tsx`.
2. List every raw token import.
3. List every `<button>`.
4. List every inline style object with:
   - color
   - background
   - border
   - borderRadius
   - boxShadow
   - fontFamily
   - fontSize
   - letterSpacing
   - textTransform
   - padding
   - minHeight
5. Classify each style as:
   - shared helper already used;
   - should use existing shared helper;
   - needs new design-language helper;
   - truly local exception.
6. Check Storybook stories for active/inactive/disabled/mobile/callback states.
7. Record required remediation before approving.

## Suggested Scriptable Checks

A future linter should flag:

```text
web/src/admin-dsl/widgets/**/*.tsx
```

Warnings:

- raw `fringe-ui/tokens` import in promoted widgets;
- hex colors or `rgba(...)` in widget files;
- local functions named `buttonStyle`, `variantForSlot`, `sizeForSlot`, `pillStyle`, `sharedStyle`;
- manual `data-admin-dsl-widget-id` outside shared helpers;
- `<button` without `ActionButton`, `ActionGroup`, or documented structural-control exception;
- `borderRadius`, `boxShadow`, `fontFamily`, `textTransform`, `letterSpacing` in inline styles;
- `dispatchAdminAction` imported outside renderer adapters.

Allowlist examples:

- generated files under `widgets/shared/*`;
- Storybook-only fixture containers;
- documented local exceptions with `// admin-dsl-design-ok: reason`.

## Definition of Done for Design-System Review

A widget passes review when:

- it uses generated shared helpers for common surfaces, typography, actions, data attributes, and layout;
- any raw token usage is local, minimal, and justified;
- action-like controls use `ActionButton`/`ActionGroup` or a shared structural-control helper;
- selection/filter controls do not duplicate pill styling locally;
- raw Admin DSL parsing remains in the adapter;
- generated files with manual edits include a top-of-file manual edit changelog;
- Storybook demonstrates the visual states that the component owns;
- validation passes:

```bash
cd web && npx tsc --noEmit
cd web && pnpm test -- --runInBand
cd web && npx storybook build --quiet
```

## Immediate Findings to Address

The following should be reviewed soon:

- `FilterBar.tsx` and `Tabs.tsx` duplicate pill styling. Add a shared selection pill helper and refactor both.
- `ResourceTableCell.tsx` duplicates badge/status color recipes. Move tone badge styling into a shared helper if `StatusText` or other data-display widgets need it.
- `SearchBox.tsx` uses a local input style and should be revisited when form widgets are promoted.
- `Panel.tsx` has local density padding logic. Keep it for now, but move it to layout helpers if another widget needs the same density scale.
