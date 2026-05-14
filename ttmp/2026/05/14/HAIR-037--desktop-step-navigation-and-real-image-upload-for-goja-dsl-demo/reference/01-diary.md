---
Title: Diary
Ticket: HAIR-037
Status: active
Topics:
    - dsl
    - frontend
    - desktop
    - uploads
    - goja
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/05/14/HAIR-037--desktop-step-navigation-and-real-image-upload-for-goja-dsl-demo/analysis/01-desktop-navigation-and-image-upload-implementation-guide.md
      Note: Primary guide created in Step 1
    - Path: web/src/molecules/DesktopStepRail/DesktopStepRail.tsx
      Note: Current display-only step rail shaped navigation plan
    - Path: web/src/molecules/PhotoTile/PhotoTile.tsx
      Note: Current fake upload tile behavior shaped real upload plan
ExternalSources: []
Summary: Chronological diary for HAIR-037 desktop step navigation and real image upload work.
LastUpdated: 2026-05-14T14:10:01.588315574-04:00
WhatFor: Use this to resume HAIR-037 implementation with context on decisions, failures, and validation steps.
WhenToUse: Before implementing or reviewing desktop step rail navigation and real image upload changes.
---


# Diary

## Goal

Track the implementation work for making the Goja DSL demo behave like a proper desktop app: clickable left step navigation and real uploaded image previews.

## Step 1: Create ticket and write implementation guide

Created a new docmgr ticket and wrote a technical implementation guide for two product gaps: the desktop step rail is currently display-only, and the photo upload tiles only toggle boolean state instead of uploading real files. The guide maps the current architecture and proposes concrete backend, frontend, and Goja flow changes.

This step intentionally did not implement the feature yet. It established the contract, acceptance criteria, risks, and test plan so the next implementation step can be focused and reviewable.

### Prompt Context

**User prompt (verbatim):** "Ok, create a new ticket to make things work properly:

- clicking the intake steps on the left on the desktop view should allow navigation back and forth
- image upload should actually work and images should be properly displayed if they have been uploaded

Create an analysis and implementation guide. Keep a diary as you work."

**Assistant interpretation:** Create a structured docmgr ticket and write an analysis/implementation guide for desktop step rail navigation and real image uploads in the Goja DSL demo.

**Inferred user intent:** Prepare the next implementation phase with a clear plan, file map, and diary before changing behavior.

### What I did

- Attempted to create HAIR-036, discovered HAIR-036 already existed for Go host modules.
- Removed the accidental duplicate HAIR-036 directory from `ttmp/2026/05/14/...` to restore docmgr ticket uniqueness.
- Created HAIR-037: `Desktop step navigation and real image upload for Goja DSL demo`.
- Added five initial tasks covering step rail analysis, click navigation design, upload path analysis, real image upload design, and implementation/verification.
- Related the main files that shape the implementation:
  - `web/src/molecules/DesktopStepRail/DesktopStepRail.tsx`
  - `web/src/organisms/DesktopShell/DesktopShell.tsx`
  - `web/src/page-dsl/render.tsx`
  - `web/src/page-dsl/backendClient.ts`
  - `web/src/molecules/PhotoTile/PhotoTile.tsx`
  - `pkg/dslgoja/flows/intake.flow.js`
  - `pkg/server/handlers_dsl_uploads.go`
  - `pkg/dslgoja/images.go`
- Wrote `analysis/01-desktop-navigation-and-image-upload-implementation-guide.md` with contracts, implementation sequence, tests, and risks.

### Why

Both requested features cross the frontend/backend DSL boundary. Step navigation needs new shell action metadata and React rail click dispatching. Real uploads need a file input, multipart upload client, backend upload intent usage, and Goja state updates. Writing the guide first avoids a piecemeal implementation that only works in one layer.

### What worked

- The current upload backend is already mostly present: upload intents, multipart handler, blob storage integration, and metadata recording exist.
- The current desktop renderer already has the right dispatch primitives (`backendDispatch`, action refs, and desktop shell rendering) to support step rail actions with a small contract extension.
- The DSL does not need a new node kind for uploads; `uploadTile` can be enriched with `upload`, `imageUrl`, and `imageAlt` props.

### What didn't work

- `HAIR-036` was already taken. The first `docmgr ticket create-ticket --ticket HAIR-036 ...` created an ambiguous duplicate before subsequent doc commands failed. I removed the accidental duplicate directory and created HAIR-037 instead.

### What I learned

- The real upload path is further along than the frontend suggests. The missing pieces are primarily wiring and state shape, not the server-side storage endpoint.
- The desktop step rail needs action metadata from the Goja shell. Trying to infer navigation purely from labels would be fragile and would bypass the backend flow model.

### What was tricky to build

- The biggest design constraint is action lifetime. Goja action IDs are opaque and tied to the current render/page version, so clickable step rail items must use action refs emitted in the current page JSON.
- Upload intent lifetime also matters. The flow can create fresh upload intents on render, but stale/expired intents should not be reused by the frontend.

### What warrants a second pair of eyes

- Whether future step navigation should be unrestricted in the demo or gated by completion/validation. The guide recommends unrestricted navigation for this prototype, but production UX may differ.
- Whether removing a filled photo should be click-to-remove or a separate affordance. A separate remove button is safer, but the current tile behavior is click-to-remove.

### What should be done in the future

- Implement the guide in focused commits:
  1. Step rail navigation contract and frontend wiring.
  2. Upload client + PhotoTile file picker/preview.
  3. Goja flow photo state and upload intent integration.
- Add unit tests and VLM visual verification.

### Code review instructions

- Start with `analysis/01-desktop-navigation-and-image-upload-implementation-guide.md`.
- Review the current display-only rail in `DesktopStepRail.tsx` and the current fake upload path in `PhotoTile.tsx` + `intake.flow.js`.
- Validate future implementation with:
  - `go test ./pkg/dslgoja ./pkg/server`
  - `cd web && npx tsc --noEmit`
  - manual browser upload and step rail navigation checks.

### Technical details

Ticket path:

- `ttmp/2026/05/14/HAIR-037--desktop-step-navigation-and-real-image-upload-for-goja-dsl-demo/`

Primary guide:

- `analysis/01-desktop-navigation-and-image-upload-implementation-guide.md`

Key proposed contracts:

```ts
interface DslShellStep {
  id: string;
  label: string;
  index: number;
  current?: boolean;
  disabled?: boolean;
  actions?: { select?: DslActionRef };
}
```

```ts
interface UploadTileProps {
  value: string;
  label: string;
  filled: boolean;
  imageUrl?: string;
  imageAlt?: string;
  upload?: UploadIntent;
  actions: {
    upload?: DslActionRef;
    remove?: DslActionRef;
  };
}
```
