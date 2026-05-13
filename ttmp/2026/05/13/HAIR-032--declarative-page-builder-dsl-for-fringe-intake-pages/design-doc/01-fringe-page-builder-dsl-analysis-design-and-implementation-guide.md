---
Title: Fringe Page Builder DSL Analysis Design and Implementation Guide
Ticket: HAIR-032
Status: active
Topics:
    - frontend
    - react
    - storybook
    - design-system
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts:JSON contract for pages and nodes
    - /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/builder.ts:Fluent builder API that emits JSON
    - /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx:Runtime interpreter from JSON to React widgets
    - /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/examples.ts:Example scripted pages
    - /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/PageDsl.stories.tsx:Storybook examples for rendered DSL pages
ExternalSources: []
Summary: "Intern-facing guide for the HAIR-032 declarative page-builder DSL: why it exists, how the JSON schema works, how the fluent builder emits JSON, how the interpreter renders pages, and how to extend/test it."
LastUpdated: 2026-05-13T05:25:00-04:00
WhatFor: "Teach new contributors how to understand, use, extend, and safely review the Fringe declarative page builder DSL."
WhenToUse: "Use when adding page templates, generating Storybook variants, extending widget support, or deciding whether a page belongs in handwritten React versus DSL JSON."
---

# Fringe Page Builder DSL Analysis Design and Implementation Guide

## Executive Summary

HAIR-032 introduces a declarative page-builder DSL for the Fringe hair booking frontend. The DSL lets a developer write elegant JavaScript/TypeScript builder code such as `page(...).intake(...).add(n.serviceOption(...))`, then call `.toJSON()` to produce a plain JSON page description. A React interpreter consumes that JSON and renders an application page by mapping each JSON node to existing Fringe atoms, molecules, and organisms.

This gives us three useful abilities:

- **Script page variants quickly** without creating one-off React components for every experiment.
- **Serialize page structure** as JSON for storage, generation, review, fixtures, or future server-driven rendering.
- **Reuse the existing design system** instead of inventing a parallel rendering stack.

The current implementation is intentionally pragmatic. It is small enough for an intern to understand in one sitting, but structured enough to evolve into a validated schema-backed system. The core files are:

- `web/src/page-dsl/schema.ts` — JSON contract.
- `web/src/page-dsl/builder.ts` — fluent builder that emits JSON.
- `web/src/page-dsl/render.tsx` — JSON interpreter that renders React widgets.
- `web/src/page-dsl/examples.ts` — DSL-authored example pages.
- `web/src/page-dsl/PageDsl.stories.tsx` — Storybook stories for the examples.

## Problem Statement

The Fringe intake UI now has a substantial component library:

- **Atoms**: `Button`, `Chip`, `Note`, `Progress`, `RatingBar`, `Wordmark`, and other leaf primitives.
- **Molecules**: `ServiceOption`, `BudgetOption`, `PhotoTile`, `SummaryRow`, `StylistCard`, `TimeSlot`, and others.
- **Organisms**: full page shells and page-level components such as `IntakeShell`, `ServicePage`, `PhotosPage`, and `BookingPage`.

That component library is useful, but page creation is still handwritten React. For each variation we must create JSX, import components, wire props, and create Storybook stories. This is fine for canonical production pages, but slow for:

- design variants,
- generated intake experiments,
- review fixtures,
- product copy variations,
- internal prototypes,
- and visual-diff scenario pages.

The user asked for a builder-style DSL that solves this tension:

> "Based on all the widgets we now have, can you design an elegant JS builder style DSL that then at the end creates JSON, and interpreting that JSON creates a page of the application. That way we can script all kinds of pages quickly"

The key requirement is the phrase **"then at the end creates JSON"**. The builder can be ergonomic JavaScript, but its output must be serializable. That means the runtime representation cannot contain functions, JSX elements, class instances, `Date` objects, or other non-JSON values.

## Proposed Solution

The solution is a three-layer architecture:

```text
┌─────────────────────────────────────────────────────────────┐
│ Authoring layer                                              │
│                                                             │
│   page("service", "Service")                               │
│     .intake({ step: 1, title: "What brings you in?" })      │
│     .add(n.text(...), n.serviceOption(...))                 │
│     .toJSON()                                               │
└─────────────────────────────┬───────────────────────────────┘
                              │ emits plain JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ JSON contract                                                │
│                                                             │
│   { schemaVersion: 1, shell: {...}, nodes: [...] }           │
│                                                             │
└─────────────────────────────┬───────────────────────────────┘
                              │ interpreted at runtime
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Rendering layer                                              │
│                                                             │
│   <DslPageRenderer page={json} context={{ actions }} />      │
│       └─ renderNode(kind="serviceOption")                  │
│            └─ <ServiceOption ... />                         │
└─────────────────────────────────────────────────────────────┘
```

The builder layer is for humans. The JSON layer is for machines. The renderer layer is the bridge back into React.

## Current Implementation Status

Implemented in commit `1c26d31`:

- JSON schema types.
- Fluent page/node builders.
- React renderer/interpreter.
- Example pages for service, color, length, photos, budget, estimate, booking, and confirm.
- Storybook category: `Page DSL/Rendered Pages`.
- JSON contract story that prints the generated JSON for inspection.

Validated with:

```bash
cd web
npx tsc --noEmit
npx storybook build --test
```

## File Map

| File | Role | Intern should know |
|---|---|---|
| `web/src/page-dsl/schema.ts` | Defines the JSON contract and TypeScript types. | This is the public shape of serialized pages. |
| `web/src/page-dsl/builder.ts` | Defines `page()` and `n.*` helpers. | This is the ergonomic authoring API. |
| `web/src/page-dsl/render.tsx` | Converts JSON nodes to React elements. | Add new widget support here. |
| `web/src/page-dsl/examples.ts` | Scripted page examples. | Good place to learn by example. |
| `web/src/page-dsl/PageDsl.stories.tsx` | Storybook integration. | Shows how DSL pages render in the phone frame. |
| `web/src/atoms/*` | Leaf components. | Most DSL node kinds eventually map to these. |
| `web/src/molecules/*` | Composite components. | Many business widgets live here. |
| `web/src/organisms/IntakeShell` | Mobile intake page shell. | The DSL `shell.kind = "intake"` maps here. |

## Core Concepts

### 1. Page

A page is the top-level JSON object. It has metadata, a shell, and an ordered list of nodes.

```ts
export interface DslPage {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  shell: {
    kind: "intake" | "bare";
    props?: JsonObject;
  };
  nodes: DslNode[];
  meta?: {...};
}
```

A page answers:

- What is this screen called?
- Which shell wraps it?
- Which nodes appear inside it?
- What metadata helps Storybook or review tooling?

### 2. Node

A node describes one rendered piece of UI. Every node has a `kind`, optional `props`, optional `children`, and optional metadata.

```ts
export interface DslNode<P extends JsonObject = JsonObject> {
  kind: DslNodeKind;
  props?: P;
  children?: DslNode[];
  meta?: {
    id?: string;
    name?: string;
    dataComponent?: string;
    dataSection?: string;
    dataPart?: string;
    note?: string;
  };
}
```

Example node:

```json
{
  "kind": "serviceOption",
  "props": {
    "name": "Highlights",
    "description": "Partial · full · balayage",
    "rate": "$180+",
    "selected": true
  }
}
```

### 3. Node kind

`DslNodeKind` is the registry of things the interpreter knows how to render.

Current kinds include:

- Generic layout: `text`, `spacer`, `stack`, `grid`.
- Atoms: `eyebrow`, `button`, `chip`, `note`, `card`, `rule`, `progress`, `ratingBar`, `segmented`.
- Molecules: `serviceOption`, `budgetOption`, `timeSlot`, `colorLevelBar`, `lengthSilhouette`, `photoTile`, `summaryRow`, `stylistCard`, `masthead`, `dayCell`.

### 4. Shell

A shell is the outer page wrapper. The current system supports:

- `intake` — renders `IntakeShell`, the mobile shell with status bar, header, progress, title area, content, and CTA footer.
- `bare` — renders only a simple wrapper; useful for experiments or custom full-page layouts.

Pseudocode:

```tsx
if (page.shell.kind === "intake") {
  return <IntakeShell {...shellProps}>{nodes}</IntakeShell>;
}
return <div>{nodes}</div>;
```

### 5. Actions

JSON cannot store functions. Instead, JSON stores action names, and runtime context resolves names into callbacks.

JSON-ish node:

```json
{
  "kind": "button",
  "props": {
    "children": "Keep going",
    "action": "next"
  }
}
```

Renderer context:

```tsx
<DslPageRenderer
  page={pageJson}
  context={{
    actions: {
      next: () => goToNextStep(),
      back: () => goBack(),
      skip: () => skipStep(),
    }
  }}
/>
```

The renderer helper is:

```ts
function action(ctx, props, key = "action") {
  const name = str(props, key, "");
  if (!name) return undefined;
  return ctx?.actions?.[name] || (() => console.log(`DSL action: ${name}`));
}
```

This pattern keeps JSON serializable while still allowing interactivity.

## Builder API Reference

### `page(id, title)`

Creates a `DslPageBuilder`.

```ts
const p = page("dsl-service", "Service DSL");
```

Methods:

| Method | Purpose |
|---|---|
| `.describe(text)` | Adds a human description. |
| `.intake(props)` | Uses `IntakeShell` as the page shell. |
| `.bare(props)` | Uses a minimal wrapper. |
| `.meta(meta)` | Adds story tags/source notes. |
| `.add(...nodes)` | Adds nodes to the page. |
| `.toJSON()` | Emits a plain JSON page. |

### `n.*` node helpers

`n` is a namespace of node builder shortcuts.

Examples:

```ts
n.text("Hello", { variant: "editorial" })
n.serviceOption("Cut", "Trim · restyle · bangs", { rate: "$80+" })
n.grid(3, { gap: 8 }, n.photoTile("Front"), n.photoTile("Side"))
n.note("Estimate only.", { tone: "warn" })
```

Key helpers:

| Helper | Renders as |
|---|---|
| `n.text(text, props)` | Generic `<div>` text with variant styles. |
| `n.spacer(height)` | Empty vertical space. |
| `n.stack(props, ...children)` | Flex column by default. |
| `n.grid(columns, props, ...children)` | CSS grid. |
| `n.serviceOption(...)` | `ServiceOption`. |
| `n.budgetOption(...)` | `BudgetOption`. |
| `n.colorLevelBar(...)` | `ColorLevelBar`. |
| `n.lengthSilhouette(...)` | `LengthSilhouette`. |
| `n.photoTile(...)` | `PhotoTile`. |
| `n.summaryRow(...)` | `SummaryRow`. |
| `n.stylistCard(...)` | `StylistCard`. |
| `n.masthead(...)` | `Masthead`. |
| `n.dayCell(...)` | `DayCell`. |

## Worked Example: Service Page

Builder code:

```ts
export const serviceDsl = page("dsl-service", "Service DSL")
  .describe("Service selection screen built entirely from JSON DSL nodes.")
  .intake({
    step: 1,
    total: 9,
    eyebrow: "Chapter I · The Ask",
    title: "What brings you in?",
    onNext: "next",
    onBack: "back",
    onSkip: "skip",
  })
  .add(
    n.text("Pick one to start — you can add more later.", {
      variant: "editorial",
      style: { marginBottom: 18 },
    }),
    n.serviceOption("Cut", "Trim · restyle · bangs", { rate: "$80+" }),
    n.serviceOption("Color", "Single process · gloss · root touch-up", { rate: "$120+" }),
    n.serviceOption("Highlights", "Partial · full · balayage", { rate: "$180+", selected: true }),
    n.serviceOption("Extensions", "Tape-in · hand-tied · consultation first", { rate: "$400+" }),
    n.serviceOption("Treatment", "Olaplex · bond-repair · scalp", { rate: "$60+" }),
  )
  .toJSON();
```

Rendered in Storybook:

```tsx
<DslPageRenderer page={serviceDsl} context={{ actions }} />
```

The generated JSON is visible in Storybook under:

```text
Page DSL / Rendered Pages / JSON contract
```

## Interpreter Design

`render.tsx` is deliberately straightforward. It uses a switch statement over `node.kind`.

Pseudocode:

```ts
function renderNode(node, ctx) {
  switch (node.kind) {
    case "text":
      return <div>{node.props.text}</div>;
    case "serviceOption":
      return <ServiceOption {...mappedProps} />;
    case "grid":
      return <div style={{ display: "grid" }}>{children}</div>;
    default:
      return <pre>Unsupported DSL node</pre>;
  }
}
```

This is not fancy, but it is easy to debug. When a new widget is added, an intern can follow this checklist:

1. Add its kind to `DslNodeKind` in `schema.ts`.
2. Add a helper in `builder.ts`.
3. Add a case in `render.tsx` that maps JSON props to the React component.
4. Add one or more examples in `examples.ts`.
5. Add/verify a Storybook story.
6. Run typecheck and Storybook build.

## Data Flow Diagram

```text
Developer writes builder code
        │
        ▼
DslPageBuilder / DslNodeBuilder
        │
        │ .toJSON()
        ▼
Plain JSON DslPage
        │
        ├── can be committed as fixture
        ├── can be generated by scripts
        ├── can be sent over HTTP later
        └── can be rendered immediately
        │
        ▼
DslPageRenderer
        │
        ▼
Existing Fringe components
        │
        ▼
Rendered application page / Storybook story / visual diff target
```

## Design Decisions

### Decision 1: Builder emits plain JSON

The builder API returns class instances while authoring, but `.toJSON()` deep-clones into plain data.

Why:

- Ensures output is serializable.
- Prevents accidental functions or class instances from leaking into saved page specs.
- Makes generated JSON easier to diff and inspect.

Tradeoff:

- Some TypeScript information is lost after serialization.
- We need runtime validation later.

### Decision 2: Use existing widgets, not a custom rendering stack

The renderer maps JSON to existing components instead of implementing raw HTML for every node.

Why:

- Keeps visual consistency with Storybook pages.
- Reuses design tokens and component behavior.
- Avoids duplicate CSS.

Tradeoff:

- The DSL is coupled to widget props.
- If widget APIs change, the renderer must be updated.

### Decision 3: Use `JsonObject` props for now

The current schema uses generic JSON props rather than per-kind discriminated prop interfaces.

Why:

- Faster to implement and iterate.
- Keeps builder flexible while the DSL shape stabilizes.

Tradeoff:

- Less compile-time safety.
- Invalid props may fail only visually or at runtime.

Future improvement:

- Add per-kind prop interfaces.
- Generate JSON schema.
- Add validation before rendering.

### Decision 4: Actions are string references

Functions cannot live in JSON. Action names can.

Why:

- Keeps JSON serializable.
- Works in Storybook and future app runtime.
- Allows security review: only known action names are executable.

Tradeoff:

- Action names are another contract to maintain.

### Decision 5: Include generic layout nodes

The DSL includes `stack`, `grid`, `spacer`, and `text`.

Why:

- Not every layout deserves a custom widget.
- Generic nodes make examples practical.
- Designers can compose variants quickly.

Tradeoff:

- Too many generic style overrides could bypass the design system.

Guideline:

- Prefer design-system widgets for semantic UI.
- Use generic layout nodes for spacing/composition glue.

## Alternatives Considered

### Alternative A: Handwritten React only

Pros:

- Maximum TypeScript safety.
- Familiar to React developers.
- Easy to debug in standard tooling.

Cons:

- Slow for variants.
- Not serializable.
- Harder to generate from data.

Rejected because the user explicitly asked for JSON output and fast scripting.

### Alternative B: Store JSX in builder nodes

Example:

```ts
page.add(<ServiceOption ... />)
```

Pros:

- Very flexible.
- Easy for React developers.

Cons:

- Not JSON.
- Cannot send over HTTP or store as plain fixture.
- Harder to validate.

Rejected because it violates the core JSON requirement.

### Alternative C: Use MDX or Markdown

Pros:

- Friendly authoring syntax.
- Good for content-heavy pages.

Cons:

- Poor fit for rich widgets and interactions.
- Requires another parser/compiler.
- Harder to map to exact design-system components.

Deferred. MDX could be a future authoring frontend that compiles into this JSON schema.

### Alternative D: Server-driven UI framework

Pros:

- Powerful long-term architecture.
- Could power remote configuration.

Cons:

- Much larger security, validation, and runtime surface area.
- Premature for this stage.

Deferred. The current DSL is intentionally local and simple.

## Implementation Plan for Interns

### Phase 1: Learn the current shape

Read these files in order:

1. `schema.ts`
2. `builder.ts`
3. `examples.ts`
4. `render.tsx`
5. `PageDsl.stories.tsx`

Then open Storybook:

```bash
cd web
npx storybook dev -p 6006
```

Navigate to:

```text
Page DSL / Rendered Pages
```

### Phase 2: Add a new node kind

Suppose we add a molecule called `PromoBanner`.

Step 1 — extend schema:

```ts
export type DslNodeKind =
  | ...
  | "promoBanner";
```

Step 2 — add builder helper:

```ts
promoBanner: (title: string, props: JsonObject = {}) =>
  new DslNodeBuilder("promoBanner", { title, ...props }),
```

Step 3 — render it:

```tsx
case "promoBanner":
  return <PromoBanner title={str(props, "title")} tone={str(props, "tone", "info")} />;
```

Step 4 — add example:

```ts
n.promoBanner("Free gloss with color service", { tone: "peach" })
```

Step 5 — validate:

```bash
npx tsc --noEmit
npx storybook build --test
```

### Phase 3: Add a new page example

Add to `examples.ts`:

```ts
export const aftercareDsl = page("dsl-aftercare", "Aftercare DSL")
  .intake({ step: 10, total: 10, eyebrow: "Aftercare", title: "Keep it fresh" })
  .add(
    n.note("Use sulfate-free shampoo for best results.", { tone: "info" }),
    n.button("Done", { action: "done" }),
  )
  .toJSON();
```

Export it in `dslExamples`, then add a Storybook story.

## API Reference

### `DslPage`

```ts
interface DslPage {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  shell: { kind: "intake" | "bare"; props?: JsonObject };
  nodes: DslNode[];
  meta?: {...};
}
```

### `DslNode`

```ts
interface DslNode {
  kind: DslNodeKind;
  props?: JsonObject;
  children?: DslNode[];
  meta?: {
    id?: string;
    name?: string;
    dataComponent?: string;
    dataSection?: string;
    dataPart?: string;
    note?: string;
  };
}
```

### `DslPageRenderer`

```tsx
function DslPageRenderer({
  page,
  context,
}: {
  page: DslPage;
  context?: DslRenderContext;
})
```

### `DslRenderContext`

```ts
interface DslRenderContext {
  actions?: Record<string, () => void>;
  overrides?: Record<string, ReactNode>;
}
```

`overrides` is reserved for future use. It can later support replacing node IDs with custom React content.

## Storybook Usage

Current stories live in:

```text
Page DSL / Rendered Pages
```

Stories include:

- Service
- Color
- Length
- Photos
- Budget
- Estimate
- Booking
- JSON contract

The `JSON contract` story is important: it lets reviewers inspect exactly what the builder emits.

## Testing and Validation

Run:

```bash
cd web
npx tsc --noEmit
npx storybook build --test
```

Manual checks:

- Open Storybook.
- Verify each DSL page renders inside the phone frame.
- Open `JSON contract` and confirm output is plain JSON.
- Confirm clicking buttons logs named actions rather than throwing errors.

Future automated tests should include:

- Builder emits stable JSON snapshots.
- Renderer renders all known node kinds without crashing.
- Invalid node kind displays an explicit fallback.
- Action names resolve from context.

## Runtime Safety Notes

This is not yet a fully safe server-driven UI system. Before accepting arbitrary remote JSON, add:

- schema validation,
- allowed node kind validation,
- prop validation per node kind,
- action allow-listing,
- size limits on node trees,
- recursion depth limits,
- and style sanitization or removal.

For now, treat DSL JSON as trusted project-authored fixtures.

## Visual Diff Integration

The DSL can become a powerful visual-diff target:

```text
prototype HTML ───────┐
                      ├─ css-visual-diff compareRegion()
DSL Storybook page ───┘
```

Future workflow:

1. Create DSL page variant.
2. Add Storybook story.
3. Add css-visual-diff spec entry pointing at the Storybook iframe.
4. Compare against prototype or canonical handwritten page.
5. Use the review site for feedback.

## Open Questions

- Should DSL pages eventually replace handwritten mobile page organisms, or remain a prototyping layer?
- Should JSON page specs be stored as `.json` fixtures in the repository?
- Should the builder support named reusable fragments?
- Should desktop shells become first-class DSL shells?
- Should action names be typed as a finite union per app flow?

## Recommended Next Steps

1. Add runtime validation.
2. Add snapshot tests for `examples.ts` output.
3. Add `DesktopShell` and desktop page DSL examples.
4. Add fragment/reuse helpers:
   - `fragments.intakeCta()`
   - `fragments.photoUploadGrid()`
   - `fragments.summaryRows()`
5. Add visual-diff comparisons between DSL pages and handwritten page stories.

## Appendix A: Full Minimal Example

```ts
import { page, n } from "./page-dsl";

export const mini = page("mini", "Mini DSL Example")
  .intake({
    step: 1,
    total: 3,
    eyebrow: "Chapter I",
    title: "Choose service",
    onNext: "next",
    onBack: "back",
    onSkip: "skip",
  })
  .add(
    n.text("Pick a starting point.", { variant: "editorial" }),
    n.serviceOption("Cut", "Trim · restyle · bangs", { rate: "$80+" }),
    n.serviceOption("Color", "Gloss · root touch-up", { rate: "$120+", selected: true }),
  )
  .toJSON();
```

## Appendix B: Mental Model

Think of the DSL as a recipe:

```text
Builder code = recipe authoring
JSON = recipe card
Renderer = cook
Design-system widgets = ingredients/tools
Rendered page = finished dish
```

The recipe card must be plain and portable. The cook knows how to turn each instruction into the correct widget.

## Appendix C: Common Mistakes

### Mistake: putting functions in props

Bad:

```ts
n.button("Next", { onClick: () => next() })
```

Good:

```ts
n.button("Next", { action: "next" })
```

### Mistake: using generic `text` for semantic widgets

Bad:

```ts
n.text("Highlights")
```

Good:

```ts
n.serviceOption("Highlights", "Partial · full · balayage", { rate: "$180+" })
```

### Mistake: overusing inline styles

Inline styles are allowed for glue, but prefer design-system components and tokenized variants.

Bad:

```ts
n.card({ style: { background: "#123456", padding: 37 } })
```

Better:

```ts
n.note("Estimate only...", { tone: "warn" })
```
