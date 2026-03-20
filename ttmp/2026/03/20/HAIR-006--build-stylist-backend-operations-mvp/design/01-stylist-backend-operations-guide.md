---
Title: Stylist Backend Operations Guide
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - mvp
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Source review identifying the missing stylist workflow backend
    - Path: pkg/db/migrations/0001_init.sql
      Note: Baseline schema to extend
    - Path: pkg/server/http.go
      Note: Route table to extend with stylist APIs
    - Path: pkg/clients/service.go
      Note: Existing authenticated identity bootstrap pattern
    - Path: pkg/appointments/service.go
      Note: Existing appointment domain logic to build upon
    - Path: pkg/intake/service.go
      Note: Existing intake logic and repository boundaries
ExternalSources: []
Summary: Detailed guide for adding the backend schema, authz, and API surface that makes the single-stylist workflow real.
LastUpdated: 2026-03-20T16:20:00-04:00
WhatFor: Use this guide to implement the missing stylist operations backend for the booking MVP.
WhenToUse: Use before or alongside the stylist frontend implementation.
---

# Stylist Backend Operations Guide

## Executive Summary

The current backend supports the client side of the booking workflow. It does not yet support the stylist side.

This ticket adds the missing operational layer:

- stylist identity
- stylist authorization
- intake review state
- stylist-facing dashboard and detail endpoints
- appointment operations for stylist notes and preparation
- client detail aggregation

## Problem Statement

Today the backend can answer:

- what services exist
- what intake did the client submit
- what appointment did the client book
- what can the client edit in the portal

But it cannot answer:

- what new work the stylist needs to review
- which intakes have already been reviewed
- what quote or notes the stylist attached
- which appointments need preparation or confirmation

That gap makes the current product unsuitable as a real stylist workflow tool.

## Proposed Data Model

### Single-Stylist Authorization

The MVP is single stylist. Do not add `staff_users` yet.

Instead:

- gate stylist routes with a dedicated Keycloak role or claim
- optionally expose the authenticated operator through `GET /api/stylist/me`
- keep the backend authorization layer simple enough that a future `staff_users` table can still be added later if the salon grows

### Intake Reviews

```yaml
intake_reviews:
  id: uuid PK
  intake_id: uuid FK -> intake_submissions UNIQUE NOT NULL
  status: text NOT NULL
  priority: text NOT NULL
  summary: text
  internal_notes: text
  quoted_price_low: int
  quoted_price_high: int
  reviewed_at: timestamptz
  created_at: timestamptz
  updated_at: timestamptz
```

`quoted_service_id` can be deferred unless the stylist UI actually needs to attach a normalized service recommendation in MVP. The simpler first slice is quote range plus review notes.

Suggested allowed `status` values:

- `new`
- `in_review`
- `needs_client_reply`
- `approved_to_book`
- `archived`

Suggested allowed `priority` values:

- `normal`
- `urgent`

### Appointment Ownership

Do not add `appointments.stylist_id` in MVP.

Reason:

- there is only one stylist
- assignment would be dead weight in the schema and handlers
- it can be added later in a forward-compatible migration if multi-stylist scheduling becomes real

## API Surface

Proposed routes:

```yaml
GET /api/stylist/me
GET /api/stylist/dashboard
GET /api/stylist/intakes
GET /api/stylist/intakes/:id
PATCH /api/stylist/intakes/:id/review
GET /api/stylist/appointments
GET /api/stylist/appointments/:id
PATCH /api/stylist/appointments/:id
GET /api/stylist/clients
GET /api/stylist/clients/:id
```

## Authorization Design

The backend should not infer stylist access from client identity. Add a dedicated stylist bootstrap path.

Pseudocode:

```text
currentStylist(request):
  claims = current session claims
  if no claims:
    return unauthorized

  if claims do not contain the required stylist capability:
    return forbidden

  return stylist session context
```

## Package Design Recommendation

Recommended additions:

- `pkg/stylist`

Rationale:

- `pkg/stylist` can own authorization helpers, queue logic, and aggregate views without bloating existing client/public packages
- a separate `pkg/staff` package is unnecessary until the product actually supports multiple operators

## Implementation Order

### Phase 1: Schema And Identity

- add migrations
- add seed data for review states
- add stylist bootstrap service
- add auth middleware

### Phase 2: Intake Review

- list endpoint
- detail endpoint
- review update endpoint
- tests

### Phase 3: Appointment Operations

- list endpoint
- detail endpoint
- update endpoint
- tests

### Phase 4: Client Operations

- list/search endpoint
- detail aggregate endpoint
- tests

## Testing Requirements

- service tests for stylist auth and review rules
- repository tests for new joins and filters
- HTTP tests for auth failures and payload validation
- full `go test ./...`

## Acceptance Criteria

- stylist can authenticate as stylist
- stylist can view new intakes
- stylist can open an intake and save review state
- stylist can list appointments and update operational notes
- stylist can search clients and load client context

## Intern Notes

- keep handlers thin
- prefer explicit aggregate DTOs rather than forcing the frontend to fan out multiple requests
- document all enum-like values in one place
