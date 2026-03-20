# Changelog

## 2026-03-20

- Initial workspace created
- Added detailed implementation guide for app-shell cleanup and non-MVP scope removal
- Added granular task list for routing, auth redirect fixes, visible scope cleanup, and validation
- Clarified that non-MVP screens stay available in Storybook/design history but are removed from runtime navigation and app flow
- Added the first runtime shell slice: `/` now resolves to booking, top-level pathname routing exists, and legacy `?app=` links canonicalize to path routes
- Added `return_to`-based login/logout routing so OIDC can round-trip the browser back to the SPA instead of backend `/`
