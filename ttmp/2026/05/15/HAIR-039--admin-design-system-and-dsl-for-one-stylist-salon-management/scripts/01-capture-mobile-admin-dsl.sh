#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../../../.." && pwd)"
cd "$ROOT"

STORYBOOK_URL="${STORYBOOK_URL:-http://127.0.0.1:6006}"
OUT_DIR="${OUT_DIR:-ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/mobile-admin-dsl-latest}"
VIEWPORT_W="${VIEWPORT_W:-390}"
VIEWPORT_H="${VIEWPORT_H:-844}"
WAIT_MS="${WAIT_MS:-1000}"

stories=(
  "services-pricing:admin-dsl-rendered-pages--services-pricing"
  "dashboard:admin-dsl-rendered-pages--dashboard"
  "calendar:admin-dsl-rendered-pages--calendar"
)

if ! curl -fsS "$STORYBOOK_URL/index.json" >/dev/null; then
  echo "Storybook is not reachable at $STORYBOOK_URL" >&2
  echo "Start it with: devctl up --profile storybook --force" >&2
  exit 1
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

for entry in "${stories[@]}"; do
  name="${entry%%:*}"
  story_id="${entry#*:}"
  url="$STORYBOOK_URL/iframe.html?id=$story_id&viewMode=story"
  out="$OUT_DIR/$name"
  echo "Capturing $name -> $out" >&2
  css-visual-diff compare \
    --url1 "$url" \
    --selector1 '[data-admin-dsl-page]' \
    --url2 "$url" \
    --selector2 '[data-admin-dsl-page]' \
    --viewport-w "$VIEWPORT_W" \
    --viewport-h "$VIEWPORT_H" \
    --wait-ms1 "$WAIT_MS" \
    --wait-ms2 "$WAIT_MS" \
    --threshold 0 \
    --out "$out"
done

cat <<EOF
Captured Admin DSL mobile screenshots in:
$OUT_DIR

Primary screenshots:
- $OUT_DIR/services-pricing/url1_screenshot.png
- $OUT_DIR/dashboard/url1_screenshot.png
- $OUT_DIR/calendar/url1_screenshot.png
EOF
