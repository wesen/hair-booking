/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Promoted scaffold to typed definition-list widget using shared typography and borders.
 */
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { keyValueListWidgetMetadata } from "./KeyValueList.metadata";
import type { KeyValueListProps } from "./KeyValueList.types";

function widthValue(width: number | string) {
  return typeof width === "number" ? `${width}px` : width;
}

export function KeyValueList({ id, className, style, dataAttributes, items, labelWidth = 120 }: KeyValueListProps) {
  return (
    <dl id={id} className={["adminDslKeyValueList", className].filter(Boolean).join(" ") || undefined} style={{ display: "grid", gap: 10, margin: 0, ...style }} {...widgetDataAttributes(keyValueListWidgetMetadata.widgetId, keyValueListWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ display: "grid", gridTemplateColumns: `${widthValue(labelWidth)} 1fr`, gap: 12, borderBottom: `1px solid ${adminTokens.borders.soft}`, paddingBottom: 8 }}>
          <dt style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.muted }}>{item.label}</dt>
          <dd style={{ ...adminTextStyle("body"), margin: 0 }}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
