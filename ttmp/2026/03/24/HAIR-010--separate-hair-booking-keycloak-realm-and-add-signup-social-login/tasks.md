# Tasks

## Research And Product Decisions

- [x] Confirm the current hosted app still points at the shared `smailnail` realm
- [x] Confirm official Keycloak support for self-registration and identity brokering
- [x] Confirm official Keycloak support status for Google, Facebook, and Instagram providers
- [x] Confirm the shared Terraform repo already owns hosted Keycloak state for `smailnail` and `hair-booking`
- [x] Confirm hosted `hair-booking` Terraform currently manages only a browser client in the shared realm
- [x] Confirm local `hair-booking` Terraform already creates its own realm and browser client
- [x] Confirm there are currently no existing identity-provider Terraform resources in the shared repo
- [ ] Decide whether Instagram is actually required for MVP despite the deprecation warning

## Terraform Realm Migration Design

- [x] Add hosted `hair-booking` realm ownership to `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`
- [x] Add hosted `realm_display_name` and dedicated-realm variables to `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`
- [x] Remove the shared-realm-only ownership model from the hosted `hair-booking` workspace
- [x] Validate that the hosted plan creates a new `hair-booking` realm without destroying unrelated shared-realm resources
- [x] Document the hard pre-production cutover sequence in the implementation guide

## Realm Separation Execution

- [x] Create hosted realm `hair-booking`
- [x] Create dedicated hosted `hair-booking-web` client in the new realm
- [x] Configure hosted redirect URI for `https://hair-booking.app.scapegoat.dev/auth/callback`
- [x] Configure hosted web origin for `https://hair-booking.app.scapegoat.dev`
- [x] Update hosted app env to use the `hair-booking` realm issuer
- [x] Redeploy hosted app after the dedicated realm exists
- [x] Remove stale hosted docs and examples that still describe `hair-booking` as a shared-realm client

## Local Alignment

- [ ] Decide whether the Terraform sandbox realm should stay `hair-booking-dev-tf` or be renamed
- [ ] Keep the repo-local imported realm `hair-booking-dev` aligned with the documented local app flow
- [ ] Update local app defaults to use `hair-booking-dev` consistently in docs and examples
- [ ] Update local Keycloak realm import files if any realm settings change
- [ ] Document the difference between repo-local realm import and Terraform sandbox realm clearly for new operators

## Local Signup Flow

- [ ] Enable `User Registration`
- [ ] Enable `Forgot Password`
- [ ] Enable `Remember Me`
- [ ] Enable `Verify Email`
- [ ] Configure SMTP for outbound auth email
- [ ] Test new registration
- [ ] Test password reset
- [ ] Test verified-email login path

## Social Login

- [ ] Configure Google identity provider
- [ ] Test first broker login with Google
- [ ] Test repeat login with Google
- [ ] Configure Facebook identity provider
- [ ] Test first broker login with Facebook
- [ ] Test repeat login with Facebook
- [ ] Decide whether social providers will be codified in Terraform immediately or managed manually for a first rollout
- [ ] Decide whether to enable the `instagram-broker` feature
- [ ] If Instagram stays in scope, configure and test Instagram identity provider

## App Integration

- [ ] Update hosted deployment docs to reference the dedicated `hair-booking` realm
- [ ] Update any remaining hosted app docs that still reference the shared `smailnail` realm
- [ ] Update smoke tests for registration and social login

## Validation

- [x] Confirm Terraform plan/apply can be reviewed cleanly in `/home/manuel/code/wesen/terraform`
- [x] Confirm hosted `/auth/login` uses the new realm
- [ ] Confirm new local signup works end to end
- [ ] Confirm Google login works end to end
- [ ] Confirm Facebook login works end to end
- [ ] Confirm no duplicate local client records are created for the same human account
