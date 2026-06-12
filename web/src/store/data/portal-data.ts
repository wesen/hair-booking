import type {
  UserProfile,
  AppointmentDetail,
  MaintenanceItem,
  PhotoEntry,
  PointsHistoryItem,
  RedeemableReward,
  NotificationPref,
} from "../types";

export const MOCK_USER: UserProfile = {
  name: "Mia Kovacs",
  email: "mia.k@email.com",
  phone: "(401) 555-0188",
  since: "Oct 2024",
  initials: "MK",
  tier: "Gold",
  points: 320,
  pointsToNext: 80,
  nextTier: "Diamond",
  referralCode: "LUXE-MIA",
  referralCount: 2,
  serviceDescription: 'K-tip extensions (20")\nNatural 6 → sandy blonde',
  perks: ["15% off all services", "Free deep conditioning"],
};

export const MOCK_APPOINTMENTS: AppointmentDetail[] = [
  { id: 1, date: "Mar 24, 2026", service: "K-Tip Move-Up", time: "10:00 AM", duration: "2 hrs", price: 300, status: "confirmed" },
  { id: 2, date: "Apr 15, 2026", service: "Toner Refresh", time: "2:00 PM", duration: "45 min", price: 85, status: "pending" },
  { id: 3, date: "Feb 5, 2026", service: "Toner Refresh", time: "11:00 AM", duration: "45 min", price: 85, status: "complete", review: { stars: 5, text: "Loved it!" } },
  { id: 4, date: "Jan 14, 2026", service: "K-Tip Install", time: "9:00 AM", duration: "4 hrs", price: 1200, status: "complete", review: { stars: 5, text: "Incredible transformation!" } },
];

export const MOCK_MAINTENANCE: MaintenanceItem[] = [
  { date: "Jan 14", service: "Move-up", status: "done" },
  { date: "Feb 5", service: "Toner", status: "done" },
  { date: "Mar 24", service: "Move-up", status: "next" },
  { date: "Apr 15", service: "Toner", status: "upcoming" },
  { date: "May 7", service: "Move-up", status: "upcoming" },
];

export const MOCK_PHOTOS: PhotoEntry[] = [
  { id: 1, date: "Mar 24, 2026", service: "Move-Up", caption: "Move-up + toner refresh", beforeUrl: "before_mar24", afterUrl: "after_mar24" },
  { id: 2, date: "Jan 14, 2026", service: "Initial Install", caption: 'K-tip install, 20 inches', beforeUrl: "before_jan14", afterUrl: "after_jan14" },
];

export const MOCK_POINTS_HISTORY: PointsHistoryItem[] = [
  { date: "Mar 5", label: "Move-up", points: 120 },
  { date: "Feb 5", label: "Toner", points: 34 },
  { date: "Jan 14", label: "Install", points: 200 },
  { date: "Jan 14", label: "Referral bonus", points: 100 },
];

export const MOCK_REDEEMABLE: RedeemableReward[] = [
  { cost: 100, label: "Free Conditioning", locked: false },
  { cost: 200, label: "$15 Off", locked: true },
  { cost: 350, label: "Free Blowout", locked: true },
];

export const DEFAULT_NOTIFICATION_PREFS: NotificationPref[] = [
  { key: "remind48hr", label: "Text reminders (48hr)", on: true },
  { key: "remind2hr", label: "Text reminders (2hr)", on: true },
  { key: "maintAlerts", label: "Maintenance alerts", on: true },
  { key: "marketing", label: "Marketing / promos", on: false },
];
