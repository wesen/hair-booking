import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { color, font } from "../../fringe-ui/tokens";
import { Chip, type ChipChangeMeta, type ChipShape } from "./Chip";

export type ChipGroupSelectionMode = "single" | "multiple";

export type ChipGroupOption<TValue extends string = string> = {
  value: TValue;
  label: ReactNode;
  disabled?: boolean;
};

export type ChipGroupChangeMeta<TValue extends string = string> = Omit<ChipChangeMeta<TValue>, "event"> & {
  option: ChipGroupOption<TValue>;
  previousValue: TValue[];
};

export interface ChipGroupProps<TValue extends string = string> {
  options: Array<ChipGroupOption<TValue> | TValue>;
  value?: TValue[];
  defaultValue?: TValue[];
  selectionMode?: ChipGroupSelectionMode;
  onChange?: (value: TValue[], meta: ChipGroupChangeMeta<TValue>) => void;
  label?: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
  shape?: ChipShape;
  gap?: number;
  style?: CSSProperties;
  chipStyle?: CSSProperties;
}

function normalizeOption<TValue extends string>(option: ChipGroupOption<TValue> | TValue): ChipGroupOption<TValue> {
  return typeof option === "string" ? { value: option as TValue, label: option } : option;
}

export function ChipGroup<TValue extends string = string>({
  options,
  value,
  defaultValue = [],
  selectionMode = "multiple",
  onChange,
  label,
  helperText,
  disabled = false,
  shape = "pill",
  gap = 6,
  style,
  chipStyle,
}: ChipGroupProps<TValue>) {
  const normalizedOptions = useMemo(() => options.map(normalizeOption), [options]);
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<TValue[]>(defaultValue);
  const selectedValues = controlled ? value : internalValue;
  const selectedSet = new Set(selectedValues);

  function setNextValue(nextValue: TValue[], meta: ChipGroupChangeMeta<TValue>) {
    if (!controlled) setInternalValue(nextValue);
    onChange?.(nextValue, meta);
  }

  function toggleOption(option: ChipGroupOption<TValue>, nextSelected: boolean, meta: ChipChangeMeta<TValue>) {
    const previousValue = selectedValues;
    let nextValue: TValue[];

    if (selectionMode === "single") {
      nextValue = nextSelected ? [option.value] : [];
    } else {
      nextValue = nextSelected
        ? Array.from(new Set([...selectedValues, option.value]))
        : selectedValues.filter((item) => item !== option.value);
    }

    setNextValue(nextValue, {
      value: option.value,
      label: option.label,
      option,
      previousValue,
      action: nextSelected ? "select" : "deselect",
      source: meta.source,
    });
  }

  return (
    <div data-component="ChipGroup" style={style}>
      {label ? (
        <div
          data-part="label"
          style={{
            fontFamily: font.block,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 8,
          }}
        >
          {label}
        </div>
      ) : null}
      <div role="group" aria-label={typeof label === "string" ? label : undefined} style={{ display: "flex", flexWrap: "wrap", gap }}>
        {normalizedOptions.map((option) => (
          <Chip
            key={option.value}
            value={option.value}
            selected={selectedSet.has(option.value)}
            disabled={disabled || option.disabled}
            shape={shape}
            style={chipStyle}
            onSelectedChange={(nextSelected, meta) => toggleOption(option, nextSelected, meta)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
      {helperText ? (
        <div data-part="helper" style={{ marginTop: 8, fontFamily: font.sans, fontSize: 12, color: color.soft }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
