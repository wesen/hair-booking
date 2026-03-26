---
Title: Fix hosted logout redirect validation and brokered logout UX
Ticket: HAIR-012
Status: active
Topics:
    - auth
    - keycloak
    - oidc
    - frontend
    - backend
    - ops
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go
      Note: Builds the Keycloak login and logout redirect URLs, including post_logout_redirect_uri
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/utils/authNavigation.ts
      Note: Frontend helper that injects return_to into login/logout entry URLs
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalProfilePage.tsx
      Note: Portal logout button currently routes users into the failing logout path
    - Path: /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf
      Note: Hosted Keycloak browser client allowlists only the plain logout callback URI
ExternalSources:
    - https://www.keycloak.org/docs/latest/server_admin/
    - https://www.keycloak.org/docs/latest/securing_apps/
Summary: Investigation and fix plan for two hosted auth bugs: Keycloak rejects the current post_logout_redirect_uri on logout, and explicit sign-out does not reliably return users to the full Keycloak chooser screen when Google brokering is involved.
LastUpdated: 2026-03-26T06:56:33.37882261-04:00
WhatFor: Explain the two hosted logout/login UX bugs, show exactly where they come from in app code and hosted Keycloak config, and define a safe implementation plan for fixing them.
WhenToUse: Use when debugging logout, post-logout redirect validation, Google-brokered login re-entry, or when updating the hosted hair-booking Keycloak client/browser flow.
---

# Fix hosted logout redirect validation and brokered logout UX

## Overview

This ticket exists because the hosted `hair-booking` auth UX currently has two related but distinct defects:

1. Clicking logout in the client portal sends the browser to Keycloak and Keycloak responds with `Invalid redirect uri`.
2. After brokered Google login, an explicit sign-out does not reliably return the user to a neutral login chooser; on the next login attempt the flow can re-enter through Google too aggressively.

The first issue is a concrete protocol/config mismatch. The second is a login-flow/product-UX issue that likely involves a combination of Keycloak SSO session state, brokered IdP behavior, and possibly the realm browser flow configuration.

The current document set for this ticket is:

- [design/01-hosted-logout-and-brokered-login-fix-guide.md](./design/01-hosted-logout-and-brokered-login-fix-guide.md)
- [reference/01-investigation-diary.md](./reference/01-investigation-diary.md)

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- auth
- keycloak
- oidc
- frontend
- backend
- ops

## Tasks

See [tasks.md](./tasks.md) for the current task list.

## Changelog

See [changelog.md](./changelog.md) for recent changes and decisions.

## Current Finding

The logout failure is most likely caused by the app sending:

- `post_logout_redirect_uri=https://hair-booking.app.scapegoat.dev/auth/logout/callback?return_to=...`

while the hosted Keycloak client allowlist currently contains only:

- `https://hair-booking.app.scapegoat.dev/auth/logout/callback`

The recommended fix direction is to stop embedding `return_to` inside `post_logout_redirect_uri` and instead round-trip the final return target through a server-controlled logout state channel.

The brokered-login UX issue should then be fixed by ensuring that explicit sign-out ends in a neutral Keycloak login screen, not a forced/default Google redirect path.

## Structure

- design/ - Architecture and design documents
- reference/ - Prompt packs, API contracts, context summaries
- playbooks/ - Command sequences and test procedures
- scripts/ - Temporary code and tooling
- various/ - Working notes and research
- archive/ - Deprecated or reference-only artifacts
