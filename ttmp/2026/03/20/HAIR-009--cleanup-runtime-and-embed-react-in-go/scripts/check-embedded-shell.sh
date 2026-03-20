#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1:8080}"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

root_headers="$tmpdir/root.headers"
booking_body="$tmpdir/booking.html"

curl -fsS -D "$root_headers" -o /dev/null "${base_url}/"
status_code="$(awk 'NR==1 {print $2}' "$root_headers")"
location="$(awk 'BEGIN{IGNORECASE=1} /^Location:/ {print $2}' "$root_headers" | tr -d '\r')"

if [[ "$status_code" != "307" && "$status_code" != "302" && "$status_code" != "308" ]]; then
  echo "expected redirect from /, got status ${status_code}" >&2
  exit 1
fi

if [[ "$location" != "/booking" && "$location" != "${base_url}/booking" ]]; then
  echo "expected redirect to /booking, got ${location}" >&2
  exit 1
fi

curl -fsS "${base_url}/booking" >"$booking_body"

if ! rg -q '<div id="root"></div>' "$booking_body"; then
  echo "expected React root in /booking HTML" >&2
  exit 1
fi

if rg -q '/static/app\\.css|Login with Keycloak|Keycloak bootstrap' "$booking_body"; then
  echo "detected legacy inspector shell markers in /booking HTML" >&2
  exit 1
fi

curl -fsS "${base_url}/api/info" >/dev/null

echo "embedded shell looks healthy at ${base_url}"
