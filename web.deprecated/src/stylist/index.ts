// stylist/index.ts — runtime/domain public API
// This barrel intentionally exports the app adapters, store/api surface, and domain helpers.
// Legacy visual components/pages have moved to fringe-ui/ and fringe/ or are being retired.

// App adapters
export { StylistApp } from "./StylistApp";
export { ClientBookingApp } from "./ClientBookingApp";
export { ClientPortalApp } from "./ClientPortalApp";
export { StylistRuntimeApp } from "./StylistRuntimeApp";

// Store
export { store, legacyStore, runtimeStore, useAppDispatch, useAppSelector } from "./store";
export { createAppStore, createRuntimeStore, stylistApi } from "./store";
export type {
  RootState,
  RuntimeRootState,
  AppDispatch,
  AppStore,
  RuntimeAppDispatch,
  RuntimeAppStore,
} from "./store";
export * from "./store/api";

// Types
export type {
  Service,
  Client,
  Appointment,
  LoyaltyTier,
  BookingData,
  Tab,
  IconName,
} from "./types";
export type {
  ConsultationServiceType,
  ExtensionType,
  ColorServiceOption,
  ConsultationScreen,
  ConsultationData,
  PriceEstimate,
} from "./types";

// Utils
export { getTier, getTierProgress } from "./utils/loyalty";
export { getAvatarColor, getInitials } from "./utils/avatar";
export { estimatePrice } from "./utils/estimate";

// Data
export {
  SERVICES,
  TIME_SLOTS,
  INITIAL_CLIENTS,
  INITIAL_APPOINTMENTS,
  LOYALTY_TIERS,
  REWARDS,
} from "./data/constants";
export {
  HAIR_LENGTHS,
  HAIR_DENSITY,
  HAIR_TEXTURE,
  EXT_TYPES,
  COLOR_SERVICES,
  BUDGET_RANGES,
  MAINT_OPTIONS,
  CHEMICAL_HISTORY,
  CALENDAR_DATA,
} from "./data/consultation-constants";

// Parts
export { PARTS, part } from "./parts";
