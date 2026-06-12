/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 128: Added explicit image field and action callback contract.
 */
import type { CommonWidgetProps, ActionViewModel } from "../../shared/types";

export interface ImageFieldProps extends CommonWidgetProps {
  name: string;
  label: string;
  src?: string;
  alt?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  action?: ActionViewModel;
  onFieldAction?: (action: ActionViewModel, context: { name: string; src?: string }) => void;
}
