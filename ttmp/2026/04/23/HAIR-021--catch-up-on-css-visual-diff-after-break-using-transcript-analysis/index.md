---
Title: Catch up on css-visual-diff after break using transcript analysis
Ticket: HAIR-021
Status: active
Topics:
    - tooling
    - browser-automation
    - visual-regression
    - go-minitrace
    - transcript-analysis
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: css-visual-diff/cmd/css-visual-diff/main.go
      Note: CLI entrypoint with script verbs and llm-review
    - Path: css-visual-diff/internal/cssvisualdiff/dsl/host.go
      Note: go-go-goja runtime host
    - Path: css-visual-diff/internal/cssvisualdiff/llm/bootstrap.go
      Note: Pinocchio profile bootstrap
    - Path: css-visual-diff/internal/cssvisualdiff/llm/image_question_client.go
      Note: Real image-question AI client for legacy ai-review
    - Path: css-visual-diff/internal/cssvisualdiff/llm/review.go
      Note: Geppetto-backed review service
    - Path: hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/reference/01-diary.md
      Note: Catch-up diary with synthesized status
    - Path: hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/05-verify-geppetto-image-support-and-ai-review-wiring.sh
      Note: Verification script for resumed HAIR-021 implementation
    - Path: pinocchio/pkg/cmds/profilebootstrap/profile_selection.go
      Note: Pinocchio profile bootstrap compatibility with current Geppetto
ExternalSources: []
Summary: ""
LastUpdated: 2026-04-23T14:09:20.593781973-04:00
WhatFor: ""
WhenToUse: ""
---



# Catch up on css-visual-diff after break using transcript analysis

## Overview

<!-- Provide a brief overview of the ticket, its goals, and current status -->

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- tooling
- browser-automation
- visual-regression
- go-minitrace
- transcript-analysis

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
