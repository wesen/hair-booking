---
Title: 'Modernize CI and build tooling for PR #2 merge readiness'
Ticket: HAIR-042
Status: active
Topics:
    - ci
    - golangci-lint
    - logcopter
    - glazed-lint
    - go-template
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: .github/workflows/dependency-scanning.yml
      Note: Uses securego/gosec@master Docker action
    - Path: .github/workflows/lint.yml
      Note: Uses hardcoded v2.4.0 instead of version-file
    - Path: Makefile
      Note: Has bump-glazed
    - Path: go.mod
      Note: Core module definition
    - Path: go.sum
      Note: Missing goja_nodejs/require and hashicorp/vault/api entries
ExternalSources: []
Summary: ""
LastUpdated: 2026-06-12T12:27:55.404084431-04:00
WhatFor: ""
WhenToUse: ""
---






# Modernize CI and build tooling for PR #2 merge readiness

## Overview

<!-- Provide a brief overview of the ticket, its goals, and current status -->

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- ci
- golangci-lint
- logcopter
- glazed-lint
- go-template

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
