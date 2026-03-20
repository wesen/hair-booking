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
Summary: Short diary describing why HAIR-007 was created and what it is intended to replace.
LastUpdated: 2026-03-20T09:45:00-04:00
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
