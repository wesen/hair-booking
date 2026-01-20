---
Title: sbcap Workflow Support Analysis
Ticket: MO-013-DESIGN-TEMPLATE-TACTIC
Status: active
Topics:
    - template-porting
    - visual-audit
    - playwright
    - storybook
    - ai-assisted
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/01/19/MO-013-DESIGN-TEMPLATE-TACTIC--design-template-tactic/design-doc/01-template-porting-workflow-analysis.md
      Note: Workflow this sbcap analysis supports
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/design-doc/01-reusable-go-port-of-storybook-capture-tool.md
      Note: Config and report model referenced in commands
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md
      Note: Matched-style report details
ExternalSources: []
Summary: Detailed, textbook-style analysis of how sbcap can support the template-porting workflow, with a playbook of commands and a roadmap of feature enhancements.
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Explain how sbcap should be used to reinforce each phase of the porting workflow and identify features that improve reliability and fidelity.
WhenToUse: Use when running visual audits and AI-assisted inspections for HTML -> React porting.
---


# sbcap Workflow Support Analysis

## Executive Summary

The workflow in `01-template-porting-workflow-analysis.md` relies on a repeatable cycle of visual audit, computed-style debugging, and manual inspection. The sbcap tool is a natural hub for this cycle because it can: (1) capture consistent screenshots, (2) extract computed styles and geometry, and (3) apply AI-assisted analysis to answer targeted questions. This document explains, in a textbook style, how sbcap should be used to support each workflow phase, which commands are run in practice, and which new features would make the workflow faster and more reliable.

The analysis assumes sbcap is the standardized audit tool that consumes a YAML plan (e.g., sbcap.yaml) and produces PNG + JSON + Markdown outputs, with optional AI question answering. If the sbcap CLI differs, the command examples should be adjusted, but the conceptual flow remains the same.

## Problem Statement

Template porting produces visual regressions that are rarely caught by unit tests. The core loop is visual: compare the HTML template with the React port, identify differences, then debug CSS or component structure. The workflow needs a tool that can:

- Capture consistent, comparable screenshots across multiple pages.
- Extract computed styles and layout geometry to reveal root causes.
- Provide structured reports for humans and machines.
- Leverage AI to answer precise, high-value questions (e.g., "Is the play button visible?").

Without this tooling, each audit degenerates into manual, error-prone screenshot comparisons and browser DevTools sessions that are difficult to reproduce or document.

## Proposed Solution

### 1) sbcap as a workflow anchor

sbcap should be used as the central audit tool in three phases of the workflow:

1. **Visual audit (Phase 4 in the workflow doc)**
   - Capture full-page and per-section screenshots for both original HTML and React.
   - Generate a report of missing sections and dimension mismatches.

2. **CSS debugging (Phase 4, Tier 2)**
   - Collect computed styles and bounding boxes for key selectors.
   - Report property-level diffs (position, margin, height, z-index).
   - Produce a "why" report by listing matched selectors.

3. **Manual review with AI support (Phase 4, Tier 3)**
   - Attach OCR or AI questions to screenshots.
   - Use AI to answer precise, visual questions that are tedious or ambiguous.

### 2) Conceptual model (textbook-style)

sbcap is best understood as a three-layer measurement system:

- **Layer A: Structural presence**
  - Is the section present? Is it visible? Is it the right size?
  - This is measured by selector existence, visibility checks, and bounding boxes.

- **Layer B: Computed reality**
  - What CSS values are actually applied after the cascade?
  - This is measured with `getComputedStyle` and optionally CDP matched-rule queries.

- **Layer C: Perceptual reality**
  - What does a human actually see?
  - This is measured by screenshots and (optionally) AI-assisted answers to concrete questions.

A reliable audit does not treat these layers as optional; it uses them together. Structural checks find missing sections, computed styles reveal root causes, and perceptual checks catch visual bugs that CSS diffs cannot see (icons missing, text invisible, overlays misaligned).

## Playbook: Commands and Execution Steps

The playbook below assumes sbcap reads a YAML capture plan (for example, `sbcap.yaml`) that defines URLs, selectors, style properties, and AI questions.

### Step 0: Ensure services are running

```bash
# Storybook (React port)
cd ui
npm run storybook

# Original HTML template
cd assets/Hairy
python3 -m http.server 8080
```

### Step 1: Run baseline visual audit

```bash
# Baseline capture: full page + per-section screenshots
sbcap run --config sbcap.yaml --modes capture
```

Expected outputs:
- `sources/.../original-full.png`
- `sources/.../react-full.png`
- `sources/.../original-<section>.png`
- `sources/.../react-<section>.png`

### Step 2: Run computed-style and geometry diff

```bash
# Extract computed styles and bounds, then diff
sbcap run --config sbcap.yaml --modes cssdiff
```

Expected outputs:
- `report.json` with per-selector computed style maps
- `report.md` with property-level diffs

### Step 3: Run matched-selector report (DevTools-style)

```bash
# Optional but powerful: identify which selectors win
sbcap run --config sbcap.yaml --modes matched-styles
```

Expected outputs:
- `matched-styles.json` (rules, declarations, sources)
- `matched-styles.md` (human-readable report)

### Step 4: Run AI-assisted inspection

```bash
# Use AI to answer targeted visual questions
sbcap run --config sbcap.yaml --modes ai-review
```

Expected outputs:
- `ai-review.json` with question/answer pairs
- `ai-review.md` with responses tied to section screenshots

### Step 5: Consolidated report

```bash
# Single command that runs all stages (if supported)
sbcap run --config sbcap.yaml --modes capture,cssdiff,matched-styles,ai-review
```

Expected outputs:
- Combined Markdown report
- JSON data bundle for automation
- PNG screenshot archive

## How sbcap supports the MO-013 workflow phases

### Phase 1: Inventory

- sbcap is not the primary inventory tool, but it can validate inventory completeness by running a scan with all expected selectors and flagging missing sections.

### Phase 2: Planning

- The capture plan (sbcap.yaml) forces explicit definition of which selectors matter. This helps formalize the scope of the port.

### Phase 3: Implementation

- Developers can run sbcap against an in-progress component to verify that the section at least renders, then iteratively expand to full-page audits.

### Phase 4: Visual Audit + Debug

- sbcap directly implements the three-tier validation model: screenshots (tier 1), computed-style diffs (tier 2), and manual/AI inspection (tier 3).

## AI Capabilities: How to use them precisely

sbcap's AI assistance should be used with precise questions that reduce ambiguity. Good questions are binary or narrowly scoped:

- "Is the play button visible and centered on the video thumbnail?"
- "Are the counter icons rendered as gold line-art, not beige squares?"
- "Is the testimonial quote text visible in white, and is the author name present?"

The tool should attach the screenshot for each question and store the result alongside the section name and selector so it can be traced back in the report.

## Design Decisions

- **YAML capture plan as the source of truth:** ensures reproducibility and version control.
- **Multi-mode runs instead of one opaque command:** preserves clarity and makes debugging easier.
- **AI questions per section:** ensures AI is targeted and auditable, not a vague narrative generator.
- **CDP-based matched-style reporting:** makes "why" explanations possible, not just "what".

## Feature Enhancements to Improve Workflow

### 1) Selector coverage auditing
**What it is:** A deliberate coverage check that distinguishes between (a) a missing element because it is genuinely absent in the DOM and (b) a selector that is stale or malformed. The tool should treat this as a first-class diagnostic rather than a log line.

**How it differs from \"we already report missing\":** today, missing selectors are often logged inline during capture, mixed with other output, and do not produce a structured, action-oriented summary. A coverage audit would:
- produce a dedicated report section with counts (e.g., 18 selectors planned, 15 matched, 3 missing),
- classify the failure (selector error vs. element absent vs. element hidden),
- optionally fail the run in strict mode,
- and provide a config lint signal (e.g., warn if a selector never matches in either original or React).

**Impact:** prevents silent drift when DOM structure changes or when a selector typo prevents any capture. It also clarifies whether the mismatch is a real regression (element missing) or just a stale selector.

### 2) Storybook story discovery
- Feature: allow `sbcap` to query `index.json` and list available stories.
- Impact: avoids manual story ID mistakes in the config.

### 3) AI answer confidence and evidence
- Feature: return a confidence score and reference the specific pixels or DOM nodes that drove the answer.
- Impact: allows humans to triage which AI answers need verification.

### 4) Matched-style diff summaries
**What it is:** A per-property explanation of *why* a computed value differs, by listing the winning selector (and its source) in the original and the React port. It is a distilled view of the full matched-rule report.

**Why it matters:** The computed style diff tells you *what* changed (e.g., `margin-top` is 0 instead of -140px). The matched-style summary tells you *why* it changed (e.g., the original winner is `.header-transparent + .page-title` from `style.css`, but the React tree no longer satisfies the adjacent-sibling selector, so the winner is a fallback rule).

**Concrete example:**
- Property: `margin-top`
  - Original winner: `.header-transparent + .page-title { margin-top: -140px; }` (style.css:240)
  - React winner: `.page-title { margin-top: 0; }` (bootstrap.min.css:1221)

**Impact:** compresses debugging time by directly pointing to the selector that should be ported or replaced, instead of requiring manual CSS tracing.

### 5) Asset integrity checks
- Feature: verify that images referenced by `img` tags and CSS `background-image` URLs return 200 and are non-empty.
- Impact: catches missing icons and broken assets automatically.

### 6) Golden baseline locking
- Feature: allow pinning a known-good baseline and compare new ports against it.
- Impact: supports regression testing across multiple rounds of edits.

### 7) AI-assisted diff summary
- Feature: auto-generate a concise summary of major visual differences with citations to screenshots.
- Impact: makes review faster while still grounding claims in evidence.

## Alternatives Considered

- **Manual DevTools-only workflow:** rejected due to lack of repeatability and audit trails.
- **Pixel-only diff tooling:** rejected because it lacks semantic explanations.
- **Full CSS re-architecture first:** rejected because the workflow needs immediate parity before refactors.

## Implementation Plan

1. Define sbcap capture plan schema (YAML) to align with sbcap conventions.
2. Implement baseline capture + computed-style diff modes.
3. Add CDP matched-style reporting as an optional mode.
4. Add AI question answering per section with traceable outputs.
5. Integrate into workflow docs and example playbooks.

## Open Questions

- What is the canonical sbcap CLI syntax and config format?
- Should AI question answering run by default or only in explicit mode?
- How are AI answers validated and stored for later review?
- Where should sbcap outputs live: per-ticket `ttmp/.../sources`, or per-project artifacts?

## References

- `ttmp/2026/01/19/MO-013-DESIGN-TEMPLATE-TACTIC--design-template-tactic/design-doc/01-template-porting-workflow-analysis.md`
- `ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/design-doc/01-reusable-go-port-of-storybook-capture-tool.md`
- `ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md`
