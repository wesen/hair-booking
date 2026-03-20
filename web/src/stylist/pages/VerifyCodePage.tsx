import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import { setCodeDigit, resendCode, verifySuccess, verifyFail, decrementCooldown } from "../store/authSlice";
import { goToScreen } from "../store/consultationSlice";
import { ConsultNavBar } from "../components/ConsultNavBar";
import { CodeInput } from "../components/CodeInput";

export function VerifyCodePage() {
  const dispatch = useAppDispatch();
  const { codeSentTo, codeDigits, error, resendCooldown } = useAppSelector(s => s.auth);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => dispatch(decrementCooldown()), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown, dispatch]);

  const handleComplete = (code: string) => {
    // Simulate verification: accept any 6-digit code
    if (code.length === 6) {
      dispatch(verifySuccess());
      dispatch(goToScreen("welcome"));
    } else {
      dispatch(verifyFail());
    }
  };

  // Mask the identifier for display
  const maskedSentTo = codeSentTo.includes("@")
    ? codeSentTo.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : codeSentTo.replace(/(\d{3})(\d*)(\d{2})/, "$1***$3");

  return (
    <>
      <ConsultNavBar
        title="Verify"
        stepNum={0}
        totalSteps={0}
        onBack={() => dispatch(goToScreen("sign-in"))}
      />
      <div data-part="page-content">
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--color-text)", marginBottom: 8 }}>
            Enter your code
          </div>
          <div style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 8 }}>
            Sent to {maskedSentTo || "your email"}
          </div>
        </div>

        <CodeInput
          digits={codeDigits}
          onChange={(index, value) => dispatch(setCodeDigit({ index, value }))}
          onComplete={handleComplete}
          error={!!error}
        />

        {error && (
          <div style={{ textAlign: "center", color: "var(--color-danger)", fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div data-part="resend-row">
          <span>Didn't get it?</span>
          {resendCooldown > 0 ? (
            <span>
              <button data-part="signin-link" disabled style={{ opacity: 0.4 }}>Resend</button>
              {" "}0:{String(resendCooldown).padStart(2, "0")}
            </span>
          ) : (
            <button data-part="signin-link" onClick={() => dispatch(resendCode())}>
              Resend
            </button>
          )}
        </div>
      </div>
    </>
  );
}
