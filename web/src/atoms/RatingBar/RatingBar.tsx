import type { CSSProperties } from 'react';
import { color } from '../../fringe-ui/tokens';

interface RatingBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  style?: CSSProperties;
}

export function RatingBar({
  value,
  max = 5,
  color: barColor,
  label,
  style,
}: RatingBarProps) {
  const fill = barColor ?? (
    value <= 2 ? color.peach
    : value <= 3 ? color.plum
    : color.ink
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', ...style }}>
      {label && (
        <div style={{
          fontFamily: '"Anton", Impact, sans-serif',
          fontSize: 14,
          color: color.ink,
          width: 100,
          letterSpacing: 0.5,
        }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 8,
              background: i < value ? fill : color.rule,
              borderRadius: 2,
            }}
          />
        ))}
      </div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
        color: color.soft,
        width: 22,
        textAlign: 'right',
      }}>
        {value}/{max}
      </div>
    </div>
  );
}