# Changelog

## 2026-04-21

- Initial workspace created


## 2026-04-21

Created HAIR-019, mapped the current css-visual-diff architecture, and wrote a detailed design/implementation guide for a sandboxed JavaScript DSL layered on top of Go-backed browser evidence primitives.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — Current CLI architecture analyzed for DSL extraction seams
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/driver/chrome.go — Browser host primitive layer analyzed
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/compare.go — Comparison flow analyzed as the basis for DSL diff services
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/matched_styles.go — Matched-style evidence and cascade winner logic analyzed for DSL design
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/design-doc/01-sandboxed-javascript-dsl-for-css-visual-diff.md — Primary design deliverable
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/reference/01-investigation-diary.md — Chronological investigation record


## 2026-04-21

Validated HAIR-019 with docmgr doctor and uploaded the design-doc + diary bundle to reMarkable at /ai/2026/04/21/HAIR-019.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/design-doc/01-sandboxed-javascript-dsl-for-css-visual-diff.md — Included in the uploaded bundle
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/reference/01-investigation-diary.md — Included in the uploaded bundle


## 2026-04-21

Added a second design document for HAIR-019 after studying go-go-goja's runtime builder, jsverbs pipeline, docs, and playbooks; included a ticket-local smoke experiment and a concrete integration plan for embedded default scripts as full Glazed verbs.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/cmd/jsverbs-example/main.go — Reference for root logging and command registration
- /home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/factory.go — Runtime composition API analyzed for css-visual-diff hosting
- /home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/command.go — Glazed command compilation path analyzed
- /home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/scan.go — Embedded/default script scanning path analyzed
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/design-doc/02-go-go-goja-runtime-and-jsverbs-integration-plan.md — Second implementation document


## 2026-04-21

Ran a go-go-goja/jsverbs smoke experiment, added the second implementation document for HAIR-019, and uploaded an updated three-document bundle to reMarkable at /ai/2026/04/21/HAIR-019.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/design-doc/02-go-go-goja-runtime-and-jsverbs-integration-plan.md — Second implementation document included in the updated reMarkable bundle
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/reference/01-investigation-diary.md — Updated diary with go-go-goja study step
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/scripts/01_go_go_goja_jsverbs_smoke.sh — Experiment script used to validate the go-go-goja/jsverbs integration path
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/various/01-go-go-goja-jsverbs-smoke/output.log — Recorded results from the go-go-goja/jsverbs smoke experiment


## 2026-04-21

Implemented the first go-go-goja/jsverbs integration slice in css-visual-diff: caller-owned runtime host, runtime-scoped diff/report modules, embedded compare scripts, root logging integration, tests, and smoke validation (commit da1a2b4).

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — Root command integration point for generated script verbs
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/host.go — New host runtime implementation
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/registrar.go — Runtime module registrar and module loaders
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/scripts/compare.js — Embedded script-backed verbs
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/services/agent_brief.go — Deterministic report/brief service
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/scripts/02_css_visual_diff_script_verbs_smoke.sh — Smoke validation script for the integrated path


## 2026-04-21

Re-ran code validation for css-visual-diff, passed the integrated script-verb smoke script, and uploaded a refreshed HAIR-019 bundle to reMarkable under a non-overwriting implementation-slice name.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — Validated root command and embedded script-verb help paths
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/host_test.go — Validated embedded verb discovery and execution
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/reference/01-investigation-diary.md — Updated with implementation and validation steps
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/scripts/02_css_visual_diff_script_verbs_smoke.sh — Smoke script used for the integrated validation loop
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/various/02-css-visual-diff-script-verbs-smoke/output.log — Recorded output from the final integrated smoke run

