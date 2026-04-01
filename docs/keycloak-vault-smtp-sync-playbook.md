# Keycloak Vault SMTP Sync Playbook

This runbook explains how `hair-booking` syncs SES SMTP credentials from Vault
into the Keycloak realm SMTP configuration.

The original version of this workflow targeted the hosted Keycloak deployment at
`auth.scapegoat.dev` using Vault `approle/` machine auth. As of 2026-03-31, the
live app and live Keycloak realm are on K3s:

- app: `https://hair-booking.yolo.scapegoat.dev`
- Keycloak: `https://auth.yolo.scapegoat.dev`
- canonical SES secret path: `kv/apps/hair-booking/prod/ses`

The important contract did not change:

- Vault is the source of truth for the SES SMTP material
- Keycloak stores the realm `smtpServer` block
- a sync step moves data from Vault into the realm

The execution model has now changed on the K3s side. The old off-cluster
AppRole path is legacy operator workflow. The K3s steady state is a
Kubernetes-authenticated reconciler in the `keycloak` namespace:

- Vault secret `kv/apps/hair-booking/prod/ses` remains the source of truth
- Vault Secrets Operator mirrors that secret into `Secret/keycloak-hair-booking-smtp`
- `CronJob/keycloak-hair-booking-smtp-sync` reads that secret plus
  `Secret/keycloak-bootstrap-admin`
- the reconciler updates realm `hair-booking` `smtpServer` only when drift
  exists
- the reconciler stores an idempotence hash in
  `ConfigMap/keycloak-hair-booking-smtp-sync-state`

The K3s platform-side implementation details now live in
[keycloak-vault-smtp-reconciler-pattern.md](/home/manuel/code/wesen/2026-03-27--hetzner-k3s/docs/keycloak-vault-smtp-reconciler-pattern.md).

Use this app-side document when you need to:

- understand the secret contract the K3s reconciler consumes
- run a legacy operator replay intentionally
- materialize the SMTP values into the `KEYCLOAK_SMTP_*` env shape expected by
  the helper scripts
- rerun the Keycloak email smoke flow

This is about the Keycloak SMTP sync path, not the mail-delivery smoke itself.
The delivery smoke remains documented in
[keycloak-ses-verification-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-ses-verification-playbook.md).

## Target Flow

```text
Vault secret kv/apps/hair-booking/prod/ses
  -> VaultStaticSecret mirrors into keycloak namespace
    -> Secret keycloak-hair-booking-smtp
      -> CronJob keycloak-hair-booking-smtp-sync
        -> update Keycloak realm hair-booking smtpServer
          -> run verify-email and forgot-password smoke
```

## Current State

What is already true today:

- `kv/apps/hair-booking/prod/ses` exists on `vault.yolo.scapegoat.dev`
- the K3s Keycloak `hair-booking` realm at `auth.yolo.scapegoat.dev` has the
  working SES SMTP block applied
- the old hosted Keycloak realm at `auth.scapegoat.dev` still has the same SMTP
  shape as rollback reference
- the helper
  [configure_hosted_keycloak_smtp_and_smoke.sh](/home/manuel/code/wesen/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh)
  now respects explicit `TF_VAR_keycloak_*` overrides, so it can target either
  hosted Keycloak or K3s Keycloak intentionally

What is now true on the K3s side:

- the K3s Keycloak package defines the SMTP reconciler resources
- the mirrored secret name is `keycloak-hair-booking-smtp`
- the reconciler CronJob name is `keycloak-hair-booking-smtp-sync`
- the reconciler state ConfigMap name is
  `keycloak-hair-booking-smtp-sync-state`
- `approle/` still does not exist on `vault.yolo.scapegoat.dev`

What is still true operationally:

- Vault Kubernetes auth policy and role bootstrap still happens through the
  K3s repo helper script, not through Argo CD directly
- the legacy helper remains useful for rollback comparison and one-off
  operator-driven replay

## Canonical Vault Contract

Current intended values:

- hosted legacy operator workflow: `VAULT_ADDR=https://vault.app.scapegoat.dev`
- K3s canonical Vault instance: `VAULT_ADDR=https://vault.yolo.scapegoat.dev`
- hosted legacy auth path: `VAULT_APPROLE_AUTH_PATH=approle`
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

These are required to read the Vault secret in the legacy off-cluster AppRole flow:

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

Canonical operator mode for the legacy helper is still `vault`.

`auto` means:

- use Vault if the AppRole env vars are present
- otherwise fall back to the legacy local secret file

`file` is a legacy fallback only. Keep it available for emergency recovery, not
as the preferred steady-state workflow.

## K3s Steady-State Boundary

The current steady-state responsibility split is:

- K3s GitOps repo owns the Kubernetes resources for the reconciler
- Vault owns the SES secret values
- the CronJob owns runtime reconciliation into Keycloak realm state
- the app repo keeps the helper scripts and contract documentation

That means the app repo is no longer the canonical place where SMTP is pushed
into the live K3s realm. It documents the secret contract and keeps the legacy
operator tools available, but the normal live control loop is now in the K3s
repo.

## Recommended Legacy Operator Workflow

The historical hosted replay is:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking

source /home/manuel/code/wesen/terraform/.envrc

export VAULT_ADDR='https://vault.app.scapegoat.dev'
export VAULT_APPROLE_AUTH_PATH='approle'
export VAULT_ROLE_ID='<role id from ~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-*.json>'
export VAULT_SECRET_ID='<secret id from ~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-*.json>'
export VAULT_KV_MOUNT='kv'
export VAULT_SECRET_PATH='apps/hair-booking/prod/ses'

SMTP_SOURCE=vault \
TEST_EMAIL='<real inbox>' \
TEST_USERNAME='hair-booking-ses-smtp-probe' \
./ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh
```

To target the live K3s Keycloak realm intentionally with the same helper, use
explicit Keycloak overrides:

```bash
export TF_VAR_keycloak_url='https://auth.yolo.scapegoat.dev'
export TF_VAR_keycloak_client_id='admin-cli'
export TF_VAR_keycloak_username='bootstrap-admin'
export TF_VAR_keycloak_password='<k3s bootstrap admin password>'
```

For K3s, prefer Vault at `https://vault.yolo.scapegoat.dev`. AppRole remains a
legacy operator-mode example here, not the steady-state in-cluster design.

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
- the hosted Vault-backed replay has been validated against the real
  `hair-booking-prod` AppRole
- the same secret shape has been seeded into `vault.yolo.scapegoat.dev`
- the K3s repo now defines the namespace-local SMTP reconciler resources
- the same SMTP block has been applied to the K3s Keycloak `hair-booking` realm

Current operator delivery path:

- local-only AppRole material JSON at
  `~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-<timestamp>.json`
- canonical Vault secret at `kv/apps/hair-booking/prod/ses`

What is still deferred:

- making Vault auth role and policy management itself fully declarative instead
  of bootstrapping it through the K3s helper script
- moving the AppRole delivery path into the final shared operator secret system
