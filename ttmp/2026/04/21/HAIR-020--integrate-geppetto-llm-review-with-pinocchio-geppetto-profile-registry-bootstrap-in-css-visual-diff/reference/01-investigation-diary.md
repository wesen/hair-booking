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
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/ai/client.go
      Note: Inspected to confirm the current implementation is still stubbed
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/modes/ai_review.go
      Note: Inspected to confirm the intended Go seam for AI review already exists
    - Path: ../../../../../../../geppetto/pkg/doc/topics/10-runner.md
      Note: Inspected while evaluating the app-owned runner boundary
    - Path: ../../../../../../../pinocchio/cmd/pinocchio/cmds/js.go
      Note: Inspected as the closest existing proof of Geppetto runtime plus Pinocchio bootstrap composition
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
