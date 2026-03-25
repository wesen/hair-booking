---
Title: hair-booking Keycloak Terraform Migration Guide
Ticket: HAIR-010
Status: active
Topics:
    - auth
    - keycloak
    - backend
    - deploy
    - infrastructure
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf
      Note: Current hosted hair-booking Terraform env still manages only a browser client inside the shared smailnail realm
    - Path: /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local/main.tf
      Note: Local hair-booking Terraform env already creates its own realm and is the closest starting point for the hosted migration
    - Path: /home/manuel/code/wesen/terraform/keycloak/apps/smailnail/envs/hosted/main.tf
      Note: Reference pattern for a hosted env that actually owns a realm
    - Path: /home/manuel/code/wesen/terraform/keycloak/modules/realm-base/main.tf
      Note: Module that already supports registration and password-reset realm settings
    - Path: /home/manuel/code/wesen/terraform/Makefile
      Note: Existing validation, plan, and apply targets that need to remain usable during the migration
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/dev/keycloak/realm-import/hair-booking-dev-realm.json
      Note: Current repo-local dev realm import that should stay aligned with the Terraform naming model
ExternalSources:
    - https://www.keycloak.org/docs/latest/server_admin/
    - https://www.keycloak.org/server/features
Summary: Detailed design and rollout guide for moving hair-booking Keycloak ownership into the shared Terraform repo, using a hard pre-production cutover to a dedicated realm plus social-login follow-up recommendations.
LastUpdated: 2026-03-25T11:40:00-04:00
WhatFor: Use this to implement the Keycloak Terraform work safely and directly now that hosted auth is still pre-production.
WhenToUse: Use before editing /home/manuel/code/wesen/terraform or changing hosted hair-booking OIDC env vars.
---

# hair-booking Keycloak Terraform Migration Guide

## Executive Summary

`hair-booking` is no longer at the stage where it should authenticate against the shared `smailnail` realm as a tenant-style add-on. It now has its own hosted domain, its own customer population, and its own product-specific login requirements. That means the correct next step is to make `hair-booking` own a dedicated Keycloak realm in Terraform, while still reusing the same Keycloak server deployment at `https://auth.scapegoat.dev`.

The important operational detail is that the current hosted Terraform workspace for `hair-booking` does not own a realm. It only owns one browser client inside `smailnail`. Because the app is not in real production yet, the migration does **not** need a temporary overlap phase. The simplest and best approach is a hard cutover: change the hosted Terraform workspace so it owns the `hair-booking` realm directly, apply that change, update the app to the new issuer and secret, and stop carrying the old shared-realm shape forward.

Applied status on 2026-03-25:

- hosted realm `hair-booking` was created successfully
- hosted `hair-booking-web` client was recreated in that realm
- live app issuer was switched to `https://auth.scapegoat.dev/realms/hair-booking`
- `https://hair-booking.app.scapegoat.dev/auth/login` now redirects into the dedicated realm
- hosted realm SMTP was configured manually against SES
- hosted realm `verify_email` is now managed in Terraform while `smtp_server` is intentionally ignored by Terraform

## What This System Actually Is

There are two repos involved, and understanding the boundary between them is the main prerequisite.

### Repo 1: application runtime

This repo:

- app repo: `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking`
- owns:
  - Go backend
  - embedded React frontend
  - local dev Keycloak JSON import
  - Coolify runtime env vars
  - smoke tests and deployment docs

It does **not** own the long-term hosted Keycloak realm/client source of truth anymore.

### Repo 2: shared identity infrastructure

Shared Terraform repo:

- repo: `/home/manuel/code/wesen/terraform`
- owns:
  - hosted Keycloak realm and client Terraform
  - shared modules
  - remote state
  - hosted Keycloak admin API changes

This repo is the correct source of truth for the hosted realm migration.

## Current State

The current shape is asymmetrical.

### Local state

Local `hair-booking` already looks like its own app:

- local imported realm in app repo: `hair-booking-dev`
- local Terraform sandbox realm in infra repo: `hair-booking-dev-tf`
- local browser client: `hair-booking-web`

That means local development already thinks in dedicated-realm terms, even if the exact realm names are not aligned.

### Hosted state

Hosted `hair-booking` is still attached to `smailnail`:

- issuer: `https://auth.scapegoat.dev/realms/smailnail`
- client: `hair-booking-web`
- Terraform workspace: `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted`
- ownership model: client only, not realm

### Why this is a problem

This causes several product and operations issues:

- `hair-booking` cannot manage registration policy independently.
- `hair-booking` cannot manage social providers independently.
- realm branding, email flows, and broker settings are shared with another product.
- reviewing identity drift becomes harder because `smailnail` and `hair-booking` users are mixed at the realm boundary.
- it is easy to accidentally couple app rollout timing to unrelated `smailnail` identity changes.

## Current Terraform Shape

### Hosted `hair-booking`

Current hosted entrypoint:

- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`

Current model:

```hcl
locals {
  public_app_url = trimsuffix(var.public_app_url, "/")
}

module "browser_client" {
  source        = "../../../../modules/browser-client"
  realm_id      = var.realm_name
  client_id     = var.browser_client_id
  client_secret = var.web_client_secret
}
```

Important interpretation:

- `realm_id = var.realm_name` means this workspace assumes the realm already exists.
- default `realm_name` is currently `smailnail`.
- this workspace cannot currently create a dedicated hosted `hair-booking` realm.

### Local `hair-booking`

Local entrypoint:

- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local/main.tf`

Current model:

```hcl
module "realm" {
  source       = "../../../../modules/realm-base"
  realm_name   = var.realm_name
  display_name = var.realm_display_name
}

module "browser_client" {
  source   = "../../../../modules/browser-client"
  realm_id = module.realm.id
}
```

Important interpretation:

- local `hair-booking` already knows how to own a realm.
- the hosted env simply has not been promoted to the same model yet.

### Hosted `smailnail`

Reference entrypoint:

- `/home/manuel/code/wesen/terraform/keycloak/apps/smailnail/envs/hosted/main.tf`

This file is the best reference pattern because it already owns:

- a hosted realm
- one or more clients inside that realm
- a post-apply helper for realm-specific policy

The intern should treat hosted `smailnail` as the template for realm ownership, not as a product dependency.

## Target State

After the migration, the model should look like this:

```text
shared Keycloak server: auth.scapegoat.dev
├── realm: smailnail
│   ├── client: smailnail-web
│   └── client: smailnail-mcp
└── realm: hair-booking
    ├── client: hair-booking-web
    ├── local registration policy
    ├── local password reset policy
    ├── Google identity provider
    └── Facebook identity provider
```

The app should then point to:

```text
issuer = https://auth.scapegoat.dev/realms/hair-booking
client_id = hair-booking-web
```

## Architectural Decision: Use Terraform As The Hosted Source Of Truth

This migration should be Terraform-first, not admin-console-first.

Why:

- realms and clients are long-lived infrastructure, not one-off runtime config
- reviewable diffs matter
- app repos should not silently become the identity control plane
- future social-provider drift is much easier to manage if the realm baseline is codified

Manual Keycloak admin changes are acceptable only for:

- temporary exploratory testing
- secrets collected from Google or Meta while waiting to codify them
- emergency rollback debugging
- hosted SMTP configuration that must stay out of Terraform state

They should not be the steady-state system of record.

Important refinement after the SES slice:

- realm policy still belongs in Terraform
- secret-bearing SMTP credentials do not
- the shared `realm-base` module therefore ignores `smtp_server` drift so
  Terraform can safely manage `verify_email` without deleting manual SMTP
  settings

## Hard Cutover Rule

This migration should be implemented as a hard cutover, not as a temporary overlap.

Why that is acceptable here:

- the app is not yet in real customer production
- we do not need to preserve live login continuity
- carrying a temporary legacy client path makes the Terraform and documentation more confusing
- the long-term end state is already clear

That means the hosted `hair-booking` Terraform workspace should move directly from:

- shared-realm client only

to:

- dedicated `hair-booking` realm
- dedicated `hair-booking-web` client inside that realm

in one coherent change set.

## Hosted Migration Design

The migration should be a single clean promotion of hosted `hair-booking` into realm ownership.

Recommended shape:

```hcl
module "realm" {
  source                   = "../../../../modules/realm-base"
  realm_name               = var.realm_name
  display_name             = var.realm_display_name
  registration_allowed     = true
  login_with_email_allowed = true
  duplicate_emails_allowed = false
  reset_password_allowed   = true
}

module "browser_client" {
  source                   = "../../../../modules/browser-client"
  realm_id                 = module.realm.id
  client_id                = var.browser_client_id
  client_secret            = var.web_client_secret
  manage_scope_attachments = false
  valid_redirect_uris      = local.valid_redirect_uris
  web_origins              = local.web_origins
}
```

There should be no migration-only `browser_client_legacy` module in this plan.

## Recommended Terraform End State

After the hard cutover, the hosted `hair-booking` env should look conceptually like this:

```hcl
locals {
  public_app_url = trimsuffix(var.public_app_url, "/")
  valid_redirect_uris = concat([
    "${local.public_app_url}/auth/callback",
  ], var.extra_valid_redirect_uris)
  web_origins = concat([
    local.public_app_url,
  ], var.extra_web_origins)
}

module "realm" {
  source                   = "../../../../modules/realm-base"
  realm_name               = var.realm_name
  display_name             = var.realm_display_name
  registration_allowed     = true
  login_with_email_allowed = true
  reset_password_allowed   = true
  duplicate_emails_allowed = false
}

module "browser_client" {
  source                   = "../../../../modules/browser-client"
  realm_id                 = module.realm.id
  client_id                = var.browser_client_id
  name                     = var.browser_client_id
  client_secret            = var.web_client_secret
  manage_scope_attachments = false
  valid_redirect_uris      = local.valid_redirect_uris
  web_origins              = local.web_origins
}
```

This is the same ownership model as the local env and broadly the same pattern as hosted `smailnail`, just without the MCP-specific extras.

## Exact Files An Intern Should Inspect First

Read these files in order before editing anything:

1. `/home/manuel/code/wesen/terraform/docs/shared-keycloak-platform-playbook.md`
2. `/home/manuel/code/wesen/terraform/keycloak/README.md`
3. `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`
4. `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`
5. `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local/main.tf`
6. `/home/manuel/code/wesen/terraform/keycloak/apps/smailnail/envs/hosted/main.tf`
7. `/home/manuel/code/wesen/terraform/keycloak/modules/realm-base/variables.tf`
8. `/home/manuel/code/wesen/terraform/Makefile`
9. `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/dev/keycloak/realm-import/hair-booking-dev-realm.json`
10. `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md`

## Detailed Implementation Plan

### Step 1: normalize naming

Goal:

- make local and hosted naming easier to reason about

Current inconsistency:

- repo-local imported dev realm: `hair-booking-dev`
- infra local Terraform sandbox realm: `hair-booking-dev-tf`

Recommendation:

- keep the JSON-imported realm as `hair-booking-dev`
- keep the Terraform sandbox realm as `hair-booking-dev-tf` if it is still useful for isolated experiments
- but document clearly that it is an infra sandbox, not the day-to-day app local realm

If the team wants less confusion, a later cleanup can choose one local naming convention. That is optional for this ticket. The hosted migration does not require renaming the local sandbox realm.

### Step 2: extend hosted `hair-booking` variables

Edit:

- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`

Add variables such as:

- `realm_name` defaulting to `hair-booking`
- `realm_display_name` defaulting to `hair-booking`
- booleans only if needed for registration policy overrides

Pseudocode:

```hcl
variable "realm_name" {
  type    = string
  default = "hair-booking"
}

variable "realm_display_name" {
  type    = string
  default = "hair-booking"
}

```

### Step 3: add hosted realm ownership

Edit:

- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`

Add:

- `module "realm"` using `realm-base`
- registration settings that support password signup

Recommended realm settings for MVP:

- `registration_allowed = true`
- `login_with_email_allowed = true`
- `duplicate_emails_allowed = false`
- `reset_password_allowed = true`
- `edit_username_allowed = false`

Reasoning:

- customers should be able to register themselves
- email should be the practical user-facing identifier
- duplicate emails create identity ambiguity
- password reset is table stakes for a real consumer app

### Step 4: switch the hosted workspace to dedicated realm ownership

Replace the current hosted `browser_client` module shape so it points at `module.realm.id` instead of `var.realm_name`.

This is the critical Terraform change:

- before: hosted workspace assumes a shared realm exists
- after: hosted workspace creates and owns the `hair-booking` realm itself

### Step 5: validate Terraform before planning hosted changes

From:

```bash
cd /home/manuel/code/wesen/terraform
```

Run:

```bash
make validate
make state-list-hair-booking
```

Then explicitly plan hosted `hair-booking`:

```bash
export AWS_PROFILE=manuel
export TF_VAR_keycloak_url=https://auth.scapegoat.dev
export TF_VAR_keycloak_admin_realm=master
export TF_VAR_keycloak_client_id=admin-cli
export TF_VAR_keycloak_username=...
export TF_VAR_keycloak_password=...
export TF_VAR_realm_name=hair-booking
export TF_VAR_realm_display_name=hair-booking
export TF_VAR_public_app_url=https://hair-booking.app.scapegoat.dev
export TF_VAR_web_client_secret=...

make plan-hair-booking
```

### Step 6: review the plan like an operator, not like a coder

The plan should show something close to:

- create realm `hair-booking`
- create dedicated `hair-booking-web` client in that new realm
- stop managing `hair-booking` as a shared-realm tenant

The plan should **not** show:

- destroy realm `smailnail`
- modify unrelated `smailnail` clients
- change unrelated shared-platform resources

If the plan is ambiguous, stop and refactor the Terraform shape before applying.

### Step 7: apply the hard cutover phase

Run:

```bash
make apply-hair-booking
```

Then verify in Keycloak:

- realm `hair-booking` exists
- browser client `hair-booking-web` exists inside it
- registration is enabled

### Step 8: update application runtime env

In Coolify or the deployment system, update:

```env
HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.scapegoat.dev/realms/hair-booking
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET=<dedicated-client-secret>
HAIR_BOOKING_OIDC_REDIRECT_URL=https://hair-booking.app.scapegoat.dev/auth/callback
```

Then redeploy the app.

### Step 9: verify the hosted login path

Smoke-test these flows:

- load `/booking`
- load `/portal`
- load `/stylist`
- click sign-in
- verify redirect goes to `.../realms/hair-booking/...`
- complete login
- verify callback returns successfully
- verify logout returns to the app cleanly

API checks after login:

- `GET /api/info`
- `GET /api/me`
- `GET /api/stylist/me`

### Step 10: clean up stale docs and examples

After the hosted app is stable:

1. remove stale references to hosted `smailnail` usage from app docs
2. update deployment examples to point to `https://auth.scapegoat.dev/realms/hair-booking`
3. confirm the stable operator docs describe the new ownership model

## Social Provider Rollout And Terraform Boundaries

### What the official Keycloak docs confirm

Keycloak officially documents:

- user self-registration
- identity brokering
- first broker login flow
- Google identity provider
- Facebook identity provider
- Instagram provider as feature-flagged and deprecated for removal

That means the realm design is sound. But this repo-specific Terraform analysis found something important:

- there are currently no existing identity-provider Terraform resources in `/home/manuel/code/wesen/terraform/keycloak`

Practical meaning:

- dedicated realm + browser client can be migrated now with existing patterns
- Google and Facebook provider codification will likely require new Terraform resources or a temporary manual-admin-console phase

### Recommendation for provider rollout

Use two phases:

1. Terraform-first realm/client separation now
2. provider codification after the dedicated realm is stable

This avoids mixing two classes of risk:

- realm ownership migration risk
- social-provider integration risk

### Instagram recommendation

Instagram should not be treated as a blocker for the Terraform migration.

Reason:

- Keycloak marks it deprecated for removal
- it requires the `instagram-broker` feature
- Meta-family login can often be satisfied sufficiently through Facebook first

Recommended order:

1. local password signup
2. Google
3. Facebook
4. Instagram only if the business need remains strong

## Interaction With The app Repo

Even though Terraform owns the hosted realm, the app repo still needs coordinated changes.

### App repo files that matter

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Makefile`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/dev/keycloak/realm-import/hair-booking-dev-realm.json`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify-playbook.md`

### App repo updates likely required after realm cutover

- remove stale docs that still mention hosted `smailnail`
- ensure smoke tests check the correct hosted issuer
- update any deployment examples that still say `https://auth.example.com/realms/smailnail`

## Validation Checklist

### Terraform validation

- `make validate`
- `make state-list-hair-booking`
- `make plan-hair-booking`

### Keycloak validation

- realm `hair-booking` exists
- self-registration enabled
- forgot-password enabled
- `hair-booking-web` present in `hair-booking`

### Hosted app validation

- `/auth/login` redirects into realm `hair-booking`
- callback succeeds
- logout succeeds
- `GET /api/info` reports the new issuer
- new users can register
- existing local app bootstrap does not create duplicate client rows for repeated logins

## Common Failure Modes

### Failure mode 1: destructive plan touches unrelated shared resources

Symptom:

- plan wants to modify or destroy more than the new `hair-booking` realm/client scope

Fix:

- refactor the hosted `hair-booking` workspace so it cleanly owns only the dedicated realm and client it is supposed to manage

### Failure mode 2: wrong secret after cutover

Symptom:

- Keycloak login succeeds but callback fails at token exchange

Fix:

- confirm the app is using the dedicated realm client secret, not the old shared-realm secret

### Failure mode 3: docs drift between app repo and Terraform repo

Symptom:

- local docs still say shared realm or old issuer

Fix:

- update both repos in the same operator session and record the exact issuer/client values in the ticket diary

### Failure mode 4: social provider work starts before realm cutover stabilizes

Symptom:

- debugging mixes provider setup failures with realm migration failures

Fix:

- separate the rollout into realm first, social providers second

## Review Guidance For The Intern

When reviewing a PR or change set for this migration, ask these questions in order:

1. Does hosted `hair-booking` now own a realm in Terraform?
2. Does the plan stay within `hair-booking` scope instead of mutating unrelated shared resources?
3. Are registration and password-reset realm settings enabled deliberately?
4. Do app runtime env examples now point to `https://auth.scapegoat.dev/realms/hair-booking`?
5. Did the author separate realm migration from social-provider rollout?
6. Did the author remove migration-only complexity instead of preserving it without need?

## Recommended Next Tickets After This Guide

After the Terraform realm migration is implemented, the next follow-up work should be:

1. codify Google provider setup
2. codify Facebook provider setup
3. decide whether Instagram should exist at all
4. add hosted smoke tests for registration and broker login
5. update the stable deployment and auth docs in the app repo
