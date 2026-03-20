---
Title: Embedded React And Coolify Verify
Ticket: HAIR-009
Status: active
Topics:
    - frontend
    - deploy
    - coolify
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: Dockerfile
      Note: Production build path that compiles and embeds the React frontend
    - Path: pkg/web/generate_build.go
      Note: Asset-copy generator that moves web/dist into pkg/web/public
    - Path: ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/check-embedded-shell.sh
      Note: Local and hosted shell verifier
    - Path: ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/trigger-coolify-deploy.sh
      Note: Manual deploy trigger for the known Coolify application UUID
ExternalSources: []
Summary: Replayable verification steps for the embedded React production shell and the hosted Coolify rollout.
LastUpdated: 2026-03-20T18:55:00-04:00
WhatFor: Use this to re-run local embed validation and hosted Coolify verification without reconstructing the shell history.
WhenToUse: Use when validating HAIR-009 locally or after a hosted deploy.
---

# Embedded React And Coolify Verify

Use this after the HAIR-009 embed work lands.

## Local embedded shell

1. Refresh the embedded assets:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
GOWORK=off go generate ./pkg/web
```

2. Start the app without the frontend dev proxy:

```bash
make run-local-dev APP_PORT=8080
```

3. Verify the runtime shape:

```bash
./ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/check-embedded-shell.sh http://127.0.0.1:8080
```

Expected results:

- `/` redirects to `/booking`
- `/booking` contains the React root markup
- `/booking` does not contain the old inspector shell strings

## Docker build

Build the production image:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
docker build -t hair-booking:embed-test .
```

Run it locally:

```bash
docker run --rm -p 8081:8080 \
  -e HAIR_BOOKING_AUTH_MODE=dev \
  -e HAIR_BOOKING_AUTH_SESSION_SECRET=local-session-secret \
  hair-booking:embed-test
```

Verify:

```bash
./ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/check-embedded-shell.sh http://127.0.0.1:8081
```

## Hosted verification

Check the public app:

```bash
./ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/check-hosted-shell.sh
```

The hosted app is still on the legacy shell if the body includes any of:

- `Keycloak bootstrap`
- `/static/app.css`
- `Login with Keycloak`

## Coolify deploy trigger

The current known Coolify app UUID is `uion8lttbypsijf8ww9b4c3e`.

If you have a token with application API access, trigger the hosted deploy with:

```bash
export COOLIFY_TOKEN=<real-token-with-app-access>
./ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/trigger-coolify-deploy.sh
```

Then rerun:

```bash
./ttmp/2026/03/20/HAIR-009--cleanup-runtime-and-embed-react-in-go/scripts/check-hosted-shell.sh
```
