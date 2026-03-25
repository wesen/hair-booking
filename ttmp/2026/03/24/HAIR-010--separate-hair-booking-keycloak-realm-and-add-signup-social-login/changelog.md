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

## 2026-03-24

- Initial workspace created
