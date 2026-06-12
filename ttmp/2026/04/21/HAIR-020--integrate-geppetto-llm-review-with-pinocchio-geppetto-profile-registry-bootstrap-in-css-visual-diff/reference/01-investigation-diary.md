---
Title: HAIR-020 investigation diary
Ticket: HAIR-020
Status: active
Topics:
    - tooling
    - browser-automation
    - visual-regression
    - geppetto
    - pinocchio
    - inference
    - llm
DocType: reference
Intent: diary
Owners: []
RelatedFiles:
    - Path: ../../../../../../../css-visual-diff/cmd/css-visual-diff/main.go
      Note: llm-review now supports --print-inference-settings and early exit parity with Pinocchio
    - Path: ../../../../../../../css-visual-diff/cmd/css-visual-diff/main_test.go
      Note: Basic command-surface regression test for llm-review profile flags
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/ai/client.go
      Note: Inspected to confirm the current implementation is still stubbed
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/llm/bootstrap.go
      Note: Now exposes inference-settings debug output using the shared Geppetto bootstrap helper
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/llm/bootstrap_test.go
      Note: Focused profile-loading regression coverage added during Phase 1
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/llm/review_test.go
      Note: Focused prompt/image/extraction coverage added during Phase 2
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/modes/ai_review.go
      Note: Inspected to confirm the intended Go seam for AI review already exists
    - Path: ../../../../../../../geppetto/pkg/doc/topics/10-runner.md
      Note: Inspected while evaluating the app-owned runner boundary
    - Path: ../../../../../../../pinocchio/cmd/pinocchio/cmds/js.go
      Note: Inspected as the closest existing proof of Geppetto runtime plus Pinocchio bootstrap composition
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/scripts/02_compare_pinocchio_and_cssvd_inference_settings.sh
      Note: Script comparing Pinocchio and css-visual-diff resolved settings
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/scripts/03_live_gpt5_nano_low_llm_review_smoke.sh
      Note: Live gpt-5-nano-low smoke using saved ticket HTML fixtures
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/sources/01-llm-review-live-smoke/00-README.md
      Note: Managed fixture-note doc describing reusable left/right HTML test objects
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/various/01-profile-bootstrap-and-llm-review-help-smoke/output.log
      Note: Captured output from deterministic llm-review help smoke run
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/various/02-compare-pinocchio-and-cssvd-inference-settings/summary.txt
      Note: Summary comparison of resolved Pinocchio vs css-visual-diff settings
    - Path: ttmp/2026/04/21/HAIR-020--integrate-geppetto-llm-review-with-pinocchio-geppetto-profile-registry-bootstrap-in-css-visual-diff/various/03-live-gpt5-nano-low-llm-review-smoke/output.log
      Note: Captured live llm-review output using gpt-5-nano-low and ticket fixtures
ExternalSources: []
Summary: Chronological investigation notes for the Geppetto/Pinocchio profile-backed LLM integration analysis.
LastUpdated: 2026-04-21T23:18:00-04:00
WhatFor: Record what was inspected, why the recommendation changed, and how the implementation guide was derived.
WhenToUse: Read before continuing HAIR-020 implementation work.
---




# HAIR-020 investigation diary

## Step 1: Establish the actual requirement boundary

The immediate trigger for this ticket was the user's correction after the first LLM conversation.

The initial assumption would have been: "add an LLM client to css-visual-diff using Geppetto." That is not specific enough.

The user clarified that the implementation must also support **profile repository loading from the Pinocchio/Geppetto ecosystem**, because the tool needs the proper resolved inference settings rather than only a hardcoded model string or a tiny local `fromConfig(...)` call.

That clarification changed the scope from a simple provider integration to a configuration/bootstrap integration problem.

## Step 2: Inspect the current css-visual-diff LLM surface

I inspected the current Go repo and found three relevant pieces:

- `internal/cssvisualdiff/ai/client.go`
  - defines an interface but only ships a `NoopClient`
- `internal/cssvisualdiff/modes/ai_review.go`
  - contains a placeholder batch review path that reads `capture.json` and asks per-section questions
- `legacy/python-prototype/src/llm_analysis.py`
  - contains the old OpenAI Vision implementation using three images plus CSS/diff text context

Conclusion:

- there is already a product-level seam for AI review in the Go code
- the Go rewrite never completed the real implementation
- the old prototype is still useful as prompt-shape evidence, but not as the final architecture

## Step 3: Inspect Geppetto's current profile and inference model

I read the current Geppetto docs and examples, especially:

- `geppetto/README.md`
- `geppetto/pkg/doc/topics/01-profiles.md`
- `geppetto/pkg/doc/topics/06-inference-engines.md`
- `geppetto/pkg/doc/topics/10-runner.md`
- `geppetto/pkg/doc/playbooks/07-wire-provider-credentials-for-js-and-go-runner.md`
- `geppetto/pkg/sections/profile_sections.go`

The key findings were:

- Geppetto should own inference execution.
- Profiles are now engine-profile overlays that resolve model/inference settings.
- The host app still owns the baseline/default/config/operator side.
- A small-CLI pattern with public `--profile` and `--profile-registries` is explicitly supported.
- Geppetto already has canonical multimodal turn support through `turns.NewUserMultimodalBlock(...)`.

This was enough to rule out a direct-provider-only implementation.

## Step 4: Inspect Pinocchio's bootstrap path

Because the user mentioned Pinocchio/Geppetto profile repository loading specifically, I then inspected Pinocchio's current bootstrap and JS integration path:

- `pinocchio/pkg/doc/topics/pinocchio-profile-resolution-and-runtime-switching.md`
- `pinocchio/cmd/pinocchio/doc/general/05-js-runner-scripts.md`
- `pinocchio/examples/js/README.md`
- `pinocchio/pkg/cmds/profilebootstrap/engine_settings.go`
- `pinocchio/pkg/cmds/profilebootstrap/profile_selection.go`
- `pinocchio/cmd/pinocchio/cmds/js.go`

The important findings were:

- Pinocchio already implements the exact lifecycle the user cares about:
  - hidden base inference settings
  - profile selection
  - profile registry chain resolution
  - merge of base + profile overlay
  - final inference settings
- Pinocchio JS runtime bootstrap proves that a host can expose Geppetto while still using Pinocchio-owned config/profile logic.
- The helper functions are concrete and reusable enough that they should be referenced directly in the implementation guide rather than described abstractly.

## Step 5: Choose the recommendation

I considered three architectural directions:

1. direct provider SDK integration
2. raw Geppetto integration with local `fromConfig(...)`
3. Geppetto inference + Pinocchio-compatible profile bootstrap

I rejected the first two as the primary recommendation.

Reason:

- direct SDK calls would drift away from the shared model-selection workflow
- raw `fromConfig(...)` is too small a boundary if we care about proper profile-driven inference settings
- the user explicitly asked for profile repository loading support

So the guide recommends:

- Geppetto for inference execution
- Pinocchio-compatible profile/bootstrap resolution for final inference settings
- css-visual-diff for evidence gathering, prompt construction, and domain-specific output

## Step 6: Write the implementation guide and follow-up tasks

I wrote a new design/implementation guide covering:

- current state
- what is missing
- why the user clarification matters
- recommended architecture
- bootstrap path
- multimodal prompt path
- package/file layout
- test plan
- phased implementation sequence

I also updated the ticket task list so implementation can start from the recommended sequence rather than from another abstract design pass.

## Next implementation recommendation

If work continues immediately, the first code step should be:

1. add profile-selection/bootstrap support on the CLI
2. implement a Geppetto-backed AI client using resolved final inference settings
3. replace `ai.NoopClient{}` in `modes/ai_review.go`

That revives the oldest unfinished seam before expanding into script-backed LLM verbs.

## Step 7: Validate and publish the ticket bundle

After the guide and diary were written, I related the key code/doc files with `docmgr doc relate`, ran `docmgr doctor --ticket HAIR-020 --stale-after 30`, and uploaded the bundle to reMarkable.

The upload target is:

- `/ai/2026/04/21/HAIR-020`

Uploaded bundle name:

- `HAIR-020 Geppetto profile-backed LLM review integration`

This leaves the ticket in a handoff-ready analysis state before any code changes start.

## Step 8: Expand the ticket into a granular execution checklist and start Phase 1

The user asked for a much more granular task list and explicitly said we should reuse/load the Pinocchio profiles for simplicity. I updated `tasks.md` from a high-level sequence into a phased execution plan covering:

- bootstrap/profile-loading work first
- reusable compare-result LLM service second
- first user-facing command third
- legacy seam replacement and JS verb integration after that

I also made the local-reuse decision explicit in the tasks: the first implementation slice should wire `css-visual-diff` to the sibling Pinocchio/Geppetto code paths rather than inventing another profile-resolution lifecycle.

That means Phase 1 now starts with:

1. module wiring for sibling Pinocchio/Geppetto repos
2. a bootstrap helper that resolves final inference settings
3. tests proving profile selection changes the resolved model

This is the right order because it de-risks the most subtle integration point before any live provider calls are involved.

## Step 9: Land the Phase 1 bootstrap/profile-loading slice in css-visual-diff

I started Phase 1 by wiring `css-visual-diff` directly to the sibling Pinocchio/Geppetto repos so the tool can reuse the same bootstrap/profile-resolution path locally instead of re-implementing it.

### What I changed

In `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff` I:

- updated `go.mod` to:
  - require `github.com/go-go-golems/pinocchio`
  - add local replace directives for:
    - `github.com/go-go-golems/pinocchio => ../pinocchio`
    - `github.com/go-go-golems/geppetto => ../geppetto`
- added a new helper package file:
  - `internal/cssvisualdiff/llm/bootstrap.go`
- added a focused test:
  - `internal/cssvisualdiff/llm/bootstrap_test.go`

### Why this was the first implementation slice

This is the highest-leverage and lowest-risk first slice because it proves the configuration lifecycle before any live model call is attempted.

The helper now uses:

- `pinocchio/pkg/cmds/profilebootstrap.NewCLISelectionValues(...)`
- `pinocchio/pkg/cmds/profilebootstrap.ResolveCLIEngineSettings(...)`
- `pinocchio/pkg/cmds/profilebootstrap.NewEngineFromResolvedCLIEngineSettings(...)`

So `css-visual-diff` can now ask for:

- `config-file`
- `profile`
- `profile-registries`

and get back a resolved final inference-settings object using the same baseline-plus-profile-overlay lifecycle as Pinocchio.

### Validation commands run

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go mod tidy
GOWORK=off go test ./internal/cssvisualdiff/llm -count=1
GOWORK=off go build ./cmd/css-visual-diff
GOWORK=off go test ./...
```

### Results

- `go mod tidy` succeeded.
- The new bootstrap test passed.
- `go build ./cmd/css-visual-diff` passed.
- Full `go test ./...` passed.

### What was tricky

The main thing worth noting is that Pinocchio's bootstrap path naturally wants to consult config/env/defaults and can look at normal config locations. For the unit test I explicitly isolated `HOME` and `XDG_CONFIG_HOME` into a temporary directory so the test would not accidentally depend on any existing developer-machine Pinocchio config.

### What this unlocked

This slice gives the repo a stable place to build the next two implementation steps:

1. a Geppetto-backed compare-review service
2. a user-facing `llm-review` command that resolves models through Pinocchio profiles

## Step 10: Add the reusable compare-result review service and the first user-facing `llm-review` command

After the bootstrap slice was stable, I continued directly into the next two phases because the bootstrap helper was already the hard dependency for both of them.

### Code added in css-visual-diff

I added and updated the following code in `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff`:

- new reusable review service code:
  - `internal/cssvisualdiff/llm/review.go`
  - `internal/cssvisualdiff/llm/review_test.go`
- first command-surface test:
  - `cmd/css-visual-diff/main_test.go`
- updated root command wiring and a new user-facing command:
  - `cmd/css-visual-diff/main.go`

### What the new review service does

The new `llm` package now provides a Geppetto-backed compare-review path that:

1. takes a `modes.CompareResult`
2. builds a compact text summary of the structured evidence
3. packages the left/right/diff screenshots into Geppetto's multimodal user-block shape
4. builds an engine from the resolved final inference settings
5. runs inference through `engine.RunInferenceWithResult(...)`
6. extracts assistant text into a typed `ReviewResult`
7. can write JSON and markdown outputs

This is intentionally built as a reusable service, not only as command glue, so it can later be reused by:

- `ai-review` mode
- JS runtime host modules
- future batch/report commands

### What the new command does

I added:

- `css-visual-diff llm-review`

It reuses the existing compare-style inputs and adds:

- `--question`
- `--profile`
- `--profile-registries`
- `--config-file`
- `--write-review-json`
- `--write-review-markdown`

Execution flow:

```text
llm-review
  -> generate compare result
  -> write compare artifacts if requested
  -> resolve final inference settings via Pinocchio bootstrap
  -> run Geppetto multimodal inference
  -> print answer to stdout
  -> write llm-review.json / llm-review.md
```

### Deterministic validation done

I ran:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go test ./...
GOWORK=off go build ./cmd/css-visual-diff
GOWORK=off go run ./cmd/css-visual-diff llm-review --help
```

I also added a ticket-local smoke script:

- `scripts/01_profile_bootstrap_and_llm_review_help_smoke.sh`

and ran it, capturing the output to:

- `various/01-profile-bootstrap-and-llm-review-help-smoke/output.log`

### What worked

- The new `llm-review` command is now visible and wired.
- The command surface shows the expected profile/bootstrap flags.
- All tests still pass after the new command and service were added.
- The review path compiles cleanly against the sibling Pinocchio/Geppetto bootstrap.

### What was tricky

The main subtle design point here was choosing the right boundary for the first service API. I intentionally made the reusable review function accept a resolved bootstrap object plus a `CompareResult`, rather than forcing it to own command parsing itself. That keeps the service reusable by other surfaces later.

The second subtle point was image packaging. Geppetto/OpenAI can use URL-style image payloads, but Claude support in the Geppetto helpers is base64-content-based. So the first implementation uses `content` plus `media_type`, which works as a better cross-provider baseline.

## Step 11: Commit the first two code slices and refresh ticket hygiene

After the code stabilized, I committed the two `css-visual-diff` milestones separately:

- `b667bcddcfaa4f42894f8ebbc5a96b7dde5a7916` — `Add Pinocchio profile bootstrap for LLM settings`
- `c4d170c61ae2c2f6a9fb45c8832fbabdf0f7e256` — `Add Geppetto-backed llm-review command`

I then refreshed the ticket hygiene by:

- updating `tasks.md`
- updating `changelog.md`
- relating the new implementation files and smoke artifacts with `docmgr doc relate`
- rerunning `docmgr doctor --ticket HAIR-020 --stale-after 30`

The ticket remains clean after these updates.

## Step 12: Re-upload the refreshed HAIR-020 bundle

Because the ticket had moved from pure analysis into real implementation progress, I uploaded a refreshed HAIR-020 bundle to reMarkable under a new name rather than overwriting the original analysis-only bundle.

Uploaded file:

- `HAIR-020 Geppetto LLM integration implementation slice 01`

Verified folder:

- `/ai/2026/04/21/HAIR-020`

## Step 13: Save the live smoke HTML fixtures into the ticket sources folder

The user asked to keep the HTML test objects in the ticket so they can be reused easily. I copied the simple left/right `llm-review` smoke fixtures into:

- `sources/01-llm-review-live-smoke/left.html`
- `sources/01-llm-review-live-smoke/right.html`
- `sources/01-llm-review-live-smoke/README.md`

That gives the ticket a stable, self-contained fixture pair for future manual or scripted live LLM review checks.

## Step 14: Add `--print-inference-settings` parity to `css-visual-diff llm-review`

The user explicitly asked for parity with the Pinocchio workflow so that we can compare resolved settings without requiring a live call. I implemented that by adding `--print-inference-settings` to `css-visual-diff llm-review` and wiring it through the same Geppetto bootstrap debug helper Pinocchio uses.

### Code changes

In `css-visual-diff` I updated:

- `internal/cssvisualdiff/llm/bootstrap.go`
  - added `WriteInferenceSettingsDebug(...)`
- `cmd/css-visual-diff/main.go`
  - added `--print-inference-settings`
  - made `llm-review` resolve bootstrap first, then print settings and exit when requested
- `cmd/css-visual-diff/main_test.go`
  - asserted the new flag exists on the command surface

### Validation

I ran:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go test ./...
GOWORK=off go build ./cmd/css-visual-diff
GOWORK=off go run ./cmd/css-visual-diff llm-review --print-inference-settings --profile gpt-5-nano-low
GOWORK=off go run ./cmd/css-visual-diff llm-review --print-inference-settings
```

All passed.

## Step 15: Compare `css-visual-diff` against real Pinocchio profile resolution and run a live `gpt-5-nano-low` smoke

After adding the debug flag, I compared real outputs from Pinocchio and `css-visual-diff`.

### Comparison commands run

Pinocchio explicit profile:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/pinocchio
GOWORK=off go run ./cmd/pinocchio --profile gpt-5-nano-low code professional --print-inference-settings --non-interactive hello
```

Pinocchio default profile:

```bash
GOWORK=off go run ./cmd/pinocchio code professional --print-inference-settings --non-interactive hello
```

css-visual-diff explicit profile:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go run ./cmd/css-visual-diff llm-review --print-inference-settings --profile gpt-5-nano-low
```

css-visual-diff default profile:

```bash
GOWORK=off go run ./cmd/css-visual-diff llm-review --print-inference-settings
```

### What matched

For explicit `gpt-5-nano-low`, both resolved to:

- `chat.api_type: openai-responses`
- `chat.engine: gpt-5-nano`
- `chat.max_response_tokens: 128000`
- `inference.reasoning_effort: low`
- `inference.reasoning_summary: concise`

For the default profile, both resolved to:

- `chat.api_type: openai-responses`
- `chat.engine: gpt-5-nano`
- `chat.max_response_tokens: 20000`

That confirms `css-visual-diff` is now following the same profile/bootstrap path as Pinocchio for the tested fields.

### Live smoke with the saved fixtures

I also ran a real `llm-review` call using the new saved ticket fixtures under:

- `sources/01-llm-review-live-smoke/left.html`
- `sources/01-llm-review-live-smoke/right.html`

using the explicit profile:

- `gpt-5-nano-low`

The live command succeeded and produced a useful review answer. The ticket now includes reusable scripts and captured outputs for:

- profile/bootstrap comparison
- live `gpt-5-nano-low` review smoke

### Important caveat discovered while reviewing code

While `gpt-5-nano-low` clearly works for the current review command, Geppetto's current `openai-responses` helper still contains a code comment indicating image/audio support is not implemented in that path yet.

That means the current success is real, but the answer may be relying primarily on the structured textual evidence rather than true image transport for that engine path. This is important enough to keep as a follow-up task: verify whether we want to keep `gpt-5-nano-low` as the default review profile or whether we should either:

- extend the `openai-responses` image path, or
- choose a profile/engine path with known multimodal image transport for image-heavy review work.

## Step 16: Fix ticket hygiene around fixture docs and generated markdown, then commit the debug-output slice

After adding the new smoke artifacts, `docmgr doctor` failed for two reasons:

1. the fixture README in `sources/01-llm-review-live-smoke/` had no frontmatter and no numeric prefix
2. the live smoke had written generated `compare.md` and `llm-review.md` files under `various/.../out/`, which docmgr tried to treat as managed docs

I fixed that by:

- replacing `sources/.../README.md` with `sources/.../00-README.md` and adding proper frontmatter
- updating the live smoke script to disable markdown output generation:
  - `--write-markdown=false`
  - `--write-review-markdown=false`
- deleting the previously generated markdown artifacts
- rerunning the live smoke
- rerunning `docmgr doctor`

After that, the ticket returned to a clean state.

I also ran `gofmt` on the `css-visual-diff` files touched by the new `--print-inference-settings` path and committed that code slice as:

- `9c0f08bc3b20edae430481dd0bc926b79b0a2ca7` — `Add llm-review inference settings debug output`
