import type { CSSProperties, ReactNode } from "react";
import { color, font, type as typeToken } from "../../fringe-ui/tokens";

export interface AccentPanelProps {
  /** Background accent color */
  accent?: string;
  /** Text color on the accent background */
  accentInk?: string;
  /** Panel content */
  children?: ReactNode;
  /** Optional style override */
  style?: CSSProperties;
}

export function AccentPanel({
  accent = color.butter,
  accentInk = color.ink,
  children,
  style,
}: AccentPanelProps) {
  return (
    <div
      data-component="AccentPanel"
      style={{
        background: accent,
        padding: "56px 56px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 680,
        color: accentInk,
        // Override SummaryRow styles via CSS custom properties
        ...style,
      }}
    >
      {children}
    </div>
  );
}
