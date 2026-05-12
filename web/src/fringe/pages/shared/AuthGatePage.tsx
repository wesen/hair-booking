import type { CSSProperties } from "react";
import { Button, Eyebrow, Wordmark } from "../../../fringe-ui";
import { color, font } from "../../../fringe-ui/tokens";
import { useSessionBootstrap } from "../../../stylist/store/api";
import { buildAuthPath, buildRuntimeURL, resolveLoginReturnTo } from "../../../stylist/utils/authNavigation";

interface AuthGatePageProps {
  context?: "booking" | "portal" | "stylist";
  onBack?: () => void;
  style?: CSSProperties;
}

export function AuthGatePage({ context = "booking", onBack, style }: AuthGatePageProps) {
  const session = useSessionBootstrap();

  const heading = context === "portal"
    ? "Client portal"
    : context === "stylist"
      ? "Stylist workspace"
      : "Welcome back";

  const subtitle = context === "portal"
    ? "Sign in to see upcoming appointments, visit history, and your salon details."
    : context === "stylist"
      ? "Sign in to access your live stylist workspace and client operations."
      : "Use your normal browser sign in to continue your consult and booking flow.";

  const handleLogin = () => {
    const returnTo = resolveLoginReturnTo(context);
    window.location.assign(buildAuthPath(session.loginPath, returnTo));
  };

  const handleLogout = () => {
    window.location.assign(buildAuthPath(session.logoutPath, buildRuntimeURL("/")));
  };

  return (
    <div
      data-widget="stylist"
      data-part="root"
      style={{
        minHeight: "100vh",
        background: color.paper,
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        ...style,
      }}
    >
      <div
        style={{
          padding: "16px 22px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: onBack ? "space-between" : "center",
          gap: 12,
        }}
      >
        {onBack ? (
          <button
            onClick={onBack}
            style={{
              border: "none",
              background: "transparent",
              color: color.ink,
              fontFamily: font.block,
              fontSize: 14,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        ) : <div style={{ width: 60 }} />}
        <Wordmark size={14} color={color.plum} />
        {onBack ? <div style={{ width: 60 }} /> : null}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 22px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            border: `1px solid ${color.rule}`,
            background: color.cream,
            padding: "28px 24px",
          }}
        >
          <Eyebrow style={{ marginBottom: 10 }}>
            {context === "portal" ? "AUTHENTICATED CLIENT AREA" : context === "stylist" ? "AUTHENTICATED STYLIST AREA" : "SECURE BOOKING"}
          </Eyebrow>

          <div
            style={{
              fontFamily: font.block,
              fontSize: 34,
              lineHeight: 0.95,
              textTransform: "uppercase",
              color: color.ink,
              marginBottom: 14,
            }}
          >
            {heading}
          </div>

          <div
            style={{
              fontFamily: font.serif,
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.45,
              color: color.softInk,
              marginBottom: 22,
            }}
          >
            {session.isLoading ? "Checking your browser session…" : subtitle}
          </div>

          {session.hasError ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: font.sans, fontSize: 14, lineHeight: 1.6, color: color.coral }}>
                {session.errorMessage}
              </div>
              <Button variant="secondary" size="md" onClick={() => window.location.reload()} style={{ width: "100%" }}>
                Retry
              </Button>
            </div>
          ) : session.isAuthenticated ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: font.sans, fontSize: 14, lineHeight: 1.6, color: color.softInk }}>
                Signed in as {session.client?.name || session.client?.email || "client"}.
              </div>
              <Button variant="primary" size="md" onClick={onBack} style={{ width: "100%" }}>
                Continue
              </Button>
              <Button variant="secondary" size="md" onClick={handleLogout} style={{ width: "100%" }}>
                Sign out
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Button variant="primary" size="md" onClick={handleLogin} style={{ width: "100%" }}>
                Continue to sign in
              </Button>
              <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: 1.2, color: color.soft, textAlign: "center" as const }}>
                No login code flow remains in the MVP.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthGatePage;
