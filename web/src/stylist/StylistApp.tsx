import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store";
import { setTab, showToast, clearToast, closeReferralModal } from "./store/uiSlice";
import { setStep } from "./store/bookingSlice";
import { selectClient, addReferralPoints } from "./store/clientsSlice";
import { TabBar } from "./components/TabBar";
import { Toast } from "./components/Toast";
import { ReferralModal } from "./components/ReferralModal";
import { HomePage } from "./pages/HomePage";
import { SchedulePage } from "./pages/SchedulePage";
import { ClientsPage } from "./pages/ClientsPage";
import { LoyaltyPage } from "./pages/LoyaltyPage";
import { BookingPage } from "./pages/BookingPage";
import { setReferralFrom, setReferralTo } from "./store/uiSlice";
import type { Tab } from "./types";

interface StylistAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
}

export function StylistApp({ unstyled, themeVars }: StylistAppProps) {
  const dispatch = useAppDispatch();
  const tab = useAppSelector(s => s.ui.tab);
  const toast = useAppSelector(s => s.ui.toast);
  const showReferral = useAppSelector(s => s.ui.showReferralModal);
  const referralFrom = useAppSelector(s => s.ui.referralFrom);
  const referralTo = useAppSelector(s => s.ui.referralTo);
  const clients = useAppSelector(s => s.clients.clients);

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

  const handleReferralSubmit = () => {
    if (!referralFrom || !referralTo) return;
    const referrer = clients.find(c => c.name === referralFrom);
    if (referrer) {
      dispatch(addReferralPoints({ referrerId: referrer.id, friendName: referralTo }));
    }
    dispatch(closeReferralModal());
    dispatch(showToast("Referral recorded! +100 pts for referrer, +50 pts for friend 🎉"));
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
      {tab === "clients" && <ClientsPage />}
      {tab === "loyalty" && <LoyaltyPage />}
      {tab === "book" && <BookingPage />}

      {showReferral && (
        <ReferralModal
          clients={clients}
          referralFrom={referralFrom}
          referralTo={referralTo}
          onReferralFromChange={v => dispatch(setReferralFrom(v))}
          onReferralToChange={v => dispatch(setReferralTo(v))}
          onSubmit={handleReferralSubmit}
          onClose={() => dispatch(closeReferralModal())}
        />
      )}

      <TabBar activeTab={tab} onTabChange={handleTabChange} />
    </div>
  );
}
