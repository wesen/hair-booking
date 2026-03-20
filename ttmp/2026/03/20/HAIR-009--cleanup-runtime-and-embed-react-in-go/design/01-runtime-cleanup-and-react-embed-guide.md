---
Title: Runtime Cleanup And React Embed Guide
Ticket: HAIR-009
Status: active
Topics:
    - frontend
    - backend
    - cleanup
    - deploy
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/web/assets.go
      Note: Current embedded asset entrypoint
    - Path: pkg/web/public/index.html
      Note: Current embedded inspector shell
    - Path: pkg/server/http.go
      Note: Catch-all web serving logic
    - Path: web/package.json
      Note: React build commands
    - Path: web/src/main.tsx
      Note: Current routed shell entrypoint
    - Path: web/src/stylist/store/index.ts
      Note: Runtime Redux composition to simplify later
ExternalSources: []
Summary: Detailed guide for final runtime cleanup and embedding the built React app into the Go server after the stylist MVP work lands.
LastUpdated: 2026-03-20T18:45:00-04:00
WhatFor: Use this guide to make production hosting coherent and to remove lingering prototype/demo runtime state.
WhenToUse: Use after HAIR-006 and HAIR-007, not before.
---

# Runtime Cleanup And React Embed Guide

## Executive Summary

This ticket should happen only after the real stylist workflows exist.

Its job is to finish the application surface:

- production serves the built React app from Go
- the old embedded inspector shell is retired from being the main product entry
- lingering mock/demo state is removed from runtime code

## Why This Is Deferred

If cleanup happens too early, it cleans up the wrong abstractions.

The correct sequence is:

1. build the real stylist backend
2. build the real stylist frontend
3. then remove the scaffolding, mock state, and temporary runtime compromises

## Primary Goals

### 1. Embed React In Go

Production direction is now fixed:

- build the React app
- copy the build output into an embedded asset location
- serve that build from Go on `/`

This should replace the inspector shell as the default production experience.

### 2. Remove Prototype Runtime Residue

Targets likely include:

- seeded client and stylist constants still imported by runtime code
- slices that only existed to support demo data
- stale runtime flags that no longer matter once the real flows are live

### 3. Keep Storybook Separate

Storybook can keep:

- design reference fixtures
- deprecated but informative widgets
- experiments

But runtime should stop depending on those artifacts.

## Recommended Work Areas

### Build And Embed Pipeline

Likely steps:

- add a reproducible frontend build step
- copy build output into a Go-embedded directory
- update the catch-all handler to serve the built app in production mode
- keep the frontend dev proxy option for local integration work

### Runtime State Cleanup

Review every slice and seeded data file used by runtime pages.

Goal:

- RTK Query owns server data
- local component state owns ephemeral UI state
- Redux only keeps the minimal cross-screen state that still earns its keep

### Shell Cleanup

Once embedding is real:

- remove the inspector shell from the main production route
- keep any remaining auth/session inspector only as a debug path if still useful

## Implementation Order

### Phase 1

- inventory runtime dependencies on seeded/demo state
- identify the production build/embed path

### Phase 2

- wire frontend build artifacts into Go embedding
- update server routing for production assets

### Phase 3

- remove stale runtime slices and demo hydration paths
- prune dead flags and copy

### Phase 4

- add deployment and smoke documentation

## Pseudocode

```text
serveWeb(request):
  if local frontend proxy configured:
    proxy to vite
  else if embedded react build exists:
    serve embedded react app
  else:
    serve fallback inspector
```

```text
runtimeDataSource(data):
  if canonical backend data:
    use RTK Query
  if transient UI draft:
    keep local
  otherwise:
    delete demo-only runtime path
```

## Acceptance Criteria

- production `/` serves the embedded React app from Go
- the old inspector shell is no longer the main product entry
- runtime no longer depends on seeded demo state for core pages
- Storybook remains available without driving production behavior
