# Tasks

## Phase 1 — Ticket and Guide

- [x] Create HAIR-036 ticket for Go host modules.
- [x] Inspect the goja-hosting-site reference implementation for Glazed DB flag and go-go-goja database module registration.
- [x] Write intern-facing analysis/design/implementation guide.
- [x] Validate guide frontmatter.
- [x] Upload guide bundle to reMarkable.
- [x] Commit ticket docs.

## Phase 2 — Server Settings and CLI Plumbing

- [x] Add `--dsl-sqlite-path` Glazed flag to `cmd/hair-booking/cmds/serve.go`.
- [x] Add `--dsl-sqlite-migrate` Glazed flag to `cmd/hair-booking/cmds/serve.go`.
- [x] Choose defaults that work with devctl/local runs (`./var/fringe-dsl.sqlite`, migrate enabled).
- [x] Add matching fields to `ServeSettings`.
- [x] Add matching fields to `server.ServerOptions`.
- [x] Add matching fields to `server.HandlerOptions`.
- [x] Pass settings through `ServeSettings -> ServerOptions -> HandlerOptions` without touching frontend code.
- [x] Add log fields for DSL SQLite path and migration status at server startup.

## Phase 3 — SQLite Host DB Package and Schema Provisioning

- [x] Add `pkg/dslhost` package.
- [x] Add `pkg/dslhost/schema.sql` embedded with `go:embed`.
- [x] Add `pkg/dslhost/db.go` with `OpenDB(ctx, DBOptions)` and `Close` ownership rules.
- [x] Ensure parent directory creation for file-backed SQLite paths.
- [x] Open SQLite using `github.com/mattn/go-sqlite3` driver.
- [x] Apply SQLite pragmas (`foreign_keys=ON`, WAL for file DBs where appropriate, busy timeout if useful).
- [x] Provision starting schema when `Migrate` is true.
- [x] Add tables for `dsl_flow_sessions`, `dsl_intake_drafts`, `dsl_uploads`, and `dsl_audit_events`.
- [x] Add indexes for session/user/status lookups.
- [x] Add `pkg/dslhost/db_test.go` using `t.TempDir()` and verifying schema exists.
- [x] Add a no-migrate test that opens DB without creating schema.

## Phase 4 — Runtime Host Configuration Boundary

- [x] Add `RuntimeHost` or `HostOptions` type in/near `pkg/dslgoja` for DB, storage, and user/image services.
- [x] Add `WithHost(...)` or focused runtime options to `dslgoja.NewRuntime`.
- [x] Update `dslFlowStore` construction to receive configured runtime host dependencies.
- [x] Make host dependencies optional so existing pure runtime tests can still construct `dslgoja.NewRuntime()`.
- [x] Add tests that a runtime without host modules still runs the existing embedded intake flow.
- [x] Add tests that a runtime with host modules exposes those modules to JS.

## Phase 5 — Module Registry Refactor for Server-Side Host Modules

- [x] Refactor `installDSLModule` so module registration is Go-owned instead of hidden inside the current JS IIFE.
- [x] Preserve `require("fringe/dsl")` behavior exactly.
- [x] Add a small module registry helper that can register JS/native module objects before flow source execution.
- [x] Decide whether this slice directly uses `go-go-goja/engine.NewBuilder` or a transitional module registry.
- [x] If using the engine builder, follow the pattern from `/home/manuel/code/wesen/2026-05-03--goja-hosting-site/pkg/app/server.go`.
- [x] If using a transitional registry, document the later migration path to `engine.NewBuilder`.
- [x] Add runtime tests for `require("fringe/dsl")`, unknown module errors, and one host module.

## Phase 6 — Register go-go-goja Database Module

- [x] Import and wire `github.com/go-go-golems/go-go-goja/modules/database`.
- [x] Create a preconfigured database module with `databasemod.WithPreconfiguredDB(...)`.
- [x] Disable JS-side DB reconfiguration with `databasemod.WithConfigureEnabled(false)`.
- [x] Expose module as `require("db")`.
- [x] Decide whether to also expose `require("database")`; default should be only `db` unless compatibility is needed.
- [x] Add a Goja integration test that executes JS using `require("db")`.
- [x] Test `db.exec(...)` inserting into `dsl_audit_events`.
- [x] Test a query path by reading the inserted row back using the actual database module API.
- [x] Verify DB module is backed by the configured SQLite file, not an in-memory accidental DB.

## Phase 7 — User Host Module Server-Side Implementation

- [ ] Define `dslgoja.UserSnapshot` with `authenticated`, `id`, `displayName`, `email`, `roles`, `claims`, and `sessionId` JSON fields.
- [ ] Add server-side user resolution for DSL start requests.
- [ ] Support dev/anonymous mode without requiring OIDC.
- [ ] Pass `UserSnapshot` into flow session creation.
- [ ] Expose `require("host/user")`.
- [ ] Implement `user.current()`.
- [ ] Implement `user.isAuthenticated()`.
- [ ] Implement `user.hasRole(role)`.
- [ ] Ensure JS receives a snapshot, not a mutable auth/session manager object.
- [x] Add runtime tests for anonymous/dev user context.
- [ ] Add handler-level test proving a started flow receives a stable user snapshot.

## Phase 8 — Image Host Module Server-Side Foundation

- [x] Define upload intent model: `uploadId`, `sessionId`, `purpose`, `slot`, `accept`, `maxBytes`, `expiresAt`.
- [x] Add per-session upload intent registry to `FlowSession` or a server-owned store keyed by session id.
- [x] Expose `require("host/images")`.
- [x] Implement `images.createUploadIntent(options)`.
- [x] Implement `images.get(uploadId)` for completed uploads.
- [x] Implement `images.list(filter)` for session-scoped uploaded image metadata.
- [x] Enforce purpose allow-list (`intake-photo` initially).
- [x] Enforce max byte ceiling and content-type allow-list defaults.
- [x] Ensure JS/browser never controls final storage keys.
- [x] Add runtime tests for creating upload intents from JS.

## Phase 9 — Server Upload Endpoint and Storage Integration

- [x] Add session-scoped upload endpoint: `POST /api/dsl/flows/{sessionId}/uploads/{uploadId}`.
- [x] Verify the session exists and the upload intent belongs to that session.
- [x] Reject expired/unknown upload ids with protobuf DSL errors or endpoint-specific JSON errors documented in the guide.
- [x] Parse multipart form using the intent field name (`file` by default).
- [x] Reuse existing photo validation patterns from `pkg/server/handlers_public.go` where practical.
- [x] Save through the existing `hairstorage.BlobStore` abstraction.
- [x] Insert uploaded image metadata into `dsl_uploads`.
- [x] Return normalized metadata: `uploadId`, `url`, `storageKey`, `contentType`, `sizeBytes`, `slot`.
- [ ] Add handler tests for wrong session, expired intent, invalid content type, and oversized file.
- [x] Add handler test for successful image upload and metadata persistence.

## Phase 10 — Flow-Side Server Integration Only

- [x] Update `pkg/dslgoja/flows/intake.flow.js` to optionally require `db`, `host/user`, and `host/images`.
- [ ] Save/read a minimal draft or audit row through `db` from JS.
- [ ] Add `host/user.current()` data to a debug-safe place in flow logic or tests without exposing sensitive claims in page JSON by default.
- [x] Add image upload intents to photo tile props in the backend DSL page JSON.
- [x] Do not modify `web/` in this phase; frontend upload UI is being handled separately by a colleague.
- [x] Add backend/runtime tests asserting the emitted photo page contains upload intent props.

## Phase 11 — Server-Side Validation and Devctl Smoke

- [x] Run `go test ./pkg/dslhost ./pkg/dslgoja ./pkg/server -count=1`.
- [x] Run full `go test ./... -count=1`.
- [ ] Start/restart devctl backend only if web changes are not needed: `devctl restart hair-booking-backend`.
- [ ] Smoke `POST /api/dsl/flows/fringe.intake.v1/start` and verify protobuf `FlowState` still returns.
- [ ] Verify configured SQLite file is created.
- [ ] Inspect SQLite schema with `sqlite3`.
- [ ] Trigger JS DB write path and verify row exists.
- [ ] Create an upload intent through the flow and verify it appears in page JSON/API response.
- [ ] Upload a small test image with `curl` to the server upload endpoint.
- [ ] Verify upload metadata row exists and stored file URL is usable.

## Phase 12 — Documentation, Changelog, and Handoff

- [ ] Update HAIR-036 diary after each implementation slice.
- [ ] Update HAIR-036 changelog with commit hashes and related files.
- [ ] Update the design guide if implementation choices differ from the initial plan.
- [ ] Document exact JS APIs shipped (`db`, `host/user`, `host/images`).
- [ ] Document exact CLI flags and defaults.
- [ ] Add copy/paste smoke commands for DB and upload verification.
- [ ] Commit server-side work in focused slices.
