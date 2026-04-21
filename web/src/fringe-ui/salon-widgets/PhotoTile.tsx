import type { CSSProperties } from 'react';
import { color } from '../../tokens';

interface PhotoTileProps {
  label: string;
  filled?: boolean;
  style?: CSSProperties;
}

export function PhotoTile({ label, filled, style }: PhotoTileProps) {
  return (
    <div style={{
      aspectRatio: '1/1.2',
      background: filled ? color.peachSoft : color.cream,
      border: `1px dashed ${filled ? color.plum : color.soft}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 10,
      letterSpacing: 1.8,
      textTransform: 'uppercase' as const,
      fontWeight: 600,
      color: filled ? color.plum : color.soft,
      ...style,
    }}>
      {filled ? `✓ ${label}` : label}
    </div>
  );
}