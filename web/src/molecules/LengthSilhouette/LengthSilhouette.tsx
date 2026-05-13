import type { CSSProperties } from "react";
import { color, type as typeToken } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface LengthSilhouetteProps<TValue extends string = string> {
  value?: TValue;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onSelect?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  style?: CSSProperties;
}

const HEIGHT_MAP: Record<string, number> = {
  "Pixie": 30,
  "Bob": 52,
  "Shoulder": 72,
  "Mid-back": 100,
  "Waist": 120,
};

export function LengthSilhouette<TValue extends string = string>({
  value,
  label,
  selected = false,
  disabled = false,
  onClick,
  onSelect,
  style,
}: LengthSilhouetteProps<TValue>) {
  const h = HEIGHT_MAP[label] ?? 72;
  const optionValue = (value ?? label) as TValue;
  const interactive = Boolean(onClick || onSelect) && !disabled;

  return (
    <button
      data-component="LengthSilhouette"
      data-part={selected ? "selected" : disabled ? "disabled" : undefined}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        onSelect?.(optionValue, {
          value: optionValue,
          label,
          previousValue: selected ? optionValue : null,
          action: selected ? "deselect" : "select",
          source: "pointer",
        });
      }}
      style={{
        background: selected ? color.peachSoft : color.cream,
        border: selected
          ? `1.5px solid ${color.plum}`
          : `1px solid ${color.rule}`,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        minHeight: 150,
        justifyContent: "flex-end",
        cursor: interactive ? "pointer" : disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      <svg viewBox="0 0 40 120" style={{ flex: 1, width: "100%" }} aria-hidden="true">
        <circle cx="20" cy="14" r="10" fill={selected ? color.plum : color.soft} />
        <path
          d={`M8 24 Q 20 ${24 + h * 0.8} 32 24`}
          stroke={selected ? color.plum : color.soft}
          strokeWidth="3"
          fill="none"
        />
        <path
          d={`M10 24 L 8 ${24 + h}`}
          stroke={selected ? color.plum : color.soft}
          strokeWidth="2"
          fill="none"
        />
        <path
          d={`M30 24 L 32 ${24 + h}`}
          stroke={selected ? color.plum : color.soft}
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <div style={{
        ...typeToken.eyebrow,
        color: selected ? color.plum : color.soft,
        fontSize: 10,
      }}>
        {label}
      </div>
    </button>
  );
}
