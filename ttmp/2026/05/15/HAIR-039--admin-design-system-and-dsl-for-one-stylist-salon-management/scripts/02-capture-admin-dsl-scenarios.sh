#!/usr/bin/env bash
set -euo pipefail

STORYBOOK_URL="${STORYBOOK_URL:-http://127.0.0.1:6006}"
OUT_DIR="${OUT_DIR:-ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/admin-dsl-scenarios-latest}"
VIEWPORT_W="${VIEWPORT_W:-390}"
VIEWPORT_H="${VIEWPORT_H:-844}"
SELECTOR="${SELECTOR:-[data-admin-dsl-page]}"
WAIT_MS="${WAIT_MS:-1200}"

stories=(
  "admin-dsl-services-scenarios--default"
  "admin-dsl-services-scenarios--selected-row"
  "admin-dsl-services-scenarios--confirm-open"
  "admin-dsl-services-scenarios--validation-error"
  "admin-dsl-services-scenarios--save-pending"
  "admin-dsl-services-scenarios--permission-restricted"
  "admin-dsl-services-scenarios--msw-click-through-save"
  "admin-dsl-surfaces-catalog--matrix"
  "admin-dsl-resources-form-lifecycle--validation-error"
  "admin-dsl-adaptive-policies--mobile"
  "admin-dsl-adaptive-policies--desktop"
)

# Review guidance:
# - Treat these captures as manual/VLM review artifacts by default.
# - Promote only stable, deterministic stories to CI-grade visual regression.
# - Prefer MSW/static scenario stories over live backend stories for CI screenshots.

mkdir -p "$OUT_DIR"

for story in "${stories[@]}"; do
  out="$OUT_DIR/$story"
  mkdir -p "$out"
  url="$STORYBOOK_URL/iframe.html?id=$story&viewMode=story"
  echo "Capturing $story"
  css-visual-diff compare \
    --url1 "$url" \
    --selector1 "$SELECTOR" \
    --url2 "$url" \
    --selector2 "$SELECTOR" \
    --viewport-w "$VIEWPORT_W" \
    --viewport-h "$VIEWPORT_H" \
    --wait-ms1 "$WAIT_MS" \
    --wait-ms2 "$WAIT_MS" \
    --threshold 0 \
    --out "$out"
done
