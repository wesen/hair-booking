#!/usr/bin/env bash
set -euo pipefail

# Verify that the current Geppetto checkout serializes turns.PayloadKeyImages
# into OpenAI Responses input_image parts and that css-visual-diff's legacy
# ai-review mode is wired to the Geppetto-backed image question client.
#
# Set RUN_LIVE=1 to also run a live css-visual-diff llm-review smoke using
# the HAIR-020 fixture pages and the gpt-5-nano-low profile.

ROOT="/home/manuel/workspaces/2026-04-21/hair-v2"
TICKET_DIR="${ROOT}/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis"
OUT_DIR="${TICKET_DIR}/various/05-geppetto-image-support-and-ai-review-wiring"
CSSVD="${ROOT}/css-visual-diff"
GEPPETTO="${ROOT}/geppetto"
PINOCCHIO="${ROOT}/pinocchio"
FIXTURES="${ROOT}/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/sources/01-llm-review-live-smoke"

rm -rf "${OUT_DIR}"
mkdir -p "${OUT_DIR}"

log() {
  printf '\n=== %s ===\n' "$*"
}

log "Geppetto openai_responses image serialization tests"
(
  cd "${GEPPETTO}"
  GOWORK=off go test ./pkg/steps/ai/openai_responses -run 'TestBuildInputItems.*Image|TestTokenCount.*Image|Image' -count=1
) | tee "${OUT_DIR}/01-geppetto-openai-responses-image-tests.log"

log "Pinocchio profile bootstrap compatibility tests"
(
  cd "${PINOCCHIO}"
  GOWORK=off go test ./pkg/cmds/profilebootstrap -count=1
) | tee "${OUT_DIR}/02-pinocchio-profilebootstrap-tests.log"

log "css-visual-diff unit tests"
(
  cd "${CSSVD}"
  GOWORK=off go test ./...
) | tee "${OUT_DIR}/03-css-visual-diff-tests.log"

log "css-visual-diff build"
(
  cd "${CSSVD}"
  GOWORK=off go build ./cmd/css-visual-diff
) | tee "${OUT_DIR}/04-css-visual-diff-build.log"

log "run command exposes ai-review profile flags"
(
  cd "${CSSVD}"
  GOWORK=off go run ./cmd/css-visual-diff run --help | rg 'ai-review|profile|profile-config-file'
) | tee "${OUT_DIR}/05-run-help-profile-flags.log"

if [[ "${RUN_LIVE:-0}" == "1" ]]; then
  log "LIVE llm-review smoke with HAIR-020 fixtures"
  LIVE_OUT="${OUT_DIR}/live-smoke-out"
  rm -rf "${LIVE_OUT}"
  mkdir -p "${LIVE_OUT}"
  (
    cd "${CSSVD}"
    GOWORK=off go run ./cmd/css-visual-diff llm-review \
      --url1 "file://${FIXTURES}/left.html" \
      --url2 "file://${FIXTURES}/right.html" \
      --selector1 '#card' \
      --selector2 '#card' \
      --profile gpt-5-nano-low \
      --question 'What visual differences are visible in these two cards?' \
      --out "${LIVE_OUT}" \
      --write-markdown=false \
      --write-review-markdown=false
  ) | tee "${OUT_DIR}/06-live-llm-review.log"
else
  log "Skipping live llm-review smoke (set RUN_LIVE=1 to enable)"
fi
