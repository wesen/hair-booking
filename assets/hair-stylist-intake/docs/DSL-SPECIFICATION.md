# Decision Tree DSL Specification

**Version:** 1.0  
**Author:** Manus AI  
**Last Updated:** January 18, 2026

---

## Overview

The Decision Tree Domain-Specific Language (DSL) is a YAML-based configuration format designed for creating interactive service selection wizards. This specification defines the syntax, semantics, and validation rules for building decision trees that guide users through multi-step service selection processes with dynamic pricing calculations.

The DSL was specifically designed for service-based businesses such as salons, spas, and consulting firms where service combinations affect final pricing. The engine supports conditional pricing rules, combo discounts, duration calculations, and terminal actions.

---

## Core Concepts

### Decision Tree Structure

A decision tree consists of interconnected nodes that represent questions or decision points. Each node presents options to the user, and selecting an option navigates to the next node in the tree. The tree continues until reaching a terminal node, which triggers a final action such as booking confirmation.

### Pricing Model

All prices are stored as **integers representing cents** (not dollars). This eliminates floating-point arithmetic errors and ensures precise calculations. For example, $55.00 is stored as `5500` cents. The client interface automatically converts cents to dollar display format.

### Node Types

The DSL supports two primary node types:

**Decision Nodes** present a question with multiple options. Each option may include pricing, duration, and a reference to the next node. Decision nodes drive the interactive flow and accumulate service selections.

**Terminal Nodes** mark the end of the decision tree. When reached, they trigger the specified action (typically booking or checkout). Terminal nodes have `type: terminal` and an `action` field instead of options.

---

## YAML Structure

### Root Schema

Every decision tree must include the following root-level fields:

```yaml
name: string           # Display name of the decision tree
root: string           # ID of the starting node
nodes: object          # Map of node IDs to node definitions
rules: array           # Optional: pricing and logic rules
```

### Node Schema

Each node in the `nodes` object follows this structure:

**For Decision Nodes:**

```yaml
node_id:
  question: string                    # Question text displayed to user
  optional: boolean                   # Optional: if true, user can skip
  options: array                      # Array of option objects
    - label: string                   # Display text for the option
      price: integer                  # Optional: price in cents
      price_with_cut: integer         # Optional: combo price when cut is selected
      duration: string                # Optional: duration (e.g., "45min", "1hr")
      books_for: string               # Optional: booking duration override
      next: string                    # ID of next node to navigate to
      note: string                    # Optional: additional information
```

**For Terminal Nodes:**

```yaml
node_id:
  type: terminal                      # Marks this as an end node
  action: string                      # Action to trigger (e.g., "book_appointment")
```

### Rules Schema

The optional `rules` array defines conditional logic for pricing and flow control:

```yaml
rules:
  - if_service_includes: array        # Array of service types (e.g., ["cut", "color"])
    then: string                      # Action to take (e.g., "apply_combo_pricing")
  - if_service: string                # Single service type
    duration: string                  # Duration for this service
    then: string                      # Action to take
```

---

## Field Specifications

### Required Fields

| Field | Type | Location | Description |
|-------|------|----------|-------------|
| `name` | string | Root | Human-readable name of the decision tree |
| `root` | string | Root | Node ID where the tree begins |
| `nodes` | object | Root | Collection of all nodes in the tree |
| `question` | string | Decision Node | Question text presented to the user |
| `options` | array | Decision Node | Available choices for the user |
| `label` | string | Option | Display text for the option button |

### Optional Fields

| Field | Type | Location | Description | Example |
|-------|------|----------|-------------|---------|
| `optional` | boolean | Decision Node | Allows user to skip this question | `true` |
| `price` | integer | Option | Base price in cents | `5500` |
| `price_with_cut` | integer | Option | Discounted price when combined with cut | `12000` |
| `duration` | string | Option | Service duration | `"45min"`, `"1hr"` |
| `books_for` | string | Option | Booking time slot override | `"90min"` |
| `next` | string | Option | ID of next node | `"base_color"` |
| `note` | string | Option | Additional context or instructions | `"By consult only"` |
| `rules` | array | Root | Conditional pricing and flow rules | See Rules section |

---

## Pricing Logic

### Base Pricing

When an option includes a `price` field, that amount is added to the running total. Prices accumulate as the user progresses through the tree. If an option has no price, it contributes $0.00 to the total.

### Combo Pricing

The `price_with_cut` field enables conditional pricing. When a user has already selected a service containing "cut" in its label, and then selects an option with `price_with_cut`, the system uses the combo price instead of the base price. This allows for "cut + color" package discounts.

**Example:**

```yaml
options:
  - label: "Partial Foils"
    price: 12000              # $120.00 standalone
    price_with_cut: 15500     # $155.00 when combined with cut
    next: additional_services
```

If the user previously selected "Women's Cut", the system charges $155.00 for Partial Foils. If no cut was selected, it charges $120.00.

### Duration Calculation

Service duration is tracked separately from pricing. The `duration` field specifies how long a service takes (e.g., `"45min"`, `"1hr"`, `"90min"`). The system accumulates durations to calculate total appointment time.

The `books_for` field overrides the displayed duration for booking purposes. For example, a service might take 45 minutes but require a 1-hour booking slot for setup and cleanup.

---

## Navigation Flow

### Linear Navigation

Most decision trees follow a linear path where each option points to a single next node:

```yaml
haircuts:
  question: "What type of haircut?"
  options:
    - label: "Men's Cut"
      price: 5500
      next: base_color
```

### Conditional Navigation

Options can navigate to different nodes based on the selection:

```yaml
base_color:
  question: "Base color service?"
  options:
    - label: "No"
      next: highlights
    - label: "Yes"
      price: 9500
      next: cut_with_color
```

### Terminal Navigation

When an option's `next` field points to a terminal node, the tree ends:

```yaml
additional_services:
  question: "Additional services?"
  options:
    - label: "No additional services"
      next: end

end:
  type: terminal
  action: book_appointment
```

---

## Validation Rules

### Structural Validation

The DSL parser enforces the following structural requirements:

**Root Node Existence:** The `root` field must reference a node ID that exists in the `nodes` object. If the root node is missing, the tree cannot start.

**Node Reference Integrity:** Every `next` field in options must reference a valid node ID in the `nodes` object. Dangling references cause navigation errors.

**Terminal Node Format:** Terminal nodes must include `type: terminal` and `action` fields. They cannot have `question` or `options` fields.

**Decision Node Format:** Decision nodes must include a `question` field and an `options` array with at least one option. Each option must have a `label` field.

### Data Type Validation

The parser validates field types to prevent runtime errors:

| Field | Expected Type | Validation |
|-------|--------------|------------|
| `name` | string | Non-empty string |
| `root` | string | Non-empty string, must exist in nodes |
| `question` | string | Non-empty string |
| `label` | string | Non-empty string |
| `price` | integer | Positive integer (cents) |
| `price_with_cut` | integer | Positive integer (cents) |
| `next` | string | Must reference existing node ID |
| `optional` | boolean | true or false |

### Business Logic Validation

Beyond syntax, the DSL enforces business rules:

**Price Consistency:** If an option has `price_with_cut`, it should also have a base `price`. The combo price typically differs from the base price to reflect a discount or premium.

**Duration Format:** Duration strings must follow the format `"<number><unit>"` where unit is `"min"` or `"hr"`. Examples: `"30min"`, `"1hr"`, `"90min"`.

**Circular Reference Prevention:** The tree should not contain circular paths that trap users in infinite loops. While not automatically validated, designers should ensure every path leads to a terminal node.

---

## Rules System

### Rule Structure

Rules define conditional behavior based on user selections. Each rule includes a condition (`if_service_includes` or `if_service`) and an action (`then`):

```yaml
rules:
  - if_service_includes: ["cut", "color"]
    then: apply_combo_pricing
  - if_service: balayage
    duration: 1hr_45min
    then: apply_cut_discount
```

### Supported Conditions

**`if_service_includes`:** Checks if the user's selections include all specified service types. Service types are matched by substring search in option labels.

**`if_service`:** Checks if the user selected a specific service by exact label match.

### Supported Actions

**`apply_combo_pricing`:** Activates combo pricing logic for subsequent options with `price_with_cut` fields.

**`apply_cut_discount`:** Applies a discount when a cut service is combined with the specified service.

### Rule Evaluation

Rules are evaluated after each option selection. When a rule's condition matches, its action is applied to the current session. Multiple rules can be active simultaneously.

---

## Best Practices

### Naming Conventions

Use descriptive node IDs that reflect their purpose. Good examples include `haircuts`, `base_color`, `highlights`, and `additional_services`. Avoid generic names like `node1`, `step2`, or `question`.

### Price Granularity

Always store prices in cents to avoid floating-point errors. When displaying prices to users, divide by 100 and format as currency. Never perform arithmetic on dollar amounts.

### Navigation Design

Design trees with clear escape routes. Every path should eventually reach a terminal node. Avoid creating dead ends where users cannot proceed or go back.

### Optional Questions

Use the `optional: true` field sparingly. Most decision points should require a selection to ensure complete service specification. Optional questions work well for add-ons or customizations.

### Combo Pricing Strategy

When offering combo discounts, ensure the `price_with_cut` value is less than the sum of individual prices. This creates a clear incentive for users to bundle services.

---

## Error Handling

### Parser Errors

When the YAML parser encounters invalid syntax, it returns a structured error with the line number and description. Common syntax errors include:

- Missing colons after field names
- Incorrect indentation (YAML requires consistent spacing)
- Unquoted strings containing special characters
- Missing required fields

### Validation Errors

After parsing, the validator checks for semantic errors:

- **Missing Root Node:** The specified root node does not exist in the nodes object
- **Dangling Reference:** An option's `next` field references a non-existent node
- **Invalid Terminal Node:** A terminal node includes `question` or `options` fields
- **Empty Options Array:** A decision node has zero options

### Runtime Errors

During tree execution, the engine may encounter:

- **Navigation Error:** User reached a node that doesn't exist (indicates validation failure)
- **Pricing Error:** Combo pricing logic failed due to missing fields
- **Duration Error:** Duration string format is invalid

---

## Example: Complete Decision Tree

```yaml
name: Hair Cuts Decision Tree
root: haircuts

nodes:
  haircuts:
    question: "What type of haircut?"
    options:
      - label: "Men's Cut"
        price: 5500
        duration: 45min
        next: base_color
      - label: "Women's Cut"
        price: 8500
        duration: 1hr
        next: base_color
      - label: "Child's Cut"
        price: 4000
        duration: 30min
        next: base_color

  base_color:
    question: "Base color service?"
    options:
      - label: "No"
        next: highlights
      - label: "Yes"
        price: 9500
        duration: 90min
        next: cut_with_color

  cut_with_color:
    question: "Cut with color?"
    options:
      - label: "No"
        next: highlights
      - label: "Yes"
        price: 13500
        next: highlights

  highlights:
    question: "Highlights?"
    options:
      - label: "No"
        next: end
      - label: "Partial Foils"
        price: 12000
        price_with_cut: 15500
        next: end
      - label: "Full"
        price: 17500
        price_with_cut: 20500
        next: end

  end:
    type: terminal
    action: book_appointment

rules:
  - if_service_includes: [cut, color]
    then: apply_combo_pricing
```

This tree guides users through haircut selection, optional color services, and highlights with combo pricing when cut and color are combined.

---

## Extensibility

### Future Enhancements

The DSL is designed for extensibility. Potential future additions include:

**Conditional Questions:** Show or hide nodes based on previous selections using `if` conditions on nodes themselves.

**Dynamic Pricing:** Support percentage-based discounts or time-based pricing (e.g., weekday vs. weekend rates).

**Multi-Select Options:** Allow users to select multiple options from a single question (e.g., multiple add-on services).

**Validation Expressions:** Add custom validation rules using expressions (e.g., "require at least one color service if highlights are selected").

### Custom Actions

Terminal nodes currently support a single `action` field. Future versions may support custom actions with parameters:

```yaml
end:
  type: terminal
  action: book_appointment
  params:
    send_confirmation: true
    notify_staff: true
```

---

## Appendix: Grammar Definition

### EBNF Grammar

```ebnf
DecisionTree ::= "name:" String "root:" NodeID "nodes:" NodeMap ("rules:" RuleArray)?

NodeMap ::= (NodeID ":" Node)+

Node ::= DecisionNode | TerminalNode

DecisionNode ::= "question:" String ("optional:" Boolean)? "options:" OptionArray

TerminalNode ::= "type:" "terminal" "action:" String

OptionArray ::= ("-" Option)+

Option ::= "label:" String ("price:" Integer)? ("price_with_cut:" Integer)? 
           ("duration:" Duration)? ("books_for:" Duration)? 
           ("next:" NodeID)? ("note:" String)?

RuleArray ::= ("-" Rule)+

Rule ::= ("if_service_includes:" StringArray | "if_service:" String) 
         ("duration:" Duration)? "then:" String

NodeID ::= String
Duration ::= String  # Format: "<number><unit>" where unit is "min" or "hr"
```

---

## Conclusion

The Decision Tree DSL provides a declarative, human-readable format for building complex service selection wizards. By separating structure from logic, it enables non-technical users to create and modify decision trees through visual editors while maintaining a robust, version-controlled configuration format. The pricing engine handles combo discounts and duration tracking automatically, reducing implementation complexity for common service business scenarios.
