# Tasks

## Done

- [x] Map current desktop StepRail rendering and shell action model
- [x] Design clickable desktop step navigation using backend Goja actions
- [x] Map current uploadTile frontend and backend upload API flow
- [x] Design real image upload with preview/display in DSL state

## Phase A — Backend step navigation contract

- [x] A1. Add `stepDefs` array and emit `steps[]` with `goto` actions in `shell()` helper
- [x] A2. Pass `stepId` from every step's `shell()` call
- [x] A3. Backend test: assert `shell.props.steps` has 7 items with `actions.select`
- [x] A4. Backend test: dispatch `goto:budget` and verify page id changes

## Phase B — Frontend step rail

- [x] B1. Extend `DesktopStepRail` props: add `onStepSelect`, clickable `<button>`, `aria-current`
- [x] B2. Update `DesktopShell` to accept and forward `stepItems` + `onStepSelect`
- [x] B3. Wire step dispatch in `render.tsx` desktop path
- [x] B4. TypeScript check passes

## Phase C — Backend upload intent in photo tiles

- [x] C1. Update `intake.flow.js` photo step to use `host/images.createUploadIntent`
- [x] C2. Change photo state from booleans to nullable image objects
- [x] C3. Backend test: photo step tiles include `upload.url` and `fieldName`

## Phase D — Frontend real upload + preview

- [x] D1. Add `postDslUpload()` to `backendClient.ts`
- [x] D2. Extend `DslRenderContext` with `backendUpload`
- [x] D3. Wire `BackendDslPage` to pass `backendUpload` in context
- [x] D4. Extend `PhotoTile` with hidden file input, `imageUrl` preview, upload flow
- [x] D5. Wire `uploadTile` in `render.tsx` to use `backendUpload` before dispatch
- [x] D6. TypeScript check passes

## Phase E — Verification

- [x] E1. Full `go test ./pkg/dslgoja ./pkg/server` passes
- [x] E2. Manual browser walkthrough: step rail navigation
- [x] E3. Manual browser walkthrough: image upload file inputs verified in DOM
- [x] E4. VLM visual verification of desktop and mobile
- [x] E5. Diary updated with all phases, commit, and changelog
