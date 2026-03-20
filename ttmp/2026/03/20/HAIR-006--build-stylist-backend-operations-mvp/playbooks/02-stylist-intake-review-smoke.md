---
Title: Stylist Intake Review Smoke
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - stylist
    - intake-review
    - smoke-test
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/stylist/service.go
      Note: Intake review service logic and validation
    - Path: pkg/stylist/postgres.go
      Note: Intake list/detail/review queries
    - Path: pkg/server/handlers_stylist_intakes.go
      Note: Stylist intake HTTP handlers
ExternalSources: []
Summary: Manual smoke steps for verifying the stylist intake queue, detail view, and review mutation in local OIDC mode.
LastUpdated: 2026-03-20T11:10:00-04:00
WhatFor: Use this to replay the first real stylist workflow API slice.
WhenToUse: Use after changing stylist intake queries, review validation, or handler wiring.
---

# Stylist Intake Review Smoke

This playbook verifies the first real stylist workflow API set:

- `GET /api/stylist/intakes`
- `GET /api/stylist/intakes/:id`
- `PATCH /api/stylist/intakes/:id/review`

## Preconditions

- local Postgres is running
- local Keycloak is running
- backend is running in OIDC mode with stylist allowlist configured
- at least one intake already exists in the database

Example backend command:

```bash
HAIR_BOOKING_DATABASE_URL="postgres://hair_booking:hair_booking@127.0.0.1:15432/hair_booking?sslmode=disable" \
make run-local-oidc \
  APP_PORT=8080 \
  KEYCLOAK_PORT=18090 \
  SESSION_SECRET=local-session-secret \
  FRONTEND_DEV_PROXY_URL=http://127.0.0.1:5175 \
  STYLIST_EMAILS=alice@example.com
```

## Login

1. Open `http://127.0.0.1:8080/auth/login?return_to=http://127.0.0.1:8080/`
2. Sign in as:
   - username: `alice`
   - password: `secret`

## Queue check

From the browser console:

```js
fetch("/api/stylist/intakes", { credentials: "include" }).then((response) => response.json())
```

Expected result:

- HTTP `200`
- `data.intakes` is an array
- each row includes `id`, `service_type`, `photo_count`, and `review`

## Detail check

Pick one intake ID from the queue result, then run:

```js
fetch(`/api/stylist/intakes/${intakeId}`, { credentials: "include" }).then((response) => response.json())
```

Expected result:

- HTTP `200`
- `data.intake.submission` is populated
- `data.intake.photos` includes uploaded intake photos when they exist
- `data.intake.review` defaults to `new` / `normal` when no review row exists yet

## Review mutation check

Run:

```js
fetch(`/api/stylist/intakes/${intakeId}/review`, {
  method: "PATCH",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "in_review",
    priority: "urgent",
    summary: "Photo set reviewed in smoke test",
    internal_notes: "Need client chemical-history follow-up",
    quoted_price_low: 1100,
    quoted_price_high: 1500
  })
}).then((response) => response.json())
```

Expected result:

- HTTP `200`
- `data.review.status == "in_review"`
- `data.review.priority == "urgent"`
- `data.review.reviewed_at` is present

Optional filter verification:

```js
fetch("/api/stylist/intakes?status=in_review", { credentials: "include" }).then((response) => response.json())
```

Expected result:

- HTTP `200`
- the updated intake appears in the filtered list

## Known trap from implementation

The first live smoke failed with a `500` because the query code treated left-joined client and review columns as always present. Public intakes can have no `clients` row and no `intake_reviews` row yet, so nullable joined values must be normalized before scanning into Go structs.
