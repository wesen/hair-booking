import type { CSSProperties } from "react";
import { color } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface DayCellProps<TValue extends string = string> {
  value?: TValue;
  day: string | number;
  selected?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick?: () => void;
  onSelect?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  dot?: boolean;
  style?: CSSProperties;
}

export function DayCell<TValue extends string = string>({ value, day, selected, disabled, disabledReason, onClick, onSelect, dot, style }: DayCellProps<TValue>) {
  const dayLabel = String(day);
  const optionValue = (value ?? dayLabel) as TValue;

  return (
    <button
      data-component="DayCell"
      data-part={selected ? "selected" : disabled ? "disabled" : undefined}
      type="button"
      aria-pressed={selected}
      aria-label={disabledReason ? `${dayLabel} (${disabledReason})` : dayLabel}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        onSelect?.(optionValue, {
          value: optionValue,
          label: dayLabel,
          previousValue: selected ? optionValue : null,
          action: selected ? "deselect" : "select",
          source: "pointer",
        });
      }}
      disabled={disabled}
      style={{
        aspectRatio: "1/1",
        background: selected ? color.plum : "transparent",
        border: `1px solid ${selected ? color.plum : color.rule}`,
        color: selected ? color.paper : disabled ? color.soft : color.ink,
        fontFamily: '"Anton", Impact, sans-serif',
        fontSize: 16,
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        opacity: disabled ? 0.35 : 1,
        padding: 0,
        ...style,
      }}
    >
      {dayLabel}
      {dot && (
        <div data-part="dot" style={{
          position: "absolute",
          bottom: 4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 4,
          height: 4,
          borderRadius: 2,
          background: selected ? color.peach : color.plum,
        }} />
      )}
    </button>
  );
}
