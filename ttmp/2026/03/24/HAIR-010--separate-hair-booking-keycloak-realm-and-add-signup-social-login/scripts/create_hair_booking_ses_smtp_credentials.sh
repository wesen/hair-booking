#!/usr/bin/env bash
set -euo pipefail

AWS_PROFILE="${AWS_PROFILE:-manuel}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-745667007186}"
AWS_REGION="${AWS_REGION:-us-east-1}"
SES_IDENTITY="${SES_IDENTITY:-mail.scapegoat.dev}"
SES_CONFIGURATION_SET="${SES_CONFIGURATION_SET:-mail-scapegoat-dev}"
SES_FROM_ADDRESS="${SES_FROM_ADDRESS:-no-reply@mail.scapegoat.dev}"
SES_FROM_NAME="${SES_FROM_NAME:-Hair Booking}"
SMTP_IAM_USER="${SMTP_IAM_USER:-hair-booking-ses-smtp-prod}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/.config/hair-booking/hosted-keycloak-smtp.env}"

DERIVE_SCRIPT="/home/manuel/code/wesen/terraform/ttmp/2026/03/24/TF-002-SES-TERRAFORM--set-up-ses-with-terraform/scripts/derive_ses_smtp_password.py"

if [[ ! -f "$DERIVE_SCRIPT" ]]; then
  echo "missing derive_ses_smtp_password.py at $DERIVE_SCRIPT" >&2
  exit 1
fi

aws_cmd() {
  AWS_PROFILE="$AWS_PROFILE" aws "$@"
}

mkdir -p "$(dirname "$OUTPUT_FILE")"
chmod 700 "$(dirname "$OUTPUT_FILE")"

identity_status="$(aws_cmd sesv2 get-email-identity \
  --region "$AWS_REGION" \
  --email-identity "$SES_IDENTITY" \
  --query 'VerifiedForSendingStatus' \
  --output text)"

if [[ "$identity_status" != "True" ]]; then
  echo "SES identity $SES_IDENTITY is not verified for sending" >&2
  exit 1
fi

if ! aws_cmd iam get-user --user-name "$SMTP_IAM_USER" >/dev/null 2>&1; then
  aws_cmd iam create-user --user-name "$SMTP_IAM_USER" >/dev/null
fi

policy_file="$(mktemp)"
creds_file="$(mktemp)"
trap 'rm -f "$policy_file" "$creds_file"' EXIT

cat >"$policy_file" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ses:SendRawEmail",
      "Resource": [
        "arn:aws:ses:${AWS_REGION}:${AWS_ACCOUNT_ID}:identity/${SES_IDENTITY}",
        "arn:aws:ses:${AWS_REGION}:${AWS_ACCOUNT_ID}:configuration-set/${SES_CONFIGURATION_SET}"
      ]
    }
  ]
}
JSON

aws_cmd iam put-user-policy \
  --user-name "$SMTP_IAM_USER" \
  --policy-name ses-send-raw-mail-scapegoat \
  --policy-document "file://$policy_file" >/dev/null

existing_key_count="$(aws_cmd iam list-access-keys \
  --user-name "$SMTP_IAM_USER" \
  --query 'length(AccessKeyMetadata)' \
  --output text)"

if [[ "$existing_key_count" != "0" ]]; then
  if [[ -f "$OUTPUT_FILE" ]]; then
    echo "Updated IAM policy for existing SMTP user: $SMTP_IAM_USER"
    echo "Reusing existing SMTP secret file: $OUTPUT_FILE"
    echo "No new access key was created."
    exit 0
  fi
  echo "IAM user $SMTP_IAM_USER already has access keys; refusing to create another" >&2
  echo "Rotate or delete the old key first, or provide the existing secret file at $OUTPUT_FILE, then rerun." >&2
  exit 2
fi

aws_cmd iam create-access-key --user-name "$SMTP_IAM_USER" >"$creds_file"

smtp_username="$(jq -r '.AccessKey.AccessKeyId' "$creds_file")"
secret_access_key="$(jq -r '.AccessKey.SecretAccessKey' "$creds_file")"
smtp_password="$(python3 "$DERIVE_SCRIPT" "$secret_access_key" "$AWS_REGION")"

umask 077
{
  printf 'KEYCLOAK_SMTP_HOST=%q\n' "email-smtp.${AWS_REGION}.amazonaws.com"
  printf 'KEYCLOAK_SMTP_PORT=%q\n' "587"
  printf 'KEYCLOAK_SMTP_USERNAME=%q\n' "$smtp_username"
  printf 'KEYCLOAK_SMTP_PASSWORD=%q\n' "$smtp_password"
  printf 'KEYCLOAK_SMTP_FROM=%q\n' "$SES_FROM_ADDRESS"
  printf 'KEYCLOAK_SMTP_FROM_DISPLAY_NAME=%q\n' "$SES_FROM_NAME"
  printf 'KEYCLOAK_SMTP_REPLY_TO=%q\n' "$SES_FROM_ADDRESS"
  printf 'KEYCLOAK_SMTP_REPLY_TO_DISPLAY_NAME=%q\n' "$SES_FROM_NAME"
  printf 'KEYCLOAK_SMTP_STARTTLS=%q\n' "true"
  printf 'KEYCLOAK_SMTP_SSL=%q\n' "false"
} >"$OUTPUT_FILE"

unset secret_access_key smtp_password

echo "Created or updated IAM user: $SMTP_IAM_USER"
echo "Wrote SMTP secret file: $OUTPUT_FILE"
echo "No secrets were printed."
