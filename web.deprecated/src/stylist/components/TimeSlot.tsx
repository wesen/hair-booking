interface TimeSlotProps {
  time: string;
  selected?: boolean;
  onClick?: () => void;
}

export function TimeSlot({ time, selected, onClick }: TimeSlotProps) {
  return (
    <div
      data-part="time-slot"
      data-selected={selected || undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {time}
    </div>
  );
}
