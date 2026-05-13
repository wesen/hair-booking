---
Title: Interactive Widget Props Callbacks and App Integration Guide
Ticket: HAIR-033
Status: active
Topics:
    - frontend
    - react
    - storybook
    - design-system
    - state-management
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: "Plan for turning Fringe widgets into app-ready interactive controls with clear controlled props, callbacks, accessibility behavior, Storybook demos, and tests."
LastUpdated: 2026-05-13T06:10:00-04:00
WhatFor: "Use when implementing interaction contracts for the Fringe atoms, molecules, organisms, and DSL renderer."
WhenToUse: "Use before modifying widget props/callbacks, adding interactive stories, or wiring widgets into application state."
---

# Interactive Widget Props Callbacks and App Integration Guide

## Executive Summary

HAIR-033 is the productionization pass for the Fringe widget library. HAIR-031/HAIR-032 created a strong visual system, page organisms, and a JSON-backed DSL. The next step is to make the widgets genuinely usable in a real app: selectable controls need values and callbacks, upload tiles need state, ratings need change events, segmented controls need typed options, and page-level organisms need predictable state boundaries.

The guiding principle is:

> A widget should be visually complete, interaction-complete, and easy to wire into app state without reverse-engineering its internals.

## Problem Statement

Many widgets currently support enough props for visual parity and Storybook screenshots, but not enough for application use. For example, a `Chip` can display `selected`, but there is not yet a rich pattern for a group of chips where users can toggle multiple values and receive a predictable callback payload.

This affects:

- app flow implementation,
- DSL rendering,
- Storybook interaction examples,
- form state management,
- accessibility,
- testing,
- and long-term maintainability.

## Proposed Solution

Perform a widget-by-widget interaction audit and standardize on controlled React contracts.

### General controlled pattern

```tsx
<Widget
  value={value}
  onChange={(nextValue, meta) => setValue(nextValue)}
/>
```

For boolean/selectable widgets:

```tsx
<Chip
  selected={selected}
  onSelectedChange={(nextSelected, meta) => ...}
/>
```

For groups:

```tsx
<ChipGroup
  options={options}
  value={["dimensional", "low-maintenance"]}
  selectionMode="multiple"
  onChange={(nextValues, meta) => setValues(nextValues)}
/>
```

## Target Callback Conventions

Callbacks should answer three questions:

1. What changed?
2. What is the full next value?
3. Which user action caused it?

Suggested payload shape:

```ts
type ChangeMeta<TItem = unknown> = {
  id?: string;
  item?: TItem;
  action: "select" | "deselect" | "toggle" | "clear" | "edit" | "upload" | "remove";
  source: "pointer" | "keyboard" | "programmatic";
};
```

Examples:

```tsx
onChange(nextValues, { action: "toggle", item, source: "pointer" })
onSelectedChange(nextSelected, { action: nextSelected ? "select" : "deselect" })
onEdit({ field: "budget" })
```

## Initial Widget Inventory

| Widget | Current role | Needed interaction work |
|---|---|---|
| `Chip` | Visual selectable pill | Add stronger toggle semantics and keyboard/accessibility behavior. |
| `Segmented` | Single selection control | Ensure typed `options`, `value`, `onChange(nextValue, meta)`. |
| `RatingBar` | Visual rating display | Add optional interactive mode and `onChange`. |
| `ServiceOption` | Selectable service card | Standardize `value`, `selected`, `onSelect`/`onChange`. |
| `BudgetOption` | Selectable budget card | Same as service option. |
| `TimeSlot` | Selectable time button | Add disabled reason and callback payload. |
| `DayCell` | Calendar day cell | Add date/value support, keyboard semantics, disabled reason. |
| `PhotoTile` | Upload placeholder/filled tile | Add upload/remove/preview callbacks and state variants. |
| `SummaryRow` | Review row with edit action | Standardize `onEdit(field, meta)`. |
| `StylistCard` | Stylist summary/select card | Decide if selectable; add `onSelect` if yes. |
| `LengthSilhouette` | Selectable hair length | Add value and selection callback. |
| `ColorLevelBar` | Color level visualization | Consider interactive current/target selection. |

## Implementation Plan

1. Inventory all widgets and current props.
2. Define shared callback/meta types.
3. Implement `ChipGroup` as the first reference pattern.
4. Upgrade individual selectable widgets.
5. Add Storybook interaction demos using `useState`.
6. Add tests for callback payloads and toggling behavior.
7. Update DSL renderer to map JSON action/value props to the new widget APIs.

## Reference Example: Toggled Chip Set

```tsx
function ToneSelector() {
  const [tones, setTones] = useState<string[]>(["dimensional"]);

  return (
    <ChipGroup
      label="Tone family"
      selectionMode="multiple"
      value={tones}
      options={[
        { value: "neutral", label: "Neutral" },
        { value: "warm", label: "Warm" },
        { value: "cool", label: "Cool" },
        { value: "dimensional", label: "Dimensional" },
      ]}
      onChange={setTones}
    />
  );
}
```

## Open Questions

- Should all selectable cards use `onChange(value, meta)` or `onSelect(value, meta)`?
- Should the DSL action system support structured callback payloads now or later?
- Which widgets need uncontrolled defaults (`defaultValue`) versus controlled-only APIs?
- How much keyboard navigation is required for the first pass?

## Implementation Note: ChipGroup Reference Pattern

Implemented in commit `277df67`.

`ChipGroup` is the first reference implementation for selectable widget contracts. It uses the following rules:

- Component can be **controlled** with `value`.
- Component can be **uncontrolled** with `defaultValue`.
- Values are strings and the selected value is represented as `string[]`.
- Single-select mode still emits an array, but with zero or one item.
- `onChange(nextValue, meta)` receives the full next value plus metadata.

Example:

```tsx
const [tones, setTones] = useState<string[]>(["dimensional"]);

<ChipGroup
  label="Tone family"
  selectionMode="multiple"
  value={tones}
  options={[
    { value: "neutral", label: "Neutral" },
    { value: "warm", label: "Warm" },
    { value: "cool", label: "Cool" },
    { value: "dimensional", label: "Dimensional" },
  ]}
  onChange={(nextValues, meta) => {
    console.log(meta.action, meta.value, meta.previousValue);
    setTones(nextValues);
  }}
/>
```

This should be used as the model for the next selectable components.

## Implementation Note: Shared Interaction Metadata and Selectable Widgets

Implemented in commit `85f548b`.

The shared metadata lives in:

```text
web/src/fringe-ui/interactions.ts
```

The main type is:

```ts
interface SelectionChangeMeta<TValue extends string = string, TItem = unknown> {
  value?: TValue;
  label?: ReactNode;
  item?: TItem;
  action: SelectionAction;
  source: InteractionSource;
  previousValue?: TValue | TValue[] | number | null;
}
```

The first upgraded widgets are:

- `Segmented`: `onChange(value, meta)`
- `RatingBar`: `interactive` + `onChange(value, meta)`
- `ServiceOption`: `onSelect(value, meta)`
- `BudgetOption`: `onSelect(value, meta)`
- `TimeSlot`: `onSelect(value, meta)`
- `DayCell`: `onSelect(value, meta)`
- `LengthSilhouette`: `onSelect(value, meta)`
- `PhotoTile`: `onUpload(value, meta)` and `onRemove(value, meta)`

Storybook examples live under:

```text
App Ready Widgets / Interactive Form Controls
```

## Implementation Note: Selection Group Components

Implemented in commit `96ba17e`.

The widget library now has group-level abstractions for common single-select option sets:

- `ServiceOptionGroup`
- `BudgetOptionGroup`
- `TimeSlotGroup`
- `DayPickerGrid`

These components use `useControllableValue()` from:

```text
web/src/fringe-ui/selection.ts
```

The pattern is:

```tsx
<ServiceOptionGroup
  options={serviceOptions}
  value={service}
  onChange={(nextService, meta) => {
    console.log(meta.previousValue, "→", nextService);
    setService(nextService);
  }}
/>
```

Use the group components in app pages instead of manually mapping leaf widgets unless the page needs custom layout behavior.
