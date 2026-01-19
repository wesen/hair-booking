---
Title: sbcap Validation Playbook
Ticket: MO-016-SBCAP-IMPLEMENTATION
Status: active
Topics:
    - sbcap
    - validation
    - storybook
    - playwright
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: cmd/sbcap/main.go
      Note: CLI invocation and output rows
    - Path: internal/sbcap/modes/ai_review.go
      Note: AI review outputs referenced in playbook
    - Path: internal/sbcap/modes/capture.go
      Note: Capture outputs referenced in playbook
    - Path: internal/sbcap/modes/cssdiff.go
      Note: CSS diff outputs referenced in playbook
    - Path: internal/sbcap/modes/matched_styles.go
      Note: Matched-styles outputs referenced in playbook
    - Path: internal/sbcap/modes/stories.go
      Note: Story discovery outputs referenced in playbook
ExternalSources: []
Summary: Step-by-step validation plan for sbcap capture, cssdiff, matched-styles, AI review, and story discovery.
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Verify sbcap outputs, reports, and CLI behavior end-to-end.
WhenToUse: Run after changes to sbcap modes or config schema.
---


# sbcap Validation Playbook

## Purpose

Validate sbcap end-to-end on a real Storybook + HTML template setup, ensuring screenshots, cssdiff, matched-styles, AI review scaffolding, and story discovery all behave as expected.

## Environment Assumptions

- Go 1.25+ installed
- Node.js + npm installed (for Storybook)
- Python 3 available (for static HTML server)
- Storybook configured under `ui/`
- Original HTML template under `assets/Hairy/`
- `sbcap` binary built from `cmd/sbcap`
- `sbcap.yaml` config prepared (see spec in MO-015)

## Commands

### Step 1: Build sbcap

```bash
cd /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking

go test ./...

go build -o /tmp/sbcap ./cmd/sbcap
```

Expected:
- `go test` passes
- `/tmp/sbcap` created

### Step 2: Start Storybook

```bash
cd /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/ui

npm run storybook
```

Expected:
- Storybook running at `http://localhost:6006/`

### Step 3: Start HTML template server

```bash
cd /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/assets/Hairy

python3 -m http.server 8080
```

Expected:
- Template available at `http://localhost:8080/page-about-us.html`

### Step 4: Prepare sbcap config

Create `sbcap.yaml` in a temp location:

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
  url: http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story
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

### Step 5: Run sbcap capture + cssdiff + matched-styles

```bash
/tmp/sbcap run --config /tmp/sbcap.yaml --modes capture,cssdiff,matched-styles
```

Expected outputs in `/tmp/sbcap-output`:
- `original-full.png`, `react-full.png`
- `original-page-title.png`, `react-page-title.png`
- `capture.json`, `capture.md`
- `cssdiff.json`, `cssdiff.md`
- `matched-styles.json`, `matched-styles.md`

### Step 6: Run story discovery

```bash
/tmp/sbcap run --config /tmp/sbcap.yaml --modes story-discovery --output json
```

Expected:
- `stories.json` and `stories.md`
- CLI output rows listing story IDs

### Step 7: Run AI review (stub)

```bash
/tmp/sbcap run --config /tmp/sbcap.yaml --modes ai-review
```

Expected:
- `ai-review.json` and `ai-review.md` present
- Answers contain error "ai client not configured" (expected until real AI client is wired)

## Exit Criteria

All of the following must be true:

- sbcap builds and `go test ./...` passes.
- Capture mode writes PNGs and `capture.json` with coverage summary.
- cssdiff mode writes `cssdiff.json` and `cssdiff.md` with non-empty diffs.
- matched-styles mode writes `matched-styles.json` and `matched-styles.md`.
- story discovery produces a non-empty list of stories.
- ai-review outputs exist and show explicit errors from the noop client.

## Failure Modes and Remedies

- **Missing PNGs**: Verify Storybook/HTML servers are running and URLs are correct.
- **cssdiff empty**: Check selectors and ensure target nodes exist.
- **matched-styles empty**: Confirm CDP access and page selectors.
- **story discovery fails**: Ensure Storybook serves `/index.json`.
- **ai-review empty**: Ensure `capture.json` exists and `ocr_question` is set.
