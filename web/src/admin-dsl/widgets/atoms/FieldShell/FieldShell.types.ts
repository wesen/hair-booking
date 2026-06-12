/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 121: Added by hand from 10a form-field IR as shared field chrome for concrete leaves.
 */
import type { ReactNode } from "react";
import type { CommonWidgetProps } from "../../shared/types";

export interface FieldShellProps extends CommonWidgetProps {
  /** Visible label for the field control. */
  label: string;
  /** Optional form field name used for id/association defaults. */
  name?: string;
  /** Explicit id of the underlying control, used by htmlFor and aria wiring. */
  controlId?: string;
  /** Helper copy associated with the field control. */
  helpText?: string;
  /** Validation error associated with the field control. */
  error?: string;
  /** Whether the wrapped field is disabled. */
  disabled?: boolean;
  /** Whether the wrapped field is read-only. */
  readOnly?: boolean;
  /** Whether the field is required. */
  required?: boolean;
  /** Concrete input/control supplied by a typed field leaf. */
  children: ReactNode;
}
