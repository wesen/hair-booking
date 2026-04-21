---
title: Analysis & Implementation Guide — Fringe Design System Restyle
status: active
doc-type: design-doc
intent: long-term
topics:
  - frontend
  - restyle
  - design-system
  - react
  - storybook
  - react-modular-themable-storybook
owners: []
summary: ""
created: 2026-04-21
---

# Analysis & Implementation Guide — Fringe Design System Restyle

**Ticket:** HAIR-016  
**Date:** 2026-04-21  
**Source:** `~/Downloads/hair-booking.zip` — extracted to `ttmp/HAIR-016/sources/`

---

## Executive Summary

This document is a complete design, architecture, and implementation guide for restyling the hair-booking frontend in its entirety using the **Fringe design system** — a plum + peach editorial-zine aesthetic. The project covers three distinct application surfaces (client booking intake, stylist dashboard, client portal), all built on the same token/component library. The backend (Go + PostgreSQL + Keycloak) is unchanged; only the React frontend is replaced. The existing RTK Query API surface is complete and well-typed — every new screen maps directly to one or more of the 7 API slices.

**The goal is a clean break.** No backwards compatibility. No migration of old components. The new design system ships as a self-contained `fringe-ui` package with CSS custom property tokens, a Storybook, and a set of React components that replace the current `web/src/stylist/components/` and `web/src/stylist/pages/` wholesale.

---

## 1. The Three Application Surfaces

The Fringe design system covers three distinct UX surfaces, each a separate React app in the existing codebase:

| Surface | App file | Description | New screens |
|---|---|---|---|
| **Client Booking Intake** | `ClientBookingApp.tsx` | 9-step guided intake flow → estimate → stylist → booking → confirm | 9 mobile + 3 desktop |
| **Stylist Dashboard** | `StylistApp.tsx` | Today's appointments, client roster, inbox, profile | ~10 mobile |
| **Client Portal** | `ClientPortalApp.tsx` | Home, upcoming detail, history, account, edit screens | ~7 mobile |

All three share the same `fringe-ui` token library. The visual language is unified; only layout and interaction patterns differ by surface.

---

## 2. Design System Overview — The FS Object

The design system is exported as a `window.FS` object in the source zip. It contains:

### 2.1 Color Tokens

All colors are semantic, not raw hex:

```
FS.color = {
  // Neutrals — warm off-white base, no pure black
  ink:       '#111111',   // Near-black text
  paper:     '#ffffff',   // White (card backgrounds)
  cream:     '#f6efe4',   // Default page background (warm cream)
  creamDeep: '#efe6d4',   // Slightly darker cream (sections)
  rule:      '#ebe7df',   // Borders and dividers
  soft:      '#9a958e',   // Secondary text
  softInk:   '#5b5852',   // Body text on cream

  // Brand — plum is the primary accent
  plum:      '#6b3a4a',   // Primary brand (buttons, chips, headlines)
  plumDeep:  '#4a2431',   // Dark plum (eyebrow text on light bg)

  // Peach — the hero panel color
  peach:     '#f2b89a',   // Hero backgrounds, avatars, highlights
  peachSoft: '#faddc9',   // Soft peach (selected states, fills)

  // Editorial accent palette (one per accent zone)
  coral:     '#e8573c',   // Alert / danger / CTA accent
  butter:    '#f4c752',   // Warm gold — used in desktop estimate panels
  ochre:     '#c48a34',   // Warn tone
  sage:      '#7a8f6b',   // Sage green — used in desktop booking panels
  blush:     '#e6b8a8',   // Blush pink — secondary fill

  // Semantic (alias)
  success:   '#7a8f6b',   // = sage
  warn:      '#c48a34',   // = ochre
  danger:    '#e8573c',   // = coral
}
```

**Rule:** The cream background (`#f6efe4`) is the default page background across all screens. White (`paper`) is used for cards and overlays. Plum is the primary action color. Peach is used for hero sections and avatars.

### 2.2 Typography

```
FS.font = {
  block: '"Anton", "Oswald", Impact, sans-serif'    // ALL-CAPS display headings
  serif: '"Instrument Serif", Georgia, serif'       // Italic editorial pull-quotes
  sans:  '"Inter", system-ui, sans-serif'           // Body copy and UI text
  mono:  '"JetBrains Mono", ui-monospace, monospace'// Eyebrows and metadata
}
```

**Type scale** (all entries use the font + size + line-height + letter-spacing combo):

| Token | Used for | Example |
|---|---|---|
| `display1` | Hero text, large numbers | `150px, Anton, line-height 0.82` |
| `display2` | Page titles | `72px, Anton, uppercase` |
| `display3` | Section headings | `54px, Anton, uppercase` |
| `h1` / `h2` / `h3` | Card headings | `36 / 26 / 20px, Anton` |
| `editorialLg` | Large quotes | `28px, Instrument Serif, italic` |
| `editorial` | Body quotes and asides | `19px, Instrument Serif, italic` |
| `body` | Default body | `14px, Inter` |
| `bodyLg` | Emphasized body | `16px, Inter` |
| `bodySm` | Small body | `12px, Inter` |
| `eyebrow` | Labels, tags, step numbers | `10px, Mono, uppercase, 1.8px tracking` |
| `meta` | Timestamps, secondary | `11px, Mono, tabular-nums` |

**Critical rule:** Display text (display1/h1/h2) uses **ALL CAPS** via `textTransform: 'uppercase'`. Editorial text uses **italic**. Do not mix these.

### 2.3 Spacing Scale

`FS.space = { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 7:32, 8:40, 9:56, 10:72 }`

In CSS custom properties: `--fringe-space-1: 4px`, `--fringe-space-2: 8px`, etc.

### 2.4 Border Radius

`FS.radius = { none: 0, sm: 2, md: 6, lg: 12, pill: 999 }`

### 2.5 Shadows

```
FS.shadow = {
  sm: '0 2px 6px rgba(17,17,17,0.06)',
  md: '0 8px 24px rgba(17,17,17,0.08)',
  lg: '0 24px 60px rgba(17,17,17,0.14)',
}
```

---

## 3. The FS Component Library (Primitive Layer)

These are the base primitives exported from `design-system.jsx`. Every composite component is built from these.

```
FS.Eyebrow({ color?, style? })          → Mono uppercase label
FS.Wordmark({ size?, color? })          → "FRINGE" in Anton
FS.Rule({ color?, thick? })             → Horizontal divider
FS.Button({ variant?, size?, children }) → primary | secondary | ghost | danger
FS.Chip({ selected?, onClick?, children, shape? }) → pill | square filter tag
FS.TextField({ label?, value?, placeholder?, multiline? }) → Input or textarea
FS.Card({ accent?, children? })          → Cream card with optional left border
FS.RatingBar({ value, label? })          → Segmented 1-5 visual bar
FS.Segmented({ options, value, onChange }) → Tab-like segmented control
FS.Progress({ value, max? })             → Thin progress bar
FS.IndexChip({ n, bg?, color? })        → Numbered step chip
FS.Section({ n, title, children, accent?, topBorder? }) → Numbered row
FS.Masthead({ eyebrow?, title, accent?, compact?, right? }) → Peach hero panel
FS.AppHeader({ step?, total?, onBack? }) → Mobile top bar (back + wordmark + step)
FS.StatusBar()                           → iOS status bar (time + signal)
FS.HomeIndicator()                       → iOS home indicator
FS.PhoneFrame({ children, w?, h? })      → iPhone bezel frame
FS.StylistCard({ name, role, rate?, available? }) → Stylist profile card
FS.PhotoTile({ label, filled? })         → Photo upload placeholder tile
FS.SummaryRow({ label, value, onEdit? })  → Label + value + edit link row
FS.DayCell({ day, selected?, disabled?, dot? }) → Calendar day cell
FS.Note({ tone? })                       → Info/success/warn/danger toast
```

---

## 4. Screen-by-Screen Analysis

### 4.1 Client Booking Intake Flow (`ClientBookingApp.tsx`)

9 screens in the intake flow, each mapped to an API call:

#### S_Service — "What brings you in?"
```
Design: Scrollable list of service category cards (Cut, Color, Highlights, Extensions, Treatment).
Selected card has peachSoft background + 3px plum left border.
Each row shows: name + description + starting rate.

API: POST /api/intakes → servicesApi.createIntake()
Request: { service_type: "color" | "extensions" | "both", ... }
Note: This step gates all subsequent steps. The service_type determines
which sub-flow (color questionnaire vs extensions questionnaire) appears next.
```

#### S_Color — "Current level"
```
Design: Color level slider (1=jet black to 10=platinum). Each level is a vertical bar
with a tonal color. Selected level has plum border. Below: target chips (Stay same,
Lighter, Darker, Dimensional). Below: Note with current level description.

API: servicesApi.createIntake() (same call, with color_service + natural_level fields)
Request: { color_service: "full" | "highlights" | "balayage" | "gloss" | ...,
          natural_level: "7", current_color: "dark blonde with warm undertones" }
```

#### S_Extensions — "How long is it now?"
```
Design: 4-column silhouette grid (Pixie, Bob, Shoulder, Mid-back). Each cell has an
inline SVG hair silhouette. Selected has peachSoft bg + plum border.
Below: Segmented control for extension type (None / Tape-in / Hand-tied).

API: servicesApi.createIntake() with { hair_length, ext_type, desired_length }
Note: This screen only appears when service_type === "extensions" or "both"
in the intake flow. For color-only flows, it is skipped.
```

#### S_Photos — "Three angles, please."
```
Design: 3-column photo grid (Front, Side, Back). Filled tiles show a checkmark + label.
Below: 4-cell inspiration grid (up to 4). Filled cells show checkmark.

API: servicesApi.uploadIntakePhoto() (separate POST per photo)
POST /api/intakes/{id}/photos with FormData (slot: "front" | "side" | "back", file)
Note: Inspirational photos are upload references or text tags, not separate uploads.
The design uses a mixed approach — filled inspo cells suggest actual uploads.
```

#### S_History — "Hair history"
```
Design: Masthead (peach). Then: Card with last service summary (left plum border).
Condition chips (Healthy, Frizzy, Dry, etc.). RatingBars (Breakage, Split ends,
Dryness, Frizz) — each a 5-segment bar.

API: servicesApi.createIntake() with { chemical_history: [], last_chemical: "...",
          condition_ratings: { breakage: 2, split_ends: 3, ... } }
Note: The RatingBar component maps to the 1-5 severity scale.
Condition chips map to a string[] of tags.
```

#### S_Budget — "Comfortable range?"
```
Design: 4 radio-style cards (Under $150, $150–$250, $250–$400, $400+).
Selected card has peachSoft bg + plum left border + filled radio circle.

API: servicesApi.createIntake() with { budget: "$150-$250" }
Maps to budget tiers: under_150 | 150_250 | 250_400 | 400_plus
```

#### S_Estimate — "Your estimate"
```
Design: Masthead (peach) with "$245" large display text + "3h 15m" badge.
SummaryRows for Service, Color level, Length, Add-ons. Warning Note below.

API: servicesApi.createIntake() returns { estimate_low, estimate_high }
The estimate is generated server-side based on service type, length, and budget.
This screen fetches the result of the intake submission.
Note: For color services, there is an estimate_low + estimate_high range.
The "Likely" midpoint is displayed.
```

#### S_Booking — "When suits you?"
```
Design: StylistCard at top (name, role, rate, availability badge).
Calendar grid (7-column, day cells). Available days have a colored dot.
Selected day has plum bg. Below: time slot grid (4-column).
Selected time has plum bg.

API: servicesApi.getAvailability() → { availability: { "2026-06-18": ["10:30", "12:00", "14:00", "16:30"] } }
Then: bookingApi.createAppointment() → POST /api/appointments
Request: { service_id, date, start_time, client_name, client_email, client_phone }
```

#### S_Confirm — "See you Tuesday."
```
Design: Masthead (peach) with "CONF #4281" badge. SummaryRows for When, With,
Service, Estimate, Deposit. Success Note. "Add to calendar" + "Done" buttons.

API: bookingApi.getAppointment() → GET /api/appointments/{id}
No write operation on this screen — it's a summary of the just-created appointment.
```

### 4.2 Intake Desktop Variants (Butter + Sage)

Three desktop screens extend the mobile flow with wider layouts:

#### D_Estimate_Butter
```
Design: Left panel (white) has editorial text + SummaryRows.
Right panel (butter gold) has $245 in display1 at 220px + low/mid/high price rows.
Desktop step rail on far left (fixed sidebar, 220px).

API: Same as S_Estimate — fetches the intake estimate.
The low/mid/high breakdown comes from estimate_low/estimate_high + estimated range.
```

#### D_Booking_Sage
```
Design: Sage-green stylist panel on right (avatar, bio, stats).
Large calendar grid (7-column, desktop width).
Time slot pills in sage green.

API: servicesApi.getAvailability() → fills calendar dots.
bookingApi.createAppointment() on slot selection.
```

#### D_Confirm_Butter
```
Design: Left butter panel (hero) with large "See you Tuesday." headline.
Right white panel with full appointment summary + prep checklist.

API: bookingApi.getAppointment() — fetches confirmation details.
Prep checklist is static copy based on service type.
```

### 4.3 Stylist Dashboard (`StylistApp.tsx`)

The stylist app has 4 main tabs: Today, Clients, Inbox, You.

#### St_Today_Standard — "Five in the chair."
```
Design: Top stats strip (BOOKED 5/6, CHAIR TIME 7h45m, EST $1,290).
Coral "Up Next" ribbon (Mia Chen · 10:30a · Partial highlights + cut).
Scrollable appointment list: time | client+service+note | chevron.
Tag chips: VIP (coral), NEW (butter), REGULAR (cream), CONSULT (sage).
LevelBar: color swatch pair showing L7 → L8.

API: stylistApi.getDashboard() → StylistDashboardDto
Response: { intakes: { new_count, in_review_count, ... },
            today_schedule: DashboardAppointmentDto[],
            upcoming_appointments: DashboardAppointmentDto[] }
```

#### St_Today_Bold — Dark variant
```
Design: Ink background (near-black). Butter hero block with stats strip.
Coral "Up next" bar. Dark cards for each appointment.

API: Same as St_Today_Standard — just a visual variant, same endpoint.
```

#### St_Clients — "Your clients."
```
Design: Search bar (cream, italic placeholder). Filter chips (All, Today, This week, VIPs, Overdue, New).
Grouped list: "TODAY · 5" header + 5 ClientRows. "DUE SOON · 4" + remaining rows.
Each row: Avatar (initials on peach circle) | name + tag chip + service + level + last visit | chevron.

API: stylistApi.getClients() → StylistClientsResponseDto
Response: { clients: StylistClientListItemDto[] }
Each client shows: name, appointment_count, last_appointment_date, upcoming_appointment_date.
```

#### St_ClientDetail — Mia Chen intake brief
```
Design: Back button + "EDIT" in top bar. Hero: large avatar + name + tag.
Stat strip: VISITS / LAST SEEN / BUDGET. Then numbered sections:
01 Color level (L7 → L8 visual with swatches + quote note)
02 Service (Partial highlights + cut · est. $245 · 2h)
03 Condition (RatingBars: Breakage, Split ends, Dryness, Frizz)
04 Photos (3-cell grid)
05 Your Notes (editable textarea)
Action buttons: "Message" (secondary) + "Start session →" (coral primary)

API: stylistApi.getClientDetail(clientId) → StylistClientDetailDto
Response: { client: ClientDto, appointment_count, intake_count,
            recent_intakes: StylistClientIntakeSummaryDto[],
            recent_appointments: StylistClientAppointmentSummaryDto[],
            maintenance_items: MaintenancePlanItemDto[] }
Also: stylistApi.getIntakeDetail(intakeId) for the full intake with photos + review.
```

#### St_Inbox — 3 unread
```
Design: "MARK ALL READ" in top right. Filter chips (All, Unread, Today, Consults).
Thread list: avatar | name+tag+preview text | time badge.
Unread threads: bold name, no italic. Read threads: italic preview.
Unread indicator dot on avatar.

API: stylistApi.getInboxMessages() → (not in current API surface — needs a new endpoint)
Current API has no inbox/messaging endpoint. This is a new requirement.
The existing stylistApi covers appointments and clients, not messaging.
Note: Messaging is a deferred feature. Implement the UI shell now; wire up later.
```

#### St_Thread — Message thread
```
Design: Back button + avatar + name + tag in header.
Context banner: "UPCOMING · IN 12 MIN — Partial highlights + cut · $245"
Messages: alternating left/right bubbles (them = cream, me = coral).
Timestamp below each bubble.
Composer: + attachment button + italic placeholder input + SEND button.

API: (same as St_Inbox — no endpoint yet)
```

#### St_You — Profile
```
Design: Profile card (avatar + name + role + Top 1% badge). Stats strip (RATING / THIS WK / REBOOK).
Nav groups: Business (Services & pricing, Availability, Payouts),
  Your page (Portfolio, Bio & specialties, Reviews),
  App (Notifications, Language, Help & support, Sign out).
Version footer.

API: stylistApi.getMe() → StylistMeDto (display name, email)
Services: servicesApi.getServices() (catalog)
Payouts: (not in current API — new endpoint needed)
```

### 4.4 Client Portal (`ClientPortalApp.tsx`)

#### C_Landing — "Two days until the chair."
```
Design: Wordmark + avatar in top bar.
Peach masthead: "Good morning, Mia" + "Two days until the chair."
Upcoming card: date/time/stylist + service + price + View details + Reschedule buttons.
2-column quick actions grid (Book again / Try someone new).
Last visit snippet: photo tile + service + "View →"

API: portalApi.getAppointments() → PortalAppointmentsResponseDto
portalApi.getMe() → MeResponseDto (client info)
```

#### C_Upcoming — Upcoming detail
```
Design: Back + confirmation number. Peach masthead: "Tuesday. 2:00." + "June 18 · in 2 days"
SummaryRows (With, Service, Duration, Estimate, Where).
Prep checklist (from stylist prep_notes).
Intake summary (client's own responses, read-only). "Edit brief →"
Buttons: Add to calendar / Reschedule / Cancel appointment

API: portalApi.getAppointmentDetail(appointmentId) → PortalAppointmentDetailDto
Response: { appointment, service, photos }
Also: portalApi.getMe() for client info.
```

#### C_History — "Your history."
```
Design: "5 VISITS · SINCE FEB 2024" eyebrow + large "Your history." headline.
2-column stat cards (SPENT / REGULAR).
Year-bucketed timeline: year header + visit rows.
Each row: date (mon/day) + service + stylist + star rating + price + "Rebook →"

API: portalApi.getAppointments() → filtered by client_id (from auth)
portalApi.getIntakes() (for intake-based visits)
```

#### C_Account — Account settings
```
Design: Profile card (avatar + name + "Member since Feb 2024").
Grouped rows: Personal (Name, Phone, Email, Birthday),
  Hair profile (Current level, Allergies, Last chemical, Notes for stylist),
  Payment (Card, Tip default), Preferences (Notifications, Reminders, Marketing).
Danger zone: Sign out / Delete account.

API: portalApi.getMe() → MeResponseDto
portalApi.updateMe() → PATCH /api/clients/me
portalApi.updateNotificationPrefs() → PATCH /api/clients/me/notification-prefs
```

#### C_EditPersonal / C_EditHair / C_EditPreferences
```
Design: Standard edit chrome: ← Back + CANCEL in top bar. EditTitle with eyebrow + large title + sub.
Fields for each section. ToggleRow for booleans. Segmented for reminder timing.
SaveBar at bottom (full-width primary button).

API: portalApi.updateMe() → PATCH /api/clients/me
portalApi.updateHairProfile() → (new endpoint needed or extend updateMe)
portalApi.updateNotificationPrefs() → PATCH /api/clients/me/notification-prefs
```

---

## 5. API Surface Reference

The existing RTK Query API has 7 slices. Every new screen maps to at least one of these:

### 5.1 `servicesApi` — Service catalog + intake creation

```
POST /api/intakes
Request: IntakeCreateRequestDto {
  service_type: "color" | "extensions" | "both"
  hair_length?: string
  hair_density?: string
  hair_texture?: string
  prev_extensions?: string
  color_service?: string
  natural_level?: string
  current_color?: string
  chemical_history?: string[]
  last_chemical?: string
  desired_length?: number
  ext_type?: string
  budget?: string
  maintenance?: string
  deadline?: string
  dream_result?: string
}
Response: IntakeCreateResponseDto { id, estimate_low, estimate_high }

POST /api/intakes/{id}/photos  (FormData: file + slot)
GET  /api/intakes/{id}
GET  /api/intakes  (stylist: list all intakes with review status)

GET  /api/services → ServicesResponseDto
GET  /api/availability?date=YYYY-MM-DD → AvailabilityResponseDto
     Returns: { availability: { "YYYY-MM-DD": ["10:30", "12:00", ...] } }
```

### 5.2 `bookingApi` — Appointment creation + management

```
POST /api/appointments
Request: CreateAppointmentRequestDto {
  intake_id?: string
  service_id: string
  date: string
  start_time: string
  client_name: string
  client_email?: string
  client_phone?: string
}
Response: CreateAppointmentResponseDto { appointment: AppointmentDto }

GET  /api/appointments/{id}
PATCH /api/appointments/{id}  (reschedule, cancel)
POST /api/appointments/{id}/cancel
POST /api/appointments/{id}/photos  (FormData)
```

### 5.3 `portalApi` — Client portal (authenticated client)

```
GET  /api/portal/me → MeResponseDto { client: ClientDto, notification_prefs: NotificationPrefsDto }
PATCH /api/portal/me → UpdateMeRequestDto
PATCH /api/portal/me/notification-prefs → UpdateNotificationPrefsRequestDto

GET  /api/portal/appointments → PortalAppointmentsResponseDto
GET  /api/portal/appointments/{id} → PortalAppointmentDetailResponseDto
POST /api/portal/appointments/{id}/cancel

GET  /api/portal/appointments/{id}/photos
POST /api/portal/appointments/{id}/photos (upload)

GET  /api/portal/maintenance-plan → MaintenancePlanResponseDto
```

### 5.4 `stylistApi` — Stylist dashboard (authenticated stylist)

```
GET  /api/stylist/dashboard → StylistDashboardResponseDto
     Returns: { intakes: { new_count, in_review_count, ... },
                today_schedule: DashboardAppointmentDto[],
                upcoming_appointments: DashboardAppointmentDto[] }

GET  /api/stylist/intakes → StylistIntakesResponseDto
GET  /api/stylist/intakes/{id} → StylistIntakeDetailResponseDto
PATCH /api/stylist/intakes/{id}/review → UpdateStylistIntakeReviewRequestDto

GET  /api/stylist/appointments → StylistAppointmentsResponseDto
GET  /api/stylist/appointments/{id} → StylistAppointmentDetailResponseDto
PATCH /api/stylist/appointments/{id} → UpdateStylistAppointmentRequestDto
POST /api/stylist/appointments/{id}/photos

GET  /api/stylist/clients → StylistClientsResponseDto
GET  /api/stylist/clients/{id} → StylistClientDetailResponseDto

GET  /api/stylist/me → StylistMeDto
```

### 5.5 `authApi` — Authentication

```
POST /api/auth/callback  (OIDC callback)
GET  /api/auth/logout
GET  /api/info → InfoDto (issuer URL, login path, etc.)
```

### 5.6 `stylistView` + `portalView` — Tag-based cache invalidation

Used for RTK Query cache tags (not direct API calls):
- `IntakeList`, `IntakeDetail` — invalidate after intake changes
- `AppointmentList`, `AppointmentDetail` — invalidate after booking changes
- `ClientList`, `ClientDetail` — invalidate after client updates
- `ServiceList` — invalidate after catalog changes

---

## 6. New API Endpoints Needed

The Fringe design introduces UI that the current API doesn't cover:

| Feature | Screen | Needed Endpoint | Priority |
|---|---|---|---|
| Stylist messaging / inbox | St_Inbox, St_Thread | `GET /api/stylist/messages`, `POST /api/stylist/messages` | Deferred |
| Client hair profile editing | C_EditHair | Extend `PATCH /api/portal/me` with `{ hair_profile: {...} }` | Next |
| Stylist payout info | St_You → Payouts | `GET /api/stylist/payouts` | Deferred |
| Mark messages read | St_Inbox | `PATCH /api/stylist/messages/read` | Deferred |
| Intake photo download | St_ClientDetail | Already exists: `GET /api/intakes/{id}` returns photos | ✓ |
| Appointment prep notes | C_Upcoming | Already exists: `prep_notes` on appointment | ✓ |
| Client allergen/profile | C_EditHair | Extend `PATCH /api/portal/me` | Next |

---

## 7. Component Architecture (fringe-ui Package)

### 7.1 Package Structure

```
web/src/fringe-ui/
├── tokens.css                    # CSS custom properties (all FS tokens)
├── theme/
│   ├── tokens.ts                 # JS token export (for inline styles)
│   ├── ThemeProvider.tsx         # Wraps app, injects tokens.css
│   └── useTheme.ts               # Hook: { color, font, type, space, radius, shadow }
├── primitives/
│   ├── Button.tsx                # All button variants
│   ├── Button.stories.tsx
│   ├── Chip.tsx                  # Filter chip
│   ├── Chip.stories.tsx
│   ├── TextField.tsx             # Input + textarea
│   ├── TextField.stories.tsx
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   ├── Segmented.tsx
│   ├── Segmented.stories.tsx
│   ├── Progress.tsx
│   ├── Progress.stories.tsx
│   └── index.ts
├── salon-widgets/
│   ├── RatingBar.tsx             # 5-segment condition bar
│   ├── RatingBar.stories.tsx
│   ├── StylistCard.tsx
│   ├── StylistCard.stories.tsx
│   ├── PhotoTile.tsx
│   ├── PhotoTile.stories.tsx
│   ├── SummaryRow.tsx
│   ├── SummaryRow.stories.tsx
│   ├── DayCell.tsx
│   ├── DayCell.stories.tsx
│   ├── Note.tsx                  # Toast / alert
│   ├── Note.stories.tsx
│   ├── Masthead.tsx              # Peach hero panel
│   ├── Masthead.stories.tsx
│   ├── Section.tsx               # Numbered row section
│   ├── Section.stories.tsx
│   ├── IndexChip.tsx
│   └── index.ts
├── chrome/
│   ├── AppHeader.tsx             # Mobile top bar
│   ├── AppHeader.stories.tsx
│   ├── StatusBar.tsx
│   ├── StatusBar.stories.tsx
│   ├── HomeIndicator.tsx
│   ├── TabBar.tsx                # iOS-style bottom tab bar
│   ├── TabBar.stories.tsx
│   ├── Wordmark.tsx
│   ├── Eyebrow.tsx
│   ├── Rule.tsx
│   └── index.ts
├── layout/
│   ├── IntakeShell.tsx           # Mobile shell for intake steps (step 1-9)
│   ├── IntakeShell.stories.tsx
│   ├── ClientShell.tsx           # Client portal shell (home/history/account)
│   ├── ClientShell.stories.tsx
│   ├── StylistShell.tsx          # Stylist app shell
│   ├── StylistShell.stories.tsx
│   ├── StepRail.tsx              # Desktop sidebar step progress
│   ├── StepRail.stories.tsx
│   └── index.ts
└── index.ts                      # Re-exports everything
```

### 7.2 CSS Custom Properties (tokens.css)

```css
/* === FRINGE DESIGN SYSTEM — CSS TOKENS === */

:root {
  /* === Color === */
  --fringe-ink: #111111;
  --fringe-paper: #ffffff;
  --fringe-cream: #f6efe4;
  --fringe-cream-deep: #efe6d4;
  --fringe-rule: #ebe7df;
  --fringe-soft: #9a958e;
  --fringe-soft-ink: #5b5852;

  --fringe-plum: #6b3a4a;
  --fringe-plum-deep: #4a2431;
  --fringe-peach: #f2b89a;
  --fringe-peach-soft: #faddc9;

  --fringe-coral: #e8573c;
  --fringe-butter: #f4c752;
  --fringe-ochre: #c48a34;
  --fringe-sage: #7a8f6b;
  --fringe-blush: #e6b8a8;

  /* Semantic alias */
  --fringe-success: #7a8f6b;
  --fringe-warn: #c48a34;
  --fringe-danger: #e8573c;

  /* === Font Stacks === */
  --fringe-font-block: 'Anton', 'Oswald', Impact, sans-serif;
  --fringe-font-serif: 'Instrument Serif', Georgia, serif;
  --fringe-font-sans: 'Inter', system-ui, sans-serif;
  --fringe-font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* === Spacing === */
  --fringe-space-0: 0;
  --fringe-space-1: 4px;
  --fringe-space-2: 8px;
  --fringe-space-3: 12px;
  --fringe-space-4: 16px;
  --fringe-space-5: 20px;
  --fringe-space-6: 24px;
  --fringe-space-7: 32px;
  --fringe-space-8: 40px;
  --fringe-space-9: 56px;
  --fringe-space-10: 72px;

  /* === Border Radius === */
  --fringe-radius-none: 0;
  --fringe-radius-sm: 2px;
  --fringe-radius-md: 6px;
  --fringe-radius-lg: 12px;
  --fringe-radius-pill: 999px;

  /* === Shadows === */
  --fringe-shadow-sm: 0 2px 6px rgba(17,17,17,0.06);
  --fringe-shadow-md: 0 8px 24px rgba(17,17,17,0.08);
  --fringe-shadow-lg: 0 24px 60px rgba(17,17,17,0.14);
}

/* === Utility Classes === */
.fringe-display { font-family: var(--fringe-font-block); text-transform: uppercase; }
.fringe-editorial { font-family: var(--fringe-font-serif); font-style: italic; }
.fringe-body { font-family: var(--fringe-font-sans); }
.fringe-eyebrow { font-family: var(--fringe-font-mono); text-transform: uppercase; letter-spacing: 1.8px; font-size: 10px; font-weight: 600; }

/* Apply to body */
body {
  background: var(--fringe-cream);
  color: var(--fringe-ink);
  font-family: var(--fringe-font-sans);
}

/* Default card */
.fringe-card {
  background: var(--fringe-cream);
  padding: var(--fringe-space-4) calc(var(--fringe-space-4) + 2px);
}

/* Primary button */
.fringe-btn-primary {
  font-family: var(--fringe-font-block);
  text-transform: uppercase;
  background: var(--fringe-plum);
  color: var(--fringe-paper);
  border: none;
  cursor: pointer;
}

/* Peach hero */
.fringe-hero {
  background: var(--fringe-peach);
  padding: var(--fringe-space-6) var(--fringe-space-5);
}
```

### 7.3 tokens.ts (JS export for inline styles)

```typescript
// fringe-ui/tokens.ts — mirrors the FS object as TypeScript constants

export const color = {
  ink: '#111111', paper: '#ffffff', cream: '#f6efe4', creamDeep: '#efe6d4',
  rule: '#ebe7df', soft: '#9a958e', softInk: '#5b5852',
  plum: '#6b3a4a', plumDeep: '#4a2431', peach: '#f2b89a', peachSoft: '#faddc9',
  coral: '#e8573c', butter: '#f4c752', ochre: '#c48a34', sage: '#7a8f6b',
  blush: '#e6b8a8', success: '#7a8f6b', warn: '#c48a34', danger: '#e8573c',
} as const;

export const font = {
  block: '"Anton", Impact, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  sans: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

export const type = {
  display1: { fontFamily: font.block, fontSize: 120, lineHeight: 0.85, letterSpacing: -2, textTransform: 'uppercase' },
  display2: { fontFamily: font.block, fontSize: 72, lineHeight: 0.9, letterSpacing: -1, textTransform: 'uppercase' },
  display3: { fontFamily: font.block, fontSize: 54, lineHeight: 0.9, letterSpacing: -0.5, textTransform: 'uppercase' },
  h1: { fontFamily: font.block, fontSize: 36, lineHeight: 1, letterSpacing: 0.3, textTransform: 'uppercase' },
  h2: { fontFamily: font.block, fontSize: 26, lineHeight: 1, letterSpacing: 0.3, textTransform: 'uppercase' },
  h3: { fontFamily: font.block, fontSize: 20, lineHeight: 1.05, letterSpacing: 0.5, textTransform: 'uppercase' },
  editorialLg: { fontFamily: font.serif, fontSize: 28, lineHeight: 1.1, fontStyle: 'italic' },
  editorial: { fontFamily: font.serif, fontSize: 19, lineHeight: 1.45, fontStyle: 'italic' },
  body: { fontFamily: font.sans, fontSize: 14, lineHeight: 1.5, fontWeight: 400 },
  bodyLg: { fontFamily: font.sans, fontSize: 16, lineHeight: 1.5, fontWeight: 400 },
  bodySm: { fontFamily: font.sans, fontSize: 12, lineHeight: 1.4, fontWeight: 400 },
  eyebrow: { fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: 600 },
  meta: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' },
} as const;

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 56, 10: 72 } as const;
export const radius = { none: 0, sm: 2, md: 6, lg: 12, pill: 999 } as const;
export const shadow = {
  sm: '0 2px 6px rgba(17,17,17,0.06)',
  md: '0 8px 24px rgba(17,17,17,0.08)',
  lg: '0 24px 60px rgba(17,17,17,0.14)',
} as const;
```

---

## 8. Implementation Plan

### Phase 1: Foundation (Do first)
1. **Create `fringe-ui` package** at `web/src/fringe-ui/`
2. **Install tokens.css** in `index.html` (or as a Vite import)
3. **Port all FS primitives** to proper React components with TypeScript
4. **Add Google Fonts** (Anton, Instrument Serif, Inter, JetBrains Mono)
5. **Create Storybook stories** for every component (default + themed + unstyled variants)
6. **Build `layout/` shell components**: `IntakeShell`, `ClientShell`, `StylistShell`

### Phase 2: Client Booking App
1. **Replace IntakeColorPage, IntakeExtPage, IntakeColorPage** with Fringe screens
2. **Wire `servicesApi.createIntake()`** to the intake form
3. **Build estimate display** (S_Estimate + D_Estimate_Butter)
4. **Build booking calendar** (S_Booking + D_Booking_Sage)
5. **Build confirmation screen** (S_Confirm + D_Confirm_Butter)
6. **Add photo upload** with `servicesApi.uploadIntakePhoto()`

### Phase 3: Stylist Dashboard
1. **Replace `SchedulePage`** with `St_Today_Standard` / `St_Today_Bold`
2. **Replace `ClientsPage`** with `St_Clients` + `St_ClientDetail`
3. **Wire `stylistApi.getDashboard()`** to the Today view
4. **Wire `stylistApi.getClients()`** to the Clients list
5. **Wire `stylistApi.getClientDetail()`** to the detail view
6. **Wire `stylistApi.getIntakeDetail()`** to the intake brief
7. **Inbox/Thread** — UI shell only, no backend (deferred)

### Phase 4: Client Portal
1. **Replace `PortalHomePage`** with `C_Landing`
2. **Replace `PortalAppointmentsPage`** with `C_Upcoming`
3. **Replace `PortalProfilePage`** with `C_Account`
4. **Build edit screens** (`C_EditPersonal`, `C_EditHair`, `C_EditPreferences`)
5. **Wire `portalApi`** to all portal screens
6. **Build `C_History`** from existing appointment data

### Phase 5: Polish
1. Dark variant (St_Today_Bold — ink bg + butter hero)
2. Desktop responsive layouts for all intake screens
3. Add the hair history hi-fi variant (history-hifi.jsx + history-responsive.jsx)
4. Validation: every form validates before submit
5. Error states: toast/Note component for all API error paths
6. Loading states: skeleton/placeholder for all async screens

---

## 9. Key Design Decisions

### Decision 1: CSS Custom Properties vs Inline Styles

The Fringe design system source uses **inline styles** (React JSX objects). For production, we convert these to **CSS custom properties** with optional inline overrides for dynamic values. This gives:
- Better SSR/maintainability (no scattered inline styles)
- Theme switching capability (swap token values at runtime)
- Storybook compatibility (CSS variables work in isolated iframe)

**But:** Some components need dynamic values (e.g., `width` from prop, color from state). These get inline style overrides on top of the CSS variable base.

### Decision 2: Start Afresh (No Legacy Migration)

The existing component library uses a completely different design language (coral/teal palette, sans-serif everything, different component shapes). There is zero overlap between the old and new component API. Migrating is not practical — it's faster and cleaner to delete the old `web/src/stylist/components/` and rebuild.

The pages (`web/src/stylist/pages/`) share the same RTK Query API layer, so only the view layer needs replacing.

### Decision 3: Storybook Structure

Every component gets three Storybook stories (following the `react-modular-themable-storybook` skill):
- **Default**: Shows the component with Fringe tokens applied
- **Themed**: Shows the component with different accent colors (butter, sage, coral)
- **Unstyled**: Shows the component with no Fringe styles (for CSS-in-JS isolation tests)

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  component: ComponentName,
};
export default meta;

// Default — Fringe plum accent
export const Default: StoryObj = { args: { ... } };

// Themed variants
export const ButterAccent: StoryObj = {
  args: { accent: '#f4c752' },
  decorators: [(story) => (
    <div style={{ '--fringe-plum': '#f4c752' } as React.CSSProperties}>{story()}</div>
  )],
};
```

### Decision 4: Intake Flow Routing

The intake flow branches based on `service_type`:
- `"color"`: S_Service → S_Color → S_History → S_Budget → S_Estimate → S_Booking → S_Confirm
- `"extensions"`: S_Service → S_Extensions → S_History → S_Budget → S_Estimate → S_Booking → S_Confirm
- `"both"`: S_Service → S_Color → S_Extensions → S_Photos → S_History → S_Budget → S_Estimate → S_Booking → S_Confirm

Steps are numbered 1-9 but the actual step count varies by service type. S_Photos appears in the full "both" flow.

### Decision 5: The "Wireframe Screens" (screens.jsx) — Not Implementation Targets

The `screens.jsx` file contains low-fi wireframe variants (sketchy hand-drawn aesthetic, three variants per screen, "handwritten" font for annotations). These are **UX exploration** artifacts, not production-ready designs. Use them as reference for interaction patterns (e.g., "variant 0 uses list cards, variant 1 uses icon tiles, variant 2 uses segmented chips") but do not copy them verbatim. The final hi-fi designs in `intake-fs.jsx`, `stylist-dashboard.jsx`, `client-pages.jsx`, and `client-edit.jsx` are the authoritative implementation targets.

### Decision 6: API Backwards Compatibility

All new screens use the **same RTK Query hooks** (`useCreateIntakeMutation`, `useGetDashboardQuery`, etc.). There is no change to the API surface except:
- New optional fields added to existing DTOs as needed
- New hair profile fields on `UpdateMeRequestDto`

No new API endpoints required for Phase 1-4 (except messaging which is deferred).

---

## 10. File References

### Source design files (read-only reference)
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/.../sources/design-system.jsx` — Token definitions + all FS primitives
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/.../sources/intake-fs.jsx` — Mobile intake screens
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/.../sources/intake-desktop.jsx` — Desktop intake variants
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/.../sources/stylist-dashboard.jsx` — Stylist Today (2 variants)
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/.../sources/stylist-pages.jsx` — Stylist Clients/Inbox/You
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/.../sources/client-pages.jsx` — Client home/upcoming/history/account
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/.../sources/client-edit.jsx` — Client edit screens

### Existing codebase (implementation targets)
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/store/api/` — All 7 API slices
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/pages/` — 33 existing page components
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/components/` — 30+ existing components
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistApp.tsx` — Stylist shell
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientBookingApp.tsx` — Client booking shell
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx` — Client portal shell

### Output locations (to create)
- `web/src/fringe-ui/tokens.css`
- `web/src/fringe-ui/tokens.ts`
- `web/src/fringe-ui/theme/ThemeProvider.tsx`
- `web/src/fringe-ui/primitives/*.tsx` (11 primitive components)
- `web/src/fringe-ui/salon-widgets/*.tsx` (9 salon-specific components)
- `web/src/fringe-ui/chrome/*.tsx` (6 chrome components)
- `web/src/fringe-ui/layout/*.tsx` (4 shell components)
- `web/src/fringe-ui/index.ts`

---

*End of guide. See also: `analysis/01-screens-api-mapping-reference.md` and `analysis/02-fringe-ui-component-architecture.md` for detail.*