#!/usr/bin/env bash
set -euo pipefail

PINOCCHIO_REPO="/home/manuel/workspaces/2026-04-21/hair-v2/pinocchio"
CSSVD_REPO="/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff"
OUT_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/various/02-compare-pinocchio-and-cssvd-inference-settings"
mkdir -p "$OUT_DIR"

run_and_capture() {
  local name="$1"
  shift
  echo "==> $name"
  "$@" >"$OUT_DIR/$name.log" 2>&1
  echo "saved $OUT_DIR/$name.log"
}

run_and_capture pinocchio-explicit-gpt5nano-low \
  bash -lc "cd '$PINOCCHIO_REPO' && GOWORK=off go run ./cmd/pinocchio --profile gpt-5-nano-low code professional --print-inference-settings --non-interactive hello"

run_and_capture pinocchio-default \
  bash -lc "cd '$PINOCCHIO_REPO' && GOWORK=off go run ./cmd/pinocchio code professional --print-inference-settings --non-interactive hello"

run_and_capture cssvd-explicit-gpt5nano-low \
  bash -lc "cd '$CSSVD_REPO' && GOWORK=off go run ./cmd/css-visual-diff llm-review --print-inference-settings --profile gpt-5-nano-low"

run_and_capture cssvd-default \
  bash -lc "cd '$CSSVD_REPO' && GOWORK=off go run ./cmd/css-visual-diff llm-review --print-inference-settings"

extract_summary() {
  local label="$1"
  local file="$2"
  echo "--- $label ---"
  rg -n "api_type:|engine:|max_response_tokens:|reasoning_effort:|reasoning_summary:" "$file" || true
  echo
}

SUMMARY_FILE="$OUT_DIR/summary.txt"
{
  extract_summary "pinocchio explicit gpt-5-nano-low" "$OUT_DIR/pinocchio-explicit-gpt5nano-low.log"
  extract_summary "pinocchio default" "$OUT_DIR/pinocchio-default.log"
  extract_summary "css-visual-diff explicit gpt-5-nano-low" "$OUT_DIR/cssvd-explicit-gpt5nano-low.log"
  extract_summary "css-visual-diff default" "$OUT_DIR/cssvd-default.log"
} | tee "$SUMMARY_FILE"

echo "Saved summary to $SUMMARY_FILE"
