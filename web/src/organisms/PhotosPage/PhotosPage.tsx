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
      titleSize={44}
      onNext={onNext}
      onBack={onBack}
    >
      <div data-component="PhotosPage" data-page="PhotosPage" data-section="photos-intro" style={{
        fontFamily: font.serif,
        fontStyle: "italic",
        fontSize: 16,
        color: color.softInk,
        marginBottom: 20,
      }}>
        Front, side, and back in natural light. Helps more than you'd think.
      </div>

      {/* Current hair photos */}
      <div data-section="photos-current-title">
        <Eyebrow style={{ marginBottom: 10 }}>CURRENT HAIR — 3 ANGLES</Eyebrow>
      </div>
      <div data-component="PhotosPage" data-page="PhotosPage" data-section="photos-current-grid" style={{
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
      <div data-section="photos-inspiration-title">
        <Eyebrow style={{ marginBottom: 10 }}>INSPIRATION (OPTIONAL · UP TO {INSPIRATION_MAX})</Eyebrow>
      </div>
      <div data-component="PhotosPage" data-page="PhotosPage" data-section="photos-inspiration-grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${INSPIRATION_MAX}, 1fr)`,
        gap: 6,
      }}>
        {Array.from({ length: INSPIRATION_MAX }).map((_, i) => {
          const filled = !!inspirationFilled[i];
          return (
            <div
              key={i}
              style={{
                aspectRatio: "1 / 1",
                background: filled ? color.peach : color.cream,
                border: `1px solid ${filled ? color.peach : color.rule}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: font.block,
                fontSize: filled ? 22 : 16,
                color: filled ? color.plum : color.soft,
              }}
            >
              {filled ? "✓" : "+"}
            </div>
          );
        })}
      </div>
    </IntakeShell>
  );
}

export default PhotosPage;