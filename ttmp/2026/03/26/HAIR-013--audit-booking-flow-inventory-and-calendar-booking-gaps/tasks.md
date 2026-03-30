# Tasks

## Phase 1: Ticket Inventory

- [x] Create the HAIR-013 ticket workspace
- [x] Map the real frontend booking flow files
- [x] Map the real backend public booking flow files
- [x] Locate where intake state is codified in the frontend
- [x] Locate where intake data is persisted in the backend
- [x] Locate where appointment availability and booking are persisted
- [x] Record the likely calendar defect candidates
- [x] Write the detailed inventory/design guide
- [x] Write the investigation diary

## Phase 2: Calendar Defect Follow-Up

- [ ] Reproduce the current calendar selection problem in the hosted app with a precise click path
- [ ] Confirm whether the failure is primarily caused by the hard-coded March-June 2026 window
- [ ] Confirm whether any secondary issue exists in consult-service lookup or availability loading
- [ ] Add a concrete implementation ticket or execution slice for the calendar fix itself

## Phase 3: Booking Hardening Plan

- [ ] Replace the hard-coded booking month/year window with runtime date logic
- [ ] Add focused UI coverage for day selection and unavailable-day behavior
- [ ] Add a browser smoke for intake creation, photo upload, availability, and appointment booking
- [ ] Clarify and reduce any remaining booking-only prototype fields in shared frontend types

## Deferred Inventory Work

- [ ] Decide whether the public booking funnel needs a stronger booking-window product rule
- [ ] Decide whether payment/deposit UI should stay visible in any capacity before a real backend exists
- [ ] Decide when to move production uploads from local storage to object storage
