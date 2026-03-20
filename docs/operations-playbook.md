# Operations Playbook

This playbook is the operator-facing runbook for `hair-booking`. It covers local start and stop, tmux usage, verification, and the current deployment handoff for a production environment such as Coolify.

## Scope

This repo currently supports:

- a standalone local Keycloak fixture for development
- a Go web server started with `hair-booking serve`
- environment-driven OIDC configuration
- an embedded production React build served by Go

This repo does not yet ship:

- a Coolify manifest or generated app definition
- automated production deployment scripts

This repo does ship:

- a root Dockerfile for container builds
- a container entrypoint script
- a Terraform scaffold for the Keycloak browser client
- a `go generate` pipeline that copies `web/dist` into `pkg/web/public`

That means the deploy procedure here is now container-oriented, but still documentation-driven rather than fully automated.

## Local start

### 1. Start the standalone Keycloak stack

Default local port:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make local-keycloak-up
```

If `127.0.0.1:18080` is already in use:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
HAIR_BOOKING_KEYCLOAK_PORT=18090 docker compose -f docker-compose.local.yml up -d
```

Local fixture defaults:

- Keycloak admin UI: `http://127.0.0.1:18080/admin`
- realm: `hair-booking-dev`
- issuer: `http://127.0.0.1:18080/realms/hair-booking-dev`
- client ID: `hair-booking-web`
- client secret: `hair-booking-web-secret`
- test user: `alice`
- test password: `secret`

If you override the host port, adjust the admin URL and issuer accordingly.

### 2. Start the app in the foreground

Default Keycloak port:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make run-local-oidc
```

Override the Keycloak host port:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make run-local-oidc KEYCLOAK_PORT=18090
```

Useful overrides:

- `APP_PORT=8081`
- `KEYCLOAK_PORT=18090`
- `SESSION_SECRET=<different-local-secret>`

Example:

```bash
make run-local-oidc APP_PORT=8081 KEYCLOAK_PORT=18090 SESSION_SECRET=another-local-secret
```

### 3. Start the app in tmux

Default session:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make tmux-local-oidc-up
```

With an alternate Keycloak port:

```bash
make tmux-local-oidc-up KEYCLOAK_PORT=18090
```

Inspect the running session:

```bash
make tmux-local-oidc-logs
tmux attach -t hair-booking-dev
```

What a healthy startup log looks like:

```text
INF Starting hair-booking server address=0.0.0.0:8080 auth_mode=oidc client_id=hair-booking-web issuer=http://127.0.0.1:18090/realms/hair-booking-dev
```

## Verification

### Basic endpoint checks

```bash
curl -sS http://127.0.0.1:8080/api/info
curl -sS http://127.0.0.1:8080/api/me
curl -i -sS http://127.0.0.1:8080/auth/login
```

Expected results:

- `/api/info` returns service metadata
- `/api/me` shows unauthenticated state before login
- `/auth/login` returns `302 Found` and redirects to Keycloak

### Browser login check

1. Open `http://127.0.0.1:8080/booking`.
2. Click `Login with Keycloak`.
3. Log in as `alice` with password `secret`.
4. Confirm the page updates with authenticated `/api/me` data.

### CLI-style callback verification

If a browser is not convenient, this command sequence verifies that the login form, callback, and session cookie are all working:

```bash
tmpdir=$(mktemp -d)
jar="$tmpdir/cookies.txt"
login_headers="$tmpdir/login.headers"
login_body="$tmpdir/login.html"
callback_headers="$tmpdir/callback.headers"
me_body="$tmpdir/me.json"

curl -sS -D "$login_headers" -c "$jar" -o /dev/null http://127.0.0.1:8080/auth/login
auth_url=$(awk '/^Location:/ {print $2}' "$login_headers" | tr -d '\r')
curl -sS -L -b "$jar" -c "$jar" -o "$login_body" "$auth_url"
form_action=$(perl -0ne 'print $1 if /<form[^>]*id="kc-form-login"[^>]*action="([^"]+)"/s' "$login_body" | perl -MHTML::Entities -ne 'print decode_entities($_)')

submit_headers="$tmpdir/submit.headers"
curl -sS -D "$submit_headers" -b "$jar" -c "$jar" -o /dev/null \
  -X POST \
  --data-urlencode 'username=alice' \
  --data-urlencode 'password=secret' \
  --data-urlencode 'credentialId=' \
  "$form_action"

submit_location=$(awk '/^Location:/ {print $2}' "$submit_headers" | tr -d '\r')
curl -sS -D "$callback_headers" -b "$jar" -c "$jar" -o /dev/null "$submit_location"
curl -sS -b "$jar" http://127.0.0.1:8080/api/me
```

The final response should contain:

- `"authenticated":true`
- `"preferredUsername":"alice"`
- `"issuer":"http://127.0.0.1:<port>/realms/hair-booking-dev"`

## Stop

Stop the app running in the foreground with `Ctrl-C`.

Stop the tmux-managed app:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make tmux-local-oidc-down
```

Stop the standalone Keycloak stack:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make local-keycloak-down
```

If you started Keycloak on another host port, the same `down` command still works because the containers are identified by compose state rather than by the published port.

## Deploy

## Current deployment contract

Production deployment currently assumes:

- the app is built from this repo’s root Dockerfile
- the Docker build embeds the compiled React frontend into the Go binary
- Keycloak already exists outside this repo
- the production Keycloak realm is shared with `smailnail`
- `hair-booking` gets its own client in that shared Keycloak deployment

The container entrypoint is [docker-entrypoint.hair-booking.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/scripts/docker-entrypoint.hair-booking.sh), and the image is built from [Dockerfile](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Dockerfile).

The default runtime command inside the container is:

```bash
./hair-booking serve --listen-host 0.0.0.0 --listen-port 8080
```

The command does not need inline OIDC flags if the environment variables are present.

The runtime behavior is:

- `/` redirects to `/booking`
- `/booking`, `/portal`, and `/stylist` serve the embedded React SPA shell
- `/api/*` and `/auth/*` continue to terminate in Go handlers

### Required production environment variables

```bash
HAIR_BOOKING_AUTH_MODE=oidc
HAIR_BOOKING_AUTH_SESSION_SECRET=<long-random-secret>
HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.<your-domain>/realms/<your-realm>
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET=<client-secret>
HAIR_BOOKING_OIDC_REDIRECT_URL=https://hair-booking.<your-domain>/auth/callback
```

### Required Keycloak client configuration

- Client ID: `hair-booking-web`
- Client type: confidential
- Standard flow: enabled
- Direct access grants: disabled
- Valid redirect URI: `https://hair-booking.<your-domain>/auth/callback`
- Web origin: `https://hair-booking.<your-domain>`

The canonical Terraform for that client now lives in the shared infra repo under [apps/hair-booking/envs/hosted](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf).

### Build and handoff steps

1. Run `go test ./...`
2. Run `npm --prefix web run typecheck`
3. Build the image with `make docker-build`
4. Optionally run `GOWORK=off go generate ./pkg/web` locally to inspect the exact embedded assets before container build
5. Create or update the `hair-booking-web` client in the shared Keycloak deployment using Terraform
6. Ensure the production redirect URI matches the real public hostname exactly
7. Configure the Coolify app to build from the root Dockerfile
8. Set the production environment variables in Coolify
9. Deploy the container
10. Verify `/healthz`, `/`, `/booking`, `/api/info`, `/auth/login`, and a real browser login

### Suggested pre-deploy validation

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
go test ./...
npm --prefix web run typecheck
make docker-build
docker compose -f docker-compose.local.yml config
```

### Known deployment sharp edges

- There is no committed Coolify manifest or app export in this repo yet.
- Horizontal deployments must share the same `HAIR_BOOKING_AUTH_SESSION_SECRET`.
- Redirect URI mismatches will fail at the Keycloak login redirect stage.
- If the external issuer URL is wrong, discovery and ID token verification will fail.

## Incident notes

The first real standalone local launch on this workstation hit a port collision because `smailnail-keycloak` was already bound to `127.0.0.1:18080`. The current playbook supports that case by allowing `HAIR_BOOKING_KEYCLOAK_PORT` for the local Keycloak stack and `KEYCLOAK_PORT` for local app startup.

For the full hosted deployment runbook, use [docs/deployments/hair-booking-coolify.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md).
