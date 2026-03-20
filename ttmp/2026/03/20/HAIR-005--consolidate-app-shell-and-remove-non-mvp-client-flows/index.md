---
Title: Consolidate app shell and remove non-MVP client flows
Ticket: HAIR-005
Status: active
Topics:
    - frontend
    - react
    - redux
    - mvp
DocType: index
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: Detailed implementation ticket for consolidating routing, auth redirects, and visible MVP scope so the app presents one coherent product surface.
LastUpdated: 2026-03-20T09:07:11.901354256-04:00
WhatFor: Use this ticket to clean up the app shell and remove visible features that are out of MVP scope.
WhenToUse: Use before or alongside stylist feature work so the product shell and auth flow are coherent.
---

# Consolidate app shell and remove non-MVP client flows

## Overview

This ticket isolates the shell-level cleanup identified in HAIR-004. It focuses on three things:

1. replacing query-param app switching with a real route/app-shell strategy
2. fixing auth redirects so users land on the correct frontend surface
3. removing visible rewards, referral, and payment/deposit features that are not part of the intended MVP

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field
- Main guide: [design/01-app-shell-and-non-mvp-cleanup-guide.md](./design/01-app-shell-and-non-mvp-cleanup-guide.md)
- Investigation diary: [reference/01-investigation-diary.md](./reference/01-investigation-diary.md)

## Status

Current status: **active**

## Topics

- frontend
- react
- redux
- mvp

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
