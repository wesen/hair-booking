---
Title: Investigation diary
Ticket: HAIR-015
Status: active
Topics:
    - deploy
    - keycloak
    - ops
    - backend
    - postgres
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../2026-03-27--hetzner-k3s/docs/source-app-deployment-infrastructure-playbook.md
      Note: Deployment-pipeline contract for the target platform
    - Path: ../../../../../../../2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/db-bootstrap-job.yaml
      Note: Reference database bootstrap job pattern
    - Path: ../../../../../../../2026-03-27--hetzner-k3s/gitops/kustomize/draft-review/deployment.yaml
      Note: Used as the closest existing app-package template on the K3s cluster
    - Path: ../../../../../../../2026-03-27--hetzner-k3s/gitops/kustomize/keycloak/deployment.yaml
      Note: Used to understand the shared K3s Keycloak runtime already available to the app
    - Path: docs/deployments/hair-booking-coolify-playbook.md
      Note: Operational evidence for the current hosted runtime
    - Path: docs/deployments/hair-booking-coolify.md
      Note: Current production deployment contract that framed the migration problem
    - Path: pkg/server/http.go
      Note: Used to verify the actual route surface and app runtime boundaries
    - Path: pkg/storage/local.go
      Note: Explains why K3s rollout needs a PVC
ExternalSources: []
Summary: Chronological research diary for building the hair-booking K3s migration guide, including source inspection, K3s pattern comparison, discovered gaps, and delivery steps.
LastUpdated: 2026-03-31T14:10:00-04:00
WhatFor: Continue or review the migration-design work without rereading the entire shell history.
WhenToUse: Use when you need the exact evidence trail, commands run, or document-delivery steps for HAIR-015.
---


# Investigation diary

## Goal

Capture the research and documentation pass for planning the move from Coolify
to the Hetzner K3s platform.

## Step 1: Create the K3s migration ticket and write the implementation guide

The goal of this step was not to implement the migration yet. It was to produce
the ticket workspace and the detailed, intern-facing design artifact that makes
the implementation tractable. That meant the work had to start with evidence:
how `hair-booking` actually boots, how its auth and storage work, what the
current Coolify contract looks like, and which K3s package patterns already
exist and are stable enough to copy.

The main architectural conclusion from the investigation was that the migration
is primarily a control-plane alignment exercise. The app itself already matches
the K3s platform well because it is one Go process with embedded frontend
assets. The gaps are in image publishing, Vault/VSO secret delivery, per-app
database bootstrap, PVC-backed uploads, and K3s-side Keycloak realm/client
provisioning.

### Prompt Context

**User prompt (verbatim):** "Deploy hair-booking by moving it from coolify over to k3s using keycloak and all that, see /home/manuel/code/wesen/2026-03-27--hetzner-k3s .

Create a new ticket to do that, you can also look at how /home/manuel/code/wesen/2026-03-24--draft-review does it.

Create a detailed analysis / design / implementation guide that is very detailed for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file
  references.
  It should be very clear and detailed. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Create a new `hair-booking` ticket, inspect the current app plus the K3s platform and the `draft-review` deployment pattern, then write a detailed migration/design guide and deliver it through the ticket workspace and reMarkable.

**Inferred user intent:** Produce a high-signal migration handoff package that an intern can execute from without needing to rediscover the app architecture or the K3s platform conventions.

**Commit (code):** N/A

### What I did

- Read the `ticket-research-docmgr-remarkable`, `docmgr`, `remarkable-upload`, and `diary` skill instructions.
- Inspected the current `hair-booking` ticket inventory with `docmgr ticket list`.
- Inspected the current Coolify deployment docs and ops playbooks:
  - `docs/deployments/hair-booking-coolify.md`
  - `docs/deployments/hair-booking-coolify-playbook.md`
  - `docs/operations-playbook.md`
- Inspected the app runtime code:
  - `cmd/hair-booking/cmds/serve.go`
  - `pkg/server/http.go`
  - `pkg/auth/config.go`
  - `pkg/auth/oidc.go`
  - `pkg/auth/session.go`
  - `pkg/config/backend.go`
  - `pkg/storage/local.go`
  - `pkg/server/photo_upload.go`
  - `pkg/db/migrations/*.sql`
  - `web/src/main.tsx`
- Inspected the K3s platform repo and the existing `draft-review` package:
  - `README.md`
  - `docs/source-app-deployment-infrastructure-playbook.md`
  - `docs/vault-backed-postgres-bootstrap-job-pattern.md`
  - `gitops/applications/draft-review.yaml`
  - `gitops/kustomize/draft-review/*`
  - `gitops/applications/keycloak.yaml`
  - `gitops/kustomize/keycloak/*`
- Created ticket `HAIR-015` and added:
  - the primary design doc
  - this diary
- Replaced the generated placeholders in `index.md`, `tasks.md`, `changelog.md`,
  the design doc, and this diary with real content.

### Why

- The user asked for a detailed ticket and implementation guide, not a partial
  notes dump.
- The migration spans three repositories and multiple control planes, so writing
  conclusions without file-backed evidence would have produced bad operator
  advice.
- `draft-review` is the closest K3s reference pattern because it combines
  Go + OIDC + Postgres + PVC + ingress under Argo CD.

### What worked

- `docmgr` was already initialized in the `hair-booking` repo, so ticket
  creation and document scaffolding were straightforward.
- The existing K3s repo already had stable package patterns for:
  - Argo CD `Application` objects
  - Vault-backed runtime secrets
  - per-app PostgreSQL bootstrap jobs
  - PVC-backed app storage
  - Traefik + cert-manager ingress
  - in-cluster Keycloak
- The current `hair-booking` codebase is already structured in a way that maps
  cleanly onto a single-deployment K3s package.

### What didn't work

- `docmgr doc search --query deploy`
  returned:
  - `Error: fts5 not available (docs_fts missing)`
- `docmgr doc search --query keycloak`
  returned:
  - `Error: fts5 not available (docs_fts missing)`

That meant I had to fall back to direct file inspection and `rg` instead of
full-text search through the ticket database.

### What I learned

- `hair-booking` is already very close to the right runtime shape for K3s.
  The hardest parts are not containerization; they are storage, secrets, and
  control-plane coordination.
- The app still uses local-disk upload storage, so a PVC is mandatory for any
  honest migration plan.
- The logout callback path is easy to miss. The Keycloak client must accept
  `/auth/logout/callback`, not just `/auth/callback`.
- The K3s platform does not auto-discover a new Argo `Application` from Git
  alone. The first bootstrap `kubectl apply` must be documented explicitly.
- The shared `infra-tooling` repo had the generic GitOps PR helper already, but
  it was missing the reusable GHCR image workflow template and image-target
  example metadata. That was worth extracting so `hair-booking` does not have to
  treat the image-based path as one-off repo knowledge.

### What was tricky to build

- The migration guide needed to explain both the application and the platform.
  Writing only about K3s would have ignored the app-specific behaviors that make
  the package design different from simpler services, especially uploads and
  signed-cookie sessions.
- The user referenced both the Hetzner K3s repo and the `draft-review` repo.
  The useful pattern was not "copy all of draft-review," but "copy the specific
  K3s package shape that draft-review already proved."
- The app has a repo-local historical Keycloak Terraform scaffold and a newer
  shared-Terraform reality. The guide had to make that boundary explicit so an
  intern does not edit the wrong Keycloak repo.

### What warrants a second pair of eyes

- The final hostname and issuer sequencing decision:
  - app-to-K3s first, then Keycloak issuer cutover
  - or full simultaneous switch
- Whether the `hair-booking` GHCR image will be public or private
- Whether the shared Terraform Keycloak module for `hair-booking` already
  supports valid post-logout redirect URIs
- Whether the stylist env allowlists are still needed in production after
  HAIR-014

### What should be done in the future

- Execute the implementation queue in `tasks.md`
- Add a K3s-specific deployment playbook after the manifests exist
- Revisit moving uploads off PVC-backed local storage only after the K3s rollout
  is stable

### Code review instructions

- Start with the design doc:
  - `design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md`
- Verify the evidence anchors by opening the referenced app and K3s files
- Check that `tasks.md` reflects the intended rollout order
- Validate the diary against the shell history for the `docmgr` and inspection
  commands

### Technical details

Key commands run:

```bash
docmgr status --summary-only
docmgr ticket list
rg --files .
rg -n "k3s|argocd|keycloak|vault|postgres|ingress" /home/manuel/code/wesen/2026-03-27--hetzner-k3s -S
nl -ba pkg/server/http.go | sed -n '1,260p'
nl -ba docs/deployments/hair-booking-coolify.md | sed -n '1,260p'
docmgr ticket create-ticket --ticket HAIR-015 --title "Move hair-booking from Coolify to K3s with shared Keycloak" --topics deploy,keycloak,ops,backend,postgres
docmgr doc add --ticket HAIR-015 --doc-type design-doc --title "hair-booking K3s migration analysis, design, and implementation guide"
docmgr doc add --ticket HAIR-015 --doc-type reference --title "Investigation diary"
```

Primary deliverables produced:

- `ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/index.md`
- `ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/tasks.md`
- `ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/changelog.md`
- `ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md`
- `ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/reference/01-investigation-diary.md`

## Step 2: Validate the ticket and deliver it to reMarkable

After the documents were written, the next step was to make the ticket useful as
an artifact, not just a local draft. That meant updating file relationships,
running the doc-quality validation, and then doing the standard dry-run and real
bundle upload to reMarkable.

This step completed the "delivery evidence" part of the ticket workflow. The
important outcome is that the ticket now has both local validation and an
external delivery record, so someone reviewing the work does not have to trust
that the bundle was merely intended to be uploaded.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Finish the ticket workflow by validating the docs and uploading the final bundle to reMarkable.

**Inferred user intent:** Receive a finished research ticket that is both stored in the repo and available on the reMarkable device/cloud.

**Commit (code):** N/A

### What I did

- Ran `docmgr doc relate` for the design doc and the diary so key app and
  platform files are linked to the ticket artifacts.
- Ran `docmgr changelog update --ticket HAIR-015 ...`.
- Ran `docmgr doctor --ticket HAIR-015 --stale-after 30`.
- Ran `remarquee status`.
- Ran `remarquee cloud account --non-interactive`.
- Ran a bundle dry-run upload covering:
  - `index.md`
  - the design doc
  - `tasks.md`
  - `changelog.md`
  - this diary
- Ran the real bundle upload to `/ai/2026/03/31/HAIR-015`.
- Verified the remote directory with `remarquee cloud ls /ai/2026/03/31/HAIR-015 --long --non-interactive`.

### Why

- Ticket quality should be validated before upload so the reMarkable copy is not
  carrying broken frontmatter or stale metadata.
- The dry-run is a required safety step in the `remarkable-upload` workflow.
- The remote directory listing is the simplest proof that the upload really
  landed.

### What worked

- `docmgr doctor` passed with no findings beyond the final success state.
- The bundle dry-run succeeded immediately, which meant the markdown set was
  structurally acceptable to the upload tooling.
- The real upload succeeded and the remote listing showed the expected bundle.

### What didn't work

- N/A

### What I learned

- The bundle workflow is fast enough to use as the default finish step, not just
  for exceptional deliveries.
- `docmgr doctor` plus `remarquee upload bundle --dry-run` is a good final gate
  because it catches both metadata and rendering issues before the real upload.

### What was tricky to build

- The main subtlety was sequencing: relate files and update changelog first,
  then run `doctor`, then do the reMarkable dry-run, then the actual upload.
  Reversing that order would have uploaded a less complete ticket bundle.

### What warrants a second pair of eyes

- Only the substantive architecture recommendations in the design doc; the
  delivery mechanics themselves completed cleanly.
- The final stylist-auth runtime secret shape is still worth a quick review once
  the HAIR-014 implementation state is rechecked.

### What should be done in the future

- When actual implementation starts, append new diary steps rather than editing
  the historical steps above.

### Code review instructions

- Open `changelog.md` and confirm the validation/upload entries are present.
- Run `docmgr doctor --ticket HAIR-015 --stale-after 30` again if you want to
  re-verify the workspace after any edits.
- Check the reMarkable path `/ai/2026/03/31/HAIR-015` if device-side
  confirmation is needed.

### Technical details

Validation and delivery commands:

```bash
docmgr doc relate --doc ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md ...
docmgr doc relate --doc ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/reference/01-investigation-diary.md ...
docmgr changelog update --ticket HAIR-015 --entry "Added the detailed intern-facing analysis, design, and implementation guide for moving hair-booking from Coolify to the Hetzner K3s platform, plus the supporting investigation diary and phased execution queue." ...
docmgr doctor --ticket HAIR-015 --stale-after 30
remarquee status
remarquee cloud account --non-interactive
remarquee upload bundle --dry-run /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/index.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/tasks.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/changelog.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/reference/01-investigation-diary.md --name "HAIR-015 hair-booking K3s migration guide" --remote-dir "/ai/2026/03/31/HAIR-015" --toc-depth 2
remarquee upload bundle /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/index.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/tasks.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/changelog.md /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/reference/01-investigation-diary.md --name "HAIR-015 hair-booking K3s migration guide" --remote-dir "/ai/2026/03/31/HAIR-015" --toc-depth 2
remarquee cloud ls /ai/2026/03/31/HAIR-015 --long --non-interactive
```

Observed results:

- `docmgr doctor`: `All checks passed`
- upload result:
  - `OK: uploaded HAIR-015 hair-booking K3s migration guide.pdf -> /ai/2026/03/31/HAIR-015`
- remote listing:
  - `[f]  HAIR-015 hair-booking K3s migration guide`

## Step 3: Lock rollout decisions and extract reusable image-deploy tooling

After the initial ticket delivery, the user locked the previously open rollout
inputs and asked for a review of
`/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling` to see
whether the shared K3s deployment toolkit could be reused or improved. That
changed the shape of the work. The guide no longer needed to present multiple
equally plausible deployment branches. It needed to record the chosen contract,
and the shared tooling needed one more reusable path for Docker-image-based K3s
apps.

### Prompt Context

**User follow-up (verbatim):**

- `hair-booking.yolo.scapegoat.dev`
- `private ghcr`
- `switch keycloak`
- `i don't think so.`

Also: "look at
`/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling` where
we are gathering reusable resources for deploying to k3s, and see if you can
either use stuff from there, amend / improve it, or add things."

**Assistant interpretation:** Lock the migration decisions in the ticket, then
inspect the shared deployment-tooling repo and add the reusable image-based
source-repo assets that `hair-booking` will need.

**Inferred user intent:** Remove ambiguity from the migration plan and avoid
creating one-off workflow logic in `hair-booking` when the pattern belongs in
shared tooling.

**Commit (code):** N/A

### What I did

- Updated the ticket docs to treat the following as fixed inputs:
  - public hostname: `hair-booking.yolo.scapegoat.dev`
  - image distribution: private GHCR
  - Keycloak plan: switch to the K3s Keycloak as part of the migration
  - logout handling: assume the shared Terraform path still needs explicit
    post-logout redirect verification/fixes
- Updated the design doc, index, task list, and changelog so those decisions are
  reflected in the rollout order and open questions.
- Inspected the shared tooling repo:
  - `README.md`
  - `docs/platform/source-repo-to-gitops-pr.md`
  - `scripts/gitops/open_gitops_pr.py`
  - `templates/github/publish-federated-remote.template.yml`
  - `examples/federation/federation-gitops-targets.example.json`
- Added reusable image-based deployment assets to that repo:
  - `templates/github/publish-image-ghcr.template.yml`
  - `examples/platform/image-gitops-targets.example.json`
- Expanded the shared platform doc so it now describes the standard
  Docker-image -> GHCR -> GitOps PR path alongside the existing federated path.

### Why

- The migration guide is for execution. Once the user made the key decisions,
  leaving them framed as open questions would have produced a weaker handoff.
- The `infra-tooling` repo already owned the general "source repo publishes and
  opens GitOps PRs" responsibility. The image-based GHCR path belonged there,
  not as tribal knowledge inside one app repo.

### What worked

- The existing `scripts/gitops/open_gitops_pr.py` helper was already generic
  enough to support the image path once the target metadata contract was made
  explicit.
- Known-good image publish patterns from other repos transferred cleanly into a
  reusable template.
- The ticket now references shared tooling instead of encoding a repo-specific
  deployment workflow from scratch.

### What didn't work

- Reuse in `infra-tooling` was incomplete at first. The generic PR helper
  existed, but the image workflow template and example metadata did not, so they
  had to be added.

### What I learned

- The source-repo side of the K3s deployment pipeline benefits from having two
  explicit, documented variants:
  - federated remote artifacts
  - container image artifacts published to GHCR
- Private GHCR is an important control-plane boundary. The source repo can
  publish the image, but the cluster-side pull secret wiring still belongs in
  the GitOps/Vault side of the system.

### What warrants a second pair of eyes

- The new workflow template should be checked once against the exact
  `hair-booking` repo layout before it is copied in verbatim.
- The final K3s package still needs a cluster-side review for the image-pull
  secret wiring because the private GHCR choice makes that mandatory.

### What should be done in the future

- Copy the new shared workflow template and target metadata example into
  `hair-booking` during Phase 1 of the implementation queue.
- Re-upload the ticket bundle whenever the design doc or tasks materially
  change, so the reMarkable copy stays aligned with the repo copy.

### Code review instructions

- Review the ticket updates:
  - `index.md`
  - `tasks.md`
  - `changelog.md`
  - `design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md`
- Review the new shared tooling assets:
  - `/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/templates/github/publish-image-ghcr.template.yml`
  - `/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/examples/platform/image-gitops-targets.example.json`
  - `/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/docs/platform/source-repo-to-gitops-pr.md`

### Technical details

Key commands run:

```bash
sed -n '1,220p' /home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/README.md
sed -n '1,260p' /home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/docs/platform/source-repo-to-gitops-pr.md
sed -n '1,220p' /home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/templates/github/publish-image-ghcr.template.yml
sed -n '1,220p' /home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/examples/platform/image-gitops-targets.example.json
apply_patch ...
docmgr doctor --ticket HAIR-015 --stale-after 30
```

## Step 4: Deploy hair-booking to K3s and restore the production database

This step turned the ticket from a design package into a live deployment. The
goal was to finish the three control-plane changes, bootstrap the new Argo CD
application, move the production data across from Coolify, and validate that
the K3s hostname was serving the app with the new Keycloak issuer.

The implementation mostly followed the original guide, but the database restore
added one important operational lesson: a `pg_dump --clean` restore into the
shared cluster Postgres recreated tables under the admin role. That broke app
startup until ownership and grants were reassigned to the `hair_booking`
runtime user.

### Prompt Context

**User prompt (verbatim):** "alright, create tasks for that if you haven't already and deploy hair-booking to our k3s server"

**Assistant interpretation:** Finish the migration work, not just the planning: make sure the ticket tasks reflect reality and deploy `hair-booking` onto the K3s cluster with the chosen hostname, private GHCR, and K3s Keycloak.

**Inferred user intent:** Get `hair-booking` off Coolify and into the real K3s production path, with enough documentation left behind that the remaining operator checks are obvious and bounded.

**Commit (code):** multiple existing repo commits already pushed before the live bootstrap:
- `fbbdc78` — `feat: add k3s image deployment automation`
- `b96715e` — `feat: add hair-booking k3s keycloak env`
- `01bf1b0` — `feat: deploy hair-booking on k3s`

### What I did

- Verified the K3s cluster and Argo CD state using the tailnet kubeconfig:
  - `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/.cache/kubeconfig-tailnet.yaml`
- Confirmed the app image pipeline had already published
  `ghcr.io/wesen/hair-booking:sha-fbbdc78` successfully from GitHub Actions.
- Applied the shared Keycloak Terraform environment in:
  - `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/k3s-parallel`
- Seeded Vault with:
  - `kv/apps/hair-booking/prod/runtime`
  - `kv/apps/hair-booking/prod/image-pull`
- Bootstrapped Vault Kubernetes auth roles with:
  - `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/scripts/bootstrap-vault-kubernetes-auth.sh`
- Applied the Argo CD application:
  - `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/applications/hair-booking.yaml`
- Verified the app namespace reconciled:
  - runtime secret synced
  - image pull secret synced
  - Postgres bootstrap job completed
  - PVC bound
  - deployment became healthy
- Inspected the old Coolify Postgres container over SSH and confirmed it had
  real production data:
  - `clients|4`
  - `intake_photos|3`
  - `intake_submissions|1`
  - `notification_prefs|3`
  - `schedule_blocks|6`
  - `services|8`
- Dumped the old database to `/tmp/hair-booking.sql`, filtered the unsupported
  `SET transaction_timeout = 0;` line into `/tmp/hair-booking.compat.sql`, and
  restored it into the K3s `hair_booking` database over a local Postgres
  port-forward.
- Diagnosed the post-restore crash loop and fixed it by reassigning database,
  schema, table, and sequence ownership/grants to `hair_booking`.
- Restarted the deployment and re-validated the live endpoints.
- Wrote a sentinel file into `/data/uploads`, restarted the pod, and confirmed
  the file was still present to prove PVC-backed persistence.
- Updated `tasks.md`, `changelog.md`, and `index.md` to match the deployed
  state.

### Why

- The user asked for an actual deployment, so stopping at "manifests exist" was
  not enough.
- The Coolify database clearly contained real user data, so a live K3s app
  without that restore would have been an incomplete migration.
- Persistence matters for this app because upload storage is still local-disk
  backed; proving the PVC survives a pod restart was worth doing immediately.

### What worked

- The source-repo automation, shared Keycloak Terraform, and K3s GitOps package
  fit together cleanly once the decisions were locked.
- Argo CD reconciled the namespace, Vault-backed secrets, bootstrap job, PVC,
  deployment, service, ingress, and certificate without manual manifest edits.
- The Keycloak realm/client was correct:
  - `/auth/login` redirects to
    `https://auth.yolo.scapegoat.dev/realms/hair-booking/...`
  - the callback host matches
    `https://hair-booking.yolo.scapegoat.dev/auth/callback`
- The old Coolify dataset restored successfully after the dump compatibility
  fix.
- The uploads PVC persisted a sentinel file across a forced pod restart.

### What didn't work

- The first attempt to inspect old row counts failed because of nested shell/SQL
  quoting mistakes over `ssh ... docker exec ... psql`.
- The raw `pg_dump` restore failed at first with:
  - `ERROR: unrecognized configuration parameter "transaction_timeout"`
  because the dump came from PostgreSQL `18.3` and the cluster server is older.
- After restore, the app entered `CrashLoopBackOff` with:
  - `Error: failed to apply embedded migrations: failed to query schema_migrations for 0001_init.sql: ERROR: permission denied for table schema_migrations (SQLSTATE 42501)`
  because the restore recreated objects under `platform_admin`.
- A first attempt to force a scale-down before restore was immediately undone by
  Argo CD reconciliation.

### What I learned

- A live restore into the shared Postgres cluster should explicitly include an
  ownership/grant normalization step for the application role after any
  admin-owned restore.
- The K3s package itself was sound; the only production issue after bootstrap
  came from database ownership, not from Kubernetes, ingress, Vault, or
  Keycloak wiring.
- PVC persistence can be validated cheaply with an infra-level sentinel check
  even when an authenticated upload flow is inconvenient to automate.

### What was tricky to build

- The migration touched three repositories plus live infrastructure. The tricky
  part was not writing manifests, but keeping the rollout sequence coherent:
  source image first, cluster package second, Keycloak/Vault/bootstrap third,
  data restore after the app shape was proven.
- The restore had two hidden compatibility edges:
  - server-version mismatch between dump producer and restore target
  - ownership drift between the admin restore role and the app runtime role
- Argo CD self-healing means imperative runtime edits like manual scale-down are
  not durable unless you either change desired state or accept that the control
  plane will revert them.

### What warrants a second pair of eyes

- A real browser login with a stylist account should still be run once against
  the new realm to confirm `/api/me` and end-to-end session establishment.
- The runbooks still need to be updated so future operators do not default back
  to the Coolify docs.
- Coolify is still the rollback path and should remain untouched until the
  rollback window is intentionally closed.

### What should be done in the future

- Run one manual browser sign-in through the new Keycloak realm and confirm
  `/api/me`.
- Update the deployment and operations playbooks to mark K3s as canonical.
- Remove the Coolify deployment only after the rollback window closes.

### Code review instructions

- Start in the app repo:
  - `.github/workflows/publish-image.yaml`
  - `deploy/gitops-targets.json`
  - `scripts/open_gitops_pr.py`
- Then review the K3s repo:
  - `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/kustomize/hair-booking/`
  - `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/gitops/applications/hair-booking.yaml`
- Then review the shared Keycloak Terraform env:
  - `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/k3s-parallel/`
- Validate the live state with:
  - `kubectl -n argocd get application hair-booking -o wide`
  - `kubectl -n hair-booking get pods,secret,pvc`
  - `curl -I https://hair-booking.yolo.scapegoat.dev/healthz`
  - `curl https://hair-booking.yolo.scapegoat.dev/api/info`

### Technical details

Key commands run:

```bash
KUBECONFIG=/home/manuel/code/wesen/2026-03-27--hetzner-k3s/.cache/kubeconfig-tailnet.yaml kubectl -n argocd get application hair-booking -o wide
KUBECONFIG=/home/manuel/code/wesen/2026-03-27--hetzner-k3s/.cache/kubeconfig-tailnet.yaml kubectl -n hair-booking get pods,job,secret,serviceaccount,vaultauth,vaultconnection,vaultstaticsecret,pvc
curl -skI https://hair-booking.yolo.scapegoat.dev/healthz
curl -sk https://hair-booking.yolo.scapegoat.dev/api/info
curl -skI https://hair-booking.yolo.scapegoat.dev/auth/login

ssh manuel@89.167.52.236 'sudo -n docker exec -e PGPASSWORD=... go1o5tbegalwy3kesshq3hcp psql -U postgres -d postgres -At -c "select concat(schemaname,chr(46),relname,chr(124),n_live_tup) from pg_stat_user_tables order by schemaname, relname;"'
ssh manuel@89.167.52.236 'sudo -n docker exec -e PGPASSWORD=... go1o5tbegalwy3kesshq3hcp pg_dump -U postgres -d postgres --no-owner --no-privileges --clean --if-exists' > /tmp/hair-booking.sql
sed '/^SET transaction_timeout = 0;$/d' /tmp/hair-booking.sql > /tmp/hair-booking.compat.sql

KUBECONFIG=/home/manuel/code/wesen/2026-03-27--hetzner-k3s/.cache/kubeconfig-tailnet.yaml kubectl -n postgres port-forward svc/postgres 15432:5432
PGPASSWORD='...' psql -h 127.0.0.1 -p 15432 -U platform_admin -d hair_booking -f /tmp/hair-booking.compat.sql
PGPASSWORD='...' psql -h 127.0.0.1 -p 15432 -U platform_admin -d hair_booking <<'SQL'
ALTER DATABASE hair_booking OWNER TO hair_booking;
ALTER SCHEMA public OWNER TO hair_booking;
GRANT USAGE, CREATE ON SCHEMA public TO hair_booking;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hair_booking;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hair_booking;
SQL

KUBECONFIG=/home/manuel/code/wesen/2026-03-27--hetzner-k3s/.cache/kubeconfig-tailnet.yaml kubectl -n hair-booking delete pod -l app.kubernetes.io/name=hair-booking --wait=true
KUBECONFIG=/home/manuel/code/wesen/2026-03-27--hetzner-k3s/.cache/kubeconfig-tailnet.yaml kubectl -n hair-booking rollout status deployment/hair-booking --timeout=180s
```
