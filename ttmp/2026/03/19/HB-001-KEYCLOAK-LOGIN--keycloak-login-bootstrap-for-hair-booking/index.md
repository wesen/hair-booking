---
Title: Keycloak login bootstrap for hair-booking
Ticket: HB-001-KEYCLOAK-LOGIN
Status: active
Topics:
    - backend
    - frontend
    - infrastructure
    - config
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: Makefile
      Note: Local operator helper commands surfaced by the docs
    - Path: README.md
      Note: Top-level usage and quick-start
    - Path: cmd/hair-booking/cmds/serve.go
      Note: Primary application entrypoint for the implemented feature
    - Path: docs/operations-playbook.md
      Note: Operator runbook for start stop verify deploy
    - Path: pkg/auth/oidc.go
      Note: Core Keycloak integration
    - Path: pkg/server/http.go
      Note: Route and handler surface
ExternalSources: []
Summary: Implements the first working Keycloak login bootstrap for hair-booking, including Go server wiring, Glazed command integration, signed browser sessions, a minimal frontend, and detailed onboarding documentation.
LastUpdated: 2026-03-19T22:10:00-04:00
WhatFor: Track the implementation, postmortem analysis, and operational guidance for the hair-booking Keycloak login bootstrap.
WhenToUse: Use when onboarding to the project, reviewing the auth design, operating the local stack, or deploying the login bootstrap.
---



# Keycloak login bootstrap for hair-booking

This ticket captures the first working auth bootstrap for `hair-booking`.

## Documents

1. `design-doc/01-keycloak-login-bootstrap-architecture-and-implementation-guide.md`
2. `analysis/01-standalone-local-keycloak-bootstrap-postmortem.md`
3. `playbook/01-local-start-stop-and-deploy-playbook.md`
4. `reference/01-investigation-diary.md`

## Outcome

The repo now contains:

1. a `hair-booking serve` Glazed command,
2. Keycloak OIDC login and logout routes,
3. signed browser session handling,
4. `/api/info` and `/api/me`,
5. a small embedded web UI ready to be replaced later by React,
6. a standalone local Keycloak fixture in this repo,
7. an operator playbook and postmortem documenting how the bootstrap was validated.
