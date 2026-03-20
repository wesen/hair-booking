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
LastUpdated: 2026-03-20T18:45:00-04:00
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
