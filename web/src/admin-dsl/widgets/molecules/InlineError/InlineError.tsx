/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Promoted scaffold to accessible inline error using shared Admin DSL design helpers.
 */
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { inlineErrorWidgetMetadata } from "./InlineError.metadata";
import type { InlineErrorProps } from "./InlineError.types";

export function InlineError({ id, className, style, dataAttributes, title, body }: InlineErrorProps) {
  return (
    <div
      id={id}
      className={["adminDslInlineError", className].filter(Boolean).join(" ") || undefined}
      role="alert"
      style={{ border: `1px solid ${adminTokens.text.danger}`, color: adminTokens.text.danger, padding: 12, borderRadius: adminTokens.radii.control, ...style }}
      {...widgetDataAttributes(inlineErrorWidgetMetadata.widgetId, inlineErrorWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      <strong style={{ ...adminTextStyle("body") }}>{title}</strong>
      {body ? <div style={{ ...adminTextStyle("bodyMuted"), color: adminTokens.text.danger, marginTop: 4 }}>{body}</div> : null}
    </div>
  );
}
