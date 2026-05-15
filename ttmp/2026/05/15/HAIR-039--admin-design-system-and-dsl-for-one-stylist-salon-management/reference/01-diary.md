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

## Step 7: Add a devctl Storybook profile and verify admin stories live

I added a dedicated `storybook` devctl profile so the admin DSL stories can be launched through the same orchestration workflow as the backend and Vite app. There was already an unmanaged Storybook process from a previous session on port 6006, so I stopped that stale process and restarted Storybook under devctl supervision.

After devctl startup, I verified that Storybook's `index.json` contains the new `Admin DSL/Rendered Pages` stories and opened the Services & Pricing story in Playwright. The iframe text showed the expected admin DSL page content: service rows, the edit modal, and the archive confirmation panel.

### Prompt Context

**User prompt (verbatim):** "can i alreayd see something in storybook? can you use devctl to start it if it isn't?"

**Assistant interpretation:** Check whether the new admin DSL stories are visible in Storybook and start Storybook via devctl if needed.

**Inferred user intent:** The user wants a live URL for visual review, preferably managed by devctl rather than an ad-hoc background process.

**Commit (code):** TBD — devctl profile/plugin changes will be committed after changelog update.

### What I did
- Added `.devctl.yaml` profile `storybook`.
- Extended `plugins/devctl/hair_booking.py` with a `storybook` service selection.
- Added devctl config keys for:
  - Storybook host/port/url,
  - direct Admin DSL Services & Pricing story URL.
- Validated the plugin:
  - `python3 -m py_compile plugins/devctl/hair_booking.py`
  - `devctl validate --profile storybook`
  - `devctl plan --profile storybook`
- Started Storybook under devctl:
  - `devctl up --profile storybook --force`
- Verified devctl status reports `hair-booking-storybook` alive.
- Verified Storybook index contains:
  - `admin-dsl-rendered-pages--services-pricing`
  - `admin-dsl-rendered-pages--dashboard`
  - `admin-dsl-rendered-pages--calendar`
  - `admin-dsl-rendered-pages--json-contract`
- Opened the Services & Pricing story in Playwright.

### Why
- A dedicated Storybook profile makes design review repeatable.
- Keeping Storybook under devctl prevents old unmanaged background processes from hiding port conflicts.

### What worked
- Storybook is now available at:
  - `http://127.0.0.1:6006`
- Admin DSL Services & Pricing is available at:
  - `http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--services-pricing`
- Playwright confirmed the story page title:
  - `Admin DSL / Rendered Pages - Services & Pricing ⋅ Storybook`

### What didn't work
- First `devctl up --profile storybook --force` found port 6006 occupied by a stale unmanaged Storybook process from May 13. Storybook prompted for port 6007 and exited from devctl's perspective.
- I stopped the stale process and reran devctl successfully.

### What I learned
- Storybook was already reachable, but it was not devctl-managed. The repo now has a proper devctl profile for it.

### What was tricky to build
- Storybook prompts interactively when port 6006 is occupied. In a devctl service, that looks like the supervised process exits while an old server may still be serving. The fix was to remove the stale unmanaged listener and let devctl own the port.

### What warrants a second pair of eyes
- Review whether the Storybook profile should become the default for design-system work or remain opt-in.

### What should be done in the future
- Add a short note to `plugins/devctl/README.md` documenting the new `storybook` profile.
- Consider a combined `design-review` profile if we later want Storybook plus Vite running together.

### Code review instructions
- Review `.devctl.yaml` for the new profile.
- Review `plugins/devctl/hair_booking.py` for the `storybook` service handling.
- Validate with:
  - `devctl validate --profile storybook`
  - `devctl plan --profile storybook`
  - `devctl up --profile storybook --force`

### Technical details
- Live URLs:
  - Storybook: `http://127.0.0.1:6006`
  - Admin DSL Services & Pricing: `http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--services-pricing`
  - Admin DSL Dashboard: `http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--dashboard`
  - Admin DSL Calendar: `http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--calendar`
  - Admin DSL JSON contract: `http://127.0.0.1:6006/?path=/story/admin-dsl-rendered-pages--json-contract`

## Step 8: Improve mobile responsive layout using cropped screenshots and VLM review

I focused this step on the mobile look of the new Admin DSL Storybook pages. I used `css-visual-diff` to capture cropped screenshots of the rendered Storybook iframe content, targeting `[data-admin-dsl-page]` so the artifacts exclude Storybook chrome and browser whitespace. I then sent the cropped Services & Pricing, Dashboard, and Calendar screenshots to the image review tool in batches for layout critique.

The first review identified the main mobile problems: oversized headlines, cramped cards, side panels stacking awkwardly, action buttons needing larger tap areas, duplicate modal titles, low-contrast metadata, and a cramped calendar grid. I applied a responsive pass in `web/src/admin-dsl/render.tsx` and `web/src/admin-dsl/examples.ts`, regenerated the cropped screenshots, and ran a second review. The final review said the pass is good enough to commit, with only calendar density and save-status contrast as potential blockers; I addressed those too by adding horizontal calendar scrolling and making the save status a clearer pill.

### Prompt Context

**User prompt (verbatim):** "now focus on the mobile look / responsive look of these page,s you can use your VLM image answering tool, and it would be useful to use for example css-visual-diff to extract nicely cropped screenshots of just the page, and not all the storybook chrome or browser whitepsace"

**Assistant interpretation:** Use cropped visual evidence and VLM review to improve the mobile/responsive rendering of the admin DSL Storybook pages.

**Inferred user intent:** The user wants practical visual iteration, not only code changes; screenshots should focus on the actual page region and avoid noisy Storybook/browser chrome.

**Commit (code):** TBD — responsive pass will be committed after diary/changelog update.

### What I did
- Captured cropped mobile screenshots with `css-visual-diff compare` at `390x844` using selector `[data-admin-dsl-page]`.
- Reviewed Services & Pricing, Dashboard, and Calendar screenshots with the image review tool.
- Added responsive CSS inside `AdminPageRenderer`:
  - mobile root padding reduction,
  - single-column main/side layout below 720px,
  - smaller fluid page titles,
  - smaller section headings,
  - full-width/tappable action buttons on narrow screens,
  - single-column resource rows,
  - stacked save bar,
  - taller filter pills,
  - hidden modal/drawer kicker label on mobile.
- Improved status badge contrast.
- Removed the duplicate `Edit service` form title inside the `Edit service` modal.
- Normalized calendar drawer time display from `9:30a – 12:00p` to `09:30 – 12:00`.
- Added horizontal scrolling/min-width for mobile calendar week grids to avoid five tiny columns.
- Improved save status contrast by rendering it as a pill.

### Why
- Admin screens have denser information than intake screens, so mobile behavior needs explicit rules.
- Cropped screenshot review catches layout issues that are hard to see from code, especially overflow, typography scale, and modal/drawer stacking.

### What worked
- `css-visual-diff` produced focused page-region artifacts under:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/mobile-cssvd/`
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/mobile-cssvd-after/`
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/mobile-cssvd-final/`
- The VLM reviews were useful for prioritizing practical fixes.
- Final validation passed:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
  - `7 passed`, `27 passed`.

### What didn't work
- One final `css-visual-diff` run timed out after writing only a partial error screenshot. The screenshot showed a transient Storybook/Vite module error:
  - `The requested module '/src/admin-dsl/examples.ts?...' does not provide an export named 'adminDslExamples'`
- The export existed in the source file, so I restarted the devctl-managed Storybook process and regenerated the screenshots successfully.
- Devctl restart command syntax correction:
  - Failed: `devctl restart --service hair-booking-storybook`
  - Correct: `devctl restart hair-booking-storybook --profile storybook`

### What I learned
- The `read` tool is useful for quickly inspecting a single generated image in-session, while the image review tool is better for comparing multiple screenshots with a shared context.
- Storybook/Vite can transiently serve stale module state after rapid source edits; restarting the devctl-managed Storybook service fixed the issue.
- Mobile calendar week views need a different interaction model eventually; horizontal scrolling is acceptable for the first pass, but a real mobile agenda/day view should be a follow-up.

### What was tricky to build
- The first responsive pass had to avoid overfitting to a single page. I used CSS classes on the renderer output (`adminDslRoot`, `adminDslGrid`, `adminDslResourceRow`, `adminDslOverlaySurface`, `adminDslSaveBar`, etc.) instead of styling each story separately.
- The calendar is the hardest mobile surface. Five columns at 390px are too dense, so I chose a minimum inner width and horizontal scroll as a pragmatic first-pass fix rather than implementing a new agenda renderer.

### What warrants a second pair of eyes
- Review the mobile calendar behavior: horizontal scroll is functional, but product may prefer a day/agenda view below 420px.
- Review whether inline responsive CSS in `render.tsx` should move into a real `admin-dsl.css` or extracted admin component package.
- Review contrast of all small meta labels on real devices.

### What should be done in the future
- Add a dedicated mobile calendar node/variant, likely agenda/day view.
- Add visual regression scripts for the three Admin DSL pages so mobile screenshots are easy to refresh.
- Extract renderer styling to proper admin design-system components if the renderer grows further.

### Code review instructions
- Start with `web/src/admin-dsl/render.tsx` responsive CSS and renderer class names.
- Then inspect `web/src/admin-dsl/examples.ts` for the modal title and calendar time changes.
- Review the cropped evidence in:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/mobile-cssvd-final/`
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- Main changed files:
  - `web/src/admin-dsl/render.tsx`
  - `web/src/admin-dsl/examples.ts`
- Example screenshot command pattern:
  - `css-visual-diff compare --url1 "http://127.0.0.1:6006/iframe.html?id=admin-dsl-rendered-pages--services-pricing&viewMode=story" --selector1 '[data-admin-dsl-page]' --url2 "http://127.0.0.1:6006/iframe.html?id=admin-dsl-rendered-pages--services-pricing&viewMode=story" --selector2 '[data-admin-dsl-page]' --viewport-w 390 --viewport-h 844 --wait-ms1 1000 --wait-ms2 1000 --threshold 0 --out ".../mobile-cssvd-final/services-pricing"`

## Step 9: Constrain calendar appointment blocks to their day columns

The mobile responsive pass exposed a real calendar widget bug: appointment blocks were rendered as normal children inside an absolute overlay, so each block visually spanned the whole workweek content area rather than being constrained to a single day column. This made the calendar misleading even if the surrounding responsive layout was improved.

I changed the calendar week renderer to lay out the time grid as an actual CSS grid with day columns and hour rows. Calendar child nodes now render through a dedicated `renderCalendarBlock(...)` helper that reads `column`, `startsAt`, and `span`, then assigns `gridColumn` and `gridRow` so the appointment is constrained to its intended day and time range.

### Prompt Context

**User prompt (verbatim):** "calendar widget is off, because the appointment span the whole workweekk, instead of being constrained to a single day, at least in the current calendar test page"

**Assistant interpretation:** Fix the Admin DSL calendar demo so appointment blocks occupy a specific day column instead of stretching across the full week grid.

**Inferred user intent:** The user wants the demo calendar to communicate correct semantics before continuing visual polish.

**Commit (code):** TBD — this calendar fix will be committed with the responsive pass.

### What I did
- Updated `web/src/admin-dsl/render.tsx` calendar rendering:
  - replaced the absolute child overlay with a CSS grid of day columns and hour rows,
  - added `hourLabelToHour(...)`, `rowForStartTime(...)`, and `renderCalendarBlock(...)`,
  - mapped `column` to `gridColumn`,
  - mapped `startsAt` plus `hours` to a starting grid row,
  - mapped `span` to `gridRow: row / span N`.
- Regenerated a cropped mobile calendar screenshot with `css-visual-diff`.
- Inspected the image directly with `read`; appointments are now constrained to columns:
  - Monday appointments in the Monday column,
  - Tuesday time-off block in the Tuesday column,
  - no full-week spanning appointment blocks.

### Why
- A calendar demo must preserve spatial meaning: day column and time row are the primary semantics.
- The previous implementation was acceptable as placeholder cards but wrong as a calendar widget.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Focused admin DSL tests passed:
  - `cd web && pnpm vitest run src/admin-dsl/AdminDsl.test.tsx`
- Full frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - `7 passed`, `27 passed`.
- The cropped calendar screenshot now shows constrained appointment blocks.

### What didn't work
- N/A after the grid fix.

### What I learned
- The calendar needs a specialized renderer path for appointment children. Reusing the generic `appointmentBlock` rendering inside an absolute stack loses calendar semantics.
- Even for a demo page, spatial components need correct data-to-layout mapping early, otherwise visual review gives false confidence.

### What was tricky to build
- The renderer needed to support both generic appointment blocks and calendar-contained appointment blocks. I kept the generic `appointmentBlock` case, but `calendarWeek` now renders its children with `renderCalendarBlock(...)` instead of calling `renderChildren(...)`.
- Time parsing is intentionally simple for now: it maps `startsAt` to the matching hour label. This is enough for the demo but not enough for sub-hour accurate placement in a real scheduler.

### What warrants a second pair of eyes
- Review whether `span` should mean hours, grid rows, or minutes in the long-term DSL contract.
- Review whether `column` should be replaced by an explicit `day` or `date` prop before backend integration.

### What should be done in the future
- Add a calendar renderer test that asserts appointment blocks get the expected `gridColumn`/`gridRow` styles.
- Replace `column` with `date` or `dayKey` once the backend data model is introduced.
- Implement minute-level positioning for appointments that start at 09:30 instead of snapping to 09:00.

### Code review instructions
- Review `calendarWeek` and `renderCalendarBlock(...)` in `web/src/admin-dsl/render.tsx`.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
- Inspect visual evidence:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/mobile-calendar-fix/calendar/url1_screenshot.png`

### Technical details
- Main file changed:
  - `web/src/admin-dsl/render.tsx`

## Step 10: Add a mobile-specific calendar agenda view

After the calendar grid was constrained to day columns, we decided the mobile interaction model still needed to change. A horizontally scrollable week grid is technically correct, but awkward on a flexible touch surface: the user has to pan sideways inside a component while also scrolling the page vertically.

I added a mobile-specific agenda rendering mode for `calendarWeek`. The desktop/tablet renderer remains the day/hour grid. Below the mobile breakpoint, the grid is hidden and the same appointment nodes are rendered as day-grouped agenda cards with large tap targets.

### Prompt Context

**User prompt (verbatim):** "ok, yes we want a mobile specific calendar version because the scrolling on a flexible touch surface like the calendar is not easy."

**Assistant interpretation:** Replace the mobile calendar week grid interaction with a dedicated agenda/list view while preserving the desktop week grid.

**Inferred user intent:** The user wants mobile users to review and tap appointments without nested horizontal scrolling.

**Commit (code):** TBD — mobile agenda work will be committed after diary/changelog update.

### What I did
- Updated `web/src/admin-dsl/render.tsx`:
  - `calendarWeek` now renders both a desktop grid and a mobile agenda.
  - added `renderCalendarAgenda(...)` to group appointment nodes by day/column.
  - added `renderCalendarAgendaItem(...)` for large tap-friendly appointment rows.
  - responsive CSS hides `.adminDslCalendarScroller` and shows `.adminDslCalendarAgenda` below 720px.
- Regenerated a cropped mobile calendar screenshot with `css-visual-diff`.
- Inspected the screenshot directly with `read`.
- Asked the image review tool whether the mobile agenda solves the usability problem.

### Why
- Nested horizontal scrolling is not a good primary mobile interaction for an admin calendar.
- A vertical agenda is easier to scan, easier to tap, and fits the rest of the mobile admin page layout.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Full frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - `7 passed`, `27 passed`.
- The image review tool said the agenda solves the touch-scrolling issue for a first pass and found no blocker-level visual issues.

### What didn't work
- N/A.

### What I learned
- Keeping both renderings in the same `calendarWeek` node lets the DSL stay simple while the renderer adapts interaction model by viewport.
- `column` is still a weak data model for long-term backend use, but it is enough for grouping the current demo appointments into day cards.

### What was tricky to build
- The agenda needed to reuse the same calendar child nodes without changing the demo data. I grouped children by `props.column` so existing `appointmentBlock` and `timeOffBlock` fixtures work in both desktop grid and mobile agenda views.
- The renderer now has two calendar-specific child render paths: one for grid placement and one for agenda rows. This is acceptable for the first pass, but it should be extracted when admin components mature.

### What warrants a second pair of eyes
- Review whether the mobile breakpoint should be 720px or lower.
- Review whether the agenda should include empty days or only days with appointments. The first pass only shows populated days.

### What should be done in the future
- Replace `column` with `dayKey` or `date` in the calendar DSL contract.
- Add sticky day headers for long agendas.
- Add a calendar renderer test that verifies mobile agenda rows render grouped by day.

### Code review instructions
- Review `renderCalendarAgenda(...)` and `renderCalendarAgendaItem(...)` in `web/src/admin-dsl/render.tsx`.
- Inspect visual evidence:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/mobile-agenda/calendar/url1_screenshot.png`
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- Main changed file:
  - `web/src/admin-dsl/render.tsx`

## Step 11: Plan the next hardening phases

I converted the immediate next steps into a small set of tracked phases focused on maintainability and regression coverage. I intentionally scoped this batch to frontend/admin-DSL hardening: extract the calendar renderer, test the mobile agenda behavior, and document the visual review workflow. Backend-driven admin flows and config draft/publish semantics remain important, but they should be a separate backend-focused phase rather than mixed into this component cleanup.

This keeps the work shippable in small commits while protecting the mobile calendar decision we just made.

### Prompt Context

**User prompt (verbatim):** "ok, create phases and tasks, and then do them all, commit at appropriate intervals and keep a detailed diary"

**Assistant interpretation:** Add concrete phases/tasks for the next admin DSL hardening work, then implement them with commits and diary updates.

**Inferred user intent:** The user wants disciplined execution: planned phases, incremental implementation, validation, commits, and a detailed implementation diary.

**Commit (code):** TBD — planning phase will be committed after changelog update.

### What I did
- Added Phase 6: component extraction and maintainability.
- Added Phase 7: mobile calendar regression coverage.
- Added Phase 8: review workflow documentation and scripts.

### Why
- `render.tsx` was beginning to contain too much specialized calendar logic.
- The mobile agenda behavior should be protected by tests.
- The screenshot workflow should be reproducible instead of relying on remembered commands.

### What worked
- The remaining HAIR-039 ticket already had a clear next-step backlog, so this phase plan is a focused continuation rather than a new direction.

### What didn't work
- N/A.

### What I learned
- The next safe unit is not backend integration yet; it is making the frontend admin DSL implementation easier to maintain and review.

### What was tricky to build
- The task scope needed to avoid becoming too broad. I kept backend-driven services/pricing and draft/publish design out of this immediate batch so the requested “do them all” remains realistic and reviewable.

### What warrants a second pair of eyes
- Confirm whether backend admin flow work should become HAIR-040 or a later HAIR-039 phase after the frontend component extraction lands.

### What should be done in the future
- Create a backend-focused phase/ticket for `fringe.admin.services.v1` and config draft/publish semantics.

### Code review instructions
- Review the new Phase 6-8 tasks in `tasks.md`.
- Then review the follow-up commits for extracted calendar code, tests, and scripts.

### Technical details
- Task file:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/tasks.md`

## Step 12: Extract the admin calendar renderer and add regression tests

I extracted the specialized calendar code out of the generic admin DSL renderer into a focused calendar module. The generic renderer now delegates `calendarWeek` nodes to `AdminCalendarWeek`, while the new module owns the desktop grid, mobile agenda, day grouping, and calendar-specific action dispatch.

I also added tests for the behavior that motivated the extraction: the mobile agenda structure must exist, appointments must be grouped by day, and appointment clicks must still dispatch actions after the component split.

### Prompt Context

**User prompt (verbatim):** (same as Step 11)

**Assistant interpretation:** Implement the planned component extraction and regression coverage phases, committing at a clean boundary.

**Inferred user intent:** The user wants the current renderer to become maintainable and wants the mobile calendar behavior protected from accidental regressions.

**Commit (code):** TBD — this extraction/test slice will be committed after task/changelog update.

### What I did
- Added `web/src/admin-dsl/calendar.tsx`.
- Moved calendar-specific helpers into the new module:
  - hour label parsing,
  - row calculation,
  - desktop calendar block placement,
  - mobile agenda grouping,
  - mobile agenda row rendering.
- Replaced the `calendarWeek` case in `web/src/admin-dsl/render.tsx` with:
  - `<AdminCalendarWeek ... />`
- Updated action extraction to support both action arrays and keyed action maps.
- Added tests to `web/src/admin-dsl/AdminDsl.test.tsx`:
  - mobile agenda DOM exists and includes `Mon`, `Tue`, and the demo appointments,
  - clicking `apt-1001` dispatches an `appointmentBlock` action targeting `appointmentDetail`.

### Why
- The calendar is now complex enough to deserve a focused module.
- The mobile agenda decision is important UX behavior and should be covered by tests.
- Keyed action maps are used by `node.action(slot, actionRef)`, so calendar blocks need to understand both array-style and map-style actions.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Full frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - `7 passed`, `29 passed`.

### What didn't work
- The first calendar action-dispatch test failed because the appointment blocks used keyed action maps (`actions.open`) while the calendar helper only read array-style `actions`.
- I fixed this by adding `isActionRef(...)` and supporting both arrays and object maps in `actionList(...)`.

### What I learned
- The builder supports two useful action shapes:
  - `.actions(...)` emits an array,
  - `.action(slot, ...)` emits a keyed map.
- Render helpers should accept both when they are consuming generic `props.actions`.

### What was tricky to build
- The DOM contains both the desktop grid and mobile agenda; CSS decides which one is visible. The test asserts structural presence rather than viewport-specific visibility because jsdom does not apply media-query layout the way a browser does.
- The first click test selected the appointment by `data-admin-dsl-id="apt-1001"` to avoid ambiguity between grid and agenda text content.

### What warrants a second pair of eyes
- Review whether `calendar.tsx` should live under `web/src/admin-dsl/components/` once more components are extracted.
- Review whether action-map support should be centralized instead of duplicated between `render.tsx` and `calendar.tsx`.

### What should be done in the future
- Extract shared renderer helpers (`str`, `num`, `style`, `actionList`, `dispatch`) into a small internal utility module.
- Add visual tests or screenshot scripts for the mobile agenda.

### Code review instructions
- Start with `web/src/admin-dsl/calendar.tsx`.
- Then review the simplified `calendarWeek` case in `web/src/admin-dsl/render.tsx`.
- Then review new tests in `web/src/admin-dsl/AdminDsl.test.tsx`.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- New file:
  - `web/src/admin-dsl/calendar.tsx`
- Changed files:
  - `web/src/admin-dsl/render.tsx`
  - `web/src/admin-dsl/AdminDsl.test.tsx`

## Step 13: Add the repeatable mobile screenshot workflow

I added a tracked script for refreshing cropped mobile Admin DSL screenshots and documented the Storybook profile in the devctl README. The script uses the same `css-visual-diff compare` selector strategy from the manual visual review work: it targets `[data-admin-dsl-page]`, which captures only the rendered page region and avoids Storybook chrome.

I ran the script successfully against the devctl-managed Storybook instance, producing a fresh `mobile-admin-dsl-latest` artifact set for Services & Pricing, Dashboard, and Calendar.

### Prompt Context

**User prompt (verbatim):** (same as Step 11)

**Assistant interpretation:** Finish the planned documentation/script phase and keep the diary/changelog current.

**Inferred user intent:** The user wants this visual review workflow to be repeatable by future agents or humans, not just something done ad hoc once.

**Commit (code):** TBD — script/docs slice will be committed after task/changelog update.

### What I did
- Added executable script:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/scripts/01-capture-mobile-admin-dsl.sh`
- Script captures:
  - Services & Pricing,
  - Dashboard,
  - Calendar.
- Script defaults:
  - Storybook URL: `http://127.0.0.1:6006`
  - viewport: `390x844`
  - selector: `[data-admin-dsl-page]`
  - output: `various/mobile-admin-dsl-latest/`
- Updated `plugins/devctl/README.md` with:
  - `storybook` profile command,
  - Admin DSL story URLs,
  - screenshot refresh command.
- Ran the script successfully.

### Why
- The visual review artifacts are important enough to regenerate consistently.
- A script reduces mistakes around Storybook iframe URLs, selectors, viewport size, and output paths.

### What worked
- Script run succeeded and wrote fresh artifacts:
  - `.../various/mobile-admin-dsl-latest/services-pricing/url1_screenshot.png`
  - `.../various/mobile-admin-dsl-latest/dashboard/url1_screenshot.png`
  - `.../various/mobile-admin-dsl-latest/calendar/url1_screenshot.png`

### What didn't work
- N/A.

### What I learned
- Keeping the css-visual-diff command in a ticket script makes future visual QA much easier than embedding the command only in the diary.

### What was tricky to build
- The script path must be robust when launched from the repo root. It resolves the repo root relative to the script location and then runs from there.

### What warrants a second pair of eyes
- Review whether generated latest artifacts should be committed every time or only when useful for a review milestone.

### What should be done in the future
- Add a review-site manifest workflow if we want side-by-side before/after comparisons instead of same-URL captures.

### Code review instructions
- Review the script first, then run it with Storybook already started:
  - `./ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/scripts/01-capture-mobile-admin-dsl.sh`
- Review `plugins/devctl/README.md` for Storybook profile instructions.

### Technical details
- New script:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/scripts/01-capture-mobile-admin-dsl.sh`
- Updated doc:
  - `plugins/devctl/README.md`

## Step 14: Plan broad backend-admin layout story coverage

I added a new task batch for broad Admin DSL layout exploration. The key correction is that backend write schema is application-owned: the platform should provide a flexible admin DSL and generic config/state database access, while each application decides its own config schema and mutation semantics.

This phase therefore focuses on layout coverage rather than a single salon-specific write model. The stories should exercise reusable admin surfaces that many backend applications need: commerce/order management, course/content administration, CMS publishing, support inboxes, media libraries, analytics/operations, and team/settings pages. Each layout should be easy to inspect in desktop and mobile Storybook variants, and later easy to screenshot with Chromatic or css-visual-diff.

### Prompt Context

**User prompt (verbatim):** "that's up to the person building the application, they have a config db and can design any schema they want. make a whole set more storybook stories and pages to test out all potential different combinations of backend admin layouts that would be useful. Think beyond just simple intake applications and try to cover more complex application use cases.

Ad tasks to the ticket and then implement them. Also make stories that are desktop and mobile so that we can quickly browse through them and see the layotu (or take screenshots, for example in the future with a tool like chromatic)"

**Assistant interpretation:** Stop treating admin write semantics as something the platform must decide now; instead add broad Storybook coverage for many backend-admin layout patterns, with desktop/mobile variants for visual review.

**Inferred user intent:** The user wants the Admin DSL to be stress-tested as a general backend admin UI layout language, not just a salon intake companion.

**Commit (code):** TBD — planning will be committed after implementation/doc updates for this batch.

### What I did
- Added tasks for broad layout examples beyond salon intake.
- Added tasks for renderer coverage needed by those examples.
- Added tasks for desktop/mobile framed Storybook variants.
- Added validation/documentation task for the batch.

### Why
- A backend admin DSL needs to cover more than CRUD forms: master/detail, inboxes, review queues, settings, media grids, dashboards, analytics, publishing, team/admin controls, and operational states.
- Desktop/mobile story variants make layout review fast and prepare the project for future screenshot tools.

### What worked
- The existing Admin DSL primitives are already close to sufficient; we mainly need more examples and a few renderer cases for layout exploration nodes.

### What didn't work
- N/A.

### What I learned
- The platform contract should stay flexible: config DB schema and admin mutations belong to the application builder.

### What was tricky to build
- The scope could easily become an implementation of every domain. I scoped this as Storybook layout coverage with fixture data, not backend integration.

### What warrants a second pair of eyes
- Review whether the new examples are broad enough to pressure-test the DSL without becoming too domain-specific.

### What should be done in the future
- Add screenshot automation around these desktop/mobile variants once the layout catalog stabilizes.

### Code review instructions
- Review tasks 38-41 before the implementation commit.
- Then review the new layout example/story files and renderer node coverage.

### Technical details
- Task file:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/tasks.md`

## Step 15: Add broad Admin DSL layout catalog stories

I implemented a broader layout catalog for backend-admin applications beyond the original salon/intake scenario. The new examples are still fixture-driven Storybook pages, but they exercise more demanding combinations of admin layouts: high-volume resource queues, master/detail drawers, split-pane editors, CMS previews, support inboxes, media grids, operational dashboards, audit feeds, settings forms, confirmations, loading states, and error states.

The goal is to treat the Admin DSL as a general backend admin UI language. Application builders can design any schema they want in their config database; these stories are not prescribing backend writes. Instead, they pressure-test the frontend layout vocabulary and make desktop/mobile layout review fast.

### Prompt Context

**User prompt (verbatim):** (same as Step 14)

**Assistant interpretation:** Implement the broad layout story catalog, add renderer support for missing layout exploration nodes, and provide desktop/mobile Storybook variants.

**Inferred user intent:** The user wants enough Storybook coverage to evaluate the Admin DSL as a flexible backend admin UI system across many application types.

**Commit (code):** TBD — this layout catalog slice will be committed after task/changelog updates.

### What I did
- Added `web/src/admin-dsl/layoutExamples.ts` with seven broader admin pages:
  - Commerce Orders,
  - Course Builder,
  - CMS Publishing,
  - Support Inbox,
  - Media Library,
  - Analytics/Ops,
  - Team Settings.
- Added `web/src/admin-dsl/AdminDslLayouts.stories.tsx` with desktop, mobile, and matrix variants for each layout.
- Exported the layout examples from `web/src/admin-dsl/index.ts`.
- Extended `web/src/admin-dsl/builder.ts` with helpers for:
  - `activityFeed`,
  - `imageGrid`,
  - `loadingState`.
- Extended `web/src/admin-dsl/render.tsx` with renderer cases for:
  - `splitPane`,
  - `tabs`,
  - `searchBox`,
  - `activityFeed`,
  - `imageGrid`,
  - `loadingState`.
- Added `imageGrid` to `AdminNodeKind` in `web/src/admin-dsl/schema.ts`.
- Smoke-captured the Commerce Orders mobile story with `css-visual-diff` and reviewed the screenshot with the image tool.

### Why
- The previous stories proved salon/admin basics. The new layout catalog tests more general backend-admin patterns.
- Desktop/mobile paired stories make it easy to browse layouts manually and prepare for future screenshot tools such as Chromatic.

### What worked
- Storybook index now contains 22 `Admin DSL/Layout Catalog` stories.
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Full frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - `7 passed`, `29 passed`.
- The Commerce Orders mobile smoke screenshot had no blocker-level visual issues according to the image review tool.

### What didn't work
- Initial TypeScript validation failed because `imageGrid` was used by the builder/renderer but missing from `AdminNodeKind`.
- Fix: added `imageGrid` to `web/src/admin-dsl/schema.ts`.

### What I learned
- The DSL was already flexible enough for many layout combinations; the missing pieces were mostly renderer coverage for common admin display nodes.
- Fixed-width mobile frame stories are useful even before adding Chromatic because they make responsive layout review deterministic.

### What was tricky to build
- Some examples use dense real-world patterns such as queues, drawers, forms, feeds, and confirmations in one page. The renderer needed to stay generic rather than adding domain-specific components.
- The layout catalog has many stories, so the story naming needs to remain predictable: each page has Desktop, Mobile, and Matrix variants.

### What warrants a second pair of eyes
- Review whether these seven domains are the right breadth for the first catalog.
- Review whether the renderer cases should now move to extracted components instead of more inline JSX.
- Review the visual hierarchy of the new stories, especially labels and helper text contrast.

### What should be done in the future
- Add screenshot automation for all layout catalog mobile/desktop variants.
- Add tests for representative renderer cases like `splitPane`, `activityFeed`, and `imageGrid`.
- Consider extracting shared renderer helpers and presentation components before adding more story domains.

### Code review instructions
- Start with `web/src/admin-dsl/layoutExamples.ts` to understand the new backend-admin scenarios.
- Then inspect `web/src/admin-dsl/AdminDslLayouts.stories.tsx` for desktop/mobile/matrix story structure.
- Then review renderer additions in `web/src/admin-dsl/render.tsx` and schema/builder additions.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`

### Technical details
- New files:
  - `web/src/admin-dsl/layoutExamples.ts`
  - `web/src/admin-dsl/AdminDslLayouts.stories.tsx`
- Updated files:
  - `web/src/admin-dsl/schema.ts`
  - `web/src/admin-dsl/builder.ts`
  - `web/src/admin-dsl/render.tsx`
  - `web/src/admin-dsl/index.ts`
- Smoke artifact:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/layout-catalog-smoke/commerce-orders-mobile/url1_screenshot.png`

## Step 16: Review desktop/mobile layout catalog pairs and fix mobile density issues

I explicitly set viewport parameters on the layout-catalog desktop and mobile stories so Storybook does not keep a sticky iPhone viewport when switching to desktop variants. I then captured desktop/mobile pairs for all seven layout catalog pages and reviewed them with the image analysis tool in groups.

The review called out the most important mobile issues: oversized H1s, full-width row buttons causing excessive card height, redundant search label/placeholder text, side panels appearing too far below the selected list context, and a desktop Analytics metric that visually read as `98.7%o`. I addressed these in the renderer and examples, regenerated final captures, and re-ran image review for the mobile set plus desktop set.

### Prompt Context

**User prompt (verbatim):** "explicitly set the desktop / reset viewport on the desktop versions, because otherwise iphone stays sticky. Then go over desktop + mobile versions (in pairs) with the image analysis tool, and address issues (especially in mobile)"

**Assistant interpretation:** Fix Storybook viewport stickiness for desktop stories, visually review desktop/mobile layout catalog pairs, and implement the high-priority layout fixes.

**Inferred user intent:** The user wants the layout catalog to be reliable for browsing and screenshot automation, with mobile layouts especially cleaned up before committing.

**Commit (code):** TBD — this review/fix slice will be committed after changelog update.

### What I did
- Updated `web/src/admin-dsl/AdminDslLayouts.stories.tsx`:
  - desktop stories now set `desktop1440` viewport parameters/globals,
  - mobile stories set `iPhone14` viewport parameters/globals,
  - matrix stories reset to desktop parameters.
- Captured desktop/mobile screenshots for all layout catalog stories under:
  - `various/layout-catalog-pairs/`
- Reviewed pairs with the image analysis tool:
  - Commerce + Course,
  - CMS + Support,
  - Media + Analytics + Team.
- Implemented mobile fixes in `web/src/admin-dsl/render.tsx`:
  - reduced mobile H1 scale further,
  - added root `overflow-x: hidden`,
  - removed redundant visible `Search` label from search boxes,
  - made mobile resource-row actions compact grids instead of always full-width stacked buttons,
  - render side panels in a mobile side column directly below the header instead of only far below the main list,
  - kept desktop side panels in the right column and hidden on mobile.
- Updated `web/src/admin-dsl/layoutExamples.ts`:
  - changed the Analytics Jobs metric from `98.7%` to `98.7` with `% successful last 24h` as the caption, avoiding the display-font ambiguity the image tool read as `98.7%o`.
- Regenerated final desktop/mobile layout catalog screenshots under:
  - `various/layout-catalog-pairs-final/`
- Re-ran image analysis on all final mobile screenshots and all final desktop screenshots.

### Why
- Storybook viewport stickiness would make desktop/mobile variants unreliable for review and future screenshot tools.
- The layout catalog is only valuable if the desktop/mobile pairs are visibly distinct and stable.
- Mobile admin UIs need denser row/action layouts than intake pages; otherwise queues and settings pages become too tall to scan.

### What worked
- TypeScript validation passed:
  - `cd web && npx tsc --noEmit`
- Full frontend tests passed:
  - `cd web && pnpm test -- --runInBand`
  - `7 passed`, `29 passed`.
- Final mobile VLM review found no blocker-level issues.
- Final desktop VLM review found one issue in Analytics Ops; after the metric text change, direct image inspection showed it reads as `98.7` with a clear caption.

### What didn't work
- Initial desktop VLM review flagged Analytics Ops as visually reading `98.7%o`. This was likely display-font ambiguity around the percent sign, so I changed the example text instead of leaving a confusing demo artifact.

### What I learned
- Storybook story-level viewport globals are important when the global preview default is a mobile viewport.
- Mobile queue layouts should not blindly inherit full-width CTA behavior from modal/save flows. Row actions need a compact mode.
- Static open drawers/modals in screenshot stories are useful, but they should appear near the relevant page context on mobile rather than after a long main-content scroll.

### What was tricky to build
- The renderer now duplicates side panels into a mobile side column and a desktop side column, with CSS controlling visibility. This preserves desktop right-column layout while making mobile review pages more usable.
- The same action button component must serve modal footers and resource rows. I used CSS scoping under `.adminDslResourceRow` to make row actions compact without breaking save bars and modal actions.

### What warrants a second pair of eyes
- Review whether mobile side panels should eventually become true overlay/bottom sheets rather than static story-visible panels.
- Review whether story-level viewport `globals` are sufficient for Chromatic or whether explicit `chromatic.viewports` parameters should be added later.

### What should be done in the future
- Add screenshot automation for the full layout catalog, not just manual css-visual-diff captures.
- Add accessibility checks for search boxes now that the visible `Search` label was removed.
- Consider separate action-density variants for row actions, toolbar actions, and modal footer actions in the DSL contract.

### Code review instructions
- Review `web/src/admin-dsl/AdminDslLayouts.stories.tsx` for explicit viewport parameters.
- Review `web/src/admin-dsl/render.tsx` for mobile density and side-column behavior.
- Review `web/src/admin-dsl/layoutExamples.ts` for the Analytics metric text change.
- Validate with:
  - `cd web && npx tsc --noEmit`
  - `cd web && pnpm test -- --runInBand`
- Review screenshots in:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/various/layout-catalog-pairs-final/`

### Technical details
- Final mobile review result:
  - no blocker-level issues visible across all seven mobile layouts.
- Final desktop review result:
  - one Analytics Ops metric ambiguity was fixed and re-captured.

## Step 17: Write the Admin DSL evolution brainstorm/design guide

I wrote a second HAIR-039 design document focused on the next evolution of the Admin DSL. The document captures what we learned from building the one-stylist admin pages and the broader layout catalog, then proposes how to keep the DSL elegant and versatile without fitting it too tightly to one application or one visual design.

The key framing is that the DSL should evolve from a visual layout DSL into a semantic admin interaction DSL. Application builders still own their config database schemas and write semantics. The generic DSL should provide reusable semantics for actions, surfaces, resources, forms, layout policies, and adaptive desktop/mobile views.

### Prompt Context

**User prompt (verbatim):** "ok, create a new brainstorm / design document where we work on improving the dsl to keep this balance of elegant and versatile, so that one can build this kind of admin pages elegantly, yet also have the flexibility to cover a wide variety of use cases (vs fitting the dsl to a pecific design).

Create  a detailed analysis / design / implementation guide that is for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file references. It should be very clear and technical. Store in the ticket and the nupload to remarkable."

**Assistant interpretation:** Create a new HAIR-039 design document that analyzes the current Admin DSL after the layout catalog work and proposes a clear intern-facing evolution plan for richer but still flexible semantics.

**Inferred user intent:** The user wants the lessons from the implementation work captured as a durable design guide before the next round of DSL refactoring.

**Commit (code):** TBD — documentation will be committed after upload/changelog update.

### What I did
- Created design document:
  - `design-doc/02-admin-dsl-evolution-brainstorm-and-design-guide.md`
- Covered current state, strengths, weak points, design goals, proposed next-level concepts, package structure, implementation phases, testing strategy, risks, and intern checklist.
- Emphasized that application builders own backend config schemas and write semantics.
- Proposed future improvements:
  - richer action metadata,
  - surface subsystem,
  - formal but flexible resource pages,
  - form lifecycle semantics,
  - adaptive desktop/mobile views,
  - explicit layout policies,
  - renderer utility extraction.

### Why
- The DSL has enough real examples now to assess what is working and what is awkward.
- A design guide prevents the next refactor from becoming ad hoc.

### What worked
- The current layout catalog gave concrete evidence for the guide: row action density, overlay placement, mobile calendar adaptation, and split-pane collapse are all real issues observed in stories.

### What didn't work
- N/A for document creation.

### What I learned
- The next fundamental shift should be from visual nodes to semantic admin intent, while preserving JSON output and low-level escape hatches.

### What was tricky to build
- The document needed to avoid over-prescribing application data models. I kept the generic platform concerns separate from app-owned config DB schema and mutation semantics.

### What warrants a second pair of eyes
- Review whether `surface.*` and richer action metadata are the right first semantic layers to implement.
- Review whether `resource.page` should introduce `slots` or continue with `children` for now.

### What should be done in the future
- Implement Phase 1 from the guide: extract shared renderer/action utilities.
- Then add richer action metadata and surface builders incrementally.

### Code review instructions
- Read the new guide from top to bottom.
- Compare proposed changes to current files:
  - `web/src/admin-dsl/schema.ts`
  - `web/src/admin-dsl/builder.ts`
  - `web/src/admin-dsl/render.tsx`
  - `web/src/admin-dsl/calendar.tsx`
  - `web/src/admin-dsl/layoutExamples.ts`

### Technical details
- New document:
  - `ttmp/2026/05/15/HAIR-039--admin-design-system-and-dsl-for-one-stylist-salon-management/design-doc/02-admin-dsl-evolution-brainstorm-and-design-guide.md`

## Step 18: Upload and validate the Admin DSL evolution guide

I uploaded the new Admin DSL evolution guide to reMarkable and validated the document frontmatter. The upload succeeded directly without any manual authentication or listing steps.

### Prompt Context

**User prompt (verbatim):** (same as Step 17)

**Assistant interpretation:** Finish the requested guide by storing it in the ticket, validating it, uploading it to reMarkable, and recording the outcome.

**Inferred user intent:** The user wants the design guide available both in docmgr and as a readable PDF on the reMarkable.

**Commit (code):** TBD — documentation will be committed after final changelog update.

### What I did
- Validated frontmatter for:
  - `design-doc/02-admin-dsl-evolution-brainstorm-and-design-guide.md`
- Uploaded the guide with:
  - `remarquee upload bundle ... --name "HAIR 039 Admin DSL Evolution Guide" --remote-dir "/ai/2026/05/15/HAIR-039" --toc-depth 2 --non-interactive`
- Upload succeeded:
  - `OK: uploaded HAIR_039_Admin_DSL_Evolution_Guide.pdf -> /ai/2026/05/15/HAIR-039`

### Why
- The reMarkable copy makes it easier to review the design away from the code editor.
- Frontmatter validation keeps docmgr search/linking reliable.

### What worked
- reMarkable upload succeeded.
- Frontmatter validation passed.

### What didn't work
- N/A.

### What I learned
- The guide is large enough to benefit from `--toc-depth 2`; the table of contents should make the reMarkable version easier to navigate.

### What was tricky to build
- N/A for upload; the earlier design work was the substantive part.

### What warrants a second pair of eyes
- Review whether the guide should be re-uploaded after any major edits to action/surface/resource recommendations.

### What should be done in the future
- Use the guide as the starting point for the next implementation phase: renderer utility extraction, richer actions, and surface builders.

### Code review instructions
- Confirm the ticket source markdown and reMarkable upload refer to the same guide.

### Technical details
- reMarkable path:
  - `/ai/2026/05/15/HAIR-039/HAIR_039_Admin_DSL_Evolution_Guide.pdf`
