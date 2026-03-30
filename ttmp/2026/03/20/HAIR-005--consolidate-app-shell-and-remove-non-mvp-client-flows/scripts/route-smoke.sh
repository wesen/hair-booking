#!/usr/bin/env bash
set -euo pipefail

frontend_base="${FRONTEND_BASE_URL:-http://127.0.0.1:5175}"
backend_base="${BACKEND_BASE_URL:-http://127.0.0.1:8080}"

check_url() {
  local url="$1"
  echo
  echo "==> $url"
  curl -sS -o /dev/null -w "status=%{http_code} type=%{content_type} redirect=%{redirect_url}\n" "$url"
}

echo "Route smoke"
echo "frontend_base=$frontend_base"
echo "backend_base=$backend_base"

check_url "$frontend_base/"
check_url "$frontend_base/booking"
check_url "$frontend_base/portal"
check_url "$frontend_base/stylist"
check_url "$backend_base/"
check_url "$backend_base/api/info"
check_url "$backend_base/auth/login"
