#!/usr/bin/env bash
# smoke-list-targets.sh — Verify listTargets verb works
set -euo pipefail

CVD="${CVD:-/home/manuel/.local/bin/css-visual-diff}"
REPO="${USERLAND:-$(dirname "$0")/..}"

echo "=== smoke: list targets ==="
"$CVD" verbs --repository "$REPO/verbs" \
  fringe pages list-targets --output json 2>&1

echo ""
echo "PASS: list-targets returned successfully"
