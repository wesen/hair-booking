import type { CSSProperties, Key, ReactNode } from "react";
import type { AdminActionRef, AdminJsonObject, AdminNode, AdminPage, AdminRenderContext } from "./schema";
import { color, font, radius, shadow, type } from "../fringe-ui/tokens";
import { WorkbenchShell as WorkbenchShellWidget } from "./widgets/organisms/WorkbenchShell";
import { DefaultAdminShell } from "./widgets/organisms/DefaultAdminShell";
import { ActionGroup } from "./widgets/molecules/ActionGroup";
import { FieldGroup } from "./widgets/molecules/FieldGroup";
import { FilterBar } from "./widgets/molecules/FilterBar";
import { ActivityFeed } from "./widgets/molecules/ActivityFeed";
import type { ActivityFeedItem } from "./widgets/molecules/ActivityFeed/ActivityFeed.types";
import { CalendarEventBlock } from "./widgets/molecules/CalendarEventBlock";
import type { CalendarEventBlockProps } from "./widgets/molecules/CalendarEventBlock/CalendarEventBlock.types";
import { EmptyState } from "./widgets/molecules/EmptyState";
import { InlineError } from "./widgets/molecules/InlineError";
import { KeyValueList } from "./widgets/molecules/KeyValueList";
import { LoadingState } from "./widgets/molecules/LoadingState";
import { MarkdownBlock } from "./widgets/molecules/MarkdownBlock";
import { MetricCard } from "./widgets/molecules/MetricCard";
import { SaveBar } from "./widgets/molecules/SaveBar";
import { SearchBox } from "./widgets/molecules/SearchBox";
import { Tabs } from "./widgets/molecules/Tabs";
import { TextField } from "./widgets/molecules/TextField";
import { TextareaField } from "./widgets/molecules/TextareaField";
import { Toolbar } from "./widgets/molecules/Toolbar";
import { DashboardGrid, DashboardGridItem } from "./widgets/organisms/DashboardGrid";
import { AdminForm } from "./widgets/organisms/AdminForm";
import { ComparisonTable } from "./widgets/organisms/ComparisonTable";
import type { ComparisonTableRow } from "./widgets/organisms/ComparisonTable/ComparisonTable.types";
import { ImageGallery } from "./widgets/organisms/ImageGallery";
import type { GalleryImage } from "./widgets/organisms/ImageGallery/ImageGallery.types";
import { ImageGrid } from "./widgets/organisms/ImageGrid";
import type { ImageGridItem } from "./widgets/organisms/ImageGrid/ImageGrid.types";
import { CalendarWeek } from "./widgets/organisms/CalendarWeek";
import { MonthCalendar } from "./widgets/organisms/MonthCalendar";
import type { MonthCalendarLegendItem, MonthCalendarMarker } from "./widgets/organisms/MonthCalendar/MonthCalendar.types";
import { PageHeader } from "./widgets/organisms/PageHeader";
import { Panel } from "./widgets/organisms/Panel";
import { PreviewFrame } from "./widgets/organisms/PreviewFrame";
import { ResourceTable } from "./widgets/organisms/ResourceTable";
import type { ResourceTableColumn } from "./widgets/organisms/ResourceTable/ResourceTable.types";
import { SplitPane } from "./widgets/organisms/SplitPane";
import type { ActionViewModel, SidebarNavItem } from "./widgets/shared";

import { actionIsDanger, actionIsPrimary, actionKey, actionList, dispatchAdminAction, isActionRef } from "./actions";
import { bool, dataAttrs, jsonArray, jsonObject, nodeKey, num, str, style, toneColor } from "./renderUtils";

function nodeDomId(node: AdminNode): string | undefined {
  return node.meta?.id || str(node.props, "id") || undefined;
}

function dispatchWidgetAction(ctx: AdminRenderContext | undefined, node: AdminNode, action: unknown, value?: unknown) {
  if (isActionRef(action)) dispatchAdminAction(ctx, node, action, value);
}

function singleActionArray(action: unknown): AdminActionRef[] {
  return isActionRef(action) ? [action] : [];
}

function renderActions(node: AdminNode, ctx: AdminRenderContext | undefined, actions: AdminActionRef[] = actionList(node.props)) {
  if (!actions.length) return null;
  const slot = (actions.find((actionRef) => actionRef.placement)?.placement || "toolbar") as Parameters<typeof ActionGroup>[0]["slot"];
  return (
    <ActionGroup
      actions={actions.map(actionViewModel)}
      slot={slot}
      context={undefined}
      onAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)}
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

function normalizeResourceTableColumns(columns: AdminJsonObject[]): ResourceTableColumn<AdminJsonObject>[] {
  return columns.map((column) => {
    const mapValue = jsonObject(column, "map");
    const mappedEntries = mapValue
      ? Object.fromEntries(
        Object.entries(mapValue).map(([key, value]) => {
          const item = value && typeof value === "object" && !Array.isArray(value) ? value as AdminJsonObject : {};
          return [key, { label: String(item.label ?? key), tone: typeof item.tone === "string" ? item.tone : undefined }];
        }),
      )
      : undefined;
    return {
      id: String(column.id || column.accessor || ""),
      accessor: typeof column.accessor === "string" ? column.accessor : undefined,
      label: typeof column.label === "string" ? column.label : undefined,
      kind: typeof column.kind === "string" ? column.kind as ResourceTableColumn["kind"] : undefined,
      primary: Boolean(column.primary),
      tone: typeof column.tone === "string" ? column.tone : undefined,
      width: typeof column.width === "string" || typeof column.width === "number" ? column.width : undefined,
      map: mappedEntries,
    };
  });
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
      const actions = actionList(props).map(actionViewModel);
      const pageId = nodeDomId(node);
      return (
        <PageHeader
          key={key}
          id={pageId}
          title={str(props, "title", "Admin")}
          description={str(props, "description") || undefined}
          breadcrumbs={breadcrumbs}
          primaryActions={actions}
          style={style(props)}
          onPrimaryAction={(action, value) => dispatchAdminAction(ctx, node, action as AdminActionRef, value)}
        />
      );
    }

    case "dashboardGrid": {
      const columns = jsonObject(props, "columns");
      const desktopColumns = Number(columns?.desktop || props.columns || 12) || 12;
      const tabletColumns = Number(columns?.tablet || Math.min(desktopColumns, 8)) || Math.min(desktopColumns, 8);
      const mobileColumns = Number(columns?.mobile || 1) || 1;
      return (
        <DashboardGrid
          key={key}
          id={nodeDomId(node)}
          columns={{ desktop: desktopColumns, tablet: tabletColumns, mobile: mobileColumns }}
          gap={str(props, "gap", "normal") as "compact" | "normal" | "spacious"}
          style={style(props)}
        >
          {(node.children || []).map((child, i) => (
            <DashboardGridItem
              key={nodeKey(child, i)}
              span={{
                desktop: Math.min(desktopColumns, layoutSpan(child, "desktop", desktopColumns)),
                tablet: Math.min(tabletColumns, layoutSpan(child, "tablet", tabletColumns)),
                mobile: Math.min(mobileColumns, layoutSpan(child, "mobile", mobileColumns)),
              }}
              order={layoutOrder(child, i)}
            >
              {renderAdminNode(child, ctx)}
            </DashboardGridItem>
          ))}
        </DashboardGrid>
      );
    }

    case "comparisonTable": {
      const rows = jsonArray<AdminJsonObject>(props, "rows").map((row): ComparisonTableRow => ({
        id: row.id == null ? undefined : String(row.id),
        field: String(row.field || row.label || "Field"),
        current: String(row.current ?? row.before ?? "—"),
        draft: String(row.draft ?? row.after ?? "—"),
        scheduled: String(row.scheduled || "—"),
        actions: Array.isArray(row.actions) ? row.actions.filter(isActionRef).map(actionViewModel) : undefined,
      }));
      const empty = renderAdminNode({ kind: "emptyState", props: { title: str(props, "emptyTitle", "No changes"), body: str(props, "emptyBody", "There are no draft changes to review.") }, meta: node.meta }, ctx, key);
      return <ComparisonTable key={key} id={nodeDomId(node)} tableId={str(props, "tableId", node.meta?.id || "comparison-table")} rows={rows} empty={empty} style={style(props)} onRowAction={(action, value) => dispatchWidgetAction(ctx, node, action, value.row)} />;
    }

    case "monthCalendar": {
      const actions = jsonObject(props, "actions");
      const previousMonthAction = isActionRef(actions?.previousMonth) ? actionViewModel(actions.previousMonth) : undefined;
      const nextMonthAction = isActionRef(actions?.nextMonth) ? actionViewModel(actions.nextMonth) : undefined;
      const selectDateAction = isActionRef(actions?.selectDate) ? actionViewModel(actions.selectDate) : actionList(props).find((actionRef) => actionRef.placement === "calendarCell") ? actionViewModel(actionList(props).find((actionRef) => actionRef.placement === "calendarCell")!) : actionList(props)[0] ? actionViewModel(actionList(props)[0]) : undefined;
      const markers = jsonArray<AdminJsonObject>(props, "markers").map((marker): MonthCalendarMarker => ({ date: String(marker.date || ""), kind: String(marker.kind || "marker"), tone: typeof marker.tone === "string" ? marker.tone as MonthCalendarMarker["tone"] : undefined }));
      const legend = jsonArray<AdminJsonObject>(props, "legend").map((item): MonthCalendarLegendItem => ({ kind: String(item.kind || item.label || "marker"), label: String(item.label || item.kind || "Marker"), tone: typeof item.tone === "string" ? item.tone as MonthCalendarLegendItem["tone"] : undefined }));
      return <MonthCalendar key={key} id={nodeDomId(node)} calendarId={str(props, "calendarId", node.meta?.id || "month-calendar")} month={str(props, "month", "2024-06")} label={str(props, "label") || undefined} selectedDate={str(props, "selectedDate") || undefined} markers={markers} legend={legend} previousMonthAction={previousMonthAction} nextMonthAction={nextMonthAction} selectDateAction={selectDateAction} style={style(props)} onMonthAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)} onSelectDate={(action, value) => dispatchWidgetAction(ctx, node, action, { date: value.date })} />;
    }

    case "toolbar":
      return <Toolbar key={key} id={nodeDomId(node)} actions={actionList(props).map(actionViewModel)} style={style(props)} onAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)} />;

    case "splitPane":
      return <SplitPane key={key} id={nodeDomId(node)} leftWidth={str(props, "leftWidth") || undefined} rightWidth={str(props, "rightWidth") || undefined} gap={Number(props.gap || 16)} style={style(props)}>{renderChildren(node.children, ctx)}</SplitPane>;

    case "tabs": {
      const tabs = jsonArray<AdminJsonObject>(props, "tabs").map((tab) => ({ id: String(tab.id), label: String(tab.label || tab.id) }));
      const tabAction = actionList(props)[0];
      return <Tabs key={key} id={nodeDomId(node)} tabs={tabs} value={str(props, "value")} action={tabAction ? actionViewModel(tabAction) : undefined} style={style(props)} onTabChange={(action, value) => dispatchWidgetAction(ctx, node, action, value.tab)} />;
    }

    case "searchBox": {
      const searchAction = actionList(props)[0];
      return <SearchBox key={key} id={nodeDomId(node)} value={str(props, "value")} placeholder={str(props, "placeholder", "Search")} label={str(props, "label", "Search")} action={searchAction ? actionViewModel(searchAction) : undefined} style={style(props)} onSearch={(action, value) => dispatchWidgetAction(ctx, node, action, value)} />;
    }

    case "previewFrame":
      return <PreviewFrame key={key} id={nodeDomId(node)} previewId={str(props, "previewId", node.meta?.id || "preview")} kicker={str(props, "kicker", "Preview")} title={str(props, "title", "Customer preview")} body={str(props, "body") || undefined} url={str(props, "url") || undefined} height={Number(props.height || 420)} placeholder={str(props, "placeholder", "Preview route not connected yet")} actions={actionList(props).map(actionViewModel)} style={style(props)} onAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)} />;

    case "panel": {
      const footerActions = actionArray(props, "footerActions");
      const toolbarActions = actionArray(props, "toolbarActions");
      const fallbackFooterActions = footerActions.length ? footerActions : actionList(props);
      return (
        <Panel
          key={key}
          id={nodeDomId(node)}
          title={str(props, "title") || undefined}
          subtitle={str(props, "subtitle") || undefined}
          eyebrow={str(props, "eyebrow") || undefined}
          body={str(props, "body") || undefined}
          density={str(props, "density", "normal") as "compact" | "normal" | "spacious"}
          padding={str(props, "padding", "normal") as "none" | "normal"}
          toolbarActions={toolbarActions.map(actionViewModel)}
          footerActions={fallbackFooterActions.map(actionViewModel)}
          style={style(props)}
          onToolbarAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)}
          onFooterAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)}
        >
          {renderChildren(node.children, ctx)}
        </Panel>
      );
    }

    case "metricCard":
      return <MetricCard key={key} id={nodeDomId(node)} label={str(props, "label")} value={String(props.value || "—")} caption={str(props, "caption") || undefined} tone={str(props, "tone", "neutral")} style={style(props)} />;

    case "filterBar": {
      const rawFilters = jsonArray<AdminJsonObject>(props, "filters");
      const filters = rawFilters.map((filter) => ({ id: String(filter.id), label: String(filter.label || filter.id) }));
      const filterAction = actionList(props)[0];
      return <FilterBar key={key} id={nodeDomId(node)} filters={filters} value={str(props, "value")} action={filterAction ? actionViewModel(filterAction) : undefined} style={style(props)} onFilterChange={(action, value) => dispatchWidgetAction(ctx, node, action, rawFilters.find((filter) => String(filter.id) === value.filter.id) || value.filter)} />;
    }

    case "resourceTable": {
      const columns = jsonArray<AdminJsonObject>(props, "columns");
      const rows = jsonArray<AdminJsonObject>(props, "rows");
      const tableActions = actionList(props);
      const rowActions = tableActions.filter((a) => a.placement === "row");
      const fallbackRowActions = rowActions.length ? rowActions : tableActions.length && !jsonObject(props, "pagination") ? [tableActions[0]] : [];
      const bulkActions = jsonArray<AdminActionRef>(props, "bulkActions").filter(isActionRef);
      const pagination = jsonObject(props, "pagination");
      const empty = renderInlineNode(jsonObject(props, "empty"), ctx) || renderAdminNode({ kind: "emptyState", props: { title: str(props, "emptyTitle", "No records"), body: str(props, "emptyBody") }, meta: node.meta }, ctx, key);
      return (
        <ResourceTable
          key={key}
          id={nodeDomId(node)}
          tableId={str(props, "tableId", node.meta?.id || "resource-table")}
          columns={normalizeResourceTableColumns(columns)}
          rows={rows}
          selectable={bool(props, "selectable") || bulkActions.length > 0}
          bulkLabel={str(props, "bulkLabel", "Bulk actions")}
          empty={empty}
          rowActions={fallbackRowActions.map(actionViewModel)}
          bulkActions={bulkActions.map(actionViewModel)}
          pagination={pagination}
          page={Number(pagination?.page || props.page || 1)}
          total={Number(pagination?.total || props.total || rows.length)}
          actions={tableActions.filter((a) => a.placement !== "row").map(actionViewModel)}
          style={style(props)}
          onRowAction={(action, value) => dispatchWidgetAction(ctx, node, action, value.row)}
          onBulkAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)}
          onPaginationAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)}
        />
      );
    }

    case "emptyState": {
      const action = jsonObject(props, "action");
      const actionView = isActionRef(action) ? actionViewModel(action) : undefined;
      return <EmptyState key={key} id={nodeDomId(node)} title={str(props, "title", "Nothing here yet")} body={str(props, "body") || undefined} action={actionView} style={style(props)} onAction={(clickedAction, value) => dispatchWidgetAction(ctx, node, clickedAction, value)} />;
    }

    case "kvList": {
      const items = jsonArray<AdminJsonObject>(props, "items").map((item) => ({ label: String(item.label || ""), value: String(item.value || "") }));
      return <KeyValueList key={key} id={nodeDomId(node)} items={items} labelWidth={typeof props.labelWidth === "number" || typeof props.labelWidth === "string" ? props.labelWidth : undefined} style={style(props)} />;
    }

    case "markdownBlock":
      return <MarkdownBlock key={key} id={nodeDomId(node)} markdown={str(props, "markdown")} tone={str(props, "tone", "neutral") as "neutral" | "muted"} style={style(props)} />;

    case "activityFeed": {
      const items = jsonArray<AdminJsonObject>(props, "items").map((item): ActivityFeedItem => ({
        time: String(item.time || ""),
        title: String(item.title || ""),
        body: item.body == null ? undefined : String(item.body),
        action: isActionRef(item.action) ? actionViewModel(item.action) : undefined,
      }));
      return <ActivityFeed key={key} id={nodeDomId(node)} items={items} style={style(props)} onItemAction={(action, value) => dispatchWidgetAction(ctx, node, action, value.item)} />;
    }

    case "imageGrid": {
      const items = jsonArray<AdminJsonObject>(props, "items").map((item): ImageGridItem => ({
        id: item.id == null ? undefined : String(item.id),
        title: String(item.title || "Asset"),
        subtitle: item.subtitle == null ? undefined : String(item.subtitle),
        status: item.status == null ? undefined : String(item.status),
        tone: item.tone == null ? undefined : String(item.tone),
        url: item.url == null ? undefined : String(item.url),
      }));
      const gridActions = actionList(props).map(actionViewModel);
      return <ImageGrid key={key} id={nodeDomId(node)} items={items} actions={gridActions} style={style(props)} onAction={(action, value) => dispatchWidgetAction(ctx, node, action, value.item)} />;
    }

    case "imageGallery": {
      const images = jsonArray<AdminJsonObject>(props, "images").map((image): GalleryImage => ({
        id: image.id == null ? undefined : String(image.id),
        slot: image.slot == null ? undefined : String(image.slot),
        title: image.title == null ? undefined : String(image.title),
        subtitle: image.subtitle == null ? undefined : String(image.subtitle),
        status: image.status == null ? undefined : String(image.status),
        tone: image.tone == null ? undefined : String(image.tone),
        url: image.url == null ? undefined : String(image.url),
        alt: image.alt == null ? undefined : String(image.alt),
      }));
      const imageAction = actionList(props)[0];
      return <ImageGallery key={key} id={nodeDomId(node)} galleryId={str(props, "galleryId", node.meta?.id || "image-gallery")} images={images} emptyText={str(props, "emptyText", "No photos uploaded yet.")} imageAction={imageAction ? actionViewModel(imageAction) : undefined} style={style(props)} onImageAction={(action, value) => dispatchWidgetAction(ctx, node, action, value.image)} />;
    }

    case "loadingState":
      return <LoadingState key={key} id={nodeDomId(node)} title={str(props, "title", "Loading")} body={str(props, "body") || undefined} style={style(props)} />;

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
      const normalizedErrors = errors ? Object.fromEntries(Object.entries(errors).map(([name, message]) => [name, String(message)])) : undefined;
      return <AdminForm key={key} id={nodeDomId(node)} formId={str(props, "formId", node.meta?.id || "admin-form")} title={str(props, "title") || undefined} dirty={bool(props, "dirty")} pending={bool(props, "pending")} state={str(props, "state", "idle") as "idle" | "dirty" | "pending" | "success" | "error"} errors={normalizedErrors} actions={actionList(props).map(actionViewModel)} style={style(props)} onFormAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)}>{renderChildren(node.children, ctx)}</AdminForm>;
    }

    case "fieldGroup":
      return <FieldGroup key={key} id={nodeDomId(node)} title={str(props, "title")} style={style(props)}>{renderChildren(node.children, ctx)}</FieldGroup>;

    case "textField":
      return <TextField key={key} id={nodeDomId(node)} name={str(props, "name", node.meta?.id || "text-field")} label={str(props, "label", str(props, "name", node.meta?.id || "Text field"))} value={props.value == null ? undefined : String(props.value)} placeholder={str(props, "placeholder") || undefined} helpText={str(props, "helpText") || undefined} error={str(props, "error") || undefined} disabled={bool(props, "disabled")} readOnly={bool(props, "readOnly")} required={bool(props, "required")} style={style(props)} />;

    case "textareaField":
      return <TextareaField key={key} id={nodeDomId(node)} name={str(props, "name", node.meta?.id || "textarea-field")} label={str(props, "label", str(props, "name", node.meta?.id || "Textarea field"))} value={props.value == null ? undefined : String(props.value)} placeholder={str(props, "placeholder") || undefined} rows={num(props, "rows", 4)} helpText={str(props, "helpText") || undefined} error={str(props, "error") || undefined} disabled={bool(props, "disabled")} readOnly={bool(props, "readOnly")} required={bool(props, "required")} style={style(props)} />;

    case "moneyField":
    case "durationField":
    case "dateField":
    case "timeField":
    case "selectField":
    case "switchField":
    case "imageField":
      return <FieldPreview key={key} node={node} />;

    case "saveBar": {
      const primary = jsonObject(props, "primary");
      const primaryAction = isActionRef(primary) ? actionViewModel(primary) : undefined;
      return <SaveBar key={key} id={nodeDomId(node)} status={str(props, "status", "Ready")} primaryAction={primaryAction} style={style(props)} onPrimaryAction={(action, value) => dispatchWidgetAction(ctx, node, action, value)} />;
    }

    case "calendarWeek": {
      const days = jsonArray<string>(props, "days");
      const hours = jsonArray<string>(props, "hours");
      const blocks = (node.children || []).map((child, index): CalendarEventBlockProps => {
        const childProps = child.props || {};
        const action = actionList(childProps)[0];
        return {
          id: child.meta?.id || str(childProps, "id", `block-${index}`),
          kind: child.kind === "timeOffBlock" ? "timeOff" : child.kind === "availabilityBlock" ? "availability" : "appointment",
          clientName: str(childProps, "clientName") || undefined,
          title: str(childProps, "title") || undefined,
          service: str(childProps, "service") || undefined,
          status: str(childProps, "status") || undefined,
          startsAt: str(childProps, "startsAt") || undefined,
          endsAt: str(childProps, "endsAt") || undefined,
          column: num(childProps, "column", 1),
          row: num(childProps, "row", 1),
          span: num(childProps, "span", 1),
          action: action ? actionViewModel(action) : undefined,
        };
      });
      return <CalendarWeek key={key} id={nodeDomId(node)} calendarId={str(props, "calendarId", node.meta?.id || "calendar-week")} days={days} hours={hours} blocks={blocks} style={style(props)} onBlockAction={(action, value) => dispatchWidgetAction(ctx, node, action, value.block)} />;
    }

    case "appointmentBlock":
    case "availabilityBlock":
    case "timeOffBlock": {
      const action = actionList(props)[0];
      const blockId = nodeDomId(node) || str(props, "id", String(key || node.kind));
      return <CalendarEventBlock key={key} id={blockId} kind={node.kind === "timeOffBlock" ? "timeOff" : node.kind === "availabilityBlock" ? "availability" : "appointment"} clientName={str(props, "clientName") || undefined} title={str(props, "title") || undefined} service={str(props, "service") || undefined} status={str(props, "status") || undefined} startsAt={str(props, "startsAt") || undefined} endsAt={str(props, "endsAt") || undefined} action={action ? actionViewModel(action) : undefined} style={style(props)} onAction={(clickedAction) => dispatchWidgetAction(ctx, node, clickedAction, { blockId })} />;
    }

    case "inlineError":
      return <InlineError key={key} id={nodeDomId(node)} title={str(props, "title", "Something went wrong")} body={str(props, "body") || undefined} style={style(props)} />;

    default:
      return <pre key={key} {...common} style={{ padding: 12, background: color.cream, overflow: "auto" }}>{JSON.stringify(node, null, 2)}</pre>;
  }
}

function renderInlineNode(node: AdminJsonObject | undefined, ctx?: AdminRenderContext) {
  if (!node || typeof node.kind !== "string") return null;
  return renderAdminNode({ kind: node.kind as AdminNode["kind"], props: jsonObject(node, "props") || {}, children: [], meta: jsonObject(node, "meta") as AdminNode["meta"] }, ctx, String(node.kind));
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
