# Changelog

## 2026-05-14

- Initial workspace created


## 2026-05-14

Created HAIR-037 implementation guide and diary for desktop step rail navigation plus real image upload/display. Mapped current display-only StepRail, fake PhotoTile upload toggles, existing backend upload intents/handler, and proposed action/upload contracts.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/14/HAIR-037--desktop-step-navigation-and-real-image-upload-for-goja-dsl-demo/analysis/01-desktop-navigation-and-image-upload-implementation-guide.md — Guide created
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/14/HAIR-037--desktop-step-navigation-and-real-image-upload-for-goja-dsl-demo/reference/01-diary.md — Diary Step 1 recorded


## 2026-05-14

Implemented desktop step rail navigation (Phase A+B) and real image upload pipeline (Phase C+D). 5 commits: e52fa03, ce57b79, 26e944d, 674a8db, 09d0eff. Verified with backend tests, browser walkthrough, and VLM analysis.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/flows/intake.flow.js — Added stepDefs
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/dslgoja/intake_flow_test.go — Tests for steps navigation and upload intents
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/molecules/DesktopStepRail/DesktopStepRail.tsx — Clickable step rail with buttons and onStepSelect
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/molecules/PhotoTile/PhotoTile.tsx — Real file input
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/organisms/DesktopShell/DesktopShell.tsx — stepItems + onStepSelect forwarding
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/BackendDslPage.tsx — Wired backendUpload in context
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/backendClient.ts — postDslUpload for multipart upload
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/render.tsx — Shell steps parsing
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/page-dsl/schema.ts — backendUpload in DslRenderContext

