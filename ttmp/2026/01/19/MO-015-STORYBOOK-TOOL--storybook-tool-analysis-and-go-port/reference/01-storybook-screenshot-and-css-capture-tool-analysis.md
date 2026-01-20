---
Title: Storybook Screenshot and CSS Capture Tool Analysis
Ticket: MO-015-STORYBOOK-TOOL
Status: active
Topics: []
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/playbook/01-storybook-visual-comparison-testing-playbook.md
      Note: Storybook + Playwright usage guide
    - Path: ui/scripts/capture-sections.ts
      Note: Primary screenshot capture script
    - Path: ui/scripts/compare-about-us.ts
      Note: Integrated audit script that combines capture and comparison
    - Path: ui/scripts/compare-css.ts
      Note: Computed-style capture and comparison script
ExternalSources: []
Summary: Detailed analysis of the Storybook screenshot and CSS capture scripts, their structure, concepts, and operational flow.
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Explain how the current tooling works and what concepts are required to reason about it.
WhenToUse: Use when maintaining or porting the Storybook capture tools.
---


# Storybook Screenshot and CSS Capture Tool Analysis

## Goal

Provide a deep, textbook-style explanation of how the Storybook screenshot and CSS capture scripts work, including their structure, data flow, dependencies, and failure modes.

## Context

Three scripts in `ui/scripts/` form the current tooling cluster:
- `capture-sections.ts` (screenshot capture by selector)
- `compare-css.ts` (computed-style and layout comparison)
- `compare-about-us.ts` (end-to-end section audit with report output)

The request focuses on the screenshot and CSS capture workflow, which primarily spans `capture-sections.ts` and `compare-css.ts`, with `compare-about-us.ts` serving as the integrated audit script that combines both techniques.

## Quick Reference

### 1) The operational model

The scripts implement a two-page model:
- **Original HTML**: a static template served by a local HTTP server (e.g., `http://localhost:8080/page-about-us.html`).
- **React/Storybook**: a Storybook iframe view (e.g., `http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story`).

At runtime, they open both pages in headless Chromium via Playwright, then apply a sequence of steps:
- Load page
- Wait for layout to stabilize
- Identify elements by selector
- Capture computed styles and bounding boxes
- Take screenshots (full page and per-section)
- Emit logs, reports, and artifacts

### 2) Concepts required to understand the scripts

- **Storybook iframe URL semantics**: the `iframe.html` endpoint renders a story without the Storybook UI chrome, producing a clean target for screenshots and CSS capture.
- **Playwright page lifecycle**: page navigation with `goto`, wait for `networkidle`, and explicit timeouts to allow asynchronous content to render.
- **DOM selectors and fallbacks**: selectors often include alternatives (e.g., `#page-title, .page-title`) to handle variation between original HTML and React DOM.
- **Computed styles vs authored styles**: `window.getComputedStyle` captures the final resolved styles (after cascade and layout), which is more diagnostic than raw CSS file inspection.
- **Bounding boxes**: `getBoundingClientRect` or Playwright `boundingBox` captures layout differences in absolute pixel units.
- **Viewport control**: consistent viewport size is essential for comparable screenshots and metrics.
- **ESM module path resolution**: Node ESM scripts use `fileURLToPath(import.meta.url)` to derive a stable `__dirname` for output paths.

### 3) Script-by-script structural analysis

#### A) `ui/scripts/capture-sections.ts`

This is a focused screenshot capture tool. It implements the minimal loop for capturing section images from both the original HTML and the Storybook page.

Key elements and structure:
- **Constants**
  - `ORIGINAL_URL` and `REACT_URL` define the two sources.
  - `OUTPUT_DIR` sets the per-ticket output folder.
  - `SECTIONS` is an ordered list of `{ name, selector }` pairs.
- **Main control function**
  - `main()` creates output folders, launches Chromium, and drives the capture loop.
- **Two-pass flow**
  - Pass 1: open original, take full page screenshot, then per-section screenshots.
  - Pass 2: open React (Storybook), take full page screenshot, then per-section screenshots.

Important lines of reasoning:
- **Selector strategy**: each section uses a selector that matches the original HTML and the React DOM. Example: `#team1, .team` tries an ID first, then class.
- **Error handling**: missing selectors are logged but do not abort the run. This makes the script robust to partial ports.
- **Viewport**: the script explicitly sets `1280x720` to reduce differences caused by window size.
- **Output placement**: `OUTPUT_DIR` points to a ticket-scoped path under `ttmp/.../sources/visual-analysis`, which keeps artifacts near the audit documentation.

Pseudocode (structural view):

```
function main():
    ensure output directory
    browser = launch chromium

    original = new page
    set viewport 1280x720
    goto ORIGINAL_URL
    screenshot full page -> original-full.png
    for section in SECTIONS:
        element = page.$(section.selector)
        if element exists:
            element.screenshot -> original-{name}.png
        else:
            log missing

    react = new page
    set viewport 1280x720
    goto REACT_URL
    wait 3000ms
    screenshot full page -> react-full.png
    for section in SECTIONS:
        element = page.$(section.selector)
        if element exists:
            element.screenshot -> react-{name}.png
        else:
            log missing

    close browser
```

API references:
- `chromium.launch()`
- `page.goto(url, { waitUntil: 'networkidle' })`
- `page.setViewportSize({ width, height })`
- `page.$(selector)`
- `elementHandle.screenshot({ path })`
- `page.screenshot({ path, fullPage: true })`

#### B) `ui/scripts/compare-css.ts`

This is a computed-style comparison tool. It treats the pages as two samples of the same layout and compares computed style values to detect mismatches.

Key elements and structure:
- **Functions**
  - `getComputedStyles(page, selector, properties)`: extracts a property map from `getComputedStyle`.
  - `getElementInfo(page, selector)`: returns DOM metadata and computed styles for an element, plus bounding box data.
  - `main()`: orchestration function that loads pages, iterates a selector list, and prints differences.
- **Selectors**
  - A curated list targets the highest-impact elements (e.g., page title, breadcrumb, header).
- **Comparison loop**
  - For each selector, it checks existence in original and React, then prints layout dimensions and key style differences.

Important lines of reasoning:
- **Computed style is the truth**: differences in `position`, `marginTop`, `height`, and `zIndex` reveal structural mismatches in the rendered layout.
- **Selector ambiguity**: selectors sometimes combine ID and class forms to align with both DOMs.
- **Short, high-signal property list**: the script compares a small set of properties, because differences in these are usually most consequential.
- **Output placement**: screenshots are written under `ttmp/.../sources/` with CSS-specific filenames, which supports linking into audit docs.

Pseudocode (structural view):

```
function getElementInfo(page, selector):
    return page.evaluate(() => {
        el = document.querySelector(selector)
        if not el: return null
        rect = el.getBoundingClientRect()
        styles = getComputedStyle(el)
        return {
            bounds: { width, height, top, left },
            computedStyles: {
                display, position, marginTop, paddingTop, paddingBottom,
                height, minHeight, backgroundColor, backgroundImage,
                backgroundSize, fontSize, fontWeight, color, zIndex,
                ...
            }
        }
    })

function main():
    browser = launch chromium
    original = new page
    react = new page
    goto ORIGINAL_URL
    goto REACT_URL
    wait 3000ms
    for selectorSpec in selectors:
        origInfo = getElementInfo(original, selectorSpec.selector)
        reactInfo = getElementInfo(react, selectorSpec.selector)
        if missing in either: log and continue
        print bounds comparison
        for prop in stylesToCheck:
            if orig != react:
                print diff

    capture page-title screenshots
    close browser
```

API references:
- `page.evaluate()` for DOM access and `getComputedStyle`
- `element.getBoundingClientRect()`
- `page.$(selector)`
- `elementHandle.screenshot({ path })`

#### C) `ui/scripts/compare-about-us.ts` (integration script)

While not strictly a CSS capture or screenshot tool, this script demonstrates the integrated model. It combines screenshot capture, computed-style sampling, and structured reporting in one pass. It defines the following functions:
- `ensureDir(dir)`
- `captureElement(page, selector, name, prefix)`
- `captureFullPage(page, name)`
- `compareSection(originalPage, reactPage, selector, sectionName)`
- `main()`

This script adds two architectural ideas:
- **Structured comparison result objects** with `issues[]` lists.
- **Report generation** into Markdown and JSON files for archival and review.

### 4) Failure modes and fragility points

- **CSS loading order**: if `theme.css` or custom overrides are not loaded in Storybook (`preview-head.html`), the computed styles will not match, even if the app would render correctly.
- **Selector drift**: changes in DOM structure or class names break the hard-coded selector lists.
- **Timing sensitivity**: animations, carousels, and async content can cause unstable screenshots unless explicit waits or disabling animations are added.
- **Viewport sensitivity**: different viewport sizes change layout and computed styles.
- **Asset paths**: missing images or incorrect public asset paths cause visual differences that are not always visible in computed styles.

### 5) Why these scripts are effective

The tools are effective because they combine three independent signals:
- **Structural presence** (is the element present and visible?)
- **Geometric parity** (do sizes and positions match?)
- **Visual artifacts** (screenshots for human review)

This is a practical example of redundant sensing. Each method catches problems the others miss. For example:
- CSS diffs catch missing `margin-top` or `position` rules.
- Screenshots catch missing icons and typography mismatches.
- Section presence checks catch missing components.

## Usage Examples

### Capture section screenshots

```
cd ui
npx tsx scripts/capture-sections.ts
```

### Compare computed styles

```
cd ui
npx tsx scripts/compare-css.ts
```

### Run the integrated audit

```
cd ui
npx tsx scripts/compare-about-us.ts
```

### Storybook URLs used by scripts

- `http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story`

### Original HTML URL used by scripts

- `http://localhost:8080/page-about-us.html`

## Related

- `ui/scripts/capture-sections.ts`
- `ui/scripts/compare-css.ts`
- `ui/scripts/compare-about-us.ts`
- `ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/playbook/01-storybook-visual-comparison-testing-playbook.md`
