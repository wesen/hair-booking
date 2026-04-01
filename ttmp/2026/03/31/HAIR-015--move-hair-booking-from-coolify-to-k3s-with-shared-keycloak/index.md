---
Title: Move hair-booking from Coolify to K3s with shared Keycloak
Ticket: HAIR-015
Status: active
Topics:
    - deploy
    - keycloak
    - ops
    - backend
    - postgres
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: /home/manuel/code/wesen/hair-booking/docs/deployments/hair-booking-coolify.md
      Note: Documents the current hosted Coolify shape that this ticket is replacing
    - Path: /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md
      Note: Primary analysis and implementation guide for the migration
    - Path: /home/manuel/code/wesen/2026-03-27--hetzner-k3s/docs/source-app-deployment-infrastructure-playbook.md
      Note: Canonical K3s platform onboarding guide that this ticket adapts for hair-booking
ExternalSources: []
Summary: Detailed ticket workspace for moving hair-booking from its current Coolify deployment to the Hetzner K3s + Argo CD platform with Vault-backed secrets, shared PostgreSQL, persistent upload storage, and shared Keycloak.
LastUpdated: 2026-03-31T14:10:00-04:00
WhatFor: Planning and executing the K3s migration without losing the current Coolify deployment as a rollback path.
WhenToUse: Use this ticket before changing deployment automation, Vault secrets, Keycloak issuer/client configuration, Kubernetes manifests, or the public cutover plan.
---

# Move hair-booking from Coolify to K3s with shared Keycloak

## Overview

`hair-booking` currently runs as a single Dockerfile-based application on
Coolify. The goal of this ticket is to move that runtime onto the Hetzner
single-node K3s platform under Argo CD while preserving the app's current Go +
React + Postgres + Keycloak shape.

The migration is not just "rewrite one deployment YAML." It spans three control
planes:

- the source app repo, where images are built and deployment metadata lives
- the K3s GitOps repo, where Kubernetes state is declared
- the shared Keycloak Terraform repo, where the K3s-side realm and browser
  client must be created

The primary deliverable in this ticket is the design/implementation guide in the
linked design doc. That guide is written for a new intern and explains the app
itself, the platform it is moving onto, and the exact file-level changes needed.

Locked migration inputs from follow-up decisions:

- K3s hostname: `hair-booking.yolo.scapegoat.dev`
- image distribution: private GHCR
- Keycloak plan: switch the app to the K3s Keycloak during this migration
- shared Terraform browser client: assume post-logout redirect handling still
  needs to be added or verified explicitly

## Key Links

- Primary guide:
  - `design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md`
- Diary:
  - `reference/01-investigation-diary.md`
- Current deployment reference:
  - `/home/manuel/code/wesen/hair-booking/docs/deployments/hair-booking-coolify.md`
- K3s platform reference:
  - `/home/manuel/code/wesen/2026-03-27--hetzner-k3s/docs/source-app-deployment-infrastructure-playbook.md`

## Status

Current status: **active**

Current disposition:

- analysis and design guide: complete
- implementation across the three control planes: complete
- live K3s deployment and Coolify database restore: complete
- ticket bookkeeping: updated through the live deployment
- reMarkable bundle upload: complete as of guide version `v3`
  Current latest bundle: `HAIR-015 hair-booking K3s migration guide v3.pdf`
- remaining follow-up work:
  - run one real browser login through `/api/me`
  - update the operational runbooks to point at K3s as canonical
  - retire Coolify only after the rollback window closes

## Topics

- deploy
- keycloak
- ops
- backend
- postgres

## Tasks

See `tasks.md` for the detailed execution queue. The current intended order is:

1. run a real browser login through the new Keycloak realm and confirm `/api/me`
2. update the runbooks so the K3s deployment is the documented primary path
3. keep Coolify intact until the rollback window closes, then remove it deliberately

## Changelog

See [changelog.md](./changelog.md) for recent changes and decisions.

## Structure

- design/ - Architecture and design documents
- reference/ - Prompt packs, API contracts, context summaries
- playbooks/ - Command sequences and test procedures
- scripts/ - Temporary code and tooling
- various/ - Working notes and research
- archive/ - Deprecated or reference-only artifacts
