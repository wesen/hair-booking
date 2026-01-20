---
Title: Invalid context error in sbcap chromedp run
Ticket: MO-018-SBCAP-INVALID-CONTEXT
Status: active
Topics:
    - sbcap
    - chromedp
    - bug
DocType: analysis
Intent: long-term
Owners: []
RelatedFiles:
    - Path: cmd/sbcap/main.go
      Note: |-
        CLI config flag and mode selection
        Config flag handling affects CLI run
        chromedp-probe CLI command to isolate browser issues
    - Path: internal/sbcap/driver/chrome.go
      Note: |-
        chromedp browser/page context creation
        Chromedp context creation
    - Path: internal/sbcap/modes/capture.go
      Note: |-
        capture mode (screenshots)
        Screenshot mode
    - Path: internal/sbcap/modes/cssdiff.go
      Note: |-
        cssdiff mode (baseline for comparison)
        Computed style evaluation
    - Path: internal/sbcap/modes/matched_styles.go
      Note: |-
        matched-styles mode that triggers chromedp calls
        Chromedp CSS calls
    - Path: internal/sbcap/runner/runner.go
      Note: |-
        mode dispatch and execution order
        Mode dispatch
    - Path: ttmp/2026/01/19/MO-016-SBCAP-IMPLEMENTATION--sbcap-implementation-plan/playbook/01-sbcap-validation-playbook.md
      Note: |-
        validation steps used during reproduction
        Validation steps used for reproduction
ExternalSources: []
Summary: 'Investigate sbcap CLI runs that fail with "Error: invalid context" during chromedp execution despite successful build/tests.'
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Provide a full bug report and investigation guide for the intern, including reproduction steps, hypotheses, and internet research targets.
WhenToUse: Use when debugging sbcap end-to-end runs that error with chromedp invalid context.
---



# Invalid context error in sbcap chromedp run

## Executive Summary

When running sbcap with `capture,cssdiff,matched-styles`, the CLI fails with `Error: invalid context`. The error occurs after fixing the `--config` flag to accept a path string, which resolved a prior `file name too long` error caused by passing config file contents to `config.Load`.

The goal of this report is to give a clear reproduction recipe and a structured investigation path (including internet research tasks) for diagnosing the chromedp context failure.

## Environment

- Repo: `/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking`
- Go: `go 1.25.5` (from `go.mod`)
- chromedp: `github.com/chromedp/chromedp v0.14.2`
- cdproto: `github.com/chromedp/cdproto v0.0.0-20250803210736-d308e07a266d`
- Storybook: `storybook v10.1.11` (via `npm run storybook` in `ui/`)

## Reproduction Steps (as run)

1. Build and test sbcap:
   ```bash
   cd /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking
   go test ./...
   go build -o /tmp/sbcap ./cmd/sbcap
   ```

2. Start Storybook (port 6006 was busy; Storybook chose 6007):
   ```bash
   cd /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/ui
   npm run storybook
   ```
   Expected: `http://localhost:6007/`

3. Start HTML template server:
   ```bash
   cd /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/assets/Hairy
   python3 -m http.server 8080
   ```
   Expected: `http://localhost:8080/page-about-us.html`

4. Create sbcap config at `/tmp/sbcap.yaml` (see “Config Used”).

5. Run sbcap:
   ```bash
   /tmp/sbcap run --config /tmp/sbcap.yaml --modes capture,cssdiff,matched-styles
   ```

### Actual Result

- Command fails with: `Error: invalid context`

### Expected Result

- Outputs written to `/tmp/sbcap-output`:
  - `capture.json`, `cssdiff.json`, `matched-styles.json` (and Markdown + PNGs)

## Prior Failure (fixed)

Before the CLI flag change, using `--config /tmp/sbcap.yaml` resulted in:

```
Error: open metadata:
  slug: about-us-visual-audit
  title: "About Us Visual Audit"
  ...
: file name too long
```

Root cause: `--config` was declared as `fields.TypeFile`, which passes file contents to `RunSettings.Config` (string). `config.Load` treated the contents as a file path. This was fixed by switching to `fields.TypeString` for `config` in `cmd/sbcap/main.go` (commit `4c5cebc`).

## Latest Findings (2026-01-19)

The new `chromedp-probe` CLI command successfully navigates to both the HTML template and the Storybook iframe, suggesting chromedp itself can start and evaluate pages in this environment.

Probe commands (all returned `chromedp ok`):

```bash
/tmp/sbcap chromedp-probe --url http://localhost:8080/page-about-us.html --wait-ms 1000 --selector "#page-title"
/tmp/sbcap chromedp-probe --url "http://localhost:6007/iframe.html?id=pages-aboutuspage--full-page&viewMode=story" --wait-ms 3000 --selector "#page-title"
/tmp/sbcap chromedp-probe --url "http://localhost:6007/iframe.html?id=pages-aboutuspage--full-page&viewMode=story" --wait-ms 3000 --selector "#page-title, .page-title"
```

Full sbcap run still fails:

```bash
/tmp/sbcap run --config /tmp/sbcap.yaml --modes capture,cssdiff,matched-styles
# Error: invalid context
```

Implication: the `invalid context` error is likely inside sbcap’s multi-page lifecycle or specific mode logic (capture/cssdiff/matched-styles), not basic chromedp startup.

## Failure Location (2026-01-19)

With additional logging, the failure occurs on the first call to `css.GetMatchedStylesForNode` inside matched-styles evaluation. The selector lookup succeeds, but the CDP call fails:

```
sbcap matched-styles: query node IDs
sbcap matched-styles: get matched styles
sbcap matched-styles: get matched styles failed (error=invalid context)
```

This suggests the issue is specifically tied to `CSS.getMatchedStylesForNode` on the original page, not node selection or navigation.

## Resolution (2026-01-19)

Root cause: `CSS.getMatchedStylesForNode` and `CSS.getComputedStyleForNode` were called directly via `.Do(ctx)` without wrapping in `chromedp.Run`. Although the context had already been used for other actions, the CDP call returned `invalid context` in this flow. Wrapping the calls in `chromedp.Run` with `chromedp.ActionFunc` resolves the issue and preserves the proper executor on the context.

After this change:
- `matched-styles` mode completes successfully.
- Full run `capture,cssdiff,matched-styles` completes successfully.

Patch location:
- `internal/sbcap/modes/matched_styles.go` (wrap `GetMatchedStylesForNode` and `GetComputedStyleForNode` inside `chromedp.Run`)

## Config Used

```yaml
metadata:
  slug: about-us-visual-audit
  title: "About Us Visual Audit"
  description: "Storybook vs original HTML capture"
  goal: "Identify missing sections and CSS drift"
  expected_result:
    format: [json, markdown, png]
    description: "Capture + cssdiff + matched-styles outputs"
  potential_questions:
    - "Is the play button visible?"
  related_files:
    - path: ui/scripts/compare-about-us.ts
      reason: "Baseline audit script"
original:
  name: original
  url: http://localhost:8080/page-about-us.html
  wait_ms: 2000
  viewport: { width: 1280, height: 720 }
react:
  name: react
  url: http://localhost:6007/iframe.html?id=pages-aboutuspage--full-page&viewMode=story
  wait_ms: 3000
  viewport: { width: 1280, height: 720 }
sections:
  - name: page-title
    selector: "#page-title, .page-title"
    ocr_question: "Is the title visible and centered?"
  - name: video
    selector: "#video2, .video"
styles:
  - name: page-title
    selector: "#page-title, .page-title"
    props: [position, marginTop, height, zIndex]
    include_bounds: true
    attributes: [id, class]
    report: [matched_styles, computed_styles, box_model]
output:
  dir: /tmp/sbcap-output
  write_json: true
  write_markdown: true
  write_pngs: true
```

## Suspected Areas / Hypotheses

1. **chromedp context cancellation**
   - `driver.NewBrowser` creates a parent alloc + browser context. If the parent context is canceled or times out unexpectedly, child pages can produce `invalid context` errors.

2. **headless chrome startup or socket issues**
   - The error could indicate that the underlying Chrome connection died or failed to initialize after the context was created.

3. **race or lifecycle issues when opening multiple pages**
   - sbcap opens two pages (original + react) and runs multiple CDP calls. If a page context is canceled or browser closed early, chromedp reports invalid context.

4. **Chrome/Chromedp version mismatch**
   - `chromedp v0.14.2` + `cdproto` snapshot may be sensitive to Chrome version on the machine.

5. **Headless Chrome binary resolution**
   - If chromedp fails to find or start a browser, it may return context errors.

## Investigation Plan (for intern)

### Re-run and isolate

- Re-run the sbcap command with `--modes capture` only.
- Re-run with `--modes cssdiff` only.
- Re-run with `--modes matched-styles` only.

This should isolate which mode triggers the error.

### Add logging around chromedp

- Add logs before/after:
  - `driver.NewBrowser`
  - `browser.NewPage()`
  - `page.Goto`
  - `css.GetMatchedStylesForNode`
  - `css.GetComputedStyleForNode`
- Capture the first failing call and whether the page context is already canceled.

### Minimal chromedp repro

Write a tiny repro (outside sbcap) that:
1. Creates a chromedp context
2. Navigates to a local URL
3. Executes a simple JS evaluation

If this fails, the environment or Chrome binary is the root issue.

### Verify Chrome binary

- Check whether chromedp can find Chrome/Chromium.
- If needed, use `chromedp.ExecPath(...)` with a known binary and retry.

### Compare browser contexts

- Ensure the sbcap parent context (`ctx`) is not canceled or with deadline.
- Ensure the `browser.Close()` call is deferred until after all pages finish.

## Internet Research Targets (explicit)

Have the intern search for:

- “chromedp invalid context error”
- “chromedp invalid context Navigate”
- “chromedp invalid context cdproto”
- “chromedp headless invalid context”

Collect relevant issues, especially around:
- Chrome version mismatches
- context cancellation patterns
- chromedp allocator misconfig

## Expected Deliverables

- Root cause analysis with exact failing call and reason
- Minimal reproduction (if possible)
- Fix or mitigation proposal
- Updated validation steps confirming a clean sbcap run

## Related Commits

- `4c5cebc` — “fix(sbcap): treat --config as path”
