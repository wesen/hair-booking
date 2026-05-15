# Diary

## Goal

This diary records the implementation of HAIR-040: a real Goja-backed Admin DSL website route that replaces the Admin DSL Go spike with a backend-authored flow source, protobuf HTTP transport, and a React route.

## Step 1: Create the HAIR-040 ticket and implementation plan

I created a new ticket for the real Admin DSL website work and wrote the implementation guide before changing runtime code. The guide defines the target architecture: a Goja-authored services admin flow using `require("fringe/admin-dsl")`, Go-host fluent builders, Admin DSL protobuf HTTP transport, and a React route mounted at `/admin/services`.

The plan intentionally keeps the Admin runtime separate from the intake runtime because Admin pages have first-class surfaces, semantic actions, lifecycle state, and a dedicated protobuf contract. It also follows the clean-cutover decision from HAIR-039: no legacy surface helper wrappers should be reintroduced.

### Prompt Context

**User prompt (verbatim):** "alright, create a new ticket for this real website, and add a detailed design + implementation guide, then add tasks split in phases, and work on them one by one, committing at appropriat eintervals, and keeping a detailed diary"

**Assistant interpretation:** Create a new docmgr ticket for the real Goja-backed Admin DSL website, write a design/implementation guide and phased tasks, then start implementation incrementally with diary and commits.

**Inferred user intent:** The user wants the real website integration treated as a new ticket with a durable plan and disciplined implementation history.

**Commit (code):** Pending in this step.

### What I did
- Created ticket `HAIR-040 — Real Goja-backed Admin DSL website`.
- Added design guide:
  - `design-doc/01-real-goja-backed-admin-dsl-website-implementation-guide.md`
- Rewrote `tasks.md` with phases 0 through 6.
- Initialized this diary.

### Why
- The real Admin DSL website is a larger follow-up to HAIR-039 and deserves its own ticket, phases, and validation loop.

### What worked
- `docmgr ticket create-ticket` and `docmgr doc add` created the workspace and initial docs.

### What didn't work
- N/A.

### What I learned
- The natural ticket boundary is the cut from Admin DSL infrastructure to a real route/runtime-backed website.

### What was tricky to build
- The implementation plan had to keep the transport, runtime, flow source, and frontend route separate so each phase remains reviewable.

### What warrants a second pair of eyes
- Review the chosen route `/admin/services` before frontend routing is finalized.
- Review whether `pkg/admindsl` is the right home for the Admin Goja runtime or whether a subpackage should be used.

### What should be done in the future
- Start Phase 1 by implementing the Admin Goja runtime skeleton.

### Code review instructions
- Review the design guide and tasks before runtime code changes.

### Technical details
- Ticket path:
  - `/home/manuel/workspaces/2026-04-21/hair-v2/hair-booking/ttmp/2026/05/15/HAIR-040--real-goja-backed-admin-dsl-website`
