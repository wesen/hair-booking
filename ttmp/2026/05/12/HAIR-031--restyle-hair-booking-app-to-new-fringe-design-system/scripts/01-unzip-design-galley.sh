#!/usr/bin/env bash
# 01-unzip-design-galley.sh — Extract the hair-booking design prototype
# Usage: ./01-unzip-design-galley.sh
set -euo pipefail

DEST="${DESIGN_GALLERY:-/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/design-galley}"
ZIP="${HOME}/Downloads/hair-booking.zip"
TMP="/tmp/hair-booking-design"

echo "=== Unzipping design prototype ==="
rm -rf "$TMP"
unzip -o "$ZIP" -d "$TMP"

echo "=== Copying JSX sources to design-galley/ ==="
mkdir -p "$DEST"
for f in design-system.jsx intake-fs.jsx intake-desktop.jsx screens.jsx design-canvas.jsx; do
  cp "$TMP/$f" "$DEST/"
  echo "  copied $f"
done

cp -r "$TMP/assets" "$DEST/"
echo "  copied assets/"

echo "=== Done. Source files in $DEST/ ==="
ls "$DEST"/*.jsx
