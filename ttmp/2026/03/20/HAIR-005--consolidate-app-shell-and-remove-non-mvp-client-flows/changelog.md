# Changelog

## 2026-03-20

- Initial workspace created
- Added detailed implementation guide for app-shell cleanup and non-MVP scope removal
- Added granular task list for routing, auth redirect fixes, visible scope cleanup, and validation
- Clarified that non-MVP screens stay available in Storybook/design history but are removed from runtime navigation and app flow
- Added the first runtime shell slice: `/` now resolves to booking, top-level pathname routing exists, and legacy `?app=` links canonicalize to path routes
- Added `return_to`-based login/logout routing so OIDC can round-trip the browser back to the SPA instead of backend `/`
- Hid rewards, loyalty, referral, and deposit/payment runtime surfaces while keeping the related components/pages available for Storybook defaults
- Reframed the backend root as a current session inspector instead of an outdated “future React frontend” bootstrap page
- Replaced the live `/stylist` runtime with a safe shell so production no longer exposes seeded stylist demo data
- Fixed login redirect persistence by encoding `return_to` into the OAuth `state` payload instead of relying on a proxy-fragile cookie
- Fixed logout return routing by redirecting Keycloak back to `/auth/logout/callback` on the backend before the final frontend redirect
- Removed the dead marketing preference row from the runtime portal profile
- Added a reusable route smoke script and a manual route/auth smoke playbook
- Added optional `HAIR_BOOKING_FRONTEND_DEV_PROXY_URL` support so the Go server can proxy the live Vite app and own `:8080` in local integration mode
- Verified `http://127.0.0.1:8080/` and deep links like `/portal` render the real React app in proxied-shell mode
