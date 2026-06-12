#!/usr/bin/env bash
# 06-generate-overlays.sh — Draw labeled component bounding boxes on screenshots
# Usage: ./06-generate-overlays.sh [mobile|desktop|all]
#
# Reads component JSON from $ANALYSIS/ and draws colored bounding boxes + labels
# on top of the original screenshots, saving to $OVERLAYS/.
set -euo pipefail

SCREENSHOTS="${SCREENSHOTS:-$(dirname "$0")/../../../design-galley/screenshots}"
ANALYSIS="${ANALYSIS:-$(dirname "$0")/../../../design-galley/analysis}"
OVERLAYS="${OVERLAYS:-$(dirname "$0")/../../../design-galley/overlays}"
mkdir -p "$OVERLAYS/mobile" "$OVERLAYS/desktop"

MODE="${1:-all}"

# Colors for different component types
# atom=green, molecule=blue, organism=orange, chrome=gray
TYPE_COLORS='{"atom":"#22c55e","molecule":"#3b82f6","organism":"#f97316","chrome":"#9ca3af"}'

generate_overlay() {
  local img="$1"
  local json="$2"
  local out="$3"
  local slug="$4"

  if [ ! -f "$json" ] || [ ! -s "$json" ]; then
    echo "  skip $slug (no analysis JSON)"
    return
  fi

  echo "  overlay $slug..."

  # Use ImageMagick to draw bounding boxes + labels
  # Build a series of -draw commands from the JSON
  python3 - << PYEOF
import json, subprocess, sys, os

img = "$img"
json_path = "$json"
out_path = "$out"
type_colors = $TYPE_COLORS

with open(json_path) as f:
    text = f.read().strip()
    # Strip markdown code fences if present
    if text.startswith("\`\`\`"):
        text = "\n".join(text.split("\n")[1:])
    if text.endswith("\`\`\`"):
        text = "\n".join(text.split("\n")[:-1])
    components = json.loads(text)

# Start with the original image
cmd = ["convert", img]

for c in components:
    b = c.get("bounds", {})
    x = b.get("x", 0)
    y = b.get("y", 0)
    w = b.get("width", 100)
    h = b.get("height", 50)
    ctype = c.get("type", "organism")
    color = type_colors.get(ctype, "#f97316")
    name = c.get("name", "?")

    # Draw rectangle
    cmd.extend([
        "-stroke", color,
        "-strokewidth", "2",
        "-fill", "none",
        "-draw", f"rectangle {x},{y} {x+w},{y+h}",
    ])

    # Draw label background + text
    label_y = max(y - 2, 12)
    cmd.extend([
        "-stroke", "none",
        "-fill", color,
        "-draw", f"rectangle {x},{label_y-12} {x+len(name)*7+8},{label_y+2}",
        "-fill", "white",
        "-pointsize", "10",
        "-draw", f"text {x+3},{label_y} '{name}'",
    ])

cmd.append(out_path)
subprocess.run(cmd, check=True)
print(f"  -> {out_path} ({os.path.getsize(out_path)} bytes)")
PYEOF
}

echo "=== Generating overlay images ==="

if [ "$MODE" = "mobile" ] || [ "$MODE" = "all" ]; then
  for slug in 01-service 02-color 03-length 04-photos 05-history 06-budget 07-estimate 08-booking 09-confirm; do
    generate_overlay \
      "$SCREENSHOTS/mobile/${slug}.png" \
      "$ANALYSIS/${slug}-components.json" \
      "$OVERLAYS/mobile/${slug}-overlay.png" \
      "$slug"
  done
fi

if [ "$MODE" = "desktop" ] || [ "$MODE" = "all" ]; then
  for slug in 07-estimate-butter 08-booking-sage 09-confirm-butter; do
    generate_overlay \
      "$SCREENSHOTS/desktop/${slug}.png" \
      "$ANALYSIS/${slug}-components.json" \
      "$OVERLAYS/desktop/${slug}-overlay.png" \
      "$slug"
  done
fi

echo "=== Done. Overlay images in $OVERLAYS/ ==="
