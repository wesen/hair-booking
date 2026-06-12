/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 123: Added by hand from 10a form-field IR as the textareaField leaf widget.
 */
import type { ChangeEventHandler } from "react";
import type { CommonWidgetProps } from "../../shared/types";

export interface TextareaFieldProps extends CommonWidgetProps {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onValueChange?: (value: string, event: Parameters<ChangeEventHandler<HTMLTextAreaElement>>[0]) => void;
}
