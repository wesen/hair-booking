import type { CSSProperties, ReactNode } from 'react';
import { color } from '../../fringe-ui/tokens';

interface CardProps {
  accent?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Card({ accent, children, style }: CardProps) {
  return (
    <div data-component="Card" style={{
      background: color.cream,
      padding: '16px 18px',
      borderLeft: accent ? `3px solid ${accent}` : 'none',
      ...style,
    }}>
      {children}
    </div>
  );
}