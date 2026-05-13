import type { CSSProperties } from 'react';
import { color, font, type as typeToken } from '../../fringe-ui/tokens';

interface TimeSlotProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function TimeSlot({
  label,
  selected = false,
  disabled = false,
  onClick,
  style,
}: TimeSlotProps) {
  return (
    <div
      data-component="TimeSlot"
      data-part={selected ? 'selected' : disabled ? 'disabled' : undefined}
      onClick={disabled ? undefined : onClick}
      style={{
        padding: '10px 6px',
        textAlign: 'center',
        background: selected ? color.plum : color.cream,
        color: selected ? color.paper : disabled ? color.soft : color.ink,
        fontFamily: font.mono,
        fontSize: 12,
        letterSpacing: 1,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        border: `1px solid ${selected ? color.plum : color.rule}`,
        borderRadius: 2,
        ...style,
      }}
    >
      {label}
    </div>
  );
}
