---
Title: Investigation Diary
Ticket: HAIR-010
Status: active
Topics:
    - auth
    - keycloak
    - deploy
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: docs/deployments/hair-booking-coolify.md
      Note: Current deployment still references the shared smailnail realm
    - Path: docs/deployments/hair-booking-coolify-playbook.md
      Note: Hosted rollout context that will later need issuer/client updates
ExternalSources:
    - https://www.keycloak.org/docs/latest/server_admin/
    - https://www.keycloak.org/server/features
Summary: Diary for the auth-separation work that moves hair-booking to its own Keycloak realm with local signup and social login.
LastUpdated: 2026-03-24T22:40:00-04:00
WhatFor: Use this to understand why the Keycloak plan moved into its own docmgr ticket and what conclusions were reached from the official docs.
WhenToUse: Use while implementing or reviewing HAIR-010.
---

# Investigation Diary

## 2026-03-24

The user asked for a proper Keycloak setup that separates `hair-booking` from `smailnail` and supports:

- signup with login/password
- Google SSO
- Facebook SSO
- Instagram SSO

The first pass put that plan into `docs/`, but the user explicitly wanted this to live in a `docmgr` ticket instead. So the auth guide was moved out of the repo docs and into `HAIR-010`.

The key architectural conclusion is straightforward:

- do not keep using the shared `smailnail` realm
- do not jump immediately to a second Keycloak server either
- create a dedicated `hair-booking` realm on the existing Keycloak server first

That gives separation where it matters most for product behavior:

- users
- clients
- identity providers
- branding
- registration policy

while keeping operations simple.

The official Keycloak docs also forced one important correction:

- Google and Facebook are straightforward built-in social brokers
- Instagram exists, but Keycloak documents it as deprecated for removal and recommends preferring the Facebook broker instead
- Instagram also requires the `instagram-broker` feature to be enabled

That means the product request “Google + Facebook/Instagram SSO” should not be interpreted as “Instagram is equally safe and ready.” It is supported, but it should be treated as a later, more cautious rollout.

The resulting recommendation is:

1. separate realm now
2. local signup with password reset and email verification
3. Google
4. Facebook
5. Instagram only if the business case is strong enough to justify the extra maintenance and provider risk
