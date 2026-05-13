import type { CSSProperties } from "react";
import { color, type as typeToken } from "../../fringe-ui/tokens";

export interface DesktopStepRailProps {
  /** Step labels in order, e.g. ["01 Service", "02 Color", ...] */
  steps: string[];
  /** Index of the current (active) step (0-based) */
  current: number;
  /** Accent color for the active step dot */
  accent?: string;
  /** Optional style override */
  style?: CSSProperties;
}

export function DesktopStepRail({
  steps,
  current,
  accent = color.plum,
  style,
}: DesktopStepRailProps) {
  return (
    <div
      data-component="DesktopStepRail"
      style={{
        width: 220,
        padding: "32px 28px",
        borderRight: `1px solid ${color.rule}`,
        background: color.cream,
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          ...typeToken.eyebrow,
          color: color.plum,
          marginBottom: 20,
        }}
      >
        Intake · {steps.length} steps
      </div>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={label}
            style={{
              padding: "10px 0",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderTop: i === 0 ? "none" : `1px solid ${color.rule}`,
              color: active
                ? color.ink
                : done
                  ? color.softInk
                  : color.soft,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: active
                  ? accent
                  : done
                    ? color.plum
                    : "transparent",
                border:
                  !active && !done
                    ? `1px solid ${color.soft}`
                    : "none",
              }}
            />
            <div
              style={{
                ...typeToken.h3,
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
