---
Title: Investigation Diary
Ticket: HAIR-005
Status: active
Topics:
    - frontend
    - react
    - redux
    - mvp
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Source review for the shell cleanup stream
    - Path: web/src/main.tsx
      Note: Default runtime selection behavior that currently points at the wrong app surface
    - Path: pkg/auth/oidc.go
      Note: Auth callback redirect behavior to be cleaned up
ExternalSources: []
Summary: Short diary describing why HAIR-005 was created and what it is intended to fix.
LastUpdated: 2026-03-20T09:41:00-04:00
WhatFor: Use this diary to understand the motivation and boundary of the app-shell cleanup stream.
WhenToUse: Use while implementing or reviewing HAIR-005.
---

# Investigation Diary

## 2026-03-20

This ticket was split from HAIR-004 because shell-level confusion would otherwise contaminate every later feature.

The key review findings were:

- the app root opens the mock stylist runtime
- login success lands on the backend bootstrap page
- visible rewards and payment UI make the MVP story inaccurate

This ticket therefore exists to restore product coherence before deeper stylist execution work continues.
