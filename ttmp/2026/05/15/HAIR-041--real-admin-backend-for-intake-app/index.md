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
        Tone config edit drawer and save callback (commit 4ca5045)
        Complete Phase 7 config editor flow with update/create/delete drawers and publish workflow (commits 735c64e
        Root intake admin flow after config split (commit dbc6204)
        Audit and health screens for Phase 8 (commit 8876ddf)
        Root flow uses relative require for config helper (commit 8c7e698)
    - Path: pkg/admindsl/flows/intake_config.flow.js
      Note: Extracted Phase 7 config editor module (commit dbc6204)
    - Path: pkg/admindsl/script_runtime.go
      Note: |-
        Embedded script module support for Admin DSL require() (commit dbc6204)
        Virtual embedded source loader and relative require support for Admin DSL flows (commit 8c7e698)
    - Path: pkg/intakeadmin/store.go
      Note: |-
        Config editor data DTOs
        Draft-only service option update mutation and audit event (commit 126b3be)
        Draft-only tone option update mutation and shared draft-row helper (commit 4ca5045)
        Phase 7 config update/create/delete store methods and audit events (commits 735c64e
        Audit listing and health diagnostics queries (commit 8876ddf)
    - Path: pkg/server/handlers_admin_dsl.go
      Note: StartFlowNamed source filenames and registered config helper module path (commit 8c7e698)
    - Path: pkg/server/host_intake_admin_module.go
      Note: |-
        Goja host exports for config editor data and publish (commit b6eab66)
        Goja host export for updateServiceOption (commit 126b3be)
        Goja host export for updateToneOption (commit 4ca5045)
        Goja host exports for Phase 7 config mutations (commits 735c64e
        Goja exports for audit and health queries (commit 8876ddf)
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
