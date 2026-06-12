# Tasks

## TODO

- [x] Add tasks here

- [x] Phase 1 (Foundation): Create fringe-ui package at web/src/fringe-ui/ — tokens.css, tokens.ts, ThemeProvider, all 20+ primitive components, Storybook stories
- [x] Phase 2: Replace client booking intake flow (9 screens in ClientBookingApp.tsx) — wire to servicesApi + bookingApi
- [ ] Phase 4: Replace client portal (Home + Upcoming + History + Account) — wire to portalApi
- [ ] Phase 3: Replace stylist dashboard (Today + Clients pages) — wire to stylistApi.getDashboard() + getClients() + getClientDetail()
- [ ] Phase 5 (Polish): Dark variant, desktop responsive layouts, error/loading states, toast/error handling
- [ ] DEFERRED: Stylist messaging/inbox (St_Inbox + St_Thread) — no API endpoint exists, needs new backend endpoint
- [x] Clarify architecture ownership: stylist/ remains runtime+state layer, fringe-ui/ is the design system, fringe/ is the new page layer; document which runtime entries already render Fringe and which still do not
- [x] Cleanup pass 1: remove unused transitional Fringe*App wrapper files once zero imports are confirmed
- [x] Cleanup pass 2: remove dead legacy client-portal pages and portal chrome/components (PortalHome/Appointments/Photos/Rewards/Profile + PortalTopBar/PortalTabBar and supporting widgets) after zero-import verification
- [x] Cleanup pass 3: slim web/src/stylist/index.ts so it stops exporting dead legacy page/component surfaces and reflects the new Fringe-vs-runtime split
- [ ] Verify cleanup with rg import audit + pnpm typecheck; commit MSW worker/lockfile leftovers only if still required after cleanup
- [ ] Decision task: either migrate StylistRuntimeApp/StylistWorkspace to the Fringe stylist shell or explicitly keep it as a separate workspace path and stop treating StylistApp.tsx as the live runtime
- [x] Finish client portal data wiring: replace hardcoded upcoming/history placeholders in ClientPortalApp.tsx with portalApi-backed data or explicit temporary mocks
- [ ] Normalize stylist tab model: align uiSlice/types Tab keys with Fringe TabBar keys (Today/Clients/Inbox/You vs home/schedule/clients/loyalty/book)
- [x] Replace remaining active legacy support UI with Fringe equivalents: SignInPage, VerifyCodePage, CareGuidePage, ConsultNavBar, Toast, and any other non-StylistWorkspace runtime surfaces still imported from web/src/stylist/pages or web/src/stylist/components
