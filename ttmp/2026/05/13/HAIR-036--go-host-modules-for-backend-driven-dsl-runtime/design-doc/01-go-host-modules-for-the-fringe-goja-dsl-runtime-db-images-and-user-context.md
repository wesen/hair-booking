---
Title: 'Go Host Modules for the Fringe Goja DSL Runtime: DB, Images, and User Context'
Ticket: HAIR-036
Status: active
Topics:
    - backend
    - dsl
    - goja
    - sqlite
    - uploads
    - auth
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../../../../code/wesen/2026-05-03--goja-hosting-site/cmd/goja-site/serve.go
      Note: Reference Glazed --db flag pattern
    - Path: ../../../../../../../../../../code/wesen/2026-05-03--goja-hosting-site/pkg/app/server.go
      Note: Reference go-go-goja database module registration with preconfigured SQLite DB
    - Path: cmd/hair-booking/cmds/serve.go
      Note: Glazed serve command where DSL SQLite flags should be added and decoded
    - Path: pkg/dslgoja/modules_dsl.go
      Note: Current inline require/fringe DSL module implementation to refactor for host modules
    - Path: pkg/dslgoja/runtime.go
      Note: Goja flow runtime that must install host modules per session
    - Path: pkg/server/handlers_dsl.go
      Note: DSL start/get/event handlers that construct runtime sessions and should resolve user/upload context
    - Path: pkg/server/handlers_public.go
      Note: Existing intake photo upload validation and storage pattern to reuse
    - Path: pkg/server/http.go
      Note: ServerOptions/HandlerOptions path where host module settings must be carried
    - Path: pkg/storage/local.go
      Note: Existing BlobStore implementation for host image uploads
ExternalSources: []
Summary: 'Intern-facing analysis, design, and implementation guide for adding plumbing-oriented Go host modules to the backend-driven Fringe Goja DSL runtime: SQLite database access, image upload/rendering support, and user context.'
LastUpdated: 2026-05-13T19:28:00-04:00
WhatFor: ""
WhenToUse: ""
---


# Go Host Modules for the Fringe Goja DSL Runtime: DB, Images, and User Context

## Executive Summary

The Fringe backend-driven DSL runtime currently proves that Go can host a long-lived Goja JavaScript flow, register page-version-scoped callbacks, emit protobuf-defined page JSON, and let the browser dispatch opaque action ids back into Go. The next step is to give those JavaScript flows safe access to host capabilities without turning the Go side into the product logic layer.

This guide designs a plumbing-oriented host module layer for the Goja DSL runtime. The first host modules should provide SQLite-backed persistence, image upload/rendering primitives, and a stable `user` object. JavaScript should remain free to define the application-level intake flow, branching, copy, and UI composition. Go should own privileged low-level work: database connections, schema provisioning, upload validation, storage keys, session/user identity, and any runtime invariants that protect the host process.

The implementation should reuse the pattern from `/home/manuel/code/wesen/2026-05-03--goja-hosting-site`: a Glazed `serve` flag flows into server configuration, the app opens/provisions SQLite, a go-go-goja database module is created with `databasemod.WithPreconfiguredDB(...)`, and the runtime builder registers native modules by name. In `hair-booking`, the equivalent path is `cmd/hair-booking/cmds/serve.go -> pkg/server.NewHTTPServer -> pkg/dslgoja.NewRuntime -> FlowSession.StartFlow`.

## Design Goal

Provide host capabilities to JavaScript like this:

```js
const db = require("db");
const images = require("host/images");
const user = require("host/user");

function render(ctx) {
  const draft = db.queryOne(
    "SELECT payload_json FROM intake_drafts WHERE session_id = ?",
    ctx.sessionId,
  );

  const upload = images.createUploadIntent({
    purpose: "intake-photo",
    slot: "front",
    maxBytes: 10 * 1024 * 1024,
    accept: ["image/jpeg", "image/png", "image/webp"],
  });

  return page("intake-photos", "Add photos")
    .intake({
      step: 3,
      total: 7,
      title: "Add a few photos",
      nextLabel: "Keep going →",
      user: user.current(),
      actions: { next: ctx.action("next", () => budgetStep(ctx)) },
    })
    .add(
      n.photoTile("Front", {
        upload,
        actions: {
          uploaded: ctx.action("photoUploaded", (event) => {
            images.attachUploaded({
              uploadId: event.value.uploadId,
              draftId: draft.id,
              slot: "front",
            });
            return render(ctx);
          }),
        },
      }),
    );
}
```

The JavaScript decides what the intake app does. The host modules decide how to make low-level operations safe, durable, scoped, and observable.

## Current System Context

### Backend runtime today

The current Goja runtime lives primarily in:

```text
pkg/dslgoja/runtime.go
pkg/dslgoja/modules_dsl.go
pkg/dslgoja/flows.go
pkg/dslgoja/flows/intake.flow.js
pkg/server/handlers_dsl.go
```

Important runtime facts:

- `Runtime.StartFlow(ctx, flowID, source)` creates a new `goja.Runtime` per flow session.
- `installDSLModule(vm)` installs an inline CommonJS-like `require(...)` implementation for `fringe/dsl` only.
- `FlowSession` stores the Goja VM, current page, current action registry, retired action ids, processed event cache, and the JS state object.
- `ctx.action(name, callback, event)` registers a backend callback and returns an opaque action ref to the browser.
- Browser events are decoded as protobuf JSON `InteractionEvent` and dispatched to the registered Goja callback.
- The server returns protobuf JSON `FlowState` on success and protobuf JSON `DslError` on DSL errors.

### Existing frontend image surface

The DSL schema already includes a `photoTile` node kind and the prototype flow already has photo-related state. Existing public HTTP handlers also include an upload path for intake photos:

```text
pkg/server/handlers_public.go
handleIntakePhoto
```

That handler validates multipart uploads, calls intake service storage, and returns a public URL. The host module design should reuse the validation/storage concepts, but the DSL flow should not manually handle multipart parsing. JavaScript should receive an upload intent and later receive a normalized upload-complete event.

### Existing storage surface

Local blob storage is implemented in:

```text
pkg/storage/local.go
```

It saves an object under a sanitized key and returns:

```go
type SavedObject struct {
    StorageKey string
    URL        string
}
```

The image host module should use `hairstorage.BlobStore` rather than inventing a second storage abstraction.

### Existing auth/session surface

The HTTP server already constructs auth settings and optional session manager in:

```text
pkg/server/http.go
cmd/hair-booking/cmds/serve.go
pkg/auth/...
```

The Goja DSL runtime does not yet receive a user context. A host user object should be created by Go and exposed to JS per flow/session. The user object should be a safe snapshot, not a direct session manager handle.

## Reference Pattern: goja-hosting-site

The reference repo shows how to expose a preconfigured SQLite database module to Goja.

Relevant files:

```text
/home/manuel/code/wesen/2026-05-03--goja-hosting-site/cmd/goja-site/serve.go
/home/manuel/code/wesen/2026-05-03--goja-hosting-site/pkg/app/config.go
/home/manuel/code/wesen/2026-05-03--goja-hosting-site/pkg/app/server.go
```

The Glazed command adds a DB flag:

```go
type serveSettings struct {
    Addr       string `glazed:"addr"`
    DBPath     string `glazed:"db"`
    ScriptsDir string `glazed:"scripts"`
    Dev        bool   `glazed:"dev"`
}

fields.New("db", fields.TypeString,
    fields.WithDefault("./app.db"),
    fields.WithHelp("SQLite database path"),
)
```

The flag is decoded and passed into app config:

```go
srv, err := app.NewServer(app.Config{
    Addr: settings.Addr,
    DBPath: settings.DBPath,
    ScriptsDir: settings.ScriptsDir,
    Dev: settings.Dev,
})
```

The app opens SQLite and builds a go-go-goja database module:

```go
db, err := sql.Open("sqlite3", cfg.DBPath)

meteredDB := dbguard.NewMeteredDB(db, guard)
databaseModule := databasemod.New(
    databasemod.WithPreconfiguredDB(meteredDB),
    databasemod.WithConfigureEnabled(false),
)
dbAliasModule := databasemod.New(
    databasemod.WithName("db"),
    databasemod.WithPreconfiguredDB(meteredDB),
    databasemod.WithConfigureEnabled(false),
)

factory, err := engine.NewBuilder().
    WithModules(
        engine.NativeModuleSpec{
            ModuleID: "database:app",
            ModuleName: databaseModule.Name(),
            Loader: databaseModule.Loader,
        },
        engine.NativeModuleSpec{
            ModuleID: "database:db-alias",
            ModuleName: dbAliasModule.Name(),
            Loader: dbAliasModule.Loader,
        },
    ).
    Build()
```

Hair booking should follow the same configuration shape, but integrate it into the existing DSL runtime instead of the `goja-site` app server.

## Target Architecture

```text
hair-booking serve
  --dsl-sqlite-path var/dsl/app.db
  --dsl-sqlite-migrate=true
  --storage-local-dir ./uploads
  --public-base-url http://127.0.0.1:19080
        │
        ▼
cmd/hair-booking/cmds/serve.go
  Decode Glazed flags into ServeSettings / backend settings
        │
        ▼
pkg/server.NewHTTPServer(ServerOptions)
  Carries DSLHostOptions:
    - SQLite path
    - migrate/provision flag
    - BlobStore
    - public base URL
    - user resolver
        │
        ▼
pkg/dslgoja.NewRuntime(WithHostModules(...))
  Stores RuntimeHost:
    - *sql.DB
    - database module loader
    - image service
    - user provider
        │
        ▼
Runtime.StartFlow(...)
  Creates Goja VM
  Installs fringe/dsl
  Installs db/database, host/images, host/user
  Runs intake.flow.js
        │
        ▼
intake.flow.js
  JS composes app logic using plumbing APIs
        │
        ▼
Browser
  Renders photo upload widgets from DSL JSON
  Uploads images to host endpoint or direct intent URL
  Dispatches upload-complete events back to Goja
```

## Module Boundary Rules

### JavaScript owns app-level behavior

JavaScript should define:

- what pages exist,
- what labels/copy appear,
- what state fields matter,
- when to save a draft,
- when to show an uploaded image,
- when an anonymous user should be prompted for identity,
- how DB rows map into DSL nodes.

### Go owns host plumbing

Go should define:

- database connection lifecycle,
- SQLite schema provisioning,
- SQL driver imports,
- upload validation,
- storage key normalization,
- URL generation,
- session/user identity snapshot,
- limits, timeouts, and invariants,
- module registration and per-session scoping.

### Host modules should not be app-opinionated

Prefer:

```js
const db = require("db");
const images = require("host/images");
const user = require("host/user");
```

Avoid:

```js
const fringeIntake = require("fringe/intake");
fringeIntake.submitColorConsultation(...);
```

A `fringe/intake` module can exist later as a JS-authored helper module, but Go should expose plumbing primitives first.

## Part 1: SQLite Database Host Module

### Goal

Expose a preconfigured SQLite database to Goja using the go-go-goja database module, provision a starting schema, and add a CLI flag to select the database path.

### Proposed CLI flags

Add these fields to `ServeSettings` or a backend config section:

```go
type ServeSettings struct {
    ListenHost        string `glazed:"listen-host"`
    ListenPort        int    `glazed:"listen-port"`
    DSLSQLitePath     string `glazed:"dsl-sqlite-path"`
    DSLSQLiteMigrate  bool   `glazed:"dsl-sqlite-migrate"`
}
```

Recommended defaults:

```text
--dsl-sqlite-path ./var/fringe-dsl.sqlite
--dsl-sqlite-migrate true
```

Flag definitions:

```go
fields.New(
    "dsl-sqlite-path",
    fields.TypeString,
    fields.WithDefault("./var/fringe-dsl.sqlite"),
    fields.WithHelp("SQLite database path used by Goja DSL host modules"),
)
fields.New(
    "dsl-sqlite-migrate",
    fields.TypeBool,
    fields.WithDefault(true),
    fields.WithHelp("Provision or migrate the Goja DSL SQLite schema on startup"),
)
```

Pass through:

```go
httpServer, err := server.NewHTTPServer(serverCtx, server.ServerOptions{
    Host: settings.ListenHost,
    Port: settings.ListenPort,
    Version: c.version,
    DSLSQLitePath: settings.DSLSQLitePath,
    DSLSQLiteMigrate: settings.DSLSQLiteMigrate,
    // existing fields...
})
```

Then into handler/runtime construction:

```go
type ServerOptions struct {
    // existing fields...
    DSLSQLitePath    string
    DSLSQLiteMigrate bool
}

type HandlerOptions struct {
    // existing fields...
    DSLSQLitePath    string
    DSLSQLiteMigrate bool
}
```

### Database lifecycle

Create a small package:

```text
pkg/dslhost/db.go
pkg/dslhost/schema.sql
```

Responsibilities:

- create parent directory for the SQLite file,
- open `sqlite3`,
- set pragmas,
- provision schema if enabled,
- return `*sql.DB` plus cleanup function,
- create go-go-goja database modules.

Pseudocode:

```go
package dslhost

type DBOptions struct {
    Path    string
    Migrate bool
}

type DBHost struct {
    DB *sql.DB
    Path string
}

func OpenDB(ctx context.Context, opts DBOptions) (*DBHost, error) {
    if opts.Path == "" {
        opts.Path = "./var/fringe-dsl.sqlite"
    }
    if err := os.MkdirAll(filepath.Dir(opts.Path), 0o755); err != nil {
        return nil, err
    }
    db, err := sql.Open("sqlite3", opts.Path)
    if err != nil { return nil, err }

    if _, err := db.ExecContext(ctx, `PRAGMA journal_mode=WAL`); err != nil { ... }
    if _, err := db.ExecContext(ctx, `PRAGMA foreign_keys=ON`); err != nil { ... }
    if opts.Migrate {
        if err := ProvisionSchema(ctx, db); err != nil { ... }
    }
    return &DBHost{DB: db, Path: opts.Path}, nil
}
```

### Starting schema

The first schema should support DSL flow persistence and plumbing, not a final product data model.

```sql
CREATE TABLE IF NOT EXISTS dsl_flow_sessions (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_page_id TEXT,
  current_page_version INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dsl_intake_drafts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(session_id) REFERENCES dsl_flow_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dsl_uploads (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  purpose TEXT NOT NULL,
  slot TEXT,
  original_filename TEXT,
  content_type TEXT,
  size_bytes INTEGER,
  storage_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'stored',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(session_id) REFERENCES dsl_flow_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dsl_audit_events (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  user_id TEXT,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

This schema gives JavaScript a place to save drafts and uploaded image records without deciding storage internals.

### Exposing the database module

The reference repo uses:

```go
databasemod.New(databasemod.WithPreconfiguredDB(meteredDB), databasemod.WithConfigureEnabled(false))
```

In `hair-booking`, create runtime host options:

```go
type RuntimeHost struct {
    DB *sql.DB
    DBPath string
    BlobStore storage.BlobStore
    UserProvider UserProvider
}

func WithHost(host RuntimeHost) RuntimeOption {
    return func(rt *Runtime) { rt.host = host }
}
```

Then when a session VM is created:

```go
func (rt *Runtime) StartFlow(...) (...) {
    vm := goja.New()
    installDSLModule(vm)
    rt.installHostModules(vm, session)
    // load flow...
}
```

If using `engine.NewBuilder` is too large a refactor for the first step, there are two options:

1. Refactor `pkg/dslgoja` to use `go-go-goja/engine` and register the database module exactly like `goja-hosting-site`.
2. Keep the current plain `goja.New()` path and manually adapt module loading until the engine refactor is justified.

Because the user asked specifically to load the go-go-goja DB module, the cleaner implementation should use the engine builder or the module's loader contract directly. The reference pattern is the safer path.

### JavaScript examples

```js
const db = require("db");

function loadDraft(ctx) {
  const row = db.queryOne(
    "SELECT id, payload_json FROM dsl_intake_drafts WHERE session_id = ? ORDER BY updated_at DESC LIMIT 1",
    ctx.sessionId,
  );
  if (!row) return { id: null, payload: {} };
  return { id: row.id, payload: JSON.parse(row.payload_json) };
}

function saveDraft(ctx, state) {
  const id = state.draftId || crypto.randomUUID();
  db.exec(
    `INSERT INTO dsl_intake_drafts(id, session_id, user_id, payload_json, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json, updated_at = datetime('now')`,
    id,
    ctx.sessionId,
    require("host/user").current().id,
    JSON.stringify(state),
  );
  state.draftId = id;
}
```

If the database module does not expose `queryOne`, JS can use whichever shape `go-go-goja/modules/database` provides. The implementation guide should verify the actual method names while wiring tests.

## Part 2: Image Upload and Rendering Host API

### Goal

Give JavaScript a clean way to request image upload affordances and render uploaded images inside intake pages without handling multipart or storage internals.

### Conceptual flow

```text
JS render(ctx)
  calls images.createUploadIntent({ purpose, slot, accept, maxBytes })
        │
        ▼
Go host/images returns upload intent:
  { uploadId, method, url, fieldName, accept, maxBytes }
        │
        ▼
DSL page includes photoTile upload props
        │
        ▼
Browser uploads multipart file to /api/dsl/uploads/{uploadId}
        │
        ▼
Go validates and stores blob through BlobStore
        │
        ▼
Go records upload metadata in SQLite
        │
        ▼
Browser dispatches DSL event uploaded with { uploadId, url, storageKey }
        │
        ▼
JS updates state and rerenders image preview
```

### Host module API

```js
const images = require("host/images");

const upload = images.createUploadIntent({
  purpose: "intake-photo",
  slot: "front",
  accept: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 10 * 1024 * 1024,
});

const photo = images.get(upload.uploadId);
```

Return shape:

```json
{
  "uploadId": "upl_...",
  "method": "POST",
  "url": "/api/dsl/uploads/upl_...",
  "fieldName": "file",
  "accept": ["image/jpeg", "image/png", "image/webp"],
  "maxBytes": 10485760
}
```

Stored image shape:

```json
{
  "id": "upl_...",
  "url": "/uploads/dsl/flow_.../front.jpg",
  "storageKey": "dsl/flow_.../front.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 123456,
  "slot": "front"
}
```

### DSL node usage

```js
n.photoTile("Front", {
  state: photo ? "uploaded" : "empty",
  imageUrl: photo && photo.url,
  upload,
  actions: {
    uploaded: ctx.action("frontPhotoUploaded", (event) => {
      state.photos.front = event.value;
      saveDraft(ctx, state);
      return photosStep(ctx);
    }, "uploaded"),
  },
}).id("photo-front")
```

### Backend endpoint

Add a DSL upload endpoint:

```text
POST /api/dsl/uploads/{uploadId}
```

or, if upload intents should be session-scoped in the URL:

```text
POST /api/dsl/flows/{sessionId}/uploads/{uploadId}
```

Prefer the session-scoped URL initially:

```text
POST /api/dsl/flows/{sessionId}/uploads/{uploadId}
```

Reasons:

- easier user/session authorization,
- less global lookup surface,
- upload intent cannot be confused across sessions,
- aligns with flow session lifecycle.

Handler responsibilities:

- find flow session,
- verify upload intent exists and is active,
- parse multipart form,
- validate size and content type,
- save through `hairstorage.BlobStore`,
- insert/update `dsl_uploads`,
- return protobuf or JSON upload result.

The upload endpoint can remain outside protobuf initially because it is multipart. The metadata response can later get a protobuf message if needed.

### Frontend renderer work

`photoTile` currently displays upload-like UI but is not a real uploader. Add renderer behavior:

- if `props.upload` exists, render a file input or hidden input behind the tile,
- POST selected file to `props.upload.url` with field name `props.upload.fieldName`,
- dispatch backend event `uploaded` with returned metadata,
- render `props.imageUrl` as preview when present.

Pseudocode:

```tsx
function PhotoTileNode({ node, dispatchAction }) {
  const upload = node.props.upload;
  async function onFile(file: File) {
    const form = new FormData();
    form.set(upload.fieldName || "file", file);
    const response = await fetch(upload.url, { method: upload.method || "POST", body: form });
    const result = await response.json();
    dispatchAction("uploaded", result);
  }

  return <PhotoTile imageUrl={node.props.imageUrl} onFile={upload ? onFile : undefined} />;
}
```

### Invariants Go should enforce

- upload intent belongs to this flow session,
- upload intent has not expired,
- upload intent purpose is allow-listed,
- content type is allow-listed,
- size is below `maxBytes`,
- storage key is generated by Go, never trusted from JS/browser,
- uploaded image row is tied to session/user,
- repeated upload-complete events should be idempotent by upload id.

## Part 3: User Object Host API

### Goal

Expose a stable, safe user snapshot to JavaScript so flows can branch on logged-in status and display identity without knowing session manager internals.

### User object shape

```js
const user = require("host/user");

const current = user.current();
```

Anonymous:

```json
{
  "authenticated": false,
  "id": "anon:flow_...",
  "displayName": "Guest",
  "email": null,
  "roles": [],
  "claims": {},
  "sessionId": "flow_..."
}
```

Authenticated:

```json
{
  "authenticated": true,
  "id": "client_123",
  "displayName": "Ari Client",
  "email": "ari@example.com",
  "roles": ["client"],
  "claims": {
    "provider": "oidc",
    "subject": "..."
  },
  "sessionId": "flow_..."
}
```

### Why this object matters

The Goja flow should not call into `SessionManager`, inspect cookies, or parse auth claims. Instead, Go should resolve the user once at flow start or per request and expose a safe snapshot.

This allows JS to do:

```js
const user = require("host/user").current();

if (!user.authenticated) {
  return identityCaptureStep(ctx);
}

return bookingStep(ctx);
```

or:

```js
db.exec(
  "INSERT INTO dsl_audit_events(id, session_id, user_id, kind, payload_json) VALUES (?, ?, ?, ?, ?)",
  crypto.randomUUID(),
  ctx.sessionId,
  user.id,
  "photo_uploaded",
  JSON.stringify({ slot: "front" }),
);
```

### Runtime integration

Add host user to runtime/session options:

```go
type UserSnapshot struct {
    Authenticated bool              `json:"authenticated"`
    ID            string            `json:"id"`
    DisplayName   string            `json:"displayName"`
    Email         string            `json:"email,omitempty"`
    Roles         []string          `json:"roles"`
    Claims        map[string]string `json:"claims,omitempty"`
    SessionID     string            `json:"sessionId"`
}

type UserProvider interface {
    UserForFlow(ctx context.Context, flowID string, request *http.Request) (UserSnapshot, error)
}
```

Because current DSL start endpoint does not pass the request into `Runtime.StartFlow`, the practical first step is to resolve user in the HTTP handler and pass a snapshot into runtime:

```go
userSnapshot := h.resolveDSLUser(r)
session, result, err := h.dslFlows.runtime.StartFlow(
    r.Context(),
    flowID,
    dslgoja.DemoIntakeFlowSource,
    dslgoja.StartOptions{User: userSnapshot},
)
```

This implies changing `StartFlow` signature or adding an option struct.

### JS module implementation sketch

```go
func installUserModule(vm *goja.Runtime, user UserSnapshot) error {
    module := vm.NewObject()
    _ = module.Set("current", func() any { return user })
    _ = module.Set("isAuthenticated", func() bool { return user.Authenticated })
    _ = module.Set("hasRole", func(role string) bool {
        for _, candidate := range user.Roles {
            if candidate == role { return true }
        }
        return false
    })
    return registerRequireModule(vm, "host/user", module)
}
```

If/when the runtime moves to go-go-goja engine modules, implement this as a proper native module registrar rather than an inline installer.

## Required Runtime Refactor

The current `installDSLModule` defines a private JS object called `modules` inside an IIFE and installs `global.require`. That is fine for one module, but host modules need a real registration boundary.

### Current shape

```js
const modules = Object.create(null);
modules["fringe/dsl"] = { page, n };
global.require = function(name) {
  if (!modules[name]) throw new Error("unknown module: " + name);
  return modules[name];
};
```

### Target shape

Go should be able to register modules before flow source runs:

```go
registry := NewModuleRegistry(vm)
registry.RegisterJS("fringe/dsl", dslModuleObject)
registry.RegisterNative("host/user", userModuleObject)
registry.RegisterNative("host/images", imagesModuleObject)
registry.RegisterNative("db", databaseModuleLoader)
registry.InstallRequire()
```

Or use `go-go-goja/engine` so native modules follow the same contract as the reference repo.

### Transitional implementation

A small transitional registry can be implemented quickly:

```go
func installModuleRegistry(vm *goja.Runtime) (*goja.Object, error) {
    modules := vm.NewObject()
    require := func(call goja.FunctionCall) goja.Value {
        name := call.Argument(0).String()
        value := modules.Get(name)
        if goja.IsUndefined(value) {
            panic(vm.ToValue("unknown module: " + name))
        }
        return value
    }
    _ = vm.Set("__nativeModules", modules)
    _ = vm.Set("require", require)
    return modules, nil
}
```

Then `installDSLModule` registers into that object instead of hiding `modules` inside JS. This makes `host/user` and `host/images` straightforward. For the database module, prefer the official go-go-goja loader path if possible.

## Implementation Plan

### Step 1: Configuration and ticket plumbing

Files:

```text
cmd/hair-booking/cmds/serve.go
pkg/server/http.go
pkg/server/handlers_dsl.go
pkg/dslgoja/runtime.go
```

Add:

- `--dsl-sqlite-path`,
- `--dsl-sqlite-migrate`,
- optional `--dsl-host-modules` if a kill switch is desired.

Bubble settings:

```text
ServeSettings -> ServerOptions -> HandlerOptions -> dslFlowStore/runtime
```

### Step 2: SQLite host and schema provisioning

Files:

```text
pkg/dslhost/db.go
pkg/dslhost/schema.sql
pkg/dslhost/db_test.go
```

Implement:

- `OpenDB`,
- pragma setup,
- schema provisioning,
- close behavior,
- tests using `t.TempDir()`.

Acceptance:

```bash
go test ./pkg/dslhost -count=1
```

### Step 3: Register database module

Files:

```text
pkg/dslgoja/runtime.go
pkg/dslgoja/host_modules.go
pkg/dslgoja/host_modules_test.go
```

Implementation choice:

- Preferred: use `go-go-goja/engine` module builder as in `goja-hosting-site`.
- Acceptable short-term: call database module loader into current runtime if the API supports it cleanly.

Acceptance JS:

```js
const db = require("db");
db.exec("INSERT INTO dsl_audit_events(id, kind) VALUES (?, ?)", "evt_1", "test");
const row = db.queryOne("SELECT kind FROM dsl_audit_events WHERE id = ?", "evt_1");
if (row.kind !== "test") throw new Error("db module failed");
```

### Step 4: User module

Files:

```text
pkg/dslgoja/user_module.go
pkg/dslgoja/user_module_test.go
pkg/server/handlers_dsl.go
```

Implement:

- `UserSnapshot`,
- user resolution in DSL start handler,
- `require("host/user")`,
- `current()`,
- `isAuthenticated()`,
- `hasRole(role)`.

Acceptance JS:

```js
const user = require("host/user");
const current = user.current();
if (!current.sessionId) throw new Error("missing session id");
```

### Step 5: Image module and upload intent registry

Files:

```text
pkg/dslgoja/image_module.go
pkg/server/handlers_dsl_uploads.go
web/src/page-dsl/render.tsx
```

Implement:

- `images.createUploadIntent(opts)`,
- upload intent storage on `FlowSession`,
- session-scoped upload endpoint,
- upload validation,
- storage through `BlobStore`,
- SQLite upload row insertion,
- frontend `photoTile` upload behavior.

Acceptance JS:

```js
const images = require("host/images");
const upload = images.createUploadIntent({ purpose: "intake-photo", slot: "front" });
if (!upload.url || !upload.uploadId) throw new Error("upload intent failed");
```

### Step 6: Flow integration

Update:

```text
pkg/dslgoja/flows/intake.flow.js
```

Add minimal use of:

- `host/user` to personalize or branch,
- `db` to save draft state,
- `host/images` for photo upload intents.

Do not move app logic into Go.

### Step 7: Validation

Run:

```bash
go test ./... -count=1
cd web
pnpm test -- --runInBand
npx tsc --noEmit
pnpm build
```

Manual smoke:

```bash
devctl restart hair-booking-backend
devctl restart hair-booking-web
open http://127.0.0.1:5175/dsl-goja-demo
```

Verify:

- DB file is created,
- schema exists,
- JS can read/write through `db`,
- user object appears in debug/page JSON if exposed,
- photo upload intent appears in `photoTile`,
- selecting a file uploads and rerenders preview.

## API Reference Draft

### `require("db")`

Provided by go-go-goja database module. Exact method list should be confirmed from the module implementation. Expected use:

```js
db.exec(sql, ...args);
const rows = db.query(sql, ...args);
const row = db.queryOne(sql, ...args);
```

Rules:

- SQL is trusted script SQL, not browser SQL.
- Use placeholders for values.
- Keep schema provisioning in Go, not JS.
- Avoid exposing a `configure` function to JS; use a preconfigured DB.

### `require("host/images")`

```js
images.createUploadIntent({
  purpose: "intake-photo",
  slot: "front",
  accept: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 10485760,
});

images.get(uploadId);
images.list({ purpose: "intake-photo" });
```

### `require("host/user")`

```js
user.current();
user.isAuthenticated();
user.hasRole("client");
```

## Intern Checklist

Before coding:

- Read `pkg/dslgoja/runtime.go` until `newContextObject` is clear.
- Read `pkg/dslgoja/modules_dsl.go` to understand current `require` limitations.
- Read `pkg/server/handlers_dsl.go` to understand start/get/event flow APIs.
- Read `cmd/hair-booking/cmds/serve.go` to understand Glazed settings flow.
- Read the reference repo files:
  - `/home/manuel/code/wesen/2026-05-03--goja-hosting-site/cmd/goja-site/serve.go`
  - `/home/manuel/code/wesen/2026-05-03--goja-hosting-site/pkg/app/config.go`
  - `/home/manuel/code/wesen/2026-05-03--goja-hosting-site/pkg/app/server.go`

While coding:

- Keep host modules plumbing-oriented.
- Do not expose raw session manager objects to JS.
- Do not let JS choose storage keys.
- Do not create a second upload storage system.
- Do not change protobuf transport unless an upload metadata message is explicitly added.
- Add runtime integration tests that execute JavaScript through Goja.

After coding:

- Run Go tests.
- Run web tests/typecheck/build.
- Restart devctl services.
- Manually upload an image in the intake flow.
- Inspect the SQLite database with `sqlite3`.

## Open Questions

1. Should the database module be exposed as both `database` and `db`, as in `goja-hosting-site`, or only as `db`?
2. Should upload metadata responses become protobuf messages now, or stay JSON because the request is multipart?
3. Should JS get write access to all DSL tables or only a narrower `host/records` module later?
4. Should user snapshots be fixed at flow start or refreshed on every event dispatch?
5. Should flow state itself move into SQLite in the first host-module slice, or should DB access initially be available only to JS scripts?

## Recommended First Implementation Slice

The smallest useful first slice is:

1. Add `--dsl-sqlite-path` and `--dsl-sqlite-migrate` flags.
2. Open/provision SQLite on server start.
3. Register preconfigured `db` module in Goja flow sessions.
4. Add one runtime integration test that writes and reads `dsl_audit_events` from JS.
5. Add `host/user.current()` returning anonymous/dev user context.
6. Defer image upload to the second slice.

The second slice should add `host/images.createUploadIntent(...)`, the upload endpoint, and frontend `photoTile` upload behavior.
