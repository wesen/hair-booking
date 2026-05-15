---
Title: Diary
Ticket: HAIR-039
Status: active
Topics:
  - frontend
  - dsl
  - admin
  - design-system
  - storybook
DocType: reference
Intent: long-term
Owners: []
RelatedFiles: []
ExternalSources: []
Summary: Diary for designing the admin design system and DSL for one-stylist salon management.
LastUpdated: 2026-05-15T00:00:00Z
WhatFor: Record the creation of HAIR-039 and the design rationale for the admin DSL.
WhenToUse: Read before implementing admin UI primitives, admin DSL schema/builders/renderers, or one-stylist MVP screens.
---

# Diary

## Goal

This diary captures the creation of the HAIR-039 ticket and the first design guide for a one-stylist salon admin design system and composable admin DSL.

## Step 1: Create the ticket and define the design target

The work started by creating a new docmgr ticket for the admin side of the backend-driven DSL. The goal is not a rigid one-function-per-screen system. The goal is an elegant middle layer: high-level enough that common admin pages are quick to build, but still composable enough to handle many small business websites and future admin surfaces.

The concrete guiding MVP is a self-employed one-stylist salon. This keeps the first design grounded: dashboard, calendar, intakes, clients, services/pricing, availability, website content, media, settings, and the forgotten modal/empty/error states.

### Prompt Context

**User prompt (verbatim):** "Createa new docmgr ticket to create the admin design system, using the concrete MVP case as a guidance, and develop the DSL and start building up screens and implementations like for the frontend DSL.

Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Create a new ticket for an admin design system and DSL, write an intern-facing implementation guide using the one-stylist salon MVP as the concrete case, store it in docmgr, and upload the guide to reMarkable.

**Inferred user intent:** The user wants the same kind of disciplined design package used for the intake DSL, but now for generic backend/admin management UIs with a simple but expressive authoring API.

**Commit (code):** N/A — documentation ticket creation and design guide work.

### What I did
- Created HAIR-039: `Admin design system and DSL for one-stylist salon management`.
- Added the design document `design-doc/01-admin-design-system-and-dsl-implementation-guide.md`.
- Added this diary document.
- Added initial tasks for current-state mapping, MVP screens, DSL API design, component/renderer planning, and implementation phases.
- Used the current frontend DSL files as the implementation model:
  - `web/src/page-dsl/schema.ts`
  - `web/src/page-dsl/builder.ts`
  - `web/src/page-dsl/render.tsx`
  - `web/src/page-dsl/BackendDslPage.tsx`
  - `web/src/LiveDslDemoApp.tsx`

### Why
- The admin DSL should reuse the proven pattern from the page DSL: ergonomic authoring API, plain JSON output, renderer as interpreter, backend action refs, and Storybook examples.
- The one-stylist MVP prevents overbuilding a generic admin framework before the actual product screens are clear.

### What worked
- HAIR-039 was created successfully.
- The existing intake DSL provides a clear implementation template.
- The corrected HAIR-038 persistence model gives the admin DSL a generic backend data story through `configDb` and `stateDb`.

### What didn't work
- N/A for ticket creation.

### What I learned
- The right admin DSL shape should sit between low-level UI nodes and rigid resource scaffolding. It should provide `admin.page`, `resource.page`, `form`, `field`, `view`, `modal`, `drawer`, `action`, and `query` primitives, but all of those should still emit inspectable JSON.

### What was tricky to build
- The tricky design constraint is balancing expressiveness and simplicity. Too low-level and every admin screen becomes verbose; too high-level and the DSL becomes a set of fixed screen generators. The guide frames the solution as layered primitives: shells and resource patterns on top, ordinary layout/form/display nodes underneath.

### What warrants a second pair of eyes
- Review whether admin DSL should extend `web/src/page-dsl` directly or live in a sibling `web/src/admin-dsl` package with conversion/interop.
- Review whether resource/query/action naming should be generic now or hair-salon-specific for the first implementation.

### What should be done in the future
- Implement Phase 1 from the guide: scaffold `web/src/admin-dsl` schema, builder, examples, renderer shell, and Storybook stories.
- Keep the first implementation documentation-first and Storybook-first before connecting to live backend data.

### Code review instructions
- Start with the HAIR-039 design guide.
- Then inspect current DSL files in `web/src/page-dsl` to see the implementation pattern being mirrored.

### Technical details
- Ticket path:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management`

## Step 2: Upload and validate the guide

After writing the guide, I uploaded it to reMarkable so it can be reviewed away from the terminal. I also validated the docmgr frontmatter for both the guide and the diary.

One command failed because I passed a `ttmp/...` path to `docmgr validate frontmatter` while already running from the repository root; this command expects paths relative to the docmgr root, not paths prefixed with `ttmp/`. I reran validation with `2026/05/15/...` paths and both documents passed.

### Prompt Context

**User prompt (verbatim):** (same as Step 1)

**Assistant interpretation:** Upload the completed admin DSL design guide to reMarkable and make sure the ticket documentation is valid.

**Inferred user intent:** The user wants the design package available as both structured ticket documentation and a readable PDF on the reMarkable.

**Commit (code):** N/A — documentation and upload work.

### What I did
- Uploaded the guide with:
  - `remarquee upload bundle ... --name "HAIR 039 Admin Design System DSL Guide" --remote-dir "/ai/2026/05/15/HAIR-039" --toc-depth 2 --non-interactive`
- Upload succeeded:
  - `OK: uploaded HAIR_039_Admin_Design_System_DSL_Guide.pdf -> /ai/2026/05/15/HAIR-039`
- Validated frontmatter for the guide and diary.
- Updated the changelog with the upload location.

### Why
- The reMarkable PDF is useful for longer-form review.
- Frontmatter validation prevents broken docmgr metadata from accumulating.

### What worked
- reMarkable upload succeeded without manual authentication.
- `docmgr validate frontmatter` passed after using paths relative to the docmgr root.

### What didn't work
- Failed validation command:
  - `docmgr validate frontmatter --doc ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/01-admin-design-system-and-dsl-implementation-guide.md --suggest-fixes`
- Error:
  - `Error: open /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/01-admin-design-system-and-dsl-implementation-guide.md: no such file or directory`
- Corrected by removing the leading `ttmp/` in the `--doc` value.

### What I learned
- For `docmgr validate frontmatter`, use paths relative to the docs root (`2026/...`) rather than repository-relative `ttmp/2026/...` paths.

### What was tricky to build
- The upload itself was straightforward. The only sharp edge was docmgr path interpretation: some docmgr commands accept ticket/doc paths from the repo root in examples, but `validate frontmatter` resolved the path relative to `ttmp`, causing a duplicated `ttmp/ttmp` path.

### What warrants a second pair of eyes
- Review the guide's proposed `admin-dsl` package split and confirm whether it should stay separate or eventually merge with `page-dsl`.

### What should be done in the future
- Start Phase 1 implementation with the services/pricing admin page.

### Code review instructions
- Review the guide first, especially sections 6-19.
- Confirm that the proposed API keeps the intended balance of simplicity and expressiveness.

### Technical details
- reMarkable path:
  - `/ai/2026/05/15/HAIR-039/HAIR_039_Admin_Design_System_DSL_Guide.pdf`

## Step 3: Split implementation into concrete phases

I expanded HAIR-039 from a design guide into an executable implementation checklist. The phase plan starts with the DSL contract and builder helpers, then adds a renderer, Storybook demo pages, validation/documentation, and a follow-up backlog for tests and backend integration.

The split intentionally keeps the first implementation small. We can prove the DSL shape with frontend-only fixtures and Storybook demos before introducing backend-driven admin flows or persistence semantics.

### Prompt Context

**User prompt (verbatim):** "Create detailed list of tasks split into phases to build the DSL and a couple of demo pages in storybook to get started. Then work on them one by one, committing as you go and keeping a diary"

**Assistant interpretation:** Turn HAIR-039 into phased implementation tasks, then implement each phase incrementally with commits and diary updates.

**Inferred user intent:** The user wants the admin DSL work to move from design into concrete tracked implementation, while preserving the disciplined ticket/diary workflow used by earlier HAIR tickets.

**Commit (code):** TBD — documentation phase will be committed after changelog update.

### What I did
- Rewrote `tasks.md` into phases:
  - Phase 0: Planning and task breakdown.
  - Phase 1: Admin DSL foundation.
  - Phase 2: Renderer and starter components.
  - Phase 3: Storybook demo pages.
  - Phase 4: Validation and documentation.
  - Phase 5: Follow-up backlog.

### Why
- A phased task list keeps the implementation reviewable and lets us commit at natural boundaries.
- It also prevents backend integration from blocking frontend DSL exploration.

### What worked
- The design guide already had enough implementation detail to convert into actionable tasks.

### What didn't work
- N/A.

### What I learned
- The safest first slice is frontend-only: schema, builder, examples, renderer, and Storybook. Backend admin flows should come after the JSON/UI language is stable.

### What was tricky to build
- The task split had to preserve the user's simplicity/expressiveness goal. The phases avoid prematurely building a full admin framework while still creating enough structure to test real pages.

### What warrants a second pair of eyes
- Review whether Phase 1 should include tests immediately or whether Storybook JSON contract review is enough for the first slice.

### What should be done in the future
- Implement Phase 1 next: schema, builder, examples, and exports.

### Code review instructions
- Review `tasks.md` first to confirm the planned ordering.
- Then review new `web/src/admin-dsl/*` files as they are added.

### Technical details
- Task file:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/tasks.md`

## Step 4: Build the first admin DSL slice and Storybook demos

I implemented the first working admin DSL slice under `web/src/admin-dsl`. The slice includes a JSON-safe schema, fluent builder helpers, three concrete MVP examples, a renderer/interpreter, exports, and Storybook stories. The examples are intentionally frontend-only fixtures for now: they prove the API and visual vocabulary before a backend admin flow exists.

The API keeps the simplicity/expressiveness balance by offering high-level helpers such as `admin.dashboard`, `resource.page`, `field.text`, `view.list`, and `action.open`, while still emitting inspectable JSON. The renderer uses explicit node-kind switches rather than dynamic component lookup.

### Prompt Context

**User prompt (verbatim):** (same as Step 3)

**Assistant interpretation:** Implement the initial admin DSL files and a few Storybook demo pages, then validate and record what happened.

**Inferred user intent:** The user wants a tangible starting point for the admin DSL, not just design prose.

**Commit (code):** 27b67ac — "HAIR-039 Step 4: Add admin DSL Storybook demos"

### What I did
- Added `web/src/admin-dsl/schema.ts`:
  - `AdminPage`, `AdminNode`, `AdminActionRef`, `AdminQueryRef`, render event/context types.
- Added `web/src/admin-dsl/builder.ts`:
  - `admin`, `resource`, `field`, `view`, `action`, and `query` helpers.
- Added `web/src/admin-dsl/examples.ts`:
  - Services & Pricing resource page.
  - Today dashboard page.
  - Calendar week page.
- Added `web/src/admin-dsl/render.tsx`:
  - explicit renderer mappings for shell, toolbar, sections, metric cards, resource rows/lists, forms, fields, modal/drawer, confirm dialog, and calendar blocks.
- Added `web/src/admin-dsl/AdminDsl.stories.tsx`:
  - Services & Pricing story.
  - Dashboard story.
  - Calendar story.
  - JSON contract story.
- Added `web/src/admin-dsl/index.ts` exports.

### Why
- The first code slice should prove the DSL ergonomics and emitted JSON before introducing backend flows.
- Storybook gives quick design review for the one-stylist admin MVP screens.

### What worked
- `npx tsc --noEmit` passed from `web/`.
- The builder API can express the first three admin pages without becoming one helper per screen.
- The renderer remains explicit and reviewable.

### What didn't work
- Full frontend test command failed in existing page DSL tests:
  - Command: `cd web && pnpm test -- --runInBand`
  - Failures:
    - `src/page-dsl/InteractiveDsl.test.tsx > routes selectableGroup changes through named DSL action payloads`
    - `src/page-dsl/InteractiveDsl.test.tsx > routes uploadTile actions`
  - Exact assertions:
    - `expected +0 to be 2` for `[data-component='ServiceOption']` query.
    - expected upload action spy to be called, but call count was `0`.
- These tests exercise the pre-existing `page-dsl` renderer, not the new `admin-dsl` files. I did not change `web/src/page-dsl/*` in this step.

### What I learned
- `AdminActionRef` and `AdminQueryRef` need to be JSON-object compatible because they are stored inside node props. I made them intersections with `AdminJsonObject` and ensured helper constructors omit `undefined` fields.
- Keeping examples as plain `toJSON()` output immediately catches accidental non-JSON values.

### What was tricky to build
- The TypeScript index-signature constraints were the main sharp edge. Optional fields like `label?: string` and `payload?: AdminJsonValue` are fine as TypeScript interfaces, but they conflict with a strict JSON object index signature when the value is `undefined`. The fix was to construct action/query objects without undefined properties.
- The renderer is intentionally inline for this first slice. That is fast to review, but if it grows further, components should move to `web/src/admin/atoms`, `web/src/admin/molecules`, and `web/src/admin/organisms`.

### What warrants a second pair of eyes
- Review `builder.ts` for API ergonomics: it should feel concise but not magical.
- Review `render.tsx` for whether any node kinds are too app-specific.
- Review whether services/dashboard/calendar are the right first Storybook demos or whether intake requests should come next.

### What should be done in the future
- Add admin DSL builder unit tests.
- Add admin interaction tests for row action dispatch and modal/confirm action dispatch.
- Split renderer internals into reusable admin components if the next phase expands the visual system.
- Investigate the existing `page-dsl/InteractiveDsl.test.tsx` failures separately.

### Code review instructions
- Start with `web/src/admin-dsl/examples.ts` to understand the desired authoring experience.
- Then inspect `web/src/admin-dsl/schema.ts` and `web/src/admin-dsl/builder.ts` for the JSON contract.
- Then inspect `web/src/admin-dsl/render.tsx` for node-kind mappings.
- Validate with:
  - `cd web && npx tsc --noEmit`
- Be aware that full `pnpm test -- --runInBand` currently fails in unrelated existing `page-dsl` tests.

### Technical details
- New files:
  - `web/src/admin-dsl/schema.ts`
  - `web/src/admin-dsl/builder.ts`
  - `web/src/admin-dsl/examples.ts`
  - `web/src/admin-dsl/render.tsx`
  - `web/src/admin-dsl/AdminDsl.stories.tsx`
  - `web/src/admin-dsl/index.ts`

## Step 5: Add focused admin DSL tests

I added a small focused test file for the new admin DSL instead of trying to fix unrelated existing page DSL failures in the same step. The tests cover the most important contract for this slice: builders emit stable plain JSON, and rendered resource-row actions dispatch inspectable action events.

This gives the admin DSL its own validation surface while preserving the earlier note that the full frontend test suite still has pre-existing `page-dsl` interaction failures.

### Prompt Context

**User prompt (verbatim):** (same as Step 3)

**Assistant interpretation:** Continue the phased implementation by adding targeted tests for the new admin DSL and committing the next slice.

**Inferred user intent:** The user wants each implementation slice to be validated and recorded rather than just visually added to Storybook.

**Commit (code):** c56fec9 — "HAIR-039 Step 5: Add admin DSL focused tests"; 7184a3a — "HAIR-039 Step 5: Cover confirm admin actions"

### What I did
- Added `web/src/admin-dsl/AdminDsl.test.tsx`.
- Tested that a small admin page built with `admin.page`, `admin.section`, `resource.list`, `resource.row`, and `action.open` round-trips through `JSON.stringify` / `JSON.parse`.
- Tested that the Services & Pricing demo renders key rows and dispatches the row `Edit` action.
- Extended the interaction coverage to click an `Archive` confirm action and assert the renderer dispatches `type: "confirm"` targeting `archiveService`.

### Why
- The admin DSL's most important invariant is that ergonomic builders still produce plain JSON.
- The renderer's most important first behavior is dispatching actions with explicit node/action metadata.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Focused admin tests passed:
  - `cd web && pnpm vitest run src/admin-dsl/AdminDsl.test.tsx`
  - `2 passed`.

### What didn't work
- I did not rerun the full frontend test suite after adding admin tests because the previous full run already showed unrelated `page-dsl/InteractiveDsl.test.tsx` failures.

### What I learned
- The admin DSL can be tested without a backend by asserting the JSON contract and render dispatch events.
- Focused tests are the right first validation level for this frontend-only phase.

### What was tricky to build
- The Storybook examples include several duplicate visible `Edit` buttons because each service row has an edit action. The test uses `getAllByRole("button", { name: "Edit" })[0]` intentionally to click the first row action.

### What warrants a second pair of eyes
- Review whether the first test should assert a stricter full JSON snapshot or whether structural assertions are better while the DSL is still evolving.

### What should be done in the future
- Add renderer tests for modal/confirm actions.
- Add a JSON fixture snapshot once node naming stabilizes.

### Code review instructions
- Start with `web/src/admin-dsl/AdminDsl.test.tsx`.
- Then inspect the corresponding example page in `web/src/admin-dsl/examples.ts`.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm vitest run src/admin-dsl/AdminDsl.test.tsx`

### Technical details
- New test file:
  - `web/src/admin-dsl/AdminDsl.test.tsx`

## Step 6: Fix the existing page DSL interaction tests

After explaining the existing `page-dsl` interaction tests, I fixed the two failing assertions from the full frontend test run. This step touched the older client-facing page DSL, not the new admin DSL, because the failures were in `web/src/page-dsl/InteractiveDsl.test.tsx` and `web/src/page-dsl/render.tsx`.

The selectable-group test had drifted from the renderer's current component selection rule: options with subtitles and no badges render as `BudgetOption`, not `ServiceOption`. The upload-tile behavior had a real fallback issue: the renderer always passed `onUploadFile`, so a no-backend upload tile opened the hidden file picker instead of dispatching the local named `upload` action on click.

### Prompt Context

**User prompt (verbatim):** "go ahead"

**Assistant interpretation:** Proceed with fixing the existing page-DSL interaction tests that were explained in the previous response.

**Inferred user intent:** The user wants the full frontend test suite green, including the older page DSL tests, before continuing admin DSL work.

**Commit (code):** TBD — this fix will be committed after diary/changelog updates.

### What I did
- Updated `web/src/page-dsl/InteractiveDsl.test.tsx`:
  - changed the selectable-group selector from `[data-component='ServiceOption']` to `[data-component='BudgetOption']` for subtitle/no-badge options.
- Updated `web/src/page-dsl/render.tsx`:
  - added direct `onUpload` dispatch for `uploadTile` local-action fallback.
  - only passes `onUploadFile` when there is a backend upload intent URL and `ctx.backendUpload` exists.

### Why
- The selectable test should match the renderer's documented molecule mapping.
- Local upload-tile actions should still work without a backend upload intent, especially in Storybook/local DSL examples.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Full frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - `7 passed`, `27 passed`.

### What didn't work
- N/A after the fix. The previously failing tests now pass.

### What I learned
- The selectable-group failure was selector drift caused by a legitimate renderer rule.
- The upload-tile failure exposed a fallback behavior regression: `PhotoTile` interprets `onUploadFile` as file-picker mode, so the renderer should not pass that prop unless a real backend upload path is available.

### What was tricky to build
- `PhotoTile` supports both direct local upload callbacks and file-picker uploads. Passing both callbacks is valid, but passing `onUploadFile` changes click behavior for empty tiles. The renderer now chooses the callback shape based on whether backend upload handling is actually configured.

### What warrants a second pair of eyes
- Review whether Storybook upload-tile demos should show both modes explicitly:
  - direct local action mode,
  - backend upload intent mode.

### What should be done in the future
- Add a backend-upload-intent-specific test that simulates file selection and asserts `ctx.backendUpload` is called.

### Code review instructions
- Review `web/src/page-dsl/render.tsx` around the `uploadTile` case.
- Review `web/src/page-dsl/InteractiveDsl.test.tsx` for the updated current-renderer selector.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- Files changed:
  - `web/src/page-dsl/render.tsx`
  - `web/src/page-dsl/InteractiveDsl.test.tsx`
