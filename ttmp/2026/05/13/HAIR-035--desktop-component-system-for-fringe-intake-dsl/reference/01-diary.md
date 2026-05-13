---
title: Diary
docType: reference
ticket: HAIR-035
status: active
intent: long-term
topics:
  - dsl
  - frontend
  - design-system
  - desktop
  - intake
  - storybook
created: 2026-05-13
updated: 2026-05-13
---

# Diary

## Goal

Track the analysis, design, and implementation of a desktop component system for the Fringe intake DSL — extending the existing mobile-first atoms/molecules/organisms library and the JSON DSL to support desktop-specific layouts, shells, and widgets.

## Step 1: Create ticket and write comprehensive analysis/design/implementation guide

Created HAIR-035 to collect all desktop component system work. Conducted a thorough investigation of the entire codebase: the DSL schema, the Goja runtime, the page renderer, the design gallery desktop prototypes, the css-visual-diff setup, and all prior ticket diaries (HAIR-031 restyle, HAIR-032 page DSL, HAIR-033 interactive widgets, HAIR-034 protobuf transport). Wrote a comprehensive intern-facing guide covering the complete system architecture, the gap analysis between mobile and desktop, and a concrete implementation plan.

### Prompt Context

**User prompt (verbatim):** "Let's create a new docmgr ticket to build our component system for the desktop version of the intake DSL / component system (atoms/molecules/organisms). Create a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet points and pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and then upload to remarkable. Look at the screens we got from import, how we used css-visual-diff, what already exists in the storybook, how we should approach turning existing intake screens or just transforming the intake DSL (more important than individual screens!) into something that looks good and works with desktop pages. Also make a list of missing widgets / layouts we need for the desktop side."

**Assistant interpretation:** Create a docmgr ticket for the desktop component system, deeply analyze the existing codebase and design prototypes, produce an exhaustive intern-ready guide with diagrams, pseudocode, API references, and file maps, identify missing desktop widgets/layouts, then upload to reMarkable.

**Inferred user intent:** Establish a complete project workspace and reference document that enables an intern to understand the full Fringe DSL system (mobile + desktop) and implement the desktop extensions independently.

**Commit (code):** N/A — ticket and docs creation only

### What I did

- Created ticket `HAIR-035` with topics `dsl,frontend,design-system,desktop,intake,storybook`.
- Added design doc: `Desktop Component System Analysis Design and Implementation Guide`.
- Added reference doc: `Diary` (this file).
- Related 14 key files: schema.ts, render.tsx, builder.ts, runtime.go, schema.go, modules_dsl.go, intake.flow.js, backendClient.ts, dsl.proto, tokens, intake-desktop.jsx, desktop screenshots, css-visual-diff.yml, fringe-intake.yaml.
- Investigated all prior tickets: HAIR-016 (fringe UI architecture), HAIR-031 (restyle diary), HAIR-032 (page DSL guide + remaining 600 lines), HAIR-033 (interactive widgets diary), HAIR-034 (protobuf transport diary).
- Analyzed 3 desktop design mockups (Estimate Butter, Booking Sage, Confirm Butter) via VLM.
- Analyzed 6 mobile screen mockups for comparison.
- Read the full intake.flow.js Goja script (7-step flow with real interactivity).
- Read the complete render.tsx (30+ node kinds mapped to React components).
- Read the protobuf contract (dsl.proto).
- Read the backendClient.ts (protobuf JSON transport).
- Read all design tokens (color, font, type, space, radius, shadow, palettes).

### Why

The existing DSL system was built mobile-first. The design gallery has desktop prototypes but no desktop shell, no desktop DSL node kinds, no desktop organisms. Before implementing, we need a comprehensive map of what exists, what's missing, and how to evolve the DSL to support both form factors from a single flow script.

### What worked

- The codebase is well-structured and self-documenting. Every piece needed for the analysis exists in concrete files.
- The design gallery desktop prototypes (`intake-desktop.jsx`) provide a clear visual specification for the desktop chrome (DesktopShell, StepRail, two-column split, accent panels).
- Prior ticket diaries (especially HAIR-032 and HAIR-033) contain exhaustive documentation that I could build upon.

### What didn't work

- Nothing blocked at this step.

### What I learned

- The DSL system has a clean three-layer architecture (builder → JSON → renderer) that naturally extends to desktop by adding new shell kinds and desktop-specific node kinds.
- The Goja runtime already supports the flow pattern where `ctx.state.step` switches between rendering functions — desktop flows can reuse the same state machine with different render functions.
- The biggest gap is not individual widgets but the **desktop shell system** (top nav, step rail, two-column layout manager) and the **desktop layout primitives** (accent panels, hero posters, receipt columns).

### What was tricky to build

- N/A — analysis phase only.

### What warrants a second pair of eyes

- The decision about whether desktop layouts should be new `DslNodeKind` entries (e.g., `desktopShell`, `stepRail`, `accentPanel`) or handled at the shell level via a new `ShellKind` (e.g., `shell.kind = "desktop"` with sub-layout props).
- Whether the same Goja flow script should emit different JSON depending on viewport, or whether the frontend should adapt the same JSON for both layouts.

### What should be done in the future

- Implement desktop shell atoms/organisms.
- Extend `DslNodeKind` with desktop-specific layout nodes.
- Write a desktop intake flow in Goja.
- Create css-visual-diff specs for desktop screens.
- Add desktop Storybook stories.

### Code review instructions

- Read the design doc in `design/01-desktop-component-system-analysis-design-and-implementation-guide.md`.
- Cross-reference with `design-galley/intake-desktop.jsx` for the visual specification.
- Verify the missing-widgets inventory is complete against the desktop mockups.

### Technical details

- Ticket path: `ttmp/2026/05/13/HAIR-035--desktop-component-system-for-fringe-intake-dsl/`
- Design doc path: `ttmp/2026/05/13/HAIR-035--desktop-component-system-for-fringe-intake-dsl/design/01-desktop-component-system-analysis-design-and-implementation-guide.md`

## Step 2: Build Phase 1 components (DesktopShell, TopNav, DesktopStepRail, AccentPanel, TwoColumnLayout)

Created the React components for the desktop chrome and layout primitives. These are the real React organisms/molecules that any approach will need — they're viewport-specific rendering components, not DSL node kinds.

Started extending the DSL with desktop-specific node kinds (twoColumn, accentPanel, heroPoster, etc.) but the user corrected this: the same JS flow script should produce the same JSON, and only the **rendering interpretation** should differ between mobile and desktop.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Build desktop shell components, then extend the DSL schema with desktop node kinds.

**Inferred user intent:** Build the desktop rendering components, but keep the DSL viewport-agnostic. The same Goja flow script + same JSON should work on both mobile and desktop.

### What I did

- Created `TopNav` molecule with nav links, wordmark, user avatar
- Created `DesktopStepRail` molecule with step progress sidebar
- Created `DesktopShell` organism composing TopNav + StepRail + content area
- Created `AccentPanel` molecule for full-height colored side panels
- Created `TwoColumnLayout` component for desktop split layout
- Created Storybook stories for all of them
- Added `"desktop"` shell kind to `schema.ts`
- Added DesktopShell rendering case in `render.tsx`
- **Incorrectly** added 8 desktop-specific DSL node kinds (twoColumn, accentPanel, heroPoster, heroNumber, tierList, monthCalendar, stylistDetailPanel, prepChecklist)
- Reverted the wrong approach after user feedback

### Why

The components are the rendering layer — they're needed regardless of the DSL approach. But the DSL extension was wrong because it violated the core DSL principle: viewport-agnostic JSON.

### What worked

- The desktop components build cleanly and have good Storybook stories
- The DesktopShell case in the renderer correctly maps shell.kind="desktop" to the new organism

### What didn't work

- Adding desktop-specific node kinds to the DSL schema was the wrong approach — it requires the flow script to know about desktop layout, defeating the purpose of the DSL

### What I learned

The core problem is harder than it first appears. The mobile and desktop don't just have different layouts — they have **different content structure**. The desktop estimate screen shows a hero price, tier breakdown, and accent panel that simply don't exist in the mobile JSON. The flow script compresses rich state data (individual estimate tiers, stylist details) into simple summary rows because that's all mobile needs.

Three possible approaches:

**A. Semantic regions in node metadata** — nodes get `meta.region = "main" | "context"`. Mobile renders all flat. Desktop splits by region. Problem: the flow script still needs to emit context panel nodes that mobile ignores.

**B. Renderer derives desktop content from existing nodes** — the desktop renderer inspects summaryRow("Range", "$220–$420") and extracts a hero price. Problem: fragile inference, loses structured data (individual tiers, duration).

**C. Enrich the flow to emit more structured data** — the estimate step emits a structured `estimateBreakdown` node with `{low, likely, high, duration}`. Mobile renders this compactly. Desktop renders it as a dramatic accent panel. **Same JSON, different visual weight.** This is the cleanest but requires enriching the current flow scripts.

None of these are a pure "just change the renderer" solution. The fundamental issue is that desktop shows **more** content than mobile (hero posters, accent panels, tier breakdowns, stylist detail panels, prep checklists). The data for that content exists in the flow state but isn't currently emitted as JSON.

### What was tricky to build

The architectural question of where viewport adaptation happens is genuinely hard. The DSL was designed as "recipe cards" — the same recipe should produce different dishes depending on the kitchen (mobile vs desktop). But the current mobile recipe doesn't include all the ingredients the desktop kitchen needs.

### What warrants a second pair of eyes

- The three approaches (A, B, C) above — which is the right one, or is there a better option?
- Whether the Goja flow script should be enriched to emit richer data (approach C) or whether the renderer should do the adaptation (approach B) or whether we need region metadata (approach A)

### What should be done in the future

- Decide on the viewport-adaptation strategy before implementing Phase 2
- The desktop components (DesktopShell, TopNav, StepRail, AccentPanel, TwoColumnLayout) are ready and committed

### Code review instructions

- Review the new component files in `web/src/molecules/TopNav/`, `web/src/molecules/DesktopStepRail/`, `web/src/organisms/DesktopShell/`, `web/src/molecules/AccentPanel/`
- Verify Storybook stories render correctly
- Check that `render.tsx` DesktopShell case is correct
- Verify schema.ts only has the `"desktop"` shell kind added (no extra node kinds)
