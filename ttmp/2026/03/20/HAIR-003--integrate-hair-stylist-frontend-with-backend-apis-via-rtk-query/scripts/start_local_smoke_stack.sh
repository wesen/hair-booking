#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../../../../../../.. && pwd)"
REPO_DIR="${ROOT_DIR}/hair-booking"
BACKEND_SESSION="${BACKEND_SESSION:-hb-backend}"
WEB_SESSION="${WEB_SESSION:-hb-web}"
APP_PORT="${APP_PORT:-8080}"
KEYCLOAK_PORT="${KEYCLOAK_PORT:-18090}"
WEB_PORT="${WEB_PORT:-5173}"
DATABASE_URL="${HAIR_BOOKING_DATABASE_URL:-postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable}"

cd "${REPO_DIR}"

docker compose -f docker-compose.local.yml up -d app-postgres

if ! tmux has-session -t "${BACKEND_SESSION}" 2>/dev/null; then
  tmux new-session -d -s "${BACKEND_SESSION}" "cd '${REPO_DIR}' && exec zsh -i"
fi

if ! tmux has-session -t "${WEB_SESSION}" 2>/dev/null; then
  tmux new-session -d -s "${WEB_SESSION}" "cd '${REPO_DIR}' && exec zsh -i"
fi

tmux send-keys -t "${BACKEND_SESSION}" "HAIR_BOOKING_DATABASE_URL='${DATABASE_URL}' make run-local-oidc APP_PORT=${APP_PORT} KEYCLOAK_PORT=${KEYCLOAK_PORT} SESSION_SECRET=local-session-secret" C-m
tmux send-keys -t "${WEB_SESSION}" "npm --prefix web run dev -- --host 127.0.0.1 --port ${WEB_PORT}" C-m

echo "Backend session: ${BACKEND_SESSION}"
echo "Web session: ${WEB_SESSION}"
echo "Expected backend URL: http://127.0.0.1:${APP_PORT}"
echo "Preferred web URL: http://127.0.0.1:${WEB_PORT}"
echo "Inspect actual Vite port with: tmux capture-pane -pt ${WEB_SESSION}"
