#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIXTURES_DIR="$ROOT_DIR/fixtures/sbcap-diff-gym"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found"
  exit 1
fi

PORT="$(
  python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
)"

BASE_URL="http://127.0.0.1:${PORT}"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
OUT_BASE="/tmp/sbcap-diff-gym/${RUN_TS}"

echo "sbcap diff gym"
echo "- fixtures: ${FIXTURES_DIR}"
echo "- base url:  ${BASE_URL}"
echo "- out base:  ${OUT_BASE}"
echo ""

mkdir -p "${OUT_BASE}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

(cd "${FIXTURES_DIR}" && python3 -m http.server "${PORT}" --bind 127.0.0.1 >/tmp/sbcap-diff-gym-server-${RUN_TS}.log 2>&1) &
SERVER_PID="$!"
sleep 0.2

run_case() {
  local case_dir="$1"
  local case_name
  case_name="$(basename "${case_dir}")"
  local out_dir="${OUT_BASE}/${case_name}"
  mkdir -p "${out_dir}"

  local tmpl="${case_dir}/sbcap.yaml.tmpl"
  local cfg="${out_dir}/sbcap.yaml"
  sed \
    -e "s|__BASE_URL__|${BASE_URL}|g" \
    -e "s|__OUT_DIR__|${out_dir}|g" \
    "${tmpl}" >"${cfg}"

  echo "== ${case_name}"
  echo "out: ${out_dir}"
  if ! (cd "${ROOT_DIR}" && go run ./cmd/sbcap run --config "${cfg}" --modes capture,pixeldiff,cssdiff,matched-styles --pixeldiff-threshold 30 >"${out_dir}/sbcap.log" 2>&1); then
    echo "FAILED: ${case_name}"
    echo "log: ${out_dir}/sbcap.log"
    tail -n 80 "${out_dir}/sbcap.log" || true
    exit 1
  fi
  echo "ok"
  echo ""
}

for case_dir in "${FIXTURES_DIR}"/case-*; do
  if [[ ! -d "${case_dir}" ]]; then
    continue
  fi
  run_case "${case_dir}"
done

echo "done: ${OUT_BASE}"
