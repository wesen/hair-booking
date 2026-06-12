---
Title: Short implementation plan
Ticket: HAIR-018
Status: active
Topics:
    - tooling
    - browser-automation
    - chromedp
    - visual-regression
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../../../../code/wesen/corporate-headquarters/go-template
      Note: Template source for standard Go project scaffolding
    - Path: ../../../../../../../../../2026-01-18/hair-booking-start/hair-booking/cmd/sbcap
      Note: CLI source to import as baseline
    - Path: ../../../../../../../../../2026-01-18/hair-booking-start/hair-booking/internal/sbcap
      Note: Internal comparison engine to import as baseline
    - Path: ../../../../../../../css-visual-diff
      Note: Target repository being rebuilt
    - Path: ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/design-doc/01-sbcap-analysis-architecture-and-standalone-screen-diff-extraction-guide.md
      Note: Upstream analysis motivating the migration plan
ExternalSources: []
Summary: Short execution plan for turning css-visual-diff from a Python prototype into a clean Go tool seeded from sbcap.
LastUpdated: 2026-04-21T19:02:20.788499112-04:00
WhatFor: Guide the repository reset, import, rename, and validation work.
WhenToUse: Use when rebuilding css-visual-diff and reviewing the migration shape.
---


# Short implementation plan

## Executive Summary

`css-visual-diff` should stop being an accreting Python prototype and become a clean Go CLI seeded from the already-working `sbcap` codebase. The implementation strategy is intentionally mechanical: preserve the current prototype under `legacy/`, copy the standard Go project scaffold into the repo, copy `sbcap` in verbatim as the new starting point, then rename and trim the imported code until the repository looks and behaves like a normal `go-go-golems` CLI.

## Problem Statement

The current `css-visual-diff` repository is not shaped like a production Go tool. It contains a Python CLI prototype, checked-in output artifacts, and no standard Go module or release plumbing. We already analyzed in HAIR-017 that `sbcap` contains the right browser automation, CSS diffing, matched-style inspection, and pixel diff building blocks. The problem is therefore not feature invention; it is replacing the current repo structure with a clean Go baseline quickly and safely.

## Proposed Solution

Use a three-layer migration:

1. **Archive the current state**
   - Move the existing Python prototype and checked-in artifacts into `legacy/python-prototype/`.
   - Keep the history in Git, but remove the prototype from the live root.

2. **Lay down a clean Go project scaffold**
   - Copy the standard files from `~/code/wesen/corporate-headquarters/go-template` into the repo using `cp`.
   - Exclude template Git metadata and the nested example project.
   - Replace placeholders so the live module/binary/release config targets `github.com/go-go-golems/css-visual-diff` and `css-visual-diff`.

3. **Import and rename `sbcap`**
   - Copy `cmd/sbcap` and `internal/sbcap` into the new repo using `cp`.
   - Rename command paths, import paths, package directories, and user-facing strings from `sbcap` to `css-visual-diff`.
   - Keep behavior close to upstream `sbcap` first; cleanup and simplification come after the import compiles.

## Design Decisions

- **Preserve the Python prototype under `legacy/` instead of deleting it.**
  This keeps the repo honest about its origin and avoids irreversible cleanup while we reset the live project.

- **Copy first, clean later.**
  Both the template and `sbcap` should come in with `cp` so we avoid partial hand-transcription and can reason about the imported baseline mechanically.

- **Prefer `sbcap` as the product seed, not just inspiration.**
  HAIR-017 already established that `sbcap` is the right technical spine. Rewriting would add risk without adding product value.

- **Normalize repo shape immediately.**
  The end state should have a normal Go module, standard workflows, a conventional `cmd/css-visual-diff`, and updated repo metadata.

## Alternatives Considered

- **Incrementally improve the Python prototype in place**
  Rejected because it keeps the wrong language/runtime baseline and drags old structure forward.

- **Rewrite the tool from scratch in Go**
  Rejected because `sbcap` already solves the hard browser/CSS comparison problems.

- **Start from `sbcap` only and skip the template**
  Rejected because the repo should also inherit the standard release/lint/CI shape used by other go-go-golems projects.

## Implementation Plan

1. Inventory the current repo and move live prototype files into `legacy/python-prototype/`.
2. Copy template files into the root and replace placeholders.
3. Copy `sbcap` code into the new repo.
4. Rename module/import/binary paths to `css-visual-diff`.
5. Remove leftover placeholder/template pieces and update README/docs.
6. Run `go mod tidy`, `go test ./...`, and `go build ./cmd/css-visual-diff`.
7. Commit at logical milestones and update diary/changelog after each major phase.

## Open Questions

- Whether the internal package path should stay broad (`internal/cssvisualdiff`) or be further split now. Current plan: rename minimally first, refactor later.
- Whether any Python-side assets deserve promotion out of `legacy/`. Current plan: no; preserve only.

## References

- HAIR-017 analysis doc: `ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/design-doc/01-sbcap-analysis-architecture-and-standalone-screen-diff-extraction-guide.md`
- Current repo: `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff`
- Template source: `/home/manuel/code/wesen/corporate-headquarters/go-template`
- `sbcap` source: `/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking`
