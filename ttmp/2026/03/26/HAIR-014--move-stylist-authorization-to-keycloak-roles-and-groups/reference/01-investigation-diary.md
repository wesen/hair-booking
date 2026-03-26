---
Title: Investigation Diary
Ticket: HAIR-014
Status: active
Topics:
    - auth
    - keycloak
    - backend
    - oidc
DocType: reference
Intent: working
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go
      Note: Confirmed current app session shape does not include roles/groups.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go
      Note: Confirmed the app reads ID token claims only at callback time.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/stylist/authorizer.go
      Note: Confirmed current stylist access is env-allowlist based.
Summary: Step-by-step reasoning used to create the Keycloak role/group authorization migration guide for HAIR-014.
LastUpdated: 2026-03-26T12:50:00-04:00
WhatFor: Preserve the reasoning path so a future engineer can understand why role/group authorization should integrate with the existing app session flow rather than bypass it.
WhenToUse: Use when reviewing or continuing HAIR-014.
---

# Investigation Diary

## 2026-03-26

The user asked how Keycloak roles/groups would be communicated back to the app.
That triggered this ticket, because the answer depends on the app’s existing
session architecture rather than only on generic Keycloak behavior.

I started by reading the app’s current session and OIDC callback code:

```bash
sed -n '1,260p' pkg/auth/session.go
sed -n '1,320p' pkg/auth/oidc.go
sed -n '1,220p' pkg/stylist/authorizer.go
```

That established the critical baseline:

- the app does not call Keycloak on every request
- it reads claims once during `/auth/callback`
- it writes its own signed session cookie
- later authorization decisions only see `SessionClaims`
- `SessionClaims` currently has no roles/groups

That immediately answers the architectural question:

- if we want Keycloak-native stylist auth, the role/group data must be captured
  at login time and copied into the app session

I then checked official Keycloak docs to confirm the current token/mapping model.
The important points were:

- Keycloak supports realm roles and client roles in tokens
- Keycloak supports OIDC protocol mappers for role and group membership claims
- group membership mapping is available through the built-in group membership mapper

The practical design conclusion was:

- the app currently parses the ID token during login
- therefore role/group claims should be available in the ID token if we want the
  smallest app-side change

From there the implementation shape became clear:

1. extend `SessionClaims`
2. extend ID token claim parsing
3. update the stylist authorizer
4. configure Keycloak role/group objects and mappers
5. keep env allowlist fallback briefly during migration

I chose to recommend a “group grants realm role” shape rather than a
group-only shape:

- group `/stylists`
- realm role `stylist`
- app checks `stylist`

That is the best compromise because:

- operators can manage users by group
- the app can use a stable role check
- future auth logic stays simple

This ticket is analysis and implementation planning only. It does not change
runtime behavior yet.
