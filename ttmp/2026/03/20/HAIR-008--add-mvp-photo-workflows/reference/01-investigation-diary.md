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
LastUpdated: 2026-03-20T14:04:00-04:00
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

The next slice landed on the backend and closed the main contract gap.

Before this change, the system had an asymmetry:

- intake photo upload already existed publicly
- portal and stylist read paths already returned photo metadata
- stylist appointment photo creation did not yet exist as a tested server contract

That meant the read side looked more complete than the write side. The backend also had a hidden runtime issue: the real HTTP server constructed the appointments service without a blob store, so the new upload path would have failed in a real database-backed process even if the handler existed.

This slice fixed the backend around one shared rule set instead of adding a second special-case upload path.

Changes in the slice:

- added `pkg/server/photo_upload.go` as a shared upload validator
- enforced the same image rules for public intake uploads and stylist appointment uploads
- added `POST /api/stylist/appointments/:id/photos`
- added appointment photo persistence in `pkg/appointments`
- fixed `NewHTTPServer` so database-backed appointment services receive the configured blob store

The shared validator now enforces:

- required file presence
- non-empty uploads
- 10 MB maximum size
- allowed mime types: JPEG, PNG, WebP

This is the right level for MVP. It is strict enough to reject obvious garbage and oversized uploads, but it does not try to solve future concerns like virus scanning or signed CDN delivery.

Validation for the slice:

- `go test ./...`
- `npm --prefix web run typecheck`

Manual verification instructions were also written down in:

- `ttmp/2026/03/20/HAIR-008--add-mvp-photo-workflows/playbooks/01-intake-and-appointment-photo-smoke.md`

That playbook is important because this ticket spans two product areas:

- public booking intake photos
- stylist appointment aftercare/result photos

The next HAIR-008 slice should return to frontend quality:

- improve booking photo-step retries and error states
- make the stylist runtime use the live appointment-photo write path
- run a real browser smoke for full photo capture and display

The follow-up slice closed the last major runtime gap for photos: the new upload endpoint is now actually usable from the stylist app.

The backend issue was subtle. `POST /api/stylist/appointments/:id/photos` existed, but the stylist appointment detail payload still did not include appointment photos. That meant the UI could upload, but it could not rehydrate from the backend after the fact without inventing another local state path.

This slice fixed that by extending the stylist appointment detail contract itself.

Backend changes:

- `pkg/stylist/service.go` now guarantees `AppointmentDetail.Photos`
- `pkg/stylist/postgres.go` now loads `appointment_photos` for stylist appointment detail reads
- `pkg/server/http_test.go` now proves the stylist appointment detail route includes photo metadata

Frontend changes:

- `web/src/stylist/store/api/types.ts` now models `photos` on stylist appointment detail responses
- `web/src/stylist/store/api/stylistApi.ts` now has an RTK Query mutation for stylist appointment photo upload
- `web/src/stylist/store/api/stylistView.ts` now maps appointment photos into runtime photo cards
- `web/src/stylist/StylistWorkspace.tsx` now shows existing before/after photos and allows new uploads directly from the appointment detail route

That makes the operational stylist loop coherent:

- open appointment
- see existing before/after media
- upload a new before/after photo
- let RTK Query invalidate and refetch the appointment detail

Validation for this slice:

- `go test ./...`
- `npm --prefix web run typecheck`
- `npm --prefix web test`

What still remains in HAIR-008 is narrower now:

- improve booking photo-step retries and failure copy
- run a real browser smoke of the stylist-side photo uploader
- decide whether to add thumbnails/previews before upload in the stylist workspace
