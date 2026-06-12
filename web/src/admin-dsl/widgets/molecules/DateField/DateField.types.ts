/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Added explicit typed contract for promoted DateField leaf.
 */
import type { ChangeEventHandler } from "react";
import type { CommonWidgetProps } from "../../shared/types";

export interface DateFieldProps extends CommonWidgetProps {
  name: string;
  label: string;
  value?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  step?: number;
  onValueChange?: (value: string, event: Parameters<ChangeEventHandler<HTMLInputElement>>[0]) => void;
}
