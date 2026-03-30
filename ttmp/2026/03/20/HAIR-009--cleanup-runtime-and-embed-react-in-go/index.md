---
Title: Cleanup runtime and embed React in Go
Ticket: HAIR-009
Status: active
Topics:
    - frontend
    - backend
    - cleanup
    - deploy
DocType: index
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: Post-stylist follow-up ticket for production shell cleanup, React embedding, and runtime/state consolidation.
LastUpdated: 2026-03-20T18:45:00-04:00
WhatFor: Use this ticket after HAIR-006 and HAIR-007 to consolidate the runtime and finish production-shell cleanup.
WhenToUse: Use after the real stylist backend and frontend exist, so cleanup can follow reality instead of assumptions.
---

# Cleanup runtime and embed React in Go

## Overview

This ticket is intentionally late in the sequence.

It exists to clean up the product once HAIR-006 and HAIR-007 have made the stylist workflow real. That is the right time to:

- remove stale mock/demo runtime state
- embed the real React app into Go for production
- retire the last confusing remnants of the prototype shell

## Key Links

- Main guide: [design/01-runtime-cleanup-and-react-embed-guide.md](./design/01-runtime-cleanup-and-react-embed-guide.md)
- Investigation diary: [reference/01-investigation-diary.md](./reference/01-investigation-diary.md)
- Tasks: [tasks.md](./tasks.md)
- Changelog: [changelog.md](./changelog.md)

## Structure

- design/ - implementation and architecture guide
- reference/ - diary and context
- playbooks/ - future embed/release steps
- scripts/ - future helper scripts
- various/ - scratch notes
- archive/ - deprecated artifacts
