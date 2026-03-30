---
Title: Standalone local Keycloak bootstrap postmortem
Ticket: HB-001-KEYCLOAK-LOGIN
Status: active
Topics:
    - backend
    - frontend
    - infrastructure
    - config
DocType: analysis
Intent: long-term
Owners: []
RelatedFiles:
    - Path: Makefile
      Note: Operator helper targets added as part of the hardening pass
    - Path: README.md
      Note: README evolution is part of the postmortem outcome
    - Path: dev/keycloak/realm-import/hair-booking-dev-realm.json
      Note: Standalone local realm import completed the repo-local auth fixture
    - Path: docker-compose.local.yml
      Note: Port override support resolved the local Keycloak collision
    - Path: docs/operations-playbook.md
      Note: Operational hardening output called out in the postmortem
ExternalSources: []
Summary: ""
LastUpdated: 2026-03-19T21:58:37.495652536-04:00
WhatFor: Explain how the Keycloak bootstrap moved from template code to a live standalone local system, what failed along the way, and what operators should watch next.
WhenToUse: Use when reviewing the first auth bootstrap, understanding why the local stack is shaped this way, or deciding what to harden before production deployment.
---


# Standalone Local Keycloak Bootstrap Postmortem

## Executive summary

This is a postmortem for the first `hair-booking` auth bootstrap. It is not a production incident write-up. It documents the engineering path from an empty Go template to a live, locally testable website that logs in through Keycloak, creates an application session, and exposes authenticated user state through `/api/me`.

The short version is that the implementation succeeded technically, but the first pass was incomplete operationally. The initial code proved the auth flow in Go, yet local testing still depended on the separate `smailnail` checkout for Keycloak. That was later corrected by copying the minimal Keycloak fixture into this repo, adapting it for `hair-booking`, and verifying the complete redirect, callback, token validation, and cookie session path end to end. The main runtime issue encountered during verification was a local port collision with an already-running `smailnail-keycloak`, which led to the addition of an overridable Keycloak host port in the standalone compose file.

## What the project needed to achieve

The user asked for four things at once:

1. a Go website that logs in with Keycloak
2. a Glazed command surface instead of an ad hoc `main`
3. compatibility with the same broader Keycloak setup pattern already used by `smailnail`
4. detailed project documentation suitable for an intern

That combined request created two separate deliverables:

- the software itself
- the operator and onboarding documentation around it

The implementation succeeded only when both layers existed. Before the standalone local Keycloak fixture and operator docs were added, the code worked but the project was not actually self-contained.

## Starting state

At the beginning of the work, the repository was still close to an untouched template:

- the module path was still placeholder-shaped
- there was no real `hair-booking` binary entrypoint
- there was no HTTP server
- there was no auth package
- there was no Keycloak integration
- there was no local fixture in this repo
- there was no ticket documentation

That meant the project had no operational story, no auth story, and no onboarding story.

## What was built

The final bootstrap now includes:

1. a real Go module and binary rooted at `./cmd/hair-booking`
2. a Glazed/Cobra `serve` command
3. an HTTP server with `/auth/login`, `/auth/callback`, `/auth/logout`, `/api/info`, and `/api/me`
4. OIDC discovery, authorization-code login, state/nonce handling, token exchange, and ID token verification
5. signed HTTP-only session cookies owned by the app
6. a minimal embedded browser UI
7. a standalone local Keycloak stack in this repo
8. a `docmgr` ticket with architecture, diary, postmortem, and playbook documentation

## What went well

### The auth contract stayed small and coherent

The project deliberately copied the useful surface from `smailnail` without copying its full storage and domain model. That was the right call. The auth contract is already stable enough for a later React app because the important browser-facing endpoints exist now, but the implementation is still small enough that a new engineer can understand it quickly.

### Glazed fit the command surface cleanly

The auth flags map naturally into a Glazed section. That made it possible to keep startup explicit, environment-driven, and friendly to a deployment platform that injects secrets and URLs rather than hardcoding them.

### The standalone Keycloak fixture was easy to derive once the repo boundary was clarified

`smailnail` already contained the right local Keycloak shape. Copying only the Keycloak-specific slice into this repo, renaming the realm and client to `hair-booking-dev` and `hair-booking-web`, and preserving a known-good local test user gave this repo an operationally self-contained local story without dragging along unrelated mail infrastructure.

## What went wrong

### The first implementation pass was not standalone enough

The initial version of the project implemented the Go side of the auth flow correctly, but local runtime instructions still pointed at `smailnail` for Keycloak. That meant the repo was architecturally on the right path but still operationally coupled to another checkout. The user explicitly called this out and asked for the setup to be copied over here.

This was not a code bug. It was a scope interpretation miss. The phrase "use the same Keycloak as `smailnail`" was initially interpreted as "reuse the same Keycloak deployment pattern and local fixture when testing," while the user later clarified that the repo itself needed to carry that setup so it could stand alone.

### The first live standalone launch hit a port collision

After the standalone compose stack was added, starting it on the default host port failed because this workstation already had `smailnail-keycloak` bound to `127.0.0.1:18080`.

Observed error:

```text
Bind for 127.0.0.1:18080 failed: port is already allocated
```

This exposed a missing operational assumption: the local fixture needed a configurable published port, not just a fixed one.

### Browser automation was not the most reliable verification path in this shell environment

An attempt to validate the flow with Playwright hit an environment-level browser reuse error rather than an application failure. The work then moved to a browser-style scripted curl flow, which turned out to be both simpler and more reproducible for this repo’s current needs.

## Root causes

### Root cause 1: repo boundaries were under-specified at first

The original problem statement mixed two goals:

- production alignment with the same Keycloak deployment model as `smailnail`
- a project that a new engineer could run locally with minimal friction

The first pass optimized for production alignment and auth correctness. The second pass corrected for local autonomy. The root cause was not misunderstanding Keycloak; it was not making the repo boundary explicit enough early in the interpretation.

### Root cause 2: local port assumptions were too rigid

The standalone compose file initially assumed that `18080` would always be free. That assumption was invalid on a development machine already running another Keycloak fixture. The fix was to make the host port overridable through `HAIR_BOOKING_KEYCLOAK_PORT`.

### Root cause 3: operator docs lagged behind the implementation

The first documentation pass focused on architecture and onboarding. That was useful, but it did not yet function as an operator runbook. The subsequent README and playbook work corrected that by documenting exact start, stop, tmux, verification, and deploy procedures.

## Timeline

### Phase 1: template replacement and auth bootstrap

The placeholder project was converted into a real Go module with a `hair-booking` binary, `serve` command, auth config surface, session handling, OIDC flow, and a small embedded frontend.

### Phase 2: ticketing and intern-facing design docs

A `docmgr` ticket was created and populated with a design guide and an implementation diary. This established the project history and architecture in a form suitable for handoff.

### Phase 3: standalone local Keycloak fixture

The user requested that the repo become standalone rather than depending on the `smailnail` checkout for local Keycloak. A repo-local compose stack and realm import were added, along with local helper make targets and updated setup instructions.

### Phase 4: live runtime verification and operator docs

The standalone stack was launched, the port conflict was resolved by moving to `18090` through an override, the app was started in tmux, and the full login flow was verified with the seeded local user. This phase also triggered the need for a more explicit operator playbook and a README rewrite.

## Detection and debugging

The important operational checks were:

1. `docker compose -f docker-compose.local.yml config`
2. Keycloak health and discovery document fetches
3. tmux-managed app startup log inspection
4. `/api/info` and `/auth/login` checks
5. callback and session verification through a browser-style scripted login

The debugging sequence mattered. It progressively separated:

- compose validity
- container health
- issuer availability
- app startup
- redirect correctness
- form submission correctness
- callback/session correctness

That layering prevented false conclusions and made the eventual success meaningful.

## Resolution

The final resolution had four parts:

1. copy the Keycloak compose stack and realm import into this repo
2. add an overridable published Keycloak host port
3. add stable Makefile targets for local OIDC startup and tmux lifecycle
4. write operator-facing docs that match the live-tested commands

The decisive runtime proof was the final authenticated `/api/me` response returned after a real login with `alice` / `secret`.

## Verified outcomes

The following outcomes were verified:

- local Keycloak starts and imports `hair-booking-dev`
- the issuer discovery document is reachable
- `hair-booking serve` starts successfully against the standalone issuer
- `/auth/login` redirects to the correct Keycloak realm and client
- the Keycloak login form accepts the seeded test user
- `/auth/callback` completes the code exchange and session creation path
- `/api/me` returns authenticated user data backed by the application session

## Remaining gaps

This bootstrap is functional, but it is still an early-stage system. The most important remaining gaps are:

1. There is no production container image definition in the repo.
2. There is no automated deployment pipeline for Coolify.
3. There is no browser integration test in CI.
4. Session revocation and persistent user mapping do not exist yet.
5. Production Keycloak client creation remains an operator task.

None of these gaps block local development, but they do matter before treating the system as production-ready.

## Actions taken

Already completed:

- added repo-local Keycloak compose stack
- added repo-local realm import
- added host port override support
- added Makefile helpers for local OIDC and tmux
- verified live login end to end
- updated README and added an operator playbook
- updated the ticket diary with the runtime validation sequence

Recommended next actions:

1. add a production Dockerfile or equivalent build/deploy artifact
2. add a script or CI job for a repeatable auth smoke test
3. define the exact production Keycloak client and hostname contract
4. add a release/deploy checklist tied to the repo rather than only ticket docs

## Lessons learned

The most important lesson is that "working code" and "operationally usable project" are different milestones. The Go auth implementation was not enough by itself. The project only became truly usable once the local Keycloak dependency was made repo-local, the port-collision case was handled, and the exact runtime commands were written down.

The second lesson is that auth work should always be validated end to end. Discovery succeeding is not enough. Redirects, callback parameters, token verification, and app session behavior all need to be proven together.

The third lesson is that documentation should converge toward the actual commands operators run, not only the architecture developers find elegant.
