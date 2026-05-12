interface CalendarGridProps {
  availability: Record<string, string[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
}

export function CalendarGrid({ availability, selectedDate, onSelectDate, month, year, onMonthChange }: CalendarGridProps) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <>
      <div data-part="cal-header">
        <button
          data-part="cal-nav"
          onClick={() => { if (month > 2) onMonthChange(month - 1); }}
        >
          ←
        </button>
        <span>{monthNames[month]} {year}</span>
        <button
          data-part="cal-nav"
          onClick={() => { if (month < 5) onMonthChange(month + 1); }}
        >
          →
        </button>
      </div>

      <div data-part="cal-grid">
        {dayHeaders.map(d => (
          <div key={d} data-part="cal-day-header">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const avail = !!availability[dateStr];
          const selected = selectedDate === dateStr;
          const isToday = month === 2 && d === 19;
          return (
            <div
              key={dateStr}
              data-part="cal-day"
              data-available={avail || undefined}
              data-selected={selected || undefined}
              data-today={isToday || undefined}
              onClick={() => avail && onSelectDate(dateStr)}
            >
              {d}
            </div>
          );
        })}
      </div>
    </>
  );
}
