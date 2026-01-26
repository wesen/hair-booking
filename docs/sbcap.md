# sbcap (User Guide)

sbcap is a CLI that helps you compare two render targets (typically **original HTML** vs **React/Storybook**) by producing an evidence bundle:

1. **Screenshots** (`capture`)
2. **Pixel diffs** to show *where* it differs (`pixeldiff`)
3. **Computed style diffs** to show *what* changed (`cssdiff`)
4. **Matched styles + cascade winners** to show *why* it changed (`matched-styles`)

## Quickstart (one element, no YAML)

Use `compare` when you just want to compare one element between two URLs.

```bash
go run ./cmd/sbcap compare \
  --url1 http://localhost:8080/page-about-us.html \
  --selector1 "#page-title" \
  --url2 "http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story" \
  --selector2 ".page-title"
```

Outputs are written to `./sbcap-compare-YYYYMMDD_HHMMSS/`:
- `compare.md` (start here)
- `diff_comparison.png` (start here)
- `compare.json`
- `url1_full.png`, `url2_full.png`
- `url1_screenshot.png`, `url2_screenshot.png`
- `diff_only.png`

## Recommended review order (plan-based runs)

When you run a plan (YAML), review artifacts in this order:

1. `pixeldiff.md` + the `pixeldiff_*_diff_comparison.png` images (fastest triage: where to look)
2. `cssdiff.md` (what changed: property-by-property)
3. `matched-styles.md` (why it changed: cascade winners)
4. `capture.md` (coverage + raw screenshots)

## Plan-based usage (YAML)

### Typical run command

```bash
go run ./cmd/sbcap run \
  --config /path/to/sbcap.yaml \
  --modes capture,pixeldiff,cssdiff,matched-styles \
  --pixeldiff-threshold 30
```

### Minimal `sbcap.yaml` (with per-target selectors)

Use `selector_original`/`selector_react` whenever the two DOMs do not share the same selector.

```yaml
metadata:
  slug: about-us-visual-audit
  title: "About Us Visual Audit"
  description: "Storybook vs original HTML capture"
  goal: "Identify missing sections and CSS drift"

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
    selector_original: "#page-title"
    selector_react: ".page-title"

styles:
  - name: page-title
    selector_original: "#page-title"
    selector_react: ".page-title"
    props: [position, margin-top, height, z-index]
    include_bounds: true
    attributes: [id, class]
    report: [box_model]

output:
  dir: /tmp/sbcap-output
  write_json: true
  write_markdown: true
  write_pngs: true

modes: [capture, pixeldiff, cssdiff, matched-styles]
```

### Notes on selectors

- If the selector is identical for both targets, you can keep using `selector: "..."`.
- If you omit `selector`, you must set *both* `selector_original` and `selector_react`.

## Modes (what they do)

- `capture`
  - Full page screenshots: `original-full.png`, `react-full.png`
  - Per-section screenshots: `original-<name>.png`, `react-<name>.png`
  - Coverage/visibility summary: `capture.json`, `capture.md`
- `pixeldiff`
  - Requires `capture.json`
  - Per-section diff images:
    - `pixeldiff_<section>_diff_only.png`
    - `pixeldiff_<section>_diff_comparison.png`
  - Summary: `pixeldiff.json`, `pixeldiff.md`
- `cssdiff`
  - Captures requested computed properties (`props`) and diffs them
  - Output: `cssdiff.json`, `cssdiff.md`
- `matched-styles`
  - Uses CDP to get matched rules + computed values and produces cascade winner diffs
  - Output: `matched-styles.json`, `matched-styles.md`
- `story-discovery`
  - Fetches Storybook `index.json`
  - Output: `stories.json`, `stories.md`

## Diff gym (quick validation without Storybook)

Run the built-in fixture battery:

```bash
./scripts/run-sbcap-diff-gym.sh
```

It writes outputs to `/tmp/sbcap-diff-gym/<timestamp>/<case>/`.

## Common gotchas

- `sbcap run` requires absolute URLs with scheme+host (it does not accept `file://...` targets); use a local HTTP server.
- `pixeldiff` compares images after padding to the same size. Expect widespread diffs when typography changes (font rasterization) even if layout is “close”.

