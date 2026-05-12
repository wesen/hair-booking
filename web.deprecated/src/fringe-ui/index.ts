// fringe-ui/index.ts — public API for the Fringe design system

// Tokens
export { color, font, type, space, radius, shadow, levelSwatches, tagPalette, notePalette } from './tokens';
export type { } from './tokens';

// Primitives
export {
  Button,
  Chip,
  TextField,
  Card,
  Note,
  Progress,
  Rule,
  Eyebrow,
  Wordmark,
  IndexChip,
  RatingBar,
  Segmented,
} from './primitives';

// Salon widgets
export {
  StylistCard,
  PhotoTile,
  SummaryRow,
  DayCell,
  Masthead,
  Section,
} from './salon-widgets';

// Chrome (iOS chrome components)
export {
  StatusBar,
  HomeIndicator,
  AppHeader,
  TabBar,
  ClientTabBar,
} from './chrome';

// Layout shells (built below)
export { IntakeShell }   from './layout/IntakeShell';
export { ClientShell }  from './layout/ClientShell';
export { StylistShell }  from './layout/StylistShell';
export { StepRail }     from './layout/StepRail';