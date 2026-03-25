---
Title: hair-booking Keycloak Realm And Social Login Guide
Ticket: HAIR-010
Status: active
Topics:
    - auth
    - keycloak
    - backend
    - deploy
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: docs/deployments/hair-booking-coolify.md
      Note: Current hosted environment still points at the shared smailnail realm
    - Path: README.md
      Note: Repo entrypoint for deployment and auth documentation links
ExternalSources:
    - https://www.keycloak.org/docs/latest/server_admin/
    - https://www.keycloak.org/server/features
Summary: Recommended Keycloak target architecture for separating hair-booking from smailnail while supporting password signup plus Google and Meta-based login.
LastUpdated: 2026-03-25T11:40:00-04:00
WhatFor: Use this to scope the dedicated hosted realm, client configuration, self-registration path, and social login rollout order.
WhenToUse: Use before changing the hosted issuer away from the shared smailnail realm.
---

# hair-booking Keycloak Realm And Social Login Guide

Companion document:

- use [02-hair-booking-keycloak-terraform-migration-guide.md](./02-hair-booking-keycloak-terraform-migration-guide.md) for the detailed shared-Terraform rollout plan in `/home/manuel/code/wesen/terraform`

## Executive Summary

`hair-booking` should stop using the shared `smailnail` realm and move to its own dedicated `hair-booking` realm on the same Keycloak server.

That gives the app:

- separate users
- separate clients
- separate login and registration settings
- separate social identity providers
- separate branding and login flows

without forcing a second Keycloak installation immediately.

For MVP, the recommended identity strategy is:

1. first-party signup with login/password
2. Google sign-in
3. Facebook sign-in
4. Instagram sign-in only if the Meta-side setup friction is acceptable

Important current-product recommendation:

- use the same Keycloak server at `auth.scapegoat.dev`
- create a separate realm
- do not create a separate Keycloak deployment yet unless there is a hard operational reason

## Locked Decisions

These decisions are now treated as the default execution plan unless the user changes them later.

### Realm ownership

- hosted auth is now cut over to realm `hair-booking`
- keep using the shared Keycloak server at `https://auth.scapegoat.dev`
- do not introduce a second Keycloak deployment for MVP

### Local realm naming

- keep both local names for now
- `hair-booking-dev` remains the repo-local imported realm used for day-to-day app development
- `hair-booking-dev-tf` remains the Terraform sandbox realm used for infra testing

This is not elegant, but it is operationally clear enough and avoids churn in local scripts right now.

### Signup policy

- local email/password signup stays in scope
- email verification should be required before calling signup complete
- `Forgot Password` stays enabled
- SMTP will be wired later using Amazon SES

Practical implication:

- the hosted realm should use SES-backed SMTP for verification and password reset
- realm policy can stay in Terraform
- SMTP credentials should stay outside git and outside Terraform state
- live hosted status after the SES slice:
  - `User Registration`: enabled
  - `Forgot Password`: enabled
  - `Remember Me`: enabled
  - `Verify Email`: enabled
  - SMTP: configured against `email-smtp.us-east-1.amazonaws.com`

### Social provider scope

- Google stays in MVP scope
- Facebook stays in MVP scope
- Instagram is out for the initial MVP unless the business case becomes explicit later

### Social provider implementation path

- first rollout should be manual in Keycloak admin, not Terraform-first
- Terraform codification can happen after the provider settings stabilize

### Identity mapping policy

- Keycloak subject should be the canonical auth identity
- email should remain useful for UX and matching, but should not become the only permanent identity key

This decision matters for avoiding duplicate local `clients` rows when one person uses password login first and social login later.

## Current State

Today the hosted app points at the dedicated `hair-booking` realm:

- issuer: `https://auth.scapegoat.dev/realms/hair-booking`
- browser client: `hair-booking-web`
- hosted SMTP: Amazon SES over `email-smtp.us-east-1.amazonaws.com:587`

That means the realm boundary is now correct for MVP. The remaining auth work is
signup validation and social-provider rollout, not realm separation.

## Official Keycloak Capabilities

The current Keycloak Server Administration Guide explicitly documents all of the base capabilities needed here:

- user self-registration
- first broker login flow
- identity brokering
- Google identity provider
- Facebook identity provider
- Instagram identity provider

Two official details matter a lot:

1. User self-registration is controlled at `Realm Settings -> Login -> User Registration`.
2. The Instagram broker is documented, but Keycloak marks it as deprecated for removal and says to prefer the Facebook broker. It must also be enabled through the `instagram-broker` feature.

Official references:

- Server Administration Guide: `https://www.keycloak.org/docs/latest/server_admin/`
- Feature flags: `https://www.keycloak.org/server/features`

## Recommended Target Architecture

### Realm layout

Production:

- server: `https://auth.scapegoat.dev`
- realm: `hair-booking`
- issuer: `https://auth.scapegoat.dev/realms/hair-booking`

Local development:

- realm: `hair-booking-dev`
- issuer: `http://127.0.0.1:18080/realms/hair-booking-dev`

This keeps local development and hosted runtime aligned while preserving a safe, local-only realm import.

### Client layout

Initial client:

- `hair-booking-web`
  - confidential browser client
  - used by the Go server for OIDC browser login

Likely redirect URIs:

- `https://hair-booking.app.scapegoat.dev/auth/callback`
- `http://127.0.0.1:8080/auth/callback`

Likely web origins:

- `https://hair-booking.app.scapegoat.dev`
- `http://127.0.0.1:8080`

### Identity sources

Recommended identity sources inside the new realm:

- local realm accounts
  - email or username + password
- Google
- Facebook
- Instagram only if enabled intentionally and accepted as a higher-friction provider

## Signup And Password Flow Recommendations

If the app is going to offer local signup, Keycloak should handle it end to end instead of the app creating shadow password flows.

Recommended realm login settings:

- User Registration: ON
- Forgot Password: ON
- Remember Me: ON
- Verify Email: ON
- Brute Force Detection: ON

Recommended product policy:

- require email
- treat email as the canonical customer identity
- do not store app-specific passwords outside Keycloak

Operational note:

- password signup without SMTP and email verification is weaker than it looks
- in the hosted realm, SMTP and `Verify Email` are now live

## Hosted SMTP Operator Model

The final hosted operator split matters:

- Terraform owns:
  - realm existence
  - client existence
  - realm policy such as `verify_email`, `remember_me`, and registration settings
- Operator workflow owns:
  - SES SMTP IAM user
  - SMTP access key and derived SMTP password
  - Keycloak `smtpServer` secret-bearing fields

This is intentional. The SMTP secrets should not be placed in Terraform state.

Because of that split, the shared Terraform realm module now ignores manual
`smtp_server` drift. Otherwise a normal `terraform apply` for `verify_email`
would wipe the SMTP configuration back out of the realm.

Current hosted SMTP shape, without secrets:

- host: `email-smtp.us-east-1.amazonaws.com`
- port: `587`
- from: `no-reply@mail.scapegoat.dev`
- reply-to: `no-reply@mail.scapegoat.dev`
- auth: `true`
- starttls: `true`

Current operator replay artifacts:

- `scripts/create_hair_booking_ses_smtp_credentials.sh`
- `scripts/configure_hosted_keycloak_smtp_and_smoke.sh`

## Social Login Recommendations

### Google

Google should be the first social provider to ship.

Reason:

- lowest user friction
- relatively predictable provider setup
- broadly useful for salon customers

### Facebook

Facebook is a reasonable second provider.

Reason:

- still a common login identity for some customer demographics
- officially supported by Keycloak as a built-in identity provider

### Instagram

Instagram needs more caution.

Why:

- Keycloak currently documents it as deprecated for removal
- Keycloak explicitly recommends using the Facebook broker instead
- the feature requires enabling `instagram-broker`
- it still depends on Meta-side application setup

So the real recommendation is:

- promise “Meta-family login” carefully
- ship Google first
- ship Facebook second
- only ship Instagram if you confirm the business need outweighs the maintenance cost

## Account Linking And First Broker Login

This is the part that most easily creates a messy customer identity model.

Problem:

- a user can sign up locally with email/password
- later they can return with Google or Facebook
- if the first broker login behavior is not reviewed, you can create duplicate customers

Things to review explicitly:

- default first broker login flow
- whether users with matching emails are linked or duplicated
- whether email from the external provider is trusted
- how the app maps Keycloak users to local `clients`

Recommended app-level policy:

- one Keycloak user should map to one local `clients` row
- prefer stable subject IDs from Keycloak for the app’s auth identity
- use email for UX and lookup assistance, not as the only permanent identity key

## Suggested Implementation Order

### Phase 1: dedicated realm

1. Create hosted realm `hair-booking`
2. Create local realm import `hair-booking-dev`
3. Create confidential client `hair-booking-web`
4. Set redirect URIs and web origins
5. Update hosted app env to use the new issuer

### Phase 2: local signup

1. Enable registration
2. Enable forgot password
3. Enable verify email
4. Configure SMTP
5. Test:
   - registration
   - email verification
   - password reset
   - logout/login

### Phase 3: Google

1. Add Google identity provider in Keycloak
2. Configure the Google OAuth app
3. Test first broker login
4. Test repeat login
5. Test account linking behavior against an existing local account

### Phase 4: Facebook

1. Add Facebook identity provider in Keycloak
2. Configure the Meta app
3. Test first broker login
4. Test repeat login
5. Test account linking behavior

### Phase 5: Instagram

1. Decide whether to enable the `instagram-broker` feature at all
2. If yes, enable it intentionally
3. Configure the Meta/Instagram provider settings
4. Test first broker login
5. Decide whether the maintenance burden is acceptable

## Definitive Execution Order

This is the recommended implementation order from this point forward.

### Step 1: stabilize realm and docs

1. keep the hosted realm cutover as the new baseline
2. update all operator docs and examples so they reference `hair-booking`
3. keep the local naming split documented clearly

### Step 2: finish realm login settings

1. enable `Remember Me`
2. enable `Verify Email`
3. confirm `User Registration` and `Forgot Password` remain enabled
4. document which pieces are blocked on SMTP

### Step 3: prepare SMTP using SES

1. decide the sender domain/address
2. create SES SMTP credentials outside the repo
3. configure Keycloak realm email settings
4. send test email
5. test signup verification and password reset end to end

### Step 4: ship Google manually in Keycloak

1. create Google OAuth app
2. configure Google identity provider in realm `hair-booking`
3. test first broker login
4. test repeat login
5. test duplicate-account behavior against an existing local account

### Step 5: ship Facebook manually in Keycloak

1. create Meta app
2. configure Facebook identity provider in realm `hair-booking`
3. test first broker login
4. test repeat login
5. test duplicate-account behavior against an existing local account

### Step 6: optional future work

1. decide whether to codify providers in Terraform
2. decide whether to collapse local realm naming
3. decide whether Instagram ever needs to exist

## Repo Changes Required After Realm Cutover

Once the new realm exists, this repo will need:

1. Hosted env update

```env
HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.scapegoat.dev/realms/hair-booking
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET=<new-secret>
HAIR_BOOKING_OIDC_REDIRECT_URL=https://hair-booking.app.scapegoat.dev/auth/callback
```

2. Local dev defaults aligned with `hair-booking-dev`

3. Local realm import updated under `dev/keycloak/realm-import/`

4. Smoke tests updated for:

- registration
- login
- password reset
- Google broker login
- Facebook broker login

## Recommended MVP Decision

If you want the cleanest path to a real customer auth story:

1. create the `hair-booking` realm now
2. enable native signup and password reset
3. add Google
4. add Facebook
5. treat Instagram as optional unless there is a strong business reason

That gives a clean separation from `smailnail` and a realistic user-facing auth model without overcommitting to the most operationally fragile provider on day one.
