// ClientPortalApp — Fringe client portal (Phase 3)
// Swaps old Portal* pages for fringe/pages/client-portal/ pages

import { useAppSelector, useAppDispatch } from "./store";
import { setPortalTab, goToProfile } from "./store/portalSlice";
import { SignInPage } from "./pages/SignInPage";
import { useSessionBootstrap } from "./store/api";
import { getInitials } from "./utils/avatar";
import { LandingPage, HistoryPage } from "../fringe/pages/client-portal";
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

  if (session.isLoading) return <LoadingState />;
  if (session.hasError) return <ErrorState message={session.errorMessage ?? "Unknown error"} />;
  if (!session.isAuthenticated) return <SignInPage context="portal" />;

  const clientName = session.client?.name ?? "Client";
  const initials   = getInitials(clientName);

  const upcoming = {
    id: "upcoming_001",
    client_id: "client_001",
    service_id: "svc_001",
    date: "2026-06-19",
    start_time: "10:30",
    duration_min_snapshot: 195,
    status: "confirmed",
    service_name: "Full highlights + cut",
    service_category: "Color",
    price_low: 280,
    price_high: 380,
    date_label: "Thursday, Jun 19",
    duration_label: "3h 15m",
    stylist_name: "Nadia Rivera",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

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
          lastService={{
            service: "Partial highlights + cut",
            stylist: "Nadia Rivera",
            price: 260,
            date: "3 months ago",
          }}
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
          appointments={[]}
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