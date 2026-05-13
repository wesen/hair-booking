import type { CSSProperties } from "react";
import { color } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface PhotoTileProps<TValue extends string = string> {
  value?: TValue;
  label: string;
  filled?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onUpload?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  onRemove?: (value: TValue, meta: SelectionChangeMeta<TValue>) => void;
  style?: CSSProperties;
}

export function PhotoTile<TValue extends string = string>({ value, label, filled, disabled = false, onClick, onUpload, onRemove, style }: PhotoTileProps<TValue>) {
  const optionValue = (value ?? label) as TValue;
  const interactive = Boolean(onClick || onUpload || onRemove) && !disabled;

  return (
    <button
      data-component="PhotoTile"
      data-part={filled ? "filled" : disabled ? "disabled" : "empty"}
      type="button"
      disabled={disabled}
      aria-pressed={filled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        if (filled) {
          onRemove?.(optionValue, {
            value: optionValue,
            label,
            action: "remove",
            source: "pointer",
          });
        } else {
          onUpload?.(optionValue, {
            value: optionValue,
            label,
            action: "upload",
            source: "pointer",
          });
        }
      }}
      style={{
        aspectRatio: "1/1.2",
        background: filled ? color.peachSoft : color.cream,
        border: `1px dashed ${filled ? color.plum : color.soft}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: 1.8,
        textTransform: "uppercase" as const,
        fontWeight: 600,
        color: filled ? color.plum : disabled ? color.soft : color.soft,
        cursor: interactive ? "pointer" : disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.55 : 1,
        padding: 0,
        ...style,
      }}
    >
      {filled ? `✓ ${label}` : label}
    </button>
  );
}
