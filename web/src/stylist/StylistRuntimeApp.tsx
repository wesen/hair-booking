import { SignInPage } from "./pages/SignInPage";
import { useSessionBootstrap } from "./store/api";
import { buildAuthPath, buildRuntimeURL } from "./utils/authNavigation";

interface StylistRuntimeAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
}

export function StylistRuntimeApp({ unstyled, themeVars }: StylistRuntimeAppProps) {
  const session = useSessionBootstrap();

  const rootStyle: React.CSSProperties = themeVars
    ? Object.fromEntries(Object.entries(themeVars))
    : {};

  if (session.isLoading) {
    return (
      <div data-widget={unstyled ? undefined : "stylist"} data-part="root" style={rootStyle}>
        <div data-part="page-content">
          <div data-part="section-heading" style={{ marginBottom: 8 }}>Stylist Workspace</div>
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
          <div data-part="section-heading" style={{ marginBottom: 8 }}>Stylist Workspace</div>
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
        <SignInPage context="stylist" />
      </div>
    );
  }

  return (
    <div data-widget={unstyled ? undefined : "stylist"} data-part="root" style={rootStyle}>
      <div data-part="page-content">
        <div data-part="welcome-header" style={{ paddingBottom: 20 }}>
          <div data-part="welcome-logo">&#x2726;&ensp;Luxe Hair Studio&ensp;&#x2726;</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--color-text)" }}>
            Stylist Workspace
          </div>
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 18 }}>
          The production stylist runtime is intentionally held at a safe shell until the real single-stylist dashboard,
          intake review, and appointment tools land. Storybook still keeps the imported mock widgets for design reference,
          but the live app no longer exposes seeded salon data here.
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 18 }}>
          Your authenticated session is active. Once HAIR-006 and HAIR-007 land, this route will host the real stylist workflow.
        </div>
        <button
          data-part="btn-secondary"
          onClick={() => window.location.assign(buildAuthPath(session.logoutPath, buildRuntimeURL("/")))}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
