/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Trimmed generated imports and added optional card action context contract.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface ImageGridItem {
  id?: string;
  title: string;
  subtitle?: string;
  status?: string;
  tone?: string;
  url?: string;
}

export interface ImageGridProps extends CommonWidgetProps {
  items: ImageGridItem[];
  actions?: ActionViewModel[];
  onAction?: (action: ActionViewModel, context: { item: ImageGridItem }) => void;
}
