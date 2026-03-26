---
Title: hair-booking SES and Vault SMTP Cutover Postmortem
Ticket: HAIR-010
Status: active
Topics:
    - auth
    - keycloak
    - deploy
    - postmortem
    - security
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-vault-smtp-sync-playbook.md
      Note: Stable runbook for the Vault-backed Keycloak SMTP sync
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-ses-verification-playbook.md
      Note: Stable mailbox verification and password-reset validation playbook
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/read_hair_booking_vault_ses_secret.sh
      Note: App-side Vault AppRole reader that materializes the Keycloak SMTP env shape
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh
      Note: Hosted Keycloak SMTP update and smoke helper
    - Path: /home/manuel/code/wesen/terraform/coolify/services/vault/policies/app-hair-booking-prod.hcl
      Note: Dedicated least-privilege Vault policy for hair-booking SMTP reads
    - Path: /home/manuel/code/wesen/terraform/coolify/services/vault/scripts/seed_hair_booking_ses_secret.sh
      Note: Helper that writes the SES SMTP secret into Vault
    - Path: /home/manuel/code/wesen/terraform/coolify/services/vault/scripts/generate_hair_booking_approle_material.sh
      Note: Helper that creates the live hair-booking AppRole and local-only role material
    - Path: /home/manuel/code/wesen/terraform/ttmp/2026/03/25/TF-010-HAIR-BOOKING-VAULT-SES--integrate-hair-booking-with-vault-for-ses-smtp-credentials/reference/01-hair-booking-vault-ses-ticket-diary.md
      Note: Infra-side command-by-command diary for the Vault provisioning work
ExternalSources:
    - https://developer.hashicorp.com/vault/api-docs/auth/approle
    - https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v2
    - https://docs.aws.amazon.com/ses/latest/dg/smtp-connect.html
    - https://www.keycloak.org/docs/latest/server_admin/
Summary: Intern-facing postmortem for the final SES plus Vault AppRole cutover in hair-booking, covering architecture, operator workflow, failure modes, debugging sequence, validation commands, and resulting steady-state operations.
LastUpdated: 2026-03-25T22:10:00-04:00
WhatFor: Use this to understand how the final SMTP secret path was moved into Vault, why the cutover was harder than it first looked, and how to safely operate or extend the system now.
WhenToUse: Use before touching the hosted Keycloak SMTP flow, Vault AppRole material, SES secret rotation, or later Google and Facebook rollout work.
---

# hair-booking SES and Vault SMTP Cutover Postmortem

## Executive Summary

This document explains the final authentication-adjacent cutover that took
`hair-booking` from:

- a manually configured Keycloak SMTP setup backed by a local operator secret
  file

to:

- a Vault-backed SMTP secret path under `kv/apps/hair-booking/prod/ses`
- a dedicated AppRole `hair-booking-prod`
- a helper-driven workflow that updates Keycloak realm `hair-booking`
  `smtpServer` from Vault

The earlier authentication postmortem in
[03-hair-booking-keycloak-auth-postmortem.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/design/03-hair-booking-keycloak-auth-postmortem.md)
covered the realm cutover and the first SES integration. This document covers
the next phase: making that SMTP setup operationally safer by moving the secret
source of truth into Vault without teaching Keycloak to speak Vault directly.

The end result is good:

- the live SES SMTP secret now exists in Vault at
  `kv/apps/hair-booking/prod/ses`
- the live AppRole `hair-booking-prod` exists and is least privilege
- the app-side Vault reader can materialize the expected `KEYCLOAK_SMTP_*`
  fields from Vault
- the hosted Keycloak SMTP sync works with `SMTP_SOURCE=vault`
- the simulator-backed `VERIFY_EMAIL` and `UPDATE_PASSWORD` replay succeeds

The interesting part is how many small but real mistakes surfaced along the
way:

- the older local operator SMTP file did not include
  `KEYCLOAK_SMTP_CONFIGURATION_SET`
- the app-side Vault reader incorrectly tried to `chmod` `/tmp`
- the Keycloak SMTP smoke helper searched only by username and collided with an
  existing probe user that already owned the SES simulator email
- the Terraform-side handoff docs described a slightly more generic “app sends
  mail directly” flow than the real helper-based architecture that was finally
  executed

Those mistakes are now documented here so an intern can learn both the target
model and the concrete ways operator workflows drift from intent.

## What This Subsystem Actually Is

An intern should think of the hosted auth/mail stack as four cooperating
layers.

### Layer 1: Hosted App Runtime

Repo:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking`

Responsibilities:

- browser-facing app and backend
- OIDC login/logout/session handling
- app-side client bootstrap
- helper scripts that can configure hosted Keycloak
- stable runbooks for smoke testing and operator replay

Important files:

- [oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go)
- [handlers_me.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go)
- [read_hair_booking_vault_ses_secret.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/read_hair_booking_vault_ses_secret.sh)
- [configure_hosted_keycloak_smtp_and_smoke.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh)

### Layer 2: Hosted Keycloak

Runtime:

- `https://auth.scapegoat.dev`
- realm: `hair-booking`
- client: `hair-booking-web`

Responsibilities:

- user registration
- password login
- password reset
- verify-email flow
- browser auth for `hair-booking`
- SMTP delivery through Amazon SES

Important fact:

- Keycloak is not speaking Vault directly in the current design

That is intentional. The actual current model is “operator or automation helper
reads Vault, then updates Keycloak.” That is smaller, easier to debug, and
good enough for the current hosted deployment.

### Layer 3: SES

Responsibilities:

- actual SMTP delivery
- verified sender domain
- configuration-set-based send attribution

Steady-state values:

- SMTP host: `email-smtp.us-east-1.amazonaws.com`
- region: `us-east-1`
- sender domain: `mail.scapegoat.dev`
- sender: `no-reply@mail.scapegoat.dev`
- configuration set: `mail-scapegoat-dev`

### Layer 4: Vault

Repo:

- `/home/manuel/code/wesen/terraform`

Responsibilities:

- app-owned secret path
- least-privilege policy
- AppRole-based machine auth
- local-only delivery of role material

Important files:

- [app-hair-booking-prod.hcl](/home/manuel/code/wesen/terraform/coolify/services/vault/policies/app-hair-booking-prod.hcl)
- [seed_hair_booking_ses_secret.sh](/home/manuel/code/wesen/terraform/coolify/services/vault/scripts/seed_hair_booking_ses_secret.sh)
- [generate_hair_booking_approle_material.sh](/home/manuel/code/wesen/terraform/coolify/services/vault/scripts/generate_hair_booking_approle_material.sh)

## Steady-State Architecture

The resulting architecture is:

```text
Local operator or automation
  -> authenticate to Vault with AppRole bootstrap material
    -> read kv/apps/hair-booking/prod/ses
      -> materialize KEYCLOAK_SMTP_* env shape
        -> update Keycloak realm hair-booking smtpServer
          -> Keycloak sends verify-email / reset mail through SES
            -> mailbox receives and user completes action
```

The important design choice is what is not happening:

- Keycloak is not reading Vault itself
- SES credentials are not stored in git
- SES credentials are not stored in Terraform state
- long-lived root Vault tokens are not part of the normal app/operator flow

## Secret Contract

The live Vault secret shape is:

```json
{
  "host": "email-smtp.us-east-1.amazonaws.com",
  "port": "587",
  "username": "<ses access key id>",
  "password": "<derived smtp password>",
  "from_address": "no-reply@mail.scapegoat.dev",
  "from_name": "Hair Booking",
  "reply_to": "no-reply@mail.scapegoat.dev",
  "configuration_set": "mail-scapegoat-dev",
  "starttls": "true",
  "ssl": "false"
}
```

Path:

- `kv/apps/hair-booking/prod/ses`

Policy:

- `app-hair-booking-prod`

Role:

- `hair-booking-prod`

Operator delivery path today:

- local-only JSON at
  `~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-<timestamp>.json`

That local-only JSON contains:

- `role_id`
- `secret_id`
- `vault_addr`
- `auth_path`
- `kv_mount`
- `secret_path`
- `denied_secret_path`

## Why We Chose This Design

The design is more conservative than “full direct integration everywhere,” and
that is deliberate.

Reasons:

- Keycloak already knows how to send SMTP mail once it has the `smtpServer`
  fields
- the hardest problem is secret sourcing, not SMTP logic
- app-side helper scripts are easier to debug than custom Keycloak Vault
  integration
- the app repo already had an operator script path for hosted SMTP updates
- keeping the Vault integration outside Keycloak internals reduces the blast
  radius

In short:

- Vault owns the secret
- the helper owns the translation
- Keycloak owns the mail send

## What We Actually Executed

The live cutover happened in two repos and one hosted environment.

### Infra Repo Execution

Repo:

- `/home/manuel/code/wesen/terraform`

Executed additions:

- policy file for `hair-booking`
- secret seeding helper
- AppRole creation/material helper

Key commands:

```bash
chmod +x coolify/services/vault/scripts/seed_hair_booking_ses_secret.sh \
  coolify/services/vault/scripts/generate_hair_booking_approle_material.sh

bash -n coolify/services/vault/scripts/seed_hair_booking_ses_secret.sh
bash -n coolify/services/vault/scripts/generate_hair_booking_approle_material.sh
```

To get live Vault access, we reused the encrypted bootstrap record that had
already been created during the earlier Vault work:

```bash
gpg --batch --quiet --decrypt \
  /home/manuel/.local/share/wesen/secrets/vault/vault.app.scapegoat.dev-init-20260325T180551.json.gpg |
  jq -r '.root_token | length'
```

First failure:

```text
gpg: public key decryption failed: Operation cancelled
gpg: decryption failed: Operation cancelled
```

Interpretation:

- not a file problem
- not a repo problem
- operator GPG password was unavailable at that moment

After the user recovered the password, the same command succeeded.

### Vault Secret Seeding

First live attempt:

```bash
export VAULT_TOKEN="$(gpg --batch --quiet --decrypt \
  /home/manuel/.local/share/wesen/secrets/vault/vault.app.scapegoat.dev-init-20260325T180551.json.gpg |
  jq -r '.root_token')"

/home/manuel/code/wesen/terraform/coolify/services/vault/scripts/seed_hair_booking_ses_secret.sh
```

First failure:

```text
missing required SMTP value in /home/manuel/.config/hair-booking/hosted-keycloak-smtp.env: KEYCLOAK_SMTP_CONFIGURATION_SET
```

Why this happened:

- the old local SMTP env file was created before the Vault-side secret contract
  was finalized
- the new secret contract expected `KEYCLOAK_SMTP_CONFIGURATION_SET`
- the file did not contain it

Fix:

- default `KEYCLOAK_SMTP_CONFIGURATION_SET=mail-scapegoat-dev` in the seed
  script after sourcing the legacy env file

After the fix, the same live seed succeeded:

```text
Wrote Vault secret kv/apps/hair-booking/prod/ses
Source SMTP file: /home/manuel/.config/hair-booking/hosted-keycloak-smtp.env
No secret values were printed.
```

Lesson:

- legacy operator artifacts rarely match new contracts exactly
- make the migration helper tolerant where the missing value is already a known
  platform constant

### AppRole Creation

Live command:

```bash
export VAULT_TOKEN="$(gpg --batch --quiet --decrypt \
  /home/manuel/.local/share/wesen/secrets/vault/vault.app.scapegoat.dev-init-20260325T180551.json.gpg |
  jq -r '.root_token')"

/home/manuel/code/wesen/terraform/coolify/services/vault/scripts/generate_hair_booking_approle_material.sh
```

Result:

- local material file:
  `~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-20260325T204940.json`

Non-secret summary check:

```bash
json_path=$(ls -t ~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-*.json | head -n1)
jq -r '{role_name, policy_name, auth_path, kv_mount, secret_path, denied_secret_path}' "$json_path"
```

Observed shape:

- role name `hair-booking-prod`
- policy `app-hair-booking-prod`
- auth path `approle`
- allowed path `apps/hair-booking/prod/ses`
- denied path `apps/go-example/prod`

### Least-Privilege Proof

This was the most important infra validation in the whole slice.

Command shape:

```bash
json_path=$(ls -t ~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-*.json | head -n1)
VAULT_ADDR=$(jq -r '.vault_addr' "$json_path")
ROLE_ID=$(jq -r '.role_id' "$json_path")
SECRET_ID=$(jq -r '.secret_id' "$json_path")
AUTH_PATH=$(jq -r '.auth_path' "$json_path")
ALLOWED=$(jq -r '.secret_path' "$json_path")
DENIED=$(jq -r '.denied_secret_path' "$json_path")

login=$(curl -fsS -X POST "$VAULT_ADDR/v1/auth/$AUTH_PATH/login" \
  -H 'Content-Type: application/json' \
  --data "$(jq -nc --arg role_id "$ROLE_ID" --arg secret_id "$SECRET_ID" '{role_id:$role_id,secret_id:$secret_id}')")

client_token=$(jq -r '.auth.client_token' <<<"$login")
```

Then:

```bash
curl -H "X-Vault-Token: $client_token" "$VAULT_ADDR/v1/kv/data/$ALLOWED"
curl -H "X-Vault-Token: $client_token" "$VAULT_ADDR/v1/kv/data/$DENIED"
```

Observed result:

- allowed read status: `200`
- denied read status: `403`
- denied error: `permission denied`

That is the strongest possible signal that the new Vault policy is doing what
we intended rather than simply existing in config.

## App-Side Validation

After the Vault side was live, we moved back into the app repo:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking`

### Step 1: Validate the App-Side Vault Reader

We used the new AppRole material to drive the app-side helper:

```bash
OUTPUT_FILE=$(mktemp)
VAULT_ADDR=...
VAULT_ROLE_ID=...
VAULT_SECRET_ID=...
VAULT_APPROLE_AUTH_PATH=...
VAULT_KV_MOUNT=...
VAULT_SECRET_PATH=...
OUTPUT_FILE="$OUTPUT_FILE" \
./ttmp/.../read_hair_booking_vault_ses_secret.sh
```

First failure:

```text
chmod: changing permissions of '/tmp': Operation not permitted
```

Why this happened:

- the helper always did `chmod 700 "$(dirname "$OUTPUT_FILE")"`
- with `mktemp`, the parent directory is usually `/tmp`
- the helper should never try to take ownership of a shared system temp dir

Fix:

- only create and chmod the directory if it does not already exist

After the fix, the sanitized output looked correct:

```text
KEYCLOAK_SMTP_HOST=<redacted>
KEYCLOAK_SMTP_PORT=<redacted>
KEYCLOAK_SMTP_USERNAME=<redacted>
KEYCLOAK_SMTP_PASSWORD=<redacted>
KEYCLOAK_SMTP_FROM=<redacted>
KEYCLOAK_SMTP_FROM_DISPLAY_NAME=<redacted>
KEYCLOAK_SMTP_REPLY_TO=<redacted>
KEYCLOAK_SMTP_REPLY_TO_DISPLAY_NAME=<redacted>
KEYCLOAK_SMTP_STARTTLS=<redacted>
KEYCLOAK_SMTP_SSL=<redacted>
KEYCLOAK_SMTP_CONFIGURATION_SET=<redacted>
VAULT_SECRET_SOURCE=<redacted>
```

### Step 2: Validate the Hosted Keycloak Replay

Then we used the same AppRole material against the real hosted Keycloak sync
script:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
json_path=$(ls -t ~/.local/share/wesen/secrets/vault/hair-booking-prod-approle-*.json | head -n1)
source /home/manuel/code/wesen/terraform/.envrc

VAULT_ADDR=$(jq -r '.vault_addr' "$json_path") \
VAULT_ROLE_ID=$(jq -r '.role_id' "$json_path") \
VAULT_SECRET_ID=$(jq -r '.secret_id' "$json_path") \
VAULT_APPROLE_AUTH_PATH=$(jq -r '.auth_path' "$json_path") \
VAULT_KV_MOUNT=$(jq -r '.kv_mount' "$json_path") \
VAULT_SECRET_PATH=$(jq -r '.secret_path' "$json_path") \
SMTP_SOURCE=vault \
TEST_EMAIL=success@simulator.amazonses.com \
TEST_USERNAME=hair-booking-ses-smtp-probe \
./ttmp/.../configure_hosted_keycloak_smtp_and_smoke.sh
```

First failure:

```text
curl: (22) The requested URL returned error: 409
```

This looked at first like a Vault or Keycloak API issue, but it was actually a
test-data problem in the helper script.

We queried Keycloak directly:

```bash
curl -fsS -H "Authorization: Bearer $admin_token" \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking/users?email=success@simulator.amazonses.com" |
  jq '[.[] | {id,username,email}]'
```

Result:

- the simulator email already belonged to user `hb-smoke-20260325a`
- the requested username `hair-booking-ses-smtp-probe` did not exist

So the helper was:

1. searching only by username
2. not finding the desired username
3. trying to create a new user
4. colliding on an email that was already in use

Fix:

- search by username first
- if not found, search by email
- only then create a new user

After that fix, the hosted replay succeeded.

Observed output:

```json
{
  "realm": "hair-booking",
  "verifyEmail": true,
  "smtpServer": {
    "host": "email-smtp.us-east-1.amazonaws.com",
    "port": "587",
    "from": "no-reply@mail.scapegoat.dev",
    "fromDisplayName": "Hair Booking",
    "replyTo": "no-reply@mail.scapegoat.dev",
    "auth": "true",
    "starttls": "true",
    "ssl": "false",
    "user": "<ses access key id>"
  }
}
```

and:

```text
Configured SMTP for realm hair-booking.
Triggered VERIFY_EMAIL and UPDATE_PASSWORD mail to success@simulator.amazonses.com using user hair-booking-ses-smtp-probe.
```

That is the final end-to-end proof for this cutover.

## Failure Analysis

### Failure 1: GPG Access Was Human, Not Programmatic

Symptom:

- decrypt command failed with `Operation cancelled`

Actual cause:

- operator password unavailable at that moment

Lesson:

- “credential access” failures can look like technical breakage
- document the operator prerequisite before assuming the secret file is wrong

### Failure 2: Legacy Local Secret File Lagged Behind the New Contract

Symptom:

- seeding helper rejected the missing `KEYCLOAK_SMTP_CONFIGURATION_SET`

Actual cause:

- the older local file had been created before the final Vault payload shape
  was locked

Lesson:

- when codifying a new secret contract, expect older local operator artifacts
  to be structurally incomplete
- where the missing field is a known platform constant, default it in the
  migration helper rather than inventing a manual patch step

### Failure 3: Temp-File Helpers Need to Respect Shared Temp Dirs

Symptom:

- `chmod: changing permissions of '/tmp': Operation not permitted`

Actual cause:

- helper assumed it owned the output directory
- `mktemp` placed the file under the system temp dir

Lesson:

- helpers should manage only directories they create themselves
- `mktemp` is a valid caller contract and should be supported cleanly

### Failure 4: Probe User Identity Was Not Idempotent

Symptom:

- `409` from the hosted Keycloak replay

Actual cause:

- helper reused probe username as the only lookup key
- email uniqueness lived at the Keycloak realm level
- earlier smoke data had already claimed the simulator email

Lesson:

- smoke helpers that create test users must be idempotent by both username and
  email
- email uniqueness collisions often come from old smoke data rather than new
  product bugs

### Failure 5: Handoff Docs Were Slightly More General Than the Real System

Symptom:

- early docs implied a more generic “app reads Vault then sends SMTP mail”
  target

Actual cause:

- the platform docs were written before the final app-side helper boundary was
  fully decided

Lesson:

- a handoff document should be updated after the live path is proven
- “generically correct” architecture can still be the wrong operating model for
  the current deployed system

## What Worked Well

- the earlier TF-008 Vault hardening work gave us a valid pattern to copy
- the app-side helper split was small and easy to debug
- the least-privilege proof caught no policy surprises
- the stable SES shape was already known, so the migration could focus on
  secret movement rather than sender-domain debugging
- the ticket diaries were detailed enough that the final postmortem could use
  exact commands instead of vague recollection

## What Was Riskier Than It Looked

- mixing app-repo and infra-repo work in a single operator session
- assuming old local secret artifacts matched the new secret contract
- assuming a simulator email would still be free for probe-user creation
- assuming a temp-file helper owned its parent directory
- assuming a planning guide and the live executed workflow were still the same

## Final Steady-State Model

Today, the intended operator flow is:

```text
1. obtain local-only AppRole material
2. use AppRole to read kv/apps/hair-booking/prod/ses
3. materialize KEYCLOAK_SMTP_* env fields
4. update hosted Keycloak realm hair-booking smtpServer
5. trigger verify-email / password-reset smoke
6. verify mailbox behavior through the stable SES verification playbook
```

Stable operator docs:

- [keycloak-vault-smtp-sync-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-vault-smtp-sync-playbook.md)
- [keycloak-ses-verification-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-ses-verification-playbook.md)

Infra-side live artifacts:

- policy: [app-hair-booking-prod.hcl](/home/manuel/code/wesen/terraform/coolify/services/vault/policies/app-hair-booking-prod.hcl)
- secret seed helper:
  [seed_hair_booking_ses_secret.sh](/home/manuel/code/wesen/terraform/coolify/services/vault/scripts/seed_hair_booking_ses_secret.sh)
- AppRole helper:
  [generate_hair_booking_approle_material.sh](/home/manuel/code/wesen/terraform/coolify/services/vault/scripts/generate_hair_booking_approle_material.sh)

App-side live artifacts:

- Vault reader:
  [read_hair_booking_vault_ses_secret.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/read_hair_booking_vault_ses_secret.sh)
- Keycloak sync helper:
  [configure_hosted_keycloak_smtp_and_smoke.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh)

## Remaining Deferred Work

The cutover is working, but the auth story is not finished.

Still deferred:

- move AppRole delivery out of the current local-only JSON path and into the
  final shared operator secret system
- Google provider rollout
- Facebook provider rollout
- decide whether the AppRole creation path should later be codified even more
  deeply than the current rerunnable helper scripts

## Recommended Operator Checklist

When touching this subsystem later, do these in order:

1. Read [03-hair-booking-keycloak-auth-postmortem.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/design/03-hair-booking-keycloak-auth-postmortem.md)
2. Read this document
3. Read [keycloak-vault-smtp-sync-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-vault-smtp-sync-playbook.md)
4. Read [keycloak-ses-verification-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-ses-verification-playbook.md)
5. Confirm the local GPG and Vault operator prerequisites before touching live
   state
6. Prefer rerunnable helpers over hand-built ad hoc commands
7. Run one positive validation and one denied validation whenever changing the
   Vault policy or AppRole

## Pseudocode Summary

This is the simplest accurate mental model of the final system:

```text
operator_bootstrap = read_local_role_material()

vault_token = vault.approleLogin(
  addr = operator_bootstrap.vault_addr,
  auth_path = operator_bootstrap.auth_path,
  role_id = operator_bootstrap.role_id,
  secret_id = operator_bootstrap.secret_id,
)

ses_secret = vault.kv2Read(
  token = vault_token,
  mount = "kv",
  path = "apps/hair-booking/prod/ses",
)

keycloak_smtp = {
  host: ses_secret.host,
  port: ses_secret.port,
  user: ses_secret.username,
  password: ses_secret.password,
  from: ses_secret.from_address,
  fromDisplayName: ses_secret.from_name,
  replyTo: ses_secret.reply_to,
  starttls: ses_secret.starttls,
  ssl: ses_secret.ssl,
}

keycloak.updateRealm("hair-booking", { smtpServer: keycloak_smtp })
keycloak.executeActionEmail("VERIFY_EMAIL")
keycloak.executeActionEmail("UPDATE_PASSWORD")
```

That is the core flow. Everything else in this postmortem is about how we got
there safely and what went wrong on the way.
