/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Trimmed generated type imports while keeping the StatusText contract.
 */
import type { CommonWidgetProps } from "../../shared/types";

/**
 * Props for StatusText. These are normalized widget props produced by adapters or callers, not raw Admin DSL JSON.
 */
export interface StatusTextProps extends CommonWidgetProps {
  /** Human-readable label rendered by StatusText. */
  label: string;
  /** Visual tone used for status, emphasis, or border treatment in StatusText. */
  tone?: "neutral" | "success" | "warning" | "danger";
  /** Visual variant for StatusText; this should select a design-system treatment without changing action semantics. */
  variant?: "text" | "pill";
}
