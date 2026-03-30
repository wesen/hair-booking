#!/usr/bin/env bash
set -euo pipefail

app_uuid="${1:-uion8lttbypsijf8ww9b4c3e}"
context="${COOLIFY_CONTEXT:-cloud}"
token="${COOLIFY_TOKEN:-}"

if [[ -z "$token" ]]; then
  echo "COOLIFY_TOKEN is required" >&2
  exit 1
fi

coolify --context "$context" --token "$token" deploy uuid "$app_uuid" --format pretty
