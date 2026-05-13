---
Title: Debugging Refresh Blanking and Stable Rendering in the Goja DSL UI
Ticket: HAIR-033
Status: active
Topics:
    - frontend
    - react
    - goja
    - dsl
    - debugging
    - performance
    - state-management
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Backend flow source of page ids
    - Path: web/src/LiveDslDemoApp.tsx
      Note: App shell where route sync/session resume can affect refresh blanking
    - Path: web/src/organisms/IntakeShell/IntakeShell.tsx
      Note: Shell/footer buttons whose flashing needs instrumentation
    - Path: web/src/page-dsl/BackendDslPage.tsx
      Note: Frontend owner of loading/dispatch state and backend event lifecycle
    - Path: web/src/page-dsl/render.tsx
      Note: DSL renderer using node.meta.id keys and shell action dispatch
ExternalSources: []
Summary: Textbook-style debugging guide for understanding and instrumenting refresh blanking, bottom button flashing, stable IDs, React reconciliation, session resume, and backend-driven page rerenders in the live Goja DSL UI.
LastUpdated: 2026-05-13T12:25:00-04:00
WhatFor: Use this guide to debug why the live Goja DSL UI blanks or flashes on refresh or backend rerender, and to decide where to add stable IDs and console/performance instrumentation.
WhenToUse: Read before changing IntakeShell, DslPageRenderer, BackendDslPage, LiveDslDemoApp, or the Goja flow ids/actions to investigate rendering stability.
---


# Debugging Refresh Blanking and Stable Rendering in the Goja DSL UI

## Executive Summary

The live Goja DSL page is a server-driven React UI. The browser does not own the intake flow state. On load, it asks the backend for the current page; on interaction, it sends an event to the backend; after the backend returns a new JSON page, React renders that page. This architecture is correct, but it creates a new class of visual issues: the UI can appear to blank during refresh, the footer buttons can flash during transitions, and it can be unclear whether React updated an existing DOM node or destroyed and recreated it.

The important distinction is **rerender versus remount**. A rerender means React calls component functions again and updates DOM nodes in place. A remount means React destroys a component subtree and creates a new one. Rerenders are normal. Remounts are often where flashing, focus loss, CSS animation restarts, and layout jumps come from.

The current system has already taken one important step: `DslPageRenderer` now uses `node.meta.id` as the React key for DSL nodes instead of using array indices. That helps React preserve node identity for backend-rendered content. The bottom buttons, however, are not normal DSL nodes. They are rendered inside `IntakeShell`, based on `page.shell.props.actions`. If the bottom area flashes, the cause may be shell-level remounting, transient loading state during refresh, dispatch overlay changes, button active/focus state, route/session recovery, or CSS/layout effects rather than the node keys alone.

This guide explains the fundamentals and then gives practical instrumentation: console logs, performance marks, mount/unmount traces, MutationObserver snippets, React Profiler usage, DOM identity probes, and network/debug-panel checks. The goal is to make the flicker measurable. Once measured, we can decide whether the fix belongs in the backend flow ids, the frontend renderer keys, `IntakeShell`, `BackendDslPage`, route/session handling, or CSS.

## 1. The Current Rendering Path

The live route is:

```text
http://127.0.0.1:5175/dsl-goja-demo
```

The core frontend files are:

| File | Responsibility |
|---|---|
| `web/src/LiveDslDemoApp.tsx` | App-level shell, route sync, sessionStorage resume, debug panel. |
| `web/src/page-dsl/BackendDslPage.tsx` | Starts or resumes a backend flow, stores current page state, posts interaction events. |
| `web/src/page-dsl/render.tsx` | Interprets DSL JSON nodes and maps them to React widgets. |
| `web/src/organisms/IntakeShell/IntakeShell.tsx` | Renders phone-app shell: status bar, header, progress, content area, bottom CTA buttons. |
| `pkg/dslgoja/flows/intake.flow.js` | Goja-authored flow that emits page JSON and action refs. |

The essential runtime path is:

```text
Browser load
  -> LiveDslDemoApp reads sessionStorage
  -> BackendDslPage GETs remembered session or POSTs start
  -> Backend returns DslFlowState { sessionId, pageVersion, page }
  -> DslPageRenderer renders page
  -> IntakeShell renders shell/footer/content

User click
  -> React widget callback
  -> DslPageRenderer dispatchAction/dispatchShellAction
  -> BackendDslPage adds eventId and pageVersion
  -> POST /api/dsl/flows/{sessionId}/events
  -> Goja callback mutates ctx.state and returns render(ctx)
  -> Backend returns next DslFlowState
  -> React renders the new page
```

The bottom buttons are rendered here:

```text
DslPageRenderer
  -> if page.shell.kind === "intake"
      -> <IntakeShell onNext=... onBack=... onSkip=... nextLabel=...>
```

They are not rendered as a DSL node like `chipGroup` or `serviceOptionGroup`. They come from the shell. That is why adding stable ids to DSL content nodes helps the page body, but it may not fully explain footer flashing.

## 2. What “Blanking on Refresh” Can Mean

“Blanking” is a visual symptom, not a single technical cause. We should separate several cases.

### Case A: Full-page blank during browser refresh

On a hard refresh, the browser discards the previous JavaScript heap. The React app starts from zero. The current `BackendDslPage` state begins as `null` and `loading=true`, so the phone frame shows a loading status until the backend page is fetched.

That means this sequence is expected:

```text
refresh
  -> empty HTML root
  -> JS bundle loads
  -> React app mounts
  -> BackendDslPage shows loading UI
  -> GET existing session or POST start
  -> page JSON arrives
  -> actual intake page renders
```

If the backend is fast, this can look like a blink. If the backend is slow or unavailable, it looks like a blank/loading screen.

### Case B: Footer button flash during backend interaction

This happens without a full browser refresh. A click posts an event, `BackendDslPage` sets `dispatching=true`, the backend returns a page, and React rerenders. The footer may look like it flashed if:

- the shell was remounted,
- the footer DOM nodes were replaced,
- the button lost active/focus state,
- the dispatch status overlay appeared near the bottom,
- the route changed and caused layout work,
- the page content height changed and shifted the footer,
- Vite/React development tooling made the update more visually obvious.

### Case C: Footer button flash during step transitions

When moving from service to color, or booking to confirm, `page.shell.props` changes:

```text
step changes
progress width changes
eyebrow/title changes
nextLabel may change
children content changes
```

A visual change here is expected. The question is whether React is updating the same footer DOM nodes or replacing them.

## 3. Rerender versus Remount

React rerenders often. That is not bad. A component function can run again while React preserves the same DOM nodes.

A remount is different. It means React considers the old component and the new component different enough to destroy the old subtree and create a new subtree.

The most common causes of remounts are:

- The component type changes.
- The `key` changes.
- A parent is conditionally removed and re-added.
- A higher-level component remounts because its key changes.

For DSL content nodes, this is why keys matter. The renderer used to do this:

```tsx
page.nodes.map((node, i) => renderNode(node, context, i))
```

Now it uses this pattern:

```tsx
function nodeKey(node: DslNode, index: number): Key {
  return node.meta?.id || `${node.kind}:${index}`;
}

page.nodes.map((node, i) => renderNode(node, context, nodeKey(node, i)))
```

That gives React stable identity for nodes such as:

```text
category-tabs
tone-chips
booking-days
confirm-card
```

But the footer buttons are inside `IntakeShell`; they need their own identity and instrumentation.

## 4. What Stable IDs Should Exist?

There are two kinds of identity in this system.

### Backend semantic identity

The backend flow should emit stable ids in `node.meta.id`. These ids describe meaning in the flow:

```js
n.segmented(...).id("category-tabs")
n.chipGroup(...).id("tone-chips")
n.dayPickerGrid(...).id("booking-days")
```

These ids are useful for:

- React keys,
- action validation,
- debugging,
- tests,
- visual diff selectors,
- JSON inspection.

### Frontend structural identity

Some DOM elements are not backend DSL nodes. `IntakeShell` creates them directly:

- status bar,
- app header,
- progress bar,
- content container,
- bottom CTA bar,
- skip button,
- next button,
- home indicator.

These should have stable `data-*` attributes even if they are not part of the backend JSON.

Recommended additions to `IntakeShell`:

```tsx
<div data-component="IntakeShell" data-dsl-shell="intake">
  ...
  <div data-component="IntakeShellContent" data-dsl-shell-part="content">
    {children}
  </div>
  <div data-component="IntakeShellCTA" data-dsl-shell-part="cta">
    <button data-component="IntakeShellSkip" data-dsl-action="skip">Skip</button>
    <button data-component="IntakeShellNext" data-dsl-action="next">{nextLabel}</button>
  </div>
</div>
```

These attributes do not by themselves prevent remounts. They make the DOM inspectable and targetable. If we later wrap shell footer pieces in memoized components or add tests, these stable attributes become very useful.

Should the backend emit ids for shell buttons? It already emits shell action refs under `shell.props.actions`. The frontend currently uses pseudo-node ids when dispatching shell actions:

```ts
nodeId: `shell.${eventName}`
nodeKind: "intakeShell"
```

That is good enough for action events. For DOM identity, shell-specific `data-component` attributes are cleaner than asking the backend to emit React-specific footer ids.

## 5. The Most Likely Causes in This Codebase

Based on the current code, there are several likely causes for the visible flash.

### 5.1 Loading state replaces the entire page on refresh

In `BackendDslPage`, initial state is:

```tsx
const [state, setState] = useState<DslFlowState | null>(null);
const [loading, setLoading] = useState(true);
```

While loading:

```tsx
if (loading) {
  return <BackendDslStatus label="Loading backend DSL flow…" />;
}
```

That replaces the whole phone content with a loading screen. On refresh, this is expected because there is no React state yet. If we want less blanking on refresh, we need either:

- cached last page snapshot in `sessionStorage`,
- server-side rendered initial page,
- a skeleton that matches the shell layout,
- or accept the loading flash for now.

The simplest improvement is a shell-shaped loading skeleton instead of a centered loading status.

### 5.2 Session resume is asynchronous

`LiveDslDemoApp` now stores the session id in `sessionStorage`, but it does not store the last page JSON. On refresh, the app knows the session id but not the page. It must call:

```http
GET /api/dsl/flows/{sessionId}
```

Until that returns, the app cannot render the previous page.

If we want immediate paint, store a small cached snapshot:

```ts
sessionStorage.setItem("fringe.dsl.fringe.intake.v1.snapshot", JSON.stringify(state));
```

Then render cached page immediately while refreshing from the backend. That is more complex because cached action ids may be stale after backend restart or another tab update. It can be done, but the UI must treat cached pages as optimistic and refresh quickly.

### 5.3 Dispatch overlay appears near bottom buttons

`BackendDslPage` renders a status overlay near the bottom:

```tsx
{dispatching ? "Dispatching backend event…" : error || effects}
```

Its style includes:

```tsx
position: "absolute",
bottom: 18,
left: 16,
right: 16,
```

This overlaps visually with the CTA area. It may look like the bottom buttons are flashing when the overlay appears and disappears. A good debugging step is to temporarily move this status to the side debug panel only, or give it a higher/lower position, and see if the perceived flash changes.

### 5.4 Footer buttons lack stable debug selectors

The footer buttons are plain `<button>` elements inside `IntakeShell`. They do not currently have stable `data-component` or `data-dsl-action` attributes. That makes it harder to tell if the exact DOM node survived an update.

Add attributes first; then inspect identity.

### 5.5 Shell callbacks change identity every render

`DslPageRenderer` passes callbacks inline:

```tsx
onNext={() => dispatchShellAction(context, props, "next", "onNext")}
onBack={() => dispatchShellAction(context, props, "back", "onBack")}
onSkip={() => dispatchShellAction(context, props, "skip", "onSkip")}
```

Changing function identity alone should not remount DOM nodes. It can cause memoized children to rerender, but `IntakeShell` is not currently memoized. This is probably not the core flash cause. Still, if we split footer into a memoized `IntakeShellCTA`, stable callbacks may help.

## 6. Console Logging Strategy

Console logging is useful if it answers one of these questions:

1. Did the component mount or just rerender?
2. Did the DOM node get replaced?
3. Did the backend state change page ids or only props?
4. Did loading state appear between two rendered pages?
5. Did an overlay appear at the same time as the perceived flash?

Do not add generic logs like `console.log("render")` everywhere and leave them on. Use grouped, gated logs.

### 6.1 Add a debug flag

Use a query parameter or local storage flag:

```ts
function dslDebugEnabled() {
  return new URLSearchParams(window.location.search).has("debugDsl") ||
    window.localStorage.getItem("fringe.dsl.debug") === "1";
}
```

Then logs can be gated:

```ts
function dslDebug(label: string, payload?: unknown) {
  if (!dslDebugEnabled()) return;
  console.log(`[dsl] ${label}`, payload);
}
```

Manual enablement:

```js
localStorage.setItem("fringe.dsl.debug", "1")
```

Disable:

```js
localStorage.removeItem("fringe.dsl.debug")
```

### 6.2 Log BackendDslPage lifecycle

In `BackendDslPage`, log the load path:

```tsx
useEffect(() => {
  dslDebug("BackendDslPage load:start", { flowId, sessionId });

  async function load() {
    try {
      ...
      dslDebug("BackendDslPage load:success", {
        sessionId: nextState.sessionId,
        pageVersion: nextState.pageVersion,
        pageId: nextState.page.id,
      });
    } catch (err) {
      dslDebug("BackendDslPage load:error", err);
    }
  }
}, [client, flowId, sessionId]);
```

Also log dispatch:

```tsx
dslDebug("BackendDslPage dispatch:start", interactionEvent);
const nextState = await client.postDslEvent(...);
dslDebug("BackendDslPage dispatch:success", {
  eventId: interactionEvent.eventId,
  fromPageVersion: interactionEvent.pageVersion,
  toPageVersion: nextState.pageVersion,
  pageId: nextState.page.id,
  effects: nextState.effects,
});
```

If the flash correlates with `loading=true`, that points to load/snapshot behavior. If it correlates only with dispatch, inspect footer and overlay behavior.

### 6.3 Log DslPageRenderer page changes

In `DslPageRenderer`:

```tsx
if (dslDebugEnabled()) {
  console.log("[dsl] render page", {
    pageId: page.id,
    shellKind: page.shell.kind,
    nodeKeys: page.nodes.map((node, i) => node.meta?.id || `${node.kind}:${i}`),
    shellActions: page.shell.props?.actions,
  });
}
```

This confirms whether the backend is returning stable ids and whether page ids change when expected.

### 6.4 Log IntakeShell mount/unmount

This is the most direct way to see if the shell itself is remounting.

Temporary instrumentation:

```tsx
import { useEffect, useId, useRef } from "react";

export function IntakeShell(...) {
  const instance = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    console.log("[dsl] IntakeShell mounted", { instance: instance.current });
    return () => console.log("[dsl] IntakeShell unmounted", { instance: instance.current });
  }, []);

  console.log("[dsl] IntakeShell render", {
    instance: instance.current,
    step,
    total,
    title,
    nextLabel,
  });

  ...
}
```

Interpretation:

- Many `render` logs with one `mounted` log: normal rerenders.
- `unmounted` followed by `mounted` during ordinary backend updates: shell remounting is happening.
- `unmounted`/`mounted` on hard refresh: expected.

Use this temporarily. Do not leave noisy render logs permanently enabled without a debug flag.

### 6.5 Log footer button DOM identity

Add refs to the footer buttons:

```tsx
const nextButtonRef = useRef<HTMLButtonElement | null>(null);
const previousNextButton = useRef<HTMLButtonElement | null>(null);

useLayoutEffect(() => {
  const current = nextButtonRef.current;
  const same = previousNextButton.current === current;
  console.log("[dsl] next button DOM identity", {
    sameAsPreviousRender: same,
    label: nextLabel,
    element: current,
  });
  previousNextButton.current = current;
});
```

Attach:

```tsx
<button ref={nextButtonRef} data-component="IntakeShellNext" ...>
  {nextLabel}
</button>
```

Interpretation:

- `sameAsPreviousRender: true`: React preserved the DOM node.
- `sameAsPreviousRender: false` during a backend update: the button was replaced.

This directly answers whether stable footer identity is the problem.

## 7. Browser Console Snippets Without Code Changes

You can also debug from DevTools without editing files.

### 7.1 Watch whether the CTA node is removed

Paste this in the browser console:

```js
const target = document.querySelector('[data-section="intake-cta"]');
const observer = new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.removedNodes) {
      if (node === target || node.contains?.(target)) {
        console.log('[dsl-debug] CTA removed', { record });
      }
    }
    for (const node of record.addedNodes) {
      if (node.matches?.('[data-section="intake-cta"]') || node.querySelector?.('[data-section="intake-cta"]')) {
        console.log('[dsl-debug] CTA added', { record, node });
      }
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
```

Then click through the flow. If you see `CTA removed` / `CTA added`, the footer is being replaced. If not, the visual flash may be styling, focus, overlay, or repaint rather than remount.

### 7.2 Track one button element

After the page loads:

```js
window.__next = document.querySelector('[data-section="intake-cta"] button:last-child');
window.__next
```

After clicking a control or moving to the next page:

```js
window.__next === document.querySelector('[data-section="intake-cta"] button:last-child')
```

If it returns `true`, the same DOM button survived. If it returns `false`, it was replaced.

This will be easier after we add `data-component="IntakeShellNext"`.

### 7.3 Inspect layout shifts

Use the browser Performance panel:

1. Open DevTools.
2. Go to Performance.
3. Enable screenshots if available.
4. Record.
5. Click the action that causes flash.
6. Stop recording.
7. Look for:
   - Layout Shift events,
   - Recalculate Style,
   - Layout,
   - Paint,
   - DOM node removals.

If the footer is preserved but a layout shift occurs, the fix may be CSS/layout rather than keys.

## 8. React Profiler Strategy

React DevTools Profiler answers a different question from DOM MutationObserver. It tells you which React components rendered and why.

Use it like this:

1. Open React DevTools.
2. Open Profiler.
3. Start profiling.
4. Click `Keep going` or refresh/resume.
5. Stop profiling.
6. Inspect commits.

What to look for:

- Does `IntakeShell` render on every backend event? It probably will.
- Does `BackendDslPage` briefly render `BackendDslStatus` between pages? That would cause full shell replacement.
- Does the commit show a large subtree remount, or just prop updates?
- Does the footer render because `dispatching` toggled, because page changed, or because parent state changed?

If `BackendDslPage` renders status between every dispatch, that is a problem. Current code should not do that on dispatch because it keeps `state` and only overlays dispatch status. On hard refresh, status is expected.

## 9. Performance Marks

Console logs show order. Performance marks show timing.

Add marks around load/dispatch:

```ts
performance.mark("dsl:dispatch:start");
const nextState = await client.postDslEvent(...);
performance.mark("dsl:dispatch:end");
performance.measure("dsl:dispatch", "dsl:dispatch:start", "dsl:dispatch:end");
```

Then inspect:

```js
performance.getEntriesByName("dsl:dispatch")
```

Add marks in render:

```tsx
performance.mark(`dsl:render:${page.id}:v${pageVersion}`);
```

A useful debug table:

```js
performance.getEntriesByType('measure').map(e => ({ name: e.name, duration: e.duration }))
```

This helps distinguish backend latency from frontend paint/reconciliation issues.

## 10. Concrete Recommended Instrumentation Patch

For the next code slice, add debug-only instrumentation and stable shell attributes.

### 10.1 Add debug helper

Create:

```text
web/src/page-dsl/debug.ts
```

```ts
export function dslDebugEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debugDsl") ||
    window.localStorage.getItem("fringe.dsl.debug") === "1";
}

export function dslDebug(label: string, payload?: unknown) {
  if (!dslDebugEnabled()) return;
  console.log(`[dsl] ${label}`, payload);
}
```

### 10.2 Add logs to BackendDslPage

Log:

- load start,
- load success,
- load error,
- dispatch start,
- dispatch success,
- dispatch error,
- stale/effects count.

### 10.3 Add stable shell selectors

In `IntakeShell`:

```tsx
<div data-component="IntakeShell" data-dsl-shell="intake">
...
<div data-component="IntakeShellCTA" data-dsl-shell-part="cta" data-section="intake-cta">
  <button data-component="IntakeShellSkip" data-dsl-action="skip">Skip</button>
  <button data-component="IntakeShellNext" data-dsl-action="next">{nextLabel}</button>
</div>
```

### 10.4 Add optional mount trace to IntakeShell

Do not always log. Gate it:

```tsx
const instance = useRef(Math.random().toString(36).slice(2));

useEffect(() => {
  dslDebug("IntakeShell mounted", { instance: instance.current });
  return () => dslDebug("IntakeShell unmounted", { instance: instance.current });
}, []);

dslDebug("IntakeShell render", { instance: instance.current, step, title, nextLabel });
```

### 10.5 Add button identity trace only while investigating

This can be behind a stronger flag:

```ts
localStorage.setItem("fringe.dsl.traceDom", "1")
```

Do not keep high-volume DOM identity logs always on.

## 11. Possible Fixes After Measurement

The right fix depends on what the instrumentation shows.

### If the whole page blanks only on hard refresh

This is expected from client-side boot and async session fetch. Options:

1. Accept it for now.
2. Replace loading status with shell-shaped skeleton.
3. Store last page snapshot in `sessionStorage` and render it optimistically.
4. Server-render or embed initial state in HTML later.

Recommended next fix: shell-shaped skeleton. It is safer than rendering cached stale action ids.

### If the shell remounts during normal backend events

Investigate parent keys and conditional rendering. Ensure `BackendDslPage` does not temporarily return `BackendDslStatus` while it already has a page. Current code should preserve `state` during dispatch, so shell remounts would likely be caused elsewhere.

### If only footer DOM nodes are replaced

Split footer into a stable component and add stable attributes. Consider:

```tsx
const IntakeShellCTA = memo(function IntakeShellCTA({ onNext, onSkip, nextLabel }) { ... });
```

Memoization is not a first fix; use it after confirming replacement or excessive rerender cost.

### If DOM nodes are stable but flash remains

Then the issue is likely style/paint/layout:

- Remove or move the dispatch overlay.
- Disable CSS transitions if any were added.
- Check active/focus styles.
- Reserve footer height so content changes cannot push it.
- Disable pointer/active visual state during dispatch.

### If same-session refresh fetch is slow

Improve session resume UX:

- Show shell skeleton.
- Show page id/session id from storage in debug panel immediately.
- Avoid clearing old DOM before new state if an in-memory page exists.

## 12. What Backend Changes Might Help?

The backend already emits stable node ids for DSL nodes. It should continue doing that. The Phase C tests now enforce stable ids for every node in the expanded flow.

Backend-side improvements that may help later:

- Add optional `shell.meta.id` or `shell.props.id`, such as `intake-shell`.
- Add action names or action metadata for easier debug output.
- Add a response field with previous page id and new page id for transition debugging.
- Keep page ids stable and avoid unnecessary page-id changes.

But the footer flashing investigation is mostly frontend first. The footer is constructed in `IntakeShell`; the backend only provides shell props and action refs.

## 13. Recommended Debugging Checklist

Use this checklist before making fixes.

### Step 1: Confirm whether it is hard-refresh blanking or interaction flashing

- Hard refresh: expected loading path.
- Interaction: should preserve current page while dispatching.

### Step 2: Enable debug logs

```js
localStorage.setItem("fringe.dsl.debug", "1")
```

Reload with:

```text
/dsl-goja-demo?debugDsl
```

### Step 3: Watch lifecycle

Add/enable logs for:

- `BackendDslPage load:start/success`,
- `BackendDslPage dispatch:start/success`,
- `DslPageRenderer render page`,
- `IntakeShell mount/unmount/render`.

### Step 4: Check footer DOM identity

Use refs or console snippets to answer:

```js
oldButton === newButton
```

### Step 5: Check overlays and layout

Temporarily disable/move `BackendDslPageStatus`. If the flash disappears, the footer may not be remounting at all.

### Step 6: Choose a fix based on evidence

Do not guess. Use the observed evidence:

| Evidence | Likely fix |
|---|---|
| whole shell replaced during refresh only | skeleton or cached snapshot |
| shell unmounts during interaction | parent conditional/key issue |
| footer DOM node replaced | stable footer component/attributes, inspect conditional rendering |
| DOM stable but visual flash | CSS/overlay/layout/focus issue |
| stale session after refresh | sessionStorage recovery and clearer stale message |

## 14. Immediate Next Implementation Recommendation

The next small patch should be:

1. Add stable shell/footer `data-component` attributes in `IntakeShell`.
2. Add a debug helper gated by `?debugDsl` or `localStorage.fringe.dsl.debug`.
3. Add debug logs to `BackendDslPage`, `DslPageRenderer`, and `IntakeShell`.
4. Move or make optional the bottom dispatch overlay so it does not visually compete with CTA buttons.
5. Manually test with DevTools console and React Profiler.

This patch should be easy to remove or keep safely because logs are gated. It gives us evidence before we make heavier changes such as cached snapshots, memoized shell subcomponents, or route/snapshot restore.

## 15. References

Code files:

- `web/src/LiveDslDemoApp.tsx`
- `web/src/page-dsl/BackendDslPage.tsx`
- `web/src/page-dsl/render.tsx`
- `web/src/organisms/IntakeShell/IntakeShell.tsx`
- `pkg/dslgoja/flows/intake.flow.js`

Related HAIR-033 docs:

- `design-doc/04-real-ui-app-integration-guide-for-goja-backend-dsl.md`
- `design-doc/05-routing-sessions-events-schema-and-rerendering-questions-for-goja-dsl.md`
- `reference/01-diary.md`
