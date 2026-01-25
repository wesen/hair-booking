---
Title: 'sbcap vs css-visual-diff: comparative report'
Ticket: MO-018-CSS-VISUAL-DIFF
Status: active
Topics:
    - go
    - frontend
    - porting
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: css-visual-diff/src/browser_capture.py
      Note: Playwright capture + computed styles dump + heuristic matching_rules extraction
    - Path: css-visual-diff/src/image_diff.py
      Note: pixel diff algorithm and the uint8 overflow defect
    - Path: hair-booking/cmd/sbcap/main.go
      Note: sbcap CLI entrypoint and command surface (run + chromedp-probe)
    - Path: hair-booking/internal/sbcap/modes/capture.go
      Note: screenshot capture + coverage/visibility heuristics and outputs
    - Path: hair-booking/internal/sbcap/modes/compare.go
      Note: ergonomic sbcap compare command implementation (commit 79d5c32)
    - Path: hair-booking/internal/sbcap/modes/matched_styles.go
      Note: CDP matched-styles extraction + cascade winner logic + chromedp.Run wrapping
    - Path: hair-booking/internal/sbcap/modes/pixeldiff.go
      Note: pixeldiff mode for sbcap run (commit 7914245)
    - Path: hair-booking/internal/sbcap/runner/runner.go
      Note: pixeldiff wired into mode runner and full expansion (commit 7914245)
    - Path: hair-booking/ttmp/2026/01/19/MO-016-SBCAP-IMPLEMENTATION--sbcap-implementation-plan/reference/01-diary.md
      Note: sbcap implementation diary (modes and commits)
    - Path: hair-booking/ttmp/2026/01/19/MO-018-SBCAP-INVALID-CONTEXT--sbcap-chromedp-invalid-context/analysis/01-invalid-context-error-in-sbcap-chromedp-run.md
      Note: root-cause analysis and reproduction for chromedp invalid context
ExternalSources: []
Summary: Exhaustive comparison of sbcap (Go, YAML-driven multi-mode capture/diff tool) vs css-visual-diff (Python element visual diff + vision analysis), including status, feature matrix, defects, integration opportunities, and a proposed fixture-driven feedback cycle.
LastUpdated: 2026-01-24T19:12:40.817290237-05:00
WhatFor: Provide an exhaustive, implementation-aware comparison between sbcap and the freelancer-built css-visual-diff tool; recommend cross-pollination and a development cycle that yields high-quality feedback.
WhenToUse: Use when deciding whether to extend sbcap with pixel-diff + vision analysis features, whether to adopt ideas from css-visual-diff, and how to build a reliable feedback loop for template-porting visual audits.
---




# sbcap vs css-visual-diff: comparative report

## Executive Summary

sbcap and css-visual-diff overlap in intention (“help me see and explain CSS/visual differences”), but they currently optimize for different things:

- **sbcap** is a **workflow tool**: YAML plans, multi-target capture, multi-mode output, Storybook integration, and DevTools-style rule/cascade introspection via CDP.
- **css-visual-diff** is a **single-comparison tool**: two URLs, two (possibly different) selectors, one output bundle, and an integrated vision-model writeup.

The practical conclusion is not “pick one”; it is:

1. Keep **sbcap** as the canonical backbone (because it already matches the audit workflow and produces the right structured artifacts).
2. Port **the best user-facing ergonomics from css-visual-diff into sbcap**, notably:
   - per-target selectors,
   - pixel-diff overlays + stats,
   - an evidence-linked AI mode (but only after capture/diff artifacts are correct and stable).
3. If css-visual-diff continues, it should import sbcap’s “why” stack (CDP matched rules + cascade winners) and harden its capture/diff correctness.

## Problem Statement

We need an inspection loop for template porting (static HTML → React/Storybook) that is:

- **Fast**: tells a human “where to look” immediately.
- **Trustworthy**: outputs are correct, stable, and auditable.
- **Explanatory**: answers “why” (winner rules, missing selectors, asset issues) rather than only “different”.
- **Repeatable**: config and artifacts can be checked into docmgr, and rerun in CI against fixtures.

Without such a loop, teams fall back to:
- manual screenshot comparisons (slow and inconsistent),
- hunting in DevTools without guidance (slow and non-repeatable),
- ad hoc scripts that are hard to generalize and maintain.

## Proposed Solution

### Primary direction: extend sbcap with pixel-diff and selector mapping

sbcap already covers the core audit backbone: plans, capture, computed diffs, matched styles, story discovery. The missing high-signal component is **pixel diffs** (and the UX that makes them easy to review).

The recommended evolution is:

1. Add per-target selectors (remove unnecessary friction in configs).
2. Add a `pixeldiff` mode that consumes capture outputs and produces:
   - diff images (overlay/heatmap),
   - per-section statistics,
   - Markdown summary linking all artifacts.
3. Upgrade `ai-review` from stub to real, but only after pixel diffs exist:
   - Provide the model with: original screenshot, react screenshot, diff overlay, plus a *bounded* list of computed diffs and cascade winner diffs.
   - Cache by hashing inputs; treat AI output as a “hint layer”, not primary truth.

### Secondary direction (optional): fix and harden css-visual-diff

css-visual-diff can remain useful as a prototyping harness and reference UX, but it must first fix correctness issues (pixel diff overflow) and rendering determinism (viewport, scroll-to-element).

## Design Decisions

### Decision 1: “Why” comes from CDP (matched rules + computed values), not stylesheet walking

css-visual-diff currently approximates “matching rules” by iterating `document.styleSheets` and checking `element.matches(rule.selectorText)`. This is not equivalent to DevTools:

- CORS stylesheets can be inaccessible.
- Nested at-rules (`@media`, `@supports`, `@layer`) require recursion.
- Origin ordering (user-agent vs author vs inline) is not reliably inferred.
- Shadow DOM and adopted stylesheets are not handled.

sbcap’s `CSS.getMatchedStylesForNode` + `CSS.getComputedStyleForNode` is the correct foundation.

### Decision 2: Pixel diffs are a first-class artifact, not a postscript

Pixel diffs are not “nice to have”; they solve the hardest human problem: “where do I look”.

Given sbcap already captures screenshots and organizes output directories, it should own pixel diffs.

### Decision 3: AI must be evidence-linked and optional

AI output without evidence is a narrative, not an audit.

An acceptable AI feature must:
- reference specific artifacts,
- be bounded in scope (per named section/style),
- be reproducible enough for iteration,
- never be required to get value from the tool.

## Alternatives Considered

### Alternative A: Keep only the existing TypeScript scripts

Rejected for the long term because `hair-booking/ui/scripts/*` scripts are hard-coded and not designed for multi-project reuse. They remain valuable fixtures and baselines.

### Alternative B: Make css-visual-diff the backbone

Rejected for now because sbcap already has the multi-mode workflow surface and a CDP “why” stack; css-visual-diff currently has correctness and determinism deficits.

### Alternative C: Switch sbcap from chromedp to Playwright

Deferred. Playwright is a strong contender for capture determinism, but switching engines is a large rewrite. The incremental path is to add pixel diff + selector mapping atop sbcap’s existing chromedp foundation.

## Current implementation status (auditor inventory)

This section enumerates “what exists today” using file paths and key symbols.

### sbcap (Go) — current status

#### Repository location

- Code: `hair-booking/cmd/sbcap/main.go`, `hair-booking/internal/sbcap/...`
- Spec/diaries: docmgr tickets `MO-016-SBCAP-IMPLEMENTATION`, `MO-017-CASCADE-LOGIC`, `MO-018-SBCAP-INVALID-CONTEXT`

#### CLI and command surface

- File: `hair-booking/cmd/sbcap/main.go`
  - Root command: `sbcap`
  - `sbcap run` (Glazed/Cobra)
    - `RunSettings` fields:
      - `Config` (path string)
      - `Modes` (comma list)
      - `DryRun` (bool)
    - `runner.NormalizeModes(...)` expands `full` into:
      - `capture`, `cssdiff`, `matched-styles`, `ai-review`
    - Emits rows for:
      - mode results,
      - coverage summary (`emitCoverageRows`, reads `capture.json`),
      - story entries (`emitStoryRows`, reads `stories.json`).
  - `sbcap chromedp-probe` (diagnostic command; used to isolate chromedp failures).

#### Configuration schema

- File: `hair-booking/internal/sbcap/config/config.go`
  - Types: `Config`, `Metadata`, `Target`, `SectionSpec`, `StyleSpec`, `OutputSpec`
  - Validator: `(*Config).Validate()`
  - URL validation: `validateURL(...)` requires scheme + host (rejects `file://...`).

#### Browser driver (chromedp)

- File: `hair-booking/internal/sbcap/driver/chrome.go`
  - `driver.NewBrowser(parent)` creates allocator context + browser context.
  - `(*Browser).NewPage()` creates a child context per page.
  - `(*Page)` methods:
    - `SetViewport(width,height)`
    - `Goto(url)`
    - `Wait(duration)`
    - `FullScreenshot(path)`
    - `Screenshot(selector, path)`
    - `Evaluate(script, out)`
  - Logging: zerolog lifecycle logs (added during invalid-context debugging).

#### Modes and outputs

The tool is “mode-driven”; each mode writes JSON/MD and sometimes PNGs.

| Mode | Implementation | Outputs (typical) | Notes |
|---|---|---|---|
| `capture` | `hair-booking/internal/sbcap/modes/capture.go` (`RunCapture`) | `capture.json`, `capture.md`, `original-full.png`, `react-full.png`, per-section PNGs | Includes coverage summary and basic visibility heuristic. |
| `cssdiff` | `hair-booking/internal/sbcap/modes/cssdiff.go` (`CSSDiff`) | `cssdiff.json`, `cssdiff.md` | Captures requested computed properties; optional bounds + attributes. |
| `matched-styles` | `hair-booking/internal/sbcap/modes/matched_styles.go` (`RunMatchedStyles`) | `matched-styles.json`, `matched-styles.md` | Uses CDP matched rules + computed styles; winner summary includes origin + specificity. |
| `story-discovery` | `hair-booking/internal/sbcap/modes/stories.go` (`StoryDiscovery`) | `stories.json`, `stories.md` | Fetches Storybook `/index.json` based on react target host. |
| `ai-review` | `hair-booking/internal/sbcap/modes/ai_review.go` (`RunAIReview`) | `ai-review.json`, `ai-review.md` | Uses `ai.NoopClient` and records explicit error; needs real AI backend. |

#### Cascade winner logic and tests

- Winner logic (importance, origin, specificity, order) is in:
  - `hair-booking/internal/sbcap/modes/matched_styles.go`:
    - types: `Candidate`, `Specificity`, `CascadeOrigin`, `Winner`, `WinnerDiff`
    - functions: `collectCandidates`, `selectWinner`, `candidateBeats`, `computeSpecificity`
- Unit tests:
  - `hair-booking/internal/sbcap/modes/matched_styles_test.go`

#### “Invalid context” issue status

Originally, `matched-styles` could fail at runtime with `Error: invalid context` during CDP calls.
Per `MO-018-SBCAP-INVALID-CONTEXT`, the fix is implemented by executing CDP calls within `chromedp.Run(... chromedp.ActionFunc ...)`:

- `css.GetMatchedStylesForNode(nodeID).Do(ctx)` is called inside a `chromedp.Run` action func.
- `css.GetComputedStyleForNode(nodeID).Do(ctx)` is called inside a `chromedp.Run` action func.

This ensures the correct executor is bound to the context.

#### sbcap limitations (current)

1. No pixel diffs (only screenshots).
2. AI review is stubbed (NoopClient).
3. One selector per item for both targets (no explicit selector mapping).
4. Visibility heuristic is minimal (does not check opacity, offscreen, clipping, etc.).
5. No fixture battery checked into CI (validation is currently playbook/manual).

### css-visual-diff (Python) — current status

#### Repository location

- Code: `css-visual-diff/src/*`
- Documentation: `css-visual-diff/README.md`, `css-visual-diff/PROJECT_SUMMARY.md`
- Tests/fixtures: `css-visual-diff/tests/page1.html`, `css-visual-diff/tests/page2.html`
- Example outputs: `css-visual-diff/test1_navigation/*`, `css-visual-diff/test3_pricing/*`, etc.

#### CLI and modules

- CLI: `css-visual-diff/src/cli.py` (Click)
  - Captures two elements → generates diff → optionally runs vision analysis → writes `summary.json`.
- Capture: `css-visual-diff/src/browser_capture.py`
  - Playwright sync:
    - `page.goto(url, wait_until='networkidle')`
    - `page.wait_for_selector(selector, state='visible')` (30s)
    - `element.screenshot(...)`
  - Extracts:
    - full computed style map (all properties)
    - “matching rules” by walking styleSheets and testing `element.matches(rule.selectorText)`
    - `bounding_box` and `outerHTML`
- Diffing: `css-visual-diff/src/image_diff.py`
  - `ImageChops.difference` + NumPy magnitude threshold → mask → overlay.
- Vision analysis: `css-visual-diff/src/llm_analysis.py`
  - Sends 3 images + CSS context + question to an OpenAI vision model.

#### Critical correctness defect: uint8 overflow in diff stats/mask

In `css-visual-diff/src/image_diff.py`, the code effectively does:

```python
diff_array = np.array(diff)         # dtype is uint8
diff_magnitude = np.sqrt(np.sum(diff_array ** 2, axis=2))
changed_mask = diff_magnitude > threshold
```

Problem: `diff_array` is `uint8`. Squaring a `uint8` overflows:
- `255**2` becomes `1` (mod 256)
- `200**2` becomes `64` (mod 256)
- etc.

Therefore, even large differences can produce a tiny “magnitude”, and `changed_mask` becomes false for normal thresholds like `30`.

Concrete evidence:
- The committed `css-visual-diff/test1_navigation/summary.json` reports `changed_pixels: 0` and `change_percentage: 0.0`.
- A local recomputation of changed pixels using `int16` yields ~99.65% changed pixels for the same inputs.

Correct fix:

```python
diff_array = np.array(diff, dtype=np.int16)
diff_magnitude = np.sqrt(np.sum(diff_array ** 2, axis=2))
```

#### css-visual-diff limitations (current)

1. Pixel diff masking is incorrect (defect above).
2. No deterministic viewport control.
3. Element must be visible in viewport; offscreen selectors will fail (no scroll-to-element).
4. “Matching rules” is heuristic and incomplete (CORS, nesting, cascade).
5. Single-element per run (no batch mode).
6. No caching; AI runs spend tokens each time.

## Feature comparison (matrix)

| Dimension | sbcap | css-visual-diff |
|---|---|---|
| Input model | YAML plan + modes | CLI args (single comparison) |
| Targets | 2 targets per plan (original + react) | 2 URLs per run |
| Selector mapping | Not first-class | First-class (`selector1`, `selector2`) |
| Capture scope | Full-page + multiple named sections | One element pair |
| Computed CSS | Subset (requested props) | Full dump (all computed props) |
| Matched rules | CDP matched styles | Stylesheet walk heuristic |
| Cascade winners | Yes | No |
| Pixel diffs | Not yet | Intended, but currently incorrect |
| Storybook discovery | Yes | No |
| AI analysis | Stub (not configured) | Implemented |
| Output bundle | JSON + MD + PNG | JSON + MD + PNG |

## Deep technical comparison (inspection-grade)

This section intentionally over-specifies failure modes and corner cases. Treat it as a checklist of “how this can lie to you” and “how to make it honest”.

### Capture determinism and repeatability

#### sbcap capture determinism

What sbcap controls today:
- Viewport: `(*driver.Page).SetViewport(width,height)` via CDP emulation.
- Waits: explicit `target.wait_ms`.

What sbcap does not control (yet):
- network idle / DOM stability signals,
- animation disabling,
- font loading stabilization,
- device scale factor / pixel ratio.

Implication:
- sbcap is already relatively deterministic because it explicitly pins viewport and uses explicit waits, but it can still be sensitive to late-loading fonts, animation frames, or async content.

Suggested hardening knobs (future config fields; optional defaults):
- `target.wait_for`:
  - `networkidle` (best-effort; may hang on long-polling),
  - `domcontentloaded`,
  - `load`,
  - `custom_js` predicate loop.
- `target.disable_animations: true` (inject CSS to zero out transitions/animations).
- `target.device_scale_factor` (avoid differences from OS defaults).

#### css-visual-diff capture determinism

What css-visual-diff controls today:
- Navigation wait: `wait_until='networkidle'`.
- Element presence/visibility: `wait_for_selector(..., state='visible')`.

What css-visual-diff does not control (yet):
- viewport size (implicit default),
- scroll-to-element (required for offscreen elements),
- animation disabling,
- consistent browser reuse across both captures (it opens a new browser per URL).

Implication:
- A “visible selector” requirement is attractive but creates false negatives for offscreen elements.
- Implicit viewport introduces accidental diffs (responsive changes).

### Selector semantics and mapping

#### sbcap selector coupling

sbcap uses one selector string for both targets. That forces either:
- “union selectors” (e.g., `#page-title, .page-title`), or
- creating multiple entries and accepting partial coverage semantics.

Risks:
- union selectors can match unintended elements on one side (false positives),
- union selectors can hide drift (the two targets may match different elements while “existing=true”).

#### css-visual-diff selector separation

css-visual-diff’s `selector1` vs `selector2` prevents union-selector ambiguity:
- you can explicitly bind “this is the intended element on each side”.

Recommended sbcap import:
- include explicit per-target selectors in plan schema, and include them in output artifacts (so audits show what was actually queried).

### “Matching rules” and cascade truth

#### sbcap (CDP matched styles)

sbcap’s matched-styles mode is essentially:

```text
nodeID = querySelector(selector)
matched = CSS.getMatchedStylesForNode(nodeID)
computed = CSS.getComputedStyleForNode(nodeID)
optional box = DOM.getBoxModel(nodeID)
```

This gives DevTools-grade inputs:
- matched rules in cascade order,
- origins (user-agent, regular, injected, inspector),
- specificity per selector (often provided by CDP),
- inline style object separately.

sbcap then adds:
- cascade winner explanation (importance → origin → specificity → order).

#### css-visual-diff (stylesheet walking)

css-visual-diff’s “matching_rules” today is:

```text
for each sheet in document.styleSheets:
  for each rule in sheet.cssRules:
    if rule.selectorText && element.matches(rule.selectorText):
      collect rule.selectorText + rule.style.cssText
```

Known problems:
- CORS stylesheets throw exceptions and are skipped silently.
- `sheet.cssRules` only returns top-level rules; nested at-rules require recursion:
  - `CSSMediaRule`, `CSSSupportsRule`, `CSSLayerBlockRule`, etc.
- `element.matches(selectorText)` answers only “does it match”, not “did it win”.
- It does not represent rule order across stylesheets reliably when sheets are inaccessible.

Consequence:
- The extracted rule set is incomplete and may actively mislead.

### Pixel diff semantics (what a diff should mean)

Pixel diffs are deceptively tricky:
- antialiasing and subpixel rendering can cause widespread low-level differences,
- fonts can rasterize differently across environments,
- even identical DOM/CSS can differ if device scale factor differs.

Therefore, a pixel diff mode should define:

1. **Normalization policy** (size, background, alignment)
   - pad to max width/height, or
   - scale to a standard canvas size, or
   - crop to element bounds.
2. **Difference metric**
   - L2 distance in RGB (simple),
   - delta-E in Lab (more perceptual),
   - alpha-aware comparisons (important for transparent elements).
3. **Threshold policy**
   - per-pixel threshold (simple),
   - blur + threshold (de-noise),
   - morphological dilation (make “difference regions” easier to see).
4. **Stats policy**
   - changed pixel count,
   - changed pixel percentage,
   - connected component bounding boxes (“where are the diff regions?”),
   - heatmap intensity distribution.

#### css-visual-diff defect: dtype overflow

This is not a subtle issue: the dtype overflow defeats the entire “diff” concept.
Until fixed, the tool produces unreliable diff masks and stats.

#### Recommended sbcap pixel-diff spec (minimum viable, then hardened)

Minimum viable (MVP):
- RGB L2 distance, `int16` intermediate math.
- Fixed threshold (configurable).
- Overlay: paint changed pixels red on top of react image.
- Stats: changed pixels / total pixels.

Hardened follow-ups:
- Optional blur radius before comparison.
- Optional per-channel thresholding.
- Output bounding boxes for changed regions (helps humans jump to the “diff hotspot”).
- Optional ignore regions (e.g., timestamps, animated carousels).

### AI analysis semantics (what “AI mode” must not do)

AI analyses are persuasive even when wrong. For audit-grade use:

- AI output must never replace:
  - pixel diff overlays,
  - computed property diffs,
  - cascade winner diffs.
- AI output should be treated as:
  - summarization and hypothesis generation,
  - “next actions” suggestions,
  - a triage accelerator.

An “audit-safe” AI report should be structured:

```text
Findings (model):
  - Finding: "Header is taller"
    Evidence:
      - image: diff-<section>.png
      - cssdiff: height original=68px react=79px
      - winner: height winner original=.header-nav react=.navigation-header
    Confidence: 0.8
```

This forces the model to cite artifacts we can check.

## How css-visual-diff features can benefit sbcap (imports)

### Import 1: per-target selectors (explicit mapping)

sbcap’s current selector strategy is “one selector string that matches both targets” (possibly using selector lists like `#id, .class`).

This is workable but not ideal:
- it forces the config author to construct “union selectors” that can become brittle,
- it couples the original and react DOM shapes unnecessarily.

Adopt css-visual-diff’s explicit mapping:

```yaml
styles:
  - name: hero-title
    selector:
      original: "#hero h1"
      react: ".HeroTitle"
    props: [font-size, font-weight, margin-top]
```

### Import 2: pixel-diff artifacts (overlay + stats) as “first triage”

sbcap already generates screenshots. A pixel diff mode can:
- highlight where differences are,
- compute change percentages,
- rank sections by “amount changed” so humans start with the biggest deltas.

### Import 3: “one bundle per comparison” UX

css-visual-diff outputs a predictable set of files:
- `url1_screenshot.png`, `url2_screenshot.png`
- `diff_comparison.png`, `diff_only.png`
- `*_css_data.json`
- `analysis_report.md`

sbcap already has predictable outputs per mode, but a pixel-diff addition should preserve the “bundle readability”:
- per-section diff images should have consistent naming,
- Markdown should link to all images,
- JSON should be machine readable for further processing.

## How sbcap features can benefit css-visual-diff (exports)

### Export 1: CDP matched styles (accurate “why”)

Replace stylesheet walking with CDP:
- `CSS.getMatchedStylesForNode`
- `CSS.getComputedStyleForNode`
- (optional) `DOM.getBoxModel`

This yields:
- accurate matched rules,
- reliable origins,
- specificity metadata (often provided by CDP),
- the ability to build cascade-winner summaries.

### Export 2: cascade-winner reasoning

css-visual-diff’s LLM can guess likely causes, but sbcap provides a deterministic “winner diff”:
- if `margin-top` differs, list the winning selectors and values on both sides.

Feeding this into AI (or simply presenting it) makes the output actionable.

### Export 3: plan/batch mode + coverage

The “one element per run” model is insufficient for Storybook audits. sbcap’s plan model scales better:
- dozens of sections,
- consistent output directories,
- coverage stats (missing/hidden).

## Development cycle: building a high-quality feedback loop

### Primary objective

Make it hard to regress the tool itself and easy to generate high-quality, high-signal examples for human review.

### The fixture set should be a “diff gym”

Each fixture is a known training case; it should exercise specific tool capabilities.

#### Suggested fixture taxonomy

1. **Presence/coverage**
   - element present in original, missing in react
   - element present but hidden (`display:none`, `visibility:hidden`, `opacity:0`)
2. **Layout**
   - padding/margin changes
   - flex/grid alignment changes
   - absolute/relative positioning changes
3. **Typography**
   - font-size/line-height differences
   - font-weight differences
   - font-family fallback differences
4. **Color and paint**
   - background color vs gradient
   - box-shadow changes
   - border changes
5. **Assets**
   - missing icon/image
   - wrong asset path
6. **Cascade**
   - `!important` vs normal
   - specificity conflicts (#id vs .class)
   - inline vs author stylesheet
   - `:where()` (zero specificity) and `:not()` / `:is()` specificity behavior
7. **Responsive**
   - media query breakpoints (run at multiple viewports)
8. **Timing**
   - delayed rendering
   - animations (should be disabled or stabilized)

#### For each fixture case, define:

- `original.html` and `react.html` (or Storybook story),
- an `sbcap.yaml` plan,
- a “review intent” paragraph: what should change and how it should be detected.

### Regression battery for sbcap (local + CI)

Local loop:
1. Change code.
2. Run `go test ./...` in `hair-booking/`.
3. Run sbcap fixture battery (capture + cssdiff + matched-styles + pixeldiff).
4. Inspect top-ranked diffs (largest changed pixel % first).

CI loop:
1. Run `go test ./...`.
2. Run fixture battery with pinned browser.
3. Upload artifacts; optionally compare against golden expected outputs in a strict mode.

## Implementation plan (detailed)

### Phase 0: document and stabilize current sbcap behavior

- Keep `MO-016` playbook as operational guidance.
- Record a “known good” run output bundle from a fixture, and relate it in docmgr.

### Phase 1: add selector mapping to sbcap config

Touchpoints:
- `hair-booking/internal/sbcap/config/config.go`
- `hair-booking/internal/sbcap/modes/capture.go`
- `hair-booking/internal/sbcap/modes/cssdiff.go`
- `hair-booking/internal/sbcap/modes/matched_styles.go`

### Phase 2: add `pixeldiff` mode

Implementation sketch:
- New file: `hair-booking/internal/sbcap/modes/pixeldiff.go`
  - Read `capture.json`.
  - For each section where both screenshots exist:
    - compute mask + stats
    - write overlay
  - Emit `pixeldiff.json` and `pixeldiff.md`.

Pseudo-code (Go-ish):

```go
type PixelDiffEntry struct {
  Section string
  OriginalPNG string
  ReactPNG string
  DiffPNG string
  Threshold float64
  TotalPixels int
  ChangedPixels int
  ChangedPct float64
}

func PixelDiff(ctx context.Context, cfg *config.Config) error {
  cap := loadCapture(cfg.Output.Dir)
  for each section in cap.Original.Sections:
    if missing either screenshot: continue
    imgA := decodePNG(section.Original.Screenshot)
    imgB := decodePNG(section.React.Screenshot)
    (imgA2, imgB2) := padToSameSize(imgA, imgB)
    mask := diffMask(imgA2, imgB2, threshold)
    overlay := applyOverlay(imgB2, mask)
    write overlay
    write stats
  write pixeldiff.json + pixeldiff.md
}
```

### Phase 3: implement real AI client (optional)

Touchpoints:
- `hair-booking/internal/sbcap/ai/client.go` (add real implementation)
- `hair-booking/internal/sbcap/modes/ai_review.go` (use configured client)

Prompt construction:
- Provide:
  - original PNG,
  - react PNG,
  - diff overlay PNG,
  - computed diffs (from `cssdiff.json`),
  - winner diffs (from `matched-styles.json`).

Cache key:
- hash of (images + JSON diffs + question text + model name).

## Open Questions

1. Should sbcap accept `file://` URLs to make fixture runs simpler, or standardize on local HTTP servers?
2. Should pixel diffs be computed per-section only, or also full-page?
3. Should sbcap support multiple viewports per run (responsive diffs)?
4. Do we want strict assertions (fail when diffs exceed thresholds) as a mode, or only artifacts + manual review?

## References

### Docmgr tickets

- `MO-015-STORYBOOK-TOOL`
- `MO-016-SBCAP-IMPLEMENTATION`
- `MO-017-CASCADE-LOGIC`
- `MO-018-SBCAP-INVALID-CONTEXT`

### sbcap code

- `hair-booking/cmd/sbcap/main.go`
- `hair-booking/internal/sbcap/config/config.go`
- `hair-booking/internal/sbcap/driver/chrome.go`
- `hair-booking/internal/sbcap/modes/capture.go`
- `hair-booking/internal/sbcap/modes/cssdiff.go`
- `hair-booking/internal/sbcap/modes/matched_styles.go`
- `hair-booking/internal/sbcap/modes/matched_styles_test.go`
- `hair-booking/internal/sbcap/modes/ai_review.go`
- `hair-booking/internal/sbcap/modes/stories.go`
- `hair-booking/internal/sbcap/ai/client.go`

### css-visual-diff code

- `css-visual-diff/src/cli.py`
- `css-visual-diff/src/browser_capture.py`
- `css-visual-diff/src/image_diff.py`
- `css-visual-diff/src/llm_analysis.py`
