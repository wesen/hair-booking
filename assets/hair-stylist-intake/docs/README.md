# Hair Stylist Intake App - Documentation Package

**Version:** 1.0  
**Created:** January 18, 2026  
**Author:** Manus AI

---

## Overview

This documentation package contains everything you need to understand, use, and extend the Hair Stylist Intake application. The app is a decision tree engine that guides clients through service selection with dynamic pricing calculations.

---

## Documentation Files

### 1. DSL-SPECIFICATION.md

**Purpose:** Complete technical specification of the Decision Tree DSL

**Contents:**
- YAML structure and syntax
- Field definitions and data types
- Pricing logic and combo pricing rules
- Validation rules and error handling
- EBNF grammar definition
- Extensibility guidelines

**Use this when:** You need detailed technical information about the DSL format, want to understand validation rules, or plan to extend the system.

### 2. USER-GUIDE.md

**Purpose:** Comprehensive tutorial for creating decision trees

**Contents:**
- Getting started with your first tree
- Step-by-step examples for common scenarios
- Visual editor, YAML editor, and AI assistant usage
- Real-world examples (salon, spa, consulting, fitness)
- Troubleshooting common errors
- Best practices and design principles

**Use this when:** You're learning to create decision trees, need examples for specific use cases, or want guidance on best practices.

### 3. QUICK-REFERENCE.md

**Purpose:** Fast lookup for syntax and common patterns

**Contents:**
- Minimal example template
- Field reference tables
- Price and duration conversion charts
- Common patterns (linear, branching, optional, combo pricing)
- Validation checklist
- YAML syntax tips
- AI assistant prompt examples

**Use this when:** You need quick syntax lookup, want to copy-paste common patterns, or need a validation checklist.

---

## Using This Documentation

### For First-Time Users

1. Start with **USER-GUIDE.md** section "Getting Started"
2. Follow the "Your First Decision Tree" tutorial
3. Experiment with the visual editor
4. Try the AI assistant with simple prompts
5. Reference **QUICK-REFERENCE.md** as you build

### For Experienced Users

1. Use **QUICK-REFERENCE.md** for syntax lookup
2. Reference **DSL-SPECIFICATION.md** for advanced features
3. Copy patterns from **USER-GUIDE.md** examples
4. Use AI assistant for complex trees

### For Developers

1. Read **DSL-SPECIFICATION.md** completely
2. Study the validation rules and grammar
3. Review the extensibility section
4. Examine the codebase:
   - `server/dsl-parser.ts` - YAML parsing
   - `server/decision-engine.ts` - Execution engine
   - `client/src/pages/Intake.tsx` - Client interface
   - `client/src/pages/Admin.tsx` - Admin panel
   - `client/src/components/VisualEditor.tsx` - Visual editor
   - `client/src/components/AIChat.tsx` - AI assistant

---

## Application Features

### Client-Facing

- **Interactive Decision Trees:** Step-by-step service selection
- **Dynamic Pricing:** Real-time price calculation with combo discounts
- **Duration Tracking:** Total appointment time display
- **Progress Indicator:** Visual progress through the tree
- **Mobile Responsive:** Works on all device sizes
- **Service Summary:** Final review before booking

### Admin Panel

- **YAML Editor:** Direct code editing with syntax highlighting
- **Visual Editor:** Form-based tree building without code
- **AI Assistant:** Natural language tree generation with image support
- **Template Management:** Create, edit, publish, and unpublish trees
- **Real-Time Validation:** Immediate error feedback
- **Preview Mode:** Test trees before publishing

---

## Quick Start

### Creating Your First Tree

**Option 1: Use AI Assistant**

1. Open Admin Panel
2. Click "New Tree"
3. Switch to "AI Assistant" tab
4. Type: "Create a decision tree for [your business] with [services and prices]"
5. Review generated YAML
6. Click "Update" and toggle "Published"

**Option 2: Use Visual Editor**

1. Open Admin Panel
2. Click "New Tree"
3. Switch to "Visual Editor" tab
4. Enter tree name and root node ID
5. Click "Add Node" to create decision points
6. Fill in questions, options, prices, and durations
7. Click "Update" and toggle "Published"

**Option 3: Write YAML**

1. Open Admin Panel
2. Click "New Tree"
3. Stay on "YAML Editor" tab
4. Paste or write your YAML (see QUICK-REFERENCE.md for template)
5. Click "Update" and toggle "Published"

---

## Architecture Overview

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- tRPC for type-safe API calls
- Wouter for routing
- shadcn/ui component library

**Backend:**
- Express 4 server
- tRPC 11 for API layer
- MySQL/TiDB database via Drizzle ORM
- js-yaml for DSL parsing
- Manus LLM integration for AI assistant

**Decision Tree Engine:**
- YAML-based DSL parser
- State machine for navigation
- Combo pricing rules engine
- Duration accumulator
- Session storage for client state

### Data Flow

1. **Admin creates tree:** YAML → Parser → Validation → Database
2. **Client loads tree:** Database → tRPC → React state → UI
3. **Client navigates:** Selection → Engine → Price calculation → Next node
4. **Booking:** Final state → Summary page → Database

---

## Extending the System

### Adding New Node Types

To add a new node type (e.g., multi-select):

1. Update `shared/types.ts` with new node interface
2. Extend parser in `server/dsl-parser.ts`
3. Add execution logic in `server/decision-engine.ts`
4. Update client UI in `client/src/pages/Intake.tsx`
5. Add visual editor support in `client/src/components/VisualEditor.tsx`

### Custom Pricing Rules

To add new pricing rules:

1. Define rule schema in `shared/types.ts`
2. Implement rule evaluation in `server/decision-engine.ts`
3. Update parser to recognize new rule syntax
4. Document in DSL-SPECIFICATION.md

### Integration with External Systems

The app supports integration via:

- **Booking API:** Extend `server/routers.ts` to call external booking systems
- **Payment Processing:** Add Stripe or similar via tRPC procedures
- **Email Notifications:** Use built-in notification system or external service
- **Calendar Sync:** Integrate with Google Calendar or similar

---

## Troubleshooting

### Common Issues

**"Root node not found"**
- Check that `root` field matches a node ID in `nodes`
- Verify spelling and case sensitivity

**"Invalid next reference"**
- Ensure all `next` fields point to existing nodes
- Check for typos in node IDs

**Prices showing incorrectly**
- Confirm prices are in cents (multiply dollars by 100)
- Check that price fields are integers, not decimals

**Visual editor not syncing**
- Refresh the page
- Check browser console for errors
- Verify YAML is valid before switching tabs

**AI assistant not responding**
- Check network connection
- Verify LLM integration is configured
- Try a simpler prompt

### Getting Help

1. Review relevant documentation section
2. Check the validation error message
3. Use AI assistant to explain errors
4. Examine example trees in presets
5. Contact support with YAML file and error description

---

## Best Practices

### Decision Tree Design

- Keep trees shallow (3-5 questions maximum)
- Use clear, concise labels
- Provide context with `note` fields
- Test all navigation paths
- Ensure every path reaches a terminal node

### Pricing Strategy

- Round to friendly numbers ($50, $75, $100)
- Make combo discounts obvious
- Include all costs (supplies, time, overhead)
- Review prices quarterly

### Maintenance

- Test trees after editing
- Review analytics to identify abandonment points
- Update seasonal services
- Keep documentation current

---

## Support and Resources

### Within the Application

- **AI Assistant:** Ask questions about syntax and features
- **Visual Editor:** Reduces syntax errors
- **Validation:** Real-time error checking

### Documentation

- **DSL-SPECIFICATION.md:** Technical reference
- **USER-GUIDE.md:** Tutorials and examples
- **QUICK-REFERENCE.md:** Syntax lookup

### Code Examples

- **Preset Templates:** `server/presets.ts`
- **Test Cases:** `server/dsl-parser.test.ts`, `server/decision-engine.test.ts`
- **Example Trees:** Admin panel → Edit existing trees

---

## Changelog

### Version 1.0 (January 18, 2026)

**Initial Release:**
- YAML-based decision tree DSL
- Visual editor with form-based editing
- AI assistant with image support
- Combo pricing engine
- Duration tracking
- Three preset templates
- Complete documentation suite
- Test coverage for parser and engine

---

## License

This application and documentation are proprietary. All rights reserved.

---

## Credits

**Developed by:** Manus AI  
**Documentation:** Manus AI  
**Date:** January 18, 2026

---

## Feedback

We welcome feedback on this documentation. If you find errors, have suggestions for improvements, or need clarification on any topic, please contact support.

---

## Next Steps

1. Read the USER-GUIDE.md "Getting Started" section
2. Create your first decision tree using the AI assistant
3. Experiment with the visual editor
4. Review the preset templates for inspiration
5. Build a tree for your business

Happy tree building!
