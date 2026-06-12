#!/usr/bin/env bash
set -euo pipefail

REPO="/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff"

echo "==> bootstrap package test"
(
  cd "$REPO"
  GOWORK=off go test ./internal/cssvisualdiff/llm -count=1
)

echo
echo "==> llm-review help"
(
  cd "$REPO"
  GOWORK=off go run ./cmd/css-visual-diff llm-review --help
)
