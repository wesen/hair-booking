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
- Check that schema.ts has exactly the 24 UI-primitive kinds, no legacy domain kinds

## Step 3: Clean cutover to UI-primitive node kinds

Replaced all 13 domain-specific DSL node kinds with 6 generic UI primitives across the entire stack — TypeScript (schema, builder, renderer, examples, stories, tests) and Go (Goja runtime module, flow script, Go tests).

### Prompt Context

**User prompt (verbatim):** (see Step 1 — continuation of the desktop component system work)

**Assistant interpretation:** Execute a clean cutover: remove all legacy node kinds, migrate everything to UI primitives, no backwards compatibility.

**Inferred user intent:** Complete the DSL redesign by removing all domain-specific names so the DSL is purely UI-centric. The same JSON must work for both mobile and desktop — domain knowledge stays in the flow script data.

**Commit (code):** e416b33 — "feat(dsl): clean cutover to UI-primitive node kinds"
**Commit (goja):** c37518a — "feat(dslgoja): migrate Goja runtime to UI-primitive node kinds"

### What I did

**TypeScript (web/):**
- Stripped `DslLegacyNodeKind` alias type from schema.ts
- Removed all legacy builder methods (ratingBar, serviceOption, budgetOption, timeSlot, timeSlotGroup, colorLevelBar, lengthSilhouette, photoTile, summaryRow, stylistCard, dayPickerGrid, serviceOptionGroup, budgetOptionGroup) from builder.ts
- Removed all legacy switch cases and component imports from render.tsx
- Rewrote examples.ts with new primitives only
- Rewrote experimental.ts with 5 new example pages (consultation dashboard, appointment planner, color lab, photo moodboard, aftercare plan)
- Updated InteractiveDsl.stories.tsx to use new primitives (selectableGroup, scale, uploadTile, calendarGrid)
- Updated BackendDslPage.stories.tsx: changed raw JSON kind strings from "serviceOptionGroup" → "selectableGroup", "ratingBar" → "scale"
- Updated InteractiveDsl.test.tsx: rewrote all 3 tests for new primitives

**Go (pkg/dslgoja/):**
- Replaced 8 legacy `n.*` helpers in modules_dsl.go with new primitives: selectable, selectableGroup, scale, kvRow, stat, uploadTile, personCard, calendarGrid; added rule, progress, masthead, chip, dayCell
- Rewrote intake.flow.js from scratch using new primitives — all 7 steps (service → color → photos → budget → estimate → booking → confirm)
- Updated host_user_images_test.go: photoTile → uploadTile

### Why

The DSL was still carrying 13 domain-specific node kinds that encoded hair-salon concepts (serviceOption, budgetOption, stylistCard, etc.). These violate the UI-primitive design principle: the DSL should describe UX affordances (what the user can do), not domain concepts. The same JSON must render meaningfully on both mobile and desktop — domain knowledge belongs in the flow script's data, not in the node kind names.

### What worked

- The mapping was mechanical and unambiguous: ratingBar→scale, serviceOption→selectable, photoTile→uploadTile, etc.
- The Go side compiled and tested clean on first try after the module source rewrite
- TypeScript typecheck passed clean after all 8 files were updated
- All 25 frontend tests pass
- All Go tests pass

### What didn't work

- The uploadTile test initially failed because the action dispatch model changed — the old test called `onUpload` via `context.actions.upload`, but the new primitive uses `context.backendDispatch` for upload events. Fixed by restructuring the test to match actual render behavior.
- The BackendDslPage.stories.tsx had raw JSON objects (not builder calls) with old kind strings — easy to miss since they don't go through the builder type system.

### What I learned

- When doing a clean cutover, search for old names everywhere — not just in builder calls but also in raw JSON literals, test matchers, and Go test strings.
- The Goja module source is a single JS string constant in Go — changes there don't get TypeScript protection. Must run Go tests to verify.
- The new primitives are actually more expressive: `selectableGroup` with `mode: "single"` replaces both `serviceOptionGroup` and `budgetOptionGroup` (which were identical except for field names). `scale` replaces both `ratingBar` and `colorLevelBar`.

### What was tricky to build

- The intake.flow.js rewrite needed care: the old script used domain-specific field names (`name`, `description`, `rate`) while the new selectableGroup expects (`title`, `subtitle`, `badge`). The data arrays had to be re-mapped.
- The estimateStep now uses `stat` for the hero price and `kvRow` for each line item, which is cleaner than the old `summaryRow` pattern.

### What warrants a second pair of eyes

- The intake.flow.js rewrite is a complete replacement — verify all 7 steps produce correct JSON
- The render.tsx inline styles for new primitives (selectable, selectableGroup, scale, kvRow, stat, uploadTile, personCard, calendarGrid) are placeholders — they should eventually use design tokens and existing molecule components
- The `calendarGrid` renderer in render.tsx is hand-inlined — it should probably use a proper DayCell molecule

### What should be done in the future

- Wire new primitives to existing molecule components instead of inline styles (selectable → ServiceOption/SelectableCard, scale → ScaleInput, etc.)
- Implement `partitionForDesktop()` in render.tsx for two-column desktop composition
- Add Storybook stories for each new primitive
- Run css-visual-diff against desktop design specs

### Code review instructions

- `git diff e416b33~1..e416b33` — all 8 TypeScript files changed
- `git diff c37518a~1..c37518a` — 3 Go/JS files changed
- Verify `npx tsc --noEmit` passes in web/
- Verify `go test ./pkg/dslgoja/... -count=1` passes
- Verify `npx vitest run` passes in web/

### Technical details

**Old → New mapping:**
- ratingBar → scale (value, max, label, interactive)
- serviceOptionGroup → selectableGroup (options, value, mode: "single")
- budgetOptionGroup → selectableGroup (options, value, mode: "single", columns: 2)
- timeSlotGroup → selectableGroup (options, value, mode: "single", columns: 4)
- colorLevelBar → scale (value, max, variant: "swatches")
- lengthSilhouette → selectable (title, value)
- photoTile → uploadTile (label, value, filled)
- summaryRow → kvRow (label, value)
- stylistCard → personCard (name, role, badge)
- dayPickerGrid → calendarGrid (year, month, days, value)
- serviceOption → selectable (title, value, badge)
- budgetOption → selectable (title, value)
- timeSlot → selectable (title, value)

**New primitives added to schema:**
- selectable, selectableGroup, scale, kvRow, stat, uploadTile, personCard, calendarGrid

**Schema total kinds (24):** text, spacer, stack, grid, eyebrow, button, note, card, rule, progress, masthead, chip, chipGroup, segmented, selectable, selectableGroup, scale, uploadTile, kvRow, stat, personCard, dayCell, calendarGrid

## Step 4: Wire primitives to molecules + desktop partition + Storybook stories

Connected all new UI-primitive render cases to existing molecule components instead of inline styles. Added `partitionForDesktop()` for automatic two-column desktop layout. Added `meta.region` for explicit node placement. Created comprehensive Storybook stories for all new primitives.

### Prompt Context

**User prompt (verbatim):** (same as Step 1 — continuation)

**Assistant interpretation:** Continue implementing the DSL redesign by wiring render cases to molecule components, adding desktop two-column partitioning, and creating Storybook stories.

**Inferred user intent:** Complete the rendering pipeline so all primitives use proper styled components, enable desktop layout, and have visual documentation.

**Commit (code):** b52d89a — "feat(dsl): wire UI primitives to existing molecule components"
**Commit (code):** 36f24c2 — "feat(dsl): add partitionForDesktop() for two-column desktop layout"
**Commit (code):** d5fab66 — "feat(dsl): add region() method to builder and Goja module"
**Commit (code):** 45b6687 — "feat(dsl): add Storybook stories for all UI primitives + desktop partition"

### What I did

- **Molecule wiring:** selectable → ServiceOption, selectableGroup → ServiceOption/BudgetOption/TimeSlot (auto-detected by shape), kvRow → SummaryRow, personCard → StylistCard, uploadTile → PhotoTile, scale(swatches) → ColorLevelBar, calendarGrid → DayPickerGrid
- **Desktop partition:** Added `partitionForDesktop()` that scans nodes and auto-pulls stat + personCard into right-side AccentPanel. DesktopShell now renders TwoColumnLayout when context nodes exist.
- **meta.region:** Added `region: "main" | "context"` to DslNodeMeta type, `region()` method to builder and Goja module. Flow scripts can explicitly control desktop placement.
- **Storybook:** Created UiPrimitives.stories.tsx with 12 stories covering all new primitives in both mobile and desktop modes.

### Why

Inline styles were a placeholder. The molecules already have proper styling, interaction patterns, and data-component attributes for visual regression testing. The desktop partition is the core value proposition — the same JSON produces different layouts on mobile (single column) and desktop (two-column with accent panel).

### What worked

- The molecule wiring was straightforward — the prop mapping was clean (title→name, subtitle→description, badge→rate)
- The `selectableGroup` auto-detection by option shape works well: badges → ServiceOption, subtitles → BudgetOption, bare → TimeSlot
- The partition logic is simple and extensible via meta.region
- All 25 tests pass after fixing the query selectors from `data-dsl-kind` to `data-component`

### What didn't work

- The uploadTile test initially failed because `dispatchAction` expected `props.action` but the render used `localKey="onUpload"` instead of `localKey="action"`. Fixed by aligning the key.
- Tests that queried `data-dsl-kind` broke when we switched to molecule components that use `data-component`. Updated to query the correct attribute.

### What I learned

- When rendering through molecules, the `data-dsl-kind` attribute is set via `{...common}` spread but the actual interactive element may be a child (e.g., `<button>` inside a molecule). Tests need to query by `data-component` instead.
- The selectableGroup shape detection is a nice pattern: the same DSL kind can render as different molecules depending on the data shape. This means flow scripts don't need to know about component types.

### What was tricky to build

- The dispatchAction path: there are two paths (backend actionRef vs frontend action name) and the code needs to fall through correctly. The `localKey` parameter was confusingly named — it's the prop key where the action name is stored, not a local identifier.

### What warrants a second pair of eyes

- The selectableGroup shape detection (hasBadges/hasSubtitles) — is this the right heuristic or should we use explicit props?
- The partitionForDesktop auto-pulling stat + personCard — should this be opt-in instead of automatic?

### What should be done in the future

- Add css-visual-diff specs for the new stories
- Implement scale(swatches) with `target` prop support for before/after level comparison
- Consider a `SelectableCard` molecule for the generic case (currently we reuse domain-specific molecules)

### Code review instructions

- `git diff b52d89a~1..45b6687` — 4 commits covering molecule wiring, partition, region, stories
- Verify `npx tsc --noEmit`, `npx vitest run`, `go test ./pkg/dslgoja/... -count=1` all pass
- Run `npx storybook` and check the "Page DSL/UI Primitives" section

### Technical details

**Molecule mapping:**
- selectable → ServiceOption (title→name, subtitle→description, badge→rate)
- selectableGroup (full-width, badges) → ServiceOption × N
- selectableGroup (columns, subtitles) → BudgetOption × N
- selectableGroup (columns, bare) → TimeSlot × N
- kvRow → SummaryRow
- personCard → StylistCard (name, role, rate/badge)
- uploadTile → PhotoTile (onUpload/onRemove)
- scale(swatches) → ColorLevelBar
- calendarGrid → DayPickerGrid
- stat → inline (no molecule)
- scale(dots) → inline (no molecule)

**Desktop partition rules:**
- meta.region = "context" → right-side AccentPanel
- meta.region = "main" → left column
- kind = "stat" or "personCard" → right-side AccentPanel (auto)
- everything else → left column
