---
Title: Stylist Clients Smoke
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - stylist
    - clients
    - smoke-test
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/stylist/service.go
      Note: Stylist client aggregate DTOs and service methods
    - Path: pkg/stylist/postgres.go
      Note: Stylist client list/detail aggregate queries
    - Path: pkg/server/handlers_stylist_clients.go
      Note: Stylist client HTTP handlers
ExternalSources: []
Summary: Manual smoke steps for verifying stylist client list, search, and detail routes.
LastUpdated: 2026-03-20T12:15:00-04:00
WhatFor: Use this to replay the stylist client backend slice.
WhenToUse: Use after changing stylist client search, aggregate query, or maintenance-plan composition behavior.
---

# Stylist Client Smoke

Use this playbook after the local backend, Postgres, and Keycloak stack is running again. This validates the stylist client search and detail routes added in the client-aggregate slice of HAIR-006.

## Goal

Confirm that a stylist can:

- load the client list
- search by client name, email, or phone
- open a single client detail payload
- see appointment history, intake history, and maintenance items in one response

## Preconditions

- local Postgres is running and migrated
- local Keycloak is running on `127.0.0.1:18090`
- the Go backend is running on `127.0.0.1:8080`
- stylist allowlist includes `alice@example.com`
- browser session was created by logging in as `alice` / `secret`

## Browser Session Bootstrap

1. Open `http://127.0.0.1:8080/stylist`
2. Complete the OIDC login flow as `alice`
3. Confirm `http://127.0.0.1:8080/api/stylist/me` returns `200`

## Client List Checks

Open:

```text
http://127.0.0.1:8080/api/stylist/clients
```

Expect:

- `200 OK`
- response envelope contains `data.clients`
- each client row includes the operational aggregate fields:
  - `appointment_count`
  - `intake_count`
  - `last_appointment_date`
  - `last_review_status`

Search checks:

```text
http://127.0.0.1:8080/api/stylist/clients?search=alice
http://127.0.0.1:8080/api/stylist/clients?search=@example.com
http://127.0.0.1:8080/api/stylist/clients?search=555
```

Expect:

- name search matches client names
- email search matches client emails
- phone search matches phone fragments

## Client Detail Checks

Pick a client ID from the list response, then open:

```text
http://127.0.0.1:8080/api/stylist/clients/<client-id>
```

Expect:

- `200 OK`
- response envelope contains `data.client`
- `data.client.client` contains the canonical client profile
- `data.client.recent_appointments` is present, even if empty
- `data.client.recent_intakes` is present, even if empty
- `data.client.maintenance_items` is present, even if empty

Detail-specific checks:

- if the client has a future appointment, `upcoming_appointment` is populated
- recent intakes include nested `review.status`
- recent intakes include `photo_count`
- maintenance items include `service_name`, `due_date`, and `status`

## Error Checks

Open a missing ID:

```text
http://127.0.0.1:8080/api/stylist/clients/00000000-0000-0000-0000-000000000000
```

Expect:

- `404`
- error code `stylist-client-not-found`

Open an invalid ID:

```text
http://127.0.0.1:8080/api/stylist/clients/not-a-uuid
```

Expect:

- `400`
- error code `invalid-client-id`

## Notes For Future Runs

- This route family is pure read-only aggregate logic, so the highest-risk failures are query-shape regressions and null-scan bugs.
- If a browser smoke fails with `500`, inspect nullable paths first:
  - clients without intakes
  - clients without maintenance plans
  - clients without upcoming appointments
- Keep this playbook updated once the stylist frontend starts consuming the same payload.
