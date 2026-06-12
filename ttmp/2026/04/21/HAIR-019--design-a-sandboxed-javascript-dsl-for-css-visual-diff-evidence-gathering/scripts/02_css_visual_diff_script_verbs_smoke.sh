#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff"
OUT_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/various/02-css-visual-diff-script-verbs-smoke"
FIXTURE_DIR="$OUT_DIR/fixture"
LOG="$OUT_DIR/output.log"
mkdir -p "$FIXTURE_DIR"

cat > "$FIXTURE_DIR/left.html" <<'HTML'
<!doctype html>
<html><body>
<button id="cta" style="padding: 12px 20px; color: rgb(255,255,255); background: rgb(96,45,72); border-radius: 8px;">Book now</button>
</body></html>
HTML

cat > "$FIXTURE_DIR/right.html" <<'HTML'
<!doctype html>
<html><body>
<button id="cta" style="padding: 10px 16px; color: rgb(255,255,255); background: rgb(112,61,89); border-radius: 0px;">Book now</button>
</body></html>
HTML

PORT=$(python3 - <<'PY'
import socket
s = socket.socket()
s.bind(('127.0.0.1', 0))
print(s.getsockname()[1])
s.close()
PY
)
BIN="$OUT_DIR/css-visual-diff"

cd "$FIXTURE_DIR"
python3 -m http.server "$PORT" >/tmp/css-visual-diff-script-verbs-http.log 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
  rm -f "$BIN"
}
trap cleanup EXIT
sleep 1

(cd "$ROOT" && GOWORK=off go build -o "$BIN" ./cmd/css-visual-diff)

{
  echo "# css-visual-diff script verb smoke"
  echo
  echo "## root help"
  "$BIN" --help
  echo
  echo "## script compare brief help"
  "$BIN" script compare brief --help
  echo
  echo "## script compare brief execution"
  "$BIN" --log-level debug script compare brief "What should change?" \
    --leftUrl "http://127.0.0.1:${PORT}/left.html" \
    --rightUrl "http://127.0.0.1:${PORT}/right.html" \
    --leftSelector '#cta' \
    --rightSelector '#cta' \
    --width 390 \
    --height 844
} | tee "$LOG"

echo "wrote $LOG"
