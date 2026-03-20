---
Title: Design Luxe Hair Studio MVP Backend
Ticket: HAIR-002
Status: active
Topics:
    - backend
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/server/http.go
      Note: Current HTTP server and routing baseline
    - Path: pkg/auth/config.go
      Note: Existing auth configuration surface
    - Path: web/src/stylist/store/consultationSlice.ts
      Note: Consultation flow state that the backend must support
    - Path: web/src/stylist/store/portalSlice.ts
      Note: Portal mock state that the backend must replace
    - Path: docker-compose.local.yml
      Note: Local development stack, currently missing an app database
ExternalSources: []
Summary: "Ticket workspace for the Luxe Hair Studio MVP backend design, schema, route plan, local development strategy, and diary."
LastUpdated: 2026-03-19T22:26:38.672363242-04:00
WhatFor: "Use this ticket to design and review the first real backend for the imported Luxe Hair Studio booking and portal widgets."
WhenToUse: "Use when implementing or reviewing the Go + PostgreSQL MVP backend."
---

# Design Luxe Hair Studio MVP Backend

## Overview

This ticket captures the backend MVP design for Luxe Hair Studio. The repository already contains the imported frontend widgets, a small Go server, and a Keycloak/OIDC login bootstrap. The work in this ticket defines how to replace the remaining booking, portal, schedule, and photo mocks with a PostgreSQL-backed Go implementation while using Keycloak as the sole authentication system and keeping loyalty and payments out of scope.

## Key Links

- Primary design guide: `design-doc/01-luxe-hair-studio-mvp-backend-design-guide.md`
- Investigation diary: `reference/01-investigation-diary.md`
- Related Files: See frontmatter `RelatedFiles`

## Status

Current status: **active**

## Topics

- backend

## Tasks

See [tasks.md](./tasks.md) for the current task list.

## Changelog

See [changelog.md](./changelog.md) for recent changes and decisions.

## Structure

- design/ - Architecture and design documents
- reference/ - Prompt packs, API contracts, context summaries
- playbooks/ - Command sequences and test procedures
- scripts/ - Temporary code and tooling
- various/ - Working notes and research
- archive/ - Deprecated or reference-only artifacts

## Deliverables

1. A detailed backend MVP design guide aimed at a new intern.
2. A chronological diary of the investigation and delivery work.
3. Ticket bookkeeping for validation and external review.
