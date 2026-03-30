import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store";
import { setTab, clearToast } from "./store/uiSlice";
import { setStep } from "./store/bookingSlice";
import { selectClient } from "./store/clientsSlice";
import { TabBar } from "./components/TabBar";
import { Toast } from "./components/Toast";
import { HomePage } from "./pages/HomePage";
import { SchedulePage } from "./pages/SchedulePage";
import { ClientsPage } from "./pages/ClientsPage";
import { LoyaltyPage } from "./pages/LoyaltyPage";
import { BookingPage } from "./pages/BookingPage";
import type { Tab } from "./types";

interface StylistAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
  showNonMvpFeatures?: boolean;
}

export function StylistApp({ unstyled, themeVars, showNonMvpFeatures = true }: StylistAppProps) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector(s => s.ui.tab);
  const toast = useAppSelector(s => s.ui.toast);

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

  const rootStyle: React.CSSProperties = themeVars
    ? Object.fromEntries(Object.entries(themeVars))
    : {};

  return (
    <div
      data-widget={unstyled ? undefined : "stylist"}
      data-part="root"
      style={rootStyle}
    >
      {toast && <Toast message={toast} />}

      {tab === "home" && <HomePage />}
      {tab === "schedule" && <SchedulePage />}
      {tab === "clients" && <ClientsPage showNonMvpActions={showNonMvpFeatures} />}
      {tab === "loyalty" && showNonMvpFeatures ? <LoyaltyPage /> : null}
      {tab === "book" && <BookingPage />}

      <TabBar activeTab={tab} onTabChange={handleTabChange} showLoyalty={showNonMvpFeatures} />
    </div>
  );
}
