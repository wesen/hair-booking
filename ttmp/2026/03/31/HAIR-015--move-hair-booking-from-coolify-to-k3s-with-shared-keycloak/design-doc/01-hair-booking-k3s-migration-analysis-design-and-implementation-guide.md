---
Title: hair-booking K3s migration analysis, design, and implementation guide
Ticket: HAIR-015
Status: active
Topics:
    - deploy
    - keycloak
    - ops
    - backend
    - postgres
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../2026-03-27--hetzner-k3s/docs/source-app-deployment-infrastructure-playbook.md
      Note: Canonical source-repo to GitOps deployment pipeline for this cluster
    - Path: ../../../../../../../2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/deployment.yaml
      Note: |-
        Closest existing app-package pattern for a Go + OIDC + Postgres app on the K3s cluster
        Reference K3s app deployment pattern
    - Path: ../../../../../../../2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/deployment.yaml
      Note: |-
        Shared Keycloak deployment already running on the target platform
        Existing shared Keycloak runtime on K3s
    - Path: cmd/hair-booking/cmds/serve.go
      Note: |-
        Server bootstrap sequence, database open/migrate behavior, and startup log surface
        Server bootstrap
    - Path: docs/deployments/hair-booking-coolify.md
      Note: |-
        Current hosted contract on Coolify
        Current Coolify deployment contract
    - Path: pkg/auth/oidc.go
      Note: |-
        Keycloak-backed login, callback, and logout flow
        OIDC login
    - Path: pkg/config/backend.go
      Note: |-
        Database URL, upload storage, public base URL, and auto-migrate configuration
        Database URL
    - Path: pkg/server/http.go
      Note: |-
        Runtime route table and service wiring for booking, portal, stylist, auth, and health endpoints
        Runtime route surface and service construction
ExternalSources: []
Summary: Detailed intern-facing guide for moving hair-booking from Coolify onto the Hetzner K3s + Argo CD platform, including current-state architecture, gap analysis, target topology, secret contracts, Kubernetes resource design, rollout phases, and validation steps.
LastUpdated: 2026-03-31T10:11:11.944679527-04:00
WhatFor: Use this guide to understand how hair-booking works today and to implement the K3s migration without rediscovering the system architecture from scratch.
WhenToUse: Use before editing deployment automation, Kubernetes manifests, Vault secret layouts, Keycloak Terraform, or the final cutover plan.
---


# hair-booking K3s migration analysis, design, and implementation guide

## Executive Summary

`hair-booking` is already very close to the shape that the K3s platform wants.
It is a single Go HTTP process, it serves its own embedded React frontend, it
expects environment variables for runtime configuration, it speaks to Postgres,
and it uses Keycloak through standard OIDC browser redirects. That is a much
better fit for Argo CD than the earlier Coolify-driven workflow because there is
no extra frontend service and no service mesh or multi-pod coordination to model
first.

The migration should still be treated as a small system project rather than a
manifest copy. The app currently depends on:

- a built image from the repo root `Dockerfile`
- a database URL and automatic SQL migrations
- a writable upload directory for intake and appointment photos
- a session secret and OIDC issuer/client settings
- a Keycloak realm and browser client with exact callback URLs

The recommended rollout is:

1. keep the current Coolify deployment as rollback
2. add a proper source-repo deployment contract for image publishing and GitOps
   handoff
3. add a dedicated `hair-booking` package under
   `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize`
4. provision a dedicated app database inside the shared cluster PostgreSQL
   service using the existing Vault-backed bootstrap `Job` pattern
5. mount a PVC for uploads because `hair-booking` stores photos on local disk
6. provision the `hair-booking` realm/client against the K3s Keycloak instance
   on a parallel hostname
7. validate on a parallel K3s hostname before public DNS cutover

The most important design decision is to migrate in two layers, not one:

- first move the application runtime onto K3s
- then cut the app's Keycloak issuer from the current external
  `auth.scapegoat.dev` path to the in-cluster K3s Keycloak if and only if the
  K3s-side realm/client and login flow are proven healthy

That keeps the blast radius smaller and gives the operator a real rollback
boundary.

## Locked Decisions

The following rollout inputs are now treated as fixed unless changed later by
the user:

### Public hostname

- use `https://hair-booking.yolo.scapegoat.dev`

This means the design should stop treating the hostname as an open question. All
K3s-side ingress, Keycloak redirect URIs, and public-base URLs should align to
that host.

### Image distribution

- use private GHCR

This means the K3s package must include the image-pull secret path. A public
anonymous pull assumption would be incorrect for this rollout.

### Keycloak cutover

- switch the app to the K3s Keycloak as part of the migration

This removes the earlier fallback recommendation of keeping the external issuer
for the first K3s app slice. The rollout still needs a careful validation order,
but the target state is now explicit:

- issuer: `https://auth.yolo.scapegoat.dev/realms/hair-booking`
- browser client: `hair-booking-web`
- app host: `https://hair-booking.yolo.scapegoat.dev`

### Shared Terraform logout support

- assume the shared browser-client Terraform path does not yet fully cover the
  post-logout redirect requirement and verify/fix it during implementation

That matters because the app's logout callback path is constructed in
`pkg/auth/oidc.go:300-326`, and login-only validation would miss this gap.

## Problem Statement And Scope

`hair-booking` currently runs on Coolify and is documented that way in
`/home/manuel/code/wesen/hair-booking/docs/deployments/hair-booking-coolify.md`.
The runtime contract is a single container on port `8080` with OIDC auth and a
database URL injected by the platform. That works, but it is still mostly
imperative and operator-driven:

- deployment is triggered through Coolify rather than through GitOps
- runtime env is managed in the Coolify UI rather than by Vault + VSO + GitOps
- there is no K3s package for the app yet
- the source repo does not yet publish immutable GHCR app images or open GitOps
  PRs for manifest updates

The target platform already exists in
`/home/manuel/code/wesen/2026-03-27--hetzner-k3s`. Its operating model is
Terraform -> cloud-init -> K3s -> Argo CD -> Kustomize packages with Vault/VSO
for secrets and Traefik + cert-manager for ingress/TLS. The app needs to be
shaped to fit that control loop.

### In scope

- explain what `hair-booking` is and how it runs today
- define the target K3s topology
- define the secret, database, ingress, and PVC contracts
- define the file-level changes across the app repo, GitOps repo, and Keycloak
  Terraform repo
- define a rollout and rollback order suitable for an intern

### Out of scope

- redesigning the booking product or data model
- replacing Keycloak with another identity provider
- introducing S3/object storage for uploads in the first K3s slice
- scaling the app horizontally beyond one replica
- implementing the migration in this ticket

## Current-State Architecture

### What the application is

At runtime, `hair-booking` is one Go web server that serves three browser
surfaces out of one binary:

- `/booking`
  - public intake and booking flow
- `/portal`
  - authenticated client portal
- `/stylist`
  - authenticated stylist workspace

The React entrypoint chooses which surface to render by inspecting the current
path in `/home/manuel/code/wesen/hair-booking/web/src/main.tsx:25-80`.

The HTTP server registers the app routes in
`/home/manuel/code/wesen/hair-booking/pkg/server/http.go:208-245`. The important
public-facing routes are:

- `GET /healthz`
- `GET /api/info`
- `GET /api/me`
- `POST /api/intake`
- `POST /api/intake/{id}/photos`
- `GET /api/availability`
- `POST /api/appointments`
- `GET /api/stylist/*`
- `GET /auth/login`
- `GET /auth/callback`
- `GET /auth/logout`
- `GET /auth/logout/callback`

### How the process boots

The `serve` command in
`/home/manuel/code/wesen/hair-booking/cmd/hair-booking/cmds/serve.go:101-181`
does the following on startup:

```text
load auth settings
  -> load backend settings
  -> open Postgres if DATABASE_URL is present
  -> auto-run embedded SQL migrations when auto-migrate is true
  -> create the configured blob store
  -> construct the HTTP server
  -> listen on 0.0.0.0:<port>
```

Two details matter for K3s:

1. database boot is optional only when the env var is absent; in production it
   is effectively required because portal and stylist flows depend on DB-backed
   services
2. SQL migrations currently run inside the app process, which is acceptable for
   a single replica rollout but should be called out as a scaling boundary

### Auth model

The auth settings live in
`/home/manuel/code/wesen/hair-booking/pkg/auth/config.go:20-167`.
In OIDC mode the app requires:

- `HAIR_BOOKING_AUTH_SESSION_SECRET`
- `HAIR_BOOKING_OIDC_ISSUER_URL`
- `HAIR_BOOKING_OIDC_CLIENT_ID`
- `HAIR_BOOKING_OIDC_REDIRECT_URL`

The callback and logout flow lives in
`/home/manuel/code/wesen/hair-booking/pkg/auth/oidc.go:144-312`.
The app performs OIDC discovery, redirects to Keycloak, exchanges the auth code,
verifies the ID token, and then writes its own signed session cookie.

The session cookie format lives in
`/home/manuel/code/wesen/hair-booking/pkg/auth/session.go:18-205`.
This is not a server-side session store. It is an HMAC-signed cookie containing
the app's selected claims. Operational consequences:

- rotating the session secret invalidates all active sessions
- pods do not need shared session storage
- any deployment that changes the secret value will log users out immediately

The current stylist authorization layer still uses env allowlists for email and
subject until the HAIR-014 auth cleanup is fully reflected in runtime behavior.
That means the K3s runtime secret may still need:

- `HAIR_BOOKING_STYLIST_ALLOWED_EMAILS`
- `HAIR_BOOKING_STYLIST_ALLOWED_SUBJECTS`

### Persistence model

The app uses embedded SQL migrations from
`/home/manuel/code/wesen/hair-booking/pkg/db/migrations.go:14-88`.
The base schema in
`/home/manuel/code/wesen/hair-booking/pkg/db/migrations/0001_init.sql:1-129`
defines the main domain tables:

- `clients`
- `services`
- `intake_submissions`
- `intake_photos`
- `appointments`
- `appointment_photos`
- `maintenance_plans`
- `maintenance_items`
- `notification_prefs`
- `schedule_blocks`
- `schedule_overrides`

Later slices add `intake_reviews` and stylist-oriented indexes in
`0004_add_intake_reviews.sql:1-15` and
`0005_add_stylist_support.sql:1-6`.

The schema tells an intern what the app really is: a booking system with an
authenticated client identity, intake submission workflow, photo uploads,
scheduled appointments, and a stylist back office.

### Upload storage model

Uploads currently go through the local blob store in
`/home/manuel/code/wesen/hair-booking/pkg/storage/local.go:20-64`.
The store writes files under the configured base directory and exposes them
through `/uploads/<key>`.

The upload validation path in
`/home/manuel/code/wesen/hair-booking/pkg/server/photo_upload.go:13-38` accepts
JPEG, PNG, or WebP files up to 10 MiB.

This is the single biggest application-specific difference between
`hair-booking` and the simpler K3s app packages: `hair-booking` needs durable
storage, not just a Deployment and a Service.

### Container and current deployment shape

The root `Dockerfile` at
`/home/manuel/code/wesen/hair-booking/Dockerfile:1-41` builds the React app,
embeds the built assets into Go, and produces one Linux binary image.
The entrypoint at
`/home/manuel/code/wesen/hair-booking/scripts/docker-entrypoint.hair-booking.sh:8-22`
starts:

```text
hair-booking serve --listen-host 0.0.0.0 --listen-port 8080 --auth-mode <env>
```

The current hosted Coolify contract is documented in
`/home/manuel/code/wesen/hair-booking/docs/deployments/hair-booking-coolify.md:13-170`
and the operator path is documented in
`/home/manuel/code/wesen/hair-booking/docs/deployments/hair-booking-coolify-playbook.md:13-221`.
The live known-good public shape is:

- app: `https://hair-booking.app.scapegoat.dev`
- issuer: `https://auth.scapegoat.dev/realms/hair-booking`
- client: `hair-booking-web`
- health: `/healthz`

### Current topology diagram

```text
GitHub branch
  -> Coolify build from Dockerfile
  -> single container on Coolify host
  -> env vars injected in Coolify UI
  -> app talks to external Postgres
  -> app redirects browser to external Keycloak
```

## Gap Analysis: Coolify To K3s

### Gap 1: Deployment control plane

The K3s platform expects a source-repo contract described in
`/home/manuel/code/wesen/2026-03-27--hetzner-k3s/docs/source-app-deployment-infrastructure-playbook.md:48-132`:

- build and publish immutable images in the source repo
- update GitOps manifests in the infra repo
- let Argo CD reconcile the cluster

`hair-booking` does not have that contract yet. The repo currently has test and
release workflows, but no dedicated GHCR image-publish workflow and no
`deploy/gitops-targets.json`. That means the first implementation work is not in
Kubernetes at all; it is in the app repo's deployment automation.

### Gap 2: Vault/VSO runtime secret shape

Coolify injects runtime env values directly. The K3s platform expects Kubernetes
`Secret` objects rendered by Vault Secrets Operator. `draft-review` shows the
standard app-side pattern:

- service account with optional image pull secret
- `VaultAuth`
- `VaultStaticSecret`
- `Deployment` env refs

See:

- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/serviceaccount.yaml:1-8`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/runtime-secret.yaml:1-14`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/deployment.yaml:32-76`

`hair-booking` needs the same secret delivery pattern, but with its own env
keys and with upload storage settings added.

### Gap 3: Database provisioning

The app only understands `HAIR_BOOKING_DATABASE_URL`, but the K3s platform
provisions per-app databases inside a shared PostgreSQL service using a
Vault-backed bootstrap `Job`. The canonical explanation is in
`/home/manuel/code/wesen/2026-03-27--hetzner-k3s/docs/vault-backed-postgres-bootstrap-job-pattern.md`.

`draft-review` and `keycloak` both already use this pattern:

- bootstrap `Job`
- runtime secret for app credentials
- separate admin secret for the bootstrap job

See:

- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/db-bootstrap-job.yaml:1-72`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/db-bootstrap-job.yaml:1-72`

`hair-booking` needs the same layout, but the runtime secret must carry both:

- a full precomputed database URL for the app
- split `database`, `username`, and `password` values for the bootstrap job

### Gap 4: Upload persistence

`draft-review` already has a media PVC at
`/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/persistentvolumeclaim.yaml`
and mounts `/data` in the app pod. `hair-booking` needs the equivalent because
its photo store is local-disk based. Without a PVC:

- uploaded intake photos vanish on pod reschedule
- appointment photos vanish on restart
- the app appears functional but loses business-critical data

### Gap 5: Keycloak issuer boundary

The K3s cluster already runs Keycloak under Argo CD:

- application:
  `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/applications/keycloak.yaml:1-23`
- deployment:
  `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/deployment.yaml:1-101`
- ingress:
  `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/ingress.yaml:1-27`

That K3s-side Keycloak currently uses hostname `auth.yolo.scapegoat.dev`.
`hair-booking`, however, is currently documented against external issuer
`https://auth.scapegoat.dev/realms/hair-booking`.

This creates a migration choice:

- deploy the app to K3s first but keep external Keycloak temporarily
- or move both app runtime and Keycloak issuer in one step

The first path is safer and is the recommended order.

### Gap 6: DNS and hostnames

Coolify documentation assumes `hair-booking.app.scapegoat.dev`.
The K3s cluster examples use `*.yolo.scapegoat.dev`.
An intern needs an explicit hostname policy before they start editing manifests:

- parallel K3s host for pre-cutover validation:
  - recommended: `hair-booking.yolo.scapegoat.dev`
- optional final public host:
  - either keep the K3s hostname
  - or repoint the existing public hostname later

## Proposed Solution

## Target Topology

The target deployment should look like this:

```text
hair-booking source repo
  -> GitHub Actions builds and publishes ghcr.io/wesen/hair-booking:sha-XXXXXXX
  -> source repo opens GitOps PR against 2026-03-27--hetzner-k3s

2026-03-27--hetzner-k3s repo
  -> gitops/applications/hair-booking.yaml
  -> gitops/kustomize/hair-booking/*
  -> Argo CD reconciles namespace, secrets, DB bootstrap Job, PVC, Deployment, Service, Ingress

Vault
  -> runtime app secret
  -> optional GHCR pull secret
  -> bootstrap DB admin secret stays in infra path

shared cluster PostgreSQL
  -> hair_booking database
  -> hair_booking_app role

shared K3s Keycloak
  -> realm hair-booking
  -> client hair-booking-web

browser
  -> https://hair-booking.yolo.scapegoat.dev
  -> app redirects to https://auth.yolo.scapegoat.dev/realms/hair-booking
```

## Control Planes And Ownership

### 1. App repo: build and deployment metadata

The source repo should own:

- image build inputs
- CI test commands
- immutable GHCR image publishing
- GitOps target metadata
- PR automation that updates the GitOps manifest pin

This follows the K3s platform guidance in
`/home/manuel/code/wesen/2026-03-27--hetzner-k3s/README.md:97-143` and
`source-app-deployment-infrastructure-playbook.md:48-120`.

Recommended source-repo files to add or update:

- `.github/workflows/publish-image.yaml`
- `deploy/gitops-targets.json`
- `scripts/open_gitops_pr.py` or the local standardized equivalent

For structure, copy the target metadata shape used by `draft-review`:

```json
{
  "targets": [
    {
      "name": "hair-booking-prod",
      "gitops_repo": "wesen/2026-03-27--hetzner-k3s",
      "gitops_branch": "main",
      "manifest_path": "gitops/kustomize/hair-booking/deployment.yaml",
      "container_name": "hair-booking"
    }
  ]
}
```

That mirrors
`/home/manuel/code/wesen/2026-03-24--draft-review/deploy/gitops-targets.json:1-10`.

### 2. GitOps repo: Kubernetes desired state

Add a new package:

```text
gitops/applications/hair-booking.yaml
gitops/kustomize/hair-booking/
  namespace.yaml
  serviceaccount.yaml
  db-bootstrap-serviceaccount.yaml
  vault-connection.yaml
  vault-auth.yaml
  db-bootstrap-vault-auth.yaml
  runtime-secret.yaml
  image-pull-secret.yaml            # only if GHCR is private
  postgres-admin-secret.yaml
  db-bootstrap-script-configmap.yaml
  db-bootstrap-job.yaml
  persistentvolumeclaim.yaml
  deployment.yaml
  service.yaml
  ingress.yaml
  kustomization.yaml
```

The package shape should follow
`/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/kustomization.yaml:1-16`
because `draft-review` is the closest analogue: one Go app, OIDC auth, shared
Postgres, PVC-backed local storage, and HTTPS ingress.

The Argo `Application` should follow the same pattern as
`draft-review.yaml:1-23`:

- namespace: `argocd`
- destination namespace: `hair-booking`
- source path: `gitops/kustomize/hair-booking`
- automated sync with `CreateNamespace=true` and `ServerSideApply=true`

### 3. Shared Keycloak Terraform repo

The current repo-local Keycloak Terraform scaffold is explicitly historical:
`/home/manuel/code/wesen/hair-booking/deployments/terraform/keycloak/README.md:1-25`.
The canonical Keycloak management now lives in the shared Terraform repo.

Recommended new environment:

```text
/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/k3s-parallel/
```

Recommended settings:

- Keycloak URL: `https://auth.yolo.scapegoat.dev`
- realm name: `hair-booking`
- client ID: `hair-booking-web`
- public app URL: `https://hair-booking.yolo.scapegoat.dev`
- redirect URI:
  `https://hair-booking.yolo.scapegoat.dev/auth/callback`
- post-logout redirect URI:
  `https://hair-booking.yolo.scapegoat.dev/auth/logout/callback`

Important note: the app's logout flow constructs a post-logout redirect URI in
`/home/manuel/code/wesen/hair-booking/pkg/auth/oidc.go:300-326`.
The K3s-side Keycloak client must accept that exact logout callback URL or
logout will fail even when login succeeds.

## Kubernetes Resource Design

### Namespace

- name: `hair-booking`
- one app namespace, no shared application resources outside it

### Service account

- name: `hair-booking`
- if GHCR package is private, attach an image pull secret in the same style as
  `draft-review/serviceaccount.yaml:1-8`

### Runtime secret

Recommended Vault path:

```text
kv/apps/hair-booking/prod/runtime
```

Recommended keys:

```text
database=hair_booking
username=hair_booking_app
password=<generated>
database_url=postgres://hair_booking_app:<password>@postgres.postgres.svc.cluster.local:5432/hair_booking?sslmode=disable
session_secret=<long-random-string>
oidc_issuer_url=https://auth.yolo.scapegoat.dev/realms/hair-booking
oidc_client_secret=<generated-client-secret>
oidc_redirect_url=https://hair-booking.yolo.scapegoat.dev/auth/callback
public_base_url=https://hair-booking.yolo.scapegoat.dev
storage_local_dir=/data/uploads
stylist_allowed_emails=<csv or empty>
stylist_allowed_subjects=<csv or empty>
```

The split values exist because the app container and the DB bootstrap job need
different secret shapes.

### PostgreSQL bootstrap admin secret

Reuse the exact pattern that Keycloak already uses:

- `VaultStaticSecret` pointing at `infra/postgres/cluster`
- separate bootstrap service account and `VaultAuth`

See:

- `keycloak-postgres-admin-secret.yaml:1-17`
- `keycloak-db-bootstrap-vault-auth.yaml`
- `keycloak-db-bootstrap-job.yaml:28-63`

### DB bootstrap job

Create `hair_booking` database and `hair_booking_app` role using the shared
bootstrap job pattern. Pseudocode:

```text
read cluster Postgres admin secret
read app runtime secret

psql as cluster admin:
  if role hair_booking_app does not exist:
    create it
  else:
    alter its password

  if database hair_booking does not exist:
    create database hair_booking owner hair_booking_app

  grant all privileges on database hair_booking to hair_booking_app
```

Suggested runtime annotations:

- sync wave `1`
- hook `Sync`
- hook-delete-policy `BeforeHookCreation,HookSucceeded`

That matches the existing draft-review and keycloak bootstrap jobs.

### Deployment

Recommended deployment characteristics:

- replicas: `1`
- image: `ghcr.io/<owner>/<repo>:sha-XXXXXXX`
- `imagePullPolicy: IfNotPresent`
- service account: `hair-booking`
- mount PVC at `/data`
- set `HAIR_BOOKING_STORAGE_LOCAL_DIR=/data/uploads`
- keep `HAIR_BOOKING_AUTO_MIGRATE=true` for the first single-replica rollout

Recommended env contract:

```text
HAIR_BOOKING_LISTEN_HOST=0.0.0.0
HAIR_BOOKING_LISTEN_PORT=8080
HAIR_BOOKING_DATABASE_URL <- secret key database_url
HAIR_BOOKING_AUTH_MODE=oidc
HAIR_BOOKING_AUTH_SESSION_SECRET <- secret key session_secret
HAIR_BOOKING_OIDC_ISSUER_URL <- secret key oidc_issuer_url
HAIR_BOOKING_OIDC_CLIENT_ID=hair-booking-web
HAIR_BOOKING_OIDC_CLIENT_SECRET <- secret key oidc_client_secret
HAIR_BOOKING_OIDC_REDIRECT_URL <- secret key oidc_redirect_url
HAIR_BOOKING_PUBLIC_BASE_URL <- secret key public_base_url
HAIR_BOOKING_STORAGE_MODE=local
HAIR_BOOKING_STORAGE_LOCAL_DIR <- secret key storage_local_dir
HAIR_BOOKING_AUTO_MIGRATE=true
```

Optional:

```text
HAIR_BOOKING_STYLIST_ALLOWED_EMAILS
HAIR_BOOKING_STYLIST_ALLOWED_SUBJECTS
```

Probes:

- readiness: `GET /healthz`
- liveness: `GET /healthz`

### PVC

Recommended PVC:

- name: `hair-booking-uploads`
- mounted path root: `/data`
- actual upload directory inside the app: `/data/uploads`

This is required because the local store in `pkg/storage/local.go` writes
directly to filesystem paths. Without a PVC the app would silently lose photos
after rescheduling.

### Service and ingress

Recommended service:

- port `80`
- target port `http`

Recommended ingress:

- hostname: `hair-booking.yolo.scapegoat.dev`
- ingress class: `traefik`
- cert-manager cluster issuer: `letsencrypt-prod`
- TLS secret: `hair-booking-tls`

This should mirror the simple ingress pattern used by:

- `draft-review/ingress.yaml:1-27`
- `draft-review/service.yaml:1-17`

## Deployment Pipeline Design

The desired deployment pipeline is:

```text
git push in hair-booking
  -> GitHub Actions runs tests and builds container image
  -> GitHub Actions publishes immutable GHCR tag
  -> source repo updates the K3s deployment manifest pin
  -> PR lands in 2026-03-27--hetzner-k3s
  -> Argo CD sees new image pin
  -> Kubernetes rolls one new pod
```

The one thing an intern will forget is the first bootstrap apply. The K3s repo
explicitly documents that Argo does not auto-discover a brand-new `Application`
from Git alone:

- `source-app-deployment-infrastructure-playbook.md:79-104`
- `README.md:118-128`

So the first deployment requires:

```bash
cd /home/manuel/code/wesen/2026-03-27--hetzner-k3s
export KUBECONFIG=$PWD/.cache/kubeconfig-tailnet.yaml
kubectl apply -f gitops/applications/hair-booking.yaml
kubectl -n argocd annotate application hair-booking argocd.argoproj.io/refresh=hard --overwrite
```

After that, future GitOps PR merges should be enough.

## API And Runtime References

### Route reference

| Route | Purpose | Auth |
| --- | --- | --- |
| `/healthz` | pod health check | none |
| `/booking` | public booking shell | none |
| `/portal` | client portal shell | browser session after login |
| `/stylist` | stylist shell | browser session plus stylist authorization |
| `/api/info` | runtime metadata, auth mode, issuer, client id | none |
| `/api/me` | current browser session and client profile | browser session |
| `/api/intake` | create booking intake submission | none |
| `/api/intake/{id}/photos` | upload intake photos | none |
| `/api/availability` | available booking slots | none |
| `/api/appointments` | create appointment | none |
| `/auth/login` | OIDC login redirect | none |
| `/auth/callback` | OIDC callback | none |
| `/auth/logout` | local session clear + IdP logout redirect | browser session |

### Environment reference

The most important production env vars are already documented in
`docs/deployments/hair-booking-coolify.md:81-114`. The K3s deployment should
carry the same logical values, but delivered through Kubernetes secrets rather
than Coolify UI fields.

Additional K3s-specific production values:

- `HAIR_BOOKING_STORAGE_MODE=local`
- `HAIR_BOOKING_STORAGE_LOCAL_DIR=/data/uploads`
- `HAIR_BOOKING_PUBLIC_BASE_URL=https://hair-booking.yolo.scapegoat.dev`
- `HAIR_BOOKING_AUTO_MIGRATE=true`

## Detailed Implementation Plan

### Phase 0: Confirm rollout boundaries

Decide these three things before writing manifests:

1. the parallel K3s hostname
2. whether GHCR will be public or private
3. whether the first K3s rollout uses external Keycloak or the K3s Keycloak

Recommended answers:

1. `https://hair-booking.yolo.scapegoat.dev`
2. use private GHCR and wire the Vault-backed pull-secret path as part of the
   initial rollout
3. switch directly to the K3s Keycloak during the migration

### Phase 1: Source repo automation

Files in `/home/manuel/code/wesen/hair-booking`:

- add `.github/workflows/publish-image.yaml`
- add `deploy/gitops-targets.json`
- add a GitOps PR helper script if the team standard requires it

Recommended reusable source material from
`/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling`:

- workflow template:
  - `templates/github/publish-image-ghcr.template.yml`
- target metadata example:
  - `examples/platform/image-gitops-targets.example.json`
- PR helper:
  - `scripts/gitops/open_gitops_pr.py`
- control-plane doc:
  - `docs/platform/source-repo-to-gitops-pr.md`

Validation:

```bash
go test ./...
npm --prefix web run typecheck
docker build -t hair-booking:k3s-smoke .
```

CI success criteria:

- GHCR image exists
- tag uses the short `sha-XXXXXXX` form expected by the K3s platform

### Phase 2: Shared Keycloak Terraform

Files in `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking`:

- add `envs/k3s-parallel/main.tf`
- add `envs/k3s-parallel/versions.tf`
- add `envs/k3s-parallel/providers.tf`
- add `envs/k3s-parallel/terraform.tfvars.example`

Validation:

```bash
terraform -chdir=keycloak/apps/hair-booking/envs/k3s-parallel validate
terraform -chdir=keycloak/apps/hair-booking/envs/k3s-parallel plan -input=false
terraform -chdir=keycloak/apps/hair-booking/envs/k3s-parallel apply -input=false
```

Success criteria:

- realm exists on `auth.yolo.scapegoat.dev`
- client exists with correct callback URLs
- logout callback is accepted

### Phase 3: K3s package

Files in `/home/manuel/code/wesen/2026-03-27--hetzner-k3s`:

- create `gitops/kustomize/hair-booking/*`
- create `gitops/applications/hair-booking.yaml`

Start by copying the `draft-review` package, then change:

- namespace
- image name
- env vars
- PVC name
- hostname
- secret names

### Phase 4: Vault secret material

Populate:

- `kv/apps/hair-booking/prod/runtime`
- `kv/apps/hair-booking/prod/image-pull` if needed

Verify in cluster:

```bash
kubectl -n hair-booking get vaultauth,vaultstaticsecret,secret
kubectl -n hair-booking describe secret hair-booking-runtime
```

### Phase 5: First cluster bootstrap

Commands:

```bash
cd /home/manuel/code/wesen/2026-03-27--hetzner-k3s
export KUBECONFIG=$PWD/.cache/kubeconfig-tailnet.yaml

kubectl apply -f gitops/applications/hair-booking.yaml
kubectl -n argocd annotate application hair-booking argocd.argoproj.io/refresh=hard --overwrite
kubectl -n argocd get application hair-booking
kubectl -n hair-booking get pods,jobs,pvc,ingress,secret
```

Watch ordering:

```text
sync wave -2/-1
  -> service accounts, vault auth, vault static secrets
sync wave 1
  -> DB bootstrap job
sync wave 2
  -> deployment and service
sync wave 3
  -> ingress
```

### Phase 6: Smoke tests

Run in this order:

1. `GET /healthz`
2. `GET /` returns `307 -> /booking`
3. `GET /booking` returns the React shell
4. `GET /api/info` shows the expected issuer and client id
5. `GET /auth/login` redirects to the intended Keycloak issuer
6. complete a browser login and verify `GET /api/me`
7. upload an intake photo
8. restart the pod and confirm the uploaded photo still exists

### Phase 7: Cutover

Only after the parallel K3s path is proven:

- switch public DNS if desired
- update runbooks to point at K3s as canonical
- leave Coolify intact until at least one real booking/login cycle has completed

## Testing And Validation Strategy

### Source repo checks

```bash
go test ./...
npm --prefix web run typecheck
docker build -t hair-booking:k3s-check .
```

### Manifest checks

```bash
kubectl kustomize gitops/kustomize/hair-booking
kubectl -n argocd get application hair-booking -o jsonpath='{.status.sync.status} {.status.health.status}{"\n"}'
```

### Runtime checks

```bash
curl -ksS https://hair-booking.yolo.scapegoat.dev/healthz
curl -ksSI https://hair-booking.yolo.scapegoat.dev/
curl -ksS https://hair-booking.yolo.scapegoat.dev/api/info | jq
curl -ksSI https://hair-booking.yolo.scapegoat.dev/auth/login
```

### Persistence checks

```text
upload photo
  -> record returned upload URL
  -> restart deployment pod
  -> fetch same URL again
  -> confirm object still exists
```

### Rollback trigger points

Rollback should be immediate if any of these fail on the K3s parallel host:

- app boot never reaches healthy `/healthz`
- Keycloak login cannot complete
- `/api/me` works without DB wiring only partially and portal/stylist flows fail
- photo persistence fails after pod restart

If that happens:

- stop at the K3s parallel host
- do not switch public DNS
- keep Coolify live

## Risks, Alternatives, And Open Questions

### Risk: local-disk upload storage

Risk:
- the app currently depends on local filesystem storage

Impact:
- bad PVC wiring means data loss

Mitigation:
- treat PVC verification as a release blocker

### Risk: session secret rotation logs everyone out

Risk:
- session cookie contents are signed by one shared secret

Impact:
- secret replacement invalidates active browser sessions immediately

Mitigation:
- do not rotate the secret casually during rollout debugging

### Risk: Keycloak move and app move together

Risk:
- switching the app runtime and the issuer simultaneously makes failures harder
  to localize

Recommendation:
- stage them separately unless there is a strong reason not to

### Alternative: keep using external Keycloak permanently

This is operationally valid. The app could run on K3s while still using
`auth.scapegoat.dev`. That is the simplest first app-runtime migration and may
be the correct answer if the K3s Keycloak migration timeline slips.

### Alternative: replace local storage with S3 first

This would remove the PVC requirement, but it is explicitly not the current app
behavior. The backend config still returns "s3 storage mode is not implemented
yet" in `/home/manuel/code/wesen/hair-booking/cmd/hair-booking/cmds/serve.go:131-137`.
Do not plan the first K3s rollout around functionality the app does not have.

### Open questions

1. Should the first K3s app rollout keep the current public hostname or use a
   parallel `yolo` hostname?
   Resolved: use `hair-booking.yolo.scapegoat.dev`.
2. Is the `hair-booking` source repository intended to publish public or private
   GHCR images?
   Resolved: private GHCR.
3. Should the first K3s app rollout keep the external Keycloak issuer or switch
   directly to the K3s Keycloak?
   Resolved: switch to the K3s Keycloak.
4. Has the shared Terraform browser-client module already been updated to carry
   valid post-logout redirect URIs for `hair-booking`, or does it need the same
   fix that `draft-review` required?
   Current assumption: it still needs explicit verification or a fix.
5. Are the stylist env allowlists still required at runtime after the HAIR-014
   work, or can the K3s runtime secret omit them?

## References

### App repo

- `/home/manuel/code/wesen/hair-booking/cmd/hair-booking/cmds/serve.go:101-181`
- `/home/manuel/code/wesen/hair-booking/pkg/server/http.go:108-245`
- `/home/manuel/code/wesen/hair-booking/pkg/auth/config.go:20-167`
- `/home/manuel/code/wesen/hair-booking/pkg/auth/oidc.go:144-326`
- `/home/manuel/code/wesen/hair-booking/pkg/auth/session.go:18-205`
- `/home/manuel/code/wesen/hair-booking/pkg/config/backend.go:22-115`
- `/home/manuel/code/wesen/hair-booking/pkg/storage/local.go:20-64`
- `/home/manuel/code/wesen/hair-booking/pkg/server/photo_upload.go:13-38`
- `/home/manuel/code/wesen/hair-booking/pkg/db/migrations/0001_init.sql:1-129`
- `/home/manuel/code/wesen/hair-booking/pkg/db/migrations/0004_add_intake_reviews.sql:1-15`
- `/home/manuel/code/wesen/hair-booking/pkg/db/migrations/0005_add_stylist_support.sql:1-6`
- `/home/manuel/code/wesen/hair-booking/web/src/main.tsx:25-80`
- `/home/manuel/code/wesen/hair-booking/Dockerfile:1-41`
- `/home/manuel/code/wesen/hair-booking/scripts/docker-entrypoint.hair-booking.sh:8-22`
- `/home/manuel/code/wesen/hair-booking/docs/deployments/hair-booking-coolify.md:13-230`
- `/home/manuel/code/wesen/hair-booking/docs/deployments/hair-booking-coolify-playbook.md:13-221`

### K3s platform repo

- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/README.md:1-143`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/docs/source-app-deployment-infrastructure-playbook.md:48-152`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/docs/vault-backed-postgres-bootstrap-job-pattern.md`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/applications/draft-review.yaml:1-23`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/kustomization.yaml:1-16`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/deployment.yaml:1-101`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/runtime-secret.yaml:1-14`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/db-bootstrap-job.yaml:1-72`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/service.yaml:1-17`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/ingress.yaml:1-27`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/applications/keycloak.yaml:1-23`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/deployment.yaml:1-101`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/keycloak-runtime-secret.yaml:1-14`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/keycloak-postgres-admin-secret.yaml:1-17`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/keycloak-bootstrap-admin-secret.yaml:1-17`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/db-bootstrap-job.yaml:1-72`
- `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/ingress.yaml:1-27`

### Related hair-booking tickets

- `/home/manuel/code/wesen/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/design/01-hair-booking-keycloak-realm-and-social-login-guide.md`
- `/home/manuel/code/wesen/hair-booking/ttmp/2026/03/26/HAIR-013--audit-booking-flow-inventory-and-calendar-booking-gaps/design/01-booking-flow-inventory-and-gap-analysis.md`
- `/home/manuel/code/wesen/hair-booking/ttmp/2026/03/26/HAIR-014--move-stylist-authorization-to-keycloak-roles-and-groups/design/01-keycloak-role-and-group-based-stylist-auth-guide.md`
