import type { CSSProperties } from 'react';
import { color, font } from '../../tokens';

interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  style?: CSSProperties;
}

export function Progress({ value, max = 100, color: barColor = color.plum, style }: ProgressProps) {
  return (
    <div style={{ height: 3, background: color.rule, width: '100%', ...style }}>
      <div style={{ height: 3, background: barColor, width: `${(value / max) * 100}%` }} />
    </div>
  );
}