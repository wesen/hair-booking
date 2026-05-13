import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { color, font, radius } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export type ChipShape = "pill" | "square";

export type ChipChangeMeta<TValue extends string = string> = SelectionChangeMeta<TValue> & {
  event?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>;
};

export interface ChipProps<TValue extends string = string>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "value" | "children"> {
  value?: TValue;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onSelectedChange?: (selected: boolean, meta: ChipChangeMeta<TValue>) => void;
  children?: ReactNode;
  shape?: ChipShape;
  style?: CSSProperties;
}

export function Chip<TValue extends string = string>({
  value,
  selected = false,
  disabled = false,
  onClick,
  onSelectedChange,
  children,
  shape = "pill",
  style,
  type = "button",
  ...buttonProps
}: ChipProps<TValue>) {
  const interactive = Boolean(onClick || onSelectedChange) && !disabled;

  function emitToggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const nextSelected = !selected;
    onClick?.();
    onSelectedChange?.(nextSelected, {
      value,
      label: children,
      action: nextSelected ? "select" : "deselect",
      source: "pointer",
      event,
    });
  }

  return (
    <button
      data-component="Chip"
      type={type}
      value={value}
      aria-pressed={selected}
      disabled={disabled}
      onClick={emitToggle}
      {...buttonProps}
      style={{
        fontFamily: font.block,
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 1,
        padding: "6px 12px 4px",
        cursor: interactive ? "pointer" : disabled ? "not-allowed" : "default",
        border: `1px solid ${selected ? color.plum : color.rule}`,
        background: selected ? color.plum : "transparent",
        color: selected ? color.paper : disabled ? color.soft : color.ink,
        borderRadius: shape === "pill" ? radius.pill : radius.sm,
        display: "inline-block",
        userSelect: "none",
        appearance: "none",
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
