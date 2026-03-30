---
Title: Local start stop and deploy playbook
Ticket: HB-001-KEYCLOAK-LOGIN
Status: active
Topics:
    - backend
    - frontend
    - infrastructure
    - config
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: Makefile
      Note: Stable operator commands for local OIDC and tmux lifecycle
    - Path: README.md
      Note: Quick-start entrypoint that points operators at the playbook
    - Path: dev/keycloak/realm-import/hair-booking-dev-realm.json
      Note: Local realm
    - Path: docker-compose.local.yml
      Note: Standalone local Keycloak stack referenced by the playbook
    - Path: docs/operations-playbook.md
      Note: Repo-level operator playbook used for daily start/stop/deploy guidance
ExternalSources: []
Summary: ""
LastUpdated: 2026-03-19T21:58:37.486604823-04:00
WhatFor: Provide the exact commands and checks needed to run, stop, verify, and hand off deployment of the hair-booking auth bootstrap.
WhenToUse: Use when starting the app locally, running it in tmux, debugging the local Keycloak fixture, or preparing a production deployment through a shared Keycloak environment.
---


# Local Start Stop And Deploy Playbook

## Purpose

This playbook is the ticket-scoped operator guide for `hair-booking`. It complements the repo README by spelling out the live-tested commands, the local Keycloak fixture, the tmux workflow, and the current deployment contract for a production environment that reuses a shared Keycloak deployment.

## Quick operator checklist

If you only need the shortest path:

1. start local Keycloak
2. start the app
3. verify `/api/info`
4. verify `/auth/login`
5. log in as `alice`

Commands:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make local-keycloak-up
make run-local-oidc
```

If `18080` is occupied:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
HAIR_BOOKING_KEYCLOAK_PORT=18090 docker compose -f docker-compose.local.yml up -d
make run-local-oidc KEYCLOAK_PORT=18090
```

## Local fixture inventory

The standalone local auth fixture in this repo is defined by:

- `docker-compose.local.yml`
- `dev/keycloak/realm-import/hair-booking-dev-realm.json`

Defaults:

- Keycloak URL: `http://127.0.0.1:18080`
- admin UI: `http://127.0.0.1:18080/admin`
- realm: `hair-booking-dev`
- issuer: `http://127.0.0.1:18080/realms/hair-booking-dev`
- client ID: `hair-booking-web`
- client secret: `hair-booking-web-secret`
- test user: `alice`
- test password: `secret`

## Start procedures

### Start local Keycloak

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make local-keycloak-up
```

Alternate published port:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
HAIR_BOOKING_KEYCLOAK_PORT=18090 docker compose -f docker-compose.local.yml up -d
```

Validate the issuer:

```bash
curl -fsS http://127.0.0.1:18080/realms/hair-booking-dev/.well-known/openid-configuration
```

If using `18090`, change the port in the URL.

### Start the app in the foreground

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make run-local-oidc
```

Override ports if needed:

```bash
make run-local-oidc APP_PORT=8081 KEYCLOAK_PORT=18090
```

### Start the app in tmux

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make tmux-local-oidc-up
```

Inspect logs:

```bash
make tmux-local-oidc-logs
tmux attach -t hair-booking-dev
```

Known-good startup line:

```text
INF Starting hair-booking server address=0.0.0.0:8080 auth_mode=oidc client_id=hair-booking-web issuer=http://127.0.0.1:18090/realms/hair-booking-dev
```

## Verification procedures

### Service metadata

```bash
curl -sS http://127.0.0.1:8080/api/info
```

This should return:

- `service=hair-booking`
- `authMode=oidc`
- the issuer URL currently in use

### Login redirect

```bash
curl -i -sS http://127.0.0.1:8080/auth/login
```

This should return:

- `302 Found`
- `Location:` pointing at the Keycloak authorization endpoint
- state and nonce cookies

### Full login

Browser path:

1. Open `http://127.0.0.1:8080/`
2. Click `Login with Keycloak`
3. Log in with `alice` / `secret`
4. Confirm the page shows authenticated `/api/me` data

Non-browser path:

Use the scripted callback verification in [docs/operations-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/operations-playbook.md).

## Stop procedures

### Stop the foreground app

Press `Ctrl-C` in the terminal running `make run-local-oidc`.

### Stop the tmux-managed app

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make tmux-local-oidc-down
```

### Stop local Keycloak

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make local-keycloak-down
```

## Deployment procedure

## Current production assumptions

The current system is ready for a straightforward binary-style deployment, but not yet for a fully automated release pipeline. Production assumes:

- `hair-booking` runs as a single Go process
- Keycloak is hosted outside this repo
- the production Keycloak deployment is shared with `smailnail`
- `hair-booking` has its own confidential client in that shared Keycloak

### Required production environment

```bash
HAIR_BOOKING_AUTH_MODE=oidc
HAIR_BOOKING_AUTH_SESSION_SECRET=<long-random-secret>
HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.<your-domain>/realms/<your-realm>
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET=<client-secret>
HAIR_BOOKING_OIDC_REDIRECT_URL=https://hair-booking.<your-domain>/auth/callback
```

### Required production runtime command

```bash
./hair-booking serve --listen-host 0.0.0.0 --listen-port 8080
```

### Required Keycloak client setup

- confidential client
- standard flow enabled
- direct access grants disabled
- redirect URI matching the public callback URL exactly
- web origin matching the public site origin

### Suggested deployment sequence

1. Run `go test ./...`
2. Run `go build ./cmd/hair-booking`
3. Create or update the `hair-booking-web` client in Keycloak
4. Set the production environment variables in the deployment platform
5. Start the process on `0.0.0.0:8080`
6. Verify `/api/info`
7. Verify `/auth/login`
8. Verify a real browser login against production Keycloak

## Failure modes to expect

Common operator-visible failures:

- port already allocated on the local Keycloak host port
- wrong issuer URL causing discovery failure
- wrong client secret causing token exchange failure
- redirect URI mismatch causing Keycloak login rejection
- session secret mismatch across instances causing invalid sessions

## Escalation / next hardening items

This playbook is sufficient for current local and early deployment use, but the next hardening steps should be:

1. add a production container image definition
2. add a deployment artifact or automation path for Coolify
3. add a repeatable auth smoke test
4. define a formal release checklist
