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
      Note: Reviewed current winner selection logic and gaps
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
