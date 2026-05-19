/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Promoted scaffold to typed comparison table with row action callbacks and mobile-card markup hooks.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminSurfaceStyle, adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { comparisonTableWidgetMetadata } from "./ComparisonTable.metadata";
import type { ComparisonTableProps } from "./ComparisonTable.types";

export function ComparisonTable({ id, className, style, dataAttributes, tableId, rows, empty, onRowAction }: ComparisonTableProps) {
  if (!rows.length) {
    return <div id={id} className={className} style={{ ...adminSurfaceStyle, padding: 18, ...style }} {...widgetDataAttributes(comparisonTableWidgetMetadata.widgetId, comparisonTableWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>{empty ?? "No changes"}</div>;
  }

  return (
    <div id={id} className={["adminDslComparisonTable", className].filter(Boolean).join(" ") || undefined} style={{ overflowX: "auto", ...style }} {...widgetDataAttributes(comparisonTableWidgetMetadata.widgetId, comparisonTableWidgetMetadata.classification.level)} {...dataAttrsFromRecord(dataAttributes)}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
        <thead>
          <tr>
            {["Field", "Current", "Draft", "Scheduled", "Actions"].map((label) => <th key={label} style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.muted, textAlign: label === "Actions" ? "right" : "left", padding: "10px 14px", borderBottom: `1px solid ${adminTokens.borders.default}` }}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id || row.field || index)} style={{ borderBottom: index === rows.length - 1 ? "none" : `1px solid ${adminTokens.borders.soft}` }}>
              <td data-label="Field" style={{ ...adminTextStyle("bodyMuted"), fontWeight: 800, padding: "10px 14px" }}>{row.field}</td>
              <td data-label="Current" style={{ ...adminTextStyle("bodyMuted"), color: adminTokens.text.muted, padding: "10px 14px" }}>{row.current ?? "—"}</td>
              <td data-label="Draft" style={{ ...adminTextStyle("bodyMuted"), fontWeight: 800, padding: "10px 14px" }}>{row.draft ?? "—"}</td>
              <td data-label="Scheduled" style={{ ...adminTextStyle("bodyMuted"), color: adminTokens.text.muted, padding: "10px 14px" }}>{row.scheduled ?? "—"}</td>
              <td data-label="Actions" style={{ padding: "8px 14px", textAlign: "right" }}>{row.actions?.length ? <ActionGroup actions={row.actions} slot="row" align="end" context={{ tableId, row }} onAction={(action, context) => onRowAction?.(action, context)} /> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
