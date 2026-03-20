---
Title: Stylist Runtime Smoke
Ticket: HAIR-007
Status: active
Topics:
    - frontend
    - stylist
    - smoke-test
    - react
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: web/src/stylist/StylistWorkspace.tsx
      Note: Live stylist runtime pages and forms under smoke
    - Path: web/src/stylist/store/api/stylistApi.ts
      Note: RTK Query endpoints and invalidation used by the runtime
    - Path: pkg/stylist/postgres.go
      Note: Backend aggregate queries that the smoke exposed
ExternalSources: []
Summary: Route-by-route browser smoke for the live stylist runtime against local Keycloak, Postgres, and seeded workflow data.
LastUpdated: 2026-03-20T18:10:00-04:00
WhatFor: Use this to replay the live stylist runtime smoke and validate real read/write flows in the browser.
WhenToUse: Use after changing stylist runtime routing, stylist RTK Query hooks, or stylist backend aggregate routes.
---

# Stylist Runtime Smoke

## Goal

Replay the first end-to-end browser smoke for the live `/stylist` runtime against local Postgres, local Keycloak, and seeded stylist workflow data.

## Preconditions

- repo root: `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking`
- use `127.0.0.1`, not `localhost`, for every URL in this flow
- local Postgres is running on `127.0.0.1:15432`
- local Keycloak is running on `127.0.0.1:18090`
- stylist allowlist contains `alice@example.com`

## Start Local Runtime

### 1. Start Keycloak if needed

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
HAIR_BOOKING_KEYCLOAK_PORT=18090 docker compose -f docker-compose.local.yml up -d keycloak-postgres keycloak
```

### 2. Start Vite in tmux

```bash
tmux new-session -d -s hb-web \
  'cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking && npm --prefix web run dev -- --host 127.0.0.1 --port 5175'
```

### 3. Start the Go app in tmux

```bash
tmux new-session -d -s hb-backend \
  'cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking && HAIR_BOOKING_DATABASE_URL="postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable" make run-local-oidc APP_PORT=8080 KEYCLOAK_PORT=18090 SESSION_SECRET=local-session-secret FRONTEND_DEV_PROXY_URL=http://127.0.0.1:5175 STYLIST_EMAILS=alice@example.com'
```

### 4. Seed stylist workflow fixtures

```bash
./scripts/seed_stylist_workflows.sh
```

### 5. Confirm the stack

```bash
tmux capture-pane -pt hb-web:0.0 | tail -20
tmux capture-pane -pt hb-backend:0.0 | tail -20
curl -sS http://127.0.0.1:8080/api/info
```

## Browser Flow

### 1. Log in to the stylist runtime

- open `http://127.0.0.1:8080/stylist`
- click `Continue to Sign In`
- log in with:
  - username: `alice`
  - password: `secret`
- confirm you land back on `/stylist`

### 2. Verify the dashboard loads

- confirm the dashboard shows live intake counts
- confirm upcoming appointment cards render

### 3. Verify intake review workflow

- navigate to `Intakes`
- set `Status` to `In Review`
- set `Priority` to `Urgent`
- open intake `Avery Moss`
- update the review to:
  - status: `Approved To Book`
  - summary: `Approved for consult booking after wedding review.`
- save
- confirm the page updates without a reload error

Reference seeded intake:

- intake id: `a36bb5f1-e22d-4a88-9a75-84af8fe40111`

### 4. Verify appointment update workflow

- navigate to `Appointments`
- set `Status` to `Pending`
- set the client filter to `Bianca`
- open Bianca Reed appointment detail
- update:
  - status: `Confirmed`
  - stylist notes: `Confirmed after stylist runtime smoke test.`
- save
- confirm the detail page reflects the new status and notes

Reference seeded appointment:

- appointment id: `ef5bb36a-d2bc-4a19-9cc0-57d2eaf70882`

### 5. Verify client detail reflects the updated appointment

- navigate to `Clients`
- open `Bianca Reed`
- confirm the recent appointments section shows the confirmed appointment state

Reference seeded client:

- client id: `2dfed0aa-cd8f-4f78-85c9-15a574f3d202`

## Failure Modes To Watch

- `invalid oauth state`
  - usually means `localhost` and `127.0.0.1` got mixed
  - clear cookies and restart the flow with only `127.0.0.1`
- `Failed to load the stylist appointment detail.`
  - check whether the backend includes the nullable stylist detail fix from commit `02f5c4e`
- blank or stale screens after save
  - inspect RTK Query invalidation and verify the backend returned the expected `client_id` or review payload

## Validation Commands

```bash
go test ./...
npm --prefix web run typecheck
docmgr doctor --ticket HAIR-007 --stale-after 30
```
