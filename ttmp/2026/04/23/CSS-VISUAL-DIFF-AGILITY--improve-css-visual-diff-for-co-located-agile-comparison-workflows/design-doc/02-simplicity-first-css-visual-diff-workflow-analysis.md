---
Title: Simplicity-first css-visual-diff workflow analysis
Ticket: CSS-VISUAL-DIFF-AGILITY
Status: active
Topics:
    - tooling
    - visual-regression
    - browser-automation
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: css-visual-diff/cmd/css-visual-diff/main.go
      Note: Current command surface and natural location for a new inspect command.
    - Path: css-visual-diff/internal/cssvisualdiff/modes/capture.go
      Note: Existing screenshot/prepared HTML/inspect JSON helpers that can be refactored for single-side inspect.
    - Path: css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go
      Note: Existing computed CSS evaluation logic that can be reused by inspect.
    - Path: css-visual-diff/internal/cssvisualdiff/modes/prepare.go
      Note: Existing prepare primitives that inspect should run before capturing artifacts.
    - Path: css-visual-diff/internal/cssvisualdiff/runner/runner.go
      Note: Current mode defaults and full-mode expansion
ExternalSources: []
Summary: 'A second analysis that reframes css-visual-diff around the smallest useful workflow: inspect one YAML-defined target/selector to get screenshot, HTML, and CSS artifacts; only then compare. It identifies what to keep, defer, cut, and consolidate from the current implementation.'
LastUpdated: 2026-04-24T00:00:00-04:00
WhatFor: Use this before implementing the broader agility roadmap when the goal is to reduce scope, improve iteration speed, and avoid overbuilding manifest/project/story/baseline/token infrastructure too early.
WhenToUse: Use when deciding the next implementation slice for css-visual-diff, especially if the team wants a minimal inspect-first command over a large new manifest framework.
---


# Simplicity-first css-visual-diff workflow analysis

## 1. Executive summary

The previous design document intentionally mapped a broad future direction: co-located manifests, project config, Storybook story mapping, prepare recipes, baseline caching, and token-aware CSS diagnostics. That direction is still valid, but it risks starting with too many abstractions before the day-to-day authoring loop is smooth.

A better next step is smaller:

> Given one `XXX.css-visual-diff.yml` file, provide a verb that captures **one side** and **one named region** and writes the three artifacts needed to debug the YAML: screenshot, prepared HTML, and computed CSS.

This changes the product center from “run a full comparison plan” to “make a selector/prepare/viewport correct first.” Once that works, comparison is just the next layer.

The recommended reframing is:

```text
inspect first, compare second, report third, automate later
```

The practical MVP is a new command, tentatively named `inspect`, that works against the current config schema before any new manifest/project config system exists:

```bash
css-visual-diff inspect \
  --config web/packages/pyxis-components/src/atoms/Button/button.css-visual-diff.yml \
  --side original \
  --name button-primary \
  --selector "[data-comp='button-primary'] button" \
  --props background-color,color,border-radius,height,padding,font-size,font-weight \
  --out .css-visual-diff/inspect/button-primary/original
```

or, using selectors/properties already declared in the YAML:

```bash
css-visual-diff inspect \
  --config web/packages/pyxis-components/src/atoms/Button/button.css-visual-diff.yml \
  --side react \
  --style button-primary \
  --out .css-visual-diff/inspect/button-primary/react
```

It should write:

```text
.css-visual-diff/inspect/button-primary/original/
├── screenshot.png
├── prepared.html
├── computed-css.json
├── computed-css.md
├── inspect.json        # optional DOM/tree summary, if requested
└── metadata.json
```

This is simple, effective, and directly addresses the user's stated iteration need: “take a `XXX.css-visual-diff.yml` page and have a verb to get the screenshot / html / css; that way we can iterate on a yml until it works.”

## 2. Current status of css-visual-diff right now

### 2.1 It is already a useful comparator engine

`css-visual-diff` currently has the essential browser automation pieces:

- a Cobra/Glazed CLI rooted at `cmd/css-visual-diff/main.go`, with commands `run`, `compare`, `llm-review`, `chromedp-probe`, and `script` (`cmd/css-visual-diff/main.go:257`, `cmd/css-visual-diff/main.go:279`);
- a YAML config model with `original`, `react`, `sections`, `styles`, `output`, and `modes` (`internal/cssvisualdiff/config/config.go:124`);
- target preparation through `script` and `direct-react-global` (`internal/cssvisualdiff/config/config.go:229`, `internal/cssvisualdiff/config/config.go:233`, `internal/cssvisualdiff/modes/prepare.go:40`, `internal/cssvisualdiff/modes/prepare.go:42`);
- capture mode that navigates, prepares, writes screenshots, prepared HTML, inspect JSON, and Markdown/JSON summary artifacts (`internal/cssvisualdiff/modes/capture.go:60`);
- computed CSS diff mode (`internal/cssvisualdiff/modes/cssdiff.go:57`);
- matched-styles/cascade winner inspection (`internal/cssvisualdiff/modes/matched_styles.go:127`);
- pixel diff mode that consumes `capture.json` (`internal/cssvisualdiff/modes/pixeldiff.go:38`);
- Storybook index listing mode (`internal/cssvisualdiff/modes/stories.go:33`);
- HTML report generation (`internal/cssvisualdiff/modes/html_report.go:29`).

The test suite currently passes with:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go test ./...
```

That means the starting point is not broken. The problem is not a lack of primitives; the problem is that the primitives are exposed in a way that makes the authoring loop too coarse.

### 2.2 The main user-facing workflow is too all-or-nothing

The current primary command is:

```bash
css-visual-diff run --config plan.yaml --modes capture,cssdiff,pixeldiff,html-report
```

The run command requires a full two-target config (`--config`) and one or more modes. It loads exactly one full config, normalizes modes, and then runs the selected modes sequentially (`cmd/css-visual-diff/main.go:107`, `cmd/css-visual-diff/main.go:110`, `cmd/css-visual-diff/main.go:120`, `cmd/css-visual-diff/main.go:141`).

That is fine once a plan works. It is awkward while the user is still answering basic questions:

- Did my prototype `prepare` run?
- Did it render into the root I expected?
- Is my `root_selector` correct?
- Is my section selector correct?
- What HTML did the browser actually see after prepare?
- What computed CSS values did this one element have?
- Is the problem in the original side or the React side?

Currently, answering those questions often means running a broad capture or comparison and then opening generated files. That is too indirect.

### 2.3 The code already contains most of what `inspect` needs

The proposed `inspect` command does not require a new browser engine. It can reuse existing internal pieces:

- `config.Load` and `Config.Validate` for the current YAML shape.
- `driver.NewBrowser`, `Browser.NewPage`, `Page.SetViewport`, `Page.Goto`, `Page.Screenshot`, `Page.Evaluate` from the chromedp wrapper.
- `prepareTarget` from `modes/prepare.go`.
- `rootSelectorForTarget`, `selectorForSection`, and style selector logic from capture/cssdiff code.
- `writePreparedHTML` and `writeInspectJSON` from capture code, after making them reusable or moving them to a shared package.
- `evaluateStyle` from cssdiff code, after exporting/refactoring it into a reusable “inspect style” function.

So the first useful simplification is mostly a **refactor and CLI addition**, not a new architecture.

## 3. What should be consolidated, cut, deferred, or reframed

### 3.1 Keep as core

Keep these as the core product:

1. **YAML-defined browser target**
   - URL, viewport, wait, root selector, prepare.
   - This is the heart of the tool.

2. **Inspect/capture one side**
   - Screenshot.
   - Prepared HTML.
   - Computed CSS.
   - Optional DOM inspect JSON.

3. **Compare two sides**
   - Pixel comparison.
   - Computed CSS differences.
   - Basic Markdown/HTML report.

4. **Prepare primitives**
   - `script` and `direct-react-global` are already valuable.
   - Do not block the MVP on higher-level recipes.

5. **Plain file outputs**
   - PNG, HTML, JSON, Markdown.
   - These artifacts are easy to inspect and easy to upload/share.

### 3.2 Reframe as advanced diagnostics, not default workflow

These features are useful but should not define the first authoring loop:

1. **Matched styles**
   - Keep it, but make it an opt-in diagnostic: “Why did this computed value win?”
   - Do not require it for every quick inspect.

2. **AI review / LLM review**
   - Keep as an advanced command, but do not include it in any “full” default used by normal development.
   - It brings profile/bootstrap complexity and token/cost concerns.

3. **Storybook discovery**
   - Reframe from a comparison mode into a helper command: `storybook list` or `stories`.
   - Its job is to resolve story IDs, not to be part of every visual diff run.

4. **HTML report**
   - Keep as “publish/share after the artifacts exist.”
   - Do not make users run a report just to debug a selector.

### 3.3 Defer

Defer these until the inspect-first loop is excellent:

1. **Project-level config discovery**
   - Useful, but not required to inspect one YAML.
   - A single file can be self-contained at first.

2. **Automatic Storybook variant expansion**
   - Useful, but easy to overbuild.
   - Start with explicit story IDs/URLs in YAML.

3. **Baseline caching**
   - Good optimization, but only after the outputs and cache boundaries are stable.
   - It should not be the first change.

4. **Token-aware CSS diffing**
   - Highly valuable, but it depends on having clean CSS extraction and, ideally, matched winner annotations.
   - Add after `inspect` can reliably dump computed CSS for a single selector.

5. **Service orchestration**
   - Starting Storybook/prototype servers from the CLI sounds convenient, but it adds process lifecycle complexity.
   - For now, fail clearly if URLs are unavailable.

### 3.4 Consider cutting or hiding from the main help path

These may remain in code, but the main user story should not foreground them:

1. **The embedded `script` command group**
   - It may be useful for internal DSL experiments, but it is not part of the visual diff authoring loop.
   - Consider hiding it, moving it under `experimental`, or leaving it undocumented for normal users.

2. **`full` mode including `ai-review`**
   - The runner currently expands `full` to include `ai-review` (`internal/cssvisualdiff/runner/runner.go:30`). That is surprising and expensive for a normal full visual diff.
   - Reframe `full` as local deterministic modes only: `capture,pixeldiff,cssdiff,matched-styles,html-report`.
   - Add `full-ai` or explicit `ai-review` if needed.

3. **Central examples as the primary UX**
   - Keep examples for tests/reference.
   - Do not make users copy a giant file into `examples/` as their main workflow.

## 4. Recommended new mental model

### 4.1 Old mental model

```text
Write a full two-target comparison config.
Run all modes.
Open a big report.
Infer which selector/prepare/CSS piece failed.
```

### 4.2 New mental model

```text
Inspect one side until the YAML is correct.
Inspect the other side until the YAML is correct.
Compare the two inspected regions.
Generate/share a report only when useful.
```

### 4.3 Why this is better

The YAML author usually fails in predictable small ways:

- wrong URL,
- Storybook not ready,
- prepare wait expression wrong,
- prepare script throws,
- selector misses,
- root selector captures too much chrome,
- viewport too small,
- style props list missing the useful property.

A single-side `inspect` command turns each of those into a tight feedback loop.

## 5. The small-step MVP

### 5.1 Add `inspect`

Proposed command:

```bash
css-visual-diff inspect --config FILE --side original|react [flags]
```

Useful flags:

```text
--config FILE             Existing css-visual-diff YAML config. Required.
--side original|react      Which target to inspect. Required.
--section NAME             Use selector from sections[] by name.
--style NAME               Use selector and props from styles[] by name.
--selector CSS             Override selector directly.
--props CSV                CSS properties to read. Defaults to style props or a small default list.
--root                     Inspect target root selector instead of a section/style selector.
--out DIR                  Output directory.
--write-screenshot         Default true.
--write-html               Default true.
--write-css                Default true.
--write-inspect-json       Default false or true, depending on desired verbosity.
--open                     Optional: open screenshot/report after writing.
```

Example: debug original prepare/root:

```bash
css-visual-diff inspect \
  --config pyxis-atoms.css-visual-diff.yml \
  --side original \
  --root \
  --out .css-visual-diff/inspect/atoms/original-root
```

Example: debug one section selector:

```bash
css-visual-diff inspect \
  --config pyxis-atoms.css-visual-diff.yml \
  --side original \
  --section button-primary \
  --out .css-visual-diff/inspect/button-primary/original
```

Example: debug one CSS style selector:

```bash
css-visual-diff inspect \
  --config pyxis-atoms.css-visual-diff.yml \
  --side react \
  --style button-primary \
  --props background-color,color,border-radius,height,padding,font-size,font-weight \
  --out .css-visual-diff/inspect/button-primary/react
```

### 5.2 Output contract

For every inspect run, write predictable files:

```text
out/
├── metadata.json
├── screenshot.png
├── prepared.html
├── computed-css.json
├── computed-css.md
└── inspect.json
```

`metadata.json`:

```json
{
  "config": "pyxis-atoms.css-visual-diff.yml",
  "side": "original",
  "target_name": "pyxis-prototype-atoms",
  "url": "http://localhost:7070/Pyxis%20Public%20Site.html",
  "viewport": { "width": 1200, "height": 1200 },
  "selector": "[data-comp='button-primary'] button",
  "selector_source": "styles[button-primary]",
  "root_selector": "#atom-capture-root",
  "prepare_type": "script",
  "created_at": "2026-04-24T00:00:00Z"
}
```

`computed-css.json`:

```json
{
  "exists": true,
  "visible": true,
  "bounds": { "x": 154, "y": 82, "width": 112, "height": 40 },
  "computed": {
    "background-color": "rgb(200, 39, 13)",
    "color": "rgb(255, 255, 255)",
    "border-radius": "8px",
    "height": "40px",
    "padding": "8px 16px",
    "font-size": "13px",
    "font-weight": "600"
  },
  "attributes": {
    "class": "pyxis-button pyxis-button--primary"
  }
}
```

`computed-css.md`:

```markdown
# CSS Inspect: button-primary / original

Selector: `[data-comp='button-primary'] button`

| Property | Value |
| --- | --- |
| background-color | rgb(200, 39, 13) |
| color | rgb(255, 255, 255) |
| border-radius | 8px |
| height | 40px |
| padding | 8px 16px |
```

### 5.3 Minimal implementation sketch

```go
type InspectSettings struct {
    Config string `glazed:"config"`
    Side string `glazed:"side"`
    Section string `glazed:"section"`
    Style string `glazed:"style"`
    Selector string `glazed:"selector"`
    Props string `glazed:"props"`
    Root bool `glazed:"root"`
    Out string `glazed:"out"`
    WriteScreenshot bool `glazed:"write-screenshot"`
    WriteHTML bool `glazed:"write-html"`
    WriteCSS bool `glazed:"write-css"`
    WriteInspectJSON bool `glazed:"write-inspect-json"`
}

func RunInspect(ctx context.Context, s InspectSettings) error {
    cfg, err := config.Load(s.Config)
    if err != nil { return err }

    target, prefix, err := selectTarget(cfg, s.Side)
    if err != nil { return err }

    selector, props, source, err := resolveInspectSelector(cfg, prefix, s)
    if err != nil { return err }

    browser, err := driver.NewBrowser(ctx)
    if err != nil { return err }
    defer browser.Close()

    page, err := browser.NewPage()
    if err != nil { return err }
    defer page.Close()

    page.SetViewport(target.Viewport.Width, target.Viewport.Height)
    page.Goto(target.URL)
    if target.WaitMS > 0 { page.Wait(time.Duration(target.WaitMS) * time.Millisecond) }
    if err := prepareTarget(page, target); err != nil { return err }

    os.MkdirAll(s.Out, 0o755)

    if s.WriteHTML {
        writePreparedHTML(page, rootOrSelector(target, selector, s.Root), filepath.Join(s.Out, "prepared.html"))
    }
    if s.WriteScreenshot {
        page.Screenshot(rootOrSelector(target, selector, s.Root), filepath.Join(s.Out, "screenshot.png"))
    }
    if s.WriteCSS {
        snap, err := evaluateStyle(page, config.StyleSpec{Selector: selector, Props: props, IncludeBounds: true, Attributes: []string{"id", "class"}})
        if err != nil { return err }
        writeJSON(filepath.Join(s.Out, "computed-css.json"), snap)
        writeComputedCSSMarkdown(filepath.Join(s.Out, "computed-css.md"), snap)
    }

    return writeInspectMetadata(...)
}
```

This intentionally reuses the current config. No project config. No Storybook resolver. No baseline cache. No token parser.

## 6. YAML shape for the first step

### 6.1 Do not invent a new schema first

For the first `inspect` command, use the current schema. A co-located file can still be named `button.css-visual-diff.yml`, but internally it can be a normal current `Config`:

```yaml
metadata:
  slug: pyxis-button-primary
  title: Pyxis Button primary — prototype vs Storybook

original:
  name: pyxis-prototype
  url: http://localhost:7070/Pyxis%20Public%20Site.html
  wait_ms: 1000
  viewport: { width: 1200, height: 300 }
  root_selector: "#atom-capture-root"
  prepare:
    type: script
    wait_for: "window.React && window.ReactDOM && window.Btn"
    script: |
      document.body.innerHTML = '<div id="atom-capture-root"></div>';
      const e = window.React.createElement;
      const root = document.getElementById('atom-capture-root');
      window.ReactDOM.createRoot(root).render(
        e('span', { 'data-comp': 'button-primary' },
          e(window.Btn, { variant: 'primary', iconRight: 'chev' }, 'Get tickets')
        )
      );
    after_wait_ms: 500

react:
  name: pyxis-storybook-button
  url: http://localhost:6006/iframe.html?id=atoms-button--default&viewMode=story
  wait_ms: 1000
  viewport: { width: 1200, height: 300 }
  root_selector: "#storybook-root"

sections:
  - name: button-primary
    selector_original: "[data-comp='button-primary'] button"
    selector_react: "button"

styles:
  - name: button-primary
    selector_original: "[data-comp='button-primary'] button"
    selector_react: "button"
    include_bounds: true
    props: [height, padding, background-color, color, border, border-radius, font-size, font-weight, line-height, gap]

output:
  dir: ./.css-visual-diff/out/button-primary
  write_json: true
  write_markdown: true
  write_pngs: true
  write_prepared_html: true
  write_inspect_json: true
  validate_pngs: true

modes: [capture, cssdiff, pixeldiff, html-report]
```

This is not as elegant as the future manifest syntax, but it gives immediate value:

- The file can be co-located now.
- The new command can inspect either side now.
- Users can iterate on `prepare`, `root_selector`, `sections`, and `styles` now.

### 6.2 Then add syntactic sugar later

Only after the inspect loop works should the team add shorthand manifests like:

```yaml
prototype:
  prepare: atom-fixture
  selector: "[data-comp='button-primary'] button"
storybook:
  story: atoms-button--default
compare:
  props: [background-color, color, border-radius, height, padding, font-size, font-weight]
```

The shorthand should compile into the current config shape. This keeps the runtime stable.

## 7. Proposed command consolidation

### 7.1 Simple command set

For normal users, the product can become four verbs:

```text
inspect   Capture screenshot/html/css for one side and selector.
compare   Compare two sides/selectors from a YAML file or direct URLs.
report    Build or serve an HTML report from an output directory.
stories   List/resolve Storybook stories.
```

Existing commands map into this:

| Current command/mode | Proposed framing |
| --- | --- |
| `run --modes capture` | `inspect` for one side, `compare` setup for both sides |
| `run --modes cssdiff` | part of `compare` |
| `run --modes pixeldiff` | part of `compare` |
| `run --modes matched-styles` | `inspect --matched` or `compare --matched` advanced diagnostic |
| `run --modes html-report` | `report build` |
| `story-discovery` mode | `stories list` |
| `llm-review` | `review` or advanced explicit command, never default |
| `chromedp-probe` | `doctor browser` or debug command |
| `script` | `experimental script` or hidden |

### 7.2 Keep `run` as compatibility

Do not remove `run`. It is useful for automation and existing configs. But documentation should stop presenting `run --modes full` as the first thing a human uses.

Recommended docs order:

1. `inspect` one side.
2. `inspect` the other side.
3. `compare` the YAML-defined pair.
4. `report` the output directory.
5. Advanced: matched styles, Storybook resolver, AI review.

## 8. What to simplify in the current code

### 8.1 Extract side-level capture

Current capture code has the useful function `captureTarget`, but it is private and embedded in a two-sided `RunCapture` flow. Refactor it into an explicit reusable unit:

```go
func CaptureTarget(browser *driver.Browser, target config.Target, sections []config.SectionSpec, output config.OutputSpec, prefix string) (PageResult, []ValidationResult, error)
```

Then `RunCapture` remains a thin wrapper:

```go
func RunCapture(ctx context.Context, cfg *config.Config) error {
    browser := driver.NewBrowser(ctx)
    original := CaptureTarget(browser, cfg.Original, cfg.Sections, cfg.Output, "original")
    react := CaptureTarget(browser, cfg.React, cfg.Sections, cfg.Output, "react")
    return WriteCaptureResult(cfg.Output, original, react)
}
```

`inspect` can use the same lower-level navigation/prepare/screenshot logic without pretending to be a full comparison.

### 8.2 Extract style inspection

Current CSS diff code has `evaluateStyle`, but it is private and tied to comparing original/react pages. Introduce a reusable style inspector:

```go
type InspectStyleOptions struct {
    Selector string
    Props []string
    Attributes []string
    IncludeBounds bool
}

func InspectStyle(page *driver.Page, opts InspectStyleOptions) (StyleSnapshot, error)
```

Then `CSSDiff` uses it twice; `inspect` uses it once.

### 8.3 Extract artifact writers

Move these helpers into a small artifact package or keep them in `modes` but export narrowly:

- write screenshot,
- write prepared HTML,
- write inspect JSON,
- write computed CSS Markdown,
- write metadata JSON.

Avoid inventing a large artifact framework. Just make shared helpers obvious.

### 8.4 Make mode dependencies explicit

Pixel diff currently depends on `capture.json`. HTML report depends on whichever JSON files exist. That is okay, but users should see it clearly.

For command help:

```text
pixeldiff requires capture artifacts.
html-report reads existing artifacts and does not capture by itself.
```

### 8.5 Reduce surprising defaults

The current `defaultModes` are `capture,cssdiff` (`runner.go:28`). That is reasonable for automation, but for humans the default should depend on command:

- `inspect`: screenshot + HTML + computed CSS for one selector.
- `compare`: capture + cssdiff + pixeldiff, no AI.
- `report`: html-report only.
- `run`: preserve existing default for compatibility.

## 9. A smaller roadmap than the previous document

### Step 1: Add `inspect` using current config

Deliverables:

- `css-visual-diff inspect --config FILE --side original|react`.
- Supports `--root`, `--section NAME`, `--style NAME`, `--selector CSS`, and `--props`.
- Writes screenshot, prepared HTML, computed CSS JSON/Markdown, metadata JSON.

Why first:

- It directly supports YAML iteration.
- It reuses current schema and runtime.
- It teaches users what the browser actually sees.

### Step 2: Make co-located current-schema files normal

Document that a `XXX.css-visual-diff.yml` file can be a normal current config. No discovery needed yet.

Example:

```bash
css-visual-diff inspect --config Button/button-primary.css-visual-diff.yml --side original --style button-primary
css-visual-diff inspect --config Button/button-primary.css-visual-diff.yml --side react --style button-primary
css-visual-diff run --config Button/button-primary.css-visual-diff.yml --modes capture,cssdiff,pixeldiff,html-report
```

This alone moves the workflow out of `examples/` and into component directories.

### Step 3: Add `compare --config`

The existing `compare` command compares direct URLs and selectors. Add a config-aware mode:

```bash
css-visual-diff compare --config Button/button-primary.css-visual-diff.yml --style button-primary
```

It can use the same generated output format as `run --modes capture,cssdiff,pixeldiff` but scoped to one style/section. This is much faster and easier to debug than running all sections in a large plan.

### Step 4: Add `discover` only as a file lister

Keep discovery very simple at first:

```bash
css-visual-diff discover --root web/packages/pyxis-components
```

It should only list `*.css-visual-diff.yml` files and run `config.Load` validation. Do not compile shorthand manifests yet.

### Step 5: Add tiny shorthand manifest only after current-schema flow feels good

Once the inspect/compare loop is pleasant, introduce a shorthand manifest compiler. At that point the team will know which fields are actually repetitive.

### Step 6: Add recipes, then Storybook resolver, then baseline cache, then token-aware reports

Recommended order:

1. Prepare recipes: reduce copied prepare scripts.
2. Storybook resolver: reduce copied iframe URLs.
3. Baseline cache: optimize after output layout is stable.
4. Token-aware reports: improve diagnostics after CSS extraction is reliable.

## 10. A concrete “small first PR” plan

### PR title

```text
Add inspect command for single-side screenshot/html/css artifacts
```

### Files likely touched

- `cmd/css-visual-diff/main.go`
- `internal/cssvisualdiff/modes/capture.go`
- `internal/cssvisualdiff/modes/cssdiff.go`
- new `internal/cssvisualdiff/modes/inspect.go` or `internal/cssvisualdiff/inspect/inspect.go`
- tests under `internal/cssvisualdiff/modes` or new inspect package
- `README.md`

### Tasks

1. Define `InspectSettings` and `newInspectCommand()`.
2. Add selector resolution:
   - `--root` -> target root selector.
   - `--section` -> section selector for selected side.
   - `--style` -> style selector and props for selected side.
   - `--selector` -> direct override.
3. Add single-side browser flow:
   - set viewport,
   - navigate,
   - wait,
   - prepare,
   - write artifacts.
4. Add Markdown writer for computed CSS.
5. Add tests for selector resolution and props resolution without browser.
6. Add one README section: “Debug a YAML before comparing.”

### Non-goals for first PR

- No new shorthand YAML schema.
- No Storybook index resolver.
- No baseline cache.
- No token matching.
- No service startup.
- No AI review changes except possibly documenting that it is advanced.

## 11. Example implementation details

### 11.1 Selector resolution

```go
func ResolveInspectRequest(cfg *config.Config, side string, req InspectRequest) (ResolvedInspect, error) {
    prefix := side
    if prefix != "original" && prefix != "react" {
        return ResolvedInspect{}, fmt.Errorf("--side must be original or react")
    }

    target := cfg.Original
    if side == "react" { target = cfg.React }

    if req.Root {
        selector := rootSelectorForTarget(target)
        if selector == "" { return error("target has no root_selector") }
        return ResolvedInspect{Target: target, Selector: selector, Props: defaultProps(), Source: "root"}, nil
    }

    if req.Section != "" {
        section, ok := findSection(cfg.Sections, req.Section)
        if !ok { return helpfulMissingSectionError(cfg.Sections, req.Section) }
        return ResolvedInspect{Target: target, Selector: selectorForSection(section, prefix), Props: defaultProps(), Source: "section"}, nil
    }

    if req.Style != "" {
        style, ok := findStyle(cfg.Styles, req.Style)
        if !ok { return helpfulMissingStyleError(cfg.Styles, req.Style) }
        selector := selectorForStyle(style, prefix)
        props := style.Props
        if len(req.Props) > 0 { props = req.Props }
        return ResolvedInspect{Target: target, Selector: selector, Props: props, Source: "style"}, nil
    }

    if req.Selector != "" {
        return ResolvedInspect{Target: target, Selector: req.Selector, Props: req.PropsOrDefault(), Source: "flag"}, nil
    }

    return error("provide one of --root, --section, --style, or --selector")
}
```

### 11.2 Helpful failures

If a selector does not exist, write enough information to debug:

```text
selector not found after prepare
  config: Button/button-primary.css-visual-diff.yml
  side: original
  selector: [data-comp='button-primary'] button
  source: styles[button-primary].selector_original
  url: http://localhost:7070/Pyxis%20Public%20Site.html
  prepare: script

Artifacts written before failure:
  prepared HTML: .css-visual-diff/inspect/.../prepared.html

Next checks:
  1. Open prepared.html and search for data-comp="button-primary".
  2. Run with --root to inspect the capture root.
  3. Check prepare.wait_for and prepare.script/script_file.
```

The command should write prepared HTML even if the selector screenshot fails. This is the main reason `inspect` will be effective.

## 12. How this changes the broader roadmap

The broad roadmap still exists, but the priority changes:

| Previous emphasis | Simplicity-first reframing |
| --- | --- |
| Build manifest/project compiler early. | First make current-schema YAML easy to debug one side at a time. |
| Discover co-located manifests and run many. | First run one explicit file well. Discover later. |
| Add Storybook story mapping. | First accept explicit Storybook iframe URL. Resolve IDs later. |
| Add prepare recipes. | First make prepare failures visible through prepared HTML and root screenshots. Recipes later reduce repetition. |
| Add baseline caching. | First stabilize output layout and single-side capture. Cache later. |
| Add token-aware CSS diff. | First make computed CSS extraction pleasant. Token annotations later. |

This avoids building a framework around a workflow whose smallest interaction is not yet good.

## 13. Recommended documentation rewrite

The README should lead with:

```markdown
## Debug one side first

Before comparing two pages, make sure each side renders the element you think it renders.

css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --style button-primary

Open:
- screenshot.png
- prepared.html
- computed-css.md

When both sides look right:

css-visual-diff run --config Button/button.css-visual-diff.yml --modes capture,cssdiff,pixeldiff,html-report
```

This would immediately make the tool easier to teach.

## 14. Decision recommendations

### Decision 1: Start with `inspect`, not manifests

Accept `XXX.css-visual-diff.yml` naming, but let the file use the current schema. This gives co-location without schema work.

### Decision 2: Make screenshot/html/css the first-class artifact trio

Every single-side debug run should produce these by default. They answer most authoring questions.

### Decision 3: Keep comparison deterministic by default

Do not include AI review in default/full paths. Make it explicit.

### Decision 4: Make advanced features layers, not prerequisites

Recipes, Storybook resolution, baselines, and token-aware reports should layer onto the inspect/compare/report core.

### Decision 5: Prefer clear errors over orchestration

For now, do not start Storybook or prototype servers. Tell the user what URL failed and what to run.

## 15. Final recommendation

The next `css-visual-diff` improvement should be the smallest loop that changes the user's daily experience:

```bash
css-visual-diff inspect --config XXX.css-visual-diff.yml --side original --style NAME
css-visual-diff inspect --config XXX.css-visual-diff.yml --side react --style NAME
```

If those two commands make it obvious what the browser rendered, what HTML exists, and what CSS values were computed, then all future features become safer:

- co-located files are easier to author,
- recipes are easier to validate,
- Storybook mapping is easier to debug,
- baseline caching has stable artifact boundaries,
- token-aware CSS reports have a clean source of computed values.

This is the right simplification point: it does not throw away the existing comparator; it exposes the comparator's most useful internal step as a direct, human-friendly verb.

## 16. References

- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/config/config.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/runner/runner.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/capture.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/prepare.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/matched_styles.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/pixeldiff.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/stories.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/html_report.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/examples/pyxis-atoms-prototype-vs-storybook.yaml`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/examples/pyxis-storybook-shows-desktop.yaml`
