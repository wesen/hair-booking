#!/usr/bin/env bash
# smoke-inspect-screen.sh — Verify inspectScreen verb works for one screen
# Requires: gallery server running on $GALLERY_PORT (default 7071)
set -euo pipefail

CVD="${CVD:-/home/manuel/.local/bin/css-visual-diff}"
REPO="${USERLAND:-$(dirname "$0")/..}"
PORT="${GALLERY_PORT:-7071}"
OUT="/tmp/fringe-smoke-inspect"

echo "=== smoke: inspect screen 'service' ==="
"$CVD" verbs --repository "$REPO/verbs" \
  fringe pages inspect-screen service \
  --prototypeBase "http://localhost:$PORT" \
  --output json 2>&1 | tee "$OUT.json"

echo ""
if grep -q '"exists": true' "$OUT.json" 2>/dev/null; then
  echo "PASS: selector found, element exists"
else
  echo "WARN: selector not found or unexpected output"
fi
