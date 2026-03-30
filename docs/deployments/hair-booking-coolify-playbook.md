# hair-booking Coolify Deployment Playbook

This is the operator runbook for deploying `hair-booking` to Coolify and verifying the hosted runtime.

Use this document when you need to:

- push a new application build to `hair-booking.app.scapegoat.dev`
- verify that the embedded React app is what the public hostname is serving
- debug the running container directly on the Coolify host

This playbook complements, but is more operational than, [hair-booking-coolify.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md).

## Current known-good deployment shape

- Public hostname: `https://hair-booking.app.scapegoat.dev`
- Keycloak issuer: `https://auth.scapegoat.dev/realms/hair-booking`
- Coolify host: `89.167.52.236`
- Non-root operator user: `manuel`
- Coolify application UUID: `uion8lttbypsijf8ww9b4c3e`
- App branch currently used for rollout work: `task/hair-signup`

The production container now serves the embedded React SPA from Go:

- `/` redirects to `/booking`
- `/booking`, `/portal`, and `/stylist` serve the embedded React shell
- `/api/*`, `/auth/*`, and `/healthz` are handled by the Go server

## Preconditions

Before attempting a deploy, make sure these are true:

1. The branch you want Coolify to build is pushed to GitHub.
2. `go test ./...` passes locally.
3. `npm --prefix web run typecheck` passes locally.
4. The root `Dockerfile` still builds the frontend and embeds it into Go.
5. The Coolify app is configured to build from the repository root `Dockerfile`.

## Local pre-deploy validation

Run this from the repo root:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
go test ./...
npm --prefix web run typecheck
docker build -t hair-booking:embed-test .
```

Optional local shell verification:

```bash
docker run --rm -p 8081:8080 \
  -e HAIR_BOOKING_AUTH_MODE=dev \
  -e HAIR_BOOKING_AUTH_SESSION_SECRET=local-session-secret \
  hair-booking:embed-test
```

In another shell:

```bash
./ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/check-embedded-shell.sh http://127.0.0.1:8081
```

Expected result:

- `/` redirects to `/booking`
- `/booking` contains `<div id="root"></div>`
- `/booking` does not contain the old bootstrap inspector HTML

## Push the branch

Coolify deploys from GitHub, not from your local checkout.

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
git push wesen task/hair-signup
```

If you deploy a different branch, push that branch instead.

## Trigger the rollout

### Preferred path

Use the Coolify UI and redeploy the existing `hair-booking` application.

This is the least confusing path because team-scoped API tokens may not have permission to call every app endpoint even when they are valid.

### Server-side operator path

If you need to debug or inspect from the host:

```bash
ssh manuel@89.167.52.236
```

Useful checks:

```bash
sudo docker ps --format '{{.Names}} {{.Image}}'
sudo docker logs --tail 80 uion8lttbypsijf8ww9b4c3e-185456125584
```

If the currently running app image tag contains the new Git commit SHA, the rollout has already reached the host.

If you need to read request-level logs for a production bug, use:

```bash
sudo docker logs --tail 200 uion8lttbypsijf8ww9b4c3e-185456125584 2>&1
```

The application now emits:

- startup logs
- request completion logs with `request_id`, `method`, `path`, `status`, and `duration`
- booking failure logs at handler/service/repository boundaries

If a response includes `X-Request-Id`, grep for it in the container logs:

```bash
sudo docker logs --tail 400 uion8lttbypsijf8ww9b4c3e-185456125584 2>&1 | grep '<request-id>'
```

## Hosted verification

### Public checks

```bash
curl -ksSI https://hair-booking.app.scapegoat.dev/
curl -ksS https://hair-booking.app.scapegoat.dev/booking | sed -n '1,30p'
curl -ksS https://hair-booking.app.scapegoat.dev/healthz
curl -ksS https://hair-booking.app.scapegoat.dev/api/info
curl -ksSI https://hair-booking.app.scapegoat.dev/auth/login
```

Expected results:

- `/` returns `307` with `Location: /booking`
- `/booking` serves the Vite/React shell and references `/assets/...`
- `/healthz` returns `{"data":{"status":"ok"}}`
- `/api/info` shows `"issuerUrl":"https://auth.scapegoat.dev/realms/hair-booking"`
- `/auth/login` redirects into `/realms/hair-booking/`

Important:

- successful OIDC redirect alone is not enough to prove the hosted app is usable
- the app also needs `HAIR_BOOKING_DATABASE_URL` in Coolify, otherwise `/api/me`
  and portal bootstrap will fail with `Client service is not configured.`

### Replay script

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
./ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/check-hosted-shell.sh
```

Expected output:

```text
embedded shell looks healthy at https://hair-booking.app.scapegoat.dev
hosted shell check passed for https://hair-booking.app.scapegoat.dev
```

### Booking failure replay

If a user reports a booking finalization bug, replay the exact payload and keep
the response headers:

```bash
curl -sS -D - -o /tmp/hair-booking-appointment.json \
  -X POST https://hair-booking.app.scapegoat.dev/api/appointments \
  -H 'content-type: application/json' \
  --data '{"intake_id":"7428cb8d-0b7b-49ca-b590-84e363aa11a9","service_id":"fb964f96-5ac4-4e54-8561-59c6b0f5dd77","date":"2026-03-10","start_time":"11:00 AM","client_name":"man","client_email":"wesen@ruinwesen.com"}'

cat /tmp/hair-booking-appointment.json
```

Then correlate the `X-Request-Id` header with:

```bash
ssh manuel@89.167.52.236
sudo docker logs --tail 400 uion8lttbypsijf8ww9b4c3e-185456125584 2>&1 | grep '<request-id>'
```

## Host-header checks from the server

If public DNS or CDN behavior is confusing, verify directly on the box:

```bash
ssh manuel@89.167.52.236
curl -ksSI -H "Host: hair-booking.app.scapegoat.dev" https://127.0.0.1/
curl -ksS -H "Host: hair-booking.app.scapegoat.dev" https://127.0.0.1/booking | sed -n '1,30p'
```

This exercises Traefik routing locally on the host.

## How to tell if the old shell is still live

The old pre-embed shell contains markers like:

- `Keycloak bootstrap`
- `/static/app.css`
- `Login with Keycloak`

If any of those appear in the public HTML, the new embedded React build is not what the app is serving yet.

## Known operational sharp edges

- Coolify API tokens can still return `403` on project/application endpoints even when they are accepted by the server. Do not assume token creation alone means deploy automation will work.
- The Git branch must exist on GitHub. A local-only branch cannot be deployed.
- A host-side running container with the new image tag is a stronger signal than stale UI state in the Coolify dashboard.
- If the public root already returns `307 -> /booking`, the new runtime is almost certainly active.
- There are no new logging env vars for HAIR-011. The request/error logging is always on in the current production binary.

## Minimal rollback/debug checklist

1. Confirm the branch was pushed.
2. Confirm the running container image tag matches the expected commit.
3. Check `sudo docker logs --tail 80 <container>`.
4. Check `curl -ksSI -H "Host: hair-booking.app.scapegoat.dev" https://127.0.0.1/`.
5. Check `curl -ksS https://hair-booking.app.scapegoat.dev/booking | sed -n '1,30p'`.
