import { useAppSelector, useAppDispatch } from "../store";
import { setLoginIdentifier, sendCode } from "../store/authSlice";
import { goToScreen } from "../store/consultationSlice";
import { ConsultNavBar } from "../components/ConsultNavBar";
import { Icon } from "../components/Icon";

export function SignInPage() {
  const dispatch = useAppDispatch();
  const identifier = useAppSelector(s => s.auth.loginIdentifier);

  const handleSend = () => {
    if (!identifier.trim()) return;
    dispatch(sendCode());
    dispatch(goToScreen("verify-code"));
  };

  return (
    <>
      <ConsultNavBar
        title="Sign In"
        stepNum={0}
        totalSteps={0}
        onBack={() => dispatch(goToScreen("welcome"))}
      />
      <div data-part="page-content">
        <div data-part="welcome-header" style={{ paddingBottom: 20 }}>
          <div data-part="welcome-logo">&#x2726;&ensp;Luxe Hair Studio&ensp;&#x2726;</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--color-text)" }}>
            Welcome back
          </div>
        </div>

        <div data-part="form-group">
          <label data-part="form-label">Phone or email</label>
          <input
            data-part="text-input"
            type="text"
            placeholder="mia.k@email.com"
            value={identifier}
            onChange={e => dispatch(setLoginIdentifier(e.target.value))}
            onKeyDown={e => e.key === "Enter" && handleSend()}
          />
        </div>

        <button
          data-part="btn-primary"
          onClick={handleSend}
          disabled={!identifier.trim()}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          Send Login Code <Icon name="chevRight" size={16} />
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          We'll text or email you a<br />6-digit code. No passwords.
        </div>
      </div>
    </>
  );
}
