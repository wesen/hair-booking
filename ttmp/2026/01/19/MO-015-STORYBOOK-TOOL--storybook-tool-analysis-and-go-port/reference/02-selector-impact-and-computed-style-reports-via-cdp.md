---
Title: Selector Impact and Computed Style Reports via CDP
Ticket: MO-015-STORYBOOK-TOOL
Status: active
Topics: []
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/design-doc/01-reusable-go-port-of-storybook-capture-tool.md
      Note: Go port design that will request these reports
    - Path: ui/scripts/compare-about-us.ts
      Note: Integrated audit baseline
    - Path: ui/scripts/compare-css.ts
      Note: Computed-style capture baseline
ExternalSources: []
Summary: Detailed, textbook-style guide to generating DevTools-like CSS selector impact and computed style reports using Playwright (CDP) and chromedp.
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Explain how to capture matched selectors, computed styles, and layout boxes for a DOM node in an automated report.
WhenToUse: Use when building or extending sbcap to produce DevTools-style CSS reports.
---


# Selector Impact and Computed Style Reports via CDP

## Goal

Provide a detailed, textbook-style explanation of how to reproduce the DevTools "Styles" and "Computed" panels programmatically using the Chrome DevTools Protocol (CDP), with concrete implementations for Playwright and chromedp. The emphasis is on: (1) which CDP calls are required, (2) how to interpret their outputs, and (3) how to construct a stable, reusable report that explains which selectors influence a node and which computed values are ultimately applied.

## Context

The DevTools UI presents two complementary views of CSS:
- **Styles**: a rule-by-rule view (selectors + declarations), including inline styles and inherited rules, with overridden properties marked.
- **Computed**: a property-by-property view showing the final computed values after the cascade, inheritance, and layout are resolved.

To programmatically replicate these views, we need:
- `CSS.getMatchedStylesForNode` for rule-level inputs to the cascade.
- `CSS.getComputedStyleForNode` for the final computed values.
- `DOM.getBoxModel` (or `getBoundingClientRect`) to reveal actual layout geometry (content/padding/border/margin).

The CDP API is accessible from both Playwright (via a CDP session) and chromedp (as a native CDP client).

## Quick Reference

### The minimal CDP triad

- **Selector impact (Styles panel):** `CSS.getMatchedStylesForNode`
- **Final values (Computed panel):** `CSS.getComputedStyleForNode`
- **Layout geometry (box model):** `DOM.getBoxModel`

### Recommended report output sections

- Node identity (selector, tag, ID, class)
- Matched rules (selector list + declarations + source URLs)
- Inline styles (style attribute)
- Inherited rules (per ancestor)
- Computed styles (key properties, full map optional)
- Box model (content/padding/border/margin quads)
- A per-property "winner" explanation (optional but valuable)

### Core terminology

- **Matched rule**: a rule whose selector matches the node.
- **Computed style**: the final resolved values after cascading, inheritance, and layout resolution.
- **Box model**: the sizes and offsets of content/padding/border/margin regions.
- **Specificity**: the priority of selectors based on ID/class/element counts.
- **Cascade**: the algorithm deciding which declaration wins for each property.

---

## Part I: How DevTools decides "what styles apply"

DevTools is essentially showing two models of the same CSS process:

1) **Input model (Styles)**
   - All rules that match the node
   - Their declarations, in cascade order
   - Inline styles and `style` attributes
   - Inherited rules from ancestors

2) **Output model (Computed)**
   - The final values for each property, after
     - Cascade (importance + specificity + order)
     - Inheritance (for inherited properties)
     - Layout (for size/position-related values)

To reproduce this, we gather all matching rules, then either:
- Display them as-is (a "Styles" clone), or
- Apply the cascade algorithm to produce a per-property "winner" table.

The computed style call already gives the final values, but does not describe *why* a value wins. The matched rules call provides the explanatory inputs.

---

## Part II: Playwright implementation (CDP session)

### 1) Establish a CDP session and identify the node

Playwright exposes CDP via `page.context().newCDPSession(page)`.

```ts
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story');

const client = await page.context().newCDPSession(page);
const { root } = await client.send('DOM.getDocument', { depth: -1 });
const { nodeId } = await client.send('DOM.querySelector', {
  nodeId: root.nodeId,
  selector: '#page-title'
});
```

### 2) Retrieve matched rules (selector impact)

```ts
const matched = await client.send('CSS.getMatchedStylesForNode', { nodeId });
```

Key fields:
- `matched.matchedCSSRules`: list of rule matches
  - Each entry has `rule.selectorList` and `rule.style` (declarations)
- `matched.inlineStyle`: inline styles (if any)
- `matched.attributesStyle`: style attribute values
- `matched.inherited`: inherited rules from ancestors

### 3) Retrieve computed styles (final values)

```ts
const computed = await client.send('CSS.getComputedStyleForNode', { nodeId });
```

This returns `computed.computedStyle`, an array of `{name, value}` pairs.

### 4) Retrieve box model (layout geometry)

```ts
const box = await client.send('DOM.getBoxModel', { nodeId });
```

`box.model` includes quads for:
- `content`, `padding`, `border`, `margin`

Each quad is an array of 8 numbers representing the four corners (x1, y1, x2, y2, x3, y3, x4, y4).

### 5) Optional: compute per-property winners

To explain *which selector wins* for each property, build a candidate list from matched rules, then apply the CSS cascade algorithm:

```
for each property P:
  candidates = all declarations of P from matched rules + inline styles
  winner = choose highest priority by:
    1) !important over normal
    2) higher specificity
    3) later source order
```

Specificity is typically available in `selectorList` or can be computed with a CSS parser.

---

## Part III: chromedp implementation (native CDP)

chromedp uses CDP directly, so the calls map 1:1 with the protocol.

```go
import (
  "github.com/chromedp/chromedp"
  "github.com/chromedp/cdproto/css"
  "github.com/chromedp/cdproto/dom"
)

var nodeIDs []dom.NodeID
err := chromedp.Run(ctx,
  chromedp.Navigate("http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story"),
  chromedp.NodeIDs("#page-title", &nodeIDs, chromedp.ByQuery),
)
nodeID := nodeIDs[0]

matched, _ := css.GetMatchedStylesForNode(nodeID).Do(ctx)
computed, _ := css.GetComputedStyleForNode(nodeID).Do(ctx)
box, _ := dom.GetBoxModel(nodeID).Do(ctx)
```

Important notes:
- `chromedp.NodeIDs` can return multiple matches; choose the first or report all.
- Error handling must include missing nodes, detached nodes, and timeouts.

---

## Part IV: Interpreting and reporting the results

A DevTools-like report should separate "inputs" from "outputs":

### A) Styles (inputs)

For each matched rule, store:
- Selector text
- Origin (inline, author stylesheet, user-agent)
- Declarations (property, value, important?)
- Source file and line (when available)

Example excerpt (report):

```
Matched rules (in cascade order):
1. .page-title { margin-top: -140px; position: relative; }
   source: /hairy/assets/css/style.css:240
2. .page-title .bg-section img { object-fit: cover; }
   source: /ui/src/styles/theme.css:18
Inline style:
- style="background-image: url(...)"
```

### B) Computed (outputs)

Store a property map for key properties (full map optional). Example:

```
Computed styles:
- position: relative
- margin-top: -140px
- height: 466px
- z-index: 1
```

### C) Box model (geometry)

Translate quads into human-readable output:

```
Box model:
- content: x=0 y=0 w=1280 h=466
- padding: x=0 y=0 w=1280 h=466
- border:  x=0 y=0 w=1280 h=466
- margin:  x=0 y=-140 w=1280 h=606
```

### D) Winner table (optional but powerful)

For a set of high-impact properties (position, margin-top, height), list the winning declaration and its selector.

```
Winners:
- margin-top: -140px (from .header-transparent + .page-title, style.css:240)
- position: relative (from .page-title, style.css:210)
```

---

## Part V: Pitfalls and stability concerns

- **Animations**: computed styles can change during animations. Stabilize by disabling animations or waiting for idle.
- **Pseudo-elements**: `::before` and `::after` require pseudoId handling in CDP.
- **Shadow DOM**: requires traversal into shadow roots.
- **Viewport dependence**: computed styles change with viewport size and media queries.
- **Detached nodes**: nodes can detach between query and evaluation.

These should be reflected in the report header as run conditions (viewport size, user agent, time, URL).

---

## Usage Examples

### Playwright CDP snippet

```
const matched = await client.send('CSS.getMatchedStylesForNode', { nodeId });
const computed = await client.send('CSS.getComputedStyleForNode', { nodeId });
const box = await client.send('DOM.getBoxModel', { nodeId });
```

### chromedp CDP snippet

```
matched, _ := css.GetMatchedStylesForNode(nodeID).Do(ctx)
computed, _ := css.GetComputedStyleForNode(nodeID).Do(ctx)
box, _ := dom.GetBoxModel(nodeID).Do(ctx)
```

### Report integration idea (sbcap)

- Extend `styles` entries with `report: [matched_styles, computed_styles, box_model]`.
- If `matched_styles` is requested, include rule list and declarations.
- If `computed_styles` is requested, include final values map.
- If `box_model` is requested, include geometry quads and simplified width/height.

## Related

- `ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/design-doc/01-reusable-go-port-of-storybook-capture-tool.md`
- `ui/scripts/compare-css.ts`
- `ui/scripts/compare-about-us.ts`
