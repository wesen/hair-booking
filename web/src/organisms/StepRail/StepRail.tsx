import type { CSSProperties } from 'react';
import { color } from '../../fringe-ui/tokens';

interface StepRailProps {
  current: number; // 0-indexed step
  accent?: string;
  style?: CSSProperties;
}

const STEPS = [
  '01 Service', '02 Color', '03 Length', '04 Photos',
  '05 History', '06 Budget', '07 Estimate', '08 Booking', '09 Confirm',
];

// Desktop sidebar step rail — shows intake progress on the left side
// of desktop intake screens (Estimate, Booking, Confirm)

export function StepRail({ current, accent = color.butter, style }: StepRailProps) {
  return (
    <div style={{
      width: 220,
      padding: '32px 28px',
      borderRight: `1px solid ${color.rule}`,
      background: color.cream,
      flexShrink: 0,
      ...style,
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        fontWeight: 600,
        color: color.plum,
        marginBottom: 20,
      }}>
        Intake · 9 steps
      </div>

      {STEPS.map((label, i) => {
        const done    = i < current;
        const active  = i === current;

        return (
          <div key={label} style={{
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderTop: i === 0 ? 'none' : `1px solid ${color.rule}`,
            color: active ? color.ink : done ? color.softInk : color.soft,
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: active ? accent : done ? color.plum : 'transparent',
              border: !active && !done ? `1px solid ${color.soft}` : 'none',
            }} />
            <div style={{
              fontFamily: '"Anton", Impact, sans-serif',
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}