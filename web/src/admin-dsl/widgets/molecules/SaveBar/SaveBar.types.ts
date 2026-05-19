/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Trimmed generated imports and typed primary save action context.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface SaveBarProps extends CommonWidgetProps {
  status: string;
  primaryAction?: ActionViewModel;
  onPrimaryAction?: (action: ActionViewModel, context: { values: Record<string, unknown>; status: string }) => void;
}
