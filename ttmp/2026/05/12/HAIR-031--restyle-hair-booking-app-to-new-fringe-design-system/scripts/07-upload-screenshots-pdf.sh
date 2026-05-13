#!/usr/bin/env bash
# 07-upload-screenshots-pdf.sh — Create and upload a screenshots PDF to reMarkable
# Usage: ./07-upload-screenshots-pdf.sh
set -euo pipefail

SCREENSHOTS="${SCREENSHOTS:-$(dirname "$0")/../../../design-galley/screenshots}"
OVERLAYS="${OVERLAYS:-$(dirname "$0")/../../../design-galley/overlays}"
RM_DIR="${RM_DIR:-/ai/2026/05/12/HAIR-031}"

TMP="/tmp/fringe-upload"
mkdir -p "$TMP"

echo "=== Building screenshots PDF with img2pdf ==="

# Prefer overlays if they exist, otherwise use originals
pick() {
  local slug="$1"
  local subdir="$2"
  if [ -f "$OVERLAYS/${subdir}/${slug}-overlay.png" ]; then
    echo "$OVERLAYS/${subdir}/${slug}-overlay.png"
  else
    echo "$SCREENSHOTS/${subdir}/${slug}.png"
  fi
}

# Build ordered list of images
IMAGES=()
for slug in 01-service 02-color 03-length 04-photos 05-history 06-budget 07-estimate 08-booking 09-confirm; do
  IMAGES+=("$(pick "$slug" "mobile")")
done
for slug in 07-estimate-butter 08-booking-sage 09-confirm-butter; do
  IMAGES+=("$(pick "$slug" "desktop")")
done

PDF="$TMP/screenshots.pdf"
img2pdf "${IMAGES[@]}" -o "$PDF" 2>&1

echo "  -> $PDF ($(du -h "$PDF" | cut -f1))"

echo "=== Uploading to reMarkable ==="
echo "HAIR-031 Screenshots" | rmapi put "$PDF" "$RM_DIR/" 2>&1

echo "=== Done ==="
