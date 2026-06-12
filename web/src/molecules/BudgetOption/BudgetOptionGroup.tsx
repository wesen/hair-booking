import type { CSSProperties } from "react";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";
import { useControllableValue } from "../../fringe-ui/selection";
import { BudgetOption } from "./BudgetOption";

export interface BudgetOptionItem<TValue extends string = string> {
  value: TValue;
  label: string;
  description: string;
  disabled?: boolean;
}

export interface BudgetOptionGroupProps<TValue extends string = string> {
  options: BudgetOptionItem<TValue>[];
  value?: TValue | null;
  defaultValue?: TValue | null;
  onChange?: (value: TValue, meta: SelectionChangeMeta<TValue, BudgetOptionItem<TValue>>) => void;
  columns?: number;
  gap?: number;
  style?: CSSProperties;
}

export function BudgetOptionGroup<TValue extends string = string>({
  options,
  value,
  defaultValue = null,
  onChange,
  columns = 1,
  gap = 8,
  style,
}: BudgetOptionGroupProps<TValue>) {
  const [selected, setSelected] = useControllableValue<TValue | null>({ value, defaultValue });

  return (
    <div
      data-component="BudgetOptionGroup"
      style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, ...style }}
    >
      {options.map((option) => (
        <BudgetOption
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          selected={selected === option.value}
          onSelect={(nextValue, meta) => {
            setSelected(nextValue);
            onChange?.(nextValue, { ...meta, item: option, previousValue: selected });
          }}
          style={{ marginBottom: 0 }}
        />
      ))}
    </div>
  );
}
