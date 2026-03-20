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
Summary: Detailed guide for adding the backend schema, authz, and API surface that makes the stylist workflow real.
LastUpdated: 2026-03-20T09:42:00-04:00
WhatFor: Use this guide to implement the missing stylist operations backend for the booking MVP.
WhenToUse: Use before or alongside the stylist frontend implementation.
---

# Stylist Backend Operations Guide

## Executive Summary

The current backend supports the client side of the booking workflow. It does not yet support the stylist side.

This ticket adds the missing operational layer:

- staff identity
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

### Staff Users

```yaml
staff_users:
  id: uuid PK
  auth_subject: text UNIQUE NOT NULL
  auth_issuer: text NOT NULL
  name: text NOT NULL
  email: text
  role: text NOT NULL
  is_active: bool default true
  created_at: timestamptz
  updated_at: timestamptz
```

Purpose:

- map authenticated Keycloak identities to staff capability

### Intake Reviews

```yaml
intake_reviews:
  id: uuid PK
  intake_id: uuid FK -> intake_submissions UNIQUE NOT NULL
  reviewer_id: uuid FK -> staff_users
  status: text NOT NULL
  priority: text NOT NULL
  summary: text
  internal_notes: text
  quoted_service_id: uuid FK -> services
  quoted_price_low: int
  quoted_price_high: int
  reviewed_at: timestamptz
  created_at: timestamptz
  updated_at: timestamptz
```

Suggested allowed `status` values:

- `new`
- `in_review`
- `needs_client_reply`
- `approved_to_book`
- `archived`

Suggested allowed `priority` values:

- `normal`
- `urgent`

### Optional Appointment Assignment

If assignment matters for MVP, add:

```yaml
appointments:
  stylist_id: uuid FK -> staff_users
```

If the MVP is truly single-stylist, this can be deferred.

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

The backend should not infer staff access from client identity. Add a dedicated staff bootstrap path.

Pseudocode:

```text
currentStaff(request):
  claims = current session claims
  if no claims:
    return unauthorized

  staff = find staff by issuer + subject
  if no staff or inactive:
    return forbidden

  return staff
```

## Package Design Recommendation

Recommended additions:

- `pkg/staff`
- `pkg/stylist`

Rationale:

- `pkg/staff` keeps identity/bootstrap/authz concerns separate
- `pkg/stylist` can own queue and aggregate views without bloating existing client/public packages

## Implementation Order

### Phase 1: Schema And Identity

- add migrations
- add seed data
- add staff bootstrap service
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

- service tests for staff auth and review rules
- repository tests for new joins and filters
- HTTP tests for auth failures and payload validation
- full `go test ./...`

## Acceptance Criteria

- stylist can authenticate as staff
- stylist can view new intakes
- stylist can open an intake and save review state
- stylist can list appointments and update operational notes
- stylist can search clients and load client context

## Intern Notes

- keep handlers thin
- prefer explicit aggregate DTOs rather than forcing the frontend to fan out multiple requests
- document all enum-like values in one place
