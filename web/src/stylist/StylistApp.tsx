// StylistApp — Fringe stylist dashboard (Phase 3)
// uiSlice.tab → Today / Clients sections
// Owns StylistShell + Fringe TabBar. Individual pages are plain content.

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store";
import { setTab, clearToast } from "./store/uiSlice";
import { setStep } from "./store/bookingSlice";
import { selectClient } from "./store/clientsSlice";
import { StylistShell } from "../fringe-ui/layout/StylistShell";
import { TodayPage, ClientsPage } from "../fringe/pages/stylist";
import { color, font } from "../fringe-ui/tokens";
import {
  useGetStylistDashboardQuery,
  useGetStylistClientsQuery,
  useGetStylistMeQuery,
} from "./store/api/stylistApi";
import type { Tab } from "./types";

interface StylistAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
  showNonMvpFeatures?: boolean;
}

const ACCENT_COLOR = "#e8573c";

export function StylistApp({ showNonMvpFeatures = true }: StylistAppProps) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector(s => s.ui.tab);
  const toast = useAppSelector(s => s.ui.toast);

  const { data: dashboard } = useGetStylistDashboardQuery();
  const { data: clients     } = useGetStylistClientsQuery();
  const { data: me          } = useGetStylistMeQuery();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => dispatch(clearToast()), 2600);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  const handleTabChange = (newTab: string) => {
    dispatch(setTab(newTab as Tab));
    dispatch(selectClient(null));
    dispatch(setStep(0));
  };

  return (
    <div data-widget="stylist" data-part="root">
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: color.plum,
            color: color.paper,
            padding: "12px 16px",
            fontFamily: font.block,
            fontSize: 14,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            boxShadow: "0 12px 30px rgba(17,17,17,0.18)",
          }}
        >
          {toast}
        </div>
      )}

      <StylistShell activeTab={tab} onTabChange={handleTabChange} accentColor={ACCENT_COLOR}>
        {tab === "home" && (
          <TodayPage dashboard={dashboard} />
        )}
        {tab === "clients" && (
          <ClientsPage
            clients={(clients ?? { clients: [] }).clients}
            onSelectClient={(id) => {
              // selectClient removed — TodayPage fetches via RTK Query
              dispatch(setTab("home"));
            }}
          />
        )}
        {/* "you" tab not yet in uiSlice.tab */}
        {tab === "schedule" && (
          <div style={{ padding: 40, color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
            Schedule — Fringe port pending
          </div>
        )}
        {tab === "loyalty" && showNonMvpFeatures && (
          <div style={{ padding: 40, color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
            Loyalty — Fringe port pending
          </div>
        )}
        {tab === "book" && (
          <div style={{ padding: 40, color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
            Book — Fringe port pending
          </div>
        )}
      </StylistShell>
    </div>
  );
}

export default StylistApp;