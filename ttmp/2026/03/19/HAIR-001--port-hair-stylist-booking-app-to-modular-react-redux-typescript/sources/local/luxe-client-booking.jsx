import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ─────────────────────────────────────────────
const HAIR_LENGTHS = ["Above shoulders", "Shoulder length", "Past shoulders", "Mid-back", "Waist length"];
const HAIR_DENSITY = ["Fine / thin", "Medium", "Thick"];
const HAIR_TEXTURE = ["Straight", "Wavy", "Curly", "Coily"];
const PREV_EXT_OPTIONS = ["No, never", "Yes, tape-ins", "Yes, k-tips", "Yes, hand-tied wefts", "Yes, other type"];
const EXT_TYPES = [
  { id: "tape", name: "Tape-ins", desc: "Easiest application & removal", time: "1.5–2 hrs", icon: "▬" },
  { id: "ktip", name: "K-tips", desc: "Most seamless & natural look", time: "3–4 hrs", icon: "◆" },
  { id: "weft", name: "Hand-tied wefts", desc: "Best for volume & fullness", time: "2–3 hrs", icon: "≋" },
  { id: "unsure", name: "Not sure — advise me", desc: "We'll recommend at consult", time: "", icon: "?" },
];
const BUDGET_RANGES = ["Under $500", "$500 – $800", "$800 – $1,200", "$1,200 – $1,800", "$1,800+", "Flexible"];
const MAINT_OPTIONS = ["Every 4–6 weeks (ideal)", "Every 6–8 weeks", "Every 8–10 weeks"];
const COLOR_SERVICES = [
  { id: "full", name: "Full Color", desc: "Root to ends, single process" },
  { id: "highlight", name: "Highlights / Balayage", desc: "Dimension & movement" },
  { id: "correction", name: "Color Correction", desc: "Fix previous color work" },
  { id: "gloss", name: "Gloss / Toner", desc: "Shine & tone refresh" },
];
const CHEMICAL_HISTORY = ["Box dye", "Salon color", "Bleach / highlights", "Relaxer", "Keratin treatment", "Perm"];

const CALENDAR_DATA = (() => {
  const slots = {};
  const base = new Date(2026, 2, 23); // Start Mon Mar 23
  for (let i = 0; i < 21; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0) continue; // skip Sunday
    const key = d.toISOString().slice(0, 10);
    const available = [];
    const times = ["9:00 AM","10:00 AM","10:30 AM","11:30 AM","1:00 PM","2:00 PM","3:00 PM","3:30 PM","4:30 PM"];
    // Randomize availability
    times.forEach(t => { if (Math.random() > 0.45) available.push(t); });
    if (available.length > 0) slots[key] = available;
  }
  return slots;
})();

// ─── Price estimation logic ───────────────────────────
function estimatePrice(data) {
  const { serviceType, extType, desiredLength, colorService } = data;
  let low = 0, high = 0, moveUpLow = 0, moveUpHigh = 0;

  if (serviceType === "extensions" || serviceType === "both") {
    const lengthMult = desiredLength >= 3 ? 1.3 : desiredLength >= 2 ? 1.1 : 1;
    if (extType === "tape") { low = 600; high = 900; moveUpLow = 200; moveUpHigh = 300; }
    else if (extType === "ktip") { low = 900; high = 1300; moveUpLow = 250; moveUpHigh = 400; }
    else if (extType === "weft") { low = 800; high = 1200; moveUpLow = 225; moveUpHigh = 350; }
    else { low = 700; high = 1200; moveUpLow = 200; moveUpHigh = 350; }
    low = Math.round(low * lengthMult / 50) * 50;
    high = Math.round(high * lengthMult / 50) * 50;
  }

  if (serviceType === "color" || serviceType === "both") {
    if (colorService === "full") { low += 150; high += 250; }
    else if (colorService === "highlight") { low += 200; high += 350; }
    else if (colorService === "correction") { low += 300; high += 600; }
    else if (colorService === "gloss") { low += 75; high += 120; }
  }

  return { low, high, moveUpLow, moveUpHigh };
}

// ─── SVG Icons ────────────────────────────────────────
function Ico({ name, size = 20, color = "currentColor" }) {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle", flexShrink: 0 };
  const p = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    back: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    camera: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    upload: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    pin: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    sparkle: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8L8 14 2 9.2h7.6z"/></svg>,
    heart: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    map: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    info: <svg style={s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus: <svg style={s} viewBox="0 0 24 24" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    dollar: <svg style={s} viewBox="0 0 24 24" {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    book: <svg style={s} viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    chevRight: <svg style={s} viewBox="0 0 24 24" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  };
  return icons[name] || null;
}

// ─── Main App ─────────────────────────────────────────
export default function ClientBookingApp() {
  const [screen, setScreen] = useState("welcome");
  const [data, setData] = useState({
    serviceType: null,
    // Hair info
    hairLength: "",
    hairDensity: "",
    hairTexture: "",
    prevExtensions: "",
    // Color info
    colorService: "",
    naturalLevel: "",
    currentColor: "",
    chemicalHistory: [],
    lastChemical: "",
    // Photos
    photoFront: null,
    photoBack: null,
    photoHairline: null,
    inspoPhotos: [],
    // Goals
    desiredLength: 2,
    extType: "",
    budget: "",
    maintenance: "",
    // Contact
    name: "",
    email: "",
    phone: "",
    // Booking
    selectedDate: null,
    selectedTime: null,
    depositPaid: false,
  });
  const [animKey, setAnimKey] = useState(0);
  const scrollRef = useRef(null);

  const goTo = useCallback((s) => {
    setAnimKey(k => k + 1);
    setScreen(s);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const upd = (patch) => setData(prev => ({ ...prev, ...patch }));

  // Determine flow steps
  const getSteps = () => {
    const s = data.serviceType;
    if (s === "extensions") return ["intake-ext", "photos", "goals-ext", "estimate", "calendar", "confirm"];
    if (s === "color") return ["intake-color", "photos", "goals-color", "estimate", "calendar", "confirm"];
    if (s === "both") return ["intake-ext", "intake-color", "photos", "goals-ext", "estimate", "calendar", "confirm"];
    return [];
  };
  const steps = getSteps();
  const currentIdx = steps.indexOf(screen);
  const totalSteps = steps.length;
  const stepNum = currentIdx + 1;

  const goBack = () => {
    if (currentIdx > 0) goTo(steps[currentIdx - 1]);
    else goTo("welcome");
  };
  const goNext = () => {
    if (currentIdx < steps.length - 1) goTo(steps[currentIdx + 1]);
  };

  // Photo simulation
  const simulatePhoto = (field) => {
    upd({ [field]: `photo_${Date.now()}` });
  };

  const estimate = estimatePrice(data);

  // ─── Styles ─────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

    .client-app {
      --cream: #FAF6F1;
      --warm: #F3ECE2;
      --card: #FFFFFF;
      --taupe: #C2A68C;
      --taupe-light: #EDE4D8;
      --taupe-dark: #8C6D52;
      --bronze: #9E7A5A;
      --charcoal: #2A2420;
      --text: #3A322C;
      --text2: #7A6E64;
      --text3: #B0A598;
      --border: #E8DFD4;
      --success: #7FAE8A;
      --accent: #C49A6C;

      font-family: 'Outfit', sans-serif;
      background: var(--cream);
      color: var(--text);
      max-width: 430px;
      margin: 0 auto;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .client-app * { box-sizing: border-box; margin: 0; padding: 0; }

    .serif { font-family: 'Cormorant Garamond', serif; }

    .scroll-wrap {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    /* Entrance animation */
    .screen-enter {
      animation: screenIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes screenIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .stagger { animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
    .s1 { animation-delay: 0.06s; }
    .s2 { animation-delay: 0.12s; }
    .s3 { animation-delay: 0.18s; }
    .s4 { animation-delay: 0.24s; }
    .s5 { animation-delay: 0.3s; }
    .s6 { animation-delay: 0.36s; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Top nav */
    .nav-bar {
      display: flex;
      align-items: center;
      padding: 16px 20px 8px;
      gap: 12px;
      position: sticky;
      top: 0;
      background: var(--cream);
      z-index: 10;
    }
    .nav-back {
      background: none; border: none; cursor: pointer; color: var(--taupe-dark);
      padding: 4px; display: flex; align-items: center;
    }
    .nav-title { font-size: 15px; font-weight: 500; color: var(--text2); flex: 1; }
    .nav-step {
      font-size: 12px; color: var(--text3); font-weight: 400;
      background: var(--taupe-light); padding: 3px 10px; border-radius: 12px;
    }

    /* Progress bar */
    .progress-bar {
      height: 3px;
      background: var(--border);
      margin: 0 20px 4px;
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--taupe), var(--accent));
      border-radius: 2px;
      transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Page content */
    .page { padding: 16px 22px 40px; flex: 1; }

    /* Section label */
    .section-label {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      color: var(--taupe-dark);
      margin-bottom: 16px;
    }
    .section-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 400;
      line-height: 1.2;
      color: var(--charcoal);
      margin-bottom: 6px;
    }
    .section-sub {
      font-size: 14px;
      color: var(--text2);
      line-height: 1.5;
      margin-bottom: 24px;
      font-weight: 300;
    }

    /* Big service cards (welcome) */
    .svc-card {
      background: var(--card);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 22px 20px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .svc-card:hover { border-color: var(--taupe); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(160,130,100,0.1); }
    .svc-card:active { transform: scale(0.985); }
    .svc-icon {
      width: 50px; height: 50px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; flex-shrink: 0;
    }
    .svc-card-info { flex: 1; }
    .svc-card-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: var(--charcoal); }
    .svc-card-desc { font-size: 13px; color: var(--text3); margin-top: 3px; font-weight: 300; }

    /* Form elements */
    .form-label {
      font-size: 13px; font-weight: 500; color: var(--text);
      margin-bottom: 8px; display: block;
    }
    .form-group { margin-bottom: 20px; }

    .select-input {
      width: 100%; padding: 14px 16px; border: 1.5px solid var(--border);
      border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 14px;
      background: var(--card); color: var(--text); appearance: auto;
      outline: none; transition: border-color 0.2s;
    }
    .select-input:focus { border-color: var(--taupe); }

    .text-input {
      width: 100%; padding: 14px 16px; border: 1.5px solid var(--border);
      border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 14px;
      background: var(--card); color: var(--text); outline: none; transition: border-color 0.2s;
    }
    .text-input:focus { border-color: var(--taupe); }
    .text-input::placeholder { color: var(--text3); }

    /* Radio/pill options */
    .radio-group { display: flex; flex-direction: column; gap: 8px; }
    .radio-opt {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border: 1.5px solid var(--border);
      border-radius: 12px; cursor: pointer; transition: all 0.2s;
      background: var(--card); font-size: 14px;
    }
    .radio-opt:hover { border-color: var(--taupe); }
    .radio-opt.selected { border-color: var(--taupe); background: var(--taupe-light); }
    .radio-dot {
      width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid var(--border); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .radio-opt.selected .radio-dot {
      border-color: var(--taupe-dark);
    }
    .radio-dot-inner {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--taupe-dark); opacity: 0;
      transition: opacity 0.2s;
    }
    .radio-opt.selected .radio-dot-inner { opacity: 1; }

    /* Checkbox pills */
    .check-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .check-pill {
      padding: 10px 16px; border: 1.5px solid var(--border);
      border-radius: 20px; cursor: pointer; font-size: 13px;
      transition: all 0.2s; background: var(--card); user-select: none;
    }
    .check-pill:hover { border-color: var(--taupe); }
    .check-pill.checked { background: var(--taupe-dark); color: white; border-color: var(--taupe-dark); }

    /* Extension type cards */
    .ext-card {
      display: flex; align-items: center; gap: 14px;
      padding: 16px; border: 1.5px solid var(--border);
      border-radius: 14px; margin-bottom: 8px; cursor: pointer;
      transition: all 0.2s; background: var(--card);
    }
    .ext-card:hover { border-color: var(--taupe); }
    .ext-card.selected { border-color: var(--taupe-dark); background: var(--taupe-light); }
    .ext-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: var(--warm); display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 600; color: var(--taupe-dark); flex-shrink: 0;
    }
    .ext-card.selected .ext-icon { background: var(--taupe-dark); color: white; }

    /* Photo upload boxes */
    .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .photo-box {
      aspect-ratio: 1; border: 2px dashed var(--border); border-radius: 14px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; cursor: pointer; transition: all 0.2s; background: var(--card);
      font-size: 12px; color: var(--text3);
    }
    .photo-box:hover { border-color: var(--taupe); background: #fefbf8; }
    .photo-box.has-photo {
      border-style: solid; border-color: var(--success); background: #f2f8f4;
      color: var(--success);
    }
    .photo-box-label { font-weight: 500; font-size: 13px; color: var(--text2); }
    .photo-box.has-photo .photo-box-label { color: var(--success); }

    /* Length slider */
    .slider-wrap { padding: 8px 0 16px; }
    .slider-track {
      position: relative; height: 4px; background: var(--border);
      border-radius: 2px; margin: 12px 0;
    }
    .slider-fill {
      position: absolute; left: 0; top: 0; height: 100%;
      background: linear-gradient(90deg, var(--taupe), var(--accent));
      border-radius: 2px; transition: width 0.2s;
    }
    .slider-labels {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--text3);
    }
    .slider-val {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px; font-weight: 600; color: var(--taupe-dark);
      text-align: center; margin-bottom: 4px;
    }
    input[type="range"] {
      -webkit-appearance: none; width: 100%; height: 4px;
      background: transparent; position: relative; z-index: 2; margin: 12px 0;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 22px; height: 22px;
      border-radius: 50%; background: var(--taupe-dark);
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      cursor: pointer; margin-top: -9px;
    }
    input[type="range"]::-webkit-slider-runnable-track {
      height: 4px; border-radius: 2px;
      background: linear-gradient(90deg, var(--taupe) 0%, var(--border) 100%);
    }

    /* Estimate card */
    .estimate-card {
      background: var(--charcoal);
      color: white;
      border-radius: 20px;
      padding: 28px 24px;
      text-align: center;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }
    .estimate-card::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 120px; height: 120px;
      background: radial-gradient(circle, rgba(196,154,108,0.25) 0%, transparent 70%);
      border-radius: 50%;
    }
    .estimate-card::after {
      content: '';
      position: absolute;
      bottom: -30px; left: -30px;
      width: 100px; height: 100px;
      background: radial-gradient(circle, rgba(196,154,108,0.15) 0%, transparent 70%);
      border-radius: 50%;
    }
    .estimate-label {
      font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
      color: rgba(255,255,255,0.5); margin-bottom: 16px;
    }
    .estimate-service {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20px; font-weight: 400; margin-bottom: 4px;
      color: rgba(255,255,255,0.8);
    }
    .estimate-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px; font-weight: 300; letter-spacing: -1px;
      color: var(--accent); margin: 12px 0;
    }
    .estimate-detail {
      font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.7;
    }
    .estimate-divider {
      width: 40px; height: 1px;
      background: rgba(255,255,255,0.15);
      margin: 16px auto;
    }

    /* Calendar */
    .cal-header {
      display: flex; justify-content: center; align-items: center;
      font-family: 'Cormorant Garamond', serif; font-size: 20px;
      font-weight: 500; margin-bottom: 16px; color: var(--charcoal); gap: 16px;
    }
    .cal-nav {
      background: none; border: none; cursor: pointer;
      color: var(--taupe-dark); padding: 4px; font-size: 18px;
    }
    .cal-grid {
      display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
      margin-bottom: 20px;
    }
    .cal-day-header {
      text-align: center; font-size: 11px; color: var(--text3);
      font-weight: 500; padding: 4px; letter-spacing: 0.5px;
    }
    .cal-day {
      text-align: center; padding: 10px 4px; border-radius: 10px;
      font-size: 14px; cursor: default; color: var(--text3);
    }
    .cal-day.available {
      cursor: pointer; color: var(--text); font-weight: 500;
      transition: all 0.15s;
    }
    .cal-day.available:hover { background: var(--taupe-light); }
    .cal-day.selected { background: var(--taupe-dark); color: white; font-weight: 600; }
    .cal-day.today { position: relative; }
    .cal-day.today::after {
      content: ''; position: absolute; bottom: 4px; left: 50%;
      transform: translateX(-50%); width: 4px; height: 4px;
      border-radius: 50%; background: var(--accent);
    }

    .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .time-slot {
      padding: 14px 8px; border: 1.5px solid var(--border); border-radius: 10px;
      text-align: center; cursor: pointer; font-size: 13px; font-weight: 500;
      transition: all 0.2s; background: var(--card);
    }
    .time-slot:hover { border-color: var(--taupe); }
    .time-slot.selected { background: var(--taupe-dark); color: white; border-color: var(--taupe-dark); }

    /* Buttons */
    .btn {
      width: 100%; padding: 16px 24px; border: none; border-radius: 14px;
      font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 500;
      cursor: pointer; transition: all 0.25s; letter-spacing: 0.3px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary {
      background: var(--charcoal); color: white;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(42,36,32,0.25); }
    .btn-primary:active { transform: scale(0.98); }
    .btn-secondary {
      background: var(--card); color: var(--taupe-dark);
      border: 1.5px solid var(--border);
    }
    .btn-secondary:hover { border-color: var(--taupe); background: #fefbf8; }
    .btn-accent {
      background: linear-gradient(135deg, var(--accent) 0%, var(--taupe-dark) 100%);
      color: white;
    }
    .btn-accent:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(196,154,108,0.35); }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

    /* Confirm screen */
    .confirm-card {
      background: var(--card); border-radius: 20px; padding: 32px 24px;
      text-align: center; border: 1px solid var(--border);
      box-shadow: 0 8px 40px rgba(160,130,100,0.08);
    }
    .confirm-check {
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--success); color: white;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; font-size: 28px;
    }
    .confirm-detail-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 0; font-size: 14px; color: var(--text2);
      text-align: left;
    }
    .confirm-detail-row svg { color: var(--taupe); }

    .expect-card {
      background: var(--warm); border-radius: 16px; padding: 20px;
      margin-top: 16px;
    }
    .expect-item {
      display: flex; gap: 10px; padding: 8px 0;
      font-size: 13px; line-height: 1.5; color: var(--text2);
    }
    .expect-emoji { font-size: 16px; flex-shrink: 0; }

    .action-links {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px;
    }
    .action-link {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 12px; border-radius: 12px; border: 1px solid var(--border);
      background: var(--card); font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.2s; color: var(--text);
      text-decoration: none; font-family: 'Outfit', sans-serif;
    }
    .action-link:hover { border-color: var(--taupe); }

    /* Info hint */
    .hint {
      display: flex; align-items: flex-start; gap: 8px;
      background: var(--warm); border-radius: 10px; padding: 12px 14px;
      font-size: 12px; color: var(--text2); line-height: 1.5;
      margin: 12px 0;
    }
    .hint svg { flex-shrink: 0; margin-top: 1px; color: var(--taupe); }

    /* Sign-in link area */
    .signin-area {
      text-align: center; padding: 20px 0 8px;
      border-top: 1px solid var(--border); margin-top: 12px;
    }
    .signin-link {
      color: var(--taupe-dark); text-decoration: underline;
      font-size: 13px; cursor: pointer; background: none; border: none;
      font-family: 'Outfit', sans-serif;
    }

    /* Welcome header */
    .welcome-header {
      text-align: center;
      padding: 36px 0 28px;
    }
    .welcome-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13px; font-weight: 600;
      letter-spacing: 3px; text-transform: uppercase;
      color: var(--taupe-dark); margin-bottom: 20px;
    }
    .welcome-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 34px; font-weight: 300;
      color: var(--charcoal); line-height: 1.15;
    }
    .welcome-sub {
      font-size: 14px; color: var(--text3); margin-top: 10px;
      font-weight: 300; line-height: 1.5;
    }

    /* Location pill */
    .loc-pill {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--text3); letter-spacing: 0.5px;
    }
  `;

  // ─── Screen: Welcome ───────────────────────────────
  const renderWelcome = () => (
    <div className="page screen-enter" key={animKey}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
        <span style={{ fontSize: 18, color: "var(--text3)" }}>☰</span>
        <span className="loc-pill"><Ico name="pin" size={12} /> Providence, RI</span>
      </div>

      <div className="welcome-header stagger s1">
        <div className="welcome-logo">✦&ensp;Luxe Hair Studio&ensp;✦</div>
        <div className="welcome-title">Ready for your<br/>hair transformation?</div>
        <div className="welcome-sub">Tell us what you're looking for and<br/>get an instant estimate</div>
      </div>

      <div className="stagger s2">
        <div className="svc-card" onClick={() => { upd({ serviceType: "color" }); goTo("intake-color"); }}>
          <div className="svc-icon" style={{ background: "linear-gradient(135deg, #f5e6d8, #eddcd0)" }}>💇‍♀️</div>
          <div className="svc-card-info">
            <div className="svc-card-title">I Want Color</div>
            <div className="svc-card-desc">Blonding, balayage, color correction</div>
          </div>
          <Ico name="chevRight" size={18} color="#B0A598" />
        </div>
      </div>

      <div className="stagger s3">
        <div className="svc-card" onClick={() => { upd({ serviceType: "extensions" }); goTo("intake-ext"); }}>
          <div className="svc-icon" style={{ background: "linear-gradient(135deg, #e8ddd0, #ddd0c0)" }}>✨</div>
          <div className="svc-card-info">
            <div className="svc-card-title">I Want Extensions</div>
            <div className="svc-card-desc">Tape-ins, k-tips, hand-tied wefts</div>
          </div>
          <Ico name="chevRight" size={18} color="#B0A598" />
        </div>
      </div>

      <div className="stagger s4">
        <div className="svc-card" onClick={() => { upd({ serviceType: "both" }); goTo("intake-ext"); }}>
          <div className="svc-icon" style={{ background: "linear-gradient(135deg, #eedfd2, #e2d0be)" }}>🎨</div>
          <div className="svc-card-info">
            <div className="svc-card-title">Both Color + Extensions</div>
            <div className="svc-card-desc">The full transformation</div>
          </div>
          <Ico name="chevRight" size={18} color="#B0A598" />
        </div>
      </div>

      <div className="signin-area stagger s5">
        <span style={{ fontSize: 13, color: "var(--text3)" }}>Already a client?</span>{" "}
        <button className="signin-link">Sign in</button>
      </div>
    </div>
  );

  // ─── Screen: Extension Intake ──────────────────────
  const renderIntakeExt = () => {
    const canContinue = data.hairLength && data.hairDensity && data.hairTexture && data.prevExtensions;
    return (
      <div className="page screen-enter" key={animKey}>
        <div className="section-label stagger s1">TELL US ABOUT YOUR HAIR</div>
        <div className="section-heading stagger s1">Hair Profile</div>
        <div className="section-sub stagger s1">This helps us give you an accurate estimate and prep for your visit.</div>

        <div className="form-group stagger s2">
          <label className="form-label">Current hair length</label>
          <select className="select-input" value={data.hairLength} onChange={e => upd({ hairLength: e.target.value })}>
            <option value="">Select...</option>
            {HAIR_LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="form-group stagger s3">
          <label className="form-label">Hair density</label>
          <div className="radio-group">
            {HAIR_DENSITY.map(d => (
              <div key={d} className={`radio-opt ${data.hairDensity === d ? "selected" : ""}`} onClick={() => upd({ hairDensity: d })}>
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group stagger s4">
          <label className="form-label">Natural hair texture</label>
          <div className="radio-group">
            {HAIR_TEXTURE.map(t => (
              <div key={t} className={`radio-opt ${data.hairTexture === t ? "selected" : ""}`} onClick={() => upd({ hairTexture: t })}>
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group stagger s5">
          <label className="form-label">Any previous extensions?</label>
          <select className="select-input" value={data.prevExtensions} onChange={e => upd({ prevExtensions: e.target.value })}>
            <option value="">Select...</option>
            {PREV_EXT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <button className="btn btn-primary stagger s6" disabled={!canContinue} onClick={goNext}>
          Next <Ico name="chevRight" size={16} />
        </button>
      </div>
    );
  };

  // ─── Screen: Color Intake ──────────────────────────
  const renderIntakeColor = () => {
    const canContinue = data.colorService;
    const toggleChem = (c) => {
      upd({ chemicalHistory: data.chemicalHistory.includes(c) ? data.chemicalHistory.filter(x => x !== c) : [...data.chemicalHistory, c] });
    };
    return (
      <div className="page screen-enter" key={animKey}>
        <div className="section-label stagger s1">COLOR CONSULTATION</div>
        <div className="section-heading stagger s1">Tell Us About Your Color</div>
        <div className="section-sub stagger s1">Helps us understand your starting point and goals.</div>

        <div className="form-group stagger s2">
          <label className="form-label">What are you looking for?</label>
          <div className="radio-group">
            {COLOR_SERVICES.map(s => (
              <div key={s.id} className={`radio-opt ${data.colorService === s.id ? "selected" : ""}`} onClick={() => upd({ colorService: s.id })}>
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group stagger s3">
          <label className="form-label">Natural hair color level (1 = black, 10 = lightest blonde)</label>
          <input className="text-input" type="text" placeholder="e.g. 6 (dark blonde)" value={data.naturalLevel} onChange={e => upd({ naturalLevel: e.target.value })} />
        </div>

        <div className="form-group stagger s4">
          <label className="form-label">Current color description</label>
          <input className="text-input" type="text" placeholder="e.g. Box dyed medium brown with grown-out roots" value={data.currentColor} onChange={e => upd({ currentColor: e.target.value })} />
        </div>

        <div className="form-group stagger s5">
          <label className="form-label">Previous chemical services</label>
          <div className="check-grid">
            {CHEMICAL_HISTORY.map(c => (
              <div key={c} className={`check-pill ${data.chemicalHistory.includes(c) ? "checked" : ""}`} onClick={() => toggleChem(c)}>
                {data.chemicalHistory.includes(c) && "✓ "}{c}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group stagger s5">
          <label className="form-label">Last chemical service & when</label>
          <input className="text-input" type="text" placeholder="e.g. Highlights, 3 months ago" value={data.lastChemical} onChange={e => upd({ lastChemical: e.target.value })} />
        </div>

        <button className="btn btn-primary stagger s6" disabled={!canContinue} onClick={goNext}>
          Next <Ico name="chevRight" size={16} />
        </button>
      </div>
    );
  };

  // ─── Screen: Photos ────────────────────────────────
  const renderPhotos = () => {
    const hasRequired = data.photoFront && data.photoBack;
    return (
      <div className="page screen-enter" key={animKey}>
        <div className="section-label stagger s1">PHOTO UPLOAD</div>
        <div className="section-heading stagger s1">Show Us Your Hair</div>
        <div className="section-sub stagger s1">Helps us give you an accurate estimate and prep for your visit.</div>

        <div className="form-label stagger s2">Current hair <span style={{ color: "var(--taupe)" }}>(required)</span></div>
        <div className="photo-grid stagger s2">
          <div className={`photo-box ${data.photoFront ? "has-photo" : ""}`} onClick={() => simulatePhoto("photoFront")}>
            {data.photoFront ? <Ico name="check" size={28} color="#7FAE8A" /> : <Ico name="camera" size={28} color="#B0A598" />}
            <div className="photo-box-label">{data.photoFront ? "Front ✓" : "Front"}</div>
          </div>
          <div className={`photo-box ${data.photoBack ? "has-photo" : ""}`} onClick={() => simulatePhoto("photoBack")}>
            {data.photoBack ? <Ico name="check" size={28} color="#7FAE8A" /> : <Ico name="camera" size={28} color="#B0A598" />}
            <div className="photo-box-label">{data.photoBack ? "Back ✓" : "Back"}</div>
          </div>
        </div>

        {(data.serviceType === "extensions" || data.serviceType === "both") && (
          <div className="stagger s3">
            <div className="form-label">Hairline close-up</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div className={`photo-box ${data.photoHairline ? "has-photo" : ""}`} onClick={() => simulatePhoto("photoHairline")}>
                {data.photoHairline ? <Ico name="check" size={28} color="#7FAE8A" /> : <Ico name="camera" size={28} color="#B0A598" />}
                <div className="photo-box-label">{data.photoHairline ? "Added ✓" : "Hairline"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: "var(--text3)", lineHeight: 1.5, padding: "0 4px" }}>
                Helps us check extension placement options near your hairline
              </div>
            </div>
          </div>
        )}

        <div className="stagger s4">
          <div className="form-label">Inspiration pics <span style={{ color: "var(--text3)" }}>(optional)</span></div>
          <div className="photo-grid">
            <div className={`photo-box ${data.inspoPhotos.length > 0 ? "has-photo" : ""}`} onClick={() => upd({ inspoPhotos: [...data.inspoPhotos, `inspo_${Date.now()}`] })}>
              {data.inspoPhotos.length > 0 ? <Ico name="check" size={28} color="#7FAE8A" /> : <Ico name="plus" size={28} color="#B0A598" />}
              <div className="photo-box-label">{data.inspoPhotos.length > 0 ? `${data.inspoPhotos.length} added` : "Add inspo"}</div>
            </div>
            <div className="photo-box" onClick={() => upd({ inspoPhotos: [...data.inspoPhotos, `inspo_${Date.now()}`] })}>
              <Ico name="plus" size={28} color="#B0A598" />
              <div className="photo-box-label">Add more</div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary stagger s5" disabled={!hasRequired} onClick={goNext}>
          Next <Ico name="chevRight" size={16} />
        </button>
      </div>
    );
  };

  // ─── Screen: Goals (Extensions) ────────────────────
  const renderGoalsExt = () => {
    const lengthLabels = ["Current", "Shoulders", "Mid-back", "Waist", "Beyond"];
    const canContinue = data.extType && data.budget && data.maintenance;
    return (
      <div className="page screen-enter" key={animKey}>
        <div className="section-label stagger s1">YOUR GOALS</div>
        <div className="section-heading stagger s1">What's Your Vision?</div>
        <div className="section-sub stagger s1">Tell us about your dream hair so we can give you a realistic estimate.</div>

        <div className="form-group stagger s2">
          <label className="form-label">Desired length</label>
          <div className="slider-val">{lengthLabels[data.desiredLength]}</div>
          <div style={{ position: "relative" }}>
            <input type="range" min={0} max={4} step={1} value={data.desiredLength} onChange={e => upd({ desiredLength: parseInt(e.target.value) })} style={{ width: "100%" }} />
          </div>
          <div className="slider-labels">
            <span>Current</span><span>Beyond waist</span>
          </div>
        </div>

        <div className="form-group stagger s3">
          <label className="form-label">Extension type preference</label>
          {EXT_TYPES.map(t => (
            <div key={t.id} className={`ext-card ${data.extType === t.id ? "selected" : ""}`} onClick={() => upd({ extType: t.id })}>
              <div className="ext-icon">{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: data.extType === t.id ? "var(--taupe-dark)" : "var(--text3)", marginTop: 2 }}>{t.desc}</div>
              </div>
              {t.time && <span style={{ fontSize: 11, color: "var(--text3)" }}>{t.time}</span>}
            </div>
          ))}
        </div>

        <div className="form-group stagger s4">
          <label className="form-label">Budget range</label>
          <select className="select-input" value={data.budget} onChange={e => upd({ budget: e.target.value })}>
            <option value="">Select your budget...</option>
            {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="hint">
            <Ico name="info" size={14} />
            <span>We'll let you know if this is realistic for your goals. No surprises.</span>
          </div>
        </div>

        <div className="form-group stagger s5">
          <label className="form-label">Maintenance commitment</label>
          <div className="radio-group">
            {MAINT_OPTIONS.map(m => (
              <div key={m} className={`radio-opt ${data.maintenance === m ? "selected" : ""}`} onClick={() => upd({ maintenance: m })}>
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                {m}
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-accent stagger s6" disabled={!canContinue} onClick={goNext}>
          <Ico name="sparkle" size={16} /> See My Estimate
        </button>
      </div>
    );
  };

  // ─── Screen: Goals (Color only) ────────────────────
  const renderGoalsColor = () => {
    const canContinue = data.budget;
    return (
      <div className="page screen-enter" key={animKey}>
        <div className="section-label stagger s1">YOUR GOALS</div>
        <div className="section-heading stagger s1">Budget & Timeline</div>
        <div className="section-sub stagger s1">Almost there — just a couple more details.</div>

        <div className="form-group stagger s2">
          <label className="form-label">Budget range for initial service</label>
          <select className="select-input" value={data.budget} onChange={e => upd({ budget: e.target.value })}>
            <option value="">Select your budget...</option>
            {["Under $150", "$150 – $300", "$300 – $500", "$500 – $800", "$800+", "Flexible"].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="hint">
            <Ico name="info" size={14} />
            <span>We'll let you know if this is realistic for your goals. No surprises.</span>
          </div>
        </div>

        <div className="form-group stagger s3">
          <label className="form-label">Any deadline? (event, wedding, etc.)</label>
          <input className="text-input" type="text" placeholder="e.g. Wedding on April 15" value={data.deadline || ""} onChange={e => upd({ deadline: e.target.value })} />
        </div>

        <div className="form-group stagger s4">
          <label className="form-label">Describe your dream result</label>
          <textarea className="text-input" placeholder="e.g. I want to go from brunette to a warm honey blonde without damage..." value={data.dreamResult || ""} onChange={e => upd({ dreamResult: e.target.value })} style={{ minHeight: 80, resize: "vertical" }} />
        </div>

        <button className="btn btn-accent stagger s5" disabled={!canContinue} onClick={goNext}>
          <Ico name="sparkle" size={16} /> See My Estimate
        </button>
      </div>
    );
  };

  // ─── Screen: Estimate ──────────────────────────────
  const renderEstimate = () => {
    const extName = EXT_TYPES.find(t => t.id === data.extType)?.name || "Extensions";
    const colorName = COLOR_SERVICES.find(s => s.id === data.colorService)?.name || "Color Service";
    const lengthLabels = ["Current length", "Shoulder length", "Mid-back", "Waist length", "Beyond waist"];

    return (
      <div className="page screen-enter" key={animKey}>
        <div className="estimate-card stagger s1" style={{ position: "relative", zIndex: 1 }}>
          <div className="estimate-label">Your Estimate</div>
          {(data.serviceType === "extensions" || data.serviceType === "both") && (
            <div className="estimate-service">{extName} · {lengthLabels[data.desiredLength]}</div>
          )}
          {(data.serviceType === "color" || data.serviceType === "both") && (
            <div className="estimate-service">{colorName}</div>
          )}
          <div className="estimate-price">${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}</div>
          <div className="estimate-detail">initial appointment</div>
          {estimate.moveUpLow > 0 && (
            <>
              <div className="estimate-divider" />
              <div className="estimate-detail">
                Move-ups: ${estimate.moveUpLow}–${estimate.moveUpHigh}<br/>
                {data.maintenance || "every 6–8 weeks"}
              </div>
            </>
          )}
        </div>

        <div className="hint stagger s2">
          <Ico name="info" size={14} />
          <span>This is a ballpark based on your photos and info. Your final quote is given at your consult — no surprises.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }} className="stagger s3">
          <button className="btn btn-accent" onClick={goNext}>
            ✨ Book Free Consult — 15 min
          </button>
          <button className="btn btn-primary" onClick={() => { upd({ depositPaid: true }); goNext(); }}>
            <Ico name="dollar" size={16} /> Book + Pay $75 Deposit — skip the wait
          </button>
        </div>

        <div className="hint stagger s4" style={{ marginTop: 8 }}>
          <Ico name="info" size={14} />
          <span>Deposit applies to your first service. Skip the waitlist and lock in your spot.</span>
        </div>
      </div>
    );
  };

  // ─── Screen: Calendar ──────────────────────────────
  const renderCalendar = () => {
    const [calMonth, setCalMonth] = useState(2); // March 2026
    const year = 2026;
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const firstDay = new Date(year, calMonth, 1).getDay();
    const daysInMonth = new Date(year, calMonth + 1, 0).getDate();
    const dayHeaders = ["Su","Mo","Tu","We","Th","Fr","Sa"];

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selDateStr = data.selectedDate;
    const availTimes = selDateStr ? (CALENDAR_DATA[selDateStr] || []) : [];

    return (
      <div className="page screen-enter" key={animKey}>
        <div className="section-label stagger s1">BOOK YOUR CONSULT</div>
        <div className="section-heading stagger s1">Pick a Date & Time</div>
        <div className="section-sub stagger s1">{data.depositPaid ? "Deposit: $75 · applied to your service" : "Free 15-minute consultation"}</div>

        <div className="cal-header stagger s2">
          <button className="cal-nav" onClick={() => { if (calMonth > 2) setCalMonth(calMonth - 1); }}>←</button>
          <span>{monthNames[calMonth]} {year}</span>
          <button className="cal-nav" onClick={() => { if (calMonth < 5) setCalMonth(calMonth + 1); }}>→</button>
        </div>

        <div className="cal-grid stagger s2">
          {dayHeaders.map(d => <div key={d} className="cal-day-header">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const dateStr = `${year}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const avail = !!CALENDAR_DATA[dateStr];
            const selected = selDateStr === dateStr;
            const isToday = calMonth === 2 && d === 19;
            return (
              <div key={dateStr}
                className={`cal-day ${avail ? "available" : ""} ${selected ? "selected" : ""} ${isToday ? "today" : ""}`}
                onClick={() => avail && upd({ selectedDate: dateStr, selectedTime: null })}>
                {d}
              </div>
            );
          })}
        </div>

        {selDateStr && (
          <div className="stagger s3">
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "var(--text)" }}>
              {new Date(selDateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            {availTimes.length > 0 ? (
              <div className="time-grid">
                {availTimes.map(t => (
                  <div key={t} className={`time-slot ${data.selectedTime === t ? "selected" : ""}`}
                    onClick={() => upd({ selectedTime: t })}>
                    {t}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 14, padding: "16px 0" }}>
                No slots available this day
              </div>
            )}
          </div>
        )}

        {data.selectedDate && data.selectedTime && (
          <div style={{ marginTop: 20 }} className="stagger s4">
            {!data.name && (
              <>
                <div className="form-group">
                  <label className="form-label">Your name</label>
                  <input className="text-input" placeholder="First & last name" value={data.name} onChange={e => upd({ name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="text-input" type="email" placeholder="your@email.com" value={data.email} onChange={e => upd({ email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="text-input" type="tel" placeholder="(401) 555-0123" value={data.phone} onChange={e => upd({ phone: e.target.value })} />
                </div>
              </>
            )}
            <button className="btn btn-accent" onClick={goNext} disabled={!data.selectedDate || !data.selectedTime}>
              {data.depositPaid ? "Pay $75 & Confirm" : "Confirm Booking"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Screen: Confirmation ──────────────────────────
  const renderConfirm = () => {
    const dateObj = data.selectedDate ? new Date(data.selectedDate + "T12:00:00") : null;
    const dateStr = dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
    const extName = EXT_TYPES.find(t => t.id === data.extType)?.name;
    const colorName = COLOR_SERVICES.find(s => s.id === data.colorService)?.name;
    let svcLabel = "";
    if (data.serviceType === "extensions") svcLabel = `${extName || "Extension"} Consult`;
    else if (data.serviceType === "color") svcLabel = `${colorName || "Color"} Consult`;
    else svcLabel = "Color + Extension Consult";

    return (
      <div className="page screen-enter" key={animKey}>
        <div className="confirm-card stagger s1">
          <div className="confirm-check"><Ico name="check" size={28} color="white" /></div>
          <div className="serif" style={{ fontSize: 28, fontWeight: 400, color: "var(--charcoal)" }}>You're All Set</div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginTop: 4, marginBottom: 20 }}>Confirmation sent to your email</div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, textAlign: "left" }}>
            <div className="confirm-detail-row"><Ico name="sparkle" size={16} /> <span>{svcLabel}</span></div>
            <div className="confirm-detail-row"><Ico name="calendar" size={16} /> <span>{dateStr} @ {data.selectedTime}</span></div>
            <div className="confirm-detail-row"><Ico name="pin" size={16} /> <span>247 Wickenden St, Providence, RI</span></div>
            {data.depositPaid && (
              <div className="confirm-detail-row"><Ico name="dollar" size={16} /> <span>Deposit paid: $75</span></div>
            )}
          </div>
        </div>

        <div className="expect-card stagger s2">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--text)" }}>What to Expect</div>
          <div className="expect-item"><span className="expect-emoji">📋</span><span>We'll assess your hair in person and finalize your quote</span></div>
          <div className="expect-item"><span className="expect-emoji">⏱️</span><span>Consult: 15 min · Install appointment: 2–4 hours</span></div>
          {data.depositPaid && (
            <div className="expect-item"><span className="expect-emoji">💰</span><span>Your deposit applies to your first service</span></div>
          )}
          <div className="expect-item"><span className="expect-emoji">💬</span><span>We'll text you a reminder 48 hours before</span></div>
        </div>

        <div className="action-links stagger s3">
          <button className="action-link"><Ico name="calendar" size={16} /> Add to Calendar</button>
          <button className="action-link"><Ico name="map" size={16} /> Get Directions</button>
        </div>

        <div style={{ marginTop: 16 }} className="stagger s4">
          <button className="btn btn-secondary" style={{ justifyContent: "center", gap: 8 }}>
            <Ico name="book" size={16} /> Read: Extension Care 101
          </button>
        </div>
      </div>
    );
  };

  // ─── Nav bar for inner screens ─────────────────────
  const renderNav = () => {
    const titles = {
      "intake-ext": "Extensions Consult",
      "intake-color": "Color Consult",
      "photos": "Photo Upload",
      "goals-ext": "Your Goals",
      "goals-color": "Your Goals",
      "estimate": "Your Estimate",
      "calendar": data.depositPaid ? "Book + Deposit" : "Book Consult",
      "confirm": "",
    };
    if (screen === "welcome" || screen === "confirm") return null;
    return (
      <>
        <div className="nav-bar">
          <button className="nav-back" onClick={goBack}><Ico name="back" size={20} /></button>
          <span className="nav-title">{titles[screen] || ""}</span>
          {totalSteps > 0 && <span className="nav-step">{stepNum}/{totalSteps}</span>}
        </div>
        {totalSteps > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stepNum / totalSteps) * 100}%` }} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="client-app">
      <style>{css}</style>
      <div className="scroll-wrap" ref={scrollRef}>
        {renderNav()}
        {screen === "welcome" && renderWelcome()}
        {screen === "intake-ext" && renderIntakeExt()}
        {screen === "intake-color" && renderIntakeColor()}
        {screen === "photos" && renderPhotos()}
        {screen === "goals-ext" && renderGoalsExt()}
        {screen === "goals-color" && renderGoalsColor()}
        {screen === "estimate" && renderEstimate()}
        {screen === "calendar" && renderCalendar()}
        {screen === "confirm" && renderConfirm()}
      </div>
    </div>
  );
}
