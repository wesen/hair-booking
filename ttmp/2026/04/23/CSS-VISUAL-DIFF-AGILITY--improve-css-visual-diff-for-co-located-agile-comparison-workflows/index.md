---
Title: Improve css-visual-diff for co-located agile comparison workflows
Ticket: CSS-VISUAL-DIFF-AGILITY
Status: active
Topics:
    - tooling
    - visual-regression
    - browser-automation
DocType: index
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: "Ticket workspace for designing the next css-visual-diff iteration: co-located manifests, Storybook story mapping, prepare recipes, baseline caching, and token-aware CSS diagnostics."
LastUpdated: 2026-04-23T20:41:00.850510418-04:00
WhatFor: "Landing page for the css-visual-diff agility improvement analysis and implementation guide."
WhenToUse: "Use when looking for the primary design doc, diary, tasks, or changelog for CSS-VISUAL-DIFF-AGILITY."
---

# Improve css-visual-diff for co-located agile comparison workflows

## Overview

This ticket captures the follow-up design work for improving `css-visual-diff` after it was used in the Pyxis project through central YAML configs and wrapper scripts. The main design goal is to make the tool easier to use during component implementation loops by moving comparison manifests closer to components and making reports more actionable.

The primary proposal covers:

- discovery of co-located `*.css-visual-diff.yml` / `*.css-visual-diff.yaml` manifests,
- project-level config for shared prototype, Storybook, output, token, and recipe settings,
- Storybook story ID/title mapping and variant expansion,
- standardized prepare recipes for prototype rendering,
- original-side baseline caching with explicit reset/verify policies,
- token-aware CSS diff annotations,
- an implementation plan phased for a new intern.

## Key Links

- [Design doc: css-visual-diff agility improvement analysis and implementation guide](./design-doc/01-css-visual-diff-agility-improvement-analysis-and-implementation-guide.md)
- [Design doc: Simplicity-first css-visual-diff workflow analysis](./design-doc/02-simplicity-first-css-visual-diff-workflow-analysis.md)
- [Investigation diary](./reference/01-investigation-diary.md)
- [Tasks](./tasks.md)
- [Changelog](./changelog.md)

## Status

Current status: **active**. The initial broad roadmap and the follow-up simplicity-first analysis are complete. Implementation has not started.

## Topics

- tooling
- visual-regression
- browser-automation

## Implementation entry point

The recommended first implementation slice is now the simplicity-first document's `inspect` command: load one `XXX.css-visual-diff.yml`, inspect one side/selector, and write screenshot, prepared HTML, and computed CSS artifacts. The broader manifest/discovery roadmap should build on that once the YAML iteration loop is pleasant.

## Structure

- `design-doc/` — Architecture and implementation guide.
- `reference/` — Investigation diary.
- `playbooks/` — Future operational command sequences.
- `scripts/` — Future ticket-local helper scripts.
- `various/` — Future working notes.
- `archive/` — Deprecated or reference-only artifacts.
