#!/usr/bin/env bash
set -euo pipefail

CSSVD_REPO="/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff"
FIXTURE_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/sources/01-llm-review-live-smoke"
OUT_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/various/03-live-gpt5-nano-low-llm-review-smoke"
mkdir -p "$OUT_DIR"

PORT=$(python3 - <<'PY'
import socket
s=socket.socket()
s.bind(('127.0.0.1', 0))
print(s.getsockname()[1])
s.close()
PY
)

cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

cd "$FIXTURE_DIR"
python3 -m http.server "$PORT" --bind 127.0.0.1 >"$OUT_DIR/http-server.log" 2>&1 &
SERVER_PID=$!
sleep 1

cd "$CSSVD_REPO"
GOWORK=off go run ./cmd/css-visual-diff llm-review \
  --profile gpt-5-nano-low \
  --url1 "http://127.0.0.1:$PORT/left.html" \
  --selector1 '#cta' \
  --url2 "http://127.0.0.1:$PORT/right.html" \
  --selector2 '#cta' \
  --viewport-w 390 \
  --viewport-h 844 \
  --question "What are the main visual differences and likely CSS causes?" \
  --write-markdown=false \
  --write-review-markdown=false \
  --out "$OUT_DIR/out" | tee "$OUT_DIR/output.log"

echo "Saved output to $OUT_DIR/output.log"
