import type { CSSProperties, ReactNode } from 'react';
import { color } from '../../fringe-ui/tokens';

interface SectionProps {
  n?: number | string;
  title?: string;
  children?: ReactNode;
  accent?: string;
  topBorder?: boolean;
  style?: CSSProperties;
}

export function Section({ n, title, children, accent = color.plum, topBorder = true, style }: SectionProps) {
  return (
    <div style={{
      padding: '18px 0',
      borderTop: topBorder ? `1px solid ${color.rule}` : 'none',
      display: 'flex',
      gap: 14,
      ...style,
    }}>
      <div style={{ width: 32 }}>
        {n != null && (
          <div style={{
            fontFamily: '"Anton", Impact, sans-serif',
            fontSize: 13,
            letterSpacing: 1.5,
            padding: '3px 7px 2px',
            background: accent,
            color: color.paper,
            display: 'inline-block',
          }}>
            {n}
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            fontWeight: 600,
            color: color.plum,
            marginBottom: 10,
          }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}