# Decision Tree DSL User Guide

**Version:** 1.0  
**Author:** Manus AI  
**Last Updated:** January 18, 2026

---

## Introduction

This user guide teaches you how to create interactive service selection wizards using the Decision Tree DSL. Whether you run a salon, spa, consulting practice, or any service-based business, this guide will help you build custom intake flows that guide clients through service options while calculating prices dynamically.

The Decision Tree DSL uses YAML syntax, a human-readable configuration format that requires no programming knowledge. You can create decision trees using the built-in visual editor, AI assistant, or by writing YAML directly. This guide covers all three approaches with practical examples.

---

## Getting Started

### Your First Decision Tree

Let us create a simple decision tree for a nail salon. This tree will ask clients what type of service they want and calculate the total price.

Open the admin panel and click "New Tree". You will see three tabs: YAML Editor, Visual Editor, and AI Assistant. For this first example, we will use the YAML Editor.

Paste the following YAML into the editor:

```yaml
name: Nail Salon Services
root: service_type

nodes:
  service_type:
    question: "What service would you like?"
    options:
      - label: "Basic Manicure"
        price: 3000
        duration: 30min
        next: end
      - label: "Gel Manicure"
        price: 5000
        duration: 45min
        next: end
      - label: "Basic Pedicure"
        price: 4500
        duration: 45min
        next: end

  end:
    type: terminal
    action: book_appointment
```

Click "Update" to save the tree. Toggle the "Published" switch to make it visible to clients. Now click "View Site" to see your decision tree in action.

### Understanding the Structure

Let us break down what each part does:

The **name** field sets the display title that clients see. Choose a descriptive name that explains what services this tree covers.

The **root** field specifies where the tree starts. In our example, `service_type` is the first question clients encounter. The root must match one of the node IDs in the nodes section.

The **nodes** section contains all the questions and options. Each node has a unique ID (like `service_type` or `end`) that other nodes reference. Think of node IDs as internal labels that connect your tree together.

The **service_type** node is a decision node. It presents a question and multiple options. Each option has a label (what clients see), a price in cents, a duration, and a next field pointing to the next node.

The **end** node is a terminal node. When clients reach this node, the tree stops and triggers the booking action. Terminal nodes always have `type: terminal` and an `action` field.

### Price Format

Notice that prices are written as integers: `3000`, `5000`, `4500`. These represent cents, not dollars. The system automatically converts them to dollar format for display. This approach eliminates rounding errors and ensures precise calculations.

| Cents | Dollars |
|-------|---------|
| 3000 | $30.00 |
| 5000 | $50.00 |
| 4500 | $45.00 |
| 12500 | $125.00 |

Always multiply your dollar amount by 100 to get cents. A $125 service becomes `12500` in the YAML.

---

## Building Multi-Step Trees

Most real-world scenarios require multiple questions. Let us expand our nail salon to ask about add-ons.

```yaml
name: Nail Salon Services
root: service_type

nodes:
  service_type:
    question: "What service would you like?"
    options:
      - label: "Basic Manicure"
        price: 3000
        duration: 30min
        next: add_ons
      - label: "Gel Manicure"
        price: 5000
        duration: 45min
        next: add_ons
      - label: "Basic Pedicure"
        price: 4500
        duration: 45min
        next: add_ons

  add_ons:
    question: "Would you like any add-ons?"
    options:
      - label: "No, just the base service"
        next: end
      - label: "Nail Art"
        price: 1500
        duration: 15min
        next: end
      - label: "Paraffin Wax Treatment"
        price: 1000
        duration: 10min
        next: end

  end:
    type: terminal
    action: book_appointment
```

Now clients answer two questions. After selecting their base service, they see add-on options. The prices accumulate: if someone chooses Gel Manicure ($50) and Nail Art ($15), the total becomes $65.

### Navigation Flow

Each option's `next` field creates the flow. In our example:

1. Client starts at `service_type` (the root)
2. Selects "Gel Manicure" which has `next: add_ons`
3. System navigates to the `add_ons` node
4. Client selects "Nail Art" which has `next: end`
5. System reaches the terminal node and shows booking confirmation

You can create complex flows by varying the `next` field. Different options can lead to different paths through the tree.

---

## Conditional Pricing

Many service businesses offer package discounts. For example, highlights cost less when combined with a haircut. The DSL supports this through combo pricing.

### Using price_with_cut

Let us create a hair salon tree with combo pricing:

```yaml
name: Hair Salon Services
root: haircut

nodes:
  haircut:
    question: "What type of haircut?"
    options:
      - label: "Women's Cut"
        price: 8500
        duration: 1hr
        next: color
      - label: "Men's Cut"
        price: 5500
        duration: 45min
        next: color
      - label: "No haircut today"
        next: color

  color:
    question: "Would you like color services?"
    options:
      - label: "No color"
        next: end
      - label: "Full Highlights"
        price: 17500
        price_with_cut: 20500
        duration: 2hr
        next: end
      - label: "Partial Highlights"
        price: 12000
        price_with_cut: 15500
        duration: 90min
        next: end

  end:
    type: terminal
    action: book_appointment
```

Notice the `price_with_cut` field on the highlight options. Here is how it works:

**Scenario 1: Client selects Women's Cut then Full Highlights**
- Women's Cut: $85.00
- Full Highlights with cut: $205.00
- Total: $290.00

**Scenario 2: Client selects "No haircut today" then Full Highlights**
- No haircut: $0.00
- Full Highlights standalone: $175.00
- Total: $175.00

The system detects whether the client selected a cut by checking if any previous option label contains the word "cut" (case-insensitive). If yes, it uses `price_with_cut`. Otherwise, it uses the base `price`.

### Combo Pricing Strategy

When designing combo pricing, ensure the combined price is less than buying services separately. This creates an incentive for clients to bundle services.

| Service Combination | Separate Pricing | Combo Pricing | Savings |
|---------------------|------------------|---------------|---------|
| Women's Cut + Full Highlights | $85 + $175 = $260 | $290 | $0 (no discount in this example) |
| Women's Cut + Partial Highlights | $85 + $120 = $205 | $240 | $0 (no discount in this example) |

In the example above, the combo prices are actually higher because they represent package pricing. Adjust your `price_with_cut` values to create the pricing structure that fits your business model.

---

## Optional Questions

Sometimes you want to offer optional customizations without forcing a selection. Use the `optional: true` field:

```yaml
spa_services:
  question: "Would you like to add aromatherapy?"
  optional: true
  options:
    - label: "Lavender"
      price: 500
      next: massage_type
    - label: "Eucalyptus"
      price: 500
      next: massage_type
    - label: "Peppermint"
      price: 500
      next: massage_type
```

With `optional: true`, the interface shows a "Skip" button. Clients can proceed without selecting any option. The system navigates to the `next` node of the first option (in this case, `massage_type`).

Use optional questions sparingly. Most decision points should require a selection to ensure you capture complete service specifications.

---

## Duration Tracking

The DSL tracks both pricing and duration. This helps you schedule appointments and manage stylist time.

### Duration Format

Durations use a simple format: number + unit. Supported units are `min` for minutes and `hr` for hours.

| Format | Meaning |
|--------|---------|
| `30min` | 30 minutes |
| `45min` | 45 minutes |
| `1hr` | 1 hour |
| `90min` | 90 minutes (1.5 hours) |
| `2hr` | 2 hours |

The system accumulates durations as clients select services. If someone chooses a 1-hour cut and 2-hour color, the total appointment time is 3 hours.

### Booking Duration Override

Sometimes the actual service time differs from the booking slot needed. Use `books_for` to override:

```yaml
options:
  - label: "Express Facial"
    price: 7500
    duration: 45min
    books_for: 1hr
    next: end
```

This service takes 45 minutes but requires a 1-hour booking slot. The client sees "45min" as the service duration, but the booking system reserves 1 hour to account for setup and cleanup.

---

## Using the Visual Editor

The visual editor provides a form-based interface for creating decision trees without writing YAML. This section shows you how to use it effectively.

### Creating a New Tree

Click "New Tree" in the admin panel and switch to the Visual Editor tab. You will see:

**Decision Tree Settings** at the top where you enter the tree name and root node ID.

**Decision Nodes** section with an "Add Node" button.

Click "Add Node" to create your first decision node. Enter a node ID (like `service_type`) and a question. Then click "Add Option" to create choices.

### Editing Options

Each option has form fields for:

**Label:** The text clients see on the button  
**Next Node:** The node ID to navigate to  
**Price (cents):** The cost in cents (remember: multiply dollars by 100)  
**Duration:** Service time in format like `30min` or `1hr`

As you type, the visual editor shows a dollar conversion below the price field. For example, entering `5500` shows "$55.00" underneath.

### Real-Time YAML Sync

Every change in the visual editor immediately updates the YAML. You will see toast notifications saying "Changes synced to YAML". Switch to the YAML Editor tab to see the generated code.

This two-way sync means you can:

1. Start in the visual editor to build the structure
2. Switch to YAML editor to fine-tune syntax
3. Return to visual editor to adjust prices

The editors stay synchronized, so you never lose work when switching tabs.

### Adding and Removing Nodes

Click "Add Node" to create new decision points. Each node appears as an accordion item in the list. Click the node header to expand and edit its properties.

To remove a node, click the trash icon next to its name. Be careful: removing a node that other options reference will break navigation. The system will show validation errors if you create dangling references.

### Terminal Nodes

To create a terminal node, add a node and leave the options array empty. The visual editor recognizes this as a terminal node and shows a "Terminal" badge.

---

## Using the AI Assistant

The AI assistant generates decision trees from natural language descriptions. This is the fastest way to create complex trees.

### Basic Prompts

Switch to the AI Assistant tab and describe what you want:

> "Create a decision tree for a coffee shop with three drink sizes (small $3, medium $4, large $5) and optional add-ons (extra shot $1, oat milk $0.50, whipped cream $0.50)"

The AI will generate complete YAML with proper pricing in cents, node IDs, and navigation flow. When it finishes, you will see a toast notification: "YAML generated! Check the YAML Editor tab."

### Image Upload

The AI assistant accepts images. Upload photos of handwritten notes, price lists, or menu boards. The AI will extract the information and generate YAML.

For example, upload a photo of your service menu with prices written on it. The AI will:

1. Read the text from the image using OCR
2. Identify services and prices
3. Generate a decision tree structure
4. Convert dollar amounts to cents
5. Create appropriate node IDs and navigation

This is particularly useful when migrating from paper-based intake forms to digital decision trees.

### Refining AI Output

After the AI generates YAML, you can refine it:

**Add more detail in the chat:** "Add a question about preferred stylist after the haircut selection"

**Request modifications:** "Change the Men's Cut price from $55 to $60"

**Ask for explanations:** "Explain how the combo pricing works in this tree"

The AI maintains conversation context, so you can iterate on the design through multiple messages.

---

## Common Patterns

### Linear Flow

The simplest pattern asks a series of questions in order:

```
Question 1 → Question 2 → Question 3 → End
```

Every option at Question 1 leads to Question 2. Every option at Question 2 leads to Question 3. This works well for intake forms with required information.

### Branching Flow

More complex trees branch based on selections:

```
                    → Path A → End
Question 1 → Question 2
                    → Path B → End
```

Different options at Question 2 lead to different subsequent questions. This works well when services have different customization options.

### Optional Add-Ons

A common pattern presents a base service, then asks about add-ons:

```
Base Service → Add-On 1? → Add-On 2? → End
```

Each add-on question includes a "No thanks" option that proceeds to the next question. This accumulates optional services without forcing selections.

### Package Bundles

For businesses offering packages, present the package choice first:

```
Package Selection → Customization → End
```

Each package option leads to relevant customization questions. For example, a "Deluxe Spa Package" might ask about massage oil preference, while a "Basic Facial" skips that question.

---

## Advanced Techniques

### Conditional Navigation

You can create different paths based on selections by varying the `next` field:

```yaml
budget:
  question: "What's your budget?"
  options:
    - label: "Under $50"
      next: basic_services
    - label: "$50-$100"
      next: standard_services
    - label: "Over $100"
      next: premium_services
```

This technique lets you show relevant options based on client preferences or constraints.

### Notes and Instructions

Use the `note` field to provide additional context:

```yaml
options:
  - label: "Custom Color Design"
    price: 25000
    note: "By consultation only. Requires 3-hour appointment."
    next: end
```

Notes appear below the option button in smaller text. Use them for important details like consultation requirements, time commitments, or prerequisites.

### Duration vs. Booking Time

Separate what clients see (duration) from what you need to schedule (books_for):

```yaml
options:
  - label: "Deep Tissue Massage"
    price: 12000
    duration: 60min
    books_for: 90min
    next: end
```

Clients see "60min" but you block 90 minutes on the calendar. This accounts for room turnover, therapist breaks, and consultation time.

---

## Testing Your Decision Tree

Before publishing a decision tree, test it thoroughly:

### Validation Checklist

**Root Node Exists:** Verify the `root` field matches a node ID in your `nodes` section.

**All References Valid:** Check that every `next` field points to an existing node. Dangling references cause navigation errors.

**Terminal Node Reachable:** Ensure every path through the tree eventually reaches a terminal node. Clients should never get stuck.

**Prices in Cents:** Confirm all prices are integers representing cents, not dollars. A $50 service should be `5000`, not `50`.

**Duration Format:** Verify durations follow the `<number><unit>` format like `30min` or `1hr`.

### Test Scenarios

Walk through common client journeys:

**Minimum Service:** Select the cheapest option at each step. Verify the price and duration calculations.

**Maximum Service:** Select the most expensive options. Ensure combo pricing applies correctly.

**Skip Optional Questions:** If you have optional nodes, test the skip functionality.

**Different Paths:** Try different navigation routes to ensure all branches work.

### Preview Mode

The admin panel shows a preview mode indicator at the bottom: "This page is not live and cannot be shared directly. Please publish to get a public link."

This lets you test changes before making them visible to clients. Toggle the "Published" switch only after testing is complete.

---

## Real-World Examples

### Example 1: Consulting Services

```yaml
name: Business Consulting Services
root: consultation_type

nodes:
  consultation_type:
    question: "What type of consultation do you need?"
    options:
      - label: "Strategy Session (1 hour)"
        price: 25000
        duration: 1hr
        next: delivery_format
      - label: "Full Day Workshop"
        price: 150000
        duration: 8hr
        next: delivery_format
      - label: "Ongoing Retainer"
        price: 500000
        note: "Monthly retainer with 10 hours included"
        next: end

  delivery_format:
    question: "How would you like to meet?"
    options:
      - label: "In-Person"
        price: 5000
        note: "Travel fee for local area"
        next: end
      - label: "Video Call"
        next: end
      - label: "Phone Call"
        next: end

  end:
    type: terminal
    action: book_appointment
```

This tree handles different service tiers and delivery formats. The retainer option skips the delivery format question since it includes multiple sessions.

### Example 2: Spa Services

```yaml
name: Spa Day Packages
root: package_selection

nodes:
  package_selection:
    question: "Choose your spa package"
    options:
      - label: "Relaxation Package"
        price: 15000
        duration: 2hr
        note: "Includes massage and facial"
        next: massage_pressure
      - label: "Ultimate Spa Day"
        price: 30000
        duration: 4hr
        note: "Includes massage, facial, and body treatment"
        next: massage_pressure
      - label: "À la Carte"
        next: individual_services

  massage_pressure:
    question: "Preferred massage pressure?"
    options:
      - label: "Light"
        next: aromatherapy
      - label: "Medium"
        next: aromatherapy
      - label: "Deep Tissue"
        price: 2000
        note: "Additional $20 for deep tissue"
        next: aromatherapy

  aromatherapy:
    question: "Add aromatherapy?"
    optional: true
    options:
      - label: "Lavender"
        price: 1000
        next: end
      - label: "Eucalyptus"
        price: 1000
        next: end
      - label: "Peppermint"
        price: 1000
        next: end

  individual_services:
    question: "Select individual service"
    options:
      - label: "60-Minute Massage"
        price: 9000
        duration: 1hr
        next: end
      - label: "Facial Treatment"
        price: 8500
        duration: 1hr
        next: end
      - label: "Body Scrub"
        price: 7000
        duration: 45min
        next: end

  end:
    type: terminal
    action: book_appointment
```

This example shows package-based navigation. Package customers go through customization questions, while à la carte customers select individual services.

### Example 3: Fitness Training

```yaml
name: Personal Training Services
root: experience_level

nodes:
  experience_level:
    question: "What's your fitness experience level?"
    options:
      - label: "Beginner"
        next: session_type
      - label: "Intermediate"
        next: session_type
      - label: "Advanced"
        next: session_type

  session_type:
    question: "Choose your training format"
    options:
      - label: "One-on-One Training"
        price: 8000
        duration: 1hr
        next: session_count
      - label: "Partner Training"
        price: 6000
        duration: 1hr
        note: "Price per person"
        next: session_count
      - label: "Small Group (4-6 people)"
        price: 3500
        duration: 1hr
        note: "Price per person"
        next: session_count

  session_count:
    question: "How many sessions?"
    options:
      - label: "Single Session"
        next: end
      - label: "4-Session Package"
        price: -1000
        note: "Save $10 per session"
        next: end
      - label: "8-Session Package"
        price: -2000
        note: "Save $20 per session"
        next: end

  end:
    type: terminal
    action: book_appointment
```

This example uses negative prices to represent discounts. The base price is set at the session type, and package options subtract from the total.

---

## Troubleshooting

### Common Errors

**"Root node not found"**  
The `root` field references a node ID that does not exist in your `nodes` section. Check for typos and ensure the node is defined.

**"Invalid next reference"**  
An option's `next` field points to a non-existent node. Verify all node IDs are spelled correctly and defined in the `nodes` section.

**"Terminal node cannot have options"**  
You added an `options` array to a terminal node. Terminal nodes should only have `type: terminal` and `action` fields.

**"Price must be an integer"**  
You entered a decimal number for price (like `55.00`). Prices must be whole numbers representing cents. Use `5500` instead of `55.00`.

**"Invalid duration format"**  
The duration string does not match the expected format. Use patterns like `30min`, `1hr`, or `90min`. Do not include spaces.

### YAML Syntax Errors

YAML is sensitive to indentation and formatting. Common syntax mistakes include:

**Inconsistent Indentation:** YAML uses spaces (not tabs) for indentation. Each level should be indented by 2 spaces.

**Missing Colons:** Field names must be followed by a colon and space: `name: value` not `name:value` or `name value`.

**Unquoted Special Characters:** If your text contains colons, quotes, or other special characters, wrap it in quotes: `question: "What's your preference?"`.

**List Item Format:** List items start with a dash and space: `- label: Option` not `-label: Option`.

### Validation in the Editor

The admin panel validates your YAML in real-time. If you see error messages:

1. Read the error description carefully
2. Check the line number mentioned in the error
3. Fix the syntax or reference issue
4. Save again to re-validate

The visual editor prevents many syntax errors by generating valid YAML automatically. If you encounter validation errors, switch to the visual editor to rebuild the problematic section.

---

## Best Practices

### Design Principles

**Keep Trees Shallow:** Limit decision trees to 3-5 questions. Longer trees overwhelm clients and increase abandonment rates.

**Use Clear Labels:** Write option labels in plain language. "Women's Haircut" is better than "Service Type A".

**Provide Context:** Use the `note` field to explain options that might be unfamiliar or require clarification.

**Test on Mobile:** Most clients will use decision trees on phones. Ensure your labels and questions are concise enough for small screens.

### Pricing Strategy

**Round to Friendly Numbers:** Prices like $50, $75, and $100 are easier to understand than $47.50 or $83.25.

**Show Value in Combos:** Make combo pricing obviously beneficial. If a cut is $50 and color is $100, the combo should be less than $150.

**Include All Costs:** Factor in supplies, time, and overhead when setting prices. The decision tree should reflect your actual pricing.

### Maintenance

**Review Quarterly:** Service prices and offerings change. Review your decision trees every few months to ensure accuracy.

**Track Abandonment:** If many clients start but do not complete the tree, consider simplifying the flow or reducing the number of questions.

**Update Seasonally:** Some businesses have seasonal services. Create separate decision trees for different times of year rather than cluttering one tree with conditional logic.

---

## Getting Help

### Using the AI Assistant

When you are stuck, ask the AI assistant for help:

- "How do I add combo pricing to this tree?"
- "Create a node for optional add-ons"
- "Explain why this YAML has a validation error"

The AI understands the DSL syntax and can generate examples, fix errors, and suggest improvements.

### Documentation Reference

This user guide covers common scenarios. For detailed technical specifications, see the **DSL Specification** document. It includes:

- Complete field reference
- Validation rules
- Grammar definition
- Error handling details

### Support

If you encounter issues not covered in this guide, check the application logs in the admin panel or contact support with your YAML file and a description of the problem.

---

## Conclusion

The Decision Tree DSL empowers you to create sophisticated service selection flows without programming. Start with simple linear trees, then add branching, combo pricing, and optional questions as you become comfortable with the syntax.

Remember the key principles:

- Prices are always in cents (multiply dollars by 100)
- Every path must lead to a terminal node
- Use the visual editor for structure, YAML editor for fine-tuning
- Test thoroughly before publishing

With practice, you will build decision trees that guide clients smoothly through your services while accurately calculating prices and durations. The result is a better client experience and more efficient intake process for your business.
