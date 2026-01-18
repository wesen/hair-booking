# Hair Stylist Intake App - TODO

## Phase 1: Database Schema & Planning
- [x] Define database schema for decision trees with versioning
- [x] Define schema for service selections and bookings
- [x] Push database schema to production

## Phase 2: DSL Parser & Engine
- [x] Implement YAML DSL parser with validation
- [x] Build decision tree execution engine
- [x] Implement combo pricing rules engine
- [x] Add duration calculation logic

## Phase 3: Database Layer & Presets
- [x] Create database query helpers for decision trees
- [x] Create tRPC procedures for CRUD operations
- [x] Seed 3-5 preset decision tree templates
- [x] Implement versioning and publish/unpublish functionality

## Phase 4: Client Intake Interface
- [x] Design minimal Swiss style UI theme
- [x] Build decision tree navigation component
- [x] Implement dynamic pricing display
- [x] Add service selection state management
- [x] Create progress indicator

## Phase 5: Admin Editor
- [x] Build DSL editor with syntax highlighting
- [x] Implement real-time validation
- [x] Add error highlighting and messages
- [x] Create template management interface
- [x] Add publish/unpublish controls

## Phase 6: Visual Flow Preview
- [x] Implement decision tree visualization (via intake flow)
- [x] Show all possible paths (via navigation)
- [x] Add interactive node navigation
- [x] Display pricing at each node

## Phase 7: Service Summary & Booking
- [x] Build service summary screen
- [x] Show total price and duration
- [x] Display applied combo pricing rules
- [x] Add appointment scheduling interface
- [x] Implement booking confirmation

## Phase 8: Testing & Delivery
- [x] Write vitest tests for DSL parser
- [x] Write tests for pricing engine
- [x] Run all tests and ensure they pass
- [x] Create checkpoint for delivery
## Bug Fixes
- [x] Fix intake page error: currentNode.options.map is not a function (terminal nodes missing options array)
- [x] Fix price display: prices showing in cents instead of dollars (need to multiply by 100 when storing)

## New Features: AI-Powered Admin
- [x] Add backend tRPC procedure for LLM chat with streaming support
- [x] Add image upload support for chat messages
- [x] Build AI chat interface in admin panel for decision tree creation
- [x] Implement conversation history and context management
- [x] Create tabbed interface: YAML editor, Visual editor, AI Assistant
- [x] Test AI chat with text prompts (successfully generated nail salon YAML)
- [x] Add rich visual editor for prices and options
- [x] Test visual editor for price modifications
- [ ] Test AI chat with image uploads

## Visual Editor Implementation
- [x] Create VisualEditor component that parses YAML to editable form
- [x] Add node editor with question, options, prices, durations
- [x] Add ability to add/remove nodes and options
- [x] Sync visual editor changes back to YAML
- [x] Test visual editor with existing presets (successfully changed Men's Cut from 5500 to 6000)

## Documentation
- [x] Write DSL specification document
- [x] Write user guide with examples
- [x] Write reference documentation
- [ ] Create zip archive of project
