---
Title: Decision Tree DSL Playbook
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
    - Path: examples/decision-trees/basic.yaml
      Note: Example tree in the playbook.
    - Path: examples/decision-trees/color.yaml
      Note: Combo pricing example in the playbook.
    - Path: examples/decision-trees/invalid.yaml
      Note: Validation failure example.
    - Path: internal/dsl/types.go
      Note: Type definitions for DSL reference.
ExternalSources: []
Summary: How to design and validate decision trees using the YAML DSL, with reference and examples.
LastUpdated: 2026-01-18T18:03:36-05:00
WhatFor: Repeatable steps to author DSL trees and validate them via the CLI/REST API.
WhenToUse: Use when creating new decision tree YAML or reviewing existing trees.
---


# Decision Tree DSL Playbook

## Purpose

Provide a repeatable process for creating decision trees in the YAML DSL. Includes a reference guide and example trees.

## Environment Assumptions

- YAML files are stored locally and validated via the CLI or REST endpoint.
- Prices are **cents** (e.g., $55.00 → `5500`).
- Durations are formatted as `<number><unit>` (e.g., `45min`, `1hr`).

## Commands

### 1) Create a new DSL file

```yaml
name: Example Tree
root: start
nodes:
  start:
    question: "First question?"
    options:
      - label: "Option A"
        price: 5000
        duration: 45min
        next: end
  end:
    type: terminal
    action: book_appointment
```

### 2) Validate with CLI

```bash
# Local validation
 go run ./cmd/decision-tree-cli local parse --file /path/to/tree.yaml

# REST validation with issues
 go run ./cmd/decision-tree-cli rest validate --file /path/to/tree.yaml
```

### 3) Create the tree in the backend

```bash
 go run ./cmd/decision-tree-cli rest create-tree --file /path/to/tree.yaml --publish
```

## DSL Reference

### Root Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Display name of the tree |
| `root` | string | Yes | Node ID where the tree starts |
| `nodes` | object | Yes | Map of node IDs to node definitions |
| `rules` | array | No | Conditional pricing rules |

### Node Fields (Decision Nodes)

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `question` | string | Yes | Question text shown to user |
| `options` | array | Yes | List of options |
| `optional` | bool | No | Allow skipping this node |

### Option Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `label` | string | Yes | Button text shown to user |
| `price` | int | No | Base price in cents |
| `price_with_cut` | int | No | Combo price when a cut is selected |
| `duration` | string | No | Service duration (e.g., `45min`) |
| `books_for` | string | No | Booking duration override |
| `next` | string | No | ID of next node |
| `note` | string | No | Extra context shown under option |

### Terminal Nodes

```yaml
end:
  type: terminal
  action: book_appointment
```

### Rules (Combo Pricing)

```yaml
rules:
  - if_service_includes: [cut, color]
    then: apply_combo_pricing
```

## Examples

### Example 1: Basic Cuts

```yaml
name: Basic Cuts
root: cuts
nodes:
  cuts:
    question: "What type of cut?"
    options:
      - label: "Men's Cut"
        price: 5500
        duration: 45min
        next: end
      - label: "Women's Cut"
        price: 8500
        duration: 1hr
        next: end
  end:
    type: terminal
    action: book_appointment
```

### Example 2: Cut + Color with Combo Pricing

```yaml
name: Cut and Color
root: haircut
nodes:
  haircut:
    question: "Choose a haircut"
    options:
      - label: "Women's Cut"
        price: 8500
        duration: 1hr
        next: color
      - label: "Men's Cut"
        price: 5500
        duration: 45min
        next: color
      - label: "No cut"
        next: color
  color:
    question: "Add color service?"
    options:
      - label: "No color"
        next: end
      - label: "Full Highlights"
        price: 17500
        price_with_cut: 20500
        duration: 2hr
        next: end
  end:
    type: terminal
    action: book_appointment
rules:
  - if_service_includes: [cut, color]
    then: apply_combo_pricing
```

## Exit Criteria

- DSL passes validation (`valid: true`).
- Tree creation returns an ID.
- Sample runs produce correct totals and reach a terminal node.

## Failure Modes

- **Root node not found**: `root` must exist in `nodes`.
- **Missing options**: decision nodes must include at least one option.
- **Invalid duration format**: use `45min`, `1hr`, `90min`.

