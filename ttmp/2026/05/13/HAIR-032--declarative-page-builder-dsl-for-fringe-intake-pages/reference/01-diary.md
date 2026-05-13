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
