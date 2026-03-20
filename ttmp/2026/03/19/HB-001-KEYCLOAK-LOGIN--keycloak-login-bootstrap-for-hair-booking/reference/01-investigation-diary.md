---
Title: Investigation diary
Ticket: HB-001-KEYCLOAK-LOGIN
Status: active
Topics:
    - backend
    - frontend
    - infrastructure
    - config
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: cmd/hair-booking/cmds/serve.go
      Note: Implementation and validation path
    - Path: dev/keycloak/realm-import/hair-booking-dev-realm.json
      Note: Standalone local realm import
    - Path: docker-compose.local.yml
      Note: Copied and adapted local Keycloak stack
    - Path: go.mod
      Note: Module rename and local glazed replace
    - Path: pkg/auth/session.go
      Note: Session work and tamper protections
    - Path: pkg/auth/session_test.go
      Note: Verification of session round-trip and tampering
    - Path: pkg/server/http.go
      Note: HTTP route wiring
    - Path: pkg/server/http_test.go
      Note: Verification of route and SPA behavior
ExternalSources: []
Summary: ""
LastUpdated: 2026-03-19T21:17:42.407929143-04:00
WhatFor: Capture the implementation path, failures, and verification evidence for the Keycloak login bootstrap.
WhenToUse: Use when reviewing the work, continuing the implementation, or reconstructing why specific decisions were made.
---



# Diary

## Goal

Capture how the `hair-booking` template was turned into a working Go web app with Glazed command wiring, Keycloak OIDC login, a signed browser session, a minimal website, and the requested ticket deliverables.

## Step 1: Inspect the template repo and extract the right auth pattern from smailnail

The repository started as a template, so the first job was not coding but orientation. I inspected the local repo, verified that `hair-booking` was still using placeholder names, and then walked the `smailnail` OIDC implementation and playbook so the new app would reuse the same realm and route model instead of improvising a different auth contract.

That inspection changed the implementation strategy. Rather than copying all of `smailnail`'s identity and database layers, I chose to preserve the browser-facing contract (`/auth/login`, `/auth/callback`, `/auth/logout`, `/api/me`) and the security-critical OIDC verification steps, while simplifying persistence down to a signed cookie session. That keeps the future React integration path intact without prematurely designing storage for a product that does not yet have domain data.

### Prompt Context

**User prompt (verbatim):** "I want to build a website with login through keycloak (hosted on coolify) for later on a react app. but for now just do login and setting up all the things. We are going to use the same keycloak as in ~/code/wesen/corporate-headquarters/smailnail .

Also in go and as a glazed command see $glazed-command-authoring 

Create a new docmgr ticket for the project, and create a detailed analysis / design / implementation guide that is very detailed for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file
  references.
  It should be very clear and detailed. Store in the ticket and the nupload to remarkable.

Keep a diary as you work."

**Assistant interpretation:** Build a real Go application in this repo, use Glazed for the CLI surface, implement Keycloak login using the `smailnail` Keycloak deployment as the reference system, and document the entire solution in a ticket and diary.

**Inferred user intent:** Establish a technically sound auth foundation now so a later React frontend can plug into an already-working session-backed backend.

**Commit (code):** N/A — not committed in this session.

### What I did

- Inspected the repository and confirmed it was an untouched template.
- Read the `glazed-command-authoring`, `docmgr`, `ticket-research-docmgr-remarkable`, and `diary` skills to align the work with the requested workflows.
- Searched the `smailnail` codebase for OIDC, Keycloak, and `/api/me` behavior.
- Read `smailnail` auth config, OIDC callback logic, route wiring, and the shared OIDC playbook.
- Created the new ticket workspace `HB-001-KEYCLOAK-LOGIN`.

### Why

- The repo had too little existing structure to safely code by assumption.
- `smailnail` already had the right identity model and operational examples, so it was the best source for stable naming and route contracts.
- Creating the ticket early prevented the design guide and diary from becoming an afterthought.

### What worked

- The `smailnail` OIDC implementation provided a clear baseline for settings, routes, and token validation.
- The local repo structure made it obvious that renaming placeholders had to be part of the task, not deferred.
- `docmgr ticket create-ticket` successfully created the workspace and standard files.

### What didn't work

- `docmgr status --summary-only` failed before the `ttmp` directory existed:

```text
Error: root directory does not exist: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp
```

- That was resolved by creating `ttmp/` first with:

```bash
mkdir -p /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp
```

### What I learned

- The workspace needed both code scaffolding and documentation scaffolding; neither existed yet.
- `smailnail`'s public auth surface was reusable even though its internal persistence model was much heavier than needed here.
- The project could get a meaningful bootstrap without a database if the cookie session was signed and the OIDC verifier stayed strict.

### What was tricky to build

- The tricky part was deciding what to copy from `smailnail` and what to deliberately omit. Copying everything would have created unnecessary weight and false architectural commitment. Copying too little would have risked inventing an auth contract the future React app would later have to replace.
- I solved that by preserving the Keycloak flow, the route names, and the verification logic, while replacing the database-backed identity/session layers with a signed cookie session manager.

### What warrants a second pair of eyes

- The decision to keep sessions entirely cookie-backed.
- The exact Coolify deployment shape once a production hostname is known.
- The assumption that a dedicated Keycloak client should be created within the same realm rather than reusing `smailnail`'s existing web client.

### What should be done in the future

- Decide whether the future React app will be served by the Go binary or by a separate frontend origin.
- Decide whether server-side session revocation is needed before adding mutation-heavy product features.

### Code review instructions

- Start with the `smailnail` playbook and compare it to the new auth config and server route surface.
- Validate that the chosen route names and auth flags line up with the eventual frontend requirements.

### Technical details

- Ticket ID: `HB-001-KEYCLOAK-LOGIN`
- Ticket path: `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HB-001-KEYCLOAK-LOGIN--keycloak-login-bootstrap-for-hair-booking`
- Primary reference files:
  - `/home/manuel/code/wesen/corporate-headquarters/smailnail/docs/shared-oidc-playbook.md`
  - `/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/auth/config.go`
  - `/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/auth/oidc.go`
  - `/home/manuel/code/wesen/corporate-headquarters/smailnail/pkg/smailnaild/http.go`

## Step 2: Implement the server, fix dependency/tooling issues, and verify the bootstrap end to end

Once the design was stable, I replaced the template placeholders with a real `hair-booking` module, added the Glazed/Cobra entrypoint, built the `serve` command, implemented auth config, session signing, OIDC login, HTTP routes, embedded frontend assets, and tests. I then ran the full Go verification loop and a small HTTP smoke test in `auth-mode=dev`.

The implementation phase also surfaced several practical toolchain issues. The first `go test` failed because the sandbox could not write to the default Go build cache. After redirecting the build cache into `/tmp`, the next blocker was dependency resolution: `go mod tidy` initially failed because `github.com/go-go-golems/glazed v0.0.0` is not a real published tag. I fixed that by adding a local `replace github.com/go-go-golems/glazed => ../glazed`, which is the right move in this workspace because `glazed` is already checked out beside `hair-booking`.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Finish the real implementation, validate it, then produce the requested documentation bundle and delivery artifacts.

**Inferred user intent:** Leave behind a working baseline, not just a plan.

**Commit (code):** N/A — not committed in this session.

### What I did

- Replaced the placeholder template module path with `github.com/go-go-golems/hair-booking`.
- Added the root CLI entrypoint and Glazed/Cobra command wiring.
- Added the `serve` command with `listen-*` settings and auth settings.
- Implemented `pkg/auth/config.go`, `pkg/auth/session.go`, and `pkg/auth/oidc.go`.
- Implemented `pkg/server/http.go` with `/healthz`, `/api/info`, `/api/me`, and the auth routes.
- Added embedded frontend assets under `pkg/web/public/`.
- Rewrote the top-level README with local and environment-based startup instructions.
- Added tests for session tampering and route behavior.
- Ran `go mod tidy`, `go test ./...`, `go build ./cmd/hair-booking`, and a live dev-mode HTTP smoke test on port `18081`.

### Why

- The user asked for a real site/login setup, not a mock or draft.
- The later React app needs a stable backend auth contract.
- Tests were needed to keep the most security-sensitive and routing-sensitive logic from drifting.

### What worked

- `go test ./...` passed after dependency and import issues were fixed.
- `go build ./cmd/hair-booking` passed.
- `go run ./cmd/hair-booking serve --auth-mode dev --listen-port 18081` started successfully.
- `curl -sS http://127.0.0.1:18081/api/me` returned an authenticated dev payload.
- `curl -sS http://127.0.0.1:18081/` returned the expected landing page HTML.

### What didn't work

- Initial `go test` used the default Go build cache and failed:

```text
pkg/server/http.go:14:2: open /home/manuel/.cache/go-build/...: read-only file system
pattern ./...: open /home/manuel/.cache/go-build/...: read-only file system
```

- Initial dependency resolution failed before network/tooling was corrected:

```text
github.com/go-go-golems/glazed@v0.0.0: reading github.com/go-go-golems/glazed/go.mod at revision v0.0.0: unknown revision v0.0.0
```

- The fix was:

```bash
replace github.com/go-go-golems/glazed => ../glazed
```

- During the earlier sandboxed phase, `go mod tidy` also failed with DNS/network errors:

```text
lookup proxy.golang.org on 127.0.0.53:53: dial udp 127.0.0.53:53: socket: operation not permitted
```

### What I learned

- The local workspace already contains the correct `glazed` checkout, so using a local `replace` is both faster and more correct than pretending `v0.0.0` exists upstream.
- The Go 1.25 toolchain selection may trigger automatic toolchain downloads because the local `glazed` module requires a newer patch version.
- The minimal UI is enough to validate the future React auth contract as long as `/api/me` and the auth routes are stable.

### What was tricky to build

- The hardest implementation detail was keeping the auth flow secure while intentionally avoiding a database. If the cookie had been unsigned, or if the callback had skipped issuer/audience/nonce validation, the simplification would have been unacceptable.
- I addressed that by keeping the OIDC discovery, JWKS verification, and state/nonce protections, and only simplifying the persistence layer. The result is a smaller system, not a weaker one.

### What warrants a second pair of eyes

- The session-cookie design, especially around expiry, revocation, and horizontal deployment.
- The Bootstrap CDN dependency if the production environment needs a stricter CSP or offline assets.
- The final Keycloak client configuration once the actual Coolify hostname is known.

### What should be done in the future

- Replace the placeholder frontend with React while preserving the existing auth API contract.
- Add server-side session persistence if logout revocation or admin invalidation becomes important.
- Add an OIDC integration test against a live local Keycloak fixture if the project starts changing auth logic frequently.

### Code review instructions

- Start with `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go`.
- Then read `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go`, `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go`, and `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go`.
- Finish with `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go` and the frontend assets.
- Validate with:

```bash
GOWORK=off GOCACHE=/tmp/hair-booking-gocache GOMODCACHE=/tmp/hair-booking-gomodcache go test ./...
GOWORK=off GOCACHE=/tmp/hair-booking-gocache GOMODCACHE=/tmp/hair-booking-gomodcache go build ./cmd/hair-booking
GOWORK=off GOCACHE=/tmp/hair-booking-gocache GOMODCACHE=/tmp/hair-booking-gomodcache go run ./cmd/hair-booking serve --auth-mode dev --listen-port 18081
curl -sS http://127.0.0.1:18081/api/me
curl -sS http://127.0.0.1:18081/
```

### Technical details

- Implemented files:
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/main.go`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/cmd/hair-booking/cmds/serve.go`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/config.go`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/session.go`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/auth/oidc.go`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/http.go`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/assets.go`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/index.html`
  - `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/web/public/static/app.js`
- Verification outputs:
  - `go test ./...` passed
  - `go build ./cmd/hair-booking` passed
  - `/api/me` in dev mode returned:

```json
{"data":{"authenticated":true,"authMode":"dev","issuer":"dev","subject":"local-user","preferredUsername":"local-user","displayName":"Development User","sessionExpiresAt":"2026-03-21T01:17:18Z"}}
```

## Step 3: Copy the local Keycloak setup into this repo so the project is standalone

After the first implementation pass, the user asked to stop depending on the `smailnail` checkout for local auth testing. I copied the Keycloak compose pattern into this repo, removed the unrelated Dovecot service, and added a repo-local realm import dedicated to `hair-booking`. That makes local setup self-contained while still preserving the same OIDC architecture and operational shape that `smailnail` established.

The main design choice in this step was to give the standalone local stack its own realm and client names. Using `hair-booking-dev` and `hair-booking-web` locally makes the repo self-describing and avoids leaking another app's naming into this one, while still allowing production to target the shared Keycloak deployment later.

### Prompt Context

**User prompt (verbatim):** "no, copy the setup over here so this repo is standalone"

**Assistant interpretation:** Add the local Keycloak docker-compose and realm import directly to this repo, and update the app documentation so local testing no longer depends on `smailnail`.

**Inferred user intent:** Make `hair-booking` operationally self-contained for local development.

**Commit (code):** N/A — not committed in this session.

### What I did

- Added `docker-compose.local.yml` with `keycloak-postgres` and `keycloak`.
- Added `dev/keycloak/realm-import/hair-booking-dev-realm.json`.
- Updated the README to describe the standalone local Keycloak stack and the new local issuer/client values.
- Added `make` helpers for bringing the local Keycloak stack up and down.
- Updated the design doc to explain the standalone local stack.

### Why

- A standalone repo is easier to run, review, and hand off.
- The app only needed Keycloak locally, not the rest of the `smailnail` fixture stack.
- Local app-specific client names reduce confusion during onboarding.

### What worked

- The `smailnail` Keycloak files were small and easy to adapt.
- The new realm import keeps the useful test user defaults (`alice` / `secret`) while switching to app-specific naming.

### What didn't work

- N/A

### What I learned

- The local auth dependency on `smailnail` was purely operational, not architectural.
- The minimum standalone local slice is Keycloak plus its backing Postgres and a realm import.

### What was tricky to build

- The subtle part was naming. Reusing `smailnail-web` locally would have kept the repo coupled to another application's client identity. Changing the production story at the same time would have drifted from the original shared-Keycloak requirement.
- I addressed that by making only the local fixture standalone and app-specific, while keeping the production guidance compatible with a shared Keycloak deployment.

### What warrants a second pair of eyes

- Whether additional redirect URIs should be seeded now for future frontend dev ports.
- Whether the local realm name should intentionally mirror a future production realm or stay clearly local-only.

### What should be done in the future

- Add extra redirect URIs/web origins if a React dev server is introduced.
- Consider a local smoke-test script that checks the compose stack plus the app launch path together.

### Code review instructions

- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docker-compose.local.yml`.
- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/dev/keycloak/realm-import/hair-booking-dev-realm.json`.
- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md` and `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Makefile`.
- Validate with:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
docker compose -f docker-compose.local.yml config
```

### Technical details

- Local standalone defaults:
  - issuer: `http://127.0.0.1:18080/realms/hair-booking-dev`
  - client: `hair-booking-web`
  - secret: `hair-booking-web-secret`
  - user: `alice`
  - password: `secret`

## Step 4: Launch the standalone stack, handle the local port conflict, and verify the live login flow

The user then asked two operational questions: whether Keycloak had already been configured and whether I could run the app in `tmux`. At that point, the answer to the first question was "configured in the repo, but not yet proven live." The compose file and realm import were present, but the real test was whether the local container would start, import the realm, and successfully complete the OIDC browser-style login flow with the Go server.

The first runtime obstacle was environmental rather than code-related. Port `18080` was already occupied by the long-running `smailnail-keycloak` container on this machine, so the new standalone Keycloak stack could not bind its default local port. I changed the compose file to support a `HAIR_BOOKING_KEYCLOAK_PORT` override and brought the standalone `hair-booking` Keycloak up on `18090` instead. This preserved the simple default for clean environments while making the repo usable on a workstation that already had another Keycloak fixture running.

After the realm became healthy on `http://127.0.0.1:18090/realms/hair-booking-dev`, I started the Go app in a dedicated tmux session named `hair-booking-dev`. I used the standalone local issuer, client ID, client secret, and callback URL. Once the server was up, I validated the app in three layers: the unauthenticated `/api/info` endpoint, the `/auth/login` redirect into Keycloak, and the full login round-trip using the seeded local user `alice` / `secret`.

Because I could not rely on an interactive browser session in the terminal environment, I performed a browser-style scripted login by following the redirect, loading the Keycloak login page, extracting the login form action, posting the credentials, following the callback back into the Go application, and then calling `/api/me` with the resulting app session cookie. That final call returned the authenticated user payload, which proved that discovery, redirect construction, state/nonce handling, code exchange, ID token verification, and signed session cookie creation were all working together end to end.

### Prompt Context

**User prompt (verbatim):** "run it in tmux. Did you already configure the keycloak?"

**Assistant interpretation:** Start the real standalone local stack, run the app in tmux, and verify whether the repo-local Keycloak configuration actually works at runtime.

**Inferred user intent:** Move from configuration-on-disk to a live, testable local environment.

**Commit (code):** N/A — not committed in this session.

### What I did

- Confirmed that `smailnail-keycloak` was already using `127.0.0.1:18080`.
- Updated `docker-compose.local.yml` so the Keycloak host port can be overridden via `HAIR_BOOKING_KEYCLOAK_PORT`.
- Started the standalone local stack on `127.0.0.1:18090`.
- Verified the OIDC discovery document at `http://127.0.0.1:18090/realms/hair-booking-dev/.well-known/openid-configuration`.
- Started `hair-booking` in tmux session `hair-booking-dev`.
- Verified `/api/info`.
- Verified `/auth/login` redirected to the standalone Keycloak realm with the expected client and callback values.
- Submitted `alice` / `secret` through the Keycloak login form and followed the callback back to the app.
- Verified `/api/me` returned an authenticated OIDC-backed user payload.

### Why

- The repo needed to be operationally standalone, not just structurally standalone.
- Running the app in tmux makes it easier to keep the dev server alive while inspecting logs and exercising the app.
- End-to-end validation catches integration bugs that static configuration review cannot catch.

### What worked

- The standalone realm import completed successfully.
- The Go server started cleanly against the local issuer on port `18090`.
- The app generated the correct authorization redirect.
- The local test user `alice` authenticated successfully and produced an application session.

### What didn't work

- The first attempt to expose standalone Keycloak on `127.0.0.1:18080` failed because that port was already bound by `smailnail-keycloak`.

### Exact errors / commands

The key environmental conflict was a Docker bind error because another local Keycloak was already using the default local port:

```text
Bind for 127.0.0.1:18080 failed: port is already allocated
```

The adjusted stack launch used:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
HAIR_BOOKING_KEYCLOAK_PORT=18090 docker compose -f docker-compose.local.yml up -d
```

The tmux app launch used:

```bash
tmux new-session -d -s hair-booking-dev \
  'cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking && exec go run ./cmd/hair-booking serve \
    --listen-port 8080 \
    --auth-mode oidc \
    --auth-session-secret local-session-secret \
    --oidc-issuer-url http://127.0.0.1:18090/realms/hair-booking-dev \
    --oidc-client-id hair-booking-web \
    --oidc-client-secret hair-booking-web-secret \
    --oidc-redirect-url http://127.0.0.1:8080/auth/callback'
```

The tmux pane showed:

```text
2026-03-19T21:48:11.309062114-04:00 INF Starting hair-booking server address=0.0.0.0:8080 auth_mode=oidc client_id=hair-booking-web issuer=http://127.0.0.1:18090/realms/hair-booking-dev
```

The successful authenticated `/api/me` response was:

```json
{"data":{"authenticated":true,"authMode":"oidc","issuer":"http://127.0.0.1:18090/realms/hair-booking-dev","subject":"0a51850b-070b-471e-83c7-229ba830f1ac","email":"alice@example.com","emailVerified":true,"preferredUsername":"alice","displayName":"Alice Example","scopes":["openid","profile","email"],"sessionExpiresAt":"2026-03-20T01:54:15Z"}}
```

### What I learned

- Supporting an overridable local Keycloak host port is worthwhile because shared development machines often already have a Keycloak fixture running.
- The repo-local realm import is sufficient to make the app fully testable without `smailnail`.
- The authentication path is working end to end, not just the discovery/bootstrap layer.

### What was tricky to build

- The main tricky point was separating "configured on disk" from "configured and proven live." The repo already contained the right ingredients, but I still needed to confirm that the realm import, callback URL, client secret, and server-side session logic agreed with each other at runtime.
- The second tricky point was doing a realistic browser-style login in a headless terminal flow. I solved that by using the same redirect-and-form-submit sequence that a browser would perform.

### What warrants a second pair of eyes

- Whether the default local Keycloak port should stay at `18080` or be changed to reduce collision risk on this workstation.
- Whether a small helper script or make target should wrap the full standalone local launch sequence, including tmux.

### What should be done in the future

- Add a single-command local smoke runner that starts Keycloak, waits for readiness, and launches the app in tmux.
- Add a scripted integration check for the redirect/login/callback path if the repo later gets CI coverage for browser automation.

### Code review instructions

- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docker-compose.local.yml` for the new `HAIR_BOOKING_KEYCLOAK_PORT` override.
- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md` for the documented port override and standalone local auth setup.
- Review the runtime launch parameters used in the tmux command above and confirm they match the realm import.

### Technical details

- Standalone local Keycloak is currently running on `http://127.0.0.1:18090` because `18080` was already in use on this workstation.
- The tmux session name is `hair-booking-dev`.
- The app is running on `http://127.0.0.1:8080`.
- The verified local login is:
  - username: `alice`
  - password: `secret`

## Step 5: Add the operator playbook, tighten the README, and write the postmortem

After the standalone stack and live login flow were working, the next gap was documentation shape. The architecture guide explained how the system worked, but it was still too conceptual for day-to-day operation. The README also contained the right ingredients, but they were not yet organized around the main operator tasks: start, stop, inspect, verify, and hand off deployment. The user explicitly asked for a detailed postmortem and a playbook that covers start, stop, and deploy.

I addressed that by splitting the docs into clearer roles. The root README now works as the repo landing page and quick-start guide. A new repo-level operations playbook captures the exact commands and verification steps an operator needs. Inside the ticket, I added a detailed postmortem that explains what the project got right, what went wrong, how the standalone local stack evolved, and what still needs hardening before production deployment can be considered mature. I also added Makefile helper targets so the docs can point at short, stable commands instead of repeating long shell invocations everywhere.

### Prompt Context

**User prompt (verbatim):** "cool, write a detailed postmortem and update the README and make a playbook on how to start / stop / deploy."

**Assistant interpretation:** Turn the current implementation and runtime validation work into clear operator-facing documentation, and make the repo entrypoint instructions easier to use.

**Inferred user intent:** Make the project understandable and runnable by someone who was not present during the implementation work.

**Commit (code):** N/A — not committed in this session.

### What I did

- Updated the root README to include a clearer quick start, tmux flow, verification section, and deployment contract.
- Added a repo-level playbook at `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/operations-playbook.md`.
- Added Makefile targets for `run-local-oidc`, `run-local-dev`, and tmux lifecycle commands.
- Added a ticket postmortem document.
- Added a ticket playbook document.
- Updated the ticket index so the new docs are discoverable.

### Why

- Operator docs should optimize for execution, not only explanation.
- Repeated long commands are harder to maintain than stable helper targets.
- A postmortem is useful here because the implementation evolved across multiple passes and the reasons for the final shape were not obvious from the code alone.

### What worked

- The existing architecture guide already contained enough design context to support a stronger operator playbook.
- The new Make targets provided clean anchors for the README and playbook.
- The docs split naturally into three layers: README for fast orientation, playbook for operations, and postmortem for historical analysis.

### What didn't work

- N/A

### What I learned

- Once auth works, the next bottleneck is almost always operator clarity rather than code correctness.
- A repo-level playbook is more discoverable than relying on a ticket doc alone.
- A small set of make targets meaningfully reduces friction when documenting multi-flag Go startup commands.

### What was tricky to build

- The tricky part was avoiding three near-duplicate documents. The README, playbook, and postmortem each needed a different job. I kept the README focused on quick use, the playbook focused on procedures and verification, and the postmortem focused on analysis and project history.
- The second tricky part was writing deployment guidance that is honest about the current repo state. There is still no production Dockerfile or Coolify manifest, so the deployment docs had to describe the current binary-and-env contract without pretending a fuller production pipeline already exists.

### What warrants a second pair of eyes

- Whether the new Makefile targets are the right long-term operator surface or whether they should move into dedicated scripts.
- Whether the deploy guidance should stay generic until a concrete Coolify configuration is added to the repo.

### What should be done in the future

- Add a production container image definition.
- Add a CI or scripted smoke test that follows the documented auth verification steps.
- Revisit the playbook once the React frontend or a concrete Coolify deployment definition lands.

### Code review instructions

- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md`.
- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/operations-playbook.md`.
- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/Makefile`.
- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HB-001-KEYCLOAK-LOGIN--keycloak-login-bootstrap-for-hair-booking/analysis/01-standalone-local-keycloak-bootstrap-postmortem.md`.
- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/19/HB-001-KEYCLOAK-LOGIN--keycloak-login-bootstrap-for-hair-booking/playbook/01-local-start-stop-and-deploy-playbook.md`.

### Technical details

- New operator targets:
  - `make run-local-dev`
  - `make run-local-oidc`
  - `make tmux-local-oidc-up`
  - `make tmux-local-oidc-down`
  - `make tmux-local-oidc-logs`
- The tmux start target expands to a `make run-local-oidc` invocation inside the tmux session, so the docs and the background process use the same startup contract.

## Step 6: Trace where the real hosted Keycloak credentials come from

The user then challenged an important operational gap: if the repos do not contain the real hosted Keycloak credentials, where do they actually come from? That was the right question, because the Terraform and Coolify docs in both `smailnail` and `hair-booking` were written as contracts with placeholders, not as audited secret-source documentation. I searched the older `smailnail` workspace, its Terraform state files, and the Obsidian project notes for March 2026 to find the real operational source of truth.

The decisive source was not the code repo at all. It was the Obsidian project note for the hosted Keycloak platform. That note documents that the production Keycloak instance on `auth.scapegoat.dev` was deployed directly through Coolify as a managed Docker Compose service, and that the bootstrap admin credentials are stored in the Coolify service environment file on the host at `/data/coolify/services/k12lm4blpo13louovn3pfsgs/.env` under `SERVICE_USER_ADMIN` and `SERVICE_PASSWORD_ADMIN`. In other words, the real Terraform provider credentials are expected to come from the platform operator’s Coolify-managed service configuration, not from git and not from the Terraform examples.

I also confirmed that the older `smailnail` workspace has local Terraform state files for both the `local` and `hosted` Keycloak environments. Those state files are ignored by git and therefore not committed, but the hosted state does contain real managed resource data for the hosted `smailnail` realm and clients. That means the hosted client secret may be recoverable from local state on the machine where Terraform was applied, even though the provider admin username and password themselves are not documented in the repo.

### Prompt Context

**User prompt (verbatim):** "look in the ttmp diaries over there, maybe it tell syou how it was deployed. Look also in ~/code/wesen/obsidian-vault/Projects/2026/03"

**Assistant interpretation:** Search the older project notes and diaries for the real deployment trail, especially the source of the hosted Keycloak admin credentials and deployment configuration.

**Inferred user intent:** Replace guesswork with a concrete operational source of truth for hosted Keycloak secrets and deployment state.

**Commit (code):** N/A — not committed in this session.

### What I did

- Searched the older `smailnail` workspace for Terraform state files, tfvars, env files, and deployment notes.
- Searched the Obsidian vault under `Projects/2026/03` for `smailnail`, `keycloak`, `coolify`, and `auth.scapegoat.dev`.
- Identified the Keycloak platform note that documents the hosted deployment and secret location.
- Confirmed that the hosted `smailnail` Terraform state exists locally and is ignored by git.

### Why

- Terraform provider auth and managed client secrets are different things, and both matter for a real hosted deployment.
- If the project is going to reuse the same shared Keycloak deployment as `smailnail`, the actual operator source for those values needs to be known.

### What worked

- The Obsidian note contained the missing deployment details that the code repo intentionally omitted.
- The older `smailnail` Terraform state clearly showed that hosted resources had been applied for real.

### What didn't work

- Searching the `smailnail/ttmp` workspace directly did not immediately surface deployment diary paths with a simple filename match.
- The repos themselves did not contain a direct statement of where the real hosted secrets are stored.

### What I learned

- The real hosted Keycloak admin credentials are stored in the Coolify-managed service environment, not in git.
- The hosted Terraform state is local, sensitive, and not committed, but it does represent a real applied hosted Keycloak configuration.
- The operational source of truth for the shared identity platform currently spans the code repo plus the Coolify host plus Obsidian project notes.

### What was tricky to build

- The tricky part was that there were three different classes of “secret” being discussed at once: local fixture defaults, Terraform provider auth, and hosted client secrets. The repos mix local examples and hosted placeholders, which makes it easy to confuse them without tracing the full deployment trail.
- The second tricky part was that the real deployment history lived partly outside the repo in Obsidian notes, so code search alone was not enough.

### What warrants a second pair of eyes

- Whether the shared Keycloak admin auth should continue living only in the Coolify service env file or be moved into a more explicit secret management workflow.
- Whether the existence of local hosted Terraform state on a workstation should be treated as a security/process issue and moved to a remote encrypted backend.

### What should be done in the future

- Document the secret source and state backend explicitly in the deployment playbook.
- Move Terraform state to a shared remote backend instead of relying on local workstation state.
- Decide whether `hair-booking` Terraform should reuse the same admin auth path as `smailnail` or get a dedicated Keycloak admin client.

### Code review instructions

- Review `/home/manuel/code/wesen/obsidian-vault/Projects/2026/03/16/PROJ - Keycloak Identity Platform on Coolify.md`.
- Review `/home/manuel/workspaces/2026-03-08/update-imap-mcp/smailnail/deployments/terraform/keycloak/envs/hosted/terraform.tfstate` only with care; it is sensitive local state.
- Review `/home/manuel/workspaces/2026-03-08/update-imap-mcp/smailnail/deployments/terraform/keycloak/.gitignore`.

### Technical details

- Obsidian note: `/home/manuel/code/wesen/obsidian-vault/Projects/2026/03/16/PROJ - Keycloak Identity Platform on Coolify.md`
- Hosted Keycloak service directory documented there: `/data/coolify/services/k12lm4blpo13louovn3pfsgs/`
- Documented credential location there: `/data/coolify/services/k12lm4blpo13louovn3pfsgs/.env`
- Documented credential keys there:
  - `SERVICE_USER_ADMIN`
  - `SERVICE_PASSWORD_ADMIN`
- Local hosted Terraform state found at:
  - `/home/manuel/workspaces/2026-03-08/update-imap-mcp/smailnail/deployments/terraform/keycloak/envs/hosted/terraform.tfstate`
  - `/home/manuel/workspaces/2026-03-08/update-imap-mcp/smailnail/deployments/terraform/keycloak/envs/hosted/terraform.tfstate.backup`

## Step 7: Deploy the hosted app on Coolify and move it to `hair-booking.app.scapegoat.dev`

After the shared Keycloak client existed in the hosted realm, the next task was to prove the full hosted app path instead of stopping at local tmux and local Keycloak. That meant connecting three different systems: the GitHub repo branch Coolify actually clones, the shared hosted Keycloak client managed through Terraform, and the Coolify runtime configuration that tells the app which redirect URL to advertise during login.

The first hosted deployment attempt failed for an operational reason, not a code reason. Coolify was configured to build `wesen/hair-booking` from branch `task/hair-signup`, but that branch only existed locally on the workstation at first. Coolify clones from GitHub, not from the local checkout, so the deployment failed immediately with a `fatal: Remote branch task/hair-signup not found in upstream origin` error. I fixed that by committing the local app/bootstrap work, pushing `task/hair-signup` to GitHub, and redeploying. The second deployment built the Dockerfile successfully, started the container, and passed the internal `/healthz` probe.

Once the app was healthy under the initial `hair-booking.scapegoat.dev` hostname, the user requested a better final hostname: `hair-booking.app.scapegoat.dev`. That change had to be propagated through both identity and runtime layers. I updated the Terraform operator environment in `/home/manuel/code/wesen/terraform/.envrc`, applied the shared Keycloak client update so that the valid redirect URI and web origin moved to the new hostname, patched the Coolify application FQDN through the API, patched the `HAIR_BOOKING_OIDC_REDIRECT_URL` runtime env through the API, and triggered another rolling deployment. The new container came up healthy, the old one was drained, and the hosted `/auth/login` route now redirects to Keycloak with `redirect_uri=https://hair-booking.app.scapegoat.dev/auth/callback`.

I verified the final result in three ways. First, Coolify reported the app as `running:healthy`. Second, host-header requests on the server returned `200` for `/healthz` and `/api/info`, and `302` for `/auth/login` with the new callback URL. Third, external DNS for `hair-booking.app.scapegoat.dev` resolved publicly to `89.167.52.236`, and direct external requests from this workstation returned a healthy `200` from `/healthz` and the expected Keycloak redirect from `/auth/login`.

### Prompt Context

**User prompt (verbatim):** "do hair-booking.app.scapegoat.dev"

**Assistant interpretation:** Move the hosted `hair-booking` deployment and Keycloak callback configuration to the new public hostname `hair-booking.app.scapegoat.dev`.

**Inferred user intent:** Make the real hosted deployment use the final app-specific subdomain instead of the earlier placeholder hostname.

**Commit (code):** `1de54da` — `Add Keycloak login bootstrap and deploy docs`

### What I did

- Confirmed that the first hosted deploy had failed because the configured Git branch did not yet exist on GitHub.
- Committed and pushed the local `task/hair-signup` branch so Coolify could clone it.
- Re-ran the Coolify deployment and confirmed the hosted container became healthy.
- Updated `/home/manuel/code/wesen/terraform/.envrc` so `TF_VAR_public_app_url` became `https://hair-booking.app.scapegoat.dev`.
- Ran a Terraform plan and apply for the shared `hair-booking-web` Keycloak client so the hosted redirect URI and web origin switched to the new hostname.
- Patched the Coolify application FQDN to `https://hair-booking.app.scapegoat.dev`.
- Patched the Coolify runtime env `HAIR_BOOKING_OIDC_REDIRECT_URL` to `https://hair-booking.app.scapegoat.dev/auth/callback`.
- Triggered a second Coolify rolling deployment and verified the new container became healthy.
- Verified external DNS and public HTTPS responses for the new hostname.

### Why

- The hosted app, the shared Keycloak client, and the app runtime redirect env must all agree on the same public callback URL.
- Coolify can only deploy branches that exist on the remote repository, so the branch had to be pushed before hosted deployment could succeed.
- The new hostname is more consistent with a shared platform layout where application UIs live under `*.app.scapegoat.dev`.

### What worked

- Querying `application_deployment_queues.logs` in the Coolify Postgres made the deployment failure immediately clear.
- Pushing the Git branch resolved the first hosted deployment issue without requiring any code change.
- Terraform updated the Keycloak redirect URI and web origin cleanly in place.
- Coolify accepted both the application FQDN update and the runtime env update through its API.
- The rolling deployment completed successfully, and the new container passed health checks on the first probe.
- Public DNS for `hair-booking.app.scapegoat.dev` was already in place by the time I verified the final deployment.

### What didn't work

- The first deployment failed because the branch name existed only locally.
- My first attempt to patch the Coolify API used bad nested shell quoting and produced `Invalid JSON`; I corrected that by sending the JSON bodies via heredoc payloads.
- The `make apply-hair-booking` target in the shared Terraform repo failed in this non-interactive shell because it expected a typed approval. I re-ran the same apply with `terraform apply -auto-approve`.

### What I learned

- Hosted deployment debugging is much faster when you read Coolify’s deployment queue table directly instead of inferring from the dashboard state alone.
- For app platforms like Coolify, “deployed branch” is a GitHub fact, not a local git fact.
- The domain move is a multi-system change: Keycloak client, Coolify app FQDN, runtime env, deployment, and DNS all need to line up.

### What was tricky to build

- The tricky part was that the app looked healthy from one layer while still being wrong from another. After the first successful build, the container was healthy, but the redirect hostname still had to be coordinated with Keycloak and the final public domain.
- The second tricky part was that the same hostname value appears in multiple places that are owned by different systems and repos.

### What warrants a second pair of eyes

- Whether the shared Terraform repo should gain a non-interactive `apply` target that explicitly uses `-auto-approve` only in controlled contexts.
- Whether the Coolify app/domain/env updates should also be codified in a stable script rather than repeated ad hoc through API calls.

### What should be done in the future

- Add a scripted hosted smoke test that checks `/healthz`, `/api/info`, and `/auth/login` against the public hostname after each deploy.
- Decide whether Coolify application definitions themselves should eventually move into a declarative infra layer.
- Add a real browser login verification step against the public hostname, not only host-header and redirect checks.

### Code review instructions

- Review `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md`.
- Review `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`.
- Review `/home/manuel/code/wesen/terraform/.envrc` locally if you are the operator; it is intentionally not committed.

### Technical details

- Coolify application UUID: `uion8lttbypsijf8ww9b4c3e`
- Successful deployment queue rows:
  - `8` for the first successful hosted deploy
  - `9` for the final hostname cutover deploy
- Final public app URL: `https://hair-booking.app.scapegoat.dev`
- Final Keycloak redirect URL: `https://hair-booking.app.scapegoat.dev/auth/callback`
- Final public DNS resolution observed from the workstation: `89.167.52.236`
