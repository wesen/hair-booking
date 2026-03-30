# Tasks

## Analysis And Planning

- [x] Confirm final public default route for MVP is the booking landing on `/`
- [x] Confirm local MVP frontend hosting is environment-dependent: direct Vite or Go proxied to Vite in development
- [x] Confirm production hosting direction is to embed the built React app in Go
- [x] Move portal/client photos into a dedicated MVP follow-up ticket instead of leaving them inside HAIR-005

## App Shell And Routing

- [x] Replace query-param app selection in `web/src/main.tsx`
- [x] Add a first route-based shell for booking, portal, and stylist sections using pathname resolution
- [x] Make the root route render a real public surface instead of the mock stylist app
- [x] Add bookmarkable top-level routes for booking, portal, and stylist areas
- [x] Replace the seeded runtime `/stylist` dashboard with a safe shell until real stylist operations land
- [x] Ensure refresh/deep-link behavior works in local proxied development hosting
- [ ] Ensure refresh/deep-link behavior works in production embedded-React hosting

## Auth Redirects

- [x] Add request-driven post-login redirect support in `pkg/auth/oidc.go` via validated `return_to`
- [x] Ensure client login can land on the portal route
- [x] Ensure stylist login lands on the stylist route once the stylist auth entrypoint is exposed in the runtime shell
- [x] Ensure logout can return the browser to the intended public route
- [x] Remove the current manual step of navigating back from the backend root after login

## Non-MVP Scope Cleanup

- [x] Remove rewards tab and navigation entrypoints from production runtime while keeping the underlying screens/components available to Storybook
- [x] Remove referral flows from production runtime while preserving Storybook/demo artifacts where useful
- [x] Remove loyalty tiers and points from runtime-facing screens while preserving Storybook/demo artifacts where useful
- [x] Remove deposit/payment sheet from booking runtime while preserving the component and stories for design reference
- [ ] Remove any copy that implies real Stripe-backed payment processing
- [x] Remove payment-methods runtime placeholder from the portal profile while preserving other profile actions
- [x] Remove marketing preference UI if it remains visible

## Store And Runtime Cleanup

- [ ] Defer broader store/runtime cleanup into the post-HAIR-006/007 cleanup ticket

## Backend Root Surface

- [x] Replace or retire the legacy bootstrap page language in `pkg/web/public/index.html`
- [x] Align `/` behavior with the intended frontend app shell in proxied local development mode
- [ ] Align `/` behavior with the intended frontend app shell in production embedded-React hosting
- [x] Ensure backend root no longer looks like an outdated prototype surface

## Validation

- [x] Add route smoke checks for public, portal unauthenticated, portal authenticated, and stylist routes
- [x] Add manual QA notes for login/logout/deep-link behavior
- [x] Run frontend typecheck
- [x] Run browser smoke after the new route shell is in place
