/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Trimmed generated type imports while keeping the MarkdownBlock contract.
 */
import type { CommonWidgetProps } from "../../shared/types";

/**
 * Props for MarkdownBlock. These are normalized widget props produced by adapters or callers, not raw Admin DSL JSON.
 */
export interface MarkdownBlockProps extends CommonWidgetProps {
  /** Markdown/plain text content rendered by MarkdownBlock. */
  markdown: string;
  /** Visual tone used for status, emphasis, or muted body copy. */
  tone?: "neutral" | "muted";
}
