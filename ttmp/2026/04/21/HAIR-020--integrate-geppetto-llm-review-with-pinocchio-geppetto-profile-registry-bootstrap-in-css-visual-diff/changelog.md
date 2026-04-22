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

