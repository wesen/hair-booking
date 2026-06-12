/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 122: Added by hand from 10a form-field IR as the textField leaf widget.
 */
import type { ChangeEventHandler } from "react";
import type { CommonWidgetProps } from "../../shared/types";

export interface TextFieldProps extends CommonWidgetProps {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  inputMode?: "text" | "search" | "email" | "tel" | "url" | "numeric" | "decimal";
  autoComplete?: string;
  onValueChange?: (value: string, event: Parameters<ChangeEventHandler<HTMLInputElement>>[0]) => void;
}
