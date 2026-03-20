---
Title: Keycloak login bootstrap architecture and implementation guide
Ticket: HB-001-KEYCLOAK-LOGIN
Status: active
Topics:
    - backend
    - frontend
    - infrastructure
    - config
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../../../../code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md
      Note: Reference issuer and deployment pattern from smailnail
    - Path: README.md
      Note: Local and Coolify-facing startup guidance
    - Path: cmd/hair-booking/cmds/serve.go
      Note: Serve command schema and runtime
    - Path: cmd/hair-booking/main.go
      Note: Root Cobra and Glazed bootstrap
    - Path: dev/keycloak/realm-import/hair-booking-dev-realm.json
      Note: Local realm import with hair-booking client and test user
    - Path: docker-compose.local.yml
      Note: Standalone local Keycloak stack for this repo
    - Path: pkg/auth/config.go
      Note: Auth settings schema and validation
    - Path: pkg/auth/oidc.go
      Note: OIDC login
    - Path: pkg/auth/session.go
      Note: Signed cookie session design
    - Path: pkg/server/http.go
      Note: Route surface and handler wiring
    - Path: pkg/web/public/index.html
      Note: Bootstrap UI and auth entrypoint
    - Path: pkg/web/public/static/app.js
      Note: Frontend auth-state fetch logic
ExternalSources: []
Summary: ""
LastUpdated: 2026-03-19T21:17:42.417237918-04:00
WhatFor: Understand and extend the hair-booking Keycloak login bootstrap.
WhenToUse: Use when onboarding to the project, wiring Coolify/Keycloak settings, or replacing the placeholder UI with React.
---



# Keycloak Login Bootstrap Architecture And Implementation Guide

## Executive summary

`hair-booking` is now a real Go application instead of an untouched template. It exposes a Glazed/Cobra CLI, starts an HTTP server with `hair-booking serve`, implements an authorization-code OIDC login against Keycloak, signs an HTTP-only browser session cookie, and serves a minimal website that proves the login flow end to end.

The most important architectural decision is that this app reuses the same Keycloak/OIDC model as `smailnail`, but not `smailnail`'s full persistence layer. `smailnail` resolves `(issuer, subject)` into an internal database-backed identity; `hair-booking` keeps the first version narrower and stores the authenticated identity directly in a signed cookie. That means the login contract is already suitable for a future React frontend, while the backend remains small enough for an intern to understand in one reading session. The repo now also carries its own standalone local Keycloak stack and realm import for auth testing.

## Problem statement and scope

The user asked for a website that logs in through Keycloak hosted on Coolify, using the same Keycloak deployment as `smailnail`, but with the implementation done in Go and surfaced as a Glazed command. The user also asked for a detailed project ticket, an implementation diary, and a design/implementation guide that explains the moving parts to a new intern.

In scope:

1. Rename the fresh template into a real `hair-booking` module and binary.
2. Add a `serve` command using Glazed/Cobra patterns.
3. Implement browser OIDC login through Keycloak.
4. Serve a minimal website proving `/auth/login`, `/auth/callback`, `/auth/logout`, and `/api/me`.
5. Make the auth contract suitable for a later React frontend.
6. Document the design, implementation, and operational setup in a `docmgr` ticket.

Out of scope for this first cut:

1. A React/Vite frontend.
2. Database-backed user/session storage.
3. Domain-specific hair booking business features.
4. Production deployment manifests for Coolify itself.

## Terms and mental model

Before reading the code, a new engineer should keep these terms straight:

- `OIDC issuer`: the Keycloak realm base URL, for example `http://127.0.0.1:18080/realms/smailnail-dev` locally.
- `OIDC client`: the Keycloak application registration for this app. Reusing the same realm does not require reusing the same client ID/secret.
- `authorization-code flow`: the browser is redirected to Keycloak, Keycloak redirects back with a `code`, and the server exchanges that code for tokens.
- `id_token`: the signed token that proves the user identity. The backend verifies it against the issuer JWKS.
- `session cookie`: the backend-owned browser cookie used after login. In `hair-booking`, it is signed with HMAC and contains the claims needed by `/api/me`.

## Current-state analysis

### What the repository looked like before implementation

The repo started as a nearly empty project template. The module path was still `github.com/go-go-golems/XXX`, the only entrypoint was `cmd/XXX/main.go`, and the README was pure template filler. There was no auth implementation, no server, no UI, and no ticket docs. Evidence:

- Module placeholder: [go.mod](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/go.mod)
- Placeholder root command entrypoint replaced by the new binary: [cmd/hair-booking/main.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/main.go#L1)
- Updated quick-start instructions: [README.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md#L1)

### What `smailnail` already established

`smailnail` already had the identity and route contract that this app was supposed to follow:

1. It starts OIDC login from `/auth/login`, receives the callback on `/auth/callback`, and exposes the current authenticated user on `/api/me` ([http.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/http.go#L164)).
2. Its auth settings are expressed as Glazed fields such as `auth-mode`, `oidc-issuer-url`, `oidc-client-id`, `oidc-client-secret`, and `oidc-redirect-url` ([config.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/auth/config.go#L20)).
3. Its playbook documents the local issuer and the shape of the local OIDC launch command ([shared-oidc-playbook.md](/home/manuel/code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md#L24), [shared-oidc-playbook.md](/home/manuel/code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md#L36)).
4. Its OIDC callback verifies `state`, `nonce`, exchanges the code, validates the `id_token`, and then creates the browser session ([oidc.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/auth/oidc.go#L175)).

### What `hair-booking` kept and what it simplified

Kept from the `smailnail` model:

1. The same auth flag names.
2. The same `/auth/login`, `/auth/callback`, `/auth/logout`, and `/api/me` routes.
3. The same discovery + JWKS verification strategy.
4. The same local issuer assumptions for the `smailnail-dev` realm.

Simplified in `hair-booking`:

1. No application database.
2. No identity provisioning layer.
3. No server-side session table.
4. No MCP, account storage, or business APIs yet.

That simplification is intentional. It gives the future React app a stable auth contract now, without forcing the project to commit to database schema or domain logic too early.

## Proposed architecture

### High-level structure

```text
+-------------------+      GET /auth/login       +----------------------------+
| Browser           | -------------------------> | hair-booking HTTP server   |
| index.html/app.js |                            | OIDCAuthenticator          |
+---------+---------+                            +-------------+--------------+
          ^                                                    |
          |                                                    | 302 redirect
          |                                                    v
          |                                        +--------------------------+
          |                                        | Keycloak realm           |
          |                                        | same deployment as       |
          |                                        | smailnail               |
          |                                        +------------+-------------+
          |                                                     |
          |   GET /auth/callback?code=...&state=...             |
          +-----------------------------------------------------+
                                                                |
                                                                v
                                      exchange code, verify id_token, sign session cookie
                                                                |
                                                                v
                                     Browser calls GET /api/me with cookie included
```

### Component map

1. CLI bootstrap: [cmd/hair-booking/main.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/main.go#L14)
2. `serve` command definition and runtime: [cmds/serve.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go#L24)
3. Auth config schema and validation: [pkg/auth/config.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go#L20)
4. Signed session cookies: [pkg/auth/session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go#L35)
5. OIDC login flow and `id_token` verification: [pkg/auth/oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go#L51)
6. HTTP server and routes: [pkg/server/http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go#L17)
7. Embedded frontend assets: [pkg/web/assets.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/assets.go#L8), [index.html](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/index.html#L16), [app.js](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/static/app.js#L34)

## Detailed component walkthrough

### 1. CLI bootstrap

The root binary is deliberately thin. It does three things:

1. Creates the Cobra root command.
2. Adds the standard logging section from Glazed.
3. Builds the `serve` command from a Glazed command description.

That wiring lives in [cmd/hair-booking/main.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/main.go#L23). The design goal is that future commands can be added without rewriting the root bootstrap.

### 2. `serve` command

The `ServeCommand` is the operational entrypoint. It defines:

- the bind host and port in the default section,
- the auth section from `pkg/auth/config.go`,
- the standard Glazed command settings section for debugging and inspection.

See [cmd/hair-booking/cmds/serve.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go#L36). The runtime path is:

1. decode `listen-host` and `listen-port`,
2. decode/validate auth settings,
3. build the HTTP server,
4. attach graceful shutdown to SIGINT/SIGTERM,
5. start `ListenAndServe`.

Pseudocode:

```go
func Run(ctx, parsedValues) error {
    serveSettings := decode(default section)
    authSettings := decode(auth section)
    server := server.NewHTTPServer(serveSettings, authSettings)
    install signal-based shutdown
    return server.ListenAndServe()
}
```

### 3. Auth settings schema

The auth package exposes a Glazed section so the command-line surface stays explicit and typed. The section adds these fields:

- `auth-mode`
- `auth-dev-user-id`
- `auth-session-cookie-name`
- `auth-session-secret`
- `oidc-issuer-url`
- `oidc-client-id`
- `oidc-client-secret`
- `oidc-redirect-url`
- `oidc-scopes`

Evidence: [pkg/auth/config.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go#L46).

Two implementation details matter:

1. The defaults can come from environment variables, which is important for Coolify.
2. `LoadSettingsFromParsedValues` enforces that `auth-session-secret`, issuer, client ID, and redirect URL are present in `auth-mode=oidc` ([pkg/auth/config.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go#L110)).

### 4. Session manager

The session manager is the main simplification relative to `smailnail`. Instead of storing a session row in a database, it serializes claims into JSON, base64url-encodes the payload, signs it with HMAC-SHA256, and stores the result in an HTTP-only cookie.

Evidence: [pkg/auth/session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go#L161).

Important behavior:

1. Cookie `Secure` is inferred from request TLS, `X-Forwarded-Proto`, or the redirect URL scheme ([pkg/auth/session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go#L145)).
2. Cookies are `HttpOnly` and `SameSite=Lax` ([pkg/auth/session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go#L75)).
3. Session tampering is rejected by signature verification ([pkg/auth/session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go#L173)).

Session pseudocode:

```text
payload := json.Marshal(claims)
payloadB64 := base64url(payload)
sig := HMAC_SHA256(secret, payloadB64)
cookie := payloadB64 + "." + base64url(sig)
```

Read path pseudocode:

```text
split cookie into payload and signature
recompute HMAC over payload
constant-time compare signatures
decode JSON payload
reject expired sessions
```

### 5. OIDC authenticator

The authenticator is intentionally close to the `smailnail` reference. It:

1. fetches the OIDC discovery document at startup,
2. configures OAuth endpoints from that document,
3. starts login by creating `state` and `nonce`,
4. exchanges the callback `code` for tokens,
5. verifies the `id_token` against the issuer JWKS,
6. writes a signed browser session cookie,
7. optionally redirects logout through Keycloak's end-session endpoint.

Evidence:

- discovery/bootstrap: [pkg/auth/oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go#L71)
- login route behavior: [pkg/auth/oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go#L136)
- callback exchange and session creation: [pkg/auth/oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go#L156)
- token verification: [pkg/auth/oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go#L268)

Comparison to `smailnail`:

- `smailnail` verifies the same token shape and state/nonce protections ([smailnail oidc.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/auth/oidc.go#L175)).
- `smailnail` then provisions a user and stores a session row.
- `hair-booking` stops earlier and stores only the verified identity claims in the cookie.

That is the right cut for a bootstrap project because it preserves security-critical OIDC steps without forcing premature identity-domain design.

### 6. HTTP server and routes

The server package decides whether to instantiate OIDC support at startup. In `auth-mode=oidc`, it builds both a `SessionManager` and an `OIDCAuthenticator`; in `auth-mode=dev`, it skips them and synthesizes a local user for `/api/me` ([pkg/server/http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go#L65)).

The route surface is:

1. `GET /healthz`
2. `GET /api/info`
3. `GET /api/me`
4. `GET /auth/login`
5. `GET /auth/callback`
6. `GET /auth/logout`
7. `GET /static/*`
8. `GET /` plus SPA fallback

See [pkg/server/http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go#L125).

The SPA/static logic mirrors `smailnail`'s idea that API routes must win over frontend routes; `smailnail` does this by registering the SPA last ([smailnail http.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/http.go#L141)), while `hair-booking` does it by explicitly refusing `/api/` and `/auth/` in the catch-all handler ([pkg/server/http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go#L204)).

### 7. Embedded frontend assets

The frontend is intentionally small:

1. `index.html` renders the landing page and the auth action buttons ([index.html](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/index.html#L16)).
2. `app.js` fetches `/api/info` and `/api/me`, then toggles between authenticated and logged-out states ([app.js](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/static/app.js#L34)).
3. `assets.go` embeds everything into the Go binary ([assets.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/assets.go#L8)).

This setup is intentionally compatible with a future React migration:

- the route contract already exists,
- the browser already relies on cookie-based auth,
- the UI can later be replaced without changing the backend auth mechanics.

## API reference

### `GET /api/info`

Purpose: return runtime metadata so the UI and operators know which auth mode is active.

Implementation: [pkg/server/http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go#L142)

Example response:

```json
{
  "data": {
    "service": "hair-booking",
    "version": "dev",
    "startedAt": "2026-03-19T21:00:00Z",
    "authMode": "oidc",
    "issuerUrl": "https://auth.example.com/realms/smailnail",
    "clientId": "hair-booking-web",
    "loginPath": "/auth/login",
    "logoutPath": "/auth/logout",
    "callbackPath": "/auth/callback"
  }
}
```

### `GET /api/me`

Purpose: return the current authenticated browser identity.

Implementation: [pkg/server/http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go#L157)

Authenticated example:

```json
{
  "data": {
    "authenticated": true,
    "authMode": "oidc",
    "issuer": "https://auth.example.com/realms/smailnail",
    "subject": "3d2c...",
    "email": "alice@example.com",
    "preferredUsername": "alice",
    "displayName": "Alice Example",
    "scopes": ["openid", "profile", "email"],
    "sessionExpiresAt": "2026-03-19T23:15:00Z"
  }
}
```

Unauthenticated example:

```json
{
  "error": {
    "code": "not-authenticated",
    "message": "No active browser session was found."
  }
}
```

### Auth routes

`GET /auth/login`

- generates `state` and `nonce`,
- writes short-lived cookies,
- redirects to Keycloak.

`GET /auth/callback`

- validates `state` and `nonce`,
- exchanges the authorization code,
- verifies the `id_token`,
- writes the signed session cookie,
- redirects to `/`.

`GET /auth/logout`

- clears the local session cookie,
- redirects either to Keycloak end-session or back to `/`.

## End-to-end runtime flows

### Flow A: first login

```text
1. Browser requests /
2. app.js calls /api/me
3. server returns 401
4. user clicks Login with Keycloak
5. browser requests /auth/login
6. server sets state + nonce cookies and redirects to Keycloak
7. user authenticates in Keycloak
8. Keycloak redirects browser to /auth/callback?code=...&state=...
9. server exchanges code for tokens
10. server verifies id_token signature, issuer, audience, expiry, nonce
11. server writes signed session cookie
12. browser lands back on /
13. app.js calls /api/me again and now receives authenticated user data
```

### Flow B: later React app

The later React app should not store tokens in `localStorage`. It should simply call:

```ts
const response = await fetch("/api/me", {
  credentials: "include",
  headers: { Accept: "application/json" },
});
```

If the cookie is present and valid, the backend returns the same user payload already used by the bootstrap UI.

## Keycloak and Coolify setup guide

### Reuse model from `smailnail`

Local `smailnail` documentation already defines the issuer and a working OIDC startup shape:

- local issuer: [shared-oidc-playbook.md](/home/manuel/code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md#L24)
- working local flag pattern: [shared-oidc-playbook.md](/home/manuel/code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md#L36)
- remote realm example: [shared-oidc-playbook.md](/home/manuel/code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md#L189)

### Standalone local stack in this repo

The repo now includes:

1. [docker-compose.local.yml](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docker-compose.local.yml)
2. [hair-booking-dev-realm.json](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/dev/keycloak/realm-import/hair-booking-dev-realm.json)

That local stack is structurally copied from `smailnail`'s Keycloak setup, but adapted for `hair-booking`:

- realm: `hair-booking-dev`
- client: `hair-booking-web`
- client secret: `hair-booking-web-secret`
- test user: `alice`
- test password: `secret`

Run it with:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
docker compose -f docker-compose.local.yml up -d
```

Then run the app with:

```bash
go run ./cmd/hair-booking serve \
  --listen-port 8080 \
  --auth-mode oidc \
  --auth-session-secret local-session-secret \
  --oidc-issuer-url http://127.0.0.1:18080/realms/hair-booking-dev \
  --oidc-client-id hair-booking-web \
  --oidc-client-secret hair-booking-web-secret \
  --oidc-redirect-url http://127.0.0.1:8080/auth/callback
```

### Recommended Keycloak client strategy

For local standalone testing, use the imported `hair-booking-web` client in the `hair-booking-dev` realm. For production, it is still reasonable to use the same shared Keycloak deployment as `smailnail`, but with a distinct `hair-booking-web` client. That avoids coupling redirect URLs and secrets across applications.

Recommended client:

- Client ID: `hair-booking-web`
- Access type: confidential
- Standard flow enabled: yes
- Direct access grants: no
- Valid redirect URIs:
  - `http://127.0.0.1:8080/auth/callback`
  - `https://hair-booking.<your-domain>/auth/callback`
- Web origins:
  - `http://127.0.0.1:8080`
  - `https://hair-booking.<your-domain>`

### Coolify environment variables

Coolify should inject these environment variables:

```bash
HAIR_BOOKING_AUTH_MODE=oidc
HAIR_BOOKING_AUTH_SESSION_SECRET=<long-random-secret>
HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.<your-domain>/realms/smailnail
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET=<client-secret>
HAIR_BOOKING_OIDC_REDIRECT_URL=https://hair-booking.<your-domain>/auth/callback
```

### Coolify start command

If the built binary is named `hair-booking`, the runtime command is conceptually:

```bash
./hair-booking serve --listen-host 0.0.0.0 --listen-port 8080
```

Because the Glazed auth section already reads environment-backed defaults, the OIDC flags do not need to be hardcoded into the Coolify command.

## Implementation plan for an intern

If an intern had to rebuild or extend this from scratch, the recommended order is:

### Phase 1: understand the auth contract

1. Read `smailnail`'s auth config and OIDC flow.
2. Confirm the meaning of issuer, client ID, redirect URL, and scopes.
3. Confirm that `/api/me` is the frontend-facing session check endpoint.

### Phase 2: understand `hair-booking`'s current bootstrap

1. Read the root CLI bootstrap in [main.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/main.go#L14).
2. Read the serve command in [serve.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go#L36).
3. Read auth config and session management in [config.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go#L46) and [session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go#L41).
4. Read the route surface in [http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go#L125).

### Phase 3: extend the backend safely

Possible next features:

1. Add domain APIs under `/api/*` that require an authenticated session.
2. Introduce a persistent user/session store if the app needs revocation or server-side session invalidation.
3. Replace the static frontend with a React build while keeping the auth API stable.

### Phase 4: replace the frontend

When React is introduced:

1. keep `/auth/login`, `/auth/callback`, `/auth/logout`, `/api/me`,
2. preserve cookie-based auth,
3. move the current bootstrap UI concerns into a React route or auth provider,
4. keep `credentials: "include"` on fetches.

## Testing and validation strategy

### Automated tests

The implementation includes focused tests for the most failure-prone parts:

1. session cookie round-trip and tamper detection in [pkg/auth/session_test.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session_test.go#L10)
2. `/api/me` behavior and SPA fallback in [pkg/server/http_test.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http_test.go#L14)

### Commands used during verification

```bash
GOWORK=off GOCACHE=/tmp/hair-booking-gocache GOMODCACHE=/tmp/hair-booking-gomodcache go mod tidy
GOWORK=off GOCACHE=/tmp/hair-booking-gocache GOMODCACHE=/tmp/hair-booking-gomodcache go test ./...
GOWORK=off GOCACHE=/tmp/hair-booking-gocache GOMODCACHE=/tmp/hair-booking-gomodcache go build ./cmd/hair-booking
GOWORK=off GOCACHE=/tmp/hair-booking-gocache GOMODCACHE=/tmp/hair-booking-gomodcache go run ./cmd/hair-booking serve --auth-mode dev --listen-port 18081
curl -sS http://127.0.0.1:18081/api/me
curl -sS http://127.0.0.1:18081/
```

### Manual OIDC validation checklist

1. Start Keycloak for the same realm used by `smailnail`.
2. Start `hair-booking serve` in `auth-mode=oidc`.
3. Open `/`.
4. Click `Login with Keycloak`.
5. Authenticate in Keycloak.
6. Confirm the page now shows the authenticated payload from `/api/me`.
7. Click `Logout`.
8. Confirm `/api/me` returns the unauthenticated error again.

## Risks, tradeoffs, and open questions

### Tradeoffs accepted in this version

1. The cookie session is self-contained rather than database-backed.
2. The UI uses a Bootstrap CDN instead of vendored frontend assets.
3. The app does not yet have CSRF-sensitive mutation APIs, so `SameSite=Lax` is acceptable for the current surface.

### Risks

1. Cookie revocation is coarse-grained. If immediate server-side invalidation becomes necessary, a session store will be needed.
2. If a future React app adds cross-origin hosting, cookie policy and CORS settings will need to be revisited.
3. The current implementation assumes a single trusted backend process signing sessions. Horizontal deployments must share the same `HAIR_BOOKING_AUTH_SESSION_SECRET`.

### Open questions

1. Will the React app be served by this Go binary, or by a separate frontend host?
2. Will the project eventually need a local user table, roles, or profile data beyond the Keycloak claims?
3. Does production need explicit reverse-proxy headers or trusted-proxy configuration beyond `X-Forwarded-Proto`?

## File references

Primary implementation files:

1. [cmd/hair-booking/main.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/main.go)
2. [cmd/hair-booking/cmds/serve.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go)
3. [pkg/auth/config.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go)
4. [pkg/auth/session.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go)
5. [pkg/auth/oidc.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go)
6. [pkg/server/http.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go)
7. [pkg/web/assets.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/assets.go)
8. [pkg/web/public/index.html](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/index.html)
9. [pkg/web/public/static/app.js](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/static/app.js)
10. [pkg/auth/session_test.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session_test.go)
11. [pkg/server/http_test.go](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http_test.go)
12. [docker-compose.local.yml](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docker-compose.local.yml)
13. [hair-booking-dev-realm.json](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/dev/keycloak/realm-import/hair-booking-dev-realm.json)
14. [README.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md)

Reference material from `smailnail`:

1. [docs/shared-oidc-playbook.md](/home/manuel/code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md)
2. [pkg/smailnaild/auth/config.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/auth/config.go)
3. [pkg/smailnaild/auth/oidc.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/auth/oidc.go)
4. [pkg/smailnaild/http.go](/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/http.go)
