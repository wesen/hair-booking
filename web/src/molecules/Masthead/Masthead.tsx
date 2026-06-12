import type { CSSProperties, ReactNode } from 'react';
import { color, font } from '../../fringe-ui/tokens';

interface MastheadProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  compact?: boolean;
  display?: boolean;
  right?: string;
  style?: CSSProperties;
}

export function Masthead({
  eyebrow,
  title,
  accent,
  compact,
  display,
  right,
  style,
}: MastheadProps) {
  return (
    <div data-component="Masthead" style={{
      background: color.peach,
      padding: display ? '56px 56px 48px' : compact ? '20px 22px 22px' : '24px 24px 26px',
      position: 'relative',
      ...style,
    }}>
      {eyebrow && (
        <div data-component="Masthead" style={{
          fontFamily: font.mono,
          fontSize: display ? 12 : 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          fontWeight: 600,
          color: color.plumDeep,
          marginBottom: display ? 14 : 10,
        }}>
          {eyebrow}
        </div>
      )}
      <div data-component="Masthead" style={{
        fontFamily: font.block,
        fontSize: display ? 180 : compact ? 48 : 56,
        letterSpacing: display ? -6 : -0.5,
        textTransform: 'uppercase',
        lineHeight: display ? 0.82 : 0.9,
        color: color.plum,
      }}>
        {title}
        {accent && (
          <>
            <br />
            <span data-component="Masthead" style={{ color: color.ink }}>{accent}</span>
          </>
        )}
      </div>
      {right && (
        <div data-component="Masthead" style={{
          position: 'absolute',
          top: display ? 24 : 14,
          right: display ? 24 : 14,
          fontFamily: font.mono,
          fontSize: display ? 11 : 10,
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