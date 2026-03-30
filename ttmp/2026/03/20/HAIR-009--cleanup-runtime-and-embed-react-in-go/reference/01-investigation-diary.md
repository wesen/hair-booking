---
Title: Investigation Diary
Ticket: HAIR-009
Status: active
Topics:
    - cleanup
    - deploy
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-005--consolidate-app-shell-and-remove-non-mvp-client-flows/tasks.md
      Note: Source decision that production should embed React in Go
    - Path: ttmp/2026/03/20/HAIR-006--build-stylist-backend-operations-mvp/tasks.md
      Note: Cleanup intentionally deferred until stylist backend exists
    - Path: ttmp/2026/03/20/HAIR-007--build-stylist-frontend-operations-mvp/tasks.md
      Note: Cleanup intentionally deferred until stylist frontend exists
ExternalSources: []
Summary: Diary for the deferred post-stylist cleanup and embed track.
LastUpdated: 2026-03-20T18:55:00-04:00
WhatFor: Use this to understand why cleanup and embedding were split out of HAIR-005.
WhenToUse: Use while implementing or reviewing HAIR-009.
---

# Investigation Diary

## 2026-03-20

This ticket was created once the shell roadmap became clearer.

At that point three things were true:

- the shell and auth work in HAIR-005 had progressed enough to make the app coherent
- production hosting had a clear direction: embed React in Go
- large cleanup would be premature before HAIR-006 and HAIR-007 define the real stylist runtime shape

So the cleanup and embed work became its own late-stage execution ticket rather than a grab bag inside HAIR-005.

Later the user asked to move directly into production-shape hosting and deploy the result to Coolify.

That narrowed the first HAIR-009 slice to a concrete set of actions:

- replace the legacy embedded inspector with the built React app
- make `/` redirect to `/booking`
- keep local frontend proxy behavior for active frontend work
- prove the Docker build path that Coolify will actually use
- recover the hosted deploy path from earlier ticket notes and operator docs

The implementation landed as an embed-first slice rather than a full runtime cleanup slice.

The important technical discoveries were:

- the existing embedded assets under `pkg/web/public` were still the old inspector shell
- the hosted app at `https://hair-booking.app.scapegoat.dev` was also still serving that shell
- the repo already had enough deployment breadcrumbs to identify the existing Coolify application UUID: `uion8lttbypsijf8ww9b4c3e`
- the build needed a `go generate` step that copies `web/dist` into the embedded asset tree before Go compilation
- `.dockerignore` needed to exclude `web/node_modules` and `web/dist`, otherwise the Docker context was unnecessarily large

Local validation succeeded in three increasingly realistic layers:

- direct `go run` of the server in dev auth mode serving the embedded build
- browser validation that `/` becomes `/booking` and renders the React booking shell
- full Docker image build and container smoke using the same image shape that Coolify consumes

The hosted deploy path is partially unblocked now:

- the user added a Coolify token for `https://hq.scapegoat.dev`
- the CLI can reach the server
- but the token currently gets `403 You are not allowed to access the API` on application/deployment operations

So the embed code is ready, but the final hosted rollout still depends on either:

- a higher-privilege Coolify API token, or
- redeploying the existing app through the Coolify UI
