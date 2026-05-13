# Tasks

## Phase 1 — Ticket and Guide

- [x] Create HAIR-036 ticket for Go host modules.
- [x] Inspect the goja-hosting-site reference implementation for Glazed DB flag and go-go-goja database module registration.
- [x] Write intern-facing analysis/design/implementation guide.
- [x] Validate guide frontmatter.
- [x] Upload guide bundle to reMarkable.
- [x] Commit ticket docs.

## Phase 2 — SQLite Host Module Foundation

- [ ] Add `--dsl-sqlite-path` Glazed flag.
- [ ] Add `--dsl-sqlite-migrate` Glazed flag.
- [ ] Bubble settings through `ServeSettings -> ServerOptions -> HandlerOptions -> dslgoja.Runtime`.
- [ ] Add SQLite open/provision package and starting schema.
- [ ] Register go-go-goja database module as `db` for flow scripts.
- [ ] Add Goja integration tests for `require("db")`.

## Phase 3 — User Host Module

- [ ] Define `UserSnapshot` and user provider/resolver.
- [ ] Expose `require("host/user")` with `current()`, `isAuthenticated()`, and `hasRole(role)`.
- [ ] Add runtime tests for anonymous/dev user context.

## Phase 4 — Image Upload Host Module

- [ ] Define upload intent model and per-session registry.
- [ ] Expose `require("host/images")` with `createUploadIntent`, `get`, and `list`.
- [ ] Add session-scoped upload endpoint.
- [ ] Save images via existing `hairstorage.BlobStore`.
- [ ] Record upload metadata in SQLite.
- [ ] Update frontend `photoTile` rendering to upload and dispatch `uploaded` events.

## Phase 5 — Flow Integration and Validation

- [ ] Use `db`, `host/user`, and `host/images` in `intake.flow.js`.
- [ ] Run Go/web validation.
- [ ] Smoke test live flow with DB file creation and image upload.
