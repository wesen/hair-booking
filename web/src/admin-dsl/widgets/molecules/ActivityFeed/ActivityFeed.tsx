/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Promoted scaffold to typed activity list with row action callbacks.
 */
import { ActionButton } from "../../atoms/ActionButton";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { activityFeedWidgetMetadata } from "./ActivityFeed.metadata";
import type { ActivityFeedProps } from "./ActivityFeed.types";

export function ActivityFeed({ id, className, style, dataAttributes, items, onItemAction }: ActivityFeedProps) {
  return (
    <div id={id} className={["adminDslActivityFeed", className].filter(Boolean).join(" ") || undefined} style={{ display: "grid", gap: 10, ...style }} {...widgetDataAttributes(activityFeedWidgetMetadata.widgetId, activityFeedWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      {items.map((item, index) => (
        <div key={`${item.time}-${item.title}-${index}`} style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 12, alignItems: "start", paddingBottom: 10, borderBottom: `1px solid ${adminTokens.borders.soft}` }}>
          <div style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.muted }}>{item.time}</div>
          <div>
            <div style={{ ...adminTextStyle("body"), fontWeight: 800 }}>{item.title}</div>
            {item.body ? <div style={{ ...adminTextStyle("bodyMuted"), marginTop: 2 }}>{item.body}</div> : null}
          </div>
          {item.action ? <ActionButton action={item.action} size="sm" variant="subtle" onAction={(action) => onItemAction?.(action, { item })} /> : null}
        </div>
      ))}
    </div>
  );
}
