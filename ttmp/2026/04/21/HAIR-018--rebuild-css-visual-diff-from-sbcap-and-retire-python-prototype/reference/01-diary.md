---
Title: Diary
Ticket: HAIR-018
Status: active
Topics:
    - tooling
    - browser-automation
    - chromedp
    - visual-regression
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../css-visual-diff/Makefile
      Note: Build defaults and lint scope polished in follow-up commit b667cfa
    - Path: ../../../../../../../css-visual-diff/README.md
      Note: Developer-facing usage updated for the rebuilt Go CLI and GOWORK=off workflow
    - Path: ../../../../../../../css-visual-diff/cmd/css-visual-diff/main.go
      Note: Imported and renamed sbcap CLI entrypoint (commit 774f01c
    - Path: ../../../../../../../css-visual-diff/go.mod
      Note: Dependency baseline pinned back to sbcap-compatible versions during validation (Step 3)
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff
      Note: Imported comparison engine baseline from sbcap (commit 774f01c)
    - Path: ../../../../../../../css-visual-diff/legacy/python-prototype
      Note: Archived Python prototype and generated artifacts preserved during the reset (commit 774f01c)
ExternalSources: []
Summary: Implementation diary for rebuilding css-visual-diff as a Go tool seeded from sbcap.
LastUpdated: 2026-04-21T19:02:20.854777294-04:00
WhatFor: Capture the implementation steps, failures, validation, and review instructions.
WhenToUse: Use while executing HAIR-018 or when reviewing how the repository was reset.
---


# Diary

## Goal

Capture the step-by-step execution of rebuilding `css-visual-diff` from a Python prototype into a clean Go CLI based on `sbcap`, including why each phase happened, what commands worked, what failed, and how to validate the resulting repository.

## Step 1: Create the ticket, write the short plan, and scope the migration

I started by creating a dedicated ticket for the repo rebuild instead of folding the work into HAIR-017. HAIR-017 established that `sbcap` is the right seed; HAIR-018 is the execution ticket that actually changes the `css-visual-diff` repository. I wrote a short implementation plan first so the repository reset would stay mechanical: archive the Python prototype, lay down the standard Go scaffold, copy `sbcap`, then rename and validate.

This step was intentionally lightweight but important. The repo reset touches almost every live file in `css-visual-diff`, so the plan and task list needed to exist before the first move. That also gave me a clean place to keep the diary and record the validation and commit hashes afterward.

### Prompt Context

**User prompt (verbatim):** "Create a short impltemenation plan document in the ticket, and then tasks, and then do it. Keep a diary as you work, commit at appropriate intervals."

**Assistant interpretation:** Create a new execution ticket for the `css-visual-diff` rebuild, write a concise plan, create actionable tasks, implement the migration, and maintain both a diary and sensible Git commit history while doing so.

**Inferred user intent:** Replace the current prototype-driven repository with a clean, reviewable Go baseline without losing the original work or the reasoning behind the migration.

### What I did
- Created ticket `HAIR-018`:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-018--rebuild-css-visual-diff-from-sbcap-and-retire-python-prototype/`
- Added docs:
  - `design-doc/01-short-implementation-plan.md`
  - `reference/01-diary.md`
- Added tasks covering:
  - inventory + archive of the Python prototype
  - template scaffold import
  - `sbcap` import + rename
  - cleanup + README/release plumbing
  - validation
  - diary/changelog/commit hygiene

### Why
- The work spans two repos (`css-visual-diff` and the hair-booking `ttmp` docs root), so I wanted an explicit execution ledger before touching the code.
- A short plan is enough here because the bigger architecture work already exists in HAIR-017.

### What worked
- `docmgr` created the ticket, docs, and tasks cleanly.
- The plan clarified that the safest implementation order is archive → scaffold → import → rename → validate.

### What didn't work
- N/A

### What I learned
- The repository reset is simpler if treated as a mechanical file migration rather than a redesign. The main complexity is not feature design; it is keeping the migration legible.

### What was tricky to build
- The tricky part here was choosing the right ticket boundary. HAIR-017 already had the research context, but continuing implementation there would have mixed design analysis and repo-rewrite work into one thread.

### What warrants a second pair of eyes
- The decision to keep the ticket under the existing `hair-booking/ttmp` docs root even though the code changes land in `css-visual-diff` is operationally convenient, but reviewers should be aware the docs and code live in different Git repos.

### What should be done in the future
- Keep the code and doc commits synchronized by recording commit hashes in later diary steps.

### Code review instructions
- Start with the plan doc:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-018--rebuild-css-visual-diff-from-sbcap-and-retire-python-prototype/design-doc/01-short-implementation-plan.md`
- Then inspect the task list:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-018--rebuild-css-visual-diff-from-sbcap-and-retire-python-prototype/tasks.md`

### Technical details
- Ticket command used:
  - `docmgr ticket create-ticket --ticket HAIR-018 --title "Rebuild css-visual-diff from sbcap and retire python prototype" --topics tooling,browser-automation,chromedp,visual-regression`

## Step 2: Archive the Python prototype, copy the template, and import sbcap as the new baseline

The biggest step was the repo reset itself. I moved the current Python prototype and its checked-in output artifacts into `legacy/python-prototype/`, then copied the standard Go project scaffold from `~/code/wesen/corporate-headquarters/go-template` into the repo root. After that I copied `cmd/sbcap` and `internal/sbcap` into the live repo, targeting `cmd/css-visual-diff` and `internal/cssvisualdiff`, and then renamed the module/import paths and user-facing strings to `css-visual-diff`.

The goal in this step was not elegance; it was a faithful baseline. I wanted the live repo to stop being the Python prototype immediately and instead become a Go repo with the actual `sbcap` engine in place. Cleanup and polish could come after that baseline existed and compiled.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Execute the actual repository migration after the ticket and plan are in place.

**Inferred user intent:** Make `css-visual-diff` a real Go project now, not just a documented future plan.

**Commit (code):** `774f01cfe5b7bad8816f00a3dc06ad08fdc0ff5c` — `Rebuild repo around sbcap Go baseline`

### What I did
- In `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff`:
  - created `legacy/python-prototype/`
  - moved the current prototype files and artifact directories under `legacy/python-prototype/`
- Copied Go scaffold files from:
  - `/home/manuel/code/wesen/corporate-headquarters/go-template`
- Copied `sbcap` source from:
  - `/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/cmd/sbcap`
  - `/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/internal/sbcap`
- Imported into:
  - `cmd/css-visual-diff/`
  - `internal/cssvisualdiff/`
- Renamed:
  - module path to `github.com/go-go-golems/css-visual-diff`
  - internal imports from `internal/sbcap` to `internal/cssvisualdiff`
  - CLI root command / help text / output-dir names from `sbcap` to `css-visual-diff`
- Replaced placeholder template docs with repo-specific `README.md` and `AGENT.md`
- Added Go release/lint/build plumbing from the template:
  - `.github/workflows/*`
  - `.golangci.yml`
  - `.goreleaser.yaml`
  - `Makefile`
  - `lefthook.yml`

### Why
- Moving the prototype into `legacy/` preserves the work without letting it define the active repo shape.
- Copying `sbcap` verbatim first is safer than partial reimplementation because it preserves a known-good code layout.
- Using the template gives the repo the expected go-go-golems CI/lint/release surface immediately.

### What worked
- Git recognized most of the prototype move as renames into `legacy/python-prototype/`, which keeps history reviewable.
- The imported `sbcap` code dropped into the new repo cleanly enough that the remaining work was mostly path and metadata cleanup.

### What didn't work
- The imported code did not build immediately once `go mod tidy` pulled the newest dependencies. The first failing error was:
  - `internal/cssvisualdiff/modes/matched_styles.go:247:24: assignment mismatch: 2 variables but css.GetComputedStyleForNode(nodeID).Do returns 3 values`
- That happened after:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go test ./...`

### What I learned
- The migration itself is straightforward; the real compatibility risk is dependency drift between the original `sbcap` repo and a fresh `go mod tidy` run in the new repo.

### What was tricky to build
- The tricky part was preserving the user’s requested “copy verbatim with `cp`, cleanup afterward” workflow while still renaming paths during import. The compromise was to copy the file contents directly into the final target directories (`cmd/css-visual-diff`, `internal/cssvisualdiff`) and then do mechanical text replacement for module paths and strings.

### What warrants a second pair of eyes
- Review the directory rename choice `internal/cssvisualdiff/`. It is intentionally minimal and stable, but someone may prefer further package splits later.

### What should be done in the future
- Keep the imported baseline close to upstream until product-level cleanup work is intentionally planned.

### Code review instructions
- Review these files first:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/legacy/python-prototype/`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/go.mod`
- Then inspect the commit:
  - `git show 774f01cfe5b7bad8816f00a3dc06ad08fdc0ff5c --stat`

### Technical details
- Key copy commands were based on:
  - `cp -a /home/manuel/code/wesen/corporate-headquarters/go-template/...`
  - `cp -a /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/internal/sbcap/. internal/cssvisualdiff/`
  - `cp -a /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/cmd/sbcap/. cmd/css-visual-diff/`

## Step 3: Pin sbcap-compatible dependencies, handle local workspace friction, and polish the build defaults

Once the baseline was imported, I switched from migration mechanics to validation. The first important fix was dependency versioning: a fresh `go mod tidy` had pulled newer `chromedp` and `glazed` versions than the original `sbcap` code expected, which caused the `matched_styles` build failure. I fixed that by pinning the dependency versions back to the same baseline used in the original `sbcap` module and re-running `go mod tidy`.

The second issue was local developer ergonomics inside the `hair-v2` workspace. Running `go run ./cmd/css-visual-diff` without disabling the outer `go.work` failed because `css-visual-diff` is a separate nested repo. Rather than introducing a repo-local `go.work`, I documented and validated the `GOWORK=off` workflow and then polished the Makefile so its default target and lint scope make sense for the imported `internal/` tree.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Finish the migration by making the new Go repo actually build and feel like a normal project, not just a copied directory tree.

**Inferred user intent:** End with a working, validated `css-visual-diff` repo that a developer can run immediately.

**Commit (code):** `b667cfa479fc1016a98d81e30b338987b531d008` — `Polish build defaults for css-visual-diff`

### What I did
- Pinned imported dependencies back to the `sbcap` baseline with:
  - `GOWORK=off go get github.com/chromedp/cdproto@v0.0.0-20250803210736-d308e07a266d github.com/chromedp/chromedp@v0.14.2 github.com/go-go-golems/glazed@v0.7.14 github.com/rs/zerolog@v1.34.0`
- Re-ran:
  - `GOWORK=off go mod tidy`
  - `GOWORK=off go test ./...`
  - `GOWORK=off go build ./cmd/css-visual-diff`
- Validated CLI help:
  - `GOWORK=off go run ./cmd/css-visual-diff --help`
  - `GOWORK=off go run ./cmd/css-visual-diff compare --help`
- Updated docs to show `GOWORK=off` commands in this nested workspace.
- Polished `Makefile`:
  - changed `all` to default to `build` instead of `gifs`
  - expanded `GOLANGCI_LINT_ARGS` to include `./internal/...`
- Validated the Makefile targets:
  - `GOWORK=off make test`
  - `GOWORK=off make build`

### Why
- Matching the original `sbcap` dependency set minimized API drift during the initial import.
- Documenting `GOWORK=off` is the least surprising way to work inside this nested-repo setup.
- The template Makefile needed one small correction because `css-visual-diff` puts real code under `internal/`, not only `cmd/` and `pkg/`.

### What worked
- After pinning dependencies, `go test ./...` passed.
- `go build ./cmd/css-visual-diff` passed.
- CLI help output showed the expected commands:
  - `run`
  - `compare`
  - `chromedp-probe`
- `make test` and `make build` passed after the Makefile polish.

### What didn't work
- Running without disabling the outer workspace failed exactly as follows:
  - `directory cmd/css-visual-diff is contained in a module that is not one of the workspace modules listed in go.work. You can add the module to the workspace using:`
  - `	go work use .`
- That came from:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && go run ./cmd/css-visual-diff --help`

### What I learned
- The original `sbcap` code is portable, but only if the dependency baseline comes with it.
- In a nested-repo workspace, `GOWORK=off` needs to be treated as part of the local developer contract unless the repo is intentionally added to the parent workspace.

### What was tricky to build
- The subtle issue here was distinguishing between real migration bugs and environment/tooling friction. The `matched_styles` compiler error was a real API drift problem. The `go run` workspace error was not a repo bug at all; it was a consequence of developing inside a parent workspace with a separate `go.work` file.

### What warrants a second pair of eyes
- Review whether committing with `go 1.26` in `go.mod` is the right long-term choice for the repo or whether we should later align it more strictly with a specific release target.
- Review whether a repo-local `go.work` would be preferable for developer ergonomics. I intentionally did not add one in this migration step.

### What should be done in the future
- The next product-level ticket should simplify the command surface, likely making `compare` the primary user-facing path and treating the YAML `run` flow as advanced.
- If this repo becomes a frequent local dependency in the parent workspace, revisit the `go.work` decision.

### Code review instructions
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go test ./...`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go build ./cmd/css-visual-diff`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go run ./cmd/css-visual-diff --help`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off make test`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off make build`
- Inspect the follow-up polish commit:
  - `git show b667cfa479fc1016a98d81e30b338987b531d008 --stat`

### Technical details
- Final validated module path:
  - `github.com/go-go-golems/css-visual-diff`
- Imported command path:
  - `./cmd/css-visual-diff`
- Imported engine path:
  - `./internal/cssvisualdiff`
