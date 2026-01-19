---
Title: Diary
Ticket: MO-017-CASCADE-LOGIC
Status: active
Topics: []
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: internal/sbcap/modes/matched_styles.go
      Note: |-
        Reviewed current winner selection logic and gaps
        Implemented cascade candidate model and winner selection (commit d49d6d8)
    - Path: internal/sbcap/modes/matched_styles_test.go
      Note: Added specificity and winner tests (commit d49d6d8)
ExternalSources: []
Summary: ""
LastUpdated: 2026-01-19T17:28:41.959388275-05:00
WhatFor: ""
WhenToUse: ""
---



# Diary

## Goal

Track the implementation of proper CSS cascade winner logic for sbcap matched-styles, plus docs/tests updates and validation notes.

## Step 1: Review current winner logic and gaps

I reviewed the existing matched-styles implementation to understand how winners are selected today and where it diverges from DevTools. The current `findWinner` logic only checks `!important` and otherwise takes the last seen declaration, which ignores specificity, origin, and inline styles.

This step establishes the concrete gap we need to close before implementing the cascade ranking: origin priority, selector specificity, and source order across stylesheets all matter for accurate winners.

### What I did
- Read `internal/sbcap/modes/matched_styles.go` to trace `evaluateMatched`, `buildWinnerDiffs`, and `findWinner`.
- Documented that current logic ignores origin, specificity, and inline styles.

### Why
- Establish a baseline understanding before replacing the winner logic.

### What worked
- Identified the exact function and flow where the winner logic needs to be replaced.

### What didn't work
- N/A (no failures yet).

### What I learned
- The existing winner selection is strictly `!important` + "last seen", which can misreport DevTools winners.

### What was tricky to build
- N/A (review-only).

### What warrants a second pair of eyes
- N/A (no code changes).

### What should be done in the future
- N/A.

### Code review instructions
- N/A (no code changes).

### Technical details
- Current `findWinner` only compares `!important` and uses last-in-order within matched rules.

## Step 2: Implement cascade candidates, specificity, and winner selection

I replaced the matched-styles winner logic with a real cascade evaluation that incorporates importance, origin, specificity, and source order. The implementation also captures inline styles as a distinct origin, uses CDP selector specificity when available, and falls back to a local specificity calculator when needed.

This step upgrades the matched-styles output to include origin and specificity context in the winner summary and adds table-driven tests for specificity and winner selection behavior.

**Commit (code):** d49d6d8 — "feat(sbcap): implement cascade winner logic"

### What I did
- Added cascade-specific data types (specificity, origin, candidates) and a comparator for winners.
- Integrated inline style declarations as cascade candidates.
- Updated the Markdown report to show origin and specificity context.
- Added table-driven tests for specificity calculation and winner selection.

### Why
- Align matched-styles winners with DevTools behavior for accurate debugging output.

### What worked
- Candidate ranking now respects `!important`, origin, specificity, and source order.
- Tests exercise the core specificity and winner-selection rules.

### What didn't work
- N/A (no failures during implementation).

### What I learned
- CDP provides per-selector specificity, which is a good primary source with a local fallback for safety.

### What was tricky to build
- Balancing a lightweight specificity parser with CDP-derived specificity while keeping behavior predictable.

### What warrants a second pair of eyes
- Specificity fallback correctness for complex selectors and pseudo-classes.
- Origin ordering assumptions for non-regular stylesheets (injected/inspector).

### What should be done in the future
- N/A.

### Code review instructions
- Start in `internal/sbcap/modes/matched_styles.go` and follow the candidate collection and `candidateBeats` logic.
- Validate with `go test ./internal/sbcap/modes -run Test`.

### Technical details
- Candidate order uses the CDP matched-rule order plus property index as the final tie-breaker.
- Inline styles are treated as `OriginInline` with a high precedence in origin ranking.
