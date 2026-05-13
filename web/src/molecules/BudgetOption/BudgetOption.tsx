import type { CSSProperties } from "react";
import { color, type as typeToken } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface BudgetOptionProps<TValue extends string = string> {
  value?: TValue;
  label: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onSelect?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  style?: CSSProperties;
}

export function BudgetOption<TValue extends string = string>({
  value,
  label,
  description,
  selected = false,
  disabled = false,
  onClick,
  onSelect,
  style,
}: BudgetOptionProps<TValue>) {
  const optionValue = (value ?? label) as TValue;
  const interactive = Boolean(onClick || onSelect) && !disabled;

  return (
    <button
      data-component="BudgetOption"
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
        width: "100%",
        padding: "16px 18px",
        marginBottom: 8,
        background: selected ? color.peachSoft : color.cream,
        border: "none",
        borderLeft: `3px solid ${selected ? color.plum : "transparent"}`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: interactive ? "pointer" : disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.55 : 1,
        textAlign: "left",
        ...style,
      }}
    >
      <div style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        border: `2px solid ${selected ? color.plum : color.soft}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {selected && (
          <div style={{ width: 8, height: 8, borderRadius: 999, background: color.plum }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ ...typeToken.h3, fontSize: 19 }}>{label}</div>
        <div style={{ ...typeToken.bodySm, color: color.softInk, marginTop: 2 }}>{description}</div>
      </div>
    </button>
  );
}
