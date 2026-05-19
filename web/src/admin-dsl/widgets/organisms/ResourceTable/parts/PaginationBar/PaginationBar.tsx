/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 80: Promoted scaffold to pagination footer with ActionGroup delegation.
 */
import { color, type } from "../../../../../../fringe-ui/tokens";
import { ActionGroup } from "../../../../molecules/ActionGroup";
import type { PaginationBarProps } from "./PaginationBar.types";

export function PaginationBar({ page, total, actions = [], onAction }: PaginationBarProps) {
  return (
    <div className="adminDslPagination" style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: 12, borderTop: `1px solid ${color.rule}`, background: color.paper }}>
      <span style={{ ...type.meta, color: color.softInk }}>Page {page || 1} · {total} total</span>
      <ActionGroup actions={actions} slot="footer" align="end" context={{ page, total }} onAction={onAction} />
    </div>
  );
}
