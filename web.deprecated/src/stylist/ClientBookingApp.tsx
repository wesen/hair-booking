// ClientBookingApp — Fringe client intake flow (Phase 3)
// Swaps Consult* pages for fringe/pages/client-booking/ pages

import { useAppSelector, useAppDispatch } from "./store";
import { goBack } from "./store/consultationSlice";
import {
  WelcomePage,
  ColorPage,
  ExtensionsPage,
  PhotosPage,
  HistoryPage,
  BudgetPage,
  BookingPage,
  ConfirmPage,
  CareGuidePage,
} from "../fringe/pages/client-booking";
import { AuthGatePage } from "../fringe/pages/shared";
import { AppHeader } from "../fringe-ui/chrome/AppHeader";
import { Eyebrow } from "../fringe-ui/primitives/Eyebrow";
import { useGetAvailabilityQuery } from "./store/api/bookingApi";
import { CARE_GUIDE_SECTIONS } from "./data/consultation-constants";

const SCREEN_TITLES: Record<string, string> = {
  "intake-ext":    "Extensions Consult",
  "intake-color": "Color Consult",
  photos:         "Photo Upload",
  "goals-ext":    "Your Goals",
  "goals-color":  "Your Goals",
  estimate:       "Your Estimate",
  calendar:       "Book Consult",
  confirm:        "",
  "sign-in":      "Sign In",
  "verify-code":  "Verify",
  "care-guide":   "Extension Care 101",
};


interface ClientBookingAppProps {
  unstyled?: boolean;
  themeVars?: Record<string, string>;
  showDepositOption?: boolean;
}

// Extended consultation data shape (some fields may not exist in the actual type)
interface ConsultationExtra {
  lastService?: string;
  lastServiceDate?: string;
  estimateLow?: number;
  estimateHigh?: number;
  appointmentServiceId?: string;
  intakeId?: string;
}

export function ClientBookingApp({ showDepositOption = true }: ClientBookingAppProps) {
  const dispatch = useAppDispatch();
  const screen = useAppSelector(s => s.consultation.screen);
  const serviceType = useAppSelector(s => s.consultation.data.serviceType);
  const data = useAppSelector(s => s.consultation.data) as ConsultationExtra;

  const steps = getSteps(serviceType);
  const currentIdx = steps.indexOf(screen);
  const totalSteps = steps.length;
  const stepNum = currentIdx + 1;
  const title = SCREEN_TITLES[screen] ?? "";

  const showNav = screen !== "welcome" && screen !== "confirm"
    && screen !== "sign-in" && screen !== "verify-code" && screen !== "care-guide";

  const serviceId = data.appointmentServiceId ?? "";
  useGetAvailabilityQuery(
    { month: "2026-06", serviceId },
    { skip: screen !== "calendar" || !serviceId }
  );

  const go = (s: typeof screen) => dispatch({ type: "consultation/goToScreen", payload: s });
  const back = () => dispatch(goBack());

  const estimateLow  = data.estimateLow  ?? 180;
  const estimateHigh = data.estimateHigh ?? 320;
  const serviceLabel = serviceType === "extensions" ? "Extensions"
    : serviceType === "color" ? "Color" : "Color + Extensions";

  if (screen === "sign-in") {
    return <AuthGatePage context="booking" onBack={back} />;
  }
  if (screen === "verify-code") {
    return <AuthGatePage context="booking" onBack={() => go("sign-in")} />;
  }
  if (screen === "care-guide") {
    return <CareGuidePage sections={CARE_GUIDE_SECTIONS} onBack={() => go("confirm")} onDone={() => go("confirm")} />;
  }

  return (
    <div data-widget="stylist" data-part="root">
      {showNav && (
        <div style={{ paddingTop: 8, background: "var(--fringe-color-paper, #faf8f5)" }}>
          <AppHeader step={stepNum} total={totalSteps} onBack={back} />
          {title ? (
            <div style={{ padding: "6px 22px 12px" }}>
              <Eyebrow>{title}</Eyebrow>
            </div>
          ) : null}
        </div>
      )}

      {screen === "welcome" && (
        <WelcomePage
          onSelectColor={()      => go("intake-color")}
          onSelectExtensions={() => go("intake-ext")}
          onSelectBoth={()       => go("intake-color")}
        />
      )}

      {screen === "intake-ext" && (
        <ExtensionsPage onNext={() => go("photos")} onBack={back} />
      )}

      {screen === "intake-color" && (
        <ColorPage onNext={() => go("photos")} onBack={back} />
      )}

      {screen === "photos" && (
        <PhotosPage
          intakeId={data.intakeId}
          onNext={() => go(serviceType === "color" ? "goals-color" : "goals-ext")}
          onBack={back}
        />
      )}

      {(screen === "goals-ext" || screen === "goals-color") && (
        <HistoryPage
          lastService={data.lastService}
          lastServiceDate={data.lastServiceDate}
          onNext={() => go("estimate")}
          onBack={back}
        />
      )}

      {screen === "estimate" && (
        <BudgetPage onNext={() => go("calendar")} onBack={back} />
      )}

      {screen === "calendar" && (
        <BookingPage
          serviceId={data.appointmentServiceId ?? "svc_001"}
          stylist={{ name: "Nadia Rivera", role: "Senior colorist", rate: "$180/hr", available: "12 more this week" }}
          onNext={() => go("confirm")}
          onBack={back}
        />
      )}

      {screen === "confirm" && (
        <ConfirmPage
          confirmationNumber="FRG-20250618-001"
          when="Thursday, June 19"
          time="10:30am"
          stylist="Nadia Rivera"
          service={serviceLabel}
          estimate={`$${estimateLow}–$${estimateHigh}`}
          duration="3h 15m"
          deposit="$50 deposit required"
          onDone={() => go("welcome")}
          onAddToCalendar={undefined}
        />
      )}
    </div>
  );
}

function getSteps(serviceType: string | null): string[] {
  if (serviceType === "extensions") return ["intake-ext", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  if (serviceType === "color")      return ["intake-color", "photos", "goals-color", "estimate", "calendar", "confirm"];
  if (serviceType === "both")       return ["intake-ext", "intake-color", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  return [];
}

export default ClientBookingApp;