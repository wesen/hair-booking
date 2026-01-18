# Decision Tree DSL Quick Reference

**Version:** 1.0  
**Author:** Manus AI  
**Last Updated:** January 18, 2026

---

## Minimal Example

```yaml
name: Service Name
root: first_question

nodes:
  first_question:
    question: "Your question here?"
    options:
      - label: "Option 1"
        price: 5000
        duration: 30min
        next: end
      - label: "Option 2"
        price: 7500
        duration: 45min
        next: end

  end:
    type: terminal
    action: book_appointment
```

---

## Field Reference

### Root Level

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name of the decision tree |
| `root` | string | Yes | Node ID where the tree starts |
| `nodes` | object | Yes | Map of node IDs to node definitions |
| `rules` | array | No | Conditional pricing and flow rules |

### Decision Node

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | Question text displayed to user |
| `options` | array | Yes | Array of option objects |
| `optional` | boolean | No | If true, user can skip this question |

### Option Object

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `label` | string | Yes | Display text for the option | `"Women's Cut"` |
| `price` | integer | No | Price in cents | `5500` |
| `price_with_cut` | integer | No | Combo price when cut selected | `12000` |
| `duration` | string | No | Service duration | `"45min"`, `"1hr"` |
| `books_for` | string | No | Booking duration override | `"90min"` |
| `next` | string | No | Next node ID | `"base_color"` |
| `note` | string | No | Additional information | `"By consult only"` |

### Terminal Node

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"terminal"` |
| `action` | string | Yes | Action to trigger (e.g., `"book_appointment"`) |

---

## Price Conversion

| Cents | Dollars |
|-------|---------|
| 1000 | $10.00 |
| 2500 | $25.00 |
| 5000 | $50.00 |
| 7500 | $75.00 |
| 10000 | $100.00 |
| 15000 | $150.00 |
| 20000 | $200.00 |

**Formula:** `cents = dollars × 100`

---

## Duration Format

| Format | Meaning |
|--------|---------|
| `15min` | 15 minutes |
| `30min` | 30 minutes |
| `45min` | 45 minutes |
| `1hr` | 1 hour |
| `90min` | 90 minutes |
| `2hr` | 2 hours |
| `3hr` | 3 hours |

**Pattern:** `<number><unit>` where unit is `min` or `hr`

---

## Common Patterns

### Linear Flow

```yaml
nodes:
  step1:
    question: "Question 1?"
    options:
      - label: "Answer A"
        next: step2

  step2:
    question: "Question 2?"
    options:
      - label: "Answer B"
        next: end

  end:
    type: terminal
    action: book_appointment
```

### Branching Flow

```yaml
nodes:
  choice:
    question: "Choose path?"
    options:
      - label: "Path A"
        next: path_a
      - label: "Path B"
        next: path_b

  path_a:
    question: "Path A question?"
    options:
      - label: "Continue"
        next: end

  path_b:
    question: "Path B question?"
    options:
      - label: "Continue"
        next: end

  end:
    type: terminal
    action: book_appointment
```

### Optional Question

```yaml
nodes:
  optional_step:
    question: "Add extras?"
    optional: true
    options:
      - label: "Extra 1"
        price: 1000
        next: end
      - label: "Extra 2"
        price: 1500
        next: end

  end:
    type: terminal
    action: book_appointment
```

### Combo Pricing

```yaml
nodes:
  base_service:
    question: "Select base service?"
    options:
      - label: "Haircut"
        price: 5500
        next: add_ons

  add_ons:
    question: "Add color?"
    options:
      - label: "No"
        next: end
      - label: "Full Color"
        price: 17500
        price_with_cut: 20500
        next: end

  end:
    type: terminal
    action: book_appointment
```

---

## Validation Checklist

- [ ] Root node exists in nodes object
- [ ] All `next` references point to valid node IDs
- [ ] Every path leads to a terminal node
- [ ] Prices are integers (cents, not dollars)
- [ ] Durations follow `<number><unit>` format
- [ ] Terminal nodes have `type: terminal` and `action`
- [ ] Decision nodes have `question` and `options`
- [ ] Each option has a `label`

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Root node not found" | `root` references non-existent node | Check spelling, ensure node is defined |
| "Invalid next reference" | `next` points to missing node | Verify all node IDs exist |
| "Terminal node cannot have options" | Terminal node has `options` array | Remove `options`, keep only `type` and `action` |
| "Price must be an integer" | Price is decimal (e.g., `55.00`) | Use cents: `5500` not `55.00` |
| "Invalid duration format" | Duration has wrong format | Use `30min` or `1hr`, not `30 min` or `1 hour` |

---

## YAML Syntax Tips

### Indentation

Use 2 spaces per level (not tabs):

```yaml
nodes:
  node_id:
    question: "Text"
    options:
      - label: "Option"
```

### Colons and Spaces

Always use colon + space:

```yaml
name: Decision Tree  # Correct
name:Decision Tree   # Wrong
name :Decision Tree  # Wrong
```

### Lists

Start list items with dash + space:

```yaml
options:
  - label: "Option 1"  # Correct
  -label: "Option 1"   # Wrong
```

### Quotes

Use quotes for text with special characters:

```yaml
question: "What's your preference?"  # Correct (has apostrophe)
question: What is your preference    # Correct (no special chars)
```

---

## AI Assistant Prompts

### Generate from Description

```
Create a decision tree for [business type] with [services] priced at [prices]
```

### Add Features

```
Add a question about [topic] after [node name]
```

### Modify Pricing

```
Change [service name] price from $X to $Y
```

### Add Combo Pricing

```
Add combo pricing for [service] when combined with [other service]
```

### Extract from Image

Upload image and say:
```
Extract the services and prices from this menu and create a decision tree
```

---

## Visual Editor Tips

- **Add Node:** Click "Add Node" button in Decision Nodes section
- **Edit Option:** Click option accordion to expand form fields
- **Remove Option:** Click trash icon next to option
- **Price Display:** Enter cents, see dollar conversion below field
- **Sync to YAML:** Changes auto-sync with toast notification
- **Terminal Node:** Leave options empty to create terminal node

---

## Keyboard Shortcuts (Admin Panel)

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save changes |
| Tab | Switch between tabs |
| Esc | Close dialogs |

---

## Testing Checklist

- [ ] Test minimum price path
- [ ] Test maximum price path
- [ ] Test all navigation branches
- [ ] Test optional question skip
- [ ] Test combo pricing activation
- [ ] Verify duration calculations
- [ ] Check mobile display
- [ ] Confirm terminal node reached

---

## Support Resources

- **DSL Specification:** Complete technical reference
- **User Guide:** Detailed tutorials and examples
- **AI Assistant:** In-app help and generation
- **Visual Editor:** Form-based tree builder

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 18, 2026 | Initial release |
