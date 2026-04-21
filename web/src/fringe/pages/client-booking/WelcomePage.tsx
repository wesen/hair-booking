// Fringe intake — Welcome / Service selection screen
// Replaces: ConsultWelcomePage
// Route: / → entry point of the client booking flow
// API: no write — just dispatches Redux state + navigates to first step

import { color, type, font } from "../../fringe-ui/tokens";
import { Button } from "../../fringe-ui/primitives/Button";
import { Wordmark } from "../../fringe-ui/primitives/Wordmark";
import { Eyebrow } from "../../fringe-ui/primitives/Eyebrow";
import { Rule } from "../../fringe-ui/primitives/Rule";

interface WelcomePageProps {
  onSelectColor: () => void;
  onSelectExtensions: () => void;
  onSelectBoth: () => void;
  clientName?: string;
}

const SERVICES = [
  {
    key: "color" as const,
    title: "I Want Color",
    description: "Blonding, balayage, color correction",
    rate: "$120+",
    emoji: "💇‍♀️",
  },
  {
    key: "extensions" as const,
    title: "I Want Extensions",
    description: "Tape-ins, k-tips, hand-tied wefts",
    rate: "$400+",
    emoji: "✨",
  },
  {
    key: "both" as const,
    title: "Both Color + Extensions",
    description: "The full transformation",
    rate: "$400+",
    emoji: "🎨",
  },
];

export function WelcomePage({
  onSelectColor,
  onSelectExtensions,
  onSelectBoth,
  clientName,
}: WelcomePageProps) {
  const handleSelect = (key: "color" | "extensions" | "both") => {
    if (key === "color") onSelectColor();
    else if (key === "extensions") onSelectExtensions();
    else onSelectBoth();
  };

  return (
    <div style={{ background: color.cream, minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 24px",
        borderBottom: `1px solid ${color.rule}`,
      }}>
        <div style={{ fontFamily: font.sans, fontSize: 18, color: color.soft }}>☰</div>
        <Eyebrow color={color.soft}>Providence, RI</Eyebrow>
      </div>

      {/* Logo area */}
      <div style={{ padding: "40px 24px 32px", textAlign: "center" as const }}>
        <div style={{
          fontFamily: font.mono,
          fontSize: 11,
          letterSpacing: 2.5,
          textTransform: "uppercase" as const,
          color: color.plum,
          marginBottom: 18,
        }}>
          ✦&ensp;Fringe&ensp;✦
        </div>
        <div style={{
          ...type.display3,
          fontSize: 40,
          color: color.ink,
          lineHeight: 1.05,
          marginBottom: 16,
        }}>
          Ready for your<br />hair transformation?
        </div>
        <div style={{
          fontFamily: font.serif,
          fontStyle: "italic",
          fontSize: 17,
          color: color.softInk,
          lineHeight: 1.45,
        }}>
          Tell us what you're looking for and<br />get an instant estimate.
        </div>
      </div>

      {/* Service cards */}
      <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column" as const, gap: 12 }}>
        {SERVICES.map((s) => (
          <ServiceCard
            key={s.key}
            title={s.title}
            description={s.description}
            rate={s.rate}
            onClick={() => handleSelect(s.key)}
          />
        ))}
      </div>

      <Rule />

      {/* Sign in link */}
      <div style={{ padding: "16px 24px 40px", textAlign: "center" as const }}>
        {clientName ? (
          <span style={{ fontFamily: font.sans, fontSize: 13, color: color.soft }}>
            Signed in as {clientName}.
          </span>
        ) : (
          <span style={{ fontFamily: font.sans, fontSize: 13, color: color.soft }}>
            Already a client?{" "}
            <span
              onClick={() => {}}
              style={{ color: color.plum, cursor: "pointer", fontWeight: 500 }}
            >
              Sign in
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── ServiceCard (inline, matches the new Fringe card style)
function ServiceCard({
  title,
  description,
  rate,
  onClick,
}: {
  title: string;
  description: string;
  rate: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: color.cream,
        padding: "20px 20px 18px",
        border: `1px solid ${color.rule}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = color.creamDeep; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = color.cream; }}
    >
      <div style={{
        fontFamily: font.block,
        fontSize: 26,
        letterSpacing: 0,
        color: color.plum,
        flex: 1,
      }}>
        <span style={{ display: "inline-block", transform: "scale(1.2)" }}>
          {title.includes("Color") ? "💇‍♀️" : title.includes("Extensions") ? "✨" : "🎨"}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.block,
          fontSize: 16,
          letterSpacing: 0.5,
          textTransform: "uppercase" as const,
          color: color.ink,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: font.sans,
          fontSize: 12,
          color: color.softInk,
          marginTop: 3,
        }}>
          {description}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: color.plum }}>{rate}</div>
      </div>
    </div>
  );
}

export default WelcomePage;