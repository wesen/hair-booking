# Changelog

## 2026-03-24

- Created ticket `HAIR-010` for moving `hair-booking` to its own Keycloak realm
- Added the main design guide for dedicated realm setup, signup, and social login
- Added the investigation diary documenting the move from repo docs into a ticket
- Added a granular task list for realm separation, signup, and social identity providers
- Added a second design guide focused specifically on the Terraform migration path in `/home/manuel/code/wesen/terraform`
- Expanded the task list to cover hosted realm ownership, direct cutover, and local naming alignment
- Updated the diary with the hosted Terraform findings and the recommendation to separate realm migration from social-provider rollout
- Updated the Terraform migration guide to use a hard pre-production cutover instead of a temporary overlap phase
- Simplified the task list and diary to match the direct cutover strategy
- Executed the hosted Terraform hard cutover and created the dedicated `hair-booking` realm in Keycloak
- Updated the live Coolify app env to point at `https://auth.scapegoat.dev/realms/hair-booking` and restarted the container
- Updated the app-repo and shared-infra deployment docs to describe the new dedicated realm ownership model
- Locked the remaining HAIR-010 product and operational decisions into the main auth guide
- Rewrote the HAIR-010 tasks into a phased execution plan covering local alignment, SES SMTP work, signup validation, Google, and Facebook
- Clarified the local `hair-booking-dev` versus `hair-booking-dev-tf` split in both the app repo and the shared Terraform repo
- Updated the app README production note so it describes the dedicated hosted `hair-booking` realm correctly
- Queried the live hosted realm settings through the Keycloak admin API and recorded the exact state
- Enabled `Remember Me` for hosted realm `hair-booking` through Terraform
- Left `Verify Email` intentionally disabled until the SES SMTP slice is ready

## 2026-03-25

- Added rerunnable HAIR-010 scripts for SES SMTP credential creation and hosted Keycloak SMTP configuration
- Revalidated the live SES identity `mail.scapegoat.dev` and the hosted Keycloak service layout before touching SMTP
- Created the dedicated IAM SMTP user `hair-booking-ses-smtp-prod` and wrote its derived SMTP credentials to a non-git operator env file
- Fixed the operator env file format after the first unquoted display-name value broke shell sourcing
- Configured the hosted `hair-booking` realm `smtpServer` to use SES SMTP
- Confirmed the realm now contains SMTP settings while `verifyEmail` remains intentionally off until the smoke-email path is fixed
- Fixed the Keycloak action-email smoke script so it no longer uses an invalid redirect URI
- Expanded the SES SMTP IAM policy to include the configuration-set ARN required by the hosted send path
- Verified hosted `VERIFY_EMAIL` and `UPDATE_PASSWORD` action emails return `204`
- Updated the shared Terraform realm module to ignore manual `smtp_server` drift
- Enabled hosted `verify_email` through Terraform without removing the manual SMTP configuration
- Completed a real hosted registration smoke and observed the verify-email browser gate for a new test user
- Completed a real hosted forgot-password initiation smoke and observed the reset-mail browser confirmation
- Identified a separate hosted app deployment blocker after successful auth: the live app had no database env, so `/api/me` could not build the client service
- Fixed the live Coolify app env by adding `HAIR_BOOKING_DATABASE_URL` and recreating the hosted container
- Revalidated hosted `/api/info` so the app now reports `databaseConfigured: true`
- Fixed the hosted Keycloak client logout flow by adding `/auth/logout/callback` as a valid post-logout redirect URI in Terraform
- Re-ran hosted logout and repeat-login smoke successfully against the dedicated `hair-booking` realm
- Confirmed hosted `/api/me` returns the authenticated client and notification preferences after verification
- Confirmed repeat login updates the existing `clients` row instead of creating a duplicate record
- Added a dedicated intern-facing postmortem covering the auth architecture, deployment boundaries, real rollout failures, and the resulting steady-state model
- Confirmed real mailbox verification completes successfully for hosted signup
- Confirmed real mailbox password reset completes successfully for hosted signup
- Added a permanent SES verification runbook in the app repo docs
- Read the Terraform-side SES and Vault handoff docs and translated them into concrete HAIR-010 Vault tasks
- Added a Vault AppRole reader helper for `kv/apps/hair-booking/prod/ses`
- Updated the hosted Keycloak SMTP sync helper so it can source secrets from Vault
- Switched the canonical SMTP sync workflow to Vault and demoted the local secret file to legacy fallback status
- Added a permanent Vault-backed Keycloak SMTP sync playbook in the app repo docs
- Completed the live Vault side in TF-010 by seeding `kv/apps/hair-booking/prod/ses` and minting the dedicated `hair-booking-prod` AppRole
- Fixed the app-side Vault reader so temporary output files under `/tmp` no longer fail on an invalid directory chmod
- Fixed the Keycloak SMTP smoke helper so it reuses existing probe users by email before attempting user creation
- Validated the hosted `SMTP_SOURCE=vault` replay successfully against the real `hair-booking-prod` AppRole and the SES simulator

## 2026-03-24

- Initial workspace created
