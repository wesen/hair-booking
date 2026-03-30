#!/bin/sh
set -eu

if [ "$#" -gt 0 ]; then
  exec /usr/local/bin/hair-booking "$@"
fi

LISTEN_HOST="${HAIR_BOOKING_LISTEN_HOST:-0.0.0.0}"
LISTEN_PORT="${HAIR_BOOKING_LISTEN_PORT:-8080}"
AUTH_MODE="${HAIR_BOOKING_AUTH_MODE:-oidc}"

set -- /usr/local/bin/hair-booking serve \
  --listen-host "$LISTEN_HOST" \
  --listen-port "$LISTEN_PORT" \
  --auth-mode "$AUTH_MODE"

if [ -n "${HAIR_BOOKING_EXTRA_ARGS:-}" ]; then
  # shellcheck disable=SC2086
  set -- "$@" $HAIR_BOOKING_EXTRA_ARGS
fi

exec "$@"
