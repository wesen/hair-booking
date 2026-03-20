import type { Service, Client, Appointment } from "../types";

export const SERVICES: Service[] = [
  { id: 1, name: "Haircut & Style", duration: "60 min", price: 65, emoji: "✂️" },
  { id: 2, name: "Blowout", duration: "45 min", price: 45, emoji: "💨" },
  { id: 3, name: "Color Full", duration: "120 min", price: 150, emoji: "🎨" },
  { id: 4, name: "Highlights/Balayage", duration: "150 min", price: 200, emoji: "✨" },
  { id: 5, name: "Deep Conditioning", duration: "30 min", price: 35, emoji: "💧" },
  { id: 6, name: "Updo/Special Event", duration: "75 min", price: 95, emoji: "👑" },
  { id: 7, name: "Trim", duration: "30 min", price: 35, emoji: "💇" },
  { id: 8, name: "Keratin Treatment", duration: "180 min", price: 250, emoji: "🌟" },
];

export const TIME_SLOTS: string[] = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 1,
    name: "Mia Chen",
    phone: "(555) 234-5678",
    visits: 12,
    points: 320,
    referrals: 2,
    lastVisit: "Mar 15",
    notes: "Prefers layers, sensitive scalp",
    upcoming: "Mar 22 at 10:00 AM",
  },
  {
    id: 2,
    name: "Jasmine Taylor",
    phone: "(555) 345-6789",
    visits: 24,
    points: 600,
    referrals: 5,
    lastVisit: "Mar 12",
    notes: "Regular color client, allergic to ammonia-based products",
    upcoming: "Mar 20 at 2:00 PM",
  },
  {
    id: 3,
    name: "Olivia Park",
    phone: "(555) 456-7890",
    visits: 5,
    points: 120,
    referrals: 0,
    lastVisit: "Mar 10",
    notes: "New client, exploring styles",
    upcoming: null,
  },
  {
    id: 4,
    name: "Sophia Rivera",
    phone: "(555) 567-8901",
    visits: 36,
    points: 880,
    referrals: 8,
    lastVisit: "Mar 18",
    notes: "VIP client, loves balayage, always tips well",
    upcoming: "Mar 25 at 11:00 AM",
  },
  {
    id: 5,
    name: "Emma Williams",
    phone: "(555) 678-9012",
    visits: 2,
    points: 40,
    referrals: 0,
    lastVisit: "Mar 8",
    notes: "Student discount applied",
    upcoming: null,
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 1, client: "Mia Chen", service: "Haircut & Style", date: "Mar 22", time: "10:00 AM", status: "confirmed" },
  { id: 2, client: "Jasmine Taylor", service: "Color Full", date: "Mar 20", time: "2:00 PM", status: "confirmed" },
  { id: 3, client: "Sophia Rivera", service: "Highlights/Balayage", date: "Mar 25", time: "11:00 AM", status: "pending" },
  { id: 4, client: "Mia Chen", service: "Deep Conditioning", date: "Mar 28", time: "3:00 PM", status: "pending" },
];

export const LOYALTY_TIERS = [
  { name: "Bronze", icon: "🥉", range: "0–149 pts", color: "#cd7f5b" },
  { name: "Silver", icon: "🥈", range: "150–399 pts", color: "#a8a8b0" },
  { name: "Gold", icon: "🥇", range: "400–799 pts", color: "#c9a96e" },
  { name: "Diamond", icon: "💎", range: "800+ pts", color: "#8bb8d4" },
] as const;

export const REWARDS = [
  { pts: 100, name: "Free Conditioning Add-on", desc: "With any service" },
  { pts: 200, name: "$15 Off Any Service", desc: "One-time use" },
  { pts: 350, name: "Free Blowout", desc: "45 min blowout session" },
  { pts: 500, name: "Free Haircut & Style", desc: "Full 60 min service" },
  { pts: 750, name: "Free Color Service", desc: "Up to $150 value" },
] as const;
