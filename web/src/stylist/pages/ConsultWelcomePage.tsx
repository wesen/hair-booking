import { useAppDispatch } from "../store";
import { selectServiceType, goToScreen } from "../store/consultationSlice";
import { ServiceCard } from "../components/ServiceCard";
import { Icon } from "../components/Icon";
import type { ConsultationServiceType, ConsultationScreen } from "../types";

export function ConsultWelcomePage() {
  const dispatch = useAppDispatch();

  const handleSelect = (type: ConsultationServiceType, screen: ConsultationScreen) => {
    dispatch(selectServiceType(type));
    dispatch(goToScreen(screen));
  };

  return (
    <div data-part="page-content" data-part-screen="screen-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
        <span style={{ fontSize: 18, color: "var(--color-text-muted)" }}>☰</span>
        <span data-part="loc-pill"><Icon name="pin" size={12} /> Providence, RI</span>
      </div>

      <div data-part="welcome-header">
        <div data-part="welcome-logo">✦&ensp;Luxe Hair Studio&ensp;✦</div>
        <div data-part="welcome-title">Ready for your<br />hair transformation?</div>
        <div data-part="welcome-sub">Tell us what you're looking for and<br />get an instant estimate</div>
      </div>

      <ServiceCard
        title="I Want Color"
        description="Blonding, balayage, color correction"
        emoji="💇‍♀️"
        gradientFrom="#f5e6d8"
        gradientTo="#eddcd0"
        onClick={() => handleSelect("color", "intake-color")}
      />

      <ServiceCard
        title="I Want Extensions"
        description="Tape-ins, k-tips, hand-tied wefts"
        emoji="✨"
        gradientFrom="#e8ddd0"
        gradientTo="#ddd0c0"
        onClick={() => handleSelect("extensions", "intake-ext")}
      />

      <ServiceCard
        title="Both Color + Extensions"
        description="The full transformation"
        emoji="🎨"
        gradientFrom="#eedfd2"
        gradientTo="#e2d0be"
        onClick={() => handleSelect("both", "intake-ext")}
      />

      <div data-part="signin-area">
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Already a client?</span>{" "}
        <button data-part="signin-link" onClick={() => dispatch(goToScreen("sign-in"))}>Sign in</button>
      </div>
    </div>
  );
}
