---
Title: Investigation diary for hosted logout redirect validation and brokered login re-entry
Ticket: HAIR-012
Status: active
Topics:
    - auth
    - keycloak
    - oidc
    - frontend
    - backend
    - ops
DocType: reference
Intent: working
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go
      Note: Primary backend file investigated for logout redirect behavior
    - Path: /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf
      Note: Primary hosted Keycloak client config file investigated for post-logout allowlist behavior
Summary: Step-by-step diary of the initial HAIR-012 investigation, including the exact shell commands and conclusions used to create the fix plan.
LastUpdated: 2026-03-26T11:12:00-04:00
WhatFor: Preserve the exact diagnostic path for the two logout/login UX issues so a future engineer can retrace the reasoning.
WhenToUse: Use when validating the HAIR-012 analysis or continuing the implementation later.
---

# Investigation diary for hosted logout redirect validation and brokered login re-entry

## 2026-03-26

### Goal

Create a ticket and document two user-visible hosted auth problems:

1. logout ends at Keycloak with `Invalid redirect uri`
2. after Google login, explicit sign-out does not reset the next login experience to the full chooser screen

### Initial user evidence

The reported hosted logout URL was:

```text
https://auth.scapegoat.dev/realms/hair-booking/protocol/openid-connect/logout?client_id=hair-booking-web&post_logout_redirect_uri=https%3A%2F%2Fhair-booking.app.scapegoat.dev%2Fauth%2Flogout%2Fcallback%3Freturn_to%3Dhttps%253A%252F%252Fhair-booking.app.scapegoat.dev%252F
```

Key observation:

- the logout callback includes a nested query string:
  - `/auth/logout/callback?return_to=https://hair-booking.app.scapegoat.dev/`

That immediately suggested a mismatch with Keycloak’s `valid_post_logout_redirect_uris`.

### Step 1: search app code and hosted Terraform config

Command:

```bash
rg -n "post_logout_redirect_uri|logout/callback|return_to|end_session|protocol/openid-connect/logout|post logout" \
  /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking \
  /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking \
  -g '*.go' -g '*.ts' -g '*.tsx' -g '*.tf' -g '*.md'
```

What this found:

- app logout URL generation in:
  - `pkg/auth/oidc.go`
- frontend logout entrypoint wiring in:
  - `web/src/stylist/utils/authNavigation.ts`
  - `web/src/stylist/pages/PortalProfilePage.tsx`
- hosted allowlist config in:
  - `keycloak/apps/hair-booking/envs/hosted/main.tf`

Immediate conclusion:

- the issue boundary is not vague; it is between app-generated logout URLs and Terraform-managed Keycloak client allowlists

### Step 2: inspect app logout builder

Command:

```bash
sed -n '1,260p' /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go
sed -n '260,360p' /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go
```

Important findings:

- `HandleLogout` clears the app session and calls `buildLogoutRedirectURL(returnTo)`
- `buildLogoutRedirectURL` uses the OIDC discovery `EndSessionEndpoint`
- it sets:
  - `post_logout_redirect_uri`
  - `client_id`
- `buildLogoutCallbackURL` rewrites the normal redirect URL to:
  - `/auth/logout/callback`
- then it appends `return_to` as a query string if present

Conclusion:

- the app is definitely sending Keycloak a query-bearing post-logout callback URI

### Step 3: inspect hosted Terraform allowlist

Command:

```bash
sed -n '1,260p' /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf
sed -n '1,260p' /home/manuel/code/wesen/terraform/keycloak/modules/browser-client/main.tf
sed -n '1,220p' /home/manuel/code/wesen/terraform/keycloak/modules/browser-client/variables.tf
```

Important findings:

- hosted env defines:
  - `valid_post_logout_redirect_uris = ["${local.public_app_url}/auth/logout/callback"]`
- the browser client resource passes that directly into:
  - `keycloak_openid_client.valid_post_logout_redirect_uris`

Conclusion:

- hosted Keycloak currently expects the plain callback URI only
- there is no evidence in the Terraform config that query-bearing callback forms are intentionally allowed

### Step 4: inspect frontend logout entrypoint

Command:

```bash
sed -n '1,220p' /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/utils/authNavigation.ts
rg -n "buildAuthPath\\(|/auth/logout|resolveLoginReturnTo|return_to" \
  /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist \
  -g '*.ts' -g '*.tsx'
```

Important findings:

- `buildAuthPath` always appends `return_to`
- portal and stylist runtime logout paths use:
  - `buildAuthPath(session.logoutPath, buildRuntimeURL("/"))`

Conclusion:

- the frontend is not directly wrong; it is requesting a sensible final return target
- the app/backend layer is the one choosing to embed that final return target into the Keycloak `post_logout_redirect_uri`

### Step 5: reason about the second issue

The second user report was:

- after authenticating with Google
- and explicitly signing out
- the next login did not feel neutral; it re-entered Google too aggressively

At this point I did not yet inspect the live browser flow configuration in Keycloak admin. So the analysis at this stage remained hypothesis-driven, but bounded.

Likely cause classes recorded:

1. Keycloak logout may never have completed because issue 1 interrupted it
2. the hosted browser flow may have an `Identity Provider Redirector` with a default provider
3. the upstream Google session may still exist and accelerate re-entry once Keycloak brokers there again

Important conclusion:

- the product should not rely on Google logout semantics to restore the chooser UX
- the generic app login path should be neutral and chooser-based

### Step 6: verify official direction

Web searches used:

```text
site:keycloak.org/docs/latest/server_admin kc_idp_hint default identity provider empty disable redirector
site:keycloak.org/docs/latest/server_admin default identity provider keycloak login page kc_idp_hint
site:keycloak.org/docs/latest "post_logout_redirect_uri" keycloak securing applications
```

Useful outcome:

- sufficient confirmation that Keycloak treats logout redirect validation as a real client allowlist concern
- sufficient confirmation that default IdP/browser-flow configuration is the right place to inspect chooser-skipping behavior

### Final analysis decision

I wrote the fix plan around two separate tracks:

#### Track A: protocol fix

- stop embedding `return_to` inside `post_logout_redirect_uri`
- use a plain allowlisted callback URI
- carry final return target through a server-controlled short-lived state channel

#### Track B: login UX fix

- inspect hosted browser flow
- if a default IdP redirector is configured, neutralize it for the generic login path
- ensure explicit sign-out leads to a neutral next-login experience

### Why this split is important

If these are treated as one problem, it becomes too easy to:

- hack Keycloak allowlists
- or blame Google session persistence
- without actually making logout deterministic

The correct order is:

1. make logout protocol-correct
2. then fix chooser/login UX policy
