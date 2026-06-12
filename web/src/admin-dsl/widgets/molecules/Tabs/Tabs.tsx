/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to semantic tablist controls with adapter-owned action callbacks.
 * - 2026-05-19 / HAIR-041 Step 87: Replaced local pill CSS with generated selectionPillStyle helper.
 */
import { dataAttrsFromRecord, selectionPillStyle, widgetDataAttributes } from "../../shared";
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
        const pillStyle = selectionPillStyle({ active, disabled: !action });
        return action ? (
          <button key={tab.id} type="button" role="tab" aria-selected={active} className="adminDslFilterPill" onClick={() => onTabChange?.(action, { tab })} style={pillStyle}>{tab.label}</button>
        ) : (
          <span key={tab.id} role="tab" aria-selected={active} className="adminDslFilterPill" style={pillStyle}>{tab.label}</span>
        );
      })}
    </div>
  );
}
