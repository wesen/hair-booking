---
Title: Investigation Diary
Ticket: HAIR-004
Status: active
Topics:
    - frontend
    - backend
    - mvp
    - code-review
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: cmd/hair-booking/cmds/serve.go
      Note: Reviewed storage mode implementation and server wiring during the MVP assessment
    - Path: pkg/auth/oidc.go
      Note: Reviewed callback redirect behavior during the auth/app-shell assessment
    - Path: pkg/db/migrations/0001_init.sql
      Note: Reviewed the schema to determine what exists for client flows and what is missing for stylist workflows
    - Path: pkg/server/http.go
      Note: Reviewed live API route coverage to confirm that stylist-side APIs do not yet exist
    - Path: pkg/server/handlers_public.go
      Note: Reviewed public booking handlers to confirm booking/integration progress
    - Path: pkg/server/handlers_portal.go
      Note: Reviewed current portal coverage and limits
    - Path: web/src/main.tsx
      Note: Reviewed app selection logic to explain why the default browser surface is confusing
    - Path: web/src/stylist/StylistApp.tsx
      Note: Reviewed the current stylist shell and confirmed that it remains mock-driven
    - Path: web/src/stylist/ClientBookingApp.tsx
      Note: Reviewed live booking integration and leftover fake payment behavior
    - Path: web/src/stylist/ClientPortalApp.tsx
      Note: Reviewed the mixed real and mock portal runtime
    - Path: web/src/stylist/store/index.ts
      Note: Reviewed mixed demo and RTK Query state architecture
    - Path: web/src/stylist/data/constants.ts
      Note: Reviewed seeded stylist demo data and out-of-scope loyalty content
    - Path: web/src/stylist/data/portal-data.ts
      Note: Reviewed seeded portal mock data that still blocks a fully real portal
ExternalSources: []
Summary: Chronological diary of the architecture review and the evidence used to assess MVP readiness.
LastUpdated: 2026-03-20T09:06:00-04:00
WhatFor: Use this diary to retrace how the MVP review was performed and which commands and files informed the conclusions.
WhenToUse: Use when reviewing or extending the HAIR-004 analysis.
---

# Investigation Diary

## 2026-03-20

### Context And Goal

The task was to step back from feature implementation and assess what has actually been built so far, then turn that into an intern-facing MVP readiness review with concrete recommendations for a shippable product.

The user explicitly narrowed product focus:

- keep booking central
- make stylist review easy
- support stylist-side work
- do not prioritize reminders, payment, or rewards

That changed the evaluation criteria. The question stopped being “what routes exist?” and became “does the codebase currently support a real day-to-day booking workflow for both the client and the stylist?”

### Initial Architecture Mapping

I began by inventorying the repository structure and the current frontend/backend split.

Commands used:

```bash
docmgr status --summary-only
find . -maxdepth 3 -type d | sort
tree -L 2 pkg
tree -L 2 web/src/stylist
rg --files web/src/stylist | wc -l
rg --files web/src/stylist | rg '\.stories\.tsx$' | wc -l
rg --files web/src | rg '\.(test|spec)\.(ts|tsx)$'
```

Findings:

- the backend is organized into clean domain packages
- the frontend package is large and heavily storybook-oriented
- there are many Storybook stories
- there are no frontend tests

That immediately suggested a split personality:

- backend and API work are progressing toward a real app
- much of the frontend still behaves like imported UI inventory

### Frontend Entrypoint Review

I reviewed `web/src/main.tsx` first because it defines what “the app” actually means in a browser.

Command:

```bash
nl -ba web/src/main.tsx | sed -n '1,80p'
```

Key finding:

- the app is selected by `?app=` query parameter
- default is `StylistApp`
- booking and portal are hidden behind alternate query parameters

This explains the confusion seen during testing: visiting the frontend root gives the impression of a stylist/admin interface, but that interface is not actually the live operational surface.

### Stylist App Review

I next inspected the stylist-side UI because the user explicitly asked to allow the stylist to work on her side of things.

Commands:

```bash
nl -ba web/src/stylist/StylistApp.tsx | sed -n '1,220p'
nl -ba web/src/stylist/pages/HomePage.tsx | sed -n '1,200p'
nl -ba web/src/stylist/data/constants.ts | sed -n '1,220p'
nl -ba web/src/stylist/store/index.ts | sed -n '1,120p'
```

Findings:

- `StylistApp` is still driven by tab switching and local seeded slices
- referral points and toast behavior are purely local
- `HomePage` hard-codes the date and filters appointments by string values like `"Mar 19"`
- `constants.ts` seeds services, clients, appointments, loyalty tiers, and rewards
- the shared Redux store mixes demo slices and RTK Query cache

Conclusion:

- the stylist app is not a real stylist operations app yet
- it is a UI demo layer with strong visual polish and weak system reality

### Portal And Booking Review

I then reviewed the client-facing areas to separate real work from leftovers.

Commands:

```bash
nl -ba web/src/stylist/ClientPortalApp.tsx | sed -n '1,220p'
nl -ba web/src/stylist/store/portalSlice.ts | sed -n '1,180p'
nl -ba web/src/stylist/data/portal-data.ts | sed -n '1,180p'
nl -ba web/src/stylist/ClientBookingApp.tsx | sed -n '1,180p'
nl -ba web/src/stylist/components/DepositPaymentSheet.tsx | sed -n '1,220p'
nl -ba web/src/stylist/pages/PortalRewardsPage.tsx | sed -n '1,200p'
nl -ba web/src/stylist/pages/PortalPhotosPage.tsx | sed -n '1,220p'
```

Findings:

- portal auth bootstrapping is real
- some portal reads/writes are real
- portal rewards are still mock-backed
- portal photo timeline is still mock-backed
- the booking app still mounts deposit/payment UI
- payment success is simulated with a timeout
- the payment sheet claims Stripe security despite no real payment backend

Conclusion:

- the booking and portal surfaces are partly real
- but they still contain visible non-MVP and fake-MVP surfaces that should be removed rather than completed

### API And Backend Review

I reviewed the server and service layers next.

Commands:

```bash
nl -ba pkg/server/http.go | sed -n '150,260p'
nl -ba pkg/server/handlers_public.go | sed -n '1,280p'
nl -ba pkg/server/handlers_portal.go | sed -n '1,320p'
nl -ba pkg/appointments/service.go | sed -n '1,260p'
nl -ba pkg/intake/service.go | sed -n '1,280p'
nl -ba pkg/clients/service.go | sed -n '1,260p'
nl -ba pkg/services/service.go | sed -n '1,220p'
nl -ba pkg/db/migrations/0001_init.sql | sed -n '1,220p'
```

Findings:

- the backend route surface is coherent and centered on public booking plus client portal
- the core booking flow is genuinely implemented
- the services are reasonably thin and idiomatic
- the schema covers client-side concerns well enough for an MVP foundation
- there are no stylist/admin routes
- there is no stylist workflow state in the schema

Conclusion:

- backend work is ahead of frontend work
- but it is still only half of the business workflow because the stylist-facing operational loop is missing

### Auth And App-Shell Review

The local login behavior had already shown some confusion during smoke testing, so I explicitly reviewed the auth callback target and the backend root page.

Commands:

```bash
nl -ba pkg/auth/oidc.go | sed -n '100,260p'
nl -ba pkg/web/public/index.html | sed -n '1,220p'
nl -ba cmd/hair-booking/cmds/serve.go | sed -n '100,170p'
```

Findings:

- post-login redirect is hard-coded to `/`
- `/` on the Go server still serves a bootstrap page that says React is a future step
- local storage works, but S3 mode is still unimplemented

Conclusion:

- the login path is functionally working but product-wise confusing
- the embedded web surface still reflects an earlier project phase

### Testing Posture Review

I checked automated test shape rather than guessing.

Commands:

```bash
find pkg -type f \( -name '*_test.go' -o -name '*.go' \) | sort
find web/src -type f \( -name '*test.*' -o -name '*spec.*' \) | sort
go test ./...
npm --prefix web run typecheck
```

Findings:

- backend packages have real tests
- frontend has no tests
- `go test ./...` passes
- frontend typecheck passes

Conclusion:

- backend regression risk is moderate and visible
- frontend regression risk is still largely manual

### Review Synthesis

After all of the above, the core synthesis became clear:

1. The codebase is close to a credible client-booking prototype.
2. The codebase is not yet a coherent studio operations MVP.
3. The missing piece is not “more portal polish”; it is stylist workflow.
4. The fastest path to MVP is to cut fake scope and build stylist-side reality.

### Documentation Output

Based on the investigation, I created:

- the main design/review document
- this diary
- a detailed implementation task list
- changelog updates

The review was written for a new intern, so it explains:

- what is actually live
- what is mock
- what should be removed
- what should be added
- what order to implement the remaining MVP work in
