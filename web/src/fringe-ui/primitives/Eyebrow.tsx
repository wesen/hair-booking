import type { CSSProperties } from 'react';
import { color, font } from '../../tokens';

interface EyebrowProps {
  children?: string;
  color?: string;
  style?: CSSProperties;
}

export function Eyebrow({ children, color: c = color.plum, style }: EyebrowProps) {
  return (
    <div style={{
      fontFamily: font.mono,
      fontSize: 10,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      fontWeight: 600,
      color: c,
      ...style,
    }}>
      {children}
    </div>
  );
}