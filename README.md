# hair-booking

`hair-booking` is a Go web app with a Go backend, browser login through Keycloak, and a React frontend under `web/`. The backend signs an HTTP-only session cookie after OIDC login and exposes the authenticated user through `/api/me`.

In local development, the backend can either:

- serve the older embedded inspector UI from `pkg/web/public`, or
- proxy the active React frontend dev server so `http://127.0.0.1:8080/` behaves like the real app shell

This repo includes its own local Keycloak stack and realm import so it can be tested standalone.

For day-to-day operations, see [docs/operations-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/operations-playbook.md).
For hosted deployment, see [docs/deployments/hair-booking-coolify.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md).
For Keycloak client provisioning, see the central infra repo at [keycloak/README.md](/home/manuel/code/wesen/terraform/keycloak/README.md).

## Features

- `hair-booking serve` Glazed command
- `auth-mode=oidc` for Keycloak-backed browser login
- `auth-mode=dev` for local UI work without Keycloak
- `/auth/login`, `/auth/callback`, `/auth/logout`
- `/api/info` and `/api/me`
- optional frontend-dev proxy for single-origin local integration
- embedded static inspector UI served from Go when no frontend dev proxy is configured

## Quick start

1. Start the standalone local Keycloak stack:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make local-keycloak-up
```

2. If `18080` is already in use on your machine, start Keycloak on another host port:

```bash
HAIR_BOOKING_KEYCLOAK_PORT=18090 docker compose -f docker-compose.local.yml up -d
```

3. Start the app against that realm:

```bash
make run-local-oidc
```

4. For backend-only inspection, open `http://127.0.0.1:8080/`.

5. For the real React app on a single origin, start Vite and proxy frontend routes through the backend:

```bash
npm --prefix web run dev -- --host 127.0.0.1 --port 5175
FRONTEND_DEV_PROXY_URL=http://127.0.0.1:5175 make run-local-oidc KEYCLOAK_PORT=18090
```

Then open `http://127.0.0.1:8080/` or `http://127.0.0.1:8080/portal`.

## Local standalone Keycloak setup

Local defaults after the realm import:

- Keycloak admin: `http://127.0.0.1:18080/admin`
- Keycloak bootstrap admin username: `admin`
- Keycloak bootstrap admin password: `admin`
- Imported realm: `hair-booking-dev`
- Realm issuer: `http://127.0.0.1:18080/realms/hair-booking-dev`
- OIDC client: `hair-booking-web`
- OIDC client secret: `hair-booking-web-secret`
- Test user: `alice`
- Test user password: `secret`

The compose stack comes from [docker-compose.local.yml](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docker-compose.local.yml), and the imported realm comes from [hair-booking-dev-realm.json](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/dev/keycloak/realm-import/hair-booking-dev-realm.json).

Useful commands:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking

make local-keycloak-up
make local-keycloak-down
make local-keycloak-config
```

## Run the app

For normal local OIDC testing:

```bash
make run-local-oidc
```

If Keycloak is running on another port:

```bash
make run-local-oidc KEYCLOAK_PORT=18090
```

For local frontend work without Keycloak:

```bash
make run-local-dev
```

For local OIDC work with the Go server proxying the Vite app on one origin:

```bash
FRONTEND_DEV_PROXY_URL=http://127.0.0.1:5175 make run-local-oidc KEYCLOAK_PORT=18090
```

`FRONTEND_DEV_PROXY_URL` is optional. If it is unset, the Go server falls back to the embedded inspector UI on `/`.

Equivalent direct command:

```bash
go run ./cmd/hair-booking serve \
  --listen-host 0.0.0.0 \
  --listen-port 8080 \
  --auth-mode oidc \
  --auth-session-secret local-session-secret \
  --oidc-issuer-url http://127.0.0.1:18080/realms/hair-booking-dev \
  --oidc-client-id hair-booking-web \
  --oidc-client-secret hair-booking-web-secret \
  --oidc-redirect-url http://127.0.0.1:8080/auth/callback
```

## Run in tmux

Start the app in a persistent tmux session:

```bash
make tmux-local-oidc-up
```

If Keycloak is on `18090`:

```bash
make tmux-local-oidc-up KEYCLOAK_PORT=18090
```

Inspect logs:

```bash
make tmux-local-oidc-logs
tmux attach -t hair-booking-dev
```

Stop the tmux-managed app:

```bash
make tmux-local-oidc-down
```

## Verify the app

Basic checks:

```bash
curl -sS http://127.0.0.1:8080/api/info
curl -sS http://127.0.0.1:8080/api/me
curl -i -sS http://127.0.0.1:8080/auth/login
```

Expected behavior:

- `/api/info` returns service metadata and auth configuration surface.
- `/api/me` returns unauthenticated state until login completes.
- `/auth/login` redirects to the local Keycloak realm.

## Production note

The local stack is standalone, but production can still point at the shared Keycloak deployment used by `smailnail`. In production, the current supported path is:

- build from the root [Dockerfile](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Dockerfile)
- provision the `hair-booking-web` Keycloak client with the central Terraform config under [apps/hair-booking/envs/hosted](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf)
- deploy the container to Coolify using the runbook at [docs/deployments/hair-booking-coolify.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md)

## Environment variables

These flags can also be driven by environment variables:

- `HAIR_BOOKING_AUTH_MODE`
- `HAIR_BOOKING_AUTH_DEV_USER_ID`
- `HAIR_BOOKING_AUTH_SESSION_COOKIE_NAME`
- `HAIR_BOOKING_AUTH_SESSION_SECRET`
- `HAIR_BOOKING_OIDC_ISSUER_URL`
- `HAIR_BOOKING_OIDC_CLIENT_ID`
- `HAIR_BOOKING_OIDC_CLIENT_SECRET`
- `HAIR_BOOKING_OIDC_REDIRECT_URL`
- `HAIR_BOOKING_FRONTEND_DEV_PROXY_URL`

## Developer commands

```bash
go test ./...
go build ./cmd/hair-booking
go run ./cmd/hair-booking serve --auth-mode dev
docker compose -f docker-compose.local.yml config
make docker-build
```
