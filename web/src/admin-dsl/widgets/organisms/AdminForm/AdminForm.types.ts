/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Trimmed generated imports and typed form action context values.
 */
import type { ReactNode } from "react";
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface AdminFormProps<Values = Record<string, unknown>> extends CommonWidgetProps {
  formId: string;
  title?: string;
  dirty?: boolean;
  pending?: boolean;
  state?: "idle" | "dirty" | "pending" | "success" | "error";
  errors?: Record<string, string>;
  actions?: ActionViewModel[];
  children: ReactNode;
  onFormAction?: (action: ActionViewModel, context: { formId: string; values: Values; state: AdminFormProps["state"] }) => void;
}
