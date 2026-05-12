---
Title: ""
Ticket: ""
Status: ""
Topics: []
DocType: ""
Intent: ""
Owners: []
RelatedFiles:
    - Path: ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/scripts/01_build_test_and_probe.sh
      Note: Replays build
    - Path: ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/scripts/02_compare_fixture.sh
      Note: Creates local fixture pages and runs sbcap compare end to end
    - Path: ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/various/01-build-test-probe/output.log
      Note: Recorded runtime evidence that sbcap builds
    - Path: ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/various/02-compare-fixture/output/compare.json
      Note: Concrete compare output used in the guide and diary
ExternalSources: []
Summary: ""
LastUpdated: 0001-01-01T00:00:00Z
WhatFor: ""
WhenToUse: ""
---


# Diary — HAIR-017: sbcap standalone screen diff analysis

## Goal

Create a new ticket that analyzes `cmd/sbcap`, tests the current application enough to verify that it really runs, and produces an intern-grade design/analysis/implementation guide for extracting a standalone screen diff application from it. Keep the work reproducible with numbered scripts in the ticket workspace and upload the resulting document bundle to reMarkable.

## Step 1: Create the ticket and map the sbcap code surface

I started by creating a fresh docmgr ticket specifically for the `sbcap` analysis instead of trying to stuff it into the ongoing HAIR-016 frontend restyle work. That separation matters because this task is about reverse-engineering and productizing a different application, not directly changing the current hair-booking frontend.

The first pass was intentionally architectural rather than speculative. I inventoried `cmd/sbcap` and the `internal/sbcap` tree, verified the package layout, and identified the dominant files by size and responsibility before writing any conclusions. That gave me a concrete map of where the CLI surface stops and where the comparison engine begins.

### Prompt Context

**User prompt (verbatim):** "Look at /home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/cmd/sbcap and analyze that application, which I think goes into that direction. Create a new ticket to analyze and extract a standalone screen diff application. 

reate a detailed analysis / design / implementation guide that is very detailed for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file
  references.
  It should be very clear and detailed. Store in the ticket and the nupload to remarkable.

Keep a diary as you analyze. You can compile it and  try things out. and any experiments you do /  scripts should go in the scripts/ folder of the ticket, with numerical prefix so that we can retrace your steps"

**Assistant interpretation:** Create a separate ticket, investigate the `sbcap` codebase deeply, run enough experiments to prove how it works, and write a highly detailed extraction guide for a future standalone screen diff product.

**Inferred user intent:** Reuse an existing browser-comparison tool rather than inventing a new one from scratch, but do so only after a rigorous architecture study that a new intern could follow without tribal knowledge.

### What I did
- Created ticket `HAIR-017` at:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/`
- Created the primary design doc and diary documents with `docmgr doc add`.
- Inspected:
  - `cmd/sbcap/main.go`
  - `internal/sbcap/config/*`
  - `internal/sbcap/driver/*`
  - `internal/sbcap/runner/*`
  - `internal/sbcap/modes/*`
  - `internal/sbcap/ai/*`
- Counted line lengths of key files to identify where the system complexity lives.
- Added ticket tasks for architecture mapping, experiments, guide writing, diary maintenance, validation, and reMarkable upload.

### Why
- A separate ticket keeps the analysis searchable and reviewable on its own.
- Package inventory and line counts help avoid writing a shallow guide that only describes the CLI and misses where the real logic is.

### What worked
- `docmgr` created the workspace, core ticket files, and both requested docs cleanly.
- The `sbcap` repo structure is compact and coherent enough to map in one pass.

### What didn't work
- N/A

### What I learned
- `matched_styles.go` is the largest and most conceptually dense subsystem, which immediately suggested that cascade introspection is one of the differentiators of this tool.
- `compare.go` is already surprisingly close to a standalone screen-diff command surface.

### What was tricky to build
- The main challenge here was not implementation but scoping: deciding whether the current app should be analyzed as “a CLI with some browser features” or as “a browser comparison engine with multiple command adapters.” The file layout and responsibilities clearly support the second framing.

### What warrants a second pair of eyes
- The final extraction recommendation should be reviewed by someone who has used both Glazed-heavy CLIs and simpler product CLIs, because the boundary between reusable engine and user-facing command surface is one of the biggest design decisions in this analysis.

### What should be done in the future
- Run the tool, not just read it.
- Add reproducible experiment scripts under the ticket `scripts/` directory.
- Write the full design guide after those experiments so the claims are not purely static-analysis claims.

### Code review instructions
- Start with:
  - `/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/cmd/sbcap/main.go`
  - `/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/internal/sbcap/config/config.go`
  - `/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking/internal/sbcap/runner/runner.go`
- Then inspect the ticket workspace:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/`

### Technical details
- Ticket created with:
  - `docmgr ticket create-ticket --ticket HAIR-017 --title "Analyze sbcap and extract a standalone screen diff application" --topics frontend,tooling,browser-automation,visual-regression,chromedp`
- File inventory commands included:
  - `find cmd/sbcap -maxdepth 3 -type f`
  - `find internal/sbcap -maxdepth 3 -type f`
  - `wc -l ...`

## Step 2: Run build, test, probe, and compare experiments from ticket scripts

Once the static map was in place, I moved to reproducible experiments. I did not want ad hoc shell history to become the only evidence that `sbcap` really works. Instead, I created numbered scripts under the ticket workspace so another engineer can replay the same build, test, and browser-comparison steps.

I deliberately used two kinds of experiments. The first was environment proof: build the binary, run tests, inspect command help, and verify chromedp can actually launch a browser. The second was product proof: stand up two tiny local fixture pages and run `sbcap compare` against them so the resulting screenshots, CSS diffs, matched-style winners, and pixel diff artifacts can be inspected directly.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Create reproducible experiment scripts and use them to validate that `sbcap` works both as a CLI and as a real browser diff tool.

**Inferred user intent:** The final guide should be grounded in observed behavior, not just source-code reading.

### What I did
- Created:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/scripts/01_build_test_and_probe.sh`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/scripts/02_compare_fixture.sh`
- Ran script 01, which executed:
  - `go test ./cmd/sbcap ./internal/sbcap/...`
  - `go build ./cmd/sbcap`
  - `go run ./cmd/sbcap --help`
  - `go run ./cmd/sbcap compare --help`
  - `go run ./cmd/sbcap chromedp-probe --url https://example.com --selector h1 --wait-ms 500 --timeout-ms 15000`
- Ran script 02, which:
  - created two tiny HTML fixture pages,
  - served them via `python3 -m http.server`,
  - ran `go run ./cmd/sbcap compare` against `#hero-card` on both pages,
  - wrote artifacts under the ticket workspace.
- Reviewed:
  - `output.log`
  - `compare.json`
  - `compare.json`

### Why
- Scripted experiments are easier to trust, easier to review, and easier for an intern to replay.
- The local fixture compare run is especially valuable because it exercises the exact end-to-end path we care about for a standalone screen diff product.

### What worked
- `go test` passed for `./cmd/sbcap` and all `internal/sbcap` packages.
- `go build ./cmd/sbcap` succeeded.
- `chromedp-probe` successfully launched a browser and verified `https://example.com`.
- The local fixture compare run produced screenshots, JSON, Markdown, and diff PNGs successfully.
- The compare report surfaced real style differences and a meaningful pixel-diff percentage (`18.6952%`).

### What didn't work
- The initial repo search referenced an older transcript path for a previous Playwright smoke script that did not exist in this checkout. That was harmless, but it confirmed I should rely on local file evidence rather than transcript references for this ticket.

### What I learned
- The environment can run `chromedp` successfully right now; browser automation is not hypothetical here.
- The `compare` command is already the most promising seed for a standalone app because it avoids the YAML-plan overhead while still producing rich artifacts.
- The current report output already contains enough signal for a migration-focused workflow: computed style diffs, matched-style winners, and image-level diffs.

### What was tricky to build
- The local compare fixture script needed a tiny self-hosted HTTP server because browser navigation and screenshots are far more reliable over `http://127.0.0.1:...` than over ad hoc file URLs when automating with chromedp.
- The fixture had to be simple enough to understand quickly but different enough to exercise CSS and pixel diff outputs in a non-trivial way.

### What warrants a second pair of eyes
- Whether the current artifact structure (`compare.json`, diff PNGs, and mode-specific reports) is already “good enough” for a first standalone release or whether we should immediately normalize everything into a single session model.

### What should be done in the future
- Use the experimental evidence to write the extraction guide.
- Run `docmgr doctor` and bundle the guide + diary for reMarkable.

### Code review instructions
- Read the scripts first:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/scripts/01_build_test_and_probe.sh`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/scripts/02_compare_fixture.sh`
- Then inspect the generated artifacts:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/various/01-build-test-probe/output.log`
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/various/02-compare-fixture/output/compare.json`

### Technical details
- `compare.json` and the generated diff PNGs showed these key fixture differences:
  - `font-family`
  - `color`
  - `background-color`
  - `border-radius`
  - `box-shadow`
- The pixel diff result recorded:
  - `Total pixels: 64380`
  - `Changed pixels: 12036`
  - `Changed percent: 18.6952%`

## Step 3: Write the extraction guide and finalize ticket documentation

After the experiments, I wrote the primary design/analysis/implementation guide with the explicit goal that a new intern should be able to pick it up cold, understand what `sbcap` is today, and follow a plausible extraction path toward a standalone screen diff application. I kept it evidence-first and structure-heavy: architecture map, mode analysis, experimental validation, extraction options, proposed package design, runtime model, API sketches, risks, and phased implementation plan.

I also used this step to make the ticket self-contained. That means the guide points back to the code, the diary points back to the scripts and artifacts, and the final ticket can be bundled and uploaded without requiring someone to reconstruct why a statement was made.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Produce the final intern-grade analysis and implementation guide, not just raw notes or a thin summary.

**Inferred user intent:** Hand a future engineer a document they can actually execute against.

### What I did
- Wrote the primary guide at:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/design-doc/01-sbcap-analysis-architecture-and-standalone-screen-diff-extraction-guide.md`
- Included:
  - executive summary,
  - problem statement,
  - current architecture,
  - package and command responsibilities,
  - mode-by-mode analysis,
  - experimental findings,
  - extraction recommendation,
  - diagrams,
  - pseudocode,
  - API sketches,
  - phased implementation plan,
  - risks and references.
- Prepared the ticket for final validation and upload steps.

### Why
- The user asked for a guide that is explicit, detailed, and suitable for a new intern. That requires more than a code tour. It requires a “why this exists / what to keep / what to change / how to proceed” narrative.

### What worked
- The architecture broke cleanly into CLI, config, driver, runner, and mode layers, which made the guide much easier to organize.
- The experiments provided concrete evidence that the guide could cite rather than merely asserting that `sbcap` “seems viable.”

### What didn't work
- N/A

### What I learned
- The strongest extraction move is not “rewrite `sbcap`,” but “promote its compare workflow, normalize its artifacts, and factor its reusable engine more clearly.”

### What was tricky to build
- The guide had to balance present-state analysis with future-state design. Too much future-state writing would have turned it into fiction; too much present-state writing would not have answered the extraction question. The experiments were what made that balance possible.

### What warrants a second pair of eyes
- The recommendation to make direct compare the primary product surface and YAML plans the advanced workflow should be reviewed by someone who knows the intended end-user persona well.

### What should be done in the future
- Run `docmgr doctor` and upload the final bundle to reMarkable.
- If the team approves the direction, follow up with an implementation ticket that extracts the core comparison/session layers described in the guide.

### Code review instructions
- Read the design doc start-to-finish once.
- Then spot-check the file references it cites:
  - `cmd/sbcap/main.go`
  - `internal/sbcap/config/config.go`
  - `internal/sbcap/driver/chrome.go`
  - `internal/sbcap/runner/runner.go`
  - `internal/sbcap/modes/*`
- Finally review the scripts and outputs to confirm the evidence base.

### Technical details
- Primary guide path:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-017--analyze-sbcap-and-extract-a-standalone-screen-diff-application/design-doc/01-sbcap-analysis-architecture-and-standalone-screen-diff-extraction-guide.md`

## Step 4: Validate the ticket and upload the final bundle to reMarkable

With the guide and diary written, I finished the ticket the same way I would want an intern to finish it: validate the doc workspace, clean up documentation hygiene issues instead of ignoring them, and then publish a bundled deliverable to reMarkable. This last step matters because it proves the ticket is not just locally complete; it is packaged for review and handoff.

The only real cleanup required before upload was documentation hygiene. `docmgr doctor` initially complained about missing vocabulary entries for the new topics and about a generated `compare.md` artifact living under `various/` without YAML frontmatter. I fixed both by adding vocabulary entries and changing the compare experiment to rely on `compare.json` plus image artifacts instead of a raw markdown file that docmgr would treat as malformed ticket documentation.

### Prompt Context

**User prompt (verbatim):** (see Step 1)

**Assistant interpretation:** Finish the ticket properly by validating docmgr health and uploading the final deliverable to reMarkable.

**Inferred user intent:** Produce a polished research deliverable rather than leaving the ticket as an internal scratchpad.

### What I did
- Ran `docmgr doctor --ticket HAIR-017 --stale-after 30`.
- Fixed doctor findings by:
  - adding topic vocabulary entries for `tooling`, `browser-automation`, `visual-regression`, and `chromedp`
  - deleting the generated `compare.md` artifact
  - updating the experiment script and docs to rely on `compare.json` instead
- Re-ran `docmgr doctor` until it passed cleanly.
- Verified reMarkable tooling and account access with:
  - `remarquee status`
  - `remarquee cloud account --non-interactive`
- Ran a dry-run bundle upload.
- Uploaded the final bundle containing:
  - the primary design doc
  - the investigation diary
- Verified the uploaded document exists at `/ai/2026/04/21/HAIR-017`.

### Why
- A clean `doctor` run is the easiest way to ensure the ticket is not carrying hidden documentation debt.
- A dry-run upload is the safest way to catch naming/path/tooling problems before producing the final PDF.

### What worked
- `docmgr doctor` passed after the vocabulary and artifact cleanup.
- `remarquee upload bundle --dry-run ...` succeeded.
- The actual upload succeeded and the document is visible in the remote directory.

### What didn't work
- The first verification command `remarquee cloud ls /ai/2026/04/21/HAIR-017 --long --non-interactive` returned `Error: no matches for 'HAIR-017'` once, which looked like a path-resolution mismatch in the CLI. Listing the parent directory first and then listing the quoted child path worked.

### What I learned
- Generated markdown artifacts inside ticket workspaces can confuse `docmgr doctor` if they are not intended to be first-class ticket docs. JSON and image artifacts are safer defaults for ad hoc experiment outputs in `various/`.

### What was tricky to build
- The subtle part was remembering that ticket hygiene includes generated artifacts, not only the hand-written docs. The experiment had produced a technically useful markdown report, but in the context of docmgr it behaved like a malformed document.

### What warrants a second pair of eyes
- N/A

### What should be done in the future
- If this analysis turns into an implementation project, create a follow-up ticket that links back to HAIR-017 rather than reopening this one as a mixed research/implementation bucket.

### Code review instructions
- Validate with:
  - `cd /home/manuel/workspaces/2026-04-21/hair-v2/hair-booking && docmgr doctor --ticket HAIR-017 --stale-after 30`
  - `remarquee cloud ls "/ai/2026/04/21/HAIR-017" --long --non-interactive`
- Confirm that the final bundle includes the design doc and diary only.

### Technical details
- Uploaded bundle name: `HAIR-017 sbcap analysis and extraction guide`
- Remote path: `/ai/2026/04/21/HAIR-017`
