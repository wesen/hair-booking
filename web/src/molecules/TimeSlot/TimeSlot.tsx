import type { CSSProperties } from "react";
import { color, font } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface TimeSlotProps<TValue extends string = string> {
  value?: TValue;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick?: () => void;
  onSelect?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  style?: CSSProperties;
}

export function TimeSlot<TValue extends string = string>({
  value,
  label,
  selected = false,
  disabled = false,
  disabledReason,
  onClick,
  onSelect,
  style,
}: TimeSlotProps<TValue>) {
  const optionValue = (value ?? label) as TValue;

  return (
    <button
      data-component="TimeSlot"
      data-part={selected ? "selected" : disabled ? "disabled" : undefined}
      type="button"
      aria-pressed={selected}
      aria-label={disabledReason ? `${label} (${disabledReason})` : label}
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
        padding: "10px 6px",
        textAlign: "center",
        background: selected ? color.plum : color.cream,
        color: selected ? color.paper : disabled ? color.soft : color.ink,
        fontFamily: font.mono,
        fontSize: 12,
        letterSpacing: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        border: `1px solid ${selected ? color.plum : color.rule}`,
        borderRadius: 2,
        ...style,
      }}
    >
      {label}
    </button>
  );
}
