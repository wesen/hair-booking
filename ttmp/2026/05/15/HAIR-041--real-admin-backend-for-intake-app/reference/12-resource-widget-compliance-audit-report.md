---
Title: Resource Widget Compliance Audit Report
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
  - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/06-resource-widgets.yaml
    Note: Resource widget IR audited and reconciled for pagination callback naming
  - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.tsx
    Note: Promoted ResourceTable implementation
  - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.stories.tsx
    Note: Hardened ResourceTable stories with callback probes and mobile coverage
  - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/parts/BulkActionBar/BulkActionBar.stories.tsx
    Note: Hardened bulk callback probe story
  - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/parts/PaginationBar/PaginationBar.stories.tsx
    Note: Hardened pagination callback probe story
  - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/parts/ResourceTableCell/ResourceTableCell.stories.tsx
    Note: Hardened cell variants and row callback probe story
ExternalSources: []
Summary: Resource widget playbook compliance audit, updated after Phase 21 remediation.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Track ResourceTable family compliance status and remaining design follow-ups.
WhenToUse: Use before modifying ResourceTable, ResourceTableCell, BulkActionBar, or PaginationBar.
---

# Resource Widget Playbook Compliance Audit — 2026-05-19

## Scope

YAML files audited:
- `sources/admin-dsl-widget-ir/06-resource-widgets.yaml`

Widget directories audited:
- `web/src/admin-dsl/widgets/organisms/ResourceTable/`
- `web/src/admin-dsl/widgets/organisms/ResourceTable/parts/ResourceTableCell/`
- `web/src/admin-dsl/widgets/organisms/ResourceTable/parts/BulkActionBar/`
- `web/src/admin-dsl/widgets/organisms/ResourceTable/parts/PaginationBar/`

## Current Executive Summary

- **Pass:** 4 widgets for playbook-critical behavior and Storybook coverage after Step 105.
- **Already fixed before this report was committed:** pagination adapter wiring, raw token imports, badge tone duplication, ResourceTable callback probe, mobile ResourceTable story, and part-widget story changelogs.
- **Fixed in this follow-up:** `06-resource-widgets.yaml` now names ResourceTable pagination callback as `onPaginationAction`, matching `ResourceTable.types.ts` and the renderer adapter.
- **Remaining follow-up:** optional visual breadth stories for every YAML scenario not yet represented one-for-one, and broader shell-widget design-system lint backlog outside the ResourceTable family.

## Verification Addendum After Steps 88, 100, and 105

The original audit captured valid findings against the state it inspected, but several findings were stale by the time this report was reviewed:

1. **Pagination callback adapter bug — fixed.**
   - Current `render.tsx` passes `onPaginationAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)}` into `ResourceTable`.
   - Current `ResourceTable.tsx` passes `PaginationBar` actions to `onPaginationAction?.(action, { tableId, ...context })`.

2. **Raw token imports in ResourceTable family — fixed.**
   - `ResourceTable.tsx`, `BulkActionBar.tsx`, `PaginationBar.tsx`, and `ResourceTableCell.tsx` use shared Admin DSL helpers such as `adminTokens`, `adminTextStyle`, `adminSurfaceStyle`, and `badgeToneStyle`.

3. **Badge color duplication — fixed.**
   - `ResourceTableCell.tsx` uses generated `badgeToneStyle(tone)` instead of local hardcoded status-tone recipes.

4. **Part-widget story changelogs — fixed in Step 105.**
   - `BulkActionBar.stories.tsx`, `PaginationBar.stories.tsx`, and `ResourceTableCell.stories.tsx` now include `Manual edits after generation` entries.

5. **Callback probe evidence — fixed in Step 105.**
   - ResourceTable stories now display emitted row, bulk, selection, and pagination callback context.
   - Part-widget stories include visible probes for bulk, pagination, and row action callbacks.

6. **Mobile ResourceTable story — fixed in Step 105.**
   - `ResourceTable.stories.tsx` includes a `MobileCards` story with mobile viewport parameters.

7. **YAML/type callback naming drift — fixed in this follow-up.**
   - `ResourceTableProps.fields.onPaginationAction` was added to `06-resource-widgets.yaml`.
   - The `pagination` action slot now uses `callback: onPaginationAction`.

## Current Widget Matrix

| Widget | YAML synced | Impl changelog | Story changelog | Stories distinct | Callback probe | Adapter cleanup | Shared design helpers | Validation | Status |
|---|---|---|---|---|---|---|---|---|---|
| ResourceTable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **pass** |
| ResourceTableCell | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **pass** |
| BulkActionBar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **pass** |
| PaginationBar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **pass** |

## Validation Run

Recent validation from Phase 21 remediation:

- `cd web && npx tsc --noEmit` → **pass**
- `cd web && pnpm test -- --runInBand` → **pass** (49/49)
- `cd web && npx storybook build --quiet` → **pass**
- `python3 ttmp/.../scripts/08-validate-widget-promotion.py --strict-triage --skip-storybook web/src/admin-dsl/widgets/organisms/ResourceTable` → **pass**, with known shell-widget design lint backlog in report-only mode.

## Remaining Recommendations

1. Keep ResourceTable family as the reference pattern for data-display widget promotion: typed props, adapter-owned raw JSON decoding, `ActionGroup` for action controls, callback probe stories, and shared design helpers.
2. If strict one-to-one YAML story mapping becomes required, add explicit stories for overflow actions, drag handles, long text/dense rows, and status badge-only rows. Current coverage is playbook-compliant but not exhaustive against every named YAML scenario.
3. Do not regress pagination semantics: pagination actions must continue to emit through `onPaginationAction`, not `onBulkAction`.
