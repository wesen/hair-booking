// Fringe client portal — Landing / Home page
// Replaces: PortalHomePage
// API: portalApi.getAppointments() → PortalAppointmentsResponseDto; portalApi.getMe()

import { color, font } from "../../../fringe-ui/tokens";
import { ClientShell } from "../../../fringe-ui/layout/ClientShell";
import { Masthead } from "../../../fringe-ui/salon-widgets/Masthead";
import { SummaryRow } from "../../../fringe-ui/salon-widgets/SummaryRow";
import { Eyebrow } from "../../../fringe-ui/primitives/Eyebrow";
import { Button } from "../../../fringe-ui/primitives/Button";
import type { PortalAppointmentDto } from "../../../stylist/store/api/types";

interface LandingPageProps {
  clientName?: string;
  upcoming?: PortalAppointmentDto | null;
  lastService?: { service: string; stylist: string; price: number; date: string };
  activeTab: string;
  onTabChange: (tab: string) => void;
  onViewUpcoming?: () => void;
  onReschedule?: () => void;
  onBookAgain?: () => void;
  onTryNew?: () => void;
}

export function LandingPage({
  clientName = "Mia",
  upcoming,
  lastService,
  activeTab,
  onTabChange,
  onViewUpcoming,
  onReschedule,
  onBookAgain,
  onTryNew,
}: LandingPageProps) {
  return (
    <ClientShell activeTab={activeTab} onTabChange={onTabChange}>
      {/* Top bar */}
      <div style={{ padding: "14px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: font.block, fontSize: 16, letterSpacing: 4, textTransform: "uppercase" as const }}>Fringe</div>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: color.peach,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.block, fontSize: 13, color: color.plum,
        }}>
          {clientName[0]}
        </div>
      </div>

      {/* Peach masthead */}
      <div style={{ margin: "18px 22px 22px", background: color.peach, padding: "22px 22px 24px" }}>
        <Eyebrow color={color.plumDeep} style={{ marginBottom: 6 }}>
          GOOD MORNING · {clientName.toUpperCase()}
        </Eyebrow>
        <div style={{
          fontFamily: font.block,
          fontSize: 36,
          textTransform: "uppercase" as const,
          letterSpacing: -0.3,
          lineHeight: 0.95,
          color: color.ink,
        }}>
          Two days<br />until the chair.
        </div>
      </div>

      {/* Upcoming card */}
      {upcoming && (
        <div style={{ padding: "0 22px 22px" }}>
          <Eyebrow style={{ marginBottom: 10 }}>UPCOMING</Eyebrow>
          <div style={{ border: `1px solid ${color.rule}`, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: font.block, fontSize: 22, textTransform: "uppercase" as const }}>
                  {upcoming.date_label}
                </div>
                <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 15, color: color.softInk, marginTop: 2 }}>
                  {upcoming.start_time} · with {upcoming.service_name.split(" ")[0]}
                </div>
              </div>
              <div style={{ fontFamily: font.block, fontSize: 26, color: color.plum }}>
                {upcoming.start_time.replace(":00", "").replace(" ", "").slice(0, 5)}
              </div>
            </div>
            <div style={{
              marginTop: 12, paddingTop: 12, borderTop: `1px solid ${color.rule}`,
              display: "flex", justifyContent: "space-between" as const,
            }}>
              <div style={{ fontFamily: font.sans, fontSize: 12, color: color.softInk }}>
                {upcoming.service_name}
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 11, color: color.plum }}>
                ${upcoming.price_low} · {upcoming.duration_label}
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <Button variant="primary" size="sm" onClick={onViewUpcoming} style={{ flex: 1 }}>
                View details
              </Button>
              <Button variant="secondary" size="sm" onClick={onReschedule}>
                Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ padding: "0 22px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ padding: "20px 16px", background: color.cream, cursor: "pointer" }} onClick={onBookAgain}>
            <div style={{ fontFamily: font.block, fontSize: 20, lineHeight: 1 }}>Book<br />again</div>
            <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 13, color: color.softInk, marginTop: 8 }}>
              Same service, same chair.
            </div>
          </div>
          <div style={{ padding: "20px 16px", background: color.cream, cursor: "pointer" }} onClick={onTryNew}>
            <div style={{ fontFamily: font.block, fontSize: 20, lineHeight: 1 }}>Try<br />someone new</div>
            <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 13, color: color.softInk, marginTop: 8 }}>
              Browse stylists.
            </div>
          </div>
        </div>
      </div>

      {/* Last visit */}
      {lastService && (
        <div style={{ padding: "0 22px 24px" }}>
          <Eyebrow style={{ marginBottom: 10 }}>LAST VISIT · {lastService.date}</Eyebrow>
          <div style={{
            padding: "14px 0",
            borderTop: `1px solid ${color.rule}`,
            borderBottom: `1px solid ${color.rule}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{ width: 48, height: 48, background: color.peachSoft, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: font.block, fontSize: 14 }}>{lastService.service}</div>
              <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 13, color: color.softInk, marginTop: 2 }}>
                {lastService.stylist} · ${lastService.price}
              </div>
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 11, color: color.plum }}>VIEW →</div>
          </div>
        </div>
      )}
    </ClientShell>
  );
}

export default LandingPage;