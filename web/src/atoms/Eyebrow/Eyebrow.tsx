import type { CSSProperties, ReactNode } from 'react';
import { color, font } from '../../fringe-ui/tokens';

interface EyebrowProps {
  children?: ReactNode;
  color?: string;
  style?: CSSProperties;
}

export function Eyebrow({ children, color: c = color.plum, style }: EyebrowProps) {
  return (
    <div data-component="Eyebrow" style={{
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