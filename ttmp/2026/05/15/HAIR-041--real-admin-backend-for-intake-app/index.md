---
Title: Real admin backend for intake app
Ticket: HAIR-041
Status: active
Topics:
    - backend
    - frontend
    - admin-dsl
    - goja
    - dsl
    - persistence
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../../../code/wesen/go-go-golems/go-go-parc/Projects/2026/05/16/PROJECT REPORT - Fringe Admin DSL Backend Driven Admin Interfaces Deep Dive.md
      Note: Obsidian report uploaded to reMarkable and linked from prior report
    - Path: pkg/admindsl/flows/intake_admin.flow.js
      Note: |-
        Phase 7 config screen
        Service config edit drawer and save callback (commit 126b3be)
    - Path: pkg/intakeadmin/store.go
      Note: |-
        Config editor data DTOs
        Draft-only service option update mutation and audit event (commit 126b3be)
    - Path: pkg/server/host_intake_admin_module.go
      Note: |-
        Goja host exports for config editor data and publish (commit b6eab66)
        Goja host export for updateServiceOption (commit 126b3be)
ExternalSources: []
Summary: ""
LastUpdated: 2026-05-15T19:43:10.470080535-04:00
WhatFor: ""
WhenToUse: ""
---



# Real admin backend for intake app

## Overview

<!-- Provide a brief overview of the ticket, its goals, and current status -->

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- backend
- frontend
- admin-dsl
- goja
- dsl
- persistence

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
