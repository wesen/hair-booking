# Tasks

## Analysis TODO

- [x] Create the HAIR-020 ticket workspace for Geppetto/Pinocchio-backed LLM integration planning.
- [x] Inspect the current `css-visual-diff` AI/LLM surface, including the stubbed Go client and the legacy Python prototype.
- [x] Inspect current Geppetto profile, inference, runner, and multimodal-turn documentation and examples.
- [x] Inspect current Pinocchio bootstrap/profile-resolution code and docs to understand how final inference settings are assembled.
- [x] Write an implementation analysis and guide describing the recommended integration architecture.
- [x] Maintain a diary documenting the investigation and decisions.
- [x] Validate the new ticket with `docmgr doctor`, relate key files, and upload the bundle to reMarkable.

## Recommended implementation sequence

- [ ] Add profile-selection support to `css-visual-diff` command surfaces (`--profile`, `--profile-registries`, and likely `--config-file`).
- [ ] Add a bootstrap helper that resolves final inference settings using Pinocchio-compatible profile/config logic.
- [ ] Add a Geppetto-backed LLM client implementation behind the existing AI abstraction.
- [ ] Replace `ai.NoopClient{}` in `internal/cssvisualdiff/modes/ai_review.go` with the real Geppetto-backed implementation.
- [ ] Add a compare-result-based LLM review service reusable from both classic commands and script-backed verbs.
- [ ] Add a first script-backed LLM verb such as `script compare llm-brief`.
- [ ] Add tests and smoke scripts for profile resolution, model selection, and live-provider-gated LLM review.

