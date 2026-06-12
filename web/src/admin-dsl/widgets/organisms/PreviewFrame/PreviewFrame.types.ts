/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Trimmed generated imports and typed PreviewFrame action context.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface PreviewFrameProps extends CommonWidgetProps {
  previewId: string;
  kicker?: string;
  title: string;
  body?: string;
  url?: string;
  height?: number;
  placeholder?: string;
  actions?: ActionViewModel[];
  onAction?: (action: ActionViewModel, context: { previewId: string; url?: string }) => void;
}
