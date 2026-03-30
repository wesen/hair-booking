---
Title: MVP Photo Workflows Guide
Ticket: HAIR-008
Status: active
Topics:
    - frontend
    - backend
    - photos
    - mvp
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/intake/service.go
      Note: Intake photo upload behavior already exists on the backend
    - Path: pkg/server/handlers_public.go
      Note: Public intake photo upload route
    - Path: pkg/server/handlers_portal.go
      Note: Portal appointment and maintenance handlers to extend with photo work
    - Path: web/src/stylist/pages/PhotosPage.tsx
      Note: Current booking photo step
    - Path: web/src/stylist/components/PhotoBox.tsx
      Note: Current upload widget
    - Path: web/src/stylist/pages/PortalAppointmentsPage.tsx
      Note: Current portal surface that may need photo entrypoints
    - Path: web/src/stylist/store/api/bookingApi.ts
      Note: Booking photo endpoint wiring
ExternalSources: []
Summary: Detailed implementation guide for making photo capture, review, and viewing real MVP workflows.
LastUpdated: 2026-03-20T18:45:00-04:00
WhatFor: Use this guide to finish the photo-related product scope after the stylist core is in place.
WhenToUse: Use after HAIR-006 and HAIR-007 when the stylist app has a real queue and appointment detail flow.
---

# MVP Photo Workflows Guide

## Executive Summary

Photos remain in the MVP because they are operationally important:

- clients need to provide intake photos
- the stylist needs to review those photos while evaluating an intake
- appointment-level before and after photos are valuable for both the stylist workflow and the client timeline

This ticket exists because those workflows should be completed deliberately, not as leftovers inside shell work.

## Product Goal

The finished MVP should support three photo use cases:

1. public intake photos
2. stylist review of intake photos
3. client-visible appointment photos where appropriate

## Scope

### In Scope

- intake photo reliability and validation
- stylist-side viewing of intake photos
- appointment photo upload and read flows
- client portal photo timeline if still part of final MVP UX
- storage key and URL handling review
- smoke test coverage for photo flows

### Out Of Scope

- AI image analysis
- automatic transformations
- external media DAM integrations
- heavy moderation pipelines

## Key Questions To Resolve Up Front

- Are portal photos a dedicated tab again, or a sub-section inside appointments?
- Should clients upload appointment photos, or only the stylist?
- Are photo URLs public for MVP local dev only, or should the backend start protecting them now?

## Recommended Backend Work

### Intake photos

Existing pieces already exist:

- `POST /api/intake/:id/photos`
- `intake_photos`
- local blob storage

The follow-up backend work is mostly quality work:

- validate allowed slots and mime types
- cap file sizes
- normalize error messages
- ensure detail/read APIs return the correct photos for stylist review

### Appointment photos

The schema already includes:

- `appointment_photos`

What likely still needs work:

- create or finish `POST /api/me/photos`
- decide whether stylist routes get their own photo upload endpoint
- return appointment photos inside portal and stylist detail responses

## Recommended Frontend Work

### Booking flow

The booking flow already uploads intake photos.

Verify and improve:

- clearer upload failure UI
- retry behavior
- explicit required-slot feedback
- persistent display of uploaded state after intake creation

### Stylist workflow

Once HAIR-007 is in place, the stylist intake detail view should show:

- all submitted intake photos
- slot labels
- large preview interaction

That is the first operationally critical photo view.

### Portal workflow

Decide the least noisy MVP shape.

Recommended default:

- do not restore a top-level `Photos` tab unless the final product really needs it
- instead, show before/after photos inside appointment detail and optionally in a lightweight timeline section on portal home

## Implementation Order

### Phase 1

- confirm product UX for client and stylist photo visibility
- audit existing backend photo routes and DTOs

### Phase 2

- complete backend reads and writes for appointment photos
- add tests

### Phase 3

- wire stylist intake detail photo display
- wire portal appointment photo display

### Phase 4

- add smoke steps and regression notes

## Pseudocode

```text
showPhotoSection(viewer, context):
  if context == "intake-review":
    return intake photos
  if context == "appointment-detail":
    return before/after appointment photos
  return empty state
```

```text
uploadPhoto(file, slot, owner):
  validate mime
  validate size
  store blob
  save db row
  return normalized url + metadata
```

## Acceptance Criteria

- intake photos remain stable end-to-end
- stylist can review intake photos inside the real intake detail flow
- appointment photos can be created and read through real APIs
- the chosen portal photo UX is live and not mock-backed
