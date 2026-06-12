---
Title: Admin DSL Widget IR Review
Ticket: HAIR-041
Status: active
Topics:
    - frontend
    - admin-dsl
    - design-system
    - code-review
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/01-widget-ir-to-finished-widget-playbook.md
      Note: Implementation playbook under review
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/02-admin-dsl-widget-design-system-review-playbook.md
      Note: Design system review playbook under review
    - Path: web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx
      Note: Duplicates pill styling with FilterBar
    - Path: web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx
      Note: Duplicates pill styling with Tabs
    - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.tsx
      Note: Raw token imports for table layout colors
    - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/parts/ResourceTableCell/ResourceTableCell.tsx
      Note: Duplicates badge colors and uses raw tokens
    - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/parts/BulkActionBar/BulkActionBar.tsx
      Note: Uses raw tokens for layout colors instead of shared helpers
    - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/parts/PaginationBar/PaginationBar.tsx
      Note: Uses raw tokens for layout colors instead of shared helpers
    - Path: web/src/admin-dsl/widgets/molecules/SearchBox/SearchBox.tsx
      Note: Partial shared helper use; still imports color from raw tokens
    - Path: web/src/admin-dsl/render.tsx
      Note: Renderer adapter boundary reviewed
ExternalSources: []
Summary: Review of Admin DSL Widget IR playbooks, generator workflow, promoted widget code quality, and adapter boundary compliance.
LastUpdated: 2026-05-18T21:00:00-04:00
WhatFor: Use to understand the current state of Admin DSL widget design-system compliance and what needs fixing next.
WhenToUse: Use when planning the next round of widget design-system fixes or reviewing playbook clarity.
---

# Admin DSL Widget IR Review

## Summary

The instructions are thorough and generally followable. The four-layer model (YAML → Generator → Implementation → Adapter) is well-articulated and consistently enforced across both playbooks. The generator workflow correctly separates widget scaffolding from shared design-language generation. The adapter boundary is clean: `render.tsx` parses raw JSON, widgets receive typed props, widgets emit callbacks, and `render.tsx` lowers them to `dispatchAdminAction`.

However, the promoted widgets show several design-system drift issues that the design-system review playbook correctly identifies but that have not yet been remediated. The most significant is duplicated pill styling in FilterBar and Tabs, followed by raw token imports in ResourceTable family widgets and SearchBox.

## What worked

- **Playbook structure is clear.** The four-layer model with mermaid diagrams makes the boundaries unambiguous. A newcomer could follow Steps 1–14 and understand what goes where.
- **Generator separation is correct.** `05-scaffold-admin-dsl-widgets.py` only writes widget-local files; `06-generate-admin-dsl-design-language.py` owns `shared/*`. The playbook explains this clearly in Step 2.75 and Step 3.
- **Adapter boundary is clean across all promoted widgets.** No widget imports `AdminNode`, `AdminPage`, `AdminJsonObject`, or `dispatchAdminAction`. All raw JSON parsing stays in `render.tsx`.
- **Manual edit changelogs are present** in every hand-promoted widget file, with dates and step references.
- **Metadata sidecars are used** consistently (PageHeader, DashboardGrid, Panel, etc. all import and spread `widgetDataAttributes`).
- **ActionGroup delegation is good.** PageHeader, Panel, Toolbar, BulkActionBar, PaginationBar, and ResourceTableCell all delegate action rendering to `ActionGroup` with the correct slot.
- **Shared helpers are used where available.** PageHeader, Panel, and DashboardGrid correctly use `adminTextStyle`, `adminSurfaceStyle`, `adminTokens`, `widgetDataAttributes`, and `dataAttrsFromRecord`.
- **TypeScript, Vitest, and Storybook all pass.**
- **Design-system review playbook correctly identifies the FilterBar/Tabs pill duplication** and gives a clear four-step remediation path (add to YAML → regenerate → refactor → add Storybook variants).

## What was confusing

- **Step 2.5 vs Step 2.75 ordering.** Step 2.5 says "use shared helpers before adding local styles" and Step 2.75 says "validate generated version is current." The numbering (2.5, 2.75) suggests these happen before Step 3, but Step 2.75's instruction to "run targeted `--force` regeneration" could be misread as regenerating over already-promoted hand-written code. The playbook does say "If the scaffold is already hand-promoted, do not force-regenerate over it," but this warning is buried in a paragraph. A newcomer might miss it.
- **`densityPadding` is duplicated.** `densityPadding()` appears in both `Panel.tsx` and `render.tsx`. The playbook's Step 2.5 says to use shared helpers "whenever they are expressing a shared Admin DSL convention," but `densityPadding` is not in the design-language YAML. Is it intentionally local or an oversight? The design-system playbook mentions Panel density padding under "Component-Specific Checks" and says "keep it for now, but move it to layout helpers if another widget needs the same density scale." That's fine, but the duplication with render.tsx is not addressed.
- **`renderTableCell` still exists in `render.tsx`.** After ResourceTable was promoted, `render.tsx` still has a full `renderTableCell()` function (lines ~60–80) that is now dead code — no case branch calls it, since `resourceTable` delegates to the `ResourceTable` widget. This should have been cleaned up.
- **`layoutSpan`/`layoutOrder` helpers remain in `render.tsx** even though `dashboardGrid` now delegates to `DashboardGrid`/`DashboardGridItem`. These are still used by the `dashboardGrid` adapter branch, but the comments say they were "extracted" — it's unclear whether they should eventually move into shared helpers or the DashboardGrid widget itself.
- **Pagination adapter callback is confusing.** In `render.tsx`, the `resourceTable` adapter passes `onAction` for `PaginationBar` as: `onAction={(action, context) => onBulkAction?.(action, ...) || void context}`. This routes a pagination action through the bulk action callback, which is semantically wrong and will silently drop pagination actions if `onBulkAction` is not provided.

## Design-system issues found

### 1. FilterBar and Tabs duplicate pill styling

- **File:** `web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx` and `web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx`
- **Problem:** Both import `color`, `radius`, `type` directly from `fringe-ui/tokens` and construct an identical `sharedStyle` object inline:
  ```ts
  const sharedStyle = { minHeight: 38, display: "inline-flex", alignItems: "center", borderRadius: radius.pill, padding: "8px 12px", border: `1px solid ${active ? color.ink : color.rule}`, background: active ? color.ink : color.paper, color: active ? color.paper : color.ink, ...type.meta };
  ```
  This is exactly the design-system drift pattern the review playbook flags. Both files render `<button>` elements with local pill styling instead of using a shared helper or `ActionButton` variant.
- **Suggested fix:** Add `selection_variants.pill` to `15-design-language.yaml`, regenerate shared helpers to emit `selectionPillStyle({ active, disabled, size })`, and refactor both FilterBar and Tabs to call it. (This matches the design-system playbook's Section "FilterBar and Tabs" verbatim.)

### 2. ResourceTable family uses raw tokens for layout colors

- **File:** `web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.tsx`
- **Problem:** Imports `color, type` from `fringe-ui/tokens` directly. Uses `color.rule`, `color.ruleSoft`, `color.softInk` for table header borders, row borders, and header text — these all have `adminTokens` equivalents (`adminTokens.borders.default`, `adminTokens.borders.soft`, `adminTokens.text.muted`). Also uses `type.meta` for header typography and `type.bodySm` for cell typography when `adminTextStyle("eyebrow")` and `adminTextStyle("bodyMuted")` exist.
- **Suggested fix:** Replace raw token imports with `adminTokens` and `adminTextStyle` from shared helpers. Use `adminTokens.borders.default` for `color.rule`, `adminTokens.borders.soft` for `color.ruleSoft`, `adminTokens.text.muted` for `color.softInk`, and `adminTextStyle(...)` for typography.

### 3. ResourceTableCell duplicates badge color recipes

- **File:** `web/src/admin-dsl/widgets/organisms/ResourceTable/parts/ResourceTableCell/ResourceTableCell.tsx`
- **Problem:** Imports `color, radius, type` from raw tokens. Hardcodes badge/status tone colors inline (`#fff0c2`, `#674000`, `#e0a52a`, `#e6f0df`, `#345627`, `#8baa7a`, `#fff1ed`, `#b3261e`, `#e15a4f`). The same badge color recipe is duplicated in the `renderTableCell` function inside `render.tsx`. This should be a shared tone badge helper.
- **Suggested fix:** Add badge/tone color semantics to `15-design-language.yaml`, generate a `badgeToneStyle(tone)` helper, and refactor both `ResourceTableCell` and the dead `renderTableCell` in `render.tsx` to use it.

### 4. BulkActionBar and PaginationBar use raw tokens for layout styling

- **File:** `web/src/admin-dsl/widgets/organisms/ResourceTable/parts/BulkActionBar/BulkActionBar.tsx` and `PaginationBar.tsx`
- **Problem:** Both import `color, type` from raw tokens. BulkActionBar uses `color.rule`, `color.cream`, `color.softInk` for its border, background, and text — these map to `adminTokens.borders.default`, `adminTokens.surfaces.muted`, and `adminTokens.text.muted`. PaginationBar similarly uses `color.rule`, `color.paper`, `color.softInk`.
- **Suggested fix:** Replace with `adminTokens` and `adminTextStyle` from shared helpers. Use `adminActionRowStyle(...)` for the horizontal layout pattern.

### 5. SearchBox partially uses shared helpers but still imports raw tokens

- **File:** `web/src/admin-dsl/widgets/molecules/SearchBox/SearchBox.tsx`
- **Problem:** Imports `color, type` from raw tokens. Uses `adminSurfaceStyle` (good!) and `actionButtonStyle` (good!), but then uses `color.softInk` for the input text color and `type.body` for input typography instead of `adminTokens.text.primary` and `adminTextStyle("body")`.
- **Suggested fix:** Replace `color.softInk` with `adminTokens.text.muted` and `type.body` with `adminTextStyle("body")`.

## Adapter-boundary issues found

### 1. Pagination callback routed through bulk action handler

- **File:** `web/src/admin-dsl/render.tsx` (resourceTable case)
- **Problem:** The PaginationBar's `onAction` is wired as:
  ```tsx
  onAction={(action, context) => onBulkAction?.(action, { tableId, scope: "visible", rows, selectedRowIds }) || void context}
  ```
  This passes a pagination action through the bulk action callback with `scope: "visible"`, which is semantically wrong. Pagination actions carry `{ page, total }` context and should be dispatched separately. The `|| void context` silently drops the action if `onBulkAction` is undefined.
- **Suggested fix:** Wire PaginationBar's `onAction` to `dispatchAdminAction` directly with the appropriate context, not through `onBulkAction`. The ResourceTable widget should accept an `onPaginationAction` callback (or the adapter should handle pagination at the `render.tsx` level, not through the ResourceTable component at all).

### 2. Dead `renderTableCell` in render.tsx

- **File:** `web/src/admin-dsl/render.tsx`
- **Problem:** The `renderTableCell()` function (~20 lines) is defined but never called after ResourceTable was promoted. It's dead code that also duplicates the badge color recipe from ResourceTableCell.
- **Suggested fix:** Remove `renderTableCell` from `render.tsx`.

### 3. ResourceTable adapter passes `AdminJsonObject` as `Row` generic

- **File:** `web/src/admin-dsl/render.tsx` (resourceTable case)
- **Problem:** The adapter does `columns={columns as unknown as Parameters<typeof ResourceTable<AdminJsonObject>>[0]["columns"]}` and `rows={rows}` where `rows` is `AdminJsonObject[]`. While this works at runtime, the `as unknown as` cast is a type hole — it bypasses the typed contract that ResourceTable is supposed to enforce.
- **Suggested fix:** This is an acceptable transitional adapter pattern (the playbook mentions escape hatches), but it should be documented with a comment explaining that the adapter is normalizing AdminJsonObject into the expected row shape, and it should be tracked for cleanup when the adapter can do a proper mapping.

## Generator/workflow issues found

- **No generator issue.** The widget scaffold generator correctly produces only widget-local files. The design-language generator correctly owns `shared/*`. The separation is clean.
- **The playbook could be clearer about when NOT to regenerate.** Step 2.75 warns about not force-regenerating hand-promoted files, but the warning is in a paragraph that also discusses staleness detection. A prominent "STOP" callout or a checklist item would make this safer for newcomers.
- **The playbook does not mention cleaning up dead code in render.tsx** after a widget is promoted. Step 8 mentions CSS migration, but there's no step for removing the old inline renderer function once the adapter delegates to the widget. This led to the `renderTableCell` dead code issue.
- **The playbook Step 2.5 lists specific shared helper function names** (e.g., `adminPageRootStyle`, `adminShellGridStyle`, `adminActionRowStyle`, `actionPlacementDefaults`, `sidebarNavButtonStyle`, `shellMenuButtonStyle`) but some of these names don't exactly match what the generated `shared/index.ts` exports. A newcomer would need to check the actual exports to find the right names. The playbook should either link to the barrel file or acknowledge that names may evolve.

## Recommended next fixes

1. **Add `selectionPillStyle` to the design language.** Add `selection_variants.pill` to `15-design-language.yaml`, regenerate shared helpers, and refactor FilterBar and Tabs to use it. This is the highest-priority design-system fix because it affects two components and is a textbook drift pattern.
2. **Replace raw token imports with `adminTokens` and `adminTextStyle` in the ResourceTable family.** ResourceTable, ResourceTableCell, BulkActionBar, PaginationBar, and SearchBox should all use shared helpers instead of raw `fringe-ui/tokens` imports. This is a medium-priority cleanup that reduces drift risk.
3. **Fix the PaginationBar callback wiring in render.tsx.** Route pagination actions through their own `dispatchAdminAction` call instead of through `onBulkAction`. This is a correctness issue, not just style.
4. **Remove dead `renderTableCell` from render.tsx.** It's unused after the ResourceTable promotion and duplicates badge color logic.
5. **Add a "cleanup dead renderer code" step to the playbook** (after Step 6 or Step 8) so future widget promotions don't leave similar dead code behind.
6. **Add a prominent "Do not force-regenerate over hand-promoted widgets" callout** in the playbook at Step 2.75, separate from the staleness discussion.
