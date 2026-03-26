#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-}"
VAULT_APPROLE_AUTH_PATH="${VAULT_APPROLE_AUTH_PATH:-approle}"
VAULT_ROLE_ID="${VAULT_ROLE_ID:-}"
VAULT_SECRET_ID="${VAULT_SECRET_ID:-}"
VAULT_KV_MOUNT="${VAULT_KV_MOUNT:-kv}"
VAULT_SECRET_PATH="${VAULT_SECRET_PATH:-apps/hair-booking/prod/ses}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/.config/hair-booking/hosted-keycloak-smtp.env.vault}"

if [[ -z "$VAULT_ADDR" ]]; then
  echo "VAULT_ADDR is required" >&2
  exit 1
fi
if [[ -z "$VAULT_ROLE_ID" ]]; then
  echo "VAULT_ROLE_ID is required" >&2
  exit 1
fi
if [[ -z "$VAULT_SECRET_ID" ]]; then
  echo "VAULT_SECRET_ID is required" >&2
  exit 1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "missing required command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd jq

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

login_path="${VAULT_ADDR%/}/v1/auth/$(printf '%s' "$VAULT_APPROLE_AUTH_PATH" | sed 's#^/*##; s#/*$##')/login"
secret_api_path="${VAULT_ADDR%/}/v1/$(printf '%s' "$VAULT_KV_MOUNT" | sed 's#^/*##; s#/*$##')/data/$(printf '%s' "$VAULT_SECRET_PATH" | sed 's#^/*##; s#/*$##')"

login_body="$tmpdir/login.json"
login_status="$(curl -sS -o "$login_body" -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -X POST "$login_path" \
  --data "$(jq -nc --arg role_id "$VAULT_ROLE_ID" --arg secret_id "$VAULT_SECRET_ID" '{role_id: $role_id, secret_id: $secret_id}')")"

if [[ "$login_status" != "200" ]]; then
  echo "Vault AppRole login failed with status $login_status" >&2
  cat "$login_body" >&2
  exit 1
fi

client_token="$(jq -r '.auth.client_token // empty' "$login_body")"
if [[ -z "$client_token" ]]; then
  echo "Vault AppRole login returned no client token" >&2
  exit 1
fi

secret_body="$tmpdir/secret.json"
secret_status="$(curl -sS -o "$secret_body" -w '%{http_code}' \
  -H "X-Vault-Token: $client_token" \
  "$secret_api_path")"

if [[ "$secret_status" != "200" ]]; then
  echo "Vault secret read failed with status $secret_status for $VAULT_KV_MOUNT/$VAULT_SECRET_PATH" >&2
  cat "$secret_body" >&2
  exit 1
fi

for key in host port username password from_address from_name configuration_set starttls; do
  if [[ "$(jq -r --arg key "$key" '.data.data[$key] // empty' "$secret_body")" == "" ]]; then
    echo "Vault secret is missing required field: $key" >&2
    exit 1
  fi
done

mkdir -p "$(dirname "$OUTPUT_FILE")"
chmod 700 "$(dirname "$OUTPUT_FILE")"

smtp_host="$(jq -r '.data.data.host' "$secret_body")"
smtp_port="$(jq -r '.data.data.port' "$secret_body")"
smtp_username="$(jq -r '.data.data.username' "$secret_body")"
smtp_password="$(jq -r '.data.data.password' "$secret_body")"
smtp_from="$(jq -r '.data.data.from_address' "$secret_body")"
smtp_from_name="$(jq -r '.data.data.from_name' "$secret_body")"
smtp_configuration_set="$(jq -r '.data.data.configuration_set' "$secret_body")"
smtp_starttls="$(jq -r '.data.data.starttls' "$secret_body")"

umask 077
{
  printf 'KEYCLOAK_SMTP_HOST=%q\n' "$smtp_host"
  printf 'KEYCLOAK_SMTP_PORT=%q\n' "$smtp_port"
  printf 'KEYCLOAK_SMTP_USERNAME=%q\n' "$smtp_username"
  printf 'KEYCLOAK_SMTP_PASSWORD=%q\n' "$smtp_password"
  printf 'KEYCLOAK_SMTP_FROM=%q\n' "$smtp_from"
  printf 'KEYCLOAK_SMTP_FROM_DISPLAY_NAME=%q\n' "$smtp_from_name"
  printf 'KEYCLOAK_SMTP_REPLY_TO=%q\n' "$smtp_from"
  printf 'KEYCLOAK_SMTP_REPLY_TO_DISPLAY_NAME=%q\n' "$smtp_from_name"
  printf 'KEYCLOAK_SMTP_STARTTLS=%q\n' "$smtp_starttls"
  printf 'KEYCLOAK_SMTP_SSL=%q\n' "false"
  printf 'KEYCLOAK_SMTP_CONFIGURATION_SET=%q\n' "$smtp_configuration_set"
  printf 'VAULT_SECRET_SOURCE=%q\n' "$VAULT_KV_MOUNT/$VAULT_SECRET_PATH"
} >"$OUTPUT_FILE"

unset client_token smtp_password

echo "Wrote Keycloak SMTP env file from Vault secret $VAULT_KV_MOUNT/$VAULT_SECRET_PATH"
echo "Output file: $OUTPUT_FILE"
echo "No secret values were printed."
