import type { ExtensionType, ColorServiceOption, ConsultationData } from "../types";

export const HAIR_LENGTHS = ["Above shoulders", "Shoulder length", "Past shoulders", "Mid-back", "Waist length"];
export const HAIR_DENSITY = ["Fine / thin", "Medium", "Thick"];
export const HAIR_TEXTURE = ["Straight", "Wavy", "Curly", "Coily"];
export const PREV_EXT_OPTIONS = ["No, never", "Yes, tape-ins", "Yes, k-tips", "Yes, hand-tied wefts", "Yes, other type"];

export const EXT_TYPES: ExtensionType[] = [
  { id: "tape", name: "Tape-ins", desc: "Easiest application & removal", time: "1.5–2 hrs", icon: "▬" },
  { id: "ktip", name: "K-tips", desc: "Most seamless & natural look", time: "3–4 hrs", icon: "◆" },
  { id: "weft", name: "Hand-tied wefts", desc: "Best for volume & fullness", time: "2–3 hrs", icon: "≋" },
  { id: "unsure", name: "Not sure — advise me", desc: "We'll recommend at consult", time: "", icon: "?" },
];

export const BUDGET_RANGES = ["Under $500", "$500 – $800", "$800 – $1,200", "$1,200 – $1,800", "$1,800+", "Flexible"];
export const COLOR_BUDGET_RANGES = ["Under $150", "$150 – $300", "$300 – $500", "$500 – $800", "$800+", "Flexible"];
export const MAINT_OPTIONS = ["Every 4–6 weeks (ideal)", "Every 6–8 weeks", "Every 8–10 weeks"];

export const COLOR_SERVICES: ColorServiceOption[] = [
  { id: "full", name: "Full Color", desc: "Root to ends, single process" },
  { id: "highlight", name: "Highlights / Balayage", desc: "Dimension & movement" },
  { id: "correction", name: "Color Correction", desc: "Fix previous color work" },
  { id: "gloss", name: "Gloss / Toner", desc: "Shine & tone refresh" },
];

export const CHEMICAL_HISTORY = ["Box dye", "Salon color", "Bleach / highlights", "Relaxer", "Keratin treatment", "Perm"];

export const LENGTH_LABELS = ["Current", "Shoulders", "Mid-back", "Waist", "Beyond"];

export const INITIAL_CONSULTATION_DATA: ConsultationData = {
  serviceType: null,
  hairLength: "",
  hairDensity: "",
  hairTexture: "",
  prevExtensions: "",
  colorService: "",
  naturalLevel: "",
  currentColor: "",
  chemicalHistory: [],
  lastChemical: "",
  photoFront: null,
  photoBack: null,
  photoHairline: null,
  inspoPhotos: [],
  desiredLength: 2,
  extType: "",
  budget: "",
  maintenance: "",
  name: "",
  email: "",
  phone: "",
  selectedDate: null,
  selectedTime: null,
  depositPaid: false,
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardZip: "",
};

// Generate calendar availability data (deterministic version)
export function generateCalendarData(): Record<string, string[]> {
  const slots: Record<string, string[]> = {};
  const base = new Date(2026, 2, 23); // Start Mon Mar 23
  const times = ["9:00 AM", "10:00 AM", "10:30 AM", "11:30 AM", "1:00 PM", "2:00 PM", "3:00 PM", "3:30 PM", "4:30 PM"];

  for (let i = 0; i < 21; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0) continue; // skip Sunday
    const key = d.toISOString().slice(0, 10);
    // Deterministic availability based on day number
    const available = times.filter((_, idx) => (d.getDate() + idx) % 3 !== 0);
    if (available.length > 0) slots[key] = available;
  }
  return slots;
}

export const CALENDAR_DATA = generateCalendarData();

export const CARE_GUIDE_SECTIONS = [
  {
    emoji: "\u{1F6BF}",
    heading: "WASHING",
    items: [
      "Wait 48 hrs after install.",
      "Wash 2-3x per week max.",
      "Use sulfate-free shampoo.",
      "Never scrub at bonds.",
    ],
  },
  {
    emoji: "\u{1F525}",
    heading: "HEAT STYLING",
    items: [
      "Always use heat protectant.",
      "Keep tools under 350\u00B0F.",
      "Avoid heat on bonds.",
    ],
  },
  {
    emoji: "\u{1F634}",
    heading: "SLEEPING",
    items: [
      "Loose braid or low pony.",
      "Silk/satin pillowcase.",
      "Never sleep with wet hair.",
    ],
  },
  {
    emoji: "\u{1F486}",
    heading: "BRUSHING",
    items: [
      "Extension-safe brush only.",
      "Start at ends, work up.",
      "Brush 2-3x daily.",
    ],
  },
  {
    emoji: "\u274C",
    heading: "AVOID",
    items: [
      "Chlorine & salt water.",
      "Oil/serum on bonds.",
      "Skipping maintenance appts.",
    ],
  },
];
