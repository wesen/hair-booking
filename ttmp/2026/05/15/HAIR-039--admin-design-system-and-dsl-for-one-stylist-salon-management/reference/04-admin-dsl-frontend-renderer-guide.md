---
Title: Admin DSL Frontend Renderer Guide
Ticket: HAIR-039
Status: active
Topics: [admin, dsl, frontend, react]
DocType: reference
Intent: implementation-guide
---

# Admin DSL Frontend Renderer Guide

The Admin DSL renderer is an explicit interpreter. Keep it that way.

## Adding a node kind

1. Add the kind to `AdminNodeKind` in `web/src/admin-dsl/schema.ts`.
2. Add fixture builder support in `web/src/admin-dsl/builder.ts` only if authors need it.
3. Add an explicit `case` in `web/src/admin-dsl/render.tsx` or a focused renderer module.
4. Use `renderUtils.ts` for JSON extraction, styles, keys, and data attributes.
5. Use `actions.ts` for action normalization and dispatch.
6. Add tests for JSON stability and dispatch behavior.
7. Add Storybook stories for at least one desktop and one mobile state when layout changes.

## Do not

- Do not dynamically look up React components by string names from JSON.
- Do not put functions, class instances, or React elements inside props.
- Do not hide backend-owned behavior in frontend-only callbacks when the story is meant to model backend dispatch.

## Preferred review surfaces

- Static fixture stories for deterministic layout review.
- MSW scenario stories for interaction review.
- Live backend stories only for end-to-end smoke checks.
