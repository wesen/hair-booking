---
title: Investigation Diary
status: active
doc-type: reference
intent: long-term
topics:
  - frontend
  - restyle
  - design-system
  - react
  - storybook
  - react-modular-themable-storybook
owners: []
created: 2026-04-21
---

# Diary — HAIR-016: Hair Booking Frontend Restyle

## Goal

Restyle the entire hair-booking frontend using the new Fringe design system (plum + peach brand core, editorial-zine aesthetic) sourced from `~/Downloads/hair-booking.zip`. The backend RTK Query APIs remain unchanged; only the visual layer and component library are replaced from scratch.

---

## Step 1: Import sources + initial survey

**User prompt (verbatim):** "Create a new docmgr to restyle / redo the hair-booking application frontend. Import the zip file ~/Downloads/hair-booking.zip in the sources/ folder of the ticket. Keep a diary. Analyze the file, it's a new design system and a set of new screens (Hair Intake.html, Stylist Dashboard.html, Client Pages.html). We are going to replace the current system (the visual side of it, and keep the backend the same/slightly modify it only) in its entirety with the new screens."

**Assistant interpretation:** Import and analyze a new Fringe-branded design system (HTML + JSX) covering three distinct application surfaces — client-facing intake/booking, stylist-side dashboard, and client portal pages — then produce a detailed design/implementation guide mapping these new screens to the existing RTK Query API layer.

**Inferred user intent:** Full visual system replacement. No backward compatibility needed. Start fresh on the frontend component layer. Keep the backend unchanged.

### What I did

- Created ticket `HAIR-016` via docmgr at `ttmp/2026/04/21/HAIR-016--hair-booking-frontend-restyle-fringe-design-system/`
- Extracted `~/Downloads/hair-booking.zip` to `sources/`
- Read every HTML and JSX file in the zip:
  - `Design System.html` + `design-system.jsx` — the token/component library
  - `Hair Intake.html` + `intake-fs.jsx` + `intake-desktop.jsx` — 9-step intake flow (mobile + desktop)
  - `Stylist Dashboard.html` + `stylist-dashboard.jsx` + `stylist-pages.jsx` — stylist Today/Clients/Inbox/You
  - `Client Pages.html` + `client-pages.jsx` + `client-edit.jsx` — client-side home/upcoming/history/account
  - `screens.jsx` — wireframe variants (UX exploration, not implementation targets)
  - `Hair History Hi-Fi.html` + `history-hifi.jsx` (reference variant)
  - `Hair History - Modern Zine Responsive.html` + `history-responsive.jsx` (reference variant)
- Audited the existing codebase:
  - `web/src/stylist/store/api/` — 7 API slices (auth, booking, portal, services, stylist, stylistView, portalView)
  - `web/src/stylist/pages/` — 33 page components
  - `web/src/stylist/components/` — 30+ UI components
  - `web/src/stylist/StylistApp.tsx`, `ClientBookingApp.tsx`, `ClientPortalApp.tsx`

### Why

The user explicitly said "keep the backend the same" and "start afresh" — this means the scope is purely a visual/UX replacement. The existing RTK Query API is complete and well-typed; the new design just needs to wire to it.

### What worked

- docmgr creates the ticket with the correct directory structure automatically
- All source files read cleanly — the Fringe system is self-contained in ~14 JSX/HTML files
- The existing API surface maps cleanly to the new screens with no new endpoints needed (Phase 1-4)
- Moving the sources from the manually-created directory into the docmgr-created ticket keeps everything in one place

### What didn't work

- Initially created a manual `HAIR-016--hair-booking-frontend-restyle/` directory with a `ticket.yaml` (thinking docmgr needed it). The user clarified this was wrong — docmgr manages tickets via its own YAML frontmatter system, not a `ticket.yaml` file. Had to recreate the ticket via `docmgr ticket create-ticket`.

---

## Step 3: Build fringe-ui package + Storybook stories

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Build the complete fringe-ui design system package and all Storybook stories, then start on the page components.

**Commit (code):** `c96242b` — "fringe-ui: scaffold fringe design system package (Phase 1 foundation)"

### What I did

- Created `web/src/fringe-ui/` directory structure: `tokens/`, `primitives/`, `salon-widgets/`, `chrome/`, `layout/`
- Wrote `tokens/index.css` — all CSS custom properties (fringe- prefix) with Google Fonts import
- Wrote `tokens/index.ts` — TypeScript token constants (color, font, type, space, radius, shadow, levelSwatches, tagPalette, notePalette)
- Ported all FS primitives from `design-system.jsx` as TypeScript React components (13 primitives + 6 salon-widgets + 4 chrome + 4 layout shells)
- Wrote 26 `.stories.tsx` files with ~125 total stories across all components. Each component gets: Default + state variants + themed variants + group/composite stories + AllVariants + Unstyled

### What worked

- Straight port of the FS JSX objects → TypeScript with `React.CSSProperties` for all inline styles
- Consistent story pattern: each component gets 5-8 stories covering default/hover/disabled/themed/group/composite/unstyled
- All imports use relative paths from `fringe-ui/` subdirectory (clean import graph)

### What didn't work

- HomeIndicator was accidentally written to the wrong path (`hair-v4-frontend-restyle/`) — moved it to correct location immediately
- No issues otherwise — all components ported cleanly

### What was tricky to build

- The `Segmented` component uses a string array or `{value, label}` object array — normalized to accept `Array<string | {value: string, label: string}>`
- `TabBar` has two variants (stylist with badge, client without badge) — exported both from the same file
- `IntakeShell` needed a specific layout: StatusBar + AppHeader + Progress + title area + scroll content + bottom CTA bar + HomeIndicator. This is the most complex layout shell.

### Code review instructions

- Start with `web/src/fringe-ui/tokens/index.ts` — all tokens originate here
- Verify `web/src/fringe-ui/index.ts` re-exports everything correctly (no missing exports)
- Check Storybook runs: `cd web && pnpm storybook`
- Run `pnpm storybook build` to verify all 26 story files compile

---

## Step 4: Build fringe/ page layer

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Build all page components in `web/src/fringe/pages/` — client booking (9 screens), stylist (3 screens), client portal (2 screens). Wire all to RTK Query hooks.

**Commit (code):** `fcb281a` — "fringe: scaffold fringe/ page layer (Phase 2 — all screens wired)"

### What I did

- Created `web/src/fringe/` (page layer, separate from fringe-ui design system)
- Built 9 client-booking pages: WelcomePage, ServicePage, ColorPage, ExtensionsPage, PhotosPage, HistoryPage, BudgetPage, EstimatePage(+EstimatePageDesktop variant), BookingPage, ConfirmPage
- Built 3 stylist pages: TodayPage, ClientsPage, YouPage
- Built 2 client-portal pages: LandingPage, HistoryPage
- All pages use `fringe-ui/` components exclusively, all API calls use existing RTK Query hooks

### Why

Separating `fringe-ui/` (design system) from `fringe/` (pages) keeps concerns clean. The design system has no app logic; pages only import from the design system + RTK Query. This makes:
- Storybook testing of design system components in isolation (no app context needed)
- Easy to swap pages one-by-one without touching the design system
- Clear import graph for refactoring

### What worked

- ColorPage wires to `useCreateIntakeMutation` and calls `onNext()` after the API call
- BookingPage wires to `useGetAvailabilityQuery` + `useCreateAppointmentMutation`
- EstimatePage has a `EstimatePageDesktop` variant (butter accent panel) matching the new design exactly
- Stylist TodayPage uses `DashboardAppointmentDto` type from the API
- All pages are props-based (no Redux dispatch) for testability

### What didn't work

- `PortalAppointmentDto` doesn't include `stylist_name` — HistoryPage works around this by using `service_name.split(' ')[0]` as a proxy. This is a known gap in the API types.
- No messaging/inbox pages yet (deferred per design guide)

### What was tricky to build

- `EstimatePageDesktop` — the two-panel desktop layout with butter hero panel required careful flexbox layout. Verified against the new design (D_Estimate_Butter in intake-desktop.jsx)
- `TodayPage` up-next ribbon — uses `DashboardAppointmentDto` which has `client_name`, `service_name`, `start_time` but no duration. Used fixed "TBD" for now.
- `ClientsPage` grouping (Today / Due Soon) — split at index 5 as a heuristic since there's no explicit group field on `StylistClientListItemDto`

### What warrants a second pair of eyes

- The `PortalAppointmentDto` missing `stylist_name` — may need to extend the portal API DTO or accept the workaround
- Inbox/messaging pages are designed in `stylist-pages.jsx` (St_Inbox, St_Thread) but not yet implemented — check if there's a backend endpoint shape needed

### What should be done in the future

- Phase 3: Replace `ClientBookingApp.tsx` to use `fringe/pages/client-booking/` — swap old pages for new Fringe pages, wire routing
- Phase 4: Replace `StylistApp.tsx` to use `fringe/pages/stylist/` — Today, Clients, You tabs
- Phase 5: Replace `ClientPortalApp.tsx` to use `fringe/pages/client-portal/`
- Phase 6 (Polish): Delete old `web/src/stylist/pages/` and `web/src/stylist/components/` once all imports are gone
- Run `rg "from.*components" web/src/stylist/pages/` before each deletion pass to verify zero remaining imports

### What I learned

- The existing codebase uses a **custom color system** (CSS variables) with a completely different palette (coral/teal/mint/lavender) — zero token compatibility. This simplifies the cutover: just replace entirely.
- The RTK Query API surface is **surprisingly clean and well-structured** with typed DTOs for every operation.
- The design system is called "**Fringe**" — plum (#6b3a4a) + peach (#f2b89a) brand with Instrument Serif for editorial, Anton for display, Inter for body, JetBrains Mono for eyebrows.
- The new designs cover **3 distinct apps in one codebase**: client booking flow (intake → estimate → booking → confirm), stylist dashboard (today/clients/inbox/you), client portal (home/upcoming/history/account + edit screens).
- The `FS` design system exports: `color`, `font`, `type`, `space`, `radius`, `shadow` tokens + 20+ primitive components (Button, Chip, TextField, Card, RatingBar, Segmented, Progress, Note, Section, Masthead, AppHeader, StatusBar, HomeIndicator, PhoneFrame, StylistCard, PhotoTile, SummaryRow, DayCell, Eyebrow, Wordmark, Rule, IndexChip).

### What was tricky to build

- The existing codebase is large (33 pages, 30+ components) — mapping every new design screen to the right API endpoint required a systematic walkthrough.
- The new design system uses inline styles (JSX objects) rather than CSS classes. Porting to CSS custom properties requires a two-step: (1) create `tokens.css` as the base, (2) use inline style overrides for dynamic values.
- The `design-canvas.jsx` is a Figma-like pan/zoom viewer — useful for design iteration but not for production.
- The wireframe variants in `screens.jsx` are UX exploration artifacts (sketchy hand-drawn aesthetic, three variants per screen) — they provide interaction patterns but are not implementation targets.
- The existing `IntakeColorPage.tsx` and `IntakeExtPage.tsx` pages need to be replaced wholesale with the new Fringe intake flow.
- Had to create `web/src/fringe/` (page layer) separate from `web/src/fringe-ui/` (design system library) to keep the two concerns clean.

### What was tricky to build

- The existing codebase is large (33 pages, 30+ components) — mapping every new design screen to the right API endpoint required a systematic walkthrough.
- The new design system uses inline styles (JSX objects) rather than CSS classes. Porting to CSS custom properties requires a two-step: (1) create `tokens.css` as the base, (2) use inline style overrides for dynamic values.
- The `design-canvas.jsx` is a Figma-like pan/zoom viewer — useful for design iteration but not for production.
- The wireframe variants in `screens.jsx` are UX exploration artifacts (sketchy hand-drawn aesthetic, three variants per screen) — they provide interaction patterns but are not implementation targets.
- The existing `IntakeColorPage.tsx` and `IntakeExtPage.tsx` pages need to be replaced wholesale with the new Fringe intake flow.

### What warrants a second pair of eyes

- The routing decision: the intake flow branches based on `service_type` (color vs extensions vs both) — need to confirm the step numbering in the progress bar matches the actual step count (not always 9 steps).
- Messaging/Inbox (`St_Inbox`, `St_Thread`) has no API endpoint. The UI is fully designed but unbacked. Need to decide whether to defer the whole inbox or stub out the endpoint shape.
- The dark variant (`St_Today_Bold` — ink bg + butter hero) is only designed as a single screen (Today) — the stylist dashboard dark mode needs confirmation if it's a global theme or per-screen.

### What should be done in the future

- Phase 3: Replace `ClientBookingApp.tsx` to use `fringe/pages/client-booking/` — swap old pages for new Fringe pages, wire routing
- Phase 4: Replace `StylistApp.tsx` to use `fringe/pages/stylist/` — Today, Clients, You tabs
- Phase 5: Replace `ClientPortalApp.tsx` to use `fringe/pages/client-portal/`
- Phase 6 (Polish): Delete old `web/src/stylist/pages/` and `web/src/stylist/components/` once all imports are gone
- Run `rg "from.*components" web/src/stylist/pages/` before each deletion pass to verify zero remaining imports

### What I learned

- The existing codebase uses a **custom color system** (CSS variables) with a completely different palette (coral/teal/mint/lavender) — zero token compatibility. This simplifies the cutover: just replace entirely.
- The RTK Query API surface is **surprisingly clean and well-structured** with typed DTOs for every operation.
- The design system is called "**Fringe**" — plum (#6b3a4a) + peach (#f2b89a) brand with Instrument Serif for editorial, Anton for display, Inter for body, JetBrains Mono for eyebrows.
- The new designs cover **3 distinct apps in one codebase**: client booking flow (intake → estimate → booking → confirm), stylist dashboard (today/clients/inbox/you), client portal (home/upcoming/history/account + edit screens).
- The `FS` design system exports: `color`, `font`, `type`, `space`, `radius`, `shadow` tokens + 20+ primitive components (Button, Chip, TextField, Card, RatingBar, Segmented, Progress, Note, Section, Masthead, AppHeader, StatusBar, HomeIndicator, PhoneFrame, StylistCard, PhotoTile, SummaryRow, DayCell, Eyebrow, Wordmark, Rule, IndexChip).

### What was tricky to build

- The existing codebase is large (33 pages, 30+ components) — mapping every new design screen to the right API endpoint required a systematic walkthrough.
- The new design system uses inline styles (JSX objects) rather than CSS classes. Porting to CSS custom properties requires a two-step: (1) create `tokens.css` as the base, (2) use inline style overrides for dynamic values.
- The `design-canvas.jsx` is a Figma-like pan/zoom viewer — useful for design iteration but not for production.
- The wireframe variants in `screens.jsx` are UX exploration artifacts (sketchy hand-drawn aesthetic, three variants per screen) — they provide interaction patterns but are not implementation targets.
- The existing `IntakeColorPage.tsx` and `IntakeExtPage.tsx` pages need to be replaced wholesale with the new Fringe intake flow.
- Had to create `web/src/fringe/` (page layer) separate from `web/src/fringe-ui/` (design system library) to keep the two concerns clean.

### What warrants a second pair of eyes

- The routing decision: the intake flow branches based on `service_type` (color vs extensions vs both) — need to confirm the step numbering in the progress bar matches the actual step count (not always 9 steps).
- Messaging/Inbox (`St_Inbox`, `St_Thread`) has no API endpoint. The UI is fully designed but unbacked. Need to decide whether to defer the whole inbox or stub out the endpoint shape.
- The dark variant (`St_Today_Bold` — ink bg + butter hero) is only designed as a single screen (Today) — the stylist dashboard dark mode needs confirmation if it's a global theme or per-screen.
- The `PortalAppointmentDto` type doesn't include `stylist_name` — the History page works around this by using the service_name prefix as a proxy.

---

## Step 2: Produce implementation guide + upload to reMarkable

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Write the detailed implementation guide and upload to reMarkable.

### What I did

- Wrote the comprehensive 39KB design/implementation guide: `design-doc/01-analysis-implementation-guide-fringe-design-system-restyle.md`
- The guide covers: 3 application surfaces, full FS token reference, all 20+ FS components, screen-by-screen analysis with API mapping, API surface reference (7 slices), new endpoints needed (messaging deferred), component architecture (fringe-ui package), CSS tokens, implementation plan (5 phases), 6 key design decisions, full file references.
- Also created: `analysis/01-screens-api-mapping-reference.md` and `analysis/02-fringe-ui-component-architecture.md` (empty stubs, to be filled)
- Updated the diary with full implementation notes
- Uploading the main guide to reMarkable

### What worked

- The design guide is extremely detailed and covers everything a new intern would need: prose paragraphs, bullet points, pseudocode, diagrams (ASCII), API references, file references, implementation plan.
- The phase-based implementation plan gives a clear order of operations.

### What didn't work

- `screens.jsx` wireframe variants (low-fi sketchy style) were initially tempting to implement — clarified they are UX exploration only, not implementation targets.
- Had to be explicit that the old component library is fully replaced, not migrated. The user said "start afresh" which gives license to delete.

### What was tricky

- The guide is 39KB — at this scale, some sections may need split into separate focused docs. The component architecture section is dense enough to warrant its own playbook.
- The `FS` object uses plain JavaScript objects (not TypeScript). The TypeScript token types need careful conversion to avoid runtime surprises.

---

*Diary continues as implementation progresses.*