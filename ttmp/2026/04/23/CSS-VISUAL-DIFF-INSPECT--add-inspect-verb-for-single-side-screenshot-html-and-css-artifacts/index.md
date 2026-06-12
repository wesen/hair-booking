---
Title: Add inspect verb for single-side screenshot HTML and CSS artifacts
Ticket: CSS-VISUAL-DIFF-INSPECT
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
Summary: "Ticket to implement a css-visual-diff inspect command that reads existing --config YAML files, supports multiple named selectors, and outputs either an artifact directory or a single requested file such as PNG, HTML, CSS JSON/Markdown, or inspect JSON."
LastUpdated: 2026-04-24T01:17:00-04:00
WhatFor: "Landing page for the inspect verb implementation ticket."
WhenToUse: "Use when implementing the inspect-first css-visual-diff workflow."
---

# Add inspect verb for single-side screenshot HTML and CSS artifacts

## Overview

This ticket implements the next small step for `css-visual-diff`: an `inspect` verb that lets users debug a `XXX.css-visual-diff.yml` file before running a full comparison.

The command should load the existing `--config` YAML schema, choose one side (`original` or `react`), run the target's prepare hook, and output screenshot / prepared HTML / computed CSS artifacts for one selected root, section, style, direct selector, or eventually all sections/styles.

It should also support single-file output for scripts:

```bash
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary --format png --output-file button.png
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --style button-primary --format css-md --output-file button-css.md
```

## Key Links

- [Inspect verb implementation plan](./design-doc/01-inspect-verb-implementation-plan.md)
- [Implementation diary](./reference/01-implementation-diary.md)
- [Tasks](./tasks.md)
- [Changelog](./changelog.md)

## Status

Current status: **active**. Ticket and implementation plan are created. Code implementation has not started.

## Important answer: multiple selectors per YAML

Yes. The current config already supports multiple named selectors through `sections[]` and `styles[]`. The inspect command should use this existing shape first, before adding any new shorthand manifest schema.

## Recommended first implementation slice

Implement:

```bash
css-visual-diff inspect --config FILE --side original|react --style NAME --out DIR
css-visual-diff inspect --config FILE --side original|react --style NAME --format png --output-file FILE
```

Then add `--section`, `--root`, `--selector`, `--all-sections`, and `--all-styles`.
