/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Trimmed generated imports while keeping comparison row/action contracts.
 */
import type { ReactNode } from "react";
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface ComparisonTableRow {
  /** Stable row id for the ComparisonTable row. */
  id?: string;
  /** Field label rendered in the first column. */
  field: string;
  /** Current/published value. */
  current?: string;
  /** Draft/proposed value. */
  draft?: string;
  /** Scheduled/future value. */
  scheduled?: string;
  /** Row-scoped actions. */
  actions?: ActionViewModel[];
}

/** Props for ComparisonTable. */
export interface ComparisonTableProps extends CommonWidgetProps {
  /** Stable table id used for action context. */
  tableId: string;
  /** Rows rendered by ComparisonTable. */
  rows: ComparisonTableRow[];
  /** Optional empty-state content. */
  empty?: ReactNode;
  /** Callback invoked by ComparisonTable with table id and row context. */
  onRowAction?: (action: ActionViewModel, context: { tableId: string; row: ComparisonTableRow }) => void;
}
