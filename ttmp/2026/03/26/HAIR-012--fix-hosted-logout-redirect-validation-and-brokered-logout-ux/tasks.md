# Tasks

## TODO

- [x] Create the HAIR-012 ticket workspace for the hosted logout and brokered login issues
- [x] Document the current hosted logout failure path from portal click to Keycloak invalid redirect rejection
- [x] Document the current brokered-login re-entry behavior after logout and identify the likely Keycloak/session causes
- [x] Write a detailed implementation guide that separates protocol mismatch, Keycloak browser-flow behavior, and frontend UX consequences
- [ ] Inspect the hosted Keycloak browser flow and confirm whether an Identity Provider Redirector or default IdP is configured
- [ ] Implement a logout flow that uses a plain allowlisted post_logout_redirect_uri and a server-controlled final redirect handoff
- [ ] Update hosted Keycloak and Terraform so logout redirect validation matches the final app behavior
- [ ] Ensure explicit sign-out returns the next login attempt to the full Keycloak chooser screen rather than silently re-entering through Google
- [ ] Add regression coverage for logout URL construction and the hosted logout callback round-trip
- [x] Upload the HAIR-012 analysis bundle to reMarkable
