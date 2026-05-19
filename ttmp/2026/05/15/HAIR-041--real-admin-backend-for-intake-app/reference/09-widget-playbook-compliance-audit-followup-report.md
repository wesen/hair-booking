---
Title: Widget Playbook Compliance Audit Follow-up Report
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
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/08-widget-playbook-compliance-audit-report.md
      Note: Initial layout-widget compliance audit report
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/03-widget-playbook-compliance-audit-guide.md
      Note: Audit playbook used for this follow-up
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/06-resource-widgets.yaml
      Note: Re-audited resource widgets
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/07-data-display-widgets.yaml
      Note: Re-audited data-display widgets
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/08-media-widgets.yaml
      Note: Re-audited media widgets
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/09-calendar-widgets.yaml
      Note: Re-audited calendar widgets
Summary: Follow-up widget playbook compliance audit for resource, data-display, media, and calendar widget categories after layout Storybook backfill.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Use to plan remaining widget promotion and Storybook hardening work after Phase 21 layout remediation.
WhenToUse: Use before continuing 07/08/09 widget implementation and before claiming resource widget story compliance.
---

# Widget Playbook Compliance Audit Follow-up Report — 2026-05-19

## Scope

Audited current working tree after layout Storybook backfill for:

- `sources/admin-dsl-widget-ir/06-resource-widgets.yaml`
- `sources/admin-dsl-widget-ir/07-data-display-widgets.yaml`
- `sources/admin-dsl-widget-ir/08-media-widgets.yaml`
- `sources/admin-dsl-widget-ir/09-calendar-widgets.yaml`

The audit intentionally treats dirty working-tree data-display implementation edits as out of scope for committed compliance. They remain partial and must not be considered promoted until their stories and adapters are completed.

## Summary

- `06-resource-widgets.yaml`: partially compliant. `ResourceTable` is hand-promoted and story-hardened; part widgets need manual story changelogs/probes review.
- `07-data-display-widgets.yaml`: scaffold-only story coverage across all widgets; implementation promotion is not complete.
- `08-media-widgets.yaml`: scaffold-only story coverage across all widgets; implementation promotion is not complete.
- `09-calendar-widgets.yaml`: scaffold-only story coverage across all widgets; implementation promotion is not complete.

## Findings

### 06 Resource widgets

| Widget | Implementation changelog | Story changelog | Scaffold-like story | Follow-up |
|---|---:|---:|---:|---|
| ResourceTable | yes | yes | no | Add/verify callback probe output for row/bulk/pagination and mobile story if table/card adaptation is owned by widget CSS. |
| BulkActionBar | no | no | no | Add manual changelogs if considered hand-promoted; add visible callback probe for selected/visible scope. |
| PaginationBar | no | no | no | Add manual changelogs if considered hand-promoted; add visible pagination callback probe. |
| ResourceTableCell | yes | no | no | Add story manual changelog; add/verify actions callback probe and tone/status fixtures. |

### 07 Data-display widgets

All audited story files are scaffold-like and have no story manual edit changelog:

- `MetricCard`
- `StatusText`
- `ComparisonTable`
- `KeyValueList`
- `ActivityFeed`
- `MarkdownBlock`
- `EmptyState`
- `LoadingState`
- `InlineError`

These widgets should be promoted only in coherent batches that include implementation, renderer adapter cleanup, story hardening, callback probes where applicable, validation, diary, and changelog.

### 08 Media widgets

All audited story files are scaffold-like and have no story manual edit changelog:

- `PreviewFrame`
- `ImageGrid`
- `ImageGallery`

Media widgets need distinct populated/empty/missing-media/mobile stories. `ImageGallery` needs a callback probe for image actions.

### 09 Calendar widgets

All audited story files are scaffold-like and have no story manual edit changelog:

- `MonthCalendar`
- `CalendarWeek`
- `CalendarEventBlock`

Calendar widgets need distinct marker/selection/navigation/mobile stories and visible callback probes for month navigation, date selection, and event block actions.

## Recommended next tasks

1. Finish resource part story compliance before marking `06-resource-widgets.yaml` fully done.
2. Treat current data-display implementation edits as draft only; either revert or complete them with stories before commit.
3. Promote `07-data-display-widgets.yaml` in small batches:
   - static atoms/molecules (`StatusText`, `MetricCard`, `KeyValueList`, `MarkdownBlock`, states)
   - callback-heavy/data widgets (`ActivityFeed`, `ComparisonTable`)
4. Promote `08-media-widgets.yaml` with media-specific mobile/empty/missing/callback stories.
5. Promote `09-calendar-widgets.yaml` with calendar callback probes and mobile layouts.

## Validation commands run in this remediation pass

- `cd web && npx tsc --noEmit` — passed after layout story hardening and renderer cast cleanup.
- `cd web && pnpm test -- --runInBand` — passed, 10 files / 49 tests.
- `cd web && npx storybook build --quiet` — passed with known large chunk warning.
- `scripts/08-validate-widget-promotion.py --strict-triage --skip-storybook <layout story dirs>` — passed for the six remediated layout story directories.
