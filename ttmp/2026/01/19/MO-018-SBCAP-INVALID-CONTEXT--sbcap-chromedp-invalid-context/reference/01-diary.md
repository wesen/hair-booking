---
Title: Diary
Ticket: MO-018-SBCAP-INVALID-CONTEXT
Status: active
Topics:
    - sbcap
    - chromedp
    - bug
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: internal/sbcap/driver/chrome.go
      Note: Lifecycle logging for chromedp (commit 4104963)
    - Path: internal/sbcap/modes/matched_styles.go
      Note: Matched-styles CDP logs to pinpoint failure
    - Path: ttmp/2026/01/19/MO-018-SBCAP-INVALID-CONTEXT--sbcap-chromedp-invalid-context/analysis/01-invalid-context-error-in-sbcap-chromedp-run.md
      Note: Bug report analysis updated with failure location
ExternalSources: []
Summary: ""
LastUpdated: 2026-01-19T20:35:14.921314145-05:00
WhatFor: ""
WhenToUse: ""
---


# Diary

## Goal

Track investigation work for the sbcap "invalid context" error, including logging instrumentation, mode isolation, and validation steps.

## Step 1: Add logging and isolate the failing mode

I added structured logging around chromedp lifecycle operations and matched-styles CDP calls, then reran the validation flow to isolate which mode fails. The logs show capture and cssdiff complete successfully, while matched-styles fails on `CSS.getMatchedStylesForNode` right after a successful selector lookup.

This step narrows the failure to a specific CDP call in matched-styles, giving the next investigator a concrete target to debug.

**Commit (code):** 4104963 — "chore(sbcap): add chromedp lifecycle logging"

### What I did
- Added zerolog-based lifecycle logs in `internal/sbcap/driver/chrome.go` for browser/page creation, navigation, waits, and evaluate/screenshot calls.
- Added matched-styles logs in `internal/sbcap/modes/matched_styles.go` around node lookup and `GetMatchedStylesForNode`.
- Ran sbcap modes individually (`capture`, `cssdiff`, `matched-styles`) using the playbook config.

### Why
- We needed precise visibility into where chromedp fails to isolate the failure to a single call and mode.

### What worked
- `capture` mode completed successfully.
- `cssdiff` mode completed successfully.
- Logging shows node lookup works in matched-styles before the failure.

### What didn't work
- `/tmp/sbcap run --config /tmp/sbcap.yaml --modes matched-styles` failed with:
  - `Error: invalid context`
  - Logged at: `sbcap matched-styles: get matched styles failed (error=invalid context)`

### What I learned
- The failure is localized to `CSS.getMatchedStylesForNode` within matched-styles; chromedp startup/navigation/selector lookup are not the problem.

### What was tricky to build
- Keeping logs informative without overwhelming output; focused on lifecycle + matched-styles CDP calls only.

### What warrants a second pair of eyes
- Investigate why `CSS.getMatchedStylesForNode` returns `invalid context` after a successful selector lookup.

### What should be done in the future
- Continue investigation with Chrome/chromedp version checks and ExecPath overrides.

### Code review instructions
- Start in `internal/sbcap/driver/chrome.go` for lifecycle logging additions.
- Review `internal/sbcap/modes/matched_styles.go` for the new CDP call logs.
- Re-run: `go build -o /tmp/sbcap ./cmd/sbcap` and test `capture`, `cssdiff`, `matched-styles` modes separately.

### Technical details
- `capture` and `cssdiff` succeeded; `matched-styles` fails after `CSS.getMatchedStylesForNode` on the original page.
- Storybook ran on port 6007 (6006 busy), template server on 8080.
