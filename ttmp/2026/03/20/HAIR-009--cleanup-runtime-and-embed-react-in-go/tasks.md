# Tasks

## Preconditions

- [ ] Complete HAIR-006 stylist backend core
- [ ] Complete HAIR-007 stylist frontend core

## Analysis And Planning

- [ ] Inventory runtime use of seeded/demo data across booking, portal, and stylist surfaces
- [ ] Confirm the final React build/embed path for production
- [ ] Confirm whether the old inspector shell should remain as a debug-only route

## React Embed In Go

- [ ] Add reproducible frontend build and asset-copy workflow
- [ ] Embed the built React assets into Go
- [ ] Serve the embedded React app from `/` in production mode
- [ ] Preserve frontend-dev proxy behavior for local development
- [ ] Add tests around the serving strategy where practical

## Runtime Cleanup

- [ ] Remove seeded runtime data dependencies from production pages
- [ ] Shrink or remove Redux slices that only existed for demo data
- [ ] Keep only justified cross-screen runtime state in Redux
- [ ] Remove stale non-MVP copy or hidden dead-end entrypoints that remain after stylist work lands

## Validation

- [ ] Add deployment/runbook notes for embedded React serving
- [ ] Run `go test ./...`
- [ ] Run `npm --prefix web run typecheck`
- [ ] Run a final browser smoke against the embedded production shell
