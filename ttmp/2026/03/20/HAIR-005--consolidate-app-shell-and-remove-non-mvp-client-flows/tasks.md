# Tasks

## Analysis And Planning

- [ ] Confirm final public default route for MVP
- [ ] Confirm whether the MVP frontend is served by Go, by a separate host, or by both depending on environment
- [ ] Confirm whether any portal photos functionality remains visible in MVP or is hidden with rewards

## App Shell And Routing

- [ ] Replace query-param app selection in `web/src/main.tsx`
- [ ] Add a real route-based shell for booking, portal, and stylist sections
- [ ] Make the root route render a real public surface instead of the mock stylist app
- [ ] Add bookmarkable routes for booking, portal, and stylist areas
- [ ] Ensure refresh/deep-link behavior works in development and production hosting

## Auth Redirects

- [ ] Make post-login redirect configurable in `pkg/auth/oidc.go`
- [ ] Ensure client login lands on the portal route
- [ ] Ensure stylist login lands on the stylist route
- [ ] Ensure logout returns the browser to the intended public route
- [ ] Remove the current manual step of navigating back from the backend root after login

## Non-MVP Scope Cleanup

- [ ] Remove rewards tab and navigation entrypoints from production runtime
- [ ] Remove referral flows from production runtime
- [ ] Remove loyalty tiers and points from runtime-facing screens
- [ ] Remove deposit/payment sheet from booking runtime
- [ ] Remove any copy that implies real Stripe-backed payment processing
- [ ] Remove marketing preference UI if it remains visible

## Store And Runtime Cleanup

- [ ] Keep in-progress booking draft state local and explicit
- [ ] Stop using seeded domain data in production runtime pages
- [ ] Restrict local Redux to UI state and form draft state where appropriate
- [ ] Ensure canonical server-backed data comes from RTK Query in production views

## Backend Root Surface

- [ ] Replace or retire the legacy bootstrap page in `pkg/web/public/index.html`
- [ ] Align `/` behavior with the intended frontend app shell
- [ ] Ensure backend root no longer looks like an outdated prototype surface

## Validation

- [ ] Add route smoke checks for public, portal unauthenticated, portal authenticated, and stylist routes
- [ ] Add manual QA notes for login/logout/deep-link behavior
- [ ] Run frontend typecheck
- [ ] Run browser smoke after the new route shell is in place
