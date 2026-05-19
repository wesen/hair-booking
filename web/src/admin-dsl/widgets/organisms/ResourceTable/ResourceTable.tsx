/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 80: Promoted scaffold to composed ResourceTable using cell, bulk, and pagination parts.
 * - 2026-05-18 / HAIR-041 Step 80: Preserved adapter-owned data/action callbacks while moving table visuals out of render.tsx.
 */
import { color, type } from "../../../../fringe-ui/tokens";
import { adminSurfaceStyle, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { BulkActionBar } from "./parts/BulkActionBar";
import { PaginationBar } from "./parts/PaginationBar";
import { ResourceTableCell } from "./parts/ResourceTableCell";
import { resourceTableWidgetMetadata } from "./ResourceTable.metadata";
import type { ResourceTableProps } from "./ResourceTable.types";

function rowId(row: unknown, fallback: number) {
  return row && typeof row === "object" ? String((row as Record<string, unknown>).id || fallback) : String(fallback);
}

export function ResourceTable<Row = Record<string, unknown>>({
  id,
  className,
  style,
  dataAttributes,
  tableId,
  columns,
  rows,
  selectable,
  selectedRowIds = [],
  bulkLabel,
  empty,
  rowActions = [],
  bulkActions = [],
  pagination,
  page,
  total,
  actions = [],
  onRowAction,
  onBulkAction,
  onSelectionChange,
}: ResourceTableProps<Row>) {
  const showSelection = Boolean(selectable || bulkActions.length);
  const paginationPage = Number((pagination as Record<string, unknown> | undefined)?.page || page || 1);
  const paginationTotal = Number((pagination as Record<string, unknown> | undefined)?.total || total || rows.length);
  const tableActions = actions.filter((action) => action.placement !== "row");
  const effectiveRowActions = rowActions.length ? rowActions : actions.filter((action) => action.placement === "row");
  const dataAttrs = dataAttrsFromRecord(dataAttributes);

  if (!rows.length) {
    return <div id={id} className={className} style={{ ...adminSurfaceStyle, padding: 18, ...style }} {...widgetDataAttributes(resourceTableWidgetMetadata.widgetId, resourceTableWidgetMetadata.classification.level)} {...dataAttrs}>{empty ?? <span style={{ ...type.bodySm, color: color.softInk }}>No records</span>}</div>;
  }

  return (
    <div
      id={id}
      className={["adminDslResourceTable", className].filter(Boolean).join(" ") || undefined}
      style={{ ...adminSurfaceStyle, overflow: "hidden", ...style }}
      {...widgetDataAttributes(resourceTableWidgetMetadata.widgetId, resourceTableWidgetMetadata.classification.level)}
      {...dataAttrs}
    >
      {bulkActions.length > 0 ? <BulkActionBar tableId={tableId} label={bulkLabel} rows={rows} selectedRowIds={selectedRowIds} actions={bulkActions} onBulkAction={onBulkAction} /> : null}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
          <thead>
            <tr>
              {showSelection ? <th style={{ width: 42, padding: "12px 14px", borderBottom: `1px solid ${color.rule}` }}><span className="sr-only">Select</span></th> : null}
              {columns.map((column) => <th key={String(column.id)} style={{ ...type.meta, color: color.softInk, textAlign: "left", padding: "12px 14px", borderBottom: `1px solid ${color.rule}`, width: column.width }}>{String(column.label || column.id)}</th>)}
              {effectiveRowActions.length > 0 ? <th style={{ ...type.meta, color: color.softInk, textAlign: "right", padding: "12px 14px", borderBottom: `1px solid ${color.rule}` }}>Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const idValue = rowId(row, i);
              const selected = selectedRowIds.includes(idValue);
              const rowWithActions = effectiveRowActions.length && row && typeof row === "object" && !Array.isArray(row) ? { ...(row as Record<string, unknown>), actions: effectiveRowActions } as Row : row;
              return (
                <tr key={idValue} style={{ borderBottom: i === rows.length - 1 ? "none" : `1px solid ${color.ruleSoft}` }}>
                  {showSelection ? <td style={{ padding: "12px 14px" }}><input type="checkbox" aria-label={`Select ${idValue}`} checked={selected} onChange={(event) => { const next = event.currentTarget.checked ? [...selectedRowIds, idValue] : selectedRowIds.filter((value) => value !== idValue); onSelectionChange?.({ tableId, selectedRowIds: next }); }} style={{ width: 22, height: 22 }} /></td> : null}
                  {columns.map((column) => <td key={String(column.id)} data-label={String(column.label || column.id || "")} data-column-kind={String(column.kind || "text")} style={{ ...type.bodySm, padding: "12px 14px", verticalAlign: "middle" }}><ResourceTableCell column={column} row={rowWithActions} tableId={tableId} onRowAction={onRowAction} /></td>)}
                  {effectiveRowActions.length > 0 ? <td style={{ padding: "10px 14px", textAlign: "right" }}><ResourceTableCell column={{ id: "actions", kind: "actions" }} row={rowWithActions} tableId={tableId} onRowAction={onRowAction} /></td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pagination ? <PaginationBar page={paginationPage} total={paginationTotal} actions={tableActions} onAction={(action, context) => onBulkAction?.(action, { tableId, scope: "visible", rows, selectedRowIds }) || void context} /> : null}
    </div>
  );
}
