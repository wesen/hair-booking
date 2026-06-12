# Changelog

## 2026-04-21

- Initial workspace created.
- Analyzed `css-visual-diff`'s current stubbed AI review path and the legacy Python OpenAI Vision prototype.
- Studied Geppetto's current inference/profile model and Pinocchio's profile/bootstrap lifecycle.
- Decided that the correct integration path is Geppetto-backed inference plus Pinocchio-compatible profile/config bootstrap, rather than direct provider SDK calls.
- Wrote the first HAIR-020 implementation analysis and guide for profile-backed multimodal LLM review in `css-visual-diff`.
- Related the key source/docs files, passed `docmgr doctor`, and uploaded the ticket bundle to reMarkable under `/ai/2026/04/21/HAIR-020`.
- Landed the first Phase 1 code slice in `css-visual-diff`: local Pinocchio/Geppetto module wiring, a reusable bootstrap helper for profile/config resolution, and a focused test proving profile selection changes the resolved model.
- Added a reusable Geppetto-backed compare-review service plus the first product-facing `css-visual-diff llm-review` command, including deterministic tests and a ticket-local help smoke script.
- Committed the first two code slices in `css-visual-diff` and uploaded a refreshed HAIR-020 implementation-progress bundle to reMarkable.
- Added `--print-inference-settings` parity to `css-visual-diff llm-review`, compared its resolved settings against real Pinocchio output, and verified a live `gpt-5-nano-low` review run against saved ticket fixtures.


## 2026-04-21

Added llm-review --print-inference-settings parity, verified css-visual-diff against real Pinocchio profile resolution for gpt-5-nano-low and default, and captured a live gpt-5-nano-low llm-review smoke using ticket fixtures.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go — llm-review command now supports --print-inference-settings
- /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/llm/bootstrap.go — Inference-settings debug writer added for llm-review parity
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/scripts/02_compare_pinocchio_and_cssvd_inference_settings.sh — Profile-resolution comparison script
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/scripts/03_live_gpt5_nano_low_llm_review_smoke.sh — Live gpt-5-nano-low llm-review smoke
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/sources/01-llm-review-live-smoke/left.html — Reusable left fixture for live llm-review smoke
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/sources/01-llm-review-live-smoke/right.html — Reusable right fixture for live llm-review smoke

