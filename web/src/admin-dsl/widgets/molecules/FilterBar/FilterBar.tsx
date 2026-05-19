/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to filter pill controls with adapter-owned action callbacks.
 */
import { color, radius, type } from "../../../../fringe-ui/tokens";
import { dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { filterBarWidgetMetadata } from "./FilterBar.metadata";
import type { FilterBarProps } from "./FilterBar.types";

export function FilterBar({ id, className, style, dataAttributes, filters, value, action, onFilterChange }: FilterBarProps) {
  return (
    <div
      id={id}
      className={["adminDslFilterBar", className].filter(Boolean).join(" ") || undefined}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style }}
      {...widgetDataAttributes(filterBarWidgetMetadata.widgetId, filterBarWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      {filters.map((filter) => {
        const active = filter.id === value;
        const sharedStyle = { minHeight: 38, display: "inline-flex", alignItems: "center", borderRadius: radius.pill, padding: "8px 12px", border: `1px solid ${active ? color.ink : color.rule}`, background: active ? color.ink : color.paper, color: active ? color.paper : color.ink, ...type.meta };
        return action ? (
          <button key={filter.id} type="button" className="adminDslFilterPill" aria-pressed={active} onClick={() => onFilterChange?.(action, { filter })} style={{ ...sharedStyle, cursor: "pointer" }}>{filter.label}</button>
        ) : (
          <span key={filter.id} className="adminDslFilterPill" style={sharedStyle}>{filter.label}</span>
        );
      })}
    </div>
  );
}
