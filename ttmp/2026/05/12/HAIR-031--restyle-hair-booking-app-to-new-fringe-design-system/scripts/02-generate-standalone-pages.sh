#!/usr/bin/env bash
# 02-generate-standalone-pages.sh — Create standalone HTML pages from the prototype
# Usage: ./02-generate-standalone-pages.sh
#
# Generates 9 mobile + 3 desktop standalone pages under design-galley/standalone/.
# Each page loads design-system.jsx + screen-specific JSX via Babel CDN and renders
# one screen at a fixed viewport. No DesignCanvas wrapper.
set -euo pipefail

DEST="${DESIGN_GALLERY:-/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/design-gallery}"

mkdir -p "$DEST/standalone/mobile" "$DEST/standalone/desktop"

# ── Mobile screens ────────────────────────────────────────────
MOBILE_SCREENS=(
  "01-service:S_Service:01 · Service"
  "02-color:S_Color:02 · Color"
  "03-length:S_Extensions:03 · Length"
  "04-photos:S_Photos:04 · Photos"
  "05-history:S_History:05 · History"
  "06-budget:S_Budget:06 · Budget"
  "07-estimate:S_Estimate:07 · Estimate"
  "08-booking:S_Booking:08 · Booking"
  "09-confirm:S_Confirm:09 · Confirm"
)

for ENTRY in "${MOBILE_SCREENS[@]}"; do
  IFS=':' read -r slug comp title <<< "$ENTRY"
  cat > "$DEST/standalone/mobile/${slug}.html" << HTMLEOF
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Fringe — ${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Anton&family=Oswald:wght@400;600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; background: #f6efe4; color: #111; height: 100%; }
  #root { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  * { box-sizing: border-box; }
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
<script type="text/babel" src="../../design-system.jsx"></script>
<script type="text/babel" src="../../intake-fs.jsx"></script>
<script type="text/babel">
  const { ${comp} } = window;
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement('div', {
      style: {
        width: 390, height: 844, borderRadius: 48,
        background: '#ffffff',
        border: '8px solid #1a1a1a',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(17,17,17,0.18)',
        position: 'relative',
      }
    }, React.createElement(${comp}))
  );
</script>
</body>
</html>
HTMLEOF
  echo "  mobile/${slug}.html"
done

# ── Desktop screens ────────────────────────────────────────────
DESKTOP_SCREENS=(
  "07-estimate-butter:D_Estimate_Butter:07 · Estimate — Butter"
  "08-booking-sage:D_Booking_Sage:08 · Booking — Sage"
  "09-confirm-butter:D_Confirm_Butter:09 · Confirm — Butter"
)

for ENTRY in "${DESKTOP_SCREENS[@]}"; do
  IFS=':' read -r slug comp title <<< "$ENTRY"
  cat > "$DEST/standalone/desktop/${slug}.html" << HTMLEOF
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Fringe — ${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Anton&family=Oswald:wght@400;600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; background: #f6efe4; color: #111; height: 100%; }
  #root { width: 100%; height: 100%; }
  * { box-sizing: border-box; }
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
<script type="text/babel" src="../../design-system.jsx"></script>
<script type="text/babel" src="../../intake-fs.jsx"></script>
<script type="text/babel" src="../../intake-desktop.jsx"></script>
<script type="text/babel">
  const { ${comp} } = window;
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement('div', {
      style: {
        width: 1440, height: 900,
        background: '#fff',
        boxShadow: '0 24px 60px rgba(17,17,17,0.18)',
        overflow: 'hidden',
      }
    }, React.createElement(${comp}))
  );
</script>
</body>
</html>
HTMLEOF
  echo "  desktop/${slug}.html"
done

# ── Index page ────────────────────────────────────────────────
cat > "$DEST/standalone/index.html" << 'INDEXEOF'
<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Fringe — Standalone Prototype Pages</title>
<style>
  body { margin: 0; padding: 32px; background: #f6efe4; color: #111; font: 14px/1.5 Inter, system-ui, sans-serif; }
  h1 { margin: 0 0 24px; font-family: 'Anton', Impact, sans-serif; font-size: 32px; text-transform: uppercase; letter-spacing: -0.5px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 32px; }
  .card { background: #fff; border: 1px solid #ebe7df; border-radius: 10px; padding: 14px 16px; }
  a { color: #6b3a4a; text-decoration: none; font-weight: 700; }
  a:hover { text-decoration: underline; }
  .label { display: block; margin-top: 4px; font-size: 12px; color: #9a958e; }
</style>
</head>
<body>
<h1>Fringe — Standalone Prototype Pages</h1>
<h2>Mobile Intake Flow (390×844)</h2>
<div class="grid">
  <div class="card"><a href="mobile/01-service.html">01 · Service</a><span class="label">Service selection screen</span></div>
  <div class="card"><a href="mobile/02-color.html">02 · Color</a><span class="label">Color level picker</span></div>
  <div class="card"><a href="mobile/03-length.html">03 · Length</a><span class="label">Hair length + extensions</span></div>
  <div class="card"><a href="mobile/04-photos.html">04 · Photos</a><span class="label">Photo upload screen</span></div>
  <div class="card"><a href="mobile/05-history.html">05 · History</a><span class="label">Hair history + condition</span></div>
  <div class="card"><a href="mobile/06-budget.html">06 · Budget</a><span class="label">Budget range selection</span></div>
  <div class="card"><a href="mobile/07-estimate.html">07 · Estimate</a><span class="label">Price estimate summary</span></div>
  <div class="card"><a href="mobile/08-booking.html">08 · Booking</a><span class="label">Calendar + stylist booking</span></div>
  <div class="card"><a href="mobile/09-confirm.html">09 · Confirm</a><span class="label">Booking confirmation</span></div>
</div>
<h2>Desktop Intake (1440×900)</h2>
<div class="grid">
  <div class="card"><a href="desktop/07-estimate-butter.html">07 · Estimate — Butter</a><span class="label">Desktop estimate, butter accent</span></div>
  <div class="card"><a href="desktop/08-booking-sage.html">08 · Booking — Sage</a><span class="label">Desktop booking, sage accent</span></div>
  <div class="card"><a href="desktop/09-confirm-butter.html">09 · Confirm — Butter</a><span class="label">Desktop confirmation, butter accent</span></div>
</div>
</body>
</html>
INDEXEOF
echo "  index.html"
echo "=== Done. $(ls "$DEST/standalone/mobile/"*.html | wc -l) mobile + $(ls "$DEST/standalone/desktop/"*.html | wc -l) desktop pages ==="
