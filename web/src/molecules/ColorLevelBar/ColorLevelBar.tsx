import type { CSSProperties } from 'react';
import { color, type as typeToken } from '../../fringe-ui/tokens';

interface ColorLevelBarProps {
  current: number;
  target?: number;
  style?: CSSProperties;
}

const LEVEL_COLORS = [
  '#1a120c', '#2a1c10', '#3d2a1e', '#5a3e2a',
  '#7a5638', '#9b7547', '#b89461', '#d1b283',
  '#e2ce9e', '#ead9af',
];

export function ColorLevelBar({ current, target, style }: ColorLevelBarProps) {
  return (
    <div data-component="ColorLevelBar" style={{ ...style }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 4,
        height: 140,
        marginBottom: 8,
      }}>
        {LEVEL_COLORS.map((tone, i) => {
          const level = i + 1;
          const sel = level === current;
          const isTarget = target != null && level === target;
          return (
            <div key={level} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{
                flex: 1,
                width: '100%',
                background: tone,
                border: sel
                  ? `2px solid ${color.plum}`
                  : isTarget
                    ? `2px dashed ${color.peach}`
                    : 'none',
                marginBottom: 4,
              }} />
              <div style={{
                ...typeToken.meta,
                color: sel ? color.plum : isTarget ? color.peach : color.soft,
                fontSize: 10,
              }}>
                {level}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
