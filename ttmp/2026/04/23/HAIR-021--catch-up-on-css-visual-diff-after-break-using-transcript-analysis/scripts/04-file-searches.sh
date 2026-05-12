#!/usr/bin/env bash
set -euo pipefail

TICKET_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis"
ARCHIVE_GLOB="${TICKET_DIR}/analysis/pi-sessions/active/*/*.minitrace.json"
QUERY_REPO="${TICKET_DIR}/scripts/query-commands"

run_search() {
  local pattern="$1"
  local outfile="$2"
  echo "=== Searching file touches for: ${pattern} ==="
  go-minitrace query commands \
    --query-repository "${QUERY_REPO}" \
    hair-v2 file-touch-search \
    --filePattern "%${pattern}%" \
    --limit 100 \
    --archive-glob "${ARCHIVE_GLOB}" \
    --output json | tee "${outfile}"
  echo ""
}

mkdir -p "${TICKET_DIR}/various"

run_search "css-visual-diff" "${TICKET_DIR}/various/04-files-css-visual-diff.json"
run_search "internal/cssvisualdiff" "${TICKET_DIR}/various/04-files-internal.json"
run_search "cmd/css-visual-diff" "${TICKET_DIR}/various/04-files-cmd.json"
run_search "dsl" "${TICKET_DIR}/various/04-files-dsl.json"
run_search "llm" "${TICKET_DIR}/various/04-files-llm.json"
run_search "go.mod" "${TICKET_DIR}/various/04-files-gomod.json"
