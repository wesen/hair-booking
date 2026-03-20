---
Title: Investigation Diary
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - mvp
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Source review identifying the missing stylist backend
    - Path: pkg/server/http.go
      Note: Current route table showing absence of stylist APIs
    - Path: pkg/db/migrations/0001_init.sql
      Note: Current schema showing absence of stylist review state
ExternalSources: []
Summary: Short diary describing why HAIR-006 was created, and how the plan was simplified after confirming a single-stylist MVP.
LastUpdated: 2026-03-20T16:20:00-04:00
WhatFor: Use this diary to understand the purpose and scope of the stylist backend ticket.
WhenToUse: Use while implementing or reviewing HAIR-006.
---

# Investigation Diary

## 2026-03-20

This ticket was split from HAIR-004 because the backend currently stops at the client boundary. The stylist cannot yet perform operational work through the system.

The critical missing concepts are:

- stylist identity
- stylist authorization
- intake review state
- stylist-facing dashboard and detail endpoints

This ticket adds that missing backend layer without changing the core client booking flow.

Later the product direction was clarified: this is a single-stylist app for MVP. That removes the need for a `staff_users` table, reviewer assignment, and appointment-to-stylist assignment in the first backend slice.

The simplified backend target is:

- one protected stylist capability
- one review record per intake
- no per-appointment stylist ownership field
- no multi-staff routing or queue logic
