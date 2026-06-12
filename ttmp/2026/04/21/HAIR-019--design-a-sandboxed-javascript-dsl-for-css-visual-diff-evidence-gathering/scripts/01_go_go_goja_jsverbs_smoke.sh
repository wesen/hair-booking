#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja"
OUT_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/various/01-go-go-goja-jsverbs-smoke"
mkdir -p "$OUT_DIR"
LOG="$OUT_DIR/output.log"

{
  echo "# go-go-goja jsverbs smoke"
  echo
  echo "## go test"
  (cd "$ROOT" && GOWORK=off go test ./pkg/jsverbs ./cmd/jsverbs-example -count=1)
  echo
  echo "## list discovered verbs (debug logging)"
  (cd "$ROOT" && GOWORK=off go run ./cmd/jsverbs-example --log-level debug --dir ./testdata/jsverbs list)
  echo
  echo "## greet command"
  (cd "$ROOT" && GOWORK=off go run ./cmd/jsverbs-example --dir ./testdata/jsverbs basics greet Manuel --excited)
  echo
  echo "## text writer command"
  (cd "$ROOT" && GOWORK=off go run ./cmd/jsverbs-example --dir ./testdata/jsverbs basics banner Manuel)
  echo
  echo "## shared section + context binding command"
  (cd "$ROOT" && GOWORK=off go run ./cmd/jsverbs-example --dir ./testdata/jsverbs basics list-issues go-go-golems/go-go-goja --state closed --labels bug --labels docs)
} | tee "$LOG"

echo "wrote $LOG"
