# Smoke Testing Playbook

This playbook is the long-lived intern-facing runbook for real smoke testing in `hair-booking`.

It is not a one-time report. Keep updating this document as the app evolves so the next person can answer four questions quickly:

1. What stack do I need to start?
2. Which frontend entrypoint should I test?
3. What exact browser flows count as a meaningful smoke test right now?
4. If something fails, what evidence do I capture and where do I look next?

## Maintenance Rule

Whenever a smoke test reveals a new requirement, failure mode, workaround, or validation command, update this playbook in the same work session.

Do not leave critical smoke knowledge only in:

- chat history
- tmux scrollback
- ticket comments
- personal memory

If a future smoke test changes the expected steps or expected results, update this file first, then update any ticket diary that references it.

## Audience

This document assumes the reader is a new intern who:

- can run shell commands
- understands basic HTTP and browser concepts
- may not know this repo’s split frontend/backend setup yet

## What This Playbook Covers

This playbook currently covers:

- local Postgres for app data
- local Keycloak for OIDC login
- the Go backend on `127.0.0.1:8080`
- the React app under Vite
- a real guest booking smoke flow
- a real portal authentication smoke flow
- Postgres verification after the browser flow

This playbook does not yet cover:

- full portal data validation for profile, appointments, maintenance, and photos
- automated CI smoke tests
- mobile device testing
- deployed environment smoke tests

## Critical Architecture Detail

There are currently two frontend realities in this repo:

1. The Go server serves embedded static assets from `pkg/web/public`.
2. The active React integration work lives in `web/src` and is served by Vite in local development.

This distinction matters a lot.

If you only run the Go backend and browse to `http://127.0.0.1:8080/`, you are testing the older embedded frontend shell, not the active React booking and portal apps under `web/src`.

For real frontend smoke testing, use the Vite app.

Current local smoke entrypoints:

- booking app: `http://127.0.0.1:<vite-port>/?app=booking`
- portal app: `http://127.0.0.1:<vite-port>/?app=portal`

The Vite app proxies:

- `/api`
- `/auth`
- `/uploads`

to the Go backend on `http://127.0.0.1:8080`.

## Current Known Good Local Defaults

### App services

- Go backend: `http://127.0.0.1:8080`
- app Postgres host port: `15432`
- Keycloak host port: `18090`
- Vite preferred port: `5173`

### Keycloak fixture

- realm: `hair-booking-dev`
- client ID: `hair-booking-web`
- client secret: `hair-booking-web-secret`
- test user: `alice`
- test password: `secret`

### App database URL

```bash
postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable
```

## Files You Should Know Before Running The Smoke Test

### Core runtime files

- [docker-compose.local.yml](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docker-compose.local.yml)
- [Makefile](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Makefile)
- [web/vite.config.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/vite.config.ts)
- [web/src/main.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/main.tsx)

### Booking flow files

- [ConsultEstimatePage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultEstimatePage.tsx)
- [ConsultCalendarPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx)
- [PhotosPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PhotosPage.tsx)
- [bookingApi.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/bookingApi.ts)
- [servicesApi.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/servicesApi.ts)

### Auth and client bootstrap files

- [ClientPortalApp.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/ClientPortalApp.tsx)
- [SignInPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/SignInPage.tsx)
- [authApi.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/authApi.ts)
- [pkg/auth/oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go)
- [pkg/clients/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/clients/postgres.go)

### Persistence files

- [pkg/intake/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/postgres.go)
- [pkg/server/handlers_public.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go)
- [pkg/server/handlers_me.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go)
- [pkg/db/migrations/0001_init.sql](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/db/migrations/0001_init.sql)

## Scripts For Reproducing The Smoke Environment

Current ticket-local scripts:

- [start_local_smoke_stack.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/start_local_smoke_stack.sh)
- [inspect_latest_booking.sh](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh)
- [playwright_smoke_flow.mjs](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/playwright_smoke_flow.mjs)

These live under the ticket because they were created during HAIR-003. If they remain useful over time, consider promoting them into the repo’s top-level `scripts/` directory later.

## Before You Start

Run these checks first:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
go test ./...
npm --prefix web run typecheck
remarquee status
```

Expected results:

- Go tests pass
- TypeScript passes
- `remarquee` is available if you need to upload notes or reports afterward

## Starting The Local Smoke Stack

### Option A: Use the ticket script

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/start_local_smoke_stack.sh
```

### Option B: Start it manually

#### 1. Start app Postgres

```bash
docker compose -f docker-compose.local.yml up -d app-postgres
```

#### 2. Make sure Keycloak is up

If the local Keycloak stack is not already running:

```bash
HAIR_BOOKING_KEYCLOAK_PORT=18090 docker compose -f docker-compose.local.yml up -d keycloak-postgres keycloak
```

#### 3. Start backend and Vite in tmux shells

Important: start them in tmux shells, not in foreground terminals, so you can stop the child process without losing the shell.

```bash
tmux new-session -d -s hb-backend 'cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking && exec zsh -i'
tmux new-session -d -s hb-web 'cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking && exec zsh -i'
```

#### 4. Launch the backend in tmux

```bash
tmux send-keys -t hb-backend 'HAIR_BOOKING_DATABASE_URL=postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable make run-local-oidc APP_PORT=8080 KEYCLOAK_PORT=18090 SESSION_SECRET=local-session-secret' C-m
```

#### 5. Launch Vite in tmux

```bash
tmux send-keys -t hb-web 'npm --prefix web run dev -- --host 127.0.0.1 --port 5173' C-m
```

#### 6. Inspect the tmux panes

```bash
tmux capture-pane -pt hb-backend
tmux capture-pane -pt hb-web
```

Healthy backend log shape:

```text
INF Starting hair-booking server address=0.0.0.0:8080 auth_mode=oidc auto_migrate=true client_id=hair-booking-web database_configured=true issuer=http://127.0.0.1:18090/realms/hair-booking-dev
```

Healthy Vite log shape:

```text
VITE v6.x.x  ready in ...
➜  Local:   http://127.0.0.1:5173/
```

### Important Note About The Vite Port

If `5173` is already occupied, Vite will pick another port such as `5174` or `5175`.

Always inspect the actual port from:

```bash
tmux capture-pane -pt hb-web
```

Do not assume the port stayed at `5173`.

Also do not assume every server already listening on `5173` is this repo's hair-booking app. In this workspace, a different Vite app can already be bound there. If the page title or UI does not look like `Hair Stylist Booking`, stop and confirm the active port from `tmux capture-pane -pt hb-web` before continuing.

## Health Checks Before Opening The Browser

Run:

```bash
curl -sS -i http://127.0.0.1:8080/api/info
curl -sS 'http://127.0.0.1:8080/api/services?category=consult'
```

Expected results:

- `/api/info` returns `200 OK`
- the response reports `authMode: "oidc"`
- the response reports `databaseConfigured: true`
- `/api/services?category=consult` returns at least:
  - `Extensions Consultation`
  - `Color Consultation`

## Browser Smoke Flow 1: Guest Booking

This is the highest-value smoke flow right now.

It proves:

- Vite app entrypoint
- RTK Query service loading
- intake creation
- multipart photo upload
- live availability fetch
- appointment creation
- confirmation rendering
- Postgres persistence

### Booking entry URL

```text
http://127.0.0.1:<vite-port>/?app=booking
```

### Test data used during the last validated run

- service type: extensions
- hair length: `Past shoulders`
- density: `Medium`
- texture: `Wavy`
- previous extensions: `No, never`
- extension type: `Tape-ins`
- budget: `$800 – $1,200`
- maintenance: `Every 4–6 weeks (ideal)`
- date: `March 19, 2026`
- time: `9:00 AM`
- contact name: `Alice Example`
- contact email: `alice@example.com`
- contact phone: `401-555-0123`

### Local image files used for upload

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/node_modules/@storybook/icons/dist/public/cover.jpg`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/node_modules/@storybook/icons/dist/public/logo.png`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/node_modules/polished/docs/assets/meta.png`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/node_modules/@storybook/core/assets/docs/message-reference.png`

### Step-by-step booking flow

1. Open the booking URL in the browser.
2. Click `I Want Extensions`.
3. On the hair profile step:
   - choose `Past shoulders`
   - choose `Medium`
   - choose `Wavy`
   - choose `No, never`
4. Click `Next`.
5. On the photo step:
   - upload a front image
   - upload a back image
   - upload a hairline image
   - upload one inspiration image
6. Confirm the UI shows checkmarks for:
   - `Front ✓`
   - `Back ✓`
   - `Hairline ✓`
   - `1 added ✓`
7. Click `Next`.
8. On the goals step:
   - choose `Tape-ins`
   - choose budget `$800 – $1,200`
   - choose maintenance `Every 4–6 weeks (ideal)`
9. Click `See My Estimate`.
10. Confirm the estimate screen appears.
11. Click `Book Free Consult — 15 min`.
12. On the calendar step:
   - choose an available date
   - choose an available time
13. Fill contact info.
14. Click `Confirm Booking`.
15. Confirm the success screen shows:
   - `You're All Set`
   - an appointment reference
   - an intake reference

### Minimum pass criteria for booking smoke

- the estimate screen loads without an API error
- the calendar screen loads real availability
- available dates are clickable
- available times are clickable
- confirmation succeeds with no visible error
- the confirmation screen shows both an appointment ref and an intake ref

## Postgres Verification After Booking

Run:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/inspect_latest_booking.sh
```

Confirm:

- a `clients` row exists for the booking contact
- a recent `intake_submissions` row exists
- a recent `appointments` row exists
- recent `intake_photos` rows exist for:
  - `front`
  - `back`
  - `hairline`
  - `inspo`

### Last confirmed artifact set

- client ID: `0e6934a4-b0a9-4f3e-ae05-6b9ea259214a`
- intake ID: `c8d50291-1700-4ba6-8d42-1ef58082d2b4`
- appointment ID: `56741fda-8bfa-4d6d-8b2d-2c98978df6a9`

Do not hard-code these values into future expectations. They are only an example of what a successful run looked like.

## Browser Smoke Flow 2: Portal Authentication

This flow currently validates:

- unauthenticated portal gate
- Keycloak login initiation
- Keycloak callback
- browser session cookie
- `/api/me` success after login
- portal home/profile/appointments live reads
- profile edit mutation
- notification preference mutation
- appointment cancellation mutation
- logout

This flow still does not fully validate every portal surface. Rewards and photos remain mock-backed.

### Portal entry URL

```text
http://127.0.0.1:<vite-port>/?app=portal
```

### Step-by-step portal auth flow

1. Open the portal URL.
2. Confirm the unauthenticated state appears with `Continue to Sign In`.
3. Click `Continue to Sign In`.
4. On Keycloak, log in as:
   - username: `alice`
   - password: `secret`
5. After callback, note that the browser currently lands on:

```text
http://127.0.0.1:8080/
```

6. Navigate back to the Vite portal URL.
7. Confirm the sign-in gate is gone.
8. Confirm the portal home now greets the real client.
9. Verify the live session directly from the browser:

```js
fetch('/api/me', { credentials: 'include' }).then(r => r.json())
```

10. Confirm `/api/me` returns `200` and includes the authenticated client.
11. Open the appointments tab and confirm the real consult history appears.
12. Open the profile page and confirm the live client contact fields appear.
13. Click `Edit Profile`.
14. Change at least one field and click `Save Profile`.
15. Confirm the form closes and the updated value appears on the profile page.
16. Reload the portal, reopen profile, and confirm the value persisted.
17. Toggle one notification preference and verify `/api/me` reflects the updated backend value.
18. If there is an upcoming appointment outside the 24-hour policy window, cancel it and verify the portal refetches.
19. Click the avatar and sign out.
20. Complete the Keycloak logout confirmation.
21. Return to the Vite portal URL.
22. Confirm the unauthenticated sign-in gate is back.

### Important current limitation

Rewards and photos still remain mock-backed. The live portal surfaces are currently:

- home greeting
- appointments
- profile identity
- profile edits
- notification preferences

The still-mock portal surfaces are currently:

- rewards
- photos

This is expected until those later slices land.

### Portal mutation policy note

Appointment cancellation and reschedule behavior is policy-gated.

During a verified smoke run, cancelling an appointment within 24 hours returned:

```text
appointments cannot be changed within 24 hours: appointment policy violation
```

That is an expected backend-enforced rule, not a frontend bug.

### Minimum pass criteria for portal auth smoke

- portal shows sign-in gate before login
- Keycloak login succeeds
- `/api/me` returns `200` after login
- home greeting reflects the authenticated client
- profile page reflects the authenticated client
- profile edits persist through reload and `/api/me`
- notification preference changes persist through `/api/me`
- appointment cancellation outside the policy window refetches the portal state
- logout succeeds
- portal returns to sign-in gate after logout

## Known Current Failure Signatures

If you see these exact failures, start here.

### Failure: intake creation null scan

Error:

```text
failed to create intake submission: can't scan into dest[7] (col: color_service): cannot scan NULL into *string
```

Where to inspect:

- [pkg/intake/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/intake/postgres.go)

Meaning:

- the repository is scanning nullable DB columns into non-null-safe Go targets

### Failure: services query shape mismatch

Error:

```text
TypeError: result.map is not a function
```

Where to inspect:

- [web/src/stylist/store/api/servicesApi.ts](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/store/api/servicesApi.ts)

Meaning:

- the frontend expected a bare array, but the backend returned `{ services: [...] }`

### Failure: authenticated client bootstrap

Error:

```text
client-bootstrap-failed
```

Where to inspect:

- [pkg/clients/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/clients/postgres.go)
- [pkg/server/handlers_me.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go)

Meaning:

- either nullable client columns are being scanned unsafely
- or an authenticated identity is colliding with an existing guest-booking client row and needs linking

### Failure: wrong Vite app on the expected port

Symptom:

```text
The browser opens a different application such as CozoScript Editor instead of Hair Stylist Booking.
```

Where to inspect:

- `tmux capture-pane -pt hb-web`
- [web/src/main.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/main.tsx)

Meaning:

- `5173` is serving a different dev server in the workspace
- or the hair-booking Vite instance chose a different port such as `5175`

### Failure: profile update failed

Error:

```text
profile-update-failed
```

Or in the UI:

```text
Failed to update the client profile.
```

Where to inspect:

- [pkg/clients/postgres.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/clients/postgres.go)
- [pkg/server/handlers_me.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go)
- [web/src/stylist/pages/PortalProfilePage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalProfilePage.tsx)

Meaning:

- the portal editor successfully reached `PATCH /api/me`
- but the backend profile query did not cast one of its nullable text parameters as `text`
- the frontend was not the root cause if this exact error appears

### Failure: appointment policy violation on cancel

Error:

```text
appointments cannot be changed within 24 hours: appointment policy violation
```

Where to inspect:

- [pkg/appointments/service.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/appointments/service.go)
- [web/src/stylist/pages/PortalHomePage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalHomePage.tsx)
- [web/src/stylist/pages/PortalAppointmentsPage.tsx](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/PortalAppointmentsPage.tsx)

Meaning:

- the frontend successfully reached the real cancel mutation
- the backend rejected the request because the appointment was too close to start time

## Evidence You Must Capture For Any Failed Smoke Test

If the smoke test fails, capture all of the following before you start patching:

1. The exact browser page URL.
2. The visible UI error text.
3. The relevant network request and status code.
4. The relevant tmux pane output:
   - `tmux capture-pane -pt hb-backend`
   - `tmux capture-pane -pt hb-web`
5. The failing API payload if the browser exposed it.
6. The exact command you ran just before the failure.

Put the evidence into:

- the current ticket diary
- the current changelog if the failure led to a fix
- this playbook if the failure teaches a lasting operational lesson

## How To Update This Playbook After Future Smoke Work

When you learn something new, update the relevant section immediately:

- stack startup changed: update `Starting The Local Smoke Stack`
- new required env var: update `Current Known Good Local Defaults`
- new browser flow became testable: add a new `Browser Smoke Flow` section
- new failure signature discovered: add it under `Known Current Failure Signatures`
- new evidence requirement: add it under `Evidence You Must Capture`

Always prefer concrete updates over vague notes.

Good update:

- “Portal auth now redirects back to `/?app=portal` in local dev after callback.”

Bad update:

- “Portal auth is better now.”

## Optional Replay Using The Ticket Script

If you want a code-based replay of the current validated browser sequence, inspect:

- [playwright_smoke_flow.mjs](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/20/HAIR-003--integrate-hair-stylist-frontend-with-backend-apis-via-rtk-query/scripts/playwright_smoke_flow.mjs)

That script is not the source of truth. This playbook is. The script is only a replay aid.

## Current Exit Criteria For A “Good” Local Smoke Pass

Right now, a good local smoke pass means:

- backend starts cleanly
- Vite starts cleanly
- `/api/info` returns healthy OIDC metadata
- booking flow completes end to end
- DB rows match the booking confirmation
- portal sign-in works
- `/api/me` succeeds after login
- profile edit saves and survives reload
- logout works

It does not yet require:

- full live portal content parity
- photo timeline validation in the portal
- maintenance timeline parity
- reschedule mutation validation

Those should be added to this playbook when those slices are integrated.
