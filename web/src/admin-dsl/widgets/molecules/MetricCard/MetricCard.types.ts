/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Added explicit `tone` contract and trimmed generated type imports.
 */
import type { CommonWidgetProps } from "../../shared/types";

/**
 * Props for MetricCard. These are normalized widget props produced by adapters or callers, not raw Admin DSL JSON.
 */
export interface MetricCardProps extends CommonWidgetProps {
  /**
   * Human-readable label rendered by MetricCard.
   */
  label: string;
  /**
   * Current value or active selection rendered by MetricCard.
   */
  value: string | number;
  /**
   * Optional explanatory text rendered under the metric value.
   */
  caption?: string;
  /**
   * Semantic tone used for the metric accent and value emphasis.
   */
  tone?: "neutral" | "success" | "warning" | "danger" | string;
}
