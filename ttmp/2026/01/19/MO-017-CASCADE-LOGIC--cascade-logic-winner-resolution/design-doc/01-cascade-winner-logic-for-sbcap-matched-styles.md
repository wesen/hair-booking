---
Title: Cascade Winner Logic for sbcap Matched-Styles
Ticket: MO-017-CASCADE-LOGIC
Status: active
Topics:
    - sbcap
    - css
    - cascade
    - matched-styles
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: internal/sbcap/modes/cssdiff.go
      Note: Computed style reference for verification
    - Path: internal/sbcap/modes/matched_styles.go
      Note: Current winner logic to replace
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md
      Note: CDP matched/computed styles reference
ExternalSources: []
Summary: Design for implementing full CSS cascade winner logic in sbcap matched-styles reports.
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Enable accurate "winning selector" explanations in sbcap by modeling the real CSS cascade.
WhenToUse: Use when extending sbcap matched-styles mode to provide DevTools-accurate winners.
---


# Cascade Winner Logic for sbcap Matched-Styles

## Executive Summary

sbcap currently produces matched-styles reports and a simple winner summary that only considers `!important` and "last seen" ordering. This is useful but not accurate when selector specificity or source order are involved. This ticket defines a proper cascade winner algorithm that matches DevTools behavior by incorporating importance, specificity, origin, and source order. The implementation targets `internal/sbcap/modes/matched_styles.go` and will upgrade the winner summary logic used by `buildWinnerDiffs`/`findWinner`.

## Problem Statement

The current winner summary in `internal/sbcap/modes/matched_styles.go` is intentionally minimal and can mislead when:
- Two rules match with different specificity (ID vs class),
- Rules are from different origins (user agent vs author),
- Multiple stylesheets are involved and ordering matters,
- Cascade layers or inline styles are present.

As a result, the report can show a "winner" that does not reflect the actual cascade in the browser, defeating the purpose of the explanation. We need a deterministic, DevTools-aligned winner algorithm to make sbcap actionable for CSS debugging.

## Proposed Solution

### 1) Define a cascade candidate model

For each property `P`, collect candidate declarations across matched rules and inline styles. Each candidate should include:
- Property name/value
- `important` flag
- Selector text
- Specificity (a,b,c)
- Origin (user-agent vs author vs inline)
- Source order (stylesheet index + rule index + property index)

This yields a list of `Candidate` structs per property.

### 2) Implement a cascade ranking function

Rank candidates by:
1. Importance (`!important` wins)
2. Origin priority (author > user-agent; inline treated as author with highest specificity)
3. Specificity (a,b,c tuple)
4. Source order (later wins)

The top candidate is the winner, which is reported in the matched-styles summary.

### 3) Integrate with sbcap matched-styles

- Replace `findWinner` in `internal/sbcap/modes/matched_styles.go` with a true cascade evaluation function.
- Extend the rule parsing in `evaluateMatched` to capture selector specificity and source order metadata.
- Include inline styles (`matched.InlineStyle`) as highest-priority candidates.

### 4) Output impact

The winner summary table in `matched-styles.md` should become accurate to DevTools. Example:

```
Property: margin-top
Original winner: .header-transparent + .page-title (style.css:240, specificity 0,2,1)
React winner: .page-title (bootstrap.css:1221, specificity 0,1,0)
```

## Design Decisions

- Use cdproto data (`css.RuleMatch`, `css.Rule`, `css.Style`) for selector and property metadata.
- Compute specificity locally (no external CSS parser dependency initially).
- Represent source order using the order of `matchedCSSRules` returned by CDP plus property index.
- Inline styles always outrank stylesheet rules (match DevTools).

## Alternatives Considered

- **Keep current simple winner logic**: rejected because it can mislead and is not DevTools-accurate.
- **Use a full CSS parser library**: rejected for now to keep dependency surface small; revisit if specificity parsing becomes complex.
- **Skip winner summaries entirely**: rejected because they are the most valuable debugging output.

## Implementation Plan

1. **Add candidate model**
   - Create a `Candidate` struct in `internal/sbcap/modes/matched_styles.go`.
   - Include property, selector, importance, specificity, origin, and order.

2. **Compute specificity**
   - Implement a basic specificity calculator for selector strings.
   - Handle IDs, classes/attributes/pseudo-classes, and element/pseudo-elements.

3. **Collect candidates**
   - Extract rules from `matchedCSSRules` and inline styles.
   - Assign an order index to each rule and property.

4. **Rank and select winners**
   - Implement a compare function and use it to sort candidates.
   - Select the top candidate per property.

5. **Replace `findWinner`**
   - Update `buildWinnerDiffs` and `findWinner` usage.

6. **Document behavior**
   - Add an explanation in matched-styles report about cascade rules used.

## Validation Strategy (Testing Against Ground Truth)

The cascade winner algorithm is only valuable if it matches real browser behavior. Validation should be layered so we can catch logic errors early (unit tests) and confirm correctness against the browser (integration tests).

### 1) Unit tests for cascade ordering (fast, deterministic)

Create table-driven tests that provide a list of synthetic candidates and assert the chosen winner. These tests should live alongside the cascade logic (recommended: `internal/sbcap/modes/matched_styles_test.go`).

Core cases to cover:
- `!important` beats non-important.
- Higher specificity beats lower specificity.
- Later source order wins when specificity ties.
- Inline styles (treated as highest specificity) beat author styles.

Example table (conceptual):
- Candidates: `.page-title { margin-top: 0 }` vs `#page-title { margin-top: 10px }` → winner is `#page-title`.
- Candidates: `.page-title { color: red !important }` vs `#page-title { color: blue }` → winner is important rule.

These tests validate the ranking function without requiring a browser or CDP.

### 2) Integration tests against computed styles (ground truth)

To validate against actual browser results:
1. Serve a small HTML fixture with a known set of CSS rules (including tricky cases).
2. Use chromedp to load the page and select the element.
3. Use CDP to extract matched rules (`CSS.getMatchedStylesForNode`) and computed styles (`CSS.getComputedStyleForNode`).
4. Run the cascade algorithm and compare the **winner's value** against the computed style for that property.

If the winner’s value does not match computed style, the algorithm is incorrect for that case.

Recommended test file: `internal/sbcap/modes/matched_styles_integration_test.go`.

### 3) DevTools parity check (optional but strongest)

DevTools itself is the closest to ground truth. While CDP does not return the “winning selector” directly, it does return:
- All matched rules
- Computed styles

Therefore the test condition is:
> The winner computed by our algorithm must produce the computed value returned by the browser for each property.

If this property-level check passes for a suite of selectors and properties, we can treat the algorithm as DevTools-equivalent for practical debugging.

### 4) Can we delegate to the browser?

Partially:
- **Yes**: computed values are delegated to the browser via `CSS.getComputedStyleForNode`.
- **No**: the browser does not expose the “winning selector,” so we must infer it.

Therefore, the browser provides ground truth values, and our algorithm explains *why* those values were chosen.

### 5) Suggested test fixture properties

The fixture should include:
- ID vs class specificity conflicts
- `!important` overrides
- Same selector repeated in later stylesheet
- Inline style overrides
- Simple `@media` rule (to verify active media selection)

These cases provide high confidence that ordering and specificity are correct.

## API and File References

Key file to modify:
- `internal/sbcap/modes/matched_styles.go`
  - `evaluateMatched` (collect candidates)
  - `buildWinnerDiffs` (call new winner resolver)
  - `findWinner` (replace with cascade logic)

Related supporting files:
- `internal/sbcap/modes/cssdiff.go` (computed styles reference)
- `internal/sbcap/modes/capture.go` (coverage summary)
- `cmd/sbcap/main.go` (output rows)

## Open Questions

- Do we need to support CSS cascade layers now, or defer?
- Should we expose specificity values in output for debugging?
- Should we integrate a CSS selector parser for correctness?

## References

- `internal/sbcap/modes/matched_styles.go`
- `internal/sbcap/modes/cssdiff.go`
- `ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md`
