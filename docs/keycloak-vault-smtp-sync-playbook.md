# Keycloak Vault SMTP Sync Playbook

This runbook explains how `hair-booking` is intended to move from the current
local SMTP secret file workflow to a Vault-backed AppRole workflow for updating
the hosted Keycloak realm SMTP configuration.

Use this when you need to:

- read SES SMTP credentials from Vault
- materialize them into the `KEYCLOAK_SMTP_*` shape expected by the app repo
- apply them to hosted realm `hair-booking`
- rerun the Keycloak email smoke flow

This is about the Keycloak SMTP sync path, not the mail-delivery smoke itself.
The delivery smoke remains documented in
[keycloak-ses-verification-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-ses-verification-playbook.md).

## Target Flow

```text
Vault AppRole bootstrap env vars
  -> read kv/apps/hair-booking/prod/ses
    -> write temporary KEYCLOAK_SMTP_* env file
      -> update Keycloak realm hair-booking smtpServer
        -> run verify-email and forgot-password smoke
```

## Canonical Vault Contract

Current intended values:

- `VAULT_ADDR=https://vault.app.scapegoat.dev`
- `VAULT_APPROLE_AUTH_PATH=approle`
- `VAULT_KV_MOUNT=kv`
- `VAULT_SECRET_PATH=apps/hair-booking/prod/ses`

Expected secret payload:

```json
{
  "host": "email-smtp.us-east-1.amazonaws.com",
  "port": "587",
  "username": "<ses access key id>",
  "password": "<derived smtp password>",
  "from_address": "no-reply@mail.scapegoat.dev",
  "from_name": "Hair Booking",
  "configuration_set": "mail-scapegoat-dev",
  "starttls": "true"
}
```

## Required Bootstrap Inputs

These are required to read the Vault secret:

- `VAULT_ADDR`
- `VAULT_APPROLE_AUTH_PATH`
- `VAULT_ROLE_ID`
- `VAULT_SECRET_ID`
- `VAULT_KV_MOUNT`
- `VAULT_SECRET_PATH`

These are still required for the Keycloak admin side:

- `TF_VAR_keycloak_url`
- `TF_VAR_keycloak_client_id`
- `TF_VAR_keycloak_username`
- `TF_VAR_keycloak_password`

The Keycloak admin values are currently sourced from:

- `/home/manuel/code/wesen/terraform/.envrc`

## App-Repo Helpers

The current app-repo helpers are:

- Vault reader:
  [read_hair_booking_vault_ses_secret.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/read_hair_booking_vault_ses_secret.sh)
- Keycloak SMTP sync:
  [configure_hosted_keycloak_smtp_and_smoke.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh)

The sync helper now supports:

- `SMTP_SOURCE=vault`
- `SMTP_SOURCE=auto`
- `SMTP_SOURCE=file`

Canonical operator mode is now `vault`.

`auto` means:

- use Vault if the AppRole env vars are present
- otherwise fall back to the legacy local secret file

`file` is a legacy fallback only. Keep it available for emergency recovery, not
as the preferred steady-state workflow.

## Recommended Hosted Operator Workflow

The intended hosted replay is:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking

source /home/manuel/code/wesen/terraform/.envrc

export VAULT_ADDR='https://vault.app.scapegoat.dev'
export VAULT_APPROLE_AUTH_PATH='approle'
export VAULT_ROLE_ID='<delivered role id>'
export VAULT_SECRET_ID='<delivered secret id>'
export VAULT_KV_MOUNT='kv'
export VAULT_SECRET_PATH='apps/hair-booking/prod/ses'

SMTP_SOURCE=vault \
TEST_EMAIL='<real inbox>' \
TEST_USERNAME='hair-booking-ses-smtp-probe' \
./ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh
```

## What The Vault Reader Produces

The Vault reader writes a shell-safe env file containing:

- `KEYCLOAK_SMTP_HOST`
- `KEYCLOAK_SMTP_PORT`
- `KEYCLOAK_SMTP_USERNAME`
- `KEYCLOAK_SMTP_PASSWORD`
- `KEYCLOAK_SMTP_FROM`
- `KEYCLOAK_SMTP_FROM_DISPLAY_NAME`
- `KEYCLOAK_SMTP_REPLY_TO`
- `KEYCLOAK_SMTP_REPLY_TO_DISPLAY_NAME`
- `KEYCLOAK_SMTP_STARTTLS`
- `KEYCLOAK_SMTP_SSL`

That keeps the Keycloak sync helper compatible with the earlier file-based
operator flow while changing the source of truth to Vault.

## Current Boundary

What is done in the app repo:

- the Vault bootstrap contract is documented
- the Vault secret reader helper exists
- the Keycloak sync helper defaults to Vault-backed sync
- the old local secret file path is now documented as a legacy fallback

What is still needed from infra before a real hosted Vault cutover:

- the final `hair-booking-prod` AppRole
- the delivered `role_id`
- one valid `secret_id`
- confirmation that `kv/apps/hair-booking/prod/ses` is populated

Until those exist, the Vault path is designed but not fully validated.
