---
Title: Port Hair Stylist Booking App to Modular React+Redux+TypeScript
Ticket: HAIR-001
Status: active
Topics:
    - frontend
    - react
    - typescript
    - storybook
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: web/src/stylist/ClientBookingApp.tsx
      Note: Client-facing consultation booking root widget
    - Path: web/src/stylist/StylistApp.tsx
      Note: Root widget component
    - Path: web/src/stylist/data/consultation-constants.ts
      Note: Consultation data constants and calendar availability
    - Path: web/src/stylist/index.ts
      Note: Main barrel export for the stylist widget
    - Path: web/src/stylist/parts.ts
      Note: data-part name registry
    - Path: web/src/stylist/store/consultationSlice.ts
      Note: Redux slice for consultation wizard state
    - Path: web/src/stylist/store/index.ts
      Note: Redux store configuration
    - Path: web/src/stylist/styles/stylist.css
      Note: Base structural CSS
    - Path: web/src/stylist/styles/theme-default.css
      Note: Default salon theme tokens
    - Path: web/src/stylist/types.ts
      Note: TypeScript type definitions
ExternalSources:
    - local:stylist-app.jsx
    - local:luxe-client-booking.jsx
Summary: ""
LastUpdated: 2026-03-19T21:16:38.911740544-04:00
WhatFor: ""
WhenToUse: ""
---





# Port Hair Stylist Booking App to Modular React+Redux+TypeScript

## Overview

<!-- Provide a brief overview of the ticket, its goals, and current status -->

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- frontend
- react
- typescript
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
