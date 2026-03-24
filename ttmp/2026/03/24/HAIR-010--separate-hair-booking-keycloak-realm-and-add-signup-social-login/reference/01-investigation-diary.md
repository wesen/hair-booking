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
LastUpdated: 2026-03-24T23:55:00-04:00
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

Later the user asked for a more implementation-heavy guide that explains how the Terraform work should actually happen. That forced a second pass over the infrastructure repo at `/home/manuel/code/wesen/terraform`, because the migration details are easy to get wrong if you only think in app-repo terms.

The most important infrastructure finding is that the hosted `hair-booking` Terraform workspace still does **not** own a realm. It only manages one browser client inside `smailnail`. In contrast, local `hair-booking` Terraform already creates its own realm, and hosted `smailnail` already demonstrates the full hosted-realm ownership pattern. That means the migration should not invent a new Terraform architecture. It should promote hosted `hair-booking` into an ownership model that already exists elsewhere in the shared repo.

One subtle operational risk also became obvious during that review: a naive edit to the hosted `hair-booking` workspace could cause Terraform to replace the shared-realm `hair-booking-web` client before the app has been cut over to the new issuer. The updated guide therefore recommends a safer overlap phase:

- create the new `hair-booking` realm first
- create a dedicated `hair-booking-web` client inside that new realm
- keep the legacy shared-realm client alive during the app cutover window
- switch the hosted app to the new issuer and secret
- remove the legacy client only after the hosted login flow is proven stable

The Terraform review also confirmed that social-provider rollout should probably be split from the realm migration. The shared Terraform repo currently has reusable realm and browser-client modules, but no existing identity-provider resources. So Google and Facebook should be treated as a second, follow-on codification step after the dedicated realm is stable.
