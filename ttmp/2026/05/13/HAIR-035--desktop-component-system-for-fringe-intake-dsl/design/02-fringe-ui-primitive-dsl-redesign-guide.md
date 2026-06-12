---
Title: Fringe UI-Primitive DSL Redesign Guide
Ticket: HAIR-035
Status: active
Topics:
    - dsl
    - frontend
    - design-system
    - desktop
    - intake
    - storybook
DocType: design
Intent: long-term
Owners: []
RelatedFiles:
    - Path: web/src/page-dsl/schema.ts
      Note: Current DSL schema — 29 domain-specific node kinds to replace
    - Path: web/src/page-dsl/render.tsx
      Note: Current renderer — will be rewritten for UI primitives
    - Path: web/src/page-dsl/builder.ts
      Note: Current builder — will be rewritten for UI primitives
    - Path: pkg/dslgoja/modules_dsl.go
      Note: Goja JS module — must mirror the new builder helpers
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Current flow script — will be rewritten using UI primitives
    - Path: web/src/organisms/DesktopShell/DesktopShell.tsx
      Note: Desktop shell committed in Phase 1
    - Path: web/src/fringe-ui/tokens/index.ts
      Note: Design tokens shared by all rendering paths
ExternalSources: []
Summary: 'Exhaustive intern-facing redesign guide for the Fringe DSL: replacing 29 domain-specific node kinds with ~15 UI primitives, supporting mobile and desktop from the same JSON, with full primitive catalog, rendering rules, migration plan, and worked examples.'
LastUpdated: 2026-05-13
WhatFor: "Understand and implement the UI-primitive DSL redesign. Covers every primitive's props, rendering rules for mobile and desktop, the migration from old node kinds, and the implementation plan."
WhenToUse: "Use when implementing the new primitives, migrating flow scripts, or building desktop rendering paths."
---

# Fringe UI-Primitive DSL Redesign Guide

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Philosophy](#design-philosophy)
3. [What Changes and What Stays](#what-changes-and-what-stays)
4. [Primitive Catalog](#primitive-catalog)
5. [Rendering Rules: Mobile vs Desktop](#rendering-rules)
6. [Shell System](#shell-system)
7. [Worked Example: Full Intake Flow](#worked-example)
8. [Migration Map: Old → New](#migration-map)
9. [Implementation Plan](#implementation-plan)
10. [File Reference](#file-reference)

---

## Executive Summary

The current Fringe DSL has **29 node kinds**. Of those, 13 are **domain-specific** — they bake "hair salon" concepts into the schema (`serviceOption`, `budgetOption`, `timeSlot`, `colorLevelBar`, `lengthSilhouette`, `stylistCard`, etc.). This creates three problems:

1. **The DSL can't compose other domains.** A restaurant menu, a doctor intake, a survey — they'd need their own node kinds.
2. **Desktop adaptation is blocked.** The same `serviceOption` needs to look like a vertical card on mobile and a horizontal card on desktop, but the node kind doesn't carry enough structural information.
3. **Node kind proliferation.** Every new UX pattern requires a new domain kind. `serviceOption` and `budgetOption` are the same selectable-card pattern with different data.

**The redesign replaces domain-specific kinds with ~15 UI primitives** — generic interaction patterns like `selectable`, `scale`, `tagInput`, `kvRow`. Each primitive describes a **UX affordance** (what the user can do), not a business concept (what the data means).

The domain lives in the **data**, not the schema. A `selectable` with `{title: "Cut", badge: "$80+"}` is a haircut on a salon page, a pasta dish on a restaurant menu, or a shipping speed on checkout. The DSL doesn't care.

**Desktop vs mobile becomes a pure rendering concern.** The same JSON renders at mobile density (compact, single column) or desktop density (spacious, two-column with context panels) depending on the shell. No viewport-specific node kinds. No region metadata. The renderer decides layout from the shell kind and the primitive type.

---

## Design Philosophy

### Principle 1: Primitives describe affordances, not content

```
❌ serviceOption — "a hair service you can pick"
✅ selectable   — "an item the user can select or deselect"
```

The flow script provides the *meaning* (title="Cut", badge="$80+"). The primitive provides the *behavior* (tap to select, visual feedback, group selection modes).

### Principle 2: Same JSON, different density

The page JSON is viewport-agnostic. The shell determines rendering density:

- **Mobile** (`shell.kind = "intake"`): compact vertical stack, touch targets, sticky CTA footer
- **Desktop** (`shell.kind = "desktop"`): spacious two-column, larger type, accent-colored context panels

A `selectable` is always a selectable. It just looks different.

### Principle 3: Composition over enumeration

Instead of `serviceOptionGroup`, `budgetOptionGroup`, `timeSlotGroup` (three kinds for the same pattern), we have one `selectableGroup` that composes `selectable` children. The group controls layout (columns, gap, selection mode).

### Principle 4: Enrich data, not layout

If the desktop needs more detail than the mobile (e.g., a price breakdown instead of a range string), the flow script emits **richer structured data** — not layout instructions. Both renderers use the same data at their own density.

---

## What Changes and What Stays

### Stays unchanged (16 kinds)

These are already viewport-agnostic UI primitives:

| Kind | Role |
|---|---|
| `text` | Generic text with variant styles |
| `spacer` | Vertical space |
| `stack` | Flex column container |
| `grid` | CSS grid container |
| `eyebrow` | Small-caps label |
| `button` | Clickable action |
| `note` | Inline callout (info/warn/success/danger) |
| `card` | Bordered container with optional accent |
| `rule` | Horizontal divider |
| `progress` | Progress bar |
| `chip` | Single tag/chip |
| `chipGroup` | Group of chips with multi-select |
| `segmented` | Single-select tab control |
| `masthead` | Page header with title/eyebrow |
| `dayCell` | Single calendar day cell |
| `dayPickerGrid` | Calendar grid of day cells |

### Replaced by UI primitives (13 kinds → 6 new)

| Old kind(s) | New primitive | Why |
|---|---|---|
| `serviceOption`, `budgetOption`, `timeSlot`, `lengthSilhouette` | `selectable` | Same UX pattern: selectable item with title, subtitle, badge |
| `serviceOptionGroup`, `budgetOptionGroup`, `timeSlotGroup` | `selectableGroup` | Same UX pattern: group of selectables with mode and layout |
| `summaryRow` | `kvRow` | Key-value display with optional action |
| `ratingBar`, `colorLevelBar` | `scale` | Configurable N-step scale input |
| `photoTile` | `uploadTile` | Upload slot with filled/empty state |
| `stylistCard` | `personCard` | Person display with avatar, name, metadata |

### New additions (2 kinds)

| New kind | Role | Why needed |
|---|---|---|
| `stat` | Display number with label — compact or hero scale | Desktop needs hero prices ($245 at 220px). Mobile can show the same stat inline. Replaces `summaryRow("Range", "$220–$420")` with structured data. |
| `calendarGrid` | Full month calendar with availability | Desktop needs a full 7-column month view. The existing `dayPickerGrid` is compact/mobile-only. Both render the same day data. |

### Net result: 29 → 24 kinds

But the 24 are all **generic UI primitives** — no domain knowledge baked in.

---

## Primitive Catalog

Each primitive has: TypeScript props interface, rendering rules for mobile and desktop, and a worked example.

### `selectable` — Selectable Item

A single item the user can select or deselect. The fundamental building block for lists of choices.

```ts
interface SelectableProps {
  title: string;          // Primary label
  subtitle?: string;      // Secondary description
  badge?: string;         // Right-aligned label (price, count, status)
  image?: string;         // Optional image/thumbnail slot
  selected?: boolean;     // Current selection state
  disabled?: boolean;     // Prevents interaction
  value?: string;         // Selection value (for group tracking)
}
```

**Mobile rendering:** Full-width card with 14px padding. Title left, badge right. Subtitle below title in muted color. Selected state: cream background + plum left border.

**Desktop rendering:** Similar card but larger (18px padding, bigger type). In a two-column context, `selectable` cards sit in the main content area. Badge gets more visual weight.

Example:
```js
// Hair salon service
n.selectable("Cut", { subtitle: "Trim · restyle · bangs", badge: "$80+", value: "cut" })

// Restaurant menu item
n.selectable("Carbonara", { subtitle: "Guanciale · pecorino · egg", badge: "$18", value: "carbonara" })

// Shipping option
n.selectable("Express", { subtitle: "1–2 business days", badge: "$12.99", value: "express" })
```

### `selectableGroup` — Group of Selectables

Manages selection behavior over a set of selectable items.

```ts
interface SelectableGroupProps {
  options: Array<{
    value: string;
    title: string;
    subtitle?: string;
    badge?: string;
    image?: string;
    disabled?: boolean;
  }>;
  value: string | string[] | null;  // Single value or array for multi-select
  mode?: "single" | "multiple";     // Selection mode
  columns?: number;                  // Grid columns for layout
  gap?: number;                      // Gap between items
}
```

**Mobile rendering:** Vertical stack (columns=1) by default. Multi-select shows checkmarks.

**Desktop rendering:** If columns > 1, renders as CSS grid. Wider cards. If only 1 column, vertical stack with more generous spacing.

Example:
```js
// Hair services — single select, vertical
n.selectableGroup(serviceOptions, "highlights", { mode: "single" })

// Budget options — single select, 2 columns
n.selectableGroup(budgetOptions, "flexible", { mode: "single", columns: 2 })

// Toppings — multi select
n.selectableGroup(toppingOptions, ["olives", "mushrooms"], { mode: "multiple" })
```

### `scale` — Configurable Scale Input

An N-step scale the user can set. Replaces both ratingBar (1–5 stars) and colorLevelBar (1–10 levels).

```ts
interface ScaleProps {
  value: number;          // Current value
  min?: number;           // Minimum (default 1)
  max?: number;           // Maximum (default 5)
  step?: number;          // Step size (default 1)
  label?: string;         // Display label
  labels?: string[];      // Labels per step (e.g. ["Light", "Medium", "Heavy"])
  interactive?: boolean;  // Can user change it?
  variant?: "dots" | "bar" | "swatches";  // Visual style
}
```

**Mobile rendering:** Dot row or compact bar. `variant: "dots"` for ratings, `"bar"` for level indicators.

**Desktop rendering:** Wider spacing, larger touch/click targets. `variant: "swatches"` shows color swatches for color levels.

Example:
```js
// Damage rating (1–5 dots)
n.scale(2, { max: 5, label: "Damage", interactive: true })

// Hair color level (1–10 swatches)
n.scale(7, { min: 1, max: 10, label: "Current level", variant: "swatches" })

// Satisfaction (1–10 bar)
n.scale(8, { max: 10, label: "Satisfaction", variant: "bar" })
```

### `kvRow` — Key-Value Row

A single key-value pair with optional action.

```ts
interface KvRowProps {
  label: string;          // Key (left side)
  value: string;          // Value (right side)
  editable?: boolean;     // Shows edit affordance
  tone?: string;          // Optional color tone
}
```

**Mobile rendering:** Single row. Label in mono caps, value in bold. Edit icon if editable.

**Desktop rendering:** Same pattern with more spacing. In a desktop context, a group of kvRows can be pulled into the accent panel as a receipt-style summary.

Example:
```js
n.kvRow("Service", "Highlights", { editable: true })
n.kvRow("Estimate", "$245 · 3h 15m")
n.kvRow("Location", "842 N Ada")
```

### `stat` — Display Number

A numeric display that scales from compact to hero size based on rendering context.

```ts
interface StatProps {
  value: string;          // The number or value to display
  label?: string;         // Label above (e.g. "ESTIMATED · USD")
  subtitle?: string;      // Subtitle below (e.g. "3 hours, 15 minutes")
  variant?: "compact" | "hero";  // Rendering hint
  accent?: string;        // Background color for hero variant
}
```

**Mobile rendering:** `compact` by default — label + value + subtitle in a small card or inline.

**Desktop rendering:** Can render as `hero` — massive display-scale number (150–220px) with accent background, used in the context panel.

Example:
```js
// Price stat — compact on mobile, hero on desktop context panel
n.stat("$245", {
  label: "ESTIMATED · USD",
  subtitle: "3 hours, 15 minutes",
})

// Rating stat
n.stat("4.9", { label: "RATING", subtitle: "320 reviews" })
```

### `uploadTile` — Upload Slot

A single upload slot with filled/empty states.

```ts
interface UploadTileProps {
  label: string;          // "Front", "Side", "Back"
  filled?: boolean;       // Whether photo has been added
  disabled?: boolean;
  value?: string;         // For action routing
}
```

**Mobile rendering:** Small square tile in a 3-column grid. Empty shows camera icon + label. Filled shows thumbnail.

**Desktop rendering:** Larger tile with drag-and-drop support. Wider grid (up to 4 columns). Same states.

Example:
```js
n.uploadTile("Front", { filled: true, value: "front" })
n.uploadTile("Side", { value: "side" })
```

### `personCard` — Person Display

Displays a person with avatar, name, role, and optional metadata.

```ts
interface PersonCardProps {
  name: string;
  role?: string;          // "Senior colorist", "Chef", "Doctor"
  initial?: string;       // Avatar letter (defaults to first char of name)
  image?: string;         // Optional avatar image URL
  badge?: string;         // "$180+" or "Available Tue"
  stats?: Array<{ label: string; value: string }>;  // Key-value pairs
  alternatives?: Array<{ name: string; role: string; badge: string }>;
}
```

**Mobile rendering:** Compact horizontal card. Avatar left, name/role center, badge right.

**Desktop rendering:** Can expand to a full detail panel with stats list and alternatives. The desktop renderer pulls this into the context panel automatically when present.

Example:
```js
// Stylist
n.personCard("Nadia Rivera", {
  role: "Senior colorist · lived-in blonde",
  badge: "$180+",
  stats: [
    { label: "STARTING", value: "$180+" },
    { label: "BOOKED", value: "4.9 ★ · 320" },
    { label: "SPEAKS", value: "EN · ES" },
  ],
  alternatives: [
    { name: "Josephine L.", role: "Colorist", badge: "$160+" },
  ],
})

// Doctor
n.personCard("Dr. Sarah Chen", {
  role: "Dermatologist",
  badge: "Next: Tue 2pm",
  stats: [
    { label: "SPECIALTY", value: "Medical dermatology" },
    { label: "RATING", value: "4.8 ★ · 540" },
  ],
})
```

### `calendarGrid` — Full Month Calendar

A full 7-column month grid with day cells. Extends the existing `dayPickerGrid` with richer day data.

```ts
interface CalendarGridProps {
  year: number;
  month: number;
  days: Array<{
    day: number;
    date: string;         // ISO date "2026-06-18"
    selected?: boolean;
    disabled?: boolean;
    isPast?: boolean;
    hasSlots?: boolean;
    slotCount?: number;
    dot?: boolean;         // Mobile-only: indicator dot
  }>;
  value?: string | null;  // Selected date
  columns?: number;       // Mobile: compact (1 col scroll), Desktop: 7 (full grid)
}
```

**Mobile rendering:** Compact grid (7 small columns or scrollable week). Days are small touch targets. `dot` prop for availability indicator.

**Desktop rendering:** Full 7-column month grid. Days are larger with availability badges ("3 OPEN" / "SELECTED"). Month navigation chevrons.

Example:
```js
n.calendarGrid(2026, 6, dayData, "2026-06-18")
```

### Unchanged Primitives (Quick Reference)

| Primitive | Props | Notes |
|---|---|---|
| `text(text, { variant, style })` | Variants: `"body"`, `"editorial"`, `"h3"` | Desktop renders `editorial` at larger scale |
| `spacer(height)` | Pixel height | Same on both viewports |
| `stack({ gap, direction }, ...children)` | Flex container | Same |
| `grid(columns, { gap }, ...children)` | CSS grid | Desktop may widen columns |
| `eyebrow(children, { color })` | Small-caps label | Same |
| `button(children, { variant, size })` | `primary`/`secondary`/`ghost` | Desktop uses wider buttons |
| `note(children, { tone })` | `info`/`warn`/`success`/`danger` | Same |
| `card({ accent }, ...children)` | Container with optional left accent | Same |
| `rule({ color, thick })` | Horizontal divider | Same |
| `progress(value, { max, color })` | Progress bar | Same |
| `chip(children, { selected })` | Single tag | Same |
| `chipGroup(options, value, { selectionMode })` | Multi-select tags | Same |
| `segmented(options, value)` | Single-select tabs | Same |
| `masthead({ title, eyebrow, compact })` | Page header | Desktop: larger scale |
| `dayCell(day, { selected, disabled, dot })` | Single day | Used inside calendarGrid |

---

## Rendering Rules: Mobile vs Desktop {#rendering-rules}

The rendering system has **one renderer** that produces different output density based on the shell kind. The logic is:

```
DslPageRenderer(page, context)
  → inspect page.shell.kind
    → "intake"   = IntakeShell (mobile chrome)
    → "desktop"  = DesktopShell (top nav + step rail)
    → "bare"     = plain div
  → render each node via renderNode(node, ctx, shellKind)
    → each primitive has a mobile and desktop rendering path
```

### How a primitive chooses its rendering path

Each primitive's render case in `render.tsx` receives the shell context implicitly through the `DslRenderContext`. The renderer uses a simple helper:

```ts
function isDesktop(page: DslPage): boolean {
  return page.shell.kind === "desktop";
}
```

Inside `renderNode`, each case checks this and adjusts:

```ts
// Pseudocode for selectable rendering
case "selectable": {
  const mobileStyle = {
    padding: 14, marginBottom: 8,
    background: selected ? color.cream : "transparent",
    borderLeft: selected ? `3px solid ${color.plum}` : "none",
  };
  const desktopStyle = {
    padding: 18, marginBottom: 10,
    background: selected ? color.cream : color.creamDeep,
    borderLeft: selected ? `3px solid ${accent}` : "none",
    fontSize: 18,  // larger type
  };
  const style = isDesktop ? desktopStyle : mobileStyle;
  return <div style={style}>...</div>;
}
```

### Desktop composition rules

The desktop renderer applies these rules automatically:

| Primitive | Mobile placement | Desktop placement |
|---|---|---|
| `selectable`, `selectableGroup` | Full-width in content area | Full-width in left column |
| `scale` | Inline in content area | Inline in left column, wider |
| `tagInput` (chipGroup) | Inline in content area | Inline in left column |
| `segmented` | Full-width tab bar | Full-width in left column |
| `kvRow` | Stacked in content area | Stacked in left column |
| `stat` | Inline compact value | **Pulled into right context panel as hero** |
| `personCard` | Compact card in content area | **Expanded into right context panel** |
| `uploadTile` | 3-column grid in content area | 3–4 column grid in left column, larger |
| `calendarGrid` | Compact 7-col grid | Full 7-col grid in left column |
| `note`, `card`, `rule` | In content area | In left column |
| `text` (editorial) | 17px serif italic | **Left column display headline** (48–76px) |
| `text` (body) | 14px body | 16px body |
| `button` | In CTA footer | **In right context panel or inline** |
| `masthead` | Page title area | **Left column heading** |

### The desktop "context panel" composition

The desktop two-column layout is composed by the **DesktopShell + renderer**, not by the DSL. The renderer identifies nodes that belong in the right-side context panel:

1. **`stat`** nodes — rendered as hero numbers with accent background
2. **`personCard`** nodes — rendered as expanded detail panels
3. **`button`** nodes that are the primary CTA — rendered at the bottom of the context panel
4. **`kvRow`** groups inside a `card` — rendered as receipt-style summaries in the context panel

The renderer does this by **scanning the node list** before rendering. It partitions nodes into:
- `mainNodes` — rendered in the left column
- `contextNodes` — rendered in the right accent panel

```ts
function partitionForDesktop(nodes: DslNode[]): { main: DslNode[], context: DslNode[] } {
  const main: DslNode[] = [];
  const context: DslNode[] = [];
  for (const node of nodes) {
    switch (node.kind) {
      case "stat":
      case "personCard":
        context.push(node);
        break;
      case "card":
        // Cards containing kvRows go to context if they have an accent
        if (node.props?.accent && node.children?.some(c => c.kind === "kvRow")) {
          context.push(node);
        } else {
          main.push(node);
        }
        break;
      default:
        main.push(node);
    }
  }
  return { main, context };
}
```

**This is the key insight**: the partitioning is driven by **semantic meaning** (stats are summary data, personCards are context), not by layout metadata. The flow script just emits the right data primitives, and the desktop renderer knows what to pull into the accent panel.

---

## Shell System

### Shells wrap content with viewport-appropriate chrome.

| Shell kind | Chrome | Used for |
|---|---|---|
| `intake` | Status bar + header + progress bar + eyebrow/title + sticky CTA footer | Mobile intake flow |
| `desktop` | TopNav + DesktopStepRail + content area | Desktop intake flow |
| `bare` | Plain div | Experiments, embeds, tests |

### Shell props are shared between mobile and desktop

The flow script emits the same shell props regardless of viewport:

```json
{
  "shell": {
    "kind": "intake",
    "props": {
      "step": 1,
      "total": 9,
      "eyebrow": "Chapter I · The Ask",
      "title": "What brings you in?",
      "accent": "butter"
    }
  }
}
```

Both renderers use `step`, `total`, `eyebrow`, `title`. The mobile renderer puts them in the header area. The desktop renderer puts `step/total` in the StepRail and `eyebrow/title` in the left column heading. The `accent` prop controls the StepRail active dot color and the context panel background.

**The shell kind is the only viewport-specific thing in the JSON.** The frontend decides the shell kind based on viewport width (or the server provides the right shell based on the requesting device). This is a single string change — the rest of the JSON is identical.

---

## Worked Example: Full Intake Flow {#worked-example}

Here is the complete 7-step intake flow rewritten with UI primitives. This is what `intake.flow.js` would look like.

### Data (unchanged)

```js
const serviceOptions = [
  { value: "cut", title: "Cut", subtitle: "Trim · restyle · bangs", badge: "$80+" },
  { value: "highlights", title: "Highlights", subtitle: "Partial · full · balayage", badge: "$180+" },
  { value: "gloss", title: "Gloss refresh", subtitle: "Tone · shine · maintenance", badge: "$120+" },
];

const toneOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "dimensional", label: "Dimensional" },
  { value: "low-maintenance", label: "Low upkeep" },
];

const budgetOptions = [
  { value: "under-200", title: "Under $200", subtitle: "Refresh, trim, gloss, or maintenance." },
  { value: "200-350", title: "$200–$350", subtitle: "Most color refresh and partial highlight plans." },
  { value: "350-plus", title: "$350+", subtitle: "Transformations, extensions, and multi-step color." },
  { value: "flexible", title: "Flexible", subtitle: "Show me the best plan first." },
];
```

### Step 1: Service

```js
function serviceStep(ctx) {
  return page("intake-service", "Service")
    .intake({
      step: 1, total: 7,
      eyebrow: "Chapter I · The Ask",
      title: "What brings you in?",
      accent: "butter",
    })
    .add(
      n.text("Pick one to start — you can add more later.", {
        variant: "editorial",
        style: { marginBottom: 16 },
      }).id("intro"),
      n.segmented([
        { value: "cut", label: "Cut" },
        { value: "color", label: "Color" },
        { value: "extensions", label: "Extensions" },
      ], ctx.state.category, {
        actions: { change: ctx.action("setCategory", function(e) { ctx.state.category = e.value; return render(ctx); }) },
        style: { marginBottom: 16 },
      }).id("category-tabs"),
      n.selectableGroup(serviceOptions, ctx.state.service, {
        mode: "single",
        actions: { change: ctx.action("setService", function(e) { ctx.state.service = e.value; return render(ctx); }) },
      }).id("service-options"),
    )
    .toJSON();
}
```

**Mobile renders:** eyebrow + title in header, editorial text, segmented tabs, vertical selectable cards.
**Desktop renders:** step rail shows "01 Service" with butter dot, left column gets editorial text + tabs + selectables, right column is empty (no stat or personCard to pull).

### Step 5: Estimate

This is the most interesting step because desktop shows rich context.

```js
function estimateStep(ctx) {
  const range = estimateRange(ctx);
  const [low, high] = range.split("–").map(s => s.replace("$", ""));
  const likely = Math.round((Number(low) + Number(high)) / 2);

  return page("intake-estimate", "Estimate")
    .intake({
      step: 5, total: 7,
      eyebrow: "Chapter V · Preview",
      title: "Your working estimate",
      accent: "butter",
    })
    .add(
      n.stat("$" + likely, {
        label: "ESTIMATED · USD",
        subtitle: "Based on your selections.",
      }).id("estimate-hero"),
      n.card({ accent: "plum" },
        n.kvRow("Service", selectedServiceName(ctx), { editable: true, actions: { edit: editAction(ctx, "editService", "service") } }).id("e-service"),
        n.kvRow("Tone", ctx.state.tones.join(", ") || "Not sure yet", { editable: true }).id("e-tones"),
        n.kvRow("Photos", String(photoCount(ctx)), { editable: true }).id("e-photos"),
        n.kvRow("Budget", ctx.state.budget, { editable: true }).id("e-budget"),
        n.kvRow("Range", range).id("e-range"),
      ).id("estimate-card"),
      n.note("Final pricing is confirmed after stylist review.", { tone: "info" }).id("estimate-note"),
    )
    .toJSON();
}
```

**Mobile renders:** stat as compact inline value ("Est. $245"), then card with kvRows, then note. Single column.
**Desktop renders:** the renderer scans nodes, finds `stat` → pulls it into the right context panel as a hero number ($245 at 180px) with butter background. The card with kvRows stays in the left column. The note stays below the card. Two columns.

### Step 6: Booking

```js
function bookingStep(ctx) {
  return page("intake-booking", "Booking")
    .intake({
      step: 6, total: 7,
      eyebrow: "Chapter VI · Calendar",
      title: "Choose a time",
      accent: "sage",
    })
    .add(
      n.calendarGrid(2026, 6, dayOptions, ctx.state.day, {
        actions: { change: ctx.action("setDay", function(e) { ctx.state.day = e.value; return render(ctx); }) },
        style: { marginBottom: 16 },
      }).id("booking-days"),
      n.selectableGroup(timeOptions, ctx.state.time, {
        mode: "single",
        columns: 2,
        actions: { change: ctx.action("setTime", function(e) { ctx.state.time = e.value; return render(ctx); }) },
      }).id("booking-times"),
      n.personCard("Nadia Rivera", {
        role: "Senior colorist · lived-in blonde",
        badge: "$180+",
        stats: [
          { label: "STARTING", value: "$180+" },
          { label: "RATING", value: "4.9 ★ · 320" },
          { label: "SPEAKS", value: "EN · ES" },
        ],
        alternatives: [
          { name: "Josephine L.", role: "Colorist", badge: "$160+" },
          { name: "Teo Marino", role: "Stylist", badge: "$140+" },
        ],
      }).id("stylist"),
    )
    .toJSON();
}
```

**Mobile renders:** compact calendar grid, time slot chips, small stylist card inline. Single column.
**Desktop renders:** full month calendar + wider time slots in left column. `personCard` → pulled into right context panel with sage background, expanded with stats and alternatives.

### Step 7: Confirm

```js
function confirmStep(ctx) {
  return page("intake-confirm", "Confirm")
    .intake({
      step: 7, total: 7,
      eyebrow: "Chapter VII · Done",
      title: "Request received",
      accent: "butter",
    })
    .add(
      n.stat("#" + ctx.state.confirmNumber, {
        label: "CONFIRMATION",
        variant: "compact",
      }).id("confirm-number"),
      n.note("Your request is ready for stylist review.", {
        tone: "success",
        style: { marginBottom: 16 },
      }).id("confirm-success"),
      n.card({ accent: "sage" },
        n.kvRow("Service", selectedServiceName(ctx)).id("c-service"),
        n.kvRow("Estimate", estimateRange(ctx)).id("c-estimate"),
        n.kvRow("Date", dayLabel(ctx)).id("c-date"),
        n.kvRow("Time", timeLabel(ctx)).id("c-time"),
      ).id("confirm-card"),
      n.button("Add to calendar", { variant: "secondary" }).id("btn-calendar"),
      n.button("Start over", { variant: "ghost" }).id("btn-restart"),
    )
    .toJSON();
}
```

**Mobile renders:** confirmation note, card with kvRows, action buttons. Single column.
**Desktop renders:** the stat (confirmation number) could be rendered as a small hero in the left column. The card with kvRows stays left. Buttons render at desktop width.

---

## Migration Map: Old → New

This table shows every old node kind and its replacement.

| Old Node Kind | New Primitive | Props Mapping |
|---|---|---|
| `serviceOption` | `selectable` | `name→title`, `description→subtitle`, `rate→badge`, `selected→selected`, `disabled→disabled` |
| `serviceOptionGroup` | `selectableGroup` | `options→options` (rename `name→title`, `description→subtitle`, `rate→badge`), `value→value`, `mode:"single"` |
| `budgetOption` | `selectable` | `label→title`, `description→subtitle`, `selected→selected` |
| `budgetOptionGroup` | `selectableGroup` | `options→options` (rename `label→title`, `description→subtitle`), `value→value`, `mode:"single"`, add `columns` |
| `timeSlot` | `selectable` | `label→title`, `selected→selected`, `disabled→disabled` |
| `timeSlotGroup` | `selectableGroup` | `options→options`, `value→value`, `mode:"single"`, `columns→columns` |
| `lengthSilhouette` | `selectable` | `label→title`, `selected→selected`, `disabled→disabled` |
| `ratingBar` | `scale` | `value→value`, `max→max` (default 5), `label→label`, `interactive→interactive` |
| `colorLevelBar` | `scale` | `current→value`, `target→target`, `variant:"swatches"` |
| `summaryRow` | `kvRow` | `label→label`, `value→value`, `onEdit→editable:true` |
| `photoTile` | `uploadTile` | `label→label`, `filled→filled`, `disabled→disabled` |
| `stylistCard` | `personCard` | `name→name`, `role→role`, `rate→badge`, `available→badge` |
| `dayPickerGrid` | `calendarGrid` | `days→days` (add `date` field), `value→value` |

---

## Implementation Plan

### Phase 1: Schema + Builder + Renderer (Week 1)

1. **Update `schema.ts`** — replace old DslNodeKind union with new primitive kinds
2. **Update `builder.ts`** — new `n.selectable()`, `n.selectableGroup()`, `n.scale()`, `n.kvRow()`, `n.stat()`, `n.uploadTile()`, `n.personCard()`, `n.calendarGrid()` helpers
3. **Update `render.tsx`** — add render cases for each new primitive, with mobile + desktop rendering paths
4. **Update `modules_dsl.go`** — mirror new builder helpers in the Goja JS module
5. **Write TypeScript tests** — verify each primitive renders without crashing
6. **Write Storybook stories** — for each new primitive, mobile and desktop variants

### Phase 2: Flow Script Migration (Week 2)

7. **Rewrite `intake.flow.js`** using UI primitives instead of domain kinds
8. **Verify round-trip** — Goja flow produces JSON, renderer produces correct mobile and desktop output
9. **Update `BackendDslPage.stories.tsx`** — desktop shell story that renders the full flow

### Phase 3: Desktop Rendering Polish (Week 3)

10. **Implement `partitionForDesktop()`** — the node scanning logic that splits main/context
11. **Build context panel composition** — DesktopShell wraps content in TwoColumnLayout, right side gets context nodes
12. **Desktop typography scaling** — editorial text at display scale, stat at hero scale
13. **Desktop calendar** — full month grid with availability badges

### Phase 4: Visual Validation (Week 4)

14. **Create desktop css-visual-diff spec** — compare desktop rendering against design gallery prototypes
15. **Run visual diff** — fix discrepancies
16. **Upload updated guide to reMarkable**

---

## File Reference

### Files to modify

| File | Change |
|---|---|
| `web/src/page-dsl/schema.ts` | Replace DslNodeKind union with UI primitives |
| `web/src/page-dsl/builder.ts` | New n.* helpers for all primitives |
| `web/src/page-dsl/render.tsx` | New render cases with mobile + desktop paths + partitionForDesktop |
| `pkg/dslgoja/modules_dsl.go` | Mirror new helpers in Goja JS module |
| `pkg/dslgoja/flows/intake.flow.js` | Rewrite using UI primitives |

### Files already done (Phase 0)

| File | Status |
|---|---|
| `web/src/molecules/TopNav/TopNav.tsx` | ✅ Committed |
| `web/src/molecules/DesktopStepRail/DesktopStepRail.tsx` | ✅ Committed |
| `web/src/organisms/DesktopShell/DesktopShell.tsx` | ✅ Committed |
| `web/src/organisms/DesktopShell/TwoColumnLayout.tsx` | ✅ Committed |
| `web/src/molecules/AccentPanel/AccentPanel.tsx` | ✅ Committed |
| `web/src/page-dsl/schema.ts` (desktop shell kind) | ✅ Committed |
| `web/src/page-dsl/render.tsx` (desktop shell case) | ✅ Committed |

### Reference files

| File | Why |
|---|---|
| `design-galley/intake-desktop.jsx` | Desktop visual specification |
| `design-galley/screenshots/desktop/*.png` | Desktop screenshots |
| `web/src/fringe-ui/tokens/index.ts` | Design tokens |
| `web/src/page-dsl/examples.ts` | Current examples — will be rewritten |
| `web/src/page-dsl/InteractiveWidgets.stories.tsx` | Existing interactive stories |

---

*End of document.*
