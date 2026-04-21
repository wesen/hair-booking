# Diary — HAIR-016: Hair Booking Frontend Restyle

## Goal

Restyle the entire hair-booking frontend using the new Fringe design system (plum + peach brand core, editorial-zine aesthetic) sourced from ~/Downloads/hair-booking.zip. The backend RTK Query APIs remain unchanged; only the visual layer and component library are replaced from scratch.

---

## Step 1: Import sources + initial survey

**User prompt (verbatim):** "Create a new docmgr to restyle / redo the hair-booking application frontend. Import the zip file ~/Downloads/hair-booking.zip in the sources/ folder of the ticket. Keep a diary. Analyze the file, it's a new design system and a set of new screens (Hair Intake.html, Stylist Dashboard.html, Client Pages.html). We are going to replace the current system (the visual side of it, and keep the backend the same/slightly modify it only) in its entirety with the new screens."

**Assistant interpretation:** Import and analyze a new Fringe-branded design system (HTML + JSX) that covers three distinct application surfaces — client-facing intake/booking, stylist-side dashboard, and client portal pages — then produce a detailed design/implementation guide mapping these new screens to the existing RTK Query API layer.

**Inferred user intent:** Full visual system replacement. No backward compatibility needed. Start fresh on the frontend component layer. Keep the backend unchanged.

### What I did

- Created ticket `HAIR-016` under `ttmp/2026/04/21/HAIR-016--hair-booking-frontend-restyle/`
- Extracted the zip to `sources/`
- Read every HTML and JSX file in the zip:
  - `Design System.html` + `design-system.jsx` — the token/component library
  - `Hair Intake.html` + `intake-fs.jsx` + `intake-desktop.jsx` — 9-step intake flow (mobile + desktop)
  - `Stylist Dashboard.html` + `stylist-dashboard.jsx` + `stylist-pages.jsx` — stylist Today/Clients/Inbox/You
  - `Client Pages.html` + `client-pages.jsx` + `client-edit.jsx` — client-side home/upcoming/history/account
  - `screens.jsx` — wireframe variants (not needed for implementation, reference only)
  - `Hair History Hi-Fi.html` + `history-hifi.jsx` (reference variant)
  - `Hair History - Modern Zine Responsive.html` + `history-responsive.jsx` (reference variant)
- Audited the existing codebase:
  - `web/src/stylist/store/api/` — 7 API slices (auth, booking, portal, services, stylist, stylistView, portalView)
  - `web/src/stylist/pages/` — 33 page components
  - `web/src/stylist/components/` — 30+ UI components
  - `web/src/stylist/StylistApp.tsx`, `ClientBookingApp.tsx`, `ClientPortalApp.tsx`

### What I learned

- The existing codebase uses a **custom color system** (CSS variables) with a completely different palette (coral/teal/mint/lavender) — no token compatibility, which simplifies the cutover: just replace entirely.
- The RTK Query API surface is **surprisingly clean and well-structured** with typed DTOs for every operation.
- The design system is called "**Fringe**" by the new designs — a plum (#6b3a4a) + peach (#f2b89a) brand with Instrument Serif for editorial, Anton for display, Inter for body, JetBrains Mono for eyebrows.
- The new designs cover **3 distinct apps in one codebase**: client booking flow (intake → estimate → booking → confirm), stylist dashboard (today/clients/inbox/you), client portal (home/upcoming/history/account + edit screens).
- The design system exports a `FS` object with: `color`, `font`, `type`, `space`, `radius`, `shadow` tokens + primitives: `Button`, `Chip`, `TextField`, `Card`, `RatingBar`, `Segmented`, `Progress`, `Note`, `Section`, `Masthead`, `AppHeader`, `StatusBar`, `HomeIndicator`, `PhoneFrame`, `StylistCard`, `PhotoTile`, `SummaryRow`, `DayCell`, `Eyebrow`, `Wordmark`, `Rule`, `IndexChip`.

### What was tricky to build

- The existing codebase is large (33 pages, 30+ components) — mapping every new design screen to the right API endpoint requires a systematic walkthrough.
- The new design system uses an inline style approach (JSX objects) rather than CSS classes. The component library needs to be ported to proper CSS modules or Tailwind/CSS variables for maintainability.
- The `design-canvas.jsx` is a Figma-like pan/zoom viewer for design iteration — not relevant to production but useful context.
- The wireframe variants in `screens.jsx` are low-fi sketches — they provide UX patterns (different input modes for the same question) but should not be implemented verbatim.

### What should be done in the future

- Produce the comprehensive analysis/implementation guide (this is the primary output — in progress)
- Create the `fringe-ui` package with tokens as CSS custom properties
- Map every new screen to its RTK Query endpoint(s)
- Create Storybook stories for all new Fringe components
- Plan the cutover strategy (which screens to implement first, dependency order)
- Update or replace the `web/src/stylist/styles/` directory with Fringe tokens

### Technical details

**Design system tokens (`FS` object):**

```javascript
FS.color = {
  ink: '#111111', paper: '#ffffff', cream: '#f6efe4', creamDeep: '#efe6d4',
  rule: '#ebe7df', soft: '#9a958e', softInk: '#5b5852',
  plum: '#6b3a4a', plumDeep: '#4a2431', peach: '#f2b89a', peachSoft: '#faddc9',
  coral: '#e8573c', butter: '#f4c752', ochre: '#c48a34', sage: '#7a8f6b', blush: '#e6b8a8',
  success: '#7a8f6b', warn: '#c48a34', danger: '#e8573c'
};
FS.font = {
  block: '"Anton", Impact, sans-serif',    // Display
  serif: '"Instrument Serif", Georgia',     // Editorial
  sans: '"Inter", system-ui, sans-serif',  // Body
  mono: '"JetBrains Mono", monospace'       // Eyebrows
};
FS.type = { display1, display2, display3, h1, h2, h3, editorial, editorialLg, body, bodyLg, bodySm, eyebrow, meta }
FS.space = { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 7:32, 8:40, 9:56, 10:72 }
FS.radius = { none:0, sm:2, md:6, lg:12, pill:999 }
FS.shadow = { sm, md, lg }
```

**API surface (7 slices):** authApi, bookingApi, portalApi, servicesApi, stylistApi, stylistView, portalView

**Existing component count:** 33 pages + 30+ components in `web/src/stylist/`
