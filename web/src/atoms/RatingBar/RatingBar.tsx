import type { CSSProperties } from "react";
import { color } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";

export interface RatingBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  interactive?: boolean;
  onChange?: (value: number, meta: SelectionChangeMeta<string>) => void;
  style?: CSSProperties;
}

export function RatingBar({
  value,
  max = 5,
  color: barColor,
  label,
  interactive = false,
  onChange,
  style,
}: RatingBarProps) {
  const fill = barColor ?? (
    value <= 2 ? color.peach
    : value <= 3 ? color.plum
    : color.ink
  );

  return (
    <div data-component="RatingBar" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", ...style }}>
      {label && (
        <div data-part="label" style={{
          fontFamily: '"Anton", Impact, sans-serif',
          fontSize: 14,
          color: color.ink,
          width: 100,
          letterSpacing: 0.5,
        }}>
          {label}
        </div>
      )}
      <div data-part="track" role={interactive ? "radiogroup" : undefined} aria-label={interactive ? label : undefined} style={{ display: "flex", gap: 3, flex: 1 }}>
        {Array.from({ length: max }).map((_, i) => {
          const nextValue = i + 1;
          const filled = i < value;
          if (!interactive) {
            return (
              <div
                data-part="segment"
                key={nextValue}
                style={{
                  flex: 1,
                  height: 8,
                  background: filled ? fill : color.rule,
                  borderRadius: 2,
                }}
              />
            );
          }

          return (
            <button
              data-part="segment"
              key={nextValue}
              type="button"
              role="radio"
              aria-label={`${nextValue}`}
              aria-checked={value === nextValue}
              onClick={() => onChange?.(nextValue, {
                value: String(nextValue),
                label: `${nextValue}/${max}`,
                previousValue: value,
                action: "select",
                source: "pointer",
              })}
              style={{
                flex: 1,
                height: 14,
                background: filled ? fill : color.rule,
                borderRadius: 2,
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          );
        })}
      </div>
      <div data-part="value" style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
        color: color.soft,
        width: 22,
        textAlign: "right",
      }}>
        {value}/{max}
      </div>
    </div>
  );
}
