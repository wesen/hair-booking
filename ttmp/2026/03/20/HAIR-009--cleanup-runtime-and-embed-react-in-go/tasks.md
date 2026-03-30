# Tasks

## Preconditions

- [x] Complete HAIR-006 stylist backend core
- [x] Complete HAIR-007 stylist frontend core

## Analysis And Planning

- [ ] Inventory runtime use of seeded/demo data across booking, portal, and stylist surfaces
- [x] Confirm the final React build/embed path for production
- [x] Confirm whether the old inspector shell should remain as a debug-only route

## React Embed In Go

- [x] Add reproducible frontend build and asset-copy workflow
- [x] Embed the built React assets into Go
- [x] Serve the embedded React app from `/` in production mode
- [x] Preserve frontend-dev proxy behavior for local development
- [x] Add tests around the serving strategy where practical
- [ ] Trigger a hosted Coolify rollout with an API token that has application access

## Runtime Cleanup

- [ ] Remove seeded runtime data dependencies from production pages
- [ ] Shrink or remove Redux slices that only existed for demo data
- [ ] Keep only justified cross-screen runtime state in Redux
- [ ] Remove stale non-MVP copy or hidden dead-end entrypoints that remain after stylist work lands

## Validation

- [x] Add deployment/runbook notes for embedded React serving
- [x] Run `go test ./...`
- [x] Run `npm --prefix web run typecheck`
- [x] Run a final browser smoke against the embedded production shell
- [x] Run a Docker image smoke against the embedded production shell
- [ ] Verify the hosted shell after deployment no longer serves the legacy inspector
