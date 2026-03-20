import { useAppSelector, useAppDispatch } from "./store";
import { setPortalTab, goToProfile } from "./store/portalSlice";
import { PortalTopBar } from "./components/PortalTopBar";
import { PortalTabBar } from "./components/PortalTabBar";
import { PortalHomePage } from "./pages/PortalHomePage";
import { PortalAppointmentsPage } from "./pages/PortalAppointmentsPage";
import { PortalPhotosPage } from "./pages/PortalPhotosPage";
import { PortalRewardsPage } from "./pages/PortalRewardsPage";
import { PortalProfilePage } from "./pages/PortalProfilePage";
import type { PortalTab } from "./types";

interface ClientPortalAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
}

export function ClientPortalApp({ unstyled, themeVars }: ClientPortalAppProps) {
  const dispatch = useAppDispatch();
  const screen = useAppSelector(s => s.portal.screen);
  const activeTab = useAppSelector(s => s.portal.activeTab);
  const user = useAppSelector(s => s.portal.user);

  const rootStyle: React.CSSProperties = themeVars
    ? Object.fromEntries(Object.entries(themeVars))
    : {};

  return (
    <div
      data-widget={unstyled ? undefined : "stylist"}
      data-part="root"
      style={rootStyle}
    >
      {screen !== "profile" && (
        <PortalTopBar
          initials={user.initials}
          onAvatarClick={() => dispatch(goToProfile())}
        />
      )}

      {screen === "home" && <PortalHomePage />}
      {screen === "appointments" && <PortalAppointmentsPage />}
      {screen === "photos" && <PortalPhotosPage />}
      {screen === "rewards" && <PortalRewardsPage />}
      {screen === "profile" && <PortalProfilePage />}

      {screen !== "profile" && (
        <PortalTabBar
          activeTab={activeTab}
          onTabChange={(tab: PortalTab) => dispatch(setPortalTab(tab))}
        />
      )}
    </div>
  );
}
