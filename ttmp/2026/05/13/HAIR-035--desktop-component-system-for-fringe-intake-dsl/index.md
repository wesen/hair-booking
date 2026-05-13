---
Title: Desktop Component System for Fringe Intake DSL
Ticket: HAIR-035
Status: active
Topics:
    - dsl
    - frontend
    - design-system
    - desktop
    - intake
    - storybook
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: .css-visual-diff.yml
      Note: css-visual-diff repository configuration
    - Path: design-galley/intake-desktop.jsx
      Note: Desktop prototype JSX (Estimate Butter
    - Path: design-galley/screenshots/desktop
      Note: Desktop screen mockups for reference
    - Path: design-galley/visual-diff/userland/specs/fringe-intake.yaml
      Note: Visual diff spec for mobile intake screens
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Full 7-step mobile intake flow running in Goja
    - Path: pkg/dslgoja/modules_dsl.go
      Note: JS DSL module installed into Goja VM (page()
    - Path: pkg/dslgoja/runtime.go
      Note: Goja runtime engine - sessions
    - Path: pkg/dslgoja/schema.go
      Note: Go-side DSL schema aligned with TypeScript
    - Path: proto/fringe/dsl/v1/dsl.proto
      Note: Protobuf transport contract for DSL pages and events
    - Path: web/src/fringe-ui/tokens
      Note: Design tokens - color
    - Path: web/src/page-dsl/backendClient.ts
      Note: Protobuf-backed client for DSL flow API
    - Path: web/src/page-dsl/builder.ts
      Note: Fluent builder API for page/node construction
    - Path: web/src/page-dsl/render.tsx
      Note: DSL renderer - maps JSON nodes to React components
    - Path: web/src/page-dsl/schema.ts
      Note: Core DSL JSON schema - DslPage
ExternalSources: []
Summary: ""
LastUpdated: 2026-05-13T15:19:22.5927939-04:00
WhatFor: ""
WhenToUse: ""
---















# Desktop Component System for Fringe Intake DSL

## Overview

<!-- Provide a brief overview of the ticket, its goals, and current status -->

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- dsl
- frontend
- design-system
- desktop
- intake
- storybook

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
