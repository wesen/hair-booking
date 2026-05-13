#!/usr/bin/env bash
# 05-analyze-screens.sh — Decompose each screen into named components using pinocchio
# Usage: ./05-analyze-screens.sh [mobile|desktop|all]
set -euo pipefail

SCREENSHOTS="${SCREENSHOTS:-$(dirname "$0")/../../../design-galley/screenshots}"
ANALYSIS="${ANALYSIS:-$(dirname "$0")/../../../design-galley/analysis}"
mkdir -p "$ANALYSIS"

MODE="${1:-all}"

analyze() {
  local img="$1"
  local slug="$2"
  local desc="$3"
  local out="$ANALYSIS/${slug}-components.json"

  if [ -f "$out" ] && [ -s "$out" ]; then
    echo "  skip $slug (already analyzed: $(wc -c < "$out") bytes)"
    return
  fi

  echo "  analyze $slug..."
  PINOCCHIO_PROFILE=gpt-5-low pinocchio code professional \
    --images "$img" \
    "You are a UI design analyst analyzing a mobile app screen for a hair salon booking app called Fringe. This is screen '${desc}'. For each distinct visual component/region you can identify inside the phone screen (ignore the black phone frame border — analyze only the content area inside it), output a JSON array where each entry has: name (descriptive component name), type (atom/molecule/organism/chrome), bounds (estimated {x, y, width, height} in pixels relative to the CONTENT area, not the phone frame), and description (what this component contains). Output ONLY valid JSON, no other text." \
    > "$out" 2>/dev/null
}

echo "=== Analyzing screens ==="

if [ "$MODE" = "mobile" ] || [ "$MODE" = "all" ]; then
  SCREENS=(
    "01-service:Service selection"
    "02-color:Color level picker"
    "03-length:Hair length and extensions"
    "04-photos:Photo upload"
    "05-history:Hair history and condition"
    "06-budget:Budget range selection"
    "07-estimate:Price estimate summary"
    "08-booking:Calendar and time slot booking"
    "09-confirm:Booking confirmation"
  )
  for ENTRY in "${SCREENS[@]}"; do
    IFS=':' read -r slug desc <<< "$ENTRY"
    analyze "$SCREENSHOTS/mobile/${slug}.png" "$slug" "$desc"
  done
fi

if [ "$MODE" = "desktop" ] || [ "$MODE" = "all" ]; then
  DSCREENS=(
    "07-estimate-butter:Desktop estimate with butter accent"
    "08-booking-sage:Desktop booking with sage accent"
    "09-confirm-butter:Desktop confirmation with butter accent"
  )
  for ENTRY in "${DSCREENS[@]}"; do
    IFS=':' read -r slug desc <<< "$ENTRY"
    analyze "$SCREENSHOTS/desktop/${slug}.png" "$slug" "$desc"
  done
fi

echo "=== Done. Analysis JSON files in $ANALYSIS/ ==="
