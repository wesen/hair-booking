---
Title: Diary
Ticket: HAIR-039
Status: active
Topics:
  - frontend
  - dsl
  - admin
  - design-system
  - storybook
DocType: reference
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: Diary for designing the admin design system and DSL for one-stylist salon management.
LastUpdated: 2026-05-15T00:00:00Z
WhatFor: Record the creation of HAIR-039 and the design rationale for the admin DSL.
WhenToUse: Read before implementing admin UI primitives, admin DSL schema/builders/renderers, or one-stylist MVP screens.
---

# Diary

## Goal

This diary captures the creation of the HAIR-039 ticket and the first design guide for a one-stylist salon admin design system and composable admin DSL.

## Step 1: Create the ticket and define the design target

The work started by creating a new docmgr ticket for the admin side of the backend-driven DSL. The goal is not a rigid one-function-per-screen system. The goal is an elegant middle layer: high-level enough that common admin pages are quick to build, but still composable enough to handle many small business websites and future admin surfaces.

The concrete guiding MVP is a self-employed one-stylist salon. This keeps the first design grounded: dashboard, calendar, intakes, clients, services/pricing, availability, website content, media, settings, and the forgotten modal/empty/error states.

### Prompt Context

**User prompt (verbatim):** "Createa new docmgr ticket to create the admin design system, using the concrete MVP case as a guidance, and develop the DSL and start building up screens and implementations like for the frontend DSL.

Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Create a new ticket for an admin design system and DSL, write an intern-facing implementation guide using the one-stylist salon MVP as the concrete case, store it in docmgr, and upload the guide to reMarkable.

**Inferred user intent:** The user wants the same kind of disciplined design package used for the intake DSL, but now for generic backend/admin management UIs with a simple but expressive authoring API.

**Commit (code):** N/A — documentation ticket creation and design guide work.

### What I did
- Created HAIR-039: `Admin design system and DSL for one-stylist salon management`.
- Added the design document `design-doc/01-admin-design-system-and-dsl-implementation-guide.md`.
- Added this diary document.
- Added initial tasks for current-state mapping, MVP screens, DSL API design, component/renderer planning, and implementation phases.
- Used the current frontend DSL files as the implementation model:
  - `web/src/page-dsl/schema.ts`
  - `web/src/page-dsl/builder.ts`
  - `web/src/page-dsl/render.tsx`
  - `web/src/page-dsl/BackendDslPage.tsx`
  - `web/src/LiveDslDemoApp.tsx`

### Why
- The admin DSL should reuse the proven pattern from the page DSL: ergonomic authoring API, plain JSON output, renderer as interpreter, backend action refs, and Storybook examples.
- The one-stylist MVP prevents overbuilding a generic admin framework before the actual product screens are clear.

### What worked
- HAIR-039 was created successfully.
- The existing intake DSL provides a clear implementation template.
- The corrected HAIR-038 persistence model gives the admin DSL a generic backend data story through `configDb` and `stateDb`.

### What didn't work
- N/A for ticket creation.

### What I learned
- The right admin DSL shape should sit between low-level UI nodes and rigid resource scaffolding. It should provide `admin.page`, `resource.page`, `form`, `field`, `view`, `modal`, `drawer`, `action`, and `query` primitives, but all of those should still emit inspectable JSON.

### What was tricky to build
- The tricky design constraint is balancing expressiveness and simplicity. Too low-level and every admin screen becomes verbose; too high-level and the DSL becomes a set of fixed screen generators. The guide frames the solution as layered primitives: shells and resource patterns on top, ordinary layout/form/display nodes underneath.

### What warrants a second pair of eyes
- Review whether admin DSL should extend `web/src/page-dsl` directly or live in a sibling `web/src/admin-dsl` package with conversion/interop.
- Review whether resource/query/action naming should be generic now or hair-salon-specific for the first implementation.

### What should be done in the future
- Implement Phase 1 from the guide: scaffold `web/src/admin-dsl` schema, builder, examples, renderer shell, and Storybook stories.
- Keep the first implementation documentation-first and Storybook-first before connecting to live backend data.

### Code review instructions
- Start with the HAIR-039 design guide.
- Then inspect current DSL files in `web/src/page-dsl` to see the implementation pattern being mirrored.

### Technical details
- Ticket path:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management`

## Step 2: Upload and validate the guide

After writing the guide, I uploaded it to reMarkable so it can be reviewed away from the terminal. I also validated the docmgr frontmatter for both the guide and the diary.

One command failed because I passed a `ttmp/...` path to `docmgr validate frontmatter` while already running from the repository root; this command expects paths relative to the docmgr root, not paths prefixed with `ttmp/`. I reran validation with `2026/05/15/...` paths and both documents passed.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Upload the completed admin DSL design guide to reMarkable and make sure the ticket documentation is valid.

**Inferred user intent:** The user wants the design package available as both structured ticket documentation and a readable PDF on the reMarkable.

**Commit (code):** N/A — documentation and upload work.

### What I did
- Uploaded the guide with:
  - `remarquee upload bundle ... --name "HAIR 039 Admin Design System DSL Guide" --remote-dir "/ai/2026/05/15/HAIR-039" --toc-depth 2 --non-interactive`
- Upload succeeded:
  - `OK: uploaded HAIR_039_Admin_Design_System_DSL_Guide.pdf -> /ai/2026/05/15/HAIR-039`
- Validated frontmatter for the guide and diary.
- Updated the changelog with the upload location.

### Why
- The reMarkable PDF is useful for longer-form review.
- Frontmatter validation prevents broken docmgr metadata from accumulating.

### What worked
- reMarkable upload succeeded without manual authentication.
- `docmgr validate frontmatter` passed after using paths relative to the docmgr root.

### What didn't work
- Failed validation command:
  - `docmgr validate frontmatter --doc ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/01-admin-design-system-and-dsl-implementation-guide.md --suggest-fixes`
- Error:
  - `Error: open /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/01-admin-design-system-and-dsl-implementation-guide.md: no such file or directory`
- Corrected by removing the leading `ttmp/` in the `--doc` value.

### What I learned
- For `docmgr validate frontmatter`, use paths relative to the docs root (`2026/...`) rather than repository-relative `ttmp/2026/...` paths.

### What was tricky to build
- The upload itself was straightforward. The only sharp edge was docmgr path interpretation: some docmgr commands accept ticket/doc paths from the repo root in examples, but `validate frontmatter` resolved the path relative to `ttmp`, causing a duplicated `ttmp/ttmp` path.

### What warrants a second pair of eyes
- Review the guide's proposed `admin-dsl` package split and confirm whether it should stay separate or eventually merge with `page-dsl`.

### What should be done in the future
- Start Phase 1 implementation with the services/pricing admin page.

### Code review instructions
- Review the guide first, especially sections 6-19.
- Confirm that the proposed API keeps the intended balance of simplicity and expressiveness.

### Technical details
- reMarkable path:
  - `/ai/2026/05/15/HAIR-039/HAIR_039_Admin_Design_System_DSL_Guide.pdf`
