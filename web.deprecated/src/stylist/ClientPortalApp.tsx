// ClientPortalApp — Fringe client portal (Phase 3)
// Swaps old Portal* pages for fringe/pages/client-portal/ pages

import { useAppSelector, useAppDispatch } from "./store";
import { setPortalTab, goToProfile } from "./store/portalSlice";
import { useGetMyAppointmentsQuery, useSessionBootstrap } from "./store/api";
import { getInitials } from "./utils/avatar";
import { LandingPage, HistoryPage } from "../fringe/pages/client-portal";
import { AuthGatePage } from "../fringe/pages/shared";
import { color } from "../fringe-ui/tokens";

interface ClientPortalAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
  showNonMvpFeatures?: boolean;
}

function LoadingState() {
  return (
    <div style={{
      background: color.paper, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 12,
    }}>
      <div style={{ fontFamily: "var(--font-block)", fontSize: 22, letterSpacing: 4, textTransform: "uppercase" }}>
        Fringe
      </div>
      <div style={{ fontFamily: "var(--font-serif-italic)", color: color.softInk, fontSize: 15 }}>
        Loading your salon…
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ background: color.paper, minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ fontFamily: "var(--font-block)", fontSize: 20, color: color.coral, marginBottom: 12 }}>
        Something went wrong
      </div>
      <div style={{ fontFamily: "var(--font-serif-italic)", color: color.softInk, fontSize: 15, marginBottom: 20 }}>
        {message}
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "10px 20px", border: `1px solid ${color.coral}`, background: "transparent",
          color: color.coral, cursor: "pointer",
          fontFamily: "var(--font-block)", textTransform: "uppercase" as const, fontSize: 13,
        }}
      >
        Retry
      </button>
    </div>
  );
}

export function ClientPortalApp({ showNonMvpFeatures = true }: ClientPortalAppProps) {
  const dispatch = useAppDispatch();
  const screen = useAppSelector(s => s.portal.screen);
  const activeTab = useAppSelector(s => s.portal.activeTab);
  const session = useSessionBootstrap();

  const { data: upcomingData } = useGetMyAppointmentsQuery(
    { status: "upcoming", limit: 1 },
    { skip: !session.isAuthenticated },
  );
  const { data: historyData } = useGetMyAppointmentsQuery(
    { status: "past", limit: 20 },
    { skip: !session.isAuthenticated },
  );

  if (session.isLoading) return <LoadingState />;
  if (session.hasError) return <ErrorState message={session.errorMessage ?? "Unknown error"} />;
  if (!session.isAuthenticated) return <AuthGatePage context="portal" />;

  const clientName = session.client?.name ?? "Client";
  const initials   = getInitials(clientName);
  const upcoming = upcomingData?.appointments[0] ?? null;
  const historyAppointments = historyData?.appointments ?? [];
  const lastAppointment = historyAppointments[0];
  const lastService = lastAppointment
    ? {
        service: lastAppointment.service_name,
        stylist: "Fringe team",
        price: lastAppointment.price_low,
        date: lastAppointment.date_label,
      }
    : undefined;

  return (
    <div data-widget="stylist" data-part="root" style={{ background: color.paper, minHeight: "100vh" }}>
      {/* Profile header for non-profile screens */}
      {screen !== "profile" && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 22px",
          borderBottom: `1px solid ${color.rule}`,
        }}>
          <div style={{ fontFamily: "var(--font-block)", fontSize: 15, letterSpacing: 4, textTransform: "uppercase" }}>
            Fringe
          </div>
          <div
            onClick={() => dispatch(goToProfile())}
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: color.peach, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-block)", fontSize: 13, color: color.plum,
              cursor: "pointer",
            }}
          >
            {initials}
          </div>
        </div>
      )}

      {screen === "home" && (
        <LandingPage
          clientName={clientName}
          upcoming={upcoming}
          lastService={lastService}
          activeTab={activeTab}
          onTabChange={(tab) => dispatch(setPortalTab(tab as "home" | "appointments" | "photos" | "rewards"))}
          onViewUpcoming={() => dispatch(setPortalTab("appointments"))}
          onReschedule={() => {}}
          onBookAgain={() => dispatch(setPortalTab("appointments"))}
          onTryNew={() => {}}
        />
      )}

      {screen === "appointments" && (
        <HistoryPage
          appointments={historyAppointments}
          activeTab={activeTab}
          onTabChange={(tab) => dispatch(setPortalTab(tab as "home" | "appointments" | "photos" | "rewards"))}
          onRebook={(id: string) => console.log("Rebook:", id)}
        />
      )}

      {/* Note: Fringe pages (LandingPage, HistoryPage) render their own ClientShell
          + ClientTabBar. No duplicate tab bar needed here. */}
    </div>
  );
}

export default ClientPortalApp;