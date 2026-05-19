/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Trimmed generated imports and typed EmptyState action context.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

/**
 * Props for EmptyState. These are normalized widget props produced by adapters or callers, not raw Admin DSL JSON.
 */
export interface EmptyStateProps extends CommonWidgetProps {
  /** Primary heading or title rendered by EmptyState. */
  title: string;
  /** Optional body copy rendered by EmptyState. */
  body?: string;
  /** Action metadata rendered or invoked by EmptyState. */
  action?: ActionViewModel;
  /** Callback invoked by EmptyState with action metadata and typed context. */
  onAction?: (action: ActionViewModel, context: { source: "emptyState"; title: string }) => void;
}
