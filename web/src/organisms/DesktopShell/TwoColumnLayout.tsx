import type { CSSProperties, ReactNode } from "react";
import { color } from "../../fringe-ui/tokens";

export interface TwoColumnLayoutProps {
  /** CSS value for left column width (e.g. "1fr", "1.15fr") */
  leftWidth?: string;
  /** CSS value for right column width (e.g. "1fr", "340px") */
  rightWidth?: string;
  /** Gap between columns in pixels */
  gap?: number;
  /** Left column content */
  left: ReactNode;
  /** Right column content */
  right: ReactNode;
  /** Optional style override */
  style?: CSSProperties;
}

export function TwoColumnLayout({
  leftWidth = "1fr",
  rightWidth = "1fr",
  gap = 48,
  left,
  right,
  style,
}: TwoColumnLayoutProps) {
  return (
    <div
      data-component="TwoColumnLayout"
      style={{
        display: "grid",
        gridTemplateColumns: `${leftWidth} ${rightWidth}`,
        gap,
        ...style,
      }}
    >
      <div data-part="left-column">{left}</div>
      <div data-part="right-column">{right}</div>
    </div>
  );
}
