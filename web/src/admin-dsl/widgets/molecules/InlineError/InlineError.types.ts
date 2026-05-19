/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Trimmed generated type imports while keeping the scaffold-derived contract.
 */
import type { CommonWidgetProps } from "../../shared/types";

/**
 * Props for InlineError. These are normalized widget props produced by adapters or callers, not raw Admin DSL JSON.
 */
export interface InlineErrorProps extends CommonWidgetProps {
  /**
   * Primary heading or title rendered by InlineError.
   */
  title: string;
  /**
   * Optional body copy rendered by InlineError.
   */
  body?: string;
}
