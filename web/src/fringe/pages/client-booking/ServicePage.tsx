// Fringe intake — Service selection screen (step 1 of 9)
// Replaces: ConsultWelcomePage (service pick)
// Wire: dispatches consultationSlice.selectServiceType() then goToScreen()
// API: no write yet — first API call happens on the color/extensions step

import { useState } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { IntakeShell } from "../../fringe-ui/layout/IntakeShell";
import { Eyebrow } from "../../fringe-ui/primitives/Eyebrow";
import type { ConsultationServiceType, ConsultationScreen } from "../../stylist/types";

const SERVICES = [
  { key: "Cut" as const,        description: "Trim · restyle · bangs",                   rate: "$80+"  },
  { key: "Color" as const,       description: "Single process · gloss · root touch-up",  rate: "$120+" },
  { key: "Highlights" as const, description: "Partial · full · balayage",                rate: "$180+", sel: true },
  { key: "Extensions" as const,  description: "Tape-in · hand-tied · consultation first", rate: "$400+" },
  { key: "Treatment" as const,  description: "Olaplex · bond-repair · scalp",           rate: "$60+"  },
];

interface ServicePageProps {
  serviceType: ConsultationServiceType;
  screen: ConsultationScreen;
  onSelect: (type: ConsultationServiceType, screen: ConsultationScreen) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ServicePage({ onNext, onBack }: ServicePageProps) {
  const [selected, setSelected] = useState<string>("Highlights");

  return (
    <IntakeShell
      step={1}
      total={9}
      eyebrow="Chapter I · The Ask"
      title="What brings you in?"
      onNext={onNext}
      onBack={onBack}
    >
      <div style={{
        fontFamily: font.serif,
        fontStyle: "italic",
        fontSize: 17,
        color: color.softInk,
        marginBottom: 18,
      }}>
        Pick one to start — you can add more later.
      </div>

      {SERVICES.map((s) => {
        const sel = s.key === selected;
        return (
          <div
            key={s.key}
            onClick={() => setSelected(s.key)}
            style={{
              padding: "14px 16px",
              marginBottom: 8,
              background: sel ? color.peachSoft : color.cream,
              borderLeft: `3px solid ${sel ? color.plum : "transparent"}`,
              display: "flex",
              gap: 14,
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: font.block,
                fontSize: 20,
                textTransform: "uppercase" as const,
              }}>
                {s.key}
              </div>
              <div style={{
                fontFamily: font.sans,
                fontSize: 12,
                color: color.softInk,
                marginTop: 2,
              }}>
                {s.description}
              </div>
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 11, color: color.plum }}>
              {s.rate}
            </div>
          </div>
        );
      })}
    </IntakeShell>
  );
}

export default ServicePage;