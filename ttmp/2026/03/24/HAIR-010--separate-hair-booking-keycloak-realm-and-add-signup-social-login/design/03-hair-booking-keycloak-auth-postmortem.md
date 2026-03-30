---
Title: hair-booking Keycloak Auth Postmortem
Ticket: HAIR-010
Status: active
Topics:
    - auth
    - keycloak
    - deploy
    - terraform
    - postmortem
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go
      Note: Backend OIDC login, callback, and logout behavior
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go
      Note: `/api/me` path that exposed the missing database configuration
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md
      Note: Stable deployment shape for the hosted app
    - Path: /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf
      Note: Hosted realm and browser client definition
    - Path: /home/manuel/code/wesen/terraform/keycloak/modules/realm-base/main.tf
      Note: Shared Keycloak realm module that now ignores manual SMTP drift
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/create_hair_booking_ses_smtp_credentials.sh
      Note: Operator script for SES SMTP credential creation
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh
      Note: Operator script for hosted Keycloak SMTP configuration and smoke tests
ExternalSources:
    - https://www.keycloak.org/docs/latest/server_admin/
    - https://www.keycloak.org/server/features
Summary: Detailed intern-facing postmortem for the hair-booking Keycloak separation, covering system architecture, deployment shape, rollout mistakes, debugging sequence, operator lessons, and the resulting steady-state model.
LastUpdated: 2026-03-25T17:10:00-04:00
WhatFor: Use this to understand what was built, why the rollout was harder than it first looked, and how to safely operate or extend the authentication system.
WhenToUse: Use after reading the implementation guides, or before touching hosted auth, SES SMTP, Coolify app env, or Keycloak Terraform.
---

# hair-booking Keycloak Auth Postmortem

## Executive Summary

This postmortem explains what happened when `hair-booking` moved from being a
client inside the shared `smailnail` Keycloak realm to owning its own dedicated
realm at:

- `https://auth.scapegoat.dev/realms/hair-booking`

The migration itself succeeded, but the real work was not just "create a new
realm and update the issuer URL." The rollout crossed four separate system
boundaries:

1. the app repo
2. the shared Terraform repo
3. the hosted Coolify deployment
4. the hosted Keycloak and SES operator layer

The rollout exposed several concrete mistakes and hidden assumptions:

- the hosted app was missing `HAIR_BOOKING_DATABASE_URL`, so authentication
  succeeded but `/api/me` still failed
- the hosted Keycloak client allowed login callback redirects but did not allow
  logout callback redirects
- the shared Terraform repo defaulted `TF_VAR_realm_name=smailnail`, which made
  an unpinned `terraform plan` dangerous for `hair-booking`
- SMTP credentials had to stay out of git and out of Terraform state, which
  forced a hybrid Terraform-plus-operator model
- the first SES SMTP policy was incomplete because it allowed the identity ARN
  but not the configuration-set ARN used in the hosted send path

The result after debugging is a much healthier model:

- hosted `hair-booking` now owns its own realm
- hosted signup and password-reset initiation work
- hosted verify-email enforcement is on
- hosted logout and repeat-login work
- repeat login reuses the same app-side `clients` row instead of creating
  duplicates
- the remaining incomplete validation requires a real inbox, not more
  infrastructure repair

The most important lesson is that auth migrations should be treated as
cross-system deployments, not just Terraform changes.

## What This System Is

Before looking at failures, an intern needs the actual system map.

### Repo Boundary

The authentication system is split across two repos.

Application repo:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking`

This repo owns:

- the Go backend
- the embedded React frontend
- the OIDC login/logout handlers
- the client bootstrap API
- local Keycloak JSON import for repo-local development
- Coolify deployment docs and app-specific operator scripts

Shared infrastructure repo:

- `/home/manuel/code/wesen/terraform`

This repo owns:

- hosted Keycloak realm and browser client Terraform
- shared realm and browser-client modules
- hosted Keycloak admin credentials through Terraform operator workflow
- SES infrastructure and DNS infrastructure

### Runtime Architecture

The hosted runtime is:

```text
Browser
  -> https://hair-booking.app.scapegoat.dev
       -> Coolify / Traefik
            -> hair-booking Go container
                 -> OIDC against Keycloak
                 -> Postgres for app data

Browser
  -> https://auth.scapegoat.dev
       -> Keycloak
            -> realm: hair-booking
            -> client: hair-booking-web
            -> SMTP via Amazon SES
```

### Auth Request Flow

Login flow:

```text
/portal
  -> /auth/login
     -> Keycloak authorize endpoint
        -> user signs in or registers
           -> /auth/callback
              -> Go backend exchanges code
                 -> session cookie created
                    -> /api/me bootstraps client record
```

Logout flow:

```text
/auth/logout
  -> Keycloak logout endpoint
     -> post_logout_redirect_uri = /auth/logout/callback
        -> backend clears session
           -> final redirect to /booking or /portal
```

Email verification / reset flow:

```text
Keycloak action email
  -> SES SMTP
     -> mailbox receives link
        -> user completes Keycloak action
           -> user can return to app and log in
```

### App-Side Identity Model

Keycloak is the auth source of truth, but the app still needs its own `clients`
row for profile and portal state.

The important app route is:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go`

That route depends on a configured client service and database connection. If
auth works but the database config is missing, the app still cannot function as
an authenticated portal.

The actual app-side identity payload looks like:

```json
{
  "client": {
    "id": "8d22f1aa-7032-48bd-b1fc-7e5d3ea4c766",
    "auth_subject": "2062f612-22b3-40c2-96e3-b30b206d3dd9",
    "auth_issuer": "https://auth.scapegoat.dev/realms/hair-booking",
    "email": "success@simulator.amazonses.com"
  }
}
```

That means:

- Keycloak subject is canonical auth identity
- app `clients.id` is the local application identity
- app deduplication should key off auth subject / issuer and email safety checks

## Intended Architecture

The intended target was simple:

```text
shared Keycloak server
├── realm: smailnail
└── realm: hair-booking
    └── client: hair-booking-web
```

The hosted app should point to:

- issuer: `https://auth.scapegoat.dev/realms/hair-booking`
- client: `hair-booking-web`

The realm should support:

- local signup
- password reset
- verify email
- remember me
- future Google login
- future Facebook login

The SMTP path should use SES, but secret-bearing SMTP credentials should not
land in git or Terraform state.

## What Actually Happened

The migration was executed in slices:

1. create and apply hosted `hair-booking` realm Terraform
2. switch live app issuer to the new realm
3. enable realm login settings
4. add SES SMTP
5. validate hosted signup
6. discover deployment gaps
7. fix logout and repeat-login behavior

At each step, a real hidden assumption surfaced.

## Failure 1: We Treated "OIDC Works" As If "App Works"

### Symptom

Hosted login redirected correctly into the dedicated realm, but after a
successful callback the app failed with:

```text
Client service is not configured.
```

### Why It Happened

The app deployment had OIDC variables configured, but no:

- `HAIR_BOOKING_DATABASE_URL`

That meant:

- Keycloak login worked
- Go session creation worked
- but `/api/me` could not create or load the app-side client service

This is a classic architecture mistake: auth success and app readiness were
treated as the same thing, even though they are separate layers.

### Where This Lived

- [handlers_me.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go)
- [hair-booking-coolify.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md)

### How We Diagnosed It

The key signal was:

```bash
curl -sS https://hair-booking.app.scapegoat.dev/api/info | jq
```

which returned:

```json
{
  "data": {
    "databaseConfigured": false
  }
}
```

### Fix

We found the hosted Postgres container on the Coolify host and added the
database URL into the live app env file:

- `/data/coolify/applications/uion8lttbypsijf8ww9b4c3e/.env`

Then recreated the container:

```bash
ssh manuel@89.167.52.236 \
  'sudo -n bash -lc "cd /data/coolify/applications/uion8lttbypsijf8ww9b4c3e && docker compose up -d"'
```

### Lesson

Never treat:

- `/auth/login` redirect success

as proof that:

- authenticated app flows are healthy

The correct health chain is:

1. auth redirect works
2. callback works
3. session cookie exists
4. `/api/me` works
5. app-side database-backed bootstrap works

## Failure 2: Logout Was Not Actually Configured In Keycloak

### Symptom

Hosted logout produced:

```text
Invalid redirect uri
```

### Why It Happened

The hosted Keycloak browser client allowed:

- `/auth/callback`

but did not allow:

- `/auth/logout/callback`

The app backend already had the correct logout architecture in:

- [oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go)

but the Keycloak client definition did not mirror that path.

### Where This Lived

- [main.tf](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf)
- [variables.tf](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf)
- [main.tf](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local/main.tf)

### Fix

We added:

- hosted `valid_post_logout_redirect_uris = ["https://hair-booking.app.scapegoat.dev/auth/logout/callback"]`
- local dev post-logout callbacks for `:8080` and `:8081`

### Lesson

When reviewing OIDC client config, an intern must check both:

- login callback URIs
- logout callback URIs

If only login is reviewed, the system is only half-configured.

## Failure 3: Shared Terraform Defaults Were Dangerous

### Symptom

A plain hosted plan unexpectedly tried to drift the realm back to:

- `smailnail`

### Why It Happened

The shared Terraform repo still exports from `.envrc`:

- `TF_VAR_realm_name=smailnail`

That is fine for the default shared environment, but dangerous when operating
the dedicated `hair-booking` env.

### Where This Lived

- `/home/manuel/code/wesen/terraform/.envrc`

### Fix

Every hosted `hair-booking` Terraform plan/apply must override:

```bash
TF_VAR_realm_name=hair-booking
TF_VAR_realm_display_name=hair-booking
```

Example:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
TF_VAR_realm_name=hair-booking \
TF_VAR_realm_display_name=hair-booking \
terraform -chdir=keycloak/apps/hair-booking/envs/hosted plan
```

### Lesson

Shared operator environments are convenient, but they create invisible global
state. An intern should assume that a Terraform shell may already contain
dangerous defaults from another product.

Safe rule:

- always print or pin critical `TF_VAR_*` values before plan/apply

## Failure 4: SMTP Could Not Be Terraform-Only

### Symptom

At first glance, it looked like SMTP should just be another Terraform setting.
That turned out to be incomplete.

### Why It Happened

SES SMTP requires secret-bearing credentials:

- SMTP username
- SMTP password derived from IAM secret material

Putting those directly into Terraform would leak them into state or at minimum
make the state model more sensitive than desired.

### Resulting Hybrid Model

Terraform owns:

- realm policy
- realm `verify_email`
- realm `remember_me`
- SES identity
- DKIM
- MAIL FROM
- configuration set

Operator workflow owns:

- SMTP credentials
- Keycloak `smtpServer` secret-bearing configuration

To support that split, Terraform now ignores manual SMTP drift in:

- [main.tf](/home/manuel/code/wesen/terraform/keycloak/modules/realm-base/main.tf)

using:

```hcl
lifecycle {
  ignore_changes = [
    smtp_server,
  ]
}
```

### Lesson

Not all infrastructure should be flattened into one tool. The right system here
is hybrid:

- Terraform for durable, reviewable, non-secret control plane
- operator-managed secret injection for SMTP credentials

## Failure 5: The First SES Policy Was Too Narrow

### Symptom

Keycloak email actions returned `500`, and the logs showed SES authorization
failure.

### Root Cause

The generated IAM policy allowed sending only against:

- the SES identity ARN

But hosted sending also referenced:

- the SES configuration set ARN

### Fix

The SMTP IAM policy had to allow both:

```text
arn:aws:ses:us-east-1:745667007186:identity/mail.scapegoat.dev
arn:aws:ses:us-east-1:745667007186:configuration-set/mail-scapegoat-dev
```

### Lesson

When working with SES, do not assume "identity verified" means "all send paths
authorized." Configuration sets can add extra resource constraints that matter
at runtime.

## Failure 6: Script Output Format Matters

### Symptom

The generated SMTP env file broke when sourced:

```text
Booking: command not found
```

### Root Cause

The script wrote:

```text
KEYCLOAK_SMTP_FROM_DISPLAY_NAME=Hair Booking
```

without shell-safe escaping.

### Fix

The generator now writes shell-safe values. The existing env file was repaired
in place and kept mode `600`.

### Lesson

Operator scripts should be written as if another human will rerun them six
months later after forgetting every assumption. Shell-safe output is part of
the interface, not a cosmetic detail.

## What Worked Well

Several architectural decisions were good and should be preserved.

### 1. Hard Cutover Was The Right Choice

Because the app is not fully public yet, a hard cutover was simpler and less
error-prone than carrying legacy shared-realm compatibility code.

### 2. The Backend Auth Paths Were Already Structured Correctly

The Go backend already had the right conceptual flow:

- `/auth/login`
- `/auth/callback`
- `/auth/logout`
- `/auth/logout/callback`

That meant the main issues were in client configuration and deployment env, not
in the fundamental Go auth architecture.

### 3. Ticket-Based Operator Scripts Helped

The two HAIR-010 scripts made the work reproducible:

- [create_hair_booking_ses_smtp_credentials.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/create_hair_booking_ses_smtp_credentials.sh)
- [configure_hosted_keycloak_smtp_and_smoke.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh)

These scripts should remain part of the ticket history because they show the
exact operator boundary between Terraform and live Keycloak.

### 4. `/api/info` Was A Good Debug Surface

The app exposing:

- issuer URL
- client ID
- databaseConfigured

made it much easier to debug whether a problem was auth, deployment, or data.

## End-State Architecture After The Fixes

This is the current steady-state shape.

```text
hair-booking app repo
├── Go OIDC handlers
├── embedded React SPA
├── /api/me bootstrap
└── deployment docs + operator scripts

shared terraform repo
├── realm-base module
├── browser-client module
├── hosted hair-booking realm/client
└── SES infrastructure

Coolify host
├── app container
├── Postgres container
└── Keycloak service

AWS SES
├── verified identity: mail.scapegoat.dev
├── configuration set: mail-scapegoat-dev
└── SMTP IAM user for Keycloak
```

## Deployment and Operations Playbook

An intern should use this mental checklist before touching auth.

### Terraform Change Checklist

1. Confirm the target repo is `/home/manuel/code/wesen/terraform`
2. `source .envrc`
3. Override the realm vars for `hair-booking`
4. Run `terraform validate`
5. Run `terraform plan`
6. Verify the plan does not drift toward `smailnail`
7. Apply
8. Re-check the live realm through the admin API

Canonical pattern:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
TF_VAR_realm_name=hair-booking \
TF_VAR_realm_display_name=hair-booking \
terraform -chdir=keycloak/apps/hair-booking/envs/hosted plan
```

### Hosted App Validation Checklist

1. `curl /api/info`
2. confirm issuer URL
3. confirm `databaseConfigured: true`
4. test `/auth/login`
5. test portal login
6. test `/api/me`
7. test logout
8. test repeat login

### SMTP Validation Checklist

1. confirm SES identity exists
2. confirm SMTP credentials exist outside git
3. confirm hosted realm `smtpServer` is populated
4. trigger `VERIFY_EMAIL`
5. trigger `UPDATE_PASSWORD`
6. inspect Keycloak logs if either returns `500`

## Pseudocode For The Safe End-to-End Validation Loop

```text
function validateHostedAuth():
  info = GET /api/info
  assert info.issuerUrl == "https://auth.scapegoat.dev/realms/hair-booking"
  assert info.databaseConfigured == true

  user = registerFreshUser()
  assert browserShowsVerifyEmailGate(user)

  triggerPasswordReset(user)
  assert browserShowsResetMailConfirmation()

  markVerifiedForSmokeIfUsingSimulator(user)

  login(user)
  me = GET /api/me
  assert me.status == 200
  clientId = me.client.id

  logout()
  login(user)
  meAgain = GET /api/me
  assert meAgain.client.id == clientId
```

## Remaining Gaps

The remaining HAIR-010 gaps are no longer architectural surprises.

They are:

- real mailbox validation for verify-email completion
- real mailbox validation for password-reset completion
- future Google provider setup
- future Facebook provider setup
- future secret-store migration from local operator file to vault

That is a much better state than before. The remaining work is product rollout
and operator hardening, not infrastructure confusion.

## What We Should Do Differently Next Time

If we were re-running this rollout from zero, the better sequence would be:

1. create realm in Terraform
2. explicitly validate login and logout callback URIs before any browser smoke
3. explicitly validate app `databaseConfigured` before declaring auth healthy
4. wire SMTP with operator secrets before enabling `verify_email`
5. validate SES permissions against identity and configuration-set resources
6. use a real mailbox earlier if full end-to-end verification matters
7. record shared Terraform env defaults before running plan/apply

## Final Conclusions

This migration was successful, but it was more than an auth migration. It was a
coordination problem across:

- app code
- Terraform
- hosted env vars
- Keycloak runtime
- SES runtime

The final architecture is solid, but only because each hidden coupling was made
explicit and then documented.

For a new intern, the main takeaway is:

- auth systems fail at boundaries

The code, Terraform, Coolify env, Keycloak client settings, and SMTP policy all
have to agree. If one of them silently lags behind, the failure will often look
like "login is broken" even when the real issue is somewhere else entirely.
