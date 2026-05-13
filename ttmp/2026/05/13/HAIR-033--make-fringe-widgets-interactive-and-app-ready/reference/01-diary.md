# Diary

## Goal

Capture the work to turn the Fringe design-system widgets from mostly presentational Storybook components into app-ready interactive controls with clear props, callbacks, controlled state patterns, and realistic examples.

## Step 1: Create the HAIR-033 widget interactivity ticket

Created a new docmgr ticket for the next phase after HAIR-032. HAIR-032 proved that widgets can be composed through a JSON DSL; HAIR-033 is about making the underlying widgets strong enough for real product state and user interaction.

The immediate trigger was a concrete example: selectable/toggled chip sets. This implies a broader audit of all widgets built today: each should expose a clear controlled API, callback shape, accessibility affordances, disabled/loading/error states where relevant, and Storybook stories that demonstrate realistic app behavior.

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

**Assistant interpretation:** Finish/commit the DSL cleanup, then create a new ticket focused on productionizing widget interactivity and callback contracts.

**Inferred user intent:** Move from static visual components and DSL demos toward a widget library that can be wired into a real app flow.

**Commit (code):** N/A — ticket creation only

### What I did

- Created ticket `HAIR-033`: `Make Fringe widgets interactive and app-ready`.
- Added design doc: `Interactive Widget Props Callbacks and App Integration Guide`.
- Added reference doc: `Diary`.
- Added tasks for widget inventory, prop/callback design, toggled chip sets, interaction upgrades, Storybook demos, and tests.

### Why

The UI library needs explicit interaction contracts before it can safely power a real app. Presentational props like `selected` are not enough; the app needs predictable callback payloads, controlled value patterns, keyboard/accessibility behavior, and stories that prove the behavior.

### What worked

- Ticket workspace, docs, and tasks were created successfully with docmgr.

### What didn't work

- N/A.

### What I learned

- The next phase should be driven by an inventory table: widget, current props, missing props, expected callback payload, state owner, accessibility requirements, and Storybook demo.

### What was tricky to build

- The scope could easily balloon into a full app architecture rewrite. The ticket keeps the first pass focused on component-level contracts and app-ready examples.

### What warrants a second pair of eyes

- The callback naming convention should be reviewed before implementation spreads across all widgets.

### What should be done in the future

- Start with `Chip` and a reusable `ChipGroup`/multi-select example, then apply the same pattern to the remaining selectable widgets.

### Code review instructions

Review the ticket tasks and design doc outline before implementation starts.

---

## Step 2: Implement interactive Chip and ChipGroup controls

Implemented the first app-ready interaction slice: chips are now accessible buttons with explicit selection callbacks, and a new `ChipGroup` manages controlled or uncontrolled single/multiple selection. This establishes the callback and state-management pattern we can reuse for service cards, budget options, time slots, day cells, and other selectable widgets.

The main use case was the user's example of choosing a set of toggled chips. The new Storybook stories show a controlled multi-select tone picker and a controlled single-select length picker, with live JSON state output so reviewers can see exactly what app state receives.

### Prompt Context

**User prompt (verbatim):** "go ahead"

**Assistant interpretation:** Begin HAIR-033 implementation now, starting with the toggled chip interaction pattern called out in the previous prompt.

**Inferred user intent:** Move from ticket setup into concrete widget productionization work.

**Commit (code):** 277df67 — "HAIR-033 Step 1: Add interactive ChipGroup controls"

### What I did

- Updated `web/src/atoms/Chip/Chip.tsx`:
  - Switched the rendered element from `span` to `button` for keyboard and accessibility semantics.
  - Added `value`, `disabled`, `onSelectedChange`, and metadata payload support.
  - Preserved `onClick` for backward compatibility with existing stories/usages.
  - Added `aria-pressed` to expose toggle state.
- Added `web/src/atoms/Chip/ChipGroup.tsx`:
  - Supports `selectionMode="single" | "multiple"`.
  - Supports controlled `value` and uncontrolled `defaultValue`.
  - Emits `onChange(nextValue, meta)` with previous value and selected option metadata.
- Rewrote `web/src/atoms/Chip/Chip.stories.tsx`:
  - Kept visual examples.
  - Added `Interactive — toggled tone chips`.
  - Added `Interactive — single length selector`.
- Added `web/src/atoms/Chip/ChipGroup.test.tsx`:
  - Verifies chip callback metadata.
  - Verifies multi-select changes.
  - Verifies single-select changes.
  - Verifies uncontrolled state updates.
- Verified:
  - `cd web && pnpm test -- --runInBand`
  - `cd web && npx tsc --noEmit`
  - `cd web && npx storybook build --test`

### Why

`Chip` is the smallest selectable widget and a good reference implementation for the rest of HAIR-033. A robust chip group clarifies how state should flow through the component library: the app owns selected values, widgets emit next values and metadata, and Storybook demonstrates the contract with live state.

### What worked

- The controlled/uncontrolled pattern is compact and reusable.
- Existing visual chip stories still work.
- Tests cover the behavior requested by the user: selecting/toggling chip sets.

### What didn't work

- N/A.

### What I learned

- Turning a visual `span` into a semantic `button` improves accessibility and testability without changing the visual design much.
- The callback metadata should be standardized before upgrading all selectable widgets, because the same concepts appear everywhere: selected item, previous value, action, and source.

### What was tricky to build

- Single-select and multi-select share most behavior but differ in how next values are computed. The implementation keeps the public value shape consistently as an array, even for single selection, to make `ChipGroup` predictable.
- Maintaining compatibility with existing `onClick` uses required keeping `onClick?: () => void` while adding the richer `onSelectedChange` contract.

### What warrants a second pair of eyes

- Whether single-select `ChipGroup` should expose a scalar value instead of an array.
- Whether the metadata `source` should distinguish pointer vs keyboard immediately, or whether pointer is enough until keyboard-specific handlers are added.
- Whether `Chip` should support `as="span"` for non-interactive decorative tags; currently it always renders a `button`.

### What should be done in the future

- Apply the same controlled/callback pattern to `Segmented`, `ServiceOption`, `BudgetOption`, `TimeSlot`, `DayCell`, `PhotoTile`, `RatingBar`, and `LengthSilhouette`.
- Add a shared `ChangeMeta` type instead of per-widget local metadata types.
- Add keyboard-focused tests if we customize keyboard behavior beyond native button semantics.

### Code review instructions

Start with:

- `web/src/atoms/Chip/Chip.tsx`
- `web/src/atoms/Chip/ChipGroup.tsx`
- `web/src/atoms/Chip/Chip.stories.tsx`
- `web/src/atoms/Chip/ChipGroup.test.tsx`

Validate with:

```bash
cd web
pnpm test -- --runInBand
npx tsc --noEmit
npx storybook build --test
```

Open Storybook:

```text
Atoms / Chip / Interactive — toggled tone chips
Atoms / Chip / Interactive — single length selector
```

---

## Step 3: Standardize interactive callback contracts across selectable widgets

Expanded the HAIR-033 interaction pattern beyond chips. The selectable widgets now expose value-oriented callback props with metadata, while preserving their visual APIs and existing simple `onClick` usages where needed.

This turns the widget set into something closer to an app-ready form toolkit: segmented choices, ratings, service cards, budget cards, time slots, day cells, length silhouettes, and photo upload tiles can now report meaningful state transitions back to application code.

### Prompt Context

**User prompt (verbatim):** (same as Step 2)

**Assistant interpretation:** Continue implementing app-ready widget props/callbacks after the initial ChipGroup slice.

**Inferred user intent:** Make the full set of widgets usable in real app flows, not just static Storybook displays.

**Commit (code):** 85f548b — "HAIR-033 Step 2: Standardize interactive widget callbacks"

### What I did

- Added `web/src/fringe-ui/interactions.ts` with shared interaction metadata types.
- Upgraded `Segmented` with typed options, disabled states, radio semantics, and `onChange(value, meta)`.
- Upgraded `RatingBar` with optional interactive mode and `onChange(value, meta)`.
- Upgraded selectable molecules with `value`, `disabled`, and `onSelect(value, meta)`:
  - `ServiceOption`
  - `BudgetOption`
  - `TimeSlot`
  - `DayCell`
  - `LengthSilhouette`
- Upgraded `PhotoTile` with upload/remove behavior:
  - `onUpload(value, meta)` when empty.
  - `onRemove(value, meta)` when filled.
- Added `web/src/InteractiveWidgets.stories.tsx` with app-state demos:
  - `Controlled intake selectors`
  - `Booking and upload selectors`
- Added `web/src/InteractiveWidgets.test.tsx` for callback payloads.
- Verified:
  - `cd web && pnpm test -- --runInBand`
  - `cd web && npx tsc --noEmit`
  - `cd web && npx storybook build --test`

### Why

The component library needs a consistent way to move user choices into app state. This step standardizes the direction: widgets receive current value/selection state from the app, then emit next values with enough metadata for analytics, debugging, form reducers, or DSL action mapping.

### What worked

- The callback metadata shape from `ChipGroup` transferred cleanly to the other widgets.
- App-state Storybook demos are now much more useful than static component samples.
- Tests verify the key callback payloads without depending on visual styles.

### What didn't work

- The widgets still do not share higher-level group components beyond `ChipGroup`. For example, service options and budget options are still composed manually in stories.

### What I learned

- Some widgets should remain presentational by default but become interactive when callbacks are provided (`RatingBar` uses `interactive` for this reason).
- Upload-style widgets need action names beyond select/deselect. `PhotoTile` uses `upload` and `remove`.

### What was tricky to build

- Several widgets previously rendered `div` elements with click handlers. Converting them to `button` improves accessibility but requires careful style reset (`border`, `textAlign`, `width`, `padding`) to preserve the existing visuals.
- `PhotoTile` has two different semantic actions depending on state: empty means upload, filled means remove.

### What warrants a second pair of eyes

- Whether `onSelect` should deselect an already-selected single-select card or always emit `select`.
- Whether `RatingBar` should use number-specific metadata instead of the shared string-oriented `SelectionChangeMeta`.
- Whether `PhotoTile` should receive a real file upload callback signature now or later.

### What should be done in the future

- Add group helpers for service options, budget options, time slots, and day cells.
- Update the DSL renderer to map JSON `value` and named actions into the richer callback props where useful.
- Add keyboard-navigation tests for segmented/radio-like controls.

### Code review instructions

Start with:

- `web/src/fringe-ui/interactions.ts`
- `web/src/InteractiveWidgets.stories.tsx`
- `web/src/InteractiveWidgets.test.tsx`
- The upgraded widgets listed above.

Validate with:

```bash
cd web
pnpm test -- --runInBand
npx tsc --noEmit
npx storybook build --test
```

---

## Step 4: Add reusable selection group components

Added group-level components around the app-ready selectable widgets so pages do not need to manually map options and repeat selection-state wiring. These groups are the natural next layer above individual controls: they own the controlled/uncontrolled selection pattern, preserve callback metadata, and make application stories shorter and closer to real app code.

The updated Storybook examples now demonstrate both controlled app state and uncontrolled defaults for full widget groups, not just individual cards/buttons.

### Prompt Context

**User prompt (verbatim):** "go ahead"

**Assistant interpretation:** Continue HAIR-033 by building the next app-ready abstraction layer after individual widget callbacks.

**Inferred user intent:** Keep moving toward widgets that can be dropped into real app screens with minimal custom glue.

**Commit (code):** 96ba17e — "HAIR-033 Step 3: Add reusable selection group components"

### What I did

- Added `web/src/fringe-ui/selection.ts`:
  - `useControllableValue()` for controlled/uncontrolled single-value groups.
- Added group components:
  - `ServiceOptionGroup`
  - `BudgetOptionGroup`
  - `TimeSlotGroup`
  - `DayPickerGrid`
- Updated `web/src/InteractiveWidgets.stories.tsx`:
  - `IntakeSelections` now uses `ServiceOptionGroup` and `BudgetOptionGroup`.
  - `BookingSelections` now uses `DayPickerGrid` and `TimeSlotGroup`.
  - Added `UncontrolledGroups` example.
- Added `web/src/SelectionGroups.test.tsx`:
  - Verifies group callback payloads.
  - Verifies uncontrolled state updates.
  - Verifies disabled options do not emit changes.
  - Verifies day grid selection metadata.
- Verified:
  - `cd web && pnpm test -- --runInBand`
  - `cd web && npx tsc --noEmit`
  - `cd web && npx storybook build --test`

### Why

Individual app-ready widgets are useful, but app screens usually render sets of options. Without group components, every page repeats the same code: track selected value, compare each option, pass `selected`, pass callbacks, forward metadata. The group components make this pattern reusable and less error-prone.

### What worked

- `useControllableValue()` reduced repeated controlled/uncontrolled plumbing.
- The group APIs make Storybook examples shorter and clearer.
- Tests validate both controlled callback and uncontrolled internal state paths.

### What didn't work

- There is not yet a multi-select generic group beyond `ChipGroup`. Current service/budget/time/day groups are single-select.

### What I learned

- The component library wants two layers for many controls:
  - leaf option component (`ServiceOption`, `TimeSlot`, `DayCell`), and
  - option group component (`ServiceOptionGroup`, `TimeSlotGroup`, `DayPickerGrid`).
- This mirrors the way real app state is structured and should be the default pattern for future selectable widgets.

### What was tricky to build

- The groups need to preserve the child widget's metadata while overriding `previousValue` with the group-level selected value. That gives callers the complete state transition instead of only the clicked option's local selected state.

### What warrants a second pair of eyes

- Whether group components should support `allowDeselect` for optional single-select fields.
- Whether `useControllableValue()` should move to a more general hooks folder if more components use it.
- Whether the group components should expose labels/helper text like `ChipGroup` does.

### What should be done in the future

- Add a `LengthSilhouetteGroup`.
- Add `PhotoTileGrid` for upload/remove collections.
- Update the DSL renderer to support group nodes instead of only leaf nodes.

### Code review instructions

Start with:

- `web/src/fringe-ui/selection.ts`
- `web/src/molecules/ServiceOption/ServiceOptionGroup.tsx`
- `web/src/molecules/BudgetOption/BudgetOptionGroup.tsx`
- `web/src/molecules/TimeSlot/TimeSlotGroup.tsx`
- `web/src/molecules/DayCell/DayPickerGrid.tsx`
- `web/src/InteractiveWidgets.stories.tsx`
- `web/src/SelectionGroups.test.tsx`

Validate with:

```bash
cd web
pnpm test -- --runInBand
npx tsc --noEmit
npx storybook build --test
```

---

## Step 5: Wire interactive widgets into the DSL renderer

Extended the JSON DSL so it can render the new app-ready interactive widgets and route user changes back through named DSL actions. This is the bridge between the HAIR-032 declarative page system and the HAIR-033 interactive widget contracts.

The new Storybook stories demonstrate real local app state driving DSL-rendered pages. When a user picks services, budgets, tones, ratings, days, times, or photo tiles, the renderer sends `{ node, action, value, meta }` payloads to `context.actions`, the story updates state, and the page is re-created as JSON with the new selected values.

### Prompt Context

**User prompt (verbatim):** "ok, continue. I want interactive widgets with my dsl"

**Assistant interpretation:** Integrate the interactive widget/group APIs into the declarative page DSL so DSL-authored pages are not static and can drive app state through named actions.

**Inferred user intent:** Make the DSL useful for real app screens and experiments, not just static JSON-rendered layouts.

**Commit (code):** 603b6cc — "HAIR-033 Step 4: Wire interactive widgets into DSL renderer"

### What I did

- Extended `web/src/page-dsl/schema.ts` with interactive group node kinds:
  - `chipGroup`
  - `serviceOptionGroup`
  - `budgetOptionGroup`
  - `timeSlotGroup`
  - `dayPickerGrid`
- Extended the DSL action model:
  - actions now receive optional payloads with `node`, `action`, `value`, and `meta`.
- Extended `web/src/page-dsl/builder.ts` with helpers:
  - `n.chipGroup(...)`
  - `n.serviceOptionGroup(...)`
  - `n.budgetOptionGroup(...)`
  - `n.timeSlotGroup(...)`
  - `n.dayPickerGrid(...)`
- Updated `web/src/page-dsl/render.tsx`:
  - Renders the new group node kinds.
  - Routes widget/group changes to named DSL actions.
  - Updates leaf widgets to use `onSelect`, `onChange`, `onUpload`, and `onRemove` instead of only static `onClick` plumbing.
- Added `web/src/page-dsl/InteractiveDsl.stories.tsx`:
  - `Page DSL / Interactive Widgets / Interactive Intake`
  - `Page DSL / Interactive Widgets / Interactive Booking`
  - `Page DSL / Interactive Widgets / Interactive JSON Contract`
- Added `web/src/page-dsl/InteractiveDsl.test.tsx`:
  - Tests `chipGroup` action routing.
  - Tests `serviceOptionGroup` action routing.
  - Tests `photoTile` upload/remove action routing.
- Verified:
  - `cd web && pnpm test -- --runInBand`
  - `cd web && npx tsc --noEmit`
  - `cd web && npx storybook build --test`

### Why

The user specifically asked for interactive widgets with the DSL. The DSL already emitted JSON and rendered pages, but it needed a runtime action bridge so JSON nodes could participate in app state. Named actions keep the JSON serializable while still allowing React state updates at render time.

### What worked

- The named action pattern from HAIR-032 scaled to widget value changes.
- Group components made the renderer implementation compact.
- Storybook can demonstrate stateful DSL pages without making the JSON itself non-serializable.

### What didn't work

- JSON cannot hold setter functions, so the DSL stories need to rebuild page JSON after each state change. This is expected, but important to understand.
- The current payload type uses `unknown` for `meta`; a stricter per-node payload schema would be useful later.

### What I learned

- The right mental model is: DSL JSON describes the current UI state, and `context.actions` describes how runtime events produce the next state.
- The DSL should prefer group nodes for real app screens because group nodes expose concise app-level value changes.

### What was tricky to build

- The renderer has to adapt JSON-safe action names into strongly interactive widget callbacks. For example, `photoTile` has two different action names (`onUpload`, `onRemove`) and both must route through the same generic DSL payload mechanism.
- `key` handling from the previous DSL fix had to be preserved while adding more renderer branches.

### What warrants a second pair of eyes

- Whether `DslActionPayload.value` should be typed more narrowly per node kind.
- Whether action names should live in `props.action` for all widgets, or whether upload/remove/edit should keep semantic prop names like `onUpload`, `onRemove`, `onEdit`.
- Whether DSL group nodes should support uncontrolled defaults, or whether DSL pages should remain fully controlled by external app state.

### What should be done in the future

- Add DSL nodes for `LengthSilhouetteGroup` and `PhotoTileGrid` once those group components exist.
- Add JSON snapshot tests for interactive DSL pages.
- Consider a reducer helper that can consume DSL action payloads and update form state automatically.

### Code review instructions

Start with:

- `web/src/page-dsl/schema.ts`
- `web/src/page-dsl/builder.ts`
- `web/src/page-dsl/render.tsx`
- `web/src/page-dsl/InteractiveDsl.stories.tsx`
- `web/src/page-dsl/InteractiveDsl.test.tsx`

Validate with:

```bash
cd web
pnpm test -- --runInBand
npx tsc --noEmit
npx storybook build --test
```

Open Storybook:

```text
Page DSL / Interactive Widgets / Interactive Intake
Page DSL / Interactive Widgets / Interactive Booking
Page DSL / Interactive Widgets / Interactive JSON Contract
```

---

## Step 6: Make the segmented Cut/Color/Extensions tabs visibly stateful

Fixed the app-ready and DSL Storybook demos so the Cut/Color/Extensions segmented control is actually controlled by local state. Previously the segmented widget emitted a callback, but the demo pinned `value="color"` or only logged the event, so clicking another tab did not visibly update the selected state.

### Prompt Context

**User prompt (verbatim):** "The Tabs thing (Cut / Color / Extensions) doesn't seem to do anything either"

**Assistant interpretation:** The segmented tab control in the interactive demos should visibly change when clicked and update state like the other controls.

**Inferred user intent:** Ensure the interactive DSL demos are actually interactive, not just wired internally.

**Commit (code):** d30db28 — "HAIR-033 Step 5: Make segmented DSL tabs stateful"

### What I did

- Updated `web/src/InteractiveWidgets.stories.tsx`:
  - Added `category` state.
  - Changed `Segmented` from fixed `value="color"` to `value={category}`.
  - Changed `onChange` from `console.log` to `setCategory`.
  - Included `category` in the displayed state dump.
- Updated `web/src/page-dsl/InteractiveDsl.stories.tsx`:
  - Added `category` to the interactive DSL intake state.
  - Changed the DSL `n.segmented(...)` node to use `state.category`.
  - Changed the action from `segmentChanged` logging to `categoryChanged` state update.
  - Updated the JSON contract example.
- Verified:
  - `cd web && pnpm test -- --runInBand`
  - `cd web && npx tsc --noEmit`
  - `cd web && npx storybook build --test`

### Why

A demo that emits an event but does not update its selected value feels broken. Since these stories are intended to prove app-ready interactivity, the tab state must round-trip through local state just like services, budgets, chips, and ratings.

### What worked

- The existing DSL action bridge already supported the fix; the story only needed to update state from the action payload.

### What didn't work

- N/A.

### What I learned

- Interactive Storybook examples should always show visible state changes, not just log callbacks.

### What was tricky to build

- The segmented control itself was already app-ready; the bug was in the demo wiring. This is the kind of issue that interaction tests or Storybook play functions could catch later.

### What warrants a second pair of eyes

- Review other interactive DSL controls to ensure none only log changes without visible state updates.

### What should be done in the future

- Add Storybook play tests or interaction tests for the interactive DSL stories.

### Code review instructions

Check:

- `web/src/InteractiveWidgets.stories.tsx`
- `web/src/page-dsl/InteractiveDsl.stories.tsx`

Open Storybook and click Cut/Color/Extensions in:

```text
App Ready Widgets / Interactive Form Controls / Intake Selections
Page DSL / Interactive Widgets / Interactive Intake
```

---

## Step 7: Design the backend-driven DSL callback architecture

Stepped back from the browser-local DSL implementation and wrote a backend-driven architecture guide. The guide reframes the DSL as a server-owned page runtime: backend code builds page JSON, registers callbacks into a page-instance action registry, sends only opaque action references to the browser, and receives interaction events back from the frontend when users click/select/change controls.

This design answers the key production question: how can backend-authored DSL callbacks be invoked later when a frontend interaction happens, without trying to serialize functions into JSON or trusting the browser to choose handler names?

### Prompt Context

**User prompt (verbatim):** "Let's take a step back:

I want this DSL to run on the backend, and be able to register callbacks such that they will be called on later when said interaction happens in the frontend.

So for example, if I have a select list, and there is a select list on changed, or just the navigation button at the bottom, I want the browser to trigger the backend, tell it exactly what button got pressed, and this will then lookup the handler that got registered for that page. how would that work?

Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable.


Open with `md-view view ...` once you are done"

**Assistant interpretation:** Write a detailed intern-facing design guide for a backend-driven DSL runtime where backend page construction registers callbacks, browser interactions post opaque action references back to the backend, and the backend dispatches the correct registered handler.

**Inferred user intent:** Move from a frontend-local DSL proof-of-concept to a production server-driven UI design with clear callback registration, event dispatch, authorization, idempotency, and implementation steps.

**Commit (code):** N/A — documentation/design step only

### What I did

- Created design doc `Backend Driven DSL Callback Architecture Guide` in HAIR-033.
- Explained the target architecture:
  - backend builder creates page instances,
  - backend action registry stores callbacks/action handlers,
  - browser receives opaque action ids,
  - browser posts interaction events to backend,
  - backend validates and dispatches the registered handler,
  - backend returns the next page JSON/effects.
- Included diagrams, API sketches, Go pseudocode, TypeScript pseudocode, persistence strategy, security rules, and an implementation plan.
- Related the doc to current frontend DSL files and existing backend route/intake service files.

### Why

The current DSL runs entirely in frontend Storybook/local React state. The requested production model is backend authoritative: callbacks should be registered while backend code builds the page, and invoked later when the browser reports a specific interaction.

### What worked

- The existing `DslActionPayload` and renderer action bridge provided a useful stepping stone for describing the browser-to-backend event payload.
- The existing Go `http.ServeMux` routing style gives a straightforward place to add `/api/dsl/...` endpoints.

### What didn't work

- N/A; this was a design/documentation step.

### What I learned

- The central abstraction should be `PageInstance`: page JSON, server state, action registry, owner/session, version, and expiry.
- Production should prefer symbolic handler keys plus serializable bound args over in-memory Go closures, even if an in-memory closure runtime is useful for the first local prototype.

### What was tricky to build

- The design has to satisfy two competing goals: backend developer ergonomics should feel like registering callbacks, but the runtime cannot serialize callbacks to the browser. Opaque action ids solve this by giving the browser a safe token while keeping handler lookup server-side.

### What warrants a second pair of eyes

- Whether the first implementation should support only in-memory callbacks or start directly with symbolic handler keys and persisted page instances.
- Whether page-version mismatches should reject events or allow automatic rebasing.
- Whether action refs should be random ids stored server-side or signed tokens.

### What should be done in the future

- Implement the recommended first slice:
  - `pkg/dsl/schema.go`,
  - `pkg/dsl/runtime.go`,
  - `pkg/server/handlers_dsl.go`,
  - `web/src/page-dsl/BackendDslPage.tsx`,
  - one backend-driven segmented control and footer-next proof.

### Code review instructions

Read:

- `ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/02-backend-driven-dsl-callback-architecture-guide.md`

Then compare against:

- `web/src/page-dsl/schema.ts`
- `web/src/page-dsl/render.tsx`
- `pkg/server/http.go`


---

## Step 8: Document the Goja-hosted multi-step intake DSL model

Created a third HAIR-033 design document focused on the corrected backend model: the DSL is JavaScript running inside a Goja sandbox hosted by the Go backend. In that model, JavaScript flow scripts build JSON pages, register callbacks through the Go host, and return next pages when the browser posts interaction events.

The document explains what a multi-step intake flow looks like with Goja: service, color, photos, budget, booking, and confirm steps; JSON-serializable flow state; `ctx.action(...)` callback registration; per-session action registries; Goja runtime constraints; and the frontend event dispatch needed to connect the browser renderer to the backend sandbox.

### Prompt Context

**User prompt (verbatim):** "Oh the backend API is actually:

JS in a goja sandbox inside the go itself.

So one question I have, what would a multi step intake look like with that concept?

Create a 3rd document."

**User prompt (verbatim):** "md-view too when done"

**Assistant interpretation:** Add a third design document to HAIR-033 that revises the backend callback architecture around Goja-hosted JavaScript, with a concrete multi-step intake example, and open it with md-view.

**Inferred user intent:** Clarify the intended backend API and provide an implementation guide for building multi-step intake flows in JavaScript inside Go, rather than pure Go handlers or browser-local callbacks.

**Commit (code):** N/A — documentation/design step only

### What I did

- Created `design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md`.
- Documented:
  - flow scripts loaded into Goja,
  - `ctx.action(...)` callback registration,
  - session-scoped action registries,
  - multi-step intake state machine design,
  - service/color/photos/budget/booking/confirm steps,
  - frontend/backend event payloads,
  - Goja runtime constraints and locking,
  - host modules such as `fringe/dsl` and `fringe/intake`,
  - implementation phases and test plan.
- Related the document to current frontend DSL files and backend service/route files.
- Opened the document with `md-view` in a tmux session.

### Why

The previous backend-driven guide was directionally correct, but too generic: it treated handlers as Go functions or symbolic handler keys. The actual target is JavaScript callbacks in a Goja sandbox, so the architecture needs to explain runtime lifecycle, callback registration, sandbox modules, and what a real multi-step intake script would look like.

### What worked

- The current TypeScript DSL builder maps naturally to a Goja-hosted JavaScript API.
- The current frontend renderer can remain the browser-side JSON interpreter, with an added backend event transport.

### What didn't work

- N/A; this was documentation.

### What I learned

- The first implementation can use in-memory Goja sessions with live callback closures, but the flow state should still remain JSON-serializable so a persisted/recreated runtime is possible later.

### What was tricky to build

- The guide needed to preserve the ergonomic "register a callback" programming model while still explaining that the browser only receives opaque action ids. The registered Goja callback remains server-side.

### What warrants a second pair of eyes

- Whether the first runtime should use one Goja VM per active flow session or recreate a VM per event from persisted state.
- Whether action callbacks should be closures in the first prototype or symbolic function references from the start.

### What should be done in the future

- Implement `pkg/dslgoja` with a minimal in-memory flow runtime and one two-step intake prototype.
- Add `BackendDslPage` support for backend action refs.

### Code review instructions

Read:

- `ttmp/2026/05/13/HAIR-033--make-fringe-widgets-interactive-and-app-ready/design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md`

Then compare against:

- `web/src/page-dsl/schema.ts`
- `web/src/page-dsl/render.tsx`
- `pkg/server/http.go`

---

## Step 9: Clarify long-running Goja VM and old action lifecycle

Updated the Goja multi-step intake design document to clarify the intended runtime lifecycle: one long-running Goja VM per active flow session is the recommended first implementation, but registered actions remain page-version scoped. Old actions should become stale after a successful re-render, rather than staying callable for the entire VM lifetime.

This distinction is important for safety and memory management. The VM and flow state can live for the whole intake session, while the currently valid action callbacks should match only the currently rendered page version. Retired actions keep lightweight metadata briefly for diagnostics and stale-page recovery, but old `goja.Callable` closures should be released after page advances.

### Prompt Context

**User prompt (verbatim):** "Update the design document."

**Assistant interpretation:** Incorporate the discussion about old registered actions and long-running VMs into the Goja multi-step intake design document.

**Inferred user intent:** Make the design document accurately reflect the desired runtime model before implementation starts.

**Commit (code):** TBD — documentation update only

### What I did

- Updated `design-doc/03-goja-sandbox-multi-step-intake-dsl-guide.md`.
- Rewrote dispatch pseudocode to:
  - check idempotency first,
  - reject/recover stale page-version events,
  - dispatch only current-page actions,
  - return current page for retired action ids,
  - call Goja with timeout handling,
  - commit successful rendered pages transactionally.
- Replaced the old page rendering cycle section with a detailed page-version-scoped action lifecycle section.
- Added render transaction pseudocode:
  - collect `NextActions`,
  - commit only after successful render,
  - retire previous action metadata,
  - prune old processed events and retired actions.
- Expanded persistence/runtime recommendations to prefer one long-running VM per active flow session for the first implementation.
- Updated the final recommendation with the lifecycle rule:
  - VM lifetime: whole flow session,
  - state lifetime: whole flow session,
  - action callback lifetime: current page version,
  - old action behavior: stale/recover current page, never silently run.
- Validated doc frontmatter with `docmgr validate frontmatter`.

### Why

A long-running VM is useful for ergonomic JavaScript callbacks, but it would be unsafe and leaky if every registered callback remained valid forever. Page-version-scoped actions give us the ergonomic Goja model while preventing stale UI events from mutating newer flow state.

### What worked

- The existing document structure already had sections for dispatch, rendering cycle, persistence, and final recommendation, so the lifecycle clarification fit naturally.

### What didn't work

- The first `docmgr validate frontmatter` command used a path with an accidental doubled `ttmp/` prefix and failed with:
  - `Error: open .../ttmp/ttmp/...: no such file or directory`
- Re-running with the path relative to the docmgr root succeeded.

### What I learned

- The most precise model is not "one VM per user" but "one VM per active flow session". A user may have multiple flows/tabs; each needs isolated state and action registries.

### What was tricky to build

- The design has to separate VM lifetime from action lifetime. Long-running VM does not imply long-running callbacks. Current actions should be replaced atomically on successful render, while old actions should become stale and recoverable.

### What warrants a second pair of eyes

- Whether stale action events should always return the current page with an informational effect or sometimes return an HTTP conflict.
- The exact retention window for `ProcessedEvents` and `RetiredActions`.

### What should be done in the future

- Implement the render transaction and action lifecycle exactly this way in the first `pkg/dslgoja` prototype.

### Code review instructions

Review these updated sections in the design doc:

- `Dispatch`
- `Page Rendering Cycle and Old Action Lifecycle`
- `Persistence and VM Lifetime Choices`
- `Final Recommendation`

---

## Step 10: Add the Go DSL JSON schema foundation

Started the implementation phase for the Goja-backed backend DSL by adding the Go-side JSON schema types. This is the lowest layer: before Goja can build pages or dispatch actions, the backend needs structs that serialize to the same JSON shape the frontend renderer already understands.

The new `pkg/dslgoja` package currently contains only schema and DTO types. It does not yet load Goja or execute JavaScript. Keeping this first step small gives us a stable contract for later runtime, builder, action registry, and HTTP endpoint work.

### Prompt Context

**User prompt (verbatim):** "add detailed list of tasks to the ticket, and then work on them one by one, keeping a detailed diary as you work."

**Assistant interpretation:** Add a detailed implementation checklist to HAIR-033, then begin completing tasks sequentially while recording each completed step in the diary.

**Inferred user intent:** Move from design documents into implementation with disciplined ticket bookkeeping and a clear continuation trail.

**Commit (code):** 6d4e7e9 — "HAIR-033 Step 10: Add Go DSL JSON schema types"

### What I did

- Added detailed implementation tasks 10–22 to HAIR-033.
- Created `pkg/dslgoja/schema.go` with:
  - `Page`
  - `Shell`
  - `Node`
  - `NodeMeta`
  - `ActionRef`
  - `NodeActions`
  - `Effect`
  - `InteractionEvent`
  - `InteractionResult`
  - `NewPage(...)`
- Created `pkg/dslgoja/schema_test.go` with JSON contract tests:
  - page JSON uses frontend field names such as `schemaVersion`, `shell`, `props`, `nodes`, `meta`, and `kind`.
  - interaction event JSON uses expected browser/backend field names such as `eventId`, `sessionId`, `pageVersion`, `nodeId`, `actionId`, `event`, and `value`.
- Ran:

```bash
go test ./pkg/dslgoja -count=1
```

### Why

The frontend renderer already understands a specific JSON page contract. A Goja-hosted backend DSL must emit that same contract, so the first implementation task is to define Go structs that marshal correctly.

### What worked

- The schema package is independent of Goja, so it compiles and tests quickly.
- The JSON round-trip tests give us a small guardrail against accidental field-name drift.

### What didn't work

- N/A.

### What I learned

- Starting with schema avoids mixing Goja runtime concerns with JSON contract concerns.
- `map[string]any` is the pragmatic choice for node props because frontend DSL props are intentionally JSON-object shaped and vary by node kind.

### What was tricky to build

- The schema needs to be strict enough to document the contract but flexible enough for arbitrary node props and future widget kinds. The compromise is typed top-level structs plus `map[string]any` for props/meta payload details.

### What warrants a second pair of eyes

- Whether `Effect` should remain generic or be split into typed effect variants once backend dispatch is implemented.
- Whether `NodeMeta` should be pointer or value. It is currently `*NodeMeta` so `omitempty` removes empty metadata cleanly.

### What should be done in the future

- Task 11: implement a minimal Goja flow runtime that can start a flow, expose `ctx.action`, render the first page, and hold session state.

### Code review instructions

Start with:

- `pkg/dslgoja/schema.go`
- `pkg/dslgoja/schema_test.go`

Validate with:

```bash
go test ./pkg/dslgoja -count=1
```

---

## Step 11: Add the minimal Goja flow runtime

Implemented the first executable Goja-backed DSL slice. The backend can now start a flow from JavaScript source, create a Goja runtime, call `initialState()`, expose a `ctx` object with `ctx.state` and `ctx.action(...)`, call `render(ctx)`, export the returned JavaScript object into the Go `Page` JSON contract, and return an initial `InteractionResult`.

This is intentionally still a minimal runtime. It proves that JavaScript inside Go can register server-side callbacks and emit browser-renderable JSON, but it does not yet dispatch browser events back into callbacks or implement render transactions/stale-action handling.

### Prompt Context

**User prompt (verbatim):** (same as Step 10)

**Assistant interpretation:** Continue the task list one item at a time and record each implementation step in the diary.

**Inferred user intent:** Build the Goja backend DSL incrementally with verifiable commits and clear continuation notes.

**Commit (code):** 7dac9ed — "HAIR-033 Step 11: Add minimal Goja flow runtime"

### What I did

- Added dependency `github.com/dop251/goja`.
- Created `pkg/dslgoja/runtime.go` with:
  - `Runtime`
  - `FlowSession`
  - `ActionRegistration`
  - `StartFlow(...)`
  - `Render(...)`
  - `ctx.action(...)`
  - timeout-aware Goja function invocation
  - JSON export from Goja values to the Go `Page` struct
- Created tests in `pkg/dslgoja/runtime_test.go`:
  - start flow with `initialState()` and `render(ctx)`,
  - verify session id and page version,
  - verify initial page id,
  - verify actions were registered,
  - verify action refs are embedded in page JSON,
  - verify flows without `initialState()` receive an empty state object.
- Ran:

```bash
go test ./pkg/dslgoja -count=1
```

### Why

The design documents are now concrete enough to start prototyping. This step proves the core embedding concept before adding more complex action lifecycle behavior: JavaScript runs inside Go, can access `ctx.state`, can call `ctx.action`, and can return JSON that matches the frontend contract.

### What worked

- `ctx.action(name, callback, event)` successfully stores a Goja callback in the session and returns a JSON-safe `{ id, event }` action reference.
- Goja JavaScript objects can be exported to the Go JSON contract by marshaling `value.Export()` to JSON and unmarshaling into `Page`.

### What didn't work

- First attempt used `vm.ExportTo(value, &page)` directly. That produced empty fields because Goja export does not use JSON tags like `schemaVersion` -> `SchemaVersion` in the way we need.
- Fix: export to generic Go values, JSON-marshal, then JSON-unmarshal into the tagged DTO.
- First wrapper assumed `initialState` always existed, causing `ReferenceError: initialState is not defined` for scripts without it.
- Fix: wrapper now returns `initialState: (typeof initialState === 'function' ? initialState : undefined)`.

### What I learned

- JSON tags are the safest boundary for Goja-to-DTO conversion because the browser contract is JSON, not Go field names.
- A minimal Goja runtime can be implemented without adding a module system yet; the script wrapper can return `{ initialState, render }` for the first prototype.

### What was tricky to build

- Exporting JavaScript objects into Go structs required respecting JSON tags. Direct Goja export was not enough because the frontend contract uses lower/camel-case keys.
- The runtime must be careful with timeouts and `vm.Interrupt`, even in early prototypes, because flow scripts are arbitrary JavaScript.

### What warrants a second pair of eyes

- Whether `ctx.action` should infer event names or always require an explicit event argument.
- Whether the script wrapper should be replaced by a CommonJS-like `module.exports` API before more examples are written.

### What should be done in the future

- Task 12: replace the current simple action reset with page-version-scoped current/retired action maps, processed event idempotency, and render transactions.

### Code review instructions

Start with:

- `pkg/dslgoja/runtime.go`
- `pkg/dslgoja/runtime_test.go`

Validate with:

```bash
go test ./pkg/dslgoja -count=1
```

---

## Step 12: Add page-version-scoped action lifecycle and render transactions

Implemented the first version of the action lifecycle described in the Goja design document. Flow sessions now distinguish current actions from retired action metadata, and rendering is transactional: new actions are collected in a temporary map and only replace the current action registry after the page successfully exports.

This means a failed render no longer risks clearing the currently usable page actions. A successful re-render retires old actions and installs a fresh current action set for the new page version.

### Prompt Context

**User prompt (verbatim):** (same as Step 10)

**Assistant interpretation:** Continue the HAIR-033 task list sequentially, implementing the page-version action lifecycle next.

**Inferred user intent:** Build the Goja runtime according to the design, with safe stale-action and render lifecycle semantics rather than a throwaway prototype.

**Commit (code):** 343626e — "HAIR-033 Step 12: Add page-version action lifecycle"

### What I did

- Updated `pkg/dslgoja/runtime.go`:
  - Added `CurrentActions`, `RetiredActions`, and `ProcessedEvents` to `FlowSession`.
  - Added action `Version` and `NodeID` fields.
  - Added `RetiredActionInfo`.
  - Added `renderTransaction` with `NextActions`.
  - Changed `ctx.action(...)` to register into `NextActions` rather than mutating the current action map directly.
  - Changed render commit to retire previous actions and install the new action set only after successful page export.
- Added `pkg/dslgoja/action_lifecycle_test.go`:
  - verifies successful re-render retires old actions,
  - verifies failed render keeps old page version/current actions and does not retire them.
- Ran:

```bash
go test ./pkg/dslgoja -count=1
```

### Why

The user asked what happens to old registered actions and suggested long-running VMs. The answer is that VM/session state can be long-running, but action callbacks should be scoped to the current page version. This implementation starts enforcing that model in the runtime data structures.

### What worked

- The transaction pattern fit cleanly into the existing `Render` method.
- Tests prove both commit and rollback behavior.

### What didn't work

- N/A.

### What I learned

- It is important that `ctx.action` writes into a render transaction, not directly into `session.CurrentActions`. Otherwise a render failure can leave the session half-mutated.

### What was tricky to build

- The runtime currently does not know node ids while registering actions. `NodeID` exists on `ActionRegistration`, but it remains empty until the builder module can set the current node context. That will be addressed when the JS builder module is implemented.

### What warrants a second pair of eyes

- Whether to prune `RetiredActions` by time, count, or page-version window in the first dispatch implementation.
- Whether render failures should return an error response or a same-page result with an error effect.

### What should be done in the future

- Task 13: expose a `fringe/dsl`-style builder module inside Goja so scripts do not have to hand-author raw JSON objects and so node/action context can become more structured.

### Code review instructions

Start with:

- `pkg/dslgoja/runtime.go`
- `pkg/dslgoja/action_lifecycle_test.go`

Validate with:

```bash
go test ./pkg/dslgoja -count=1
```

---

## Step 13: Expose the `fringe/dsl` JavaScript builder module in Goja

Added the first host-provided JavaScript module for flow scripts: `require("fringe/dsl")`. This lets Goja scripts author pages with an ergonomic builder API instead of hand-writing raw JSON objects. The module mirrors the frontend builder style closely enough for the first backend-driven intake prototype.

Flow scripts can now write `const { page, n } = require("fringe/dsl")`, build pages with `.intake(...).add(...)`, and use node helpers such as `n.segmented(...)`, `n.chipGroup(...)`, and `n.serviceOptionGroup(...)`.

### Prompt Context

**User prompt (verbatim):** (same as Step 10)

**Assistant interpretation:** Continue the HAIR-033 implementation checklist with the next task: exposing a DSL builder API inside the Goja sandbox.

**Inferred user intent:** Make backend-hosted JavaScript flow scripts feel like the frontend DSL, rather than requiring verbose raw JSON.

**Commit (code):** 8bffef1 — "HAIR-033 Step 13: Expose fringe DSL module in Goja"

### What I did

- Added `pkg/dslgoja/modules_dsl.go`.
- Implemented `installDSLModule(vm)`.
- Added a minimal CommonJS-like `require(name)` function.
- Registered `require("fringe/dsl")` with exports:
  - `page(id, title)`
  - `n.text(...)`
  - `n.spacer(...)`
  - `n.stack(...)`
  - `n.grid(...)`
  - `n.eyebrow(...)`
  - `n.button(...)`
  - `n.chipGroup(...)`
  - `n.note(...)`
  - `n.card(...)`
  - `n.ratingBar(...)`
  - `n.segmented(...)`
  - `n.serviceOptionGroup(...)`
  - `n.budgetOptionGroup(...)`
  - `n.timeSlotGroup(...)`
  - `n.dayPickerGrid(...)`
  - `n.photoTile(...)`
  - `n.summaryRow(...)`
- Updated `StartFlow(...)` to install the module before loading flow source.
- Added `pkg/dslgoja/modules_dsl_test.go`:
  - verifies a flow script can require `fringe/dsl`, build an intake page, embed action refs, and export frontend-compatible JSON.
  - verifies unknown modules fail clearly.
- Ran:

```bash
go test ./pkg/dslgoja -count=1
```

### Why

The design target is JavaScript in Goja, but the authoring experience should still be a DSL. Providing `fringe/dsl` inside the sandbox makes flow scripts concise and close to the TypeScript examples we already built.

### What worked

- A pure-JavaScript module loaded into Goja is enough for the first builder layer.
- The builder emits JSON that marshals into the Go `Page` struct and should be renderable by the frontend.

### What didn't work

- N/A.

### What I learned

- We do not need a full module system yet. A small allow-listed `require(...)` implementation is sufficient for `fringe/dsl` and can later be extended to host modules such as `fringe/intake`.

### What was tricky to build

- The builder must deep-clone via JSON before returning `toJSON()` output so that flow scripts do not accidentally leak methods/functions into the page contract.

### What warrants a second pair of eyes

- Whether the builder helper list should exactly mirror the frontend builder now or remain minimal until the runtime stabilizes.
- Whether `require(...)` should support module caching/objects per runtime in a more formal Go-side registry.

### What should be done in the future

- Task 14: create a real two-step `intake.flow.js` prototype using `require("fringe/dsl")`.

### Code review instructions

Start with:

- `pkg/dslgoja/modules_dsl.go`
- `pkg/dslgoja/modules_dsl_test.go`
- `pkg/dslgoja/runtime.go`

Validate with:

```bash
go test ./pkg/dslgoja -count=1
```

---

## Step 14: Add the embedded two-step Goja intake flow prototype

Added the first real flow script: an embedded `intake.flow.js` that runs inside Goja and uses `require("fringe/dsl")`. The prototype has two steps, `service` and `color`, and registers callbacks for shell navigation plus interactive widgets.

This is not yet wired to HTTP or browser event dispatch, but it proves the script shape we want: JavaScript flow state, page rendering by step, DSL widget construction, and action registration for future dispatch.

### Prompt Context

**User prompt (verbatim):** (same as Step 10)

**Assistant interpretation:** Continue the detailed HAIR-033 implementation task list with the two-step intake flow prototype.

**Inferred user intent:** Make the Goja DSL concrete by showing what an actual multi-step intake script looks like in the repo.

**Commit (code):** 553d115 — "HAIR-033 Step 14: Add Goja intake flow prototype"

### What I did

- Added `pkg/dslgoja/flows/intake.flow.js`:
  - `initialState()` returns JSON-serializable flow state.
  - `render(ctx)` switches on `ctx.state.step`.
  - `serviceStep(ctx)` renders:
    - text intro,
    - segmented Cut/Color/Extensions tabs,
    - service option group,
    - shell next/skip actions.
  - `colorStep(ctx)` renders:
    - tone chip group,
    - interactive damage rating bar,
    - shell back/next actions.
- Added `pkg/dslgoja/flows.go` with embedded `DemoIntakeFlowSource`.
- Added `pkg/dslgoja/intake_flow_test.go`:
  - verifies the demo flow starts on the service page,
  - verifies the color page can render after setting `ctx.state.step = "color"`.
- Adjusted `ctx.action` registration to look up the active render transaction from the session, rather than closing over the initial transaction. This prepares the runtime for callbacks that call `render(ctx)` later during event dispatch.
- Ran:

```bash
go test ./pkg/dslgoja -count=1
```

### Why

A design is much easier to validate when there is a real script in the repository. The two-step flow demonstrates how Goja-hosted JS should author a backend-driven intake wizard.

### What worked

- The `fringe/dsl` builder is expressive enough for the first two intake steps.
- Embedding the flow source with `go:embed` gives tests and future HTTP endpoints a stable demo flow.

### What didn't work

- N/A.

### What I learned

- Callback-triggered re-renders require `ctx.action` to register against the currently active render transaction. A closure over an old transaction would make future dispatch register actions into the wrong action map.

### What was tricky to build

- The current runtime still lacks event dispatch, so tests render the color step by mutating state directly. Full callback invocation will be covered by the dispatch task.

### What warrants a second pair of eyes

- Whether `colorStep` next should go to a future photos step or loop back to service in the prototype. It currently loops for minimal two-step testing.

### What should be done in the future

- Task 15: implement event dispatch into registered Goja callbacks so the service/color prototype can actually advance via action ids.

### Code review instructions

Start with:

- `pkg/dslgoja/flows/intake.flow.js`
- `pkg/dslgoja/flows.go`
- `pkg/dslgoja/intake_flow_test.go`
- the `ctx.action` change in `pkg/dslgoja/runtime.go`

Validate with:

```bash
go test ./pkg/dslgoja -count=1
```

---

## Step 15: Dispatch browser interaction events into Goja callbacks

Implemented the core backend callback loop: a `FlowSession` can now receive an `InteractionEvent`, validate it against the current page version/action registry, invoke the registered Goja callback, export the callback-returned page, commit the new page/actions, and cache the result for idempotent duplicate event ids.

This is the first step where the earlier design becomes real: the browser can send an opaque action id and value, and the backend can route it to the Goja callback that was registered during page construction.

### Prompt Context

**User prompt (verbatim):** (same as Step 10)

**Assistant interpretation:** Continue the HAIR-033 implementation task list with event dispatch into registered Goja callbacks.

**Inferred user intent:** Turn the Goja DSL prototype from a static page renderer into an interactive backend-driven runtime.

**Commit (code):** d6298c4 — "HAIR-033 Step 15: Dispatch events into Goja callbacks"

### What I did

- Added `FlowSession.Dispatch(ctx, event)` in `pkg/dslgoja/runtime.go`.
- Dispatch now:
  - locks the session,
  - returns cached results for duplicate `eventId`,
  - returns a stale current-page result for mismatched `pageVersion`,
  - looks up only `CurrentActions`,
  - returns stale current-page results for retired action ids,
  - validates node/action match when `NodeID` is known,
  - calls the Goja callback with a lowerCamelCase JS event object,
  - exports the returned page,
  - commits the page through the render transaction lifecycle,
  - stores processed event results for idempotency.
- Added `pkg/dslgoja/dispatch_test.go`:
  - category segmented change updates page JSON,
  - shell next action moves to color step,
  - stale old action returns current page with info effect,
  - duplicate event id returns cached result without incrementing session version.
- Ran:

```bash
go test ./pkg/dslgoja -count=1
```

### Why

The user's central requirement is that a frontend interaction triggers the backend, and the backend looks up the registered handler for that page. Dispatch is the runtime method that makes that possible.

### What worked

- The Goja callback closures registered via `ctx.action` can mutate `ctx.state` and return `render(ctx)`.
- The active render transaction pattern lets callback-triggered renders register fresh actions for the returned page.
- Idempotency is simple and effective when checked before version/action validation.

### What didn't work

- First attempt passed the Go `InteractionEvent` struct directly to Goja with `vm.ToValue(event)`. JavaScript callbacks expected `event.value`, but Goja exposed Go field names instead, so `event.value` was undefined.
- Fix: convert the event to a lowerCamelCase `map[string]any` before passing it into JS.

### What I learned

- Every Go-to-JavaScript boundary should be treated like a JSON API boundary. Use the same lowerCamelCase names the JS author expects, not Go struct field names.

### What was tricky to build

- Callback-returned pages need to be committed the same way normal renders are committed. The runtime cannot simply call the callback and return the page; it must retire old actions, install new actions, increment the version, and cache the result.

### What warrants a second pair of eyes

- Whether stale page-version events should always return `200` with current page/effect or use an HTTP-level conflict once endpoints exist.
- How to assign `NodeID` into `ActionRegistration`; this likely belongs in the builder/node context layer.

### What should be done in the future

- Task 16: expand and consolidate Go tests for the runtime, including the required coverage from the ticket task.

### Code review instructions

Start with:

- `pkg/dslgoja/runtime.go` (`Dispatch`, `interactionEventObject`, stale/error result helpers)
- `pkg/dslgoja/dispatch_test.go`

Validate with:

```bash
go test ./pkg/dslgoja -count=1
```
