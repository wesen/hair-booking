---
Title: Data Display Widget Compliance Audit Report
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
  - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/07-data-display-widgets.yaml
    Note: Data-display widget IR audited and marked promoted
  - Path: web/src/admin-dsl/render.tsx
    Note: Renderer adapter branches for promoted data-display widgets
ExternalSources: []
Summary: Data-display widget playbook compliance audit after clean promotion pass.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Track promotion status and future review notes for 07 data-display widgets.
WhenToUse: Use before modifying MetricCard, StatusText, ComparisonTable, KeyValueList, ActivityFeed, MarkdownBlock, EmptyState, LoadingState, or InlineError.
---

# Data Display Widget Playbook Compliance Audit — 2026-05-19

## Scope

YAML files audited:
- `sources/admin-dsl-widget-ir/07-data-display-widgets.yaml`

Widget directories audited:
- `web/src/admin-dsl/widgets/molecules/MetricCard/`
- `web/src/admin-dsl/widgets/atoms/StatusText/`
- `web/src/admin-dsl/widgets/organisms/ComparisonTable/`
- `web/src/admin-dsl/widgets/molecules/KeyValueList/`
- `web/src/admin-dsl/widgets/molecules/ActivityFeed/`
- `web/src/admin-dsl/widgets/molecules/MarkdownBlock/`
- `web/src/admin-dsl/widgets/molecules/EmptyState/`
- `web/src/admin-dsl/widgets/molecules/LoadingState/`
- `web/src/admin-dsl/widgets/molecules/InlineError/`

## Current Executive Summary

- **Promoted:** all 9 data-display widgets.
- **Renderer adapter cleanup:** `metricCard`, `comparisonTable`, `kvList`, `activityFeed`, `markdownBlock`, `emptyState`, `loadingState`, and `inlineError` now delegate to typed widgets.
- **Storybook:** all data-display stories have manual changelogs, distinct fixtures, and mobile/callback coverage where relevant.
- **Contract drift fixed:** MetricCard has explicit `tone`; data-display YAML entries are marked `promoted`.
- **Validation:** TypeScript, Vitest, scoped strict triage, and Storybook build pass. Design lint still reports known shell-widget backlog unrelated to data-display widgets.

## Current Widget Matrix

| Widget | YAML synced | Promoted | Story changelog | Stories distinct | Callback probe | Adapter cleanup | Shared design helpers | Status |
|---|---|---|---|---|---|---|---|---|
| MetricCard | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **pass** |
| LoadingState | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **pass** |
| InlineError | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **pass** |
| StatusText | ✅ | ✅ | ✅ | ✅ | N/A | N/A | ✅ | **pass** |
| KeyValueList | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **pass** |
| MarkdownBlock | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **pass** |
| EmptyState | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **pass** |
| ActivityFeed | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **pass** |
| ComparisonTable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **pass** |

## Remediation Summary

### MetricCard, LoadingState, InlineError

Promoted in Step 108. These were the first no-callback data-display widgets and established the category pattern: typed props, shared helpers, manual changelogs, distinct stories, mobile coverage, and thin renderer adapters.

### StatusText, KeyValueList, MarkdownBlock

Promoted in Step 111. These are pure display widgets. They do not dispatch backend actions, do not parse Admin DSL JSON, and rely on generated shared helpers for tone, typography, borders, and data attributes.

### EmptyState, ActivityFeed, ComparisonTable

Promoted in Step 111. These widgets have action semantics and now expose typed callbacks that Storybook probes display on screen:

- `EmptyState.onAction(action, { source: "emptyState", title })`
- `ActivityFeed.onItemAction(action, { item })`
- `ComparisonTable.onRowAction(action, { tableId, row })`

`render.tsx` remains the trust boundary and lowers those callbacks to `dispatchWidgetAction(...)`.

## Validation Run

Commands run during the clean pass:

- `cd web && npx tsc --noEmit` → **pass**
- `python3 ttmp/.../scripts/08-validate-widget-promotion.py --strict-triage --skip-storybook web/src/admin-dsl/widgets/atoms/StatusText web/src/admin-dsl/widgets/molecules/KeyValueList web/src/admin-dsl/widgets/molecules/MarkdownBlock web/src/admin-dsl/widgets/molecules/EmptyState web/src/admin-dsl/widgets/molecules/ActivityFeed web/src/admin-dsl/widgets/organisms/ComparisonTable` → **pass**
  - scoped Storybook scaffold triage: **pass**
  - `npx tsc --noEmit`: **pass**
  - `pnpm test -- --runInBand`: **pass**, 10 files / 49 tests
  - design lint: known shell-widget backlog only, report-only mode
- `cd web && npx storybook build --quiet` → **pass**, with known large chunk warning

## Remaining Recommendations

1. Keep `render.tsx` as the only layer that reads raw Admin DSL JSON and dispatches backend-bound actions.
2. If future code wants table status rendering to reuse `StatusText`, evaluate that as a small ResourceTableCell follow-up rather than mixing it into this completed data-display pass.
3. Continue Phase 21 with `08-media-widgets.yaml` from the same clean workflow: read YAML, preserve metadata, promote widgets, harden stories, validate, update diary/changelog, commit.
