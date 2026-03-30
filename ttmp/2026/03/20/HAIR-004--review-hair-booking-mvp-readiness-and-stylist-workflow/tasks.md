# Tasks

## Completed In This Review Slice

- [x] Map the current backend and frontend architecture
- [x] Review the live API surface and current schema
- [x] Separate real runtime features from mock/demo features
- [x] Identify the main MVP blockers for stylist-side operations
- [x] Write the intern-facing MVP readiness review
- [x] Write the chronological investigation diary

## MVP Scope Cleanup

- [ ] Remove or hide rewards, referrals, and loyalty from the active runtime
- [ ] Remove or hide deposit/payment UI from the active runtime
- [ ] Remove marketing preference UI if it is not backed by product scope
- [ ] Replace the backend bootstrap page with the real app shell or a redirect
- [ ] Fix post-login redirect so the user lands on the intended frontend route

## Frontend Architecture Cleanup

- [ ] Replace query-param app switching in `web/src/main.tsx` with route-based navigation
- [ ] Choose a single default app root that represents the actual product
- [ ] Split demo/story-only state from production runtime state
- [ ] Remove remaining seeded domain data from production-facing app flows
- [ ] Add a small frontend test harness for route-level smoke coverage

## Client-Facing MVP Completion

- [ ] Finish portal photo timeline strategy: either implement real data or hide the tab
- [ ] Verify portal appointment detail views use only real server-backed data
- [ ] Review maintenance-plan UX and keep only the minimum useful display
- [ ] Audit remaining client portal copy and controls for fake or out-of-scope features

## Stylist Backend MVP

- [ ] Add `staff_users` persistence and staff identity bootstrap
- [ ] Add stylist/staff authorization middleware
- [ ] Add `intake_reviews` persistence for stylist review state
- [ ] Add stylist dashboard summary endpoint
- [ ] Add stylist intake list endpoint
- [ ] Add stylist intake detail endpoint
- [ ] Add stylist intake review update endpoint
- [ ] Add stylist appointment list endpoint
- [ ] Add stylist appointment detail endpoint
- [ ] Add stylist appointment update endpoint for confirmation, notes, and prep details
- [ ] Add stylist client list and client detail endpoints

## Stylist Frontend MVP

- [ ] Replace the current mock `StylistApp` home surface with a real dashboard
- [ ] Replace the current mock schedule page with a real appointments view
- [ ] Replace the current mock clients page with a real client list
- [ ] Add a real intake review queue
- [ ] Add a real intake detail view with uploaded photos and stylist notes
- [ ] Add a real appointment detail view for stylist workflow
- [ ] Add a real client detail view combining profile, appointments, and recent intake context

## Deployment And Hardening

- [ ] Implement durable blob storage for uploaded photos or explicitly limit deployment mode
- [ ] Add frontend automated tests for booking, portal auth gating, and stylist queue rendering
- [ ] Add a release smoke checklist for pre-launch verification
- [ ] Review production hosting strategy so frontend and backend app shells are coherent
