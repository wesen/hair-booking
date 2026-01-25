---
Title: Diary
Ticket: MO-018-CSS-VISUAL-DIFF
Status: active
Topics:
    - go
    - frontend
    - porting
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: css-visual-diff/README.md
      Note: freelancer tool summary and claimed feature set
    - Path: css-visual-diff/test1_navigation/summary.json
      Note: example output bundle exhibiting diff-stats anomaly
    - Path: hair-booking/ttmp/2026/01/24/MO-018-CSS-VISUAL-DIFF--css-visual-diff-sbcap-vs-css-visual-diff/design-doc/01-sbcap-vs-css-visual-diff-comparative-report.md
      Note: the main comparative report this diary supports
ExternalSources: []
Summary: Research diary for comparing sbcap and css-visual-diff, creating MO-018-CSS-VISUAL-DIFF, authoring the comparative report, and uploading the report bundle to reMarkable.
LastUpdated: 2026-01-24T19:12:41.725112506-05:00
WhatFor: Maintain an inspector-grade narrative of what was read, what was verified, what was discovered (including defects), and how the MO-018 report was produced and validated.
WhenToUse: Update whenever new evidence is gathered about sbcap/css-visual-diff, when the comparative report changes, or when uploads/artifact locations change.
---


# Diary

## Goal

Record the investigation and documentation work performed for `MO-018-CSS-VISUAL-DIFF`, including: what was read in docmgr, what was found in code, what defects were detected, and what artifacts were produced (report + uploads).

## Step 1: Collect docmgr evidence and summarize sbcap status

I gathered the authoritative “design intent + implementation history” for sbcap by reading docmgr tickets `MO-015`, `MO-016`, `MO-017`, and the related bug ticket `MO-018-SBCAP-INVALID-CONTEXT`. This established what sbcap claims to implement and what has been validated end-to-end.

This step is deliberately evidence-first: before comparing tools, confirm sbcap’s implemented modes, known failures, and the status of cascade winner logic and chromedp runtime stability.

### Prompt Context

**User prompt (verbatim):** "We have started a \"sbcap\" tool to take screenshots and compare CSS and all that. See docmgr tickets MO-015-STORYBOOK-TOOL and MO-016-SBCAP-IMPLEMENTATION and MO-017-CASCADE-LOGIC . Read the diaries and tell me the status of the current implementation. 

We also asked a freelancer to build a similar tool in css-visual-diff. Read that implementation. 

Create a new ticket MO-018-CSS-VISUAL-DIFF

Then, write a detailed report that compares the two tools, their current status, their features, how css-visual-diff features could benefit sbcap, how it works, what other way round css-visual-diff could take waway from sbcap. Also, what the best development cycle would be to ensure a great feedback quality cycle with good examples to exercise the tool. 

Store the report in the ticket, it should be detailed and exhaustive, with pseudocode, prose paragraphs, bullet point lists, file names, symbols, diagrams, etc... Like a textbook by peter norvig but written by an acribic inspector (think osha inspector level of detailed and dogged). 

Keep a detailed research diary as you go. 

Finally, upload to remarkable"

**Assistant interpretation:** Read sbcap design/diary docs and assess implementation status; review the separate css-visual-diff implementation; create a new docmgr ticket; write an exhaustive comparative report in that ticket; keep a research diary; upload the report to reMarkable.

**Inferred user intent:** Decide how to proceed with sbcap versus the freelancer prototype, and establish a disciplined development + validation cycle that yields high-quality diffs and actionable debugging evidence.

### What I did
- Listed existing tickets and found the relevant documents and diaries.
- Read (at minimum) these docs:
  - `hair-booking/ttmp/2026/01/19/MO-016-SBCAP-IMPLEMENTATION--sbcap-implementation-plan/reference/01-diary.md`
  - `hair-booking/ttmp/2026/01/19/MO-017-CASCADE-LOGIC--cascade-logic-winner-resolution/reference/01-diary.md`
  - `hair-booking/ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/01-storybook-screenshot-and-css-capture-tool-analysis.md`
  - `hair-booking/ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md`
  - `hair-booking/ttmp/2026/01/19/MO-018-SBCAP-INVALID-CONTEXT--sbcap-chromedp-invalid-context/analysis/01-invalid-context-error-in-sbcap-chromedp-run.md`
  - `hair-booking/ttmp/2026/01/19/MO-018-SBCAP-INVALID-CONTEXT--sbcap-chromedp-invalid-context/reference/01-diary.md`
- Used docmgr to inspect task completion state for `MO-016` and `MO-017`.

### Why
- “Status of current implementation” should be based on explicit diaries plus code inventory, not assumptions.

### What worked
- `MO-016` provides a complete mode-by-mode implementation diary (capture/cssdiff/matched-styles/ai-review/story discovery).
- `MO-017` documents cascade logic and includes tests.
- `MO-018-SBCAP-INVALID-CONTEXT` documents the chromedp failure and records the fix.

### What didn't work
- `MO-015` task list is still a placeholder (“Add tasks here”), so progress isn’t tracked via tasks there.

### What I learned
- sbcap is functionally complete for capture/cssdiff/matched-styles/story-discovery, but AI is a stub.
- The chromedp `invalid context` failure is fixed by wrapping CDP calls within `chromedp.Run`.

### What was tricky to build
- N/A (research step).

### What warrants a second pair of eyes
- Whether the chromedp lifecycle logging should be kept always-on or gated behind `--log-level`.

### What should be done in the future
- N/A.

### Code review instructions
- Start with the report doc: `hair-booking/ttmp/2026/01/24/MO-018-CSS-VISUAL-DIFF--css-visual-diff-sbcap-vs-css-visual-diff/design-doc/01-sbcap-vs-css-visual-diff-comparative-report.md`.

### Technical details
- Key docmgr commands run:
  - `docmgr ticket list`
  - `docmgr doc list --ticket MO-016-SBCAP-IMPLEMENTATION`
  - `docmgr doc list --ticket MO-017-CASCADE-LOGIC`
  - `docmgr task list --ticket MO-016-SBCAP-IMPLEMENTATION`
  - `docmgr task list --ticket MO-017-CASCADE-LOGIC`

## Step 2: Review sbcap code inventory (confirm implementation matches diaries)

I validated the sbcap status claims by reading the code paths referenced by the diaries: CLI entrypoint, config schema, chromedp driver, and each mode implementation. This confirms “what exists” at the code level and identifies immediate gaps vs. css-visual-diff.

This bridges the documentation drift risk: the comparative report should reflect code reality, not only intended design.

### Prompt Context

**User prompt (verbatim):** "We have started a \"sbcap\" tool to take screenshots and compare CSS and all that. See docmgr tickets MO-015-STORYBOOK-TOOL and MO-016-SBCAP-IMPLEMENTATION and MO-017-CASCADE-LOGIC . Read the diaries and tell me the status of the current implementation. 

We also asked a freelancer to build a similar tool in css-visual-diff. Read that implementation. 

Create a new ticket MO-018-CSS-VISUAL-DIFF

Then, write a detailed report that compares the two tools, their current status, their features, how css-visual-diff features could benefit sbcap, how it works, what other way round css-visual-diff could take waway from sbcap. Also, what the best development cycle would be to ensure a great feedback quality cycle with good examples to exercise the tool. 

Store the report in the ticket, it should be detailed and exhaustive, with pseudocode, prose paragraphs, bullet point lists, file names, symbols, diagrams, etc... Like a textbook by peter norvig but written by an acribic inspector (think osha inspector level of detailed and dogged). 

Keep a detailed research diary as you go. 

Finally, upload to remarkable"

**Assistant interpretation:** Confirm sbcap implementation status by inspecting the referenced code and identifying what is implemented vs stubbed.

**Inferred user intent:** Produce a report grounded in code reality and identify concrete “imports” between the two tools.

### What I did
- Read key sbcap code:
  - `hair-booking/cmd/sbcap/main.go`
  - `hair-booking/internal/sbcap/config/config.go`
  - `hair-booking/internal/sbcap/driver/chrome.go`
  - `hair-booking/internal/sbcap/runner/runner.go`
  - `hair-booking/internal/sbcap/modes/capture.go`
  - `hair-booking/internal/sbcap/modes/cssdiff.go`
  - `hair-booking/internal/sbcap/modes/matched_styles.go`
  - `hair-booking/internal/sbcap/modes/matched_styles_test.go`
  - `hair-booking/internal/sbcap/modes/ai_review.go`
  - `hair-booking/internal/sbcap/modes/stories.go`
  - `hair-booking/internal/sbcap/ai/client.go`

### Why
- Confirm sbcap status in terms of: CLI features, config schema, outputs per mode, cascade winner logic, AI client stub behavior.

### What worked
- sbcap provides structured outputs and a clear mode architecture.
- Winner logic includes specificity parsing and is unit tested.
- The invalid-context fix is visible in `matched_styles.go` as CDP calls wrapped in `chromedp.Run`.

### What didn't work
- The empty `hair-booking/internal/sbcap/report/` directory suggests planned but unimplemented shared reporting utilities (not blocking, but likely stale scaffolding).

### What I learned
- sbcap is missing pixel diffs and explicit selector mapping (per-target selectors).

### What was tricky to build
- N/A (research step).

### What warrants a second pair of eyes
- Whether sbcap’s URL validator intentionally rejects `file://` URLs; this affects fixture workflows.

### What should be done in the future
- N/A.

### Code review instructions
- Review `hair-booking/internal/sbcap/modes/matched_styles.go` for cascade winner logic and CDP call wrapping.

### Technical details
- This step was performed via targeted file reads (no code changes).

## Step 3: Review css-visual-diff implementation (freelancer tool)

I reviewed the css-visual-diff repository: CLI surface, Playwright capture logic, pixel diff generation, and OpenAI vision analysis. I also inspected the committed example outputs (test folders) and cross-checked whether the diff statistics matched the expected visual differences.

This establishes a precise feature and defect inventory so we can decide what to import into sbcap and what to treat as a prototype.

### Prompt Context

**User prompt (verbatim):** "We have started a \"sbcap\" tool to take screenshots and compare CSS and all that. See docmgr tickets MO-015-STORYBOOK-TOOL and MO-016-SBCAP-IMPLEMENTATION and MO-017-CASCADE-LOGIC . Read the diaries and tell me the status of the current implementation. 

We also asked a freelancer to build a similar tool in css-visual-diff. Read that implementation. 

Create a new ticket MO-018-CSS-VISUAL-DIFF

Then, write a detailed report that compares the two tools, their current status, their features, how css-visual-diff features could benefit sbcap, how it works, what other way round css-visual-diff could take waway from sbcap. Also, what the best development cycle would be to ensure a great feedback quality cycle with good examples to exercise the tool. 

Store the report in the ticket, it should be detailed and exhaustive, with pseudocode, prose paragraphs, bullet point lists, file names, symbols, diagrams, etc... Like a textbook by peter norvig but written by an acribic inspector (think osha inspector level of detailed and dogged). 

Keep a detailed research diary as you go. 

Finally, upload to remarkable"

**Assistant interpretation:** Understand the freelancer tool’s architecture, outputs, and correctness, and extract usable ideas for sbcap.

**Inferred user intent:** Decide whether css-visual-diff is a drop-in alternative, a prototype to mine for ideas, or a candidate for integration.

### What I did
- Read key css-visual-diff docs and source:
  - `css-visual-diff/README.md`
  - `css-visual-diff/PROJECT_SUMMARY.md`
  - `css-visual-diff/src/cli.py`
  - `css-visual-diff/src/browser_capture.py`
  - `css-visual-diff/src/image_diff.py`
  - `css-visual-diff/src/llm_analysis.py`
  - `css-visual-diff/tests/run_tests.sh`
  - `css-visual-diff/tests/page1.html`
  - `css-visual-diff/tests/page2.html`
- Inspected committed output bundles:
  - `css-visual-diff/test1_navigation/*`
  - `css-visual-diff/test3_pricing/*`

### Why
- css-visual-diff can contribute key features (pixel diffs, selector mapping, AI analysis) but must be checked for correctness and audit suitability.

### What worked
- The CLI and output bundle structure are straightforward.
- Playwright-based capture is a strong baseline for pixel-perfect rendering.

### What didn't work
- The committed diff stats in `summary.json` reported `changed_pixels: 0` for clearly different screenshots.

### What I learned
- The pixel diff computation uses a `uint8` NumPy array; squaring overflows and breaks the changed-pixel mask at typical thresholds.

### What was tricky to build
- N/A (research step), but this defect is easy to miss unless you sanity-check stats against known-different images.

### What warrants a second pair of eyes
- Confirm whether the freelancer intended the diff stats to be meaningful. If yes, the dtype overflow must be fixed before adoption.

### What should be done in the future
- N/A.

### Code review instructions
- Review `css-visual-diff/src/image_diff.py` focusing on dtype and thresholding.

### Technical details
- Local recomputation using `int16` yielded ~99.65% changed pixels for a test pair where the committed report claimed 0%.

## Step 4: Create MO-018-CSS-VISUAL-DIFF ticket and author comparative report

I created the requested docmgr ticket `MO-018-CSS-VISUAL-DIFF`, added a design-doc for the comparative report, and wrote the report with an “inspection-grade” level of detail. The report includes file paths, symbols, pseudocode, diagrams, and a development-cycle proposal based on fixtures.

This step delivers the durable artifact requested: a report that can be reviewed, edited, and referenced by future work.

### Prompt Context

**User prompt (verbatim):** "We have started a \"sbcap\" tool to take screenshots and compare CSS and all that. See docmgr tickets MO-015-STORYBOOK-TOOL and MO-016-SBCAP-IMPLEMENTATION and MO-017-CASCADE-LOGIC . Read the diaries and tell me the status of the current implementation. 

We also asked a freelancer to build a similar tool in css-visual-diff. Read that implementation. 

Create a new ticket MO-018-CSS-VISUAL-DIFF

Then, write a detailed report that compares the two tools, their current status, their features, how css-visual-diff features could benefit sbcap, how it works, what other way round css-visual-diff could take waway from sbcap. Also, what the best development cycle would be to ensure a great feedback quality cycle with good examples to exercise the tool. 

Store the report in the ticket, it should be detailed and exhaustive, with pseudocode, prose paragraphs, bullet point lists, file names, symbols, diagrams, etc... Like a textbook by peter norvig but written by an acribic inspector (think osha inspector level of detailed and dogged). 

Keep a detailed research diary as you go. 

Finally, upload to remarkable"

**Assistant interpretation:** Produce the requested ticket workspace and store an exhaustive report there.

**Inferred user intent:** Preserve decision-grade documentation in docmgr, not as transient chat output.

### What I did
- Created ticket:
  - `docmgr ticket create-ticket --ticket MO-018-CSS-VISUAL-DIFF --title "CSS Visual Diff (sbcap vs css-visual-diff)" --topics go,frontend,porting`
- Added documents:
  - `docmgr doc add --ticket MO-018-CSS-VISUAL-DIFF --doc-type design-doc --title "sbcap vs css-visual-diff: comparative report"`
  - `docmgr doc add --ticket MO-018-CSS-VISUAL-DIFF --doc-type reference --title "Diary"`
- Wrote the report:
  - `hair-booking/ttmp/2026/01/24/MO-018-CSS-VISUAL-DIFF--css-visual-diff-sbcap-vs-css-visual-diff/design-doc/01-sbcap-vs-css-visual-diff-comparative-report.md`

### Why
- The report is required to decide how to evolve sbcap and how to treat the freelancer tool.

### What worked
- docmgr created the ticket workspace and docs cleanly.
- The report was written in a “code inventory + risk + plan” structure.

### What didn't work
- N/A.

### What I learned
- N/A (documentation step).

### What was tricky to build
- Balancing exhaustiveness with readability; addressed by layering (summary → deep technical checklist → plan).

### What warrants a second pair of eyes
- Whether the proposed fixture taxonomy matches the highest-value diffs for the actual porting workflow.

### What should be done in the future
- N/A.

### Code review instructions
- Review the report doc first, then spot-check its claims by opening the referenced code files and css-visual-diff modules.

### Technical details
- The report includes pseudocode for a future `pixeldiff` sbcap mode and documents the css-visual-diff dtype overflow defect.

## Step 5: Relate files and upload the report bundle to reMarkable

I linked the most relevant code and evidence files to the report and diary documents using `docmgr doc relate`, then bundled the report + diary into a single PDF and uploaded it to reMarkable via `remarquee`. This ensures the report remains navigable inside docmgr and consumable in a reading workflow.

This step turns the report from “text in git” into “reviewable artifact in the usual reading device”, and provides traceability links for future maintenance.

### Prompt Context

**User prompt (verbatim):** "We have started a \"sbcap\" tool to take screenshots and compare CSS and all that. See docmgr tickets MO-015-STORYBOOK-TOOL and MO-016-SBCAP-IMPLEMENTATION and MO-017-CASCADE-LOGIC . Read the diaries and tell me the status of the current implementation. 

We also asked a freelancer to build a similar tool in css-visual-diff. Read that implementation. 

Create a new ticket MO-018-CSS-VISUAL-DIFF

Then, write a detailed report that compares the two tools, their current status, their features, how css-visual-diff features could benefit sbcap, how it works, what other way round css-visual-diff could take waway from sbcap. Also, what the best development cycle would be to ensure a great feedback quality cycle with good examples to exercise the tool. 

Store the report in the ticket, it should be detailed and exhaustive, with pseudocode, prose paragraphs, bullet point lists, file names, symbols, diagrams, etc... Like a textbook by peter norvig but written by an acribic inspector (think osha inspector level of detailed and dogged). 

Keep a detailed research diary as you go. 

Finally, upload to remarkable"

**Assistant interpretation:** Ensure the report and diary are properly linked in docmgr and available on reMarkable.

**Inferred user intent:** Make the report easy to navigate later and easy to read away from the repo.

### What I did
- Related key files to the report and diary docs with `docmgr doc relate` (using absolute paths).
- Updated the ticket changelog with a summary of what was produced.
- Ran `go test ./...` in `hair-booking/` to ensure the repo still builds/tests after doc changes.
- Uploaded a bundled PDF (report + diary, with ToC) to reMarkable using `remarquee upload bundle`.

### Why
- Doc relationships provide traceability (report ↔ code ↔ evidence).
- reMarkable upload supports review and follow-up without needing the repo open.

### What worked
- `remarquee upload bundle` succeeded and produced a single PDF with ToC.

### What didn't work
- Initial `docmgr doc relate --doc 2026/...` failed because `--doc` expects a filesystem path (e.g., `hair-booking/ttmp/...`), not a docs-root-relative path.

### What I learned
- For `docmgr doc relate`, prefer passing the file path under the workspace (`hair-booking/ttmp/...`) to avoid “got 0 docs” lookup failures.

### What was tricky to build
- N/A (procedural step).

### What warrants a second pair of eyes
- N/A.

### What should be done in the future
- N/A.

### Code review instructions
- Confirm related files appear in the report doc frontmatter after the `docmgr doc relate` update.
- Confirm the reMarkable upload exists under `/ai/2026/01/25/MO-018-CSS-VISUAL-DIFF/`.

### Technical details
- Commands run:
  - `docmgr doc relate --doc hair-booking/ttmp/2026/01/24/MO-018-CSS-VISUAL-DIFF--css-visual-diff-sbcap-vs-css-visual-diff/design-doc/01-sbcap-vs-css-visual-diff-comparative-report.md ...`
  - `docmgr doc relate --doc hair-booking/ttmp/2026/01/24/MO-018-CSS-VISUAL-DIFF--css-visual-diff-sbcap-vs-css-visual-diff/reference/01-diary.md ...`
  - `docmgr changelog update --ticket MO-018-CSS-VISUAL-DIFF ...`
  - `go test ./...`
  - `remarquee upload bundle --dry-run ...`
  - `remarquee upload bundle ...`
  - `remarquee cloud ls /ai/2026/01/25/MO-018-CSS-VISUAL-DIFF --long --non-interactive`

## Step 6: Extend sbcap with an ergonomic `compare` command (no AI)

I implemented a simple, ergonomic one-shot command (`sbcap compare`) that compares a single element between two URLs and writes a complete “triage bundle” to disk: full-page screenshots, element screenshots, computed-style diffs, matched-style winner diffs, and pixel-diff overlays with stats. This deliberately excludes AI to keep the workflow fast, deterministic, and auditable.

This step creates a fast path for the exact workflow shape that css-visual-diff provides (two URLs + two selectors), but grounded in sbcap’s existing cascade reasoning and report conventions.

**Commit (code):** 79d5c32 — "feat(sbcap): add compare command"

### Prompt Context

**User prompt (verbatim):** "Create aplan to extend sbcap with a simple ergonomic command. leave the AI part out for now. Then create tasks for the implementation, and get to work. CHeck tasks off as you go. Commit to git. Continue keeping the diary"

**Assistant interpretation:** Add a new “easy mode” command to sbcap to run the core inspection loop without a YAML plan; do not implement AI; track work with docmgr tasks; commit to git; continue the ticket diary.

**Inferred user intent:** Make sbcap usable for quick, targeted comparisons (like css-visual-diff) while retaining sbcap’s stronger “why” layer (matched styles + cascade winners) and producing a stable evidence bundle.

### What I did
- Created `sbcap compare` as a Cobra subcommand in `cmd/sbcap/main.go`.
- Implemented the compare engine and output bundle in `internal/sbcap/modes/compare.go`:
  - navigates to both URLs (optionally waits),
  - takes full-page screenshots and element screenshots,
  - captures computed styles for a curated property list (configurable via `--props`),
  - captures matched styles via CDP and produces cascade winner diffs for the chosen props,
  - generates pixel-diff overlays and correct changed-pixel statistics (integer math, no overflow).
- Added a unit test to ensure the pixel diff math does not suffer from the `uint8` overflow defect seen in css-visual-diff (`internal/sbcap/modes/compare_test.go`).
- Ran `gofmt` and `go test ./...`.
- Created docmgr tasks for this work and checked them off as the steps completed.

### Why
- sbcap’s `run --config` is powerful but high-friction for quick comparisons; a `compare` command reduces the barrier for “one element, two URLs” debugging.
- Excluding AI keeps the workflow cheap and deterministic, while still improving feedback quality via:
  - pixel diffs (where to look),
  - computed diffs (what changed),
  - winner diffs (why it changed).

### What worked
- `go test ./...` passed after adding the command and test.
- Pixel diff computations use squared-distance integer math, avoiding the overflow defect pattern.

### What didn't work
- N/A.

### What I learned
- A small “ergonomic shell” on top of sbcap’s existing primitives provides most of css-visual-diff’s usability without adopting its weaker rule-extraction model.

### What was tricky to build
- Defining a pixel-diff computation that is correct without extra dependencies:
  - use `int` math on per-channel deltas and compare squared magnitudes to `threshold^2`.

### What warrants a second pair of eyes
- Command UX defaults (curated property list) and output naming conventions for long-term consistency.
- Whether `compare` should also generate a YAML plan file in the output directory for “promote to repeatable run” workflows.

### What should be done in the future
- N/A (AI deliberately excluded for now).

### Code review instructions
- Start at `cmd/sbcap/main.go` and locate `newCompareCommand`.
- Review `internal/sbcap/modes/compare.go` for:
  - artifact naming,
  - computed diffs and winner diffs,
  - pixel diff math (`computePixelDiff`).
- Validate with:
  - `go test ./...`
  - run an example:
    - `go run ./cmd/sbcap compare --url1 http://... --selector1 \"...\" --url2 http://... --selector2 \"...\"`

### Technical details
- The output bundle writes (by default) into `./sbcap-compare-YYYYMMDD_HHMMSS/`:
  - `url1_full.png`, `url2_full.png`
  - `url1_screenshot.png`, `url2_screenshot.png`
  - `diff_only.png`, `diff_comparison.png`
  - `compare.json`, `compare.md`

## Step 7: Add `pixeldiff` mode to `sbcap run` (batch over capture sections)

I extended the `sbcap run` mode pipeline with a new `pixeldiff` mode that consumes `capture.json` and generates per-section pixel-diff artifacts and statistics. This is the “batch version” of the pixel diff capability used by `sbcap compare`, and it is intentionally AI-free.

This step closes the biggest workflow gap: after running `capture` across many sections, we can immediately see which sections diverged most (and where) without manually opening pairs of PNGs.

**Commit (code):** 7914245 — "feat(sbcap): add pixeldiff mode"

### Prompt Context

**User prompt (verbatim):** "ok, continue."

**Assistant interpretation:** Implement the next recommended step: bring pixel-diff artifacts into the core `sbcap run` workflow (batch), keep it deterministic, and keep tracking via tasks/diary/commits.

**Inferred user intent:** Improve the feedback loop for many-section audits: get “where to look” immediately after capture, using sbcap’s existing output structure.

### What I did
- Added a `pixeldiff` mode to the runner and full-mode expansion:
  - `hair-booking/internal/sbcap/runner/runner.go`
- Added `sbcap run --pixeldiff-threshold` flag (default 30) so pixel-diff sensitivity is configurable:
  - `hair-booking/cmd/sbcap/main.go`
- Implemented `pixeldiff` mode:
  - reads `capture.json`,
  - for each section with screenshots on both sides:
    - pads images to the same size,
    - computes a correct per-pixel distance mask (integer math, no overflow),
    - writes `pixeldiff_<section>_diff_only.png` and `pixeldiff_<section>_diff_comparison.png`,
  - writes summary artifacts:
    - `pixeldiff.json`
    - `pixeldiff.md` (sorted by changed-percent, non-skipped first)
  - file: `hair-booking/internal/sbcap/modes/pixeldiff.go`
- Refactored shared pixel-diff helpers so both `compare` and `pixeldiff` use the same implementation:
  - `hair-booking/internal/sbcap/modes/pixeldiff_util.go`
  - updated: `hair-booking/internal/sbcap/modes/compare.go`
- Added an integration-style unit test for pixeldiff output generation:
  - `hair-booking/internal/sbcap/modes/pixeldiff_test.go`
- Ran `gofmt` and `go test ./...`.

### Why
- `capture` produces many section screenshots; humans need a “diff hotspot map” to know where to focus.
- Pixel diffs are the fastest first triage signal, and they complement sbcap’s “why” tools (`cssdiff`, `matched-styles`).

### What worked
- `go test ./...` passed after adding the new mode and tests.
- The pixeldiff test validates that changed pixels are detected even when deltas would overflow in a `uint8` squaring implementation.

### What didn't work
- N/A.

### What I learned
- Treat “threshold 0” carefully if we ever need it: the current runner option uses `0` as “unset” and defaults to 30, which makes “exactly 0” not expressible via flag. (Probably fine for now.)

### What was tricky to build
- Keeping the pixel-diff computation dependency-free but correct:
  - compute squared RGB distance in `int` and compare to `threshold^2`.

### What warrants a second pair of eyes
- Naming conventions for diff images (whether we want `pixeldiff_...` prefixes or a nested output folder).
- Whether pixeldiff should include full-page diffs as well as per-section diffs.

### What should be done in the future
- Consider adding a “diff bounding boxes” output (connected components) so the report can point to exact regions, not only a percent.

### Code review instructions
- Start at `hair-booking/internal/sbcap/modes/pixeldiff.go` and verify file naming + sort order.
- Review `hair-booking/internal/sbcap/modes/pixeldiff_util.go` for correctness and reuse by `compare`.
- Validate with:
  - `go test ./...`
  - `sbcap run --config <plan> --modes capture,pixeldiff --pixeldiff-threshold 30`

### Technical details
- `pixeldiff` depends on `capture` having been run first (it requires `capture.json`).

## Step 8: Add per-target selector mapping to sbcap YAML (no AI)

I added first-class per-target selector mapping to the sbcap YAML schema (`selector_original` / `selector_react`) for both `sections[]` and `styles[]`, and updated the relevant modes to use the per-target selector when provided. This eliminates a major source of friction and ambiguity: having to write “union selectors” that happen to match both DOMs (`#id, .class`) even when the port intentionally changes structure and class names.

This step stays AI-free and focuses on making the inspection pipeline more accurate and ergonomic by binding “what element do we mean” explicitly per target.

**Commit (code):** 8a84e9f — "feat(sbcap): support per-target selectors"

### Prompt Context

**User prompt (verbatim):** "continue"

**Assistant interpretation:** Implement the next ergonomic improvement: make sbcap plans express different selectors for original vs react, and ensure capture/cssdiff/matched-styles respect it.

**Inferred user intent:** Reduce config friction and eliminate union-selector ambiguity, so diffs and winner explanations refer to the intended element on each side.

### What I did
- Extended YAML schema:
  - `hair-booking/internal/sbcap/config/config.go`
    - `SectionSpec`: added `selector_original`, `selector_react`
    - `StyleSpec`: added `selector_original`, `selector_react`
    - Validation rules:
      - require either `selector` OR both `selector_original` and `selector_react`
- Updated capture mode to use per-target selectors when present:
  - `hair-booking/internal/sbcap/modes/capture.go`
  - The per-target selector used is recorded in each page’s `SectionResult.Selector` field.
- Updated cssdiff to use per-target selectors and include both selectors in outputs:
  - `hair-booking/internal/sbcap/modes/cssdiff.go`
  - Added `original_selector` and `react_selector` to the JSON output (additive fields).
- Updated matched-styles to use per-target selectors and include both selectors in outputs:
  - `hair-booking/internal/sbcap/modes/matched_styles.go`
  - Added `original_selector` and `react_selector` to the JSON output (additive fields).
- Added config validation tests:
  - `hair-booking/internal/sbcap/config/config_test.go`
- Ran `gofmt` and `go test ./...`.

### Why
- Union selectors (`#page-title, .page-title`) can match unintended elements and hide drift.
- Explicit selector mapping makes the audit evidence more trustworthy and lowers the config authoring burden.

### What worked
- Validation tests confirm per-target selectors are accepted and that omitting one side is rejected when `selector` is empty.
- All packages build/tests passed after the change.

### What didn't work
- N/A.

### What I learned
- Adding mapping is easiest as two explicit fields rather than a union-typed YAML value (string-or-object), which would complicate unmarshalling and validation.

### What was tricky to build
- Deciding output semantics: keep existing `selector` field (when provided) but also surface `original_selector`/`react_selector` so reports are explicit about which selector was used per side.

### What warrants a second pair of eyes
- Whether we should also add per-target selector mapping to any future higher-level “fixture” conventions (so fixtures don’t regress into union-selector usage).

### What should be done in the future
- Consider updating the sbcap validation playbook sample config to demonstrate `selector_original`/`selector_react` usage (documentation-only follow-up).

### Code review instructions
- Review schema + validation in `hair-booking/internal/sbcap/config/config.go`.
- Review per-mode selector application in:
  - `hair-booking/internal/sbcap/modes/capture.go`
  - `hair-booking/internal/sbcap/modes/cssdiff.go`
  - `hair-booking/internal/sbcap/modes/matched_styles.go`
- Run: `go test ./...`.

## Step 9: Create a fixture-based “diff gym” and a runner script

I added a small set of deterministic HTML fixture pairs (“diff gym”) plus a runner script that starts a local HTTP server and runs sbcap modes (`capture`, `pixeldiff`, `cssdiff`, `matched-styles`) against each case. Outputs are written to `/tmp/sbcap-diff-gym/<timestamp>/<case>/` with per-case logs, so we can iterate on sbcap with a stable, repeatable exercise set.

This step operationalizes the feedback-quality loop: instead of relying on Storybook setup every time, we have a minimal local fixture battery that exercises spacing, typography, paint, and cascade winner behavior.

### Prompt Context

**User prompt (verbatim):** "yes go ahead."

**Assistant interpretation:** Implement the next recommended step: build a small fixture suite and a single command to exercise the core sbcap pipeline end-to-end.

**Inferred user intent:** Establish a high-signal, low-friction development loop where improvements to sbcap can be validated quickly and repeatably.

### What I did
- Added fixture suite under:
  - `hair-booking/fixtures/sbcap-diff-gym/README.md`
  - `hair-booking/fixtures/sbcap-diff-gym/case-01-spacing/*`
  - `hair-booking/fixtures/sbcap-diff-gym/case-02-typography/*`
  - `hair-booking/fixtures/sbcap-diff-gym/case-03-color/*`
  - `hair-booking/fixtures/sbcap-diff-gym/case-04-cascade/*`
- Each case includes:
  - `original.html`
  - `react.html`
  - `sbcap.yaml.tmpl` (uses `__BASE_URL__` and `__OUT_DIR__` placeholders)
- Added runner script:
  - `hair-booking/scripts/run-sbcap-diff-gym.sh`
  - starts `python3 -m http.server` on a free local port
  - generates a concrete `sbcap.yaml` per case by substituting placeholders
  - runs sbcap in repo root via `go run ./cmd/sbcap run ...`
  - writes per-case log to `<out>/sbcap.log`
- Smoke-tested runner successfully (multiple cases, end-to-end artifacts written).

### Why
- We need stable examples to exercise sbcap changes without repeatedly booting Storybook.
- The cases are designed to cover the highest-signal categories:
  - spacing/layout (padding/margins/width),
  - typography (font-size/weight/line-height),
  - color/paint (gradients/border-radius),
  - cascade/winner logic (`!important` vs ID specificity).

### What worked
- Runner produced artifacts for all cases and completed without errors.
- Per-target selector mapping is exercised in multiple cases (IDs vs classes differ).

### What didn't work
- N/A.

### What I learned
- Even a small fixture battery is enough to catch regressions in: selector mapping, screenshot capture, pixel diff correctness, and winner logic plumbing.

### What was tricky to build
- Avoiding invalid URLs in committed configs: solved by templating `sbcap.yaml` and generating a concrete config per run (since sbcap requires absolute URLs).

### What warrants a second pair of eyes
- Fixture case design: ensure each case remains minimal but meaningfully exercises its target behavior (avoid “too pretty” fixtures that accidentally depend on fonts/assets).

### What should be done in the future
- Add one responsive/breakpoint case (run at two viewports) once sbcap supports multi-viewport execution.

### Code review instructions
- Start at `hair-booking/scripts/run-sbcap-diff-gym.sh` and run it locally.
- Inspect one output folder in `/tmp/sbcap-diff-gym/.../<case>/`:
  - `capture.json`, `pixeldiff.json`, `cssdiff.json`, `matched-styles.json`
  - `pixeldiff_*_diff_only.png`, `pixeldiff_*_diff_comparison.png`

### Technical details
- The runner uses `python3 -m http.server` to satisfy sbcap’s URL validation (scheme+host required).
