import type { CSSProperties } from "react";
import { color, font } from "../../fringe-ui/tokens";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";
import { useControllableValue } from "../../fringe-ui/selection";
import { DayCell } from "./DayCell";

export interface DayPickerItem<TValue extends string = string> {
  value: TValue;
  day: string | number;
  disabled?: boolean;
  disabledReason?: string;
  dot?: boolean;
}

export interface DayPickerGridProps<TValue extends string = string> {
  days: DayPickerItem<TValue>[];
  value?: TValue | null;
  defaultValue?: TValue | null;
  onChange?: (value: TValue, meta: SelectionChangeMeta<TValue, DayPickerItem<TValue>>) => void;
  columns?: number;
  gap?: number;
  showWeekdays?: boolean;
  monthLabel?: string;
  style?: CSSProperties;
}

export function DayPickerGrid<TValue extends string = string>({
  days,
  value,
  defaultValue = null,
  onChange,
  columns = 7,
  gap = 4,
  showWeekdays = false,
  monthLabel,
  style,
}: DayPickerGridProps<TValue>) {
  const [selected, setSelected] = useControllableValue<TValue | null>({ value, defaultValue });

  return (
    <div data-component="DayPickerGrid" style={style}>
      {monthLabel && (
        <div style={{
          fontFamily: font.block,
          fontSize: 18,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: color.ink,
          marginBottom: 8,
        }}>
          {monthLabel}
        </div>
      )}
      {showWeekdays && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, marginBottom: 4 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} style={{
              fontFamily: font.mono,
              fontSize: 10,
              color: color.soft,
              textAlign: "center",
              padding: 4,
            }}>
              {d}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}>
        {days.map((day) => (
          <DayCell
            key={day.value}
            value={day.value}
            day={day.day}
            disabled={day.disabled}
            disabledReason={day.disabledReason}
            dot={day.dot}
            selected={selected === day.value}
            onSelect={(nextValue, meta) => {
              setSelected(nextValue);
              onChange?.(nextValue, { ...meta, item: day, previousValue: selected });
            }}
          />
        ))}
      </div>
    </div>
  );
}
