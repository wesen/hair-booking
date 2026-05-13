// Fringe intake — Color page (step 2 of 9)
// Replaces: IntakeColorPage
// API: bookingApi.createIntake() — POST with { service_type, color_service, natural_level, current_color }

import { useState } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { IntakeShell } from "../IntakeShell/IntakeShell";
import { Chip } from "../../atoms/Chip/Chip";
import { Note } from "../../atoms/Note/Note";
import { Segmented } from "../../atoms/Segmented/Segmented";
import { Eyebrow } from "../../atoms/Eyebrow/Eyebrow";
import { useCreateIntakeMutation } from "../../store/api/bookingApi";
import type { IntakeCreateRequestDto } from "../../store/api/types";

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LEVEL_COLORS = ["#1a120c","#2a1c10","#3d2a1e","#5a3e2a","#7a5638","#9b7547","#b89461","#d1b283","#e2ce9e","#ead9af"];

const TARGET_OPTIONS = [
  { value: "same",         label: "Stay the same" },
  { value: "lighter1",     label: "Go 1 shade lighter" },
  { value: "lighter2",     label: "Go 2 shades lighter" },
  { value: "darker",       label: "Darker" },
  { value: "dimensional",   label: "Dimensional" },
];

const COLOR_TYPES = [
  { value: "full",       label: "Full color" },
  { value: "highlights", label: "Highlights" },
  { value: "balayage",   label: "Balayage" },
  { value: "gloss",      label: "Gloss / toner" },
  { value: "root",       label: "Root touch-up" },
];

interface ColorPageProps {
  onNext: () => void;
  onBack: () => void;
}

function levelLabel(l: number): string {
  if (l <= 3) return "dark";
  if (l <= 6) return "medium";
  if (l <= 8) return "light";
  return "blonde";
}

export function ColorPage({ onNext, onBack }: ColorPageProps) {
  const [level, setLevel] = useState(7);
  const [target, setTarget] = useState("lighter1");
  const [colorType, setColorType] = useState("highlights");
  const [createIntake, { isLoading }] = useCreateIntakeMutation();

  const handleSubmit = async () => {
    const payload: IntakeCreateRequestDto = {
      service_type: "color",
      color_service: colorType,
      natural_level: String(level),
      current_color: `Level ${level} · ${levelLabel(level)}`,
    };
    try {
      await createIntake(payload).unwrap();
    } catch {
      // non-blocking
    }
    onNext();
  };

  return (
    <IntakeShell
      step={2}
      total={9}
      eyebrow="Chapter II · The Tone"
      title="Current level"
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel={isLoading ? "Saving…" : "Keep going →"}
    >
      <div data-component="ColorPage" data-page="ColorPage" style={{
        fontFamily: font.serif,
        fontStyle: "italic",
        fontSize: 17,
        color: color.softInk,
        marginBottom: 20,
      }}>
        Slide to your starting point. 1 is black, 10 is platinum.
      </div>

      {/* Color level visualizer */}
      <div data-component="ColorPage" data-page="ColorPage" style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        height: 140,
        marginBottom: 18,
      }}>
        {LEVELS.map((l) => {
          const sel = l === level;
          return (
            <div data-component="ColorPage" data-page="ColorPage"
              key={l}
              onClick={() => setLevel(l)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center" as const,
                gap: 6,
                cursor: "pointer",
              }}
            >
              <div data-component="ColorPage" data-page="ColorPage" style={{
                flex: 1,
                width: "100%",
                background: LEVEL_COLORS[l - 1],
                border: sel ? `2px solid ${color.plum}` : "none",
                marginBottom: 4,
                borderRadius: 2,
              }} />
              <div data-component="ColorPage" data-page="ColorPage" style={{
                fontFamily: font.mono,
                fontSize: 10,
                color: sel ? color.plum : color.soft,
                fontWeight: sel ? 600 : 400,
              }}>
                {l}
              </div>
            </div>
          );
        })}
      </div>

      <Note tone="info">
        You're at <strong>Level {level}</strong> — {levelLabel(level)}.
      </Note>

      {/* Color service type */}
      <div data-component="ColorPage" data-page="ColorPage" style={{ marginTop: 20 }}>
        <Eyebrow style={{ marginBottom: 10 }}>SERVICE TYPE</Eyebrow>
        <Segmented
          options={COLOR_TYPES}
          value={colorType}
          onChange={(v) => setColorType(v)}
        />
      </div>

      {/* Target */}
      <div data-component="ColorPage" data-page="ColorPage" style={{ marginTop: 20 }}>
        <Eyebrow style={{ marginBottom: 10 }}>TARGET (OPTIONAL)</Eyebrow>
        <div data-component="ColorPage" data-page="ColorPage" style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
          {TARGET_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              selected={target === o.value}
              onClick={() => setTarget(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </div>
    </IntakeShell>
  );
}

export default ColorPage;