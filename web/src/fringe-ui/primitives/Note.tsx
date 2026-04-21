import type { CSSProperties } from 'react';
import { color } from '../../tokens';

interface NoteProps {
  tone?: 'info' | 'success' | 'warn' | 'danger';
  children?: string;
  style?: CSSProperties;
}

const palette = {
  info:    { bg: color.cream,     accent: color.plum },
  success: { bg: '#eaf0e3',        accent: color.sage },
  warn:    { bg: '#fbefcf',        accent: color.ochre },
  danger:  { bg: '#fce4dd',        accent: color.coral },
};

export function Note({ tone = 'info', children, style }: NoteProps) {
  const { bg, accent } = palette[tone];
  return (
    <div style={{
      background: bg,
      padding: '12px 14px',
      borderLeft: `3px solid ${accent}`,
      fontFamily: 'var(--fringe-font-sans, Inter, sans-serif)',
      fontSize: 14,
      lineHeight: 1.5,
      ...style,
    }}>
      {children}
    </div>
  );
}