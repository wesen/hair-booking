---
Title: React + RTK Toolkit Port Plan (About Us first)
Ticket: 2026-01-18-assets-analysis
Status: active
Topics: []
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: assets/Hairy/page-about-us.html
      Note: Source layout for About Us port
    - Path: ttmp/2026/01/18/2026-01-18-assets-analysis--assets-template-analysis/design-doc/01-assets-template-analysis.md
      Note: Component inventory and section mapping reference
    - Path: ui/.storybook/main.ts
      Note: Storybook story glob configuration
    - Path: ui/src/components/sections/PageTitleSection.tsx
      Note: Representative widget implementation
    - Path: ui/src/pages/AboutUsPage.tsx
      Note: About Us composition from widgets
    - Path: ui/src/store.ts
      Note: RTK Toolkit store skeleton
ExternalSources: []
Summary: Plan to port the Hairy template to React + RTK Toolkit, starting with the About Us page and excluding blog features.
LastUpdated: 2026-01-18T17:38:30-05:00
WhatFor: Define scope, architecture, and phased implementation for the React port.
WhenToUse: Use as the guiding plan when building the React UI, starting with About Us.
---



# React + RTK Toolkit Port Plan (About Us first)

## Executive Summary

We will port the Hairy HTML template into a React application using RTK Toolkit (and RTK Query when APIs are introduced). The initial milestone is a faithful React implementation of the About Us page, built from reusable section widgets derived from the template inventory. Blog pages and blog components are explicitly out of scope and will not be implemented. Storybook will be used to preview and validate each widget in isolation.

This document outlines the scope, architecture, and phased plan to build a widget-based React system, starting with the About Us page sections (`page-title`, `video`, `counter`, `testimonial`; `team` and `blog` sections removed) and shared layout (header/footer). Each widget will have a Storybook story.

## Problem Statement

We need a practical, incremental plan to port the template to React + RTK Toolkit, starting with a single page. Without a clear plan, we risk implementing too much at once, duplicating components, or building blog features we do not need. The first page must validate the component system and layout strategy before scaling to other pages.

## Proposed Solution

### Scope

**In scope (Phase 1):**
- React app skeleton with shared layout (preloader optional), header/nav, footer.
- Storybook setup for component previews and regression-friendly development.
- About Us page sections mapped to React widgets:
  - Page title banner (`#page-title`)
  - Video section (`#video2`)
  - Counter stats (`#counter1`)
  - Testimonial carousel (`#testimonial2`)
- Shared primitives used by these sections: buttons, headings, cards, carousel, overlay backgrounds.

**Explicitly out of scope:**
- All blog pages and blog components (grid, masonry, single, sidebar widgets, related posts).
- Blog widgets in footer (can be replaced with a non-blog “Latest Posts” placeholder or removed later).
- Team section (`#team1`) and any team member widgets.

### About Us page mapping (HTML → React widgets)

From `assets/Hairy/page-about-us.html`:
- `PageTitle` widget (background image + title + breadcrumb).
- `VideoSection` widget (two-column layout with text + image + play button overlay).
- `CounterSection` widget (stat tiles).
- `TestimonialsSection` widget (carousel with avatar + quote).
- Footer: keep as shared `Footer` layout widget.

### Architecture outline

- **UI layer:** React components organized by sections and primitives.
- **State layer:** RTK Toolkit store for UI state (e.g., nav toggles, modal state). RTK Query reserved for future API data sources; initial data can be local JSON.
- **Routing:** React Router or equivalent; start with About Us route only.
- **Styling:** Keep template CSS class names initially to preserve layout parity; evaluate whether to migrate to scoped styles later.

## Design Decisions

- **Start with About Us page:** It exercises diverse sections (video, counters, testimonials) without requiring commerce or booking logic.
- **No blog implementation:** Blog features are excluded to reduce scope and avoid building unused widgets.
- **No team section:** Team grid is excluded to keep the About Us milestone focused.
- **Storybook-first widgets:** Every widget is built with a Storybook story for isolated validation.
- **Widget-first component model:** Each template section maps to a React “section” component with variants; reusable primitives are centralized.
- **Data-first composition:** Sections accept structured data props so page definitions can be declarative and repeatable.

## Alternatives Considered

- **Port homepage first:** Rejected because it includes more distinct sections (pricing, blog, clients, etc.) and increases initial scope.
- **Keep blog components as placeholders:** Rejected; even placeholders would introduce design debt and unused UI.
- **Direct HTML embedding:** Rejected; it prevents component reuse and a clean React architecture.

## Implementation Plan

1. **Project skeleton**
   - Set up React app with RTK Toolkit store.
   - Add routing with a single About Us route.
   - Import template CSS assets for parity.

2. **Shared layout**
   - Implement `Header`, `Nav`, and `Footer` components.
   - Verify responsive layout and navigation styles.

3. **About Us sections**
   - Implement `PageTitle`, `VideoSection`, `CounterSection`, `TestimonialsSection`.
   - Map static content from `page-about-us.html` into JSON data structures.
   - Add Storybook stories for each widget and wire global styles for parity.

4. **Primitives and utilities**
   - Implement reusable primitives used by About Us (button, heading, overlay, carousel wrapper).
   - Ensure minimal UI state in RTK store (e.g., nav collapse).

5. **Validation**
   - Compare About Us page layout and behavior against the HTML template.
   - Note any visual deviations as follow-ups.

## Open Questions

- Which carousel library will replace the template’s jQuery carousel, and how will it impact CSS parity?
- Should the footer’s “Latest Posts” widget be removed or repurposed since blog is out of scope?
- Do we retain the preloader in the React version or drop it for simplicity?

## References

- `assets/Hairy/page-about-us.html`
- `ttmp/2026/01/18/2026-01-18-assets-analysis--assets-template-analysis/design-doc/01-assets-template-analysis.md`
