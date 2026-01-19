# Decision Tree DSL Reference

**Version:** 1.0 (Go port)  
**Last updated:** 2026-01-18

This document is a detailed, textbook-style reference for the Decision Tree DSL used by the decision-tree backend. It is written as a standalone specification: it describes the data model, the meaning of each field, validation behavior, and runtime semantics (pricing, duration, rules). It also includes examples and recommended patterns.

---

## Table of Contents

1. Overview
2. Conceptual Model
3. Top-Level Document Structure
4. Node Types
5. Options
6. Rules
7. Runtime Semantics
8. Duration Parsing
9. Validation Rules and Error Codes
10. Examples
11. Best Practices
12. Known Limitations
13. Appendix: EBNF Sketch

---

## 1. Overview

The Decision Tree DSL is a YAML-based configuration format for building interactive service selection flows. It is designed to capture a tree of questions (nodes), each with a list of possible choices (options). Options can contribute to pricing and duration and determine the next node to visit. Some nodes can be terminal, ending the flow.

### Key Properties

- **Human-readable:** YAML syntax supports non-technical authors.
- **Deterministic:** The backend applies pricing and duration rules consistently.
- **Composable:** Trees can combine linear sequences and branching logic.
- **Portable:** DSL is stored as text and validated on create/update.

---

## 2. Conceptual Model

A decision tree is a directed graph with a single entry point (the `root`). Each non-terminal node presents a question and a set of options. Selecting an option advances the state to the next node (defined by `next`). A terminal node ends the flow.

The runtime accumulates:

- **Selected services:** each chosen option plus its computed price/duration.
- **Total price:** sum of option prices (including combo pricing).
- **Total duration:** sum of option durations and rule-driven adjustments.
- **Applied rules:** textual log of rule effects.

---

## 3. Top-Level Document Structure

Every DSL document must include the following:

```yaml
name: string
root: string
nodes: map[string, Node]
rules: []Rule   # optional
```

### Top-Level Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Human-readable name of the tree |
| `root` | string | Yes | Node ID where traversal begins |
| `nodes` | map | Yes | Mapping from node IDs to node definitions |
| `rules` | array | No | Conditional pricing/duration rules |

---

## 4. Node Types

Nodes come in two forms: **decision nodes** and **terminal nodes**.

### 4.1 Decision Node

Decision nodes present a question and a list of options.

```yaml
nodes:
  node_id:
    question: "Text shown to the user"
    optional: false
    options:
      - label: "Option 1"
        next: another_node
```

#### Decision Node Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `question` | string | Yes | Question text displayed to the user |
| `options` | array | Yes | One or more options |
| `optional` | bool | No | Metadata for UI to allow a skip button |

> Note: `optional` is not enforced by the backend. It is provided to clients so the UI can offer a "skip" action if desired.

### 4.2 Terminal Node

Terminal nodes end the flow.

```yaml
nodes:
  end:
    type: terminal
    action: book_appointment
```

#### Terminal Node Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Must be the literal value `terminal` |
| `action` | string | Yes | Action identifier (e.g., `book_appointment`) |

---

## 5. Options

Options define selectable choices for a decision node.

```yaml
options:
  - label: "Women's Cut"
    price: 8500
    duration: 1hr
    next: color
    note: "Includes wash and style"
```

### Option Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `label` | string | Yes | Text shown on the option button |
| `price` | int | No | Base price in cents |
| `price_with_cut` | int | No | Alternate price if a cut was selected earlier |
| `duration` | string | No | Service duration (e.g., `45min`, `1hr`) |
| `books_for` | string | No | Overrides `duration` for booking calculations |
| `next` | string | No | Node ID to navigate to |
| `note` | string | No | Additional context shown in UI |

> Pricing fields are in **cents**. Always multiply dollar values by 100.

---

## 6. Rules

Rules provide conditional behavior based on selections. Rules are evaluated after each selection.

```yaml
rules:
  - if_service_includes: [cut, color]
    then: apply_combo_pricing
  - if_service: balayage
    duration: 30min
    then: apply_cut_discount
```

### Rule Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `if_service_includes` | []string | No | Substring match across selected services |
| `if_service` | string | No | Substring match against selected option labels |
| `duration` | string | No | Extra duration to add if the rule matches |
| `then` | string | Yes | Action identifier (e.g., `apply_combo_pricing`) |

### Supported `then` Actions

| Action | Effect |
|--------|--------|
| `apply_combo_pricing` | Records combo pricing rule; actual pricing is applied via `price_with_cut` on options |
| `apply_cut_discount` | Records a note in `appliedRules`; if `duration` is provided, it is added to total duration |

---

## 7. Runtime Semantics

### 7.1 Price Calculation

When an option is selected:

1. If `price_with_cut` is set **and** any previous selection includes the substring `cut`, use `price_with_cut`.
2. Otherwise, use `price` (or `0` if absent).

### 7.2 Duration Calculation

1. If `books_for` is present, use it.
2. Else, if `duration` is present, use it.
3. Else, duration is `0`.

### 7.3 Rule Evaluation

After each selection, rules are evaluated against the accumulated selections. Matching rules append descriptive strings to `appliedRules`. If a rule includes `duration`, that duration is added to the total duration.

---

## 8. Duration Parsing

The parser accepts a small set of human-friendly formats. Supported tokens include:

- `"45min"`
- `"1hr"`
- `"1hr 30min"`
- `"90min"`

Durations are case-insensitive and whitespace-tolerant (`1hr`, `1 hr`, `1HR` are all accepted). If no `hr` or `min` values are detected, duration defaults to 0.

---

## 9. Validation Rules and Error Codes

The validator returns structured issues with codes, messages, and (when available) line/column positions.

### Example Validation Response

```json
{
  "valid": false,
  "issues": [
    {
      "code": "ROOT_NOT_FOUND",
      "message": "root node \"missing_root\" not found in nodes",
      "line": 2,
      "column": 7
    }
  ]
}
```

### Error Codes

| Code | Meaning |
|------|--------|
| `YAML_PARSE_ERROR` | YAML cannot be parsed |
| `NAME_REQUIRED` | Missing top-level `name` |
| `ROOT_REQUIRED` | Missing top-level `root` |
| `NODES_REQUIRED` | Missing or empty `nodes` |
| `ROOT_NOT_FOUND` | `root` does not reference a node |
| `QUESTION_REQUIRED` | Decision node missing `question` |
| `OPTIONS_REQUIRED` | Decision node has no options |
| `OPTION_LABEL_REQUIRED` | Option missing `label` |
| `TERMINAL_ACTION_REQUIRED` | Terminal node missing `action` |
| `OPTION_NEXT_NOT_FOUND` | `next` references a node that does not exist |

### Line/Column Availability

- Line/column is provided for:
  - Top-level `name` and `root`
  - Node IDs
  - Option labels / option blocks
- Missing fields may have best-effort positions (e.g., node-level line).

---

## 10. Examples

### Example A: Minimal Tree

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
  end:
    type: terminal
    action: book_appointment
```

### Example B: Combo Pricing

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

### Example C: Optional Add-on

```yaml
name: Add-ons
root: base
nodes:
  base:
    question: "Base service?"
    options:
      - label: "Standard"
        price: 5000
        next: add_on
  add_on:
    question: "Add an extra?"
    optional: true
    options:
      - label: "Scalp Massage"
        price: 1500
        duration: 10min
        next: end
  end:
    type: terminal
    action: book_appointment
```

---

## 11. Best Practices

- **Keep IDs descriptive**: `haircut`, `color`, `end` are better than `node1`.
- **Use cents**: Prices must be integers (no decimals).
- **Test all paths**: Each branch should reach a terminal node.
- **Keep trees shallow**: 3–5 questions is a good starting point.
- **Validate before publishing**: Always run the validator before creating or updating.

---

## 12. Known Limitations

- No built-in multi-select node type (one option per question).
- The backend does not enforce `optional`; it is intended for UI usage.
- Validation positions are best-effort for missing fields.

---

## 13. Appendix: EBNF Sketch

This sketch is illustrative rather than normative.

```ebnf
DecisionTree ::= "name:" String "root:" NodeID "nodes:" NodeMap ("rules:" RuleArray)?
NodeMap      ::= (NodeID ":" Node)+
Node         ::= DecisionNode | TerminalNode
DecisionNode ::= "question:" String ("optional:" Boolean)? "options:" OptionArray
TerminalNode ::= "type:" "terminal" "action:" String
OptionArray  ::= ("-" Option)+
Option       ::= "label:" String ("price:" Integer)? ("price_with_cut:" Integer)?
                ("duration:" Duration)? ("books_for:" Duration)? ("next:" NodeID)? ("note:" String)?
RuleArray    ::= ("-" Rule)+
Rule         ::= ("if_service_includes:" StringArray | "if_service:" String)
                ("duration:" Duration)? "then:" String
```
