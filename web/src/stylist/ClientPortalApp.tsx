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
import { SignInPage } from "./pages/SignInPage";
import { useSessionBootstrap } from "./store/api";
import { getInitials } from "./utils/avatar";

interface ClientPortalAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
}

export function ClientPortalApp({ unstyled, themeVars }: ClientPortalAppProps) {
  const dispatch = useAppDispatch();
  const screen = useAppSelector(s => s.portal.screen);
  const activeTab = useAppSelector(s => s.portal.activeTab);
  const user = useAppSelector(s => s.portal.user);
  const session = useSessionBootstrap();

  const rootStyle: React.CSSProperties = themeVars
    ? Object.fromEntries(Object.entries(themeVars))
    : {};

  if (session.isLoading) {
    return (
      <div data-widget={unstyled ? undefined : "stylist"} data-part="root" style={rootStyle}>
        <div data-part="page-content">
          <div data-part="section-heading" style={{ marginBottom: 8 }}>Client Portal</div>
          <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            Checking your browser session...
          </div>
        </div>
      </div>
    );
  }

  if (session.hasError) {
    return (
      <div data-widget={unstyled ? undefined : "stylist"} data-part="root" style={rootStyle}>
        <div data-part="page-content">
          <div data-part="section-heading" style={{ marginBottom: 8 }}>Client Portal</div>
          <div style={{ fontSize: 14, color: "var(--color-danger)", lineHeight: 1.7, marginBottom: 16 }}>
            {session.errorMessage}
          </div>
          <button data-part="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session.isAuthenticated) {
    return (
      <div data-widget={unstyled ? undefined : "stylist"} data-part="root" style={rootStyle}>
        <SignInPage context="portal" />
      </div>
    );
  }

  const initials = session.client?.name ? getInitials(session.client.name) : user.initials;

  return (
    <div
      data-widget={unstyled ? undefined : "stylist"}
      data-part="root"
      style={rootStyle}
    >
      {screen !== "profile" && (
        <PortalTopBar
          initials={initials}
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
