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
    Note: Data-display widget IR audited; MetricCard tone contract reconciled
  - Path: web/src/admin-dsl/widgets/molecules/MetricCard/MetricCard.tsx
    Note: First promoted data-display widget batch
  - Path: web/src/admin-dsl/widgets/molecules/LoadingState/LoadingState.tsx
    Note: First promoted data-display widget batch
  - Path: web/src/admin-dsl/widgets/molecules/InlineError/InlineError.tsx
    Note: First promoted data-display widget batch
  - Path: web/src/admin-dsl/render.tsx
    Note: Renderer adapter branches for promoted data-display widgets
ExternalSources: []
Summary: Data-display widget playbook compliance audit and remediation plan.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Track promotion status and remaining gaps for 07 data-display widgets.
WhenToUse: Use before promoting MetricCard, StatusText, ComparisonTable, KeyValueList, ActivityFeed, MarkdownBlock, EmptyState, LoadingState, or InlineError.
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

- **Promoted in first remediation batch:** `MetricCard`, `LoadingState`, and `InlineError`.
- **Still unpromoted or partial:** `StatusText`, `ComparisonTable`, `KeyValueList`, `ActivityFeed`, `MarkdownBlock`, and `EmptyState`.
- **Renderer adapter cleanup started:** `metricCard`, `loadingState`, and `inlineError` now delegate to typed widgets.
- **Contract drift fixed:** MetricCard YAML/types now include explicit `tone`.
- **Known dirty-worktree caveat:** Several data-display implementation files had partial pre-existing edits before this remediation. They must either be completed in playbook-complete batches or reverted before final validation.

## Findings and Remediation Status

### 1. Scaffold-only widgets — partially remediated

Original finding: data-display widgets were scaffold-only and had generated diagnostic stories.

Current status:
- `MetricCard` is promoted with shared design helpers and distinct tone/mobile stories.
- `LoadingState` is promoted with accessible loading semantics, shared helpers, and desktop/mobile stories.
- `InlineError` is promoted with `role="alert"`, shared helpers, and desktop/mobile stories.
- Remaining widgets still require playbook-complete promotion.

### 2. MetricCard `tone` prop drift — fixed

Original finding: renderer used `tone`, but `MetricCard.types.ts` and YAML did not define it.

Current status:
- `07-data-display-widgets.yaml` now defines `MetricCardProps.fields.tone`.
- `MetricCard.types.ts` now defines `tone?: "neutral" | "success" | "warning" | "danger" | string`.
- `MetricCard.tsx` uses `badgeToneStyle(tone)` for accent/value styling.

### 3. Scaffold diagnostic hardcoded colors — partially remediated

Current status:
- Removed from `MetricCard`, `LoadingState`, and `InlineError`.
- Still expected in scaffold-only widgets until they are promoted.

### 4. Renderer branches own visual JSX — partially remediated

Current status:
- `metricCard`, `loadingState`, and `inlineError` branches now delegate to typed widgets.
- `comparisonTable`, `kvList`, `activityFeed`, `markdownBlock`, and `emptyState` still need thin-adapter conversion.

### 5. Callback widgets still need promotion probes

Current status:
- `EmptyState` and `ActivityFeed` still need callback probe stories during promotion.
- `ComparisonTable` still needs row-action callback probes and mobile coverage.

## Current Widget Matrix

| Widget | YAML synced | Promoted | Story changelog | Stories distinct | Callback probe | Adapter cleanup | Shared design helpers | Status |
|---|---|---|---|---|---|---|---|---|
| MetricCard | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **promoted** |
| LoadingState | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **promoted** |
| InlineError | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | **promoted** |
| StatusText | ✅ | partial dirty edit | ❌ | ❌ | N/A | N/A | partial | **needs batch completion/revert** |
| ComparisonTable | ✅ | ❌ scaffold | ❌ | ❌ | ❌ | ❌ | ❌ | **unpromoted** |
| KeyValueList | ✅ | partial dirty edit | ❌ | ❌ | N/A | ❌ | partial | **needs batch completion/revert** |
| ActivityFeed | ✅ | partial dirty edit | ❌ | ❌ | ❌ | ❌ | partial | **needs batch completion/revert** |
| MarkdownBlock | ✅ | partial dirty edit | ❌ | ❌ | N/A | ❌ | partial | **needs batch completion/revert** |
| EmptyState | ✅ | partial dirty edit | ❌ | ❌ | ❌ | ❌ | partial | **needs batch completion/revert** |

## Recommended Promotion Order From Here

1. Complete or revert dirty partial edits for `StatusText`, `KeyValueList`, `MarkdownBlock`, `EmptyState`, and `ActivityFeed`.
2. Promote `KeyValueList` and `MarkdownBlock` as the next no-callback renderer-adapter batch.
3. Promote `EmptyState` with `ActionButton`/`ActionGroup` and a visible callback probe story.
4. Promote `ActivityFeed` with item-action callback probes.
5. Promote `StatusText` as the shared display badge/text primitive after confirming whether ResourceTableCell should reuse it.
6. Promote `ComparisonTable` last because it has row actions and a larger renderer branch.

## Validation Notes

The first remediation batch should be validated with unrelated dirty data-display files temporarily stashed or completed, because pre-existing partial `ActivityFeed` and `EmptyState` edits currently break full `tsc`.

Required validation at each batch boundary:
- `cd web && npx tsc --noEmit`
- `python3 ttmp/.../scripts/08-validate-widget-promotion.py --strict-triage --skip-storybook <promoted-widget-dirs>`
- `cd web && npx storybook build --quiet` before final category completion.
