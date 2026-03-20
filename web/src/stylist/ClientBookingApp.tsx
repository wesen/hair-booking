import { useAppSelector, useAppDispatch } from "./store";
import { goBack, goNext, setDepositPaid } from "./store/consultationSlice";
import { closeDepositSheet, setCardNumber, setCardExpiry, setCardCvc, setCardZip, startPayment, paymentSuccess } from "./store/authSlice";
import { ConsultNavBar } from "./components/ConsultNavBar";
import { DepositPaymentSheet } from "./components/DepositPaymentSheet";
import { ConsultWelcomePage } from "./pages/ConsultWelcomePage";
import { IntakeExtPage } from "./pages/IntakeExtPage";
import { IntakeColorPage } from "./pages/IntakeColorPage";
import { PhotosPage } from "./pages/PhotosPage";
import { GoalsExtPage } from "./pages/GoalsExtPage";
import { GoalsColorPage } from "./pages/GoalsColorPage";
import { ConsultEstimatePage } from "./pages/ConsultEstimatePage";
import { ConsultCalendarPage } from "./pages/ConsultCalendarPage";
import { ConsultConfirmPage } from "./pages/ConsultConfirmPage";
import { SignInPage } from "./pages/SignInPage";
import { VerifyCodePage } from "./pages/VerifyCodePage";
import { CareGuidePage } from "./pages/CareGuidePage";

const SCREEN_TITLES: Record<string, string> = {
  "intake-ext": "Extensions Consult",
  "intake-color": "Color Consult",
  photos: "Photo Upload",
  "goals-ext": "Your Goals",
  "goals-color": "Your Goals",
  estimate: "Your Estimate",
  calendar: "Book Consult",
  confirm: "",
  "sign-in": "Sign In",
  "verify-code": "Verify",
  "care-guide": "Extension Care 101",
};

interface ClientBookingAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
}

export function ClientBookingApp({ unstyled, themeVars }: ClientBookingAppProps) {
  const dispatch = useAppDispatch();
  const screen = useAppSelector(s => s.consultation.screen);
  const depositPaid = useAppSelector(s => s.consultation.data.depositPaid);
  const auth = useAppSelector(s => s.auth);
  const serviceType = useAppSelector(s => s.consultation.data.serviceType);

  const steps = getSteps(serviceType);
  const currentIdx = steps.indexOf(screen);
  const totalSteps = steps.length;
  const stepNum = currentIdx + 1;

  const title = screen === "calendar" && depositPaid
    ? "Book + Deposit"
    : SCREEN_TITLES[screen] || "";

  const showNav = screen !== "welcome" && screen !== "confirm" && screen !== "sign-in" && screen !== "verify-code" && screen !== "care-guide";

  const rootStyle: React.CSSProperties = themeVars
    ? Object.fromEntries(Object.entries(themeVars))
    : {};

  return (
    <div
      data-widget={unstyled ? undefined : "stylist"}
      data-part="root"
      style={rootStyle}
    >
      {showNav && (
        <ConsultNavBar
          title={title}
          stepNum={stepNum}
          totalSteps={totalSteps}
          onBack={() => dispatch(goBack())}
        />
      )}

      {screen === "welcome" && <ConsultWelcomePage />}
      {screen === "intake-ext" && <IntakeExtPage />}
      {screen === "intake-color" && <IntakeColorPage />}
      {screen === "photos" && <PhotosPage />}
      {screen === "goals-ext" && <GoalsExtPage />}
      {screen === "goals-color" && <GoalsColorPage />}
      {screen === "estimate" && <ConsultEstimatePage />}
      {screen === "calendar" && <ConsultCalendarPage />}
      {screen === "confirm" && <ConsultConfirmPage />}
      {screen === "sign-in" && <SignInPage />}
      {screen === "verify-code" && <VerifyCodePage />}
      {screen === "care-guide" && <CareGuidePage />}

      {auth.showDepositSheet && (
        <DepositPaymentSheet
          amount={75}
          cardNumber={auth.cardNumber}
          cardExpiry={auth.cardExpiry}
          cardCvc={auth.cardCvc}
          cardZip={auth.cardZip}
          onCardNumberChange={v => dispatch(setCardNumber(v))}
          onCardExpiryChange={v => dispatch(setCardExpiry(v))}
          onCardCvcChange={v => dispatch(setCardCvc(v))}
          onCardZipChange={v => dispatch(setCardZip(v))}
          onPay={() => {
            dispatch(startPayment());
            // Simulate payment processing
            setTimeout(() => {
              dispatch(paymentSuccess());
              dispatch(setDepositPaid(true));
              dispatch(goNext());
            }, 1000);
          }}
          onClose={() => dispatch(closeDepositSheet())}
          processing={auth.paymentProcessing}
          error={auth.paymentError}
        />
      )}
    </div>
  );
}

function getSteps(serviceType: string | null): string[] {
  if (serviceType === "extensions") return ["intake-ext", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  if (serviceType === "color") return ["intake-color", "photos", "goals-color", "estimate", "calendar", "confirm"];
  if (serviceType === "both") return ["intake-ext", "intake-color", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  return [];
}
