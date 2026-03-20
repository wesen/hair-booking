---
Title: Stylist Dashboard Smoke
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - stylist
    - dashboard
    - smoke-test
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/stylist/service.go
      Note: Dashboard aggregation logic
    - Path: pkg/stylist/postgres.go
      Note: Dashboard intake and appointment queries
    - Path: pkg/server/handlers_stylist_dashboard.go
      Note: `/api/stylist/dashboard` handler
ExternalSources: []
Summary: Manual smoke steps for verifying the stylist dashboard endpoint in local OIDC mode.
LastUpdated: 2026-03-20T11:15:00-04:00
WhatFor: Use this to verify the dashboard summary route after backend changes.
WhenToUse: Use after changing stylist dashboard queries, status counts, or appointment aggregation.
---

# Stylist Dashboard Smoke

The dashboard endpoint summarizes two things:

- intake triage counts
- today and upcoming appointments

Route:

```text
GET /api/stylist/dashboard
```

## Preconditions

- backend running in OIDC mode
- stylist allowlist includes `alice@example.com`
- browser authenticated as `alice`

## Request

From the browser console:

```js
fetch("/api/stylist/dashboard", { credentials: "include" }).then((response) => response.json())
```

## Expected result

- HTTP `200`
- `data.dashboard.intakes` includes:
  - `new_count`
  - `in_review_count`
  - `needs_client_reply_count`
  - `approved_to_book_count`
- `data.dashboard.today_appointments` is an integer
- `data.dashboard.today_schedule` is an array
- `data.dashboard.upcoming_appointments` is an array

## Notes From Initial Implementation

The first live smoke for the intake-review slice mattered here too: dashboard correctness depends on the same review-status normalization rules. Unreviewed submissions are treated as `new` through `coalesce(ir.status, 'new')`, so the dashboard counts and queue behavior stay aligned.
