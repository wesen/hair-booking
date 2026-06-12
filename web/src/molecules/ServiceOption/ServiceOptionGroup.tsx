import type { CSSProperties } from "react";
import type { SelectionChangeMeta } from "../../fringe-ui/interactions";
import { useControllableValue } from "../../fringe-ui/selection";
import { ServiceOption } from "./ServiceOption";

export interface ServiceOptionItem<TValue extends string = string> {
  value: TValue;
  name: string;
  description: string;
  rate?: string;
  disabled?: boolean;
}

export interface ServiceOptionGroupProps<TValue extends string = string> {
  options: ServiceOptionItem<TValue>[];
  value?: TValue | null;
  defaultValue?: TValue | null;
  onChange?: (value: TValue, meta: SelectionChangeMeta<TValue, ServiceOptionItem<TValue>>) => void;
  style?: CSSProperties;
}

export function ServiceOptionGroup<TValue extends string = string>({
  options,
  value,
  defaultValue = null,
  onChange,
  style,
}: ServiceOptionGroupProps<TValue>) {
  const [selected, setSelected] = useControllableValue<TValue | null>({ value, defaultValue });

  return (
    <div data-component="ServiceOptionGroup" style={style}>
      {options.map((option) => (
        <ServiceOption
          key={option.value}
          value={option.value}
          name={option.name}
          description={option.description}
          rate={option.rate}
          disabled={option.disabled}
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
