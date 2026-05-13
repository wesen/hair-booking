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
