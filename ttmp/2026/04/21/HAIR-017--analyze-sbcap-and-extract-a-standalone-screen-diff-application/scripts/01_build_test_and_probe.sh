#!/usr/bin/env bash
set -euo pipefail

REPO="/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking"
OUT_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/various/01-build-test-probe"
mkdir -p "$OUT_DIR"

{
  echo "== go test ./cmd/sbcap ./internal/sbcap/... =="
  (cd "$REPO" && go test ./cmd/sbcap ./internal/sbcap/...)
  echo
  echo "== go build ./cmd/sbcap =="
  (cd "$REPO" && go build ./cmd/sbcap)
  echo
  echo "== go run ./cmd/sbcap --help =="
  (cd "$REPO" && go run ./cmd/sbcap --help)
  echo
  echo "== go run ./cmd/sbcap compare --help =="
  (cd "$REPO" && go run ./cmd/sbcap compare --help)
  echo
  echo "== go run ./cmd/sbcap chromedp-probe --url https://example.com --selector h1 --wait-ms 500 --timeout-ms 15000 =="
  (cd "$REPO" && go run ./cmd/sbcap chromedp-probe --url https://example.com --selector h1 --wait-ms 500 --timeout-ms 15000)
} | tee "$OUT_DIR/output.log"
