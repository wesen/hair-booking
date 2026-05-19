/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Promoted scaffold to plain-text markdown block using shared typography helpers.
 */
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { markdownBlockWidgetMetadata } from "./MarkdownBlock.metadata";
import type { MarkdownBlockProps } from "./MarkdownBlock.types";

export function MarkdownBlock({ id, className, style, dataAttributes, markdown, tone = "neutral" }: MarkdownBlockProps) {
  return (
    <p id={id} className={["adminDslMarkdownBlock", className].filter(Boolean).join(" ") || undefined} style={{ ...adminTextStyle("body"), color: tone === "muted" ? adminTokens.text.muted : adminTokens.text.primary, margin: 0, whiteSpace: "pre-wrap", ...style }} {...widgetDataAttributes(markdownBlockWidgetMetadata.widgetId, markdownBlockWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      {markdown}
    </p>
  );
}
