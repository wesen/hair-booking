import type { CSSProperties, Key, ReactNode } from "react";
import type { AdminActionRef, AdminJsonObject, AdminNode, AdminPage, AdminRenderContext } from "./schema";
import { color, font, radius, shadow, type } from "../fringe-ui/tokens";
import { AdminCalendarWeek } from "./calendar";
import { WorkbenchShell as WorkbenchShellWidget } from "./widgets/organisms/WorkbenchShell";
import { DefaultAdminShell } from "./widgets/organisms/DefaultAdminShell";
import { ActionGroup } from "./widgets/molecules/ActionGroup";
import type { ActionViewModel, SidebarNavItem } from "./widgets/shared";

import { actionIsDanger, actionIsPrimary, actionKey, actionList, dispatchAdminAction, isActionRef } from "./actions";
import { bool, dataAttrs, jsonArray, jsonObject, nodeKey, str, style, toneColor } from "./renderUtils";

function renderActions(node: AdminNode, ctx: AdminRenderContext | undefined, actions: AdminActionRef[] = actionList(node.props)) {
  if (!actions.length) return null;
  const slot = (actions.find((actionRef) => actionRef.placement)?.placement || "toolbar") as Parameters<typeof ActionGroup>[0]["slot"];
  return (
    <ActionGroup
      actions={actions.map(actionViewModel)}
      slot={slot}
      context={undefined}
      onAction={(action, value) => {
        const actionRef = action as AdminActionRef;
        dispatchAdminAction(ctx, node, actionRef, value);
      }}
    />
  );
}

function renderChildren(children: AdminNode[] | undefined, ctx: AdminRenderContext | undefined) {
  return (children || []).map((child, i) => renderAdminNode(child, ctx, nodeKey(child, i)));
}

const surface: CSSProperties = {
  background: color.paper,
  border: `1px solid ${color.rule}`,
  borderRadius: radius.lg,
  boxShadow: shadow.sm,
};

function layoutObject(props: AdminJsonObject | undefined) {
  return jsonObject(props, "layout");
}

function layoutSpan(node: AdminNode, breakpoint: "desktop" | "tablet" | "mobile", fallback = 12) {
  const layout = layoutObject(node.props);
  const span = jsonObject(layout, "span");
  return Number(span?.[breakpoint] || span?.desktop || fallback) || fallback;
}

function layoutOrder(node: AdminNode, fallback = 0) {
  const layout = layoutObject(node.props);
  return Number(layout?.order ?? fallback) || fallback;
}

function actionArray(props: AdminJsonObject | undefined, keyName: string) {
  return jsonArray<AdminActionRef>(props, keyName).filter(isActionRef);
}

function densityPadding(density: string, normal = 18) {
  if (density === "compact") return Math.max(12, normal - 4);
  if (density === "spacious") return normal + 8;
  return normal;
}

function renderTableCell(column: AdminJsonObject, row: AdminJsonObject, node: AdminNode, ctx?: AdminRenderContext) {
  const id = String(column.id || column.accessor || "");
  const accessor = String(column.accessor || id);
  const value = row[accessor];
  const kind = String(column.kind || "text");
  if (kind === "dragHandle") return <span aria-hidden="true" style={{ ...type.meta, color: color.softInk }}>⋮⋮</span>;
  if (kind === "badge") {
    const map = jsonObject(column, "map");
    const mapped = jsonObject(map, String(value || ""));
    const label = String(mapped?.label || value || "—");
    const tone = String(mapped?.tone || column.tone || "neutral");
    const badgeColors = tone === "warning"
      ? { background: "#fff0c2", color: "#674000", border: "#e0a52a" }
      : tone === "success"
        ? { background: "#e6f0df", color: "#345627", border: "#8baa7a" }
        : tone === "danger"
          ? { background: "#fff1ed", color: "#b3261e", border: "#e15a4f" }
          : { background: color.paper, color: color.ink, border: color.rule };
    return <span className="adminDslStatusText" style={{ display: "inline-flex", alignItems: "center", minHeight: 24, color: badgeColors.color, fontWeight: 700, ...type.bodySm }}>{label}</span>;
  }
  if (kind === "overflowActions" || kind === "actions") {
    const rowActions = Array.isArray(row.actions) ? row.actions.filter(isActionRef) : [];
    if (!rowActions.length) return "";
    if (kind === "overflowActions") {
      return <button type="button" className="adminDslOverflowAction" aria-label="Open row actions" onClick={() => dispatchAdminAction(ctx, node, rowActions[0], row)} style={{ minWidth: 32, minHeight: 32, border: "1px solid transparent", borderRadius: radius.md, background: "transparent", cursor: "pointer", fontSize: 18, lineHeight: 1, color: color.ink }}>…</button>;
    }
    return renderActions(node, ctx, rowActions);
  }
  if (kind === "boolean") return value ? "Yes" : "No";
  return <span style={{ fontWeight: column.primary ? 800 : 400, color: column.tone === "muted" ? color.softInk : color.ink }}>{String(value ?? "")}</span>;
}

function buildMonthCells(month: string) {
  const [yearPart, monthPart] = month.split("-").map((part) => Number(part));
  const year = yearPart || new Date().getFullYear();
  const monthIndex = (monthPart || new Date().getMonth() + 1) - 1;
  const first = new Date(year, monthIndex, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { date: iso, day: date.getDate(), inMonth: date.getMonth() === monthIndex };
  });
}

export function renderAdminNode(node: AdminNode, ctx?: AdminRenderContext, key?: Key): ReactNode {
  const props = node.props || {};
  const common = dataAttrs(node);

  switch (node.kind) {
    case "pageHeader": {
      const breadcrumbs = jsonArray<string>(props, "breadcrumbs");
      return (
        <header key={key} {...common} className="adminDslPageHeader" style={{ marginBottom: 24, display: "grid", gap: 10, ...style(props) }}>
          {breadcrumbs.length > 0 && <div style={{ ...type.eyebrow, color: color.softInk }}>{breadcrumbs.join(" / ")}</div>}
          <div className="adminDslPageHeaderRow" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 18, alignItems: "start" }}>
            <div>
              <h1 className="adminDslTitle" style={{ ...type.display2, fontSize: 56, margin: 0 }}>{str(props, "title", "Admin")}</h1>
              {str(props, "description") && <p style={{ ...type.bodyLg, color: color.softInk, maxWidth: 760, margin: "10px 0 0" }}>{str(props, "description")}</p>}
            </div>
            {renderActions(node, ctx)}
          </div>
        </header>
      );
    }

    case "dashboardGrid": {
      const columns = jsonObject(props, "columns");
      const desktopColumns = Number(columns?.desktop || props.columns || 12) || 12;
      const gap = str(props, "gap", "normal") === "compact" ? 16 : str(props, "gap") === "spacious" ? 28 : 20;
      return (
        <div key={key} {...common} className="adminDslDashboardGrid" style={{ display: "grid", gridTemplateColumns: `repeat(${desktopColumns}, minmax(0, 1fr))`, gap, alignItems: "start", ...style(props) }}>
          {(node.children || []).map((child, i) => (
            <div key={nodeKey(child, i)} className="adminDslDashboardGridItem" style={{ minWidth: 0, gridColumn: `span ${Math.min(desktopColumns, layoutSpan(child, "desktop", desktopColumns))}`, order: layoutOrder(child, i) }}>
              {renderAdminNode(child, ctx)}
            </div>
          ))}
        </div>
      );
    }

    case "comparisonTable": {
      const rows = jsonArray<AdminJsonObject>(props, "rows");
      if (!rows.length) return renderAdminNode({ kind: "emptyState", props: { title: str(props, "emptyTitle", "No changes"), body: str(props, "emptyBody", "There are no draft changes to review.") }, meta: node.meta }, ctx, key);
      return (
        <div key={key} {...common} className="adminDslComparisonTable" style={{ overflowX: "auto", ...style(props) }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr>
                {["Field", "Current", "Draft", "Scheduled", "Actions"].map((label) => <th key={label} style={{ ...type.meta, color: color.softInk, textAlign: label === "Actions" ? "right" : "left", padding: "10px 14px", borderBottom: `1px solid ${color.rule}` }}>{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowActions = Array.isArray(row.actions) ? row.actions.filter(isActionRef) : [];
                return (
                  <tr key={String(row.id || row.field || i)} style={{ borderBottom: i === rows.length - 1 ? "none" : `1px solid ${color.ruleSoft}` }}>
                    <td data-label="Field" style={{ ...type.bodySm, fontWeight: 800, padding: "10px 14px" }}>{String(row.field || row.label || "Field")}</td>
                    <td data-label="Current" style={{ ...type.bodySm, color: color.softInk, padding: "10px 14px" }}>{String(row.current ?? row.before ?? "—")}</td>
                    <td data-label="Draft" style={{ ...type.bodySm, fontWeight: 800, padding: "10px 14px" }}>{String(row.draft ?? row.after ?? "—")}</td>
                    <td data-label="Scheduled" style={{ ...type.bodySm, color: color.softInk, padding: "10px 14px" }}>{String(row.scheduled || "—")}</td>
                    <td data-label="Actions" style={{ padding: "8px 14px", textAlign: "right" }}>{rowActions.length > 0 && renderActions(node, ctx, rowActions)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case "monthCalendar": {
      const month = str(props, "month", "2024-06");
      const selectedDate = str(props, "selectedDate");
      const markers = jsonArray<AdminJsonObject>(props, "markers");
      const legend = jsonArray<AdminJsonObject>(props, "legend");
      const actions = jsonObject(props, "actions");
      const selectAction = isActionRef(actions?.selectDate) ? actions.selectDate : actionList(props).find((actionRef) => actionRef.placement === "calendarCell") || actionList(props)[0];
      const markerByDate = new Map<string, AdminJsonObject[]>();
      markers.forEach((marker) => {
        const date = String(marker.date || "");
        if (!date) return;
        markerByDate.set(date, [...(markerByDate.get(date) || []), marker]);
      });
      return (
        <div key={key} {...common} className="adminDslMonthCalendar" style={{ display: "grid", gap: 12, ...style(props) }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10 }}>
            <button type="button" aria-label="Previous month" disabled={!isActionRef(actions?.previousMonth)} onClick={() => isActionRef(actions?.previousMonth) && dispatchAdminAction(ctx, node, actions.previousMonth)} style={{ width: 30, height: 30, borderRadius: radius.md, border: `1px solid ${color.rule}`, background: color.paper, cursor: isActionRef(actions?.previousMonth) ? "pointer" : "default" }}>‹</button>
            <div style={{ ...type.body, fontWeight: 800, textAlign: "center" }}>{str(props, "label", new Date(`${month}-01T00:00:00`).toLocaleString("en", { month: "long", year: "numeric" }))}</div>
            <button type="button" aria-label="Next month" disabled={!isActionRef(actions?.nextMonth)} onClick={() => isActionRef(actions?.nextMonth) && dispatchAdminAction(ctx, node, actions.nextMonth)} style={{ width: 30, height: 30, borderRadius: radius.md, border: `1px solid ${color.rule}`, background: color.paper, cursor: isActionRef(actions?.nextMonth) ? "pointer" : "default" }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => <div key={`${day}-${i}`} style={{ ...type.meta, textAlign: "center", color: color.ink }}>{day}</div>)}
            {buildMonthCells(month).map((cell) => {
              const active = selectedDate === cell.date;
              const cellMarkers = markerByDate.get(cell.date) || [];
              const scheduled = cellMarkers.some((marker) => String(marker.kind) === "scheduled");
              return <button key={cell.date} type="button" disabled={!selectAction} aria-pressed={active} onClick={() => selectAction && dispatchAdminAction(ctx, node, selectAction, { date: cell.date })} style={{ minHeight: 38, borderRadius: radius.md, border: `1px solid ${active ? color.ink : scheduled ? color.warn : "transparent"}`, background: active ? color.ink : scheduled ? "#fbefcf" : "transparent", color: active ? color.paper : cell.inMonth ? color.ink : color.soft, display: "grid", placeItems: "center", gap: 2, cursor: selectAction ? "pointer" : "default" }}><span style={{ ...type.bodySm, fontWeight: 800 }}>{cell.day}</span>{cellMarkers.some((marker) => String(marker.kind) === "published") && <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: radius.pill, background: color.success }} />}</button>;
            })}
          </div>
          {legend.length > 0 && <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>{legend.map((item) => <span key={String(item.kind || item.label)} style={{ display: "inline-flex", alignItems: "center", gap: 6, ...type.bodySm, color: color.softInk }}><span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: radius.pill, background: String(item.tone) === "warning" ? color.warn : color.success }} />{String(item.label || item.kind)}</span>)}</div>}
        </div>
      );
    }

    case "toolbar":
      return <div key={key} {...common} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22, ...style(props) }}>{renderActions(node, ctx)}</div>;

    case "splitPane":
      return <div key={key} {...common} className="adminDslSplitPane" style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.85fr) minmax(320px, 1.15fr)", gap: 16, alignItems: "start", ...style(props) }}>{renderChildren(node.children, ctx)}</div>;

    case "tabs": {
      const tabs = jsonArray<AdminJsonObject>(props, "tabs");
      const value = str(props, "value");
      const tabAction = actionList(props)[0];
      return <div key={key} {...common} role="tablist" style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style(props) }}>{tabs.map((tab) => { const id = String(tab.id); const active = id === value; const content = String(tab.label || tab.id); const sharedStyle: CSSProperties = { minHeight: 38, display: "inline-flex", alignItems: "center", borderRadius: radius.pill, padding: "8px 12px", border: `1px solid ${active ? color.ink : color.rule}`, background: active ? color.ink : color.paper, color: active ? color.paper : color.ink, ...type.meta }; return tabAction ? <button key={id} type="button" role="tab" aria-selected={active} className="adminDslFilterPill" onClick={() => dispatchAdminAction(ctx, node, tabAction, tab)} style={{ ...sharedStyle, cursor: "pointer" }}>{content}</button> : <span key={id} role="tab" aria-selected={active} className="adminDslFilterPill" style={sharedStyle}>{content}</span>; })}</div>;
    }

    case "searchBox": {
      const searchAction = actionList(props)[0];
      return <form key={key} {...common} role="search" onSubmit={(event) => { event.preventDefault(); const value = String(new FormData(event.currentTarget).get("search") || ""); if (searchAction) dispatchAdminAction(ctx, node, searchAction, { query: value }); }} style={{ ...surface, padding: 12, display: "flex", alignItems: "center", gap: 10, color: color.softInk, ...style(props) }}><input name="search" defaultValue={str(props, "value")} placeholder={str(props, "placeholder", "Search")} aria-label={str(props, "label", "Search")} style={{ flex: 1, minHeight: 38, border: "none", outline: "none", background: "transparent", ...type.body }} />{searchAction && <button type="submit" className="adminDslActionButton" style={{ minHeight: 34, border: `1px solid ${color.ink}`, background: color.ink, color: color.paper, borderRadius: radius.pill, padding: "7px 11px", fontFamily: font.mono, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>{searchAction.label || "Search"}</button>}</form>;
    }

    case "previewFrame":
      return <div key={key} {...common} className="adminDslPreviewFrame" style={{ ...surface, padding: 14, display: "grid", gap: 12, ...style(props) }}><div><div style={{ ...type.eyebrow, color: color.softInk }}>{str(props, "kicker", "Preview")}</div><h3 style={{ ...type.h2, margin: "4px 0 0" }}>{str(props, "title", "Customer preview")}</h3>{str(props, "body") && <p style={{ ...type.bodySm, color: color.softInk, margin: "8px 0 0" }}>{str(props, "body")}</p>}</div>{str(props, "url") ? <iframe title={str(props, "title", "Preview")} src={str(props, "url")} style={{ width: "100%", minHeight: Number(props.height || 420), border: `1px solid ${color.rule}`, borderRadius: radius.md, background: color.paper }} /> : <div style={{ minHeight: Number(props.height || 260), border: `1px dashed ${color.rule}`, borderRadius: radius.md, display: "grid", placeItems: "center", color: color.softInk, ...type.bodySm }}>{str(props, "placeholder", "Preview route not connected yet")}</div>}{renderActions(node, ctx)}</div>;

    case "panel": {
      const density = str(props, "density", "normal");
      const paddingMode = str(props, "padding", "normal");
      const footerActions = actionArray(props, "footerActions");
      const toolbarActions = actionArray(props, "toolbarActions");
      const panelPadding = paddingMode === "none" ? 0 : densityPadding(density, 18);
      return (
        <article key={key} {...common} className="adminDslPanel" data-admin-dsl-density={density} style={{ ...surface, overflow: "hidden", ...style(props) }}>
          {(str(props, "title") || str(props, "subtitle") || toolbarActions.length > 0) && <div className="adminDslPanelHeader" style={{ display: "grid", gridTemplateColumns: toolbarActions.length ? "minmax(0, 1fr) auto" : "1fr", gap: 12, alignItems: "start", padding: densityPadding(density, 16), borderBottom: `1px solid ${color.ruleSoft}` }}>
            <div>
              {str(props, "eyebrow") && <div style={{ ...type.eyebrow, color: color.softInk, marginBottom: 4 }}>{str(props, "eyebrow")}</div>}
              {str(props, "title") && <h3 style={{ ...type.h3, margin: 0 }}>{str(props, "title")}</h3>}
              {str(props, "subtitle") && <p style={{ ...type.bodySm, color: color.softInk, margin: "6px 0 0" }}>{str(props, "subtitle")}</p>}
            </div>
            {toolbarActions.length > 0 && renderActions(node, ctx, toolbarActions)}
          </div>}
          {str(props, "body") && <p style={{ ...type.body, color: color.softInk, margin: 0, padding: panelPadding }}>{str(props, "body")}</p>}
          {node.children?.length ? <div className="adminDslPanelBody" style={{ padding: panelPadding, display: "grid", gap: density === "compact" ? 10 : 14 }}>{renderChildren(node.children, ctx)}</div> : null}
          {(footerActions.length > 0 || actionList(props).length > 0) && <div className="adminDslPanelFooter" style={{ borderTop: `1px solid ${color.ruleSoft}`, padding: densityPadding(density, 14) }}>{renderActions(node, ctx, footerActions.length ? footerActions : actionList(props))}</div>}
        </article>
      );
    }

    case "metricCard":
      return (
        <article key={key} {...common} style={{ ...surface, padding: 18, borderTop: `4px solid ${toneColor(str(props, "tone"))}`, ...style(props) }}>
          <div style={{ ...type.eyebrow, color: color.softInk }}>{str(props, "label")}</div>
          <div style={{ ...type.display3, marginTop: 10, color: toneColor(str(props, "tone")) }}>{String(props.value || "—")}</div>
          {str(props, "caption") && <div style={{ ...type.bodySm, color: color.softInk, marginTop: 8 }}>{str(props, "caption")}</div>}
        </article>
      );

    case "filterBar": {
      const filters = jsonArray<AdminJsonObject>(props, "filters");
      const value = str(props, "value");
      const filterAction = actionList(props)[0];
      return (
        <div key={key} {...common} style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style(props) }}>
          {filters.map((filter) => {
            const id = String(filter.id);
            const active = id === value;
            const sharedStyle: CSSProperties = { minHeight: 38, display: "inline-flex", alignItems: "center", borderRadius: radius.pill, padding: "8px 12px", border: `1px solid ${active ? color.ink : color.rule}`, background: active ? color.ink : color.paper, color: active ? color.paper : color.ink, ...type.meta };
            return filterAction ? <button key={id} type="button" className="adminDslFilterPill" aria-pressed={active} onClick={() => dispatchAdminAction(ctx, node, filterAction, filter)} style={{ ...sharedStyle, cursor: "pointer" }}>{String(filter.label || filter.id)}</button> : <span key={id} className="adminDslFilterPill" style={sharedStyle}>{String(filter.label || filter.id)}</span>;
          })}
        </div>
      );
    }

    case "resourceTable": {
      const columns = jsonArray<AdminJsonObject>(props, "columns");
      const rows = jsonArray<AdminJsonObject>(props, "rows");
      const tableActions = actionList(props);
      const rowAction = tableActions.find((a) => a.placement === "row") || tableActions[0];
      const bulkActions = jsonArray<AdminActionRef>(props, "bulkActions").filter(isActionRef);
      const pagination = jsonObject(props, "pagination");
      const selectable = bool(props, "selectable") || bulkActions.length > 0;
      if (!rows.length) return renderInlineNode(jsonObject(props, "empty"), ctx) || renderAdminNode({ kind: "emptyState", props: { title: str(props, "emptyTitle", "No records"), body: str(props, "emptyBody") }, meta: node.meta }, ctx, key);
      return (
        <div key={key} {...common} className="adminDslResourceTable" style={{ ...surface, overflow: "hidden", ...style(props) }}>
          {bulkActions.length > 0 && <div className="adminDslBulkActionBar" style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: 12, borderBottom: `1px solid ${color.rule}`, background: color.cream }}><span style={{ ...type.meta, color: color.softInk }}>{str(props, "bulkLabel", "Bulk actions")}</span><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{bulkActions.map((bulkAction, i) => <button key={actionKey(bulkAction, i)} type="button" className="adminDslActionButton" onClick={() => dispatchAdminAction(ctx, node, bulkAction, { scope: "visible", rows })} style={{ minHeight: 34, border: `1px solid ${actionIsDanger(bulkAction) ? color.danger : color.ink}`, background: actionIsPrimary(bulkAction) ? color.ink : color.paper, color: actionIsPrimary(bulkAction) ? color.paper : actionIsDanger(bulkAction) ? color.danger : color.ink, borderRadius: radius.pill, padding: "7px 11px", fontFamily: font.mono, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>{bulkAction.label || bulkAction.target}</button>)}</div></div>}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead>
                <tr>
                  {selectable && <th style={{ width: 42, padding: "12px 14px", borderBottom: `1px solid ${color.rule}` }}><span className="sr-only">Select</span></th>}
                  {columns.map((column) => <th key={String(column.id)} style={{ ...type.meta, color: color.softInk, textAlign: "left", padding: "12px 14px", borderBottom: `1px solid ${color.rule}` }}>{String(column.label || column.id)}</th>)}
                  {rowAction && <th style={{ ...type.meta, color: color.softInk, textAlign: "right", padding: "12px 14px", borderBottom: `1px solid ${color.rule}` }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={String(row.id || i)} style={{ borderBottom: i === rows.length - 1 ? "none" : `1px solid ${color.ruleSoft}` }}>
                    {selectable && <td style={{ padding: "12px 14px" }}><input type="checkbox" aria-label={`Select ${String(row.id || i)}`} style={{ width: 22, height: 22 }} /></td>}
                    {columns.map((column) => <td key={String(column.id)} data-label={String(column.label || column.id || "")} data-column-kind={String(column.kind || "text")} style={{ ...type.bodySm, padding: "12px 14px", verticalAlign: "top" }}>{renderTableCell(column, row, node, ctx)}</td>)}
                    {rowAction && <td style={{ padding: "10px 14px", textAlign: "right" }}><button type="button" className="adminDslActionButton" aria-label={rowAction.label || "Open"} onClick={() => dispatchAdminAction(ctx, node, rowAction, row)} style={{ minHeight: 34, border: `1px solid ${color.ink}`, background: color.ink, color: color.paper, borderRadius: radius.pill, padding: "7px 11px", fontFamily: font.mono, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>{rowAction.label || "Open"}</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && <div className="adminDslPagination" style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: 12, borderTop: `1px solid ${color.rule}`, background: color.paper }}><span style={{ ...type.meta, color: color.softInk }}>Page {String(pagination.page || 1)} · {String(pagination.total || rows.length)} total</span>{renderActions(node, ctx, tableActions.filter((a) => a.placement !== "row"))}</div>}
        </div>
      );
    }

    case "emptyState":
      return (
        <div key={key} {...common} style={{ ...surface, padding: 28, textAlign: "center", background: color.cream, ...style(props) }}>
          <h3 style={{ ...type.h2, margin: 0 }}>{str(props, "title", "Nothing here yet")}</h3>
          {str(props, "body") && <p style={{ ...type.body, color: color.softInk, maxWidth: 420, margin: "10px auto 18px" }}>{str(props, "body")}</p>}
          {jsonObject(props, "action") && renderActions(node, ctx, [jsonObject(props, "action") as unknown as AdminActionRef])}
        </div>
      );

    case "kvList": {
      const items = jsonArray<AdminJsonObject>(props, "items");
      return (
        <dl key={key} {...common} style={{ display: "grid", gap: 10, margin: 0, ...style(props) }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, borderBottom: `1px solid ${color.ruleSoft}`, paddingBottom: 8 }}>
              <dt style={{ ...type.meta, color: color.soft }}>{String(item.label || "")}</dt>
              <dd style={{ ...type.body, margin: 0 }}>{String(item.value || "")}</dd>
            </div>
          ))}
        </dl>
      );
    }

    case "markdownBlock":
      return <p key={key} {...common} style={{ ...type.body, color: color.softInk, margin: 0, whiteSpace: "pre-wrap", ...style(props) }}>{str(props, "markdown")}</p>;

    case "activityFeed": {
      const items = jsonArray<AdminJsonObject>(props, "items");
      return <div key={key} {...common} style={{ display: "grid", gap: 10, ...style(props) }}>{items.map((item, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12, paddingBottom: 10, borderBottom: `1px solid ${color.ruleSoft}` }}><div style={{ ...type.meta, color: color.softInk }}>{String(item.time || "")}</div><div><div style={{ ...type.body, fontWeight: 800 }}>{String(item.title || "")}</div>{item.body && <div style={{ ...type.bodySm, color: color.softInk, marginTop: 2 }}>{String(item.body)}</div>}</div></div>)}</div>;
    }

    case "imageGrid": {
      const items = jsonArray<AdminJsonObject>(props, "items");
      return <div key={key} {...common} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, ...style(props) }}>{items.map((item) => <article key={String(item.id || item.title)} style={{ ...surface, overflow: "hidden" }}><div style={{ aspectRatio: "4 / 3", background: `linear-gradient(135deg, ${color.peachSoft}, ${color.creamDeep})`, borderBottom: `1px solid ${color.rule}` }} /><div style={{ padding: 12 }}><div style={{ ...type.h3, fontSize: 18 }}>{String(item.title || "Asset")}</div><div style={{ ...type.bodySm, color: color.softInk, marginTop: 4 }}>{String(item.subtitle || "")}</div>{item.status && <span style={{ display: "inline-flex", marginTop: 8, borderRadius: radius.pill, padding: "4px 8px", background: color.paper, border: `1px solid ${color.rule}`, color: toneColor(String(item.tone || "")), fontWeight: 700, ...type.meta }}>{String(item.status)}</span>}</div></article>)}</div>;
    }

    case "imageGallery": {
      const images = jsonArray<AdminJsonObject>(props, "images");
      const imageAction = actionList(props)[0];
      if (!images.length) return <div key={key} {...common} style={{ ...surface, padding: 18, color: color.softInk, ...type.bodySm, ...style(props) }}>{str(props, "emptyText", "No photos uploaded yet.")}</div>;
      return <div key={key} {...common} className="adminDslImageGallery" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, ...style(props) }}>{images.map((image) => {
        const body = <>{image.url ? <img src={String(image.url)} alt={String(image.alt || image.title || "Uploaded image")} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", borderBottom: `1px solid ${color.rule}` }} /> : <div style={{ aspectRatio: "4 / 3", display: "grid", placeItems: "center", background: color.cream, borderBottom: `1px solid ${color.rule}`, color: color.danger, ...type.meta }}>Missing photo</div>}<div style={{ padding: 12 }}><div style={{ ...type.h3, fontSize: 18 }}>{String(image.title || image.slot || "Photo")}</div>{image.subtitle && <div style={{ ...type.bodySm, color: color.softInk, marginTop: 4 }}>{String(image.subtitle)}</div>}{image.status && <span style={{ display: "inline-flex", marginTop: 8, borderRadius: radius.pill, padding: "4px 8px", background: color.paper, border: `1px solid ${color.rule}`, color: toneColor(String(image.tone || "")), fontWeight: 700, ...type.meta }}>{String(image.status)}</span>}</div></>;
        return imageAction ? <button key={String(image.id || image.slot || image.title)} type="button" aria-label={`Open ${String(image.title || image.slot || "photo")}`} onClick={() => dispatchAdminAction(ctx, node, imageAction, image)} style={{ ...surface, overflow: "hidden", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit" }}>{body}</button> : <article key={String(image.id || image.slot || image.title)} style={{ ...surface, overflow: "hidden" }}>{body}</article>;
      })}</div>;
    }

    case "loadingState":
      return <div key={key} {...common} style={{ ...surface, padding: 16, display: "grid", gap: 8, ...style(props) }}><div style={{ ...type.h3 }}>{str(props, "title", "Loading")}</div>{str(props, "body") && <p style={{ ...type.bodySm, color: color.softInk, margin: 0 }}>{str(props, "body")}</p>}<div style={{ height: 8, borderRadius: radius.pill, background: `linear-gradient(90deg, ${color.rule}, ${color.cream}, ${color.rule})` }} /></div>;

    case "modal":
    case "drawer":
    case "sheet":
    case "detailPanel":
    case "inlinePanel": {
      const isDrawerLike = node.kind === "drawer" || node.kind === "sheet" || node.kind === "detailPanel";
      const label = node.kind === "sheet" ? "Sheet" : node.kind === "detailPanel" ? "Detail" : node.kind === "inlinePanel" ? "Inline" : node.kind === "drawer" ? "Drawer" : "Modal";
      return (
        <aside key={key} {...common} className={`adminDslOverlaySurface adminDslSurface-${node.kind} ${isDrawerLike ? "adminDslDrawerSurface" : "adminDslModalSurface"}`} style={{ ...surface, padding: 18, background: isDrawerLike ? color.cream : color.paper, borderStyle: bool(props, "open", false) ? "solid" : "dashed", ...style(props) }}>
          <div className="adminDslSurfaceKicker" style={{ ...type.eyebrow, color: color.softInk }}>{label}</div>
          <h3 style={{ ...type.h2, margin: "8px 0 16px" }}>{str(props, "title", str(props, "id"))}</h3>
          <div style={{ display: "grid", gap: 14 }}>{renderChildren(node.children, ctx)}</div>
        </aside>
      );
    }

    case "confirmDialog":
      return (
        <aside key={key} {...common} style={{ ...surface, padding: 18, borderColor: str(props, "tone") === "danger" ? color.danger : color.rule, ...style(props) }}>
          <h3 style={{ ...type.h2, margin: 0 }}>{str(props, "title", "Are you sure?")}</h3>
          {str(props, "body") && <p style={{ ...type.body, color: color.softInk }}>{str(props, "body")}</p>}
          {renderActions(node, ctx, [{ type: "confirm", target: str(props, "id"), label: str(props, "confirmLabel", "Confirm") }])}
        </aside>
      );

    case "form": {
      const errors = jsonObject(props, "errors");
      const errorEntries = errors ? Object.entries(errors) : [];
      const pending = bool(props, "pending") || str(props, "state") === "pending";
      return (
        <form key={key} {...common} aria-busy={pending || undefined} style={{ display: "grid", gap: 16, opacity: pending ? 0.76 : 1, ...style(props) }} onSubmit={(event) => event.preventDefault()}>
          {str(props, "title") && <h3 style={{ ...type.h2, margin: 0 }}>{str(props, "title")}</h3>}
          {(bool(props, "dirty") || pending || str(props, "state") === "success") && <div className="adminDslFormLifecycle" style={{ ...type.meta, border: `1px solid ${pending ? color.warn : str(props, "state") === "success" ? color.success : color.rule}`, borderRadius: radius.pill, padding: "6px 10px", width: "fit-content", background: color.paper }}>{pending ? "Saving…" : str(props, "state") === "success" ? "Saved" : "Unsaved changes"}</div>}
          {errorEntries.length > 0 && <div className="adminDslFormErrors" style={{ border: `1px solid ${color.danger}`, borderRadius: radius.md, padding: 10, color: color.danger, display: "grid", gap: 4 }}>{errorEntries.map(([name, message]) => <div key={name} style={{ ...type.bodySm }}><strong>{name}</strong>: {String(message)}</div>)}</div>}
          {renderChildren(node.children, ctx)}
          {renderActions(node, ctx)}
        </form>
      );
    }

    case "fieldGroup":
      return <fieldset key={key} {...common} style={{ border: `1px solid ${color.rule}`, borderRadius: radius.md, padding: 14, display: "grid", gap: 12, ...style(props) }}><legend style={{ ...type.eyebrow }}>{str(props, "title")}</legend>{renderChildren(node.children, ctx)}</fieldset>;

    case "textField":
    case "textareaField":
    case "moneyField":
    case "durationField":
    case "dateField":
    case "timeField":
    case "selectField":
    case "switchField":
    case "imageField":
      return <FieldPreview key={key} node={node} />;

    case "saveBar":
      return <div key={key} {...common} className="adminDslSaveBar" style={{ borderTop: `1px solid ${color.rule}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, ...style(props) }}><span className="adminDslSaveStatus" style={{ ...type.meta, color: color.ink, fontWeight: 800, background: color.cream, border: `1px solid ${color.rule}`, borderRadius: radius.pill, padding: "6px 10px", justifySelf: "start" }}>{str(props, "status", "Ready")}</span>{jsonObject(props, "primary") && renderActions(node, ctx, [jsonObject(props, "primary") as unknown as AdminActionRef])}</div>;

    case "calendarWeek":
      return <AdminCalendarWeek key={key} node={node} context={ctx} attrs={common} />;

    case "appointmentBlock":
    case "availabilityBlock":
    case "timeOffBlock":
      return (
        <button key={key} {...common} type="button" onClick={() => actionList(props)[0] && dispatchAdminAction(ctx, node, actionList(props)[0])} style={{ textAlign: "left", border: `1px solid ${node.kind === "timeOffBlock" ? color.warn : color.plum}`, background: node.kind === "timeOffBlock" ? "#fbefcf" : color.paper, borderRadius: radius.md, padding: 12, boxShadow: shadow.sm, cursor: "pointer", ...style(props) }}>
          <strong style={{ ...type.body, display: "block" }}>{str(props, "clientName", str(props, "title", "Appointment"))}</strong>
          <span style={{ ...type.bodySm, color: color.softInk }}>{str(props, "service", str(props, "status"))}</span>
          <span style={{ ...type.meta, display: "block", marginTop: 6 }}>{str(props, "startsAt")} – {str(props, "endsAt")}</span>
        </button>
      );

    case "inlineError":
      return <div key={key} {...common} style={{ border: `1px solid ${color.danger}`, color: color.danger, padding: 12, borderRadius: radius.md, ...type.body }}>{str(props, "title", "Something went wrong")}</div>;

    default:
      return <pre key={key} {...common} style={{ padding: 12, background: color.cream, overflow: "auto" }}>{JSON.stringify(node, null, 2)}</pre>;
  }
}

function renderInlineNode(node: AdminJsonObject | undefined, ctx?: AdminRenderContext) {
  if (!node || typeof node.kind !== "string") return null;
  return renderAdminNode(node as unknown as AdminNode, ctx, String(node.kind));
}

function FieldPreview({ node }: { node: AdminNode }) {
  const props = node.props || {};
  const name = str(props, "name", node.meta?.id || "");
  const label = str(props, "label", name);
  const value = props.value;
  const inputStyle: CSSProperties = { border: `1px solid ${color.rule}`, borderRadius: radius.md, padding: "10px 12px", background: color.paper, ...type.body };

  return (
    <label {...dataAttrs(node)} style={{ display: "grid", gap: 6 }}>
      <span style={{ ...type.meta, color: color.softInk }}>{label}</span>
      {node.kind === "switchField" ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...type.body }}><span style={{ width: 34, height: 20, borderRadius: radius.pill, background: value ? color.success : color.rule, display: "inline-block" }} />{value ? "On" : "Off"}</span>
      ) : node.kind === "textareaField" ? (
        <textarea name={name} defaultValue={typeof value === "string" ? value : ""} style={{ ...inputStyle, minHeight: 76 }} />
      ) : node.kind === "selectField" ? (
        <select name={name} defaultValue={String(value || "")} style={inputStyle}><option value={String(value || "")}>{String(value || "Choose...")}</option></select>
      ) : node.kind === "imageField" ? (
        <div style={{ ...inputStyle, borderStyle: "dashed", color: color.softInk }}>Image upload field</div>
      ) : (
        <input name={name} defaultValue={value == null ? "" : String(value)} style={inputStyle} />
      )}
    </label>
  );
}

function actionViewModel(action: AdminActionRef): ActionViewModel {
  return { ...action, label: action.label || action.target } as ActionViewModel;
}

function renderWorkbenchShell({ page, context }: { page: AdminPage; context?: AdminRenderContext }) {
  const shellProps = page.shell.props || {};
  const sidebar = jsonObject(shellProps, "sidebar");
  const items = jsonArray<AdminJsonObject>(sidebar, "items");
  const active = String(sidebar?.active || "");
  const user = jsonObject(sidebar, "user");
  const navNode: AdminNode = { kind: "toolbar", props: { id: "workbench-sidebar" }, meta: { id: "workbench-sidebar" } };
  const sidebarItems: SidebarNavItem[] = items.map((item) => {
    const id = String(item.id || item.label || "");
    const itemAction = isActionRef(item.action) ? actionViewModel(item.action) : undefined;
    return {
      id,
      label: String(item.label || id),
      icon: item.icon == null ? undefined : String(item.icon),
      action: itemAction,
      rawItem: item,
    };
  });

  return (
    <WorkbenchShellWidget
      pageId={page.id}
      title={page.title}
      shellKind={page.shell.kind}
      schemaVersion={page.schemaVersion}
      sidebar={{ activeItemId: active, items: sidebarItems }}
      user={user ? {
        name: String(user.name || "Admin User"),
        role: String(user.role || "Administrator"),
        initials: String(user.initials || "AD"),
      } : undefined}
      onSidebarAction={(action, actionContext) => {
        const rawItem = (actionContext.item as SidebarNavItem & { rawItem?: unknown }).rawItem;
        dispatchAdminAction(context, navNode, action as AdminActionRef, rawItem ?? actionContext.item);
      }}
    >
      <style>{responsiveCss}</style>
      {page.nodes.map((node, i) => renderAdminNode(node, context, nodeKey(node, i)))}
    </WorkbenchShellWidget>
  );
}

function renderDefaultAdminShell({ page, context, sideNodes }: { page: AdminPage; context?: AdminRenderContext; sideNodes: AdminNode[] }) {
  const main = (
    <>
      <style>{responsiveCss}</style>
      {page.nodes.map((node, i) => renderAdminNode(node, context, nodeKey(node, i)))}
    </>
  );
  const side = sideNodes.length > 0 ? <>{sideNodes.map((node, i) => renderAdminNode(node, context, nodeKey(node, i)))}</> : undefined;

  return (
    <DefaultAdminShell
      pageId={page.id}
      shellKind={page.shell.kind}
      eyebrow={str(page.shell.props, "eyebrow", "Admin DSL")}
      title={page.title}
      description={page.description}
      main={main}
      side={side}
    />
  );
}

const responsiveCss = `
  .adminDslRoot { box-sizing: border-box; }
  .adminDslRoot *, .adminDslRoot *::before, .adminDslRoot *::after { box-sizing: border-box; }
  .adminDslRoot .sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important; }
  .adminDslGrid { grid-template-columns: var(--admin-dsl-grid-columns, 1fr); }
  .adminDslTitle { text-wrap: balance; overflow-wrap: anywhere; }
  .adminDslSideColumn { min-width: 0; }
  @media (max-width: 860px) {
    .adminDslWorkbenchTopbar { display: flex !important; }
    .adminDslWorkbenchSidebar { display: none !important; }
    .adminDslWorkbenchContent { margin-left: 0 !important; padding: 14px !important; }
    .adminDslPageHeader { margin-bottom: 16px !important; }
    .adminDslPageHeaderRow { grid-template-columns: 1fr !important; gap: 12px !important; }
    .adminDslPageHeader .adminDslTitle { font-size: clamp(28px, 10vw, 38px) !important; }
    .adminDslDashboardGrid { grid-template-columns: 1fr !important; gap: 14px !important; }
    .adminDslDashboardGridItem { grid-column: span 1 !important; }
    .adminDslPanelHeader, .adminDslPanelBody, .adminDslPanelFooter { padding: 12px !important; }
    .adminDslResourceTable { overflow: visible !important; }
    .adminDslResourceTable table, .adminDslComparisonTable table { min-width: 0 !important; width: 100% !important; }
    .adminDslResourceTable thead, .adminDslComparisonTable thead { display: none !important; }
    .adminDslResourceTable tbody, .adminDslResourceTable tr, .adminDslResourceTable td, .adminDslComparisonTable tbody, .adminDslComparisonTable tr, .adminDslComparisonTable td { display: block !important; width: 100% !important; }
    .adminDslResourceTable tr, .adminDslComparisonTable tr { padding: 10px 12px !important; border-bottom: 1px solid ${color.ruleSoft} !important; }
    .adminDslResourceTable td, .adminDslComparisonTable td { padding: 5px 0 !important; border: none !important; }
    .adminDslResourceTable td[data-column-kind="dragHandle"] { display: none !important; }
    .adminDslResourceTable td[data-label]::before, .adminDslComparisonTable td[data-label]::before { content: attr(data-label); display: block; margin-bottom: 2px; font-family: ${font.mono}; font-size: 10px; letter-spacing: 1.4px; color: ${color.softInk}; }
    .adminDslResourceTable td[data-label="Actions"]::before, .adminDslComparisonTable td[data-label="Actions"]::before { display: none !important; }
  }
  @media (max-width: 720px) {
    .adminDslRoot { padding: 16px !important; overflow-x: hidden !important; }
    .adminDslGrid { grid-template-columns: 1fr !important; gap: 16px !important; }
    .adminDslTitle { font-size: clamp(28px, 9vw, 34px) !important; line-height: 0.98 !important; letter-spacing: -0.15px !important; }
    .adminDslSectionTitle { font-size: clamp(20px, 7vw, 24px) !important; line-height: 1.05 !important; }
    .adminDslActionButton { min-height: 44px !important; flex: 1 1 132px !important; justify-content: center !important; }
    .adminDslActionButton[data-admin-dsl-action-placement="row"], .adminDslActionButton[data-admin-dsl-action-placement="panelFooter"], .adminDslActionButton[data-admin-dsl-action-placement="formFooter"] { min-height: 40px !important; }
    .adminDslActionButton[data-admin-dsl-action-placement="panelFooter"] { flex: 0 0 auto !important; justify-content: flex-start !important; }
    .adminDslSplitPane { grid-template-columns: 1fr !important; }
    .adminDslFilterPill { min-height: 44px !important; padding-inline: 14px !important; }
    .adminDslSaveBar { display: grid !important; grid-template-columns: 1fr !important; align-items: stretch !important; }
    .adminDslSurfaceKicker { display: none !important; }
    .adminDslCalendarScroller { display: none !important; }
    .adminDslCalendarAgenda { display: grid !important; }
    .adminDslResourceRow { grid-template-columns: 1fr !important; gap: 12px !important; padding: 14px !important; }
    .adminDslOverlaySurface { max-height: none !important; overflow: auto !important; border-radius: 14px !important; border-style: solid !important; border-left-width: 4px !important; }
    .adminDslSideColumn { display: grid !important; grid-template-columns: 1fr !important; margin: 16px 0 22px !important; }
  }
  @media (max-width: 430px) {
    .adminDslRoot { padding: 12px !important; }
    .adminDslActionButton { flex-basis: 100% !important; }
    .adminDslResourceRow .adminDslActions { display: grid !important; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)) !important; width: 100% !important; }
    .adminDslResourceRow .adminDslActionButton { flex-basis: auto !important; min-height: 40px !important; padding-block: 8px !important; }
  }
`;

export function AdminPageRenderer({ page, context }: { page: AdminPage; context?: AdminRenderContext }) {
  const shell = page.shell.kind;
  const sideNodes = [...(page.drawers || []), ...(page.modals || [])];
  if (shell === "admin" && str(page.shell.props, "variant") === "workbench") {
    return renderWorkbenchShell({ page, context });
  }

  return renderDefaultAdminShell({ page, context, sideNodes });
}
