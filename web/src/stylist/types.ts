export interface Service {
  id: number;
  name: string;
  duration: string;
  price: number;
  emoji: string;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  visits: number;
  points: number;
  referrals: number;
  lastVisit: string;
  notes: string;
  upcoming: string | null;
}

export interface Appointment {
  id: number;
  client: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending";
}

export interface LoyaltyTier {
  name: "Bronze" | "Silver" | "Gold" | "Diamond";
  color: string;
  icon: string;
  next: string | null;
  needed: number;
}

export interface BookingData {
  service?: Service;
  date?: string;
  time?: string;
  clientName?: string;
  clientPhone?: string;
  notes?: string;
}

export type Tab = "home" | "schedule" | "clients" | "loyalty" | "book";

export type IconName =
  | "home"
  | "calendar"
  | "users"
  | "star"
  | "gift"
  | "check"
  | "clock"
  | "back"
  | "search"
  | "plus"
  | "x"
  | "send"
  | "phone"
  | "note"
  | "camera"
  | "upload"
  | "pin"
  | "sparkle"
  | "heart"
  | "map"
  | "info"
  | "dollar"
  | "book"
  | "chevRight"
  | "lock";

// Client consultation types
export type ConsultationServiceType = "extensions" | "color" | "both";

export interface ExtensionType {
  id: string;
  name: string;
  desc: string;
  time: string;
  icon: string;
}

export interface ColorServiceOption {
  id: string;
  name: string;
  desc: string;
}

export type ConsultationScreen =
  | "welcome"
  | "sign-in"
  | "verify-code"
  | "intake-ext"
  | "intake-color"
  | "photos"
  | "goals-ext"
  | "goals-color"
  | "estimate"
  | "calendar"
  | "confirm"
  | "care-guide";

export interface ConsultationData {
  serviceType: ConsultationServiceType | null;
  hairLength: string;
  hairDensity: string;
  hairTexture: string;
  prevExtensions: string;
  colorService: string;
  naturalLevel: string;
  currentColor: string;
  chemicalHistory: string[];
  lastChemical: string;
  photoFront: string | null;
  photoBack: string | null;
  photoHairline: string | null;
  inspoPhotos: string[];
  desiredLength: number;
  extType: string;
  budget: string;
  maintenance: string;
  deadline?: string;
  dreamResult?: string;
  name: string;
  email: string;
  phone: string;
  selectedDate: string | null;
  selectedTime: string | null;
  depositPaid: boolean;
  // Auth
  loginIdentifier: string;
  verifyCode: string;
  isAuthenticated: boolean;
  // Payment
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardZip: string;
}

export interface PriceEstimate {
  low: number;
  high: number;
  moveUpLow: number;
  moveUpHigh: number;
}

// Client portal types
export type PortalTab = "home" | "appointments" | "photos" | "rewards";

export type PortalScreen = PortalTab | "profile";

export type AppointmentStatus = "confirmed" | "pending" | "complete" | "cancelled";

export interface AppointmentDetail {
  id: number;
  date: string;
  service: string;
  time: string;
  duration: string;
  price: number;
  status: AppointmentStatus;
  review?: { stars: number; text: string };
}

export interface MaintenanceItem {
  date: string;
  service: string;
  status: "done" | "next" | "upcoming";
}

export interface PhotoEntry {
  id: number;
  date: string;
  service: string;
  caption: string;
  beforeUrl: string | null;
  afterUrl: string | null;
}

export interface PointsHistoryItem {
  date: string;
  label: string;
  points: number;
}

export interface RedeemableReward {
  cost: number;
  label: string;
  locked: boolean;
}

export interface NotificationPref {
  key: string;
  label: string;
  on: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  since: string;
  initials: string;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  points: number;
  pointsToNext: number;
  nextTier: string | null;
  referralCode: string;
  referralCount: number;
  serviceDescription: string;
  perks: string[];
}
