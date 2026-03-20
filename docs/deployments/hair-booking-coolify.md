# hair-booking Coolify Deployment

This document describes the hosted deployment shape for `hair-booking` on Coolify.

It follows the same operational model as `smailnail`:

- build from the repository root Dockerfile
- run a single Go web process in the container
- terminate TLS at the platform edge
- use Keycloak for browser login
- inject runtime configuration through environment variables

## Current hosted instance

As of 2026-03-20, the live hosted app is configured at:

- Public app URL: `https://hair-booking.app.scapegoat.dev`
- Keycloak issuer: `https://auth.scapegoat.dev/realms/smailnail`
- Keycloak client: `hair-booking-web`
- Hosted health check: `https://hair-booking.app.scapegoat.dev/healthz`

## Target shape

- Public app URL: `https://hair-booking.example.com`
- Keycloak issuer: `https://auth.example.com/realms/smailnail`
- Keycloak deployment: shared with `smailnail`
- Keycloak client for this app: `hair-booking-web`
- Container port: `8080`
- Health check path: `/healthz`

## Runtime routes

The hosted runtime serves:

- `/`
  - embedded web UI
- `/auth/login`
  - browser redirect to Keycloak
- `/auth/callback`
  - OIDC callback that exchanges the authorization code and creates the app session
- `/auth/logout`
  - local session logout
- `/api/info`
  - runtime metadata
- `/api/me`
  - current authenticated browser session
- `/healthz`
  - liveness and readiness probe

## Container build

The root [Dockerfile](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Dockerfile) builds the hosted app image:

- stage 1 downloads Go modules
- stage 2 builds `cmd/hair-booking`
- stage 3 packages the binary plus the container entrypoint

The container entrypoint is [docker-entrypoint.hair-booking.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/scripts/docker-entrypoint.hair-booking.sh).

If started without explicit arguments, the image runs:

```text
hair-booking serve --listen-host 0.0.0.0 --listen-port 8080 --auth-mode oidc
```

The auth settings themselves come from environment variables, not from hardcoded flags in the image.

## Required environment variables

```env
HAIR_BOOKING_LISTEN_PORT=8080
HAIR_BOOKING_AUTH_MODE=oidc
HAIR_BOOKING_AUTH_SESSION_SECRET=replace-with-long-random-secret
HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.example.com/realms/smailnail
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET=replace-with-generated-client-secret
HAIR_BOOKING_OIDC_REDIRECT_URL=https://hair-booking.example.com/auth/callback
```

Optional:

```env
HAIR_BOOKING_LOG_LEVEL=debug
HAIR_BOOKING_EXTRA_ARGS=
```

Note: `HAIR_BOOKING_LOG_LEVEL` is not currently consumed by the app runtime, so only the auth and listen variables above are essential today.

## Recommended Coolify environment

```env
HAIR_BOOKING_LISTEN_PORT=8080
HAIR_BOOKING_AUTH_MODE=oidc
HAIR_BOOKING_AUTH_SESSION_SECRET=replace-with-long-random-secret
HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.example.com/realms/smailnail
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET=replace-with-generated-client-secret
HAIR_BOOKING_OIDC_REDIRECT_URL=https://hair-booking.example.com/auth/callback
```

## Coolify application shape

- Build pack: Dockerfile
- Dockerfile path: `Dockerfile`
- Exposed port: `8080`
- Domain: `https://hair-booking.example.com`
- Health check path: `/healthz`

## Deployment prerequisites

Before triggering the first hosted deployment, make sure these are true:

- the selected Git branch has been pushed to GitHub
- the `hair-booking-web` client exists in the shared Keycloak realm
- the Coolify app environment contains the same client secret that Terraform applied
- the public hostname already has a DNS record pointing at the Coolify edge

The first real rollout on 2026-03-20 failed because Coolify was configured to build branch `task/hair-signup` before that branch existed on GitHub. Coolify does not use the local workstation checkout. It clones from the remote repository, so an unpushed branch will fail immediately during the import step.

## Keycloak provisioning with Terraform

The Keycloak client should be managed from the shared infra repo via:

- [keycloak/README.md](/home/manuel/code/wesen/terraform/keycloak/README.md)
- [apps/hair-booking/envs/hosted/main.tf](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf)
- [apps/hair-booking/envs/hosted/versions.tf](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/versions.tf)

The hosted Terraform environment assumes the shared realm already exists. It manages only the `hair-booking-web` client inside that realm.

Example plan:

```bash
cd /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted
export AWS_PROFILE=manuel
terraform init
terraform validate
terraform plan \
  -var='keycloak_url=https://auth.example.com' \
  -var='realm_name=smailnail' \
  -var='public_app_url=https://hair-booking.example.com' \
  -var='web_client_secret=replace-with-generated-secret' \
  -var='keycloak_username=replace-with-admin-username' \
  -var='keycloak_password=replace-with-admin-password'
```

Hosted state is stored remotely in S3, in bucket `go-go-golems-tf-state` under key `keycloak/apps/hair-booking/hosted/terraform.tfstate`.

That configuration creates or updates:

- client ID: `hair-booking-web`
- redirect URI: `https://hair-booking.example.com/auth/callback`
- web origin: `https://hair-booking.example.com`

## Local container smoke

Build the image:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
make docker-build
```

Run the image locally against the standalone Keycloak fixture on `18090`:

```bash
docker run --rm -p 8081:8080 \
  -e HAIR_BOOKING_AUTH_MODE=oidc \
  -e HAIR_BOOKING_AUTH_SESSION_SECRET=local-session-secret \
  -e HAIR_BOOKING_OIDC_ISSUER_URL=http://host.docker.internal:18090/realms/hair-booking-dev \
  -e HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web \
  -e HAIR_BOOKING_OIDC_CLIENT_SECRET=hair-booking-web-secret \
  -e HAIR_BOOKING_OIDC_REDIRECT_URL=http://127.0.0.1:8081/auth/callback \
  hair-booking:dev
```

Then verify:

```bash
curl -s http://127.0.0.1:8081/healthz | jq
curl -s http://127.0.0.1:8081/api/info | jq
curl -i http://127.0.0.1:8081/auth/login
```

## Hosted verification order

After deployment, validate in this order:

1. `GET /healthz`
2. `GET /api/info`
3. `GET /auth/login` returns a redirect to Keycloak
4. browser login through `/auth/login`
5. `GET /api/me` returns the session-backed user

For host-side debugging before DNS is live, you can verify through the Coolify host itself:

```bash
ssh root@your-server 'curl -ksS -H "Host: hair-booking.example.com" https://127.0.0.1/healthz -D -'
ssh root@your-server 'curl -ksS -H "Host: hair-booking.example.com" https://127.0.0.1/api/info -D -'
ssh root@your-server 'curl -ksSI -H "Host: hair-booking.example.com" https://127.0.0.1/auth/login'
```

Those requests exercise Traefik routing on the host even if public DNS has not been created yet.

## Cutover notes

Do not switch the public app hostname until both of these are true:

- the `hair-booking-web` client exists in the shared Keycloak realm with the exact hosted callback URL
- the Coolify deployment passes `/healthz`, `/api/info`, and a real browser login

Also ensure the public DNS record exists. Without that, the service can be healthy inside Coolify and still be unreachable from a browser outside the server.
