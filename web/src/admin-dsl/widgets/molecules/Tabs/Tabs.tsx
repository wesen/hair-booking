/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to semantic tablist controls with adapter-owned action callbacks.
 */
import { color, radius, type } from "../../../../fringe-ui/tokens";
import { dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { tabsWidgetMetadata } from "./Tabs.metadata";
import type { TabsProps } from "./Tabs.types";

export function Tabs({ id, className, style, dataAttributes, tabs, value, action, onTabChange }: TabsProps) {
  return (
    <div
      id={id}
      role="tablist"
      className={["adminDslTabs", className].filter(Boolean).join(" ") || undefined}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style }}
      {...widgetDataAttributes(tabsWidgetMetadata.widgetId, tabsWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        const sharedStyle = { minHeight: 38, display: "inline-flex", alignItems: "center", borderRadius: radius.pill, padding: "8px 12px", border: `1px solid ${active ? color.ink : color.rule}`, background: active ? color.ink : color.paper, color: active ? color.paper : color.ink, ...type.meta };
        return action ? (
          <button key={tab.id} type="button" role="tab" aria-selected={active} className="adminDslFilterPill" onClick={() => onTabChange?.(action, { tab })} style={{ ...sharedStyle, cursor: "pointer" }}>{tab.label}</button>
        ) : (
          <span key={tab.id} role="tab" aria-selected={active} className="adminDslFilterPill" style={sharedStyle}>{tab.label}</span>
        );
      })}
    </div>
  );
}
