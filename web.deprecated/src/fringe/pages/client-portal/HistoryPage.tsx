// Fringe client portal — History page
// Replaces: (new page — no direct replacement yet)
// API: portalApi.getAppointments() → PortalAppointmentsResponseDto (all past)

import { color, font } from "../../../fringe-ui/tokens";
import { ClientShell } from "../../../fringe-ui/layout/ClientShell";
import { Eyebrow } from "../../../fringe-ui/primitives/Eyebrow";
import { SummaryRow } from "../../../fringe-ui/salon-widgets/SummaryRow";
import type { PortalAppointmentDto } from "../../../stylist/store/api/types";

interface HistoryPageProps {
  appointments: PortalAppointmentDto[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRebook?: (appointmentId: string) => void;
}

function groupByYear(appointments: PortalAppointmentDto[]) {
  const groups: Record<string, PortalAppointmentDto[]> = {};
  for (const appt of appointments) {
    const year = appt.date.split("-")[0];
    if (!groups[year]) groups[year] = [];
    groups[year].push(appt);
  }
  return groups;
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return { month: months[parseInt(month) - 1] ?? month, day: day.replace(/^0/, "") };
}

export function HistoryPage({ appointments, activeTab, onTabChange, onRebook }: HistoryPageProps) {
  const totalSpend = appointments.reduce((sum, a) => sum + a.price_low, 0);
  const groups = groupByYear(appointments);
  const years = Object.keys(groups).sort().reverse();

  // Find regular stylist
  const stylistCounts: Record<string, number> = {};
  for (const a of appointments) {
    // No stylist_name on PortalAppointmentDto — use service_name prefix
    const key = a.service_name.split(" ")[0];
    stylistCounts[key] = (stylistCounts[key] ?? 0) + 1;
  }
  const regular = Object.entries(stylistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <ClientShell activeTab={activeTab} onTabChange={onTabChange}>
      {/* Header */}
      <div style={{ padding: "14px 22px 18px" }}>
        <Eyebrow style={{ marginBottom: 6 }}>
          {appointments.length} VISITS · SINCE {years[years.length - 1] ?? "—"}
        </Eyebrow>
        <div style={{
          fontFamily: font.block,
          fontSize: 40,
          textTransform: "uppercase" as const,
          letterSpacing: -0.4,
          lineHeight: 0.95,
        }}>
          Your<br />history.
        </div>
      </div>

      {/* Totals */}
      <div style={{ padding: "0 22px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "14px 14px", background: color.cream, marginRight: 4 }}>
            <Eyebrow color={color.plum} style={{ fontSize: 9 }}>SPENT</Eyebrow>
            <div style={{ fontFamily: font.block, fontSize: 22, marginTop: 4 }}>${totalSpend}</div>
          </div>
          <div style={{ padding: "14px 14px", background: color.cream, marginLeft: 4 }}>
            <Eyebrow color={color.plum} style={{ fontSize: 9 }}>REGULAR</Eyebrow>
            <div style={{ fontFamily: font.block, fontSize: 22, marginTop: 4 }}>{regular}</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: "0 22px" }}>
        {years.map((year) => (
          <div key={year}>
            <Eyebrow style={{ padding: "14px 0 8px" }}>{year}</Eyebrow>
            {groups[year].map((appt, i) => {
              const { month, day } = formatDate(appt.date);
              return (
                <div
                  key={appt.id}
                  style={{
                    padding: "16px 0",
                    borderTop: `1px solid ${color.rule}`,
                    display: "grid",
                    gridTemplateColumns: "60px 1fr auto",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: font.block, fontSize: 14 }}>{month}</div>
                    <div style={{ fontFamily: font.block, fontSize: 28, color: color.plum, lineHeight: 1 }}>
                      {day}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: font.block, fontSize: 15 }}>{appt.service_name}</div>
                    <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 14, color: color.softInk, marginTop: 2 }}>
                      {appt.service_category}
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <span key={k} style={{ fontFamily: font.mono, fontSize: 10, color: k < 5 ? color.plum : color.rule }}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: font.block, fontSize: 14 }}>
                      {appt.price_low > 0 ? `$${appt.price_low}` : "—"}
                    </div>
                    <div
                      onClick={() => onRebook?.(appt.id)}
                      style={{ fontFamily: font.mono, fontSize: 11, color: color.plum, marginTop: 6, cursor: "pointer" }}
                    >
                      REBOOK →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: "24px 22px 8px", textAlign: "center" as const }}>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: color.soft }}>END OF HISTORY</div>
      </div>
    </ClientShell>
  );
}

export default HistoryPage;