import type { CSSProperties } from "react";
import { color, type as typeToken } from "../../fringe-ui/tokens";

export interface DesktopStepRailItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface DesktopStepRailProps {
  /** Step items in order */
  steps: DesktopStepRailItem[];
  /** Index of the current (active) step (0-based) */
  current: number;
  /** Accent color for the active step dot */
  accent?: string;
  /** Called when a non-disabled, non-current step is clicked */
  onStepSelect?: (step: DesktopStepRailItem, index: number) => void;
  /** Optional style override */
  style?: CSSProperties;
}

export function DesktopStepRail({
  steps,
  current,
  accent = color.plum,
  onStepSelect,
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
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = !active && !step.disabled && !!onStepSelect;
        return (
          <button
            key={step.id}
            type="button"
            disabled={step.disabled}
            aria-current={active ? "step" : undefined}
            onClick={clickable ? () => onStepSelect(step, i) : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderTop: i === 0 ? "none" : `1px solid ${color.rule}`,
              color: active
                ? color.ink
                : done
                  ? color.softInk
                  : color.soft,
              background: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: "none",
              width: "100%",
              textAlign: "left",
              cursor: clickable ? "pointer" : "default",
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              outline: "none",
              ...(clickable ? {
                ":hover": { opacity: 0.8 },
                ":focus-visible": { boxShadow: `0 0 0 2px ${accent}` },
              } : {}),
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
                flexShrink: 0,
              }}
            />
            <div
              style={{
                ...typeToken.h3,
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              {step.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
