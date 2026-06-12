# Tasks

## TODO

- [x] Add tasks here

- [x] Map the current css-visual-diff architecture and identify which subsystems can serve as Go-backed primitives for a JavaScript DSL.
- [x] Design a sandboxed JavaScript DSL focused on region selection, evidence gathering, diffs, reporting, and optional visual-LLM handoff.
- [x] Write a detailed intern-grade analysis/design/implementation guide with prose, bullets, diagrams, pseudocode, API sketches, examples, and file references.
- [x] Maintain a chronological diary and relate the key current-state files and proposed implementation surfaces.
- [x] Validate the ticket with docmgr doctor and upload the document bundle to reMarkable.
- [x] Study go-go-goja runtime composition, jsverbs scanning/command/runtime layers, and the existing docs/playbooks under pkg/doc to design how css-visual-diff should embed scripted verbs as full Glazed commands.

## Implementation TODO

- [x] Add detailed implementation tasks for the go-go-goja/jsverbs integration work and keep them updated as execution progresses.
- [x] Add go-go-goja as a dependency in css-visual-diff and prove the selected engine/jsverbs APIs compile cleanly in this repo.
- [x] Extract a reusable compare service from the current compare mode so host modules can call it without going through the CLI/report path.
- [x] Add a DSL/runtime package in css-visual-diff that scans embedded scripts, registers shared sections, and provides a custom jsverbs invoker backed by a caller-owned go-go-goja runtime.
- [x] Implement the first runtime-scoped host modules/registrars for css-visual-diff (at minimum diff/report, optionally page) and wire them into the runtime builder.
- [x] Add embedded default scripts that expose real script-backed verbs under the css-visual-diff root command.
- [x] Add root-level logging integration and register the generated script verbs as full Glazed/Cobra commands with normal help and output behavior.
- [x] Add automated tests and/or smoke scripts covering embedded verb discovery, execution, and the logging-enabled CLI path.
- [x] Re-run validation (`go test`, `go build`, relevant `go run` smoke checks, docmgr doctor), update the diary/changelog, and upload the refreshed HAIR-019 bundle to reMarkable.
