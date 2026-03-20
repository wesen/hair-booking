import { useAppSelector, useAppDispatch } from "./store";
import { goBack } from "./store/consultationSlice";
import { ConsultNavBar } from "./components/ConsultNavBar";
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
  showDepositOption?: boolean;
}

export function ClientBookingApp({ unstyled, themeVars, showDepositOption = true }: ClientBookingAppProps) {
  const dispatch = useAppDispatch();
  const screen = useAppSelector(s => s.consultation.screen);
  const serviceType = useAppSelector(s => s.consultation.data.serviceType);

  const steps = getSteps(serviceType);
  const currentIdx = steps.indexOf(screen);
  const totalSteps = steps.length;
  const stepNum = currentIdx + 1;

  const title = SCREEN_TITLES[screen] || "";

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
      {screen === "estimate" && <ConsultEstimatePage showDepositOption={showDepositOption} />}
      {screen === "calendar" && <ConsultCalendarPage />}
      {screen === "confirm" && <ConsultConfirmPage />}
      {screen === "sign-in" && <SignInPage />}
      {screen === "verify-code" && <VerifyCodePage />}
      {screen === "care-guide" && <CareGuidePage />}
    </div>
  );
}

function getSteps(serviceType: string | null): string[] {
  if (serviceType === "extensions") return ["intake-ext", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  if (serviceType === "color") return ["intake-color", "photos", "goals-color", "estimate", "calendar", "confirm"];
  if (serviceType === "both") return ["intake-ext", "intake-color", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  return [];
}
