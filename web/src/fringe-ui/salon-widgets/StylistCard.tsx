import type { CSSProperties } from 'react';
import { color, font } from '../../tokens';

interface StylistCardProps {
  name: string;
  role: string;
  rate?: string;
  available?: string;
  style?: CSSProperties;
}

export function StylistCard({ name, role, rate, available, style }: StylistCardProps) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div style={{
      background: color.paper,
      border: `1px solid ${color.rule}`,
      padding: 16,
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      ...style,
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 999,
        background: color.peachSoft,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: font.block,
        fontSize: 22,
        color: color.plum,
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: font.block,
          fontSize: 18,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          color: color.ink,
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: font.sans,
          fontSize: 12,
          color: color.soft,
          marginTop: 2,
        }}>
          {role}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {rate && (
          <div style={{
            fontFamily: font.mono,
            fontSize: 11,
            color: color.plum,
          }}>
            {rate}
          </div>
        )}
        {available && (
          <div style={{
            fontFamily: font.serif,
            fontStyle: 'italic',
            fontSize: 13,
            color: color.sage,
            marginTop: 2,
          }}>
            {available}
          </div>
        )}
      </div>
    </div>
  );
}