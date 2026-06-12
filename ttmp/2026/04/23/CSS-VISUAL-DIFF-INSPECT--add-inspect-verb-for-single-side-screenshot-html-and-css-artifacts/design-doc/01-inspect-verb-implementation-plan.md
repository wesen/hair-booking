---
Title: Inspect verb implementation plan
Ticket: CSS-VISUAL-DIFF-INSPECT
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
      Note: CLI entrypoint where the inspect command should be registered.
    - Path: css-visual-diff/internal/cssvisualdiff/config/config.go
      Note: Existing config schema with multiple sections/styles that inspect should reuse.
    - Path: css-visual-diff/internal/cssvisualdiff/modes/capture.go
      Note: Existing screenshot/prepared HTML/inspect JSON behavior to refactor for inspect.
    - Path: css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go
      Note: Existing computed CSS style evaluation behavior to reuse for inspect.
    - Path: css-visual-diff/internal/cssvisualdiff/modes/prepare.go
      Note: Existing prepare hook execution that inspect must run before writing artifacts.
ExternalSources: []
Summary: Implementation plan for adding a css-visual-diff inspect verb that reads the existing --config YAML, selects one side and one or more section/style selectors, and outputs screenshot, prepared HTML, computed CSS, inspect JSON, or a single requested artifact file.
LastUpdated: 2026-04-24T01:17:00-04:00
WhatFor: Use this to implement the first small inspect-first workflow for debugging css-visual-diff YAML files before running full comparisons.
WhenToUse: Use before editing css-visual-diff CLI, capture helpers, cssdiff style evaluation, or artifact output behavior for the inspect command.
---


# Inspect verb implementation plan

## 1. Executive summary

This ticket implements the first small step from the simplicity-first roadmap: add a `css-visual-diff inspect` verb that reads an existing `--config` YAML file, chooses `original` or `react`, prepares that target, and writes inspection artifacts for one or more selectors.

The immediate goal is to let users iterate on `XXX.css-visual-diff.yml` files before running a full two-sided comparison. The command should answer:

- Did the URL load?
- Did the prepare hook run?
- What HTML exists after prepare?
- Does this selector match?
- What does the selected element look like?
- What are its computed CSS values?

The command should also support outputting a **single file** directly, for scriptable workflows:

```bash
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary --format png --output-file /tmp/button.png
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --style button-primary --format css --output-file /tmp/button.css.md
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --root --format html --output-file /tmp/prepared.html
```

## 2. Answer: can one YAML file contain multiple selectors today?

Yes. The current `--config` YAML already supports multiple selectors in two arrays:

```go
type Config struct {
    Sections []SectionSpec `yaml:"sections"`
    Styles   []StyleSpec   `yaml:"styles"`
}
```

Evidence:

- `internal/cssvisualdiff/config/config.go:124` defines `Config`.
- `internal/cssvisualdiff/config/config.go:128` defines `Sections []SectionSpec`.
- `internal/cssvisualdiff/modes/cssdiff.go:112` loops over `cfg.Styles`.
- `examples/pyxis-atoms-prototype-vs-storybook.yaml:30` has many `sections`.
- `examples/pyxis-atoms-prototype-vs-storybook.yaml:54` has many `styles`.

Practically, a single `XXX.css-visual-diff.yml` can already contain:

```yaml
sections:
  - name: button-primary
    selector_original: "[data-comp='button-primary'] button"
    selector_react: "button"
  - name: icon
    selector_original: "[data-comp='button-primary'] svg"
    selector_react: "button svg"

styles:
  - name: button-primary
    selector_original: "[data-comp='button-primary'] button"
    selector_react: "button"
    props: [height, padding, background-color, color, border-radius]
  - name: icon
    selector_original: "[data-comp='button-primary'] svg"
    selector_react: "button svg"
    props: [width, height, color, stroke-width]
```

The new `inspect` verb should exploit this instead of inventing a new schema immediately. It should let users pick:

```bash
--section button-primary
--style button-primary
--all-sections
--all-styles
```

## 3. Proposed command shape

### 3.1 Directory-output mode

Default mode writes an artifact directory:

```bash
css-visual-diff inspect \
  --config Button/button.css-visual-diff.yml \
  --side original \
  --style button-primary \
  --out .css-visual-diff/inspect/button-primary/original
```

Default artifacts:

```text
out/
├── metadata.json
├── screenshot.png
├── prepared.html
├── computed-css.json
├── computed-css.md
└── inspect.json
```

### 3.2 Single-file mode

If `--output-file` is provided, write only the requested artifact type unless the command needs a temporary debug artifact after failure.

```bash
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary --format png --output-file button.png
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary --format html --output-file prepared.html
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary --format css-json --output-file computed-css.json
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary --format css-md --output-file computed-css.md
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side original --style button-primary --format inspect-json --output-file inspect.json
```

Recommended `--format` values:

| Format | Output |
| --- | --- |
| `bundle` | directory with all default artifacts; default when `--output-file` is omitted |
| `png` | selected element/root screenshot |
| `html` | prepared HTML for root or selected element |
| `css-json` | computed CSS JSON |
| `css-md` | computed CSS Markdown table |
| `inspect-json` | DOM/tree inspect JSON |
| `metadata-json` | metadata only |

Alias `css` may mean `css-md` for human-readable output, but implementation should prefer explicit `css-json` and `css-md`.

### 3.3 Artifact-specific verbs for selector fine-tuning

Yes: add small artifact-specific verbs as friendly wrappers around `inspect --format ... --output-file ...`. These should exist because selector tuning is often a tight shell loop where the user wants exactly one artifact, not a directory bundle.

Recommended command shape:

```bash
# One screenshot file for checking crop/selector/root behavior.
css-visual-diff screenshot \
  --config Button/button.css-visual-diff.yml \
  --side react \
  --region button-primary \
  --output-file /tmp/button.png

# One computed CSS Markdown file for checking selected properties.
css-visual-diff css-md \
  --config Button/button.css-visual-diff.yml \
  --side react \
  --region button-primary \
  --css button \
  --output-file /tmp/button-css.md

# One computed CSS JSON file for scripts.
css-visual-diff css-json \
  --config Button/button.css-visual-diff.yml \
  --side react \
  --style button-primary \
  --output-file /tmp/button-css.json

# One prepared HTML file for debugging prepare/DOM/selector misses.
css-visual-diff html \
  --config Button/button.css-visual-diff.yml \
  --side original \
  --root \
  --output-file /tmp/original-prepared.html

# One DOM inspect JSON file for structured selector/debug tooling.
css-visual-diff inspect-json \
  --config Button/button.css-visual-diff.yml \
  --side react \
  --region button-primary \
  --output-file /tmp/button-inspect.json
```

These verbs should share the same selector flags as `inspect`:

```text
--root
--section NAME        # current low-level schema
--style NAME          # current low-level schema
--region NAME         # future merged authoring schema
--css NAME            # future CSS probe inside --region
--selector CSS
--props CSV
--attrs CSV
```

Implementation rule: do not duplicate browser logic in each verb. Implement one internal `RunInspectArtifact(format, settings)` function and make these verbs call it with fixed formats:

| Verb | Equivalent |
| --- | --- |
| `screenshot` | `inspect --format png --output-file FILE` |
| `css-md` | `inspect --format css-md --output-file FILE` |
| `css-json` | `inspect --format css-json --output-file FILE` |
| `html` | `inspect --format html --output-file FILE` |
| `inspect-json` | `inspect --format inspect-json --output-file FILE` |
| `metadata-json` | `inspect --format metadata-json --output-file FILE` |

This gives both interfaces:

```bash
# General interface.
css-visual-diff inspect --config file.yml --side react --style button --format png --output-file /tmp/button.png

# Fast selector-tuning interface.
css-visual-diff screenshot --config file.yml --side react --style button --output-file /tmp/button.png
```

The artifact-specific verbs should require `--output-file` in the first version. Directory/bundle output remains the job of `inspect`.

### 3.4 Selector selection flags

Exactly one of these should be required unless `--all-sections` or `--all-styles` is used:

```text
--root                  inspect target root selector
--section NAME          inspect one entry from sections[]
--style NAME            inspect one entry from styles[]; also supplies props
--selector CSS          inspect direct selector override
--all-sections          inspect every section in config
--all-styles            inspect every style in config
```

For multiple selectors:

```bash
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --all-styles --out .css-visual-diff/inspect/Button/react
```

Output layout for multiple selectors:

```text
out/
├── index.json
├── index.md
├── button-primary/
│   ├── screenshot.png
│   ├── prepared.html
│   ├── computed-css.json
│   └── computed-css.md
└── icon/
    ├── screenshot.png
    ├── prepared.html
    ├── computed-css.json
    └── computed-css.md
```

Single-file mode should reject multi-selector options unless a later format like `zip` or combined Markdown is added.

## 4. Implementation design

### 4.1 Keep current YAML schema

Do not add a new manifest schema in this ticket. The file may be named `XXX.css-visual-diff.yml`, but it should load through the existing `config.Load` path.

### 4.2 Reuse current primitives

Current code already has most of the needed behavior:

- config loading: `internal/cssvisualdiff/config/config.go`
- browser wrapper: `internal/cssvisualdiff/driver/chrome.go`
- prepare execution: `internal/cssvisualdiff/modes/prepare.go`
- screenshot/prepared HTML/inspect JSON helpers: `internal/cssvisualdiff/modes/capture.go`
- computed style evaluation: `internal/cssvisualdiff/modes/cssdiff.go`
- CLI registration: `cmd/css-visual-diff/main.go`

### 4.3 Suggested types

```go
type InspectSettings struct {
    Config string `glazed:"config"`
    Side string `glazed:"side"`

    Root bool `glazed:"root"`
    Section string `glazed:"section"`
    Style string `glazed:"style"`
    Selector string `glazed:"selector"`
    AllSections bool `glazed:"all-sections"`
    AllStyles bool `glazed:"all-styles"`

    Props string `glazed:"props"`
    Attrs string `glazed:"attrs"`

    Out string `glazed:"out"`
    Format string `glazed:"format"`
    OutputFile string `glazed:"output-file"`
}

type InspectRequest struct {
    Name string
    Selector string
    Props []string
    Attributes []string
    Source string // root, section, style, flag
}

type InspectResult struct {
    Metadata InspectMetadata `json:"metadata"`
    Style modes.StyleSnapshot `json:"style,omitempty"`
    Screenshot string `json:"screenshot,omitempty"`
    PreparedHTML string `json:"prepared_html,omitempty"`
    InspectJSON string `json:"inspect_json,omitempty"`
}
```

### 4.4 Selector resolution pseudocode

```go
func BuildInspectRequests(cfg *config.Config, side string, s InspectSettings) ([]InspectRequest, error) {
    selected := count(s.Root, s.Section != "", s.Style != "", s.Selector != "", s.AllSections, s.AllStyles)
    if selected != 1 {
        return nil, fmt.Errorf("provide exactly one of --root, --section, --style, --selector, --all-sections, --all-styles")
    }

    prefix := side // original or react

    switch {
    case s.Root:
        target := targetForSide(cfg, side)
        selector := rootSelectorForTarget(target)
        return []InspectRequest{{Name: "root", Selector: selector, Props: propsFromFlagOrDefault(s.Props), Source: "root"}}, nil

    case s.Section != "":
        section := findSection(cfg.Sections, s.Section)
        selector := selectorForSection(section, prefix)
        return []InspectRequest{{Name: section.Name, Selector: selector, Props: propsFromFlagOrDefault(s.Props), Source: "section"}}, nil

    case s.Style != "":
        style := findStyle(cfg.Styles, s.Style)
        selector := selectorForStyle(style, prefix)
        props := style.Props
        if s.Props != "" { props = parseCSV(s.Props) }
        return []InspectRequest{{Name: style.Name, Selector: selector, Props: props, Attributes: style.Attributes, Source: "style"}}, nil

    case s.Selector != "":
        return []InspectRequest{{Name: "selector", Selector: s.Selector, Props: propsFromFlagOrDefault(s.Props), Source: "flag"}}, nil

    case s.AllSections:
        return requestsForAllSections(cfg.Sections, prefix, s), nil

    case s.AllStyles:
        return requestsForAllStyles(cfg.Styles, prefix, s), nil
    }
}
```

### 4.5 Browser flow pseudocode

```go
func RunInspect(ctx context.Context, s InspectSettings) error {
    cfg, err := config.Load(s.Config)
    if err != nil { return err }

    target := targetForSide(cfg, s.Side)
    requests, err := BuildInspectRequests(cfg, s.Side, s)
    if err != nil { return err }

    if s.OutputFile != "" && len(requests) != 1 {
        return fmt.Errorf("--output-file supports exactly one inspect request")
    }

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

    for _, req := range requests {
        if err := writeInspectArtifacts(page, cfg, target, req, s); err != nil {
            return err
        }
    }
    return nil
}
```

## 5. Important behavior details

### 5.1 Prepared HTML should be written even on selector failures

If a selector does not match, the most useful artifact is the prepared HTML/root HTML. In directory mode, write `prepared.html` before screenshot/CSS extraction so users can inspect what actually rendered.

### 5.2 Single-file mode should be strict

`--output-file` should fail if:

- no `--format` is provided,
- `--format bundle` is used,
- multiple selectors are requested,
- the requested artifact cannot be produced.

### 5.3 Default props should be small

For `--section` and `--selector`, use a small default prop list if `--props` is omitted:

```text
display,width,height,margin,padding,font-family,font-size,font-weight,line-height,color,background-color,border,border-radius,gap
```

For `--style`, use the style's configured props.

### 5.4 Helpful missing-name errors

If a section/style name is missing, print available names:

```text
style "button-secondary" not found in Button/button.css-visual-diff.yml
available styles:
  - button-primary
  - icon
```

### 5.5 Recommended config simplification: merge sections and styles into inspect regions

The current schema separates `sections[]` and `styles[]` because the original implementation grew around separate modes: screenshots/pixel diffs use sections, while computed CSS diffs use styles. For human-authored co-located YAML files, this distinction is harder to teach than necessary.

A clearer future shape is a single list of named regions. Each region has one screenshot selector and zero or more CSS probes beneath it:

```yaml
regions:
  - name: button-primary
    screenshot:
      selector_original: "[data-comp='button-primary']"
      selector_react: "[data-comp='button-primary']"
    css:
      - name: button
        selector_original: "[data-comp='button-primary'] button"
        selector_react: "[data-comp='button-primary'] button"
        props: [height, padding, background-color, color, border-radius, font-size, font-weight]
      - name: icon
        selector_original: "[data-comp='button-primary'] svg"
        selector_react: "[data-comp='button-primary'] svg"
        props: [width, height, color, stroke-width]
```

This reads as: “capture this visual widget, and inside it inspect these CSS-bearing sub-elements.” That matches how users think about UI:

- one region is the visual crop boundary,
- CSS probes are sub-widgets or exact DOM elements inside that crop,
- a region may have no CSS probes if it is screenshot-only,
- a region may have multiple CSS probes if it contains a button, icon, label, badge, etc.

Implementation should not break current configs. The safest approach is:

1. Keep current `sections[]` and `styles[]` as the low-level execution schema.
2. Add `regions[]` as a clearer authoring schema after `inspect` works.
3. Compile `regions[]` into generated `sections[]` and `styles[]` internally.
4. Let `inspect --region button-primary` write the screenshot plus all CSS probes for that region.
5. Let `inspect --region button-primary --css button` inspect one CSS probe inside the region.

The command shape becomes clearer:

```bash
# Screenshot + all CSS probes for a widget.
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --region button-primary

# Only the screenshot crop.
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --region button-primary --format png --output-file button.png

# Only one CSS sub-widget.
css-visual-diff inspect --config Button/button.css-visual-diff.yml --side react --region button-primary --css icon --format css-md --output-file icon-css.md
```

For the first implementation slice, `inspect` can still target current `--section` and `--style`. But the public docs should describe `section` as “screenshot region” and `style` as “CSS probe” to prepare for the eventual merged `regions[]` format.

## 6. Tasks

1. Add `inspect` CLI command in `cmd/css-visual-diff/main.go`.
2. Extract or expose single-side helper functions from capture/cssdiff code.
3. Implement selector/style/root/all resolution.
4. Implement directory artifact writer.
5. Implement single-file `--format` + `--output-file` path.
6. Add unit tests for selector resolution, output mode validation, and style prop resolution.
7. Add README examples for iterating on `XXX.css-visual-diff.yml`.
8. Run `GOWORK=off go test ./...`.

## 7. Non-goals

- No mandatory new shorthand manifest schema in the first implementation slice. A later `regions[]` authoring schema can merge screenshot regions and CSS probes while compiling to current `sections[]` / `styles[]` internally.
- No Storybook ID resolver.
- No service startup/process management.
- No baseline caching.
- No token-aware CSS annotations.
- No AI review integration.

## 8. References

- Parent simplicity analysis: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-AGILITY--improve-css-visual-diff-for-co-located-agile-comparison-workflows/design-doc/02-simplicity-first-css-visual-diff-workflow-analysis.md`
- `css-visual-diff/cmd/css-visual-diff/main.go`
- `css-visual-diff/internal/cssvisualdiff/config/config.go`
- `css-visual-diff/internal/cssvisualdiff/modes/capture.go`
- `css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go`
- `css-visual-diff/internal/cssvisualdiff/modes/prepare.go`
- `css-visual-diff/examples/pyxis-atoms-prototype-vs-storybook.yaml`
