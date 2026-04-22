# Tasks

## Analysis TODO

- [x] Create the HAIR-020 ticket workspace for Geppetto/Pinocchio-backed LLM integration planning.
- [x] Inspect the current `css-visual-diff` AI/LLM surface, including the stubbed Go client and the legacy Python prototype.
- [x] Inspect current Geppetto profile, inference, runner, and multimodal-turn documentation and examples.
- [x] Inspect current Pinocchio bootstrap/profile-resolution code and docs to understand how final inference settings are assembled.
- [x] Write an implementation analysis and guide describing the recommended integration architecture.
- [x] Maintain a diary documenting the investigation and decisions.
- [x] Validate the new ticket with `docmgr doctor`, relate key files, and upload the bundle to reMarkable.

## Implementation TODO

### Phase 1: bootstrap and reusable inference settings loading

- [x] Expand this ticket into a granular execution checklist before changing code.
- [x] Add local module wiring in `css-visual-diff/go.mod` so the repo can reuse the sibling Pinocchio/Geppetto code paths during local development.
- [x] Add a small internal bootstrap package in `css-visual-diff` that reuses `pinocchio/pkg/cmds/profilebootstrap` to load config/profile registry selections and resolve final inference settings.
- [x] Add unit tests proving that the bootstrap helper loads a temporary profile registry file and that the selected profile changes the resolved model/inference settings.
- [x] Re-run `GOWORK=off go test ./...` and `GOWORK=off go build ./cmd/css-visual-diff` after the bootstrap slice lands.
- [x] Commit the bootstrap/profile-loading slice.

### Phase 2: compare-result LLM review service

- [x] Add a new `internal/cssvisualdiff/llm/` package for Geppetto-backed review execution, prompt building, image packaging, and result extraction.
- [x] Implement multimodal prompt building from `modes.CompareResult` using screenshots plus a compact textual evidence summary.
- [x] Implement a Geppetto-backed review function that builds an engine from the resolved final inference settings and runs inference against the multimodal turn.
- [x] Add typed output structures plus JSON/markdown writers for the LLM review result.
- [x] Add unit tests for prompt building, artifact/image packaging, and assistant-text extraction.
- [x] Re-run validation and commit the reusable review-service slice.

### Phase 3: first product-facing command path

- [x] Add a hand-written `llm-review` command to `cmd/css-visual-diff/main.go` that reuses the existing compare inputs plus `--question`, `--profile`, `--profile-registries`, and `--config-file`.
- [x] Make the command generate compare evidence, call the Geppetto-backed review service, and write `llm-review.json` / `llm-review.md` alongside compare artifacts.
- [x] Add tests and/or a deterministic smoke path showing that profile selection is wired and the command surface is stable even when live credentials are absent.
- [x] Re-run validation and commit the first user-facing LLM command slice.

### Phase 4: legacy seam replacement and JS runtime integration

- [ ] Replace `ai.NoopClient{}` in `internal/cssvisualdiff/modes/ai_review.go` with the real Geppetto-backed implementation or adapt that mode onto the new review service.
- [ ] Add a dedicated `llm` host module to the JS runtime in `internal/cssvisualdiff/dsl/registrar.go`.
- [ ] Add the first script-backed LLM verb such as `script compare llm-brief` or `script compare llm-review`.
- [ ] Add ticket-local smoke scripts for profile resolution and live-provider-gated LLM review under `ttmp/.../HAIR-020.../scripts/`.
- [ ] Update the HAIR-020 diary/changelog/index with implementation outcomes, validation commands, and follow-up tasks.
- [ ] Upload the refreshed HAIR-020 bundle to reMarkable after each meaningful milestone.

