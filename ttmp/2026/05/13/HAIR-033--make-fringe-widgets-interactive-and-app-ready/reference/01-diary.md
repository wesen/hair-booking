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
