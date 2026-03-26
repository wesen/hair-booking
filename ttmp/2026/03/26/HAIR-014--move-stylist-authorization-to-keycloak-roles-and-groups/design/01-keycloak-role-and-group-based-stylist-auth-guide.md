---
Title: Keycloak Role and Group Based Stylist Auth Guide
Ticket: HAIR-014
Status: active
Topics:
    - auth
    - keycloak
    - backend
    - oidc
    - ops
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go
      Note: Current signed session format; this is where role/group claims would be stored after login.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go
      Note: Current OIDC callback flow that verifies the ID token and writes the app session.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/stylist/authorizer.go
      Note: Current stylist authorization logic based on allowed emails and subjects.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go
      Note: Current env-driven allowlist configuration shape.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_stylist.go
      Note: Stylist routes depend on the stylist authorizer.
ExternalSources:
    - https://www.keycloak.org/docs/latest/server_admin/
    - https://www.keycloak.org/docs/latest/securing_apps/
    - https://www.keycloak.org/docs-api/latest/javadocs/org/keycloak/protocol/oidc/mappers/package-summary.html
Summary: Detailed intern-facing guide for migrating hair-booking from app-env stylist allowlists to Keycloak-native roles or groups conveyed through OIDC claims and stored in the app session.
LastUpdated: 2026-03-26T12:50:00-04:00
WhatFor: Use this guide to understand the current auth architecture and implement role/group-based stylist authorization without breaking existing sessions.
WhenToUse: Use before touching Keycloak protocol mappers, OIDC session parsing, or stylist authorization logic.
---

# Keycloak Role and Group Based Stylist Auth Guide

## Executive Summary

Right now, `hair-booking` does not use Keycloak roles or groups to decide who is
allowed into the stylist workspace. It uses application env allowlists:

- `HAIR_BOOKING_STYLIST_ALLOWED_EMAILS`
- `HAIR_BOOKING_STYLIST_ALLOWED_SUBJECTS`

That logic lives in:

- [authorizer.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/stylist/authorizer.go)

This works, but it is not the right long-term auth model. It has several
problems:

- it requires app env edits and redeploys for every new stylist
- it duplicates identity-management logic that Keycloak should own
- it makes access control harder to audit
- it is brittle when users change emails or brokered identities

The right model is:

1. define stylist/admin access in Keycloak
2. include the relevant roles or group memberships in token claims
3. read those claims at the OIDC callback
4. persist the relevant auth claims in the app session cookie
5. authorize stylist routes based on those claims

That keeps identity and authorization close to the identity provider, while
still fitting the app’s existing signed-cookie session model.

## The Current Auth Architecture

### High-level flow

`hair-booking` uses hosted Keycloak as an OIDC identity provider. The app does
not introspect tokens on every request. Instead, it performs OIDC login once and
then writes its own signed session cookie.

The current flow is:

```text
browser
  -> /auth/login
  -> Keycloak login
  -> /auth/callback
  -> verify ID token
  -> write signed app session cookie
  -> later requests use app session only
```

The key backend files are:

- [oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go)
- [session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go)

### What the session stores today

The app session claims struct is:

- [SessionClaims in session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go)

Current fields:

- `Issuer`
- `Subject`
- `Email`
- `EmailVerified`
- `PreferredUsername`
- `DisplayName`
- `Picture`
- `Scopes`
- `IssuedAt`
- `ExpiresAt`

What is missing:

- realm roles
- client roles
- group membership

That means the app has no built-in way today to decide:

- “is this user a stylist?”
- “is this user an admin?”

from Keycloak-native authorization metadata.

### How stylist access works today

The current stylist gate is in:

- [authorizer.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/stylist/authorizer.go)

It authorizes:

- any user in dev auth mode
- or any user whose session email is in `StylistAllowedEmails`
- or any user whose session subject is in `StylistAllowedSubjects`

So the current logic is:

```text
if dev mode:
  allow
else if session.email in env allowlist:
  allow
else if session.subject in env allowlist:
  allow
else:
  deny
```

That is a good bootstrap mechanism, but not a good long-term operator model.

## How Keycloak Can Communicate Roles And Groups To The App

### The important concept

Keycloak does not “push” authorization to the app through a separate API. It
puts authorization information into token claims.

The app then reads those claims during login and stores the relevant parts in
its own session.

So the real communication chain is:

```text
Keycloak roles/groups
  -> token claims
  -> app OIDC callback parses claims
  -> app session cookie stores claims
  -> authorizer checks session claims
```

### Roles in Keycloak

Keycloak supports:

- realm roles
- client roles

The official docs describe role mappings and token role mappings in the Server
Administration Guide:

- https://www.keycloak.org/docs/latest/server_admin/

In normal Keycloak OIDC tokens, roles commonly appear in structures like:

```json
{
  "realm_access": {
    "roles": ["offline_access", "stylist"]
  },
  "resource_access": {
    "hair-booking-web": {
      "roles": ["portal-user"]
    }
  }
}
```

### Groups in Keycloak

Keycloak can also include group membership in tokens through a protocol mapper.
The current Keycloak docs API includes a built-in OIDC group membership mapper:

- https://www.keycloak.org/docs-api/latest/javadocs/org/keycloak/protocol/oidc/mappers/package-summary.html

This means Keycloak can emit a claim like:

```json
{
  "groups": ["/stylists", "/admins"]
}
```

### Why protocol mappers matter

The token does not automatically contain every possible role/group claim in the
shape your app wants. Keycloak uses protocol mappers to decide which claims get
added to which tokens:

- ID token
- access token
- userinfo response

For `hair-booking`, the current app callback uses the ID token flow, so if we
want role/group claims at login time without an extra userinfo round-trip, those
claims should be available in the ID token.

That is an important design choice.

## Recommended Authorization Model For Hair-Booking

### Best first version

For this app, I recommend using a dedicated realm role or client role for
stylist access, not groups alone.

Best first version:

- create Keycloak role `stylist`
- optionally create `admin` later if needed
- optionally keep groups for UI/admin convenience
- make the app authorize based on roles first

Why roles first:

- easier to reason about in code
- clearer permission semantics
- avoids overloading groups as both org structure and access control
- simpler migration from current allowlists

A good hybrid design is:

- Keycloak group `/stylists`
- group members inherit realm role `stylist`
- app only checks for `stylist` role

This gives operators easy group management in Keycloak while keeping the app
authorization contract stable.

### Realm role vs client role

You could use either:

- realm role: `stylist`
- client role: `hair-booking-web:stylist`

My recommendation for `hair-booking`:

- use a realm role for stylist access first

Reason:

- simpler token parsing
- no client-specific authorization branching in early code
- easier to discuss with non-auth specialists

If the app later splits into multiple services, client roles may become more
useful.

## Proposed App Changes

### 1. Extend session claims

Add fields to [session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go):

```go
type SessionClaims struct {
    ...
    RealmRoles  []string            `json:"realm_roles,omitempty"`
    ClientRoles map[string][]string `json:"client_roles,omitempty"`
    Groups      []string            `json:"groups,omitempty"`
}
```

Why:

- later requests only have access to the signed app session
- the stylist authorizer needs role/group data there

### 2. Extend ID token parsing

In [oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go), extend the token claim struct.

Conceptual pseudocode:

```go
type idTokenClaims struct {
    jwt.Claims
    Email string `json:"email,omitempty"`
    ...
    RealmAccess struct {
        Roles []string `json:"roles,omitempty"`
    } `json:"realm_access,omitempty"`
    ResourceAccess map[string]struct{
        Roles []string `json:"roles,omitempty"`
    } `json:"resource_access,omitempty"`
    Groups []string `json:"groups,omitempty"`
}
```

Then write those into `SessionClaims`.

### 3. Update authorizer

Replace env allowlist checks in [authorizer.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/stylist/authorizer.go) with role/group checks.

Recommended authorization order:

```text
if dev mode:
  allow
if session has realm role "stylist":
  allow
if session has group "/stylists":
  allow
optional temporary fallback:
  allow old env allowlists during migration
else:
  deny
```

### 4. Keep a migration fallback briefly

Because the app is already live, the safest migration shape is:

1. add role/group claims support
2. keep current env allowlists working temporarily
3. assign real Keycloak role/group to known stylists
4. verify hosted `/stylist`
5. remove env allowlist dependence later

That is safer than a flag-day cutover.

## Proposed Keycloak Changes

### Role/group model

Recommended initial Keycloak objects:

- realm role: `stylist`
- optional realm role: `admin`
- group: `/stylists`
- group: `/admins` later if needed

Recommended relationship:

- group `/stylists` grants realm role `stylist`

Then operators only add/remove users from `/stylists`, and the app consumes the
role claim.

### Protocol mapper configuration

At minimum, ensure:

- realm role claims are present in ID token or another claim source the app will use
- if groups are used for fallback or UI, add group membership mapper to ID token

Important practical note:

If the app only parses the ID token at callback time, and the claims are only in
the access token, the app will not see them unless we add extra code to inspect
the access token or call userinfo.

So the simplest implementation is:

- include relevant role/group claims in the ID token

## Why Not Query Keycloak On Every Request

An intern may reasonably ask:

- “Why not just ask Keycloak if the user is a stylist each time?”

Answer:

- this app already uses a signed app session cookie
- checking Keycloak on every request adds latency and operational coupling
- the current architecture is intentionally stateless from the app’s point of view
- the correct place to capture identity attributes is the login callback

The app only needs enough role/group information to make local decisions later.

## Recommended Implementation Phases

### Phase 1: app-side support

- add role/group fields to session claims
- add claim parsing in OIDC callback
- add tests for parsing and session round-trip

### Phase 2: Keycloak realm setup

- create `stylist` role
- create `/stylists` group
- grant role through group
- configure protocol mappers so role/group data is available where the app reads it

### Phase 3: hybrid migration

- update `Authorizer` to prefer roles/groups
- keep env allowlist fallback temporarily
- assign real stylists in Keycloak
- verify hosted `/stylist`

### Phase 4: cleanup

- remove or de-emphasize env allowlist config
- update docs and operator playbooks
- optionally add `admin` role path

## Testing Plan

### Unit tests

Add tests for:

- parsing realm roles from ID token
- parsing group membership from ID token
- writing/reading session cookie with roles/groups
- stylist authorizer allowing a `stylist` role
- stylist authorizer denying a plain portal user

### Hosted smoke tests

Test these cases:

1. non-stylist user
   - `/stylist` should redirect to `/portal`
2. user in `/stylists`
   - `/stylist` should load workspace
3. user removed from `/stylists`
   - next fresh login should lose stylist access
4. brokered login user in `/stylists`
   - role/group behavior should match local-password user

## Risks And Sharp Edges

### Token shape mismatch

If Keycloak does not emit roles/groups in the token the app actually reads, the
app will silently keep behaving like a non-role-aware system.

### Stale sessions

If a user loses stylist access in Keycloak, their existing signed app session
may still contain the old claims until re-login.

Mitigations:

- accept this for MVP
- document it
- optionally shorten session lifetime later

### Group path formatting

Group membership claims may come through as:

- `/stylists`
- nested paths like `/operators/stylists`

The app should normalize exactly what it expects.

## Recommended Concrete Decision

For `hair-booking`, the cleanest first implementation is:

- Keycloak group `/stylists`
- group grants realm role `stylist`
- app stores:
  - `RealmRoles`
  - `Groups`
- app authorizes using:
  - `RealmRoles` contains `stylist`
- temporary env allowlist fallback kept during migration only

That gives:

- operator-friendly Keycloak management
- simple app authorization logic
- a migration path that does not break current hosted stylists

## Architecture Diagram

```text
Keycloak realm hair-booking
  -> user belongs to /stylists
  -> user gets realm role stylist
  -> token contains role/group claims

OIDC callback in hair-booking
  -> verify ID token
  -> extract subject/email/name/roles/groups
  -> write signed session cookie

Later app request to /stylist
  -> read session cookie
  -> stylist authorizer checks role/group
  -> allow or redirect
```

## Recommended Tasks For The Next Engineer

- Add role/group fields to `SessionClaims`.
- Extend `idTokenClaims` parsing in `oidc.go`.
- Add unit tests for session and authorizer behavior.
- Configure Keycloak `stylist` role and `/stylists` group.
- Ensure role/group claims are visible to the app’s login callback.
- Migrate one hosted stylist user from env allowlist to Keycloak role/group.
- Verify hosted `/stylist` access for both stylist and non-stylist users.
