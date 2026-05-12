# Changelog

## 2026-04-23

- Initial workspace created


## 2026-04-23

Created inspect verb ticket and implementation plan; confirmed current --config YAML already supports multiple selectors through sections[] and styles[].

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/design-doc/01-inspect-verb-implementation-plan.md — Implementation plan for inspect command and single-file artifact output.
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Diary documenting ticket creation and multi-selector answer.


## 2026-04-23

Refined inspect design with a future merged regions[] authoring schema: one screenshot selector plus nested CSS probes, compiling to current sections[] and styles[].

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/design-doc/01-inspect-verb-implementation-plan.md — Updated with region/schema consolidation recommendation.


## 2026-04-23

Added artifact-specific selector-tuning verb plan: screenshot, css-md, css-json, html, inspect-json, implemented as wrappers around inspect formats.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/design-doc/01-inspect-verb-implementation-plan.md — Updated command design with artifact-specific verbs.


## 2026-04-23

Implemented inspect command, artifact-specific verbs, tests, README examples, and smoke validation; code commit pending.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/README.md — Inspect-first usage documentation.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — New inspect and artifact-specific CLI commands.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/inspect.go — New inspect runtime and artifact writer.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/inspect_test.go — Selector and format tests.
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Detailed implementation diary step.


## 2026-04-23

Committed inspect implementation as 5c7f852dba738c9d2a6e4d13a0db7a9e3238c044 (feat: add inspect artifact commands).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — Committed CLI command wiring.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/inspect.go — Committed inspect runtime.
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Updated diary with commit hash.


## 2026-04-23

Validated inspect artifact verbs against real Pyxis atoms button-primary and badge-confirmed on original/react sides; screenshots and CSS outputs matched for tested properties.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Step 3 records real Pyxis validation.
- /tmp/css-vd-pyxis-inspect — Generated validation artifacts for Pyxis atom inspect runs.


## 2026-04-23

Added embedded Glazed help entries and committed documentation integration as 2c8053bd5a2f1d3a47ff5020109f2564f4b50d84.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — Help system wiring.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/doc/examples/artifact-commands.md — Artifact command examples.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/doc/topics/config-selectors.md — Selector model help topic.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/doc/tutorials/inspect-workflow.md — Inspect-before-compare tutorial.
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Step 4 documentation diary.


## 2026-04-23

Fixed inspect no-arg help behavior and committed as fe1c6fbc3a1399da7765ebffa923e6c4dd12ad1c.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — Manual inspect/artifact validation and help behavior.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main_test.go — No-arg help behavior tests.
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Step 5 records help behavior fix.


## 2026-04-23

Added directory scanning to the existing run verb with --config-dir and committed as 108bab7c897ea7b7e8977704ff078dc9a6d38331.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/README.md — documents co-located config scanning.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — run --config-dir scanner
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main_test.go — directory scanner and config-dir resolver tests.
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/doc/topics/config-selectors.md — embedded help for run --config-dir.
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Step 6 records run --config-dir scanning implementation.


## 2026-04-23

Added embedded Glazed tutorial for authoring co-located story configs with inspect and committed as c872359ff2a7e7271c2605ae0abe8f6670d8486c.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/doc/tutorials/story-config-authoring.md — New Glazed tutorial for inspect-driven story config authoring and run --config-dir comparison.
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/reference/01-implementation-diary.md — Step 7 records story config authoring tutorial.

