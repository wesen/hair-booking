---
Title: Reusable Go Port of Storybook Capture Tool
Ticket: MO-015-STORYBOOK-TOOL
Status: active
Topics: []
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/01-storybook-screenshot-and-css-capture-tool-analysis.md
      Note: Source analysis of current tooling
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md
      Note: Detailed CDP-based report guidance
    - Path: ui/scripts/capture-sections.ts
      Note: Baseline functionality to port
    - Path: ui/scripts/compare-about-us.ts
      Note: Baseline integrated audit to port
    - Path: ui/scripts/compare-css.ts
      Note: Baseline computed-style capture to port
ExternalSources: []
Summary: Design for porting the Storybook screenshot and CSS capture tooling to Go as a reusable, multi-project CLI + library.
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Provide a detailed, reusable Go architecture for Storybook screenshot and CSS capture workflows.
WhenToUse: Use when building a Go-based replacement for the current TypeScript scripts.
---



# Reusable Go Port of Storybook Capture Tool

## Executive Summary

We will port the Storybook screenshot and CSS capture tooling from TypeScript (Playwright scripts in `ui/scripts/`) to a reusable Go library and CLI. The Go tool should preserve the current workflow primitives (capture sections, compare computed styles, full-page audit) while supporting multi-project reuse via configuration files, stable output formats, and pluggable browser drivers. The design emphasizes: (1) deterministic runs with controlled viewports and waits, (2) explicit, versioned outputs (JSON + Markdown + PNG), and (3) an API surface suitable for integration into CI and other automation.

## Problem Statement

The existing tooling is effective but ad hoc. It is implemented as several scripts with hard-coded URLs and selectors:
- `ui/scripts/capture-sections.ts`
- `ui/scripts/compare-css.ts`
- `ui/scripts/compare-about-us.ts`

This structure causes friction when reused across projects, pages, or teams. A Go port should make the core workflow reusable, configurable, and reliable, while preserving the diagnostic power of computed-style comparison and per-section screenshot capture.

## Proposed Solution

### 1) Package architecture

We design a Go module with a thin CLI wrapper and a reusable library:

```
storybook-capture/
  cmd/
    sbcap/                # CLI entrypoint
  internal/
    config/               # config parsing and validation
    capture/              # screenshot and section capture
    cssdiff/              # computed-style extraction and diff
    audit/                # report generation (JSON/Markdown)
    storybook/            # Storybook story discovery (index.json)
    browser/              # browser driver abstraction
  pkg/
    sbcap/                # exported types for reuse
```

Core idea: separate the workflow (capture, compare, report) from the browser driver (Playwright, chromedp, etc.).

### 2) Key Go types and API surface

These types mirror the current script responsibilities while making the system reusable.

```go
// pkg/sbcap/types.go

type TargetPage struct {
    Name      string
    URL       string
    WaitMS    int
    Viewport  Viewport
}

type SectionSpec struct {
    Name     string
    Selector string
}

type StyleSpec struct {
    Name     string
    Selector string
    Props    []string
}

type CapturePlan struct {
    Original TargetPage
    React    TargetPage
    Sections []SectionSpec
    Styles   []StyleSpec
    Output   OutputSpec
}

type OutputSpec struct {
    Dir          string
    WriteJSON    bool
    WriteMarkdown bool
    WritePNGs    bool
}

// Interface for browser automation backend

type BrowserDriver interface {
    NewPage(ctx context.Context) (Page, error)
    Close() error
}

type Page interface {
    Goto(ctx context.Context, url string, waitUntil string, timeout time.Duration) error
    SetViewport(ctx context.Context, width, height int) error
    Wait(ctx context.Context, ms int) error
    QuerySelector(ctx context.Context, selector string) (Element, error)
    Screenshot(ctx context.Context, path string, fullPage bool) error
    Evaluate(ctx context.Context, script string, args any, out any) error
}
```

In the Go port, the CLI maps configuration input to a `CapturePlan`, then executes:
- `capture.Run(plan)` for screenshots
- `cssdiff.Run(plan)` for computed-style comparison
- `audit.Render(plan, results)` for Markdown and JSON

### 3) A standard configuration file format

A reusable tool should be configured by file rather than code. We use YAML for readability.

```yaml
# sbcap.yaml
metadata:
  slug: about-us-visual-audit
  title: "About Us Visual Audit"
  description: "Capture and compare Storybook vs original HTML for the About Us page."
  goal: "Identify missing sections, layout mismatches, and CSS drift."
  expected_result:
    format:
      - json
      - markdown
      - png
    description: "JSON + Markdown reports plus full-page and per-section screenshots."
  potential_questions:
    - "Which sections are missing in the React port?"
    - "Which selectors show the largest height/width differences?"
    - "Are page-title and breadcrumb styles consistent?"
  related_files:
    - path: ui/scripts/capture-sections.ts
      reason: "Source of section screenshot logic."
    - path: ui/scripts/compare-css.ts
      reason: "Source of computed-style capture pattern."
    - path: ui/scripts/compare-about-us.ts
      reason: "Integrated audit pattern (screenshots + issues + report)."
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
  - name: header
    selector: "header, .header"
    ocr_question: "Are the expected nav items and icons present?"
  - name: page-title
    selector: "#page-title, .page-title"
styles:
  - name: page-title
    selector: "#page-title, .page-title"
    props: [position, marginTop, height, zIndex]
    include_bounds: true
    attributes: [id, class, data-variant]
    report: [matched_styles, computed_styles, box_model]
output:
  dir: ttmp/.../sources/storybook-capture
  write_json: true
  write_markdown: true
  write_pngs: true
```

CLI execution should accept a multi-option `--modes` flag (plural) so multiple phases run in a single invocation. The CLI should accept a comma-delimited list and execute the requested stages in a deterministic order, for example:

```
sbcap run --config sbcap.yaml --modes capture,cssdiff,matched-styles,ai-review
```

Recommended mode names (spec):
- `capture`: full-page + per-section screenshots
- `cssdiff`: computed-style extraction and diffs
- `matched-styles`: DevTools-style matched selector reports (CDP)
- `ai-review`: AI question answering for `ocr_question` prompts
- `full`: shorthand that expands to all supported modes

If `--modes` is omitted, default to `capture,cssdiff` to preserve the minimum useful diagnostic set without invoking AI by default.

CLI implementation should use Glazed + Cobra for consistent parameter parsing and multi-format output. The Glazed approach from `glaze help build-first-command` maps well to sbcap:
- Define a settings struct with `glazed.parameter` tags for `--config`, `--modes`, and `--dry-run`.
- Use `cmds.CommandDescription` with `fields.New(...)` to declare flags and help text.
- Decode flags via `values.DecodeSectionInto(vals, schema.DefaultSlug, &settings)` to ensure defaults and validation are applied consistently.
- Build the Cobra command with `cli.BuildCobraCommand(...)`, and include `schema.NewGlazedSchema()` so commands that emit summaries can output JSON/YAML/CSV without extra formatting code.

The `metadata` block is a first-class, structured description of the intent and traceability of a capture run. It is meant to be read by humans, indexed by doc tooling, and carried through to report headers. Each field is deliberately explicit so a future analyst can understand why the run existed, what it was trying to answer, and how to interpret its outputs. The schema is YAML (not JSON) to remain readable, diff-friendly, and easy to annotate in documentation workflows.

Detailed semantics for each metadata field:
- `metadata.slug`: A stable identifier for referencing the run in other docs, issue trackers, and report filenames. It should be URL-safe, lower-case, and immutable once published. The slug is the anchor for linking JSON and Markdown artifacts back to a single analysis intent.
- `metadata.title`: A human-readable label for the run, typically used in report headings and dashboard summaries.
- `metadata.description`: A short narrative of what is being captured and compared, with enough specificity to distinguish similar runs (for example, "About Us page" vs "Home page").
- `metadata.goal`: A precise statement of the analytical purpose. This should be phrased as the goal of the run, not a vague description of the tool (for example, "Identify missing sections and layout drift after porting").
- `metadata.expected_result`: A structured expectation of what outputs will exist and how they should be interpreted.
  - `expected_result.format`: An explicit list of output artifact types (for example, `json`, `markdown`, `png`). This allows automation to verify that the run produced the necessary artifacts.
  - `expected_result.description`: A prose description of what the artifacts represent (for example, "JSON + Markdown reports plus full-page and per-section screenshots").
- `metadata.potential_questions`: A prioritized list of concrete questions that an analyst expects the artifacts to answer. This is a quality-control device: if a question cannot be answered from the outputs, the capture plan is likely missing data or selectors.
- `metadata.related_files`: A traceability list of file references with reasons. The tool should not treat these as implementation inputs; they exist to connect the analysis to its sources and to guide future maintenance.
  - Each entry includes `path` and `reason`, where `reason` explains the relevance (for example, "source of computed-style capture pattern").

The `sections[*].ocr_question` field is optional and intentionally scoped. It is a prompt for a human or an OCR-assisted reviewer to answer using the captured image for that section. If present, it becomes part of the analysis checklist and can be copied into reports as a TODO or verification item. This field does not alter capture behavior; it only informs human review. The typical use cases are:
- Visual presence checks ("Are the expected nav items and icons present?")
- Typography checks ("Is the title italic and center-aligned?")
- Asset integrity checks ("Do the icon PNGs render with the correct color and detail?")

When `ocr_question` is omitted, the section is still captured normally. When it is present, the report generator should include it verbatim next to the corresponding section artifacts so the analyst can answer it without cross-referencing the config. This makes the capture plan self-documenting, which is critical when the tool is reused across projects with different UX expectations.

Computed positions and attributes can be captured alongside styles to make the report diagnostic rather than purely visual. In the YAML above, this is expressed as optional fields under each `styles` entry:
- `include_bounds: true` requests the element's layout bounds. The capture should record `x`, `y`, `width`, and `height` using a browser-side layout query.
- `attributes: [...]` requests specific DOM attributes to be captured verbatim from the element (for example, `id`, `class`, or `data-*` attributes that drive styling or JS behavior).

Operationally, this means the capture engine must evaluate a small script in the page context to read both geometry and attributes. There are two standard approaches in Playwright:
1) **Playwright-side bounding box**: `elementHandle.boundingBox()` returns a box in page coordinates. It is convenient but can return `null` if the element is not visible or detached.
2) **DOM-side bounding box**: `element.getBoundingClientRect()` (via `page.Evaluate`) returns layout bounds relative to the viewport. This is often more stable for diagnostics and can be combined with computed styles in the same evaluation call.

To keep results consistent across pages, we should normalize bounds to a single coordinate space. The most common choice is viewport coordinates (`getBoundingClientRect()`), with the understanding that:
- `x`/`y` are viewport-relative (top-left of the visible window).
- For full-page reports, you can add `window.scrollX` and `window.scrollY` if you want document-relative coordinates.
- Transforms can affect reported bounds, which is useful for debugging but may be surprising; this should be documented in the report header.

Attribute capture is straightforward: for each attribute name listed in `attributes`, call `element.getAttribute(name)`. Missing attributes should be recorded as `null` to differentiate "not present" from empty string. This matters for class-driven styling and for JS plugins that depend on `data-*` attributes.

Example capture payload (conceptual):

```
{
  "selector": "#page-title, .page-title",
  "bounds": { "x": 0, "y": 0, "width": 1280, "height": 466 },
  "attributes": { "id": "page-title", "class": "page-title bg-overlay" },
  "computedStyles": { "position": "relative", "marginTop": "-140px" }
}
```

In the Go port, this implies the `cssdiff` module should expose a richer `ElementInfo` object that includes `Bounds` and `Attributes` when requested, and the report generator should render these alongside style diffs. This turns the tool into a hybrid of layout inspection and semantic DOM inspection, which is exactly what is needed when porting template HTML to React.

The `styles[*].report` list is the explicit mechanism for requesting DevTools-style reports. It is declarative and per-selector, so callers can request deeper diagnostics only where needed. The supported values are:
- `matched_styles`: include the matched CSS rules (selectors + declarations) for the node, with source URLs and line numbers when available.
- `computed_styles`: include the final computed values for the node (the DevTools "Computed" view).
- `box_model`: include the element box model, either via `DOM.getBoxModel` or a normalized `getBoundingClientRect` representation.

If `report` is omitted, the tool should default to `computed_styles` for minimal reporting. If `report` includes `matched_styles`, the engine must use CDP (`CSS.getMatchedStylesForNode`) rather than DOM-only APIs. This is an intentional design constraint: it ensures callers understand when the tool needs a CDP-capable backend (Playwright or chromedp). For report consumers, the output should be grouped by selector and then by report type to mirror DevTools mental models.

Example report excerpt (conceptual, Markdown):

```
## Selector: #page-title, .page-title

Matched styles:
1. .header-transparent + .page-title { margin-top: -140px; position: relative; }
   source: /hairy/assets/css/style.css:240
2. .page-title .bg-section img { object-fit: cover; }
   source: /ui/src/styles/theme.css:18

Computed styles:
- position: relative
- margin-top: -140px
- height: 466px
- z-index: 1

Box model:
- content: x=0 y=0 w=1280 h=466
- padding: x=0 y=0 w=1280 h=466
- border:  x=0 y=0 w=1280 h=466
- margin:  x=0 y=-140 w=1280 h=606
```

### 4) Execution model in Go

The Go port should follow the same logical steps as the TypeScript scripts, but with clear phases and return types.

Pseudocode (workflow):

```
func RunCapture(plan CapturePlan) (CaptureResult, error) {
    browser := browser.NewDriver(plan)
    defer browser.Close()

    // Pass 1: Original
    origPage := browser.NewPage()
    configurePage(origPage, plan.Original)
    origArtifacts := captureSections(origPage, plan.Sections, plan.Output)

    // Pass 2: React/Storybook
    reactPage := browser.NewPage()
    configurePage(reactPage, plan.React)
    reactArtifacts := captureSections(reactPage, plan.Sections, plan.Output)

    return CaptureResult{Original: origArtifacts, React: reactArtifacts}
}

func RunCSSDiff(plan CapturePlan) (StyleDiffResult, error) {
    // Use page.Evaluate with getComputedStyle and getBoundingClientRect
}

func RenderReport(plan CapturePlan, capture CaptureResult, styles StyleDiffResult) error {
    // Write Markdown + JSON
}
```

### 5) Mapping current scripts to Go modules

- `capture-sections.ts` -> `internal/capture` (section screenshot capture)
- `compare-css.ts` -> `internal/cssdiff` (computed-style extraction + diff)
- `compare-about-us.ts` -> `internal/audit` (integration, reports)

The key logic is preserved, but the Go design reduces hard-coded constants and standardizes outputs.

### 6) Required concepts for a Go port

- **Browser automation in Go**: choose between `playwright-go`, `chromedp`, or `rod`.
- **Determinism**: explicit waits and fixed viewports to stabilize screenshots.
- **Selector resilience**: ability to specify selector fallbacks and capture missing selectors as structured issues.
- **Computed style extraction**: use JS execution to call `getComputedStyle` and `getBoundingClientRect`.
- **Artifacts**: PNGs for manual review, JSON for programmatic analysis, Markdown for ticket docs.

### 7) API references for the Go implementation

If using Playwright for Go, the closest API equivalents are:
- `playwright.Run()` and `playwright.Chromium.Launch()`
- `browser.NewPage()`
- `page.Goto(url, playwright.PageGotoOptions{WaitUntil: ...})`
- `page.SetViewportSize(width, height)`
- `page.Evaluate(script, args)`
- `page.Screenshot(playwright.PageScreenshotOptions{Path: ..., FullPage: ...})`

If using chromedp:
- `chromedp.NewContext()`
- `chromedp.Navigate(url)`
- `chromedp.Evaluate(script, &out)`
- `chromedp.CaptureScreenshot(&buf)`

## Design Decisions

- **Use a driver abstraction** to avoid lock-in to a single automation library.
- **Make configuration file first-class** so the tool can run in any project without code changes.
- **Separate capture vs diff vs report** to keep responsibilities isolated and testable.
- **Preserve current output types** (PNG, JSON, Markdown) for continuity with docmgr workflows.
- **Adopt structured issue reporting** (presence, size mismatch, style mismatch).

## Workflow Support Features (Spec Requirements)

The following features are required to support the template-porting workflow and should be implemented as part of the sbcap spec (not optional add-ons):

1) **Selector coverage auditing**
   - Emit a dedicated coverage summary for selectors in the plan: matched, missing, hidden.
   - Classify missing cases (stale selector vs. element absent vs. visibility hidden).
   - Provide a strict mode to fail the run if required selectors are missing.

2) **Storybook story discovery**
   - Support querying `http://localhost:6006/index.json` (or a configured base URL).
   - Allow selecting stories by title/name rather than by hard-coded story ID.
   - Optionally validate that a configured story exists before capture begins.

3) **Matched-style diff summaries**
   - For key properties, show the winning selector in original vs React.
   - Include rule source (file and line, when available) to shorten debugging loops.
   - Present the diff as a compact table in Markdown and JSON.

## Alternatives Considered

- **Keep TypeScript scripts and wrap them** in a Go CLI. Rejected because it preserves the same hard-coded limitations and makes Go a thin wrapper.
- **Use a pixel-diff-only tool**. Rejected because pixel diffs lack the structural and computed-style diagnostics that made the current tooling valuable.
- **Single monolithic CLI without a library**. Rejected because reusability across projects requires a stable Go API.

## Implementation Plan

1. **Create Go module and CLI skeleton**
   - Add `cmd/sbcap` with Cobra or flag-based CLI.
   - Parse YAML config and validate.

2. **Implement browser driver abstraction**
   - Start with Playwright Go driver.
   - Provide a `BrowserDriver` interface and one concrete implementation.

3. **Port capture-sections**
   - Implement `captureSections` with deterministic viewport and waits.
   - Emit PNG artifacts to `output.dir`.

4. **Port compare-css**
   - Implement `GetElementInfo` via `Evaluate` JS snippet.
   - Diff key style properties and bounds.
   - Emit JSON results.

5. **Add integrated audit report**
   - Merge capture and style diff into a Markdown report.
   - Include summary counts and per-section issue lists.

6. **Add Storybook story discovery**
   - Implement `storybook.Index()` that consumes `http://localhost:6006/index.json`.
   - Allow `story` selection by title + name.

7. **Hardening and reuse**
   - Add retry and timeout options.
   - Add a `--dry-run` mode that validates selectors and URLs.
   - Provide example configs for multiple projects.

## Open Questions

- Should the Go tool depend on Playwright or chromedp as the default driver?
- Do we want to standardize output folder layout across repos or allow per-project conventions?
- Should we include pixel-level diffing in addition to computed-style diffing?
- Where should the tool live (monorepo tool folder vs standalone module)?

## References

- `ui/scripts/capture-sections.ts`
- `ui/scripts/compare-css.ts`
- `ui/scripts/compare-about-us.ts`
- `ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/01-storybook-screenshot-and-css-capture-tool-analysis.md`
