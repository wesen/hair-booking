#!/usr/bin/env bash
set -euo pipefail

TICKET_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis"
ARCHIVE_GLOB="${TICKET_DIR}/analysis/pi-sessions/active/*/*.minitrace.json"

echo "=== Session inventory ==="
go-minitrace query commands \
  --query-repository "${TICKET_DIR}/scripts/query-commands" \
  hair-v2 session-inventory \
  --limit 50 \
  --archive-glob "${ARCHIVE_GLOB}" \
  --output json | tee "${TICKET_DIR}/various/02-session-inventory.json"
