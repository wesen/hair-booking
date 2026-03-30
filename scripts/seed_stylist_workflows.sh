#!/usr/bin/env bash
set -euo pipefail

ROOT="${HAIR_BOOKING_REPO_ROOT:-$(git rev-parse --show-toplevel)}"
DB_URL="${HAIR_BOOKING_DATABASE_URL:-postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable}"

psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$ROOT/dev/sql/seed_stylist_workflows.sql"
