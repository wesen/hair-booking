# Changelog

## 2026-03-19

- Initial workspace created


## 2026-03-19

Completed full port of stylist-app.jsx to modular React+Redux+TypeScript. 31 components, 12 TS modules, 30 story files with 112 exported stories. Theming via data-part selectors and CSS variable tokens. Storybook configured for mobile viewports.


## 2026-03-19

Imported luxe-client-booking.jsx (~1224 lines). Client-facing consultation wizard with 9 screens, branching flow based on service type (extensions/color/both), photo upload, price estimation, calendar booking. Beginning port to existing modular architecture.

### Related Files

- /home/manuel/code/wesen/hair-booking/ttmp/2026/03/19/HAIR-001--port-hair-stylist-booking-app-to-modular-react-redux-typescript/sources/local/luxe-client-booking.jsx — Source client booking app


## 2026-03-19

Completed port of luxe-client-booking.jsx. Added ClientBookingApp root widget, 12 new components, 9 consultation pages, consultationSlice, 67 new stories (179 total). Extended CSS with 20 new sections and 54 data-part entries. Fixed react-docgen crash and RTK type inference issues.

### Related Files

- /home/manuel/code/wesen/hair-booking/web/src/stylist/ClientBookingApp.tsx — Client-facing consultation booking root widget
- /home/manuel/code/wesen/hair-booking/web/src/stylist/data/consultation-constants.ts — Consultation data constants
- /home/manuel/code/wesen/hair-booking/web/src/stylist/store/consultationSlice.ts — Redux slice for consultation wizard state


## 2026-03-19

Signup funnel audit: identified 5 missing screens/modals. Building SignInScreen, VerifyCodeScreen, DepositPaymentSheet, CareGuidePage, plus wiring confirm screen deeplinks.


## 2026-03-19

Signup funnel audit complete. Built SignInPage, VerifyCodePage (OTP with auto-advance + countdown), DepositPaymentSheet (card form modal), CareGuidePage (5 care sections), PhotoPickerSheet. Wired confirm deeplinks (Google Calendar, Maps). New authSlice (18 actions). 197 total stories across 59 files.

### Related Files

- /home/manuel/code/wesen/hair-booking/web/src/stylist/components/DepositPaymentSheet.tsx — Payment modal
- /home/manuel/code/wesen/hair-booking/web/src/stylist/pages/CareGuidePage.tsx — Extension care guide content
- /home/manuel/code/wesen/hair-booking/web/src/stylist/pages/SignInPage.tsx — Passwordless sign-in screen
- /home/manuel/code/wesen/hair-booking/web/src/stylist/pages/VerifyCodePage.tsx — OTP verification screen
- /home/manuel/code/wesen/hair-booking/web/src/stylist/store/authSlice.ts — Auth + payment Redux slice


## 2026-03-19

Starting logged-in client portal: 5 screens (Home, Appointments, Photos, Rewards, Profile) with tab bar navigation. Separate ClientPortalApp root widget, portalSlice for state, new mock data.


## 2026-03-19

Built full logged-in client portal: ClientPortalApp with 5 tab screens (Home, Appointments, Photos, Rewards, Profile). 13 new components, portalSlice, mock data for Mia Kovacs. 233 total stories. Three independent root widgets now share one design system.

### Related Files

- /home/manuel/code/wesen/hair-booking/web/src/stylist/ClientPortalApp.tsx — Logged-in client portal root widget
- /home/manuel/code/wesen/hair-booking/web/src/stylist/data/portal-data.ts — Mock user data for portal
- /home/manuel/code/wesen/hair-booking/web/src/stylist/store/portalSlice.ts — Portal Redux slice

