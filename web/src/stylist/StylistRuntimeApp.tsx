import { SignInPage } from "./pages/SignInPage";
import { useSessionBootstrap } from "./store/api";
import { buildAuthPath, buildRuntimeURL } from "./utils/authNavigation";
import { StylistWorkspace } from "./StylistWorkspace";

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
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <StylistWorkspace />
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
