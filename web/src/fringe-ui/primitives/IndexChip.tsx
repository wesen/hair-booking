import type { CSSProperties } from 'react';
import { color } from '../../tokens';

interface IndexChipProps {
  n: number | string;
  bg?: string;
  color?: string;
  style?: CSSProperties;
}

export function IndexChip({ n, bg = color.plum, color: c = color.paper, style }: IndexChipProps) {
  return (
    <div style={{
      fontFamily: '"Anton", Impact, sans-serif',
      fontSize: 13,
      letterSpacing: 1.5,
      padding: '3px 7px 2px',
      background: bg,
      color: c,
      display: 'inline-block',
      ...style,
    }}>
      {n}
    </div>
  );
}