---
Title: Widget IR Review Diary
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
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/03-widget-ir-to-finished-widget-playbook.md
      Note: Implementation playbook under review
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/04-admin-dsl-widget-design-system-review-playbook.md
      Note: Design system review playbook under review
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/reference/05-admin-dsl-widget-ir-review.md
      Note: |-
        Full review report produced by this review step
        Full review report produced by this review
    - Path: web/src/admin-dsl/render.tsx
      Note: |-
        Renderer adapter boundary reviewed; dead renderTableCell found; pagination callback wiring issue found
        Dead renderTableCell and pagination callback wiring issue
    - Path: web/src/admin-dsl/widgets/molecules/FilterBar/FilterBar.tsx
      Note: |-
        Duplicates pill styling with Tabs
        Duplicates pill styling with Tabs — highest priority fix
    - Path: web/src/admin-dsl/widgets/molecules/Tabs/Tabs.tsx
      Note: |-
        Duplicates pill styling with FilterBar
        Duplicates pill styling with FilterBar — highest priority fix
    - Path: web/src/admin-dsl/widgets/organisms/ResourceTable/ResourceTable.tsx
      Note: |-
        Raw token imports for table layout colors
        Raw token imports should use adminTokens/adminTextStyle
ExternalSources: []
Summary: Separate diary for the Admin DSL Widget IR review session covering playbook clarity, generator workflow, widget code quality, adapter boundary, and validation.
LastUpdated: 2026-05-18T21:00:00-04:00
WhatFor: Use to understand what was reviewed, what was found, and what should happen next for design-system compliance.
WhenToUse: Use when resuming HAIR-041 widget design-system work or reviewing the review itself.
---


# Widget IR Review Diary

## Goal

Validate whether the Admin DSL widget playbooks are understandable and whether the promoted widgets actually follow them. Deliver a structured review report and a diary of findings.

## Step 1: Read playbooks and YAML sources, run generators, review widgets, check adapter, validate, write report

This step performed a comprehensive review of the two Admin DSL widget playbooks, the design-language YAML, and both widget IR YAML files; verified the generator separation; reviewed all 12 promoted widget files for design-system compliance; checked the render.tsx adapter boundary for all 9 widget branches; ran TypeScript, Vitest, and Storybook validation; and wrote a structured review report.

### Prompt Context

**User prompt (verbatim):** "Validate whether the new Admin DSL widget workflow is understandable and whether the implemented widgets actually follow it. You are reviewing both: 1. the instructions/playbooks, and 2. the code quality/design-system compliance of the widgets built from those instructions."

**Assistant interpretation:** Review the two playbooks and all promoted widget code for clarity, correctness, design-system compliance, and adapter boundary cleanliness. Run generators to confirm separation. Validate. Deliver a short report.

**Inferred user intent:** Ensure the instruction set is good enough for a newcomer and that the code it guided is actually compliant with the design system it defines.

**Commit (code):** 1e3dcfa (no code changes — review only)

### What I did

- Read all 5 docs in order: 03-playbook, 04-design-system-playbook, 15-design-language.yaml, 05-layout-widgets.yaml, 06-resource-widgets.yaml
- Ran `05-scaffold-admin-dsl-widgets.py --dry-run --force --name Panel` and confirmed it reports only widget-local files, no `shared/*` writes
- Ran `06-generate-admin-dsl-design-language.py --dry-run` and confirmed it owns `shared/*` outputs
- Read all 8 layout widget files: PageHeader, DashboardGrid, Panel, Toolbar, SplitPane, Tabs, FilterBar, SearchBox
- Read all 4 resource widget files: ResourceTable, ResourceTableCell, BulkActionBar, PaginationBar
- Read render.tsx adapter and checked all 9 widget branches
- Ran `npx tsc --noEmit` (pass), `pnpm test -- --runInBand` (49/49 pass), `npx storybook build --quiet` (pass, known large chunk warning)
- Wrote review report to `reference/05-admin-dsl-widget-ir-review.md`
- Created this separate diary document

### Why

The playbooks are the primary onboarding artifact for future widget work. If they're unclear or the code they guided doesn't follow their own rules, the whole extraction model breaks down.

### What worked

- Generator separation is clean and verified: widget scaffold never touches `shared/*`
- Adapter boundary is clean: zero widgets import `AdminNode`, `AdminPage`, `AdminJsonObject`, or `dispatchAdminAction`
- All manual-edit changelogs are present in hand-promoted files
- ActionGroup delegation is consistent across PageHeader, Panel, Toolbar, BulkActionBar, PaginationBar, and ResourceTableCell
- Shared helpers (`adminTextStyle`, `adminSurfaceStyle`, `adminTokens`, `widgetDataAttributes`, `dataAttrsFromRecord`) are used correctly by PageHeader, DashboardGrid, and Panel
- All three validation checks pass (TypeScript, Vitest, Storybook)
- The design-system review playbook correctly identifies the FilterBar/Tabs pill duplication and gives a clear 4-step remediation path

### What didn't work

- **FilterBar and Tabs duplicate identical pill styling using raw tokens** — the design-system playbook identifies this but the code hasn't been fixed yet
- **ResourceTable family (4 files) imports raw tokens** instead of `adminTokens`/`adminTextStyle`
- **SearchBox imports raw `color` and `type`** even though it already uses `adminSurfaceStyle` and `actionButtonStyle`
- **render.tsx has dead `renderTableCell` function** after ResourceTable promotion
- **PaginationBar callback is incorrectly routed** through `onBulkAction` instead of its own dispatch

### What I learned

- The playbooks are thorough but Step 2.75's "don't force-regenerate over promoted code" warning is too buried in a paragraph
- No playbook step exists for cleaning up dead renderer code after promotion
- Some shared helper names in the playbook (e.g., `sidebarNavButtonStyle`, `shellMenuButtonStyle`) may not exactly match current exports — a newcomer would need to check the barrel file
- `densityPadding` is duplicated between `Panel.tsx` and `render.tsx` and this isn't called out in either playbook

### What was tricky to build

- The PaginationBar callback wiring issue is subtle: it's not a TypeScript error, it's a semantic correctness issue where pagination actions are silently routed through the bulk action path with `|| void context` swallowing the result
- The `densityPadding` duplication between Panel.tsx and render.tsx was easy to miss — the function is identical but in two places
- The `as unknown as` cast in the resourceTable adapter is a type hole that passes TypeScript but defeats the typed contract

### What warrants a second pair of eyes

- The PaginationBar callback wiring in render.tsx's resourceTable case — should pagination have its own `dispatchAdminAction` call?
- The `as unknown as` cast passing `AdminJsonObject` as the `Row` generic — is this acceptable as a transitional adapter pattern?
- Whether `densityPadding` should move to shared helpers now that it's duplicated in Panel.tsx and render.tsx

### What should be done in the future

1. Add `selectionPillStyle` to design language YAML, regenerate shared helpers, refactor FilterBar and Tabs (highest priority design-system fix)
2. Replace raw token imports in ResourceTable family with `adminTokens`/`adminTextStyle`
3. Fix PaginationBar callback wiring in render.tsx (correctness issue)
4. Remove dead `renderTableCell` from render.tsx
5. Add "cleanup dead renderer code" step to the implementation playbook
6. Add prominent "don't force-regenerate promoted code" callout to playbook Step 2.75

### Code review instructions

- Start with the full report: `reference/05-admin-dsl-widget-ir-review.md`
- Key problem files: `FilterBar.tsx`, `Tabs.tsx` (pill duplication), `ResourceTable.tsx`, `ResourceTableCell.tsx`, `BulkActionBar.tsx`, `PaginationBar.tsx` (raw tokens)
- Key adapter issues: render.tsx `renderTableCell` dead code (lines ~60-80), resourceTable case pagination callback wiring

### Technical details

- TypeScript: pass (zero errors)
- Vitest: 49/49 pass
- Storybook: build pass (known large chunk warning acceptable)
- Widget scaffold dry-run for Panel: produces 5 widget-local files, no `shared/*` writes
- Design language dry-run: produces 7 `shared/*` files
