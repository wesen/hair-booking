#!/usr/bin/env bash
set -euo pipefail

TICKET_DIR="/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis"
ARCHIVE_GLOB="${TICKET_DIR}/analysis/pi-sessions/active/*/*.minitrace.json"
QUERY_REPO="${TICKET_DIR}/scripts/query-commands"

run_search() {
  local keyword="$1"
  local outfile="$2"
  echo "=== Searching bash for: ${keyword} ==="
  go-minitrace query commands \
    --query-repository "${QUERY_REPO}" \
    hair-v2 bash-keyword-search \
    --keyword "%${keyword}%" \
    --limit 100 \
    --archive-glob "${ARCHIVE_GLOB}" \
    --output json | tee "${outfile}"
  echo ""
}

mkdir -p "${TICKET_DIR}/various"

run_search "css-visual-diff" "${TICKET_DIR}/various/03-bash-css-visual-diff.json"
run_search "geppetto"      "${TICKET_DIR}/various/03-bash-geppetto.json"
run_search "pinocchio"     "${TICKET_DIR}/various/03-bash-pinocchio.json"
run_search "go-go-goja"    "${TICKET_DIR}/various/03-bash-go-go-goja.json"
run_search "llm-review"    "${TICKET_DIR}/various/03-bash-llm-review.json"
run_search "compare"       "${TICKET_DIR}/various/03-bash-compare.json"
run_search "test"          "${TICKET_DIR}/various/03-bash-test.json"
run_search "build"         "${TICKET_DIR}/various/03-bash-build.json"
