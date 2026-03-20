---
Title: Investigation Diary
Ticket: HAIR-008
Status: active
Topics:
    - photos
    - mvp
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-005--consolidate-app-shell-and-remove-non-mvp-client-flows/tasks.md
      Note: Source decision that photos remain in MVP but move out of shell cleanup
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Review context for what the MVP still needs
ExternalSources: []
Summary: Diary for the deferred MVP photo execution track.
LastUpdated: 2026-03-20T19:55:00-04:00
WhatFor: Use this to understand why photos were split into a dedicated follow-up ticket.
WhenToUse: Use while implementing or reviewing HAIR-008.
---

# Investigation Diary

## 2026-03-20

Photos were explicitly kept inside MVP scope, but they no longer belong inside HAIR-005.

That shell ticket needed to stay focused on:

- routing
- auth round-trips
- runtime scope cleanup
- hosting shape

Photo work touches both the client and stylist product areas, so it should follow the real stylist backend and frontend tickets rather than competing with them.

The first implementation slice for HAIR-008 resolved the main product ambiguity before adding more API surface.

Chosen MVP decisions:

- appointment photos are shown inside the appointment-history surface, not as a revived top-level portal tab
- appointment photo upload stays stylist-side for MVP
- photo URLs keep the current local/public model for MVP and stronger protection is deferred past this ticket

Those choices keep the scope tight. The stylist workflow is already the operational source of truth, and the portal only needs a clear read surface for the client.

With those decisions fixed, the first code slice focused on read usefulness rather than backend expansion.

The stylist intake detail view already returned intake photo metadata, but it only rendered slot labels and raw URLs. That was technically real, but not operationally useful. The slice changed the stylist runtime so intake photos render as actual image previews inside the live intake detail route.

On the portal side, the backend already returned appointment photos from `GET /api/me/appointments/:id`, but the UI did not use them. Instead of reviving the old mock `PortalPhotosPage`, the slice placed real appointment-photo rendering inside the portal appointments surface by loading appointment detail on demand for each past appointment card.

This is the right MVP shape:

- stylist sees intake photos where review actually happens
- client sees before/after appointment photos in appointment history
- no extra tab or duplicate timeline surface is needed yet

The frontend files changed in the slice were:

- `web/src/stylist/StylistWorkspace.tsx`
- `web/src/stylist/store/api/stylistView.ts`
- `web/src/stylist/components/PhotoTimelineEntry.tsx`
- `web/src/stylist/components/PortalAppointmentPhotoSection.tsx`
- `web/src/stylist/pages/PortalAppointmentsPage.tsx`

Validation for the slice:

- `npm --prefix web run typecheck`
- `npm --prefix web test`

The next HAIR-008 slice should move back to backend and booking quality work:

- audit and harden upload validation
- add the missing appointment-photo write path
- improve public booking photo-step retry and failure handling
