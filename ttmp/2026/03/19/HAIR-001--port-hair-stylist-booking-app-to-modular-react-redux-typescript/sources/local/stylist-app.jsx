import { useState, useEffect, useCallback, useRef } from "react";

const SERVICES = [
  { id: 1, name: "Haircut & Style", duration: "60 min", price: 65, emoji: "✂️" },
  { id: 2, name: "Blowout", duration: "45 min", price: 45, emoji: "💨" },
  { id: 3, name: "Color (Full)", duration: "120 min", price: 150, emoji: "🎨" },
  { id: 4, name: "Highlights / Balayage", duration: "150 min", price: 200, emoji: "✨" },
  { id: 5, name: "Deep Conditioning", duration: "30 min", price: 35, emoji: "💧" },
  { id: 6, name: "Updo / Special Event", duration: "90 min", price: 95, emoji: "👑" },
  { id: 7, name: "Trim", duration: "30 min", price: 35, emoji: "💇" },
  { id: 8, name: "Keratin Treatment", duration: "180 min", price: 250, emoji: "🌟" },
];

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

const INITIAL_CLIENTS = [
  { id: 1, name: "Mia Chen", phone: "555-0101", visits: 8, points: 320, referrals: 2, lastVisit: "Mar 10, 2026", notes: "Prefers warm tones, allergic to certain dyes", upcoming: "Mar 22 — Highlights" },
  { id: 2, name: "Jasmine Taylor", phone: "555-0102", visits: 15, points: 600, referrals: 5, lastVisit: "Mar 5, 2026", notes: "VIP — always gets balayage + trim", upcoming: null },
  { id: 3, name: "Olivia Park", phone: "555-0103", visits: 3, points: 120, referrals: 0, lastVisit: "Feb 28, 2026", notes: "New client, exploring styles", upcoming: "Mar 25 — Haircut & Style" },
  { id: 4, name: "Sophia Rivera", phone: "555-0104", visits: 22, points: 880, referrals: 8, lastVisit: "Mar 15, 2026", notes: "Long-time regular, loves experimenting with color", upcoming: null },
  { id: 5, name: "Emma Williams", phone: "555-0105", visits: 1, points: 40, referrals: 1, lastVisit: "Mar 18, 2026", notes: "Referred by Sophia Rivera", upcoming: "Mar 30 — Deep Conditioning" },
];

const INITIAL_APPOINTMENTS = [
  { id: 1, client: "Mia Chen", service: "Highlights / Balayage", date: "Mar 22, 2026", time: "10:00 AM", status: "confirmed" },
  { id: 2, client: "Olivia Park", service: "Haircut & Style", date: "Mar 25, 2026", time: "2:00 PM", status: "confirmed" },
  { id: 3, client: "Emma Williams", service: "Deep Conditioning", date: "Mar 30, 2026", time: "11:00 AM", status: "pending" },
  { id: 4, client: "Walk-in", service: "Trim", date: "Mar 19, 2026", time: "3:30 PM", status: "confirmed" },
];

// Tier logic
function getTier(points) {
  if (points >= 800) return { name: "Diamond", color: "#b8d4e3", icon: "💎", next: null, needed: 0 };
  if (points >= 400) return { name: "Gold", color: "#d4a853", icon: "🥇", next: "Diamond", needed: 800 - points };
  if (points >= 150) return { name: "Silver", color: "#a8a8b0", icon: "🥈", next: "Gold", needed: 400 - points };
  return { name: "Bronze", color: "#cd7f5b", icon: "🥉", next: "Silver", needed: 150 - points };
}

// ─── Icons ──────────────────────────────────────────────
function Icon({ name, size = 20 }) {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };
  const icons = {
    home: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    users: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    gift: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    back: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    plus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    send: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    phone: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    note: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  };
  return icons[name] || null;
}

// ─── Main App ───────────────────────────────────────────
export default function StylistApp() {
  const [tab, setTab] = useState("home");
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [showReferral, setShowReferral] = useState(false);
  const [referralFrom, setReferralFrom] = useState("");
  const [referralTo, setReferralTo] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const confirmBooking = () => {
    const newAppt = {
      id: appointments.length + 1,
      client: bookingData.clientName || "New Client",
      service: bookingData.service?.name,
      date: bookingData.date,
      time: bookingData.time,
      status: "pending"
    };
    setAppointments(prev => [...prev, newAppt]);
    // Add points to client if exists
    const svc = bookingData.service;
    if (svc) {
      setClients(prev => prev.map(c =>
        c.name === bookingData.clientName
          ? { ...c, points: c.points + Math.floor(svc.price * 0.4), upcoming: `${bookingData.date} — ${svc.name}` }
          : c
      ));
    }
    setBookingStep(0);
    setBookingData({});
    setTab("schedule");
    showToast("Appointment booked! ✨");
  };

  const handleReferral = () => {
    if (!referralFrom || !referralTo) return;
    setClients(prev => prev.map(c =>
      c.name === referralFrom ? { ...c, points: c.points + 100, referrals: c.referrals + 1 } : c
    ));
    const exists = clients.find(c => c.name === referralTo);
    if (!exists) {
      setClients(prev => [...prev, { id: prev.length + 1, name: referralTo, phone: "", visits: 0, points: 50, referrals: 0, lastVisit: "—", notes: `Referred by ${referralFrom}`, upcoming: null }]);
    } else {
      setClients(prev => prev.map(c => c.name === referralTo ? { ...c, points: c.points + 50 } : c));
    }
    setShowReferral(false);
    setReferralFrom("");
    setReferralTo("");
    showToast("Referral recorded! +100 pts for referrer, +50 pts for friend 🎉");
  };

  const todayAppts = appointments.filter(a => a.date === "Mar 19, 2026");
  const upcomingAppts = appointments.filter(a => a.date !== "Mar 19, 2026").sort();
  const totalRevenue = appointments.length * 85; // avg estimate
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    .stylist-app {
      --bg: #faf7f5;
      --bg2: #fff;
      --card: #ffffff;
      --rose: #c4917b;
      --rose-light: #f0ddd5;
      --rose-dark: #9e6b56;
      --gold: #c9a96e;
      --gold-light: #f5edda;
      --text: #2c2420;
      --text2: #6e5e55;
      --text3: #a69490;
      --border: #ede5e0;
      --success: #7bb08a;
      --warn: #d4935a;
      --danger: #c97070;

      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      max-width: 430px;
      margin: 0 auto;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    .stylist-app * { box-sizing: border-box; margin: 0; padding: 0; }

    .serif { font-family: 'Playfair Display', serif; }

    .page-content {
      flex: 1;
      padding: 20px 18px 100px;
      opacity: ${mounted ? 1 : 0};
      transform: translateY(${mounted ? 0 : 12}px);
      transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px 8px;
    }

    .top-bar h1 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.3px;
    }

    .top-bar-sub {
      font-size: 13px;
      color: var(--text3);
      font-weight: 400;
    }

    /* Cards */
    .card {
      background: var(--card);
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 14px;
      border: 1px solid var(--border);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { box-shadow: 0 4px 20px rgba(150,120,100,0.08); }
    .card-rose { background: linear-gradient(135deg, var(--rose-light) 0%, #f7ece6 100%); border-color: transparent; }
    .card-gold { background: linear-gradient(135deg, var(--gold-light) 0%, #faf3e4 100%); border-color: transparent; }

    /* Stats row */
    .stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .stat-box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 12px;
      text-align: center;
    }
    .stat-num { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--rose-dark); }
    .stat-label { font-size: 11px; color: var(--text3); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.8px; }

    /* Section headings */
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Appointment rows */
    .appt-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .appt-row:last-child { border-bottom: none; }
    .appt-time {
      font-size: 12px;
      font-weight: 600;
      color: var(--rose-dark);
      min-width: 72px;
      text-align: center;
      background: var(--rose-light);
      padding: 6px 8px;
      border-radius: 8px;
    }
    .appt-info { flex: 1; }
    .appt-client { font-weight: 500; font-size: 14px; }
    .appt-service { font-size: 12px; color: var(--text3); }
    .status-badge {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 20px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-confirmed { background: #e5f2e9; color: #4a8c5c; }
    .status-pending { background: #fef3e2; color: #b87d3a; }

    /* Tab bar */
    .tab-bar {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      padding: 8px 0 28px;
      z-index: 100;
    }
    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 12px;
      transition: all 0.2s;
      background: none;
      border: none;
      color: var(--text3);
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .tab-item.active { color: var(--rose-dark); }
    .tab-item.active::after {
      content: '';
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--rose);
      margin-top: 1px;
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, var(--rose) 0%, var(--rose-dark) 100%);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 12px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: all 0.25s;
      letter-spacing: 0.3px;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(196,145,123,0.35); }
    .btn-primary:active { transform: scale(0.98); }

    .btn-outline {
      background: transparent;
      color: var(--rose-dark);
      border: 1.5px solid var(--rose);
      padding: 12px 20px;
      border-radius: 12px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-outline:hover { background: var(--rose-light); }

    .btn-sm {
      padding: 8px 14px;
      font-size: 12px;
      border-radius: 8px;
    }

    /* Inputs */
    .input {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      background: var(--bg);
      color: var(--text);
      transition: border-color 0.2s;
      outline: none;
    }
    .input:focus { border-color: var(--rose); }
    .input-with-icon {
      position: relative;
    }
    .input-with-icon .input { padding-left: 40px; }
    .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); }

    /* Service selector */
    .service-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1.5px solid var(--border);
      border-radius: 14px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--card);
    }
    .service-option:hover { border-color: var(--rose); background: #fef9f7; }
    .service-option.selected { border-color: var(--rose); background: var(--rose-light); }
    .service-emoji { font-size: 24px; width: 40px; text-align: center; }
    .service-details { flex: 1; }
    .service-name { font-weight: 500; font-size: 14px; }
    .service-meta { font-size: 12px; color: var(--text3); }
    .service-price { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 16px; color: var(--rose-dark); }

    /* Time grid */
    .time-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .time-slot {
      padding: 12px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      text-align: center;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      background: var(--card);
    }
    .time-slot:hover { border-color: var(--rose); }
    .time-slot.selected { background: var(--rose); color: white; border-color: var(--rose); }

    /* Client card */
    .client-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--card);
    }
    .client-card:hover { border-color: var(--rose); transform: translateX(4px); }
    .client-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      color: white;
      flex-shrink: 0;
    }
    .client-info { flex: 1; }
    .client-name { font-weight: 600; font-size: 14px; }
    .client-sub { font-size: 12px; color: var(--text3); }

    /* Tier badge */
    .tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    /* Progress bar */
    .progress-track {
      width: 100%;
      height: 8px;
      background: rgba(0,0,0,0.06);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 6px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Modal overlay */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(44,36,32,0.4);
      backdrop-filter: blur(8px);
      z-index: 200;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .modal-sheet {
      background: var(--bg);
      border-radius: 24px 24px 0 0;
      width: 100%;
      max-width: 430px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 24px 20px 40px;
      animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .modal-handle {
      width: 36px;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin: 0 auto 16px;
    }

    /* Toast */
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--text);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      z-index: 999;
      animation: toastIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translate(-50%, -20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }

    /* Animations */
    .fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .stagger-1 { animation-delay: 0.05s; }
    .stagger-2 { animation-delay: 0.1s; }
    .stagger-3 { animation-delay: 0.15s; }
    .stagger-4 { animation-delay: 0.2s; }

    /* Client detail page */
    .detail-header {
      text-align: center;
      padding: 20px 0;
    }
    .detail-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      margin: 0 auto 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      color: white;
    }
    .detail-stats {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin: 16px 0;
    }
    .detail-stat {
      text-align: center;
      padding: 12px 8px;
      background: var(--card);
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .detail-stat-num { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--rose-dark); }
    .detail-stat-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; margin-top: 2px; }

    .note-box {
      background: var(--gold-light);
      border-radius: 12px;
      padding: 14px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--text2);
    }

    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 12px;
    }
    .quick-action {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--card);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      color: var(--text);
      transition: all 0.2s;
    }
    .quick-action:hover { border-color: var(--rose); background: #fef9f7; }

    /* Loyalty rewards */
    .reward-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 8px;
      background: var(--card);
    }
    .reward-cost {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      font-weight: 700;
      color: var(--gold);
      min-width: 60px;
      text-align: center;
    }
    .reward-name { font-weight: 500; font-size: 13px; }
    .reward-desc { font-size: 11px; color: var(--text3); }

    /* Booking flow */
    .booking-progress {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 20px;
    }
    .booking-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border);
      transition: all 0.3s;
    }
    .booking-dot.active { background: var(--rose); width: 24px; border-radius: 4px; }
    .booking-dot.done { background: var(--success); }

    .date-selector {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 16px;
    }
    .date-cell {
      text-align: center;
      padding: 10px 4px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 13px;
    }
    .date-cell:hover { background: var(--rose-light); }
    .date-cell.selected { background: var(--rose); color: white; }
    .date-cell .day-label { font-size: 10px; color: var(--text3); display: block; margin-bottom: 4px; }
    .date-cell.selected .day-label { color: rgba(255,255,255,0.7); }
    .date-cell .day-num { font-weight: 600; }
  `;

  // Helper for avatar colors
  const avatarColors = ["#c4917b", "#9e6b56", "#c9a96e", "#7bb08a", "#8b7ec8", "#c97070", "#5b9ec4"];
  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
  const getInitials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2);

  // ─── Render Helpers ─────────────────────────────────
  const renderHome = () => (
    <div className="page-content">
      <div className="top-bar">
        <div>
          <h1 className="serif">Good afternoon ☀️</h1>
          <div className="top-bar-sub">Thursday, March 19</div>
        </div>
      </div>

      <div style={{ padding: "0 0 4px" }}>
        <div className="stats-row fade-in stagger-1">
          <div className="stat-box">
            <div className="stat-num">{todayAppts.length}</div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{appointments.length}</div>
            <div className="stat-label">This Week</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{clients.length}</div>
            <div className="stat-label">Clients</div>
          </div>
        </div>

        {/* Quick book CTA */}
        <div className="card card-rose fade-in stagger-2" style={{ cursor: "pointer" }} onClick={() => { setTab("book"); setBookingStep(1); }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="serif" style={{ fontSize: 17, fontWeight: 600 }}>New Booking</div>
              <div style={{ fontSize: 13, color: "var(--rose-dark)", marginTop: 4 }}>Tap to schedule a client</div>
            </div>
            <div style={{ fontSize: 32, opacity: 0.5 }}>✂️</div>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="section-title fade-in stagger-3">
          <Icon name="clock" size={18} /> Today's Schedule
        </div>
        <div className="card fade-in stagger-3">
          {todayAppts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 14 }}>
              No appointments today — enjoy! 🌿
            </div>
          ) : todayAppts.map(a => (
            <div className="appt-row" key={a.id}>
              <div className="appt-time">{a.time}</div>
              <div className="appt-info">
                <div className="appt-client">{a.client}</div>
                <div className="appt-service">{a.service}</div>
              </div>
              <span className={`status-badge status-${a.status}`}>{a.status}</span>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <div className="section-title fade-in stagger-4">
          <Icon name="calendar" size={18} /> Upcoming
        </div>
        <div className="card fade-in stagger-4">
          {upcomingAppts.slice(0, 4).map(a => (
            <div className="appt-row" key={a.id}>
              <div className="appt-time" style={{ fontSize: 11 }}>{a.date?.replace(", 2026", "")}<br/>{a.time}</div>
              <div className="appt-info">
                <div className="appt-client">{a.client}</div>
                <div className="appt-service">{a.service}</div>
              </div>
              <span className={`status-badge status-${a.status}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Schedule Tab ──────────────────────────────────
  const renderSchedule = () => (
    <div className="page-content">
      <div className="top-bar">
        <h1 className="serif">Schedule</h1>
        <button className="btn-outline btn-sm" onClick={() => { setTab("book"); setBookingStep(1); }}>
          <Icon name="plus" size={14} /> Add
        </button>
      </div>
      <div style={{ padding: "0 0 4px" }}>
        {appointments.map((a, i) => (
          <div className={`card fade-in stagger-${Math.min(i + 1, 4)}`} key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{a.client}</div>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>{a.service}</div>
              </div>
              <span className={`status-badge status-${a.status}`}>{a.status}</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <span className="appt-time">{a.date?.replace(", 2026", "")}</span>
              <span className="appt-time" style={{ background: "var(--gold-light)", color: "var(--gold)" }}>{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Clients Tab ──────────────────────────────────
  const renderClients = () => {
    if (selectedClient) return renderClientDetail();
    return (
      <div className="page-content">
        <div className="top-bar">
          <h1 className="serif">Clients</h1>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>{clients.length} total</span>
        </div>
        <div style={{ padding: "0 0 4px" }}>
          <div className="input-with-icon" style={{ marginBottom: 14 }}>
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="input" placeholder="Search clients..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
          </div>
          {filteredClients.map((c, i) => {
            const tier = getTier(c.points);
            return (
              <div className={`client-card fade-in stagger-${Math.min(i + 1, 4)}`} key={c.id} onClick={() => setSelectedClient(c)}>
                <div className="client-avatar" style={{ background: getAvatarColor(c.name) }}>
                  {getInitials(c.name)}
                </div>
                <div className="client-info">
                  <div className="client-name">{c.name}</div>
                  <div className="client-sub">{c.visits} visits · Last: {c.lastVisit?.replace(", 2026", "")}</div>
                </div>
                <span className="tier-badge" style={{ background: `${tier.color}22`, color: tier.color }}>
                  {tier.icon} {tier.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderClientDetail = () => {
    const c = selectedClient;
    const tier = getTier(c.points);
    const maxPts = tier.next ? c.points + tier.needed : c.points;
    const pctFill = tier.next ? ((c.points - (maxPts - tier.needed === c.points ? 0 : 0)) / maxPts) * 100 : 100;
    // Simplify: progress toward next tier
    const thresholds = [0, 150, 400, 800];
    const currentThreshold = thresholds.filter(t => c.points >= t).pop();
    const nextThreshold = tier.next ? c.points + tier.needed : c.points;
    const progress = tier.next ? ((c.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;

    return (
      <div className="page-content">
        <button onClick={() => setSelectedClient(null)} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "var(--rose-dark)", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          <Icon name="back" size={18} /> Back
        </button>

        <div className="detail-header fade-in">
          <div className="detail-avatar" style={{ background: getAvatarColor(c.name) }}>
            {getInitials(c.name)}
          </div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 700 }}>{c.name}</div>
          <div style={{ marginTop: 6 }}>
            <span className="tier-badge" style={{ background: `${tier.color}22`, color: tier.color, fontSize: 12 }}>
              {tier.icon} {tier.name} Member
            </span>
          </div>
          {c.phone && (
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text3)" }}>{c.phone}</div>
          )}
        </div>

        <div className="detail-stats fade-in stagger-1">
          <div className="detail-stat">
            <div className="detail-stat-num">{c.visits}</div>
            <div className="detail-stat-label">Visits</div>
          </div>
          <div className="detail-stat">
            <div className="detail-stat-num">{c.points}</div>
            <div className="detail-stat-label">Points</div>
          </div>
          <div className="detail-stat">
            <div className="detail-stat-num">{c.referrals}</div>
            <div className="detail-stat-label">Referrals</div>
          </div>
        </div>

        {/* Points progress */}
        <div className="card fade-in stagger-2">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>Loyalty Progress</span>
            <span style={{ color: "var(--text3)" }}>{tier.next ? `${tier.needed} pts to ${tier.next}` : "Max tier reached! 🎉"}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%`, background: `linear-gradient(90deg, ${tier.color}, var(--rose))` }} />
          </div>
        </div>

        {/* Upcoming */}
        {c.upcoming && (
          <div className="card card-gold fade-in stagger-2">
            <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Upcoming</div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{c.upcoming}</div>
          </div>
        )}

        {/* Notes */}
        {c.notes && (
          <div className="fade-in stagger-3">
            <div className="section-title"><Icon name="note" size={16} /> Notes</div>
            <div className="note-box">{c.notes}</div>
          </div>
        )}

        {/* Quick actions */}
        <div className="quick-actions fade-in stagger-4" style={{ marginTop: 16 }}>
          <button className="quick-action" onClick={() => { setBookingData({ clientName: c.name }); setBookingStep(1); setTab("book"); }}>
            <Icon name="calendar" size={16} /> Book Appt
          </button>
          <button className="quick-action" onClick={() => {
            setClients(prev => prev.map(cl => cl.id === c.id ? { ...cl, points: cl.points + 40, visits: cl.visits + 1 } : cl));
            setSelectedClient({ ...c, points: c.points + 40, visits: c.visits + 1 });
            showToast("Visit logged! +40 points ✨");
          }}>
            <Icon name="check" size={16} /> Log Visit
          </button>
          <button className="quick-action" onClick={() => { setReferralFrom(c.name); setShowReferral(true); }}>
            <Icon name="gift" size={16} /> Add Referral
          </button>
          <button className="quick-action" onClick={() => { setReferralFrom(c.name); setShowReferral(true); }}>
            <Icon name="send" size={16} /> Message
          </button>
        </div>
      </div>
    );
  };

  // ─── Loyalty Tab ──────────────────────────────────
  const renderLoyalty = () => (
    <div className="page-content">
      <div className="top-bar">
        <h1 className="serif">Loyalty & Rewards</h1>
      </div>
      <div style={{ padding: "0 0 4px" }}>
        {/* Tiers overview */}
        <div className="card card-rose fade-in stagger-1">
          <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Loyalty Tiers</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { name: "Bronze", icon: "🥉", range: "0–149 pts", color: "#cd7f5b" },
              { name: "Silver", icon: "🥈", range: "150–399 pts", color: "#a8a8b0" },
              { name: "Gold", icon: "🥇", range: "400–799 pts", color: "#c9a96e" },
              { name: "Diamond", icon: "💎", range: "800+ pts", color: "#8bb8d4" },
            ].map(t => (
              <div key={t.name} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20 }}>{t.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: t.color }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How points work */}
        <div className="card fade-in stagger-2">
          <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>How It Works</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text2)" }}>
            <div>💰 Earn <strong>40% of service price</strong> as points</div>
            <div>🎁 Referrer gets <strong>+100 pts</strong>, friend gets <strong>+50 pts</strong></div>
            <div>⭐ Silver+ gets <strong>10% off</strong> any service</div>
            <div>🥇 Gold+ gets <strong>15% off</strong> + free deep conditioning</div>
            <div>💎 Diamond gets <strong>20% off</strong> + priority booking</div>
          </div>
        </div>

        {/* Redeemable rewards */}
        <div className="section-title fade-in stagger-3">
          <Icon name="gift" size={18} /> Rewards Menu
        </div>
        {[
          { pts: 100, name: "Free Conditioning Add-on", desc: "With any service" },
          { pts: 200, name: "$15 Off Any Service", desc: "One-time use" },
          { pts: 350, name: "Free Blowout", desc: "45 min blowout session" },
          { pts: 500, name: "Free Haircut & Style", desc: "Full 60 min service" },
          { pts: 750, name: "Free Color Service", desc: "Up to $150 value" },
        ].map((r, i) => (
          <div className={`reward-item fade-in stagger-${Math.min(i + 1, 4)}`} key={r.pts}>
            <div className="reward-cost">{r.pts} pts</div>
            <div>
              <div className="reward-name">{r.name}</div>
              <div className="reward-desc">{r.desc}</div>
            </div>
          </div>
        ))}

        {/* Referral button */}
        <div style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={() => setShowReferral(true)}>
            🎁 Log a Referral
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Booking Flow ─────────────────────────────────
  const renderBooking = () => {
    const days = [];
    const base = new Date(2026, 2, 20); // start from tomorrow
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
        num: d.getDate(),
        full: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      });
    }

    return (
      <div className="page-content">
        <div className="top-bar">
          <button onClick={() => { if (bookingStep <= 1) { setTab("home"); setBookingStep(0); setBookingData({}); } else setBookingStep(bookingStep - 1); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rose-dark)" }}>
            <Icon name="back" size={22} />
          </button>
          <h1 className="serif" style={{ fontSize: 20 }}>New Booking</h1>
          <div style={{ width: 22 }} />
        </div>

        {/* Progress dots */}
        <div className="booking-progress" style={{ padding: "0 18px" }}>
          {[1,2,3,4].map(s => (
            <div key={s} className={`booking-dot ${bookingStep === s ? "active" : bookingStep > s ? "done" : ""}`} />
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text3)" }}>Step {bookingStep}/4</span>
        </div>

        <div style={{ padding: "0 0 4px" }}>
          {/* Step 1: Service */}
          {bookingStep === 1 && (
            <div className="fade-in">
              <div className="section-title">Choose a Service</div>
              {SERVICES.map(s => (
                <div key={s.id} className={`service-option ${bookingData.service?.id === s.id ? "selected" : ""}`}
                  onClick={() => { setBookingData({ ...bookingData, service: s }); }}>
                  <div className="service-emoji">{s.emoji}</div>
                  <div className="service-details">
                    <div className="service-name">{s.name}</div>
                    <div className="service-meta">{s.duration}</div>
                  </div>
                  <div className="service-price">${s.price}</div>
                </div>
              ))}
              {bookingData.service && (
                <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setBookingStep(2)}>Continue</button>
              )}
            </div>
          )}

          {/* Step 2: Date */}
          {bookingStep === 2 && (
            <div className="fade-in">
              <div className="section-title">Pick a Date</div>
              <div className="date-selector">
                {days.map((d, i) => (
                  <div key={i} className={`date-cell ${bookingData.date === d.full ? "selected" : ""}`}
                    onClick={() => setBookingData({ ...bookingData, date: d.full })}>
                    <span className="day-label">{d.label}</span>
                    <span className="day-num">{d.num}</span>
                  </div>
                ))}
              </div>
              {bookingData.date && (
                <>
                  <div className="section-title" style={{ marginTop: 8 }}>Pick a Time</div>
                  <div className="time-grid">
                    {TIME_SLOTS.map(t => (
                      <div key={t} className={`time-slot ${bookingData.time === t ? "selected" : ""}`}
                        onClick={() => setBookingData({ ...bookingData, time: t })}>
                        {t}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {bookingData.date && bookingData.time && (
                <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setBookingStep(3)}>Continue</button>
              )}
            </div>
          )}

          {/* Step 3: Client info */}
          {bookingStep === 3 && (
            <div className="fade-in">
              <div className="section-title">Client Info</div>
              {/* Quick select existing client */}
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 8 }}>Select existing client or enter new</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {clients.map(c => (
                  <button key={c.id}
                    className={bookingData.clientName === c.name ? "btn-primary" : "btn-outline"}
                    style={{ padding: "8px 14px", fontSize: 12, width: "auto", borderRadius: 20 }}
                    onClick={() => setBookingData({ ...bookingData, clientName: c.name, clientPhone: c.phone })}>
                    {c.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", margin: "8px 0" }}>— or —</div>
              <input className="input" placeholder="Client name" value={bookingData.clientName || ""} onChange={e => setBookingData({ ...bookingData, clientName: e.target.value })} style={{ marginBottom: 8 }} />
              <input className="input" placeholder="Phone number" value={bookingData.clientPhone || ""} onChange={e => setBookingData({ ...bookingData, clientPhone: e.target.value })} style={{ marginBottom: 8 }} />
              <textarea className="input" placeholder="Notes (optional)" value={bookingData.notes || ""} onChange={e => setBookingData({ ...bookingData, notes: e.target.value })} style={{ marginBottom: 12, minHeight: 70, resize: "vertical" }} />
              {bookingData.clientName && (
                <button className="btn-primary" onClick={() => setBookingStep(4)}>Review Booking</button>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {bookingStep === 4 && (
            <div className="fade-in">
              <div className="section-title">Confirm Booking</div>
              <div className="card card-rose" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{bookingData.service?.emoji}</div>
                <div className="serif" style={{ fontSize: 20, fontWeight: 700 }}>{bookingData.service?.name}</div>
                <div style={{ fontSize: 14, color: "var(--rose-dark)", marginTop: 4 }}>{bookingData.service?.duration} · ${bookingData.service?.price}</div>
              </div>
              <div className="card">
                <div style={{ display: "grid", gap: 10, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text3)" }}>Client</span>
                    <span style={{ fontWeight: 500 }}>{bookingData.clientName}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text3)" }}>Date</span>
                    <span style={{ fontWeight: 500 }}>{bookingData.date}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text3)" }}>Time</span>
                    <span style={{ fontWeight: 500 }}>{bookingData.time}</span>
                  </div>
                  {bookingData.notes && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text3)" }}>Notes</span>
                      <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{bookingData.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              <button className="btn-primary" onClick={confirmBooking} style={{ marginTop: 4 }}>
                ✨ Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Referral Modal ───────────────────────────────
  const renderReferralModal = () => (
    <div className="modal-overlay" onClick={() => setShowReferral(false)}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Log a Referral</div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>Referrer gets +100 pts, friend gets +50 pts</div>

        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Who referred?</div>
        <select className="input" value={referralFrom} onChange={e => setReferralFrom(e.target.value)} style={{ marginBottom: 12, appearance: "auto" }}>
          <option value="">Select existing client</option>
          {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>New client name</div>
        <input className="input" placeholder="Friend's name" value={referralTo} onChange={e => setReferralTo(e.target.value)} style={{ marginBottom: 16 }} />

        <button className="btn-primary" onClick={handleReferral} disabled={!referralFrom || !referralTo}>
          🎁 Log Referral
        </button>
      </div>
    </div>
  );

  return (
    <div className="stylist-app">
      <style>{css}</style>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Main content */}
      {tab === "home" && renderHome()}
      {tab === "schedule" && renderSchedule()}
      {tab === "clients" && renderClients()}
      {tab === "loyalty" && renderLoyalty()}
      {tab === "book" && renderBooking()}

      {/* Referral modal */}
      {showReferral && renderReferralModal()}

      {/* Tab bar */}
      <div className="tab-bar">
        {[
          { id: "home", icon: "home", label: "Home" },
          { id: "schedule", icon: "calendar", label: "Schedule" },
          { id: "clients", icon: "users", label: "Clients" },
          { id: "loyalty", icon: "star", label: "Loyalty" },
        ].map(t => (
          <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`}
            onClick={() => { setTab(t.id); setSelectedClient(null); setBookingStep(0); }}>
            <Icon name={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
