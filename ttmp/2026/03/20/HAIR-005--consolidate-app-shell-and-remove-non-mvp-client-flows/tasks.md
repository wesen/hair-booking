# Tasks

## Analysis And Planning

- [ ] Confirm final public default route for MVP
- [ ] Confirm whether the MVP frontend is served by Go, by a separate host, or by both depending on environment
- [ ] Confirm whether any portal photos functionality remains visible in MVP or is hidden with rewards

## App Shell And Routing

- [x] Replace query-param app selection in `web/src/main.tsx`
- [x] Add a first route-based shell for booking, portal, and stylist sections using pathname resolution
- [x] Make the root route render a real public surface instead of the mock stylist app
- [x] Add bookmarkable top-level routes for booking, portal, and stylist areas
- [ ] Ensure refresh/deep-link behavior works in development and production hosting

## Auth Redirects

- [x] Add request-driven post-login redirect support in `pkg/auth/oidc.go` via validated `return_to`
- [x] Ensure client login can land on the portal route
- [ ] Ensure stylist login lands on the stylist route once the stylist auth entrypoint is exposed in the runtime shell
- [x] Ensure logout can return the browser to the intended public route
- [x] Remove the current manual step of navigating back from the backend root after login

## Non-MVP Scope Cleanup

- [x] Remove rewards tab and navigation entrypoints from production runtime while keeping the underlying screens/components available to Storybook
- [x] Remove referral flows from production runtime while preserving Storybook/demo artifacts where useful
- [x] Remove loyalty tiers and points from runtime-facing screens while preserving Storybook/demo artifacts where useful
- [x] Remove deposit/payment sheet from booking runtime while preserving the component and stories for design reference
- [ ] Remove any copy that implies real Stripe-backed payment processing
- [x] Remove payment-methods runtime placeholder from the portal profile while preserving other profile actions
- [ ] Remove marketing preference UI if it remains visible

## Store And Runtime Cleanup

- [ ] Keep in-progress booking draft state local and explicit
- [ ] Stop using seeded domain data in production runtime pages
- [ ] Restrict local Redux to UI state and form draft state where appropriate
- [ ] Ensure canonical server-backed data comes from RTK Query in production views

## Backend Root Surface

- [x] Replace or retire the legacy bootstrap page language in `pkg/web/public/index.html`
- [ ] Align `/` behavior with the intended frontend app shell
- [x] Ensure backend root no longer looks like an outdated prototype surface

## Validation

- [ ] Add route smoke checks for public, portal unauthenticated, portal authenticated, and stylist routes
- [ ] Add manual QA notes for login/logout/deep-link behavior
- [ ] Run frontend typecheck
- [ ] Run browser smoke after the new route shell is in place
