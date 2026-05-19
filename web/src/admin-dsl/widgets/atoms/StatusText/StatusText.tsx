/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Promoted scaffold to semantic status text using generated badge tone helpers.
 */
import { adminTextStyle, badgeToneStyle, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { statusTextWidgetMetadata } from "./StatusText.metadata";
import type { StatusTextProps } from "./StatusText.types";

export function StatusText({ id, className, style, dataAttributes, label, tone = "neutral", variant = "text" }: StatusTextProps) {
  const toneStyle = badgeToneStyle(tone);
  const pill = variant === "pill";
  return (
    <span
      id={id}
      className={["adminDslStatusText", className].filter(Boolean).join(" ") || undefined}
      style={{
        ...adminTextStyle("bodyMuted"),
        display: "inline-flex",
        alignItems: "center",
        minHeight: pill ? 24 : undefined,
        border: pill ? `1px solid ${toneStyle.borderColor}` : undefined,
        borderRadius: pill ? 999 : undefined,
        background: pill ? toneStyle.background : undefined,
        color: toneStyle.color,
        padding: pill ? "3px 8px" : undefined,
        fontWeight: 800,
        lineHeight: 1.2,
        ...style,
      }}
      {...widgetDataAttributes(statusTextWidgetMetadata.widgetId, statusTextWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      {label}
    </span>
  );
}
