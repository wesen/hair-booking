# Tasks

## TODO

- [x] Add tasks here

- [x] Design sbcap compare UX: flags, defaults, outputs
- [x] Implement sbcap compare engine (capture + cssdiff + matched winners + pixel diff)
- [x] Wire sbcap compare Cobra command into cmd/sbcap
- [x] Add unit tests for pixel diff math (no overflow)
- [x] Run gofmt + go test; update diary; commit code+docs
- [x] Implement sbcap run mode: pixeldiff (reads capture.json, writes pixeldiff.{json,md} + per-section diff PNGs)
- [x] Wire pixeldiff into runner + add sbcap run --pixeldiff-threshold flag
- [x] Refactor pixel-diff helpers to shared code (used by compare + pixeldiff)
- [x] Add tests for pixeldiff mode/outputs and run go test
- [x] Update diary/changelog; commit code + docs
- [x] Add per-target selectors to sbcap YAML: selector_original/selector_react for sections + styles
- [x] Update capture/cssdiff/matched-styles to use per-target selectors; include per-side selectors in outputs
- [x] Add config validation tests for selector mapping
- [x] Run gofmt + go test; update diary/changelog; commit
