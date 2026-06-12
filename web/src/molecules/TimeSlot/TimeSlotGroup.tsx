import type { CSSProperties } from "react";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";
import { useControllableValue } from "../../fringe-ui/selection";
import { TimeSlot } from "./TimeSlot";

export interface TimeSlotItem<TValue extends string = string> {
  value: TValue;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface TimeSlotGroupProps<TValue extends string = string> {
  options: TimeSlotItem<TValue>[];
  value?: TValue | null;
  defaultValue?: TValue | null;
  onChange?: (value: TValue, meta: SelectionChangeMeta<TValue, TimeSlotItem<TValue>>) => void;
  columns?: number;
  gap?: number;
  style?: CSSProperties;
}

export function TimeSlotGroup<TValue extends string = string>({
  options,
  value,
  defaultValue = null,
  onChange,
  columns = 4,
  gap = 6,
  style,
}: TimeSlotGroupProps<TValue>) {
  const [selected, setSelected] = useControllableValue<TValue | null>({ value, defaultValue });

  return (
    <div
      data-component="TimeSlotGroup"
      style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, ...style }}
    >
      {options.map((option) => (
        <TimeSlot
          key={option.value}
          value={option.value}
          label={option.label}
          disabled={option.disabled}
          disabledReason={option.disabledReason}
          selected={selected === option.value}
          onSelect={(nextValue, meta) => {
            setSelected(nextValue);
            onChange?.(nextValue, { ...meta, item: option, previousValue: selected });
          }}
        />
      ))}
    </div>
  );
}
