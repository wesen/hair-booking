// Fringe intake — Hair history page (step 5 of 9)
// Replaces: GoalsColorPage / GoalsExtPage (condition + history section)
// API: servicesApi.createIntake() — PATCH or update via servicesApi.updateIntake()

import { useState } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { IntakeShell } from "../IntakeShell/IntakeShell";
import { Card } from "../../atoms/Card/Card";
import { Chip } from "../../atoms/Chip/Chip";
import { RatingBar } from "../../atoms/RatingBar/RatingBar";
import { Eyebrow } from "../../atoms/Eyebrow/Eyebrow";

const CONDITIONS = [
  "Healthy", "Dry", "Damaged", "Brittle", "Oily", "Frizzy", "Fine", "Thick", "Color-treated",
];

interface HistoryPageProps {
  lastService?: string;
  lastServiceDate?: string;
  onNext: () => void;
  onBack: () => void;
}

export function HistoryPage({ onNext, onBack, lastService = "Partial highlights", lastServiceDate = "3 months ago" }: HistoryPageProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["Healthy", "Frizzy"]);

  const toggleCondition = (c: string) => {
    setSelectedConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const [ratings, setRatings] = useState({
    breakage: 2,
    splitEnds: 3,
    dryness: 1,
    frizz: 3,
  });

  const handleRating = (key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <IntakeShell
      step={5}
      total={9}
      eyebrow="Chapter V · The Record"
      title="Hair history"
      onNext={onNext}
      onBack={onBack}
    >
      {/* Last service card */}
      <Card accent={color.plum} style={{ marginBottom: 14 }}>
        <div data-component="HistoryPage" data-page="HistoryPage" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 4,
        }}>
          <Eyebrow>01 — LAST SERVICE</Eyebrow>
          <div data-component="HistoryPage" data-page="HistoryPage" style={{
            fontFamily: font.serif,
            fontStyle: "italic",
            fontSize: 14,
            color: color.soft,
          }}>
            edit
          </div>
        </div>
        <div data-component="HistoryPage" data-page="HistoryPage" style={{
          fontFamily: font.block,
          fontSize: 22,
          textTransform: "uppercase" as const,
        }}>
          {lastService}
        </div>
        <div data-component="HistoryPage" data-page="HistoryPage" style={{
          fontFamily: font.serif,
          fontStyle: "italic",
          fontSize: 16,
          color: color.plum,
          marginTop: 2,
        }}>
          {lastServiceDate}
        </div>
      </Card>

      {/* Current condition */}
      <div data-component="HistoryPage" data-page="HistoryPage" style={{ padding: "10px 0 14px" }}>
        <Eyebrow style={{ marginBottom: 10 }}>02 — CURRENT CONDITION</Eyebrow>
        <div data-component="HistoryPage" data-page="HistoryPage" style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
          {CONDITIONS.map((c) => (
            <Chip
              key={c}
              selected={selectedConditions.includes(c)}
              onClick={() => toggleCondition(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {/* Condition rating bars */}
      <div data-component="HistoryPage" data-page="HistoryPage" style={{ padding: "14px 0", borderTop: `1px solid ${color.rule}` }}>
        <Eyebrow style={{ marginBottom: 12 }}>03 — RATE CONDITION</Eyebrow>
        <RatingBar
          label="Breakage"
          value={ratings.breakage}
        />
        <RatingBar
          label="Split ends"
          value={ratings.splitEnds}
        />
        <RatingBar
          label="Dryness"
          value={ratings.dryness}
        />
        <RatingBar
          label="Frizz"
          value={ratings.frizz}
        />
      </div>
    </IntakeShell>
  );
}

export default HistoryPage;