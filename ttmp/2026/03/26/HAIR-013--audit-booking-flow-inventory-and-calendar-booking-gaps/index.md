---
Title: Audit booking flow inventory and calendar booking gaps
Ticket: HAIR-013
Status: active
Topics:
    - frontend
    - backend
    - booking
    - auth
    - postgres
DocType: index
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: ""
LastUpdated: 2026-03-26T10:35:00-04:00
WhatFor: Use this ticket to understand the real booking architecture, the likely calendar defect, the intake persistence path, and the remaining backend/frontend gaps before changing code.
WhenToUse: Use when debugging the booking funnel, auditing missing MVP functionality, or planning the next stabilization pass.
---

# Audit booking flow inventory and calendar booking gaps

## Overview

This ticket captures two related things:

1. the likely causes of the current booking/calendar defect reported from the live
   app
2. the larger inventory of what the frontend and backend actually implement today
   versus what is still missing or fragile

The main analysis lives in:

- [01-booking-flow-inventory-and-gap-analysis.md](./design/01-booking-flow-inventory-and-gap-analysis.md)
- [01-investigation-diary.md](./reference/01-investigation-diary.md)

## Key Links

- Design guide: [01-booking-flow-inventory-and-gap-analysis.md](./design/01-booking-flow-inventory-and-gap-analysis.md)
- Investigation diary: [01-investigation-diary.md](./reference/01-investigation-diary.md)
- Task list: [tasks.md](./tasks.md)
- Changelog: [changelog.md](./changelog.md)

## Status

Current status: **active**

## Topics

- frontend
- backend
- booking
- auth
- postgres

## Tasks

See [tasks.md](./tasks.md) for the current task list.

## Changelog

See [changelog.md](./changelog.md) for recent changes and decisions.

## Structure

- design/ - Architecture and design documents
- reference/ - Diaries, context summaries, and operational notes
- playbooks/ - Command sequences and test procedures
- scripts/ - Temporary code and tooling
- various/ - Working notes and research
- archive/ - Deprecated or reference-only artifacts
