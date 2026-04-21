// StylistApp — Fringe stylist dashboard (Phase 3 cutover)
// Uses uiSlice.tab state → renders Today/Clients/You Fringe pages via RTK Query

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store";
import { setTab, clearToast } from "./store/uiSlice";
import { setStep } from "./store/bookingSlice";
import { selectClient } from "./store/clientsSlice";
import { TabBar } from "./components/TabBar";
import { Toast } from "./components/Toast";
import { TodayPage, ClientsPage, YouPage } from "../fringe/pages/stylist";
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
  const { data: clients }   = useGetStylistClientsQuery();
  const { data: me }        = useGetStylistMeQuery();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => dispatch(clearToast()), 2600);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  const handleTabChange = (newTab: Tab) => {
    dispatch(setTab(newTab));
    dispatch(selectClient(null));
    dispatch(setStep(0));
  };

  return (
    <div data-widget="stylist" data-part="root">
      {toast && <Toast message={toast} />}

      {tab === "home" && (
        <TodayPage
          dashboard={dashboard}
          activeTab={tab}
          onTabChange={handleTabChange as (tab: string) => void}
          accentColor={ACCENT_COLOR}
        />
      )}

      {tab === "clients" && (
        <ClientsPage
          clients={(clients ?? { clients: [] }).clients}
          activeTab={tab}
          onTabChange={handleTabChange as (tab: string) => void}
          accentColor={ACCENT_COLOR}
          onSelectClient={(id: string) => {
            // selectClient expects number; skip since TodayPage fetches via RTK;
            dispatch(setTab("home"));
          }}
        />
      )}

      {/* Pending: "you" tab not yet in uiSlice.tab */}
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

      <TabBar
        activeTab={tab}
        onTabChange={handleTabChange as (tab: string) => void}
        showLoyalty={showNonMvpFeatures}
      />
    </div>
  );
}

export default StylistApp;
