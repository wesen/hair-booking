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
LastUpdated: 2026-03-24T23:55:00-04:00
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

## Current State

Today the hosted app still points at the shared `smailnail` realm:

- issuer: `https://auth.scapegoat.dev/realms/smailnail`
- browser client: `hair-booking-web`

That was acceptable for bootstrap, but it is not the right long-term product boundary for a customer-facing salon app.

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
- if email verification is not ready, that should be called an MVP compromise, not “done”

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
