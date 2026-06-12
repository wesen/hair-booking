import type { CSSProperties } from 'react';
import { color, font } from '../../fringe-ui/tokens';

interface WordmarkProps {
  size?: number;
  color?: string;
}

export function Wordmark({ size = 16, color: c = color.ink }: WordmarkProps) {
  return (
    <div data-component="Wordmark" style={{
      fontFamily: font.block,
      fontSize: size,
      color: c,
      letterSpacing: size * 0.25,
      textTransform: 'uppercase',
      userSelect: 'none',
    }}>
      Fringe
    </div>
  );
}