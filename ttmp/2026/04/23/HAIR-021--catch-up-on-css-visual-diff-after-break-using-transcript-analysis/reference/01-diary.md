---
Title: Diary
Ticket: HAIR-021
Status: active
Topics:
    - tooling
    - browser-automation
    - visual-regression
    - go-minitrace
    - transcript-analysis
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: css-visual-diff/cmd/css-visual-diff/main.go
      Note: |-
        Main CLI entrypoint; now hosts script verbs and llm-review
        Main CLI entrypoint
    - Path: css-visual-diff/internal/cssvisualdiff/dsl/host.go
      Note: |-
        go-go-goja runtime host for JS script verbs
        go-go-goja runtime host
    - Path: css-visual-diff/internal/cssvisualdiff/llm/bootstrap.go
      Note: |-
        Pinocchio/Geppetto profile bootstrap for LLM settings
        Pinocchio profile bootstrap
    - Path: css-visual-diff/internal/cssvisualdiff/llm/image_question_client.go
      Note: Geppetto-backed ai.Client implementation for legacy ai-review mode
    - Path: css-visual-diff/internal/cssvisualdiff/llm/review.go
      Note: |-
        Geppetto-backed compare-review service
        Geppetto-backed review service
    - Path: css-visual-diff/internal/cssvisualdiff/modes/ai_review.go
      Note: Legacy ai-review mode now accepts an injected real AI client
    - Path: css-visual-diff/internal/cssvisualdiff/runner/runner.go
      Note: Runner passes injected AI client into ai-review
    - Path: hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/01-convert-pi-sessions.sh
      Note: |-
        Converts Pi JSONL sessions to minitrace archives
        Session conversion script
    - Path: hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/05-verify-geppetto-image-support-and-ai-review-wiring.sh
      Note: Verification script for Geppetto image support and css-visual-diff ai-review wiring
    - Path: hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/query-commands/hair-v2/bash-keyword-search.sql
      Note: |-
        SQL leaf for searching bash commands/output
        Bash keyword search SQL leaf
    - Path: hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/query-commands/hair-v2/file-touch-search.sql
      Note: |-
        SQL leaf for searching file touches
        File touch search SQL leaf
    - Path: hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/query-commands/hair-v2/session-inventory.sql
      Note: |-
        SQL leaf for session metadata overview
        Session inventory SQL leaf
    - Path: pinocchio/pkg/cmds/profilebootstrap/engine_settings.go
      Note: Updated for newer Geppetto ProfileRuntime bootstrap shape
    - Path: pinocchio/pkg/cmds/profilebootstrap/profile_selection.go
      Note: Compatibility selection struct and profile settings resolution
ExternalSources: []
Summary: Diary for catching up on css-visual-diff after a break using go-minitrace transcript analysis.
LastUpdated: 2026-04-23T18:10:00-04:00
WhatFor: Record the transcript-analysis steps, findings, and current status of css-visual-diff.
WhenToUse: Read when resuming css-visual-diff work after any break.
---



# Diary

## Goal

Use `go-minitrace` transcript analysis to efficiently catch up on the `css-visual-diff` project after a short break, understanding what was built, what tickets exist, what the current code status is, and what remains open.

## Step 1: Create the catch-up ticket and convert Pi sessions to minitrace

We created ticket `HAIR-021` to hold the catch-up work and keep a disciplined analysis diary. The first move was to convert the three Pi JSONL session files from this workspace into queryable minitrace archives. This follows the playbook from the Loupedeck investigation: convert only relevant sessions, then use SQL leaves to extract evidence rather than reading raw transcripts.

### Prompt Context

**User prompt (verbatim):** "Create a new docmgr ticket about us catching up on this project after a break. Use /home/manuel/code/wesen/obsidian-vault/Projects/2026/04/22/ARTICLE - Playbook - Efficient Past Transcript Analysis with go-minitrace.md to analyze past pi sessions in this workspace and see what the current status is of working on css-visual-diff. Keep a diary as you work, in the new ticket. Store all scripts you write in the scripts/ folder."

**Assistant interpretation:** Create a new docmgr ticket for post-break catch-up, use go-minitrace to analyze past Pi sessions in the hair-v2 workspace, determine the current status of css-visual-diff, and keep a running diary with all scripts stored in the ticket's scripts/ directory.

**Inferred user intent:** Avoid re-reading raw transcripts manually. Instead, use the proven minitrace analysis funnel to recover the project state efficiently and leave behind reusable commands for the next catch-up.

### What I did
- Created ticket `HAIR-021` with topics: tooling, browser-automation, visual-regression, go-minitrace, transcript-analysis.
- Wrote and ran `scripts/01-convert-pi-sessions.sh` to convert all three Pi JSONL files for this workspace.
- Discovered and converted:
  - `46f9ca87-f914-468b-8fc5-6fc4e99f10d1` — 1073 turns, 1412 tool calls (Apr 21, main work session)
  - `e8eb2960-ae37-4bad-9a57-6af6f852aa9c` — 23 turns, 43 tool calls (Apr 22, ticket review)
  - `1493fa82-d312-4d49-9f79-6510713cabf2` — 16 turns, 37 tool calls (Apr 23, current session)

### Why
- Raw JSONL is too large and noisy to read directly. The largest session is ~9.7 MB of JSONL.
- Minitrace conversion makes the session structured and queryable via DuckDB.
- Keeping the conversion script in the ticket makes the analysis reproducible.

### What worked
- `go-minitrace convert pi` handled all three sessions cleanly.
- The converted archives include full tool-call inputs/outputs, making bash and file searches possible.

### What didn't work
- N/A

### What I learned
- The main session (`46f9ca87`) is enormous compared to the others. Any analysis must weight it heavily.

### What was tricky to build
- N/A

### What warrants a second pair of eyes
- N/A

### What should be done in the future
- If more sessions accumulate, update the archive glob and rerun the inventory command.

### Code review instructions
- Validate conversion:
  - `bash /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/01-convert-pi-sessions.sh`
- Inspect archives:
  - `ls /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/analysis/pi-sessions/active/2026-04/`

### Technical details
- Session store path: `~/.pi/agent/sessions/--home-manuel-workspaces-2026-04-21-hair-v2--/`
- Output archives: `ttmp/2026/04/23/HAIR-021/.../analysis/pi-sessions/active/2026-04/*.minitrace.json`

## Step 2: Build the query-command repository and run session inventory

Following the playbook, the next step was to create a ticket-local query-command repository and write the two essential SQL leaves: session inventory and bash keyword search. The session inventory quickly showed that the Apr 21 session did almost all the heavy lifting, while the Apr 22 session was a focused ticket-review pass.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Build reusable query commands and use them to understand session scope and content.

**Inferred user intent:** Follow the three-layer funnel: inventory → targeted evidence → summarization.

### What I did
- Created `scripts/query-commands/hair-v2/` with:
  - `session-inventory.sql`
  - `bash-keyword-search.sql`
  - `file-touch-search.sql`
  - `analysis/session-summary.js`
- Wrote and ran `scripts/02-run-session-inventory.sh`.

### Why
- SQL leaves are the most efficient first filter. They narrow the search before any JS summarization.
- The playbook teaches that two SQL leaves (bash search + file touch search) are usually enough to reduce the problem.

### What worked
- Session inventory showed clear session boundaries:
  - `46f9ca87` started 2026-04-21T18:20:06Z, ended 2026-04-22T10:48:55Z
  - `e8eb2960` started 2026-04-22T04:30:09Z, ended 2026-04-22T04:34:47Z
  - `1493fa82` started 2026-04-23T18:06:43Z (current)

### What didn't work
- The first SQL draft used `turn_count` directly instead of `metrics->>'turn_count'` and `quality` which does not exist at the top level for pi-agent-jsonl-v3. Fixed by using `metrics->>'turn_count'` and removing `quality`.

### What I learned
- DuckDB schema discipline matters. Always verify the actual column paths against a sample row before writing queries.

### What was tricky to build
- The sqleton metadata block syntax for declaring CLI flags is simple but must be exact. A missing header means flags are not exposed.

### What warrants a second pair of eyes
- N/A

### What should be done in the future
- Add a commit-neighborhood command if we want to connect transcript evidence directly to git history.

### Code review instructions
- Validate the query repo:
  - `go-minitrace query commands --query-repository .../scripts/query-commands hair-v2 session-inventory --limit 10 --archive-glob ...`

### Technical details
- Archive glob used:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/analysis/pi-sessions/active/*/*.minitrace.json`

## Step 3: Run bash keyword searches and file touch searches

With the inventory done, the next layer was targeted evidence extraction. I ran bash keyword searches for terms like `css-visual-diff`, `geppetto`, `pinocchio`, `go-go-goja`, `llm-review`, `compare`, `test`, and `build`. I also ran file touch searches for `css-visual-diff`, `internal/cssvisualdiff`, `cmd/css-visual-diff`, `dsl`, `llm`, and `go.mod`. These searches surfaced the exact commits, commands, and files that shaped the current repository state.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Extract concrete evidence from the transcripts about what commands were run and what files were touched.

**Inferred user intent:** Recover the implementation timeline and current status without re-reading thousands of turns.

### What I did
- Wrote and ran `scripts/03-bash-searches.sh` for keywords:
  - `css-visual-diff`, `geppetto`, `pinocchio`, `go-go-goja`, `llm-review`, `compare`, `test`, `build`
- Wrote and ran `scripts/04-file-searches.sh` for patterns:
  - `css-visual-diff`, `internal/cssvisualdiff`, `cmd/css-visual-diff`, `dsl`, `llm`, `go.mod`

### Why
- Bash calls carry runtime logs, test results, git commands, and build output. They are the highest-signal tool calls.
- File touches reveal which implementation paths were actively changed.

### What worked
- The bash searches recovered exact commit hashes, test output, and build commands.
- The file searches showed the `go.mod` evolution as dependencies were added (go-go-goja, geppetto, pinocchio).

### What didn't work
- The file search script initially used `--file-pattern` instead of `--filePattern`. Fixed after checking the command help.

### What I learned
- The main session (`46f9ca87`) contains both hair-booking frontend restyling work AND css-visual-diff implementation work. The transcript title is misleading because it only captures the first user prompt.
- The `go.mod` was edited multiple times to add:
  1. `go-go-goja` and `dop251/goja` (for JS DSL)
  2. `geppetto` and `pinocchio` (for LLM review)

### What was tricky to build
- N/A

### What warrants a second pair of eyes
- N/A

### What should be done in the future
- The bash search results are stored as JSON in `various/03-bash-*.json` for programmatic re-analysis.

### Code review instructions
- Re-run searches:
  - `bash /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/03-bash-searches.sh`
  - `bash /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/04-file-searches.sh`

### Technical details
- Bash keyword search SQL uses `json_extract_string(...)` for safe JSON path access, per the playbook's DuckDB lesson.

## Step 4: Synthesize findings — current status of css-visual-diff

After analyzing the transcripts and reading the existing ticket diaries (HAIR-018, HAIR-019, HAIR-020), the current status of `css-visual-diff` is clear. The project went through three major implementation slices on Apr 21, and the repo is in a clean, working state with all tests passing.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Synthesize the extracted evidence into a human-readable project status summary.

**Inferred user intent:** Understand exactly where the project stands so the next work session can start from a known baseline.

### What I did
- Read the diaries from HAIR-018, HAIR-019, and HAIR-020.
- Cross-referenced git history in `css-visual-diff`.
- Synthesized the following status summary.

### Why
- Transcript analysis narrows the search, but source reading and ticket docs confirm the final state.

### What worked
- The existing tickets are well-documented. Each has a diary with commit hashes, validation commands, and design rationale.

### Current Status Summary

**Repository:** `css-visual-diff` at `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff`
**Branch:** `task/hair-v2`
**Working tree:** clean (nothing to commit)

#### Completed work (6 commits, Apr 21)

1. **`774f01c` — Rebuild repo around sbcap Go baseline** (HAIR-018)
   - Archived Python prototype to `legacy/python-prototype/`
   - Imported `sbcap` engine into `cmd/css-visual-diff/` and `internal/cssvisualdiff/`
   - Added standard Go project plumbing (CI, lint, release, Makefile)
   - Pinned dependencies to sbcap-compatible versions

2. **`b667cfa` — Polish build defaults for css-visual-diff** (HAIR-018)
   - Fixed Makefile defaults and lint scope
   - Documented `GOWORK=off` workflow for nested repo

3. **`da1a2b4` — Add go-go-goja-backed script verbs** (HAIR-019)
   - Added `go-go-goja` dependency
   - Created `internal/cssvisualdiff/dsl/` package with runtime host, registrar, embedded scripts
   - Added `script compare brief` and `script compare region` JS verbs
   - Extracted reusable compare-result generation
   - Added `services/agent_brief.go` helper
   - Updated root command with logging flags and `PersistentPreRunE`

4. **`b667bcd` — Add Pinocchio profile bootstrap for LLM settings** (HAIR-020)
   - Wired `css-visual-diff` to sibling `pinocchio` and `geppetto` repos via replace directives
   - Added `internal/cssvisualdiff/llm/bootstrap.go` using Pinocchio's profile resolution
   - Added tests with isolated HOME/XDG_CONFIG_HOME

5. **`c4d170c` — Add Geppetto-backed llm-review command** (HAIR-020)
   - Added `internal/cssvisualdiff/llm/review.go` service
   - Added `llm-review` CLI command with `--profile`, `--question`, etc.
   - Packages screenshots into multimodal user blocks
   - Writes JSON and markdown review outputs

6. **`9c0f08b` — Add llm-review inference settings debug output** (HAIR-020)
   - Added `--print-inference-settings` flag to `llm-review`
   - Verified parity with Pinocchio's resolved settings for `gpt-5-nano-low`
   - Confirmed both resolve to `openai-responses` / `gpt-5-nano`

#### What works now

- `GOWORK=off go test ./...` — passes
- `GOWORK=off go build ./cmd/css-visual-diff` — passes
- `css-visual-diff compare` — baseline visual comparison
- `css-visual-diff script compare brief` — JS-backed brief generation
- `css-visual-diff llm-review` — Geppetto-backed multimodal review
- `css-visual-diff llm-review --print-inference-settings` — settings inspection

#### Open concerns and follow-ups

1. **Image transport in openai-responses path**: Geppetto's `openai-responses` helper has a code comment indicating image/audio support is not fully implemented. The current `llm-review` success may be relying primarily on structured textual evidence rather than true image transport. This needs verification.
2. **More embedded script verbs**: HAIR-019 only landed `compare brief` and `compare region`. The design doc proposed additional namespaces (`page`, `llm`, `report`) that are not yet implemented.
3. **User-supplied script directories**: The current JS verb system only supports embedded defaults. Loading user scripts from directories is a future feature.
4. **Default profile for image-heavy review**: Need to decide whether `gpt-5-nano-low` remains the default or whether a profile with confirmed multimodal image transport should be chosen.
5. **Hair-booking frontend restyling**: The same large session also worked on hair-booking frontend changes. That work is documented in other tickets but may need reconciliation with css-visual-diff priorities.

### What didn't work
- N/A

### What I learned
- The three-ticket structure (HAIR-018 rebuild, HAIR-019 JS DSL, HAIR-020 LLM integration) is clean and continuation-friendly. Each ticket has its own diary, design docs, and validation artifacts.
- The transcript analysis saved significant time. Instead of reading 1073 turns, the SQL leaves extracted the key evidence in minutes.

### What was tricky to build
- The synthesis required cross-referencing transcripts, git history, and three existing ticket diaries. The transcripts alone would not have been enough; the existing docs are what make the catch-up efficient.

### What warrants a second pair of eyes
- The open concern about image transport in the openai-responses path should be verified by someone familiar with Geppetto's current implementation.

### What should be done in the future
- If the next work session focuses on css-visual-diff, the immediate priorities are:
  1. Verify/fix image transport for the openai-responses path (or switch default profile)
  2. Implement additional embedded script verbs from HAIR-019's design doc
  3. Add user-supplied script directory support
  4. Replace the `ai.NoopClient{}` stub in `modes/ai_review.go` with the new Geppetto-backed service

### Code review instructions
- Validate current state:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go test ./...`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go build ./cmd/css-visual-diff`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go run ./cmd/css-visual-diff --help`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go run ./cmd/css-visual-diff llm-review --print-inference-settings`

### Technical details
- Query commands repository:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/query-commands/`
- Bash search artifacts:
  - `various/03-bash-css-visual-diff.json`
  - `various/03-bash-geppetto.json`
  - `various/03-bash-pinocchio.json`
  - `various/03-bash-go-go-goja.json`
  - `various/03-bash-llm-review.json`
  - `various/03-bash-compare.json`
  - `various/03-bash-test.json`
  - `various/03-bash-build.json`
- File touch artifacts:
  - `various/04-files-css-visual-diff.json`
  - `various/04-files-internal.json`
  - `various/04-files-cmd.json`
  - `various/04-files-dsl.json`
  - `various/04-files-llm.json`
  - `various/04-files-gomod.json`

## Step 5: Verify Geppetto Responses image support and wire legacy `ai-review` to the real LLM image client

The user indicated that Geppetto should now have proper OpenAI Responses image support, so I resumed from the two highest-priority HAIR-021 follow-ups: verify image transport and remove the no-op behavior from the `run` command's legacy `ai-review` mode. The important outcome is that Geppetto's deterministic OpenAI Responses tests now confirm `turns.PayloadKeyImages` becomes `input_image` content, and `css-visual-diff run --modes ai-review` can now resolve Pinocchio/Geppetto profiles and pass a real Geppetto-backed image-question client into the mode runner.

This also exposed a compatibility break caused by the newer Geppetto bootstrap API: Pinocchio's `profilebootstrap` package still referenced older `ProfileSelection` fields and an older debug-output signature. I updated the Pinocchio adapter code and the css-visual-diff bootstrap wrapper to match Geppetto's newer `ProfileRuntime` / `ResolvedInferenceTrace` shape, then validated all affected packages.

### Prompt Context

**User prompt (verbatim):** "ok, we should have proper image support in geppetto now. continue working on these tasks."

**Assistant interpretation:** Continue HAIR-021 by validating the now-fixed Geppetto image path and using it to advance the css-visual-diff follow-up tasks.

**Inferred user intent:** Turn the earlier caveat about OpenAI Responses image support into concrete progress, then keep moving through the task list rather than stopping at analysis.

### What I did
- Verified Geppetto image support with:
  - `GOWORK=off go test ./pkg/steps/ai/openai_responses -run 'TestBuildInputItems.*Image|TestTokenCount.*Image|Image' -count=1`
- Added ticket script:
  - `scripts/05-verify-geppetto-image-support-and-ai-review-wiring.sh`
- Updated `css-visual-diff`:
  - `cmd/css-visual-diff/main.go`
    - added `run` command flags for `ai-review` profile resolution:
      - `--profile`
      - `--profile-registries`
      - `--profile-config-file`
    - resolves Pinocchio/Geppetto bootstrap only when `ai-review` is requested and not in dry-run mode
    - passes a real LLM image client through `runner.RunOptions`
  - `internal/cssvisualdiff/runner/runner.go`
    - added `RunOptions.AIClient`
    - calls `modes.RunAIReviewWithClient(...)` when a client is supplied
  - `internal/cssvisualdiff/modes/ai_review.go`
    - added `RunAIReviewWithClient(...)`
    - retained `RunAIReview(...)` as a no-op fallback for direct legacy callers
  - `internal/cssvisualdiff/llm/image_question_client.go`
    - new Geppetto-backed `ai.Client` implementation for single screenshot/question review
  - `internal/cssvisualdiff/llm/review.go`
    - exported `BuildImagePayload(...)` so both compare-review and legacy image-question review share the same image payload construction
  - `internal/cssvisualdiff/llm/bootstrap.go`
    - updated profile selection/debug output handling for the newer Geppetto bootstrap API
  - `cmd/css-visual-diff/main_test.go`
    - added coverage that `run` exposes the profile flags used by `ai-review`
- Updated `pinocchio/pkg/cmds/profilebootstrap` to match newer Geppetto bootstrap types:
  - use `ProfileRuntime` instead of removed `ProfileSelection` fields on `ResolvedCLIEngineSettings`
  - keep a compatibility `ResolvedCLIProfileSelection` struct with `Profile` and `ProfileRegistries` for callers that still inspect selection directly
  - update tests and one legacy `inference_settings.api_keys` fixture to the current `inference_settings.api` shape
- Checked off the HAIR-021 tasks for:
  - verifying image transport
  - replacing the run-command `ai-review` no-op path with a Geppetto-backed image client

### Why
- The previous catch-up identified image transport as the main caveat before trusting `gpt-5-nano-low` or other OpenAI Responses profiles for image-heavy visual review.
- The legacy YAML `run` path still had `ai.NoopClient{}` behind `ai-review`; wiring the real client makes the older mode useful again without replacing the newer `llm-review` command.
- The Pinocchio compatibility fix was required because `css-visual-diff` uses local `replace` directives to the sibling `pinocchio` and `geppetto` checkouts.

### What worked
- Geppetto's OpenAI Responses image serialization tests pass.
- Pinocchio profile bootstrap package tests pass.
- Full `css-visual-diff` tests pass.
- `css-visual-diff` builds successfully.
- `css-visual-diff run --help` now exposes `ai-review` profile flags.
- The verification script passes in deterministic mode and stores output logs in:
  - `various/05-geppetto-image-support-and-ai-review-wiring/`

### What didn't work
- I tried the optional live smoke with `RUN_LIVE=1 scripts/05-verify-geppetto-image-support-and-ai-review-wiring.sh`. It timed out after 360 seconds.
- The live run produced `url1_full.png` but no LLM output log, so the timeout appears to have happened before or during browser comparison/artifact generation rather than proving an LLM image-transport failure.
- Because deterministic Geppetto image serialization tests pass, I did not treat the live timeout as evidence against image support. It should be debugged separately if live validation is required.

### What I learned
- Geppetto's newer bootstrap API moved the resolved profile selection under `ResolvedCLIEngineSettings.ProfileRuntime.ProfileSettings`, and debug output now wants a `ResolvedInferenceTrace` wrapper.
- The safest way to revive the legacy `ai-review` mode is dependency injection: the mode can accept an `ai.Client`, while the CLI/runner owns profile bootstrap and engine construction.
- The Glazed `run` command already has a `config-file` command option, so the profile-specific config flag had to be named `--profile-config-file` to avoid a flag collision.

### What was tricky to build
- The biggest sharp edge was avoiding import cycles. The high-level `llm` package already imports `modes` for compare review, so `modes` cannot import `llm`. The fix was to keep `modes` depending only on the small `ai.Client` interface and let `runner.RunOptions` carry the concrete client in from the CLI layer.
- The second sharp edge was the sibling checkout coupling. `css-visual-diff` compiled against local `pinocchio` and `geppetto`, so fixing image support in Geppetto surfaced Pinocchio bootstrap API drift immediately.

### What warrants a second pair of eyes
- Review the new `llm.ImageQuestionClient` lifecycle. It builds an engine per image question, which is simple and safe, but repeated section reviews might benefit from engine reuse if latency becomes a problem.
- Review whether `RunAIReview(...)` should remain a no-op fallback for direct package callers or become an error that requires explicit client injection.

### What should be done in the future
- Debug the optional live `RUN_LIVE=1` timeout separately, ideally with a smaller browser fixture or more progress logging.
- Continue with the remaining HAIR-021 tasks:
  - additional embedded script verbs
  - user-supplied script directories
  - reconciliation with the hair-booking frontend restyling work

### Code review instructions
- Review these code paths first:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/cmd/css-visual-diff/main.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/llm/image_question_client.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/ai_review.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/runner/runner.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/pinocchio/pkg/cmds/profilebootstrap/engine_settings.go`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/pinocchio/pkg/cmds/profilebootstrap/profile_selection.go`
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/geppetto && GOWORK=off go test ./pkg/steps/ai/openai_responses -run 'TestBuildInputItems.*Image|TestTokenCount.*Image|Image' -count=1`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/pinocchio && GOWORK=off go test ./pkg/cmds/profilebootstrap -count=1`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go test ./...`
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff && GOWORK=off go build ./cmd/css-visual-diff`
  - `bash /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/HAIR-021--catch-up-on-css-visual-diff-after-break-using-transcript-analysis/scripts/05-verify-geppetto-image-support-and-ai-review-wiring.sh`

### Technical details
- Deterministic verification outputs:
  - `various/05-geppetto-image-support-and-ai-review-wiring/01-geppetto-openai-responses-image-tests.log`
  - `various/05-geppetto-image-support-and-ai-review-wiring/02-pinocchio-profilebootstrap-tests.log`
  - `various/05-geppetto-image-support-and-ai-review-wiring/03-css-visual-diff-tests.log`
  - `various/05-geppetto-image-support-and-ai-review-wiring/04-css-visual-diff-build.log`
  - `various/05-geppetto-image-support-and-ai-review-wiring/05-run-help-profile-flags.log`
