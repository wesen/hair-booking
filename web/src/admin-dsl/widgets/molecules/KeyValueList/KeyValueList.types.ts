/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Trimmed generated type imports while keeping the KeyValueList contract.
 */
import type { ReactNode } from "react";
import type { CommonWidgetProps } from "../../shared/types";

/**
 * Props for KeyValueList. These are normalized widget props produced by adapters or callers, not raw Admin DSL JSON.
 */
export interface KeyValueListProps extends CommonWidgetProps {
  /** Items rendered by KeyValueList. */
  items: Array<{ label: string; value: string | number | ReactNode }>;
  /** Label column width. */
  labelWidth?: number | string;
}
