---
Title: Admin DSL Storybook Scenario Guide
Ticket: HAIR-039
Status: active
Topics: [admin, dsl, storybook, msw, visual-review]
DocType: reference
Intent: implementation-guide
---

# Admin DSL Storybook Scenario Guide

Use four story types deliberately.

## Static stories

Use for deterministic layout states: default, empty, loading, error, selected, drawer open, confirm open, mobile, desktop, matrix.

## Local-state stories

Use for quick exploratory interaction when no HTTP shape matters.

## MSW-backed stories

Use when the story should model backend-like request/response behavior without a live server. Define the scenario with `AdminScenarioDefinition`, register handlers with `createAdminScenarioHandlers`, and render with `AdminScenarioHarness`.

Supported response semantics:

- success,
- validation,
- authorization,
- server,
- stale.

## Live backend stories

Use only for smoke validation of real protobuf/HTTP transport. Keep them out of CI-grade screenshot flows unless the backend state is deterministic.

## Screenshot policy

- Manual/VLM review: broad scenario captures and exploratory states.
- CI-grade candidates: static or MSW stories with deterministic data and stable viewport.
- Avoid CI screenshots that depend on live backend timing or mutable server state.

Script:

- `scripts/02-capture-admin-dsl-scenarios.sh`
