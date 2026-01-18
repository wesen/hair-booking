---
Title: Hair Stylist Intake Asset Analysis
Ticket: MO-012-DECISION-TREE-PORT
Status: active
Topics:
    - frontend
    - go
    - porting
DocType: analysis
Intent: long-term
Owners: []
RelatedFiles:
    - Path: assets/hair-stylist-intake/client/src/pages/Admin.tsx
      Note: Admin editor capabilities and flows.
    - Path: assets/hair-stylist-intake/client/src/pages/Intake.tsx
      Note: Client intake flow and pricing display.
    - Path: assets/hair-stylist-intake/docs/DSL-SPECIFICATION.md
      Note: DSL schema details used to map parser and rules.
    - Path: assets/hair-stylist-intake/drizzle/schema.ts
      Note: Database schema for users
    - Path: assets/hair-stylist-intake/server/decision-engine.ts
      Note: Pricing
    - Path: assets/hair-stylist-intake/server/dsl-parser.ts
      Note: Current YAML parsing and validation logic.
    - Path: assets/hair-stylist-intake/server/routers.ts
      Note: API surface and auth requirements.
ExternalSources: []
Summary: Survey of the hair-stylist-intake asset bundle and a Go + React/RTK porting plan aligned with embedded-frontend guidelines.
LastUpdated: 2026-01-18T17:16:53-05:00
WhatFor: Guide the port from the existing Node/Vite/tRPC app to a Go backend with a React/RTK frontend and embedded static assets.
WhenToUse: Use before implementing the Go port to understand feature scope, API surface, and constraints.
---


# Hair Stylist Intake Asset Analysis

## Scope

This analysis covers the `assets/hair-stylist-intake/` bundle and maps its functionality, data model, and runtime topology to a future Go backend with a React + RTK Query frontend. It also folds in the embedded-frontend guidelines (dev/prod split, `go:embed`, and `go generate` workflow) and the repo web guidelines (Bootstrap, RTK Query, static assets under `/static/`). **Updated constraints:** use SQLite, remove OAuth, and omit the AI assistant feature.

## Asset Inventory (high-level)

- **Root layout**: `client/` (React/Vite), `server/` (Express + tRPC), `shared/` (types/constants), `drizzle/` (schema + migrations), `docs/` (DSL docs).
- **Tooling**: Vite 7, React 19, tRPC 11, Drizzle ORM + MySQL, js-yaml for DSL parsing, Vitest for tests (source assets). Go port will target SQLite.
- **Build topology**: `vite build` → `dist/public`, `esbuild server/_core/index.ts` → `dist/index.js`; Express serves Vite in dev and static assets in prod.

## Functional Surface (what the app does)

### Client UX

- **Intake flow** (`/intake/:id`): interactive decision tree, dynamic price + duration totals, progress indicator, service summary, and back navigation.
- **Summary flow** (`/summary/:id`): uses session storage data from intake to show booking summary and submit booking.
- **Admin panel** (`/admin`): create/edit decision trees; YAML editor with validation; visual editor; AI assistant for DSL generation (to be removed in the Go port).

### Admin Features

- Tree CRUD (create/update/delete) with publish/unpublish.
- DSL validation on every edit.
- Visual editor that round-trips YAML <→ form state.
- AI chat assistant to generate or modify DSL from text or images (omit in Go port).

### Decision Tree Engine

- YAML DSL parser + validation; enforced root node and node references.
- Pricing logic: base price + combo price (`price_with_cut`) if a “cut” service was selected earlier.
- Duration logic: `duration` or `books_for` parsed to minutes.
- Rules engine: `if_service_includes` + `apply_combo_pricing`, and optional duration adjustments.

## Data Model (current SQL schema)

- **decision_trees**: `name`, `description`, `dsl_content`, `is_published`, `is_preset`, `version`, `created_by`, timestamps.
- **bookings**: `decision_tree_id`, selected services (JSON string), total price/duration, applied rules, client contact details, preferred time, status, notes.

## API Surface (tRPC)

- **decisionTrees**: `list` (published), `listAll` (auth), `getById`, `create`, `update`, `delete`, `validate`.
- **bookings**: `create` (public), `list`, `getById` (auth).
- **ai**: `chat` (auth) with text + image inputs; system prompt generates DSL.
- **auth**: `me` and `logout` via cookie/session.
**Port note:** OAuth and AI assistant are removed from the Go scope, so the port will not implement `ai` or `auth` equivalents.

## Runtime & Build Topology

- **Dev**: Express server injects Vite middleware and serves `client/index.html` with HMR.
- **Prod**: Express serves `dist/public` with SPA fallback to `index.html`.
- **Bundling**: `vite build` for client, `esbuild` for server entry.

## Porting to Go + React/RTK (proposed mapping)

### Backend (Go)

- **HTTP surface**: replace tRPC with JSON REST endpoints that mirror the existing router structure, but without auth or AI:
  - `GET /api/decision-trees` (published)
  - `GET /api/decision-trees/all` (admin view; no auth in v1)
  - `GET /api/decision-trees/{id}`
  - `POST /api/decision-trees`
  - `PATCH /api/decision-trees/{id}`
  - `DELETE /api/decision-trees/{id}`
  - `POST /api/decision-trees/validate`
  - `POST /api/bookings`
  - `GET /api/bookings`
  - `GET /api/bookings/{id}`
- **Decision tree engine**: implement parser/validator in Go using `gopkg.in/yaml.v3` (or `sigs.k8s.io/yaml`) with explicit schema validation. Port the pricing/duration logic into a shared Go package so the UI doesn’t duplicate rules.
- **DB layer**: map schema to Go models using SQLite; keep `dsl_content` as text; store `selected_services` as JSON for portability.
- **Auth**: remove OAuth for v1; admin routes are unprotected unless a later auth layer is added.
- **AI assistant**: remove from scope.

### Frontend (React + RTK Query)

- Replace tRPC hooks with RTK Query endpoints; centralize `DecisionTree` and `Booking` types in a shared `types.ts`.
- Store decision tree state in a local slice (selected services, totals) and keep calculation logic in one place (prefer backend for canonical results).
- Rebuild UI using Bootstrap (repo guideline), replacing Tailwind/shadcn components.
- Replace Wouter with React Router (or keep Wouter if desired), but ensure SPA routing is consistent with Go’s fallback handler.

## Embedded Frontend Guidelines (Go)

The go-web-frontend-embed playbook fits this port, with two adjustments to honor repo web guidelines:

- **Static asset path**: serve built assets under `/static/` (not `/assets/`), and ensure Vite `base` points to `/static/` so built `index.html` references the correct URL prefix.
- **SPA mount**: keep the SPA at `/` with fallback, but ensure the static handler never shadows `/api/*` (and `/ws` if used).

Suggested layout:

- `ui/` — Vite React app
- `ui/dist/public/` — build output (Vite)
- `internal/web/embed/public/` — canonical static dir for `go:embed`
- `internal/web/` — embed + SPA handler + `go generate` runner

Dev topology:

- Vite on `:3000` with proxy `/api` → `:3001`
- Go API on `:3001`

Build topology:

- `go generate ./internal/web` runs `bun run build` (preferred by repo guidelines) and copies to `internal/web/embed/public`.
- `go build -tags embed` uses `go:embed` to serve the SPA from a single binary.

## Gaps / Risks to Resolve

- **Admin access**: without OAuth, admin routes will be open unless we add a lightweight guard.
- **Logic duplication**: current UI duplicates pricing/duration logic; Go port should centralize and expose consistent rules.
- **Styling switch**: current UI is Tailwind + shadcn; port should move to Bootstrap to satisfy repo guidelines.

## Recommended Next Steps

1. Decide on API contract (REST vs generated) and finalize endpoint list.
2. Port DSL parser + engine to Go with unit tests derived from existing vitest specs.
3. Implement database models + migrations for `decision_trees` and `bookings`.
4. Stand up React + RTK Query frontend with Bootstrap and basic pages (Home, Intake, Summary, Admin).
5. Add `go generate` + `go:embed` bridge, ensuring `/static/` asset prefix.
