# Tasks

## Done

- [x] Extract standalone HTML pages from Hair Intake.html prototype (9 mobile + 3 desktop)
- [x] Capture PNG screenshots of all 12 intake screens
- [x] Create css-visual-diff userland with verbs and visual suite spec
- [x] Write comprehensive implementation guide (design/01-...)
- [x] Upload guide + screenshots to reMarkable
- [x] Create HAIR-031 docmgr ticket with diary and related files

## TODO

### Phase 1: Scaffold web/ directory
- [x] Copy package.json, vite.config.ts, tsconfig.json from web.deprecated/
- [x] Copy src/stylist/store/ (RTK Query) to web/src/store/
- [x] Copy src/mock/ (MSW handlers) to web/src/mock/
- [x] Create fresh src/fringe-ui/tokens/ with updated FS values
- [x] Verify `pnpm install && pnpm typecheck && pnpm storybook` works

### Phase 2: Tokens + Atoms
- [x] Update token TS constants + CSS custom properties to match FS
- [x] Implement atoms: Eyebrow, Button, Chip, Progress, RatingBar, Note, Rule
- [x] Implement atoms: Wordmark, StatusBar, HomeIndicator, AppHeader
- [x] Add Storybook stories for each atom with default + variants
- [x] Add data-component + data-part selectors

### Phase 3: Molecules
- [x] Implement molecules: Card, SummaryRow, Masthead, PhotoTile
- [x] Implement molecules: StylistCard, DayCell, Segmented
- [ ] Implement molecules: ServiceOption, BudgetOption, TimeSlot, ColorLevelBar, LengthSilhouette
- [ ] Add Storybook stories + selectors for each

### Phase 4: Organisms + IntakeShell
- [ ] Implement IntakeShell organism (mobile screen wrapper)
- [ ] Implement 9 mobile page organisms (Service through Confirm)
- [ ] Add data-page + data-section selectors
- [ ] Add page-level Storybook stories

### Phase 5: Desktop variants
- [ ] Implement DesktopShell + StepRail
- [ ] Implement 3 desktop page organisms (Estimate/Booking/Confirm)
- [ ] Add desktop Storybook stories

### Phase 6: Visual tuning with css-visual-diff
- [ ] Run prototype baseline catalog
- [ ] Compare each screen bottom-up (atoms → molecules → organisms)
- [ ] Tune CSS/tokens until screens match within policy bands
- [ ] Document accepted differences

### Phase 7: App wiring
- [ ] Create IntakeFlowApp with step navigation
- [ ] Wire RTK Query API calls (estimate, availability, booking, confirm)
- [ ] Add loading/error/empty states

### Phase 8: Production build
- [ ] Verify `pnpm build` outputs correct dist/
- [ ] Verify Go embed + `go run ./cmd/hair-booking` serves SPA
- [ ] Run final visual suite + typecheck + tests

