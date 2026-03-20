import { useAppDispatch } from "../store";
import { goToScreen } from "../store/consultationSlice";
import { useSessionBootstrap } from "../store/api";
import { ConsultNavBar } from "../components/ConsultNavBar";
import { Icon } from "../components/Icon";
import { buildAuthPath, buildRuntimeURL, resolveLoginReturnTo } from "../utils/authNavigation";

interface SignInPageProps {
  context?: "booking" | "portal";
  onBack?: () => void;
}

export function SignInPage({ context = "booking", onBack }: SignInPageProps) {
  const dispatch = useAppDispatch();
  const session = useSessionBootstrap();
  const backHandler = onBack ?? (() => dispatch(goToScreen("welcome")));
  const showNav = context === "booking";

  const handleLogin = () => {
    const returnTo = resolveLoginReturnTo(context);
    window.location.assign(buildAuthPath(session.loginPath, returnTo));
  };

  const handleLogout = () => {
    window.location.assign(buildAuthPath(session.logoutPath, buildRuntimeURL("/")));
  };

  return (
    <>
      {showNav && (
        <ConsultNavBar
          title="Client Sign In"
          stepNum={0}
          totalSteps={0}
          onBack={backHandler}
        />
      )}
      <div data-part="page-content">
        <div data-part="welcome-header" style={{ paddingBottom: 20 }}>
          <div data-part="welcome-logo">&#x2726;&ensp;Luxe Hair Studio&ensp;&#x2726;</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--color-text)" }}>
            {context === "portal" ? "Client Portal" : "Welcome back"}
          </div>
        </div>

        {session.isLoading ? (
          <div style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            Checking your browser session...
          </div>
        ) : session.hasError ? (
          <>
            <div style={{ textAlign: "center", fontSize: 14, color: "var(--color-danger)", lineHeight: 1.7, marginBottom: 18 }}>
              {session.errorMessage}
            </div>
            <button
              data-part="btn-primary"
              onClick={() => window.location.reload()}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Retry <Icon name="chevRight" size={16} />
            </button>
          </>
        ) : session.isAuthenticated ? (
          <>
            <div style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: 18 }}>
              Signed in as {session.client?.name || "client"}.
            </div>
            <button
              data-part="btn-primary"
              onClick={backHandler}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Continue <Icon name="chevRight" size={16} />
            </button>
            <button
              data-part="btn-secondary"
              onClick={handleLogout}
              style={{ width: "100%", marginTop: 12 }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 20, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
              Secure sign in now runs through {session.authMode === "oidc" ? "Keycloak" : "the configured browser auth flow"}.
              Use your normal email and password there and the browser will return to the correct app section.
            </div>

            <button
              data-part="btn-primary"
              onClick={handleLogin}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Continue to Sign In <Icon name="chevRight" size={16} />
            </button>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              No login code flow remains in the MVP.
            </div>
          </>
        )}
      </div>
    </>
  );
}
