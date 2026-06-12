#!/usr/bin/env bash
# 04-screenshot-all-screens.sh — Capture PNG screenshots of all intake screens
# Usage: ./04-screenshot-all-screens.sh
#
# Requires: gallery server running (03-serve-gallery.sh)
# Uses: Playwright MCP (run from pi agent) — this script is a reference/replay
set -euo pipefail

SCREENSHOTS="${SCREENSHOTS:-$(dirname "$0")/../../../design-galley/screenshots}"
GALLERY_URL="http://localhost:${GALLERY_PORT:-7071}"

mkdir -p "$SCREENSHOTS/mobile" "$SCREENSHOTS/desktop"

echo "=== Screenshot capture reference ==="
echo ""
echo "This script is a reference. In practice, screenshots are captured via"
echo "Playwright MCP browser automation. The equivalent Playwright JS is:"
echo ""
cat << 'PLAYWRIGHT'
// ── Mobile screens (viewport 500×920 to capture phone frame) ──
const mobileScreens = [
  { slug: '01-service',  path: '/standalone/mobile/01-service.html' },
  { slug: '02-color',    path: '/standalone/mobile/02-color.html' },
  { slug: '03-length',   path: '/standalone/mobile/03-length.html' },
  { slug: '04-photos',   path: '/standalone/mobile/04-photos.html' },
  { slug: '05-history',  path: '/standalone/mobile/05-history.html' },
  { slug: '06-budget',   path: '/standalone/mobile/06-budget.html' },
  { slug: '07-estimate', path: '/standalone/mobile/07-estimate.html' },
  { slug: '08-booking',  path: '/standalone/mobile/08-booking.html' },
  { slug: '09-confirm',  path: '/standalone/mobile/09-confirm.html' },
];

await page.setViewportSize({ width: 500, height: 920 });
for (const screen of mobileScreens) {
  await page.goto(`http://localhost:7071${screen.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: `design-galley/screenshots/mobile/${screen.slug}.png`,
    clip: { x: 0, y: 0, width: 500, height: 920 },
    type: 'png'
  });
}

// ── Desktop screens (viewport 1480×940) ──
const desktopScreens = [
  { slug: '07-estimate-butter', path: '/standalone/desktop/07-estimate-butter.html' },
  { slug: '08-booking-sage',    path: '/standalone/desktop/08-booking-sage.html' },
  { slug: '09-confirm-butter',  path: '/standalone/desktop/09-confirm-butter.html' },
];

for (const screen of desktopScreens) {
  await page.setViewportSize({ width: 1480, height: 940 });
  await page.goto(`http://localhost:7071${screen.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: `design-galley/screenshots/desktop/${screen.slug}.png`,
    clip: { x: 0, y: 0, width: 1480, height: 940 },
    type: 'png'
  });
}
PLAYWRIGHT

echo ""
echo "=== Output ==="
ls -lh "$SCREENSHOTS/mobile/" 2>/dev/null || echo "(mobile/ not yet captured)"
ls -lh "$SCREENSHOTS/desktop/" 2>/dev/null || echo "(desktop/ not yet captured)"
