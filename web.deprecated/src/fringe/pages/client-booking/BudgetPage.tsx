// Fringe intake — Budget page (step 6 of 9)
// Replaces: GoalsColorPage / GoalsExtPage (budget section)
// API: servicesApi.createIntake() — update with { budget }

import { useState } from "react";
import { color, font } from "../../../fringe-ui/tokens";
import { IntakeShell } from "../../../fringe-ui/layout/IntakeShell";

const TIERS = [
  { key: "under150", label: "Under $150",    description: "Cut or single-service touch-up" },
  { key: "150_250",   label: "$150 – $250",   description: "Partial color + cut",         sel: true },
  { key: "250_400",  label: "$250 – $400",   description: "Full color · highlights + cut" },
  { key: "400plus",  label: "$400+",         description: "Extensions · correction · balayage" },
];

interface BudgetPageProps {
  onNext: () => void;
  onBack: () => void;
  onSelect?: (budget: string) => void;
}

export function BudgetPage({ onNext, onBack, onSelect }: BudgetPageProps) {
  const [selected, setSelected] = useState("150_250");

  const handleTier = (key: string) => {
    setSelected(key);
    onSelect?.(key);
  };

  return (
    <IntakeShell
      step={6}
      total={9}
      eyebrow="Chapter VI · The Budget"
      title="Comfortable range?"
      onNext={onNext}
      onBack={onBack}
    >
      <div style={{
        fontFamily: font.serif,
        fontStyle: "italic",
        fontSize: 17,
        color: color.softInk,
        marginBottom: 20,
      }}>
        Helps us match you to the right stylist. Tips not included.
      </div>

      {TIERS.map((t) => {
        const sel = t.key === selected;
        return (
          <div
            key={t.key}
            onClick={() => handleTier(t.key)}
            style={{
              padding: "16px 18px",
              marginBottom: 8,
              background: sel ? color.peachSoft : color.cream,
              borderLeft: `3px solid ${sel ? color.plum : "transparent"}`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
            }}
          >
            {/* Radio circle */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              border: `2px solid ${sel ? color.plum : color.soft}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {sel && (
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: color.plum,
                }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: font.block,
                fontSize: 19,
                textTransform: "uppercase" as const,
              }}>
                {t.label}
              </div>
              <div style={{
                fontFamily: font.sans,
                fontSize: 12,
                color: color.softInk,
                marginTop: 2,
              }}>
                {t.description}
              </div>
            </div>
          </div>
        );
      })}
    </IntakeShell>
  );
}

export default BudgetPage;