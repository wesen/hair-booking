---
Title: Stylist Auth Smoke
Ticket: HAIR-006
Status: active
Topics:
    - backend
    - auth
    - smoke-test
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/auth/config.go
      Note: Stylist allowlist settings
    - Path: pkg/stylist/authorizer.go
      Note: Single-stylist authorization logic
    - Path: pkg/server/handlers_stylist.go
      Note: `/api/stylist/me` handler
ExternalSources: []
Summary: Manual smoke steps for verifying stylist authorization with the local Keycloak realm.
LastUpdated: 2026-03-20T10:55:00-04:00
WhatFor: Use this to replay the first stylist auth slice and verify the session-based stylist gate still works.
WhenToUse: Use after auth changes or whenever local OIDC styling access behaves unexpectedly.
---

# Stylist Auth Smoke

This playbook verifies the single-stylist authorization bootstrap. The local development realm seeds `alice@example.com`, and the backend allowlist maps that email to stylist access.

## Preconditions

- `make local-keycloak-up` is running
- the backend is running in OIDC mode
- the backend includes `HAIR_BOOKING_STYLIST_ALLOWED_EMAILS=alice@example.com`

Example backend command:

```bash
make run-local-oidc APP_PORT=8080 KEYCLOAK_PORT=18090 SESSION_SECRET=local-session-secret STYLIST_EMAILS=alice@example.com
```

## Unauthenticated check

Run:

```bash
curl -i -sS http://127.0.0.1:8080/api/stylist/me
```

Expected result:

- HTTP `401`
- error code `not-authenticated`

## Browser-authenticated check

1. Open `http://127.0.0.1:8080/auth/login?return_to=http://127.0.0.1:8080/`
2. Sign in as:
   - username: `alice`
   - password: `secret`
3. Wait for the browser to return to `http://127.0.0.1:8080/`
4. In the same browser session, request `/api/stylist/me`

Example from the browser console:

```js
fetch("/api/stylist/me", { credentials: "include" }).then(async (response) => ({
  status: response.status,
  body: await response.json(),
}))
```

Expected result:

- HTTP `200`
- `data.stylist.email == "alice@example.com"`
- `data.stylist.authMode == "oidc"`

## Automated validation

Run:

```bash
go test ./...
```

Relevant tests:

- `TestHandleStylistMeDevMode`
- `TestHandleStylistMeOIDCRequiresSession`
- `TestHandleStylistMeOIDCRejectsNonStylistUser`
- `TestHandleStylistMeOIDCAllowsConfiguredStylist`
- `TestAuthorizerIsAuthorizedDevMode`
- `TestAuthorizerIsAuthorizedConfiguredEmail`
- `TestAuthorizerIsAuthorizedConfiguredSubject`
- `TestAuthorizerIsAuthorizedRejectsUnknownOIDCUser`
