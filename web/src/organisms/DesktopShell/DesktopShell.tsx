import type { CSSProperties, ReactNode } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { TopNav } from "../../molecules/TopNav/TopNav";
import { DesktopStepRail } from "../../molecules/DesktopStepRail/DesktopStepRail";

export interface DesktopShellProps {
  /** Current step index (0-based) for StepRail highlighting */
  step: number;
  /** Total number of steps */
  total: number;
  /** Accent color token value (e.g. color.butter, color.sage) */
  accent?: string;
  /** Accent ink color (text on accent backgrounds) */
  accentInk?: string;
  /** Active top-nav item */
  activeNav?: string;
  /** User info for top nav */
  user?: { name: string; initial: string };
  /** Page content (rendered inside the content area) */
  children?: ReactNode;
  /** Optional style override */
  style?: CSSProperties;
}

const defaultSteps = [
  "01 Service",
  "02 Color",
  "03 Length",
  "04 Photos",
  "05 History",
  "06 Budget",
  "07 Estimate",
  "08 Booking",
  "09 Confirm",
];

export function DesktopShell({
  step,
  total,
  accent = color.plum,
  accentInk = color.paper,
  activeNav = "Book",
  user = { name: "Mia", initial: "M" },
  children,
  style,
}: DesktopShellProps) {
  const steps = defaultSteps.slice(0, total);

  return (
    <div
      data-component="DesktopShell"
      data-dsl-shell="desktop"
      style={{
        width: "100%",
        height: "100%",
        background: color.paper,
        display: "flex",
        flexDirection: "column",
        fontFamily: font.sans,
        ...style,
      }}
    >
      {/* Top navigation bar */}
      <TopNav accent={accent} activeItem={activeNav} user={user} />

      {/* Body: step rail + content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <DesktopStepRail steps={steps} current={step} accent={accent} />
        <div
          data-component="DesktopShellContent"
          style={{ flex: 1, overflow: "auto" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
