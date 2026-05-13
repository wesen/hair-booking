import type { CSSProperties } from "react";
import { color, type as typeToken } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface ServiceOptionProps<TValue extends string = string> {
  value?: TValue;
  name: string;
  description: string;
  rate?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onSelect?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  style?: CSSProperties;
}

export function ServiceOption<TValue extends string = string>({
  value,
  name,
  description,
  rate,
  selected = false,
  disabled = false,
  onClick,
  onSelect,
  style,
}: ServiceOptionProps<TValue>) {
  const optionValue = (value ?? name) as TValue;
  const interactive = Boolean(onClick || onSelect) && !disabled;

  return (
    <button
      data-component="ServiceOption"
      data-part={selected ? "selected" : disabled ? "disabled" : undefined}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        onSelect?.(optionValue, {
          value: optionValue,
          label: name,
          previousValue: selected ? optionValue : null,
          action: selected ? "deselect" : "select",
          source: "pointer",
        });
      }}
      style={{
        width: "100%",
        padding: "16px 18px",
        marginBottom: 10,
        background: selected ? color.peachSoft : color.cream,
        border: "none",
        borderLeft: `3px solid ${selected ? color.plum : "transparent"}`,
        display: "flex",
        gap: 14,
        alignItems: "center",
        cursor: interactive ? "pointer" : disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.55 : 1,
        textAlign: "left",
        ...style,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ ...typeToken.h3, fontSize: 20 }}>{name}</div>
        <div style={{ ...typeToken.bodySm, color: color.softInk, marginTop: 2 }}>{description}</div>
      </div>
      {rate && (
        <div style={{ ...typeToken.meta, color: color.plum }}>{rate}</div>
      )}
    </button>
  );
}
