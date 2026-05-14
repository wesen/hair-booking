---
Title: Desktop Navigation and Image Upload Implementation Guide
Ticket: HAIR-037
Status: active
Topics:
    - dsl
    - frontend
    - desktop
    - uploads
    - goja
DocType: analysis
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/dslgoja/flows/intake.flow.js
      Note: Goja intake flow should emit step navigation actions and upload intents/photo URLs
    - Path: pkg/dslgoja/images.go
      Note: Goja image host module models upload intents and completed uploaded images
    - Path: pkg/server/handlers_dsl_uploads.go
      Note: Backend multipart upload endpoint already stores uploads and returns uploaded image metadata
    - Path: web/src/molecules/DesktopStepRail/DesktopStepRail.tsx
      Note: Current step rail is display-only; needs click targets and disabled/done/current states
    - Path: web/src/molecules/PhotoTile/PhotoTile.tsx
      Note: Current photo tile toggles upload/remove actions but has no file input or preview image
    - Path: web/src/organisms/DesktopShell/DesktopShell.tsx
      Note: Desktop shell owns StepRail placement and should accept step navigation callbacks/actions
    - Path: web/src/page-dsl/backendClient.ts
      Note: Frontend DSL client posts backend events; should add multipart upload helper
    - Path: web/src/page-dsl/render.tsx
      Note: DSL renderer partitions desktop content, dispatches shell/node actions, and renders uploadTile primitives
ExternalSources: []
Summary: "Implementation guide for making desktop step rail navigation interactive and replacing fake photo toggles with real uploads and previews in the Goja DSL demo."
LastUpdated: 2026-05-14T14:10:01.497011305-04:00
WhatFor: "Use this when implementing HAIR-037 so the desktop Goja DSL demo behaves like a real app: clickable steps and real image upload/display."
WhenToUse: "Before editing DesktopStepRail/DesktopShell/render.tsx/backendClient.ts/PhotoTile.tsx/intake.flow.js or backend upload handling."
---

# Desktop Navigation and Image Upload Implementation Guide

## Goal

Make the live Goja DSL demo behave like a proper desktop application in two areas:

1. **Desktop step navigation** — clicking intake steps in the left rail should navigate backward and forward through the Goja flow, not merely display progress.
2. **Real image uploads** — photo tiles should open a file picker, upload real image files to the existing backend upload endpoint, persist the uploaded image metadata in flow state, and render actual image previews instead of just toggling a boolean.

The implementation should preserve the central architectural promise from HAIR-035: **one backend-driven DSL page JSON can be rendered as mobile or desktop by changing renderer interpretation, not by maintaining a separate desktop flow**.

## Current State

### Desktop navigation

The desktop renderer already forces the mobile `intake` shell into a desktop shell at wide viewports:

```tsx
const effectiveKind = forceDesktop && page.shell.kind === "intake" ? "desktop" : page.shell.kind;
```

The desktop path in `web/src/page-dsl/render.tsx` already renders:

- `DesktopShell`
- `DesktopStepRail`
- `DesktopContent`
- optional two-column `AccentPanel`
- bottom desktop nav bar with Back / Skip / Next buttons

However, the left rail is display-only:

```tsx
export interface DesktopStepRailProps {
  steps: string[];
  current: number;
  accent?: string;
  style?: CSSProperties;
}
```

`DesktopStepRail` maps labels into `<div>` rows. There is no `onStepSelect`, no per-step action metadata, and no disabled/clickable semantics.

### Shell action model

The Goja flow’s `shell(ctx, config)` helper currently creates only three shell-level actions:

```js
if (config.back) actions.back = ctx.action("back", function () { return goto(ctx, config.back); }, "back");
if (config.next) actions.next = ctx.action("next", function () { return goto(ctx, config.next); }, "next");
if (config.skip) actions.skip = ctx.action("skip", function () { return goto(ctx, config.skip); }, "skip");
```

`render.tsx` dispatches them through `dispatchShellAction()` by looking up `props.actions.next`, `props.actions.back`, and `props.actions.skip`.

There is no shell-level structure for step rail actions such as:

```json
{
  "steps": [
    { "label": "01 Service", "step": "service", "action": { "id": "...", "event": "goto" } }
  ]
}
```

### Photo upload

The upload backend already exists:

- `pkg/dslgoja/images.go`
  - `CreateUploadIntent(options)`
  - `CompleteUpload(uploadID, input)`
  - `UploadedImage`, `UploadIntent`
- `pkg/dslgoja/modules_dsl.go`
  - native `host/images` module
  - `images.createUploadIntent({ purpose, slot, maxBytes })`
  - `images.get(uploadId)` / `images.list({ purpose })`
- `pkg/server/handlers_dsl_uploads.go`
  - `POST /api/dsl/flows/{sessionId}/uploads/{uploadId}`
  - accepts multipart field named by intent (`file`)
  - validates image content type and size
  - stores blob via configured blob store
  - records metadata in `dsl_uploads`
  - returns uploaded image metadata JSON

The current intake flow does **not** use `host/images`. Instead, the photo step uses fake boolean state:

```js
photos: { front: false, side: false, back: false }
```

and upload tile actions do this:

```js
upload: ctx.action("uploadPhoto:" + key, function () {
  ctx.state.photos[key] = true;
  return render(ctx);
}, "upload")
```

The frontend `PhotoTile` also does not upload files. It is just a button that calls `onUpload` or `onRemove`:

```tsx
onClick={() => {
  if (filled) onRemove?.(...);
  else onUpload?.(...);
}}
```

`render.tsx` passes that to `dispatchAction()`, which posts a backend interaction event. No file picker, no `FormData`, no upload API call, and no preview URL.

## Desired Behavior

### Desktop step rail navigation

On desktop:

- Current step remains highlighted.
- Completed/past steps are clickable.
- Future steps may be clickable or guarded depending on product decision.
- Clicking a rail item dispatches a backend Goja action and updates the route/page just like Back/Next.
- Keyboard accessibility should work: buttons, focus ring, `aria-current="step"`, disabled state when not clickable.

Recommended first behavior:

- **Allow clicking any step 1-7** in the demo.
- This is a prototype/demo, not a production validation funnel.
- If later we need gating, the Goja flow can decide which steps produce actions.

### Real image upload

On mobile and desktop:

- Empty photo tile click opens file picker.
- User selects one image file.
- Frontend uploads it to the upload intent URL with multipart field `file`.
- Backend stores it and returns uploaded image metadata.
- Frontend dispatches the existing DSL `upload` action with uploaded image metadata as `event.value`.
- Goja callback stores the uploaded image object in `ctx.state.photos[slot]`.
- Re-render shows the image preview inside the tile.
- Clicking remove dispatches `remove` action and clears the slot from flow state.

## Recommended Data Contract

### Shell step navigation props

Add optional `steps` to shell props. Keep `step` and `total` for compatibility.

```ts
interface DslShellStep {
  id: string;              // "service"
  label: string;           // "01 Service"
  index: number;           // 1-based display index
  current?: boolean;
  disabled?: boolean;
  actions?: {
    select?: DslActionRef; // event "goto"
  };
}
```

Example emitted by Goja:

```js
function shell(ctx, config) {
  const actions = { ... };
  const steps = stepDefs.map(function (step, index) {
    return {
      id: step.id,
      label: step.label,
      index: index + 1,
      current: step.id === config.stepId,
      disabled: false,
      actions: {
        select: ctx.action("goto:" + step.id, function () {
          return goto(ctx, step.id);
        }, "goto"),
      },
    };
  });
  return { step: config.step, total: 7, steps, actions, ... };
}
```

Use `config.stepId` or infer it from the numeric step. Prefer explicit `stepId` so the shell helper does not depend on label order.

### Upload tile props

Extend `uploadTile` props without introducing a new node kind:

```ts
interface UploadTileProps {
  value: string;             // "front"
  label: string;             // "Front"
  filled: boolean;
  imageUrl?: string;         // public preview URL
  imageAlt?: string;
  upload?: UploadIntent;     // created by host/images
  actions: {
    upload?: DslActionRef;
    remove?: DslActionRef;
  };
}
```

Example emitted by Goja:

```js
const images = require("host/images");

function tile(ctx, key, label) {
  var existing = ctx.state.photos[key];
  var intent = images.createUploadIntent({ purpose: "intake-photo", slot: key });
  return n.uploadTile(label, {
    value: key,
    filled: !!existing,
    imageUrl: existing && existing.url,
    imageAlt: label + " hair reference photo",
    upload: intent,
    actions: {
      upload: ctx.action("uploadPhoto:" + key, function (event) {
        ctx.state.photos[key] = event.value; // uploaded image metadata
        return render(ctx);
      }, "upload"),
      remove: ctx.action("removePhoto:" + key, function () {
        ctx.state.photos[key] = null;
        return render(ctx);
      }, "remove"),
    },
  }).id("photo-" + key);
}
```

## Frontend Implementation Plan

### 1. Add upload client helper

In `web/src/page-dsl/backendClient.ts` add:

```ts
export interface DslUploadIntent {
  uploadId: string;
  sessionId: string;
  purpose: string;
  slot?: string;
  method: "POST";
  url: string;
  fieldName: string;
  accept: string[];
  maxBytes: number;
  expiresAt: string;
}

export interface DslUploadedImage {
  uploadId: string;
  sessionId: string;
  purpose: string;
  slot?: string;
  originalFilename?: string;
  contentType?: string;
  sizeBytes: number;
  storageKey: string;
  url: string;
}

export async function postDslUpload(intent: DslUploadIntent, file: File): Promise<DslUploadedImage> {
  const form = new FormData();
  form.append(intent.fieldName || "file", file);
  const response = await fetch(intent.url, { method: intent.method || "POST", body: form });
  if (!response.ok) throw ...;
  return response.json();
}
```

Important: upload endpoint returns normal JSON (`writeJSON`), not protobuf JSON.

### 2. Extend `DslRenderContext`

In `web/src/page-dsl/schema.ts`, add optional upload function:

```ts
export interface DslRenderContext {
  backendDispatch?: (event: DslBackendEvent) => void | Promise<void>;
  backendUpload?: (intent: DslUploadIntent, file: File) => Promise<DslUploadedImage>;
}
```

If importing types from `backendClient.ts` would create awkward coupling, duplicate a minimal structural type in `schema.ts` and keep it JSON-shaped.

### 3. Wire `BackendDslPage`

In `BackendDslPage`, add `backendUpload` to render context:

```tsx
const context = useMemo(() => ({
  backendDispatch: async (...) => { ... },
  backendUpload: client.postDslUpload ?? postDslUpload,
}), [...]);
```

`BackendDslClient` should include `postDslUpload`.

### 4. Extend `PhotoTile`

`PhotoTile` should own the file input UX:

- Keep button visual surface.
- Add hidden `<input type="file">`.
- When empty tile clicked, trigger input click.
- On file selected, call `onUploadFile(file, value, meta)`.
- When filled tile clicked, either remove directly or show a small remove affordance; first implementation can keep current click-to-remove behavior.
- If `imageUrl` exists, render `<img src={imageUrl} alt={imageAlt || label} />` under an overlay label.

Suggested props:

```ts
imageUrl?: string;
imageAlt?: string;
accept?: string;
maxBytes?: number;
onUploadFile?: (file: File, value: TValue, meta: SelectionChangeMeta<TValue>) => void;
```

### 5. Wire `uploadTile` in `render.tsx`

In the `uploadTile` render branch:

```tsx
const uploadIntent = object(props, "upload") as DslUploadIntent | undefined;

<PhotoTile
  imageUrl={str(props, "imageUrl", undefined as any) || undefined}
  imageAlt={str(props, "imageAlt", undefined as any) || undefined}
  accept={uploadIntent?.accept?.join(",")}
  maxBytes={uploadIntent?.maxBytes}
  onUploadFile={async (file, value, meta) => {
    if (!uploadIntent || !ctx?.backendUpload) {
      dispatchAction(ctx, node, props, "upload", "action", value, meta);
      return;
    }
    const image = await ctx.backendUpload(uploadIntent, file);
    dispatchAction(ctx, node, props, "upload", "action", image, { ...meta, value });
  }}
  onRemove={(value, meta) => dispatchAction(ctx, node, props, "remove", "action", value, meta)}
/>
```

Also show an upload error status if the upload fails. A minimal first version can `console.error()` and use `BackendDslPageStatus`, but the better implementation is local error state in `PhotoTile` or an upload status callback in `BackendDslPage`.

### 6. Update Goja flow photo state

Change initial state:

```js
photos: { front: null, side: null, back: null }
```

Change `photoCount`:

```js
function photoCount(ctx) {
  return Object.keys(ctx.state.photos).filter(function (k) { return !!ctx.state.photos[k]; }).length;
}
```

Change `tile()` as shown above, using `host/images`.

## Desktop Step Navigation Implementation Plan

### 1. Goja step definitions

Add to `intake.flow.js`:

```js
const stepDefs = [
  { id: "service", label: "01 Service" },
  { id: "color", label: "02 Color" },
  { id: "photos", label: "03 Photos" },
  { id: "budget", label: "04 Budget" },
  { id: "estimate", label: "05 Estimate" },
  { id: "booking", label: "06 Booking" },
  { id: "confirm", label: "07 Confirm" },
];
```

Update `shell(ctx, config)`:

```js
const steps = stepDefs.map(function (def, index) {
  return {
    id: def.id,
    label: def.label,
    index: index + 1,
    current: def.id === config.stepId,
    disabled: false,
    actions: {
      select: ctx.action("goto:" + def.id, function () {
        return goto(ctx, def.id);
      }, "goto"),
    },
  };
});

return { ..., stepId: config.stepId, steps };
```

Then every step passes `stepId`:

```js
.intake(shell(ctx, { step: 3, stepId: "photos", ... }))
```

### 2. Type + render helpers

In `render.tsx`, extract steps:

```ts
function shellSteps(props: JsonObject | undefined): DesktopStepItem[] {
  const raw = props?.steps;
  if (!Array.isArray(raw)) return default labels fallback;
  return raw.map(...);
}
```

### 3. `DesktopStepRail` props

Change props:

```ts
export interface DesktopStepRailItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface DesktopStepRailProps {
  steps: DesktopStepRailItem[];
  current: number;
  accent?: string;
  onStepSelect?: (step: DesktopStepRailItem, index: number) => void;
}
```

Render clickable items as `<button>` when not disabled and `onStepSelect` exists. Use `aria-current="step"` for active.

### 4. `DesktopShell` props

Change from `stepLabels?: string[]` to a richer prop:

```ts
stepItems?: DesktopStepRailItem[];
onStepSelect?: (step: DesktopStepRailItem, index: number) => void;
```

Keep `stepLabels` temporarily if needed, but prefer the richer item list.

### 5. Dispatch selected step

In desktop render path:

```tsx
const steps = parseShellSteps(props);

<DesktopShell
  stepItems={steps.map(s => ({ id: s.id, label: s.label, disabled: s.disabled }))}
  onStepSelect={(step, index) => {
    const shellStep = steps[index];
    const ref = shellStep?.actions?.select;
    if (!ref || !context?.backendDispatch) return;
    void context.backendDispatch({
      nodeId: `shell.step.${shellStep.id}`,
      nodeKind: "desktopStepRail",
      actionId: ref.id,
      event: ref.event || "goto",
      value: shellStep.id,
      meta: { index, label: shellStep.label },
    });
  }}
/>
```

## Test Plan

### Unit tests

Backend / Goja:

- Start flow, assert `shell.props.steps` exists with 7 items.
- Assert every step item has `actions.select.id`.
- Dispatch a step action (`goto:budget`) and assert page id becomes `intake-budget`.
- Start photo step, assert upload tiles include `props.upload.url`, `fieldName`, `accept`, `maxBytes`.
- Upload handler test already exists; extend to assert returned `url` can be stored in flow state by a dispatch event.

Frontend:

- `DesktopStepRail` renders buttons for enabled steps.
- Clicking a step calls `onStepSelect` with index and item.
- Active step has `aria-current="step"`.
- `PhotoTile` opens file input when empty.
- `PhotoTile` renders `<img>` when `imageUrl` is provided.
- `uploadTile` renderer calls `backendUpload` before dispatching `upload` action.

### Manual browser test

1. Start backend and Vite.
2. Open `http://127.0.0.1:5175/dsl-goja-demo/service` on desktop width.
3. Click `04 Budget` in the left rail. Expected: route changes to `/dsl-goja-demo/budget` and step 4 becomes active.
4. Click `02 Color`. Expected: route changes to `/dsl-goja-demo/color` and state remains intact.
5. Navigate to Photos.
6. Click Front tile, choose a JPG/PNG/WebP.
7. Expected: upload POST returns 201; tile shows actual image preview; photo count increments.
8. Refresh page or navigate away/back in same session. Expected: uploaded image still appears from flow state/session.
9. Click filled tile/remove. Expected: tile clears and photo count decrements.

### Visual test / VLM prompts

Use screenshots and ask:

- Does the left rail appear clickable and accessible without looking noisy?
- Does the uploaded image preview fill the tile attractively?
- Are uploaded/empty/disabled states visually distinct?
- Does the desktop context panel still render correctly after uploads?

## Implementation Order

1. Backend-safe contracts first:
   - Goja shell `steps` action payloads.
   - Goja upload intents in photo tiles.
2. Frontend step rail:
   - clickable `DesktopStepRail`
   - `DesktopShell` pass-through
   - `render.tsx` dispatch wiring
3. Upload frontend:
   - `postDslUpload`
   - `BackendDslPage` context wiring
   - `PhotoTile` file input + preview
   - `render.tsx` uploadTile wiring
4. Tests.
5. Manual and VLM verification.

## Risks and Sharp Edges

### Action lifetime

Goja actions are opaque IDs registered per render. A step action ID from an old page version may become stale after any dispatch. Always use step actions from the current page’s `shell.props.steps`.

### Upload intent lifetime

Upload intents expire. Create a fresh intent on every render for empty slots. For filled slots, you may still create an intent so replacement uploads work, but be mindful of accumulating unused intents in memory.

### Upload event ordering

Do not update UI state optimistically to `filled=true` before the backend upload succeeds unless there is a visible uploading state. The safest first implementation is:

1. choose file
2. upload file
3. dispatch upload event with returned image metadata
4. re-render from backend state

### Blob URL vs public URL

Use the backend-returned `image.url`, not a temporary `URL.createObjectURL`, as the persisted display URL. A temporary object URL may be useful during upload, but it should not enter Goja state.

### Mobile compatibility

The same `uploadTile` node renders in mobile IntakeShell. Any `PhotoTile` file input and preview work must look good inside the 390px phone frame as well as the desktop main column.

## Acceptance Criteria

- Desktop left rail steps are clickable and navigate through the backend Goja flow.
- Step rail navigation works both backward and forward.
- Browser route, page id, step rail active state, and content stay in sync.
- Photo tiles open a file picker and upload real images.
- Uploaded images are displayed in their tiles using backend URLs.
- Removing an uploaded image clears the preview and updates photo count.
- Existing Back/Next/Skip navigation continues to work.
- `go test ./pkg/dslgoja ./pkg/server` passes.
- `cd web && npx tsc --noEmit` passes.
