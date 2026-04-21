import type { CSSProperties, ReactNode } from 'react';
import { color, font } from '../../tokens';

interface MastheadProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  compact?: boolean;
  right?: string;
  style?: CSSProperties;
}

export function Masthead({
  eyebrow,
  title,
  accent,
  compact,
  right,
  style,
}: MastheadProps) {
  return (
    <div style={{
      background: color.peach,
      padding: compact ? '18px 20px 20px' : '24px 24px 26px',
      position: 'relative',
      ...style,
    }}>
      {eyebrow && (
        <div style={{
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          fontWeight: 600,
          color: color.plumDeep,
          marginBottom: 10,
        }}>
          {eyebrow}
        </div>
      )}
      <div style={{
        fontFamily: font.block,
        fontSize: compact ? 48 : 56,
        letterSpacing: -0.5,
        textTransform: 'uppercase',
        lineHeight: 0.9,
        color: color.plum,
      }}>
        {title}
        {accent && (
          <>
            <br />
            <span style={{ color: color.ink }}>{accent}</span>
          </>
        )}
      </div>
      {right && (
        <div style={{
          position: 'absolute',
          top: 14,
          right: 14,
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          fontWeight: 600,
          color: color.plum,
          border: `1px solid ${color.plum}`,
          padding: '2px 6px',
        }}>
          {right}
        </div>
      )}
    </div>
  );
}