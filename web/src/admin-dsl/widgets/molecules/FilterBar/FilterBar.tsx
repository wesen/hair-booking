/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to filter pill controls with adapter-owned action callbacks.
 * - 2026-05-19 / HAIR-041 Step 87: Replaced local pill CSS with generated selectionPillStyle helper.
 */
import { dataAttrsFromRecord, selectionPillStyle, widgetDataAttributes } from "../../shared";
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
        const pillStyle = selectionPillStyle({ active, disabled: !action });
        return action ? (
          <button key={filter.id} type="button" className="adminDslFilterPill" aria-pressed={active} onClick={() => onFilterChange?.(action, { filter })} style={pillStyle}>{filter.label}</button>
        ) : (
          <span key={filter.id} className="adminDslFilterPill" style={pillStyle}>{filter.label}</span>
        );
      })}
    </div>
  );
}
