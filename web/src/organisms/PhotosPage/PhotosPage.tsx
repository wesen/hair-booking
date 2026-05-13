// Fringe intake — Photos page (step 4 of 9)
// Replaces: PhotosPage
// API: servicesApi.uploadIntakePhoto() — POST /api/intakes/{id}/photos (FormData)

import { useState } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { IntakeShell } from "../IntakeShell/IntakeShell";
import { PhotoTile } from "../../molecules/PhotoTile/PhotoTile";
import { Eyebrow } from "../../atoms/Eyebrow/Eyebrow";

const CURRENT_ANGLES = ["Front", "Side", "Back"] as const;
const INSPIRATION_MAX = 4;

interface PhotosPageProps {
  intakeId?: string;
  onNext: () => void;
  onBack: () => void;
  onUpload?: (intakeId: string, slot: string, file: File) => Promise<void>;
}

export function PhotosPage({ onNext, onBack }: PhotosPageProps) {
  const [currentFilled, setCurrentFilled] = useState<Record<string, boolean>>({
    Front: true,
    Side: true,
    Back: false,
  });
  const [inspirationFilled, setInspirationFilled] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: false, 3: false,
  });

  return (
    <IntakeShell
      step={4}
      total={9}
      eyebrow="Chapter IV · The Reference"
      title="Three angles, please."
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
        Front, side, and back in natural light. Helps more than you'd think.
      </div>

      {/* Current hair photos */}
      <Eyebrow style={{ marginBottom: 10 }}>CURRENT HAIR — 3 ANGLES</Eyebrow>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        marginBottom: 20,
      }}>
        {CURRENT_ANGLES.map((angle) => (
          <PhotoTile
            key={angle}
            label={angle}
            filled={!!currentFilled[angle]}
          />
        ))}
      </div>

      {/* Inspiration */}
      <Eyebrow style={{ marginBottom: 10 }}>INSPIRATION (OPTIONAL · UP TO {INSPIRATION_MAX})</Eyebrow>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${INSPIRATION_MAX}, 1fr)`,
        gap: 6,
      }}>
        {Array.from({ length: INSPIRATION_MAX }).map((_, i) => (
          <PhotoTile
            key={i}
            label={String(i + 1)}
            filled={!!inspirationFilled[i]}
          />
        ))}
      </div>
    </IntakeShell>
  );
}

export default PhotosPage;