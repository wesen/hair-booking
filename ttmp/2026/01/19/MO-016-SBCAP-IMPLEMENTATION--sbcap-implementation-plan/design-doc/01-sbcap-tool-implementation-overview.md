---
Title: sbcap Tool Implementation Overview
Ticket: MO-016-SBCAP-IMPLEMENTATION
Status: active
Topics:
    - sbcap
    - tooling
    - visual-audit
    - playwright
    - cdp
    - ai-assisted
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/01/19/MO-013-DESIGN-TEMPLATE-TACTIC--design-template-tactic/design-doc/01-template-porting-workflow-analysis.md
      Note: Workflow sbcap must support
    - Path: ttmp/2026/01/19/MO-013-DESIGN-TEMPLATE-TACTIC--design-template-tactic/design-doc/02-sbcap-workflow-support-analysis.md
      Note: Operational playbook and feature needs
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/design-doc/01-reusable-go-port-of-storybook-capture-tool.md
      Note: sbcap spec and CLI design
    - Path: ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md
      Note: CDP matched/computed style report details
    - Path: ui/scripts/capture-sections.ts
      Note: Baseline screenshot capture behavior
    - Path: ui/scripts/compare-about-us.ts
      Note: Baseline integrated audit
    - Path: ui/scripts/compare-css.ts
      Note: Baseline computed style extraction
ExternalSources: []
Summary: Detailed implementation overview for sbcap, including API, architecture, phased build plan, and references to prior workflow and analysis docs.
LastUpdated: 2026-01-19T00:00:00Z
WhatFor: Plan and guide the sbcap implementation in manageable steps with clear interfaces and outputs.
WhenToUse: Use when implementing or extending sbcap.
---


# sbcap Tool Implementation Overview

## Executive Summary

sbcap is the standardized audit tool for the template-porting workflow. It captures screenshots, extracts computed styles and geometry, and can answer precise AI questions tied to captured sections. This design document consolidates the existing analysis and specifies a step-by-step implementation plan to build sbcap incrementally, avoiding a "big bang" integration. The tool is defined as a CLI + library that consumes a YAML plan (sbcap.yaml), supports multi-mode execution via `--modes`, and produces PNG/JSON/Markdown outputs suitable for docmgr workflows.

This document references:
- The workflow and requirements in `MO-013` (template porting workflow analysis).
- The sbcap spec and Go port design in `MO-015`.
- The CDP-based selector impact/computed style guidance in `MO-015` reference doc.

## Problem Statement

We need a reusable audit tool that formalizes the visual + CSS validation loop described in `01-template-porting-workflow-analysis.md`. The current approach uses a collection of one-off scripts and manual inspection. sbcap must unify these into a coherent tool with:

- Deterministic capture (controlled viewport, timing).
- Structured reporting (JSON + Markdown + PNG).
- Optional AI-assisted answers to precise visual questions.
- A path to advanced CDP reports (matched styles, computed styles, box model).

The implementation should be staged so that each milestone yields a useful subset of functionality, without forcing the team to build CDP integration, AI review, and story discovery all at once.

## Proposed Solution

### 1) Tool surface area (CLI + library)

sbcap is a CLI wrapper around a library. The library is responsible for capture and reporting, while the CLI focuses on configuration parsing, validation, and mode selection.

CLI (proposed):
```
sbcap run --config sbcap.yaml --modes capture,cssdiff,matched-styles,ai-review
```

Library entrypoints (conceptual):
- `capture.Run(plan)`: capture screenshots and section metadata
- `cssdiff.Run(plan)`: extract computed styles and bounds
- `matchedstyles.Run(plan)`: fetch matched rules via CDP
- `ai.Run(plan)`: answer `ocr_question` prompts
- `report.Render(plan, outputs)`: render Markdown + JSON

### 1.1) Glazed-based CLI construction (from `glaze help build-first-command`)

The sbcap CLI should be built using Glazed + Cobra to get structured outputs, consistent parameter parsing, and built-in output formatting. The command should implement the `cmds.GlazeCommand` interface and yield structured rows when appropriate (for example, when listing available stories or reporting coverage summaries).

Core APIs and concepts from the Glazed tutorial:
- `cmds.CommandDescription`: carries command metadata, flags, and help text.
- `fields.New(...)`: defines flags (type, defaults, help, short flags).
- `schema.NewGlazedSchema()`: adds standard output flags like `--output`, `--fields`, `--sort-columns`.
- `cli.NewCommandSettingsLayer()`: adds debug flags (print schema, parsed parameters).
- `values.DecodeSectionInto(vals, schema.DefaultSlug, &settings)`: decode resolved values into a typed settings struct.
- `types.Row` and `types.MRP`: emit structured output rows for Glazed processors.
- `cli.BuildCobraCommand(...)`: builds Cobra commands with Glazed integrations (middlewares, output toggle, schema).

For sbcap, the command shape is:
```
type RunCommand struct { *cmds.CommandDescription }

type RunSettings struct {
  Config string `glazed.parameter:"config"`
  Modes  string `glazed.parameter:"modes"`
  DryRun bool   `glazed.parameter:"dry-run"`
}

func (c *RunCommand) RunIntoGlazeProcessor(ctx context.Context, vals *values.Values, gp middlewares.Processor) error {
  settings := &RunSettings{}
  if err := values.DecodeSectionInto(vals, schema.DefaultSlug, settings); err != nil {
    return err
  }
  // Parse modes, load config, run pipeline
  // Emit structured rows for coverage summaries, story discovery, or report manifests.
  return nil
}
```

Glazed encourages separating business logic from CLI parsing: the settings struct defines parameters, while `RunIntoGlazeProcessor` dispatches to sbcap library functions. This matches the sbcap architecture where the CLI is a thin wrapper and the library houses the capture logic.

Suggested Glazed flags for sbcap:
- `--config` (file): path to sbcap YAML
- `--modes` (string): comma-delimited list of modes
- `--dry-run` (bool): validate config and selectors without capture
- `--print-schema`, `--print-parsed-parameters` (via command settings layer)

Use `schema.NewGlazedSchema()` to automatically provide `--output` formats (json/yaml/csv/table). This is useful for commands like `sbcap stories list` or `sbcap coverage` to output structured summaries without custom format handling.

### 2) Data model and API

At the core is a `CapturePlan` derived from YAML. The plan composes:
- `metadata`: intent, slug, expected output
- `targets`: original + React URLs, viewport, wait timing
- `sections`: selectors and optional AI questions
- `styles`: selectors, property lists, bounds, attributes, report modes
- `output`: output directories and formats

Key structs (illustrative):

```
type CapturePlan struct {
  Metadata Metadata
  Original Target
  React Target
  Sections []SectionSpec
  Styles []StyleSpec
  Output OutputSpec
  Modes []string
}

type SectionSpec struct {
  Name string
  Selector string
  OCRQuestion string
}

type StyleSpec struct {
  Name string
  Selector string
  Props []string
  IncludeBounds bool
  Attributes []string
  Report []string
}
```

### 3) Architecture (module map)

```
sbcap/
  cmd/sbcap/                 # CLI entrypoint
  internal/config/           # YAML parsing + validation
  internal/browser/          # browser abstraction (Playwright/Chromedp)
  internal/capture/          # screenshots + section presence/visibility
  internal/cssdiff/          # computed styles + bounds + attribute capture
  internal/matchedstyles/    # CDP matched rules and winners
  internal/ai/               # AI Q&A for images
  internal/report/           # Markdown + JSON rendering
```

### 4) Workflow alignment

sbcap must align with the MO-013 workflow:
- **Visual audit:** `capture` mode
- **CSS debugging:** `cssdiff` + `matched-styles`
- **Manual review:** `capture` + AI question answers

This alignment is captured by `--modes` which lets a user run one or multiple stages per invocation.

## Design Decisions

- **YAML-first configuration:** keeps plans versionable and human-readable.
- **Multi-mode CLI (`--modes`):** allows combining stages without chaining commands.
- **Driver abstraction:** allows swapping Playwright and chromedp without rewriting core logic.
- **Structured outputs:** every mode emits JSON + Markdown (where applicable), enabling automation and audits.
- **AI prompts are explicit:** `ocr_question` is per-section, so AI output remains precise and auditable.

## Step-by-Step Implementation Plan (Complexity-Controlled)

### Phase 0: Scaffolding and contracts
1. Create repo/module structure and Glazed-based CLI skeleton.
2. Define the YAML schema and Go structs.
3. Add config validation (required fields, URL format, selector syntax sanity checks).

### Phase 1: Capture-only mode (screenshots)
1. Implement browser driver abstraction (Playwright first).
2. Build `capture` mode:
   - Full-page screenshots for original and React.
   - Per-section screenshots.
   - Presence/visibility checks.
3. Output:
   - PNGs in output dir.
   - JSON summary of which sections were found.

### Phase 2: Computed styles and bounds (cssdiff)
1. Implement `cssdiff` mode using `getComputedStyle` and `getBoundingClientRect`.
2. Capture bounds and attributes when requested.
3. Produce a property diff table in Markdown.

### Phase 3: Matched styles and winner summaries
1. Implement `matched-styles` mode via CDP:
   - `CSS.getMatchedStylesForNode`
   - `CSS.getComputedStyleForNode`
   - `DOM.getBoxModel`
2. Add "winning selector" summaries for key properties.
3. Integrate with report renderer.

### Phase 4: AI review
1. Implement `ai-review` mode that:
   - Reads `ocr_question` per section.
   - Attaches screenshot evidence.
   - Stores Q/A + confidence metadata.
2. Render AI answers into Markdown.

### Phase 5: Workflow features (required)
1. Selector coverage auditing (strict mode, explicit summary).
2. Storybook story discovery (`index.json`).
3. Matched-style diff summaries in report outputs.

### Phase 6: Quality and UX
1. Add `--modes` validation (unknown mode errors).
2. Add `--dry-run` to validate URLs and selectors without capturing.
3. Add output folder cleanup/rotation options.

## Detailed API Behavior Notes

### Capture mode
- If a selector does not match, record `exists=false` and include in coverage summary.
- If an element exists but is hidden (`display:none`, `visibility:hidden`), record `visible=false`.

### cssdiff mode
- Properties are compared per selector. Differences are classified by severity (layout vs visual).
- Bounds are recorded in viewport coordinates by default; optionally add document offsets.

### matched-styles mode
- Each property includes a list of candidate declarations and the winning rule.
- Winners are resolved using the CSS cascade (`!important` → origin inline/author/user-agent → specificity → source order).
- Winner summaries include origin + specificity context to explain why a declaration won.
- If no matched rule exists, record as `source=none`.

### ai-review mode
- Each question is tied to one screenshot and one selector for traceability.
- Answers should be stored with confidence and evidence references.

## Alternatives Considered

- **Keep TypeScript scripts and wrap them:** rejected because it does not standardize outputs or config.
- **Pixel-diff only:** rejected due to lack of diagnostic value.
- **Single monolithic run:** rejected; `--modes` keeps execution modular and debuggable.

## Open Questions

- What is the canonical AI backend and how are prompts stored?
- Do we need a native Windows/Linux binary or is Go-only sufficient?
- Should sbcap include an HTML report viewer or stick to Markdown?

## References

- `ttmp/2026/01/19/MO-013-DESIGN-TEMPLATE-TACTIC--design-template-tactic/design-doc/01-template-porting-workflow-analysis.md`
- `ttmp/2026/01/19/MO-013-DESIGN-TEMPLATE-TACTIC--design-template-tactic/design-doc/02-sbcap-workflow-support-analysis.md`
- `ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/design-doc/01-reusable-go-port-of-storybook-capture-tool.md`
- `ttmp/2026/01/19/MO-015-STORYBOOK-TOOL--storybook-tool-analysis-and-go-port/reference/02-selector-impact-and-computed-style-reports-via-cdp.md`
- `ui/scripts/capture-sections.ts`
- `ui/scripts/compare-css.ts`
- `ui/scripts/compare-about-us.ts`
