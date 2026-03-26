# Tasks

## TODO

- [x] Create the HAIR-012 ticket workspace for the hosted logout and brokered login issues
- [x] Document the current hosted logout failure path from portal click to Keycloak invalid redirect rejection
- [x] Document the current brokered-login re-entry behavior after logout and identify the likely Keycloak/session causes
- [x] Write a detailed implementation guide that separates protocol mismatch, Keycloak browser-flow behavior, and frontend UX consequences
- [ ] Inspect the hosted Keycloak browser flow and confirm whether an Identity Provider Redirector or default IdP is configured
- [x] Implement a logout flow that uses a plain allowlisted post_logout_redirect_uri and a server-controlled final redirect handoff
- [x] Update hosted runtime behavior so logout redirect validation matches the final app behavior and deploy that fix
- [x] Validate that explicit sign-out now returns the next login attempt to a usable chooser flow instead of trapping the user in the prior invalid-logout state
- [x] Add regression coverage for logout URL construction and the hosted logout callback round-trip
- [x] Fix the booking runtime so authenticated users no longer see a misleading guest `Sign in` affordance on `/booking`
- [x] Redirect authenticated non-stylist users from `/stylist` to `/portal` instead of rendering the broken stylist shell
- [x] Upload the HAIR-012 analysis bundle to reMarkable
