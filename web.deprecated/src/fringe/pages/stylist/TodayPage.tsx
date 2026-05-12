// Fringe stylist — Today page (standard variant)
// Replaces: SchedulePage (main view) and HomePage (partial)
// API: stylistApi.getDashboard() → StylistDashboardDto

import { color, font } from "../../../fringe-ui/tokens";
import { Eyebrow } from "../../../fringe-ui/primitives/Eyebrow";
import { Chip } from "../../../fringe-ui/primitives/Chip";
import { Card } from "../../../fringe-ui/primitives/Card";
import { Wordmark } from "../../../fringe-ui/primitives/Wordmark";
import type { StylistDashboardDto } from "../../../stylist/store/api/types";

interface TodayPageProps {
  dashboard?: StylistDashboardDto | null;
}

const TAG_STYLES: Record<string, { bg: string; fg: string }> = {
  VIP:     { bg: "#e8573c", fg: "#ffffff" },
  NEW:     { bg: "#f4c752", fg: "#111111" },
  REGULAR: { bg: "#f6efe4", fg: "#111111" },
  CONSULT: { bg: "#7a8f6b", fg: "#ffffff" },
};

function TagChip({ label }: { label: string }) {
  const style = TAG_STYLES[label] ?? TAG_STYLES.REGULAR;
  return (
    <span style={{
      fontFamily: font.mono,
      fontSize: 9,
      letterSpacing: 1.2,
      textTransform: "uppercase" as const,
      padding: "2px 6px",
      background: style.bg,
      color: style.fg,
      display: "inline-block",
    }}>
      {label}
    </span>
  );
}

export function TodayPage({ dashboard }: TodayPageProps) {
  const schedule = dashboard?.today_schedule ?? [];
  const stats = dashboard?.intakes;

  const upNext = schedule[1]; // Mia Chen at 10:30

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f5" }}>
      {/* Top bar */}
      <div style={{ padding: "14px 22px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--fringe-font-block,\"Anton\")", fontSize: 16, letterSpacing: 4, textTransform: "uppercase" as const, color: "var(--fringe-color-plum,#6b3a4a)" }}>✦ Fringe ✦</div>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: color.peach,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: font.block,
          fontSize: 13,
          color: color.plum,
        }}>
          N
        </div>
      </div>

      {/* Hero stats */}
      <div style={{ padding: "8px 22px 20px" }}>
        <Eyebrow style={{ marginBottom: 8 }}>TUE · JUN 18 · TODAY</Eyebrow>
        <div style={{
          fontFamily: font.block,
          fontSize: 44,
          textTransform: "uppercase" as const,
          letterSpacing: -0.5,
          lineHeight: 0.95,
          color: color.ink,
          marginBottom: 10,
        }}>
          Five in<br />the chair.
        </div>
        <div style={{
          fontFamily: font.serif,
          fontStyle: "italic",
          fontSize: 17,
          color: color.softInk,
        }}>
          First cut at 9. Out by 7:15.
        </div>

        {/* Stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 20 }}>
          {[
            { k: "BOOKED", v: `${schedule.length} / 6` },
            { k: "CHAIR TIME", v: "7h 45m" },
            { k: "EST · $", v: "$1,290" },
          ].map((s) => (
            <div key={s.k} style={{ padding: "12px 14px", background: color.cream }}>
              <Eyebrow color="#e8573c" style={{ fontSize: 9 }}>{s.k}</Eyebrow>
              <div style={{ fontFamily: font.block, fontSize: 22, marginTop: 4 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Up next ribbon */}
      {upNext && (
        <div style={{
          margin: "0 22px 22px",
          padding: "16px 18px",
          background: "#e8573c",
          color: color.paper,
        }}>
          <Eyebrow color="rgba(255,255,255,0.8)" style={{ fontSize: 9 }}>UP NEXT · IN 12 MIN</Eyebrow>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 8,
          }}>
            <div>
              <div style={{ fontFamily: font.block, fontSize: 26, color: color.paper }}>
                {upNext.client_name}
              </div>
              <div style={{
                fontFamily: font.serif,
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(255,255,255,0.9)",
                marginTop: 2,
              }}>
                {upNext.service_name}
              </div>
            </div>
            <div style={{ fontFamily: font.block, fontSize: 30, color: color.paper }}>
              {upNext.start_time}
            </div>
          </div>
        </div>
      )}

      {/* Schedule list */}
      <div style={{ padding: "0 22px 22px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}>
          <Eyebrow>TODAY · {schedule.length} APPOINTMENTS</Eyebrow>
          <div style={{ fontFamily: font.mono, fontSize: 11, color: color.soft }}>SORT: TIME</div>
        </div>

        {schedule.map((appt) => (
          <div key={appt.appointment_id} style={{
            padding: "16px 0",
            borderTop: `1px solid ${color.rule}`,
            display: "grid",
            gridTemplateColumns: "64px 1fr auto",
            gap: 14,
            alignItems: "flex-start",
          }}>
            <div>
              <div style={{ fontFamily: font.block, fontSize: 20, color: color.ink }}>
                {appt.start_time}
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: color.soft, marginTop: 2 }}>
                TBD
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: font.block, fontSize: 16 }}>{appt.client_name}</div>
                <TagChip label={appt.status === "vip" ? "VIP" : appt.status === "new" ? "NEW" : "REGULAR"} />
              </div>
              <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 15, color: color.softInk }}>
                {appt.service_name}
              </div>
            </div>
            <div style={{ fontFamily: font.block, fontSize: 16, color: "#e8573c" }}>›</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 22px" }}>
        <Card>
          <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 14, color: color.softInk }}>
            Gap from 3:00–3:45. Offer as a walk-in window?
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TodayPage;