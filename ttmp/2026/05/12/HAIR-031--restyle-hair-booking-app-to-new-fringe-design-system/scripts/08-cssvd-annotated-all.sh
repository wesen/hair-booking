#!/usr/bin/env bash
# 08-cssvd-annotated-all.sh — Generate annotated overlay PNGs for all screens using css-visual-diff
# Usage: ./08-cssvd-annotated-all.sh
#
# Requires: gallery server running (03-serve-gallery.sh)
set -euo pipefail

CVD="${CVD:-/home/manuel/.local/bin/css-visual-diff}"
REPO="${USERLAND:-$(dirname "$0")/../../../design-galley/visual-diff/userland/verbs}"
OUT="${OVERLAYS:-$(dirname "$0")/../../../design-galley/overlays}/cssvd"

echo "=== Generating css-visual-diff annotated PNGs ==="
rm -rf "$OUT"
"$CVD" verbs --repository "$REPO" \
  fringe pages annotated-all "$OUT" \
  --output json

echo ""
echo "=== Output ==="
ls -lh "$OUT"/*.png

echo ""
echo "=== To build PDF: ==="
echo "  img2gallery \$OVERLAYS/mobile/content-cropped/*.png \$OUT/*.annotated.png -o /tmp/overlays.pdf"
