---
Title: Widget Playbook Compliance Audit Report
Ticket: HAIR-041
Status: active
Topics:
    - frontend
    - admin-dsl
    - storybook
    - audit
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/07-widget-playbook-compliance-audit-diary.md
      Note: Audit diary for this report
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/03-widget-playbook-compliance-audit-guide.md
      Note: Audit playbook used for this report
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/05-layout-widgets.yaml
      Note: Audited widget category
Summary: Compliance audit report for layout widgets promoted from 05-layout-widgets.yaml, with verification addendum correcting current-source scope.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Use to plan Storybook and playbook-compliance remediation for HAIR-041 layout widgets.
WhenToUse: Use before fixing layout widget stories or extending the audit to resource/data/media/calendar widget categories.
---

# Widget Playbook Compliance Audit — 2026-05-19

## Scope

YAML files audited:
- `sources/admin-dsl-widget-ir/05-layout-widgets.yaml`

Widget directories audited:
- `web/src/admin-dsl/widgets/organisms/PageHeader/`
- `web/src/admin-dsl/widgets/organisms/DashboardGrid/`
- `web/src/admin-dsl/widgets/organisms/Panel/`
- `web/src/admin-dsl/widgets/molecules/Toolbar/`
- `web/src/admin-dsl/widgets/organisms/SplitPane/`
- `web/src/admin-dsl/widgets/molecules/Tabs/`
- `web/src/admin-dsl/widgets/molecules/FilterBar/`
- `web/src/admin-dsl/widgets/molecules/SearchBox/`

## Executive Summary

- **Pass:** 2 widgets (PageHeader, DashboardGrid)
- **Fail:** 6 widgets (Panel, Toolbar, SplitPane, Tabs, FilterBar, SearchBox)
- **Needs follow-up:** 0 widgets

The primary failure pattern is identical across all 6 failing widgets: implementation was promoted with manual edit changelogs, but the corresponding story files remain scaffold-generated with no hardening. Every scaffold story renders the same `defaultArgs`, includes the "Story fixture and assertions" diagnostic UI, and provides no distinct visual states or callback probes.

## Critical Findings

### 1. Scaffold-only stories for 6 promoted widgets

- **Evidence:** All 6 story files contain only the generated provenance header, no `Manual edits after generation` changelog, and every story uses `args: { ...defaultArgs }` rendering identical component state. The generated "Story fixture and assertions" diagnostic `<details>` block is still present in every story.
- **Playbook rule violated:** Step 10 (Update Storybook) — "A promoted widget needs hand-authored stories with fixtures that actually vary the widget state."
- **Required fix:** Replace generated `defaultArgs` reuse with purposeful props per story, add callback probe stories, set mobile viewport parameters, remove diagnostic `<details>` blocks.

Files:
- `web/src/admin-dsl/widgets/organisms/Panel/Panel.stories.tsx` (7 stories, all identical)
- `web/src/admin-dsl/widgets/molecules/Toolbar/Toolbar.stories.tsx` (3 stories, all identical)
- `web/src/admin-dsl/widgets/organisms/SplitPane/SplitPane.stories.tsx` (3 stories, all identical)
- `web/src/admin-dsl/widgets/molecules/Tabs/Tabs.stories.tsx` (4 stories, all identical)
- `web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.stories.tsx` (4 stories, all identical)
- `web/src/admin-dsl/widgets/molecules/SearchBox/SearchBox.stories.tsx` (4 stories, all identical)

### 2. Mobile story names are misleading

- **Evidence:** `SplitPane.MobileStacked`, `Panel.MobilePanelPadding`, `Tabs.WrappingMobile`, and `FilterBar.ManyFiltersWrap` all render inside `<div style={{ padding: 24, maxWidth: 1120 }}>` with no viewport parameter. Only PageHeader.LongTitleMobile correctly sets `parameters: { viewport: { defaultViewport: "mobile1" } }` and uses a narrow container.
- **Playbook rule violated:** Step 10 — "Mobile stories work in isolated Storybook, not only through the app renderer."
- **Required fix:** Add `parameters: { viewport: { defaultViewport: "mobile1" } }` to mobile story definitions, use narrow container widths, and verify the widget renders differently at small widths.

### 3. No callback probe stories for callback-heavy widgets

- **Evidence:** Tabs, FilterBar, SearchBox are all callback-heavy (they emit `onTabChange`, `onFilterChange`, `onSearch`), but none have a story that shows emitted callback data on screen. Only PageHeader has an `ActionDispatch` story.
- **Playbook rule violated:** Step 10 — "Callback-heavy widgets should include at least one interactive probe story."
- **Required fix:** Add interactive stories using `useState` to display the last emitted callback context.

### 4. Panel uses `density` prop not documented in YAML or .types.ts

- **Evidence:** `Panel.tsx` accepts and uses `density` prop (lines 13-15, 24, 36, 45, 58, 72, 77) with values `"compact" | "normal" | "spacious"`. This prop comes from `CommonWidgetProps` (defined in `shared/types.ts` line 61) but is not documented in the Panel YAML `contract.props` nor in `Panel.types.ts`. The adapter passes it from raw JSON (`str(props, "density", "normal")`), but the YAML only defines `padding: "none" | "normal"`.
- **Playbook rule violated:** Step 9 (Update Types and YAML Together) — "If implementation reveals a missing prop, do not silently add it to TypeScript only. Update all relevant artifacts."
- **Required fix:** Add `density` to the Panel YAML `contract.props.PanelProps.fields` and regenerate or manually update `Panel.types.ts` to include it explicitly rather than relying on `CommonWidgetProps` for a widget-specific prop.

### 5. Design-system linter flags 25 errors, 3 warnings

- **Evidence:** `07-lint-admin-dsl-design-system.py` reports:
  - 2 hardcoded colors in `MetricCard.tsx` (lines 12-13)
  - 2 raw token import warnings in `DefaultAdminShell.tsx` (line 18) and `WorkbenchShell.tsx` (line 17)
  - 1 hardcoded color warning in `WorkbenchShell.tsx` (line 87)
  - 4 manual data attributes in `DefaultAdminShell.tsx` (lines 53-54) and `WorkbenchShell.tsx` (lines 47-49)
  - 1 manual data attribute in `Panel.tsx` (line 45): `data-admin-dsl-density={density}`
  - 4 local-style-helper flags for `densityPadding` in `Panel.tsx` (lines 13, 36, 58, 77)
  - 1 button-without-action-widget in `WorkbenchShell.tsx` (line 72)
  - 11 undocumented `as unknown as` casts in `render.tsx` (lines 122, 145, 232, 235, 240, 245, 258, 289, 304, 330, 429, 455)
- **Playbook rule violated:** Step 2.5 (Use the Shared Design Language), design-system playbook Section 5 (Layout/Spacing), Section 6 (Data Attributes), Section 7 (Adapter Boundary), Section 8 (Adapter Correctness).
- **Required fix:** Move `densityPadding` to shared helpers, replace manual data attributes with `widgetDataAttributes`/`dataAttrsFromRecord`, document or replace `as unknown as` casts.

### 6. Panel manually sets `data-admin-dsl-density`

- **Evidence:** `Panel.tsx` line 45: `data-admin-dsl-density={density}` — this is a manual data attribute not going through `widgetDataAttributes` or `dataAttrsFromRecord`.
- **Playbook rule violated:** Design-system playbook Section 6 (Data Attributes) — "Widgets should use generated helpers for repeated Admin DSL data attributes."
- **Required fix:** Either add density to the data-attribute schema in `15-design-language.yaml` and regenerate, or document it as a widget-specific extension passed through `dataAttrsFromRecord`.

### 7. Types files import many unused types from shared/types.ts

- **Evidence:** Every generated `.types.ts` file (PageHeader, DashboardGrid, Panel, Toolbar, SplitPane, Tabs, FilterBar, SearchBox) imports `CalendarCellActionHandler`, `FormActionHandler`, `OverlaySurfaceKind`, `ResourceTableColumnKind`, `SidebarNavItem`, `SidebarNavProps`, `TableBulkActionHandler`, `TableRowActionHandler` even though the widget only uses 1-2 of those types. This is a generator quality issue, not a compliance violation, but it makes the type files noisy.
- **Playbook rule violated:** None directly, but it reduces review clarity.
- **Required fix:** Update the scaffold generator to import only the types each widget actually uses.

## Widget Matrix

| Widget | YAML read | Scaffold fresh | Separate scaffold commit | Impl changelog | Story changelog | Stories distinct | Callback probe | Adapter cleanup | Design lint | Validation | Diary/changelog | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PageHeader | ✅ | ✅ | ✅ (Step 69→70) | ✅ | ✅ | ✅ | ✅ (ActionDispatch) | ✅ | ✅ (no raw tokens) | ✅ | ✅ | **pass** |
| DashboardGrid | ✅ | ✅ | ✅ (Step 75→76) | ✅ | ✅ | ✅ | N/A (no callbacks) | ✅ | ✅ (no raw tokens) | ✅ | ✅ | **pass** |
| Panel | ✅ | ✅ | ✅ (Step 78→79) | ✅ | ❌ | ❌ (all `...defaultArgs`) | ❌ | ⚠️ (densityPadding dup, manual data-attr, density prop not in YAML) | ❌ (densityPadding, data-attr, density YAML drift) | ✅ | ✅ | **fail** |
| Toolbar | ✅ | ✅ | ✅ (Step 78→79) | ✅ | ❌ | ❌ (all `...defaultArgs`) | ❌ | ✅ | ✅ | ✅ | ✅ | **fail** |
| SplitPane | ✅ | ✅ | ✅ (Step 78→79) | ✅ | ❌ | ❌ (all `...defaultArgs`) | N/A (no callbacks) | ✅ | ✅ | ✅ | ✅ | **fail** |
| Tabs | ✅ | ✅ | ✅ (Step 78→79) | ✅ | ❌ | ❌ (all `...defaultArgs`) | ❌ | ✅ | ❌ (raw token pill) | ✅ | ✅ | **fail** |
| FilterBar | ✅ | ✅ | ✅ (Step 78→79) | ✅ | ❌ | ❌ (all `...defaultArgs`) | ❌ | ✅ | ❌ (raw token pill) | ✅ | ✅ | **fail** |
| SearchBox | ✅ | ✅ | ✅ (Step 78→79) | ✅ | ❌ | ❌ (all `...defaultArgs`) | ❌ | ✅ | ❌ (raw color import) | ✅ | ✅ | **fail** |

## Validation Run

Commands:
- `cd web && npx tsc --noEmit` → **pass** (zero errors)
- `cd web && pnpm test -- --runInBand` → **pass** (49/49)
- `cd web && npx storybook build --quiet` → **pass** (large chunk warning known)

Design-system linter:
- `07-lint-admin-dsl-design-system.py` → 25 errors, 3 warnings

Scaffold-story triage:
- 29 scaffold-looking story files identified across all widget categories
- 17 files where implementation has manual changelog but story does not

## Recommended Commit Plan

1. **YAML/types sync commit** — Add `density` to Panel's YAML `contract.props` and `Panel.types.ts`. This is Step 9 compliance.
2. **Story hardening commit** — Harden Panel, Toolbar, SplitPane stories with distinct fixtures, callback probes, and real mobile viewports. One commit per widget or one batch commit if the changes are small and reviewable together.
3. **Callback-heavy story commit** — Add interactive probe stories to Tabs, FilterBar, and SearchBox. These are best as a separate commit because they add new interaction patterns.
4. **Design-system cleanup commit** — Move `densityPadding` to shared helpers, replace Panel's manual `data-admin-dsl-density`, replace raw token imports in Tabs/FilterBar/SearchBox with shared helpers.
5. **Generator cleanup** — Update scaffold generator to import only used types in `.types.ts` files.
6. **Remaining category audit** — Audit `07-data-display-widgets.yaml`, `08-media-widgets.yaml`, `09-calendar-widgets.yaml` using the same matrix template.

## Files Requiring Immediate Storybook Backfill

- `web/src/admin-dsl/widgets/organisms/Panel/Panel.stories.tsx`: All 7 stories render identical `defaultArgs`; no story passes `padding: "none"`, `toolbarActions`, `footerActions`, `eyebrow`, `subtitle`, or `body`. `CompactNoPadding` doesn't pass `padding: "none"`. `WithToolbarAction` doesn't pass `toolbarActions`. `WithFooterActions` doesn't pass `footerActions`. `MobilePanelPadding` has no viewport parameter. No callback probe story.
- `web/src/admin-dsl/widgets/molecules/Toolbar/Toolbar.stories.tsx`: All 3 stories render identical `defaultArgs` (single action). `ManyActionsWrap` doesn't provide many actions. `MobileTouchTargets` has no viewport parameter. No callback probe story.
- `web/src/admin-dsl/widgets/organisms/SplitPane/SplitPane.stories.tsx`: All 3 stories render identical `defaultArgs` (generic `<div>Left</div><div>Right</div>`). `MobileStacked` has no viewport parameter. `MasterDetail` and `TwoPanels` don't provide different children or width configurations.
- `web/src/admin-dsl/widgets/molecules/Tabs/Tabs.stories.tsx`: All 4 stories render identical `defaultArgs` (2 tabs, value="all"). `ActiveTab` doesn't set a different `value`. `NoActionReadonly` doesn't omit `action`. `WrappingMobile` has no viewport parameter and doesn't provide enough tabs to wrap. No callback probe story.
- `web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.stories.tsx`: All 4 stories render identical `defaultArgs` (2 filters, value="all"). `ActiveFilter` doesn't set a different `value`. `ManyFiltersWrap` doesn't provide many filters. `Readonly` doesn't omit `action`. No callback probe story.
- `web/src/admin-dsl/widgets/molecules/SearchBox/SearchBox.stories.tsx`: All 4 stories render identical `defaultArgs` (placeholder="Search requests", value=""). `WithInitialValue` doesn't set `value`. `NoAction` doesn't omit `action`. `SubmitDispatch` doesn't show callback output. No callback probe story.

## Additional Findings (from deeper review)

### Panel density prop not in YAML or types (YAML→implementation drift)

`Panel.tsx` uses `density` prop ("compact" | "normal" | "spacious") that comes from `CommonWidgetProps` in `shared/types.ts`. The Panel YAML `contract.props` does not list `density` as a Panel-specific field, and `Panel.types.ts` does not declare it explicitly. The adapter passes it (`str(props, "density", "normal")`). This violates Step 9 (Update Types and YAML Together).

### Types files import unnecessary types

Every generated `.types.ts` imports 8-10 shared types (`CalendarCellActionHandler`, `OverlaySurfaceKind`, `ResourceTableColumnKind`, etc.) even when the widget uses only 1-2 of them. For example, `SplitPane.types.ts` imports `CalendarCellActionHandler` and `TableBulkActionHandler` despite SplitPane having no action slots. This is a generator quality issue.

### render.tsx `densityPadding` not dead but duplicated

The `densityPadding` function in `render.tsx` (line 69) is not dead code — it's used by the `panel` adapter branch. However, it's identical to the `densityPadding` in `Panel.tsx`. This duplication was flagged by the linter and should move to shared helpers.

### `as unknown as` casts in render.tsx: two categories

1. **Trivial** — `str(props, "id", undefined as unknown as string)`: These are TypeScript strictness workarounds where `str()` returns `string | undefined` but the prop expects `string`. Not a real type hole, but should use a cleaner pattern.
2. **Non-trivial** — `columns={columns as unknown as Parameters<typeof ResourceTable<AdminJsonObject>>[0]["columns"]}` and `jsonObject(props, "action") as unknown as AdminActionRef`: These bypass the typed contract and should be documented or replaced with proper normalization.

## Follow-up Verification Addendum — 2026-05-19

A second pass checked the intern audit findings against the current working tree. The main Storybook findings are confirmed, but a few design-system and adapter findings need scoping so remediation work targets current issues rather than already-fixed ones.

### Confirmed current findings

- The six layout story files are still scaffold-only:
  - `web/src/admin-dsl/widgets/organisms/Panel/Panel.stories.tsx`
  - `web/src/admin-dsl/widgets/molecules/Toolbar/Toolbar.stories.tsx`
  - `web/src/admin-dsl/widgets/organisms/SplitPane/SplitPane.stories.tsx`
  - `web/src/admin-dsl/widgets/molecules/Tabs/Tabs.stories.tsx`
  - `web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.stories.tsx`
  - `web/src/admin-dsl/widgets/molecules/SearchBox/SearchBox.stories.tsx`
- Each of those story files lacks `Manual edits after generation`, still contains generated `Story fixture and assertions` UI, repeatedly spreads `...defaultArgs`, and lacks mobile viewport parameters.
- `Panel.tsx` still has local `densityPadding(...)` and manual `data-admin-dsl-density={density}`.
- The Panel YAML mentions density in purpose/rationale/examples, but `contract.props.PanelProps.fields` does not list `density`; `Panel.types.ts` only gets it by inheritance from `CommonWidgetProps`.
- Generated `.types.ts` files still import many unused shared types, which is a generator review-noise issue.
- `render.tsx` still has many `as unknown as` casts. Most are default-value/action-normalization cleanup issues now; the earlier `resourceTable` column cast is no longer present.

### Findings that are stale, already fixed, or need narrower wording

- `Tabs`, `FilterBar`, and `SearchBox` no longer have the raw-token/local-pill findings described in the matrix. They now use `selectionPillStyle(...)` or shared `adminTokens`/`adminTextStyle(...)` helpers from the Step 87 remediation.
- The previous resource-table pagination-through-bulk issue is already fixed in current source: `ResourceTable` has `onPaginationAction`, and the renderer lowers pagination actions separately.
- The previous `columns as unknown as Parameters<typeof ResourceTable...>` resource-table cast is already replaced by `normalizeResourceTableColumns(...)`.
- The design-system linter currently reports `MetricCard.tsx` hardcoded colors from uncommitted data-display implementation work. Treat those as working-tree findings, not committed layout-regression findings.
- `DefaultAdminShell`/`WorkbenchShell` linter findings are real follow-up candidates, but they are outside the `05-layout-widgets.yaml` audit scope.

### Updated remediation priority

1. Harden the six failing `05-layout` story files first; this is the core playbook-compliance failure.
2. Fix Panel density contract/data-attribute/density-padding issues as a focused design-language + YAML/types cleanup.
3. Improve the design-system linter or audit process to distinguish committed HEAD findings from dirty working-tree findings.
4. Replace/document the remaining `render.tsx` casts after story backfill, prioritizing action/context casts over trivial `undefined as unknown as string` defaults.
5. Update the scaffold generator to emit only used shared type imports.
