---
Title: Stylist Frontend Operations Guide
Ticket: HAIR-007
Status: active
Topics:
    - frontend
    - react
    - redux
    - typescript
    - mvp
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/03/20/HAIR-004--review-hair-booking-mvp-readiness-and-stylist-workflow/design/01-hair-booking-mvp-readiness-review.md
      Note: Source review identifying the current stylist runtime as mock-heavy
    - Path: ttmp/2026/03/20/HAIR-006--build-stylist-backend-operations-mvp/design/01-stylist-backend-operations-guide.md
      Note: Backend contract this frontend work will consume
    - Path: web/src/stylist/StylistApp.tsx
      Note: Current mock stylist shell to replace
    - Path: web/src/stylist/pages/HomePage.tsx
      Note: Current mock home dashboard
    - Path: web/src/stylist/pages/SchedulePage.tsx
      Note: Current mock schedule page
    - Path: web/src/stylist/pages/ClientsPage.tsx
      Note: Current mock clients page
    - Path: web/src/stylist/store/api/base.ts
      Note: Existing RTK Query foundation to extend
    - Path: web/src/stylist/data/constants.ts
      Note: Seeded stylist-side data to retire from runtime
ExternalSources: []
Summary: Detailed guide for replacing the mock stylist runtime with a real operations UI backed by stylist APIs.
LastUpdated: 2026-03-20T09:44:00-04:00
WhatFor: Use this guide to build the real stylist dashboard, queue, appointment, and client views.
WhenToUse: Use after the route shell is stabilizing and the stylist backend contract is available.
---

# Stylist Frontend Operations Guide

## Executive Summary

The current stylist runtime is not just missing data wiring. It is missing the right workflow.

This ticket should replace the current mock-heavy admin-like experience with a real operations UI for:

- reviewing incoming intakes
- seeing today’s work
- managing appointments
- opening client context

## Problem Statement

Current stylist runtime problems:

- hard-coded dates and counts
- seeded appointment and client data
- loyalty/referral assumptions in the runtime
- no real queue or detail pages for stylist work

The result is a UI that looks polished but does not support actual salon operations.

## Target Product Areas

Recommended stylist routes:

```text
/stylist
/stylist/intakes
/stylist/intakes/:id
/stylist/appointments
/stylist/appointments/:id
/stylist/clients
/stylist/clients/:id
```

## Data Layer Design

Use RTK Query for all canonical server-backed stylist data.

Recommended additions:

- stylist endpoint module
- stylist view hooks
- mapper helpers for dashboard cards, intake detail, appointment detail, and client detail

Do not keep runtime dependence on seeded data files.

## Screen Design

### Dashboard

Must answer:

- what needs attention today
- what new intakes exist
- what upcoming appointments matter right now

### Intake Queue

Must answer:

- what intake submissions are new
- what is already in review
- which items are urgent

### Intake Detail

Must answer:

- what did the client submit
- what photos did they upload
- what review state and quote should the stylist attach

### Appointment List And Detail

Must answer:

- what is scheduled
- what prep or stylist notes are attached
- what intake context is linked to the appointment

### Client List And Detail

Must answer:

- who is this client
- what recent work has been done
- what maintenance context exists
- what recent intake information matters

## Suggested Implementation Order

### Phase 1

- add RTK Query endpoints and route skeletons
- render empty/loading/error states with real hooks

### Phase 2

- build dashboard
- build intake list

### Phase 3

- build intake detail and review form

### Phase 4

- build appointment list and detail

### Phase 5

- build client list and detail

### Phase 6

- remove remaining runtime use of seeded stylist data

## Component Strategy

Reuse only what helps the workflow.

Good reuse:

- cards
- list rows
- photo display components
- generic section wrappers

Bad reuse:

- loyalty-specific widgets
- referral widgets
- anything whose copy assumes points or rewards

## Validation

At minimum, confirm:

- stylist can log in and reach the stylist dashboard
- stylist can open intake list and intake detail
- stylist can save review changes
- stylist can open appointments and update notes/status
- stylist can open client detail

## Acceptance Criteria

- no seeded client or appointment data drives the real stylist runtime
- stylist dashboard uses real API data
- intake review works end-to-end
- appointment detail works end-to-end
- client detail works end-to-end

## Intern Notes

- build around real daily work, not around Storybook taxonomy
- if a presentational component fights the workflow, replace it
- prefer clear RTK Query hooks and simple page state over clever shared abstractions
