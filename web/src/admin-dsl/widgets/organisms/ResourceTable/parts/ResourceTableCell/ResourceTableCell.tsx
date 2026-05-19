/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 80: Promoted scaffold to typed cell renderer for text, badge, boolean, actions, overflow, and drag handles.
 * - 2026-05-19 / HAIR-041 Step 88: Replaced local status tones and raw tokens with shared design helpers.
 */
import { ActionGroup } from "../../../../molecules/ActionGroup";
import { adminTextStyle, adminTokens, badgeToneStyle } from "../../../../shared";
import type { ActionViewModel } from "../../../../shared";
import type { ResourceTableCellProps } from "./ResourceTableCell.types";

function rowValue<Row>(row: Row, key: string): unknown {
  return row && typeof row === "object" ? (row as Record<string, unknown>)[key] : undefined;
}

function rowActions(row: unknown): ActionViewModel[] {
  const actions = row && typeof row === "object" ? (row as Record<string, unknown>).actions : undefined;
  return Array.isArray(actions) ? actions as ActionViewModel[] : [];
}

export function ResourceTableCell<Row = Record<string, unknown>>({ column, row, tableId, onRowAction }: ResourceTableCellProps<Row>) {
  const id = String(column.id || column.accessor || "");
  const accessor = String(column.accessor || id);
  const value = rowValue(row, accessor);
  const kind = String(column.kind || "text");

  if (kind === "dragHandle") return <span aria-hidden="true" style={{ ...adminTextStyle("eyebrow"), color: adminTokens.text.muted }}>⋮⋮</span>;

  if (kind === "badge" || kind === "status") {
    const mapped = column.map?.[String(value ?? "")];
    const label = String(mapped?.label || value || "—");
    const tone = String(mapped?.tone || column.tone || "neutral");
    const badgeColors = badgeToneStyle(tone);
    return <span className="adminDslStatusText" style={{ display: "inline-flex", alignItems: "center", minHeight: 24, color: badgeColors.color, fontWeight: 700, ...adminTextStyle("bodyMuted") }}>{label}</span>;
  }

  if (kind === "overflowActions" || kind === "actions") {
    const actions = rowActions(row);
    if (!actions.length) return null;
    if (kind === "overflowActions") {
      return (
        <button type="button" className="adminDslOverflowAction" aria-label="Open row actions" onClick={() => onRowAction?.(actions[0], { tableId, row, rowId: String(rowValue(row, "id") || "") })} style={{ minWidth: 32, minHeight: 32, border: "1px solid transparent", borderRadius: adminTokens.radii.control, background: "transparent", cursor: "pointer", fontSize: 18, lineHeight: 1, color: adminTokens.text.primary }}>…</button>
      );
    }
    return <ActionGroup actions={actions} slot="row" context={{ tableId, row, rowId: String(rowValue(row, "id") || "") }} onAction={(action, context) => onRowAction?.(action, context)} />;
  }

  if (kind === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (kind === "number") return <>{typeof value === "number" ? value.toLocaleString() : String(value ?? "")}</>;
  return <span style={{ fontWeight: column.primary ? 800 : 400, color: column.tone === "muted" ? adminTokens.text.muted : adminTokens.text.primary }}>{String(value ?? "")}</span>;
}
