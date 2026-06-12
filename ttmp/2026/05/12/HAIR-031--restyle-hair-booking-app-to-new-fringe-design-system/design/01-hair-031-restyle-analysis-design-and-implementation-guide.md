---
Title: "HAIR-031: Fringe Design System Restyle — Analysis, Design, and Implementation Guide"
Ticket: HAIR-031
Status: active
Topics:
  - hair-booking
  - design-system
  - css-visual-diff
  - fringe
  - restyle
  - intake
DocType: design-doc
Intent: implementation-guide
Owners: []
RelatedFiles:
  - Path: ../../../design-galley/standalone
    Note: Standalone HTML pages for each intake screen, used as visual baselines
  - Path: ../../../design-galley/visual-diff/userland/verbs/fringe-pages.js
    Note: css-visual-diff verbs for Fringe intake screens
  - Path: ../../../design-galley/visual-diff/userland/specs/intake-mobile.visual.yml
    Note: Visual suite spec for mobile intake screens
  - Path: ../../../web.deprecated/src/fringe-ui
    Note: Existing React component library (salvageable: primitives, chrome, layout, salon-widgets, tokens)
  - Path: ../../../web.deprecated/src/fringe/pages/client-booking
    Note: Existing 9-step client booking pages (old design, needs restyle)
  - Path: ../../../web.deprecated/src/stylist/store
    Note: RTK Query store, API slices, mappers, types (salvageable as-is)
ExternalSources:
  - Path: /home/manuel/code/wesen/2026-04-23--pyxis/ttmp/2026/05/01/HTML-DESIGN-TO-REACT-PLAYBOOK--convert-html-designs-into-production-react-sites/design-doc/01-html-design-to-react-implementation-workflow-guide.md
    Note: Master playbook for HTML-to-React conversion, reused here
  - Path: /home/manuel/code/wesen/2026-04-23--pyxis/prototype-design/visual-diff/userland/README.md
    Note: Pyxis css-visual-diff userland architecture reference
---

# HAIR-031: Fringe Design System Restyle

## Analysis, Design, and Implementation Guide

This document is a complete intern-facing guide to restyling the Fringe hair booking application. It covers the full system: what the project is, what the new design looks like, what code already exists, what to salvage, what to rebuild, and the step-by-step workflow to get from prototype screenshots to a pixel-accurate React app using css-visual-diff.

---

# Part I: What is the Fringe Hair Booking App?

## 1.1 The product

Fringe is a hair salon booking platform with two primary user roles:

- **Clients** book appointments through a 9-step intake flow (mobile-first, with desktop variants for later steps). The flow collects service type, color level, hair length, reference photos, hair history, budget range, shows an estimate, picks a stylist + calendar slot, and confirms the booking.
- **Stylists** manage their schedule, view client intake data, and run their day from a dashboard.

The app has a Go backend (`cmd/hair-booking`, `pkg/...`) that serves a React SPA embedded via `go:embed`. The frontend lives in `web.deprecated/` (old design) and will be rebuilt into a new `web/` directory.

## 1.2 The old design (web.deprecated/)

The existing frontend was built with a first-generation design system. It works, but the visual design is being replaced with a new "Fringe" design language. Key salvageable pieces:

```
web.deprecated/
├── package.json              # Vite + React 19 + RTK Query + Storybook 8 + MSW + Vitest
├── vite.config.ts            # Vite config with Go embed output
├── tsconfig.json
├── src/
│   ├── main.tsx              # App entry point
│   ├── fringe/               # Page-level routing and app shells
│   │   └── pages/
│   │       ├── client-booking/   # 9-step intake pages (old design)
│   │       ├── client-portal/    # Client history portal
│   │       └── stylist/          # Stylist dashboard pages
│   ├── fringe-ui/           # Design system components (SALVAGEABLE)
│   │   ├── tokens/          # TS + CSS token definitions
│   │   ├── primitives/      # Button, Card, Chip, Eyebrow, Note, Progress,
│   │   │                    # RatingBar, Rule, Segmented, TextField, Wordmark
│   │   ├── chrome/          # AppHeader, HomeIndicator, StatusBar, TabBar
│   │   ├── layout/          # ClientShell, IntakeShell, StepRail, StylistShell
│   │   └── salon-widgets/   # DayCell, Masthead, PhotoTile, Section,
│   │                        # StylistCard, SummaryRow
│   ├── stylist/             # Stylist-facing app (larger, separate shell)
│   │   ├── components/      # ~30 domain widgets (ServiceCard, CalendarGrid,
│   │   │                    # TimeSlot, BookingDot, etc.)
│   │   ├── store/           # RTK Query API slices + Redux state
│   │   │   ├── api/         # authApi, bookingApi, portalApi, servicesApi,
│   │   │   │                # stylistApi, base query, mappers, types
│   │   │   ├── appointmentsSlice.ts
│   │   │   ├── authSlice.ts
│   │   │   ├── bookingSlice.ts
│   │   │   ├── clientsSlice.ts
│   │   │   ├── consultationSlice.ts
│   │   │   └── portalSlice.ts
│   │   └── pages/           # ~15 stylist page stories
│   └── mock/                # MSW handlers for dev without backend
```

### What to salvage

| Component | Salvage? | Notes |
|---|---|---|
| `package.json` (deps/scripts) | **Yes** | Copy into new `web/`. Same Vite + React 19 + RTK Query + Storybook stack |
| `vite.config.ts` | **Yes** | Copy and adjust for new `web/` layout |
| `src/stylist/store/` (entire dir) | **Yes** | RTK Query API slices, types, mappers, Redux slices — all backend-agnostic |
| `src/mock/` (MSW handlers) | **Yes** | API mocking layer |
| `src/fringe-ui/tokens/` | **Partial** | Token *names* stay, *values* update to new FS palette |
| `src/fringe-ui/primitives/` | **Partial** | Components stay, styles update to new design |
| `src/fringe-ui/chrome/` | **Partial** | AppHeader, StatusBar need new-design restyle |
| `src/fringe-ui/layout/` | **Partial** | IntakeShell needs new-design restyle |
| `src/fringe-ui/salon-widgets/` | **Partial** | DayCell, Masthead, StylistCard, SummaryRow update |
| `src/fringe/pages/client-booking/` | **Rewrite** | Visual restyle using new IntakeShell + primitives |
| `src/stylist/` | **Later** | Stylist app restyle is out of scope for this ticket |

## 1.3 The new design

The new design comes from a Claude-generated HTML/JSX prototype exported as `~/Downloads/hair-booking.zip`. The archive contains:

- **7 HTML files**: Design System, Hair Intake, Hair Intake Wireframes, Client Pages, Hair History Hi-Fi, Hair History Modern Zine, Stylist Dashboard
- **10 JSX source files**: `design-system.jsx`, `intake-fs.jsx`, `intake-desktop.jsx`, `screens.jsx`, `design-canvas.jsx`, plus per-page JSX
- **Assets**: `assets/fringe-logo.png`, 5 uploaded reference images

The prototype uses React 18 CDN + Babel standalone for in-browser rendering. It is NOT a Vite/TypeScript project — it's a design artifact.

### The Fringe Design System (FS)

The design language is defined in `design-system.jsx` and exposes a global `FS` object with tokens and components. Here is the complete token inventory:

**Color palette:**

```
FS.color = {
  // Neutrals
  ink: '#111111',       paper: '#ffffff',
  cream: '#f6efe4',     creamDeep: '#efe6d4',
  rule: '#ebe7df',      soft: '#9a958e',
  softInk: '#5b5852',

  // Brand (plum + peach core)
  plum: '#6b3a4a',      plumDeep: '#4a2431',
  peach: '#f2b89a',     peachSoft: '#faddc9',

  // Expanded accents
  coral: '#e8573c',     butter: '#f4c752',
  ochre: '#c48a34',     sage: '#7a8f6b',
  blush: '#e6b8a8',

  // Semantic
  success: '#7a8f6b',   warn: '#c48a34',
  danger: '#e8573c',
}
```

**Typography scale:**

```
FS.type = {
  display1:    Anton 120px,  uppercase, -2 tracking
  display2:    Anton 72px,   uppercase, -1 tracking
  display3:    Anton 54px,   uppercase, -0.5 tracking
  h1:          Anton 36px,   uppercase, 0.3 tracking
  h2:          Anton 26px,   uppercase, 0.3 tracking
  h3:          Anton 20px,   uppercase, 0.5 tracking
  editorial:   Instrument Serif 19px, italic, 1.45 line-height
  editorialLg: Instrument Serif 28px, italic, 1.1 line-height
  body:        Inter 14px,   1.5 line-height
  bodyLg:      Inter 16px,   1.5 line-height
  bodySm:      Inter 12px,   1.4 line-height
  eyebrow:     JetBrains Mono 10px, 1.8 tracking, uppercase, 600 weight
  meta:        JetBrains Mono 11px, 1.5 tracking, tabular-nums
}
```

**Font families:**

```
FS.font = {
  block: 'Anton, Oswald, Impact, sans-serif'
  serif: 'Instrument Serif, Georgia, serif'
  sans:  'Inter, system-ui, sans-serif'
  mono:  'JetBrains Mono, ui-monospace, monospace'
}
```

**Spacing scale:**

```
FS.space = { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 7:32, 8:40, 9:56, 10:72 }
```

**Border radii:**

```
FS.radius = { none:0, sm:2, md:6, lg:12, pill:999 }
```

**Shadows:**

```
FS.shadow = {
  sm: '0 2px 6px rgba(17,17,17,0.06)',
  md: '0 8px 24px rgba(17,17,17,0.08)',
  lg: '0 24px 60px rgba(17,17,17,0.14)',
}
```

**FS components defined in design-system.jsx:**

| Component | Purpose | Key Props |
|---|---|---|
| `FS.Eyebrow` | Mono eyebrow label | `color`, `style` |
| `FS.Button` | Primary/secondary/ghost/danger button | `variant`, `size`, `style` |
| `FS.Chip` | Selectable pill chip | `selected`, `style` |
| `FS.Segmented` | Segmented control | `value`, `options` |
| `FS.Card` | Content card with accent | `accent`, `style` |
| `FS.Note` | Info/warn/success note callout | `tone` (`info`/`warn`/`success`) |
| `FS.Progress` | Step progress bar | `value` (0–100) |
| `FS.RatingBar` | 1–5 rating bar with label | `label`, `value` |
| `FS.PhotoTile` | Photo upload tile | `label`, `filled` |
| `FS.SummaryRow` | Key-value row with optional edit | `label`, `value`, `onEdit` |
| `FS.Masthead` | Large number display | `eyebrow`, `title`, `right`, `compact` |
| `FS.StylistCard` | Stylist info card | `name`, `role`, `rate`, `available` |
| `FS.DayCell` | Calendar day cell | `day`, `selected`, `disabled`, `dot` |
| `FS.Wordmark` | Logo wordmark | `size` |
| `FS.StatusBar` | iOS-style status bar | — |
| `FS.AppHeader` | App header with step count | `step`, `total` |
| `FS.HomeIndicator` | iOS home indicator bar | — |

### The 9 mobile intake screens

Each screen is a function component in `intake-fs.jsx` that renders inside an `IntakeShell` wrapper:

| Screen | Component | What it shows |
|---|---|---|
| 01 · Service | `S_Service` | Service selection list (Cut, Color, Highlights, Extensions, Treatment) |
| 02 · Color | `S_Color` | Hair color level picker (1–10 scale bar) |
| 03 · Length | `S_Extensions` | Hair length silhouette grid (Pixie/Bob/Shoulder/Mid-back) + extensions toggle |
| 04 · Photos | `S_Photos` | Photo upload grid (Front/Side/Back) + inspiration photos |
| 05 · History | `S_History` | Last service card + condition chips + rating bars |
| 06 · Budget | `S_Budget` | Budget range radio options (Under $150 / $150–250 / $250–400 / $400+) |
| 07 · Estimate | `S_Estimate` | Price estimate masthead + summary rows + warning note |
| 08 · Booking | `S_Booking` | Stylist card + calendar grid + time slot picker |
| 09 · Confirm | `S_Confirm` | Confirmation masthead + summary + success note |

### The 3 desktop intake screens

Desktop layouts wrap content in `DesktopShell` + `StepRail` sidebar:

| Screen | Component | Accent color |
|---|---|---|
| 07 · Estimate | `D_Estimate_Butter` | Butter (#f4c752) — hero panel |
| 08 · Booking | `D_Booking_Sage` | Sage (#7a8f6b) — stylist panel + calendar accents |
| 09 · Confirm | `D_Confirm_Butter` | Butter (#f4c752) — hero panel |

---

# Part II: The Design Galley and Standalone Pages

## 2.1 Why standalone pages matter

The prototype HTML files use DesignCanvas (a Figma-like pan/zoom canvas) to show all screens at once. This is great for design review but useless for screenshot capture and css-visual-diff comparisons. We need **one URL per screen** that renders just that screen at a fixed size.

This follows the pattern established in the Pyxis project at `prototype-design/standalone/` — each screen gets its own clean HTML page that:

1. Loads the design-system.jsx shared tokens
2. Loads the screen-specific component source
3. Renders one screen at a fixed viewport size
4. Has stable selectors (`data-screen-label`) for css-visual-diff targeting

## 2.2 Directory structure

```
design-galley/
├── design-system.jsx          # FS tokens + components (copied from zip)
├── intake-fs.jsx              # 9 mobile screen components
├── intake-desktop.jsx         # 3 desktop screen components
├── screens.jsx                # Wireframe screen definitions (low-fi)
├── design-canvas.jsx          # DesignCanvas wrapper (kept for reference)
├── assets/                    # Fringe logo + reference images
├── standalone/
│   ├── index.html             # Landing page linking all standalone pages
│   ├── mobile/
│   │   ├── 01-service.html
│   │   ├── 02-color.html
│   │   ├── 03-length.html
│   │   ├── 04-photos.html
│   │   ├── 05-history.html
│   │   ├── 06-budget.html
│   │   ├── 07-estimate.html
│   │   ├── 08-booking.html
│   │   └── 09-confirm.html
│   └── desktop/
│       ├── 07-estimate-butter.html
│       ├── 08-booking-sage.html
│       └── 09-confirm-butter.html
├── screenshots/               # Captured PNG screenshots
│   ├── mobile/                # 9 mobile screen PNGs (390×844 viewport)
│   └── desktop/               # 3 desktop screen PNGs (1440×900 viewport)
└── visual-diff/
    └── userland/
        ├── specs/
        │   └── intake-mobile.visual.yml  # Visual suite spec
        └── verbs/
            └── fringe-pages.js           # Registered css-visual-diff verbs
```

## 2.3 How standalone pages are built

Each standalone mobile page follows this pattern:

```html
<!doctype html>
<html>
<head>
  <!-- Google Fonts: Anton, Instrument Serif, Inter, JetBrains Mono -->
  <style>
    #root { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <!-- React 18 + Babel CDN -->
  <script type="text/babel" src="../../design-system.jsx"></script>
  <script type="text/babel" src="../../intake-fs.jsx"></script>
  <script type="text/babel">
    const { S_Service } = window;
    ReactDOM.createRoot(document.getElementById('root')).render(
      React.createElement('div', {
        style: {
          width: 390, height: 844, borderRadius: 48,
          background: '#ffffff', border: '8px solid #1a1a1a',
          overflow: 'hidden', boxShadow: '0 24px 60px rgba(17,17,17,0.18)',
        }
      }, React.createElement(S_Service))
    );
  </script>
</body>
</html>
```

Key points:
- The page renders inside a **phone frame** div (390×844 with border radius and shadow)
- Each screen has a `data-screen-label` attribute for css-visual-diff targeting
- No DesignCanvas, no pan/zoom, no state management — just the raw screen

## 2.4 Serving and capturing

```bash
# Start a static server from design-galley/
cd hair-booking/design-galley
python3 -m http.server 7071

# Screenshots are captured with Playwright at the exact viewport sizes:
# Mobile: 500×920 (includes phone frame border)
# Desktop: 1480×940
```

---

# Part III: The css-visual-diff Integration

## 3.1 What is css-visual-diff?

css-visual-diff is a Go binary with a JavaScript API that drives Chromium to inspect, compare, and report on rendered web pages. It is not a screenshot diff tool — it is a **browser-fact extraction and comparison tool**. The workflow is:

```
1. Open a page in Chromium
2. Locate an element by CSS selector
3. Extract facts: text, bounds, computed styles, attributes, visibility
4. Compare those facts against a baseline or another page
5. Write evidence: JSON, Markdown, PNG crops, HTML snapshots
```

The tool is JavaScript-first: you write JS verb scripts that use `require("css-visual-diff")` to call the API, and the Go binary hosts those scripts. YAML specs are data consumed by JS, not native configs.

## 3.2 Key API concepts

From the css-visual-diff JavaScript API documentation:

| Concept | What it does | When to use it |
|---|---|---|
| `cvd.browser()` | Opens a Chromium browser service | Every script starts here |
| `browser.page(url, opts)` | Opens a page with viewport + wait | Load a standalone page or Storybook iframe |
| `page.locator(selector)` | Creates a page-bound element handle | Asking "does this element exist? What styles?" |
| `cvd.probe("name")` | Defines a reusable inspection recipe | Building repeatable checks |
| `cvd.snapshot(page, probes)` | Applies probes and returns plain data | Capturing facts to diff |
| `cvd.diff(before, after)` | Structural comparison of two snapshots | "What changed?" |
| `cvd.catalog(opts)` | Builds a durable manifest + artifacts | CI evidence, review bundles |
| `page.inspect(probe, opts)` | Writes full artifacts (PNG, HTML, CSS JSON) | Human review, screenshots |

The distinction between **locators** (live page queries) and **probes** (reusable recipes) is the most important concept. Use locators while exploring; use probes for repeatable checks.

## 3.3 The Fringe userland verbs

Located at `design-galley/visual-diff/userland/verbs/fringe-pages.js`, this file registers these commands:

```bash
# List all intake screen targets
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages list-targets --output json

# Inspect one screen (selector check + computed styles)
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages inspect-screen service --output json

# Snapshot one screen (semantic facts to JSON)
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages snapshot-screen service /tmp/fringe-snapshot --output json

# Catalog all screens (full artifacts: screenshots, CSS JSON, manifest)
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages catalog-all /tmp/fringe-catalog --output json
```

The project also has `.css-visual-diff.yml` at the repo root for repeatable runs:

```yaml
verbs:
  repositories:
    - name: fringe
      path: ./design-galley/visual-diff/userland/verbs
```

## 3.4 The visual suite spec

Located at `design-galley/visual-diff/userland/specs/intake-mobile.visual.yml`:

```yaml
schemaVersion: fringe.visual-suite.v1
name: intake-mobile
defaults:
  prototypeBase: http://localhost:7071
  viewport: { width: 390, height: 844 }
  waitMs: 2000
  threshold: 30
  variant: mobile
policy:
  bands:
    - { name: accepted, maxChangedPercent: 0.5 }
    - { name: review, maxChangedPercent: 10 }
    - { name: tune-required, maxChangedPercent: 30 }
    - { name: major-mismatch, maxChangedPercent: 100 }
targets:
  - page: service
    prototypePath: /standalone/mobile/01-service.html
    sections:
      - name: full-screen
        original: '[data-screen-label="01 · Service"]'
        react: '[data-page="service"]'
  # ... 8 more targets, one per screen
```

The spec defines:
- **Defaults**: prototype server URL, viewport, timing, threshold
- **Policy bands**: how close is close enough (accepted ≤0.5%, review ≤10%, etc.)
- **Targets**: one per screen, mapping prototype selector → planned React selector
- The `react` selector uses `data-page` attributes that must be added to the new React components

## 3.5 The comparison workflow

Once React components are built and Storybook is running, the comparison loop is:

```
1. Serve prototype: python3 -m http.server 7071 --directory design-galley
2. Serve Storybook: pnpm --filter fringe-ui storybook (port 6006)
3. Run a comparison verb
4. Inspect artifacts: left_region.png, right_region.png, diff_only.png
5. Inspect CSS facts: compare.json or snapshot diff
6. Edit one CSS property / token / component
7. Rerun same comparison
8. Repeat until in 'review' or 'accepted' band
```

---

# Part IV: Component Inventory and Taxonomy

## 4.1 Mobile IntakeShell (shared across all 9 screens)

Every mobile screen renders inside `IntakeShell` which provides:

```
┌──────────────────────────────────────┐
│ StatusBar (iOS-style)                │  ← FS.StatusBar
├──────────────────────────────────────┤
│ AppHeader (step X of 9)             │  ← FS.AppHeader
├──────────────────────────────────────┤
│ Progress bar                         │  ← FS.Progress (step/total * 100)
├──────────────────────────────────────┤
│ Eyebrow label                        │  ← FS.Eyebrow ("Chapter I · The Ask")
│ Screen title (display3/h1)           │  ← Inline FS.type.display3 at 40px
├──────────────────────────────────────┤
│                                      │
│  Scrollable content area             │  ← Screen-specific children
│  (flex: 1, overflow-y: auto)        │
│                                      │
├──────────────────────────────────────┤
│ [ Skip ] [ Keep going →         ]   │  ← FS.Button secondary + primary
├──────────────────────────────────────┤
│ HomeIndicator (iOS-style)            │  ← FS.HomeIndicator
└──────────────────────────────────────┘
```

**Implementation notes:**
- `IntakeShell` is an organism that composes StatusBar, AppHeader, Progress, and HomeIndicator atoms
- The bottom CTA bar is `position: absolute; bottom: 0` — it floats over scrollable content
- Screen-specific content fills the middle `flex: 1` area
- The `IntakeShell` component already exists in `web.deprecated/src/fringe-ui/layout/IntakeShell.tsx` but needs restyling to match the new FS design

## 4.2 Desktop DesktopShell (shared across 3 desktop screens)

```
┌──────────┬───────────────────────────────────────────────────┐
│ DesktopShell top nav bar                                     │
│ [Logo] [Services] [Book] [Stylists] [Journal]    Hi, Mia [M]│
├──────────┼───────────────────────────────────────────────────┤
│ StepRail │ Screen content (varies per screen)                │
│ sidebar  │                                                   │
│          │                                                   │
│ 01 Svc   │                                                   │
│ 02 Color │                                                   │
│ ...      │                                                   │
│ 09 Conf  │                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

## 4.3 Atom inventory

These are the smallest reusable visual primitives. Each should be a React component with typed props and a Storybook story.

| Atom | Source | Props | Visual characteristics |
|---|---|---|---|
| `Eyebrow` | `FS.Eyebrow` | `color`, `style`, `children` | JetBrains Mono 10px, 1.8 tracking, uppercase, weight 600 |
| `Button` | `FS.Button` | `variant`, `size`, `style`, `children`, `onClick` | Plum bg (primary) / transparent+border (secondary) / transparent (ghost); Anton font uppercase |
| `Chip` | `FS.Chip` | `selected`, `style`, `children` | Pill border-radius; ink bg when selected, transparent when not |
| `Segmented` | `FS.Segmented` | `value`, `options` | Tabbed control for mutually exclusive options |
| `Note` | `FS.Note` | `tone` (`info`/`warn`/`success`), `children` | Card with colored left border; cream bg (info), ochre (warn), sage (success) |
| `Progress` | `FS.Progress` | `value` (0–100) | Thin horizontal bar, plum fill |
| `RatingBar` | `FS.RatingBar` | `label`, `value` (1–5) | Label + 5-dot bar with plum fill |
| `Rule` | `FS.Rule` | — | Horizontal line in rule color |
| `Wordmark` | `FS.Wordmark` | `size` | Fringe logo text |
| `StatusBar` | `FS.StatusBar` | — | iOS-style time/battery/signal bar |
| `HomeIndicator` | `FS.HomeIndicator` | — | iOS-style bottom bar |
| `AppHeader` | `FS.AppHeader` | `step`, `total` | Back arrow + "Step X of N" |

## 4.4 Molecule inventory

Molecules compose atoms around a specific interaction or domain concept.

| Molecule | Source | Composes | Purpose |
|---|---|---|---|
| `Card` | `FS.Card` | + accent color | Content card with colored top accent |
| `PhotoTile` | `FS.PhotoTile` | + label, filled state | Photo upload tile with camera placeholder |
| `SummaryRow` | `FS.SummaryRow` | + label, value, onEdit | Key-value display row with optional edit link |
| `Masthead` | `FS.Masthead` | + eyebrow, title, right text | Large number display (e.g. "$245") |
| `StylistCard` | `FS.StylistCard` | + name, role, rate, available | Stylist info card with avatar initial |
| `DayCell` | `FS.DayCell` | + day, selected, disabled, dot | Calendar day cell with dot indicator |
| `ServiceOption` | `S_Service` rows | + name, description, rate, selected | Service selection row with left border |
| `ColorLevelBar` | `S_Color` scale | + levels 1–10, current | Visual hair color scale picker |
| `LengthSilhouette` | `S_Extensions` grid | + label, height, selected | SVG hair length illustration |
| `BudgetOption` | `S_Budget` rows | + range, description, selected | Budget tier radio option |
| `TimeSlot` | `S_Booking` grid | + time, selected | Time slot selection cell |

## 4.5 Organism inventory

Organisms are coherent page sections.

| Organism | Source | Purpose |
|---|---|---|
| `IntakeShell` | `IntakeShell` in `intake-fs.jsx` | Mobile screen wrapper: status bar + header + progress + scroll + CTA |
| `DesktopShell` | `DesktopShell` in `intake-desktop.jsx` | Desktop nav bar + content area |
| `StepRail` | `StepRail` in `intake-desktop.jsx` | Desktop sidebar with 9-step progress |
| `ServiceList` | `S_Service` content area | Service selection list |
| `ColorPicker` | `S_Color` content area | Hair color level picker + target chips |
| `LengthPicker` | `S_Extensions` content area | Silhouette grid + extensions toggle |
| `PhotoUploader` | `S_Photos` content area | Photo upload grid + inspiration grid |
| `HistoryForm` | `S_History` content area | Service card + condition chips + rating bars |
| `BudgetPicker` | `S_Budget` content area | Budget range radio list |
| `EstimateSummary` | `S_Estimate` content area | Masthead + summary rows + note |
| `BookingCalendar` | `S_Booking` content area | Stylist card + calendar + time slots |
| `Confirmation` | `S_Confirm` content area | Confirmation masthead + summary + notes |

## 4.6 Selector contract

Every visual target must have stable selectors. The planned selector vocabulary:

```tsx
// Mobile page wrapper
<main data-page="service" data-variant="mobile">
  <section data-section="intake-header">...</section>
  <section data-section="intake-content">
    <div data-component="service-option" data-part="root" data-selected="true">
      <span data-part="name">Highlights</span>
      <span data-part="rate">$180+</span>
    </div>
  </section>
  <section data-section="intake-cta">...</section>
</main>

// Desktop page wrapper
<main data-page="estimate" data-variant="desktop">
  <aside data-section="step-rail">...</aside>
  <section data-section="estimate-content">
    <div data-component="masthead" data-part="root">...</div>
    <div data-component="summary-row" data-part="root" data-label="Service">...</div>
  </section>
</main>
```

These selectors are referenced in the visual spec (`intake-mobile.visual.yml`) and must be added to the React components during implementation.

---

# Part V: Data Contracts and Props

## 5.1 Intake flow state

The intake flow is a 9-step wizard. The accumulated state is:

```ts
interface IntakeState {
  step: number;                    // 1–9

  // Step 1: Service
  service: ServiceType | null;     // 'cut' | 'color' | 'highlights' | 'extensions' | 'treatment'
  serviceAddOns: ServiceType[];    // Additional services picked later

  // Step 2: Color
  currentLevel: number;           // 1–10
  targetDirection: string;        // 'same' | 'lighter-1' | 'lighter-2' | 'darker' | 'dimensional'

  // Step 3: Length
  lengthCategory: LengthCategory; // 'pixie' | 'bob' | 'shoulder' | 'mid-back'
  extensionType: ExtType;         // 'none' | 'taped' | 'hand-tied'

  // Step 4: Photos
  photoFront: Blob | null;
  photoSide: Blob | null;
  photoBack: Blob | null;
  inspirationPhotos: Blob[];      // Up to 4

  // Step 5: History
  lastService: string;
  lastServiceDate: string;
  conditions: ConditionTag[];     // 'healthy' | 'dry' | 'damaged' | etc.
  breakageRating: number;         // 1–5
  splitEndsRating: number;
  drynessRating: number;
  frizzRating: number;

  // Step 6: Budget
  budgetTier: BudgetTier;         // 'under-150' | '150-250' | '250-400' | '400+'

  // Step 7: Estimate (computed, not user input)
  estimateLow: number;
  estimateLikely: number;
  estimateHigh: number;
  estimatedDuration: string;      // "3h 15m"

  // Step 8: Booking
  stylistId: string;
  selectedDate: string;           // "2025-06-18"
  selectedTime: string;           // "14:00"

  // Step 9: Confirm (read-only)
  confirmationCode: string;
}
```

## 5.2 Component props

Example typed props for key molecules:

```ts
// Service selection option
interface ServiceOptionProps {
  name: string;
  description: string;
  rate: string;              // "$80+"
  selected?: boolean;
  onSelect: () => void;
}

// Stylist card
interface StylistCardProps {
  name: string;
  initial: string;           // Avatar letter
  role: string;              // "Senior colorist · Lived-in blonde"
  rate: string;              // "$180+"
  available?: string;        // "Available Tue 2:00p"
  rating?: number;
  reviewCount?: number;
  languages?: string[];      // ["EN", "ES"]
}

// Calendar day cell
interface DayCellProps {
  day: number;
  selected?: boolean;
  disabled?: boolean;
  hasAvailability?: boolean; // Shows dot indicator
  openSlots?: number;
  onSelect: (day: number) => void;
}
```

---

# Part VI: The Build and Development Toolchain

## 6.1 Stack (from web.deprecated, to be carried forward)

```
Runtime:      React 19 + TypeScript
State:        Redux Toolkit + RTK Query
Build:        Vite 6
Testing:      Vitest + Testing Library + MSW (mock Service Worker)
Components:   Storybook 8 (React + Vite)
CSS:          Inline styles (current) → CSS modules or token-based CSS (new)
Embed:        go:embed for single-binary production deployment
```

## 6.2 Commands

```bash
# Development (mock API)
cd web && pnpm dev:mock

# Development (real backend)
cd web && pnpm dev:backend

# Storybook
cd web && pnpm storybook

# Tests
cd web && pnpm test

# Production build (outputs to web/dist/)
cd web && pnpm build

# Type checking
cd web && pnpm typecheck
```

## 6.3 Project wiring (Go embed)

The Go backend serves the SPA from an embedded filesystem. The production build pipeline:

1. `pnpm build` produces `web/dist/` with `index.html` + JS/CSS bundles
2. Go uses `go:embed` to embed `web/dist/` into the binary
3. The Go HTTP server serves the SPA on `/` and API routes on `/api/`

This means the frontend must build to a flat `dist/` directory with `index.html` as the entry point.

---

# Part VII: Step-by-Step Implementation Plan

## Phase 1: Scaffold the new web/ directory (Day 1)

**Goal:** A clean `web/` directory with the same tooling as `web.deprecated/` but with updated token values.

```bash
# Copy package.json, vite.config.ts, tsconfig.json from web.deprecated/
# Copy src/mock/ (MSW handlers) — backend API mocking
# Copy src/stylist/store/ (RTK Query slices) — data layer
# Create fresh src/fringe-ui/ with new token values from FS
# Create empty src/fringe/pages/ directory structure
```

**Validation:**
```bash
cd web && pnpm install && pnpm typecheck
cd web && pnpm storybook  # Opens on :6006 with no stories yet
```

## Phase 2: Tokens and atoms (Days 2–3)

**Goal:** All atoms render in Storybook with correct FS token values.

1. Update `src/fringe-ui/tokens/`:
   - `index.ts`: TypeScript constants matching `FS.color`, `FS.font`, `FS.type`, `FS.space`, `FS.radius`, `FS.shadow`
   - `index.css`: CSS custom properties (`--fringe-plum: #6b3a4a`, etc.)

2. Implement atoms one by one:
   - Start with `Eyebrow` (simplest: mono text with tracking)
   - Then `Button` (primary/secondary/ghost/danger, sm/md/lg)
   - Then `Chip`, `Progress`, `RatingBar`, `Note`, `Rule`
   - Then `Wordmark`, `StatusBar`, `HomeIndicator`, `AppHeader`

3. Each atom gets:
   - Typed props
   - `data-component` + `data-part` selectors
   - A Storybook story with default + variant states
   - Inline styles using token constants (same pattern as prototype)

**Validation:**
```bash
cd web && pnpm storybook
# Visually compare each atom story against the prototype standalone page
```

## Phase 3: Molecules (Days 3–4)

**Goal:** All molecules render in Storybook.

1. Implement molecules in dependency order:
   - `Card` (uses `accent` color prop)
   - `SummaryRow` (uses `Eyebrow` + text)
   - `Masthead` (uses `Eyebrow` + display type + editorial)
   - `PhotoTile` (uses `cream`/`plum` for empty/filled states)
   - `StylistCard` (composes `Eyebrow` + display + editorial + meta text)
   - `DayCell` (uses `h2` type + `meta` type + `sage`/`cream` colors)
   - `Segmented` (uses `Button`-like styling)
   - `ServiceOption` (uses `h3` + `bodySm` + `meta` + `peachSoft`/`cream` + left border)
   - `BudgetOption` (similar to `ServiceOption` but with radio indicator)
   - `TimeSlot` (uses `h3` + `plum`/`paper` color flip)
   - `ColorLevelBar` (uses HSL color scale + `Note`)
   - `LengthSilhouette` (uses SVG + grid + `eyebrow` label)

2. Each molecule gets typed props, selectors, and stories.

## Phase 4: Organisms and IntakeShell (Days 4–5)

**Goal:** `IntakeShell` + all 9 mobile page organisms render in Storybook.

1. Implement `IntakeShell`:
   - Composes: StatusBar + AppHeader + Progress + scrollable content + CTA bar + HomeIndicator
   - Accepts `step`, `total`, `eyebrow`, `title`, `children`, `onNext`, `onSkip`, `onBack`
   - Adds `data-section="intake-header"`, `data-section="intake-content"`, `data-section="intake-cta"`

2. Implement each page organism as a component that renders inside `IntakeShell`:
   - `ServicePage` → IntakeShell wrapping ServiceOption list
   - `ColorPage` → IntakeShell wrapping ColorLevelBar + target chips
   - ... and so on for all 9 screens

3. Each page organism:
   - Adds `data-page="<slug>"` to its root element
   - Adds `data-section="intake-content"` around the screen-specific content
   - Has a Storybook story rendering the full page

## Phase 5: Desktop variants (Days 5–6)

**Goal:** 3 desktop screens render in Storybook.

1. Implement `DesktopShell`:
   - Top nav bar with logo + nav links + user avatar
   - Accepts `accent` color prop for active nav underline

2. Implement `StepRail`:
   - 9-step sidebar with done/active/upcoming states
   - Accepts `current` step index and `accent` color

3. Implement desktop page organisms:
   - `DesktopEstimatePage` (Butter accent)
   - `DesktopBookingPage` (Sage accent)
   - `DesktopConfirmPage` (Butter accent)

## Phase 6: Visual tuning with css-visual-diff (Days 6–8)

**Goal:** Each screen matches the prototype baseline within policy bands.

### The tuning loop

```pseudo
for screen in [service, color, length, photos, history, budget, estimate, booking, confirm]:
    # 1. Capture prototype baseline
    snapshot = snapshotScreen(screen, "prototype-baseline/")
    
    # 2. Capture React implementation
    snapshot = snapshotScreen(screen, "react-current/")
    
    # 3. Compare
    diff = diff(prototype, react)
    
    # 4. While not close enough:
    while diff.changePercent > 10:
        # Read the diff report
        inspect diff.only.png
        inspect diff.json (which CSS properties differ)
        
        # Make ONE focused change
        if diff is in a shared atom:
            edit atom CSS/token
        else if diff is in a molecule:
            edit molecule CSS
        else:
            edit page organism CSS
        
        # Rerun
        snapshot = snapshotScreen(screen, "react-current/")
        diff = diff(prototype, react)
    
    # 5. Document accepted differences
    record accepted differences for this screen
```

### Running the comparison

```bash
# Start servers
python3 -m http.server 7071 --directory design-galley &
cd web && pnpm storybook &

# Catalog all screens (prototype side)
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages catalog-all /tmp/fringe-baseline --output json

# Inspect one screen
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages inspect-screen service --output json

# Snapshot one screen (for diffing)
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages snapshot-screen service /tmp/fringe-before --output json

# After making a CSS change, snapshot again and diff
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages snapshot-screen service /tmp/fringe-after --output json
```

### Policy bands

| Band | Threshold | Action |
|---|---|---|
| `accepted` | ≤0.5% changed pixels | Move on |
| `review` | ≤10% changed pixels | Inspect artifacts, document if acceptable |
| `tune-required` | ≤30% changed pixels | Tune before moving to next screen |
| `major-mismatch` | >30% changed pixels | Stop, fix selector or structural issue |

## Phase 7: Route composition and app wiring (Days 8–9)

**Goal:** React Router routes wire the 9 screens into a navigable intake flow.

1. Create `src/fringe/IntakeFlowApp.tsx`:
   - Uses React Router or simple state-based navigation
   - Manages `IntakeState` in Redux
   - Renders each step's organism based on current step
   - Passes `onNext`/`onBack`/`onSkip` callbacks that dispatch state updates

2. Wire API calls:
   - Step 7 (Estimate): `POST /api/intake/estimate` with accumulated state
   - Step 8 (Booking): `GET /api/stylists/:id/availability`, `POST /api/bookings`
   - Step 9 (Confirm): `POST /api/bookings/:id/confirm`

3. Use the RTK Query slices from `src/stylist/store/` (already salvaged).

## Phase 8: Production build and Go embed (Day 9)

**Goal:** Single binary serves the SPA.

```bash
# Build frontend
cd web && pnpm build  # → web/dist/

# Build and run Go binary
cd hair-booking && go run ./cmd/hair-booking
```

---

# Part VIII: File Reference Map

## Prototype source files (in design-galley/)

| File | What it contains |
|---|---|
| `design-galley/design-system.jsx` | Complete FS token system + 17 component definitions |
| `design-galley/intake-fs.jsx` | 9 mobile screen components (`S_Service` through `S_Confirm`) + `IntakeShell` |
| `design-galley/intake-desktop.jsx` | 3 desktop screen components + `DesktopShell` + `StepRail` |
| `design-galley/screens.jsx` | Wireframe/low-fi screen variants (sketch style) |
| `design-galley/design-canvas.jsx` | DesignCanvas pan/zoom wrapper (for reference only) |

## Standalone pages (in design-galley/standalone/)

| File | Viewport | What it renders |
|---|---|---|
| `standalone/mobile/01-service.html` | 390×844 | Service selection screen in phone frame |
| `standalone/mobile/02-color.html` | 390×844 | Color level picker |
| `standalone/mobile/03-length.html` | 390×844 | Length + extensions picker |
| `standalone/mobile/04-photos.html` | 390×844 | Photo upload grid |
| `standalone/mobile/05-history.html` | 390×844 | Hair history + condition |
| `standalone/mobile/06-budget.html` | 390×844 | Budget range selector |
| `standalone/mobile/07-estimate.html` | 390×844 | Estimate summary |
| `standalone/mobile/08-booking.html` | 390×844 | Calendar + time slots |
| `standalone/mobile/09-confirm.html` | 390×844 | Booking confirmation |
| `standalone/desktop/07-estimate-butter.html` | 1440×900 | Desktop estimate, butter accent |
| `standalone/desktop/08-booking-sage.html` | 1440×900 | Desktop booking, sage accent |
| `standalone/desktop/09-confirm-butter.html` | 1440×900 | Desktop confirmation, butter accent |

## Salvageable existing code (in web.deprecated/)

| Path | What to salvage | How |
|---|---|---|
| `web.deprecated/package.json` | Dependencies and scripts | Copy to `web/`, update if needed |
| `web.deprecated/vite.config.ts` | Vite + Go embed config | Copy to `web/` |
| `web.deprecated/src/stylist/store/` | Complete RTK Query data layer | Copy to `web/src/store/` |
| `web.deprecated/src/mock/` | MSW handlers | Copy to `web/src/mock/` |
| `web.deprecated/src/fringe-ui/tokens/` | Token structure | Copy, update values to match FS |
| `web.deprecated/src/fringe-ui/primitives/` | Component interfaces | Copy, restyle internals |
| `web.deprecated/src/fringe-ui/layout/` | IntakeShell, StepRail | Copy, restyle internals |

## Pyxis reference documents

| Path | Why it matters |
|---|---|
| `pyxis/ttmp/2026/05/01/HTML-DESIGN-TO-REACT-PLAYBOOK/.../01-html-design-to-react-implementation-workflow-guide.md` | Master playbook for the entire conversion process |
| `pyxis/ttmp/2026/04/24/PYXIS-COMPONENT-VISUAL-PARITY/.../01-bottom-up-prototype-to-storybook-visual-parity-implementation-guide.md` | Bottom-up visual comparison guide |
| `pyxis/prototype-design/visual-diff/userland/README.md` | Complete css-visual-diff userland architecture |
| `pyxis/prototype-design/visual-diff/userland/specs/` | Example YAML visual suite specs |

---

# Part IX: Diagrams

## 9.1 System architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Go Binary                            │
│  ┌─────────────────────┐  ┌──────────────────────────┐ │
│  │  cmd/hair-booking   │  │  go:embed web/dist/      │ │
│  │  HTTP server        │  │  → serves SPA on /       │ │
│  │  /api/* routes      │  │  → serves API on /api/*  │ │
│  └─────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                    embeds at build time
                          │
┌─────────────────────────────────────────────────────────┐
│                 web/ (React SPA)                        │
│                                                         │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ Tokens   │  │ fringe-ui/ │  │ fringe/pages/      │ │
│  │ TS + CSS │→ │ atoms      │→ │ client-booking/    │ │
│  │          │  │ molecules  │  │  9-step intake     │ │
│  │ #6b3a4a  │  │ organisms  │  │  desktop variants  │ │
│  │ Anton    │  │ chrome     │  │ client-portal/     │ │
│  │ Inter    │  │ layout     │  │ stylist/           │ │
│  └──────────┘  └────────────┘  └────────────────────┘ │
│                                                         │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────┐ │
│  │ store/   │  │ mock/     │  │ Storybook stories   │ │
│  │ RTK Query│  │ MSW       │  │ for each component  │ │
│  │ Redux    │  │ handlers  │  │ + page stories      │ │
│  └──────────┘  └───────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 9.2 Visual comparison flow

```
┌───────────────────┐     ┌───────────────────────┐
│  Prototype (FS)   │     │  React (fringe-ui)    │
│  standalone HTML  │     │  Storybook iframe     │
│  localhost:7071   │     │  localhost:6006       │
└────────┬──────────┘     └──────────┬────────────┘
         │                           │
         │    css-visual-diff        │
         │    ┌──────────────┐       │
         └───→│  browser()   │←──────┘
              │  page()      │
              │  locator()   │
              │  snapshot()  │
              │  diff()      │
              └──────┬───────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Evidence artifacts   │
         │  ├── snapshot.json    │
         │  ├── diff.json        │
         │  ├── diff.md          │
         │  ├── left_region.png  │
         │  ├── right_region.png │
         │  └── diff_only.png    │
         └───────────────────────┘
```

## 9.3 Intake flow state machine

```
[Service] → [Color] → [Length] → [Photos] → [History] → [Budget]
    │                                                      │
    │              ┌────────────────────────────────────────┘
    │              ▼
    │         [Estimate] → [Booking] → [Confirm]
    │              │            │           │
    │              ▼            ▼           ▼
    │         POST /api/    GET /api/    POST /api/
    │         estimate     availability  bookings
    │                                     │
    └─────────────────────────────────────┘
       (user can go back to any step)
```

---

# Part X: Common Pitfalls and How to Avoid Them

1. **Don't start with full-page comparisons.** Compare atoms first, then molecules, then organisms. Full-page diffs mix too many variables.

2. **Don't copy the prototype's inline styles directly.** The prototype uses inline styles for simplicity. In React, use typed token constants and CSS custom properties. The *values* should match, not the *mechanism*.

3. **Don't skip the selector contract.** Without `data-page`, `data-section`, and `data-component` attributes, css-visual-diff cannot target specific elements. Add them during implementation, not after.

4. **Don't rely on transitive CSS.** Each component should import its own CSS. A parent component's styles should not be necessary for a child to render correctly in Storybook.

5. **Don't forget the phone frame in screenshots.** The standalone mobile pages render inside a phone frame (border + border-radius + shadow). When comparing with Storybook stories, either:
   - Strip the phone frame in the comparison, or
   - Accept that the frame adds structural differences

6. **Don't try to match anti-aliasing or font rendering exactly.** Different systems render fonts differently. Focus on matching font family, size, weight, line-height, color, spacing, and layout. Accept ≤0.5% pixel differences from rendering engines.

7. **Don't mix the old `web.deprecated/` code with the new `web/` code.** The old design is a separate directory. Copy what you need, modify it, and leave the old code alone. The `.deprecated` suffix means it's frozen.

---

# Appendix A: css-visual-diff Quick Reference

```bash
# List available verbs
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages list-targets --output json

# Inspect a single screen
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages inspect-screen service --prototypeBase http://localhost:7071

# Snapshot a screen (capture semantic facts)
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages snapshot-screen service /tmp/fringe/service --output json

# Catalog all screens (full artifact bundle)
css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
  fringe pages catalog-all /tmp/fringe-catalog --artifacts bundle --output json

# Built-in catalog inspect (one page, one selector)
css-visual-diff verbs catalog inspect-page \
  http://localhost:7071/standalone/mobile/01-service.html \
  '[data-screen-label="01 · Service"]' \
  /tmp/fringe-inspect \
  --slug service --artifacts bundle --output json

# Review site (browse artifacts interactively)
css-visual-diff serve --data-dir /tmp/fringe-catalog --port 8098
```

# Appendix B: Running the Design Galley Server

```bash
cd hair-booking/design-galley
python3 -m http.server 7071

# Open the index page:
open http://localhost:7071/standalone/index.html

# Open a specific mobile screen:
open http://localhost:7071/standalone/mobile/01-service.html

# Open a specific desktop screen:
open http://localhost:7071/standalone/desktop/07-estimate-butter.html
```

# Appendix C: Fringe Token Quick Reference

```
COLORS:
  ink=#111  paper=#fff  cream=#f6efe4  creamDeep=#efe6d4
  rule=#ebe7df  soft=#9a958e  softInk=#5b5852
  plum=#6b3a4a  plumDeep=#4a2431  peach=#f2b89a  peachSoft=#faddc9
  coral=#e8573c  butter=#f4c752  ochre=#c48a34  sage=#7a8f6b  blush=#e6b8a8

FONTS:
  block="Anton"  serif="Instrument Serif"  sans="Inter"  mono="JetBrains Mono"

TYPOGRAPHY:
  display1=120px  display2=72px  display3=54px
  h1=36px  h2=26px  h3=20px
  editorial=19px italic  editorialLg=28px italic
  body=14px  bodyLg=16px  bodySm=12px
  eyebrow=10px mono uppercase 600  meta=11px mono tabular

SPACING: 0/4/8/12/16/20/24/32/40/56/72
RADIUS: none=0  sm=2  md=6  lg=12  pill=999
```
