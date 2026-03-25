# Tasks

## Locked Decisions

- [x] Use a dedicated hosted Keycloak realm named `hair-booking`
- [x] Keep using the shared Keycloak server at `https://auth.scapegoat.dev`
- [x] Treat this as a hard pre-production cutover, not an overlap migration
- [x] Keep both local realm names for now:
  - `hair-booking-dev` for repo-local app development
  - `hair-booking-dev-tf` for Terraform sandbox work
- [x] Keep local email/password signup in MVP scope
- [x] Require verified email before calling signup complete
- [x] Use Amazon SES later for SMTP
- [x] Keep Google in MVP scope
- [x] Keep Facebook in MVP scope
- [x] Drop Instagram from the initial MVP plan
- [x] Do social-provider rollout manually in Keycloak first, not Terraform-first
- [x] Treat Keycloak subject as the canonical auth identity

## Phase 1: Hosted Realm Cutover

- [x] Add hosted `hair-booking` realm ownership to `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`
- [x] Add `realm_display_name` to `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`
- [x] Update hosted outputs so they resolve through `module.realm`
- [x] Update hosted example tfvars to use `hair-booking`
- [x] Run hosted `terraform init`
- [x] Run hosted `terraform validate`
- [x] Run hosted `terraform plan` with `TF_VAR_realm_name=hair-booking`
- [x] Confirm the plan creates realm `hair-booking`
- [x] Confirm the plan replaces only the `hair-booking-web` client and does not touch unrelated shared resources
- [x] Apply the hosted cutover
- [x] Confirm `https://auth.scapegoat.dev/realms/hair-booking/.well-known/openid-configuration` resolves

## Phase 2: Hosted Runtime Alignment

- [x] Inspect the live Coolify app env for `hair-booking`
- [x] Update `HAIR_BOOKING_OIDC_ISSUER_URL` on the Coolify host to `https://auth.scapegoat.dev/realms/hair-booking`
- [x] Recreate the Coolify application container after the env change
- [x] Confirm hosted `/api/info` reports the new issuer
- [x] Confirm hosted `/auth/login` redirects into realm `hair-booking`

## Phase 3: Documentation Alignment

- [x] Update app-repo deployment docs to reference the dedicated `hair-booking` realm
- [x] Update the Coolify playbook to validate the new issuer at runtime
- [x] Update shared Terraform repo docs so hosted `hair-booking` is described as an app-owned realm
- [x] Update the HAIR-010 implementation guide to reflect the executed hard cutover
- [x] Update the HAIR-010 diary with the exact commands and results
- [x] Update the HAIR-010 changelog
- [x] Re-upload the HAIR-010 bundle to reMarkable

## Phase 4: Local Alignment

- [x] Add a short explicit explanation in HAIR-010 and stable docs for why both `hair-booking-dev` and `hair-booking-dev-tf` exist
- [x] Review local scripts and examples for any accidental ambiguity between the two realms
- [x] Update local docs if any examples imply the Terraform sandbox realm is the default app-dev realm
- [ ] Decide later whether to collapse the two local realm names into one

## Phase 5: Realm Login Settings

- [ ] Confirm current realm `hair-booking` login settings in hosted Keycloak admin
- [ ] Enable `Remember Me`
- [ ] Enable `Verify Email`
- [ ] Confirm `User Registration` is enabled
- [ ] Confirm `Forgot Password` is enabled
- [ ] Record the exact hosted realm settings in the ticket diary
- [ ] Update the guide if the live settings differ from the documented defaults

## Phase 6: SMTP Preparation With SES

- [ ] Choose the sender domain and default sender address
- [ ] Verify the sender identity/domain in Amazon SES
- [ ] Create SES SMTP credentials outside git
- [ ] Store SES SMTP credentials in the operator secret system, not in the repo
- [ ] Configure Keycloak realm `hair-booking` email settings with SES
- [ ] Send a Keycloak test email successfully
- [ ] Document the final SMTP settings shape in HAIR-010 without exposing secrets

## Phase 7: Local Signup Validation

- [ ] Create a fresh local test account through Keycloak registration
- [ ] Confirm verify-email mail is sent
- [ ] Confirm email verification completes successfully
- [ ] Confirm password reset mail is sent
- [ ] Confirm password reset completes successfully
- [ ] Confirm the app login flow works after verification
- [ ] Confirm no duplicate local `clients` record is created for repeat login of the same Keycloak account

## Phase 8: Google Rollout

- [ ] Create the Google OAuth app/client
- [ ] Add the correct redirect URI and origin on the Google side
- [ ] Configure the Google identity provider in realm `hair-booking`
- [ ] Test first broker login with a brand new Google-backed user
- [ ] Test repeat login with the same Google-backed user
- [ ] Test login behavior when the Google email matches an existing local-password account
- [ ] Record any first-broker-login/account-linking behavior that needs product review

## Phase 9: Facebook Rollout

- [ ] Create the Meta app for Facebook login
- [ ] Add the correct redirect URI and origin on the Meta side
- [ ] Configure the Facebook identity provider in realm `hair-booking`
- [ ] Test first broker login with a brand new Facebook-backed user
- [ ] Test repeat login with the same Facebook-backed user
- [ ] Test login behavior when the Facebook email matches an existing local-password account
- [ ] Record any first-broker-login/account-linking behavior that needs product review

## Deferred Work

- [ ] Decide whether Google and Facebook provider setup should later be codified in Terraform
- [ ] Decide whether Instagram ever needs to be reconsidered
- [ ] Decide whether the local dual-realm naming should be collapsed in a cleanup ticket
