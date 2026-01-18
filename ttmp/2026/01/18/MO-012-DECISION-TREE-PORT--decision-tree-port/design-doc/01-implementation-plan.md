---
Title: Implementation Plan
Ticket: MO-012-DECISION-TREE-PORT
Status: active
Topics:
    - frontend
    - go
    - porting
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../../../../.codex/skills/go-web-frontend-embed/references/full-playbook.md
      Note: Embed workflow referenced in the plan.
    - Path: ttmp/2026/01/18/MO-012-DECISION-TREE-PORT--decision-tree-port/analysis/01-hair-stylist-intake-asset-analysis.md
      Note: Source analysis that informs the plan.
ExternalSources: []
Summary: Plan to port hair-stylist-intake to Go + React/RTK with SQLite, no OAuth, no AI assistant, and embedded frontend assets.
LastUpdated: 2026-01-18T17:18:33-05:00
WhatFor: Guide implementation sequencing and key decisions for the Go port.
WhenToUse: Use while executing the port to track progress and rationale.
---


# Implementation Plan

## Executive Summary

Port the existing hair-stylist-intake decision tree app into this Go repo with a React + RTK Query frontend. The backend will use SQLite (no OAuth, no AI assistant). The UI will use Bootstrap per repo guidelines and be embedded into the Go binary via `go:embed` with a Vite build output served under `/static/`.

## Problem Statement

We need a maintainable Go implementation of the decision tree engine and admin/editor UI that preserves core intake functionality while removing OAuth and AI features. The app must run as a single Go binary in production with a fast dev loop (Vite HMR + Go API) and a clean static asset contract.

## Proposed Solution

- **Backend**: A Go HTTP server exposing JSON REST endpoints for decision trees and bookings, backed by SQLite. The decision tree DSL parser + engine is ported from the JS implementation, with canonical pricing/duration logic in Go.
- **Frontend**: A Vite-powered React app using Redux Toolkit + RTK Query, styled with Bootstrap. Routes mirror the existing app (`/`, `/intake/:id`, `/summary/:id`, `/admin`).
- **Embedding**: Use the go-web-frontend-embed workflow to build assets into `internal/web/embed/public/` and serve them from Go under `/static/` with SPA fallback.

## Design Decisions

1. **SQLite as the only database**
   - Reduces infra needs and aligns with the new constraint.
2. **No OAuth and no AI assistant**
   - Simplifies scope and removes external dependencies.
3. **REST instead of tRPC**
   - Easier to implement in Go; RTK Query will consume JSON endpoints.
4. **Serve assets under `/static/`**
   - Matches repo web guideline; Vite `base` must be set accordingly.
5. **Centralize pricing/duration logic in Go**
   - UI mirrors server calculations to avoid mismatch; expose logic in responses.

## Alternatives Considered

- **Keep tRPC**: Rejected due to Go backend and RTK Query preference.
- **Keep Tailwind**: Rejected to match repo guideline requiring Bootstrap.
- **Add a minimal auth layer**: Deferred; current requirement is “no OAuth.”

## Implementation Plan

1. **Backend skeleton**
   - Create `cmd/decision-tree-server/main.go`, `internal/server` HTTP router.
   - Add SQLite connection + migrations for decision trees and bookings.
2. **Port decision tree engine**
   - Implement DSL parser/validator in Go (YAML → structs).
   - Implement pricing/duration rules and unit tests.
3. **REST API**
   - Decision trees CRUD + validate endpoints.
   - Bookings create + list + get endpoints.
4. **Frontend scaffold**
   - Create `ui/` Vite React app with RTK Query + Bootstrap.
   - Implement pages: Home, Intake, Summary, Admin (YAML + visual editor v1).
5. **Embed & build pipeline**
   - Add `internal/web` embed package, `go generate` builder.
   - Update Makefile targets for dev + build.
6. **Polish + tests**
   - Add minimal backend tests for parser/engine.
   - Sanity check SPA fallback + `/static/` asset resolution.

## Open Questions

- Do we want a lightweight admin guard (e.g., env flag) despite “no OAuth”?
- Should the first pass include the full visual editor or only YAML editing?
