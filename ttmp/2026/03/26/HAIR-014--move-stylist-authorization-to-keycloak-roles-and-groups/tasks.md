# Tasks

## Phase 1: Analysis

- [x] Create the HAIR-014 ticket workspace
- [x] Inspect the current session, OIDC callback, and stylist authorizer code
- [x] Confirm the current app uses env allowlists rather than Keycloak roles/groups
- [x] Confirm the current app session shape has no role/group fields
- [x] Confirm the app’s login callback is the right seam for role/group capture
- [x] Write the design and implementation guide
- [x] Write the investigation diary

## Phase 2: App Session Support

- [ ] Add role/group fields to `SessionClaims`
- [ ] Extend the OIDC ID token claim parsing to capture realm roles, client roles, and optional groups
- [ ] Persist the new role/group claims in the signed session cookie
- [ ] Add unit tests for role/group session round-tripping

## Phase 3: Authorization Migration

- [ ] Update `pkg/stylist/authorizer.go` to authorize by Keycloak role/group
- [ ] Keep temporary env allowlist fallback during migration
- [ ] Add unit tests for stylist allow/deny behavior under the new model

## Phase 4: Keycloak Configuration

- [ ] Create the Keycloak `stylist` role
- [ ] Create the Keycloak `/stylists` group
- [ ] Grant role `stylist` through the group
- [ ] Ensure the relevant role/group claims are present where the app reads them
- [ ] Document the exact hosted operator workflow

## Phase 5: Hosted Validation

- [ ] Validate a non-stylist user is denied `/stylist`
- [ ] Validate a stylist user is allowed into `/stylist`
- [ ] Validate removing a user from the stylist group removes access after re-login
- [ ] Remove or de-emphasize env allowlist usage once hosted validation is complete
