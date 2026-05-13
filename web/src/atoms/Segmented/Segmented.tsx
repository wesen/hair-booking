import type { CSSProperties, ReactNode } from "react";
import { color, font } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export type SegmentedOption<TValue extends string = string> = { value: TValue; label: ReactNode; disabled?: boolean } | TValue;

export interface SegmentedProps<TValue extends string = string> {
  options: Array<SegmentedOption<TValue>>;
  value?: TValue;
  disabled?: boolean;
  onChange?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  style?: CSSProperties;
}

function normalizeOption<TValue extends string>(option: SegmentedOption<TValue>) {
  return typeof option === "string" ? { value: option as TValue, label: option, disabled: false } : option;
}

export function Segmented<TValue extends string = string>({ options, value, disabled = false, onChange, style }: SegmentedProps<TValue>) {
  return (
    <div data-component="Segmented" role="radiogroup" style={{ display: "flex", border: `1px solid ${color.ink}`, ...style }}>
      {options.map((option, i) => {
        const normalized = normalizeOption(option);
        const selected = normalized.value === value;
        const optionDisabled = disabled || normalized.disabled;

        return (
          <button
            key={normalized.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={optionDisabled}
            onClick={() => onChange?.(normalized.value, {
              value: normalized.value,
              label: normalized.label,
              item: normalized,
              previousValue: value ?? null,
              action: "select",
              source: "pointer",
            })}
            style={{
              flex: 1,
              padding: "10px 12px",
              fontFamily: font.block,
              fontSize: 13,
              letterSpacing: 1.5,
              textTransform: "uppercase" as const,
              background: selected ? color.ink : "transparent",
              color: selected ? color.paper : optionDisabled ? color.soft : color.ink,
              border: "none",
              borderLeft: i ? `1px solid ${color.ink}` : "none",
              cursor: optionDisabled ? "not-allowed" : "pointer",
              opacity: optionDisabled ? 0.5 : 1,
            }}
          >
            {normalized.label}
          </button>
        );
      })}
    </div>
  );
}
