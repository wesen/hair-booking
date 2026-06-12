# Changelog

## 2026-04-21

- Initial workspace created


## 2026-04-21

Ticket created. Imported ~/Downloads/hair-booking.zip → sources/. Analyzed all 14 source files (design system, 9 intake screens, stylist dashboard, client portal). Audited existing API surface (7 RTK Query slices). Produced 39KB implementation guide: design-doc/01-analysis-implementation-guide-fringe-design-system-restyle.md

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-016--hair-booking-frontend-restyle-fringe-design-system/design-doc/01-analysis-implementation-guide-fringe-design-system-restyle.md — Main implementation guide
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-016--hair-booking-frontend-restyle-fringe-design-system/reference/01-investigation-diary.md — Diary


## 2026-04-21

Phase 2 complete: fringe/ page layer (20 files, 2246 lines) — 9 client-booking screens, 3 stylist screens, 2 client-portal screens. All wired to RTK Query hooks.

### Related Files

- web/src/fringe-ui/ — Fringe design system package
- web/src/fringe/pages/ — All new Fringe pages wired to RTK Query


## 2026-04-21

Phase 3 complete: ClientBookingApp, StylistApp, ClientPortalApp all mount Fringe pages. TypeScript zero errors.

### Related Files

- ClientPortalAppApp.tsx — Fringe pages wired


## 2026-04-21

Documented the current stylist/fringe split, removed dead legacy client-portal pages/components, and trimmed web/src/stylist/index.ts to the runtime/domain public surface. Verified pnpm typecheck still passes.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/main.tsx — Shows booking and portal already mount Fringe while stylist still goes through StylistRuntimeApp
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/components — Old portal widgets/chrome removed after import audit
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/index.ts — Removes dead legacy page/component exports from the barrel
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/pages — Old portal pages removed after import audit


## 2026-04-21

ClientPortalApp now pulls upcoming and past appointments from portalApi queries instead of hardcoded placeholder data; landing-page last-service summary is derived from the most recent past appointment.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/mock/handlers.ts — Existing MSW appointment fixtures back the new portal data wiring
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx — Replaced hardcoded upcoming/history placeholder data with portalApi queries


## 2026-04-21

Made Vite MSW toggleable via VITE_ENABLE_MSW while keeping Storybook always mocked; added dev:mock and dev:backend scripts for easier beta testing.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/package.json — Explicit scripts for mocked vs backend dev runs
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/main.tsx — Vite now only starts MSW when the env flag is set


## 2026-04-21

Adjusted session bootstrap so /portal accepts both authenticated auth-session payloads and newer domain profile payloads from /api/me, preventing false fallback to the old sign-in gate. Added a cleanup task for the remaining active legacy support UI.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/store/api/authApi.ts — Normalizes the current backend /api/me auth payload into a minimal client session
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/store/api/types.ts — Defines AuthSessionDto used by the compatibility shim


## 2026-04-21

Replaced the remaining active non-StylistWorkspace legacy support UI with Fringe surfaces: new shared auth gate, new Fringe care guide, booking header moved off ConsultNavBar, portal/stylist auth gates no longer use legacy pages, and the old Toast widget was removed. Verified typecheck and a focused stylist runtime test still pass.

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe/pages/client-booking/CareGuidePage.tsx — Fringe care-guide page replaces the old booking support page
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/fringe/pages/shared/AuthGatePage.tsx — Shared Fringe auth gate replaces legacy SignInPage across active runtime adapters
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientBookingApp.tsx — Booking runtime switched off legacy auth/support screens and nav
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/ClientPortalApp.tsx — Portal unauthenticated state now uses the shared Fringe auth gate
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistApp.tsx — Inline Fringe-styled toast replaces the deleted legacy Toast widget
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/web/src/stylist/StylistRuntimeApp.tsx — Stylist unauthenticated state now uses the shared Fringe auth gate

