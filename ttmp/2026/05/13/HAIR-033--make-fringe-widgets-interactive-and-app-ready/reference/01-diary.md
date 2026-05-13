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
