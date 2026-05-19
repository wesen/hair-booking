/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Added explicit typed contract for promoted DurationField leaf.
 */
import type { ChangeEventHandler } from "react";
import type { CommonWidgetProps } from "../../shared/types";

export interface DurationFieldProps extends CommonWidgetProps {
  name: string;
  label: string;
  value?: string | number;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onValueChange?: (value: string, event: Parameters<ChangeEventHandler<HTMLInputElement>>[0]) => void;
}
