---
Title: Widget Playbook Compliance Audit Diary
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
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/03-widget-playbook-compliance-audit-guide.md
      Note: Main audit playbook followed
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/04-intern-widget-compliance-review-kickoff.md
      Note: Kickoff instructions followed
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/08-widget-playbook-compliance-audit-report.md
      Note: Full audit report
    - Path: web/src/admin-dsl/render.tsx
      Note: Adapter boundary and dead-code checks
    - Path: web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.stories.tsx
      Note: |-
        Scaffold-only stories; needs hardening
        Scaffold-only stories need hardening
    - Path: web/src/admin-dsl/widgets/molecules/SearchBox/SearchBox.stories.tsx
      Note: |-
        Scaffold-only stories; needs hardening
        Scaffold-only stories need hardening
    - Path: web/src/admin-dsl/widgets/molecules/Tabs/Tabs.stories.tsx
      Note: |-
        Scaffold-only stories; needs hardening
        Scaffold-only stories need hardening
    - Path: web/src/admin-dsl/widgets/molecules/Toolbar/Toolbar.stories.tsx
      Note: |-
        Scaffold-only stories; needs hardening
        Scaffold-only stories need hardening
    - Path: web/src/admin-dsl/widgets/organisms/Panel/Panel.stories.tsx
      Note: |-
        Scaffold-only stories; needs hardening
        Scaffold-only stories need hardening
    - Path: web/src/admin-dsl/widgets/organisms/Panel/Panel.types.ts
      Note: Missing density prop despite implementation using it
    - Path: web/src/admin-dsl/widgets/organisms/SplitPane/SplitPane.stories.tsx
      Note: |-
        Scaffold-only stories; needs hardening
        Scaffold-only stories need hardening
ExternalSources: []
Summary: Diary for the playbook compliance audit of layout widgets from 05-layout-widgets.yaml.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Use to understand what was audited and found during the widget playbook compliance review.
WhenToUse: Use when resuming the compliance audit for other widget categories or fixing findings from the layout audit.
---


# Widget Playbook Compliance Audit Diary

## Goal

Audit whether the 8 layout widgets promoted from `05-layout-widgets.yaml` actually followed the widget implementation playbook end to end. Produce evidence, not assumptions.

## Step 1: Read playbooks, run triage, audit layout widgets, produce report

Read the three playbooks, ran all triage commands, read every layout widget implementation and story file, checked git history for scaffold freshness and commit boundaries, ran the design-system linter, and produced the compliance matrix and audit report.

### Prompt Context

**User prompt (verbatim):** "Let's tackle another review, read and follow @hair-booking/ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/04-intern-widget-compliance-review-kickoff.md"

**Assistant interpretation:** Follow the kickoff playbook to audit layout widget promotions against the implementation playbook, check every compliance checkpoint, produce an evidence-backed matrix and report.

**Inferred user intent:** Validate that the widget promotions didn't skip playbook steps — especially Storybook hardening, which the kickoff flags as the primary concern.

**Commit (code):** No code changes — audit only.

### What I did

- Read playbooks 03 (audit guide), 01 (implementation), 02 (design-system) in full
- Read `05-layout-widgets.yaml` and `06-resource-widgets.yaml`
- Ran `07-lint-admin-dsl-design-system.py`: 25 errors, 3 warnings
- Ran scaffold-only story triage script: found 29 scaffold-looking story files across all widget categories
- Ran promoted-impl-but-no-story-changelog script: found 17 files where the implementation has a manual changelog but the story does not
- Read all 8 layout widget `.tsx` implementation files and all 8 `.stories.tsx` files
- Read all 8 layout widget `.types.ts` files and all 8 `.metadata.ts` files
- Read all 8 layout widget `index.ts` barrel files
- Read `render.tsx` adapter for all 9 widget branches
- Checked git history: separate scaffold-refresh commits exist (Step 69/75/78) before promotion commits (Step 70/76/79)
- Verified dead code: `renderTableCell` is now gone (removed in Step 87)
- Verified `densityPadding` duplication: exists in both `Panel.tsx` and `render.tsx`
- Verified `as unknown as` casts: 11+ instances in `render.tsx`, none documented with rationale
- Found YAML→types→implementation drift: Panel uses `density` prop not in YAML or Panel.types.ts (inherited from CommonWidgetProps)
- Found generator quality issue: every .types.ts imports 8-10 shared types regardless of usage

### Why

The kickoff playbook explicitly says: "The immediate concern is that some widgets were promoted in code, but their Storybook stories stayed generated/scaffold-level." This audit produces the evidence for that concern.

### What worked

- PageHeader is the model widget: implementation has manual changelog, story has manual changelog, stories use distinct fixtures, callback probe story exists, mobile story sets viewport parameter
- DashboardGrid is also well-done: manual changelog in both impl and story, distinct fixtures for gap/span/ordering, mobile story with viewport parameter
- Scaffold freshness is proven: git log shows separate Step 69 (refresh) before Step 70 (promote) for PageHeader, Step 75 before Step 76 for DashboardGrid, Step 78 before Step 79 for the rest
- Adapter boundary is clean: no widget imports `AdminNode`, `AdminPage`, `AdminJsonObject`, or `dispatchAdminAction`
- `renderTableCell` dead code has been cleaned up since the earlier review

### What didn't work

- **6 of 8 layout widgets have scaffold-only stories** — Panel, Toolbar, SplitPane, Tabs, FilterBar, SearchBox all have story files with only the generated provenance header, no `Manual edits after generation`, and all stories use `...defaultArgs` rendering identical states
- **The "Story fixture and assertions" diagnostic UI** is still present in all 6 scaffold stories — this is the generated scaffold's debug feature, not meaningful visual coverage
- **No callback probe stories exist** for any of the 6 scaffold-story widgets despite Tabs, FilterBar, and SearchBox being callback-heavy
- **Mobile stories don't actually set mobile conditions** — `SplitPane.MobileStacked`, `Panel.MobilePanelPadding`, `Tabs.WrappingMobile`, and `FilterBar.ManyFiltersWrap` all render inside `<div style={{ padding: 24, maxWidth: 1120 }}>` with no viewport parameter (except PageHeader.LongTitleMobile which correctly sets `viewport: { defaultViewport: "mobile1" }` and uses a narrow container)
- **`densityPadding` duplicated** in `Panel.tsx` (lines 13, 36, 58, 77) and `render.tsx` (line 69) — linter flags this as a local-style-helper concern
- **11 undocumented `as unknown as` casts** in `render.tsx` — linter flags all of them
- **Panel has a manual `data-admin-dsl-density` attribute** (line 45) instead of using `widgetDataAttributes`/`dataAttrsFromRecord`

### What I learned

- The scaffold-only story problem is systematic, not isolated. The triage script found 29 scaffold-looking story files across all widget categories. The layout batch just happens to be the first audited.
- The "implementation promoted but story lacks manual changelog" script found 17 files — this means many widget promotions skipped Step 10 of the playbook.
- The playbook's Step 10 guidance about replacing `defaultArgs` and adding callback probes was clearly followed for PageHeader and DashboardGrid but not for the remaining 6 widgets, which were promoted as a batch in Step 79.
- `render.tsx` still has `densityPadding` (line 69) that duplicates the Panel widget's local helper. The playbook's new Step 6.5 says to remove dead renderer code, but this helper is not dead — it's used by the `panel` adapter branch. It's a shared helper that should move to `shared/`.
- Panel's `density` prop is inherited from `CommonWidgetProps` but not documented in the Panel YAML. This is a Step 9 drift: implementation added a prop without updating the YAML. The adapter reads it from raw JSON, so it works, but the contract isn't explicit.
- Every generated `.types.ts` imports all shared types (CalendarCellActionHandler, ResourceTableColumnKind, etc.) regardless of whether the widget uses them. SplitPane has no action slots but imports TableRowActionHandler. This is a generator quality issue that makes type files noisy.
- The `as unknown as` casts in render.tsx fall into two categories: trivial (TypeScript strictness workarounds for `str()` returns) and non-trivial (bypassing typed contracts for columns/action refs). Only the non-trivial ones are real type holes.

### What was tricky to build

- Determining whether a story file is "scaffold-only" vs "promoted" required checking two signals: (1) presence of `Manual edits after generation`, and (2) whether stories render distinct fixtures. The triage script checks both but has false positives for stories that happen to use `defaultArgs` once (e.g., a base story that extends `defaultArgs` but varies a single prop).
- The `MobileStacked`/`MobilePanelPadding` story names suggest mobile behavior, but they don't set viewport parameters or narrow containers. This is misleading — someone looking at story names would think mobile was tested, but it wasn't.

### What warrants a second pair of eyes

- The Panel story's `CompactNoPadding` and `WithToolbarAction` stories both render the same `defaultArgs` — they don't actually pass `padding: "none"` or `toolbarActions`. Is this intentional (just proving the widget renders) or an oversight?
- The `as unknown as` casts in render.tsx are pervasive (11 instances). Some are for `str(props, "id", undefined as unknown as string)` which is a TypeScript strictness workaround, not a type hole. Should these be documented differently?

### What should be done in the future

1. Harden Panel, Toolbar, SplitPane, Tabs, FilterBar, SearchBox stories — distinct fixtures, callback probes, real mobile viewport
2. Move `densityPadding` to shared helpers (used by both Panel and render.tsx)
3. Document or replace `as unknown as` casts in render.tsx (at least the non-trivial ones like the resourceTable columns cast)
4. Fix pagination callback wiring in resourceTable adapter (from previous review — still unfixed)
5. Audit remaining widget categories (07-data-display, 08-media, 09-calendar) using the same matrix
6. Add `data-admin-dsl-density` to `widgetDataAttributes` or `dataAttrsFromRecord` patterns so Panel doesn't manually set it

### Code review instructions

- Start with the audit report (being written now)
- Compare PageHeader.stories.tsx (good) vs Panel.stories.tsx (scaffold) to see the gap
- Key failing files: Panel.stories.tsx, Tabs.stories.tsx, FilterBar.stories.tsx, SearchBox.stories.tsx, Toolbar.stories.tsx, SplitPane.stories.tsx
- Design-system linter output: 25 errors, 3 warnings (see full output in audit report)

### Technical details

- Design-system linter: 25 errors, 3 warnings (hardcoded colors, raw-token imports, manual data attributes, local style helpers, button-without-action-widget, undocumented as-unknown-as)
- Scaffold-only story triage: 29 files identified
- Promoted-impl-but-no-story-changelog: 17 files identified
- Git history confirms separate scaffold-refresh commits exist for all 3 promotion batches
- `renderTableCell` dead code has been cleaned up since earlier review
