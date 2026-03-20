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
LastUpdated: 2026-03-20T16:20:00-04:00
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
