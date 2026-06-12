#!/usr/bin/env bash
set -euo pipefail

# Convert Pi sessions for the hair-v2 workspace to minitrace archives.
# Run from the ticket root.

TICKET_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis"
SESSION_STORE="/home/manuel/.pi/agent/sessions/--home-manuel-workspaces-2026-04-21-hair-v2--"
OUTPUT_DIR="${TICKET_DIR}/analysis/pi-sessions"

echo "=== Discovering Pi sessions for hair-v2 ==="
go-minitrace discover pi --source-dir "${SESSION_STORE}" --output json | tee "${TICKET_DIR}/various/01-discovered-sessions.json"

echo ""
echo "=== Converting Pi sessions ==="
for f in "${SESSION_STORE}"/*.jsonl; do
    echo "Converting: $(basename "$f")"
    go-minitrace convert pi \
        --source-session "$f" \
        --output-dir "${OUTPUT_DIR}"
done

echo ""
echo "=== Conversion complete. Archives in ${OUTPUT_DIR} ==="
find "${OUTPUT_DIR}" -name "*.minitrace.json" | sort
