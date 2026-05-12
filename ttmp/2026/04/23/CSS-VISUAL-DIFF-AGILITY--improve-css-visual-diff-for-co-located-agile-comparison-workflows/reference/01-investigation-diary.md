---
Title: Investigation diary
Ticket: CSS-VISUAL-DIFF-AGILITY
Status: active
Topics:
    - tooling
    - visual-regression
    - browser-automation
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../../../../code/wesen/2026-04-23--pyxis/ttmp/2026/04/23/PYXIS-SCREENSHOT-EXTRACTION--pyxis-screenshot-css-extraction-from-prototype-html/scripts/10-atom-original-prepare.js
      Note: Observed custom prototype atom prepare script that recipe support should replace.
    - Path: ../../../../../../../../../../code/wesen/2026-04-23--pyxis/ttmp/2026/04/23/PYXIS-SCREENSHOT-EXTRACTION--pyxis-screenshot-css-extraction-from-prototype-html/scripts/11-run-pyxis-atom-diff.sh
      Note: Observed Pyxis atom wrapper script with Storybook restart/wait and css-visual-diff invocation.
    - Path: ../../../../../../../../../../code/wesen/2026-04-23--pyxis/web/packages/pyxis-components/src/atoms/Button/Button.stories.tsx
      Note: Observed Storybook variants showing why fixture-only comparison is insufficient.
    - Path: ../../../../../../../../../../code/wesen/2026-04-23--pyxis/web/packages/pyxis-components/src/tokens/tokens.css
      Note: Observed React-side CSS tokens used for token-aware diff examples.
ExternalSources: []
Summary: Chronological diary for the css-visual-diff agility improvement analysis ticket, including ticket setup, evidence gathering, design writing, validation, and reMarkable delivery steps.
LastUpdated: 2026-04-23T20:41:01.024248548-04:00
WhatFor: Use this to understand how the analysis was produced, what evidence was inspected, what commands were run, and how to continue implementation work.
WhenToUse: Use when resuming CSS-VISUAL-DIFF-AGILITY, reviewing the design doc, or preparing implementation follow-up tasks.
---


# Diary

## Goal

This diary records the creation of a new docmgr ticket and a detailed implementation guide for improving `css-visual-diff` after real Pyxis usage exposed workflow friction.

## Step 1: Create ticket and inspect current system

I created a new docmgr ticket for the requested improvement work, then inspected both the `css-visual-diff` repository and the Pyxis usage scripts/configs that motivated the request. The key outcome was an evidence-backed map of the current CLI, config schema, prepare pipeline, capture/CSS/pixel/report modes, Storybook support, and external wrapper scripts.

This step did not change product code. It established the ticket workspace and collected source references for the design document.

### Prompt Context

**User prompt (verbatim):**

```text
Create a new docmgr ticket to improve css-visual-diff after it has been used a bit in another project. 

We have been using it in this rough manner:

───────────────────────────────────                                                                                                                           
                                                                                                                                                                                                            
 4. The diff configs & invocation scripts (current css-visual-diff usage)                                                                                                                                   
                                                                                                                                                                                                            
 These live under the ticket directory but are committed in this repo:                                                                                                                                      
                                                                                                                                                                                                            
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────┐ 
 │ File                                                                                                │ Why it matters                                                                                   │ 
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤ 
 │ ttmp/2026/04/23/PYXIS-SCREENSHOT-EXTRACTION--pyxis-screenshot-css-extraction-from-prototype-html/sc │ Atom diff entrypoint. Restarts Storybook, waits 90s for indexing, runs css-visual-diff run       │ 
 │ ripts/11-run-pyxis-atom-diff.sh                                                                     │ --config ..., prints summary.                                                                    │ 
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤ 
 │ ttmp/2026/04/23/PYXIS-SCREENSHOT-EXTRACTION--pyxis-screenshot-css-extraction-from-prototype-html/sc │ Page diff entrypoint. Similar pattern but for user-site Storybook on port 6007.                  │ 
 │ ripts/14-run-pyxis-storybook-shows-desktop.sh                                                       │                                                                                                  │ 
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤ 
 │ ttmp/2026/04/23/PYXIS-SCREENSHOT-EXTRACTION--pyxis-screenshot-css-extraction-from-prototype-html/sc │ Prototype prepare script. Injected into the prototype page via Playwright. Clears DesignCanvas   │ 
 │ ripts/10-atom-original-prepare.js                                                                   │ DOM, renders prototype atoms into #atom-capture-root.                                            │ 
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤ 
 │ ttmp/2026/04/23/PYXIS-SCREENSHOT-EXTRACTION--pyxis-screenshot-css-extraction-from-prototype-html/sc │ Serves prototype-design/ on port 7070.                                                           │ 
 │ ripts/05-serve-pyxis-prototype.sh                                                                   │                                                                                                  │ 
 └─────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────

---

These are the configs:

                                                                                                                                                                                                            
 5. The css-visual-diff configs (in the other repo)                                                                                                                                                         
                                                                                                                                                                                                            
 These are not in this workspace, but your colleague needs to know they exist:                                                                                                                              
                                                                                                                                                                                                            
 ┌──────────────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ 
 │ File                                                                                     │ Why it matters                                                                                              │ 
 ├──────────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
 │ /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/examples/pyxis-atoms-prototyp │ Atom diff config. Defines original (prototype + prepare) and react (Storybook fixture) targets, plus 23     │ 
 │ e-vs-storybook.yaml                                                                      │ sections and 9 style comparisons.                                                                           │ 
 ├──────────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
 │ /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/examples/pyxis-storybook-show │ Page diff config. Uses direct-react-global prepare type for the prototype, compares full page +             │ 
 │ s-desktop.yaml                                                                           │ nav/main/footer sections.                                                                                   │ 
 └──────────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ 
                                                                  

---


We want to be a bit more agile, and be able to provide for example some of these features.
---

(although here I think we should discover files called XXX.css-visual-diff.yml so that we can have multiple per directory, with different widgets or settings?

                                                                                                                                                                                                         
 1. Co-located diff manifests (biggest simplicity win)                                                                                                                                                      
                                                                                                                                                                                                            
 Right now you have one giant YAML in css-visual-diff/examples/ that references files across two repos. That's hard to discover and easy to drift.                                                          
                                                                                                                                                                                                            
 Instead: Each component directory gets a tiny manifest:                                                                                                                                                    
                                                                                                                                                                                                            
 ```yaml                                                                                                                                                                                                    
   # web/packages/pyxis-components/src/atoms/Button/.diff.yaml                                                                                                                                              
   prototype:                                                                                                                                                                                               
     prepare: atom-fixture          # references a shared prepare recipe                                                                                                                                     
     selector: "[data-comp='button-primary'] button"                                                                                                                                                        
                                                                                                                                                                                                            
   storybook:                                                                                                                                                                                               
     story: atoms-button--default   # Storybook story ID                                                                                                                                                    
                                                                                                                                                                                                            
   compare:                                                                                                                                                                                                 
     props: [background-color, color, border-radius, height, padding, font-size, font-weight]                                                                                                               
     viewport: { width: 1200, height: 200 }                                                                                                                                                                 
 ```                                                                                                                                                                                                        
                                                                                                                                                                                                            
 ```yaml                                                                                                                                                                                                    
   # web/packages/pyxis-components/src/public/PubHero/.diff.yaml                                                                                                                                            
   prototype:                                                                                                                                                                                               
     prepare: page-shows            # render PPXDesktop with page: shows                                                                                                                                     
     selector: "[data-part='pub-hero']"                                                                                                                                                                     
                                                                                                                                                                                                            
   storybook:                                                                                                                                                                                               
     story: public-pubhero--default                                                                                                                                                                         
                                                                                                                                                                                                            
   compare:                                                                                                                                                                                                 
     props: [padding, gap, font-family, font-size, background]                                                                                                                                              
     sections:                                                                                                                                                                                              
       - name: date-block                                                                                                                                                                                   
         selector: ".pyxis-hero__date"                                                                                                                                                                      
       - name: content                                                                                                                                                                                       
         selector: ".pyxis-hero__content"                                                                                                                                                                   
 ```                                                                       

---

                                                                                        
                                                                                                                                                                                                            
 4. Component story mapping, not just fixtures                                                                                                                                                              
                                                                                                                                                                                                            
 The current atom diff only compares the AtomDiffFixture — one big grid. That's useful but masks problems in individual stories.                                                                            
                                                                                                                                                                                                            
 Instead: The tool understands Storybook story IDs. For each .diff.yaml, it captures:                                                                                                                       
 - The specific story (atoms-button--primary)                                                                                                                                                               
 - The play function state if relevant                                                                                                                                                                      
 - Each variant declared in the story file                                                                                                                                                                  
                                                                                                                                                                                                            
 So if you have:                                                                                                                                                                                            
                                                                                                                                                                                                            
 ```tsx                                                                                                                                                                                                     
   export const Primary = { args: { variant: 'primary' } };                                                                                                                                                 
   export const Outline = { args: { variant: 'outline' } };                                                                                                                                                 
   export const Loading = { args: { isLoading: true } };                                                                                                                                                    
 ```                                                                                                                                                                                                        
                                                                                                                                                                                                            
 The tool automatically compares all three against the prototype's equivalent states. No more "the fixture looks fine but the individual story is broken."          

---

                                                                                                                                                                                                     
 5. Smart prepare recipes                                                                                                                                                                                   
                                                                                                                                                                                                            
 The current prepare system is powerful but fragile:                                                                                                                                                        
                                                                                                                                                                                                            
 ```yaml                                                                                                                                                                                                    
   prepare:                                                                                                                                                                                                 
     type: script                                                                                                                                                                                           
     wait_for: "window.React && window.ReactDOM && window.Btn && window.Badge..."                                                                                                                            
 ```                                                                                                                                                                                                        
                                                                                                                                                                                                            
 Instead: Standardized recipes:                                                                                                                                                                             
                                                                                                                                                                                                            
 ```yaml                                                                                                                                                                                                    
   # In css-visual-diff config                                                                                                                                                                              
   prepare_recipes:                                                                                                                                                                                         
     atom-fixture:                                                                                                                                                                                          
       type: prototype-component-grid                                                                                                                                                                       
       components: [Btn, Badge, Tag, Avatar, Icon, Input, Select]                                                                                                                                            
       layout: rows                                                                                                                                                                                         
       background: "#F3F1EB"                                                                                                                                                                                
                                                                                                                                                                                                            
     page-shows:                                                                                                                                                                                            
       type: prototype-page                                                                                                                                                                                 
       component: PPXDesktop                                                                                                                                                                                
       props: { page: shows }                                                                                                                                                                               
       width: 920                                                                                                                                                                                           
       background: "#fff"                                                                                                                                                                                   
 ```                                                                                                                                                                                               
The tool knows how to call PPXDesktop({ page: 'shows' }) via Playwright's page.evaluate() — no more custom JS files. If the prototype API changes, you update one recipe, not 10 scripts.

---

 6. Baseline caching (don't re-capture the prototype every time)                                                                                                                                            
                                                                                                                                                                                                            
 The prototype doesn't change during a Pyxis editing session. But the current script captures it fresh on every run.                                                                                        
                                                                                                                                                                                                            
 Instead:                                                                                                                                                                                                   
 - First run: capture prototype side, cache as .css-visual-diff/baselines/prototype-button-primary.png                                                                                                      
 - Subsequent runs: use cached prototype, only re-capture Storybook side                                                                                                                                    
 - --reset-baselines flag when the prototype actually updates                                                                                                                                               
                                                                                                                                                                                                            
 This cuts comparison time by ~50%.                                                                                                                                                                         
                                                                                                                                                                                                            
 ────────────────────────────────────────────────────────────────────────────────                                                                                                                           
                                                                                                                                                                                                            
 7. Token-aware CSS diffing                                                                                                                                                                                 
                                                                                                                                                                                                            
 Right now the tool tells you:                                                                                                                                                                              
                                                                                                                                                                                                            
 ```                                                                                                                                                                                                        
   border-radius: 6px (original) vs 8px (react)                                                                                                                                                             
 ```                                                                                                                                                                                                        
                                                                                                                                                                                                            
 That's true but not actionable. I'd add token resolution:                                                                                                                                                  
                                                                                                                                                                                                            
 ```                                                                                                                                                                                                        
   border-radius: 6px (original)                                                                                                                                                                            
              → from prototype-design/lib/tokens.js: radius.md = 6                                                                                                                                          
                                                                                                                                                                                                            
   border-radius: 8px (react)                                                                                                                                                                               
              → from pyxis-components/src/tokens/tokens.css: --radius-md = 8px                                                                                                                              
              → OR from inline style in Button.tsx: borderRadius: 8                                                                                                                                         
 ```                                                                                                                                                                                                        
                                                                                                                                                                                                            
 This tells you immediately: "The tokens are just different values" vs "The React component is ignoring the token and hardcoding something."                                                                
                                                                                                                                                         

---

Analyze the situation, write an analysis document, reate a detailed analysis / design / implementation guide that is very detailed for a new intern, explaining all the parts of the system needed to understand what it is, with prose paragraphs and bullet point sand pseudocode and diagrams and api references and file
  references.
  It should be very clear and detailed. Store in the ticket and the nupload to remarkable.
```

**Assistant interpretation:** Create a docmgr ticket, investigate the current `css-visual-diff` implementation and Pyxis usage evidence, write an intern-friendly architecture/design/implementation guide for the requested agility improvements, store it in the ticket, validate it, and upload the document bundle to reMarkable.

**Inferred user intent:** Turn a one-off exploratory workflow into a structured follow-up ticket that a future implementer can use to improve `css-visual-diff` without rediscovering current behavior or losing context from Pyxis.

**Commit (code):** N/A — documentation-only work; no source code was modified.

### What I did

- Loaded the `ticket-research-docmgr-remarkable`, `docmgr`, `diary`, and `remarkable-upload` skill instructions.
- Ran `docmgr status --summary-only` to identify the active docs root.
- Created ticket `CSS-VISUAL-DIFF-AGILITY` with topics `tooling,visual-regression,browser-automation`.
- Added the primary design doc and this investigation diary.
- Inspected current `css-visual-diff` files:
  - `README.md`
  - `AGENT.md`
  - `cmd/css-visual-diff/main.go`
  - `internal/cssvisualdiff/config/config.go`
  - `internal/cssvisualdiff/modes/prepare.go`
  - `internal/cssvisualdiff/modes/capture.go`
  - `internal/cssvisualdiff/modes/cssdiff.go`
  - `internal/cssvisualdiff/modes/matched_styles.go`
  - `internal/cssvisualdiff/modes/pixeldiff.go`
  - `internal/cssvisualdiff/modes/stories.go`
  - `internal/cssvisualdiff/modes/html_report.go`
  - `internal/cssvisualdiff/runner/runner.go`
  - relevant tests under `config` and `modes`.
- Inspected current Pyxis usage scripts:
  - `05-serve-pyxis-prototype.sh`
  - `10-atom-original-prepare.js`
  - `11-run-pyxis-atom-diff.sh`
  - `14-run-pyxis-storybook-shows-desktop.sh`
- Inspected Pyxis Storybook/tokens evidence:
  - `Button.stories.tsx`
  - `PublicPages.stories.tsx`
  - `tokens.css`
  - `tokens.ts`
- Ran `cd css-visual-diff && GOWORK=off go test ./...`.

### Why

The design guide needed to be evidence-backed. The user specifically asked for a document clear enough for a new intern, so the work had to map current behavior before proposing new features.

### What worked

- `docmgr ticket create-ticket` created the ticket workspace successfully.
- `docmgr doc add` created the design doc and diary documents successfully.
- The Pyxis ticket directory referenced by the user exists locally, including the scripts named in the prompt.
- `GOWORK=off go test ./...` passed for `css-visual-diff`.

### What didn't work

- One `rg` command intended to search CSS/TS files used a pattern beginning with `--` and was parsed as a flag. I reran the search with adjusted arguments and still collected the needed token references.
- The active docmgr root for this workspace is `hair-booking/ttmp` via `.ttmp.yaml`, not `css-visual-diff/ttmp`. I stored the ticket under the active docmgr root.

### What I learned

- The current `css-visual-diff` runner is already a good low-level execution backend.
- The most valuable near-term refactor is a compile/discovery layer in front of the current config, not a rewrite of the capture modes.
- Storybook support already has an index-fetching seed in `modes/stories.go`, but it is currently a reporting mode rather than a planning/resolution API.
- Prepare recipes should compile to the current `PrepareSpec` model so existing browser execution code can remain stable.

### What was tricky to build

The main tricky part was separating the user's desired product features from implementation ordering. Baseline caching and token-aware reports are valuable, but they depend on the manifest/project compiler and on some capture/CSS refactors. The design therefore recommends starting with manifest discovery and plan compilation before touching runtime caching or token annotation.

Another tricky point is that Storybook variants can mean multiple things. Some variants are separate Storybook exports and naturally appear in `/index.json`; other variants are arg matrices inside a single story. The design recommends resolving exported stories first and treating arg-matrix automation as a later explicit feature.

### What warrants a second pair of eyes

- The final naming of project config files (`.css-visual-diff.yml` versus `css-visual-diff.project.yml`).
- Whether `css-visual-diff` should eventually manage Storybook/prototype process startup or only validate readiness.
- How aggressive baseline cache reuse should be by default.
- How much TypeScript token parsing is worth doing in the first token-aware CSS diff implementation.

### What should be done in the future

- Implement Phase 1 from the design doc: manifest structs, validation, discovery, and `discover` CLI output.
- Add a fake Storybook `index.json` fixture for story resolver tests.
- Create one real Pyxis `button-primary.css-visual-diff.yml` after the manifest compiler exists.

### Code review instructions

- Start by reading the design doc in this ticket.
- Then inspect the current execution backend:
  - `css-visual-diff/internal/cssvisualdiff/config/config.go`
  - `css-visual-diff/internal/cssvisualdiff/runner/runner.go`
  - `css-visual-diff/internal/cssvisualdiff/modes/capture.go`
  - `css-visual-diff/internal/cssvisualdiff/modes/prepare.go`
- Validate current behavior with:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go test ./...
```

### Technical details

Ticket path:

```text
/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-AGILITY--improve-css-visual-diff-for-co-located-agile-comparison-workflows
```

Primary design doc:

```text
/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-AGILITY--improve-css-visual-diff-for-co-located-agile-comparison-workflows/design-doc/01-css-visual-diff-agility-improvement-analysis-and-implementation-guide.md
```

Current validation command result:

```text
cd css-visual-diff && GOWORK=off go test ./...
ok  	github.com/go-go-golems/css-visual-diff/cmd/css-visual-diff	(cached)
?   	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/ai	[no test files]
ok  	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/config	0.009s
?   	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/driver	[no test files]
ok  	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/dsl	3.506s
ok  	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/llm	(cached)
ok  	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/modes	0.006s
?   	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/runner	[no test files]
?   	github.com/go-go-golems/css-visual-diff/internal/cssvisualdiff/services	[no test files]
?   	github.com/go-go-golems/css-visual-diff/pkg	[no test files]
```

## Step 2: Reframe the roadmap around an inspect-first workflow

The user pushed back in a useful direction: instead of starting with the broad manifest/project/story/baseline/token roadmap, the next implementation slice should be smaller and more immediately useful. I wrote a second design document that centers the workflow on one verb: load a `XXX.css-visual-diff.yml` file, inspect one side/selector, and write screenshot, prepared HTML, and computed CSS artifacts.

This reframing keeps the existing comparator engine but exposes a smaller internal step as a first-class command. It should make YAML authoring and selector/prepare debugging much faster before the team builds shorthand manifests, Storybook resolution, baseline caching, or token-aware reports.

### Prompt Context

**User prompt (verbatim):**

```text
i think we should approach this in small steps too:

- take a XXX.css-visual-diff.yml page and have a verb to get the screenshot / html / css
- that way we can iterate on a yml until it works

build on further.

What do you think, what is the status of css-visual-diff right now, and what do you think we can consolidate / cut / reframe? 

Create a second detailed analkysis like this, focusing on simplicity, effectiveness, removing potentially overcomplexified features.
```

**Assistant interpretation:** Write a second analysis in the same ticket that narrows the roadmap to an inspect-first MVP and explicitly identifies which current or proposed features should be kept, deferred, consolidated, hidden, or cut.

**Inferred user intent:** Avoid overbuilding an abstract manifest framework before the basic YAML iteration loop is good; prioritize a small command that makes screenshot/HTML/CSS debugging immediate.

**Commit (code):** N/A — documentation-only work; no source code was modified.

### What I did

- Added design doc `02-simplicity-first-css-visual-diff-workflow-analysis.md` to ticket `CSS-VISUAL-DIFF-AGILITY`.
- Re-ran repository-oriented command discovery for current commands, modes, and schemas.
- Ran CLI help for `css-visual-diff` and `css-visual-diff run` to confirm current user-facing command shape.
- Wrote a second design that recommends adding `css-visual-diff inspect --config XXX.css-visual-diff.yml --side original|react` before implementing shorthand manifests/project config/story mapping/baselines/tokens.

### Why

The previous design was comprehensive, but the user's proposed inspect-first loop is a better next implementation slice. It addresses the most common failure mode: the YAML is not yet correct, so the user needs to see exactly what one target rendered before comparing both sides.

### What worked

- `docmgr doc add` created the second design doc successfully.
- Current CLI help confirmed the product surface is still centered on `run`, `compare`, `llm-review`, `chromedp-probe`, and `script`.
- The current code already has most primitives needed for `inspect`: target config, browser driver, prepare execution, screenshot capture, prepared HTML writing, inspect JSON writing, and computed style evaluation.

### What didn't work

- No implementation was attempted in this step.
- The analysis assumes `writePreparedHTML`, `writeInspectJSON`, and `evaluateStyle` can be refactored/exported cleanly; this should be validated during implementation.

### What I learned

- The simplest useful improvement is not a new manifest schema. It is a new command over the current schema.
- A file can already be co-located and named `button.css-visual-diff.yml` while still using the current full config shape.
- The inspect-first command gives immediate value and de-risks later shorthand manifests, prepare recipes, Storybook resolution, baseline caching, and token-aware CSS annotations.

### What was tricky to build

The tricky part was deciding what to defer without discarding useful future ideas. The second design keeps the broad roadmap but changes the order: inspect one side first, compare second, report third, automate later. This means some appealing features, especially baseline caching and token-aware diffing, are intentionally not first.

### What warrants a second pair of eyes

- Command name: `inspect`, `snapshot`, or `capture-one`.
- Whether `inspect` should live under `modes` or a new package.
- Whether `full` mode should stop including `ai-review` by default.
- Whether the embedded `script` command group should be hidden or moved under `experimental`.

### What should be done in the future

- Implement the first PR from the simplicity doc: `inspect --config FILE --side original|react`.
- Make `inspect` always write prepared HTML even if the selector screenshot fails.
- Add selector/style resolution tests before adding browser integration tests.

### Code review instructions

- Review `design-doc/02-simplicity-first-css-visual-diff-workflow-analysis.md` first.
- Then inspect:
  - `css-visual-diff/cmd/css-visual-diff/main.go`
  - `css-visual-diff/internal/cssvisualdiff/modes/capture.go`
  - `css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go`
  - `css-visual-diff/internal/cssvisualdiff/modes/prepare.go`
- Validate current command surface with:

```bash
cd /home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff
GOWORK=off go run ./cmd/css-visual-diff --help
GOWORK=off go run ./cmd/css-visual-diff run --help
```

### Technical details

Second design doc:

```text
/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/23/CSS-VISUAL-DIFF-AGILITY--improve-css-visual-diff-for-co-located-agile-comparison-workflows/design-doc/02-simplicity-first-css-visual-diff-workflow-analysis.md
```
