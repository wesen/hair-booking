/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 80: Promoted scaffold to bulk toolbar using ActionGroup and selected/visible row context.
 */
import { color, type } from "../../../../../../fringe-ui/tokens";
import { ActionGroup } from "../../../../molecules/ActionGroup";
import type { BulkActionBarProps } from "./BulkActionBar.types";

export function BulkActionBar<Row = Record<string, unknown>>({ tableId, label = "Bulk actions", rows, selectedRowIds, actions, onBulkAction }: BulkActionBarProps<Row>) {
  const selectedRows = rows.filter((row) => row && typeof row === "object" && selectedRowIds.includes(String((row as Record<string, unknown>).id || "")));
  const scope: "visible" | "selected" = selectedRowIds.length ? "selected" : "visible";
  const scopedRows = selectedRowIds.length ? selectedRows : rows;
  return (
    <div className="adminDslBulkActionBar" style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: 12, borderBottom: `1px solid ${color.rule}`, background: color.cream }}>
      <span style={{ ...type.meta, color: color.softInk }}>{selectedRowIds.length ? `${selectedRowIds.length} selected` : label}</span>
      <ActionGroup actions={actions} slot="bulkToolbar" context={{ tableId, scope, rows: scopedRows, selectedRowIds }} onAction={(action, context) => onBulkAction?.(action, context)} />
    </div>
  );
}
