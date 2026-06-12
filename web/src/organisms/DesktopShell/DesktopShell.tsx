import type { CSSProperties, ReactNode } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { TopNav } from "../../molecules/TopNav/TopNav";
import { DesktopStepRail, type DesktopStepRailItem } from "../../molecules/DesktopStepRail/DesktopStepRail";

export interface DesktopShellProps {
  /** Current step index (0-based) for StepRail highlighting */
  step: number;
  /** Total number of steps */
  total: number;
  /** Step items with IDs and labels (overrides default generated labels) */
  stepItems?: DesktopStepRailItem[];
  /** Called when a non-disabled, non-current step is clicked */
  onStepSelect?: (step: DesktopStepRailItem, index: number) => void;
  /** Step labels (fallback if stepItems not provided) */
  stepLabels?: string[];
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
  "03 Photos",
  "04 Budget",
  "05 Estimate",
  "06 Booking",
  "07 Confirm",
];

export function DesktopShell({
  step,
  total,
  stepItems,
  onStepSelect,
  stepLabels,
  accent = color.plum,
  accentInk = color.paper,
  activeNav = "Book",
  user = { name: "Mia", initial: "M" },
  children,
  style,
}: DesktopShellProps) {
  const defaultItems: DesktopStepRailItem[] = defaultSteps.slice(0, total).map((label, i) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
  }));
  const items = stepItems?.slice(0, total) || defaultItems;

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
        <DesktopStepRail steps={items} current={step} accent={accent} onStepSelect={onStepSelect} style={{ position: "relative", zIndex: 1 }} />
        <div
          data-component="DesktopShellContent"
          style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 0 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
