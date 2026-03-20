import { useAppDispatch } from "../store";
import { goToScreen } from "../store/consultationSlice";
import { ConsultNavBar } from "../components/ConsultNavBar";
import { CareGuideContent } from "../components/CareGuideContent";
import { CARE_GUIDE_SECTIONS } from "../data/consultation-constants";

export function CareGuidePage() {
  const dispatch = useAppDispatch();

  return (
    <>
      <ConsultNavBar
        title="Extension Care 101"
        stepNum={0}
        totalSteps={0}
        onBack={() => dispatch(goToScreen("confirm"))}
      />
      <div data-part="page-content">
        <CareGuideContent sections={CARE_GUIDE_SECTIONS} />
      </div>
    </>
  );
}
