---
Title: CLI Tool Playbook
Ticket: MO-012-DECISION-TREE-PORT
Status: active
Topics:
    - frontend
    - go
    - porting
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: cmd/decision-tree-cli/main.go
      Note: CLI entrypoint referenced in the playbook.
    - Path: cmd/decision-tree-cli/rest.go
      Note: REST commands documented.
    - Path: examples/decision-trees/basic.yaml
      Note: Example tree used in commands.
    - Path: examples/decision-trees/color.yaml
      Note: Example tree used in commands.
ExternalSources: []
Summary: How to use the decision-tree CLI for local and REST validation, runs, and cleanup.
LastUpdated: 2026-01-18T18:03:36-05:00
WhatFor: Repeatable command sequences for validating and exercising the backend without the UI.
WhenToUse: Use whenever you need to test or demo the backend from the CLI.
---


# CLI Tool Playbook

## Purpose

Provide a repeatable workflow for exercising the decision-tree backend both locally (in-process) and over REST. Includes validation, tree creation, booking runs, and cleanup.

## Environment Assumptions

- Go 1.25+ installed.
- Working directory: repo root (`/home/manuel/workspaces/2026-01-18/hair-booking-start/hair-booking`).
- CLI binary is executed via `go run ./cmd/decision-tree-cli`.
- Backend server uses `go run ./cmd/decision-tree-server` on port `:3001`.
- Example DSL files are in `examples/decision-trees/`.

## Commands

### 1) Start the backend server (tmux)

```bash
# Start server in tmux
 tmux new-session -d -s dtree-server "go run ./cmd/decision-tree-server --addr :3001 --db-path /tmp/decision-tree-cli.db"
```

### 2) Local DSL validation + run

```bash
# Validate DSL
 go run ./cmd/decision-tree-cli local parse --file examples/decision-trees/basic.yaml

# Run a local selection path
 go run ./cmd/decision-tree-cli local run --file examples/decision-trees/color.yaml \
  --select "Women's Cut" --select "Full Highlights"
```

Expected output: JSON state with `totalPrice`, `totalDuration`, `appliedRules`, and `currentNodeId`.

### 3) REST validation

```bash
# Validate DSL through API
 go run ./cmd/decision-tree-cli rest validate --file examples/decision-trees/invalid.yaml
```

Expected output: `{ "valid": false, "issues": [ ... ] }` with error codes and line/column positions.

### 4) REST create/list/get

```bash
# Create trees
 go run ./cmd/decision-tree-cli rest create-tree --file examples/decision-trees/basic.yaml --publish
 go run ./cmd/decision-tree-cli rest create-tree --file examples/decision-trees/color.yaml --publish

# List trees
 go run ./cmd/decision-tree-cli rest list-trees --all

# Fetch a tree by id
 go run ./cmd/decision-tree-cli rest get-tree --id 1
```

### 5) REST booking run (with metadata)

```bash
go run ./cmd/decision-tree-cli rest run --tree-id 2 \
  --select "Women's Cut" --select "Full Highlights" \
  --client-name "Ada Lovelace" \
  --client-email "ada@example.com" \
  --client-phone "+1-555-0100" \
  --preferred-datetime "2026-01-18T15:00:00Z" \
  --notes "Evening appointment"
```

Expected output: JSON with the run state and `{ "booking": { "id": ... } }`.

### 6) Booking inspection

```bash
# List bookings
 go run ./cmd/decision-tree-cli rest list-bookings

# Get booking by id
 go run ./cmd/decision-tree-cli rest get-booking --id 1
```

### 7) Cleanup

```bash
# Reset trees (and cascading bookings)
 go run ./cmd/decision-tree-cli rest reset-trees --yes

# Or reset local DB directly
 go run ./cmd/decision-tree-cli local reset-db --db-path /tmp/decision-tree-cli.db
```

### 8) Stop the server

```bash
# Kill the server using the repo-standard helper
 lsof-who -p 3001 -k

# Then stop tmux session (if still present)
 tmux kill-session -t dtree-server
```

## Exit Criteria

- Validation commands return expected JSON results.
- Create/list/get commands show the created decision trees.
- REST `run` command returns a booking ID and state matches expected totals.
- Cleanup removes trees without errors.

## Failure Modes

- **Connection refused**: server not running. Restart the tmux session.
- **Invalid DSL**: check `issues` field for error codes and line/column.
- **Booking create fails**: ensure `decisionTreeId` exists and `selectedServices` is a JSON string.

## Expected Timing

- Full run with create + booking: ~30–60 seconds.

