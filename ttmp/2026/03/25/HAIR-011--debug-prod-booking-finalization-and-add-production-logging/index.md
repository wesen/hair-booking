---
Title: Debug prod booking finalization and add production logging
Ticket: HAIR-011
Status: active
Topics:
    - backend
    - booking
    - logging
    - production
    - observability
DocType: index
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: Ticket workspace for investigating the hosted appointment-finalization failure and adding enough structured logging to debug production safely.
LastUpdated: 2026-03-25T17:30:00-04:00
WhatFor: Use this ticket to debug the production booking bug and design the logging/observability baseline the app now needs.
WhenToUse: Use when implementing or reviewing production diagnostics for hair-booking.
---

# Debug prod booking finalization and add production logging

## Overview

This ticket covers two related production issues:

- the hosted booking flow can reach a `500 appointment-create-failed` on `POST /api/appointments`
- the current application logging is too sparse to explain request-level failures in production

## Key Links

- Main analysis and implementation guide: [design/01-prod-booking-bug-and-logging-guide.md](./design/01-prod-booking-bug-and-logging-guide.md)
- Investigation diary: [reference/01-investigation-diary.md](./reference/01-investigation-diary.md)
- Production debug playbook: [playbooks/01-production-booking-debug-playbook.md](./playbooks/01-production-booking-debug-playbook.md)
- Tasks: [tasks.md](./tasks.md)
- Changelog: [changelog.md](./changelog.md)

## Status

Current status: **active**

## Topics

- backend
- booking
- logging
- production
- observability

## Tasks

See [tasks.md](./tasks.md) for the current task list.

## Changelog

See [changelog.md](./changelog.md) for recent changes and decisions.

## Structure

- design/ - Architecture and implementation docs
- reference/ - Diary and research context
- playbooks/ - Debugging and operator runbooks
- scripts/ - Temporary ticket-local tooling
- various/ - Working notes
- archive/ - Deprecated or reference-only artifacts
