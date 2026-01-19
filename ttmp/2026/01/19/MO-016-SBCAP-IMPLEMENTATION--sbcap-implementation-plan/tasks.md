# Tasks

## TODO

- [ ] 1.1 Remove placeholder tasks and define sbcap module layout (cmd/internal/pkg directories).
- [ ] 1.2 Add Go dependencies (glazed, chromedp/cdproto, yaml) and update go.mod/go.sum.
- [ ] 1.3 Define sbcap YAML config schema + types (metadata, targets, sections, styles, output, modes).
- [ ] 1.4 Implement config loader + validation (required fields, URL format, selector presence, modes).
- [ ] 1.5 Add sbcap run command scaffolding (no-op modes, wiring only).

- [ ] 2.1 Build Glazed-based CLI skeleton (CommandDescription, settings struct, BuildCobraCommand).
- [ ] 2.2 Implement --modes parsing and deterministic execution order.
- [ ] 2.3 Add --dry-run to validate config without browser actions.
- [ ] 2.4 Emit structured summaries via Glazed (coverage/stories list placeholders).

- [ ] 3.1 Implement browser driver abstraction (chromedp first).
- [ ] 3.2 Implement capture mode: full-page screenshots (original + react).
- [ ] 3.3 Implement capture mode: per-section screenshots + presence/visibility checks.
- [ ] 3.4 Write capture JSON manifest and minimal Markdown summary.

- [ ] 4.1 Implement cssdiff mode: computed styles via getComputedStyle.
- [ ] 4.2 Implement bounds + attributes capture (getBoundingClientRect + getAttribute).
- [ ] 4.3 Render cssdiff JSON + Markdown diff table.

- [ ] 5.1 Implement matched-styles mode (CDP CSS.getMatchedStylesForNode).
- [ ] 5.2 Implement winner summary per property (original vs react).
- [ ] 5.3 Render matched-styles JSON + Markdown report.

- [ ] 6.1 Implement AI review mode stub (ocr_question wiring, output schema).
- [ ] 6.2 Add AI client interface and no-op implementation with explicit errors.
- [ ] 6.3 Render AI review Markdown + JSON.

- [ ] 7.1 Add selector coverage audit summary (missing/hidden/stale).
- [ ] 7.2 Add Storybook story discovery (index.json fetch + list command).
- [ ] 7.3 Integrate coverage + story discovery into Glazed outputs.
