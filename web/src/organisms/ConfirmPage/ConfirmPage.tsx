// Fringe intake — Confirm page (step 9 of 9)
// Replaces: ConsultConfirmPage
// API: bookingApi.getAppointment() — read confirmation details

import { color, font, type as typeToken } from "../../fringe-ui/tokens";

interface ConfirmPageProps {
  confirmationNumber: string;
  when: string;
  time: string;
  stylist: string;
  service: string;
  estimate: string;
  duration: string;
  deposit: string;
  onDone: () => void;
  onAddToCalendar?: () => void;
}

function formatWhen(when: string, time: string) {
  return `${when} · ${time}`.toUpperCase().replace("TUESDAY, JUNE", "TUE, JUN").replace(" PM", "P").replace(" AM", "A");
}

function weekdayTitle(when: string) {
  const day = (when.split(",")[0] || "Tuesday").trim().toUpperCase();
  return `${day}.`;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "14px 0", borderTop: `1px solid ${color.rule}` }}>
      <div style={{ ...typeToken.eyebrow, color: color.soft, marginBottom: 4 }}>{label}</div>
      <div style={{ ...typeToken.h3, fontSize: 18, color: color.ink }}>{value}</div>
    </div>
  );
}

export function ConfirmPage({
  confirmationNumber,
  when,
  time,
  stylist,
  service,
  estimate,
  duration,
  deposit,
  onDone,
  onAddToCalendar,
}: ConfirmPageProps) {
  const normalizedConfirmation = confirmationNumber.startsWith("#") ? confirmationNumber : `#${confirmationNumber}`;
  const formattedWhen = formatWhen(when, time);
  const dayTitle = weekdayTitle(when);

  return (
    <div data-component="ConfirmPage" data-page="ConfirmPage" style={{
      height: "100%",
      background: color.paper,
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      {/* Status bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 24px 8px",
        fontSize: 13,
        fontWeight: 600,
        color: color.ink,
        fontFamily: "-apple-system, system-ui, sans-serif",
      }}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill={color.ink}>
            <rect x="0" y="7" width="3" height="4" rx="0.5" />
            <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
            <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
          </svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill={color.ink}>
            <rect x="0.5" y="0.5" width="13" height="10" rx="2" style={{ fill: "none", stroke: color.ink, strokeOpacity: 0.4 }} />
            <rect x="2" y="2" width="10" height="7" rx="1" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div style={{
        padding: "6px 22px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button style={{ background: "transparent", border: "none", padding: 0, display: "flex", alignItems: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={color.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4L5 9l6 5" />
          </svg>
        </button>
        <div style={{ fontFamily: font.block, fontSize: 14, letterSpacing: 3.5, textTransform: "uppercase" }}>Fringe</div>
        <div style={{ ...typeToken.meta, color: color.soft }}>09 / 09</div>
      </div>

      <main style={{ flex: 1, padding: "24px 22px 0" }}>
        <section style={{
          background: color.peach,
          padding: "18px 24px 22px",
          marginBottom: 22,
          position: "relative",
        }}>
          <div style={{ ...typeToken.eyebrow, color: color.plumDeep, marginBottom: 10 }}>You're booked.</div>
          <div style={{
            position: "absolute",
            top: 16,
            right: 14,
            ...typeToken.meta,
            color: color.plumDeep,
            border: `1px solid ${color.plumDeep}`,
            padding: "3px 8px",
            background: "rgba(255,255,255,0.18)",
          }}>
            CONF {normalizedConfirmation}
          </div>
          <div style={{ fontFamily: font.block, fontSize: 56, lineHeight: 0.9, textTransform: "uppercase", color: color.plum }}>
            See you<br />
            <span style={{ color: color.ink }}>{dayTitle}</span>
          </div>
        </section>

        <div style={{ ...typeToken.editorial, color: color.softInk, marginBottom: 22 }}>
          A confirmation and prep notes are on their way.
        </div>

        <SummaryLine label="When" value={formattedWhen} />
        <SummaryLine label="With" value={stylist.toUpperCase()} />
        <SummaryLine label="Service" value={service.toUpperCase()} />
        <SummaryLine label="Estimate" value={`${estimate} · ${duration}`.toUpperCase()} />
        <SummaryLine label="Deposit" value={`${deposit} HELD`.toUpperCase()} />

        <div style={{
          marginTop: 20,
          background: "#eaf0e3",
          borderLeft: `3px solid ${color.sage}`,
          padding: "12px 14px",
          ...typeToken.body,
          color: color.ink,
        }}>
          Deposit received. Cancellations inside 24h forfeit deposit.
        </div>
      </main>

      <footer style={{
        padding: "12px 30px 28px",
        borderTop: `1px solid ${color.rule}`,
        display: "flex",
        gap: 10,
        background: color.paper,
      }}>
        <button
          onClick={onAddToCalendar}
          style={{
            fontFamily: font.block,
            fontSize: 14,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "14px 18px",
            border: `1px solid ${color.ink}`,
            background: "transparent",
            color: color.ink,
            cursor: onAddToCalendar ? "pointer" : "default",
            flex: 1,
          }}
        >
          Add to calendar
        </button>
        <button
          onClick={onDone}
          style={{
            fontFamily: font.block,
            fontSize: 14,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "14px 20px",
            border: "none",
            background: color.plum,
            color: color.paper,
            cursor: "pointer",
            width: 145,
          }}
        >
          Done
        </button>
      </footer>

      <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 50 }}>
        <div style={{ width: 120, height: 4, borderRadius: 2, background: color.ink, opacity: 0.65 }} />
      </div>
    </div>
  );
}

export default ConfirmPage;
