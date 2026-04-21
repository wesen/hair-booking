// fringe/pages/index.ts — re-exports all page modules

export * from "./client-booking";
export * from "./stylist";

// client-portal uses explicit re-export to avoid HistoryPage name conflict
export { LandingPage } from "./client-portal/LandingPage";
export { HistoryPage } from "./client-portal/HistoryPage";