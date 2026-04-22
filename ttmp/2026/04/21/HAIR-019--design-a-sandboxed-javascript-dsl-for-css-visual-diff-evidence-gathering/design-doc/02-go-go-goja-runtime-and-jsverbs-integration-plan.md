---
Title: go-go-goja runtime and jsverbs integration plan
Ticket: HAIR-019
Status: active
Topics:
    - tooling
    - browser-automation
    - chromedp
    - visual-regression
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ../../../../../../../css-visual-diff/cmd/css-visual-diff/main.go
      Note: Root command now integrates generated jsverbs commands and root-level logging flags
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/dsl/host.go
      Note: Concrete host implementation that scans embedded scripts and creates caller-owned runtimes
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/dsl/host_test.go
      Note: Integration tests covering embedded verb discovery and execution
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/dsl/registrar.go
      Note: Runtime-scoped diff/report module registration and option decoding
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/dsl/scripts/compare.js
      Note: First embedded default script verbs exposed as full commands
    - Path: ../../../../../../../css-visual-diff/internal/cssvisualdiff/services/agent_brief.go
      Note: Deterministic concise report builder used by the script-backed brief verb
    - Path: ../../../../../../../go-go-goja/cmd/jsverbs-example/main.go
      Note: Reference root-command integration with logging flags and generated verbs
    - Path: ../../../../../../../go-go-goja/engine/factory.go
      Note: Explicit runtime builder/factory composition model to reuse in css-visual-diff
    - Path: ../../../../../../../go-go-goja/engine/module_specs.go
      Note: ModuleSpec and DefaultRegistryModules composition hooks
    - Path: ../../../../../../../go-go-goja/engine/runtime.go
      Note: Owned runtime lifecycle and cleanup semantics for caller-owned script runtimes
    - Path: ../../../../../../../go-go-goja/engine/runtime_modules.go
      Note: Runtime module registrar seam for css-visual-diff host modules
    - Path: ../../../../../../../go-go-goja/pkg/doc/10-jsverbs-example-developer-guide.md
      Note: Intern-facing explanation of the command-construction pipeline
    - Path: ../../../../../../../go-go-goja/pkg/doc/bun-goja-bundling-playbook.md
      Note: Evidence that go-go-goja already supports embedded/bundled source loading patterns
    - Path: ../../../../../../../go-go-goja/pkg/jsverbs/command.go
      Note: Compilation of scanned verbs into real Glazed commands
    - Path: ../../../../../../../go-go-goja/pkg/jsverbs/runtime.go
      Note: Custom runtime invocation path and registry-backed require loader
    - Path: ../../../../../../../go-go-goja/pkg/jsverbs/scan.go
      Note: Static JS scanning over directories
    - Path: ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/scripts/01_go_go_goja_jsverbs_smoke.sh
      Note: Ticket-local experiment validating jsverbs CLI behavior and debug logging
ExternalSources: []
Summary: Detailed intern-grade guide for using go-go-goja and pkg/jsverbs to host the css-visual-diff JavaScript DSL, ship embedded default scripts, and expose them as full Glazed/Cobra verbs with standard logging flags.
LastUpdated: 2026-04-21T22:18:00-04:00
WhatFor: Explain how css-visual-diff should reuse go-go-goja runtime composition and jsverbs command compilation instead of inventing a new JavaScript-hosting stack.
WhenToUse: Use when implementing the script runtime and command registration layers for css-visual-diff.
---



# Executive Summary

The first HAIR-019 design document proposed the *shape* of a sandboxed JavaScript DSL for `css-visual-diff`: small task-specific scripts, Go-backed primitives, concise structured output, and optional visual-LLM handoff. This second document answers a more concrete implementation question: **how should `css-visual-diff` actually host that DSL?** After studying `go-go-goja` closely, the answer is that we should reuse its explicit runtime-composition model (`engine.NewBuilder() -> Build() -> Factory.NewRuntime(...)`) and its `pkg/jsverbs` package for scanning JavaScript source, compiling functions into full Glazed commands, and invoking those functions inside a Goja runtime.

That recommendation is grounded in three strong pieces of evidence from `go-go-goja`. First, the runtime builder/factory API already solves lifecycle ownership, require-loader composition, runtime module registration, runtime-scoped initializers, and owner-thread coordination for async work (`/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/factory.go:16-230`, `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/runtime.go:24-115`). Second, the `pkg/jsverbs` package already scans JavaScript metadata without executing it, compiles those results into Glazed commands, and can either create its own runtime or invoke commands inside a caller-owned runtime (`/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/scan.go:17-332`, `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/command.go:22-405`, `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/runtime.go:18-288`). Third, the example binary already demonstrates how to expose those scanned verbs as “real” Cobra/Glazed commands with logging flags like `--log-level debug` (`/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/cmd/jsverbs-example/main.go:23-95`).

So the correct architectural move for `css-visual-diff` is **not** to invent a separate scripting runtime from scratch. It is to adapt `go-go-goja`'s engine and `jsverbs` layers into a `css-visual-diff` host application with custom runtime module registrars, shared sections, embedded default scripts, and domain-specific JS verbs such as `compareRegion`, `snapshotRegion`, `explainDiff`, and `topChangedRegions`. This document explains exactly how to do that.

An initial implementation slice has now landed in `css-visual-diff` using that approach. The current code lives in:

- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/embed.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/host.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/registrar.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/dsl/scripts/compare.js`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/services/agent_brief.go`

That first slice proves the viability of the architecture: embedded scripts are scanned into commands, a caller-owned go-go-goja runtime is built per invocation, runtime-scoped `diff` and `report` modules are registered, and the generated verbs show up under the main `css-visual-diff` Cobra root with standard Glazed logging flags.

---

# 1. Problem Statement

The first DSL design document answered *what the JS API should feel like*. This document answers *how the runtime should be built and how those scripts should become actual CLI verbs*.

The implementation problem has four subproblems:

1. How do we create a safe JavaScript runtime with explicit lifecycle and Go-backed host modules?
2. How do we scan JavaScript source and turn functions into full Glazed commands rather than ad hoc script execution?
3. How do we ship embedded default scripts inside `css-visual-diff` while still allowing caller-provided source trees later?
4. How do we register those script-backed commands under a normal Cobra root command with standard Glazed logging flags such as `--log-level debug`?

The core requirement is that a new intern should be able to trace the full path:

```text
embedded JS source
  -> scan metadata
  -> build command schema
  -> create runtime
  -> register Go-backed host modules
  -> invoke one JS function with parsed values
  -> return structured output through Glazed
```

---

# 2. Why go-go-goja Is the Right Host Runtime

## 2.1 The runtime composition model is already explicit and safe

The most important file in `go-go-goja` for this problem is:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/factory.go`

This file shows that `go-go-goja` is built around **explicit runtime composition**, not hidden global state.

The current flow is:

1. create `FactoryBuilder` (`factory.go:16-25`, `factory.go:35-46`)
2. append module specs, runtime module registrars, runtime initializers, and require options (`factory.go:57-84`)
3. validate and freeze into a `Factory` (`factory.go:101-150`)
4. create a concrete runtime with `Factory.NewRuntime(ctx)` (`factory.go:152-230`)

That is exactly the shape we need for `css-visual-diff`, because our future JS DSL runtime will need to compose:

- a require loader for embedded scripts,
- built-in native modules from `go-go-goja`,
- `css-visual-diff`-specific runtime modules like `page`, `diff`, `report`, and later `llm`,
- possible runtime initializers for shared global state,
- and explicit cleanup hooks for browser pools or artifact stores.

## 2.2 Runtime lifecycle is explicit and caller-owned

The runtime object lives in:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/runtime.go`

It owns:

- `VM`
- `Require`
- `Loop`
- `Owner`
- `Values`
- runtime-scoped context and close hooks (`runtime.go:24-39`)

The runtime has:

- `Value(key)` getter for runtime-scoped values (`runtime.go:41-48`)
- `Context()` for the runtime lifecycle context (`runtime.go:50-56`)
- `AddCloser(...)` for cleanup hooks (`runtime.go:58-76`)
- `Close(ctx)` for teardown (`runtime.go:78-115`)

This matters because `css-visual-diff` will eventually own resources that go beyond the JS VM itself, such as:

- browser instances or per-command pages,
- artifact stores or temp directories,
- optional LLM clients,
- trace/log hooks.

An intern implementing the DSL should not have to invent a new runtime ownership protocol. `go-go-goja` already has one.

## 2.3 Owner-thread coordination is already solved

The asynchronous safety story in `go-go-goja` is not hand-wavy. It is captured in:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/runtimeowner/runner.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/runtimebridge/runtimebridge.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/03-async-patterns.md`

The runtime owner model exists because the Goja VM is single-threaded. All JS-facing work has to happen on the VM owner goroutine. The `runtimeowner.Runner` provides:

- `Call(...)` for request/response owner-thread execution (`runner.go:62-106`)
- `Post(...)` for fire-and-forget owner-thread settlement (`runner.go:108-159`)
- panic recovery and shutdown semantics (`runner.go:161-189`)

The runtime bridge stores owner/loop/context bindings per VM (`runtimebridge.go:12-52`).

This is extremely relevant to `css-visual-diff` because our future host modules may need async patterns for:

- waiting on browser events,
- scheduling promise resolution after background pixel diff computation,
- later calling external LLMs while settling results back on the VM thread.

So the async model is not something we should invent in parallel. We should reuse the existing one.

---

# 3. Why pkg/jsverbs Is the Right Command Layer

## 3.1 It already solves static discovery without executing source

The scanner lives in:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/scan.go`

Important entrypoints:

- `ScanDir(...)` (`scan.go:17-74`)
- `ScanFS(...)` (`scan.go:76-124`)
- `ScanSource(...)` (`scan.go:126-128`)
- `ScanSources(...)` (`scan.go:130-150`)

This is ideal for `css-visual-diff` because we need **embedded default scripts**. `ScanFS(...)` and `ScanSources(...)` mean the subsystem already understands how to scan:

- real directories,
- arbitrary `fs.FS` instances like `embed.FS`,
- synthetic source in memory.

That means default embedded DSL verbs can be scanned directly from Go-embedded assets without copying them to disk first.

## 3.2 It already has a rich metadata model

The in-memory model is in:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/model.go`

Key types:

- `Registry` (`model.go:74-84`)
- `FileSpec` (`model.go:86-98`)
- `PackageSpec` (`model.go:100-106`)
- `FunctionSpec` (`model.go:108-118`)
- `SectionSpec` (`model.go:120-125`)
- `FieldSpec` (`model.go:127-138`)
- `VerbSpec` (`model.go:140-152`)

This is already close to what `css-visual-diff` needs for a script-backed command surface. The metadata model supports:

- package/group metadata,
- shared and file-local sections,
- field definitions,
- explicit output mode,
- parent command groups,
- tags and docs.

That is much better than inventing a custom comment format or raw JSON manifest just for `css-visual-diff`.

## 3.3 It already compiles JS functions into real Glazed commands

The command compiler is in:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/command.go`

The important entrypoints are:

- `Registry.Commands()` (`command.go:41-43`)
- `Registry.CommandsWithInvoker(...)` (`command.go:45-59`)
- `Registry.CommandForVerb(...)` (`command.go:67-70`)
- `Registry.CommandForVerbWithInvoker(...)` (`command.go:73-100`)

The design is exactly what we want:

- JS metadata becomes a `CommandDescription` (`command.go:102-210`)
- output mode decides whether the verb becomes a `GlazeCommand` or `WriterCommand` (`command.go:82-99`)
- the generated command implements the normal Glazed execution interfaces (`command.go:364-405`)

This means the future `css-visual-diff` script verbs can be “real” commands with:

- `--help`
- grouped sections
- arguments and flags
- structured row output or text output
- all standard Glazed/Cobra middleware

That is exactly what the user asked for when they said “register the verbs as full glazed verbs with like `--log-level debug` flag and all that.”

## 3.4 It already supports caller-owned runtimes

The runtime path in `pkg/jsverbs/runtime.go` is especially important.

Default behavior:

- `registry.invoke(...)` creates a runtime itself (`runtime.go:18-36`)

But the package also supports:

- `registry.InvokeInRuntime(ctx, runtime, verb, parsedValues)` (`runtime.go:44-108`)
- `registry.RequireLoader()` (`runtime.go:38-42`)
- `CommandsWithInvoker(...)` for custom execution (`command.go:45-59`)

That is the key extension seam for `css-visual-diff`.

Instead of letting `jsverbs` create a generic runtime, `css-visual-diff` should create **its own caller-owned runtime** with:

- the standard `go-go-goja` factory,
- the scanned-source require loader,
- the built-in default native modules,
- the `css-visual-diff` runtime modules,
- and maybe later host-specific runtime values.

Then the generated commands can reuse that runtime composition via a custom invoker.

---

# 4. Evidence from Existing Docs and Playbooks

The `pkg/doc` directory is not just end-user help text. It already contains a lot of the onboarding and runtime philosophy we need to align with.

Key docs studied:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/01-introduction.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/02-creating-modules.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/03-async-patterns.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/08-jsverbs-example-overview.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/10-jsverbs-example-developer-guide.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/11-jsverbs-example-reference.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/15-docs-module-guide.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/bun-goja-bundling-playbook.md`

## 4.1 Important lessons from the docs

### Explicit runtime composition is the norm

The README and introduction make it clear that the canonical pattern is explicit builder/factory composition, not magical hidden setup.

### Metadata is static, runtime is dynamic

The jsverbs docs emphasize that the system is first a **command construction pipeline** and only later a runtime execution path. That is exactly the mental model we want for embedded default scripts in `css-visual-diff`.

### Source origins are broader than directories

The jsverbs overview and developer guide both stress that `pkg/jsverbs` is not limited to scanning one directory from disk. That directly supports our embedded-script use case.

### Standard logging flags belong on the Cobra root

The example runner shows the correct operational pattern for log flags:

- add a logging section to the root command (`cmd/jsverbs-example/main.go:54-60`)
- initialize the logger in `PersistentPreRunE` (`main.go:49-52`)
- then add the generated commands under that root (`main.go:74-85`)

This means the log flag story for `css-visual-diff` should be handled at the root command level, not individually inside each JS verb.

---

# 5. Results from a Concrete Experiment

I created and ran an experiment script for this ticket:

- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/scripts/01_go_go_goja_jsverbs_smoke.sh`

It recorded outputs under:

- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/various/01-go-go-goja-jsverbs-smoke/output.log`

The script verified:

1. package tests pass:
   - `GOWORK=off go test ./pkg/jsverbs ./cmd/jsverbs-example -count=1`
2. `--log-level debug` works on the example runner:
   - `GOWORK=off go run ./cmd/jsverbs-example --log-level debug --dir ./testdata/jsverbs list`
3. structured Glazed output works for JS-backed verbs:
   - `basics greet`
4. writer output works:
   - `basics banner`
5. section binding and context binding work:
   - `basics list-issues ... --state closed --labels bug --labels docs`

Observed debug output included:

```text
DBG Logger initialized file= format=text logToStdout=false logstash=false
```

Observed structured command output included a normal Glazed table for `greet` and `list-issues`, proving that scanned verbs are already behaving like full commands rather than like a separate mini-runner.

This is extremely strong evidence that `css-visual-diff` should build on this path, not around it.

---

# 6. Proposed Architecture for css-visual-diff

## 6.1 High-level design

```mermaid
flowchart TD
    A[embedded JS scripts] --> B[jsverbs.ScanFS]
    B --> C[Registry + VerbSpecs]
    C --> D[CommandsWithInvoker]
    D --> E[Cobra root + Glazed]

    E --> F[custom invoker]
    F --> G[engine.NewBuilder]
    G --> H[require.WithLoader(registry.RequireLoader)]
    G --> I[engine.DefaultRegistryModules]
    G --> J[css-visual-diff runtime module registrar]
    G --> K[optional runtime initializers]
    G --> L[Factory.NewRuntime]

    L --> M[goja runtime]
    M --> N[JS verb function]
    N --> O[Go-backed host modules: page/diff/report/llm]
    O --> P[browser + artifacts + output]
```

## 6.2 Main recommendation

`css-visual-diff` should have **two layers of JavaScript**:

1. **default embedded script verbs** — curated scripts shipped in the binary and scanned into commands
2. **runtime host modules** — Go-backed primitives required by those scripts, such as `page`, `diff`, `report`

The JS verbs should be thin orchestration code. The host modules should contain the heavy browser and diff logic.

That means the future design is not “all functionality in JS.” It is:

- command/interface logic mostly in JS metadata + small functions,
- domain primitives and performance-sensitive code in Go.

---

# 7. Proposed File Layout in css-visual-diff

I recommend this structure in `css-visual-diff`:

```text
cmd/css-visual-diff/
  main.go
  root.go
  script_runtime.go

internal/cssvisualdiff/
  dsl/
    runtime_factory.go
    registry.go
    invoker.go
    shared_sections.go
    runtime_modules.go
    runtime_initializers.go
  services/
    snapshot.go
    compare.go
    report.go
  modules/
    page/
      module.go
    diff/
      module.go
    report/
      module.go
    llm/
      module.go      # later

scripts/
  embedded/
    package.js
    compare.js
    inspect.js
    summarize.js
```

### Why split it this way

- `internal/cssvisualdiff/dsl` owns script scanning, runtime composition, and command registration.
- `internal/cssvisualdiff/modules/*` owns Goja-facing host modules.
- `internal/cssvisualdiff/services/*` owns pure Go domain logic reused by both CLI and modules.
- `scripts/embedded/*` contains the shipped default JS verbs.

---

# 8. Runtime Composition in css-visual-diff

## 8.1 Builder composition

The runtime should be built roughly like this:

### Pseudocode

```go
factory, err := engine.NewBuilder().
    WithRequireOptions(require.WithLoader(registry.RequireLoader())).
    WithModules(engine.DefaultRegistryModules()).
    WithRuntimeModuleRegistrars(
        dsl.PageModuleRegistrar(...),
        dsl.DiffModuleRegistrar(...),
        dsl.ReportModuleRegistrar(...),
    ).
    WithRuntimeInitializers(
        dsl.GlobalHelpersInitializer(...),
    ).
    Build()
```

### Why this exact shape

- `require.WithLoader(registry.RequireLoader())` allows the runtime to resolve the scanned embedded scripts from memory (`pkg/jsverbs/runtime.go:40-42`, `runtime.go:167-223`).
- `engine.DefaultRegistryModules()` keeps standard native modules available (`engine/module_specs.go:85-103`).
- `WithRuntimeModuleRegistrars(...)` is the right place for runtime-scoped `css-visual-diff` modules (`engine/runtime_modules.go:12-45`).
- `WithRuntimeInitializers(...)` is the right place for runtime globals and one-time setup (`engine/module_specs.go:20-54`, `factory.go:215-227`).

## 8.2 Why use runtime module registrars, not only default modules

`css-visual-diff` modules like `page` and `diff` are runtime-scoped because they will likely depend on:

- a runtime-owned browser/session context,
- runtime-owned services,
- runtime-owned cleanup hooks,
- runtime-scoped values.

That is a perfect match for `RuntimeModuleRegistrar` (`engine/runtime_modules.go:12-27`).

Using only static `modules.Register(...)` style modules would be less flexible because those modules would not naturally receive runtime context, add closers, or share runtime values.

## 8.3 Detailed JS engine implementation plan

This section is intentionally more concrete than the earlier architectural sections. It answers the question: **if a new intern starts implementing the JavaScript engine in `css-visual-diff` tomorrow, what files should they create, what responsibilities should each file hold, and what exact call path should they wire first?**

The most important guideline is to keep the implementation split into four layers:

1. **registry layer** — embedded JS sources, scanning, shared sections, verb discovery
2. **runtime layer** — factory creation, module registration, runtime ownership, cleanup
3. **host module layer** — Go functions exposed to JS via `require()`
4. **service layer** — pure Go comparison/report logic called by the host modules

If those layers remain distinct, the system stays testable and comprehensible. If they blur together, debugging becomes difficult because command discovery, runtime execution, and domain logic all start to depend on each other implicitly.

### 8.3.1 Recommended file-level layout

Inside `css-visual-diff`, I recommend this concrete file layout for the engine itself:

```text
internal/cssvisualdiff/dsl/
  embed.go             # embed.FS for default scripts
  registry.go          # ScanFS + shared sections + command listing
  host.go              # top-level Host type that owns registry + factory
  invoker.go           # jsverbs custom invoker using caller-owned runtimes
  sections.go          # shared Glazed/jsverbs sections (targets, viewport, output)
  registrar.go         # runtime module registrar composition
  codec.go             # JS option/result decoding helpers

internal/cssvisualdiff/modules/
  diff/module.go       # require("diff")
  report/module.go     # require("report")
  page/module.go       # later, require("page")

internal/cssvisualdiff/services/
  compare.go           # reusable Go compare service (no JS dependency)
  report.go            # deterministic agent brief / summarization helpers

scripts/embedded/
  compare.js
  inspect.js
  summarize.js
```

### 8.3.2 Core host type

The first implementation should revolve around one explicit host type that owns the scanned registry and the runtime factory.

#### Pseudocode

```go
type Host struct {
    registry *jsverbs.Registry
    factory  *engine.Factory
}

func NewHost() (*Host, error) {
    registry, err := loadEmbeddedRegistry()
    if err != nil {
        return nil, err
    }

    factory, err := engine.NewBuilder().
        WithRequireOptions(require.WithLoader(registry.RequireLoader())).
        WithModules(engine.DefaultRegistryModules()).
        WithRuntimeModuleRegistrars(newRuntimeRegistrar()).
        Build()
    if err != nil {
        return nil, err
    }

    return &Host{registry: registry, factory: factory}, nil
}

func (h *Host) Commands() ([]cmds.Command, error) {
    return h.registry.CommandsWithInvoker(h.invoke)
}
```

### Why this matters

The `Host` object gives the subsystem one stable boundary for the rest of the application:

- `main.go` only needs to ask for commands,
- runtime creation stays centralized,
- testing can stub or replace parts of the host,
- embedded script loading is decoupled from root-command wiring.

### 8.3.3 Embedded registry loading

The embedded registry path should be deterministic and testable. The first version should not dynamically crawl user directories at startup.

#### Pseudocode

```go
//go:embed ../../../../scripts/embedded/*.js
var embeddedScripts embed.FS

func loadEmbeddedRegistry() (*jsverbs.Registry, error) {
    registry, err := jsverbs.ScanFS(embeddedScripts, "scripts/embedded")
    if err != nil {
        return nil, err
    }
    if err := registerSharedSections(registry); err != nil {
        return nil, err
    }
    return registry, nil
}
```

### Important implementation details

- Use `ScanFS(...)`, not `ScanDir(...)`, so the binary can ship a self-contained command set.
- Keep shared sections in Go (`registerSharedSections`) so common CLI options are host-controlled and do not need to be duplicated in every script.
- Add a small test that asserts the expected command paths exist after scanning.

### 8.3.4 Shared sections

The first engine version should define shared sections for the cross-cutting options every embedded script will need.

Recommended first shared sections:

- `targets`
  - `leftUrl`, `rightUrl`, `leftWaitMs`, `rightWaitMs`
- `viewport`
  - `width`, `height`
- `output`
  - `outDir`, `threshold`, `writeJson`, `writeMarkdown`, `writePngs`

#### Pseudocode

```go
func registerSharedSections(registry *jsverbs.Registry) error {
    return registry.AddSharedSections(
        targetsSection(),
        viewportSection(),
        outputSection(),
    )
}
```

### Why this matters

This is the mechanism that makes script verbs feel like first-class Glazed commands instead of one-off JS entrypoints. The CLI structure becomes:

- consistent,
- discoverable,
- centrally documented,
- easy to evolve.

### 8.3.5 Runtime factory creation

The runtime factory should be built once per process and reused across command invocations. The runtime instances themselves should remain one-per-invocation in v1.

#### Pseudocode

```go
func newFactory(registry *jsverbs.Registry) (*engine.Factory, error) {
    return engine.NewBuilder().
        WithRequireOptions(require.WithLoader(registry.RequireLoader())).
        WithModules(engine.DefaultRegistryModules()).
        WithRuntimeModuleRegistrars(newRuntimeRegistrar()).
        Build()
}
```

### Why build the factory once

- require loader and module registration plan are immutable,
- repeated validation is avoided,
- the setup path is easier to test,
- command execution only needs to allocate a runtime, not rebuild the whole plan.

### 8.3.6 Custom invoker flow

This is the most important execution step in the whole engine. The generated Glazed commands should not use the default jsverbs runtime path; they should use a custom invoker that creates a caller-owned runtime from the prebuilt factory.

#### Pseudocode

```go
func (h *Host) invoke(
    ctx context.Context,
    registry *jsverbs.Registry,
    verb *jsverbs.VerbSpec,
    parsedValues *values.Values,
) (interface{}, error) {
    rt, err := h.factory.NewRuntime(ctx)
    if err != nil {
        return nil, err
    }
    defer rt.Close(context.Background())

    return registry.InvokeInRuntime(ctx, rt, verb, parsedValues)
}
```

### Why this specific path

Because it lets `css-visual-diff` fully control runtime creation while still reusing jsverbs for:

- scanning,
- metadata resolution,
- argument binding,
- and function invocation.

This is the exact seam that makes `jsverbs` useful as a library instead of only as a prototype binary.

### 8.3.7 Runtime module registrar

The runtime module registrar should be the only place that knows which `css-visual-diff` host modules are available to embedded scripts.

#### Pseudocode

```go
type runtimeRegistrar struct {
    compareSvc services.CompareService
    reportSvc  services.ReportService
}

func (r *runtimeRegistrar) ID() string { return "css-visual-diff-runtime-modules" }

func (r *runtimeRegistrar) RegisterRuntimeModules(ctx *engine.RuntimeModuleContext, reg *require.Registry) error {
    reg.RegisterNativeModule("diff", modulesdiff.Loader(r.compareSvc, ctx))
    reg.RegisterNativeModule("report", modulesreport.Loader(r.reportSvc, ctx))
    return nil
}
```

### Important note

This registrar is runtime-scoped for a reason:

- modules may need `ctx.Context`,
- modules may want to call `ctx.AddCloser`,
- modules may want to inspect or set `ctx.Values`,
- future browser pools or clients may be runtime-bound.

### 8.3.8 Host module implementation pattern

Each host module should be a thin adapter around a pure Go service. The host module should not own comparison business logic.

#### Example: diff module

```go
type CompareOptions struct {
    Left      TargetOptions   `json:"left"`
    Right     TargetOptions   `json:"right"`
    Viewport  ViewportOptions `json:"viewport"`
    Output    OutputOptions   `json:"output"`
    Computed  []string        `json:"computed"`
    Pixels    PixelOptions    `json:"pixels"`
}

func Loader(compareSvc services.CompareService, runtimeCtx *engine.RuntimeModuleContext) require.ModuleLoader {
    return func(vm *goja.Runtime, module *goja.Object) {
        exports := module.Get("exports").(*goja.Object)
        exports.Set("compareRegions", func(raw map[string]interface{}) (interface{}, error) {
            opts, err := decodeCompareOptions(raw)
            if err != nil {
                return nil, err
            }
            return compareSvc.Compare(runtimeCtx.Context, opts)
        })
    }
}
```

### Important decoding rule

Do not hand-parse nested JS maps everywhere. Centralize decoding in one codec helper, ideally using JSON marshal/unmarshal over a stable Go DTO for the first implementation.

### 8.3.9 Result shaping module

The `report` module should own deterministic, token-efficient result shaping.

It should not call an LLM in v1. It should do simple, explainable transformations such as:

- sort top changed properties,
- produce short bullet lists,
- return compact evidence objects,
- optionally render plain text for writer commands.

#### Pseudocode

```go
exports.Set("agentBrief", func(raw map[string]interface{}) (interface{}, error) {
    opts, err := decodeBriefOptions(raw)
    if err != nil {
        return nil, err
    }
    return reportSvc.AgentBrief(opts)
})
```

### 8.3.10 Embedded script authoring model

The first embedded scripts should be intentionally small and should mostly do orchestration.

#### Example shape

```javascript
__package__({
  name: "compare",
  parents: ["script"],
  short: "Script-backed compare workflows"
});

function region(targets, viewport, output, selectors) {
  return require("diff").compareRegions({
    left: { url: targets.leftUrl, selector: selectors.leftSelector, waitMs: targets.leftWaitMs },
    right: { url: targets.rightUrl, selector: selectors.rightSelector || selectors.leftSelector, waitMs: targets.rightWaitMs },
    viewport,
    output,
    computed: ["font-size", "line-height", "padding", "color"],
    pixels: { threshold: output.threshold || 20 }
  });
}

__verb__("region", {
  short: "Compare one region across two targets",
  sections: ["targets", "viewport", "output", "selectors"],
  fields: {
    targets: { bind: "targets" },
    viewport: { bind: "viewport" },
    output: { bind: "output" },
    selectors: { bind: "selectors" }
  }
});
```

### Why scripts should stay small

The more logic that moves into JS, the harder it becomes to test, optimize, and reuse from Go. Keep scripts focused on:

- choosing the host call,
- shaping parameters,
- choosing which report helper to call,
- deciding whether a command is structured or text.

### 8.3.11 Promise and async handling

The first engine version should strongly prefer synchronous host modules. That is enough for compare/report verbs and greatly reduces implementation risk.

However, the engine should be built in a way that does not block async later. That means:

- using `engine.Factory.NewRuntime(...)`,
- preserving `runtimeowner.Runner` access through runtime contexts,
- allowing future runtime modules to resolve promises with `Owner.Post(...)`.

So the v1 guidance is:

- **do not build LLM async support first**,
- but **do not design the runtime in a way that would make async settlement impossible later**.

### 8.3.12 Root command integration steps

The engine integration into `cmd/css-visual-diff/main.go` should happen in exactly this order:

1. build or load the host (`dsl.NewHost()`)
2. ask the host for generated commands (`host.Commands()`)
3. add logging section to the root Cobra command
4. initialize logger in `PersistentPreRunE`
5. add generated commands to root with `cli.AddCommandsToRootCommand(...)`
6. keep existing hand-written commands side-by-side during the transition

#### Pseudocode

```go
host, err := dsl.NewHost()
if err != nil { ... }

scriptCommands, err := host.Commands()
if err != nil { ... }

root := &cobra.Command{ ... PersistentPreRunE: logging.InitLoggerFromCobra ... }
_ = logging.AddLoggingSectionToRootCommand(root, "css-visual-diff")
setDefaultFlagValue(root, "log-level", "error")
setDefaultFlagValue(root, "log-format", "text")

root.AddCommand(existingCommands...)
_ = cli.AddCommandsToRootCommand(root, scriptCommands, nil, cli.WithParserConfig(...))
```

### 8.3.13 First end-to-end milestone

A good “first engine complete” milestone would be:

- one embedded script file,
- one runtime registrar,
- one `diff` host module,
- one `report` host module,
- one structured Glazed command,
- one writer command,
- both available under the normal `css-visual-diff` root with `--log-level debug`.

That is the smallest slice that proves:

- embedded scripts are scanned,
- verbs are compiled,
- caller-owned runtimes work,
- runtime modules are visible,
- structured and text outputs both work,
- root logging integration works.

---

# 9. How JS Verbs Should Become Full Glazed Verbs

## 9.1 Root command pattern

The reference implementation is in:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/cmd/jsverbs-example/main.go`

The important pieces are:

1. scan registry first (`main.go:24-34`)
2. compile commands (`main.go:36-40`)
3. create Cobra root with `PersistentPreRunE` calling `logging.InitLoggerFromCobra(cmd)` (`main.go:42-52`)
4. add logging section to the root (`main.go:54-60`)
5. add generated commands with `cli.AddCommandsToRootCommand(...)` (`main.go:74-85`)

`css-visual-diff` should follow the same pattern.

### Pseudocode

```go
root := &cobra.Command{
    Use:   "css-visual-diff",
    Short: "Compare rendered HTML/CSS across browser targets",
    PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
        return logging.InitLoggerFromCobra(cmd)
    },
}

_ = logging.AddLoggingSectionToRootCommand(root, "css-visual-diff")
setDefaultFlagValue(root, "log-level", "error")
setDefaultFlagValue(root, "log-format", "text")

registry, _ := jsverbs.ScanFS(embeddedScriptsFS, ".")
_ = registerCVDSharedSections(registry)
commands, _ := registry.CommandsWithInvoker(customInvoker)
_ = cli.AddCommandsToRootCommand(root, commands, nil, cli.WithParserConfig(...))
```

## 9.2 Why the log flags belong on the root command

The script verbs are generated subcommands, not top-level applications. Logging, output format defaults, and cross-cutting middleware should be configured once at the root. That is how the example runner already behaves, and it is the right UX for `css-visual-diff`.

This gives us:

```bash
css-visual-diff --log-level debug compare region ...
css-visual-diff --log-level debug inspect widget ...
```

instead of forcing every script to reinvent log flags.

## 9.3 Shared sections for common flags

One of the strongest underused features in `pkg/jsverbs` is registry-level shared sections:

- `Registry.AddSharedSection(...)` (`model.go:180-219`)

For `css-visual-diff`, this is exactly how we should model common flags such as:

- left/right target URLs
- viewport
- wait settings
- output/artifact options
- maybe focus modes or report verbosity

### Example shared sections

```go
registry.AddSharedSections(
  &jsverbs.SectionSpec{Slug: "targets", ...},
  &jsverbs.SectionSpec{Slug: "viewport", ...},
  &jsverbs.SectionSpec{Slug: "output", ...},
)
```

Then JS verbs can bind to them with:

```javascript
__verb__("compareRegion", {
  sections: ["targets", "viewport", "output"],
  fields: {
    targets: { bind: "targets" },
    viewport: { bind: "viewport" },
    output: { bind: "output" },
    selector: { argument: true }
  }
});
```

That would give us stable command ergonomics without duplicating metadata in every embedded script.

---

# 10. Embedded Default Scripts Strategy

## 10.1 Why embed scripts at all

Embedded scripts give `css-visual-diff` a curated out-of-the-box UX. The user should not need to write custom scripts on day one just to access the main workflows.

Examples of default shipped verbs:

- `compare region`
- `inspect region`
- `summarize diff`
- `top changed-regions`
- `explain visual-drift`

## 10.2 How to embed them

Use `embed.FS` in `css-visual-diff`, then scan with `jsverbs.ScanFS(...)`.

### Pseudocode

```go
//go:embed scripts/embedded/*
var embeddedScripts embed.FS

registry, err := jsverbs.ScanFS(embeddedScripts, "scripts/embedded")
```

That matches `pkg/jsverbs`'s supported source-origin model and avoids temporary files.

## 10.3 Why not only scan a directory from disk

Disk scanning should remain possible for future extensibility, but embedded defaults solve three problems immediately:

- reproducibility,
- no missing-script deployment problems,
- easy help/command registration at startup.

---

# 11. Proposed JS Verb Shape for css-visual-diff

## 11.1 Example default embedded script

```javascript
__package__({
  name: "compare",
  short: "Comparison commands"
});

__section__("selectors", {
  title: "Selectors",
  fields: {
    leftSelector: {
      help: "Selector on the left target",
      required: true,
    },
    rightSelector: {
      help: "Selector on the right target",
    },
  }
});

function region(targets, viewport, output, selectors) {
  const result = require("diff").compareRegions({
    left: {
      url: targets.leftUrl,
      selector: selectors.leftSelector,
      waitMs: targets.leftWaitMs,
    },
    right: {
      url: targets.rightUrl,
      selector: selectors.rightSelector || selectors.leftSelector,
      waitMs: targets.rightWaitMs,
    },
    viewport,
    output,
    computed: ["font-size", "line-height", "padding", "color"],
    pixels: { threshold: output.threshold || 20 },
  });

  return require("report").agentBrief({
    question: "What exact CSS differences matter here?",
    evidence: result,
    maxBullets: 8,
  });
}

__verb__("region", {
  short: "Compare one region across two targets",
  sections: ["targets", "viewport", "output", "selectors"],
  fields: {
    targets: { bind: "targets" },
    viewport: { bind: "viewport" },
    output: { bind: "output" },
    selectors: { bind: "selectors" },
  }
});
```

### Why this is elegant

- JS handles orchestration and result shaping.
- Go modules handle browser and diff mechanics.
- the command compiles into a standard Glazed/Cobra subcommand.

---

# 12. Host Module Design for css-visual-diff

## 12.1 Recommended runtime modules

I recommend these runtime-scoped modules first:

1. `page`
2. `diff`
3. `report`
4. `artifacts` (optional, maybe folded into `report` initially)
5. `llm` (later)

## 12.2 Why `diff` should be the main early module

Most default embedded commands can probably be built on one strong `diff` host module plus one strong `report` host module.

For example:

- `compare region`
- `top changed-regions`
- `summarize diff`
- `explain visual-drift`

all depend more on a reusable diff service than on raw page primitives.

So a sensible v1 architecture is:

- keep low-level browser/page logic in Go services,
- expose a relatively high-level `diff` JS module first,
- add lower-level `page` module only when needed.

That keeps scripts concise and avoids dumping too much operational complexity into JS early.

## 12.3 Service-to-module split

```text
services.CompareRegions(...)   -> require("diff").compareRegions(...)
services.SnapshotRegion(...)   -> require("page").snapshot(...)
services.AgentBrief(...)       -> require("report").agentBrief(...)
```

That split is critical. The Go module adapter should not own business logic; it should translate JS options into calls to pure Go services.

---

# 13. Concrete Implementation Plan

## Phase 1 — Extract stable service layer in css-visual-diff

Before integrating `go-go-goja`, extract the reusable `css-visual-diff` logic out of current mode functions.

Target files to refactor from:

- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/compare.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/cssdiff.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/css-visual-diff/internal/cssvisualdiff/modes/matched_styles.go`

Outputs should be reusable service functions like:

- `CompareRegions(ctx, opts) (*CompareResult, error)`
- `SnapshotRegion(ctx, opts) (*SnapshotResult, error)`
- `BuildAgentBrief(opts) (*AgentBrief, error)`

## Phase 2 — Vendor or depend on go-go-goja runtime + jsverbs

Decide whether `css-visual-diff` should:

- import `github.com/go-go-golems/go-go-goja` directly,
- or temporarily vendor key packages.

Recommendation: depend directly first, because the explicit APIs we need are already exposed.

## Phase 3 — Add embedded script registry in css-visual-diff

Create:

- `internal/cssvisualdiff/dsl/registry.go`
- `scripts/embedded/*.js`

Responsibilities:

- embed default scripts,
- scan them with `jsverbs.ScanFS(...)`,
- register shared sections for common target/viewport/output flags.

## Phase 4 — Add custom runtime invoker

Use `Registry.CommandsWithInvoker(...)` so `css-visual-diff` owns runtime creation.

The custom invoker should:

1. build a caller-owned runtime,
2. install the registry's `RequireLoader()`,
3. register `css-visual-diff` runtime modules,
4. call `registry.InvokeInRuntime(...)`.

## Phase 5 — Add the commands under the existing root Cobra command

Follow the `cmd/jsverbs-example/main.go` pattern:

- add logging section to root,
- initialize logger in `PersistentPreRunE`,
- add generated commands with `cli.AddCommandsToRootCommand(...)`.

## Phase 6 — Add docs and examples

Mirror the `go-go-goja/pkg/doc` style:

- overview
- developer guide
- reference
- maybe one playbook for embedded script authoring.

---

# 14. Testing Strategy

## 14.1 Runtime composition tests

Add tests that build a runtime with:

- embedded registry loader,
- runtime module registrars,
- and one simple verb.

Validate that:

- the script loads from memory,
- the host module is visible,
- the result returns correctly.

## 14.2 Command registration tests

Use the `jsverbs` pattern from:

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/jsverbs_test.go`

Specifically mirror tests for:

- commands with custom invokers,
- runtime reuse via `InvokeInRuntime(...)`,
- writer commands vs structured commands.

## 14.3 CLI smoke tests

Create a `cmd/css-visual-diff` smoke test similar to the experiment run in this ticket:

- `list` embedded verbs
- run one structured command
- run one writer command
- run with `--log-level debug`

## 14.4 Async tests

If any host module returns Promises, add tests that validate owner-thread settlement and cancellation behavior.

---

# 15. Alternatives Considered

## Alternative A — Write a custom JS scanner and command compiler inside css-visual-diff

Rejected because `pkg/jsverbs` already solves this problem and has tests, docs, and a working example runner.

## Alternative B — Use go-go-goja only for raw runtime creation, but ignore jsverbs

Rejected because that would force us to rebuild command discovery, metadata parsing, and Glazed command compilation from scratch.

## Alternative C — Put every workflow in one monolithic JS script command

Rejected because it would give up the advantage of Glazed/Cobra command discovery and per-verb help.

## Alternative D — Keep script execution as one opaque `script --file` command only

This might still exist as an advanced mode, but it should not be the only interface. Embedded default scripts compiled into real verbs give much better discoverability.

---

# 16. Key Decisions

1. **Reuse `go-go-goja/engine` for runtime lifecycle.**
2. **Reuse `pkg/jsverbs` for scanning, metadata, and command compilation.**
3. **Use embedded default scripts scanned from `embed.FS`.**
4. **Register `css-visual-diff` host modules via runtime module registrars.**
5. **Use root-level Glazed logging flags rather than per-script logging flags.**
6. **Expose default embedded scripts as full Glazed/Cobra verbs, not only as ad hoc script execution.**

---

# 17. Open Questions

- Should `css-visual-diff` also support user-supplied external script directories in v1, or only embedded defaults?
- Should the first host module be high-level (`diff`) or lower-level (`page`) or both?
- Should embedded script verbs coexist with the current hand-written `compare` command for a transition period?
- Should one runtime be created per command invocation, or should there later be a runtime pool?

My recommendation is:

- embed defaults first,
- keep one runtime per invocation in v1,
- and keep the hand-written commands during the transition.

---

# 18. References

## go-go-goja runtime / jsverbs implementation

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/factory.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/runtime.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/runtime_modules.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/engine/module_specs.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/modules/common.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/model.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/scan.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/binding.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/command.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/runtime.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/runtimeowner/runner.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/runtimebridge/runtimebridge.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/cmd/jsverbs-example/main.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/jsverbs/jsverbs_test.go`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/testdata/jsverbs/basics.js`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/testdata/jsverbs/packaged.js`

## go-go-goja docs and playbooks

- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/01-introduction.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/02-creating-modules.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/03-async-patterns.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/08-jsverbs-example-overview.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/10-jsverbs-example-developer-guide.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/11-jsverbs-example-reference.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/15-docs-module-guide.md`
- `/home/manuel/workspaces/2026-04-21/hair-v2/go-go-goja/pkg/doc/bun-goja-bundling-playbook.md`

## ticket-local experiment artifacts

- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/scripts/01_go_go_goja_jsverbs_smoke.sh`
- `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/04/21/HAIR-019--design-a-sandboxed-javascript-dsl-for-css-visual-diff-evidence-gathering/various/01-go-go-goja-jsverbs-smoke/output.log`
