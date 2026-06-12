# Changelog

## 2026-06-12

- Initial workspace created


## 2026-06-12

Phase 1: Fix stale go.sum with go mod tidy (commit 2cdc317)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/go.sum — Added missing goja_nodejs/require and hashicorp/vault/api entries


## 2026-06-12

Phase 2: Switch golangci-lint to version-file pattern (commit dfa7a82)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/.github/workflows/lint.yml — version-file instead of hardcoded version
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/.golangci-lint-version — v2.12.2 to match go-template


## 2026-06-12

Phase 3: Replace gosec Docker action with go install (commit 70c67e3)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/.github/workflows/dependency-scanning.yml — gosec now installed via go install after setup-go


## 2026-06-12

Phase 4: Replace bump-glazed with generic bump-go-go-golems (commit 014ef70)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/Makefile — Auto-discovering bump-go-go-golems target


## 2026-06-12

Phase 5: Add glazed-lint targets and CI step (commit 63e3994)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/.github/workflows/lint.yml — Added make glazed-lint CI step
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/Makefile — Added glazed-lint-build


## 2026-06-12

Phase 6: Adopt logcopter (commits a1fba4c..2bc09f9)

### Related Files

- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/.github/workflows/push.yml — Added logcopter-check
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/Makefile — Added logcopter-generate and logcopter-check targets
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/go.mod — Added logcopter v0.1.1 + tool
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/logcopter_generate.go — Root generate entry point
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/*/logcopter.go — Generated area-scoped package loggers
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/appointments/postgres.go — Converted to logcopter
- /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/pkg/server/http.go — Converted to logcopter

