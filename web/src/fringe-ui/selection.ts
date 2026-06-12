import { useState } from "react";

export interface UseControllableValueOptions<TValue> {
  value?: TValue;
  defaultValue: TValue;
  onChange?: (value: TValue) => void;
}

export function useControllableValue<TValue>({ value, defaultValue, onChange }: UseControllableValueOptions<TValue>) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = controlled ? value : internalValue;

  function setValue(nextValue: TValue) {
    if (!controlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  }

  return [currentValue, setValue, controlled] as const;
}
