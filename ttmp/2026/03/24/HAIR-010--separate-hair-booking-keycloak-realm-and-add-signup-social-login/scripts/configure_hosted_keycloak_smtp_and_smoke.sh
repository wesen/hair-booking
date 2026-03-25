#!/usr/bin/env bash
set -euo pipefail

REALM="${REALM:-hair-booking}"
CLIENT_ID="${CLIENT_ID:-hair-booking-web}"
REDIRECT_URI="${REDIRECT_URI:-}"
SECRET_FILE="${SECRET_FILE:-$HOME/.config/hair-booking/hosted-keycloak-smtp.env}"
TEST_EMAIL="${TEST_EMAIL:-success@simulator.amazonses.com}"
TEST_USERNAME="${TEST_USERNAME:-hair-booking-ses-smtp-probe}"

TERRAFORM_ROOT="/home/manuel/code/wesen/terraform"

if [[ ! -f "$SECRET_FILE" ]]; then
  echo "missing SMTP secret file: $SECRET_FILE" >&2
  exit 1
fi

source "$TERRAFORM_ROOT/.envrc"
set -a
source "$SECRET_FILE"
set +a

if [[ -z "${TF_VAR_keycloak_url:-}" || -z "${TF_VAR_keycloak_username:-}" || -z "${TF_VAR_keycloak_password:-}" ]]; then
  echo "Keycloak admin credentials are not available through $TERRAFORM_ROOT/.envrc" >&2
  exit 1
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

admin_token="$(curl -fsS -X POST \
  "$TF_VAR_keycloak_url/realms/master/protocol/openid-connect/token" \
  -d grant_type=password \
  -d client_id="$TF_VAR_keycloak_client_id" \
  --data-urlencode "username=$TF_VAR_keycloak_username" \
  --data-urlencode "password=$TF_VAR_keycloak_password" | jq -r .access_token)"

curl -fsS \
  -H "Authorization: Bearer $admin_token" \
  "$TF_VAR_keycloak_url/admin/realms/$REALM" >"$tmpdir/realm.json"

jq \
  --arg host "$KEYCLOAK_SMTP_HOST" \
  --arg port "$KEYCLOAK_SMTP_PORT" \
  --arg user "$KEYCLOAK_SMTP_USERNAME" \
  --arg password "$KEYCLOAK_SMTP_PASSWORD" \
  --arg from "$KEYCLOAK_SMTP_FROM" \
  --arg from_display_name "$KEYCLOAK_SMTP_FROM_DISPLAY_NAME" \
  --arg reply_to "$KEYCLOAK_SMTP_REPLY_TO" \
  --arg reply_to_display_name "$KEYCLOAK_SMTP_REPLY_TO_DISPLAY_NAME" \
  --arg starttls "$KEYCLOAK_SMTP_STARTTLS" \
  --arg ssl "$KEYCLOAK_SMTP_SSL" \
  '
  .smtpServer = {
    host: $host,
    port: $port,
    user: $user,
    password: $password,
    from: $from,
    fromDisplayName: $from_display_name,
    replyTo: $reply_to,
    replyToDisplayName: $reply_to_display_name,
    auth: "true",
    starttls: $starttls,
    ssl: $ssl
  }' \
  "$tmpdir/realm.json" >"$tmpdir/realm-updated.json"

curl -fsS -X PUT \
  -H "Authorization: Bearer $admin_token" \
  -H "Content-Type: application/json" \
  "$TF_VAR_keycloak_url/admin/realms/$REALM" \
  --data @"$tmpdir/realm-updated.json" >/dev/null

probe_user_id="$(
  curl -fsS \
    -H "Authorization: Bearer $admin_token" \
    "$TF_VAR_keycloak_url/admin/realms/$REALM/users?username=$TEST_USERNAME&exact=true" |
    jq -r '.[0].id // empty'
)"

if [[ -z "$probe_user_id" ]]; then
  curl -fsS -D "$tmpdir/create-headers.txt" -o /dev/null \
    -X POST \
    -H "Authorization: Bearer $admin_token" \
    -H "Content-Type: application/json" \
    "$TF_VAR_keycloak_url/admin/realms/$REALM/users" \
    --data @- <<EOF
{
  "username": "$TEST_USERNAME",
  "email": "$TEST_EMAIL",
  "enabled": true,
  "emailVerified": false,
  "firstName": "SES",
  "lastName": "SMTP Probe"
}
EOF
  probe_user_id="$(awk -F/ '/^Location:/ {print $NF}' "$tmpdir/create-headers.txt" | tr -d '\r')"
fi

if [[ -z "$probe_user_id" ]]; then
  probe_user_id="$(
    curl -fsS \
      -H "Authorization: Bearer $admin_token" \
      "$TF_VAR_keycloak_url/admin/realms/$REALM/users?username=$TEST_USERNAME&exact=true" |
      jq -r '.[0].id // empty'
  )"
fi

if [[ -z "$probe_user_id" ]]; then
  echo "failed to resolve probe user id for $TEST_USERNAME" >&2
  exit 1
fi

for action in VERIFY_EMAIL UPDATE_PASSWORD; do
  action_url="$TF_VAR_keycloak_url/admin/realms/$REALM/users/$probe_user_id/execute-actions-email"
  if [[ -n "$REDIRECT_URI" ]]; then
    redirect_uri_encoded="$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$REDIRECT_URI")"
    action_url="${action_url}?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri_encoded}"
  fi
  curl -fsS -X PUT \
    -H "Authorization: Bearer $admin_token" \
    -H "Content-Type: application/json" \
    "$action_url" \
    --data "[\"$action\"]" >/dev/null
done

curl -fsS \
  -H "Authorization: Bearer $admin_token" \
  "$TF_VAR_keycloak_url/admin/realms/$REALM" |
  jq '{realm, verifyEmail, smtpServer: (.smtpServer | {host, port, from, fromDisplayName, replyTo, auth, starttls, ssl, user})}'

echo "Configured SMTP for realm $REALM."
echo "Triggered VERIFY_EMAIL and UPDATE_PASSWORD mail to $TEST_EMAIL using user $TEST_USERNAME."
