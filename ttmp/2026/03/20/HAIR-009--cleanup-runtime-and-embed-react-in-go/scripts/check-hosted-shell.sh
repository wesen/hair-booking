#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-https://hair-booking.app.scapegoat.dev}"

"$(dirname "$0")/check-embedded-shell.sh" "$base_url"

echo "hosted shell check passed for ${base_url}"
