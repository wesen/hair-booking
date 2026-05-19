---
Title: Intern Kickoff — Widget Playbook Compliance Review
Ticket: HAIR-041
Status: active
Topics:
    - frontend
    - admin-dsl
    - storybook
    - audit
    - intern-guide
DocType: playbook
Intent: short-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/03-widget-playbook-compliance-audit-guide.md
      Note: Main audit playbook to follow
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/01-widget-ir-to-finished-widget-playbook.md
      Note: Implementation playbook whose compliance is being checked
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/playbooks/02-admin-dsl-widget-design-system-review-playbook.md
      Note: Companion design-system review playbook
    - Path: ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/sources/admin-dsl-widget-ir/05-layout-widgets.yaml
      Note: First widget category to audit
Summary: Concise kickoff instructions for the intern taking over the Admin DSL widget playbook compliance review.
---

# Intern Kickoff — Widget Playbook Compliance Review

## Mission

Audit whether Admin DSL widget promotions actually followed the widget implementation playbook end to end. The immediate concern is that some widgets were promoted in code, but their Storybook stories stayed generated/scaffold-level.

Your job is to produce evidence, not assumptions.

## Start Here

Read these in order:

1. `playbooks/03-widget-playbook-compliance-audit-guide.md`
2. `playbooks/01-widget-ir-to-finished-widget-playbook.md`, especially **Step 10: Update Storybook**
3. `playbooks/02-admin-dsl-widget-design-system-review-playbook.md`

Then audit from this YAML forward:

1. `sources/admin-dsl-widget-ir/05-layout-widgets.yaml`
2. `sources/admin-dsl-widget-ir/06-resource-widgets.yaml`
3. `sources/admin-dsl-widget-ir/07-data-display-widgets.yaml`
4. `sources/admin-dsl-widget-ir/08-media-widgets.yaml`
5. `sources/admin-dsl-widget-ir/09-calendar-widgets.yaml`

## What to Check Per Widget

For each widget, answer:

- Was the scaffold refreshed before manual implementation?
- Does the implementation file have a `Manual edits after generation` changelog?
- Does the story file also have a `Manual edits after generation` changelog?
- Do story names map to visibly distinct fixtures?
- Are there callback probe stories for callback-heavy widgets?
- Does mobile/narrow behavior work in isolated Storybook when relevant?
- Did `render.tsx` become a thin adapter instead of keeping duplicated visual JSX?
- Were design-system checks run or are exceptions documented?
- Were validation commands and outcomes recorded?
- Were diary/changelog entries written?

## Fast Triage Commands

Run from repo root:

```bash
python3 ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/scripts/07-lint-admin-dsl-design-system.py

python3 - <<'PY'
from pathlib import Path
for p in sorted(Path('web/src/admin-dsl/widgets').rglob('*.stories.tsx')):
    txt = p.read_text()
    scaffoldish = 'Story fixture and assertions' in txt or (txt.count('...defaultArgs') > 1 and 'Manual edits after generation' not in txt)
    if scaffoldish:
        print(p)
PY
```

Treat output as leads, not final verdicts.

## Deliverable

Create a short audit report with:

- scope audited
- pass/fail/needs-follow-up widget matrix
- critical findings with file paths and line evidence
- list of Storybook files that need hardening
- recommended commit plan for remediation
- validation commands run and results

Use the matrix template from `playbooks/03-widget-playbook-compliance-audit-guide.md`.

## Priority Findings to Look For

Start by checking these likely problem areas:

- Layout stories from `05-layout-widgets.yaml` that still render identical `defaultArgs`
- Story files without `Manual edits after generation`
- Callback-heavy stories without visible callback output
- Mobile story names that do not actually set narrow/mobile conditions
- Renderer branches that still own visual JSX after a widget was promoted

## Stop Conditions

Stop and ask for review if you find:

- a promoted implementation whose story file is still generated/scaffold-only
- a widget importing `dispatchAdminAction`
- force-regeneration over a file with `Manual edits after generation`
- Storybook mobile behavior that only works through `render.tsx` global CSS
- unrelated dirty files mixed into widget work

## Suggested First Report Scope

Begin with `05-layout-widgets.yaml` only. Audit these widgets first:

- `PageHeader`
- `DashboardGrid`
- `Panel`
- `Toolbar`
- `SplitPane`
- `Tabs`
- `FilterBar`
- `SearchBox`

This gives a manageable first report and catches the known Storybook process gap.
