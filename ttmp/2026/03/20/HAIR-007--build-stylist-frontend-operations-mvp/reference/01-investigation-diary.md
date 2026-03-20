---
Title: Investigation Diary
Ticket: HAIR-007
Status: active
Topics:
    - frontend
    - react
    - redux
    - typescript
    - mvp
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Source review that identified the mock-heavy stylist runtime
    - Path: web/src/stylist/StylistApp.tsx
      Note: Current runtime baseline to replace
    - Path: web/src/stylist/data/constants.ts
      Note: Seeded runtime data to retire
ExternalSources: []
Summary: Short diary describing why HAIR-007 was created and how the plan was simplified for a single-stylist MVP.
LastUpdated: 2026-03-20T18:35:00-04:00
WhatFor: Use this diary to understand the purpose and boundary of the stylist frontend ticket.
WhenToUse: Use while implementing or reviewing HAIR-007.
---

# Investigation Diary

## 2026-03-20

This ticket was split from HAIR-004 because the stylist frontend needs more than data hookup. It needs a workflow redesign around real operational tasks.

The main review findings were:

- the stylist home page is hard-coded
- clients and appointments come from seeded constants
- loyalty and referral concepts are still mixed into runtime

This ticket exists to replace that mock runtime with a real dashboard, queue, appointment, and client workflow.

The product direction was later clarified as single stylist for MVP. That means the frontend should not spend time on:

- staff pickers
- appointment assignment controls
- multi-operator queue filters

The right target is one operator dashboard with clear review, schedule, and client context.

The first implementation slice turned that product boundary into an actual runtime shape.

Before this slice, `/stylist` was just a safe authenticated placeholder that explicitly refused to show the old seeded dashboard. That was the right temporary move for HAIR-005, but it also meant HAIR-007 had to start by replacing the placeholder with a real route shell rather than by sprinkling data hooks into the old tabbed demo app.

The main decision in this slice was:

- keep `web/src/stylist/StylistApp.tsx` as Storybook/design-reference code
- build the live `/stylist` runtime around a separate route-aware workspace
- consume the HAIR-006 backend directly through RTK Query

That keeps runtime concerns and imported mock/demo concerns from collapsing back together.

The concrete frontend additions were:

- stylist DTOs added under `web/src/stylist/store/api/types.ts`
- stylist RTK Query endpoints in `web/src/stylist/store/api/stylistApi.ts`
- lightweight stylist view hooks in `web/src/stylist/store/api/stylistView.ts`
- pathname-based route helpers in `web/src/stylist/utils/stylistRouting.ts`
- a new `web/src/stylist/StylistWorkspace.tsx`
- `web/src/stylist/StylistRuntimeApp.tsx` now mounts that workspace instead of the placeholder copy

The routing choice stayed intentionally simple. There is no React Router in the repo today, and this slice did not need a dependency jump just to prove out the real backend-backed runtime. The manual path resolver is enough for:

- `/stylist`
- `/stylist/intakes`
- `/stylist/intakes/:id`
- `/stylist/appointments`
- `/stylist/appointments/:id`
- `/stylist/clients`
- `/stylist/clients/:id`

This gave the ticket a real route structure immediately while keeping the change small enough to validate quickly.

The runtime pages in this slice are intentionally skeleton-first:

- dashboard reads `/api/stylist/dashboard`
- intake list/detail read `/api/stylist/intakes` and `/api/stylist/intakes/:id`
- appointment list/detail read `/api/stylist/appointments` and `/api/stylist/appointments/:id`
- client list/detail read `/api/stylist/clients` and `/api/stylist/clients/:id`

The detail pages are read-only for now. That is deliberate. Mutation wiring for intake review and appointment updates should come after the backend-backed route shell is stable, not during the same pass that removes the placeholder runtime.

One useful implementation detail is that the new workspace does not reuse the old loyalty-driven stylist slices at all. It reads from RTK Query hooks directly. That means the live runtime has already crossed the most important boundary for HAIR-007:

- seeded stylist data is no longer driving the real `/stylist` route

Validation in this slice was compile-level only:

- `npm --prefix web run typecheck`

The first typecheck run failed because `String.prototype.replaceAll` is newer than the current TypeScript target. That was corrected immediately by switching to `split("_").join(" ")`. There were no API-shape type failures after that fix.

The next HAIR-007 slice should focus on depth rather than breadth:

- wire intake review mutation
- wire appointment update mutation
- add filters for queue/list pages
- then run a real browser-backed stylist smoke

The next slice did exactly that.

This pass stayed inside the new route-aware runtime shell from the first HAIR-007 slice and deliberately did not touch the older mock `StylistApp` tree. That separation is important now: the live `/stylist` path should keep moving toward real operations, while Storybook/demo surfaces can be cleaned up later without blocking delivery.

The intake queue/detail changes were:

- backend-backed status filter on the queue
- client-side priority filter on the queue
- a real inline review form on the detail route
- save action wired to `PATCH /api/stylist/intakes/:id/review`

The queue still does not have URL-persisted filter state, but that is acceptable for this phase. The important change is that the stylist can now use the live runtime to review an intake instead of only reading it.

The appointment changes were:

- backend-backed status filter on the list
- client-side date and client filters on the list
- a real inline update form on the detail route
- save action wired to `PATCH /api/stylist/appointments/:id`

I also tightened invalidation in the stylist RTK Query layer so appointment updates now invalidate the specific affected client detail when the backend returns `client_id`. That matters because the stylist client detail screen already shows recent appointments and should not drift stale after an operational update.

One implementation choice worth noting is that the list-page filters are split intentionally:

- status filters go through the backend because the API already supports them
- priority, date, and client-name filters stay client-side for now because the backend contract does not yet expose those query parameters

That keeps this slice small and aligned with the current backend instead of inventing new API surface in the middle of frontend integration.

Validation in this slice was compile-level again:

- `npm --prefix web run typecheck`

I did not run the browser-backed stylist smoke in this pass because the local runtime shells were not up and I wanted to keep this slice focused on wiring and compile correctness. The next useful validation pass should be a real browser smoke against the seeded HAIR-006 backend data, specifically:

- open `/stylist/intakes`
- filter to `in_review`
- open one intake and save a review change
- open `/stylist/appointments`
- filter by status or client
- open one appointment and save note/status changes

The next pass was that real browser-backed stylist smoke.

This validation pass mattered because HAIR-007 had crossed the line from "frontend wiring compiles" to "the stylist can do real operational work through the browser." At that point, compile-only confidence was no longer enough. The route shell, auth flow, RTK invalidation, and backend aggregate shapes all had to survive real navigation with live seeded data.

The local smoke stack used:

- Keycloak on `127.0.0.1:18090`
- Postgres on `127.0.0.1:15432`
- Vite on `127.0.0.1:5175`
- the Go app on `127.0.0.1:8080` with `FRONTEND_DEV_PROXY_URL=http://127.0.0.1:5175`
- seeded stylist workflow fixtures from `./scripts/seed_stylist_workflows.sh`

The successful intake path was:

- open `/stylist`
- log in as `alice`
- navigate to `/stylist/intakes`
- filter to `status=in_review` and `priority=urgent`
- open Avery Moss intake `a36bb5f1-e22d-4a88-9a75-84af8fe40111`
- update the review to `approved_to_book`
- save successfully and verify the detail view reflected the new review state

The first appointment attempt exposed a real backend bug:

- navigate to `/stylist/appointments`
- filter to `status=pending` and client `Bianca`
- open appointment `ef5bb36a-d2bc-4a19-9cc0-57d2eaf70882`
- runtime error: "Failed to load the stylist appointment detail."

That failure turned out to be a HAIR-006 repository bug around nullable auth fields and linked intake UUID scans for locally seeded clients. Once that backend fix landed and the app server was restarted, the same route loaded correctly.

The successful appointment path after the backend fix was:

- reopen Bianca Reed appointment detail
- update status from `pending` to `confirmed`
- save stylist notes `Confirmed after stylist runtime smoke test.`
- verify the detail page reflected both the confirmed status and saved notes

The client-detail path then confirmed invalidation and cross-route consistency:

- navigate to `/stylist/clients`
- open Bianca Reed client detail `2dfed0aa-cd8f-4f78-85c9-15a574f3d202`
- verify recent appointments showed the freshly confirmed appointment state

This is the first point where HAIR-007 can credibly claim that the live stylist runtime is not just reading real data, but also performing real operational writes through the browser.

The remaining HAIR-007 work is now narrower and more structural:

- add a dedicated stylist view-model mapping layer instead of formatting directly in the workspace
- keep Storybook/demo fixtures fully isolated from runtime data paths
- add route/component coverage around the new stylist pages

The next slice addressed the first of those structural follow-ups: view-model mapping.

The runtime had already become functionally real, but `StylistWorkspace.tsx` was still doing too much interpretation of raw backend DTOs:

- date formatting
- fallback client-name decisions
- summary field assembly
- list-row meta string assembly
- form-default extraction

That is acceptable for a first wiring pass, but not for a maintainable runtime. If the renderer owns those decisions, every future UI variation risks reimplementing slightly different "display rules" for the same underlying data.

This slice moved that shaping work into `web/src/stylist/store/api/stylistView.ts`. The view layer now produces explicit runtime-facing models for:

- dashboard summary cards and appointment rows
- intake queue rows and intake detail summary blocks
- appointment list rows and appointment detail summary blocks
- client list rows and client detail sections
- review form defaults and appointment form defaults

The important boundary change is that `StylistWorkspace.tsx` now reads pre-shaped `view` objects instead of recomputing display labels from DTO fields inline. The page component still owns routing and interaction, but it no longer decides low-level display semantics for backend data.

This is a small structural step with two concrete benefits:

- future visual refactors can reuse one mapping layer instead of copying formatting logic between pages
- Storybook/demo surfaces and runtime surfaces now have a cleaner seam, because runtime display normalization is no longer hidden inside the page renderer

Validation for the slice was:

- `npm --prefix web run typecheck`

The only self-fix needed in the pass was a dashboard compile error after the mapper switch. The dashboard rows had been converted to generic row view models, but the page still referenced `appointment.status` instead of the mapped `badge` field. That was corrected immediately and typecheck then passed.

With this change in place, the remaining HAIR-007 work is more clearly bounded to:

- isolating or shrinking leftover demo/runtime slices
- adding page-level tests around the new route shell
