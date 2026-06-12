/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Promoted scaffold to typed metric card using shared Admin DSL design helpers and tone styling.
 */
import { adminSurfaceStyle, adminTextStyle, adminTokens, badgeToneStyle, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { metricCardWidgetMetadata } from "./MetricCard.metadata";
import type { MetricCardProps } from "./MetricCard.types";

function accentForTone(tone: string) {
  return badgeToneStyle(tone).color || adminTokens.text.primary;
}

export function MetricCard({ id, className, style, dataAttributes, label, value, caption, tone = "neutral" }: MetricCardProps) {
  const accent = accentForTone(tone);
  return (
    <article
      id={id}
      className={["adminDslMetricCard", className].filter(Boolean).join(" ") || undefined}
      style={{ ...adminSurfaceStyle, padding: 18, borderTop: `4px solid ${accent}`, ...style }}
      {...widgetDataAttributes(metricCardWidgetMetadata.widgetId, metricCardWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      <div style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.muted }}>{label}</div>
      <div style={{ ...adminTextStyle("pageTitle"), marginTop: 10, color: accent }}>{value}</div>
      {caption ? <div style={{ ...adminTextStyle("bodyMuted"), marginTop: 8 }}>{caption}</div> : null}
    </article>
  );
}
