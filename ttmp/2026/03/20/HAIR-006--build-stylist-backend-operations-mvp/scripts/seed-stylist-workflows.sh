#!/usr/bin/env bash
set -euo pipefail

ROOT="${HAIR_BOOKING_REPO_ROOT:-$(git rev-parse --show-toplevel)}"

exec "$ROOT/scripts/seed_stylist_workflows.sh" "$@"
