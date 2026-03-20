---
Title: Investigation Diary
Ticket: HAIR-002
Status: active
Topics:
    - backend
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/auth/oidc.go
      Note: Existing Keycloak/OIDC flow that now anchors the backend auth direction
    - Path: pkg/server/http.go
      Note: Existing authenticated /api/me baseline
    - Path: web/src/stylist/pages/SignInPage.tsx
      Note: OTP-oriented UI that now needs to be replaced
    - Path: web/src/stylist/pages/VerifyCodePage.tsx
      Note: OTP-oriented UI that now needs to be removed
    - Path: web/src/stylist/data/consultation-constants.ts
      Note: Booking and intake field definitions
    - Path: web/src/stylist/data/portal-data.ts
      Note: Mock portal records that the backend must replace
    - Path: ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/design-doc/01-luxe-hair-studio-mvp-backend-design-guide.md
      Note: Primary design deliverable tracked by this diary
ExternalSources: []
Summary: Chronological diary for the HAIR-002 backend MVP design and implementation work.
LastUpdated: 2026-03-20T08:30:00-04:00
WhatFor: Use this diary to understand why the backend plan changed and what implementation slices were executed.
WhenToUse: Use when reviewing or continuing HAIR-002.
---

# Investigation Diary

## Goal

This diary records how the Luxe Hair Studio MVP backend plan was derived, how the authentication direction changed from app-managed OTP to Keycloak/OIDC, and how the implementation work is being executed in small committed slices.

## Step 1: Create The Ticket And Capture The Original MVP Design

I started by creating a dedicated backend ticket because the repo already had separate frontend-port and Keycloak-bootstrap tickets. The original design pass focused on translating the user’s schema-and-route sketch into an intern-facing implementation guide backed by repository evidence.

At that point, the imported frontend widgets strongly suggested a passwordless login flow because the UI still contained sign-in and verify-code pages. I recorded that state accurately, but it was still a plan, not code.

### Prompt Context

**User prompt (verbatim):** "Create a new docmgr to create the proper backend for the hair stylist app.

We just imported a huge react storybook for widgets for our hair styling app, and we want to design the backend for an MVP. Keep a diary as you workd.

Here's a sketch for the routes for the features we want: # Luxe Hair Studio — MVP Schema & API (trimmed)

---

## Database Schema

```yaml
# ─────────────────────────────────────────
# PostgreSQL · timestamps UTC · UUIDs for PKs
# ─────────────────────────────────────────

clients:
  id:                 uuid PK
  name:               text NOT NULL
  email:              text UNIQUE
  phone:              text UNIQUE
  scalp_notes:        text
  service_summary:    text
  created_at:         timestamptz
  updated_at:         timestamptz
  # CHECK (email IS NOT NULL OR phone IS NOT NULL)

auth_codes:
  id:                 uuid PK
  client_id:          uuid FK → clients
  identifier:         text NOT NULL        # email or phone
  code:               text NOT NULL        # hashed
  expires_at:         timestamptz NOT NULL
  used_at:            timestamptz

sessions:
  id:                 uuid PK
  client_id:          uuid FK → clients NOT NULL
  token:              text UNIQUE NOT NULL
  expires_at:         timestamptz NOT NULL

services:
  id:                 uuid PK
  name:               text NOT NULL
  category:           text NOT NULL        # extensions | color | treatment | consult
  duration_min:       int NOT NULL
  price_low:          int
  price_high:         int
  is_active:          bool default true
  sort_order:         int

intake_submissions:
  id:                 uuid PK
  client_id:          uuid FK → clients
  service_type:       text NOT NULL        # extensions | color | both
  hair_length:        text
  hair_density:       text
  hair_texture:       text
  prev_extensions:    text
  color_service:      text
  natural_level:      text
  current_color:      text
  chemical_history:   text[]
  last_chemical:      text
  desired_length:     int
  ext_type:           text
  budget:             text
  maintenance:        text
  deadline:           text
  dream_result:       text
  estimate_low:       int
  estimate_high:      int
  created_at:         timestamptz

intake_photos:
  id:                 uuid PK
  intake_id:          uuid FK → intake_submissions NOT NULL
  slot:               text NOT NULL        # front | back | hairline | inspo
  storage_key:        text NOT NULL
  url:                text NOT NULL

appointments:
  id:                 uuid PK
  client_id:          uuid FK → clients NOT NULL
  service_id:         uuid FK → services NOT NULL
  intake_id:          uuid FK → intake_submissions
  date:               date NOT NULL
  start_time:         time NOT NULL
  status:             text NOT NULL default 'pending'
                      # pending | confirmed | completed | cancelled | no_show
  stylist_notes:      text
  prep_notes:         text
  cancelled_at:       timestamptz
  cancel_reason:      text
  created_at:         timestamptz
  updated_at:         timestamptz

appointment_photos:
  id:                 uuid PK
  appointment_id:     uuid FK → appointments NOT NULL
  slot:               text NOT NULL        # before | after
  storage_key:        text NOT NULL
  url:                text NOT NULL
  caption:            text

maintenance_plans:
  id:                 uuid PK
  client_id:          uuid FK → clients NOT NULL

maintenance_items:
  id:                 uuid PK
  plan_id:            uuid FK → maintenance_plans NOT NULL
  service_id:         uuid FK → services NOT NULL
  due_date:           date NOT NULL
  status:             text NOT NULL default 'upcoming'
                      # done | next | upcoming | overdue
  appointment_id:     uuid FK → appointments
  sort_order:         int

notification_prefs:
  client_id:          uuid PK FK → clients
  remind_48hr:        bool default true
  remind_2hr:         bool default true
  maint_alerts:       bool default true

schedule_blocks:
  id:                 uuid PK
  day_of_week:        int NOT NULL         # 0-6
  start_time:         time NOT NULL
  end_time:           time NOT NULL
  is_available:       bool default true

schedule_overrides:
  id:                 uuid PK
  date:               date NOT NULL UNIQUE
  is_blocked:         bool default true
  start_time:         time
  end_time:           time
```

...

We want to design out which routes and schema and use postgres and do local development."

**Assistant interpretation:** Create a backend design ticket, write a detailed implementation guide, keep a diary, and deliver the bundle through docmgr and reMarkable.

**Inferred user intent:** Get an implementation-ready backend plan instead of a vague architecture discussion.

**Commit (code):** N/A

### What I did
- Created the `HAIR-002` ticket.
- Wrote the initial design guide and diary.
- Related the shaping repo files.
- Validated the ticket and uploaded it to reMarkable.

### Why
- The codebase needed a documented backend direction before implementation work could start safely.

### What worked
- The current server and frontend state were easy to map.
- The ticket pipeline and reMarkable upload flow worked cleanly.

### What didn't work
- The first design assumed app-managed OTP because the imported frontend still used that flow. That assumption became obsolete once the user clarified they wanted Keycloak username/password login instead.

### What I learned
- The frontend auth widgets are not a reliable source of truth for product direction. The user’s clarification and the already-existing Keycloak bootstrap are more authoritative.

### What was tricky to build
- The initial difficulty was separating visible mock UI from actual MVP scope. That issue surfaced again when the auth direction changed.

### What warrants a second pair of eyes
- Whether the app should keep any app-managed session table once Keycloak is the sole auth flow.

### What should be done in the future
- Realign the ticket to Keycloak/OIDC and then begin implementation from the DB foundation upward.

### Code review instructions
- Review the original HAIR-002 doc only as historical context; it should no longer be treated as the final auth plan.

### Technical details
- Initial ticket creation and upload were performed successfully in the previous turn.

## Step 2: Retarget The Backend Plan To Keycloak/OIDC

The user then clarified the authentication direction: drop login codes and use standard login/password/OIDC through Keycloak. That changed the schema and the execution plan materially. The backend no longer needs `auth_codes`, and it should not grow a parallel app-managed auth subsystem when `pkg/auth/oidc.go` already provides the browser login flow.

I responded by rewriting the HAIR-002 design guide so it now treats Keycloak-backed browser auth as the only authentication mechanism for MVP. I also replaced the ticket task list with concrete implementation slices that can be worked and committed one by one.

### Prompt Context

**User prompt (verbatim):** "nah, let's drop the login code and just do standard login/pw/oidc through keycloak. remove auth_codes table.

Update the plan, then create detailed tasks for the all the different features. and then work the tasks one by one, committing at appropriate intervals, keeping a diary as you go"

**Assistant interpretation:** Rewrite the backend plan around the existing Keycloak/OIDC flow, create a detailed executable checklist, and begin implementing it in committed slices while updating the diary.

**Inferred user intent:** Stop designing around speculative OTP work and instead converge the backend on the auth system already present in the repo.

**Commit (code):** Pending

### What I did
- Updated the implementation plan to make Keycloak/OIDC the sole auth direction.
- Removed OTP assumptions from the design guide.
- Replaced the HAIR-002 task list with detailed phase-by-phase implementation tasks.
- Prepared to start the first code slice: DB plumbing and migration scaffolding.

### Why
- Adding app-managed OTP now would duplicate existing auth capability and distract from the actual missing backend work.

### What worked
- The existing `pkg/auth/oidc.go` code made the new direction straightforward and defensible.
- The existing `/api/me` handler already provides a natural authenticated entrypoint to build on.

### What didn't work
- The earlier design doc needed a full rewrite rather than a small patch because too many later sections depended on OTP assumptions.

### What I learned
- The right source of truth for auth in this repo is the Keycloak bootstrap work, not the imported mock login pages.

### What was tricky to build
- The sharp edge here was consistency. Once the login direction changed, leaving even a few OTP-oriented sections in the guide would have made the implementation plan internally contradictory.

### What warrants a second pair of eyes
- Whether application-side `sessions` should also be dropped from the domain schema entirely. The current implementation plan assumes yes, because the signed OIDC session cookie already covers browser auth.

### What should be done in the future
- Execute the code tasks in order, starting with application Postgres, migrations, and server wiring.

### Code review instructions
- Review the updated design guide before looking at code changes.
- Check that every planned feature slice now assumes Keycloak-authenticated browser sessions instead of login-code routes.

### Technical details
- Primary files touched in this step:
  - `ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/design-doc/01-luxe-hair-studio-mvp-backend-design-guide.md`
  - `ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/reference/01-investigation-diary.md`
  - `ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/tasks.md`
