#!/usr/bin/env bash
set -euo pipefail

REPO="/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking"
TICKET_ROOT="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application"
FIXTURE_DIR="$TICKET_ROOT/various/02-compare-fixture/site"
OUT_DIR="$TICKET_ROOT/various/02-compare-fixture/output"
LOG="$TICKET_ROOT/various/02-compare-fixture/run.log"
PORT=18765

mkdir -p "$FIXTURE_DIR" "$OUT_DIR"

cat > "$FIXTURE_DIR/original.html" <<'HTML'
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Original Fixture</title>
  <style>
    body { margin: 0; background: #f6efe4; font-family: Georgia, serif; }
    .card {
      width: 320px;
      margin: 40px auto;
      padding: 24px;
      background: #fffaf5;
      border: 1px solid #201a18;
      color: #201a18;
      box-shadow: 0 14px 28px rgba(0,0,0,0.08);
    }
    .eyebrow { font: 11px/1.4 monospace; letter-spacing: 0.18em; text-transform: uppercase; color: #6b3a4a; }
    h1 { margin: 12px 0 8px; font: 700 36px/0.95 Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; text-transform: uppercase; }
    p { margin: 0; font-size: 17px; font-style: italic; color: #5e514b; }
  </style>
</head>
<body>
  <section class="card" id="hero-card">
    <div class="eyebrow">Chapter I · The Ask</div>
    <h1>What brings you in?</h1>
    <p>Pick one to start — you can add more later.</p>
  </section>
</body>
</html>
HTML

cat > "$FIXTURE_DIR/react.html" <<'HTML'
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>React Fixture</title>
  <style>
    body { margin: 0; background: #f8f3ee; font-family: Inter, Arial, sans-serif; }
    .card {
      width: 320px;
      margin: 40px auto;
      padding: 24px;
      background: #ffffff;
      border: 1px solid #dad3cb;
      border-radius: 18px;
      color: #111111;
      box-shadow: 0 14px 28px rgba(0,0,0,0.05);
    }
    .eyebrow { font: 600 11px/1.4 Inter, Arial, sans-serif; letter-spacing: 0.14em; text-transform: uppercase; color: #905162; }
    h1 { margin: 12px 0 8px; font: 700 32px/1.05 Inter, Arial, sans-serif; }
    p { margin: 0; font-size: 16px; color: #5b5b5b; }
  </style>
</head>
<body>
  <section class="card" id="hero-card">
    <div class="eyebrow">Chapter I · The Ask</div>
    <h1>What brings you in?</h1>
    <p>Pick one to start — you can add more later.</p>
  </section>
</body>
</html>
HTML

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

(
  cd "$FIXTURE_DIR"
  python3 -m http.server "$PORT" > "$TICKET_ROOT/various/02-compare-fixture/http.log" 2>&1
) &
SERVER_PID=$!
sleep 1

(
  cd "$REPO"
  go run ./cmd/sbcap compare \
    --url1 "http://127.0.0.1:${PORT}/original.html" \
    --selector1 "#hero-card" \
    --url2 "http://127.0.0.1:${PORT}/react.html" \
    --selector2 "#hero-card" \
    --viewport-w 390 \
    --viewport-h 844 \
    --props "width,height,padding-top,padding-right,padding-bottom,padding-left,font-family,font-size,font-weight,line-height,color,background-color,border-radius,box-shadow" \
    --attrs "id,class" \
    --wait-ms1 200 \
    --wait-ms2 200 \
    --write-markdown=false \
    --out "$OUT_DIR"
) | tee "$LOG"

printf 'Artifacts written to %s\n' "$OUT_DIR" | tee -a "$LOG"
