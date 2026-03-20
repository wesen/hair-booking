# Changelog

## 2026-03-20

- Initial workspace created
- Added implementation guide for post-stylist runtime cleanup and React embedding
- Added granular task list for production embedding, runtime cleanup, and validation
- Recorded the roadmap decision that this work follows HAIR-006 and HAIR-007
- Added a reproducible frontend build-to-embed pipeline via `go generate ./pkg/web`
- Switched the embedded production shell from the legacy inspector to the built React app
- Added `/` redirect behavior to `/booking` in the Go server and React shell
- Updated the Docker build to compile the React app before the Go binary is built
- Added embedded-shell replay scripts and a hosted Coolify verification playbook
- Recorded that the current Coolify token reaches the server but lacks application API access
