// Fringe intake — Extensions page (step 3 of 9)
// Replaces: IntakeExtPage
// API: servicesApi.createIntake() — POST with { service_type, hair_length, ext_type, desired_length }

import { useState } from "react";
import { color, font } from "../../../fringe-ui/tokens";
import { IntakeShell } from "../../../fringe-ui/layout/IntakeShell";
import { Segmented } from "../../../fringe-ui/primitives/Segmented";
import { Eyebrow } from "../../../fringe-ui/primitives/Eyebrow";
import { useCreateIntakeMutation } from "../../../stylist/store/api/bookingApi";
import type { IntakeCreateRequestDto } from "../../../stylist/store/api/types";

const LENGTHS = [
  { label: "Pixie",     h: 30 },
  { label: "Bob",       h: 52 },
  { label: "Shoulder",  h: 72 },
  { label: "Mid-back",  h: 100, sel: true },
];

const EXT_TYPES = [
  { value: "none",  label: "None" },
  { value: "taped", label: "Tape-in" },
  { value: "tied",  label: "Hand-tied" },
];

interface ExtensionsPageProps {
  onNext: () => void;
  onBack: () => void;
}

export function ExtensionsPage({ onNext, onBack }: ExtensionsPageProps) {
  const [selectedLength, setSelectedLength] = useState("Mid-back");
  const [extType, setExtType] = useState("none");
  const [createIntake, { isLoading }] = useCreateIntakeMutation();

  const handleSubmit = async () => {
    const payload: IntakeCreateRequestDto = {
      service_type: "extensions",
      hair_length: selectedLength,
      ext_type: extType === "none" ? undefined : extType,
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
      step={3}
      total={9}
      eyebrow="Chapter III · The Length"
      title="How long is it now?"
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel={isLoading ? "Saving…" : "Keep going →"}
    >
      <div style={{
        fontFamily: font.serif,
        fontStyle: "italic",
        fontSize: 17,
        color: color.softInk,
        marginBottom: 20,
      }}>
        Pick the silhouette that matches best today.
      </div>

      {/* Length silhouette grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
        marginBottom: 24,
      }}>
        {LENGTHS.map((l) => {
          const sel = l.label === selectedLength;
          return (
            <div
              key={l.label}
              onClick={() => setSelectedLength(l.label)}
              style={{
                background: sel ? color.peachSoft : color.cream,
                border: sel ? `1.5px solid ${color.plum}` : `1px solid ${color.rule}`,
                padding: 10,
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center" as const,
                gap: 8,
                minHeight: 150,
                justifyContent: "flex-end",
                cursor: "pointer",
              }}
            >
              <svg viewBox="0 0 40 120" style={{ flex: 1, width: "100%", maxHeight: 100 }}>
                <circle cx="20" cy="14" r="10" fill={color.plum}/>
                <path d={`M8 24 Q 20 ${24 + l.h * 0.8} 32 24`} stroke={color.plum} strokeWidth="3" fill="none"/>
                <path d={`M10 24 L 8 ${24 + l.h}`} stroke={color.plum} strokeWidth="2" fill="none"/>
                <path d={`M30 24 L 32 ${24 + l.h}`} stroke={color.plum} strokeWidth="2" fill="none"/>
              </svg>
              <Eyebrow
                color={sel ? color.plum : color.soft}
                style={{ fontSize: 10 }}
              >
                {l.label}
              </Eyebrow>
            </div>
          );
        })}
      </div>

      <Eyebrow style={{ marginBottom: 12 }}>EXTENSIONS</Eyebrow>
      <Segmented
        options={EXT_TYPES}
        value={extType}
        onChange={(v) => setExtType(v)}
      />
    </IntakeShell>
  );
}

export default ExtensionsPage;