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

An explicit execution constraint was added before implementation started:

- non-MVP screens should remain available in Storybook when they are still useful as design references
- those same screens should stop being visible in the runtime app shell and navigation

That constraint matters because it changes the implementation approach. This is not a delete-the-widgets ticket. It is a remove-them-from-runtime ticket.

### First Implementation Slice

The first code slice focused only on runtime entrypoint cleanup.

What changed:

- `web/src/main.tsx` no longer defaults to `StylistApp`
- the runtime now resolves by `window.location.pathname`
- `/` now resolves to the booking app
- `/booking`, `/portal`, and `/stylist` are treated as canonical top-level runtime paths
- legacy `?app=booking` and `?app=portal` links are rewritten to `/booking` and `/portal`

Why this came first:

- it is the smallest change that makes the product feel less misleading
- it does not require auth or backend changes yet
- it preserves the current internal page behavior while fixing the top-level shell

Validation for this slice:

```bash
npm --prefix web run typecheck
```
