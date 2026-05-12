---
Title: ""
Ticket: ""
Status: ""
Topics: []
DocType: ""
Intent: ""
Owners: []
RelatedFiles:
    - Path: web/package.json
      Note: Adds explicit dev:mock and dev:backend scripts for beta testing
    - Path: web/src/fringe/pages/client-booking/CareGuidePage.tsx
      Note: Fringe replacement for the old care-guide support page
    - Path: web/src/fringe/pages/shared/AuthGatePage.tsx
      Note: New Fringe-styled auth/sign-in gate used by booking
    - Path: web/src/main.tsx
      Note: |-
        Runtime app entry audit for booking
        MSW startup is now gated by VITE_ENABLE_MSW for Vite dev only
    - Path: web/src/mock/handlers.ts
      Note: MSW already provides upcoming and past appointments used by the new portal wiring
    - Path: web/src/stylist/ClientBookingApp.tsx
      Note: Booking runtime no longer imports legacy SignInPage
    - Path: web/src/stylist/ClientPortalApp.tsx
      Note: |-
        Portal runtime adapter already rendering Fringe pages
        Portal home/history now use portalApi appointment queries instead of hardcoded placeholders
        Portal runtime now uses the Fringe auth gate instead of the old sign-in page
    - Path: web/src/stylist/StylistApp.tsx
      Note: Legacy Toast component removed in favor of an inline Fringe-styled toast banner
    - Path: web/src/stylist/StylistRuntimeApp.tsx
      Note: |-
        Live stylist runtime still routes through StylistWorkspace instead of Fringe StylistApp
        Stylist runtime now uses the Fringe auth gate for unauthenticated state
    - Path: web/src/stylist/components
      Note: Legacy portal-specific components removed after zero-import verification
    - Path: web/src/stylist/index.ts
      Note: Barrel trimmed to runtime/domain exports after portal legacy cleanup
    - Path: web/src/stylist/pages
      Note: Legacy portal page stack removed after zero-import verification
    - Path: web/src/stylist/store/api/authApi.ts
      Note: Session bootstrap now tolerates both auth-session and domain /api/me payloads
    - Path: web/src/stylist/store/api/types.ts
      Note: Adds AuthSessionDto for the current backend /api/me contract
ExternalSources: []
Summary: ""
LastUpdated: 0001-01-01T00:00:00Z
WhatFor: ""
WhenToUse: ""
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
---

## Step 5: Wire app shells to Fringe pages (Phase 3)

**Commit (code):** `68af5ba` — "fringe: Phase 3 — wire app shells to Fringe pages, TypeScript clean"

### What I did

- **Created three FringeApp files** (later deleted — swapped app shells directly):
  - `FringeClientBookingApp.tsx`, `FringeStylistApp.tsx`, `FringeClientPortalApp.tsx`
  - Turned out the correct approach was to replace the existing app files directly, keeping same props interface
- **Replaced existing app shells** with Fringe-backed versions:
  - `ClientBookingApp.tsx` → imports from `../fringe/pages/client-booking/`
  - `StylistApp.tsx` → imports from `../fringe/pages/stylist/`
  - `ClientPortalApp.tsx` → imports from `../fringe/pages/client-portal/`
- **Wired import paths** to resolve correctly:
  - `fringe-ui/` components are at `web/src/fringe-ui/`
  - `fringe/` pages are at `web/src/fringe/`
  - App shells at `web/src/stylist/` need `../fringe/` relative paths
- **Created `src/tokens/index.ts`** as a re-export shim so `fringe-ui/` sub-packages (at depth 3) can import from `../../tokens` and resolve correctly

### TypeScript errors fixed (23 errors → 0)

1. **Module resolution (../../tokens not found)**: Created `src/tokens/index.ts` re-export shim. Alternative considered: creating a `fringe-ui` package in `node_modules` — too invasive.
2. **`../../fringe-ui/` paths in fringe/ pages**: Pages at `fringe/pages/client-booking/` need `../../../fringe-ui/` (4 levels up to src/). Fixed all 20 page files.
3. **`DayCell.day` type number→string**: TypeScript `moduleResolution: "bundler"` resolves all paths in TS's view differently. The `day` prop was typed as `number` in `DayCell.tsx` but the BookingPage used `string`. Changed `DayCellProps.day: number` → `day: string` and fixed all 7 story args.
4. **`YouPage.tsx` Item union type**: Union of 4 `NavItem` variants with optional `accent`/`danger` properties — TypeScript's strict union checking rejected direct property access. Solved by separating into a `NavRow` sub-component with `NavItem` interface (non-union).
5. **`ClientBookingApp.stories.tsx` circular Story type**: `type Story = StoryObj<typeof meta>` where `meta` has `satisfies Meta<ClientBookingApp>` caused circular reference. Fixed by: (a) explicitly typing `meta: Meta<typeof ClientBookingApp>`, (b) `type Story = StoryObj<typeof ClientBookingApp>`, (c) using `(Story as any)` in decorator functions.
6. **`PortalAppointmentDto` missing AppointmentDto fields**: `upcoming` mock data in `ClientPortalApp` was missing `client_id`, `service_id`, `duration_min_snapshot`, `status`, `created_at`, `updated_at`. Added all required fields.
7. **`Tab` type mismatch on `onTabChange`**: Fringe pages accept `(tab: string) => void` but `handleTabChange: (newTab: Tab) => void` with `Tab = "home"|"schedule"|"clients"|"loyalty"|"book"` caused TypeScript error. Fixed with `as (tab: string) => void` cast.
8. **Wrong API file for `createIntake`**: Originally imported from `servicesApi` — it's in `bookingApi`. Fixed in `ColorPage.tsx` and `ExtensionsPage.tsx`.
9. **`useGetAvailabilityQuery` wrong args**: Called with `string` ("2026-06-01") but needs `{ month: string; serviceId?: string }`. Fixed in `BookingPage.tsx` and `ClientBookingApp.tsx`.
10. **`ColorPage.tsx` missing Eyebrow import**: Originally had `import { Segmented }` from servicesApi, Eyebrow not imported. Rewrote the entire file cleanly.
11. **BudgetPage used as EstimatePage**: In `ClientBookingApp.tsx`, the `estimate` screen was routing to `<BudgetPage>` — BudgetPage is actually step 6 (budget). Corrected to show `<BudgetPage>` for `estimate` screen (the BudgetPage itself calls the estimate API internally).

### What worked

- Swapping app shells directly (replacing existing `ClientBookingApp.tsx`, `StylistApp.tsx`, `ClientPortalApp.tsx`) worked cleanly — same API surface, different page implementation.
- RTK Query hooks `useGetStylistDashboardQuery()`, `useGetStylistClientsQuery()`, `useGetStylistMeQuery()` wired correctly in StylistApp.
- `useGetAvailabilityQuery` with `{ skip: true }` to avoid unnecessary requests on non-calendar screens.
- `src/tokens/index.ts` re-export shim solved the module resolution issue without any package.json changes.

### What didn't work

- Tried creating shadow `Fringe*App` files instead of replacing existing apps — unnecessary duplication, deleted them.
- Tried using `pages/client-booking/index.ts` re-exports from `../fringe/pages/client-booking` — tsc couldn't find `../fringe/` relative to `pages/` subdirectory. Direct import in app shells works.

### What was tricky to build

- **`moduleResolution: "bundler"`** causes TypeScript to resolve all imports based on the tsconfig include paths, not file system layout. This is why the `../../tokens` path was failing — even though the file exists, tsc doesn't follow relative path traversal across the src/ root boundary when using bundler resolution. Solution: create a re-export at the level TypeScript can see.
- **TypeScript strict union types** don't allow accessing optional properties that exist on some union members but not others. The `it.accent` / `it.danger` error in YouPage required separating the union into a concrete `NavItem` type with all optional fields.
- **`StoryObj<typeof ClientBookingApp>` in Storybook decorators** requires `as any` cast to avoid Story type resolution issues.

### What warrants a second pair of eyes

- `fringe/pages/stylist/` uses "you" as a tab but `uiSlice.tab` only has `home|schedule|clients|loyalty|book`. The YouPage will never render from StylistApp until a "you" tab is added to the UI state.
- The `stylistApi.getStylistMe()` returns `StylistMeDto` which may have a `displayName` field — if not, `YouPage` shows "Nadia Rivera" as fallback.
- `ClientBookingApp.stories.tsx` uses `(Story as any)` in decorators — not ideal but necessary for Storybook 8 compatibility.

### What should be done in the future

- Phase 4: Delete old `web/src/stylist/pages/` files — first run `rg "from.*ConsultWelcomePage\|from.*IntakeColorPage\|from.*ConsultEstimatePage" web/src/` to find any remaining imports
- Add "you" tab to `uiSlice.tab` type so YouPage renders in StylistApp
- Verify Storybook runs with all new Fringe stories: `cd web && pnpm storybook`
- Add dark mode / butter-panel variant for TodayPage (St_Today_Bold design in stylist-pages.jsx)
- Stub messaging/inbox pages since no backend endpoint exists yet

## Step 6: Audit the Fringe-vs-stylist split and remove dead legacy portal UI

This step was a takeover-and-stabilization pass. I first mapped which parts of `web/src/stylist/` are still acting as runtime adapters and which parts have already been replaced by the new Fringe page layer. Once that split was clear, I removed the dead legacy client-portal page stack and narrowed the `stylist/` barrel so it no longer advertises old visual components as if they were still part of the active public surface.

The most important finding is that booking and portal already render Fringe pages through adapters that still live under `web/src/stylist/`, while the actual stylist runtime path still goes through `StylistRuntimeApp -> StylistWorkspace`. In other words: `stylist/` is now partly a runtime/domain layer and partly a legacy visual layer waiting to be cleaned up.

### Prompt Context

**User prompt (verbatim):** "ok, add detailed list of subtasks if needed. Then work on them"

**Assistant interpretation:** Add concrete subtasks to HAIR-016, then immediately execute the safest cleanup work that follows from the current migration state.

**Inferred user intent:** Turn the handoff analysis into actionable ticket work, reduce confusion around the stylist-vs-Fringe split, and start deleting obviously dead legacy UI without breaking the runtime.

### What I did
- Added follow-up subtasks 8–15 to the HAIR-016 task list with `docmgr task add`.
- Audited runtime ownership with `rg`:
  - `main.tsx` renders `ClientBookingApp` and `ClientPortalApp` directly, both of which already import Fringe pages.
  - `main.tsx` renders `StylistRuntimeApp` for `/stylist`, and that still renders `StylistWorkspace`, not `StylistApp`.
  - `StylistApp.tsx` is currently a Fringe-backed adapter, but not the live stylist runtime entry.
- Verified there are no remaining `Fringe*App.tsx` transitional wrapper files under `web/src/stylist/`.
- Deleted the dead legacy client-portal page stack:
  - `PortalHomePage*`
  - `PortalAppointmentsPage*`
  - `PortalPhotosPage*`
  - `PortalRewardsPage*`
  - `PortalProfilePage*`
- Deleted dead legacy portal-specific components and their stories:
  - `PortalTopBar*`, `PortalTabBar*`
  - `PortalAppointmentCard*`, `PortalAppointmentPhotoSection.tsx`
  - `AppointmentReschedulePanel.tsx`
  - `NextAppointmentCard*`, `LoyaltyBadgeCompact*`, `MaintenancePlanCard*`
  - `NotificationPrefs*`, `PhotoTimelineEntry*`, `PointsHistoryList*`
  - `RedeemList*`, `ReferralCard*`, `SegmentToggle*`, `TierCard*`
- Rewrote `web/src/stylist/index.ts` so it exports only the runtime/domain public surface (app adapters, store/api, types, utils, data, parts) instead of re-exporting large legacy page/component surfaces.
- Re-ran `pnpm typecheck` in `web/` and confirmed it still passes.

### Why
- The user explicitly asked what the split is between `stylist/` and `fringe/`, and what can be deleted. That required first answering the architecture question, then making that separation real in the codebase.
- Keeping dead portal pages/components around makes the migration look less complete than it is, and the huge `stylist/index.ts` barrel was reinforcing the wrong mental model by continuing to export legacy visual components that are no longer part of the intended active surface.

### What worked
- `rg` import audits were enough to prove the legacy portal pages/components were no longer used by active runtime code.
- The portal cleanup was safe because the live portal path already goes through `ClientPortalApp.tsx` and `fringe/pages/client-portal/*`.
- Slimming the `stylist/index.ts` barrel did not break TypeScript; `pnpm typecheck` still exits successfully.

### What didn't work
- The earlier plan assumed there were still transitional `FringeClientBookingApp.tsx` / `FringeClientPortalApp.tsx` / `FringeStylistApp.tsx` wrappers to delete. By the time of this pass, they were already gone, so cleanup task 9 became a verification task rather than a file deletion task.

### What I learned
- The split is now:
  - `web/src/stylist/` = runtime adapters, store, RTK Query, auth/session, and some remaining legacy UI
  - `web/src/fringe-ui/` = design system and shared presentation primitives
  - `web/src/fringe/` = new page layer that consumes `fringe-ui` and the stylist RTK/domain layer
- Booking and portal already follow this model in runtime.
- Stylist does not yet: the live `/stylist` entry still uses `StylistRuntimeApp -> StylistWorkspace`, so `StylistApp.tsx` should be treated as an in-progress migration target rather than the actual runtime.

### What was tricky to build
- The biggest trap was distinguishing “dead in runtime” from “still present in stories / barrels / old demo paths.” A lot of the legacy portal surface looked alive only because Storybook stories and old exports were still present.
- `web/src/stylist/index.ts` had become a historical dumping ground. Cleaning it up required deciding what `stylist/` means now: not a visual component library, but the runtime/domain layer that Fringe consumes.

### What warrants a second pair of eyes
- `StylistRuntimeApp.tsx` vs `StylistApp.tsx`: this is now the main architecture fork that still needs an explicit decision.
- The live stylist navigation model is still inconsistent with the Fringe stylist tab model, so the stylist migration is not yet in the same “safe to delete old UI” state as portal.
- `web/public/mockServiceWorker.js` is still untracked and `web/pnpm-lock.yaml` is still dirty; those leftovers should be reviewed in the next pass rather than silently swept into this cleanup.

### What should be done in the future
- Decide whether `/stylist` should move onto the Fringe-backed `StylistApp.tsx` or remain a separate workspace flow.
- Finish replacing hardcoded placeholders in `ClientPortalApp.tsx` with portal data or deliberate mocks.
- Normalize the stylist tab/state model before deleting old stylist dashboard pages/components.
- Do a separate cleanup pass for old stylist dashboard pages only after that runtime decision is made.

### Code review instructions
- Start with `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/main.tsx` to confirm which runtime entry points are live.
- Then inspect `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientBookingApp.tsx`, `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx`, and `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistRuntimeApp.tsx`.
- Review `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/index.ts` to verify the barrel now matches that architecture.
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm typecheck`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking && rg -n "Portal(Home|Appointments|Photos|Rewards|Profile)Page|PortalTopBar|PortalTabBar" web/src -g '!**/*.stories.tsx'`

### Technical details
- Key deleted files were under:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/pages/`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/components/`
- The runtime split was verified from:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/main.tsx`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistRuntimeApp.tsx`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistApp.tsx`

## Step 7: Replace client-portal placeholder data with portalApi queries

After the cleanup pass, the next safest improvement was to make the live client portal use its existing RTK Query data instead of hardcoded placeholder appointments. The goal here was not to finish the entire portal, but to remove the most misleading temporary state: a fake hardcoded upcoming appointment on the home screen and an always-empty history screen.

This keeps the portal cutover honest. `ClientPortalApp.tsx` still lives under `stylist/` as a runtime adapter, but it now pulls real appointment data from the same `portalApi` surface that the rest of the app already uses and that MSW already mocks in development.

### Prompt Context

**User prompt (verbatim):** (same as Step 6)

**Assistant interpretation:** Keep executing the newly added ticket subtasks by replacing temporary portal placeholders with API-backed data where the migration is already safe.

**Inferred user intent:** Make the migrated portal feel genuinely wired, not just visually restyled.

### What I did
- Updated `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx` to import `useGetMyAppointmentsQuery` from the existing portal API layer.
- Added one query for upcoming appointments (`status: "upcoming", limit: 1`) and one for past appointments (`status: "past", limit: 20`), both skipped until authentication is established.
- Replaced the hardcoded `upcoming` object with `upcomingData?.appointments[0] ?? null`.
- Replaced `appointments={[]}` on the history screen with the real `historyData?.appointments ?? []` array.
- Derived the `lastService` summary on the landing page from the first past appointment instead of a fixed demo object.
- Re-ran `pnpm typecheck` to confirm the portal adapter still compiles cleanly.

### Why
- The ticket explicitly calls out portal completion as unfinished, and the most obvious gap was that the migrated portal still displayed placeholder data even though the API hooks and MSW mocks already existed.
- This is a low-risk improvement because it touches only the adapter layer; the Fringe pages themselves remain props-driven and reusable.

### What worked
- The existing `portalApi.getMyAppointments` endpoint shape already matched what `LandingPage` and `HistoryPage` needed.
- MSW already had mocked `/api/me/appointments` data for both upcoming and past appointments, so no mock changes were required.
- TypeScript stayed clean after the switch.

### What didn't work
- `PortalAppointmentDto` still does not expose a stylist name, so the landing-page “last service” summary currently uses a neutral `"Fringe team"` fallback instead of a real stylist-specific label.

### What I learned
- The live portal path is farther along than it looked; most of the incompleteness was adapter-level placeholder data, not missing page components.
- The remaining portal gaps are now more clearly about missing screens (`photos`, `rewards`, `profile`) and richer data presentation, not the basic upcoming/history flow.

### What was tricky to build
- The main subtlety was hook ordering with auth bootstrap. The appointment queries had to be declared unconditionally at the top of the component and gated with `skip: !session.isAuthenticated` rather than being called only after the auth guard returns.

### What warrants a second pair of eyes
- Whether `lastService.stylist` should remain a neutral fallback or whether the portal DTO should be extended to carry a stylist display name.
- Whether the portal should show its own loading skeletons for appointment sections while the session is authenticated but the appointment queries are still resolving.

### What should be done in the future
- Implement or explicitly defer the remaining `photos`, `rewards`, and `profile` screens in the Fringe portal path.
- Consider adding empty-state treatment for `HistoryPage` when there are zero past appointments.

### Code review instructions
- Review `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx`.
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm typecheck`
  - Run the portal path in dev/Storybook and confirm the landing page uses the upcoming mock appointment and the history page shows past mocked appointments.

### Technical details
- Queries added:
  - `useGetMyAppointmentsQuery({ status: "upcoming", limit: 1 })`
  - `useGetMyAppointmentsQuery({ status: "past", limit: 20 })`
- Data source for dev verification remains `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/mock/handlers.ts`.

## Step 8: Make Vite MSW toggleable while keeping Storybook always mocked

The next ergonomics change was to stop forcing MSW on in the Vite dev app. The user wants the new Fringe UI to be able to run against the real backend, but still wants Storybook to stay fully mocked. That means the app entry should obey a Vite env flag, while Storybook should continue to start MSW unconditionally.

This keeps both workflows available: isolated frontend iteration with mocks and real integration testing against the backend. It also makes beta testing easier because the tester can deliberately choose whether they are validating visual/flow behavior with fixtures or backend compatibility.

### Prompt Context

**User prompt (verbatim):** "make VITE togglable, storybook always MSW. 

what can I do to beta test things as they are?"

**Assistant interpretation:** Add a Vite env switch for MSW in the dev app, leave Storybook permanently mocked, and explain how to test the current migration state.

**Inferred user intent:** Use the real backend for integration work without losing the existing mocked frontend workflow.

### What I did
- Updated `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/main.tsx` so MSW only starts when `import.meta.env.VITE_ENABLE_MSW === "true"`.
- Left Storybook unchanged so `.storybook/preview.ts` still starts MSW for every story session.
- Added explicit npm scripts in `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/package.json`:
  - `pnpm dev:mock`
  - `pnpm dev:backend`
- Re-ran `pnpm typecheck` to confirm the toggle does not break the frontend build.

### Why
- The old unconditional worker startup was great for frontend-only work, but it blocked real backend integration because the app would silently intercept requests in dev.
- Storybook is a component/demo environment, so always-on MSW remains the right default there.

### What worked
- A single Vite env gate in `main.tsx` was enough; no other code needed to change.
- TypeScript remained clean after switching to `import.meta.env.VITE_ENABLE_MSW`.

### What didn't work
- N/A

### What I learned
- The current app can now support two clean dev modes without changing source files: mocked Vite and backend Vite.

### What was tricky to build
- The main subtlety was preserving Storybook behavior while changing Vite behavior. Since Storybook has its own startup path, the cleanest solution was to leave `.storybook/preview.ts` alone and only gate `src/main.tsx`.

### What warrants a second pair of eyes
- Whether `pnpm dev` should eventually default to mocked mode or backend mode. Right now the explicit scripts are the safest path for clarity.

### What should be done in the future
- If backend integration becomes the dominant workflow, consider documenting the preferred mode in a short frontend README.

### Code review instructions
- Review `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/main.tsx` and `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/package.json`.
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm dev:mock`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm dev:backend`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm storybook`

### Technical details
- App mode env flag: `VITE_ENABLE_MSW`
- Storybook remains always mocked via `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/.storybook/preview.ts`.

## Step 9: Make session bootstrap accept both auth-session and domain `/api/me` shapes

The portal sign-in issue turned out not to be a styling bug first. It was a contract mismatch. The live backend returned an authenticated session payload from `/api/me` (`authenticated`, `authMode`, `subject`, `displayName`, etc.), while the current portal shell was treating `/api/me` as a domain profile payload (`client`, `notification_prefs`). That made the app think the user was unauthenticated and fall back to the old sign-in gate even though the backend said the browser session was valid.

I fixed that mismatch in the frontend session bootstrap instead of forcing an immediate backend rewrite. The bootstrap now accepts either payload shape and synthesizes a minimal client record from the auth-session response when needed. That gets the portal out of the legacy sign-in gate and lets us keep moving on the UI cleanup without blocking on backend contract cleanup.

### Prompt Context

**User prompt (verbatim):** "/api/me return {\"authenticated\":true, \"authMode\":\"dev\", \"subject\":\"dev-user\", \"email\":\"dev@example.com\", \"displayName\":\"Dev User\", \"scopes\":[\"openid\", \"profile\", \"email\"]}\n\nBut the portal page \n\na) uses the old widgets\nb) still shows \"continue to sign in\"\n\n---\n\nAnyway, I think we should get rid of the legacy pages and widgets ?"

**Assistant interpretation:** Diagnose why the portal still falls into the old sign-in UI despite an authenticated backend session, and decide how aggressively to remove the remaining legacy UI.

**Inferred user intent:** Stop regressing into old auth widgets and continue driving the codebase toward a full Fringe-based UI.

### What I did
- Added `AuthSessionDto` to `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/store/api/types.ts` to represent the raw authenticated `/api/me` payload coming from the current backend.
- Updated `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/store/api/authApi.ts` so `useSessionBootstrap()` now accepts either:
  - domain portal shape: `{ client, notification_prefs }`
  - auth-session shape: `{ authenticated, authMode, subject, displayName, ... }`
- Added a small normalizer that synthesizes a minimal `ClientDto` from the auth-session payload when only auth identity is available.
- Re-ran `pnpm typecheck` to verify the compatibility fix stays type-safe.
- Added a new ticket task to replace the remaining active legacy support UI (`SignInPage`, `VerifyCodePage`, `CareGuidePage`, `ConsultNavBar`, `Toast`, etc.) with Fringe equivalents.

### Why
- The portal should not show the old sign-in gate when the backend has already proven the browser session is authenticated.
- The remaining legacy pages/widgets should indeed be removed, but the correct order is: first stop false unauthenticated fallbacks, then replace the genuinely still-active legacy support surfaces.

### What worked
- The compatibility fix was isolated to the session bootstrap layer; no wider UI rewrites were needed for the immediate problem.
- TypeScript remained clean after adding the dual-shape handling.

### What didn't work
- The original assumption that `/api/me` would always be the newer domain-profile payload was too optimistic for the current backend environment.

### What I learned
- There are still two `/api/me` contracts in play across the project history: auth bootstrap identity and portal domain profile. The frontend needs to survive both until the backend contract is finalized.

### What was tricky to build
- The fix needed to preserve the existing `ClientPortalApp` expectations without spreading auth-shape conditionals throughout the page layer. Keeping the compatibility shim inside `useSessionBootstrap()` was the least invasive place to absorb the mismatch.

### What warrants a second pair of eyes
- Whether the backend should now standardize `/api/me` on one final shape and move the other concern to a different endpoint.
- Whether the remaining active legacy auth/support UI should be replaced in one cleanup slice or in two smaller slices (booking support vs runtime support).

### What should be done in the future
- Replace the remaining legacy support screens/widgets with Fringe equivalents.
- Decide the long-term backend contract for session bootstrap vs client profile data.

### Code review instructions
- Review `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/store/api/authApi.ts` and `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/store/api/types.ts`.
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm typecheck`
  - In backend mode, load `/portal` and confirm an authenticated `/api/me` auth payload no longer drops into the old sign-in screen.

### Technical details
- Compatibility now supports these runtime shapes from `/api/me`:
  - domain: `{ client, notification_prefs }`
  - auth bootstrap: `{ authenticated, authMode, subject, displayName, email, ... }`

## Step 10: Replace the remaining active legacy support UI with Fringe surfaces

After fixing the `/api/me` contract mismatch, the next priority was to stop routing users through old support screens and widgets entirely. The live runtime still had a small but important set of legacy dependencies hanging around: the sign-in gate, verify-code screen, care guide page, booking nav bar, and toast widget. These were not part of the intended long-term architecture anymore, but they were still imported by the active runtime adapters.

I replaced those live support surfaces with Fringe-styled pages/components and then deleted the old files. At this point, the only active runtime import still coming from `web/src/stylist/components` is `PhotoBox`, and that is used only inside the still-legacy `StylistWorkspace` path.

### Prompt Context

**User prompt (verbatim):** "continue."

**Assistant interpretation:** Keep going with the legacy-support-UI cleanup now that the auth fallback issue is understood.

**Inferred user intent:** Finish the current cleanup slice instead of stopping at diagnosis.

### What I did
- Added `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe/pages/shared/AuthGatePage.tsx` as the new Fringe-styled sign-in/auth gate surface.
- Added `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe/pages/client-booking/CareGuidePage.tsx` as a Fringe replacement for the old care guide page.
- Updated `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientBookingApp.tsx` to:
  - use `AuthGatePage` for `sign-in` and `verify-code`
  - use the new Fringe `CareGuidePage`
  - replace `ConsultNavBar` with `AppHeader` + `Eyebrow`
- Updated `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx` to use `AuthGatePage` instead of the old `SignInPage`.
- Updated `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistRuntimeApp.tsx` to use `AuthGatePage` instead of the old `SignInPage`.
- Replaced the old `Toast` widget in `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistApp.tsx` with an inline Fringe-styled toast banner.
- Deleted the no-longer-used legacy files and their stories:
  - `web/src/stylist/pages/SignInPage*`
  - `web/src/stylist/pages/VerifyCodePage*`
  - `web/src/stylist/pages/CareGuidePage*`
  - `web/src/stylist/components/ConsultNavBar*`
  - `web/src/stylist/components/CareGuideContent*`
  - `web/src/stylist/components/Toast*`
- Cleaned `StylistRuntimeApp.test.tsx` to remove the stale `SignInPage` mock.
- Re-ran `pnpm typecheck` and `pnpm vitest run src/stylist/StylistRuntimeApp.test.tsx`.
- Re-ran import audits to verify that no active non-`StylistWorkspace` runtime code still imports from `web/src/stylist/pages` or legacy support widgets.

### Why
- The user explicitly wants the old widgets gone, and the portal falling back to the old sign-in page made the migration look less complete than it is.
- Once the runtime adapters had Fringe-compatible replacements, there was no reason to keep the legacy support files alive.

### What worked
- `AuthGatePage` was flexible enough to serve booking, portal, and stylist runtime contexts.
- Replacing `ConsultNavBar` with `AppHeader` + `Eyebrow` was enough to remove that legacy dependency from the booking flow.
- After the cleanup, the runtime import audit now shows only one remaining direct `stylist/components` runtime import: `PhotoBox` inside `StylistWorkspace`.
- TypeScript and the focused stylist runtime test both still pass.

### What didn't work
- N/A

### What I learned
- The remaining legacy footprint is now much smaller and easier to reason about: it is concentrated in the still-live `StylistWorkspace` path and some non-runtime old page files that have not been deleted yet.

### What was tricky to build
- The important distinction was not “legacy file exists” but “legacy file is still on an active runtime path.” Deleting old support files safely required first replacing their live imports in the runtime adapters.
- `verify-code` no longer has an independent product meaning, so the cleanest replacement was to route it through the new auth gate rather than inventing a new Fringe code-entry screen for a flow the MVP no longer supports.

### What warrants a second pair of eyes
- The booking-flow top chrome changed from the old `ConsultNavBar` to `AppHeader` + `Eyebrow`; that should get a quick visual QA pass.
- `StylistApp.tsx` is cleaner now, but the broader question of whether it should become the real `/stylist` runtime is still open.

### What should be done in the future
- Re-test `/portal` and `/booking` manually after this cleanup to confirm the old auth/support surfaces no longer appear.
- Continue with the stylist-runtime architecture decision and tab-model normalization.

### Code review instructions
- Start with:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe/pages/shared/AuthGatePage.tsx`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientBookingApp.tsx`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistRuntimeApp.tsx`
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm typecheck`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web && pnpm vitest run src/stylist/StylistRuntimeApp.test.tsx`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking && rg -n "from ['\"]\./pages/|from ['\"]\.\./pages/|from ['\"]\./components/|from ['\"]\.\./components/" web/src/stylist -g '!web/src/stylist/pages/**' -g '!web/src/stylist/components/**' -g '!**/*.stories.tsx'`

### Technical details
- New shared auth gate: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe/pages/shared/AuthGatePage.tsx`
- New care guide page: `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe/pages/client-booking/CareGuidePage.tsx`
