---
Title: Stylist Appointments Smoke
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - stylist
    - appointments
    - smoke-test
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/stylist/service.go
      Note: Stylist appointment list/detail/update service logic
    - Path: pkg/stylist/postgres.go
      Note: Stylist appointment queries
    - Path: pkg/server/handlers_stylist_appointments.go
      Note: Stylist appointment handlers
ExternalSources: []
Summary: Manual smoke steps for verifying stylist appointment list, detail, and update routes.
LastUpdated: 2026-03-20T11:20:00-04:00
WhatFor: Use this to replay the stylist appointment backend slice.
WhenToUse: Use after changing stylist appointment queries, detail aggregation, or update behavior.
---

# Stylist Appointments Smoke

Routes:

```text
GET /api/stylist/appointments
GET /api/stylist/appointments/:id
PATCH /api/stylist/appointments/:id
```

## Preconditions

- backend running in local OIDC mode
- browser authenticated as stylist
- at least one appointment exists

## List

```js
fetch("/api/stylist/appointments", { credentials: "include" }).then((response) => response.json())
```

Expected:

- HTTP `200`
- `data.appointments` is an array
- each row includes client name, service name, date, time, and status

## Detail

Pick an appointment ID from the list and run:

```js
fetch(`/api/stylist/appointments/${appointmentId}`, { credentials: "include" }).then((response) => response.json())
```

Expected:

- HTTP `200`
- `data.appointment.appointment` is populated
- `data.appointment.client` is populated
- `data.appointment.intake` is present when the appointment is linked to an intake

## Update

```js
fetch(`/api/stylist/appointments/${appointmentId}`, {
  method: "PATCH",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "confirmed",
    prep_notes: "Review patch smoke test prep notes",
    stylist_notes: "Review patch smoke test stylist notes"
  })
}).then((response) => response.json())
```

Expected:

- HTTP `200`
- returned appointment row includes:
  - `client_name`
  - `service_name`
  - updated `status`
  - updated `prep_notes`
  - updated `stylist_notes`

## Important Bug Caught During Initial Smoke

The first live patch smoke returned a technically successful `200`, but the response dropped `client_name` and `service_name`. The fix was to make the update path return the same enriched join shape as the list route instead of the bare `appointments` row alone.
