---
Title: Restyle Hair Booking App to New Fringe Design System
Ticket: HAIR-031
Status: active
Topics:
    - hair-booking
    - design-system
    - css-visual-diff
    - fringe
    - restyle
    - intake
DocType: index
Intent: long-term
Owners: []
RelatedFiles:
    - Path: design-galley/screenshots
      Note: Captured PNG screenshots of all 12 intake screens
    - Path: design-galley/standalone
      Note: Standalone HTML pages for each intake screen - visual baselines for css-visual-diff
    - Path: design-galley/visual-diff/userland/specs/intake-mobile.visual.yml
      Note: Visual suite spec for mobile intake screens
    - Path: design-galley/visual-diff/userland/verbs/fringe-pages.js
      Note: css-visual-diff verbs for Fringe intake screens
    - Path: web.deprecated/src/fringe-ui
      Note: Existing React component library with tokens
    - Path: web.deprecated/src/fringe/pages/client-booking
      Note: Existing 9-step client booking pages - old design
    - Path: web.deprecated/src/stylist/store
      Note: RTK Query store with API slices
ExternalSources: []
Summary: ""
LastUpdated: 2026-05-12T19:34:44.105628715-04:00
WhatFor: ""
WhenToUse: ""
---


# Restyle Hair Booking App to New Fringe Design System

## Overview

Restyle the Fringe hair booking app's frontend to match a new design system delivered as Claude-generated HTML/JSX prototypes. The new design ("Fringe Design System" / FS) features a plum + peach color palette, Anton display typography, and a 9-step mobile intake flow with desktop variants for the final 3 steps.

**Completed so far:**
- Extracted 12 standalone HTML pages from the prototype (9 mobile + 3 desktop)
- Captured PNG screenshots of all screens
- Created css-visual-diff userland with 4 verbs + visual suite spec
- Wrote comprehensive intern-facing implementation guide (10 parts + appendices)
- Uploaded guide + screenshots to reMarkable

**Key documents:**
- [Implementation Guide](design/01-hair-031-restyle-analysis-design-and-implementation-guide.md) — The main deliverable (48KB, covers everything)
- [Investigation Diary](reference/01-diary.md) — Chronological log of what was done and why

**Reference repos:**
- Pyxis (`/home/manuel/code/wesen/2026-04-23--pyxis/`) — Previous project using identical workflow
- Pyxis playbook (`ttmp/2026/05/01/HTML-DESIGN-TO-REACT-PLAYBOOK/...`) — Master conversion guide

## Key Links

- **Related Files**: See frontmatter RelatedFiles field
- **External Sources**: See frontmatter ExternalSources field

## Status

Current status: **active**

## Topics

- hair-booking
- design-system
- css-visual-diff
- fringe
- restyle
- intake

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
