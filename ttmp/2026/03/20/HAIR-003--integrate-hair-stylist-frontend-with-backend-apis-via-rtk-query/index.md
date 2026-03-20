---
Title: Integrate Hair Stylist Frontend With Backend APIs Via RTK Query
Ticket: HAIR-003
Status: active
Topics:
    - frontend
    - react
    - redux
    - typescript
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: web/package.json
      Note: Frontend dependency boundary already includes Redux Toolkit for RTK Query
    - Path: web/src/stylist/pages/ConsultCalendarPage.tsx
      Note: Calendar page still uses deterministic availability and is a primary integration target
    - Path: web/src/stylist/pages/PortalHomePage.tsx
      Note: Portal home still hydrates from mock data and should move to API-backed reads
    - Path: web/src/stylist/store/index.ts
      Note: Store setup is the main integration seam for the API reducer and middleware
ExternalSources: []
Summary: Ticket workspace for replacing the hair-booking frontend mock data and OTP flows with RTK Query integrations against the new Go backend APIs.
LastUpdated: 2026-03-20T00:01:14.783333783-04:00
WhatFor: Use this ticket to design and implement the frontend integration layer for the imported booking and portal widgets.
WhenToUse: Use when wiring the React+Redux frontend to the backend APIs, removing mock state, or reviewing the RTK Query migration plan.
---


# Integrate Hair Stylist Frontend With Backend APIs Via RTK Query

## Overview

This ticket covers the frontend half of the Luxe Hair Studio MVP. The backend API surface is now broad enough to support real consult booking, authenticated profile reads/writes, appointment history, maintenance plans, and schedule-based booking. The imported frontend still relies on hard-coded calendar data, mocked portal records, and an OTP-only sign-in flow that no longer matches the Keycloak/OIDC direction of the repo.

The goal of this ticket is to replace those mocks with a deliberate RTK Query integration layer, keep local UI-only state where it belongs, and leave the app in a state where real browser testing is possible against the Go server.

## Key Links

- Primary design guide: `design-doc/01-hair-booking-frontend-integration-guide.md`
- Investigation diary: `reference/01-investigation-diary.md`
- Related Files: See frontmatter `RelatedFiles`

## Status

Current status: **active**

## Topics

- frontend
- react
- redux
- typescript

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

## Deliverables

1. An intern-facing frontend integration guide that explains the RTK Query architecture, route mapping, and migration order.
2. A chronological diary that records why the frontend plan was structured this way.
3. A granular task list that breaks the integration work into testable slices.
