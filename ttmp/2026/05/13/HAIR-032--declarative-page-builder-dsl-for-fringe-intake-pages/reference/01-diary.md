# Diary

## Goal

Capture the implementation journey for HAIR-032: a declarative JavaScript builder DSL that emits JSON page descriptions, plus a JSON interpreter that renders those descriptions into Fringe intake application pages using the existing atoms, molecules, organisms, tokens, and Storybook setup.

## Step 1: Implement the initial declarative page builder DSL

Implemented the first production-quality slice of the DSL: a JSON schema, a fluent builder API, a React interpreter/renderer, a collection of example pages, and Storybook stories that render the examples inside the same phone-frame decorator used by the application page stories. The intent is to let designers/developers script many page variants quickly while still producing a serializable JSON artifact that can be saved, generated, reviewed, or sent over the wire.

### Prompt Context

**User prompt (verbatim):** "Based on all the widgets we now have, can you design an elegant JS builder style DSL that then at the end creates JSON, and interpreting that JSON creates a page of the application. That way we can script all kinds of pages quickly"

**User prompt (verbatim):** "Implement it, use storybook to create many different examples."

**User prompt (verbatim):** "Create a new docmgr ticket, Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Create a new HAIR-032 ticket, implement a fluent DSL that compiles to JSON, implement a JSON renderer that maps the JSON to existing React widgets, add Storybook examples, then write and upload a detailed intern-facing guide.

**Inferred user intent:** Make page assembly fast, repeatable, and inspectable by moving page composition into a declarative JSON-compatible layer rather than hand-authoring every React page variant.

**Commit (code):** 1c26d31 — "HAIR-032 Step 1: Implement declarative page builder DSL"

### What I did

- Created `web/src/page-dsl/schema.ts` with the serializable JSON contract:
  - `DslPage`
  - `DslNode`
  - `DslNodeKind`
  - `DslRenderContext`
- Created `web/src/page-dsl/builder.ts` with the fluent builder API:
  - `page(id, title)` creates a `DslPageBuilder`.
  - `n.*` helpers create typed-ish node builders (`n.text`, `n.serviceOption`, `n.colorLevelBar`, etc.).
  - `.toJSON()` deep-clones into plain JSON.
- Created `web/src/page-dsl/render.tsx` with the JSON interpreter:
  - `DslPageRenderer` chooses the shell (`intake` or `bare`).
  - `renderNode()` maps each `DslNode.kind` to an existing atom/molecule/organism.
  - `actions` in `DslRenderContext` map string action names in JSON to runtime callbacks.
- Created `web/src/page-dsl/examples.ts` with example pages:
  - Service
  - Color
  - Length
  - Photos
  - Budget
  - Estimate
  - Booking
  - Confirm
- Created `web/src/page-dsl/PageDsl.stories.tsx` with Storybook examples under `Page DSL/Rendered Pages`.
- Verified:
  - `npx tsc --noEmit`
  - `npx storybook build --test`
- Restarted Storybook at http://localhost:6006.

### Why

The existing React pages are useful, but manually building every variant as a bespoke component is slow. A JSON-backed DSL gives us a higher-level representation:

- Script page variants quickly.
- Serialize page specs for review or storage.
- Generate pages from data or experiments.
- Render the same JSON in Storybook, tests, or eventually application runtime.

### What worked

- The `n.*` helper API gives concise scripts while still producing JSON.
- The renderer cleanly maps JSON nodes to existing atoms and molecules instead of duplicating UI logic.
- Storybook can render DSL pages with the existing phone-frame decorator by setting `parameters.phone = true`.

### What didn't work

- Some component props are not fully JSON-native in React (`onClick`, arbitrary React children). The first implementation handles this by using action names (`"next"`, `"back"`, `"editService"`) that are resolved by `DslRenderContext.actions`.
- TypeScript cannot make every JSON object perfectly type-safe without a larger schema layer; this first version uses pragmatic `JsonObject` props and runtime mapping helpers.

### What I learned

- A small discriminated `kind` registry is enough to cover most page assembly needs because the design system already has strong atoms/molecules.
- The distinction between builder API and JSON contract is important: the builder can be ergonomic, but the output must stay plain JSON.

### What was tricky to build

- The renderer must bridge JSON to React components whose props were designed for hand-written React. For example, `SummaryRow` takes `onEdit`, but JSON cannot store functions. The renderer resolves named actions from context instead.
- Some examples need generic layout nodes (`stack`, `grid`, `spacer`, `text`) in addition to design-system widgets. Without these, the DSL would either be too rigid or would require a custom component for every layout variation.

### What warrants a second pair of eyes

- Whether `DslNodeKind` names are the right long-term public contract.
- Whether `JsonObject` props should be replaced by per-kind prop interfaces plus a JSON schema validator.
- Whether `bare` confirm examples should become a first-class `confirmShell` or `heroConfirm` organism.

### What should be done in the future

- Add runtime validation with a generated JSON schema or zod-like validator.
- Add more node kinds for desktop shells and page sections.
- Add visual-diff specs comparing DSL-rendered pages against the existing hand-authored page stories.
- Decide whether app runtime should consume DSL JSON or whether DSL remains a design/prototyping tool.

### Code review instructions

Start here:

- `web/src/page-dsl/schema.ts` — JSON contract.
- `web/src/page-dsl/builder.ts` — fluent builder API.
- `web/src/page-dsl/render.tsx` — interpreter from JSON to React.
- `web/src/page-dsl/examples.ts` — examples of scripted pages.
- `web/src/page-dsl/PageDsl.stories.tsx` — Storybook integration.

Validate:

```bash
cd web
npx tsc --noEmit
npx storybook build --test
```

Open Storybook:

```text
http://localhost:6006/?path=/story/page-dsl-rendered-pages--service
```

### Technical details

Minimal builder example:

```ts
import { page, n } from "./page-dsl";

const service = page("service", "Service")
  .intake({ step: 1, total: 9, eyebrow: "Chapter I · The Ask", title: "What brings you in?" })
  .add(
    n.text("Pick one to start — you can add more later.", { variant: "editorial" }),
    n.serviceOption("Cut", "Trim · restyle · bangs", { rate: "$80+" }),
    n.serviceOption("Highlights", "Partial · full · balayage", { rate: "$180+", selected: true }),
  )
  .toJSON();
```

The JSON then renders through:

```tsx
<DslPageRenderer page={service} context={{ actions: { next, back, skip } }} />
```

---

## Step 2: Add experimental DSL composition stories

Added a second Storybook group that demonstrates the DSL as a composition playground, not just a way to recreate the canonical intake pages. These examples combine many atoms and molecules in novel arrangements so designers and developers can see the expressive range of the JSON page system.

### Prompt Context

**User prompt (verbatim):** "create some more experimental  pages showing how to combine all the different kind of widgets we have"

**Assistant interpretation:** Add more DSL-authored pages that combine diverse widgets beyond the standard mobile flow. The goal is to demonstrate the DSL's compositional power and provide examples future contributors can copy.

**Inferred user intent:** Make the DSL feel useful as a rapid prototyping tool, not just a duplicate of handwritten pages.

**Commit (code):** 53d8e08 — "HAIR-032 Step 2: Add experimental DSL composition stories"

### What I did

- Created `web/src/page-dsl/experimental.ts`.
- Added five experimental DSL pages:
  - `consultationDashboardDsl`: cards, rating bars, notes, service options.
  - `appointmentPlannerDsl`: stylist card, budget options, calendar day cells, time slots.
  - `colorLabDsl`: color level bar, chips, notes, summary rows.
  - `photoMoodboardDsl`: photo tiles, chips, note, inspiration tags.
  - `aftercarePlanDsl`: bare shell, masthead, notes, summary rows, buttons.
- Created `web/src/page-dsl/ExperimentalPageDsl.stories.tsx` under `Page DSL/Experimental Compositions`.
- Added an `Experimental JSON index` story that prints all generated experimental JSON.
- Exported experimental examples from `web/src/page-dsl/index.ts`.
- Verified `npx tsc --noEmit` and `npx storybook build --test`.

### Why

A DSL is easier to evaluate when it shows more than canonical pages. Experimental pages prove that the node vocabulary supports recombination: ratings with service options, calendar cells with budget cards, photo tiles with chips, and aftercare summaries with notes and actions.

### What worked

- The existing node set was enough to create several new page concepts without adding renderer cases.
- Storybook's phone-frame decorator works for experimental DSL pages automatically.
- The JSON index story makes it easy to inspect the emitted structure for all experiments.

### What didn't work

- Some layouts still require inline style glue in JSON (`display`, `aspectRatio`, `marginBottom`). This is acceptable for experiments, but the DSL should eventually grow reusable fragments/presets to reduce style noise.

### What I learned

- The generic `stack`, `grid`, `spacer`, and `text` nodes are essential. Without them, the DSL would only recreate fixed widgets and would not feel like a real page composition language.
- The current node vocabulary is already expressive enough for dashboards, planners, labs, moodboards, and aftercare pages.

### What was tricky to build

- JSON style objects need to remain plain JSON. This means no computed functions or token references in the final output unless they are resolved during builder execution. In these examples, imported token values become strings in the emitted JSON.

### What warrants a second pair of eyes

- Review the experimental Storybook stories and decide which patterns should become official fragments or organisms.
- Check whether `aftercarePlanDsl` should use a first-class shell rather than `bare`.

### What should be done in the future

- Add reusable DSL fragments for common page regions.
- Add examples for desktop layouts once `DesktopShell` is implemented.
- Add JSON snapshot tests to catch accidental output changes.

### Code review instructions

Open Storybook and inspect:

```text
Page DSL / Experimental Compositions / Consultation Dashboard
Page DSL / Experimental Compositions / Appointment Planner
Page DSL / Experimental Compositions / Color Lab
Page DSL / Experimental Compositions / Photo Moodboard
Page DSL / Experimental Compositions / Aftercare Plan
Page DSL / Experimental Compositions / Experimental JSON index
```

---

## Step 3: Fix React key spreading warnings in the DSL renderer

Fixed the React warning caused by including `key` inside the shared props object that was spread into JSX. The renderer now passes `key={key}` directly to each JSX element and keeps `common` limited to serializable data attributes.

### Prompt Context

**User prompt (verbatim):** "Ok, let's commit and then create the next ticket, where we go over all the widgets and such we built today, and make them actually interactive / workable, with a decent set of props / callbacks so they can be built into a real app. For xampe, chosing a set of toggled chips.

Also,it looks like there are some issues in the DSL:

A props object containing a \"key\" prop is being spread into JSX:
  let props = {key: someKey, data-dsl-kind: ..., data-dsl-id: ..., data-component: ..., data-section: ..., data-part: ..., style: ..., children: ...};
  <div {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {data-dsl-kind: ..., data-dsl-id: ..., data-component: ..., data-section: ..., data-part: ..., style: ..., children: ...};
  <div key={someKey} {...props} /> <anonymous code>:1:145535
A props object containing a \"key\" prop is being spread into JSX:
  let props = {key: someKey, data-dsl-kind: ..., data-dsl-id: ..., data-component: ..., data-section: ..., data-part: ..., color: ..., style: ..., children: ...};
  <Eyebrow {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {data-dsl-kind: ..., data-dsl-id: ..., data-component: ..., data-section: ..., data-part: ..., color: ..., style: ..., children: ...};
  <Eyebrow key={someKey} {...props} /> <anonymous code>:1:145535
A props object containing a \"key\" prop is being spread into JSX:
  let props = {key: someKey, data-dsl-kind: ..., data-dsl-id: ..., data-component: ..., data-section: ..., data-part: ..., label: ..., filled: ..., style: ...};
  <PhotoTile {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {data-dsl-kind: ..., data-dsl-id: ..., data-component: ..., data-section: ..., data-part: ..., label: ..., filled: ..., style: ...};
  <PhotoTile key={someKey} {...props} /> <anonymous code>:1:145535"

**Assistant interpretation:** First fix and commit the current DSL warning, then create the next docmgr ticket for making today's widgets interactive and app-ready.

**Inferred user intent:** Keep the DSL clean while moving into the next implementation phase: production-grade widget behavior, props, callbacks, and state patterns.

**Commit (code):** TBD — "HAIR-032 Step 3: Fix DSL renderer key handling"

### What I did

- Updated `web/src/page-dsl/render.tsx`.
- Changed `common` from `{ key, ...dataAttrs(node) }` to only `dataAttrs(node)`.
- Passed `key={key}` directly to every JSX element produced by `renderNode()`.
- Replaced `React.Key` with imported `Key` type from React.
- Verified:
  - `cd web && npx tsc --noEmit`
  - `cd web && npx storybook build --test`

### Why

React treats `key` as a special reconciliation hint. It must be passed directly to JSX, not included in a props object that gets spread. The previous implementation worked visually but emitted warnings in Storybook/runtime.

### What worked

- The fix is localized to the renderer.
- TypeScript and Storybook build still pass.

### What didn't work

- N/A.

### What I learned

- The shared `common` pattern is still useful, but it must only contain ordinary props/data attributes. Special React props like `key` need explicit handling.

### What was tricky to build

- The renderer has many switch cases, so the mechanical fix had to be applied consistently across all node kinds rather than only the three warning examples.

### What warrants a second pair of eyes

- Review whether any other special React props (`ref`, etc.) could accidentally enter DSL props in the future.

### What should be done in the future

- Add a renderer smoke test that mounts each node kind and fails on console warnings.

### Code review instructions

Start with `web/src/page-dsl/render.tsx`, especially `renderNode()`.

Validate with:

```bash
cd web
npx tsc --noEmit
npx storybook build --test
```
