---
Title: Investigation Diary
Ticket: HAIR-009
Status: active
Topics:
    - cleanup
    - deploy
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-005--consolidate-app-shell-and-remove-non-mvp-client-flows/tasks.md
      Note: Source decision that production should embed React in Go
    - Path: ttmp/2026/03/20/HAIR-006--build-stylist-backend-operations-mvp/tasks.md
      Note: Cleanup intentionally deferred until stylist backend exists
    - Path: ttmp/2026/03/20/HAIR-007--build-stylist-frontend-operations-mvp/tasks.md
      Note: Cleanup intentionally deferred until stylist frontend exists
ExternalSources: []
Summary: Diary for the deferred post-stylist cleanup and embed track.
LastUpdated: 2026-03-20T18:45:00-04:00
WhatFor: Use this to understand why cleanup and embedding were split out of HAIR-005.
WhenToUse: Use while implementing or reviewing HAIR-009.
---

# Investigation Diary

## 2026-03-20

This ticket was created once the shell roadmap became clearer.

At that point three things were true:

- the shell and auth work in HAIR-005 had progressed enough to make the app coherent
- production hosting had a clear direction: embed React in Go
- large cleanup would be premature before HAIR-006 and HAIR-007 define the real stylist runtime shape

So the cleanup and embed work became its own late-stage execution ticket rather than a grab bag inside HAIR-005.
