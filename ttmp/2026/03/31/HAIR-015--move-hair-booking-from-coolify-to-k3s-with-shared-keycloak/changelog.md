# Changelog

## 2026-03-31

- Initial workspace created
- Added the primary migration guide in `design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md`
- Added `reference/01-investigation-diary.md` with the research trail, evidence sources, and delivery notes
- Expanded `tasks.md` from an empty placeholder into a phased implementation queue covering source-repo automation, shared Keycloak Terraform, K3s GitOps manifests, Vault data, smoke tests, and cutover
- `docmgr doctor --ticket HAIR-015 --stale-after 30` passed with all checks green
- Uploaded the bundle `HAIR-015 hair-booking K3s migration guide.pdf` to reMarkable path `/ai/2026/03/31/HAIR-015`
- Locked the migration inputs to `hair-booking.yolo.scapegoat.dev`, private GHCR, and K3s Keycloak cutover
- Updated the source-repo automation references to point at the shared `infra-tooling` GHCR publish template, image target metadata example, and GitOps PR helper
- Uploaded the updated bundle `HAIR-015 hair-booking K3s migration guide v2.pdf` to reMarkable path `/ai/2026/03/31/HAIR-015`
- Appended the diary with the locked rollout decisions and the shared `infra-tooling` extraction work
- Uploaded the refreshed bundle `HAIR-015 hair-booking K3s migration guide v3.pdf` to reMarkable path `/ai/2026/03/31/HAIR-015`
- Implemented the K3s migration across the source repo, shared Keycloak Terraform, and the Hetzner K3s GitOps repo
- Seeded the production Vault secrets, bootstrapped the Argo CD `Application`, and verified the app serves from `https://hair-booking.yolo.scapegoat.dev`
- Restored the Coolify PostgreSQL data into the K3s `hair_booking` database and repaired ownership/grants for the `hair_booking` runtime role
- Verified the Argo app is `Synced/Healthy`, `/healthz` returns `200`, `/api/info` reports the K3s Keycloak issuer, `/auth/login` redirects to the new realm, and the uploads PVC survives a pod restart via a sentinel-file check

## 2026-03-31

Added the detailed intern-facing analysis, design, and implementation guide for moving hair-booking from Coolify to the Hetzner K3s platform, plus the supporting investigation diary and phased execution queue.

### Related Files

- /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/design-doc/01-hair-booking-k3s-migration-analysis-design-and-implementation-guide.md — Primary migration guide
- /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/reference/01-investigation-diary.md — Chronological research trail
- /home/manuel/code/wesen/hair-booking/ttmp/2026/03/31/HAIR-015--move-hair-booking-from-coolify-to-k3s-with-shared-keycloak/tasks.md — Implementation queue for follow-on execution
