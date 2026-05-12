---
Title: Implementation diary
Ticket: CSS-VISUAL-DIFF-INSPECT
Status: active
Topics:
    - tooling
    - visual-regression
    - browser-automation
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: css-visual-diff/README.md
      Note: User-facing inspect workflow examples.
    - Path: css-visual-diff/cmd/css-visual-diff/main.go
      Note: CLI registration for inspect and artifact-specific verbs.
    - Path: css-visual-diff/examples/pyxis-atoms-prototype-vs-storybook.yaml
      Note: Example config demonstrating many sections and styles in one YAML file.
    - Path: css-visual-diff/go.mod
      Note: Updated by go mod tidy for Glazed help dependencies.
    - Path: css-visual-diff/go.sum
      Note: Updated checksums for Glazed help dependencies.
    - Path: css-visual-diff/internal/cssvisualdiff/doc/doc.go
      Note: Embedded Glazed help doc loader.
    - Path: css-visual-diff/internal/cssvisualdiff/doc/examples/artifact-commands.md
      Note: Artifact command examples help entry.
    - Path: css-visual-diff/internal/cssvisualdiff/doc/topics/config-selectors.md
      Note: Selector model help entry.
    - Path: css-visual-diff/internal/cssvisualdiff/doc/tutorials/inspect-workflow.md
      Note: Inspect workflow tutorial help entry.
    - Path: css-visual-diff/internal/cssvisualdiff/modes/inspect.go
      Note: New inspect runtime
    - Path: css-visual-diff/internal/cssvisualdiff/modes/inspect_test.go
      Note: Tests for inspect selector resolution and format validation.
ExternalSources: []
Summary: Diary for the ticket that will add the css-visual-diff inspect verb for single-side screenshot, HTML, CSS, and single-file artifact output.
LastUpdated: 2026-04-24T01:17:00-04:00
WhatFor: Use this to understand why the inspect ticket was created and how the initial implementation plan was shaped.
WhenToUse: Use when implementing or reviewing CSS-VISUAL-DIFF-INSPECT.
---




# Diary

## Goal

Record the creation and implementation planning for `CSS-VISUAL-DIFF-INSPECT`, a focused ticket to add a small inspect-first command to `css-visual-diff`.

## Step 1: Create inspect-verb implementation ticket

This step created the new ticket and wrote the implementation plan. The key design decision is to use the existing `--config` YAML schema first, because it already supports multiple `sections` and `styles`. The new command should add a better authoring loop rather than introduce a new schema.

The plan also adds single-file output support, so scripts can request only a PNG, HTML file, CSS JSON/Markdown, inspect JSON, or metadata file.

### Prompt Context

**User prompt (verbatim):** "Create a new docmgr ticket to create this verb. also allow outputting a single file (png, or css, etc...). 

Before you create the new ticket, can we do multiple selectors per yaml file? like with --config ?"

**Assistant interpretation:** First answer whether current `--config` YAML supports multiple selectors; then create a new docmgr ticket for implementing the inspect verb with both artifact-directory output and single-file output.

**Inferred user intent:** Keep the next implementation small and practical: use one YAML file with multiple named selectors, inspect one or many of them, and support shell-friendly single-artifact output.

**Commit (code):** N/A — ticket/documentation setup only.

### What I did

- Verified current config supports multiple selectors through `sections[]` and `styles[]`.
- Created ticket `CSS-VISUAL-DIFF-INSPECT`.
- Added design doc `Inspect verb implementation plan`.
- Added this diary.
- Wrote an implementation plan for:
  - `css-visual-diff inspect --config FILE --side original|react`,
  - `--root`, `--section`, `--style`, `--selector`, `--all-sections`, `--all-styles`,
  - directory output,
  - strict single-file output through `--format` + `--output-file`.

### Why

The previous simplicity-first analysis identified `inspect` as the smallest valuable next feature. This ticket turns that analysis into a concrete implementation target.

### What worked

- Existing YAML already supports multiple selectors.
- The required implementation can reuse current config, prepare, capture, and CSS evaluation primitives.
- No new manifest schema is needed for the first PR.

### What didn't work

- No implementation was attempted yet.

### What I learned

The most important product distinction is between:

- a config file containing many selectors, which is already supported, and
- a command that can inspect only one selected selector, which is the missing ergonomic piece.

### What was tricky to build

The main tricky design point is single-file output. It should be strict and explicit because multi-selector output does not naturally map to one file. The plan therefore recommends requiring exactly one inspect request when `--output-file` is used.

### What warrants a second pair of eyes

- The exact `--format` names: `png`, `html`, `css-json`, `css-md`, `inspect-json`, `metadata-json`.
- Whether `css` should alias `css-md` or be rejected as ambiguous.
- Whether `--all-sections` and `--all-styles` should be included in the first PR or deferred.

### What should be done in the future

- Implement `inspect` in `cmd/css-visual-diff/main.go` or a small new inspect package.
- Refactor reusable helpers from `capture.go` and `cssdiff.go`.
- Add unit tests before browser integration tests.

### Code review instructions

Start with the design doc:

```text
hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-INSPECT--add-inspect-verb-for-single-side-screenshot-html-and-css-artifacts/design-doc/01-inspect-verb-implementation-plan.md
```

Then inspect:

```text
css-visual-diff/cmd/css-visual-diff/main.go
css-visual-diff/internal/cssvisualdiff/config/config.go
css-visual-diff/internal/cssvisualdiff/modes/capture.go
css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go
css-visual-diff/internal/cssvisualdiff/modes/prepare.go
```

Validate with:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go test ./...
```

### Technical details

Current multi-selector evidence command:

```bash
rg -n "type Config struct|Sections \\[\\]SectionSpec|Styles \\[\\]StyleSpec|for _, section := range cfg\\.Sections|for _, style := range cfg\\.Styles|sections:|styles:" \
  css-visual-diff/internal/cssvisualdiff/config/config.go \
  css-visual-diff/internal/cssvisualdiff/modes/capture.go \
  css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go \
  css-visual-diff/examples/pyxis-atoms-prototype-vs-storybook.yaml
```

## Step 2: Implement inspect command and artifact-specific verbs

This step implemented the inspect-first workflow in `css-visual-diff`. The code now supports a general `inspect` command for directory bundles or single files, plus small selector-tuning verbs for the common single-file artifacts: `screenshot`, `css-md`, `css-json`, `html`, and `inspect-json`.

The implementation keeps the current YAML schema. It treats `sections[]` as screenshot regions and `styles[]` as CSS probes, then resolves one selected root/section/style/direct selector or a batch of all sections/styles. This preserves compatibility while making selector and prepare debugging much faster.

### Prompt Context

**User prompt (verbatim):** "already, create an implementation plan and a detailed list of tasks for the inspect part  and then implement the tasks one by one. Keep a detailed diary as you work. Commit at appropriate intervals."

**Assistant interpretation:** Turn the inspect ticket plan into implementation work, update tasks and diary as work proceeds, validate the implementation, and commit focused changes.

**Inferred user intent:** Move from planning to a working `inspect` feature while preserving traceability and reviewability.

**Commit (code):** `5c7f852dba738c9d2a6e4d13a0db7a9e3238c044` — `feat: add inspect artifact commands`.

### What I did

- Implemented `internal/cssvisualdiff/modes/inspect.go` with:
  - `InspectOptions`, `InspectRequest`, `InspectMetadata`, and result structs.
  - `Inspect(ctx, cfg, opts)` runtime.
  - selector resolution for `--root`, `--section`, `--style`, `--selector`, `--all-sections`, and `--all-styles`.
  - bundle output and single-file output.
  - supported formats: `bundle`, `png`, `html`, `css-json`, `css-md`, `inspect-json`, `metadata-json`.
  - CSS Markdown writer and multi-selector `index.json` / `index.md` writer.
- Added `internal/cssvisualdiff/modes/inspect_test.go` covering:
  - style selector resolution by side,
  - configured style props and attributes,
  - section selector resolution,
  - all-styles expansion,
  - exactly-one selector source validation,
  - output-file bundle rejection,
  - format aliases.
- Added CLI wiring in `cmd/css-visual-diff/main.go`:
  - `inspect`,
  - `screenshot`,
  - `css-md`,
  - `css-json`,
  - `html`,
  - `inspect-json`.
- Updated `README.md` with inspect-first examples and single-artifact selector tuning examples.
- Updated ticket tasks to mark implementation/test/doc steps done.

### Why

The first useful workflow is not a full comparison. It is verifying one side and one selector. The new commands make that direct:

```bash
css-visual-diff css-md --config file.yml --side react --style button --output-file /tmp/button.md
css-visual-diff screenshot --config file.yml --side react --style button --output-file /tmp/button.png
```

### What worked

- The existing `modes` package was a good home for the implementation because it can reuse unexported helpers such as `prepareTarget`, `writePreparedHTML`, `writeInspectJSON`, `evaluateStyle`, `selectorForSection`, `selectorForTarget`, and `sanitizeName`.
- Unit tests pass.
- CLI help shows the new commands.
- A smoke test against a temporary local Python HTTP server successfully produced both CSS Markdown and PNG files.

### What didn't work

- I initially considered only `inspect --format ...`, but the user specifically wanted verbs for artifact tuning. The implementation therefore includes both the general command and thin artifact-specific commands.
- The first implementation does not yet support the future `regions[]` / nested CSS-probe schema. It intentionally uses current `sections[]` and `styles[]` first.

### What I learned

- The inspect feature could be added without changing the config schema.
- The current helper functions are reusable enough, but they are still private and organically placed. A future cleanup could move inspect/capture artifact helpers into a smaller shared package if this grows.
- Single-file commands are much nicer for shell loops than forcing users to remember `inspect --format ... --output-file ...` every time.

### What was tricky to build

The main tricky part was output semantics. Directory bundle mode naturally supports multiple selectors, but single-file mode does not. The implementation therefore rejects `--output-file` when multiple inspect requests are selected and artifact-specific verbs do not expose `--all-sections` / `--all-styles`.

Another tricky point was preserving configured style props. For `--style`, the implementation uses the style's own `props` and `attributes` unless `--props` or `--attrs` overrides them. For `--section` and `--selector`, it uses a small default property set.

### What warrants a second pair of eyes

- Whether the top-level `html` command name is too generic.
- Whether `inspect --output-file` should require `--format` explicitly forever; currently the general command defaults to `bundle` and rejects `--output-file` with bundle.
- Whether prepared HTML in bundle mode should always be root HTML rather than selected-element HTML. The current implementation writes the selected selector's outer HTML.
- Whether `metadata-json` also deserves an artifact-specific verb.

### What should be done in the future

- Add region/CSS-probe authoring schema and compile it to current sections/styles.
- Add integration tests with a local HTTP server if the project wants browser smoke coverage in CI.
- Add more helpful selector-miss errors that point at `prepared.html`.
- Consider factoring shared artifact helpers out of `capture.go` / `cssdiff.go` if more commands need them.

### Code review instructions

Review in this order:

1. `internal/cssvisualdiff/modes/inspect.go` — runtime and artifact writing.
2. `internal/cssvisualdiff/modes/inspect_test.go` — selector and format behavior.
3. `cmd/css-visual-diff/main.go` — command registration and flags.
4. `README.md` — user-facing examples.

Validation commands run:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
gofmt -w internal/cssvisualdiff/modes/inspect.go internal/cssvisualdiff/modes/inspect_test.go cmd/css-visual-diff/main.go
GOWORK=off go test ./...
GOWORK=off go run ./cmd/css-visual-diff inspect --help
GOWORK=off go run ./cmd/css-visual-diff screenshot --help
```

Smoke test summary:

```text
Created a temporary HTTP server with two static HTML pages and a temporary config.
Ran css-md and screenshot artifact verbs against --side react --style button.
Verified generated /tmp/button.md and /tmp/button.png were non-empty.
The Markdown contained computed values including rgb(200, 39, 13), 8px border radius, padding, and font size.
```

### Technical details

New commands:

```text
css-visual-diff inspect
css-visual-diff screenshot
css-visual-diff css-md
css-visual-diff css-json
css-visual-diff html
css-visual-diff inspect-json
```

New code files:

```text
css-visual-diff/internal/cssvisualdiff/modes/inspect.go
css-visual-diff/internal/cssvisualdiff/modes/inspect_test.go
```

## Step 3: Validate inspect verbs against real Pyxis atom config

This step exercised the new inspect/artifact verbs against the real Pyxis atom comparison config rather than the tiny smoke-test fixture. I validated two atoms, `button-primary` and `badge-confirmed`, on both the original prototype side and the React Storybook side.

The important result is that the new verbs worked with the existing central Pyxis YAML and the generated screenshots were visually inspected through the image-reading path, not through `understand_image`. The original and React captures matched for these two atoms at the screenshot and computed-CSS levels.

### Prompt Context

**User prompt (verbatim):** "ok, go ahead, do it for a couple of atoms. Use the read_image tool, not understand_image."

**Assistant interpretation:** Run the newly implemented commands against real Pyxis atom selectors, inspect the generated PNGs using image reading rather than AI image-understanding, and record results.

**Inferred user intent:** Verify that the feature is useful on actual project configs and visually inspect the produced artifacts without relying on the `understand_image` tool.

**Commit (code):** N/A — validation-only step after code commit `5c7f852dba738c9d2a6e4d13a0db7a9e3238c044`.

### What I did

- Checked service readiness:
  - Prototype on port `7070` was missing.
  - Storybook on port `6006` was already available.
- Started the Pyxis prototype server with:

```bash
/home/manuel/code/wesen/2026-04-23--pyxis/ttmp/2026/04/23/PYXIS-SCREENSHOT-EXTRACTION--pyxis-screenshot-css-extraction-from-prototype-html/scripts/05-serve-pyxis-prototype.sh
```

- Verified:
  - `http://localhost:7070/Pyxis%20Public%20Site.html`
  - `http://localhost:6006/index.json` includes `atoms-atom-diff-fixture--default`.
- Ran the new artifact verbs against:
  - `button-primary`
  - `badge-confirmed`
  - sides: `original`, `react`
- Generated outputs under:

```text
/tmp/css-vd-pyxis-inspect
```

- Read the generated PNG files through the image read path:
  - `/tmp/css-vd-pyxis-inspect/button-primary/original/screenshot.png`
  - `/tmp/css-vd-pyxis-inspect/button-primary/react/screenshot.png`
  - `/tmp/css-vd-pyxis-inspect/badge-confirmed/original/screenshot.png`
  - `/tmp/css-vd-pyxis-inspect/badge-confirmed/react/screenshot.png`

### Commands run

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
OUT=/tmp/css-vd-pyxis-inspect
CONFIG=examples/pyxis-atoms-prototype-vs-storybook.yaml

GOWORK=off go run ./cmd/css-visual-diff html --config "$CONFIG" --side original --root --output-file "$OUT/original-root.html"
GOWORK=off go run ./cmd/css-visual-diff html --config "$CONFIG" --side react --root --output-file "$OUT/react-root.html"

for atom in button-primary badge-confirmed; do
  for side in original react; do
    GOWORK=off go run ./cmd/css-visual-diff screenshot --config "$CONFIG" --side "$side" --style "$atom" --output-file "$OUT/$atom/$side/screenshot.png"
    GOWORK=off go run ./cmd/css-visual-diff css-md --config "$CONFIG" --side "$side" --style "$atom" --output-file "$OUT/$atom/$side/computed-css.md"
    GOWORK=off go run ./cmd/css-visual-diff css-json --config "$CONFIG" --side "$side" --style "$atom" --output-file "$OUT/$atom/$side/computed-css.json"
  done
done
```

### Visual results

Using image reads, the PNGs showed:

- `button-primary/original`: red rounded “Get tickets” button with white text and a right chevron.
- `button-primary/react`: red rounded “Get tickets” button with white text and a right chevron.
- `badge-confirmed/original`: pale green rounded badge with green dot and “Confirmed” text.
- `badge-confirmed/react`: pale green rounded badge with green dot and “Confirmed” text.

The crops were tight and useful for selector tuning:

```text
button-primary original: 122 x 34
button-primary react:    122 x 34
badge-confirmed original: 84 x 22
badge-confirmed react:    84 x 22
```

### CSS results

`button-primary` original and react matched on the captured properties:

```text
height: 33.5938px
padding: 8px 16px
background-color: rgb(200, 39, 13)
color: rgb(255, 255, 255)
border: 1px solid rgb(200, 39, 13)
border-radius: 8px
font-size: 13px
font-weight: 500
line-height: 15.6px
gap: 7px
```

`badge-confirmed` original and react matched on the captured properties:

```text
display: inline-flex
gap: 5px
background-color: rgb(234, 243, 236)
color: rgb(60, 122, 79)
font-size: 11px
font-weight: 500
padding: 2px 9px
border-radius: 999px
line-height: 17.6px
```

### Why

This validates the core product goal: a user can take an existing YAML config, choose one atom by name, and quickly get screenshot/HTML/CSS artifacts for either side without running a full comparison.

### What worked

- Prototype serving script started the prototype successfully.
- Storybook was already indexed and ready.
- `html --root` worked for both original and react.
- `screenshot`, `css-md`, and `css-json` worked for both atoms on both sides.
- The PNG dimensions and visuals were consistent between original and React for the tested atoms.
- The CSS Markdown output is easy to read and immediately useful.

### What didn't work

- The prototype was not already running; it had to be started.
- No failure-path validation was performed in this step. I did not intentionally test missing selectors yet.

### What I learned

The artifact-specific verbs are the right interface for this workflow. They make it very fast to produce the exact artifact needed:

- use `screenshot` when tuning crop selectors,
- use `css-md` when tuning style selectors or property lists,
- use `html --root` when debugging prepare output.

The output also confirms that `--style` can serve both screenshot and CSS use cases when the style selector is the exact CSS-bearing element.

### What was tricky to build

This validation exposed an important practical distinction: `--style` screenshots are very tight because they screenshot the CSS-bearing element itself. That is ideal for atom-level selector tuning, but larger components may still need a region/screenshot selector plus nested CSS probes. The future `regions[]` schema remains useful.

### What warrants a second pair of eyes

- Whether `html --root` should write full root HTML by default while `html --style` writes selected element HTML. That is current behavior and seems reasonable, but should be documented clearly.
- Whether real-world users will expect `screenshot --style` to screenshot the style selector or the parent screenshot region.

### What should be done in the future

- Add a deliberate missing-selector test to verify the failure message is helpful.
- Add `--open` for quick local viewing.
- Add the future `regions[]` schema for components where screenshot crop and CSS probes differ.

### Code review instructions

For validation evidence, inspect files under:

```text
/tmp/css-vd-pyxis-inspect
```

Key artifacts:

```text
button-primary/original/screenshot.png
button-primary/react/screenshot.png
badge-confirmed/original/screenshot.png
badge-confirmed/react/screenshot.png
button-primary/original/computed-css.md
button-primary/react/computed-css.md
badge-confirmed/original/computed-css.md
badge-confirmed/react/computed-css.md
original-root.html
react-root.html
```

## Step 4: Add Glazed help entries for inspect workflow

This step upgraded the user-facing documentation from README-only guidance to embedded Glazed help entries. Before this step, `css-visual-diff` did not have a wired Glazed help system or in-binary help topics. It had a README and Cobra command help, but no browsable `css-visual-diff help <topic>` pages.

The new help entries document the inspect workflow, selector model, and artifact-specific commands directly in the CLI. This makes the feature discoverable while using the tool, not only by reading the repository README.

### Prompt Context

**User prompt (verbatim):** "update the documentation, do we have good documentation anyway (use glazed help entries)"

**Assistant interpretation:** Assess the current documentation state, add proper Glazed help entries, wire them into the Cobra root, validate the help commands, and commit the documentation integration.

**Inferred user intent:** Make the new inspect workflow discoverable through the CLI's canonical help system instead of relying on ad-hoc README text.

**Commit (code/docs):** `2c8053bd5a2f1d3a47ff5020109f2564f4b50d84` — `docs: add glazed help entries`.

### What I did

- Loaded the `glazed-help-page-authoring` skill and read the authoritative Glazed help-writing guidance with:

```bash
glaze help how-to-write-good-documentation-pages
glaze help writing-help-entries
```

- Checked the repository and found no existing Glazed help integration:
  - no `help.NewHelpSystem`,
  - no `help_cmd.SetupCobraRootCommand`,
  - no embedded doc package for help entries.
- Added `internal/cssvisualdiff/doc/doc.go` with embedded docs and `AddDocToHelpSystem`.
- Added three help entries:
  - `inspect-workflow` (`Tutorial`): step-by-step inspect-before-compare workflow.
  - `config-selectors` (`GeneralTopic`): explains `sections[]` as screenshot regions and `styles[]` as CSS probes.
  - `artifact-commands` (`Example`): documents `screenshot`, `css-md`, `css-json`, `html`, and `inspect-json`.
- Wired the help system into `cmd/css-visual-diff/main.go` with `help.NewHelpSystem`, `doc.AddDocToHelpSystem`, and `help_cmd.SetupCobraRootCommand`.
- Ran `GOWORK=off go mod tidy` because importing Glazed help packages required missing transitive help UI/render dependencies in `go.sum`.
- Validated:

```bash
GOWORK=off go test ./...
GOWORK=off go run ./cmd/css-visual-diff help
GOWORK=off go run ./cmd/css-visual-diff help inspect-workflow
GOWORK=off go run ./cmd/css-visual-diff help config-selectors
```

### Why

The inspect workflow needs better documentation than command flags alone. Users need to understand the order of operations: prepared HTML first, screenshot second, CSS Markdown third, full comparison last. Glazed help entries are the right place for this because they are searchable and available from the binary.

### What worked

- The Glazed help root now lists:
  - General topic: `config-selectors`
  - Example: `artifact-commands`
  - Tutorial: `inspect-workflow`
- `css-visual-diff help inspect-workflow` renders the inspect workflow in the terminal.
- `css-visual-diff help config-selectors` renders the selector model.
- Tests pass after `go mod tidy`.

### What didn't work

- The first test run failed because importing `github.com/go-go-golems/glazed/pkg/help` and `github.com/go-go-golems/glazed/pkg/help/cmd` exposed missing `go.sum` entries for help-rendering and TUI dependencies such as `glamour`, `frontmatter`, `bubbletea`, `lipgloss`, and related packages. Running `GOWORK=off go mod tidy` resolved this by updating `go.mod` and `go.sum`.
- The first help run reported a frontmatter parse error in `config-selectors.md` because the unquoted title contained a colon. Quoting the title fixed it.

### What I learned

`css-visual-diff` previously had acceptable README-level documentation for a small experimental CLI, but it did not have good in-tool documentation. The new Glazed help entries substantially improve discoverability because users can now run:

```bash
css-visual-diff help inspect-workflow
css-visual-diff help config-selectors
css-visual-diff help artifact-commands
```

### What was tricky to build

The tricky part was dependency hygiene. Glazed was already a dependency, but the help subpackages bring in rendering and TUI dependencies that were not present in `go.sum` because the repo had not imported those packages before. This is expected, but it makes the documentation commit include `go.mod` and `go.sum` changes.

### What warrants a second pair of eyes

- Whether adding the full Glazed help UI dependencies is acceptable for this binary.
- Whether the `html` artifact command should be renamed before documentation spreads.
- Whether `script` should be hidden or moved under an experimental namespace now that the help root makes commands more visible.

### What should be done in the future

- Add help entries for `run`, full comparison reports, and Pyxis-style prepared targets.
- Consider adding a `help serve` workflow if the Glazed help server is useful for longer documentation.
- Keep README as quick-start documentation and Glazed help as command/task documentation.

### Code review instructions

Review these files:

```text
internal/cssvisualdiff/doc/doc.go
internal/cssvisualdiff/doc/tutorials/inspect-workflow.md
internal/cssvisualdiff/doc/topics/config-selectors.md
internal/cssvisualdiff/doc/examples/artifact-commands.md
cmd/css-visual-diff/main.go
go.mod
go.sum
```

Validation commands:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go test ./...
GOWORK=off go run ./cmd/css-visual-diff help
GOWORK=off go run ./cmd/css-visual-diff help inspect-workflow
GOWORK=off go run ./cmd/css-visual-diff help config-selectors
```

## Step 5: Fix inspect help behavior when required flags are missing

This step fixed a UX regression introduced by marking `--config`, `--side`, and `--output-file` as Cobra-required flags. When a user ran `css-visual-diff inspect` without flags, Cobra intercepted the command before the inspect implementation could run and printed a short, incomplete required-flag error view. That output differed from `css-visual-diff inspect --help`, even though the no-argument command should be a friendly help entry point.

The fix removes Cobra's required-flag registration for inspect commands and handles missing input inside `RunE`. With no flags, `inspect` and artifact commands now render the same full command help as `--help`. With partial input, they print full help plus a concise missing-flag error.

### Prompt Context

**User prompt (verbatim):** "❯ go run ./cmd/css-visual-diff inspect 
Error: required flag(s) "config", "side" not set

  # inspect - Inspect one side of a css-visual-diff config and write screenshot/HTML/CSS artifacts                                                                                                        
                                                                                                                                                                                                          
  For more help, run: css-visual-diff help inspect                                                                                                                                                        
                                                                                                                                                                                                          
  Run css-visual-diff help --ui to open the interactive help TUI.                                                                                                                                         
                                                                                                                                                                                                          
  ## Examples                                                                                                                                                                                             
                                                                                                                                                                                                          
  Run css-visual-diff help <example> to view an example in full.                                                                                                                                          
                                                                                                                                                                                                          
  • artifact-commands - Artifact Commands for Selector Tuning                                                                                                                                             


required flag(s) "config", "side" not set
exit status 1
css-visual-diff on  task/hair-v2 via 🐹 v1.26.2 
❯ go run ./cmd/css-visual-diff inspect  --help

   inspect - Inspect one side of a css-visual-diff config and write screenshot/HTML/CSS artifacts                                                                                                         
                                                                                                                                                                                                          
  For more help, run:  css-visual-diff help inspect                                                                                                                                                       
                                                                                                                                                                                                          
  Run  css-visual-diff help --ui  to open the interactive help TUI.                                                                                                                                       
                                                                                                                                                                                                          
  ## Usage:                                                                                                                                                                                               
                                                                                                                                                                                                          
   css-visual-diff inspect [flags]                                                                                                                                                                        
                                                                                                                                                                                                          
  ## Flags:                                                                                                                                                                                               
                                                                                                                                                                                                          
       --all-sections    Inspect all sections[] entries                                                                                                                                                   
         --all-styles    Inspect all styles[] entries                                                                                                                                                     
              --attrs    Comma-delimited attributes to capture in computed CSS artifacts (default "id,class")                                                                                             
             --config    Path to css-visual-diff YAML config                                                                                                                                              
             --format    Artifact format: bundle, png, html, css-json, css-md, inspect-json, metadata-json (default "bundle")                                                                             
           -h, --help    help for inspect                                                                                                                                                                 
                --out    Output directory for bundle artifacts (default: <config output.dir>/inspect/<side>)                                                                                              
        --output-file    Write a single artifact file instead of a bundle directory                                                                                                                       
              --props    Comma-delimited CSS properties to capture (defaults to style props or a small inspect set)                                                                                       
               --root    Inspect the target root_selector                                                                                                                                                 
            --section    Inspect a named sections[] entry                                                                                                                                                 
           --selector    Inspect an explicit CSS selector                                                                                                                                                 
               --side    Target side to inspect: original or react                                                                                                                                        
              --style    Inspect a named styles[] entry                                                                                                                                                   
          --long-help    Show long help                                                                                                                                                                   
                                                                                                                                                                                                          
  ## Global flags:                                                                                                                                                                                        
                                                                                                                                                                                                          
           --log-file    Log file (default: stderr)                                                                                                                                                       
         --log-format    Log format (json, text) (default "text")                                                                                                                                         
          --log-level    Log level (trace, debug, info, warn, error, fatal) (default "error")                                                                                                             
       --log-to-stdout    Log to stdout even when log-file is set                                                                                                                                         
       --logstash-app-name    Application name for Logstash logs (default "css-visual-diff")                                                                                                              
       --logstash-enabled    Enable logging to Logstash                                                                                                                                                   
       --logstash-environment    Environment name for Logstash logs (development, staging, production) (default "development")                                                                            
       --logstash-host    Logstash host (default "logstash")                                                                                                                                              
       --logstash-port    Logstash port (default 5044)                                                                                                                                                    
       --logstash-protocol    Logstash protocol (tcp, udp)                                                                                                                                                
        --with-caller    Log caller information                                                                                                                                                           
                                                                                                                                                                                                          
  Use  css-visual-diff inspect --help --long-help  for information about all flags.                                                                                                                       
                                                                                                                                                                                                          
  ## General topics                                                                                                                                                                                       
                                                                                                                                                                                                          
  Run  css-visual-diff help <topic>  to view a topic's page.                                                                                                                                              
                                                                                                                                                                                                          
  • config-selectors - Config Selectors: Regions and CSS Probes                                                                                                                                           
                                                                                                                                                                                                          
  ## Examples                                                                                                                                                                                             
                                                                                                                                                                                                          
  Run  css-visual-diff help <example>  to view an example in full.                                                                                                                                        
                                                                                                                                                                                                          
  • artifact-commands - Artifact Commands for Selector Tuning                                                                                                                                             
                                                                                                                                                                                                          
  ## Tutorials                                                                                                                                                                                            
                                                                                                                                                                                                          
  Run  css-visual-diff help <tutorial>  to view a tutorial's page.                                                                                                                                        
                                                                                                                                                                                                          
  • inspect-workflow - Inspect One Side Before Comparing                                                                                                                                                  

css-visual-diff on  task/hair-v2 via 🐹 v1.26.2 
❯ 

---

the text with or without --help should be the same, something didn't work with the registering?"

**Assistant interpretation:** Fix the inspect command so running it without flags displays the same full help as `inspect --help`, instead of Cobra's shorter required-flag failure view.

**Inferred user intent:** Make the new Glazed help integration feel coherent and avoid confusing help/error output for first-time users.

**Commit (code):** `fe1c6fbc3a1399da7765ebffa923e6c4dd12ad1c` — `fix: show inspect help without required flag errors`.

### What I did

- Reproduced the mismatch between no-arg inspect and `inspect --help`.
- Removed Cobra `MarkFlagRequired` usage from inspect and artifact-specific commands.
- Added explicit missing-input handling in `runInspectCommand`:
  - no inspect flags prints full help and exits successfully,
  - missing `--config` or `--side` with partial input prints full help and returns a concise error.
- Made inspect/artifact commands `SilenceUsage` and `SilenceErrors` so Cobra does not print a second abbreviated usage block after our explicit help output.
- Added command tests:
  - `TestInspectCommandNoArgsShowsHelp`
  - `TestInspectArtifactCommandNoArgsShowsHelp`
- Validated `inspect`, `inspect --help`, and a partial missing-config case.

### Why

The CLI should be friendly when users discover a command by running it without flags. Required-flag validation was technically correct but poor UX here because it bypassed the richer Glazed/Cobra help rendering.

### What worked

- `css-visual-diff inspect` now prints the full help page, including Usage, Flags, General topics, Examples, and Tutorials.
- `css-visual-diff inspect --help` prints the same help content.
- `css-visual-diff screenshot` with no flags also prints full help.
- Partial missing input still exits non-zero and reports the missing flag.
- Tests pass.

### What didn't work

- The first fix still printed the missing-flag error twice for partial input because Cobra printed the error and `main` printed it again. Setting `SilenceErrors: true` on inspect/artifact commands fixed that.

### What I learned

For Glazed/Cobra commands that should be discoverable through no-arg invocation, manual validation is better than `MarkFlagRequired`. Required flags are appropriate for strict automation commands, but inspect is also an interactive discovery command.

### What was tricky to build

The tricky part was balancing no-arg help with real validation errors. The current behavior is:

- no args: full help, exit 0;
- partial args missing `--config` or `--side`: full help plus one concise error, exit non-zero;
- full args with bad selector/config: normal validation error.

### What warrants a second pair of eyes

- Whether partial missing input should print the full help page or only a short hint.
- Whether other commands (`run`, `compare`, `llm-review`) should adopt the same no-arg help behavior.

### What should be done in the future

- Consider adding command-specific help pages for `inspect` and `screenshot` if the built-in command help is not enough.
- Consider setting a consistent root-level policy for no-arg command behavior.

### Code review instructions

Review:

```text
cmd/css-visual-diff/main.go
cmd/css-visual-diff/main_test.go
```

Validation commands:

```bash
GOWORK=off go test ./...
GOWORK=off go run ./cmd/css-visual-diff inspect
GOWORK=off go run ./cmd/css-visual-diff inspect --help
GOWORK=off go run ./cmd/css-visual-diff screenshot
GOWORK=off go run ./cmd/css-visual-diff inspect --side react --style button-primary
```

## Step 6: Add directory scanning to the existing `run` verb

This step implemented a simpler alternative to the earlier design's proposed `discover` / `run-all` verbs. Instead of adding new top-level commands, `run` now accepts `--config-dir` and recursively scans for co-located config files that use the current low-level schema.

### Prompt Context

**User prompt (verbatim):** "can we add directory scanning to the current verb with a flag? instead of new verbs?"

**Assistant interpretation:** Add scanning to the existing `css-visual-diff run` command, because the previous ticket proposed future `discover`, `plan`, and `run-all` verbs but the user prefers fewer verbs and a simpler CLI surface.

**Inferred user intent:** Keep the co-located config workflow but avoid premature command proliferation. The current `run` command should be able to run one config with `--config` or all co-located configs under a root with a scan flag.

**Commit (code):** `108bab7c897ea7b7e8977704ff078dc9a6d38331` — `feat: scan config directories from run command`.

### What I did

- Added `--config-dir` to `css-visual-diff run`.
- Kept `--config` for explicit single-file execution.
- Made `--config` and `--config-dir` mutually exclusive.
- Implemented recursive scanning for:
  - `*.css-visual-diff.yml`
  - `*.css-visual-diff.yaml`
- Intentionally skipped arbitrary YAML files.
- Intentionally skipped exact project-level names:
  - `.css-visual-diff.yml`
  - `.css-visual-diff.yaml`
- Skipped common generated/vendor/output directories:
  - `.git`, `.hg`, `.svn`, `node_modules`, `vendor`, `dist`, `build`, `.next`, `.turbo`, `coverage`, `.css-visual-diff`
- Sorted discovered paths for deterministic runs.
- Added `config` to run result rows so scan output shows which config produced each row.
- Added tests for discovery and config-dir resolution.
- Updated README and embedded Glazed help topic `config-selectors`.

### Why

The earlier manifest-discovery plan was architecturally useful but too large for the current stage. `run --config-dir` gives the daily workflow benefit immediately while preserving the existing config schema and execution path.

The new workflow is:

```bash
css-visual-diff run --config path/to/one.yaml
css-visual-diff run --config-dir web/packages/pyxis-components/src --dry-run
css-visual-diff run --config-dir web/packages/pyxis-components/src --modes capture,cssdiff,pixeldiff,html-report
```

### What worked

- `GOWORK=off go test ./...` passes.
- `run --help` shows the new `--config-dir` flag.
- A temp dry-run scan found and ran two co-located configs:
  - `Badge/badge.css-visual-diff.yaml`
  - `Button/button.css-visual-diff.yml`
- The JSON output includes the config path for each row.

### What didn't work

One first test attempted to assert Glazed JSON output through `cmd.SetOut`, but Glazed output did not reliably land in that buffer. I changed the test to validate the scanner/config-path resolver directly, which is the deterministic unit under test.

### What I learned

The simplest path is to treat co-located files as ordinary current-schema configs for now. The scanner should not imply a new manifest schema yet.

### What was tricky to build

The naming needed a small future-compatibility decision: exact `.css-visual-diff.yml` looks like the planned project-level config name, so the scanner excludes that exact basename and only runs named co-located configs like `button-primary.css-visual-diff.yml`.

### What warrants a second pair of eyes

- Whether excluding exact `.css-visual-diff.yml` is right for all projects.
- Whether `run --config-dir` should eventually support `--continue-on-error` for large batches.
- Whether scan results should be emitted before execution as explicit `type=config` rows.

### What should be done in the future

- Add `--continue-on-error` if batch runs should collect all failures in one invocation.
- Consider `--include` / `--exclude` filters once real project directories have many configs.
- Consider `inspect --config-dir` later only if there is a clear repeated selector use case.

### Code review instructions

Review:

```text
cmd/css-visual-diff/main.go
cmd/css-visual-diff/main_test.go
README.md
internal/cssvisualdiff/doc/topics/config-selectors.md
```

Validation commands:

```bash
GOWORK=off go test ./...
GOWORK=off go run ./cmd/css-visual-diff run --help
GOWORK=off go run ./cmd/css-visual-diff run --config-dir /path/to/root --dry-run --output json
GOWORK=off go run ./cmd/css-visual-diff help config-selectors
```

## Step 7: Add tutorial for authoring story configs with inspect

This step added a new embedded Glazed help tutorial that explains the full daily workflow from one Storybook story to a correct co-located `*.css-visual-diff.yml` file, then to single-config and directory-scanned comparison runs.

### Prompt Context

**User prompt (verbatim):** "write a tutorial glazed help entry on using inspect and iterating until one writes the right .css-visual-diff.yml for a story and putting the files in these subdirs and then running the proper comparison"

**Assistant interpretation:** Add a new `SectionType: Tutorial` help entry, not just README prose, that teaches the recommended authoring loop after the new inspect and `run --config-dir` features.

**Inferred user intent:** Make the workflow discoverable inside the CLI: create a story-specific config next to the component, inspect HTML/screenshot/CSS one side at a time, refine selectors, then run `run --config` or `run --config-dir` for the real comparison.

**Commit (docs):** `c872359ff2a7e7271c2605ae0abe8f6670d8486c` — `docs: add story config authoring tutorial`.

### What I did

- Added `internal/cssvisualdiff/doc/tutorials/story-config-authoring.md`.
- Chose `SectionType: Tutorial` with slug `story-config-authoring`.
- Covered:
  - component/story subdirectory layout,
  - scanner naming conventions,
  - minimal current-schema `.css-visual-diff.yml`,
  - `html --root` inspection,
  - `screenshot --section` iteration,
  - `css-md --style` iteration,
  - using ad-hoc `--selector` before promoting selectors into YAML,
  - bundle inspection,
  - `run --config ... --dry-run`,
  - proper comparison with `capture,cssdiff,pixeldiff,html-report`,
  - batch comparison with `run --config-dir`,
  - troubleshooting and see-also links.
- Validated that the embedded help entry parses and is discoverable.

### Why

The implemented features are useful only if users know the loop. This tutorial turns the scattered command examples into a repeatable workflow: inspect first, write the config second, run comparison last.

### What worked

- `GOWORK=off go test ./...` passes.
- `GOWORK=off go run ./cmd/css-visual-diff help story-config-authoring` renders the tutorial.
- `GOWORK=off go run ./cmd/css-visual-diff help` lists `story-config-authoring` under tutorials.

### What didn't work

No implementation errors. The rendered terminal help wraps long inline code such as `.css-visual-diff.yml`, which is expected from the current help renderer.

### What I learned

This tutorial is the clearest bridge between the original agility ticket and the simplicity-first implementation. It documents co-located configs without introducing a new manifest schema.

### What warrants a second pair of eyes

- Whether the example `prepare.script` should be Pyxis-specific or made more generic.
- Whether the tutorial should mention `direct-react-global` as a cleaner alternative in the main flow or keep that for the prepared-targets docs.

### What should be done in the future

- Add a short example help page for `run --config-dir` once include/exclude or continue-on-error flags exist.
- Consider adding `--open` to make the tutorial's artifact review steps faster.

### Code review instructions

Review:

```text
internal/cssvisualdiff/doc/tutorials/story-config-authoring.md
```

Validation commands:

```bash
GOWORK=off go test ./...
GOWORK=off go run ./cmd/css-visual-diff help story-config-authoring
GOWORK=off go run ./cmd/css-visual-diff help | rg story-config-authoring
```
