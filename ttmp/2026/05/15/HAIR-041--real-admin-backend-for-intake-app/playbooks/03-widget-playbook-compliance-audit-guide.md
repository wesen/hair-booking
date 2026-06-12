---
Title: Widget Playbook Compliance Audit Guide
Ticket: HAIR-041
Status: active
Topics:
    - frontend
    - admin-dsl
    - playbook
    - storybook
    - audit
    - code-review
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/01-widget-ir-to-finished-widget-playbook.md
      Note: Primary implementation workflow whose steps this guide audits
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/02-admin-dsl-widget-design-system-review-playbook.md
      Note: Companion design-system review playbook; this guide checks whether it was invoked, not the full design details
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py
      Note: Widget scaffold generator used to verify regeneration and provenance
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/07-lint-admin-dsl-design-system.py
      Note: Scriptable design-system lint check that should be part of compliance evidence
    - Path: web/src/admin-dsl/widgets
      Note: Widget implementation, type, story, metadata, and barrel outputs to audit
ExternalSources: []
Summary: Intern-facing audit guide for checking whether every Admin DSL widget promotion followed the implementation playbook end to end, including generated refresh, manual changelogs, meaningful Storybook stories, adapter boundaries, validation, diary, changelog, and commit hygiene.
LastUpdated: 2026-05-19T00:00:00-04:00
WhatFor: Use to audit existing or proposed Admin DSL widget work for process compliance before more widget categories are promoted.
WhenToUse: Use after a widget extraction commit, before merging a widget batch, after discovering a process miss, or when onboarding an intern to verify that playbook steps were not skipped.
---

# Widget Playbook Compliance Audit Guide

## Purpose

This guide is for an intern performing a process audit. It answers one question:

> Did the widget promotion actually follow the widget implementation playbook, or did it only make the component compile?

This is separate from the design-system review playbook. The design-system review checks visual grammar, token usage, and shared helper alignment. This compliance guide checks whether the entire workflow was followed: YAML reading, scaffold regeneration, commit boundaries, implementation, adapter cleanup, Storybook hardening, validation, screenshots when needed, diary, changelog, and file relationships.

A widget is not considered playbook-complete just because the `.tsx` file was promoted. A playbook-complete widget has evidence across code, stories, renderer adapter, tests/build output, and ticket documentation.

## Audit Inputs

For each widget family, collect these inputs before judging anything:

- Widget IR YAML file, for example:
  - `sources/admin-dsl-widget-ir/05-layout-widgets.yaml`
  - `sources/admin-dsl-widget-ir/06-resource-widgets.yaml`
  - `sources/admin-dsl-widget-ir/07-data-display-widgets.yaml`
  - `sources/admin-dsl-widget-ir/08-media-widgets.yaml`
  - `sources/admin-dsl-widget-ir/09-calendar-widgets.yaml`
- Generated/implemented widget directory under `web/src/admin-dsl/widgets/`.
- Current renderer adapter: `web/src/admin-dsl/render.tsx`.
- Scaffold generator: `scripts/05-scaffold-admin-dsl-widgets.py`.
- Design-language generator and helpers when shared styles are involved:
  - `scripts/06-generate-admin-dsl-design-language.py`
  - `sources/admin-dsl-widget-ir/15-design-language.yaml`
  - `web/src/admin-dsl/widgets/shared/*`
- Primary playbooks:
  - `playbooks/01-widget-ir-to-finished-widget-playbook.md`
  - `playbooks/02-admin-dsl-widget-design-system-review-playbook.md`
- Ticket diary and changelog:
  - `reference/01-diary.md`
  - `changelog.md`
- Relevant commits from `git log --oneline -- <paths>`.

## Quick Triage: Find Likely Process Misses

Run these commands from the repository root.

Start by recording the exact tree state being audited. If the tree is dirty, split findings into **committed HEAD findings** and **dirty working-tree findings**. Do not report a dirty-file issue as a committed regression unless you verified it with `git show HEAD:<path>` or after stashing unrelated work.

```bash
# Record audit scope and dirty state first.
git status --short
git rev-parse --short HEAD

# Find generated-looking stories that may not have been hand-promoted.
python3 - <<'PY'
from pathlib import Path
for p in sorted(Path('web/src/admin-dsl/widgets').rglob('*.stories.tsx')):
    txt = p.read_text()
    scaffoldish = 'Story fixture and assertions' in txt or (txt.count('...defaultArgs') > 1 and 'Manual edits after generation' not in txt)
    if scaffoldish:
        print(p)
PY

# Find promoted implementations that have manual changelogs but stories do not.
python3 - <<'PY'
from pathlib import Path
for impl in sorted(Path('web/src/admin-dsl/widgets').rglob('*.tsx')):
    if impl.name.endswith('.stories.tsx') or impl.name.endswith('.test.tsx'):
        continue
    txt = impl.read_text()
    if 'Manual edits after generation' not in txt:
        continue
    story = impl.with_name(impl.stem + '.stories.tsx')
    if story.exists() and 'Manual edits after generation' not in story.read_text():
        print(f'implementation promoted but story lacks manual changelog: {story}')
PY

# Check for design-system and adapter red flags.
python3 ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/07-lint-admin-dsl-design-system.py

# Check TypeScript after any audit patch.
cd web && npx tsc --noEmit
```

These commands do not replace the full audit. They identify files that deserve immediate human inspection.

### Triage Output Rules

Treat triage output as a lead, not a verdict.

- Re-open the file and verify the finding against current source before putting it in the report.
- If a linter finding is from an uncommitted file, label it as working-tree-only.
- If a finding was already fixed by a later commit, move it to an "already fixed / not current" section instead of the critical findings list.
- If a prop is inherited from `CommonWidgetProps`, do not automatically fail it. Fail it only when the widget YAML intent/examples/adapter treat that prop as widget-specific but the explicit widget contract omits it.
- Separate trivial TypeScript casts from real adapter type holes. `undefined as unknown as string` default-value workarounds are cleanup items; casts that bypass action, row, column, form, or calendar context normalization are correctness risks.

## Audit Checklist

Use this checklist per widget, not just per YAML file.

### 1. YAML Was Read and Used

Evidence to look for:

- The implementation reflects `intent.purpose`, `intent.design_rationale`, and `intent.adapter_boundary` from the YAML.
- Props in `<Widget>.types.ts` match `contract.props`.
- Action slots and callback context match `contract.action_slots`.
- Story names in `<Widget>.stories.tsx` correspond to YAML `stories` entries, but are not merely generated placeholders.

Fail conditions:

- The widget implementation appears copied from another widget without using the YAML contract.
- Required YAML stories exist as names only and render identical `defaultArgs`.
- Action slots are ignored or lowered through a generic/wrong callback.

### 2. Scaffold Freshness Was Proven Before Hand Editing

Evidence to look for:

- The relevant widget files were generated by the current `scripts/05-scaffold-admin-dsl-widgets.py`.
- Generated files include metadata sidecars, current source YAML path, generator path, widget ID, and provenance header.
- If scaffold output changed, there is a separate generated-refresh commit before manual implementation.

Useful commands:

```bash
git log --oneline -- web/src/admin-dsl/widgets/<level>/<Widget>
python3 ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/05-scaffold-admin-dsl-widgets.py \
  --dry-run \
  ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/<category>.yaml \
  --name <Widget>
```

Pass conditions:

- Scaffold-only widgets may be force-regenerated.
- Hand-promoted widgets are not force-regenerated unless the rebuild is explicit and documented.
- Generated refresh and manual promotion are reviewable as separate commits when the diff is non-trivial.

Fail conditions:

- A promoted file with `Manual edits after generation` was overwritten by broad `--force` generation without explicit rationale.
- Scaffold and implementation changes are mixed in a way that makes review impossible.

### 3. Manual Edit Changelog Exists in Every Promoted File

Every hand-promoted generated file must explain what changed near the top.

Required in promoted files:

```tsx
/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step N: Replaced scaffold placeholder with real <Widget> implementation.
 * - 2026-05-19 / HAIR-041 Step N: Replaced generated same-args stories with focused fixtures and callback probes.
 */
```

Check at least:

- `<Widget>.tsx`
- `<Widget>.stories.tsx`
- widget-local CSS/module files if created from scaffold
- tests if generated then hand-edited

Fail conditions:

- Implementation has manual changelog but story does not.
- Story file has obviously hand-written fixtures but still has only generated provenance header.
- Manual changelog claims Storybook hardening, but stories still render identical `defaultArgs`.

### 4. Implementation Uses Typed Props and Emits Typed Callbacks

Evidence to look for:

- Widget imports `type <Widget>Props` and uses normalized typed props.
- Widget does not import `AdminNode`, `AdminPage`, `AdminJsonObject`, `dispatchAdminAction`, or renderer utilities.
- Widget emits typed callbacks such as `onAction`, `onRowAction`, `onSelectDate`, `onImageAction`.
- Renderer adapter lowers those callbacks to `dispatchAdminAction`.

Fail conditions:

- Widget parses raw Admin DSL JSON directly.
- Widget dispatches backend actions directly.
- Action context is semantically wrong, for example pagination routed through bulk action context.
- `as unknown as` appears in adapter code without a nearby rationale or normalizer.

### 5. Renderer Adapter Was Cleaned Up

For widgets extracted from `render.tsx`, verify the old inline rendering did not remain as dead code.

Check:

- The `case "widgetKind"` branch now adapts raw props to typed widget props.
- Visual JSX moved into the widget.
- Stale helper functions were removed or explicitly justified.
- Typed callback lowering is correct.
- `responsiveCss` no longer owns widget-specific behavior that Storybook must prove.

Useful commands:

```bash
rg 'case "<kind>"|render<Table|Cell|Widget>|as unknown as|dispatchAdminAction' web/src/admin-dsl/render.tsx
```

Fail conditions:

- Renderer still contains a large copy of the old visual implementation after the widget was promoted.
- Storybook cannot demonstrate mobile behavior because needed CSS still only exists in `render.tsx`.

### 6. Storybook Stories Are Hand-Promoted, Not Just Generated

This is the miss this guide is designed to catch.

A promoted story file must have:

- `Manual edits after generation` changelog.
- Distinct fixtures for each story name.
- No repeated `args: { ...defaultArgs }` for every scenario unless the story changes behavior through a custom render wrapper.
- No generic generated diagnostics UI such as `Story fixture and assertions` unless intentionally retained in a developer-only story.
- Visible differences between named stories.
- Mobile/narrow story when layout changes at small widths.
- Empty/loading/error/long/dense data stories when relevant.
- Callback probe story for callback-heavy widgets.

Callback probe requirements:

- The story must show last emitted callback data on screen, or assert it in a `play` function.
- The displayed/probed context must match the typed callback contract.
- The probe must not call `dispatchAdminAction`; it only records widget-emitted callbacks.

Example audit questions:

- Does `Tabs.ActiveTab` actually set a different `value` than `Tabs.Default`?
- Does `FilterBar.ManyFiltersWrap` actually provide enough filters to wrap?
- Does `SearchBox.SubmitDispatch` show the submitted query?
- Does `Panel.WithFooterActions` include footer actions and a visible callback output?
- Does `ComparisonTable.RowActions` show row action callback context?
- Does `MonthCalendar.PreviousNextActions` prove previous/next/select contexts separately?

Fail conditions:

- Story names differ but all stories render the same component state.
- Callback-heavy widget has no visible callback output or play assertion.
- Mobile story relies on app-level renderer CSS instead of widget-local behavior.
- Storybook build was not run after story changes.

### 6.5. Storybook Backfill Must Update Task State

If an audit finds scaffold-only stories for a widget that a task already marks as having "Storybook coverage," do not leave the task as-is. Add explicit remediation tasks or reopen/annotate the earlier task so the tracker does not claim completed coverage while the story file remains generated.

Evidence to look for:

- A task exists for the Storybook backfill, not only for implementation promotion.
- The task names the concrete story files to harden.
- The task is checked only after the story file has a manual edit changelog, distinct fixtures, callback probes where needed, and validation output.

### 7. Design-System Review Was Invoked

This guide does not duplicate the full design-system review, but it verifies that the review was performed.

Evidence to look for:

- `scripts/07-lint-admin-dsl-design-system.py` was run, or equivalent manual checks are documented.
- Raw `fringe-ui/tokens` imports in promoted widgets are justified or moved to shared helpers.
- Repeated button/pill/badge/surface styles are moved to generated shared helpers where appropriate.
- Action controls use `ActionButton`/`ActionGroup` unless they are documented structural controls.

Fail conditions:

- Local helpers named `buttonStyle`, `sharedStyle`, `pillStyle`, `densityPadding`, etc. appear without explanation.
- Multiple widgets duplicate the same color/border/radius recipe.
- Design helper changes were made directly in generated shared output instead of source YAML/generator.

### 8. Tests, TypeScript, Storybook Build, and Screenshots

Minimum validation evidence:

```bash
cd web && npx tsc --noEmit
cd web && pnpm test -- --runInBand
cd web && npx storybook build --quiet
```

Additional validation when behavior or backend adapter changed:

```bash
go test ./... -count=1
```

Screenshot evidence is required when visual layout changed materially or when mobile behavior is a key part of the promotion. Screenshots should target Storybook iframe URLs or app routes without Storybook chrome unless the chrome is being tested.

Pass conditions:

- Validation commands and outcomes are recorded in the diary.
- Known warnings are named explicitly, not hidden.
- Screenshot paths are stored under ticket `various/` artifacts when captured.

Fail conditions:

- Storybook stories were changed but Storybook build was not run.
- Mobile/responsive changes were made without mobile Storybook evidence.

### 9. Diary and Changelog Were Updated

For each meaningful batch, the diary must explain:

- User prompt context.
- What changed.
- Why the batch was scoped that way.
- What worked.
- What failed, with exact commands/errors.
- What was tricky.
- What warrants second review.
- Future follow-ups.
- Code review instructions.
- Validation commands.

The changelog should contain a compact entry with commit hash and related files.

Fail conditions:

- Code was committed without diary/changelog for a non-trivial widget batch.
- Diary says stories were hardened but story files remain scaffold-style.
- Changelog omits renderer adapter or story files that materially changed.

### 10. Commit Boundaries Are Reviewable

Expected commit boundaries:

1. YAML/spec update, if any.
2. Generated scaffold refresh.
3. Implementation + renderer adapter + meaningful stories for a small coherent widget batch.
4. Story-only hardening commit if stories are large or backfilled after implementation.
5. Validation/docs/diary/changelog commit.

Fail conditions:

- Generated refresh, implementation, story hardening, screenshots, and docs are all mixed into one large commit.
- Unrelated dirty files are staged.
- Known unrelated files are accidentally included.

Before reviewing a commit, run:

```bash
git show --stat <commit>
git show --name-only <commit>
git show <commit> -- web/src/admin-dsl/widgets/<...>
```

## Widget Audit Matrix Template

Copy this table into an audit note and fill one row per widget.

| Widget | YAML read | Scaffold fresh | Separate scaffold commit | Impl changelog | Story changelog | Stories distinct | Callback probe | Adapter cleanup | Design lint | Validation | Diary/changelog | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PageHeader | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | pass/fail |
| DashboardGrid | ? | ? | ? | ? | ? | ? | N/A | ? | ? | ? | ? | pass/fail |
| Panel | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | pass/fail |

Use `N/A` only when a requirement truly does not apply. For example, a static `MarkdownBlock` does not need a callback probe, but it still needs long/multiline stories.

## Audit Report Template

```markdown
# Widget Playbook Compliance Audit — <date>

## Scope

YAML files audited:
- `sources/admin-dsl-widget-ir/05-layout-widgets.yaml`
- ...

Widget directories audited:
- `web/src/admin-dsl/widgets/...`

## Executive Summary

- Pass: N widgets
- Fail: N widgets
- Needs follow-up: N widgets

## Critical Findings

1. <Finding title>
   - Evidence: `<file>:<line>`
   - Playbook rule violated: <rule>
   - Required fix: <fix>

## Widget Matrix

<paste matrix>

## Validation Run

Commands:
- `cd web && npx tsc --noEmit`
- `cd web && pnpm test -- --runInBand`
- `cd web && npx storybook build --quiet`

Results:
- ...

## Recommended Commit Plan

1. <commit boundary>
2. <commit boundary>

## Files Requiring Immediate Storybook Backfill

- `<Widget>.stories.tsx`: reason
```

## Red Flags That Require Immediate Stop

Stop the promotion and ask for review if any of these are true:

- You are about to run `--force` over a file with `Manual edits after generation`.
- A story file still has generated scenario names but every story uses identical `defaultArgs`.
- A callback-heavy widget has no callback probe.
- A widget imports `dispatchAdminAction`.
- A widget parses `AdminNode` or raw `AdminJsonObject` directly.
- Generated shared helper files were edited by hand instead of changing `15-design-language.yaml` and regenerating.
- Storybook mobile behavior depends on `render.tsx` global responsive CSS.
- The commit includes unrelated dirty files.

## What “Done” Means

A widget is done only when all of these are true:

- YAML contract and intent are reflected in typed props and implementation.
- Scaffold was current before hand editing.
- Implementation, stories, and any tests have manual edit changelogs.
- Stories are meaningful, distinct, and interactive when needed.
- Renderer adapter is a thin raw-JSON-to-typed-props boundary.
- Callback contexts are semantically correct.
- Design-system review has passed or has documented exceptions.
- TypeScript, tests, and Storybook build pass.
- Diary and changelog record the work.
- Commits are reviewable and do not include unrelated files.
