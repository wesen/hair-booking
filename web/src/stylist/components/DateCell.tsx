interface DateCellProps {
  dayLabel: string;
  dayNum: number;
  selected?: boolean;
  onClick?: () => void;
}

export function DateCell({ dayLabel, dayNum, selected, onClick }: DateCellProps) {
  return (
    <div
      data-part="date-cell"
      data-selected={selected || undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <span data-part="day-label">{dayLabel}</span>
      <span data-part="day-num">{dayNum}</span>
    </div>
  );
}
