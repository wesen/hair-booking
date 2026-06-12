#!/usr/bin/env bash
# 03-serve-gallery.sh — Start a static server for the design galley
# Usage: ./03-serve-gallery.sh [port]
set -euo pipefail

PORT="${1:-${GALLERY_PORT:-7071}}"
DIR="${DESIGN_GALLERY:-$(dirname "$0")/../../../design-galley}"

echo "=== Serving design galley at http://localhost:${PORT} ==="
echo "    Directory: $DIR"
echo "    Press Ctrl+C to stop"
echo ""
echo "    Standalone index: http://localhost:${PORT}/standalone/index.html"
echo ""

cd "$DIR"
python3 -m http.server "$PORT"
