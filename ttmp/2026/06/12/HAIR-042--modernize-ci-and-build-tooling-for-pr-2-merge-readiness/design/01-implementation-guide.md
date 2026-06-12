---
title: HAIR-042 Implementation Guide
doc_type: design
topics: [ci, golangci-lint, logcopter, glazed-lint, go-template]
---

# HAIR-042 Implementation Guide

## Context

PR #2 (`task/hair-v2` → `main`, 349 commits) has 4 failing CI jobs, all caused by
tooling/infrastructure issues rather than logic bugs. Meanwhile, the go-template
repository and infra-tooling playbooks define current go-go-golems practices that
hair-booking hasn't adopted yet. This guide covers both fixes and modernization.

## Reference documents

- `~/code/wesen/go-go-golems/infra-tooling/docs/go-go-golems/glazed-linting-rollout-playbook.md`
- `~/code/wesen/go-go-golems/infra-tooling/docs/go-go-golems/package-publishing-release-train.md`
- `~/code/wesen/go-go-golems/infra-tooling/docs/go-go-golems/playbooks/logcopter-package-rollout-playbook.md`
- `~/code/wesen/go-go-golems/go-template/` (reference repository)

## Phases

### Phase 1: Fix stale go.sum (fixes test, govulncheck, gosec, publish-image)

**Problem:** `go.sum` is missing entries for `goja_nodejs/require` and
`hashicorp/vault/api`. This causes `go test ./...`, `govulncheck ./...`,
and `gosec ./...` to all fail with setup errors.

**Steps:**
1. Run `go mod tidy` to pull in missing entries.
2. Verify: `GOWORK=off go test ./...` passes locally.
3. Commit `go.mod go.sum`.

### Phase 2: Fix golangci-lint Go version mismatch (fixes lint job)

**Problem:** `lint.yml` pins `version: v2.4.0` which was built with Go 1.25.
The project uses `go 1.26.1`, so golangci-lint refuses to load the config.

**Steps:**
1. Create `.golangci-lint-version` with `v2.12.2` (matches go-template).
2. Update `lint.yml` to use `version-file: .golangci-lint-version` instead of `version: v2.4.0`.
3. Verify: `golangci-lint run --timeout=5m` works locally.
4. Commit both files.

### Phase 3: Fix gosec Docker action Go mismatch (fixes gosec job)

**Problem:** `securego/gosec@master` runs in a Docker container with its own Go
version, which may be older than what `actions/setup-go` installs. This causes
type errors when gosec can't resolve `goja_nodejs/require` or other packages.

**Steps:**
1. Replace `uses: securego/gosec@master` with `go install` after `setup-go`.
2. Run `gosec` as a binary step instead of Docker action.
3. Commit the workflow change.

### Phase 4: Replace bump-glazed with bump-go-go-golems

**Problem:** The Makefile has a hand-maintained `bump-glazed` target that lists
specific packages. This goes stale as dependencies change.

**Steps:**
1. Add the generic `bump-go-go-golems` target that auto-discovers
   `github.com/go-go-golems/...` deps from `go.mod`.
2. Keep `bump-glazed` as a compatibility alias.
3. Commit Makefile change.

### Phase 5: Add glazed-lint targets and CI step

**Problem:** No Glazed CLI policy linting is configured, despite the repo
depending on glazed and having CLI commands that should follow conventions.

**Steps:**
1. Add `glazed-lint-build` and `glazed-lint` Makefile targets per the
   glazed-linting-rollout-playbook.
2. Wire `glazed-lint-build` into the existing `lint` and `lintmax` targets.
3. Add a `make glazed-lint` step to `lint.yml` CI workflow.
4. Handle any violations (fix or add allow-paths).
5. Commit Makefile + workflow changes.

### Phase 6: Adopt logcopter

**Problem:** No logcopter adoption — packages use `github.com/rs/zerolog/log`
directly for package diagnostics instead of generated area-scoped loggers.

**Steps:**
1. `go get github.com/go-go-golems/logcopter@latest`
2. `go get -tool github.com/go-go-golems/logcopter/cmd/logcopter-gen@latest`
3. Create `logcopter_generate.go` at repo root.
4. Add `logcopter-generate` and `logcopter-check` Makefile targets.
5. Convert packages that import `github.com/rs/zerolog/log` for diagnostics.
6. Add `make logcopter-check` to CI push.yml before `go generate` / `go test`.
7. Commit in layers: dependency → generated files → conversions → CI.

## Validation after each phase

After every commit:
```bash
GOWORK=off go test ./...
GOWORK=off golangci-lint run --timeout=5m
```

After all phases:
```bash
make lint
make test
make glazed-lint
make logcopter-check
```
